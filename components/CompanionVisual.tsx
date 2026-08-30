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
  reaction = "idle",
}: {
  label: string;
  mode?: "dormant" | "scan" | "awake";
  familyIndex?: number;
  archetypeIndex?: number;
  featured?: boolean;
  evolutionPath?: number;
  reaction?: CompanionReaction;
}) {
  const family = FAMILIES[familyIndex] ?? FAMILIES[0];
  const isVexa = family === "Vexa";
  const isNoma = family === "Noma";
  const hasProductionArt = isVexa || isNoma;
  const evolvedArt = isVexa
    ? evolutionPath === 1
      ? veyraPreviewArt
      : evolutionPath === 2
        ? vexusPreviewArt
        : null
    : null;
  const artwork = isNoma ? "/assets/noma-genesis.webp" : evolvedArt ?? "/assets/vexa-genesis.webp";
  const formName = isVexa && evolutionPath === 1
    ? "Veyra"
    : isVexa && evolutionPath === 2
      ? "Vexus"
      : family;
  const formRank = evolutionPath > 0 && isVexa ? "EVOLVED FORM" : "GENESIS FORM";

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
            className={`${styles.genesisArtwork} ${isNoma ? styles.nomaArtwork : ""} ${evolvedArt ? styles.evolvedArtwork : ""}`}
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
        {reaction !== "idle" && <span className={styles.reactionPulse}>{reaction.toUpperCase()}</span>}
      </div>

      <div className="statusRail">
        <span><i /> ARC SIGNAL</span>
        <span>{featured ? "FEATURED GENESIS" : evolutionPath && isVexa ? "EVOLUTION ACTIVE" : mode === "awake" ? "IDENTITY LOCKED" : mode === "scan" ? "SCANNING" : "DORMANT"}</span>
      </div>
      <div className="cardMeta"><span>{`${formName.toUpperCase()} · ${formRank}`}</span><strong>{label}</strong></div>
    </div>
  );
}
