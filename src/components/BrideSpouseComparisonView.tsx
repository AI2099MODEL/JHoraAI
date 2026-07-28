/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Heart,
  Users,
  User,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Scale,
  RefreshCw,
  FolderOpen,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Info,
  Award,
  Activity,
  Layers,
  Compass
} from "lucide-react";
import {
  AstrologyData,
  calculateDetailedCompatibility,
  calculateArgalas,
  PlanetPosition,
  DashaPeriod
} from "../lib/astrology";
import { CachedHoroscopeRecord } from "../lib/indexedDb";

interface BrideSpouseComparisonViewProps {
  currentAstrologyData?: AstrologyData | null;
  cachedProfiles: CachedHoroscopeRecord[];
  isDark: boolean;
}

export const BrideSpouseComparisonView: React.FC<BrideSpouseComparisonViewProps> = ({
  currentAstrologyData,
  cachedProfiles,
  isDark
}) => {
  // Bride & Spouse Backend File Selection
  const [backendProfiles, setBackendProfiles] = useState<Array<{ fileName: string; name: string; date: string; location: string }>>([]);
  const [selectedBrideFile, setSelectedBrideFile] = useState<string>("");
  const [selectedSpouseFile, setSelectedSpouseFile] = useState<string>("");
  const [brideData, setBrideData] = useState<AstrologyData | null>(currentAstrologyData || null);
  const [spouseData, setSpouseData] = useState<AstrologyData | null>(null);

  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<{
    brideProfile?: { fileName: string; name: string; date: string; location: string };
    spouseProfile?: { fileName: string; name: string; date: string; location: string };
    compatibility: any;
    bride7thHouse: { house: number; occupants: string[]; lord: string; manglik: boolean; sign?: string };
    spouse7thHouse: { house: number; occupants: string[]; lord: string; manglik: boolean; sign?: string };
    brideDBA: { maha: string; antara: string; pratyantara: string; quality: string; explanation: string };
    spouseDBA: { maha: string; antara: string; pratyantara: string; quality: string; explanation: string };
    brideKp?: any;
    spouseKp?: any;
    detailedVerdict: string;
    separationRiskScore: number;
    litigationRiskScore: number;
    reconciliationScore: number;
    successScore: number;
    timelinePhases: Array<{ phase: string; period: string; sentiment: string; details: string }>;
    remedialProtocols: string[];
  } | null>(null);

  // Fetch backend profile list on mount
  useEffect(() => {
    fetch("/api/user-profile/list")
      .then(res => res.json())
      .then(data => {
        if (data && data.profiles && Array.isArray(data.profiles)) {
          setBackendProfiles(data.profiles);
          if (data.profiles.length > 0 && !selectedBrideFile) {
            setSelectedBrideFile(data.profiles[0].fileName);
          }
          if (data.profiles.length > 1 && !selectedSpouseFile) {
            setSelectedSpouseFile(data.profiles[1].fileName);
          } else if (data.profiles.length === 1 && !selectedSpouseFile) {
            setSelectedSpouseFile(data.profiles[0].fileName);
          }
        }
      })
      .catch(err => console.error("Failed to load backend profiles:", err));
  }, []);

  const runDeepSynastryAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/jhora/comprehensive-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brideFileName: selectedBrideFile,
          spouseFileName: selectedSpouseFile
        })
      });
      const data = await res.json();
      if (data.success) {
        setComparisonResult(data);
      } else {
        console.error("Comparison error:", data.error);
      }
    } catch (err) {
      console.error("Failed to execute comprehensive comparison API:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const containerStyle = isDark
    ? "bg-slate-900/60 backdrop-blur-md border-indigo-500/20 text-slate-100 shadow-xl"
    : "bg-white border-neutral-200 text-neutral-800 shadow-lg";

  const cardStyle = isDark
    ? "bg-slate-950/50 border-indigo-500/10"
    : "bg-neutral-50 border-neutral-200";

  return (
    <div className="space-y-8" id="bride-spouse-comparison-view">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border ${containerStyle} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Heart className="w-40 h-40 text-rose-500 fill-rose-500/20" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono font-medium mb-3">
            <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
            Deep Synastry, DBA Vimshottari & Marital Companionship Engine
          </div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-amber-100 sm:text-3xl">
            Bride & Spouse Horoscope Comparison & Future Timeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Select saved profiles or load your JSON records to perform an exhaustive multi-system astrological evaluation. Analyzes natal 7th house indicators, Navamsa compatibility, Ashtakoota score, Vimshottari Mahadasha-Antardasha-Pratyantar (DBA) future timelines, and evaluates risks of separation, litigation, reconciliation, and long-term success.
          </p>
        </div>
      </div>

      {/* Profile Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bride / Partner A Selector */}
        <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
          <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
            <h3 className="text-sm font-bold font-mono text-amber-400 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              Bride / Partner A Profile
            </h3>
            <span className="text-[11px] font-mono text-slate-400">JSON Record Source</span>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Select Saved Profile JSON</label>
            <select
              value={selectedBrideFile}
              onChange={(e) => setSelectedBrideFile(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
            >
              <option value="">-- Select Bride Profile JSON --</option>
              {backendProfiles.map(p => (
                <option key={p.fileName} value={p.fileName}>{p.name} ({p.date} - {p.location}) [{p.fileName}]</option>
              ))}
            </select>
          </div>

          {comparisonResult?.brideProfile && (
            <div className={`p-4 rounded-xl border ${cardStyle} space-y-2 text-xs text-slate-300`}>
              <div className="flex justify-between font-bold text-amber-300">
                <span>{comparisonResult.brideProfile.name}</span>
                <span className="font-mono">{comparisonResult.brideProfile.date}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <div>Location: <span className="text-slate-200">{comparisonResult.brideProfile.location}</span></div>
                <div>7th House: <span className="text-slate-200 font-bold">{comparisonResult.bride7thHouse.sign || "7th Sign"}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Spouse / Partner B Selector */}
        <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
          <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
            <h3 className="text-sm font-bold font-mono text-indigo-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Spouse / Groom / Partner B Profile
            </h3>
            <span className="text-[11px] font-mono text-slate-400">JSON Record Source</span>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Select Saved Profile JSON</label>
            <select
              value={selectedSpouseFile}
              onChange={(e) => setSelectedSpouseFile(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            >
              <option value="">-- Select Spouse Profile JSON --</option>
              {backendProfiles.map(p => (
                <option key={p.fileName} value={p.fileName}>{p.name} ({p.date} - {p.location}) [{p.fileName}]</option>
              ))}
            </select>
          </div>

          {comparisonResult?.spouseProfile && (
            <div className={`p-4 rounded-xl border ${cardStyle} space-y-2 text-xs text-slate-300`}>
              <div className="flex justify-between font-bold text-indigo-300">
                <span>{comparisonResult.spouseProfile.name}</span>
                <span className="font-mono">{comparisonResult.spouseProfile.date}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <div>Location: <span className="text-slate-200">{comparisonResult.spouseProfile.location}</span></div>
                <div>7th House: <span className="text-slate-200 font-bold">{comparisonResult.spouse7thHouse.sign || "7th Sign"}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Trigger */}
      <div className="flex justify-center">
        <button
          onClick={runDeepSynastryAnalysis}
          disabled={analyzing || !brideData || !spouseData}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-5 h-5 text-slate-950 ${analyzing ? "animate-spin" : ""}`} />
          {analyzing ? "Executing Deep JSON Synastry & DBA Analysis..." : "Run Deep Marital Companionship & DBA Future Forecast"}
        </button>
      </div>

      {/* Analysis Results Display */}
      {comparisonResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Scorecard */}
          <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-500/10 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Comprehensive Synastry & Marital Verdict
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">
                  {comparisonResult.brideProfile?.name || "Bride"} & {comparisonResult.spouseProfile?.name || "Spouse"}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <div className="text-2xl font-black font-mono text-amber-400">
                    {comparisonResult.compatibility.points}/36
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Ashtakoota Score</div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-center">
                  <div className="text-2xl font-black font-mono text-indigo-300">
                    {comparisonResult.successScore}%
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Success & Harmony Index</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs font-mono font-bold text-amber-400 block mb-1">Astrological Assessment Summary</span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {comparisonResult.detailedVerdict}
              </p>
            </div>
          </div>

          {/* Risk & Opportunity Gauge Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-5 rounded-2xl border ${cardStyle} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Separation Risk
                </span>
                <span className="text-sm font-mono font-bold text-rose-400">{comparisonResult.separationRiskScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${comparisonResult.separationRiskScore}%` }} />
              </div>
              <p className="text-[11px] text-slate-400">Evaluates malefic 7th/8th house afflictions and Saturn/Rahu transit pressures.</p>
            </div>

            <div className={`p-5 rounded-2xl border ${cardStyle} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase font-mono flex items-center gap-1.5">
                  <Scale className="w-4 h-4" /> Litigation Risk
                </span>
                <span className="text-sm font-mono font-bold text-amber-400">{comparisonResult.litigationRiskScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${comparisonResult.litigationRiskScore}%` }} />
              </div>
              <p className="text-[11px] text-slate-400">Indicates probability of legal disputes or formal separation triggers.</p>
            </div>

            <div className={`p-5 rounded-2xl border ${cardStyle} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Reconciliation
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400">{comparisonResult.reconciliationScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${comparisonResult.reconciliationScore}%` }} />
              </div>
              <p className="text-[11px] text-slate-400">Measures Jupiter/Venus grace and capacity for mutual forgiveness and healing.</p>
            </div>

            <div className={`p-5 rounded-2xl border ${cardStyle} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase font-mono flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Long-Term Success
                </span>
                <span className="text-sm font-mono font-bold text-indigo-400">{comparisonResult.successScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${comparisonResult.successScore}%` }} />
              </div>
              <p className="text-[11px] text-slate-400">Overall index combining Ashtakoota, 7th house, and active DBA planetary flows.</p>
            </div>
          </div>

          {/* Future Timing by DBA Vimshottari & Natal 7th House */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DBA Vimshottari Analysis */}
            <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
              <h4 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Active DBA (Mahadasha - Antardasha - Pratyantar) Analysis
              </h4>
              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between font-bold text-amber-300">
                    <span>Bride ({comparisonResult.brideProfile?.name || "Bride"}) DBA</span>
                    <span className="font-mono text-amber-400">{comparisonResult.brideDBA.maha} - {comparisonResult.brideDBA.antara} - {comparisonResult.brideDBA.pratyantara}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{comparisonResult.brideDBA.quality}</p>
                  <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-900">{comparisonResult.brideDBA.explanation}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between font-bold text-indigo-300">
                    <span>Spouse ({comparisonResult.spouseProfile?.name || "Spouse"}) DBA</span>
                    <span className="font-mono text-indigo-400">{comparisonResult.spouseDBA.maha} - {comparisonResult.spouseDBA.antara} - {comparisonResult.spouseDBA.pratyantara}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{comparisonResult.spouseDBA.quality}</p>
                  <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-900">{comparisonResult.spouseDBA.explanation}</p>
                </div>
              </div>
            </div>

            {/* Natal 7th House & Dosha Comparison */}
            <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
              <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Natal 7th House & Manglik Status Comparison
              </h4>
              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between font-bold text-amber-300">
                    <span>Bride 7th House Indicators</span>
                    <span className={comparisonResult.bride7thHouse.manglik ? "text-rose-400" : "text-emerald-400"}>
                      {comparisonResult.bride7thHouse.manglik ? "Manglik / Afflicted" : "Balanced"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    <div>7th Lord: <span className="text-slate-200">{comparisonResult.bride7thHouse.lord}</span></div>
                    <div>Occupants: <span className="text-slate-200">{comparisonResult.bride7thHouse.occupants.join(", ") || "None (Empty)"}</span></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between font-bold text-indigo-300">
                    <span>Spouse 7th House Indicators</span>
                    <span className={comparisonResult.spouse7thHouse.manglik ? "text-rose-400" : "text-emerald-400"}>
                      {comparisonResult.spouse7thHouse.manglik ? "Manglik / Afflicted" : "Balanced"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    <div>7th Lord: <span className="text-slate-200">{comparisonResult.spouse7thHouse.lord}</span></div>
                    <div>Occupants: <span className="text-slate-200">{comparisonResult.spouse7thHouse.occupants.join(", ") || "None (Empty)"}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ashtakoota 8 Kootas Detailed Breakdown Table */}
          <div className={`p-6 rounded-2xl border ${containerStyle}`}>
            <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-500" />
              Ashtakoota 8-Dimension Breakdown Table
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(comparisonResult.compatibility.kootas || {}).map(([name, k]: [string, any], idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${cardStyle} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-400">{name}</span>
                      <span className="text-xs font-mono font-bold text-slate-200">{k.points}/{k.maxPoints}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${(k.points / k.maxPoints) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-2">{k.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

    {/* KP Event Analysis & All Astro Systems Validation Tables */}
          {comparisonResult.kpEventAnalysis && comparisonResult.systemValidations && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KP Marital Event Analysis */}
              <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {comparisonResult.kpEventAnalysis.title}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{comparisonResult.kpEventAnalysis.ruleId}</span>
                </div>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">7th Cuspal Sub Lord Signification:</span>
                    <p className="text-slate-200">{comparisonResult.kpEventAnalysis.cslSignification}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">DBA Event Trigger Validation:</span>
                    <p className="text-slate-200">{comparisonResult.kpEventAnalysis.dbaValidation}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">Ruling Planets & Query Timing:</span>
                    <p className="text-slate-200">{comparisonResult.kpEventAnalysis.rulingPlanetsStatus}</p>
                  </div>
                </div>
              </div>

              {/* All Astro Systems Validation Table */}
              <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
                <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  All Astrological Systems Validation (JH1 - JH19 Registry)
                </h4>
                <div className="space-y-2.5">
                  {comparisonResult.systemValidations.map((sys, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border ${cardStyle} flex items-center justify-between`}>
                      <div className="space-y-0.5 pr-2">
                        <div className="text-xs font-bold text-slate-200">{sys.system}</div>
                        <div className="text-[11px] text-slate-400">{sys.summary}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 whitespace-nowrap">{sys.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Future Timeline & Remedial Protocols */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline Phases */}
            <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
              <h4 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Future Timeline & Astrological Forecast Phases
              </h4>
              <div className="space-y-3">
                {comparisonResult.timelinePhases.map((phase, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border ${cardStyle} space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{phase.phase}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{phase.period}</span>
                    </div>
                    <p className="text-[11px] font-medium text-amber-300">{phase.sentiment}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{phase.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Remedial Protocols */}
            <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
              <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4" />
                Vedic & KP Remedial Protocols for Harmony
              </h4>
              <ul className="space-y-3 text-xs text-slate-300">
                {comparisonResult.remedialProtocols.map((protocol, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-500/15">
                    <span className="text-amber-400 font-bold font-mono mt-0.5">0{idx + 1}</span>
                    <span className="leading-relaxed">{protocol}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
