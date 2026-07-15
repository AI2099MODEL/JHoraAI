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
  FolderOpen
} from "lucide-react";
import { calculateAstrology, AstrologyData } from "./lib/astrology";
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

export default function App() {
  // Input form state with authentic default values (New Delhi, India)
  const [inputs, setInputs] = useState({
    name: "Aravind Kumar",
    date: "1995-10-15",
    time: "08:30",
    location: "New Delhi, India",
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
  });

  const [astrologyData, setAstrologyData] = useState<AstrologyData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("cast");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedList, setCachedList] = useState<CachedHoroscopeRecord[]>([]);

  // Geocoding and auto-location states
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);

  // Calculate timezone offset from IANA timezone name (e.g., 'Asia/Kolkata')
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
      return diffMin / 60; // offset in hours (e.g. 5.5)
    } catch (e) {
      console.error("Failed to compute timezone offset:", e);
      return 5.5; // fallback
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

  // Debounced search trigger for inputs.location
  useEffect(() => {
    if (!inputs.location || inputs.location.trim().length < 3) {
      setLocationResults([]);
      setShowLocationDropdown(false);
      return;
    }
    
    // Prevent searching if the current input matches exactly a selected result
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

  // Select a location from the search results
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
          
          const timezoneGuess = Math.round(lon / 15 * 2) / 2; // rough estimation
          
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

  // Monitor network connectivity
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

  // Load cache history from IndexedDB on mount
  const loadCacheHistory = async () => {
    try {
      const records = await getAllCachedHoroscopes();
      setCachedList(records);
    } catch (e) {
      console.error("Failed to load IndexedDB records:", e);
    }
  };

  // Load calculated chart from localStorage or IndexedDB on mount
  useEffect(() => {
    loadCacheHistory();

    const saved = localStorage.getItem("jhora_astrology_data");
    if (saved) {
      try {
        setAstrologyData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved astrology data:", e);
      }
    } else {
      // Trigger default calculation so there's immediate value on launch
      handleCalculate(true);
    }
  }, []);

  const handleCalculate = async (isInitial = false) => {
    setLoading(true);
    // Simulate slight celestial calculation delay
    setTimeout(async () => {
      try {
        const result = calculateAstrology(
          inputs.name,
          inputs.date,
          inputs.time,
          inputs.location,
          Number(inputs.latitude),
          Number(inputs.longitude),
          Number(inputs.timezone)
        );
        setAstrologyData(result);
        localStorage.setItem("jhora_astrology_data", JSON.stringify(result));
        
        // Save to IndexedDB Offline Caching Layer
        try {
          await saveCachedHoroscope(
            inputs.name,
            inputs.date,
            inputs.time,
            inputs.location,
            Number(inputs.latitude),
            Number(inputs.longitude),
            Number(inputs.timezone),
            result
          );
          // Refresh list
          await loadCacheHistory();
        } catch (dbErr) {
          console.error("IndexedDB cache save failed:", dbErr);
        }

        if (!isInitial) {
          setActiveTab("dashboard");
        }
      } catch (error) {
        console.error("Calculation failed:", error);
      } finally {
        setLoading(false);
      }
    }, 800);
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
    setActiveTab("dashboard");
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
    e.stopPropagation(); // prevent loading when clicking delete
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

  // Helper to format planet abbreviations
  const getLordColor = (lord: string) => {
    const colors: { [key: string]: string } = {
      Sun: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      Moon: "text-blue-300 bg-blue-300/10 border-blue-300/20",
      Mars: "text-rose-400 bg-rose-400/10 border-rose-400/20",
      Mercury: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      Jupiter: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
      Venus: "text-pink-400 bg-pink-400/10 border-pink-400/20",
      Saturn: "text-slate-400 bg-slate-400/10 border-slate-400/20",
      Rahu: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
      Ketu: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    };
    return colors[lord] || "text-slate-300 bg-slate-800/50";
  };

  const tabs = [
    { id: "cast", label: "Birth Chart Cast", icon: Sparkles },
    { id: "dashboard", label: "Horoscope Dashboard", icon: Compass },
    { id: "charts", label: "Planetary Charts", icon: Layers },
    { id: "dashas", label: "Vimshottari Dasha", icon: Calendar },
    { id: "yogas", label: "Yogas & Doshas", icon: Award },
    { id: "compatibility", label: "Marriage Match", icon: Heart },
    { id: "muhurtas", label: "Daily Muhurta", icon: Clock },
    { id: "chat", label: "JHora AI Chat", icon: MessageSquare },
    { id: "android", label: "Android Design System", icon: Smartphone },
    { id: "acceptance", label: "API Acceptance & Caching", icon: Activity },
  ];


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200" id="app-root-container">
      {/* HEADER BAR */}
      <header className="border-b border-indigo-500/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-amber-500/5">
              <span className="text-xl font-bold font-mono text-slate-950">ॐ</span>
            </div>
            <div>
              <h1 className="text-lg font-sans font-medium text-amber-100 tracking-tight flex items-center gap-2">
                JHora AI
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded-md border border-amber-500/20">
                  Professional
                </span>
                {isOnline ? (
                  <span className="text-[9px] flex items-center gap-1 uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-md border border-green-500/20">
                    <Wifi className="w-2.5 h-2.5" />
                    Online
                  </span>
                ) : (
                  <span className="text-[9px] flex items-center gap-1 uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded-md border border-rose-500/20">
                    <WifiOff className="w-2.5 h-2.5" />
                    Offline (Cache Active)
                  </span>
                )}
              </h1>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                Advanced Jyotish Computational Intelligence
              </p>
            </div>
          </div>

          {/* Cast Details Quick Summary */}
          {astrologyData && (
            <div className="flex items-center gap-4 bg-slate-900/50 border border-indigo-500/10 rounded-xl px-4 py-2 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Current Native:</span>
                <span className="font-semibold text-amber-300">{astrologyData.birthDetails.name}</span>
              </div>
              <div className="border-l border-indigo-500/10 pl-4">
                <span className="text-slate-400 font-medium block">Lagna / Ascendant:</span>
                <span className="font-semibold text-indigo-300">{astrologyData.lagna.sign} ({astrologyData.lagna.degree.toFixed(1)}°)</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR: Navigation Menu, Saved Charts & Philosophy */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6" id="tabs-navigation-panel">
          {/* Navigation Menu */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-4 shadow-xl space-y-1 sticky top-24">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-2 px-1 border-b border-indigo-500/10 pb-2">
              Navigation Menu
            </span>
            <div className="flex flex-col gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all border text-left cursor-pointer ${
                      isActive
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/35 shadow-sm font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border-transparent"
                    }`}
                    id={`tab-btn-${tab.id}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>




        </div>

        {/* MAIN DISPLAY: dynamic tab content */}
        <div className="md:col-span-8 lg:col-span-9 min-h-[450px]" id="tab-body-container">
          {loading ? (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-4" />
                <span className="text-sm text-slate-400 font-mono">Casting chart & calculating dasha trees...</span>
              </div>
            ) : activeTab === "cast" ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key="cast"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl space-y-6" id="cast-tab">
                    <div className="border-b border-indigo-500/10 pb-4">
                      <h3 className="text-xl font-sans font-medium text-amber-100 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Birth Chart Cast
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Configure the exact astronomical parameters of the native. Sidereal planetary positions are computed using Lahiri offsets.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Primary Birth Parameters */}
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
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] text-slate-400 font-medium mb-1">Birth Date</label>
                            <input
                              type="date"
                              value={inputs.date}
                              onChange={(e) => setInputs({ ...inputs, date: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 font-medium mb-1">Birth Time (24h)</label>
                            <input
                              type="time"
                              value={inputs.time}
                              onChange={(e) => setInputs({ ...inputs, time: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] text-slate-400 font-medium">Location / City</label>
                            <button
                              type="button"
                              onClick={handleUseGps}
                              disabled={fetchingGps}
                              className="text-[10px] text-amber-500 hover:text-amber-400 font-mono flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0 select-none disabled:opacity-50"
                              title="Fetch your current coordinates using your device GPS"
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
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            {searchingLocation && (
                              <div className="absolute right-2.5 top-2.5">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                              </div>
                            )}
                          </div>

                          {showLocationDropdown && (
                            <div 
                              className="fixed inset-0 z-40 bg-transparent" 
                              onClick={() => setShowLocationDropdown(false)} 
                            />
                          )}

                          {showLocationDropdown && locationResults.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-900 scrollbar-thin">
                              {locationResults.map((result, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSelectLocation(result)}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-900/60 transition-colors flex flex-col cursor-pointer border-0 bg-transparent"
                                >
                                  <span className="font-semibold text-slate-200">
                                    {result.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    {result.admin1 ? `${result.admin1}, ` : ''}{result.country} • Lat: {result.latitude.toFixed(4)} Lon: {result.longitude.toFixed(4)} • TZ: {result.timezone}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {showLocationDropdown && inputs.location.trim().length >= 3 && locationResults.length === 0 && !searchingLocation && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 shadow-xl text-center text-[10px] text-slate-500 font-mono">
                              No matching locations found on the internet.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Coordinate Offsets */}
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
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 font-mono uppercase">Longitude (°E)</label>
                            <input
                              type="number"
                              step="0.0001"
                              value={inputs.longitude}
                              onChange={(e) => setInputs({ ...inputs, longitude: Number(e.target.value) })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-mono uppercase">Timezone (GMT/UTC Offset)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={inputs.timezone}
                            onChange={(e) => setInputs({ ...inputs, timezone: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => handleCalculate(false)}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-sans font-semibold rounded-xl py-3 text-xs transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
                            id="btn-cast-horoscope"
                          >
                            {loading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                                Calculating Celestial Positions...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950/20" />
                                Calculate & Cast Horoscope
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Display cast success status if astrologyData is present */}
                    {astrologyData && (
                      <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-xs text-green-300 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          Chart successfully cast for <strong className="text-white">{astrologyData.birthDetails.name}</strong>.
                        </span>
                        <button
                          onClick={() => setActiveTab("dashboard")}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-200 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          View Dashboard
                        </button>
                      </div>
                    )}

                    {/* Display saved caches directly below the View Dashboard block inside the Cast Page */}
                    <div className="border-t border-indigo-500/15 pt-6 mt-4">
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-amber-500" />
                          Saved Birth Charts (IndexedDB Cache)
                        </span>
                        {cachedList.length > 0 && (
                          <button
                            onClick={handleClearAllRecords}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-medium transition-colors flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear All
                          </button>
                        )}
                      </h4>

                      {cachedList.length === 0 ? (
                        <div className="text-center py-8 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                          <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                          No saved birth charts found. Submit the parameters above to automatically save a new chart.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                          {cachedList.map((rec) => (
                            <div
                              key={rec.id}
                              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-xs font-semibold text-amber-200 truncate block">
                                    {rec.name}
                                  </span>
                                  <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                    {rec.data?.lagna?.sign ? `${rec.data.lagna.sign} Asc` : 'Chart'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1.5 space-y-0.5">
                                  <div>📅 {rec.date} • 🕒 {rec.time}</div>
                                  <div className="truncate">📍 {rec.location}</div>
                                  <div className="text-[9px] text-slate-500 font-mono">
                                    Lat: {rec.latitude}°N • Lon: {rec.longitude}°E • GMT: {rec.timezone >= 0 ? `+${rec.timezone}` : rec.timezone}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-900/60">
                                <button
                                  onClick={() => handleLoadCachedParametersOnly(rec)}
                                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans font-semibold rounded-lg py-1.5 text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-amber-500/5"
                                >
                                  Load Parameters
                                </button>
                                <button
                                  onClick={(e) => handleDeleteRecord(rec.id, e)}
                                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer border border-rose-500/20 flex items-center justify-center"
                                  title="Delete Chart"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : activeTab === "android" ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key="android"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <AndroidDesignSystem />
                </motion.div>
              </AnimatePresence>
            ) : activeTab === "acceptance" ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key="acceptance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ApiAcceptanceDashboard />
                </motion.div>
              </AnimatePresence>
            ) : astrologyData ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Horosope Dashboard */}
                  {activeTab === "dashboard" && (
                    <div className="space-y-6" id="dashboard-tab">
                      {/* Overview Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5 flex flex-col justify-between">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Birth Star / Nakshatra</span>
                          <h3 className="text-xl font-semibold text-white mt-1">
                            {astrologyData.planets.find(p => p.name === "Moon")?.nakshatra}
                          </h3>
                          <span className="text-xs text-indigo-300 font-mono mt-0.5">
                            Pada {astrologyData.planets.find(p => p.name === "Moon")?.pada} — Lord: {astrologyData.planets.find(p => p.name === "Moon")?.lord}
                          </span>
                        </div>

                        <div className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5 flex flex-col justify-between">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Rasi (Moon Sign)</span>
                          <h3 className="text-xl font-semibold text-white mt-1">
                            {astrologyData.planets.find(p => p.name === "Moon")?.sign}
                          </h3>
                          <span className="text-xs text-indigo-300 font-mono mt-0.5">
                            Natal Moon in House {astrologyData.planets.find(p => p.name === "Moon")?.house}
                          </span>
                        </div>

                        <div className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5 flex flex-col justify-between">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Lagna (Ascendant)</span>
                          <h3 className="text-xl font-semibold text-white mt-1">
                            {astrologyData.lagna.sign}
                          </h3>
                          <span className="text-xs text-indigo-300 font-mono mt-0.5">
                            Ascendant Sign Degree: {astrologyData.lagna.degree.toFixed(2)}°
                          </span>
                        </div>
                      </div>

                      {/* Planet Positions Table */}
                      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl">
                        <h3 className="text-sm font-semibold text-slate-200 border-b border-indigo-500/10 pb-3 mb-4 flex items-center justify-between">
                          <span>Grahas (Planetary Positions)</span>
                          <span className="text-xs text-slate-400 font-mono font-medium">Sidereal Lahiri Ayanamsa</span>
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-sans">
                            <thead>
                              <tr className="border-b border-indigo-500/10 text-slate-400">
                                <th className="pb-3 font-medium">Planet (Graha)</th>
                                <th className="pb-3 font-medium">Longitude</th>
                                <th className="pb-3 font-medium">Zodiac Sign (Rasi)</th>
                                <th className="pb-3 font-medium">House (Bhava)</th>
                                <th className="pb-3 font-medium">Nakshatra (Pada)</th>
                                <th className="pb-3 font-medium">Nak Lord</th>
                                <th className="pb-3 font-medium text-right">Shadbala Strength</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-500/5">
                              {astrologyData.planets.map((p) => (
                                <tr key={p.name} className="hover:bg-slate-900/20 transition-colors">
                                  <td className="py-3 font-semibold text-slate-100 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    {p.name}
                                  </td>
                                  <td className="py-3 font-mono text-slate-400">{p.longitude.toFixed(2)}°</td>
                                  <td className="py-3 text-amber-300/90 font-medium">
                                    {p.sign} <span className="text-xs text-slate-500">({p.degree.toFixed(1)}°)</span>
                                  </td>
                                  <td className="py-3 font-mono text-slate-200">H{p.house}</td>
                                  <td className="py-3 text-slate-300">
                                    {p.nakshatra} <span className="text-xs text-slate-500">(P{p.pada})</span>
                                  </td>
                                  <td className="py-3">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${getLordColor(p.lord)}`}>
                                      {p.lord}
                                    </span>
                                  </td>
                                  <td className="py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="font-mono font-bold text-slate-200">{p.strength}%</span>
                                      <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className="bg-amber-500 h-full"
                                          style={{ width: `${p.strength}%` }}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Astro Charts */}
                  {activeTab === "charts" && (
                    <AstroChart
                      rasiChart={astrologyData.rasiChart}
                      navamsaChart={astrologyData.navamsaChart}
                      lagnaSignIndex={astrologyData.lagna.signIndex}
                      lagnaSignName={astrologyData.lagna.sign}
                    />
                  )}

                  {/* Vimshottari Dashas */}
                  {activeTab === "dashas" && (
                    <DashaTree dashas={astrologyData.dashas} />
                  )}

                  {/* Yogas & Doshas */}
                  {activeTab === "yogas" && (
                    <div className="space-y-6" id="yogas-doshas-tab">
                      {/* Overview explanation */}
                      <div className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5">
                        <h4 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-500" />
                          Celestial Combinations (Yogas & Doshas)
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Yogas represent highly specific configurations of planets that release auspicious and powerful karmic energies, granting intelligence, success, or resilience. Doshas represent critical imbalances calling for lifestyle refinements and conscious remedies.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Yogas Side */}
                        <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-6 shadow-xl space-y-4">
                          <h3 className="text-base font-semibold text-amber-400 border-b border-indigo-500/10 pb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            Auspicious Astrological Yogas
                          </h3>
                          <div className="space-y-4">
                            {astrologyData.yogas.map((y) => (
                              <div
                                key={y.name}
                                className={`p-4 rounded-xl border transition-all ${
                                  y.isPresent
                                    ? "bg-green-500/5 border-green-500/30"
                                    : "bg-slate-950/20 border-slate-800/80 opacity-60"
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <h4 className="text-xs font-bold text-white">{y.name}</h4>
                                  <span
                                    className={`text-[8px] font-mono uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded ${
                                      y.isPresent
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-slate-800 text-slate-500"
                                    }`}
                                  >
                                    {y.isPresent ? "ACTIVE" : "INACTIVE"}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 block mb-2">{y.description}</span>
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                  {y.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Doshas Side */}
                        <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-6 shadow-xl space-y-4">
                          <h3 className="text-base font-semibold text-rose-400 border-b border-indigo-500/10 pb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            Astrological Challenges (Doshas)
                          </h3>
                          <div className="space-y-4">
                            {/* Manglik */}
                            <div className={`p-4 rounded-xl border transition-all ${
                              astrologyData.doshas.manglik.isPresent
                                ? "bg-rose-500/5 border-rose-500/30"
                                : "bg-slate-950/20 border-slate-800/80"
                            }`}>
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="text-xs font-bold text-white">Manglik Dosha (Kuja Dosha)</h4>
                                <span className={`text-[8px] font-mono uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded ${
                                  astrologyData.doshas.manglik.isPresent ? "bg-rose-500/25 text-rose-400" : "bg-green-500/20 text-green-400"
                                }`}>
                                  {astrologyData.doshas.manglik.isPresent ? "PRESENT" : "ABSENT"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                                {astrologyData.doshas.manglik.explanation}
                              </p>
                            </div>

                            {/* Kaal Sarp */}
                            <div className={`p-4 rounded-xl border transition-all ${
                              astrologyData.doshas.kaalSarp.isPresent
                                ? "bg-rose-500/5 border-rose-500/30"
                                : "bg-slate-950/20 border-slate-800/80"
                            }`}>
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="text-xs font-bold text-white">Kaal Sarp Dosha</h4>
                                <span className={`text-[8px] font-mono uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded ${
                                  astrologyData.doshas.kaalSarp.isPresent ? "bg-rose-500/25 text-rose-400" : "bg-green-500/20 text-green-400"
                                }`}>
                                  {astrologyData.doshas.kaalSarp.isPresent ? "PRESENT" : "ABSENT"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                                {astrologyData.doshas.kaalSarp.explanation}
                              </p>
                            </div>

                            {/* Sade Sati */}
                            <div className={`p-4 rounded-xl border transition-all ${
                              astrologyData.doshas.sadeSati.isPresent
                                ? "bg-rose-500/5 border-rose-500/30"
                                : "bg-slate-950/20 border-slate-800/80"
                            }`}>
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="text-xs font-bold text-white">Shani Sade Sati Cycle</h4>
                                <span className={`text-[8px] font-mono uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded ${
                                  astrologyData.doshas.sadeSati.isPresent ? "bg-amber-500/25 text-amber-400" : "bg-green-500/20 text-green-400"
                                }`}>
                                  {astrologyData.doshas.sadeSati.isPresent ? "ACTIVE" : "INACTIVE"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                                {astrologyData.doshas.sadeSati.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Compatibility Milan */}
                  {activeTab === "compatibility" && (
                    <CompatibilityTab />
                  )}

                  {/* Daily Muhurtas */}
                  {activeTab === "muhurtas" && (
                    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl space-y-6" id="muhurtas-tab">
                      <div>
                        <h3 className="text-xl font-sans font-medium text-amber-100 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-amber-500" />
                          Auspicious & Inauspicious Timings (Choghadiya)
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Calculated based on local solar sunrise times for the Cast date, showcasing Abhijit and Brahma Muhurtas.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                m.isAuspicious
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-rose-500/20 text-rose-400"
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
                                      idx < m.score
                                        ? m.isAuspicious
                                          ? "bg-amber-400"
                                          : "bg-rose-400"
                                        : "bg-slate-800"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* JHora AI Chat */}
                  {activeTab === "chat" && (
                    <AstroChat astrologyData={astrologyData} />
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              /* Cast prompt if state is empty */
              <div className="bg-slate-900/30 border border-indigo-500/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                <Sparkles className="w-8 h-8 text-amber-500 mb-4 animate-pulse" />
                <h4 className="text-sm font-semibold text-slate-300">Birth Chart Calculation Required</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">Please configure and cast your birth chart first to unlock the interactive horoscope analyses.</p>
                <button
                  onClick={() => setActiveTab("cast")}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4.5 py-2 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  Go to Birth Chart Cast
                </button>
              </div>
            )}
          </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-indigo-500/10 py-6 px-6 bg-slate-950/60 text-center mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <span>© 2026 JHora AI Professional. All celestial alignments computed locally.</span>
          <span className="text-indigo-400/80">Crafted with Vedic Compassion & Antigravity Intelligence</span>
        </div>
      </footer>
    </div>
  );
}
