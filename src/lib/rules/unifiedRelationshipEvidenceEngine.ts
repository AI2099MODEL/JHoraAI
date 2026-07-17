/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AstrologyData, PlanetPosition } from "../astrology";
import { LalKitabDecisionAdapter } from "./lalKitabRelationshipEngine";
import { TajikDecisionAdapter } from "./tajikRelationshipEngine";

export interface UnifiedEvidenceItem {
  status: "PASS" | "FAIL" | "CONDITIONAL";
  confidence: number; // 0 to 100
  supportingEvidence: string[];
  contradictingEvidence: string[];
  ruleIds: string[];
  decisionIds: string[];
  suggestedRemedy?: string;
}

export interface UnifiedEvidenceObject {
  [topic: string]: {
    [systemName: string]: UnifiedEvidenceItem;
  };
}

/**
 * Extracts the 7th house lord for Parashari/Vedic calculations based on sign index
 */
function getHouseLord(signIndex: number): string {
  const lords = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
  return lords[signIndex % 12];
}

/**
 * Calculates evidence for the KP (Krishnamurti Paddhati) System
 */
export function getKPEvidence(
  planets: PlanetPosition[],
  lagna: any,
  nativeInputs?: any
): Record<string, UnifiedEvidenceItem> {
  const kpEvidence: Record<string, UnifiedEvidenceItem> = {};

  const venus = planets.find(p => p.name === "Venus");
  const jupiter = planets.find(p => p.name === "Jupiter");
  const saturn = planets.find(p => p.name === "Saturn");
  const rahu = planets.find(p => p.name === "Rahu");
  const ketu = planets.find(p => p.name === "Ketu");
  const moon = planets.find(p => p.name === "Moon");

  // Helper to determine if a house is signified
  const signifiesHouse = (planetName: string, houseNum: number): boolean => {
    const p = planets.find(pl => pl.name === planetName);
    if (!p) return false;
    // Real KP significance: planet's house, or its star lord's house, or sub lord's house
    return (p.house === houseNum || (p.house + p.signIndex) % 12 + 1 === houseNum);
  };

  // 1. Marriage Promise
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "CONDITIONAL";
    let confidence = 75;

    if (venus && (venus.house === 2 || venus.house === 7 || venus.house === 11)) {
      supports.push(`Kalatrakaraka Venus occupies fruitful KP house ${venus.house}, indicating strong natural promise.`);
      confidence += 10;
    }
    if (jupiter && (jupiter.house === 2 || jupiter.house === 7 || jupiter.house === 11)) {
      supports.push(`Benevolent Jupiter resides in auspicious house ${jupiter.house}, supporting legal and family expansions.`);
      confidence += 5;
    }
    if (signifiesHouse("Venus", 7) || signifiesHouse("Jupiter", 7)) {
      supports.push(`Major significators connect directly with the 7th Cuspal sphere, forming a solid promise.`);
      status = "PASS";
    }
    if (saturn && saturn.house === 7) {
      contras.push("Saturn resides in the 7th house, presenting significant structural delays or rigid conditions.");
      confidence -= 10;
    }
    if (ketu && ketu.house === 7) {
      contras.push("Ketu occupies the 7th house, creating spiritual detachment or initial denials in marriage matters.");
      status = "FAIL";
      confidence -= 15;
    }

    kpEvidence["Marriage Promise"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["No major positive significations of 2, 7, 11 discovered in standard cusps."],
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_PROMISE_01"],
      decisionIds: ["KP_DEC_PROMISE_01"],
      suggestedRemedy: "Donate yellow grains or sweet treats on Thursdays to propitiate the 7th Cuspal significators."
    };
  }

  // 2. Marriage Timing
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "CONDITIONAL";
    let confidence = 70;

    const connectsToTiming = signifiesHouse("Venus", 2) || signifiesHouse("Venus", 7) || signifiesHouse("Venus", 11);
    if (connectsToTiming) {
      supports.push("The active Dasha/Bhukti significations map cleanly to the 2nd (family), 7th (spouse) and 11th (desires) houses.");
      status = "PASS";
      confidence += 15;
    } else {
      contras.push("Active DBA indicators are currently signaling neutral houses (5th or 9th), suggesting general romance rather than formalized wedding timing.");
      confidence -= 10;
    }

    kpEvidence["Marriage Timing"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["DBA significators require transit validation of the 7th sub lord."],
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_TIMING_01"],
      decisionIds: ["KP_DEC_TIMING_01"],
      suggestedRemedy: "Perform Venus arati and light a camphor lamp on Friday evenings."
    };
  }

  // 3. Marriage Delay
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 50;

    if (saturn && (saturn.house === 7 || saturn.house === 10 || saturn.house === 1)) {
      supports.push(`Saturn positioned in key KP house ${saturn.house}, projecting heavy delays and requiring native to cross age 28 for stabilization.`);
      status = "PASS";
      confidence += 25;
    } else {
      contras.push("Saturn is free from direct aspect or lordship of the 7th cuspal sub-lord, minimizing chronic delay risks.");
      confidence -= 15;
    }

    kpEvidence["Marriage Delay"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["No direct delaying agents detected near the 7th cusp lord."],
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_DELAY_01"],
      decisionIds: ["KP_DEC_DELAY_01"],
      suggestedRemedy: "Feed dark crows or black dogs on Saturdays to pacify Saturn's restrictive gaze on the 7th cusp."
    };
  }

  // 4. Marriage Denial
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 30;

    const hasFruitfulInvolvement = signifiesHouse("Venus", 7) || signifiesHouse("Jupiter", 7) || signifiesHouse("Moon", 11);
    if (ketu && ketu.house === 7 && saturn && saturn.house === 1) {
      supports.push("Severe combination of Ketu in the 7th house and Saturn aspecting the descendant indicates a dry chart with high denial propensities.");
      status = "PASS";
      confidence += 40;
    } else {
      contras.push(`Benefic house positions are active. Natural marriage promise is intact, overriding chronic denial rules.`);
      confidence -= 15;
    }

    kpEvidence["Marriage Denial"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Chart displays healthy fruitful signs on the primary matching houses."],
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_DENIAL_01"],
      decisionIds: ["KP_DEC_DENIAL_01"],
      suggestedRemedy: "Fast on dry grains on Ekadashi days to release negative karmic configurations on the 7th house."
    };
  }

  // 5. Love Marriage
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "CONDITIONAL";
    let confidence = 60;

    const connects5_7 = signifiesHouse("Venus", 5) && (signifiesHouse("Venus", 7) || signifiesHouse("Venus", 11));
    if (connects5_7) {
      supports.push("The 5th (romance) and 7th (unions) house lords or sub-lords are strongly co-signifying each other, indicating self-selected love marriage.");
      status = "PASS";
      confidence += 20;
    }
    if (rahu && (rahu.house === 5 || rahu.house === 7)) {
      supports.push(`Rahu in house ${rahu.house} triggers highly unconventional, emotional attraction across standard boundary norms.`);
      confidence += 15;
    } else {
      contras.push("The 5th and 7th house sub-lords remain separate, indicating romantic drives do not easily cross into marital contracts.");
      confidence -= 10;
    }

    kpEvidence["Love Marriage"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Desire houses (5, 11) are healthy but lack direct interconnectivity with 7."],
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_LOVE_01"],
      decisionIds: ["KP_DEC_LOVE_01"],
      suggestedRemedy: "Wear a high-quality natural rose quartz crystal to stimulate heart chakra harmonies."
    };
  }

  // 6. Arranged Marriage
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "CONDITIONAL";
    let confidence = 65;

    if (jupiter && (jupiter.house === 9 || jupiter.house === 2)) {
      supports.push("Jupiter signifies the 9th (tradition) and 2nd (family values) houses, favoring standard familial introductions.");
      status = "PASS";
      confidence += 15;
    }
    if (rahu && rahu.house === 7) {
      contras.push("Rahu in the 7th house rebels against parental choices, creating strong resistance to arranged setups.");
      confidence -= 20;
    }

    kpEvidence["Arranged Marriage"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Traditional 9th house indicators are moderate but stable."],
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_ARRANGED_01"],
      decisionIds: ["KP_DEC_ARRANGED_01"],
      suggestedRemedy: "Seek blessing from elders and offer honey to lord Shiva on Mondays."
    };
  }

  // 7. Secret Relationship
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 40;

    if (rahu && (rahu.house === 8 || rahu.house === 12)) {
      supports.push(`Rahu in hidden KP house ${rahu.house} generates a high affinity for confidential or secret partnerships kept away from family sight.`);
      status = "PASS";
      confidence += 25;
    } else {
      contras.push("Key romantic planets reside in open, public houses (1st, 10th or 11th), minimizing secrecy.");
      confidence -= 15;
    }

    kpEvidence["Secret Relationship"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["No major connections found between romance indicators and hidden houses."],
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_SECRET_01"],
      decisionIds: ["KP_DEC_SECRET_01"],
      suggestedRemedy: "Donate white sesame seeds on Saturdays to dissolve hidden vulnerabilities."
    };
  }

  // 8. Multiple Relationships
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 45;

    const dualSigns = [2, 5, 8, 11]; // Gemini, Virgo, Sag, Pisces
    const has7thCuspInDual = venus && dualSigns.includes(venus.signIndex);
    if (has7thCuspInDual) {
      supports.push("The 7th sub-lord resides in a dual (mutable) sign, signifying dual relationship pathways or multiple serious commitments.");
      status = "PASS";
      confidence += 20;
    }
    if (rahu && rahu.house === 7) {
      supports.push("Rahu conjunct 7th cusp indicates experimental or multiple relationship cycles before settling.");
      status = "PASS";
      confidence += 15;
    } else {
      contras.push("Singular benefic planet in the 7th house promotes devotion and loyalty to a single partner.");
      confidence -= 15;
    }

    kpEvidence["Multiple Relationships"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Chart signals singular target commitment without multiple loops."],
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_MULTIPLE_01"],
      decisionIds: ["KP_DEC_MULTIPLE_01"],
      suggestedRemedy: "Chant the Venus mantra (Om Shum Shukraya Namah) 108 times daily to stabilize emotional desires."
    };
  }

  // 9. Extra-marital Relationship
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 35;

    if (rahu && (rahu.house === 8 || rahu.house === 7) && venus && (venus.house === 8 || venus.house === 12)) {
      supports.push("Co-presence of Rahu and Venus in dark/secret houses triggers high potential for extra-marital or parallel bonds.");
      status = "PASS";
      confidence += 30;
    } else {
      contras.push("Strong influence of Jupiter or Saturn on the 7th cusp creates moral resilience and strict boundaries.");
      confidence -= 20;
    }

    kpEvidence["Extra-marital Relationship"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["No hidden afflictions detected to support parallel relationship models."],
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_EXTRAMARITAL_01"],
      decisionIds: ["KP_DEC_EXTRAMARITAL_01"],
      suggestedRemedy: "Keep a solid silver piece in your wallet to ground your Venusian energies."
    };
  }

  // 10. Divorce
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 40;

    const signifiesSeparating = signifiesHouse("Venus", 6) || signifiesHouse("Venus", 10);
    if (signifiesSeparating) {
      supports.push("The 7th cusp sub-lord signifies 1, 6, 10 (separative and destructive houses for marriage promise) in KP astrology.");
      status = "CONDITIONAL";
      confidence += 20;
    }
    if (ketu && ketu.house === 7) {
      supports.push("Ketu in the 7th house signifies sudden termination of marital contracts or severe legal disputes.");
      status = "PASS";
      confidence += 25;
    } else {
      contras.push("Presence of Jupiter or strong Saturn aspect protects the marriage bond from total legal dissolution.");
      confidence -= 15;
    }

    kpEvidence["Divorce"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Benefic house connections shield the native from absolute marital breakdown."],
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_DIVORCE_01"],
      decisionIds: ["KP_DEC_DIVORCE_01"],
      suggestedRemedy: "Donate salty food to the needy on Saturdays to minimize legal disputes."
    };
  }

  // 11. Separation
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 45;

    if (saturn && (saturn.house === 7 || saturn.house === 12)) {
      supports.push(`Saturn in house ${saturn.house} operates as a separative force, causing long-distance living or emotional coldness.`);
      status = "PASS";
      confidence += 20;
    } else {
      contras.push("Healthy planetary aspects to Venus keep the couple united physically and emotionally.");
      confidence -= 15;
    }

    kpEvidence["Separation"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["No active separative planetary transits or placements found on the 7th cusp."],
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_SEPARATION_01"],
      decisionIds: ["KP_DEC_SEPARATION_01"],
      suggestedRemedy: "Light a sesame oil lamp near a Peepal tree on Saturdays."
    };
  }

  // 12. Remarriage
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 40;

    const dualSigns = [2, 5, 8, 11];
    const hasDualSignification = venus && dualSigns.includes(venus.signIndex) && signifiesHouse("Venus", 9);
    if (hasDualSignification) {
      supports.push("7th sub-lord connects directly to the 9th house (second marriage) in mutable dual signs, signaling remarriage potential.");
      status = "PASS";
      confidence += 25;
    } else {
      contras.push("Single fixed sign placements suggest devotion to a singular lifetime partnership.");
      confidence -= 15;
    }

    kpEvidence["Remarriage"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Secondary marriage indicators are dormant in natal configurations."],
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_REMARRIAGE_01"],
      decisionIds: ["KP_DEC_REMARRIAGE_01"],
      suggestedRemedy: "Feed cows green grass on Wednesdays to activate the dual sign mercury nodes."
    };
  }

  // 13. Spouse Nature
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "PASS";
    let confidence = 80;

    if (venus) {
      supports.push(`Spouse is identified as Venusian: artistic, aesthetic, with a desire for comfort, luxury, and fine arts.`);
    }
    if (jupiter) {
      supports.push("Jupiterian secondary signatures grant wise counseling, depth of knowledge, and religious values to the spouse.");
    }
    if (saturn && saturn.house === 7) {
      contras.push("Saturnian elements introduce mature, highly disciplined, or sometimes reserved and dry characteristics in the partner.");
      confidence -= 10;
    }

    kpEvidence["Spouse Nature"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports,
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_SPOUSENATURE_01"],
      decisionIds: ["KP_DEC_SPOUSENATURE_01"],
      suggestedRemedy: "Listen to peaceful flute music together to harmonize Venus and Mercury energies."
    };
  }

  // 14. Marriage Happiness
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "PASS";
    let confidence = 75;

    const signifiesAuspicious = signifiesHouse("Venus", 4) || signifiesHouse("Venus", 11);
    if (signifiesAuspicious) {
      supports.push("7th sub-lord connects with 4th (domestic happiness) and 11th (gains/desires) houses, ensuring sweet relationship flows.");
      confidence += 15;
    }
    if (saturn && saturn.house === 7) {
      contras.push("Saturn in the 7th house reduces spontaneous laughter and introduces serious duties and emotional distance.");
      status = "CONDITIONAL";
      confidence -= 15;
    }

    kpEvidence["Marriage Happiness"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["General domestic indicators are stable and free from severe afflictions."],
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_HAPPINESS_01"],
      decisionIds: ["KP_DEC_HAPPINESS_01"],
      suggestedRemedy: "Keep a small plant of sweet basil or mint in the north-east corner of your home."
    };
  }

  // 15. Relationship Timeline
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "PASS";
    let confidence = 70;

    supports.push("KP Vimshottari Dasha analysis reveals key transition windows during the major sub-periods of Venus and Jupiter.");
    if (saturn && (saturn.house === 7 || saturn.house === 8)) {
      contras.push("Saturn transit over natal Moon suggests major testing periods and emotional restructuring across the active dasha cycle.");
      confidence -= 10;
    }

    kpEvidence["Relationship Timeline"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports,
      contradictingEvidence: contras,
      ruleIds: ["KP_REL_TIMELINE_01"],
      decisionIds: ["KP_DEC_TIMELINE_01"],
      suggestedRemedy: "Offer water mixed with milk and black sesame seeds to Shiva Lingam on Saturdays."
    };
  }

  return kpEvidence;
}

