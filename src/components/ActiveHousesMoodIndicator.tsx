import React, { useState, useMemo, useEffect } from "react";
import { 
  Sparkles, 
  Layers, 
  Activity, 
  Compass, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Zap, 
  ChevronRight, 
  X,
  Flame,
  Brain,
  TrendingUp,
  Heart,
  Briefcase,
  Coins,
  Home,
  GraduationCap,
  Scale,
  Globe,
  UserCheck
} from "lucide-react";
import { runNJEngine, NJEngineResult, NJForecastDay } from "../lib/njEngine";
import { mapAstrologyDataToUserProfileJSON } from "../lib/jhoraMapper";

interface ActiveHousesMoodIndicatorProps {
  astrologyData: any;
  isDark?: boolean;
  predictionDate?: string;
  selectedTheme?: string;
}

const THEME_HOUSE_MAP: Record<string, number[]> = {
  foreign_travel_settlement: [3, 9, 12],
  career_promotion: [2, 6, 10, 11],
  finance_wealth: [2, 5, 11],
  marriage_first: [2, 7, 11],
  health_disease: [1, 5, 6, 12],
  property_vehicle: [4, 11, 12],
  litigation: [6, 8, 12],
  education: [4, 9, 11],
  daily_mood_prediction: [1, 3, 4, 5, 6, 12],
};

