import React, { useState } from "react";
import { 
  BookOpen, 
  Cpu, 
  Sliders, 
  Activity, 
  Terminal, 
  ArrowRight, 
  Shield, 
  Zap, 
  TrendingUp, 
  Layers, 
  Compass, 
  Clock, 
  Database,
  HelpCircle,
  Sparkles,
  Info
} from "lucide-react";

interface EngineGuideProps {
  isDark: boolean;
}

export default function EngineGuide({ isDark }: EngineGuideProps) {
  const [activeTab, setActiveTab] = useState<"engine" | "compiler" | "playground" | "architecture">("engine");
  
  // Interactive simulator state
  const [selectedPlanet, setSelectedPlanet] = useState<string>("Jupiter");
  const [selectedDashaPlanet, setSelectedDashaPlanet] = useState<string>("Jupiter");
  const [selectedBhuktiPlanet, setSelectedBhuktiPlanet] = useState<string>("Mercury");
  const [transitHouse, setTransitHouse] = useState<number>(10);
  const [transitStrength, setTransitStrength] = useState<number>(85);

  const containerStyle = isDark 
    ? "bg-slate-900/60 border-indigo-500/20 text-slate-100" 
    : "bg-white border-neutral-200 text-neutral-800 shadow-sm";
  
  const cardStyle = isDark 
    ? "bg-slate-950/60 border-slate-800 text-slate-100" 
    : "bg-neutral-50 border-neutral-200 text-neutral-800";

  const inputStyle = isDark
    ? "bg-slate-950 border-slate-800 text-slate-200 focus:ring-amber-500"
    : "bg-white border-neutral-300 text-neutral-800 focus:ring-amber-500";

  // Simulation calculations
  const calculateSimulatedMetrics = () => {
    // Vimshottari period weights
    let dashaWeight = selectedPlanet === selectedDashaPlanet ? 45 : 0;
    let bhuktiWeight = selectedPlanet === selectedBhuktiPlanet ? 25 : 0;
    let fallbackWeight = (dashaWeight === 0 && bhuktiWeight === 0) ? 10 : 0;
    const periodWeight = dashaWeight + bhuktiWeight + fallbackWeight;

    // Transit convergence
    const transitBase = transitStrength * 0.4;
    const houseBonus = [1, 5, 9, 10, 11].includes(transitHouse) ? 15 : 5;
    const transitScore = Math.round(transitBase + houseBonus);

    // Total convergence trigger score
    const totalScore = Math.min(100, Math.round((periodWeight * 0.5) + (transitScore * 0.5) + 15));
    
    // Categorization
    let evaluationVerdict = "Neutral";
    if (totalScore >= 75) evaluationVerdict = "Highly Active / Triggered";
    else if (totalScore >= 55) evaluationVerdict = "Supporting Activation";
    else if (totalScore < 35) evaluationVerdict = "Dormant / Obstructed";

    // House Engines Allocation
    const moodScore = Math.min(100, Math.round(totalScore * ( [1, 3, 4, 5, 6, 12].includes(transitHouse) ? 1.2 : 0.8 )));
    const behaviourScore = Math.min(100, Math.round(totalScore * ( [2, 3, 6, 7, 10, 11].includes(transitHouse) ? 1.2 : 0.8 )));

    return {
      periodWeight,
      transitScore,
      totalScore,
      evaluationVerdict,
      moodScore,
      behaviourScore
    };
  };

  const sim = calculateSimulatedMetrics();

  return (
    <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`}>
      {/* Header Banner */}
      <div className="border-b border-indigo-500/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-sans font-semibold flex items-center gap-2 text-amber-500 dark:text-amber-400">
            <Cpu className="w-6 h-6 animate-pulse" />
            Predictive Engine & Astrological Rulebook Manual
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Understanding the real-time Vedic & KP computational core, Vimshottari period weightings, and Rules Terminal compilation.
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-slate-950/40 p-1 rounded-xl border border-indigo-500/10 shrink-0 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("engine")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all font-sans font-medium flex items-center gap-1.5 shrink-0 ${
              activeTab === "engine"
                ? "bg-amber-500 text-slate-950 shadow-md font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            1. Predictive Core
          </button>
          <button
            onClick={() => setActiveTab("compiler")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all font-sans font-medium flex items-center gap-1.5 shrink-0 ${
              activeTab === "compiler"
                ? "bg-amber-500 text-slate-950 shadow-md font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            2. Rules Terminal
          </button>
          <button
            onClick={() => setActiveTab("playground")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all font-sans font-medium flex items-center gap-1.5 shrink-0 ${
              activeTab === "playground"
                ? "bg-amber-500 text-slate-950 shadow-md font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            3. Live Simulator
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all font-sans font-medium flex items-center gap-1.5 shrink-0 ${
              activeTab === "architecture"
                ? "bg-amber-500 text-slate-950 shadow-md font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            4. Code Mapping
          </button>
        </div>
      </div>

      {/* Tab Content 1: Predictive Engine */}
      {activeTab === "engine" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
              <div className="flex items-center gap-2 text-amber-400 font-sans font-semibold text-sm">
                <Compass className="w-4 h-4" />
                Vimshottari Period Weights
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The engine utilizes a hierarchical scoring matrix for Vimshottari Dasha components. The currently active planet objects inherit weights proportionally:
              </p>
              <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc font-mono">
                <li>Mahadasha (MD): 45% weight</li>
                <li>Bhukti Lord (AD): 25% weight</li>
                <li>Antardasha (PD): 15% weight</li>
                <li>Sookshma/Prana: 15% weight</li>
              </ul>
            </div>

            <div className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
              <div className="flex items-center gap-2 text-emerald-400 font-sans font-semibold text-sm">
                <TrendingUp className="w-4 h-4" />
                Transit Convergence
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Real-time transit coordinates (such as current Moon nakshatra, star lord, and sub lord) are correlated against the natal birth particulars. When a transit lord matches an active Vimshottari period planet, a high **Convergence Score** is triggered.
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
              <div className="flex items-center gap-2 text-indigo-400 font-sans font-semibold text-sm">
                <Shield className="w-4 h-4" />
                Domain Exclusion Rule
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Major, long-term life events (e.g., Marriage, Promotions, Childbirth, Court Litigation, Property Purchase, and Foreign Settlement) are strictly excluded from daily forecasts. Daily metrics focus strictly on transient moods and behaviors.
              </p>
            </div>
          </div>

          <div className={`p-5 rounded-xl border ${cardStyle} space-y-4`}>
            <h4 className="text-sm font-sans font-semibold text-amber-500 flex items-center gap-1">
              <Layers className="w-4 h-4" />
              Dynamic Theme & House Activation Blocks
            </h4>
            <p className="text-xs text-slate-300">
              The engine distributes converged values across two primary output clusters to render highly personalized behavioral charts:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-slate-950/40 rounded-lg border border-slate-900 space-y-2">
                <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider block">🧠 THE MOOD BLOCK</span>
                <p className="text-xs text-slate-300">
                  Calculates emotional stability, internal wellness, and cognitive states. It is evaluated by processing planets signifying:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[1, 3, 4, 5, 6, 12].map((h) => (
                    <span key={h} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
                      House {h}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Triggers emotional spikes, meditative periods (House 4/12), or stress vectors (House 6/12).
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/40 rounded-lg border border-slate-900 space-y-2">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider block">💼 THE BEHAVIOUR BLOCK</span>
                <p className="text-xs text-slate-300">
                  Calculates action readiness, productivity, social interactive traits, and public drive. It is evaluated via:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[2, 3, 6, 7, 10, 11].map((h) => (
                    <span key={h} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
                      House {h}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Triggers high productivity focus (House 10/11), communication drives (House 3), or transactional events (House 7/2).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Rules Compiler */}
      {activeTab === "compiler" && (
        <div className="space-y-6">
          <div className={`p-5 rounded-xl border ${cardStyle} space-y-3`}>
            <h4 className="text-sm font-sans font-semibold text-amber-500 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" />
              How the Rules Terminal Processes Logic Gates
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              The **Rules Terminal** compiles precise astrological logic gates that direct the predictive engine. Rather than relying on rigid calculations, the system parses structural rules defined in standard markdown files:
            </p>
            
            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-900 font-mono text-xs space-y-2 text-slate-300">
              <div className="text-[10px] text-slate-500">// SYNTAX FORMAT</div>
              <div>*   **System Name Rules:**</div>
              <div className="pl-4 text-amber-400">
                *   `Condition:` [Trigger logic matching cusps, planets, lords] ➔ **Output Status:** `[Interpretation Verdict]`
              </div>
              <div className="border-t border-slate-900 my-2 pt-2 text-[10px] text-slate-500">// EXAMPLE GATE IN COMPILED MARKDOWN</div>
              <div>*   **KP Stellar Rules:**</div>
              <div className="pl-4">
                *   `Condition:` <span className="text-emerald-400">cusp_7.sub_lord === "Jupiter"</span> ➔ **Output Status:** <span className="text-amber-300">`Auspicious, highly stable marriage union promised.`</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
              <h5 className="text-xs font-bold font-mono text-slate-400 uppercase">Interactive Compilation</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you click **"& Push Rules"** in the Rules Terminal, the compiler serializes your structured modifications, writes them directly to `/documents/master_astro_handbook.md`, and synchronizes the change in real-time across the client and server engines.
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
              <h5 className="text-xs font-bold font-mono text-slate-400 uppercase">Automated API Evaluation</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                During each birth chart evaluation, the backend engine processes the compiled rules block, parses the condition parameters (e.g., finding the sub-lord of the 7th house cusp or planet strengths), and outputs the exact matches into the Event Book.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Live Simulator Playground */}
      {activeTab === "playground" && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/15">
            <p className="text-xs text-slate-300 leading-relaxed flex gap-2 items-start">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>System Simulator:</strong> Adjust the interactive sliders and parameters below to see in real-time how the Predictive Core calculates planet weightings, integrates transit houses, and divides converged output scores into the <strong>Mood</strong> and <strong>Behaviour</strong> blocks.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Controls */}
            <div className="md:col-span-5 space-y-4">
              <div className={`p-4 rounded-xl border ${cardStyle} space-y-4`}>
                <h5 className="text-xs font-bold font-mono text-slate-400 uppercase border-b border-indigo-500/10 pb-2">Simulator inputs</h5>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Target Planet to Analyze</label>
                    <select 
                      value={selectedPlanet} 
                      onChange={(e) => setSelectedPlanet(e.target.value)}
                      className={`w-full p-2 text-xs rounded-lg border ${inputStyle}`}
                    >
                      {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Active Dasha Lord</label>
                      <select 
                        value={selectedDashaPlanet} 
                        onChange={(e) => setSelectedDashaPlanet(e.target.value)}
                        className={`w-full p-2 text-xs rounded-lg border ${inputStyle}`}
                      >
                        {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Active Bhukti Lord</label>
                      <select 
                        value={selectedBhuktiPlanet} 
                        onChange={(e) => setSelectedBhuktiPlanet(e.target.value)}
                        className={`w-full p-2 text-xs rounded-lg border ${inputStyle}`}
                      >
                        {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Current Transit House: Cusp {transitHouse}</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="12" 
                      value={transitHouse} 
                      onChange={(e) => setTransitHouse(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                      <span>Cusp 1</span>
                      <span>Cusp 6</span>
                      <span>Cusp 12</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Transit Strength Score: {transitStrength}%</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={transitStrength} 
                      onChange={(e) => setTransitStrength(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                      <span>Weak (10)</span>
                      <span>Average (50)</span>
                      <span>Exalted (100)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Output */}
            <div className="md:col-span-7 space-y-4">
              <div className={`p-5 rounded-xl border ${cardStyle} h-full space-y-4`}>
                <h5 className="text-xs font-bold font-mono text-slate-400 uppercase border-b border-indigo-500/10 pb-2 flex justify-between items-center">
                  <span>CONVERGED COMPUTATION OUTPUT</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold">LIVE METRIC</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Period Weight */}
                  <div className="p-3 bg-slate-950/45 rounded-lg border border-slate-900 space-y-1">
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Period (Vimshottari) Weight</div>
                    <div className="text-xl font-mono font-bold text-amber-400">{sim.periodWeight}%</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      {selectedPlanet === selectedDashaPlanet ? "Mahadasha Match (+45)" : ""}
                      {selectedPlanet === selectedBhuktiPlanet ? " & Bhukti Match (+25)" : ""}
                      {selectedPlanet !== selectedDashaPlanet && selectedPlanet !== selectedBhuktiPlanet ? "Standard background lord weight (+10)" : ""}
                    </div>
                  </div>

                  {/* Transit Score */}
                  <div className="p-3 bg-slate-950/45 rounded-lg border border-slate-900 space-y-1">
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Transit Score</div>
                    <div className="text-xl font-mono font-bold text-emerald-400">{sim.transitScore}%</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      Strength Base: {Math.round(transitStrength * 0.4)}% + House Cusp {transitHouse} Bonus: {[1, 5, 9, 10, 11].includes(transitHouse) ? "+15" : "+5"}
                    </div>
                  </div>
                </div>

                {/* Unified Convergence Trigger Score */}
                <div className="p-4 bg-slate-950/80 rounded-lg border border-amber-500/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-sans font-semibold text-slate-200">Trigger score Convergence</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] font-mono font-bold text-amber-400 uppercase border border-slate-800">
                      {sim.evaluationVerdict}
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-amber-500 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${sim.totalScore}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Total Convergence Trigger Score:</span>
                    <span className="font-bold text-amber-400">{sim.totalScore} / 100</span>
                  </div>
                </div>

                {/* Block allocations */}
                <div className="space-y-3">
                  <h6 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">REALLOCATED TO HOUSE OUTPUT ENGINES</h6>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-pink-500/5 border border-pink-500/10 rounded-lg">
                      <div className="flex justify-between text-[11px] font-bold text-pink-400 font-mono mb-1">
                        <span>🧠 MOOD BLOCK</span>
                        <span>{sim.moodScore}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-pink-500 h-1.5" style={{ width: `${sim.moodScore}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1.5">
                        {[1, 3, 4, 5, 6, 12].includes(transitHouse) 
                          ? "Highly active (Cusp match gives 120% amplification)" 
                          : "Moderate activation (80% allocation)"}
                      </p>
                    </div>

                    <div className="p-3 bg-sky-500/5 border border-sky-500/10 rounded-lg">
                      <div className="flex justify-between text-[11px] font-bold text-sky-400 font-mono mb-1">
                        <span>💼 BEHAVIOUR BLOCK</span>
                        <span>{sim.behaviourScore}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-sky-500 h-1.5" style={{ width: `${sim.behaviourScore}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1.5">
                        {[2, 3, 6, 7, 10, 11].includes(transitHouse) 
                          ? "Highly active (Cusp match gives 120% amplification)" 
                          : "Moderate activation (80% allocation)"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Code Architecture & Files Mapping */}
      {activeTab === "architecture" && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${cardStyle} space-y-3`}>
            <h4 className="text-sm font-sans font-semibold text-amber-500">File Directory Map & Engine Connections</h4>
            <p className="text-xs text-slate-300">
              The astrological subsystem and rules compiler interface rely on these key files within the repository.
            </p>

            <div className="border border-indigo-500/10 rounded-lg overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-indigo-500/10 text-slate-400 font-mono text-[10px] text-left uppercase">
                    <th className="p-2.5">FILE PATH</th>
                    <th className="p-2.5">MODULE NAME</th>
                    <th className="p-2.5">FUNCTION & RESPONSIBILITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                  <tr>
                    <td className="p-2.5 text-amber-400">/src/lib/njEngine.ts</td>
                    <td className="p-2.5">Predictive Engine</td>
                    <td className="p-2.5 text-slate-400 font-sans">Core forecast engine. Gathers dasha period weights and maps them to transits.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-amber-400">/src/components/RulesTerminal.tsx</td>
                    <td className="p-2.5">Rules Compiler UI</td>
                    <td className="p-2.5 text-slate-400 font-sans">Provides the interactive spreadsheet view to edit and compile rules.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-amber-400">/documents/master_astro_handbook.md</td>
                    <td className="p-2.5">Rulebook Storage</td>
                    <td className="p-2.5 text-slate-400 font-sans">Markdown file storing all logical conditions and output statuses.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-amber-400">/server.ts</td>
                    <td className="p-2.5">REST Controller</td>
                    <td className="p-2.5 text-slate-400 font-sans">Handles handbook read (GET) and write (POST) queries securely.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-950/40 rounded-lg border border-slate-900 flex gap-3.5">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-200">Rules Parsing Workflow:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Rules Terminal (Frontend) ➔ GET /api/astrology/rules-handbook ➔ Parses Markdown ➔ Renders Rules rows ➔ Modify ➔ Serializes Markdown ➔ POST to save ➔ Commits to git.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
