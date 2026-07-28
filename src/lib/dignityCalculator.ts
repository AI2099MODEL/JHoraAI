/**
 * Astrological Dignity Calculations Engine (Parashari Baseline)
 * Computes core factual parameters for the Planet Dignity Registry (JH32).
 */

export interface DignityRegistryItem {
  planet: string;
  chart: string; // "D1" or "D9"
  sign: string;
  longitude: number;
  longitudeFormatted: string;
  ownSign: "Yes" | "No" | "N/A";
  moolatrikona: "Yes" | "No" | "N/A";
  exalted: "Yes" | "No" | "N/A";
  debilitated: "Yes" | "No" | "N/A";
  exaltationDegree: string;
  debilitationDegree: string;
  friendlySign: "Yes" | "No" | "N/A";
  enemySign: "Yes" | "No" | "N/A";
  neutralSign: "Yes" | "No" | "N/A";
  vargottama: "Yes" | "No" | "N/A";
  pushkara: "Yes" | "No" | "N/A";
  neechaBhanga: "Yes" | "No" | "N/A";
  dignityRank: string;
}

const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const SIGN_LORDS = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"
];

// Natural Relationships
const RELATIONSHIPS: Record<string, { friends: string[]; enemies: string[]; neutrals: string[] }> = {
  "Sun": {
    friends: ["Moon", "Mars", "Jupiter"],
    enemies: ["Venus", "Saturn", "Rahu", "Ketu"],
    neutrals: ["Mercury"]
  },
  "Moon": {
    friends: ["Sun", "Mercury"],
    enemies: ["Rahu", "Ketu"],
    neutrals: ["Mars", "Jupiter", "Venus", "Saturn"]
  },
  "Mars": {
    friends: ["Sun", "Moon", "Jupiter"],
    enemies: ["Mercury", "Rahu"],
    neutrals: ["Venus", "Saturn", "Ketu"]
  },
  "Mercury": {
    friends: ["Sun", "Venus"],
    enemies: ["Moon"],
    neutrals: ["Mars", "Jupiter", "Saturn", "Rahu", "Ketu"]
  },
  "Jupiter": {
    friends: ["Sun", "Moon", "Mars"],
    enemies: ["Mercury", "Venus", "Rahu", "Ketu"],
    neutrals: ["Saturn"]
  },
  "Venus": {
    friends: ["Mercury", "Saturn", "Rahu", "Ketu"],
    enemies: ["Sun", "Moon"],
    neutrals: ["Mars", "Jupiter"]
  },
  "Saturn": {
    friends: ["Mercury", "Venus", "Rahu"],
    enemies: ["Sun", "Moon", "Mars", "Ketu"],
    neutrals: ["Jupiter"]
  },
  "Rahu": {
    friends: ["Mercury", "Venus", "Saturn"],
    enemies: ["Sun", "Moon", "Mars", "Ketu"],
    neutrals: ["Jupiter"]
  },
  "Ketu": {
    friends: ["Mercury", "Venus", "Saturn"],
    enemies: ["Sun", "Moon", "Mars", "Rahu"],
    neutrals: ["Jupiter"]
  }
};

// Deep Exaltation and Debilitation Details
const EXALT_DEBIL_DEGREES: Record<string, { exaltSign: number; exaltDeg: number; debilSign: number; debilDeg: number }> = {
  "Sun": { exaltSign: 0, exaltDeg: 10, debilSign: 6, debilDeg: 10 },
  "Moon": { exaltSign: 1, exaltDeg: 3, debilSign: 7, debilDeg: 3 },
  "Mars": { exaltSign: 9, exaltDeg: 28, debilSign: 3, debilDeg: 28 },
  "Mercury": { exaltSign: 5, exaltDeg: 15, debilSign: 11, debilDeg: 15 },
  "Jupiter": { exaltSign: 3, exaltDeg: 5, debilSign: 9, debilDeg: 5 },
  "Venus": { exaltSign: 11, exaltDeg: 27, debilSign: 5, debilDeg: 27 },
  "Saturn": { exaltSign: 6, exaltDeg: 20, debilSign: 0, debilDeg: 20 },
  "Rahu": { exaltSign: 1, exaltDeg: 15, debilSign: 7, debilDeg: 15 }, // Taurus Exalted / Scorpio Debilitated
  "Ketu": { exaltSign: 7, exaltDeg: 15, debilSign: 1, debilDeg: 15 }  // Scorpio Exalted / Taurus Debilitated
};

