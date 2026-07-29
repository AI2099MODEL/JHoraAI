export interface DignityRow {
  planet: string;
  chart: string;
  sign: string;
  longitudeFormatted: string;
  ownSign: string;
  moolatrikona: string;
  exalted: string;
  debilitated: string;
  exaltationDegree: string;
  debilitationDegree: string;
  friendlySign: string;
  enemySign: string;
  neutralSign: string;
  vargottama: string;
  pushkara: string;
  neechaBhanga: string;
  dignityRank: string;
}

export function calculatePlanetDignityRegistry(rawPlanets: any[], lagna: any): DignityRow[] {
  if (!Array.isArray(rawPlanets)) return [];
  return rawPlanets.map((p) => {
    const deg = p.degree || 0;
    const degInt = Math.floor(deg);
    const minFloat = (deg - degInt) * 60;
    const minInt = Math.floor(minFloat);
    const longitudeFormatted = `${degInt}° ${minInt}'`;

    const ownSign = p.ownSign ? "Yes" : "No";
    const moolatrikona = p.mooltrikona || p.moolatrikona ? "Yes" : "No";
    const exalted = p.exalted ? "Yes" : "No";
    const debilitated = p.debilitated ? "Yes" : "No";
    const friendlySign = p.friendlySign ? "Yes" : (p.dignity?.includes("Friendly") ? "Yes" : "No");
    const enemySign = p.enemySign ? "Yes" : (p.dignity?.includes("Inimical") ? "Yes" : "No");
    const neutralSign = p.neutralSign ? "Yes" : (p.dignity?.includes("Neutral") || (!p.exalted && !p.debilitated && !p.ownSign && !p.mooltrikona && !p.friendlySign && !p.enemySign) ? "Yes" : "No");
    const vargottama = p.vargottama ? "Yes" : "No";
    const pushkara = p.pushkara !== undefined ? (p.pushkara ? "Yes" : "No") : "N/A";
    const neechaBhanga = p.neechaBhanga !== undefined ? (p.neechaBhanga ? "Yes" : "No") : (p.debilitated ? "No" : "N/A");

    let dignityRank = p.dignity || "Neutral Sign";
    if (p.exalted) dignityRank = "Exalted";
    else if (p.debilitated) dignityRank = "Debilitated";
    else if (p.mooltrikona || p.mooltrikona) dignityRank = "Moolatrikona";
    else if (p.ownSign) dignityRank = "Own Sign";
    else if (friendlySign === "Yes") dignityRank = "Friendly Sign";
    else if (enemySign === "Yes") dignityRank = "Inimical Sign";

    return {
      planet: p.name || p.planet || "Unknown",
      chart: p.chart || "D1",
      sign: p.sign || "Aries",
      longitudeFormatted,
      ownSign,
      moolatrikona,
      exalted,
      debilitated,
      exaltationDegree: p.exaltationDegree || "N/A",
      debilitationDegree: p.debilitationDegree || "N/A",
      friendlySign,
      enemySign,
      neutralSign,
      vargottama,
      pushkara,
      neechaBhanga,
      dignityRank
    };
  });
}
