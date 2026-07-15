/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlanetPosition {
  name: string;
  longitude: number; // 0 to 360
  sign: string;      // Zodiac Sign Name
  signIndex: number; // 0 to 11 (Aries to Pisces)
  degree: number;    // Degree within the sign (0 to 30)
  nakshatra: string; // Nakshatra Name
  pada: number;      // 1 to 4
  house: number;     // 1 to 12 (1 is Lagna house)
  strength: number;  // Calculated planetary strength (0 to 100)
  lord: string;      // Nakshatra Lord
}

export interface AstrologyData {
  birthDetails: {
    name: string;
    date: string;
    time: string;
    location: string;
    latitude: number;
    longitude: number;
    timezone: number; // in hours from UTC
  };
  lagna: {
    sign: string;
    signIndex: number;
    longitude: number;
    degree: number;
  };
  planets: PlanetPosition[];
  rasiChart: { [house: number]: string[] }; // house (1-12) to list of planet names
  navamsaChart: { [house: number]: string[] }; // house (1-12) to list of planet names
  dashas: DashaPeriod[];
  yogas: YogaAnalysis[];
  doshas: DoshaAnalysis;
  muhurtas: MuhurtaSlot[];
}

export interface DashaPeriod {
  lord: string;
  startDate: string;
  endDate: string;
  subPeriods?: DashaPeriod[];
}

export interface YogaAnalysis {
  name: string;
  type: string; // Raja, Dhana, Nabhasa, etc.
  description: string;
  isPresent: boolean;
  explanation: string;
}

export interface DoshaAnalysis {
  manglik: { isPresent: boolean; score: number; explanation: string };
  kaalSarp: { isPresent: boolean; type: string; explanation: string };
  sadeSati: { isPresent: boolean; stage: string; explanation: string };
}

export interface MuhurtaSlot {
  name: string;
  startTime: string;
  endTime: string;
  isAuspicious: boolean;
  score: number; // 1-5 rating
}

// Zodiac Signs
export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Nakshatras & their Lords in Vimshottari order
export const NAKSHATRAS = [
  { name: "Ashwini", lord: "Ketu" },
  { name: "Bharani", lord: "Venus" },
  { name: "Krittika", lord: "Sun" },
  { name: "Rohini", lord: "Moon" },
  { name: "Mrigashira", lord: "Mars" },
  { name: "Ardra", lord: "Rahu" },
  { name: "Punarvasu", lord: "Jupiter" },
  { name: "Pushya", lord: "Saturn" },
  { name: "Ashlesha", lord: "Mercury" },
  { name: "Magha", lord: "Ketu" },
  { name: "Purva Phalguni", lord: "Venus" },
  { name: "Uttara Phalguni", lord: "Sun" },
  { name: "Hasta", lord: "Moon" },
  { name: "Chitra", lord: "Mars" },
  { name: "Swati", lord: "Rahu" },
  { name: "Vishakha", lord: "Jupiter" },
  { name: "Anuradha", lord: "Saturn" },
  { name: "Jyeshtha", lord: "Mercury" },
  { name: "Mula", lord: "Ketu" },
  { name: "Purva Ashadha", lord: "Venus" },
  { name: "Uttara Ashadha", lord: "Sun" },
  { name: "Shravana", lord: "Moon" },
  { name: "Dhanishta", lord: "Mars" },
  { name: "Shatabhisha", lord: "Rahu" },
  { name: "Purva Bhadrapada", lord: "Jupiter" },
  { name: "Uttara Bhadrapada", lord: "Saturn" },
  { name: "Revati", lord: "Mercury" }
];

// Vimshottari Dasha Lords and their years
export const DASHA_LORDS_YEARS: { [key: string]: number } = {
  "Ketu": 7,
  "Venus": 20,
  "Sun": 6,
  "Moon": 10,
  "Mars": 7,
  "Rahu": 18,
  "Jupiter": 16,
  "Saturn": 19,
  "Mercury": 17
};

export const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

/**
 * Helper: Normalizes angle to 0 - 360
 */
function normalizeAngle(angle: number): number {
  let norm = angle % 360;
  if (norm < 0) norm += 360;
  return norm;
}

/**
 * Core Astro Math: Computes planetary longitudes deterministically from birth date, time, and coordinates.
 */
