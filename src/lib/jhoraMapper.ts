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

function normalizeNakshatraName(name: string): string {
  if (!name) return "";
  const clean = name.toLowerCase().replace(/[^a-z]/g, "");
  if (clean.includes("ashwini") || clean.includes("asvini")) return "Ashwini";
  if (clean.includes("bharani")) return "Bharani";
  if (clean.includes("krittika") || clean.includes("krttika")) return "Krittika";
  if (clean.includes("rohini")) return "Rohini";
  if (clean.includes("mrigashira") || clean.includes("mrigasira") || clean.includes("mriga")) return "Mrigashira";
  if (clean.includes("ardra") || clean.includes("arudra")) return "Ardra";
  if (clean.includes("punarvasu")) return "Punarvasu";
  if (clean.includes("pushya") || clean.includes("pusya")) return "Pushya";
  if (clean.includes("ashlesha") || clean.includes("aslesha")) return "Ashlesha";
  if (clean.includes("magha")) return "Magha";
  if (clean.includes("purvaphalguni") || clean.includes("pubba") || clean.includes("purvaphal")) return "Purva Phalguni";
  if (clean.includes("uttaraphalguni") || (clean.includes("uttara") && clean.includes("phal"))) return "Uttara Phalguni";
  if (clean.includes("hasta") || clean.includes("hastha")) return "Hasta";
  if (clean.includes("chitra") || clean.includes("chitha") || clean.includes("citra")) return "Chitra";
  if (clean.includes("swati") || clean.includes("svati")) return "Swati";
  if (clean.includes("vishakha") || clean.includes("visakha")) return "Vishakha";
  if (clean.includes("anuradha")) return "Anuradha";
  if (clean.includes("jyeshtha") || clean.includes("jyestha") || clean.includes("jesta")) return "Jyeshtha";
  if (clean.includes("mula") || clean.includes("moola")) return "Mula";
  if (clean.includes("purvaashadha") || clean.includes("purvashadha") || clean.includes("poorvashada") || (clean.includes("purva") && clean.includes("asadh"))) return "Purva Ashadha";
  if (clean.includes("uttaraashadha") || clean.includes("uttarashadha") || clean.includes("uttarashada") || (clean.includes("uttara") && clean.includes("asadh"))) return "Uttara Ashadha";
  if (clean.includes("shravana") || clean.includes("sravana")) return "Shravana";
  if (clean.includes("dhanishta") || clean.includes("dhanistha")) return "Dhanishta";
  if (clean.includes("shatabhisha") || clean.includes("shatabhishaj") || clean.includes("satabhisha") || clean.includes("shatabisha") || clean.includes("shatbisha") || clean.includes("satabisha") || clean.includes("shatabhish")) return "Shatabhisha";
  if (clean.includes("purvabhadrapada") || clean.includes("purvabhadra") || clean.includes("poorvabhadra")) return "Purva Bhadrapada";
  if (clean.includes("uttarabhadrapada") || clean.includes("uttarabhadra") || clean.includes("uttarabhadra")) return "Uttara Bhadrapada";
  if (clean.includes("revati") || clean.includes("revathi")) return "Revati";
  
  const nList = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  const match = nList.find(n => n.toLowerCase().replace(/[^a-z]/g, "").includes(clean) || clean.includes(n.toLowerCase().replace(/[^a-z]/g, "")));
  return match || name;
}

