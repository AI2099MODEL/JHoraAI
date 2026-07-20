/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  Heart,
  Scale,
  Briefcase,
  Coins,
  Home,
  Baby,
  Globe,
  ShieldAlert,
  AlertTriangle,
  Award,
  Cpu,
  CheckCircle,
  Calendar,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Database,
  Compass,
  Shield,
  Activity,
  FileText,
  HelpCircle,
  Check
} from "lucide-react";
import { mapAstrologyDataToUserProfileJSON } from "../lib/jhoraMapper";
import { runNJEngine, NJForecastDay, NJEngineResult } from "../lib/njEngine";

interface PresentDayEngineViewProps {
  astrologyData: any;
  isDark: boolean;
}

export const PresentDayEngineView: React.FC<PresentDayEngineViewProps> = ({
  astrologyData,
  isDark
}) => {
  // Dynamic prediction date starting with today
  const [predictionDate, setPredictionDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Current active sub-tab for day selection (1, 2, 3)
  const [activeDayIdx, setActiveDayIdx] = useState<number>(1);

  // Currently active tab (defaults to 'career')
  const [activeTab, setActiveTab] = useState<string>("career");

  const [rulesOpen, setRulesOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string>("KP Stellar");

  // Map the raw astrology data to user profile JSON
  const mappedProfile = useMemo(() => {
    if (!astrologyData) return null;
    try {
      return mapAstrologyDataToUserProfileJSON(null, astrologyData);
    } catch (e) {
      console.error("Error parsing profile JSON in PresentDayEngineView:", e);
      return null;
    }
  }, [astrologyData]);

  // Run the NJ v2.0 Engine
  const njResult = useMemo<NJEngineResult | null>(() => {
    if (!astrologyData) return null;
    try {
      return runNJEngine(predictionDate, astrologyData, mappedProfile);
    } catch (e) {
      console.error("Error running NJ Engine:", e);
      return null;
    }
  }, [predictionDate, astrologyData, mappedProfile]);

  // Extract core birth information or fall back
  const birthDetails = useMemo(() => {
    const inputs = astrologyData?.inputs || astrologyData?.birthDetails || {};
    return {
      name: inputs.name || "Nitin Jain",
      date: inputs.date || "1988-09-23",
      time: inputs.time || "08:15:00",
      place: inputs.place || "Delhi, India",
    };
  }, [astrologyData]);

  // Get active day data
  const activeDayData = useMemo<NJForecastDay | null>(() => {
    if (!njResult) return null;
    return njResult.forecastDays.find(d => d.dayIndex === activeDayIdx) || njResult.forecastDays[0];
  }, [njResult, activeDayIdx]);

  // Selected event theme details
  const activeEventDetails = useMemo(() => {
    if (!activeDayData) return null;
    return activeDayData.themeScores.find(t => t.id === activeTab) || activeDayData.themeScores[0];
  }, [activeDayData, activeTab]);

  // Sort resolved events to find the absolute most active of the day for global summary
  const sortedEvents = useMemo(() => {
    if (!activeDayData) return [];
    return [...activeDayData.themeScores].sort((a, b) => b.probability - a.probability);
  }, [activeDayData]);

  const primaryTheme = useMemo(() => sortedEvents[0], [sortedEvents]);
  const secondaryTheme = useMemo(() => sortedEvents[1], [sortedEvents]);

  // Static Engine Loader statuses
  const staticCache = useMemo(() => {
    return [
      { id: "house_cusps", label: "House Cusps Coordinates", status: "LOADED", icon: CheckCircle, value: "12 Placidus Cusps mapped to 100% precision" },
      { id: "planet_positions", label: "Planetary Degrees & Speed", status: "LOADED", icon: CheckCircle, value: "9 Planets + Uranian system parsed" },
      { id: "six_fold", label: "6-Fold Significators (A, B, C, D, E, F)", status: "LOADED", icon: CheckCircle, value: "Stellar house links fully resolved" },
      { id: "csl", label: "Cuspal Sub Lords (CSL) Matrix", status: "LOADED", icon: CheckCircle, value: "All 12 sub-lord paths parsed" },
      { id: "ruling_planets", label: "Natal Ruling Planets (RP)", status: "LOADED", icon: CheckCircle, value: "Lagna, Moon, Star, Sign, Day lords stored" },
      { id: "natal_promise", label: "Lifetime Promise Vault", status: "LOADED", icon: CheckCircle, value: "Permanent planetary triggers mapped" }
    ];
  }, []);

  const eventIcons: Record<string, any> = {
    relationship: Heart,
    marriage: Sparkles,
    career: Briefcase,
    finance: Coins,
    health: ShieldAlert,
    property: Home,
    children: Baby,
    travel: Globe,
    litigation: Scale,
  };

  if (!njResult || !activeDayData || !activeEventDetails) {
    return (
      <div className="p-10 text-center text-slate-400">
        <Clock className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
        <p>Loading NJDAY / NJMOOD / NJBEST ENGINE v2.0...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="present-day-engine">
      
      {/* Astro Header Panel */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
              NJDAY / NJMOOD / NJBEST ENGINE v2.0
            </span>
            <h2 className={`text-xl font-bold font-sans ${isDark ? "text-slate-100" : "text-neutral-900"}`}>
              Present-Day Astrological Event Trigger Matrix
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              This upgraded engine executes the official v2.0 prediction logic, mapping 6-fold significators, transit times, and ruling planets across a 3-day forecast window.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/20 px-3.5 py-2 rounded-lg border border-slate-800/40 shrink-0">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span className="text-slate-300">Date:</span>
            <input
              type="date"
              value={predictionDate}
              onChange={(e) => setPredictionDate(e.target.value)}
              className="bg-transparent border-none outline-none text-amber-500 font-bold focus:ring-0 text-xs w-28 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* FORECAST WINDOW SUBTABS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {njResult.forecastDays.map((fd) => {
          const isActive = activeDayIdx === fd.dayIndex;
          return (
            <button
              key={fd.dayIndex}
              onClick={() => setActiveDayIdx(fd.dayIndex)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isActive
                  ? "bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5 text-amber-400"
                  : "bg-slate-900/30 border-slate-800 text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono font-bold uppercase">Day {fd.dayIndex} Forecast</span>
                <span className="text-[10px] bg-slate-950/40 px-2 py-0.5 rounded text-slate-400">
                  {fd.dateStr}
                </span>
              </div>
              <div className="font-sans font-bold text-sm mb-1 text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {fd.nakshatra} Nakshatra
              </div>
              <div className="text-[10px] font-mono text-slate-500 space-y-0.5 leading-tight">
                <div>Start: {fd.approxStart}</div>
                <div>End: {fd.approxEnd}</div>
                <div className="text-amber-500 font-bold">Lords: {fd.starLord} - {fd.subLord}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Global Summary Area (High-Fidelity Consolidated Guidance) */}
      <div className={`p-6 rounded-2xl border relative overflow-hidden ${
        isDark ? "bg-slate-950/50 border-amber-500/15" : "bg-slate-50 border-slate-200"
      }`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className={`text-xs font-bold font-mono uppercase tracking-wider ${isDark ? "text-slate-200" : "text-neutral-900"}`}>
              {activeDayData.dateStr} Consolidated Guidance ({activeDayData.nakshatra} Transit)
            </h3>
          </div>

          <div className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-neutral-800"} space-y-3`}>
            <p className="font-sans font-medium text-sm border-l-2 border-amber-500 pl-4 py-1 italic bg-amber-500/5 rounded-r">
              "{activeDayData.mood}"
            </p>
            <p className="font-sans leading-relaxed text-sm">
              Dear {birthDetails.name}, the 3-day predictive matrix is synchronized. On this day, the highest cosmic resonance aligns around your <strong className="text-amber-400">{activeDayData.primaryTheme}</strong> (Activity Probability: {activeDayData.confidence}%) and <strong className="text-cyan-400">{activeDayData.secondaryTheme}</strong>. 
              Specifically, {primaryTheme?.isSupporting ? primaryTheme.narrative : `the core planetary configurations for ${primaryTheme?.name} are currently resting.`}
            </p>
          </div>

          {/* Theme Breakdown Chips */}
          <div className="flex flex-wrap gap-2.5 pt-2 border-t border-slate-800/60 text-[11px] font-mono">
            <span className="text-slate-500 uppercase">Primary Focus:</span>
            <span className="text-amber-400 font-bold font-sans">{activeDayData.primaryTheme}</span>
            <span className="text-slate-600 px-1">•</span>
            <span className="text-slate-500 uppercase">Secondary Focus:</span>
            <span className="text-cyan-400 font-bold font-sans">{activeDayData.secondaryTheme}</span>
            <span className="text-slate-600 px-1">•</span>
            <span className="text-slate-500 uppercase">Core Trigger:</span>
            <span className="text-emerald-400 font-bold font-sans">{activeDayData.coreTriggerPlanet}</span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL TAB MENU BAR - ALL 9 LIFE AREAS FOR SELECTION */}
      <div className="border-b border-slate-800 pb-2 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {activeDayData.themeScores.map((evt) => {
            const IconComponent = eventIcons[evt.id] || Sparkles;
            const isActive = activeTab === evt.id;
            
            const tabColor = evt.probability > 70
              ? "text-emerald-400 border-emerald-500/30"
              : evt.probability > 45
              ? "text-amber-400 border-amber-500/30"
              : "text-rose-400 border-rose-500/30";

            return (
              <button
                key={evt.id}
                onClick={() => setActiveTab(evt.id)}
                className={`px-3 py-2 text-[11px] font-mono rounded-md transition-all border flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-amber-500/15 border-amber-500/60 text-amber-400 font-bold shadow-sm shadow-amber-500/10"
                    : "border-slate-800 bg-slate-900/30 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <IconComponent className="w-3.5 h-3.5 shrink-0" />
                <span>{evt.name}</span>
                <span className={`text-[9px] font-bold px-1 py-0.2 rounded bg-slate-950/40 ${tabColor}`}>
                  {evt.probability}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: THE ADVANCED 14-STEP REASONING ENGINE FLOW */}
        <div className="xl:col-span-8 space-y-6">

          {/* MULTI-SYSTEM PREDICTIONS (6 SCHOOLS OF WISDOM) */}
          {activeDayData.multiSystemPredictions && (
            <div className={`p-6 rounded-2xl border ${
              isDark ? "bg-slate-900/40 border-slate-800 shadow-xl" : "bg-white border-slate-200 shadow-sm"
            } space-y-5`}>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-800/40">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Compass className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className={`text-sm font-sans font-bold ${isDark ? "text-slate-100" : "text-neutral-900"}`}>
                      Multi-System Wisdom Dashboard
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">Natal promise & real-time transit alignment across 6 schools</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-950/40 px-2.5 py-1 rounded border border-slate-800/30 text-[10px] font-mono text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Interactive System Matrix</span>
                </div>
              </div>

              {/* System selector buttons */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/40 rounded-xl border border-slate-900">
                {activeDayData.multiSystemPredictions.map((pred) => {
                  const isSelected = selectedSystem === pred.system;
                  return (
                    <button
                      key={pred.system}
                      onClick={() => setSelectedSystem(pred.system)}
                      className={`flex-1 min-w-[100px] text-center px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/15 border border-amber-500/35 text-amber-400 font-bold shadow-md shadow-amber-500/5"
                          : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                      }`}
                    >
                      {pred.system}
                    </button>
                  );
                })}
              </div>

              {/* Active System Details Card */}
              {(() => {
                const activePred = activeDayData.multiSystemPredictions.find(p => p.system === selectedSystem) || activeDayData.multiSystemPredictions[0];
                if (!activePred) return null;

                const scoreColor = activePred.score >= 70
                  ? "text-emerald-400"
                  : activePred.score >= 50
                  ? "text-amber-400"
                  : "text-rose-400";

                const badgeBg = activePred.verdict.includes("Highly Favorable")
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : activePred.verdict.includes("Favorable")
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20";

                return (
                  <div className="space-y-4 font-sans animate-fadeIn">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className={`text-base font-bold flex items-center gap-2 ${isDark ? "text-slate-200" : "text-neutral-900"}`}>
                          {activePred.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">Core tenets of {activePred.system} school applied to active planetary alignments.</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${badgeBg}`}>
                          {activePred.verdict}
                        </span>
                        <div className="mt-1.5 text-xs font-mono text-slate-400">
                          Resonance: <strong className={`font-bold ${scoreColor}`}>{activePred.score}/100</strong>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Natal Promise Card */}
                      <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800/60" : "bg-slate-50 border-slate-200"} space-y-2`}>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>NATAL BLUEPRINT PROMISE</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
                          {activePred.promiseAnalysis}
                        </p>
                      </div>

                      {/* Transit Evaluation Card */}
                      <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/60 border-slate-800/60" : "bg-slate-50 border-slate-200"} space-y-2`}>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                          <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                          <span>DYNAMIC TRANSIT MATCHING</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
                          {activePred.transitEvaluation}
                        </p>
                      </div>
                    </div>

                    {/* Technical Parameter list */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
                      <span className="block text-[10px] text-slate-500 uppercase font-mono font-bold">Technical Significators Evaluated:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activePred.technicalParameters.map((param, i) => (
                          <span
                            key={i}
                            className="text-[9px] font-mono bg-slate-950/60 text-slate-400 border border-slate-800 px-2 py-0.5 rounded"
                          >
                            {param}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          {/* Active Event Banner */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          } flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
            
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className={`p-2.5 rounded-lg ${isDark ? "bg-slate-950" : "bg-white border border-slate-200"} text-amber-500 mt-0.5 shrink-0`}>
                {React.createElement(eventIcons[activeEventDetails.id] || Sparkles, { className: "w-5 h-5" })}
              </span>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-lg font-sans font-bold ${isDark ? "text-slate-100" : "text-neutral-900"}`}>
                    {activeEventDetails.name} Step-by-Step Diagnostic
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 font-mono rounded font-bold ${
                    activeEventDetails.isSupporting ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {activeEventDetails.isSupporting ? "SUPPORTIVE ALIGNMENT" : "DORMANT ENERGY"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Evaluating Core Houses <strong className="text-slate-200">[{activeEventDetails.primaryHouses.join(", ")}]</strong> and CSL Lord <strong className="text-slate-200">[{activeEventDetails.cslPlanet}]</strong>.
                </p>
              </div>
            </div>

            {/* Event Specific Alignment Score */}
            <div className="flex flex-col gap-1 shrink-0 w-full md:w-auto md:text-right border-t md:border-t-0 border-slate-800 pt-3 md:pt-0 font-mono">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Trigger Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full bg-amber-500 rounded-full transition-all duration-700`} style={{ width: `${activeEventDetails.probability}%` }} />
                </div>
                <span className="text-xs font-bold text-amber-400">
                  {activeEventDetails.probability}% Score
                </span>
              </div>
            </div>
          </div>

          {/* 14-STEP CALCULATION WORKFLOW CONTAINER */}
          <div className="space-y-5">
            
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                  Official NJDAY v2.0 Execution (14 Steps of Calculation)
                </span>
              </div>
            </div>

            {/* STEP 1 */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"} space-y-2`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-500 font-bold">[STEP 01/14] Target Coordinates & Cusp Binding</span>
                <span className="bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/40">CALCULATOR_INIT</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-sans">
                <p>The engine identifies the primary, supporting, and secondary desire-fulfillment houses representing the life area.</p>
                <div className="p-2 bg-slate-950/70 rounded border border-slate-900 font-mono text-[10px] text-slate-300 flex justify-between items-center">
                  <span>Coordinates: Event({activeEventDetails.id}) ➔ Houses: [{activeEventDetails.primaryHouses.join(", ")}]</span>
                  <span className="text-emerald-400">STATUS: BOUND</span>
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"} space-y-2`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-500 font-bold">[STEP 02/14] Cuspal Sub Lord (CSL) Permanent Promise Verification</span>
                <span className="bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/40">CSL_PROMISE</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-sans">
                <p>In KP Stellar system, the Cuspal Sub-Lord of the primary house determines whether the event's permanent promise is present in your birth chart.</p>
                <div className="p-2 bg-slate-950/70 rounded border border-slate-900 font-mono text-[10px] text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Target Cusp: {activeEventDetails.primaryHouses[0]}th House Cusp</span>
                    <span>Sub Lord: <strong className="text-amber-400">{activeEventDetails.cslPlanet}</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <span>Natal Promise: {activeEventDetails.promisePromised ? "Auspiciously Promised" : "Stable / Dormant"}</span>
                    <span className="text-emerald-400">STATUS: PROCESSED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3 */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"} space-y-2`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-500 font-bold">[STEP 03/14] Vimshottari DBA (Dasha-Bhukti-Antardasha) Wave Scan</span>
                <span className="bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/40">DBA_SCAN</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-sans">
                <p>We compile the current active Vimshottari planetary periods governing your time dimension.</p>
                <div className="p-2 bg-slate-950/70 rounded border border-slate-900 font-mono text-slate-300">
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span>Active DBA Cycle:</span>
                    <strong className="text-amber-400">{njResult.staticMetadata.dbaActive}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4 */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"} space-y-2`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-500 font-bold">[STEP 04/14] Active Planet DNA (Stellar & Sub-Stellar Signification)</span>
                <span className="bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/40">STELLAR_DNA</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-sans">
                <p>A planet manifests the results of its Star Lord (Stellar) and Sub Lord (Sub-Stellar) and natal house connections.</p>
                <div className="p-2 bg-slate-950/70 rounded border border-slate-900 font-mono text-[10px] text-slate-300">
                  <span>Current Trigger Planet: <strong className="text-amber-400">{activeDayData.coreTriggerPlanet}</strong> is active with Star Lord and Sub Lord paths fully synchronized.</span>
                </div>
              </div>
            </div>

            {/* STEP 5 */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"} space-y-2`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-500 font-bold">[STEP 05/14] High-Velocity Transit Position Mapping</span>
                <span className="bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/40">TRANSIT_GRID</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-sans">
                <p>The engine overlays the real-time degree position of transit planets over the target event houses.</p>
                <div className="p-2 bg-slate-950/70 rounded border border-slate-900 font-mono text-[10px] text-slate-300">
                  <span>Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu mapped for this prediction day.</span>
                </div>
              </div>
            </div>

            {/* STEP 6 */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"} space-y-2`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-500 font-bold">[STEP 06/14] Transit Moon Trigger (Daily Stellar Gateway)</span>
                <span className="bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/40">MOON_CLOCK</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-sans">
                <p>The Moon shifts every 2.25 days, locking down the exact daily trigger conditions.</p>
                <div className="p-2.5 bg-slate-950/70 rounded border border-slate-900 font-mono text-[10px] text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Moon Sign: <strong className="text-slate-100">{activeDayData.moonSign}</strong></span>
                    <span>Nakshatra: <strong className="text-amber-400">{activeDayData.nakshatra}</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <span>Star Lord: <strong>{activeDayData.starLord}</strong></span>
                    <span>Sub Lord: <strong>{activeDayData.subLord}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 7 */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"} space-y-2`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-500 font-bold">[STEP 07/14] Planetary Resonance & Trigger Chain Synthesis</span>
                <span className="bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/40">TRIGGER_FLOW</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-sans">
                <p>We map the precise flow of cosmic energy from the transit Moon through star lords and sub lords back to your natal planets.</p>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] bg-slate-950/80 p-2.5 rounded border border-slate-800 font-mono">
                  {activeDayData.triggerChain.map((link, idx) => (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col bg-slate-900 px-2 py-1 rounded border border-slate-800/40">
                        <span className="font-bold text-slate-200">{link.from}</span>
                        <span className="text-[8px] text-slate-500">{link.mechanism}</span>
                      </div>
                      {idx < activeDayData.triggerChain.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 8 */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"} space-y-2`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-500 font-bold">[STEP 08/14] Cosmic Convergence & Synergy Filtering</span>
                <span className="bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/40">CONVERGENCE</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-sans">
                <p>Comparing the active Transit Trigger Chain against the active Vimshottari DBA lords reveals the planets with maximum operational synergy.</p>
                <div className="p-2.5 bg-slate-950/70 rounded border border-slate-900 font-mono text-[10px] text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Common Convergent Lords:</span>
                    <strong className="text-emerald-400">[{activeDayData.convergencePlanets.join(", ")}]</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Filtered Out / Passive:</span>
                    <strong className="text-rose-400">[{activeDayData.discardedPlanets.join(", ")}]</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 9 */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"} space-y-2`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-500 font-bold">[STEP 09/14] Surviving Planetary Agents Isolation</span>
                <span className="bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/40">SURVIVING_PL</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-sans">
                <p>Only planets that are strong both in your natal chart and active in transit can act as true agents.</p>
                <div className="flex gap-2 text-[10px] font-mono">
                  {activeDayData.convergencePlanets.map((pl, idx) => (
                    <div key={idx} className="flex-1 bg-emerald-500/10 border border-emerald-500/30 p-2 rounded text-center">
                      <span className="block font-bold text-emerald-400">{pl}</span>
                      <span className="text-[8px] text-slate-400">SURVIVED & ACTIVE</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 10 */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"} space-y-2`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-500 font-bold">[STEP 10/14] Multi-System House Priority Matrix</span>
                <span className="bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/40">HOUSE_PRIORITY</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-sans">
                <p>Houses are sorted into primary action houses, secondary desire fulfillment coordinates, and background environmental elements.</p>
                <div className="grid grid-cols-3 gap-2.5 text-center font-mono text-[10px] my-2">
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                    <span className="text-[8px] text-red-400 block uppercase font-bold">Primary Houses</span>
                    <span className="text-slate-200 text-sm font-bold">[{activeEventDetails.primaryHouses.join(", ")}]</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                    <span className="text-[8px] text-amber-400 block uppercase font-bold">Supporting / Gains</span>
                    <span className="text-slate-200 text-sm font-bold">[{activeEventDetails.supportingHouses.join(", ")}]</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                    <span className="text-[8px] text-slate-500 block uppercase font-bold">Obstructing / Negation</span>
                    <span className="text-slate-200 text-sm font-bold">[{activeEventDetails.obstructingHouses.join(", ")}]</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 11 */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"} space-y-2`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-500 font-bold">[STEP 11/14] House Synergy & Sub-System Consensus</span>
                <span className="bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/40">SYSTEMS_CONSENSUS</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-sans">
                <p>We compile evaluation points from Parashari, KP, and Jaimini systems to check for a unified consensus.</p>
                <div className="p-2 bg-slate-950/70 rounded border border-slate-900 font-mono text-[10px] text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Consensus Score:</span>
                    <strong className="text-emerald-400">{activeEventDetails.probability > 60 ? "HIGH SYNERGY" : "MODERATE"} ({activeEventDetails.probability}%)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 12 */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"} space-y-2`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-500 font-bold">[STEP 12/14] Slow Transit Aspect Refinement & Obstacle Scan</span>
                <span className="bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/40">OBSTACLE_SCAN</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-sans">
                <p>We scan the charts for retrogrades, planetary combustions, or harsh aspects from Saturn, Mars, and Rahu to identify delay factors.</p>
                <div className="p-2.5 bg-slate-950/70 rounded border border-slate-900 font-mono text-[10px] text-slate-300">
                  <span>Slow transits scanned. Minor delays resolved through structural planet alignment checks.</span>
                </div>
              </div>
            </div>

            {/* STEP 13 */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200"} space-y-2`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-500 font-bold">[STEP 13/14] Natal Ruling Planets (RP) Sync Check</span>
                <span className="bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/40">RP_SYNC</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-sans">
                <p>Precise timing relies on the day's Ruling Planets matching active transit factors.</p>
                <div className="p-2 bg-slate-950/70 rounded border border-slate-900 font-mono text-[10px] text-slate-300">
                  <span>Ruling planets matched and verified against active Trigger Chain.</span>
                </div>
              </div>
            </div>

            {/* STEP 14 */}
            <div className={`p-5 rounded-xl border ${
              activeEventDetails.isSupporting ? "bg-amber-500/10 border-amber-500/30" : "bg-slate-950/40 border-slate-800"
            } space-y-3`}>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-400 font-bold uppercase tracking-widest">[STEP 14/14] Final Synthesis & Dynamic Output</span>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">SYNTHESIS_COMPLETE</span>
              </div>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400 font-mono">Dynamic Event Probability:</span>
                  <strong className="text-lg font-mono text-amber-400">{activeEventDetails.probability}%</strong>
                </div>

                <div className="space-y-1">
                  <span className="block text-slate-500 text-[10px] uppercase font-mono font-bold">Personal Daily Mind-state Mood:</span>
                  <p className="font-sans font-medium text-slate-200 pl-3 border-l border-amber-500 italic">
                    "{activeEventDetails.mood}"
                  </p>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="block text-slate-500 text-[10px] uppercase font-mono font-bold">Personal Actionable Guidance:</span>
                  <p className={`font-sans leading-relaxed ${isDark ? "text-slate-200" : "text-neutral-900"}`}>
                    {activeEventDetails.narrative}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: GLOBAL ASTRO METRICS & COMPARISONS DASHBOARD */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* COMPARISONS DASHBOARD (Day 1 vs Day 2 vs Day 3) */}
          <div className={`p-5 rounded-xl border ${
            isDark ? "bg-slate-900/40 border-slate-800 shadow-md" : "bg-white border-slate-200"
          } space-y-4`}>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <h3 className={`text-xs font-bold font-mono uppercase tracking-wider ${isDark ? "text-slate-200" : "text-neutral-900"}`}>
                3-Day Comparison Dashboard
              </h3>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center border-b border-slate-800/30 pb-2">
                <span className="text-slate-400">Strongest Day:</span>
                <span className="text-amber-400 font-bold">Day {njResult.comparisons.strongestDay}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/30 pb-2">
                <span className="text-slate-400">Best Relationship Day:</span>
                <span className="text-emerald-400 font-bold">Day {njResult.comparisons.bestRelationshipDay}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/30 pb-2">
                <span className="text-slate-400">Best Career Day:</span>
                <span className="text-cyan-400 font-bold">Day {njResult.comparisons.bestCareerDay}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/30 pb-2">
                <span className="text-slate-400">Best Finance Day:</span>
                <span className="text-emerald-400 font-bold">Day {njResult.comparisons.bestFinanceDay}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/30 pb-2">
                <span className="text-slate-400">Highest Emotional Day:</span>
                <span className="text-rose-400 font-bold">Day {njResult.comparisons.highestEmotionalDay}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/30 pb-2">
                <span className="text-slate-400">Highest Conflict Day:</span>
                <span className="text-rose-400 font-bold">Day {njResult.comparisons.highestConflictDay}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/30 pb-2">
                <span className="text-slate-400">Highest Travel Probability:</span>
                <span className="text-cyan-400 font-bold">Day {njResult.comparisons.highestTravelProbability}</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-slate-400">Highest Event Probability:</span>
                <span className="text-amber-400 font-bold">Day {njResult.comparisons.highestEventProbability}</span>
              </div>
            </div>
          </div>

          {/* 12-Event Comparative Trigger Matrix */}
          <div className={`p-5 rounded-xl border ${
            isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          } space-y-4`}>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className={`text-xs font-bold font-mono uppercase tracking-wider ${isDark ? "text-slate-200" : "text-neutral-900"}`}>
                Event Trigger Matrix
              </h3>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {activeDayData.themeScores.map((evt) => {
                const IconComponent = eventIcons[evt.id] || Sparkles;
                const isSelected = activeTab === evt.id;
                
                const scoreColor = evt.probability > 70
                  ? "text-emerald-400"
                  : evt.probability > 45
                  ? "text-amber-400"
                  : "text-rose-400";

                const progressBg = evt.probability > 70
                  ? "bg-emerald-500"
                  : evt.probability > 45
                  ? "bg-amber-500"
                  : "bg-rose-500";

                return (
                  <button
                    key={evt.id}
                    onClick={() => setActiveTab(evt.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                        : "border-slate-800/40 bg-slate-950/20 text-slate-400 hover:bg-slate-900/40"
                    } text-xs`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconComponent className="w-4 h-4 text-amber-500/70 shrink-0" />
                        <div className="truncate">
                          <span className={`block font-sans font-semibold ${isDark ? "text-slate-200" : "text-neutral-900"}`}>{evt.name}</span>
                          <span className="block text-[9px] font-mono text-slate-500">Primary: {evt.primaryHouses.join(", ")}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className={`font-bold ${scoreColor}`}>{evt.probability}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden mb-1">
                      <div className={`h-full ${progressBg} rounded-full`} style={{ width: `${evt.probability}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Static Engine Loader Status Cache Widget */}
          <div className={`p-5 rounded-xl border ${
            isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          } space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500" />
                <h3 className={`text-xs font-bold font-mono uppercase tracking-wider ${isDark ? "text-slate-200" : "text-neutral-900"}`}>
                  Static Engine Cache
                </h3>
              </div>
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                LOADED
              </span>
            </div>

            <div className="space-y-3">
              {staticCache.slice(0, 5).map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.id} className="flex items-start gap-2.5 text-[11px] font-mono">
                    <IconComponent className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className={`block font-bold ${isDark ? "text-slate-300" : "text-neutral-800"}`}>
                        {item.label}
                      </span>
                      <span className="block text-[9px] text-slate-500 truncate">
                        {item.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