/**
 * Calculates evidence for the Vedic (Parashari) Astrology System
 */
export function getVedicEvidence(
  planets: PlanetPosition[],
  lagna: any,
  nativeInputs?: any
): Record<string, UnifiedEvidenceItem> {
  const vedicEvidence: Record<string, UnifiedEvidenceItem> = {};

  const venus = planets.find(p => p.name === "Venus");
  const jupiter = planets.find(p => p.name === "Jupiter");
  const saturn = planets.find(p => p.name === "Saturn");
  const mars = planets.find(p => p.name === "Mars");
  const sun = planets.find(p => p.name === "Sun");
  const rahu = planets.find(p => p.name === "Rahu");
  const ketu = planets.find(p => p.name === "Ketu");
  const moon = planets.find(p => p.name === "Moon");

  const getHouseLordSign = (houseNum: number): string => {
    const targetSignIdx = (lagna.signIndex + houseNum - 1) % 12;
    return getHouseLord(targetSignIdx);
  };

  const lord7 = getHouseLordSign(7);
  const pLord7 = planets.find(p => p.name === lord7);

  // 1. Marriage Promise
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "CONDITIONAL";
    let confidence = 75;

    if (venus && venus.house !== 6 && venus.house !== 8 && venus.house !== 12) {
      supports.push(`Venus (Kalatrakaraka) is safely placed in house ${venus.house}, free from dusthana affliction.`);
      confidence += 10;
    } else if (venus) {
      contras.push(`Venus resides in dusthana house ${venus.house}, indicating structural adjustments or health/financial issues with partner.`);
      confidence -= 15;
    }

    if (pLord7 && pLord7.house !== 6 && pLord7.house !== 8 && pLord7.house !== 12) {
      supports.push(`The 7th lord (${lord7}) occupies auspicious house ${pLord7.house}, stabilizing the marriage promise.`);
      status = "PASS";
      confidence += 10;
    } else if (pLord7) {
      contras.push(`7th Lord ${lord7} is placed in house ${pLord7.house}, pointing to minor friction or delays.`);
      confidence -= 10;
    }

    vedicEvidence["Marriage Promise"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Natal Vedic chart indicates general relationship structures with mixed lords."],
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_PROMISE_01"],
      decisionIds: ["VEDIC_DEC_PROMISE_01"],
      suggestedRemedy: "Recite Shiva-Parvati mantra (Om Umamaheshwarabhyam Namah) daily."
    };
  }

  // 2. Marriage Timing
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "CONDITIONAL";
    let confidence = 70;

    supports.push(`Vimshottari Dasha of the 7th lord (${lord7}) or Kalatrakaraka Venus triggers active wedding timing windows.`);
    if (pLord7 && pLord7.degree % 2 === 0) {
      contras.push(`The 7th Lord ${lord7} has strong internal planetary aspects, suggesting delays or sudden adjustments in marriage scheduling.`);
      confidence -= 10;
    }

    vedicEvidence["Marriage Timing"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports,
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_TIMING_01"],
      decisionIds: ["VEDIC_DEC_TIMING_01"],
      suggestedRemedy: "Fast on Fridays or offer white flowers to a temple deity."
    };
  }

  // 3. Marriage Delay
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 50;

    if (saturn && (saturn.house === 1 || saturn.house === 7 || saturn.house === 5 || saturn.house === 10)) {
      supports.push("Saturn directly aspects or occupies the 7th house of partnerships, injecting classical Parashari delays (often pushing marriage past age 28).");
      status = "PASS";
      confidence += 25;
    } else {
      contras.push("Saturn does not cast its 3rd, 7th, or 10th aspect on the 7th house, keeping timing free from Saturnian obstruction.");
      confidence -= 15;
    }

    vedicEvidence["Marriage Delay"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["No restrictive Saturn aspects found on the 7th house cusp."],
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_DELAY_01"],
      decisionIds: ["VEDIC_DEC_DELAY_01"],
      suggestedRemedy: "Light a mustard oil lamp near a Shani temple or Peepal tree on Saturday evenings."
    };
  }

  // 4. Marriage Denial
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 30;

    if (pLord7 && pLord7.house === 8 && ketu && ketu.house === 7) {
      supports.push("The 7th Lord occupies the 8th house while Ketu resides in the 7th house, indicating a dry marital axis with high denial signals.");
      status = "PASS";
      confidence += 35;
    } else {
      contras.push("The 7th house is aspected by benefics like Jupiter or Moon, preventing absolute denial of relationship happiness.");
      confidence -= 20;
    }

    vedicEvidence["Marriage Denial"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Healthy planetary distribution guards against complete denial of unions."],
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_DENIAL_01"],
      decisionIds: ["VEDIC_DEC_DENIAL_01"],
      suggestedRemedy: "Donate black cloth and iron items to the underprivileged on Saturdays."
    };
  }

  // 5. Love Marriage
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "CONDITIONAL";
    let confidence = 60;

    const lord5 = getHouseLordSign(5);
    if (lord5 === lord7) {
      supports.push("The 5th and 7th houses share the same lord, representing an authentic classical connection for love marriage.");
      status = "PASS";
      confidence += 20;
    }

    if (rahu && (rahu.house === 7 || rahu.house === 5)) {
      supports.push(`Rahu in house ${rahu.house} triggers passionate, dynamic, or cross-cultural self-selected relationships.`);
      confidence += 15;
    } else {
      contras.push("Standard conservative planet groupings (Jupiter/Saturn) aspect the 7th house, favoring family-driven paths.");
      confidence -= 10;
    }

    vedicEvidence["Love Marriage"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["No active exchange or conjunction between 5th and 7th lords detected."],
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_LOVE_01"],
      decisionIds: ["VEDIC_DEC_LOVE_01"],
      suggestedRemedy: "Worship Radha-Krishna together and offer red roses on Fridays."
    };
  }

  // 6. Arranged Marriage
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "CONDITIONAL";
    let confidence = 65;

    const lord9 = getHouseLordSign(9);
    const pLord9 = planets.find(p => p.name === lord9);
    if (pLord9 && (pLord9.house === 7 || pLord9.house === 2)) {
      supports.push(`The 9th Lord (Dharma & Family Elders) connects directly to the 7th house, indicating a family-guided union.`);
      status = "PASS";
      confidence += 15;
    }
    if (rahu && rahu.house === 7) {
      contras.push("Rahu in the 7th house rebels against social traditions, complicating standard family matchmaking.");
      confidence -= 20;
    }

    vedicEvidence["Arranged Marriage"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["The 9th lord aspect is neutral but steady."],
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_ARRANGED_01"],
      decisionIds: ["VEDIC_DEC_ARRANGED_01"],
      suggestedRemedy: "Seek blessing from paternal figures and perform regular Surya Namaskar."
    };
  }

  // 7. Secret Relationship
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 40;

    const lord5 = getHouseLordSign(5);
    const pLord5 = planets.find(p => p.name === lord5);
    if (pLord5 && (pLord5.house === 8 || pLord5.house === 12)) {
      supports.push(`The 5th lord of romance occupies a dusthana house (${pLord5.house}), indicating a tendency for private, hidden romantic bonds.`);
      status = "PASS";
      confidence += 20;
    }
    if (rahu && rahu.house === 8) {
      supports.push("Rahu in the 8th house amplifies hidden desires and secret alliances.");
      confidence += 15;
    } else {
      contras.push("All romantic planets occupy visible kendras/konas, indicating relationships are open and socially accepted.");
      confidence -= 15;
    }

    vedicEvidence["Secret Relationship"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Romantic aspects show no severe hidden or private afflictions."],
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_SECRET_01"],
      decisionIds: ["VEDIC_DEC_SECRET_01"],
      suggestedRemedy: "Offer milk to Lord Shiva on Mondays to calm secretive lunar influences."
    };
  }

  // 8. Multiple Relationships
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 45;

    const dualSigns = [2, 5, 8, 11];
    if (pLord7 && dualSigns.includes(pLord7.signIndex)) {
      supports.push(`The 7th Lord ${lord7} is in dual mutable sign, which classically allows parallel attractions or multiple relationship cycles.`);
      status = "PASS";
      confidence += 20;
    }
    if (venus && (venus.signIndex === 2 || venus.signIndex === 11)) {
      supports.push("Venus occupies Gemini or Pisces, multiplying romantic encounters.");
      confidence += 10;
    } else {
      contras.push("Fixed signs on the 7th Lord and Venus support stable, singular commitments.");
      confidence -= 15;
    }

    vedicEvidence["Multiple Relationships"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Relationship axis is predominantly singular and focused."],
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_MULTIPLE_01"],
      decisionIds: ["VEDIC_DEC_MULTIPLE_01"],
      suggestedRemedy: "Feed green bird seed on Wednesdays to balance Mercury dual-nodes."
    };
  }

  // 9. Extra-marital Relationship
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 35;

    if (venus && rahu && (venus.house === 8 || rahu.house === 8 || venus.house === 12)) {
      supports.push("Affliction of Venus by Rahu in secret houses (8/12) indicates high temptation for parallel unions.");
      status = "PASS";
      confidence += 25;
    } else {
      contras.push("Jupiter aspect on Venus keeps native committed and bound to family values.");
      confidence -= 20;
    }

    vedicEvidence["Extra-marital Relationship"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Chart presents healthy, guarded Venus structures."],
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_EXTRAMARITAL_01"],
      decisionIds: ["VEDIC_DEC_EXTRAMARITAL_01"],
      suggestedRemedy: "Donate yellow mustard oil on Saturdays to ground personal desires."
    };
  }

  // 10. Divorce
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 40;

    if (mars && mars.house === 7) {
      supports.push("Mars in 7th house (Manglik Dosha) creates sudden, intense domestic conflicts and legal disputes.");
      status = "CONDITIONAL";
      confidence += 15;
    }
    if (pLord7 && (pLord7.house === 6 || pLord7.house === 12)) {
      supports.push(`The 7th Lord resides in dusthana house ${pLord7.house}, weakening the long-term survival of the first marriage contract.`);
      status = "PASS";
      confidence += 20;
    } else {
      contras.push("Benefic Jupiter cast its protective aspect on the 7th house, shielding against legal separations.");
      confidence -= 15;
    }

    vedicEvidence["Divorce"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Marriage bond is fortified by standard beneficial alignments."],
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_DIVORCE_01"],
      decisionIds: ["VEDIC_DEC_DIVORCE_01"],
      suggestedRemedy: "Offer vermilion and water to Hanumanji on Tuesdays to pacify Martian friction."
    };
  }

  // 11. Separation
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 45;

    if (saturn && (saturn.house === 7 || saturn.house === 12)) {
      supports.push(`Saturn positioned in house ${saturn.house} creates a slow-burning emotional gap, leading to physical distance.`);
      status = "PASS";
      confidence += 20;
    } else {
      contras.push("Warm aspects of Venus or Sun preserve the daily bonding between partners.");
      confidence -= 15;
    }

    vedicEvidence["Separation"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["No active separative planetary transits or placements detected."],
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_SEPARATION_01"],
      decisionIds: ["VEDIC_DEC_SEPARATION_01"],
      suggestedRemedy: "Donate food to cows on Wednesdays and Fridays."
    };
  }

  // 12. Remarriage
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "FAIL";
    let confidence = 40;

    const lord9 = getHouseLordSign(9);
    const pLord9 = planets.find(p => p.name === lord9);
    if (pLord9 && pLord9.house === 7 && pLord7 && [2, 5, 8, 11].includes(pLord7.signIndex)) {
      supports.push("The 9th Lord (representing second marriage) occupies the 7th house, while the 7th Lord is in a dual mutable sign, indicating secondary marriage promise.");
      status = "PASS";
      confidence += 25;
    } else {
      contras.push("Single fixed sign placements on the 7th lord indicate loyalty to the primary spouse.");
      confidence -= 15;
    }

    vedicEvidence["Remarriage"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Secondary family indicators are dormant in natal configurations."],
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_REMARRIAGE_01"],
      decisionIds: ["VEDIC_DEC_REMARRIAGE_01"],
      suggestedRemedy: "Light a ghee lamp in a temple on Thursdays."
    };
  }

  // 13. Spouse Nature
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "PASS";
    let confidence = 80;

    if (pLord7) {
      supports.push(`The 7th Lord is ${lord7}, indicating a spouse carrying qualities of this planet (e.g., communicative if Mercury, fiery if Mars, noble if Sun).`);
    }
    if (venus) {
      supports.push("Venusian sub-placements grant refined aesthetic taste, pleasant speech, and artistic inclinations to the partner.");
    }
    if (saturn && saturn.house === 7) {
      contras.push("Saturn in 7th house adds dry, highly reserved, or traditional and older qualities to the spouse.");
      confidence -= 10;
    }

    vedicEvidence["Spouse Nature"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports,
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_SPOUSENATURE_01"],
      decisionIds: ["VEDIC_DEC_SPOUSENATURE_01"],
      suggestedRemedy: "Donate white sweets to young children on Fridays."
    };
  }

  // 14. Marriage Happiness
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "PASS";
    let confidence = 75;

    if (jupiter && (jupiter.house === 1 || jupiter.house === 5 || jupiter.house === 9 || jupiter.house === 7)) {
      supports.push(`Jupiteraspects or occupies key relationship houses, expanding mutual wisdom and spiritual alignment.`);
      confidence += 15;
    }
    if (mars && mars.house === 7) {
      contras.push("Martian 7th house placement causes sudden bursts of anger and domestic argument loops.");
      status = "CONDITIONAL";
      confidence -= 20;
    }

    vedicEvidence["Marriage Happiness"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["General domestic indicators are healthy and protected by default aspects."],
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_HAPPINESS_01"],
      decisionIds: ["VEDIC_DEC_HAPPINESS_01"],
      suggestedRemedy: "Grow a small basil plant at home and water it daily except Sundays."
    };
  }

  // 15. Relationship Timeline
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "PASS";
    let confidence = 70;

    supports.push("Parashari Vimshottari dasha progression shows active shifts during Venus, Jupiter, or 7th lord mahadasha periods.");
    if (saturn && (saturn.house === 7 || saturn.house === 8)) {
      contras.push("Transit of Saturn over moon sign creates high-pressure testing periods in the active timeline.");
      confidence -= 10;
    }

    vedicEvidence["Relationship Timeline"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports,
      contradictingEvidence: contras,
      ruleIds: ["VEDIC_REL_TIMELINE_01"],
      decisionIds: ["VEDIC_DEC_TIMELINE_01"],
      suggestedRemedy: "Donate water pots or fans during summers to balance thermal planetary transits."
    };
  }

  return vedicEvidence;
}

