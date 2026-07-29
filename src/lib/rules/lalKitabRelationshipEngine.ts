/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- Types & Interfaces for Lal Kitab Relationship Engine ---

export interface PlanetPosition {
  name: string;
  longitude: number;
  sign: string;
  signIndex: number;
  degree: number;
  house: number;
}

export interface LalKitabRuleResult {
  status: "PASS" | "FAIL" | "INCONCLUSIVE";
  supportingEvidence: string[];
  contradictingEvidence: string[];
  confidence: number; // percentage (0 - 100)
  suggestedRemedy: string;
}

export interface LalKitabRelationshipRule {
  id: string;
  name: string;
  description: string;
  module:
    | "Marriage Promise"
    | "Marriage Timing"
    | "Marriage Delay"
    | "Marriage Obstacles"
    | "Marriage Denial"
    | "Love Marriage"
    | "Arranged Marriage"
    | "Secret Relationship"
    | "Extra-marital Relationship"
    | "Divorce"
    | "Separation"
    | "Remarriage"
    | "Spouse Nature"
    | "Marriage Happiness"
    | "Relationship Timeline"
    | "Relationship Remedies"
    | "Marriage Remedies";
  evaluate: (planets: PlanetPosition[], lagna: any, userAge: number) => LalKitabRuleResult;
}

// --- Lal Kitab Utility Functions ---

/**
 * In authentic Lal Kitab, Aries is ALWAYS placed in the 1st House.
 * Therefore, a planet's Lal Kitab house is simply its Sign Index + 1.
 */
export const getLKHouse = (p: PlanetPosition): number => {
  return p.signIndex + 1;
};

export const getPlanetLKHouse = (planets: PlanetPosition[], name: string): number => {
  const p = planets.find((pl) => pl.name.toLowerCase() === name.toLowerCase());
  return p ? getLKHouse(p) : 0;
};

export const getPlanetsInLKHouse = (planets: PlanetPosition[], houseNum: number): PlanetPosition[] => {
  return planets.filter((p) => getLKHouse(p) === houseNum);
};

/**
 * Check if a house is dormant (Soye Grah) under Lal Kitab rules.
 * House 7 is dormant if House 1 is empty, and vice versa.
 * House 4 is dormant if House 10 is empty, and vice versa.
 */
export const isHouseDormant = (planets: PlanetPosition[], houseNum: number): boolean => {
  const planetsInHouse = getPlanetsInLKHouse(planets, houseNum);
  if (planetsInHouse.length === 0) return true;

  if (houseNum === 1) return getPlanetsInLKHouse(planets, 7).length === 0;
  if (houseNum === 7) return getPlanetsInLKHouse(planets, 1).length === 0;
  if (houseNum === 4) return getPlanetsInLKHouse(planets, 10).length === 0;
  if (houseNum === 10) return getPlanetsInLKHouse(planets, 4).length === 0;

  return false;
};

// --- Complete 17 Lal Kitab Relationship Rules ---

