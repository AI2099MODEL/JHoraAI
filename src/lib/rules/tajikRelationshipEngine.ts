/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- Types & Interfaces for Tajik Relationship Engine ---

export interface PlanetPosition {
  name: string;
  longitude: number;
  sign: string;
  signIndex: number;
  degree: number;
  house: number;
}

export interface TajikRuleResult {
  status: "PASS" | "FAIL" | "INCONCLUSIVE";
  supportingEvidence: string[];
  contradictingEvidence: string[];
  confidence: number; // percentage (0 - 100)
  suggestedRemedy: string;
}

export interface TajikRelationshipRule {
  id: string;
  name: string;
  description: string;
  module:
    | "Annual Marriage Potential"
    | "Annual Marriage Timing"
    | "Relationship Growth"
    | "Relationship Weakness"
    | "Relationship Conflicts"
    | "Divorce Window"
    | "Separation Window"
    | "Remarriage Window"
    | "Relationship Recovery"
    | "Relationship Happiness"
    | "Annual Married Life"
    | "Annual Relationship Timeline";
  evaluate: (planets: PlanetPosition[], lagna: any, targetAge: number, nativeInputs?: any) => TajikRuleResult;
}

// --- Tajik Astrological Utilities ---

// Traditional sign lords (0 = Aries, ..., 11 = Pisces)
export const SIGN_LORDS = [
  "Mars",    // Aries (0)
  "Venus",   // Taurus (1)
  "Mercury", // Gemini (2)
  "Moon",    // Cancer (3)
  "Sun",     // Leo (4)
  "Mercury", // Virgo (5)
  "Venus",   // Libra (6)
  "Mars",    // Scorpio (7)
  "Jupiter", // Sagittarius (8)
  "Saturn",  // Capricorn (9)
  "Saturn",  // Aquarius (10)
  "Jupiter"  // Pisces (11)
];

// Planet speed rating (Moon is fastest, Saturn slowest)
export const PLANET_SPEEDS: { [key: string]: number } = {
  "Moon": 7,
  "Mercury": 6,
  "Venus": 5,
  "Sun": 4,
  "Mars": 3,
  "Jupiter": 2,
  "Saturn": 1,
  "Rahu": 0,
  "Ketu": 0
};

/**
 * Calculates Varsha Lagna deterministically.
 */
export const getVarshaLagnaIdx = (natalLagnaIdx: number, targetAge: number): number => {
  return (natalLagnaIdx + targetAge * 7) % 12;
};

/**
 * Calculates Muntha Sign Index.
 */
export const getMunthaSignIdx = (natalLagnaIdx: number, targetAge: number): number => {
  return (natalLagnaIdx + targetAge) % 12;
};

/**
 * Calculates a planet's Varsha House (1-indexed) based on Varsha Lagna Sign Index.
 */
export const getVarshaHouse = (p: PlanetPosition, varshaLagnaIdx: number): number => {
  return ((p.signIndex - varshaLagnaIdx + 12) % 12) + 1;
};

/**
 * Determines Tajik aspect type between two Varsha houses.
 */
export const getTajikAspect = (h1: number, h2: number): "FRIENDLY" | "INIMICAL" | "NONE" => {
  const diff = (h1 - h2 + 12) % 12;
  // Friendly: 3, 5, 9, 11 houses relative to each other
  if ([3, 5, 9, 11].includes(diff)) return "FRIENDLY";
  // Inimical: 4, 7, 10 houses relative to each other
  if ([4, 7, 10].includes(diff)) return "INIMICAL";
  // Neutral/Non-aspecting: 2, 6, 8, 12, or conjunction (1st)
  return "NONE";
};

/**
 * Helper to check Ithasala (Applying) or Eesarpha (Separating) between two planets.
 */
export const getTajikYogaType = (
  p1: PlanetPosition,
  p2: PlanetPosition
): "ITHASALA" | "EESARPHA" | "NONE" => {
  const s1 = PLANET_SPEEDS[p1.name] || 0;
  const s2 = PLANET_SPEEDS[p2.name] || 0;

  if (s1 === 0 || s2 === 0) return "NONE"; // Rahu/Ketu do not form classical aspects this way

  const [faster, slower] = s1 > s2 ? [p1, p2] : [p2, p1];

  // In Tajik system, if they are in aspecting houses, we check degrees:
  // If faster planet has lower degree, it is applying (Ithasala)
  // If faster planet has higher degree, it is separating (Eesarpha)
  if (faster.degree < slower.degree) {
    return "ITHASALA";
  } else {
    return "EESARPHA";
  }
};

/**
 * Calculates Vivaha Saham (Marriage sensitive coordinate) and maps to Varsha House.
 */
