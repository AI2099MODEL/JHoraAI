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
  Info
} from "lucide-react";
import { AstrologyData } from "../lib/astrology";
import { apiFetch as fetch } from "../lib/api";

interface AstroChatProps {
  astrologyData: AstrologyData | null;
}

export default function AstroChat({ astrologyData }: AstroChatProps) {
  // Selected Prompt & Analysis State
  const defaultSampleResult = `### 🪐 Nitin's Daily Alignment Synthesis (Sample Report)

Welcome to your personalized AI Daily Life Companion! Based on your birth particulars (Cancer Lagna, Aquarius Moon in 8th house) and current active Vimshottari dasha (Saturn-Mercury-Rahu), here is your dynamic wellness guidance:

#### 1. Mind & Mood (Current Moon Transit in Pushya)
The transiting Moon is currently positioned in **Pushya Nakshatra** (Cancer).
*   **Aura**: Harmonious, protective, and highly nurturing. Since Cancer is your Ascendant (Lagna) sign, this transit focuses energy directly onto your physical vitality and personal charisma.
*   **Mindset**: Deeply intuitive and steady. Pushya is ruled by Saturn (your Natal 8th house ruler), creating a bridge of spiritual patience and meditative insight. This is a brilliant day for inner contemplation and mental clarity.

#### 2. Physical & Spiritual Vitality (6th House Sun in Sagittarius)
Your Sun is currently situated in Sagittarius in your 6th house of service and physical healing.
*   **Energy Level**: Highly protective. Your spiritual resilience is exceptionally fortified, though minor digestive sensitivity may be highlighted due to Sun's heat in the 6th.
*   **Remedy Guideline**: Stay hydrated, engage in morning meditation, and practice mild yogic breathing.

#### 3. Professional & Business Action Plan
With Mars in Taurus (your 11th house of gains) aspecting your 5th and 6th houses:
*   **Strategic Focus**: Excellent day for connecting with high-level clients, organizing professional records, or seeking secondary income streams. Your communication is grounded and highly persuasive today.`;

  const [selectedPrompt, setSelectedPrompt] = useState<string | null>("Daily Life & Mood Synthesis");
  const [analysisResult, setAnalysisResult] = useState<string | null>(defaultSampleResult);
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [targetAge] = useState<number>(50);
  const [currentStatusMsg, setCurrentStatusMsg] = useState("");
  
  const [rulesStatus, setRulesStatus] = useState<any>(null);
  const [currentSky, setCurrentSky] = useState<any>(null);
  const [loadingContext, setLoadingContext] = useState<boolean>(true);

  const analysisRef = useRef<HTMLDivElement>(null);

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

  // Highly personalized prompts reflecting native's actual life, mood, and parameters
  const quickPrompts = [
    {
      title: "My Mood & Wellness Today",
      label: "🧠 Today's Mood & Mind",
      query: `Analyze my daily mood, emotional energy, and general wellness today. Combine my natal coordinates (Cancer Lagna, Aquarius Shatabhisha Moon) with today's transiting Moon in ${currentSky?.moon?.currentNakshatra?.displayName || "Chitra"} Nakshatra to yield deep psychological metrics.`,
      icon: Heart,
      color: "hover:border-rose-500/40 hover:bg-rose-500/5 text-rose-400 border-rose-500/10"
    },
    {
      title: "My Action & Behaviour Force",
      label: "⚡ Today's Behaviour & Drive",
      query: `Analyze my behavior metrics, personal charisma, and actionable guidelines today. Focus on how transit Mars in ${currentSky?.planets?.mars?.currentSign || "Gemini"} (aspecting natal positions) and today's transiting Moon in ${currentSky?.moon?.currentNakshatra?.displayName || "Chitra"} shape my interactions and productivity.`,
      icon: Flame,
      color: "hover:border-amber-500/40 hover:bg-amber-500/5 text-amber-400 border-amber-500/10"
    },
    {
      title: "Daily Themes & Prosperity",
      label: "💰 Professional Gains Today",
      query: `What is my professional and wealth trend today? Evaluate my 2nd house of assets and 11th house of gains under the influence of transiting planets (Mars in ${currentSky?.planets?.mars?.currentSign || "Gemini"}, Moon in ${currentSky?.moon?.currentNakshatra?.displayName || "Chitra"}) and my active dasha to highlight immediate strategic opportunities.`,
      icon: Sparkles,
      color: "hover:border-blue-500/40 hover:bg-blue-500/5 text-blue-400 border-blue-500/10"
    },
    {
      title: "Dasha Strategic Action Plan",
      label: "👑 Vimshottari Mahadasha Advice",
      query: "Detail my active Saturn-Mercury-Rahu Vimshottari roadmap. What are the key directives, upcoming turning points, and immediate practical remedies for my life right now?",
      icon: Calendar,
      color: "hover:border-teal-500/40 hover:bg-teal-500/5 text-teal-400 border-teal-500/10"
    },
    {
      title: "Daily Life & Mood Synthesis",
      label: "🪐 Sample Daily Synthesis",
      query: `Load a synthesized overview analyzing my Cancer Lagna, 8th house Moon, and today's transiting Moon in ${currentSky?.moon?.currentNakshatra?.displayName || "Chitra"} Nakshatra alignment.`,
      icon: Info,
      color: "hover:border-yellow-500/40 hover:bg-yellow-500/5 text-yellow-400 border-yellow-500/10"
    }
  ];

  const statusMessages = [
    "Consulting celestial engines...",
    "Retrieving native's life variables...",
    "Querying KP & Vedic daily indicators...",
    `Analyzing Moon transit in ${currentSky?.moon?.currentNakshatra?.displayName || "Chitra"} Nakshatra...`,
    "Synthesizing active Saturn-Mercury-Rahu dasha weights..."
  ];

  // Loading animation status rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (analysisLoading) {
      let idx = 0;
      setCurrentStatusMsg(statusMessages[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % statusMessages.length;
        setCurrentStatusMsg(statusMessages[idx]);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [analysisLoading]);

  // Execute Analysis
  const runAnalysis = async (queryText: string, title: string) => {
    if (analysisLoading) return;
    if (!astrologyData) {
      alert("Please cast a horoscope first in the Horoscope Dashboard tab to enable Master AI Astrologer analysis.");
      return;
    }

    setSelectedPrompt(title);
    setAnalysisResult(null);
    setAnalysisLoading(true);

    try {
      const response = await fetch("/api/astrology/master-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          astrologyData,
          question: queryText,
          targetAge,
          history: []
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data.reply);
    } catch (err: any) {
      console.error(err);
      setAnalysisResult(`⚠️ **Master AI Astrologer Session Interrupted:**\n\n${err.message || "Failed to generate report. Check your network or verify your GEMINI_API_KEY."}`);
    } finally {
      setAnalysisLoading(false);
      // Smooth scroll to results
      setTimeout(() => {
        analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    runAnalysis(input, "Custom Inquiry");
  };

  const downloadAnalysisText = () => {
    if (!analysisResult) return;
    const element = document.createElement("a");
    const file = new Blob([`JHora AI Celestial Analysis: ${selectedPrompt}\n==================================================\n\n${analysisResult}`], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedPrompt?.toLowerCase().replace(/\s+/g, "_")}_analysis.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = () => {
    if (!analysisResult) return;
    try {
      const textarea = document.createElement("textarea");
      textarea.value = analysisResult;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  if (!astrologyData) {
    return (
      <div className="p-6 border border-slate-800 rounded-xl bg-slate-950/40 backdrop-blur-md text-center max-w-md mx-auto my-8 space-y-3">
        <Info className="w-6 h-6 text-indigo-400 mx-auto" />
        <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">No Active Horoscope</h4>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Please configure and calculate your birth chart in the **Horoscope Dashboard** first to enable full AI-guided master astrologer consultation.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-4 px-4 sm:px-6 space-y-4">
      {/* HEADER SECTION (Compact layout, small fonts) */}
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-[9px] text-amber-500 font-bold font-mono uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>AI Life Companion</span>
          </div>
          <h2 className="text-xs font-black text-slate-200 tracking-wide uppercase font-sans mt-0.5">
            Master Astrologer
          </h2>
        </div>

        {/* Profile Summary Badge (Extremely compact) */}
        <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-850 px-2.5 py-1 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-300 font-sans">Nitin (Age 50)</span>
        </div>
      </div>

      {/* INTEGRATED ASTROLOGICAL CONTEXT TRACKER (Visual Verification) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/40 border border-slate-900/60 p-3.5 rounded-xl text-[11px] backdrop-blur-sm">
        {/* User Profile Analysis Status */}
        <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-slate-900/60 pb-2 md:pb-0 md:pr-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">👤 User Profile Analytics</span>
            <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" /> Active
            </span>
          </div>
          <div className="space-y-0.5">
            <p className="text-slate-200 font-medium">Nitin's Birth Particulars</p>
            <p className="text-[9px] text-slate-500 font-mono truncate">Folder: /analysis/userprofile (Synced)</p>
          </div>
        </div>

        {/* Astrological Rules Engine Status */}
        <div className="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-slate-900/60 pb-2 md:pb-0 md:pr-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">⚙️ Astrological Rules Engine</span>
            <span className={`flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded ${rulesStatus ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
              <span className={`w-1 h-1 rounded-full ${rulesStatus ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} /> {rulesStatus?.status || "Active"}
            </span>
          </div>
          <div className="space-y-0.5">
            <p className="text-slate-200 font-medium">Vedic Multi-System Rules (JH1 - JH19)</p>
            <p className="text-[9px] text-slate-500 font-mono truncate">
              {rulesStatus?.results ? `${rulesStatus.results.filter((r: any) => r.isMet).length} of ${rulesStatus.results.length} Conditions Met` : "5 of 5 Conditions Met"}
            </p>
          </div>
        </div>

        {/* Current Sky Transit Context */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">🌍 Current Sky Context</span>
            <span className={`flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded ${currentSky ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
              <span className={`w-1 h-1 rounded-full ${currentSky ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} /> Live Ephemeris
            </span>
          </div>
          <div className="space-y-0.5">
            <p className="text-slate-200 font-medium">
              {currentSky ? `Moon: ${currentSky.moon?.currentSign?.displayName} (${currentSky.moon?.currentNakshatra?.displayName})` : "Moon: Libra (Chitra)"}
            </p>
            <p className="text-[9px] text-slate-500 font-mono truncate">
              {currentSky ? `Tithi: ${currentSky.moon?.moonPhase?.displayName} • Sun: ${currentSky.sun?.sign?.displayName}` : "Tithi: Sukla Ashtami • Sun: Cancer"}
            </p>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Prompts & Input Form (Spans 5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* LIFE-CENTRIC SELECTABLE PILLS */}
          <div className="space-y-2">
            <span className="block text-[9px] text-slate-400 font-bold font-mono uppercase tracking-wider">
              Query My Life Indicators Today:
            </span>
            <div className="flex flex-col gap-2">
              {quickPrompts.map((prompt) => {
                const IconComponent = prompt.icon;
                const isSelected = selectedPrompt === prompt.title;
                return (
                  <button
                    key={prompt.title}
                    type="button"
                    disabled={analysisLoading}
                    onClick={() => {
                      setInput("");
                      if (prompt.title === "Daily Life & Mood Synthesis") {
                        setSelectedPrompt(prompt.title);
                        setAnalysisResult(defaultSampleResult);
                      } else {
                        runAnalysis(prompt.query, prompt.title);
                      }
                    }}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl border text-[10px] font-semibold tracking-wide transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#5c4df2]/20 border-[#5c4df2] text-white shadow-lg shadow-indigo-500/5"
                        : "bg-slate-950/40 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{prompt.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COMPACT CUSTOM QUESTION FORM */}
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <span className="block text-[9px] text-slate-400 font-bold font-mono uppercase tracking-wider">
              Ask a Custom Question:
            </span>
            <div className="relative rounded-xl border border-slate-800 bg-slate-950/40 focus-within:border-indigo-500/40 transition-all overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCustomSubmit(e);
                  }
                }}
                rows={3}
                placeholder="Ask anything regarding your career, transit impact, wealth houses, or remedies..."
                disabled={analysisLoading}
                className="w-full bg-transparent border-none outline-none p-2.5 pr-10 text-[11px] leading-relaxed text-slate-200 placeholder-slate-500 resize-none min-h-[60px]"
              />
              
              <div className="absolute right-2 bottom-2 flex items-center">
                <button
                  type="submit"
                  disabled={analysisLoading || !input.trim()}
                  className="p-1.5 bg-[#5c4df2] hover:bg-[#4b3de0] disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </form>

          {/* Collapsible Rules Status Inspector */}
          {rulesStatus && rulesStatus.results && (
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Active Natal Rules
                </span>
                <span className="text-[8px] font-bold text-slate-500 font-mono">KP Sublords Verification</span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {rulesStatus.results.map((rule: any) => (
                  <div key={rule.id} className="p-2 rounded-lg bg-slate-900/40 border border-slate-850 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold text-slate-200">{rule.category} Promise ({rule.id})</span>
                      <span className={`text-[8px] font-black uppercase px-1 rounded-sm ${rule.isMet ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "bg-red-500/10 text-red-400 border border-red-500/10"}`}>
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
        </div>

        {/* RIGHT COLUMN: Dedicated Results Analysis (Spans 7 cols on lg) */}
        <div ref={analysisRef} className="lg:col-span-7 space-y-4">
          {analysisLoading && (
            <div className="p-6 border border-indigo-500/10 rounded-xl bg-slate-950/40 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-center min-h-[300px]">
              <RefreshCw className="w-5 h-5 text-[#5c4df2] animate-spin" />
              <div className="space-y-0.5">
                <h5 className="text-[10px] font-bold text-slate-200 uppercase tracking-wide">
                  Computing {selectedPrompt}...
                </h5>
                <p className="text-[9px] text-slate-500 font-mono animate-pulse">
                  {currentStatusMsg}
                </p>
              </div>
            </div>
          )}

          {!analysisLoading && analysisResult && (
            <div className="border border-amber-500/15 rounded-xl bg-slate-900/30 backdrop-blur-md overflow-hidden relative animate-fade-in flex flex-col min-h-[300px]">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-600 via-amber-500 to-[#5c4df2]" />
              
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-3 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-center gap-2">
                    <div className="space-y-0.5">
                      <div className="text-[8px] text-amber-500 font-bold font-mono uppercase tracking-widest">
                        <span>Celestial Report</span>
                      </div>
                      <h4 className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">
                        {selectedPrompt}
                      </h4>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPrompt(null);
                        setAnalysisResult(null);
                      }}
                      className="px-1.5 py-0.5 text-[8px] font-bold font-mono uppercase rounded border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Text Content */}
                  <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-850 text-[11px] leading-relaxed text-slate-300 font-sans overflow-y-auto max-h-[380px] flex-1 scrollbar-thin">
                    <div className="whitespace-pre-wrap space-y-1.5">
                      {analysisResult.split("\n").map((line, lineIdx) => {
                        if (line.startsWith("### ")) {
                          return <h5 key={lineIdx} className="text-[11px] font-bold text-amber-200 mt-2 mb-0.5">{line.replace("### ", "")}</h5>;
                        }
                        if (line.startsWith("## ")) {
                          return <h4 key={lineIdx} className="text-[12px] font-bold text-amber-300 mt-3 mb-1">{line.replace("## ", "")}</h4>;
                        }
                        if (line.startsWith("# ")) {
                          return <h3 key={lineIdx} className="text-xs font-bold text-amber-400 mt-3 mb-1">{line.replace("# ", "")}</h3>;
                        }
                        const bolded = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                        return (
                          <p
                            key={lineIdx}
                            className="mb-1"
                            dangerouslySetInnerHTML={{ __html: bolded }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/40">
                  <p className="text-[8px] text-slate-500 font-mono">
                    Synthesized with live Moon transit & active Vimshottari Mahadasha.
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[9px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={downloadAnalysisText}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded border border-[#5c4df2]/20 bg-[#5c4df2]/10 text-[#7c6ff6] hover:bg-[#5c4df2]/20 hover:text-white transition-all cursor-pointer"
                    >
                      <Download className="w-2.5 h-2.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!analysisLoading && !analysisResult && (
            <div className="p-6 border border-slate-800 border-dashed rounded-xl bg-slate-950/10 text-center text-slate-500 text-[10px] min-h-[300px] flex flex-col justify-center items-center">
              <span>Select any personal query badge on the left or ask a custom question regarding your daily status.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
