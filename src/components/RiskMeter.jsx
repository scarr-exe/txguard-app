import React from 'react'

const RISK_CONFIG = {
  low: { color: 'text-solflare-green', bg: 'bg-solflare-green', bar: 'bg-solflare-green', border: 'border-solflare-green/30', label: 'LOW RISK', emoji: '✅' },
  medium: { color: 'text-solflare-yellow', bg: 'bg-solflare-yellow', bar: 'bg-solflare-yellow', border: 'border-solflare-yellow/30', label: 'MEDIUM RISK', emoji: '⚠️' },
  high: { color: 'text-solflare-red', bg: 'bg-solflare-red', bar: 'bg-orange-500', border: 'border-orange-500/30', label: 'HIGH RISK', emoji: '🚨' },
  critical: { color: 'text-red-400', bg: 'bg-red-500', bar: 'bg-red-500', border: 'border-red-500/30', label: 'CRITICAL', emoji: '💀' },
}

const WARNING_COLORS = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  info: 'text-solflare-muted bg-solflare-surface border-solflare-border',
}

export default function RiskMeter({ risk }) {
  const cfg = RISK_CONFIG[risk?.level] || RISK_CONFIG.low
  const score = risk?.score || 0

  return (
    <div className={`rounded-2xl border ${cfg.border} bg-solflare-card p-5 animate-slide-up`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${cfg.bg}/20 flex items-center justify-center text-xl`}>
            {cfg.emoji}
          </div>
          <div>
            <div className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</div>
            <div className="text-xs text-solflare-muted">Risk Assessment</div>
          </div>
        </div>
        <div className={`text-3xl font-black ${cfg.color}`}>
          {score}<span className="text-base font-medium text-solflare-muted">/100</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-solflare-bg rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Risk bands */}
      <div className="flex justify-between text-xs text-solflare-dim mb-4">
        <span>0 Safe</span>
        <span>25 Medium</span>
        <span>50 High</span>
        <span>75 Critical</span>
        <span>100</span>
      </div>

      {/* Warnings */}
      {risk?.warnings?.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-solflare-muted uppercase tracking-wider mb-2">
            Findings ({risk.warnings.length})
          </div>
          {risk.warnings.map((w, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 border ${WARNING_COLORS[w.level] || WARNING_COLORS.info}`}
            >
              <WarningIcon level={w.level} />
              <span className="leading-relaxed">{w.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WarningIcon({ level }) {
  if (level === 'critical' || level === 'high') {
    return (
      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  }
  if (level === 'info') {
    return (
      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
  return (
    <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
