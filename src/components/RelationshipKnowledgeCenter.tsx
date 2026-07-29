/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Heart,
  Clock,
  ShieldAlert,
  Calendar,
  Sparkles,
  Award,
  AlertCircle,
  Activity,
  Smile,
  Compass,
  FileText,
  Bookmark,
  Users,
  Moon,
  ChevronRight,
  Info,
  HelpCircle,
  TrendingUp,
  Sliders,
  CheckCircle2,
  XCircle,
  Gem,
  Flame,
  Sun,
  Scale
} from "lucide-react";
import { AstrologyData } from "../lib/astrology";
import { calculateUnifiedRelationshipEvidence, UnifiedEvidenceItem } from "../lib/rules/unifiedRelationshipEvidenceEngine";
import {
  ASTROLOGY_SYSTEMS,
  RULES_DETAILS,
  PLANETS_DETAILS,
  HOUSES_DETAILS,
  DASHAS_DETAILS,
  YOGAS_DETAILS,
  DOSHAS_DETAILS,
  REMEDIES_DETAILS,
  SystemDetail,
  RuleDetail,
  PlanetDetail,
  HouseDetail,
  DashaDetail,
  YogaDetail,
  DoshaDetail,
  RemedyDetail
} from "../lib/relationshipKnowledgeData";

interface RelationshipKnowledgeCenterProps {
  astrologyData: AstrologyData;
  isDark: boolean;
}

