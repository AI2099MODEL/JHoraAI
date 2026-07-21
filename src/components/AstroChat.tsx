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
  Compass,
  Briefcase
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
  // Sidebar open/close state on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Collapsible right panel state
  const [activeRightTab, setActiveRightTab] = useState<"trace" | "technical" | "charts" | "reports" | null>(null);

  // Active profile / conversation ID
  const [activeConversationId, setActiveConversationId] = useState("jh-api");

  // Chat message history
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: `### Charts
### Technical details
### Trace
### Reports

## AI Companion (Conversation)
* **Chat history**
* **Compact header (DBA + Moon only)**
* **ChatGPT-style input**
* **Suggested prompts**
* **Structured answers**
* **Nothing else**

The AI Companion should feel like **ChatGPT for astrology**, not a dashboard with a chat box embedded in it. That single design decision will make the interface dramatically cleaner, reduce cognitive load, and make conversations the primary experience rather than an afterthought.`,
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
  const [likedMessages, setLikedMessages] = useState<Record<string, boolean>>({});
  const [dislikedMessages, setDislikedMessages] = useState<Record<string, boolean>>({});
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
      title: "Dasha Roadmap & Remedies",
      query: "Detail my active Saturn-Mercury-Rahu Vimshottari roadmap. What are the key directives, upcoming turning points, and immediate practical remedies for my life right now?"
    }
  ];

  // Custom rich renderer for welcome block & lists
  const renderMarkdown = (text: string, isWelcome: boolean = false) => {
    // If it's the welcome message, let's extract the header bullets to render as high-fidelity interactive buttons
    if (isWelcome) {
      const lines = text.split("\n");
      const bullets = lines.filter(l => l.startsWith("### "));
      const contentLines = lines.filter(l => !l.startsWith("### "));

      return (
        <div className="space-y-4">
          {/* INTERACTIVE COMPANION TAB NAVIGATION */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2">
            {[
              { id: "charts", label: "Charts", icon: Compass, color: "hover:border-amber-500/40 text-amber-300 hover:text-amber-200" },
              { id: "technical", label: "Technical details", icon: Cpu, color: "hover:border-indigo-500/40 text-indigo-300 hover:text-indigo-200" },
              { id: "trace", label: "Trace", icon: Activity, color: "hover:border-emerald-500/40 text-emerald-300 hover:text-emerald-200" },
              { id: "reports", label: "Reports", icon: FileText, color: "hover:border-[#5c4df2]/40 text-purple-300 hover:text-purple-200" }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeRightTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveRightTab(activeRightTab === tab.id ? null : (tab.id as any))}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
                    isActive 
                      ? "bg-slate-800/80 border-[#5c4df2]/60 text-white shadow-lg ring-1 ring-[#5c4df2]/30" 
                      : "bg-[#2f2f2f]/40 border-neutral-800 text-slate-300 " + tab.color
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#938bf8]" : ""}`} />
                  <span className="font-sans text-[11px] font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {contentLines.map((line, idx) => {
              if (line.startsWith("## ")) {
                return (
                  <h2 key={idx} className="text-sm font-bold text-slate-100 tracking-tight font-sans mt-4 mb-2">
                    {line.replace("## ", "")}
                  </h2>
                );
              }
              if (line.startsWith("* ") || line.startsWith("- ")) {
                const cleanLine = line.replace(/^[*+-]\s+/, "");
                const bolded = cleanLine.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-medium'>$1</strong>");
                return (
                  <li key={idx} className="ml-4 list-disc text-neutral-300 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: bolded }} />
                );
              }
              const bolded = line.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-medium'>$1</strong>");
              return (
                <p key={idx} className="text-xs leading-relaxed text-neutral-300" dangerouslySetInnerHTML={{ __html: bolded }} />
              );
            })}
          </div>
        </div>
      );
    }

    // Normal markdown renderer
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-xs font-bold text-amber-200 mt-3 mb-1.5 uppercase font-mono tracking-wider">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-sm font-bold text-slate-100 mt-4 mb-2 border-b border-[#2f2f2f] pb-1 font-sans">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={idx} className="text-base font-bold text-slate-50 mt-5 mb-2 font-sans tracking-tight">{line.replace("# ", "")}</h2>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const cleanLine = line.replace(/^[-*]\s+/, "");
        const bolded = cleanLine.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-medium'>$1</strong>");
        return (
          <li key={idx} className="ml-4 list-disc text-neutral-300 text-xs mb-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: bolded }} />
        );
      }
      const bolded = line.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-medium'>$1</strong>");
      return (
        <p key={idx} className="mb-2 leading-relaxed text-neutral-300 text-xs" dangerouslySetInnerHTML={{ __html: bolded }} />
      );
    });
  };

  const activeDebugInfo = selectedDebugMsg?.debugInfo || messages[messages.length - 1]?.debugInfo;

  return (
    <div className="w-full h-[calc(100vh-140px)] min-h-[580px] bg-[#212121] text-[#ececec] flex overflow-hidden rounded-2xl border border-neutral-800 shadow-2xl relative font-sans">
      
      {/* 1. LEFT SIDEBAR (ChatGPT-style Navigation) */}
      <div className={`fixed lg:relative inset-y-0 left-0 w-[260px] bg-[#171717] border-r border-neutral-800 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        {/* Sidebar Header */}
        <div className="p-3.5 flex items-center justify-between border-b border-neutral-800/40">
          <button 
            onClick={() => {
              setMessages([messages[0]]);
              setSelectedDebugMsg(null);
            }}
            className="flex items-center gap-2 hover:bg-[#212121] px-3 py-2 rounded-lg text-sm font-medium w-full text-left text-slate-100 transition-colors group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
            <span className="font-semibold text-xs">New Astrology Chat</span>
            <Plus className="w-4 h-4 ml-auto text-slate-400 group-hover:text-slate-100" />
          </button>
        </div>

        {/* Search input inside sidebar */}
        <div className="px-3.5 py-2">
          <div className="flex items-center gap-2 bg-[#212121] px-3 py-1.5 rounded-lg border border-neutral-800">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search chat history..." 
              className="bg-transparent text-[11px] placeholder-neutral-500 outline-none w-full text-slate-200"
            />
          </div>
        </div>

        {/* Sidebar Navigation Entries */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin">
          
          {/* Main List */}
          <div className="space-y-0.5">
            {[
              { id: "nitin-life", label: "Nitin Life", type: "folder" },
              { id: "ananya-life", label: "Ananya Life", type: "folder" },
              { id: "market-help", label: "Indian Markets Trading Help", type: "chat" },
              { id: "jh-api", label: "Jagannatha Hora API", type: "chat" }
            ].map((item) => {
              const isActive = activeConversationId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveConversationId(item.id);
                    if (item.id === "jh-api") {
                      // restore welcome
                    } else {
                      // Mock query activation
                      setInput(`Analyzing ${item.label} astrology parameters...`);
                    }
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium w-full text-left transition-colors cursor-pointer ${
                    isActive 
                      ? "bg-[#212121] text-slate-100 border border-neutral-800" 
                      : "text-neutral-400 hover:text-slate-200 hover:bg-[#212121]/40"
                  }`}
                >
                  {item.type === "folder" ? (
                    <Folder className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-500" : "text-neutral-500"}`} />
                  ) : (
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-[#938bf8]" : "text-neutral-500"}`} />
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Projects Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Projects</div>
            <div className="space-y-0.5">
              {[
                { id: "daily-tasks", label: "Daily Tasks" },
                { id: "ananya-fees", label: "Ananya fees" },
                { id: "anushka-studies", label: "Anushka studies" },
                { id: "anushka-jain", label: "Anushka Jain" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setInput(`Review project timeline for ${item.label}...`);
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-slate-200 hover:bg-[#212121]/40 w-full text-left cursor-pointer"
                >
                  <Folder className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chats Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Chats</div>
            <div className="space-y-0.5">
              {[
                { id: "github-prs", label: "GitHub PRs and Issues" },
                { id: "dasha-seq", label: "Dasha Sequence Interpretation" },
                { id: "calc-req", label: "Total Calculation Request" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setInput(`Investigate query regarding: ${item.label}`);
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-slate-200 hover:bg-[#212121]/40 w-full text-left cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar Footer (User details) */}
        <div className="p-3 border-t border-neutral-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs select-none border border-neutral-700">
              NJ
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-100">Nitin Jain</span>
              <span className="text-[10px] text-neutral-500 font-mono">Premium Account</span>
            </div>
          </div>
          <button className="p-1.5 text-neutral-400 hover:text-slate-100 rounded-lg hover:bg-[#212121] transition-colors cursor-pointer">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY FOR SIDEBAR */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
        />
      )}

      {/* 2. CENTER WORKSPACE (ChatGPT main screen) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#212121]">
        
        {/* TOP COMPACT HEADER */}
        <div className="h-14 border-b border-neutral-800/40 px-4 flex items-center justify-between bg-[#212121]">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle button (Mobile only) */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-[#2f2f2f] lg:hidden text-neutral-400 hover:text-slate-100 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Model Dropdown Selection */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#2f2f2f] text-sm font-semibold text-slate-200 transition-colors text-left cursor-pointer">
                <span>JHora AI (Vedic Companion)</span>
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* COMPACT ASTRO SNAPSHOT IN HEADER (DBA + MOON ONLY) */}
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-neutral-800 text-[10px] font-mono text-neutral-400">
              <div className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-amber-500/80" />
                <span className="text-neutral-300 font-semibold">DBA: Saturn-Mercury-Rahu</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-neutral-300 font-semibold">Moon: Libra ({currentSky?.moon?.currentNakshatra?.displayName || "Chitra"})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Response Mode Quick Switch */}
            <div className="hidden sm:flex items-center bg-[#171717] border border-neutral-800 p-0.5 rounded-lg text-[10px]">
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
              onClick={() => {
                alert("Share Link: Astrological conversation state serialized securely. Ready to share with your personal circle!");
              }}
              className="flex items-center gap-1.5 border border-neutral-800 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:bg-[#2f2f2f] transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={clearChat}
              title="Reset Conversation"
              className="p-2 rounded-full border border-neutral-800 bg-transparent hover:bg-red-950/20 text-neutral-400 hover:text-red-400 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MOBILE SUB-HEADER FOR ASTRO METRICS */}
        <div className="flex md:hidden items-center justify-between px-4 py-1.5 bg-[#171717] border-b border-neutral-800/40 text-[9px] font-mono text-neutral-400">
          <span>DBA: Sat-Mer-Rah</span>
          <span>Moon: Libra ({currentSky?.moon?.currentNakshatra?.displayName || "Chitra"})</span>
        </div>

        {/* CONVERSATION AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 scrollbar-thin">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-4 group">
                
                {/* Message Sender Icon/Avatar */}
                {msg.sender === "assistant" ? (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0 shadow-lg select-none">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#5c4df2]/25 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none border border-[#5c4df2]/20">
                    NJ
                  </div>
                )}

                {/* Message Balloon */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">
                      {msg.sender === "user" ? "You" : "JHora Astro AI"}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Body Text */}
                  <div className="text-neutral-300 leading-relaxed text-sm select-text selection:bg-[#5c4df2]/30">
                    {msg.sender === "user" ? (
                      <p className="text-xs font-sans text-slate-200 bg-[#2f2f2f] px-4 py-2.5 rounded-2xl max-w-[90%] inline-block">
                        {msg.text}
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {renderMarkdown(msg.text, msg.id === "welcome")}
                      </div>
                    )}
                  </div>

                  {/* Traceability Indicator Tag */}
                  {msg.sender === "assistant" && msg.debugInfo && (
                    <button 
                      onClick={() => {
                        setSelectedDebugMsg(msg);
                        setActiveRightTab("trace");
                      }}
                      className="mt-2.5 py-1 px-2.5 bg-[#2f2f2f]/30 border border-neutral-800 rounded-lg flex items-center gap-2 text-[10px] text-neutral-400 font-mono hover:bg-[#2f2f2f] transition-all cursor-pointer"
                    >
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Trace: {msg.debugInfo.knowledgeBookVersion || "v2.0.1"} • {msg.debugInfo.matchedRules?.length || 0} Rules Verified</span>
                      <ChevronRight className="w-3 h-3 ml-1 text-neutral-500" />
                    </button>
                  )}

                  {/* Feedback Buttons underneath Assistant Message */}
                  {msg.sender === "assistant" && (
                    <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="p-1.5 rounded-lg hover:bg-[#2f2f2f] text-neutral-500 hover:text-slate-100 transition-colors cursor-pointer"
                        title="Copy text"
                      >
                        {copiedMessageId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => toggleLike(msg.id)}
                        className={`p-1.5 rounded-lg hover:bg-[#2f2f2f] transition-colors cursor-pointer ${
                          likedMessages[msg.id] ? "text-emerald-400" : "text-neutral-500 hover:text-slate-100"
                        }`}
                        title="Good response"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleDislike(msg.id)}
                        className={`p-1.5 rounded-lg hover:bg-[#2f2f2f] transition-colors cursor-pointer ${
                          dislikedMessages[msg.id] ? "text-red-400" : "text-neutral-500 hover:text-slate-100"
                        }`}
                        title="Bad response"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          alert("Serialized message trace compiled. Link exported to clipboard.");
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#2f2f2f] text-neutral-500 hover:text-slate-100 transition-colors cursor-pointer"
                        title="Share this response"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => runAnalysis(messages[messages.length - 2]?.text || "Re-evaluate natal chart context")}
                        className="p-1.5 rounded-lg hover:bg-[#2f2f2f] text-neutral-500 hover:text-slate-100 transition-colors cursor-pointer animate-hover"
                        title="Regenerate response"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        className="p-1.5 rounded-lg hover:bg-[#2f2f2f] text-neutral-500 hover:text-slate-100 transition-colors cursor-pointer"
                        title="More options"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              </div>
            ))}

            {/* Analysis Loading / Thinking State */}
            {analysisLoading && (
              <div className="flex gap-4 mr-auto animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/10 text-amber-500/50 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">JHora Astro AI</span>
                    <span className="text-[10px] text-neutral-500">Synthesizing...</span>
                  </div>
                  <div className="bg-[#171717] border border-neutral-800 p-3 rounded-2xl flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-[#5c4df2] animate-spin shrink-0" />
                    <span className="text-xs text-neutral-400 font-mono animate-pulse">{currentStatusMsg}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* BOTTOM INPUT CONTAINER */}
        <div className="p-4 bg-[#212121]">
          <div className="max-w-2xl mx-auto space-y-2">
            
            {/* Quick action pills when input is empty */}
            {!input.trim() && !analysisLoading && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-center">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => runAnalysis(p.query)}
                    className="px-3 py-1.5 text-[10px] font-medium text-neutral-300 bg-[#2f2f2f]/60 hover:bg-[#2f2f2f] border border-neutral-800 hover:border-neutral-700 rounded-full transition-all whitespace-nowrap cursor-pointer shrink-0"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            )}

            {/* Unified Input Bar (ChatGPT exact mockup) */}
            <form onSubmit={handleCustomSubmit} className="relative bg-[#2f2f2f] rounded-3xl p-1 px-3 flex items-center gap-2 border border-neutral-800 focus-within:border-neutral-700 shadow-xl transition-all">
              <button
                type="button"
                onClick={() => {
                  alert("File attachment: Upload birth charts, horary JSON payloads, or customized transit data to ground the companion.");
                }}
                className="p-1.5 hover:bg-[#3e3e3e] text-neutral-400 hover:text-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
                title="Add attachment"
              >
                <Plus className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask JHora AI... (e.g., 'What is my career promise?' or 'Evaluate marriage timing')"
                disabled={analysisLoading}
                className="flex-1 bg-transparent border-none outline-none py-2 text-xs text-slate-100 placeholder-neutral-500 font-sans"
              />

              <button
                type="button"
                onClick={() => {
                  alert("Speech-to-Text: Speak directly to the Master AI Companion to record and synthesize your query.");
                }}
                className="p-1.5 hover:bg-[#3e3e3e] text-neutral-400 hover:text-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={analysisLoading || !input.trim()}
                className="bg-white hover:bg-slate-200 disabled:bg-[#171717] text-black disabled:text-neutral-600 rounded-full p-2 flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <ArrowUp className="w-4 h-4 stroke-[3]" />
              </button>
            </form>

            {/* ChatGPT Disclaimer */}
            <div className="text-center text-[10px] text-neutral-500 font-sans">
              JHora AI can make mistakes. Verify important astrological information.
            </div>

          </div>
        </div>
      </div>

      {/* 3. RIGHT PANEL (Dynamic Astrological Companion Details Panel) */}
      {activeRightTab && (
        <div className="w-[340px] bg-[#171717] border-l border-neutral-800 flex flex-col h-full shrink-0 z-10 animate-slide-in relative">
          
          {/* Panel Header */}
          <div className="h-14 border-b border-neutral-800/40 px-4 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              {activeRightTab === "trace" && <Activity className="w-4 h-4 text-emerald-400" />}
              {activeRightTab === "technical" && <Cpu className="w-4 h-4 text-indigo-400" />}
              {activeRightTab === "charts" && <Compass className="w-4 h-4 text-amber-400" />}
              {activeRightTab === "reports" && <FileText className="w-4 h-4 text-purple-400" />}
              <span>{activeRightTab.replace("-", " ")}</span>
            </span>
            <button 
              onClick={() => setActiveRightTab(null)}
              className="text-[11px] font-semibold text-neutral-400 hover:text-slate-100 cursor-pointer hover:bg-[#212121] px-2 py-1 rounded"
            >
              Close
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            
            {/* A. TRACE TAB */}
            {activeRightTab === "trace" && (
              <div className="space-y-4 text-xs">
                {activeDebugInfo ? (
                  <div className="space-y-3">
                    {/* Knowledge base summary */}
                    <div className="grid grid-cols-2 gap-2 bg-[#212121] border border-neutral-800 p-2.5 rounded-xl">
                      <div>
                        <span className="block text-[8px] text-neutral-500 uppercase font-mono">Knowledge Book</span>
                        <strong className="text-slate-300 font-mono text-[10px]">{activeDebugInfo.knowledgeBookVersion || "v2.0.1"}</strong>
                      </div>
                      <div>
                        <span className="block text-[8px] text-neutral-500 uppercase font-mono">Model Engine</span>
                        <strong className="text-[#a79ff9] font-mono text-[10px]">{activeDebugInfo.modelUsed || "gemini-3.5-flash"}</strong>
                      </div>
                    </div>

                    {/* Matched Rules */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-amber-500 font-bold uppercase font-mono tracking-wide block">Matched Natal Rules:</span>
                      {activeDebugInfo.matchedRules && activeDebugInfo.matchedRules.length > 0 ? (
                        <div className="space-y-1">
                          {activeDebugInfo.matchedRules.map((rule: any, idx: number) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-[#212121] border border-neutral-800 flex justify-between items-center">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-200 text-xs">{rule.id}</span>
                                <span className="text-[10px] text-slate-400 leading-snug">{rule.name}</span>
                              </div>
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase shrink-0">Met</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-neutral-500 italic text-[10px]">No matched rules in this dasha window.</p>
                      )}
                    </div>

                    {/* Primary Evidence */}
                    <div className="space-y-1.5 bg-[#212121]/50 border border-neutral-800 p-3 rounded-xl">
                      <span className="text-[9px] text-indigo-400 font-bold uppercase font-mono tracking-wide block">Primary Evidence Indicators:</span>
                      {activeDebugInfo.evidence && activeDebugInfo.evidence.length > 0 ? (
                        <ul className="space-y-1 list-disc list-inside text-neutral-300 text-[10px] leading-relaxed">
                          {activeDebugInfo.evidence.map((ev: string, idx: number) => (
                            <li key={idx} className="truncate" title={ev}>{ev}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-neutral-500 italic text-[10px]">No specific evidence codes evaluated.</p>
                      )}
                    </div>

                    {/* Decision block */}
                    <div className="space-y-1.5 bg-[#212121]/50 border border-neutral-800 p-3 rounded-xl">
                      <span className="text-[9px] text-teal-400 font-bold uppercase font-mono tracking-wide block">Determinism Engine Decision:</span>
                      <p className="text-neutral-300 leading-relaxed font-sans text-[10px]">
                        {activeDebugInfo.decision || "No long-term marriage delay decision triggers present."}
                      </p>
                    </div>

                    {/* Timeline active events */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-purple-400 font-bold uppercase font-mono tracking-wide block">Active Timeline Outlook:</span>
                      {activeDebugInfo.timeline && activeDebugInfo.timeline.length > 0 ? (
                        <ul className="space-y-1 list-disc list-inside text-neutral-300 text-[10px]">
                          {activeDebugInfo.timeline.map((tl: string, idx: number) => (
                            <li key={idx}>{tl}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-neutral-500 italic text-[10px]">No active timelines reported.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-neutral-500 text-[10px]">
                    <HelpCircle className="w-6 h-6 text-neutral-600 mx-auto mb-1.5" />
                    <span>Select an assistant message to inspect its precise mathematical traces and diagnostic parameters.</span>
                  </div>
                )}
              </div>
            )}

            {/* B. TECHNICAL DETAILS TAB */}
            {activeRightTab === "technical" && (
              <div className="space-y-3">
                <span className="text-[9px] text-indigo-400 font-bold uppercase font-mono tracking-wider block">KP Cuspal Verification Status</span>
                {rulesStatus && rulesStatus.results ? (
                  <div className="space-y-2">
                    {rulesStatus.results.map((rule: any) => (
                      <div key={rule.id} className="p-2.5 rounded-xl bg-[#212121] border border-neutral-800/80 space-y-1.5">
                        <div className="flex justify-between items-start gap-2 text-xs">
                          <span className="font-bold text-slate-200">{rule.category} Promise ({rule.id})</span>
                          <span className={`text-[8px] font-bold uppercase px-1 rounded-sm shrink-0 ${rule.isMet ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                            {rule.isMet ? "Met" : "Alert"}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-relaxed font-sans">{rule.reasoning}</p>
                        <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-mono pt-1.5 border-t border-neutral-800 mt-1 flex-wrap">
                          <span>CSL: <strong className="text-neutral-300">{rule.significator}</strong></span>
                          <span>Star: <strong className="text-neutral-300">{rule.starLord}</strong></span>
                          {rule.signifiedHouses && rule.signifiedHouses.length > 0 && (
                            <span>Houses: <strong className="text-neutral-300">[{rule.signifiedHouses.join(", ")}]</strong></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-neutral-500 text-[10px]">
                    <span>Loading natal rules checklist engine...</span>
                  </div>
                )}
              </div>
            )}

            {/* C. CHARTS TAB */}
            {activeRightTab === "charts" && (
              <div className="space-y-4">
                <span className="text-[9px] text-amber-500 font-bold uppercase font-mono tracking-wider block">Celestial Transits Summary</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#212121] border border-neutral-800">
                    <span className="block text-[8px] text-neutral-500 uppercase font-mono">Moon Sign</span>
                    <strong className="text-neutral-200">{currentSky?.moon?.currentSign?.displayName || "Libra"}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#212121] border border-neutral-800">
                    <span className="block text-[8px] text-neutral-500 uppercase font-mono">Nakshatra</span>
                    <strong className="text-neutral-200">{currentSky?.moon?.currentNakshatra?.displayName || "Chitra"}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#212121] border border-neutral-800">
                    <span className="block text-[8px] text-neutral-500 uppercase font-mono">Star Lord</span>
                    <strong className="text-neutral-200">{currentSky?.moon?.currentStarLord?.displayName || "Mars"}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#212121] border border-neutral-800">
                    <span className="block text-[8px] text-neutral-500 uppercase font-mono">Tithi / Phase</span>
                    <strong className="text-neutral-200">{currentSky?.moon?.moonPhase?.displayName || "Sukla Ashtami"}</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[9px] text-neutral-500 font-bold uppercase font-mono block mb-2">Transit Planetary Longitudes</span>
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {currentSky?.planets ? (
                      Object.entries(currentSky.planets).map(([planetKey, pData]: [string, any]) => (
                        <div key={planetKey} className="flex justify-between items-center text-[10px] bg-[#212121] p-1.5 px-2.5 rounded-lg border border-neutral-800/50">
                          <span className="capitalize text-slate-300 font-medium">{planetKey}</span>
                          <span className="text-neutral-400 font-mono">{pData.longitude}° in {pData.currentSign} ({pData.nakshatra})</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-neutral-500">Loading current planetary longitudes...</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* D. REPORTS TAB */}
            {activeRightTab === "reports" && (
              <div className="space-y-4">
                <span className="text-[9px] text-purple-400 font-bold uppercase font-mono tracking-wider block">Vedic Systems Report Hub</span>
                <p className="text-[10.5px] text-neutral-300 leading-relaxed">
                  Export complete calculations, interpretations, Vimshottari dasha sequences, and KP promise verdicts into high-fidelity PDF manuals.
                </p>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      alert("PDF Export Initiated: Generating 12-page Comprehensive Astrological Seeker Manual for Nitin...");
                    }}
                    className="flex items-center justify-center gap-2 w-full bg-[#5c4df2] hover:bg-[#4b3de0] text-white py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Comprehensive PDF Report</span>
                  </button>

                  <button 
                    onClick={() => {
                      alert("JSON Export: Downloading raw API payload from local UserProfile archive...");
                    }}
                    className="flex items-center justify-center gap-2 w-full bg-[#2f2f2f] hover:bg-[#3e3e3e] text-slate-200 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-neutral-800"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download Raw JSON Data</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
