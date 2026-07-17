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
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [targetAge, setTargetAge] = useState<number>(28);
  const [currentStatusMsg, setCurrentStatusMsg] = useState("");

  const analysisRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      title: "Marriage Promise",
      label: "💍 Marriage Promise",
      query: "Explain my overall Marriage Promise. Is it auspicious, or are there significant obstructions?",
      icon: Heart,
      color: "hover:border-rose-500/40 hover:bg-rose-500/5 text-rose-400 border-rose-500/10"
    },
    {
      title: "Marriage Timing",
      label: "📅 Marriage Timing",
      query: "When will I marry? Which planetary DBA period indicates activation of my marriage gates?",
      icon: Clock,
      color: "hover:border-emerald-500/40 hover:bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
    },
    {
      title: "Love vs Arranged",
      label: "💑 Love or Arranged?",
      query: "Does my chart favor Love or Arranged Marriage? Show D1/D9 5th and 7th house connections.",
      icon: Flame,
      color: "hover:border-amber-500/40 hover:bg-amber-500/5 text-amber-400 border-amber-500/10"
    },
    {
      title: "Delay Factors",
      label: "⚠️ Delay Factors",
      query: "What are the primary factors causing marriage delay in my chart? Detail Saturn or Rahu's aspect on the 7th house.",
      icon: AlertTriangle,
      color: "hover:border-yellow-500/40 hover:bg-yellow-500/5 text-yellow-400 border-yellow-500/10"
    },
    {
      title: "Divorce Analysis",
      label: "💔 Divorce Analysis",
      query: "Analyze divorce or separation risks in my chart. Check the role of 6th, 8th, and 12th houses.",
      icon: ShieldAlert,
      color: "hover:border-red-500/40 hover:bg-red-500/5 text-red-400 border-red-500/10"
    },
    {
      title: "Spouse Prediction",
      label: "🔮 Spouse Profile",
      query: "Provide a detailed Spouse Prediction: physical appearance, character, profession, social standing, and possible direction of origin.",
      icon: User,
      color: "hover:border-indigo-500/40 hover:bg-indigo-500/5 text-indigo-400 border-indigo-500/10"
    },
    {
      title: "Dasha Activation",
      label: "👑 Dasha Activation",
      query: "Detail my active Vimshottari dasha timeline. Which planets are opening doors for marriage or career right now?",
      icon: Calendar,
      color: "hover:border-violet-500/40 hover:bg-violet-500/5 text-violet-400 border-violet-500/10"
    },
    {
      title: "Career Path",
      label: "🌟 Career Path",
      query: "Analyze my professional profile, career promise, and 10th house strength. What fields suit me best?",
      icon: Sparkles,
      color: "hover:border-blue-500/40 hover:bg-blue-500/5 text-blue-400 border-blue-500/10"
    },
    {
      title: "Vedic Remedies",
      label: "✨ Vedic Remedies",
      query: "What are my recommended Relationship Remedies? List Vedic mantras, gem recommendations, and charity directives.",
      icon: Award,
      color: "hover:border-teal-500/40 hover:bg-teal-500/5 text-teal-400 border-teal-500/10"
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
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4">
      {/* INTERACTIVE CELESTIAL PROMPTS (Pills placed at the very top as requested) */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Interactive Alignment & Diagnostics</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {quickPrompts.map((prompt) => {
            const IconComponent = prompt.icon;
            const isSelected = selectedPrompt === prompt.title;
            return (
              <button
                key={prompt.title}
                type="button"
                disabled={analysisLoading}
                onClick={() => {
                  setInput(""); // Clear custom input to focus on the selected prompt
                  runAnalysis(prompt.query, prompt.title);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold font-sans transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#5c4df2] text-white border-[#5c4df2] shadow-md shadow-[#5c4df2]/30 scale-[1.02]"
                    : `${prompt.color} bg-slate-950 border-slate-800/80`
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{prompt.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTERED USER INPUT CONTAINER */}
      <div className="space-y-4">
        <form
          onSubmit={handleCustomSubmit}
          className="p-5 border border-indigo-500/10 rounded-2xl bg-slate-950/40 backdrop-blur-md shadow-2xl space-y-3"
        >
          <div className="relative rounded-xl border border-slate-800 bg-slate-900/40 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all overflow-hidden">
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
              placeholder="Ask our Master AI Astrologer any custom question (e.g. 'What does my 7th house signify?', 'Tell me about my Venus placement', 'Will my carrier be stable?')..."
              disabled={analysisLoading}
              className="w-full bg-transparent border-none outline-none p-4 pr-16 text-xs leading-relaxed text-slate-100 placeholder-slate-400 resize-none min-h-[100px]"
            />
            
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              {input.trim() && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  className="px-2.5 py-1.5 text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase transition-all cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                disabled={analysisLoading || !input.trim()}
                className="p-3 bg-[#5c4df2] hover:bg-[#4b3de0] disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-all shadow-lg shadow-[#5c4df2]/10 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end items-center px-1 text-[10px] text-slate-500">
            <span>Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-400 font-mono text-[9px]">Enter</kbd> to submit query.</span>
          </div>
        </form>
      </div>

      {/* DEDICATED RESULTS ANALYSIS CARD */}
      <div ref={analysisRef} className="pt-2 scroll-mt-6">
        {analysisLoading && (
          <div className="p-10 border border-indigo-500/10 rounded-2xl bg-slate-950/40 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center">
            <RefreshCw className="w-8 h-8 text-[#5c4df2] animate-spin" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Computing {selectedPrompt} Analysis...
              </h5>
              <p className="text-[10px] text-slate-500 font-mono animate-pulse">
                {currentStatusMsg}
              </p>
            </div>
          </div>
        )}

        {!analysisLoading && analysisResult && (
          <div className="border border-amber-500/20 rounded-2xl bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-2xl relative animate-fade-in">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-amber-500 to-[#5c4df2]" />
            
            <div className="p-5 space-y-4">
              {/* Card Title Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold font-mono uppercase tracking-widest">
                    <span>Targeted Celestial Report</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-100 tracking-wide uppercase flex items-center gap-1.5">
                    {selectedPrompt} Analysis
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
                  Close Report
                </button>
              </div>

              {/* Analysis Text Content */}
              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs leading-relaxed text-slate-200 font-sans max-h-[500px] overflow-y-auto scrollbar-thin">
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

              {/* Toolbar Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/40">
                <p className="text-[10px] text-slate-500 font-mono">
                  Report completed using active birth profile and target age of {targetAge}.
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
          <div className="p-8 border border-slate-800 border-dashed rounded-2xl bg-slate-950/20 text-center text-slate-500 text-xs">
            Select an interactive celestial prompt or type a custom query above to calculate and render your high-fidelity celestial report.
          </div>
        )}
      </div>
    </div>
  );
}
