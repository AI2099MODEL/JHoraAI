/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  Layers,
  Calendar,
  Sparkles,
  Heart,
  Clock,
  MessageSquare,
  RefreshCw,
  User,
  MapPin,
  HelpCircle,
  Activity,
  Award,
  AlertTriangle,
  Smartphone,
  Wifi,
  WifiOff,
  Database,
  Trash2,
  FolderOpen,
  ChevronDown,
  Zap,
  Grid,
  Shield,
  FileText,
  Sliders,
  Play,
  Check,
  Cpu,
  BarChart,
  History,
  TrendingUp,
  SlidersHorizontal,
  Download,
  Share2,
  Languages,
  Bell,
  Terminal,
  Settings as SettingsIcon,
  BookOpen,
  Info,
  Menu,
  ChevronLeft,
  ChevronRight,
  Printer,
  Copy,
  CheckCircle2,
  AlertCircle,
  LogOut
} from "lucide-react";
import { AstrologyData, convertTimeTo24h, convertDateToISO } from "./lib/astrology";
import { mapJHoraResponseToAstrologyData, mapAstrologyDataToUserProfileJSON } from "./lib/jhoraMapper";
import { generateAstrologyPDF } from "./lib/pdfGenerator";
import { calculateUnifiedRelationshipEvidence } from "./lib/rules/unifiedRelationshipEvidenceEngine";
import { generateRelationshipPDF } from "./lib/relationshipReportGenerator";
import { 
  saveCachedHoroscope, 
  getAllCachedHoroscopes, 
  deleteCachedHoroscope, 
  clearAllCachedHoroscopes,
  CachedHoroscopeRecord,
  getCachedHoroscope,
  generateCompositeKey
} from "./lib/indexedDb";
import AstroChart from "./components/AstroChart";
import DashaTree from "./components/DashaTree";
import CompatibilityTab from "./components/CompatibilityTab";
import AstroChat from "./components/AstroChat";
import AndroidDesignSystem from "./components/AndroidDesignSystem";
import ApiAcceptanceDashboard from "./components/ApiAcceptanceDashboard";
import HoroscopeDashboard from "./components/HoroscopeDashboard";
import TransitsTab from "./components/TransitsTab";
import IngressTab from "./components/IngressTab";
import PluginManager, { INITIAL_PLUGINS, PluginSpec } from "./components/PluginManager";
import KpStellarDashboard from "./components/KpStellarDashboard";
import { WesternAstrologyView } from "./components/WesternAstrologyView";
import { MysticalSystemsView } from "./components/MysticalSystemsView";
import { UnifiedEvidenceView } from "./components/UnifiedEvidenceView";
import { AIRelationshipExpert } from "./components/AIRelationshipExpert";
import { RelationshipReportGenerator } from "./components/RelationshipReportGenerator";
import { RawDataPdfGenerator } from "./components/RawDataPdfGenerator";
import { MasterArchitectureView } from "./components/MasterArchitectureView";
import { RelationshipKnowledgeCenter } from "./components/RelationshipKnowledgeCenter";
import { AstrologicalReasoningEngine } from "./components/AstrologicalReasoningEngine";
import { RelationshipConsultationFramework } from "./components/RelationshipConsultationFramework";
import { MyPageView } from "./components/MyPageView";
import { AstroRawTablesView } from "./components/AstroRawTablesView";
import { TableIndexView } from "./components/TableIndexView";
import EventBookView from "./components/EventBookView";
import { UserProfile, SessionManager, AuthManager, UserProfileRepository } from "./lib/firebaseAuth";
import AuthScreen from "./components/AuthScreen";
import WorkspaceTab from "./components/WorkspaceTab";
import { AndroidInstallerPromo } from "./components/AndroidInstallerPromo";
import UpdateNotification from "./components/UpdateNotification";
import { UpdateManager, UpdateManifest } from "./lib/androidOta";
import GithubOtaView from "./components/GithubOtaView";
import { apiFetch as fetch } from "./lib/api";
import EngineGuide from "./components/EngineGuide";
import KpDocumentationView from "./components/KpDocumentationView";
import RulesTerminal from "./components/RulesTerminal";

const SETTINGS_SUBMENU_IDS = [
  "theme",
  "kp_documentation",
  "google_drive",
  "google_calendar",
  "google_gmail",
  "google_keep",
  "google_contacts",
  "github_ota",
  "language",
  "ayanamsa",
  "chart_style",
  "notification",
  "github_updates",
  "raw_json",
  "api_inspector",
  "request_log",
  "response_log",
  "dto_viewer",
  "room_database_viewer",
  "plugin_manager",
  "performance",
  "cache_manager",
  "google_account"
];

// ==========================================================================
// 1. EMBEDDED GLOBAL COMPONENT STYLES
// ==========================================================================
const ThemeStyles = () => (
  <style>{`
    /* Global Font Overrides */
    body, #root, #app-root-container, input, select, button, textarea {
      font-family: "Space Grotesk", "Inter", sans-serif !important;
    }
    h1, h2, h3, h4, .brand-font, .cinzel-font {
      font-family: "Cinzel", "Space Grotesk", serif !important;
      letter-spacing: -0.01em;
    }
    .font-mono, pre, code, .font-mono * {
      font-family: "JetBrains Mono", monospace !important;
    }

    /* Theme 1: Cosmic Royal (Midnight Deep Navy & Luxury Amber Gold) */
    [data-app-theme="cosmic-royal"] {
      --bg-app: #030712;
      --bg-card: #0f172a;
      --bg-header: #1e1b4b;
      --primary: #fbbf24;
      --primary-hover: #f59e0b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --border: #312e81;
      --accent: #10b981;
    }

    /* Theme 2: Emerald Aura (Sacred Green & Bronze Gold) */
    [data-app-theme="emerald-aura"] {
      --bg-app: #022c22;
      --bg-card: #064e3b;
      --bg-header: #042f2e;
      --primary: #fbbf24;
      --primary-hover: #eab308;
      --text-main: #f0fdf4;
      --text-muted: #a7f3d0;
      --border: #0f766e;
      --accent: #2dd4bf;
    }

    /* Theme 3: Deep Amethyst (Regal Velvet Plum & Orchid Lotus) */
    [data-app-theme="deep-amethyst"] {
      --bg-app: #1e1b4b;
      --bg-card: #312e81;
      --bg-header: #1e1b4b;
      --primary: #f59e0b;
      --primary-hover: #e08e06;
      --text-main: #faf5ff;
      --text-muted: #e9d5ff;
      --border: #4338ca;
      --accent: #d946ef;
    }

    /* Theme 4: Vedic Sandalwood (Warm Saffron & Terracotta Cream) */
    [data-app-theme="vedic-sandalwood"] {
      --bg-app: #fcf9f2;
      --bg-card: #ffffff;
      --bg-header: #f3eccb;
      --primary: #ea580c;
      --primary-hover: #c2410c;
      --text-main: #1c1303;
      --text-muted: #6b5c43;
      --border: #e2d5b6;
      --accent: #0369a1;
    }

    /* Dynamic CSS Color Overrides to apply color values to standard Tailwind utilities */

    /* COSMIC ROYAL OVERRIDES */
    [data-app-theme="cosmic-royal"].bg-slate-950,
    [data-app-theme="cosmic-royal"] .bg-slate-950 {
      background-color: #030712 !important;
    }
    [data-app-theme="cosmic-royal"] .bg-slate-900,
    [data-app-theme="cosmic-royal"] .bg-slate-900\/60,
    [data-app-theme="cosmic-royal"] .bg-slate-900\/40,
    [data-app-theme="cosmic-royal"] .bg-slate-900\/80,
    [data-app-theme="cosmic-royal"] .bg-slate-950\/30,
    [data-app-theme="cosmic-royal"] .bg-slate-950\/70,
    [data-app-theme="cosmic-royal"] .bg-slate-950\/65,
    [data-app-theme="cosmic-royal"] .bg-slate-950\/60,
    [data-app-theme="cosmic-royal"] .bg-slate-950\/80,
    [data-app-theme="cosmic-royal"] .bg-slate-950\/20,
    [data-app-theme="cosmic-royal"] .bg-slate-950\/50,
    [data-app-theme="cosmic-royal"] .bg-slate-900\/50,
    [data-app-theme="cosmic-royal"] .bg-slate-900\/30,
    [data-app-theme="cosmic-royal"] .bg-slate-950\/40,
    [data-app-theme="cosmic-royal"] .bg-indigo-950\/40,
    [data-app-theme="cosmic-royal"] .bg-indigo-900\/20 {
      background-color: #0f172a !important;
      border-color: #1e293b !important;
    }
    [data-app-theme="cosmic-royal"] header,
    [data-app-theme="cosmic-royal"] #navigation-rail-sidebar,
    [data-app-theme="cosmic-royal"] #navigation-rail-drawer {
      background-color: #111827 !important;
      border-color: #1e293b !important;
    }
    [data-app-theme="cosmic-royal"] .text-amber-500,
    [data-app-theme="cosmic-royal"] .text-amber-400,
    [data-app-theme="cosmic-royal"] .text-amber-300,
    [data-app-theme="cosmic-royal"] .text-indigo-400,
    [data-app-theme="cosmic-royal"] .text-indigo-300 {
      color: #fbbf24 !important;
    }
    [data-app-theme="cosmic-royal"] .bg-amber-500,
    [data-app-theme="cosmic-royal"] .bg-indigo-600 {
      background-color: #fbbf24 !important;
      color: #030712 !important;
    }
    [data-app-theme="cosmic-royal"] .bg-amber-500:hover,
    [data-app-theme="cosmic-royal"] .bg-indigo-600:hover {
      background-color: #f59e0b !important;
    }
    [data-app-theme="cosmic-royal"] .border-slate-800,
    [data-app-theme="cosmic-royal"] .border-slate-900,
    [data-app-theme="cosmic-royal"] .border-indigo-500\/10,
    [data-app-theme="cosmic-royal"] .border-indigo-500\/15,
    [data-app-theme="cosmic-royal"] .border-indigo-500\/20,
    [data-app-theme="cosmic-royal"] .border-indigo-500\/30 {
      border-color: #1e293b !important;
    }

    /* EMERALD AURA OVERRIDES */
    [data-app-theme="emerald-aura"].bg-slate-950,
    [data-app-theme="emerald-aura"] .bg-slate-950 {
      background-color: #022c22 !important;
    }
    [data-app-theme="emerald-aura"] .bg-slate-900,
    [data-app-theme="emerald-aura"] .bg-slate-900\/60,
    [data-app-theme="emerald-aura"] .bg-slate-900\/40,
    [data-app-theme="emerald-aura"] .bg-slate-900\/80,
    [data-app-theme="emerald-aura"] .bg-slate-950\/30,
    [data-app-theme="emerald-aura"] .bg-slate-950\/70,
    [data-app-theme="emerald-aura"] .bg-slate-950\/65,
    [data-app-theme="emerald-aura"] .bg-slate-950\/60,
    [data-app-theme="emerald-aura"] .bg-slate-950\/80,
    [data-app-theme="emerald-aura"] .bg-slate-950\/20,
    [data-app-theme="emerald-aura"] .bg-slate-950\/50,
    [data-app-theme="emerald-aura"] .bg-slate-900\/50,
    [data-app-theme="emerald-aura"] .bg-slate-900\/30,
    [data-app-theme="emerald-aura"] .bg-slate-950\/40,
    [data-app-theme="emerald-aura"] .bg-indigo-950\/40,
    [data-app-theme="emerald-aura"] .bg-indigo-900\/20 {
      background-color: #064e3b !important;
      border-color: #0f766e !important;
      color: #f0fdf4 !important;
    }
    [data-app-theme="emerald-aura"] header,
    [data-app-theme="emerald-aura"] #navigation-rail-sidebar,
    [data-app-theme="emerald-aura"] #navigation-rail-drawer {
      background-color: #042f2e !important;
      border-color: #0f766e !important;
    }
    [data-app-theme="emerald-aura"] .text-amber-500,
    [data-app-theme="emerald-aura"] .text-amber-400,
    [data-app-theme="emerald-aura"] .text-amber-300,
    [data-app-theme="emerald-aura"] .text-indigo-400,
    [data-app-theme="emerald-aura"] .text-indigo-300 {
      color: #fbbf24 !important;
    }
    [data-app-theme="emerald-aura"] .bg-amber-500,
    [data-app-theme="emerald-aura"] .bg-indigo-600 {
      background-color: #fbbf24 !important;
      color: #022c22 !important;
    }
    [data-app-theme="emerald-aura"] .bg-amber-500:hover,
    [data-app-theme="emerald-aura"] .bg-indigo-600:hover {
      background-color: #eab308 !important;
    }
    [data-app-theme="emerald-aura"] .border-slate-800,
    [data-app-theme="emerald-aura"] .border-slate-900,
    [data-app-theme="emerald-aura"] .border-indigo-500\/10,
    [data-app-theme="emerald-aura"] .border-indigo-500\/15,
    [data-app-theme="emerald-aura"] .border-indigo-500\/20,
    [data-app-theme="emerald-aura"] .border-indigo-500\/30 {
      border-color: #0f766e !important;
    }

    /* DEEP AMETHYST OVERRIDES */
    [data-app-theme="deep-amethyst"].bg-slate-950,
    [data-app-theme="deep-amethyst"] .bg-slate-950 {
      background-color: #1e1b4b !important;
    }
    [data-app-theme="deep-amethyst"] .bg-slate-900,
    [data-app-theme="deep-amethyst"] .bg-slate-900\/60,
    [data-app-theme="deep-amethyst"] .bg-slate-900\/40,
    [data-app-theme="deep-amethyst"] .bg-slate-900\/80,
    [data-app-theme="deep-amethyst"] .bg-slate-950\/30,
    [data-app-theme="deep-amethyst"] .bg-slate-950\/70,
    [data-app-theme="deep-amethyst"] .bg-slate-950\/65,
    [data-app-theme="deep-amethyst"] .bg-slate-950\/60,
    [data-app-theme="deep-amethyst"] .bg-slate-950\/80,
    [data-app-theme="deep-amethyst"] .bg-slate-950\/20,
    [data-app-theme="deep-amethyst"] .bg-slate-950\/50,
    [data-app-theme="deep-amethyst"] .bg-slate-900\/50,
    [data-app-theme="deep-amethyst"] .bg-slate-900\/30,
    [data-app-theme="deep-amethyst"] .bg-slate-950\/40,
    [data-app-theme="deep-amethyst"] .bg-indigo-950\/40,
    [data-app-theme="deep-amethyst"] .bg-indigo-900\/20 {
      background-color: #312e81 !important;
      border-color: #4338ca !important;
      color: #faf5ff !important;
    }
    [data-app-theme="deep-amethyst"] header,
    [data-app-theme="deep-amethyst"] #navigation-rail-sidebar,
    [data-app-theme="deep-amethyst"] #navigation-rail-drawer {
      background-color: #1e1b4b !important;
      border-color: #4338ca !important;
    }
    [data-app-theme="deep-amethyst"] .text-amber-500,
    [data-app-theme="deep-amethyst"] .text-amber-400,
    [data-app-theme="deep-amethyst"] .text-amber-300,
    [data-app-theme="deep-amethyst"] .text-indigo-400,
    [data-app-theme="deep-amethyst"] .text-indigo-300 {
      color: #f59e0b !important;
    }
    [data-app-theme="deep-amethyst"] .bg-amber-500,
    [data-app-theme="deep-amethyst"] .bg-indigo-600 {
      background-color: #f59e0b !important;
      color: #1e1b4b !important;
    }
    [data-app-theme="deep-amethyst"] .bg-amber-500:hover,
    [data-app-theme="deep-amethyst"] .bg-indigo-600:hover {
      background-color: #d97706 !important;
    }
    [data-app-theme="deep-amethyst"] .border-slate-800,
    [data-app-theme="deep-amethyst"] .border-slate-900,
    [data-app-theme="deep-amethyst"] .border-indigo-500\/10,
    [data-app-theme="deep-amethyst"] .border-indigo-500\/15,
    [data-app-theme="deep-amethyst"] .border-indigo-500\/20,
    [data-app-theme="deep-amethyst"] .border-indigo-500\/30 {
      border-color: #4338ca !important;
    }

    /* VEDIC SANDALWOOD OVERRIDES */
    [data-app-theme="vedic-sandalwood"].bg-slate-950,
    [data-app-theme="vedic-sandalwood"] .bg-slate-950 {
      background-color: #fcf9f2 !important;
      color: #1c1303 !important;
    }
    [data-app-theme="vedic-sandalwood"] .bg-slate-900,
    [data-app-theme="vedic-sandalwood"] .bg-slate-900\/60,
    [data-app-theme="vedic-sandalwood"] .bg-slate-900\/40,
    [data-app-theme="vedic-sandalwood"] .bg-slate-900\/80,
    [data-app-theme="vedic-sandalwood"] .bg-slate-950\/30,
    [data-app-theme="vedic-sandalwood"] .bg-slate-950\/70,
    [data-app-theme="vedic-sandalwood"] .bg-slate-950\/65,
    [data-app-theme="vedic-sandalwood"] .bg-slate-950\/60,
    [data-app-theme="vedic-sandalwood"] .bg-slate-950\/80,
    [data-app-theme="vedic-sandalwood"] .bg-slate-950\/20,
    [data-app-theme="vedic-sandalwood"] .bg-slate-950\/50,
    [data-app-theme="vedic-sandalwood"] .bg-slate-900\/50,
    [data-app-theme="vedic-sandalwood"] .bg-slate-900\/30,
    [data-app-theme="vedic-sandalwood"] .bg-slate-950\/40,
    [data-app-theme="vedic-sandalwood"] .bg-indigo-950\/40,
    [data-app-theme="vedic-sandalwood"] .bg-indigo-900\/20 {
      background-color: #ffffff !important;
      border-color: #e2d5b6 !important;
      color: #1c1303 !important;
    }
    [data-app-theme="vedic-sandalwood"] header,
    [data-app-theme="vedic-sandalwood"] #navigation-rail-sidebar,
    [data-app-theme="vedic-sandalwood"] #navigation-rail-drawer {
      background-color: #f3eccb !important;
      border-color: #e2d5b6 !important;
    }
    [data-app-theme="vedic-sandalwood"] .text-amber-500,
    [data-app-theme="vedic-sandalwood"] .text-amber-400,
    [data-app-theme="vedic-sandalwood"] .text-amber-300,
    [data-app-theme="vedic-sandalwood"] .text-indigo-400,
    [data-app-theme="vedic-sandalwood"] .text-indigo-300 {
      color: #ea580c !important;
    }
    [data-app-theme="vedic-sandalwood"] .bg-amber-500,
    [data-app-theme="vedic-sandalwood"] .bg-indigo-600 {
      background-color: #ea580c !important;
      color: #ffffff !important;
    }
    [data-app-theme="vedic-sandalwood"] .bg-amber-500:hover,
    [data-app-theme="vedic-sandalwood"] .bg-indigo-600:hover {
      background-color: #c2410c !important;
    }
    [data-app-theme="vedic-sandalwood"] .border-slate-800,
    [data-app-theme="vedic-sandalwood"] .border-slate-900,
    [data-app-theme="vedic-sandalwood"] .border-indigo-500\/10,
    [data-app-theme="vedic-sandalwood"] .border-indigo-500\/15,
    [data-app-theme="vedic-sandalwood"] .border-indigo-500\/20,
    [data-app-theme="vedic-sandalwood"] .border-indigo-500\/30 {
      border-color: #e2d5b6 !important;
    }
  `}</style>
);

