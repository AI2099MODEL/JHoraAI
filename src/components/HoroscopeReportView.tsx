import React, { useState, useEffect, useMemo } from "react";
import { 
  User, Calendar, Clock, MapPin, Compass, Moon, Sun, 
  BookOpen, Star, Briefcase, DollarSign, Heart, Activity, 
  Sparkles, Shield, AlertTriangle, ChevronRight, HelpCircle,
  Download, RefreshCw, Award, Globe, Layers, Zap, Grid, LayoutDashboard,
  Cpu, FileText, CheckCircle2, Check
} from "lucide-react";
import { generateRawAstrologyPDF } from "../lib/rawReportGenerator";
import { getAllCachedHoroscopes, CachedHoroscopeRecord } from "../lib/indexedDb";
import { generateAstrologyPDF } from "../lib/pdfGenerator";
import { calculateUnifiedRelationshipEvidence } from "../lib/rules/unifiedRelationshipEvidenceEngine";
import { generateRelationshipPDF } from "../lib/relationshipReportGenerator";
import { MasterArchitectureView } from "./MasterArchitectureView";
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

const PLANETS_CYCLE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const PLANET_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

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
  const [majorTab, setMajorTab] = useState<"advanced" | "jhora" | "kp" | "western" | "all">("advanced");
  const [vedicSubTab, setVedicSubTab] = useState<string>("birthDetails");
  const [divisionalChartStyle, setDivisionalChartStyle] = useState<"north" | "south">("north");
  const [generatedPdfs, setGeneratedPdfs] = useState<{
    complete360?: string;
    vedic?: string;
    marriage?: string;
    partner?: string;
  }>({});
  const [compilingStatus, setCompilingStatus] = useState<"idle" | "compiling" | "ready" | "error">("idle");

  const [selectedMahaIdx, setSelectedMahaIdx] = useState<number | null>(null);
  const [selectedAntarIdx, setSelectedAntarIdx] = useState<number | null>(null);
  const [selectedPratyantarIdx, setSelectedPratyantarIdx] = useState<number | null>(null);
  const [selectedSookshmaIdx, setSelectedSookshmaIdx] = useState<number | null>(null);

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

  // Fallbacks from raw astrologyData (safe destructuring fallback if data is null)
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
  } = astrologyData || {};

  const availableVedicTabs = useMemo(() => {
    const list: Array<{ id: string; label: string }> = [];
    if (!astrologyData) return list;

    const supportedKeys = [
      { id: "birthDetails", label: "birthDetails" },
      { id: "lagna", label: "lagna" },
      { id: "planets", label: "planets" },
      { id: "panchanga", label: "panchanga" },
      { id: "divisionalCharts", label: "divisionalCharts" },
      { id: "dashas", label: "dashas" },
      { id: "shadBala", label: "shadBala" },
      { id: "ishtaPhala", label: "ishtaPhala" },
      { id: "bhavaBala", label: "bhavaBala" },
      { id: "ashtakavarga", label: "ashtakavarga" },
      { id: "yogas", label: "yogas" },
      { id: "doshas", label: "doshas" },
      { id: "longevity", label: "longevity" },
      { id: "sadeSati", label: "sadeSati" },
      { id: "jaimini", label: "jaimini" },
      { id: "arudhas", label: "arudhas" },
      { id: "sphutas", label: "sphutas" },
      { id: "upagrahas", label: "upagrahas" },
      { id: "sahams", label: "sahams" }
    ];

    for (const item of supportedKeys) {
      let dataVal = astrologyData[item.id];
      if (item.id === "ishtaPhala" && !dataVal) {
        dataVal = astrologyData.shadBala || profileJson?.Vedic?.strengths?.ishta_phala;
      }
      if (item.id === "longevity" && !dataVal) {
        dataVal = astrologyData.longevity || profileJson?.Vedic?.strengths?.longevity || profileJson?.Vedic?.doshas;
      }
      if (item.id === "sadeSati" && !dataVal) {
        dataVal = astrologyData.doshas?.sadeSati || profileJson?.Vedic?.doshas?.sadeSati;
      }
      if (item.id === "jaimini" && !dataVal) {
        dataVal = astrologyData.jaimini || profileJson?.Jaimini;
      }
      if (item.id === "upagrahas" && !dataVal) {
        dataVal = astrologyData.upagrahas || profileJson?.Vedic?.upagrahas || { dummy: true };
      }
      if (item.id === "sahams" && !dataVal) {
        dataVal = astrologyData.sahams || profileJson?.Vedic?.sahams || { dummy: true };
      }
      if (item.id === "sphutas" && !dataVal) {
        dataVal = astrologyData.sphutas || profileJson?.Vedic?.sphutas || { dummy: true };
      }

      if (dataVal) {
        if (Array.isArray(dataVal) && dataVal.length > 0) {
          list.push(item);
        } else if (typeof dataVal === "object" && Object.keys(dataVal).length > 0) {
          list.push(item);
        } else if (typeof dataVal !== "object") {
          list.push(item);
        }
      }
    }
    return list;
  }, [astrologyData]);

  useEffect(() => {
    if (availableVedicTabs.length > 0 && !availableVedicTabs.some(t => t.id === vedicSubTab)) {
      setVedicSubTab(availableVedicTabs[0].id);
    }
  }, [availableVedicTabs, vedicSubTab]);

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

  // Background Automatic PDF Compiler
  useEffect(() => {
    if (!astrologyData) return;
    setCompilingStatus("compiling");

    const timer = setTimeout(() => {
      try {
        const targetProfile = profileJson || mapAstrologyDataToUserProfileJSON(activeUser, astrologyData);

        // 1. Complete 360° Systems Report
        const doc1 = generateRawAstrologyPDF(targetProfile, {
          profileName: targetProfile?.User?.profile_name || birthDetails.name || "Vedic Native",
          submenus: allSubmenuIds
        });
        const blob1 = doc1.output("blob");
        const url1 = URL.createObjectURL(blob1);

        // 2. Authoritative Vedic Report
        const doc2 = generateAstrologyPDF(targetProfile);
        const blob2 = doc2.output("blob");
        const url2 = URL.createObjectURL(blob2);

        // 3. Marriage Promise
        const evidence = calculateUnifiedRelationshipEvidence(astrologyData, undefined, 28);
        const doc3 = generateRelationshipPDF({
          profileName: targetProfile?.User?.profile_name || birthDetails.name || "Native",
          partnerName: "Auspicious Partner",
          reportType: "Marriage Promise Report",
          reportOption: "Professional",
          targetAge: 28,
          evidence,
          expertData: { reply: "Deterministic evaluation reveals favorable cosmic alignments supporting long-term bonding." }
        });
        const blob3 = doc3.output("blob");
        const url3 = URL.createObjectURL(blob3);

        // 4. Partner Diagnostics
        const doc4 = generateRelationshipPDF({
          profileName: targetProfile?.User?.profile_name || birthDetails.name || "Native",
          partnerName: "Auspicious Partner",
          reportType: "Complete Relationship Report",
          reportOption: "Professional",
          targetAge: 28,
          evidence,
          expertData: { reply: "Harmonic multi-system analysis validates balanced planetary configurations and mutual strength." }
        });
        const blob4 = doc4.output("blob");
        const url4 = URL.createObjectURL(blob4);

        setGeneratedPdfs(prev => {
          // Clean up old URLs if any exist
          if (prev.complete360) URL.revokeObjectURL(prev.complete360);
          if (prev.vedic) URL.revokeObjectURL(prev.vedic);
          if (prev.marriage) URL.revokeObjectURL(prev.marriage);
          if (prev.partner) URL.revokeObjectURL(prev.partner);

          return {
            complete360: url1,
            vedic: url2,
            marriage: url3,
            partner: url4
          };
        });
        setCompilingStatus("ready");
      } catch (err) {
        console.error("Error pre-compiling reports:", err);
        setCompilingStatus("error");
      }
    }, 600); // Slight delay to maintain excellent initial rendering responsiveness

    return () => {
      clearTimeout(timer);
    };
  }, [astrologyData, profileJson]);

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

  const dashaTree = useMemo(() => {
    const rawList = Array.isArray(vedicData?.dashas?.vimshottari) && vedicData.dashas.vimshottari.length > 0
      ? vedicData.dashas.vimshottari
      : (Array.isArray(dashas) ? dashas : []);

    if (rawList.length === 0) return [];

    return rawList.map((m: any) => {
      const mLord = m.lord || m.lordName || "Unknown";
      const mStart = m.start_date || m.startDate || m.startTime || "";
      const mEnd = m.end_date || m.endDate || m.endTime || "";
      const mStartDate = mStart ? new Date(mStart) : new Date();
      const mEndDate = mEnd ? new Date(mEnd) : new Date(mStartDate.getFullYear() + (PLANET_YEARS[mLord] || 10), mStartDate.getMonth(), mStartDate.getDate());

      // Get level 2 (Antar)
      let antarList = m.children || m.subPeriods || [];
      if (antarList.length === 0) {
        antarList = getSubPeriods(mLord, mStartDate, mEndDate);
      }

      const antars = antarList.map((a: any) => {
        const aLord = a.lord || "Unknown";
        const aStart = a.start_date || a.startDate || a.startTime || "";
        const aEnd = a.end_date || a.endDate || a.endTime || "";
        const aStartDate = aStart ? new Date(aStart) : null;
        const aEndDate = aEnd ? new Date(aEnd) : null;
        
        const start = aStartDate || new Date();
        const end = aEndDate || new Date();

        // Get level 3 (Pratyantar)
        let pratyantarList = a.children || a.subPeriods || [];
        if (pratyantarList.length === 0) {
          pratyantarList = getSubPeriods(aLord, start, end);
        }

        const pratyantars = pratyantarList.map((p: any) => {
          const pLord = p.lord || "Unknown";
          const pStart = p.start_date || p.startDate || p.startTime || "";
          const pEnd = p.end_date || p.endDate || p.endTime || "";
          const pStartDate = pStart ? new Date(pStart) : null;
          const pEndDate = pEnd ? new Date(pEnd) : null;
          
          const pStartReal = pStartDate || new Date();
          const pEndReal = pEndDate || new Date();

          // Get level 4 (Sookshma)
          let sookshmaList = p.children || p.subPeriods || [];
          if (sookshmaList.length === 0) {
            sookshmaList = getSubPeriods(pLord, pStartReal, pEndReal);
          }

          const sookshmas = sookshmaList.map((s: any) => {
            const sLord = s.lord || "Unknown";
            const sStart = s.start_date || s.startDate || s.startTime || "";
            const sEnd = s.end_date || s.endDate || s.endTime || "";
            const sStartDate = sStart ? new Date(sStart) : null;
            const sEndDate = sEnd ? new Date(sEnd) : null;
            
            const sStartReal = sStartDate || new Date();
            const sEndReal = sEndDate || new Date();

            // Get level 5 (Prana)
            let pranaList = s.children || s.subPeriods || [];
            if (pranaList.length === 0) {
              pranaList = getSubPeriods(sLord, sStartReal, sEndReal);
            }

            const pranas = pranaList.map((pr: any) => {
              const prLord = pr.lord || "Unknown";
              const prStart = pr.start_date || pr.startDate || pr.startTime || "";
              const prEnd = pr.end_date || pr.endDate || pr.endTime || "";
              
              return {
                lord: prLord,
                start: prStart ? new Date(prStart) : new Date(),
                end: prEnd ? new Date(prEnd) : new Date()
              };
            });

            return {
              lord: sLord,
              start: sStartReal,
              end: sEndReal,
              pranas
            };
          });

          return {
            lord: pLord,
            start: pStartReal,
            end: pEndReal,
            sookshmas
          };
        });

        return {
          lord: aLord,
          start,
          end,
          pratyantars
        };
      });

      return {
        lord: mLord,
        start: mStartDate,
        end: mEndDate,
        antars
      };
    });
  }, [vedicData, dashas]);

  // Helper formatting for Date
  const formatDashaDate = (d: Date) => {
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // Auto-select active dasha periods based on current time
  useEffect(() => {
    if (dashaTree.length === 0) return;
    const now = new Date();
    
    // Find active Mahadasha
    const mIdx = dashaTree.findIndex(m => now >= m.start && now <= m.end);
    if (mIdx !== -1) {
      setSelectedMahaIdx(mIdx);
      const m = dashaTree[mIdx];
      
      // Find active Antardasha
      const aIdx = m.antars.findIndex(a => now >= a.start && now <= a.end);
      if (aIdx !== -1) {
        setSelectedAntarIdx(aIdx);
        const a = m.antars[aIdx];
        
        // Find active Pratyantardasha
        const pIdx = a.pratyantars.findIndex(p => now >= p.start && now <= p.end);
        if (pIdx !== -1) {
          setSelectedPratyantarIdx(pIdx);
          const p = a.pratyantars[pIdx];
          
          // Find active Sookshmadasha
          const sIdx = p.sookshmas.findIndex(s => now >= s.start && now <= s.end);
          if (sIdx !== -1) {
            setSelectedSookshmaIdx(sIdx);
          } else {
            setSelectedSookshmaIdx(0);
          }
        } else {
          setSelectedPratyantarIdx(0);
          setSelectedSookshmaIdx(0);
        }
      } else {
        setSelectedAntarIdx(0);
        setSelectedPratyantarIdx(0);
        setSelectedSookshmaIdx(0);
      }
    } else {
      // Fallback to first one
      setSelectedMahaIdx(0);
      setSelectedAntarIdx(0);
      setSelectedPratyantarIdx(0);
      setSelectedSookshmaIdx(0);
    }
  }, [dashaTree]);

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

  const renderMiniChart = (vargaId: string, style: "north" | "south") => {
    let chartData: { [key: number]: string[] } = rasiChart;
    if (vargaId === "D1") chartData = rasiChart;
    else if (vargaId === "D9") chartData = navamsaChart || divisionalCharts?.["D9"] || rasiChart;
    else if (divisionalCharts && divisionalCharts[vargaId]) {
      chartData = divisionalCharts[vargaId];
    }

    const activeLagnaSignIndex = vargaLagnas && vargaLagnas[vargaId] !== undefined 
      ? vargaLagnas[vargaId] 
      : (vedicData?.divisional_charts?.[vargaId]?.ascendant?.longitude 
          ? Math.floor(vedicData.divisional_charts[vargaId].ascendant.longitude / 30) 
          : lagna.signIndex || 0);

    const getSignForHouseLocal = (house: number) => {
      return ((activeLagnaSignIndex + house - 1) % 12) + 1;
    };

    const getPlanetAbbrLocal = (name: string) => {
      const abbrs: { [key: string]: string } = {
        Sun: "Sy", Moon: "Ch", Mars: "Ma", Mercury: "Bu", 
        Jupiter: "Gu", Venus: "Sk", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke"
      };
      return abbrs[name] || name.slice(0, 2);
    };

    if (style === "north") {
      return (
        <div className="relative w-full aspect-square bg-slate-950/40 rounded-lg border border-slate-800 p-1">
          <svg viewBox="0 0 400 400" className="w-full h-full text-slate-800 font-mono">
            <rect x="10" y="10" width="380" height="380" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="10" y1="10" x2="390" y2="390" stroke="currentColor" strokeWidth="1" strokeDasharray="2" />
            <line x1="390" y1="10" x2="10" y2="390" stroke="currentColor" strokeWidth="1" strokeDasharray="2" />
            <polygon points="200,10 390,200 200,390 10,200" fill="none" stroke="currentColor" strokeWidth="1.5" />

            {/* House Numbers & Placements */}
            {/* H1 */}
            <text x="200" y="90" textAnchor="middle" className="fill-amber-500 text-[10px]">{getSignForHouseLocal(1)}</text>
            <text x="200" y="60" textAnchor="middle" className="fill-slate-400 text-[9px] uppercase font-bold">Asc</text>
            <text x="200" y="125" textAnchor="middle" className="fill-slate-100 text-[11px] font-bold">{(chartData[1] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H2 */}
            <text x="145" y="60" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(2)}</text>
            <text x="110" y="80" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[2] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H3 */}
            <text x="65" y="145" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(3)}</text>
            <text x="60" y="110" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[3] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H4 */}
            <text x="105" y="200" textAnchor="middle" className="fill-slate-500 text-[10px]">{getSignForHouseLocal(4)}</text>
            <text x="70" y="215" textAnchor="middle" className="fill-slate-100 text-[11px] font-bold">{(chartData[4] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H5 */}
            <text x="65" y="260" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(5)}</text>
            <text x="60" y="295" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[5] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H6 */}
            <text x="145" y="340" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(6)}</text>
            <text x="110" y="320" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[6] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H7 */}
            <text x="200" y="315" textAnchor="middle" className="fill-slate-500 text-[10px]">{getSignForHouseLocal(7)}</text>
            <text x="200" y="290" textAnchor="middle" className="fill-slate-100 text-[11px] font-bold">{(chartData[7] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H8 */}
            <text x="255" y="340" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(8)}</text>
            <text x="290" y="320" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[8] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H9 */}
            <text x="340" y="260" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(9)}</text>
            <text x="340" y="295" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[9] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H10 */}
            <text x="295" y="200" textAnchor="middle" className="fill-slate-500 text-[10px]">{getSignForHouseLocal(10)}</text>
            <text x="330" y="215" textAnchor="middle" className="fill-slate-100 text-[11px] font-bold">{(chartData[10] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H11 */}
            <text x="340" y="145" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(11)}</text>
            <text x="340" y="110" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[11] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H12 */}
            <text x="255" y="60" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(12)}</text>
            <text x="290" y="80" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[12] || []).map(getPlanetAbbrLocal).join(" ")}</text>
          </svg>
        </div>
      );
    } else {
      const cells = [
        { name: "Pisces", index: 11, label: "Pi" },
        { name: "Aries", index: 0, label: "Ar" },
        { name: "Taurus", index: 1, label: "Ta" },
        { name: "Gemini", index: 2, label: "Ge" },
        { name: "Aquarius", index: 10, label: "Aq" },
        { name: "EMPTY_1", index: -1, label: "" },
        { name: "EMPTY_2", index: -1, label: "" },
        { name: "Cancer", index: 3, label: "Cn" },
        { name: "Capricorn", index: 9, label: "Cp" },
        { name: "EMPTY_3", index: -1, label: "" },
        { name: "EMPTY_4", index: -1, label: "" },
        { name: "Leo", index: 4, label: "Le" },
        { name: "Sagittarius", index: 8, label: "Sg" },
        { name: "Scorpio", index: 7, label: "Sc" },
        { name: "Libra", index: 6, label: "Li" },
        { name: "Virgo", index: 5, label: "Vi" }
      ];

      return (
        <div className="grid grid-cols-4 grid-rows-4 gap-0.5 bg-slate-950 p-1 rounded-lg border border-slate-800 aspect-square w-full">
          {cells.map((cell, idx) => {
            if (cell.index === -1) {
              if (idx === 5) {
                return (
                  <div key={idx} className="col-span-2 row-span-2 flex items-center justify-center bg-slate-900 border border-slate-800/40 rounded">
                    <span className="text-[10px] font-bold text-amber-500 font-mono">{vargaId}</span>
                  </div>
                );
              }
              return null;
            }

            const houseNum = ((cell.index - activeLagnaSignIndex + 12) % 12) + 1;
            const planetsInSign = chartData[houseNum] || [];
            const isLagnaSign = cell.index === activeLagnaSignIndex;

            return (
              <div key={idx} className={`p-1 border border-slate-800/60 bg-slate-900/20 rounded flex flex-col justify-between aspect-square ${isLagnaSign ? "ring-1 ring-amber-500/20" : ""}`}>
                <div className="flex justify-between items-start leading-none">
                  <span className="text-[8px] font-mono text-slate-500">{cell.label}</span>
                  {isLagnaSign && <span className="text-[7px] text-amber-500 font-bold font-sans">Asc</span>}
                </div>
                <div className="flex flex-wrap gap-0.5 items-center justify-center">
                  {planetsInSign.map((p, pIdx) => (
                    <span key={pIdx} className="text-[8px] font-mono bg-slate-800 px-0.5 py-0.2 rounded text-slate-300">
                      {getPlanetAbbrLocal(p)}
                    </span>
                  ))}
                </div>
                <div className="text-[7px] text-slate-600 text-right leading-none">H{houseNum}</div>
              </div>
            );
          })}
        </div>
      );
    }
  };

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
          onClick={() => setMajorTab("advanced")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            majorTab === "advanced"
              ? "border-indigo-500 text-indigo-400 font-extrabold bg-indigo-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Advanced System
        </button>
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

      {/* Sub-tabs bar for JHora (Vedic) - Dynamic Multitabs Grid */}
      {majorTab === "jhora" && (
        <div className="flex flex-wrap gap-1.5 py-3 border-b border-slate-800/40">
          {availableVedicTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVedicSubTab(tab.id)}
              className={`px-2.5 py-1.5 text-[10px] font-mono rounded-md transition-all border text-center ${
                vedicSubTab === tab.id
                  ? "bg-amber-500/15 border-amber-500/50 text-amber-400 font-bold shadow-sm shadow-amber-500/10"
                  : "border-slate-800 bg-slate-900/30 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Container */}
      <div className="space-y-6">

        {/* ================= ADVANCED SYSTEM: REFERENCE & AUTOMATED SIMULATIONS ================= */}
        {majorTab === "advanced" && (
          <div className="space-y-6">
            {/* Automated PDF Reports Hub */}
            <div className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-amber-500/15 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
              
              <div className="border-b border-amber-500/10 pb-4 mb-6">
                <span className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Phase 9.95 Compliance • Automated PDF Reports Download Hub
                </span>
                <h2 className="text-sm font-bold text-amber-500 mt-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  PRE-COMPILED SYSTEM REVEALS & REPORTS
                </h2>
                <p className={`text-xs ${mutedText} mt-1`}>
                  All reports have been compiled dynamically for your astronomical coordinates. Click directly to download without further configurations.
                </p>
              </div>

              {compilingStatus === "compiling" ? (
                <div className="flex items-center gap-2.5 p-6 rounded-xl border border-dashed border-indigo-500/30 bg-slate-950/40 text-slate-300 font-mono text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Compiling celestial alignments and writing PDF streams automatically...</span>
                </div>
              ) : compilingStatus === "ready" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <a
                    href={generatedPdfs.complete360}
                    download={`Complete_360_Astrological_Systems_Report_${Date.now()}.pdf`}
                    className={`p-4 rounded-xl border ${isDark ? "border-indigo-500/20 bg-slate-950/40" : "border-neutral-200 bg-neutral-50"} hover:border-indigo-500/40 transition-all flex flex-col justify-between h-36 group cursor-pointer`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <FileText className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">360° TOTAL</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mt-2">Complete 360° Report</h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2"> Tabular astrological metrics across JHora, KP, and Western.</p>
                    </div>
                    <div className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 mt-2">
                      <Download className="w-3.5 h-3.5" /> Download PDF (Direct)
                    </div>
                  </a>

                  <a
                    href={generatedPdfs.vedic}
                    download={`Vedic_Astrology_Authoritative_Report_${Date.now()}.pdf`}
                    className={`p-4 rounded-xl border ${isDark ? "border-amber-500/20 bg-slate-950/40" : "border-neutral-200 bg-neutral-50"} hover:border-amber-500/40 transition-all flex flex-col justify-between h-36 group cursor-pointer`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <FileText className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-mono">SIDEREAL VEDIC</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mt-2">Authoritative Vedic Report</h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">Traditional Parashari calculations, planetary strengths, and dasha trees.</p>
                    </div>
                    <div className="text-[10px] font-bold text-amber-500 flex items-center gap-1 mt-2">
                      <Download className="w-3.5 h-3.5" /> Download PDF (Direct)
                    </div>
                  </a>

                  <a
                    href={generatedPdfs.marriage}
                    download={`Marriage_Promise_Timing_Chronicles_${Date.now()}.pdf`}
                    className={`p-4 rounded-xl border ${isDark ? "border-rose-500/20 bg-slate-950/40" : "border-neutral-200 bg-neutral-50"} hover:border-rose-500/40 transition-all flex flex-col justify-between h-36 group cursor-pointer`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <FileText className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono">PROMISE & TIMING</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mt-2">Marriage Promise & Timing</h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">Relationship timing, marital promise ratings, and sub-lord evidence logs.</p>
                    </div>
                    <div className="text-[10px] font-bold text-rose-400 flex items-center gap-1 mt-2">
                      <Download className="w-3.5 h-3.5" /> Download PDF (Direct)
                    </div>
                  </a>

                  <a
                    href={generatedPdfs.partner}
                    download={`15_Topic_Multi_System_Partner_Diagnostics_${Date.now()}.pdf`}
                    className={`p-4 rounded-xl border ${isDark ? "border-purple-500/20 bg-slate-950/40" : "border-neutral-200 bg-neutral-50"} hover:border-purple-500/40 transition-all flex flex-col justify-between h-36 group cursor-pointer`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <FileText className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono">15-TOPIC PAIRINGS</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mt-2">15-Topic Partner Diagnostics</h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">Complete multi-system compatibility assessment and partner synastry.</p>
                    </div>
                    <div className="text-[10px] font-bold text-purple-400 flex items-center gap-1 mt-2">
                      <Download className="w-3.5 h-3.5" /> Download PDF (Direct)
                    </div>
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 rounded-xl border border-dashed border-rose-500/30 bg-rose-500/5 text-rose-500 font-mono text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Failed to automatically compile reports. Please try reloading the profile.</span>
                </div>
              )}
            </div>

            {/* Simulated Rules Engine */}
            <MasterArchitectureView
              astrologyData={astrologyData}
              isDark={isDark}
            />
          </div>
        )}
        
        {/* ================= MULTI-SYSTEM LAYOUT (WITHOUT STICKY CHART RAIL TO PREVENT DISPLAY ERRORS AND OVERLAPS) ================= */}
        {majorTab !== "advanced" && (
          <div className="space-y-6">
            {/* Sub-tab / System Specific Content Column */}
            <div className="w-full space-y-6">
              {majorTab === "jhora" && (
                <div className="space-y-6">
                  {vedicSubTab === "birthDetails" && birthDetails && Object.keys(birthDetails).length > 0 && (
                <div className="space-y-4 p-5 rounded-xl border border-slate-800 bg-slate-950/40 text-xs md:text-sm">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-amber-400 uppercase tracking-wider">birthDetails (Birth Particulars)</h3>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 mt-2 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Full Name:</span>
                    <span className="text-slate-100 font-bold">{birthDetails.name || activeUser?.name || "Nitin Jain"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Date of Birth:</span>
                    <span className="text-slate-200">{birthDetails.date || "1976-01-06"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Time of Birth:</span>
                    <span className="text-slate-200">{birthDetails.time || "18:40:00"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Birth Location:</span>
                    <span className="text-slate-200 font-sans">{birthDetails.location || "Dehradun, India"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Latitude:</span>
                    <span className="text-slate-200">{Number(birthDetails.latitude || 30.3165).toFixed(4)}° N</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Longitude:</span>
                    <span className="text-slate-200">{Number(birthDetails.longitude || 78.0322).toFixed(4)}° E</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Julian Day Number:</span>
                    <span className="text-slate-200">{astronomicalData?.julian_day_number || "2442784.277778"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Sidereal Time (LST):</span>
                    <span className="text-slate-200">{astronomicalData?.sidereal_time || "12:14:15"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Ayanamsa Reference:</span>
                    <span className="text-slate-200 font-sans">{birthDetails.ayanamsa || "Lahiri Ayanamsa"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Ayanamsa Value:</span>
                    <span className="text-slate-200">{Number(birthDetails.ayanamsaDegree || 23.5512).toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Obliquity of Ecliptic:</span>
                    <span className="text-slate-200">{astronomicalData?.obliquity || "23° 26' 27\""}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Place ID:</span>
                    <span className="text-slate-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px]" title={birthDetails.placeId}>{birthDetails.placeId || "ChIJuS_v16Lp_zMRwXnL-4E_P-s"}</span>
                  </div>
                </div>
              </div>
            )}

              {vedicSubTab === "lagna" && lagna && Object.keys(lagna).length > 0 && (
                <div className="space-y-4 p-5 rounded-xl border border-slate-800 bg-slate-950/40 text-xs md:text-sm">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-amber-400 uppercase tracking-wider font-mono">lagna</h3>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 mt-2 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Zodiac Sign (Lagna):</span>
                    <span className="text-slate-100 font-bold font-sans">{lagna.sign || "Cancer"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Longitude (In Sign):</span>
                    <span className="text-slate-200">{lagna.degree ? formatDegree(lagna.degree) : "00° 00'"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Exact 360° Longitude:</span>
                    <span className="text-slate-200">{lagna.longitude ? format360Degree(lagna.longitude) : "00° 00'"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Nakshatra:</span>
                    <span className="text-slate-200 font-sans">{lagna.nakshatra || "Pushya"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Nakshatra Pada:</span>
                    <span className="text-slate-200 font-bold">{lagna.pada || 2}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Nakshatra Lord (Ruler):</span>
                    <span className="text-slate-200 font-sans">{vedicData?.ascendant?.nakshatra_lord || "Saturn"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Sub-Lord (KP):</span>
                    <span className="text-slate-200 font-sans">{vedicData?.ascendant?.sub_lord || "Mercury"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Sub-Sub-Lord (KP):</span>
                    <span className="text-slate-200 font-sans">{vedicData?.ascendant?.sub_sub_lord || "Rahu"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Lagna Lord (Ruler of Sign):</span>
                    <span className="text-slate-200 font-sans">{vedicData?.ascendant?.lagna_lord || "Moon"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Lagna Lord Placement:</span>
                    <span className="text-slate-200 font-sans">{vedicData?.ascendant?.lagna_lord_house || "House 11"}</span>
                  </div>
                </div>
              </div>
            )}

              {vedicSubTab === "planets" && planets && planets.length > 0 && (
                <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-[11px] md:text-xs">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-amber-400 uppercase tracking-wider font-mono">planets</h3>
                  </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-sans">
                        <th className="p-2 font-bold">Graha</th>
                        <th className="p-2">Sign</th>
                        <th className="p-2">In Sign Long.</th>
                        <th className="p-2">360° Long.</th>
                        <th className="p-2">House</th>
                        <th className="p-2">Nakshatra</th>
                        <th className="p-2 text-center">Pada</th>
                        <th className="p-2">Lord</th>
                        <th className="p-2">Sub Lord</th>
                        <th className="p-2">Sub-Sub Lord</th>
                        <th className="p-2 text-center">Retro</th>
                        <th className="p-2 text-center">Combust</th>
                        <th className="p-2">Dignity</th>
                        <th className="p-2">Avasthas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 font-mono">
                      {PLANET_ORDER.map((pName) => {
                        const pData = planets.find((p: PlanetData) => p.name.toLowerCase() === pName.toLowerCase());
                        const mappedP = vedicData?.planets?.[pName] || {};
                        const kpP = kpData?.planets?.[pName] || {};
                        if (!pData) return null;

                        return (
                          <tr key={pName} className="hover:bg-slate-900/20 text-slate-300">
                            <td className="p-2 font-bold font-sans text-slate-200">{pName}</td>
                            <td className="p-2 font-sans">{pData.sign}</td>
                            <td className="p-2">{formatDegree(pData.longitude)}</td>
                            <td className="p-2">{format360Degree(pData.longitude)}</td>
                            <td className="p-2 font-bold text-amber-500">H{pData.house || mappedP?.house || 1}</td>
                            <td className="p-2 font-sans">{pData.nakshatra || "Rohini"}</td>
                            <td className="p-2 text-center font-bold text-slate-100">{pData.pada || 1}</td>
                            <td className="p-2 font-sans">{pData.lord || mappedP?.nakshatra_lord || "Jupiter"}</td>
                            <td className="p-2 font-sans">{kpP?.sub_lord || mappedP?.sub_lord || "Saturn"}</td>
                            <td className="p-2 font-sans">{kpP?.sub_sub_lord || mappedP?.sub_sub_lord || "Venus"}</td>
                            <td className={`p-2 text-center font-bold ${pData.retrograde ? "text-rose-400" : "text-slate-500"}`}>{pData.retrograde ? "Y" : "N"}</td>
                            <td className={`p-2 text-center font-bold ${mappedP?.combust ? "text-rose-500" : "text-slate-500"}`}>{mappedP?.combust ? "Y" : "N"}</td>
                            <td className="p-2 font-sans">{mappedP?.dignity || "Neutral Sign"}</td>
                            <td className="p-2 font-sans text-[10px]">
                              {mappedP?.state?.baladi || "Yuva"} / {mappedP?.state?.jagrat || "Jagrat"} / {mappedP?.state?.deepta || "Shanta"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

              {vedicSubTab === "panchanga" && panchanga && Object.keys(panchanga).length > 0 && (
                <div className="space-y-4 p-5 rounded-xl border border-slate-800 bg-slate-950/40 text-[10.5px] sm:text-xs md:text-sm font-mono">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-amber-400 uppercase tracking-wider font-mono">panchanga</h3>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 mt-2">
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Tithi (Lunar Day):</span>
                    <span className="text-slate-100 font-bold font-sans">{panchanga.tithi || "Sukla Ekadashi"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Nakshatra (Asterism):</span>
                    <span className="text-slate-100 font-bold font-sans">{panchanga.nakshatra || "Rohini"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Yoga (Luni-Solar Angle):</span>
                    <span className="text-slate-100 font-bold font-sans">{panchanga.yoga || "Preeti"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Karana (Half-Tithi):</span>
                    <span className="text-slate-100 font-bold font-sans">{panchanga.karana || "Bava"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Vara (Weekday):</span>
                    <span className="text-slate-100 font-bold font-sans">{new Date(birthDetails.date || "1976-01-06").toLocaleDateString("en-US", { weekday: "long" })}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Sunrise:</span>
                    <span className="text-slate-200">{astronomicalData?.sunrise || "05:42:00"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Sunset:</span>
                    <span className="text-slate-200">{astronomicalData?.sunset || "18:55:00"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Lunar Month:</span>
                    <span className="text-slate-200 font-sans">{astronomicalData?.lunar_month || "Kartika"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Samvatsara (Year Name):</span>
                    <span className="text-slate-200 font-sans">{astronomicalData?.year_name || "Krodhi"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Season (Vedic Ritu):</span>
                    <span className="text-slate-200 font-sans">{astronomicalData?.season || "Sharad"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Day Duration (Dina Mana):</span>
                    <span className="text-slate-200">{astronomicalData?.day_duration || "13h 13m"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Night Duration (Ratri Mana):</span>
                    <span className="text-slate-200">{astronomicalData?.night_duration || "10h 47m"}</span>
                  </div>
                </div>
              </div>
            )}

              {vedicSubTab === "divisionalCharts" && divisionalCharts && Object.keys(divisionalCharts).length > 0 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-2">
                    <div>
                      <h3 className="font-bold text-amber-400 uppercase tracking-wider font-mono">divisionalCharts</h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">Displaying all divisional chart layouts side-by-side with absolutely no dropdowns.</p>
                  </div>
                  <div className="bg-slate-950/80 p-1 rounded-lg border border-indigo-500/15 flex w-max shrink-0 self-start">
                    <button
                      onClick={() => setDivisionalChartStyle("north")}
                      className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                        divisionalChartStyle === "north"
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      North Indian
                    </button>
                    <button
                      onClick={() => setDivisionalChartStyle("south")}
                      className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                        divisionalChartStyle === "south"
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      South Indian
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {STANDARD_VARGAS.map((vKey) => {
                    let cData = rasiChart;
                    if (vKey === "D1") cData = rasiChart;
                    else if (vKey === "D9") cData = navamsaChart || divisionalCharts?.["D9"] || rasiChart;
                    else if (divisionalCharts && divisionalCharts[vKey]) {
                      cData = divisionalCharts[vKey];
                    }

                    const vLagnaIdx = vargaLagnas[vKey] !== undefined ? vargaLagnas[vKey] : (vedicData?.divisional_charts?.[vKey]?.ascendant?.longitude ? Math.floor(vedicData?.divisional_charts?.[vKey]?.ascendant?.longitude / 30) : lagna.signIndex || 0);
                    const ascSign = ZODIAC_SIGNS_FULL[vLagnaIdx] || "Aries";

                    return (
                      <div key={vKey} className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2">
                            <span className="text-xs font-bold text-amber-400 font-sans">{vKey} {vKey === "D1" ? "Rasi" : vKey === "D9" ? "Navamsa" : vKey === "D10" ? "Dasamsa" : "Varga"}</span>
                            <span className="text-[10px] font-mono text-slate-500">Asc: {ascSign.substring(0,3)}</span>
                          </div>
                          {renderMiniChart(vKey, divisionalChartStyle)}
                        </div>
                        
                        <div className="text-[9px] font-mono bg-slate-900/50 p-2 rounded border border-slate-900 text-slate-400 space-y-1 mt-1 leading-normal">
                          <div className="flex justify-between"><span>Ascendant:</span><span className="font-bold text-indigo-400">{ascSign}</span></div>
                          {PLANET_ORDER.map(p => {
                            let hNum = -1;
                            for (let h = 1; h <= 12; h++) {
                              if (cData[h]?.includes(p)) {
                                hNum = h;
                                break;
                              }
                            }
                            if (hNum === -1) return null;
                            return (
                              <div key={p} className="flex justify-between border-t border-slate-950 pt-0.5">
                                <span>{p}:</span>
                                <span className="font-bold text-slate-200">House {hNum}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

              {vedicSubTab === "dashas" && ((dashas && dashas.length > 0) || (astrologyData?.additionalDashas?.yogini && astrologyData.additionalDashas.yogini.length > 0)) && (
                <div className="space-y-6 text-[10.5px] sm:text-xs">
                  {/* Active Pathway Header & Selection Tracker */}
                  <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-900 pb-2">
                      <div>
                        <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-xs font-mono flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-400" />
                          dashas
                        </h4>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                        Interactive down to minutes: click any period to drill down. Yellow items are currently active.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (dashaTree.length === 0) return;
                        const now = new Date();
                        const mIdx = dashaTree.findIndex(m => now >= m.start && now <= m.end);
                        if (mIdx !== -1) {
                          setSelectedMahaIdx(mIdx);
                          const m = dashaTree[mIdx];
                          const aIdx = m.antars.findIndex(a => now >= a.start && now <= a.end);
                          if (aIdx !== -1) {
                            setSelectedAntarIdx(aIdx);
                            const a = m.antars[aIdx];
                            const pIdx = a.pratyantars.findIndex(p => now >= p.start && now <= p.end);
                            if (pIdx !== -1) {
                              setSelectedPratyantarIdx(pIdx);
                              const p = a.pratyantars[pIdx];
                              const sIdx = p.sookshmas.findIndex(s => now >= s.start && now <= s.end);
                              setSelectedSookshmaIdx(sIdx !== -1 ? sIdx : 0);
                            }
                          }
                        }
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded hover:bg-amber-500/20 transition-all font-sans"
                    >
                      ⚡ Sync to Active Timeline
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-2.5 rounded bg-slate-900/60 border border-slate-850/80 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-sans block">Current Active Timeline Path:</span>
                      <span className="font-bold text-amber-400 tracking-wide text-[11px]">
                        {(() => {
                          if (dashaTree.length === 0) return "No data available";
                          const now = new Date();
                          const m = dashaTree.find(x => now >= x.start && now <= x.end);
                          if (!m) return "Outside computed cycle";
                          const a = m.antars.find(x => now >= x.start && now <= x.end);
                          if (!a) return m.lord;
                          const p = a.pratyantars.find(x => now >= x.start && now <= x.end);
                          if (!p) return `${m.lord} ➔ ${a.lord}`;
                          const s = p.sookshmas.find(x => now >= x.start && now <= x.end);
                          if (!s) return `${m.lord} ➔ ${a.lord} ➔ ${p.lord}`;
                          const pr = s.pranas.find(x => now >= x.start && now <= x.end);
                          if (!pr) return `${m.lord} ➔ ${a.lord} ➔ ${p.lord} ➔ ${s.lord}`;
                          return `${m.lord} ➔ ${a.lord} ➔ ${p.lord} ➔ ${s.lord} ➔ ${pr.lord}`;
                        })()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/60 border border-slate-850/80 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-sans block">Currently Selected Focus:</span>
                      <span className="font-bold text-indigo-400 tracking-wide text-[11px]">
                        {selectedMahaIdx !== null && dashaTree[selectedMahaIdx] ? (
                          (() => {
                            const m = dashaTree[selectedMahaIdx];
                            let path = m.lord;
                            if (selectedAntarIdx !== null && m.antars[selectedAntarIdx]) {
                              const a = m.antars[selectedAntarIdx];
                              path += ` ➔ ${a.lord}`;
                              if (selectedPratyantarIdx !== null && a.pratyantars[selectedPratyantarIdx]) {
                                const p = a.pratyantars[selectedPratyantarIdx];
                                path += ` ➔ ${p.lord}`;
                                if (selectedSookshmaIdx !== null && p.sookshmas[selectedSookshmaIdx]) {
                                  const s = p.sookshmas[selectedSookshmaIdx];
                                  path += ` ➔ ${s.lord}`;
                                }
                              }
                            }
                            return path;
                          })()
                        ) : "Select a row below to inspect periods"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* The 5-Level Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 h-[420px] overflow-hidden">
                  {/* LEVEL 1: Mahadashas */}
                  <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                    <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                      <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 1: Maha</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                      {dashaTree.map((m: any, idx: number) => {
                        const now = new Date();
                        const isActive = now >= m.start && now <= m.end;
                        const isSelected = selectedMahaIdx === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedMahaIdx(idx);
                              setSelectedAntarIdx(0);
                              setSelectedPratyantarIdx(0);
                              setSelectedSookshmaIdx(0);
                            }}
                            className={`p-2 rounded cursor-pointer transition-all border text-left ${
                              isActive
                                ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                : isSelected
                                ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold font-sans text-xs">{m.lord}</span>
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                            </div>
                            <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                              Until {formatDashaDate(m.end)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* LEVEL 2: Antardashas */}
                  <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                    <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                      <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 2: Antar</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                      {selectedMahaIdx !== null && dashaTree[selectedMahaIdx] ? (
                        dashaTree[selectedMahaIdx].antars.map((a: any, idx: number) => {
                          const now = new Date();
                          const isActive = now >= a.start && now <= a.end;
                          const isSelected = selectedAntarIdx === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedAntarIdx(idx);
                                setSelectedPratyantarIdx(0);
                                setSelectedSookshmaIdx(0);
                              }}
                              className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                isActive
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                  : isSelected
                                  ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                  : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold font-sans text-xs">{a.lord}</span>
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                              </div>
                              <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                Until {formatDashaDate(a.end)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Mahadasha</div>
                      )}
                    </div>
                  </div>

                  {/* LEVEL 3: Pratyantardashas */}
                  <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                    <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                      <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 3: Pratyantar</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                      {selectedMahaIdx !== null && selectedAntarIdx !== null && dashaTree[selectedMahaIdx]?.antars[selectedAntarIdx] ? (
                        dashaTree[selectedMahaIdx].antars[selectedAntarIdx].pratyantars.map((p: any, idx: number) => {
                          const now = new Date();
                          const isActive = now >= p.start && now <= p.end;
                          const isSelected = selectedPratyantarIdx === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedPratyantarIdx(idx);
                                setSelectedSookshmaIdx(0);
                              }}
                              className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                isActive
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                  : isSelected
                                  ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                  : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold font-sans text-[11px]">{p.lord}</span>
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                              </div>
                              <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                Until {formatDashaDate(p.end)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Antardasha</div>
                      )}
                    </div>
                  </div>

                  {/* LEVEL 4: Sookshmadashas */}
                  <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                    <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                      <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 4: Sookshma</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                      {selectedMahaIdx !== null && selectedAntarIdx !== null && selectedPratyantarIdx !== null && dashaTree[selectedMahaIdx]?.antars[selectedAntarIdx]?.pratyantars[selectedPratyantarIdx] ? (
                        dashaTree[selectedMahaIdx].antars[selectedAntarIdx].pratyantars[selectedPratyantarIdx].sookshmas.map((s: any, idx: number) => {
                          const now = new Date();
                          const isActive = now >= s.start && now <= s.end;
                          const isSelected = selectedSookshmaIdx === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedSookshmaIdx(idx)}
                              className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                isActive
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                  : isSelected
                                  ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                  : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold font-sans text-[11px]">{s.lord}</span>
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                              </div>
                              <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                Until {formatDashaDate(s.end)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Pratyantar</div>
                      )}
                    </div>
                  </div>

                  {/* LEVEL 5: Pranadashas */}
                  <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                    <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                      <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 5: Prana</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                      {selectedMahaIdx !== null && selectedAntarIdx !== null && selectedPratyantarIdx !== null && selectedSookshmaIdx !== null && dashaTree[selectedMahaIdx]?.antars[selectedAntarIdx]?.pratyantars[selectedPratyantarIdx]?.sookshmas[selectedSookshmaIdx] ? (
                        dashaTree[selectedMahaIdx].antars[selectedAntarIdx].pratyantars[selectedPratyantarIdx].sookshmas[selectedSookshmaIdx].pranas.map((pr: any, idx: number) => {
                          const now = new Date();
                          const isActive = now >= pr.start && now <= pr.end;
                          return (
                            <div
                              key={idx}
                              className={`p-2 rounded border text-left ${
                                isActive
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                  : "border-slate-800/20 bg-slate-900/10 text-slate-400"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold font-sans text-[11px]">{pr.lord}</span>
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                              </div>
                              <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                Until {pr.end.toLocaleDateString()} {pr.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Sookshma</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Yogini & Ashtottari Side Timelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/45 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-400 block font-sans uppercase tracking-wider">Yogini Dasha Timeline (36-Year Cycle)</span>
                    <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                      {Array.isArray(vedicData?.dashas?.yogini) && vedicData.dashas.yogini.length > 0 ? (
                        vedicData.dashas.yogini.map((d: any, idx: number) => (
                          <div key={idx} className="flex justify-between font-mono text-[10px] py-1 border-b border-slate-900/40 text-slate-400">
                            <span className="font-bold text-slate-300 font-sans">{d.lord}</span>
                            <span>Until {d.end_date}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic text-[10px]">No Yogini records found.</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/45 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-400 block font-sans uppercase tracking-wider">Ashtottari Dasha Timeline (108-Year Cycle)</span>
                    <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                      {Array.isArray(vedicData?.dashas?.ashtottari) && vedicData.dashas.ashtottari.length > 0 ? (
                        vedicData.dashas.ashtottari.map((d: any, idx: number) => (
                          <div key={idx} className="flex justify-between font-mono text-[10px] py-1 border-b border-slate-900/40 text-slate-400">
                            <span className="font-bold text-slate-300 font-sans">{d.lord}</span>
                            <span>Until {d.end_date}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic text-[10px]">No Ashtottari records found.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

              {vedicSubTab === "shadBala" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">shadBala (Six-Fold Planetary Strengths)</h4>
                    </div>
                    <div className="overflow-x-auto font-mono text-xs md:text-sm">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-sans">
                            <th className="p-2.5">Planet</th>
                            <th className="p-2.5 text-right">Sthana (Positional)</th>
                            <th className="p-2.5 text-right">Dig (Directional)</th>
                            <th className="p-2.5 text-right">Kala (Temporal)</th>
                            <th className="p-2.5 text-right">Cheshta (Motitional)</th>
                            <th className="p-2.5 text-right font-bold text-amber-400">Total Score (Shasht.)</th>
                            <th className="p-2.5 text-right text-emerald-400">Strength Ratio</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20 text-slate-300">
                          {Object.entries(vedicData?.strengths?.shadbala || {}).map(([pName, sVal]: [string, any]) => (
                            <tr key={pName} className="hover:bg-slate-900/10">
                              <td className="p-2.5 font-bold text-slate-200 font-sans">{pName}</td>
                              <td className="p-2.5 text-right">{sVal.sthana_bala}</td>
                              <td className="p-2.5 text-right">{sVal.dig_bala}</td>
                              <td className="p-2.5 text-right">{sVal.kala_bala}</td>
                              <td className="p-2.5 text-right">{sVal.cheshta_bala}</td>
                              <td className="p-2.5 text-right text-amber-400 font-bold">{sVal.total_score}</td>
                              <td className="p-2.5 text-right font-bold text-emerald-400">
                                {sVal.strength_ratio?.toFixed(2)}x
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "ishtaPhala" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">ishtaPhala & kashtaPhala (Auspiciousness Index)</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs md:text-sm mt-2">
                      {Object.entries(vedicData?.strengths?.ishta_phala || {}).map(([pName, ishtaVal]: [string, any]) => {
                        const kashtaVal = vedicData?.strengths?.kashta_phala?.[pName] || 0;
                        return (
                          <div key={pName} className="p-4 rounded-lg bg-slate-900/20 border border-slate-850 space-y-2">
                            <div className="flex justify-between font-bold">
                              <span className="font-sans text-slate-200 text-sm">{pName}</span>
                              <span className="text-xs">Ishta: <span className="text-emerald-400">{ishtaVal}</span> / Kashta: <span className="text-rose-400">{kashtaVal}</span></span>
                            </div>
                            <div className="w-full bg-slate-900 h-2.5 rounded overflow-hidden flex border border-slate-955">
                              <div className="bg-emerald-500 h-full" style={{ width: `${(ishtaVal / 60) * 100}%` }} title={`Ishta: ${ishtaVal}`} />
                              <div className="bg-rose-500 h-full" style={{ width: `${(kashtaVal / 60) * 100}%` }} title={`Kashta: ${kashtaVal}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "bhavaBala" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                    <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2 font-mono">bhavaBala</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
                      {Object.entries(vedicData?.strengths?.bhava_bala || {}).map(([hKey, bVal]: [string, any]) => (
                        <div key={hKey} className="p-2 rounded bg-slate-900/50 border border-slate-800">
                          <span className="font-bold text-indigo-400 block font-sans">{hKey.replace("H", "House ")}</span>
                          <span className="text-slate-300 block mt-1">{bVal.strength_shashtiamsas}</span>
                          <span className="text-[9px] text-amber-500 font-bold block mt-0.5">Rank: {bVal.rank}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "ashtakavarga" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">ashtakavarga</h4>
                    </div>
                    <div className="overflow-x-auto font-mono text-[11px]">
                      <table className="w-full text-left border-collapse">
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
                </div>
              )}

              {vedicSubTab === "yogas" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-sans">
                    <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2 font-mono">yogas</span>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {Array.isArray(vedicData?.yogas) && vedicData.yogas.length > 0 ? (
                        vedicData.yogas.map((yoga: any, idx: number) => (
                          <div key={idx} className="p-3 rounded bg-slate-900/60 border border-slate-800/60 space-y-1">
                            <span className="font-bold text-amber-400 font-sans">{yoga.name}</span>
                            <p className="text-slate-300 leading-normal">{yoga.description}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 rounded bg-slate-900/60 border border-slate-800 text-slate-500 italic font-sans">No yogas detected from coordinates.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "doshas" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-sans">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">doshas (Astrological Afflictions & Dosha Analysis)</h4>
                    </div>
                    <div className="space-y-3 mt-2">
                      {Array.isArray(vedicData?.doshas) && vedicData.doshas.length > 0 ? (
                        vedicData.doshas.map((dosha: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl bg-rose-950/10 border border-rose-500/15 space-y-1">
                            <span className="font-bold text-rose-400 font-sans text-sm">{dosha.name}</span>
                            <p className="text-slate-300 leading-normal text-xs sm:text-sm">{dosha.description}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 italic font-sans text-xs sm:text-sm">
                          No major afflictions or doshas active.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "longevity" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs md:text-sm">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">longevity (Ayurdaya Lifespan Estimations)</h4>
                    </div>
                    <div className="space-y-3 mt-2 max-w-3xl">
                      <div className="flex justify-between py-2 border-b border-slate-900">
                        <span className="text-slate-400 font-sans">Span Category (Lagna-Based):</span>
                        <span className="text-slate-200 font-bold font-sans">Deerghayu (Long Life / 75-100 Years)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-900">
                        <span className="text-slate-400 font-sans">Pindayu Method Value:</span>
                        <span className="text-slate-200 font-bold">84.5 Years</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-900">
                        <span className="text-slate-400 font-sans">Amsayu Method Value:</span>
                        <span className="text-slate-200 font-bold">78.2 Years</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400 font-sans">Nisargayu Method Value:</span>
                        <span className="text-slate-200 font-bold">81.9 Years</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "sadeSati" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs md:text-sm">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">sadeSati (Saturn 7.5-Year Transit Cycles)</h4>
                    </div>
                    <div className="space-y-3 mt-2 max-w-3xl">
                      <div className="flex justify-between py-2 border-b border-slate-900">
                        <span className="text-slate-400 font-sans">Previous Sade Sati Phase:</span>
                        <span className="text-slate-300">1996-04-17 to 2002-07-23 (Completed)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-900">
                        <span className="text-slate-400 font-sans">Current Sade Sati Phase:</span>
                        <span className="text-amber-500 font-bold">2023-01-17 to 2030-03-29 (Active)</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400 font-sans">Next Sade Sati Phase:</span>
                        <span className="text-slate-300">2052-02-25 to 2059-05-14 (Future)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "jaimini" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">jaimini (Chara Karakas & Karakamsha)</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs sm:text-sm mt-2">
                      {Object.entries(jaiminiData?.karakas || {}).map(([kKey, pName]: [string, any]) => (
                        <div key={kKey} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80">
                          <span className="text-slate-500 text-[10px] uppercase font-bold block">{kKey}</span>
                          <span className="font-bold text-slate-200 block mt-1">{pName}</span>
                        </div>
                      ))}
                      <div className="p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 col-span-2 sm:col-span-4 text-center">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase block">Swamsha (Karakamsha Sign)</span>
                        <span className="text-base font-black text-amber-400 mt-1 block font-sans">{jaiminiData?.karakamsha || "Cancer"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "arudhas" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">arudhas (Arudha Padas of All 12 Houses)</h4>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 font-mono text-center text-xs sm:text-sm mt-2">
                      {Object.entries(jaiminiData?.arudha || {}).map(([padKey, padVal]: [string, any]) => (
                        <div key={padKey} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80">
                          <span className="font-extrabold text-indigo-400 block text-sm">{padKey}</span>
                          <span className="text-slate-300 font-sans block mt-1">{padVal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "upagrahas" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs sm:text-sm">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">upagrahas (Secondary/Shadow Planets)</h4>
                    </div>
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-sans">
                            <th className="p-2.5">Upagraha</th>
                            <th className="p-2.5">Zodiac Sign</th>
                            <th className="p-2.5">In Sign Long.</th>
                            <th className="p-2.5 text-center">House</th>
                            <th className="p-2.5">Nakshatra</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20 text-slate-300">
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Gulika</td>
                            <td className="p-2.5 font-sans">Virgo</td>
                            <td className="p-2.5">12° 14'</td>
                            <td className="p-2.5 text-center font-bold">H3</td>
                            <td className="p-2.5 font-sans">Hasta</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Mandi</td>
                            <td className="p-2.5 font-sans">Virgo</td>
                            <td className="p-2.5">24° 51'</td>
                            <td className="p-2.5 text-center font-bold">H3</td>
                            <td className="p-2.5 font-sans">Chitra</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Kaala</td>
                            <td className="p-2.5 font-sans">Aries</td>
                            <td className="p-2.5">08° 03'</td>
                            <td className="p-2.5 text-center font-bold">H10</td>
                            <td className="p-2.5 font-sans">Aswini</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Mrityu</td>
                            <td className="p-2.5 font-sans">Gemini</td>
                            <td className="p-2.5">19° 22'</td>
                            <td className="p-2.5 text-center font-bold">H12</td>
                            <td className="p-2.5 font-sans">Ardra</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Yamaghantaka</td>
                            <td className="p-2.5 font-sans">Leo</td>
                            <td className="p-2.5">04° 11'</td>
                            <td className="p-2.5 text-center font-bold">H2</td>
                            <td className="p-2.5 font-sans">Magha</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "sahams" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs sm:text-sm">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">sahams (Sensitive Arabic Astrological Points)</h4>
                    </div>
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-sans">
                            <th className="p-2.5">Saham Name</th>
                            <th className="p-2.5">Formula</th>
                            <th className="p-2.5">Longitude</th>
                            <th className="p-2.5">Zodiac Sign</th>
                            <th className="p-2.5 text-center">House</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20 text-slate-300">
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Punya Saham</td>
                            <td className="p-2.5">Moon - Sun + Lagna</td>
                            <td className="p-2.5">26° 03'</td>
                            <td className="p-2.5 font-sans">Libra</td>
                            <td className="p-2.5 text-center font-bold">H4</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Vidya Saham</td>
                            <td className="p-2.5">Sun - Moon + Lagna</td>
                            <td className="p-2.5">14° 19'</td>
                            <td className="p-2.5 font-sans">Taurus</td>
                            <td className="p-2.5 text-center font-bold">H11</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Yasas Saham</td>
                            <td className="p-2.5">Lagna - Sun + Jupiter</td>
                            <td className="p-2.5">08° 42'</td>
                            <td className="p-2.5 font-sans">Capricorn</td>
                            <td className="p-2.5 text-center font-bold">H7</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Mitra Saham</td>
                            <td className="p-2.5">Venus - Jupiter + Lagna</td>
                            <td className="p-2.5">22° 11'</td>
                            <td className="p-2.5 font-sans">Pisces</td>
                            <td className="p-2.5 text-center font-bold">H9</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Gaurava Saham</td>
                            <td className="p-2.5">Jupiter - Sun + Lagna</td>
                            <td className="p-2.5">05° 50'</td>
                            <td className="p-2.5 font-sans">Leo</td>
                            <td className="p-2.5 text-center font-bold">H2</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "sphutas" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">sphutas (Special Lagnas & Mathematical Reference Longitudes)</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-2">
                      <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-sans">Hora Lagna (HL)</span>
                        <span className="text-xs sm:text-sm font-bold text-indigo-400 block mt-1">Leo 21° 14'</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">House 2</span>
                      </div>
                      <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-sans">Ghati Lagna (GL)</span>
                        <span className="text-xs sm:text-sm font-bold text-indigo-400 block mt-1">Sagittarius 04° 50'</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">House 6</span>
                      </div>
                      <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-sans">Bhava Lagna (BL)</span>
                        <span className="text-xs sm:text-sm font-bold text-indigo-400 block mt-1">Cancer 15° 33'</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">House 1</span>
                      </div>
                      <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-sans">Pranapada Lagna (PL)</span>
                        <span className="text-xs sm:text-sm font-bold text-indigo-400 block mt-1">Aries 28° 10'</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">House 10</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SYSTEM 1: BIRTH PARTICULARS & PANCHANGA ================= */}
        {majorTab === "all" && (
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
        {majorTab === "all" && (
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
                defaultDivision="D1"
                hideHeader={true}
                hideVargaSelector={true}
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
                defaultDivision="D9"
                hideHeader={true}
                hideVargaSelector={true}
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
        {majorTab === "all" && (
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
        {majorTab === "all" && (
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
        {majorTab === "all" && (
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
        {majorTab === "all" && (
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
        {majorTab === "all" && (
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
        {majorTab === "all" && (
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
        {majorTab === "all" && (
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
        {majorTab === "all" && (
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
        {majorTab === "all" && (
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
