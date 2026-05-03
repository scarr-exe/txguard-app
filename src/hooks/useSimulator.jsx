import { useState, useCallback } from 'react'
import { solanaRpc, KNOWN_TOKENS, SUPABASE_URL, SUPABASE_ANON_KEY } from '../config'

async function fetchTokenMeta(mintAddress) {
  if (KNOWN_TOKENS[mintAddress]) return KNOWN_TOKENS[mintAddress]
  try {
    const info = await solanaRpc('getAccountInfo', [mintAddress, { encoding: 'jsonParsed' }])
    if (info?.value?.data?.parsed?.info) {
      const d = info.value.data.parsed.info
      return { symbol: mintAddress.slice(0, 4) + '...', name: 'Unknown Token', decimals: d.decimals || 0 }
    }
  } catch { /* ignore */ }
  return { symbol: mintAddress.slice(0, 6) + '...', name: 'Unknown Token', decimals: 0 }
}

function lamportsToSol(lamports) {
  return lamports / 1e9
}

function parseBalanceChanges(preBalances, postBalances, preTokenBalances, postTokenBalances, accountKeys) {
  const changes = []

  // SOL balance changes
  accountKeys.forEach((key, i) => {
    const pre = preBalances[i] || 0
    const post = postBalances[i] || 0
    const diff = post - pre
    if (Math.abs(diff) > 5000) { // ignore dust < 5000 lamports
      changes.push({
        type: 'sol',
        account: typeof key === 'string' ? key : key.pubkey,
        symbol: 'SOL',
        name: 'Solana',
        mint: 'So11111111111111111111111111111111111111112',
        change: lamportsToSol(diff),
        pre: lamportsToSol(pre),
        post: lamportsToSol(post),
        decimals: 9,
      })
    }
  })

  // Token balance changes
  const preMap = {}
  const postMap = {}

  ;(preTokenBalances || []).forEach(b => {
    const key = `${b.accountIndex}-${b.mint}`
    preMap[key] = b
  })
  ;(postTokenBalances || []).forEach(b => {
    const key = `${b.accountIndex}-${b.mint}`
    postMap[key] = b
  })

  const allKeys = new Set([...Object.keys(preMap), ...Object.keys(postMap)])
  allKeys.forEach(key => {
    const pre = preMap[key]
    const post = postMap[key]
    const mint = (pre || post).mint
    const accountIndex = (pre || post).accountIndex
    const account = accountKeys[accountIndex]
    const preAmt = parseFloat(pre?.uiTokenAmount?.uiAmount || 0)
    const postAmt = parseFloat(post?.uiTokenAmount?.uiAmount || 0)
    const diff = postAmt - preAmt
    const decimals = (pre || post)?.uiTokenAmount?.decimals || 0
    if (Math.abs(diff) > 0) {
      const known = KNOWN_TOKENS[mint]
      changes.push({
        type: 'token',
        account: typeof account === 'string' ? account : account?.pubkey,
        symbol: known?.symbol || mint.slice(0, 6) + '...',
        name: known?.name || 'Unknown Token',
        mint,
        change: diff,
        pre: preAmt,
        post: postAmt,
        decimals,
      })
    }
  })

  return changes
}

function computeRisk(simResult, balanceChanges, logs) {
  let score = 0
  const warnings = []

  if (simResult?.err) {
    score += 40
    warnings.push({ level: 'critical', text: `Transaction would FAIL: ${JSON.stringify(simResult.err)}` })
  }

  // Check for large SOL outflows
  const solChange = balanceChanges.filter(c => c.symbol === 'SOL')
  solChange.forEach(c => {
    if (c.change < -5) { score += 30; warnings.push({ level: 'high', text: `Large SOL outflow: ${Math.abs(c.change).toFixed(4)} SOL` }) }
    else if (c.change < -1) { score += 15; warnings.push({ level: 'medium', text: `SOL outflow: ${Math.abs(c.change).toFixed(4)} SOL` }) }
  })

  // Suspicious log patterns
  const logStr = (logs || []).join(' ').toLowerCase()
  if (logStr.includes('set_authority') || logStr.includes('setauthority')) {
    score += 30
    warnings.push({ level: 'high', text: 'Transaction modifies account authority — could transfer ownership' })
  }
  if (logStr.includes('close_account') || logStr.includes('closeaccount')) {
    score += 20
    warnings.push({ level: 'high', text: 'Transaction closes an account — rent lamports will be reclaimed' })
  }
  if (logStr.includes('upgrade')) {
    score += 20
    warnings.push({ level: 'medium', text: 'Transaction may upgrade a program — verify the program is trusted' })
  }
  if (logStr.includes('approve')) {
    score += 15
    warnings.push({ level: 'medium', text: 'Token delegation (approve) detected — check delegate address' })
  }

  // Many token changes
  const tokenChanges = balanceChanges.filter(c => c.type === 'token')
  if (tokenChanges.length > 5) {
    score += 10
    warnings.push({ level: 'low', text: `Unusual: ${tokenChanges.length} token accounts affected` })
  }

  // High compute
  if (simResult?.unitsConsumed > 800000) {
    score += 10
    warnings.push({ level: 'low', text: `High compute usage: ${simResult.unitsConsumed.toLocaleString()} units` })
  }

  score = Math.min(100, score)

  let level = 'low'
  if (score >= 75) level = 'critical'
  else if (score >= 50) level = 'high'
  else if (score >= 25) level = 'medium'

  if (score === 0 && !simResult?.err) {
    warnings.push({ level: 'info', text: 'No suspicious patterns detected' })
  }

  return { score, level, warnings }
}

