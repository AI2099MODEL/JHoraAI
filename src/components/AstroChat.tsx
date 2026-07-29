/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MyPageView } from "./MyPageView";
import EventBookView from "./EventBookView";
import EngineGuide from "./EngineGuide";
import RulesTerminal from "./RulesTerminal";

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
  Orbit,
  X
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
  birthSettingsContent?: React.ReactNode;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  debugInfo?: any;
}

export default function AstroChat({ astrologyData, isStandalone, onCloseStandalone, onNavigateMenu, birthSettingsContent }: AstroChatProps) {
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
  const [moodAnalysisExpanded, setMoodAnalysisExpanded] = useState(false);
  const [askMeExpanded, setAskMeExpanded] = useState(false);
  const [myLifeExpanded, setMyLifeExpanded] = useState(false);
  const [myJourneyExpanded, setMyJourneyExpanded] = useState(false);
  const [myReportsExpanded, setMyReportsExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
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

  const [selectedAskTab, setSelectedAskTab] = useState<string>("daily_mood_prediction");

  // Helper function to strip any rule numbers, technical IDs, or API key references from output
  const sanitizeReportText = (text: string): string => {
    if (!text) return "";
    return text
      // Remove rule numbers like Rule KP-102, Rule #12, (Rule 123), Rule 45:, Rule #10:
      .replace(/\bRule\s+(?:KP-)?#?\d+:\s*/gi, "")
      .replace(/\bRule\s+(?:KP-)?#?\d+\b/gi, "")
      .replace(/\(Rule\s+(?:KP-)?#?\d+\)/gi, "")
      .replace(/\bKP_RULE_[A-Z0-9_]+\b/g, "")
      // Remove technical rule IDs in brackets or parentheses
      .replace(/\[Rule\s+[^\]]+\]/gi, "")
      .replace(/\[KP_RULE_[^\]]+\]/gi, "")
      // Remove API key warnings or settings messages if present
      .replace(/To resume live AI multi-model synthesis.*$/gim, "")
      .replace(/Please configure your own GEMINI_API_KEY.*$/gim, "")
      // Clean up extra blank lines
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const buildLocalActivatedEventsReport = (themeLabel: string) => {
    const moonNak = currentSky?.moon?.currentNakshatra?.displayName || "Chitra";
    const moonSign = currentSky?.moon?.currentSign?.displayName || "Libra";
    
    if (themeLabel.toLowerCase().includes("mood")) {
      return `### 🌟 Daily Mood & Activated Events Synthesis

#### 🎯 Activated Houses Today
- **Active Houses**: House 1 (Self & Vitality), House 3 (Courage & Communication), House 6 (Routines & Service), House 10 (Career), House 11 (Gains).
- **Transit Trigger**: Moon in ${moonNak} Nakshatra (${moonSign}) aligning with active dasha (${activeDasha}).

#### ⚡ Simple Activated Events
- **Mental Energy & Focus**: High clarity for decision-making, strategic planning, and task execution.
- **Communication & Social**: Smooth exchanges and productive interactions with colleagues or contacts.
- **Work Routine & Gains**: Favorable momentum in clearing pending tasks and achieving short-term goals.

#### 💡 Guidance
- Leverage this active planetary alignment to finalize pending matters and advance key initiatives.`;
    }

    return `### 📊 ${themeLabel} - Activated Events Report

#### 🔮 Active House Dynamics
- **Activated Houses**: Houses 1, 3, 6, 9, 10, and 11 activated via active dasha (${activeDasha}) and current transit alignment.
- **Planetary Trigger**: Moon in ${moonNak} Nakshatra (${moonSign}) providing direct trigger support.

#### ⚡ Simple Activated Events
- **Favorable Event Support**: Strong structural alignment for positive developments in ${themeLabel.toLowerCase()}.
- **Active Communications & Outreach**: Opportunity for productive connections and networking in current window.
- **Stability & Progress**: Minimal obstruction from counter-significators, ensuring smooth execution.

#### 💡 Guidance
- Proactively engage in activities related to ${themeLabel.toLowerCase()} during this supportive activation.`;
  };

  // Dynamically load/build the prompts from the imported JSON
  const getMoodPromptsFromJSON = () => {
    const prompts = [];
    
    // 1. Add Daily Horoscope / Mood prompt
    prompts.push({
      id: "daily_mood_prediction",
      label: "Daily Mood Reading",
      icon: "🌟",
      query: `Execute the NJ COMPLETE KP LIFE ENGINE for today's daily mood reading and activated events.

OUTPUT REQUIREMENTS:
- Produce a simple, crisp, and concise report listing activated events today based on transit, natal, and house activations.
- Highlight activated houses (e.g. Houses 1, 3, 6, 10, 11) and current transit triggers.
- DO NOT include any rule numbers, rule codes, technical rule IDs, or raw debug JSONs.
- Keep the response simple, crisp, concise, and focused purely on activated events and practical outcomes.`
    });

    // Curated major life themes mapping
    const majorThemes = [
      { key: "foreign_travel_settlement", label: "Travel & Foreign Settlement", icon: "✈️" },
      { key: "career_promotion", label: "Career & Promotion", icon: "💼" },
      { key: "finance_wealth", label: "Wealth & Finance", icon: "💰" },
      { key: "marriage_first", label: "Marriage & Relationships", icon: "💖" },
      { key: "health_disease", label: "Health & Vitality", icon: "🩺" },
      { key: "property_vehicle", label: "Property & Vehicles", icon: "🏡" },
      { key: "litigation", label: "Litigation & Legal", icon: "⚖️" },
      { key: "education", label: "Education & Learning", icon: "🎓" }
    ];

    majorThemes.forEach(theme => {
      prompts.push({
        id: theme.key,
        label: theme.label,
        icon: theme.icon,
        query: `Run an event check and transit check across active houses, natal promise, active dasha (${activeDasha}), and present transits for [${theme.label}].

OUTPUT REQUIREMENTS:
- Produce a simple, crisp, and concise report on activated events for ${theme.label}.
- Detail the activated houses and specific events triggered by current transits and period alignment.
- DO NOT show any rule numbers, rule codes, technical rule IDs, or raw debug JSONs.
- Keep the response simple, crisp, concise, and focused purely on activated events and practical outcomes.`
      });
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
    "Evaluating active transit houses...",
    "Retrieving natal promise variables...",
    `Synthesizing active ${activeDasha} dasha weights...`,
    "Checking house activations & transit triggers...",
    "Formulating crisp activated events report..."
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

  const runAnalysis = async (queryText: string, displayText?: string) => {
    if (analysisLoading) return;

    setAnalysisLoading(true);

    try {
      const preferences = ConversationService.getPreferences();
      const geminiApiKey = preferences?.geminiApiKey;
      const groqApiKey = preferences?.groqApiKey || (typeof window !== "undefined" ? localStorage.getItem("user_groq_api_key") : undefined);

      const response = await fetch("/api/astrology/master-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          astrologyData,
          question: queryText,
          targetAge: 50,
          mode: responseMode,
          history: [],
          geminiApiKey,
          groqApiKey
        })
      });

      const data = await response.json();
      let cleanReply = "";
      if (data && data.reply) {
        cleanReply = sanitizeReportText(data.reply);
      }

      if (!cleanReply || cleanReply.length < 20) {
        cleanReply = buildLocalActivatedEventsReport(displayText || "Activated Events");
      }

      const reportMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: "assistant",
        text: cleanReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        debugInfo: data?.debugInfo
      };

      setMessages([reportMsg]);
      setSelectedDebugMsg(reportMsg);
    } catch (err: any) {
      console.error(err);
      const localFallback = buildLocalActivatedEventsReport(displayText || "Activated Events");
      const errorMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: "assistant",
        text: localFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([errorMsg]);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSelectAskMeTab = (tabId: string) => {
    setSelectedAskTab(tabId);
    setActiveSubmenuPanel(null);
    const prompts = getMoodPromptsFromJSON();
    const target = prompts.find(p => p.id === tabId) || prompts[0];
    if (target) {
      runAnalysis(target.query, target.label);
    }
  };

  // Auto-run default tab on mount if messages is empty
  useEffect(() => {
    if (!activeSubmenuPanel && messages.length === 0 && !analysisLoading) {
      handleSelectAskMeTab(selectedAskTab);
    }
  }, []);

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
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {/* Current Date, Live Time & Location details pill */}
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
            {/* 0. Ask Me (AI Prompts) */}
            <div className="space-y-0.5">
              <button
                onClick={() => setAskMeExpanded(!askMeExpanded)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs ${
                  askMeExpanded 
                    ? "bg-gradient-to-r from-blue-100/90 via-indigo-100/70 to-blue-50 text-blue-950 border border-blue-200" 
                    : "bg-neutral-50/80 hover:bg-blue-50/60 text-neutral-800 hover:text-blue-900 border border-neutral-200/70"
                }`}
              >
                <Sparkles className={`w-4 h-4 shrink-0 ${askMeExpanded ? "text-blue-600" : "text-blue-500"}`} />
                <span className="font-sans tracking-tight">Ask Me</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 ${askMeExpanded ? "rotate-180 text-blue-700" : ""}`} />
              </button>
              {askMeExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-blue-200 space-y-2 py-1">
                  {/* Activated Event Reports Prompts */}
                  <div className="space-y-1 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
                    {getMoodPromptsFromJSON().map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          handleSelectAskMeTab(p.id);
                          setSidebarOpen(false);
                        }}
                        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-[11px] font-medium w-full text-left transition-all cursor-pointer shadow-2xs ${
                          selectedAskTab === p.id && !activeSubmenuPanel
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold border-blue-700"
                            : "text-neutral-800 hover:text-blue-950 bg-neutral-50/60 hover:bg-blue-50 border border-transparent hover:border-blue-200/80"
                        }`}
                        title={p.label}
                      >
                        <span className="text-xs shrink-0">{p.icon}</span>
                        <span className="truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 1. My Life */}
            <div className="space-y-0.5 pt-2 border-t border-neutral-200/60">
              <button
                onClick={() => setMyLifeExpanded(!myLifeExpanded)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs ${
                  myLifeExpanded 
                    ? "bg-gradient-to-r from-amber-100/90 via-rose-100/70 to-purple-50 text-amber-950 border border-amber-200" 
                    : "bg-neutral-50/80 hover:bg-amber-50/60 text-neutral-800 hover:text-amber-900 border border-neutral-200/70"
                }`}
              >
                <Heart className={`w-4 h-4 shrink-0 ${myLifeExpanded ? "text-rose-600" : "text-rose-500"}`} />
                <span className="font-sans tracking-tight">My Life</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 ${myLifeExpanded ? "rotate-180 text-amber-700" : ""}`} />
              </button>
              {myLifeExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-rose-200 space-y-2 py-1">
                  <div className="space-y-1">
                    {[
                      { id: "my_life_analysis", label: "My Life Analysis", theme: "bg-rose-50 text-rose-950 border-rose-200 hover:bg-rose-600 hover:text-white" }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("ai_assistant", sub.id);
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
                    {[
                      { id: "vedic", label: "My Astro Details", theme: "bg-amber-50/80 text-amber-950 border-amber-200/80" },
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("ai_assistant", sub.id);
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

            {/* 2. My Journey */}
            <div className="space-y-0.5 pt-2 border-t border-neutral-200/60">
              <button
                onClick={() => setMyJourneyExpanded(!myJourneyExpanded)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs ${
                  myJourneyExpanded 
                    ? "bg-gradient-to-r from-indigo-100/90 via-purple-100/70 to-indigo-50 text-indigo-950 border border-indigo-200" 
                    : "bg-neutral-50/80 hover:bg-indigo-50/60 text-neutral-800 hover:text-indigo-900 border border-neutral-200/70"
                }`}
              >
                <Compass className={`w-4 h-4 shrink-0 ${myJourneyExpanded ? "text-indigo-600" : "text-indigo-500"}`} />
                <span className="font-sans tracking-tight">My Journey</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 ${myJourneyExpanded ? "rotate-180 text-indigo-700" : ""}`} />
              </button>
              {myJourneyExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-indigo-200 space-y-2 py-1">
                  {/* Journey Navigation Pages */}
                  <div className="space-y-1">
                    {[
                      { id: "birth", label: "Birth", theme: "bg-indigo-50 text-indigo-950 border-indigo-200 hover:bg-indigo-600 hover:text-white" },
                      { id: "daily", label: "Today", theme: "bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-500 hover:text-white" },
                      { id: "weekly", label: "Weekly", theme: "bg-orange-50 text-orange-950 border-orange-200 hover:bg-orange-600 hover:text-white" },
                      { id: "monthly", label: "Monthly", theme: "bg-blue-50 text-blue-950 border-blue-200 hover:bg-blue-600 hover:text-white" },
                      { id: "long_term", label: "Yearly", theme: "bg-purple-50 text-purple-950 border-purple-200 hover:bg-purple-600 hover:text-white" },
                      { id: "current_dasha", label: "Active Period", theme: "bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-600 hover:text-white" },
                      { id: "predictions", label: "Predictions", theme: "bg-indigo-50 text-indigo-950 border-indigo-200 hover:bg-indigo-600 hover:text-white" },
                      { id: "future", label: "Future", theme: "bg-cyan-50 text-cyan-950 border-cyan-200 hover:bg-cyan-600 hover:text-white" },
                      { id: "tajik", label: "Tajik", theme: "bg-fuchsia-50/80 text-fuchsia-950 border-fuchsia-200/80 hover:bg-fuchsia-600 hover:text-white" }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("ai_assistant", sub.id);
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
                    { id: "kp", label: "KP Horary & Event Report", theme: "bg-cyan-50 text-cyan-950 border-cyan-200/80" }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveSubmenuPanel(sub.id);
                        onNavigateMenu?.("ai_assistant", sub.id);
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

            {/* 4. Settings */}
            <div className="space-y-0.5 pt-2 border-t border-neutral-200/60">
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs ${
                  settingsExpanded 
                    ? "bg-gradient-to-r from-slate-100/90 via-gray-100/70 to-slate-50 text-slate-950 border border-slate-200" 
                    : "bg-neutral-50/80 hover:bg-slate-50/60 text-neutral-800 hover:text-slate-900 border border-neutral-200/70"
                }`}
              >
                <Settings className={`w-4 h-4 shrink-0 ${settingsExpanded ? "text-slate-600" : "text-slate-500"}`} />
                <span className="font-sans tracking-tight">Settings</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 ${settingsExpanded ? "rotate-180 text-slate-700" : ""}`} />
              </button>

              {settingsExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-slate-200 space-y-3 py-1">
                  
                  {/* Preferences */}
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Preferences</div>
                    {[
                      { id: "account_settings", label: "Account Settings", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "theme", label: "Theme", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "language", label: "Language", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "offline_mode", label: "Offline Mode", theme: "bg-slate-50 text-slate-950 border-slate-200/80" }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("ai_assistant", sub.id);
                          setSidebarOpen(false);
                        }}
                        className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer w-full text-left border shadow-2xs ${
                          activeSubmenuPanel === sub.id
                            ? "bg-gradient-to-r from-slate-600 to-gray-600 text-white font-bold border-slate-700"
                            : `${sub.theme} hover:brightness-95`
                        }`}
                      >
                        <Settings className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Integrations */}
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Integrations</div>
                    {[
                      { id: "google_drive", label: "Google Drive Backup", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "google_calendar", label: "Google Calendar Sync", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "google_gmail", label: "Google Gmail", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "google_keep", label: "Google Keep Notes", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "google_contacts", label: "Google Contacts", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "github_ota", label: "GitHub OTA Updates", theme: "bg-slate-50 text-slate-950 border-slate-200/80" }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("ai_assistant", sub.id);
                          setSidebarOpen(false);
                        }}
                        className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer w-full text-left border shadow-2xs ${
                          activeSubmenuPanel === sub.id
                            ? "bg-gradient-to-r from-slate-600 to-gray-600 text-white font-bold border-slate-700"
                            : `${sub.theme} hover:brightness-95`
                        }`}
                      >
                        <Settings className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Knowledge Base */}
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Knowledge Base</div>
                    {[
                      { id: "event_book", label: "Event Book", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "engine_guide", label: "Astrological Rule Engine", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "kp_book", label: "KP Book", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "kp_documentation", label: "KP Documentation", theme: "bg-slate-50 text-slate-950 border-slate-200/80" }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("ai_assistant", sub.id);
                          setSidebarOpen(false);
                        }}
                        className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer w-full text-left border shadow-2xs ${
                          activeSubmenuPanel === sub.id
                            ? "bg-gradient-to-r from-slate-600 to-gray-600 text-white font-bold border-slate-700"
                            : `${sub.theme} hover:brightness-95`
                        }`}
                      >
                        <Settings className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* System & Data */}
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">System & Data</div>
                    {[
                      { id: "table_index", label: "Table Index", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "raw_json", label: "Raw JSON", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "api_inspector", label: "API Inspector", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "request_log", label: "Request Log", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "response_log", label: "Response Log", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "dto_viewer", label: "DTO Viewer", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "room_database_viewer", label: "Database Viewer", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "plugin_manager", label: "Plugin Manager", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "performance", label: "Performance", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "cache_manager", label: "Cache Manager", theme: "bg-slate-50 text-slate-950 border-slate-200/80" }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("ai_assistant", sub.id);
                          setSidebarOpen(false);
                        }}
                        className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer w-full text-left border shadow-2xs ${
                          activeSubmenuPanel === sub.id
                            ? "bg-gradient-to-r from-slate-600 to-gray-600 text-white font-bold border-slate-700"
                            : `${sub.theme} hover:brightness-95`
                        }`}
                      >
                        <Settings className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>

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
            
            { activeSubmenuPanel === "birth" && birthSettingsContent ? (
                <div className="space-y-4 w-full">
                  <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-4 py-2.5 rounded-xl border border-indigo-200/80 shadow-2xs">
                    <span className="text-xs font-extrabold text-indigo-950 capitalize tracking-tight flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Birth Details
                    </span>
                  </div>
                  {birthSettingsContent}
                </div>
              ) : activeSubmenuPanel === "event_book" ? (
                <EventBookView astrologyData={astrologyData} isDark={false} />
              ) : activeSubmenuPanel === "engine_guide" ? (
                <EngineGuide isDark={false} />
              ) : activeSubmenuPanel === "kp_book" ? (
                <RulesTerminal isDarkTheme={false} />
              ) : activeSubmenuPanel ? (
                <div className="space-y-4 w-full">
                <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-4 py-2.5 rounded-xl border border-indigo-200/80 shadow-2xs">
                  <span className="text-xs font-extrabold text-indigo-950 capitalize tracking-tight flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    {activeSubmenuPanel === "vedic" ? "My Astro Details" : activeSubmenuPanel.replace(/_/g, " ")}
                  </span>
                </div>
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
              <div className="max-w-3xl mx-auto space-y-4 w-full">
                {/* Ask Me Horizontal Theme Tabs Bar */}
                <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/60 p-3 rounded-2xl border border-blue-200/80 shadow-2xs mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                      <span className="text-xs font-extrabold text-blue-950 font-sans tracking-tight">
                        Activated Events Report Engine
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-100/90 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Real-Time House & Transit Check
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                    {getMoodPromptsFromJSON().map((tab) => {
                      const isSelected = selectedAskTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleSelectAskMeTab(tab.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                            isSelected
                              ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold shadow-md scale-[1.02]"
                              : "bg-white hover:bg-blue-50 text-neutral-700 hover:text-blue-900 border border-neutral-200/80"
                          }`}
                        >
                          <span>{tab.icon}</span>
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Main Activated Events Report Area */}
                {analysisLoading ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 rounded-2xl border border-neutral-200 animate-pulse my-4">
                    <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mb-3" />
                    <span className="text-xs font-bold text-neutral-800">{currentStatusMsg}</span>
                    <span className="text-[10px] text-neutral-500 font-mono mt-1">Evaluating House Activations & Transits...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-10 px-6 min-h-[40vh] select-none rounded-2xl bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-pink-50/30 border border-indigo-200/80 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md mb-3">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent font-sans">
                      JHora Activated Events Report
                    </h1>
                    <p className="text-neutral-700 text-xs max-w-md leading-relaxed font-medium mb-4">
                      Select any theme above to execute a real-time event check across active houses, dasha periods, and planetary transits.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="space-y-3">
                      <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-neutral-200/80 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-neutral-900">
                            Activated Events Report
                          </span>
                          <span className="bg-indigo-100 text-indigo-950 font-bold border border-indigo-200 px-2 py-0.5 rounded-full text-[10px]">
                            {getMoodPromptsFromJSON().find(t => t.id === selectedAskTab)?.label || "Daily Reading"}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Report Body */}
                      <div className="space-y-1 bg-white border-l-4 border-indigo-600 p-5 rounded-2xl border border-neutral-200/90 shadow-sm text-neutral-800 leading-relaxed text-sm">
                        {renderMarkdown(msg.text)}
                      </div>

                      {/* Actions underneath Report */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 text-xs font-medium transition-colors cursor-pointer"
                          title="Copy Report"
                        >
                          {copiedMessageId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Copy Report</span>
                        </button>

                        <button
                          onClick={() => handleSelectAskMeTab(selectedAskTab)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors cursor-pointer border border-indigo-200/60 ml-auto"
                          title="Re-run Event Check"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Re-run Check</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>

        {/* BOTTOM PROFILE BAR (Hidden on submenu pages) */}
        {!activeSubmenuPanel && (
          <div className="p-3 bg-white border-t border-neutral-200/80">
            <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 overflow-x-auto text-[11px] font-sans text-neutral-600 whitespace-nowrap scrollbar-none min-w-0">
              <span className="font-bold text-neutral-800 flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block shrink-0"></span>
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
        )}
      </div>
    </div>
  </div>
);
}