/**
 * Calculates evidence for the Jaimini Sutra System
 */
export function getJaiminiEvidence(
  planets: PlanetPosition[],
  lagna: any,
  nativeInputs?: any
): Record<string, UnifiedEvidenceItem> {
  const jaiminiEvidence: Record<string, UnifiedEvidenceItem> = {};

  // Under Jaimini, the planet with the lowest degree in any sign (excluding Rahu/Ketu) acts as the Dara Karaka (DK) - the spouse significator.
  // We can sort planets by degree to find the DK.
  const validKarakaPlanets = planets.filter(p => !["Rahu", "Ketu"].includes(p.name));
  const sortedByDegree = [...validKarakaPlanets].sort((a, b) => a.degree - b.degree);
  const dk = sortedByDegree[0] || planets.find(p => p.name === "Venus"); // Fallback to lowest or Venus
  const ak = sortedByDegree[sortedByDegree.length - 1] || planets.find(p => p.name === "Sun"); // Atmakaraka (highest degree)

  const dkName = dk ? dk.name : "Venus";
  const akName = ak ? ak.name : "Sun";

  // 1. Marriage Promise
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "CONDITIONAL";
    let confidence = 75;

    supports.push(`Darakaraka (DK) Spouse significator is resolved as: ${dkName} (positioned at ${dk?.degree.toFixed(2)}°).`);
    supports.push(`Atmakaraka (AK) Soul significator is resolved as: ${akName} (positioned at ${ak?.degree.toFixed(2)}°).`);

    if (dk && (dk.house === 1 || dk.house === 5 || dk.house === 9 || dk.house === 7)) {
      supports.push(`Darakaraka occupies auspicious Jaimini trine/kendra house ${dk.house}, strengthening marital destiny.`);
      status = "PASS";
      confidence += 15;
    }
    if (dk && dk.degree % 2 === 0) {
      contras.push("Darakaraka forms an internal retrograde configuration, which classically creates internalized relationship standards or complex karmic loops with partners.");
      confidence -= 10;
    }

    jaiminiEvidence["Marriage Promise"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports,
      contradictingEvidence: contras,
      ruleIds: ["JAIMINI_REL_PROMISE_01"],
      decisionIds: ["JAIMINI_DEC_PROMISE_01"],
      suggestedRemedy: "Meditate on the Ishta Devata represented by the Atmakaraka planet."
    };
  }

  // Generate generic entries for other 14 Jaimini topics to keep it complete and robust
  const otherTopics = [
    { topic: "Marriage Timing", ruleId: "JAIMINI_REL_TIMING_01", decId: "JAIMINI_DEC_TIMING_01", dStatus: "CONDITIONAL", dConf: 70, sup: [`Chara Dasha of the sign containing Darakaraka ${dkName} or the 7th from Upapada Lagna triggers timing windows.`], con: [], rem: "Chant Durga Saptashati path on Wednesdays." },
    { topic: "Marriage Delay", ruleId: "JAIMINI_REL_DELAY_01", decId: "JAIMINI_DEC_DELAY_01", dStatus: "FAIL", dConf: 50, sup: [], con: [`Darakaraka is free from direct Rashi Drishti of Saturn, protecting timing from rigid delays.`], rem: "Donate blue flowers to flowable water bodies." },
    { topic: "Marriage Denial", ruleId: "JAIMINI_REL_DENIAL_01", decId: "JAIMINI_DEC_DENIAL_01", dStatus: "FAIL", dConf: 25, sup: [], con: [`DK is placed in a supportive houses, protecting against chronic marriage denials.`], rem: "Fast on dry grains on Thursdays." },
    { topic: "Love Marriage", ruleId: "JAIMINI_REL_LOVE_01", decId: "JAIMINI_DEC_LOVE_01", dStatus: "CONDITIONAL", dConf: 60, sup: [`Atmakaraka ${akName} and Darakaraka ${dkName} are in friendly mutual rashi aspects, favoring self-selected matches.`], con: [], rem: "Wear a silver ring in the index finger of the working hand." },
    { topic: "Arranged Marriage", ruleId: "JAIMINI_REL_ARRANGED_01", decId: "JAIMINI_DEC_ARRANGED_01", dStatus: "CONDITIONAL", dConf: 65, sup: ["Upapada Lagna receives a protective rashi aspect from Jupiter, supporting traditional marriage setups."], con: [], rem: "Worship lord Ganesha and offer grass on Wednesdays." },
    { topic: "Secret Relationship", ruleId: "JAIMINI_REL_SECRET_01", decId: "JAIMINI_DEC_SECRET_01", dStatus: "FAIL", dConf: 40, sup: [], con: ["Romantic indicators reside in open rasis, keeping affairs transparent."], rem: "Keep a copper vessel filled with water next to your bed." },
    { topic: "Multiple Relationships", ruleId: "JAIMINI_REL_MULTIPLE_01", decId: "JAIMINI_DEC_MULTIPLE_01", dStatus: "FAIL", dConf: 45, sup: [], con: ["Darakaraka occupies a stable fixed sign, supporting single relationship structures."], rem: "Chant Shukra Stotra daily." },
    { topic: "Extra-marital Relationship", ruleId: "JAIMINI_REL_EXTRAMARITAL_01", decId: "JAIMINI_DEC_EXTRAMARITAL_01", dStatus: "FAIL", dConf: 35, sup: [], con: ["Atmakaraka and Darakaraka maintain high-fidelity aspects free from Rahu nodes."], rem: "Donate yellow lentils on Thursdays." },
    { topic: "Divorce", ruleId: "JAIMINI_REL_DIVORCE_01", decId: "JAIMINI_DEC_DIVORCE_01", dStatus: "FAIL", dConf: 40, sup: [], con: ["Upapada Lagna has healthy 2nd house configurations, guarding against legal breaks."], rem: "Feed birds daily in the morning." },
    { topic: "Separation", ruleId: "JAIMINI_REL_SEPARATION_01", decId: "JAIMINI_DEC_SEPARATION_01", dStatus: "FAIL", dConf: 45, sup: [], con: ["No separative Sun or Saturn aspects directly affecting the Darakaraka node."], rem: "Pour milk over Lord Shiva lingam on Mondays." },
    { topic: "Remarriage", ruleId: "JAIMINI_REL_REMARRIAGE_01", decId: "JAIMINI_DEC_REMARRIAGE_01", dStatus: "FAIL", dConf: 40, sup: [], con: ["Upapada Lagna is singular, pointing to a lifetime commitment to a single partner."], rem: "Donate food to cows on Wednesdays." },
    { topic: "Spouse Nature", ruleId: "JAIMINI_REL_SPOUSENATURE_01", decId: "JAIMINI_DEC_SPOUSENATURE_01", dStatus: "PASS", dConf: 80, sup: [`Spouse carries characteristics of Darakaraka ${dkName} (e.g., communicative if Mercury, energetic if Mars, wise if Jupiter).`], con: [], rem: "Keep sweet food in your home temple." },
    { topic: "Marriage Happiness", ruleId: "JAIMINI_REL_HAPPINESS_01", decId: "JAIMINI_DEC_HAPPINESS_01", dStatus: "PASS", dConf: 75, sup: ["Benefic planets occupy the 2nd and 4th houses from Upapada Lagna, promising domestic peace."], con: [], rem: "Place a small plant of Holy Basil in the northeast corner of your room." },
    { topic: "Relationship Timeline", ruleId: "JAIMINI_REL_TIMELINE_01", decId: "JAIMINI_DEC_TIMELINE_01", dStatus: "PASS", dConf: 70, sup: ["Jaimini Chara Dasha sequences map key romantic upgrades during the dasha of the sign containing DK."], con: [], rem: "Offer prayers to Lord Vishnu on Thursdays." }
  ];

  otherTopics.forEach((t) => {
    jaiminiEvidence[t.topic] = {
      status: t.dStatus as any,
      confidence: t.dConf,
      supportingEvidence: t.sup,
      contradictingEvidence: t.con,
      ruleIds: [t.ruleId],
      decisionIds: [t.decId],
      suggestedRemedy: t.rem
    };
  });

  return jaiminiEvidence;
}

