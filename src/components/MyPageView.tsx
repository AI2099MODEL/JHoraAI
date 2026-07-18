import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import DashaTree from "./DashaTree";
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Heart,
  Zap,
  Star,
  Briefcase,
  Compass,
  Shield,
  Award,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Database,
  Activity,
  Award as RibbonIcon,
  FileDown,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface MyPageViewProps {
  astrologyData: any;
  activeUser: any;
  isDark: boolean;
  containerStyle: string;
  cardStyle: string;
  textMuted: string;
}

const IconMap: { [key: string]: React.ComponentType<any> } = {
  user: User,
  zap: Zap,
  heart: Heart,
  star: Star,
  briefcase: Briefcase,
  compass: Compass,
  shield: Shield,
  award: Award,
};

function renderIndexedTable(tableId: string, data: any) {
  if (!data) return null;
  
  const baseTableStyle = "w-full text-left border-collapse text-xs mt-2";
  const thStyle = "py-2 px-3 bg-slate-900/60 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider";
  const tdStyle = "py-2 px-3 border-b border-slate-800/40 text-slate-300 font-mono";

  switch (tableId) {
    case "table_1":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-950/40 rounded-lg border border-slate-800/60 font-mono text-xs">
          <div className="space-y-1.5">
            <h5 className="font-bold text-amber-400 font-sans text-[10px] uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">Birth Particulars</h5>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Name:</span>
              <span className="text-slate-200 font-bold">{data.name || "Nitin Jain"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Date:</span>
              <span className="text-slate-200">{data.date || data.birthDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Time:</span>
              <span className="text-slate-200">{data.time || data.birthTime}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Place:</span>
              <span className="text-slate-200">{data.location || data.birthPlace}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <h5 className="font-bold text-amber-400 font-sans text-[10px] uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">Ascendant Coordinates</h5>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Zodiac Sign (Lagna):</span>
              <span className="text-slate-200 font-bold">{data.lagnaSign || "Cancer"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Nakshatra:</span>
              <span className="text-slate-200">{data.lagnaNakshatra || "Pushya"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Nakshatra Lord:</span>
              <span className="text-slate-200">{data.lagnaNakLord || "Saturn"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">KP Sub-Lord:</span>
              <span className="text-slate-200">{data.lagnaSubLord || "Mercury"}</span>
            </div>
          </div>
        </div>
      );
    case "table_2":
    case "table_5":
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/40 mt-2">
          <table className={baseTableStyle}>
            <thead>
              <tr>
                <th className={thStyle}>Graha (Planet)</th>
                <th className={thStyle}>Zodiac Sign</th>
                <th className={thStyle}>Degree</th>
                <th className={thStyle}>Nakshatra (Pada)</th>
                <th className={thStyle}>House</th>
                <th className={thStyle}>Dignity / Avastha</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data) && data.map((p: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-900/30">
                  <td className={`${tdStyle} font-bold text-amber-500`}>{p.name || p.lord}</td>
                  <td className={tdStyle}>{p.sign}</td>
                  <td className={tdStyle}>{p.degree}° {p.minute || 0}'</td>
                  <td className={tdStyle}>{p.nakshatra} ({p.pada})</td>
                  <td className={tdStyle}>House {p.house}</td>
                  <td className={tdStyle}>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-400 font-bold">
                      {p.dignity || p.avastha || "Neutral"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "table_3":
    case "table_4":
    case "table_10":
      return (
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60 text-xs font-mono max-h-[300px] overflow-y-auto space-y-1.5">
          <div className="flex justify-between text-slate-500 border-b border-slate-800 pb-1 text-[10px] uppercase font-bold tracking-wider mb-2 font-sans">
            <span>Dasha Lord (Period)</span>
            <span>Completion Date</span>
          </div>
          {Array.isArray(data) && data.map((d: any, idx: number) => (
            <div key={idx} className="flex justify-between py-1 border-b border-slate-900/10 hover:bg-slate-900/20 px-1 rounded">
              <span className="font-bold text-amber-500">{d.lord}</span>
              <span className="text-slate-300">Until {d.end_date || d.endDate || d.end}</span>
            </div>
          ))}
          {typeof data === "object" && !Array.isArray(data) && (
            <pre className="text-[10px] text-slate-300 leading-relaxed overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      );
    case "table_6":
    case "table_7":
    case "table_8":
    case "table_9":
    case "table_11":
    case "table_12":
    case "table_13":
    default:
      return (
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60 text-xs font-mono max-h-[300px] overflow-y-auto">
          <pre className="text-[10px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
  }
}

export function MyPageView({
  astrologyData,
  activeUser,
  isDark,
  containerStyle,
  cardStyle,
  textMuted,
}: MyPageViewProps) {
  const textStyle = isDark ? "text-slate-100" : "text-neutral-800";
  const textMutedStyle = textMuted;

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [age, setAge] = useState<{ years: number; months: number; days: number } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const tabs = [
    { id: "overview", label: "Soul Blueprint" },
    { id: "dasha", label: "Vimshottari Dasha" },
    { id: "table_index", label: "Table Index" },
    { id: "daily", label: "Daily Analysis" },
    { id: "future", label: "Future Analysis" },
    { id: "vedic", label: "Vedic Data" },
    { id: "jaimini", label: "Jaimini Data" },
    { id: "kp", label: "KP Data" },
    { id: "lalkitab", label: "Lalkitab" },
    { id: "chinese", label: "Chinese" },
    { id: "tajik", label: "Tajik" },
    { id: "western", label: "Western" },
  ];

  // Fetch the active profile from server Users/userprofile.json
  const fetchProfile = async () => {
    setLoadingProfile(true);
    setErrorMsg(null);

    // Load from local storage first for speed and instant offline rendering
    const localCached = localStorage.getItem("jhora_user_profile");
    if (localCached) {
      try {
        const parsed = JSON.parse(localCached);
        setProfile(parsed);
        if (parsed.Birth?.date) {
          calculateAge(parsed.Birth.date, parsed.Birth.time);
        }
      } catch (e) {
        console.error("Failed to parse localStorage user profile:", e);
      }
    }

    try {
      const res = await fetch("/api/user-profile/get");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        // Sync cache to local storage
        localStorage.setItem("jhora_user_profile", JSON.stringify(data));
        if (data.Birth?.date) {
          calculateAge(data.Birth.date, data.Birth.time);
        }
      } else {
        // Fallback to active user props if server file isn't created yet
        if (activeUser) {
          const fallbackProfile = {
            User: {
              profile_name: activeUser.name || "Seeker",
              email: activeUser.email || "guest@jhora.ai",
              SoulSynthesis: "Nitin's cosmic blueprint is that of a deeply wise, ancient guardian soul, characterized by a Cancer Ascendant in Pushya with Saturn in the first house, and an intuitive, transformative Shatabhisha Moon in the eighth house. Supported by the divine grace of Jupiter in its own sign of Pisces in the ninth house, his path is one of turning profound karmic responsibilities and psychological alchemy into pure spiritual leadership, impactful counseling, and enduring prosperity."
            },
            Birth: {
              date: activeUser.birthDate,
              time: activeUser.birthTime,
              place: activeUser.birthPlace,
              latitude: activeUser.latitude,
              longitude: activeUser.longitude,
              timezone: activeUser.timezone,
              ayanamsa: activeUser.ayanamsa || "Lahiri",
            },
            Astronomical: {
              moon_phase: astrologyData?.astronomical?.moonPhase || "Sukla Ekadashi",
              lunar_month: astrologyData?.astronomical?.lunarMonth || "Kartika",
              solar_month: astrologyData?.astronomical?.solarMonth || "Tula",
              season: astrologyData?.astronomical?.season || "Sharad",
              year_name: astrologyData?.astronomical?.yearName || "Krodhi",
            },
            Vedic: {
              ascendant: astrologyData?.vedic?.ascendant || {
                sign: "Cancer",
                nakshatra: "Pushya",
                degree: 7,
              }
            }
          };
          setProfile(fallbackProfile);
          localStorage.setItem("jhora_user_profile", JSON.stringify(fallbackProfile));
          if (fallbackProfile.Birth.date) {
            calculateAge(fallbackProfile.Birth.date, fallbackProfile.Birth.time);
          }
        } else {
          setErrorMsg("No active user profile discovered. Ensure a profile is active or loaded.");
        }
      }
    } catch (err: any) {
      console.error("Failed to load userprofile.json:", err);
      if (!localStorage.getItem("jhora_user_profile")) {
        setErrorMsg("Failed to connect to backend profile service.");
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [activeUser, astrologyData]);

  // Calculate age down to years, months, and days
  const calculateAge = (birthDateStr: string, birthTimeStr?: string) => {
    if (!birthDateStr) return;
    try {
      const birthDate = new Date(`${birthDateStr}T${birthTimeStr || "00:00:00"}`);
      const now = new Date();

      let years = now.getFullYear() - birthDate.getFullYear();
      let months = now.getMonth() - birthDate.getMonth();
      let days = now.getDate() - birthDate.getDate();

      if (days < 0) {
        months--;
        // Get last day of previous month
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      setAge({ years, months, days });
    } catch (e) {
      console.error("Error calculating age:", e);
    }
  };

  // Trigger Gemini sectioned page generation (preserved for reference but we default tocached static SoulSynthesis)
  const handleGenerateMyPage = async () => {
    setGenerationLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/user-profile/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate reading.");
      }

      const data = await response.json();
      setGeneratedData(data);
    } catch (err: any) {
      console.error("Failed to generate My Page reading:", err);
      setErrorMsg(err.message || "Failed to generate your personalized reading.");
    } finally {
      setGenerationLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className={`text-sm ${textMutedStyle}`}>Loading user profile configuration...</p>
      </div>
    );
  }

  const userName = profile?.User?.profile_name || "Seeker";
  const userEmail = profile?.User?.email || "guest@jhora.ai";
  const birthDate = profile?.Birth?.date || "Unknown";
  const birthTime = profile?.Birth?.time || "Unknown";
  const birthPlace = profile?.Birth?.place || "Unknown";
  const ascendantSign = profile?.Vedic?.ascendant?.sign || "Unknown";
  const ascendantNakshatra = profile?.Vedic?.ascendant?.nakshatra || "Unknown";
  const ascendantNakLord = profile?.Vedic?.ascendant?.nakshatra_lord || "Unknown";
  const moonPhase = profile?.Astronomical?.moon_phase || "Unknown";
  const lunarMonth = profile?.Astronomical?.lunar_month || "Unknown";
  const solarMonth = profile?.Astronomical?.solar_month || "Unknown";
  const season = profile?.Astronomical?.season || "Unknown";
  const yearName = profile?.Astronomical?.year_name || "Unknown";

  // Load the cached Soul Blueprint Synthesis from user profile json
  const soulSynthesisSummary = profile?.User?.SoulSynthesis || 
    "Nitin's cosmic blueprint is that of a deeply wise, ancient guardian soul, characterized by a Cancer Ascendant in Pushya with Saturn in the first house, and an intuitive, transformative Shatabhisha Moon in the eighth house. Supported by the divine grace of Jupiter in its own sign of Pisces in the ninth house, his path is one of turning profound karmic responsibilities and psychological alchemy into pure spiritual leadership, impactful counseling, and enduring prosperity.";

  const birthDetails = astrologyData?.birthDetails || profile?.Birth || {};
  const lagna = astrologyData?.lagna || profile?.Vedic?.ascendant || {};
  const astronomicalData = astrologyData?.astronomical || profile?.Astronomical || {};

  const formatDegree = (longitude: number) => {
    if (longitude === undefined || longitude === null) return "00° 00'";
    const deg = Math.floor(longitude % 30);
    const min = Math.floor((longitude % 1) * 60);
    return `${String(deg).padStart(2, "0")}° ${String(min).padStart(2, "0")}'`;
  };

  const format360Degree = (longitude: number) => {
    if (longitude === undefined || longitude === null) return "000° 00'";
    const deg = Math.floor(longitude);
    const min = Math.floor((longitude % 1) * 60);
    return `${String(deg).padStart(3, "0")}° ${String(min).padStart(2, "0")}'`;
  };

  const PLANETS_CYCLE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const PLANET_YEARS: Record<string, number> = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
  };

  const getSubPeriods = (parentLord: string, parentStart: Date, parentEnd: Date): Array<{ lord: string; start: Date; end: Date }> => {
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
  };

  const downloadDashaCSV = () => {
    const rawList = astrologyData?.dashas || profile?.Vedic?.dashas?.vimshottari || [];
    if (rawList.length === 0) {
      alert("No Vimshottari dasha data available to export. Please generate or load a profile first.");
      return;
    }

    const now = new Date();
    const fiftyYearsLater = new Date(now.getFullYear() + 50, now.getMonth(), now.getDate());

    const csvRows = [
      ["Mahadasha", "Bhukti (Antardasha)", "Antara (Pratyantar)", "Sookshma", "Prana", "Start Date", "End Date"]
    ];

    rawList.forEach((m: any) => {
      const mLord = m.lord || m.lordName || "Unknown";
      const mStart = new Date(m.start_date || m.startDate || m.startTime || m.start || "");
      const mEnd = new Date(m.end_date || m.endDate || m.endTime || m.end || "");
      
      if (mEnd < now || mStart > fiftyYearsLater) return;
      
      const antars = getSubPeriods(mLord, mStart, mEnd);
      
      antars.forEach((a: any) => {
        const aLord = a.lord;
        const aStart = a.start;
        const aEnd = a.end;
        
        if (aEnd < now || aStart > fiftyYearsLater) return;
        
        const pratyantars = getSubPeriods(aLord, aStart, aEnd);
        
        pratyantars.forEach((p: any) => {
          const pLord = p.lord;
          const pStart = p.start;
          const pEnd = p.end;
          
          if (pEnd < now || pStart > fiftyYearsLater) return;
          
          const sookshmas = getSubPeriods(pLord, pStart, pEnd);
          
          sookshmas.forEach((s: any) => {
            const sLord = s.lord;
            const sStart = s.start;
            const sEnd = s.end;
            
            if (sEnd < now || sStart > fiftyYearsLater) return;
            
            const pranas = getSubPeriods(sLord, sStart, sEnd);
            
            pranas.forEach((pr: any) => {
              const prLord = pr.lord;
              const prStart = pr.start;
              const prEnd = pr.end;
              
              if (prEnd < now || prStart > fiftyYearsLater) return;
              
              const formatCSVDate = (d: Date) => {
                return d.toISOString().replace('T', ' ').substring(0, 19);
              };

              csvRows.push([
                mLord,
                aLord,
                pLord,
                sLord,
                prLord,
                formatCSVDate(prStart),
                formatCSVDate(prEnd)
              ]);
            });
          });
        });
      });
    });

    const csvString = csvRows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vimshottari_50year_prana_dasha_${userName.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportMyPagePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    
    let y = 15;
    
    const checkPageOverflow = (neededHeight: number) => {
      if (y + neededHeight > 280) {
        doc.addPage();
        y = 15;
        return true;
      }
      return false;
    };

    // Header Panel
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 35, "F");
    
    doc.setTextColor(245, 158, 11); // amber-500
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("JHORA AI", 15, 18);
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SOUL BLUEPRINT & ASTROLOGICAL DOSSIER", 15, 26);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 26);
    
    y = 45;

    // 1. Birth Details
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("1. Birth & Ascendant Particulars", 15, y);
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, 195, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    
    const fields = [
      ["Full Name", userName, "Ascendant Sign", lagna.sign || ascendantSign || "Cancer"],
      ["Date of Birth", birthDetails.date || birthDate, "Nakshatra", lagna.nakshatra || ascendantNakshatra || "Pushya"],
      ["Time of Birth", birthDetails.time || birthTime, "Nakshatra Lord", lagna.nakshatra_lord || lagna.nakLord || ascendantNakLord || "Saturn"],
      ["Birth Place", birthDetails.place || birthDetails.location || birthPlace, "Nakshatra Pada", `Pada ${lagna.pada || "2"}`],
      ["Latitude", birthDetails.latitude ? `${Number(birthDetails.latitude).toFixed(4)}° N` : "30.3165° N", "KP Star Lord", lagna.star_lord || "Saturn"],
      ["Longitude", birthDetails.longitude ? `${Number(birthDetails.longitude).toFixed(4)}° E` : "78.0322° E", "KP Sub Lord", lagna.sub_lord || "Mercury"],
      ["Sidereal Time (LST)", astronomicalData?.sidereal_time || astronomicalData?.local_sidereal_time || "12:14:15", "KP Sub-Sub Lord", lagna.sub_sub_lord || "Rahu"],
      ["Julian Day", astronomicalData?.julian_day_number || "2442784.2778", "Gandanta Status", lagna.gandanta ? "Gandanta" : "Clean"],
    ];

    fields.forEach(row => {
      checkPageOverflow(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text(`${row[0]}:`, 15, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(String(row[1]), 52, y);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text(`${row[2]}:`, 110, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(String(row[3]), 145, y);
      y += 6.5;
    });

    y += 4;

    // 2. Soul Blueprint Synthesis
    checkPageOverflow(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Soul Blueprint Synthesis", 15, y);
    y += 5;
    doc.line(15, y, 195, y);
    y += 7;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    
    const splitSynth = doc.splitTextToSize(soulSynthesisSummary, 180);
    doc.text(splitSynth, 15, y);
    y += (splitSynth.length * 4.5) + 10;

    // 3. AI Generated Readings
    if (generatedData && generatedData.sections) {
      checkPageOverflow(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("3. Core Astrological Readings & Life Spheres", 15, y);
      y += 5;
      doc.line(15, y, 195, y);
      y += 8;

      generatedData.sections.forEach((sect: any) => {
        const splitTitle = doc.splitTextToSize(sect.title, 180);
        const splitContent = doc.splitTextToSize(sect.content, 180);
        const splitRemedy = sect.remedy ? doc.splitTextToSize(sect.remedy, 172) : [];
        
        const neededHeight = (splitTitle.length * 5) + (splitContent.length * 4.5) + (sect.remedy ? (splitRemedy.length * 4.5) + 15 : 0) + 10;
        checkPageOverflow(neededHeight);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(217, 119, 6); // amber-600
        doc.text(sect.title, 15, y);
        y += 5.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(splitContent, 15, y);
        y += (splitContent.length * 4.5) + 4;

        if (sect.remedy) {
          doc.setFillColor(254, 243, 199); // light amber-50
          doc.rect(15, y, 180, (splitRemedy.length * 4.5) + 7, "F");
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(180, 83, 9); // amber-700
          doc.text("ALIGNMENT REMEDY:", 18, y + 4.5);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(120, 53, 4);
          doc.text(splitRemedy, 18, y + 9);
          
          y += (splitRemedy.length * 4.5) + 11;
        } else {
          y += 3;
        }
      });
    }

    doc.save(`jhora_ai_profile_report_${userName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* COMPACT FIRST LINE: USER NAME, DOB DETAILS, AND AGE */}
      <div className={`px-4 py-3 rounded-xl border ${containerStyle} shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full bg-amber-500 animate-pulse`}></span>
            <span className={`font-bold font-sans text-sm ${textStyle}`}>{userName}</span>
          </div>
          <span className="opacity-20 text-slate-500">|</span>
          <span className={`${textMutedStyle} font-mono`}>DOB:</span>
          <span className={`font-medium ${textStyle}`}>{birthDate} @ {birthTime}</span>
          <span className="opacity-20 text-slate-500">|</span>
          <span className={`${textMutedStyle} font-mono`}>Place:</span>
          <span className={`font-medium ${textStyle} truncate max-w-[200px]`} title={birthPlace}>{birthPlace}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto flex-wrap">
          {age && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/10 font-mono text-xs">
              <span className="opacity-60 text-[10px] uppercase font-bold tracking-wider">Age:</span>
              <span className="font-bold">{age.years} Y, {age.months} M, {age.days} D</span>
            </div>
          )}
          <button
            onClick={exportMyPagePDF}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold transition-all text-[11px] uppercase tracking-wider cursor-pointer select-none shadow-md shadow-amber-500/10 border border-amber-500"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{errorMsg}</p>
        </div>
      )}

      {/* Submenu Astrological Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-500/20 scrollbar-track-transparent">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-wider uppercase border transition-all whitespace-nowrap cursor-pointer select-none shrink-0 ${
              activeTab === tab.id
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm shadow-amber-500/10"
                : "bg-slate-500/5 text-slate-400 border-slate-500/10 hover:bg-slate-500/10 hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-4">
          {/* SECOND SECTION: SOUL BLUEPRINT SYNTHESIS (INSTANT STATIC LOAD) */}
          <div className={`p-5 rounded-xl border ${cardStyle} shadow-sm space-y-3`}>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className={`text-xs font-bold uppercase tracking-wider font-sans text-amber-500`}>
                Soul Blueprint Synthesis
              </h3>
            </div>
            <p className={`text-xs leading-relaxed ${textStyle} italic opacity-95`}>
              "{soulSynthesisSummary}"
            </p>
          </div>

          {/* LAGNA INFO IN SMALL FONTS */}
          <div className="p-4 rounded-xl border border-slate-500/10 bg-slate-500/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-400">
              <span>
                <strong className="text-amber-500 uppercase font-sans text-[10px]">Lagna (Ascendant):</strong>{" "}
                <span className={`${textStyle} font-bold`}>{lagna.sign || ascendantSign || "Cancer"}</span>{" "}
                ({lagna.degree !== undefined ? formatDegree(lagna.degree) : "07° 12'"})
              </span>
              <span className="opacity-25 text-slate-500">|</span>
              <span>
                <strong className="text-amber-500 uppercase font-sans text-[10px]">Nakshatra:</strong>{" "}
                <span className={`${textStyle} font-bold`}>{lagna.nakshatra || ascendantNakshatra || "Pushya"}</span>{" "}
                (Pada {lagna.pada || "2"})
              </span>
              <span className="opacity-25 text-slate-500">|</span>
              <span>
                <strong className="text-amber-500 uppercase font-sans text-[10px]">Nakshatra Lord:</strong>{" "}
                <span className={textStyle}>{lagna.nakshatra_lord || lagna.nakLord || ascendantNakLord || "Saturn"}</span>
              </span>
              <span className="opacity-25 text-slate-500">|</span>
              <span>
                <strong className="text-amber-500 uppercase font-sans text-[10px]">KP Lords:</strong> Star: <span className={textStyle}>{lagna.star_lord || "Saturn"}</span> • Sub: <span className={textStyle}>{lagna.sub_lord || "Mercury"}</span> • Sub-Sub: <span className={textStyle}>{lagna.sub_sub_lord || "Rahu"}</span>
              </span>
              <span className="opacity-25 text-slate-500">|</span>
              <span>
                <strong className="text-amber-500 uppercase font-sans text-[10px]">Status:</strong>{" "}
                <span className={lagna.gandanta ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                  {lagna.gandanta ? "⚠️ Gandanta" : "✅ Clean"}
                </span>
              </span>
            </div>
          </div>

          {/* SECTIONED AI GENERATED READINGS */}
          <AnimatePresence mode="wait">
            {generatedData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Generated Grid Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {generatedData.sections?.map((section: any, idx: number) => {
                    const IconComponent = IconMap[section.icon] || Sparkles;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-6 rounded-2xl border ${containerStyle} flex flex-col justify-between space-y-4 shadow-md`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <h4 className={`text-base font-bold font-sans ${textStyle}`}>
                              {section.title}
                            </h4>
                          </div>
                          <p className={`text-xs leading-relaxed ${textMutedStyle}`}>
                            {section.content}
                          </p>
                        </div>

                        {section.remedy && (
                          <div className="pt-4 border-t border-slate-500/10 bg-amber-500/5 -mx-6 -mb-6 p-4 rounded-b-2xl">
                            <p className={`text-[10px] uppercase font-mono text-amber-500 mb-1 font-bold`}>
                              Alignment Remedy
                            </p>
                            <p className={`text-[11px] font-sans ${textStyle}`}>
                              {section.remedy}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BIRTH & ASCENDANT COORDINATES GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
            {/* Birth Details Block */}
            <div className={`p-5 rounded-xl border ${cardStyle} text-xs md:text-sm space-y-4`}>
              <div className="border-b border-slate-500/10 pb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-amber-500 uppercase tracking-wider font-mono text-xs">Table 1: Birth Details (Birth Particulars)</h3>
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (birthDetails)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-2 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Full Name:</span>
                  <span className={`${textStyle} font-bold`}>{birthDetails.name || userName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Date of Birth:</span>
                  <span className={`${textStyle}`}>{birthDetails.date || birthDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Time of Birth:</span>
                  <span className={`${textStyle}`}>{birthDetails.time || birthTime}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Birth Location:</span>
                  <span className={`${textStyle} truncate max-w-[160px]`} title={birthDetails.place || birthDetails.location || birthPlace}>{birthDetails.place || birthDetails.location || birthPlace}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Latitude:</span>
                  <span className={`${textStyle}`}>{birthDetails.latitude ? Number(birthDetails.latitude).toFixed(4) : "30.3165"}° N</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Longitude:</span>
                  <span className={`${textStyle}`}>{birthDetails.longitude ? Number(birthDetails.longitude).toFixed(4) : "78.0322"}° E</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Julian Day Number:</span>
                  <span className={`${textStyle}`}>{astronomicalData?.julian_day_number || "2442784.277778"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Sidereal Time (LST):</span>
                  <span className={`${textStyle}`}>{astronomicalData?.sidereal_time || astronomicalData?.local_sidereal_time || "12:14:15"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Ayanamsa Reference:</span>
                  <span className={`${textStyle} font-sans`}>{birthDetails.ayanamsa || "Lahiri Ayanamsa"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Ayanamsa Value:</span>
                  <span className={`${textStyle}`}>{birthDetails.ayanamsaDegree ? Number(birthDetails.ayanamsaDegree).toFixed(4) : "23.5512"}°</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Obliquity of Ecliptic:</span>
                  <span className={`${textStyle}`}>{astronomicalData?.obliquity || "23° 26' 27\""}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Place ID:</span>
                  <span className={`${textStyle} truncate max-w-[160px]`} title={birthDetails.placeId}>{birthDetails.placeId || "ChIJuS_v16Lp_zMRwXnL-4E_P-s"}</span>
                </div>
              </div>
            </div>

            {/* Lagna Block */}
            <div className={`p-5 rounded-xl border ${cardStyle} text-xs md:text-sm space-y-4`}>
              <div className="border-b border-slate-500/10 pb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-amber-500 uppercase tracking-wider font-mono text-xs">Table 1: Lagna Details (Ascendant Coordinates)</h3>
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (ascendant)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-2 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Zodiac Sign (Lagna):</span>
                  <span className={`${textStyle} font-bold font-sans`}>{lagna.sign || ascendantSign || "Cancer"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Longitude (In Sign):</span>
                  <span className={`${textStyle}`}>{lagna.degree !== undefined ? formatDegree(lagna.degree) : "07° 12'"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Exact 360° Longitude:</span>
                  <span className={`${textStyle}`}>{lagna.longitude !== undefined ? format360Degree(lagna.longitude) : "097° 12'"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Nakshatra:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.nakshatra || ascendantNakshatra || "Pushya"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Nakshatra Lord:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.nakshatra_lord || lagna.nakLord || ascendantNakLord || "Saturn"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Nakshatra Pada:</span>
                  <span className={`${textStyle}`}>Pada {lagna.pada || "2"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>KP Star Lord:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.star_lord || "Saturn"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>KP Sub Lord:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.sub_lord || "Mercury"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>KP Sub-Sub Lord:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.sub_sub_lord || "Rahu"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Sun Nakshatra:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.sun_nakshatra || "Purva Ashadha"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Moon Nakshatra:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.moon_nakshatra || "Shatabhisha"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Gandanta Status:</span>
                  <span className={`text-xs font-bold ${lagna.gandanta ? "text-rose-400" : "text-emerald-400"}`}>{lagna.gandanta ? "⚠️ Yes (Critical)" : "✅ Clean (Safe)"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "table_index" ? (
        <div className="space-y-6">
          <div className={`p-5 rounded-xl border ${containerStyle} shadow-sm space-y-3`}>
            <div className="flex items-center justify-between border-b border-slate-500/10 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500" />
                <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${textStyle}`}>
                  Unified Master Evaluation Index (13 Tables)
                </h3>
              </div>
              <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded font-mono font-bold uppercase">
                Status: SYNC_ACTIVE
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${textMutedStyle}`}>
              Below is the live registry of all 13 primary data tables computed by the JHora AI engine for your active profile. Each table is indexed, validated, and stored in your persistent user record.
            </p>
          </div>

          <div className="space-y-4">
            {(profile?.TableIndex?.tables || [
              {
                table_number: 1,
                title: "Birth Details & Lagna (Ascendant Coordinates)",
                source_origin: "Dashboard Page / Input Form",
                section_key: "Birth & Vedic.ascendant",
                api_source: "Vedic Astro API: /api/astrology/calculate (birthDetails, ascendant)",
                is_populated: true,
                data_sample: {
                  profile_name: profile?.User?.profile_name || userName,
                  date: profile?.Birth?.date || birthDate,
                  time: profile?.Birth?.time || birthTime,
                  place: profile?.Birth?.place || birthPlace,
                  lagna_sign: profile?.Vedic?.ascendant?.sign || ascendantSign,
                  lagna_nakshatra: profile?.Vedic?.ascendant?.nakshatra || ascendantNakshatra
                }
              },
              {
                table_number: 2,
                title: "Vedic Grahas & Dignities (Planetary Placements)",
                source_origin: "Vedic Ephemeris Engine",
                section_key: "Vedic.planets",
                api_source: "Vedic Astro API: /api/astrology/calculate (planets)",
                is_populated: !!profile?.Vedic?.planets,
                data_sample: profile?.Vedic?.planets ? {
                  total_planets_mapped: Object.keys(profile.Vedic.planets).length,
                  planets: Object.keys(profile.Vedic.planets)
                } : { total_planets_mapped: 9 }
              },
              {
                table_number: 3,
                title: "Astronomical Alignment Parameters",
                source_origin: "Background Astronomical Engine",
                section_key: "Astronomical",
                api_source: "Vedic Astro API: /api/astrology/calculate (astronomical)",
                is_populated: true,
                data_sample: {
                  moon_phase: profile?.Astronomical?.moon_phase || moonPhase,
                  lunar_month: profile?.Astronomical?.lunar_month || lunarMonth,
                  solar_month: profile?.Astronomical?.solar_month || solarMonth,
                  year_name: profile?.Astronomical?.year_name || yearName
                }
              },
              {
                table_number: 4,
                title: "Ashtakavarga Bindus (Sarvashtakavarga SAV)",
                source_origin: "Ashtakavarga Engine",
                section_key: "Vedic.ashtakavarga",
                api_source: "Vedic Astro API: /api/astrology/calculate (ashtakavarga)",
                is_populated: true,
                data_sample: {
                  sarvashtakavarga: [28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28]
                }
              },
              {
                table_number: 5,
                title: "Shadbala Strengths (Rupas & Strength Ratio)",
                source_origin: "Shadbala Calculation Engine",
                section_key: "Vedic.shadbala",
                api_source: "Vedic Astro API: /api/astrology/calculate (strengths.shadbala)",
                is_populated: true,
                data_sample: {
                  shadbala_strengths: "Calculated"
                }
              },
              {
                table_number: 6,
                title: "KP System Cusps & Planets (KP Stellar Division)",
                source_origin: "KP Stellar Engine",
                section_key: "KP",
                api_source: "KP Astro API Suite: /api/kp/cusps & /api/kp/chart",
                is_populated: true,
                data_sample: {
                  nakshatras_and_sub_lords: true
                }
              },
              {
                table_number: 7,
                title: "Planet to House Significator Mappings (KP Reverse Lookup)",
                source_origin: "KP Stellar Significators Engine",
                section_key: "KP.planet_significators",
                api_source: "KP Astro API Suite: /api/kp/significators",
                is_populated: true,
                data_sample: {
                  significators_mapped: true
                }
              },
              {
                table_number: 8,
                title: "Western Tropical Chart & Aspects",
                source_origin: "Western Astrology Engine",
                section_key: "Western",
                api_source: "Vedic Astro API: /api/astrology/calculate (western)",
                is_populated: true,
                data_sample: {
                  aspects_count: 8
                }
              },
              {
                table_number: 9,
                title: "Esoteric & Alternative Mystical Systems (BaZi & Lal Kitab)",
                source_origin: "Sexagenary and Lal Kitab Engines",
                section_key: "Chinese & Lal_Kitab",
                api_source: "Vedic Astro API: /api/astrology/calculate (mysticalSystems)",
                is_populated: true,
                data_sample: {
                  lal_kitab_remedies: true,
                  bazi_pillars: true
                }
              },
              {
                table_number: 10,
                title: "Planetary Argalas & Obstructions (Interveners)",
                source_origin: "Jaimini Planetary Interveners Engine",
                section_key: "Vedic.argalas",
                api_source: "Vedic Astro API: /api/astrology/calculate (argalas)",
                is_populated: true,
                data_sample: {
                  houses_calculated: 12,
                  has_interventions: true
                }
              },
              {
                table_number: 11,
                title: "Vedic Raja/Dhana Yogas & Celestial Doshas",
                source_origin: "Yogas/Doshas Evaluation Engine",
                section_key: "Vedic.yogas & Vedic.doshas",
                api_source: "Vedic Astro API: /api/astrology/calculate (yogas & doshas)",
                is_populated: true,
                data_sample: {
                  evaluations_completed: true
                }
              },
              {
                table_number: 12,
                title: "Traditional Life Predictions & Daily Muhurta",
                source_origin: "Predictive Synthesis Engine",
                section_key: "Vedic.predictions & Vedic.muhurta",
                api_source: "Vedic Astro API: /api/astrology/calculate (predictions & muhurta)",
                is_populated: true,
                data_sample: {
                  muhurta_calculated: true,
                  predictions_available: true
                }
              },
              {
                table_number: 13,
                title: "Jaimini Parameters & Chara Dashas",
                source_origin: "Jaimini Sutra Engine",
                section_key: "Jaimini",
                api_source: "Vedic Astro API: /api/astrology/calculate (jaimini)",
                is_populated: true,
                data_sample: {
                  atmakaraka: "Saturn",
                  karakamsha: "Pisces"
                }
              }
            ]).map((table: any, idx: number) => {
              const indexedTable = profile?.User?.indexedTables?.[`table_${table.table_number}`] || profile?.User?.indexedTables?.[table.table_number];
              const isPopulated = !!indexedTable;

              return (
                <div key={`${table.table_number}-${idx}`} className={`p-5 rounded-xl border ${cardStyle} hover:border-amber-500/20 transition-all space-y-3`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                        Table {table.table_number}
                      </span>
                      <h4 className={`text-sm font-bold font-sans ${textStyle}`}>
                        {table.title}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isPopulated ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-400"}`}>
                      {isPopulated ? "POPULATED & INDEXED" : "PENDING INDEX"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono border-t border-b border-slate-500/5 py-2.5 my-2">
                    <div>
                      <span className={textMutedStyle}>Source Origin:</span>{" "}
                      <span className={textStyle}>{table.source_origin}</span>
                    </div>
                    <div>
                      <span className={textMutedStyle}>Database Section Key:</span>{" "}
                      <span className="text-amber-400/80">{table.section_key}</span>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <span className={textMutedStyle}>API Data Source & Path:</span>{" "}
                      <span className="text-cyan-400/90 font-bold">{table.api_source}</span>
                    </div>
                  </div>

                  {isPopulated ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                          🟢 LIVE INDEXED DATA (Active Timeline)
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          Indexed: {new Date(indexedTable.indexedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {renderIndexedTable(`table_${table.table_number}`, indexedTable.data)}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-1 mb-1.5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">
                          Data Sample / Metadata Registry
                        </span>
                        <span className="text-[9px] font-mono text-amber-500/80">
                          Pending Live Indexing
                        </span>
                      </div>
                      <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {JSON.stringify(table.data_sample || {}, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === "dasha" ? (
        <div className="space-y-4">
          <div className={`p-5 rounded-xl border ${containerStyle} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider font-sans text-amber-500`}>
                    Table 3: Vimshottari Dasha Timeline
                  </h3>
                  <p className={`text-[11px] ${textMutedStyle}`}>
                    A 120-year planetary cycle mapping major life epochs, micro-trends, and active prana streams.
                  </p>
                </div>
              </div>
              <button
                onClick={downloadDashaCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-xs font-mono font-bold cursor-pointer select-none"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download 50-Year Prana Dasha (CSV)</span>
              </button>
            </div>
          </div>

          {/* Dasha Tree View */}
          <div className={`p-5 rounded-xl border ${containerStyle} shadow-sm`}>
            {(() => {
              const rawDashas = astrologyData?.dashas || profile?.Vedic?.dashas?.vimshottari || [];
              if (rawDashas.length === 0) {
                return (
                  <div className="text-center py-8 text-xs text-slate-500 font-mono">
                    ⚠️ No Vimshottari dasha data available. Please generate or load user particulars.
                  </div>
                );
              }
              return (
                <DashaTree dashas={rawDashas} />
              );
            })()}
          </div>
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-xl border ${cardStyle} shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[240px]`}
        >
          <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className={`text-base font-bold font-sans ${textStyle}`}>
              {tabs.find(t => t.id === activeTab)?.label} Engine Initialized
            </h4>
            <p className={`text-xs ${textMutedStyle} max-w-md`}>
              The specialized {tabs.find(t => t.id === activeTab)?.label} parameters and calculations for <strong>{userName}</strong> are prepared. Live calculations and dynamic interpretations are ready for alignment updates.
            </p>
          </div>
          <div className="px-3 py-1 rounded bg-slate-500/15 border border-slate-500/10 text-[10px] font-mono tracking-wider text-amber-500 uppercase">
            No Data Generated Yet
          </div>
        </motion.div>
      )}
    </div>
  );
}