// House Significations catalog & life themes in KP Astrology
const HOUSE_CATALOG: Array<{
  number: number;
  name: string;
  sanskritName: string;
  category: "Personal" | "Wealth" | "Action" | "Domestic" | "Intellect" | "Routine" | "Partner" | "Research" | "Fortune" | "Status" | "Gains" | "Rest";
  primaryTheme: string;
  keywords: string[];
  icon: any;
  description: string;
  positiveImpact: string;
  challengingImpact: string;
  kpCombinations: Array<{ combo: string; meaning: string }>;
}> = [
  {
    number: 1,
    name: "Self & Vitality",
    sanskritName: "Lagna / Tanu Bhava",
    category: "Personal",
    primaryTheme: "Physical Body, Mindstate, Overall Direction & Character",
    keywords: ["Vitality", "Personality", "Self-Expression", "Health", "Initiative"],
    icon: UserCheck,
    description: "Governs bodily constitution, personal confidence, mental outlook, and daily stamina.",
    positiveImpact: "Strong personal drive, clear self-expression, and physical vitality.",
    challengingImpact: "Self-absorption, bodily fatigue, or over-assertiveness.",
    kpCombinations: [
      { combo: "1 + 6 + 11", meaning: "Victory in personal endeavors and competitive success." },
      { combo: "1 + 5 + 11", meaning: "High physical recovery, mental sharpness, and vitality." }
    ]
  },
  {
    number: 2,
    name: "Wealth & Family",
    sanskritName: "Dhana Bhava",
    category: "Wealth",
    primaryTheme: "Liquid Wealth, Immediate Family, Speech & Food",
    keywords: ["Liquid Funds", "Family Income", "Speech", "Bank Balance", "Values"],
    icon: Coins,
    description: "Controls accumulated monetary reserves, family cohesion, vocal tone, and financial security.",
    positiveImpact: "Flow of funds, harmonious family discussions, and stable savings.",
    challengingImpact: "Unexpected expenses, sharp speech, or domestic financial debates.",
    kpCombinations: [
      { combo: "2 + 6 + 11", meaning: "Major liquid wealth inflow and salary appreciation." },
      { combo: "2 + 7 + 11", meaning: "Family approval for union and partnership wealth." }
    ]
  },
  {
    number: 3,
    name: "Communication & Courage",
    sanskritName: "Sahaja Bhava",
    category: "Action",
    primaryTheme: "Courage, Short Journeys, Documentation & Siblings",
    keywords: ["Documentation", "Negotiations", "Short Travel", "Courage", "Writing"],
    icon: Activity,
    description: "Governs mental drive, communication channels, travel, contracts, and sibling relationships.",
    positiveImpact: "Excellent analytical writing, persuasive speech, and clear agreements.",
    challengingImpact: "Restlessness, minor miscommunications, or travel fatigue.",
    kpCombinations: [
      { combo: "3 + 9 + 12", meaning: "Short to long distance travel and foreign connection." },
      { combo: "3 + 10", meaning: "Strategic professional proposals and key contracts." }
    ]
  },
  {
    number: 4,
    name: "Domestic Peace & Property",
    sanskritName: "Sukha Bhava",
    category: "Domestic",
    primaryTheme: "Home Environment, Mother, Property, Vehicle & Rest",
    keywords: ["Home Comfort", "Property", "Vehicle", "Mother", "Emotional Rest"],
    icon: Home,
    description: "Controls emotional foundation, residential peace, real estate holdings, and maternal ties.",
    positiveImpact: "Peaceful domestic atmosphere, property gains, and physical comfort.",
    challengingImpact: "Domestic pressure, family responsibilities, or lack of solitude.",
    kpCombinations: [
      { combo: "4 + 11 + 2", meaning: "Acquisition of fixed assets, land, or vehicles." },
      { combo: "4 + 12", meaning: "Strong need for solitude at home and deep rest." }
    ]
  },
  {
    number: 5,
    name: "Intellect & Creativity",
    sanskritName: "Putra Bhava",
    category: "Intellect",
    primaryTheme: "Speculation, Intelligence, Romance, Children & Wisdom",
    keywords: ["Intelligence", "Creativity", "Speculation", "Children", "Romance"],
    icon: Brain,
    description: "Governs creative spark, strategic thinking, romantic affection, and speculative intelligence.",
    positiveImpact: "Creative breakthroughs, pleasant affection, and analytical insights.",
    challengingImpact: "Over-speculation, emotional sensitivity, or mental distraction.",
    kpCombinations: [
      { combo: "5 + 9 + 11", meaning: "Academic distinction, high concept absorption, and artistic success." },
      { combo: "5 + 7 + 11", meaning: "Deep romantic alignment and emotional warmth." }
    ]
  },
  {
    number: 6,
    name: "Routine & Competitive Edge",
    sanskritName: "Shatru / Roga Bhava",
    category: "Routine",
    primaryTheme: "Daily Work, Service, Health Defense, Debts & Competition",
    keywords: ["Daily Work", "Service", "Competitive Edge", "Health Defense", "Debt Recovery"],
    icon: Scale,
    description: "Controls work execution, overcoming opposition, clearing pending tasks, and metabolic health.",
    positiveImpact: "Strong work output, dominance in competition, and resolving pending tasks.",
    challengingImpact: "Workplace fatigue, stress from debts, or health friction.",
    kpCombinations: [
      { combo: "1 + 6 + 11", meaning: "Victory in litigation, disputes, and competitive exams." },
      { combo: "6 + 11", meaning: "Recovery of pending dues and clearing operational bottlenecks." }
    ]
  },
  {
    number: 7,
    name: "Partnerships & Unions",
    sanskritName: "Yuvati Bhava",
    category: "Partner",
    primaryTheme: "Spouse, Business Partners, Client Relations & Public",
    keywords: ["Partnerships", "Spouse", "Client Relations", "Public Interaction", "Contracts"],
    icon: Heart,
    description: "Governs marriage, business alliances, client interactions, and interpersonal harmony.",
    positiveImpact: "Smooth negotiations, supportive partner conversations, and commercial alliances.",
    challengingImpact: "Minor friction with partners, sensitivity, or opposing viewpoints.",
    kpCombinations: [
      { combo: "2 + 7 + 11", meaning: "Marital harmony, family consensus, and union." },
      { combo: "7 + 10 + 11", meaning: "Profitable business partnerships and client growth." }
    ]
  },
  {
    number: 8,
    name: "Research & Subconscious Transformation",
    sanskritName: "Randhra Bhava",
    category: "Research",
    primaryTheme: "Deep Research, Confidential Work, Unearned Gains & Introspection",
    keywords: ["Research", "Confidential Work", "Introspection", "Sudden Gains", "Transformation"],
    icon: ShieldAlert,
    description: "Controls hidden knowledge, confidential analysis, sudden developments, and deep introspection.",
    positiveImpact: "Deep analytical discoveries, secret problem solving, and unexpected insights.",
    challengingImpact: "Mental anxiety, unexpected delays, or temporary exhaustion.",
    kpCombinations: [
      { combo: "3 + 8", meaning: "Deep confidential research and analytical problem-solving." },
      { combo: "8 + 11 + 2", meaning: "Sudden unearned financial gain or insurance/tax recovery." }
    ]
  },
  {
    number: 9,
    name: "Higher Wisdom & Fortune",
    sanskritName: "Dharma Bhava",
    category: "Fortune",
    primaryTheme: "Higher Knowledge, Long Travel, Father, Guru & Philosophy",
    keywords: ["Higher Learning", "Long Travel", "Wisdom", "Fortune", "Mentorship"],
    icon: Globe,
    description: "Governs spiritual alignment, higher education, long-distance travel, and luck.",
    positiveImpact: "Spiritual clarity, long travel opportunities, and guidance from mentors.",
    challengingImpact: "Ideological debates, distance from home, or philosophical doubt.",
    kpCombinations: [
      { combo: "9 + 11 + 4", meaning: "Academic distinction in higher education and degrees." },
      { combo: "3 + 9 + 12", meaning: "International journey, foreign stays, and overseas settlement." }
    ]
  },
  {
    number: 10,
    name: "Career & Executive Status",
    sanskritName: "Karma Bhava",
    category: "Status",
    primaryTheme: "Profession, Executive Status, Public Authority & Karma",
    keywords: ["Career", "Executive Status", "Authority", "Recognition", "Leadership"],
    icon: Briefcase,
    description: "Controls professional elevation, career achievements, public authority, and core responsibilities.",
    positiveImpact: "Recognition by leadership, promotional opportunities, and career authority.",
    challengingImpact: "Heavy work burden, high expectations, or authority pressure.",
    kpCombinations: [
      { combo: "2 + 6 + 10 + 11", meaning: "Executive promotion, authority boost, and salary hike." },
      { combo: "10 + 11", meaning: "Professional success, status elevation, and goal fulfillment." }
    ]
  },
  {
    number: 11,
    name: "Gains & Wish Fulfillment",
    sanskritName: "Labha Bhava",
    category: "Gains",
    primaryTheme: "Gains, Desire Fulfillment, Social Networks & Victory",
    keywords: ["Wish Fulfillment", "Gains", "Networks", "Success", "Profit"],
    icon: TrendingUp,
    description: "Governs achievement of goals, financial profits, supportive social circles, and overall victory.",
    positiveImpact: "Fulfillment of desires, financial inflows, and validation of efforts.",
    challengingImpact: "Over-extension in social circles or delayed gratification.",
    kpCombinations: [
      { combo: "1 + 2 + 6 + 11", meaning: "Complete monetary and operational victory across all domains." },
      { combo: "5 + 11", meaning: "Success in creative, intellectual, or speculative pursuits." }
    ]
  },
  {
    number: 12,
    name: "Rest, Solitude & Foreign Connections",
    sanskritName: "Vyaya Bhava",
    category: "Rest",
    primaryTheme: "Rest, Solitude, Subconscious Mind, Foreign Stay & Investments",
    keywords: ["Solitude", "Rest", "Subconscious", "Foreign Land", "Expenditure"],
    icon: Compass,
    description: "Controls quiet rest, internal reflection, foreign travels, subconscious processing, and expenditures.",
    positiveImpact: "Peaceful sleep, spiritual solitude, overseas gains, and deep rejuvenation.",
    challengingImpact: "Unplanned expenses, physical fatigue, or mental overthinking.",
    kpCombinations: [
      { combo: "4 + 12", meaning: "Quiet retreat at home, rest, and domestic isolation." },
      { combo: "9 + 12 + 11", meaning: "Foreign residence, overseas projects, and distant gains." }
    ]
  }
];

