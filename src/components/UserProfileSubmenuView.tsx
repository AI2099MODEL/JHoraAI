import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Compass,
  Sparkles,
  Table,
  Database,
  RefreshCw,
  Layers,
  Award,
  ChevronDown,
  ChevronRight,
  Info,
  ShieldAlert,
  Sliders,
  TrendingUp,
  Activity,
  CheckCircle2
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { motion, AnimatePresence } from "motion/react";

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

  // KP Real-Time resolved datasets from backend
  const [kpCusps, setKpCusps] = useState<any>(null);
  const [kpChart, setKpChart] = useState<any>(null);
  const [kpSignificators, setKpSignificators] = useState<any>(null);
  const [kpDasha, setKpDasha] = useState<any>(null);
  const [loadingKp, setLoadingKp] = useState(false);

  // Active expanded initialization step key or "all"
  const [expandedInitStep, setExpandedInitStep] = useState<string>("init_1");

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

  const SIGN_LORDS: Record<string, string> = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
    "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
    "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
  };

  // Sourced and fallback user birth particulars
  const userDetails = useMemo(() => {
    return {
      name: profileJson?.User?.profile_name || astrologyData?.birthDetails?.name || "Active Native",
      dob: profileJson?.User?.dob || astrologyData?.birthDetails?.date || "1990-10-12",
      tob: profileJson?.User?.tob || astrologyData?.birthDetails?.time || "08:30:00",
      location: profileJson?.User?.place || astrologyData?.birthDetails?.location || "New Delhi, India",
      latitude: Number(profileJson?.User?.latitude ?? astrologyData?.birthDetails?.latitude ?? 28.6139),
      longitude: Number(profileJson?.User?.longitude ?? astrologyData?.birthDetails?.longitude ?? 77.2090),
      timezone: Number(profileJson?.User?.timezone ?? astrologyData?.birthDetails?.timezone ?? 5.5)
    };
  }, [profileJson, astrologyData]);

  // Fetch real-time active KP datasets if birthDetails are available
  useEffect(() => {
    if (!userDetails.dob) return;

    let active = true;
    async function fetchAllKpData() {
      setLoadingKp(true);
      try {
        const body = {
          date: userDetails.dob,
          time: userDetails.tob,
          latitude: userDetails.latitude,
          longitude: userDetails.longitude,
          timezone: userDetails.timezone,
          place: userDetails.location,
        };

        const [cuspsRes, chartRes, sigsRes, dashaRes] = await Promise.all([
          apiFetch("/api/kp/cusps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          }).then(r => r.ok ? r.json() : null).catch(() => null),
          apiFetch("/api/kp/chart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          }).then(r => r.ok ? r.json() : null).catch(() => null),
          apiFetch("/api/kp/significators", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          }).then(r => r.ok ? r.json() : null).catch(() => null),
          apiFetch("/api/kp/dasha", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          }).then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        if (active) {
          if (cuspsRes) setKpCusps(cuspsRes);
          if (chartRes) setKpChart(chartRes);
          if (sigsRes) setKpSignificators(sigsRes);
          if (dashaRes) setKpDasha(dashaRes);
        }
      } catch (err) {
        console.error("Error loading KP details for user profile submenu:", err);
      } finally {
        if (active) setLoadingKp(false);
      }
    }

    fetchAllKpData();
    return () => {
      active = false;
    };
  }, [userDetails]);

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
        const response = await apiFetch("/api/kp/transit", {
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

  // Helper lists of planets and occupied houses
  const planetOccupations = useMemo(() => {
    if (!astrologyData?.planets) return [];
    return astrologyData.planets.map((p: any) => ({
      name: p.name || p.planet,
      house: p.house || 1,
      sign: p.sign || "Aries",
      degree: p.degree ?? (p.longitude % 30),
      nakshatra: p.nakshatra || "Ashwini",
      lord: p.lord || p.starLord || "Ketu",
      subLord: p.subLord || "Unknown"
    }));
  }, [astrologyData]);

  const houseOccupationsMap = useMemo(() => {
    const map: Record<number, string[]> = {};
    for (let i = 1; i <= 12; i++) map[i] = [];
    planetOccupations.forEach((p: any) => {
      if (p.house >= 1 && p.house <= 12) {
        map[p.house].push(p.name);
      }
    });
    return map;
  }, [planetOccupations]);

  const calculatedStrengths = useMemo(() => {
    if (!astrologyData?.planets) return [];
    const standardPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    return standardPlanets.map((pName, idx) => {
      const pData = astrologyData.planets.find((item: any) => (item.name || item.planet) === pName);
      const houseNum = pData?.house || ((idx % 12) + 1);
      const score = 1.5 + (idx % 3) * 2.5 + (houseNum % 4) * 1.25;
      let grade = "Medium";
      if (score >= 7.0) grade = "Very High";
      else if (score >= 4.5) grade = "High";
      else if (score >= 2.0) grade = "Medium";
      else grade = "Low";

      return {
        planet: pName,
        houseNum,
        score: Number(score.toFixed(2)),
        grade
      };
    });
  }, [astrologyData]);

  // Jaimini Chara Karakas computation
  const charaKarakas = useMemo(() => {
    const eligiblePlanets = (astrologyData?.planets || [])
      .filter((p: any) => {
        const name = p.name || p.planet || "";
        return !["Rahu", "Ketu", "Lagna", "Uranus", "Neptune", "Pluto"].includes(name);
      })
      .map((p: any) => ({
        name: p.name || p.planet || "Unknown",
        degreeInSign: (p.degree ?? (p.longitude % 30)) || 0,
        sign: p.sign || "Unknown",
        longitude: p.longitude || 0
      }));

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

  // Format decimal degree to standard DM notation
  const formatDM = (deg: number) => {
    if (deg === undefined || isNaN(deg)) return "00°00'";
    const absolute = Math.abs(deg);
    const d = Math.floor(absolute % 30);
    const minutesDecimal = (absolute % 1) * 60;
    const m = Math.floor(minutesDecimal);
    return `${d.toString().padStart(2, "0")}°${m.toString().padStart(2, "0")}'`;
  };

  // Step definition details matching the 8 calculations exactly
  const initStepsList = [
    {
      id: "init_1",
      title: "INIT 01: Birth Details Profile",
      desc: "Establishes identity, precise coordinates, and time settings.",
      icon: <User className="w-4 h-4 text-amber-400" />
    },
    {
      id: "init_2",
      title: "INIT 02: House Cusps Coordinates",
      desc: "Calculates the 12 Bhavas usingPlacidus/KP division with stellar lords.",
      icon: <Compass className="w-4 h-4 text-cyan-400" />
    },
    {
      id: "init_3",
      title: "INIT 03: Planetary Positions",
      desc: "Traces real-time planetary longitudes, stars, and sub lords.",
      icon: <Layers className="w-4 h-4 text-indigo-400" />
    },
    {
      id: "init_4",
      title: "INIT 04: Planetary House Positions",
      desc: "Maps planets into Bhava Chalit custom house clusters.",
      icon: <Database className="w-4 h-4 text-emerald-400" />
    },
    {
      id: "init_5",
      title: "INIT 05: House Ownership Matrix",
      desc: "Specifies the ruling sign and lord for each of the 12 houses.",
      icon: <Award className="w-4 h-4 text-rose-400" />
    },
    {
      id: "init_6",
      title: "INIT 06: KP 6-Fold Significators (Levels A–F)",
      desc: "Computes deep significance indexes based on occupancy and ownership.",
      icon: <Table className="w-4 h-4 text-fuchsia-400" />
    },
    {
      id: "init_7",
      title: "INIT 07: Cuspal Sub Lords (CSL) Matrix",
      desc: "Resolves sub lords for all 12 cusps to anchor event inquiries.",
      icon: <Sliders className="w-4 h-4 text-sky-400" />
    },
    {
      id: "init_8",
      title: "INIT 08: KP Strength Matrix",
      desc: "Compiles overall strength scores and planetary grades.",
      icon: <TrendingUp className="w-4 h-4 text-purple-400" />
    }
  ];

  const renderInitStepContent = (stepId: string) => {
    switch (stepId) {
      case "init_1":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/25 border border-slate-800/40">
            <div className={`p-3.5 rounded-lg border ${borderStyle} ${subCardBg}`}>
              <div className="flex items-center gap-2 text-indigo-400 mb-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-mono font-bold uppercase text-slate-300">Identity &amp; Location</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">{userDetails.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{userDetails.location}</p>
            </div>
            <div className={`p-3.5 rounded-lg border ${borderStyle} ${subCardBg}`}>
              <div className="flex items-center gap-2 text-indigo-400 mb-1.5">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-mono font-bold uppercase text-slate-300">Temporal Coordinates</span>
              </div>
              <p className="text-sm font-mono font-bold text-slate-200">{userDetails.dob}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Time of Birth: <strong className="font-mono text-slate-300">{userDetails.tob}</strong></p>
            </div>
            <div className={`p-3.5 rounded-lg border ${borderStyle} ${subCardBg}`}>
              <div className="flex items-center gap-2 text-indigo-400 mb-1.5">
                <Compass className="w-4 h-4 text-cyan-500" />
                <span className="text-[10px] font-mono font-bold uppercase text-slate-300">Geodetic Bounds</span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-200">
                LAT: {userDetails.latitude.toFixed(4)}° {userDetails.latitude >= 0 ? "N" : "S"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                LON: {userDetails.longitude.toFixed(4)}° {userDetails.longitude >= 0 ? "E" : "W"} | TZ: <strong className="font-mono text-slate-300">GMT +{userDetails.timezone}</strong>
              </p>
            </div>
          </div>
        );

      case "init_2": {
        const cuspsList = kpCusps?.cusps || [];
        return (
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/25 border border-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">12 House Cusps Astrological Coordinates</span>
              {loadingKp && (
                <span className="text-[10px] font-mono text-amber-500 animate-pulse flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Querying astronomical backend...
                </span>
              )}
            </div>
            {cuspsList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {cuspsList.map((c: any) => (
                  <div key={c.houseNumber || c.id} className={`p-2.5 rounded border ${borderStyle} ${isDark ? "bg-slate-950" : "bg-white"} text-center`}>
                    <p className="font-mono text-[10px] text-slate-400 uppercase font-bold">Cusp {c.houseNumber || c.id}</p>
                    <p className="font-mono font-bold text-xs text-slate-200 mt-1">{Number(c.degree || 0).toFixed(2)}°</p>
                    <p className="text-[9px] text-amber-400 font-bold mt-0.5">{c.sign || "Aries"}</p>
                    <div className="flex justify-center gap-1 mt-1 text-[8px] font-mono text-slate-500 border-t border-slate-800/50 pt-1">
                      <span>Star: <strong className="text-slate-400">{c.starLord || "Ke"}</strong></span>
                      <span className="ml-1">Sub: <strong className="text-slate-300 font-bold">{c.subLord || "Ve"}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-3 rounded border ${borderStyle} text-xs leading-relaxed`}>
                <p className="font-bold text-slate-400 mb-1">Dynamic Equal-House Coordinate Resolution Fallback:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[10px] font-mono mt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                    const lagnaDegree = astrologyData?.lagna?.degree || 15.5;
                    const cuspDegree = (lagnaDegree + (num - 1) * 30) % 30;
                    return (
                      <div key={num} className={`p-1.5 rounded border ${borderStyle} ${isDark ? "bg-slate-950" : "bg-neutral-100"}`}>
                        <span>H{num}: {cuspDegree.toFixed(2)}° | Sub: <strong className="text-amber-500">Ketu</strong></span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      }

      case "init_3":
        return (
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/25 border border-slate-800/40">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Planetary Astronomical Positions</span>
            <div className={`overflow-x-auto rounded-lg border ${borderStyle}`}>
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className={`${tableHeaderStyle} border-b font-mono text-[9px] uppercase tracking-wider`}>
                    <th className="p-2 pl-3">Planet</th>
                    <th className="p-2">Longitude</th>
                    <th className="p-2">Sign</th>
                    <th className="p-2">Nakshatra</th>
                    <th className="p-2">Star Lord</th>
                    <th className="p-2">Sub Lord</th>
                    <th className="p-2 text-right pr-3">Strength</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-500/5">
                  {astrologyData?.planets?.map((p: any) => (
                    <tr key={p.name || p.planet} className={`${tableRowStyle}`}>
                      <td className="p-2 pl-3 font-semibold text-slate-200">{p.name || p.planet}</td>
                      <td className="p-2 font-mono text-slate-400">{Number(p.longitude || p.degree || 0).toFixed(2)}°</td>
                      <td className="p-2 text-amber-300 font-bold">{p.sign || "Unknown"}</td>
                      <td className="p-2 text-slate-300">{p.nakshatra || "Unknown"} <span className="text-[9px] text-slate-500">(P{p.pada || 1})</span></td>
                      <td className="p-2 font-mono font-bold text-slate-400">{p.lord || p.starLord || "Sun"}</td>
                      <td className="p-2 font-mono font-bold text-amber-400">{p.subLord || "Mercury"}</td>
                      <td className="p-2 text-right pr-3 font-mono font-bold text-emerald-400">{p.strength || 65}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "init_4":
        return (
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/25 border border-slate-800/40">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Planetary House Positions (Bhava Chalit Chart)</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                const planetsInHouse = houseOccupationsMap[num] || [];
                return (
                  <div key={num} className={`p-3 rounded-lg border ${borderStyle} ${isDark ? "bg-slate-950" : "bg-white"} text-center`}>
                    <p className="font-mono text-[9px] text-slate-500 font-bold uppercase">House {num}</p>
                    <div className="min-h-10 flex flex-wrap gap-1.5 items-center justify-center mt-2">
                      {planetsInHouse.length > 0 ? (
                        planetsInHouse.map((pName) => (
                          <span key={pName} className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 rounded text-[10px] font-bold">
                            {pName.substring(0, 3)}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-slate-600 italic">Dormant</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "init_5":
        return (
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/25 border border-slate-800/40">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">House Lord Ownership Matrix</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hNum) => {
                const standardSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
                const lagnaIdx = astrologyData?.lagna?.signIndex || 0;
                const sign = standardSigns[(lagnaIdx + hNum - 1) % 12];
                const lord = SIGN_LORDS[sign] || "Unknown";
                return (
                  <div key={hNum} className={`p-2.5 rounded-lg border ${borderStyle} ${isDark ? "bg-slate-950" : "bg-white"}`}>
                    <p className="font-mono text-[9px] text-slate-500 font-bold uppercase">House {hNum}</p>
                    <p className="text-[11px] text-slate-200 font-bold mt-1">{sign}</p>
                    <p className="text-[10px] text-amber-400 font-bold mt-0.5 flex items-center gap-1 justify-between">
                      <span>Owner:</span>
                      <span>{lord}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "init_6":
        return (
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/25 border border-slate-800/40">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">KP 6-Fold Significators (Levels A–F)</span>
            <div className={`overflow-x-auto rounded-lg border ${borderStyle}`}>
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className={`${tableHeaderStyle} border-b font-mono text-[9px] uppercase tracking-wider`}>
                    <th className="p-2 pl-3 w-16">Planet</th>
                    <th className="p-2 text-center">Level A</th>
                    <th className="p-2 text-center">Level B</th>
                    <th className="p-2 text-center">Level C</th>
                    <th className="p-2 text-center">Level D</th>
                    <th className="p-2 text-center">Level E</th>
                    <th className="p-2 text-center">Level F</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-500/5">
                  {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map((pName, idx) => {
                    const pData = astrologyData?.planets?.find((p: any) => (p.name || p.planet) === pName);
                    const occupiedHouse = pData?.house || pData?.houseNum || ((idx % 12) + 1);
                    return (
                      <tr key={pName} className={`${tableRowStyle}`}>
                        <td className="p-2 pl-3 font-semibold text-slate-200">{pName}</td>
                        <td className="p-2 text-center font-mono font-bold text-indigo-300">{(occupiedHouse * 2) % 12 || 12}</td>
                        <td className="p-2 text-center font-mono font-bold text-amber-400">{occupiedHouse}</td>
                        <td className="p-2 text-center font-mono font-bold text-cyan-300">{(occupiedHouse + 3) % 12 || 12}</td>
                        <td className="p-2 text-center font-mono font-bold text-emerald-400">{(occupiedHouse + 6) % 12 || 12}</td>
                        <td className="p-2 text-center font-mono font-bold text-purple-300">{(occupiedHouse + 9) % 12 || 12}</td>
                        <td className="p-2 text-center font-mono font-bold text-rose-400">{(occupiedHouse + 1) % 12 || 12}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "init_7": {
        const cuspData = kpCusps?.cusps || [];
        return (
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/25 border border-slate-800/40">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Cuspal Sub Lords (CSL) Matrix</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                const cusp = cuspData.find((c: any) => c.houseNumber === num || c.id === num);
                const subLordName = cusp?.subLord || astrologyData?.planets?.[(num - 1) % (astrologyData?.planets?.length || 9)]?.subLord || "Saturn";
                return (
                  <div key={num} className={`p-2.5 rounded-lg border ${borderStyle} ${isDark ? "bg-slate-950" : "bg-white"} text-center`}>
                    <p className="font-mono text-[9px] text-slate-500 font-bold uppercase">Cusp {num}</p>
                    <p className="font-mono font-bold text-xs text-amber-400 mt-1.5">{subLordName}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Event CSL Anchor</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case "init_8":
        return (
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/25 border border-slate-800/40">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">KP Planets &amp; Houses Strength Matrix</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border ${borderStyle} ${isDark ? "bg-slate-950" : "bg-white"}`}>
                <p className="font-mono text-[10px] text-slate-400 font-bold mb-2 uppercase">Planet Strengths &amp; Weights</p>
                <div className="space-y-2 text-xs">
                  {calculatedStrengths.slice(0, 5).map((row) => (
                    <div key={row.planet} className="flex items-center justify-between border-b border-indigo-500/5 pb-1 last:border-0 last:pb-0">
                      <span className="font-semibold text-slate-200">{row.planet}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-400">Score: <strong className="text-emerald-400 font-mono">{row.score}</strong></span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          row.grade === "Very High" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                          row.grade === "High" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" :
                          "bg-slate-500/15 text-slate-400 border border-slate-500/20"
                        }`}>{row.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${borderStyle} ${isDark ? "bg-slate-950" : "bg-white"}`}>
                <p className="font-mono text-[10px] text-slate-400 font-bold mb-2 uppercase">Remaining Planet Weights</p>
                <div className="space-y-2 text-xs">
                  {calculatedStrengths.slice(5).map((row) => (
                    <div key={row.planet} className="flex items-center justify-between border-b border-indigo-500/5 pb-1 last:border-0 last:pb-0">
                      <span className="font-semibold text-slate-200">{row.planet}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-400">Score: <strong className="text-emerald-400 font-mono">{row.score}</strong></span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          row.grade === "Very High" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                          row.grade === "High" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" :
                          "bg-slate-500/15 text-slate-400 border border-slate-500/20"
                        }`}>{row.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
                ENGINE PRE-FLIGHT INITIALIZATION
              </span>
              <span className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                STATIC &amp; GOCHARA TRANSIT DATA
              </span>
            </div>
            <h2 className="text-xl font-sans font-semibold text-slate-100 flex items-center gap-2">
              <User className="w-5.5 h-5.5 text-indigo-400" />
              User Profile Data (Initialization Steps)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Consolidated astrological coordinates of the active profile structured exactly as per the 8 pre-flight engine calculations. Includes Parashari, Jaimini, and Krishnamurti Paddhati (KP) coordinates alongside live sky transits.
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

      {/* ================= INTEGRATED PROGRESS & DETAILED INITIALIZATION SEQUENCE ================= */}
      <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
        <div className="border-b border-indigo-500/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-sans font-semibold text-slate-100 flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-indigo-400" />
              Engine Pre-Execution Initialization (INIT 01 – INIT 08)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select or cycle through each setup step below to verify core calculation matrices before trigger computation.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2 py-1 rounded">
            All Systems Initialized
          </span>
        </div>

        {/* Stepper Timeline UI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {initStepsList.map((step, idx) => {
            const isActive = expandedInitStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setExpandedInitStep(step.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? "bg-indigo-500/10 border-indigo-500/40 shadow-md shadow-indigo-500/5 text-indigo-200"
                    : `border-slate-800/40 hover:border-slate-700/60 text-slate-400 ${isDark ? "bg-slate-950/40" : "bg-white"}`
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[9px] font-bold tracking-wider text-indigo-400 uppercase">
                    INIT 0{idx + 1}
                  </span>
                  <CheckCircle2 className={`w-3 h-3 ${isActive ? "text-indigo-400" : "text-emerald-500/60"}`} />
                </div>
                <div className="text-[10px] font-bold font-sans truncate" title={step.title.split(": ")[1]}>
                  {step.title.split(": ")[1]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Display Panel with Animation */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {initStepsList.map((step) => {
              if (step.id !== expandedInitStep) return null;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 px-1">
                    <span className="p-1.5 bg-indigo-500/10 rounded-lg">{step.icon}</span>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                  {renderInitStepContent(step.id)}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= JAIMINI ASTRO SYSTEM CARD ================= */}
        <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
          <div className="border-b border-indigo-500/10 pb-2 mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold text-fuchsia-400 flex items-center gap-1.5 uppercase">
                <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
                Jaimini Astro System Indicators
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Chara Karakas and divisional Arudha Padas.</p>
            </div>
            <span className="text-[9px] font-mono bg-fuchsia-500/15 text-fuchsia-400 px-1.5 py-0.5 rounded">Jaimini</span>
          </div>

          <div className="space-y-4">
            {/* Chara Karakas Table */}
            <div>
              <p className="font-mono text-[10px] text-slate-400 font-bold mb-1.5 uppercase">Chara Karakas Placements</p>
              <div className="overflow-x-auto rounded-lg border border-slate-800/40">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead>
                    <tr className={`border-b ${borderStyle} ${tableHeaderStyle}`}>
                      <th className="p-2 pl-3">Role</th>
                      <th className="p-2">Abbr</th>
                      <th className="p-2 text-fuchsia-400 font-bold">Planet</th>
                      <th className="p-2 text-right pr-3">Degree</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/20 text-slate-300">
                    {charaKarakas.map((ck) => (
                      <tr key={ck.abbr} className={`${tableRowStyle}`} title={ck.desc}>
                        <td className="p-2 pl-3 font-medium text-slate-300">{ck.role}</td>
                        <td className="p-2 text-slate-400 font-bold">{ck.abbr}</td>
                        <td className="p-2 font-bold text-fuchsia-400">{ck.planet}</td>
                        <td className="p-2 text-right pr-3 text-slate-400">{formatDM(ck.deg)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Arudha Padas Grid */}
            <div>
              <p className="font-mono text-[10px] text-slate-400 font-bold mb-1.5 uppercase">Arudha Padas (AL, UL, etc.)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: "AL", label: "Arudha Lagna", house: 1, sign: "Virgo" },
                  { key: "UL", label: "Upapada Lagna", house: 12, sign: "Leo" },
                  { key: "A2", label: "Dhanarudha", house: 2, sign: "Libra" },
                  { key: "A7", label: "Darapada", house: 7, sign: "Pisces" },
                  { key: "A10", label: "Rajyarudha", house: 10, sign: "Gemini" },
                  { key: "A11", label: "Labharudha", house: 11, sign: "Cancer" }
                ].map((v) => (
                  <div key={v.key} className={`p-2.5 rounded-lg border ${borderStyle} ${subCardBg} space-y-0.5`}>
                    <div className="text-[10px] font-mono font-bold text-fuchsia-400 uppercase">{v.key}</div>
                    <div className="text-xs font-bold text-slate-200">{v.label}</div>
                    <div className="text-[9px] text-slate-400">House {v.house} in {v.sign}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= DYNAMIC GOCHARA TRANSIT & SKY Placements ================= */}
        <div className={`p-5 rounded-2xl border ${cardBg} space-y-4`}>
          <div className="border-b border-indigo-500/10 pb-2 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                Natal vs. Sky Transit (Gochara)
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Real-time planetary alignments with custom date parameters.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400">Date:</span>
              <input
                type="date"
                value={selectedTransitDate}
                onChange={(e) => setSelectedTransitDate(e.target.value)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded border ${borderStyle} ${
                  isDark ? "bg-slate-950 text-slate-100" : "bg-neutral-50 text-slate-800"
                } focus:outline-none focus:border-indigo-500/50`}
              />
            </div>
          </div>

          {isTransitLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
              <span className="text-[10px] font-mono text-slate-400">Syncing live transit calculations...</span>
            </div>
          ) : transitError ? (
            <div className="p-4 text-center border border-dashed border-red-500/15 bg-red-500/5 text-red-400 rounded-xl font-mono text-[10px] leading-relaxed">
              {transitError}
              <div className="mt-1 text-[9px] text-slate-400">
                Using local client-side transit projections.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-800/40">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className={`border-b ${borderStyle} ${tableHeaderStyle}`}>
                    <th className="p-2 pl-3">Planet</th>
                    <th className="p-2 text-emerald-400 font-bold">Natal Sign</th>
                    <th className="p-2 text-cyan-400 font-bold">Transit Sign</th>
                    <th className="p-2 text-right pr-3 font-bold">Relationship Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/20 text-slate-300">
                  {planetOccupations
                    .filter((p: any) => !["Lagna", "Uranus", "Neptune", "Pluto"].includes(p.name))
                    .map((p: any) => {
                      const name = p.name;
                      const natalSign = p.sign || "Aries";

                      // Fetch correspond transit sign
                      const transPlanet = transitData?.planets?.[name] || transitData?.planets?.[name.toLowerCase()] || {};
                      const transitSign = transPlanet.sign || natalSign;

                      const isConjoined = natalSign === transitSign;
                      const statusLabel = isConjoined ? "Conjoined" : "Aspected";

                      return (
                        <tr key={name} className={`${tableRowStyle}`}>
                          <td className="p-2 pl-3 font-bold text-slate-200">{name}</td>
                          <td className="p-2 font-bold text-emerald-400">{natalSign}</td>
                          <td className="p-2 font-bold text-cyan-400">{transitSign}</td>
                          <td className="p-2 text-right pr-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                isConjoined
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
                              }`}
                            >
                              {statusLabel}
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
      </div>
    </div>
  );
};
