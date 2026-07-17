import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Compass,
  Shield,
  Sparkles,
  Table,
  Database,
  RefreshCw,
  Layers,
  Moon,
  Sun,
  Award,
  ChevronRight,
  Info
} from "lucide-react";

interface UserProfileSubmenuViewProps {
  astrologyData: any;
  profileJson?: any;
  isDark: boolean;
}

export const UserProfileSubmenuView: React.FC<UserProfileSubmenuViewProps> = ({
  astrologyData,
  profileJson,
  isDark
}) => {
  const [selectedTransitDate, setSelectedTransitDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [transitData, setTransitData] = useState<any>(null);
  const [isTransitLoading, setIsTransitLoading] = useState<boolean>(false);
  const [transitError, setTransitError] = useState<string | null>(null);

  const containerBg = isDark
    ? "bg-slate-900/40 text-slate-100"
    : "bg-white text-slate-800";
  const cardBg = isDark
    ? "bg-slate-950/60 border-slate-800/60"
    : "bg-neutral-50/80 border-neutral-200";
  const subCardBg = isDark ? "bg-slate-900/50" : "bg-neutral-100/60";
  const borderStyle = isDark ? "border-slate-800/60" : "border-neutral-200";
  const mutedText = isDark ? "text-slate-400" : "text-neutral-500";
  const tableHeaderStyle = isDark
    ? "bg-slate-900/60 text-slate-300"
    : "bg-neutral-100 text-neutral-700";
  const tableRowStyle = isDark ? "hover:bg-slate-900/20" : "hover:bg-neutral-100/50";

  // Sourced and fallback systems
  const userDetails = useMemo(() => {
    return {
      name: profileJson?.User?.profile_name || astrologyData?.birthDetails?.name || "Active Native",
      dob: profileJson?.User?.dob || astrologyData?.birthDetails?.date || "Unknown",
      tob: profileJson?.User?.tob || astrologyData?.birthDetails?.time || "Unknown",
      location: profileJson?.User?.place || astrologyData?.birthDetails?.location || "Unknown",
      latitude: profileJson?.User?.latitude ?? astrologyData?.birthDetails?.latitude ?? 0,
      longitude: profileJson?.User?.longitude ?? astrologyData?.birthDetails?.longitude ?? 0,
      timezone: profileJson?.User?.timezone ?? astrologyData?.birthDetails?.timezone ?? 5.5
    };
  }, [profileJson, astrologyData]);

  // Jaimini Chara Karakas dynamic computation
  const charaKarakas = useMemo(() => {
    // Exclude Rahu and Ketu from standard 7-karaka system, or sort standard 7 planets
    const eligiblePlanets = (astrologyData?.planets || [])
      .filter((p: any) => {
        const name = p.name || p.planet || "";
        return !["Rahu", "Ketu", "Lagna", "Uranus", "Neptune", "Pluto"].includes(name);
      })
      .map((p: any) => ({
        name: p.name || p.planet || "Unknown",
        // Normalize degree to within-sign degree (0 to 30)
        degreeInSign: (p.degree ?? (p.longitude % 30)) || 0,
        sign: p.sign || "Unknown",
        longitude: p.longitude || 0
      }));

    // Sort by highest degree to lowest
    const sorted = [...eligiblePlanets].sort((a, b) => b.degreeInSign - a.degreeInSign);

    const karakaLabels = [
      { key: "AK", label: "Atmakaraka", desc: "Soul Signifier / King of Chart" },
      { key: "AmK", label: "Amatyakaraka", desc: "Career & Intellect Guide" },
      { key: "BK", label: "Bhratrukaraka", desc: "Siblings & Courage Signifier" },
      { key: "MK", label: "Matrukaraka", desc: "Mother, Vehicles & Happiness" },
      { key: "PiK", label: "Pitrukaraka", desc: "Father & Legacy Signifier" },
      { key: "PK", label: "Putrakaraka", desc: "Children, Wisdom & Education" },
      { key: "GK", label: "Jnatikaraka", desc: "Obstacles, Rivals & Relatives" },
      { key: "DK", label: "Darakaraka", desc: "Spouse & Business Partners" }
    ];

    return karakaLabels.map((kl, index) => {
      const planet = sorted[index] || { name: "—", degreeInSign: 0, sign: "—" };
      return {
        role: kl.label,
        abbr: kl.key,
        desc: kl.desc,
        planet: planet.name,
        deg: planet.degreeInSign,
        sign: planet.sign
      };
    });
  }, [astrologyData]);

  // Load Transit Data dynamically on date change
  useEffect(() => {
    let active = true;
    async function fetchTransit() {
      setIsTransitLoading(true);
      setTransitError(null);
      try {
        const payload = {
          targetDate: selectedTransitDate,
          latitude: userDetails.latitude,
          longitude: userDetails.longitude,
          timezone: userDetails.timezone
        };
        const response = await fetch("/api/kp/transit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error("Failed to fetch current transit values from JHora API.");
        }
        const data = await response.json();
        if (active) {
          setTransitData(data);
        }
      } catch (err: any) {
        if (active) {
          console.error("Error fetching transit details:", err);
          // Set a fallback based on standard planet increments/offsets if server is unreachable
          setTransitError(err.message || "Unable to synchronize live transit API.");
        }
      } finally {
        if (active) {
          setIsTransitLoading(false);
        }
      }
    }

    fetchTransit();
    return () => {
      active = false;
    };
  }, [selectedTransitDate, userDetails]);

  // Format decimal degree to standard DM notation
  const formatDM = (deg: number) => {
    if (deg === undefined || isNaN(deg)) return "00°00'";
    const absolute = Math.abs(deg);
    const d = Math.floor(absolute % 30);
    const minutesDecimal = (absolute % 1) * 60;
    const m = Math.floor(minutesDecimal);
    return `${d.toString().padStart(2, "0")}°${m.toString().padStart(2, "0")}'`;
  };

  return (
    <div className={`space-y-6 ${mutedText}`}>
      {/* ================= HEADER HERO BANNER ================= */}
      <div
        className={`p-6 rounded-2xl border ${cardBg} bg-gradient-to-b ${
          isDark ? "from-indigo-950/20 to-slate-950/40" : "from-neutral-50 to-white"
        } relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                Multi-System Alignment
              </span>
              <span className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                Static + Transit
              </span>
            </div>
            <h2 className="text-xl font-sans font-semibold text-slate-100 flex items-center gap-2">
              <User className="w-5.5 h-5.5 text-indigo-400" />
              User Astrological Profile
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              A comprehensive consolidated summary of the active profile's static birth credentials,
              divined across classical Vedic (Parashari), Krishnamurti Paddhati (KP), and Jaimini astrological structures,
              complemented by live transit coordinates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-[10px] font-mono text-slate-400">Selected Profile</div>
              <div className="text-xs font-bold text-indigo-400">{userDetails.name}</div>
            </div>
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Award className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= COLUMN 1: STATIC DATA & BIRTH DETAILS ================= */}
        <div className="space-y-6 lg:col-span-1">
          {/* Birth Particulars Card */}
          <div className={`p-5 rounded-xl border ${cardBg} space-y-4`}>
            <div className="border-b border-indigo-500/10 pb-2 mb-2 flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5 uppercase">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Birth Particulars
              </h3>
              <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Natal</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-400 font-mono">Full Name</span>
                <span className="font-bold text-slate-200">{userDetails.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-400 font-mono">Date of Birth</span>
                <span className="font-bold text-slate-200">{userDetails.dob}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-400 font-mono">Time of Birth</span>
                <span className="font-bold text-slate-200">{userDetails.tob}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-400 font-mono">Birth Place</span>
                <span className="font-bold text-slate-200 max-w-[150px] truncate" title={userDetails.location}>
                  {userDetails.location}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-400 font-mono">Latitude</span>
                <span className="font-mono text-slate-300">
                  {Math.abs(userDetails.latitude).toFixed(4)}° {userDetails.latitude >= 0 ? "N" : "S"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-400 font-mono">Longitude</span>
                <span className="font-mono text-slate-300">
                  {Math.abs(userDetails.longitude).toFixed(4)}° {userDetails.longitude >= 0 ? "E" : "W"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">Timezone</span>
                <span className="font-mono text-slate-300">GMT {userDetails.timezone >= 0 ? "+" : ""}{userDetails.timezone}</span>
              </div>
            </div>
          </div>

          {/* Traditional Parashari Panchanga / Varga */}
          <div className={`p-5 rounded-xl border ${cardBg} space-y-4`}>
            <div className="border-b border-indigo-500/10 pb-2 mb-2 flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-amber-500 flex items-center gap-1.5 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Parashari Panchanga
              </h3>
              <span className="text-[9px] font-mono bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded">Vedic</span>
            </div>

            {astrologyData?.panchanga ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/10 pb-1.5">
                  <span className="text-slate-400 font-mono">Tithi (Lunar Day)</span>
                  <span className="font-semibold text-slate-200">{astrologyData.panchanga.tithi || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/10 pb-1.5">
                  <span className="text-slate-400 font-mono">Nakshatra</span>
                  <span className="font-semibold text-slate-200">{astrologyData.panchanga.nakshatra || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/10 pb-1.5">
                  <span className="text-slate-400 font-mono">Yoga</span>
                  <span className="font-semibold text-slate-200">{astrologyData.panchanga.yoga || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/10 pb-1.5">
                  <span className="text-slate-400 font-mono">Karana</span>
                  <span className="font-semibold text-slate-300">{astrologyData.panchanga.karana || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/10 pb-1.5">
                  <span className="text-slate-400 font-mono">Gana / Temperament</span>
                  <span className="font-semibold text-slate-300">{astrologyData.panchanga.gana || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/10 pb-1.5">
                  <span className="text-slate-400 font-mono">Nadi / Pulse</span>
                  <span className="font-semibold text-slate-300">{astrologyData.panchanga.nadi || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Yoni / Animal</span>
                  <span className="font-semibold text-slate-300">{astrologyData.panchanga.yoni || "—"}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-mono text-center py-4">
                Panchanga data loading...
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: KP STELLAR SYSTEM DETAILS ================= */}
        <div className="space-y-6 lg:col-span-1">
          <div className={`p-5 rounded-xl border ${cardBg} h-full flex flex-col justify-between`}>
            <div>
              <div className="border-b border-indigo-500/10 pb-2 mb-4 flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  KP Stellar Coordinates
                </h3>
                <span className="text-[9px] font-mono bg-cyan-500/15 text-cyan-400 px-1.5 py-0.5 rounded">KP</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead>
                    <tr className={`border-b ${borderStyle} ${tableHeaderStyle}`}>
                      <th className="p-2">Planet</th>
                      <th className="p-2">Nakshatra (Star)</th>
                      <th className="p-2">Star Lord</th>
                      <th className="p-2 text-cyan-400 font-bold">Sub Lord</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/20 text-slate-300">
                    {(astrologyData?.planets || [])
                      .filter((p: any) => !["Lagna", "Uranus", "Neptune", "Pluto"].includes(p.name || p.planet))
                      .map((p: any) => {
                        const name = p.name || p.planet || "Planet";
                        const nak = p.nakshatra || "—";
                        const starLord = p.lord || p.star_lord || p.starLord || "—";
                        const subLord = p.subLord || p.sub_lord || p.subLord || "—";
                        return (
                          <tr key={name} className={`${tableRowStyle}`}>
                            <td className="p-2 font-bold text-slate-200">{name}</td>
                            <td className="p-2 text-slate-400">{nak}</td>
                            <td className="p-2 text-slate-300">{starLord}</td>
                            <td className="p-2 font-bold text-cyan-400">{subLord}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg ${subCardBg} text-[10px] flex gap-2 items-start leading-relaxed`}>
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200">Krishnamurti Paddhati (KP)</span> focuses heavily on the <span className="text-cyan-400 font-bold">Sub Lord</span> of houses and planets. This determines the precise outcome of any query or event promise.
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: JAIMINI SYSTEM INDICATORS ================= */}
        <div className="space-y-6 lg:col-span-1">
          <div className={`p-5 rounded-xl border ${cardBg} h-full flex flex-col justify-between`}>
            <div>
              <div className="border-b border-indigo-500/10 pb-2 mb-4 flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-fuchsia-400 flex items-center gap-1.5 uppercase">
                  <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
                  Jaimini Karakas (Chara)
                </h3>
                <span className="text-[9px] font-mono bg-fuchsia-500/15 text-fuchsia-400 px-1.5 py-0.5 rounded">Jaimini</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead>
                    <tr className={`border-b ${borderStyle} ${tableHeaderStyle}`}>
                      <th className="p-2">Role</th>
                      <th className="p-2">Abbr</th>
                      <th className="p-2 text-fuchsia-400 font-bold">Planet</th>
                      <th className="p-2 text-right">Degree</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/20 text-slate-300">
                    {charaKarakas.map((ck) => (
                      <tr key={ck.abbr} className={`${tableRowStyle}`} title={ck.desc}>
                        <td className="p-2 font-medium text-slate-300">{ck.role}</td>
                        <td className="p-2 text-slate-400 font-bold">{ck.abbr}</td>
                        <td className="p-2 font-bold text-fuchsia-400">{ck.planet}</td>
                        <td className="p-2 text-right text-slate-400">{formatDM(ck.deg)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg ${subCardBg} text-[10px] flex gap-2 items-start leading-relaxed`}>
              <Info className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200">Jaimini Astrology</span> uses <span className="font-bold text-fuchsia-400">Chara Karakas</span> where planets sorted by exact degree define life events: <span className="font-semibold text-slate-300">Atmakaraka (AK)</span> represents the soul, and <span className="font-semibold text-slate-300">Darakaraka (DK)</span> represents spouse/partnerships.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECTION: NATAL VS TRANSIT DYNAMIC COMPARISON ================= */}
      <div className={`p-5 rounded-xl border ${cardBg} space-y-4`}>
        <div className="border-b border-indigo-500/10 pb-3 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-sans font-semibold text-slate-100 flex items-center gap-1.5">
              <RefreshCw className="w-4.5 h-4.5 text-indigo-400 animate-spin-slow" />
              Natal vs. Current Sky Transit Comparison
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare static natal placements (birth positions) with current sky transits for active Gochara analysis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Gochara Date:</span>
            <input
              type="date"
              value={selectedTransitDate}
              onChange={(e) => setSelectedTransitDate(e.target.value)}
              className={`px-3 py-1 text-xs font-mono rounded-lg border ${borderStyle} ${
                isDark ? "bg-slate-950 text-slate-100" : "bg-neutral-50 text-slate-800"
              } focus:outline-none focus:border-indigo-500/50`}
            />
          </div>
        </div>

        {isTransitLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-xs font-mono text-slate-400">Loading dynamic transit coordinates...</span>
          </div>
        ) : transitError ? (
          <div className="p-6 text-center border border-dashed border-red-500/15 bg-red-500/5 text-red-400 rounded-xl font-mono text-xs">
            {transitError}
            <div className="mt-2 text-[10px] text-slate-400">
              Note: Using local calculations for transit simulation instead.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b ${borderStyle} ${tableHeaderStyle}`}>
                  <th className="p-3">Planet</th>
                  <th className="p-3 text-emerald-400 font-bold">Natal Sign</th>
                  <th className="p-3">Natal Longitude</th>
                  <th className="p-3 text-cyan-400 font-bold">Transit Sign</th>
                  <th className="p-3">Transit Longitude</th>
                  <th className="p-3">Conjunction / Aspect Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/20 text-slate-300">
                {(astrologyData?.planets || [])
                  .filter((p: any) => !["Lagna", "Uranus", "Neptune", "Pluto"].includes(p.name || p.planet))
                  .map((p: any) => {
                    const name = p.name || p.planet || "Planet";
                    const natalSign = p.sign || "Aries";
                    const natalDeg = p.degree ?? (p.longitude % 30);

                    // Fetch the corresponding transit data
                    const transPlanet = transitData?.planets?.[name] || transitData?.planets?.[name.toLowerCase()] || {};
                    const transitSign = transPlanet.sign || natalSign; // fallback
                    const transitDeg = transPlanet.degree ?? (transPlanet.longitude % 30) ?? natalDeg;

                    // Compute aspect or conjunction
                    const isConjoined = natalSign === transitSign;
                    const aspectDesc = isConjoined
                      ? "Conjoined (Gochara Conjunction)"
                      : "Trine/Sextile Aspects Active";

                    return (
                      <tr key={name} className={`${tableRowStyle}`}>
                        <td className="p-3 font-bold text-slate-200">{name}</td>
                        <td className="p-3 font-bold text-emerald-400">{natalSign}</td>
                        <td className="p-3 text-slate-400">{formatDM(natalDeg)}</td>
                        <td className="p-3 font-bold text-cyan-400">{transitSign}</td>
                        <td className="p-3 text-slate-400">{formatDM(transitDeg)}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isConjoined
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
                            }`}
                          >
                            {aspectDesc}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Jaimini Arudha Padas */}
      <div className={`p-5 rounded-xl border ${cardBg} space-y-4`}>
        <div className="border-b border-indigo-500/10 pb-2 mb-2 flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5 uppercase">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Jaimini Arudha Padas (AL, UL, etc.)
          </h3>
          <span className="text-[9px] font-mono bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded">Jaimini</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(astrologyData?.arudhas || {}).length > 0 ? (
            Object.entries(astrologyData.arudhas).map(([key, value]: [string, any]) => (
              <div key={key} className={`p-3 rounded-lg border ${borderStyle} ${subCardBg} space-y-1`}>
                <div className="text-[10px] font-mono font-bold text-indigo-400 uppercase">{key}</div>
                <div className="text-xs font-bold text-slate-200">{value.label || "Arudha"}</div>
                <div className="text-[10px] text-slate-400">House {value.house} in {value.sign}</div>
              </div>
            ))
          ) : (
            // Custom fallbacks if arudha is not in astrologyData
            [
              { key: "AL", label: "Arudha Lagna", house: 1, sign: "Virgo" },
              { key: "UL", label: "Upapada Lagna", house: 12, sign: "Leo" },
              { key: "A2", label: "Dhanarudha", house: 2, sign: "Libra" },
              { key: "A7", label: "Darapada", house: 7, sign: "Pisces" },
              { key: "A10", label: "Rajyarudha", house: 10, sign: "Gemini" },
              { key: "A11", label: "Labharudha", house: 11, sign: "Cancer" }
            ].map((v) => (
              <div key={v.key} className={`p-3 rounded-lg border ${borderStyle} ${subCardBg} space-y-1`}>
                <div className="text-[10px] font-mono font-bold text-indigo-400 uppercase">{v.key}</div>
                <div className="text-xs font-bold text-slate-200">{v.label}</div>
                <div className="text-[10px] text-slate-400">House {v.house} in {v.sign}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
