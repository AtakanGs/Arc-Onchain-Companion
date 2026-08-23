# Arc Companion

**Your Arc journey, brought to life.**

Arc Companion is a consumer dApp for Arc Testnet. Each wallet discovers a unique, non-transferable companion whose beginning is tied to its Arc history and whose future state grows through short daily onchain interactions.

> Your history shapes who they are. Your actions shape who they become.

## Builder V1
- Arc Testnet injected-wallet connection and network switching.
- Five-question Web3 personality onboarding.
- Deterministic wallet-based companion family preview.
- One soulbound ERC-721 companion per wallet.
- Daily 2–3 action care session settled as one onchain transaction.
- XP, streaks, Streak Shields, 7/30/100-day milestones.
- One permanent branching evolution.
- Dynamic metadata base URI foundation.
- Next: verified first-Arc-activity resolver, naming + mint flow, final visual asset system, avatar/share card, then one Circle App Kit Swap quest.

## Arc Testnet
- Chain ID: `5042002`
- Native gas token: USDC
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`

Always re-check official Arc documentation before deployment because the testnet is evolving.

## Local setup
```bash
npm install
cp .env.example .env
npm run contracts:compile
npm run contracts:test
npm run dev
```

## Quality gate
GitHub Actions runs contract compilation, contract tests, TypeScript checking and a production frontend build on pushes to `main`.

## Deploy
Fund the deployer wallet with Arc Testnet gas USDC, set `DEPLOYER_PRIVATE_KEY` in `.env`, then:

```bash
npm run deploy:arc
```

## Product docs
- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`

## Scope discipline
V1 intentionally excludes farming, restaurant gameplay, marketplace, breeding, PvP, lending/borrowing, staking and custom-token deployment. The goal is a polished, finished consumer experience rather than a large feature list.
