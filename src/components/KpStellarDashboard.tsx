/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  Layers,
  Sparkles,
  RefreshCw,
  Cpu,
  BarChart,
  Network,
  Calendar,
  Zap,
  Activity,
  History,
  Info,
  Settings,
  HelpCircle,
  Clock,
  Play,
  Database,
  Terminal,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { AstrologyData } from "../lib/astrology";
import { NormalizedKPModel, KpHoraryData } from "../lib/kpModel";
import { DefaultKpProviderManager } from "../lib/kpManager";

interface KpStellarDashboardProps {
  astrologyData: AstrologyData;
  activeSubmenuId: string;
  onSubmenuSelect: (id: string) => void;
  isDarkTheme: boolean;
}

export default function KpStellarDashboard({
  astrologyData,
  activeSubmenuId,
  onSubmenuSelect,
  isDarkTheme
}: KpStellarDashboardProps) {
  const [manager, setManager] = useState<DefaultKpProviderManager | null>(null);
  const [kpData, setKpData] = useState<NormalizedKPModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [horaryNumber, setHoraryNumber] = useState<number>(1);
  const [horaryQuestion, setHoraryQuestion] = useState<string>("");
  const [horaryResult, setHoraryResult] = useState<KpHoraryData | null>(null);
  const [horaryCasting, setHoraryCasting] = useState<boolean>(false);
  const [validationSuccess, setValidationSuccess] = useState<boolean>(true);
  const [providerLogs, setProviderLogs] = useState<string[]>([]);
  const [devMode, setDevMode] = useState<boolean>(false);

  // Initialize Provider Manager and load KP Data
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const mgr = await DefaultKpProviderManager.create();
        setManager(mgr);
        const data = await mgr.calculateKP(astrologyData);
        setKpData(data);
        addLog(`Successfully loaded active provider: ${mgr.getActiveProvider()?.getMetadata().name}`);
        addLog("Data mapped into NormalizedKPModel successfully.");
      } catch (e: any) {
        console.error("KP manager init failed:", e);
        addLog(`Initialization Error: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [astrologyData]);

  const addLog = (msg: string) => {
    setProviderLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const handleRefresh = async () => {
    if (!manager || !astrologyData) return;
    setLoading(true);
    addLog("Triggering manual refresh of active provider...");
    try {
      await manager.refreshActiveProvider();
      const data = await manager.calculateKP(astrologyData);
      setKpData(data);
      addLog("Refresh complete. Cache renewed.");
    } catch (e: any) {
      addLog(`Refresh failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = async (id: string) => {
    if (!manager) return;
    try {
      manager.setActiveProvider(id);
      addLog(`Switching active provider to: ${id}`);
      setLoading(true);
      const data = await manager.calculateKP(astrologyData);
      setKpData(data);
      addLog(`Calculated metrics successfully using ${id}`);
    } catch (e: any) {
      addLog(`Switch failed: ${e.message}`);
      alert(`Could not activate provider: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCastHorary = async () => {
    if (!manager || !horaryQuestion.trim()) return;
    setHoraryCasting(true);
    addLog(`Casting horary chart for number ${horaryNumber}...`);
    try {
      const res = await manager.calculateHorary(horaryNumber, horaryQuestion, astrologyData);
      setHoraryResult(res);
      addLog(`Horary successfully cast. Cusp longitude & Ruling planets resolved.`);
    } catch (e: any) {
      addLog(`Horary casting failed: ${e.message}`);
    } finally {
      setHoraryCasting(false);
    }
  };

  const handleClearCache = () => {
    if (manager) {
      manager.cache.clear();
      addLog("Provider manager cache cleared successfully.");
      alert("KP Provider Cache Cleared!");
    }
  };

  // Styles based on theme
  const containerStyle = isDarkTheme
    ? "bg-slate-900/60 border-indigo-500/20 text-slate-100"
    : "bg-white border-neutral-200 text-neutral-800 shadow-sm";
  const cardStyle = isDarkTheme
    ? "bg-slate-950/60 border-slate-800 text-slate-100"
    : "bg-neutral-50 border-neutral-200 text-neutral-800";
  const textMuted = isDarkTheme ? "text-slate-400" : "text-neutral-500";
  const headingStyle = isDarkTheme ? "text-amber-100" : "text-amber-700 font-semibold";
  const borderStyle = isDarkTheme ? "border-slate-800" : "border-neutral-200";

  if (loading || !kpData) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-4" />
        <span className="text-sm text-slate-400 font-mono">
          Loading KP Stellar Provider & mapping normalized properties...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="kp-stellar-container">
      {/* HEADER SECTION */}
      <div className={`p-6 rounded-2xl border ${containerStyle}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-sans font-medium flex items-center gap-2 text-amber-400">
              <Zap className="w-5 h-5 text-amber-500" />
              KP Stellar Analysis
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                v1.0 Architecture
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Independent Krishnamurti Paddhati analytical workspace. Read-only profile mappings from JHora API.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl border text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 ${
                isDarkTheme
                  ? "bg-slate-950 hover:bg-slate-900 border-indigo-500/10 hover:border-amber-500/30 text-amber-500"
                  : "bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-amber-700"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Provider
            </button>
          </div>
        </div>
      </div>

      {/* HORIZONTAL KP SUBMENU BAR (For mobile view or top nav) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 md:hidden">
        {[
          { id: "dashboard", label: "Dashboard" },
          { id: "cusps", label: "Cusps" },
          { id: "planet_analysis", label: "Planets" },
          { id: "significators", label: "Significators" },
          { id: "ruling_planets", label: "Ruling Planets" },
          { id: "kp_dasha", label: "KP Dasha" },
          { id: "transit", label: "Transit" },
          { id: "horary", label: "Horary" },
          { id: "research", label: "Research" },
          { id: "settings", label: "Settings" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSubmenuSelect(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              activeSubmenuId === tab.id
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/40"
                : isDarkTheme
                  ? "bg-slate-900 border border-slate-800 text-slate-400"
                  : "bg-neutral-100 border border-neutral-200 text-neutral-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DISPATCH SCREEN RENDERING */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubmenuId}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="space-y-6"
        >
          {/* TAB 1: DASHBOARD / OVERVIEW */}
          {activeSubmenuId === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* CURRENT PROFILE SUMMARY */}
              <div className={`p-5 rounded-2xl border ${containerStyle} flex flex-col justify-between h-[230px]`}>
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-500" />
                    Current Active Profile
                  </h3>
                  <div className="space-y-2 mt-2">
                    <div className="text-sm font-bold text-amber-500 truncate">{kpData.profileName}</div>
                    <div className="text-xs font-mono text-slate-300">
                      📅 {kpData.birthDate} <br />
                      🕒 {kpData.birthTime}
                    </div>
                    <div className="text-xs text-slate-400 truncate">📍 {kpData.location}</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 border-t border-indigo-500/5 pt-2">
                  Locked to primary dashboard parameters.
                </div>
              </div>

              {/* ACTIVE PROVIDER METRICS */}
              <div className={`p-5 rounded-2xl border ${containerStyle} flex flex-col justify-between h-[230px]`}>
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-amber-500" />
                    KP Provider Configuration
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className={textMuted}>Provider Name:</span>
                      <span className="font-semibold text-white">{kpData.providerName}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className={textMuted}>Status:</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-500/15 text-green-400 border border-green-500/20">
                        ● {kpData.providerStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className={textMuted}>Data Quality:</span>
                      <span className="font-mono text-indigo-400">{kpData.dataStatus}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className={textMuted}>Last Sync:</span>
                      <span className="font-mono text-slate-300 text-[11px] truncate max-w-[150px]">
                        {new Date(kpData.lastUpdated).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 border-t border-indigo-500/5 pt-2">
                  API Source: {kpData.apiSource}
                </div>
              </div>

              {/* RESOLUTION STATUS */}
              <div className={`p-5 rounded-2xl border ${containerStyle} flex flex-col justify-between h-[230px]`}>
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Architecture Integrity
                  </h3>
                  <div className="space-y-2 mt-1 text-xs">
                    <p className={textMuted}>
                      The KP system is decoupled from JHora API. It reads the NormalizedChartModel directly with zero duplication of parameters.
                    </p>
                    <div className="bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10 text-[10px] font-mono text-indigo-400">
                      ✓ Zero birth details form duplicate <br />
                      ✓ Pure downstream provider logic
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 border-t border-indigo-500/5 pt-2">
                  SLA: Community standard resolved
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSPS */}
          {activeSubmenuId === "cusps" && (
            <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-lg font-sans font-medium ${headingStyle}`}>12 Cuspal Placements</h3>
                  <p className="text-xs text-slate-400">KP Cusps calculated on Placidus house coordinate split.</p>
                </div>
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded">
                  System: Placidus House Split
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${borderStyle} text-[10px] font-mono uppercase text-slate-400`}>
                      <th className="py-3 px-2">Cusp #</th>
                      <th className="py-3 px-2">Zodiac Sign</th>
                      <th className="py-3 px-2">Longitude</th>
                      <th className="py-3 px-2">Star Lord (Nakshatra)</th>
                      <th className="py-3 px-2">Sub Lord</th>
                      <th className="py-3 px-2">Sub-Sub Lord</th>
                      <th className="py-3 px-2 text-right">House Strength</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpData.cusps.map((c) => {
                      const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
                      return (
                        <tr key={c.number} className={`border-b ${borderStyle} hover:bg-slate-500/5 transition-colors`}>
                          <td className="py-3 px-2 font-bold text-amber-500">{romanNumerals[c.number - 1]}</td>
                          <td className="py-3 px-2 font-medium">{c.sign}</td>
                          <td className="py-3 px-2 font-mono text-slate-300">
                            {Math.floor(c.degree)}° {Math.round((c.degree % 1) * 60)}'
                          </td>
                          <td className="py-3 px-2 font-mono">{c.starLord}</td>
                          <td className="py-3 px-2 font-mono text-indigo-300 font-semibold">{c.subLord}</td>
                          <td className="py-3 px-2 font-mono text-slate-400">{c.subSubLord}</td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-mono text-slate-400">{c.houseStrength.toFixed(0)}%</span>
                              <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-amber-500 h-1.5 rounded-full"
                                  style={{ width: `${c.houseStrength}%` }}
                                />
                              </div>
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

          {/* TAB 3: PLANET ANALYSIS */}
          {activeSubmenuId === "planet_analysis" && (
            <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
              <div>
                <h3 className={`text-lg font-sans font-medium ${headingStyle}`}>Planetary Lord Analysis</h3>
                <p className="text-xs text-slate-400">
                  Detailed stellar and sub-level lords representing the 9 primary celestial bodies.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${borderStyle} text-[10px] font-mono uppercase text-slate-400`}>
                      <th className="py-3 px-2">Planet</th>
                      <th className="py-3 px-2">Sign</th>
                      <th className="py-3 px-2">Cusp House</th>
                      <th className="py-3 px-2">Star Lord (Nakshatra)</th>
                      <th className="py-3 px-2">Sub Lord</th>
                      <th className="py-3 px-2">Sub-Sub Lord</th>
                      <th className="py-3 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpData.planets.map((p) => (
                      <tr key={p.name} className={`border-b ${borderStyle} hover:bg-slate-500/5 transition-colors`}>
                        <td className="py-3 px-2 font-bold text-amber-500 flex items-center gap-1.5">
                          {p.name}
                        </td>
                        <td className="py-3 px-2">{p.sign}</td>
                        <td className="py-3 px-2 font-mono">House {p.house}</td>
                        <td className="py-3 px-2 font-mono">{p.starLord}</td>
                        <td className="py-3 px-2 font-mono text-indigo-300 font-semibold">{p.subLord}</td>
                        <td className="py-3 px-2 font-mono text-slate-400">{p.subSubLord}</td>
                        <td className="py-3 px-2 text-center space-x-1">
                          {p.isRetrograde && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[9px] font-mono font-bold">
                              R
                            </span>
                          )}
                          {p.isCombust && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-mono font-bold">
                              C
                            </span>
                          )}
                          {!p.isRetrograde && !p.isCombust && (
                            <span className="text-slate-500 text-[10px]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SIGNIFICATORS */}
          {activeSubmenuId === "significators" && (
            <div className="space-y-6">
              {/* PLANET SIGNIFICATORS BENTO */}
              <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
                <div>
                  <h3 className={`text-lg font-sans font-medium ${headingStyle}`}>Planet Significators</h3>
                  <p className="text-xs text-slate-400">
                    Houses signified by each planet categorized from Level 1 (strongest) to Level 4.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(Object.entries(kpData.significators.planetSignificators) as [string, { primary: number[]; secondary: number[]; tertiary: number[]; quaternary: number[] }][]).map(([planet, sigs]) => (
                    <div key={planet} className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
                      <div className="flex justify-between items-center border-b border-indigo-500/5 pb-2">
                        <span className="font-bold text-amber-500 text-xs">{planet}</span>
                        <span className="text-[9px] font-mono text-slate-400 uppercase">Significations</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className={textMuted}>L1 (Star Occ):</span>
                          <span className="text-white font-bold">{sigs.primary.join(", ")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={textMuted}>L2 (Occupant):</span>
                          <span className="text-indigo-400 font-bold">{sigs.secondary.join(", ")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={textMuted}>L3 (Star Owner):</span>
                          <span className="text-slate-300">{sigs.tertiary.join(", ")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={textMuted}>L4 (Owner):</span>
                          <span className="text-slate-400">{sigs.quaternary.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* HOUSE SIGNIFICATORS BENTO */}
              <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
                <div>
                  <h3 className={`text-lg font-sans font-medium ${headingStyle}`}>House Significators</h3>
                  <p className="text-xs text-slate-400">
                    Planets signifying each of the 12 cuspal domains categorized by power level.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(Object.entries(kpData.significators.houseSignificators) as unknown as [string, { primary: string[]; secondary: string[]; tertiary: string[]; quaternary: string[] }][]).map(([house, sigs]) => (
                    <div key={house} className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
                      <div className="flex justify-between items-center border-b border-indigo-500/5 pb-2">
                        <span className="font-bold text-indigo-400 text-xs">Cusp House {house}</span>
                        <span className="text-[9px] font-mono text-slate-400 uppercase">Ruling Planets</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className={textMuted}>L1 (Star Occ):</span>
                          <span className="text-amber-500 font-bold">{sigs.primary.join(", ") || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={textMuted}>L2 (Occ):</span>
                          <span className="text-white font-bold">{sigs.secondary.join(", ") || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={textMuted}>L3 (Star Own):</span>
                          <span className="text-slate-300">{sigs.tertiary.join(", ") || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={textMuted}>L4 (Own):</span>
                          <span className="text-slate-400">{sigs.quaternary.join(", ") || "-"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RULING PLANETS */}
          {activeSubmenuId === "ruling_planets" && (
            <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`}>
              <div>
                <h3 className={`text-lg font-sans font-medium ${headingStyle}`}>KP Ruling Planets (RP)</h3>
                <p className="text-xs text-slate-400">
                  Dynamic cosmic rulers governing the current calculation coordinate moment. Highly sensitive.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { label: "Day Lord", planet: kpData.rulingPlanets.dayLord, desc: "Governs the day of chart casting." },
                  { label: "Moon Sign Lord", planet: kpData.rulingPlanets.moonSignLord, desc: "Rashi lord of the Moon's sign." },
                  { label: "Moon Star Lord", planet: kpData.rulingPlanets.moonStarLord, desc: "Nakshatra lord of the Moon." },
                  { label: "Ascendant Lord", planet: kpData.rulingPlanets.ascendantLord, desc: "Rashi lord of the Ascendant Cusp." },
                  { label: "Ascendant Star Lord", planet: kpData.rulingPlanets.ascendantStarLord, desc: "Nakshatra lord of the Ascendant." }
                ].map((rp, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${cardStyle} text-center space-y-2`}>
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">
                      {rp.label}
                    </span>
                    <div className="text-lg font-bold text-amber-500">{rp.planet}</div>
                    <p className="text-[10px] text-slate-500 leading-snug">{rp.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl text-xs text-slate-400">
                <span className="font-bold text-white block mb-1">Methodology & Usage</span>
                Ruling Planets are utilized for verification of birth time alignment and rectification. If the active RPs map cleanly to Ascendant cusps, calculations achieve maximum precision.
              </div>
            </div>
          )}

          {/* TAB 6: KP DASHA */}
          {activeSubmenuId === "kp_dasha" && (
            <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`}>
              <div>
                <h3 className={`text-lg font-sans font-medium ${headingStyle}`}>KP Vimshottari Dasha Tree</h3>
                <p className="text-xs text-slate-400">
                  Vimshottari timelines mapped with KP sub-lord transit intersections.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DASHA LIST */}
                <div className="space-y-3">
                  <span className="text-xs font-mono text-slate-400 uppercase font-bold">Mahadasha Periods</span>
                  <div className="space-y-2">
                    {kpData.dashas.slice(0, 5).map((d) => (
                      <div key={d.planet} className={`p-3 rounded-xl border ${cardStyle} flex justify-between items-center`}>
                        <div>
                          <span className="text-sm font-bold text-amber-500">{d.planet} Mahadasha</span>
                          <span className="block text-[10px] text-slate-500 font-mono">
                            {d.startTime} to {d.endTime}
                          </span>
                        </div>
                        <span className="text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono uppercase">
                          Active State
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FUTURE EVENT PERIODS */}
                <div className="space-y-4">
                  <span className="text-xs font-mono text-slate-400 uppercase font-bold">KP Event Indicators</span>
                  <div className={`p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/20 text-center space-y-3`}>
                    <Activity className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Event Timing Engine (Future Phase)</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                        Future iterations will enable automated significator intersections to predict exact wedding, home buying, or job shift intervals using KP event matrices.
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-mono rounded">
                        Transit Overlay
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-mono rounded">
                        Significator Matrix
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: TRANSIT */}
          {activeSubmenuId === "transit" && (
            <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`}>
              <div>
                <h3 className={`text-lg font-sans font-medium ${headingStyle}`}>KP Transit Significance</h3>
                <p className="text-xs text-slate-400">
                  Real-time planetary coordinates resolved with corresponding sub-lords.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* TRANSIT PLANET TABLE */}
                <div className="md:col-span-2 space-y-3">
                  <span className="text-xs font-mono text-slate-400 uppercase font-bold">Transit Table</span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-mono uppercase">
                          <th className="pb-2">Planet</th>
                          <th className="pb-2">Current Sign</th>
                          <th className="pb-2">Degrees</th>
                          <th className="pb-2">Star Lord</th>
                          <th className="pb-2">Sub Lord</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kpData.transit.transitTable.map((t) => (
                          <tr key={t.planet} className="border-b border-slate-800 hover:bg-slate-500/5">
                            <td className="py-2.5 font-bold text-amber-500">{t.planet}</td>
                            <td>{t.currentSign}</td>
                            <td className="font-mono text-slate-300">{t.currentDegree}</td>
                            <td className="font-mono">{t.starLord}</td>
                            <td className="font-mono text-indigo-300 font-semibold">{t.subLord}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TRANSIT EVENTS */}
                <div className="space-y-4">
                  <span className="text-xs font-mono text-slate-400 uppercase font-bold">Transit Events</span>
                  <div className="space-y-3">
                    {kpData.transit.events.map((e, i) => (
                      <div key={i} className={`p-3 rounded-xl border ${cardStyle} space-y-1`}>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-mono">{e.time}</span>
                          <span className={`text-[8px] uppercase tracking-widest px-1 py-0.5 rounded font-extrabold ${
                            e.type === "ingress" ? "bg-amber-500/20 text-amber-400" : "bg-indigo-500/20 text-indigo-400"
                          }`}>
                            {e.type}
                          </span>
                        </div>
                        <p className="text-xs text-white leading-snug">{e.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: HORARY */}
          {activeSubmenuId === "horary" && (
            <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`}>
              <div>
                <h3 className={`text-lg font-sans font-medium ${headingStyle}`}>KP Horary (Prashna Chart)</h3>
                <p className="text-xs text-slate-400">
                  Cast instant horary charts by entering seed numbers from 1 to 249 to calculate cuspal divisions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* FORM INPUT CARD */}
                <div className={`p-5 rounded-xl border ${cardStyle} space-y-4 h-fit`}>
                  <span className="text-xs font-mono text-slate-400 uppercase font-bold">Cast Parameter</span>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Horary Seed Number (1 - 249)</label>
                    <input
                      type="number"
                      min={1}
                      max={249}
                      value={horaryNumber}
                      onChange={(e) => setHoraryNumber(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Question Description</label>
                    <textarea
                      placeholder="e.g. Will I acquire the new property next month?"
                      rows={3}
                      value={horaryQuestion}
                      onChange={(e) => setHoraryQuestion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-200 placeholder:text-slate-600"
                    />
                  </div>

                  <button
                    onClick={handleCastHorary}
                    disabled={horaryCasting || !horaryQuestion.trim()}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    {horaryCasting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Casting Horary...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                        Cast Horary Chart
                      </>
                    )}
                  </button>
                </div>

                {/* RESULT DISPLAY */}
                <div className="md:col-span-2 space-y-4">
                  <span className="text-xs font-mono text-slate-400 uppercase font-bold">Cast Result Panel</span>
                  
                  {horaryResult ? (
                    <div className={`p-5 rounded-xl border border-indigo-500/10 bg-indigo-500/5 space-y-4`}>
                      <div className="flex justify-between items-center border-b border-indigo-500/10 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-amber-500">Seed #{horaryResult.number} Active</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">📅 {horaryResult.date} • 🕒 {horaryResult.time}</p>
                        </div>
                        <span className="px-2 py-1 rounded bg-green-500/15 text-green-400 text-[9px] font-mono font-bold border border-green-500/20">
                          SUCCESS PROBABILITY: HIGH
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Query</span>
                        <p className="text-xs text-white leading-relaxed italic">"{horaryResult.question}"</p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-indigo-500/10">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Analysis Verdict</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {horaryResult.resultSummary}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl h-[230px] text-slate-500">
                      <HelpCircle className="w-10 h-10 text-slate-600 mb-2" />
                      <p className="text-xs">No active Horary chart cast yet. Enter seed and query parameters to trigger calculations.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: RESEARCH / DEVELOPER VIEW */}
          {activeSubmenuId === "research" && (
            <div className="space-y-6">
              {/* STATUS COMPARISON */}
              <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
                <div>
                  <h3 className={`text-lg font-sans font-medium ${headingStyle}`}>Provider Health Comparison</h3>
                  <p className="text-xs text-slate-400">Evaluating multi-provider registries and latency tolerances.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-mono uppercase">
                        <th className="pb-2">Provider Name</th>
                        <th className="pb-2">Priority</th>
                        <th className="pb-2">Endpoint</th>
                        <th className="pb-2">Uptime</th>
                        <th className="pb-2">Latency</th>
                        <th className="pb-2 text-right">Integrity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manager?.getProviderPriorityList().map((meta) => {
                        const prov = manager.registry.getProvider(meta.id);
                        const health = prov?.getHealth();
                        return (
                          <tr key={meta.id} className="border-b border-slate-800 hover:bg-slate-500/5">
                            <td className="py-3 font-bold text-amber-500">{meta.name}</td>
                            <td className="font-mono text-slate-300">Level {meta.priority}</td>
                            <td className="font-mono text-slate-400 text-[11px] max-w-[150px] truncate">
                              {meta.endpointUrl || "N/A (Local Wrapper)"}
                            </td>
                            <td className="text-green-400 font-mono">{health?.uptimePercentage}%</td>
                            <td className="font-mono">{health?.latencyMs}ms</td>
                            <td className="text-right">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                meta.isConfigured ? "bg-green-500/10 text-green-400" : "bg-rose-500/10 text-rose-400"
                              }`}>
                                {meta.isConfigured ? "RESOLVED" : "DISABLED"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* INTEGRITY VALIDATOR LOGS & RAW VIEW */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TRACE LOGS */}
                <div className={`p-5 rounded-xl border ${containerStyle} space-y-3 h-[250px] flex flex-col justify-between`}>
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" />
                      Calculation Audit Logs
                    </span>
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg font-mono text-[9px] text-green-400 h-36 overflow-y-auto space-y-1 scrollbar-thin">
                      {providerLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">Continuous background audit log monitor active.</span>
                </div>

                {/* RAW MODEL SCHEMA */}
                <div className={`p-5 rounded-xl border ${containerStyle} space-y-3 h-[250px] flex flex-col justify-between`}>
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" />
                      Normalized Model Schema (DTO)
                    </span>
                    <pre className="bg-slate-950 border border-slate-800 p-3 rounded-lg font-mono text-[9px] text-slate-300 h-36 overflow-y-auto scrollbar-thin">
                      {JSON.stringify(kpData, null, 2)}
                    </pre>
                  </div>
                  <span className="text-[10px] text-indigo-400">NormalizedKPModel interface compliant payload.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeSubmenuId === "settings" && (
            <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`}>
              <div>
                <h3 className={`text-lg font-sans font-medium ${headingStyle}`}>KP Stellar Module Settings</h3>
                <p className="text-xs text-slate-400">Configure connection settings, developer modes, and priority routing lists.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* SELECT ACTIVE PROVIDER */}
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Active KP Provider Connection</label>
                    <select
                      value={manager?.activeProviderId}
                      onChange={(e) => handleProviderChange(e.target.value)}
                      className={`w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-200`}
                    >
                      {manager?.getProviderPriorityList()
                        .filter(m => m.isConfigured)
                        .map((meta) => (
                          <option key={meta.id} value={meta.id}>
                            {meta.name} (Priority {meta.priority})
                          </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">Providers with manual API keys must be configured on Developer settings first.</p>
                  </div>

                  {/* CLEAR CACHE BUTTON */}
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Cache Management</label>
                    <button
                      onClick={handleClearCache}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-xs cursor-pointer transition-all"
                    >
                      Clear KP Cache Directory
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1">Clears temporary client state cache mapping of calculated KP models.</p>
                  </div>
                </div>

                {/* DEVELOPER TOGGLES */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Developer Debug Mode</label>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/20">
                      <span className="text-xs text-slate-400">Display detailed trace logs and raw JSON views</span>
                      <input
                        type="checkbox"
                        checked={devMode}
                        onChange={(e) => {
                          setDevMode(e.target.checked);
                          addLog(`Developer Debug mode: ${e.target.checked ? "ENABLED" : "DISABLED"}`);
                        }}
                        className="w-4 h-4 text-amber-500 bg-slate-950 border-slate-800 focus:ring-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl text-xs text-slate-400 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">Constraint Safety Notice</span>
                      Local calculation engines remain 100% disabled in compliance with Phase 11 directives. No mathematics are compiled locally. All analysis relies strictly on remote provider integration mapping.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
