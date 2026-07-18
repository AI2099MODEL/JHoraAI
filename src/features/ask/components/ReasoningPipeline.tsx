import React, { useState } from "react";
import {
  Sparkles,
  GitBranch,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Compass,
  Cpu
} from "lucide-react";
import { ContextPackage } from "../models/ContextPackage";
import { EvidencePackage } from "../models/EvidencePackage";

interface ReasoningPipelineProps {
  intent: {
    primary: string;
    confidence: number;
    secondary?: string;
    keywordsDetected: string[];
  };
  context: ContextPackage;
  knowledge: {
    id: string;
    title: string;
    description: string;
    category: string;
  }[];
  evidence: EvidencePackage;
  query: string;
}

export const ReasoningPipeline: React.FC<ReasoningPipelineProps> = ({
  intent,
  context,
  knowledge,
  evidence,
  query
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStage, setActiveStage] = useState<"intent" | "context" | "knowledge" | "evidence">("context");

  const totalFacts = (evidence?.primaryFactors?.length || 0) + (evidence?.secondaryFactors?.length || 0);

  return (
    <div className="border border-slate-150 rounded-xl bg-slate-50/50 shadow-sm overflow-hidden my-3 max-w-full font-sans transition-all duration-300">
      {/* 1. Compact Horizontal Status Bar (Uncluttered) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 select-none text-xs font-sans transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Cpu className="w-3 h-3 text-blue-600 animate-pulse" />
          </div>
          <span className="font-bold text-slate-800 tracking-tight font-sans">
            AI Coprocessor Routed
          </span>
        </div>

        {/* Compact indicators */}
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline text-slate-400">|</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-medium font-sans">Domain:</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-bold text-[10px]">
              {intent.primary}
            </span>
          </div>

          <span className="text-slate-200">/</span>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-medium font-sans">Systems:</span>
            <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200/50 text-amber-700 rounded-md font-bold text-[10px]">
              {context.activeSystems ? context.activeSystems.join(", ") : "JHora"}
            </span>
          </div>

          <span className="text-slate-200">/</span>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-medium font-sans">Facts:</span>
            <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200/50 text-emerald-700 rounded-md font-bold text-[10px]">
              {totalFacts} Retrieved
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
          <span className="text-[10px] font-semibold">{isOpen ? "Hide Details" : "Inspect Logs"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* 2. Expanded Deep-dive Panel (Accordion style) */}
      {isOpen && (
        <div className="border-t border-slate-150 bg-white animate-fadeIn">
          {/* Tabs header */}
          <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 border-b border-slate-100 overflow-x-auto text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <button
              onClick={() => setActiveStage("context")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeStage === "context" ? "bg-white text-slate-800 shadow-sm border border-slate-200/60" : "hover:text-slate-800"
              }`}
            >
              1. Context Builder
            </button>
            <button
              onClick={() => setActiveStage("intent")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeStage === "intent" ? "bg-white text-slate-800 shadow-sm border border-slate-200/60" : "hover:text-slate-800"
              }`}
            >
              2. Domain Router
            </button>
            <button
              onClick={() => setActiveStage("knowledge")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeStage === "knowledge" ? "bg-white text-slate-800 shadow-sm border border-slate-200/60" : "hover:text-slate-800"
              }`}
            >
              3. Knowledge
            </button>
            <button
              onClick={() => setActiveStage("evidence")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeStage === "evidence" ? "bg-white text-slate-800 shadow-sm border border-slate-200/60" : "hover:text-slate-800"
              }`}
            >
              4. Evidence Synthesis
            </button>
          </div>

          {/* Details block */}
          <div className="p-4 text-left text-xs text-slate-600 leading-relaxed font-sans">
            {activeStage === "context" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Coordinates</h4>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{context.selectedChart || "D1 Natal Chart"}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Astrology Systems Routing</h4>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      {context.activeSystems ? context.activeSystems.join(" → ") : "JHora"}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-1.5">Aligned Birth Profile</span>
                  {context.birthProfile ? (
                    <div className="space-y-0.5 font-sans">
                      <p className="text-slate-700">Name: <strong className="font-bold text-slate-900">{context.birthProfile.name}</strong></p>
                      <p className="text-slate-600">Birth: <span className="font-mono">{context.birthProfile.date} @ {context.birthProfile.time}</span></p>
                      <p className="text-slate-600">Place: <span className="font-medium">{context.birthProfile.place}</span></p>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No Birth Profile Aligned. Reasoning on default sky coordinates.</p>
                  )}
                </div>
              </div>
            )}

            {activeStage === "intent" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classified Query Domain</h4>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5">{intent.primary}</p>
                  </div>
                  {intent.secondary && (
                    <div className="text-right">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Secondary Intent</h4>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{intent.secondary}</p>
                    </div>
                  )}
                </div>

                {intent.keywordsDetected && intent.keywordsDetected.length > 0 && (
                  <div>
                    <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Focus Keywords</h5>
                    <div className="flex flex-wrap gap-1">
                      {intent.keywordsDetected.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100/30">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeStage === "knowledge" && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Retrieved Rules & Guidelines</h4>
                  <span className="text-[10px] text-slate-400">Hits: {knowledge?.length || 0}</span>
                </div>

                <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1">
                  {knowledge && knowledge.length > 0 ? (
                    knowledge.map((item, i) => (
                      <div key={i} className="p-2 border border-slate-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-800 font-bold">{item.title}</strong>
                          <span className="text-[8px] uppercase font-bold text-blue-600 bg-blue-50 px-1 rounded">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">Utilizing general horoscope reasoning parameters.</p>
                  )}
                </div>
              </div>
            )}

            {activeStage === "evidence" && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Retrieved Chart Facts & Evidentiary Strengths</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Retrieved Facts
                    </span>
                    <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                      {evidence?.primaryFactors && evidence.primaryFactors.length > 0 ? (
                        evidence.primaryFactors.map((f, i) => (
                          <div key={i} className="p-1.5 bg-emerald-50/30 border border-emerald-100/30 rounded-lg">
                            <span className="font-bold text-emerald-900 block text-[11px]">{f.factor}</span>
                            <span className="text-slate-500 text-[10px] leading-snug">{f.description}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 italic">No specific facts loaded.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      Parameter Safeguards
                    </span>
                    <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                      {evidence?.missingFactors && evidence.missingFactors.length > 0 ? (
                        evidence.missingFactors.map((f, i) => (
                          <div key={i} className="p-1.5 bg-amber-50/30 border border-amber-100/30 rounded-lg">
                            <span className="font-bold text-amber-900 block text-[11px]">{f.factor}</span>
                            <span className="text-slate-500 text-[10px] leading-snug">{f.details}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">All required factors verified.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 flex items-center justify-between text-[9px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Verified via JHora Core Calculation Engine.
            </span>
            <span className="italic">No ungrounded AI assumptions made.</span>
          </div>
        </div>
      )}
    </div>
  );
};
