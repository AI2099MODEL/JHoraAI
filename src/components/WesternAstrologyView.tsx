/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Activity, 
  Sparkles, 
  Users, 
  RefreshCw, 
  Heart, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  UserPlus, 
  Clock, 
  MapPin 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WesternPlanet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  isRetrograde: boolean;
  element: string;
  modality: string;
}

interface WesternCusp {
  number: number;
  sign: string;
  degree: number;
}

interface WesternAspect {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  orb: number;
}

interface WesternChartData {
  planets: WesternPlanet[];
  cusps: WesternCusp[];
  aspects: WesternAspect[];
  metadata: {
    birthDate: string;
    birthTime: string;
    location: string;
  };
}

interface WesternSynastryData {
  compatibilityScore: number;
  aspects: WesternAspect[];
  summary: string;
}

interface WesternAstrologyViewProps {
  nativeInputs: {
    name: string;
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    timezone: number;
    location: string;
  };
  isDark: boolean;
  activeSubmenuId?: string;
}

export const WesternAstrologyView: React.FC<WesternAstrologyViewProps> = ({ nativeInputs, isDark, activeSubmenuId }) => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [chartData, setChartData] = useState<WesternChartData | null>(null);
  const [synastryData, setSynastryData] = useState<WesternSynastryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ status: string; provider: string } | null>(null);

  // Partner inputs for Synastry
  const [partnerInputs, setPartnerInputs] = useState({
    name: "Partner",
    date: "1995-10-22",
    time: "15:45",
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: -5,
    location: "New York, USA"
  });

  // Transit target date
  const [transitDate, setTransitDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Solar Return target year
  const [solarReturnYear, setSolarReturnYear] = useState<number>(
    new Date().getFullYear()
  );

  const containerStyle = isDark 
    ? "bg-slate-900/60 border-slate-800 text-slate-200" 
    : "bg-white border-neutral-200 text-neutral-800";
  
  const cardStyle = isDark 
    ? "bg-slate-950/40 border-slate-900/60" 
    : "bg-neutral-50/50 border-neutral-200";

  const headingStyle = isDark ? "text-slate-100" : "text-neutral-900";

  // Fetch health check and default chart on load
  useEffect(() => {
    fetchHealth();
    fetchChart();
  }, [nativeInputs]);

  // Sync activeTab with activeSubmenuId when activeSubmenuId changes
  useEffect(() => {
    if (activeSubmenuId) {
      setActiveTab(activeSubmenuId);
    }
  }, [activeSubmenuId]);

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/western/health");
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
      }
    } catch (err) {
      console.error("Health check failed", err);
    }
  };

  const fetchChart = async (overrideParams?: any) => {
    setLoading(true);
    setError(null);
    try {
      const params = overrideParams || {
        date: nativeInputs.date,
        time: nativeInputs.time + ":00",
        latitude: nativeInputs.latitude,
        longitude: nativeInputs.longitude,
        timezone: nativeInputs.timezone,
        place: nativeInputs.location
      };

      const res = await fetch("/api/western/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });

      if (!res.ok) throw new Error("Failed to load Western chart data.");
      const data = await res.json();
      setChartData(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const calculateSynastry = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        date: nativeInputs.date,
        time: nativeInputs.time + ":00",
        latitude: nativeInputs.latitude,
        longitude: nativeInputs.longitude,
        timezone: nativeInputs.timezone,
        place: nativeInputs.location,
        partnerDate: partnerInputs.date,
        partnerTime: partnerInputs.time + ":00",
        partnerLatitude: partnerInputs.latitude,
        partnerLongitude: partnerInputs.longitude,
        partnerTimezone: partnerInputs.timezone,
        partnerPlace: partnerInputs.location
      };

      const res = await fetch("/api/western/synastry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });

      if (!res.ok) throw new Error("Failed to load synastry compatibility.");
      const data = await res.json();
      setSynastryData(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred calculating compatibility.");
    } finally {
      setLoading(false);
    }
  };

  const calculateSolarReturn = async () => {
    setLoading(true);
    setError(null);
    try {
      const targetDate = `${solarReturnYear}-${nativeInputs.date.substring(5)}`;
      const params = {
        date: nativeInputs.date,
        time: nativeInputs.time + ":00",
        latitude: nativeInputs.latitude,
        longitude: nativeInputs.longitude,
        timezone: nativeInputs.timezone,
        place: nativeInputs.location,
        targetDate
      };

      const res = await fetch("/api/western/solar-return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });

      if (!res.ok) throw new Error("Failed to load Solar Return.");
      const data = await res.json();
      setChartData(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred casting solar return.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTransits = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        date: nativeInputs.date,
        time: nativeInputs.time + ":00",
        latitude: nativeInputs.latitude,
        longitude: nativeInputs.longitude,
        timezone: nativeInputs.timezone,
        place: nativeInputs.location,
        targetDate: transitDate
      };

      const res = await fetch("/api/western/transits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });

      if (!res.ok) throw new Error("Failed to load active transits.");
      const data = await res.json();
      setChartData(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred loading transits.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to color codes for western elements
  const getElementColor = (el: string) => {
    switch (el?.toLowerCase()) {
      case "fire": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "water": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "air": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "earth": return "text-green-500 bg-green-500/10 border-green-500/20";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  // Render dynamic SVG chart wheel
  const renderChartWheel = () => {
    if (!chartData) return null;

    const size = 380;
    const center = size / 2;
    const r1 = 170; // Outer border
    const r2 = 140; // Inner boundary of signs ring
    const r3 = 100; // Houses ring boundary
    const r4 = 30;  // Center small circle

    const signs = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];

    const signColors = [
      "#ef4444", "#22c55e", "#eab308", "#3b82f6", 
      "#ef4444", "#22c55e", "#eab308", "#3b82f6",
      "#ef4444", "#22c55e", "#eab308", "#3b82f6"
    ];

    // Build sign wedges
    const signWedges = signs.map((sign, i) => {
      const startAngle = i * 30 - 90;
      const endAngle = (i + 1) * 30 - 90;

      const radStart = (startAngle * Math.PI) / 180;
      const radEnd = (endAngle * Math.PI) / 180;

      const x1_outer = center + r1 * Math.cos(radStart);
      const y1_outer = center + r1 * Math.sin(radStart);
      const x2_outer = center + r1 * Math.cos(radEnd);
      const y2_outer = center + r1 * Math.sin(radEnd);

      const x1_inner = center + r2 * Math.cos(radStart);
      const y1_inner = center + r2 * Math.sin(radStart);
      const x2_inner = center + r2 * Math.cos(radEnd);
      const y2_inner = center + r2 * Math.sin(radEnd);

      // Path
      const d = `
        M ${x1_inner} ${y1_inner}
        L ${x1_outer} ${y1_outer}
        A ${r1} ${r1} 0 0 1 ${x2_outer} ${y2_outer}
        L ${x2_inner} ${y2_inner}
        A ${r2} ${r2} 0 0 0 ${x1_inner} ${y1_inner}
        Z
      `;

      // Text mid placement
      const midAngle = startAngle + 15;
      const radMid = (midAngle * Math.PI) / 180;
      const tx = center + (r2 + 15) * Math.cos(radMid);
      const ty = center + (r2 + 15) * Math.sin(radMid);

      return (
        <g key={sign}>
          <path 
            d={d} 
            fill="none" 
            stroke={isDark ? "#334155" : "#cbd5e1"} 
            strokeWidth="1"
          />
          <text
            x={tx}
            y={ty}
            fill={signColors[i]}
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
          >
            {sign.substring(0, 3).toUpperCase()}
          </text>
        </g>
      );
    });

    // Build House Lines
    const houseLines = Array.from({ length: 12 }).map((_, i) => {
      const angle = i * 30 - 90;
      const rad = (angle * Math.PI) / 180;
      const x_outer = center + r2 * Math.cos(rad);
      const y_outer = center + r2 * Math.sin(rad);
      const x_inner = center + r4 * Math.cos(rad);
      const y_inner = center + r4 * Math.sin(rad);

      // Label positions
      const labelAngle = angle + 15;
      const labelRad = (labelAngle * Math.PI) / 180;
      const lx = center + (r3 - 15) * Math.cos(labelRad);
      const ly = center + (r3 - 15) * Math.sin(labelRad);

      return (
        <g key={`house-${i}`}>
          <line
            x1={x_inner}
            y1={y_inner}
            x2={x_outer}
            y2={y_outer}
            stroke={isDark ? "#475569" : "#94a3b8"}
            strokeWidth={i % 3 === 0 ? "1.5" : "0.5"}
            strokeDasharray={i % 3 === 0 ? "" : "3,3"}
          />
          <text
            x={lx}
            y={ly}
            fill={isDark ? "#64748b" : "#94a3b8"}
            fontSize="8"
            fontFamily="monospace"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {i + 1}
          </text>
        </g>
      );
    });

    // Plot planets
    const planetIcons: { [key: string]: string } = {
      Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
      Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇"
    };

    const planetElements = chartData.planets.map((p) => {
      // Find sign index
      const signIndex = signs.indexOf(p.sign);
      if (signIndex === -1) return null;

      const angle = signIndex * 30 + p.degree - 90;
      const rad = (angle * Math.PI) / 180;
      const px = center + (r3 + 12) * Math.cos(rad);
      const py = center + (r3 + 12) * Math.sin(rad);

      return (
        <g key={p.name}>
          <circle
            cx={px}
            cy={py}
            r="11"
            fill={isDark ? "#0f172a" : "#ffffff"}
            stroke={isDark ? "#e2e8f0" : "#0f172a"}
            strokeWidth="1"
          />
          <text
            x={px}
            y={py}
            fill={p.name === "Sun" ? "#f59e0b" : p.name === "Moon" ? "#38bdf8" : isDark ? "#ffffff" : "#000000"}
            fontSize="11"
            textAnchor="middle"
            dominantBaseline="central"
            className="font-bold"
            title={`${p.name}: ${p.degree.toFixed(1)}° ${p.sign}`}
          >
            {planetIcons[p.name] || p.name.substring(0, 2)}
          </text>
        </g>
      );
    });

    // Draw Aspect connection lines in center
    const aspectLines = chartData.aspects.map((asp, idx) => {
      const p1 = chartData.planets.find(p => p.name === asp.planet1);
      const p2 = chartData.planets.find(p => p.name === asp.planet2);
      if (!p1 || !p2) return null;

      const s1Idx = signs.indexOf(p1.sign);
      const s2Idx = signs.indexOf(p2.sign);
      if (s1Idx === -1 || s2Idx === -1) return null;

      const a1 = s1Idx * 30 + p1.degree - 90;
      const a2 = s2Idx * 30 + p2.degree - 90;

      const rStart = (a1 * Math.PI) / 180;
      const rEnd = (a2 * Math.PI) / 180;

      const x1 = center + (r3 - 10) * Math.cos(rStart);
      const y1 = center + (r3 - 10) * Math.sin(rStart);
      const x2 = center + (r3 - 10) * Math.cos(rEnd);
      const y2 = center + (r3 - 10) * Math.sin(rEnd);

      let color = "#cbd5e1";
      if (asp.type === "Conjunction") color = "#f59e0b";
      else if (asp.type === "Opposition") color = "#ef4444";
      else if (asp.type === "Trine") color = "#22c55e";
      else if (asp.type === "Square") color = "#a855f7";
      else if (asp.type === "Sextile") color = "#06b6d4";

      return (
        <line
          key={`aspect-line-${idx}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth="1.2"
          strokeOpacity="0.4"
          strokeDasharray={asp.type === "Sextile" ? "2,2" : ""}
        />
      );
    });

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="max-w-[380px] mx-auto block">
        {/* Outer background rings */}
        <circle cx={center} cy={center} r={r1} fill="none" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="4" />
        <circle cx={center} cy={center} r={r2} fill="none" stroke={isDark ? "#334155" : "#cbd5e1"} strokeWidth="1" />
        <circle cx={center} cy={center} r={r3} fill="none" stroke={isDark ? "#334155" : "#cbd5e1"} strokeWidth="1" />
        <circle cx={center} cy={center} r={r4} fill="none" stroke={isDark ? "#475569" : "#94a3b8"} strokeWidth="1" />

        {/* Wedges */}
        {signWedges}

        {/* House boundary radial lines */}
        {houseLines}

        {/* Aspect strings in core */}
        {aspectLines}

        {/* Render planets */}
        {planetElements}

        {/* ASC / DSC and MC / IC axes marker */}
        <line x1={center - r1} y1={center} x2={center + r1} y2={center} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,4" />
        <text x={center - r1 + 10} y={center - 6} fill="#f59e0b" fontSize="8" fontFamily="monospace">ASC</text>
        <text x={center + r1 - 25} y={center - 6} fill="#f59e0b" fontSize="8" fontFamily="monospace">DES</text>
      </svg>
    );
  };

  return (
    <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`} id="western-module-root">
      {/* Loading & Error Overlays */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-2" />
          <p className="text-xs text-slate-400 font-mono">Synchronizing coordinates and generating aspects...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Content Renderers */}
      {!loading && !error && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-6"
          >
            {/* Tab 1: Dashboard / Summary */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-xl border ${cardStyle} space-y-4`}>
                  <h4 className={`text-sm font-semibold flex items-center gap-1.5 ${headingStyle}`}>
                    <Activity className="w-4 h-4 text-amber-500" />
                    Western Engine Diagnostics
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This module utilizes a pure tropical coordinate zodiac system (precession-free). It is dynamically powered by standard high-fidelity astronomical calculation mapping with active edge caching.
                  </p>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1.5 border-b border-indigo-500/5">
                      <span className="text-slate-400">Calculation Method:</span>
                      <span className="text-indigo-400 font-bold">Tropical (Precession-Free)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-indigo-500/5">
                      <span className="text-slate-400">House System:</span>
                      <span className="text-slate-200">Placidus</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-indigo-500/5">
                      <span className="text-slate-400">Coordinates:</span>
                      <span className="text-slate-200">{Number(nativeInputs.latitude || 0).toFixed(4)}° N, {Number(nativeInputs.longitude || 0).toFixed(4)}° E</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Ayanamsa Correction:</span>
                      <span className="text-rose-500 font-bold">None (Standard Western)</span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${cardStyle} space-y-4`}>
                  <h4 className={`text-sm font-semibold flex items-center gap-1.5 ${headingStyle}`}>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Zodiac Sign Distribution
                  </h4>
                  {chartData && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-950/30 border border-slate-900 flex flex-col justify-between">
                        <span className="text-slate-400 font-mono">Sun Sign</span>
                        <span className="text-amber-500 font-bold text-sm mt-1">
                          {chartData.planets.find(p => p.name === "Sun")?.sign || "Cancer"}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950/30 border border-slate-900 flex flex-col justify-between">
                        <span className="text-slate-400 font-mono">Moon Sign</span>
                        <span className="text-sky-400 font-bold text-sm mt-1">
                          {chartData.planets.find(p => p.name === "Moon")?.sign || "Taurus"}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950/30 border border-slate-900 flex flex-col justify-between">
                        <span className="text-slate-400 font-mono">Rising Sign (ASC)</span>
                        <span className="text-emerald-400 font-bold text-sm mt-1">
                          {chartData.cusps[0]?.sign || "Libra"}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950/30 border border-slate-900 flex flex-col justify-between">
                        <span className="text-slate-400 font-mono">Midheaven (MC)</span>
                        <span className="text-purple-400 font-bold text-sm mt-1">
                          {chartData.cusps[9]?.sign || "Cancer"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Natal Chart Wheel */}
            {activeTab === "natal_chart" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 flex justify-center">
                  <div className={`p-4 rounded-2xl border ${cardStyle} w-full flex justify-center`}>
                    {renderChartWheel()}
                  </div>
                </div>

                <div className="md:col-span-5 space-y-4">
                  <div className={`p-4 rounded-xl border ${cardStyle}`}>
                    <h4 className="text-xs font-bold text-slate-300 uppercase font-mono mb-3">Wheel Highlights</h4>
                    <ul className="space-y-3 text-xs leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>The circular wheel represents standard 12 Houses in Placidus projection system.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span><strong>Inner lines</strong> map precise major aspects: Oppositions (Red), Trines (Green), Squares (Purple), Conjunctions (Yellow).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>Coordinate values represent <strong>tropical longitudes</strong> without precession modifications.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Positions Grid */}
            {activeTab === "positions" && chartData && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left divide-y divide-slate-800">
                  <thead>
                    <tr className="text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                      <th className="py-2.5 px-3">Planet / Point</th>
                      <th className="py-2.5 px-3">Zodiac Sign</th>
                      <th className="py-2.5 px-3">Zodiac Degree</th>
                      <th className="py-2.5 px-3">House Position</th>
                      <th className="py-2.5 px-3">Element / Modality</th>
                      <th className="py-2.5 px-3">Retrograde</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-500/5">
                    {chartData.planets.map((planet) => (
                      <tr key={planet.name} className="hover:bg-slate-500/5 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{planet.name}</td>
                        <td className="py-2.5 px-3">{planet.sign}</td>
                        <td className="py-2.5 px-3 font-mono">{planet.degree.toFixed(2)}°</td>
                        <td className="py-2.5 px-3 font-mono">House {planet.house}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getElementColor(planet.element)}`}>
                            {planet.element} / {planet.modality}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {planet.isRetrograde ? (
                            <span className="text-amber-500 font-mono text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">RETRO</span>
                          ) : (
                            <span className="text-slate-500 font-mono text-[10px]">DIRECT</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 4: Aspects and Aspects Grid */}
            {activeTab === "aspects" && chartData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-xl border ${cardStyle} space-y-4`}>
                  <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">Major Planetary Aspects</h4>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 divide-y divide-indigo-500/5 scrollbar-thin">
                    {chartData.aspects.map((asp, idx) => {
                      let color = "text-slate-400";
                      if (asp.type === "Conjunction") color = "text-amber-500";
                      else if (asp.type === "Opposition") color = "text-rose-500";
                      else if (asp.type === "Trine") color = "text-emerald-500";
                      else if (asp.type === "Square") color = "text-purple-500";
                      else if (asp.type === "Sextile") color = "text-sky-500";

                      return (
                        <div key={idx} className="flex justify-between items-center py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">{asp.planet1}</span>
                            <span className={`font-mono font-bold ${color}`}>{asp.type}</span>
                            <span className="font-semibold text-slate-200">{asp.planet2}</span>
                          </div>
                          <div className="text-slate-500 font-mono text-[10px]">
                            Angle: {asp.angle.toFixed(1)}° • Orb: {asp.orb.toFixed(1)}°
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grid Visualizer */}
                <div className={`p-4 rounded-xl border ${cardStyle} space-y-4`}>
                  <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">Triangle Synastry / Aspect Grid</h4>
                  <div className="overflow-x-auto">
                    <div className="min-w-[280px] text-center font-mono text-[9px] grid grid-cols-10 gap-1 select-none">
                      {chartData.planets.slice(0, 8).map((p1, rowIdx) => (
                        <div key={p1.name} className="contents">
                          {chartData.planets.slice(0, 8).map((p2, colIdx) => {
                            if (colIdx > rowIdx) return <div key={p2.name} className="aspect-square bg-transparent" />;
                            if (rowIdx === colIdx) return <div key={p2.name} className="aspect-square bg-slate-900 text-amber-500 font-bold flex items-center justify-center rounded border border-slate-800">{p1.name.substring(0, 2)}</div>;

                            // Find aspect
                            const asp = chartData.aspects.find(a => 
                              (a.planet1 === p1.name && a.planet2 === p2.name) || 
                              (a.planet1 === p2.name && a.planet2 === p1.name)
                            );

                            let cellSymbol = "-";
                            let cellBg = "bg-slate-950/25 text-slate-700 border border-slate-900";
                            if (asp) {
                              cellSymbol = asp.type.substring(0, 1);
                              if (asp.type === "Conjunction") cellBg = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
                              else if (asp.type === "Opposition") cellBg = "bg-rose-500/10 text-rose-500 border border-rose-500/20";
                              else if (asp.type === "Trine") cellBg = "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
                              else if (asp.type === "Square") cellBg = "bg-purple-500/10 text-purple-500 border border-purple-500/20";
                              else if (asp.type === "Sextile") cellBg = "bg-sky-500/10 text-sky-500 border border-sky-500/20";
                            }

                            return (
                              <div
                                key={p2.name}
                                className={`aspect-square flex items-center justify-center rounded font-bold ${cellBg}`}
                                title={asp ? `${p1.name} ${asp.type} ${p2.name} (Orb: ${asp.orb.toFixed(1)}°)` : undefined}
                              >
                                {cellSymbol}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Synastry Compatibility */}
            {activeTab === "synastry" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border ${cardStyle} grid grid-cols-1 md:grid-cols-2 gap-6`}>
                  {/* Left Column: Partner Inputs */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-amber-500" />
                      Partner Birth Information
                    </h4>
                    
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">Partner's Name</label>
                      <input
                        type="text"
                        value={partnerInputs.name}
                        onChange={(e) => setPartnerInputs({ ...partnerInputs, name: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-neutral-300"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-slate-400 font-medium mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={partnerInputs.date}
                          onChange={(e) => setPartnerInputs({ ...partnerInputs, date: e.target.value })}
                          className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${
                            isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-neutral-300"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 font-medium mb-1">Time of Birth</label>
                        <input
                          type="time"
                          value={partnerInputs.time}
                          onChange={(e) => setPartnerInputs({ ...partnerInputs, time: e.target.value })}
                          className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${
                            isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-neutral-300"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono uppercase">Latitude</label>
                        <input
                          type="number"
                          value={partnerInputs.latitude}
                          onChange={(e) => setPartnerInputs({ ...partnerInputs, latitude: Number(e.target.value) })}
                          className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none ${
                            isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-neutral-300"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono uppercase">Longitude</label>
                        <input
                          type="number"
                          value={partnerInputs.longitude}
                          onChange={(e) => setPartnerInputs({ ...partnerInputs, longitude: Number(e.target.value) })}
                          className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none ${
                            isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-neutral-300"
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      onClick={calculateSynastry}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Heart className="w-4 h-4" />
                      Run Synastry Compatibility
                    </button>
                  </div>

                  {/* Right Column: Compatibility Results */}
                  <div className="flex flex-col justify-center space-y-4">
                    {synastryData ? (
                      <div className="text-center space-y-4">
                        <div className="relative inline-flex items-center justify-center">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="8" fill="transparent" />
                            <circle cx="48" cy="48" r="40" stroke="#f59e0b" strokeWidth="8" fill="transparent" 
                              strokeDasharray={`${2 * Math.PI * 40}`} 
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - synastryData.compatibilityScore / 100)}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-xl font-bold font-mono text-amber-500">{synastryData.compatibilityScore}%</span>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold">Western Synastry Score</h4>
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{synastryData.summary}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        <Heart className="w-12 h-12 text-rose-500/40 mx-auto mb-2 animate-pulse" />
                        Enter partner birth details and run synastry calculations.
                      </div>
                    )}
                  </div>
                </div>

                {/* Aspect Highlights for Synastry */}
                {synastryData && (
                  <div className={`p-4 rounded-xl border ${cardStyle}`}>
                    <h4 className="text-xs font-bold text-slate-300 uppercase font-mono mb-3">Synastry Aspect Matrix</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {synastryData.aspects.map((asp, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-950/20 border border-slate-900 text-xs font-mono">
                          <span>{asp.planet1} {asp.type} {asp.planet2}</span>
                          <span className="text-amber-500">Orb: {asp.orb.toFixed(1)}°</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 6: Transits & Solar Return */}
            {activeTab === "transits" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transits */}
                <div className={`p-6 rounded-2xl border ${cardStyle} space-y-4`}>
                  <h4 className="text-sm font-semibold flex items-center gap-1.5 text-sky-400">
                    <Activity className="w-4 h-4 text-sky-400" />
                    Active Transits Visualizer
                  </h4>
                  <p className="text-xs text-slate-400">Compare your native natal planets directly with active transiting planets on a target date.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">Target Transit Date</label>
                      <input
                        type="date"
                        value={transitDate}
                        onChange={(e) => setTransitDate(e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-neutral-300"
                        }`}
                      />
                    </div>

                    <button
                      onClick={calculateTransits}
                      className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-slate-950" />
                      Generate Transit Aspect Overlay
                    </button>
                  </div>
                </div>

                {/* Solar Return */}
                <div className={`p-6 rounded-2xl border ${cardStyle} space-y-4`}>
                  <h4 className="text-sm font-semibold flex items-center gap-1.5 text-amber-500">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Solar Return Calculator
                  </h4>
                  <p className="text-xs text-slate-400">Casts the Sun's precise alignment return coordinates for any specific target year of life.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">Target Return Year</label>
                      <select
                        value={solarReturnYear}
                        onChange={(e) => setSolarReturnYear(Number(e.target.value))}
                        className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300"
                        }`}
                      >
                        {Array.from({ length: 15 }).map((_, i) => {
                          const yr = new Date().getFullYear() - 5 + i;
                          return (
                            <option key={yr} value={yr}>{yr}</option>
                          );
                        })}
                      </select>
                    </div>

                    <button
                      onClick={calculateSolarReturn}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-950" />
                      Cast Solar Return Chart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
