const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { balanceChanges, logs, risk, txInfo, fee, computeUnits } = await req.json()

    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GOOGLE_AI_API_KEY not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `You are a Solana blockchain security expert. Analyze this transaction simulation and provide a clear, plain English explanation for a non-technical user.

TRANSACTION DATA:
- Transaction version: ${txInfo?.version || 'legacy'}
- Transaction size: ${txInfo?.size || 'unknown'} bytes
- Network fee: ${fee} SOL
- Compute units used: ${computeUnits}
- Risk level: ${risk?.level || 'unknown'} (score: ${risk?.score || 0}/100)

BALANCE CHANGES:
${balanceChanges.length > 0
  ? balanceChanges.map(c => `  - ${c.change > 0 ? '+' : ''}${c.change.toFixed(6)} ${c.symbol} (${c.change > 0 ? 'received' : 'sent'})`).join('\n')
  : '  - No balance changes detected'}

RISK WARNINGS:
${risk?.warnings?.length > 0
  ? risk.warnings.map(w => `  - [${w.level.toUpperCase()}] ${w.text}`).join('\n')
  : '  - No warnings'}

PROGRAM LOGS (first 15):
${(logs || []).slice(0, 15).map(l => `  ${l}`).join('\n') || '  No logs available'}

Provide a JSON response with exactly these fields:
{
  "summary": "1-2 sentence plain English summary of what this transaction does",
  "what_happens": "Bulleted list of 2-4 key actions this transaction performs",
  "who_benefits": "Who gains from this transaction and how",
  "recommendation": "should_approve | should_reject | review_carefully",
  "recommendation_reason": "1 sentence explaining your recommendation",
  "confidence": "high | medium | low"
}

Be specific, concise, and help the user make an informed decision. If the transaction fails in simulation, clearly state that.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            maxOutputTokens: 1024,
          }
        })
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API error:', errText)
      return new Response(
        JSON.stringify({
          summary: 'AI analysis unavailable at this time.',
          what_happens: ['Transaction simulation completed — review balance changes manually'],
          who_benefits: 'See balance changes above',
          recommendation: risk?.score > 50 ? 'should_reject' : 'review_carefully',
          recommendation_reason: 'AI analysis failed — use risk score and warnings to decide',
          confidence: 'low',
          error: `Gemini API error: ${response.status}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiData = await response.json()
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

    let parsed
    try {
      parsed = JSON.parse(rawText)
    } catch {
      parsed = {
        summary: rawText.slice(0, 200),
        what_happens: ['See transaction logs for details'],
        who_benefits: 'See balance changes',
        recommendation: 'review_carefully',
        recommendation_reason: 'Review all details before signing',
        confidence: 'low'
      }
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('analyze-transaction error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
