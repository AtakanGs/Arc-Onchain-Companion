# Arc Companion — Final QA Checklist

Builder V1 code, contract tests, artwork verification and production build are complete. The remaining release gate is a real-wallet Arc Testnet pass plus final responsive screenshots.

## 1. Genesis flow
- [ ] Connect an injected wallet on Arc Testnet.
- [ ] Confirm the app switches to Arc Testnet (`5042002`).
- [ ] Complete the five-question personality flow.
- [ ] Confirm wallet DNA deterministically resolves to one of Vexa, Noma, Koru.
- [ ] Name and mint the companion.
- [ ] Confirm one companion per wallet.
- [ ] Confirm the ERC-721 is soulbound / non-transferable.

## 2. Home / daily care
- [ ] Load the minted companion from Arc.
- [ ] Confirm family, archetype, birth date, XP, streak and shields render correctly.
- [ ] Complete the daily action set and save it onchain.
- [ ] Confirm state refreshes after the transaction.
- [ ] Confirm duplicate daily care is blocked.
- [ ] Confirm UTC-reset behavior.
- [ ] Confirm 7-day shield and 30/100-day milestone presentation using an appropriate test state.

## 3. Evolution
All locked production artwork is integrated and covered by `npm run verify:art`.

### Vexa
- [ ] Path 1: Vexa → Veyra → Veyrion.
- [ ] Path 2: Vexa → Vexus → Vexaris.
- [ ] Evolution choice unlocks at 1,000 XP and is permanent.
- [ ] Ascended chapter activates at the 100-day milestone.
- Veyrion and Vexaris use locked production artwork.

### Noma
- [ ] Path 1: Noma → Nymora → Nymoria.
- [ ] Path 2: Noma → Noryx → Noryth.
- [ ] Evolution choice unlocks at 1,000 XP and is permanent.
- [ ] Ascended chapter activates at the 100-day milestone.
- Nymora, Nymoria, Noryx and Noryth use locked production artwork.
- Noma evolution-choice cards intentionally present the full-background illustrations in a unified portrait preview frame; no transparent cutout treatment is required.

### Koru
- [ ] Path 1: Koru → Koraya → Koralith.
- [ ] Path 2: Koru → Korvax → Korvex.
- [ ] Verify Genesis, Evolved and Ascended rendering on desktop and mobile.
- Korvex intentionally uses the locked Korvax production visual in Builder V1 to avoid visual drift.

## 4. Public share route
- [ ] Open `/share/<tokenId>` without a connected wallet.
- [ ] Confirm the page reads state directly from Arc Testnet.
- [ ] Confirm current family/form, archetype, level, XP and streak.
- [ ] Confirm invalid and non-existent token IDs return 404.

## 5. Arc Swap Quest
Implementation is live at `/quest/swap` and uses Circle App Kit with the injected wallet.

- [ ] Connect a real Arc Testnet wallet.
- [ ] Request a live USDC → EURC quote.
- [ ] Review the current output and slippage before signing.
- [ ] Execute one real testnet swap.
- [ ] Require both a transaction hash and completed App Kit status before treating the quest as verified.
- [ ] Open the returned ArcScan link and confirm the transaction.

Do not simulate success or grant quest completion without the completed transaction result.

## 6. Responsive visual QA
Test the actual application at minimum:
- [ ] 390×844 mobile.
- [ ] 768×1024 tablet.
- [ ] 1440×900 desktop.

Check:
- [ ] No character clipping or unintended stretching.
- [ ] Evolution preview cards remain balanced and readable.
- [ ] Locked full-background art keeps intentional framing.
- [ ] Buttons remain reachable.
- [ ] Long companion names do not break layout.
- [ ] Daily-care, evolution confirmation and swap states remain readable.

## 7. Automated quality gate
Must remain green on `main`:
- [x] Vexa artwork verification.
- [x] Koru artwork verification.
- [x] Advanced Noma / Vexa artwork verification.
- [x] Solidity compile.
- [x] Contract tests.
- [x] TypeScript typecheck.
- [x] Next.js production build.

Run locally with:

```bash
npm install
npm run ci
```

## 8. Builder V1 release gate
Do not call Builder V1 fully released until these manual items are complete:
- [ ] One real wallet-to-mint flow.
- [ ] One real daily-care transaction.
- [ ] One permanent evolution transaction using an appropriate 1,000-XP test state/wallet.
- [ ] 100-day Ascended presentation verified with a test state.
- [ ] Public share route verified without wallet connection.
- [ ] One real Arc Testnet swap verified on ArcScan.
- [ ] Mobile, tablet and desktop visual pass complete.
- [ ] Final screenshots captured from the actual app.

At that point, close GitHub issue #21 and tag/release Builder V1.