export function formatDegree(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}° ${m}'`;
}

export function calculatePlanetDignityRegistry(planetsInput: any[], lagna: any): DignityRegistryItem[] {
  const result: DignityRegistryItem[] = [];

  // Map input list to reliable format
  const parsedPlanets = planetsInput.map(p => {
    const signs = SIGN_NAMES;
    let signIdx = p.signIndex !== undefined ? p.signIndex : p.sign_index;
    if (signIdx === undefined || signIdx === -1) {
      signIdx = signs.indexOf(p.sign);
    }
    if (signIdx === -1) signIdx = 0;

    const absLong = p.longitude !== undefined 
      ? p.longitude 
      : (signIdx * 30 + (p.degree || 0));

    return {
      name: p.name || p.lord || "Unknown",
      signIndex: signIdx,
      sign: signs[signIdx],
      degree: p.degree !== undefined ? p.degree : (absLong % 30),
      longitude: absLong,
      house: p.house || 1,
      retrograde: p.retrograde || false
    };
  });

  const planetHouses: Record<string, number> = {};
  parsedPlanets.forEach(p => {
    planetHouses[p.name] = p.house;
  });

  // Helper to determine Kendra placement
  const isLordInKendra = (planetName: string) => {
    const h = planetHouses[planetName];
    return h === 1 || h === 4 || h === 7 || h === 10;
  };

  parsedPlanets.forEach(p => {
    const pName = p.name;
    if (pName === "Ascendant" || pName === "Lagna") return;

    // === CHART D1 (Rasi) ===
    const d1SignIdx = p.signIndex;
    const d1Deg = p.degree;

    const d1Info = evaluateChartDignity(pName, d1SignIdx, d1Deg, isLordInKendra);

    // === CHART D9 (Navamsha) ===
    const d9NavIndex = Math.floor(p.longitude / (30 / 9));
    const d9SignIdx = d9NavIndex % 12;
    const d9Deg = (p.longitude % (30 / 9)) * 9; // normalized to 30 degrees for display
    const d9Long = d9SignIdx * 30 + d9Deg;

    const d9Info = evaluateChartDignity(pName, d9SignIdx, d9Deg, () => false);

    // Vargottama
    const isVargottama: "Yes" | "No" | "N/A" = d1SignIdx === d9SignIdx ? "Yes" : "No";

    // Pushkara Navamsha
    let isPushkara: "Yes" | "No" | "N/A" = "No";
    const d1Elem = d1SignIdx % 4; // 0: Fire, 1: Earth, 2: Air, 3: Water
    const navPart = Math.floor((p.longitude % 30) / 3.333333); // 0 to 8 Navamshas

    if (d1Elem === 0) { // Fiery
      if (navPart === 6 || navPart === 8) isPushkara = "Yes"; // Libra or Sagittarius
    } else if (d1Elem === 1) { // Earthy
      if (navPart === 2 || navPart === 4) isPushkara = "Yes"; // Pisces or Taurus
    } else if (d1Elem === 2) { // Airy
      if (navPart === 5 || navPart === 7) isPushkara = "Yes"; // Pisces or Taurus
    } else if (d1Elem === 3) { // Watery
      if (navPart === 0 || navPart === 2) isPushkara = "Yes"; // Cancer or Virgo
    }

    // Pushkara Bhaga check
    const degreesInSign = p.longitude % 30;
    const pushkaraBhagas = [21, 14, 24, 7, 21, 14, 24, 7, 21, 14, 24, 7];
    const targetPushkaraDeg = pushkaraBhagas[d1SignIdx];
    if (Math.abs(degreesInSign - targetPushkaraDeg) <= 1.0) {
      isPushkara = "Yes";
    }

    // Add D1 item
    result.push({
      planet: pName,
      chart: "D1",
      sign: SIGN_NAMES[d1SignIdx],
      longitude: p.longitude,
      longitudeFormatted: formatDegree(d1Deg),
      ownSign: d1Info.ownSign,
      moolatrikona: d1Info.moolatrikona,
      exalted: d1Info.exalted,
      debilitated: d1Info.debilitated,
      exaltationDegree: d1Info.exaltationDegree,
      debilitationDegree: d1Info.debilitationDegree,
      friendlySign: d1Info.friendlySign,
      enemySign: d1Info.enemySign,
      neutralSign: d1Info.neutralSign,
      vargottama: isVargottama,
      pushkara: isPushkara,
      neechaBhanga: d1Info.neechaBhanga,
      dignityRank: d1Info.dignityRank
    });

    // Add D9 item
    result.push({
      planet: pName,
      chart: "D9",
      sign: SIGN_NAMES[d9SignIdx],
      longitude: d9Long,
      longitudeFormatted: formatDegree(d9Deg),
      ownSign: d9Info.ownSign,
      moolatrikona: d9Info.moolatrikona,
      exalted: d9Info.exalted,
      debilitated: d9Info.debilitated,
      exaltationDegree: d9Info.exaltationDegree,
      debilitationDegree: d9Info.debilitationDegree,
      friendlySign: d9Info.friendlySign,
      enemySign: d9Info.enemySign,
      neutralSign: d9Info.neutralSign,
      vargottama: isVargottama,
      pushkara: "N/A", // Pushkara is defined based on Rasi sign + Navamsha partition, not on D9 chart standalone
      neechaBhanga: "N/A",
      dignityRank: d9Info.dignityRank
    });
  });

  return result;
}

