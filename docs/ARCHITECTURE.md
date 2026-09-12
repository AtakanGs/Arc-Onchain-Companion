# Arc Companion — V1 Architecture

## Stack
- Next.js 15 + React 19 + TypeScript frontend.
- Viem for Arc Testnet reads, wallet interaction and deterministic helpers.
- Solidity 0.8.26 + OpenZeppelin 5.x.
- Hardhat for compile/test/deploy.
- Circle App Kit + Viem adapter for the Arc Testnet swap quest.
- Arc Testnet chain ID `5042002`.
- Primary RPC: `https://rpc.testnet.arc.network`.
- ArcScan explorer: `https://testnet.arcscan.app`.

## Contract model
`ArcCompanion.sol` owns identity/progression state:
- one companion token per wallet;
- soulbound ERC-721 ownership;
- Arc birth timestamp;
- deterministic DNA and family;
- personality archetype;
- XP and streak;
- Streak Shields;
- one permanent branching evolution;
- milestone flags.

The Builder V1 frontend points to the deployed Arc Testnet contract unless `NEXT_PUBLIC_ARC_COMPANION_ADDRESS` overrides it.

## Why soulbound
The companion represents the connected wallet's Arc history and ongoing relationship. Transferability would break that identity model. V1 therefore blocks transfers while preserving ERC-721 ownership and metadata interfaces.

## Metadata / visuals
The contract exposes a configurable metadata base URI. Builder V1 keeps progression state onchain and resolves the current companion form in the frontend from family, evolution path and milestone state.

Production artwork is stored under `public/assets` and protected by integrity checks run through `npm run verify:art`.

Integrated families:
- Vexa → Veyra/Vexus → Veyrion/Vexaris.
- Noma → Nymora/Noryx → Nymoria/Noryth.
- Koru → Koraya/Korvax → Koralith/Korvex.

Korvex intentionally reuses the locked Korvax production visual in Builder V1 to avoid generative visual drift.

## First Arc activity
Do not fake this value. V1 queries a verified Arc-compatible data source server-side and derives the earliest known Arc activity when available. If the resolver cannot prove prior activity, the product uses the explicit no-fake-data fallback rather than inventing a historical date.

## Daily-care day boundary
The contract uses UTC day indexes (`block.timestamp / 1 days`) for deterministic streak logic. Frontend copy makes the reset behavior explicit.

## Evolution
At 1,000 XP, the user makes one permanent onchain branch choice. The chosen path is stored in contract state. The 100-day milestone activates the Ascended presentation for that path.

Evolution-choice artwork is presentation-only; the authoritative branch and milestone state comes from the contract.

## Public share route
`/share/<tokenId>` is a read-only public route. It does not require wallet connection and reads Arc Testnet state for the requested token ID. Invalid or non-existent token IDs should resolve to a not-found state rather than a fabricated companion.

## Circle / Arc App Kit quest
`/quest/swap` is a real Arc Testnet USDC → EURC swap flow.

Flow:
1. Request access to the injected EVM wallet.
2. Switch to Arc Testnet.
3. Build a Circle App Kit swap request through the Viem adapter.
4. Request a live quote with explicit slippage tolerance.
5. Let the user confirm/sign the real transaction.
6. Treat the quest as verified only when App Kit returns both a transaction hash and a completed status.
7. Surface the returned ArcScan link when available.

Builder V1 stores the verified swap result locally for UI continuity, but does not claim an onchain cosmetic reward system that has not been implemented.

## Local deployment environment
Hardhat loads `.env` locally before network configuration. `DEPLOYER_PRIVATE_KEY` and other secrets remain ignored by Git and must never be committed, pasted into source code, or shared in chat. A dedicated Arc Testnet deployer wallet is preferred.

Run `npm run preflight:arc` before deployment, then `npm run deploy:arc` only after the preflight succeeds.

## Quality gate
`npm run ci` runs:
- locked artwork verification;
- Solidity compilation;
- contract tests;
- TypeScript typecheck;
- Next.js production build.

GitHub Actions runs the same release-oriented checks for pull requests and main-branch updates.

## Security principles
- No private keys in source.
- One mint per wallet.
- One daily settlement per UTC day.
- Only valid 2–3 action combinations accepted.
- Transfers blocked because the token is identity-bound.
- Evolution path is permanent after the onchain choice.
- No fake wallet-history dates.
- No simulated swap success; a completed transaction result is required.
- Network constants are re-checked against official Arc documentation before deployment.
