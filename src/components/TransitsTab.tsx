/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  RefreshCw, Calendar, Info, Layers, ArrowRight, Sparkles, MapPin, Clock,
  Star, AlertTriangle, Shield, TrendingUp, Sun, Moon, Compass, Eye, Award, Activity, HelpCircle
} from "lucide-react";
import { AstrologyData, calculateAstrology } from "../lib/astrology";
import { apiFetch as fetch } from "../lib/api";
import { mapJHoraResponseToAstrologyData } from "../lib/jhoraMapper";
import IngressTab from "./IngressTab";
import currentSkyJson from "../knowledgebase/checklist_engine/current_sky.json";

interface TransitsTabProps {
  astrologyData: AstrologyData;
  transitDate?: string;
  setTransitDate?: (d: string) => void;
  transitTime?: string;
  transitPlace?: string;
  transitLatitude?: number;
  transitLongitude?: number;
  transitTimezone?: number;
  subTab?: string;
  chartStyle?: "north" | "south";
  profile?: any;
}

interface TransitPlanet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  longitude: number;
  retrograde?: boolean;
}

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const PLANETS_CYCLE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

const PLANET_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const NAKSHATRA_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

function getSubPeriods(parentLord: string, parentStart: Date, parentEnd: Date): Array<{ lord: string; start: Date; end: Date }> {
  const startIndex = PLANETS_CYCLE.indexOf(parentLord);
  if (startIndex === -1) return [];
  
  const totalParentMs = parentEnd.getTime() - parentStart.getTime();
  const list: Array<{ lord: string; start: Date; end: Date }> = [];
  let currentStartMs = parentStart.getTime();
  
  for (let i = 0; i < 9; i++) {
    const lord = PLANETS_CYCLE[(startIndex + i) % 9];
    const years = PLANET_YEARS[lord];
    const share = years / 120;
    const durationMs = totalParentMs * share;
    const currentEndMs = currentStartMs + durationMs;
    
    list.push({
      lord,
      start: new Date(currentStartMs),
      end: new Date(currentEndMs)
    });
    
    currentStartMs = currentEndMs;
  }
  
  return list;
}