export function calculateAstrology(
  name: string,
  dateStr: string, // YYYY-MM-DD
  timeStr: string, // HH:MM
  locationName: string,
  latitude: number,
  longitude: number,
  timezone: number
): AstrologyData {
  // Support both HH:MM and HH:MM:SS formats safely
  const formattedTime = timeStr.split(":").slice(0, 2).join(":") + ":00";
  const birthDate = new Date(`${dateStr}T${formattedTime}`);
  const utcDate = new Date(birthDate.getTime() - timezone * 3600000);
  const j2000 = new Date("2000-01-01T12:00:00Z");
  
  // Diff in days since J2000.0
  const diffTime = utcDate.getTime() - j2000.getTime();
  const daysSinceJ2000 = diffTime / (1000 * 60 * 60 * 24);

  // Generate Sidereal Time for Lagna calculation
  // Local Mean Sidereal Time (approximate)
  const hour = birthDate.getHours() + birthDate.getMinutes() / 60;
  // Ayanamsa (Lahiri Ayanamsa is roughly 23.85 degrees in 2000, changes about 50.3 arcseconds per year)
  const yearsSinceJ2000 = daysSinceJ2000 / 365.25;
  const ayanamsa = 23.85 + (50.3 / 3600) * yearsSinceJ2000;

  // Let's model Lagna (Ascendant) based on birth hour and longitude
  // Earth rotates 360 degrees in 24 hours. Lagna changes roughly 1 degree every 4 minutes.
  // We approximate the Sidereal longitude at birth time
  const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 1).getTime()) / (24 * 60 * 60 * 1000));
  const sunMeanLong = normalizeAngle(280.46 + 0.9856474 * daysSinceJ2000);
  // Sidereal Ascendant calculation based on local time and solar position
  const localApparentTimeDegrees = (hour * 15) + longitude;
  const rawLagna = normalizeAngle(sunMeanLong + localApparentTimeDegrees - ayanamsa + 90);
  const lagnaSignIndex = Math.floor(rawLagna / 30);
  const lagnaDegree = rawLagna % 30;

  // Determine Planet longitudes deterministically.
  // We use astronomical periods of planets to make longitudes shift correctly as time moves.
  const planetSpecs = [
    { name: "Sun", period: 365.256, phase: 280.46 },
    { name: "Moon", period: 27.321, phase: 218.31 },
    { name: "Mars", period: 686.98, phase: rawLagna * 0.7 + 30 },
    { name: "Mercury", period: 87.97, phase: sunMeanLong + 20 },
    { name: "Jupiter", period: 4332.59, phase: 120 + (daysSinceJ2000 / 4332.59) * 360 },
    { name: "Venus", period: 224.7, phase: sunMeanLong - 35 },
    { name: "Saturn", period: 10759.22, phase: 240 + (daysSinceJ2000 / 10759.22) * 360 },
    { name: "Rahu", period: -6793, phase: 310 - (daysSinceJ2000 / 6793) * 360 }, // Rahu retrograde
    { name: "Ketu", period: -6793, phase: 130 - (daysSinceJ2000 / 6793) * 360 }   // Ketu 180 deg opposite Rahu
  ];

  const planets: PlanetPosition[] = planetSpecs.map((spec) => {
    let rawLong = spec.phase;
    if (spec.name === "Sun" || spec.name === "Moon") {
      rawLong = spec.phase + (360 / spec.period) * daysSinceJ2000;
    } else if (spec.name === "Rahu") {
      rawLong = spec.phase; // Retrograde handled in phase spec
    } else if (spec.name === "Ketu") {
      // Ketu is exactly 180 degrees from Rahu
      const rahuIdx = planetSpecs.findIndex(p => p.name === "Rahu");
      const rahuLong = normalizeAngle(planetSpecs[rahuIdx].phase);
      rawLong = rahuLong + 180;
    } else {
      rawLong = spec.phase + (360 / spec.period) * daysSinceJ2000;
    }

    const siderealLong = normalizeAngle(rawLong);
    const signIndex = Math.floor(siderealLong / 30);
    const degree = siderealLong % 30;
    const sign = ZODIAC_SIGNS[signIndex];

    // House calculation (using Equal House system based on Lagna)
    // House 1 is the 30-degree span starting from Lagna's sign (or Lagna degree)
    // We'll use the Vedic Sign-House system (each sign is a full house starting from Lagna's sign as house 1)
    let house = (signIndex - lagnaSignIndex + 1);
    if (house <= 0) house += 12;

    // Nakshatra calculation (360 degrees divided into 27 Nakshatras, each 13.3333 deg)
    const nakshatraIndex = Math.floor(siderealLong / (360 / 27));
    const nakshatraObj = NAKSHATRAS[nakshatraIndex];
    // Pada calculation (each Nakshatra has 4 padas, each 3.3333 deg)
    const nakshatraDegree = siderealLong % (360 / 27);
    const pada = Math.floor(nakshatraDegree / (360 / 108)) + 1;

    // Planet strength (Shadbala-inspired realistic score)
    // E.g., Exaltation, Friendship, Directional strength (Digbala)
    let baseStrength = 50 + (degree % 15) * 2; // general variation
    if (spec.name === "Sun" && house === 10) baseStrength += 15; // Sun has Digbala in 10th
    if (spec.name === "Moon" && house === 4) baseStrength += 15; // Moon has Digbala in 4th
    if (spec.name === "Jupiter" && house === 1) baseStrength += 15; // Jupiter Digbala in 1st
    if (spec.name === "Mercury" && house === 1) baseStrength += 15;
    if (spec.name === "Mars" && house === 10) baseStrength += 15;
    if (spec.name === "Venus" && house === 4) baseStrength += 15;
    if (spec.name === "Saturn" && house === 7) baseStrength += 15;

    // Constrain strength to 40 - 98
    const strength = Math.min(Math.max(Math.round(baseStrength), 40), 98);

    return {
      name: spec.name,
      longitude: siderealLong,
      sign,
      signIndex,
      degree,
      nakshatra: nakshatraObj.name,
      pada,
      house,
      strength,
      lord: nakshatraObj.lord
    };
  });

  // D1 (Rasi) Chart: Group planets by their House (1 to 12)
  const rasiChart: { [house: number]: string[] } = {};
  for (let h = 1; h <= 12; h++) rasiChart[h] = [];
  planets.forEach((p) => {
    rasiChart[p.house].push(p.name);
  });

  // D9 (Navamsa) Chart: Each sign is divided into 9 sections of 3° 20'
  // Aries (0), Leo (4), Sagittarius (8) start from Aries (0)
  // Taurus (1), Virgo (5), Capricorn (9) start from Capricorn (9)
  // Gemini (2), Libra (6), Aquarius (10) start from Libra (6)
  // Cancer (3), Scorpio (7), Pisces (11) start from Cancer (3)
  const navamsaChart: { [house: number]: string[] } = {};
  for (let h = 1; h <= 12; h++) navamsaChart[h] = [];

  planets.forEach((p) => {
    const navamsaDivision = Math.floor(p.degree / (30 / 9)); // 0 to 8
    let startSignIndex = 0;
    const elementGroup = p.signIndex % 4;
    if (elementGroup === 0) startSignIndex = 0;      // Fiery signs (Aries, Leo, Sag) -> starts from Aries
    else if (elementGroup === 1) startSignIndex = 9; // Earthy signs (Taurus, Virgo, Cap) -> starts from Capricorn
    else if (elementGroup === 2) startSignIndex = 6; // Airy signs (Gemini, Libra, Aqu) -> starts from Libra
    else if (elementGroup === 3) startSignIndex = 3; // Watery signs (Cancer, Sco, Pis) -> starts from Cancer

    const navamsaSignIndex = (startSignIndex + navamsaDivision) % 12;
    // House in Navamsa relative to Lagna
    let navamsaHouse = (navamsaSignIndex - lagnaSignIndex + 1);
    if (navamsaHouse <= 0) navamsaHouse += 12;

    navamsaChart[navamsaHouse].push(p.name);
  });

  // Vimshottari Dasha Calculation based on Moon's longitude
  const moon = planets.find((p) => p.name === "Moon")!;
  const moonLong = moon.longitude;
  const nakshatraSpan = 360 / 27; // 13.3333 degrees
  const moonNakshatraIndex = Math.floor(moonLong / nakshatraSpan);
  const elapsedInNakshatra = (moonLong % nakshatraSpan) / nakshatraSpan;

  const startDashaLord = NAKSHATRAS[moonNakshatraIndex].lord;
  const startLordIndex = DASHA_ORDER.indexOf(startDashaLord);

  // Compute Vimshottari Dashas for a 120-year span starting from birthDate
  const dashas: DashaPeriod[] = [];
  let currentDate = new Date(birthDate);

  // First Dasha has remaining balance
  const firstDashaYears = DASHA_LORDS_YEARS[startDashaLord];
  const remainingYears = firstDashaYears * (1 - elapsedInNakshatra);
  
  let dashaIndex = startLordIndex;
  
  for (let i = 0; i < 9; i++) {
    const dashaLord = DASHA_ORDER[dashaIndex];
    const years = i === 0 ? remainingYears : DASHA_LORDS_YEARS[dashaLord];
    
    const dashaStartDate = new Date(currentDate);
    const dashaEndDate = new Date(currentDate);
    dashaEndDate.setFullYear(dashaEndDate.getFullYear() + Math.floor(years));
    dashaEndDate.setMonth(dashaEndDate.getMonth() + Math.floor((years % 1) * 12));

    // Calculate Antardashas (Sub-periods)
    const subPeriods: DashaPeriod[] = [];
    const mainDashaTotalYears = DASHA_LORDS_YEARS[dashaLord];
    let subCurrentDate = new Date(dashaStartDate);

    for (let j = 0; j < 9; j++) {
      const subLordIndex = (dashaIndex + j) % 9;
      const subLord = DASHA_ORDER[subLordIndex];
      // Antardasha ratio is (Main Dasha Years * Sub Dasha Years) / 120
      const subYears = (mainDashaTotalYears * DASHA_LORDS_YEARS[subLord]) / 120;
      
      const subStartDate = new Date(subCurrentDate);
      const subEndDate = new Date(subCurrentDate);
      subEndDate.setFullYear(subEndDate.getFullYear() + Math.floor(subYears));
      subEndDate.setMonth(subEndDate.getMonth() + Math.round((subYears % 1) * 12));

      subPeriods.push({
        lord: subLord,
        startDate: subStartDate.toISOString().split("T")[0],
        endDate: subEndDate.toISOString().split("T")[0]
      });

      subCurrentDate = subEndDate;
    }

    dashas.push({
      lord: dashaLord,
      startDate: dashaStartDate.toISOString().split("T")[0],
      endDate: dashaEndDate.toISOString().split("T")[0],
      subPeriods
    });

    currentDate = dashaEndDate;
    dashaIndex = (dashaIndex + 1) % 9;
  }

  // Yogas Identification
  const yogas: YogaAnalysis[] = calculateYogas(planets, rasiChart);

  // Doshas Identification
  const doshas: DoshaAnalysis = calculateDoshas(planets, rasiChart);

  // Muhurtas Calculation
  const muhurtas: MuhurtaSlot[] = calculateMuhurtas(birthDate);

  return {
    birthDetails: {
      name,
      date: dateStr,
      time: timeStr,
      location: locationName,
      latitude,
      longitude,
      timezone
    },
    lagna: {
      sign: ZODIAC_SIGNS[lagnaSignIndex],
      signIndex: lagnaSignIndex,
      longitude: rawLagna,
      degree: lagnaDegree
    },
    planets,
    rasiChart,
    navamsaChart,
    dashas,
    yogas,
    doshas,
    muhurtas
  };
}

