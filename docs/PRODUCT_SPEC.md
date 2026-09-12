# Arc Companion — Builder V1 Product Spec

## Goal
Ship a small, polished, single-user Arc Testnet consumer app that visibly proves real builder activity: a live product, public source, deployed contracts, onchain state, and one meaningful Circle/Arc integration.

## Positioning
**Your Arc journey, brought to life.**

A personal onchain companion whose beginning is tied to the wallet's first Arc activity, whose initial identity is shaped by a short Web3 personality quiz, and whose future appearance is shaped by daily care, permanent evolution choices, and earned milestones.

> Your history shapes who they are. Your actions shape who they become.

## Builder V1 user flow
1. Connect wallet on Arc Testnet.
2. Resolve the wallet's earliest Arc activity timestamp from a verified source, with a no-fake-data fallback.
3. Answer five short Web3 personality questions.
4. Reveal one of three companion families with deterministic wallet-based DNA.
5. Name the companion.
6. Mint one non-transferable ERC-721 companion.
7. Each day, receive 2–3 actions from a small deterministic action pool.
8. Complete those actions, then submit one onchain daily-care transaction.
9. Grow XP/streak and unlock one permanent branching evolution at 1,000 XP.
10. Reach the 100-day milestone to activate the Ascended form on the chosen path.
11. Share the public companion state through `/share/<tokenId>`.
12. Optionally complete the real Arc Testnet USDC → EURC swap quest at `/quest/swap` using Circle App Kit.

## Companion families
### Vexa
- Vexa → Veyra → Veyrion
- Vexa → Vexus → Vexaris

### Noma
- Noma → Nymora → Nymoria
- Noma → Noryx → Noryth

### Koru
- Koru → Koraya → Koralith
- Koru → Korvax → Korvex

Locked production artwork is used for the integrated advanced forms. Korvex intentionally uses the locked Korvax production visual in Builder V1 to avoid visual drift.

## Daily loop target
**2–5 minutes maximum.**

Possible actions: Feed, Care, Play, Clean, Recharge. The user sees only 2–3 per day. Completing the day creates exactly one companion-state transaction.

## Progression
- 7 days: milestone + Streak Shield.
- 30 days: milestone / premium visual treatment.
- 1,000 XP: permanent evolution-path choice.
- 100 days: Ascended milestone.

## Public sharing
`/share/<tokenId>` is intentionally wallet-free and reads public state directly from Arc Testnet. It exposes the companion's current family/form, archetype, level, XP and streak without requiring the viewer to connect a wallet.

## Arc Swap Quest
`/quest/swap` uses Circle App Kit and an injected EVM wallet for a real Arc Testnet USDC → EURC swap. The user must obtain a live quote, review slippage, sign the transaction and receive a completed App Kit result with a transaction hash before the UI treats the quest as verified.

Builder V1 does not award an unverified cosmetic or fake frontend-only reward for this quest.

## What V1 deliberately excludes
Farm, restaurant, marketplace, breeding, PvP, lending, borrowing, staking, custom ERC-20 deployment, Discord-role scoring, complex inventory economy, multiple DeFi quest systems.

## Builder-proof deliverables
- Arc Testnet consumer app.
- Public GitHub repository.
- Deployed smart-contract address and ArcScan link.
- Contract tests + CI.
- Locked production companion artwork.
- Public share route.
- Real Circle App Kit swap integration.
- Clear README with architecture and run/deploy instructions.
- Final real-wallet QA checklist in `docs/FINAL_QA.md`.
- Final screenshots/demo captured only after the real-wallet release gate passes.