function evaluateChartDignity(
  pName: string,
  signIdx: number,
  deg: number,
  isLordInKendra: (p: string) => boolean
): {
  ownSign: "Yes" | "No";
  moolatrikona: "Yes" | "No";
  exalted: "Yes" | "No";
  debilitated: "Yes" | "No";
  exaltationDegree: string;
  debilitationDegree: string;
  friendlySign: "Yes" | "No";
  enemySign: "Yes" | "No";
  neutralSign: "Yes" | "No";
  neechaBhanga: "Yes" | "No" | "N/A";
  dignityRank: string;
} {
  let ownSign: "Yes" | "No" = "No";
  let moolatrikona: "Yes" | "No" = "No";
  let exalted: "Yes" | "No" = "No";
  let debilitated: "Yes" | "No" = "No";
  let friendlySign: "Yes" | "No" = "No";
  let enemySign: "Yes" | "No" = "No";
  let neutralSign: "Yes" | "No" = "No";
  let neechaBhanga: "Yes" | "No" | "N/A" = "N/A";
  let dignityRank = "Neutral Sign";

  const config = EXALT_DEBIL_DEGREES[pName];
  const exaltStr = config ? `${config.exaltDeg}° ${SIGN_NAMES[config.exaltSign]}` : "—";
  const debilStr = config ? `${config.debilDeg}° ${SIGN_NAMES[config.debilSign]}` : "—";

  if (config) {
    if (signIdx === config.exaltSign) {
      exalted = "Yes";
      dignityRank = deg <= config.exaltDeg ? "Deep Exaltation" : "Exalted";
    } else if (signIdx === config.debilSign) {
      debilitated = "Yes";
      dignityRank = deg <= config.debilDeg ? "Deep Debilitation" : "Debilitated";

      // Neecha Bhanga checks
      const debilLord = SIGN_LORDS[signIdx];
      const exaltLord = SIGN_LORDS[config.exaltSign];
      if (isLordInKendra(debilLord) || isLordInKendra(exaltLord) || isLordInKendra(pName)) {
        neechaBhanga = "Yes";
      } else {
        neechaBhanga = "No";
      }
    }
  }

  // Moolatrikona & Own Sign ranges
  if (exalted === "No" && debilitated === "No") {
    if (pName === "Sun") {
      if (signIdx === 4) { // Leo
        if (deg <= 20) { moolatrikona = "Yes"; dignityRank = "Moolatrikona"; }
        else { ownSign = "Yes"; dignityRank = "Own Sign"; }
      }
    } else if (pName === "Moon") {
      if (signIdx === 1) { // Taurus
        if (deg > 3) { moolatrikona = "Yes"; dignityRank = "Moolatrikona"; }
      } else if (signIdx === 3) { // Cancer
        ownSign = "Yes";
        dignityRank = "Own Sign";
      }
    } else if (pName === "Mars") {
      if (signIdx === 0) { // Aries
        if (deg <= 12) { moolatrikona = "Yes"; dignityRank = "Moolatrikona"; }
        else { ownSign = "Yes"; dignityRank = "Own Sign"; }
      } else if (signIdx === 7) { // Scorpio
        ownSign = "Yes";
        dignityRank = "Own Sign";
      }
    } else if (pName === "Mercury") {
      if (signIdx === 5) { // Virgo
        if (deg > 15 && deg <= 20) { moolatrikona = "Yes"; dignityRank = "Moolatrikona"; }
        else if (deg > 20) { ownSign = "Yes"; dignityRank = "Own Sign"; }
      } else if (signIdx === 2) { // Gemini
        ownSign = "Yes";
        dignityRank = "Own Sign";
      }
    } else if (pName === "Jupiter") {
      if (signIdx === 8) { // Sagittarius
        if (deg <= 10) { moolatrikona = "Yes"; dignityRank = "Moolatrikona"; }
        else { ownSign = "Yes"; dignityRank = "Own Sign"; }
      } else if (signIdx === 11) { // Pisces
        ownSign = "Yes";
        dignityRank = "Own Sign";
      }
    } else if (pName === "Venus") {
      if (signIdx === 6) { // Libra
        if (deg <= 15) { moolatrikona = "Yes"; dignityRank = "Moolatrikona"; }
        else { ownSign = "Yes"; dignityRank = "Own Sign"; }
      } else if (signIdx === 1) { // Taurus
        ownSign = "Yes";
        dignityRank = "Own Sign";
      }
    } else if (pName === "Saturn") {
      if (signIdx === 10) { // Aquarius
        if (deg <= 20) { moolatrikona = "Yes"; dignityRank = "Moolatrikona"; }
        else { ownSign = "Yes"; dignityRank = "Own Sign"; }
      } else if (signIdx === 9) { // Capricorn
        ownSign = "Yes";
        dignityRank = "Own Sign";
      }
    } else if (pName === "Rahu") {
      if (signIdx === 10) { // Aquarius (Co-ruled)
        ownSign = "Yes";
        dignityRank = "Own Sign";
      } else if (signIdx === 5) { // Virgo (Moolatrikona)
        moolatrikona = "Yes";
        dignityRank = "Moolatrikona";
      }
    } else if (pName === "Ketu") {
      if (signIdx === 7) { // Scorpio (Co-ruled)
        ownSign = "Yes";
        dignityRank = "Own Sign";
      } else if (signIdx === 11) { // Pisces (Moolatrikona)
        moolatrikona = "Yes";
        dignityRank = "Moolatrikona";
      }
    }
  }

  // Natural relationships if not Own, Moolatrikona, Exalted, Debilitated
  if (exalted === "No" && debilitated === "No" && ownSign === "No" && moolatrikona === "No") {
    const signLord = SIGN_LORDS[signIdx];
    const rels = RELATIONSHIPS[pName];
    if (rels) {
      if (rels.friends.includes(signLord)) {
        friendlySign = "Yes";
        dignityRank = "Friendly Sign";
      } else if (rels.enemies.includes(signLord)) {
        enemySign = "Yes";
        dignityRank = "Inimical Sign";
      } else {
        neutralSign = "Yes";
        dignityRank = "Neutral Sign";
      }
    }
  }

  return {
    ownSign,
    moolatrikona,
    exalted,
    debilitated,
    exaltationDegree: exaltStr,
    debilitationDegree: debilStr,
    friendlySign,
    enemySign,
    neutralSign,
    neechaBhanga,
    dignityRank
  };
}
