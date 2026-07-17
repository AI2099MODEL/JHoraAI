import React, { useState } from "react";
import { 
  User, Calendar, Clock, MapPin, Compass, Moon, Sun, 
  BookOpen, Star, Briefcase, DollarSign, Heart, Activity, 
  Sparkles, Shield, AlertTriangle, ChevronRight, HelpCircle
} from "lucide-react";
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
  isDark: boolean;
}

export const HoroscopeReportView: React.FC<HoroscopeReportViewProps> = ({
  astrologyData,
  isDark
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "predictions" | "daily">("overview");

  if (!astrologyData) {
    return (
      <div 
        id="horoscope-report-empty" 
        className="text-center py-12 rounded-xl bg-slate-950/20 border border-dashed border-slate-800 text-slate-500 text-xs"
      >
        <User className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
        No active profile loaded. Please load or create a profile to view the traditional horoscope report.
      </div>
    );
  }

  const { birthDetails = {}, lagna = {}, panchanga = {}, planets = [], rasiChart = {}, navamsaChart = {}, divisionalCharts = {}, vargaLagnas = {} } = astrologyData;

  const cardStyle = isDark
    ? "bg-slate-950/40 border-slate-800/80 text-slate-100"
    : "bg-white border-neutral-200 text-neutral-900 shadow-sm";

  const accentText = isDark ? "text-amber-400" : "text-amber-600";
  const mutedText = isDark ? "text-slate-400" : "text-neutral-500";
  const borderStyle = isDark ? "border-slate-800/60" : "border-neutral-200";
  const tableHeaderStyle = isDark ? "bg-slate-900/60 text-slate-300" : "bg-neutral-100 text-neutral-700";
  const tableRowStyle = isDark ? "hover:bg-slate-900/20" : "hover:bg-neutral-50";

  // Helper to format planetary degree (D° M' S")
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
    const ascSign = lagna.sign || "Aries";

    let careerIntro = `With an Ascendant in ${ascSign}, you possess natural leadership tendencies and a strong sense of personal identity. `;
    let professionalFocus = "Your professional drive is strongly focused on establishing structures, executing long-term tasks, and creating social authority. ";
    let careerFavorable = "Roles in strategic planning, public administration, technological structures, or advisory consulting are highly aligned. ";
    
    if (sunPlanet) {
      if (["Leo", "Aries", "Sagittarius"].includes(sunPlanet.sign)) {
        careerIntro += "The strong placement of the natal Sun in a fire sign indicates immense creative drive, natural authoritative presence, and a desire to manage or lead others. ";
      } else {
        careerIntro += "The natal Sun's placement indicates a structured, analytical approach to professional responsibilities. ";
      }
    }

    if (satPlanet) {
      professionalFocus += `Saturn's placement in ${satPlanet.sign} suggests that your professional breakthroughs will come through persistence, self-discipline, and enduring hard work. `;
    }

    if (jupPlanet) {
      careerFavorable += `Jupiter's celestial placement in ${jupPlanet.sign} indicates a wealth of wisdom that makes you an exceptional mentor, guide, or strategic advisor in your industry. `;
    }

    return {
      title: "Career & Professional Destiny",
      icon: <Briefcase className="w-5 h-5 text-indigo-400" />,
      text: `${careerIntro}${professionalFocus}${careerFavorable}`,
      highlights: ["Strong managerial capability", "Breakthroughs via patient work", "Excellent strategic advisory potential"]
    };
  };

  const getFinancePrediction = () => {
    const moonPlanet = planets.find((p: PlanetData) => p.name === "Moon");
    const venPlanet = planets.find((p: PlanetData) => p.name === "Venus");
    const jupPlanet = planets.find((p: PlanetData) => p.name === "Jupiter");

    let wealthSource = "Wealth creation is primarily driven by structured professional endeavors and sensible, low-risk long-term investments. ";
    let speculativeGains = "Moderate potential for speculative gains exists, though conservative financial planning is advised to avoid unnecessary volatility. ";
    let financialAdvice = "Focus on acquiring durable assets like real estate or gold, and diversify your portfolios. ";

    if (venPlanet) {
      if (["Taurus", "Libra", "Pisces"].includes(venPlanet.sign)) {
        wealthSource += "Venus being beautifully placed in a strong, harmonious sign indicates a natural flow of luxury, artistic assets, and comfortable financial channels. ";
      } else {
        wealthSource += "Venus suggests that financial security is gained through meticulous budgeting and value-based luxury acquisitions. ";
      }
    }

    if (jupPlanet) {
      speculativeGains += "Jupiter's benevolence promises steady expansion of resources and prosperity through ethical investments and tutoring/mentorship. ";
    }

    if (moonPlanet) {
      financialAdvice += "Keep emotional spending in check, as fluctuations in mood may occasionally translate to impulse acquisitions. ";
    }

    return {
      title: "Finance & Wealth Accumulation",
      icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
      text: `${wealthSource}${speculativeGains}${financialAdvice}`,
      highlights: ["Steady wealth accumulation", "Auspicious real estate potential", "Diversified safe-haven assets preferred"]
    };
  };

  const getMarriagePrediction = () => {
    const venPlanet = planets.find((p: PlanetData) => p.name === "Venus");
    const jupPlanet = planets.find((p: PlanetData) => p.name === "Jupiter");
    const marsPlanet = planets.find((p: PlanetData) => p.name === "Mars");

    let harmonyLevel = "Your relationships thrive on deep intellectual exchange, mutual respect, and clear boundaries. ";
    let relationshipNature = "You seek a partner who is both supportive and capable of intellectual discussion, acting as a true companion. ";
    let compatibilityGuidance = "Practicing active listening and choosing harmony over minor arguments will further strengthen marital bonds. ";

    if (venPlanet) {
      harmonyLevel += `Venus placed in the sign of ${venPlanet.sign} indicates a passionate, deeply dedicated, and aesthetic appreciation for your life partner. `;
    }

    if (marsPlanet && ["Aries", "Scorpio", "Capricorn"].includes(marsPlanet.sign)) {
      relationshipNature += "With a powerful Mars placement, relationships carry intense passion and energy. Channels must be created to ground competitive drives into constructive joint projects. ";
    }

    if (jupPlanet) {
      compatibilityGuidance += "Jupiter's blessing ensures that marriage acts as a key spiritual and personal growth catalyst in your life. ";
    }

    return {
      title: "Marriage & Relationship Harmony",
      icon: <Heart className="w-5 h-5 text-rose-400" />,
      text: `${harmonyLevel}${relationshipNature}${compatibilityGuidance}`,
      highlights: ["Intellectually stimulating partnerships", "Growth through relationship commitment", "Strong relational durability"]
    };
  };

  const getHealthPrediction = () => {
    const sunPlanet = planets.find((p: PlanetData) => p.name === "Sun");
    const satPlanet = planets.find((p: PlanetData) => p.name === "Saturn");

    let energyLevel = "Your vitality is generally stable, supported by a healthy constitution and solid recuperative powers. ";
    let vulnerability = "Pay attention to digestive harmony, posture, and bone health, particularly during periods of intense career stress. ";
    let lifestyleAdvice = "A regular routine, mindfulness exercises, and outdoor activities near nature are highly recommended. ";

    if (sunPlanet) {
      energyLevel += "The Sun's placement supports high recovery capacity and stable inner spiritual strength. ";
    }

    if (satPlanet) {
      vulnerability += "Saturn's slow-moving transit advises against joint strain and highly sedentary desk habits. Keep movement regular. ";
    }

    return {
      title: "Health & Vitality Guide",
      icon: <Activity className="w-5 h-5 text-teal-400" />,
      text: `${energyLevel}${vulnerability}${lifestyleAdvice}`,
      highlights: ["Robust constitutional recovery", "Regular movement is vital", "Manage occupational stress triggers"]
    };
  };

  // Daily Prediction based on Birth Moon Nakshatra and Panchanga parameters
  const getDailyPrediction = () => {
    const moonNakshatra = panchanga?.nakshatra || planets.find((p: PlanetData) => p.name === "Moon")?.nakshatra || "Chitra";
    const tithi = panchanga?.tithi || "Ekadashi";

    return {
      date: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      nakshatra: moonNakshatra,
      tithi: tithi,
      summary: `Today, the cosmic alignments suggest a day of integration and structured communication. Since your natal Moon rests in ${moonNakshatra}, your emotional focus is sharp and resilient.`,
      auspiciousFor: [
        "Strategic business reviews and financial planning",
        "Engaging in spiritual study or silent meditation",
        "Resolving persistent organizational tasks"
      ],
      cautionFor: [
        "Unplanned major purchases or commercial contracts",
        "Heated arguments on historical family matters",
        "Overcommitting to tasks without verifying your schedule"
      ],
      luckyColor: "Royal Blue & Warm Gold",
      luckyNumber: "7 and 3"
    };
  };

  const career = getCareerPrediction();
  const finance = getFinancePrediction();
  const marriage = getMarriagePrediction();
  const health = getHealthPrediction();
  const daily = getDailyPrediction();

  return (
    <div id="horoscope-report-root" className="space-y-6">
      {/* Visual Header / Cover */}
      <div 
        id="horoscope-report-header-banner"
        className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} relative overflow-hidden bg-gradient-to-br ${
          isDark 
            ? "from-slate-950 via-slate-900 to-indigo-950/30 border-slate-800" 
            : "from-amber-50/40 via-white to-amber-100/20 border-neutral-200"
        }`}
      >
        {/* Subtle geometric circles in background */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-amber-500/10 pointer-events-none flex items-center justify-center">
          <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full border border-dashed border-amber-500/15 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-amber-500/20" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/25 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Traditional Horoscope Report
            </span>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-slate-800 dark:text-amber-100">
                {birthDetails.name || "Nitin Jain"}
              </h1>
              <p className={`text-xs ${mutedText} flex items-center gap-1`}>
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                {birthDetails.location || "Dehradun, Uttarakhand, India"}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 pt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span className={mutedText}>Date:</span>
                <span className="font-medium">{birthDetails.date || "1976-01-06"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className={mutedText}>Time:</span>
                <span className="font-medium">{birthDetails.time || "18:40"}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span className={mutedText}>Lagna:</span>
                <span className="font-bold text-amber-500">{lagna.sign || "Cancer"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-start gap-4 p-4 rounded-xl bg-slate-950/30 border border-amber-500/10 backdrop-blur-sm self-start md:self-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-amber-500/10 text-amber-400">
                <Moon className="w-4 h-4" />
              </div>
              <div className="leading-none">
                <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">Janma Rasi</span>
                <span className="text-xs font-semibold text-slate-200">
                  {planets.find((p: PlanetData) => p.name === "Moon")?.sign || "Taurus"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-800 md:border-l-0 md:border-t md:pt-2 md:mt-2 pl-4 md:pl-0 w-full">
              <div className="p-1.5 rounded bg-amber-500/10 text-amber-400">
                <Star className="w-4 h-4" />
              </div>
              <div className="leading-none">
                <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">Nakshatra</span>
                <span className="text-xs font-semibold text-slate-200">
                  {panchanga.nakshatra || "Rohini"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div id="horoscope-tabs" className="flex border-b border-indigo-500/10 gap-2 overflow-x-auto pb-px">
        <button
          id="tab-overview"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "overview"
              ? "border-amber-500 text-amber-500 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Raw Astro Data & Kundali
        </button>
        <button
          id="tab-predictions"
          onClick={() => setActiveTab("predictions")}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "predictions"
              ? "border-amber-500 text-amber-500 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Life Predictions
        </button>
        <button
          id="tab-daily"
          onClick={() => setActiveTab("daily")}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === "daily"
              ? "border-amber-500 text-amber-500 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Daily Predictions & Muhurta
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div id="overview-section" className="space-y-6">
          {/* Side-by-Side Divisional Charts */}
          <div 
            id="kundali-charts-card" 
            className={`p-6 rounded-2xl border ${cardStyle} space-y-4`}
          >
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Divisional Kundali Charts</h3>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-2 p-4 rounded-xl bg-slate-950/20 border border-slate-800/50">
                <span className="text-xs font-mono text-amber-500 font-bold block text-center uppercase tracking-wider">
                  D1 Rasi Kundali (Natal Chart)
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

              <div className="space-y-2 p-4 rounded-xl bg-slate-950/20 border border-slate-800/50">
                <span className="text-xs font-mono text-amber-500 font-bold block text-center uppercase tracking-wider">
                  D9 Navamsa Kundali (Dharma / Destiny)
                </span>
                <div className="relative">
                  <AstroChart
                    rasiChart={rasiChart}
                    navamsaChart={navamsaChart}
                    divisionalCharts={divisionalCharts}
                    vargaLagnas={vargaLagnas}
                    lagnaSignIndex={lagna.signIndex}
                    lagnaSignName={lagna.sign}
                  />
                  {/* Visual indication of default to D9 in secondary chart container */}
                  <div className="absolute top-2 right-2 text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                    D9 Navamsa
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Astro Data Table */}
          <div 
            id="planetary-table-card" 
            className={`p-6 rounded-2xl border ${cardStyle} space-y-4`}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Planetary Placements & Raw Data</h3>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                Ayanamsa: {birthDetails.ayanamsa || "Lahiri"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`${tableHeaderStyle} font-semibold border-b ${borderStyle}`}>
                    <th className="p-3">Planet</th>
                    <th className="p-3">Sign Placement</th>
                    <th className="p-3">Exact Degrees</th>
                    <th className="p-3">Nakshatra</th>
                    <th className="p-3">Pada</th>
                    <th className="p-3">Sub Lord</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {/* Append Lagna as the first entry */}
                  <tr className={`${tableRowStyle} transition-colors`}>
                    <td className="p-3 font-semibold text-amber-500">ASCENDANT (Lagna)</td>
                    <td className="p-3">{lagna.sign || "Cancer"}</td>
                    <td className="p-3 font-mono">{lagna.degree ? formatDegree(lagna.degree) : "00° 00'"}</td>
                    <td className="p-3">--</td>
                    <td className="p-3">--</td>
                    <td className="p-3">--</td>
                    <td className="p-3">
                      <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-mono px-2 py-0.5 rounded">
                        Ascendant Lord
                      </span>
                    </td>
                  </tr>

                  {planets.map((p: PlanetData) => (
                    <tr key={p.name} className={`${tableRowStyle} transition-colors`}>
                      <td className="p-3 font-semibold text-slate-200 flex items-center gap-1.5">
                        {p.name === "Sun" && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                        {p.name === "Moon" && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                        <span>{p.name}</span>
                      </td>
                      <td className="p-3">{p.sign}</td>
                      <td className="p-3 font-mono">{formatDegree(p.longitude)}</td>
                      <td className="p-3">{p.nakshatra || "Rohini"}</td>
                      <td className="p-3 font-semibold">{p.pada || 1}</td>
                      <td className="p-3 font-mono">{p.lord || "Jupiter"}</td>
                      <td className="p-3">
                        {p.retrograde ? (
                          <span className="bg-rose-500/10 text-rose-400 text-[9px] font-mono px-2 py-0.5 rounded border border-rose-500/20">
                            Retrograde
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded border border-emerald-500/20">
                            Direct
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panchanga Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border ${cardStyle} space-y-4`}>
              <div className="flex items-center gap-2 border-b border-indigo-500/5 pb-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Traditional Panchanga Pillars</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/20 border border-slate-800/40 space-y-1">
                  <span className={`${mutedText} text-[10px] uppercase font-bold tracking-wider block`}>Tithi (Lunar Day)</span>
                  <span className="font-semibold text-slate-200">{panchanga.tithi || "Shukla Ekadashi"}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/20 border border-slate-800/40 space-y-1">
                  <span className={`${mutedText} text-[10px] uppercase font-bold tracking-wider block`}>Nakshatra (Constellation)</span>
                  <span className="font-semibold text-slate-200">{panchanga.nakshatra || "Rohini"}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/20 border border-slate-800/40 space-y-1">
                  <span className={`${mutedText} text-[10px] uppercase font-bold tracking-wider block`}>Yoga (Soli-Lunar)</span>
                  <span className="font-semibold text-slate-200">{panchanga.yoga || "Preeti"}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/20 border border-slate-800/40 space-y-1">
                  <span className={`${mutedText} text-[10px] uppercase font-bold tracking-wider block`}>Karana (Half-Tithi)</span>
                  <span className="font-semibold text-slate-200">{panchanga.karana || "Bava"}</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${cardStyle} space-y-4`}>
              <div className="flex items-center gap-2 border-b border-indigo-500/5 pb-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Ashtakoota Core Compatibility Metrics</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded bg-slate-950/10 border border-slate-800/20 text-center">
                  <span className={`${mutedText} text-[9px] uppercase tracking-wide block`}>Varna (Class)</span>
                  <span className="font-semibold text-slate-200 text-xs block mt-1">{panchanga.varna || "Kshatriya"}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/10 border border-slate-800/20 text-center">
                  <span className={`${mutedText} text-[9px] uppercase tracking-wide block`}>Vashya (Control)</span>
                  <span className="font-semibold text-slate-200 text-xs block mt-1">{panchanga.vashya || "Chatushpada"}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/10 border border-slate-800/20 text-center">
                  <span className={`${mutedText} text-[9px] uppercase tracking-wide block`}>Yoni (Nature)</span>
                  <span className="font-semibold text-slate-200 text-xs block mt-1">{panchanga.yoni || "Simha"}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/10 border border-slate-800/20 text-center">
                  <span className={`${mutedText} text-[9px] uppercase tracking-wide block`}>Gana (Temper)</span>
                  <span className="font-semibold text-slate-200 text-xs block mt-1">{panchanga.gana || "Manushya"}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/10 border border-slate-800/20 text-center">
                  <span className={`${mutedText} text-[9px] uppercase tracking-wide block`}>Nadi (Physiology)</span>
                  <span className="font-semibold text-slate-200 text-xs block mt-1">{panchanga.nadi || "Madhya"}</span>
                </div>
                <div className="p-2.5 rounded bg-amber-500/5 border border-amber-500/10 text-center">
                  <span className={`${accentText} text-[9px] uppercase tracking-wide block font-bold`}>Lagna Sign</span>
                  <span className="font-bold text-amber-500 text-xs block mt-1">{lagna.sign || "Cancer"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "predictions" && (
        <div id="predictions-section" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Career & Profession */}
          <div className={`p-6 rounded-2xl border ${cardStyle} space-y-4`}>
            <div className="flex items-center gap-2 border-b border-indigo-500/5 pb-2">
              {career.icon}
              <h3 className="text-sm font-bold uppercase tracking-wider">{career.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {career.text}
            </p>
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Key Indicators:</span>
              {career.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Finance & Wealth */}
          <div className={`p-6 rounded-2xl border ${cardStyle} space-y-4`}>
            <div className="flex items-center gap-2 border-b border-indigo-500/5 pb-2">
              {finance.icon}
              <h3 className="text-sm font-bold uppercase tracking-wider">{finance.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {finance.text}
            </p>
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Key Indicators:</span>
              {finance.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Marriage & Relationships */}
          <div className={`p-6 rounded-2xl border ${cardStyle} space-y-4`}>
            <div className="flex items-center gap-2 border-b border-indigo-500/5 pb-2">
              {marriage.icon}
              <h3 className="text-sm font-bold uppercase tracking-wider">{marriage.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {marriage.text}
            </p>
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Key Indicators:</span>
              {marriage.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ChevronRight className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Health & Vitality */}
          <div className={`p-6 rounded-2xl border ${cardStyle} space-y-4`}>
            <div className="flex items-center gap-2 border-b border-indigo-500/5 pb-2">
              {health.icon}
              <h3 className="text-sm font-bold uppercase tracking-wider">{health.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {health.text}
            </p>
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">Key Indicators:</span>
              {health.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "daily" && (
        <div id="daily-section" className="space-y-6">
          <div 
            id="daily-predictions-card" 
            className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} space-y-6 bg-gradient-to-r ${
              isDark ? "from-slate-950 to-slate-900" : "from-amber-50/20 to-white"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                  Lunar Transit Guidance
                </span>
                <h3 className="text-base font-bold text-slate-200">Daily Astronomical Transit Analysis</h3>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800/40 px-3 py-1 rounded-lg border border-slate-700/50">
                📅 {daily.date}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="md:col-span-2 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {daily.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Highly Auspicious For
                    </span>
                    <ul className="space-y-1.5">
                      {daily.auspiciousFor.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-normal flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Caution Advised For
                    </span>
                    <ul className="space-y-1.5">
                      {daily.cautionFor.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-normal flex items-start gap-1.5">
                          <span className="text-rose-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Day stats */}
              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 text-xs h-fit self-center">
                <div className="text-center pb-2 border-b border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">Personalized Rulers</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className={mutedText}>Transiting Moon Nakshatra:</span>
                  <span className="font-semibold text-slate-200">{daily.nakshatra}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className={mutedText}>Active Tithi:</span>
                  <span className="font-semibold text-slate-200">{daily.tithi}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className={mutedText}>Auspicious Colors:</span>
                  <span className="font-semibold text-slate-200 text-right">{daily.luckyColor}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className={mutedText}>Lucky Numbers:</span>
                  <span className="font-mono font-bold text-amber-500">{daily.luckyNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