export function useSimulator() {
  const [status, setStatus] = useState('idle') // idle | simulating | done | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const simulate = useCallback(async ({ inputType, rawInput, walletAddress }) => {
    setStatus('simulating')
    setError(null)
    setResult(null)

    try {
      let txBase64 = rawInput.trim()

      // If dapp URL, try to fetch transaction from it
      if (inputType === 'dapp_url') {
        const urlProbe = await probeUrlForTransaction(rawInput, walletAddress)
        if (!urlProbe) throw new Error('Could not extract a transaction from the provided URL. Please paste the raw transaction bytes instead.')
        txBase64 = urlProbe
      }

      // Normalize: support base58 or base64
      let txBytes
      try {
        txBytes = decodeTransaction(txBase64)
      } catch (e) {
        throw new Error('Invalid transaction format. Please paste a valid base64 or base58 encoded transaction.')
      }

      // Simulate via RPC
      const simResult = await solanaRpc('simulateTransaction', [
        toBase64(txBytes),
        {
          encoding: 'base64',
          commitment: 'confirmed',
          accounts: { encoding: 'jsonParsed', addresses: walletAddress ? [walletAddress] : [] },
          replaceRecentBlockhash: true,
          sigVerify: false,
        }
      ])

      const value = simResult?.value || simResult

      // Parse balance changes
      const balanceChanges = parseBalanceChanges(
        value?.preBalances || [],
        value?.postBalances || [],
        value?.preTokenBalances || [],
        value?.postTokenBalances || [],
        value?.accounts || [],
      )

      // Compute risk
      const risk = computeRisk(value, balanceChanges, value?.logs || [])

      // Parse basic tx info
      const txInfo = parseTransactionInfo(txBytes, value)

      const fullResult = {
        simValue: value,
        balanceChanges,
        risk,
        txInfo,
        logs: value?.logs || [],
        fee: (value?.fee || 5000) / 1e9,
        computeUnits: value?.unitsConsumed || 0,
        simulatedAt: new Date().toISOString(),
        rawTx: toBase64(txBytes),
      }

      setResult(fullResult)
      setStatus('done')
      return fullResult
    } catch (err) {
      setError(err.message || 'Simulation failed')
      setStatus('error')
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return { status, result, error, simulate, reset }
}

function decodeTransaction(input) {
  const cleaned = input.trim()

  // Try base64 first
  try {
    const decoded = atob(cleaned)
    const bytes = new Uint8Array(decoded.length)
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i)
    }
    if (bytes.length > 10) return bytes
  } catch { /* continue */ }

  // Try base58 (manual decode)
  try {
    return decodeBase58(cleaned)
  } catch { /* continue */ }

  // Try hex
  if (/^[0-9a-fA-F]+$/.test(cleaned) && cleaned.length % 2 === 0) {
    const bytes = new Uint8Array(cleaned.length / 2)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16)
    }
    return bytes
  }

  throw new Error('Cannot decode transaction bytes')
}

function decodeBase58(str) {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  const BASE = 58n
  let result = 0n
  for (const char of str) {
    const idx = ALPHABET.indexOf(char)
    if (idx < 0) throw new Error('Invalid base58 char')
    result = result * BASE + BigInt(idx)
  }
  const hex = result.toString(16).padStart(2, '0')
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function parseTransactionInfo(txBytes, simValue) {
  try {
    // Try to read basic info from the transaction header
    // Versioned tx starts with 0x80 (version prefix), legacy with num sigs
    const firstByte = txBytes[0]
    const isVersioned = firstByte >= 0x80
    return {
      isVersioned,
      version: isVersioned ? (firstByte & 0x7f) : 'legacy',
      size: txBytes.length,
      logCount: (simValue?.logs || []).length,
    }
  } catch {
    return { isVersioned: false, version: 'legacy', size: txBytes.length, logCount: 0 }
  }
}

function toBase64(bytes) {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

async function probeUrlForTransaction(url, walletAddress) {
  // Solana Pay URL format: solana:<recipient>?amount=...&...
  if (url.startsWith('solana:')) {
    return null // Solana Pay transfer requests don't contain serialized txs
  }
  // For dApp URLs, we can't cross-origin fetch — inform user
  return null
}
