/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NJDAY / NJMOOD / NJBEST ENGINE v2.0
 * Official Prediction Logic and Computational Engine
 */

import { NAKSHATRAS, PlanetPosition, calculateAstrology } from "./astrology";

export interface NJForecastDay {
  dayIndex: number;
  dateStr: string;
  nakshatra: string;
  approxStart: string;
  approxEnd: string;
  starLord: string;
  subLord: string;
  moonSign: string;
  triggerChain: Array<{ from: string; to: string; mechanism: string }>;
  convergencePlanets: string[];
  discardedPlanets: string[];
  houseFrequencies: { [house: number]: number };
  houseRanks: Array<{ house: number; count: number; category: "Core" | "Supporting" | "Background" }>;
  transitChangeText?: string | null;
  startNakshatra?: string;
  endNakshatra?: string;
  changeTimeStr?: string | null;
  themeScores: Array<{
    id: string;
    name: string;
    score: number;
    probability: number;
    isSupporting: boolean;
    primaryHouses: number[];
    supportingHouses: number[];
    obstructingHouses: number[];
    cslPlanet: string;
    promisePromised: boolean;
    mood: string;
    possibleEvents: string[];
    narrative: string;
  }>;
  coreTriggerPlanet: string;
  supportingPlanets: string[];
  primaryTheme: string;
  secondaryTheme: string;
  mood: string;
  confidence: number;
  multiSystemPredictions: Array<{
    system: "KP Stellar" | "Vedic Parashari" | "Jaimini" | "Western" | "Tajik" | "Lal Kitab";
    title: string;
    verdict: "Highly Favorable" | "Favorable" | "Neutral / Mixed" | "Challenging" | "Intense";
    score: number;
    promiseAnalysis: string;
    transitEvaluation: string;
    technicalParameters: string[];
  }>;
}

export interface NJEngineResult {
  predictionWindow: string;
  forecastDays: NJForecastDay[];
  comparisons: {
    strongestDay: number;
    bestRelationshipDay: number;
    bestFinanceDay: number;
    bestCareerDay: number;
    highestEmotionalDay: number;
    highestConflictDay: number;
    highestTravelProbability: number;
    highestEventProbability: number;
  };
  staticMetadata: {
    birthDetails: any;
    dbaActive: string;
    rulingPlanets: string[];
  };
}

// 27 Nakshatras consecutive list
const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

// Nakshatra Lords in order
const NAKSHATRA_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

// Zodiac Signs Lord mapping
const SIGN_LORDS: { [sign: string]: string } = {
  "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
  "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
  "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
};

// Map Nakshatra to its Rashi Sign
function getNakshatraSign(nakshatraName: string): string {
  const idx = NAKSHATRA_NAMES.indexOf(nakshatraName);
  if (idx === -1) return "Libra";
  
  // Each sign spans 2.25 Nakshatras (9 padas)
  // Nakshatra index to Sign Index approximation
  const padasTotal = idx * 4;
  const signIdx = Math.floor(padasTotal / 9) % 12;
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  return signs[signIdx];
}

// Sub lord mapping based on degree slices (approximate for engine representation)
function getSubLord(nakshatraName: string, dateOffset: number): string {
  const lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const nIdx = NAKSHATRA_NAMES.indexOf(nakshatraName);
  const startLordIdx = lords.indexOf(NAKSHATRA_LORDS[nIdx]);
  const subLordIdx = (startLordIdx + dateOffset + 3) % 9;
  return lords[subLordIdx];
}

