import { FAMILIES } from "../lib/companion";
import { veyraPreviewArt, vexusPreviewArt } from "../lib/vexa-web";
import styles from "./CompanionVisual.module.css";

export type CompanionReaction = "idle" | "feed" | "care" | "play" | "clean" | "recharge";

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
  const isVexa = family === "Vexa";
  const isNoma = family === "Noma";
  const isKoru = family === "Koru";
  const hasProductionArt = isVexa || isNoma || isKoru;

  const vexaEvolvedArt = isVexa
    ? evolutionPath === 1
      ? veyraPreviewArt
      : evolutionPath === 2
        ? vexusPreviewArt
        : null
    : null;

  const koruArtwork = evolutionPath === 1
    ? ascended
      ? "/assets/koralith.webp"
      : "/assets/koraya.webp"
    : evolutionPath === 2
      ? ascended
        ? "/assets/korvex.webp"
        : "/assets/korvax.webp"
      : "/assets/koru-genesis.webp";

  const artwork = isNoma
    ? "/assets/noma-genesis.webp"
    : isKoru
      ? koruArtwork
      : vexaEvolvedArt ?? "/assets/vexa-genesis.webp";

  const formName = isKoru
    ? evolutionPath === 1
      ? ascended ? "Koralith" : "Koraya"
      : evolutionPath === 2
        ? ascended ? "Korvex" : "Korvax"
        : "Koru"
    : isVexa && evolutionPath === 1
      ? "Veyra"
      : isVexa && evolutionPath === 2
        ? "Vexus"
        : family;

  const evolved = evolutionPath > 0 && (isVexa || isKoru);
  const formRank = ascended && isKoru && evolutionPath > 0
    ? "ASCENDED FORM"
    : evolved
      ? "EVOLVED FORM"
      : "GENESIS FORM";

  const statusLabel = featured
    ? "FEATURED GENESIS"
    : ascended && isKoru && evolutionPath > 0
      ? "ASCENDED ACTIVE"
      : evolved
        ? "EVOLUTION ACTIVE"
        : mode === "awake"
          ? "IDENTITY LOCKED"
          : mode === "scan"
            ? "SCANNING"
            : "DORMANT";

  const reactionLabel = reaction === "idle" ? null : String(reaction).toUpperCase();

  return (
    <div className={`companionCard ${styles.artCard} ${mode} family-${familyIndex} archetype-${archetypeIndex} ${styles[`reaction-${reaction}`]}`} aria-label={`${formName} Arc Companion visual`}>
      <div className="cardGrid" />
      <div className="signalHalo haloOne" />
      <div className="signalHalo haloTwo" />
      <div className="orbit orbitOne"><i /></div>
      <div className="orbit orbitTwo"><i /></div>
      <div className="scanLine" />

      <div className={styles.artStage}>
        {hasProductionArt ? (
          <img
            className={`${styles.genesisArtwork} ${isNoma ? styles.nomaArtwork : ""} ${evolved ? styles.evolvedArtwork : ""}`}
            src={artwork}
            alt={`${formName}, an Arc Companion creature`}
          />
        ) : (
          <div className={styles.speciesPending} role="img" aria-label={`${family} visual identity is still concealed`}>
            <div className={styles.pendingCore} />
            <strong>{family.toUpperCase()}</strong>
            <span>GENESIS SIGNAL CONCEALED</span>
          </div>
        )}
        {reactionLabel && <span className={styles.reactionPulse}>{reactionLabel}</span>}
      </div>

      <div className="statusRail">
        <span><i /> ARC SIGNAL</span>
        <span>{statusLabel}</span>
      </div>
      <div className="cardMeta"><span>{`${formName.toUpperCase()} · ${formRank}`}</span><strong>{label}</strong></div>
    </div>
  );
}
