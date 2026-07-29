/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Cpu, 
  ToggleLeft, 
  ToggleRight, 
  Zap, 
  Shield, 
  Activity, 
  Grid, 
  CheckCircle, 
  FileCode, 
  Clock, 
  Compass,
  Play,
  RotateCcw,
  Sparkles
} from "lucide-react";

export interface PluginSpec {
  id: string;
  name: string;
  category: "Systems" | "Engines" | "Research";
  iconName: string;
  description: string;
  status: "Active" | "Inactive";
  supportedMethods: string[];
}

export const INITIAL_PLUGINS: PluginSpec[] = [
  {
    id: "kp_stellar",
    name: "KP Stellar",
    category: "Systems",
    iconName: "Compass",
    description: "Krishnamurti Paddhati system emphasizing sub-lords and planetary star influences.",
    status: "Inactive",
    supportedMethods: ["kp_sub_lord", "kp_cusp_calculation", "kp_significators"]
  },
  {
    id: "parashari",
    name: "Parashari Core",
    category: "Systems",
    iconName: "Zap",
    description: "Comprehensive classical Sage Parashara principles including planetary aspects and avasthas.",
    status: "Inactive",
    supportedMethods: ["parashara_aspects", "avasthas_planetary", "baladi_avastha"]
  },
  {
    id: "jaimini",
    name: "Jaimini Sutras",
    category: "Systems",
    iconName: "Grid",
    description: "Chara dashas, Karakamshas, and dynamic aspectual analysis based on Sage Jaimini.",
    status: "Inactive",
    supportedMethods: ["jaimini_aspects", "chara_dasha", "karakamsha_lagnas"]
  },
  {
    id: "western",
    name: "Western Placidus",
    category: "Systems",
    iconName: "Activity",
    description: "Tropical coordinates, Placidus house cusp models, and standard circular wheel charts.",
    status: "Inactive",
    supportedMethods: ["tropical_longitude", "placidus_cusps", "synastry_aspects"]
  },
  {
    id: "mood_engine",
    name: "Mood & Vibe Engine",
    category: "Engines",
    iconName: "Sparkles",
    description: "Synthesizes Moon transit metrics to gauge individual psychological tendencies.",
    status: "Inactive",
    supportedMethods: ["vibe_score_daily", "mindfulness_gaps"]
  },
  {
    id: "event_engine",
    name: "Vedic Event Engine",
    category: "Engines",
    iconName: "Clock",
    description: "Evaluates planetary coordinates to forecast significant life event timings.",
    status: "Inactive",
    supportedMethods: ["event_timeline_forecast", "remedial_alignments"]
  },
  {
    id: "workflow_engine",
    name: "Vedic Workflow Router",
    category: "Engines",
    iconName: "Shield",
    description: "Orchestrates multi-chart comparisons for auspicious institutional workflows.",
    status: "Inactive",
    supportedMethods: ["workflow_clearance_score", "electional_windows"]
  },
  {
    id: "research",
    name: "Deep Research Module",
    category: "Research",
    iconName: "FileCode",
    description: "Performs cohort-level analysis against 10,000+ local birth records to identify statistical alignments.",
    status: "Inactive",
    supportedMethods: ["statistical_yoga_frequency", "birth_rectification_iterators"]
  }
];

interface PluginManagerProps {
  plugins: PluginSpec[];
  onTogglePlugin: (id: string) => void;
  onResetPlugins: () => void;
  isDarkTheme: boolean;
}

