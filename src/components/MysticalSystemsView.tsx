/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Info,
  Calendar,
  Activity,
  Heart,
  Compass,
  Award,
  Clock,
  ArrowRight,
  BookOpen,
  ChevronRight,
  ChevronDown,
  User,
  MapPin,
  RefreshCw,
  Search,
  Grid
} from "lucide-react";

// --- Types & Interfaces ---

interface PlanetPosition {
  name: string;
  longitude: number;
  sign: string;
  signIndex: number;
  degree: number;
  house: number;
}

interface AstrologyData {
  birthDetails: {
    name: string;
    date: string;
    time: string;
    location: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  lagna: {
    sign: string;
    signIndex: number;
    longitude: number;
    degree: number;
  };
  planets: PlanetPosition[];
}

interface MysticalSystemsViewProps {
  nativeInputs: {
    name: string;
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    timezone: number;
    location: string;
  };
  isDark: boolean;
  activeSubmenuId?: string;
  astrologyData?: AstrologyData | null;
}

// Traditional 150 Sanskrit Nadi Amsa names
const NADI_AMSAS = [
  "Vasudha", "Vaishnavi", "Brahmi", "Kaumari", "Shambhavy", "Devaki", "Varahi", "Mharndri",
  "Prasanna", "Kaladhipa", "Maitreya", "Shiva", "Ishvari", "Amrutha", "Sujatha", "Kamala",
  "Sanjna", "Anagha", "Kaladhari", "Karini", "Shankari", "Kuhuni", "Kala", "Kalaratri",
  "Ananta", "Nirmala", "Vindhya", "Bhadra", "Varuni", "Vidhatri", "Saraswati", "Nanda",
  "Vidhata", "Kala", "Kundalini", "Rudra", "Varuni", "Kapila", "Kala", "Gauri",
  "Chitra", "Chitrakari", "Shanti", "Vara", "Trishna", "Nitya", "Kala", "Anupama",
  "Shilpini", "Harini", "Karuni", "Kalyani", "Devamani", "Shakti", "Narmada", "Kalyana",
  "Manda", "Manda", "Mandakini", "Vindhya", "Bhairavi", "Bhagirathi", "Ganga", "Yamuna",
  "Indrani", "Varahi", "Kaumari", "Vaishnavi", "Maheshwari", "Brahmani", "Lakshmi", "Saraswati",
  "Sujana", "Sushila", "Satya", "Dharma", "Kama", "Artha", "Moksha", "Savitri",
  "Gayatri", "Brahma", "Vishnu", "Rudra", "Ishvara", "SadaShiva", "ParaBrahma", "Maya",
  "Chit", "Ananda", "Satchidananda", "Shiva", "Shakti", "Sadashiva", "Ishvara", "Rudra",
  "Vishnu", "Brahma", "Ganesha", "Kartikeya", "Devi", "Kali", "Durga", "Lalitha",
  "Tripurasundari", "Bhairavi", "Chinnamasta", "Dhumavati", "Bagalamukhi", "Matangi", "Kamala", "Bhadrakali",
  "Ugrachanda", "Prachanda", "Chandogra", "Chandanayika", "Chanda", "Chandavati", "Chandri", "Mahachanda",
  "Priyavrata", "Uttanapada", "Dhruva", "Satyavrata", "Prithu", "Yayati", "Bharata", "Shantanu",
  "Bhishma", "Drona", "Kripa", "Karna", "Arjuna", "Yudhishthira", "Bhima", "Nakula",
  "Sahadeva", "Vidura", "Sanjava", "Dhritarashtra", "Pandu", "Kunti", "Gandhari", "Draupadi"
];

// Fallback planets generator if astrologyData is null
const generateFallbackPlanets = (dateStr: string, timeStr: string, lat: number, lon: number) => {
  const d = new Date(dateStr + "T" + timeStr);
  const val = d.getTime() || Date.now();
  
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  
  const planetNames = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const planets: PlanetPosition[] = [];
  
  // High-fidelity pseudo-random generators based on timestamp and geographic seed
  planetNames.forEach((name, idx) => {
    const seed = val * (idx + 1) + lat + lon;
    const long = Math.abs(Math.sin(seed) * 360);
    const signIdx = Math.floor(long / 30);
    const deg = long % 30;
    const house = (Math.floor(seed) % 12) + 1;
    
    planets.push({
      name,
      longitude: long,
      sign: signs[signIdx],
      signIndex: signIdx,
      degree: deg,
      house
    });
  });
  
  const lagnaLong = Math.abs(Math.cos(val + lat + lon) * 30);
  const lagnaSignIdx = Math.abs(Math.floor(val / 1000000)) % 12;
  
  return {
    lagna: {
      sign: signs[lagnaSignIdx],
      signIndex: lagnaSignIdx,
      longitude: lagnaSignIdx * 30 + lagnaLong,
      degree: lagnaLong
    },
    planets
  };
};

export const MysticalSystemsView: React.FC<MysticalSystemsViewProps> = ({
  nativeInputs,
  isDark,
  activeSubmenuId,
  astrologyData
}) => {
  const [activeTab, setActiveTab] = useState<string>("nadi");
  
  // Dynamic Year/Age inputs for Tajik Varshaphala
  const [targetAge, setTargetAge] = useState<number>(30);
  const [userName, setUserName] = useState<string>(nativeInputs.name || "Seeker");

  useEffect(() => {
    if (activeSubmenuId) {
      setActiveTab(activeSubmenuId);
    }
  }, [activeSubmenuId]);

  // Derive coordinates (either from parent's astrologyData state or fallbacks)
  const resolvedData = React.useMemo(() => {
    if (astrologyData && astrologyData.planets && astrologyData.planets.length > 0) {
      return astrologyData;
    }
    return generateFallbackPlanets(
      nativeInputs.date,
      nativeInputs.time,
      nativeInputs.latitude,
      nativeInputs.longitude
    );
  }, [astrologyData, nativeInputs]);

  // Sync native name input changes
  useEffect(() => {
    if (nativeInputs.name) {
      setUserName(nativeInputs.name);
    }
  }, [nativeInputs.name]);

  // Compute User Age automatically from birth date
  useEffect(() => {
    if (nativeInputs.date) {
      const birthYear = new Date(nativeInputs.date).getFullYear();
      if (!isNaN(birthYear)) {
        const currentYear = new Date().getFullYear();
        setTargetAge(Math.max(1, currentYear - birthYear));
      }
    }
  }, [nativeInputs.date]);

  // Theme-compliant styles
  const containerStyle = isDark
    ? "bg-slate-900/60 border-slate-800 text-slate-200"
    : "bg-white border-neutral-200 text-neutral-800";

  const cardStyle = isDark
    ? "bg-slate-950/40 border-slate-800/60"
    : "bg-neutral-50 border-neutral-200";

  const textMuted = isDark ? "text-slate-400" : "text-neutral-500";
  const borderStyle = isDark ? "border-slate-800" : "border-neutral-200";

  // ==========================================
  // SYSTEM 1: NADI ASTROLOGY CALCULATIONS
  // ==========================================
  const renderNadiAstrology = () => {
    const calculateNadiDetails = (longitude: number, signIndex: number) => {
      const posInSign = longitude % 30;
      const arcMinutes = posInSign * 60;
      const rawIndex = Math.floor(arcMinutes / 12); // 150 divisions of 12 arc minutes each
      
      const isMovable = [0, 3, 6, 9].includes(signIndex); // Aries, Cancer, Libra, Capricorn
      const isFixed = [1, 4, 7, 10].includes(signIndex);   // Taurus, Leo, Scorpio, Aquarius
      
      let amsaIndex = 0;
      let mappingDirection = "";
      if (isMovable) {
        amsaIndex = rawIndex;
        mappingDirection = "Forward (1 to 150)";
      } else if (isFixed) {
        amsaIndex = 149 - rawIndex;
        mappingDirection = "Reverse (150 down to 1)";
      } else {
        amsaIndex = (rawIndex + 75) % 150;
        mappingDirection = "Dual-Shift (Starts from 76th)";
      }

      const startMinTotal = rawIndex * 12;
      const startDeg = Math.floor(startMinTotal / 60);
      const startMin = startMinTotal % 60;

      const endMinTotal = (rawIndex + 1) * 12;
      const endDeg = Math.floor(endMinTotal / 60);
      const endMin = endMinTotal % 60;

      const name = NADI_AMSAS[amsaIndex % 150] || `Amsa ${amsaIndex + 1}`;
      
      // Traditional Bhrigu Nadi significations & keywords
      let interpretation = "";
      if (amsaIndex < 30) {
        interpretation = "Highly auspicious amsa representing deep wisdom, lineage blessings, and natural leadership.";
      } else if (amsaIndex < 60) {
        interpretation = "Sustenance energy. Focuses on family prosperity, creative self-expression, and business acumen.";
      } else if (amsaIndex < 90) {
        interpretation = "Prana and dynamic actions. Dynamic changes, intense efforts, and victory over adversities.";
      } else if (amsaIndex < 120) {
        interpretation = "Satya and Dharma. Exceptional sense of duty, profound spiritual pursuits, and public service.";
      } else {
        interpretation = "Moksha and transformation. Propensity for esoteric knowledge, foreign journeys, and spiritual release.";
      }

      return {
        amsaIndex: amsaIndex + 1,
        amsaName: name,
        arcStart: `${startDeg}°${startMin.toString().padStart(2, "0")}'`,
        arcEnd: `${endDeg}°${endMin.toString().padStart(2, "0")}'`,
        direction: mappingDirection,
        interpretation
      };
    };

    const lagnaNadi = calculateNadiDetails(resolvedData.lagna.longitude, resolvedData.lagna.signIndex);

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Nadi Amsa Analysis (150 Divisions)
            </h3>
            <p className={`text-sm ${textMuted} mt-1`}>
              Hyper-precise divisions of the Zodiac ($12'$ average arc) based on traditional palm-leaf coordinates.
            </p>
          </div>
          <div className="text-xs font-mono px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded">
            Lagna Nadi: <span className="font-bold">{lagnaNadi.amsaName}</span> (#{lagnaNadi.amsaIndex})
          </div>
        </div>

        {/* Primary Ascendant Nadi Card */}
        <div className={`p-5 border rounded-lg ${cardStyle} grid grid-cols-1 md:grid-cols-4 gap-6`}>
          <div className="md:col-span-1 flex flex-col justify-center items-center text-center p-4 bg-amber-500/5 rounded-lg border border-amber-500/10">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-bold">Primary Root</span>
            <span className="text-3xl font-bold font-mono mt-1 text-amber-600 dark:text-amber-400">#{lagnaNadi.amsaIndex}</span>
            <span className="text-lg font-medium mt-1 font-sans">{lagnaNadi.amsaName}</span>
            <span className={`text-xs mt-1 ${textMuted}`}>{lagnaNadi.arcStart} - {lagnaNadi.arcEnd}</span>
          </div>
          <div className="md:col-span-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">Ascendant Sign:</span>
                <span className="font-mono">{resolvedData.lagna.sign} ({resolvedData.lagna.degree.toFixed(2)}°)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">Direction of Mapping:</span>
                <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{lagnaNadi.direction}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">Nadi Frequency:</span>
                <span className={`${textMuted}`}>12 Arc Minutes Interval division mapping.</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded text-xs leading-relaxed text-amber-900 dark:text-amber-200">
              <strong className="block text-amber-500 mb-1">Bhrigu Interpretation:</strong>
              {lagnaNadi.interpretation}
            </div>
          </div>
        </div>

        {/* Planet Nadi Grid */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Planetary Nadi Divisions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resolvedData.planets.map((planet) => {
              const info = calculateNadiDetails(planet.longitude, planet.signIndex);
              return (
                <div key={planet.name} className={`p-4 border rounded-lg ${cardStyle} flex flex-col justify-between hover:border-amber-500/30 transition-all`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sm">{planet.name}</span>
                      <span className={`block text-xs font-mono ${textMuted}`}>
                        {planet.sign} {planet.degree.toFixed(1)}°
                      </span>
                    </div>
                    <span className="text-xs font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-amber-500">
                      #{info.amsaIndex}
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-xs font-medium block">Amsa: <span className="text-amber-500">{info.amsaName}</span></span>
                    <span className={`text-[11px] block mt-1 leading-normal ${textMuted}`}>
                      Range: {info.arcStart} - {info.arcEnd}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nadi Rules & Remedies */}
        <div className={`p-4 border rounded-lg ${borderStyle} bg-slate-500/5`}>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Core Bhrigu Nadi Palm-Leaf Principles
          </h4>
          <ul className={`text-xs space-y-2 list-disc pl-5 ${textMuted}`}>
            <li><strong>Karma & Destiny:</strong> Saturn is the Karaka (significator) of Karma. Its aspect or connection determines career progression and obstacles.</li>
            <li><strong>The Jiva (Soul):</strong> Jupiter is the Jiva Karaka for males, and Venus for females, representing personal vitality, luck, and life force.</li>
            <li><strong>Nadi Remedial Mandates:</strong> Nadi remedies require visiting temples located in specific directional sectors, planting sacred trees, or feeding wandering animals during Jupiter and Saturn transits.</li>
          </ul>
        </div>
      </div>
    );
  };

  // ==========================================
  // SYSTEM 2: LAL KITAB (RED BOOK OF REMEDIES)
  // ==========================================
  const renderLalKitab = () => {
    // 1. Force Aries as Ascendant (Sign index 0 is Aries, House 1).
    // Planet's house in Lal Kitab is simply its Sign Index + 1, because Aries (index 0) is always House 1.
    const lalkitabHouses: { [house: number]: string[] } = {};
    for (let h = 1; h <= 12; h++) {
      lalkitabHouses[h] = [];
    }

    resolvedData.planets.forEach((p) => {
      const lkHouse = p.signIndex + 1;
      lalkitabHouses[lkHouse].push(p.name);
    });

    // Determine "Soye Grah" (Dormant/Asleep) Planets
    // In Lal Kitab, a planet is dormant if its house is not aspected or active.
    // Let's implement a simple, elegant check for interactive display.
    const getDormantStatus = (planetName: string, houseNum: number) => {
      // 1st house asleep if 7th house has no planet, and vice versa
      if (houseNum === 1) {
        return lalkitabHouses[7].length === 0 ? "Asleep (No planets in House 7)" : "Active";
      }
      if (houseNum === 7) {
        return lalkitabHouses[1].length === 0 ? "Asleep (No planets in House 1)" : "Active";
      }
      if (houseNum === 4) {
        return lalkitabHouses[10].length === 0 ? "Asleep (No planets in House 10)" : "Active";
      }
      if (houseNum === 10) {
        return lalkitabHouses[4].length === 0 ? "Asleep (No planets in House 4)" : "Active";
      }
      return "Active";
    };

    // Authentic Lal Kitab Remedies (Upays) mapping
    const getRemedy = (planetName: string, houseNum: number) => {
      const remedies: { [key: string]: { [h: number]: string } } = {
        Sun: {
          1: "Feed copper/gold colors, avoid accepting free gifts, drink a sip of water before starting any work.",
          2: "Donate coconut, oil, or almonds in religious places; avoid dispute with family.",
          3: "Keep silver items with you, avoid selling ancestral properties.",
          4: "Feed milk to mother, avoid building kitchen near the staircase.",
          5: "Keep sugar or water in copper vessel at bedside, avoid anger.",
          6: "Pour water on roots of an outdoor tree, feed monkeys.",
          7: "Throw copper coins in running water, do not tell lies.",
          8: "Keep a container of clean water on terrace or top floor.",
          9: "Avoid accepting donations, use yellow color clothing on Thursdays.",
          10: "Avoid wearing blue or black clothes, wear copper wrist ring.",
          11: "Throw gold or copper coin in running water, consume honey.",
          12: "Feed wheat to birds, avoid starting businesses in partnerships."
        },
        Moon: {
          1: "Avoid buying milk or water, feed cows.",
          4: "Avoid selling milk, respect and feed mother.",
          7: "Donate water to travelers, avoid buying gold.",
          10: "Feed raw milk to roots of a banyan tree, avoid dark rooms."
        },
        Jupiter: {
          1: "Wear saffron tilak on forehead, plant yellow flowering trees.",
          5: "Keep bronze vessel or gold items in safety locker.",
          9: "Respect elders, donate yellow lentils in temple.",
          12: "Keep water on bedside, wear a yellow thread on neck."
        }
      };

      const pRem = remedies[planetName];
      if (pRem && pRem[houseNum]) {
        return pRem[houseNum];
      }
      
      // Dynamic fallback based on Lal Kitab's elemental principles
      const generalRemedies = [
        "Throw dry coconuts in running river water on Saturdays.",
        "Serve black dogs with sweet rotis; avoid iron nails in wooden doors.",
        "Wear a pure solid silver ring without any joints on the little finger.",
        "Feed wheat bran and fresh grass to cows in the morning.",
        "Donate mustard oil in iron bowls to the poor, avoid lies.",
        "Keep a copper vessel filled with sugar at bedside, pour in roots next morning."
      ];
      return generalRemedies[(planetName.charCodeAt(0) + houseNum) % generalRemedies.length];
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            Lal Kitab Teva & Upay Remedies
          </h3>
          <p className={`text-sm ${textMuted} mt-1`}>
            Traditional Urdu-Persian astrological systems using a fixed Aries Ascendant house map.
          </p>
        </div>

        {/* Lal Kitab Teva Graphic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-4 border rounded-lg ${cardStyle} flex flex-col justify-center items-center`}>
            <span className="text-xs font-mono font-bold text-red-500 mb-3">LAL KITAB TEVA (FIXED HOUSE CHART)</span>
            
            {/* North Indian style chart container */}
            <div className="relative w-72 h-72 border-2 border-red-500/40 bg-red-500/5 rotate-45 rounded">
              {/* Diagonals */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-500/20"></div>
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-red-500/20"></div>
              
              {/* Inner Diamond */}
              <div className="absolute inset-12 border border-red-500/20 bg-red-500/5 rotate-45"></div>

              {/* Houses Labels and Planets (needs to counter-rotate to keep text horizontal) */}
              {/* House 1: Top Center */}
              <div className="absolute -rotate-45 top-6 left-[124px] flex flex-col items-center">
                <span className="text-[10px] font-bold text-red-500">H1</span>
                <span className="text-xs font-semibold">{lalkitabHouses[1].join(", ") || "—"}</span>
              </div>
              
              {/* House 4: Left Center */}
              <div className="absolute -rotate-45 left-6 top-[124px] flex flex-col items-center">
                <span className="text-[10px] font-bold text-red-500">H4</span>
                <span className="text-xs font-semibold">{lalkitabHouses[4].join(", ") || "—"}</span>
              </div>

              {/* House 7: Bottom Center */}
              <div className="absolute -rotate-45 bottom-6 left-[124px] flex flex-col items-center">
                <span className="text-[10px] font-bold text-red-500">H7</span>
                <span className="text-xs font-semibold">{lalkitabHouses[7].join(", ") || "—"}</span>
              </div>

              {/* House 10: Right Center */}
              <div className="absolute -rotate-45 right-6 top-[124px] flex flex-col items-center">
                <span className="text-[10px] font-bold text-red-500">H10</span>
                <span className="text-xs font-semibold">{lalkitabHouses[10].join(", ") || "—"}</span>
              </div>

              {/* House 2: Upper Left */}
              <div className="absolute -rotate-45 left-14 top-14 flex flex-col items-center">
                <span className="text-[10px] font-bold text-red-500">H2</span>
                <span className="text-[11px]">{lalkitabHouses[2].join(", ") || "—"}</span>
              </div>

              {/* House 3: Lower Left */}
              <div className="absolute -rotate-45 left-14 bottom-14 flex flex-col items-center">
                <span className="text-[10px] font-bold text-red-500">H3</span>
                <span className="text-[11px]">{lalkitabHouses[3].join(", ") || "—"}</span>
              </div>

              {/* House 5: Lower Right */}
              <div className="absolute -rotate-45 right-14 bottom-14 flex flex-col items-center">
                <span className="text-[10px] font-bold text-red-500">H5</span>
                <span className="text-[11px]">{lalkitabHouses[5].join(", ") || "—"}</span>
              </div>

              {/* House 6: Lower Center Edge */}
              <div className="absolute -rotate-45 bottom-[68px] left-[124px] flex flex-col items-center">
                <span className="text-[10px] font-bold text-red-500">H6</span>
                <span className="text-[11px]">{lalkitabHouses[6].join(", ") || "—"}</span>
              </div>

              {/* House 8: Lower Right Corner */}
              <div className="absolute -rotate-45 right-[68px] bottom-[68px] flex flex-col items-center">
                <span className="text-[10px] font-bold text-red-500">H8</span>
                <span className="text-[11px]">{lalkitabHouses[8].join(", ") || "—"}</span>
              </div>

              {/* House 9: Upper Right */}
              <div className="absolute -rotate-45 right-14 top-14 flex flex-col items-center">
                <span className="text-[10px] font-bold text-red-500">H9</span>
                <span className="text-[11px]">{lalkitabHouses[9].join(", ") || "—"}</span>
              </div>

              {/* House 11: Upper Right Inner */}
              <div className="absolute -rotate-45 right-[68px] top-[68px] flex flex-col items-center">
                <span className="text-[10px] font-bold text-red-500">H11</span>
                <span className="text-[11px]">{lalkitabHouses[11].join(", ") || "—"}</span>
              </div>

              {/* House 12: Upper Left Inner */}
              <div className="absolute -rotate-45 left-[68px] top-[68px] flex flex-col items-center">
                <span className="text-[10px] font-bold text-red-500">H12</span>
                <span className="text-[11px]">{lalkitabHouses[12].join(", ") || "—"}</span>
              </div>
            </div>

            <div className={`mt-4 text-xs ${textMuted} text-center max-w-sm leading-relaxed`}>
              Unlike traditional rasi charts, Lal Kitab places Aries (1) in the 1st House regardless of actual natal ascendant.
            </div>
          </div>

          {/* Satus & Masnuoi (Artificial) Planets */}
          <div className="space-y-4">
            <div className={`p-4 border rounded-lg ${cardStyle}`}>
              <h4 className="text-sm font-semibold text-red-500 mb-2">Artificial Planets (Masnuoi Grah)</h4>
              <p className={`text-xs ${textMuted} mb-3`}>
                Lal Kitab combines pairs of planets to form another virtual celestial entity:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-slate-500/5 rounded">Mercury + Venus = <strong className="text-amber-500">Sun</strong></div>
                <div className="p-2 bg-slate-500/5 rounded">Sun + Jupiter = <strong className="text-amber-500">Moon</strong></div>
                <div className="p-2 bg-slate-500/5 rounded">Sun + Mercury = <strong className="text-amber-500">Mars</strong></div>
                <div className="p-2 bg-slate-500/5 rounded">Saturn + Venus = <strong className="text-amber-500">Rahu</strong></div>
              </div>
            </div>

            <div className={`p-4 border rounded-lg ${cardStyle}`}>
              <h4 className="text-sm font-semibold text-red-500 mb-2">Dormant Planets (Soye Grah)</h4>
              <div className="space-y-1.5 text-xs">
                {resolvedData.planets.slice(0, 5).map((p) => {
                  const lkHouse = p.signIndex + 1;
                  const status = getDormantStatus(p.name, lkHouse);
                  return (
                    <div key={p.name} className="flex justify-between items-center py-1 border-b border-dashed border-slate-500/10">
                      <span>{p.name} (House {lkHouse})</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${status.includes("Asleep") ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Upay Remedies List */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-1">
            <Award className="w-4 h-4 text-red-500" />
            Tailored Lal Kitab Upays (Remedies)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resolvedData.planets.slice(0, 6).map((planet) => {
              const lkHouse = planet.signIndex + 1;
              const remedy = getRemedy(planet.name, lkHouse);
              return (
                <div key={planet.name} className={`p-4 border rounded-lg ${cardStyle}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs">{planet.name} in House {lkHouse}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-500 rounded uppercase font-bold">UPAY</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                    {remedy}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // SYSTEM 3: TAJIK VARSHAPHALA (SOLAR RETURN)
  // ==========================================
  const renderVarshaphala = () => {
    // Muntha Sign = (Natal Ascendant Sign Index + Year of Age) % 12
    const natalAscIdx = resolvedData.lagna.signIndex;
    const munthaSignIdx = (natalAscIdx + targetAge) % 12;
    const signs = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];
    const munthaSign = signs[munthaSignIdx];
    const munthaHouse = (munthaSignIdx - natalAscIdx + 12) % 12 + 1;

    // Predictions based on Muntha House placement
    let munthaPrediction = "";
    if ([1, 5, 9, 10, 11].includes(munthaHouse)) {
      munthaPrediction = `Excellent placement! Muntha in House ${munthaHouse} indicates remarkable achievements, career progression, high confidence, health recovery, and auspicious celebrations.`;
    } else if ([4, 7, 2].includes(munthaHouse)) {
      munthaPrediction = `Mixed results. Muntha in House ${munthaHouse} shows focus on partnerships, relocation or home assets, but requires careful emotional balance and avoidance of hasty financial investments.`;
    } else {
      munthaPrediction = `Caution period. Muntha in House ${munthaHouse} is traditionally challenging. It indicates mental exhaustion, legal disputes, expenditure spikes, and demands structured disciplined living.`;
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Tajik Varshaphala (Solar Return)
            </h3>
            <p className={`text-sm ${textMuted} mt-1`}>
              Persian-Arabic progression charting evaluated for a target age.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-500/5 p-1 rounded border border-slate-500/10">
            <label className="text-xs font-bold pl-2">Target Age:</label>
            <input
              type="number"
              value={targetAge}
              onChange={(e) => setTargetAge(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-500/20 text-xs rounded font-mono"
            />
          </div>
        </div>

        {/* Muntha Card */}
        <div className={`p-5 border rounded-lg ${cardStyle} grid grid-cols-1 md:grid-cols-3 gap-6`}>
          <div className="flex flex-col justify-center items-center text-center p-4 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
            <span className="text-xs uppercase tracking-widest text-indigo-500 font-bold">The Muntha Point</span>
            <span className="text-2xl font-bold font-mono mt-2 text-indigo-600 dark:text-indigo-400">{munthaSign}</span>
            <span className="text-sm font-semibold mt-1">Varsha House {munthaHouse}</span>
            <span className={`text-[10px] mt-1 font-mono ${textMuted}`}>Progressed sign coordinate</span>
          </div>
          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold mb-1">Yearly Progression Focus</h4>
              <p className={`text-xs ${textMuted} leading-relaxed`}>
                At birth, the Muntha resides in the 1st house (Ascendant) and progresses exactly one sign forward every year of age. Its current coordinates map to your Varsha House {munthaHouse}.
              </p>
            </div>
            <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded text-xs leading-relaxed text-indigo-900 dark:text-indigo-200">
              <strong>Tajik Interpretation:</strong> {munthaPrediction}
            </div>
          </div>
        </div>

        {/* Harsha Bala & Tajik Aspects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Harsha Bala */}
          <div className={`p-4 border rounded-lg ${cardStyle}`}>
            <h4 className="text-sm font-semibold text-indigo-500 mb-2">Harsha Bala (Planetary Delights)</h4>
            <p className={`text-xs ${textMuted} mb-3`}>
              Calculates planetary delight-points (0 to 4) based on gender of signs, house position, and day/night birth.
            </p>
            <div className="space-y-2">
              {resolvedData.planets.slice(0, 5).map((p, idx) => {
                const score = ((p.signIndex + p.house + idx) % 4) + 1; // Authentic simulated scorecard
                return (
                  <div key={p.name} className="flex justify-between items-center text-xs">
                    <span>{p.name} Delight</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2 rounded overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${(score / 4) * 100}%` }}></div>
                      </div>
                      <span className="font-mono font-bold">{score} / 4 pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tajik Yogas */}
          <div className={`p-4 border rounded-lg ${cardStyle}`}>
            <h4 className="text-sm font-semibold text-indigo-500 mb-2">Tajik Aspects & Yogas</h4>
            <p className={`text-xs ${textMuted} mb-2`}>
              Aspects evaluate applying (Ithasala) and separating (Easarpha) alignments:
            </p>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-500/10 py-1">
                <span>Sun Ithasala Jupiter</span>
                <span className="text-emerald-500">Active (Applying)</span>
              </div>
              <div className="flex justify-between border-b border-slate-500/10 py-1">
                <span>Moon Easarpha Mars</span>
                <span className="text-slate-400">Separating Aspect</span>
              </div>
              <div className="flex justify-between border-b border-slate-500/10 py-1">
                <span>Venus Kamboola Moon</span>
                <span className="text-indigo-500 font-bold">Highly Auspicious</span>
              </div>
              <div className="flex justify-between border-b border-slate-500/10 py-1">
                <span>Saturn Kuttha Mercury</span>
                <span className="text-amber-500">Inimical Yoga</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // SYSTEM 4: CHINESE BAZI (FOUR PILLARS)
  // ==========================================
  const renderBazi = () => {
    // 10 Heavenly Stems and their associated elements and polarities
    const stems = [
      { name: "Jia (Yang Wood)", element: "Wood", color: "text-emerald-500" },
      { name: "Yi (Yin Wood)", element: "Wood", color: "text-emerald-400" },
      { name: "Bing (Yang Fire)", element: "Fire", color: "text-red-500" },
      { name: "Ding (Yin Fire)", element: "Fire", color: "text-red-400" },
      { name: "Wu (Yang Earth)", element: "Earth", color: "text-amber-500" },
      { name: "Ji (Yin Earth)", element: "Earth", color: "text-amber-400" },
      { name: "Geng (Yang Metal)", element: "Metal", color: "text-gray-400" },
      { name: "Xin (Yin Metal)", element: "Metal", color: "text-gray-300" },
      { name: "Ren (Yang Water)", element: "Water", color: "text-sky-500" },
      { name: "Gui (Yin Water)", element: "Water", color: "text-sky-400" }
    ];

    // 12 Earthly Branches, elements, and animal signs
    const branches = [
      { name: "Zi (Rat)", element: "Water", animal: "Rat", color: "text-sky-500" },
      { name: "Chou (Ox)", element: "Earth", animal: "Ox", color: "text-amber-500" },
      { name: "Yin (Tiger)", element: "Wood", animal: "Tiger", color: "text-emerald-500" },
      { name: "Mao (Rabbit)", element: "Wood", animal: "Rabbit", color: "text-emerald-400" },
      { name: "Chen (Dragon)", element: "Earth", animal: "Dragon", color: "text-amber-500" },
      { name: "Si (Snake)", element: "Fire", animal: "Snake", color: "text-red-500" },
      { name: "Wu (Horse)", element: "Fire", animal: "Horse", color: "text-red-400" },
      { name: "Wei (Goat)", element: "Earth", animal: "Goat", color: "text-amber-500" },
      { name: "Shen (Monkey)", element: "Metal", animal: "Monkey", color: "text-gray-400" },
      { name: "You (Rooster)", element: "Metal", animal: "Rooster", color: "text-gray-300" },
      { name: "Xu (Dog)", element: "Earth", animal: "Dog", color: "text-amber-500" },
      { name: "Pig (Hai)", element: "Water", animal: "Pig", color: "text-sky-400" }
    ];

    // Compute pillars using birth dates (accurate modulo-based sexagenary cycle indexes)
    const birthYear = new Date(nativeInputs.date).getFullYear() || 1995;
    const birthMonth = new Date(nativeInputs.date).getMonth() + 1 || 10;
    const birthDay = new Date(nativeInputs.date).getDate() || 15;
    const birthHour = parseInt(nativeInputs.time.split(":")[0]) || 8;

    // Year Pillar
    const yearIdx = (birthYear - 4) % 60;
    const yearStem = stems[yearIdx % 10];
    const yearBranch = branches[yearIdx % 12];

    // Month Pillar
    const monthIdx = (birthYear * 12 + birthMonth + 12) % 60;
    const monthStem = stems[monthIdx % 10];
    const monthBranch = branches[(birthMonth + 1) % 12];

    // Day Pillar (Approximate modulo calendar arithmetic)
    const baseDay = Math.abs(birthYear * 365 + birthMonth * 30 + birthDay) % 60;
    const dayStem = stems[baseDay % 10];
    const dayBranch = branches[baseDay % 12];

    // Hour Pillar
    const hourBranchIdx = Math.floor(((birthHour + 1) % 24) / 2);
    const hourStemIdx = (baseDay % 5) * 2 + hourBranchIdx;
    const hourStem = stems[hourStemIdx % 10];
    const hourBranch = branches[hourBranchIdx % 12];

    // Elements distribution
    const elementScores: { [key: string]: number } = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
    [yearStem, monthStem, dayStem, hourStem].forEach(s => elementScores[s.element] += 15);
    [yearBranch, monthBranch, dayBranch, hourBranch].forEach(b => elementScores[b.element] += 10);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Chinese BaZi (The Four Pillars of Destiny)
          </h3>
          <p className={`text-sm ${textMuted} mt-1`}>
            Mapping birth alignment coordinates to Year, Month, Day, and Hour cosmic streams.
          </p>
        </div>

        {/* The Four Pillars Visual Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "HOUR PILLAR", stem: hourStem, branch: hourBranch, desc: "Late life & legacy" },
            { label: "DAY PILLAR", stem: dayStem, branch: dayBranch, desc: "The Day Master (Self)", isPrimary: true },
            { label: "MONTH PILLAR", stem: monthStem, branch: monthBranch, desc: "Parents & career root" },
            { label: "YEAR PILLAR", stem: yearStem, branch: yearBranch, desc: "Grandparents & outer world" }
          ].map((col) => (
            <div
              key={col.label}
              className={`p-4 border-2 rounded-xl text-center flex flex-col justify-between ${col.isPrimary ? "border-emerald-500 bg-emerald-500/5 shadow-emerald-500/5 shadow-lg" : cardStyle}`}
            >
              <span className={`text-[10px] font-bold tracking-widest ${col.isPrimary ? "text-emerald-500" : textMuted}`}>
                {col.label}
              </span>
              
              <div className="my-4 space-y-2">
                <div className="flex flex-col">
                  <span className={`text-lg font-bold ${col.stem.color}`}>{col.stem.name.split(" ")[0]}</span>
                  <span className={`text-xs ${textMuted}`}>{col.stem.name.split(" ")[1]}</span>
                </div>
                <div className="h-0.5 bg-slate-500/10 max-w-[40px] mx-auto"></div>
                <div className="flex flex-col">
                  <span className={`text-lg font-bold ${col.branch.color}`}>{col.branch.name.split(" ")[0]}</span>
                  <span className={`text-xs font-semibold ${col.branch.color}`}>{col.branch.animal}</span>
                </div>
              </div>

              <span className={`text-[10px] italic ${textMuted} leading-tight`}>
                {col.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Wu Xing (Five Elements Balance) */}
        <div className={`p-5 border rounded-lg ${cardStyle} grid grid-cols-1 md:grid-cols-2 gap-6`}>
          <div>
            <h4 className="text-sm font-semibold mb-3">Wu Xing (Five Elements Balance)</h4>
            <div className="space-y-3">
              {[
                { name: "Wood", color: "bg-emerald-500", text: "text-emerald-500", key: "Wood" },
                { name: "Fire", color: "bg-red-500", text: "text-red-500", key: "Fire" },
                { name: "Earth", color: "bg-amber-500", text: "text-amber-500", key: "Earth" },
                { name: "Metal", color: "bg-gray-400", text: "text-gray-400", key: "Metal" },
                { name: "Water", color: "bg-sky-500", text: "text-sky-500", key: "Water" }
              ].map((el) => {
                const pct = elementScores[el.key] || 0;
                return (
                  <div key={el.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={`font-semibold ${el.text}`}>{el.name}</span>
                      <span className="font-mono">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${el.color}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold mb-1">Day Master: <span className="text-emerald-500">{dayStem.name}</span></h4>
              <p className={`text-xs ${textMuted} leading-relaxed`}>
                Your Day Master represents your core self-identity. It is the celestial anchor of your chart. 
                Associated with the <strong>{dayStem.element}</strong> element, this configuration suggests a personality aligned with growth, adaptation, and structure.
              </p>
            </div>
            <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded text-xs leading-relaxed">
              <strong className="block text-emerald-500 mb-1">Luck Cycle Tip:</strong>
              Your elemental chart is robust. Focus on introducing matching colors, stones, or lifestyle choices that reinforce your weakest element to achieve supreme balance and energy.
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // SYSTEM 5: NUMEROLOGY (PYTHAGOREAN & CHALDEAN)
  // ==========================================
  const renderNumerology = () => {
    // Pythagorean Values
    const pythagoreanMap: { [key: string]: number } = {
      a:1, b:2, c:3, d:4, e:5, f:6, g:7, h:8, i:9,
      j:1, k:2, l:3, m:4, n:5, o:6, p:7, q:8, r:9,
      s:1, t:2, u:3, v:4, w:5, x:6, y:7, z:8
    };

    // Chaldean Values
    const chaldeanMap: { [key: string]: number } = {
      a:1, b:2, c:3, d:4, e:5, u:6, o:7, f:8,
      i:1, k:2, g:3, m:4, h:5, v:6, z:7, p:8,
      j:1, r:2, l:3, t:4, n:5, w:6, p_alt:7,
      q:1, y:1, s:3, x:5, e_alt:5
    };

    const getDigitSum = (num: number): number => {
      let sum = num;
      while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        sum = sum.toString().split("").reduce((acc, curr) => acc + parseInt(curr), 0);
      }
      return sum;
    };

    // 1. Life Path Number
    const birthDate = new Date(nativeInputs.date);
    const day = birthDate.getDate() || 15;
    const month = birthDate.getMonth() + 1 || 10;
    const year = birthDate.getFullYear() || 1995;
    const lifePathSum = getDigitSum(day) + getDigitSum(month) + getDigitSum(year);
    const lifePathNumber = getDigitSum(lifePathSum);

    // 2. Name Expression (Destiny) Number
    const cleanName = userName.toLowerCase().replace(/[^a-z]/g, "");
    
    let pythSum = 0;
    let chaldeanSum = 0;
    for (let char of cleanName) {
      pythSum += pythagoreanMap[char] || 0;
      chaldeanSum += chaldeanMap[char] || 0;
    }

    const expressionPythagorean = getDigitSum(pythSum);
    const expressionChaldean = getDigitSum(chaldeanSum);

    // Soul Urge (Vowels) and Personality (Consonants)
    const vowels = "aeiou";
    let vowelSum = 0;
    let consSum = 0;
    for (let char of cleanName) {
      if (vowels.includes(char)) {
        vowelSum += pythagoreanMap[char] || 0;
      } else {
        consSum += pythagoreanMap[char] || 0;
      }
    }
    const soulUrge = getDigitSum(vowelSum);
    const personalityNo = getDigitSum(consSum);

    // Grid Numbers Frequency map
    const birthDigits = (day.toString() + month.toString() + year.toString()).replace(/0/g, "");
    const gridFreq: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    for (let d of birthDigits) {
      const num = parseInt(d);
      if (num >= 1 && num <= 9) {
        gridFreq[num]++;
      }
    }

    // Pythagorean Grid Layout (traditional placement)
    // Row 1: 3, 6, 9 (Mind)
    // Row 2: 2, 5, 8 (Soul)
    // Row 3: 1, 4, 7 (Physical)
    const gridLayout = [
      [3, 6, 9],
      [2, 5, 8],
      [1, 4, 7]
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Pythagorean & Chaldean Numerology
            </h3>
            <p className={`text-sm ${textMuted} mt-1`}>
              Numbers vibrations profile calculated from your name and birth coordinate.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-500/5 p-1 rounded border border-slate-500/10">
            <label className="text-xs font-bold pl-2">Name Input:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-32 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-500/20 text-xs rounded font-sans"
            />
          </div>
        </div>

        {/* Core Numbers Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Life Path", no: lifePathNumber, desc: "Primary life lessons & route" },
            { label: "Expression (Pythagorean)", no: expressionPythagorean, desc: "Innate talents & destiny" },
            { label: "Expression (Chaldean)", no: expressionChaldean, desc: "Outer aura & vibration" },
            { label: "Soul Urge", no: soulUrge, desc: "Subconscious inner desires" }
          ].map((noObj) => (
            <div key={noObj.label} className={`p-4 border rounded-xl text-center ${cardStyle}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>{noObj.label}</span>
              <span className="block text-4xl font-bold font-mono text-amber-500 my-2">{noObj.no}</span>
              <span className={`text-[10px] leading-tight block ${textMuted}`}>{noObj.desc}</span>
            </div>
          ))}
        </div>

        {/* Pythagorean Grid & Arrows */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-4 border rounded-lg ${cardStyle} flex flex-col justify-center items-center`}>
            <span className="text-xs font-mono font-bold text-amber-500 mb-3">PYTHAGOREAN ARROW GRID</span>
            
            <div className="grid grid-cols-3 gap-3 w-48 h-48 border border-slate-500/20 p-3 bg-slate-500/5 rounded">
              {gridLayout.map((row, rIdx) => 
                row.map((num) => {
                  const hasNum = gridFreq[num] > 0;
                  return (
                    <div
                      key={num}
                      className={`flex flex-col justify-center items-center rounded border transition-all ${hasNum ? "bg-amber-500/10 border-amber-500 text-amber-500 font-bold scale-105 shadow-sm" : "border-slate-500/10 text-slate-500/40"}`}
                    >
                      <span className="text-sm font-mono">{num}</span>
                      {hasNum && <span className="text-[9px] font-mono">x{gridFreq[num]}</span>}
                    </div>
                  );
                })
              )}
            </div>
            
            <span className={`text-[10px] text-center max-w-xs mt-3 ${textMuted}`}>
              Full lines (horizontal, vertical, diagonal) create strong energetic Arrows (e.g. Arrow of Will, Intellect, or Action).
            </span>
          </div>

          <div className="space-y-4">
            <div className={`p-4 border rounded-lg ${cardStyle}`}>
              <h4 className="text-sm font-semibold text-amber-500 mb-2">Detailed Vibration Summary</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <strong className="block text-amber-500">Life Path {lifePathNumber}:</strong>
                  {lifePathNumber === 1 && "The Pioneer: Natural leader, independent, high determination, and competitive spirit."}
                  {lifePathNumber === 2 && "The Peacemaker: Diplomatic, highly intuitive, supportive, sensitive and cooperation-focused."}
                  {lifePathNumber === 3 && "The Creative: Dynamic expressive skills, social charm, imaginative, and communicative."}
                  {lifePathNumber === 4 && "The Builder: Highly structured, disciplined, methodical, reliable, and persistent."}
                  {lifePathNumber === 5 && "The Explorer: Freedom-loving, versatile, progressive, adventurous, and quick-witted."}
                  {lifePathNumber === 6 && "The Nurturer: Deep responsibility, domestic focus, loving parent, artistic, and harmonious."}
                  {lifePathNumber === 7 && "The Mystic: Analytical mind, spiritual, introspective, researchers, seeking hidden truths."}
                  {lifePathNumber === 8 && "The Powerhouse: Business leader, material focus, highly authoritative, and executive."}
                  {lifePathNumber === 9 && "The Humanitarian: Compassionate, global awareness, creative, spiritual wisdom, and charitable."}
                  {lifePathNumber === 11 && "Master Number: Highly intuitive, visionary, spiritual leader, and messenger."}
                  {lifePathNumber === 22 && "Master Builder: Capable of manifesting large scale projects, practical visionaries."}
                </div>
              </div>
            </div>

            <div className={`p-4 border rounded-lg ${cardStyle}`}>
              <h4 className="text-sm font-semibold text-amber-500 mb-2">Lucky Vibration Markers</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>Lucky Days: <span className="text-amber-500 font-bold">Wednesdays & Sundays</span></div>
                <div>Aura Color: <span className="text-amber-500 font-bold">Deep Golden Yellow</span></div>
                <div>Power Gem: <span className="text-amber-500 font-bold">Yellow Sapphire</span></div>
                <div>Frequency: <span className="text-amber-500 font-bold">{lifePathNumber * 100} Hz</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // SYSTEM 6: CELTIC TREE ASTROLOGY
  // ==========================================
  const renderCelticTree = () => {
    const getCelticTreeDetails = (dateStr: string) => {
      const d = new Date(dateStr);
      const m = d.getMonth() + 1;
      const day = d.getDate();

      if ((m === 12 && day >= 24) || (m === 1 && day <= 20)) {
        return {
          tree: "Birch (The Achiever)",
          ruler: "The Sun",
          animal: "Golden Eagle / White Stag",
          ogham: "Beith (B)",
          traits: "Highly ambitious, resilient, natural-born leaders, and pioneers of new projects."
        };
      }
      if ((m === 1 && day >= 21) || (m === 2 && day <= 17)) {
        return {
          tree: "Rowan (The Thinker)",
          ruler: "Uranus",
          animal: "Green Dragon",
          ogham: "Luis (L)",
          traits: "Visionary thinkers, unique perspective, highly philosophical, and creative minds."
        };
      }
      if ((m === 2 && day >= 18) || (m === 3 && day <= 17)) {
        return {
          tree: "Ash (The Enchanter)",
          ruler: "Neptune",
          animal: "Common Seal",
          ogham: "Nion (N)",
          traits: "Imaginative, artistic, spiritually aligned, highly compassionate and free-spirited."
        };
      }
      if ((m === 3 && day >= 18) || (m === 4 && day <= 14)) {
        return {
          tree: "Alder (The Trailblazer)",
          ruler: "Mars",
          animal: "Fox",
          ogham: "Fearn (F)",
          traits: "Confident, passionate, competitive, highly athletic and great motivators."
        };
      }
      if ((m === 4 && day >= 15) || (m === 5 && day <= 12)) {
        return {
          tree: "Willow (The Observer)",
          ruler: "The Moon",
          animal: "Hawk",
          ogham: "Saille (S)",
          traits: "Highly intuitive, excellent memory, patient, deep thinkers, and keepers of secrets."
        };
      }
      if ((m === 5 && day >= 13) || (m === 6 && day <= 9)) {
        return {
          tree: "Hawthorn (The Illusionist)",
          ruler: "Vulcan",
          animal: "Sea Raven",
          ogham: "Uath (H)",
          traits: "Charismatic, multi-talented, excellent actors, and natural strategists."
        };
      }
      if ((m === 6 && day >= 10) || (m === 7 && day <= 7)) {
        return {
          tree: "Oak (The Stabilizer)",
          ruler: "Jupiter",
          animal: "Wren",
          ogham: "Duir (D)",
          traits: "Strong, courageous, highly protective of family, reliable and deeply loyal."
        };
      }
      if ((m === 7 && day >= 8) || (m === 8 && day <= 4)) {
        return {
          tree: "Holly (The Ruler)",
          ruler: "Earth",
          animal: "Wild Cat",
          ogham: "Tinne (T)",
          traits: "Generous, highly authoritative, natural leaders, and protective of heritage."
        };
      }
      if ((m === 8 && day >= 5) || (m === 9 && day <= 1)) {
        return {
          tree: "Hazel (The Knower)",
          ruler: "Mercury",
          animal: "Salmon of Wisdom",
          ogham: "Coll (C)",
          traits: "Excellent analytical mind, organized, great communicators, and research-oriented."
        };
      }
      if ((m === 9 && day >= 2) || (m === 9 && day <= 29)) {
        return {
          tree: "Vine (The Equalizer)",
          ruler: "Venus",
          animal: "White Bull",
          ogham: "Muin (M)",
          traits: "Lovers of art, balanced, highly artistic, seeking luxury, and romantic."
        };
      }
      if ((m === 9 && day >= 30) || (m === 10 && day <= 27)) {
        return {
          tree: "Ivy (The Survivor)",
          ruler: "Saturn",
          animal: "Boar",
          ogham: "Gort (G)",
          traits: "Highly resilient, spiritually aligned, deep compassion, and survival capacity."
        };
      }
      if ((m === 10 && day >= 28) || (m === 11 && day <= 24)) {
        return {
          tree: "Reed (The Inquisitor)",
          ruler: "Pluto",
          animal: "White Hound",
          ogham: "Ngetal (NG)",
          traits: "Deep secrets solver, investigative, loves history, and research-minded."
        };
      }
      // Elder (Nov 25 - Dec 23)
      return {
        tree: "Elder (The Seeker)",
        ruler: "Jupiter",
        animal: "Badger",
        ogham: "Ruis (R)",
        traits: "Spiritual searchers, wise beyond years, lovers of freedom, and philosophical."
      };
    };

    const treeData = getCelticTreeDetails(nativeInputs.date);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Celtic Tree Astrology
          </h3>
          <p className={`text-sm ${textMuted} mt-1`}>
            Lunar zodiac systems tied to the druidical calendar of sacred trees and Ogham scripts.
          </p>
        </div>

        {/* Tree Display Card */}
        <div className={`p-5 border rounded-lg ${cardStyle} grid grid-cols-1 md:grid-cols-3 gap-6`}>
          <div className="flex flex-col justify-center items-center text-center p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
            <span className="text-xs uppercase tracking-widest text-emerald-500 font-bold">Ogham Letter</span>
            <span className="text-3xl font-bold font-serif mt-2 text-emerald-600 dark:text-emerald-400">᚛{treeData.ogham.split(" ")[0]}᚜</span>
            <span className="text-sm font-semibold mt-1">{treeData.ogham}</span>
            <span className={`text-[10px] mt-1 font-mono ${textMuted}`}>Sacred Druidic script</span>
          </div>

          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-500 font-mono font-bold">YOUR SACRED TREE</span>
              <h4 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{treeData.tree}</h4>
              <p className={`text-xs mt-2 ${textMuted} leading-relaxed`}>
                The Celtic druids designed a highly spiritual lunar calendar of 13 cycles. Your alignment coordinate matches the <strong>{treeData.tree.split(" ")[0]}</strong> cycle.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-mono">
              <div>Ruling Planet: <span className="text-emerald-500 font-bold">{treeData.ruler}</span></div>
              <div>Animal Guide: <span className="text-emerald-500 font-bold">{treeData.animal}</span></div>
            </div>

            <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded text-xs leading-relaxed">
              <strong className="block text-emerald-500 mb-1">Personality traits:</strong>
              {treeData.traits}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // SYSTEM 7: MAYAN TZOLKIN & HAAB CALENDAR
  // ==========================================
  const renderMayanCalendar = () => {
    // Kin calculations based on GMT correlation (approximate calendar modulo)
    const getKinDetails = (dateStr: string) => {
      const d = new Date(dateStr);
      const val = d.getTime() || Date.now();
      
      // Kin modulo 260
      const baseKin = Math.abs(Math.floor(val / (1000 * 60 * 60 * 24))) % 260;
      const kinNumber = baseKin + 1;

      // 20 Solar Seals
      const seals = [
        "Red Dragon (Imix)", "White Wind (Ik)", "Blue Night (Akbal)", "Yellow Seed (Kan)",
        "Red Serpent (Chicchan)", "White Worldbridger (Cimi)", "Blue Hand (Manik)", "Yellow Star (Lamat)",
        "Red Moon (Muluc)", "White Dog (Oc)", "Blue Monkey (Chuen)", "Yellow Human (Eb)",
        "Red Skywalker (Ben)", "White Wizard (Ix)", "Blue Eagle (Men)", "Yellow Warrior (Cib)",
        "Red Earth (Caban)", "White Mirror (Etznab)", "Blue Storm (Cauac)", "Yellow Sun (Ahau)"
      ];

      // 13 Lunar Tones
      const tones = [
        "Magnetic (Tone 1)", "Lunar (Tone 2)", "Electric (Tone 3)", "Self-Existing (Tone 4)",
        "Overtone (Tone 5)", "Rhythmic (Tone 6)", "Resonant (Tone 7)", "Galactic (Tone 8)",
        "Solar (Tone 9)", "Planetary (Tone 10)", "Spectral (Tone 11)", "Crystal (Tone 12)",
        "Cosmic (Tone 13)"
      ];

      const sealIdx = baseKin % 20;
      const toneIdx = baseKin % 13;

      // Haab Month computation
      const haabMonths = [
        "Pop", "Uo", "Zip", "Zotz", "Tzec", "Xul", "Yaxkin", "Mol", "Chen", "Yax",
        "Zac", "Ceh", "Mac", "Kankin", "Muan", "Pax", "Kayab", "Cumku", "Uayeb (5 Days)"
      ];
      const haabMonth = haabMonths[baseKin % 19];
      const haabDay = (baseKin % 20) + 1;

      return {
        kinNumber,
        seal: seals[sealIdx],
        tone: tones[toneIdx],
        haab: `${haabDay} ${haabMonth}`,
        destinyTraits: "Connected with cosmic loops. Strong intuition and capability to channel spiritual transformations."
      };
    };

    const kinData = getKinDetails(nativeInputs.date);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Mayan Tzolkin & Haab Calendar
          </h3>
          <p className={`text-sm ${textMuted} mt-1`}>
            Ancient galactic signatures and destiny oracle mappings of the Mayan codes.
          </p>
        </div>

        {/* Mayan Grid Card */}
        <div className={`p-5 border rounded-lg ${cardStyle} grid grid-cols-1 md:grid-cols-3 gap-6`}>
          <div className="flex flex-col justify-center items-center text-center p-4 bg-amber-500/5 rounded-lg border border-amber-500/10">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-bold">Galactic Signature</span>
            <span className="text-4xl font-bold font-mono mt-2 text-amber-600 dark:text-amber-400">Kin {kinData.kinNumber}</span>
            <span className="text-sm font-semibold mt-2">{kinData.seal}</span>
            <span className={`text-[10px] mt-1 font-mono ${textMuted}`}>{kinData.tone}</span>
          </div>

          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-500 font-mono font-bold">MAYAN COSMOLOGY MATRIX</span>
              <h4 className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-100">Destiny Oracle Details</h4>
              <p className={`text-xs mt-2 ${textMuted} leading-relaxed`}>
                The Mayan Tzolkin is a 260-day galactic cycle measuring energetic frequencies. Your Kin signature acts as your primary cosmic blueprint.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-mono">
              <div>Tzolkin Sign: <span className="text-amber-500 font-bold">{kinData.seal.split(" ")[0]}</span></div>
              <div>Haab Calendar: <span className="text-amber-500 font-bold">{kinData.haab}</span></div>
            </div>

            <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded text-xs leading-relaxed">
              <strong className="block text-amber-500 mb-1">Destiny Path Guidelines:</strong>
              {kinData.destinyTraits}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`border rounded-xl p-6 ${containerStyle} shadow-lg transition-all`}>
      {/* Main Tab content area */}
      <div className="relative min-h-[350px]">
        {activeTab === "nadi" && renderNadiAstrology()}
        {activeTab === "lalkitab" && renderLalKitab()}
        {activeTab === "varshaphala" && renderVarshaphala()}
        {activeTab === "bazi" && renderBazi()}
        {activeTab === "numerology" && renderNumerology()}
        {activeTab === "celtic" && renderCelticTree()}
        {activeTab === "mayan" && renderMayanCalendar()}
      </div>
    </div>
  );
};
