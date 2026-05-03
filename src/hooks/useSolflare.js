import { useState, useCallback, useRef } from 'react'

export function useSolflare() {
  const [wallet, setWallet] = useState(null)
  const [publicKey, setPublicKey] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)
  const solflareRef = useRef(null)

  const connect = useCallback(async () => {
    setConnecting(true)
    setError(null)
    try {
      let Solflare
      try {
        const mod = await import('@solflare-network/solflare-sdk')
        Solflare = mod.default || mod.Solflare
      } catch {
        throw new Error('Failed to load Solflare SDK. Please ensure @solflare-network/solflare-sdk is installed.')
      }

      const sf = new Solflare({ network: 'mainnet-beta' })
      solflareRef.current = sf

      await sf.connect()

      if (!sf.publicKey) {
        throw new Error('Connection rejected or wallet locked.')
      }

      const pkStr = sf.publicKey.toString()
      setWallet(sf)
      setPublicKey(pkStr)

      sf.on('disconnect', () => {
        setWallet(null)
        setPublicKey(null)
        solflareRef.current = null
      })

      return pkStr
    } catch (err) {
      const msg = err.message || 'Failed to connect to Solflare'
      setError(msg)
      throw err
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      if (solflareRef.current) {
        await solflareRef.current.disconnect()
      }
    } catch {
      // ignore
    }
    setWallet(null)
    setPublicKey(null)
    solflareRef.current = null
    setError(null)
  }, [])

  const signTransaction = useCallback(async (transaction) => {
    if (!solflareRef.current || !wallet) throw new Error('Wallet not connected')
    const signed = await solflareRef.current.signTransaction(transaction)
    return signed
  }, [wallet])

  const signAndSendTransaction = useCallback(async (transaction) => {
    if (!solflareRef.current || !wallet) throw new Error('Wallet not connected')
    const { signature } = await solflareRef.current.signAndSendTransaction(transaction)
    return signature
  }, [wallet])

  return {
    wallet,
    publicKey,
    connecting,
    error,
    connect,
    disconnect,
    signTransaction,
    signAndSendTransaction,
    isConnected: !!publicKey,
  }
}
