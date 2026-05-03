import React, { useState, useEffect } from 'react'
import { callEdgeFunction } from '../config'

const RECOMMENDATION_CONFIG = {
  should_approve: { color: 'text-solflare-green', bg: 'bg-solflare-green/10 border-solflare-green/20', icon: '✅', label: 'Safe to Approve' },
  should_reject: { color: 'text-solflare-red', bg: 'bg-red-500/10 border-red-500/20', icon: '🚫', label: 'Reject Transaction' },
  review_carefully: { color: 'text-solflare-yellow', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: '⚠️', label: 'Review Carefully' },
}

export default function AIExplanation({ simResult, onRequestAI }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [requested, setRequested] = useState(false)

  const fetchAnalysis = async () => {
    setLoading(true)
    setError(null)
    setRequested(true)
    try {
      const result = await callEdgeFunction('analyze-transaction', {
        balanceChanges: simResult.balanceChanges,
        logs: simResult.logs,
        risk: simResult.risk,
        txInfo: simResult.txInfo,
        fee: simResult.fee,
        computeUnits: simResult.computeUnits,
      })
      setAnalysis(result)
    } catch (err) {
      setError(err.message || 'AI analysis failed')
    } finally {
      setLoading(false)
    }
  }

  if (!requested) {
    return (
      <div className="rounded-2xl border border-solflare-border bg-solflare-card p-5 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-solflare-purple/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-solflare-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-solflare-text">AI Transaction Analysis</div>
            <div className="text-xs text-solflare-muted">Powered by Gemini 2.5 Flash</div>
          </div>
        </div>
        <p className="text-sm text-solflare-muted mb-4 leading-relaxed">
          Get a plain-English explanation of what this transaction does, who benefits, and a recommendation on whether to approve or reject it.
        </p>
        <button
          onClick={fetchAnalysis}
          className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-solflare-purple hover:bg-solflare-purple-dim
            transition-colors shadow-purple-glow"
        >
          ✨ Analyze with AI
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-solflare-border bg-solflare-card p-5 animate-fade-in">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-solflare-purple/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-solflare-purple animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-solflare-text">Analyzing Transaction...</div>
            <div className="text-xs text-solflare-muted">Gemini is reading the simulation data</div>
          </div>
        </div>
        <div className="space-y-3">
          {[80, 60, 70, 40].map((w, i) => (
            <div key={i} className={`h-3 rounded-full shimmer`} style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-solflare-card p-5 animate-fade-in">
        <div className="flex items-center gap-2 text-solflare-red text-sm mb-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          AI Analysis Failed
        </div>
        <p className="text-xs text-solflare-muted mb-3">{error}</p>
        <button onClick={fetchAnalysis} className="text-xs text-solflare-purple hover:text-solflare-purple/80 transition-colors">
          Try again →
        </button>
      </div>
    )
  }

  if (!analysis) return null

  const recCfg = RECOMMENDATION_CONFIG[analysis.recommendation] || RECOMMENDATION_CONFIG.review_carefully

  return (
    <div className="rounded-2xl border border-solflare-purple/20 bg-solflare-card p-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-solflare-purple/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-solflare-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-bold text-solflare-text">AI Analysis</div>
          <div className="text-xs text-solflare-muted capitalize">Confidence: {analysis.confidence || 'medium'}</div>
        </div>
      </div>

      {/* Recommendation banner */}
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border mb-4 ${recCfg.bg}`}>
        <span className="text-xl">{recCfg.icon}</span>
        <div>
          <div className={`text-sm font-bold ${recCfg.color}`}>{recCfg.label}</div>
          <div className="text-xs text-solflare-muted leading-relaxed">{analysis.recommendation_reason}</div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-solflare-muted uppercase tracking-wider mb-2">Summary</div>
        <p className="text-sm text-solflare-text leading-relaxed">{analysis.summary}</p>
      </div>

      {/* What happens */}
      {analysis.what_happens && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-solflare-muted uppercase tracking-wider mb-2">What Happens</div>
          <ul className="space-y-1.5">
            {(Array.isArray(analysis.what_happens)
              ? analysis.what_happens
              : analysis.what_happens.split('\n').filter(Boolean)
            ).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-solflare-text">
                <span className="text-solflare-orange shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{item.replace(/^[-•*]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Who benefits */}
      {analysis.who_benefits && (
        <div className="bg-solflare-bg rounded-xl px-3 py-2.5 border border-solflare-border">
          <div className="text-xs font-semibold text-solflare-muted uppercase tracking-wider mb-1">Who Benefits</div>
          <p className="text-xs text-solflare-text leading-relaxed">{analysis.who_benefits}</p>
        </div>
      )}
    </div>
  )
}
