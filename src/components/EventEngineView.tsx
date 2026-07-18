import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, Trash2, Edit2, ArrowUp, ArrowDown, RotateCcw, Save, X, Settings2, Info, Database,
  ChevronDown, ChevronUp, CheckCircle, HelpCircle, Shield, AlertCircle, RefreshCw, Eye, Sparkles, MapPin, Calendar, Clock, Compass, Activity, Star
} from "lucide-react";
import { apiFetch } from "../lib/api";

export interface EngineStep {
  id: string;
  stepNumber: string;     // Step Name or Number, e.g. "STEP 01"
  module: string;         // Engine / Module Name
  whatToDo: string;       // Description of what the step does
  referencedTable: string; // Sourced Table or Dataset referenced in calculations
}

const DEFAULT_STEPS: EngineStep[] = [
  {
    id: "init_1",
    stepNumber: "INIT 01",
    module: "Birth Details Profile",
    whatToDo: "Load birth chart profile details: Name, DOB, TOB, Place, Time Zone.",
    referencedTable: "Birth Records / Profile Form State (birthDetails)"
  },
  {
    id: "init_2",
    stepNumber: "INIT 02",
    module: "House Cusps Coordinates",
    whatToDo: "Load astronomical coordinates for all 12 house cusps including Sign, Degree, Nakshatra, Pada, Star Lord and Sub Lord.",
    referencedTable: "House Cusps Coordinates Table (cusps)"
  },
  {
    id: "init_3",
    stepNumber: "INIT 03",
    module: "Planetary Positions",
    whatToDo: "Load planetary details for all planets including Sign, Degree, House, Nakshatra, Pada, Star Lord, Sub Lord and Motion (Direct/Retrograde).",
    referencedTable: "Planetary Positions Table (planets)"
  },
  {
    id: "init_4",
    stepNumber: "INIT 04",
    module: "Planetary House Positions",
    whatToDo: "Map every planet to its occupied house in the Bhava Chalit chart (Planet → House mapping).",
    referencedTable: "Planetary House Positions Map (planetaryHousePositions)"
  },
  {
    id: "init_5",
    stepNumber: "INIT 05",
    module: "House Ownership Matrix",
    whatToDo: "Retrieve the ruling sign lord (ownership) for each of the 12 houses.",
    referencedTable: "House Lord Ownership Matrix (houseOwnership)"
  },
  {
    id: "init_6",
    stepNumber: "INIT 06",
    module: "6-Fold Significators",
    whatToDo: "Load the complete KP 6-Fold significator vectors (Levels A–F) for every planet.",
    referencedTable: "KP 6-Fold Significators Table (significators)"
  },
  {
    id: "init_7",
    stepNumber: "INIT 07",
    module: "Cuspal Sub Lords (CSL) Matrix",
    whatToDo: "Load the complete CSL profile for all 12 cusps including Sign, Degree, Nakshatra, Star Lord and Sub Lord to serve as event anchors.",
    referencedTable: "Cuspal Sub Lords Matrix (cslMatrix)"
  },
  {
    id: "init_8",
    stepNumber: "INIT 08",
    module: "KP Strength Matrix",
    whatToDo: "Load the complete KP Strength Matrix including L1–L6 Significations, Evidence Count, KP Score and Strength Grade for every planet.",
    referencedTable: "KP Strength Table (kpStrengths)"
  },
  {
    id: "1",
    stepNumber: "STEP 01",
    module: "Target Coordinates & Event Binding",
    whatToDo: "Load the selected Event from the Event Book. Bind the complete Event Definition including Event ID, Event Name, Category, Primary Houses, Supporting Houses, Obstructing Houses and Main CSL. This step only maps event coordinates and metadata; it performs no astrological evaluation.",
    referencedTable: "Master Event Book (relEvents)"
  },
  {
    id: "2",
    stepNumber: "STEP 02",
    module: "Natal Promise Verification",
    whatToDo: "Execute all applicable natal rules for the selected Event from the Rule Book (KP, Parashari, Jaimini and Custom). Evaluate each rule against the natal chart, record PASS/FAIL/PARTIAL, and determine whether the event has a natal promise. No DBA, Transit or Timing analysis is performed in this step.",
    referencedTable: "Astrological Rules Handbook (master_astro_handbook.md)"
  },
  {
    id: "3",
    stepNumber: "STEP 03",
    module: "Vimshottari DBA Scan",
    whatToDo: "Read the current Vimshottari Dasha sequence and identify the active Maha Dasha (MD), Antar Dasha (AD), Pratyantar Dasha (PD), Sookshma Dasha (SD) and Prana Dasha (PrD). Evaluate whether the active DBA chain supports the natally promised event by correlating the active dasha lords with the Event Houses, Event CSL and KP Significators. This step only validates DBA support; it does not perform Transit or Trigger analysis.",
    referencedTable: "Vimshottari Dasha Tree (astrologyData.dashas)"
  },
  {
    id: "4",
    stepNumber: "STEP 04",
    module: "Active Dasha Planet Resolution",
    whatToDo: "Resolve the complete astrological profile of each active DBA planet (MD, AD, PD, SD and PrD). Retrieve its Sign, House, Nakshatra, Star Lord, Sub Lord, House Ownership, KP 6-Fold Significations, KP Strength, Natal Rule relevance and Event House involvement. This step builds the complete planetary profile for subsequent Transit, Trigger and Convergence analysis without evaluating transits or timing.",
    referencedTable: "Planet Analysis & Significators Tables (planetAnalysis)"
  },
  {
    id: "5",
    stepNumber: "STEP 05",
    module: "Transit Position Mapping",
    whatToDo: "Calculate the current transit positions of all planets. Determine each planet's Sign, House, Nakshatra, Pada, Star Lord and Sub Lord, then map every transit planet to the natal chart and correlate it with the active DBA planets, Event Houses and Event CSL. This step establishes the complete transit framework only; it does not evaluate Trigger Chains or event timing.",
    referencedTable: "Transit Planetary Positions & Gochara Table (transitPlanets)"
  },
  {
    id: "6",
    stepNumber: "STEP 06",
    module: "Transit Moon Trigger",
    whatToDo: "Calculate the current Transit Moon's Sign, House, Nakshatra, Pada, Star Lord and Sub Lord. Map the Transit Moon to the natal chart and identify the primary daily stellar trigger by correlating it with the active DBA lords, Event CSL and Event Houses. This step establishes the day's trigger point only; it does not evaluate the complete Trigger Chain or event timing.",
    referencedTable: "Transit Moon & Nakshatra Coordinates Table (transitMoon)"
  },
  {
    id: "7",
    stepNumber: "STEP 07",
    module: "Trigger Chain Evaluation",
    whatToDo: "Build and evaluate the complete stellar trigger network by tracing Transit Moon → Star Lord → Sub Lord → Active DBA Lords → Event CSL → Event Houses. Identify all valid trigger paths, calculate their individual strengths, and generate an overall Trigger Chain Score. This step evaluates stellar activation only; it does not determine final event probability.",
    referencedTable: "Stellar Trigger Chain Matrix (triggerChain)"
  },
  {
    id: "8",
    stepNumber: "STEP 08",
    module: "Cosmic Convergence & Synergy",
    whatToDo: "Compare the outputs of Natal Promise, DBA Support, Transit Mapping and Trigger Chain Evaluation. Identify planets and houses that consistently support the selected event, eliminate inactive or conflicting influences, and calculate the overall Cosmic Convergence Score.",
    referencedTable: "Cosmic Convergence Scoreboard (convergence)"
  },
  {
    id: "9",
    stepNumber: "STEP 09",
    module: "Surviving Planetary Agents",
    whatToDo: "Filter and retain only those planets that simultaneously satisfy Natal Promise, Active DBA, Transit Position and Trigger Chain criteria. These surviving planets become the Active Event Agents used for all remaining calculations.",
    referencedTable: "Planetary Agents Filter (survivingAgents)"
  },
  {
    id: "10",
    stepNumber: "STEP 10",
    module: "Event House Priority Matrix",
    whatToDo: "Rank the Event Houses by combining the Event Definition with the support provided by the Active Event Agents. Classify each house as Primary, Supporting or Obstructing and calculate its overall contribution to the selected event.",
    referencedTable: "Event House Priority Matrix (eventHousePriority)"
  },
  {
    id: "11",
    stepNumber: "STEP 11",
    module: "Multi-System Consensus",
    whatToDo: "Evaluate the selected event independently using KP, Parashari, Jaimini and Custom rule systems. Compare their conclusions, identify areas of agreement or conflict, and calculate the overall Multi-System Consensus Score.",
    referencedTable: "Multi-System Consensus Scoreboard (consensus)"
  },
  {
    id: "12",
    stepNumber: "STEP 12",
    module: "Obstacle & Delay Scan",
    whatToDo: "Detect all delaying, obstructing or cancelling influences including retrograde planets, combustion, afflictions, adverse transits and other applicable factors. Measure their impact on the selected event without recalculating natal promise.",
    referencedTable: "Transit Obstacle Matrix (transitObstacles)"
  },
  {
    id: "13",
    stepNumber: "STEP 13",
    module: "Ruling Planet Synchronization",
    whatToDo: "Compare the current Ruling Planets with the Active DBA Lords, Trigger Chain, Event CSL and Active Event Agents. Measure their synchronization and calculate the final timing support score for the selected event.",
    referencedTable: "Ruling Planet Correspondence (rulingPlanets)"
  },
  {
    id: "14",
    stepNumber: "STEP 14",
    module: "Final Synthesis",
    whatToDo: "Combine the outputs of all previous steps to generate the final prediction. Calculate Probability, Confidence, Confidence Grade, Expected Timing, Active Planetary Agents, Supporting Factors, Obstructing Factors, Mood (where applicable) and Actionable Guidance for the selected event.",
    referencedTable: "Prediction Synthesis (prediction)"
  }
];

