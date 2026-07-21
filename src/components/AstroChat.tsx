/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Clock,
  Heart,
  RefreshCw,
  Calendar,
  Copy,
  Download,
  Check,
  Flame,
  Info,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Database,
  Cpu,
  Activity,
  FileText,
  Trash2,
  Zap,
  HelpCircle
} from "lucide-react";
import { AstrologyData } from "../lib/astrology";
import { apiFetch as fetch } from "../lib/api";

interface AstroChatProps {
  astrologyData: AstrologyData | null;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  debugInfo?: any;
}

export default function AstroChat({ astrologyData }: AstroChatProps) {
  // Session / Conversation History state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: `### 🪐 Welcome, Nitin

I am JHoraAI's Master AI Astrologer. I have successfully established a unified link to your client profile, the Natal Rules Engine (JH1 - JH19), and the live celestial transit ephemeris.

I am operating as a strictly deterministic, evidence-backed counseling assistant. I will never calculate charts on-the-fly or invent planetary configurations, but I am fully equipped to translate your computed natal promise and current transits into clear, practical wisdom.

Select a quick-evaluation topic below, or ask a custom question regarding your life path, career, marriage promise, or planetary remedies.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      debugInfo: {
        knowledgeBookVersion: "v2.0.1",
        matchedRules: [
          { id: "KP_FIN_01", name: "Financial Status & Wealth Promise", status: "Met" },
          { id: "KP_CAR_01", name: "10th Cuspal Sub Lord for Career", status: "Met" }
        ],
        failedRules: [],
        evidence: ["Active Vimshottari Mahadasha synced", "Transit Moon Nakshatra aligned"],
        decision: "Lagna and 10th Cuspal Sub-lord confirms excellent self-directed life progress.",
        timeline: ["Current: Dynamic Mahadasha transition phase"],
        eventIds: ["CAR001", "FIN001"],
        currentSkySnapshot: "Moon: Libra (Chitra) • Sun: Cancer",
        contextSourcesLoaded: ["KP Knowledge Book", "User Profile Analysis", "Natal Rule Results", "DBA", "Current Sky", "Event Book"],
        modelUsed: "offline-baseline",
        promptSize: "N/A",
        responseTime: "N/A"
      }
    }
  ]);

  const [input, setInput] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [responseMode, setResponseMode] = useState<"quick" | "detailed" | "professional" | "research">("professional");
  const [selectedDebugMsg, setSelectedDebugMsg] = useState<Message | null>(null);
  
  const [rulesStatus, setRulesStatus] = useState<any>(null);
  const [currentSky, setCurrentSky] = useState<any>(null);
  const [loadingContext, setLoadingContext] = useState<boolean>(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [currentStatusMsg, setCurrentStatusMsg] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Rules status and Current Sky on mount
  useEffect(() => {
    async function loadAstroContext() {
      try {
        setLoadingContext(true);
        const [rulesRes, skyRes] = await Promise.all([
          fetch("/api/rules/natal-agent-status"),
          fetch("/api/rules/current-sky")
        ]);
        const rulesData = await rulesRes.json();
        const skyData = await skyRes.json();
        setRulesStatus(rulesData);
        setCurrentSky(skyData);
      } catch (err) {
        console.error("Failed to load astronomical context in AstroChat:", err);
      } finally {
        setLoadingContext(false);
      }
    }
    loadAstroContext();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, analysisLoading]);

  // Status message rotation during active generation
  const statusMessages = [
    "Querying KP & Vedic daily indicators...",
    "Retrieving native's life variables...",
    "Synthesizing active Saturn-Mercury-Rahu dasha weights...",
    "Evaluating rules JH1 through JH19...",
    "Aligning transit patterns against natal promise...",
    "Formatting structured response..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (analysisLoading) {
      let idx = 0;
      setCurrentStatusMsg(statusMessages[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % statusMessages.length;
        setCurrentStatusMsg(statusMessages[idx]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [analysisLoading]);

  const runAnalysis = async (queryText: string) => {
    if (analysisLoading) return;
    if (!astrologyData) {
      alert("Please cast a horoscope first in the Horoscope Dashboard tab to enable Master AI Astrologer analysis.");
      return;
    }

    const userMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAnalysisLoading(true);

    try {
      const response = await fetch("/api/astrology/master-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          astrologyData,
          question: queryText,
          targetAge: 50,
          mode: responseMode,
          history: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        debugInfo: data.debugInfo
      };

      setMessages(prev => [...prev, assistantMsg]);
      setSelectedDebugMsg(assistantMsg);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: "assistant",
        text: `⚠️ **Master AI Astrologer Session Interrupted:**\n\n${err.message || "Failed to generate report. Please verify your GEMINI_API_KEY is configured in Settings > Secrets."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    runAnalysis(input);
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear your current conversation history?")) {
      setMessages([messages[0]]);
      setSelectedDebugMsg(null);
    }
  };

  const copyToClipboard = (text: string, msgId: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedMessageId(msgId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  // Pre-defined quick queries
  const quickPrompts = [
    {
      title: "Today's Mood & Wellness",
      query: `Analyze my daily mood, emotional energy, and general wellness today. Combine my natal coordinates (Cancer Lagna, Aquarius Shatabhisha Moon) with today's transiting Moon in ${currentSky?.moon?.currentNakshatra?.displayName || "Chitra"} Nakshatra to yield deep psychological metrics.`
    },
    {
      title: "Action & Behavior Drive",
      query: `Analyze my behavior metrics, personal charisma, and actionable guidelines today. Focus on how transit Mars in ${currentSky?.planets?.mars?.currentSign || "Gemini"} (aspecting natal positions) and today's transiting Moon in ${currentSky?.moon?.currentNakshatra?.displayName || "Chitra"} shape my interactions and productivity.`
    },
    {
      title: "Professional Gains",
      query: `What is my professional and wealth trend today? Evaluate my 2nd house of assets and 11th house of gains under the influence of transiting planets (Mars in ${currentSky?.planets?.mars?.currentSign || "Gemini"}, Moon in ${currentSky?.moon?.currentNakshatra?.displayName || "Chitra"}) and my active dasha to highlight immediate strategic opportunities.`
    },
    {
      title: "Dasha Roadmap & Remedial Advice",
      query: "Detail my active Saturn-Mercury-Rahu Vimshottari roadmap. What are the key directives, upcoming turning points, and immediate practical remedies for my life right now?"
    }
  ];

  // Markdown rendering helper
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-xs font-bold text-amber-200 mt-3 mb-1.5 uppercase font-mono tracking-wider">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-sm font-extrabold text-amber-300 mt-4 mb-2 border-b border-slate-800 pb-1 font-sans">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={idx} className="text-base font-black text-amber-400 mt-5 mb-2 font-sans tracking-tight">{line.replace("# ", "")}</h2>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const cleanLine = line.replace(/^[-*]\s+/, "");
        const bolded = cleanLine.replace(/\*\*(.*?)\*\*/g, "<strong class='text-amber-100 font-semibold'>$1</strong>");
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 mb-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: bolded }} />
        );
      }
      const bolded = line.replace(/\*\*(.*?)\*\*/g, "<strong class='text-amber-100 font-semibold'>$1</strong>");
      return (
        <p key={idx} className="mb-2 leading-relaxed text-slate-300" dangerouslySetInnerHTML={{ __html: bolded }} />
      );
    });
  };

  const activeDebugInfo = selectedDebugMsg?.debugInfo || messages[messages.length - 1]?.debugInfo;

  return (
    <div className="w-full max-w-7xl mx-auto py-2 px-4 space-y-4">
      {/* HEADER BAR (Clean, high-end visual layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/60 pb-3 gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-[9px] text-amber-500 font-black font-mono uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>AI Life Companion • Redesign v2.0</span>
          </div>
          <h1 className="text-sm font-black text-slate-100 tracking-wide uppercase font-sans mt-0.5">
            Master Astrological Consultations
          </h1>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-2">
          {/* Response Mode Selector */}
          <div className="flex items-center bg-slate-950/60 border border-slate-800 p-0.5 rounded-lg text-[10px]">
            {(["quick", "detailed", "professional", "research"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setResponseMode(m)}
                className={`px-2 py-1 rounded font-bold font-mono uppercase transition-all cursor-pointer ${
                  responseMode === m
                    ? "bg-[#5c4df2] text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={clearChat}
            title="Reset Conversation"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-red-950/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* THREE-COLUMN GRID / TWO-COLUMN LAYOUT (85% Screen Usage Goal) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT & CENTER PANEL: Main Conversation Interface (Spans 8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col h-[650px] bg-slate-950/20 border border-slate-900 rounded-2xl overflow-hidden relative shadow-2xl">
          
          {/* Dynamic Context Header (Mini-badge) */}
          <div className="bg-slate-950/60 border-b border-slate-900/80 px-4 py-2.5 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-300 font-sans">Client: Nitin (Shatabhisha Moon)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px]">
              <Database className="w-3 h-3 text-indigo-400" />
              <span>Dasha: Saturn-Mercury-Rahu</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  if (msg.sender === "assistant" && msg.debugInfo) {
                    setSelectedDebugMsg(msg);
                  }
                }}
                className={`flex flex-col max-w-[85%] rounded-2xl p-4 transition-all relative ${
                  msg.sender === "user"
                    ? "ml-auto bg-[#5c4df2]/15 border border-[#5c4df2]/30 text-slate-200"
                    : `mr-auto bg-slate-900/35 border border-slate-900 hover:border-slate-800/80 cursor-pointer ${
                        selectedDebugMsg?.id === msg.id ? "ring-1 ring-amber-500/30 border-amber-500/20 bg-amber-500/[0.01]" : ""
                      }`
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-4 mb-2 border-b border-slate-900/40 pb-1 text-[10px]">
                  <span className={`font-black font-sans uppercase tracking-wider ${msg.sender === "user" ? "text-[#938bf8]" : "text-amber-500"}`}>
                    {msg.sender === "user" ? "👤 Seeker" : "🪐 Master Astrologer"}
                  </span>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>{msg.timestamp}</span>
                    {msg.sender === "assistant" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(msg.text, msg.id);
                        }}
                        className="p-1 hover:bg-slate-800 rounded transition-colors"
                        title="Copy Response"
                      >
                        {copiedMessageId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Text Rendered with markdown helper */}
                <div className="text-[11px] leading-relaxed font-sans space-y-1">
                  {msg.sender === "user" ? <p>{msg.text}</p> : renderMarkdown(msg.text)}
                </div>

                {/* Traceability Indicator Tag */}
                {msg.sender === "assistant" && msg.debugInfo && (
                  <div className="mt-2.5 pt-1.5 border-t border-slate-900/50 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-indigo-400" />
                      Trace: {msg.debugInfo.knowledgeBookVersion || "v2.0.1"} • Match: {msg.debugInfo.matchedRules?.length || 0} rules
                    </span>
                    <span className="text-amber-500/80 font-bold uppercase hover:underline">
                      Click to inspect traces →
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Response Loader */}
            {analysisLoading && (
              <div className="mr-auto bg-slate-900/35 border border-slate-900 max-w-[80%] rounded-2xl p-4 flex flex-col gap-2 animate-pulse">
                <div className="flex items-center justify-between border-b border-slate-900/40 pb-1 text-[10px]">
                  <span className="font-black text-amber-500 uppercase tracking-wider">
                    🪐 Master Astrologer
                  </span>
                  <span className="text-slate-500">Synthesizing...</span>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <RefreshCw className="w-4 h-4 text-[#5c4df2] animate-spin" />
                  <span className="text-[11px] text-slate-400 font-mono font-bold animate-pulse">{currentStatusMsg}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Pills area (shows when input is empty) */}
          {!input.trim() && !analysisLoading && (
            <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-900/60 flex flex-wrap gap-1.5 overflow-x-auto">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => runAnalysis(p.query)}
                  className="px-2.5 py-1 text-[9px] font-bold text-slate-400 bg-slate-900/50 border border-slate-900 hover:border-[#5c4df2]/40 hover:text-white rounded-full transition-all whitespace-nowrap cursor-pointer"
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}

          {/* Input Box Area */}
          <div className="p-3 bg-slate-950/60 border-t border-slate-900">
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your life query... (e.g., 'What is my career promise?' or 'When will the delay end?')"
                disabled={analysisLoading}
                className="flex-1 bg-slate-900/60 border border-slate-850 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-[11px] text-slate-200 placeholder-slate-500 outline-none"
              />
              <button
                type="submit"
                disabled={analysisLoading || !input.trim()}
                className="bg-[#5c4df2] hover:bg-[#4b3de0] disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl px-4 py-2 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: Dedicated Astro Traceability & Debug Inspector (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* TAB 1: TRACEABILITY INSPECTOR */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-900/80 pb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span className="text-[10px] text-slate-300 font-black uppercase font-mono tracking-wider">Astro Trace Inspector</span>
              </div>
              <span className="text-[8px] font-bold text-slate-500 font-mono">
                {activeDebugInfo ? "Message Trace Active" : "Default Roadmap"}
              </span>
            </div>

            {activeDebugInfo ? (
              <div className="space-y-3 text-[10px] max-h-[330px] overflow-y-auto pr-1 scrollbar-thin">
                {/* Knowledge Book Version & Engine Details */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900/40 border border-slate-850 p-2 rounded-lg">
                  <div>
                    <span className="block text-[8px] text-slate-500 uppercase font-mono">Knowledge Book</span>
                    <strong className="text-slate-300 font-mono">{activeDebugInfo.knowledgeBookVersion || "v2.0.1"}</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500 uppercase font-mono">Model / Source</span>
                    <strong className="text-[#a79ff9] font-mono">{activeDebugInfo.modelUsed || "gemini-3.5-flash"}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-850/60 mt-1 flex justify-between text-[8px] text-slate-500 font-mono">
                    <span>Size: {activeDebugInfo.promptSize || "N/A"}</span>
                    <span>Lat: {activeDebugInfo.responseTime || "N/A"}</span>
                  </div>
                </div>

                {/* Matched Rules */}
                <div className="space-y-1.5">
                  <span className="text-[8px] text-amber-500 font-black uppercase font-mono tracking-wide block">Matched Natal Rules:</span>
                  {activeDebugInfo.matchedRules && activeDebugInfo.matchedRules.length > 0 ? (
                    <div className="space-y-1">
                      {activeDebugInfo.matchedRules.map((rule: any, idx: number) => (
                        <div key={idx} className="p-2 rounded bg-slate-900/30 border border-slate-900 flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-200 text-[10px]">{rule.id}</span>
                            <span className="text-[8px] text-slate-400">{rule.name}</span>
                          </div>
                          <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">Met</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic text-[9px]">No matched rules in this dasha window.</p>
                  )}
                </div>

                {/* Evidence Details */}
                <div className="space-y-1 bg-slate-900/20 border border-slate-900 p-2.5 rounded-lg">
                  <span className="text-[8px] text-indigo-400 font-black uppercase font-mono tracking-wide block">Primary Evidence Indicators:</span>
                  {activeDebugInfo.evidence && activeDebugInfo.evidence.length > 0 ? (
                    <ul className="space-y-1 list-disc list-inside text-slate-400 text-[9px] leading-relaxed">
                      {activeDebugInfo.evidence.map((ev: string, idx: number) => (
                        <li key={idx} className="truncate" title={ev}>{ev}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic text-[9px]">No specific evidence codes evaluated.</p>
                  )}
                </div>

                {/* Synthesis Decision */}
                <div className="space-y-1 bg-slate-900/20 border border-slate-900 p-2.5 rounded-lg">
                  <span className="text-[8px] text-teal-400 font-black uppercase font-mono tracking-wide block">Determinism Engine Decision:</span>
                  <p className="text-slate-300 leading-normal font-sans text-[9.5px]">
                    {activeDebugInfo.decision || "No long-term marriage delay decision triggers present."}
                  </p>
                </div>

                {/* Timeline Active Events */}
                <div className="space-y-1">
                  <span className="text-[8px] text-purple-400 font-black uppercase font-mono tracking-wide block">Active Timeline Outlook:</span>
                  {activeDebugInfo.timeline && activeDebugInfo.timeline.length > 0 ? (
                    <ul className="space-y-1 list-disc list-inside text-slate-400 text-[9px]">
                      {activeDebugInfo.timeline.map((tl: string, idx: number) => (
                        <li key={idx}>{tl}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic text-[9px]">No active timelines reported.</p>
                  )}
                </div>

                {/* Context Sources Loaded */}
                <div className="space-y-1 bg-slate-900/40 p-2 rounded">
                  <span className="text-[8px] text-slate-500 font-bold uppercase font-mono block">Context Sources Loaded:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(activeDebugInfo.contextSourcesLoaded || []).map((source: string, idx: number) => (
                      <span key={idx} className="bg-indigo-500/10 text-[#a79ff9] text-[8px] px-1.5 py-0.5 rounded font-mono">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-[9px]">
                <HelpCircle className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                <span>Select an assistant message to inspect its precise mathematical traces and diagnostic parameters.</span>
              </div>
            )}
          </div>

          {/* TAB 2: DETAILED LIVE NATAL RULES INSPECTOR */}
          {rulesStatus && rulesStatus.results && (
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 space-y-3 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-900/80 pb-2">
                <span className="text-[10px] text-slate-300 font-black uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Active Natal Rules
                </span>
                <span className="text-[8px] font-bold text-slate-500 font-mono">KP Cuspal Verification</span>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {rulesStatus.results.map((rule: any) => (
                  <div key={rule.id} className="p-2 rounded bg-slate-900/30 border border-slate-900/60 space-y-1">
                    <div className="flex justify-between items-start gap-2 text-[10px]">
                      <span className="font-bold text-slate-200">{rule.category} Promise ({rule.id})</span>
                      <span className={`text-[8px] font-black uppercase px-1 rounded-sm ${rule.isMet ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {rule.isMet ? "Met" : "Alert"}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed font-sans">{rule.reasoning}</p>
                    <div className="flex items-center gap-2 text-[8px] text-slate-500 font-mono pt-1 border-t border-slate-850/60 mt-1">
                      <span>CSL: <strong className="text-slate-300">{rule.significator}</strong></span>
                      <span>Star: <strong className="text-slate-300">{rule.starLord}</strong></span>
                      {rule.signifiedHouses && rule.signifiedHouses.length > 0 && (
                        <span>Houses: <strong className="text-slate-300">[{rule.signifiedHouses.join(", ")}]</strong></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CURRENT TRANSIT EPHEMERIS SUMMARY */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 space-y-2 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-900/80 pb-2">
              <span className="text-[10px] text-slate-300 font-black uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Celestial Transit Context</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded bg-slate-900/20 border border-slate-900">
                <span className="block text-[8px] text-slate-500 uppercase font-mono">Current Moon sign</span>
                <strong className="text-slate-300 font-sans">{currentSky?.moon?.currentSign?.displayName || "Libra"}</strong>
              </div>
              <div className="p-2 rounded bg-slate-900/20 border border-slate-900">
                <span className="block text-[8px] text-slate-500 uppercase font-mono">Nakshatra</span>
                <strong className="text-slate-300 font-sans">{currentSky?.moon?.currentNakshatra?.displayName || "Chitra"}</strong>
              </div>
              <div className="p-2 rounded bg-slate-900/20 border border-slate-900">
                <span className="block text-[8px] text-slate-500 uppercase font-mono">Star Lord</span>
                <strong className="text-slate-300 font-sans">{currentSky?.moon?.currentStarLord?.displayName || "Mars"}</strong>
              </div>
              <div className="p-2 rounded bg-slate-900/20 border border-slate-900">
                <span className="block text-[8px] text-slate-500 uppercase font-mono">Tithi / Phase</span>
                <strong className="text-slate-300 font-sans">{currentSky?.moon?.moonPhase?.displayName || "Sukla Ashtami"}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