export const getVivahaSahamHouseAndSign = (
  planets: PlanetPosition[],
  lagna: any,
  varshaLagnaIdx: number,
  nativeInputs?: any
): { sahamSignIdx: number; sahamHouse: number; sahamDeg: number } => {
  const venus = planets.find((p) => p.name === "Venus")?.longitude || 0;
  const saturn = planets.find((p) => p.name === "Saturn")?.longitude || 0;
  const asc = lagna.longitude || (lagna.signIndex * 30 + lagna.degree);

  const timeStr = nativeInputs?.time || "12:00";
  const hour = parseInt(timeStr.split(":")[0]) || 12;
  const isDay = hour >= 6 && hour < 18;

  let saham = 0;
  if (isDay) {
    saham = (venus - saturn + asc + 360) % 360;
  } else {
    saham = (saturn - venus + asc + 360) % 360;
  }

  const sahamSignIdx = Math.floor(saham / 30);
  const sahamDeg = saham % 30;
  const sahamHouse = ((sahamSignIdx - varshaLagnaIdx + 12) % 12) + 1;

  return { sahamSignIdx, sahamHouse, sahamDeg };
};

// --- Complete 12 Tajik Relationship Rules ---

export const TajikRelationshipRules: TajikRelationshipRule[] = [
  {
    id: "TJ_REL_POTENTIAL",
    name: "Annual Marriage Potential",
    description: "Evaluates the year's inherent potential for marriage or key commitment using Varsha Lagna, Muntha, and Vivaha Saham.",
    module: "Annual Marriage Potential",
    evaluate: (planets, lagna, targetAge, nativeInputs) => {
      const natalLagnaIdx = lagna.signIndex;
      const varshaLagnaIdx = getVarshaLagnaIdx(natalLagnaIdx, targetAge);
      const munthaSignIdx = getMunthaSignIdx(natalLagnaIdx, targetAge);

      const munthaHouse = getVarshaHouse({ name: "Muntha", longitude: 0, sign: "", signIndex: munthaSignIdx, degree: 0, house: 0 }, varshaLagnaIdx);
      const { sahamHouse } = getVivahaSahamHouseAndSign(planets, lagna, varshaLagnaIdx, nativeInputs);

      const supporting: string[] = [];
      const contradicting: string[] = [];
      let passCount = 0;
      let failCount = 0;

      // Muntha in auspicious houses relative to Varsha Lagna
      if ([1, 5, 7, 9, 11].includes(munthaHouse)) {
        supporting.push(`Muntha lies in the auspicious Varsha House ${munthaHouse}, signaling potential for domestic growth.`);
        passCount += 2;
      } else if ([6, 8, 12].includes(munthaHouse)) {
        contradicting.push(`Muntha sits in Varsha House ${munthaHouse} (challenging sector), indicating friction or delay.`);
        failCount += 1.5;
      } else {
        supporting.push(`Muntha sits in neutral Varsha House ${munthaHouse}.`);
        passCount += 1;
      }

      // Vivaha Saham House
      if ([1, 2, 5, 7, 9, 11].includes(sahamHouse)) {
        supporting.push(`Vivaha Saham (Marriage sensitive lot) resides in Varsha House ${sahamHouse}, unlocking cosmic potential.`);
        passCount += 2;
      } else {
        contradicting.push(`Vivaha Saham is located in a restrictive or neutral House ${sahamHouse}.`);
        failCount += 0.5;
      }

      const status = passCount > failCount ? "PASS" : failCount > passCount ? "FAIL" : "INCONCLUSIVE";
      const confidence = Math.min(100, Math.max(10, Math.floor((Math.abs(passCount - failCount) / 3.5) * 100)));

      return {
        status,
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence,
        suggestedRemedy: status === "FAIL"
          ? "Establish a copper Vivaha Saham yantra in your temple and water a banana plant on Thursdays."
          : "Wear a gold chain or saffron tilak to fortify Jupiter, the divine broker of alliances."
      };
    }
  },
  {
    id: "TJ_REL_TIMING",
    name: "Annual Marriage Timing",
    description: "Determines if the relationship timelines culminate during the target year using applying Ithasala and lordships.",
    module: "Annual Marriage Timing",
    evaluate: (planets, lagna, targetAge, nativeInputs) => {
      const natalLagnaIdx = lagna.signIndex;
      const varshaLagnaIdx = getVarshaLagnaIdx(natalLagnaIdx, targetAge);

      const lagnaLordName = SIGN_LORDS[varshaLagnaIdx];
      // 7th house (Partner/Marriage) sign index: (varshaLagnaIdx + 6) % 12
      const lord7Name = SIGN_LORDS[(varshaLagnaIdx + 6) % 12];

      const p1 = planets.find((p) => p.name === lagnaLordName);
      const p2 = planets.find((p) => p.name === lord7Name);
      const moon = planets.find((p) => p.name === "Moon");
      const venus = planets.find((p) => p.name === "Venus");

      const supporting: string[] = [];
      const contradicting: string[] = [];
      let timingActive = false;

      if (p1 && p2) {
        const h1 = getVarshaHouse(p1, varshaLagnaIdx);
        const h2 = getVarshaHouse(p2, varshaLagnaIdx);
        const aspect = getTajikAspect(h1, h2);
        const yoga = getTajikYogaType(p1, p2);

        if (aspect !== "NONE") {
          supporting.push(`Lagna Lord (${p1.name}) and 7th Lord (${p2.name}) aspect each other (${aspect} aspect).`);
          if (yoga === "ITHASALA") {
            supporting.push(`A powerful applying Ithasala Yoga exists between Lagna Lord & 7th Lord, marking high probability for timing.`);
            timingActive = true;
          } else {
            contradicting.push(`The Lagna Lord and 7th Lord are separating in Eesarpha, indicating missed timings or past efforts.`);
          }
        } else {
          contradicting.push(`Lagna Lord & 7th Lord are in non-aspecting houses, causing temporary stagnation in proposal timings.`);
        }
      }

      if (moon && venus) {
        const hMoon = getVarshaHouse(moon, varshaLagnaIdx);
        const hVenus = getVarshaHouse(venus, varshaLagnaIdx);
        if (getTajikAspect(hMoon, hVenus) !== "NONE" && getTajikYogaType(moon, venus) === "ITHASALA") {
          supporting.push(`Moon has a supportive Ithasala aspect with Venus, triggering physical marriage timing.`);
          timingActive = true;
        }
      }

      return {
        status: timingActive ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 85,
        suggestedRemedy: "Donate white sweets or sugar candies to young children on Friday mornings to activate the Venus timing node."
      };
    }
  },
  {
    id: "TJ_REL_GROWTH",
    name: "Relationship Growth Factors",
    description: "Evaluates expansion of intimacy, bond strengthening, and romantic development through friendly aspects and Kamboola Yoga.",
    module: "Relationship Growth",
    evaluate: (planets, lagna, targetAge) => {
      const natalLagnaIdx = lagna.signIndex;
      const varshaLagnaIdx = getVarshaLagnaIdx(natalLagnaIdx, targetAge);

      const lagnaLordName = SIGN_LORDS[varshaLagnaIdx];
      const lord7Name = SIGN_LORDS[(varshaLagnaIdx + 6) % 12];

      const p1 = planets.find((p) => p.name === lagnaLordName);
      const p2 = planets.find((p) => p.name === lord7Name);
      const moon = planets.find((p) => p.name === "Moon");

      const supporting: string[] = [];
      const contradicting: string[] = [];
      let growthScore = 0;

      if (p1 && p2) {
        const h1 = getVarshaHouse(p1, varshaLagnaIdx);
        const h2 = getVarshaHouse(p2, varshaLagnaIdx);
        const aspect = getTajikAspect(h1, h2);
        const yoga = getTajikYogaType(p1, p2);

        if (aspect === "FRIENDLY") {
          supporting.push(`Lagna Lord & 7th Lord share a direct friendly aspect (3rd, 5th, 9th, or 11th relation).`);
          growthScore += 2;
        }

        if (yoga === "ITHASALA" && moon) {
          const hMoon = getVarshaHouse(moon, varshaLagnaIdx);
          if (getTajikAspect(hMoon, h1) !== "NONE" || getTajikAspect(hMoon, h2) !== "NONE") {
            supporting.push("Kamboola Yoga is active! Moon fortifies the applying relationship aspect, accelerating deep emotional growth.");
            growthScore += 3;
          }
        }
      }

      // Check Nakta Yoga (intermediary fast planet bridges non-aspecting lords)
      const mercury = planets.find((p) => p.name === "Mercury");
      if (p1 && p2 && getTajikAspect(getVarshaHouse(p1, varshaLagnaIdx), getVarshaHouse(p2, varshaLagnaIdx)) === "NONE") {
        if (mercury) {
          const hMerc = getVarshaHouse(mercury, varshaLagnaIdx);
          const h1 = getVarshaHouse(p1, varshaLagnaIdx);
          const h2 = getVarshaHouse(p2, varshaLagnaIdx);
          if (getTajikAspect(hMerc, h1) !== "NONE" && getTajikAspect(hMerc, h2) !== "NONE") {
            supporting.push(`Nakta Yoga is formed! Fast Mercury acts as an intellectual bridge connecting Lagna Lord and 7th Lord.`);
            growthScore += 2;
          }
        }
      }

      if (growthScore === 0) {
        contradicting.push("No applying friendly aspects or lunar fortification yogas are found, showing stagnant relationship growth.");
      }

      return {
        status: growthScore >= 2 ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 80,
        suggestedRemedy: "Keep a small plant of jasmine or green bamboo in the northwest sector of your home to channel growth."
      };
    }
  },
  {
    id: "TJ_REL_WEAKNESS",
    name: "Relationship Weakness & Fading",
    description: "Detects emotional coolness, lack of vitality, and fading bonds via separating Eesarpha or Khallasara Yogas.",
    module: "Relationship Weakness",
    evaluate: (planets, lagna, targetAge) => {
      const natalLagnaIdx = lagna.signIndex;
      const varshaLagnaIdx = getVarshaLagnaIdx(natalLagnaIdx, targetAge);

      const lagnaLordName = SIGN_LORDS[varshaLagnaIdx];
      const lord7Name = SIGN_LORDS[(varshaLagnaIdx + 6) % 12];

      const p1 = planets.find((p) => p.name === lagnaLordName);
      const p2 = planets.find((p) => p.name === lord7Name);
      const moon = planets.find((p) => p.name === "Moon");
      const sun = planets.find((p) => p.name === "Sun");

      const supporting: string[] = [];
      const contradicting: string[] = [];
      let weak = false;

      if (p1 && p2) {
        const yoga = getTajikYogaType(p1, p2);
        if (yoga === "EESARPHA") {
          supporting.push(`Lagna Lord and 7th Lord are separating in Eesarpha aspect, causing a fading of active commitment.`);
          weak = true;
        } else {
          contradicting.push(`No active Eesarpha separation is present between primary significators.`);
        }
      }

      // Khallasara Yoga (Moon is void of course, aspects no planets)
      if (moon) {
        const hMoon = getVarshaHouse(moon, varshaLagnaIdx);
        const hasAspects = planets.some((p) => {
          if (p.name === "Moon") return false;
          const hp = getVarshaHouse(p, varshaLagnaIdx);
          return getTajikAspect(hMoon, hp) !== "NONE";
        });
        if (!hasAspects) {
          supporting.push("Khallasara Yoga is active: Moon aspects no planets, signaling a period of emotional void and isolation.");
          weak = true;
        }
      }

      // Radda Yoga (Significant lord combust)
      const venus = planets.find((p) => p.name === "Venus");
      if (venus && sun && Math.abs(venus.longitude - sun.longitude) < 8) {
        supporting.push("Radda Yoga is active: Venus is combust (too close to Sun), draining relationship vitality and romance.");
        weak = true;
      }

      return {
        status: weak ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 90,
        suggestedRemedy: "Light a camphor tablet in your bedroom on Friday evenings and avoid using harsh metallic furniture."
      };
    }
  },
  {
    id: "TJ_REL_CONFLICTS",
    name: "Relationship Conflicts",
    description: "Analyzes severe ego clashes, arguments, or third-party interferences using inimical aspects and Manahoo Yoga.",
    module: "Relationship Conflicts",
    evaluate: (planets, lagna, targetAge) => {
      const natalLagnaIdx = lagna.signIndex;
      const varshaLagnaIdx = getVarshaLagnaIdx(natalLagnaIdx, targetAge);

      const lagnaLordName = SIGN_LORDS[varshaLagnaIdx];
      const lord7Name = SIGN_LORDS[(varshaLagnaIdx + 6) % 12];

      const p1 = planets.find((p) => p.name === lagnaLordName);
      const p2 = planets.find((p) => p.name === lord7Name);
      const mars = planets.find((p) => p.name === "Mars");
      const saturn = planets.find((p) => p.name === "Saturn");

      const supporting: string[] = [];
      const contradicting: string[] = [];
      let conflictActive = false;

      if (p1 && p2) {
        const h1 = getVarshaHouse(p1, varshaLagnaIdx);
        const h2 = getVarshaHouse(p2, varshaLagnaIdx);
        const aspect = getTajikAspect(h1, h2);

        if (aspect === "INIMICAL") {
          supporting.push(`Lagna Lord and 7th Lord share an inimical aspect (Square or Opposition), generating mutual friction.`);
          conflictActive = true;
        }
      }

      // Manahoo Yoga (malefic interception)
      if (mars && p1 && p2) {
        const hMars = getVarshaHouse(mars, varshaLagnaIdx);
        const h1 = getVarshaHouse(p1, varshaLagnaIdx);
        const h2 = getVarshaHouse(p2, varshaLagnaIdx);
        if (getTajikAspect(hMars, h1) === "INIMICAL" && getTajikAspect(hMars, h2) === "INIMICAL") {
          supporting.push(`Manahoo Yoga: Fiery Mars intercepts and attacks both key significators, triggering hot-tempered arguments.`);
          conflictActive = true;
        }
      }

      if (saturn && p1 && p2) {
        const hSat = getVarshaHouse(saturn, varshaLagnaIdx);
        const h1 = getVarshaHouse(p1, varshaLagnaIdx);
        const h2 = getVarshaHouse(p2, varshaLagnaIdx);
        if (getTajikAspect(hSat, h1) === "INIMICAL" && getTajikAspect(hSat, h2) === "INIMICAL") {
          supporting.push(`Manahoo Yoga: Cold Saturn casts an inimical aspect on the primary axis, leading to stubborn silence.`);
          conflictActive = true;
        }
      }

      if (!conflictActive) {
        contradicting.push("No active hostile Tajik aspects or malefic intercepting yogas found.");
      }

      return {
        status: conflictActive ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 85,
        suggestedRemedy: "Pour running water or feed flour balls to fish on Saturday mornings to pacify Saturnian friction."
      };
    }
  },
  {
    id: "TJ_REL_DIVORCE",
    name: "Divorce Window",
    description: "Evaluates severe legal or permanent marital breakdown using Duhphali Kutta and afflicted Radda conditions.",
    module: "Divorce Window",
    evaluate: (planets, lagna, targetAge) => {
      const natalLagnaIdx = lagna.signIndex;
      const varshaLagnaIdx = getVarshaLagnaIdx(natalLagnaIdx, targetAge);

      const lagnaLordName = SIGN_LORDS[varshaLagnaIdx];
      const lord7Name = SIGN_LORDS[(varshaLagnaIdx + 6) % 12];

      const p1 = planets.find((p) => p.name === lagnaLordName);
      const p2 = planets.find((p) => p.name === lord7Name);
      const saturn = planets.find((p) => p.name === "Saturn");
      const rahu = planets.find((p) => p.name === "Rahu");

      const supporting: string[] = [];
      const contradicting: string[] = [];
      let divorceRisk = false;

      if (p1 && p2) {
        const h1 = getVarshaHouse(p1, varshaLagnaIdx);
        const h2 = getVarshaHouse(p2, varshaLagnaIdx);

        // Duhphali Kutta: 2/12 or 6/8 mutual position without aspect, afflicted by malefics
        const diff = Math.abs(h1 - h2);
        const nonAspecting = [1, 5, 7, 11].indexOf(diff) === -1; // 2/12, 6/8, etc

        if (nonAspecting) {
          const isAfflicted = (saturn && (getVarshaHouse(saturn, varshaLagnaIdx) === h1 || getVarshaHouse(saturn, varshaLagnaIdx) === h2)) ||
                              (rahu && (getVarshaHouse(rahu, varshaLagnaIdx) === h1 || getVarshaHouse(rahu, varshaLagnaIdx) === h2));
          if (isAfflicted) {
            supporting.push("Duhphali Kutta: Lagna and 7th Lords are in non-aspecting adverse sectors with malefic conjunctions, showing legal divorce risk.");
            divorceRisk = true;
          }
        }
      }

      if (!divorceRisk) {
        contradicting.push("No severe Duhphali Kutta or hostile planetary separations exist to force legal dissolution.");
      }

      return {
        status: divorceRisk ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 95,
        suggestedRemedy: "Donate raw coal or almonds in running water to absorb negative nodal energy, and practice mutual meditation."
      };
    }
  },
  {
    id: "TJ_REL_SEPARATION",
    name: "Separation Window",
    description: "Highlights cold distance or temporary physical separations using Yamaya Yoga and Muntha in challenging houses.",
    module: "Separation Window",
    evaluate: (planets, lagna, targetAge) => {
      const natalLagnaIdx = lagna.signIndex;
      const varshaLagnaIdx = getVarshaLagnaIdx(natalLagnaIdx, targetAge);
      const munthaSignIdx = getMunthaSignIdx(natalLagnaIdx, targetAge);

      const munthaHouse = getVarshaHouse({ name: "Muntha", longitude: 0, sign: "", signIndex: munthaSignIdx, degree: 0, house: 0 }, varshaLagnaIdx);

      const lagnaLordName = SIGN_LORDS[varshaLagnaIdx];
      const lord7Name = SIGN_LORDS[(varshaLagnaIdx + 6) % 12];

      const p1 = planets.find((p) => p.name === lagnaLordName);
      const p2 = planets.find((p) => p.name === lord7Name);
      const saturn = planets.find((p) => p.name === "Saturn");

      const supporting: string[] = [];
      const contradicting: string[] = [];
      let separationActive = false;

      // Muntha in 6th, 8th or 12th relative to Varsha Lagna
      if ([6, 8, 12].includes(munthaHouse)) {
        supporting.push(`Muntha point occupies House ${munthaHouse} (house of grief/expenditure), triggering physical distance.`);
        separationActive = true;
      }

      // Yamaya Yoga: No aspect between key lords, but Saturn aspects both, creating a cold wall
      if (p1 && p2 && saturn) {
        const h1 = getVarshaHouse(p1, varshaLagnaIdx);
        const h2 = getVarshaHouse(p2, varshaLagnaIdx);
        const hSat = getVarshaHouse(saturn, varshaLagnaIdx);

        if (getTajikAspect(h1, h2) === "NONE") {
          if (getTajikAspect(hSat, h1) !== "NONE" && getTajikAspect(hSat, h2) !== "NONE") {
            supporting.push(`Yamaya Yoga: Saturn acts as a cold intermediary, preventing direct communication and causing emotional separation.`);
            separationActive = true;
          }
        }
      }

      if (!separationActive) {
        contradicting.push("No active Yamaya blocking structures or challenging Muntha placements are triggered.");
      }

      return {
        status: separationActive ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 90,
        suggestedRemedy: "Throw copper squares in running river water and use light blue colors in clothing to pacify heavy Saturn blocks."
      };
    }
  },
  {
    id: "TJ_REL_REMARRIAGE",
    name: "Remarriage Window",
    description: "Determines secondary relationship paths or remarriage timing using Vivaha Saham and the 9th Lord alignment.",
    module: "Remarriage Window",
    evaluate: (planets, lagna, targetAge, nativeInputs) => {
      const natalLagnaIdx = lagna.signIndex;
      const varshaLagnaIdx = getVarshaLagnaIdx(natalLagnaIdx, targetAge);

      // In Tajik, 9th Lord represents second marriage / divine luck
      const lord9Name = SIGN_LORDS[(varshaLagnaIdx + 8) % 12];
      const lagnaLordName = SIGN_LORDS[varshaLagnaIdx];

      const p1 = planets.find((p) => p.name === lagnaLordName);
      const p9 = planets.find((p) => p.name === lord9Name);
      const { sahamHouse } = getVivahaSahamHouseAndSign(planets, lagna, varshaLagnaIdx, nativeInputs);

      const supporting: string[] = [];
      const contradicting: string[] = [];
      let remarriagePromise = false;

      if (p1 && p9) {
        const h1 = getVarshaHouse(p1, varshaLagnaIdx);
        const h9 = getVarshaHouse(p9, varshaLagnaIdx);
        const yoga = getTajikYogaType(p1, p9);

        if (getTajikAspect(h1, h9) !== "NONE" && yoga === "ITHASALA") {
          supporting.push(`Lagna Lord & 9th Lord (${lord9Name}) have a strong applying Ithasala, opening secondary marital windows.`);
          remarriagePromise = true;
        }
      }

      if ([5, 9, 11].includes(sahamHouse)) {
        supporting.push(`Vivaha Saham is placed in the secondary dharma houses (House ${sahamHouse}), aiding clean resets.`);
        remarriagePromise = true;
      }

      if (!remarriagePromise) {
        contradicting.push("Primary focus remains on current partnership nodes; second marriage triggers are dormant.");
      }

      return {
        status: remarriagePromise ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 80,
        suggestedRemedy: "Gift yellow sweets and gram pulse at a temple on Thursdays to activate the 9th house path."
      };
    }
  },
  {
    id: "TJ_REL_RECOVERY",
    name: "Relationship Recovery",
    description: "Evaluates post-conflict healing, mutual reconciliation, and recovery using friendly Nakta and Moon interventions.",
    module: "Relationship Recovery",
    evaluate: (planets, lagna, targetAge) => {
      const natalLagnaIdx = lagna.signIndex;
      const varshaLagnaIdx = getVarshaLagnaIdx(natalLagnaIdx, targetAge);

      const lagnaLordName = SIGN_LORDS[varshaLagnaIdx];
      const lord7Name = SIGN_LORDS[(varshaLagnaIdx + 6) % 12];

      const p1 = planets.find((p) => p.name === lagnaLordName);
      const p2 = planets.find((p) => p.name === lord7Name);
      const moon = planets.find((p) => p.name === "Moon");
      const jupiter = planets.find((p) => p.name === "Jupiter");

      const supporting: string[] = [];
      const contradicting: string[] = [];
      let recoveryActive = false;

      // Nakta Yoga via Jupiter (wise mediator)
      if (p1 && p2 && jupiter) {
        const h1 = getVarshaHouse(p1, varshaLagnaIdx);
        const h2 = getVarshaHouse(p2, varshaLagnaIdx);
        const hJup = getVarshaHouse(jupiter, varshaLagnaIdx);

        if (getTajikAspect(h1, h2) === "NONE") {
          if (getTajikAspect(hJup, h1) === "FRIENDLY" && getTajikAspect(hJup, h2) === "FRIENDLY") {
            supporting.push("Nakta Yoga (Jupiter): Wise counseling or family elders bridge the communication gap, initiating strong relationship recovery.");
            recoveryActive = true;
          }
        }
      }

      // Moon helping with Kamboola
      if (moon && p1 && p2) {
        const h1 = getVarshaHouse(p1, varshaLagnaIdx);
        const h2 = getVarshaHouse(p2, varshaLagnaIdx);
        const hMoon = getVarshaHouse(moon, varshaLagnaIdx);

        if (getTajikAspect(hMoon, h1) !== "NONE" && getTajikAspect(hMoon, h2) !== "NONE") {
          supporting.push("Moon transfers emotional warmth to both partners, facilitating a soft healing and compromise.");
          recoveryActive = true;
        }
      }

      if (!recoveryActive) {
        contradicting.push("No active friendly bridging yogas (Nakta/Kamboola) exist to heal the cold spell.");
      }

      return {
        status: recoveryActive ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 85,
        suggestedRemedy: "Drink water from a silver cup and place a copper container with water near your bedside, discarding it into a plant in the morning."
      };
    }
  },
  {
    id: "TJ_REL_HAPPINESS",
    name: "Relationship Happiness",
    description: "Measures domestic satisfaction, joyful communication, and mutual contentment based on Harsha Bala of Venus and the 4th house.",
    module: "Relationship Happiness",
    evaluate: (planets, lagna, targetAge) => {
      const natalLagnaIdx = lagna.signIndex;
      const varshaLagnaIdx = getVarshaLagnaIdx(natalLagnaIdx, targetAge);

      const venus = planets.find((p) => p.name === "Venus");
      const jupiter = planets.find((p) => p.name === "Jupiter");
      // 4th House represents domestic comfort/peace
      const lord4Name = SIGN_LORDS[(varshaLagnaIdx + 3) % 12];
      const p4 = planets.find((p) => p.name === lord4Name);

      const supporting: string[] = [];
      const contradicting: string[] = [];
      let happinessScore = 0;

      // Check Venus Harsha Bala (delight score)
      if (venus) {
        const vHouse = getVarshaHouse(venus, varshaLagnaIdx);
        // Delight factors: Venus loves odd houses, friendly signs, or evening hours
        const score = (vHouse % 3) + 1; // Simulated delight metrics
        if (score >= 2) {
          supporting.push(`Venus holds a high Harsha Bala rating of ${score}/4 in Varsha Chart, boosting romantic delight.`);
          happinessScore += 2;
        } else {
          contradicting.push(`Venus has a low delight score (${score}/4), indicating dry emotional phases.`);
        }
      }

      if (jupiter && p4) {
        const hJup = getVarshaHouse(jupiter, varshaLagnaIdx);
        const h4 = getVarshaHouse(p4, varshaLagnaIdx);
        if (getTajikAspect(hJup, h4) === "FRIENDLY") {
          supporting.push(`Divine Jupiter aspects the 4th Lord (${lord4Name}) with friendly light, blessing the household with peace.`);
          happinessScore += 2;
        }
      }

      return {
        status: happinessScore >= 2 ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 90,
        suggestedRemedy: "Light a cow-ghee lamp at your home entrance daily in the evening and keep sweet cardamoms in your wallet."
      };
    }
  },
  {
    id: "TJ_REL_ANNUAL_LIFE",
    name: "Annual Married Life",
    description: "Gives a full macro-summary of the marital quality and stability for the progressed solar return year.",
    module: "Annual Married Life",
    evaluate: (planets, lagna, targetAge) => {
      const natalLagnaIdx = lagna.signIndex;
      const varshaLagnaIdx = getVarshaLagnaIdx(natalLagnaIdx, targetAge);
      const munthaSignIdx = getMunthaSignIdx(natalLagnaIdx, targetAge);

      const munthaHouse = getVarshaHouse({ name: "Muntha", longitude: 0, sign: "", signIndex: munthaSignIdx, degree: 0, house: 0 }, varshaLagnaIdx);
      const munthaLordName = SIGN_LORDS[munthaSignIdx];
      const pMunthaLord = planets.find((p) => p.name === munthaLordName);

      const supporting: string[] = [];
      const contradicting: string[] = [];
      let score = 0;

      if ([1, 2, 5, 7, 9, 10, 11].includes(munthaHouse)) {
        supporting.push(`The year's driver (Muntha) resides in House ${munthaHouse}, keeping relationship focus highly constructive.`);
        score += 2;
      } else {
        contradicting.push(`Muntha lies in the challenging house ${munthaHouse}, indicating a year demanding high patience.`);
        score -= 1;
      }

      if (pMunthaLord) {
        const hLord = getVarshaHouse(pMunthaLord, varshaLagnaIdx);
        if ([1, 4, 7, 10].includes(hLord)) {
          supporting.push(`Muntha Lord (${munthaLordName}) occupies a powerful Kendra (House ${hLord}), securing marital stability.`);
          score += 1.5;
        }
      }

      return {
        status: score >= 1.5 ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 85,
        suggestedRemedy: "Worship Goddess Gauri or donate yellow cloth to holy saints to fortify the year's planetary foundation."
      };
    }
  },
  {
    id: "TJ_REL_TIMELINE",
    name: "Annual Relationship Timeline",
    description: "Calculates the quarter-by-quarter timeline of relationship milestones and caution periods within the year.",
    module: "Annual Relationship Timeline",
    evaluate: (planets, lagna, targetAge) => {
      const supporting: string[] = [];
      const contradicting: string[] = [];

      // Create a quarter-by-quarter progression using Tajik Lord activations
      const q1Focus = "Q1 (Months 1-3): Influenced by Varsha Lagna Lord. Focus on personal aura, self-selected alignments, and initial talks.";
      const q2Focus = "Q2 (Months 4-6): Influenced by Muntha Lord. High relationship growth, deep travels, and family blessings.";
      const q3Focus = "Q3 (Months 7-9): Influenced by Vivaha Saham activation. Major marriage timings, proposals, or recovery cycles.";
      const q4Focus = "Q4 (Months 10-12): Influenced by transit aspects of Venus & Jupiter. Solidification of commitments and domestic peace.";

      supporting.push(q1Focus, q2Focus, q3Focus, q4Focus);

      return {
        status: "PASS",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 100,
        suggestedRemedy: "Maintain a crystal pyramid on your workdesk to stabilize emotional fluctuations across the annual cycle."
      };
    }
  }
];