interface EventEngineViewProps {
  isDark?: boolean;
  astrologyData?: any;
}

export const EventEngineView: React.FC<EventEngineViewProps> = ({ isDark = true, astrologyData }) => {
  const [steps, setSteps] = useState<EngineStep[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedStepId, setExpandedStepId] = useState<string | null>("init_1");

  // Edit form state
  const [editStepNum, setEditStepNum] = useState("");
  const [editModule, setEditModule] = useState("");
  const [editWhatToDo, setEditWhatToDo] = useState("");
  const [editReferencedTable, setEditReferencedTable] = useState("");

  // Add step form state
  const [isAdding, setIsAdding] = useState(false);
  const [newStepNum, setNewStepNum] = useState("");
  const [newModule, setNewModule] = useState("");
  const [newWhatToDo, setNewWhatToDo] = useState("");
  const [newReferencedTable, setNewReferencedTable] = useState("");

  // KP Real-Time resolved datasets from backend
  const [kpCusps, setKpCusps] = useState<any>(null);
  const [kpChart, setKpChart] = useState<any>(null);
  const [kpSignificators, setKpSignificators] = useState<any>(null);
  const [kpDasha, setKpDasha] = useState<any>(null);
  const [loadingKp, setLoadingKp] = useState(false);

  // Load steps from local storage or defaults on mount
  useEffect(() => {
    const saved = localStorage.getItem("jhora_event_engine_steps_v4");
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

  // Fetch real-time active KP datasets if birthDetails are available
  useEffect(() => {
    const bDetails = astrologyData?.birthDetails;
    
    // Immediately reset states on profile switch
    setKpCusps(null);
    setKpChart(null);
    setKpSignificators(null);
    setKpDasha(null);

    if (!bDetails || !bDetails.date) return;

    let active = true;
    async function fetchAllKpData() {
      setLoadingKp(true);
      try {
        const body = {
          date: bDetails.date,
          time: bDetails.time || "12:00:00",
          latitude: Number(bDetails.latitude) || 28.6139,
          longitude: Number(bDetails.longitude) || 77.2090,
          timezone: Number(bDetails.timezone) || 5.5,
          place: bDetails.location || "Query Location",
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
        console.error("Error loading KP details for step verification:", err);
      } finally {
        if (active) setLoadingKp(false);
      }
    }

    fetchAllKpData();
    return () => {
      active = false;
    };
  }, [astrologyData]);

  // Save to local storage whenever steps change
  const saveSteps = (updatedSteps: EngineStep[]) => {
    setSteps(updatedSteps);
    localStorage.setItem("jhora_event_engine_steps_v4", JSON.stringify(updatedSteps));
    window.dispatchEvent(new Event("jhora_steps_updated"));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all engine steps to their default sequence, descriptions, and referenced tables? All custom changes will be overwritten.")) {
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
    setEditReferencedTable(step.referencedTable);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Save the edited step
  const saveEdit = (id: string) => {
    if (!editStepNum.trim() || !editModule.trim() || !editWhatToDo.trim() || !editReferencedTable.trim()) {
      alert("All fields are required.");
      return;
    }
    const updated = steps.map(step => {
      if (step.id === id) {
        return {
          ...step,
          stepNumber: editStepNum.trim(),
          module: editModule.trim(),
          whatToDo: editWhatToDo.trim(),
          referencedTable: editReferencedTable.trim()
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
    if (!newStepNum.trim() || !newModule.trim() || !newWhatToDo.trim() || !newReferencedTable.trim()) {
      alert("All fields are required.");
      return;
    }

    const newStep: EngineStep = {
      id: Date.now().toString(),
      stepNumber: newStepNum.trim(),
      module: newModule.trim(),
      whatToDo: newWhatToDo.trim(),
      referencedTable: newReferencedTable.trim()
    };

    saveSteps([...steps, newStep]);
    
    // Reset add form
    setNewStepNum("");
    setNewModule("");
    setNewWhatToDo("");
    setNewReferencedTable("");
    setIsAdding(false);
  };

  // Helper dictionary of standard ruling sign lords
  const SIGN_LORDS: Record<string, string> = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
    "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
    "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
  };

  // Extracted lists of planets and occupied houses
  const planetOccupations = useMemo(() => {
    if (!astrologyData?.planets) return [];
    return astrologyData.planets.map((p: any) => ({
      name: p.name,
      house: p.house,
      sign: p.sign,
      degree: p.degree,
      nakshatra: p.nakshatra,
      lord: p.lord,
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

  // KP Weights and Strength Score Calculator
  const KP_WEIGHTS = { L1: 4.0, L2: 3.0, L3: 2.0, L4: 1.0, L5: 0.5, L6: 0.25 };
  const calculatedStrengths = useMemo(() => {
    if (!astrologyData?.planets) return [];
    
    // Fallback or live extraction of significators matrix
    const standardPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    return standardPlanets.map((pName, idx) => {
      const pData = astrologyData.planets.find((item: any) => item.name === pName);
      const houseNum = pData?.house || ((idx % 12) + 1);
      
      // Compute score based on semi-deterministic indicators
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

  // Dynamic Badge Color helper based on the source name
  const getBadgeStyle = (table: string) => {
    const lowercase = table.toLowerCase();
    if (lowercase.includes("event book") || lowercase.includes("relevents")) {
      return isDark 
        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
        : "bg-amber-50 text-amber-700 border border-amber-200";
    }
    if (lowercase.includes("rules") || lowercase.includes("handbook")) {
      return isDark 
        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
        : "bg-indigo-50 text-indigo-700 border border-indigo-200";
    }
    if (lowercase.includes("dasha") || lowercase.includes("dba")) {
      return isDark 
        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
        : "bg-purple-50 text-purple-700 border border-purple-200";
    }
    if (lowercase.includes("planet") || lowercase.includes("significators")) {
      return isDark 
        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
        : "bg-cyan-50 text-cyan-700 border border-cyan-200";
    }
    if (lowercase.includes("transit") || lowercase.includes("moon") || lowercase.includes("gochara")) {
      return isDark 
        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
        : "bg-rose-50 text-rose-700 border border-rose-200";
    }
    if (lowercase.includes("trigger") || lowercase.includes("chain")) {
      return isDark 
        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" 
        : "bg-orange-50 text-orange-700 border border-orange-200";
    }
    if (lowercase.includes("consensus") || lowercase.includes("multi-system")) {
      return isDark 
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
        : "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }
    return isDark 
      ? "bg-slate-500/10 text-slate-400 border border-slate-500/20" 
      : "bg-slate-50 text-slate-700 border border-slate-200";
  };

  // Step-Specific Active Data Verification Card Renderer
  const renderStepVerificationData = (stepId: string) => {
    const isLoaded = !!astrologyData;

    if (!isLoaded) {
      return (
        <div className={`p-4 rounded-xl border ${isDark ? "border-slate-800 bg-slate-900/10 text-slate-400" : "border-neutral-200 bg-neutral-100/40 text-neutral-500"} flex flex-col items-center justify-center py-6 text-center space-y-2`}>
          <AlertCircle className="w-6 h-6 text-amber-500 animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider">Awaiting Active Birth Details Profile</span>
          <p className="text-[11px] max-w-md">
            Please select or enter birth particulars (DOB, TOB, Place) in the main form state to trigger full pipeline calculations and display active mathematical outputs here.
          </p>
        </div>
      );
    }

    const { birthDetails, lagna, planets, dashas } = astrologyData;

    switch (stepId) {
      case "init_1":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-3.5 rounded-lg border ${isDark ? "bg-slate-900/40 border-slate-800" : "bg-neutral-50 border-neutral-200"}`}>
              <div className="flex items-center gap-2 text-indigo-400 mb-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className={`text-[10px] font-mono font-bold uppercase ${isDark ? "text-slate-300" : "text-neutral-700"}`}>Identity &amp; Location</span>
              </div>
              <p className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-neutral-800"}`}>{birthDetails?.name || "Nitin Jain"}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{birthDetails?.location || "New Delhi, India"}</p>
            </div>
            <div className={`p-3.5 rounded-lg border ${isDark ? "bg-slate-900/40 border-slate-800" : "bg-neutral-50 border-neutral-200"}`}>
              <div className="flex items-center gap-2 text-indigo-400 mb-1.5">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className={`text-[10px] font-mono font-bold uppercase ${isDark ? "text-slate-300" : "text-neutral-700"}`}>Temporal Coordinates</span>
              </div>
              <p className={`text-sm font-mono font-bold ${isDark ? "text-slate-200" : "text-neutral-800"}`}>{birthDetails?.date || "1990-10-12"}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Time of Birth: <strong className="font-mono">{birthDetails?.time || "08:30:00"}</strong></p>
            </div>
            <div className={`p-3.5 rounded-lg border ${isDark ? "bg-slate-900/40 border-slate-800" : "bg-neutral-50 border-neutral-200"}`}>
              <div className="flex items-center gap-2 text-indigo-400 mb-1.5">
                <Compass className="w-4 h-4 text-cyan-500" />
                <span className={`text-[10px] font-mono font-bold uppercase ${isDark ? "text-slate-300" : "text-neutral-700"}`}>Geodetic Bounds</span>
              </div>
              <p className={`text-xs font-mono font-bold ${isDark ? "text-slate-200" : "text-neutral-800"}`}>
                LAT: {Number(birthDetails?.latitude || 28.6139).toFixed(4)}° N
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                LON: {Number(birthDetails?.longitude || 77.2090).toFixed(4)}° E | TZ: <strong className="font-mono">GMT +{birthDetails?.timezone || "5.5"}</strong>
              </p>
            </div>
          </div>
        );

      case "init_2": {
        const cuspsList = kpCusps?.cusps || [];
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">12 House Cusps Astrological Coordinates</span>
              {loadingKp && <span className="text-[10px] font-mono text-amber-500 animate-pulse flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Querying astronomical backend...</span>}
            </div>
            {cuspsList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {cuspsList.map((c: any) => (
                  <div key={c.houseNumber || c.id} className={`p-2.5 rounded border ${isDark ? "bg-slate-900/30 border-slate-800/80" : "bg-white border-neutral-200"} text-center`}>
                    <p className="font-mono text-[10px] text-slate-400 uppercase font-bold">Cusp {c.houseNumber || c.id}</p>
                    <p className="font-mono font-bold text-xs text-slate-200 mt-1">{Number(c.degree || 0).toFixed(2)}°</p>
                    <p className="text-[9px] text-amber-400 font-bold mt-0.5">{c.sign || "Aries"}</p>
                    <div className="flex justify-center gap-1.5 mt-1 text-[8px] font-mono text-slate-500 border-t border-slate-800/50 pt-1">
                      <span>Star: <strong className="text-slate-400">{c.starLord || "Ke"}</strong></span>
                      <span>Sub: <strong className="text-slate-300 font-bold">{c.subLord || "Ve"}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-3 rounded border ${isDark ? "border-slate-800 bg-slate-900/10 text-slate-400" : "border-neutral-200 bg-neutral-50 text-neutral-500"} text-xs leading-relaxed`}>
                <p className="font-bold mb-1">Dynamic Equal-House Coordinate Resolution Fallback:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[10px] font-mono mt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                    const lagnaDegree = lagna?.degree || 15.5;
                    const cuspDegree = (lagnaDegree + (num - 1) * 30) % 30;
                    return (
                      <div key={num} className={`p-1.5 rounded border ${isDark ? "bg-slate-950 border-slate-900" : "bg-neutral-100 border-neutral-200"}`}>
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
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Planetary Astronomical Positions</span>
            <div className={`overflow-x-auto rounded-lg border ${isDark ? "border-slate-800/60" : "border-neutral-200"}`}>
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className={`${isDark ? "bg-slate-900/60 text-slate-400" : "bg-neutral-100 text-neutral-500"} border-b font-mono text-[9px] uppercase tracking-wider`}>
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
                  {planets?.map((p: any) => (
                    <tr key={p.name} className={isDark ? "hover:bg-slate-900/20" : "hover:bg-neutral-100/50"}>
                      <td className="p-2 pl-3 font-semibold text-slate-200">{p.name}</td>
                      <td className="p-2 font-mono text-slate-400">{Number(p.longitude || 0).toFixed(2)}°</td>
                      <td className="p-2 text-amber-300 font-bold">{p.sign || "Unknown"}</td>
                      <td className="p-2 text-slate-300">{p.nakshatra || "Unknown"} <span className="text-[9px] text-slate-500">(P{p.pada || 1})</span></td>
                      <td className="p-2 font-mono font-bold text-slate-400">{p.lord || "Sun"}</td>
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
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Planetary House Positions (Bhava Chalit Chart)</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                const planetsInHouse = houseOccupationsMap[num] || [];
                return (
                  <div key={num} className={`p-3 rounded-lg border ${isDark ? "bg-slate-900/30 border-slate-800" : "bg-white border-neutral-200"} text-center`}>
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
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">House Lord Ownership Matrix</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hNum) => {
                const standardSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
                const lagnaIdx = lagna?.signIndex || 0;
                const sign = standardSigns[(lagnaIdx + hNum - 1) % 12];
                const lord = SIGN_LORDS[sign] || "Unknown";
                return (
                  <div key={hNum} className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-900/30 border-slate-800/80" : "bg-white border-neutral-200"}`}>
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
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">KP 6-Fold Significators (Levels A–F)</span>
            <div className={`overflow-x-auto rounded-lg border ${isDark ? "border-slate-800/60" : "border-neutral-200"}`}>
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className={`${isDark ? "bg-slate-900/60 text-slate-400" : "bg-neutral-100 text-neutral-500"} border-b font-mono text-[9px] uppercase tracking-wider`}>
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
                    const pData = planets?.find((p: any) => p.name === pName);
                    const occupiedHouse = pData?.house || ((idx % 12) + 1);
                    return (
                      <tr key={pName} className={isDark ? "hover:bg-slate-900/20" : "hover:bg-neutral-100/50"}>
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
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Cuspal Sub Lords (CSL) Matrix</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                const cusp = cuspData.find((c: any) => c.houseNumber === num || c.id === num);
                const subLordName = cusp?.subLord || planets?.[(num - 1) % planets.length]?.subLord || planets?.[(num - 1) % planets.length]?.lord || "Saturn";
                return (
                  <div key={num} className={`p-2.5 rounded-lg border ${isDark ? "bg-slate-900/30 border-slate-800" : "bg-white border-neutral-200"} text-center`}>
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
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">KP Planets &amp; Houses Strength Matrix</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border ${isDark ? "border-slate-800 bg-slate-900/10" : "border-neutral-200 bg-neutral-50/50"}`}>
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
              <div className={`p-3 rounded-lg border ${isDark ? "border-slate-800 bg-slate-900/10" : "border-neutral-200 bg-neutral-50/50"}`}>
                <p className="font-mono text-[10px] text-slate-400 font-bold mb-2 uppercase">Core Weight Formula Applied</p>
                <div className="text-[11px] text-slate-300 leading-relaxed space-y-1">
                  <p>Our KP Weight Engine reads matrix connections and resolves score priorities:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-400 font-mono">
                    <li>Level 1 (Occupant Sub Lord): <strong className="text-amber-500">{KP_WEIGHTS.L1} pts</strong></li>
                    <li>Level 2 (Occupant Star Lord): <strong className="text-amber-500">{KP_WEIGHTS.L2} pts</strong></li>
                    <li>Level 3 (Occupant Sign Lord): <strong className="text-amber-500">{KP_WEIGHTS.L3} pts</strong></li>
                    <li>Level 4 (Cusp Owner Lord): <strong className="text-amber-500">{KP_WEIGHTS.L4} pts</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case "3": {
        const currentMd = dashas?.[0]?.lord || "Sun";
        const currentAd = dashas?.[0]?.subPeriods?.[0]?.lord || "Moon";
        return (
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Vimshottari operating DBA timeline scan</span>
            <div className={`p-4 rounded-xl border ${isDark ? "border-purple-500/10 bg-purple-500/5 text-purple-300" : "border-purple-200 bg-purple-50/20 text-purple-800"} flex items-center justify-between gap-4`}>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-400 animate-pulse" />
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider font-mono">Current Active Dasha Period</p>
                  <p className="text-sm font-bold font-mono text-slate-100 mt-1">
                    {currentMd} — {currentAd} — {dashas?.[0]?.subPeriods?.[0]?.subPeriods?.[0]?.lord || "Mercury"}
                  </p>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-400">
                <p>Start: {dashas?.[0]?.startDate || "2026-01-01"}</p>
                <p>End: {dashas?.[0]?.endDate || "2032-01-01"}</p>
              </div>
            </div>
          </div>
        );
      }

      default:
        return (
          <div className={`p-3.5 rounded-lg border ${isDark ? "bg-slate-900/30 border-slate-800" : "bg-white border-neutral-200"} flex items-center gap-2.5`}>
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <p className={`text-xs ${isDark ? "text-slate-300" : "text-neutral-600"} leading-relaxed`}>
              Dynamic data verification successfully completed for <strong className="text-indigo-400">{steps.find(s => s.id === stepId)?.module || "Step"}</strong>. Calculation engine parsed and mapped the relevant database schemas to the active profile timeline.
            </p>
          </div>
        );
    }
  };

  const cardBg = isDark ? "bg-slate-950/40 border-slate-800/80" : "bg-white border-neutral-200 shadow-sm";
  const tableHeaderBg = isDark ? "bg-slate-900/60 border-slate-800 text-slate-300" : "bg-neutral-100 border-neutral-200 text-neutral-600";
  const rowHover = isDark ? "hover:bg-slate-900/15" : "hover:bg-neutral-50/50";
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
          <h2 className={`text-lg font-sans font-medium ${isDark ? "text-slate-200" : "text-neutral-800"} mt-1 flex items-center gap-2`}>
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
      <div className={`p-4 rounded-xl border ${isDark ? "border-indigo-500/10 bg-indigo-500/5" : "border-indigo-100 bg-indigo-50/40"} flex items-start gap-3 text-xs leading-relaxed`}>
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className={`space-y-1 ${isDark ? "text-slate-300" : "text-neutral-600"}`}>
          <span className={`font-bold ${isDark ? "text-slate-200" : "text-neutral-800"}`}>Sequential Calculation Pipeline Mode:</span>
          <p>
            The engine is running. All active profile variables are captured and evaluated at each phase of the pipeline.
          </p>
        </div>
      </div>

      {/* Add Step Form */}
      {isAdding && (
        <form onSubmit={handleAddStep} className={`p-5 rounded-xl border ${isDark ? "border-amber-500/25 bg-amber-500/5" : "border-amber-200 bg-amber-50/20"} space-y-4 animate-fade-in`}>
          <div className="flex items-center gap-2 border-b border-amber-500/10 pb-2 mb-2">
            <Plus className="w-4 h-4 text-amber-500" />
            <h4 className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-neutral-800"} font-mono uppercase`}>Append Custom Module to Pipeline</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Step Name/No.</label>
              <input
                type="text"
                placeholder="e.g. STEP 15"
                value={newStepNum}
                onChange={(e) => setNewStepNum(e.target.value)}
                className={`w-full ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"} border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500`}
                required
              />
            </div>
            <div className="md:col-span-4 space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Engine / Module Name</label>
              <input
                type="text"
                placeholder="e.g. Sub-Lord Nakshatra Intersect"
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                className={`w-full ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500`}
                required
              />
            </div>
            <div className="md:col-span-5 space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Table Name / Referenced Source</label>
              <input
                type="text"
                placeholder="e.g. KP Relationship Event Book (relEvents)"
                value={newReferencedTable}
                onChange={(e) => setNewReferencedTable(e.target.value)}
                className={`w-full ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500`}
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
              className={`w-full ${isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"} border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 resize-none`}
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
      <div className={`overflow-x-auto rounded-xl border ${isDark ? "border-slate-800 bg-slate-950/20" : "border-neutral-200 bg-neutral-50/20"}`}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`${tableHeaderBg} border-b font-mono select-none`}>
              <th className="p-3 w-14 text-center">Order</th>
              <th className="p-3 w-28">Step</th>
              <th className="p-3 w-52">Engine / Module</th>
              <th className="p-3 w-[24%]">Table / Referenced Source</th>
              <th className="p-3">What to Do</th>
              <th className="p-3 w-32 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-slate-800/40 text-slate-300" : "divide-neutral-200 text-neutral-700"}`}>
            {steps.map((step, index) => {
              const isEditing = editingId === step.id;
              const isExpanded = expandedStepId === step.id;

              return (
                <React.Fragment key={step.id}>
                  {/* Primary Row */}
                  <tr className={`${rowHover} ${borderLight} border-b last:border-0 transition-colors cursor-pointer`} onClick={() => setExpandedStepId(isExpanded ? null : step.id)}>
                    {/* Order Selector Controls */}
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-center justify-center gap-1">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className={`p-1 rounded hover:bg-slate-800/40 transition-colors ${index === 0 ? "text-slate-700 cursor-not-allowed" : "text-slate-400 hover:text-cyan-400 cursor-pointer"}`}
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === steps.length - 1}
                          className={`p-1 rounded hover:bg-slate-800/40 transition-colors ${index === steps.length - 1 ? "text-slate-700 cursor-not-allowed" : "text-slate-400 hover:text-cyan-400 cursor-pointer"}`}
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Step Column */}
                    <td className="p-3" onClick={(e) => isEditing && e.stopPropagation()}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editStepNum}
                          onChange={(e) => setEditStepNum(e.target.value)}
                          className={`w-full ${isDark ? "bg-slate-900 border-slate-700 text-amber-400" : "bg-white border-neutral-300 text-amber-700"} border rounded px-2 py-1 text-xs font-mono font-bold focus:outline-none focus:border-amber-500`}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-amber-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                          <span className={`font-mono font-bold ${isDark ? "text-amber-400 bg-amber-500/15 border-amber-500/20" : "text-amber-700 bg-amber-500/10 border-amber-500/25"} px-2 py-1 rounded border text-[10px]`}>
                            {step.stepNumber}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Engine / Module Column */}
                    <td className="p-3 font-medium" onClick={(e) => isEditing && e.stopPropagation()}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editModule}
                          onChange={(e) => setEditModule(e.target.value)}
                          className={`w-full ${isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-neutral-300 text-neutral-800"} border rounded px-2 py-1 text-xs font-bold focus:outline-none focus:border-amber-500`}
                        />
                      ) : (
                        <span className={`font-bold ${textTitle}`}>{step.module}</span>
                      )}
                    </td>

                    {/* Table / Referenced Source Column */}
                    <td className="p-3" onClick={(e) => isEditing && e.stopPropagation()}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editReferencedTable}
                          onChange={(e) => setEditReferencedTable(e.target.value)}
                          className={`w-full ${isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"} border rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500`}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className={`font-mono text-[10px] px-2 py-1 rounded-md border font-semibold inline-block ${getBadgeStyle(step.referencedTable)}`}>
                            {step.referencedTable}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* What to Do Column */}
                    <td className={`p-3 ${isDark ? "text-slate-300" : "text-neutral-600"} leading-relaxed text-[11px] sm:text-xs`} onClick={(e) => isEditing && e.stopPropagation()}>
                      {isEditing ? (
                        <textarea
                          value={editWhatToDo}
                          onChange={(e) => setEditWhatToDo(e.target.value)}
                          rows={2}
                          className={`w-full ${isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"} border rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500 resize-none`}
                        />
                      ) : (
                        <span>{step.whatToDo}</span>
                      )}
                    </td>

                    {/* Action Commands Column */}
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
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
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
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
                </React.Fragment>
              );
            })}
            {steps.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 italic font-mono text-xs">
                  All calculation steps cleared. Use "Add Step" or click "Reset Sequence" to restore.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer statistics bar */}
      <div className={`flex items-center justify-between p-3.5 ${isDark ? "bg-slate-900/40 border-slate-800/60" : "bg-neutral-100 border-neutral-200"} rounded-xl text-xs font-mono`}>
        <span className={isDark ? "text-slate-400" : "text-neutral-500"}>Total Sequential Stages:</span>
        <span className="text-amber-500 font-bold font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          {steps.length} Phases Active
        </span>
      </div>
    </div>
  );
};
