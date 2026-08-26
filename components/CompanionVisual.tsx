import { FAMILIES } from "../lib/companion";
import { vexaGenesisArt } from "../lib/vexa-art";

export function CompanionVisual({
  label,
  mode = "dormant",
  familyIndex = 0,
  archetypeIndex = 0,
  featured = false,
}: {
  label: string;
  mode?: "dormant" | "scan" | "awake";
  familyIndex?: number;
  archetypeIndex?: number;
  featured?: boolean;
}) {
  const family = FAMILIES[familyIndex] ?? FAMILIES[0];
  const isVexa = family === "Vexa";

  return (
    <div className={`companionCard artCard ${mode} family-${familyIndex} archetype-${archetypeIndex}`} aria-label={`${family} Arc Companion genesis visual`}>
      <div className="cardGrid" />
      <div className="signalHalo haloOne" />
      <div className="signalHalo haloTwo" />
      <div className="orbit orbitOne"><i /></div>
      <div className="orbit orbitTwo"><i /></div>
      <div className="scanLine" />

      <div className="artStage">
        {isVexa ? (
          <img className="genesisArtwork" src={vexaGenesisArt} alt="Vexa Genesis, an Arc Companion creature" />
        ) : (
          <div className="speciesPending" role="img" aria-label={`${family} visual identity is still concealed`}>
            <div className="pendingCore" />
            <strong>{family.toUpperCase()}</strong>
            <span>GENESIS SIGNAL CONCEALED</span>
          </div>
        )}
      </div>

      <div className="statusRail">
        <span><i /> ARC SIGNAL</span>
        <span>{featured ? "FEATURED GENESIS" : mode === "awake" ? "IDENTITY LOCKED" : mode === "scan" ? "SCANNING" : "DORMANT"}</span>
      </div>
      <div className="cardMeta"><span>{featured ? "VEXA · GENESIS FORM" : `${family.toUpperCase()} · GENESIS FORM`}</span><strong>{label}</strong></div>
    </div>
  );
}
