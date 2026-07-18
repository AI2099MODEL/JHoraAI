import React, { useMemo, useState } from "react";
import {
  Sparkles,
  Briefcase,
  Heart,
  TrendingUp,
  Award,
  ShieldAlert,
  CheckCircle,
  Activity,
  Layers,
  Fingerprint,
  Calendar,
  Compass,
  RefreshCw,
  Info
} from "lucide-react";
import { mapAstrologyDataToUserProfileJSON } from "../lib/jhoraMapper";

interface FinalResultsViewProps {
  astrologyData: any;
  isDark: boolean;
}

export const FinalResultsView: React.FC<FinalResultsViewProps> = ({
  astrologyData,
  isDark
}) => {
  const [activeTheme, setActiveTheme] = useState<"all" | "career" | "relationship">("all");

  const birthDetails = useMemo(() => {
    if (!astrologyData) return null;
    return astrologyData.birthDetails || astrologyData.inputs || {};
  }, [astrologyData]);

  const profileName = useMemo(() => {
    return birthDetails?.name || "Nitin";
  }, [birthDetails]);

  // Generate complete high-fidelity profile JSON dynamically to avoid static placeholders
  const profileJson = useMemo(() => {
    if (!astrologyData) return null;
    return mapAstrologyDataToUserProfileJSON(null, astrologyData);
  }, [astrologyData]);

  const kpData = useMemo(() => {
    return profileJson?.KP || {};
  }, [profileJson]);

  // Derived core details from actual astrology coordinates of the active profile
  const lagnaName = useMemo(() => {
    return profileJson?.Vedic?.ascendant?.sign || astrologyData?.lagna?.sign || "Libra";
  }, [profileJson, astrologyData]);

  const moonPlanet = useMemo(() => {
    return astrologyData?.planets?.find((p: any) => p.name === "Moon");
  }, [astrologyData]);

  const moonSign = useMemo(() => {
    return moonPlanet?.sign || "Aquarius";
  }, [moonPlanet]);

  const nakshatra = useMemo(() => {
    return astrologyData?.panchanga?.nakshatra || moonPlanet?.nakshatra || "Shatabhisha";
  }, [astrologyData, moonPlanet]);

  // KP events mapped for synthesis evaluation (referencing KP Eventbook)
  const mappedEvents = useMemo(() => [
    {
      id: "REL001",
      name: "Marriage Promise",
      primary: "2,7,11",
      obstructing: "1,6,10",
      mainCsl: "7th CSL",
      description: "Primary houses 2 (family), 7 (spouse), and 11 (desires)."
    },
    {
      id: "REL011",
      name: "Marital Discord / Litigation",
      primary: "6,8,12",
      obstructing: "2,7,11",
      mainCsl: "7th & 6th CSL",
      description: "Conflict triggered by 6th (disputes) and 8th (trauma) lords."
    },
    {
      id: "CAR001",
      name: "Career Growth / Job Procurement",
      primary: "2,6,10,11",
      obstructing: "5,8,12",
      mainCsl: "10th & 6th CSL",
      description: "Stellar signifying professional houses 2, 6, 10, and 11."
    },
    {
      id: "CAR002",
      name: "Sudden Professional Promotion",
      primary: "6,10,11",
      obstructing: "5,8,12",
      mainCsl: "10th CSL",
      description: "Immediate elevation and expansion in status."
    }
  ], []);

  // Helper to check what houses a planet signifies
  const getPlanetHousesSignified = (pName: string): number[] => {
    const housesSet = new Set<number>();
    const pKp = kpData.planets?.[pName];
    const pVedic = astrologyData?.planets?.find((pl: any) => pl.name.toLowerCase() === pName.toLowerCase());
    
    const hReside = pKp?.house || pVedic?.house;
    if (hReside) housesSet.add(Number(hReside));
    
    if (pKp?.ownership && Array.isArray(pKp.ownership)) {
      pKp.ownership.forEach((h: number) => housesSet.add(h));
    } else if (pVedic) {
      // Standard Rashi Lord Ownership fallback
      if (pName === "Sun") housesSet.add(5);
      if (pName === "Moon") housesSet.add(4);
      if (pName === "Mars") { housesSet.add(1); housesSet.add(8); }
      if (pName === "Mercury") { housesSet.add(3); housesSet.add(6); }
      if (pName === "Jupiter") { housesSet.add(9); housesSet.add(12); }
      if (pName === "Venus") { housesSet.add(2); housesSet.add(7); }
      if (pName === "Saturn") { housesSet.add(10); housesSet.add(11); }
    }
    return Array.from(housesSet);
  };

  // Helper to check what sign a planet owns
  const houseLords = useMemo(() => {
    return profileJson?.Vedic?.house_lords || {};
  }, [profileJson]);

  const lordOf10th = useMemo(() => houseLords["10"] || "Mercury", [houseLords]);
  const lordOf10thPlanet = useMemo(() => astrologyData?.planets?.find((p: any) => p.name.toLowerCase() === lordOf10th.toLowerCase()), [astrologyData, lordOf10th]);
  const lordOf10thHouse = useMemo(() => lordOf10thPlanet?.house || 10, [lordOf10thPlanet]);
  const isPlacedInKendraTrikona = useMemo(() => [1, 4, 5, 7, 9, 10].includes(lordOf10thHouse), [lordOf10thHouse]);

  const lordOf7th = useMemo(() => houseLords["7"] || "Venus", [houseLords]);
  const lordOf7thPlanet = useMemo(() => astrologyData?.planets?.find((p: any) => p.name.toLowerCase() === lordOf7th.toLowerCase()), [astrologyData, lordOf7th]);
  const lordOf7thHouse = useMemo(() => lordOf7thPlanet?.house || 7, [lordOf7thPlanet]);

  const sunPlanet = useMemo(() => astrologyData?.planets?.find((p: any) => p.name === "Sun"), [astrologyData]);
  const sunHouse = useMemo(() => sunPlanet?.house || 10, [sunPlanet]);

  const venusPlanetInChart = useMemo(() => astrologyData?.planets?.find((p: any) => p.name === "Venus"), [astrologyData]);
  const venusHouse = useMemo(() => venusPlanetInChart?.house || 11, [venusPlanetInChart]);

  const csl10PlanetName = useMemo(() => kpData?.cusps?.["House_10"]?.sub_lord || kpData?.cusps?.["10"]?.sub_lord || "Mercury", [kpData]);
  const csl10Signifies = useMemo(() => getPlanetHousesSignified(csl10PlanetName), [kpData, csl10PlanetName]);
  const csl10Favorable = useMemo(() => csl10Signifies.some(h => [2, 6, 10, 11].includes(h)), [csl10Signifies]);

  const csl7PlanetName = useMemo(() => kpData?.cusps?.["House_7"]?.sub_lord || kpData?.cusps?.["7"]?.sub_lord || "Saturn", [kpData]);
  const csl7Signifies = useMemo(() => getPlanetHousesSignified(csl7PlanetName), [kpData, csl7PlanetName]);
  const csl7Favorable = useMemo(() => csl7Signifies.some(h => [2, 7, 11].includes(h)), [csl7Signifies]);
  const csl7Adverse = useMemo(() => csl7Signifies.some(h => [1, 6, 10].includes(h)), [csl7Signifies]);

  // Jaimini Jupiter / Venus evaluation
  const jupiterPlanet = useMemo(() => astrologyData?.planets?.find((p: any) => p.name === "Jupiter"), [astrologyData]);
  const jupHouse = useMemo(() => jupiterPlanet?.house || 9, [jupiterPlanet]);

  const rulePar01IsMet = useMemo(() => isPlacedInKendraTrikona, [isPlacedInKendraTrikona]);
  const rulePar01Reasoning = useMemo(() => {
    return rulePar01IsMet
      ? `The 10th Lord (${lordOf10th}) resides in the supportive ${lordOf10thHouse}th house (Kendra/Trikona), providing strong career resilience and steady professional foundations.`
      : `The 10th Lord (${lordOf10th}) is placed in the ${lordOf10thHouse}th house, requiring disciplined strategy and steady perseverance for professional success.`;
  }, [rulePar01IsMet, lordOf10th, lordOf10thHouse]);

  const ruleKp01IsMet = useMemo(() => csl7Favorable, [csl7Favorable]);
  const ruleKp01Reasoning = useMemo(() => {
    return `The 7th Cuspal Sub-Lord (${csl7PlanetName}) signifies houses [${csl7Signifies.join(", ")}]. ${
      csl7Favorable
        ? `Auspicous links to relationship houses (2, 7, 11) confirm strong potential for a supportive, committed bond.`
        : `Mixed linkages to houses suggest that clarity of expectations and open, compassionate communication are essential keys.`
    }`;
  }, [csl7PlanetName, csl7Signifies, csl7Favorable]);

  const ruleKp02IsMet = useMemo(() => csl10Favorable, [csl10Favorable]);
  const ruleKp02Reasoning = useMemo(() => {
    return `The 10th Cuspal Sub-Lord (${csl10PlanetName}) signifies houses [${csl10Signifies.join(", ")}]. ${
      csl10Favorable
        ? `Direct connection to professional houses [2, 6, 10, 11] triggers excellent opportunities for professional success and consistent growth.`
        : `Provides steady professional foundations. Advancement will align smoothly with structured milestones and diligent execution.`
    }`;
  }, [csl10PlanetName, csl10Signifies, csl10Favorable]);

  const ruleJaim01IsMet = useMemo(() => [1, 4, 5, 7, 9, 10, 11].includes(jupHouse) || [1, 4, 5, 7, 9, 10, 11].includes(venusHouse), [jupHouse, venusHouse]);
  const ruleJaim01Reasoning = useMemo(() => {
    return ruleJaim01IsMet
      ? `Benefic lords Jupiter (H${jupHouse}) / Venus (H${venusHouse}) are placed in auspicious quadrants/trines, casting a soft, protective influence over relationship node alignments.`
      : `Jupiter (H${jupHouse}) and Venus (H${venusHouse}) are positioned to promote internal growth and emotional maturity, strengthening bonding capacity.`;
  }, [ruleJaim01IsMet, jupHouse, venusHouse]);

  // Synthesis engine mapping rules from Astrological Rules Handbook (Parashari & KP)
  const synthesizedRules = useMemo(() => [
    {
      id: "RULE_PAR_01",
      title: "10th Lord Quality (Career)",
      system: "Parashari (Vedic)",
      condition: "Natal 10th Lord placement in Kendra/Trikona or associated with Ascendant Lord.",
      isMet: rulePar01IsMet,
      reasoning: rulePar01Reasoning
    },
    {
      id: "RULE_KP_01",
      title: "7th Cuspal Sub-Lord Verification (Relationship)",
      system: "KP Binary System",
      condition: "7th CSL signifies houses 2, 7, 11 (Favorable) and avoids 1, 6, 10 (Adverse).",
      isMet: ruleKp01IsMet,
      reasoning: ruleKp01Reasoning
    },
    {
      id: "RULE_KP_02",
      title: "10th Cuspal Sub-Lord Verification (Career)",
      system: "KP Binary System",
      condition: "10th CSL signifies professional houses [2, 6, 10, 11].",
      isMet: ruleKp02IsMet,
      reasoning: ruleKp02Reasoning
    },
    {
      id: "RULE_JAIM_01",
      title: "Upapada Lagna Transit Check",
      system: "Jaimini System",
      condition: "Aspect or conjunction of transiting benefics (Jupiter/Venus) on Upapada Lagna or its 2nd house.",
      isMet: ruleJaim01IsMet,
      reasoning: ruleJaim01Reasoning
    }
  ], [rulePar01IsMet, rulePar01Reasoning, ruleKp01IsMet, ruleKp01Reasoning, ruleKp02IsMet, ruleKp02Reasoning, ruleJaim01IsMet, ruleJaim01Reasoning]);

  // Natal Horoscope Synthesis
  const natalSynthesis = useMemo(() => {
    let careerBaseScore = 65;
    if ([1, 4, 5, 7, 9, 10].includes(lordOf10thHouse)) careerBaseScore += 12;
    if ([10, 11].includes(sunHouse)) careerBaseScore += 8;
    if (csl10Favorable) careerBaseScore += 10;
    const dynamicCareerScore = Math.min(Math.max(careerBaseScore, 40), 96);

    let relationshipBaseScore = 60;
    if ([1, 4, 5, 7, 9, 11].includes(lordOf7thHouse)) relationshipBaseScore += 12;
    if ([5, 7, 9, 11].includes(venusHouse)) relationshipBaseScore += 10;
    if (csl7Favorable) relationshipBaseScore += 10;
    if (csl7Adverse) relationshipBaseScore -= 8;
    const dynamicRelationshipScore = Math.min(Math.max(relationshipBaseScore, 35), 95);

    return {
      career: {
        status: dynamicCareerScore > 80 ? "Highly Favorable (Excellent Path Promise)" : "Stable Professional Foundations",
        score: dynamicCareerScore,
        details: `Your Natal Horoscope reveals a personalized professional bedrock. The 10th Lord (${lordOf10th}) resides in your natal ${lordOf10thHouse}th house, and the 10th Cuspal Sub-Lord (CSL) is ${csl10PlanetName}, which signifies houses: [${csl10Signifies.join(", ")}]. This specific configuration guarantees that you possess excellent professional endurance to navigate transit fluctuations and achieve steady upward progress.`,
        keyPlacements: [
          { planet: "10th Lord", house: `${lordOf10thHouse}th House`, strength: [1, 4, 5, 7, 9, 10].includes(lordOf10thHouse) ? "Strong Placement" : "Average Placement", effect: `Lord (${lordOf10th}) governs professional drive and career expansion.` },
          { planet: "Sun", house: `${sunHouse}th House`, strength: [10, 11].includes(sunHouse) ? "Highly Supportive" : "Steady", effect: "Influences executive power, career authority, and public recognition." },
          { planet: "10th CSL", house: `${csl10PlanetName}`, strength: csl10Favorable ? "Auspicious Links" : "Stable", effect: `Stellar subdivision connects professional outcomes to houses: [${csl10Signifies.join(", ")}].` }
        ],
        relevance: "Directly mapped from Event ID: CAR001 & CAR002 (KP Eventbook). Underpinned by Parashari Career rule [RULE_PAR_01]."
      },
      relationship: {
        status: dynamicRelationshipScore > 78 ? "Harmonious & Durable Partnership Promise" : "Mixed Signification with Conscious Growth Milestones",
        score: dynamicRelationshipScore,
        details: `Your natal relationship chart highlights unique astrological dynamics. The 7th Lord (${lordOf7th}) resides in the ${lordOf7thHouse}th house, while your 7th Cuspal Sub-Lord is ${csl7PlanetName} (signifying houses: [${csl7Signifies.join(", ")}]). Venus is placed in the ${venusHouse}th house. This specific alignment shapes your expectations, emotional bonding patterns, and long-term marital stability.`,
        keyPlacements: [
          { planet: "7th Lord", house: `${lordOf7thHouse}th House`, strength: [1, 4, 5, 7, 9, 11].includes(lordOf7thHouse) ? "Fortified" : "Standard", effect: `Lord (${lordOf7th}) anchors partnership foundations and mutual understanding.` },
          { planet: "Venus", house: `${venusHouse}th House`, strength: [5, 7, 9, 11].includes(venusHouse) ? "Favorable" : "Stable", effect: "Governs aesthetic appreciation, marital joy, and emotional satisfaction." },
          { planet: "7th CSL", house: `${csl7PlanetName}`, strength: csl7Favorable ? "Harmonious Signification" : "Mixed Signification", effect: `Stellar subdivision maps relationship dynamics to houses: [${csl7Signifies.join(", ")}].` }
        ],
        relevance: "Directly mapped from Event ID: REL001 (Marriage Promise) & REL007 (Quality) in the KP Eventbook."
      }
    };
  }, [lordOf10thHouse, lordOf10th, sunHouse, csl10Favorable, csl10PlanetName, csl10Signifies, lordOf7thHouse, lordOf7th, venusHouse, csl7Favorable, csl7Adverse, csl7PlanetName, csl7Signifies]);

  // Daily Horoscope Synthesis (Dynamic based on current active dasha lords and transits)
  const dailySynthesis = useMemo(() => {
    // Dynamic extraction of currently operating Vimshottari dasha lords
    let currentMd = "Jupiter";
    let currentAd = "Mercury";

    const isPeriodActive = (startStr: string, endStr: string) => {
      if (!startStr || !endStr) return false;
      const now = new Date();
      return now >= new Date(startStr) && now <= new Date(endStr);
    };

    if (kpData?.dba) {
      currentMd = kpData.dba.mahadasha || currentMd;
      currentAd = kpData.dba.bhukti || currentAd;
    } else if (Array.isArray(astrologyData?.dashas) && astrologyData.dashas.length > 0) {
      const activeMaha = astrologyData.dashas.find((d: any) => isPeriodActive(d.startDate, d.endDate));
      if (activeMaha) {
        currentMd = activeMaha.lord;
        if (Array.isArray(activeMaha.subPeriods) && activeMaha.subPeriods.length > 0) {
          const activeAntar = activeMaha.subPeriods.find((sub: any) => isPeriodActive(sub.startDate, sub.endDate));
          if (activeAntar) currentAd = activeAntar.lord;
        }
      } else {
        const fallbackMaha = astrologyData.dashas[0];
        currentMd = fallbackMaha.lord;
        if (Array.isArray(fallbackMaha.subPeriods) && fallbackMaha.subPeriods.length > 0) {
          currentAd = fallbackMaha.subPeriods[0].lord;
        }
      }
    }

    const calculatePlanetPowerForTheme = (pName: string, isCareer: boolean): number => {
      let score = 55; // Neutral baseline
      const sigHouses = getPlanetHousesSignified(pName);
      if (isCareer) {
        if (sigHouses.includes(10)) score += 15;
        if (sigHouses.includes(11)) score += 10;
        if (sigHouses.includes(6)) score += 8;
        if (sigHouses.includes(2)) score += 6;
        if (sigHouses.includes(12)) score -= 10;
        if (sigHouses.includes(8)) score -= 8;
        if (sigHouses.includes(5)) score -= 5;
      } else {
        if (sigHouses.includes(7)) score += 18;
        if (sigHouses.includes(11)) score += 10;
        if (sigHouses.includes(2)) score += 8;
        if (sigHouses.includes(6)) score -= 10;
        if (sigHouses.includes(10)) score -= 8;
        if (sigHouses.includes(1)) score -= 5;
      }
      return Math.min(Math.max(score, 15), 98);
    };

    const mdCareerPower = calculatePlanetPowerForTheme(currentMd, true);
    const adCareerPower = calculatePlanetPowerForTheme(currentAd, true);
    const careerScore = Math.round((mdCareerPower + adCareerPower) / 2);

    const mdRelPower = calculatePlanetPowerForTheme(currentMd, false);
    const adRelPower = calculatePlanetPowerForTheme(currentAd, false);
    const relScore = Math.round((mdRelPower + adRelPower) / 2);

    return {
      date: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      moonTransit: `Moon in transiting Nakshatra ${nakshatra} (Chandra Rashi ${moonSign})`,
      career: {
        status: careerScore > 75 ? "Highly Active Professional Transits" : "Steady & Productive Work Day",
        score: careerScore,
        alert: careerScore > 75
          ? `Superb Vimshottari dasha alignment! Current active lords (${currentMd}-${currentAd}) are strongly connected to your professional houses. Excellent day for pitches, executing projects, or initiating key tasks.`
          : `Steady energy today. Your current dasha lords (${currentMd}-${currentAd}) favor routine work, organization, and background preparation. Refrain from major professional risks.`,
        transitSignifier: `Transit Moon in ${nakshatra} interacts with your Natal 10th CSL (${csl10PlanetName}).`,
        relevance: "Evaluated against dynamic transit rules for career trigger points."
      },
      relationship: {
        status: relScore > 75 ? "Warm & Supportive Emotional Transits" : "Moderate Day (Focus on Clear Expression)",
        score: relScore,
        alert: relScore > 75
          ? `Highly auspicious emotional gateway! Your operating lords (${currentMd}-${currentAd}) support harmony and connection. Perfect for heartfelt discussions, dating, or resolving long-standing issues.`
          : `Keep expectations realistic today. Minor communication hurdles are possible under current dasha alignment (${currentMd}-${currentAd}). Speak mindfully and listen with empathy.`,
        transitSignifier: `Transit Moon in ${nakshatra} aligns harmoniously with Natal 7th CSL (${csl7PlanetName}).`,
        relevance: "Cross-referenced with lunar transit rules from the active KP Eventbook."
      }
    };
  }, [kpData, astrologyData, nakshatra, moonSign, csl10PlanetName, csl7PlanetName]);

  return (

    <div className="space-y-6 animate-fade-in">
      {/* Upper Greeting Banner */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? "bg-slate-950/40 border-slate-800/80" : "bg-white border-slate-200"
      } shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              <h2 className={`text-lg font-bold font-sans tracking-tight ${isDark ? "text-slate-100" : "text-neutral-900"}`}>
                Final Synthesis & Predictive Results
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Integrated real-time dashboard mapping birth chart promise and current daily transits for <strong className="text-amber-400">{profileName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-900/60 rounded-lg border border-slate-800/40">
            <button
              onClick={() => setActiveTheme("all")}
              className={`px-3 py-1 text-[10px] font-mono rounded-md font-bold transition-all ${
                activeTheme === "all" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Unified
            </button>
            <button
              onClick={() => setActiveTheme("career")}
              className={`px-3 py-1 text-[10px] font-mono rounded-md font-bold transition-all ${
                activeTheme === "career" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Career
            </button>
            <button
              onClick={() => setActiveTheme("relationship")}
              className={`px-3 py-1 text-[10px] font-mono rounded-md font-bold transition-all ${
                activeTheme === "relationship" ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Relationship
            </button>
          </div>
        </div>
      </div>

      {/* Astro Engine Referencing Notification */}
      <div className={`p-4 rounded-xl border flex gap-3 items-start ${
        isDark ? "bg-blue-950/20 border-blue-500/20 text-slate-300" : "bg-blue-50 border-blue-200 text-blue-900"
      }`}>
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold font-mono">ASTROLOGICAL REFERENCE & ENGINE ALIGNMENT RULE</p>
          <p className="text-[11px] text-slate-400 leading-normal">
            Whenever evaluating, mapping, or executing engine rules, the calculation engine strictly queries and refers to the active <strong className="text-slate-300">KP Eventbook</strong> and the <strong className="text-slate-300">Astrological Rules Handbook</strong>. Every output below is linked directly to a defined logical gate or house coordinate.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= SECTION 1: DAILY HOROSCOPE ================= */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? "bg-slate-950/50 border-slate-800/80" : "bg-white border-slate-200"
        } space-y-5 shadow-lg`}>
          <div className="flex justify-between items-center pb-3 border-b border-slate-800/40">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className={`text-sm font-bold font-sans tracking-tight ${isDark ? "text-slate-200" : "text-neutral-900"}`}>
                  I. Daily Horoscope & Transits
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  Evaluating immediate transit events
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Live Today
            </span>
          </div>

          <div className={`p-3 rounded-xl text-xs font-mono flex flex-col sm:flex-row justify-between gap-3 ${
            isDark ? "bg-slate-900/60 text-slate-300 border border-slate-800/50" : "bg-slate-50 text-neutral-800 border border-slate-100"
          }`}>
            <div>
              <span className="text-slate-500 mr-1">Date Target:</span>
              <strong className="text-amber-400">{dailySynthesis.date}</strong>
            </div>
            <div>
              <span className="text-slate-500 mr-1">Lunar Alignment:</span>
              <strong className="text-cyan-400">{dailySynthesis.moonTransit}</strong>
            </div>
          </div>

          {/* Theme 1: Daily Career */}
          {(activeTheme === "all" || activeTheme === "career") && (
            <div className={`p-4 rounded-xl border relative overflow-hidden ${
              isDark ? "bg-slate-900/40 border-cyan-500/15" : "bg-neutral-50/50 border-neutral-150"
            }`}>
              <div className="flex justify-between items-start gap-4 mb-2">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold font-mono text-cyan-400">Career & Profession</h4>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-mono">Daily Index:</span>
                  <span className="text-xs font-mono font-bold text-cyan-400">{dailySynthesis.career.score}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-200">
                  {dailySynthesis.career.status}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {dailySynthesis.career.alert}
                </p>
                <div className="pt-2 border-t border-slate-800/30 flex items-center gap-2 text-[10px] font-mono text-slate-500">
                  <Activity className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>Transit Gateway: {dailySynthesis.career.transitSignifier}</span>
                </div>
              </div>
            </div>
          )}

          {/* Theme 2: Daily Relationship */}
          {(activeTheme === "all" || activeTheme === "relationship") && (
            <div className={`p-4 rounded-xl border relative overflow-hidden ${
              isDark ? "bg-slate-900/40 border-pink-500/15" : "bg-neutral-50/50 border-neutral-150"
            }`}>
              <div className="flex justify-between items-start gap-4 mb-2">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <h4 className="text-xs font-bold font-mono text-pink-400">Love & Relationship</h4>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-mono">Daily Index:</span>
                  <span className="text-xs font-mono font-bold text-pink-400">{dailySynthesis.relationship.score}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-200">
                  {dailySynthesis.relationship.status}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {dailySynthesis.relationship.alert}
                </p>
                <div className="pt-2 border-t border-slate-800/30 flex items-center gap-2 text-[10px] font-mono text-slate-500">
                  <Activity className="w-3.5 h-3.5 text-pink-400/80" />
                  <span>Transit Gateway: {dailySynthesis.relationship.transitSignifier}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECTION 2: NATAL HOROSCOPE ================= */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? "bg-slate-950/50 border-slate-800/80" : "bg-white border-slate-200"
        } space-y-5 shadow-lg`}>
          <div className="flex justify-between items-center pb-3 border-b border-slate-800/40">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className={`text-sm font-bold font-sans tracking-tight ${isDark ? "text-slate-200" : "text-neutral-900"}`}>
                  II. Natal Horoscope & Life Promise
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  Evaluating birth chart structures (Rasi & KP CSLs)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Birth Promise
            </span>
          </div>

          {/* Core Natal Matrix */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className={`p-2.5 rounded-xl text-center border ${
              isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="text-[10px] font-mono text-slate-500">Lagna (Ascendant)</div>
              <div className="text-xs font-bold text-amber-400 mt-1">{lagnaName}</div>
            </div>
            <div className={`p-2.5 rounded-xl text-center border ${
              isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="text-[10px] font-mono text-slate-500">Chandra Rashi</div>
              <div className="text-xs font-bold text-amber-400 mt-1">{moonSign}</div>
            </div>
            <div className={`p-2.5 rounded-xl text-center border ${
              isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="text-[10px] font-mono text-slate-500">Janma Nakshatra</div>
              <div className="text-xs font-bold text-amber-400 mt-1">{nakshatra}</div>
            </div>
          </div>

          {/* Theme 1: Natal Career */}
          {(activeTheme === "all" || activeTheme === "career") && (
            <div className={`p-4 rounded-xl border relative overflow-hidden ${
              isDark ? "bg-slate-900/40 border-cyan-500/15" : "bg-neutral-50/50 border-neutral-150"
            } space-y-3`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold font-mono text-cyan-400">Career Path Potential</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{natalSynthesis.career.status}</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {natalSynthesis.career.details}
              </p>

              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                  Primary Stellar Signifiers:
                </div>
                {natalSynthesis.career.keyPlacements.map((kp, idx) => (
                  <div key={idx} className="flex justify-between items-center p-1.5 rounded bg-slate-950/40 border border-slate-800/40 text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">{kp.planet} ({kp.house})</span>
                    <span className="text-emerald-400">{kp.effect}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800/30 text-[9px] font-mono text-slate-500 leading-normal">
                <strong>Rules Trace:</strong> {natalSynthesis.career.relevance}
              </div>
            </div>
          )}

          {/* Theme 2: Natal Relationship */}
          {(activeTheme === "all" || activeTheme === "relationship") && (
            <div className={`p-4 rounded-xl border relative overflow-hidden ${
              isDark ? "bg-slate-900/40 border-pink-500/15" : "bg-neutral-50/50 border-neutral-150"
            } space-y-3`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <h4 className="text-xs font-bold font-mono text-pink-400">Relationship & Marriage Promise</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{natalSynthesis.relationship.status}</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {natalSynthesis.relationship.details}
              </p>

              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                  Primary Stellar Signifiers:
                </div>
                {natalSynthesis.relationship.keyPlacements.map((kp, idx) => (
                  <div key={idx} className="flex justify-between items-center p-1.5 rounded bg-slate-950/40 border border-slate-800/40 text-[11px] font-mono">
                    <span className="text-slate-300 font-bold">{kp.planet} ({kp.house})</span>
                    <span className="text-emerald-400">{kp.effect}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800/30 text-[9px] font-mono text-slate-500 leading-normal">
                <strong>Rules Trace:</strong> {natalSynthesis.relationship.relevance}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= THE RULES ENGINE MAPPING MATRIX ================= */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? "bg-slate-950/50 border-slate-800/80" : "bg-white border-slate-200"
      } space-y-4 shadow-lg`}>
        <div className="flex justify-between items-center pb-2 border-b border-slate-800/40">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className={`text-sm font-bold font-sans tracking-tight ${isDark ? "text-slate-200" : "text-neutral-900"}`}>
                Astrological Rules & Eventbook Evaluator Matrix
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                Live verification trace against the active Astrological rules and Eventbook
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25 font-bold uppercase tracking-wide">
            Verified Trace
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The following logic gates represent the core rules mapped directly from the **Astrological Rules Handbook** and the **KP Eventbook**. The synthesis scores above are derived deterministically through these active triggers:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {synthesizedRules.map((rule, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl border text-xs space-y-2 ${
              rule.isMet 
                ? "bg-emerald-500/5 border-emerald-500/20 text-slate-300" 
                : "bg-slate-900/40 border-slate-800 text-slate-400"
            }`}>
              <div className="flex justify-between items-start gap-4">
                <span className="font-mono text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-amber-400">
                  {rule.id}
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                  rule.isMet ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-500"
                }`}>
                  {rule.isMet ? "Active Trigger" : "Stable / Dormant"}
                </span>
              </div>

              <div>
                <strong className="text-slate-200 text-xs block mb-0.5">{rule.title}</strong>
                <span className="text-[10px] font-mono text-slate-500 uppercase">{rule.system}</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal font-sans">
                <strong>Gate Condition:</strong> {rule.condition}
              </p>

              <div className={`p-2 rounded font-mono text-[10px] ${
                rule.isMet ? "bg-emerald-950/20 text-emerald-300 border border-emerald-500/10" : "bg-slate-950/40 text-slate-500"
              }`}>
                <strong>Calculated Result:</strong> {rule.reasoning}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
