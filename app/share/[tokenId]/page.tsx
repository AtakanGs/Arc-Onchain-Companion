import { notFound } from "next/navigation";
import { CompanionVisual } from "../../../components/CompanionVisual";
import { arcPublicClient } from "../../../lib/arc";
import { ARCHETYPES, FAMILIES } from "../../../lib/companion";
import { arcCompanionAbi, arcCompanionAddress } from "../../../lib/contract";

function formName(family: string, path: number, ascended: boolean) {
  if (family === "Koru") {
    if (path === 1) return ascended ? "Koralith" : "Koraya";
    if (path === 2) return ascended ? "Korvex" : "Korvax";
    return "Koru";
  }
  if (family === "Noma") {
    if (path === 1) return ascended ? "Nymoria" : "Nymora";
    if (path === 2) return ascended ? "Noryth" : "Noryx";
    return "Noma";
  }
  if (path === 1) return ascended ? "Veyrion" : "Veyra";
  if (path === 2) return ascended ? "Vexaris" : "Vexus";
  return "Vexa";
}

export default async function CompanionSharePage({ params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId: rawTokenId } = await params;
  let tokenId: bigint;
  try {
    tokenId = BigInt(rawTokenId);
    if (tokenId <= 0n) return notFound();
  } catch {
    return notFound();
  }

  try {
    const [companion, level] = await Promise.all([
      arcPublicClient.readContract({ address: arcCompanionAddress, abi: arcCompanionAbi, functionName: "companion", args: [tokenId] }),
      arcPublicClient.readContract({ address: arcCompanionAddress, abi: arcCompanionAbi, functionName: "levelOf", args: [tokenId] }),
    ]);

    const familyIndex = Number(companion.family);
    const archetypeIndex = Number(companion.archetype);
    const path = Number(companion.evolutionPath);
    const ascended = (Number(companion.milestoneFlags) & 4) !== 0;
    const family = FAMILIES[familyIndex] ?? FAMILIES[0];
    const archetype = ARCHETYPES[archetypeIndex] ?? "Unknown";
    const currentForm = formName(family, path, ascended);

    return (
      <main className="shell">
        <nav className="nav"><strong>ARC COMPANION</strong><span className="network">PUBLIC SIGNAL · TOKEN #{tokenId.toString()}</span></nav>
        <section style={{ minHeight: "720px", display: "grid", gridTemplateColumns: "minmax(300px, 520px) 1fr", gap: "56px", alignItems: "center" }}>
          <CompanionVisual label={`${companion.name} · Level ${level.toString()}`} mode="awake" familyIndex={familyIndex} archetypeIndex={archetypeIndex} evolutionPath={path} ascended={ascended} />
          <div>
            <p className="eyebrow">PUBLIC ARC COMPANION</p>
            <h1 style={{ fontSize: "clamp(52px,7vw,92px)" }}>{companion.name}</h1>
            <p className="lede">{currentForm} · {family} family · {archetype} archetype</p>
            <div className="statsGrid" style={{ marginTop: "32px" }}>
              <div><span>FORM</span><strong>{currentForm}</strong></div>
              <div><span>LEVEL</span><strong>{level.toString()}</strong></div>
              <div><span>XP</span><strong>{Number(companion.xp)}</strong></div>
              <div><span>STREAK</span><strong>🔥 {Number(companion.currentStreak)}</strong></div>
            </div>
            <p className="micro">This page reads the companion state directly from Arc Testnet. No wallet connection is required to view it.</p>
            <a className="textLink" href="/">Discover your own companion</a>
          </div>
        </section>
      </main>
    );
  } catch {
    return notFound();
  }
}
