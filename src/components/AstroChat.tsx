/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MyPageView } from "./MyPageView";
import {
  Send,
  Sparkles,
  Clock,
  MapPin,
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
  HelpCircle,
  Search,
  Folder,
  MessageSquare,
  Plus,
  Mic,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  ExternalLink,
  Menu,
  Paperclip,
  Settings,
  ArrowUp,
  ArrowLeft,
  Compass,
  Briefcase,
  Moon,
  Sun,
  Orbit
} from "lucide-react";
import { AstrologyData } from "../lib/astrology";
import { apiFetch as fetch } from "../lib/api";
import { ConversationService } from "../features/ask/services/ConversationService";
import moodRules from "../knowledgebase/checklist_engine/mood_analysis_rules.json";

interface AstroChatProps {
  astrologyData: AstrologyData | null;
  isStandalone?: boolean;
  onCloseStandalone?: () => void;
  onNavigateMenu?: (menu: string, submenu?: string) => void;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  debugInfo?: any;
}

export default function AstroChat({ astrologyData, isStandalone, onCloseStandalone, onNavigateMenu }: AstroChatProps) {
  // Sidebar open/close state on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Collapsible right panel state
  const [activeRightTab, setActiveRightTab] = useState<"trace" | "technical" | "charts" | "reports" | null>(null);

  // Active profile / conversation ID
  const [activeConversationId, setActiveConversationId] = useState("jh-api");

  // Chat message history (Starts completely empty for a premium ChatGPT feel)
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [responseMode, setResponseMode] = useState<"quick" | "detailed" | "professional" | "research">("professional");
  const [selectedDebugMsg, setSelectedDebugMsg] = useState<Message | null>(null);
  
  const [rulesStatus, setRulesStatus] = useState<any>(null);
  const [currentSky, setCurrentSky] = useState<any>(null);
  const [loadingContext, setLoadingContext] = useState<boolean>(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [likedMessages, setLikedMessages] = useState<Record<string, boolean>>({});
  const [dislikedMessages, setDislikedMessages] = useState<Record<string, boolean>>({});
  const [currentStatusMsg, setCurrentStatusMsg] = useState("");
  const [moodAnalysisExpanded, setMoodAnalysisExpanded] = useState(true);
  const [myLifeExpanded, setMyLifeExpanded] = useState(true);
  const [myJourneyExpanded, setMyJourneyExpanded] = useState(true);
  const [myReportsExpanded, setMyReportsExpanded] = useState(true);
  const [activeSubmenuPanel, setActiveSubmenuPanel] = useState<string | null>(null);

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [locationName, setLocationName] = useState<string>("Gurugram, India");
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`/api/jhora/location/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await res.json();
            if (data.address) {
              const city = data.address.city || data.address.town || data.address.village || data.address.county || "Gurugram";
              const country = data.address.country || "India";
              setLocationName(`${city}, ${country}`);
            }
          } catch (e) {
            // fallback stays Gurugram, India
          } finally {
            setLocationLoading(false);
          }
        },
        () => {
          setLocationLoading(false);
        }
      );
    }

    return () => clearInterval(timer);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to get active dasha based on astrologyData
  const getActiveDashaText = () => {
    if (!astrologyData || !astrologyData.dashas) return "Mercury-Saturn-Mercury";
    
    // Find current active dasha
    const now = new Date();
    
    const maha = astrologyData.dashas.find(m => {
      const start = new Date(m.startDate);
      const end = new Date(m.endDate);
      return now >= start && now <= end;
    });
    
    if (maha) {
      let activeMaha = maha.lord;
      let activeBhukti = "Saturn";
      let activeAntara = "Mercury";
      
      if (maha.subPeriods) {
        const bhuk = maha.subPeriods.find(b => {
          const start = new Date(b.startDate);
          const end = new Date(b.endDate);
          return now >= start && now <= end;
        });
        if (bhuk) {
          activeBhukti = bhuk.lord;
          if (bhuk.subPeriods) {
            const ant = bhuk.subPeriods.find(a => {
              const start = new Date(a.startDate);
              const end = new Date(a.endDate);
              return now >= start && now <= end;
            });
            if (ant) {
              activeAntara = ant.lord;
            }
          }
        }
      }
      return `${activeMaha}-${activeBhukti}-${activeAntara}`;
    }
    
    return "Mercury-Saturn-Mercury";
  };

  const activeDasha = getActiveDashaText();
  const lagnaSign = astrologyData?.lagna?.sign || "Cancer";
  const natalMoonSign = astrologyData?.planets?.find(p => p.name === "Moon")?.sign || "Aquarius";
  const natalMoonNak = astrologyData?.planets?.find(p => p.name === "Moon")?.nakshatra || "Shatabhisha";

  const profileName = (astrologyData as any)?.name || astrologyData?.birthDetails?.name || "Nitin";
  const profileDob = astrologyData?.birthDetails?.date || "1979-07-16";
  const profileTob = astrologyData?.birthDetails?.time || "17:42:00";
  const profilePob = astrologyData?.birthDetails?.location || (astrologyData?.birthDetails as any)?.place || "New Delhi, India";

  const dashaParts = activeDasha ? activeDasha.split("-") : ["Mercury", "Saturn", "Jupiter"];
  const antaraLord = dashaParts[2] || "Jupiter";
  const pranaLord = "Venus";

  const transitMoonSign = currentSky?.moon?.currentSign?.displayName || currentSky?.moon?.currentSign || currentSky?.planets?.moon?.currentSign || "Capricorn";
  const transitMoonNak = currentSky?.moon?.currentNakshatra?.displayName || currentSky?.moon?.currentNakshatra || currentSky?.planets?.moon?.nakshatra || "Uttara Ashadha";
  const transitMoonStarLord = currentSky?.moon?.currentStarLord?.displayName || currentSky?.moon?.currentStarLord || currentSky?.moon?.currentNakshatra?.lord || currentSky?.planets?.moon?.starLord || "Sun";
  const transitMoonSubLord = currentSky?.moon?.currentSubLord?.displayName || currentSky?.moon?.currentSubLord || currentSky?.planets?.moon?.subLord || "Jupiter";

  const transitSunSign = currentSky?.sun?.sign?.displayName || currentSky?.planets?.sun?.currentSign || "Cancer";
  const transitSunNak = currentSky?.sun?.nakshatra?.displayName || currentSky?.planets?.sun?.nakshatra || "Pushya";
  const transitJupSign = currentSky?.planets?.jupiter?.currentSign || "Sagittarius";
  const transitSatSign = currentSky?.planets?.saturn?.currentSign || "Leo";
  const transitMarSign = currentSky?.planets?.mars?.currentSign || "Cancer";

  // Dynamically load/build the prompts from the imported JSON
  const getMoodPromptsFromJSON = () => {
    const prompts = [];
    
    // Add Daily Horoscope / Mood prompt
    prompts.push({
      id: "daily_mood_prediction",
      label: "Daily Mood Reading",
      query: `Generate a personalized daily mood reading and activity guidance based on the "daily_horoscope_engine" and "mood_prediction" rules. Layer today's Moon transit (currently in ${currentSky?.moon?.currentNakshatra?.displayName || "Chitra"} Nakshatra, ${currentSky?.moon?.currentSign?.displayName || "Libra"} sign) over my current Vimshottari period (${activeDasha}) to calculate Tara Bala, Chandra Bala, and daily emotional metrics.`
    });

    // Add domains from JSON
    if (moodRules && moodRules.domains) {
      Object.entries(moodRules.domains).forEach(([key, value]: [string, any]) => {
        let label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        // Custom beautified labels for specific keys
        if (key === "marriage_first") label = "Marriage Promise Check";
        else if (key === "marriage_love_vs_arranged") label = "Love vs Arranged Marriage";
        else if (key === "marriage_delay_denial") label = "Marriage Delay & Denial";
        else if (key === "separation_divorce") label = "Separation & Divorce Risk";
        else if (key === "career_promotion") label = "Career & Promotion Timing";
        else if (key === "finance_wealth") label = "Wealth & Assets Accrual";
        else if (key === "health_disease") label = "Health & Disease Risk";
        else if (key === "foreign_travel_settlement") label = "Foreign Relocation/Travel";
        else if (key === "property_vehicle") label = "Property & Vehicle Purchase";

        let ruleText = "";
        if (value.kp_rule) ruleText += ` KP Rule: ${value.kp_rule}`;
        if (value.delay_rule) ruleText += ` Delay Rule: ${value.delay_rule}`;
        if (value.denial_rule) ruleText += ` Denial Rule: ${value.denial_rule}`;
        if (value.parashari_cross_check) ruleText += ` Parashari Cross-Check: ${value.parashari_cross_check}`;
        if (value.jaimini_cross_check) ruleText += ` Jaimini Cross-Check: ${value.jaimini_cross_check}`;

        prompts.push({
          id: key,
          label: label,
          query: `Assess my astrological promise for [${label}] by executing the rules in our Mood Analysis schema. Formulate a multi-system convergence score (out of 10) across Krishnamurti Paddhati (KP), Parashari, Jaimini, and Ashtakavarga systems, specifically checking: ${ruleText}`
        });
      });
    }

    // Add Future Predictions prompt
    prompts.push({
      id: "future_prediction_timeline",
      label: "Future Forecast Timeline",
      query: `Evaluate a medium to long-term future forecast timeline using the "future_prediction_engine" rules. Walk my forward Dasha sequences (Mahadasha, Antardasha, Pratyantardasha) against slower-resolution transits of Jupiter, Saturn, Rahu, and Ketu to trace peak activation windows and potential life-theme changes.`
    });

    return prompts;
  };

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
        console.error("Failed to load astrological context in AstroChat:", err);
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
    `Synthesizing active ${activeDasha} dasha weights...`,
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
      const preferences = ConversationService.getPreferences();
      const geminiApiKey = preferences?.geminiApiKey;

      const response = await fetch("/api/astrology/master-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          astrologyData,
          question: queryText,
          targetAge: 50,
          mode: responseMode,
          history: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
          geminiApiKey
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
        text: `⚠️ **Master AI Astrologer Session Interrupted:**\n\n${err.message || "Failed to generate report. Please verify your GEMINI_API_KEY is configured."}`,
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
      setMessages([]);
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

  const toggleLike = (msgId: string) => {
    setLikedMessages(prev => ({ ...prev, [msgId]: !prev[msgId] }));
    setDislikedMessages(prev => ({ ...prev, [msgId]: false }));
  };

  const toggleDislike = (msgId: string) => {
    setDislikedMessages(prev => ({ ...prev, [msgId]: !prev[msgId] }));
    setLikedMessages(prev => ({ ...prev, [msgId]: false }));
  };

  // Pre-defined quick queries
  const quickPrompts = [
    {
      title: "Today's Mood & Wellness",
      query: `Analyze my daily mood, emotional energy, and general wellness today. Combine my natal coordinates (${lagnaSign} Lagna, ${natalMoonSign} ${natalMoonNak} Moon) with today's transiting Moon in ${currentSky?.moon?.currentNakshatra?.displayName || "Chitra"} Nakshatra to yield deep psychological metrics.`
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
      title: "Dasha Roadmap & Remedies",
      query: `Detail my active ${activeDasha} Vimshottari roadmap. What are the key directives, upcoming turning points, and immediate practical remedies for my life right now?`
    }
  ];

  // Custom rich renderer for markdown text with vibrant tables & formatting
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check if line looks like a table row (contains '|' and starts/ends with '|')
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
          tableLines.push(lines[i].trim());
          i++;
        }

        // Filter out divider lines like |---|---|
        const dataRows = tableLines.filter(row => !/^\|[\s\-:|]+\|$/.test(row));
        if (dataRows.length > 0) {
          const headerCells = dataRows[0]
            .split("|")
            .slice(1, -1)
            .map(c => c.trim());

          const bodyRows = dataRows.slice(1).map(row =>
            row
              .split("|")
              .slice(1, -1)
              .map(c => c.trim())
          );

          elements.push(
            <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-indigo-200/90 shadow-2xs bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white font-mono text-xs uppercase tracking-wider">
                    {headerCells.map((h, hIdx) => (
                      <th key={hIdx} className="py-2.5 px-3.5 font-bold border-b border-indigo-900/80">
                        {h.replace(/\*\*(.*?)\*\*/g, "$1")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100/80">
                  {bodyRows.map((rowCells, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white hover:bg-purple-50/60 transition-colors" : "bg-indigo-50/50 hover:bg-purple-50/60 transition-colors"}>
                      {rowCells.map((cell, cIdx) => {
                        const bolded = cell.replace(/\*\*(.*?)\*\*/g, "<strong class='text-indigo-950 font-bold'>$1</strong>");
                        return (
                          <td key={cIdx} className="py-2 px-3.5 text-xs text-neutral-900 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: bolded }} />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Headers
      if (line.startsWith("### ")) {
        elements.push(
          <h4 key={`h4-${i}`} className="text-xs font-extrabold uppercase font-mono tracking-wider bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent mt-4 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            {line.replace("### ", "")}
          </h4>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-sm font-bold text-neutral-900 mt-5 mb-2 font-sans border-l-4 border-indigo-600 pl-2.5 py-1 bg-gradient-to-r from-indigo-50 to-purple-50/40 rounded-r-lg shadow-2xs">
            {line.replace("## ", "")}
          </h3>
        );
      } else if (line.startsWith("# ")) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-base font-extrabold text-indigo-950 mt-6 mb-3 font-sans tracking-tight bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-950 bg-clip-text text-transparent border-b border-indigo-100 pb-1">
            {line.replace("# ", "")}
          </h2>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        const cleanLine = line.replace(/^[-*]\s+/, "");
        const bolded = cleanLine.replace(/\*\*(.*?)\*\*/g, "<strong class='text-neutral-950 font-bold'>$1</strong>");
        elements.push(
          <li key={`li-${i}`} className="ml-4 list-disc text-neutral-800 text-xs mb-1.5 leading-relaxed marker:text-indigo-600" dangerouslySetInnerHTML={{ __html: bolded }} />
        );
      } else if (line.startsWith("> ")) {
        const cleanLine = line.replace(/^>\s+/, "");
        const bolded = cleanLine.replace(/\*\*(.*?)\*\*/g, "<strong class='text-amber-950 font-bold'>$1</strong>");
        elements.push(
          <blockquote key={`bq-${i}`} className="my-2 p-3 rounded-r-xl border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50/30 text-amber-950 text-xs font-medium shadow-2xs leading-relaxed" dangerouslySetInnerHTML={{ __html: bolded }} />
        );
      } else if (line.trim().length > 0) {
        const bolded = line.replace(/\*\*(.*?)\*\*/g, "<strong class='text-neutral-950 font-bold'>$1</strong>");
        elements.push(
          <p key={`p-${i}`} className="mb-2.5 leading-relaxed text-neutral-800 text-xs font-sans" dangerouslySetInnerHTML={{ __html: bolded }} />
        );
      }

      i++;
    }

    return elements;
  };

  const activeDebugInfo = selectedDebugMsg?.debugInfo || messages[messages.length - 1]?.debugInfo;

  return (
    <div className={`w-full ${isStandalone ? "h-screen border-none rounded-none shadow-none" : "h-[calc(100vh-140px)] min-h-[580px] rounded-2xl border border-neutral-200 shadow-xl"} bg-white text-neutral-800 flex flex-col overflow-hidden relative font-sans`}>
      
      {/* UNIFIED TOP COMPACT HEADER (Full width across entire app window) */}
      <div className="h-12 border-b border-neutral-200/80 px-3 flex items-center justify-between bg-white text-neutral-800 shrink-0 z-30 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          {/* Sidebar toggle button (Mobile only) */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-neutral-100 lg:hidden text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          {activeSubmenuPanel ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveSubmenuPanel(null)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200/90 text-[10.5px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3 h-3 text-indigo-600" />
                <span>Back to Assistant</span>
              </button>
              <span className="text-xs font-bold text-neutral-800 capitalize tracking-tight ml-1">
                {activeSubmenuPanel.replace(/_/g, " ")} Module
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-sans scrollbar-none py-0.5 min-w-0">
              {/* Transit Moon Nakshatra & Lord/Sublord Pill */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-indigo-900 font-medium shrink-0 shadow-2xs text-[10px]">
                <Moon className="w-3 h-3 text-indigo-600 shrink-0" />
                <span className="font-bold text-indigo-950">{transitMoonSign}</span>
                <span className="text-indigo-300">·</span>
                <span className="font-semibold">{transitMoonNak}</span>
                <span className="text-indigo-300">|</span>
                <span className="font-mono text-[9.5px] text-indigo-800 flex items-center gap-0.5">
                  <strong className="text-indigo-950 font-bold">Ld:</strong> {transitMoonStarLord}
                  <span className="text-indigo-300">·</span>
                  <strong className="text-indigo-950 font-bold">Sub:</strong> {transitMoonSubLord}
                </span>
              </div>

              {/* Major Planets Transit Summary Pill */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[9.5px] font-mono shrink-0 shadow-2xs">
                <Orbit className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="flex items-center gap-0.5">
                  <Sun className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                  <strong className="text-amber-950 font-bold">{transitSunSign}</strong> <span className="text-[9px] text-amber-800">({transitSunNak})</span>
                </span>
                <span className="text-amber-300">|</span>
                <span>
                  <strong className="text-purple-900 font-bold">Jup:</strong> {transitJupSign}
                </span>
                <span className="text-amber-300">|</span>
                <span>
                  <strong className="text-slate-900 font-bold">Sat:</strong> {transitSatSign}
                </span>
                <span className="text-amber-300">|</span>
                <span>
                  <strong className="text-rose-900 font-bold">Mar:</strong> {transitMarSign}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {!activeSubmenuPanel && (
            /* Current Date, Live Time & Location details pill */
            <div className="hidden sm:flex items-center gap-1.5 bg-neutral-50 border border-neutral-200/80 px-2 py-0.5 rounded-full text-[10px] font-medium text-neutral-700 shadow-2xs shrink-0">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="font-semibold text-neutral-800">
                  {currentDateTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="text-neutral-300">·</span>
                <span className="font-mono text-indigo-600 font-bold text-[10px]">
                  {currentDateTime.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <span className="text-neutral-300">|</span>
              <div className="flex items-center gap-1 text-neutral-700">
                <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="font-medium text-neutral-800 truncate max-w-[90px]">
                  {locationLoading ? "Locating..." : locationName}
                </span>
              </div>
            </div>
          )}

          {/* Compact unified action icon stack */}
          <div className="inline-flex items-center bg-white border border-neutral-200/90 rounded-full p-0.5 shadow-2xs shrink-0">
            {onCloseStandalone && (
              <button
                onClick={onCloseStandalone}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer"
                title="Return to Dashboard"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            )}

            <button 
              onClick={() => {
                window.open(window.location.origin + window.location.pathname + "?mode=chat", "_blank");
              }}
              className="p-1 rounded-full hover:bg-neutral-100 text-[#5c4df2] transition-all cursor-pointer"
              title="Open in New Window"
            >
              <ExternalLink className="w-3 h-3" />
            </button>

            <button 
              onClick={() => {
                alert("Share Link: Astrological conversation state serialized securely.");
              }}
              className="p-1 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer"
              title="Share conversation"
            >
              <Share2 className="w-3 h-3" />
            </button>

            <button
              onClick={clearChat}
              title="Reset Conversation"
              className="p-1 rounded-full hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-all cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER (Sidebar + Center Workspace) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 1. LEFT SIDEBAR */}
        <div className={`fixed lg:relative inset-y-0 left-0 w-[260px] bg-white border-r border-neutral-200 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          
        {/* Sidebar Navigation Entries */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3 scrollbar-thin">
          
          {/* Main ChatGPT Menu items */}
          <div className="space-y-2">
            {/* 1. My Journey (Renamed from My Mood Analysis) */}
            <div className="space-y-0.5">
              <button
                onClick={() => setMoodAnalysisExpanded(!moodAnalysisExpanded)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs ${
                  moodAnalysisExpanded 
                    ? "bg-gradient-to-r from-indigo-100/90 via-purple-100/70 to-indigo-50 text-indigo-950 border border-indigo-200" 
                    : "bg-neutral-50/80 hover:bg-indigo-50/60 text-neutral-800 hover:text-indigo-900 border border-neutral-200/70"
                }`}
              >
                <Compass className={`w-4 h-4 shrink-0 ${moodAnalysisExpanded ? "text-indigo-600" : "text-indigo-500"}`} />
                <span className="font-sans tracking-tight">My Journey</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 ${moodAnalysisExpanded ? "rotate-180 text-indigo-700" : ""}`} />
              </button>

              {moodAnalysisExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-indigo-200 space-y-1 py-1 max-h-[220px] overflow-y-auto scrollbar-thin">
                  {getMoodPromptsFromJSON().map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        runAnalysis(p.query);
                        setSidebarOpen(false);
                      }}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-[11px] font-medium text-neutral-800 hover:text-indigo-950 bg-neutral-50/60 hover:bg-indigo-50 border border-transparent hover:border-indigo-200/80 w-full text-left transition-all cursor-pointer group shadow-2xs"
                      title={p.label}
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500 group-hover:text-purple-600 shrink-0" />
                      <span className="truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. My Life (Renamed from My Journey) */}
            <div className="space-y-0.5 pt-2 border-t border-neutral-200/60">
              <button
                onClick={() => setMyJourneyExpanded(!myJourneyExpanded)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs ${
                  myJourneyExpanded 
                    ? "bg-gradient-to-r from-amber-100/90 via-rose-100/70 to-purple-50 text-amber-950 border border-amber-200" 
                    : "bg-neutral-50/80 hover:bg-amber-50/60 text-neutral-800 hover:text-amber-900 border border-neutral-200/70"
                }`}
              >
                <Heart className={`w-4 h-4 shrink-0 ${myJourneyExpanded ? "text-rose-600" : "text-rose-500"}`} />
                <span className="font-sans tracking-tight">My Life</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 ${myJourneyExpanded ? "rotate-180 text-amber-700" : ""}`} />
              </button>

              {myJourneyExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-rose-200 space-y-2 py-1">
                  {/* My Life Section */}
                  <div className="space-y-1">
                    <div className="px-2 py-0.5 rounded-full bg-emerald-100/90 border border-emerald-200 text-[10px] font-extrabold text-emerald-950 uppercase tracking-wider inline-block">My Life</div>
                    {[
                      { id: "daily", label: "Daily", theme: "bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-500 hover:text-white" },
                      { id: "current_dasha", label: "Current Dasha", theme: "bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-600 hover:text-white" }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("my_page", sub.id);
                          setSidebarOpen(false);
                        }}
                        className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer w-full text-left border shadow-2xs ${
                          activeSubmenuPanel === sub.id
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold border-indigo-700"
                            : `${sub.theme}`
                        }`}
                      >
                        <Sparkles className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Journey Submenu List */}
                  <div className="space-y-1 pt-1">
                    <div className="px-2 py-0.5 rounded-full bg-blue-100/90 border border-blue-200 text-[10px] font-extrabold text-blue-950 uppercase tracking-wider inline-block">Journey</div>
                    {[
                      { id: "overview", label: "My Soul", theme: "bg-purple-50 text-purple-950 border-purple-200 hover:bg-purple-600 hover:text-white" },
                      { id: "predictions", label: "Predictions", theme: "bg-indigo-50 text-indigo-950 border-indigo-200 hover:bg-indigo-600 hover:text-white" },
                      { id: "future", label: "Future", theme: "bg-cyan-50 text-cyan-950 border-cyan-200 hover:bg-cyan-600 hover:text-white" },
                      { id: "my_life_analysis", label: "My Life Analysis", theme: "bg-rose-50 text-rose-950 border-rose-200 hover:bg-rose-600 hover:text-white" }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("my_page", sub.id);
                          setSidebarOpen(false);
                        }}
                        className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer w-full text-left border shadow-2xs ${
                          activeSubmenuPanel === sub.id
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold border-indigo-700"
                            : `${sub.theme}`
                        }`}
                      >
                        <Sparkles className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* My Astro Systems */}
                  <div className="space-y-1 pt-1">
                    <div className="px-2 py-0.5 rounded-full bg-violet-100/90 border border-violet-200 text-[10px] font-extrabold text-violet-950 uppercase tracking-wider inline-block">My Astro Systems</div>
                    {[
                      { id: "dasha", label: "Vimshottari", theme: "bg-indigo-50/80 text-indigo-950 border-indigo-200/80" },
                      { id: "charts", label: "Charts", theme: "bg-blue-50/80 text-blue-950 border-blue-200/80" },
                      { id: "vedic", label: "Vedic", theme: "bg-amber-50/80 text-amber-950 border-amber-200/80" },
                      { id: "transits_data", label: "Transits", theme: "bg-cyan-50/80 text-cyan-950 border-cyan-200/80" },
                      { id: "jaimini", label: "Jaimini", theme: "bg-purple-50/80 text-purple-950 border-purple-200/80" },
                      { id: "kp", label: "KP", theme: "bg-emerald-50/80 text-emerald-950 border-emerald-200/80" },
                      { id: "lalkitab", label: "Lalkitab", theme: "bg-rose-50/80 text-rose-950 border-rose-200/80" },
                      { id: "chinese", label: "Chinese", theme: "bg-teal-50/80 text-teal-950 border-teal-200/80" },
                      { id: "tajik", label: "Tajik", theme: "bg-fuchsia-50/80 text-fuchsia-950 border-fuchsia-200/80" },
                      { id: "western", label: "Western", theme: "bg-sky-50/80 text-sky-950 border-sky-200/80" }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("my_page", sub.id);
                          setSidebarOpen(false);
                        }}
                        className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer w-full text-left border shadow-2xs ${
                          activeSubmenuPanel === sub.id
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold border-indigo-700"
                            : `${sub.theme} hover:brightness-95`
                        }`}
                      >
                        <Sparkles className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. My Reports */}
            <div className="space-y-0.5 pt-2 border-t border-neutral-200/60">
              <button
                onClick={() => setMyReportsExpanded(!myReportsExpanded)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs ${
                  myReportsExpanded 
                    ? "bg-gradient-to-r from-teal-100/90 via-emerald-100/70 to-cyan-50 text-teal-950 border border-teal-200" 
                    : "bg-neutral-50/80 hover:bg-teal-50/60 text-neutral-800 hover:text-teal-900 border border-neutral-200/70"
                }`}
              >
                <FileText className={`w-4 h-4 shrink-0 ${myReportsExpanded ? "text-teal-600" : "text-teal-500"}`} />
                <span className="font-sans tracking-tight">My Reports</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 ${myReportsExpanded ? "rotate-180 text-teal-700" : ""}`} />
              </button>

              {myReportsExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-teal-200 space-y-1 py-1">
                  {[
                    { id: "reports_hub", label: "Reports Hub", theme: "bg-teal-50 text-teal-950 border-teal-200/80" },
                    { id: "my_life_analysis", label: "Life Analysis Report", theme: "bg-emerald-50 text-emerald-950 border-emerald-200/80" },
                    { id: "predictions", label: "Dasha & Predictions Report", theme: "bg-indigo-50 text-indigo-950 border-indigo-200/80" },
                    { id: "kp", label: "KP Horary & Event Report", theme: "bg-cyan-50 text-cyan-950 border-cyan-200/80" },
                    { id: "vedic", label: "Vedic Chart Summary", theme: "bg-amber-50 text-amber-950 border-amber-200/80" }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveSubmenuPanel(sub.id);
                        onNavigateMenu?.("my_page", sub.id);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer w-full text-left border shadow-2xs ${
                        activeSubmenuPanel === sub.id
                          ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold border-teal-700"
                          : `${sub.theme} hover:brightness-95`
                      }`}
                    >
                      <Sparkles className="w-3 h-3 shrink-0 opacity-80" />
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Footer (User details) */}
        <div className="p-3 border-t border-neutral-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-xs select-none border border-neutral-700">
              NJ
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-neutral-800">Nitin Jain</span>
              <span className="text-[10px] text-neutral-400 font-mono">Premium Account</span>
            </div>
          </div>
          <button className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-lg hover:bg-neutral-200/60 transition-colors cursor-pointer">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY FOR SIDEBAR */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      {/* 2. CENTER WORKSPACE (ChatGPT main screen - Pure White Background) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">

        {/* CONVERSATION AREA OR SUBMENU DETAILS PANEL */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 scrollbar-thin">
          <div className="max-w-4xl mx-auto space-y-6 w-full">
            
            {activeSubmenuPanel ? (
              <div className="space-y-6 w-full">
                <MyPageView
                  astrologyData={astrologyData}
                  activeUser={null}
                  isDark={false}
                  containerStyle="bg-white border-neutral-200"
                  cardStyle="bg-neutral-50 border-neutral-200"
                  textMuted="text-neutral-500"
                  activeSubmenuId={activeSubmenuPanel}
                  onSubmenuSelect={(id) => setActiveSubmenuPanel(id)}
                />
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6 w-full">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-6 min-h-[50vh] select-none rounded-2xl bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-pink-50/30 border border-indigo-200/80 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md mb-4">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent font-sans">
                      JHora AI Assistant
                    </h1>
                    <p className="text-neutral-700 text-xs max-w-md leading-relaxed font-medium mb-6">
                      Your intelligent Vedic & KP astrological assistant. Ask any question about your chart, dasha, transit trends, or remedies.
                    </p>

                    {/* Quick prompts grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left">
                      {quickPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => runAnalysis(p.query)}
                          className="p-3 rounded-xl bg-white/90 hover:bg-white border border-indigo-200/80 hover:border-indigo-400/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col gap-1"
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 group-hover:text-purple-700">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{p.title}</span>
                          </div>
                          <span className="text-[10px] text-neutral-600 line-clamp-2 leading-tight">
                            {p.query}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex gap-4 group">
                      
                      {/* Message Sender Icon/Avatar */}
                      {msg.sender === "assistant" ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md select-none">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-sm border border-slate-700">
                          NJ
                        </div>
                      )}

                      {/* Message Balloon */}
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-neutral-900">
                            {msg.sender === "user" ? "You" : "JHora AI Assistant"}
                          </span>
                          {msg.sender === "assistant" && (
                            <span className="bg-indigo-100 text-indigo-950 font-bold border border-indigo-200 px-2 py-0.5 rounded-full text-[10px]">
                              KP & Vedic Engine
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-400 font-mono ml-auto">
                            {msg.timestamp}
                          </span>
                        </div>

                        {/* Body Text */}
                        <div className="text-neutral-800 leading-relaxed text-sm select-text selection:bg-purple-100">
                          {msg.sender === "user" ? (
                            <p className="text-xs font-sans text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 rounded-2xl max-w-[90%] inline-block shadow-xs font-medium">
                              {msg.text}
                            </p>
                          ) : (
                            <div className="space-y-1 bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-white border-l-4 border-indigo-600 p-4 rounded-2xl border border-indigo-100/90 shadow-2xs">
                              {renderMarkdown(msg.text)}
                            </div>
                          )}
                        </div>



                        {/* Feedback Buttons underneath Assistant Message */}
                        {msg.sender === "assistant" && (
                          <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyToClipboard(msg.text, msg.id)}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                              title="Copy text"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => toggleLike(msg.id)}
                              className={`p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer ${
                                likedMessages[msg.id] ? "text-emerald-600" : "text-neutral-400 hover:text-neutral-700"
                              }`}
                              title="Good response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => toggleDislike(msg.id)}
                              className={`p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer ${
                                dislikedMessages[msg.id] ? "text-red-500" : "text-neutral-400 hover:text-neutral-700"
                              }`}
                              title="Bad response"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                alert("Serialized message trace compiled. Link exported to clipboard.");
                              }}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                              title="Share this response"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => runAnalysis(messages[messages.length - 2]?.text || "Re-evaluate natal chart context")}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                              title="Regenerate response"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                              title="More options"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  ))
                )}

                {/* Analysis Loading / Thinking State */}
                {analysisLoading && (
                  <div className="flex gap-4 mr-auto animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-[#5c4df2] flex items-center justify-center font-bold text-xs shrink-0 select-none">
                      <Sparkles className="w-4 h-4 text-[#5c4df2] animate-spin" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-800">JHora Astro AI</span>
                        <span className="text-[10px] text-neutral-400">Synthesizing...</span>
                      </div>
                      <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-2xl flex items-center gap-3">
                        <RefreshCw className="w-4 h-4 text-[#5c4df2] animate-spin shrink-0" />
                        <span className="text-xs text-neutral-600 font-mono animate-pulse">{currentStatusMsg}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

          </div>
        </div>

        {/* BOTTOM INPUT CONTAINER (Hidden on submenu pages) */}
        {!activeSubmenuPanel && (
          <div className="p-4 bg-white border-t border-neutral-100">
            <div className="max-w-2xl mx-auto space-y-2">
              
              {/* Quick action pills when input is empty and we already have some messages on screen */}
              {messages.length > 0 && !input.trim() && !analysisLoading && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-center">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => runAnalysis(p.query)}
                      className="px-3 py-1.5 text-[10px] font-medium text-neutral-600 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 rounded-full transition-all whitespace-nowrap cursor-pointer shrink-0"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Unified Input Bar (ChatGPT exact mockup - light theme) */}
              <form onSubmit={handleCustomSubmit} className="relative bg-neutral-50 rounded-3xl p-1 px-3 flex items-center gap-2 border border-neutral-200 focus-within:border-neutral-300 shadow-sm transition-all">
                <button
                  type="button"
                  onClick={() => {
                    alert("File attachment: Upload birth charts, horary JSON payloads, or customized transit data to ground the companion.");
                  }}
                  className="p-1.5 hover:bg-neutral-200/50 text-neutral-400 hover:text-neutral-600 rounded-full transition-colors cursor-pointer shrink-0"
                  title="Add attachment"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything"
                  disabled={analysisLoading}
                  className="flex-1 bg-transparent border-none outline-none py-2 text-xs text-neutral-800 placeholder-neutral-400 font-sans"
                />

                <button
                  type="button"
                  onClick={() => {
                    alert("Speech-to-Text: Speak directly to the Master AI Companion to record and synthesize your query.");
                  }}
                  className="p-1.5 hover:bg-neutral-200/50 text-neutral-400 hover:text-neutral-600 rounded-full transition-colors cursor-pointer shrink-0"
                  title="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={analysisLoading || !input.trim()}
                  className="bg-black hover:bg-neutral-800 disabled:bg-neutral-200 text-white disabled:text-neutral-400 rounded-full p-2 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  <ArrowUp className="w-4 h-4 stroke-[3]" />
                </button>
              </form>

              {/* Profile summary details bar below input */}
              <div className="flex items-center justify-center gap-2 overflow-x-auto text-[11px] font-sans text-neutral-600 whitespace-nowrap scrollbar-none pt-1 min-w-0">
                <span className="font-bold text-neutral-800 flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block shrink-0"></span>
                  {profileName}
                </span>
                <span className="text-neutral-300 shrink-0">|</span>
                <span className="shrink-0"><strong className="font-semibold text-neutral-500">DOB:</strong> {profileDob} @ {profileTob}</span>
                <span className="text-neutral-300 shrink-0">|</span>
                <span className="shrink-0"><strong className="font-semibold text-neutral-500">Place:</strong> {profilePob}</span>
                <span className="text-neutral-300 shrink-0">|</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60 font-mono text-[10px] font-medium shrink-0">
                  <strong>ANTARA:</strong> {antaraLord} <span className="opacity-40">|</span> <strong>PRANA:</strong> {pranaLord}
                </span>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