export const LalKitabRelationshipRules: LalKitabRelationshipRule[] = [
  {
    id: "LK_REL_PROMISE",
    name: "Marriage Promise Evaluation",
    description: "Evaluates the inherent promise of marriage using Lal Kitab Venus positioning and the state of the 7th House.",
    module: "Marriage Promise",
    evaluate: (planets, lagna) => {
      const venusHouse = getPlanetLKHouse(planets, "Venus");
      const jupiterHouse = getPlanetLKHouse(planets, "Jupiter");
      const planetsIn7 = getPlanetsInLKHouse(planets, 7);
      const planetsIn2 = getPlanetsInLKHouse(planets, 2);

      const supporting: string[] = [];
      const contradicting: string[] = [];
      let passCount = 0;
      let failCount = 0;

      // Venus in friendly/own houses is extremely positive
      if ([2, 7, 5, 9, 11, 12].includes(venusHouse)) {
        supporting.push(`Venus is well-placed in Lal Kitab House ${venusHouse} (Pucca Ghar/friendly house).`);
        passCount += 2;
      } else if (venusHouse === 6) {
        contradicting.push("Venus is in House 6, which is traditionally a weak or debilitated sector (Manda Ghar) in Lal Kitab.");
        failCount += 2;
      }

      // 7th House planets evaluation
      if (planetsIn7.length > 0) {
        const names = planetsIn7.map((p) => p.name);
        if (names.some((n) => ["Jupiter", "Venus", "Moon", "Mercury"].includes(n))) {
          supporting.push(`Benefic or friendly planets (${names.join(", ")}) occupy the 7th House, confirming marriage promise.`);
          passCount += 2;
        }
        if (names.some((n) => ["Saturn", "Rahu", "Ketu"].includes(n))) {
          contradicting.push(`Malefic energies (${names.filter((n) => ["Saturn", "Rahu", "Ketu"].includes(n)).join(", ")}) in the 7th House weaken the promise.`);
          failCount += 1.5;
        }
      } else {
        supporting.push("7th House is clean and empty, free from immediate malefic occupancy.");
        passCount += 1;
      }

      // Family expansion (House 2)
      if (planetsIn2.length > 0) {
        const names = planetsIn2.map((p) => p.name);
        if (names.some((n) => ["Jupiter", "Sun", "Moon"].includes(n))) {
          supporting.push(`Auspicious planets in House 2 (${names.join(", ")}) indicate easy family addition and marital bonds.`);
          passCount += 1;
        }
      }

      const status = passCount > failCount ? "PASS" : failCount > passCount + 1 ? "FAIL" : "INCONCLUSIVE";
      const confidence = Math.min(100, Math.max(10, Math.floor((Math.abs(passCount - failCount) / 4) * 100)));

      return {
        status,
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence,
        suggestedRemedy:
          status === "FAIL"
            ? "Donate sweet solid bronze utensils or gold thread in a religious place to strengthen Venus."
            : "Keep a square piece of solid pure silver in your wallet/purse to retain positive Venusian energies."
      };
    }
  },
  {
    id: "LK_REL_TIMING",
    name: "Marriage Timing Progression",
    description: "Determines the most ripe periods and ages for marriage based on Lal Kitab's planetary years.",
    module: "Marriage Timing",
    evaluate: (planets, lagna, userAge) => {
      const venusHouse = getPlanetLKHouse(planets, "Venus");
      const jupiterHouse = getPlanetLKHouse(planets, "Jupiter");
      const moonHouse = getPlanetLKHouse(planets, "Moon");

      const supporting: string[] = [];
      const contradicting: string[] = [];

      // Lal Kitab Age brackets: Venus activates strongly at age 25, Jupiter at 24, Moon at 22, Mars at 28
      const ripeAges = [22, 24, 25, 27, 28, 31, 32];
      const isRipe = ripeAges.includes(userAge) || (userAge >= 24 && userAge <= 29);

      if (isRipe) {
        supporting.push(`Native is currently aged ${userAge}, placing them in the high-probability Lal Kitab relationship activation bracket (ages 24-29).`);
      } else {
        contradicting.push(`Native is aged ${userAge}, which is outside the peak Lal Kitab relationship progression ages (24-29).`);
      }

      if ([2, 7, 12].includes(venusHouse)) {
        supporting.push(`Venus in House ${venusHouse} activates marriage timing prematurely, bringing early alignment.`);
      }
      if ([2, 5, 9, 11].includes(jupiterHouse)) {
        supporting.push(`Jupiter in House ${jupiterHouse} brings parental and traditional blessing timings.`);
      }

      const status = supporting.length >= contradicting.length ? "PASS" : "FAIL";

      return {
        status,
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 85,
        suggestedRemedy: "Pour raw milk and yellow mustard seeds on the roots of a green tree on Thursdays."
      };
    }
  },
  {
    id: "LK_REL_DELAY",
    name: "Marriage Delay Factors",
    description: "Identifies planetary conditions such as dormant houses or malefic placements causing marriage delays.",
    module: "Marriage Delay",
    evaluate: (planets, lagna) => {
      const saturnHouse = getPlanetLKHouse(planets, "Saturn");
      const rahuHouse = getPlanetLKHouse(planets, "Rahu");
      const ketuHouse = getPlanetLKHouse(planets, "Ketu");
      const venusHouse = getPlanetLKHouse(planets, "Venus");

      const supporting: string[] = [];
      const contradicting: string[] = [];

      let hasDelay = false;

      if ([7, 8, 2].includes(saturnHouse)) {
        supporting.push(`Saturn in House ${saturnHouse} acts as a major delaying agent, freezing relationship progresses.`);
        hasDelay = true;
      } else {
        contradicting.push("Saturn is safely positioned away from the marriage axis (2, 7, 8).");
      }

      if ([7, 8].includes(rahuHouse) || [7, 8].includes(ketuHouse)) {
        supporting.push(`Nodal axis (Rahu/Ketu) sitting in House ${rahuHouse || ketuHouse} creates confusion, misunderstandings, and consecutive delays.`);
        hasDelay = true;
      }

      if (isHouseDormant(planets, 7)) {
        supporting.push("The 7th House of Marriage is Dormant (Soye Grah) as House 1 contains no planets to activate it.");
        hasDelay = true;
      } else {
        contradicting.push("7th House is active and aspected, facilitating timely proposals.");
      }

      if (venusHouse === 6) {
        supporting.push("Venus is in House 6, lowering relationship confidence and delaying settling down.");
        hasDelay = true;
      }

      return {
        status: hasDelay ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 90,
        suggestedRemedy: "Wear a jointless pure solid silver ring on the small finger of your left hand to stabilize Venus and counter Saturnian delay."
      };
    }
  },
  {
    id: "LK_REL_OBSTACLES",
    name: "Marriage Obstacles & Afflictions",
    description: "Analyzes combinations causing friction, disputes, and sudden obstacles during matchmaking.",
    module: "Marriage Obstacles",
    evaluate: (planets, lagna) => {
      const mercuryHouse = getPlanetLKHouse(planets, "Mercury");
      const sunHouse = getPlanetLKHouse(planets, "Sun");
      const saturnHouse = getPlanetLKHouse(planets, "Saturn");
      const marsHouse = getPlanetLKHouse(planets, "Mars");

      const supporting: string[] = [];
      const contradicting: string[] = [];

      let hasObstacles = false;

      // Mercury in House 8 (severe Lal Kitab obstacle indicator)
      if (mercuryHouse === 8) {
        supporting.push("Mercury resides in House 8. Lal Kitab calls this 'sterile tongue' which causes speech misunderstandings and breaks engagements.");
        hasObstacles = true;
      }

      // Sun and Saturn conjunction or mutual aspect in House 7/8
      if (sunHouse === saturnHouse && [7, 8, 2].includes(sunHouse)) {
        supporting.push(`Sun and Saturn are conjunct in House ${sunHouse}. This represents fire and ice together, causing immense hurdles.`);
        hasObstacles = true;
      }

      // Mars in House 4 (Mangal Dharmi/Teeth of Mars)
      if (marsHouse === 4 || marsHouse === 8) {
        supporting.push(`Mars sits in House ${marsHouse}, indicating aggressive temperaments (Mangal Dharmi) creating sudden roadblocks in alliance talks.`);
        hasObstacles = true;
      } else {
        contradicting.push("Mars is pacified and occupies a balanced house, reducing angry flare-ups.");
      }

      return {
        status: hasObstacles ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 80,
        suggestedRemedy: "Feed sweet wheat breads (meethi roti) cooked in an earthen tandoor to red stray dogs."
      };
    }
  },
  {
    id: "LK_REL_DENIAL",
    name: "Marriage Denial Indicators",
    description: "Inspects rare and critical planetary configurations that might point to a denial of marriage.",
    module: "Marriage Denial",
    evaluate: (planets, lagna) => {
      const venusHouse = getPlanetLKHouse(planets, "Venus");
      const ketuHouse = getPlanetLKHouse(planets, "Ketu");
      const sunHouse = getPlanetLKHouse(planets, "Sun");
      const planetsIn7 = getPlanetsInLKHouse(planets, 7);

      const supporting: string[] = [];
      const contradicting: string[] = [];

      // Denial occurs in Lal Kitab if Venus is completely destroyed (e.g. Venus in 6 conjunct Ketu, with 7th house heavily afflicted or vacant)
      const isVenusAfflictedIn6 = venusHouse === 6 && ketuHouse === 6;
      const is7thCompletelyRuined = planetsIn7.some((p) => ["Saturn", "Rahu"].includes(p.name)) && sunHouse === 7;

      if (isVenusAfflictedIn6 && planetsIn7.length === 0) {
        supporting.push("Venus is extremely weak in House 6 conjunct Ketu with an empty 7th house, showing high denial risk.");
      } else {
        contradicting.push("Venus has functional strength and support, ruling out marriage denial.");
      }

      const status = isVenusAfflictedIn6 ? "PASS" : "FAIL";

      return {
        status,
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 95,
        suggestedRemedy: "Donate a cow, or feed fresh green grass to black cows daily to revive Venusian energies."
      };
    }
  },
  {
    id: "LK_REL_LOVE",
    name: "Love Marriage Propensity",
    description: "Evaluates the drive for self-selected partnerships and romantic love unions.",
    module: "Love Marriage",
    evaluate: (planets, lagna) => {
      const venusHouse = getPlanetLKHouse(planets, "Venus");
      const moonHouse = getPlanetLKHouse(planets, "Moon");
      const rahuHouse = getPlanetLKHouse(planets, "Rahu");
      const mercuryHouse = getPlanetLKHouse(planets, "Mercury");

      const supporting: string[] = [];
      const contradicting: string[] = [];

      let score = 0;

      // Venus and Moon link (emotion and romance)
      if (Math.abs(venusHouse - moonHouse) <= 1 || venusHouse === moonHouse) {
        supporting.push("Venus and Moon are closely aligned, combining emotional depth with physical attraction.");
        score += 2;
      }

      // Rahu in House 5 or 7 (breaks social norms, indicating self-chosen love union)
      if ([5, 7].includes(rahuHouse)) {
        supporting.push(`Rahu is in House ${rahuHouse}, fueling an intense desire for modern, unconventional, or self-selected love marriage.`);
        score += 2;
      }

      // Venus and Mercury in House 5 or 7 (flirtation and friendship turning to marriage)
      if ([5, 7].includes(venusHouse) && [5, 7].includes(mercuryHouse)) {
        supporting.push("Venus and Mercury occupy the key romance-partnership houses (5 & 7).");
        score += 1.5;
      }

      if (score === 0) {
        contradicting.push("Planetary positions show traditional, stable placements favoring family guidance rather than spontaneous romance.");
      }

      return {
        status: score >= 2 ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 85,
        suggestedRemedy: "Keep a small pair of silver ducks in your bedroom to manifest and secure love vibrations."
      };
    }
  },
  {
    id: "LK_REL_ARRANGED",
    name: "Arranged Marriage Alignment",
    description: "Assesses family-facilitated marriage prospects and traditional matchmaking support.",
    module: "Arranged Marriage",
    evaluate: (planets, lagna) => {
      const jupiterHouse = getPlanetLKHouse(planets, "Jupiter");
      const sunHouse = getPlanetLKHouse(planets, "Sun");
      const venusHouse = getPlanetLKHouse(planets, "Venus");

      const supporting: string[] = [];
      const contradicting: string[] = [];

      let score = 0;

      // Jupiter in House 2 or 5 or 9 (Elders and destiny houses)
      if ([2, 5, 9].includes(jupiterHouse)) {
        supporting.push(`Jupiter (traditions and elders) sits in House ${jupiterHouse}, indicating high family involvement in marriage.`);
        score += 2;
      }

      // Sun (father/family status) in House 2 or 11
      if ([2, 11].includes(sunHouse)) {
        supporting.push(`Sun in House ${sunHouse} guarantees parental consent and status alignment in matchmaking.`);
        score += 1;
      }

      // Venus conjunct Jupiter or aspected by it
      if (Math.abs(venusHouse - jupiterHouse) === 0 || [2, 7].includes(venusHouse) && jupiterHouse === 9) {
        supporting.push("Jupiter and Venus are in mutual friendly reception, supporting classical traditional values.");
        score += 1.5;
      }

      return {
        status: score >= 2 ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 80,
        suggestedRemedy: "Apply saffron (kesar) tilak on your forehead and navel every morning before leaving home."
      };
    }
  },
  {
    id: "LK_REL_SECRET",
    name: "Secret Relationship Propensity",
    description: "Highlights secret romantic interests, hidden infatuations, or private ties.",
    module: "Secret Relationship",
    evaluate: (planets, lagna) => {
      const rahuHouse = getPlanetLKHouse(planets, "Rahu");
      const venusHouse = getPlanetLKHouse(planets, "Venus");
      const ketuHouse = getPlanetLKHouse(planets, "Ketu");

      const supporting: string[] = [];
      const contradicting: string[] = [];

      let hasSecret = false;

      // Rahu in House 5 or 12
      if (rahuHouse === 5) {
        supporting.push("Rahu in House 5 generates secret infatuations, fantasies, and hidden crushes.");
        hasSecret = true;
      }
      if (venusHouse === 12 && rahuHouse === 12) {
        supporting.push("Venus and Rahu are conjunct in House 12 (secret chambers), showing hidden romantic involvements.");
        hasSecret = true;
      }
      if (venusHouse === 8) {
        supporting.push("Venus in House 8 (occult/hidden sector) favors private relationship circles kept away from public sight.");
        hasSecret = true;
      }

      if (!hasSecret) {
        contradicting.push("Venus and Rahu sit in public, transparent houses, minimizing secret associations.");
      }

      return {
        status: hasSecret ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 75,
        suggestedRemedy: "Donate raw barley or coal in running river water on Saturdays to pacify Rahu's secretive desires."
      };
    }
  },
  {
    id: "LK_REL_EXTRA_MARITAL",
    name: "Extra-Marital Tendency",
    description: "Evaluates vulnerable planetary combinations that can create outside attractions after marriage.",
    module: "Extra-marital Relationship",
    evaluate: (planets, lagna) => {
      const venusHouse = getPlanetLKHouse(planets, "Venus");
      const mercuryHouse = getPlanetLKHouse(planets, "Mercury");
      const rahuHouse = getPlanetLKHouse(planets, "Rahu");

      const supporting: string[] = [];
      const contradicting: string[] = [];

      // Conjunction of Venus and Mercury in House 12 (highly flirtatious, double life tendencies)
      const isVenusMercIn12 = venusHouse === 12 && mercuryHouse === 12;
      const isVenusRahuIn7 = venusHouse === 7 && rahuHouse === 7;

      if (isVenusMercIn12) {
        supporting.push("Venus and Mercury reside together in House 12, fueling secondary, double-life romantic inclinations.");
      }
      if (isVenusRahuIn7) {
        supporting.push("Venus and Rahu conjunct in House 7 generate highly unconventional, unquenchable relationship urges.");
      }

      if (!isVenusMercIn12 && !isVenusRahuIn7) {
        contradicting.push("No multi-planetary double-life conjunctions are active in House 7 or 12.");
      }

      const status = isVenusMercIn12 || isVenusRahuIn7 ? "PASS" : "FAIL";

      return {
        status,
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 85,
        suggestedRemedy: "Avoid keeping blue or black bedsheets and electronics directly on the bed."
      };
    }
  },
  {
    id: "LK_REL_DIVORCE",
    name: "Divorce & Legal Dissolution Risk",
    description: "Detects severe hostile planet combinations in House 7 or 8 that could lead to legal separation.",
    module: "Divorce",
    evaluate: (planets, lagna) => {
      const marsHouse = getPlanetLKHouse(planets, "Mars");
      const saturnHouse = getPlanetLKHouse(planets, "Saturn");
      const venusHouse = getPlanetLKHouse(planets, "Venus");
      const ketuHouse = getPlanetLKHouse(planets, "Ketu");

      const supporting: string[] = [];
      const contradicting: string[] = [];

      let risk = false;

      // Conjunction of Mars and Saturn in House 7 (violent collision of energies)
      if (marsHouse === 7 && saturnHouse === 7) {
        supporting.push("Mars (fire/war) and Saturn (ice/stubbornness) are both in House 7. This creates highly explosive marital conflicts.");
        risk = true;
      }

      // Venus in House 8 with Ketu (Ketu slices relationships, House 8 is transition/grief)
      if (venusHouse === 8 && ketuHouse === 8) {
        supporting.push("Venus and Ketu reside in House 8, showing abrupt disruption and legal dissolution of marital cords.");
        risk = true;
      }

      if (!risk) {
        contradicting.push("No hostile planet combinations exist in House 7 or 8 to trigger legal splits.");
      }

      return {
        status: risk ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 90,
        suggestedRemedy: "Feed sweet milk to black dogs and keep sweet water outside your home for travelers."
      };
    }
  },
  {
    id: "LK_REL_SEPARATION",
    name: "Separation & Cold Distance",
    description: "Examines planetary placements causing coldness, emotional distance, or temporary physical separations.",
    module: "Separation",
    evaluate: (planets, lagna) => {
      const sunHouse = getPlanetLKHouse(planets, "Sun");
      const saturnHouse = getPlanetLKHouse(planets, "Saturn");
      const rahuHouse = getPlanetLKHouse(planets, "Rahu");

      const supporting: string[] = [];
      const contradicting: string[] = [];

      let sep = false;

      // Sun in House 7 (Sun burns House 7, causing ego wars and physical distance)
      if (sunHouse === 7) {
        supporting.push("Sun occupies House 7. Lal Kitab rules state that the Sun burns the marital house, creating ego clashes and temporary physical separation.");
        sep = true;
      }

      // Rahu in House 7 with Saturn in House 1 (cold distance)
      if (rahuHouse === 7 && saturnHouse === 1) {
        supporting.push("Rahu in House 7 opposite Saturn in House 1 creates severe misunderstanding and frozen emotional exchanges.");
        sep = true;
      }

      if (!sep) {
        contradicting.push("Sun and Saturn are balanced and do not directly attack the 7th house axis.");
      }

      return {
        status: sep ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 85,
        suggestedRemedy: "Throw a small copper coin or square copper plate into flowing river water on Sundays."
      };
    }
  },
  {
    id: "LK_REL_REMARRIAGE",
    name: "Remarriage Prospects",
    description: "Determines secondary union potential in cases of legal separation or bereavement.",
    module: "Remarriage",
    evaluate: (planets, lagna) => {
      const planetsIn7 = getPlanetsInLKHouse(planets, 7);
      const venusHouse = getPlanetLKHouse(planets, "Venus");
      const jupiterHouse = getPlanetLKHouse(planets, "Jupiter");

      const supporting: string[] = [];
      const contradicting: string[] = [];

      // Multiple dual/friendly planets in House 7, or Venus in House 2 with afflicted 7th
      const hasMultiplePlanetsIn7 = planetsIn7.length >= 2;
      const isSecondUnionPromised = venusHouse === 2 && jupiterHouse === 11;

      if (hasMultiplePlanetsIn7) {
        supporting.push(`House 7 is occupied by multiple planets (${planetsIn7.map((p) => p.name).join(", ")}), indicating multiple union paths.`);
      }
      if (isSecondUnionPromised) {
        supporting.push("Venus is in House 2 and Jupiter sits in House 11, strongly promising a supportive second marriage.");
      }

      if (!hasMultiplePlanetsIn7 && !isSecondUnionPromised) {
        contradicting.push("No multi-union indicators present; focus is on a singular primary partnership.");
      }

      const status = hasMultiplePlanetsIn7 || isSecondUnionPromised ? "PASS" : "FAIL";

      return {
        status,
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 80,
        suggestedRemedy: "Donate 2 yellow lemons or 2 bananas in a temple for 11 consecutive days."
      };
    }
  },
  {
    id: "LK_REL_SPOUSE",
    name: "Spouse Nature & Personality",
    description: "Retrieves the core traits, temperament, and appearance of the partner from the 7th House contents.",
    module: "Spouse Nature",
    evaluate: (planets, lagna) => {
      const planetsIn7 = getPlanetsInLKHouse(planets, 7);

      const supporting: string[] = [];
      const contradicting: string[] = [];

      let spouseTraits = "Gentle, balanced, and supportive spouse (Natural Venusian trait of House 7).";

      if (planetsIn7.length > 0) {
        const primaryPlanet = planetsIn7[0].name;
        supporting.push(`House 7 is occupied by ${primaryPlanet}, which directly shapes the spouse's temperament.`);

        if (primaryPlanet === "Jupiter") {
          spouseTraits = "Wise, religious, counseling-oriented, deeply respected, and generous spouse.";
        } else if (primaryPlanet === "Venus") {
          spouseTraits = "Highly attractive, artistic, refined taste, loves comfort, luxury, and visual elegance.";
        } else if (primaryPlanet === "Moon") {
          spouseTraits = "Emotional, deeply caring, family-oriented, moody at times, with a peaceful glowing nature.";
        } else if (primaryPlanet === "Mars") {
          spouseTraits = "Aggressive, athletic, highly energetic, courageous, impulsive, with a sharp fiery temper.";
        } else if (primaryPlanet === "Saturn") {
          spouseTraits = "Disciplined, mature, serious, hardworking, highly practical, but emotionally reserved.";
        } else if (primaryPlanet === "Mercury") {
          spouseTraits = "Youthful, witty, highly talkative, business-minded, adaptable, and intellectually active.";
        } else if (primaryPlanet === "Rahu") {
          spouseTraits = "Unconventional, eccentric, highly ambitious, modern, with unexpected moods and behaviors.";
        } else if (primaryPlanet === "Ketu") {
          spouseTraits = "Spiritual, detached, introverted, highly intuitive, but sometimes hard to comprehend.";
        } else if (primaryPlanet === "Sun") {
          spouseTraits = "Egoistic, authoritative, holds strong self-esteem, loves leadership, and demands respect.";
        }
      } else {
        supporting.push("7th House is vacant. Natural sign ruler qualities (Venusian energy of Libra/7) prevail.");
      }

      return {
        status: "PASS",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 100,
        suggestedRemedy: `Spouse Archetype Identified: ${spouseTraits}`
      };
    }
  },
  {
    id: "LK_REL_HAPPINESS",
    name: "Marital Happiness & Synergy",
    description: "Evaluates the overall joy, mutual growth, and smooth operation of married life.",
    module: "Marriage Happiness",
    evaluate: (planets, lagna) => {
      const venusHouse = getPlanetLKHouse(planets, "Venus");
      const jupiterHouse = getPlanetLKHouse(planets, "Jupiter");
      const planetsIn7 = getPlanetsInLKHouse(planets, 7);

      const supporting: string[] = [];
      const contradicting: string[] = [];

      let score = 0;

      if ([2, 7, 12].includes(venusHouse)) {
        supporting.push(`Venus is in House ${venusHouse}, blessing the native with immense physical and domestic happiness.`);
        score += 2;
      }

      if ([1, 2, 5, 9, 11].includes(jupiterHouse)) {
        supporting.push(`Jupiter is in House ${jupiterHouse}, adding wisdom, luck, and long-term marital security.`);
        score += 1.5;
      }

      const hasMaleficsIn7 = planetsIn7.some((p) => ["Saturn", "Rahu", "Ketu"].includes(p.name));
      if (hasMaleficsIn7) {
        contradicting.push("Presence of malefic planets in House 7 introduces trust issues and frequent arguments.");
        score -= 1.5;
      }

      return {
        status: score >= 1 ? "PASS" : "FAIL",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 85,
        suggestedRemedy: "Donate dry almonds in a temple or flow them in running water to maintain sweet domestic harmony."
      };
    }
  },
  {
    id: "LK_REL_TIMELINE",
    name: "Relationship Timeline Progression",
    description: "Draws an age-by-age map of relationship energies and turning points.",
    module: "Relationship Timeline",
    evaluate: (planets, lagna, userAge) => {
      const supporting: string[] = [];
      const contradicting: string[] = [];

      // Generate ages and active planet
      const planetaryCycles = [
        { age: 22, planet: "Sun", focus: "Self-expression, confidence, or father's consent in romance." },
        { age: 24, planet: "Jupiter", focus: "Traditional commitments, elder support, and sacred unions." },
        { age: 25, planet: "Venus", focus: "The Peak Relationship year! Settle down, high passion, and marriage." },
        { age: 28, planet: "Mars", focus: "High passion, potential domestic arguments, or martial connections." },
        { age: 34, planet: "Mercury", focus: "Intellectual sync, mutual business, and joint assets." },
        { age: 36, planet: "Saturn", focus: "Structured, high discipline, stabilizing long-term commitments." },
        { age: 42, planet: "Rahu", focus: "Unconventional desires, deep transformations, or overseas trips." },
        { age: 48, planet: "Ketu", focus: "Spiritual retreats, emotional detachment, and transcendental sync." }
      ];

      const closestCycle = planetaryCycles.find((c) => userAge <= c.age) || planetaryCycles[planetaryCycles.length - 1];

      supporting.push(`Current Age: ${userAge}. Closest major Lal Kitab cycle is Age ${closestCycle.age} governed by ${closestCycle.planet}.`);
      supporting.push(`Active Energy: ${closestCycle.focus}`);

      return {
        status: "PASS",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 100,
        suggestedRemedy: `Focus on the active ${closestCycle.planet} cycle of relationships.`
      };
    }
  },
  {
    id: "LK_REL_REMEDIES",
    name: "Relationship Remedies (Upays)",
    description: "Applies specialized Lal Kitab remedies to remove daily relationship friction.",
    module: "Relationship Remedies",
    evaluate: (planets, lagna) => {
      const mercuryHouse = getPlanetLKHouse(planets, "Mercury");
      const rahuHouse = getPlanetLKHouse(planets, "Rahu");

      const supporting: string[] = [];
      const contradicting: string[] = [];

      let customRemedy = "Feed sweet wheat breads (sweet rotis) to stray cows.";

      if (mercuryHouse === 3 || mercuryHouse === 8) {
        supporting.push(`Active Remedy selected for Mercury in House ${mercuryHouse}.`);
        customRemedy = "Throw yellow mustard seeds on the terrace or rooftop to clean speech energy.";
      } else if (rahuHouse === 5 || rahuHouse === 7) {
        supporting.push(`Active Remedy selected for Rahu in House ${rahuHouse}.`);
        customRemedy = "Keep a small solid pure silver elephant in your living room to absorb stress and negative fumes.";
      } else {
        supporting.push("No severe afflictions spotted. General remedial protection applies.");
      }

      return {
        status: "PASS",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 100,
        suggestedRemedy: customRemedy
      };
    }
  },
  {
    id: "LK_MAR_REMEDIES",
    name: "Marriage Blockade Remedies",
    description: "Provides traditional Lal Kitab remedies to remove delay or secure wedding events.",
    module: "Marriage Remedies",
    evaluate: (planets, lagna) => {
      const saturnHouse = getPlanetLKHouse(planets, "Saturn");
      const venusHouse = getPlanetLKHouse(planets, "Venus");

      const supporting: string[] = [];
      const contradicting: string[] = [];

      let customRemedy = "Flow yellow flowers in a clean running river on Thursdays.";

      if (saturnHouse === 7 || saturnHouse === 8) {
        supporting.push("Active marriage remedy selected to pacify Saturn's delay.");
        customRemedy = "Wear a solid jointless pure silver ring on the small finger, and donate mustard oil in an iron bowl.";
      } else if (venusHouse === 6 || isHouseDormant(planets, 7)) {
        supporting.push("Active marriage remedy selected to awaken the sleeping/weak Venus.");
        customRemedy = "Donate copper coins in running water, or gift bronze utensils at a place of worship.";
      } else {
        supporting.push("General auspicious marriage preservation remedy selected.");
      }

      return {
        status: "PASS",
        supportingEvidence: supporting,
        contradictingEvidence: contradicting,
        confidence: 100,
        suggestedRemedy: customRemedy
      };
    }
  }
];

