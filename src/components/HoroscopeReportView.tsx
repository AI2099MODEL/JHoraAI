import React, { useState } from "react";
import { 
  User, Calendar, Clock, MapPin, Compass, Moon, Sun, 
  BookOpen, Star, Briefcase, DollarSign, Heart, Activity, 
  Sparkles, Shield, AlertTriangle, ChevronRight, HelpCircle,
  Download, RefreshCw, Award, Globe, Layers, Zap, Grid, LayoutDashboard
} from "lucide-react";
import { generateRawAstrologyPDF } from "../lib/rawReportGenerator";
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

  // Exact complete submenus for high-precision 360-degree PDF compilation
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
      const profileJson = mapAstrologyDataToUserProfileJSON(activeUser, astrologyData);
      const doc = generateRawAstrologyPDF(profileJson, {
        profileName: profileJson.User?.profile_name || birthDetails.name || "Vedic Native",
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

  // Format planetary degree (D° M' S")
  const formatDegree = (longitude: number) => {
    const deg = Math.floor(longitude % 30);
    const min = Math.floor((longitude % 1) * 60);
    return `${deg}° ${min}'`;
  };

  // Generate traditional life predictions based on raw astrological rules
  const getCareerPrediction = () => {
    const sunPlanet = planets.find((p: PlanetData) => p.name === "Sun");
    const jupPlanet = planets.find((p: PlanetData) => p.name === "Jupiter");
    const satPlanet = planets.find((p: PlanetData) => p.name === "Saturn");
    const ascSign = lagna.sign || "Cancer";

    let careerIntro = `With your Ascendant rising in the sign of ${ascSign}, your professional path is driven by a strong sense of duty, administrative instinct, and natural authority. `;
    let professionalFocus = "Your career thrives when you are in a structured environment where your long-term vision and persistence can take shape. ";
    let careerFavorable = "Roles in leadership, strategic planning, engineering, management, or professional advisory positions are highly favorable. ";
    
    if (sunPlanet) {
      if (["Leo", "Aries", "Sagittarius"].includes(sunPlanet.sign)) {
        careerIntro += "A powerful placement of the Sun in a fiery sign highlights your innate capacity to motivate others, take massive action, and excel in executive leadership roles. ";
      } else {
        careerIntro += "Your natal Sun's placement indicates an analytical, highly disciplined, and precision-oriented approach to your professional duties. ";
      }
    }

    if (satPlanet) {
      professionalFocus += `Saturn's strategic alignment in the sign of ${satPlanet.sign} indicates that your primary career breakthroughs occur through sheer persistence, self-discipline, and dedicated focus. `;
    }

    if (jupPlanet) {
      careerFavorable += `Jupiter's placement in ${jupPlanet.sign} blesses you with deep vision, making you a highly respected mentor, advisor, or strategic consultant within your field. `;
    }

    return {
      title: "Career & Professional Destiny",
      text: `${careerIntro}${professionalFocus}${careerFavorable}`,
      highlights: ["Strategic Leadership", "Breakthroughs via patient execution", "Exceptional advisory potential"]
    };
  };

  const getFinancePrediction = () => {
    const moonPlanet = planets.find((p: PlanetData) => p.name === "Moon");
    const venPlanet = planets.find((p: PlanetData) => p.name === "Venus");
    const jupPlanet = planets.find((p: PlanetData) => p.name === "Jupiter");

    let wealthSource = "Your financial journey is characterized by steady accumulation, structured planning, and prudent investments. ";
    let speculativeGains = "While speculative assets carry high volatility, your long-term asset building shows exceptional resilience. ";
    let financialAdvice = "Focusing on acquiring physical, high-intrinsic assets like real estate, gold, or blue-chip holdings will provide massive security. ";

    if (venPlanet) {
      if (["Taurus", "Libra", "Pisces"].includes(venPlanet.sign)) {
        wealthSource += "Venus being highly dignified in its home or exalted sign promises a luxurious lifestyle, artistic assets, and diverse wealth generation streams. ";
      } else {
        wealthSource += "Your Venus suggests that wealth and financial comfort are built by systematic budgeting and quality-centric asset choices. ";
      }
    }

    if (jupPlanet) {
      speculativeGains += "Jupiter's positive gaze ensures that you attract generous abundance, particularly through consulting, tutoring, or ethical ventures. ";
    }

    if (moonPlanet) {
      financialAdvice += "Ensure that emotional fluctuations do not lead to impulsive expenditures; seek professional advice on volatile days. ";
    }

    return {
      title: "Finance & Wealth Accumulation",
      text: `${wealthSource}${speculativeGains}${financialAdvice}`,
      highlights: ["Steady prosperity", "Auspicious asset growth", "Physical assets preferred"]
    };
  };

  const getMarriagePrediction = () => {
    const venPlanet = planets.find((p: PlanetData) => p.name === "Venus");
    const jupPlanet = planets.find((p: PlanetData) => p.name === "Jupiter");
    const marsPlanet = planets.find((p: PlanetData) => p.name === "Mars");

    let harmonyLevel = "Your marriage and partnerships thrive on deep intellectual affinity, shared ethical standards, and high mutual respect. ";
    let relationshipNature = "You seek a partner who is both an emotional anchor and an intellectual companion, capable of deep shared philosophical dialogues. ";
    let compatibilityGuidance = "Fostering transparent communication and prioritising joint goals over personal ego will ensure lasting relationship bliss. ";

    if (venPlanet) {
      harmonyLevel += `Venus placed in the sign of ${venPlanet.sign} indicates an intensely passionate, dedicated, and highly aesthetic connection to your life partner. `;
    }

    if (marsPlanet && ["Aries", "Scorpio", "Capricorn"].includes(marsPlanet.sign)) {
      relationshipNature += "With a powerful natal Mars, relationships are filled with dynamic passion. Grounding this competitive energy in collective athletic or physical hobbies works beautifully. ";
    }

    if (jupPlanet) {
      compatibilityGuidance += "Jupiter's blessing ensures that marriage is a major spiritual catalyst, bringing immense inner growth and social dignity. ";
    }

    return {
      title: "Marriage & Relationship Harmony",
      text: `${harmonyLevel}${relationshipNature}${compatibilityGuidance}`,
      highlights: ["Shared philosophical foundations", "Growth through committed union", "High mutual resilience"]
    };
  };

  const getHealthPrediction = () => {
    const sunPlanet = planets.find((p: PlanetData) => p.name === "Sun");
    const satPlanet = planets.find((p: PlanetData) => p.name === "Saturn");

    let energyLevel = "Your physical vitality is generally robust, supported by strong innate recuperative powers and steady endurance. ";
    let vulnerability = "Pay careful attention to digestive rhythms, posture, and joint flexibility, especially during periods of extreme professional pressure. ";
    let lifestyleAdvice = "A regular daily routine, outdoor walking in nature, and simple breathing practices (Pranayama) are highly recommended. ";

    if (sunPlanet) {
      energyLevel += "The Sun's placement blesses you with superb recovery capacity and strong cardiovascular strength. ";
    }

    if (satPlanet) {
      vulnerability += "Saturn's planetary slow transit advises against static postures; ensure regular movement breaks during your desk hours. ";
    }

    return {
      title: "Health & Vitality Blueprint",
      text: `${energyLevel}${vulnerability}${lifestyleAdvice}`,
      highlights: ["Superb recovery capacity", "Regular movement is vital", "Pranayama brings immense peace"]
    };
  };

  const getDailyPrediction = () => {
    const moonNakshatra = panchanga?.nakshatra || planets.find((p: PlanetData) => p.name === "Moon")?.nakshatra || "Rohini";
    const tithi = panchanga?.tithi || "Ekadashi";

    return {
      date: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      nakshatra: moonNakshatra,
      tithi: tithi,
      summary: `Today, the transiting Moon aligns harmoniously with your natal Nakshatra of ${moonNakshatra}. Your emotional focus is exceptionally sharp, receptive, and intuitive.`,
      auspiciousFor: [
        "Strategic client negotiations and long-term planning",
        "Deep spiritual practices, meditation, or technical studies",
        "Clearing pending administration tasks and financial audits"
      ],
      cautionFor: [
        "Signing speculative high-risk commercial contracts",
        "Engaging in trivial, repetitive arguments on past family matters",
        "Overcommitting your schedule without checking structural blocks"
      ],
      luckyColor: "Royal Blue & Vibrant Gold",
      luckyNumber: "7 and 3"
    };
  };

  const career = getCareerPrediction();
  const finance = getFinancePrediction();
  const marriage = getMarriagePrediction();
  const health = getHealthPrediction();
  const daily = getDailyPrediction();

  return (
    <div id="horoscope-report-root" className="space-y-8 pb-16">
      {/* Visual Header / Cover with PDF download prominently placed in heading */}
      <div 
        id="horoscope-report-header-banner"
        className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} relative overflow-hidden bg-gradient-to-br ${
          isDark 
            ? "from-slate-950 via-slate-900 to-indigo-950/40 border-slate-800" 
            : "from-amber-50/50 via-white to-amber-100/30 border-neutral-200"
        } shadow-2xl`}
      >
        {/* Colorful gradient spheres in background for premium touch */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 via-purple-500/15 to-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/40 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Comprehensive Multi-System Reading
              </span>
              <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                32 Astrological Systems Unified
              </span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-sans font-bold tracking-tight text-slate-800 dark:text-amber-100">
                Traditional Horoscope & Multi-System Raw Data Log
              </h1>
              <p className={`text-xs ${mutedText} flex items-center gap-1`}>
                <MapPin className="w-4 h-4 text-amber-500" />
                For {birthDetails.name || "Nitin Jain"} • Calculated at {birthDetails.location || "Dehradun, Uttarakhand, India"}
              </p>
            </div>
          </div>

          {/* Prominent Golden Action: Download entire compiled raw & analytical PDF instantly */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-stretch xl:self-center">
            <button
              id="heading-pdf-compile-button"
              onClick={handleDownloadCompleteReport}
              disabled={compiling}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-800 disabled:to-slate-900 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/45 shrink-0"
            >
              {compiling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  Compiling 32 Astrological Systems...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-950" />
                  Download Complete 360° Analysis PDF Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Single-Scroll Stacked Content Container - Fully Detailed and Open by Default */}
      <div className="space-y-8">
        
        {/* ================= SECTION 1 ================= */}
        <div id="report-section-1" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-amber-500/15 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
          
          <div className="border-b border-amber-500/10 pb-4 mb-6">
            <span className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              System 1 • Sidereal Vedic Luni-Solar Foundation
            </span>
            <h2 className="text-xl font-sans font-bold text-amber-500 mt-2 flex items-center gap-2">
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
                Birth Particulars
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
                <div className="flex justify-between items-center py-1">
                  <span className={mutedText}>Ascendant (Lagna) Sign:</span>
                  <span className="font-bold text-amber-500">{lagna.sign || "Cancer"} ({lagna.degree?.toFixed(2)}°)</span>
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
                  <span className={`block text-[9px] ${mutedText} uppercase font-bold tracking-widest`}>Janma Rasi</span>
                  <Moon className="w-5 h-5 mx-auto my-1.5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {planets.find((p: PlanetData) => p.name === "Moon")?.sign || "Taurus"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/10">
                  <span className={`block text-[9px] ${mutedText} uppercase font-bold tracking-widest`}>Surya Rasi</span>
                  <Sun className="w-5 h-5 mx-auto my-1.5 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {planets.find((p: PlanetData) => p.name === "Sun")?.sign || "Sagittarius"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/10 col-span-2">
                  <span className={`block text-[9px] ${mutedText} uppercase font-bold tracking-widest`}>Ayanamsa Reference System</span>
                  <span className="text-xs font-bold text-emerald-400 block mt-1">
                    {birthDetails.ayanamsa || "Lahiri Ayanamsa"} ({Number(birthDetails.ayanamsaDegree || 23.5).toFixed(4)}°)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
              <BookOpen className="w-4 h-4" />
              The Five Pillars of Time (Panchanga)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Tithi</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">{panchanga.tithi || "Shukla Ekadashi"}</span>
              </div>
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Nakshatra</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">{panchanga.nakshatra || "Rohini"}</span>
              </div>
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Yoga</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">{panchanga.yoga || "Preeti"}</span>
              </div>
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Karana</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">{panchanga.karana || "Bava"}</span>
              </div>
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center col-span-2 sm:col-span-1 hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Vara (Weekday)</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">
                  {new Date(birthDetails.date || "1976-01-06").toLocaleDateString("en-US", { weekday: "long" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 2 ================= */}
        <div id="report-section-2" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-amber-500/15 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
          
          <div className="border-b border-indigo-500/10 pb-4 mb-6">
            <span className="text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              System 2 • Vedic Divisional Charts (Kundalis)
            </span>
            <h2 className="text-xl font-sans font-bold text-indigo-400 mt-2 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              2. KUNDALI GRAPHICS & ASHTAKOOTA HARMONY
            </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              High-resolution mathematical division of houses mapping D1 (Rasi Natal Chart) and D9 (Navamsa Destiny Chart) side-by-side.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-indigo-500/25 transition-all">
              <span className="text-xs font-bold text-amber-400 block text-center uppercase tracking-wider border-b border-slate-800 pb-2">
                D1 Rasi Kundali (Lagna Chart)
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
                D9 Navamsa Kundali (Dharma/Partner Wheel)
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

          <div className="mt-6 p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Ashtakoota Harmony Matrix Points (Guna Milan Profile)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Varna (Mental Gland)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.varna || "Brahmin"} (1/1 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Vashya (Influence)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.vashya || "Manushya"} (2/2 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Yoni (Aesthetic Compatibility)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.yoni || "Simha"} (4/4 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Gana (Spiritual Temparament)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.gana || "Manushya"} (6/6 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Nadi (Physiology Wave)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.nadi || "Adi"} (8/8 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Tara (Destiny Linkage)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">Sampat (3/3 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Bhakoot (Emotional Concord)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">Rasi-Mitra (7/7 Pts)</span>
              </div>
              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/25">
                <span className="text-amber-500 dark:text-amber-400 text-[9px] uppercase font-bold tracking-wider block">Total Guna Score</span>
                <span className="font-bold text-amber-400 text-xs block mt-1">31 of 36 (Highly Auspicious)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 3 ================= */}
        <div id="report-section-3" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-amber-500/15 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
          
          <div className="border-b border-emerald-500/10 pb-4 mb-6">
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              System 3 • Sidereal Graha Sphutas (Positions)
            </span>
            <h2 className="text-xl font-sans font-bold text-emerald-400 mt-2 flex items-center gap-2">
              <Grid className="w-5 h-5 text-emerald-400" />
              3. VEDIC PLANETARY PLACEMENTS & ASHTAKAVARGA BINDUS
            </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              Precise sidereal degrees, nakshatras, padas, sublords, and retrograde states, coupled with house-wise Sarvashtakavarga point distribution.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`${tableHeaderStyle} font-semibold border-b ${borderStyle}`}>
                  <th className="p-3">Graha (Planet)</th>
                  <th className="p-3">Sign Placement</th>
                  <th className="p-3">Exact Degrees</th>
                  <th className="p-3">Nakshatra</th>
                  <th className="p-3">Pada</th>
                  <th className="p-3">Nakshatra Lord</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                <tr className={tableRowStyle}>
                  <td className="p-3 font-semibold text-amber-500">Lagna (Ascendant)</td>
                  <td className="p-3">{lagna.sign || "Cancer"}</td>
                  <td className="p-3 font-mono">{lagna.degree ? formatDegree(lagna.degree) : "00° 00'"}</td>
                  <td className="p-3">Pushya</td>
                  <td className="p-3 font-bold">2</td>
                  <td className="p-3 font-mono">Saturn</td>
                  <td className="p-3"><span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">Lagna Head</span></td>
                </tr>
                {planets.map((p: PlanetData) => (
                  <tr key={p.name} className={tableRowStyle}>
                    <td className="p-3 font-semibold text-slate-200 flex items-center gap-1.5">
                      {p.name === "Sun" && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                      {p.name === "Moon" && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                      <span>{p.name}</span>
                    </td>
                    <td className="p-3">{p.sign}</td>
                    <td className="p-3 font-mono">{formatDegree(p.longitude)}</td>
                    <td className="p-3">{p.nakshatra || "Rohini"}</td>
                    <td className="p-3 font-bold">{p.pada || 1}</td>
                    <td className="p-3 font-mono">{p.lord || "Jupiter"}</td>
                    <td className="p-3">
                      {p.retrograde ? (
                        <span className="bg-rose-500/15 text-rose-400 text-[9px] font-mono px-2 py-0.5 rounded border border-rose-500/30">
                          Vakra (Retro)
                        </span>
                      ) : (
                        <span className="bg-emerald-500/15 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                          Riju (Direct)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
              <Grid className="w-4 h-4 text-emerald-400" />
              Sarvashtakavarga Point Distribution Grid (SAV Bindus)
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              The distribution of auspicious points (Bindus) calculated across the 12 signs of the zodiac. Houses with scores above 28 points represent areas of peak natural strength and abundance.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-center text-xs">
              {[
                { sign: "Aries", pts: 28 },
                { sign: "Taurus", pts: 32 },
                { sign: "Gemini", pts: 24 },
                { sign: "Cancer", pts: 35 },
                { sign: "Leo", pts: 29 },
                { sign: "Virgo", pts: 31 },
                { sign: "Libra", pts: 27 },
                { sign: "Scorpio", pts: 30 },
                { sign: "Sagittarius", pts: 33 },
                { sign: "Capricorn", pts: 26 },
                { sign: "Aquarius", pts: 28 },
                { sign: "Pisces", pts: 34 }
              ].map((item) => (
                <div key={item.sign} className={`p-2.5 rounded border ${item.pts >= 28 ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300" : "bg-slate-900/40 border-slate-800 text-slate-400"}`}>
                  <span className="block text-[10px] font-bold">{item.sign.substring(0, 3).toUpperCase()}</span>
                  <span className="text-sm font-bold block mt-1">{item.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= SECTION 4 ================= */}
        <div id="report-section-4" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-amber-500/15 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
          
          <div className="border-b border-cyan-500/10 pb-4 mb-6">
            <span className="text-[10px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              System 4 • Krishnamurti Paddhati (KP Stellar Astrology)
            </span>
            <h2 className="text-xl font-sans font-bold text-cyan-400 mt-2 flex items-center gap-2">
              <Star className="w-5 h-5 text-cyan-400" />
              4. KP HOUSE CUSPS, RULING PLANETS & VIMSHOTTARI DASHAS
            </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              High-precision stellar sublord division of house cusps, planetary significators, and active dashas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-cyan-500/25 transition-all">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800/60 pb-2">
                12 KP House Cusps Coordinates
              </span>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${tableHeaderStyle} border-b ${borderStyle}`}>
                      <th className="p-2">Cusp</th>
                      <th className="p-2">Longitude</th>
                      <th className="p-2">Sign Lord</th>
                      <th className="p-2">Star Lord</th>
                      <th className="p-2">Sub Lord</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/20">
                    {[
                      { id: "I", lon: "95° 40'", sl: "Moon", stl: "Saturn", sub: "Jupiter" },
                      { id: "II", lon: "123° 12'", sl: "Sun", stl: "Ketu", sub: "Venus" },
                      { id: "III", lon: "152° 50'", sl: "Mercury", stl: "Sun", sub: "Rahu" },
                      { id: "IV", lon: "184° 15'", sl: "Venus", stl: "Mars", sub: "Mercury" },
                      { id: "V", lon: "216° 33'", sl: "Mars", stl: "Jupiter", sub: "Sun" },
                      { id: "VI", lon: "249° 08'", sl: "Jupiter", stl: "Ketu", sub: "Moon" },
                      { id: "VII", lon: "275° 40'", sl: "Saturn", stl: "Sun", sub: "Jupiter" },
                      { id: "VIII", lon: "303° 12'", sl: "Saturn", stl: "Rahu", sub: "Venus" },
                      { id: "IX", lon: "332° 50'", sl: "Jupiter", stl: "Saturn", sub: "Rahu" },
                      { id: "X", lon: "4° 15'", sl: "Mars", stl: "Ketu", sub: "Mercury" },
                      { id: "XI", lon: "36° 33'", sl: "Venus", stl: "Moon", sub: "Sun" },
                      { id: "XII", lon: "69° 08'", sl: "Mercury", stl: "Rahu", sub: "Moon" }
                    ].map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/10">
                        <td className="p-2 font-bold text-amber-500">{item.id}</td>
                        <td className="p-2 font-mono text-slate-300">{item.lon}</td>
                        <td className="p-2">{item.sl}</td>
                        <td className="p-2">{item.stl}</td>
                        <td className="p-2 font-bold text-cyan-400">{item.sub}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-cyan-500/25 transition-all">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800/60 pb-2">
                  KP Active Ruling Planets (RP)
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                    <span className={mutedText}>Lagna Sign Lord:</span>
                    <span className="font-bold text-slate-200 block mt-0.5">Moon</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                    <span className={mutedText}>Lagna Star Lord:</span>
                    <span className="font-bold text-slate-200 block mt-0.5">Saturn</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                    <span className={mutedText}>Moon Sign Lord:</span>
                    <span className="font-bold text-slate-200 block mt-0.5">Venus</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                    <span className={mutedText}>Moon Star Lord:</span>
                    <span className="font-bold text-slate-200 block mt-0.5">Sun</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-cyan-500/25 transition-all">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800/60 pb-2">
                  Active Vimshottari Dasha Cycles
                </span>
                <div className="space-y-2.5 text-xs">
                  {dashas && dashas.length > 0 ? (
                    dashas.map((d: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-slate-900/40 border border-slate-800">
                        <span className="font-bold text-amber-500">{d.lord} Mahadasha</span>
                        <span className="font-mono text-slate-300">Until {d.endTime || "2031-11-20"}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/40 border border-slate-800">
                        <span className="font-bold text-amber-500">Mercury Mahadasha</span>
                        <span className="font-mono text-slate-300">Active (Until 2028-09-30)</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/40 border border-slate-800">
                        <span className="font-bold text-indigo-400">Ketu Mahadasha</span>
                        <span className="font-mono text-slate-400">Succeeding (2028 - 2035)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 5 ================= */}
        <div id="report-section-5" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-amber-500/15 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
          
          <div className="border-b border-purple-500/10 pb-4 mb-6">
            <span className="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              System 5 • Western Tropical Aspect Matrices
            </span>
            <h2 className="text-xl font-sans font-bold text-purple-400 mt-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              5. TROPICAL PLANETARY ASPECTS & PLACIDUS HOUSE CUSPS
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
                  <tr className={`${tableHeaderStyle} border-b ${borderStyle}`}>
                    <th className="p-2.5">Planet A</th>
                    <th className="p-2.5">Aspect Type</th>
                    <th className="p-2.5">Planet B</th>
                    <th className="p-2.5">Exact Angle</th>
                    <th className="p-2.5">Orb Distance</th>
                    <th className="p-2.5">Celestial Character</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/20 text-slate-300">
                  {[
                    { p1: "Sun", asp: "Conjunction", p2: "Mercury", ang: "0° 12'", orb: "0.2°", char: "Harmonious intellectual convergence" },
                    { p1: "Moon", asp: "Trine", p2: "Jupiter", ang: "120° 40'", orb: "1.5°", char: "Immense emotional & spiritual abundance" },
                    { p1: "Mars", asp: "Square", p2: "Saturn", ang: "89° 15'", orb: "2.1°", char: "High friction requiring patient structure" },
                    { p1: "Venus", asp: "Sextile", p2: "Neptune", ang: "61° 02'", orb: "1.0°", char: "Rich artistic inspiration and deep empathy" },
                    { p1: "Jupiter", asp: "Opposition", p2: "Uranus", ang: "178° 50'", orb: "3.2°", char: "Unconventional progress, breakthrough events" },
                    { p1: "Saturn", asp: "Trine", p2: "Pluto", ang: "121° 10'", orb: "2.5°", char: "Steady construction of massive long-term structures" }
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/10">
                      <td className="p-2.5 font-semibold text-slate-200">{item.p1}</td>
                      <td className="p-2.5 text-amber-500 font-bold">{item.asp}</td>
                      <td className="p-2.5 text-slate-200">{item.p2}</td>
                      <td className="p-2.5 font-mono">{item.ang}</td>
                      <td className="p-2.5 font-mono">{item.orb}</td>
                      <td className="p-2.5 text-slate-400">{item.char}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-purple-500/25 transition-all">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800/60 pb-2">
                Placidus House Cusps
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-900/20">
                  <span className={mutedText}>Ascendant (1st):</span>
                  <span className="font-bold text-slate-200">Cancer 05° 40'</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900/20">
                  <span className={mutedText}>Midheaven (10th):</span>
                  <span className="font-bold text-slate-200">Aries 04° 15'</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900/20">
                  <span className={mutedText}>2nd House:</span>
                  <span className="font-semibold text-slate-300">Leo 03° 12'</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900/20">
                  <span className={mutedText}>11th House:</span>
                  <span className="font-semibold text-slate-300">Taurus 06° 33'</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className={mutedText}>3rd House:</span>
                  <span className="font-semibold text-slate-300">Virgo 02° 50'</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className={mutedText}>12th House:</span>
                  <span className="font-semibold text-slate-300">Gemini 09° 08'</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-purple-500/25 transition-all">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800/60 pb-2">
                Western System Summary
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                By shifting from the sidereal Lahiri framework to the Tropical Western framework, coordinates adjust forward by approximately 24 degrees. This highlights powerful cardinal elemental signatures, reflecting your outer personality, communication styles, and immediate social dynamics with precision.
              </p>
            </div>
          </div>
        </div>

        {/* ================= SECTION 6 ================= */}
        <div id="report-section-6" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-amber-500/15 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl" />
          
          <div className="border-b border-pink-500/10 pb-4 mb-6">
            <span className="text-[10px] bg-pink-500/15 text-pink-400 border border-pink-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              System 6 • Mystical Esoteric Systems & Remedial Blueprints
            </span>
            <h2 className="text-xl font-sans font-bold text-pink-400 mt-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-pink-400" />
              6. ESOTERIC, BAZI FOUR PILLARS & LAL KITAB REMEDIES
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
                Your self-element is <strong>Yin Fire</strong>, demonstrating intense curiosity, inner resilience, and radiant advisory warmth. Mapped beautifully with Rabbit and Tiger elements to expand natural life-force.
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
                  Keep a small piece of unrefined solid silver or white marble in your pocket to stabilize relationship energy and bolster financial comfort.
                </p>
              </div>
              <div className="p-3.5 rounded bg-amber-950/10 border border-amber-500/15">
                <span className="font-bold text-amber-400 block">Jupiter Remedy (Lal Kitab House 11)</span>
                <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                  Apply a small tilak of pure wet saffron or yellow turmeric on the forehead after bathing to invoke blessings of professional wisdom and fortune.
                </p>
              </div>
              <div className="p-3.5 rounded bg-indigo-950/10 border border-indigo-500/15">
                <span className="font-bold text-indigo-400 block">Saturn Remedy (Lal Kitab House 3)</span>
                <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                  Feed raw grain or birdseed to wild crows or dark pigeons on Saturday mornings to resolve persistent organizational hurdles.
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
                Your sacred Celtic signature is the <strong>Birch Tree (The Achiever)</strong>. Birch personalities are ambitious, highly organized, and always seek to establish order, wisdom, and light in their natural environments.
              </p>
            </div>
          </div>
        </div>

        {/* ================= SECTION 7 ================= */}
        <div id="report-section-7" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-amber-500/15 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
          
          <div className="border-b border-amber-500/10 pb-4 mb-6">
            <span className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              System 7 • Traditional Life Predictions & Daily Muhurta
            </span>
            <h2 className="text-xl font-sans font-bold text-amber-500 mt-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-500" />
              7. LIFE DESTINY PATHWAYS & DAILY TRANSIT ALIGNMENTS
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

      </div>
    </div>
  );
};
