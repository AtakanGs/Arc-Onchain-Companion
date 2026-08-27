import { FAMILIES } from "../lib/companion";
import { vexaGenesisArt, veyraPreviewArt, vexusPreviewArt } from "../lib/vexa-web";
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
  const evolvedArt = evolutionPath === 1 ? veyraPreviewArt : evolutionPath === 2 ? vexusPreviewArt : null;
  const formName = evolutionPath === 1 ? "Veyra" : evolutionPath === 2 ? "Vexus" : "Vexa";
  const formRank = evolutionPath === 0 ? "GENESIS FORM" : "EVOLVED FORM";

  return (
    <div className={`companionCard ${styles.artCard} ${mode} family-${familyIndex} archetype-${archetypeIndex} ${styles[`reaction-${reaction}`]}`} aria-label={`${formName} Arc Companion visual`}>
      <div className="cardGrid" />
      <div className="signalHalo haloOne" />
      <div className="signalHalo haloTwo" />
      <div className="orbit orbitOne"><i /></div>
      <div className="orbit orbitTwo"><i /></div>
      <div className="scanLine" />

      <div className={styles.artStage}>
        {isVexa ? (
          <img
            className={`${styles.genesisArtwork} ${evolvedArt ? styles.evolvedArtwork : ""}`}
            src={evolvedArt ?? vexaGenesisArt}
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
        <span>{featured ? "FEATURED GENESIS" : evolutionPath ? "EVOLUTION ACTIVE" : mode === "awake" ? "IDENTITY LOCKED" : mode === "scan" ? "SCANNING" : "DORMANT"}</span>
      </div>
      <div className="cardMeta"><span>{featured ? "VEXA · GENESIS FORM" : `${formName.toUpperCase()} · ${formRank}`}</span><strong>{label}</strong></div>
    </div>
  );
}
