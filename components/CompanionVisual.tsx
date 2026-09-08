import { FAMILIES } from "../lib/companion";
import { veyraPreviewArt, vexusPreviewArt } from "../lib/vexa-web";
import styles from "./CompanionVisual.module.css";

export type CompanionReaction = "idle" | "feed" | "care" | "play" | "clean" | "recharge";

function resolveForm(family: (typeof FAMILIES)[number], evolutionPath: number, ascended: boolean) {
  if (family === "Koru") {
    if (evolutionPath === 1) return { name: ascended ? "Koralith" : "Koraya", art: ascended ? "/assets/koralith.webp" : "/assets/koraya.webp" };
    if (evolutionPath === 2) return { name: ascended ? "Korvex" : "Korvax", art: ascended ? "/assets/korvex.webp" : "/assets/korvax.webp" };
    return { name: "Koru", art: "/assets/koru-genesis.webp" };
  }

  if (family === "Noma") {
    if (evolutionPath === 1) return { name: ascended ? "Nymoria" : "Nymora", art: null };
    if (evolutionPath === 2) return { name: ascended ? "Noryth" : "Noryx", art: null };
    return { name: "Noma", art: "/assets/noma-genesis.webp" };
  }

  if (evolutionPath === 1) return { name: ascended ? "Veyrion" : "Veyra", art: ascended ? "/assets/veyrion.webp" : veyraPreviewArt };
  if (evolutionPath === 2) return { name: ascended ? "Vexaris" : "Vexus", art: ascended ? "/assets/vexaris.webp" : vexusPreviewArt };
  return { name: "Vexa", art: "/assets/vexa-genesis.webp" };
}

export function CompanionVisual({
  label,
  mode = "dormant",
  familyIndex = 0,
  archetypeIndex = 0,
  featured = false,
  evolutionPath = 0,
  ascended = false,
  reaction = "idle",
}: {
  label: string;
  mode?: "dormant" | "scan" | "awake";
  familyIndex?: number;
  archetypeIndex?: number;
  featured?: boolean;
  evolutionPath?: number;
  ascended?: boolean;
  reaction?: CompanionReaction;
}) {
  const family = FAMILIES[familyIndex] ?? FAMILIES[0];
  const form = resolveForm(family, evolutionPath, ascended);
  const evolved = evolutionPath > 0;
  const formRank = ascended && evolved ? "ASCENDED FORM" : evolved ? "EVOLVED FORM" : "GENESIS FORM";

  const statusLabel = featured
    ? "FEATURED GENESIS"
    : ascended && evolved
      ? form.art ? "ASCENDED ACTIVE" : "ASCENDED SIGNAL LOCKED"
      : evolved
        ? form.art ? "EVOLUTION ACTIVE" : "EVOLUTION SIGNAL LOCKED"
        : mode === "awake"
          ? "IDENTITY LOCKED"
          : mode === "scan"
            ? "SCANNING"
            : "DORMANT";

  const reactionLabel = reaction === "idle" ? null : String(reaction).toUpperCase();

  return (
    <div className={`companionCard ${styles.artCard} ${mode} family-${familyIndex} archetype-${archetypeIndex} ${styles[`reaction-${reaction}`]}`} aria-label={`${form.name} Arc Companion visual`}>
      <div className="cardGrid" />
      <div className="signalHalo haloOne" />
      <div className="signalHalo haloTwo" />
      <div className="orbit orbitOne"><i /></div>
      <div className="orbit orbitTwo"><i /></div>
      <div className="scanLine" />

      <div className={styles.artStage}>
        {form.art ? (
          <img
            className={`${styles.genesisArtwork} ${family === "Noma" ? styles.nomaArtwork : ""} ${evolved ? styles.evolvedArtwork : ""}`}
            src={form.art}
            alt={`${form.name}, an Arc Companion creature`}
          />
        ) : (
          <div className={styles.speciesPending} role="img" aria-label={`${form.name} production artwork is concealed`}>
            <div className={styles.pendingCore} />
            <strong>{form.name.toUpperCase()}</strong>
            <span>{ascended ? "ASCENDED SIGNAL CONCEALED" : "EVOLUTION SIGNAL CONCEALED"}</span>
          </div>
        )}
        {reactionLabel && <span className={styles.reactionPulse}>{reactionLabel}</span>}
      </div>

      <div className="statusRail">
        <span><i /> ARC SIGNAL</span>
        <span>{statusLabel}</span>
      </div>
      <div className="cardMeta"><span>{`${form.name.toUpperCase()} · ${formRank}`}</span><strong>{label}</strong></div>
    </div>
  );
}