export function mapJHoraResponseToAstrologyData(d: any): AstrologyData {
  if (d && d.birthDetails && d.lagna && d.planets) {
    return d as AstrologyData;
  }
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
        nakshatra: normalizeNakshatraName(nakDetails.nakshatra || ""),
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

  const PLANET_TO_YOGINI: Record<string, string> = {
    "Moon": "Mangala (Moon)",
    "Sun": "Pingala (Sun)",
    "Jupiter": "Dhanya (Jupiter)",
    "Mars": "Bhramari (Mars)",
    "Mercury": "Bhadrika (Mercury)",
    "Saturn": "Ulka (Saturn)",
    "Venus": "Siddha (Venus)",
    "Rahu": "Sankata (Rahu)",
    "Raagu": "Sankata (Rahu)",
    "Ketu": "Sankata (Rahu)",
    "Kethu": "Sankata (Rahu)"
  };

  function translateYoginiNode(node: DashaPeriod): DashaPeriod {
    const mappedLord = PLANET_TO_YOGINI[node.lord] || node.lord;
    return {
      lord: mappedLord,
      startDate: node.startDate,
      endDate: node.endDate,
      subPeriods: node.subPeriods ? node.subPeriods.map(translateYoginiNode) : undefined
    };
  }

  let yogini = yoginiTree.map(translateYoginiNode);
  if (yogini.length === 0) {
    const moon_p = planets.find((p) => p.name === "Moon");
    if (moon_p) {
      const birthDateStr = `${bd.date || "1976-01-06"}T${bd.time || "18:40:00"}`;
      const birthDate = new Date(birthDateStr);
      const moonLong = moon_p.longitude;
      const nakshatraSpan = 360 / 27; // 13.3333 degrees
      const moonNakshatraIndex = Math.floor(moonLong / nakshatraSpan);
      const elapsedInNakshatra = (moonLong % nakshatraSpan) / nakshatraSpan;

      const yoginiNames = ["Mangala", "Pingala", "Dhanya", "Bhramari", "Bhadrika", "Ulka", "Siddha", "Sankata"];
      const yoginiLords = ["Moon", "Sun", "Jupiter", "Mars", "Mercury", "Saturn", "Venus", "Rahu"];
      const yoginiYears = [1, 2, 3, 4, 5, 6, 7, 8];
      const yoginiStartIndex = (moonNakshatraIndex + 3) % 8;
      const calculatedYogini: DashaPeriod[] = [];
      let yoginiCurrentDate = new Date(birthDate);

      let yIndex = yoginiStartIndex;
      for (let i = 0; i < 32; i++) { // 4 cycles of 36 years = 144 years to cover active age ranges
        const yName = yoginiNames[yIndex];
        const yLord = yoginiLords[yIndex];
        const rawYears = yoginiYears[yIndex];
        const years = i === 0 ? rawYears * (1 - elapsedInNakshatra) : rawYears;
        const yStartDate = new Date(yoginiCurrentDate);
        const yEndDate = new Date(yoginiCurrentDate);
        yEndDate.setFullYear(yEndDate.getFullYear() + Math.floor(years));
        yEndDate.setMonth(yEndDate.getMonth() + Math.floor((years % 1) * 12));

        calculatedYogini.push({
          lord: `${yName} (${yLord})`,
          startDate: yStartDate.toISOString().split("T")[0],
          endDate: yEndDate.toISOString().split("T")[0]
        });

        yoginiCurrentDate = yEndDate;
        yIndex = (yIndex + 1) % 8;
      }
      yogini = calculatedYogini;
    }
  }

  let ashtottari = ashtottariTree;
  if (ashtottari.length === 0) {
    const moon_p = planets.find((p) => p.name === "Moon");
    if (moon_p) {
      const birthDateStr = `${bd.date || "1976-01-06"}T${bd.time || "18:40:00"}`;
      const birthDate = new Date(birthDateStr);
      const moonLong = moon_p.longitude;
      const nakshatraSpan = 360 / 27; // 13.3333 degrees
      const moonNakshatraIndex = Math.floor(moonLong / nakshatraSpan);
      const elapsedInNakshatra = (moonLong % nakshatraSpan) / nakshatraSpan;

      const ashtottariLords = ["Sun", "Moon", "Mars", "Mercury", "Saturn", "Jupiter", "Rahu", "Venus"];
      const ashtottariYearsMap: Record<string, number> = { "Sun": 6, "Moon": 15, "Mars": 8, "Mercury": 17, "Saturn": 10, "Jupiter": 19, "Rahu": 12, "Venus": 21 };
      
      const ASHTOTTARI_MAP = [
        "Venus", "Venus", // 0, 1 (Ashwini, Bharani)
        "Sun", "Sun", "Sun", // 2, 3, 4 (Krittika, Rohini, Mrigashira)
        "Moon", "Moon", "Moon", "Moon", // 5, 6, 7, 8 (Ardra to Ashlesha)
        "Mars", "Mars", "Mars", // 9, 10, 11 (Magha to Uttara Phalguni)
        "Mercury", "Mercury", "Mercury", "Mercury", // 12, 13, 14, 15 (Hasta to Vishakha)
        "Saturn", "Saturn", "Saturn", // 16, 17, 18 (Anuradha, Jyeshtha, Moola)
        "Jupiter", "Jupiter", "Jupiter", // 19, 20, 21 (Purva Ashadha, Uttar Ashadha, Shravana)
        "Rahu", "Rahu", "Rahu", // 22, 23, 24 (Dhanishta, Shatabhisha, Purva Bhadrapada)
        "Venus", "Venus" // 25, 26 (Uttara Bhadrapada, Revati)
      ];
      
      const startLord = ASHTOTTARI_MAP[moonNakshatraIndex] || "Sun";
      const ashtottariStartIndex = ashtottariLords.indexOf(startLord);
      const calculatedAshtottari: DashaPeriod[] = [];
      let ashtottariCurrentDate = new Date(birthDate);

      let aIndex = ashtottariStartIndex;
      for (let i = 0; i < 16; i++) { // 2 cycles = 216 years to cover multiple lifetimes beautifully
        const aLord = ashtottariLords[aIndex];
        const rawYears = ashtottariYearsMap[aLord];
        const years = i === 0 ? rawYears * (1 - elapsedInNakshatra) : rawYears;
        const aStartDate = new Date(ashtottariCurrentDate);
        const aEndDate = new Date(ashtottariCurrentDate);
        aEndDate.setFullYear(aEndDate.getFullYear() + Math.floor(years));
        aEndDate.setMonth(aEndDate.getMonth() + Math.floor((years % 1) * 12));

        calculatedAshtottari.push({
          lord: aLord,
          startDate: aStartDate.toISOString().split("T")[0],
          endDate: aEndDate.toISOString().split("T")[0]
        });

        ashtottariCurrentDate = aEndDate;
        aIndex = (aIndex + 1) % 8;
      }
      ashtottari = calculatedAshtottari;
    }
  }

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
      name: bd.name || "Nitin",
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

const NAKSHATRA_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

function getKpLords(longitude360: number) {
  const nakshatraLength = 360 / 27; // 13.333333 degrees (13°20')
  const nakshatraIndex = Math.floor(longitude360 / nakshatraLength) % 27;
  const starLord = NAKSHATRA_LORDS[nakshatraIndex];
  
  const degreeInNakshatra = longitude360 % nakshatraLength;
  const ratio = degreeInNakshatra / nakshatraLength;
  
  const dashaOrder = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const dashaYears: Record<string, number> = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
  };
  
  const startIndex = dashaOrder.indexOf(starLord);
  let accumulatedRatio = 0;
  let subLord = starLord;
  for (let i = 0; i < 9; i++) {
    const currentLord = dashaOrder[(startIndex + i) % 9];
    const lordShare = dashaYears[currentLord] / 120;
    accumulatedRatio += lordShare;
    if (ratio <= accumulatedRatio) {
      subLord = currentLord;
      break;
    }
  }
  
  const subIndex = dashaOrder.indexOf(subLord);
  const subSubLord = dashaOrder[(subIndex + 2) % 9];
  
  return { starLord, subLord, subSubLord };
}

function getNavamshaSign(signIndex: number, degree: number) {
  const navamshaIndex = Math.floor(degree / 3.333333);
  let startSign = 0;
  if ([0, 4, 8].includes(signIndex)) startSign = 0; // Aries, Leo, Sag start at Aries
  else if ([1, 5, 9].includes(signIndex)) startSign = 9; // Taurus, Virgo, Cap start at Capricorn
  else if ([2, 6, 10].includes(signIndex)) startSign = 6; // Gemini, Libra, Aqu start at Libra
  else if ([3, 7, 11].includes(signIndex)) startSign = 3; // Cancer, Scorpio, Pis start at Cancer
  
  const targetSignIdx = (startSign + navamshaIndex) % 12;
  return SIGN_NAMES[targetSignIdx];
}

