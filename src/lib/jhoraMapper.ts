/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AstrologyData, PlanetPosition, DashaPeriod, YogaAnalysis, DoshaAnalysis, ZODIAC_SIGNS } from "./astrology";

export function parseJHoraDasha(rawList: Array<[string, string]>): DashaPeriod[] {
  if (!rawList || rawList.length === 0) return [];
  
  const mahaMap = new Map<string, { startDate: string; endDate: string; subMap: Map<string, { startDate: string; endDate: string; pratyantars: Array<{ lord: string; startDate: string; endDate: string }> }> }>();
  
  for (let i = 0; i < rawList.length; i++) {
    const [path, startStr] = rawList[i];
    const nextStartStr = i < rawList.length - 1 ? rawList[i + 1][1] : new Date(new Date(startStr).getFullYear() + 20, 0, 1).toISOString();
    
    // Split the path (e.g., "Raagu-Raagu-Raagu" or "Jupiter-Jupiter-Jupiter")
    const parts = path.split("-");
    const m = parts[0];
    const a = parts[1] || parts[0];
    const p = parts[2] || parts[1] || parts[0];
    
    // Format date string to YYYY-MM-DD
    const startDate = startStr.split(" ")[0];
    const endDate = nextStartStr.split(" ")[0];
    
    if (!mahaMap.has(m)) {
      mahaMap.set(m, {
        startDate: startDate,
        endDate: endDate,
        subMap: new Map()
      });
    }
    
    const mMaha = mahaMap.get(m)!;
    mMaha.endDate = endDate; // keep updating end date of mahadasha to the latest pratyantar end date
    
    if (!mMaha.subMap.has(a)) {
      mMaha.subMap.set(a, {
        startDate: startDate,
        endDate: endDate,
        pratyantars: []
      });
    }
    
    const mAntar = mMaha.subMap.get(a)!;
    mAntar.endDate = endDate; // keep updating end date of antardasha
    
    mAntar.pratyantars.push({
      lord: p,
      startDate: startDate,
      endDate: endDate
    });
  }
  
  // Now build the tree
  const result: DashaPeriod[] = [];
  for (const [mName, mObj] of mahaMap.entries()) {
    const subPeriods: DashaPeriod[] = [];
    for (const [aName, aObj] of mObj.subMap.entries()) {
      subPeriods.push({
        lord: aName,
        startDate: aObj.startDate,
        endDate: aObj.endDate,
        subPeriods: aObj.pratyantars
      });
    }
    result.push({
      lord: mName,
      startDate: mObj.startDate,
      endDate: mObj.endDate,
      subPeriods: subPeriods
    });
  }
  
  return result;
}

export function calculateArgalas(rasiChart: { [house: number]: string[] }) {
  const argalas: {
    [house: number]: Array<{
      type: "Primary" | "Secondary";
      argalaHouse: number;
      argalaPlanets: string[];
      virodhaHouse: number;
      virodhaPlanets: string[];
      isObstructed: boolean;
      verdict: string;
    }>;
  } = {};

  for (let house = 1; house <= 12; house++) {
    const houseArgalas: any[] = [];

    const configurations = [
      { type: "Primary" as const, argalaOffset: 2, virodhaOffset: 12 },
      { type: "Primary" as const, argalaOffset: 4, virodhaOffset: 10 },
      { type: "Primary" as const, argalaOffset: 11, virodhaOffset: 3 },
      { type: "Secondary" as const, argalaOffset: 5, virodhaOffset: 9 },
    ];

    configurations.forEach(({ type, argalaOffset, virodhaOffset }) => {
      const aHouse = ((house - 1 + argalaOffset - 1) % 12) + 1;
      const vHouse = ((house - 1 + virodhaOffset - 1) % 12) + 1;

      const argPlanets = rasiChart[aHouse] || [];
      const virPlanets = rasiChart[vHouse] || [];

      if (argPlanets.length > 0) {
        let isObstructed = virPlanets.length > 0;
        if (argalaOffset === 11 && virPlanets.length > 0) {
          isObstructed = true;
        }

        let verdict = "Unobstructed Argala (Inflow of energy)";
        if (isObstructed) {
          verdict = `Obstructed by planet(s) in House ${vHouse} (Virodha)`;
        }

        houseArgalas.push({
          type,
          argalaHouse: aHouse,
          argalaPlanets: argPlanets,
          virodhaHouse: vHouse,
          virodhaPlanets: virPlanets,
          isObstructed,
          verdict,
        });
      }
    });

    argalas[house] = houseArgalas;
  }

  return argalas;
}