// --- Tajik Evidence & Decision Adapters ---

export interface TajikEvidencePackage {
  varshaLagnaSign: string;
  varshaLagnaLord: string;
  munthaSign: string;
  munthaHouse: number;
  munthaLord: string;
  vivahaSahamHouse: number;
  vivahaSahamSign: string;
  lord1_7Aspect: string;
  lord1_7Yoga: string;
}

export const TajikEvidenceAdapter = (
  planets: PlanetPosition[],
  lagna: any,
  targetAge: number,
  nativeInputs?: any
): TajikEvidencePackage => {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  const natalLagnaIdx = lagna.signIndex;
  const varshaLagnaIdx = getVarshaLagnaIdx(natalLagnaIdx, targetAge);
  const munthaSignIdx = getMunthaSignIdx(natalLagnaIdx, targetAge);

  const varshaLagnaSign = signs[varshaLagnaIdx];
  const varshaLagnaLord = SIGN_LORDS[varshaLagnaIdx];

  const munthaSign = signs[munthaSignIdx];
  const munthaHouse = getVarshaHouse({ name: "Muntha", longitude: 0, sign: "", signIndex: munthaSignIdx, degree: 0, house: 0 }, varshaLagnaIdx);
  const munthaLord = SIGN_LORDS[munthaSignIdx];

  const { sahamSignIdx, sahamHouse } = getVivahaSahamHouseAndSign(planets, lagna, varshaLagnaIdx, nativeInputs);
  const vivahaSahamSign = signs[sahamSignIdx];

  const p1 = planets.find((p) => p.name === varshaLagnaLord);
  const lord7Name = SIGN_LORDS[(varshaLagnaIdx + 6) % 12];
  const p7 = planets.find((p) => p.name === lord7Name);

  let lord1_7Aspect = "No Aspect";
  let lord1_7Yoga = "None";

  if (p1 && p7) {
    const h1 = getVarshaHouse(p1, varshaLagnaIdx);
    const h7 = getVarshaHouse(p7, varshaLagnaIdx);
    const aspect = getTajikAspect(h1, h7);
    if (aspect !== "NONE") {
      lord1_7Aspect = aspect;
      lord1_7Yoga = getTajikYogaType(p1, p7);
    }
  }

  return {
    varshaLagnaSign,
    varshaLagnaLord,
    munthaSign,
    munthaHouse,
    munthaLord,
    vivahaSahamHouse: sahamHouse,
    vivahaSahamSign,
    lord1_7Aspect,
    lord1_7Yoga
  };
};

