import React, { useState } from 'react'

export default function BalanceChanges({ balanceChanges, walletAddress, fee }) {
  const [showAll, setShowAll] = useState(false)

  const walletChanges = walletAddress
    ? balanceChanges.filter(c => c.account === walletAddress)
    : balanceChanges

  const otherChanges = walletAddress
    ? balanceChanges.filter(c => c.account !== walletAddress)
    : []

  const displayChanges = showAll ? balanceChanges : (walletChanges.length > 0 ? walletChanges : balanceChanges.slice(0, 5))

  if (balanceChanges.length === 0) {
    return (
      <div className="rounded-2xl border border-solflare-border bg-solflare-card p-5 animate-slide-up">
        <SectionHeader title="Balance Changes" count={0} />
        <div className="text-center py-6 text-solflare-muted text-sm">
          <div className="text-2xl mb-2">〰️</div>
          No balance changes detected
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-solflare-border bg-solflare-card p-5 animate-slide-up">
      <SectionHeader title="Balance Changes" count={balanceChanges.length} />

      {/* Your wallet section */}
      {walletAddress && walletChanges.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-solflare-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-solflare-orange" />
            Your Wallet
          </div>
          <div className="space-y-2">
            {walletChanges.map((c, i) => (
              <ChangeRow key={i} change={c} highlighted />
            ))}
          </div>
        </div>
      )}

      {/* Other accounts */}
      {(walletAddress && otherChanges.length > 0) || (!walletAddress && displayChanges.length > 0) ? (
        <div>
          {walletAddress && otherChanges.length > 0 && (
            <div className="text-xs font-semibold text-solflare-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-solflare-dim" />
              Other Accounts
            </div>
          )}
          <div className="space-y-2">
            {(walletAddress ? (showAll ? otherChanges : otherChanges.slice(0, 3)) : displayChanges).map((c, i) => (
              <ChangeRow key={i} change={c} />
            ))}
          </div>
          {!showAll && (walletAddress ? otherChanges.length > 3 : balanceChanges.length > 5) && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-2 text-xs text-solflare-orange hover:text-solflare-orange/80 transition-colors"
            >
              Show {(walletAddress ? otherChanges.length - 3 : balanceChanges.length - 5)} more accounts →
            </button>
          )}
        </div>
      ) : null}

      {/* Fee */}
      {fee > 0 && (
        <div className="mt-4 pt-4 border-t border-solflare-border flex items-center justify-between text-xs">
          <span className="text-solflare-muted">Network Fee</span>
          <span className="text-solflare-red font-mono">-{fee.toFixed(6)} SOL</span>
        </div>
      )}
    </div>
  )
}

function ChangeRow({ change, highlighted }) {
  const isPositive = change.change > 0
  const absChange = Math.abs(change.change)
  const formatted = absChange < 0.0001
    ? absChange.toExponential(2)
    : absChange < 1
    ? absChange.toFixed(6)
    : absChange.toFixed(4)

  return (
    <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 
      ${highlighted
        ? 'bg-solflare-surface border border-solflare-border'
        : 'bg-solflare-bg border border-solflare-border/50'
      }`}>
      <div className="flex items-center gap-3 min-w-0">
        <TokenIcon symbol={change.symbol} />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-solflare-text">{change.symbol}</div>
          <div className="text-xs text-solflare-muted truncate max-w-32">
            {change.name}
          </div>
        </div>
      </div>
      <div className="text-right ml-4">
        <div className={`text-sm font-bold font-mono ${isPositive ? 'text-solflare-green' : 'text-solflare-red'}`}>
          {isPositive ? '+' : '-'}{formatted}
        </div>
        <div className="text-xs text-solflare-dim font-mono">
          {isPositive ? 'Received' : 'Sent'}
        </div>
      </div>
    </div>
  )
}

function TokenIcon({ symbol }) {
  const colors = {
    SOL: 'bg-purple-600/30 text-purple-400',
    USDC: 'bg-blue-600/30 text-blue-400',
    USDT: 'bg-green-600/30 text-green-400',
    BONK: 'bg-yellow-600/30 text-yellow-400',
    JUP: 'bg-green-800/30 text-green-300',
    ETH: 'bg-indigo-600/30 text-indigo-400',
    mSOL: 'bg-teal-600/30 text-teal-400',
  }
  const cls = colors[symbol] || 'bg-solflare-surface text-solflare-muted'
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${cls}`}>
      {symbol.slice(0, 2)}
    </div>
  )
}

function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold text-solflare-text uppercase tracking-wider">{title}</h3>
      <span className="text-xs bg-solflare-surface border border-solflare-border text-solflare-muted px-2 py-0.5 rounded-full">
        {count} change{count !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
