# TxGuard

Solana transaction risk simulator built from an Eitherway prompt. TxGuard is a wallet-first interface where the wallet is a core part of the UX, not just a connect button.

## Eitherway Prompt Context

This project was prompted and generated for the Eitherway bounty. The focus is a deep Solflare integration where users can:

- Connect a wallet as the primary UI context.
- Simulate transactions before signing.
- Understand balance changes and risk signals in one place.
- Sign directly through Solflare when appropriate.

## What It Does

- Live transaction simulation for raw transactions and transaction hashes.
- Live account lookup for contract/program addresses.
- Wallet-first signing flow with Solflare.
- Risk scoring and warnings surfaced as clear flags and summaries.
- Scan-step UX that visualizes the analysis stages.

## How It Works

1. Connect Solflare.
2. Paste one of the supported inputs:
	- Raw TX data (base64/base58/hex).
	- TX hash (signature).
	- Contract address (program or account).
3. The app runs live RPC calls:
	- Raw TX: `simulateTransaction`.
	- TX hash: `getTransaction` then `simulateTransaction`.
	- Contract address: `getAccountInfo` for a live account summary.
4. Results are mapped into the UI model (risk banner, flags, explanation, meta).
5. If you are on Raw TX, you can sign directly with Solflare.

## Supported Inputs (Live)

- Raw TX data: fully simulated with balance changes, warnings, and logs.
- TX hash: fetched from RPC and simulated.
- Contract address: live account info (executable status, owner, SOL balance).

## Known Limitations

- dApp URL analysis is not implemented yet.
- Contract address view is a live account lookup, not a transaction simulation.
- The AI explanation edge function exists in the repo but is not wired to the new UI.

## Wallet Integration (Solflare)

TxGuard uses the Solflare SDK to provide:

- Live connect and disconnect.
- Versioned or legacy transaction signing.
- Wallet address display as a core UI element.

## Risk Scoring

Risk is computed from simulation results and logs. It highlights:

- Failed simulations.
- Large SOL outflows.
- Authority changes, approvals, or suspicious program logs.
- High compute usage or unusually broad token changes.

## Tech Stack

- React 18 + Vite
- Tailwind CSS (base utilities) with custom UI styling
- Solana RPC (`simulateTransaction`, `getTransaction`, `getAccountInfo`)
- Solflare SDK
- Optional Supabase Edge Function (AI explanation)

## Environment Variables

These are optional unless you enable the AI edge function:

- `VITE_API_BASE_URL` (default: `https://api.eitherway.ai`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Security Notes

- Private keys never leave Solflare.
- Simulations are read-only and do not broadcast transactions.
- Signing is restricted to raw transaction inputs only.

## Bounty Alignment (Solflare Track)

TxGuard is wallet-first by design and focuses on improving how users interact with transactions:

- Wallet-centric UX (connect state is core UI).
- Transaction simulation and risk analysis.
- Signing flow integrated directly in-app.
- Clear explanations to help users make safer decisions.