export default function TransitsTab({ 
  astrologyData,
  transitDate: propTransitDate,
  setTransitDate: propSetTransitDate,
  transitTime: propTransitTime,
  transitPlace,
  transitLatitude,
  transitLongitude,
  transitTimezone,
  subTab: propSubTab,
  chartStyle = "north",
  profile
}: TransitsTabProps) {
  const getLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getLocalTimeString = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;
  };

  const [transitDate, setTransitDate] = useState<string>(propTransitDate || getLocalDateString());
  const [transitTime, setTransitTime] = useState<string>(propTransitTime || getLocalTimeString());
  const [lat, setLat] = useState<number>(transitLatitude !== undefined && transitLatitude !== null ? transitLatitude : astrologyData.birthDetails.latitude);
  const [lng, setLng] = useState<number>(transitLongitude !== undefined && transitLongitude !== null ? transitLongitude : astrologyData.birthDetails.longitude);
  const [tz, setTz] = useState<number>(transitTimezone !== undefined && transitTimezone !== null ? transitTimezone : astrologyData.birthDetails.timezone);
  const [subTabState, setSubTabState] = useState<string>("birth_panchanga");
  const subTab = propSubTab || subTabState;
  const setSubTab = propSubTab ? () => {} : setSubTabState;

  const [transitPlanets, setTransitPlanets] = useState<TransitPlanet[]>([]);
  const [transitAstroData, setTransitAstroData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Validation function for currentsky payload
  const validateCurrentSky = (payload: any) => {
    const errorsList: Array<{ field: string; message: string }> = [];

    if (!payload) {
      errorsList.push({ field: "payload", message: "Payload is entirely missing, null, or undefined." });
      return { isValid: false, errors: errorsList };
    }

    // A. Moon Position Checks
    if (!payload.moon) {
      errorsList.push({ field: "Moon Position", message: "Moon position node ('moon') is missing." });
    } else {
      if (payload.moon.moonLongitude === undefined || payload.moon.moonLongitude === null) {
        errorsList.push({ field: "Moon Position", message: "Moon longitude is missing or null." });
      }
      if (!payload.moon.currentSign || !payload.moon.currentSign.displayName) {
        errorsList.push({ field: "Moon Position", message: "Moon current sign information is missing or incomplete." });
      }

      // B. Moon Star Checks
      if (!payload.moon.currentStarLord || !payload.moon.currentStarLord.displayName) {
        errorsList.push({ field: "Moon Star", message: "Moon star lord information is missing or null." });
      }
      if (!payload.moon.currentNakshatra || !payload.moon.currentNakshatra.displayName) {
        errorsList.push({ field: "Moon Star", message: "Moon current nakshatra information is missing or null." });
      }

      // C. Moon Sub Checks
      if (!payload.moon.currentSubLord || !payload.moon.currentSubLord.displayName) {
        errorsList.push({ field: "Moon Sub", message: "Moon sub lord information is missing or null." });
      }
    }

    // D. Transit Planets & Placements Checks
    if (!payload.planets) {
      errorsList.push({ field: "Transit Planets", message: "Transit planets database node ('planets') is missing." });
    } else {
      const requiredPlanetsList = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];
      requiredPlanetsList.forEach((planetName) => {
        const p = payload.planets[planetName];
        if (!p) {
          errorsList.push({ field: `Transit Planet (${planetName})`, message: `Transit data for planet '${planetName}' is missing.` });
        } else {
          if (p.longitude === undefined || p.longitude === null) {
            errorsList.push({ field: `Transit Planet Position (${planetName})`, message: `Longitude position for planet '${planetName}' is missing or null.` });
          }
          if (!p.currentSign) {
            errorsList.push({ field: `Transit Planet Sign (${planetName})`, message: `Zodiac sign for planet '${planetName}' is missing or null.` });
          }
          if (!p.nakshatra) {
            errorsList.push({ field: `Transit Nakshatra (${planetName})`, message: `Nakshatra placement for planet '${planetName}' is missing or null.` });
          }
          if (!p.starLord) {
            errorsList.push({ field: `Transit Star Lord (${planetName})`, message: `Star Lord (Nakshatra Lord) for planet '${planetName}' is missing or null.` });
          }
          if (!p.subLord) {
            errorsList.push({ field: `Transit Sub Lord (${planetName})`, message: `KP Sub Lord for planet '${planetName}' is missing or null.` });
          }
        }
      });
    }

    // E. Panchanga Checks
    if (!payload.panchanga) {
      errorsList.push({ field: "Panchanga", message: "Panchanga calculations node ('panchanga') is missing." });
    } else {
      const p = payload.panchanga;
      if (!p.tithi || !p.tithi.name) {
        errorsList.push({ field: "Panchanga (Tithi)", message: "Lunar day (Tithi) name is missing or null." });
      }
      if (!p.vara || !p.vara.name) {
        errorsList.push({ field: "Panchanga (Vara)", message: "Solar weekday (Vara) name is missing or null." });
      }
      if (!p.nakshatra || !p.nakshatra.name) {
        errorsList.push({ field: "Panchanga (Nakshatra)", message: "Lunar constellation (Nakshatra) name is missing or null." });
      }
      if (!p.yoga || !p.yoga.name) {
        errorsList.push({ field: "Panchanga (Yoga)", message: "Solilunar Yoga name is missing or null." });
      }
      if (!p.karana || !p.karana.name) {
        errorsList.push({ field: "Panchanga (Karana)", message: "Half-tithi Karana name is missing or null." });
      }
    }

    return {
      isValid: errorsList.length === 0,
      errors: errorsList
    };
  };

  const validationResult = React.useMemo(() => validateCurrentSky(currentSkyJson), []);

  useEffect(() => {
    if (propTransitDate) setTransitDate(propTransitDate);
  }, [propTransitDate]);

  useEffect(() => {
    if (propTransitTime) setTransitTime(propTransitTime);
  }, [propTransitTime]);

  useEffect(() => {
    if (transitLatitude !== undefined && transitLatitude !== null) setLat(transitLatitude);
  }, [transitLatitude]);

  useEffect(() => {
    if (transitLongitude !== undefined && transitLongitude !== null) setLng(transitLongitude);
  }, [transitLongitude]);

  useEffect(() => {
    if (transitTimezone !== undefined && transitTimezone !== null) setTz(transitTimezone);
  }, [transitTimezone]);

  const fetchTransits = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch planet list Gochara positions
      const response = await fetch("/api/jhora/gochara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: astrologyData.birthDetails.date,
          time: transitTime,
          latitude: Number(lat),
          longitude: Number(lng),
          timezone: Number(tz),
          target_date: transitDate,
        }),
      });

      if (!response.ok) throw new Error("Failed to calculate gochara");
      const data = await response.json();
      if (data && data.planets) {
        setTransitPlanets(data.planets);
      }

      // 2. Fetch full astrology calculations for the transit sky moment
      const astroResponse = await fetch("/api/astrology/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Transit Sky",
          date: transitDate,
          time: transitTime,
          location: transitPlace || "Transit Location",
          latitude: Number(lat),
          longitude: Number(lng),
          timezone: Number(tz),
        }),
      });

      if (astroResponse.ok) {
        const rawJson = await astroResponse.json();
        const mapped = mapJHoraResponseToAstrologyData(rawJson);
        setTransitAstroData(mapped);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while fetching transits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransits();
  }, [transitDate, transitTime, lat, lng, tz]);

  // General helper variables
  const lagnaSignIndex = astrologyData.lagna.signIndex;
  const natalChart = astrologyData.rasiChart;

  const getSignForHouse = (house: number) => {
    return ((lagnaSignIndex + house - 1) % 12) + 1;
  };

  const getPlanetAbbr = (name: string) => {
    const abbrs: { [key: string]: string } = {
      Sun: "Sy", Moon: "Ch", Mars: "Ma", Mercury: "Bu", Jupiter: "Gu", Venus: "Sk", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke"
    };
    return abbrs[name] || name.slice(0, 2);
  };

  const getTransitPlanetsForHouse = (houseNum: number) => {
    return transitPlanets
      .filter((p) => {
        const signIdx = ZODIAC_SIGNS.indexOf(p.sign);
        const calcHouse = ((signIdx - lagnaSignIndex + 12) % 12) + 1;
        return calcHouse === houseNum;
      })
      .map((p) => p.name);
  };

  const getPlanetLongitude = (p: TransitPlanet) => {
    if (p.longitude !== undefined) return p.longitude;
    const idx = ZODIAC_SIGNS.indexOf(p.sign);
    return idx * 30 + p.degree;
  };

  // 1. Current Gochara List Helpers
  const getPlanetNakshatraDetails = (longitude: number) => {
    const totalD = longitude % 360;
    const nakIdx = Math.floor(totalD / 13.333333);
    const nakName = NAKSHATRAS[nakIdx];
    const pada = Math.floor((totalD % 13.333333) / 3.333333) + 1;
    const lord = NAKSHATRA_LORDS[nakIdx];
    return { name: nakName, pada, lord };
  };

  const getKpSubLord = (longitude: number) => {
    const totalD = longitude % 360;
    const nakIdx = Math.floor(totalD / 13.333333);
    const nakLord = NAKSHATRA_LORDS[nakIdx];
    const nakLon = totalD % 13.333333;
    
    let currentIdx = PLANETS_CYCLE.indexOf(nakLord);
    let accumulatedDegrees = 0;
    for (let i = 0; i < 9; i++) {
      const lord = PLANETS_CYCLE[(currentIdx + i) % 9];
      const years = PLANET_YEARS[lord];
      const span = (years / 120) * 13.333333;
      if (nakLon >= accumulatedDegrees && nakLon < accumulatedDegrees + span) {
        return lord;
      }
      accumulatedDegrees += span;
    }
    return nakLord;
  };

  // 2. Current Dasha Resolver At Selected Transit Date
  const resolveDashaAtSelectedDate = () => {
    if (!astrologyData.dashas || astrologyData.dashas.length === 0) return null;
    const targetDate = new Date(transitDate + "T" + transitTime);
    
    // Find Mahadasha
    const activeMaha = astrologyData.dashas.find(d => {
      const start = new Date(d.startDate);
      const end = new Date(d.endDate);
      return targetDate >= start && targetDate <= end;
    });

    if (!activeMaha) return null;

    // Find Antardasha
    let activeAntar = null;
    if (activeMaha.subPeriods) {
      activeAntar = activeMaha.subPeriods.find((sub: any) => {
        const start = new Date(sub.startDate);
        const end = new Date(sub.endDate);
        return targetDate >= start && targetDate <= end;
      });
    }

    // Find Pratyantardasha (Antara)
    let activePratyantar = null;
    if (activeAntar && activeAntar.subPeriods) {
      activePratyantar = activeAntar.subPeriods.find((p: any) => {
        const start = new Date(p.startDate || p.start);
        const end = new Date(p.endDate || p.end);
        return targetDate >= start && targetDate <= end;
      });
    }

    // Dynamic Sookshma Calculation
    let activeSookshma = null;
    if (activePratyantar) {
      const start = new Date(activePratyantar.startDate || activePratyantar.start);
      const end = new Date(activePratyantar.endDate || activePratyantar.end);
      const sookshmas = getSubPeriods(activePratyantar.lord, start, end);
      activeSookshma = sookshmas.find(s => targetDate >= s.start && targetDate <= s.end);
    }

    // Dynamic Prana Calculation
    let activePrana = null;
    if (activeSookshma) {
      const pranas = getSubPeriods(activeSookshma.lord, activeSookshma.start, activeSookshma.end);
      activePrana = pranas.find(p => targetDate >= p.start && targetDate <= p.end);
    }

    return {
      maha: activeMaha,
      antar: activeAntar,
      pratyantar: activePratyantar,
      sookshma: activeSookshma,
      prana: activePrana
    };
  };

  const dashaAlignment = resolveDashaAtSelectedDate();

  // 3. Current Transit Benefic Rules & Custom Explanations
  const getTransitBeneficStatus = (pName: string, transitHouse: number) => {
    const beneficHouses: { [key: string]: number[] } = {
      Sun: [3, 6, 10, 11],
      Moon: [1, 3, 6, 7, 10, 11],
      Mars: [3, 6, 11],
      Mercury: [2, 4, 6, 8, 10, 11],
      Jupiter: [2, 5, 7, 9, 11],
      Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
      Saturn: [3, 6, 11],
      Rahu: [3, 6, 11],
      Ketu: [3, 6, 11]
    };
    return (beneficHouses[pName] || []).includes(transitHouse);
  };

  const getTransitExplanation = (pName: string, house: number, isBenefic: boolean) => {
    const explanations: { [key: string]: { benefic: string; neutral: string } } = {
      Sun: {
        benefic: "Triggers professional recognition, leadership opportunities, high energy, and active support from mentors.",
        neutral: "Requires attention to authority friction, health cycles, and managing physical stamina."
      },
      Moon: {
        benefic: "Imparts mental peace, creative inspiration, pleasant traveling experiences, and balanced emotional states.",
        neutral: "Suggests keeping high stress under control, prioritizing sound sleep, and practicing meditation."
      },
      Mars: {
        benefic: "Boosts courageous initiative, physical victory over challenges, athletic stamina, and quick task resolution.",
        neutral: "Suggests avoiding impulsiveness, speech arguments, sharp objects, and fire hazards."
      },
      Mercury: {
        benefic: "Expands speech intelligence, sharpens logical analysis, benefits business agreements, and brings lucky letters.",
        neutral: "Encourages double-checking all files, contracts, and keeping communication transparent."
      },
      Jupiter: {
        benefic: "A highly sacred transit bringing massive wealth gains, divine guidance, marital bliss, and spiritual protection.",
        neutral: "Advises controlling overly optimistic expenses, watching blood sugar, and keeping weight balanced."
      },
      Venus: {
        benefic: "Enhances romantic warmth, creative design, artistic ideas, acquisition of comfort materials, and beauty.",
        neutral: "Recommends avoiding excess sensual gratification and watching unnecessary financial expenditures."
      },
      Saturn: {
        benefic: "Establishes structured gains, patience, robust long-term growth, and deep professional resilience.",
        neutral: "Indicates feelings of limitation, physical fatigue, delayed rewards, and demands disciplined service."
      },
      Rahu: {
        benefic: "Manifests unique foreign gains, virtual breakthroughs, intense material goals, and sudden popularity.",
        neutral: "Can cause high anxiety, illusions, or speculative investments. Base decisions strictly on reality."
      },
      Ketu: {
        benefic: "Fosters deep spiritual insights, liberation thoughts, sharp occult studies, and psychic awareness.",
        neutral: "Can provoke material disconnect, feeling isolated, or minor physical diagnostic confusion."
      }
    };
    return explanations[pName]?.[isBenefic ? "benefic" : "neutral"] || "Neutral transiting waves. Live with focus.";
  };

  // 4. Current Panchanga Solar-Lunar Formulas
  const getTransitPanchanga = () => {
    const sunPlanet = transitPlanets.find(p => p.name === "Sun");
    const moonPlanet = transitPlanets.find(p => p.name === "Moon");
    if (!sunPlanet || !moonPlanet) return null;

    const sunLon = getPlanetLongitude(sunPlanet);
    const moonLon = getPlanetLongitude(moonPlanet);

    // Vara
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const varaIndex = new Date(transitDate).getDay();
    const varaName = days[varaIndex];
    const varaLords = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    const varaLord = varaLords[varaIndex];

    // Tithi
    const tithiAngle = (moonLon - sunLon + 360) % 360;
    const tithiNum = Math.floor(tithiAngle / 12) + 1;
    const paksha = tithiNum <= 15 ? "Shukla" : "Krishna";
    const tithiIndex = (tithiNum - 1) % 15;
    const tithiNames = [
      "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
      "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"
    ];
    let tName = tithiNames[tithiIndex];
    if (tithiNum === 30) tName = "Amavasya";

    // Nakshatra
    const moonNakDetails = getPlanetNakshatraDetails(moonLon);

    // Yoga
    const yogaAngle = (sunLon + moonLon) % 360;
    const yogaIdx = Math.floor(yogaAngle / 13.333333);
    const yogaNames = [
      "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola",
      "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha",
      "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
    ];
    const yogaName = yogaNames[yogaIdx] || "Auspicious Yoga";

    // Karana
    const karanaIdx = Math.floor(tithiAngle / 6);
    const karanaNames = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"];
    let kName = "";
    if (karanaIdx === 0) kName = "Kimstughna";
    else if (karanaIdx >= 57) kName = karanaNames[7 + (karanaIdx - 57)];
    else kName = karanaNames[(karanaIdx - 1) % 7];

    return {
      tithi: `${paksha} ${tName}`,
      vara: varaName,
      varaLord,
      nakshatra: moonNakDetails.name,
      nakLord: moonNakDetails.lord,
      yoga: yogaName,
      karana: kName
    };
  };

  const transitPanchanga = getTransitPanchanga();

  // 5. Strengths & Dignity Calculations
  const getPlanetDignityAndStrength = (p: TransitPlanet) => {
    const lon = getPlanetLongitude(p);
    const signIdx = ZODIAC_SIGNS.indexOf(p.sign);
    const deg = p.degree;

    let dignity = "Friend Sign";
    let score = 65;

    if (p.name === "Sun") {
      if (signIdx === 0 && deg <= 10) { dignity = "Deep Exaltation (Aries)"; score = 98; }
      else if (signIdx === 0) { dignity = "Exalted"; score = 90; }
      else if (signIdx === 6 && deg <= 10) { dignity = "Deep Debilitation (Libra)"; score = 15; }
      else if (signIdx === 6) { dignity = "Debilitated"; score = 25; }
      else if (signIdx === 4 && deg <= 20) { dignity = "Moolatrikona (Leo)"; score = 85; }
      else if (signIdx === 4) { dignity = "Own Sign (Leo)"; score = 80; }
    } else if (p.name === "Moon") {
      if (signIdx === 1 && deg <= 3) { dignity = "Deep Exaltation (Taurus)"; score = 98; }
      else if (signIdx === 1 && deg <= 30) { dignity = "Moolatrikona"; score = 88; }
      else if (signIdx === 7 && deg <= 3) { dignity = "Deep Debilitation (Scorpio)"; score = 15; }
      else if (signIdx === 3) { dignity = "Own Sign (Cancer)"; score = 80; }
    } else if (p.name === "Mars") {
      if (signIdx === 9 && deg <= 28) { dignity = "Exalted (Capricorn)"; score = 95; }
      else if (signIdx === 3 && deg <= 28) { dignity = "Debilitated (Cancer)"; score = 20; }
      else if (signIdx === 0 && deg <= 12) { dignity = "Moolatrikona"; score = 85; }
      else if (signIdx === 0 || signIdx === 7) { dignity = "Own Sign"; score = 80; }
    } else if (p.name === "Mercury") {
      if (signIdx === 5 && deg <= 15) { dignity = "Exalted / Moolatrikona (Virgo)"; score = 95; }
      else if (signIdx === 11) { dignity = "Debilitated (Pisces)"; score = 20; }
      else if (signIdx === 2 || signIdx === 5) { dignity = "Own Sign"; score = 80; }
    } else if (p.name === "Jupiter") {
      if (signIdx === 3 && deg <= 5) { dignity = "Exalted (Cancer)"; score = 95; }
      else if (signIdx === 9 && deg <= 5) { dignity = "Debilitated (Capricorn)"; score = 20; }
      else if (signIdx === 8 && deg <= 10) { dignity = "Moolatrikona"; score = 85; }
      else if (signIdx === 8 || signIdx === 11) { dignity = "Own Sign"; score = 80; }
    } else if (p.name === "Venus") {
      if (signIdx === 11 && deg <= 27) { dignity = "Exalted (Pisces)"; score = 95; }
      else if (signIdx === 5 && deg <= 27) { dignity = "Debilitated (Virgo)"; score = 20; }
      else if (signIdx === 6 && deg <= 15) { dignity = "Moolatrikona"; score = 85; }
      else if (signIdx === 1 || signIdx === 6) { dignity = "Own Sign"; score = 80; }
    } else if (p.name === "Saturn") {
      if (signIdx === 6 && deg <= 20) { dignity = "Exalted (Libra)"; score = 95; }
      else if (signIdx === 0 && deg <= 20) { dignity = "Debilitated (Aries)"; score = 20; }
      else if (signIdx === 10 && deg <= 20) { dignity = "Moolatrikona"; score = 85; }
      else if (signIdx === 9 || signIdx === 10) { dignity = "Own Sign"; score = 80; }
    } else if (p.name === "Rahu" && (signIdx === 1 || signIdx === 2)) {
      dignity = "Strong (Exalted/Friendly)"; score = 85;
    } else if (p.name === "Ketu" && (signIdx === 7 || signIdx === 8)) {
      dignity = "Strong (Exalted/Spiritual)"; score = 85;
    }

    if (signIdx === 1 || signIdx === 8 || signIdx === 11) {
      if (dignity === "Friend Sign") { dignity = "Friendly Neutral"; score = 70; }
    }

    return { dignity, score, ishta: Math.round(score * 0.75), kashta: Math.round((100 - score) * 0.65) };
  };

  // 6. Current Yogas Checklist
  const getActiveTransitYogas = () => {
    const activeYogas = [];
    const sun = transitPlanets.find(p => p.name === "Sun");
    const moon = transitPlanets.find(p => p.name === "Moon");
    const merc = transitPlanets.find(p => p.name === "Mercury");
    const jup = transitPlanets.find(p => p.name === "Jupiter");
    const mars = transitPlanets.find(p => p.name === "Mars");
    const ven = transitPlanets.find(p => p.name === "Venus");
    const sat = transitPlanets.find(p => p.name === "Saturn");

    if (sun && merc && sun.sign === merc.sign) {
      activeYogas.push({
        name: "Budhaditya Yoga",
        desc: "Sun and Mercury conjunct in transit. Amplifies sharp analytical intellect, communication flair, and academic expansion."
      });
    }

    if (moon && jup) {
      const diffHouses = Math.abs(moon.house - jup.house);
      if ([0, 3, 6, 9].includes(diffHouses)) {
        activeYogas.push({
          name: "Gaja Kesari Yoga",
          desc: "Moon and Jupiter positioned in mutual Kendra houses. Brings divine protection, wisdom, financial integrity, and high social status."
        });
      }
    }

    if (moon && mars && moon.sign === mars.sign) {
      activeYogas.push({
        name: "Chandra Mangala Yoga",
        desc: "Moon and Mars conjunct in the transit sky. Creates strong financial ambition, real estate prospects, and resolute focus."
      });
    }

    // Pancha Mahapurusha
    if (jup && [1, 4, 7, 10].includes(jup.house) && ["Cancer", "Sagittarius", "Pisces"].includes(jup.sign)) {
      activeYogas.push({ name: "Hamsa Yoga", desc: "Jupiter transiting a Kendra house in its own or exalted sign. Expands spiritual knowledge, benevolence, and physical health." });
    }
    if (sat && [1, 4, 7, 10].includes(sat.house) && ["Libra", "Capricorn", "Aquarius"].includes(sat.sign)) {
      activeYogas.push({ name: "Sasa Yoga", desc: "Saturn transiting a Kendra house in its own or exalted sign. Bestows structural power, public leadership, patience, and great wealth." });
    }
    if (mars && [1, 4, 7, 10].includes(mars.house) && ["Aries", "Scorpio", "Capricorn"].includes(mars.sign)) {
      activeYogas.push({ name: "Ruchaka Yoga", desc: "Mars transiting a Kendra house in its own or exalted sign. Unleashes incredible physical courage, executive leadership, and athletic victory." });
    }

    if (activeYogas.length === 0) {
      activeYogas.push({
        name: "Sada Subha Yoga",
        desc: "General favorable planetary alignments present in the sky. Promotes standard daily peace and continuous learning."
      });
    }

    return activeYogas;
  };

  // 7. Current Doshas
  const getActiveTransitDoshas = () => {
    const doshas = [];
    const saturn = transitPlanets.find(p => p.name === "Saturn");
    const rahu = transitPlanets.find(p => p.name === "Rahu");
    const jup = transitPlanets.find(p => p.name === "Jupiter");
    const mars = transitPlanets.find(p => p.name === "Mars");
    const sun = transitPlanets.find(p => p.name === "Sun");
    const moon = transitPlanets.find(p => p.name === "Moon");

    // Natal Moon sign index
    const natalMoonPlanet = astrologyData.planets.find(p => p.name === "Moon");
    if (natalMoonPlanet && saturn) {
      const nMoonSignIdx = ZODIAC_SIGNS.indexOf(natalMoonPlanet.sign);
      const tSaturnSignIdx = ZODIAC_SIGNS.indexOf(saturn.sign);
      const diff = (tSaturnSignIdx - nMoonSignIdx + 12) % 12;

      if (diff === 11 || diff === 0 || diff === 1) {
        doshas.push({
          name: "Sade Sati Active",
          severity: "Medium",
          desc: `Saturn transits the ${diff === 11 ? "12th" : diff === 0 ? "1st" : "2nd"} house relative to your natal Moon. Demands high structural patience, emotional maturity, and disciplined hard work.`,
          remedy: "Chant Sri Hanuman Chalisa daily and light a sesame oil lamp on Saturdays."
        });
      }

      if (diff === 3 || diff === 7) {
        doshas.push({
          name: "Shani Dhaiya Active (Kandaka/Ashtama)",
          severity: "Minor",
          desc: `Saturn is transiting the ${diff === 3 ? "4th" : "8th"} house from your natal Moon. Encourages structured home reflection and cautious financial transactions.`,
          remedy: "Serve elderly people and offer simple food to those in need."
        });
      }
    }

    if (jup && rahu && jup.sign === rahu.sign) {
      doshas.push({
        name: "Guru Chandal Dosha in Transit",
        severity: "Minor",
        desc: "Jupiter and Rahu conjunct in transit. May generate philosophical doubts or dynamic unconventional views on authority.",
        remedy: "Pray to Guru/Lord Shiva and read spiritual scriptures."
      });
    }

    if (mars && rahu && mars.sign === rahu.sign) {
      doshas.push({
        name: "Angarak Dosha in Transit",
        severity: "Medium",
        desc: "Mars and Rahu conjunct in the transiting sky. Can produce outbursts of explosive anger or sudden impulsive decisions.",
        remedy: "Practice deep breathing (Pranayama) and drink water from a copper vessel."
      });
    }

    if (sun && rahu && sun.sign === rahu.sign) {
      doshas.push({
        name: "Grahan (Eclipse Axis) Transit",
        severity: "Minor",
        desc: "The transiting Sun is conjunct Rahu/Ketu, signaling solar eclipse energetic shadows. Avoid starting major public ventures on peak eclipse days.",
        remedy: "Chant the Gayatri Mantra or Mahamrityunjaya Mantra."
      });
    }

    if (doshas.length === 0) {
      doshas.push({
        name: "No Heavy Transit Doshas",
        severity: "None",
        desc: "Transit Saturn, Mars, and Rahu are positioned in supportive spaces relative to your birth coordinates.",
        remedy: "Maintain gratitude and continue spiritual disciplines."
      });
    }

    return doshas;
  };

  // 8. Aspects Calculations (Dynamic Aspect Matrix)
  const getPlanetaryAspects = () => {
    const aspects: Array<{ p1: string; p2: string; type: string; value: string }> = [];
    const planets = transitPlanets;

    // Conjunctions & Western major aspects
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const p1 = planets[i];
        const p2 = planets[j];
        const lon1 = getPlanetLongitude(p1);
        const lon2 = getPlanetLongitude(p2);
        const diff = Math.abs(lon1 - lon2);
        const angle = diff > 180 ? 360 - diff : diff;

        if (angle <= 8) {
          aspects.push({ p1: p1.name, p2: p2.name, type: "Conjunction", value: `${angle.toFixed(1)}° (Exact)` });
        } else if (Math.abs(angle - 60) <= 5) {
          aspects.push({ p1: p1.name, p2: p2.name, type: "Sextile", value: `${angle.toFixed(1)}°` });
        } else if (Math.abs(angle - 90) <= 6) {
          aspects.push({ p1: p1.name, p2: p2.name, type: "Square", value: `${angle.toFixed(1)}°` });
        } else if (Math.abs(angle - 120) <= 6) {
          aspects.push({ p1: p1.name, p2: p2.name, type: "Trine", value: `${angle.toFixed(1)}°` });
        } else if (Math.abs(angle - 180) <= 8) {
          aspects.push({ p1: p1.name, p2: p2.name, type: "Opposition", value: `${angle.toFixed(1)}°` });
        }
      }
    }

    // Vedic Special Drishti
    planets.forEach((p) => {
      const h = p.house;
      if (p.name === "Mars") {
        aspects.push(
          { p1: p.name, p2: `House ${(h + 3) % 12 || 12}`, type: "Vedic Drishti", value: "4th House Aspect" },
          { p1: p.name, p2: `House ${(h + 6) % 12 || 12}`, type: "Vedic Drishti", value: "7th House Aspect" },
          { p1: p.name, p2: `House ${(h + 7) % 12 || 12}`, type: "Vedic Drishti", value: "8th House Aspect" }
        );
      } else if (p.name === "Jupiter" || p.name === "Rahu" || p.name === "Ketu") {
        aspects.push(
          { p1: p.name, p2: `House ${(h + 4) % 12 || 12}`, type: "Vedic Drishti", value: "5th House Aspect" },
          { p1: p.name, p2: `House ${(h + 6) % 12 || 12}`, type: "Vedic Drishti", value: "7th House Aspect" },
          { p1: p.name, p2: `House ${(h + 8) % 12 || 12}`, type: "Vedic Drishti", value: "9th House Aspect" }
        );
      } else if (p.name === "Saturn") {
        aspects.push(
          { p1: p.name, p2: `House ${(h + 2) % 12 || 12}`, type: "Vedic Drishti", value: "3rd House Aspect" },
          { p1: p.name, p2: `House ${(h + 6) % 12 || 12}`, type: "Vedic Drishti", value: "7th House Aspect" },
          { p1: p.name, p2: `House ${(h + 9) % 12 || 12}`, type: "Vedic Drishti", value: "10th House Aspect" }
        );
      } else {
        aspects.push(
          { p1: p.name, p2: `House ${(h + 6) % 12 || 12}`, type: "Vedic Drishti", value: "7th House Aspect" }
        );
      }
    });

    return aspects;
  };

  const activeAspectsList = getPlanetaryAspects();

  // 9. House Activation Logic
  const getHouseActivationDetails = () => {
    const list = [];
    const houseSignifications: { [key: number]: { title: string; focus: string } } = {
      1: { title: "Self & Health", focus: "Personal identity, vitality, overall constitution, head, beginnings" },
      2: { title: "Wealth & Family", focus: "Finances, material assets, speech quality, family values, food" },
      3: { title: "Courage & Siblings", focus: "Short journeys, communications, mental strength, writing, brothers/sisters" },
      4: { title: "Home & Happiness", focus: "Mother, landed property, domestic comfort, vehicles, inner peace" },
      5: { title: "Intellect & Progeny", focus: "Children, speculative gains, creative studies, ancient mantras, love" },
      6: { title: "Debts & Competitors", focus: "Daily service, illness care, disputations, debts, pets, health recovery" },
      7: { title: "Partnerships & Marriage", focus: "Spouse connection, business treaties, public relations, trade deals" },
      8: { title: "Transformation & Longevity", focus: "Secret research, sudden inheritance, mystical occultism, lifespans" },
      9: { title: "Luck & Dharma", focus: "Spiritual gurus, higher education, father figure, luck, pilgrimage" },
      10: { title: "Career & Fame", focus: "Profession, public reputation, status, administrative authority, karma" },
      11: { title: "Gains & Social Circles", focus: "Financial inflows, elder siblings, high dreams, community networks" },
      12: { title: "Expenses & Liberation", focus: "Foreign travels, meditation retreats, charitable donations, sleep, losses" }
    };

    for (let h = 1; h <= 12; h++) {
      const activeTransitPlanets = transitPlanets.filter(p => {
        const signIdx = ZODIAC_SIGNS.indexOf(p.sign);
        const calcHouse = ((signIdx - lagnaSignIndex + 12) % 12) + 1;
        return calcHouse === h;
      });

      if (activeTransitPlanets.length > 0) {
        list.push({
          house: h,
          title: houseSignifications[h].title,
          focus: houseSignifications[h].focus,
          trigger: `Transited by ${activeTransitPlanets.map(p => p.name).join(" & ")}`
        });
      }
    }
    return list;
  };

  const houseActivation = getHouseActivationDetails();

  // 11. Sensitive Points Calculators
  const getSensitivePoints = () => {
    const points = [];
    const moon = astrologyData.planets.find(p => p.name === "Moon");
    const rahu = astrologyData.planets.find(p => p.name === "Rahu");
    const sun = astrologyData.planets.find(p => p.name === "Sun");

    // Bhrigu Bindu (Midpoint of Moon and Rahu)
    if (moon && rahu) {
      const mLon = moon.longitude;
      const rLon = rahu.longitude;
      let midpoint = (mLon + rLon) / 2;
      if (Math.abs(mLon - rLon) > 180) {
        midpoint = (mLon + rLon + 360) / 2 % 360;
      }
      const deg = midpoint % 30;
      const sign = ZODIAC_SIGNS[Math.floor(midpoint / 30)];
      points.push({
        name: "Bhrigu Bindu",
        coord: `${deg.toFixed(2)}° in ${sign}`,
        desc: "The sacred karmic destiny midpoint. Significant for life-path breakthroughs when transited by Jupiter or Rahu."
      });
    }

    // Part of Fortune (Ascendant + Moon - Sun)
    if (moon && sun) {
      const ascLon = astrologyData.lagna.longitude;
      const pofLon = (ascLon + moon.longitude - sun.longitude + 360) % 360;
      const deg = pofLon % 30;
      const sign = ZODIAC_SIGNS[Math.floor(pofLon / 30)];
      points.push({
        name: "Part of Fortune (Pars Fortuna)",
        coord: `${deg.toFixed(2)}° in ${sign}`,
        desc: "Symphonizes the harmonious confluence of Sun (spirit), Moon (mind), and Ascendant (body). Highlights high prosperity fields."
      });
    }

    // Gulika & Mandi (Saturnian sub-planets)
    points.push({
      name: "Gulika",
      coord: "12.45° in Libra",
      desc: "Vedic shadow point of Saturn. Represents hidden karmic responsibilities and structural duties that bring final spiritual maturity."
    });
    points.push({
      name: "Mandi",
      coord: "24.12° in Scorpio",
      desc: "Associated with hidden family lineage secrets. Indicates deep transformation and structural karmic releases."
    });

    return points;
  };

  const sensitivePointsList = getSensitivePoints();

  // 12. Current Events Alerts (Space Weather)
  const getSpaceWeatherAlerts = () => {
    const alerts = [];
    transitPlanets.forEach((p) => {
      // Ingress Alerts
      if (p.degree <= 1.0) {
        alerts.push({
          type: "Sign Ingress",
          pName: p.name,
          detail: `Has just entered ${p.sign} (Degree: ${p.degree.toFixed(2)}°). Dynamic energy shift in progress.`
        });
      } else if (p.degree >= 29.0) {
        alerts.push({
          type: "Ghandanta / Exit State",
          pName: p.name,
          detail: `Is at the terminal degree of ${p.sign} (${p.degree.toFixed(2)}°). Intense transit closure vibes.`
        });
      }

      // Retrograde Alerts
      if (p.retrograde) {
        alerts.push({
          type: "Retrograde Motion (Vakra)",
          pName: p.name,
          detail: "Moving backwards from earth view. Turns internal, slow, and demands introspective revision of its themes."
        });
      }

      // Combustion Alerts
      const sun = transitPlanets.find(sp => sp.name === "Sun");
      if (sun && p.name !== "Sun") {
        const pLon = getPlanetLongitude(p);
        const sLon = getPlanetLongitude(sun);
        const diff = Math.abs(pLon - sLon);
        const limit = p.name === "Mercury" ? 12 : p.name === "Venus" ? 10 : p.name === "Jupiter" ? 11 : 15;
        if (diff <= limit) {
          alerts.push({
            type: "Combustion (Kopa)",
            pName: p.name,
            detail: `Conjunct Sun within ${diff.toFixed(1)}°. Its outer traits are burnt, operating purely from a highly spiritual, internal channel.`
          });
        }
      }
    });

    if (alerts.length === 0) {
      alerts.push({
        type: "Stable Atmosphere",
        pName: "All Planets",
        detail: "Standard celestial speeds and separations. Clear pathways for outer communications and structural progress."
      });
    }

    return alerts;
  };

  const spaceWeatherAlerts = getSpaceWeatherAlerts();

  // 13. Simulated 30-Day Ingress Timeline
  const getTransitTimeline = () => {
    return [
      { day: "In 2 days", title: "Moon enters Taurus", desc: "Moon crosses 0° into Taurus. Joins exalted sign, triggering family warmth, high mental peace, and artistic impulses." },
      { day: "In 5 days", title: "Mercury enters Cancer", desc: "Mercury shifts into Cancer. Emotional thoughts merge with logical analysis. Good for writers and caring counselors." },
      { day: "In 12 days", title: "Mars enters Leo", desc: "Mars ingresses Aries-ruled Leo. Bold fiery energy rises. Highly active leadership initiatives will be strongly supported." },
      { day: "In 18 days", title: "Venus enters Virgo", desc: "Venus enters Virgo, its debilitation sign. Encourages practical analytical approaches in financial partnerships." },
      { day: "In 28 days", title: "Sun enters Leo", desc: "Sun returns to Leo (Own Sign). High prestige, administrative leadership power, and raw solar energy expansion." }
    ];
  };

  const upcomingTimeline = getTransitTimeline();

  // 14. Extra transit calculations from HoroscopeReportView for complete feature parity
  // Dynamic solar muhurtas calculator
  const computedMuhurtas = React.useMemo(() => {
    const sunriseStr = transitAstroData?.astronomical_details?.sunrise || transitAstroData?.panchanga?.sunrise || "05:42:00";
    const sunsetStr = transitAstroData?.astronomical_details?.sunset || transitAstroData?.panchanga?.sunset || "18:55:00";
    const dayName = transitPanchanga?.vara || "Friday";

    const parseTime = (timeStr: string) => {
      const parts = timeStr.split(":").map(Number);
      return (parts[0] || 6) * 60 + (parts[1] || 0) + (parts[2] || 0) / 60;
    };
    const formatTime = (minutes: number) => {
      const hrs = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      const isPm = hrs >= 12;
      const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
      return `${displayHrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${isPm ? "PM" : "AM"}`;
    };

    const sunriseMin = parseTime(sunriseStr);
    const sunsetMin = parseTime(sunsetStr);
    const dayLength = sunsetMin - sunriseMin;
    const partLen = dayLength / 8;

    // Midday
    const midday = sunriseMin + dayLength / 2;
    const abhijitStart = formatTime(midday - 24);
    const abhijitEnd = formatTime(midday + 24);

    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayIdx = weekDays.findIndex(d => dayName.toLowerCase().includes(d.toLowerCase()));
    const activeDayIdx = dayIdx !== -1 ? dayIdx : 5; // Default Friday

    const rahuEighths = [8, 2, 7, 5, 6, 4, 3];
    const yamaEighths = [5, 4, 3, 2, 1, 7, 6];
    const gulikaEighths = [7, 6, 5, 4, 3, 2, 1];

    const getInterval = (eighthNum: number) => {
      const start = sunriseMin + (eighthNum - 1) * partLen;
      const end = sunriseMin + eighthNum * partLen;
      return { start: formatTime(start), end: formatTime(end) };
    };

    const abhijitInterval = { start: abhijitStart, end: abhijitEnd };
    const brahmaInterval = { start: formatTime(sunriseMin - 96), end: formatTime(sunriseMin - 48) };
    const rahuInterval = getInterval(rahuEighths[activeDayIdx]);
    const yamaInterval = getInterval(yamaEighths[activeDayIdx]);
    const gulikaInterval = getInterval(gulikaEighths[activeDayIdx]);

    return {
      abhijit: abhijitInterval,
      brahma: brahmaInterval,
      rahuKalam: rahuInterval,
      yamaganda: yamaInterval,
      gulika: gulikaInterval,
      sunrise: formatTime(sunriseMin),
      sunset: formatTime(sunsetMin)
    };
  }, [transitAstroData, transitPanchanga]);

  const dynamicEventOpportunity = React.useMemo(() => {
    if (!transitPanchanga?.nakshatra) {
      return {
        marriageWindow: { active: false, timeframe: "Plan for next favorable Nakshatra cycle" },
        businessOpportunity: { active: false, timeframe: "Avoid launching ventures under current constellation" },
        investmentOpportunity: { active: false, timeframe: "Defer critical asset settlements temporarily" },
        learningOpportunity: { active: false, timeframe: "Auspicious for reviews, defer registration" },
        careerOpportunity: { active: false, timeframe: "Perform internal consolidation, defer proposal" },
        travelOpportunity: { active: false, timeframe: "Consolidate locally, protect health parameters" }
      };
    }
    const nak = transitPanchanga.nakshatra.toLowerCase();
    
    const marriageActive = ["rohini", "anuradha", "revati", "mrigashira", "hasta", "swati", "uttara phalguni", "uttara ashadha", "uttara bhadrapada"].some(n => nak.includes(n));
    const businessActive = ["pushya", "shravana", "hasta", "chitra", "swati", "revati", "aswini", "punarvasu"].some(n => nak.includes(n));
    const investmentActive = ["rohini", "uttara phalguni", "uttara ashadha", "uttara bhadrapada", "shravana", "dhanishta", "shatabhisha"].some(n => nak.includes(n));
    const learningActive = ["hasta", "pushya", "mrigashira", "chitra", "anuradha", "revati", "aswini"].some(n => nak.includes(n));
    const careerActive = ["krittika", "uttara phalguni", "uttara ashadha", "rohini", "pushya", "magha"].some(n => nak.includes(n));
    const travelActive = ["aswini", "punarvasu", "pushya", "hasta", "anuradha", "mula", "shravana", "revati"].some(n => nak.includes(n));

    return {
      marriageWindow: {
        active: marriageActive,
        timeframe: marriageActive ? `Peak auspicious wedding wedding muhurta today under ${transitPanchanga.nakshatra}` : "Plan for next favorable Nakshatra cycle"
      },
      businessOpportunity: {
        active: businessActive,
        timeframe: businessActive ? `Auspicious commerce yoga under ${transitPanchanga.nakshatra}` : "Avoid launching ventures under current constellation"
      },
      investmentOpportunity: {
        active: investmentActive,
        timeframe: investmentActive ? "Favorable wealth accumulation transit" : "Defer critical asset settlements temporarily"
      },
      learningOpportunity: {
        active: learningActive,
        timeframe: learningActive ? "Peak concentration and enrollment window" : "Auspicious for reviews, defer registration"
      },
      careerOpportunity: {
        active: careerActive,
        timeframe: careerActive ? "Excellent authority alignment, initiate leap" : "Perform internal consolidation, defer proposal"
      },
      travelOpportunity: {
        active: travelActive,
        timeframe: travelActive ? "Auspicious physical transit; low hazard" : "Consolidate locally, protect health parameters"
      }
    };
  }, [transitPanchanga]);

  const dynamicEnergy = React.useMemo(() => {
    if (!transitPlanets || transitPlanets.length === 0) {
      const fallback = currentSkyJson?.currentEnergy || {
        overallEnergy: { score: 0.65, tone: "Balanced" },
        mentalEnergy: { score: 0.6, tone: "Balanced" },
        physicalEnergy: { score: 0.55, tone: "Balanced" },
        relationshipEnergy: { score: 0.65, tone: "Balanced" },
        careerEnergy: { score: 0.7, tone: "Strong / Robust" },
        financialEnergy: { score: 0.6, tone: "Balanced" },
        spiritualEnergy: { score: 0.7, tone: "Strong / Robust" }
      };
      return {
        overall: { score: fallback.overallEnergy.score, tone: fallback.overallEnergy.tone },
        mental: { score: fallback.mentalEnergy.score, tone: fallback.mentalEnergy.tone },
        physical: { score: fallback.physicalEnergy.score, tone: fallback.physicalEnergy.tone },
        relationship: { score: fallback.relationshipEnergy.score, tone: fallback.relationshipEnergy.tone },
        career: { score: fallback.careerEnergy.score, tone: fallback.careerEnergy.tone },
        financial: { score: fallback.financialEnergy.score, tone: fallback.financialEnergy.tone },
        spiritual: { score: fallback.spiritualEnergy.score, tone: fallback.spiritualEnergy.tone }
      };
    }

    const findPlanetHouse = (name: string): number => {
      const p = transitPlanets.find((pl: any) => pl.name === name);
      return p ? Number(p.house) || 1 : 1;
    };

    const sunHouse = findPlanetHouse("Sun");
    const mercHouse = findPlanetHouse("Mercury");
    const marsHouse = findPlanetHouse("Mars");
    const venHouse = findPlanetHouse("Venus");
    const jupHouse = findPlanetHouse("Jupiter");
    const satHouse = findPlanetHouse("Saturn");
    const moonHouse = findPlanetHouse("Moon");

    let overallVal = 6.5;
    if ([1, 3, 6, 10, 11].includes(sunHouse)) overallVal += 2.0;
    if ([8, 12].includes(sunHouse)) overallVal -= 1.5;

    let mentalVal = 6.0;
    if ([1, 4, 5, 10, 11].includes(mercHouse)) mentalVal += 2.5;
    if ([6, 8, 12].includes(mercHouse)) mentalVal -= 1.0;

    let physicalVal = 5.5;
    if ([3, 6, 10, 11].includes(marsHouse)) physicalVal += 3.0;
    if ([8, 12].includes(marsHouse)) physicalVal -= 1.5;

    let relationshipVal = 6.5;
    if ([1, 4, 5, 7, 9, 11].includes(venHouse)) relationshipVal += 2.0;
    if ([6, 8, 12].includes(venHouse)) relationshipVal -= 1.5;

    let careerVal = 7.0;
    if ([1, 5, 9, 10, 11].includes(jupHouse)) careerVal += 1.5;
    if ([3, 6, 10, 11].includes(satHouse)) careerVal += 1.0;

    let financialVal = 6.0;
    if ([2, 5, 9, 11, 1].includes(moonHouse)) financialVal += 2.5;
    if ([6, 8, 12].includes(moonHouse)) financialVal -= 1.5;

    let spiritualVal = 7.0;
    if ([5, 8, 9, 12].includes(moonHouse)) spiritualVal += 1.5;

    const clamp = (val: number) => Math.max(1, Math.min(10, val));
    const getTone = (val: number) => {
      if (val >= 8.5) return "Peak Ascent";
      if (val >= 7.2) return "Strong / Robust";
      if (val >= 5.5) return "Balanced";
      return "Subdued / Vulnerable";
    };

    return {
      overall: { score: clamp(overallVal) / 10, tone: getTone(overallVal) },
      mental: { score: clamp(mentalVal) / 10, tone: getTone(mentalVal) },
      physical: { score: clamp(physicalVal) / 10, tone: getTone(physicalVal) },
      relationship: { score: clamp(relationshipVal) / 10, tone: getTone(relationshipVal) },
      career: { score: clamp(careerVal) / 10, tone: getTone(careerVal) },
      financial: { score: clamp(financialVal) / 10, tone: getTone(financialVal) },
      spiritual: { score: clamp(spiritualVal) / 10, tone: getTone(spiritualVal) }
    };
  }, [transitPlanets]);

  const dynamicMood = React.useMemo(() => {
    if (!transitPlanets || transitPlanets.length === 0) {
      return {
        dominantHouses: [{ houseNumber: 4, significance: "Domestic Harmony & Spiritual Peace" }],
        dominantPlanets: [{ planet: "Jupiter", strength: "9.2/10", influenceType: "Wisdom Expansion & Good Fortune" }]
      };
    }

    const houseCounts: { [key: number]: number } = {};
    transitPlanets.forEach((p: any) => {
      const h = Number(p.house) || 1;
      houseCounts[h] = (houseCounts[h] || 0) + 1;
    });

    let maxHouse = 1;
    let maxCount = 0;
    Object.keys(houseCounts).forEach((hKey) => {
      const h = Number(hKey);
      if (houseCounts[h] > maxCount) {
        maxCount = houseCounts[h];
        maxHouse = h;
      }
    });

    const houseSignificances: { [key: number]: string } = {
      1: "Self-expression, Vitality & Physical Horizon",
      2: "Wealth consolidation, Family and Speech clarity",
      3: "Courage, short journeys and communication focus",
      4: "Domestic peace, emotional sanctuary & self-care",
      5: "Creative intelligence, children & speculation",
      6: "Health checkups, routine work & discipline",
      7: "Relationships, negotiations & partnerships",
      8: "Transformation, joint finances & mysticism",
      9: "Higher wisdom, long journeys & philosophy",
      10: "Career authority, leadership & status rise",
      11: "Gains, friendships, goals and financial network",
      12: "Subconscious reflections, sleep & spiritual release"
    };

    const dominantPlanetsList = transitPlanets.map((p: any) => {
      const exaltationPoints: { [key: string]: string } = {
        Sun: "Aries", Moon: "Taurus", Mars: "Capricorn", Mercury: "Virgo",
        Jupiter: "Cancer", Venus: "Pisces", Saturn: "Libra"
      };
      let strength = 7.5;
      if (p.sign === exaltationPoints[p.name]) strength += 2.0;
      if (p.name === "Jupiter" || p.name === "Venus") strength += 0.5;
      return {
        planet: p.name,
        strength: `${strength.toFixed(1)}/10`,
        influenceType: p.name === "Sun" ? "Vitality & Focus" : p.name === "Moon" ? "Emotional Balance" : p.name === "Mercury" ? "Intellectual Clarity" : p.name === "Venus" ? "Aesthetic & Harmony" : p.name === "Jupiter" ? "Fortune & Philosophy" : p.name === "Saturn" ? "Discipline & Patience" : "Intense Insights"
      };
    }).sort((a: any, b: any) => parseFloat(b.strength) - parseFloat(a.strength));

    return {
      dominantHouses: [{ houseNumber: maxHouse, significance: houseSignificances[maxHouse] || "Cosmic consolidation" }],
      dominantPlanets: [dominantPlanetsList[0] || { planet: "Jupiter", strength: "8.5/10", influenceType: "Expansion & Philosophy" }]
    };
  }, [transitPlanets]);

  const SUB_TABS = [
    { id: "birth_panchanga", name: "Birth Panchang", icon: Star },
    { id: "current_gochara", name: "Current Gochara", icon: RefreshCw },
    { id: "current_dasha", name: "Current Dasha", icon: Calendar },
    { id: "current_transits", name: "Current Transits", icon: Layers },
    { id: "panchanga", name: "Current Panchanga", icon: Clock },
    { id: "current_strengths", name: "Current Strengths", icon: Award },
    { id: "current_yogas", name: "Current Yogas", icon: Sparkles },
    { id: "current_doshas", name: "Current Doshas", icon: AlertTriangle },
    { id: "current_aspects", name: "Current Aspects", icon: Compass },
    { id: "house_activation", name: "House Activation", icon: Shield },
    { id: "current_nakshatra", name: "Current Nakshatra", icon: Star },
    { id: "sensitive_points", name: "Sensitive Points", icon: MapPin },
    { id: "current_events", name: "Current Events", icon: Activity },
    { id: "transit_timeline", name: "Transit Timeline", icon: TrendingUp },
    { id: "planet_ingress", name: "Planet Ingress", icon: ArrowRight },
    { id: "transit_summary", name: "Transit Summary", icon: Info },
    { id: "daily_muhurta", name: "Daily Muhurta", icon: Clock },
    { id: "event_muhurta", name: "Event Muhurta", icon: Calendar },
  ];

  if (!validationResult.isValid) {
    return (
      <div className="bg-slate-950/60 border border-rose-500/30 rounded-2xl p-6 space-y-4 shadow-xl font-sans" id="schema-validation-failure">
        <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4">
          <div className="p-3 bg-rose-500/15 text-rose-400 rounded-xl border border-rose-500/20">
            <AlertTriangle className="w-6 h-6 animate-pulse text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-300">Transit Payload Schema Validation Error</h3>
            <p className="text-xs text-rose-400/80 mt-1">
              Critical fields required for rendering the transit dashboard are missing or null in the active sky context.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-300">
            The Gochara Subsystem is locked until the following schema requirements are resolved:
          </p>
          <div className="bg-slate-900/40 rounded-xl border border-slate-800 divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
            {validationResult.errors.map((err, idx) => (
              <div key={idx} className="p-3 flex items-start gap-2.5 text-xs">
                <span className="font-bold text-rose-400 font-mono shrink-0">[{err.field}]</span>
                <span className="text-slate-300">{err.message}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[11px] text-indigo-300/80 leading-relaxed font-mono">
          Required Schema: Moon Position, Moon Star, Moon Sub, Transit Planets (Sun-Saturn Placements, Nakshatra, Star/Sub Lords), and Panchanga (Tithi, Vara, Nakshatra, Yoga, Karana).
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="transits-tab-container">
      {/* 18 Beautiful Wrapping Submenus */}
      {!propSubTab && (
        <div className="flex flex-wrap gap-2 py-2" id="transits-submenu-grid">
          {SUB_TABS.map((tab) => {
            const isSelected = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-mono rounded-lg transition-all border cursor-pointer select-none ${
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-500/50 text-orange-600 dark:text-orange-400 font-bold shadow-sm"
                    : "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60 shadow-sm"
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Title block */}
      {!propSubTab && subTab !== "birth_panchanga" && (
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-sans font-medium text-amber-100 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-500" />
                Gochara Subsystem
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Complete divisional transit alignments, real-time aspects, sensitive points, and Vimshottari dasha intersection.
                {lat && lng && (
                  <span className="block mt-1 text-[11px] text-amber-400/80 font-mono flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-500" />
                    Gps Spot: {Number(lat).toFixed(4)}°N, {Number(lng).toFixed(4)}°E (TZ: {tz >= 0 ? `+${tz}` : tz})
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <RefreshCw className="w-7 h-7 animate-spin text-amber-500 mb-3" />
          <span className="text-xs text-slate-400 font-mono">Casting high-resolution ephemeris transits...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-center text-xs text-rose-400">
          {error}
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* TAB 0: BIRTH PANCHANGA */}
          {subTab === "birth_panchanga" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h4 className="text-base font-semibold text-emerald-400 flex items-center gap-2 font-sans">
                    <span className="text-[12px] font-mono text-emerald-500 font-bold uppercase tracking-wider block">
                      🟢 Live Birth Panchang Pillars
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    The five primary attributes of time at birth: Tithi, Vara, Nakshatra, Yoga, and Karana.
                  </p>
                </div>
              </div>

              {(() => {
                const pData = astrologyData?.panchanga || profile?.Vedic?.panchanga || {};
                const astroDetails = astrologyData?.astronomical_details || profile?.Astronomical || {};
                return (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: "Tithi (Lunar Day)", value: pData.tithi || "Sukla Ekadashi", sub: "Solilunar Angle", color: "border-amber-500/20 text-amber-400 bg-amber-500/5" },
                      { label: "Vara (Weekday)", value: pData.vara || (profile?.Birth?.date ? new Date(profile.Birth.date).toLocaleDateString("en-US", { weekday: "long" }) : "Friday"), sub: `Lord: ${pData.varaLord || "Venus"}`, color: "border-indigo-500/20 text-indigo-300 bg-indigo-500/5" },
                      { label: "Nakshatra (Moon)", value: pData.nakshatra || "Rohini", sub: `Lord: ${pData.nakLord || "Moon"}`, color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" },
                      { label: "Yoga (Solilunar)", value: pData.yoga || "Preeti", sub: "Longitude Sum", color: "border-cyan-500/20 text-cyan-400 bg-cyan-500/5" },
                      { label: "Karana (Half Tithi)", value: pData.karana || "Bava", sub: "Angle Sectors", color: "border-purple-500/20 text-purple-400 bg-purple-500/5" }
                    ].map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border ${item.color} flex flex-col justify-between h-32`}>
                        <div>
                          <span className="text-[9px] uppercase font-mono text-slate-400 block tracking-wider font-semibold">{item.label}</span>
                          <h5 className="text-sm font-bold text-white mt-2 leading-tight font-sans">{item.value}</h5>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{item.sub}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Day Kaal & Astro details inside Birth Panchang */}
              {(() => {
                const astroDetails = astrologyData?.astronomical_details || profile?.Astronomical || {};
                return (
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30">
                    <span className="text-xs font-mono text-indigo-400 uppercase font-bold block mb-3">Natal Ephemeris & Ritu Parameters</span>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs font-mono">
                      <div className="p-3 rounded bg-slate-950/40 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400 font-sans">Sunrise:</span>
                        <span className="text-slate-200 font-bold">{astroDetails.sunrise || "05:42 AM"}</span>
                      </div>
                      <div className="p-3 rounded bg-slate-950/40 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400 font-sans">Sunset:</span>
                        <span className="text-slate-200 font-bold">{astroDetails.sunset || "06:55 PM"}</span>
                      </div>
                      <div className="p-3 rounded bg-slate-950/40 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400 font-sans">Lunar Month:</span>
                        <span className="text-slate-200 font-bold font-sans">{astroDetails.lunar_month || astroDetails.lunarMonth || "Kartika"}</span>
                      </div>
                      <div className="p-3 rounded bg-slate-950/40 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400 font-sans">Samvatsara:</span>
                        <span className="text-slate-200 font-bold font-sans">{astroDetails.year_name || astroDetails.yearName || "Krodhi"}</span>
                      </div>
                      <div className="p-3 rounded bg-slate-950/40 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400 font-sans">Vedic Season:</span>
                        <span className="text-slate-200 font-bold font-sans">{astroDetails.season || "Sharad"}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 1: CURRENT GOCHARA */}
          {subTab === "current_gochara" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Dual Chart */}
              <div className="lg:col-span-6 flex flex-col items-center bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-6 shadow-md">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold mb-4">
                  Dual Chart: Natal (Indigo) vs Transit (Amber)
                </span>

                {chartStyle === "north" ? (
                  <div className="relative w-full max-w-[340px] aspect-square bg-slate-950/40 rounded-xl border border-indigo-500/30 p-2 shadow-inner">
                    <svg viewBox="0 0 400 400" className="w-full h-full text-indigo-500/40 font-mono">
                      <rect x="10" y="10" width="380" height="380" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500/50" />
                      <line x1="10" y1="10" x2="390" y2="390" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500/35" />
                      <line x1="390" y1="10" x2="10" y2="390" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500/35" />
                      <polygon points="200,10 390,200 200,390 10,200" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500/50" />

                      {/* House Labels & Positions Mapping */}
                      <text x="200" y="102" textAnchor="middle" className="fill-amber-500 font-bold text-[10px]">{getSignForHouse(1)}</text>
                      <text x="200" y="70" textAnchor="middle" className="fill-indigo-400 text-[10px] font-bold">{(natalChart[1] || []).map(getPlanetAbbr).join(" ")}</text>
                      <text x="200" y="85" textAnchor="middle" className="fill-amber-400 text-[10px] font-bold">{getTransitPlanetsForHouse(1).map(getPlanetAbbr).join(" ")}</text>

                      <text x="145" y="65" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(2)}</text>
                      <text x="110" y="75" textAnchor="middle" className="fill-indigo-400 text-[10px]">{(natalChart[2] || []).map(getPlanetAbbr).join(" ")}</text>
                      <text x="110" y="90" textAnchor="middle" className="fill-amber-400 text-[10px]">{getTransitPlanetsForHouse(2).map(getPlanetAbbr).join(" ")}</text>

                      <text x="65" y="145" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(3)}</text>
                      <text x="60" y="95" textAnchor="middle" className="fill-indigo-400 text-[10px]">{(natalChart[3] || []).map(getPlanetAbbr).join(" ")}</text>
                      <text x="60" y="110" textAnchor="middle" className="fill-amber-400 text-[10px]">{getTransitPlanetsForHouse(3).map(getPlanetAbbr).join(" ")}</text>

                      <text x="105" y="200" textAnchor="middle" className="fill-amber-500 font-bold text-[10px]">{getSignForHouse(4)}</text>
                      <text x="65" y="190" textAnchor="middle" className="fill-indigo-400 text-[10px]">{(natalChart[4] || []).map(getPlanetAbbr).join(" ")}</text>
                      <text x="65" y="205" textAnchor="middle" className="fill-amber-400 text-[10px]">{getTransitPlanetsForHouse(4).map(getPlanetAbbr).join(" ")}</text>

                      <text x="65" y="260" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(5)}</text>
                      <text x="60" y="300" textAnchor="middle" className="fill-indigo-400 text-[10px]">{(natalChart[5] || []).map(getPlanetAbbr).join(" ")}</text>
                      <text x="60" y="315" textAnchor="middle" className="fill-amber-400 text-[10px]">{getTransitPlanetsForHouse(5).map(getPlanetAbbr).join(" ")}</text>

                      <text x="145" y="340" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(6)}</text>
                      <text x="110" y="315" textAnchor="middle" className="fill-indigo-400 text-[10px]">{(natalChart[6] || []).map(getPlanetAbbr).join(" ")}</text>
                      <text x="110" y="330" textAnchor="middle" className="fill-amber-400 text-[10px]">{getTransitPlanetsForHouse(6).map(getPlanetAbbr).join(" ")}</text>

                      <text x="200" y="305" textAnchor="middle" className="fill-amber-500 font-bold text-[10px]">{getSignForHouse(7)}</text>
                      <text x="200" y="270" textAnchor="middle" className="fill-indigo-400 text-[10px]">{(natalChart[7] || []).map(getPlanetAbbr).join(" ")}</text>
                      <text x="200" y="285" textAnchor="middle" className="fill-amber-400 text-[10px]">{getTransitPlanetsForHouse(7).map(getPlanetAbbr).join(" ")}</text>

                      <text x="255" y="340" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(8)}</text>
                      <text x="290" y="315" textAnchor="middle" className="fill-indigo-400 text-[10px]">{(natalChart[8] || []).map(getPlanetAbbr).join(" ")}</text>
                      <text x="290" y="330" textAnchor="middle" className="fill-amber-400 text-[10px]">{getTransitPlanetsForHouse(8).map(getPlanetAbbr).join(" ")}</text>

                      <text x="340" y="260" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(9)}</text>
                      <text x="340" y="300" textAnchor="middle" className="fill-indigo-400 text-[10px]">{(natalChart[9] || []).map(getPlanetAbbr).join(" ")}</text>
                      <text x="340" y="315" textAnchor="middle" className="fill-amber-400 text-[10px]">{getTransitPlanetsForHouse(9).map(getPlanetAbbr).join(" ")}</text>

                      <text x="295" y="200" textAnchor="middle" className="fill-amber-500 font-bold text-[10px]">{getSignForHouse(10)}</text>
                      <text x="335" y="195" textAnchor="middle" className="fill-indigo-400 text-[10px]">{(natalChart[10] || []).map(getPlanetAbbr).join(" ")}</text>
                      <text x="335" y="210" textAnchor="middle" className="fill-amber-400 text-[10px]">{getTransitPlanetsForHouse(10).map(getPlanetAbbr).join(" ")}</text>

                      <text x="340" y="145" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(11)}</text>
                      <text x="340" y="95" textAnchor="middle" className="fill-indigo-400 text-[10px]">{(natalChart[11] || []).map(getPlanetAbbr).join(" ")}</text>
                      <text x="340" y="110" textAnchor="middle" className="fill-amber-400 text-[10px]">{getTransitPlanetsForHouse(11).map(getPlanetAbbr).join(" ")}</text>

                      <text x="255" y="65" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(12)}</text>
                      <text x="290" y="75" textAnchor="middle" className="fill-indigo-400 text-[10px]">{(natalChart[12] || []).map(getPlanetAbbr).join(" ")}</text>
                      <text x="290" y="90" textAnchor="middle" className="fill-amber-400 text-[10px]">{getTransitPlanetsForHouse(12).map(getPlanetAbbr).join(" ")}</text>
                    </svg>
                  </div>
                ) : (
                  <div className="relative w-full max-w-[340px] aspect-square bg-slate-950/40 rounded-xl border border-indigo-500/30 p-4 shadow-inner grid grid-cols-4 grid-rows-4 gap-1">
                    {[
                      { index: 11, label: "Pi" }, { index: 0, label: "Ar" }, { index: 1, label: "Ta" }, { index: 2, label: "Ge" },
                      { index: 10, label: "Aq" }, { index: -1, label: "" }, { index: -1, label: "" }, { index: 3, label: "Cn" },
                      { index: 9, label: "Cp" }, { index: -1, label: "" }, { index: -1, label: "" }, { index: 4, label: "Le" },
                      { index: 8, label: "Sg" }, { index: 7, label: "Sc" }, { index: 6, label: "Li" }, { index: 5, label: "Vi" }
                    ].map((cell, idx) => {
                      if (cell.index === -1) {
                        if (idx === 5) {
                          return (
                            <div key={idx} className="col-span-2 row-span-2 flex flex-col items-center justify-center border border-indigo-500/10 bg-slate-950/60 rounded-lg">
                              <span className="text-xs font-mono font-bold text-amber-500">GOCHARA</span>
                              <span className="text-[9px] text-indigo-400 font-mono">D1 Wheel</span>
                            </div>
                          );
                        }
                        return null;
                      }

                      const houseNum = ((cell.index - lagnaSignIndex + 12) % 12) + 1;
                      const nPl = natalChart[houseNum] || [];
                      const tPl = getTransitPlanetsForHouse(houseNum);
                      const isLagna = cell.index === lagnaSignIndex;

                      return (
                        <div key={idx} className={`border border-indigo-500/15 bg-slate-900/40 p-1 rounded-md flex flex-col justify-between aspect-square ${isLagna ? "ring-1 ring-amber-500/40" : ""}`}>
                          <span className="text-[8px] font-mono text-slate-500">{cell.label} {isLagna && "★"}</span>
                          <div className="flex flex-col gap-0.5 items-center justify-center">
                            {nPl.length > 0 && <span className="text-[8px] text-indigo-400 font-mono">{nPl.map(getPlanetAbbr).join(" ")}</span>}
                            {tPl.length > 0 && <span className="text-[8px] text-amber-400 font-bold font-mono">{tPl.map(getPlanetAbbr).join(" ")}</span>}
                          </div>
                          <span className="text-[8px] text-slate-600 text-right font-mono">H{houseNum}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Transit Coordinates Table */}
              <div className="lg:col-span-6 bg-slate-950/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-amber-300">🪐 Active Transit Coordinates</h4>
                <div className="overflow-x-auto text-xs font-mono">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2">Planet</th>
                        <th className="pb-2">Sign</th>
                        <th className="pb-2">Degree</th>
                        <th className="pb-2">Nakshatra</th>
                        <th className="pb-2">Pada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40 text-slate-300">
                      {transitPlanets.map((p) => {
                        const lon = getPlanetLongitude(p);
                        const nak = getPlanetNakshatraDetails(lon);
                        return (
                          <tr key={p.name} className="hover:bg-slate-900/20">
                            <td className="py-2.5 font-bold text-slate-200">{p.name}</td>
                            <td className="py-2.5">{p.sign}</td>
                            <td className="py-2.5">{p.degree.toFixed(2)}°</td>
                            <td className="py-2.5 text-indigo-300">{nak.name}</td>
                            <td className="py-2.5 text-amber-400 font-bold">{nak.pada}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CURRENT DASHA */}
          {subTab === "current_dasha" && (
            <div className="space-y-6">
              {/* Vimshottari Dasha Alignments Card */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h4 className="text-base font-semibold text-amber-100">Vimshottari Dasha Alignments (Selected Moment)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Active Mahadasha, Bhukti, Antara, Sukshma, and Prana levels running on <span className="text-amber-400 font-mono">{transitDate} {transitTime}</span>.
                  </p>
                </div>

                {dashaAlignment ? (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[
                      { title: "Maha (Level 1)", lord: dashaAlignment.maha.lord, start: dashaAlignment.maha.startDate, end: dashaAlignment.maha.endDate, color: "border-indigo-500/40 text-indigo-300" },
                      { title: "Bhukti / Antar (Level 2)", lord: dashaAlignment.antar?.lord || "None", start: dashaAlignment.antar?.startDate, end: dashaAlignment.antar?.endDate, color: "border-amber-500/40 text-amber-400" },
                      { title: "Antara (Level 3)", lord: dashaAlignment.pratyantar?.lord || "None", start: dashaAlignment.pratyantar?.startDate || dashaAlignment.pratyantar?.start, end: dashaAlignment.pratyantar?.endDate || dashaAlignment.pratyantar?.end, color: "border-emerald-500/40 text-emerald-400" },
                      { title: "Sukshma (Level 4)", lord: dashaAlignment.sookshma?.lord || "None", start: dashaAlignment.sookshma?.start, end: dashaAlignment.sookshma?.end, color: "border-cyan-500/40 text-cyan-400" },
                      { title: "Prana (Level 5)", lord: dashaAlignment.prana?.lord || "None", start: dashaAlignment.prana?.start, end: dashaAlignment.prana?.end, color: "border-purple-500/40 text-purple-400" }
                    ].map((level, i) => (
                      <div key={i} className={`p-4 rounded-xl border bg-slate-900/30 flex flex-col justify-between h-40 hover:bg-slate-900/60 transition-all shadow-md`}>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-slate-500">{level.title}</span>
                          <h5 className={`text-lg font-bold mt-2 ${level.color}`}>{level.lord}</h5>
                        </div>
                        <div className="text-[10px] text-slate-400 space-y-0.5 font-mono">
                          <div>Start: {level.start ? new Date(level.start).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}</div>
                          <div>End: {level.end ? new Date(level.end).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs italic">No Vimshottari dasha found inside native profile.</div>
                )}
              </div>

              {/* Yogas Active Due to Current Transit */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-semibold text-amber-100">Yogas Active Due to Current Transit</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getActiveTransitYogas().map((yoga, i) => (
                    <div key={i} className="p-4 rounded-xl border border-indigo-500/15 bg-slate-900/30 hover:border-amber-500/25 transition-all space-y-2">
                      <div className="flex items-center gap-2 text-amber-400">
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <strong className="text-sm font-semibold">{yoga.name}</strong>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{yoga.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transit-Related Celestial Doshas */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-semibold text-amber-100">Transit-Related Celestial Doshas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getActiveTransitDoshas().map((dosha, i) => (
                    <div key={i} className="p-4 rounded-xl border border-rose-500/15 bg-slate-900/30 hover:border-rose-500/30 transition-all space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          {dosha.name}
                        </span>
                        <span className="text-[9px] font-mono bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded uppercase font-bold">{dosha.severity} Severity</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{dosha.desc}</p>

                      <div className="p-2.5 rounded bg-slate-950/65 border border-slate-850">
                        <span className="text-[10px] text-amber-400 uppercase block font-bold font-mono">Remedial Suggestion:</span>
                        <span className="text-slate-300 text-xs mt-0.5 block leading-normal">{dosha.remedy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bhava House Activations */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-semibold text-amber-100">Bhava House Activations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {houseActivation.map((item) => (
                    <div key={item.house} className="p-4 rounded-xl border border-indigo-500/10 bg-slate-900/20 hover:border-indigo-500/30 transition-all flex flex-col justify-between h-40">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-amber-400 font-mono">House {item.house}</span>
                          <span className="text-xs font-semibold text-slate-300">{item.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{item.focus}</p>
                      </div>

                      <div className="bg-indigo-950/15 border border-indigo-900/30 p-2 rounded text-[11px] font-mono text-indigo-300 text-center">
                        {item.trigger}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coordinate Sensitive Points */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-semibold text-amber-100">Coordinate Sensitive Points</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sensitivePointsList.map((pt, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 hover:border-indigo-500/10 transition-all flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <strong className="text-sm text-slate-200">{pt.name}</strong>
                          <span className="text-xs font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/25">{pt.coord}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{pt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Transit Health, Spirit & Career Synthesizer */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      Interactive Transit Health, Spirit & Career Synthesizer
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Real-time calculations for mental, physical and spiritual alignments</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Visual score bars */}
                  <div className="lg:col-span-7 space-y-5">
                    <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">
                      Cosmic Health Energy Scores
                    </h4>
                    {[
                      { label: "Mental Clarity & Communication", score: dynamicEnergy.mental.score, tone: dynamicEnergy.mental.tone, color: "bg-cyan-500" },
                      { label: "Physical Stamina & Action Drive", score: dynamicEnergy.physical.score, tone: dynamicEnergy.physical.tone, color: "bg-rose-500" },
                      { label: "Financial Flow & Asset Strength", score: dynamicEnergy.financial.score, tone: dynamicEnergy.financial.tone, color: "bg-emerald-500" },
                      { label: "Relationship Harmony & Bonding", score: dynamicEnergy.relationship.score, tone: dynamicEnergy.relationship.tone, color: "bg-pink-500" },
                      { label: "Career Focus & Authority Power", score: dynamicEnergy.career.score, tone: dynamicEnergy.career.tone, color: "bg-amber-500" },
                      { label: "Spiritual Alignment & Reflection", score: dynamicEnergy.spiritual.score, tone: dynamicEnergy.spiritual.tone, color: "bg-violet-500" },
                    ].map((bar, idx) => (
                      <div key={idx} className="space-y-1.5 bg-slate-900/30 p-3 rounded-xl border border-slate-800/40">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-300">{bar.label}</span>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-slate-400 text-[11px]">({bar.tone})</span>
                            <span className="text-indigo-400">{(bar.score * 10).toFixed(1)}/10</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div className={`h-full ${bar.color} transition-all`} style={{ width: `${bar.score * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dominant Houses and Planets */}
                  <div className="lg:col-span-5 space-y-4">
                    <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">
                      Dominant Cosmic Anchors
                    </h4>

                    <div className="space-y-3.5">
                      {/* Dominant House */}
                      {dynamicMood.dominantHouses.map((house, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
                          <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block">Active Transit Focus House</span>
                          <h5 className="text-xs font-bold text-white mt-1.5">House {house.houseNumber} Transit</h5>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {house.significance}. Amplifying focus and active planetary alignments.
                          </p>
                        </div>
                      ))}

                      {/* Dominant Planet */}
                      {dynamicMood.dominantPlanets.map((planet, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
                          <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block">Dominant Planet Anchor</span>
                          <h5 className="text-xs font-bold text-amber-400 mt-1.5">{planet.planet} (Strength: {planet.strength})</h5>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {planet.influenceType}. Highly supportive of deep analytical and intuitive clarity.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Synthesis from dynamic calculations */}
                <div className="mt-6 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 space-y-2">
                  <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-extrabold block">
                    Vedic Sky Synthesis
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The active sky indicates peak <strong className="text-indigo-400">Spiritual Alignment ({(dynamicEnergy.spiritual.score * 100).toFixed(0)}%)</strong> and high <strong className="text-cyan-400">Mental Clarity ({(dynamicEnergy.mental.score * 100).toFixed(0)}%)</strong>. Dominated by {dynamicMood.dominantPlanets[0]?.planet || "Jupiter"}'s supportive transit across your natal horizon, you are gifted with heightened intuition. Excellent day for domestic consolidation, organizing intellectual projects, and practicing mantra sadhana. Avoid long taxing journeys or physical confrontations during inauspicious solar transit sectors.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CURRENT TRANSITS */}
          {subTab === "current_transits" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h4 className="text-base font-semibold text-amber-100">Planetary Transits Table</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time transit positions (Gochara) mapped against your natal birth houses.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/10">
                <table className="min-w-full divide-y divide-slate-800 text-left text-xs font-sans">
                  <thead className="bg-slate-900/60 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Planet</th>
                      <th className="px-4 py-3">Zodiac Sign</th>
                      <th className="px-4 py-3">Longitude / Degree</th>
                      <th className="px-4 py-3">Nakshatra</th>
                      <th className="px-4 py-3 text-center">Pada</th>
                      <th className="px-4 py-3">Nakshatra Lord</th>
                      <th className="px-4 py-3">Sub Lord</th>
                      <th className="px-4 py-3 text-center">Natal House</th>
                      <th className="px-4 py-3 text-center">Transit House</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map((pName) => {
                      let natalHouse = -1;
                      for (let h = 1; h <= 12; h++) {
                        if (natalChart[h]?.includes(pName)) { natalHouse = h; break; }
                      }

                      const tp = transitPlanets.find(p => p.name === pName);
                      if (!tp) {
                        return (
                          <tr key={pName} className="hover:bg-slate-900/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-200">{pName}</td>
                            <td colSpan={9} className="px-4 py-3 text-slate-500 italic">No transit data available</td>
                          </tr>
                        );
                      }

                      const signIdx = ZODIAC_SIGNS.indexOf(tp.sign);
                      const transitHouse = ((signIdx - lagnaSignIndex + 12) % 12) + 1;
                      const isBenefic = getTransitBeneficStatus(pName, transitHouse);

                      const longitude = getPlanetLongitude(tp);
                      const nakDetails = getPlanetNakshatraDetails(longitude);
                      const subLord = getKpSubLord(longitude);

                      // Format degree nicely (e.g. 14° 35')
                      const degFloor = Math.floor(tp.degree);
                      const minVal = Math.round((tp.degree - degFloor) * 60);
                      const formattedDegree = `${degFloor}° ${minVal.toString().padStart(2, '0')}′`;

                      return (
                        <tr key={pName} className="hover:bg-slate-900/30 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-slate-100">{pName}</td>
                          <td className="px-4 py-3.5 text-slate-300">{tp.sign}</td>
                          <td className="px-4 py-3.5 font-mono text-slate-400">{formattedDegree}</td>
                          <td className="px-4 py-3.5 font-medium text-amber-200">{nakDetails.name}</td>
                          <td className="px-4 py-3.5 text-center text-slate-300 font-mono">{nakDetails.pada}</td>
                          <td className="px-4 py-3.5 text-slate-400">{nakDetails.lord}</td>
                          <td className="px-4 py-3.5 text-slate-400 font-medium">{subLord}</td>
                          <td className="px-4 py-3.5 text-center font-mono text-indigo-400 font-semibold">H{natalHouse !== -1 ? natalHouse : "—"}</td>
                          <td className="px-4 py-3.5 text-center font-mono text-amber-400 font-semibold">H{transitHouse}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                              isBenefic ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/5 text-slate-400 border-slate-500/10"
                            }`}>
                              {isBenefic ? "Benefic" : "Neutral"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PANCHANGA */}
          {subTab === "panchanga" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-base font-semibold text-amber-100 font-sans">Moment Panchanga (Current Sky)</h4>
                <p className="text-xs text-slate-400 mt-1">Continuous ephemeris indices computed for the active transit target coordinate.</p>
              </div>

              {transitPanchanga ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Tithi (Lunar Day)", value: transitPanchanga.tithi, sub: "Angle Alignment", color: "border-amber-500/20 text-amber-400 bg-amber-500/5" },
                    { label: "Vara (Day)", value: transitPanchanga.vara, sub: `Lord: ${transitPanchanga.varaLord}`, color: "border-indigo-500/20 text-indigo-300 bg-indigo-500/5" },
                    { label: "Nakshatra (Moon)", value: transitPanchanga.nakshatra, sub: `Lord: ${transitPanchanga.nakLord}`, color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" },
                    { label: "Yoga (Solilunar)", value: transitPanchanga.yoga, sub: "Longitude Sum", color: "border-cyan-500/20 text-cyan-400 bg-cyan-500/5" },
                    { label: "Karana (Half Tithi)", value: transitPanchanga.karana, sub: "Angle Sectors", color: "border-purple-500/20 text-purple-400 bg-purple-500/5" }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${item.color} flex flex-col justify-between h-32`}>
                      <div>
                        <span className="text-[9px] uppercase font-mono text-slate-400">{item.label}</span>
                        <h5 className="text-sm font-bold text-white mt-2 leading-tight">{item.value}</h5>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{item.sub}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic">Casting solar/lunar longitudes to render Panchanga...</div>
              )}

              {/* Day Kaal Timing Blocks */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30">
                <span className="text-xs font-mono text-indigo-400 uppercase font-bold block mb-3">Vedic Major Kaal Windows</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 rounded bg-slate-950/40 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Rahu Kaal:</span>
                    <span className="text-rose-400 font-bold">10:30 AM - 12:00 PM</span>
                  </div>
                  <div className="p-3 rounded bg-slate-950/40 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Gulika Kaal:</span>
                    <span className="text-indigo-400 font-bold">07:30 AM - 09:00 AM</span>
                  </div>
                  <div className="p-3 rounded bg-slate-950/40 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Yamaganda Kaal:</span>
                    <span className="text-amber-500 font-bold">01:30 PM - 03:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CURRENT STRENGTHS */}
          {subTab === "current_strengths" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-base font-semibold text-amber-100">Planetary Dignities & Strengths</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {transitPlanets.map((p) => {
                  const data = getPlanetDignityAndStrength(p);
                  return (
                    <div key={p.name} className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/20 hover:border-indigo-500/10 transition-all space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200 text-sm">{p.name}</span>
                        <span className="text-[10px] font-bold text-amber-400 font-mono">H{p.house} Position</span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Dignity:</span>
                          <span className="text-indigo-300 font-semibold">{data.dignity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Estimated Power:</span>
                          <span className="font-bold font-mono text-emerald-400">{data.score}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ishta Score:</span>
                          <span className="font-semibold text-amber-400">{data.ishta}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Kashta Score:</span>
                          <span className="font-semibold text-slate-500">{data.kashta}/100</span>
                        </div>
                      </div>

                      {/* Power Progress Bar */}
                      <div className="w-full bg-slate-950 rounded-full h-1">
                        <div className="bg-emerald-500 h-1 rounded-full transition-all duration-500" style={{ width: `${data.score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: CURRENT YOGAS */}
          {subTab === "current_yogas" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-base font-semibold text-amber-100">Yogas Active Due to Current Transit</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getActiveTransitYogas().map((yoga, i) => (
                  <div key={i} className="p-4 rounded-xl border border-indigo-500/15 bg-slate-900/30 hover:border-amber-500/25 transition-all space-y-2">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <strong className="text-sm font-semibold">{yoga.name}</strong>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{yoga.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CURRENT DOSHAS */}
          {subTab === "current_doshas" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-base font-semibold text-amber-100">Transit-Related Celestial Doshas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getActiveTransitDoshas().map((dosha, i) => (
                  <div key={i} className="p-4 rounded-xl border border-rose-500/15 bg-slate-900/30 hover:border-rose-500/30 transition-all space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        {dosha.name}
                      </span>
                      <span className="text-[9px] font-mono bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded uppercase font-bold">{dosha.severity} Severity</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{dosha.desc}</p>

                    <div className="p-2.5 rounded bg-slate-950/65 border border-slate-850">
                      <span className="text-[10px] text-amber-400 uppercase block font-bold font-mono">Remedial Suggestion:</span>
                      <span className="text-slate-300 text-xs mt-0.5 block leading-normal">{dosha.remedy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: CURRENT ASPECTS */}
          {subTab === "current_aspects" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-base font-semibold text-amber-100">Active Planetary Aspects (Drishti Matrix)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeAspectsList.map((asp, i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/30 text-xs hover:border-indigo-500/20 transition-all">
                    <div className="flex justify-between">
                      <strong className="text-slate-200">{asp.p1}</strong>
                      <span className="text-amber-400 font-bold font-mono">{asp.type}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                      <span>Targeting: {asp.p2}</span>
                      <span className="font-mono">{asp.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: HOUSE ACTIVATION */}
          {subTab === "house_activation" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-base font-semibold text-amber-100">Bhava House Activations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {houseActivation.map((item) => (
                  <div key={item.house} className="p-4 rounded-xl border border-indigo-500/10 bg-slate-900/20 hover:border-indigo-500/30 transition-all flex flex-col justify-between h-40">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-400 font-mono">House {item.house}</span>
                        <span className="text-xs font-semibold text-slate-300">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{item.focus}</p>
                    </div>

                    <div className="bg-indigo-950/15 border border-indigo-900/30 p-2 rounded text-[11px] font-mono text-indigo-300 text-center">
                      {item.trigger}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: CURRENT NAKSHATRA */}
          {subTab === "current_nakshatra" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-base font-semibold text-amber-100">Planets Nakshatra & Pada Movements</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
                      <th className="p-3">Planet</th>
                      <th className="p-3">Nakshatra Name</th>
                      <th className="p-3">Pada</th>
                      <th className="p-3">Nakshatra Lord</th>
                      <th className="p-3 text-cyan-400 font-bold">KP Sub Lord</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {transitPlanets.map((p) => {
                      const lon = getPlanetLongitude(p);
                      const nak = getPlanetNakshatraDetails(lon);
                      const subLord = getKpSubLord(lon);
                      return (
                        <tr key={p.name} className="hover:bg-slate-900/20">
                          <td className="p-3 font-bold text-slate-200">{p.name}</td>
                          <td className="p-3 text-indigo-300">{nak.name}</td>
                          <td className="p-3 text-amber-400 font-bold">{nak.pada}</td>
                          <td className="p-3">{nak.lord}</td>
                          <td className="p-3 font-bold text-cyan-400">{subLord}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 11: SENSITIVE POINTS */}
          {subTab === "sensitive_points" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-base font-semibold text-amber-100">Coordinate Sensitive Points</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sensitivePointsList.map((pt, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 hover:border-indigo-500/10 transition-all flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-center">
                        <strong className="text-sm text-slate-200">{pt.name}</strong>
                        <span className="text-xs font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/25">{pt.coord}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{pt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12: CURRENT EVENTS */}
          {subTab === "current_events" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-base font-semibold text-amber-100">Space Weather Celestial Alerts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spaceWeatherAlerts.map((alert, i) => (
                  <div key={i} className="p-4 rounded-xl border border-indigo-500/15 bg-slate-900/30 flex items-start gap-3">
                    <div className="bg-indigo-500/10 p-2.5 rounded-lg text-indigo-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider">{alert.type}</span>
                      <h5 className="text-sm font-semibold text-white mt-0.5">{alert.pName}</h5>
                      <p className="text-xs text-slate-400 mt-1.5 leading-normal">{alert.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 13: TRANSIT TIMELINE */}
          {subTab === "transit_timeline" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-base font-semibold text-amber-100">Upcoming Transit Timeline (30-Day Outlook)</h4>
              <div className="space-y-4">
                {upcomingTimeline.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-bold text-slate-200 text-sm">{item.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal">{item.desc}</p>
                    </div>
                    <span className="text-xs font-bold font-mono text-amber-500 shrink-0 bg-amber-500/5 border border-amber-500/20 px-2 py-1 rounded">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 14: PLANETARY INGRESS */}
          {subTab === "planet_ingress" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <IngressTab birthDate={astrologyData.birthDetails.date} />
            </div>
          )}

          {/* TAB 15: TRANSIT SUMMARY */}
          {subTab === "transit_summary" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    Interactive Transit Health, Spirit & Career Synthesizer
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Real-time calculations for mental, physical and spiritual alignments</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visual score bars */}
                <div className="lg:col-span-7 space-y-5">
                  <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">
                    Cosmic Health Energy Scores
                  </h4>
                  {[
                    { label: "Mental Clarity & Communication", score: dynamicEnergy.mental.score, tone: dynamicEnergy.mental.tone, color: "bg-cyan-500" },
                    { label: "Physical Stamina & Action Drive", score: dynamicEnergy.physical.score, tone: dynamicEnergy.physical.tone, color: "bg-rose-500" },
                    { label: "Financial Flow & Asset Strength", score: dynamicEnergy.financial.score, tone: dynamicEnergy.financial.tone, color: "bg-emerald-500" },
                    { label: "Relationship Harmony & Bonding", score: dynamicEnergy.relationship.score, tone: dynamicEnergy.relationship.tone, color: "bg-pink-500" },
                    { label: "Career Focus & Authority Power", score: dynamicEnergy.career.score, tone: dynamicEnergy.career.tone, color: "bg-amber-500" },
                    { label: "Spiritual Alignment & Reflection", score: dynamicEnergy.spiritual.score, tone: dynamicEnergy.spiritual.tone, color: "bg-violet-500" },
                  ].map((bar, idx) => (
                    <div key={idx} className="space-y-1.5 bg-slate-900/30 p-3 rounded-xl border border-slate-800/40">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-300">{bar.label}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-400 text-[11px]">({bar.tone})</span>
                          <span className="text-indigo-400">{(bar.score * 10).toFixed(1)}/10</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className={`h-full ${bar.color} transition-all`} style={{ width: `${bar.score * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dominant Houses and Planets */}
                <div className="lg:col-span-5 space-y-4">
                  <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">
                    Dominant Cosmic Anchors
                  </h4>

                  <div className="space-y-3.5">
                    {/* Dominant House */}
                    {dynamicMood.dominantHouses.map((house, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
                        <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block">Active Transit Focus House</span>
                        <h5 className="text-xs font-bold text-white mt-1.5">House {house.houseNumber} Transit</h5>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {house.significance}. Amplifying focus and active planetary alignments.
                        </p>
                      </div>
                    ))}

                    {/* Dominant Planet */}
                    {dynamicMood.dominantPlanets.map((planet, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
                        <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block">Dominant Planet Anchor</span>
                        <h5 className="text-xs font-bold text-amber-400 mt-1.5">{planet.planet} (Strength: {planet.strength})</h5>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {planet.influenceType}. Highly supportive of deep analytical and intuitive clarity.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Synthesis from dynamic calculations */}
              <div className="mt-6 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 space-y-2">
                <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-extrabold block">
                  Vedic Sky Synthesis
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The active sky indicates peak <strong className="text-indigo-400">Spiritual Alignment ({(dynamicEnergy.spiritual.score * 100).toFixed(0)}%)</strong> and high <strong className="text-cyan-400">Mental Clarity ({(dynamicEnergy.mental.score * 100).toFixed(0)}%)</strong>. Dominated by {dynamicMood.dominantPlanets[0]?.planet || "Jupiter"}'s supportive transit across your natal horizon, you are gifted with heightened intuition. Excellent day for domestic consolidation, organizing intellectual projects, and practicing mantra sadhana. Avoid long taxing journeys or physical confrontations during inauspicious solar transit sectors.
                </p>
              </div>
            </div>
          )}

          {/* TAB 16: DAILY MUHURTA */}
          {subTab === "daily_muhurta" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h4 className="text-base font-semibold text-amber-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Daily Muhurtas & Astrological Time Segments
                  </h4>
                  <p className="text-xs text-slate-400">Highly customized to the active date, location, and sunrise parameters</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: "Abhijit Muhurta", time: `${computedMuhurtas.abhijit.start} - ${computedMuhurtas.abhijit.end}`, status: "Highly Auspicious", score: 5, color: "border-amber-500/20 bg-amber-500/5 text-amber-400" },
                  { name: "Rahu Kalam", time: `${computedMuhurtas.rahuKalam.start} - ${computedMuhurtas.rahuKalam.end}`, status: "Inauspicious - Avoid", score: 1, color: "border-rose-500/20 bg-rose-500/5 text-rose-400" },
                  { name: "Yamaganda", time: `${computedMuhurtas.yamaganda.start} - ${computedMuhurtas.yamaganda.end}`, status: "Inauspicious", score: 2, color: "border-red-500/20 bg-red-500/5 text-red-400" },
                  { name: "Gulika Kalam", time: `${computedMuhurtas.gulika.start} - ${computedMuhurtas.gulika.end}`, status: "Obstacles - Delay", score: 2, color: "border-orange-500/20 bg-orange-500/5 text-orange-400" }
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.color} flex flex-col justify-between space-y-4`}>
                    <div>
                      <div className="flex justify-between items-center">
                        <strong className="text-xs font-mono uppercase tracking-wider">{item.name}</strong>
                        <span className="text-[10px] bg-slate-900/40 px-2 py-0.5 rounded font-mono font-bold">{item.status}</span>
                      </div>
                      <p className="text-sm font-bold font-mono mt-3 text-white">{item.time}</p>
                    </div>
                    <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-400">Strength:</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < item.score ? 'bg-current' : 'bg-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Muhurtas list */}
              <div className="mt-6 space-y-4">
                <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">
                  All Calculated Muhurtas for Today
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
                        <th className="p-3">Muhurta Name</th>
                        <th className="p-3">Calculation Logic / Start Time</th>
                        <th className="p-3">Nature / Auspiciousness</th>
                        <th className="p-3">Activities Recommended / Avoided</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                      {Array.isArray(transitAstroData?.muhurtas || astrologyData.muhurtas) && (transitAstroData?.muhurtas || astrologyData.muhurtas).map((m: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-900/20">
                          <td className="p-3 font-bold text-slate-200">{m.name}</td>
                          <td className="p-3 text-indigo-300">{m.time}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              (m.auspiciousness || "").includes("Highly") || (m.auspiciousness || "").includes("Good") || (m.auspiciousness || "").includes("Beneficial")
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                              {m.auspiciousness}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 leading-normal max-w-xs truncate md:max-w-md">{m.activities}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 17: EVENT MUHURTA */}
          {subTab === "event_muhurta" && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h4 className="text-base font-semibold text-amber-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    Specialized Event Muhurta Suitability Finder
                  </h4>
                  <p className="text-xs text-slate-400">Targeted activity suitability analysis based on current solar/lunar configurations</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {[
                  { title: "Marriage & Commitments", key: "marriageWindow", desc: "For weddings, engagements, registry setups and lifelong relationship foundations.", icon: Sparkles },
                  { title: "Business & Partnerships", key: "businessOpportunity", desc: "For launching ventures, incorporation filings, registering domains and executing major commercial agreements.", icon: Award },
                  { title: "Investment & Real Estate", key: "investmentOpportunity", desc: "For property acquisition, long-term capital allocation, commodity purchases and portfolio settlement.", icon: TrendingUp },
                  { title: "Education & Enrollment", key: "learningOpportunity", desc: "For admission filings, learning new languages, initiating analytical research or scriptural study.", icon: HelpCircle },
                  { title: "Career & Promotions", key: "careerOpportunity", desc: "For leadership pitches, submitting resume profiles, scheduling salary talks, and initiating office moves.", icon: Shield },
                  { title: "Travel & Relocation", key: "travelOpportunity", desc: "For executing physical transits, cross-border migrations, shipping vessels, or shifting residences.", icon: Compass }
                ].map((opt, i) => {
                  const val = (dynamicEventOpportunity as any)[opt.key] || { active: false, timeframe: "Plan for next favorable Nakshatra cycle" };
                  const Icon = opt.icon;
                  return (
                    <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-center">
                          <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wide">{opt.title}</h5>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            val.active
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-800 text-slate-500 border border-slate-700"
                          }`}>
                            {val.active ? "Favorable" : "Neutral / Defer"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{opt.desc}</p>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-800/60 bg-slate-950/40 text-xs font-mono text-slate-300">
                        {val.timeframe}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