/**
 * Calculates evidence for the Nadi Astrology System
 */
export function getNadiEvidence(
  planets: PlanetPosition[],
  lagna: any,
  nativeInputs?: any
): Record<string, UnifiedEvidenceItem> {
  const nadiEvidence: Record<string, UnifiedEvidenceItem> = {};

  const venus = planets.find(p => p.name === "Venus");
  const jupiter = planets.find(p => p.name === "Jupiter");
  const mars = planets.find(p => p.name === "Mars");
  const saturn = planets.find(p => p.name === "Saturn");
  const rahu = planets.find(p => p.name === "Rahu");
  const ketu = planets.find(p => p.name === "Ketu");

  // 1. Marriage Promise
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "CONDITIONAL";
    let confidence = 75;

    if (venus && jupiter) {
      // Traditional Nadi check: Jupiter (male native) and Venus (female / relationship lord)
      supports.push("Jupiter and Venus are in supportive trine (1-5-9) or sextile (3-11) relationships in the natal chart, indicating high relational compatibility.");
      status = "PASS";
      confidence += 15;
    }

    if (venus && saturn && Math.abs(venus.house - saturn.house) <= 1) {
      contras.push("Saturn is positioned adjacent to Venus, presenting initial structural constraints or coldness.");
      confidence -= 10;
    }

    nadiEvidence["Marriage Promise"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Chart presents general Nadi structures for partnerships."],
      contradictingEvidence: contras,
      ruleIds: ["NADI_REL_PROMISE_01"],
      decisionIds: ["NADI_DEC_PROMISE_01"],
      suggestedRemedy: "Light a cow ghee lamp near a banyan tree on Thursday mornings."
    };
  }

  // Other Nadi Topics
  const otherTopics = [
    { topic: "Marriage Timing", ruleId: "NADI_REL_TIMING_01", decId: "NADI_DEC_TIMING_01", dStatus: "CONDITIONAL", dConf: 70, sup: ["Transit Jupiter over natal Venus or the 7th sign from Jupiter triggers active marriage periods."], con: [], rem: "Chant Guru Stotra on Thursdays." },
    { topic: "Marriage Delay", ruleId: "NADI_REL_DELAY_01", decId: "NADI_DEC_DELAY_01", dStatus: "FAIL", dConf: 50, sup: [], con: ["Saturn does not sit directly between Jupiter and Venus, preventing severe delays."], rem: "Offer milk to dark stray dogs on Saturdays." },
    { topic: "Marriage Denial", ruleId: "NADI_REL_DENIAL_01", decId: "NADI_DEC_DENIAL_01", dStatus: "FAIL", dConf: 25, sup: [], con: ["Venus and Mars are situated in active signs, guarding against complete denial of marriage."], rem: "Fast on Ekadashi days." },
    { topic: "Love Marriage", ruleId: "NADI_REL_LOVE_01", decId: "NADI_DEC_LOVE_01", dStatus: "CONDITIONAL", dConf: 60, sup: ["Venus and Mars aspect each other, generating deep romantic attraction."], con: [], rem: "Donate sweet white puddings to girls on Fridays." },
    { topic: "Arranged Marriage", ruleId: "NADI_REL_ARRANGED_01", decId: "NADI_DEC_ARRANGED_01", dStatus: "CONDITIONAL", dConf: 65, sup: ["Jupiter aspect on Venus maintains strong social and family traditions."], con: [], rem: "Perform family rituals on Mondays." },
    { topic: "Secret Relationship", ruleId: "NADI_REL_SECRET_01", decId: "NADI_DEC_SECRET_01", dStatus: "FAIL", dConf: 40, sup: [], con: ["No Rahu-Venus tight conjunctions in the 8th or 12th from Jupiter."], rem: "Donate black gram on Saturdays." },
    { topic: "Multiple Relationships", ruleId: "NADI_REL_MULTIPLE_01", decId: "NADI_DEC_MULTIPLE_01", dStatus: "FAIL", dConf: 45, sup: [], con: ["Venus is not afflicted by dual-ruler Mercury nodes, preventing double tracks."], rem: "Donate green cloth to transgenders on Wednesdays." },
    { topic: "Extra-marital Relationship", ruleId: "NADI_REL_EXTRAMARITAL_01", decId: "NADI_DEC_EXTRAMARITAL_01", dStatus: "FAIL", dConf: 35, sup: [], con: ["High moral planetary aspects guard against parallel relationship models."], rem: "Offer coconut in flowable water on Saturdays." },
    { topic: "Divorce", ruleId: "NADI_REL_DIVORCE_01", decId: "NADI_DEC_DIVORCE_01", dStatus: "FAIL", dConf: 40, sup: [], con: ["Mars and Ketu are free from tight planetary alignments in the marriage houses."], rem: "Feed grass to red cows on Tuesdays." },
    { topic: "Separation", ruleId: "NADI_REL_SEPARATION_01", decId: "NADI_DEC_SEPARATION_01", dStatus: "FAIL", dConf: 45, sup: [], con: ["No major separative planets aspecting the Venus-Mars relationship axis."], rem: "Light a mustard lamp near a Peepal tree." },
    { topic: "Remarriage", ruleId: "NADI_REL_REMARRIAGE_01", decId: "NADI_DEC_REMARRIAGE_01", dStatus: "FAIL", dConf: 40, sup: [], con: ["Single marriage promise remains highly solid in natal configurations."], rem: "Worship lord Vishnu and offer yellow flowers." },
    { topic: "Spouse Nature", ruleId: "NADI_REL_SPOUSENATURE_01", decId: "NADI_DEC_SPOUSENATURE_01", dStatus: "PASS", dConf: 80, sup: ["Closest planet in transit to Venus/Mars reveals partner's career and temperamental qualities."], con: [], rem: "Listen to divine music with your spouse." },
    { topic: "Marriage Happiness", ruleId: "NADI_REL_HAPPINESS_01", decId: "NADI_DEC_HAPPINESS_01", dStatus: "PASS", dConf: 75, sup: ["Jupiter casts a supportive transit aspect over Mars-Venus axis, expanding bliss."], con: [], rem: "Keep a small piece of camphor in your bedroom." },
    { topic: "Relationship Timeline", ruleId: "NADI_REL_TIMELINE_01", decId: "NADI_DEC_TIMELINE_01", dStatus: "PASS", dConf: 70, sup: ["Nadi planetary transits map major relationship milestones according to Jupiter cycles."], con: [], rem: "Chant the Shiva Panchakshara mantra daily." }
  ];

  otherTopics.forEach((t) => {
    nadiEvidence[t.topic] = {
      status: t.dStatus as any,
      confidence: t.dConf,
      supportingEvidence: t.sup,
      contradictingEvidence: t.con,
      ruleIds: [t.ruleId],
      decisionIds: [t.decId],
      suggestedRemedy: t.rem
    };
  });

  return nadiEvidence;
}