export const ActiveHousesMoodIndicator: React.FC<ActiveHousesMoodIndicatorProps> = ({
  astrologyData,
  isDark = true,
  predictionDate,
  selectedTheme
}) => {
  const [activeHouseModal, setActiveHouseModal] = useState<number | null>(null);
  const [refreshTick, setRefreshTick] = useState<number>(0);
  const [lastAutoUpdate, setLastAutoUpdate] = useState<string>(new Date().toLocaleTimeString());

  // Automatic Transit & Sub-Lord Watcher Agent (refreshes calculations every 15s or on transit/storage events)
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTick((prev) => prev + 1);
      setLastAutoUpdate(new Date().toLocaleTimeString());
    }, 15000);

    const handleStorageOrFocus = () => {
      setRefreshTick((prev) => prev + 1);
      setLastAutoUpdate(new Date().toLocaleTimeString());
    };

    window.addEventListener("focus", handleStorageOrFocus);
    window.addEventListener("storage", handleStorageOrFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleStorageOrFocus);
      window.removeEventListener("storage", handleStorageOrFocus);
    };
  }, []);

  const effectiveDate = useMemo(() => {
    if (predictionDate) return predictionDate;
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, [predictionDate]);

  // Map user profile JSON
  const mappedProfile = useMemo(() => {
    if (!astrologyData) return null;
    try {
      return mapAstrologyDataToUserProfileJSON(null, astrologyData);
    } catch (e) {
      console.error("Error mapping profile in ActiveHousesMoodIndicator:", e);
      return null;
    }
  }, [astrologyData, refreshTick]);

  // Run NJ Engine to calculate 7-Layer Mood Stack house frequencies & ranks
  const njResult = useMemo<NJEngineResult | null>(() => {
    if (!astrologyData) return null;
    try {
      return runNJEngine(effectiveDate, astrologyData, mappedProfile);
    } catch (e) {
      console.error("Error running NJ Engine in ActiveHousesMoodIndicator:", e);
      return null;
    }
  }, [effectiveDate, astrologyData, mappedProfile, refreshTick]);

  // Extract active day forecast
  const activeDay = useMemo<NJForecastDay | null>(() => {
    if (!njResult || !njResult.forecastDays || njResult.forecastDays.length === 0) return null;
    return njResult.forecastDays[0];
  }, [njResult]);

  // Merge house frequencies and rank classifications with static catalog
  const housesWithScores = useMemo(() => {
    const freqs = activeDay?.houseFrequencies || {};
    const ranks = activeDay?.houseRanks || [];

    return HOUSE_CATALOG.map((house) => {
      const freqScore = freqs[house.number] || 0;
      const rankInfo = ranks.find(r => r.house === house.number);
      
      let activationLevel: "CORE" | "SUPPORTING" | "PASSIVE" = "PASSIVE";
      if (rankInfo?.category === "Core" || freqScore >= 3) {
        activationLevel = "CORE";
      } else if (rankInfo?.category === "Supporting" || freqScore >= 1) {
        activationLevel = "SUPPORTING";
      } else {
        activationLevel = "PASSIVE";
      }

      // Determine activating drivers from 7-Layer Mood Stack
      const drivers: string[] = [];
      if (activeDay) {
        if (house.number === 1 || house.number === 10) drivers.push(`MD: ${njResult?.staticMetadata?.dbaActive?.split('-')?.[0] || 'Active Dasha'}`);
        if (house.number === 4 || house.number === 12) drivers.push(`Moon Star: ${activeDay.starLord}`);
        if (house.number === 2 || house.number === 11) drivers.push(`Moon Sub: ${activeDay.subLord}`);
        if (house.number === 3 || house.number === 6 || house.number === 7) drivers.push(`Moon Sign: ${activeDay.moonSign}`);
        if (drivers.length === 0) drivers.push(`KP CSL: ${activeDay.coreTriggerPlanet || 'Mercury'}`);
      } else {
        drivers.push("7-Layer Stack Alignment");
      }

      return {
        ...house,
        score: freqScore,
        activationLevel,
        drivers
      };
    });
  }, [activeDay, njResult]);

  // Core Active Houses Count
  const coreActiveCount = useMemo(() => {
    return housesWithScores.filter(h => h.activationLevel === "CORE").length;
  }, [housesWithScores]);

  const supportingActiveCount = useMemo(() => {
    return housesWithScores.filter(h => h.activationLevel === "SUPPORTING").length;
  }, [housesWithScores]);

  const isMainAskMe = !selectedTheme || selectedTheme === "ask_me";

  // Filtered houses: If a specific theme is selected, show that theme's houses (showing Active or Passive).
  // On main Ask Me (no theme or "ask_me"), show active houses (or all 12 sorted by score).
  const filteredHouses = useMemo(() => {
    if (selectedTheme && selectedTheme !== "ask_me" && THEME_HOUSE_MAP[selectedTheme]) {
      const themeHouses = THEME_HOUSE_MAP[selectedTheme];
      return housesWithScores.filter(h => themeHouses.includes(h.number));
    }
    const activeOnly = housesWithScores.filter(h => h.activationLevel === "CORE" || h.activationLevel === "SUPPORTING");
    if (activeOnly.length > 0) return activeOnly;
    return [...housesWithScores].sort((a, b) => b.score - a.score);
  }, [housesWithScores, selectedTheme]);

  const selectedHouseDetail = useMemo(() => {
    if (activeHouseModal === null) return null;
    return housesWithScores.find(h => h.number === activeHouseModal) || null;
  }, [activeHouseModal, housesWithScores]);

  // Calculation of Supporting & Challenging Planets + Reasons
  const planetaryCalculationCard = useMemo(() => {
    if (!activeDay) return null;

    // Supporting Planets from convergence layers & active lords
    const supportingPlanetsRaw = [
      ...(activeDay.convergencePlanets || []),
      activeDay.starLord,
      activeDay.subLord,
      activeDay.coreTriggerPlanet
    ].filter(Boolean);
    const supportingPlanets = Array.from(new Set(supportingPlanetsRaw));

    // DBA active string
    const rawDba = njResult?.staticMetadata?.dbaActive || "Mercury - Saturn - Mercury - Moon - Mars";
    const dbaCleanParts = rawDba.split("-").map(s => s.trim()).filter(s => s && s !== "null" && s !== "undefined");
    const dbaActiveStr = dbaCleanParts.length > 0 ? dbaCleanParts.join(" - ") : "Mercury - Saturn - Mercury - Moon - Mars";

    // Challenging Planets from discarded or obstructing influences
    const allPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    const discarded = activeDay.discardedPlanets && activeDay.discardedPlanets.length > 0 
      ? activeDay.discardedPlanets 
      : allPlanets.filter(p => !supportingPlanets.includes(p));

    const naturalMalefics = ["Saturn", "Rahu", "Ketu", "Mars"];
    const challengingPlanetsRaw = discarded.filter(p => naturalMalefics.includes(p) || !supportingPlanets.includes(p));
    const challengingPlanets = Array.from(new Set(challengingPlanetsRaw.length > 0 ? challengingPlanetsRaw : ["Saturn", "Rahu", "Ketu"]));

    // Active Core Houses for positive reasons
    const activeCoreHousesList = housesWithScores
      .filter(h => h.activationLevel === "CORE")
      .map(h => `House ${h.number} (${h.name})`);

    const positiveReasons = [
      `Active Dasha Lords [${dbaActiveStr}] activating core houses: ${activeCoreHousesList.slice(0, 2).join(" & ") || "House 1 & 10"}.`,
      `Transit Moon in Nakshatra under Star Lord ${activeDay.starLord} and Sub Lord ${activeDay.subLord} delivering focus and clarity.`,
      `Strong 7-layer convergence alignment across ${supportingPlanets.slice(0, 3).join(", ")} providing favorable execution energy.`,
      `Primary Daily Theme: ${activeDay.primaryTheme} activated with high probability.`
    ];

    const passiveOrObstructing = housesWithScores
      .filter(h => h.number === 6 || h.number === 8 || h.number === 12)
      .filter(h => h.score > 0)
      .map(h => `House ${h.number}`);

    const negativeReasons = [
      `Challenging planetary friction from ${challengingPlanets.slice(0, 3).join(", ")} requires steady routine discipline to avoid mild fatigue.`,
      passiveOrObstructing.length > 0 
        ? `Obstructing background house activity in ${passiveOrObstructing.join(", ")} suggests pacing commitments & avoiding unnecessary friction.`
        : `Background house energies suggest pacing daily commitments and seeking quiet rest.`,
      `Energy levels require steady pacing across intense analytical or physical tasks.`
    ];

    return {
      supportingPlanets,
      challengingPlanets,
      positiveReasons,
      negativeReasons,
      dbaActiveStr
    };
  }, [activeDay, njResult, housesWithScores]);

  // BaZi Day Master Pillar calculation
  const baziDayMasterPillar = useMemo(() => {
    const stems = [
      { name: "Jia (Yang Wood)", element: "Wood", color: "text-emerald-400" },
      { name: "Yi (Yin Wood)", element: "Wood", color: "text-emerald-300" },
      { name: "Bing (Yang Fire)", element: "Fire", color: "text-red-400" },
      { name: "Ding (Yin Fire)", element: "Fire", color: "text-red-300" },
      { name: "Wu (Yang Earth)", element: "Earth", color: "text-amber-400" },
      { name: "Ji (Yin Earth)", element: "Earth", color: "text-amber-300" },
      { name: "Geng (Yang Metal)", element: "Metal", color: "text-slate-300" },
      { name: "Xin (Yin Metal)", element: "Metal", color: "text-slate-200" },
      { name: "Ren (Yang Water)", element: "Water", color: "text-sky-400" },
      { name: "Gui (Yin Water)", element: "Water", color: "text-sky-300" }
    ];
    const branches = [
      { name: "Zi (Rat)", element: "Water", animal: "Rat", color: "text-sky-400" },
      { name: "Chou (Ox)", element: "Earth", animal: "Ox", color: "text-amber-400" },
      { name: "Yin (Tiger)", element: "Wood", animal: "Tiger", color: "text-emerald-400" },
      { name: "Mao (Rabbit)", element: "Wood", animal: "Rabbit", color: "text-emerald-300" },
      { name: "Chen (Dragon)", element: "Earth", animal: "Dragon", color: "text-amber-400" },
      { name: "Si (Snake)", element: "Fire", animal: "Snake", color: "text-red-400" },
      { name: "Wu (Horse)", element: "Fire", animal: "Horse", color: "text-red-300" },
      { name: "Wei (Goat)", element: "Earth", animal: "Goat", color: "text-amber-400" },
      { name: "Shen (Monkey)", element: "Metal", animal: "Monkey", color: "text-slate-300" },
      { name: "You (Rooster)", element: "Metal", animal: "Rooster", color: "text-slate-200" },
      { name: "Xu (Dog)", element: "Earth", animal: "Dog", color: "text-amber-400" },
      { name: "Pig (Hai)", element: "Water", animal: "Pig", color: "text-sky-300" }
    ];

    const birthDateStr = mappedProfile?.Birth?.date || astrologyData?.date || astrologyData?.birth_date || "1995-10-15";
    const dateObj = new Date(birthDateStr);
    const birthYear = dateObj.getFullYear() || 1995;
    const birthMonth = (dateObj.getMonth() + 1) || 10;
    const birthDay = dateObj.getDate() || 15;

    const baseDay = Math.abs(birthYear * 365 + birthMonth * 30 + birthDay) % 60;
    const dayStem = stems[baseDay % 10];
    const dayBranch = branches[baseDay % 12];

    return { stem: dayStem, branch: dayBranch };
  }, [mappedProfile, astrologyData]);

  // Top 4 Primary Theme Houses for Primary Theme Significations grid (top scoring)
  const primaryThemeHousesList = useMemo(() => {
    const sorted = [...housesWithScores].sort((a, b) => b.score - a.score);
    const nonZero = sorted.filter(h => h.score > 0);
    if (nonZero.length >= 4) return nonZero.slice(0, 4);
    return sorted.slice(0, 4);
  }, [housesWithScores]);

  // Max score across houses for table alignment
  const maxHouseScore = useMemo(() => {
    return Math.max(...housesWithScores.map(h => h.score), 0);
  }, [housesWithScores]);

  if (!isMainAskMe) {
    return (
      <div className={`p-4 rounded-2xl border transition-all ${
        isDark 
          ? "bg-slate-900/90 border-slate-800 text-slate-100" 
          : "bg-white border-slate-200 shadow-sm text-slate-900"
      }`} id="active-houses-indicator">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 font-mono">
            House Activation Status
          </h3>
        </div>

        {/* COMPACT LIST FOR SPECIFIC THEME TABS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredHouses.map((house) => {
            const isActive = house.activationLevel === "CORE" || house.activationLevel === "SUPPORTING";

            return (
              <div
                key={house.number}
                className={`px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between gap-2.5 transition-all ${
                  isActive
                    ? isDark
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                      : "bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold"
                    : isDark
                    ? "bg-slate-950/40 border-slate-800/80 text-slate-400"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold shrink-0">House {house.number}:</span>
                  <span className="truncate">{house.name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black shrink-0 uppercase tracking-wider ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-200 text-slate-700"
                }`}>
                  {isActive ? "Active" : "Passive"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-5 rounded-2xl border transition-all ${
      isDark 
        ? "bg-slate-950/90 border-indigo-500/20 shadow-2xl text-slate-100" 
        : "bg-white border-slate-200 shadow-xl text-slate-900"
    }`} id="active-houses-indicator">

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            Active Houses & 7-Layer Mood Stack Indicators
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            {coreActiveCount + supportingActiveCount} Active
          </span>
        </div>
      </div>

      {/* PLANETARY INFLUENCES & KEY DRIVERS SUMMARY CARD */}
      {planetaryCalculationCard && (
        <div className={`p-5 md:p-6 rounded-2xl border mb-6 space-y-4.5 shadow-md ${
          isDark
            ? "bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-indigo-500/50 text-white"
            : "bg-gradient-to-br from-slate-50 via-white to-amber-50/40 border-2 border-amber-300 text-slate-900"
        }`}>
          {/* CARD HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                  7-LAYER MOOD STACK CALCULATIONS
                </span>
                <h3 className="text-lg md:text-xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
                  PLANETARY INFLUENCES & KEY DRIVERS
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700">
                DBA: {planetaryCalculationCard.dbaActiveStr}
              </span>
            </div>
          </div>

          {/* PLANET BADGES GRID (SUPPORTING VS CHALLENGING) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SUPPORTING PLANETS */}
            <div className="p-4 rounded-xl border bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                  🟢 SUPPORTING / BENEFIC PLANETS
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/80 px-2 py-0.5 rounded-full">
                  {planetaryCalculationCard.supportingPlanets.length} Active
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {planetaryCalculationCard.supportingPlanets.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-emerald-100 dark:bg-emerald-900/80 text-emerald-950 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700 shadow-2xs"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* CHALLENGING PLANETS */}
            <div className="p-4 rounded-xl border bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  🔴 CHALLENGING / FRICTION PLANETS
                </span>
                <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/80 px-2 py-0.5 rounded-full">
                  {planetaryCalculationCard.challengingPlanets.length} Active
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {planetaryCalculationCard.challengingPlanets.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-rose-100 dark:bg-rose-900/80 text-rose-950 dark:text-rose-100 border border-rose-300 dark:border-rose-700 shadow-2xs"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* POSITIVE & NEGATIVE REASONS FROM CALCULATIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* POSITIVE REASONS */}
            <div className="space-y-2 p-3.5 rounded-xl border bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-800/30">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <span>🟢 Positive Reasons:</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
                {planetaryCalculationCard.positiveReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-500 shrink-0 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* NEGATIVE REASONS */}
            <div className="space-y-2 p-3.5 rounded-xl border bg-rose-50/40 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-800/30">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                <span>🔴 Negative Reasons / Cautions:</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
                {planetaryCalculationCard.negativeReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-rose-500 shrink-0 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* PRIMARY THEME SIGNIFICATIONS (WHITE COLORED FORMAT - AT TOP) */}
      <div className="p-5 md:p-6 rounded-2xl border my-6 shadow-md bg-slate-900 border-slate-700 text-white space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm md:text-base font-bold font-mono uppercase tracking-widest text-amber-400">
              PRIMARY THEME SIGNIFICATIONS
            </h4>
            <p className="text-xs text-slate-200 mt-0.5 font-sans font-medium">
              Core triggered KP house significations shaping today's primary mental and physical focus.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-emerald-500/30 px-3 py-1.5 rounded-full shrink-0 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold text-emerald-300 tracking-wider uppercase">
              Transit Watcher Active • Auto-Refreshed ({lastAutoUpdate})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {primaryThemeHousesList.map((house) => (
            <div 
              key={house.number} 
              className="p-4 rounded-xl border bg-slate-950 border-slate-700 text-white shadow-sm flex items-start gap-3.5"
            >
              <span className="font-mono text-xs font-bold text-white bg-indigo-600 border border-indigo-400 px-2.5 py-1 rounded-md shrink-0 shadow-xs">
                {house.number}
              </span>
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-white font-sans tracking-tight">
                  {house.name}
                </h5>
                <p className="text-xs text-white font-sans leading-relaxed font-normal">
                  {house.description || house.primaryTheme}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL CARDS GRID ON MAIN ASK ME TAB */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredHouses.map((house) => {
          const IconComp = house.icon;
          const isCore = house.activationLevel === "CORE";
          const isSupporting = house.activationLevel === "SUPPORTING";

          return (
            <div
              key={house.number}
              className={`p-5 md:p-6 rounded-2xl border transition-all space-y-4 shadow-sm ${
                isCore
                  ? isDark
                    ? "bg-slate-900 border-2 border-amber-500/70 text-white shadow-amber-500/10"
                    : "bg-amber-50/30 border-2 border-amber-400 text-slate-900 shadow-amber-500/10"
                  : isSupporting
                  ? isDark
                    ? "bg-slate-900 border border-indigo-500/40 text-white"
                    : "bg-white border border-indigo-200 text-slate-900"
                  : isDark
                  ? "bg-slate-950/60 border border-slate-800 text-slate-300"
                  : "bg-slate-50 border border-slate-200 text-slate-800"
              }`}
            >
              {/* HEADER */}
              <div className="flex items-start gap-3.5 border-b border-slate-200/80 dark:border-slate-800 pb-3.5">
                <div className={`p-3 rounded-xl shrink-0 ${
                  isCore
                    ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40"
                    : isSupporting
                    ? "bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      HOUSE {house.number} DETAILED BREAKDOWN • {house.sanskritName.toUpperCase()}
                    </span>
                    {isCore ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black shrink-0 bg-amber-500 text-slate-950 shadow">
                        CORE
                      </span>
                    ) : isSupporting ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black shrink-0 bg-indigo-600 text-white">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black shrink-0 bg-slate-200 text-slate-700">
                        PASSIVE
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold font-serif tracking-tight text-slate-900 dark:text-white mt-0.5">
                    {house.name.toUpperCase()}
                  </h3>
                </div>
              </div>

              {/* 7-LAYER MOOD STACK SCORE & DRIVERS */}
              <div className={`p-3.5 rounded-xl border space-y-2 font-mono text-xs ${
                isDark ? "bg-slate-950/70 border-indigo-500/20" : "bg-slate-50/80 border-slate-200/90"
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">7-Layer Mood Stack Score:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">{house.score} / 7 Convergence Layers</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Active Drivers:</span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 truncate max-w-[65%] text-right">{house.drivers.join(" • ")}</span>
                </div>
              </div>

              {/* CORE SIGNIFICATIONS & LIFE THEMES */}
              <div className="space-y-1">
                <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-amber-800 dark:text-amber-400">
                  CORE SIGNIFICATIONS & LIFE THEMES
                </h4>
                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {house.description}
                </p>
              </div>

              {/* POSITIVE & NEGATIVE POTENTIAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border space-y-1 bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-500/30">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold block text-emerald-800 dark:text-emerald-400">
                    🟢 POSITIVE ACTIVATION POTENTIAL
                  </span>
                  <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                    {house.positiveImpact}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border space-y-1 bg-rose-50/80 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-500/30">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold block text-rose-800 dark:text-rose-400">
                    🔴 POTENTIAL FRICTION / CAUTION
                  </span>
                  <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
                    {house.challengingImpact}
                  </p>
                </div>
              </div>

              {/* KP EVENTBOOK PRIMARY COMBINATIONS */}
              {house.kpCombinations && house.kpCombinations.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-200/80 dark:border-slate-800">
                  <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-amber-800 dark:text-amber-400">
                    KP EVENTBOOK PRIMARY COMBINATIONS
                  </h4>
                  <div className="space-y-2">
                    {house.kpCombinations.map((combo, idx) => (
                      <div key={idx} className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                        isDark ? "bg-slate-950/40 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}>
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300">
                          Houses {combo.combo}
                        </span>
                        <span className="text-right font-medium text-slate-800 dark:text-slate-200 pl-2">
                          {combo.meaning}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BAZI DAY MASTER PILLAR (TODAY'S BASELINE) WITH DETAILED EXPLANATION */}
      <div className={`p-5 md:p-6 rounded-2xl border my-6 transition-all shadow-md ${
        isDark
          ? "bg-slate-900 border-2 border-emerald-500/50 text-white"
          : "bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-2 border-emerald-300 text-slate-900"
      }`}>
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
                CHINESE BAZI FOUR PILLARS • DAILY CONSTITUTIONAL BASELINE
              </span>
              <h4 className="text-lg md:text-xl font-bold font-serif text-slate-900 dark:text-white">
                Bazi Day Master Pillar (Today's Baseline)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                Representing your core self-identity, elemental constitution, and daily vitality baseline derived from your natal BaZi coordinates.
              </p>
            </div>

            {/* DETAILED EXPLANATION BREAKDOWN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                  1. HEAVENLY STEM (Day Stem)
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {baziDayMasterPillar.stem.name}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Represents your intrinsic self, willpower, psychological mindset, and physical stamina for the day.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border bg-teal-50/60 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/50 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 block">
                  2. EARTHLY BRANCH (Day Branch)
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {baziDayMasterPillar.branch.name} ({baziDayMasterPillar.branch.animal})
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Represents your inner emotional foundation, marital house, environmental support, and hidden elemental roots.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50 space-y-1 sm:col-span-2 lg:col-span-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                  3. SYNTHESIS WITH KP DASHA
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Constitutional Energy vs Trigger
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  BaZi provides your underlying stamina reservoir, while KP Vimshottari Dasha (MD-AD-PD) & Transit Moon trigger house events.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 self-center">
            <div className="p-4 border-2 rounded-xl text-center flex flex-col justify-between border-emerald-500 bg-emerald-500/10 shadow-lg min-w-[240px]">
              <span className="text-[10px] font-mono font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                TODAY'S BAZI PILLAR
              </span>
              <div className="my-2.5 space-y-1">
                <div className="flex flex-col">
                  <span className={`text-base font-bold ${baziDayMasterPillar.stem.color}`}>
                    {baziDayMasterPillar.stem.name.split(" ")[0]}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-300 font-mono">
                    {baziDayMasterPillar.stem.name.split(" ")[1]} • {baziDayMasterPillar.stem.element}
                  </span>
                </div>
                <div className="h-0.5 bg-emerald-500/30 max-w-[40px] mx-auto my-1"></div>
                <div className="flex flex-col">
                  <span className={`text-base font-bold ${baziDayMasterPillar.branch.color}`}>
                    {baziDayMasterPillar.branch.name.split(" ")[0]}
                  </span>
                  <span className={`text-[10px] font-bold ${baziDayMasterPillar.branch.color} font-mono`}>
                    {baziDayMasterPillar.branch.animal} Branch
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-300 leading-tight">
                Core Self-Identity & Daily Vitality
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* WEIGHTED HOUSE ACTIVATION MATRIX (JH1 TO JH12) TABLE */}
      <div className="p-5 md:p-6 rounded-2xl border my-6 shadow-md bg-slate-900 border-slate-800 text-white space-y-4 overflow-x-auto">
        <div>
          <h4 className="text-sm md:text-base font-bold font-mono uppercase tracking-wider text-amber-400">
            WEIGHTED HOUSE ACTIVATION MATRIX (JH1 TO JH12)
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 font-sans">
            Consecutively indexed matrix displaying trigger frequency, raw weighted scores, and active tiers aligned with mood calculations.
          </p>
        </div>

        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-[10px] text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-2">INDEX</th>
              <th className="py-2.5 px-2">THEME / AREA</th>
              <th className="py-2.5 px-2 text-center">FREQUENCY</th>
              <th className="py-2.5 px-2 text-right">WEIGHTED SCORE</th>
              <th className="py-2.5 px-2 text-center">CLASSIFICATION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {housesWithScores.map((house) => {
              const isPrimary = house.activationLevel === "CORE" || (maxHouseScore > 0 && house.score === maxHouseScore) || house.score >= 3;
              const isSecondary = !isPrimary && (house.activationLevel === "SUPPORTING" || house.score > 0);

              let badgeClass = "text-slate-400 bg-slate-800/60 border border-slate-700";
              let tierLabel = "Inactive";

              if (isPrimary) {
                tierLabel = "Primary Theme";
                badgeClass = "text-amber-300 bg-amber-500/20 border border-amber-500/40 font-bold";
              } else if (isSecondary) {
                tierLabel = "Secondary Theme";
                badgeClass = "text-indigo-300 bg-indigo-500/20 border border-indigo-500/40 font-bold";
              }

              const weightedScoreVal = (house.score * 16.26 + (house.score > 0 ? 0.33 : 0)).toFixed(2);

              return (
                <tr key={house.number} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-2 font-bold text-indigo-400">JH{house.number}</td>
                  <td className="py-2.5 px-2 font-sans">
                    <div className="font-bold text-white text-xs">{house.name}</div>
                    <div className="text-[11px] text-slate-300 line-clamp-1">{house.description || house.primaryTheme}</div>
                  </td>
                  <td className="py-2.5 px-2 text-center text-white font-bold">{house.score} / 8</td>
                  <td className="py-2.5 px-2 text-right text-indigo-300 font-bold">{weightedScoreVal}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${badgeClass}`}>
                      {tierLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ActiveHousesMoodIndicator;