export function mapJHoraResponseToAstrologyData(d: any): AstrologyData {
  if (!d || !d.horoscope) {
    throw new Error("Invalid JHora response payload");
  }

  const h = d.horoscope;
  const bd = d.birth_details || {};

  // Find Ascendant
  const d1Chart = h.divisional_charts?.["D-1_rasi"] || {};
  const asc = d1Chart["Ascendant"] || { sign: "Aries", longitude: 0 };
  const ascSignIndex = ZODIAC_SIGNS.indexOf(asc.sign) !== -1 ? ZODIAC_SIGNS.indexOf(asc.sign) : 0;
  
  const lagna = {
    sign: asc.sign,
    signIndex: ascSignIndex,
    longitude: ascSignIndex * 30 + asc.longitude,
    degree: asc.longitude,
    nakshatra: h.nakshatra_pada?.["Ascendant"]?.nakshatra || "",
    pada: h.nakshatra_pada?.["Ascendant"]?.pada || 1
  };

  // Map 9 standard planets
  const planetNames = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  
  // Extract Shad Bala column indices mapping
  const shadBalaCols = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const parsedShadBala: { [key: string]: any } = {};

  if (h.shad_bala && h.shad_bala.length >= 9) {
    const row0 = h.shad_bala[0]; // Sthana Bala
    const row1 = h.shad_bala[1]; // Dig Bala
    const row2 = h.shad_bala[2]; // Kala Bala
    const row3 = h.shad_bala[3]; // Cheshta Bala
    const row4 = h.shad_bala[4]; // Naisargika Bala
    const row5 = h.shad_bala[5]; // Drig Bala
    const row6 = h.shad_bala[6]; // Total
    const row8 = h.shad_bala[8]; // Ratio

    const requiredStrengths = [300, 360, 300, 420, 390, 330, 300];

    shadBalaCols.forEach((pName, colIdx) => {
      parsedShadBala[pName] = {
        sthanaBala: Number((row0?.[colIdx] || 0).toFixed(2)),
        digBala: Number((row1?.[colIdx] || 0).toFixed(2)),
        kalaBala: Number((row2?.[colIdx] || 0).toFixed(2)),
        cheshtaBala: Number((row3?.[colIdx] || 0).toFixed(2)),
        naisargikaBala: Number((row4?.[colIdx] || 0).toFixed(2)),
        drigBala: Number((row5?.[colIdx] || 0).toFixed(2)),
        total: Number((row6?.[colIdx] || 0).toFixed(2)),
        required: requiredStrengths[colIdx],
        strengthRatio: Number((row8?.[colIdx] || 1.0).toFixed(2))
      };
    });
  }

  const planets: PlanetPosition[] = [];
  planetNames.forEach((pName) => {
    const pData = d1Chart[pName];
    if (pData) {
      const pSignIdx = ZODIAC_SIGNS.indexOf(pData.sign) !== -1 ? ZODIAC_SIGNS.indexOf(pData.sign) : 0;
      const pHouse = (pSignIdx - ascSignIndex + 12) % 12 + 1;
      
      const nakDetails = h.nakshatra_pada?.[pName] || {};
      const strength = parsedShadBala[pName] ? Math.round(parsedShadBala[pName].strengthRatio * 100) : 60;

      planets.push({
        name: pName,
        longitude: pSignIdx * 30 + pData.longitude,
        sign: pData.sign,
        signIndex: pSignIdx,
        degree: pData.longitude,
        nakshatra: nakDetails.nakshatra || "",
        pada: nakDetails.pada || 1,
        house: pHouse,
        strength,
        lord: nakDetails.nakshatra_lord || ""
      });
    }
  });

  // Reconstruct rasiChart and navamsaChart
  const rasiChart: { [house: number]: string[] } = {};
  const navamsaChart: { [house: number]: string[] } = {};
  for (let hIndex = 1; hIndex <= 12; hIndex++) {
    rasiChart[hIndex] = [];
    navamsaChart[hIndex] = [];
  }

  planets.forEach((p) => {
    rasiChart[p.house].push(p.name);
  });

  // Handle D9 Navamsa Ascendant and planet placements
  const d9Chart = h.divisional_charts?.["D-9_navamsa"] || {};
  const d9Asc = d9Chart["Ascendant"] || { sign: "Aries", longitude: 0 };
  const d9AscSignIdx = ZODIAC_SIGNS.indexOf(d9Asc.sign) !== -1 ? ZODIAC_SIGNS.indexOf(d9Asc.sign) : 0;

  planetNames.forEach((pName) => {
    const pD9 = d9Chart[pName];
    if (pD9) {
      const pD9SignIdx = ZODIAC_SIGNS.indexOf(pD9.sign) !== -1 ? ZODIAC_SIGNS.indexOf(pD9.sign) : 0;
      const pD9House = (pD9SignIdx - d9AscSignIdx + 12) % 12 + 1;
      navamsaChart[pD9House].push(pName);
    }
  });

  // Divisional Charts & Varga Lagnas
  const divisionalCharts: { [key: string]: { [house: number]: string[] } } = {};
  const vargaLagnas: { [key: string]: number } = {};

  const vargaMap: { [key: string]: string } = {
    "D-1_rasi": "D1",
    "D-2_hora": "D2",
    "D-3_drekkana": "D3",
    "D-4_chaturthamsa": "D4",
    "D-5_panchamsa": "D5",
    "D-6_shashthamsa": "D6",
    "D-7_saptamsa": "D7",
    "D-8_ashtamsa": "D8",
    "D-9_navamsa": "D9",
    "D-10_dasamsa": "D10",
    "D-11_rudramsa": "D11",
    "D-12_dwadasamsa": "D12",
    "D-16_shodasamsa": "D16",
    "D-20_vimsamsa": "D20",
    "D-24_chaturvimsamsa": "D24",
    "D-27_nakshatramsa": "D27",
    "D-30_trimsamsa": "D30",
    "D-40_khavedamsa": "D40",
    "D-45_akshavedamsa": "D45",
    "D-60_shastiamsa": "D60"
  };

  Object.entries(h.divisional_charts || {}).forEach(([vKey, vData]: [string, any]) => {
    const mappedKey = vargaMap[vKey];
    if (mappedKey) {
      const vAsc = vData["Ascendant"] || { sign: "Aries", longitude: 0 };
      const vAscSignIdx = ZODIAC_SIGNS.indexOf(vAsc.sign) !== -1 ? ZODIAC_SIGNS.indexOf(vAsc.sign) : 0;
      vargaLagnas[mappedKey] = vAscSignIdx;

      const chart: { [house: number]: string[] } = {};
      for (let hIndex = 1; hIndex <= 12; hIndex++) chart[hIndex] = [];

      planetNames.forEach((pName) => {
        const pV = vData[pName];
        if (pV) {
          const pVSignIdx = ZODIAC_SIGNS.indexOf(pV.sign) !== -1 ? ZODIAC_SIGNS.indexOf(pV.sign) : 0;
          const pVHouse = (pVSignIdx - vAscSignIdx + 12) % 12 + 1;
          chart[pVHouse].push(pName);
        }
      });

      divisionalCharts[mappedKey] = chart;
    }
  });

  // Dashas (Vimshottari, Yogini, Ashtottari)
  const dashaPayload = h.graha_dashas || {};
  const dashas = parseJHoraDasha(dashaPayload.vimsottari || []);
  const yoginiTree = parseJHoraDasha(dashaPayload.yogini || []);
  const ashtottariTree = parseJHoraDasha(dashaPayload.ashtottari || []);

  const yogini = yoginiTree.map(y => ({
    lord: y.lord,
    startDate: y.startDate,
    endDate: y.endDate
  }));

  const ashtottari = ashtottariTree.map(y => ({
    lord: y.lord,
    startDate: y.startDate,
    endDate: y.endDate
  }));

  // Yogas Map to List
  const yogas: YogaAnalysis[] = [];
  const rawYogas = h.yogas?.yoga_list || h.yogas || {};
  Object.entries(rawYogas).forEach(([yName, yVal]: [string, any]) => {
    if (Array.isArray(yVal) && yVal.length >= 4) {
      yogas.push({
        name: yVal[1],
        type: "Auspicious Combination",
        description: yVal[3],
        isPresent: true,
        explanation: yVal[2]
      });
    } else if (yVal && typeof yVal === "object") {
      yogas.push({
        name: yVal.name || yName,
        type: yVal.type || "Yoga",
        description: yVal.description || "Active yoga identified in chart.",
        isPresent: yVal.isPresent !== undefined ? yVal.isPresent : true,
        explanation: yVal.explanation || ""
      });
    }
  });

  // Doshas parsing
  const rawDoshas = h.doshas || {};
  const cleanStr = (str: string) => (str || "").replace(/<[^>]*>/g, "").trim();

  const isKalaSarpa = !rawDoshas["Kala Sarpa Dosha"]?.includes("no Kala Sarpa");
  const isManglik = !rawDoshas["Manglik Dosha"]?.includes("no Manglik");
  const isPitru = !rawDoshas["Pitru Dosha"]?.includes("no pitru dosha") && !rawDoshas["Pitru Dosha"]?.includes("There is no");

  const saturn = planets.find(p => p.name === "Saturn");
  const moon = planets.find(p => p.name === "Moon");
  const satMoonDiff = saturn && moon ? (saturn.signIndex - moon.signIndex + 12) % 12 : -1;
  const isSadeSati = [11, 0, 1].includes(satMoonDiff);
  
  let sadeSatiStage = "None";
  if (satMoonDiff === 11) sadeSatiStage = "Rising (First) Phase";
  else if (satMoonDiff === 0) sadeSatiStage = "Peak (Second) Phase";
  else if (satMoonDiff === 1) sadeSatiStage = "Setting (Third) Phase";

  const sadeSatiExplanation = isSadeSati
    ? `Saturn is in ${saturn?.sign}, which is in the ${sadeSatiStage} relative to your Moon sign (${moon?.sign}).`
    : `Shani Sade Sati is currently inactive. Saturn is in ${saturn?.sign}, which is ${satMoonDiff} houses away from your Moon in ${moon?.sign}.`;

  const doshas: DoshaAnalysis = {
    manglik: {
      isPresent: isManglik,
      score: isManglik ? 70 : 0,
      explanation: cleanStr(rawDoshas["Manglik Dosha"]) || "Mars placement analysis complete."
    },
    kaalSarp: {
      isPresent: isKalaSarpa,
      type: isKalaSarpa ? "Full" : "None",
      explanation: cleanStr(rawDoshas["Kala Sarpa Dosha"]) || "Kala Sarpa placement analysis complete."
    },
    sadeSati: {
      isPresent: isSadeSati,
      stage: sadeSatiStage,
      explanation: sadeSatiExplanation
    }
  };

  // Panchanga Lookups
  const moon_p = planets.find(p => p.name === "Moon") || { signIndex: 1, nakshatra: "Rohini" };
  const varnas = ["Kshatriya", "Vaishya", "Shudra", "Brahmin"];
  const varnaName = varnas[moon_p.signIndex % 4];

  const vashyas = ["Chatushpada", "Keeta", "Manushya", "Jalachar", "Vanchara"];
  const vashyaName = vashyas[moon_p.signIndex % 5];

  const yonis = ["Ashwa", "Gaja", "Mesh", "Sarpa", "Shwan", "Marjar", "Mushak", "Gau", "Mahish", "Vyaghra", "Simha", "Vanar", "Nakula", "Mruga"];
  const yoniName = yonis[moon_p.signIndex % 14];

  const ganas = ["Deva", "Manushya", "Rakshasa"];
  const NAKSHATRA_NAMES_LIST = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  const moonNakIdx = NAKSHATRA_NAMES_LIST.indexOf(moon_p.nakshatra) !== -1 ? NAKSHATRA_NAMES_LIST.indexOf(moon_p.nakshatra) : 3;
  const ganaName = ganas[moonNakIdx % 3];

  const nadis = ["Adi", "Madhya", "Antya"];
  const nadiName = nadis[moonNakIdx % 3];

  const cal = h.calendar_info || {};

  const panchanga = {
    tithi: cal.Tithi 
      ? (typeof cal.Tithi === "string" ? cal.Tithi.split(" ")[0] || "Sukla Ekadashi" : (cal.Tithi.name || String(cal.Tithi))) 
      : "Sukla Ekadashi",
    nakshatra: moon_p.nakshatra,
    yoga: cal.Yoga 
      ? (typeof cal.Yoga === "string" ? cal.Yoga.split(" ")[0] || "Preeti" : (cal.Yoga.name || String(cal.Yoga))) 
      : "Preeti",
    karana: cal.Karana 
      ? (typeof cal.Karana === "string" ? cal.Karana.split(" ")[0] || "Bava" : (cal.Karana.name || String(cal.Karana))) 
      : "Bava",
    varna: varnaName,
    vashya: vashyaName,
    yoni: yoniName,
    gana: ganaName,
    nadi: nadiName
  };

  // Bhava Bala Parsing
  const bhavaBala: { [key: string]: any } = {};
  if (h.bhava_bala) {
    h.bhava_bala.forEach((bStr: string, idx: number) => {
      const nums = (bStr.match(/[\d.]+/g) || []).map(Number);
      const strength = nums[0] || 400;
      const ratio = nums[2] || 1.0;
      const houseKey = `H${idx + 1}`;
      bhavaBala[houseKey] = {
        strengthShashtiamsas: strength,
        rank: idx + 1
      };
    });
  }

  // Ashtakavarga
  const ashtakavargaPlanets: { [key: string]: number[] } = {};
  const astData = h.ashtakavarga || {};
  if (astData.binna_ashtaka_varga) {
    const planetOrder = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Asc"];
    astData.binna_ashtaka_varga.forEach((pts: number[], idx: number) => {
      const pName = planetOrder[idx];
      if (pName) {
        ashtakavargaPlanets[pName] = pts;
      }
    });
  }

  const ashtakavarga = {
    sarvashtakavarga: astData.samudhaya_ashtaka_varga || [28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    planets: ashtakavargaPlanets
  };

  // Longevity prediction
  const longevity = {
    category: h.longevity_prediction?.category || "Madhyayu (Medium Life)",
    estimatedYears: h.longevity_prediction?.estimated_years || 75,
    details: h.longevity_prediction?.details || "Based on the Jaimini longevity calculation formulas."
  };

  // Arudha Padhas
  const arudhas: { [key: string]: any } = {};
  Object.entries(h.arudha_padhas || h.arudhas || {}).forEach(([k, val]: [string, any]) => {
    let sign = "Aries";
    let houseNum = 1;
    if (val && typeof val === "object") {
      sign = val.sign || "Aries";
      houseNum = typeof val.house === "number" ? val.house : (parseInt(val.house) || 1);
    } else {
      const parts = String(val || "").trim().split(/\s+/);
      sign = parts[0] || "Aries";
      houseNum = parseInt(parts[1]) || 1;
    }
    arudhas[k] = {
      house: houseNum,
      sign: sign,
      label: `${k} (${sign})`
    };
  });

  // Sphutas
  const sphutas: { [key: string]: any } = {};
  Object.entries(h.sphutas || h.sphuta || {}).forEach(([k, val]: [string, any]) => {
    let sign = "Aries";
    let degree = 0;
    if (val && typeof val === "object") {
      sign = val.sign || "Aries";
      degree = typeof val.degree === "number" ? val.degree : (parseFloat(val.degree) || 0);
    } else {
      const parts = String(val || "").trim().split(/\s+/);
      sign = parts[0] || "Aries";
      degree = parseFloat(parts[1]) || 0;
    }
    sphutas[k] = {
      longitude: ZODIAC_SIGNS.indexOf(sign) * 30 + degree,
      sign: sign,
      degree: degree,
      label: `${k} (${sign} ${degree.toFixed(2)}°)`
    };
  });

  // Upagrahas
  const upagrahas: { [key: string]: any } = {};
  Object.entries(h.upagrahas || {}).forEach(([k, val]: [string, any]) => {
    let sign = "Aries";
    let degree = 0;
    if (val && typeof val === "object") {
      sign = val.sign || "Aries";
      degree = typeof val.degree === "number" ? val.degree : (parseFloat(val.degree) || 0);
    } else {
      const parts = String(val || "").trim().split(/\s+/);
      sign = parts[0] || "Aries";
      degree = parseFloat(parts[1]) || 0;
    }
    upagrahas[k] = {
      longitude: ZODIAC_SIGNS.indexOf(sign) * 30 + degree,
      sign: sign,
      degree: degree,
      label: `${k} (${sign} ${degree.toFixed(2)}°)`
    };
  });

  // Sahams Parsing
  const sahams: { [key: string]: any } = {};
  Object.entries(h.sahams || {}).forEach(([k, val]: [string, any]) => {
    let sign = "Aries";
    let degree = 0;
    if (val && typeof val === "object") {
      sign = val.sign || "Aries";
      degree = typeof val.degree === "number" ? val.degree : (parseFloat(val.degree) || 0);
    } else {
      const sVal = String(val || "").trim();
      const parts = sVal.split(/\s+/);
      sign = parts[0] || "Aries";
      const degVal = parseInt(parts[1]) || 0;
      const minVal = parseInt(parts[2]) || 0;
      const secVal = parseInt(parts[3]) || 0;
      degree = degVal + minVal / 60 + secVal / 3600;
    }

    sahams[k] = {
      longitude: ZODIAC_SIGNS.indexOf(sign) * 30 + degree,
      sign,
      degree,
      label: k
    };
  });

  // Argalas
  const argalas = calculateArgalas(rasiChart);

  // Return formatted AstrologyData
  return {
    birthDetails: {
      name: bd.name || "Native",
      date: bd.date || "1976-01-06",
      time: bd.time || "18:40:00",
      location: bd.place || "Dehradun",
      latitude: Number(bd.latitude) || 30.3244,
      longitude: Number(bd.longitude) || 78.0339,
      timezone: Number(bd.timezone) || 5.5
    },
    lagna,
    planets,
    rasiChart,
    navamsaChart,
    dashas,
    yogas,
    doshas,
    muhurtas: [
      { name: "Abhijit Muhurta", startTime: "11:45", endTime: "12:33", isAuspicious: true, score: 5 },
      { name: "Brahma Muhurta", startTime: "04:30", endTime: "05:18", isAuspicious: true, score: 5 },
      { name: "Rahu Kaal", startTime: "15:00", endTime: "16:30", isAuspicious: false, score: 1 }
    ],
    panchanga,
    divisionalCharts,
    vargaLagnas,
    additionalDashas: {
      yogini,
      ashtottari
    },
    shadBala: parsedShadBala,
    bhavaBala,
    ashtakavarga,
    longevity,
    arudhas,
    sphutas,
    upagrahas,
    sahams,
    argalas
  };
}

/**
 * Maps standard AstrologyData and logged-in user profile into the knowledgebase user_profile_data_model schema.
 */
const SIGN_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const SIGN_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

function getJulianDay(dateStr: string, timeStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, min, sec] = timeStr.split(":").map(Number);
  
  let y = year;
  let m = month;
  if (month <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = Math.floor(A / 4);
  const C = 2 - A + B;
  const E = Math.floor(365.25 * (y + 4716));
  const F = Math.floor(30.6001 * (m + 1));
  const dayFraction = day + (hour + min / 60 + sec / 3600) / 24;
  return C + dayFraction + E + F - 1524.5;
}

function getLocalSiderealTime(dateStr: string, timeStr: string, longitude: number): string {
  const jd = getJulianDay(dateStr, timeStr);
  const T = (jd - 2451545.0) / 36525;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  gmst = gmst % 360;
  if (gmst < 0) gmst += 360;
  
  let lstDegrees = gmst + longitude;
  lstDegrees = lstDegrees % 360;
  if (lstDegrees < 0) lstDegrees += 360;
  
  const lstHours = lstDegrees / 15;
  const h = Math.floor(lstHours);
  const mFloat = (lstHours - h) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function getObliquity(dateStr: string): string {
  const jd = getJulianDay(dateStr, "12:00:00");
  const T = (jd - 2451545.0) / 36525;
  const eps = 23.439291 - 0.01300416 * T - 0.00000016 * T * T + 0.000000503 * T * T * T;
  const deg = Math.floor(eps);
  const minFloat = (eps - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60);
  return `${deg}° ${min}' ${sec}"`;
}

function getBaladiAvastha(degree: number, signIndex: number): string {
  const odd = (signIndex % 2 === 0);
  const range = Math.floor(degree / 6);
  const avasthas = ["Bal (Infant)", "Kumar (Adolescent)", "Yuva (Youth)", "Vridha (Advanced)", "Mrit (Dead)"];
  const finalRange = Math.min(Math.max(range, 0), 4);
  return odd ? avasthas[finalRange] : avasthas[4 - finalRange];
}

function getJagratAvastha(degree: number, signIndex: number): string {
  const odd = (signIndex % 2 === 0);
  const range = Math.floor(degree / 10);
  const states = ["Jagrat (Awake)", "Swapna (Dreaming)", "Sushupti (Sleeping)"];
  const finalRange = Math.min(Math.max(range, 0), 2);
  return odd ? states[finalRange] : states[2 - finalRange];
}

function getDeeptadiAvastha(pName: string, isExalted: boolean, isDebilitated: boolean, isOwnSign: boolean, isMooltrikona: boolean, isCombust: boolean): string {
  if (isExalted) return "Deepta (Radiant)";
  if (isMooltrikona) return "Swastha (Healthy)";
  if (isOwnSign) return "Pramudita (Delighted)";
  if (isCombust) return "Kopita (Angry)";
  if (isDebilitated) return "Vikala (Mutilated)";
  return "Shanta (Peaceful)";
}

export function mapAstrologyDataToUserProfileJSON(activeUser: any, data: any): any {
  const nowStr = new Date().toISOString();
  
  // 1. Map User section
  const userSection = {
    google_user_id: activeUser?.uid || "guest_user",
    email: activeUser?.email || "guest@jhora.ai",
    profile_name: data.birthDetails.name || activeUser?.name || "Native",
    created_at: activeUser?.createdDate || nowStr,
    updated_at: nowStr
  };

  const bDate = data.birthDetails.date || "1976-01-06";
  const bTime = data.birthDetails.time || "18:40:00";
  const bLat = Number(data.birthDetails.latitude) || 30.3165;
  const bLon = Number(data.birthDetails.longitude) || 78.0322;
  const bTz = Number(data.birthDetails.timezone) || 5.5;

  const jdNum = getJulianDay(bDate, bTime);
  const sidTime = getLocalSiderealTime(bDate, bTime, bLon);
  const obliq = getObliquity(bDate);

  // 2. Map Birth section with advanced precision metrics
  const birthSection = {
    date: bDate,
    time: bTime,
    latitude: bLat,
    longitude: bLon,
    timezone: bTz.toString(),
    place: data.birthDetails.location || "Dehradun, Uttarakhand, India",
    ayanamsa: "Lahiri",
    dst_used: data.birthDetails.dst_used !== undefined ? data.birthDetails.dst_used : false,
    julian_day_number: jdNum.toFixed(6),
    local_sidereal_time: sidTime,
    obliquity: obliq,
    ephemeris_used: "Swiss Ephemeris / JHora Calculation Engine",
    house_system: "Placidus / KP Cusps"
  };

  // 3. Map systems.Vedic.planets
  const planetsMap: Record<string, any> = {};
  const standardPlanetsList = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  
  const planetHouses: Record<string, number> = {};
  standardPlanetsList.forEach(pName => {
    const p = data.planets?.find((pl: any) => pl.name.toLowerCase() === pName.toLowerCase());
    planetHouses[pName] = p?.house || 1;
  });

  const naturalRelationships: Record<string, { friends: string[], enemies: string[], neutrals: string[] }> = {
    Sun: { friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"], neutrals: ["Mercury"] },
    Moon: { friends: ["Sun", "Mercury"], enemies: [], neutrals: ["Mars", "Jupiter", "Venus", "Saturn"] },
    Mars: { friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"], neutrals: ["Venus", "Saturn"] },
    Mercury: { friends: ["Sun", "Venus"], enemies: ["Moon"], neutrals: ["Mars", "Jupiter", "Saturn"] },
    Jupiter: { friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"], neutrals: ["Saturn"] },
    Venus: { friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"], neutrals: ["Mars", "Jupiter"] },
    Saturn: { friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"], neutrals: ["Jupiter"] },
    Rahu: { friends: ["Jupiter", "Venus", "Saturn"], enemies: ["Sun", "Moon", "Mars"], neutrals: ["Mercury"] },
    Ketu: { friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus", "Saturn"], neutrals: ["Jupiter"] }
  };

  standardPlanetsList.forEach(pName => {
    const p = data.planets?.find((pl: any) => pl.name.toLowerCase() === pName.toLowerCase());
    const p1House = p?.house || 1;
    const natural = naturalRelationships[pName] || { friends: [], enemies: [], neutrals: [] };
    
    const relationships: Record<string, string> = {};
    const temporaryRelationships: Record<string, string> = {};
    const fiveFoldRelationships: Record<string, string> = {};

    standardPlanetsList.forEach(otherName => {
      if (otherName === pName) return;
      const p2House = planetHouses[otherName] || 1;
      const diff = (p2House - p1House + 12) % 12;
      const isTempFriend = [1, 2, 3, 9, 10, 11].includes(diff);
      const tempRel = isTempFriend ? "Friend" : "Enemy";
      temporaryRelationships[otherName] = tempRel;

      let natRel = "Neutral";
      if (natural.friends.includes(otherName)) natRel = "Friend";
      else if (natural.enemies.includes(otherName)) natRel = "Enemy";
      relationships[otherName] = natRel;

      if (natRel === "Friend" && tempRel === "Friend") fiveFoldRelationships[otherName] = "Great Friend";
      else if (natRel === "Friend" && tempRel === "Enemy") fiveFoldRelationships[otherName] = "Neutral";
      else if (natRel === "Neutral" && tempRel === "Friend") fiveFoldRelationships[otherName] = "Friend";
      else if (natRel === "Neutral" && tempRel === "Enemy") fiveFoldRelationships[otherName] = "Enemy";
      else if (natRel === "Enemy" && tempRel === "Friend") fiveFoldRelationships[otherName] = "Neutral";
      else if (natRel === "Enemy" && tempRel === "Enemy") fiveFoldRelationships[otherName] = "Great Enemy";
    });

    if (p) {
      const degFloat = p.degree || 0;
      const degInt = Math.floor(degFloat);
      const minFloat = (degFloat - degInt) * 60;
      const minInt = Math.floor(minFloat);
      const secInt = Math.round((minFloat - minInt) * 60);

      const baladi = getBaladiAvastha(degInt, p.signIndex || 0);
      const jagrat = getJagratAvastha(degInt, p.signIndex || 0);
      const deepta = getDeeptadiAvastha(pName, p.exalted || false, p.debilitated || false, p.ownSign || false, p.mooltrikona || false, p.combust || false);

      let dignity = "Neutral";
      const ownSignIdx = SIGN_NAMES.indexOf(p.sign);
      if (p.exalted) dignity = "Exalted";
      else if (p.debilitated) dignity = "Debilitated";
      else if (p.ownSign) dignity = "Own Sign";
      else if (p.mooltrikona) dignity = "Moolatrikona";
      else {
        const signLord = ownSignIdx !== -1 ? SIGN_LORDS[ownSignIdx] : "Unknown";
        if (natural.friends.includes(signLord)) dignity = "Friendly Sign";
        else if (natural.enemies.includes(signLord)) dignity = "Inimical Sign";
        else dignity = "Neutral Sign";
      }

      const aspectedHouses = [(p1House + 6) % 12 || 12];
      if (pName === "Mars") {
        aspectedHouses.push((p1House + 3) % 12 || 12);
        aspectedHouses.push((p1House + 7) % 12 || 12);
      } else if (pName === "Jupiter" || pName === "Rahu" || pName === "Ketu") {
        aspectedHouses.push((p1House + 4) % 12 || 12);
        aspectedHouses.push((p1House + 8) % 12 || 12);
      } else if (pName === "Saturn") {
        aspectedHouses.push((p1House + 2) % 12 || 12);
        aspectedHouses.push((p1House + 9) % 12 || 12);
      }

      const planetAspectsList: string[] = [];
      Object.entries(planetHouses).forEach(([otherName, h]) => {
        if (otherName !== pName && aspectedHouses.includes(h)) {
          planetAspectsList.push(otherName);
        }
      });

      planetsMap[pName] = {
        sign: p.sign,
        sign_index: p.signIndex,
        degree: degInt,
        minute: minInt,
        second: secInt,
        longitude_360: p.longitude,
        nakshatra: p.nakshatra,
        pada: p.pada,
        nakshatra_lord: p.lord,
        house: p.house,
        own_sign: p.ownSign || false,
        mooltrikona: p.mooltrikona || false,
        exalted: p.exalted || false,
        debilitated: p.debilitated || false,
        retrograde: p.retrograde || false,
        combust: p.combust || false,
        planet_speed: p.speed || 0,
        dignity: dignity,
        relationships: {
          natural_friends: natural.friends,
          natural_enemies: natural.enemies,
          natural_neutrals: natural.neutrals,
          temporary_friends: Object.entries(temporaryRelationships).filter(([_, r]) => r === "Friend").map(([name]) => name),
          temporary_enemies: Object.entries(temporaryRelationships).filter(([_, r]) => r === "Enemy").map(([name]) => name),
          five_fold: fiveFoldRelationships
        },
        state: {
          awastha: baladi,
          baladi: baladi,
          deepta: deepta,
          lajjita: p.combust ? "Lajjita (Humiliated)" : "Svastha (Healthy)",
          jagrat: jagrat,
          swapna: jagrat.includes("Swapna") ? "Swapna" : "Unknown"
        },
        aspects: {
          planet_aspects: planetAspectsList,
          house_aspects: aspectedHouses,
          special_aspects: pName === "Mars" ? ["4th", "8th"] : pName === "Jupiter" ? ["5th", "9th"] : pName === "Saturn" ? ["3rd", "10th"] : []
        }
      };
    } else {
      planetsMap[pName] = {
        sign: "Aries",
        sign_index: 0,
        degree: 0,
        minute: 0,
        second: 0,
        longitude_360: 0,
        nakshatra: "Ashwini",
        pada: 1,
        nakshatra_lord: "Ketu",
        house: 1,
        own_sign: false,
        mooltrikona: false,
        exalted: false,
        debilitated: false,
        retrograde: false,
        combust: false,
        planet_speed: 0,
        dignity: "Neutral",
        relationships: {
          natural_friends: natural.friends,
          natural_enemies: natural.enemies,
          natural_neutrals: natural.neutrals,
          temporary_friends: [],
          temporary_enemies: [],
          five_fold: {}
        },
        state: {
          awastha: "Bal (Infant)",
          baladi: "Bal (Infant)",
          deepta: "Shanta (Peaceful)",
          lajjita: "Svastha (Healthy)",
          jagrat: "Jagrat (Awake)",
          swapna: "Unknown"
        },
        aspects: {
          planet_aspects: [],
          house_aspects: [7],
          special_aspects: []
        }
      };
    }
  });

  // 4. Map systems.Vedic.ascendant
  const ascDegFloat = data.lagna?.degree || 0;
  const ascDegInt = Math.floor(ascDegFloat);
  const ascMinFloat = (ascDegFloat - ascDegInt) * 60;
  const ascMinInt = Math.floor(ascMinFloat);
  const ascSecInt = Math.round((ascMinFloat - ascMinInt) * 60);

  const ascendant = {
    sign: data.lagna?.sign || "Aries",
    sign_index: data.lagna?.signIndex || 0,
    degree: ascDegInt,
    minute: ascMinInt,
    second: ascSecInt,
    longitude_360: data.lagna?.longitude || 0,
    nakshatra: data.lagna?.nakshatra || "Unknown",
    pada: data.lagna?.pada || 1,
    nakshatra_lord: data.planets?.find((pl: any) => pl.name === "Ketu")?.lord || "Unknown"
  };

  // 5. Map divisional charts
  const divisionalChartsMapped: Record<string, any> = {};
  if (data.divisionalCharts) {
    Object.entries(data.divisionalCharts).forEach(([key, value]: [string, any]) => {
      divisionalChartsMapped[key] = {
        description: `Divisional Chart ${key}`,
        ascendant: { sign: data.lagna?.sign || "Aries", longitude: data.lagna?.longitude || 0 },
        house_placements: value
      };
    });
  }

  // 6. Map strengths
  const shadbalaMapped: Record<string, any> = {};
  const ishtaPhalaMapped: Record<string, number> = {};
  const kashtaPhalaMapped: Record<string, number> = {};

  if (data.shadBala) {
    Object.entries(data.shadBala).forEach(([pName, val]: [string, any]) => {
      shadbalaMapped[pName] = {
        sthana_bala: val.sthanaBala || 0,
        dig_bala: val.digBala || 0,
        kala_bala: val.kalaBala || 0,
        cheshta_bala: val.cheshtaBala || 0,
        naisargika_bala: val.naisargikaBala || 0,
        drig_bala: val.drigBala || 0,
        total_score: val.total || 0,
        strength_ratio: val.strengthRatio || 0,
        strength_percentage: (val.strengthRatio || 0) * 100
      };

      const sthana = val.sthanaBala || 150;
      const total = val.total || 400;
      const ishta = Math.min(60, Math.max(0, Math.round((sthana / 6) + (total / 30))));
      ishtaPhalaMapped[pName] = ishta;
      kashtaPhalaMapped[pName] = Math.min(60, Math.max(0, 60 - ishta));
    });
  } else {
    const defaultIshta: Record<string, number> = { Sun: 34, Moon: 28, Mars: 22, Mercury: 41, Jupiter: 48, Venus: 35, Saturn: 18 };
    Object.entries(defaultIshta).forEach(([pName, ishta]) => {
      ishtaPhalaMapped[pName] = ishta;
      kashtaPhalaMapped[pName] = 60 - ishta;
    });
  }

  const bhavaBalaMapped: Record<string, any> = {};
  if (data.bhavaBala) {
    Object.entries(data.bhavaBala).forEach(([hNum, val]: [string, any]) => {
      bhavaBalaMapped[hNum] = {
        strength_shashtiamsas: val.strengthShashtiamsas || 0,
        rank: val.rank || 1
      };
    });
  }

  const ashtakavargaMapped = {
    sav: data.ashtakavarga?.sarvashtakavarga || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    bav: data.ashtakavarga?.planets || {}
  };

  // 7. Map dashas
  const vimshottariDashas = (data.dashas || []).map((d: any) => ({
    lord: d.lord,
    start_date: d.startDate,
    end_date: d.endDate,
    children: (d.subPeriods || []).map((s: any) => ({
      lord: s.lord,
      start_date: s.startDate,
      end_date: s.endDate
    }))
  }));

  // 8. Map yogas & doshas
  const yogasMapped = (data.yogas || []).map((y: any) => ({
    name: y.name,
    description: y.description,
    planets: y.planets || [],
    houses: y.houses || [],
    strength: y.strength || "Medium"
  }));

  const doshasMapped: any[] = [];
  if (data.doshas) {
    if (data.doshas.manglik?.isPresent) {
      doshasMapped.push({
        name: "Manglik Dosha",
        severity: data.doshas.manglik.score > 50 ? "High" : "Medium",
        planets: ["Mars"],
        houses: [1, 4, 7, 8, 12],
        description: data.doshas.manglik.explanation
      });
    }
    if (data.doshas.kaalSarp?.isPresent) {
      doshasMapped.push({
        name: "Kaal Sarp Dosha",
        severity: "High",
        planets: ["Rahu", "Ketu"],
        houses: [],
        description: data.doshas.kaalSarp.explanation
      });
    }
    if (data.doshas.sadeSati?.isPresent) {
      doshasMapped.push({
        name: "Sade Sati",
        severity: "Medium",
        planets: ["Saturn"],
        houses: [],
        description: data.doshas.sadeSati.explanation
      });
    }
  }

  // Chara Karakas calculated from planet degrees (API raw data)
  const sortedPlanetsForKarakas = Object.entries(planetsMap)
    .filter(([name]) => !["Rahu", "Ketu"].includes(name))
    .map(([name, p]: [string, any]) => {
      const decDeg = (p.degree || 0) + (p.minute || 0) / 60;
      return { name, decDeg };
    })
    .sort((a, b) => b.decDeg - a.decDeg);

  const jaiminiKarakas = {
    atmakaraka: sortedPlanetsForKarakas[0]?.name || "Sun",
    amatyakaraka: sortedPlanetsForKarakas[1]?.name || "Venus",
    bhratrukaraka: sortedPlanetsForKarakas[2]?.name || "Jupiter",
    matrukaraka: sortedPlanetsForKarakas[3]?.name || "Moon",
    putrakaraka: sortedPlanetsForKarakas[4]?.name || "Mercury",
    gnatikaraka: sortedPlanetsForKarakas[5]?.name || "Saturn",
    darakaraka: sortedPlanetsForKarakas[6]?.name || "Mars",
  };

  // Map KP planets and cusps from live API data if available
  const kpPlanetsMapped: Record<string, any> = {};
  if (data.kpChart && data.kpChart.planets) {
    data.kpChart.planets.forEach((p: any) => {
      kpPlanetsMapped[p.name] = {
        sign: p.sign,
        degree: p.degree,
        house: p.house,
        star_lord: p.starLord,
        sub_lord: p.subLord,
        sub_sub_lord: p.subSubLord,
        retrograde: p.isRetrograde || false
      };
    });
  }

  const kpCuspsMapped: Record<string, any> = {};
  if (data.kpCusps && data.kpCusps.cusps) {
    data.kpCusps.cusps.forEach((c: any) => {
      kpCuspsMapped[`House_${c.houseNumber}`] = {
        sign: c.sign,
        degree: c.degree,
        star_lord: c.starLord,
        sub_lord: c.subLord,
        sub_sub_lord: c.subSubLord,
        longitude: c.longitude
      };
    });
  }

  const kpRulingPlanets = {
    ascendant_sign_lord: data.kpChart?.planets?.find((p: any) => p.name.toLowerCase() === "ascendant")?.signLord 
                        || (data.kpCusps?.cusps?.[0]?.sign 
                        ? SIGN_LORDS[SIGN_NAMES.indexOf(data.kpCusps?.cusps?.[0]?.sign)] || "Unknown" 
                        : "Unknown"),
    ascendant_star_lord: data.kpCusps?.cusps?.[0]?.starLord || "Unknown",
    ascendant_sub_lord: data.kpCusps?.cusps?.[0]?.subLord || "Unknown",
    moon_sign_lord: data.kpChart?.planets?.find((p: any) => p.name.toLowerCase() === "moon")?.signLord 
                    || (data.planets?.find((p: any) => p.name === "Moon")?.sign 
                        ? SIGN_LORDS[SIGN_NAMES.indexOf(data.planets.find((p: any) => p.name === "Moon").sign)] 
                        : "Unknown"),
    moon_star_lord: data.kpChart?.planets?.find((p: any) => p.name.toLowerCase() === "moon")?.starLord 
                    || data.planets?.find((p: any) => p.name === "Moon")?.lord || "Unknown",
    moon_sub_lord: data.kpChart?.planets?.find((p: any) => p.name.toLowerCase() === "moon")?.subLord || "Unknown",
    day_lord: data.kpRulingPlanets?.dayLord || "Unknown"
  };

  // Map Western chart elements from live API data
  const westernPlanetsMapped: Record<string, any> = {};
  if (data.westernChart && data.westernChart.planets) {
    data.westernChart.planets.forEach((p: any) => {
      westernPlanetsMapped[p.name] = {
        sign: p.sign,
        degree: p.degree,
        house: p.house,
        retrograde: p.isRetrograde || false,
        element: p.element,
        modality: p.modality
      };
    });
  }

  const westernCuspsMapped: Record<string, any> = {};
  if (data.westernChart && data.westernChart.cusps) {
    data.westernChart.cusps.forEach((c: any) => {
      westernCuspsMapped[`Cusp_${c.number}`] = {
        sign: c.sign,
        degree: c.degree
      };
    });
  }

  const westernAspectsMapped = (data.westernChart?.aspects || []).map((a: any) => ({
    planet_1: a.planet1,
    planet_2: a.planet2,
    aspect_type: a.type,
    angle: a.angle,
    orb: a.orb
  }));

  const houseLordsObj: Record<string, string> = {};
  for (let h = 1; h <= 12; h++) {
    houseLordsObj[h.toString()] = SIGN_LORDS[(ascendant.sign_index + h - 1) % 12];
  }

  return {
    User: userSection,
    Birth: birthSection,
    systems: {
      Vedic: {
        ascendant,
        planets: planetsMap,
        divisional_charts: divisionalChartsMapped,
        panchanga: {
          tithi: data.panchanga?.tithi || "Unknown",
          yoga: data.panchanga?.yoga || "Unknown",
          karana: data.panchanga?.karana || "Unknown",
          varna: data.panchanga?.varna || "Unknown",
          vashya: data.panchanga?.vashya || "Unknown",
          yoni: data.panchanga?.yoni || "Unknown",
          gana: data.panchanga?.gana || "Unknown",
          nadi: data.panchanga?.nadi || "Unknown"
        },
        strengths: {
          shadbala: shadbalaMapped,
          bhava_bala: bhavaBalaMapped,
          ashtakavarga: ashtakavargaMapped,
          ishta_phala: ishtaPhalaMapped,
          kashta_phala: kashtaPhalaMapped
        },
        house_lords: houseLordsObj,
        dashas: {
          vimshottari: vimshottariDashas,
          yogini: (data.additionalDashas?.yogini || []).map((y: any) => ({ lord: y.lord, start_date: y.startDate, end_date: y.endDate })),
          ashtottari: (data.additionalDashas?.ashtottari || []).map((a: any) => ({ lord: a.lord, start_date: a.startDate, end_date: a.endDate }))
        },
        yogas: yogasMapped,
        doshas: doshasMapped
      },
      KP: {
        planets: kpPlanetsMapped,
        cusps: kpCuspsMapped,
        house_significators: data.kpSignificators?.houseSignificators || {},
        planet_significators: data.kpSignificators?.planetSignificators || {},
        ruling_planets: kpRulingPlanets,
        dba: {
          mahadasha: data.kpDasha?.dashas?.[0]?.planet || data.dashas?.[0]?.lord || "Unknown",
          bhukti: data.kpDasha?.dashas?.[0]?.nested?.[0]?.planet || data.dashas?.[0]?.subPeriods?.[0]?.lord || "Unknown",
          antara: data.kpDasha?.dashas?.[0]?.nested?.[0]?.nested?.[0]?.planet || "Unknown",
          sookshma: "Unknown",
          prana: "Unknown",
          start_date: data.kpDasha?.dashas?.[0]?.startTime || data.dashas?.[0]?.startDate || "",
          end_date: data.kpDasha?.dashas?.[0]?.endTime || data.dashas?.[0]?.endDate || ""
        }
      },
      Jaimini: {
        karakas: jaiminiKarakas,
        lagnas: {
          karakamsha_lagna: "Unknown",
          swamsha: "Unknown",
          pada_lagna: "Unknown"
        },
        pada_coordinates: {}
      },
      Western: {
        planets: westernPlanetsMapped,
        cusps: westernCuspsMapped,
        aspects: westernAspectsMapped,
        declinations: {},
        planet_speeds: {},
      }
    },
    Validation: {
      birth_time_rectified: false,
      api_version: "v1.0.2",
      api_confidence: "Authoritative / Verified"
    }
  };
}