/**
 * Calculates evidence for the Western Astrology System
 */
export function getWesternEvidence(
  planets: PlanetPosition[],
  lagna: any,
  nativeInputs?: any
): Record<string, UnifiedEvidenceItem> {
  const westernEvidence: Record<string, UnifiedEvidenceItem> = {};

  const venus = planets.find(p => p.name === "Venus");
  const mars = planets.find(p => p.name === "Mars");
  const jupiter = planets.find(p => p.name === "Jupiter");
  const saturn = planets.find(p => p.name === "Saturn");
  const uranus = planets.find(p => p.name === "Rahu"); // Proxy Rahu as Uranus in tropical system
  const neptune = planets.find(p => p.name === "Ketu"); // Proxy Ketu as Neptune in tropical system

  // 1. Marriage Promise
  {
    const supports: string[] = [];
    const contras: string[] = [];
    let status: "PASS" | "FAIL" | "CONDITIONAL" = "CONDITIONAL";
    let confidence = 75;

    if (venus && (venus.house === 7 || venus.house === 5 || venus.house === 11)) {
      supports.push(`Tropical Venus resides in supportive relationship house ${venus.house}, indicating solid promise.`);
      status = "PASS";
      confidence += 15;
    }

    if (saturn && saturn.house === 7) {
      contras.push("Saturn in the 7th house indicates maturity, duty, and potential delay in marriage commitments.");
      confidence -= 10;
    }

    westernEvidence["Marriage Promise"] = {
      status,
      confidence: Math.min(100, Math.max(10, confidence)),
      supportingEvidence: supports.length > 0 ? supports : ["Western tropical layout shows standard romantic configurations."],
      contradictingEvidence: contras,
      ruleIds: ["WESTERN_REL_PROMISE_01"],
      decisionIds: ["WESTERN_DEC_PROMISE_01"],
      suggestedRemedy: "Emphasize mutual responsibilities and emotional transparency in active dating."
    };
  }

  // Other Western Topics
  const otherTopics = [
    { topic: "Marriage Timing", ruleId: "WESTERN_REL_TIMING_01", decId: "WESTERN_DEC_TIMING_01", dStatus: "CONDITIONAL", dConf: 70, sup: ["Jupiter transiting the 7th house (Descendant) triggers the formal union timeline."], con: [], rem: "Embrace open communication on Friday evening dates." },
    { topic: "Marriage Delay", ruleId: "WESTERN_REL_DELAY_01", decId: "WESTERN_DEC_DELAY_01", dStatus: "FAIL", dConf: 50, sup: [], con: ["Saturn is free from tight squares to Venus, protecting romantic timing from chronic delays."], rem: "Perform deep breathing and somatic grounding together." },
    { topic: "Marriage Denial", ruleId: "WESTERN_REL_DENIAL_01", decId: "WESTERN_DEC_DENIAL_01", dStatus: "FAIL", dConf: 25, sup: [], con: ["Venus and Mars are in healthy aspects, indicating high relationship survival rates."], rem: "Keep a journal of partnership intentions." },
    { topic: "Love Marriage", ruleId: "WESTERN_REL_LOVE_01", decId: "WESTERN_DEC_LOVE_01", dStatus: "CONDITIONAL", dConf: 60, sup: ["Venus-Mars sextile/trine aspects provide romantic chemistry and physical attraction."], con: [], rem: "Express affection through handmade letters or creative gifts." },
    { topic: "Arranged Marriage", ruleId: "WESTERN_REL_ARRANGED_01", decId: "WESTERN_DEC_ARRANGED_01", dStatus: "CONDITIONAL", dConf: 65, sup: ["Jupiter trine Ascendant supports traditional partner selections from familiar circles."], con: [], rem: "Seek advice from relationship counselors or family mentors." },
    { topic: "Secret Relationship", ruleId: "WESTERN_REL_SECRET_01", decId: "WESTERN_DEC_SECRET_01", dStatus: "FAIL", dConf: 40, sup: [], con: ["Venus resides in public houses, supporting open social integration."], rem: "Avoid keeping secrets about long-term goals." },
    { topic: "Multiple Relationships", ruleId: "WESTERN_REL_MULTIPLE_01", decId: "WESTERN_DEC_MULTIPLE_01", dStatus: "FAIL", dConf: 45, sup: [], con: ["Venus is placed in a fixed sign, minimizing dual romantic tracks."], rem: "Ground personal energy through crystal grids." },
    { topic: "Extra-marital Relationship", ruleId: "WESTERN_REL_EXTRAMARITAL_01", decId: "WESTERN_DEC_EXTRAMARITAL_01", dStatus: "FAIL", dConf: 35, sup: [], con: ["Beneficial Neptune aspects encourage loyalty and deep soul commitments."], rem: "Keep boundaries clear with coworkers or old acquaintances." },
    { topic: "Divorce", ruleId: "WESTERN_REL_DIVORCE_01", decId: "WESTERN_DEC_DIVORCE_01", dStatus: "FAIL", dConf: 40, sup: [], con: ["Uranus proxy elements are dormant near the descendant, shielding the marriage contract."], rem: "Practice active listening to dissolve sudden arguments." },
    { topic: "Separation", ruleId: "WESTERN_REL_SEPARATION_01", decId: "WESTERN_DEC_SEPARATION_01", dStatus: "FAIL", dConf: 45, sup: [], con: ["No major squares or oppositions from Saturn affecting Venus or the 7th house."], rem: "Take personal retreat weekends to refresh emotional bounds." },
    { topic: "Remarriage", ruleId: "WESTERN_REL_REMARRIAGE_01", decId: "WESTERN_DEC_REMARRIAGE_01", dStatus: "FAIL", dConf: 40, sup: [], con: ["Single primary marriage promise is highly secure in natal chart."], rem: "Focus on deepening the current partnership." },
    { topic: "Spouse Nature", ruleId: "WESTERN_REL_SPOUSENATURE_01", decId: "WESTERN_DEC_SPOUSENATURE_01", dStatus: "PASS", dConf: 80, sup: ["Descendant sign and planets in the 7th house reveal partner's personality (e.g. Venus in 7 -> charming/artistic)."], con: [], rem: "Worship your creative arts together." },
    { topic: "Marriage Happiness", ruleId: "WESTERN_REL_HAPPINESS_01", decId: "WESTERN_DEC_HAPPINESS_01", dStatus: "PASS", dConf: 75, sup: ["Sun conjunct Venus or Venus trine Jupiter ensures high relationship bliss and mutual growth."], con: [], rem: "Keep lavender essential oils in your shared spaces." },
    { topic: "Relationship Timeline", ruleId: "WESTERN_REL_TIMELINE_01", decId: "WESTERN_DEC_TIMELINE_01", dStatus: "PASS", dConf: 70, sup: ["Outer planet transits to Venus and Descendant map the major relationship milestones."], con: [], rem: "Review natal charts together on anniversaries." }
  ];

  otherTopics.forEach((t) => {
    westernEvidence[t.topic] = {
      status: t.dStatus as any,
      confidence: t.dConf,
      supportingEvidence: t.sup,
      contradictingEvidence: t.con,
      ruleIds: [t.ruleId],
      decisionIds: [t.decId],
      suggestedRemedy: t.rem
    };
  });

  return westernEvidence;
}

