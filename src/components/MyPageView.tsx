import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Award as RibbonIcon
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
    { id: "daily", label: "Daily Analysis" },
    { id: "future", label: "Future Analysis" },
    { id: "transits", label: "Transits Analysis" },
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

        {age && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/10 font-mono text-xs shrink-0 self-start md:self-auto">
            <span className="opacity-60 text-[10px] uppercase font-bold tracking-wider">Age:</span>
            <span className="font-bold">{age.years} Years, {age.months} Months, {age.days} Days</span>
          </div>
        )}
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

          {/* OFFLINE BLUEPRINT DASHBOARD SECTION */}
          <div className="space-y-6">
            <h3 className={`text-lg font-bold font-sans ${textStyle} flex items-center gap-2`}>
              <Activity className="w-5 h-5 text-amber-500" /> Offline Astronomical & Vedic Parameters
            </h3>

            {/* Section 1: Astronomical alignments */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className={`p-4 rounded-xl border ${cardStyle} space-y-1`}>
                <span className={`text-[10px] uppercase font-mono ${textMutedStyle}`}>Lunar Phase</span>
                <p className={`text-xs font-semibold ${textStyle}`}>{moonPhase}</p>
              </div>
              <div className={`p-4 rounded-xl border ${cardStyle} space-y-1`}>
                <span className={`text-[10px] uppercase font-mono ${textMutedStyle}`}>Lunar Month</span>
                <p className={`text-xs font-semibold ${textStyle}`}>{lunarMonth}</p>
              </div>
              <div className={`p-4 rounded-xl border ${cardStyle} space-y-1`}>
                <span className={`text-[10px] uppercase font-mono ${textMutedStyle}`}>Solar Month</span>
                <p className={`text-xs font-semibold ${textStyle}`}>{solarMonth}</p>
              </div>
              <div className={`p-4 rounded-xl border ${cardStyle} space-y-1`}>
                <span className={`text-[10px] uppercase font-mono ${textMutedStyle}`}>Ritu (Season)</span>
                <p className={`text-xs font-semibold ${textStyle}`}>{season}</p>
              </div>
              <div className={`p-4 rounded-xl border ${cardStyle} space-y-1`}>
                <span className={`text-[10px] uppercase font-mono ${textMutedStyle}`}>Samvatsara (Year)</span>
                <p className={`text-xs font-semibold ${textStyle}`}>{yearName}</p>
              </div>
            </div>

            {/* Section 2: Ascendant Profile */}
            <div className={`p-5 rounded-2xl border ${containerStyle} space-y-4`}>
              <h4 className={`text-sm font-bold uppercase tracking-wider font-sans text-amber-500`}>
                Lagna (Ascendant) Profile
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className={`p-4 rounded-xl border ${cardStyle} space-y-1`}>
                  <span className={`text-[10px] uppercase font-mono ${textMutedStyle}`}>Ascendant Sign</span>
                  <p className={`text-base font-bold ${textStyle}`}>{ascendantSign}</p>
                </div>
                <div className={`p-4 rounded-xl border ${cardStyle} space-y-1`}>
                  <span className={`text-[10px] uppercase font-mono ${textMutedStyle}`}>Nakshatra</span>
                  <p className={`text-base font-bold ${textStyle}`}>{ascendantNakshatra}</p>
                </div>
                <div className={`p-4 rounded-xl border ${cardStyle} space-y-1`}>
                  <span className={`text-[10px] uppercase font-mono ${textMutedStyle}`}>Nakshatra Lord</span>
                  <p className={`text-base font-bold ${textStyle}`}>{ascendantNakLord}</p>
                </div>
              </div>
            </div>

            {/* Section 3: Detailed Planetary States */}
            {profile?.Vedic?.planets && (
              <div className={`p-5 rounded-2xl border ${containerStyle} space-y-4`}>
                <h4 className={`text-sm font-bold uppercase tracking-wider font-sans text-amber-500`}>
                  Planetary Dignities & States (Awasthas)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-500/10 text-[10px] uppercase font-mono text-amber-500">
                        <th className="pb-3 pr-4">Planet</th>
                        <th className="pb-3 px-4">Sign</th>
                        <th className="pb-3 px-4">Degree</th>
                        <th className="pb-3 px-4">House</th>
                        <th className="pb-3 px-4">Dignity</th>
                        <th className="pb-3 px-4">Baladi State</th>
                        <th className="pb-3 pl-4">Conscious State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-500/10 text-xs">
                      {Object.entries(profile.Vedic.planets).map(([name, planet]: [string, any]) => (
                        <tr key={name} className="hover:bg-slate-500/5">
                          <td className={`py-3 pr-4 font-bold ${textStyle}`}>{name}</td>
                          <td className={`py-3 px-4 ${textStyle}`}>{planet.sign || "N/A"}</td>
                          <td className={`py-3 px-4 font-mono ${textStyle}`}>
                            {planet.degree !== undefined ? `${planet.degree}° ${planet.minute || 0}'` : "N/A"}
                          </td>
                          <td className={`py-3 px-4 font-mono ${textStyle}`}>{planet.house || "N/A"}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-500`}>
                              {planet.dignity || "Neutral"}
                            </span>
                          </td>
                          <td className={`py-3 px-4 ${textStyle}`}>{planet.state?.baladi || "N/A"}</td>
                          <td className={`py-3 pl-4 ${textStyle}`}>{planet.state?.jagrat || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