export default function PluginManager({ 
  plugins, 
  onTogglePlugin, 
  onResetPlugins,
  isDarkTheme 
}: PluginManagerProps) {
  const [selectedPluginId, setSelectedPluginId] = useState<string>("kp_stellar");
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([
    "PluginManager initialized core registries...",
    "Listening for hot-swappable DLL / WASM entrypoints...",
    "Dynamic scope mapping ready."
  ]);
  const [runningSimulation, setRunningSimulation] = useState<boolean>(false);

  const selectedPlugin = plugins.find(p => p.id === selectedPluginId) || plugins[0];

  const handleSimulateLoad = (id: string) => {
    setRunningSimulation(true);
    setSimulatedLogs(prev => [...prev, `[INIT] Querying plugin metadata for ${id}...`]);
    
    setTimeout(() => {
      setSimulatedLogs(prev => [
        ...prev,
        `[RESOLVE] Mapping entrypoints for ${id}...`,
        `[COMPILE] Linking dynamic symbols: [${selectedPlugin.supportedMethods.join(", ")}]`,
        `[SUCCESS] Hooked ${id} cleanly into client-side routing graph! Ready to render.`
      ]);
      setRunningSimulation(false);
      onTogglePlugin(id);
    }, 1200);
  };

  return (
    <div className={`rounded-2xl border p-6 shadow-xl space-y-6 ${
      isDarkTheme 
        ? "bg-slate-900/60 border-indigo-500/20 text-slate-100" 
        : "bg-white border-neutral-200 text-neutral-800"
    }`} id="plugin-manager-widget">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5 border-indigo-500/10">
        <div>
          <h3 className="text-lg font-sans font-medium text-amber-500 flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Dynamic Plugin Registry
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Activate, load, and test hot-swappable Vedic calculation modules. Powered by JHora Decoupled API hooks.
          </p>
        </div>
        <button
          onClick={onResetPlugins}
          className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg border transition-all ${
            isDarkTheme 
              ? "bg-slate-950 border-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:bg-slate-900" 
              : "bg-neutral-100 border-neutral-300 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          Disable All Plugins
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Plugin List */}
        <div className="lg:col-span-5 space-y-2.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Available Modules
          </span>
          <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
            {plugins.map((plugin) => {
              const isActive = plugin.status === "Active";
              const isSelected = plugin.id === selectedPluginId;
              
              return (
                <button
                  key={plugin.id}
                  onClick={() => setSelectedPluginId(plugin.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                      : isDarkTheme
                        ? "bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/30"
                        : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100/70"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold block truncate">
                      {plugin.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Category: {plugin.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                      isActive
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-slate-800/60 text-slate-400 border-slate-700/60"
                    }`}>
                      {plugin.status}
                    </span>
                    {isActive ? (
                      <ToggleRight className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Details & Sandboxed Sandbox Logs */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`p-4 rounded-xl border ${
            isDarkTheme ? "bg-slate-950/60 border-slate-800" : "bg-neutral-50 border-neutral-200"
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-amber-500">{selectedPlugin.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {selectedPlugin.description}
                </p>
              </div>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                selectedPlugin.status === "Active" 
                  ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}>
                {selectedPlugin.status === "Active" ? "READY" : "DORMANT"}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-indigo-500/5 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                Supported Calculation Methods:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedPlugin.supportedMethods.map((m) => (
                  <span 
                    key={m} 
                    className="text-[9px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/15 px-2 py-0.5 rounded"
                  >
                    {m}()
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                disabled={runningSimulation}
                onClick={() => handleSimulateLoad(selectedPlugin.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  selectedPlugin.status === "Active"
                    ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-sans shadow-lg shadow-amber-500/5"
                } disabled:opacity-50`}
              >
                {runningSimulation ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    Registering Symbols...
                  </>
                ) : selectedPlugin.status === "Active" ? (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    Deactivate Plugin
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Compile & Hotload Plugin
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Simulated Compile Console */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Compile & Sandbox Monitor
            </span>
            <div className="bg-black/90 rounded-xl p-3 border border-slate-800/80 font-mono text-[10px] leading-relaxed text-emerald-400 h-32 overflow-y-auto divide-y divide-slate-900/40">
              {simulatedLogs.map((log, i) => (
                <div key={i} className="py-1">
                  <span className="text-slate-600 shrink-0 mr-1.5">[{i + 1}]</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
