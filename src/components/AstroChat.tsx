/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  ShieldAlert,
  Clock,
  User,
  Heart,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Award,
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
  const defaultSampleResult = `### 🪐 Nitin's Life Potential Overview (Sample Report)

Welcome to your personalized AI Celestial Life Assistant! This is a sample life-path synthesis report calculated dynamically based on your birth coordinates in **Dehradun, India** (January 6th, 1976).

#### 1. Core Soul Alignment & Ascendant (Lagna)
Your Ascendant is **Cancer** (7° 18'), ruled by the **Moon**, located in the **8th house** in Aquarius (Shatabhisha).
*   **Theme**: Deep intuition, spiritual transformation, and research capabilities. Your life revolves around unfolding hidden potentials, exploring esoteric subjects, or handling joint resources.
*   **Path**: High sensitivity paired with deep resilience. There's a strong drive to look behind the veil.

#### 2. Career Evolution (10th House & Sun)
*   Your 10th house is Aries, ruled by **Mars** located in **Taurus** (11th house of gains).
*   Your **Sun** is in **Sagittarius** in the **6th house**.
*   **Synthesis**: A natural problem-solver, strategist, and counselor. The connection of 10th lord Mars to the 11th house of gains guarantees financial rewards through independent ventures or large-scale organizations. There is a strong indicator of continuous professional evolution and secondary income streams around age 48–52.

#### 3. Active Dasha Trends
With the current Antara and Prana dasha active, you are entering an expansive phase where hidden assets or new consultative roles open up. Focus on high-level strategic advisory rather than routine operations.`;

  const [selectedPrompt, setSelectedPrompt] = useState<string | null>("Sample Life Analysis");
  const [analysisResult, setAnalysisResult] = useState<string | null>(defaultSampleResult);
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [targetAge, setTargetAge] = useState<number>(50);
  const [currentStatusMsg, setCurrentStatusMsg] = useState("");

  const analysisRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      title: "Career Shift & Business",
      label: "💼 Career & Business Transition",
      query: "Analyze my professional profile. Will I experience a significant career shift, transition, or successful business venture soon in my active dasha?",
      icon: Sparkles,
      color: "hover:border-blue-500/40 hover:bg-blue-500/5 text-blue-400 border-blue-500/10"
    },
    {
      title: "Lifetime Prosperity & Gains",
      label: "💰 Lifetime Prosperity & Wealth",
      query: "Evaluate my wealth potential. What do my 2nd house of assets and 11th house of gains signify about my financial security and secondary streams of income?",
      icon: Flame,
      color: "hover:border-amber-500/40 hover:bg-amber-500/5 text-amber-400 border-amber-500/10"
    },
    {
      title: "Physical Vitality & Wellness",
      label: "🌱 Physical Vitality & Wellness",
      query: "Review my health prospects. Analyze my 6th house, Lagna lord, and Sun coordinates to identify strengths, weak periods, and general well-being tips.",
      icon: Heart,
      color: "hover:border-rose-500/40 hover:bg-rose-500/5 text-rose-400 border-rose-500/10"
    },
    {
      title: "Soul Purpose & Spirituality",
      label: "🧘 Soul Purpose & Spiritual Path",
      query: "Explain my spiritual destiny and inner calling. What do my 8th and 12th houses indicate about my intuitive gifts, meditation, or spiritual evolution?",
      icon: Sparkles,
      color: "hover:border-violet-500/40 hover:bg-violet-500/5 text-violet-400 border-violet-500/10"
    },
    {
      title: "Immediate Dasha Influence",
      label: "👑 Immediate Dasha Directives",
      query: "Detail the cosmic roadmap of my active Vimshottari dasha. How are the active Antara and Prana lords shaping my current opportunities and obstacles?",
      icon: Calendar,
      color: "hover:border-teal-500/40 hover:bg-teal-500/5 text-teal-400 border-teal-500/10"
    },
    {
      title: "Foreign Connections & Travel",
      label: "✈️ Foreign Connections & Relocation",
      query: "Is there an astrological promise of long-distance travel, foreign residence, or business dealings abroad in my chart? Check my 3rd, 9th, and 12th houses.",
      icon: Clock,
      color: "hover:border-[#5c4df2]/40 hover:bg-[#5c4df2]/5 text-[#7c6ff6] border-[#5c4df2]/10"
    },
    {
      title: "Sample Life Analysis",
      label: "🪐 Sample Life Potential Overview",
      query: "Load a complete, synthetic life path overview analyzing my Cancer ascendant, Aquarius Moon in 8th house, and Sagittarian Sun in the 6th house.",
      icon: Info,
      color: "hover:border-yellow-500/40 hover:bg-yellow-500/5 text-yellow-400 border-yellow-500/10"
    }
  ];

  const statusMessages = [
    "Consulting celestial engines...",
    "Retrieving multi-system rule maps...",
    "Querying KP & Vedic relationship guidelines...",
    "Synthesizing Jaimini sub-rulers...",
    "Executing Tajik Year Vivaha Saham indicators..."
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
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [analysisLoading]);

  // Execute Analysis (handles both Quick Prompts and Custom queries)
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
          history: [] // strictly focused on this targeted query
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
      <div className="p-8 border border-slate-800 rounded-2xl bg-slate-950/40 backdrop-blur-md text-center max-w-lg mx-auto my-12 space-y-4">
        <Info className="w-8 h-8 text-indigo-400 mx-auto" />
        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">No Active Horoscope</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Please configure and calculate your birth chart in the **Horoscope Dashboard** first to enable full AI-guided master astrologer consultation.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800/60 pb-5 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] text-amber-400 font-bold font-mono uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Interactive Life Companion</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 tracking-wide uppercase font-sans">
            Master AI Astrologer Consultation
          </h2>
          <p className="text-xs text-slate-400">
            Personalized life, wealth, career, and spiritual insights tuned to your unique cosmic fingerprint.
          </p>
        </div>

        {/* Profile Card Summary */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-slate-950/40 border border-slate-800/80 px-3 py-2 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase leading-none">NATIVE PROFILE</span>
            <span className="text-xs font-bold text-slate-200 mt-0.5">Nitin (Age 50)</span>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Interactive Prompts & Custom Inquiry Input (spans 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* INTERACTIVE LIFE PROMPTS CARD */}
          <div className="border border-slate-800/60 bg-slate-900/20 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Interactive Life Inquiries
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Select any of the curated life-path dimensions below to trigger an in-depth celestial analysis.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              {quickPrompts.map((prompt) => {
                const IconComponent = prompt.icon;
                const isSelected = selectedPrompt === prompt.title;
                return (
                  <button
                    key={prompt.title}
                    type="button"
                    disabled={analysisLoading}
                    onClick={() => {
                      setInput(""); // Clear custom input
                      if (prompt.title === "Sample Life Analysis") {
                        setSelectedPrompt(prompt.title);
                        setAnalysisResult(defaultSampleResult);
                      } else {
                        runAnalysis(prompt.query, prompt.title);
                      }
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer group disabled:opacity-50 ${
                      isSelected
                        ? "bg-[#5c4df2]/10 border-[#5c4df2] text-white shadow-md shadow-[#5c4df2]/5"
                        : `${prompt.color} bg-slate-950/60 border-slate-800/80`
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mt-0.5 shrink-0 text-amber-500 group-hover:scale-110 transition-transform" />
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold tracking-wide block">{prompt.title}</span>
                      <span className="text-[10px] text-slate-400 leading-normal line-clamp-2">{prompt.query}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CUSTOM INQUIRY FORM */}
          <div className="border border-slate-800/60 bg-slate-900/20 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-4 h-4 text-slate-400" />
              Ask a Custom Question
            </h3>
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div className="relative rounded-xl border border-slate-800 bg-slate-950/60 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all overflow-hidden">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCustomSubmit(e);
                    }
                  }}
                  rows={4}
                  placeholder="Ask any custom question regarding career, transit impact, wealth houses, or remedies..."
                  disabled={analysisLoading}
                  className="w-full bg-transparent border-none outline-none p-3.5 pr-12 text-xs leading-relaxed text-slate-100 placeholder-slate-500 resize-none min-h-[90px]"
                />
                
                <div className="absolute right-3 bottom-3 flex items-center">
                  <button
                    type="submit"
                    disabled={analysisLoading || !input.trim()}
                    className="p-2.5 bg-[#5c4df2] hover:bg-[#4b3de0] disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-all shadow-lg shadow-[#5c4df2]/10 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono px-1">
                <span>Press Enter to submit</span>
                {input.trim() && (
                  <button
                    type="button"
                    onClick={() => setInput("")}
                    className="hover:text-slate-300 transition-colors uppercase font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Dedicated Results Analysis (spans 7 cols) */}
        <div ref={analysisRef} className="lg:col-span-7 space-y-4 self-stretch flex flex-col justify-between">
          <div className="h-full flex flex-col">
            {analysisLoading && (
              <div className="p-12 border border-indigo-500/10 rounded-2xl bg-slate-950/40 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center min-h-[450px] h-full">
                <RefreshCw className="w-8 h-8 text-[#5c4df2] animate-spin" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    Computing {selectedPrompt} Analysis...
                  </h5>
                  <p className="text-[10px] text-slate-500 font-mono animate-pulse mt-1">
                    {currentStatusMsg}
                  </p>
                </div>
              </div>
            )}

            {!analysisLoading && analysisResult && (
              <div className="border border-amber-500/20 rounded-2xl bg-slate-900/40 backdrop-blur-md overflow-hidden shadow-2xl relative animate-fade-in flex flex-col h-full min-h-[450px]">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-amber-500 to-[#5c4df2]" />
                
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* Card Title Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold font-mono uppercase tracking-widest">
                          <span>Targeted Celestial Report</span>
                        </div>
                        <h4 className="text-sm font-black text-slate-100 tracking-wide uppercase flex items-center gap-1.5">
                          {selectedPrompt}
                        </h4>
                      </div>
                      
                      {/* Close/Clear Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPrompt(null);
                          setAnalysisResult(null);
                        }}
                        className="px-2 py-1 text-[10px] font-bold font-mono uppercase rounded border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        Clear Screen
                      </button>
                    </div>

                    {/* Analysis Text Content */}
                    <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs leading-relaxed text-slate-200 font-sans overflow-y-auto max-h-[520px] flex-1 scrollbar-thin">
                      <div className="whitespace-pre-wrap space-y-2">
                        {analysisResult.split("\n").map((line, lineIdx) => {
                          if (line.startsWith("### ")) {
                            return <h5 key={lineIdx} className="text-xs font-bold text-amber-200 mt-2.5 mb-1">{line.replace("### ", "")}</h5>;
                          }
                          if (line.startsWith("## ")) {
                            return <h4 key={lineIdx} className="text-sm font-bold text-amber-300 mt-3.5 mb-1.5">{line.replace("## ", "")}</h4>;
                          }
                          if (line.startsWith("# ")) {
                            return <h3 key={lineIdx} className="text-base font-bold text-amber-400 mt-4.5 mb-2">{line.replace("# ", "")}</h3>;
                          }
                          const bolded = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                          return (
                            <p
                              key={lineIdx}
                              className="mb-1.5 last:mb-0"
                              dangerouslySetInnerHTML={{ __html: bolded }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Toolbar Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/40">
                    <p className="text-[10px] text-slate-500 font-mono">
                      Calculated dynamically via Active Birth Profile & Swiss Ephemeris.
                    </p>

                    <div className="flex items-center gap-2">
                      {/* Copy Button */}
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Report</span>
                          </>
                        )}
                      </button>

                      {/* Download Button */}
                      <button
                        type="button"
                        onClick={downloadAnalysisText}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-[#5c4df2]/20 bg-[#5c4df2]/10 text-[#7c6ff6] hover:bg-[#5c4df2]/20 hover:text-white transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download (.txt)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!analysisLoading && !analysisResult && (
              <div className="p-12 border border-slate-800 border-dashed rounded-2xl bg-slate-950/20 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2 min-h-[450px] h-full">
                <Info className="w-6 h-6 text-slate-600 mb-1" />
                <span>Select an interactive life-path dimension on the left to trigger your personalized cosmic consultation report.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