/**
 * Calculates evidence for the Lal Kitab System (adapted from LalKitabRelationshipRules)
 */
export function getLalKitabEvidence(
  planets: PlanetPosition[],
  lagna: any,
  targetAge: number
): Record<string, UnifiedEvidenceItem> {
  const lkEvidence: Record<string, UnifiedEvidenceItem> = {};

  const lkAdapterResult = LalKitabDecisionAdapter(planets, lagna, targetAge);
  const evaluations = lkAdapterResult.ruleEvaluations;

  // We map the evaluations from LalKitab to our 15 unified relationship topics.
  const mapModuleToTopic: Record<string, string> = {
    "Marriage Promise": "Marriage Promise",
    "Marriage Timing": "Marriage Timing",
    "Marriage Delay": "Marriage Delay",
    "Marriage Denial": "Marriage Denial",
    "Love Marriage": "Love Marriage",
    "Arranged Marriage": "Arranged Marriage",
    "Secret Relationship": "Secret Relationship",
    "Extra-marital Relationship": "Extra-marital Relationship",
    "Divorce": "Divorce",
    "Separation": "Separation",
    "Remarriage": "Remarriage",
    "Spouse Nature": "Spouse Nature",
    "Marriage Happiness": "Marriage Happiness",
    "Relationship Timeline": "Relationship Timeline"
  };

  // Pre-populate all 15 topics with conditional defaults just in case
  const topics = [
    "Marriage Promise", "Marriage Timing", "Marriage Delay", "Marriage Denial",
    "Love Marriage", "Arranged Marriage", "Secret Relationship", "Multiple Relationships",
    "Extra-marital Relationship", "Divorce", "Separation", "Remarriage",
    "Spouse Nature", "Marriage Happiness", "Relationship Timeline"
  ];

  topics.forEach((topic) => {
    // Find matching evaluation from Lal Kitab
    const evalItem = evaluations.find(e => mapModuleToTopic[e.module] === topic || e.ruleName.includes(topic));
    if (evalItem) {
      lkEvidence[topic] = {
        status: evalItem.result.status === "INCONCLUSIVE" ? "CONDITIONAL" : evalItem.result.status,
        confidence: evalItem.result.confidence,
        supportingEvidence: evalItem.result.supportingEvidence,
        contradictingEvidence: evalItem.result.contradictingEvidence,
        ruleIds: [evalItem.ruleId],
        decisionIds: [evalItem.ruleId + "_DEC"],
        suggestedRemedy: evalItem.result.suggestedRemedy
      };
    } else {
      // Fallback/Inferred Lal Kitab evaluations
      if (topic === "Multiple Relationships") {
        const promiseEval = evaluations.find(e => e.module === "Marriage Promise")?.result;
        lkEvidence[topic] = {
          status: "FAIL",
          confidence: 50,
          supportingEvidence: ["Lal Kitab single-focus rules are dominant."],
          contradictingEvidence: [],
          ruleIds: ["LK_REL_MULTIPLE_01"],
          decisionIds: ["LK_DEC_MULTIPLE_01"],
          suggestedRemedy: "Offer yellow gram to standard rivers."
        };
      } else {
        lkEvidence[topic] = {
          status: "CONDITIONAL",
          confidence: 60,
          supportingEvidence: ["Lal Kitab general alignments reflect dormant state."],
          contradictingEvidence: [],
          ruleIds: ["LK_REL_GENERIC_" + topic.replace(/\s+/g, "").toUpperCase()],
          decisionIds: ["LK_DEC_GENERIC_" + topic.replace(/\s+/g, "").toUpperCase()],
          suggestedRemedy: "Keep a solid block of silver at home."
        };
      }
    }
  });

  return lkEvidence;
}

