/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Heart,
  Clock,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Sparkles,
  Info,
  Calendar,
  Flame,
  Activity,
  Smile,
  LogOut,
  Repeat,
  Compass,
  ArrowRight,
  Scale
} from "lucide-react";
import { AstrologyData } from "../lib/astrology";
import { calculateUnifiedRelationshipEvidence, UnifiedEvidenceObject, UnifiedEvidenceItem } from "../lib/rules/unifiedRelationshipEvidenceEngine";

interface UnifiedEvidenceViewProps {
  astrologyData: AstrologyData;
  isDark: boolean;
}

export const UnifiedEvidenceView: React.FC<UnifiedEvidenceViewProps> = ({
  astrologyData,
  isDark
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>("Marriage Promise");
  const [targetAge, setTargetAge] = useState<number>(28);

  const evidence: UnifiedEvidenceObject = calculateUnifiedRelationshipEvidence(
    astrologyData,
    undefined,
    targetAge
  );

  const topics = [
    { id: "Marriage Promise", label: "Marriage Promise", icon: Heart, desc: "Evaluates whether legal marriage is promised in the lifetime chart." },
    { id: "Marriage Timing", label: "Marriage Timing", icon: Clock, desc: "Triggers active wedding dasha and transit windows." },
    { id: "Marriage Delay", label: "Marriage Delay", icon: Calendar, desc: "Identifies Saturnian and structural barriers causing delays past age 28." },
    { id: "Marriage Denial", label: "Marriage Denial", icon: ShieldAlert, desc: "Flags severe karmic blockages representing denial of formal unions." },
    { id: "Love Marriage", label: "Love Marriage", icon: Flame, desc: "Assesses self-selected partnerships and 5th-7th house links." },
    { id: "Arranged Marriage", label: "Arranged Marriage", icon: Compass, desc: "Measures family-guided, traditional, and parental alignments." },
    { id: "Secret Relationship", label: "Secret Relationship", icon: HelpCircle, desc: "Analyzes private or confidential attachments in 8th/12th houses." },
    { id: "Multiple Relationships", label: "Multiple Relationships", icon: Repeat, desc: "Checks for mutable/dual sign multipliers on relationship axes." },
    { id: "Extra-marital Relationship", label: "Extra-marital Relationship", icon: AlertCircle, desc: "Flags temptations and parallel bond indicators." },
    { id: "Divorce", label: "Divorce", icon: LogOut, desc: "Evaluates destructive house groupings (1, 6, 10) leading to legal breaks." },
    { id: "Separation", label: "Separation", icon: Activity, desc: "Tracks separative aspects causing emotional or geographical distance." },
    { id: "Remarriage", label: "Remarriage", icon: Sparkles, desc: "Investigates secondary marriage promise (9th house connections)." },
    { id: "Litigation", label: "Litigation", icon: Scale, desc: "Assesses legal conflict risk, dispute-prone houses (6, 8, 12), and lawsuit trends." },
    { id: "Spouse Nature", label: "Spouse Nature", icon: Smile, desc: "Delineates temperament, career, and physical qualities of the partner." },
    { id: "Marriage Happiness", label: "Marriage Happiness", icon: Sparkles, desc: "Measures mutual harmony and domestic peace in shared spaces." },
    { id: "Relationship Timeline", label: "Relationship Timeline", icon: Calendar, desc: "Traces developmental milestones across lifetime cycles." }
  ];

  const currentTopicData = evidence[selectedTopic] || {};

  // Compute Consensus Score
  const systemEntries = Object.entries(currentTopicData);
  let passes = 0;
  let fails = 0;
  let conditionals = 0;
  let totalConfidence = 0;

  systemEntries.forEach(([_, data]) => {
    if (data.status === "PASS") passes++;
    else if (data.status === "FAIL") fails++;
    else conditionals++;
    totalConfidence += data.confidence;
  });

  const avgConfidence = Math.round(totalConfidence / (systemEntries.length || 1));
  const consensusPercentage = Math.round(
    ((passes + conditionals * 0.5) / (systemEntries.length || 1)) * 100
  );

  const getSystemTheme = (name: string) => {
    switch (name) {
      case "KP":
        return {
          bg: "bg-indigo-500/5",
          border: "border-indigo-500/15 hover:border-indigo-500/35",
          accent: "text-indigo-400",
          badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          title: "KP Stellar"
        };
      case "Vedic":
        return {
          bg: "bg-amber-500/5",
          border: "border-amber-500/15 hover:border-amber-500/35",
          accent: "text-amber-400",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          title: "Vedic Parashari"
        };
      case "Jaimini":
        return {
          bg: "bg-emerald-500/5",
          border: "border-emerald-500/15 hover:border-emerald-500/35",
          accent: "text-emerald-400",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          title: "Jaimini Sutra"
        };
      case "Nadi":
        return {
          bg: "bg-rose-500/5",
          border: "border-rose-500/15 hover:border-rose-500/35",
          accent: "text-rose-400",
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          title: "Nadi Astrology"
        };
      case "Lal Kitab":
        return {
          bg: "bg-slate-500/5",
          border: "border-slate-500/15 hover:border-slate-500/35",
          accent: "text-slate-300",
          badge: "bg-slate-500/10 text-slate-300 border-slate-500/20",
          title: "Lal Kitab"
        };
      case "Tajik":
        return {
          bg: "bg-orange-500/5",
          border: "border-orange-500/15 hover:border-orange-500/35",
          accent: "text-orange-400",
          badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
          title: "Tajik Varshaphala"
        };
      default: // Western
        return {
          bg: "bg-sky-500/5",
          border: "border-sky-500/15 hover:border-sky-500/35",
          accent: "text-sky-400",
          badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
          title: "Western Tropical"
        };
    }
  };

  const getStatusIconAndColor = (status: string) => {
    switch (status) {
      case "PASS":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
          color: "text-green-400 bg-green-500/10 border-green-500/20"
        };
      case "FAIL":
        return {
          icon: <XCircle className="w-4 h-4 text-rose-400" />,
          color: "text-rose-400 bg-rose-500/10 border-rose-500/20"
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
          color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
        };
    }
  };

  return (
    <div className="space-y-6" id="unified-evidence-view">
      {/* Upper Header and Explainer */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <h3 className="text-xl font-sans font-medium text-amber-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            Unified Relationship Evidence Engine (Phase 12)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            A non-astrological synthesis platform that collects, coordinates, and aggregates critical partnership evidence produced independently across <strong>7 distinct esoteric systems</strong>. Discover comprehensive consensus structures, rule matches, and diagnostic indices.
          </p>
        </div>

        {/* Target Age Slider */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 shrink-0 md:w-64">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Evaluation Target Age:</span>
            <span className="font-mono font-bold text-amber-400">{targetAge} years</span>
          </div>
          <input
            type="range"
            min="18"
            max="60"
            value={targetAge}
            onChange={(e) => setTargetAge(Number(e.target.value))}
            className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 block text-right mt-1 font-mono">
            Modifies Tajik Return & Lal Kitab timings
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Topics Selection Panel */}
        <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-4 shadow-xl space-y-2 h-fit">
          <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-slate-400 block px-2 mb-3">
            Select Relationship Topic ({topics.length})
          </span>
          <div className="space-y-1 overflow-y-auto max-h-[600px] pr-1">
            {topics.map((t) => {
              const IconComp = t.icon;
              const isSelected = selectedTopic === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t.id)}
                  className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-indigo-900/40 to-indigo-800/20 border border-indigo-500/30 shadow-md text-indigo-200"
                      : "hover:bg-slate-800/30 text-slate-400 border border-transparent"
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-amber-400" : "text-slate-500"}`} />
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold font-sans">{t.label}</div>
                    <div className="text-[10px] leading-relaxed text-slate-400 line-clamp-1">
                      {t.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Consensus Overview Card */}
          <div className="bg-slate-950/40 border border-indigo-500/25 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-amber-500 block">
                  Active Focus Synthesis
                </span>
                <h4 className="text-lg font-bold text-slate-100">{selectedTopic}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {topics.find(t => t.id === selectedTopic)?.desc}
                </p>
              </div>

              {/* Consensus Index */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-slate-400 block">
                  Consensus Strength
                </span>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-2xl font-mono font-extrabold text-indigo-400">
                    {consensusPercentage}%
                  </span>
                  <span className="text-xs text-slate-500">Agreeing</span>
                </div>
              </div>
            </div>

            {/* Micro Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Pass indicators</span>
                <span className="text-lg font-bold text-green-400 font-mono mt-0.5 block">{passes} / 7</span>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Fail indicators</span>
                <span className="text-lg font-bold text-rose-400 font-mono mt-0.5 block">{fails} / 7</span>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Conditional indicators</span>
                <span className="text-lg font-bold text-amber-400 font-mono mt-0.5 block">{conditionals} / 7</span>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Avg Confidence</span>
                <span className="text-lg font-bold text-indigo-400 font-mono mt-0.5 block">{avgConfidence}%</span>
              </div>
            </div>
          </div>

          {/* Core Collected Evidence Cards Grid */}
          <div className="space-y-4">
            {systemEntries.map(([systemName, data]) => {
              const theme = getSystemTheme(systemName);
              const statusPack = getStatusIconAndColor(data.status);

              return (
                <div
                  key={systemName}
                  className={`p-5 rounded-xl border ${theme.bg} ${theme.border} transition-all duration-300 shadow-md space-y-3.5`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded ${theme.badge}`}>
                        {systemName}
                      </span>
                      <h5 className="text-xs font-bold text-slate-200 font-sans tracking-wide">
                        {theme.title} Evaluation
                      </h5>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status Badge */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${statusPack.color}`}>
                        {statusPack.icon}
                        <span className="font-mono tracking-wider">{data.status}</span>
                      </div>

                      {/* Confidence Meter */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Confidence</span>
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700/50">
                          <div
                            className="bg-indigo-400 h-full rounded-full"
                            style={{ width: `${data.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-extrabold text-indigo-300">
                          {data.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Supporting vs Contradicting Evidence Bullet Lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Supporting List */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-mono font-extrabold text-green-400 tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Supporting Factors ({data.supportingEvidence.length})
                      </span>
                      {data.supportingEvidence.length > 0 ? (
                        <ul className="list-none space-y-1 text-[11px] text-slate-300 pl-1 leading-relaxed">
                          {data.supportingEvidence.map((text, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <ArrowRight className="w-3 h-3 text-green-400/70 shrink-0 mt-0.5" />
                              <span>{text}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic pl-1">No direct supporting factors collected.</p>
                      )}
                    </div>

                    {/* Contradicting List */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-mono font-extrabold text-rose-400 tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        Contradicting Factors ({data.contradictingEvidence.length})
                      </span>
                      {data.contradictingEvidence.length > 0 ? (
                        <ul className="list-none space-y-1 text-[11px] text-slate-300 pl-1 leading-relaxed">
                          {data.contradictingEvidence.map((text, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <ArrowRight className="w-3 h-3 text-rose-400/70 shrink-0 mt-0.5" />
                              <span>{text}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic pl-1">No direct contradicting factors collected.</p>
                      )}
                    </div>
                  </div>

                  {/* Suggested Remedy Box (if present) */}
                  {data.suggestedRemedy && (
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5">
                      <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-mono font-extrabold text-amber-400 tracking-wider block">
                          Suggested Esoteric Remedy
                        </span>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                          {data.suggestedRemedy}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rule ID & Decision ID Footer Tags */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-indigo-500/5 text-[10px] font-mono text-slate-500">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold">Rules matched:</span>
                      <span className="text-slate-400">{data.ruleIds.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold">Decisions generated:</span>
                      <span className="text-slate-400">{data.decisionIds.join(", ")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