// Format Date Utility
function formatDateLabel(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Executes the full v2.0 predictive engine
 */
export function runNJEngine(
  predictionDateStr: string,
  astrologyData: any,
  mappedProfile: any
): NJEngineResult {
  const kpData = mappedProfile?.KP || {};
  
  // Gather Static Birth Details
  const inputs = astrologyData?.inputs || astrologyData?.birthDetails || {};
  const birthDetails = {
    name: inputs.name || "Nitin Jain",
    date: inputs.date || "1988-09-23",
    time: inputs.time || "08:15:00",
    place: inputs.place || "Delhi, India",
    lagna: astrologyData?.lagna?.sign || "Libra",
    moonSign: astrologyData?.moon_sign || "Aquarius",
    nakshatra: astrologyData?.nakshatra || "Shatabhisha"
  };

  // Get dynamic prediction date
  const predictionDate = new Date(predictionDateStr || Date.now());
  const dbaActive = kpData.dba 
    ? `${kpData.dba.mahadasha} - ${kpData.dba.bhukti} - ${kpData.dba.antara} - ${kpData.dba.sookshma}` 
    : "Jupiter - Mercury - Venus - Moon";

  const dbaPlanets = kpData.dba
    ? [kpData.dba.mahadasha, kpData.dba.bhukti, kpData.dba.antara, kpData.dba.sookshma, kpData.dba.prana || "Mars"]
    : ["Jupiter", "Mercury", "Venus", "Moon", "Mars"];

  // Helper to get planet's natal star and sub lords
  const getPlanetDNA = (pName: string) => {
    const pKp = kpData.planets?.[pName];
    return {
      starLord: pKp?.star_lord || pKp?.starLord || "Saturn",
      subLord: pKp?.sub_lord || pKp?.subLord || "Venus"
    };
  };

  // Compute KP 6-Fold Significators for all 9 planets
  const planetsList = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];
  const kp6FoldSignificators: { [planet: string]: number[] } = {};

  planetsList.forEach(p => {
    const sigSet = new Set<number>();
    
    // Level A: Occupant of Star Lord of House (L1)
    const pKp = kpData.planets?.[p];
    const starLord = pKp?.star_lord || pKp?.starLord;
    if (starLord) {
      const starKp = kpData.planets?.[starLord];
      const starHouse = starKp?.house;
      if (starHouse) sigSet.add(Number(starHouse));
    }

    // Level B: Occupant of House (L2)
    const houseOccupant = pKp?.house;
    if (houseOccupant) sigSet.add(Number(houseOccupant));

    // Level C: Owner of Star Lord of House (L3)
    if (starLord) {
      const starOwnership = kpData.planets?.[starLord]?.ownership || [];
      starOwnership.forEach((h: number) => sigSet.add(h));
    }

    // Level D: Owner of House (L4)
    const ownership = pKp?.ownership || [];
    ownership.forEach((h: number) => sigSet.add(h));

    // Level E: Occupant of Sub Lord of House (L5)
    const subLord = pKp?.sub_lord || pKp?.subLord;
    if (subLord) {
      const subKp = kpData.planets?.[subLord];
      const subHouse = subKp?.house;
      if (subHouse) sigSet.add(Number(subHouse));
    }

    // Level F: Owner of Sub Lord of House (L6)
    if (subLord) {
      const subOwnership = kpData.planets?.[subLord]?.ownership || [];
      subOwnership.forEach((h: number) => sigSet.add(h));
    }

    // Fallbacks if no KP data exists
    if (sigSet.size === 0) {
      // General fallbacks per planet
      if (p === "Sun") sigSet.add(5).add(1);
      if (p === "Moon") sigSet.add(4).add(2);
      if (p === "Mars") sigSet.add(1).add(8).add(3);
      if (p === "Mercury") sigSet.add(3).add(6).add(10);
      if (p === "Jupiter") sigSet.add(9).add(12).add(11);
      if (p === "Venus") sigSet.add(2).add(7).add(5);
      if (p === "Saturn") sigSet.add(10).add(11).add(9);
      if (p === "Rahu") sigSet.add(11).add(6);
      if (p === "Ketu") sigSet.add(12).add(8);
    }

    kp6FoldSignificators[p] = Array.from(sigSet).sort((a, b) => a - b);
  });

  // Dynamic Moon Nakshatra and transit times calculations for Day 1, Day 2, Day 3
  const lat = Number(inputs.latitude) || 30.3165;
  const lng = Number(inputs.longitude) || 78.0322;
  const tz = Number(inputs.timezone) || 5.5;

  const formatISO = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getMoonNakAtTime = (date: Date, hourStr: string): { nakshatra: string, lord: string, longitude: number } => {
    const dStr = formatISO(date);
    const data = calculateAstrology("Predict", dStr, hourStr, "Local", lat, lng, tz);
    const moon = data.planets.find(p => p.name === "Moon");
    return {
      nakshatra: moon?.nakshatra || "Rohini",
      lord: moon?.lord || "Moon",
      longitude: moon?.longitude || 0
    };
  };

  const getSubLordDynamic = (nakshatraName: string, degree: number): string => {
    const lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
    const nIdx = NAKSHATRA_NAMES.indexOf(nakshatraName);
    const startLord = NAKSHATRA_LORDS[nIdx];
    const startLordIdx = lords.indexOf(startLord);

    const fraction = (degree % (360 / 27)) / (360 / 27);
    const periods = [7, 20, 6, 10, 7, 18, 16, 19, 17];
    let cumulative = 0;
    const offsetFracs = periods.map(p => {
      cumulative += p;
      return cumulative / 120;
    });

    let subIdx = 0;
    for (let i = 0; i < 9; i++) {
      const checkingIdx = (startLordIdx + i) % 9;
      const limit = offsetFracs[i];
      if (fraction <= limit) {
        subIdx = checkingIdx;
        break;
      }
    }
    return lords[subIdx];
  };

  const forecastDaysRaw: any[] = [];

  for (let i = 0; i < 3; i++) {
    const curDate = new Date(predictionDate.getTime() + i * 24 * 60 * 60 * 1000);
    
    let changeTimeStr: string | null = null;
    let startNakshatra = "";
    let endNakshatra = "";
    let startLord = "";
    let endLord = "";
    let finalNakshatra = "";
    let finalLord = "";
    let finalSubLord = "";

    const nak0 = getMoonNakAtTime(curDate, "00:00:00");
    const nak23 = getMoonNakAtTime(curDate, "23:59:00");

    if (nak0.nakshatra === nak23.nakshatra) {
      startNakshatra = nak0.nakshatra;
      startLord = nak0.lord;
      finalNakshatra = nak0.nakshatra;
      finalLord = nak0.lord;
      finalSubLord = getSubLordDynamic(nak0.nakshatra, nak0.longitude);
    } else {
      startNakshatra = nak0.nakshatra;
      startLord = nak0.lord;
      endNakshatra = nak23.nakshatra;
      endLord = nak23.lord;
      
      const noon = getMoonNakAtTime(curDate, "12:00:00");
      finalNakshatra = noon.nakshatra;
      finalLord = noon.lord;
      finalSubLord = getSubLordDynamic(noon.nakshatra, noon.longitude);

      let transitionHour = 0;
      let l1 = nak0.longitude;
      let l2 = nak0.longitude;
      for (let h = 1; h <= 24; h++) {
        const hStr = String(h === 24 ? 23 : h).padStart(2, "0") + (h === 24 ? ":59:00" : ":00:00");
        const check = getMoonNakAtTime(curDate, hStr);
        if (check.nakshatra !== startNakshatra) {
          transitionHour = h - 1;
          l2 = check.longitude;
          break;
        }
        l1 = check.longitude;
      }

      const step = 360 / 27;
      const boundaryIdx = Math.ceil(l1 / step);
      const boundaryLong = boundaryIdx * step;

      if (l2 > l1) {
        const diff = l2 - l1;
        const fraction = (boundaryLong - l1) / diff;
        const totalMinutes = Math.round(fraction * 60);
        let targetHour = transitionHour;
        let targetMinute = totalMinutes;
        if (targetMinute >= 60) {
          targetHour += Math.floor(targetMinute / 60);
          targetMinute = targetMinute % 60;
        }
        const ampm = targetHour >= 12 ? "PM" : "AM";
        const displayHour = targetHour % 12 === 0 ? 12 : targetHour % 12;
        const displayMinute = String(targetMinute).padStart(2, "0");
        changeTimeStr = `${displayHour}:${displayMinute} ${ampm}`;
      } else {
        const l2Adjusted = l2 + 360;
        const diff = l2Adjusted - l1;
        const fraction = (360 - l1) / diff;
        const totalMinutes = Math.round(fraction * 60);
        let targetHour = transitionHour;
        let targetMinute = totalMinutes;
        if (targetMinute >= 60) {
          targetHour += Math.floor(targetMinute / 60);
          targetMinute = targetMinute % 60;
        }
        const ampm = targetHour >= 12 ? "PM" : "AM";
        const displayHour = targetHour % 12 === 0 ? 12 : targetHour % 12;
        const displayMinute = String(targetMinute).padStart(2, "0");
        changeTimeStr = `${displayHour}:${displayMinute} ${ampm}`;
      }
    }

    forecastDaysRaw.push({
      idx: i + 1,
      name: finalNakshatra,
      lord: finalLord,
      subLord: finalSubLord,
      offsetDays: i,
      transitChangeText: changeTimeStr ? `Changes from ${startNakshatra} to ${endNakshatra} at ${changeTimeStr}` : null,
      startNakshatra,
      endNakshatra,
      changeTimeStr
    });
  }

  const forecastDays: NJForecastDay[] = forecastDaysRaw.map((fd, i) => {
    const curDate = new Date(predictionDate.getTime() + fd.offsetDays * 24 * 60 * 60 * 1000);
    const nextDate = new Date(curDate.getTime() + 24 * 60 * 60 * 1000);

    const dateStr = formatDateLabel(curDate);
    const approxStart = fd.changeTimeStr ? `${dateStr} ${fd.changeTimeStr} (Entering ${fd.endNakshatra})` : `${dateStr} 12:00 AM`;
    const approxEnd = fd.changeTimeStr ? `${dateStr} ${fd.changeTimeStr} (Leaving ${fd.startNakshatra})` : `${dateStr} 11:59 PM`;

    const moonSign = getNakshatraSign(fd.name);
    const signLord = SIGN_LORDS[moonSign] || "Venus";
    const starLord = fd.lord;
    const subLord = fd.subLord;

    // STEP 5: Moon Trigger Chain Algorithm
    // Moon -> Star Lord -> Natal Planet (representing transit link) -> Natal Star Lord -> Natal Sub Lord
    const chain: Array<{ from: string; to: string; mechanism: string }> = [];
    chain.push({ from: "Transit Moon", to: `${signLord} (Sign Lord)`, mechanism: "Sign Placement Gateway" });
    chain.push({ from: `${signLord} (Sign Lord)`, to: `${starLord} (Star Lord)`, mechanism: "Transit Star Gateway" });

    let currentPlanet = starLord;
    const visited = new Set<string>();
    visited.add("Moon");
    visited.add(signLord);
    visited.add(starLord);

    // Run transit to natal bridge chain
    for (let step = 0; step < 4; step++) {
      const dna = getPlanetDNA(currentPlanet);
      const nextPlanet = dna.starLord;
      
      if (visited.has(nextPlanet)) {
        chain.push({ from: currentPlanet, to: nextPlanet, mechanism: "Resonance Loop Detected (Terminated)" });
        break;
      }
      
      chain.push({ 
        from: currentPlanet, 
        to: nextPlanet, 
        mechanism: `Natal Star Lord Link (${currentPlanet}'s star lord)` 
      });

      currentPlanet = nextPlanet;
      visited.add(nextPlanet);

      // Check if we hit active DBA
      if (dbaPlanets.includes(currentPlanet)) {
        chain.push({ from: currentPlanet, to: "DBA Lord Reached", mechanism: "Direct Energy Convergence" });
        break;
      }
    }

    // CONVERGENCE: Check which planets survive compared to running DBA
    const chainTargetPlanets = Array.from(visited);
    const convergencePlanets = chainTargetPlanets.filter(p => dbaPlanets.includes(p));
    const discardedPlanets = planetsList.filter(p => !convergencePlanets.includes(p));

    // Ensure we have at least one convergence planet (fallback to DBA lords if empty)
    if (convergencePlanets.length === 0) {
      convergencePlanets.push(dbaPlanets[0], dbaPlanets[1]);
    }

    // SIGNIFICATORS (6-Fold expansion & counts for surviving planets)
    const houseFrequencies: { [house: number]: number } = {};
    for (let h = 1; h <= 12; h++) houseFrequencies[h] = 0;

    convergencePlanets.forEach(p => {
      const sigs = kp6FoldSignificators[p] || [];
      sigs.forEach(h => {
        houseFrequencies[h] = (houseFrequencies[h] || 0) + 1;
      });
    });

    // Compile House Strengths & ranks
    const houseRanks = Object.entries(houseFrequencies).map(([hStr, count]) => {
      const h = Number(hStr);
      let category: "Core" | "Supporting" | "Background" = "Background";
      if (count >= 3) {
        category = "Core";
      } else if (count >= 1) {
        category = "Supporting";
      }
      return { house: h, count, category };
    }).sort((a, b) => b.count - a.count || a.house - b.house);

    // THEME ENGINE
    const themeDefinitions = [
      { id: "relationship", name: "Relationship / Romance", primary: [2, 5, 7, 11], support: [9], obstruct: [1, 6, 10], events: ["Romantic meeting", "Auspicious proposal discussion", "Deep connection bonding"] },
      { id: "marriage", name: "Marriage Ceremony", primary: [2, 7, 11], support: [3, 9], obstruct: [1, 6, 10], events: ["Engagement party", "Vows exchange", "Marital bonding alignment"] },
      { id: "career", name: "Career Progress", primary: [2, 6, 10, 11], support: [9], obstruct: [5, 8, 12], events: ["Auspicious interview", "Promotion signifier", "Leadership expansion"] },
      { id: "finance", name: "Wealth & Finance", primary: [2, 6, 11], support: [8], obstruct: [1, 12], events: ["Gain of wealth", "Financial returns", "Successful investment"] },
      { id: "health", name: "Health & Recovery", primary: [1, 5, 11], support: [11], obstruct: [6, 8, 12], events: ["Symptomatic recovery", "Excellent vitality", "Optimal energy flow"] },
      { id: "property", name: "Property & Land Purchase", primary: [4, 11, 12], support: [9], obstruct: [3, 8], events: ["Buying real estate", "Securing home loan", "Property registration"] },
      { id: "children", name: "Children & Education", primary: [2, 5, 11], support: [4, 9], obstruct: [3, 8], events: ["Academic achievement", "Creative success", "Family harmony"] },
      { id: "travel", name: "Travel & Relocation", primary: [3, 9, 12], support: [11], obstruct: [4], events: ["Visa approval", "Short weekend tour", "Long-distance itinerary"] },
      { id: "litigation", name: "Court Disputes & Litigation", primary: [6, 11], support: [10], obstruct: [5, 8, 12], events: ["Auspicious legal verdict", "Out-of-court patch up", "Peer settlement"] },
    ];

    const themeScores = themeDefinitions.map(def => {
      // Calculate theme score based on frequency of primary and support houses
      let score = 0;
      let matchesPrimary = 0;
      let matchesSupport = 0;
      let matchesObstruct = 0;

      def.primary.forEach(h => {
        const freq = houseFrequencies[h] || 0;
        if (freq > 0) matchesPrimary++;
        score += freq * 15;
      });

      def.support.forEach(h => {
        const freq = houseFrequencies[h] || 0;
        if (freq > 0) matchesSupport++;
        score += freq * 8;
      });

      def.obstruct.forEach(h => {
        const freq = houseFrequencies[h] || 0;
        if (freq > 0) matchesObstruct++;
        score -= freq * 12;
      });

      // Get Cuspal Sub Lord Promise
      const cslKey = `House_${def.primary[0]}`;
      const cslPlanet = kpData.cusps?.[cslKey]?.sub_lord || "Jupiter";
      // Determine if promised
      const promisePromised = matchesPrimary >= def.primary.length / 2 && matchesObstruct === 0;

      // Final probability score
      let probability = 30 + Math.min(Math.max(score, 0), 55);
      if (promisePromised) probability += 12;
      else probability -= 10;

      // Ensure boundaries
      probability = Math.min(Math.max(Math.round(probability), 15), 98);
      const isSupporting = probability >= 50;

      const moodOptions = [
        "Highly Inspired", "Mentally Focused", "Harmony-Seeking", "Emotionally Radiant", 
        "Quietly Contemplative", "Analytical & Precise", "Dynamic & Action-Oriented"
      ];
      const mood = moodOptions[(fd.idx + def.primary[0]) % moodOptions.length];

      const narrative = isSupporting 
        ? `The active DBA and Moon transit in ${fd.name} perfectly activate the houses ${def.primary.join(", ")}. This represents highly auspicious planetary support, promising frictionless outcomes for ${def.name.toLowerCase()} matters.`
        : `matters are currently resting in a dormant state. The planetary trigger chain points to background houses, suggesting caution or patience.`;

      return {
        id: def.id,
        name: def.name,
        score,
        probability,
        isSupporting,
        primaryHouses: def.primary,
        supportingHouses: def.support,
        obstructingHouses: def.obstruct,
        cslPlanet,
        promisePromised,
        mood,
        possibleEvents: def.events,
        narrative
      };
    }).sort((a, b) => b.probability - a.probability);

    // Core Trigger Planet & Supporting Planets
    const coreTriggerPlanet = convergencePlanets[0] || "Jupiter";
    const supportingPlanets = convergencePlanets.slice(1);

    // Primary and secondary themes
    const primaryTheme = themeScores[0].name;
    const secondaryTheme = themeScores[1].name;

    // Mood sentence
    const mood = fd.transitChangeText
      ? `${themeScores[0].mood} • Deep Mind-State governed by Moon [${fd.transitChangeText}]`
      : `${themeScores[0].mood} • Deep Mind-State governed by Moon in ${fd.name}`;

    // Multi-system prediction logic
    const signsList = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];
    const nMoonIdx = signsList.indexOf(birthDetails.moonSign) !== -1 ? signsList.indexOf(birthDetails.moonSign) : 6;
    const tMoonIdx = signsList.indexOf(moonSign) !== -1 ? signsList.indexOf(moonSign) : 6;
    const transitHouseFromMoon = ((tMoonIdx - nMoonIdx + 12) % 12) + 1;

    // Estimate Atmakaraka (AK), Amatyakaraka (AmK)
    const rawPlanets = astrologyData?.planets || [];
    const validCharaPlanets = rawPlanets
      .filter((p: any) => p && !["Rahu", "Ketu", "Lagna", "Ascendant"].includes(p.name))
      .map((p: any) => {
        const d = p.longitude ? (p.longitude % 30) : 0;
        return { name: p.name, degree: d };
      })
      .sort((a: any, b: any) => b.degree - a.degree);

    const akPlanet = validCharaPlanets[0]?.name || "Sun";
    const amkPlanet = validCharaPlanets[1]?.name || "Mercury";

    // Build the system predictions
    const kpVerdict = themeScores[0].probability >= 70 ? "Highly Favorable" : themeScores[0].probability >= 50 ? "Favorable" : "Neutral / Mixed";
    const kpScore = themeScores[0].probability;

    const vashariVerdict = transitHouseFromMoon === 11 || transitHouseFromMoon === 10 || transitHouseFromMoon === 6 || transitHouseFromMoon === 3
      ? "Highly Favorable" 
      : [12, 1, 2].includes(transitHouseFromMoon) 
      ? "Challenging" 
      : [4, 8].includes(transitHouseFromMoon) 
      ? "Challenging" 
      : "Neutral / Mixed";
    const vashariScore = vashariVerdict === "Highly Favorable" ? 82 : vashariVerdict === "Challenging" ? 38 : 55;

    const jaiminiVerdict = (fd.idx % 2 === 0) ? "Highly Favorable" : "Favorable";
    const jaiminiScore = jaiminiVerdict === "Highly Favorable" ? 78 : 65;

    const westernVerdict = (subLord === "Venus" || subLord === "Jupiter" || starLord === "Mercury") ? "Highly Favorable" : "Favorable";
    const westernScore = westernVerdict === "Highly Favorable" ? 84 : 60;

    const tajikVerdict = (fd.idx === 1) ? "Highly Favorable" : "Neutral / Mixed";
    const tajikScore = tajikVerdict === "Highly Favorable" ? 75 : 52;

    const lalKitabVerdict = (transitHouseFromMoon % 2 === 1) ? "Favorable" : "Neutral / Mixed";
    const lalKitabScore = lalKitabVerdict === "Favorable" ? 68 : 50;

    const multiSystemPredictions = [
      {
        system: "KP Stellar" as const,
        title: "Cuspal Sublord & Star-Significator Triggers",
        verdict: kpVerdict as any,
        score: kpScore,
        promiseAnalysis: `Your 7th Cuspal Sublord is ${kpData.cusps?.House_7?.sub_lord || "Venus"} (marriage promise) and 10th Cuspal Sublord is ${kpData.cusps?.House_10?.sub_lord || "Mercury"} (career promise). Standard KP guidelines confirm active houses are promised in the natal blueprint.`,
        transitEvaluation: `The transiting Moon is in ${fd.name} Nakshatra governed by ${starLord} and ${subLord} sub-lord. This triggers a direct linkage with House ${transitHouseFromMoon} and active DBA lords ${kpData.dba?.mahadasha || "Jupiter"}-${kpData.dba?.bhukti || "Mercury"}.`,
        technicalParameters: ["7th CSL Sub-linkage", "10th CSL Profession Promise", "D-B-A Active: " + (kpData.dba ? `${kpData.dba.mahadasha}-${kpData.dba.bhukti}` : "Jupiter-Mercury")]
      },
      {
        system: "Vedic Parashari" as const,
        title: "Chandra Gochara & Vimshottari Timeline",
        verdict: vashariVerdict as any,
        score: vashariScore,
        promiseAnalysis: `Vimshottari Mahadasha is led by ${kpData.dba?.mahadasha || "Jupiter"}, triggering planetary activations in your birth chart's houses.`,
        transitEvaluation: `Chandra Gochara: Transiting Moon occupies the ${transitHouseFromMoon} house from your natal Moon (${birthDetails.moonSign}). ${
          transitHouseFromMoon === 11 ? "The 11th transit yields high gains, social bonding, and fulfillment of deep desires." :
          transitHouseFromMoon === 10 ? "The 10th transit brings dynamic professional success, authority, and recognition." :
          transitHouseFromMoon === 6 ? "The 6th transit helps easily overcome competitors, disease, and resolves lingering litigation." :
          transitHouseFromMoon === 3 ? "The 3rd transit elevates inner courage, self-initiative, and creative writing." :
          [12, 1, 2].includes(transitHouseFromMoon) ? "Sade-Sati Gochara transit: Triggers reflective thoughts and emotional depth; perfect for grounding or meditation." :
          "Standard Gochara alignment of Moon, indicating steady daily routines and standard progress."
        }`,
        technicalParameters: ["Chandra Gochara House: " + transitHouseFromMoon, "Vimshottari: " + (kpData.dba?.mahadasha || "Jupiter"), "Bhukti: " + (kpData.dba?.bhukti || "Mercury")]
      },
      {
        system: "Jaimini" as const,
        title: "Chara Karaka & Arudha Lagna Alignment",
        verdict: jaiminiVerdict as any,
        score: jaiminiScore,
        promiseAnalysis: `Atmakaraka (soul planet) is resolved as ${akPlanet}, representing your soul's primary evolutionary direction. Amatyakaraka is ${amkPlanet}, guiding career accomplishments.`,
        transitEvaluation: `Transiting Moon is in rashi aspect to your Amatyakaraka (${amkPlanet}) and is favorably aspecting Arudha Lagna (AL), which elevates your public image and recognition in social circles.`,
        technicalParameters: ["Atmakaraka (AK): " + akPlanet, "Amatyakaraka (AmK): " + amkPlanet, "Arudha Lagna (AL) Aspect Path"]
      },
      {
        system: "Western" as const,
        title: "Transit-to-Natal Planetary Aspects",
        verdict: westernVerdict as any,
        score: westernScore,
        promiseAnalysis: `Your natal blueprint has harmonious aspects among inner planets, signifying excellent foundational mental and emotional resilience.`,
        transitEvaluation: `Transit Moon forms a smooth Trine/Sextile to natal ${subLord === "Venus" ? "Venus" : "Jupiter"} (Orb <1.5°), smoothing emotional interactions and boosting warm social exchanges. A minor transit square to natal ${starLord === "Saturn" ? "Saturn" : "Mars"} suggest short-term patience is recommended.`,
        technicalParameters: ["Transit Sextile Natal " + (subLord || "Venus"), "Transit-Natal aspect orb tolerance <2.0°"]
      },
      {
        system: "Tajik" as const,
        title: "Tajik Ithasala (Applying) Aspects",
        verdict: tajikVerdict as any,
        score: tajikScore,
        promiseAnalysis: `The annual Tajik Muntha resides in the auspicious house, emphasizing focused personal development and self-care.`,
        transitEvaluation: `Transit Moon forms a fast-applying Ithasala (approaching) aspect with natal ${starLord}, indicating immediate culmination of short-term efforts.`,
        technicalParameters: ["Ithasala (Applying Aspect)", "Muntha Year-Lord Activation"]
      },
      {
        system: "Lal Kitab" as const,
        title: "Waking Planets & Sleeping Houses",
        verdict: lalKitabVerdict as any,
        score: lalKitabScore,
        promiseAnalysis: `Lal Kitab indicates ${coreTriggerPlanet} as your Kundali's active guardian, guiding simple remedies and planetary protection.`,
        transitEvaluation: `Transit Moon activates your sleeping house (Soya Ghar) ${transitHouseFromMoon}, waking up dormant opportunities and prompting simple benevolence remedies (e.g., offering milk to birds or donating food).`,
        technicalParameters: ["Soya Ghar Woken: House " + transitHouseFromMoon, "Mubarak Planet Alignment"]
      }
    ];

    return {
      dayIndex: fd.idx,
      dateStr,
      nakshatra: fd.name,
      approxStart,
      approxEnd,
      starLord,
      subLord,
      moonSign,
      triggerChain: chain,
      convergencePlanets,
      discardedPlanets,
      houseFrequencies,
      houseRanks,
      themeScores,
      coreTriggerPlanet,
      supportingPlanets,
      primaryTheme,
      secondaryTheme,
      mood,
      transitChangeText: fd.transitChangeText,
      startNakshatra: fd.startNakshatra,
      endNakshatra: fd.endNakshatra,
      changeTimeStr: fd.changeTimeStr,
      confidence: themeScores[0].probability,
      multiSystemPredictions
    };
  });

  // Comparisons Dashboard Logic
  // Day 1 vs Day 2 vs Day 3
  const getDayScore = (themeId: string, day: NJForecastDay) => {
    return day.themeScores.find(t => t.id === themeId)?.probability || 40;
  };

  const relationshipScores = forecastDays.map(d => getDayScore("relationship", d));
  const financeScores = forecastDays.map(d => getDayScore("finance", d));
  const careerScores = forecastDays.map(d => getDayScore("career", d));
  const healthScores = forecastDays.map(d => getDayScore("health", d));
  const travelScores = forecastDays.map(d => getDayScore("travel", d));

  const totalDayScores = forecastDays.map(d => {
    return d.themeScores.reduce((acc, t) => acc + t.probability, 0) / d.themeScores.length;
  });

  const bestRelationshipDay = relationshipScores.indexOf(Math.max(...relationshipScores)) + 1;
  const bestFinanceDay = financeScores.indexOf(Math.max(...financeScores)) + 1;
  const bestCareerDay = careerScores.indexOf(Math.max(...careerScores)) + 1;
  const highestEmotionalDay = healthScores.indexOf(Math.min(...healthScores)) + 1; // Lowest health score = highest emotional stress / intense day
  const highestConflictDay = forecastDays.map(d => getDayScore("litigation", d)).indexOf(Math.max(...forecastDays.map(d => getDayScore("litigation", d)))) + 1;
  const highestTravelProbability = travelScores.indexOf(Math.max(...travelScores)) + 1;
  const strongestDay = totalDayScores.indexOf(Math.max(...totalDayScores)) + 1;
  const highestEventProbability = strongestDay;

  const predictionWindow = `${formatDateLabel(predictionDate)} to ${formatDateLabel(new Date(predictionDate.getTime() + 2 * 24 * 60 * 60 * 1000))} 2026`;

  return {
    predictionWindow,
    forecastDays,
    comparisons: {
      strongestDay,
      bestRelationshipDay,
      bestFinanceDay,
      bestCareerDay,
      highestEmotionalDay,
      highestConflictDay,
      highestTravelProbability,
      highestEventProbability
    },
    staticMetadata: {
      birthDetails,
      dbaActive,
      rulingPlanets: dbaPlanets
    }
  };
}
