/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, Compass, ShieldAlert, BrainCircuit } from "lucide-react";
import { AstrologyData } from "../lib/astrology";

interface AstroChatProps {
  astrologyData: AstrologyData | null;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export default function AstroChat({ astrologyData }: AstroChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStatusMsg, setCurrentStatusMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const statusMessages = [
    "Consulting the constellations...",
    "Decoding planetary conjunctions...",
    "Interpreting Vimshottari dasha periods...",
    "Formulating astrological recommendations...",
    "Analyzing celestial aspect patterns...",
  ];

  // Set initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: astrologyData
            ? `Pranam! 🙏 I am JHora AI, your personal Vedic Astrology & Jyotish consultant. I have loaded the birth chart details for **${astrologyData.birthDetails.name}**.\n\nYou are born with a **${astrologyData.lagna.sign}** Ascendant and your Moon is in **${astrologyData.planets.find(p => p.name === "Moon")?.sign}**. \n\nHow can I guide you today? Feel free to ask about your career, relationship compatibility, dasha cycles, auspicious yogas, or any remedies.`
            : `Pranam! 🙏 I am JHora AI, your personal Vedic Astrology consultant. \n\nPlease configure your birth details in the **Horoscope Dashboard** first. Once calculated, I can analyze your specific planetary aspects, dasha periods, yogas, and answer any direct life questions.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [astrologyData]);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Rotate loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      let idx = 0;
      setCurrentStatusMsg(statusMessages[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % statusMessages.length;
        setCurrentStatusMsg(statusMessages[idx]);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    if (!astrologyData) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "user",
          text,
          timestamp: new Date(),
        },
        {
          id: Math.random().toString(),
          sender: "ai",
          text: "Please configure and calculate your birth chart in the **Horoscope Dashboard** tab before asking specific questions! This enables me to run precise Parashari computations for you.",
          timestamp: new Date(),
        },
      ]);
      if (!textToSend) setInput("");
      return;
    }

    // Append user message
    const userMsgId = Math.random().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text,
        timestamp: new Date(),
      },
    ]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/astrology/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          astrologyData,
          question: text,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "ai",
          text: data.analysis,
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      console.error("AI analysis error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "ai",
          text: `⚠️ **System Alignments Unsuccessful:** \n\n${err.message || "Failed to establish planetary communication. Ensure your server is running and a valid GEMINI_API_KEY is configured in Settings > Secrets."}\n\n*Note: To resolve this, verify that your Gemini API Key is saved in the AI Studio secrets.*`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    { label: "💼 Career & Wealth", text: "What does my chart indicate about my career path, ideal profession, and financial prospects?" },
    { label: "🌟 Auspicious Yogas", text: "Do I have any significant planetary Yogas in my chart? Explain their placement and outcomes." },
    { label: "📅 Active Dasha Period", text: "Analyze my current active Dasha cycle. What are the key life themes and lessons during this period?" },
    { label: "🛡️ Remedies & Wellness", text: "What are the traditional Vedic remedies (mantras, charitable deeds, gemstones) for any negative placements or active doshas in my chart?" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px] max-h-[75vh]" id="ai-chat-interface">
      {/* Suggestions and Info Sidebar */}
      <div className="lg:col-span-4 flex flex-col justify-between bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-5 shadow-xl h-full overflow-y-auto">
        <div>
          <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-amber-500" />
            Jyotish AI Intelligence
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
            Our AI Astrologer reads your computed Parashari variables in real-time, combining classical Sanskrit guidelines with the advanced reasoning of Gemini Flash to deliver accurate interpretations.
          </p>

          <h5 className="text-[10px] uppercase tracking-wider font-mono font-bold text-amber-400/90 mb-3">
            Suggested Consultations
          </h5>
          <div className="space-y-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSend(q.text)}
                className="w-full text-left bg-slate-950/40 border border-indigo-500/10 hover:border-amber-500/30 hover:bg-slate-950/80 rounded-xl p-3 text-xs text-slate-300 transition-all flex items-start gap-2.5"
              >
                <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-slate-100 mb-0.5">{q.label}</span>
                  <span className="text-slate-400 text-[10px] line-clamp-1">{q.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {astrologyData && (
          <div className="bg-slate-950/50 border border-indigo-500/10 p-3 rounded-xl text-[10px] text-slate-400 mt-6 flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Now analyzing **{astrologyData.birthDetails.name}**&apos;s chart ({astrologyData.birthDetails.date}).
            </span>
          </div>
        )}
      </div>

      {/* Primary Conversation Screen */}
      <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 shadow-xl flex flex-col h-full overflow-hidden">
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${
                m.sender === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              {/* Profile Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-mono text-[10px] font-bold ${
                  m.sender === "user"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-indigo-600 text-white"
                }`}
              >
                {m.sender === "user" ? "ME" : "ॐ"}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed border ${
                  m.sender === "user"
                    ? "bg-amber-500/10 border-amber-500/20 text-slate-100"
                    : "bg-slate-950/55 border-indigo-500/10 text-slate-200 markdown-content"
                }`}
              >
                {/* Parse simple markdown headings / list items / bold tags */}
                <div className="whitespace-pre-wrap">
                  {m.text.split("\n").map((line, lineIdx) => {
                    // Check if it is a heading
                    if (line.startsWith("### ")) {
                      return <h5 key={lineIdx} className="text-xs font-bold text-amber-200 mt-3 mb-1">{line.replace("### ", "")}</h5>;
                    }
                    if (line.startsWith("## ")) {
                      return <h4 key={lineIdx} className="text-sm font-bold text-amber-300 mt-4 mb-2">{line.replace("## ", "")}</h4>;
                    }
                    if (line.startsWith("# ")) {
                      return <h3 key={lineIdx} className="text-base font-bold text-amber-400 mt-5 mb-2">{line.replace("# ", "")}</h3>;
                    }
                    
                    // Simple replacement of **bold** with <strong> tags
                    const formattedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                    return (
                      <p 
                        key={lineIdx} 
                        className="mb-1.5 last:mb-0"
                        dangerouslySetInnerHTML={{ __html: formattedLine }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Animation Bubble */}
          {loading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-600 text-white shrink-0 font-mono text-[10px] font-bold animate-pulse">
                ॐ
              </div>
              <div className="rounded-2xl p-4 text-xs bg-slate-950/55 border border-indigo-500/10 text-slate-400 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="font-mono text-[10px] text-slate-400 ml-2 animate-pulse">
                  {currentStatusMsg}
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-indigo-500/10 bg-slate-950/40 flex items-center gap-3">
          <input
            type="text"
            placeholder={
              astrologyData
                ? "Ask JHora AI about your career, marriage, dasha cycles..."
                : "Configure your birth chart details to initiate consulting..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50"
            id="chat-input-field"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            id="btn-send-message"
          >
            <Send className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
}