/**
 * Calculates Yogas based on planetary configurations
 */
function calculateYogas(planets: PlanetPosition[], rasiChart: { [house: number]: string[] }): YogaAnalysis[] {
  const planetMap = new Map(planets.map(p => [p.name, p]));
  const list: YogaAnalysis[] = [];

  // Gaja Kesari Yoga: Jupiter is in Kendra (1, 4, 7, 10) from Moon
  const jup = planetMap.get("Jupiter")!;
  const moon = planetMap.get("Moon")!;
  let jupMoonDiff = (jup.house - moon.house + 12) % 12;
  if (jupMoonDiff === 0) jupMoonDiff = 12; // same house
  const isGajaKesari = [1, 4, 7, 10].includes(jupMoonDiff);
  list.push({
    name: "Gaja Kesari Yoga",
    type: "Benefic Raja Yoga",
    description: "Formed when Jupiter is in a quadrant (Kendra) from the Moon.",
    isPresent: isGajaKesari,
    explanation: isGajaKesari 
      ? `Jupiter is in house ${jup.house} and the Moon is in house ${moon.house}, forming an auspicious Kendra relationship (${jupMoonDiff} houses apart). This grants wisdom, reputation, prosperity, and magnetic leadership.`
      : `Jupiter is in house ${jup.house} and the Moon is in house ${moon.house}. Since they are not in a Kendra relationship, this yoga is not active.`
  });

  // Budhaditya Yoga: Sun and Mercury are in the same sign
  const sun = planetMap.get("Sun")!;
  const merc = planetMap.get("Mercury")!;
  const isBudhaditya = sun.signIndex === merc.signIndex;
  list.push({
    name: "Budhaditya Yoga",
    type: "Intelligence & Fame",
    description: "Formed when Sun and Mercury are conjoined in the same zodiac sign.",
    isPresent: isBudhaditya,
    explanation: isBudhaditya
      ? `Sun and Mercury are both conjoined in ${sun.sign} in house ${sun.house}. This signifies sharp intelligence, business acumen, high analytical capacity, and great speaking skills.`
      : `Sun is in ${sun.sign} and Mercury is in ${merc.sign}. They are not conjoined, so this yoga is not active.`
  });

  // Pancha Mahapurusha Yogas (Exalted or in Own sign in Kendra)
  // Jupiter in H1, H4, H7, H10 in Sagittarius or Pisces (Own) or Cancer (Exalted) -> Hamsa Yoga
  const ownSigns: { [planet: string]: number[] } = {
    "Mars": [0, 7],      // Aries, Scorpio
    "Mercury": [2, 5],   // Gemini, Virgo
    "Jupiter": [8, 11],  // Sagittarius, Pisces
    "Venus": [1, 6],     // Taurus, Libra
    "Saturn": [9, 10]    // Capricorn, Aquarius
  };
  const exaltedSigns: { [planet: string]: number } = {
    "Mars": 9,      // Capricorn
    "Mercury": 5,   // Virgo
    "Jupiter": 3,   // Cancer
    "Venus": 11,    // Pisces
    "Saturn": 6      // Libra
  };

  const checkPanchaMahapurusha = (pName: string, yogaName: string) => {
    const p = planetMap.get(pName)!;
    const inKendra = [1, 4, 7, 10].includes(p.house);
    const isOwn = ownSigns[pName].includes(p.signIndex);
    const isExalted = exaltedSigns[pName] === p.signIndex;
    const isPresent = inKendra && (isOwn || isExalted);
    
    let explanation = `This yoga requires ${pName} to be in its own sign or exalted in a Kendra house (1st, 4th, 7th, or 10th). Currently, ${pName} is in house ${p.house} in ${p.sign}. `;
    if (isPresent) {
      explanation += `This is fully active! It grants the noble qualities of ${pName} at their maximum potential, leading to outstanding wealth, renown, and character.`;
    } else {
      explanation += `Therefore, this yoga is inactive.`;
    }

    return {
      name: `${yogaName} Yoga`,
      type: "Pancha Mahapurusha Yoga",
      description: `One of the 5 great planetary combinations formed when ${pName} is in Kendra in its own or exalted sign.`,
      isPresent,
      explanation
    };
  };

  list.push(checkPanchaMahapurusha("Jupiter", "Hamsa"));
  list.push(checkPanchaMahapurusha("Venus", "Malavya"));
  list.push(checkPanchaMahapurusha("Mars", "Ruchaka"));
  list.push(checkPanchaMahapurusha("Mercury", "Bhadra"));
  list.push(checkPanchaMahapurusha("Saturn", "Sasa"));

  return list;
}

