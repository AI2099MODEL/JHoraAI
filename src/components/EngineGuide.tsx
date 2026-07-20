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
  Heart
} from "lucide-react";

interface EngineGuideProps {
  isDark: boolean;
}

export default function EngineGuide({ isDark }: EngineGuideProps) {
  const [activeTab, setActiveTab] = useState<"spec" | "modules" | "stages" | "interactive">("spec");
  const [copied, setCopied] = useState(false);

  const rawSpec = `###############################################
# ASTROLOGICAL RULE ENGINE SPECIFICATION v1.0 #
###############################################

ENGINE
{
    MODULES
    {
        NatalEngine
        ActivationEngine
        DailyEngine
        RuleCompiler
        RuleCache
        DecisionEngine
        EvidenceEngine
        EventBook
    }
}

#################################################
# RULE OBJECT
#################################################

Rule
{
    RuleID
    Category
    EventID
    System
    Stage

    Inputs[]
    Operator
    Expected

    Priority

    Weight

    Enabled

    Evidence

    Result
}

#################################################
# STAGES
#################################################

Stage =

NATAL
ACTIVATION
DAILY

#################################################
# NATAL ENGINE
#################################################

INPUTS

Birth Chart
Cusps
Planets
Stars
Subs
SSL
House Lords
Karakas
Divisional Charts

RUN

KP Rules

↓

Parashari Rules

↓

Jaimini Rules

↓

Decision Engine

OUTPUT

PASS

FAIL

WEAK

MODERATE

STRONG

#################################################
# ACTIVATION ENGINE
#################################################

INPUTS

Current DBA

Current Vimshottari

Current Chara Dasha

Transit Jupiter

Transit Saturn

Transit Rahu

Transit Ketu

OUTPUT

Window Open

Window Weak

Window Closed

#################################################
# DAILY ENGINE
#################################################

INPUTS

Transit Planet

Transit Star

Transit Sub

Natal Planet

Natal Star

Natal Sub

SSL

Planet DNA

House Activation

RUN

Planet

↓

Star

↓

Sub

↓

Natal Planet

↓

Natal Star

↓

Natal Sub

↓

SSL

↓

Rule Evaluation

OUTPUT

Mood

Behaviour

Daily Themes

Energy

Communication

Finance

Travel

Creativity

Stress

Meditation

#################################################
# DAILY EVENT FILTER
#################################################

Allowed

Mood

Behaviour

Energy

Learning

Travel

Communication

Productivity

Meetings

Health Trends

Creativity

Social

Focus

Blocked

Marriage

Promotion

Child Birth

Court Case

Property Purchase

Divorce

Settlement

Inheritance

Major Surgery

Foreign Settlement

#################################################
# NATAL EVENT FILTER
#################################################

Marriage

Second Marriage

Divorce

Love Marriage

Career

Promotion

Business

Children

Property

Education

Litigation

Health

Foreign

Inheritance

Finance

Longevity

#################################################
# DECISION ENGINE
#################################################

KP

PASS/FAIL

Parashari

PASS/FAIL

Jaimini

PASS/FAIL

↓

Final Decision

STRONG

MODERATE

WEAK

CONTRADICTORY

NOT PROMISED

#################################################
# EVIDENCE ENGINE
#################################################

Collect

Matched Rules

Failed Rules

Supporting Houses

Obstructing Houses

Transit Evidence

Planet Evidence

Generate

Human Explanation

Technical Explanation

#################################################
# RULE COMPILER
#################################################

Markdown Rules

↓

Syntax Validation

↓

Conflict Detection

↓

Compile

↓

Compiled JSON

↓

Rule Cache

↓

Reload Engine

###############################################
# RUNTIME
###############################################

Chart

↓

Natal Engine

↓

Activation Engine

↓

Daily Engine

↓

Evidence Engine

↓

Decision Engine

↓

Event Book

↓

UI

###############################################
# RULE TEMPLATE
###############################################

RuleID

KP-REL001-01

Stage

NATAL

System

KP

Input

CSL7

Operator

SIGNIFIES

Expected

2,7,11

Priority

HIGH

Weight

CONFIGURABLE

Result

PASS

###############################################
# EVENT TEMPLATE
###############################################

REL001

Marriage Promise

Stage

NATAL

Rules

KP

PAR

JAI

Output

Promised

Moderate

Strong

Weak

Not Promised

###############################################
# DAILY TEMPLATE
###############################################

DAY001

Emotional Stability

Stage

DAILY

Rules

Transit Moon

Moon Star

Moon Sub

House 1

House 4

House 12

Output

Very High

High

Medium

Low

###############################################
# ENGINE PRINCIPLE
###############################################

NATAL decides IF.

ACTIVATION decides WHEN.

DAILY decides TODAY.

These three stages NEVER override one another.

###############################################################
# PART 13 — EXECUTION PIPELINE
# Unified Astrological Processing Flow
###############################################################

STEP 1
LOAD CHART

↓

Birth Details

Date

Time

Latitude

Longitude

Timezone

↓

Generate

D1

D9

D10

D7

D4

KP Cusps

Planet Positions

Nakshatras

Subs

SSL

House Lords

Natural Karakas

Jaimini Karakas

Arudha

Upapada

Planet Strength

Doshas

Yogas

Planet DNA

↓

Cache All Data

###############################################################

STEP 2

RULE COMPILATION

↓

Load

master_astro_handbook.md

↓

Syntax Validation

↓

Conflict Detection

↓

Rule Compilation

↓

compiled_rules.json

↓

Memory Cache

###############################################################

STEP 3

NATAL PROMISE ENGINE

KP

↓

Evaluate KP Rules

↓

Parashari

↓

Evaluate Classical Rules

↓

Jaimini

↓

Evaluate Jaimini Rules

↓

Decision Engine

↓

Event Promise

PASS

FAIL

WEAK

MODERATE

STRONG

###############################################################

STEP 4

ACTIVATION ENGINE

Load Current

Vimshottari

DBA

Chara Dasha

Transit Jupiter

Transit Saturn

Transit Rahu

Transit Ketu

↓

Evaluate

Activation Rules

↓

Output

Inactive

Weak Window

Moderate Window

Strong Window

###############################################################

STEP 5

DAILY ENGINE

Load

Current Date

↓

Transit Planet

↓

Transit Star

↓

Transit Sub

↓

Natal Planet

↓

Natal Star

↓

Natal Sub

↓

SSL

↓

Planet DNA

↓

House Activation

↓

Daily Rule Evaluation

↓

Daily Output

Mood

Behaviour

Focus

Energy

Travel

Communication

Finance

Meditation

Stress

Creativity

###############################################################

STEP 6

EVENT FILTER

IF Event = Daily

Allow only

Mood

Behaviour

Energy

Communication

Travel

Learning

Productivity

Health Trend

Creativity

Social

ELSE

Reject

Marriage

Promotion

Child Birth

Property

Litigation

Settlement

Divorce

Inheritance

Major Surgery

###############################################################

STEP 7

EVIDENCE ENGINE

Collect

Matched Rules

Failed Rules

House Evidence

Planet Evidence

Transit Evidence

Strength Evidence

Dosha Evidence

Yoga Evidence

↓

Generate

Evidence Report

###############################################################

STEP 8

DECISION ENGINE

KP

PASS/FAIL

↓

Parashari

PASS/FAIL

↓

Jaimini

PASS/FAIL

↓

Decision Matrix

PASS PASS PASS

→ STRONG

PASS PASS FAIL

→ MODERATE

PASS FAIL FAIL

→ WEAK

FAIL PASS PASS

→ CONTRADICTORY

FAIL FAIL FAIL

→ NOT PROMISED

###############################################################

STEP 9

EXPLANATION ENGINE

Generate

Human Explanation

Technical Explanation

Evidence

Failed Rules

Successful Rules

Suggested Timing

Confidence

###############################################################

STEP 10

EVENT BOOK

Store

Event ID

Timestamp

Natal Verdict

Activation Verdict

Daily Verdict

Evidence

Explanation

History

User Notes

###############################################################

STEP 11

USER INTERFACE

Life Report

↓

Today's Forecast

↓

Activation Windows

↓

Evidence Viewer

↓

Rule Viewer

↓

Timeline

↓

Export PDF

###############################################################

CORE PRINCIPLE

IF

↓

NATAL ENGINE

Determines

"Can this event happen?"

WHEN

↓

ACTIVATION ENGINE

Determines

"When is the window open?"

TODAY

↓

DAILY ENGINE

Determines

"What is active today?"

These engines are completely independent.

No Daily Rule can override a failed Natal Promise.

No Transit can create an event that does not exist in the Natal Promise.

Activation only releases what Natal has already promised.

###############################################################

###############################################################
RULE DECISION ENGINE
Decision Processing Framework
###############################################################

PURPOSE

The Rule Decision Engine receives validated rule results from the
Rule Engine and determines the final astrological verdict for each
event without modifying or creating new rules.

###############################################################

INPUT

Compiled Rules

↓

Rule Evaluation Results

↓

Evidence Objects

↓

Planetary Data

↓

House Data

↓

Dasha Data

↓

Transit Data

###############################################################

PROCESS

Load Rule Results

↓

Group by Event ID

↓

Evaluate Rule Dependencies

↓

Check Blocking Rules

↓

Check Supporting Rules

↓

Count Evidence

↓

Resolve Conflicts

↓

Generate Final Verdict

###############################################################

DECISION STATES

PASS

FAIL

PARTIAL

WEAK

MODERATE

STRONG

CONTRADICTORY

NOT PROMISED

###############################################################

SUPPORTING RULES

Supporting rules increase confidence for an event.

Example

Marriage Promise

↓

KP Rule

PASS

↓

Parashari Rule

PASS

↓

Jaimini Rule

PASS

↓

Supporting Evidence = HIGH

###############################################################

BLOCKING RULES

Blocking rules reduce or deny confidence.

Example

Marriage Promise

↓

Severe Affliction Rule

PASS

↓

Marriage Delay Rule

PASS

↓

Marriage Denial Rule

PASS

↓

Decision = CONTRADICTORY

###############################################################

RULE DEPENDENCY

Some rules require another rule to pass before evaluation.

Example

Marriage Timing Rule

depends on

Marriage Promise Rule

If Marriage Promise = FAIL

↓

Marriage Timing = NOT EVALUATED

###############################################################

CONFLICT RESOLUTION

If multiple rules produce opposing results

↓

Evaluate Rule Priority

↓

Evaluate Supporting Evidence

↓

Evaluate Blocking Evidence

↓

Generate Final Decision

###############################################################

DECISION OBJECT

EventID

Rule Results

Supporting Rules

Blocking Rules

Evidence Count

Final Verdict

Confidence Level

Explanation Reference

Timestamp

###############################################################

OUTPUT

The Rule Decision Engine returns a validated decision object to the
next processing stage.

No user-facing interpretation is generated in this module.

###############################################################

REFERENCE

The validated decision object is forwarded to the Event Book module
for storage, explanation generation, timeline management, reporting,
and presentation.

Refer to:

Event Book Manual

###############################################################

ENGINE PRINCIPLE

The Rule Decision Engine never creates rules.

The Rule Decision Engine never modifies rules.

The Rule Decision Engine only evaluates the outcomes produced by the
Rule Engine and produces a deterministic final verdict.

###############################################################

###############################################################
PART 16 — RULE EXECUTION ENGINE
Rule Processing Framework
###############################################################

PURPOSE

The Rule Execution Engine is responsible for executing compiled
astrological rules in a deterministic sequence and returning
validated rule results to the Rule Decision Engine.

The execution engine does not interpret results.
It only evaluates rules.

###############################################################

INPUT

Compiled Rule Library

↓

Natal Chart Data

↓

Planetary Data

↓

House Data

↓

KP Cusps

↓

Nakshatra Data

↓

Sub Lords

↓

Sub-Sub Lords

↓

Divisional Charts

↓

Dasha Data

↓

Transit Data

###############################################################

EXECUTION ORDER

Initialize Engine

↓

Load Compiled Rules

↓

Validate Inputs

↓

Select Applicable Rules

↓

Execute Rules

↓

Generate Rule Results

↓

Generate Evidence

↓

Return Results

###############################################################

RULE EXECUTION PHASES

Phase 1

Input Validation

↓

Phase 2

Rule Selection

↓

Phase 3

Rule Evaluation

↓

Phase 4

Evidence Collection

↓

Phase 5

Result Generation

↓

Phase 6

Return Execution Results

###############################################################

RULE SELECTION

Only enabled rules are executed.

Rules are filtered by

Stage

System

Category

Event

Priority

Dependencies

###############################################################

RULE EXECUTION

Each rule is executed independently.

Rules never modify another rule.

Rules never modify chart data.

Rules only evaluate supplied inputs.

###############################################################

EXECUTION RESULT

RuleID

Execution Status

PASS

FAIL

PARTIAL

UNKNOWN

Evidence

Execution Time

###############################################################

DEPENDENCY CHECK

If dependency exists

↓

Verify dependency

↓

Execute Rule

Otherwise

↓

Skip Rule

###############################################################

ERROR HANDLING

Invalid Input

↓

Missing Data

↓

Missing Dependency

↓

Disabled Rule

↓

Execution Timeout

↓

Return Error Status

###############################################################

PERFORMANCE

Compiled rules remain memory cached.

Chart data is immutable during execution.

Repeated calculations are avoided through cache reuse.

###############################################################

OUTPUT

The Rule Execution Engine returns

Rule Results

Evidence Objects

Execution Metadata

Dependency Status

to

Rule Decision Engine

###############################################################

REFERENCE

Next Module

Rule Decision Engine

Refer to

Rule Decision Engine Manual

###############################################################

ENGINE PRINCIPLES

• Execution is deterministic.
• Execution order is fixed.
• Rules are independent.
• Chart data is read-only.
• No interpretation occurs during execution.
• No Event Book operations occur during execution.
• No UI operations occur during execution.

###############################################################

###############################################################
RULE VALIDATION ENGINE
Validation and Consistency Framework
###############################################################

PURPOSE

The Rule Validation Engine verifies that all executed rule results
are logically consistent, astrologically valid, and complete before
they are accepted by the Decision Engine.

The Validation Engine never creates rules.

The Validation Engine never modifies rules.

The Validation Engine only validates execution results.

###############################################################

INPUT

Rule Execution Results

↓

Evidence Objects

↓

Dependency Status

↓

Chart Data

↓

Event Context

###############################################################

VALIDATION PROCESS

Load Rule Results

↓

Verify Input Completeness

↓

Verify Rule Dependencies

↓

Verify Astrological Consistency

↓

Verify Duplicate Results

↓

Verify Blocking Rules

↓

Verify Supporting Rules

↓

Generate Validation Status

###############################################################

VALIDATION CHECKS

Input Validation

Dependency Validation

Rule Integrity

Evidence Integrity

Duplicate Detection

Conflict Detection

Stage Validation

System Validation

###############################################################

DEPENDENCY VALIDATION

Required Rule

↓

Exists

↓

PASS

Otherwise

↓

FAIL VALIDATION

###############################################################

DUPLICATE VALIDATION

Same RuleID

↓

Same Event

↓

Ignore Duplicate

###############################################################

CONFLICT VALIDATION

Supporting Rule

PASS

↓

Blocking Rule

PASS

↓

Mark

CONFLICT

↓

Forward to Rule Decision Engine

###############################################################

SYSTEM VALIDATION

KP Rules

Validated Independently

↓

Parashari Rules

Validated Independently

↓

Jaimini Rules

Validated Independently

↓

Daily Rules

Validated Independently

###############################################################

VALIDATION STATUS

VALID

INVALID

INCOMPLETE

CONFLICT

SKIPPED

###############################################################

VALIDATION OBJECT

ValidationID

EventID

Validated Rules

Failed Rules

Conflict Rules

Dependency Status

Validation Status

Timestamp

###############################################################

OUTPUT

Validated Rule Results

↓

Rule Decision Engine

###############################################################

REFERENCE

Previous Module

Rule Execution Engine

Next Module

Rule Decision Engine

###############################################################

ENGINE PRINCIPLES

• Validation never executes rules.
• Validation never changes chart data.
• Validation never changes rule definitions.
• Validation only verifies correctness.
• Invalid rule results are rejected before decision making.
• All validation actions are deterministic and repeatable.

###############################################################`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawSpec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="border-b border-indigo-500/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-sans font-semibold flex items-center gap-2 text-amber-500 dark:text-amber-400">
            <Cpu className="w-6 h-6 animate-pulse" />
            Astrological Rule Engine Specification v1.0
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative, deterministic framework separating birth promises (natal), timing periods (activation), and daily routines (daily).
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-slate-950/40 p-1 rounded-xl border border-indigo-500/10 shrink-0 self-start md:self-auto overflow-x-auto max-w-full">
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
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Plain Text Engine Specification
            </h4>
            <button
              onClick={copyToClipboard}
              className="px-2.5 py-1.5 text-[11px] font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-all flex items-center gap-1"
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
          <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 max-h-[500px] overflow-y-auto font-mono text-xs p-4 text-slate-300 leading-relaxed">
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
              { name: "NatalEngine", desc: "Decides birth promises (IF) by compiling KP, Parashari, and Jaimini rules into direct PASS, FAIL, WEAK, or STRONG flags." },
              { name: "ActivationEngine", desc: "Finds active timing periods (WHEN) by processing current DBA (Maha, Antar, Antara, Sookshma, Prana) and major transits." },
              { name: "DailyEngine", desc: "Computes daily trends (TODAY) using transiting Moon parameters, house significator frequencies, and fast planetary alignments." },
              { name: "RuleExecutionEngine", desc: "Executes compiled astrological rules in a deterministic sequence, supporting dependencies and caching." },
              { name: "RuleValidationEngine", desc: "Verifies execution results for logical consistency, dependency integrity, and system-level correctness." },
              { name: "RuleCompiler", desc: "Ingests raw markdown guidelines from the Master Handbook, validates syntax, identifies conflicts, and builds compiled JSON rulebooks." },
              { name: "RuleCache", desc: "In-memory database storing compiled rules for fast retrieval, supporting hot reloading without server downtime." },
              { name: "DecisionEngine", desc: "Resolves conflicting multi-system rulesets into a unified final promise evaluation: STRONG, MODERATE, WEAK, or CONTRADICTORY." },
              { name: "EvidenceEngine", desc: "Generates clear natural-language human and technical explanations by summarizing matched, failed, supporting, and obstructing house rules." },
              { name: "EventBook", desc: "Maintains a secure, persistent historical chronological log of all rules parsed and events triggered, enabling full audits." }
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
