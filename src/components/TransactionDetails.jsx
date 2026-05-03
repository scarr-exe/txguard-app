import React, { useState } from 'react'

export default function TransactionDetails({ txInfo, fee, computeUnits, logs, rawTx, simulatedAt }) {
  const [showLogs, setShowLogs] = useState(false)
  const [showRaw, setShowRaw] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(rawTx || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="rounded-2xl border border-solflare-border bg-solflare-card p-5 animate-slide-up">
      <h3 className="text-sm font-bold text-solflare-text uppercase tracking-wider mb-4">Transaction Details</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat label="Version" value={txInfo?.version === 'legacy' ? 'Legacy' : `v${txInfo?.version}`} />
        <Stat label="Size" value={`${txInfo?.size || 0} bytes`} />
        <Stat label="Network Fee" value={`${(fee || 0).toFixed(6)} SOL`} accent="red" />
        <Stat label="Compute Units" value={(computeUnits || 0).toLocaleString()} />
        <Stat label="Log Lines" value={logs?.length || 0} />
        <Stat label="Simulated At" value={simulatedAt ? new Date(simulatedAt).toLocaleTimeString() : 'N/A'} />
      </div>

      {/* Logs toggle */}
      <div className="space-y-2">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="w-full flex items-center justify-between text-xs font-semibold text-solflare-muted 
            hover:text-solflare-text bg-solflare-bg border border-solflare-border rounded-xl px-3 py-2.5 
            transition-colors"
        >
          <span>Program Logs ({logs?.length || 0})</span>
          <svg className={`w-4 h-4 transition-transform ${showLogs ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showLogs && (
          <div className="bg-solflare-bg border border-solflare-border rounded-xl p-3 max-h-56 overflow-y-auto">
            {logs?.length > 0 ? (
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="text-xs font-mono text-solflare-muted leading-relaxed">
                    <span className="text-solflare-dim mr-2">{String(i + 1).padStart(2, '0')}</span>
                    <span className={getLogColor(log)}>{log}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-solflare-muted text-center py-3">No program logs available</div>
            )}
          </div>
        )}

        {/* Raw TX toggle */}
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="w-full flex items-center justify-between text-xs font-semibold text-solflare-muted 
            hover:text-solflare-text bg-solflare-bg border border-solflare-border rounded-xl px-3 py-2.5 
            transition-colors"
        >
          <span>Raw Transaction Bytes</span>
          <svg className={`w-4 h-4 transition-transform ${showRaw ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showRaw && rawTx && (
          <div className="relative bg-solflare-bg border border-solflare-border rounded-xl p-3">
            <button
              onClick={handleCopyRaw}
              className="absolute top-2 right-2 text-xs text-solflare-muted hover:text-solflare-orange 
                bg-solflare-surface border border-solflare-border rounded px-2 py-1 transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <div className="text-xs font-mono text-solflare-muted break-all leading-relaxed max-h-24 overflow-y-auto pr-12">
              {rawTx}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div className="bg-solflare-bg border border-solflare-border rounded-xl px-3 py-2.5">
      <div className="text-xs text-solflare-muted mb-1">{label}</div>
      <div className={`text-sm font-semibold font-mono ${accent === 'red' ? 'text-solflare-red' : 'text-solflare-text'}`}>
        {value}
      </div>
    </div>
  )
}

function getLogColor(log) {
  if (log.toLowerCase().includes('error') || log.toLowerCase().includes('failed')) return 'text-solflare-red'
  if (log.toLowerCase().includes('success') || log.toLowerCase().includes('success')) return 'text-solflare-green'
  if (log.toLowerCase().includes('warning')) return 'text-solflare-yellow'
  if (log.startsWith('Program ')) return 'text-solflare-blue'
  return 'text-solflare-muted'
}