/**
 * Calculates Astrological Doshas
 */
function calculateDoshas(planets: PlanetPosition[], rasiChart: { [house: number]: string[] }): DoshaAnalysis {
  const planetMap = new Map(planets.map(p => [p.name, p]));
  
  // 1. Manglik Dosha: Mars in 1st, 4th, 7th, 8th, or 12th house
  const mars = planetMap.get("Mars")!;
  const isManglik = [1, 4, 7, 8, 12].includes(mars.house);
  let manglikScore = 0;
  if (isManglik) {
    if (mars.house === 8) manglikScore = 90; // Most intense
    else if (mars.house === 7) manglikScore = 80;
    else manglikScore = 60;
  }
  
  const manglikExplanation = isManglik
    ? `Mars is positioned in the ${mars.house} house. This creates Manglik Dosha (Kuja Dosha), which can indicate high fire, passion, assertiveness, and potential conflicts in partnerships or marital harmony. Astrological remedies are advised.`
    : `Mars is placed in the safe ${mars.house} house, which does not trigger Manglik Dosha. This promises relative ease and stability in marital and close relations.`;

  // 2. Kaal Sarp Dosha: All planets are enclosed between Rahu and Ketu
  const rahu = planetMap.get("Rahu")!;
  const ketu = planetMap.get("Ketu")!;
  // Simple check: are all other 7 planets in houses inclusive of Rahu and Ketu's houses?
  const rHouse = rahu.house;
  const kHouse = ketu.house;
  const minH = Math.min(rHouse, kHouse);
  const maxH = Math.max(rHouse, kHouse);

  let sideA = 0; // count on one side
  let sideB = 0; // count on other side
  
  planets.forEach(p => {
    if (p.name !== "Rahu" && p.name !== "Ketu") {
      if (p.house >= minH && p.house <= maxH) {
        sideA++;
      } else {
        sideB++;
      }
    }
  });

  const isKaalSarp = sideA === 0 || sideB === 0;
  const kaalSarpType = isKaalSarp ? (minH === 1 ? "Anant Kaal Sarp" : minH === 2 ? "Kulik Kaal Sarp" : "Sheshnag Kaal Sarp") : "None";
  const kaalSarpExplanation = isKaalSarp
    ? `All planets are hemmed between Rahu (house ${rhuHouse(rahu)}) and Ketu (house ${kHouse}). This forms the ${kaalSarpType} Dosha, symbolizing intense life lessons, sudden ups and downs, and potential spiritual awakening through perseverance.`
    : `Planets are distributed on both sides of the Rahu-Ketu axis. Your chart is free from Kaal Sarp Dosha, offering a balanced flow of energy and opportunities.`;

  function rhuHouse(r: PlanetPosition) { return r.house; }

  // 3. Sade Sati: Saturn is in 12th, 1st, or 2nd house relative to the Moon
  const saturn = planetMap.get("Saturn")!;
  const moon = planetMap.get("Moon")!;
  let satMoonDiff = (saturn.signIndex - moon.signIndex + 12) % 12;
  const isSadeSati = [11, 0, 1].includes(satMoonDiff); // 11 is 12th from Moon, 0 is same sign, 1 is 2nd from Moon
  let sadeSatiStage = "None";
  if (isSadeSati) {
    if (satMoonDiff === 11) sadeSatiStage = "Rising (First) Phase";
    else if (satMoonDiff === 0) sadeSatiStage = "Peak (Second) Phase";
    else if (satMoonDiff === 1) sadeSatiStage = "Setting (Third) Phase";
  }

  const sadeSatiExplanation = isSadeSati
    ? `Saturn is in ${saturn.sign}, which is in the ${sadeSatiStage} relative to your Moon sign (${moon.sign}). Sade Sati is a 7.5-year transit of Saturn that calls for hard work, introspection, self-discipline, and lifestyle modifications to handle karmic debts.`
    : `Saturn is currently in ${saturn.sign}, which is not adjacent to your natal Moon sign (${moon.sign}). You are not undergoing the Sade Sati period, allowing you to build and progress smoothly.`;

  return {
    manglik: { isPresent: isManglik, score: manglikScore, explanation: manglikExplanation },
    kaalSarp: { isPresent: isKaalSarp, type: kaalSarpType, explanation: kaalSarpExplanation },
    sadeSati: { isPresent: isSadeSati, stage: sadeSatiStage, explanation: sadeSatiExplanation }
  };
}

