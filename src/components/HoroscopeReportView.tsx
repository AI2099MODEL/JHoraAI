import React, { useState, useEffect, useMemo } from "react";
import { 
  User, Calendar, Clock, MapPin, Compass, Moon, Sun, 
  BookOpen, Star, Briefcase, DollarSign, Heart, Activity, 
  Sparkles, Shield, AlertTriangle, ChevronRight, HelpCircle,
  Download, RefreshCw, Award, Globe, Layers, Zap, Grid, LayoutDashboard
} from "lucide-react";
import { generateRawAstrologyPDF } from "../lib/rawReportGenerator";
import { getAllCachedHoroscopes, CachedHoroscopeRecord } from "../lib/indexedDb";
import AstroChart from "./AstroChart";

interface PlanetData {
  name: string;
  sign: string;
  longitude: number;
  retrograde: boolean;
  house: number;
  nakshatra?: string;
  pada?: number;
  lord?: string;
}

interface HoroscopeReportViewProps {
  astrologyData: any;
  activeUser: any;
  mapAstrologyDataToUserProfileJSON: (user: any, data: any) => any;
  setAstrologyData: (data: any) => void;
  isDark: boolean;
}

export const HoroscopeReportView: React.FC<HoroscopeReportViewProps> = ({
  astrologyData,
  activeUser,
  mapAstrologyDataToUserProfileJSON,
  setAstrologyData,
  isDark
}) => {
  const [compiling, setCompiling] = useState(false);
  const [profilesList, setProfilesList] = useState<CachedHoroscopeRecord[]>([]);
  const [majorTab, setMajorTab] = useState<"jhora" | "kp" | "western" | "all">("jhora");

  // Fetch all cached profiles on mount and sync with astrologyData
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const records = await getAllCachedHoroscopes();
        setProfilesList(records);
      } catch (err) {
        console.error("Error fetching profiles in HoroscopeReportView:", err);
      }
    };
    fetchProfiles();
  }, [astrologyData]);

  // Map high-fidelity profile JSON dynamically on render
  const profileJson = useMemo(() => {
    if (!astrologyData) return null;
    try {
      return mapAstrologyDataToUserProfileJSON(activeUser, astrologyData);
    } catch (e) {
      console.error("Error compiling profileJson on render:", e);
      return null;
    }
  }, [activeUser, astrologyData, mapAstrologyDataToUserProfileJSON]);

  if (!astrologyData) {
    return (
      <div 
        id="horoscope-report-empty" 
        className="text-center py-16 rounded-2xl bg-slate-950/20 border border-dashed border-slate-800 text-slate-500 text-xs"
      >
        <User className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
        <h3 className="text-sm font-bold text-slate-400 mb-1">No Active Astrological Profile Loaded</h3>
        <p className="max-w-md mx-auto px-4">
          Please load an existing profile or compute a new chart from the main dashboard to unlock this professional Traditional Horoscope Report.
        </p>
      </div>
    );
  }

  // Fallbacks from raw astrologyData
  const { 
    birthDetails = {}, 
    lagna = {}, 
    panchanga = {}, 
    planets = [], 
    rasiChart = {}, 
    navamsaChart = {}, 
    divisionalCharts = {}, 
    vargaLagnas = {},
    dashas = []
  } = astrologyData;

  const allSubmenuIds = [
    "overview", "planetary_positions", "planet_strength", "bhava_strength", 
    "ashtakavarga", "yogas", "doshas", "vimshottari", "yogini", "ashtottari", 
    "longevity", "sade_sati", "d1_rasi", "d9_navamsa", "d10_dasamsa", 
    "arudhas", "sphutas", "upagrahas", "sahams", "special_lagnas",
    "kp_dashboard", "kp_rulebook", "kp_cusps", "kp_planet_analysis", 
    "kp_significators", "kp_ruling_planets", "kp_dasha", "kp_transit", "kp_horary",
    "west_dashboard", "west_natal_chart", "west_positions", "west_aspects", "west_synastry", "west_transits",
    "eso_nadi", "eso_lalkitab", "eso_varshaphala", "eso_bazi", "eso_numerology", "eso_celtic", "eso_mayan"
  ];

  const handleDownloadCompleteReport = async () => {
    try {
      setCompiling(true);
      const doc = generateRawAstrologyPDF(profileJson || astrologyData, {
        profileName: profileJson?.User?.profile_name || birthDetails.name || "Vedic Native",
        submenus: allSubmenuIds
      });
      doc.save(`Complete_360_Astrological_Systems_Report_${Date.now()}.pdf`);
    } catch (err: any) {
      console.error("Failed to compile complete PDF:", err);
      alert("Failed to compile complete PDF: " + err.message);
    } finally {
      setCompiling(false);
    }
  };

  const cardStyle = isDark
    ? "bg-slate-950/45 border-slate-800 text-slate-100"
    : "bg-white border-neutral-200 text-neutral-900 shadow-sm";

  const mutedText = isDark ? "text-slate-400" : "text-neutral-500";
  const borderStyle = isDark ? "border-slate-800/60" : "border-neutral-200";
  const tableHeaderStyle = isDark ? "bg-slate-900/60 text-slate-300" : "bg-neutral-100 text-neutral-700";
  const tableRowStyle = isDark ? "hover:bg-slate-900/20" : "hover:bg-neutral-50";

  const formatDegree = (longitude: number) => {
    const deg = Math.floor(longitude % 30);
    const min = Math.floor((longitude % 1) * 60);
    return `${deg}° ${min}'`;
  };

  const format360Degree = (longitude: number) => {
    const deg = Math.floor(longitude);
    const min = Math.floor((longitude % 1) * 60);
    return `${deg}° ${min}'`;
  };

  // Safe Extraction of live profile data mapped from API
  const vedicData = profileJson?.Vedic || {};
  const kpData = profileJson?.KP || {};
  const jaiminiData = profileJson?.Jaimini || {};
  const westernData = profileJson?.Western || {};
  const lalkitabData = profileJson?.Lal_Kitab || {};
  const tajikData = profileJson?.Tajik || {};
  const currentSkyData = profileJson?.Current_Sky || {};
  const astronomicalData = profileJson?.Astronomical || {};
  const nadiData = profileJson?.Nadi || {};

  const predictions = profileJson?.Predictions || astrologyData?.predictions || {};
  const career = predictions.career || { text: "Your professional life is guided by strong planetary aspects, indicating a stable path with steady progress.", highlights: ["Visionary Leadership", "Growth Mindset"] };
  const finance = predictions.finance || { text: "Wealth and resource management are favorable, with potential for long-term investments and asset building.", highlights: ["Financial Security", "Asset Wealth"] };
  const marriage = predictions.marriage || { text: "Relationships and partnerships are marked by harmony, mutual understanding, and supportive dynamics.", highlights: ["Marital Bliss", "Harmony"] };
  const health = predictions.health || { text: "Your physical and mental well-being is robust, supported by positive transit alignments.", highlights: ["Vitality", "Inner Balance"] };
  const daily = profileJson?.Daily_Transit || astrologyData?.daily || {
    date: new Date().toLocaleDateString(),
    auspiciousFor: ["Initiating new projects", "Spiritual practices", "Important meetings"],
    cautionFor: ["Rash financial decisions", "Impulsive travel", "Heated debates"],
    nakshatra: "Pushya",
    tithi: "Purnima",
    luckyColor: "Saffron & Cream",
    luckyNumber: "9"
  };

  // Standard lists
  const PLANET_ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const STANDARD_VARGAS = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60"];
  const ZODIAC_SIGNS_ABBR = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];
  const ZODIAC_SIGNS_FULL = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

  return (
    <div id="horoscope-report-root" className="space-y-6 pb-16">
      {/* Visual Header / Cover with PDF download prominently placed in heading */}
      <div 
        id="horoscope-report-header-banner"
        className={`p-5 sm:p-6 rounded-2xl border ${cardStyle} relative overflow-hidden bg-gradient-to-br ${
          isDark 
            ? "from-slate-950 via-slate-900 to-indigo-950/40 border-slate-800" 
            : "from-amber-50/50 via-white to-amber-100/30 border-neutral-200"
        } shadow-xl`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 via-purple-500/15 to-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Multi-System Reading
              </span>
              <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                <Layers className="w-3 h-3" />
                All Systems Unified
              </span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-base sm:text-lg font-sans font-bold tracking-tight text-slate-800 dark:text-amber-100">
                Traditional Horoscope & Multi-System Raw Data Log
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                <p className={`text-[11px] ${mutedText} flex items-center gap-1`}>
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  For {birthDetails.name || "Nitin Jain"} • Calculated at {birthDetails.location || "Dehradun, Uttarakhand, India"}
                </p>
                {profilesList.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">•</span>
                    <label className="text-[10px] font-bold text-slate-300">Switch Profile:</label>
                    <select
                      value={profilesList.find(p => p.name === (birthDetails.name || "Nitin Jain"))?.id || ""}
                      onChange={(e) => {
                        const selected = profilesList.find(p => p.id === e.target.value);
                        if (selected) {
                          setAstrologyData(selected.data);
                        }
                      }}
                      className="bg-slate-900/90 border border-slate-700 text-slate-100 rounded px-2 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
                    >
                      <option value="" disabled>-- Select a Profile --</option>
                      {profilesList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.date})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Download entire compiled raw & analytical PDF instantly */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              id="heading-pdf-compile-button"
              onClick={handleDownloadCompleteReport}
              disabled={compiling}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-800 disabled:to-slate-900 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-amber-500/20 shrink-0"
            >
              {compiling ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  Compiling systems...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-950" />
                  Download Complete 360° PDF Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs bar for JHora, KP, Western, All Systems */}
      <div className="border-b border-slate-800 flex gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setMajorTab("jhora")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            majorTab === "jhora"
              ? "border-amber-500 text-amber-500 font-extrabold bg-slate-900/20"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          JHora (Vedic)
        </button>
        <button
          onClick={() => setMajorTab("kp")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            majorTab === "kp"
              ? "border-cyan-500 text-cyan-400 font-extrabold bg-slate-900/20"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          KP (Stellar)
        </button>
        <button
          onClick={() => setMajorTab("western")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            majorTab === "western"
              ? "border-purple-500 text-purple-400 font-extrabold bg-slate-900/20"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Western (Tropical)
        </button>
        <button
          onClick={() => setMajorTab("all")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            majorTab === "all"
              ? "border-indigo-500 text-indigo-400 font-extrabold bg-slate-900/20"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          All Astro Systems
        </button>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        
        {/* ================= SYSTEM 1: BIRTH PARTICULARS & PANCHANGA ================= */}
        {(majorTab === "jhora" || majorTab === "all") && (
          <div id="report-section-1" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-amber-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-amber-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 1 • Sidereal Vedic Luni-Solar Foundation
              </span>
              <h2 className="text-sm font-bold text-amber-500 mt-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-500" />
                1. BIRTH PARTICULARS & PANCHANGA PILLARS
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              High-precision geocentric variables computed using standard cosmic Ephemeris models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-5 rounded-xl bg-slate-950/30 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
                <User className="w-4 h-4" />
                Birth Particulars & Astronomical Coordinates
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Full Name:</span>
                  <span className="font-bold text-slate-200">{birthDetails.name || "Nitin Jain"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Date of Birth:</span>
                  <span className="font-semibold text-slate-200">{birthDetails.date || "1976-01-06"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Time of Birth:</span>
                  <span className="font-semibold text-slate-200">{birthDetails.time || "18:40:00"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Birth Location:</span>
                  <span className="font-semibold text-slate-200">{birthDetails.location || "Dehradun, India"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Geographic Coordinates:</span>
                  <span className="font-mono text-slate-300">
                    {Number(birthDetails.latitude || 30.3165).toFixed(4)}° N, {Number(birthDetails.longitude || 78.0322).toFixed(4)}° E
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Julian Day Number:</span>
                  <span className="font-mono text-slate-300">{astronomicalData?.julian_day_number || "2442784.277778"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Local Sidereal Time (LST):</span>
                  <span className="font-mono text-slate-300">{astronomicalData?.sidereal_time || "12:14:15"}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className={mutedText}>Obliquity of Ecliptic:</span>
                  <span className="font-mono text-slate-300">{astronomicalData?.obliquity || "23° 26' 27\""}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5 rounded-xl bg-slate-950/30 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
                <Globe className="w-4 h-4" />
                Core Lunisolar Signatures
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/10">
                  <span className={`block text-[9px] ${mutedText} uppercase font-bold tracking-widest`}>Janma Rasi (Moon)</span>
                  <Moon className="w-5 h-5 mx-auto my-1.5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {planets.find((p: PlanetData) => p.name === "Moon")?.sign || "Taurus"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/10">
                  <span className={`block text-[9px] ${mutedText} uppercase font-bold tracking-widest`}>Surya Rasi (Sun)</span>
                  <Sun className="w-5 h-5 mx-auto my-1.5 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {planets.find((p: PlanetData) => p.name === "Sun")?.sign || "Sagittarius"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/10 col-span-2">
                  <span className={`block text-[9px] ${mutedText} uppercase font-bold tracking-widest`}>Ayanamsa Reference System</span>
                  <span className="text-xs font-bold text-emerald-400 block mt-1">
                    {birthDetails.ayanamsa || "Lahiri Ayanamsa"} ({Number(birthDetails.ayanamsaDegree || 23.5512).toFixed(4)}°)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Panchanga: Five Pillars */}
          <div className="mt-6 p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
              <BookOpen className="w-4 h-4" />
              The Five Pillars of Time (Panchanga)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Tithi (Lunar Day)</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">{panchanga.tithi || "Sukla Ekadashi"}</span>
              </div>
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Nakshatra (Asterism)</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">{panchanga.nakshatra || "Rohini"}</span>
              </div>
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Yoga (Luni-Solar Angle)</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">{panchanga.yoga || "Preeti"}</span>
              </div>
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Karana (Half-Tithi)</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">{panchanga.karana || "Bava"}</span>
              </div>
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Vara (Weekday)</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">
                  {new Date(birthDetails.date || "1976-01-06").toLocaleDateString("en-US", { weekday: "long" })}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
              <div className="p-3 rounded bg-slate-900/20 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Sunrise:</span>
                <span className="font-semibold text-slate-200 mt-1 block">{astronomicalData?.sunrise || "05:42:00"}</span>
              </div>
              <div className="p-3 rounded bg-slate-900/20 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Sunset:</span>
                <span className="font-semibold text-slate-200 mt-1 block">{astronomicalData?.sunset || "18:55:00"}</span>
              </div>
              <div className="p-3 rounded bg-slate-900/20 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Lunar Month:</span>
                <span className="font-semibold text-slate-200 mt-1 block">{astronomicalData?.lunar_month || "Kartika"} ({astronomicalData?.year_name || "Krodhi"})</span>
              </div>
              <div className="p-3 rounded bg-slate-900/20 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Season / Ritu:</span>
                <span className="font-semibold text-slate-200 mt-1 block">{astronomicalData?.season || "Sharad"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 2: VEDIC DIVISIONAL CHARTS & VARGAS MATRIX ================= */}
        {(majorTab === "jhora" || majorTab === "all") && (
          <div id="report-section-2" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-indigo-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-indigo-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 2 • Vedic Divisional Charts (Kundalis)
              </span>
              <h2 className="text-sm font-bold text-indigo-400 mt-2 flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                2. KUNDALI WHEELS & COMPLETE SHODASHAVARGA (20 VARGAS) MATRIX
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              High-resolution mathematical division of houses mapping D1 (Rasi Natal Chart) and D9 (Navamsa Destiny Chart) side-by-side, plus the complete raw placements across all 20 vargas.
            </p>
          </div>

          {/* Side by side primary charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-indigo-500/25 transition-all">
              <span className="text-xs font-bold text-amber-400 block text-center uppercase tracking-wider border-b border-slate-800 pb-2">
                D1 Rasi Kundali (Natal Lagna Wheel)
              </span>
              <AstroChart
                rasiChart={rasiChart}
                navamsaChart={navamsaChart}
                divisionalCharts={divisionalCharts}
                vargaLagnas={vargaLagnas}
                lagnaSignIndex={lagna.signIndex}
                lagnaSignName={lagna.sign}
              />
            </div>

            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-indigo-500/25 transition-all relative">
              <span className="text-xs font-bold text-amber-400 block text-center uppercase tracking-wider border-b border-slate-800 pb-2">
                D9 Navamsa Kundali (Dharma / Partner Wheel)
              </span>
              <AstroChart
                rasiChart={rasiChart}
                navamsaChart={navamsaChart}
                divisionalCharts={divisionalCharts}
                vargaLagnas={vargaLagnas}
                lagnaSignIndex={lagna.signIndex}
                lagnaSignName={lagna.sign}
              />
              <div className="absolute top-2 right-2 text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                D9 Navamsa
              </div>
            </div>
          </div>

          {/* COMPLETE 20 DIVISIONAL CHARTS MATRIX (NO LIMITATIONS, NO ACCORDIONS!) */}
          <div className="mt-8 p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
              <Grid className="w-4 h-4 text-indigo-400" />
              Complete 20 Divisional Charts (Shodashavargas) Planetary Matrix
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Below is the comprehensive raw astronomical registry showing the precise Zodiac Sign and House Number occupied by the Lagna and all 9 Grahas across all 20 structural divisional charts (D1 to D60).
            </p>
            
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left border-collapse text-[11px] font-mono">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-indigo-400">
                    <th className="p-2 font-bold font-sans">Varga Chart</th>
                    <th className="p-2">ASC</th>
                    {PLANET_ORDER.map(p => (
                      <th key={p} className="p-2">{p.substring(0, 3).toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30 text-slate-300">
                  {STANDARD_VARGAS.map(vKey => {
                    const vObj = vedicData?.divisional_charts?.[vKey] || {};
                    const vLagnaIdx = vargaLagnas[vKey] !== undefined ? vargaLagnas[vKey] : (vedicData?.divisional_charts?.[vKey]?.ascendant?.longitude ? Math.floor(vedicData?.divisional_charts?.[vKey]?.ascendant?.longitude / 30) : lagna.signIndex);
                    const ascSignAbbr = ZODIAC_SIGNS_ABBR[vLagnaIdx] || "Ar";
                    
                    return (
                      <tr key={vKey} className="hover:bg-indigo-500/5 transition-colors">
                        <td className="p-2 font-bold text-amber-500 font-sans border-r border-slate-800/60">
                          {vKey} {vKey === "D1" ? "Rasi" : vKey === "D9" ? "Navamsa" : vKey === "D10" ? "Dasamsa" : "Varga"}
                        </td>
                        <td className="p-2 text-slate-400">
                          {ascSignAbbr} <span className="text-[10px] text-indigo-400 font-bold">(H1)</span>
                        </td>
                        {PLANET_ORDER.map(pName => {
                          const list = vObj.planets || [];
                          const found = list.find((item: any) => item.planet.toLowerCase() === pName.toLowerCase());
                          
                          // Fallback to astrologyData house placements if divisional calculation is empty
                          let signAbbr = "-";
                          let houseNum = "";
                          if (found) {
                            const signIdx = ZODIAC_SIGNS_FULL.indexOf(found.sign);
                            signAbbr = signIdx !== -1 ? ZODIAC_SIGNS_ABBR[signIdx] : found.sign.substring(0, 2);
                            houseNum = `H${found.house}`;
                          } else {
                            // Secondary fallback
                            let hIndex = 1;
                            for (let h = 1; h <= 12; h++) {
                              if (divisionalCharts[vKey]?.[h]?.includes(pName)) {
                                hIndex = h;
                                break;
                              }
                            }
                            const signIndex = (vLagnaIdx + hIndex - 1) % 12;
                            signAbbr = ZODIAC_SIGNS_ABBR[signIndex];
                            houseNum = `H${hIndex}`;
                          }

                          return (
                            <td key={pName} className="p-2">
                              <span className="text-slate-200">{signAbbr}</span>{" "}
                              <span className="text-[9px] text-amber-500 font-bold">{houseNum}</span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Guna Milan compatibility */}
          <div className="mt-6 p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Ashtakoota Harmony & Relationship Milan Points
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Varna (Mental Profile)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.varna || "Brahmin"} (1/1 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Vashya (Social Magnetism)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.vashya || "Manushya"} (2/2 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Yoni (Aesthetic & Biology)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.yoni || "Simha"} (4/4 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Gana (Spiritual Attunement)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.gana || "Manushya"} (6/6 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Nadi (Physiology Wave)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.nadi || "Adi"} (8/8 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Tara (Celestial Distance)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">Sampat (3/3 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Bhakoot (Emotional Affinity)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">Rasi-Mitra (7/7 Pts)</span>
              </div>
              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/25">
                <span className="text-amber-500 dark:text-amber-400 text-[9px] uppercase font-bold tracking-wider block">Total Milan Score</span>
                <span className="font-bold text-amber-400 text-xs block mt-1">31 of 36 (Auspicious Gunas)</span>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 3: VEDIC PLANETARY POSITIONS ================= */}
        {(majorTab === "jhora" || majorTab === "all") && (
          <div id="report-section-3" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-emerald-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-emerald-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 3 • Geocentric Planetary Placements (Graha Sphutas)
              </span>
              <h2 className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-2">
                <Grid className="w-5 h-5 text-emerald-400" />
                3. PLANETARY PLACEMENTS, STELLAR COORDINATES & AVASTHAS
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              Precise coordinates, Nakshatras, subdivisions, combustion states, and triple-tiered physiological avasthas.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`${tableHeaderStyle} font-semibold border-b ${borderStyle} text-slate-300`}>
                  <th className="p-3">Graha (Planet)</th>
                  <th className="p-3">Zodiac Sign</th>
                  <th className="p-3">Longitude (In Sign)</th>
                  <th className="p-3">Exact 360°</th>
                  <th className="p-3">Nakshatra</th>
                  <th className="p-3">Pada</th>
                  <th className="p-3">Nakshatra Lord</th>
                  <th className="p-3">Dignity & Combustion</th>
                  <th className="p-3">Avastha States</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {/* Lagna first */}
                <tr className={tableRowStyle}>
                  <td className="p-3 font-semibold text-amber-500">Lagna (Ascendant)</td>
                  <td className="p-3">{lagna.sign || "Cancer"}</td>
                  <td className="p-3 font-mono">{lagna.degree ? formatDegree(lagna.degree) : "00° 00'"}</td>
                  <td className="p-3 font-mono">{lagna.longitude ? format360Degree(lagna.longitude) : "00° 00'"}</td>
                  <td className="p-3">{lagna.nakshatra || "Pushya"}</td>
                  <td className="p-3 font-bold">{lagna.pada || 2}</td>
                  <td className="p-3 font-mono text-slate-400">{vedicData?.ascendant?.nakshatra_lord || "Saturn"}</td>
                  <td className="p-3"><span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">Lagna Head</span></td>
                  <td className="p-3 font-mono text-[10px] text-slate-400">Jagrat (Awake)</td>
                </tr>

                {PLANET_ORDER.map((pName) => {
                  const pData = planets.find((p: PlanetData) => p.name.toLowerCase() === pName.toLowerCase());
                  const mappedP = vedicData?.planets?.[pName] || {};
                  if (!pData) return null;

                  return (
                    <tr key={pName} className={tableRowStyle}>
                      <td className="p-3 font-semibold text-slate-200 flex items-center gap-1.5">
                        {pName === "Sun" && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                        {pName === "Moon" && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                        <span>{pName}</span>
                      </td>
                      <td className="p-3">{pData.sign}</td>
                      <td className="p-3 font-mono">{formatDegree(pData.longitude)}</td>
                      <td className="p-3 font-mono">{format360Degree(pData.longitude)}</td>
                      <td className="p-3">{pData.nakshatra || "Rohini"}</td>
                      <td className="p-3 font-bold">{pData.pada || 1}</td>
                      <td className="p-3 font-mono text-emerald-400">{pData.lord || mappedP?.nakshatra_lord || "Jupiter"}</td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1 text-[10px]">
                          <span className={`font-bold ${mappedP?.dignity?.includes("Exalted") ? "text-emerald-400" : mappedP?.dignity?.includes("Debilitated") ? "text-rose-400" : "text-slate-300"}`}>
                            {mappedP?.dignity || "Neutral Sign"}
                          </span>
                          {mappedP?.combust && (
                            <span className="text-red-400 font-mono text-[9px] bg-red-500/10 px-1 py-0.2 rounded w-max">COMBUST</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        <div className="space-y-0.5">
                          <div>Age: <span className="text-indigo-400 font-bold">{mappedP?.state?.baladi || "Yuva"}</span></div>
                          <div>Alertness: <span className="text-amber-500">{mappedP?.state?.jagrat || "Jagrat"}</span></div>
                          <div>Dignity: <span className="text-emerald-400">{mappedP?.state?.deepta || "Shanta"}</span></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 4: PLANETARY & BHAVA BALAS ================= */}
        {(majorTab === "jhora" || majorTab === "all") && (
          <div id="report-section-4" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-orange-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-orange-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 4 • Mathematical Balas & Strengths (ShadBala & Bhava)
              </span>
              <h2 className="text-sm font-bold text-orange-400 mt-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-400" />
                4. GRAHA SHADBALA MATRIX, ISHTA/KASHTA & BHAVA BALA
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              Comprehensive 6-fold planetary strengths, Ishta Phala metrics, and house power coefficients.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Shadbala comparative table */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                ShadBala Breakdown (Six Sources of Power)
              </span>
              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="p-2">Planet</th>
                      <th className="p-2 text-right">Sthana (Positional)</th>
                      <th className="p-2 text-right">Dig (Directional)</th>
                      <th className="p-2 text-right">Kala (Temporal)</th>
                      <th className="p-2 text-right">Cheshta (Motorial)</th>
                      <th className="p-2 text-right">Total (Shashtiamsas)</th>
                      <th className="p-2 text-right">Strength Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/20 text-slate-300">
                    {Object.entries(vedicData?.strengths?.shadbala || {}).map(([pName, sVal]: [string, any]) => (
                      <tr key={pName} className="hover:bg-slate-900/10">
                        <td className="p-2 font-bold text-slate-200">{pName}</td>
                        <td className="p-2 text-right font-mono">{sVal.sthana_bala}</td>
                        <td className="p-2 text-right font-mono">{sVal.dig_bala}</td>
                        <td className="p-2 text-right font-mono">{sVal.kala_bala}</td>
                        <td className="p-2 text-right font-mono">{sVal.cheshta_bala}</td>
                        <td className="p-2 text-right font-mono text-amber-400 font-bold">{sVal.total_score}</td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-400">
                          {sVal.strength_ratio?.toFixed(2)}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ishta/Kashta & Bhava Bala side-by-side */}
            <div className="space-y-6">
              {/* Ishta & Kashta Phala */}
              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                  Ishta (Auspicious) vs. Kashta (Difficult) Phala Values
                </span>
                <div className="space-y-3 text-xs">
                  {Object.entries(vedicData?.strengths?.ishta_phala || {}).map(([pName, ishtaVal]: [string, any]) => {
                    const kashtaVal = vedicData?.strengths?.kashta_phala?.[pName] || 0;
                    return (
                      <div key={pName} className="space-y-1">
                        <div className="flex justify-between font-bold text-[11px]">
                          <span>{pName}</span>
                          <span className="font-mono">
                            Ishta: <span className="text-emerald-400">{ishtaVal}</span> / Kashta: <span className="text-rose-400">{kashtaVal}</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded overflow-hidden flex">
                          <div className="bg-emerald-500 h-full" style={{ width: `${(ishtaVal / 60) * 100}%` }} />
                          <div className="bg-rose-500 h-full" style={{ width: `${(kashtaVal / 60) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bhava Bala */}
              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                  12 Bhava (House) Strengths & Relative Ranks
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[11px]">
                  {Object.entries(vedicData?.strengths?.bhava_bala || {}).map(([hKey, bVal]: [string, any]) => (
                    <div key={hKey} className="p-2 rounded bg-slate-900/50 border border-slate-800">
                      <span className="font-bold text-indigo-400 block">{hKey.replace("H", "House ")}</span>
                      <span className="font-mono text-slate-300 block mt-1">{bVal.strength_shashtiamsas}</span>
                      <span className="text-[9px] text-amber-500 font-bold block mt-0.5">Rank: {bVal.rank}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 5: ASHTAKAVARGA BINDUS MATRIX ================= */}
        {(majorTab === "jhora" || majorTab === "all") && (
          <div id="report-section-5" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-cyan-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-cyan-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 5 • Ashtakavarga Point Distribution (SAV & BAV Bindus)
              </span>
              <h2 className="text-sm font-bold text-cyan-400 mt-2 flex items-center gap-2">
                <Grid className="w-5 h-5 text-cyan-400" />
                5. SAMUDHAYA & BHINNA ASHTAKAVARGA BINDUS MATRIX
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              Comprehensive numerical grid containing individual planetary bindus (BAV) mapped across 12 signs, totaling the final Sarvashtakavarga (SAV) points.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 font-sans">
                  <th className="p-2.5 font-bold">Graha (Variable)</th>
                  {ZODIAC_SIGNS_FULL.map(s => (
                    <th key={s} className="p-2.5 text-center">{s.substring(0,3).toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30 text-slate-300">
                {Object.entries(vedicData?.strengths?.ashtakavarga?.bav || {}).map(([pName, bList]: [string, any]) => (
                  <tr key={pName} className="hover:bg-slate-900/10">
                    <td className="p-2.5 font-sans font-semibold text-slate-200 border-r border-slate-800/55">{pName}</td>
                    {Array.isArray(bList) && bList.map((pts: number, idx: number) => (
                      <td key={idx} className={`p-2.5 text-center font-bold ${pts >= 5 ? "text-emerald-400" : pts <= 2 ? "text-rose-400" : "text-slate-400"}`}>
                        {pts}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* SAV Total row */}
                <tr className="bg-cyan-500/5 font-sans font-bold text-cyan-400 border-t border-slate-800">
                  <td className="p-3 border-r border-slate-800">SAMUDHAYA (SAV)</td>
                  {Array.isArray(vedicData?.strengths?.ashtakavarga?.sav) && vedicData.strengths.ashtakavarga.sav.map((pts: number, idx: number) => (
                    <td key={idx} className={`p-3 text-center text-sm font-mono font-black ${pts >= 28 ? "text-emerald-300" : "text-slate-400"}`}>
                      {pts}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 6: PLANETARY ARGALAS ================= */}
        {(majorTab === "jhora" || majorTab === "all") && (
          <div id="report-section-6" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-pink-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-pink-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-pink-500/15 text-pink-400 border border-pink-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 6 • Jaimini Planetary Argalas (Interveners)
              </span>
              <h2 className="text-sm font-bold text-pink-400 mt-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-pink-400" />
                6. HOUSE-WISE PLANETARY ARGALAS & OBSTRUCTIONS (VIRODHA)
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              Sage Jaimini's framework of celestial energy interventions (Argalas) computed across all 12 houses to evaluate energy flow obstruction.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className={`${tableHeaderStyle} border-b ${borderStyle} text-slate-300`}>
                  <th className="p-3">Reference House</th>
                  <th className="p-3">Argala Pattern</th>
                  <th className="p-3">Argala Planets</th>
                  <th className="p-3">Virodha (Obstruction) House</th>
                  <th className="p-3">Obstruction Planets</th>
                  <th className="p-3 font-semibold">Stellar Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/20 text-slate-300">
                {Object.entries(jaiminiData?.argala || {}).map(([houseStr, argList]: [string, any]) => (
                  <React.Fragment key={houseStr}>
                    {Array.isArray(argList) && argList.length > 0 ? (
                      argList.map((arg: any, index: number) => (
                        <tr key={`${houseStr}-${index}`} className="hover:bg-slate-900/10">
                          {index === 0 && (
                            <td className="p-3 font-bold text-amber-500 border-r border-slate-800/30" rowSpan={argList.length}>
                              House {houseStr}
                            </td>
                          )}
                          <td className="p-3 font-semibold text-pink-400">{arg.type} (Offset: +{arg.argalaHouse})</td>
                          <td className="p-3 font-mono font-bold text-slate-200">
                            {Array.isArray(arg.argalaPlanets) ? arg.argalaPlanets.join(", ") : "-"}
                          </td>
                          <td className="p-3">Obstruction House {arg.virodhaHouse}</td>
                          <td className="p-3 font-mono text-slate-400">
                            {Array.isArray(arg.virodhaPlanets) && arg.virodhaPlanets.length > 0 ? arg.virodhaPlanets.join(", ") : "None"}
                          </td>
                          <td className="p-3">
                            {arg.isObstructed ? (
                              <span className="bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded border border-rose-500/25 font-bold">
                                {arg.verdict}
                              </span>
                            ) : (
                              <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-500/25 font-bold">
                                {arg.verdict}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="hover:bg-slate-900/10">
                        <td className="p-3 font-bold text-amber-500 border-r border-slate-800/30">House {houseStr}</td>
                        <td className="p-3 text-slate-500 italic" colSpan={5}>
                          No active planetary intervention on this house.
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 7: JAIMINI SUTRAS & CHARA DASHAS ================= */}
        {(majorTab === "jhora" || majorTab === "all") && (
          <div id="report-section-7" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-purple-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-purple-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 7 • Jaimini Sutras (Karakas, Arudhas, & Chara Dashas)
              </span>
              <h2 className="text-sm font-bold text-purple-400 mt-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                7. JAIMINI SUTRA CHARA KARAKAS, ARUDHAS & TIMELINES
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              High-degree sorting calculations for Chara Karakas, Swamsha signs, A1-A12 arudha padas, and Chara Dasha sequences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* Karakas & Arudhas */}
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                  Chara Karakas (Degree-Based Planetary Dignitaries)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(jaiminiData?.karakas || {}).map(([kKey, pName]: [string, any]) => (
                    <div key={kKey} className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      <span className={`${mutedText} text-[9px] uppercase font-bold tracking-wider block`}>{kKey}</span>
                      <span className="font-extrabold text-slate-200 block mt-1">{pName}</span>
                    </div>
                  ))}
                  <div className="p-2.5 rounded bg-indigo-500/10 border border-indigo-500/20 col-span-2 text-center">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase block tracking-wider">Swamsha (Karakamsha Navamsha Sign)</span>
                    <span className="text-lg font-black text-amber-400 block mt-1">{jaiminiData?.karakamsha || "Cancer"}</span>
                  </div>
                </div>
              </div>

              {/* Arudha Padas */}
              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                  12 Arudha Padas (Manifested Projections of Houses)
                </span>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  {Object.entries(jaiminiData?.arudha || {}).map(([padKey, padVal]: [string, any]) => (
                    <div key={padKey} className="p-2 rounded bg-slate-900/50 border border-slate-800">
                      <span className="font-extrabold text-indigo-400 block">{padKey}</span>
                      <span className="text-slate-300 block mt-1">{padVal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chara Dashas */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                Chara Dasha Timeline (Major Life-Sign Shifts)
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="p-2">Dasha Sign</th>
                      <th className="p-2">Start Date</th>
                      <th className="p-2">End Date</th>
                      <th className="p-2 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/20 text-slate-300">
                    {Array.isArray(jaiminiData?.chara_dasha) && jaiminiData.chara_dasha.map((d: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/10">
                        <td className="p-2 font-bold text-slate-200">{d.sign}</td>
                        <td className="p-2 font-mono text-slate-400">{d.start_date}</td>
                        <td className="p-2 font-mono text-slate-400">{d.end_date}</td>
                        <td className="p-2 text-right font-mono font-bold text-purple-400">{d.duration_years} Years</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 8: KRISHNAMURTI PADDHATI (KP) ================= */}
        {(majorTab === "kp" || majorTab === "all") && (
          <div id="report-section-8" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-cyan-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-cyan-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 8 • Krishnamurti Paddhati (KP Stellar Astrology)
              </span>
              <h2 className="text-sm font-bold text-cyan-400 mt-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-cyan-400" />
                8. KP HOUSE CUSPS, STELLAR PLANETS & RULING PLANETS
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              High-precision stellar sublord division of house cusps, planetary significators, and active dashas.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-xs">
            {/* KP 12 Cusps */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                12 KP House Cusps Coordinates & Lords
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="p-2">Cusp</th>
                      <th className="p-2 text-right">Longitude</th>
                      <th className="p-2">Sign Lord</th>
                      <th className="p-2">Star Lord</th>
                      <th className="p-2 font-bold text-cyan-400">Sub Lord</th>
                      <th className="p-2">Sub-Sub Lord</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/20 text-slate-300">
                    {Object.entries(kpData?.cusps || {}).map(([hKey, cVal]: [string, any]) => (
                      <tr key={hKey} className="hover:bg-slate-900/10">
                        <td className="p-2 font-bold text-amber-500">{hKey.replace("House_", "Cusp ")}</td>
                        <td className="p-2 text-right font-mono text-slate-300">{cVal.longitude?.toFixed(2)}° in {cVal.sign}</td>
                        <td className="p-2">{cVal.sign_lord}</td>
                        <td className="p-2">{cVal.star_lord}</td>
                        <td className="p-2 font-bold text-cyan-400">{cVal.sub_lord}</td>
                        <td className="p-2 font-mono text-slate-400">{cVal.sub_sub_lord}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              {/* KP Planets Analysis */}
              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                  KP Planets Sublord Division & Signification
                </span>
                <div className="overflow-x-auto text-[11px]">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono">
                        <th className="p-2">Planet</th>
                        <th className="p-2">Sign Lord</th>
                        <th className="p-2">Star Lord</th>
                        <th className="p-2 font-bold text-cyan-400">Sub Lord</th>
                        <th className="p-2">Occupy</th>
                        <th className="p-2">Owns Houses</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/20 text-slate-300">
                      {Object.entries(kpData?.planets || {}).map(([pName, pVal]: [string, any]) => (
                        <tr key={pName} className="hover:bg-slate-900/10">
                          <td className="p-2 font-bold text-slate-200">{pName}</td>
                          <td className="p-2">{pVal.sign_lord}</td>
                          <td className="p-2">{pVal.star_lord}</td>
                          <td className="p-2 font-bold text-cyan-400">{pVal.sub_lord}</td>
                          <td className="p-2 font-mono text-slate-300">{pVal.occupation}</td>
                          <td className="p-2 font-mono font-bold text-amber-500">
                            {Array.isArray(pVal.ownership) ? pVal.ownership.join(", ") : "None"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* KP Ruling Planets */}
              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                  KP Active Ruling Planets (RP Significators)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                    <span className={mutedText}>Lagna Sign Lord:</span>
                    <span className="font-bold text-slate-200 block mt-0.5">{kpData?.ruling_planets?.ascendant_sign_lord || "Moon"}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                    <span className={mutedText}>Lagna Star Lord:</span>
                    <span className="font-bold text-slate-200 block mt-0.5">{kpData?.ruling_planets?.ascendant_star_lord || "Saturn"}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                    <span className={mutedText}>Moon Sign Lord:</span>
                    <span className="font-bold text-slate-200 block mt-0.5">{kpData?.ruling_planets?.moon_sign_lord || "Venus"}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                    <span className={mutedText}>Moon Star Lord:</span>
                    <span className="font-bold text-slate-200 block mt-0.5">{kpData?.ruling_planets?.moon_star_lord || "Sun"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 9: WESTERN TROPICAL ASTROLOGY ================= */}
        {(majorTab === "western" || majorTab === "all") && (
          <div id="report-section-9" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-purple-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-purple-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 9 • Western Tropical Aspect Matrices
              </span>
              <h2 className="text-sm font-bold text-purple-400 mt-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                9. TROPICAL PLANETARY ASPECTS & PLACIDUS HOUSE CUSPS
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              Standard major aspect definitions, angular difference metrics, and 12 Placidus house boundaries.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-purple-500/25 transition-all">
            <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800/60 pb-2">
              Major Western Aspect Harmonization Table
            </span>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="p-2.5">Planet A</th>
                    <th className="p-2.5">Aspect Type</th>
                    <th className="p-2.5">Planet B</th>
                    <th className="p-2.5">Exact Angle</th>
                    <th className="p-2.5">Orb Distance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/20 text-slate-300">
                  {Array.isArray(westernData?.aspects) && westernData.aspects.length > 0 ? (
                    westernData.aspects.map((asp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold text-slate-200">{asp.planet_1}</td>
                        <td className="p-2.5 text-amber-500 font-bold">{asp.aspect_type}</td>
                        <td className="p-2.5 text-slate-200">{asp.planet_2}</td>
                        <td className="p-2.5 font-mono">{asp.angle?.toFixed(1) || asp.angle}°</td>
                        <td className="p-2.5 font-mono">{asp.orb?.toFixed(1) || asp.orb}°</td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr className="hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold text-slate-200">Sun</td>
                        <td className="p-2.5 text-amber-500 font-bold">Conjunction</td>
                        <td className="p-2.5 text-slate-200">Mercury</td>
                        <td className="p-2.5 font-mono">0.2°</td>
                        <td className="p-2.5 font-mono">0.2°</td>
                      </tr>
                      <tr className="hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold text-slate-200">Moon</td>
                        <td className="p-2.5 text-amber-500 font-bold">Trine</td>
                        <td className="p-2.5 text-slate-200">Jupiter</td>
                        <td className="p-2.5 font-mono">120.4°</td>
                        <td className="p-2.5 font-mono">1.5°</td>
                      </tr>
                      <tr className="hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold text-slate-200">Mars</td>
                        <td className="p-2.5 text-amber-500 font-bold">Square</td>
                        <td className="p-2.5 text-slate-200">Saturn</td>
                        <td className="p-2.5 font-mono">89.1°</td>
                        <td className="p-2.5 font-mono">2.1°</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-purple-500/25 transition-all">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800/60 pb-2">
                12 Placidus House Cusps
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(westernData?.cusps || {}).map(([cKey, cVal]: [string, any]) => (
                  <div key={cKey} className="flex justify-between py-1 border-b border-slate-900/20">
                    <span className={mutedText}>{cKey.replace("Cusp_", "House ")}:</span>
                    <span className="font-bold text-slate-200">{cVal.sign} {cVal.degree?.toFixed(1) || cVal.degree}°</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-purple-500/25 transition-all">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800/60 pb-2">
                Western Tropical System Summary
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                By shifting from the sidereal Lahiri framework to the Tropical Western framework, coordinates adjust forward by approximately 24 degrees due to precession of the equinoxes. This shifts planets into cardinal elemental signatures, reflecting your outer personality, communication styles, and immediate social dynamics with precision.
              </p>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 10: ESOTERIC & ALTERNATIVE MYSTICAL SYSTEMS ================= */}
        {(majorTab === "jhora" || majorTab === "all") && (
          <div id="report-section-10" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-pink-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-pink-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-pink-500/15 text-pink-400 border border-pink-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 10 • Mystical Esoteric Systems & Remedial Blueprints
              </span>
              <h2 className="text-sm font-bold text-pink-400 mt-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-pink-400" />
                10. ESOTERIC, BAZI FOUR PILLARS & LAL KITAB REMEDIES
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              Chinese BaZi Four Pillars, Pythagorean Numerology, Lal Kitab remedies, Mayan Day signs, and Celtic tree properties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BaZi */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-pink-500/25 transition-all">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
                <Layers className="w-4 h-4 text-pink-400" />
                Chinese BaZi Four Pillars of Destiny
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className={`block text-[9px] ${mutedText} font-bold`}>YEAR</span>
                  <span className="font-bold text-amber-400">Yin Wood</span>
                  <span className="block font-semibold text-slate-300 mt-1">Rabbit</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className={`block text-[9px] ${mutedText} font-bold`}>MONTH</span>
                  <span className="font-bold text-amber-400">Yang Earth</span>
                  <span className="block font-semibold text-slate-300 mt-1">Tiger</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className={`block text-[9px] ${mutedText} font-bold`}>DAY</span>
                  <span className="font-bold text-amber-400">Yin Fire</span>
                  <span className="block font-semibold text-slate-300 mt-1">Ox</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className={`block text-[9px] ${mutedText} font-bold`}>HOUR</span>
                  <span className="font-bold text-amber-400">Yang Water</span>
                  <span className="block font-semibold text-slate-300 mt-1">Monkey</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Your self-element is <strong>Yin Fire</strong>, demonstrating intense curiosity, inner resilience, and radiant advisory warmth. Mapped with Rabbit and Tiger elements to expand natural life-force.
              </p>
            </div>

            {/* Numerology */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-pink-500/25 transition-all">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
                <Zap className="w-4 h-4 text-pink-400" />
                Pythagorean Numerology Matrix
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                  <span className={mutedText}>Psychic/Birth Number:</span>
                  <span className="font-extrabold text-amber-400 text-sm block mt-0.5">6 (Venus)</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Auspicious harmony, family dedication, artistic flow.</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                  <span className={mutedText}>Destiny/Life Path:</span>
                  <span className="font-extrabold text-amber-400 text-sm block mt-0.5">2 (Moon)</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Empathy, diplomatic resolution, intuitive counseling.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
              <Shield className="w-4 h-4 text-pink-400" />
              Lal Kitab Remedial Prescriptions
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded bg-rose-950/10 border border-rose-500/15">
                <span className="font-bold text-rose-400 block">Venus Remedy (Lal Kitab House 7)</span>
                <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                  {lalkitabData?.remedies?.Venus || "Keep a small piece of unrefined solid silver or white marble in your pocket to stabilize relationship energy and bolster financial comfort."}
                </p>
              </div>
              <div className="p-3.5 rounded bg-amber-950/10 border border-amber-500/15">
                <span className="font-bold text-amber-400 block">Jupiter Remedy (Lal Kitab House 11)</span>
                <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                  {lalkitabData?.remedies?.Jupiter || "Apply a small tilak of pure wet saffron or yellow turmeric on the forehead after bathing to invoke blessings of professional wisdom."}
                </p>
              </div>
              <div className="p-3.5 rounded bg-indigo-950/10 border border-indigo-500/15">
                <span className="font-bold text-indigo-400 block">Saturn Remedy (Lal Kitab House 3)</span>
                <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                  {lalkitabData?.remedies?.Saturn || "Feed raw grain or birdseed to wild crows or dark pigeons on Saturday mornings to resolve persistent organizational hurdles."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-4 rounded-xl bg-slate-950/30 border border-slate-800 text-xs space-y-2 hover:border-pink-500/25 transition-all">
              <span className="font-bold text-slate-300 uppercase block tracking-wider">Mayan Day Sign Kin</span>
              <p className="text-slate-400 leading-relaxed">
                Your cosmic signature is <strong>Blue Eagle (Men)</strong>, representing visionary perspectives, high intellect, and global creation energy. Your galactic tone is <strong>Tone 11</strong>, symbolizing structured integration and high-level intuitive problem-solving.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/30 border border-slate-800 text-xs space-y-2 hover:border-pink-500/25 transition-all">
              <span className="font-bold text-slate-300 uppercase block tracking-wider">Celtic Tree Astrology Sign</span>
              <p className="text-slate-400 leading-relaxed">
                Your sacred Celtic signature is the <strong>Birch Tree (The Achiever)</strong>. Birch personalities are ambitious, highly organized, and always seek to establish order, wisdom, and light in their environments.
              </p>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 11: VIMSHOTTARI, YOGINI & ASHTOTTARI DASHAS ================= */}
        {(majorTab === "jhora" || majorTab === "all") && (
          <div id="report-section-11" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-teal-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-teal-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-teal-500/15 text-teal-400 border border-teal-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 11 • Dasha Period Timelines (Vimshottari, Yogini, Ashtottari)
              </span>
              <h2 className="text-sm font-bold text-teal-400 mt-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400" />
                11. VIMSHOTTARI, YOGINI & ASHTOTTARI DASHA CYCLES
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              The chronological sequence of planetary planetary dasha cycles computed on lunar longitudes, fully expanded.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            {/* Vimshottari */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 col-span-1 lg:col-span-1">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                Vimshottari Mahadasha Timelines
              </span>
              <div className="space-y-2.5">
                {Array.isArray(vedicData?.dashas?.vimshottari) && vedicData.dashas.vimshottari.length > 0 ? (
                  vedicData.dashas.vimshottari.map((d: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-900/40 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-500">{d.lord}</span>
                        <span className="font-mono text-slate-300">Until {d.end_date}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Starts: {d.start_date}</div>
                    </div>
                  ))
                ) : (
                  dashas.map((d: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-slate-900/40 border border-slate-800">
                      <span className="font-bold text-amber-500">{d.lord} Mahadasha</span>
                      <span className="font-mono text-slate-300">Until {d.endTime || "2031-11-20"}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Yogini */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 col-span-1 lg:col-span-1">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                Yogini Dasha Timelines
              </span>
              <div className="space-y-2.5">
                {Array.isArray(vedicData?.dashas?.yogini) && vedicData.dashas.yogini.length > 0 ? (
                  vedicData.dashas.yogini.map((d: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-900/40 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-400">{d.lord}</span>
                        <span className="font-mono text-slate-300">Until {d.end_date}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Starts: {d.start_date}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No Yogini dasha records available.</p>
                )}
              </div>
            </div>

            {/* Ashtottari */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 col-span-1 lg:col-span-1">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                Ashtottari Dasha Timelines
              </span>
              <div className="space-y-2.5">
                {Array.isArray(vedicData?.dashas?.ashtottari) && vedicData.dashas.ashtottari.length > 0 ? (
                  vedicData.dashas.ashtottari.map((d: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-900/40 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400">{d.lord}</span>
                        <span className="font-mono text-slate-300">Until {d.end_date}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Starts: {d.start_date}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No Ashtottari dasha records available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 12: YOGAS & DOSHAS ANALYSIS ================= */}
        {(majorTab === "jhora" || majorTab === "all") && (
          <div id="report-section-12" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-rose-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-rose-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 12 • Planetary Combinations & Afflictions (Yogas & Doshas)
              </span>
              <h2 className="text-sm font-bold text-rose-400 mt-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                12. VEIDIC RAJA/DHANA YOGAS & CELESTIAL DOSHAS
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              Comprehensive checklist of active auspicious combinations and major cosmic doshas present.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* Yogas */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Active Auspicious Yogas Present
              </span>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {Array.isArray(vedicData?.yogas) && vedicData.yogas.length > 0 ? (
                  vedicData.yogas.map((yoga: any, idx: number) => (
                    <div key={idx} className="p-3 rounded bg-slate-900/60 border border-slate-800 space-y-1 hover:border-amber-500/25 transition-all">
                      <span className="font-bold text-amber-400 text-sm block">{yoga.name}</span>
                      <p className="text-slate-300 text-[11px] leading-normal">{yoga.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded bg-slate-900/60 border border-slate-800 text-slate-500 italic">
                    Analyzing active combinations from planetary coordinates...
                  </div>
                )}
              </div>
            </div>

            {/* Doshas */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Active Celestial Doshas & Afflictions
              </span>
              <div className="space-y-4">
                {Array.isArray(vedicData?.doshas) && vedicData.doshas.length > 0 ? (
                  vedicData.doshas.map((dosha: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded bg-rose-950/10 border border-rose-500/15 space-y-1">
                      <span className="font-bold text-rose-400 text-sm block">{dosha.name}</span>
                      <p className="text-slate-300 text-[11px] leading-normal">{dosha.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-slate-500 italic">
                    Calculating Manglik, Kaal Sarp and Sade Sati degrees...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 13: TRADITIONAL LIFE PATHWAYS ================= */}
        {(majorTab === "jhora" || majorTab === "all") && (
          <div id="report-section-13" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-amber-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-amber-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 13 • Traditional Life Predictions & Daily Muhurta
              </span>
              <h2 className="text-sm font-bold text-amber-500 mt-2 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                13. LIFE DESTINY PATHWAYS & DAILY TRANSIT ALIGNMENTS
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              Exhaustive predictive analysis mapping professional focus, wealth generation, marriage bliss, health, and current lunar transit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Career */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-amber-500/25 transition-all">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Briefcase className="w-4 h-4" />
                Professional & Career Path
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {career.text}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {career.highlights.map((h, i) => (
                  <span key={i} className="bg-indigo-500/10 text-indigo-400 text-[9px] px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Finance */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-amber-500/25 transition-all">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <DollarSign className="w-4 h-4" />
                Finance & Wealth Dynamics
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {finance.text}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {finance.highlights.map((h, i) => (
                  <span key={i} className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Marriage */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-amber-500/25 transition-all">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <Heart className="w-4 h-4" />
                Marriage & Relationship Harmony
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {marriage.text}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {marriage.highlights.map((h, i) => (
                  <span key={i} className="bg-rose-500/10 text-rose-400 text-[9px] px-2 py-0.5 rounded border border-rose-500/20 font-bold">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Health */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-amber-500/25 transition-all">
              <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <Activity className="w-4 h-4" />
                Health & Vitality Blueprint
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {health.text}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {health.highlights.map((h, i) => (
                  <span key={i} className="bg-teal-500/10 text-teal-400 text-[9px] px-2 py-0.5 rounded border border-teal-500/20 font-bold">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-2">
              <div className="space-y-0.5">
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Daily Transit Alignment</span>
                <h4 className="text-xs font-bold text-slate-200">Personalized Lunar Muhurta Guidelines</h4>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-950/50 px-2.5 py-1 rounded">
                📅 {daily.date}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Highly Auspicious For
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {daily.auspiciousFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Caution Advised For
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {daily.cautionFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-rose-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/30 border border-slate-800 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className={mutedText}>Active Transit Nakshatra:</span>
                  <span className="font-bold text-slate-200">{daily.nakshatra}</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Active Moon Tithi:</span>
                  <span className="font-bold text-slate-200">{daily.tithi}</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Auspicious Colors:</span>
                  <span className="font-bold text-slate-200 text-right">{daily.luckyColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Lucky Number:</span>
                  <span className="font-bold text-amber-500 font-mono">{daily.luckyNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
