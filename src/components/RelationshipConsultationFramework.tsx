/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Heart,
  User,
  Clock,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Activity,
  Send,
  Download,
  Info,
  Calendar,
  Layers,
  Award,
  BookOpen,
  ArrowRight,
  UserCheck,
  RefreshCw,
  PlusCircle,
  Compass,
  CornerDownRight,
  FileText,
  Printer,
  ChevronDown
} from "lucide-react";
import { AstrologyData } from "../lib/astrology";
import { calculateUnifiedRelationshipEvidence, UnifiedEvidenceObject } from "../lib/rules/unifiedRelationshipEvidenceEngine";
import { apiFetch as fetch } from "../lib/api";

interface RelationshipConsultationFrameworkProps {
  astrologyData: AstrologyData;
  isDark: boolean;
}

interface ChatMessage {
  id: string;
  sender: "user" | "consultant";
  text: string;
  timestamp: Date;
}

interface ConsultationData {
  greeting: string;
  synthesis: string;
  supportingEvidence: Array<{
    text: string;
    evidenceId: string;
    systemId: string;
  }>;
  contradictingEvidence: Array<{
    text: string;
    evidenceId: string;
    systemId: string;
  }>;
  remedies: Array<{
    text: string;
    evidenceId: string;
    remedy: string;
  }>;
  confidenceExplanation: string;
  chatReply: string;
}