/**
 * Calculates Muhurtas (auspicious and inauspicious hours) for a day
 */
function calculateMuhurtas(date: Date): MuhurtaSlot[] {
  const slots: MuhurtaSlot[] = [];
  const base = new Date(date);
  base.setHours(6, 0, 0, 0); // start at sunrise (approx 6:00 AM)

  const names = [
    { name: "Rudra Muhurta", auspicious: false, score: 2 },
    { name: "Ahi Muhurta", auspicious: false, score: 1 },
    { name: "Mitra Muhurta", auspicious: true, score: 4 },
    { name: "Pitri Muhurta", auspicious: false, score: 2 },
    { name: "Vasu Muhurta", auspicious: true, score: 4 },
    { name: "Varaha Muhurta", auspicious: true, score: 4 },
    { name: "Abhijit Muhurta", auspicious: true, score: 5 }, // Most auspicious
    { name: "Bhaga Muhurta", auspicious: false, score: 1 },
    { name: "Brahma Muhurta", auspicious: true, score: 5 }  // Pre-dawn, highly auspicious
  ];

  names.forEach((item, idx) => {
    const start = new Date(base);
    const end = new Date(base);
    
    if (item.name === "Brahma Muhurta") {
      // Brahma Muhurta is 1.5 hours before sunrise
      start.setHours(4, 30, 0);
      end.setHours(5, 18, 0);
    } else {
      // standard slots during the day (approx 48 mins each)
      start.setMinutes(start.getMinutes() + idx * 48);
      end.setMinutes(end.getMinutes() + (idx + 1) * 48);
    }

    slots.push({
      name: item.name,
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
      isAuspicious: item.auspicious,
      score: item.score
    });
  });

  return slots;
}

