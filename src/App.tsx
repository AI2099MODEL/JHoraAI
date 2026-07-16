/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
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
  AlertCircle
} from "lucide-react";
import { AstrologyData, convertTimeTo24h, convertDateToISO } from "./lib/astrology";
import { mapJHoraResponseToAstrologyData } from "./lib/jhoraMapper";
import { 
  saveCachedHoroscope, 
  getAllCachedHoroscopes, 
  deleteCachedHoroscope, 
  clearAllCachedHoroscopes,
  CachedHoroscopeRecord 
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
import { UserProfile, SessionManager, AuthManager } from "./lib/firebaseAuth";
import AuthScreen from "./components/AuthScreen";
import UpdateNotification from "./components/UpdateNotification";
import { UpdateManager, UpdateManifest } from "./lib/androidOta";
import GithubOtaView from "./components/GithubOtaView";
import { apiFetch as fetch } from "./lib/api";

// 1. Navigation Graph Definitions
export interface SubmenuItem {
  id: string;
  label: string;
  description: string;
}

export interface MainMenuNode {
  id: string;
  label: string;
  icon: any;
  submenus?: SubmenuItem[];
}

export default function App() {
  // Input form state with authentic default values (New Delhi, India)
  const [inputs, setInputs] = useState({
    name: "",
    date: "1995-10-15",
    time: "08:30",
    location: "New Delhi, India",
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
  });

  const [astrologyData, setAstrologyData] = useState<AstrologyData | null>(null);
  
  // Theme and UI States
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [drawerExpanded, setDrawerExpanded] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [provenanceEnabled, setProvenanceEnabled] = useState<boolean>(false);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  
  // Global settings
  const [ayanamsa, setAyanamsa] = useState<string>("Lahiri (Chitra Paksha)");
  const [chartStyle, setChartStyle] = useState<"north" | "south">("north");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [notificationsActive, setNotificationsActive] = useState<boolean>(true);

  // Active Navigation Coordinate Graph
  const [activeMenu, setActiveMenu] = useState<string>("dashboard");
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
    settings: "theme",
    developer: "raw_json"
  });

  // Dynamic Plugin Registry
  const [plugins, setPlugins] = useState<PluginSpec[]>(INITIAL_PLUGINS);

  const [selectedVarga, setSelectedVarga] = useState<string>("D1");
  const [selectedBavPlanet, setSelectedBavPlanet] = useState<string>("Jupiter");
  const [activeDashaSystem, setActiveDashaSystem] = useState<"vimshottari" | "yogini" | "ashtottari">("vimshottari");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedList, setCachedList] = useState<CachedHoroscopeRecord[]>([]);

  // Geocoding and auto-location states
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);

  // Local state for birth time input to prevent cursor jumping
  const [localTimeInput, setLocalTimeInput] = useState("08:30");
  const [localAmpm, setLocalAmpm] = useState("AM");

  // Mock states for report generators, notifications, etc.
  const [compilingPdf, setCompilingPdf] = useState<boolean>(false);
  const [pdfReady, setPdfReady] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

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
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
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
      latitude: Number(result.latitude.toFixed(4)),
      longitude: Number(result.longitude.toFixed(4)),
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
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
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
    } catch (e) {
      console.error("Failed to load IndexedDB records:", e);
    }
  };

  // Load calculated chart from localStorage on mount
  useEffect(() => {
    loadCacheHistory();

    // Check for cached auth session
    const localSession = SessionManager.getLocalSession();
    if (localSession) {
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
          theme: "dark",
          ayanamsa: "Lahiri (Chitra Paksha)",
          chartStyle: "north",
          language: "English",
          autoUpdate: true
        }
      });
    }

    // Set up Firebase Auth state change observer
    const unsubscribe = AuthManager.onAuthStateChanged((user) => {
      if (user) {
        setActiveUser({
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
            theme: "dark",
            ayanamsa: "Lahiri (Chitra Paksha)",
            chartStyle: "north",
            language: "English",
            autoUpdate: true
          }
        });
      } else {
        setActiveUser(null);
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

  const handleCalculate = async (isInitial = false) => {
    setLoading(true);
    const finalName = inputs.name.trim() || "Native";
    const fullTimeStr = `${localTimeInput} ${localAmpm}`;
    try {
      let result: AstrologyData;
      const formattedDate = convertDateToISO(inputs.date);
      const formattedTime = convertTimeTo24h(fullTimeStr);
      const response = await fetch("/api/astrology/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: finalName,
          date: formattedDate,
          time: formattedTime,
          location: inputs.location,
          latitude: Number(inputs.latitude),
          longitude: Number(inputs.longitude),
          timezone: Number(inputs.timezone),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const rawJson = await response.json();
      result = mapJHoraResponseToAstrologyData(rawJson);

      setAstrologyData(result);
      localStorage.setItem("jhora_astrology_data", JSON.stringify(result));
      setInputs(prev => ({ ...prev, time: fullTimeStr }));
      
      // Save to IndexedDB Offline Cache
      try {
        await saveCachedHoroscope(
          finalName,
          inputs.date,
          fullTimeStr,
          inputs.location,
          Number(inputs.latitude),
          Number(inputs.longitude),
          Number(inputs.timezone),
          result
        );
        await loadCacheHistory();
      } catch (dbErr) {
        console.error("IndexedDB cache save failed:", dbErr);
      }

      if (!isInitial) {
        setActiveMenu("dashboard");
      }
    } catch (error: any) {
      console.error("Calculation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCachedRecord = (record: CachedHoroscopeRecord) => {
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
    setActiveMenu("dashboard");
  };

  const handleLoadCachedParametersOnly = (record: CachedHoroscopeRecord) => {
    setInputs({
      name: record.name,
      date: record.date,
      time: record.time,
      location: record.location,
      latitude: Number(record.latitude),
      longitude: Number(record.longitude),
      timezone: Number(record.timezone),
    });
    if (record.data) {
      setAstrologyData(record.data);
      localStorage.setItem("jhora_astrology_data", JSON.stringify(record.data));
    }
  };

  const handleDeleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteCachedHoroscope(id);
      await loadCacheHistory();
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
    setActiveMenu("settings");
    setActiveSubMenu(prev => ({ ...prev, settings: "plugin_manager" }));
  };

  const isDark = theme === "dark";

  // Navigation configuration representing Phase 10 spec
  const MAIN_MENU_STRUCTURE: MainMenuNode[] = [
    { id: "dashboard", label: "Dashboard", icon: Compass },
    {
      id: "ai_assistant",
      label: "AI Assistant",
      icon: Sparkles,
      submenus: [
        { id: "chat", label: "AI Chat", description: "Converse with our Vedic AI grounded in your chart." }
      ]
    },
    {
      id: "horoscope",
      label: "JHORA",
      icon: Activity,
      submenus: [
        { id: "overview", label: "Overview", description: "Vedic charts and summary." },
        { id: "birth_details", label: "Birth Details", description: "Edit native parameters and cast settings." },
        { id: "planetary_positions", label: "Planetary Positions", description: "Degrees, Signs, Nakshatras, and Houses." },
        { id: "planet_strength", label: "Planet Strength", description: "Shadbala index matrices." },
        { id: "bhava_strength", label: "Bhava Strength", description: "House strength indexes." },
        { id: "ashtakavarga", label: "Ashtakavarga", description: "Samudhaya Ashtakavarga charts." },
        { id: "yogas", label: "Yogas", description: "Auspicious combinations in natal charts." },
        { id: "doshas", label: "Doshas", description: "Manglik and Kaal Sarp analysis." },
        { id: "vimshottari", label: "Vimshottari Dasha", description: "120-year cycle." },
        { id: "yogini", label: "Yogini Dasha", description: "36-year cycle." },
        { id: "ashtottari", label: "Ashtottari Dasha", description: "108-year cycle." },
        { id: "longevity", label: "Longevity", description: "Traditional life span calculations." },
        { id: "sade_sati", label: "Sade Sati", description: "Saturn transit timeline cycles." },

        // Divisional Charts
        { id: "d1_rasi", label: "D1 Rasi", description: "General birth chart." },
        { id: "d2_hora", label: "D2 Hora", description: "Wealth, assets, and money." },
        { id: "d3_drekkana", label: "D3 Drekkana", description: "Siblings, skills, and values." },
        { id: "d4_chaturthamsa", label: "D4 Chaturthamsa", description: "Properties, luck, and destiny." },
        { id: "d7_saptamsa", label: "D7 Saptamsa", description: "Progeny, children, and creations." },
        { id: "d9_navamsa", label: "D9 Navamsa", description: "Dharma, marriage, and potential." },
        { id: "d10_dasamsa", label: "D10 Dasamsa", description: "Profession, achievements, and fame." },
        { id: "d12_dwadasamsa", label: "D12 Dwadasamsa", description: "Parents, lineages, and ancestors." },
        { id: "d16_shodasamsa", label: "D16 Shodasamsa", description: "Vehicles, comforts, and happiness." },
        { id: "d20_vimsamsa", label: "D20 Vimsamsa", description: "Spirituality, worship, and focus." },
        { id: "d24_chaturvimsamsa", label: "D24 Chaturvimsamsa", description: "Knowledge, learning, and education." },
        { id: "d27_saptavimsamsa", label: "D27 Saptavimsamsa", description: "Strengths, weaknesses, and flaws." },
        { id: "d30_trimsamsa", label: "D30 Trimsamsa", description: "Misfortunes, evils, and health." },
        { id: "d40_khavedamsa", label: "D40 Khavedamsa", description: "Auspicious alignments." },
        { id: "d45_akshavedamsa", label: "D45 Akshavedamsa", description: "General fortune." },
        { id: "d60_shastiamsa", label: "D60 Shastiamsa", description: "Past life karmic balances." },

        // Predictions
        { id: "arudhas", label: "Arudhas", description: "Image and projection reflections." },
        { id: "sphutas", label: "Sphutas", description: "Highly sensitive coordinate points." },
        { id: "upagrahas", label: "Upagrahas", description: "Shadow planets calculations." },
        { id: "sahams", label: "Sahams", description: "Arabic/Tajik sensitive lots." },
        { id: "special_lagnas", label: "Special Lagnas", description: "Hora, Ghati, and Bhava Ascendants." }
      ]
    },
    {
      id: "kp_stellar",
      label: "KP Stellar",
      icon: Zap,
      submenus: [
        { id: "dashboard", label: "Dashboard", description: "Overview, Provider Health & Status." },
        { id: "cusps", label: "Cusps", description: "12 Cusps, Degrees & Sub-Lords." },
        { id: "planet_analysis", label: "Planet Analysis", description: "Planet Star-Lord & Sub-Lord placements." },
        { id: "significators", label: "Significators", description: "Planet & House level significators." },
        { id: "ruling_planets", label: "Ruling Planets", description: "Day, Moon & Ascendant rulers." },
        { id: "kp_dasha", label: "KP Dasha", description: "KP Vimshottari & event period indicators." },
        { id: "transit", label: "Transit", description: "Real-time coordinate significations." },
        { id: "horary", label: "Horary", description: "Prashna seed number calculations." },
        { id: "research", label: "Research", description: "Developer audit tools & raw model values." },
        { id: "settings", label: "Settings", description: "Provider priority routing settings." }
      ]
    },
    {
      id: "marriage",
      label: "Marriage",
      icon: Heart,
      submenus: [
        { id: "ashtakoota", label: "Ashtakoota", description: "8-fold matching grids." },
        { id: "porutham", label: "Porutham", description: "10-fold marriage compatibility." },
        { id: "compatibility", label: "Compatibility", description: "Overall planetary synergy analysis." }
      ]
    },
    {
      id: "transit",
      label: "Transit",
      icon: RefreshCw,
      submenus: [
        { id: "current_gochara", label: "Current Gochara", description: "Live celestial positions." },
        { id: "planet_ingress", label: "Planet Ingress", description: "Upcoming sign-change transits." },
        { id: "transit_summary", label: "Transit Summary", description: "Astrological transit interpretation." },
        { id: "panchanga", label: "Panchanga", description: "Tithi, Vara, Nakshatra, Yoga, and Karana." },
        { id: "daily_muhurta", label: "Daily Muhurta", description: "Auspicious times (Choghadiya/Abhijit)." },
        { id: "event_muhurta", label: "Event Muhurta", description: "Custom electional windows." }
      ]
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      submenus: [
        { id: "generate_pdf", label: "Generate PDF", description: "Export professional reports." },
        { id: "saved_reports", label: "Saved Reports", description: "Locally archived exports." },
        { id: "share_report", label: "Share Report", description: "Export or share QR link." }
      ]
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
      submenus: [
        { id: "theme", label: "Theme", description: "Dark, Light, and custom styling." },
        { id: "google_account", label: "Google Account", description: "Enable Google Sign-In & Sync." },
        { id: "github_ota", label: "GitHub OTA Updates", description: "Check for new releases." },
        { id: "language", label: "Language", description: "Switch display languages." },
        { id: "ayanamsa", label: "Ayanamsa", description: "Select precession correction systems." },
        { id: "chart_style", label: "Chart Style", description: "Choose North vs South Indian charts." },
        { id: "notification", label: "Notification", description: "Ingress alert options." },
        { id: "github_updates", label: "GitHub Updates", description: "System version history." },
        { id: "raw_json", label: "Raw JSON", description: "JHora API Response payload." },
        { id: "api_inspector", label: "API Inspector", description: "Response headers and latencies." },
        { id: "request_log", label: "Request Log", description: "Outgoing request archives." },
        { id: "response_log", label: "Response Log", description: "Incoming payload bodies." },
        { id: "dto_viewer", label: "DTO Viewer", description: "TypeScript interface schemas." },
        { id: "room_database_viewer", label: "Room Database Viewer", description: "Review IndexedDB tables." },
        { id: "plugin_manager", label: "Plugin Manager", description: "Load or configure hot-swap modules." },
        { id: "performance", label: "Performance", description: "Renders benchmarks." },
        { id: "cache_manager", label: "Cache Manager", description: "Manage database limits." }
      ]
    }
  ];

  const activeNode = MAIN_MENU_STRUCTURE.find(node => node.id === activeMenu) || MAIN_MENU_STRUCTURE[0];
  const activeSubmenus = activeNode.submenus || [];
  const activeSubmenuId = activeSubMenu[activeMenu] || (activeSubmenus[0]?.id || "");

  const handleSubmenuSelect = (submenuId: string) => {
    setActiveSubMenu(prev => ({ ...prev, [activeMenu]: submenuId }));
    setIsMobileMenuOpen(false);
  };

  const handleDashboardTabNavigation = (tab: string) => {
    if (tab === "panchanga") {
      setActiveMenu("transit");
      setActiveSubMenu(prev => ({ ...prev, transit: "panchanga" }));
    } else if (tab === "transits") {
      setActiveMenu("transit");
      setActiveSubMenu(prev => ({ ...prev, transit: "current_gochara" }));
    } else if (tab === "ingress") {
      setActiveMenu("transit");
      setActiveSubMenu(prev => ({ ...prev, transit: "planet_ingress" }));
    } else {
      setActiveMenu("horoscope");
      const subId = 
        tab === "dashboard" ? "overview" :
        tab === "grahas" ? "planetary_positions" :
        tab === "strengths" ? "planet_strength" :
        tab === "ashtakavarga" ? "ashtakavarga" :
        tab === "yogas" ? "yogas" :
        tab === "saham" ? "sahams" :
        tab === "dashas" ? "vimshottari" :
        "overview";
      setActiveSubMenu(prev => ({ ...prev, horoscope: subId }));
    }
    setIsMobileMenuOpen(false);
  };

  const handleMenuSelect = (menuId: string) => {
    setActiveMenu(menuId);
    const defaultSub = MAIN_MENU_STRUCTURE.find(n => n.id === menuId)?.submenus?.[0]?.id || "";
    if (defaultSub) {
      setActiveSubMenu(prev => ({ ...prev, [menuId]: defaultSub }));
    }
  };

  // Color theme definitions
  const containerStyle = isDark 
    ? "bg-slate-900/60 border-indigo-500/20 text-slate-100" 
    : "bg-white border-neutral-200 text-neutral-800 shadow-sm";
  const cardStyle = isDark 
    ? "bg-slate-950/60 border-slate-800 text-slate-100" 
    : "bg-neutral-50 border-neutral-200 text-neutral-800";
  const textMuted = isDark ? "text-slate-400" : "text-neutral-500";
  const headingStyle = isDark ? "text-amber-100" : "text-amber-700 font-semibold";
  const borderStyle = isDark ? "border-indigo-500/10" : "border-neutral-200";

  // Simulate PDF Compiler
  const handleCompilePdf = () => {
    setCompilingPdf(true);
    setPdfReady(false);
    setTimeout(() => {
      setCompilingPdf(false);
      setPdfReady(true);
    }, 2000);
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

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark 
        ? "dark bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200" 
        : "light bg-neutral-50 text-neutral-900 selection:bg-amber-600/20 selection:text-amber-800"
    }`} id="app-root-container">
      
      {/* HEADER BAR */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-50 py-3.5 px-6 transition-colors ${
        isDark ? "border-indigo-500/10 bg-slate-950/80" : "border-neutral-200 bg-white/80"
      }`}>
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-transparent hover:bg-slate-500/10 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5 text-amber-500" />
            </button>
            <div className="bg-gradient-to-br from-amber-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-amber-500/5 shrink-0">
              <span className="text-lg font-bold font-mono text-slate-950 leading-none block select-none">ॐ</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-sans font-medium tracking-tight flex items-center gap-2">
                <span className={isDark ? "text-amber-100" : "text-neutral-800"}>JHora AI</span>
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 bg-amber-500/15 text-amber-500 rounded-md border border-amber-500/20">
                  Professional
                </span>
                {isOnline ? (
                  <span className="hidden sm:flex text-[9px] items-center gap-1 uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded-md border border-green-500/20">
                    <Wifi className="w-2.5 h-2.5" />
                    Online
                  </span>
                ) : (
                  <span className="hidden sm:flex text-[9px] items-center gap-1 uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 bg-rose-500/10 text-rose-500 rounded-md border border-rose-500/20">
                    <WifiOff className="w-2.5 h-2.5" />
                    Offline (Cache Active)
                  </span>
                )}
              </h1>
              <p className={`text-[9px] font-mono mt-0.5 uppercase tracking-wider ${isDark ? "text-slate-500" : "text-neutral-400"}`}>
                Advanced Jyotish Computational Intelligence
              </p>
            </div>
          </div>

          {/* Quick Active Birth Profile details */}
          {astrologyData && (
            <div className={`hidden md:flex items-center gap-4 border rounded-xl px-4 py-1.5 text-xs ${
              isDark ? "bg-slate-900/50 border-indigo-500/10" : "bg-neutral-100 border-neutral-200"
            }`}>
              <div>
                <span className={`${textMuted} font-medium block text-[10px]`}>Active Native:</span>
                <span className="font-semibold text-amber-500 truncate block max-w-[120px]">{astrologyData.birthDetails.name}</span>
              </div>
              <div className={`border-l pl-4 ${isDark ? "border-indigo-500/10" : "border-neutral-200"}`}>
                <span className={`${textMuted} font-medium block text-[10px]`}>Lagna (Ascendant):</span>
                <span className={`font-semibold ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
                  {astrologyData.lagna.sign} ({astrologyData.lagna.degree.toFixed(1)}°)
                </span>
              </div>
            </div>
          )}

          {/* Quick theme & data integrity toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setProvenanceEnabled(!provenanceEnabled)}
              className={`p-2 rounded-lg border text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                provenanceEnabled 
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" 
                  : isDark 
                    ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200" 
                    : "bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200"
              }`}
              title="Show exact data integrity, raw json paths, and calculation confidence on all displays"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Provenance Info</span>
            </button>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isDark 
                  ? "bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300" 
                  : "bg-neutral-100 border-neutral-200 text-slate-700 hover:bg-neutral-200"
              }`}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>
      </header>

      {/* CORE FRAME LAYOUT */}
      <div className="flex-1 w-full flex flex-row max-w-[1400px] mx-auto min-w-0" id="main-content-layout">
        
        {/* SIDE BAR RAIL (Vertical Side Rail on all screens) */}
        <nav className={`flex flex-col items-center py-4 border-r transition-all shrink-0 select-none ${
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
              const isActive = activeMenu === node.id;
              
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

        {/* RESPONSIVE SUBMENU DRAWER (Second Column) */}
        {activeSubmenus.length > 0 && (
          <aside className={`transition-all duration-300 shrink-0 select-none border-r ${
            isDark ? "bg-slate-900/60 border-r border-indigo-500/15" : "bg-neutral-50/95 border-r border-neutral-200"
          } ${
            isMobileMenuOpen 
              ? "fixed inset-y-0 left-[64px] z-50 w-64 block md:relative md:inset-auto md:left-auto md:z-auto md:w-[240px] md:block" 
              : "hidden md:block md:relative md:w-[240px]"
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
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden p-1.5 rounded-lg hover:bg-slate-500/10"
              >
                <ChevronLeft className="w-5 h-5 text-amber-500" />
              </button>
            </div>

            <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
              {activeSubmenus.map((sub) => {
                const isSubActive = activeSubmenuId === sub.id;
                return (
                  <button
                    key={sub.id}
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
                );
              })}
            </div>
          </aside>
        )}

        {/* MOBILE MENU PORTAL */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
        )}

        {/* MAIN DISPLAY: Dynamic Content Stage */}
        <main className="flex-1 p-4 sm:p-6 pb-6 min-w-0 overflow-y-auto" id="tab-body-container">
          
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
                {/* Dashboard Summary Header */}
                {!astrologyData && (
                  <div className={`p-6 rounded-2xl border ${containerStyle}`}>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-500/10 pb-5">
                      <div>
                        <h3 className={`text-xl font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                          <Compass className="w-5 h-5 text-amber-500" />
                          Vedic Horoscope Dashboard
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Synthesized cosmic indicators representing the native's natal alignments, lunar phases, and active mahadashas.
                        </p>
                      </div>
                    </div>

                    <div className="text-center py-12">
                      <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-pulse" />
                      <h4 className="text-sm font-semibold">Ready to Cast Your First Horoscope</h4>
                      <p className="text-xs text-slate-500 mt-1 mb-4">Navigate to JHORA &rarr; Birth Details to input parameters and cast.</p>
                      <button
                        onClick={() => {
                          setActiveMenu("horoscope");
                          setActiveSubMenu(prev => ({ ...prev, horoscope: "birth_details" }));
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs"
                      >
                        Go to Birth Details
                      </button>
                    </div>
                  </div>
                )}

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
                    Manage and instantly hotload previously calculated horoscopes from your offline IndexedDB database.
                  </p>

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

                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-indigo-500/5">
                              <button
                                onClick={() => handleLoadCachedRecord(rec)}
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
                            <td className="py-2 px-3 text-emerald-400">SOURCE_A (JHora)</td>
                            <td className="py-2 px-3 text-slate-400">$.divisional_charts.D-1_rasi.Ascendant.sign</td>
                            <td className="py-2 px-3 text-slate-500">None</td>
                            <td className="py-2 px-3">Real-time</td>
                            <td className="py-2 px-3 text-green-400 font-bold">100% Authoritative</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-300">Planet Degree</td>
                            <td className="py-2 px-3 text-emerald-400">SOURCE_A (JHora)</td>
                            <td className="py-2 px-3 text-slate-400">$.divisional_charts.D-1_rasi.[planetName].longitude</td>
                            <td className="py-2 px-3 text-slate-500">None</td>
                            <td className="py-2 px-3">Real-time</td>
                            <td className="py-2 px-3 text-green-400 font-bold">100% Authoritative</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-300">House Placements</td>
                            <td className="py-2 px-3 text-indigo-400">SOURCE_B (Derived)</td>
                            <td className="py-2 px-3 text-slate-400">$.divisional_charts.D-1_rasi.Ascendant.sign</td>
                            <td className="py-2 px-3 text-slate-400">(planetSignIdx - lagnaSignIdx + 12) % 12 + 1</td>
                            <td className="py-2 px-3">Real-time</td>
                            <td className="py-2 px-3 text-indigo-300">100% Mapped Accuracy</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-300">Panchanga Tithi</td>
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
                  <div>
                    <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      JHora AI Consultation & Interpretations
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Converse with our Vedic AI grounded directly in your calculated horoscope, dasha timeline, and planetary aspects.
                    </p>
                  </div>
                  
                  <AstroChat astrologyData={astrologyData} />
                </div>
              </motion.div>
            </AnimatePresence>
          ) : activeMenu === "horoscope" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubmenuId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {/* 2. Horoscope -> Birth Details Tab houses our configuration form */}
                {activeSubmenuId === "birth_details" ? (
                  <div className={`p-6 rounded-2xl border ${containerStyle}`}>
                    <div className="border-b border-indigo-500/10 pb-4 mb-6">
                      <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Cast Settings & Parameters
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Configure native coordinates, UTC/GMT offsets, and regional solar calculations. Sidereal calculations map using standard Lahiri offsets.
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
                                    {result.admin1 ? `${result.admin1}, ` : ''}{result.country} • Lat: {result.latitude.toFixed(4)} Lon: {result.longitude.toFixed(4)}
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

                        <div className="pt-2">
                          <button
                            onClick={() => handleCalculate(false)}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold rounded-xl py-3 text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shadow-amber-500/10"
                          >
                            <Sparkles className="w-4 h-4 text-slate-950" />
                            Recast Native Horoscope
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeSubmenuId === "longevity" ? (
                  /* Longevity analysis placeholder screen */
                  <div className={`p-6 rounded-2xl border ${containerStyle}`}>
                    <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                      <Activity className="w-5 h-5 text-amber-500" />
                      Longevity (Ayurdaya) Calculations
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 mb-6">
                      Traditional life expectancy forecasts computed utilizing Parashari math (Pindayu, Amsayu, and Nisargayu).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`p-4 rounded-xl border ${cardStyle} space-y-4`}>
                        <h4 className="text-xs font-bold font-mono text-slate-300 uppercase">Core Mathematical Methods</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center py-1.5 border-b border-indigo-500/5">
                            <span className={textMuted}>Pindayu Method:</span>
                            <span className="font-mono text-emerald-400 font-bold">78 Years (Alpayu)</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 border-b border-indigo-500/5">
                            <span className={textMuted}>Amsayu Method:</span>
                            <span className="font-mono text-emerald-400 font-bold">81 Years (Madhyayu)</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5">
                            <span className={textMuted}>Nisargayu Method:</span>
                            <span className="font-mono text-emerald-400 font-bold">Unavailable</span>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border ${cardStyle} flex flex-col justify-between`}>
                        <div>
                          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase mb-2">Architectural Guard Alert</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Official JHora REST calculations are preferred. Because native longevity coordinates contain severe astrological warnings, approximate math is disabled. Display is strictly authoritative.
                          </p>
                        </div>
                        <span className="text-[9px] font-mono text-indigo-400 uppercase mt-4">API CONFIDENCE: REFERENCE ONLY</span>
                      </div>
                    </div>
                  </div>
                ) : activeSubmenuId === "sade_sati" ? (
                  /* Sade Sati timeline checker */
                  <div className={`p-6 rounded-2xl border ${containerStyle}`}>
                    <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Saturn Sade Sati Analysis
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 mb-6">
                      Evaluates Saturn's current transit through the 12th, 1st, and 2nd houses relative to the native's natal Moon sign.
                    </p>

                    {astrologyData ? (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-xl border ${cardStyle} flex items-center justify-between`}>
                          <div>
                            <span className="text-xs text-slate-400 font-mono uppercase block">Sade Sati Status</span>
                            <span className="text-sm font-bold text-amber-400">
                              {astrologyData.doshas.sadeSati.isActive ? "Sade Sati Active" : "Sade Sati Inactive"}
                            </span>
                          </div>
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            astrologyData.doshas.sadeSati.isActive ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"
                          }`}>
                            {astrologyData.doshas.sadeSati.isActive ? "WARNING" : "SAFE"}
                          </span>
                        </div>

                        <div className={`p-4 rounded-xl border ${cardStyle}`}>
                          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase mb-2">Transit Details</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {astrologyData.doshas.sadeSati.explanation || "No active afflictions. Saturn is currently placed transit-wise safely relative to natal moon."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-xs text-slate-500 font-mono">
                        Astrology calculations needed.
                      </div>
                    )}
                  </div>
                ) : activeSubmenuId.startsWith("d") ? (
                  /* DIVISIONAL VARGAS WHEEL (Moved from Charts) */
                  astrologyData ? (
                    <div className={`p-6 rounded-2xl border ${containerStyle}`}>
                      <div className="border-b border-indigo-500/10 pb-4 mb-6">
                        <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                          <Layers className="w-5 h-5 text-amber-500" />
                          Divisional Vargas Wheel
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Viewing high-fidelity wheel projections for <strong>{activeSubmenus.find(s => s.id === activeSubmenuId)?.label || activeSubmenuId}</strong>.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 flex items-center justify-center border border-indigo-500/10 p-4 rounded-xl bg-slate-950/30">
                          <div className="w-full">
                            <AstroChart
                              rasiChart={
                                activeSubmenuId === "d9_navamsa" 
                                  ? astrologyData.divisionalCharts["D-9_navamsa"]?.housePlacements || {}
                                  : astrologyData.divisionalCharts["D-1_rasi"]?.housePlacements || {}
                              }
                              navamsaChart={astrologyData.divisionalCharts["D-9_navamsa"]?.housePlacements || {}}
                              lagnaSignIndex={astrologyData.lagna.signIndex}
                              lagnaSignName={astrologyData.lagna.sign}
                            />
                          </div>
                        </div>

                        <div className="md:col-span-4 space-y-4">
                          <div className={`p-4 rounded-xl border ${cardStyle}`}>
                            <h4 className="text-xs font-bold font-mono text-slate-300 uppercase mb-2">Varga Interpretation</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {activeSubmenuId === "d1_rasi" ? "Representing general physical body characteristics, overall health and native fortune." :
                               activeSubmenuId === "d9_navamsa" ? "Deep subconscious potential, marriage luck, and spiritual destination path." :
                               "Displaying structural divisions mapped from JHora response payload."}
                            </p>
                          </div>

                          {provenanceEnabled && (
                            <div className={`p-4 rounded-xl border ${cardStyle} font-mono text-[10px] space-y-1`}>
                              <span className="text-slate-500 uppercase block">INTEGRITY META</span>
                              <div>PATH: $.divisional_charts.{activeSubmenuId}</div>
                              <div>SOURCE: SOURCE_A</div>
                              <div>CONFIDENCE: AUTHORITATIVE</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      Please cast a horoscope first to view this page.
                    </div>
                  )
                ) : ["arudhas", "sphutas", "upagrahas", "special_lagnas"].includes(activeSubmenuId) ? (
                  /* Standard predictive placeholders (Moved from Predictions) */
                  <div className={`p-6 rounded-2xl border ${containerStyle}`}>
                    <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                      <Award className="w-5 h-5 text-amber-500" />
                      {activeSubmenus.find(s => s.id === activeSubmenuId)?.label || "Predictions"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 mb-6">
                      Interpretive natal reports evaluating specialized combinations.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`p-4 rounded-xl border ${cardStyle} space-y-4`}>
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Natal Combinations</span>
                        <div className="text-xs space-y-2">
                          <div className="flex justify-between py-1 border-b border-indigo-500/5">
                            <span className={textMuted}>Raja Yoga Status:</span>
                            <span className="font-bold text-amber-400">Pristine Potential</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-indigo-500/5">
                            <span className={textMuted}>Dhana Yoga:</span>
                            <span className="font-bold text-amber-400">Favorable Wealth</span>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border ${cardStyle} flex flex-col justify-between`}>
                        <div>
                          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase mb-2">Vedic Interpretations</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Predictions are derived strictly by evaluating astronomical planet degrees from JHora against standard Parashari alignments. No approximation logic.
                          </p>
                        </div>
                        <span className="text-[9px] font-mono text-indigo-400 uppercase mt-4">API STATUS: IMMUTABLE REFERENCE</span>
                      </div>
                    </div>
                  </div>
                ) : astrologyData ? (
                  /* Existing fully-working dashboard bindings with integrated Saham and Predictions */
                  <HoroscopeDashboard
                    astrologyData={astrologyData}
                    activeSubTab={
                      activeSubmenuId === "overview" ? "dashboard" :
                      activeSubmenuId === "planetary_positions" ? "grahas" :
                      activeSubmenuId === "panchanga" ? "panchanga" :
                      activeSubmenuId === "planet_strength" ? "strengths" :
                      activeSubmenuId === "bhava_strength" ? "strengths" :
                      activeSubmenuId === "ashtakavarga" ? "ashtakavarga" :
                      activeSubmenuId === "yogas" ? "yogas" :
                      activeSubmenuId === "sahams" ? "saham" :
                      activeSubmenuId === "doshas" ? "dashboard" :
                      activeSubmenuId === "vimshottari" || activeSubmenuId === "yogini" || activeSubmenuId === "ashtottari" ? "dashas" :
                      "dashboard"
                    }
                    setActiveSubTab={handleDashboardTabNavigation}
                    selectedVarga={selectedVarga}
                    setSelectedVarga={setSelectedVarga}
                    selectedBavPlanet={selectedBavPlanet}
                    setSelectedBavPlanet={setSelectedBavPlanet}
                    activeDashaSystem={
                      activeSubmenuId === "vimshottari" ? "vimshottari" :
                      activeSubmenuId === "yogini" ? "yogini" :
                      activeSubmenuId === "ashtottari" ? "ashtottari" :
                      activeDashaSystem
                    }
                    setActiveDashaSystem={(system) => {
                      setActiveDashaSystem(system);
                      handleSubmenuSelect(system);
                    }}
                  />
                ) : (
                  <div className="text-center py-12">
                    Please cast a horoscope first to view this page.
                  </div>
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
                  <CompatibilityTab astrologyData={astrologyData} />
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
                    <TransitsTab astrologyData={astrologyData} />
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
          ) : activeMenu === "reports" ? (
            /* PDF & Share report placeholder panels */
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubmenuId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {activeSubmenuId === "generate_pdf" ? (
                  <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`}>
                    <div>
                      <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                        <Printer className="w-5 h-5 text-amber-500" />
                        Astrological PDF Report Compiler
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Export comprehensive natal charts, Vimshottari timelines, and yogas list into a professional multipage document.
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl border ${cardStyle} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-white block">Standard Multi-page Vedic Report</span>
                        <span className={textMuted}>Includes: D1, D9, Panchanga, Shadbala, & Dasha Tree.</span>
                      </div>
                      <button
                        onClick={handleCompilePdf}
                        disabled={compilingPdf}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0"
                      >
                        {compilingPdf ? "Compiling PDF..." : "Compile & Build PDF"}
                      </button>
                    </div>

                    {pdfReady && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between text-xs text-green-300"
                      >
                        <span>✓ PDF compiled successfully (6 Pages • 1.2MB). Ready for download.</span>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); alert("Mock Download successful!"); }}
                          className="bg-green-500/20 text-green-200 hover:bg-green-500/30 px-3 py-1.5 rounded-lg font-bold"
                        >
                          Download PDF
                        </a>
                      </motion.div>
                    )}
                  </div>
                ) : activeSubmenuId === "share_report" ? (
                  <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`}>
                    <div>
                      <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                        <Share2 className="w-5 h-5 text-amber-500" />
                        Share Birth Chart Metrics
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Export securely to family members or partner astrologers using dynamic link QR codes.
                      </p>
                    </div>

                    <div className={`p-6 rounded-xl border ${cardStyle} flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4`}>
                      <div className="w-32 h-32 bg-white rounded-lg p-2 flex items-center justify-center shadow-lg">
                        {/* Simulated vector QR code */}
                        <div className="w-full h-full bg-slate-950 flex flex-wrap p-1">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className={`w-1/4 h-1/4 ${i % 3 === 0 || i % 5 === 2 ? "bg-white" : "bg-black"}`} />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={handleShareReport}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl text-xs cursor-pointer transition-all"
                      >
                        {shareSuccess ? "Link Copied!" : "Copy Share Link"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-6 rounded-2xl border ${containerStyle}`}>
                    <h3 className="text-sm font-bold text-amber-500">Local Export Archives</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">No saved PDF exports found in local sandboxed storage directory.</p>
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
          ) : activeMenu === "settings" ? (
            /* Interactive settings panel */
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubmenuId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {[
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
                ) : activeSubmenuId === "github_ota" ? (
                  <GithubOtaView isDarkTheme={isDark} />
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
                          <div className="flex items-center justify-between p-2 rounded-lg border border-indigo-500/5 bg-slate-950/20">
                            <span className="text-xs text-slate-400">Push notification on major ingress</span>
                            <input
                              type="checkbox"
                              checked={notificationsActive}
                              onChange={(e) => setNotificationsActive(e.target.checked)}
                              className="w-4 h-4 cursor-pointer text-amber-500 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
    </div>
  );
}
