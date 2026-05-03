import React, { useState } from 'react'

export default function DecisionBar({ result, onReset, walletAddress, onSign, signing }) {
  const [signed, setSigned] = useState(false)
  const [sigErr, setSigErr] = useState(null)
  const risk = result?.risk

  const isFailing = result?.simValue?.err

  const handleSign = async () => {
    if (!onSign) return
    setSigErr(null)
    try {
      await onSign(result.rawTx)
      setSigned(true)
    } catch (err) {
      setSigErr(err.message || 'Signing failed')
    }
  }

  return (
    <div className="rounded-2xl border border-solflare-border bg-solflare-card p-5 animate-slide-up">
      {/* Status */}
      {isFailing ? (
        <div className="flex items-center gap-3 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <span className="text-xl">💀</span>
          <div>
            <div className="text-sm font-bold text-solflare-red">Transaction Would Fail</div>
            <div className="text-xs text-solflare-muted">This transaction failed simulation — signing it would waste your network fee</div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 mb-4 p-3 bg-solflare-green/10 border border-solflare-green/20 rounded-xl">
          <span className="text-xl">✅</span>
          <div>
            <div className="text-sm font-bold text-solflare-green">Simulation Passed</div>
            <div className="text-xs text-solflare-muted">Transaction executed successfully in simulation</div>
          </div>
        </div>
      )}

      {/* Signing error */}
      {sigErr && (
        <div className="mb-4 text-xs text-solflare-red bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {sigErr}
        </div>
      )}

      {/* Signed success */}
      {signed && (
        <div className="mb-4 text-xs text-solflare-green bg-solflare-green/10 border border-solflare-green/20 rounded-lg px-3 py-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Transaction signed successfully by Solflare!
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-xl font-semibold text-sm text-solflare-muted hover:text-solflare-text
            bg-solflare-bg border border-solflare-border hover:border-solflare-muted transition-all"
        >
          ← Simulate Another
        </button>

        {!isFailing && walletAddress && !signed && (
          <button
            onClick={handleSign}
            disabled={signing}
            className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all 
              ${risk?.level === 'critical' || risk?.level === 'high'
                ? 'bg-red-600 hover:bg-red-700 border border-red-500'
                : 'bg-gradient-solflare hover:opacity-90 shadow-orange-glow'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {signing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Waiting for Solflare...
              </span>
            ) : risk?.level === 'critical' || risk?.level === 'high' ? (
              '⚠️ Sign Anyway (Risky)'
            ) : (
              '✍️ Sign with Solflare'
            )}
          </button>
        )}
      </div>

      <p className="text-center text-xs text-solflare-dim mt-3">
        Signing does not broadcast. You can verify in Solflare before sending.
      </p>
    </div>
  )
}