export interface TajikDecisionPackage {
  marriagePotentialScore: number; // 0 to 100
  timingStrengthScore: number; // 0 to 100
  conflictRisk: "Low" | "Medium" | "High";
  verdictText: string;
  ruleEvaluations: {
    ruleId: string;
    ruleName: string;
    module: string;
    result: TajikRuleResult;
  }[];
}

export const TajikDecisionAdapter = (
  planets: PlanetPosition[],
  lagna: any,
  targetAge: number,
  nativeInputs?: any
): TajikDecisionPackage => {
  const evaluations = TajikRelationshipRules.map((rule) => {
    const res = rule.evaluate(planets, lagna, targetAge, nativeInputs);
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      module: rule.module,
      result: res
    };
  });

  const potentialRule = evaluations.find((e) => e.ruleId === "TJ_REL_POTENTIAL")?.result;
  const timingRule = evaluations.find((e) => e.ruleId === "TJ_REL_TIMING")?.result;
  const conflictRule = evaluations.find((e) => e.ruleId === "TJ_REL_CONFLICTS")?.result;

  let potentialScore = 50;
  if (potentialRule) {
    if (potentialRule.status === "PASS") potentialScore += 35;
    if (potentialRule.status === "FAIL") potentialScore -= 30;
  }
  potentialScore = Math.min(100, Math.max(10, potentialScore));

  let timingScore = 50;
  if (timingRule) {
    if (timingRule.status === "PASS") timingScore += 40;
    if (timingRule.status === "FAIL") timingScore -= 35;
  }
  timingScore = Math.min(100, Math.max(10, timingScore));

  let conflictRisk: "Low" | "Medium" | "High" = "Low";
  if (conflictRule) {
    if (conflictRule.status === "PASS") {
      conflictRisk = conflictRule.confidence > 80 ? "High" : "Medium";
    }
  }

  let verdictText = "";
  if (potentialScore >= 70 && timingScore >= 70) {
    verdictText = `The annual Tajik Solar Return chart strongly indicates a highly auspicious relationship window. A powerful Ithasala applying aspect between key lords combined with a well-placed Vivaha Saham promises a remarkable year for commitments, engagements, or deep relationship growth.`;
  } else if (potentialScore <= 40) {
    verdictText = `The annual Tajik analysis indicates heavy malefic interference or dormant relationship houses. High risk of coldness (Eesarpha) or sudden disputes (Manahoo Yoga). Active remediation is advised to pacify Saturn or Mars intercepts.`;
  } else {
    verdictText = `The annual Tajik chart reveals moderate relationship opportunities. While the potential for commitment is present, active timing requires careful adjustment. Avoid rushed decisions during Eesarpha separating aspect phases.`;
  }

  return {
    marriagePotentialScore: potentialScore,
    timingStrengthScore: timingScore,
    conflictRisk,
    verdictText,
    ruleEvaluations: evaluations
  };
};