// --- Lal Kitab Evidence & Decision Adapters ---

export interface LalKitabEvidencePackage {
  planetsPositions: { name: string; lkHouse: number; dormantStatus: string }[];
  dormancyStates: { house: number; isDormant: boolean }[];
  artificialCombinations: { formula: string; output: string }[];
}

export const LalKitabEvidenceAdapter = (planets: PlanetPosition[]): LalKitabEvidencePackage => {
  // 1. Gather planet positions and their Lal Kitab houses
  const positions = planets.map((p) => {
    const houseNum = getLKHouse(p);
    const asleep = isHouseDormant(planets, houseNum);
    return {
      name: p.name,
      lkHouse: houseNum,
      dormantStatus: asleep ? "Dormant (Asleep)" : "Active (Aspected)"
    };
  });

  // 2. Identify house dormancy states for relationship houses (2, 7, 8)
  const dormancy = [2, 7, 8].map((h) => ({
    house: h,
    isDormant: isHouseDormant(planets, h)
  }));

  // 3. Highlight artificial combinations present or key principles
  const combinations = [
    { formula: "Mercury + Venus", output: "Sun" },
    { formula: "Sun + Jupiter", output: "Moon" },
    { formula: "Sun + Mercury", output: "Mars" },
    { formula: "Saturn + Venus", output: "Rahu" }
  ];

  return {
    planetsPositions: positions,
    dormancyStates: dormancy,
    artificialCombinations: combinations
  };
};