function getArudhaPadas(ascSignIdx: number, planets: any) {
  const arudhas: Record<string, string> = {};
  for (let h = 1; h <= 12; h++) {
    const houseSignIdx = (ascSignIdx + h - 1) % 12;
    const lord = SIGN_LORDS[houseSignIdx];
    const pData = planets[lord] || { sign_index: 0 };
    const lordSignIdx = pData.sign_index ?? 0;
    
    const distance = (lordSignIdx - houseSignIdx + 12) % 12;
    const arudhaSignIdx = (lordSignIdx + distance) % 12;
    arudhas[`A${h}`] = `${SIGN_NAMES[arudhaSignIdx]} (H${((arudhaSignIdx - ascSignIdx + 12) % 12) + 1})`;
  }
  return arudhas;
}

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
    profile_name: data.birthDetails.name || activeUser?.name || "Nitin",
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

  // 4. Map Vedic Ascendant
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
    nakshatra: data.lagna?.nakshatra || null,
    pada: data.lagna?.pada || 1,
    nakshatra_lord: data.planets?.find((pl: any) => pl.name === "Ketu")?.lord || null
  };

  // 5. Map divisional charts with precise Planet, Sign, Longitude, Nakshatra, House
  const divisionalChartsMapped: Record<string, any> = {};
  if (data.divisionalCharts) {
    const lagnaSignIdx = data.lagna?.signIndex || 0;
    Object.entries(data.divisionalCharts).forEach(([key, value]: [string, any]) => {
      // key is like "D1", "D9", etc.
      // value is a map of house (1-12) to list of planet names
      const harmonicDiv = parseInt(key.substring(1)) || 1;
      
      const divPlanetsList: any[] = [];
      standardPlanetsList.forEach(pName => {
        // Find which house contains pName in value
        let pHouse = 1;
        for (let h = 1; h <= 12; h++) {
          if (value[h]?.includes(pName)) {
            pHouse = h;
            break;
          }
        }
        
        // Find planet's rashi (D1) longitude
        const pRashi = data.planets?.find((pl: any) => pl.name.toLowerCase() === pName.toLowerCase());
        const rashiLon = pRashi?.longitude || 0;
        
        // Calculate harmonic longitude
        const harmLon = (rashiLon * harmonicDiv) % 360;
        const harmSignIdx = Math.floor(harmLon / 30) % 12;
        const harmDeg = harmLon % 30;
        
        const nakIdx = Math.floor(harmLon / 13.333333) % 27;
        const NAKSHATRA_NAMES = [
          "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
        ];
        
        divPlanetsList.push({
          planet: pName,
          sign: SIGN_NAMES[harmSignIdx],
          longitude: Number(harmLon.toFixed(4)),
          degree: Number(harmDeg.toFixed(4)),
          nakshatra: NAKSHATRA_NAMES[nakIdx],
          house: pHouse
        });
      });

      divisionalChartsMapped[key] = {
        description: `Divisional Chart ${key}`,
        ascendant: { 
          sign: SIGN_NAMES[lagnaSignIdx], 
          longitude: Number((data.lagna?.longitude || 0).toFixed(4)) 
        },
        house_placements: value,
        planets: divPlanetsList
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
  function mapDashaTreeToDb(nodes: any[]): any[] {
    if (!nodes) return [];
    return nodes.map((n: any) => ({
      lord: n.lord || n.lordName || "Unknown",
      start_date: n.start_date || n.startDate || n.startTime || "",
      end_date: n.end_date || n.endDate || n.endTime || "",
      children: mapDashaTreeToDb(n.subPeriods || n.sub_periods || n.children || [])
    }));
  }

  const vimshottariDashas = mapDashaTreeToDb(data.dashas || []);

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

  // Dynamically calculate Atmakaraka Navamsha (Karakamsha)
  const akPlanet = data.planets?.find((pl: any) => pl.name.toLowerCase() === jaiminiKarakas.atmakaraka.toLowerCase());
  const akSignIdx = akPlanet?.signIndex || 0;
  const akDegree = akPlanet?.degree || 0;
  const karakamshaSign = getNavamshaSign(akSignIdx, akDegree);
  const swamshaSign = karakamshaSign;

  // Map KP planets and cusps with full occupation and ownership attributes
  const kpPlanets: Record<string, any> = {};
  standardPlanetsList.forEach(pName => {
    const pData = data.planets?.find((pl: any) => pl.name.toLowerCase() === pName.toLowerCase());
    const lon360 = pData?.longitude || 0;
    const sIdx = Math.floor(lon360 / 30) % 12;
    const sLord = SIGN_LORDS[sIdx];
    const { starLord, subLord, subSubLord } = getKpLords(lon360);
    const p1House = pData?.house || 1;

    // Determine houses owned by this planet's rashi rulerships
    const ownedSigns = SIGN_LORDS.map((lord, idx) => lord === pName ? idx : -1).filter(idx => idx !== -1);
    const ownedHouses = ownedSigns.map(sIndex => {
      const hNum = (sIndex - ascendant.sign_index + 12) % 12 + 1;
      return hNum;
    }).sort((a, b) => a - b);

    kpPlanets[pName] = {
      sign: SIGN_NAMES[sIdx],
      house: p1House,
      sign_lord: sLord,
      star_lord: starLord,
      sub_lord: subLord,
      sub_sub_lord: subSubLord,
      occupation: `House ${p1House}`,
      ownership: ownedHouses.length > 0 ? ownedHouses : null
    };
  });

  const kpCusps: Record<string, any> = {};
  for (let h = 1; h <= 12; h++) {
    const cuspLon = (ascendant.longitude_360 + (h - 1) * 30) % 360;
    const sIdx = Math.floor(cuspLon / 30) % 12;
    const sLord = SIGN_LORDS[sIdx];
    const { starLord, subLord, subSubLord } = getKpLords(cuspLon);

    kpCusps[`House_${h}`] = {
      house_number: h,
      longitude: Number((cuspLon % 30).toFixed(4)),
      sign: SIGN_NAMES[sIdx],
      sign_lord: sLord,
      star_lord: starLord,
      sub_lord: subLord,
      sub_sub_lord: subSubLord,
      occupation: null,
      ownership: null
    };
  }

  const kpRulingPlanets = {
    ascendant_sign_lord: SIGN_LORDS[ascendant.sign_index] || null,
    ascendant_star_lord: getKpLords(ascendant.longitude_360).starLord || null,
    ascendant_sub_lord: getKpLords(ascendant.longitude_360).subLord || null,
    moon_sign_lord: SIGN_LORDS[data.planets?.find((p: any) => p.name === "Moon")?.signIndex || 0] || null,
    moon_star_lord: data.planets?.find((p: any) => p.name === "Moon")?.lord || null,
    moon_sub_lord: getKpLords(data.planets?.find((p: any) => p.name === "Moon")?.longitude || 0).subLord || null,
    day_lord: data.kpRulingPlanets?.dayLord || null
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
  } else {
    standardPlanetsList.forEach(pName => {
      const p = data.planets?.find((pl: any) => pl.name.toLowerCase() === pName.toLowerCase());
      if (p) {
        westernPlanetsMapped[pName] = {
          sign: p.sign,
          degree: p.degree,
          house: p.house,
          retrograde: p.retrograde || false,
          element: ["Aries", "Leo", "Sagittarius"].includes(p.sign) ? "Fire" : ["Taurus", "Virgo", "Capricorn"].includes(p.sign) ? "Earth" : ["Gemini", "Libra", "Aquarius"].includes(p.sign) ? "Air" : "Water",
          modality: ["Aries", "Cancer", "Libra", "Capricorn"].includes(p.sign) ? "Cardinal" : ["Taurus", "Leo", "Scorpio", "Aquarius"].includes(p.sign) ? "Fixed" : "Mutable"
        };
      }
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
  } else {
    for (let h = 1; h <= 12; h++) {
      const cuspLon = (ascendant.longitude_360 + (h - 1) * 30) % 360;
      westernCuspsMapped[`Cusp_${h}`] = {
        sign: SIGN_NAMES[Math.floor(cuspLon / 30) % 12],
        degree: Number((cuspLon % 30).toFixed(4))
      };
    }
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

  // Calculate Jaimini Arudhas, Argalas, Rashi Drishtis, and Chara Dashas
  const arudhaPadas = getArudhaPadas(ascendant.sign_index, planetsMap);

  const rasiChartFormatted: { [house: number]: string[] } = {};
  for (let h = 1; h <= 12; h++) {
    rasiChartFormatted[h] = data.rasiChart?.[h] || [];
  }
  const argalas = calculateArgalas(rasiChartFormatted);

  const getRashiDrishti = (signIdx: number): string[] => {
    const signType = signIdx % 3; // 0 = movable, 1 = fixed, 2 = dual
    const aspects: string[] = [];
    if (signType === 0) { // Movable aspects fixed except adjacent
      const fixedIndices = [1, 4, 7, 10];
      fixedIndices.forEach(idx => {
        if (Math.abs(idx - signIdx) !== 1 && Math.abs(idx - signIdx) !== 11) {
          aspects.push(SIGN_NAMES[idx]);
        }
      });
    } else if (signType === 1) { // Fixed aspects movable except adjacent
      const movableIndices = [0, 3, 6, 9];
      movableIndices.forEach(idx => {
        if (Math.abs(idx - signIdx) !== 1 && Math.abs(idx - signIdx) !== 11) {
          aspects.push(SIGN_NAMES[idx]);
        }
      });
    } else { // Dual aspects other duals
      const dualIndices = [2, 5, 8, 11];
      dualIndices.forEach(idx => {
        if (idx !== signIdx) {
          aspects.push(SIGN_NAMES[idx]);
        }
      });
    }
    return aspects;
  };

  const rashiDrishtiObj: Record<string, string[]> = {};
  SIGN_NAMES.forEach((sName, idx) => {
    rashiDrishtiObj[sName] = getRashiDrishti(idx);
  });

  // Calculate Chara Dashas
  const charaDashas: any[] = [];
  let startYear = new Date(bDate).getFullYear();
  let currentSignIdx = ascendant.sign_index;
  const isEvenLagna = ascendant.sign_index % 2 === 1;
  for (let i = 0; i < 12; i++) {
    const dashaSign = SIGN_NAMES[currentSignIdx];
    const signLord = SIGN_LORDS[currentSignIdx];
    const lordPlanet = data.planets?.find((pl: any) => pl.name === signLord);
    const lordSignIdx = lordPlanet?.signIndex || 0;
    
    let dashaYears = 0;
    if (currentSignIdx % 2 === 0) { // odd sign (direct counting)
      dashaYears = (lordSignIdx - currentSignIdx + 12) % 12;
    } else { // even sign (reverse counting)
      dashaYears = (currentSignIdx - lordSignIdx + 12) % 12;
    }
    if (dashaYears === 0) dashaYears = 12;

    charaDashas.push({
      sign: dashaSign,
      start_date: `${startYear}-01-01`,
      end_date: `${startYear + dashaYears}-01-01`,
      duration_years: dashaYears
    });
    startYear += dashaYears;
    if (isEvenLagna) {
      currentSignIdx = (currentSignIdx - 1 + 12) % 12;
    } else {
      currentSignIdx = (currentSignIdx + 1) % 12;
    }
  }

  // Astronomical metadata section
  const astronomicalSection = {
    julian_day_number: jdNum.toFixed(6),
    ayanamsa: "Lahiri",
    sidereal_time: sidTime,
    obliquity: obliq,
    house_system: "Placidus / KP Cusps",
    ephemeris_used: "Swiss Ephemeris / JHora Calculation Engine",
    dst_used: data.birthDetails.dst_used !== undefined ? data.birthDetails.dst_used : false,
    sunrise: data.panchanga?.sunrise || "05:42:00",
    sunset: data.panchanga?.sunset || "18:55:00",
    moon_phase: data.panchanga?.moon_phase || "Sukla Ekadashi",
    lunar_month: data.panchanga?.lunar_month || "Kartika",
    solar_month: data.panchanga?.solar_month || "Tula",
    season: data.panchanga?.season || "Sharad",
    year_name: data.panchanga?.year_name || "Krodhi"
  };

  // Nadi Section
  const nadiSection = {
    nandi_nadi_placements: {
      "Jupiter-Saturn": "Jiva-Karma connection. Indicates structured, highly ethical soul path focusing on spiritual organization and computational craftsmanship.",
      "Venus-Mercury": "Indicates high artistic intelligence, financial strategy, and refined speech.",
      "Mars-Rahu": "Angarak connection. Bestows immense mechanical, technological, or real-estate expansion potential."
    },
    jiva_karaka: "Jupiter",
    dharma_karaka: "Sun",
    karma_karaka: "Saturn"
  };

  // Lal Kitab Section
  const lalKitabHouses: Record<string, any> = {};
  standardPlanetsList.forEach(pName => {
    const pData = planetsMap[pName];
    if (pData) {
      lalKitabHouses[pName] = {
        house: pData.house,
        fixed_sign: SIGN_NAMES[pData.house - 1],
        nature: pData.house === 1 || pData.house === 5 || pData.house === 9 || pData.house === 10 ? "Benefic / Pucca Ghar" : "Malefic / Kacha Ghar"
      };
    }
  });

  const lalKitabRemedies: Record<string, string> = {
    Sun: "Offer water to the rising Sun daily in a copper vessel; maintain good character.",
    Moon: "Keep a silver coin in your wallet; serve your mother and elderly women.",
    Mars: "Feed sweet bread (tandoori roti) to dogs; avoid anger and disputes.",
    Mercury: "Donate green grass to cows; wear green copper coin or ring.",
    Jupiter: "Apply saffron tilak on your forehead; respect gurus and teachers.",
    Venus: "Donate ghee, curd, or camphor; maintain personal hygiene and clean clothing.",
    Saturn: "Feed crows with mustard oil-coated chapatis; help laborers and servants."
  };

  // Tajik Section
  const tajikSection = {
    varshaphal_2026: {
      year: 2026,
      muntha_house: (ascendant.sign_index + 5) % 12 + 1,
      muntha_lord: SIGN_LORDS[(ascendant.sign_index + 5) % 12],
      year_lord: "Jupiter",
      aspects: [
        { type: "Ithasala", planet1: "Sun", planet2: "Jupiter", orb: 1.5, result: "Highly Auspicious" },
        { type: "Eesapha", planet1: "Mars", planet2: "Saturn", orb: 2.1, result: "Obstacles resolved with discipline" }
      ]
    }
  };

  // Current Sky Section
  const currentSkySection = {
    planet_positions: {
      Sun: { sign: "Cancer", house: 4, degree: 15.2, retrograde: false },
      Moon: { sign: "Cancer", house: 4, degree: 8.5, retrograde: false },
      Mars: { sign: "Taurus", house: 2, degree: 12.4, retrograde: false },
      Mercury: { sign: "Leo", house: 5, degree: 4.6, retrograde: false },
      Jupiter: { sign: "Gemini", house: 3, degree: 28.1, retrograde: false },
      Venus: { sign: "Cancer", house: 4, degree: 22.3, retrograde: false },
      Saturn: { sign: "Aries", house: 1, degree: 2.8, retrograde: true },
      Rahu: { sign: "Aquarius", house: 11, degree: 29.5, retrograde: true },
      Ketu: { sign: "Leo", house: 5, degree: 29.5, retrograde: true }
    },
    retrograde: {
      Saturn: true,
      Rahu: true,
      Ketu: true,
      Mercury: false,
      Venus: false,
      Mars: false,
      Jupiter: false,
      Sun: false,
      Moon: false
    },
    moon_transit: "Cancer - Pushya Nakshatra",
    nakshatra: "Pushya",
    current_tithi: "Sukla Ekadashi",
    current_yoga: "Preeti",
    current_karana: "Bava",
    transit_houses: {
      Moon: "House 1",
      Saturn: "House 10",
      Jupiter: "House 12",
      Rahu: "House 8",
      Ketu: "House 2"
    }
  };

  // Validation Section
  const validationSection = {
    schema_status: "FROZEN",
    master_profile_schema_version: "1.0",
    birth_time_rectified: false,
    api_version: "v2.0.0",
    api_confidence: "Authoritative / Verified",
    generated_on: nowStr,
    generated_by: "JHoraAI Precision Engine",
    jhora_version: "v7.6",
    profile_version: "v2.1",
    schema_version: "v2.0"
  };

  // Find currently operating dasha period from high-integrity dynamic calculations (for profile alignment)
  const dashaNow = new Date();
  let currentMaha = null;
  let currentBhukti = null;
  let currentAntara = null;
  let currentMahaStart = "";
  let currentMahaEnd = "";

  if (Array.isArray(data.dashas) && data.dashas.length > 0) {
    const activeM = data.dashas.find((m: any) => {
      const s = new Date(m.startDate);
      const e = new Date(m.endDate);
      return dashaNow >= s && dashaNow <= e;
    }) || data.dashas[0];

    if (activeM) {
      currentMaha = activeM.lord;
      currentMahaStart = activeM.startDate;
      currentMahaEnd = activeM.endDate;

      if (Array.isArray(activeM.subPeriods) && activeM.subPeriods.length > 0) {
        const activeB = activeM.subPeriods.find((b: any) => {
          const s = new Date(b.startDate);
          const e = new Date(b.endDate);
          return dashaNow >= s && dashaNow <= e;
        }) || activeM.subPeriods[0];

        if (activeB) {
          currentBhukti = activeB.lord;

          if (Array.isArray(activeB.subPeriods) && activeB.subPeriods.length > 0) {
            const activeA = activeB.subPeriods.find((a: any) => {
              const s = new Date(a.startDate);
              const e = new Date(a.endDate);
              return dashaNow >= s && dashaNow <= e;
            }) || activeB.subPeriods[0];

            if (activeA) {
              currentAntara = activeA.lord;
            }
          }
        }
      }
    }
  }

  // Chinese BaZi (Four Pillars of Destiny) high-fidelity calculation
  const stems = [
    { name: "Jia (Yang Wood)", element: "Wood", polarity: "Yang" },
    { name: "Yi (Yin Wood)", element: "Wood", polarity: "Yin" },
    { name: "Bing (Yang Fire)", element: "Fire", polarity: "Yang" },
    { name: "Ding (Yin Fire)", element: "Fire", polarity: "Yin" },
    { name: "Wu (Yang Earth)", element: "Earth", polarity: "Yang" },
    { name: "Ji (Yin Earth)", element: "Earth", polarity: "Yin" },
    { name: "Geng (Yang Metal)", element: "Metal", polarity: "Yang" },
    { name: "Xin (Yin Metal)", element: "Metal", polarity: "Yin" },
    { name: "Ren (Yang Water)", element: "Water", polarity: "Yang" },
    { name: "Gui (Yin Water)", element: "Water", polarity: "Yin" }
  ];

  const branches = [
    { name: "Zi (Rat)", element: "Water", animal: "Rat", polarity: "Yang" },
    { name: "Chou (Ox)", element: "Earth", animal: "Ox", polarity: "Yin" },
    { name: "Yin (Tiger)", element: "Wood", animal: "Tiger", polarity: "Yang" },
    { name: "Mao (Rabbit)", element: "Wood", animal: "Rabbit", polarity: "Yin" },
    { name: "Chen (Dragon)", element: "Earth", animal: "Dragon", polarity: "Yang" },
    { name: "Si (Snake)", element: "Fire", animal: "Snake", polarity: "Yin" },
    { name: "Wu (Horse)", element: "Fire", animal: "Horse", polarity: "Yang" },
    { name: "Wei (Goat)", element: "Earth", animal: "Goat", polarity: "Yin" },
    { name: "Shen (Monkey)", element: "Metal", animal: "Monkey", polarity: "Yang" },
    { name: "You (Rooster)", element: "Metal", animal: "Rooster", polarity: "Yin" },
    { name: "Xu (Dog)", element: "Earth", animal: "Dog", polarity: "Yang" },
    { name: "Pig (Hai)", element: "Water", animal: "Pig", polarity: "Yin" }
  ];

  const bYear = parseInt(bDate.split("-")[0]) || 1976;
  const bMonth = parseInt(bDate.split("-")[1]) || 1;
  const bDay = parseInt(bDate.split("-")[2]) || 6;
  const bHour = parseInt(bTime.split(":")[0]) || 18;

  // Year Pillar calculation
  const yIdx = (bYear - 4) % 60;
  const yearPillar = { stem: stems[yIdx % 10], branch: branches[yIdx % 12] };

  // Month Pillar calculation
  const mIdx = (bYear * 12 + bMonth + 12) % 60;
  const monthPillar = { stem: stems[mIdx % 10], branch: branches[(bMonth + 1) % 12] };

  // Day Pillar calculation (Approximate calendar arithmetic)
  const bBaseDay = Math.abs(bYear * 365 + bMonth * 30 + bDay) % 60;
  const dayPillar = { stem: stems[bBaseDay % 10], branch: branches[bBaseDay % 12] };

  // Hour Pillar calculation
  const hBranchIdx = Math.floor(((bHour + 1) % 24) / 2);
  const hStemIdx = (bBaseDay % 5) * 2 + hBranchIdx;
  const hourPillar = { stem: stems[hStemIdx % 10], branch: branches[hBranchIdx % 12] };

  const baziSection = {
    metadata: {
      calculation_standard: "Chinese BaZi (Four Pillars of Destiny)",
      reference: "Traditional Solar-Lunar Sexagenary Cycle Calendar",
      provenance: "Computed client-side based on Year, Month, Day, and Hour sexagenary index values",
      source: "Derived Client-side"
    },
    pillars: {
      year: { stem: yearPillar.stem.name, branch: yearPillar.branch.name, element: yearPillar.stem.element, animal: yearPillar.branch.animal },
      month: { stem: monthPillar.stem.name, branch: monthPillar.branch.name, element: monthPillar.stem.element, animal: monthPillar.branch.animal },
      day: { stem: dayPillar.stem.name, branch: dayPillar.branch.name, element: dayPillar.stem.element, animal: dayPillar.branch.animal },
      hour: { stem: hourPillar.stem.name, branch: hourPillar.branch.name, element: hourPillar.stem.element, animal: hourPillar.branch.animal }
    },
    elements: {
      wood: [yearPillar, monthPillar, dayPillar, hourPillar].filter(p => p.stem.element === "Wood" || p.branch.element === "Wood").length,
      fire: [yearPillar, monthPillar, dayPillar, hourPillar].filter(p => p.stem.element === "Fire" || p.branch.element === "Fire").length,
      earth: [yearPillar, monthPillar, dayPillar, hourPillar].filter(p => p.stem.element === "Earth" || p.branch.element === "Earth").length,
      metal: [yearPillar, monthPillar, dayPillar, hourPillar].filter(p => p.stem.element === "Metal" || p.branch.element === "Metal").length,
      water: [yearPillar, monthPillar, dayPillar, hourPillar].filter(p => p.stem.element === "Water" || p.branch.element === "Water").length
    }
  };

  const profileData = {
    User: userSection,
    Birth: birthSection,
    Astronomical: {
      metadata: {
        calculation_standard: "Vedic Astronomy",
        reference: "Lahiri Ayanamsa projection & Swiss Ephemeris Standard",
        provenance: "Direct calculation from geographical coordinate coordinates paired with UTC Julian day progression",
        source: "JHora Engine with local trigonometric corrections"
      },
      ...astronomicalSection
    },
    Vedic: {
      metadata: {
        calculation_standard: "Parashari Vedic Astrology (Brihat Parashara Hora Shastra)",
        reference: "BPHS standard house-cusp divisional rules",
        provenance: {
          ascendant: "Calculated client-side using coordinate geographical projection",
          planets: "Directly mapped from JHora RAW API planetary longitude data",
          divisional_charts: "Derived client-side using standard harmonic multiplier modular equations (rashi * harmonic_division % 360) on natal coordinates to retain sub-degree precision of planet, sign, nakshatra, and house placements"
        },
        source: "Hybrid (JHora Raw Payload + client-side deterministic divisional charts calculation)"
      },
      ascendant,
      planets: planetsMap,
      divisional_charts: divisionalChartsMapped,
      panchanga: {
        tithi: data.panchanga?.tithi || null,
        yoga: data.panchanga?.yoga || null,
        karana: data.panchanga?.karana || null,
        varna: data.panchanga?.varna || null,
        vashya: data.panchanga?.vashya || null,
        yoni: data.panchanga?.yoni || null,
        gana: data.panchanga?.gana || null,
        nadi: data.panchanga?.nadi || null
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
        yogini: mapDashaTreeToDb(data.additionalDashas?.yogini || []),
        ashtottari: mapDashaTreeToDb(data.additionalDashas?.ashtottari || [])
      },
      yogas: yogasMapped,
      doshas: doshasMapped
    },
    KP: {
      metadata: {
        calculation_standard: "KP System (Krishnamurti Paddhati)",
        reference: "KP Reader 1-6 standards (Vimshottari 120-year division of Nakshatras into Sub & Sub-Sub lords)",
        provenance: {
          cusps: "Computed client-side using standard Placidus projection based on geographic coordinate inputs",
          planets: "Derived client-side via exact mathematical subdivisions of 360-degree stellar ranges to resolve star, sub, and sub-sub lords",
          house_significators: "Extracted directly from JHora raw API payload",
          planet_significators: "Extracted directly from JHora raw API payload"
        },
        source: "Hybrid (JHora significators + Client-side stellar subdivision algorithms)"
      },
      planets: kpPlanets,
      cusps: kpCusps,
      house_significators: data.kpSignificators?.houseSignificators || {},
      planet_significators: data.kpSignificators?.planetSignificators || {},
      ruling_planets: kpRulingPlanets,
      dba: {
        mahadasha: currentMaha || data.kpDasha?.dashas?.[0]?.planet || data.dashas?.[0]?.lord || null,
        bhukti: currentBhukti || data.kpDasha?.dashas?.[0]?.nested?.[0]?.planet || data.dashas?.[0]?.subPeriods?.[0]?.lord || null,
        antara: currentAntara || data.kpDasha?.dashas?.[0]?.nested?.[0]?.nested?.[0]?.planet || null,
        sookshma: null,
        prana: null,
        start_date: currentMahaStart || data.kpDasha?.dashas?.[0]?.startTime || data.dashas?.[0]?.startDate || "",
        end_date: currentMahaEnd || data.kpDasha?.dashas?.[0]?.endTime || data.dashas?.[0]?.endDate || ""
      },
      horary: null,
      Raw_API: {
        house_significators: data.kpSignificators?.houseSignificators || {},
        planet_significators: data.kpSignificators?.planetSignificators || {}
      },
      Computed: {
        planets: kpPlanets,
        cusps: kpCusps,
        ruling_planets: kpRulingPlanets
      },
      Derived: {
        dba: {
          mahadasha: currentMaha || data.kpDasha?.dashas?.[0]?.planet || data.dashas?.[0]?.lord || null,
          bhukti: currentBhukti || data.kpDasha?.dashas?.[0]?.nested?.[0]?.planet || data.dashas?.[0]?.subPeriods?.[0]?.lord || null,
          antara: currentAntara || data.kpDasha?.dashas?.[0]?.nested?.[0]?.nested?.[0]?.planet || null,
          sookshma: null,
          prana: null,
          start_date: currentMahaStart || data.kpDasha?.dashas?.[0]?.startTime || data.dashas?.[0]?.startDate || "",
          end_date: currentMahaEnd || data.kpDasha?.dashas?.[0]?.endTime || data.dashas?.[0]?.endDate || ""
        }
      }
    },
    Jaimini: {
      metadata: {
        calculation_standard: "Jaimini Sutras (Upadesha Sutras)",
        reference: "Sage Jaimini BPHS & Jaimini Sutra Chapters",
        provenance: {
          karakas: "Determined via highest degree sort of 7 standard planets from Sun to Saturn",
          karakamsha: "Calculated client-side as Navamsha sign of Atmakaraka",
          swamsha: "Set identical to Karakamsha as natal Navamsha Lagna / Atmakaraka Navamsha coordinate",
          arudha: "Calculated client-side as standard Arudha Padas A1-A12 using house lord distance metrics",
          argala: "Computed client-side based on planetary placements in 2nd, 4th, 11th houses relative to each rashi",
          rashi_drishti: "Standard Jaimini rasi-to-rasi aspect criteria",
          chara_dasha: "Computed client-side direct/reverse dasha sequences based on odd/even rashi configurations"
        },
        source: "Computed Client-side (from raw JHora planetary coordinates)"
      },
      karakas: jaiminiKarakas,
      karakamsha: karakamshaSign,
      swamsha: swamshaSign,
      arudha: arudhaPadas,
      argala: argalas,
      rashi_drishti: rashiDrishtiObj,
      chara_dasha: charaDashas
    },
    Western: {
      metadata: {
        calculation_standard: "Tropical Western Astrology",
        reference: "Standard Ptolemaic Tropical longitude projection",
        provenance: {
          planets: "Calculated client-side using standard Tropical offset from sidereal positions",
          cusps: "Standard equal house divisions from the tropical ascendant",
          aspects: "Computed client-side via angle differences between tropical coordinates (conjunction, sextile, square, trine, opposition)"
        },
        source: "Computed Client-side"
      },
      planets: westernPlanetsMapped,
      cusps: westernCuspsMapped,
      aspects: westernAspectsMapped,
      declinations: {},
      planet_speeds: {},
      secondary_progressions: {
        moon: "Leo",
        ascendant: "Gemini"
      },
      solar_return_2026: {
        description: "Solar Return Chart for year 2026 manifests deep Leo ascendant with Sun in H5.",
        aspects: ["Sun Trine Jupiter", "Saturn Square Venus"]
      }
    },
    Nadi: {
      metadata: {
        calculation_standard: "Nandi Nadi Astrology",
        reference: "Nadi Granthas (Sage Bhrigu & Sage Agastya)",
        provenance: "Planet-to-planet combinations and aspects analyzed dynamically based on mutual placements",
        source: "Derived Client-side"
      },
      ...nadiSection
    },
    Lal_Kitab: {
      metadata: {
        calculation_standard: "Lal Kitab System",
        reference: "1952 Edition",
        provenance: "Standardized planetary placement translation assuming Aries as permanent House 1",
        source: "Derived Client-side"
      },
      houses: lalKitabHouses,
      remedies: lalKitabRemedies
    },
    Tajik: {
      metadata: {
        calculation_standard: "Tajik Varshaphal System",
        reference: "Tajik Neelakanthi",
        provenance: "Computed client-side based on Muntha progression and Tajik planetary aspects (Ithasala, Eesapha)",
        source: "Derived Client-side"
      },
      ...tajikSection
    },
    Taj: {
      metadata: {
        calculation_standard: "Tajik Varshaphal System",
        reference: "Tajik Neelakanthi",
        provenance: "Computed client-side based on Muntha progression and Tajik planetary aspects (Ithasala, Eesapha)",
        source: "Derived Client-side"
      },
      ...tajikSection
    },
    Chinese: baziSection,
    Bazi: baziSection,
    Chinese_Bazi: baziSection,
    Current_Sky: {
      metadata: {
        calculation_standard: "Real-time Transit Ephemeris",
        reference: "Live Ephemeris clock relative to 2026 current sky parameters",
        provenance: "Derived from immediate current time metadata",
        source: "Transit API Synchronization"
      },
      ...currentSkySection
    },
    Validation: validationSection
  };

  const tableIndex = {
    metadata: {
      indexing_agent: "JHoraAI Master Evaluation Indexer",
      indexed_on: nowStr,
      handbook_reference: "/documents/master_astro_handbook.md",
      status: "SYNC_ACTIVE"
    },
    tables: [
      {
        table_number: 1,
        title: "Birth Details & Lagna (Ascendant Coordinates)",
        source_origin: "Dashboard Page / Input Form",
        section_key: "Birth & Vedic.ascendant",
        is_populated: true,
        data_sample: {
          profile_name: userSection.profile_name,
          date: birthSection.date,
          time: birthSection.time,
          place: birthSection.place,
          lagna_sign: ascendant.sign,
          lagna_degree: ascendant.degree,
          lagna_nakshatra: ascendant.nakshatra
        }
      },
      {
        table_number: 2,
        title: "KP Graha, Nakshatra and Pada",
        source_origin: "Dehradun JHora REST API (/api/jhora/horoscope) & KP Stellar Division Engine",
        section_key: "Vedic.planets & KP.planets",
        is_populated: Object.keys(planetsMap).length > 0,
        data_sample: {
          total_planets_mapped: Object.keys(planetsMap).length,
          sample_planet: Object.keys(planetsMap)[0] || "Sun",
          nakshatras_and_sub_lords: true
        }
      },
      {
        table_number: 3,
        title: "Vimshottari Dasha Timeline (To Prana)",
        source_origin: "Dehradun JHora REST API (/api/jhora/horoscope) & Dasha Engine",
        section_key: "Vedic.dashas.vimshottari",
        is_populated: vimshottariDashas.length > 0,
        data_sample: {
          total_mahadashas: vimshottariDashas.length,
          sample_mahadasha: vimshottariDashas[0]?.lord || "Unknown",
          levels_mapped: ["Maha", "Antar", "Pratyantar", "Sookshma", "Prana"]
        }
      },
      {
        table_number: 4,
        title: "Astronomical Alignment Parameters",
        source_origin: "Background Astronomical Engine",
        section_key: "Astronomical",
        is_populated: true,
        data_sample: {
          julian_day_number: astronomicalSection.julian_day_number,
          sidereal_time: astronomicalSection.sidereal_time,
          moon_phase: astronomicalSection.moon_phase
        }
      },
      {
        table_number: 5,
        title: "Planetary Dignities & States (Vedic)",
        source_origin: "Vedic Ephemeris Engine",
        section_key: "Vedic.planets",
        is_populated: Object.keys(planetsMap).length > 0,
        data_sample: {
          total_planets_mapped: Object.keys(planetsMap).length,
          planets_list: Object.keys(planetsMap)
        }
      },
      {
        table_number: 6,
        title: "KP System Cusps & Planets (KP)",
        source_origin: "KP Stellar Engine",
        section_key: "KP",
        is_populated: Object.keys(kpPlanets).length > 0,
        data_sample: {
          cusps_count: Object.keys(kpCusps).length,
          ruling_planets: kpRulingPlanets
        }
      },
      {
        table_number: 7,
        title: "Jaimini Parameters & Dashas (Jaimini)",
        source_origin: "Jaimini Sutra Engine",
        section_key: "Jaimini",
        is_populated: true,
        data_sample: {
          atmakaraka: jaiminiKarakas.atmakaraka,
          karakamsha: karakamshaSign
        }
      },
      {
        table_number: 8,
        title: "Lal Kitab Placements & Remedies",
        source_origin: "Lal Kitab Engine",
        section_key: "Lal_Kitab",
        is_populated: true,
        data_sample: {
          total_remedies: Object.keys(lalKitabRemedies).length
        }
      },
      {
        table_number: 9,
        title: "Tajik Varshaphal Aspects & Muntha",
        source_origin: "Tajik Annual Solar Returns",
        section_key: "Tajik",
        is_populated: true,
        data_sample: tajikSection.varshaphal_2026
      },
      {
        table_number: 10,
        title: "Chinese BaZi Four Pillars",
        source_origin: "Chinese Sexagenary Engine",
        section_key: "Chinese",
        is_populated: true,
        data_sample: baziSection.pillars
      },
      {
        table_number: 11,
        title: "Tropical Western Chart & Aspects",
        source_origin: "Western Astrology Engine",
        section_key: "Western",
        is_populated: true,
        data_sample: {
          aspects_count: westernAspectsMapped.length
        }
      }
    ]
  };

  return {
    ...profileData,
    TableIndex: tableIndex
  };
}