export const RelationshipConsultationFramework: React.FC<RelationshipConsultationFrameworkProps> = ({
  astrologyData,
  isDark
}) => {
  const [selectedMode, setSelectedMode] = useState<string>("Complete Relationship Consultation");
  const [targetAge, setTargetAge] = useState<number>(28);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const consultationModes = [
    { name: "Complete Relationship Consultation", desc: "Full-spectrum partner diagnostics syntheses.", icon: Sparkles },
    { name: "Marriage Consultation", desc: "In-depth timing, promises, and structural synergy.", icon: Heart },
    { name: "Love Marriage Consultation", desc: "Planetary compatibility of love vs. traditional models.", icon: FlameIcon },
    { name: "Marriage Timing Consultation", desc: "Evaluation of active dasha/transit activation gates.", icon: Clock },
    { name: "Marriage Delay Consultation", desc: "Obstructions, Saturnian limits, and retrogradations.", icon: AlertTriangle },
    { name: "Divorce Consultation", desc: "Clash potentials, separation rules, and house division checks.", icon: TrashIcon },
    { name: "Remarriage Consultation", desc: "Second marriage potential and 9th/11th house sub-rulers.", icon: Compass },
    { name: "Spouse Prediction Consultation", desc: "Aesthetic traits, profession, and direction vectors.", icon: UserCheck },
    { name: "Relationship Happiness Consultation", desc: "Navamsha comfort, emotional resonance, and remedies.", icon: SmileIcon },
    { name: "Relationship Timeline Consultation", desc: "Chronological age milestones for partnership shifts.", icon: Calendar },
    { name: "Remedy Consultation", desc: "Vedic, Lal Kitab, and KP systemic corrective therapies.", icon: Award }
  ];

  const loadingSteps = [
    "Establishing JHoraAI professional consultation link...",
    "Retrieving multi-system astrological variables...",
    "Aggregating Unified Decision Engine output maps...",
    "Querying evidence nodes (KP, Vedic, Nadi, Tajik, Jaimini)...",
    "Generating deep structured consultation model..."
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Loading animation stepper
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setActiveStep(0);
      interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const startConsultation = async () => {
    setLoading(true);
    setConsultation(null);
    setChatHistory([]);
    setError(null);

    try {
      // Calculate frozen evidence engine outputs using existing helper
      const evidence: UnifiedEvidenceObject = calculateUnifiedRelationshipEvidence(
        astrologyData,
        undefined,
        targetAge
      );

      const response = await fetch("/api/astrology/relationship-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: selectedMode,
          evidence,
          targetAge
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setConsultation(data);

      // Initialize consultation chat session
      setChatHistory([
        {
          id: "welcome",
          sender: "consultant",
          text: data.chatReply || `Your professional ${selectedMode} is successfully structured below. Feel free to ask me any specific follow-up questions regarding these system parameters.`,
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to establish AI consultation link.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !consultation) return;

    const userMessageText = chatInput.trim();
    setChatInput("");

    // Add user message to chat history
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userMessageText,
      timestamp: new Date()
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const evidence: UnifiedEvidenceObject = calculateUnifiedRelationshipEvidence(
        astrologyData,
        undefined,
        targetAge
      );

      // Pass previous chat dialogue as context (formatted)
      const currentHistory = chatHistory.map((h) => ({
        sender: h.sender,
        text: h.text
      }));

      const response = await fetch("/api/astrology/relationship-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: selectedMode,
          evidence,
          question: userMessageText,
          history: [...currentHistory, { sender: "user", text: userMessageText }]
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const aiMsg: ChatMessage = {
        id: `consultant-${Date.now()}`,
        sender: "consultant",
        text: data.chatReply || "I have analyzed your follow-up parameters. Please refer to the updated decision details below.",
        timestamp: new Date()
      };

      setChatHistory((prev) => [...prev, aiMsg]);

      // Keep underlying structured tabs aligned with newly resolved response if provided
      if (data.synthesis) {
        setConsultation(data);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "consultant",
        text: `Consultation connection interrupted: ${err.message || "Could not retrieve answer"}. Please try again.`,
        timestamp: new Date()
      };
      setChatHistory((prev) => [...prev, errMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Styles
  const containerStyle = isDark
    ? "bg-slate-900 border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-800";

  const cardStyle = isDark
    ? "bg-slate-950/40 border-slate-900/80"
    : "bg-slate-50 border-slate-200";

  const borderStyle = isDark ? "border-slate-800" : "border-slate-200";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const textHeading = isDark ? "text-white" : "text-slate-900";

  return (
    <div className={`p-6 rounded-2xl border ${containerStyle} space-y-8 print:border-none print:p-0`}>
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/10 pb-6 print:border-none">
        <div>
          <h3 className={`text-xl font-sans font-semibold flex items-center gap-2.5 ${textHeading}`}>
            <Award className="w-6 h-6 text-indigo-500" />
            Professional Relationship Consultation Suite
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Clinical AI-guided counseling suite powered by certified decision engines. Cites evidence and rule markers with 100% trace integrity.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 print:hidden">
          <User className="w-4 h-4 text-emerald-400" />
          Certified Consultant Session
        </div>
      </div>

      {/* Mode Selector Panel */}
      {!consultation && !loading && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h4 className={`text-sm font-bold uppercase tracking-wider ${textHeading}`}>
              Step 1: Choose Your Consultation Goal
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium">Target Age:</span>
              <input
                type="number"
                value={targetAge}
                onChange={(e) => setTargetAge(Math.max(1, parseInt(e.target.value) || 28))}
                className={`w-20 px-2.5 py-1 rounded-lg text-xs font-bold border outline-none ${
                  isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consultationModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.name;
              return (
                <button
                  key={mode.name}
                  onClick={() => setSelectedMode(mode.name)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-3.5 group hover:scale-[1.01] ${
                    isSelected
                      ? "bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/30"
                      : isDark
                      ? "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isSelected ? "bg-indigo-600 text-white" : "bg-slate-800/20 text-slate-400 group-hover:text-indigo-400"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className={`text-xs font-bold block ${textHeading}`}>
                      {mode.name}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      {mode.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={startConsultation}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              Initiate Professional Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <Award className="w-6 h-6 text-indigo-500 absolute animate-pulse" />
          </div>
          <div className="text-center space-y-1">
            <span className={`text-xs font-bold block ${textHeading}`}>
              Preparing Counseling Frame
            </span>
            <span className="text-[11px] text-indigo-400 font-mono block animate-pulse">
              {loadingSteps[activeStep]}
            </span>
          </div>
          <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${((activeStep + 1) / loadingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl text-center space-y-3">
          <p className="text-xs text-rose-300">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-1.5 bg-rose-600 text-white text-[11px] font-bold rounded hover:bg-rose-500"
          >
            Go Back
          </button>
        </div>
      )}

      {/* Active Consultation Layout */}
      {consultation && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          {/* Left Side: Consultation Results Documents (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 print:col-span-12">
            <div className="flex items-center justify-between print:hidden">
              <button
                onClick={() => setConsultation(null)}
                className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                ← Back to Mode Selection
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Summary
                </button>
              </div>
            </div>

            {/* Document Card */}
            <div className={`p-6 rounded-xl border ${cardStyle} space-y-6 print:border-none print:p-0`}>
              {/* Title Section */}
              <div className="border-b border-slate-800/10 pb-4 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Astrological Diagnostics Report
                </div>
                <h4 className={`text-lg font-sans font-semibold ${textHeading}`}>
                  {selectedMode} Synthesis
                </h4>
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono">
                  <span>Subject: {astrologyData.nativeName || "Nitin"}</span>
                  <span>•</span>
                  <span>Target Age: {targetAge} Years</span>
                  <span>•</span>
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Greeting */}
              <div className="p-4 bg-indigo-600/5 rounded-xl border border-indigo-500/10 text-xs leading-relaxed italic text-indigo-300">
                "{consultation.greeting}"
              </div>

              {/* Synthesis */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Clinical Synthesis & Interpretations
                </span>
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-300">
                  {consultation.synthesis}
                </p>
              </div>

              {/* Supporting Evidence */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Verified Promising Indicators
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                  {consultation.supportingEvidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${borderStyle} text-xs space-y-1.5`}
                    >
                      <p className="font-medium text-slate-300 leading-normal">{ev.text}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-emerald-400 font-bold">[{ev.evidenceId}]</span>
                        <span className="text-slate-500">System: {ev.systemId}</span>
                      </div>
                    </div>
                  ))}
                  {consultation.supportingEvidence.length === 0 && (
                    <span className="text-xs text-slate-500 italic block">No specific active promising nodes registered.</span>
                  )}
                </div>
              </div>

              {/* Challenging Evidence */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  Restrictive Obstructions & Challenges
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                  {consultation.contradictingEvidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${borderStyle} text-xs space-y-1.5`}
                    >
                      <p className="font-medium text-slate-300 leading-normal">{ev.text}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-rose-400 font-bold">[{ev.evidenceId}]</span>
                        <span className="text-slate-500">System: {ev.systemId}</span>
                      </div>
                    </div>
                  ))}
                  {consultation.contradictingEvidence.length === 0 && (
                    <span className="text-xs text-slate-500 italic block">No restrictive indicators or system obstructions logged.</span>
                  )}
                </div>
              </div>

              {/* Remedies */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Corrective Therapies & Remedies
                </span>
                <div className="space-y-3">
                  {consultation.remedies.map((rem, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${borderStyle} text-xs space-y-2`}
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-slate-800/10">
                        <span className="font-bold text-slate-200">{rem.text}</span>
                        <span className="text-[10px] font-mono text-amber-400">[{rem.evidenceId}]</span>
                      </div>
                      <p className="leading-relaxed text-slate-400">{rem.remedy}</p>
                    </div>
                  ))}
                  {consultation.remedies.length === 0 && (
                    <span className="text-xs text-slate-500 italic block">No specific remedies triggered for the active configuration.</span>
                  )}
                </div>
              </div>

              {/* Confidence Explanation */}
              <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 text-xs space-y-1.5 leading-relaxed text-slate-400">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">
                  Consensus Engine Confidence Audit
                </span>
                {consultation.confidenceExplanation}
              </div>
            </div>
          </div>

          {/* Right Side: Follow-up Consultation Dialogue (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col h-[650px] border rounded-xl overflow-hidden bg-slate-950/20 border-slate-900 print:hidden">
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-900/80 flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <div className="space-y-0.5">
                <span className={`text-xs font-bold block ${textHeading}`}>
                  Consultation Assistant
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  Direct connection • Sessions history active
                </span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans scrollbar-thin">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3 text-xs leading-normal space-y-1.5 shadow ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[9px] text-slate-400 block text-right font-mono">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 rounded-bl-none">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[10px] text-indigo-400 font-mono animate-pulse">
                      Synthesizing decision references...
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSendFollowUp}
              className="p-3 bg-slate-950 border-t border-slate-900 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask follow-up questions about Decision or Rule IDs..."
                disabled={chatLoading}
                className={`flex-1 px-3 py-2 rounded-lg text-xs outline-none border transition-all ${
                  isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                }`}
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-icons
const FlameIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const TrashIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const SmileIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="15" x2="15.01" y2="15" />
  </svg>
);
