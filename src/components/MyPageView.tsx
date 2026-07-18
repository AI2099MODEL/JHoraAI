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

  // Fetch the active profile from server Users/userprofile.json
  const fetchProfile = async () => {
    setLoadingProfile(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/user-profile/get");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
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
          if (fallbackProfile.Birth.date) {
            calculateAge(fallbackProfile.Birth.date, fallbackProfile.Birth.time);
          }
        } else {
          setErrorMsg("No active user profile discovered. Ensure a profile is active or loaded.");
        }
      }
    } catch (err: any) {
      console.error("Failed to load userprofile.json:", err);
      setErrorMsg("Failed to connect to backend profile service.");
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

  // Trigger Gemini sectioned page generation
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

  return (
    <div className="space-y-6">
      {/* HEADER SECTION - AGE CALCULATION */}
      <div className={`p-6 rounded-2xl border ${containerStyle} shadow-lg relative overflow-hidden`}>
        {/* Subtle decorative background glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20`}>
                User Blueprint
              </span>
              <span className={`text-xs font-mono ${textMutedStyle} flex items-center gap-1`}>
                <Database className="w-3.5 h-3.5" /> userprofile.json
              </span>
            </div>
            <h1 className={`text-3xl font-bold font-sans tracking-tight ${textStyle}`}>
              {userName}
            </h1>
            <p className={`text-sm ${textMutedStyle} flex items-center gap-1.5`}>
              <User className="w-4 h-4 text-amber-500" /> {userEmail}
            </p>
          </div>

          {/* Real-time calculated age display */}
          {age && (
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col items-center justify-center min-w-[200px]">
              <span className="text-[10px] font-mono tracking-wider uppercase text-amber-500 mb-1">
                Dynamic Celestial Age
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black font-sans text-amber-500`}>{age.years}</span>
                <span className={`text-xs font-medium ${textMutedStyle} mr-2`}>Y</span>
                <span className={`text-2xl font-black font-sans text-amber-500/80`}>{age.months}</span>
                <span className={`text-xs font-medium ${textMutedStyle} mr-2`}>M</span>
                <span className={`text-xl font-black font-sans text-amber-500/60`}>{age.days}</span>
                <span className={`text-xs font-medium ${textMutedStyle}`}>D</span>
              </div>
              <span className={`text-[10px] ${textMutedStyle} mt-1.5`}>
                Calculated down to your birth moment
              </span>
            </div>
          )}
        </div>

        {/* BIRTH DETAILS METRIC ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-wider font-mono ${textMutedStyle}`}>Date of Birth</p>
              <p className={`text-sm font-semibold ${textStyle}`}>{birthDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-wider font-mono ${textMutedStyle}`}>Time of Birth</p>
              <p className={`text-sm font-semibold ${textStyle}`}>{birthTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className={`text-[10px] uppercase tracking-wider font-mono ${textMutedStyle}`}>Place of Birth</p>
              <p className={`text-sm font-semibold ${textStyle} truncate`} title={birthPlace}>{birthPlace}</p>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{errorMsg}</p>
        </div>
      )}

      {/* GENERATE SECTION BUTTON */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className={`text-lg font-bold font-sans ${textStyle} flex items-center justify-center sm:justify-start gap-2`}>
            <Sparkles className="w-5 h-5 text-amber-500" /> Generate My Personal Page
          </h2>
          <p className={`text-xs ${textMutedStyle}`}>
            Synthesize your full astrological data using Gemini 3.5 Flash for deep, sectioned insights.
          </p>
        </div>
        <button
          onClick={handleGenerateMyPage}
          disabled={generationLoading}
          className={`px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer select-none`}
        >
          {generationLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Generate Report
            </>
          )}
        </button>
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
            {/* Soul Overview Card */}
            <div className={`p-6 rounded-2xl border ${cardStyle} shadow-lg space-y-4`}>
              <h3 className={`text-xl font-bold font-sans ${textStyle} flex items-center gap-2`}>
                <RibbonIcon className="w-5 h-5 text-amber-500" /> Soul Blueprint Synthesis
              </h3>
              <p className={`text-sm leading-relaxed ${textStyle} italic opacity-90`}>
                "{generatedData.summary}"
              </p>
            </div>

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
  );
}
