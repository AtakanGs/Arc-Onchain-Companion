# Arc Companion

**Your Arc journey, brought to life.**

Arc Companion is a consumer dApp for Arc Testnet. Each wallet discovers a unique, non-transferable companion whose beginning is tied to its Arc history and whose future state grows through short daily onchain interactions.

> Your history shapes who they are. Your actions shape who they become.

## Builder V1
- Arc Testnet injected-wallet connection and network switching.
- Five-question Web3 personality onboarding.
- Deterministic wallet-based companion family preview.
- Verified first-Arc-activity resolver with a no-fake-data fallback.
- Naming + real mint transaction flow.
- One soulbound ERC-721 companion per wallet.
- Deterministic daily moments with 2–3 care actions settled as one onchain transaction.
- XP, streaks, Streak Shields, 7/30/100-day milestones.
- One permanent branching evolution for every family.
- Public companion share route at `/share/<tokenId>`.
- Real Circle App Kit Arc Testnet swap quest at `/quest/swap` with live estimate, slippage control and completed-transaction verification.
- Dynamic metadata base URI foundation.

## Evolution trees
### Vexa
- Vexa → Veyra → Veyrion
- Vexa → Vexus → Vexaris

Veyrion and Vexaris use the locked production artwork and are revealed at the Ascended milestone.

### Noma
- Noma → Nymora → Nymoria
- Noma → Noryx → Noryth

The evolved/Ascended Noma artwork remains intentionally concealed until the exact previously locked production-source mapping is confirmed. It should not be regenerated just to fill a slot.

### Koru
- Koru → Koraya → Koralith
- Koru → Korvax → Korvex

Korvex currently uses the locked Korvax production visual by design to avoid visual drift.

## Arc Testnet
- Chain ID: `5042002`
- Native gas token: USDC
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`
- Builder V1 contract: `0xAC4D30bf3c0CCAb37f1DCb2F84461AfED979C620`
- Contract explorer: `https://testnet.arcscan.app/address/0xAC4D30bf3c0CCAb37f1DCb2F84461AfED979C620`

The frontend defaults to the deployed Builder V1 contract above on Arc Testnet. `NEXT_PUBLIC_ARC_COMPANION_ADDRESS` can still override it for another deployment.

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
GitHub Actions runs artwork verification, contract compilation, contract tests, TypeScript checking and a production frontend build on pushes to `main` and pull requests.

Use `docs/FINAL_QA.md` as the final release checklist before calling Builder V1 complete.

## Circle / Arc App Kit quest
`/quest/swap` performs a real Arc Testnet USDC → EURC swap using Circle App Kit and the injected browser wallet. The UI requests a live estimate first, exposes slippage tolerance, and only reports completion after App Kit returns a transaction hash and completed status. Arc Testnet liquidity can be unstable, so the final real-wallet release check must still review the live quote before signing.

## Deploy
Use a dedicated Arc Testnet deployer wallet when possible. Never commit or share its private key. Put `DEPLOYER_PRIVATE_KEY` only in the ignored local `.env` file and fund the address with Arc Testnet USDC from the Circle Faucet.

Run the safe preflight first:

```bash
npm run preflight:arc
```

It confirms the Arc Testnet chain ID, prints only the deployer public address and native gas balance, and refuses to proceed when gas is missing. Then deploy:

```bash
npm run deploy:arc
```

For alternate deployments, set `NEXT_PUBLIC_ARC_COMPANION_ADDRESS` in the frontend environment. Do not commit private keys or `.env` files.

## Product docs
- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/FINAL_QA.md`

## Scope discipline
V1 intentionally excludes farming, restaurant gameplay, marketplace, breeding, PvP, lending/borrowing, staking and custom-token deployment. The goal is a polished, finished consumer experience rather than a large feature list.