export const RelationshipKnowledgeCenter: React.FC<RelationshipKnowledgeCenterProps> = ({
  astrologyData,
  isDark
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    "my_result" | "systems" | "rules" | "planets" | "houses" | "dashas" | "yogas" | "doshas" | "remedies" | "search"
  >("my_result");

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Explain My Result active topic
  const [selectedTopic, setSelectedTopic] = useState("Marriage Promise");
  const [targetAge, setTargetAge] = useState<number>(28);

  // Compute live evidence
  const liveEvidence = useMemo(() => {
    return calculateUnifiedRelationshipEvidence(astrologyData, undefined, targetAge);
  }, [astrologyData, targetAge]);

  const topics = [
    { id: "Marriage Promise", label: "Marriage Promise", icon: Heart, desc: "Legal promise of marriage in the lifetime chart." },
    { id: "Marriage Timing", label: "Marriage Timing", icon: Clock, desc: "Active wedding dasha and transit windows." },
    { id: "Marriage Delay", label: "Marriage Delay", icon: Calendar, desc: "Saturnian and structural barriers causing delays past age 28." },
    { id: "Marriage Denial", label: "Marriage Denial", icon: ShieldAlert, desc: "Severe karmic blockages representing denial of formal unions." },
    { id: "Love Marriage", label: "Love Marriage", icon: Flame, desc: "Self-selected partnerships and 5th-7th house links." },
    { id: "Arranged Marriage", label: "Arranged Marriage", icon: Compass, desc: "Family-guided, traditional, and parental alignments." },
    { id: "Secret Relationship", label: "Secret Relationship", icon: HelpCircle, desc: "Private or confidential attachments in 8th/12th houses." },
    { id: "Multiple Relationships", label: "Multiple Relationships", icon: TrendingUp, desc: "Dual sign multipliers on relationship axes." },
    { id: "Extra-marital Relationship", label: "Extra-marital Relationship", icon: AlertCircle, desc: "Temptations and parallel bond indicators." },
    { id: "Divorce", label: "Divorce", icon: ShieldAlert, desc: "Destructive house groupings (1, 6, 10) leading to legal breaks." },
    { id: "Separation", label: "Separation", icon: Activity, desc: "Separative aspects causing emotional or geographical distance." },
    { id: "Divorce Litigation", label: "Divorce Litigation", icon: Scale, desc: "Legal battles, disputes, and family court proceedings (6th, 8th, 12th houses)." },
    { id: "Remarriage", label: "Remarriage", icon: Sparkles, desc: "Secondary marriage promise (9th house connections)." },
    { id: "Spouse Nature", label: "Spouse Nature", icon: Smile, desc: "Temperament, career, and physical qualities of the partner." },
    { id: "Marriage Happiness", label: "Marriage Happiness", icon: Sparkles, desc: "Mutual harmony and domestic peace in shared spaces." },
    { id: "Relationship Timeline", label: "Relationship Timeline", icon: Calendar, desc: "Traces developmental milestones across lifetime cycles." }
  ];

  // System selected in "Explain Systems" tab
  const [selectedSystem, setSelectedSystem] = useState<string>("KP");

  // Live matching results for the search tab
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { rules: [], planets: [], houses: [], dashas: [], yogas: [], doshas: [], remedies: [] };

    return {
      rules: RULES_DETAILS.filter(
        r => r.name.toLowerCase().includes(q) || r.purpose.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
      ),
      planets: PLANETS_DETAILS.filter(
        p => p.name.toLowerCase().includes(q) || p.significance.toLowerCase().includes(q)
      ),
      houses: HOUSES_DETAILS.filter(
        h => h.name.toLowerCase().includes(q) || h.significance.toLowerCase().includes(q)
      ),
      dashas: DASHAS_DETAILS.filter(
        d => d.name.toLowerCase().includes(q) || d.relevance.toLowerCase().includes(q)
      ),
      yogas: YOGAS_DETAILS.filter(
        y => y.name.toLowerCase().includes(q) || y.relevance.toLowerCase().includes(q)
      ),
      doshas: DOSHAS_DETAILS.filter(
        d => d.name.toLowerCase().includes(q) || d.relevance.toLowerCase().includes(q)
      ),
      remedies: REMEDIES_DETAILS.filter(
        r => r.name.toLowerCase().includes(q) || r.purpose.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q)
      )
    };
  }, [searchQuery]);

  const hasSearchResults = useMemo(() => {
    return Object.values(searchResults).some((arr: any) => arr.length > 0);
  }, [searchResults]);

  // Styling helpers based on light/dark mode
  const containerStyle = isDark
    ? "bg-slate-900 border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-800";

  const cardStyle = isDark
    ? "bg-slate-950/40 border-slate-900"
    : "bg-slate-50 border-slate-200/60";

  const inputStyle = isDark
    ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500"
    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500";

  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const textHeading = isDark ? "text-white" : "text-slate-900";

  return (
    <div className={`p-6 rounded-2xl border ${containerStyle} space-y-8`}>
      {/* Upper header block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/10 pb-6">
        <div>
          <h3 className={`text-xl font-sans font-semibold flex items-center gap-2 ${textHeading}`}>
            <BookOpen className="w-5.5 h-5.5 text-indigo-500" />
            Relationship Knowledge Center
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            An educational guide explaining the cosmic mechanics, systems, rules, houses, and remedies of relationships.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Award className="w-4 h-4 text-indigo-400" />
          No Astrology Calculations performed here
        </div>
      </div>

      {/* Primary search & quick sub-navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin">
          {[
            { id: "my_result", label: "My Result", icon: Award },
            { id: "systems", label: "Astrology Systems", icon: Compass },
            { id: "rules", label: "Rules Dictionary", icon: FileText },
            { id: "planets", label: "Planets", icon: Sun },
            { id: "houses", label: "Houses", icon: Bookmark },
            { id: "dashas", label: "Dashas", icon: Clock },
            { id: "yogas", label: "Yogas", icon: Sparkles },
            { id: "doshas", label: "Doshas", icon: AlertCircle },
            { id: "remedies", label: "Remedies", icon: Gem },
            { id: "search", label: "Search Knowledge", icon: Search }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === "search") {
                    // focus logic if needed
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                  isActive
                    ? "bg-indigo-500 text-slate-950 border-indigo-600 shadow-md shadow-indigo-500/10"
                    : isDark
                    ? "bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900"
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Global Search Bar proxy */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search Rules, Planets, Houses..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveTab("search");
            }}
            className={`w-full pl-9 pr-4 py-1.5 rounded-xl text-xs outline-none border transition-all ${inputStyle}`}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Active Tab rendering */}
      <div className="transition-all duration-200">
        {/* ================= 1. EXPLAIN MY RESULT ================= */}
        {activeTab === "my_result" && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${cardStyle} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  Live Consensus Diagnosis Explainer
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Understand how JHora's systems compiled your natal settings. Select any relationship topic to analyze.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Age Reference</span>
                  <input
                    type="number"
                    value={targetAge}
                    onChange={(e) => setTargetAge(Math.max(1, parseInt(e.target.value) || 28))}
                    className={`w-16 px-2 py-1 rounded-lg text-xs mt-1 border ${inputStyle}`}
                    min={1}
                    max={120}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Topic List (4 Cols) */}
              <div className="lg:col-span-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Relationship Focus Topics</span>
                <div className={`max-h-[440px] overflow-y-auto border rounded-xl divide-y p-1 space-y-1 ${cardStyle} divide-slate-800/10`}>
                  {topics.map(t => {
                    const Icon = t.icon;
                    const isSelected = selectedTopic === t.id;
                    const computedTopicData = (liveEvidence[t.id] || {}) as Record<string, UnifiedEvidenceItem>;
                    const entries = Object.entries(computedTopicData);
                    let passCount = 0;
                    entries.forEach(([_, item]) => {
                      if (item.status === "PASS") passCount++;
                    });

                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTopic(t.id)}
                        className={`w-full p-2.5 rounded-lg text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-500/10 text-indigo-400 font-semibold border-indigo-500/20 border"
                            : isDark
                            ? "hover:bg-slate-900/60 text-slate-300 border border-transparent"
                            : "hover:bg-slate-100 text-slate-700 border border-transparent"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${isDark ? "bg-slate-900" : "bg-white"} border border-slate-800/10 shadow-sm`}>
                          <Icon className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold block truncate">{t.label}</span>
                          <span className="text-[9px] text-slate-400 block truncate mt-0.5">{t.desc}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 mt-2">
                          <span className="text-[9px] font-bold bg-indigo-500/10 px-1 py-0.5 rounded text-indigo-400">
                            {passCount}/{entries.length} Pass
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Explanations per system (8 Cols) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    COMPUTED EVIDENCE CODES FOR: <span className="text-indigo-400 font-extrabold">{selectedTopic.toUpperCase()}</span>
                  </h5>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Consensus Count: {Object.keys(liveEvidence[selectedTopic] || {}).length} Systems Evaluated
                  </span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {Object.entries((liveEvidence[selectedTopic] || {}) as Record<string, UnifiedEvidenceItem>).map(([systemName, item]) => {
                    // Match rules
                    const systemTheme = isDark
                      ? "bg-slate-950/40 border-slate-900"
                      : "bg-slate-50 border-slate-200";

                    return (
                      <div key={systemName} className={`p-4 rounded-xl border ${systemTheme} space-y-3`}>
                        {/* Title block */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/10">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">
                              {systemName}
                            </span>
                            <span className="text-xs font-bold">Consensus Alignment Explainer</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-medium">Confidence: {item.confidence}%</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              item.status === "PASS"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : item.status === "FAIL"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>

                        {/* Evidences */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                          <div className="space-y-1.5">
                            <span className="font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Supporting System Evidence
                            </span>
                            <div className="space-y-1">
                              {item.supportingEvidence.map((eStr, eIdx) => (
                                <p key={eIdx} className={`${textMuted} leading-relaxed pl-4 relative`}>
                                  <span className="absolute left-0 top-1 text-emerald-500">•</span>
                                  {eStr}
                                </p>
                              ))}
                              {item.supportingEvidence.length === 0 && (
                                <p className="text-slate-500 italic">No specific supporting evidence logged.</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="font-bold text-rose-400 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              Contradicting System Evidence
                            </span>
                            <div className="space-y-1">
                              {item.contradictingEvidence.map((eStr, eIdx) => (
                                <p key={eIdx} className={`${textMuted} leading-relaxed pl-4 relative`}>
                                  <span className="absolute left-0 top-1 text-rose-500">•</span>
                                  {eStr}
                                </p>
                              ))}
                              {item.contradictingEvidence.length === 0 && (
                                <p className="text-slate-500 italic">No specific contradicting evidence logged.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Suggest Remedy if exists */}
                        {item.suggestedRemedy && (
                          <div className="p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[11px] space-y-1">
                            <span className="font-bold text-indigo-400 flex items-center gap-1">
                              <Gem className="w-3.5 h-3.5" />
                              Recommended Structural Remedy
                            </span>
                            <p className={textMuted}>{item.suggestedRemedy}</p>
                          </div>
                        )}

                        {/* Citation block */}
                        <div className="flex flex-wrap items-center gap-3 pt-2 text-[9px] font-mono border-t border-slate-800/10 text-slate-500">
                          <div>
                            <span className="font-bold text-slate-400 uppercase">Decision IDs:</span>{" "}
                            {item.decisionIds.length > 0 ? item.decisionIds.join(", ") : "N/A"}
                          </div>
                          <div>
                            <span className="font-bold text-slate-400 uppercase">Evidence IDs:</span>{" "}
                            {item.supportingEvidence.length > 0
                              ? item.supportingEvidence.map((_, i) => `${systemName.toUpperCase()}_EV_${i + 1}`).join(", ")
                              : "N/A"}
                          </div>
                          <div>
                            <span className="font-bold text-slate-400 uppercase">Rule IDs:</span>{" "}
                            {item.ruleIds.length > 0 ? item.ruleIds.join(", ") : "N/A"}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {Object.keys(liveEvidence[selectedTopic] || {}).length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-500 italic border rounded-xl border-dashed">
                      No system evidence returned for {selectedTopic}.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. EXPLAIN EVERY ASTROLOGY SYSTEM ================= */}
        {activeTab === "systems" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left selector */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Astrology Systems Catalog</span>
              <div className="space-y-1.5">
                {ASTROLOGY_SYSTEMS.map(sys => (
                  <button
                    key={sys.id}
                    onClick={() => setSelectedSystem(sys.id)}
                    className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedSystem === sys.id
                        ? "bg-indigo-500 border-indigo-600 text-slate-950 shadow-md"
                        : isDark
                        ? "bg-slate-950/40 border-slate-900 text-slate-300 hover:border-slate-800"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold text-xs block">{sys.name}</span>
                    <span className={`text-[10px] block mt-0.5 truncate ${selectedSystem === sys.id ? "text-slate-900" : "text-slate-400"}`}>
                      {sys.philosophy}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right detailed display */}
            <div className="lg:col-span-8">
              {(() => {
                const sys = ASTROLOGY_SYSTEMS.find(s => s.id === selectedSystem);
                if (!sys) return null;
                return (
                  <div className={`p-6 rounded-xl border ${cardStyle} space-y-5`}>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <Compass className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-indigo-400">{sys.name}</h4>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Core Methodological Framework</span>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs leading-relaxed">
                      <div className="space-y-1">
                        <span className="font-black text-[10px] text-slate-400 uppercase tracking-wider">Methodology Philosophy</span>
                        <p className={textMuted}>{sys.philosophy}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-black text-[10px] text-slate-400 uppercase tracking-wider">How it Evaluates Relationships</span>
                        <p className={textMuted}>{sys.relationshipFocus}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-black text-[10px] text-slate-400 uppercase tracking-wider">Primary System Advantage</span>
                        <p className={textMuted}>{sys.advantage}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-800/10 space-y-2">
                        <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">Linked Engine Decision References</span>
                        <div className="flex flex-wrap gap-2">
                          {sys.decisionIdRefs.map(id => (
                            <span key={id} className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                              {id}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ================= 3. EXPLAIN EVERY RULE ================= */}
        {activeTab === "rules" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Rules dictionary</span>
              <span className="text-[10px] font-mono text-slate-500">{RULES_DETAILS.length} Verified Rules Registered</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RULES_DETAILS.map(rule => (
                <div key={rule.id} className={`p-4 rounded-xl border ${cardStyle} space-y-3.5`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-500/15 text-indigo-400 rounded uppercase">
                        {rule.systemId} Rule
                      </span>
                      <h4 className="text-xs font-black text-indigo-400 mt-1">{rule.name}</h4>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 shrink-0">{rule.id}</span>
                  </div>

                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <div>
                      <span className="font-bold text-slate-400 block">Rule Purpose:</span>
                      <p className={textMuted}>{rule.purpose}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-400 block">Inputs / Indicators Used:</span>
                      <p className={textMuted}>{rule.inputsUsed}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                        <span className="font-bold text-emerald-400 block text-[10px]">Supporting Evidence:</span>
                        <p className={`${textMuted} text-[10px] mt-0.5`}>{rule.supportingEvidence}</p>
                      </div>
                      <div className="bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                        <span className="font-bold text-rose-400 block text-[10px]">Contradicting Evidence:</span>
                        <p className={`${textMuted} text-[10px] mt-0.5`}>{rule.contradictingEvidence}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/10 flex items-center justify-between text-[9px] font-mono text-slate-500">
                    <span>Engine Reference:</span>
                    <span className="text-indigo-400">{rule.decisionIdRefs.join(", ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 4. EXPLAIN EVERY PLANET ================= */}
        {activeTab === "planets" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLANETS_DETAILS.map(planet => (
              <div key={planet.name} className={`p-4 rounded-xl border ${cardStyle} space-y-3`}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/10">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10">
                    <Sun className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h4 className="text-xs font-black text-indigo-400">{planet.name}</h4>
                </div>

                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-400 block">Cosmic Relationship Significance:</span>
                    <p className={textMuted}>{planet.significance}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block">Strength & Dignity Aspect:</span>
                    <p className={textMuted}>{planet.strengthAspect}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block">Direct Role in Partnerships:</span>
                    <p className={textMuted}>{planet.relationshipRole}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/10 flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Linked Rules:</span>
                  {planet.ruleIdRefs.map(id => (
                    <span key={id} className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-1 py-0.5 rounded">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= 5. EXPLAIN EVERY HOUSE ================= */}
        {activeTab === "houses" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOUSES_DETAILS.map(house => (
              <div key={house.number} className={`p-4 rounded-xl border ${cardStyle} space-y-3`}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/10">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center text-xs font-black text-indigo-400 font-mono">
                    H{house.number}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-indigo-400">{house.name}</h4>
                    <span className="text-[9px] text-slate-400 uppercase font-mono">Cuspal Bhavam</span>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-400 block">Astrological Significance:</span>
                    <p className={textMuted}>{house.significance}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block">Direct Relationship Impact:</span>
                    <p className={textMuted}>{house.relationshipImpact}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block">Favorable Occupants:</span>
                    <span className="text-indigo-300 font-mono text-[10px]">{house.favorablePlanets}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/10 flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Affected Rules:</span>
                  {house.ruleIdRefs.map(id => (
                    <span key={id} className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-1 py-0.5 rounded">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= 6. EXPLAIN EVERY DASHA ================= */}
        {activeTab === "dashas" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DASHAS_DETAILS.map(dasha => (
              <div key={dasha.name} className={`p-4 rounded-xl border ${cardStyle} space-y-3`}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/10">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10">
                    <Clock className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h4 className="text-xs font-black text-indigo-400">{dasha.name}</h4>
                </div>

                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-400 block">System Relevance:</span>
                    <p className={textMuted}>{dasha.relevance}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block">Timing Influence:</span>
                    <p className={textMuted}>{dasha.relationshipInfluence}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block">Activation Trigger:</span>
                    <p className={textMuted}>{dasha.triggerMechanisms}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/10 flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Trigger Rules:</span>
                  {dasha.ruleIdRefs.map(id => (
                    <span key={id} className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-1 py-0.5 rounded">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= 7. EXPLAIN EVERY YOGA ================= */}
        {activeTab === "yogas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {YOGAS_DETAILS.map(yoga => (
              <div key={yoga.name} className={`p-4 rounded-xl border ${cardStyle} space-y-3`}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/10">
                  <div className="p-1.5 rounded-lg bg-amber-500/10">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <h4 className="text-xs font-black text-amber-400">{yoga.name}</h4>
                </div>

                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-400 block">Yoga Relevance:</span>
                    <p className={textMuted}>{yoga.relevance}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block">Sanskrit Planatary Combination:</span>
                    <code className="text-[10px] text-amber-300 block bg-amber-500/5 p-1.5 rounded border border-amber-500/10 font-mono mt-0.5">
                      {yoga.combination}
                    </code>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block">Resulting Relationship Outcome:</span>
                    <p className={textMuted}>{yoga.relationshipOutcome}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/10 flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Verified Rules:</span>
                  {yoga.ruleIdRefs.map(id => (
                    <span key={id} className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-1 py-0.5 rounded">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= 8. EXPLAIN EVERY DOSHA ================= */}
        {activeTab === "doshas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOSHAS_DETAILS.map(dosha => (
              <div key={dosha.name} className={`p-4 rounded-xl border ${cardStyle} space-y-3`}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/10">
                  <div className="p-1.5 rounded-lg bg-rose-500/10">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  </div>
                  <h4 className="text-xs font-black text-rose-400">{dosha.name}</h4>
                </div>

                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-400 block">Astrological Malefic Relevance:</span>
                    <p className={textMuted}>{dosha.relevance}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block">Sanskrit Cancellation Conditions:</span>
                    <p className="text-[10px] text-emerald-400">{dosha.cancellationConditions}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block">Tension & Impact Scale:</span>
                    <p className={textMuted}>{dosha.impactScale}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/10 flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Auspicious Rules:</span>
                  {dosha.ruleIdRefs.map(id => (
                    <span key={id} className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-1 py-0.5 rounded">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= 9. EXPLAIN EVERY REMEDY ================= */}
        {activeTab === "remedies" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REMEDIES_DETAILS.map(rem => (
              <div key={rem.name} className={`p-4 rounded-xl border ${cardStyle} space-y-3`}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/10">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10">
                    <Gem className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h4 className="text-xs font-black text-indigo-400">{rem.name}</h4>
                </div>

                <div className="space-y-2.5 text-[11px] leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-400 block">Remedy Purpose:</span>
                    <p className={textMuted}>{rem.purpose}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block">Rational / Esoteric Reason:</span>
                    <p className={textMuted}>{rem.reason}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block">Supporting Evidence Reference:</span>
                    <p className={textMuted}>{rem.supportingEvidence}</p>
                  </div>
                  <div className="bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10">
                    <span className="font-bold text-indigo-400 block text-[10px]">How to Implement:</span>
                    <p className={`${textMuted} text-[10px] mt-0.5`}>{rem.implementation}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/10 space-y-1 text-[9px] font-mono text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Decision ID Ref:</span>
                    <span className="text-indigo-400">{rem.decisionIdRefs.join(", ")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rule ID Ref:</span>
                    <span className="text-indigo-400">{rem.ruleIdRefs.join(", ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= 10. UNIFIED SEARCH TAB ================= */}
        {activeTab === "search" && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${cardStyle} text-center`}>
              <Search className="w-8 h-8 text-indigo-500 mx-auto opacity-75" />
              <h4 className="text-sm font-bold mt-2">Unified Knowledge Center Query</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter any term, rule code, planet name, or remedy type. Live results update instantly.
              </p>
              <div className="max-w-md mx-auto mt-3">
                <input
                  type="text"
                  placeholder="Type to search (e.g. Venus, Saturn, KP_REL_PROMISE_01...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl text-xs outline-none border transition-all text-center ${inputStyle}`}
                />
              </div>
            </div>

            {hasSearchResults ? (
              <div className="space-y-6">
                {/* Rules search */}
                {searchResults.rules.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Matching Rules ({searchResults.rules.length})</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.rules.map(rule => (
                        <div key={rule.id} className={`p-4 rounded-xl border ${cardStyle} space-y-3`}>
                          <div className="flex items-start justify-between">
                            <h4 className="text-xs font-black text-indigo-400">{rule.name}</h4>
                            <span className="text-[9px] font-mono text-slate-500">{rule.id}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{rule.purpose}</p>
                          <div className="text-[9px] font-mono text-indigo-300">Decision Code: {rule.decisionIdRefs.join(", ")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Planets search */}
                {searchResults.planets.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Matching Planets ({searchResults.planets.length})</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {searchResults.planets.map(p => (
                        <div key={p.name} className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
                          <h4 className="text-xs font-black text-indigo-400">{p.name}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-3">{p.significance}</p>
                          <div className="text-[9px] font-mono text-slate-500">Rules: {p.ruleIdRefs.join(", ")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Houses search */}
                {searchResults.houses.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Matching Houses ({searchResults.houses.length})</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {searchResults.houses.map(h => (
                        <div key={h.number} className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
                          <h4 className="text-xs font-black text-indigo-400">{h.name}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-3">{h.significance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dashas search */}
                {searchResults.dashas.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Matching Dashas ({searchResults.dashas.length})</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {searchResults.dashas.map(d => (
                        <div key={d.name} className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
                          <h4 className="text-xs font-black text-indigo-400">{d.name}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-3">{d.relevance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Yogas search */}
                {searchResults.yogas.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Matching Yogas ({searchResults.yogas.length})</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.yogas.map(y => (
                        <div key={y.name} className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
                          <h4 className="text-xs font-black text-amber-400">{y.name}</h4>
                          <p className="text-[11px] text-slate-400">{y.relevance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doshas search */}
                {searchResults.doshas.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Matching Doshas ({searchResults.doshas.length})</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.doshas.map(d => (
                        <div key={d.name} className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
                          <h4 className="text-xs font-black text-rose-400">{d.name}</h4>
                          <p className="text-[11px] text-slate-400">{d.relevance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remedies search */}
                {searchResults.remedies.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Matching Remedies ({searchResults.remedies.length})</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.remedies.map(r => (
                        <div key={r.name} className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
                          <h4 className="text-xs font-black text-indigo-400">{r.name}</h4>
                          <p className="text-[11px] text-slate-400">{r.purpose}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500 italic border rounded-xl border-dashed">
                {searchQuery ? "No matching catalog entities found." : "Please type a search query above to browse the dictionary."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