export interface LalKitabDecisionPackage {
  overallPromiseScore: number; // 0 to 100
  overallHappinessScore: number; // 0 to 100
  marriageDelayRisk: "High" | "Medium" | "Low";
  finalVerdictText: string;
  ruleEvaluations: {
    ruleId: string;
    ruleName: string;
    module: string;
    result: LalKitabRuleResult;
  }[];
}

export const LalKitabDecisionAdapter = (
  planets: PlanetPosition[],
  lagna: any,
  userAge: number
): LalKitabDecisionPackage => {
  const evaluations = LalKitabRelationshipRules.map((rule) => {
    const res = rule.evaluate(planets, lagna, userAge);
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      module: rule.module,
      result: res
    };
  });

  // Calculate promise score (based on Promise, Love, Arranged, Happiness rules)
  const promiseRule = evaluations.find((e) => e.ruleId === "LK_REL_PROMISE")?.result;
  const happinessRule = evaluations.find((e) => e.ruleId === "LK_REL_HAPPINESS")?.result;
  const delayRule = evaluations.find((e) => e.ruleId === "LK_REL_DELAY")?.result;

  let promiseScore = 50;
  if (promiseRule) {
    if (promiseRule.status === "PASS") promiseScore += 30;
    if (promiseRule.status === "FAIL") promiseScore -= 30;
  }
  if (happinessRule) {
    if (happinessRule.status === "PASS") promiseScore += 15;
    if (happinessRule.status === "FAIL") promiseScore -= 15;
  }
  promiseScore = Math.min(100, Math.max(10, promiseScore));

  let happinessScore = 50;
  if (happinessRule) {
    if (happinessRule.status === "PASS") happinessScore += 40;
    if (happinessRule.status === "FAIL") happinessScore -= 30;
  }
  happinessScore = Math.min(100, Math.max(10, happinessScore));

  let delayRisk: "High" | "Medium" | "Low" = "Low";
  if (delayRule) {
    if (delayRule.status === "PASS") {
      delayRisk = delayRule.confidence > 80 ? "High" : "Medium";
    }
  }

  // Construct structured verdict text
  let finalVerdictText = "";
  if (promiseScore >= 75) {
    finalVerdictText = `The Lal Kitab analysis strongly confirms a highly auspicious and stable marriage promise. The energies of Venus are well-aspected and supportive. Marital satisfaction will be highly robust, with a ${delayRisk === "High" ? "moderate delay but stable" : "timely and smooth"} entry into married life.`;
  } else if (promiseScore <= 40) {
    finalVerdictText = `The Lal Kitab analysis shows heavy planetary afflictions or a sleeping 7th house. Marital delays, obstacles, or friction are highly active. Committing to a solid jointless silver ring and traditional remedies is highly advised to dissolve these dense planetary blocks.`;
  } else {
    finalVerdictText = `The Lal Kitab analysis indicates moderate or mixed relationship alignments. While the promise of marriage is present, it is currently in a dormant state or meets temporary friction. Activating sleeping houses through traditional family rituals will unlock smooth partnership flows.`;
  }

  return {
    overallPromiseScore: promiseScore,
    overallHappinessScore: happinessScore,
    marriageDelayRisk: delayRisk,
    finalVerdictText,
    ruleEvaluations: evaluations
  };
};
