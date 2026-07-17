/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Heart,
  Clock,
  AlertCircle,
  ShieldAlert,
  Flame,
  Activity,
  Compass,
  HelpCircle,
  Send,
  ArrowRight,
  BookOpen,
  Award,
  Ban,
  Repeat,
  CheckCircle2,
  XCircle,
  Info,
  Calendar,
  Smile,
  ShieldCheck,
  BrainCircuit,
  CornerDownRight
} from "lucide-react";
import { AstrologyData } from "../lib/astrology";
import { calculateUnifiedRelationshipEvidence, UnifiedEvidenceObject } from "../lib/rules/unifiedRelationshipEvidenceEngine";
import { apiFetch as fetch } from "../lib/api";

interface AIRelationshipExpertProps {
  astrologyData: AstrologyData;
  isDark: boolean;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export const AIRelationshipExpert: React.FC<AIRelationshipExpertProps> = ({
  astrologyData,
  isDark
}) => {
  const [targetAge, setTargetAge] = useState<number>(28);
  const [loading, setLoading] = useState<boolean>(false);
  const [expertData, setExpertData] = useState<any | null>(null);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Marriage Promise");
  const [currentStatusMsg, setCurrentStatusMsg] = useState<string>("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  const statusMessages = [
    "Compiling unified multi-system evidence...",
    "Querying the Relationship Interpretation Core...",
    "Synthesizing Vedic, KP, Jaimini, and Tajik parameters...",
    "Validating decision boundaries & evidence codes...",
    "Structuring cosmic partnership synthesis..."
  ];

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Loading message rotator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      let idx = 0;
      setCurrentStatusMsg(statusMessages[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % statusMessages.length;
        setCurrentStatusMsg(statusMessages[idx]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Execute initial calculation
  const runAIExpertInterpretation = async (forcedQuestion?: string) => {
    setLoading(true);
    try {
      // Calculate frozen evidence engine output
      const evidence: UnifiedEvidenceObject = calculateUnifiedRelationshipEvidence(
        astrologyData,
        undefined,
        targetAge
      );

      const response = await fetch("/api/astrology/ai-relationship-expert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evidence,
          question: forcedQuestion || undefined,
          targetAge
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setExpertData(data);

      // Clear previous history and set welcome message in chat session
      setChatHistory([
        {
          id: "welcome",
          sender: "ai",
          text: `Welcome to JHoraAI's Relationship Interpretation Suite! 👋 

I have securely parsed your complete multi-system structured relationship evidence. I am JHoraAI's specialized interpreter. 

Please note: **I am NOT an astrologer. I do NOT calculate planetary charts or read raw horoscope data.** Instead, I analyze, evaluate, and interpret the structured outputs of JHora's Unified Decision Engine.

You can ask me follow-up questions, or use the quick command shortcuts below (e.g., **Explain Why**, **Explain Confidence**, or **Explain Evidence**). How can I support your exploration?`,
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.error("AI Relationship Expert calculations failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (predefinedText?: string) => {
    const text = predefinedText || chatInput;
    if (!text.trim() || chatLoading) return;

    if (!expertData) {
      // Prompt user to calculate first
      await runAIExpertInterpretation();
      return;
    }

    const userMsgId = Math.random().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text,
      timestamp: new Date()
    };

    setChatHistory((prev) => [...prev, newUserMsg]);
    if (!predefinedText) setChatInput("");
    setChatLoading(true);

    try {
      // Recalculate evidence
      const evidence: UnifiedEvidenceObject = calculateUnifiedRelationshipEvidence(
        astrologyData,
        undefined,
        targetAge
      );

      // Map ChatMessage history to endpoint format
      const apiHistory = chatHistory.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text
      }));

      const response = await fetch("/api/astrology/ai-relationship-expert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evidence,
          question: text,
          history: apiHistory,
          targetAge
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "ai",
        text: data.chatReply || "I have processed your query based on the active decision matrices.",
        timestamp: new Date()
      };

      setChatHistory((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setChatHistory((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "ai",
          text: `⚠️ **Interpretation Pipeline Interrupted:** \n\n${err.message || "Failed to process chat response. Ensure your GEMINI_API_KEY is active."}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderTextWithBadges = (text: string) => {
    if (!text) return null;

    // Match bracketed content like [KP_DEC_PROMISE_01], [KP_REL_PROMISE_01], [System: KP], etc.
    const regex = /(\[[^\]]+\])/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith("[") && part.endsWith("]")) {
        const val = part.slice(1, -1);
        let badgeClass = "bg-slate-800 text-slate-300 border-slate-700";

        if (val.includes("DEC") || val.includes("_DEC")) {
          badgeClass = "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
        } else if (val.includes("REL") || val.includes("RULE") || val.includes("PROMISE") || val.includes("TIMING") || val.includes("DELAY") || val.includes("DENIAL")) {
          badgeClass = "bg-amber-500/10 text-amber-300 border-amber-500/20";
        } else if (val.includes("System") || ["KP", "Vedic", "Jaimini", "Nadi", "Lal Kitab", "Tajik", "Western"].some(s => val.includes(s))) {
          badgeClass = "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
        }

        return (
          <span
            key={index}
            className={`inline-block px-1.5 py-0.5 mx-0.5 text-[10px] font-mono font-bold rounded border ${badgeClass}`}
          >
            {val}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const topics = [
    { id: "Marriage Promise", label: "Marriage Promise", icon: Heart },
    { id: "Marriage Timing", label: "Marriage Timing", icon: Clock },
    { id: "Love Marriage", label: "Love Marriage", icon: Flame },
    { id: "Arranged Marriage", label: "Arranged Marriage", icon: Compass },
    { id: "Marriage Delay", label: "Delay Analysis", icon: Calendar },
    { id: "Divorce", label: "Divorce Analysis", icon: Ban },
    { id: "Remarriage", label: "Remarriage Analysis", icon: Sparkles },
    { id: "Spouse Nature", label: "Spouse Analysis", icon: Smile },
    { id: "Marriage Happiness", label: "Relationship Happiness", icon: Sparkles },
    { id: "Relationship Timeline", label: "Relationship Timeline", icon: Activity }
  ];

  return (
    <div className="space-y-6" id="ai-relationship-expert-panel">
      {/* Upper Title and Explainer */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h3 className="text-xl font-sans font-medium text-amber-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400 animate-pulse" />
            AI Relationship Expert (Phase 14)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            An advanced interpretation proxy that translates JHora's multi-system partnership rules, evidence consensus matrices, and lifetime decision trees into actionable relationship guideposts. The AI behaves purely as an Interpreter, explaining compiled evidence without performing raw horoscope evaluations.
          </p>
        </div>

        {/* Target Age Slider */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 shrink-0 md:w-64">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Evaluation Age:</span>
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
            Triggers Tajik solar cycles & Lal Kitab timings
          </span>
        </div>
      </div>

      {!expertData && !loading ? (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-dashed border-indigo-500/20 p-12 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-indigo-400 mx-auto animate-bounce" />
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-sm font-semibold text-slate-200">Consult JHora's Expert AI</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesize 7 distinct esoteric models (KP Stellar, Vedic Parashari, Jaimini, Nadi, Lal Kitab, Tajik Solar Cycle, and Western Synastry) to generate your unified dashboard and unlock the conversational interpreter.
            </p>
          </div>
          <button
            onClick={() => runAIExpertInterpretation()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 text-white text-xs font-semibold shadow-lg shadow-indigo-600/10 cursor-pointer transition-all"
          >
            Initialize AI Expert Synthesis
          </button>
        </div>
      ) : loading ? (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-indigo-500/10 p-16 text-center space-y-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-indigo-300 animate-pulse">{currentStatusMsg}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Main Left Columns: Dashboard and deep analyses */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Relationship Summary Synthesizer Card */}
            <div className="bg-slate-950/40 border border-indigo-500/25 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-amber-500 block">
                  Comprehensive Relationship Synthesis
                </span>
                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Consensus Summary & Timeline Interpretation
                </h4>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/30 p-4 rounded-xl border border-slate-800 font-sans whitespace-pre-line">
                {renderTextWithBadges(expertData.relationshipSummary?.text)}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {expertData.relationshipSummary?.decisionIds?.map((id: string) => (
                  <span key={id} className="text-[9px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded">
                    {id}
                  </span>
                ))}
                {expertData.relationshipSummary?.evidenceIds?.map((id: string) => (
                  <span key={id} className="text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">
                    {id}
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Deep Dive Dimensions View */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-slate-400 block">
                  Detailed Diagnostic Dimensions
                </span>
                <h4 className="text-base font-bold text-slate-100">Dimensional Narrative Explanations</h4>
              </div>

              {/* Horizontal Scrollable Tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {topics.map((t) => {
                  const IconComp = t.icon;
                  const isSelected = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                        isSelected
                          ? "bg-indigo-600 border border-indigo-500/30 text-white shadow-md shadow-indigo-600/10"
                          : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Tab content box */}
              {(() => {
                const currentAnalysis = expertData.analyses?.find((a: any) => 
                  a.dimension === activeTab || 
                  a.dimension.replace(" Analysis", "") === activeTab ||
                  activeTab.replace(" Analysis", "") === a.dimension
                ) || expertData.analyses?.find((a: any) => a.dimension.toLowerCase().includes(activeTab.toLowerCase()));

                return (
                  <div className="space-y-4 animate-fade-in">
                    {currentAnalysis ? (
                      <div className="space-y-4">
                        <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/30 p-5 rounded-xl border border-indigo-500/10 font-sans whitespace-pre-line">
                          {renderTextWithBadges(currentAnalysis.text)}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">Citations:</span>
                          {currentAnalysis.decisionIds?.map((id: string) => (
                            <span key={id} className="text-[9px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/15 px-1.5 py-0.5 rounded">
                              {id}
                            </span>
                          ))}
                          {currentAnalysis.evidenceIds?.map((id: string) => (
                            <span key={id} className="text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/15 px-1.5 py-0.5 rounded">
                              {id}
                            </span>
                          ))}
                          {currentAnalysis.systemIds?.map((id: string) => (
                            <span key={id} className="text-[9px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/15 px-1.5 py-0.5 rounded">
                              {id}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic py-4 text-center">
                        Synthesizing narrative alignment for {activeTab}. Please re-trigger calculations or check other tabs.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* 3. Strengths, Weaknesses, Positive and Risk Factors Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Positive Factors */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-3.5">
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Positive Factors
                </span>
                <ul className="space-y-2">
                  {expertData.positiveFactors?.map((item: any, idx: number) => (
                    <li key={idx} className="text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 leading-relaxed text-slate-300 flex items-start gap-2.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-emerald-400/80 shrink-0 mt-0.5" />
                      <div>
                        <span>{item.text}</span>
                        <div className="mt-1 flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
                          <span>Evidence: {item.evidenceId}</span>
                          <span>•</span>
                          <span>System: {item.systemId}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Factors */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-3.5">
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Risk Factors
                </span>
                <ul className="space-y-2">
                  {expertData.riskFactors?.map((item: any, idx: number) => (
                    <li key={idx} className="text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 leading-relaxed text-slate-300 flex items-start gap-2.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-rose-400/80 shrink-0 mt-0.5" />
                      <div>
                        <span>{item.text}</span>
                        <div className="mt-1 flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
                          <span>Evidence: {item.evidenceId}</span>
                          <span>•</span>
                          <span>System: {item.systemId}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strengths */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-3.5">
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  Strengths
                </span>
                <ul className="space-y-2">
                  {expertData.strengths?.map((item: any, idx: number) => (
                    <li key={idx} className="text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 leading-relaxed text-slate-300 flex items-start gap-2.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-indigo-400/80 shrink-0 mt-0.5" />
                      <div>
                        <span>{item.text}</span>
                        <div className="mt-1 flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
                          <span>Evidence: {item.evidenceId}</span>
                          <span>•</span>
                          <span>System: {item.systemId}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-3.5">
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Weaknesses
                </span>
                <ul className="space-y-2">
                  {expertData.weaknesses?.map((item: any, idx: number) => (
                    <li key={idx} className="text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 leading-relaxed text-slate-300 flex items-start gap-2.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
                      <div>
                        <span>{item.text}</span>
                        <div className="mt-1 flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
                          <span>Evidence: {item.evidenceId}</span>
                          <span>•</span>
                          <span>System: {item.systemId}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* 4. Recommendations & Remedies Section */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-amber-500 block">
                  Prescribed Actions & Remedial Measures
                </span>
                <h4 className="text-base font-bold text-slate-100">Recommendations & Esoteric Remedies</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expertData.recommendations?.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl space-y-3.5 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-slate-200">{rec.text}</div>
                      <div className="text-[10px] font-mono text-slate-500">Linked Evidence ID: {rec.evidenceId}</div>
                    </div>
                    {rec.remedy && (
                      <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">Suggested Remedy:</div>
                          <div className="text-xs text-slate-300 mt-0.5">{rec.remedy}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Frequently Asked Questions Card */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-slate-400 block">
                  Decision-Mapped Queries
                </span>
                <h4 className="text-base font-bold text-slate-100">Frequently Asked Questions</h4>
              </div>
              <div className="space-y-3.5">
                {expertData.faqs?.map((faq: any, idx: number) => (
                  <div key={idx} className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h5 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      {faq.question}
                    </h5>
                    <p className="text-xs text-slate-300 pl-6 leading-relaxed whitespace-pre-line font-sans">
                      {renderTextWithBadges(faq.answer)}
                    </p>
                    {faq.decisionIds && faq.decisionIds.length > 0 && (
                      <div className="pl-6 pt-1.5 flex flex-wrap gap-2">
                        <span className="text-[9px] font-mono text-slate-500">Related Decisions:</span>
                        {faq.decisionIds.map((dId: string) => (
                          <span key={dId} className="text-[9px] font-mono bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 px-1 rounded">
                            {dId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Columns: Interactive Relationship Chat Session */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-950/40 border border-indigo-500/20 rounded-2xl shadow-2xl flex flex-col h-[700px] overflow-hidden">
              {/* Chat Header */}
              <div className="bg-slate-900/80 border-b border-indigo-500/15 p-4 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Expert Chat Session</h4>
                  <p className="text-[10px] text-indigo-300 font-sans">Decision & evidence interpreter online</p>
                </div>
              </div>

              {/* Chat Conversation pane */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {chatHistory.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        isUser ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line border font-sans ${
                          isUser
                            ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-100 rounded-tr-none"
                            : "bg-slate-900/60 border-slate-800 text-slate-300 rounded-tl-none"
                        }`}
                      >
                        {renderTextWithBadges(msg.text)}
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}

                {chatLoading && (
                  <div className="flex flex-col items-start max-w-[85%] mr-auto space-y-1.5">
                    <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">Interpreting evidence maps...</span>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-slate-900/40 border-t border-slate-900 p-3 space-y-1.5">
                <span className="text-[9px] uppercase font-mono font-extrabold tracking-wider text-slate-500 block px-1">
                  Interpreter Shortcuts
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    disabled={chatLoading}
                    onClick={() => handleSendChat("Can you explain why the systems reached this consensus?")}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/25 text-[10px] font-semibold text-center truncate cursor-pointer transition-all disabled:opacity-50"
                  >
                    Explain Why
                  </button>
                  <button
                    disabled={chatLoading}
                    onClick={() => handleSendChat("Please explain the confidence rating of this relationship promise analysis.")}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/25 text-[10px] font-semibold text-center truncate cursor-pointer transition-all disabled:opacity-50"
                  >
                    Explain Confidence
                  </button>
                  <button
                    disabled={chatLoading}
                    onClick={() => handleSendChat("What direct system evidence supports the recommended remedies?")}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/25 text-[10px] font-semibold text-center truncate cursor-pointer transition-all disabled:opacity-50"
                  >
                    Explain Evidence
                  </button>
                </div>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="bg-slate-900 border-t border-indigo-500/15 p-3 flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                  placeholder="Ask the interpreter custom questions..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/40 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 shrink-0 cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
