# Arc Companion — Final QA Checklist

## 1. Genesis flow
- Connect an injected wallet on Arc Testnet.
- Confirm the app switches to Arc Testnet.
- Complete the five-question personality flow.
- Confirm wallet DNA deterministically resolves to one of Vexa, Noma, Koru.
- Name and mint the companion.
- Confirm one companion per wallet and soulbound behavior.

## 2. Home / daily care
- Load the minted companion from Arc.
- Confirm family, archetype, birth date, XP, streak and shields render correctly.
- Complete the daily action set and save it onchain.
- Confirm duplicate daily care is blocked.
- Confirm UTC reset behavior.
- Confirm 7-day shield and 30/100-day milestones.

## 3. Evolution
### Vexa
- Path 1: Vexa → Veyra → Veyrion.
- Path 2: Vexa → Vexus → Vexaris.
- Evolution choice unlocks at 1,000 XP and is permanent.
- Ascended chapter activates at the 100-day milestone.
- Veyrion / Vexaris production art remains concealed until the locked source assets are safely added.

### Noma
- Path 1: Noma → Nymora → Nymoria.
- Path 2: Noma → Noryx → Noryth.
- Evolution choice unlocks at 1,000 XP and is permanent.
- Ascended chapter activates at the 100-day milestone.
- Nymora / Nymoria / Noryx / Noryth art must be integrated only from the previously locked production sources; do not regenerate.

### Koru
- Path 1: Koru → Koraya → Koralith.
- Path 2: Koru → Korvax → Korvex.
- Verify Genesis, Evolved and Ascended rendering on desktop and mobile.
- Korvex intentionally uses the locked Korvax production visual in the current release.

## 4. Public share route
- Open `/share/<tokenId>` without a connected wallet.
- Confirm the public page reads state directly from Arc Testnet.
- Confirm current family/form, archetype, level, XP and streak.
- Test invalid and non-existent token IDs return 404.

## 5. Responsive visual QA
Test at minimum:
- 390×844 mobile.
- 768×1024 tablet.
- 1440×900 desktop.

Check:
- No character clipping.
- No stretched artwork.
- Evolution cards remain readable.
- Buttons remain reachable.
- Long companion names do not break layout.
- Concealed visual states are visually intentional rather than broken-image states.

## 6. CI / contracts
Required green checks before merge:
- Artwork verification.
- Solidity compile.
- Contract tests.
- TypeScript typecheck.
- Next.js production build.

## 7. Circle / Arc App Kit quest — implementation gate
Do not ship a fake swap flow. The quest should be enabled only after the real App Kit integration is configured and tested.

Current integration prerequisites:
- `@circle-fin/app-kit`.
- A supported wallet adapter matching the production wallet model.
- Circle/Arc credentials required by the selected adapter kept server-side or in approved secure configuration.
- Arc Testnet token pair with live swap liquidity.
- Quote / slippage handling.
- Transaction result and explorer link.
- Idempotent quest completion tracking.

Suggested quest:
1. User opens **Arc Swap Quest**.
2. App obtains a real quote.
3. User confirms the swap.
4. Transaction settles on Arc Testnet.
5. App verifies the transaction before granting quest credit.

## 8. Release gate
Before calling Builder V1 complete:
- All CI checks green.
- Real wallet-to-mint flow tested once end-to-end.
- One daily care transaction tested.
- One evolution transaction tested on a test state/wallet.
- Public share route tested.
- Final screenshots captured from the actual app.
- README reflects the current feature set and remaining concealed art accurately.
