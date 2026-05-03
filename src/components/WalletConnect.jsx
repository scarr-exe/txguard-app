import React from 'react'

export default function WalletConnect({ publicKey, connecting, onConnect, onDisconnect, error }) {
  const short = publicKey
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : null

  return (
    <div className="flex items-center gap-3">
      {error && (
        <span className="text-xs text-solflare-red bg-solflare-red-dim px-2 py-1 rounded-md max-w-xs truncate">
          {error}
        </span>
      )}

      {publicKey ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-solflare-surface border border-solflare-border rounded-xl px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-solflare-green animate-pulse" />
            <span className="text-sm font-mono text-solflare-text">{short}</span>
          </div>
          <button
            onClick={onDisconnect}
            className="text-xs text-solflare-muted hover:text-solflare-red transition-colors px-3 py-2 bg-solflare-surface border border-solflare-border rounded-xl hover:border-solflare-red"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={connecting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200
            bg-gradient-solflare text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
            shadow-orange-glow hover:shadow-lg"
        >
          {connecting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <SolflareIcon />
              Connect Solflare
            </>
          )}
        </button>
      )}
    </div>
  )
}

function SolflareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
