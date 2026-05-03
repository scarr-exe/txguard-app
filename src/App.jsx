import React, { useState, useCallback } from 'react'
import { useSolflare } from './hooks/useSolflare'
import { useSimulator } from './hooks/useSimulator'
import WalletConnect from './components/WalletConnect'
import TransactionInput from './components/TransactionInput'
import RiskMeter from './components/RiskMeter'
import BalanceChanges from './components/BalanceChanges'
import AIExplanation from './components/AIExplanation'
import TransactionDetails from './components/TransactionDetails'
import DecisionBar from './components/DecisionBar'

export default function App() {
  const { wallet, publicKey, connecting, error: walletError, connect, disconnect, signTransaction } = useSolflare()
  const { status, result, error: simError, simulate, reset } = useSimulator()
  const [signing, setSigning] = useState(false)

  const handleSimulate = useCallback(async (params) => {
    try {
      await simulate(params)
    } catch {
      // error shown in UI via simError
    }
  }, [simulate])

  const handleSign = useCallback(async (rawTx) => {
    if (!wallet || !signTransaction) return
    setSigning(true)
    try {
      // Decode the base64 rawTx and build a VersionedTransaction or Transaction
      const { Transaction, VersionedTransaction } = await import('@solana/web3.js')
      const txBytes = Uint8Array.from(atob(rawTx), c => c.charCodeAt(0))
      let tx
      try {
        tx = VersionedTransaction.deserialize(txBytes)
      } catch {
        tx = Transaction.from(txBytes)
      }
      await signTransaction(tx)
    } finally {
      setSigning(false)
    }
  }, [wallet, signTransaction])

  const isSimulating = status === 'simulating'
  const isDone = status === 'done' && result

  return (
    <div className="min-h-screen bg-solflare-bg text-solflare-text">
      {/* Header */}
      <header className="border-b border-solflare-border bg-solflare-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-solflare flex items-center justify-center shadow-orange-glow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-solflare-text text-sm leading-tight">Solflare Risk Simulator</div>
              <div className="text-xs text-solflare-muted leading-tight">Preview transactions before signing</div>
            </div>
          </div>
          <WalletConnect
            publicKey={publicKey}
            connecting={connecting}
            onConnect={connect}
            onDisconnect={disconnect}
            error={walletError}
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero — only on idle state */}
        {status === 'idle' && !result && (
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-solflare-surface border border-solflare-border rounded-full px-3 py-1.5 text-xs text-solflare-muted mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-solflare-orange" />
              Solana Mainnet — Read-Only Simulation
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              <span className="gradient-text">Preview. Analyze. Decide.</span>
            </h1>
            <p className="text-solflare-muted text-base max-w-xl mx-auto leading-relaxed">
              Simulate any Solana transaction before signing. See exactly what changes, assess the risk score, and get an AI explanation — all without touching your private key.
            </p>
          </div>
        )}

        {/* How it works — idle only */}
        {status === 'idle' && !result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 animate-fade-in">
            {[
              { icon: '🔗', title: 'Connect Solflare', desc: 'Link your Solflare wallet to identify your accounts in the simulation.' },
              { icon: '📋', title: 'Paste Transaction', desc: 'Paste a raw base64 transaction from any dApp, Telegram bot, or link.' },
              { icon: '🔍', title: 'Inspect & Decide', desc: 'See balance changes, risk score, AI analysis, then approve or reject.' },
            ].map((step, i) => (
              <div key={i} className="bg-solflare-card border border-solflare-border rounded-2xl p-4 card-glow">
                <div className="text-2xl mb-2">{step.icon}</div>
                <div className="text-sm font-bold text-solflare-text mb-1">{step.title}</div>
                <div className="text-xs text-solflare-muted leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        )}

        <div className={isDone ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'max-w-2xl mx-auto'}>
          {/* Left column */}
          <div className="space-y-5">
            {/* Input card */}
            {!isDone && (
              <div className="bg-solflare-card border border-solflare-border rounded-2xl p-6 card-glow animate-fade-in">
                <h2 className="text-base font-bold text-solflare-text mb-5">Simulate Transaction</h2>
                <TransactionInput
                  onSimulate={handleSimulate}
                  disabled={isSimulating}
                  walletAddress={publicKey}
                />
              </div>
            )}

            {/* Simulation error */}
            {status === 'error' && simError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-solflare-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-solflare-red mb-1">Simulation Failed</div>
                    <div className="text-sm text-solflare-muted leading-relaxed">{simError}</div>
                    <button
                      onClick={reset}
                      className="mt-3 text-xs text-solflare-orange hover:text-solflare-orange/80 transition-colors"
                    >
                      ← Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isSimulating && (
              <div className="bg-solflare-card border border-solflare-border rounded-2xl p-6 animate-fade-in">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-solflare-orange/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-solflare-orange animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-solflare-text">Running Simulation...</div>
                    <div className="text-xs text-solflare-muted">Submitting to Solana RPC (sigVerify disabled)</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[100, 75, 85, 60].map((w, i) => (
                    <div key={i} className="h-3 rounded-full shimmer" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Results — left column */}
            {isDone && (
              <>
                <RiskMeter risk={result.risk} />
                <BalanceChanges
                  balanceChanges={result.balanceChanges}
                  walletAddress={publicKey}
                  fee={result.fee}
                />
              </>
            )}
          </div>

          {/* Right column — results */}
          {isDone && (
            <div className="space-y-5">
              <AIExplanation simResult={result} />
              <TransactionDetails
                txInfo={result.txInfo}
                fee={result.fee}
                computeUnits={result.computeUnits}
                logs={result.logs}
                rawTx={result.rawTx}
                simulatedAt={result.simulatedAt}
              />
              <DecisionBar
                result={result}
                onReset={reset}
                walletAddress={publicKey}
                onSign={handleSign}
                signing={signing}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-solflare-dim pb-8">
          <p>Simulation only — no transactions are broadcast to the network. Always verify in Solflare before signing.</p>
          <p className="mt-1">Powered by Solana RPC simulateTransaction · Gemini 2.5 Flash · Solflare SDK</p>
        </footer>
      </main>
    </div>
  )
}