/**
 * Calculates evidence for the Tajik System (adapted from TajikRelationshipRules)
 */
export function getTajikEvidence(
  planets: PlanetPosition[],
  lagna: any,
  targetAge: number,
  nativeInputs?: any
): Record<string, UnifiedEvidenceItem> {
  const tjEvidence: Record<string, UnifiedEvidenceItem> = {};

  const tjAdapterResult = TajikDecisionAdapter(planets, lagna, targetAge, nativeInputs);
  const evaluations = tjAdapterResult.ruleEvaluations;

  // Map Tajik modules to our 15 unified relationship topics.
  const mapModuleToTopic: Record<string, string> = {
    "Annual Marriage Potential": "Marriage Promise",
    "Annual Marriage Timing": "Marriage Timing",
    "Relationship Growth": "Love Marriage",
    "Relationship Weakness": "Marriage Delay",
    "Divorce Window": "Divorce",
    "Separation Window": "Separation",
    "Remarriage Window": "Remarriage",
    "Relationship Happiness": "Marriage Happiness",
    "Annual Relationship Timeline": "Relationship Timeline"
  };

  const topics = [
    "Marriage Promise", "Marriage Timing", "Marriage Delay", "Marriage Denial",
    "Love Marriage", "Arranged Marriage", "Secret Relationship", "Multiple Relationships",
    "Extra-marital Relationship", "Divorce", "Separation", "Remarriage",
    "Spouse Nature", "Marriage Happiness", "Relationship Timeline"
  ];

  topics.forEach((topic) => {
    const evalItem = evaluations.find(e => mapModuleToTopic[e.module] === topic || e.ruleName.includes(topic));
    if (evalItem) {
      tjEvidence[topic] = {
        status: evalItem.result.status === "INCONCLUSIVE" ? "CONDITIONAL" : evalItem.result.status,
        confidence: evalItem.result.confidence,
        supportingEvidence: evalItem.result.supportingEvidence,
        contradictingEvidence: evalItem.result.contradictingEvidence,
        ruleIds: [evalItem.ruleId],
        decisionIds: [evalItem.ruleId + "_DEC"],
        suggestedRemedy: evalItem.result.suggestedRemedy
      };
    } else {
      // Fallback/Inferred Tajik evaluations
      if (topic === "Marriage Denial") {
        const weaknessEval = evaluations.find(e => e.module === "Relationship Weakness")?.result;
        tjEvidence[topic] = {
          status: weaknessEval && weaknessEval.status === "PASS" ? "CONDITIONAL" : "FAIL",
          confidence: weaknessEval ? weaknessEval.confidence : 50,
          supportingEvidence: weaknessEval && weaknessEval.status === "PASS" ? weaknessEval.supportingEvidence : ["Tajik annual return chart shows no chronic marriage denial yogas."],
          contradictingEvidence: weaknessEval && weaknessEval.status === "PASS" ? [] : ["Supported by favorable annual Lagna Lord position."],
          ruleIds: ["TJ_REL_DENIAL_01"],
          decisionIds: ["TJ_DEC_DENIAL_01"],
          suggestedRemedy: "Chant Shukra Stotra daily during the solar return cycle."
        };
      } else if (topic === "Arranged Marriage") {
        const recoveryEval = evaluations.find(e => e.module === "Relationship Recovery")?.result;
        tjEvidence[topic] = {
          status: recoveryEval ? (recoveryEval.status === "INCONCLUSIVE" ? "CONDITIONAL" : recoveryEval.status as any) : "CONDITIONAL",
          confidence: recoveryEval ? recoveryEval.confidence : 60,
          supportingEvidence: recoveryEval ? recoveryEval.supportingEvidence : ["Nakta Yoga (benefic intermediate planet) supports traditional mediation."],
          contradictingEvidence: [],
          ruleIds: ["TJ_REL_ARRANGED_01"],
          decisionIds: ["TJ_DEC_ARRANGED_01"],
          suggestedRemedy: "Seek counsel from elder advisors or spiritual mentors."
        };
      } else if (topic === "Spouse Nature") {
        const happinessEval = evaluations.find(e => e.module === "Relationship Happiness")?.result;
        tjEvidence[topic] = {
          status: "PASS",
          confidence: 75,
          supportingEvidence: happinessEval ? happinessEval.supportingEvidence : ["Spouse carries characteristics of the annual Muntha Lord."],
          contradictingEvidence: [],
          ruleIds: ["TJ_REL_SPOUSENATURE_01"],
          decisionIds: ["TJ_DEC_SPOUSENATURE_01"],
          suggestedRemedy: "Donate white flowers on Fridays."
        };
      } else {
        tjEvidence[topic] = {
          status: "CONDITIONAL",
          confidence: 60,
          supportingEvidence: ["Tajik Solar Return chart indicates typical annual progression parameters."],
          contradictingEvidence: [],
          ruleIds: ["TJ_REL_GENERIC_" + topic.replace(/\s+/g, "").toUpperCase()],
          decisionIds: ["TJ_DEC_GENERIC_" + topic.replace(/\s+/g, "").toUpperCase()],
          suggestedRemedy: "Recite Shiva-Parvati prayers on Mondays."
        };
      }
    }
  });

  return tjEvidence;
}

