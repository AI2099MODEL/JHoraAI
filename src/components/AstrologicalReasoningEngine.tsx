/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Cpu,
  RefreshCw,
  GitMerge,
  Server,
  Zap,
  Info,
  Layers,
  ChevronRight,
  User,
  Activity,
  AlertCircle
} from "lucide-react";
import { AstrologyData } from "../lib/astrology";
import { calculateUnifiedRelationshipEvidence, UnifiedEvidenceItem } from "../lib/rules/unifiedRelationshipEvidenceEngine";

interface AstrologicalReasoningEngineProps {
  astrologyData: AstrologyData;
  isDark: boolean;
}

export const AstrologicalReasoningEngine: React.FC<AstrologicalReasoningEngineProps> = ({
  astrologyData,
  isDark
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>("Marriage Promise");
  const [targetAge, setTargetAge] = useState<number>(28);

  // Compute live unified evidence
  const liveEvidence = useMemo(() => {
    return calculateUnifiedRelationshipEvidence(astrologyData, undefined, targetAge);
  }, [astrologyData, targetAge]);

  const topics = [
    "Marriage Promise",
    "Marriage Timing",
    "Marriage Delay",
    "Marriage Denial",
    "Love Marriage",
    "Arranged Marriage",
    "Secret Relationship",
    "Multiple Relationships",
    "Extra-marital Relationship",
    "Divorce",
    "Separation",
    "Remarriage",
    "Spouse Nature",
    "Marriage Happiness",
    "Relationship Timeline"
  ];

  // 1. Evidence Ranking
  const evidenceRanking = useMemo(() => {
    const activeEvidence = liveEvidence[selectedTopic] || {};
    const strong: string[] = [];
    const moderate: string[] = [];
    const weak: string[] = [];
    const missing: string[] = [];

    const expectedSystems = ["KP", "Vedic", "Jaimini", "Nadi", "Lal Kitab", "Tajik", "Western"];

    expectedSystems.forEach((sys) => {
      const item = activeEvidence[sys] as UnifiedEvidenceItem | undefined;
      if (!item) {
        missing.push(sys);
      } else {
        const desc = `[${sys}] Status: ${item.status} (${item.confidence}% confidence) with decisions ${item.decisionIds.join(", ")}`;
        if (item.confidence >= 75) {
          strong.push(desc);
        } else if (item.confidence >= 50) {
          moderate.push(desc);
        } else {
          weak.push(desc);
        }
      }
    });

    return { strong, moderate, weak, missing };
  }, [liveEvidence, selectedTopic]);

  // 2. Conflict & Contradiction Detection
  const conflictAnalysis = useMemo(() => {
    const activeEvidence = liveEvidence[selectedTopic] || {};
    const conflictingSystems: string[] = [];
    const conflictingRules: string[] = [];
    const contradictoryConclusions: string[] = [];

    const entries = Object.entries(activeEvidence) as [string, UnifiedEvidenceItem][];

    // Identify conflicting systems (e.g. one system is PASS, one is FAIL)
    const passes = entries.filter(([, item]) => item.status === "PASS");
    const fails = entries.filter(([, item]) => item.status === "FAIL");
    const conditionals = entries.filter(([, item]) => item.status === "CONDITIONAL");

    if (passes.length > 0 && fails.length > 0) {
      conflictingSystems.push(
        `Direct structural clash: Systems [${passes.map(([k]) => k).join(", ")}] resolved to PASS, while [${fails.map(([k]) => k).join(", ")}] resolved to FAIL.`
      );
      contradictoryConclusions.push(
        `Absolute contradiction identified: Positive relationship indicators directly oppose restrictive structural obstructions for ${selectedTopic}.`
      );
    }

    // Identify conflicting rules (within active items)
    entries.forEach(([sys, item]) => {
      if (item.supportingEvidence.length > 0 && item.contradictingEvidence.length > 0) {
        conflictingRules.push(
          `System [${sys}] reported both supporting and contradicting evidence for ${selectedTopic}, indicating active internal planetary struggle.`
        );
      }
    });

    return {
      conflictingSystems,
      conflictingRules,
      contradictoryConclusions,
      hasConflicts: conflictingSystems.length > 0 || conflictingRules.length > 0 || contradictoryConclusions.length > 0
    };
  }, [liveEvidence, selectedTopic]);

  // 3. Decision Consistency
  const decisionConsistency = useMemo(() => {
    const activeEvidence = liveEvidence[selectedTopic] || {};
    const unsupportedConclusions: string[] = [];
    const supportedConclusions: string[] = [];

    const expectedSystems = ["KP", "Vedic", "Jaimini", "Nadi", "Lal Kitab", "Tajik", "Western"];

    expectedSystems.forEach((sys) => {
      const item = activeEvidence[sys] as UnifiedEvidenceItem | undefined;
      if (item) {
        // If status is not conditional, but decision IDs are empty, it's unsupported
        if (item.status !== "CONDITIONAL" && item.decisionIds.length === 0) {
          unsupportedConclusions.push(`System [${sys}] resolved to status ${item.status} but lacks rule execution Decision IDs.`);
        } else if (item.decisionIds.length > 0) {
          supportedConclusions.push(`System [${sys}] conclusion is securely backed by decision ${item.decisionIds.join(", ")}.`);
        }
      }
    });

    return {
      supportedConclusions,
      unsupportedConclusions,
      isConsistent: unsupportedConclusions.length === 0
    };
  }, [liveEvidence, selectedTopic]);

  // 4. Cross-System Agreement and Score Contribution Breakdown
  const confidenceBreakdown = useMemo(() => {
    const activeEvidence = liveEvidence[selectedTopic] || {};
    const expectedSystems = ["KP", "Vedic", "Jaimini", "Nadi", "Lal Kitab", "Tajik", "Western"];

    let totalWeight = 0;
    let computedSystems = 0;

    const breakdownList = expectedSystems.map((sys) => {
      const item = activeEvidence[sys] as UnifiedEvidenceItem | undefined;
      let contributionScore = 0;
      let statusStr = "NOT EVALUATED";

      if (item) {
        statusStr = item.status;
        computedSystems++;
        if (item.status === "PASS") contributionScore = 100;
        else if (item.status === "CONDITIONAL") contributionScore = 50;
        else contributionScore = 0;
        totalWeight += contributionScore;
      }

      return {
        system: sys,
        status: statusStr,
        rawContribution: contributionScore,
        confidence: item ? item.confidence : 0
      };
    });

    const finalConsensusScore = computedSystems > 0 ? Math.round(totalWeight / computedSystems) : 0;

    // Calculate real normalized percentage contribution
    const detailedContributions = breakdownList.map((b) => {
      const share = computedSystems > 0 ? Math.round(b.rawContribution / computedSystems) : 0;
      return {
        ...b,
        shareOfConsensus: share
      };
    });

    return {
      finalConsensusScore,
      detailedContributions,
      computedSystems
    };
  }, [liveEvidence, selectedTopic]);

  // Styling
  const containerStyle = isDark
    ? "bg-slate-900 border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-800";

  const cardStyle = isDark
    ? "bg-slate-950/40 border-slate-900"
    : "bg-slate-50 border-slate-200";

  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const textHeading = isDark ? "text-white" : "text-slate-900";

  return (
    <div className={`p-6 rounded-2xl border ${containerStyle} space-y-8`}>
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/10 pb-6">
        <div>
          <h3 className={`text-xl font-sans font-semibold flex items-center gap-2.5 ${textHeading}`}>
            <Brain className="w-6 h-6 text-indigo-500" />
            Master Astrological Reasoning Engine
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Structural consistency diagnostics suite. Audits conflicting rules, contradiction vectors, and system contributions.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Cpu className="w-4 h-4 text-indigo-400" />
          Real-time Audit Engine Ready
        </div>
      </div>

      {/* Target Selector Bar */}
      <div className={`p-4 rounded-xl border ${cardStyle} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Choose Diagnostic Scope Topic</span>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none border transition-all ${
              isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target Evaluation Age</span>
            <input
              type="number"
              value={targetAge}
              onChange={(e) => setTargetAge(Math.max(1, parseInt(e.target.value) || 28))}
              className={`w-20 px-2.5 py-1 rounded-lg text-xs border ${
                isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Evidence Ranking & Conflict Detection (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Evidence Ranking */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              Evidence Quality Ranking
            </span>

            <div className={`p-5 rounded-xl border ${cardStyle} space-y-4`}>
              {/* Strong Evidence */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block">
                  ▲ Strong Evidence (Confidence ≥ 75%)
                </span>
                <div className="space-y-1 pl-2">
                  {evidenceRanking.strong.map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                  {evidenceRanking.strong.length === 0 && (
                    <span className="text-xs text-slate-500 italic block">No strong evidence logs captured for this topic.</span>
                  )}
                </div>
              </div>

              {/* Moderate Evidence */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/10">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block">
                  ■ Moderate Evidence (Confidence 50% - 74%)
                </span>
                <div className="space-y-1 pl-2">
                  {evidenceRanking.moderate.map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                  {evidenceRanking.moderate.length === 0 && (
                    <span className="text-xs text-slate-500 italic block">No moderate evidence logs captured.</span>
                  )}
                </div>
              </div>

              {/* Weak Evidence */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/10">
                <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-widest block">
                  ▼ Weak Evidence (Confidence &lt; 50%)
                </span>
                <div className="space-y-1 pl-2">
                  {evidenceRanking.weak.map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                  {evidenceRanking.weak.length === 0 && (
                    <span className="text-xs text-slate-500 italic block">No weak evidence logs captured.</span>
                  )}
                </div>
              </div>

              {/* Missing Evidence */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/10">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  ◌ Missing/Uncomputed System Evidence
                </span>
                <div className="flex flex-wrap gap-1.5 pl-2">
                  {evidenceRanking.missing.map((sys) => (
                    <span
                      key={sys}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800/40 text-slate-400 border border-slate-800"
                    >
                      {sys}
                    </span>
                  ))}
                  {evidenceRanking.missing.length === 0 && (
                    <span className="text-xs text-slate-500 italic">All 7 systems evaluated.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Conflict & Contradiction Detection */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Conflict & Contradiction detection
            </span>

            <div className={`p-5 rounded-xl border ${cardStyle} space-y-4`}>
              {conflictAnalysis.hasConflicts ? (
                <div className="space-y-3.5">
                  {/* Conflicting systems */}
                  {conflictAnalysis.conflictingSystems.length > 0 && (
                    <div className="bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 space-y-1.5">
                      <span className="text-[10px] font-black text-rose-400 uppercase block tracking-wider">
                        Conflicting Systems Detected
                      </span>
                      {conflictAnalysis.conflictingSystems.map((item, idx) => (
                        <p key={idx} className="text-xs text-rose-300/90 leading-relaxed">
                          {item}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Conflicting rules */}
                  {conflictAnalysis.conflictingRules.length > 0 && (
                    <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 space-y-1.5">
                      <span className="text-[10px] font-black text-amber-400 uppercase block tracking-wider">
                        Conflicting Internal System Rules
                      </span>
                      {conflictAnalysis.conflictingRules.map((item, idx) => (
                        <p key={idx} className="text-xs text-amber-300/90 leading-relaxed">
                          {item}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Contradictory conclusions */}
                  {conflictAnalysis.contradictoryConclusions.length > 0 && (
                    <div className="bg-violet-500/5 p-3 rounded-xl border border-violet-500/10 space-y-1.5">
                      <span className="text-[10px] font-black text-violet-400 uppercase block tracking-wider">
                        Contradictory Conclusions Mapped
                      </span>
                      {conflictAnalysis.contradictoryConclusions.map((item, idx) => (
                        <p key={idx} className="text-xs text-violet-300/90 leading-relaxed">
                          {item}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-start gap-2.5 text-xs text-emerald-300">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    No contradictory conclusions, conflicting systems, or clashing rule parameters identified. Systems have reached mutual harmony or conditional consensus.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Decision Consistency */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <GitMerge className="w-4 h-4 text-violet-500" />
              Decision Consistency Audit
            </span>

            <div className={`p-5 rounded-xl border ${cardStyle} space-y-3`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/10 text-xs">
                <span>Integrity status:</span>
                <span className={`font-bold uppercase ${decisionConsistency.isConsistent ? "text-emerald-400" : "text-rose-400"}`}>
                  {decisionConsistency.isConsistent ? "Consistency Verified" : "Data Gaps Found"}
                </span>
              </div>

              {decisionConsistency.unsupportedConclusions.length > 0 && (
                <div className="bg-rose-500/5 p-3 rounded-lg border border-rose-500/10 space-y-1.5">
                  <span className="text-[10px] font-black text-rose-400 uppercase block">Unsupported Conclusions</span>
                  {decisionConsistency.unsupportedConclusions.map((item, idx) => (
                    <p key={idx} className="text-xs text-rose-300">
                      {item}
                    </p>
                  ))}
                </div>
              )}

              <div className="space-y-1.5 pl-1 text-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Supported Conclusions list</span>
                {decisionConsistency.supportedConclusions.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Reasoning Chain & System Confidence Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section 4: Dynamic Reasoning Chain Diagram */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-indigo-500" />
              Traceable Reasoning Chain
            </span>

            <div className={`p-5 rounded-xl border ${cardStyle} space-y-4 font-mono text-[11px]`}>
              {/* Evidence Step */}
              <div className="relative pl-6 pb-4 border-l border-indigo-500/30">
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-indigo-500 shadow shadow-indigo-500/50" />
                <span className="font-bold text-indigo-400 uppercase block text-[10px]">Step 01: Raw Evidence input</span>
                <p className={`${textMuted} mt-1 leading-relaxed`}>
                  Aggregating astrological settings of {astrologyData.nativeName || "Native"} at target age {targetAge} across the 7 core systems.
                </p>
              </div>

              {/* Rules Step */}
              <div className="relative pl-6 pb-4 border-l border-indigo-500/30">
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-indigo-500 shadow shadow-indigo-500/50" />
                <span className="font-bold text-indigo-400 uppercase block text-[10px]">Step 02: Rule execution checks</span>
                <p className={`${textMuted} mt-1 leading-relaxed`}>
                  Matching variables against established classical boundary algorithms (e.g. 7th CSL, Darakaraka degree limits).
                </p>
              </div>

              {/* Decision Step */}
              <div className="relative pl-6 pb-4 border-l border-indigo-500/30">
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-indigo-500 shadow shadow-indigo-500/50" />
                <span className="font-bold text-indigo-400 uppercase block text-[10px]">Step 03: Decision resolution codes</span>
                <p className={`${textMuted} mt-1 leading-relaxed`}>
                  Mapping executed rules to concrete Decision IDs to prevent untraceable or hallucinated output conclusions.
                </p>
              </div>

              {/* Consensus Step */}
              <div className="relative pl-6 pb-4 border-l border-indigo-500/30">
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-indigo-500 shadow shadow-indigo-500/50" />
                <span className="font-bold text-indigo-400 uppercase block text-[10px]">Step 04: Unified Consensus model</span>
                <p className={`${textMuted} mt-1 leading-relaxed`}>
                  Calculating the overall compatibility score based on verified cross-system weight models.
                </p>
              </div>

              {/* AI Explanation Step */}
              <div className="relative pl-6">
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-amber-500 shadow shadow-amber-500/50" />
                <span className="font-bold text-amber-400 uppercase block text-[10px]">Step 05: Esoteric AI Interpretation</span>
                <p className={`${textMuted} mt-1 leading-relaxed`}>
                  Translating structural math into a supportive counseling synthesis without overriding the underlying rules engine.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Exact System Confidence Breakdown */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Dynamic System Confidence Breakdown
            </span>

            <div className={`p-5 rounded-xl border ${cardStyle} space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/10">
                <span className="text-xs font-bold">Consensus compatibility:</span>
                <span className="text-2xl font-black text-indigo-400 font-mono">
                  {confidenceBreakdown.finalConsensusScore}%
                </span>
              </div>

              <div className="space-y-3">
                {confidenceBreakdown.detailedContributions.map((item) => (
                  <div key={item.system} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold">{item.system} Contributed</span>
                      <span className="text-indigo-400">+{item.shareOfConsensus}% of final rating</span>
                    </div>

                    {/* Progress representation */}
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>Status: {item.status}</span>
                      <span>Confidence contribution weight: {item.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
