import React, { useState } from "react";
import { 
  BookOpen, 
  Cpu, 
  Layers, 
  Shield, 
  Zap, 
  CheckCircle, 
  Copy, 
  Check, 
  ArrowRight,
  Sparkles,
  Info,
  Terminal,
  Activity,
  Heart,
  FileDown
} from "lucide-react";
import { jsPDF } from "jspdf";

interface EngineGuideProps {
  isDark: boolean;
}

export default function EngineGuide({ isDark }: EngineGuideProps) {
  const [activeTab, setActiveTab] = useState<"spec" | "modules" | "stages" | "interactive">("spec");
  const [copied, setCopied] = useState(false);

  const rawSpec = `###########################################################
# JHORA AI PROFESSIONAL - ASTROLOGICAL RULE ENGINE
# OFFICIAL SPECIFICATION HANDBOOK (V1.0)
###########################################################

===========================================================
1. MASTER WORKFLOW & ARCHITECTURE
===========================================================

The canonical workflow separating static natal potentials from dynamic timing and rule-based decision modeling:

USER PROFILE
      │
      ▼
Astronomical Calculator (stateless coordinate extraction)
      │
      ▼
KP Calculation Engine (convert to significations)
      │
      ▼
KP Knowledge Book (static, deterministic)
      │
      ▼
Store inside User Profile

───────────────────────────────────────────────────────────

Prediction Request

      ↓

KP Rulebook (permanent rules grouped by 15 domains)

      ↓

Rule Engine (rule evaluation and outcome matching)

      ↓

Evidence Engine (collecting supporting/blocking proofs)

      ↓

Decision Engine (resolving verdicts)

      ↓

Timeline Engine (calculating activation windows)

      ↓

Event Book (single source of truth for persistence)

      ↓

Report Engine (rendering final dashboard, UI, and PDF)


===========================================================
2. SYSTEM ARCHITECTURE & MODULES
===========================================================

-----------------------------------------------------------
[01] Astronomical Calculator
-----------------------------------------------------------
- Responsibility:
  Stateless calculation of planetary longitudes, Placidus house cusps, and transits from raw ephemeris data.
- Input:
  Birth Date, Time, Latitude, Longitude, Elevation, and Ayanamsa Type.
- Output:
  Exact 3D spatial coordinates of planets and cusps.
- Principles:
  Does NOT calculate astrology interpretations, significators, or strengths.

-----------------------------------------------------------
[02] KP Calculation Engine
-----------------------------------------------------------
- Responsibility:
  Converts astronomical coordinates into deterministic KP astrological structures.
- Generates:
  Planets, Houses, Placidus Cusps, Star Lords, Sub Lords, Significators (Levels A-F), Planet Strengths, House Strengths, and Natal Event Promise.
- Output:
  Builds the static KP Knowledge Book object.
- Principles:
  Only runs upon profile initialization, birth detail changes, or Ayanamsa updates.

-----------------------------------------------------------
[03] KP Knowledge Book
-----------------------------------------------------------
- Responsibility:
  Permanent deterministic repository containing ONLY static natal KP information.
- Structure:
  - Planets & Cusps coordinate map
  - KP Star Lords, Sub Lords, and Sub-Sub Lords (SSL)
  - House Significators
  - Planet & House Strengths
  - Natal Event Promise
  - KP Knowledge Book Version
- Principles:
  Stored once inside the User Profile. NEVER regenerated or recalculated during dynamic predictions.

-----------------------------------------------------------
[04] KP Rulebook
-----------------------------------------------------------
- Responsibility:
  Permanent repository of classical KP rules.
- Contains:
  ONLY conditional logic rules grouped by the following 15 domains:
  - Marriage: Primary [2, 7, 11], Supporting [5, 9], Obstructing [1, 6, 10]
  - Career: Primary [2, 6, 10, 11], Supporting [1], Obstructing [5, 8, 12]
  - Business: Primary [2, 7, 10, 11], Supporting [1], Obstructing [5, 6, 8, 12]
  - Finance: Primary [2, 6, 11], Supporting [8], Obstructing [5, 12]
  - Property: Primary [4, 11, 12], Supporting [9], Obstructing [3, 8]
  - Vehicle: Primary [4, 9, 11], Supporting [2], Obstructing [3, 8]
  - Education: Primary [4, 9, 11], Supporting [5], Obstructing [3, 8, 12]
  - Children: Primary [2, 5, 11], Supporting [9], Obstructing [1, 4, 10]
  - Travel: Primary [3, 9, 12], Supporting [11], Obstructing [2, 4]
  - Foreign Settlement: Primary [3, 9, 12], Supporting [11], Obstructing [2, 4]
  - Health: Primary [1, 6, 8, 12], Supporting [11], Obstructing [5, 9]
  - Litigation: Primary [6, 11], Supporting [1], Obstructing [5, 8, 12]
  - Spiritual: Primary [5, 9, 12], Supporting [8], Obstructing [2, 11]
  - Longevity: Primary [1, 8, 12], Supporting [11], Obstructing [5, 9]
  - General: Overall planet/house alignments.
- Principles:
  Contains no calculations, no prediction logic, and no execution logic.

-----------------------------------------------------------
[05] Rule Engine
-----------------------------------------------------------
- Responsibility:
  Executing compiled rules from the KP Rulebook against the KP Knowledge Book, active DBA, and transits.
- Output:
  Rule Results mapping conditions to true/false outcomes.
- Constraints:
  Must NOT generate evidence, create event records, calculate confidence, or store results.

-----------------------------------------------------------
[06] Evidence Engine
-----------------------------------------------------------
- Responsibility:
  Collecting and organizing evidence from Rule Results.
- Aggregates:
  - Supporting Evidence (Auspicious house activations)
  - Blocking Evidence (Obstructing house activations)
  - Satisfied Rules (Matching conditions)
  - Failed Rules (Non-matching conditions)
  - Evidence Weight & Rule Lineage
- Constraints:
  Must NOT execute rules or write to the database.

-----------------------------------------------------------
[07] Decision Engine
-----------------------------------------------------------
- Responsibility:
  Performs dynamic mathematical evaluation of eventual feasibility.
- Equation:
  Natal Promise + Active DBA + Transit + Collected Evidence -> Final Decision
- Constraints:
  Stateless execution. No persistence or Event Book writes.

-----------------------------------------------------------
[08] Timeline Engine
-----------------------------------------------------------
- Responsibility:
  Schedules and determines precise chronologies for manifestation.
- Computes:
  - Activation Window (Start/End dates)
  - Timing Range
  - Activation Strength
  - Priority Window
- Constraints:
  Must NOT create events. Terms like 'Delay' and 'Acceleration' are interpretations, not engine responsibilities.

-----------------------------------------------------------
[09] Event Book
-----------------------------------------------------------
- Responsibility:
  The SINGLE SOURCE OF TRUTH persistent database repository.
- Workflow:
  Decision Engine -> Event Candidate -> Event Book -> Persist
- Stored Fields:
  - Event ID
  - Decision / Verdict
  - Evidence Package
  - Timeline Windows
  - Confidence Base & Final Scores
  - Rule Lineage
  - History & Audit Trail
- Constraints:
  Does NOT decide events, execute rules, or evaluate astrology. Purely a storage vault.

-----------------------------------------------------------
[10] Report Engine
-----------------------------------------------------------
- Responsibility:
  Compiles verified event records into interactive or printable formats.
- Outputs:
  Dashboard Views, Interactive UI Cards, PDF Exports, API Responses.
- Constraints:
  Reads ONLY from the Event Book. Absolutely NO astrology calculations or rule evaluations occur in this module.

===========================================================
3. DATA DIVISION & PRINCIPLES
===========================================================

-----------------------------------------------------------
Static Natal Data (KP Knowledge Book)
-----------------------------------------------------------
• Planets
• Houses
• Cusps
• Star Lords
• Sub Lords
• Significators
• Planet Strengths
• House Strengths
• Natal Event Promise
• KP Knowledge Book Version

-----------------------------------------------------------
Dynamic Context Data (Prediction Query)
-----------------------------------------------------------
• Current DBA (Dasha-Bhukti-Antara)
• Current Transit Snapshot
• Current Date
• Current Time
• User Event History (optional)
• User Notes (optional)

===========================================================
4. ZERO DUPLICATION RULES
===========================================================
- Rule Engine does NOT generate evidence.
- Evidence Engine does NOT execute rules.
- Decision Engine does NOT store events.
- Timeline Engine does NOT create events.
- Event Book does NOT evaluate astrology.
- Report Engine does NOT calculate astrology.
- Internal helper classes (KP Rule Registry, KP Rule Matcher, KP Rule Execution Context) must remain as private internal implementation helpers and never be exposed as top-level architectural modules.

===========================================================
5. CANONICAL EXECUTION MATRIX
===========================================================
1. NATAL ENGINE (Stage 1) - Decides IF promised.
2. ACTIVATION ENGINE (Stage 2) - Decides WHEN active.
3. DAILY ENGINE (Stage 3) - Decides TODAY'S trends.

###########################################################
# END OF SPECIFICATION
###########################################################`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawSpec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 40;
    const marginY = 50;
    const contentWidth = pageWidth - (marginX * 2);
    const bottomMargin = 40;

    let currentPage = 1;

    // Header helper
    const drawHeader = (title: string) => {
      // Top banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setTextColor(245, 158, 11); // amber-500
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.text("JHORAAI - ASTROLOGICAL RULE ENGINE SPECIFICATION", marginX, 24);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(title, pageWidth - marginX - doc.getTextWidth(title), 24);

      // Accent line
      doc.setFillColor(245, 158, 11); // amber-500
      doc.rect(0, 40, pageWidth, 2, "F");
    };

    // Footer helper
    const drawFooter = () => {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      
      // Page count
      const pageStr = `Page ${currentPage}`;
      doc.text(pageStr, pageWidth - marginX - doc.getTextWidth(pageStr), pageHeight - 20);
      doc.text("Confidential - Astrological Engineering Handbook", marginX, pageHeight - 20);
    };

    // 1. Cover / Title Page
    drawHeader("Executive Summary");
    
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ASTROLOGICAL RULE ENGINE", marginX, 100);
    doc.text("SPECIFICATION HANDBOOK", marginX, 130);

    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(marginX, 145, 150, 4, "F");

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, marginX, 175);
    doc.text("Framework Version: v1.0", marginX, 190);
    doc.text("Architecture: Sequential Tri-Stage Pipeline (Natal -> Activation -> Daily)", marginX, 205);

    // Executive summary
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("1. EXECUTIVE SUMMARY & ARCHITECTURE DESIGN PRINCIPLES", marginX, 250);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    
    const introText = [
      "The Astrological Rule Engine is an authoritative, deterministic, multi-layered processing engine built on classical Vedic Astrology principles and Krishnamurti Paddhati (KP) systems.",
      "",
      "The core pipeline consists of three separate, completely independent execution stages:",
      " - STAGE 1: NATAL ENGINE (Decides IF) - Evaluates long-term cosmic promises and structural capacity.",
      " - STAGE 2: ACTIVATION ENGINE (Decides WHEN) - Evaluates dasha (DBA) periods and slow-moving transit windows.",
      " - STAGE 3: DAILY ENGINE (Decides TODAY) - Computes transient lunar-cycles, daily moods, behaviors, and routines.",
      "",
      "These stages work sequentially to converge onto exact dates and moments of manifestation without any overlapping overrides."
    ];

    let summaryY = 270;
    introText.forEach((line) => {
      const splitLines = doc.splitTextToSize(line, contentWidth);
      splitLines.forEach((splitLine: string) => {
        doc.text(splitLine, marginX, summaryY);
        summaryY += 15;
      });
    });

    drawFooter();

    // 2. Add Page for Modules
    doc.addPage();
    currentPage++;
    drawHeader("System Architecture Modules");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("2. SYSTEM ARCHITECTURE MODULES", marginX, 70);

    const modulesList = [
      { name: "Astronomical Calculator", desc: "Responsible ONLY for stateless coordinate extraction and astronomical calculations." },
      { name: "KP Calculation Engine", desc: "Responsible ONLY for converting horoscope calculations into deterministic KP data (Planets, Houses, Cusps, Significators, Strengths, Natal Promise)." },
      { name: "KP Knowledge Book", desc: "Permanent deterministic repository containing ONLY static natal KP information. Generated once, never during prediction." },
      { name: "KP Rulebook", desc: "Permanent repository of KP rules. Contains ONLY classical rules grouped by 15 domains without calculation or execution logic." },
      { name: "Rule Engine", desc: "Responsible ONLY for executing KP rules and producing Rule Results. Does NOT generate evidence, events, or confidence." },
      { name: "Evidence Engine", desc: "Responsible ONLY for collecting: Supporting Evidence, Blocking Evidence, Satisfied Rules, Failed Rules, Evidence Weight, and Rule Lineage by aggregating Rule Results." },
      { name: "Decision Engine", desc: "Responsible ONLY for evaluating: Natal Promise + DBA + Transit + Evidence -> Final Decision. Stateless, no database persistence." },
      { name: "Timeline Engine", desc: "Responsible ONLY for estimating: Activation Window, Timing Range, Activation Strength, and Priority Window. It must NOT create events." },
      { name: "Event Book", desc: "The Single Source of Truth repository. It must NOT decide events, execute rules, or evaluate astrology. Persists Event ID, Decision, Evidence, Timeline, Confidence, and History." },
      { name: "Report Engine", desc: "Reads ONLY from the Event Book to produce PDF, UI, Dashboard, and API representations. Performs absolutely NO astrology calculations." }
    ];

    let modY = 95;
    modulesList.forEach((mod, index) => {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(245, 158, 11); // Amber
      doc.text(`${index + 1}. ${mod.name}`, marginX, modY);
      modY += 13;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const splitDesc = doc.splitTextToSize(mod.desc, contentWidth);
      splitDesc.forEach((line: string) => {
        doc.text(line, marginX, modY);
        modY += 13;
      });
      modY += 5; // spacing between modules
    });

    drawFooter();

    // 3. Add Plain Text Specs
    doc.addPage();
    currentPage++;
    drawHeader("Technical Specification");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("3. FULL ASTROLOGICAL RULE ENGINE SPECIFICATION", marginX, 70);

    doc.setFont("Courier", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);

    const specLines = rawSpec.split("\n");
    let specY = 90;

    specLines.forEach((line) => {
      // Check if line overflows height
      if (specY > pageHeight - bottomMargin) {
        drawFooter();
        doc.addPage();
        currentPage++;
        drawHeader("Technical Specification");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("3. FULL ASTROLOGICAL RULE ENGINE SPECIFICATION (Cont.)", marginX, 70);

        doc.setFont("Courier", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        specY = 90;
      }

      // Split long lines in raw spec (usually none, but just in case)
      const splitLines = doc.splitTextToSize(line, contentWidth);
      splitLines.forEach((sLine: string) => {
        // Highlight hashes or titles
        if (sLine.startsWith("#") || sLine.includes("PART ") || sLine.includes("ENGINE")) {
          doc.setFont("Courier", "bold");
          doc.setTextColor(180, 83, 9); // deep amber
        } else {
          doc.setFont("Courier", "normal");
          doc.setTextColor(30, 41, 59); // dark slate
        }
        doc.text(sLine, marginX, specY);
        specY += 10.5; // spacing
      });
    });

    drawFooter();

    // Save the document
    doc.save("Astrological_Rule_Engine_Specification.pdf");
  };

  const containerStyle = isDark 
    ? "bg-slate-900/60 border-indigo-500/20 text-slate-100" 
    : "bg-white border-neutral-200 text-neutral-800 shadow-sm";

  const cardStyle = isDark 
    ? "bg-slate-950/60 border-slate-800 text-slate-100" 
    : "bg-neutral-50 border-neutral-200 text-neutral-800";

  return (
    <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`}>
      {/* Header Banner */}
      <div className="border-b border-indigo-500/10 pb-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-sans font-semibold flex items-center gap-2 text-amber-500 dark:text-amber-400">
            <Cpu className="w-6 h-6 animate-pulse" />
            Astrological Rule Engine Specification v1.0
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative, deterministic framework separating birth promises (natal), timing periods (activation), and daily routines (daily).
          </p>
        </div>
        
        {/* Tab Navigation & Export PDF Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap bg-slate-950/40 p-1 rounded-xl border border-indigo-500/10 max-w-full gap-1">
            <button
              onClick={() => setActiveTab("spec")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "spec"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 inline mr-1" />
              Raw Specification
            </button>
            <button
              onClick={() => setActiveTab("stages")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "stages"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Layers className="w-3.5 h-3.5 inline mr-1" />
              Core Stages
            </button>
            <button
              onClick={() => setActiveTab("modules")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "modules"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 inline mr-1" />
              Modules
            </button>
            <button
              onClick={() => setActiveTab("interactive")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "interactive"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1" />
              Interactive Flow
            </button>
          </div>

          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download the complete handbook and specification as PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Info Warning */}
      <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/25 flex gap-3">
        <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase font-mono tracking-wider">
            Engine Design Principle
          </span>
          <p className="text-xs text-slate-300 font-medium">
            <strong className="text-amber-400 font-semibold">NATAL</strong> decides <em className="underline">IF</em>. &nbsp;|&nbsp;&nbsp;
            <strong className="text-amber-400 font-semibold">ACTIVATION</strong> decides <em className="underline">WHEN</em>. &nbsp;|&nbsp;&nbsp;
            <strong className="text-amber-400 font-semibold">DAILY</strong> decides <em className="underline">TODAY</em>.
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            These three sequential stages never override one another. Long-term events (Marriage, Promotion) are exclusively reserved for long-term evaluations and blocked from daily routines.
          </p>
        </div>
      </div>

      {/* Tab: Spec */}
      {activeTab === "spec" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Plain Text Engine Specification
            </h4>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportPDF}
                className="px-2.5 py-1.5 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer w-full sm:w-auto justify-center"
              >
                <FileDown className="w-3.5 h-3.5" />
                Export Complete PDF
              </button>
              <button
                onClick={copyToClipboard}
                className="px-2.5 py-1.5 text-[11px] font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-all flex items-center gap-1 w-full sm:w-auto justify-center"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Spec
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 max-h-[500px] overflow-auto font-mono text-xs p-4 text-slate-300 leading-relaxed">
            <pre className="whitespace-pre">{rawSpec}</pre>
          </div>
        </div>
      )}

      {/* Tab: Stages */}
      {activeTab === "stages" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-5 rounded-xl border ${cardStyle} space-y-3 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full filter blur-xl" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                Stage 1
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">NATAL</span>
            </div>
            <h4 className="text-base font-semibold text-slate-100">Decides IF</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates structural birth promises, house significators (L1 to L6), and divisional strengths. Evaluates if an event is promised in the natal blueprint.
            </p>
            <div className="border-t border-slate-800/60 pt-3 space-y-1 text-[11px] text-slate-400">
              <div className="font-semibold text-slate-300">Inputs Analyzed:</div>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Birth Chart, Placidus Cusps</li>
                <li>Planets, Nakshatras, Pada</li>
                <li>Sublords, Sub-Sublords (SSL)</li>
                <li>House Lords, Divisional Matrix</li>
              </ul>
            </div>
          </div>

          <div className={`p-5 rounded-xl border ${cardStyle} space-y-3 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full filter blur-xl" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                Stage 2
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">ACTIVATION</span>
            </div>
            <h4 className="text-base font-semibold text-slate-100">Decides WHEN</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes Vimshottari Mahadasha down to Prana level, Chara Dashas, and slow-moving transits (Jupiter, Saturn, Rahu, Ketu) to open or close activation windows.
            </p>
            <div className="border-t border-slate-800/60 pt-3 space-y-1 text-[11px] text-slate-400">
              <div className="font-semibold text-slate-300">Active Windows:</div>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Window Open</li>
                <li>Window Weak</li>
                <li>Window Closed</li>
              </ul>
            </div>
          </div>

          <div className={`p-5 rounded-xl border ${cardStyle} space-y-3 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full filter blur-xl" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                Stage 3
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">DAILY</span>
            </div>
            <h4 className="text-base font-semibold text-slate-100">Decides TODAY</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tracks fast transiting bodies (Moon, Sun, Mercury, etc.) against planet DNA, natal sublords, and 1 to 12 house activations to predict daily mood, behavioral cycles, and theme routines.
            </p>
            <div className="border-t border-slate-800/60 pt-3 space-y-1 text-[11px] text-slate-400">
              <div className="font-semibold text-slate-300">Outputs Triggered:</div>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Emotional Moods & Mind-States</li>
                <li>Behavioral Tendencies</li>
                <li>Auspicious Daily Themes</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Modules */}
      {activeTab === "modules" && (
        <div className="space-y-4">
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            V1.0 System Architecture Modules
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Astronomical Calculator", desc: "Responsible ONLY for stateless coordinate extraction and astronomical calculations." },
              { name: "KP Calculation Engine", desc: "Responsible ONLY for converting horoscope calculations into deterministic KP data (Planets, Houses, Cusps, Significators, Strengths, Natal Promise)." },
              { name: "KP Knowledge Book", desc: "Permanent deterministic repository containing ONLY static natal KP information. Generated once, never during prediction." },
              { name: "KP Rulebook", desc: "Permanent repository of KP rules. Contains ONLY classical rules grouped by 15 domains without calculation or execution logic." },
              { name: "Rule Engine", desc: "Responsible ONLY for executing KP rules and producing Rule Results. Does NOT generate evidence, events, or confidence." },
              { name: "Evidence Engine", desc: "Responsible ONLY for collecting: Supporting Evidence, Blocking Evidence, Satisfied Rules, Failed Rules, Evidence Weight, and Rule Lineage by aggregating Rule Results." },
              { name: "Decision Engine", desc: "Responsible ONLY for evaluating: Natal Promise + DBA + Transit + Evidence -> Final Decision. Stateless, no database persistence." },
              { name: "Timeline Engine", desc: "Responsible ONLY for estimating: Activation Window, Timing Range, Activation Strength, and Priority Window. It must NOT create events." },
              { name: "Event Book", desc: "The Single Source of Truth repository. It must NOT decide events, execute rules, or evaluate astrology. Persists Event ID, Decision, Evidence, Timeline, Confidence, and History." },
              { name: "Report Engine", desc: "Reads ONLY from the Event Book to produce PDF, UI, Dashboard, and API representations. Performs absolutely NO astrology calculations." }
            ].map((mod, i) => (
              <div key={i} className={`p-4 rounded-xl border ${cardStyle} flex gap-3`}>
                <div className="w-7 h-7 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono font-bold">{i + 1}</span>
                </div>
                <div>
                  <h5 className="text-xs font-mono font-semibold text-amber-400">{mod.name}</h5>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Interactive */}
      {activeTab === "interactive" && (
        <div className="space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <h4 className="text-sm font-semibold text-slate-200">Execution Runtime Pipeline Simulation</h4>
            <p className="text-xs text-slate-400">
              Trace how a single birth profile coordinates converge sequentially through our rule engines to produce live client forecasts.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4">
            <div className={`p-4 rounded-xl border ${cardStyle} w-44 text-center font-mono space-y-2`}>
              <div className="text-[10px] text-red-400 font-bold">1. NATAL ENGINE</div>
              <div className="text-xs font-semibold text-slate-200">KP, Parashari, Jaimini</div>
              <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 py-1 rounded">PROMISED</div>
            </div>

            <ArrowRight className="w-5 h-5 text-indigo-400 hidden md:block" />

            <div className={`p-4 rounded-xl border ${cardStyle} w-44 text-center font-mono space-y-2`}>
              <div className="text-[10px] text-amber-400 font-bold">2. TIMING PERIODS</div>
              <div className="text-xs font-semibold text-slate-200">DBA & Vimshottari</div>
              <div className="text-[10px] text-amber-400 font-bold bg-amber-500/10 py-1 rounded">WINDOW OPEN</div>
            </div>

            <ArrowRight className="w-5 h-5 text-indigo-400 hidden md:block" />

            <div className={`p-4 rounded-xl border ${cardStyle} w-44 text-center font-mono space-y-2`}>
              <div className="text-[10px] text-green-400 font-bold">3. TRANSITS</div>
              <div className="text-xs font-semibold text-slate-200">Lunar Chandra Gochara</div>
              <div className="text-[10px] text-green-400 font-bold bg-green-500/10 py-1 rounded">ACTIVE TODAY</div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <h5 className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Evaluation Matrix Conclusion
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an event is <strong className="text-slate-300">not promised</strong> in Stage 1, it can never manifest, regardless of active dasha cycles or transit triggers. If it is promised, the <strong className="text-slate-300">Activation Engine</strong> schedules the chronological period, and the <strong className="text-slate-300">Daily Engine</strong> triggers the precise moment or routine.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
