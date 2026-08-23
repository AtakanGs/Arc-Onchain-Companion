# Arc Companion — V1 Architecture

## Stack
- Next.js + TypeScript frontend.
- Viem for Arc Testnet reads and deterministic wallet helpers.
- Solidity 0.8.26 + OpenZeppelin 5.x.
- Hardhat for compile/test/deploy.
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
- first branching evolution;
- milestone flags.

## Why soulbound
The companion represents the connected wallet's Arc history and ongoing relationship. Transferability would break that identity model. V1 therefore blocks transfers while preserving ERC-721 ownership and metadata interfaces.

## Metadata / visuals
The contract exposes a configurable metadata base URI. Final metadata should be dynamically generated from onchain state so evolution and earned cosmetics can change the rendered companion without changing ownership.

## First Arc activity
Do not fake this value. V1 should query a verified Arc-compatible indexer/explorer data source server-side and derive the earliest known Arc transaction timestamp. If a wallet has no prior activity, adoption/mint time becomes its Arc birth timestamp. The provider must remain replaceable behind a small resolver interface.

## Daily-care day boundary
The contract uses UTC day indexes (`block.timestamp / 1 days`) for deterministic streak logic. Frontend copy must make the reset behavior clear.

## Local deployment environment
Hardhat loads `.env` locally before network configuration. `DEPLOYER_PRIVATE_KEY` and other secrets remain ignored by Git and must never be committed, pasted into source code, or shared in chat. A dedicated Arc Testnet deployer wallet is preferred.

## Special Arc Quest
Add only after the companion loop is stable. First candidate: Circle App Kit same-chain USDC→EURC swap on Arc Testnet. Cosmetic reward verification must be verifiable rather than a frontend-only flag.

## Security principles
- No private keys in source.
- One mint per wallet.
- One daily settlement per UTC day.
- Only valid 2–3 action combinations accepted.
- Transfers blocked because the token is identity-bound.
- Quest reward claims must eventually be verifiable.
- Network constants are re-checked against official Arc docs before deployment.
