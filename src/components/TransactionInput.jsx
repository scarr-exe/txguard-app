import React, { useState } from 'react'

const EXAMPLE_TX = 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAHCxbfRFDgRANmqAQbRUXDo8oSKqKWjRBLpCuHmf2LR+LNh2WgF7LPjPFYBrPDRi35Y5ZX4gj5S/bAHcw8wQGp...'

export default function TransactionInput({ onSimulate, disabled, walletAddress }) {
  const [inputType, setInputType] = useState('raw_transaction')
  const [rawInput, setRawInput] = useState('')
  const [validationErr, setValidationErr] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setValidationErr('')

    const val = rawInput.trim()
    if (!val) {
      setValidationErr('Please enter a transaction or dApp URL')
      return
    }

    if (inputType === 'dapp_url') {
      try { new URL(val) } catch {
        setValidationErr('Please enter a valid URL')
        return
      }
    } else {
      // Basic length check
      if (val.length < 40) {
        setValidationErr('Transaction payload appears too short')
        return
      }
    }

    if (!walletAddress) {
      setValidationErr('Connect your Solflare wallet first')
      return
    }

    onSimulate({ inputType, rawInput: val, walletAddress })
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setRawInput(text.trim())
      setValidationErr('')
    } catch {
      setValidationErr('Clipboard access denied — please paste manually')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Input type selector */}
      <div className="flex gap-2 p-1 bg-solflare-bg rounded-xl border border-solflare-border">
        {[
          { id: 'raw_transaction', label: 'Raw Transaction', icon: '⬡' },
          { id: 'dapp_url', label: 'dApp URL', icon: '🔗' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setInputType(tab.id); setRawInput(''); setValidationErr('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              inputType === tab.id
                ? 'bg-solflare-surface border border-solflare-border text-solflare-text shadow-card'
                : 'text-solflare-muted hover:text-solflare-text'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative">
        <label className="block text-xs font-medium text-solflare-muted mb-2 uppercase tracking-wider">
          {inputType === 'raw_transaction'
            ? 'Paste serialized transaction (base64 or base58)'
            : 'Enter dApp URL or Solana Pay link'}
        </label>
        <div className="relative">
          <textarea
            value={rawInput}
            onChange={e => { setRawInput(e.target.value); setValidationErr('') }}
            placeholder={
              inputType === 'raw_transaction'
                ? 'AQAAAAAAAAAAAAA...'
                : 'https://dapp.example.com/tx or solana:...'
            }
            rows={inputType === 'raw_transaction' ? 5 : 2}
            className="w-full bg-solflare-bg border border-solflare-border rounded-xl px-4 py-3 
              text-sm font-mono text-solflare-text placeholder-solflare-dim 
              focus:border-solflare-orange transition-colors resize-none leading-relaxed"
          />
          {/* Paste button */}
          <button
            type="button"
            onClick={handlePaste}
            className="absolute top-3 right-3 text-xs text-solflare-muted hover:text-solflare-orange 
              bg-solflare-surface border border-solflare-border rounded-lg px-2 py-1 transition-colors"
          >
            Paste
          </button>
        </div>
      </div>

      {/* Validation error */}
      {validationErr && (
        <div className="flex items-center gap-2 text-sm text-solflare-red bg-solflare-red-dim/30 border border-solflare-red/20 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {validationErr}
        </div>
      )}

      {/* dApp URL info */}
      {inputType === 'dapp_url' && (
        <div className="flex items-start gap-2 text-xs text-solflare-muted bg-solflare-surface border border-solflare-border rounded-lg px-3 py-2">
          <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-solflare-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          For dApp URLs, the simulator will attempt to parse transaction data from Solana Pay and Blinks links. For other URLs, paste the raw transaction payload directly.
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={disabled || !rawInput.trim()}
        className="w-full py-3 rounded-xl font-bold text-white transition-all duration-200
          bg-gradient-solflare hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
          shadow-orange-glow hover:shadow-lg text-sm uppercase tracking-wider"
      >
        {disabled ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Simulating Transaction...
          </span>
        ) : (
          '⚡ Simulate Transaction'
        )}
      </button>

      {!walletAddress && (
        <p className="text-center text-xs text-solflare-muted">
          Connect your Solflare wallet above to enable simulation
        </p>
      )}
    </form>
  )
}