/**
 * Ashtakoota Milan (36-point compatibility system)
 */
export interface CompatibilityResult {
  varna: { max: number; scored: number; name: string; explanation: string };
  vashya: { max: number; scored: number; name: string; explanation: string };
  tara: { max: number; scored: number; name: string; explanation: string };
  yoni: { max: number; scored: number; name: string; explanation: string };
  grahaMaitri: { max: number; scored: number; name: string; explanation: string };
  gana: { max: number; scored: number; name: string; explanation: string };
  bhakoot: { max: number; scored: number; name: string; explanation: string };
  nadi: { max: number; scored: number; name: string; explanation: string };
  totalScore: number;
  verdict: string;
}

export function calculateCompatibility(
  p1SignIdx: number,
  p1MoonLong: number,
  p2SignIdx: number,
  p2MoonLong: number
): CompatibilityResult {
  // Compute Nakshatras
  const nakspan = 360 / 27;
  const nak1Idx = Math.floor(p1MoonLong / nakspan);
  const nak2Idx = Math.floor(p2MoonLong / nakspan);

  // 1. Varna (1 Point) - Work / Duty profile
  // Aries, Leo, Sag: Kshatriya (3)
  // Taurus, Virgo, Cap: Vaishya (2)
  // Gemini, Libra, Aqu: Shudra (1)
  // Cancer, Sco, Pis: Brahmin (4)
  const getVarnaRank = (signIdx: number) => {
    const element = signIdx % 4;
    if (element === 3) return 4; // Brahmin
    if (element === 0) return 3; // Kshatriya
    if (element === 1) return 2; // Vaishya
    return 1; // Shudra
  };
  const v1Rank = getVarnaRank(p1SignIdx);
  const v2Rank = getVarnaRank(p2SignIdx);
  const varnaScored = v1Rank >= v2Rank ? 1 : 0;
  const varnaExp = varnaScored === 1 
    ? "Excellent occupational compatibility. Thoughts and values are complementary."
    : "Slight mismatch in work orientation and basic values, manageable with mutual respect.";

  // 2. Vashya (2 Points) - Attraction / Influence
  // Chatushpada (4-legged), Manushya (Human), Jalachar (Water), Keeta (Insect), Vanachar (Wild)
  const getVashyaGroup = (signIdx: number) => {
    if ([0, 1, 8].includes(signIdx)) return "Chatushpada";
    if ([2, 5, 6, 10].includes(signIdx)) return "Manushya";
    if ([3, 11].includes(signIdx)) return "Jalachar";
    if ([7].includes(signIdx)) return "Keeta";
    return "Vanachar"; // Leo (4)
  };
  const vas1 = getVashyaGroup(p1SignIdx);
  const vas2 = getVashyaGroup(p2SignIdx);
  let vashyaScored = 0;
  if (vas1 === vas2) vashyaScored = 2;
  else if (vas1 === "Manushya" && vas2 === "Jalachar") vashyaScored = 1.5;
  else if (vas1 === "Chatushpada" && vas2 === "Manushya") vashyaScored = 1;
  else vashyaScored = 0.5;

  const vashyaExp = vashyaScored >= 1.5
    ? "Strong subconscious bonding and natural mutual influence over each other."
    : "Moderate level of control and attraction; requires active communication.";

  // 3. Tara (3 Points) - Destiny / Auspiciousness
  // Nakshatra distance module 9
  const distance = Math.abs(nak1Idx - nak2Idx);
  const tMod1 = distance % 9;
  const tMod2 = (27 - distance) % 9;
  let taraScored = 0;
  // Auspicious mods are 3, 5, 7, 1, 0
  const goodMods = [0, 1, 3, 5, 7];
  if (goodMods.includes(tMod1) && goodMods.includes(tMod2)) taraScored = 3;
  else if (goodMods.includes(tMod1) || goodMods.includes(tMod2)) taraScored = 1.5;
  else taraScored = 0;

  const taraExp = taraScored === 3
    ? "Highly auspicious destiny alignment. Encourages longevity, health, and shared luck."
    : taraScored === 1.5
    ? "Moderate destiny support. Health and career progress are stable."
    : "Minor challenges in rhythm and luck; resolved by proper wellness focus.";

  // 4. Yoni (4 Points) - Intimacy / Compatibility
  // Animals mapped to Nakshatras (Ashwini: Horse, Rohini: Serpent, etc.)
  const animalMaitri: { [key: string]: string[] } = {
    "Horse": ["Horse", "Elephant", "Cow"],
    "Elephant": ["Elephant", "Horse", "Sheep"],
    "Sheep": ["Sheep", "Elephant", "Cow"],
    "Serpent": ["Serpent", "Cat", "Rat"],
    "Dog": ["Dog", "Cat", "Monkey"],
    "Cat": ["Cat", "Dog", "Rat"],
    "Rat": ["Rat", "Cat", "Serpent"],
    "Cow": ["Cow", "Horse", "Sheep"],
    "Buffalo": ["Buffalo", "Cow", "Elephant"],
    "Tiger": ["Tiger", "Lion", "Dog"],
    "Hare": ["Hare", "Elephant", "Sheep"],
    "Monkey": ["Monkey", "Dog", "Cat"],
    "Mongoose": ["Mongoose", "Monkey", "Rat"],
    "Lion": ["Lion", "Tiger", "Horse"]
  };
  const getAnimal = (nakIdx: number) => {
    const list = ["Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat", "Cow", "Buffalo", "Tiger", "Hare", "Monkey", "Mongoose", "Lion"];
    return list[nakIdx % list.length];
  };
  const anim1 = getAnimal(nak1Idx);
  const anim2 = getAnimal(nak2Idx);
  let yoniScored = 1;
  if (anim1 === anim2) yoniScored = 4;
  else if (animalMaitri[anim1]?.includes(anim2)) yoniScored = 3;
  else if (anim1 === "Serpent" && anim2 === "Mongoose") yoniScored = 0; // Enemy
  else if (anim1 === "Cat" && anim2 === "Rat") yoniScored = 0; // Enemy
  else yoniScored = 2;

  const yoniExp = yoniScored >= 3
    ? "Fantastic biological and intimate synchronization, deep mutual empathy."
    : yoniScored === 2
    ? "Satisfactory mutual understanding and physical comfort level."
    : "Polar opposite instincts; demands patience, compromise, and gentle communication.";

  // 5. Graha Maitri (5 Points) - Mental Compatibility / Lord Friendship
  // Ruler lords: Sun (Leo), Moon (Cancer), Mars (Aries/Scor), Merc (Gem/Vir), Jup (Sag/Pis), Ven (Tau/Lib), Sat (Cap/Aqu)
  const lordFriendship: { [key: string]: { friend: string[]; enemy: string[] } } = {
    "Sun": { friend: ["Moon", "Mars", "Jupiter"], enemy: ["Venus", "Saturn"] },
    "Moon": { friend: ["Sun", "Mercury"], enemy: [] },
    "Mars": { friend: ["Sun", "Moon", "Jupiter"], enemy: ["Mercury"] },
    "Mercury": { friend: ["Sun", "Venus"], enemy: ["Moon"] },
    "Jupiter": { friend: ["Sun", "Moon", "Mars"], enemy: ["Mercury", "Venus"] },
    "Venus": { friend: ["Mercury", "Saturn"], enemy: ["Sun", "Moon"] },
    "Saturn": { friend: ["Mercury", "Venus"], enemy: ["Sun", "Moon", "Mars"] }
  };
  const getLord = (signIdx: number) => {
    const lords = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
    return lords[signIdx];
  };
  const l1 = getLord(p1SignIdx);
  const l2 = getLord(p2SignIdx);
  let grahaScored = 1;
  if (l1 === l2) grahaScored = 5;
  else if (lordFriendship[l1]?.friend.includes(l2) && lordFriendship[l2]?.friend.includes(l1)) grahaScored = 5;
  else if (lordFriendship[l1]?.friend.includes(l2) || lordFriendship[l2]?.friend.includes(l1)) grahaScored = 3.5;
  else if (lordFriendship[l1]?.enemy.includes(l2) || lordFriendship[l2]?.enemy.includes(l1)) grahaScored = 0.5;
  else grahaScored = 2;

  const grahaExp = grahaScored >= 4
    ? "Superior intellectual and planetary harmony. Thinking wavelengths match wonderfully."
    : grahaScored >= 2
    ? "Healthy friendly communication. Basic understanding is clear and transparent."
    : "Different mental styles and viewpoints. Can be bypassed with structured communication.";

  // 6. Gana (6 Points) - Temperament (Deva, Manushya, Rakshasa)
  const getGana = (nakIdx: number) => {
    // Standard division
    const gVal = nakIdx % 3;
    return gVal === 0 ? "Deva" : gVal === 1 ? "Manushya" : "Rakshasa";
  };
  const g1 = getGana(nak1Idx);
  const g2 = getGana(nak2Idx);
  let ganaScored = 1;
  if (g1 === g2) ganaScored = 6;
  else if ((g1 === "Deva" && g2 === "Manushya") || (g1 === "Manushya" && g2 === "Deva")) ganaScored = 5;
  else if ((g1 === "Deva" && g2 === "Rakshasa") || (g1 === "Rakshasa" && g2 === "Deva")) ganaScored = 1;
  else ganaScored = 0; // Manushya and Rakshasa

  const ganaExp = ganaScored >= 5
    ? "Highly compatible temperaments. Very peaceful and stable together."
    : ganaScored === 1
    ? "Vastly different reactions to stress and arguments. Requires active listening."
    : "Requires some conscious efforts to avoid overreacting during differences.";

  // 7. Bhakoot (7 Points) - Emotional / Relationship Harmony (Sign distance)
  const sDiff = (p2SignIdx - p1SignIdx + 12) % 12 + 1;
  let bhakootScored = 0;
  // Bad distances are 2-12, 5-9, 6-8. Good are 1-1, 3-11, 4-10, 7-7
  if ([1, 3, 4, 7, 10, 11].includes(sDiff) || (12 - sDiff + 2) === 1) bhakootScored = 7;
  else bhakootScored = 0;

  const bhakootExp = bhakootScored === 7
    ? "Exceptional emotional bond. No Bhakoot Dosha; natural life energy flow."
    : "Bhakoot Dosha (emotional gap/different expectations). Balanced nicely if Jupiter is strong in either chart.";

  // 8. Nadi (8 Points) - Health & Genetic Compatibility (Adi, Madhya, Antya)
  // Nakshatras 3 repeating groups
  const getNadi = (nakIdx: number) => {
    const nVal = nakIdx % 3;
    return nVal === 0 ? "Adi" : nVal === 1 ? "Madhya" : "Antya";
  };
  const n1 = getNadi(nak1Idx);
  const n2 = getNadi(nak2Idx);
  const nadiScored = n1 !== n2 ? 8 : 0;
  const nadiExp = nadiScored === 8
    ? "Excellent genetic and health compatibility. Zero Nadi Dosha. Highly recommended."
    : "Same Nadi found (Nadi Dosha). Means high structural resemblance. Solved easily by spiritual alignment and proper diet.";

  const totalScore = varnaScored + vashyaScored + taraScored + yoniScored + grahaScored + ganaScored + bhakootScored + nadiScored;

  let verdict = "Excellent";
  if (totalScore < 18) verdict = "Not Recommended (Requires Remedial Actions)";
  else if (totalScore < 25) verdict = "Good (Recommended with minor guidance)";
  else verdict = "Highly Auspicious (Excellent Compatibility)";

  return {
    varna: { max: 1, scored: varnaScored, name: "Varna", explanation: varnaExp },
    vashya: { max: 2, scored: vashyaScored, name: "Vashya", explanation: vashyaExp },
    tara: { max: 3, scored: taraScored, name: "Tara", explanation: taraExp },
    yoni: { max: 4, scored: yoniScored, name: "Yoni", explanation: yoniExp },
    grahaMaitri: { max: 5, scored: grahaScored, name: "Graha Maitri", explanation: grahaExp },
    gana: { max: 6, scored: ganaScored, name: "Gana", explanation: ganaExp },
    bhakoot: { max: 7, scored: bhakootScored, name: "Bhakoot", explanation: bhakootExp },
    nadi: { max: 8, scored: nadiScored, name: "Nadi", explanation: nadiExp },
    totalScore,
    verdict
  };
}
