import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Edit2, ArrowUp, ArrowDown, RotateCcw, Save, X, Settings2, Play, Info
} from "lucide-react";

export interface EngineStep {
  id: string;
  stepNumber: string; // Step Name or Number, e.g. "STEP 01"
  module: string;     // Engine / Module Name
  whatToDo: string;   // Description of what the step does
}

const DEFAULT_STEPS: EngineStep[] = [
  { id: "1", stepNumber: "STEP 01", module: "Target Coordinates & Event Binding", whatToDo: "Load the selected Event from the Event Book. Identify Primary, Supporting, Obstructing Houses and the Main CSL." },
  { id: "2", stepNumber: "STEP 02", module: "Natal Promise Verification", whatToDo: "Execute all Rule Book natal rules (KP, Parashari, Jaimini, Custom). Determine whether the event is promised." },
  { id: "3", stepNumber: "STEP 03", module: "Vimshottari DBA Scan", whatToDo: "Read current MD, AD, PD, SD. Check whether active Dasha lords support the promised event." },
  { id: "4", stepNumber: "STEP 04", module: "Active Planet Resolution", whatToDo: "Resolve every active DBA planet's complete profile: House, Star Lord, Sub Lord, Significations, KP Strength, Rule relevance." },
  { id: "5", stepNumber: "STEP 05", module: "Transit Position Mapping", whatToDo: "Calculate current transit positions of all planets. Map them to natal houses, signs, stars and subs." },
  { id: "6", stepNumber: "STEP 06", module: "Transit Moon Trigger", whatToDo: "Trace Moon's precise transit degree to find when it activates the primary significators." },
  { id: "7", stepNumber: "STEP 07", module: "Trigger Chain Evaluation", whatToDo: "Validate if transit Jupiter/Sun/Lagna simultaneously trigger active significators." },
  { id: "8", stepNumber: "STEP 08", module: "Cosmic Convergence & Synergy", whatToDo: "Compute final combined strength from natal promise + dasha support + transit triggers." },
  { id: "9", stepNumber: "STEP 09", module: "Surviving Planetary Agents", whatToDo: "Determine which specific planets are the ultimate cause of event delivery." },
  { id: "10", stepNumber: "STEP 10", module: "House Priority Matrix", whatToDo: "Score active houses based on current dasha and transit alignment." },
  { id: "11", stepNumber: "STEP 11", module: "Multi-System Consensus", whatToDo: "Run Vedic, KP, and Western consensus check to verify the event's certainty rating." },
  { id: "12", stepNumber: "STEP 12", module: "Obstacle & Delay Scan", whatToDo: "Check for retrograde planets, weak cusp lords, or negative transits that could cause delays." },
  { id: "13", stepNumber: "STEP 13", module: "Ruling Planet Synchronization", whatToDo: "Align selected transit lords with current ruling planets (RP) at the transit time." },
  { id: "14", stepNumber: "STEP 14", module: "Final Synthesis", whatToDo: "Synthesize all 13 stages to output the definitive Muhurta or Prediction." }
];

interface EventEngineViewProps {
  isDark?: boolean;
}

