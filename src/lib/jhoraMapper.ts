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
    tithi: cal.Tithi ? cal.Tithi.split(" ")[0] || "Sukla Ekadashi" : "Sukla Ekadashi",
    nakshatra: moon_p.nakshatra,
    yoga: cal.Yoga ? cal.Yoga.split(" ")[0] || "Preeti" : "Preeti",
    karana: cal.Karana ? cal.Karana.split(" ")[0] || "Bava" : "Bava",
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
    const parts = (val || "").split(" ");
    const sign = parts[0] || "Aries";
    const houseNum = parseInt(parts[1]) || 1;
    arudhas[k] = {
      house: houseNum,
      sign: sign,
      label: `${k} (${sign})`
    };
  });

  // Sphutas
  const sphutas: { [key: string]: any } = {};
  Object.entries(h.sphutas || h.sphuta || {}).forEach(([k, val]: [string, any]) => {
    const parts = (val || "").split(" ");
    const sign = parts[0] || "Aries";
    const degStr = parts[1] || "0";
    const degree = parseFloat(degStr) || 0;
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
    const parts = (val || "").split(" ");
    const sign = parts[0] || "Aries";
    const degStr = parts[1] || "0";
    const degree = parseFloat(degStr) || 0;
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
    const sVal = val as string;
    const parts = sVal.trim().split(/\s+/);
    const sign = parts[0] || "Aries";
    const degVal = parseInt(parts[1]) || 0;
    const minVal = parseInt(parts[2]) || 0;
    const secVal = parseInt(parts[3]) || 0;
    const degree = degVal + minVal / 60 + secVal / 3600;

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