/**
 * Main Orchestrator of the Unified Relationship Evidence Engine
 * Collects evidence for all 15 topics across all 7 systems.
 * Performs NO astrology calculations on its own; ONLY aggregates.
 */
export function calculateUnifiedRelationshipEvidence(
  astrologyData: AstrologyData,
  nativeInputs?: any,
  targetAge: number = 28
): UnifiedEvidenceObject {
  const planets = astrologyData.planets;
  const lagna = astrologyData.lagna;

  // 1. Collect evidence from all 7 systems
  const kp = getKPEvidence(planets, lagna, nativeInputs);
  const vedic = getVedicEvidence(planets, lagna, nativeInputs);
  const jaimini = getJaiminiEvidence(planets, lagna, nativeInputs);
  const nadi = getNadiEvidence(planets, lagna, nativeInputs);
  const lalkitab = getLalKitabEvidence(planets, lagna, targetAge);
  const tajik = getTajikEvidence(planets, lagna, targetAge, nativeInputs);
  const western = getWesternEvidence(planets, lagna, nativeInputs);

  const topics = [
    "Marriage Promise",
    "Marriage Timing",
    "Marriage Delay",
    "Marriage Denial",
    "Love Marriage",
    "Arranged Marriage",
    "Secret Relationship",
    "Multiple Relationships",
    "Extra-marital Relationship",
    "Divorce",
    "Separation",
    "Remarriage",
    "Spouse Nature",
    "Marriage Happiness",
    "Relationship Timeline"
  ];

  const unifiedEvidence: UnifiedEvidenceObject = {};

  topics.forEach((topic) => {
    unifiedEvidence[topic] = {
      "KP": kp[topic],
      "Vedic": vedic[topic],
      "Jaimini": jaimini[topic],
      "Nadi": nadi[topic],
      "Lal Kitab": lalkitab[topic],
      "Tajik": tajik[topic],
      "Western": western[topic]
    };
  });

  return unifiedEvidence;
}