export const EventEngineView: React.FC<EventEngineViewProps> = ({ isDark = true }) => {
  const [steps, setSteps] = useState<EngineStep[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit form state
  const [editStepNum, setEditStepNum] = useState("");
  const [editModule, setEditModule] = useState("");
  const [editWhatToDo, setEditWhatToDo] = useState("");

  // Add step form state
  const [isAdding, setIsAdding] = useState(false);
  const [newStepNum, setNewStepNum] = useState("");
  const [newModule, setNewModule] = useState("");
  const [newWhatToDo, setNewWhatToDo] = useState("");

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("jhora_event_engine_steps");
    if (saved) {
      try {
        setSteps(JSON.parse(saved));
      } catch (e) {
        setSteps(DEFAULT_STEPS);
      }
    } else {
      setSteps(DEFAULT_STEPS);
    }
  }, []);

  // Save to local storage whenever steps change
  const saveSteps = (updatedSteps: EngineStep[]) => {
    setSteps(updatedSteps);
    localStorage.setItem("jhora_event_engine_steps", JSON.stringify(updatedSteps));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all engine steps to their default sequence and descriptions? All custom changes will be overwritten.")) {
      saveSteps(DEFAULT_STEPS);
      setEditingId(null);
      setIsAdding(false);
    }
  };

  // Move a step up in sequence
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index - 1];
    newSteps[index - 1] = temp;
    saveSteps(newSteps);
  };

  // Move a step down in sequence
  const moveDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index + 1];
    newSteps[index + 1] = temp;
    saveSteps(newSteps);
  };

  // Start editing a step
  const startEdit = (step: EngineStep) => {
    setEditingId(step.id);
    setEditStepNum(step.stepNumber);
    setEditModule(step.module);
    setEditWhatToDo(step.whatToDo);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Save the edited step
  const saveEdit = (id: string) => {
    if (!editStepNum.trim() || !editModule.trim() || !editWhatToDo.trim()) {
      alert("All fields are required.");
      return;
    }
    const updated = steps.map(step => {
      if (step.id === id) {
        return {
          ...step,
          stepNumber: editStepNum.trim(),
          module: editModule.trim(),
          whatToDo: editWhatToDo.trim()
        };
      }
      return step;
    });
    saveSteps(updated);
    setEditingId(null);
  };

  // Delete a step
  const deleteStep = (id: string) => {
    if (window.confirm("Are you sure you want to delete this engine step?")) {
      const updated = steps.filter(step => step.id !== id);
      saveSteps(updated);
      if (editingId === id) setEditingId(null);
    }
  };

  // Add a new step
  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepNum.trim() || !newModule.trim() || !newWhatToDo.trim()) {
      alert("All fields are required.");
      return;
    }

    const newStep: EngineStep = {
      id: Date.now().toString(),
      stepNumber: newStepNum.trim(),
      module: newModule.trim(),
      whatToDo: newWhatToDo.trim()
    };

    saveSteps([...steps, newStep]);
    
    // Reset add form
    setNewStepNum("");
    setNewModule("");
    setNewWhatToDo("");
    setIsAdding(false);
  };

  const cardBg = isDark ? "bg-slate-950/40 border-slate-800/80" : "bg-white border-neutral-200";
  const tableHeaderBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-neutral-100 border-neutral-200 text-neutral-600";
  const rowHover = isDark ? "hover:bg-slate-900/15" : "hover:bg-neutral-50";
  const textMuted = isDark ? "text-slate-400" : "text-neutral-500";
  const textTitle = isDark ? "text-slate-100" : "text-neutral-900";
  const borderLight = isDark ? "border-slate-800/50" : "border-neutral-200";

  return (
    <div className={`p-6 sm:p-8 rounded-2xl border ${cardBg} transition-all space-y-6 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-500/10 pb-4">
        <div>
          <span className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
            Vedic &amp; KP Astrological Synthesis
          </span>
          <h2 className="text-lg font-sans font-medium text-slate-200 mt-1 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-amber-500" />
            14-Step Event Calculation Engine
          </h2>
          <p className={`text-xs ${textMuted} mt-1`}>
            Configure and order the dynamic modules used to process natal promise verification, DBA support, and dynamic transit timings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {isAdding ? "Cancel" : "Add Step"}
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to classical 14 steps"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset Sequence
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 flex items-start gap-3 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-300">
          <span className="font-bold text-slate-200">Execution Notice:</span>
          <p>
            The engine is currently running in <strong className="text-amber-400">Data Definition Mode</strong>. You can customize, reorder, and append new synthesis criteria here. These structures represent the exact pipeline compiled for automated dasha/transit evaluations.
          </p>
        </div>
      </div>

      {/* Add Step Form */}
      {isAdding && (
        <form onSubmit={handleAddStep} className="p-5 rounded-xl border border-amber-500/25 bg-amber-500/5 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 border-b border-amber-500/10 pb-2 mb-2">
            <Plus className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold text-slate-200 font-mono uppercase">Append Custom Module to Pipeline</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Step Name/No.</label>
              <input
                type="text"
                placeholder="e.g. STEP 15"
                value={newStepNum}
                onChange={(e) => setNewStepNum(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div className="md:col-span-9 space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Engine / Module Name</label>
              <input
                type="text"
                placeholder="e.g. Sub-Lord Nakshatra Intersect"
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">What to Do / Description</label>
            <textarea
              placeholder="Provide complete details about the inputs, computations, and outputs of this custom pipeline phase."
              value={newWhatToDo}
              onChange={(e) => setNewWhatToDo(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded transition-colors cursor-pointer"
            >
              Append Step
            </button>
          </div>
        </form>
      )}

      {/* Main Table Structure */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`${tableHeaderBg} text-slate-400 border-b font-mono select-none`}>
              <th className="p-3 w-16 text-center">Order</th>
              <th className="p-3 w-32">Step</th>
              <th className="p-3 w-64">Engine / Module</th>
              <th className="p-3">What to Do</th>
              <th className="p-3 w-36 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/20 font-sans text-slate-300">
            {steps.map((step, index) => {
              const isEditing = editingId === step.id;

              return (
                <tr key={step.id} className={`${rowHover} ${borderLight} border-b last:border-0 transition-colors`}>
                  {/* Order Selector Controls */}
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded hover:bg-slate-800 transition-colors ${index === 0 ? "text-slate-700 cursor-not-allowed" : "text-slate-400 hover:text-cyan-400 cursor-pointer"}`}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === steps.length - 1}
                        className={`p-1 rounded hover:bg-slate-800 transition-colors ${index === steps.length - 1 ? "text-slate-700 cursor-not-allowed" : "text-slate-400 hover:text-cyan-400 cursor-pointer"}`}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Step Column */}
                  <td className="p-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editStepNum}
                        onChange={(e) => setEditStepNum(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                    ) : (
                      <span className="font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-1 rounded border border-amber-500/20 text-xs">
                        {step.stepNumber}
                      </span>
                    )}
                  </td>

                  {/* Engine / Module Column */}
                  <td className="p-3 font-medium">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editModule}
                        onChange={(e) => setEditModule(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                      />
                    ) : (
                      <span className={`font-bold ${textTitle}`}>{step.module}</span>
                    )}
                  </td>

                  {/* What to Do Column */}
                  <td className="p-3 text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                    {isEditing ? (
                      <textarea
                        value={editWhatToDo}
                        onChange={(e) => setEditWhatToDo(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                      />
                    ) : (
                      <span>{step.whatToDo}</span>
                    )}
                  </td>

                  {/* Action Commands Column */}
                  <td className="p-3 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => saveEdit(step.id)}
                          className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded transition-colors cursor-pointer"
                          title="Save Changes"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                          title="Cancel Editing"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => startEdit(step)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                          title="Edit Step"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
                        </button>
                        <button
                          onClick={() => deleteStep(step.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/20 transition-all cursor-pointer"
                          title="Delete Step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {steps.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 italic font-mono text-xs">
                  All calculation steps cleared. Use "Add Step" or click "Reset Sequence" to restore.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer statistics bar */}
      <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-800/60 rounded-xl text-xs font-mono">
        <span className="text-slate-400">Total Sequential Stages:</span>
        <span className="text-amber-400 font-bold font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">
          {steps.length} Phases Active
        </span>
      </div>
    </div>
  );
};