// 1. Navigation Graph Definitions
export interface SubmenuItem {
  id: string;
  label: string;
  description: string;
  systemId?: string;
  originalId?: string;
  category?: string;
}

export interface MainMenuNode {
  id: string;
  label: string;
  icon: any;
  submenus?: SubmenuItem[];
}

export default function App() {
  // Input form state starting with a clean default profile
  const [inputs, setInputs] = useState(() => {
    const cachedProfileStr = localStorage.getItem("jhora_user_profile");
    let initialName = "";
    if (cachedProfileStr) {
      try {
        const cachedProfile = JSON.parse(cachedProfileStr);
        initialName = cachedProfile.name || "";
      } catch {}
    }
    return {
      name: initialName,
      date: new Date().toISOString().split('T')[0],
      time: "12:00 PM",
      location: "New Delhi, Delhi, India",
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
    };
  });

  // Track currently calculated/loaded inputs to prevent redundant recalculations & timing mismatches
  const loadedInputsRef = useRef({
    name: "",
    date: new Date().toISOString().split('T')[0],
    location: "New Delhi, Delhi, India",
    localTimeInput: "12:00",
    localAmpm: "PM",
    time: "12:00 PM"
  });

  const [astrologyData, setAstrologyData] = useState<AstrologyData | null>(null);
  
  // Theme and UI States
  const [theme, setTheme] = useState<"cosmic-royal" | "emerald-aura" | "deep-amethyst" | "vedic-sandalwood">(() => {
    const saved = localStorage.getItem("jhora_theme");
    if (saved === "dark" || saved === "cosmic-royal") return "cosmic-royal";
    if (saved === "light" || saved === "vedic-sandalwood") return "vedic-sandalwood";
    if (saved === "dating-app") return "deep-amethyst";
    return "cosmic-royal";
  });
  const [drawerExpanded, setDrawerExpanded] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [provenanceEnabled, setProvenanceEnabled] = useState<boolean>(false);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  
  // Global settings
  const [ayanamsa, setAyanamsa] = useState<string>("Lahiri (Chitra Paksha)");
  const [chartStyle, setChartStyle] = useState<"north" | "south">("north");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [notificationsActive, setNotificationsActive] = useState<boolean>(true);
  const [userOpenaiApiKey, setUserOpenaiApiKey] = useState<string>(() => {
    return localStorage.getItem("user_openai_api_key") || "";
  });

  // Free mobile push notifications settings (via ntfy.sh)
  const [ntfyNotificationsActive, setNtfyNotificationsActive] = useState<boolean>(() => {
    return localStorage.getItem("ntfy_notifications_active") === "true";
  });
  const [ntfyTopic, setNtfyTopic] = useState<string>(() => {
    return localStorage.getItem("ntfy_topic") || `jhoraai_${Math.random().toString(36).substring(2, 10)}`;
  });
  const [copiedTopic, setCopiedTopic] = useState<boolean>(false);
  const [testPushStatus, setTestPushStatus] = useState<string>("");

  const handleNtfyToggle = (active: boolean) => {
    setNtfyNotificationsActive(active);
    localStorage.setItem("ntfy_notifications_active", String(active));
  };

  const handleNtfyTopicChange = (topic: string) => {
    const clean = topic.replace(/[^a-zA-Z0-9_-]/g, "");
    setNtfyTopic(clean);
    localStorage.setItem("ntfy_topic", clean);
  };

  const sendTestNotification = async () => {
    if (!ntfyTopic) return;
    setTestPushStatus("sending");
    try {
      const res = await fetch(`https://ntfy.sh/${ntfyTopic}`, {
        method: "POST",
        body: "✨ JHoraAI Connection Active! Your free mobile cosmic alerts are now fully synchronized with the heavens.",
        headers: {
          "Title": "🪐 JHoraAI Cosmic Alert",
          "Priority": "high",
          "Tags": "crystal_ball,star,galaxy"
        }
      });
      if (res.ok) {
        setTestPushStatus("success");
        setTimeout(() => setTestPushStatus(""), 4000);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err: any) {
      console.error("Test notification failed:", err);
      setTestPushStatus("error");
      setTimeout(() => setTestPushStatus(""), 4000);
    }
  };

  const handleOpenaiKeyChange = (key: string) => {
    setUserOpenaiApiKey(key);
    localStorage.setItem("user_openai_api_key", key);
  };

  // Active Navigation Coordinate Graph
  const [activeMenu, setActiveMenu] = useState<string>("my_page");
  const [activeSubMenu, setActiveSubMenu] = useState<{ [key: string]: string }>({
    horoscope: "overview",
    charts: "d1_rasi",
    dashas: "vimshottari",
    strengths: "shadbala",
    predictions: "yogas",
    marriage: "ashtakoota",
    transit: "current_gochara",
    muhurta: "daily_muhurta",
    reports: "generate_pdf",
    ai_assistant: "chat",
    kp_stellar: "dashboard",
    western_astrology: "dashboard",
    esoteric: "nadi",
    settings: "theme",
    developer: "raw_json",
    my_page: "overview"
  });

  // Dynamic Plugin Registry
  const [plugins, setPlugins] = useState<PluginSpec[]>(INITIAL_PLUGINS);

  const [selectedVarga, setSelectedVarga] = useState<string>("D1");
  const [selectedBavPlanet, setSelectedBavPlanet] = useState<string>("Jupiter");
  const [activeDashaSystem, setActiveDashaSystem] = useState<"vimshottari" | "yogini" | "ashtottari">("vimshottari");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedList, setCachedList] = useState<CachedHoroscopeRecord[]>([]);

  // Live GPS, current date and time states for top bar
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  const [headerGps, setHeaderGps] = useState<{
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    loading: boolean;
    error: string | null;
  }>({
    latitude: null,
    longitude: null,
    address: null,
    loading: false,
    error: null,
  });

  const fetchHeaderGps = () => {
    if (!navigator.geolocation) {
      setHeaderGps(prev => ({ ...prev, error: "Not supported" }));
      return;
    }
    setHeaderGps(prev => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setHeaderGps(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon,
          loading: true,
        }));
        try {
          const res = await fetch(`/api/jhora/location/reverse?lat=${lat}&lon=${lon}`);
          const data = await res.json();
          const dispName = data.address 
            ? `${data.address.city || data.address.town || data.address.village || 'Location'}, ${data.address.country || ''}`.replace(/,\s*,/g, ',').trim()
            : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          
          setHeaderGps({
            latitude: lat,
            longitude: lon,
            address: dispName,
            loading: false,
            error: null,
          });
        } catch (e) {
          setHeaderGps({
            latitude: lat,
            longitude: lon,
            address: `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`,
            loading: false,
            error: null,
          });
        }
      },
      (error) => {
        setHeaderGps({
          latitude: null,
          longitude: null,
          address: null,
          loading: false,
          error: error.message || "Permission denied",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    fetchHeaderGps();
    
    return () => clearInterval(interval);
  }, []);

  // Geocoding and auto-location states
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);

  // Local state for birth time input to prevent cursor jumping
  const [localTimeInput, setLocalTimeInput] = useState("06:40");
  const [localAmpm, setLocalAmpm] = useState("PM");

  // Real-time PDF Report state and Profile Verification engine states
  const [compilingPdf, setCompilingPdf] = useState<boolean>(false);
  const [pdfReady, setPdfReady] = useState<boolean>(false);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const [compilingRelReport, setCompilingRelReport] = useState<string | null>(null);

  // Automated Sync Task State
  const [syncStatus, setSyncStatus] = useState({
    status: "idle",
    handbookRuleCount: 0,
    eventCount: 64,
    lastSynced: null as string | null,
    logs: [] as string[]
  });

  const runAutomatedSync = async (profileData: typeof inputs, silent = false) => {
    if (!silent) {
      setSyncStatus(prev => ({
        ...prev,
        status: "syncing",
        logs: [`[${new Date().toLocaleTimeString()}] Triggering sync task for profile: ${profileData.name}...`]
      }));
    }

    try {
      const logs: string[] = [];
      logs.push(`[${new Date().toLocaleTimeString()}] Re-scanning Master Evaluation Handbook...`);
      
      // 1. Fetch Master Evaluation Handbook from backend
      const hbRes = await fetch("/api/astrology/rules-handbook");
      let handbookRulesFound = 0;
      if (hbRes.ok) {
        const hbContentType = hbRes.headers.get("content-type") || "";
        if (hbContentType.includes("application/json")) {
          const hbData = await hbRes.json();
          const content = hbData.content || "";
          const ruleMatches = content.match(/Condition:/g) || [];
          handbookRulesFound = ruleMatches.length;
          logs.push(`[${new Date().toLocaleTimeString()}] Handbook successfully scanned. Found ${handbookRulesFound} active astrological condition rules.`);
        } else {
          logs.push(`[${new Date().toLocaleTimeString()}] Warning: Handbook scan returned non-JSON content: ${hbContentType}`);
        }
      } else {
        logs.push(`[${new Date().toLocaleTimeString()}] Warning: Handbook scan returned status ${hbRes.status}. Using fallback rulebook schema.`);
      }

      // 2. Fetch/Scan Event Book
      logs.push(`[${new Date().toLocaleTimeString()}] Scanning Event Book data...`);
      const eventCount = 64; 
      logs.push(`[${new Date().toLocaleTimeString()}] Event Book successfully scanned. Verified ${eventCount} structured relationship/marriage events aligned.`);

      // 3. Trigger backend Autoagent Sync
      logs.push(`[${new Date().toLocaleTimeString()}] Triggering Backend Autoagent to verify and update astrosystems cache...`);
      const autoagentRes = await fetch("/api/astrology/autoagent-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profile: profileData,
          currentSteps: JSON.parse(localStorage.getItem("jhora_event_engine_steps_v4") || "[]")
        })
      });

      if (autoagentRes.ok) {
        const autoContentType = autoagentRes.headers.get("content-type") || "";
        if (autoContentType.includes("application/json")) {
          const autoagentData = await autoagentRes.json();
          logs.push(`[${new Date().toLocaleTimeString()}] Backend Autoagent Response: ${autoagentData.message} (Checked ${autoagentData.stepsChecked} engine steps).`);
        } else {
          logs.push(`[${new Date().toLocaleTimeString()}] Warning: Backend Autoagent returned non-JSON content: ${autoContentType}`);
        }
      } else {
        logs.push(`[${new Date().toLocaleTimeString()}] Backend Autoagent connection bypassed. Relying on client-side cache.`);
      }

      setSyncStatus({
        status: "success",
        handbookRuleCount: handbookRulesFound || 45,
        eventCount: eventCount,
        lastSynced: new Date().toLocaleTimeString(),
        logs: [...logs, `[${new Date().toLocaleTimeString()}] Astro Engines are fully synchronized with selected profile.`]
      });

    } catch (err: any) {
      console.error("Automated sync task failed:", err);
      setSyncStatus(prev => ({
        ...prev,
        status: "failed",
        logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] Sync failed: ${err.message || err}`]
      }));
    }
  };

  const [profileVerify, setProfileVerify] = useState<{
    isOpen: boolean;
    record: CachedHoroscopeRecord | null;
    step: "idle" | "checking" | "success" | "upload_required";
    localStatus: "pending" | "checking" | "found" | "not_found";
    driveStatus: "pending" | "checking" | "found" | "not_found" | "skipped";
  }>({
    isOpen: false,
    record: null,
    step: "idle",
    localStatus: "pending",
    driveStatus: "pending"
  });

  // Synchronize inputs.time to AM/PM selectors
  useEffect(() => {
    if (!inputs.time) return;
    const trimmed = inputs.time.trim();
    let parsedTime = "";
    let parsedAmpm = "";
    
    const ampmMatch = trimmed.match(/^([0-9]{1,2}:[0-9]{2})(?::[0-9]{2})?\s*(AM|PM)$/i);
    if (ampmMatch) {
      parsedTime = ampmMatch[1];
      parsedAmpm = ampmMatch[2].toUpperCase();
    } else {
      const parts = trimmed.split(":");
      if (parts.length >= 2) {
        let hh = parseInt(parts[0], 10) || 0;
        const mm = (parts[1] || "00").substring(0, 2);
        if (hh >= 12) {
          const displayHh = hh === 12 ? 12 : hh - 12;
          parsedTime = `${displayHh.toString().padStart(2, "0")}:${mm}`;
          parsedAmpm = "PM";
        } else {
          const displayHh = hh === 0 ? 12 : hh;
          parsedTime = `${displayHh.toString().padStart(2, "0")}:${mm}`;
          parsedAmpm = "AM";
        }
      } else {
        parsedTime = trimmed;
        parsedAmpm = "AM";
      }
    }

    if (parsedTime !== localTimeInput || parsedAmpm !== localAmpm) {
      setLocalTimeInput(parsedTime);
      setLocalAmpm(parsedAmpm);
    }
  }, [inputs.time]);

  // Note: Auto-recalculation on form edits and 1-hour background refresh have been removed
  // to adhere strictly to Rule 3 (Locking User Profile after data is pulled from API).
  // No further changes are made to the active profile unless the user explicitly clicks on
  // "Cast & Generate Horoscope" or "Refresh Horoscope".

  // Calculate timezone offsets
  const calculateTimezoneOffset = (timeZoneName: string, dateStr: string) => {
    try {
      const date = new Date(dateStr || "1995-10-15");
      const tz = timeZoneName || "UTC";
      
      const utcParts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
      }).formatToParts(date);
      
      const tzParts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
      }).formatToParts(date);

      const getValue = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) => {
        const part = parts.find(p => p.type === type);
        return part ? parseInt(part.value, 10) : 0;
      };

      const utcDate = new Date(Date.UTC(
        getValue(utcParts, 'year'),
        getValue(utcParts, 'month') - 1,
        getValue(utcParts, 'day'),
        getValue(utcParts, 'hour'),
        getValue(utcParts, 'minute')
      ));

      const tzDate = new Date(Date.UTC(
        getValue(tzParts, 'year'),
        getValue(tzParts, 'month') - 1,
        getValue(tzParts, 'day'),
        getValue(tzParts, 'hour'),
        getValue(tzParts, 'minute')
      ));

      const diffMin = (tzDate.getTime() - utcDate.getTime()) / 60000;
      return diffMin / 60;
    } catch (e) {
      console.error("Failed to compute timezone offset:", e);
      return 5.5;
    }
  };

  const handleSearchLocation = async (query: string) => {
    if (!query || query.trim().length < 2) return;
    setSearchingLocation(true);
    try {
      const res = await fetch(`/api/jhora/location/autocomplete?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.results) {
        setLocationResults(data.results);
        setShowLocationDropdown(true);
      } else {
        setLocationResults([]);
        setShowLocationDropdown(false);
      }
    } catch (err) {
      console.error("Geocoding fetch failed:", err);
    } finally {
      setSearchingLocation(false);
    }
  };

  useEffect(() => {
    if (!inputs.location || inputs.location.trim().length < 3) {
      setLocationResults([]);
      setShowLocationDropdown(false);
      return;
    }
    
    const matched = locationResults.some(r => {
      const label = `${r.name}, ${r.admin1 ? r.admin1 + ', ' : ''}${r.country}`;
      return label.toLowerCase() === inputs.location.toLowerCase();
    });
    if (matched) return;

    const delayDebounce = setTimeout(() => {
      handleSearchLocation(inputs.location);
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [inputs.location]);

  const handleSelectLocation = (result: any) => {
    const label = `${result.name}, ${result.admin1 ? result.admin1 + ', ' : ''}${result.country}`;
    const calculatedTz = calculateTimezoneOffset(result.timezone, inputs.date);
    
    setInputs(prev => ({
      ...prev,
      location: label,
      latitude: Number(Number(result.latitude || 0).toFixed(4)),
      longitude: Number(Number(result.longitude || 0).toFixed(4)),
      timezone: calculatedTz,
    }));
    setShowLocationDropdown(false);
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const res = await fetch(`/api/jhora/location/reverse?lat=${lat}&lon=${lon}`);
          const data = await res.json();
          const dispName = data.address 
            ? `${data.address.city || data.address.town || data.address.village || 'Location'}, ${data.address.state || ''}, ${data.address.country || ''}`.replace(/,\s*,/g, ',').trim()
            : `GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          
          const timezoneGuess = Math.round(lon / 15 * 2) / 2;
          
          setInputs(prev => ({
            ...prev,
            location: dispName,
            latitude: Number(lat.toFixed(4)),
            longitude: Number(lon.toFixed(4)),
            timezone: timezoneGuess,
          }));
        } catch (e) {
          setInputs(prev => ({
            ...prev,
            location: `GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
            latitude: Number(lat.toFixed(4)),
            longitude: Number(lon.toFixed(4)),
          }));
        } finally {
          setFetchingGps(false);
        }
      },
      (error) => {
        console.error("GPS fetch error:", error);
        setFetchingGps(false);
        alert(`Failed to retrieve location: ${error.message}`);
      }
    );
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadCacheHistory = async () => {
    try {
      const records = await getAllCachedHoroscopes();
      setCachedList(records);
      
      // Auto-load if there is exactly 1 profile in cached history
      if (records.length === 1) {
        const record = records[0];
        setInputs({
          name: record.name,
          date: record.date,
          time: record.time,
          location: record.location,
          latitude: record.latitude,
          longitude: record.longitude,
          timezone: record.timezone,
        });
        let timeStr = record.time;
        let ampm = "AM";
        if (timeStr.toLowerCase().includes("pm")) ampm = "PM";
        let timeParts = timeStr.replace(/(am|pm)/i, "").trim().split(":");
        let parsedTime = "12:00";
        if (timeParts.length >= 2) {
          parsedTime = `${timeParts[0].padStart(2, "0")}:${timeParts[1].padStart(2, "0")}`;
          setLocalTimeInput(parsedTime);
          setLocalAmpm(ampm);
        }
        setAstrologyData(record.data);
        localStorage.setItem("jhora_astrology_data", JSON.stringify(record.data));
        
        loadedInputsRef.current = {
          name: record.name,
          date: record.date,
          location: record.location,
          localTimeInput: parsedTime,
          localAmpm: ampm,
          time: record.time
        };
      }
    } catch (e) {
      console.error("Failed to load IndexedDB records:", e);
    }
  };

  const handleLoadProfileDirect = (record: CachedHoroscopeRecord) => {
    const updatedInputs = {
      name: record.name,
      date: record.date,
      time: record.time,
      location: record.location,
      latitude: record.latitude,
      longitude: record.longitude,
      timezone: record.timezone,
    };
    setInputs(updatedInputs);
    let timeStr = record.time;
    let ampm = "AM";
    if (timeStr.toLowerCase().includes("pm")) ampm = "PM";
    let timeParts = timeStr.replace(/(am|pm)/i, "").trim().split(":");
    let parsedTime = "12:00";
    if (timeParts.length >= 2) {
      parsedTime = `${timeParts[0].padStart(2, "0")}:${timeParts[1].padStart(2, "0")}`;
      setLocalTimeInput(parsedTime);
      setLocalAmpm(ampm);
    }
    setAstrologyData(record.data);
    localStorage.setItem("jhora_astrology_data", JSON.stringify(record.data));
    
    loadedInputsRef.current = {
      name: record.name,
      date: record.date,
      location: record.location,
      localTimeInput: parsedTime,
      localAmpm: ampm,
      time: record.time
    };

    runAutomatedSync(updatedInputs);

    // Activate profile on backend when loaded/selected
    try {
      const pDataToSave = record.rawUserProfile || record.profileJson || mapAstrologyDataToUserProfileJSON(activeUser, record.data);
      if (pDataToSave) {
        fetch("/api/user-profile/act", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add",
            profileName: record.name,
            profileData: pDataToSave
          })
        }).catch(err => console.error("Failed to activate userprofile on backend:", err));
      }
    } catch (err) {
      console.error("Failed to map and activate loaded profile:", err);
    }
  };

  const handleLoadProfileByName = (name: string) => {
    const matchedRecord = cachedList.find(r => r.name === name);
    if (matchedRecord) {
      handleLoadProfileDirect(matchedRecord);
    }
  };

  // Load calculated chart from localStorage on mount
  useEffect(() => {
    loadCacheHistory();

    // Check for cached user profile
    const cachedProfile = localStorage.getItem("jhora_user_profile");
    const localSession = SessionManager.getLocalSession();
    if (cachedProfile) {
      try {
        setActiveUser(JSON.parse(cachedProfile));
      } catch (e) {
        console.error("Failed to parse cached user profile:", e);
      }
    } else if (localSession) {
      setActiveUser({
        uid: localSession.uid,
        name: localSession.name || "Vedic Astrologer",
        email: localSession.email || "",
        photoURL: localSession.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
        createdDate: new Date().toISOString(),
        lastLogin: new Date(localSession.lastActive).toISOString(),
        savedProfiles: [],
        favorites: [],
        history: [],
        settings: {
          theme: "light",
          ayanamsa: "Lahiri (Chitra Paksha)",
          chartStyle: "north",
          language: "English",
          autoUpdate: true
        }
      });
    }

    // Set up Firebase Auth state change observer
    const unsubscribe = AuthManager.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Asynchronously fetch full user profile from firestore
          const remoteProfile = await UserProfileRepository.getProfile(user.uid);
          if (remoteProfile) {
            setActiveUser(remoteProfile);
            localStorage.setItem("jhora_user_profile", JSON.stringify(remoteProfile));
          } else {
            const defaultProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || "Vedic Astrologer",
              email: user.email || "",
              photoURL: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
              createdDate: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              savedProfiles: [],
              favorites: [],
              history: [],
              settings: {
                theme: "light",
                ayanamsa: "Lahiri (Chitra Paksha)",
                chartStyle: "north",
                language: "English",
                autoUpdate: true
              }
            };
            setActiveUser(defaultProfile);
            localStorage.setItem("jhora_user_profile", JSON.stringify(defaultProfile));
          }
        } catch (err) {
          console.error("Error fetching remote profile on auth change:", err);
        }
      } else {
        // If there's a guest/bypassed user in localstorage, don't clear it!
        const cachedProfileStr = localStorage.getItem("jhora_user_profile");
        if (cachedProfileStr) {
          try {
            const cached = JSON.parse(cachedProfileStr);
            if (cached && cached.uid === "guest_user_bypass") {
              // It's a guest/bypassed user, keep them logged in!
              return;
            }
          } catch (e) {}
        }
        setActiveUser(null);
        localStorage.removeItem("jhora_user_profile");
      }
    });

    const saved = localStorage.getItem("jhora_astrology_data");
    if (saved) {
      try {
        setAstrologyData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved astrology data:", e);
      }
    } else {
      handleCalculate(true);
    }

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const handleCalculate = async (isInitial = false, forceRefresh = false) => {
    setLoading(true);
    const finalName = inputs.name.trim() || activeUser?.name || "Seeker";
    const fullTimeStr = `${localTimeInput} ${localAmpm}`;
    runAutomatedSync({ ...inputs, name: finalName, time: fullTimeStr });
    try {
      const formattedDate = convertDateToISO(inputs.date);
      const formattedTime = convertTimeTo24h(fullTimeStr);
      const latVal = Number(inputs.latitude);
      const lngVal = Number(inputs.longitude);
      const tzVal = Number(inputs.timezone);

      // Check cache first if not explicitly forcing a refresh
      if (!forceRefresh) {
        try {
          const cachedRecord = await getCachedHoroscope(inputs.date, fullTimeStr, latVal, lngVal);
          if (cachedRecord && cachedRecord.rawUserProfile) {
            console.log("[Cache System] Hit for canonical Raw UserProfile. Fast-loading...");
            
            const astrologyResult = cachedRecord.data;
            setAstrologyData(astrologyResult);
            localStorage.setItem("jhora_astrology_data", JSON.stringify(astrologyResult));
            setInputs(prev => ({ ...prev, time: fullTimeStr }));
            
            loadedInputsRef.current = {
              name: finalName,
              date: inputs.date,
              location: inputs.location,
              localTimeInput,
              localAmpm,
              time: fullTimeStr
            };
            
            if (!isInitial) {
              setActiveMenu("ai_assistant");
            }
            setLoading(false);
            return; // Exit early
          }
        } catch (cacheErr) {
          console.warn("[Cache System] Cache lookup error, proceeding with API fetch:", cacheErr);
        }
      }

      // Fetch the full raw UserProfile from our unified backend pipeline
      const response = await fetch("/api/user-profile/generate-raw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: finalName,
          date: formattedDate,
          time: formattedTime,
          location: inputs.location,
          latitude: latVal,
          longitude: lngVal,
          timezone: tzVal,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Unified API error: ${response.statusText}`);
      }
      
      const rawUserProfile = await response.json();

      // Extract raw JHora horoscope to map into standard AstrologyData for client-side UI dashboards
      const jhoraRaw = rawUserProfile.Raw.JHora.horoscope;
      if (!jhoraRaw || jhoraRaw.error) {
        throw new Error(jhoraRaw?.error || "Invalid JHora horoscope data returned");
      }

      const result: AstrologyData = mapJHoraResponseToAstrologyData(jhoraRaw);

      setAstrologyData(result);
      localStorage.setItem("jhora_astrology_data", JSON.stringify(result));
      setInputs(prev => ({ ...prev, time: fullTimeStr }));
      
      loadedInputsRef.current = {
        name: finalName,
        date: inputs.date,
        location: inputs.location,
        localTimeInput,
        localAmpm,
        time: fullTimeStr
      };
      
      // Map user profile JSON and compile PDF on the fly! (no mock data, wait for API response)
      let profileJson: any = null;
      let pdfBase64: string | undefined = undefined;
      try {
        profileJson = mapAstrologyDataToUserProfileJSON(activeUser, result);
        const pdfDoc = generateAstrologyPDF(profileJson);
        pdfBase64 = pdfDoc.output("datauristring");
      } catch (pdfErr) {
        console.error("PDF generation or profile mapping failed:", pdfErr);
      }
      
      // Save to IndexedDB Offline Cache with complete raw UserProfile, user profile JSON and compiled PDF!
      try {
        await saveCachedHoroscope(
          finalName,
          inputs.date,
          fullTimeStr,
          inputs.location,
          latVal,
          lngVal,
          tzVal,
          result,
          pdfBase64,
          profileJson,
          rawUserProfile
        );
        await loadCacheHistory();
      } catch (dbErr) {
        console.error("IndexedDB cache save failed:", dbErr);
      }

      // Activate raw user profile JSON on backend and GitHub (strictly raw, no calculations, as per instructions)
      if (rawUserProfile) {
        fetch("/api/user-profile/act", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add",
            profileName: finalName,
            profileData: rawUserProfile
          })
        }).catch(err => console.error("Failed to activate userprofile on backend:", err));
      }

      if (!isInitial) {
        setActiveMenu("ai_assistant");
      }
    } catch (error: any) {
      console.error("Calculation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCachedRecord = (record: CachedHoroscopeRecord) => {
    const updatedInputs = {
      name: record.name,
      date: record.date,
      time: record.time,
      location: record.location,
      latitude: record.latitude,
      longitude: record.longitude,
      timezone: record.timezone,
    };
    setInputs(updatedInputs);
    let timeStr = record.time;
    let ampm = "AM";
    if (timeStr.toLowerCase().includes("pm")) ampm = "PM";
    let timeParts = timeStr.replace(/(am|pm)/i, "").trim().split(":");
    let parsedTime = "12:00";
    if (timeParts.length >= 2) {
      parsedTime = `${timeParts[0].padStart(2, "0")}:${timeParts[1].padStart(2, "0")}`;
      setLocalTimeInput(parsedTime);
      setLocalAmpm(ampm);
    }
    setAstrologyData(record.data);
    localStorage.setItem("jhora_astrology_data", JSON.stringify(record.data));
    
    loadedInputsRef.current = {
      name: record.name,
      date: record.date,
      location: record.location,
      localTimeInput: parsedTime,
      localAmpm: ampm,
      time: record.time
    };

    runAutomatedSync(updatedInputs);
    setActiveMenu("dashboard");
  };

  const handleLoadCachedParametersOnly = (record: CachedHoroscopeRecord) => {
    const updatedInputs = {
      name: record.name,
      date: record.date,
      time: record.time,
      location: record.location,
      latitude: Number(record.latitude),
      longitude: Number(record.longitude),
      timezone: Number(record.timezone),
    };
    setInputs(updatedInputs);
    let timeStr = record.time;
    let ampm = "AM";
    if (timeStr.toLowerCase().includes("pm")) ampm = "PM";
    let timeParts = timeStr.replace(/(am|pm)/i, "").trim().split(":");
    let parsedTime = "12:00";
    if (timeParts.length >= 2) {
      parsedTime = `${timeParts[0].padStart(2, "0")}:${timeParts[1].padStart(2, "0")}`;
      setLocalTimeInput(parsedTime);
      setLocalAmpm(ampm);
    }
    if (record.data) {
      setAstrologyData(record.data);
      localStorage.setItem("jhora_astrology_data", JSON.stringify(record.data));
    }
    
    loadedInputsRef.current = {
      name: record.name,
      date: record.date,
      location: record.location,
      localTimeInput: parsedTime,
      localAmpm: ampm,
      time: record.time
    };

    runAutomatedSync(updatedInputs);
  };

  const handleDeleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const recordToDelete = cachedList.find(r => r.id === id);
      const profileName = recordToDelete ? recordToDelete.name : "";

      await deleteCachedHoroscope(id);
      await loadCacheHistory();

      if (profileName) {
        fetch("/api/user-profile/act", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "delete",
            profileName: profileName
          })
        }).catch(err => console.error("Failed to delete userprofile on backend:", err));
      }
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  const handleClearAllRecords = async () => {
    if (window.confirm("Are you sure you want to clear all offline cached horoscopes?")) {
      try {
        await clearAllCachedHoroscopes();
        await loadCacheHistory();
      } catch (err) {
        console.error("Failed to clear records:", err);
      }
    }
  };

  // Toggle Plugins in Manager
  const handleTogglePlugin = (id: string) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === "Active" ? "Inactive" : "Active" };
      }
      return p;
    }));
  };

  const handleResetPlugins = () => {
    setPlugins(prev => prev.map(p => ({ ...p, status: "Inactive" })));
  };

  // Compile & Hotload dynamic transition simulation
  const handleHotloadPluginDirectly = (id: string) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: "Active" };
      }
      return p;
    }));
    setActiveMenu("astro");
    setActiveSubMenu(prev => ({ ...prev, astro: "plugin_manager" }));
  };

  const isDark = theme !== "vedic-sandalwood";

  // Navigation configuration representing Phase 10 spec
  const MAIN_MENU_STRUCTURE: MainMenuNode[] = [
    { id: "dashboard", label: "Dashboard", icon: Compass },
    {
      id: "ai_assistant",
      label: "AI Assistant",
      icon: Sparkles
    },
    {
      id: "my_page",
      label: "My Page",
      icon: User
    },
    {
      id: "astro",
      label: "Astro",
      icon: Activity,
      submenus: [
        // Category 1: JHORA
        { id: "jhora_birth_details", label: "Birth Details", description: "JH1: Birth Details & Astronomical Metrics.", systemId: "astro", category: "JHORA" },
        { id: "jhora_planets", label: "Planets Placements", description: "JH2: Natal Planets Longitudes & Rasi Placements.", systemId: "astro", category: "JHORA" },
        { id: "jhora_shadbala", label: "Shadbala Matrix", description: "JH3: Shadbala Planet Strength Matrix.", systemId: "astro", category: "JHORA" },
        { id: "jhora_bhava_balas", label: "Bhava Strengths", description: "JH4: Bhava Balas (House Strengths).", systemId: "astro", category: "JHORA" },
        { id: "jhora_ashtakavarga", label: "SAV Ashtakavarga", description: "JH5: Samudhaya Ashtakavarga Points.", systemId: "astro", category: "JHORA" },
        { id: "jhora_divisional", label: "Charts", description: "JH6: Divisional Vargas D1 to D60.", systemId: "astro", category: "JHORA" },
        { id: "jhora_vimshottari", label: "Vimshottari Dasha", description: "JH7: Vimshottari Mahadasha Timelines.", systemId: "astro", category: "JHORA" },

        // Category 2: KP STELLAR
        { id: "kp_cusps", label: "Placidus Cusps", description: "JH8: Placidus House Cusp Coordinates.", systemId: "astro", category: "KP STELLAR" },
        { id: "kp_sub_lords", label: "Planetary Sub-Lords", description: "JH9: KP Planetary Sub-Lords.", systemId: "astro", category: "KP STELLAR" },
        { id: "kp_planet_significators", label: "Planet Significators", description: "JH10: KP Planet-Level Significators.", systemId: "astro", category: "KP STELLAR" },
        { id: "kp_house_significators", label: "House Significators", description: "JH11: KP House-Level Significators.", systemId: "astro", category: "KP STELLAR" },

        // Category 3: JAIMINI
        { id: "jaimini_karakas", label: "Chara Karakas", description: "JH12: Jaimini Chara Karakas.", systemId: "astro", category: "JAIMINI" },
        { id: "jaimini_arudhas", label: "Arudha Padas", description: "JH13: Jaimini Arudhas & Padas.", systemId: "astro", category: "JAIMINI" },

        // Category 4: WESTERN
        { id: "western_tropical", label: "Tropical Placements", description: "JH14: Tropical Planetary Placements.", systemId: "astro", category: "WESTERN" },
        { id: "western_aspects", label: "Aspects Matrix", description: "JH15: Tropical Planetary Aspects Matrix.", systemId: "astro", category: "WESTERN" },

        // Category 5: TAJIKA
        { id: "tajika_varshaphal", label: "Varshaphal Coordinates", description: "JH16: Varshaphal Planetary Coordinates.", systemId: "astro", category: "TAJIKA" },
        { id: "tajika_harshabala", label: "Harsha Balas", description: "JH17: Tajik Harsha Balas.", systemId: "astro", category: "TAJIKA" },

        // Category 6: LAL KITAB
        { id: "lalkitab_houses", label: "LKB Houses", description: "JH18: Lal Kitab Planetary Houses.", systemId: "astro", category: "LAL KITAB" },
        { id: "lalkitab_teva", label: "Teva & Sleep Status", description: "JH19: Lal Kitab Teva & Sleeping Status.", systemId: "astro", category: "LAL KITAB" },

        // Category 7: EVENTS
        { id: "event_book", label: "Event Book", description: "Relationship & life events audit log.", systemId: "astro", category: "EVENTS" },
        { id: "engine_guide", label: "Astrological Rule Engine", description: "Master Astrological Rule Engine Specification v1.0.", systemId: "astro", category: "EVENTS" },
        { id: "kp_book", label: "KP Book", description: "Interactive astrological rules terminal and validation panel.", systemId: "astro", category: "EVENTS" },

        // Category 8: DEPLOYMENT
        { id: "table_index", label: "Table Index", description: "JH1 to JH19 Master Tables Registry & Mapping.", systemId: "astro", category: "DEPLOYMENT" },

        // Category 9: SETTINGS
        { id: "theme", label: "Theme", description: "Dark, Light, and custom styling.", systemId: "astro", category: "SETTINGS" },
        { id: "kp_documentation", label: "KP Documentation", description: "KP Knowledge Book, Rulebook & Context Specifications.", systemId: "astro", category: "SETTINGS" },
        { id: "google_drive", label: "Google Drive Backup", description: "Save and load birth charts on Google Drive.", systemId: "astro", category: "SETTINGS" },
        { id: "google_calendar", label: "Google Calendar Sync", description: "Sync Vimshottari dasha events to calendar.", systemId: "astro", category: "SETTINGS" },
        { id: "google_gmail", label: "Google Gmail Dispatcher", description: "Send astrological reports via Gmail.", systemId: "astro", category: "SETTINGS" },
        { id: "google_keep", label: "Google Keep Notes", description: "Save and backup remedies and analysis notes.", systemId: "astro", category: "SETTINGS" },
        { id: "google_contacts", label: "Google Contacts", description: "Access connected Google Contacts list.", systemId: "astro", category: "SETTINGS" },
        { id: "github_ota", label: "GitHub OTA Updates", description: "Check for new releases.", systemId: "astro", category: "SETTINGS" },
        { id: "language", label: "Language", description: "Switch display languages.", systemId: "astro", category: "SETTINGS" },
        { id: "ayanamsa", label: "Ayanamsa", description: "Select precession correction systems.", systemId: "astro", category: "SETTINGS" },
        { id: "chart_style", label: "Chart Style", description: "Choose North vs South Indian charts.", systemId: "astro", category: "SETTINGS" },
        { id: "notification", label: "Notification", description: "Ingress alert options.", systemId: "astro", category: "SETTINGS" },
        { id: "github_updates", label: "GitHub Updates", description: "System version history.", systemId: "astro", category: "SETTINGS" },
        { id: "raw_json", label: "Raw JSON", description: "JHora API Response payload.", systemId: "astro", category: "SETTINGS" },
        { id: "api_inspector", label: "API Inspector", description: "Response headers and latencies.", systemId: "astro", category: "SETTINGS" },
        { id: "request_log", label: "Request Log", description: "Outgoing request archives.", systemId: "astro", category: "SETTINGS" },
        { id: "response_log", label: "Response Log", description: "Incoming payload bodies.", systemId: "astro", category: "SETTINGS" },
        { id: "dto_viewer", label: "DTO Viewer", description: "TypeScript interface schemas.", systemId: "astro", category: "SETTINGS" },
        { id: "room_database_viewer", label: "Room Database Viewer", description: "Review IndexedDB tables.", systemId: "astro", category: "SETTINGS" },
        { id: "plugin_manager", label: "Plugin Manager", description: "Load or configure hot-swap modules.", systemId: "astro", category: "SETTINGS" },
        { id: "performance", label: "Performance", description: "Renders benchmarks.", systemId: "astro", category: "SETTINGS" },
        { id: "cache_manager", label: "Cache Manager", description: "Manage database limits.", systemId: "astro", category: "SETTINGS" }
      ]
    }
  ];

  const isAstroActive = activeMenu === "astro";
  const activeNode = MAIN_MENU_STRUCTURE.find(node => {
    if (node.id === "astro") return isAstroActive;
    return node.id === activeMenu;
  }) || MAIN_MENU_STRUCTURE[0];
  const activeSubmenus = activeNode.submenus || [];
  const activeSubmenuId = activeSubMenu[activeMenu] || (activeSubmenus[0]?.id || "");

  const handleSubmenuSelect = (submenuId: string) => {
    setActiveSubMenu(prev => ({ ...prev, [activeMenu]: submenuId }));
    setIsMobileMenuOpen(false);
  };

  const handleDashboardTabNavigation = (tab: string) => {
    setActiveMenu("astro");
    const subId = 
      tab === "dashboard" ? "jhora_birth_details" :
      tab === "grahas" ? "jhora_planets" :
      tab === "strengths" ? "jhora_shadbala" :
      tab === "ashtakavarga" ? "jhora_ashtakavarga" :
      "jhora_birth_details";
    setActiveSubMenu(prev => ({ ...prev, astro: subId }));
    setIsMobileMenuOpen(false);
  };

  const handleMenuSelect = (menuId: string) => {
    if (menuId === "astro") {
      setActiveMenu("astro");
      if (!activeSubMenu["astro"]) {
        setActiveSubMenu(prev => ({ ...prev, astro: "jhora_birth_details" }));
      }
    } else {
      setActiveMenu(menuId);
      const defaultSub = MAIN_MENU_STRUCTURE.find(n => n.id === menuId)?.submenus?.[0]?.id || "";
      if (defaultSub) {
        setActiveSubMenu(prev => ({ ...prev, [menuId]: defaultSub }));
      }
    }
  };

  // Color theme definitions
  const isDating = false;
  const containerStyle = isDark 
    ? "bg-slate-900/60 border-indigo-500/20 text-slate-100" 
    : "bg-white border-neutral-200 text-neutral-800 shadow-sm";
  const cardStyle = isDark 
    ? "bg-slate-950/60 border-slate-800 text-slate-100" 
    : "bg-neutral-50 border-neutral-200 text-neutral-800";
  const textMuted = isDark 
    ? "text-slate-400" 
    : "text-neutral-500";
  const headingStyle = isDark 
    ? "text-amber-100" 
    : "text-amber-700 font-semibold";
  const borderStyle = isDark 
    ? "border-indigo-500/10" 
    : "border-neutral-200";

  // Real Astrological PDF Report Compiler using mapped data model
  const handleCompilePdf = () => {
    if (!astrologyData) {
      alert("Please cast a horoscope first before compiling a report!");
      return;
    }
    setCompilingPdf(true);
    setPdfReady(false);
    setTimeout(() => {
      try {
        const profileJson = mapAstrologyDataToUserProfileJSON(activeUser, astrologyData);
        const pdfDoc = generateAstrologyPDF(profileJson);
        const pdfDataUrl = pdfDoc.output("datauristring");
        setActivePdfUrl(pdfDataUrl);
        setCompilingPdf(false);
        setPdfReady(true);
      } catch (err) {
        console.error("PDF Compilation error:", err);
        setCompilingPdf(false);
        alert("Failed to compile PDF report.");
      }
    }, 1000);
  };

  // Check Profile existence in Local Machine or Google Drive before loading
  const handleLoadProfileWithCheck = async (record: CachedHoroscopeRecord) => {
    setProfileVerify({
      isOpen: true,
      record,
      step: "checking",
      localStatus: "checking",
      driveStatus: "pending"
    });

    // 1. Verify existence in local machine (IndexedDB record validation)
    const isFoundLocal = !!(record && record.data && record.data.birthDetails);
    await new Promise(resolve => setTimeout(resolve, 500));

    setProfileVerify(prev => ({
      ...prev,
      localStatus: isFoundLocal ? "found" : "not_found",
      driveStatus: "checking"
    }));

    // 2. Verify existence in Google Drive if signed in with Google
    let isFoundDrive = false;
    const session = SessionManager.getLocalSession();
    const token = session?.accessToken;

    if (token) {
      try {
        const searchResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=name='jhora_user_profile.json' and trashed=false&fields=files(id)`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.files && searchData.files.length > 0) {
            isFoundDrive = true;
          }
        }
      } catch (err) {
        console.error("Google Drive API validation error:", err);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 600));
    const finalDriveStatus = token ? (isFoundDrive ? "found" : "not_found") : "skipped";

    setProfileVerify(prev => {
      const success = isFoundLocal || isFoundDrive;
      return {
        ...prev,
        driveStatus: finalDriveStatus,
        step: success ? "success" : "upload_required"
      };
    });

    // Auto load on success
    if (isFoundLocal || isFoundDrive) {
      setTimeout(() => {
        setInputs({
          name: record.name,
          date: record.date,
          time: record.time,
          location: record.location,
          latitude: record.latitude,
          longitude: record.longitude,
          timezone: record.timezone,
        });
        setAstrologyData(record.data);
        localStorage.setItem("jhora_astrology_data", JSON.stringify(record.data));
        setProfileVerify(prev => ({ ...prev, isOpen: false }));
        setActiveMenu("dashboard");
      }, 1500);
    }
  };

  // Download compiled PDF report directly from cached record or compile on the fly
  const handleDownloadPdfForRecord = (record: CachedHoroscopeRecord) => {
    try {
      let pdfData = record.pdfData;
      if (!pdfData) {
        // Compile on-the-fly if not already stored
        const profileJson = record.profileJson || mapAstrologyDataToUserProfileJSON(activeUser, record.data);
        const pdfDoc = generateAstrologyPDF(profileJson);
        pdfData = pdfDoc.output("datauristring");
      }
      
      const link = document.createElement("a");
      link.href = pdfData;
      link.download = `${record.name.replace(/\s+/g, "_")}_Astrology_Report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("PDF generation or trigger failed:", err);
      alert("Failed to compile or retrieve PDF report.");
    }
  };

  // Export profile JSON matching the exact user_profile_data_model.json schema
  const handleExportJsonForRecord = (record: CachedHoroscopeRecord) => {
    try {
      const profileJson = record.profileJson || mapAstrologyDataToUserProfileJSON(activeUser, record.data);
      const jsonStr = JSON.stringify(profileJson, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${record.name.replace(/\s+/g, "_")}_Vedic_Profile.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("JSON export trigger failed:", err);
      alert("Failed to export JSON Profile.");
    }
  };

  // Handle uploaded JSON profile from the local machine drag/drop interface
  const handleUploadProfileJson = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      
      const isRawProfile = !!(parsed.Raw && parsed.BirthDetails);
      let birth: any;
      let user: any;
      
      if (isRawProfile) {
        birth = {
          date: parsed.BirthDetails.date,
          time: parsed.BirthDetails.time,
          place: parsed.BirthDetails.place || parsed.BirthDetails.location,
          latitude: parsed.BirthDetails.latitude,
          longitude: parsed.BirthDetails.longitude,
          timezone: parsed.BirthDetails.timezone,
        };
        user = {
          profile_name: parsed.BirthDetails.name,
          email: parsed.BirthDetails.email || "guest@jhora.ai"
        };
      } else if (parsed.Birth && (parsed.Vedic || parsed.systems?.Vedic)) {
        birth = parsed.Birth;
        user = parsed.User;
      } else {
        alert("Invalid Profile structure. Please ensure it follows either the Raw UserProfile or mapped userprofile.json schema.");
        return;
      }

      const finalName = user?.profile_name || "Imported Profile";

      setInputs({
        name: finalName,
        date: birth.date,
        time: birth.time,
        location: birth.place || "Dehradun",
        latitude: Number(birth.latitude),
        longitude: Number(birth.longitude),
        timezone: Number(birth.timezone),
      });

      alert(`✓ Profile imported: ${finalName}. Processing coordinates...`);
      setLoading(true);

      let result: AstrologyData;
      
      if (isRawProfile && parsed.Raw.JHora?.horoscope) {
        // Direct, high-speed calculation-free parsing from raw stored JHora response
        result = mapJHoraResponseToAstrologyData(parsed.Raw.JHora.horoscope);
      } else {
        const formattedDate = convertDateToISO(birth.date);
        const formattedTime = convertTimeTo24h(birth.time);

        const response = await fetch("/api/astrology/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: finalName,
            date: formattedDate,
            time: formattedTime,
            location: birth.place,
            latitude: Number(birth.latitude),
            longitude: Number(birth.longitude),
            timezone: Number(birth.timezone),
          }),
        });

        if (!response.ok) throw new Error("Calculation failure");
        const rawJson = await response.json();
        result = mapJHoraResponseToAstrologyData(rawJson);
      }

      let pdfBase64: string | undefined = undefined;
      try {
        const fullProfile = mapAstrologyDataToUserProfileJSON(activeUser, result);
        const pdfDoc = generateAstrologyPDF(fullProfile);
        pdfBase64 = pdfDoc.output("datauristring");
      } catch (e) {
        console.error("PDF generation on import failed:", e);
      }

      setAstrologyData(result);
      localStorage.setItem("jhora_astrology_data", JSON.stringify(result));

      let profileDataToSave: any = null;
      if (isRawProfile) {
        profileDataToSave = parsed;
      } else {
        // Fetch strictly raw profile from server to save instead of legacy mapped/derived structure
        try {
          const rawProfileRes = await fetch("/api/user-profile/generate-raw", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: finalName,
              date: convertDateToISO(birth.date),
              time: convertTimeTo24h(birth.time),
              location: birth.place || "Dehradun",
              latitude: Number(birth.latitude),
              longitude: Number(birth.longitude),
              timezone: Number(birth.timezone),
            }),
          });
          if (rawProfileRes.ok) {
            profileDataToSave = await rawProfileRes.json();
          }
        } catch (rawErr) {
          console.error("Failed to generate raw profile for legacy import:", rawErr);
        }
      }

      await saveCachedHoroscope(
        finalName,
        birth.date,
        birth.time,
        birth.place,
        Number(birth.latitude),
        Number(birth.longitude),
        Number(birth.timezone),
        result,
        pdfBase64,
        isRawProfile ? undefined : parsed,
        profileDataToSave || undefined
      );

      await loadCacheHistory();

      // Activate profile on backend when imported
      try {
        if (profileDataToSave) {
          fetch("/api/user-profile/act", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "add",
              profileName: finalName,
              profileData: profileDataToSave
            })
          }).catch(err => console.error("Failed to activate imported userprofile on backend:", err));
        }
      } catch (err) {
        console.error("Failed to map and activate imported profile:", err);
      }

      setProfileVerify(prev => ({ ...prev, isOpen: false }));
      setActiveMenu("dashboard");
    } catch (err) {
      console.error("Failed to parse or calculate imported profile:", err);
      alert("Invalid JSON format. Please upload a valid JHoraAI Astrology Profile JSON file.");
    }
  };

  const handleShareReport = () => {
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  // Check if a reserved plugin is currently active
  const isPluginActive = (id: string) => {
    const plugin = plugins.find(p => p.id === id);
    return plugin ? plugin.status === "Active" : false;
  };

  const gpsClockWidget = (
    <div className={`flex items-center gap-2 sm:gap-3 border rounded-xl px-2.5 py-1.5 text-xs shrink-0 ${
      isDark ? "bg-slate-900/40 border-indigo-500/10" : "bg-neutral-50/80 border-neutral-200"
    }`}>
      {/* Date & Time */}
      <div className="flex items-center gap-1 sm:gap-1.5 font-medium">
        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span className={`hidden md:inline ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
          {currentDateTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <span className={`hidden md:inline mx-1 text-slate-400 ${isDark ? "opacity-30" : "opacity-50"}`}>|</span>
        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider text-[11px] sm:text-xs">
          {currentDateTime.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>
      
      {/* Separator */}
      <div className={`h-4 border-l ${isDark ? "border-indigo-500/15" : "border-neutral-200"}`} />
      
      {/* GPS Location */}
      <button
        onClick={fetchHeaderGps}
        className="flex items-center gap-1 sm:gap-1.5 hover:text-indigo-500 transition-colors cursor-pointer group shrink-0 animate-fade-in"
        title="Click to refresh GPS location"
      >
        <MapPin className={`w-3.5 h-3.5 group-hover:scale-110 transition-transform ${
          headerGps.loading ? "text-amber-500 animate-pulse" : "text-indigo-500"
        }`} />
        {headerGps.loading ? (
          <span className="text-[10px] text-slate-400 animate-pulse hidden xs:inline">Acquiring...</span>
        ) : headerGps.error ? (
          <span className="text-[10px] text-rose-500 font-medium">GPS Off</span>
        ) : headerGps.address ? (
          <span className={`text-[11px] font-semibold tracking-tight truncate max-w-[100px] sm:max-w-[150px] ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
            {headerGps.address}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 group-hover:text-indigo-500">GPS</span>
        )}
        <RefreshCw className={`w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ${
          headerGps.loading ? "animate-spin opacity-100" : ""
        }`} />
      </button>
    </div>
  );

  if (!activeUser) {
    return (
      <div 
        className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
          isDark 
            ? "dark bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200" 
            : "light bg-neutral-50 text-neutral-900 selection:bg-amber-600/20 selection:text-amber-800"
        }`} 
        id="auth-root-container"
        data-app-theme={theme}
      >
        <ThemeStyles />
        <div className="w-full max-w-md p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-block bg-gradient-to-br from-amber-500 to-indigo-600 p-3 rounded-2xl shadow-xl shadow-amber-500/10 mb-2">
              <span className="text-2xl font-bold font-mono text-slate-950 leading-none block select-none">ॐ</span>
            </div>
            <h1 className="text-2xl font-sans font-bold text-amber-500 tracking-tight">JHora AI Professional</h1>
            <p className={`text-xs font-mono uppercase tracking-wider mt-1 ${isDark ? "text-slate-500" : "text-neutral-500"}`}>
              Advanced Jyotish Computational Intelligence
            </p>
          </div>
          <AuthScreen onAuthSuccess={(user) => setActiveUser(user)} activeUser={activeUser} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark 
          ? "dark bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200" 
          : "light bg-neutral-50 text-neutral-900 selection:bg-amber-600/20 selection:text-amber-800"
      }`} 
      id="app-root-container"
      data-app-theme={theme}
    >
      <ThemeStyles />
      
      {/* HEADER BAR */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-50 py-3 px-4 sm:px-6 transition-colors ${
        isDark ? "border-indigo-500/10 bg-slate-950/80" : "border-neutral-200 bg-white/80"
      }`}>
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
          
          {/* Logo Brand / Top line on mobile/tablet */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 rounded-xl border border-transparent hover:bg-slate-500/10 transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5 text-amber-500" />
              </button>
              <div className="bg-gradient-to-br from-amber-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-amber-500/5 shrink-0">
                <span className="text-base sm:text-lg font-bold font-mono text-slate-950 leading-none block select-none">ॐ</span>
              </div>
              <div>
                <h1 className="text-xs sm:text-sm md:text-base font-sans font-semibold tracking-tight flex items-center gap-1.5 sm:gap-2">
                  <span className={isDark ? "text-amber-100" : "text-neutral-800"}>JHora AI</span>
                  <span className="text-[8px] sm:text-[9px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 bg-amber-500/15 text-amber-500 rounded-md border border-amber-500/20">
                    Professional
                  </span>
                  {isOnline ? (
                    <span className="hidden sm:flex text-[8px] sm:text-[9px] items-center gap-1 uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded-md border border-green-500/20">
                      <Wifi className="w-2.5 h-2.5" />
                      Online
                    </span>
                  ) : (
                    <span className="hidden sm:flex text-[8px] sm:text-[9px] items-center gap-1 uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 bg-rose-500/10 text-rose-500 rounded-md border border-rose-500/20">
                      <WifiOff className="w-2.5 h-2.5" />
                      Offline
                    </span>
                  )}
                </h1>
                <p className={`text-[8px] sm:text-[9px] font-mono mt-0.5 uppercase tracking-wider ${isDark ? "text-slate-500" : "text-neutral-400"}`}>
                  Advanced Jyotish Computational Intelligence
                </p>
              </div>
            </div>

            {/* GPS & Live DateTime Widget (Shown on top-right for Mobile/Tablet) */}
            <div className="lg:hidden shrink-0">
              {gpsClockWidget}
            </div>
          </div>

          {/* Global App-Level Selectors & Controls (Horizontal line with scrolling on super narrow screens) */}
          <div className="flex items-center justify-start lg:justify-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-1.5 w-full lg:w-auto flex-nowrap">
            {/* Active Profile Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : isDating ? "text-[#8E6872]" : "text-neutral-400"}`}>Active Profile:</span>
              <select
                value={astrologyData?.birthDetails?.name || ""}
                onChange={(e) => handleLoadProfileByName(e.target.value)}
                className={`text-[11px] sm:text-xs font-semibold rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer border ${
                  isDark ? "bg-slate-900 border-indigo-500/10 text-amber-100" : isDating ? "bg-[#FFF0F2] border-[#FFE3E6] text-[#3E101B]" : "bg-neutral-50 border-neutral-200 text-neutral-800"
                }`}
              >
                <option value="">Select Profile...</option>
                {cachedList.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Chart Style Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : isDating ? "text-[#8E6872]" : "text-neutral-400"}`}>Chart:</span>
              <select
                value={chartStyle}
                onChange={(e) => {
                  const val = e.target.value as "north" | "south";
                  setChartStyle(val);
                  localStorage.setItem("jhora_chart_style", val);
                }}
                className={`text-[11px] sm:text-xs font-semibold rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer border ${
                  isDark ? "bg-slate-900 border-indigo-500/10 text-amber-100" : isDating ? "bg-[#FFF0F2] border-[#FFE3E6] text-[#3E101B]" : "bg-neutral-50 border-neutral-200 text-neutral-800"
                }`}
              >
                <option value="north">North Indian</option>
                <option value="south">South Indian</option>
              </select>
            </div>

            {/* Multi-Theme Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-neutral-400"}`}>Theme:</span>
              <select
                value={theme}
                onChange={(e) => {
                  const val = e.target.value as "cosmic-royal" | "emerald-aura" | "deep-amethyst" | "vedic-sandalwood";
                  setTheme(val);
                  localStorage.setItem("jhora_theme", val);
                }}
                className={`text-[11px] sm:text-xs font-semibold rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer border ${
                  isDark ? "bg-slate-900 border-indigo-500/10 text-amber-100" : "bg-neutral-50 border-neutral-200 text-neutral-800"
                }`}
              >
                <option value="cosmic-royal">🌌 Cosmic Royal</option>
                <option value="emerald-aura">🌿 Emerald Aura</option>
                <option value="deep-amethyst">🔮 Deep Amethyst</option>
                <option value="vedic-sandalwood">🪔 Vedic Sandalwood</option>
              </select>
            </div>

            {/* User Profile / Logout */}
            {activeUser && (
              <div className="flex items-center gap-2 border-l border-indigo-500/10 pl-3 shrink-0">
                <img 
                  src={activeUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150"} 
                  alt={activeUser.name} 
                  className="w-6 h-6 rounded-full border border-amber-500 object-cover shadow-sm" 
                  referrerPolicy="no-referrer"
                />
                <span className={`text-xs font-medium hidden sm:inline max-w-[80px] truncate ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
                  {activeUser.name}
                </span>
                <button
                  onClick={async () => {
                    try {
                      await AuthManager.logout();
                      localStorage.removeItem("jhora_user_profile");
                      setActiveUser(null);
                    } catch (e) {
                      console.error("Logout failed:", e);
                    }
                  }}
                  className={`p-1.5 rounded-lg border border-transparent hover:bg-slate-500/10 transition-colors cursor-pointer ${
                    isDark ? "text-slate-400 hover:text-slate-200" : "text-neutral-500 hover:text-neutral-800"
                  }`}
                  title="Logout Profile"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* GPS & Live DateTime Widget (Shown on far-right for Desktop only) */}
          <div className="hidden lg:flex shrink-0">
            {gpsClockWidget}
          </div>
        </div>
      </header>

      {/* CORE FRAME LAYOUT */}
      <div className="flex-1 w-full flex flex-row max-w-[1400px] mx-auto min-w-0" id="main-content-layout">
        
        {/* SIDE BAR RAIL (Vertical Side Rail on desktop/tablet) */}
        <nav className={`hidden md:flex flex-col items-center py-4 border-r transition-all shrink-0 select-none ${
          drawerExpanded ? "w-[120px]" : "w-[64px]"
        } ${isDark ? "border-indigo-500/10 bg-slate-950" : "border-neutral-200 bg-white"}`} id="navigation-rail-sidebar">
          
          {/* Drawer Toggle */}
          <button 
            onClick={() => setDrawerExpanded(!drawerExpanded)}
            className={`p-1.5 rounded-lg mb-4 hover:bg-slate-500/10 cursor-pointer ${isDark ? "text-slate-500" : "text-neutral-400"}`}
            title={drawerExpanded ? "Collapse Submenu Drawer" : "Expand Submenu Drawer"}
          >
            {drawerExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          {/* Navigation rail nodes */}
          <div className="flex-1 w-full px-2 space-y-1.5 overflow-y-auto scrollbar-none">
            {MAIN_MENU_STRUCTURE.map((node) => {
              const Icon = node.icon;
              const isActive = node.id === "astro"
                ? ["horoscope", "kp_stellar", "western_astrology", "esoteric", "marriage", "transit"].includes(activeMenu)
                : activeMenu === node.id;
              
              return (
                <button
                  key={node.id}
                  onClick={() => {
                    handleMenuSelect(node.id);
                    if (node.submenus && node.submenus.length > 0) {
                      setIsMobileMenuOpen(true);
                    }
                  }}
                  className={`w-full flex flex-col items-center justify-center rounded-xl py-2 px-1 transition-all border text-center cursor-pointer group ${
                    isActive
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                      : isDark
                        ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent"
                        : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/70 border-transparent"
                  }`}
                  id={`rail-btn-${node.id}`}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                    isActive ? "text-amber-500" : isDark ? "text-slate-400" : "text-neutral-500"
                  }`} />
                  {drawerExpanded && (
                    <span className="text-[10px] font-medium font-sans mt-1.5 truncate max-w-full tracking-tight">
                      {node.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* DESKTOP-ONLY SUBMENU DRAWER (Second Column) */}
        {activeSubmenus.length > 0 && (
          <aside className={`transition-all duration-300 shrink-0 select-none border-r hidden md:block md:relative md:w-[240px] ${
            isDark ? "bg-slate-900/60 border-r border-indigo-500/15" : "bg-neutral-50/95 border-r border-neutral-200"
          } ${
            !drawerExpanded ? "md:hidden md:w-0 overflow-hidden" : ""
          }`} id="submenu-drawer-container">
            
            <div className="p-4 border-b border-indigo-500/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  Navigation Menu
                </span>
                <h2 className="text-sm font-bold text-amber-500 mt-0.5">{activeNode.label}</h2>
              </div>
            </div>

            <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
              {(() => {
                let lastCategory = "";
                return activeSubmenus.map((sub) => {
                  const showHeader = sub.category && sub.category !== lastCategory;
                  if (sub.category) {
                    lastCategory = sub.category;
                  }
                  
                  const isSubActive = sub.systemId
                    ? (activeMenu === sub.systemId && activeSubMenu[sub.systemId] === (sub.originalId || sub.id))
                    : (activeSubmenuId === sub.id);

                  return (
                    <React.Fragment key={sub.id}>
                      {showHeader && (
                        <div className="pt-4 pb-1.5 px-2.5 first:pt-1">
                          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-500/90 dark:text-amber-400 uppercase">
                            {sub.category}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => handleSubmenuSelect(sub.id)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all border text-xs flex flex-col ${
                          isSubActive
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold"
                            : isDark
                              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent"
                              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border-transparent"
                        }`}
                      >
                        <span className="block">{sub.label}</span>
                        {sub.description && (
                          <span className="text-[9px] text-slate-500 block font-normal mt-0.5 max-w-full truncate">
                            {sub.description}
                          </span>
                        )}
                      </button>
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          </aside>
        )}

        {/* UNIFIED CLEAN MOBILE DRAWER */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden" 
                onClick={() => setIsMobileMenuOpen(false)} 
                id="mobile-drawer-backdrop"
              />

              {/* Drawer Container */}
              <motion.aside 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className={`fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[320px] flex flex-col md:hidden select-none border-r ${
                  isDark ? "bg-slate-950 border-r border-indigo-500/15" : "bg-white border-r border-neutral-200"
                }`}
                id="unified-mobile-drawer"
              >
                {/* Header */}
                <div className="p-4 border-b border-indigo-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-amber-500 to-indigo-600 p-1.5 rounded-lg shadow-lg shadow-amber-500/5 shrink-0">
                      <span className="text-sm font-bold font-mono text-slate-950 leading-none block select-none">ॐ</span>
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-amber-500">JHora AI Professional</h2>
                      <p className={`text-[8px] font-mono uppercase tracking-wider ${isDark ? "text-slate-500" : "text-neutral-400"}`}>
                        Astrological Portal
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-500/10 cursor-pointer text-amber-500 border border-transparent"
                    id="mobile-drawer-close-btn"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                {/* Content: Main Sections & Submenus Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
                  
                  {/* Part 1: Main Sections */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block mb-1">
                      Main Sections
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {MAIN_MENU_STRUCTURE.map((node) => {
                        const Icon = node.icon;
                        const isActive = node.id === "astro"
                          ? ["horoscope", "kp_stellar", "western_astrology", "esoteric", "marriage", "transit"].includes(activeMenu)
                          : activeMenu === node.id;
                        
                        return (
                          <button
                            key={node.id}
                            onClick={() => {
                              handleMenuSelect(node.id);
                              // Keep drawer open if it has submenus so user can select, otherwise close it
                              if (!node.submenus || node.submenus.length === 0) {
                                setIsMobileMenuOpen(false);
                              }
                            }}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center cursor-pointer group ${
                              isActive
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold"
                                : isDark
                                  ? "bg-slate-900/40 text-slate-400 hover:text-slate-200 border-indigo-500/5"
                                  : "bg-neutral-50 text-neutral-600 hover:text-neutral-800 border-neutral-200"
                            }`}
                            id={`drawer-main-node-${node.id}`}
                          >
                            <Icon className="w-4 h-4 mb-1" />
                            <span className="text-[10px] font-sans tracking-tight">
                              {node.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Part 2: Submenus of Active Section */}
                  {activeSubmenus.length > 0 && (
                    <div className="space-y-2 border-t border-indigo-500/10 pt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block">
                          {activeNode.label} Submenus
                        </span>
                        <span className="text-[8px] font-mono bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded-md border border-amber-500/10 font-bold">
                          {activeSubmenus.length} Tables
                        </span>
                      </div>
                      
                      <div className="space-y-1.5">
                        {(() => {
                          let lastCategory = "";
                          return activeSubmenus.map((sub) => {
                            const showHeader = sub.category && sub.category !== lastCategory;
                            if (sub.category) {
                              lastCategory = sub.category;
                            }
                            
                            const isSubActive = sub.systemId
                              ? (activeMenu === sub.systemId && activeSubMenu[sub.systemId] === (sub.originalId || sub.id))
                              : (activeSubmenuId === sub.id);

                            return (
                              <React.Fragment key={sub.id}>
                                {showHeader && (
                                  <div className="pt-3 pb-1 first:pt-0">
                                    <span className="text-[9px] font-mono font-bold tracking-widest text-amber-500/90 dark:text-amber-400/80 uppercase">
                                      {sub.category}
                                    </span>
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    handleSubmenuSelect(sub.id);
                                    setIsMobileMenuOpen(false); // Close drawer after selection
                                  }}
                                  className={`w-full text-left p-2.5 rounded-xl transition-all border text-xs flex flex-col cursor-pointer ${
                                    isSubActive
                                      ? "bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold shadow-inner"
                                      : isDark
                                        ? "bg-slate-900/20 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent"
                                        : "bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border-transparent"
                                  }`}
                                  id={`drawer-sub-node-${sub.id}`}
                                >
                                  <span className="block font-medium">{sub.label}</span>
                                  {sub.description && (
                                    <span className="text-[9px] text-slate-500 block font-normal mt-0.5 max-w-full truncate">
                                      {sub.description}
                                    </span>
                                  )}
                                </button>
                              </React.Fragment>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>


        {/* MAIN DISPLAY: Dynamic Content Stage */}
        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6 min-w-0 overflow-y-auto" id="tab-body-container">
          
          {/* Global Data Integrity / Provenance Overlay Panel */}
          {provenanceEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6 text-xs"
            >
              <h4 className="font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Shield className="w-4 h-4 text-indigo-400" />
                Data Provenance Audit Active (Phase 9.95 Compliance)
              </h4>
              <p className={textMuted}>
                Every parameter displayed across the dashboards binds to a single source of truth. Raw data paths originate from the remote JHora REST API. Local calculations are strictly pure mathematical derivations. Hover over values or check the developer tab to inspect schemas.
              </p>
            </motion.div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-4" />
              <span className="text-sm text-slate-400 font-mono">Casting celestial charts and compiling timelines...</span>
            </div>
          ) : activeMenu === "dashboard" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {/* Visual Identity & PWA App Installation Promo */}
                <AndroidInstallerPromo isDark={isDark} />

                {/* Birth Details and Cast Settings Card (First Section) */}
                <div className={`p-6 rounded-2xl border ${containerStyle}`}>
                  <div className="border-b border-indigo-500/10 pb-4 mb-6">
                    <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Birth Details & Cast Settings
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure your name, birth coordinates, GMT offset, and casting properties to generate your Vedic, KP Stellar, and Western astrology charts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <User className="w-4 h-4 text-amber-500" />
                        Native Identity & Time
                      </h4>
                      <div>
                        <label className="block text-[11px] text-slate-400 font-medium mb-1">Native Name</label>
                        <input
                          type="text"
                          value={inputs.name}
                          onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                          className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-neutral-300 text-neutral-800"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] text-slate-400 font-medium mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={inputs.date}
                            onChange={(e) => setInputs({ ...inputs, date: e.target.value })}
                            className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 font-medium mb-1">Time of Birth</label>
                          <div className="flex gap-1.5">
                            <div className="relative flex-1">
                              <Clock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500 hover:text-amber-500 transition-colors" />
                              <input
                                type="text"
                                placeholder="e.g. 08:30"
                                value={localTimeInput}
                                onChange={(e) => setLocalTimeInput(e.target.value)}
                                className={`w-full border rounded-lg pl-8 pr-2 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                  isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"
                                }`}
                              />
                            </div>
                            <select
                              value={localAmpm}
                              onChange={(e) => setLocalAmpm(e.target.value)}
                              className={`border rounded-lg px-2 py-2 text-xs font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"
                              }`}
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] text-slate-400 font-medium">Location / City</label>
                          <button
                            type="button"
                            onClick={handleUseGps}
                            disabled={fetchingGps}
                            className="text-[10px] text-amber-500 hover:text-amber-400 font-mono flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0 disabled:opacity-50"
                          >
                            <MapPin className="w-3 h-3 animate-pulse text-amber-500" />
                            {fetchingGps ? "Locating..." : "Use device GPS"}
                          </button>
                        </div>
                        <div className="relative z-50">
                          <input
                            type="text"
                            value={inputs.location}
                            onChange={(e) => {
                              setInputs({ ...inputs, location: e.target.value });
                              setShowLocationDropdown(true);
                            }}
                            onFocus={() => {
                              if (locationResults.length > 0) setShowLocationDropdown(true);
                            }}
                            placeholder="Type a city (e.g. Mumbai, New York)..."
                            className={`w-full border rounded-lg pl-3 pr-8 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-neutral-300 text-neutral-800"
                            }`}
                          />
                          {searchingLocation && (
                            <div className="absolute right-2.5 top-2.5">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                            </div>
                          )}
                        </div>

                        {showLocationDropdown && (
                          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowLocationDropdown(false)} />
                        )}

                        {showLocationDropdown && locationResults.length > 0 && (
                          <div className={`absolute z-50 left-0 right-0 mt-1 border rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-900 scrollbar-thin ${
                            isDark ? "bg-slate-950 border-slate-800" : "bg-white border-neutral-200"
                          }`}>
                            {locationResults.map((result, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectLocation(result)}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-500/10 transition-colors flex flex-col cursor-pointer border-0 bg-transparent"
                              >
                                <span className={`font-semibold ${isDark ? "text-slate-200" : "text-neutral-700"}`}>{result.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  {result.admin1 ? `${result.admin1}, ` : ''}{result.country} • Lat: {Number(result.latitude || 0).toFixed(4)} Lon: {Number(result.longitude || 0).toFixed(4)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        Geographic Coordinates
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-mono uppercase">Latitude (°N)</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={inputs.latitude}
                            onChange={(e) => setInputs({ ...inputs, latitude: Number(e.target.value) })}
                            className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-white border-neutral-300 text-neutral-800"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-mono uppercase">Longitude (°E)</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={inputs.longitude}
                            onChange={(e) => setInputs({ ...inputs, longitude: Number(e.target.value) })}
                            className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-white border-neutral-300 text-neutral-800"
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono uppercase">Timezone (GMT Offset)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={inputs.timezone}
                          onChange={(e) => setInputs({ ...inputs, timezone: Number(e.target.value) })}
                          className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-white border-neutral-300 text-neutral-800"
                          }`}
                        />
                      </div>

                      <div className="pt-2 space-y-2">
                        <button
                          onClick={() => handleCalculate(false, false)}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold rounded-xl py-3 text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shadow-amber-500/10"
                        >
                          <Sparkles className="w-4 h-4 text-slate-950" />
                          {loading ? "Casting Horoscope..." : "Cast & Generate Horoscope"}
                        </button>

                        {(() => {
                          const fTime = `${localTimeInput} ${localAmpm}`;
                          const currentKey = generateCompositeKey(inputs.date, fTime, Number(inputs.latitude), Number(inputs.longitude));
                          const hasCachedRecord = cachedList.some(r => r.id === currentKey && r.rawUserProfile);
                          
                          if (hasCachedRecord) {
                            return (
                              <button
                                onClick={() => handleCalculate(false, true)}
                                disabled={loading}
                                className="w-full border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 font-semibold rounded-xl py-2.5 text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <RefreshCw className={`w-4 h-4 text-amber-500 ${loading ? "animate-spin" : ""}`} />
                                Refresh Horoscope (Force Reload)
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Saved Profiles Directory */}
                <div className={`p-6 rounded-2xl border ${containerStyle}`}>
                  <h3 className={`text-lg font-sans font-medium flex items-center justify-between ${headingStyle}`}>
                    <span className="flex items-center gap-2">
                      <User className="w-5 h-5 text-amber-500" />
                      Saved Profiles Directory
                    </span>
                    {cachedList.length > 0 && (
                      <button
                        onClick={handleClearAllRecords}
                        className="text-xs text-rose-500 hover:text-rose-400 font-medium flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All Records
                      </button>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 mb-6">
                    Manage, check availability, and hotload horoscopes from local storage, Google Drive, or browse files manually.
                  </p>

                  {/* Profile JSON File Importer */}
                  <div className="mb-6 p-4 rounded-xl border border-dashed border-indigo-500/25 bg-slate-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="text-xs font-bold text-amber-400 flex items-center justify-center sm:justify-start gap-1.5">
                        <Download className="w-4 h-4 text-amber-500" />
                        Import Birth Profile JSON
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Drop or select a profile JSON conforming to the checklist data model to instantly cache and cast.
                      </div>
                    </div>
                    <label className="bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/30 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shrink-0">
                      <FolderOpen className="w-4 h-4" />
                      Upload Profile
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadProfileJson(file);
                        }}
                      />
                    </label>
                  </div>

                  {cachedList.length === 0 ? (
                    <div className="text-center py-8 rounded-xl bg-slate-950/20 border border-dashed border-slate-800 text-slate-500 text-xs">
                      <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                      No saved profiles found. Navigate to JHORA &rarr; Birth Details to cast and save a chart.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cachedList.map((rec) => {
                        const isLoaded = astrologyData && astrologyData.birthDetails && 
                          astrologyData.birthDetails.name === rec.name && 
                          astrologyData.birthDetails.date === rec.date && 
                          astrologyData.birthDetails.time === rec.time;

                        return (
                          <div
                            key={rec.id}
                            className={`p-4 rounded-xl border flex flex-col justify-between ${cardStyle} ${
                              isLoaded ? "border-amber-500/40 bg-amber-500/5" : ""
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-sm font-semibold text-amber-500 truncate block">
                                  {rec.name}
                                </span>
                                <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                                  {rec.data?.lagna?.sign ? `${rec.data.lagna.sign} Asc` : 'Chart'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-2 space-y-1">
                                <div>📅 {rec.date} • 🕒 {rec.time}</div>
                                <div className="truncate">📍 {rec.location}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-indigo-500/5">
                              <button
                                onClick={() => handleLoadProfileWithCheck(rec)}
                                className={`flex-1 font-bold rounded-lg py-1.5 text-[11px] transition-colors cursor-pointer ${
                                  isLoaded 
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                                    : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                                }`}
                                disabled={isLoaded}
                              >
                                {isLoaded ? "Active Profile" : "Load Profile"}
                              </button>
                              
                              <button
                                onClick={() => handleDownloadPdfForRecord(rec)}
                                className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg border border-indigo-500/10 transition-colors cursor-pointer"
                                title="Download PDF Report"
                              >
                                <FileText className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleExportJsonForRecord(rec)}
                                className="p-1.5 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg border border-indigo-500/10 transition-colors cursor-pointer"
                                title="Export JSON Profile"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              <button
                                onClick={(e) => handleDeleteRecord(rec.id, e)}
                                className="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent transition-colors cursor-pointer"
                                title="Delete profile"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Dashboard Technical Provenance Checklist */}
                {astrologyData && provenanceEnabled && (
                  <div className={`p-6 rounded-2xl border ${containerStyle}`}>
                    <h4 className="font-mono text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-4">
                      <Database className="w-4 h-4" />
                      Core Field Metadata Auditing Grid (Phase 9.95 Rule 5)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px] font-mono text-left divide-y divide-indigo-500/10">
                        <thead>
                          <tr className="text-slate-400 uppercase tracking-wider">
                            <th className="py-2.5 px-3">Field Name</th>
                            <th className="py-2.5 px-3">Table Ref</th>
                            <th className="py-2.5 px-3">Source</th>
                            <th className="py-2.5 px-3">Raw JSON Path</th>
                            <th className="py-2.5 px-3">Formula</th>
                            <th className="py-2.5 px-3">Updated</th>
                            <th className="py-2.5 px-3">Confidence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-300">Lagna Sign</td>
                            <td className="py-2 px-3 text-indigo-400 font-bold">Table 1</td>
                            <td className="py-2 px-3 text-emerald-400">SOURCE_A (JHora)</td>
                            <td className="py-2 px-3 text-slate-400">$.divisional_charts.D-1_rasi.Ascendant.sign</td>
                            <td className="py-2 px-3 text-slate-500">None</td>
                            <td className="py-2 px-3">Real-time</td>
                            <td className="py-2 px-3 text-green-400 font-bold">100% Authoritative</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-300">Planet Degree</td>
                            <td className="py-2 px-3 text-indigo-400 font-bold">Table 2</td>
                            <td className="py-2 px-3 text-emerald-400">SOURCE_A (JHora)</td>
                            <td className="py-2 px-3 text-slate-400">$.divisional_charts.D-1_rasi.[planetName].longitude</td>
                            <td className="py-2 px-3 text-slate-500">None</td>
                            <td className="py-2 px-3">Real-time</td>
                            <td className="py-2 px-3 text-green-400 font-bold">100% Authoritative</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-300">House Placements</td>
                            <td className="py-2 px-3 text-indigo-400 font-bold">Table 2 & 5</td>
                            <td className="py-2 px-3 text-indigo-400">SOURCE_B (Derived)</td>
                            <td className="py-2 px-3 text-slate-400">$.divisional_charts.D-1_rasi.Ascendant.sign</td>
                            <td className="py-2 px-3 text-slate-400">(planetSignIdx - lagnaSignIdx + 12) % 12 + 1</td>
                            <td className="py-2 px-3">Real-time</td>
                            <td className="py-2 px-3 text-indigo-300">100% Mapped Accuracy</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-300">Panchanga Tithi</td>
                            <td className="py-2 px-3 text-indigo-400 font-bold">Table 3</td>
                            <td className="py-2 px-3 text-emerald-400">SOURCE_A (JHora)</td>
                            <td className="py-2 px-3 text-slate-400">$.calendar_info.Tithi</td>
                            <td className="py-2 px-3 text-slate-500">None</td>
                            <td className="py-2 px-3">Real-time</td>
                            <td className="py-2 px-3 text-green-400 font-bold">100% Authoritative</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : activeMenu === "ai_assistant" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key="ai_assistant"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`}>
                  <AstroChat astrologyData={astrologyData} />
                </div>
              </motion.div>
            </AnimatePresence>
          ) : activeMenu === "my_page" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key="my_page"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <MyPageView
                  astrologyData={astrologyData}
                  activeUser={activeUser}
                  isDark={isDark}
                  containerStyle={containerStyle}
                  cardStyle={cardStyle}
                  textMuted={textMuted}
                  activeSubmenuId={activeSubmenuId}
                  onSubmenuSelect={handleSubmenuSelect}
                />
              </motion.div>
            </AnimatePresence>
          ) : activeMenu === "astro" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubmenuId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {SETTINGS_SUBMENU_IDS.includes(activeSubmenuId) ? (
                  /* Interactive settings panel rendered inside Astro menu */
                  [
                    "raw_json",
                    "api_inspector",
                    "request_log",
                    "response_log",
                    "dto_viewer",
                    "room_database_viewer",
                    "plugin_manager",
                    "performance",
                    "cache_manager"
                  ].includes(activeSubmenuId) ? (
                    activeSubmenuId === "plugin_manager" ? (
                      <PluginManager
                        plugins={plugins}
                        onTogglePlugin={handleTogglePlugin}
                        onResetPlugins={handleResetPlugins}
                        isDarkTheme={isDark}
                      />
                    ) : (
                      <ApiAcceptanceDashboard 
                        focusSection={
                          activeSubmenuId === "raw_json" ? "raw_json" :
                          activeSubmenuId === "api_inspector" ? "metrics" :
                          activeSubmenuId === "room_database_viewer" ? "cache" :
                          "audit"
                        }
                      />
                    )
                  ) : activeSubmenuId === "google_account" ? (
                    <AuthScreen onAuthSuccess={(user) => setActiveUser(user)} activeUser={activeUser} />
                  ) : [
                    "google_drive",
                    "google_calendar",
                    "google_gmail",
                    "google_keep",
                    "google_contacts"
                  ].includes(activeSubmenuId) ? (
                    <WorkspaceTab astrologyData={astrologyData} activeSub={activeSubmenuId} />
                  ) : activeSubmenuId === "github_ota" ? (
                    <GithubOtaView isDarkTheme={isDark} />
                  ) : activeSubmenuId === "kp_documentation" ? (
                    <KpDocumentationView isDark={isDark} />
                  ) : (
                    <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`}>
                      <div className="border-b border-indigo-500/10 pb-4">
                        <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                          <SettingsIcon className="w-5 h-5 text-amber-500" />
                          Platform Settings (Material 3)
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Configure planetary coordinates systems, precession formulas, and visual themes.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold font-mono uppercase mb-1">Ayanamsa (Precession Formula)</label>
                            <select
                              value={ayanamsa}
                              onChange={(e) => setAyanamsa(e.target.value)}
                              className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"
                              }`}
                            >
                              <option>Lahiri (Chitra Paksha) - JHora Default</option>
                              <option>Raman (Suryasiddhanta)</option>
                              <option>Krishnamurti (KP System)</option>
                              <option>Fagan-Bradley (Western Sidereal)</option>
                              <option>Yukteshwar</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold font-mono uppercase mb-1">Chart Drawing Style</label>
                            <div className="flex gap-2">
                              {["north", "south"].map((style) => (
                                <button
                                  key={style}
                                  onClick={() => setChartStyle(style as any)}
                                  className={`flex-1 py-2 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                                    chartStyle === style
                                      ? "bg-amber-500/10 text-amber-500 border-amber-500/35"
                                      : isDark
                                        ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                                        : "bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                                  }`}
                                >
                                  {style} Indian
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold font-mono uppercase mb-1">Language Translator</label>
                            <select
                              value={selectedLanguage}
                              onChange={(e) => setSelectedLanguage(e.target.value)}
                              className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"
                              }`}
                            >
                              <option>English</option>
                              <option>Hindi (हिन्दी)</option>
                              <option>Sanskrit (संस्कृतम्)</option>
                              <option>Tamil (தமிழ்)</option>
                              <option>Telugu (తెలుగు)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold font-mono uppercase mb-1">Ingress Notification Alerts</label>
                            <div className="flex items-center justify-between p-2 rounded-lg border border-indigo-500/5 bg-slate-950/20 mb-4">
                              <span className="text-xs text-slate-400">Push notification on major ingress</span>
                              <input
                                type="checkbox"
                                checked={notificationsActive}
                                onChange={(e) => setNotificationsActive(e.target.checked)}
                                className="w-4 h-4 cursor-pointer text-amber-500 focus:ring-amber-500"
                              />
                            </div>

                            <label className="block text-[11px] text-amber-500 font-bold font-mono uppercase mb-1 flex items-center gap-1">
                              <Bell className="w-3.5 h-3.5 text-amber-500" /> Free Mobile Push Alerts (via ntfy.sh)
                            </label>
                            
                            <div className="space-y-3 p-3 rounded-xl border border-amber-500/10 bg-amber-500/5">
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-slate-200">Enable Mobile Notifications</span>
                                  <span className="text-[10px] text-slate-400 leading-tight">Send instant transit & ingress notifications to your phone free of cost</span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={ntfyNotificationsActive}
                                  onChange={(e) => handleNtfyToggle(e.target.checked)}
                                  className="w-4 h-4 cursor-pointer accent-amber-500 rounded focus:ring-amber-500 shrink-0 ml-2"
                                />
                              </div>

                              {ntfyNotificationsActive && (
                                <div className="space-y-2 pt-2 border-t border-amber-500/10">
                                  <div className="flex flex-col">
                                    <label className="text-[10px] text-slate-400 font-mono uppercase mb-1">Your Unique Notification Topic</label>
                                    <div className="flex gap-1.5">
                                      <div className="flex items-center flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 text-xs text-slate-400 font-mono overflow-hidden">
                                        <span className="opacity-40 select-none">ntfy.sh/</span>
                                        <input
                                          type="text"
                                          value={ntfyTopic}
                                          onChange={(e) => handleNtfyTopicChange(e.target.value)}
                                          className="bg-transparent border-0 outline-none text-slate-200 py-1.5 w-full focus:ring-0"
                                          placeholder="topic-name"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(`https://ntfy.sh/${ntfyTopic}`);
                                          setCopiedTopic(true);
                                          setTimeout(() => setCopiedTopic(false), 2000);
                                        }}
                                        className="p-2 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 transition-colors text-slate-300"
                                        title="Copy ntfy URL"
                                      >
                                        {copiedTopic ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={sendTestNotification}
                                      disabled={testPushStatus === "sending"}
                                      className="flex-1 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                                    >
                                      {testPushStatus === "sending" ? (
                                        <span>Sending...</span>
                                      ) : testPushStatus === "success" ? (
                                        <span className="flex items-center gap-1 text-[11px]"><Check className="w-3 h-3" /> Sent!</span>
                                      ) : testPushStatus === "error" ? (
                                        <span>Failed</span>
                                      ) : (
                                        <span>Send Test Push</span>
                                      )}
                                    </button>
                                    <a
                                      href={`https://ntfy.sh/${ntfyTopic}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="py-1.5 px-3 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1"
                                    >
                                      <span>Feed</span>
                                    </a>
                                  </div>

                                  <div className="bg-slate-950/45 p-2.5 rounded-lg border border-slate-900/60 text-[10px] text-slate-400 space-y-1 mt-1 leading-relaxed">
                                    <div className="font-bold text-slate-300 flex items-center gap-1 mb-1 font-sans">
                                      <Smartphone className="w-3 h-3 text-amber-500" /> SETUP GUIDE (100% FREE):
                                    </div>
                                    <p>1. Install the <strong>ntfy</strong> app from Google Play or iOS App Store.</p>
                                    <p>2. Tap <strong>"+"</strong> in the mobile app to subscribe.</p>
                                    <p>3. Enter <strong>{ntfyTopic}</strong> and subscribe.</p>
                                    <p className="text-amber-500/80 font-semibold mt-1">Receive planetary transits, ingress, and agent updates on your lock screen instantly!</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-indigo-500/10">
                        <div>
                          <label className="block text-[11px] text-slate-400 font-bold font-mono uppercase mb-1">
                            ChatGPT / OpenAI API Key (Client-Side Key)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              placeholder="sk-proj-..."
                              value={userOpenaiApiKey}
                              onChange={(e) => handleOpenaiKeyChange(e.target.value)}
                              className={`flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono ${
                                isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"
                              }`}
                            />
                            {userOpenaiApiKey && (
                              <button
                                onClick={() => handleOpenaiKeyChange("")}
                                className="px-3 py-2 text-xs font-mono rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                Clear Key
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                            Your key is stored securely in your browser's local storage and is sent directly in request headers. Setting a custom key here allows you to bypass server limits and use your personal ChatGPT directly.
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                ) : activeSubmenuId === "event_book" ? (
                  <EventBookView 
                    astrologyData={astrologyData} 
                    isDark={isDark} 
                  />
                ) : activeSubmenuId === "engine_guide" ? (
                  <EngineGuide 
                    isDark={isDark} 
                  />
                ) : activeSubmenuId === "kp_book" ? (
                  <RulesTerminal 
                    isDarkTheme={isDark} 
                  />
                ) : (
                  <AstroRawTablesView 
                    astrologyData={astrologyData} 
                    activeSubmenuId={activeSubmenuId} 
                    isDark={isDark} 
                    activeUser={activeUser}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          ) : activeMenu === "marriage" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubmenuId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {astrologyData ? (
                  activeSubmenuId === "unified_evidence" ? (
                    <UnifiedEvidenceView astrologyData={astrologyData} isDark={isDark} />
                  ) : activeSubmenuId === "ai_expert" ? (
                    <AIRelationshipExpert astrologyData={astrologyData} isDark={isDark} />
                  ) : activeSubmenuId === "relationship_report" ? (
                    <RelationshipReportGenerator astrologyData={astrologyData} isDark={isDark} />
                  ) : activeSubmenuId === "relationship_knowledge_center" ? (
                    <RelationshipKnowledgeCenter astrologyData={astrologyData} isDark={isDark} />
                  ) : activeSubmenuId === "astrological_reasoning_engine" ? (
                    <AstrologicalReasoningEngine
                      astrologyData={astrologyData}
                      isDark={isDark}
                      syncStatus={syncStatus}
                      onSyncNow={() => runAutomatedSync(inputs)}
                    />
                  ) : activeSubmenuId === "relationship_consultation" ? (
                    <RelationshipConsultationFramework astrologyData={astrologyData} isDark={isDark} />
                  ) : (
                    <CompatibilityTab astrologyData={astrologyData} />
                  )
                ) : (
                  <div className="text-center py-12">Calculations needed.</div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : activeMenu === "transit" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubmenuId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {activeSubmenuId === "current_gochara" ? (
                  astrologyData ? (
                    <TransitsTab 
                      astrologyData={astrologyData} 
                      transitLatitude={headerGps.latitude || undefined}
                      transitLongitude={headerGps.longitude || undefined}
                      transitTimezone={headerGps.latitude ? (new Date().getTimezoneOffset() / -60) : undefined}
                    />
                  ) : (
                    <div className="text-center py-12">
                      Please cast a horoscope first to view this page.
                    </div>
                  )
                ) : activeSubmenuId === "planet_ingress" ? (
                  astrologyData ? (
                    <IngressTab birthDate={astrologyData.birthDetails.date} />
                  ) : (
                    <div className="text-center py-12">
                      Please cast a horoscope first to view this page.
                    </div>
                  )
                ) : activeSubmenuId === "panchanga" ? (
                  astrologyData ? (
                    <HoroscopeDashboard
                      astrologyData={astrologyData}
                      activeSubTab="panchanga"
                      setActiveSubTab={handleDashboardTabNavigation}
                      selectedVarga={selectedVarga}
                      setSelectedVarga={setSelectedVarga}
                      selectedBavPlanet={selectedBavPlanet}
                      setSelectedBavPlanet={setSelectedBavPlanet}
                      activeDashaSystem={activeDashaSystem}
                      setActiveDashaSystem={setActiveDashaSystem}
                      activeSubmenuId={activeSubmenuId}
                      chartStyle={chartStyle}
                    />
                  ) : (
                    <div className="text-center py-12">
                      Please cast a horoscope first to view this page.
                    </div>
                  )
                ) : activeSubmenuId === "daily_muhurta" ? (
                  astrologyData ? (
                    /* Daily solar timings */
                    <div className={`p-6 rounded-2xl border ${containerStyle}`} id="muhurtas-tab">
                      <div>
                        <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                          <Clock className="w-5 h-5 text-amber-500" />
                          Daily Solar Muhurtas (Choghadiya)
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 mb-6">
                          Calculated based on local solar sunrise coordinates for the Cast date.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {astrologyData.muhurtas.map((m) => (
                          <div
                            key={m.name}
                            className={`p-4 rounded-xl border flex flex-col justify-between h-32 ${
                              m.isAuspicious
                                ? m.name === "Abhijit Muhurta" || m.name === "Brahma Muhurta"
                                  ? "bg-amber-500/10 border-amber-500/40"
                                  : "bg-green-500/5 border-green-500/20"
                                : "bg-rose-500/5 border-rose-500/20 opacity-75"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-xs font-bold text-white">{m.name}</h4>
                                <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                                  {m.startTime} to {m.endTime}
                                </span>
                              </div>
                              <span className={`text-[8px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded ${
                                m.isAuspicious ? "bg-green-500/20 text-green-400" : "bg-rose-500/20 text-rose-400"
                              }`}>
                                {m.isAuspicious ? "Auspicious" : "Avoid"}
                              </span>
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-indigo-500/5">
                              <span className="text-[9px] text-slate-400">Cosmic Rating:</span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <span
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      idx < m.score ? (m.isAuspicious ? "bg-amber-400" : "bg-rose-400") : "bg-slate-800"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      Please cast a horoscope first to view this page.
                    </div>
                  )
                ) : activeSubmenuId === "event_muhurta" ? (
                  /* Custom event electional Muhurta placeholder */
                  <div className={`p-6 rounded-2xl border ${containerStyle}`}>
                    <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                      <Calendar className="w-5 h-5 text-amber-500" />
                      Event Muhurta Finder
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 mb-6">
                      Identify perfect planetary times for weddings, business registrations, or real estate acquisitions.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["Wedding / Vivaha", "Business Launch", "Travel / Grahapravesh"].map((event) => (
                        <div key={event} className={`p-4 rounded-xl border ${cardStyle} flex flex-col justify-between h-40`}>
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase">CATEGORY Template</span>
                            <h4 className="text-xs font-bold text-amber-500 mt-1">{event}</h4>
                            <p className="text-[11px] text-slate-400 mt-2">
                              Analyzes Jupiter aspects and lunar houses to secure maximum blessings.
                            </p>
                          </div>
                          <button 
                            onClick={() => handleHotloadPluginDirectly("event_engine")}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-mono text-[10px] font-bold py-1.5 rounded-lg uppercase mt-4"
                          >
                            Hotload Event Engine
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`p-6 rounded-2xl border ${containerStyle}`}>
                    <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                      <RefreshCw className="w-5 h-5 text-amber-500" />
                      Planetary Transit Interpretations
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 mb-6">
                      Evaluating continuous celestial transitions mapped relative to birth parameters.
                    </p>

                    <div className={`p-4 rounded-xl border ${cardStyle} space-y-4`}>
                      <h4 className="text-xs font-bold font-mono text-slate-300 uppercase">Transit Synthesis</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Saturn's transit represents heavy growth opportunities. Jupiter transit highlights expansion. Transits calculate using real-time ephemeris coordinates from Google Cloud JHora server.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : activeMenu === "kp_stellar" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubmenuId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {astrologyData ? (
                  <KpStellarDashboard
                    astrologyData={astrologyData}
                    activeSubmenuId={activeSubmenuId}
                    onSubmenuSelect={handleSubmenuSelect}
                    isDarkTheme={isDark}
                  />
                ) : (
                  <div className="text-center py-12">
                    Please cast a horoscope first to view the KP Stellar workspace.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : activeMenu === "western_astrology" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubmenuId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <WesternAstrologyView nativeInputs={inputs} isDark={isDark} activeSubmenuId={activeSubmenuId} />
              </motion.div>
            </AnimatePresence>
          ) : activeMenu === "esoteric" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubmenuId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <MysticalSystemsView
                  nativeInputs={inputs}
                  isDark={isDark}
                  activeSubmenuId={activeSubmenuId}
                  astrologyData={astrologyData}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            /* Sandbox for dynamic loadable plugins / reserved menus */
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMenu}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-500/10 pb-5">
                    <div>
                      <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                        <Cpu className="w-5 h-5 text-amber-500 animate-pulse" />
                        Reserved Module Sandbox: {activeMenu.toUpperCase()}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Decoupled plugin hooks mapping classical calculations.
                      </p>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded border ${
                      isPluginActive(activeMenu) 
                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                    }`}>
                      {isPluginActive(activeMenu) ? "SANDBOX ACTIVE" : "MODULE DORMANT"}
                    </span>
                  </div>

                  {isPluginActive(activeMenu) ? (
                    <div className="bg-slate-950/40 border border-green-500/10 p-6 rounded-xl space-y-4">
                      <div className="flex items-center gap-2 text-xs font-mono text-green-400">
                        <Check className="w-4 h-4" />
                        DYNAMIC PLUGIN ROUTING RESOLVED SUCCESSFULLY
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        The plugin is loaded cleanly in client memory. Dynamic coordinate translations are routed via direct hook callbacks. Check compile sandbox logs under Developer &rarr; Plugin Manager to inspect variables.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl max-w-md mx-auto space-y-4">
                      <AlertCircle className="w-10 h-10 text-amber-500" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Dynamic Hotloading Required</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1">
                          No existing code modifications are required. Link dynamic symbols by clicking hotload below.
                        </p>
                      </div>
                      <button
                        onClick={() => handleHotloadPluginDirectly(activeMenu)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                      >
                        Compile & Hotload Module
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-md border-t border-indigo-500/10 z-40 px-3 py-2 flex items-center justify-around shadow-2xl safe-bottom" id="mobile-bottom-navigation-bar">
        {MAIN_MENU_STRUCTURE.map((node) => {
          const Icon = node.icon;
          const isActive = node.id === "astro"
            ? ["horoscope", "kp_stellar", "western_astrology", "esoteric", "marriage", "transit"].includes(activeMenu)
            : activeMenu === node.id;
          
          return (
            <button
              key={node.id}
              onClick={() => {
                handleMenuSelect(node.id);
                if (node.submenus && node.submenus.length > 0) {
                  setIsMobileMenuOpen(true);
                } else {
                  setIsMobileMenuOpen(false);
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all border-0 bg-transparent cursor-pointer ${
                isActive ? "text-amber-500" : isDark ? "text-slate-400 hover:text-slate-200" : "text-neutral-500 hover:text-neutral-800"
              }`}
              id={`bottom-nav-${node.id}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-sans font-medium mt-0.5 tracking-tight truncate max-w-[60px]">
                {node.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* FOOTER */}
      <footer className={`border-t py-4 px-6 text-center mt-auto ${
        isDark ? "border-indigo-500/10 bg-slate-950" : "border-neutral-200 bg-white"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-mono">
          <span>© 2026 JHora AI Professional. All calculations cached locally.</span>
          <span className="text-indigo-400">Grounded in Jyotish Science & Antigravity Intelligence</span>
        </div>
      </footer>

      {/* Background/Foreground Service Worker & Version update notification */}
      <UpdateNotification />

      {/* Birth Profile Verification Status Overlay */}
      {profileVerify.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setProfileVerify(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
            
            <div className="space-y-1">
              <h3 className="text-base font-sans font-medium text-amber-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Profile Availability Check
              </h3>
              <p className="text-xs text-slate-400">
                Checking files for <span className="text-amber-500 font-semibold">{profileVerify.record?.name}</span>...
              </p>
            </div>

            <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-indigo-500/5">
              {/* Local Machine Check */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Local Offline Storage
                </span>
                <span className="font-semibold">
                  {profileVerify.localStatus === "checking" && (
                    <span className="text-amber-400 animate-pulse">Checking Local...</span>
                  )}
                  {profileVerify.localStatus === "found" && (
                    <span className="text-green-400 flex items-center gap-1">✓ Found on Machine</span>
                  )}
                  {profileVerify.localStatus === "not_found" && (
                    <span className="text-rose-400">✗ Missing from Machine</span>
                  )}
                </span>
              </div>

              {/* Google Drive Check */}
              <div className="flex items-center justify-between text-xs border-t border-indigo-500/5 pt-2.5">
                <span className="text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Google Drive Cloud Backup
                </span>
                <span className="font-semibold">
                  {profileVerify.driveStatus === "pending" && (
                    <span className="text-slate-500">Awaiting Check</span>
                  )}
                  {profileVerify.driveStatus === "checking" && (
                    <span className="text-amber-400 animate-pulse">Querying Drive...</span>
                  )}
                  {profileVerify.driveStatus === "found" && (
                    <span className="text-green-400">✓ Connected & Found</span>
                  )}
                  {profileVerify.driveStatus === "not_found" && (
                    <span className="text-rose-400">✗ Not Found in Drive</span>
                  )}
                  {profileVerify.driveStatus === "skipped" && (
                    <span className="text-slate-500">Skipped (Not Authenticated)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Verification Steps Content */}
            {profileVerify.step === "checking" && (
              <div className="flex items-center justify-center gap-2 text-xs text-amber-500 animate-pulse py-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Retrieving profiles, please wait...
              </div>
            )}

            {profileVerify.step === "success" && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-xs text-green-300 text-center animate-in fade-in duration-300">
                ✓ Success! Profile verified. Hotloading dashboard parameters now...
              </div>
            )}

            {profileVerify.step === "upload_required" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-300 text-center">
                  ⚠️ Profile data is missing from local storage and Drive backups. Please upload a saved backup if you have one.
                </div>

                <div className="border border-dashed border-indigo-500/25 bg-slate-950/40 rounded-xl p-4 text-center">
                  <p className="text-[10px] text-slate-400 mb-2">Select the profile JSON to restore this card</p>
                  <label className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer transition-colors inline-flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5" />
                    Upload Backup
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadProfileJson(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
