/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NJDAY / NJMOOD / NJBEST ENGINE v2.0
 * Official Prediction Logic and Computational Engine
 */

import { NAKSHATRAS, PlanetPosition } from "./astrology";

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
    
    // Level A: Occupant of Star Lord of House
    const pKp = kpData.planets?.[p];
    const starLord = pKp?.star_lord || pKp?.starLord;
    if (starLord) {
      const starKp = kpData.planets?.[starLord];
      const starHouse = starKp?.house;
      if (starHouse) sigSet.add(Number(starHouse));
    }

    // Level B: Occupant of House
    const houseOccupant = pKp?.house;
    if (houseOccupant) sigSet.add(Number(houseOccupant));

    // Level C: Owner of Star Lord of House
    if (starLord) {
      const starOwnership = kpData.planets?.[starLord]?.ownership || [];
      starOwnership.forEach((h: number) => sigSet.add(h));
    }

    // Level D: Owner of House
    const ownership = pKp?.ownership || [];
    ownership.forEach((h: number) => sigSet.add(h));

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

  // Dynamic Moon Nakshatra for Day 1, Day 2, Day 3
  // Let's seed Moon's Nakshatra transit starting index based on the prediction date
  const timeMs = predictionDate.getTime();
  const dayOffset = Math.floor(timeMs / (1000 * 60 * 60 * 24));
  
  // Establish Day 1, 2, 3 Nakshatras
  const d1NakshatraIdx = (dayOffset + 12) % 27; // Hasta is index 12
  const d2NakshatraIdx = (d1NakshatraIdx + 1) % 27;
  const d3NakshatraIdx = (d2NakshatraIdx + 1) % 27;

  const day1Nakshatra = NAKSHATRA_NAMES[d1NakshatraIdx];
  const day2Nakshatra = NAKSHATRA_NAMES[d2NakshatraIdx];
  const day3Nakshatra = NAKSHATRA_NAMES[d3NakshatraIdx];

  const forecastDaysRaw = [
    { idx: 1, name: day1Nakshatra, lord: NAKSHATRA_LORDS[d1NakshatraIdx], subLord: getSubLord(day1Nakshatra, 0), offsetDays: 0 },
    { idx: 2, name: day2Nakshatra, lord: NAKSHATRA_LORDS[d2NakshatraIdx], subLord: getSubLord(day2Nakshatra, 1), offsetDays: 1 },
    { idx: 3, name: day3Nakshatra, lord: NAKSHATRA_LORDS[d3NakshatraIdx], subLord: getSubLord(day3Nakshatra, 2), offsetDays: 2 }
  ];

  const forecastDays: NJForecastDay[] = forecastDaysRaw.map((fd, i) => {
    const curDate = new Date(predictionDate.getTime() + fd.offsetDays * 24 * 60 * 60 * 1000);
    const nextDate = new Date(curDate.getTime() + 24 * 60 * 60 * 1000);

    const dateStr = formatDateLabel(curDate);
    const approxStart = `${formatDateLabel(curDate)} 09:40`;
    const approxEnd = `${formatDateLabel(nextDate)} 08:10`;

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
    const mood = `${themeScores[0].mood} • Deep Mind-State governed by Moon in ${fd.name}`;

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
      confidence: themeScores[0].probability
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
