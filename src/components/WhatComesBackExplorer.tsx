import React, { useState, useEffect } from "react";
import { apiFetch as fetch } from "../lib/api";
import { 
  Database, 
  FileJson, 
  User, 
  Compass, 
  Sun, 
  Calendar, 
  Layers, 
  Clock, 
  Zap, 
  ShieldAlert, 
  MapPin, 
  Heart,
  ChevronRight,
  ChevronDown,
  Info,
  Search,
  Award,
  AlertCircle,
  CalendarRange,
  ArrowRight,
  Star,
  Check,
  X,
  Play,
  Activity,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface WhatComesBackExplorerProps {
  initialData?: any;
}

// Zodiac Sign names in standard sequence
const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Helper to get sign name for South Indian Box (which starts at Pisces, then goes clockwise)
const getSignName = (idx: number) => {
  const signs = ["Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius"];
  return signs[idx];
};

export default function WhatComesBackExplorer({ initialData }: WhatComesBackExplorerProps) {
  // 6 Primary submenus representing the 6 API Endpoints
  const [activeEndpoint, setActiveEndpoint] = useState<
    "horoscope" | "marriage" | "gochara" | "ingress" | "muhurta" | "autocomplete"
  >("horoscope");

  const [loading, setLoading] = useState(false);

  // States for each Endpoint's responses
  const [horoData, setHoroData] = useState<any>(null);
  const [marriageData, setMarriageData] = useState<any>(null);
  const [gocharaData, setGocharaData] = useState<any>(null);
  const [ingressData, setIngressData] = useState<any>(null);
  const [muhurtaData, setMuhurtaData] = useState<any>(null);
  const [autocompleteData, setAutocompleteData] = useState<any>(null);

  // 1. Horoscope parameters & internal tab state
  const [horoParams, setHoroParams] = useState({
    date: "1995-10-15",
    time: "08:30:00",
    place: "New Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5
  });
  const [horoTab, setHoroTab] = useState<
    "panchanga" | "planets" | "charts" | "dashas" | "yogas" | "doshas" | "arudhas" | "strengths" | "ashtakavarga" | "longevity"
  >("panchanga");
  const [selectedVarga, setSelectedVarga] = useState<string>("D1");
  const [selectedBavPlanet, setSelectedBavPlanet] = useState<string>("Jupiter");
  const [activeDashaSystem, setActiveDashaSystem] = useState<"vimshottari" | "yogini" | "ashtottari">("vimshottari");

  // Expanded dasha keys for collapsible tree
  const [expandedMaha, setExpandedMaha] = useState<string | null>(null);
  const [expandedAntar, setExpandedAntar] = useState<string | null>(null);

  // 2. Marriage Match parameters
  const [marriageParams, setMarriageParams] = useState({
    boy_birth_details: {
      name: "Boy",
      date: "1995-10-15",
      time: "08:30:00",
      place: "New Delhi",
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5
    },
    girl_birth_details: {
      name: "Girl",
      date: "1997-12-20",
      time: "14:15:00",
      place: "Mumbai",
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 5.5
    }
  });

  // 3. Gochara parameters
  const [gocharaParams, setGocharaParams] = useState({
    date: "1995-10-15",
    time: "08:30:00",
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    target_date: "2026-07-15"
  });

  // 4. Planet Ingress parameters
  const [ingressParams, setIngressParams] = useState({
    from_date: "2026-01-01",
    to_date: "2026-12-31",
    planets: ["Saturn", "Jupiter", "Mars"]
  });

  // 5. Muhurta parameters
  const [muhurtaParams, setMuhurtaParams] = useState({
    date: "2026-07-15"
  });

  // 6. Autocomplete parameters
  const [autocompleteQuery, setAutocompleteQuery] = useState("Delhi");

  // Primary navigation submenus definition
  const submenus = [
    { id: "horoscope", name: "POST /horoscope", label: "Full Horoscope", icon: User, description: "Birth chart, divisional vargas, dashas, yogas, doshas & strength" },
    { id: "marriage", name: "POST /marriage-match", label: "Marriage Compatibility", icon: Heart, description: "Ashtakoota Milan, Guna matching points and marital compatibility" },
    { id: "gochara", name: "POST /gochara", label: "Planetary Transits", icon: Compass, description: "Celestial planetary transits map for a given target date" },
    { id: "ingress", name: "POST /planet-ingress", label: "Planetary Ingress", icon: CalendarRange, description: "Signs transition timeline & transit crossing dates" },
    { id: "muhurta", name: "GET /muhurta/events", label: "Daily Muhurta", icon: Clock, description: "Auspicious & inauspicious daily Muhurtas with scores" },
    { id: "autocomplete", name: "GET /location/autocomplete", label: "Location Lookup", icon: MapPin, description: "City names autocomplete and GPS coordinates lookup" },
  ];

  // Load baseline horoscope on mount if initialData is provided
  useEffect(() => {
    if (initialData) {
      setHoroData(initialData);
    } else {
      triggerHoroFetch();
    }
  }, [initialData]);

  // Execute trigger functions for each endpoint
  const triggerHoroFetch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jhora/horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(horoParams)
      });
      const data = await res.json();
      setHoroData(data);
    } catch (e) {
      console.error("Horoscope fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const triggerMarriageFetch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jhora/marriage-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(marriageParams)
      });
      const data = await res.json();
      setMarriageData(data);
    } catch (e) {
      console.error("Marriage fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const triggerGocharaFetch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jhora/gochara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gocharaParams)
      });
      const data = await res.json();
      setGocharaData(data);
    } catch (e) {
      console.error("Gochara fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const triggerIngressFetch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jhora/planet-ingress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingressParams)
      });
      const data = await res.json();
      setIngressData(data);
    } catch (e) {
      console.error("Ingress fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const triggerMuhurtaFetch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jhora/muhurta/events");
      const data = await res.json();
      setMuhurtaData(data);
    } catch (e) {
      console.error("Muhurta fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const triggerAutocompleteFetch = async () => {
    if (!autocompleteQuery || autocompleteQuery.trim().length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jhora/location/autocomplete?query=${encodeURIComponent(autocompleteQuery)}`);
      const data = await res.json();
      setAutocompleteData(data);
    } catch (e) {
      console.error("Autocomplete fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Helper to fetch whatever is active
  const handleExecute = () => {
    if (activeEndpoint === "horoscope") triggerHoroFetch();
    else if (activeEndpoint === "marriage") triggerMarriageFetch();
    else if (activeEndpoint === "gochara") triggerGocharaFetch();
    else if (activeEndpoint === "ingress") triggerIngressFetch();
    else if (activeEndpoint === "muhurta") triggerMuhurtaFetch();
    else if (activeEndpoint === "autocomplete") triggerAutocompleteFetch();
  };

  // Pre-load data when switching menus if empty
  const handleMenuSwitch = (menuId: any) => {
    setActiveEndpoint(menuId);
    if (menuId === "marriage" && !marriageData) {
      // Trigger a default compatibility run
      setLoading(true);
      fetch("/api/jhora/marriage-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(marriageParams)
      }).then(r => r.json()).then(d => { setMarriageData(d); setLoading(false); }).catch(() => setLoading(false));
    } else if (menuId === "gochara" && !gocharaData) {
      setLoading(true);
      fetch("/api/jhora/gochara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gocharaParams)
      }).then(r => r.json()).then(d => { setGocharaData(d); setLoading(false); }).catch(() => setLoading(false));
    } else if (menuId === "ingress" && !ingressData) {
      setLoading(true);
      fetch("/api/jhora/planet-ingress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingressParams)
      }).then(r => r.json()).then(d => { setIngressData(d); setLoading(false); }).catch(() => setLoading(false));
    } else if (menuId === "muhurta" && !muhurtaData) {
      setLoading(true);
      fetch("/api/jhora/muhurta/events").then(r => r.json()).then(d => { setMuhurtaData(d); setLoading(false); }).catch(() => setLoading(false));
    } else if (menuId === "autocomplete" && !autocompleteData) {
      setLoading(true);
      fetch("/api/jhora/location/autocomplete?query=Delhi").then(r => r.json()).then(d => { setAutocompleteData(d); setLoading(false); }).catch(() => setLoading(false));
    }
  };

  // Helper to map grid box coordinates in clockwise South Indian Chart
  const getGridPositionClass = (idx: number) => {
    switch (idx) {
      case 0: return "col-start-1 row-start-1"; // Pisces
      case 1: return "col-start-2 row-start-1"; // Aries
      case 2: return "col-start-3 row-start-1"; // Taurus
      case 3: return "col-start-4 row-start-1"; // Gemini
      case 4: return "col-start-4 row-start-2"; // Cancer
      case 5: return "col-start-4 row-start-3"; // Leo
      case 6: return "col-start-4 row-start-4"; // Virgo
      case 7: return "col-start-3 row-start-4"; // Libra
      case 8: return "col-start-2 row-start-4"; // Scorpio
      case 9: return "col-start-1 row-start-4"; // Sag
      case 10: return "col-start-1 row-start-3"; // Cap
      case 11: return "col-start-1 row-start-2"; // Aqu
      default: return "";
    }
  };

  // Fetch occupants for South Indian grid box
  const getOccupantsForSouthIndianBox = (vargaChart: any, boxIdx: number, selectedVargaName: string) => {
    const occupants: string[] = [];
    if (!vargaChart || !horoData) return occupants;

    const lagna = horoData.horoscope?.sphuta?.Lagna || horoData.horoscope?.sphuta?.Ascendant;
    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const d1LagnaSignIdx = lagna ? signs.indexOf(lagna.sign) : 0;

    // Get correct lagna sign index for this varga
    const vargaLagnas = horoData.horoscope.varga_lagnas || {};
    const lagnaSignIdx = vargaLagnas[selectedVargaName] !== undefined ? vargaLagnas[selectedVargaName] : d1LagnaSignIdx;

    // Standard zodiac index corresponding to clockwise boxIdx (boxIdx 0 is Pisces: std index 11)
    const boxStandardZodiacIdx = (boxIdx - 1 + 12) % 12;

    Object.entries(vargaChart).forEach(([houseStr, pNames]: [string, any]) => {
      const houseNum = parseInt(houseStr, 10);
      const houseStandardZodiacIdx = (lagnaSignIdx + houseNum - 1) % 12;
      if (houseStandardZodiacIdx === boxStandardZodiacIdx) {
        pNames.forEach((pName: string) => {
          occupants.push(pName);
        });
      }
    });

    if (boxStandardZodiacIdx === lagnaSignIdx) {
      occupants.push("Asc");
    }

    return occupants;
  };

  // Retrieve current active raw json payload to display below
  const getActiveJsonPayload = () => {
    if (activeEndpoint === "horoscope") return horoData || { info: "Run Horoscope calculation first." };
    if (activeEndpoint === "marriage") return marriageData || { info: "Run Marriage Match calculation first." };
    if (activeEndpoint === "gochara") return gocharaData || { info: "Run Gochara calculations first." };
    if (activeEndpoint === "ingress") return ingressData || { info: "Run Ingress calculations first." };
    if (activeEndpoint === "muhurta") return muhurtaData || { info: "Fetch daily Muhurtas first." };
    if (activeEndpoint === "autocomplete") return autocompleteData || { info: "Type a search query first." };
    return {};
  };

  // Quick Action: Apply Autocomplete selection to other forms
  const applyCoordinatesFromSearch = (result: any) => {
    const label = `${result.name}, ${result.country}`;
    const latNum = Number(Number(result.latitude || 0).toFixed(4));
    const lngNum = Number(Number(result.longitude || 0).toFixed(4));
    
    // Set for horoscope
    setHoroParams(prev => ({
      ...prev,
      place: label,
      latitude: latNum,
      longitude: lngNum
    }));

    // Set for Gochara
    setGocharaParams(prev => ({
      ...prev,
      latitude: latNum,
      longitude: lngNum
    }));

    alert(`Applied coordinates for "${label}" (Lat: ${latNum}, Lon: ${lngNum}) to both Horoscope and Gochara forms successfully!`);
  };

  // Load Horoscope parameters to Boy or Girl parameters
  const loadHoroParamsToBoy = () => {
    setMarriageParams(prev => ({
      ...prev,
      boy_birth_details: {
        name: "Boy",
        date: horoParams.date,
        time: horoParams.time,
        place: horoParams.place,
        latitude: horoParams.latitude,
        longitude: horoParams.longitude,
        timezone: horoParams.timezone
      }
    }));
  };

  const loadHoroParamsToGirl = () => {
    setMarriageParams(prev => ({
      ...prev,
      girl_birth_details: {
        name: "Girl",
        date: horoParams.date,
        time: horoParams.time,
        place: horoParams.place,
        latitude: horoParams.latitude,
        longitude: horoParams.longitude,
        timezone: horoParams.timezone
      }
    }));
  };

  return (
    <div className="space-y-6" id="what-comes-back-explorer-root">
      
      {/* 2-Column Dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Endpoints Selection Submenu */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/60 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-4 shadow-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-3 px-1 pb-2 border-b border-indigo-500/10">
              API Endpoint Submenus
            </span>
            <div className="space-y-1">
              {submenus.map((menu) => {
                const IconComp = menu.icon;
                const isSelected = activeEndpoint === menu.id;
                return (
                  <button
                    key={menu.id}
                    onClick={() => handleMenuSwitch(menu.id)}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all border ${
                      isSelected 
                        ? "bg-gradient-to-r from-amber-500/10 to-indigo-500/5 border-amber-500/35 text-white shadow-sm" 
                        : "hover:bg-slate-950/40 text-slate-400 hover:text-white border-transparent"
                    }`}
                    id={`submenu-btn-${menu.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${isSelected ? "bg-amber-500/10" : "bg-slate-950/40"}`}>
                        <IconComp className={`w-4 h-4 ${isSelected ? "text-amber-400 animate-pulse" : "text-slate-500"}`} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-400 block tracking-tight leading-none mb-1">
                          {menu.name}
                        </span>
                        <span className="text-xs font-semibold block">{menu.label}</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-amber-500 transform translate-x-1" : "text-slate-600"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-slate-900/30 border border-indigo-500/10 rounded-2xl p-4 text-[11px] text-slate-400 leading-relaxed flex gap-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              Each submenu page displays dynamic inputs which trigger real API calls to verify precise alignments with Kotlin-designed payload data.
            </div>
          </div>
        </div>

        {/* Right Side: Active Endpoint Interface (Parameters & Visual Display) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Visualizer Area */}
          <div className="bg-slate-900/40 border border-indigo-500/20 rounded-3xl p-6 shadow-xl space-y-6 min-h-[450px]">
            
            {/* Header info bar */}
            <div className="border-b border-indigo-500/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                  Active API Endpoint View
                </span>
                <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                  {submenus.find(m => m.id === activeEndpoint)?.label}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {submenus.find(m => m.id === activeEndpoint)?.description}
                </p>
              </div>

              {/* Action Button to fire calculations */}
              <button
                onClick={handleExecute}
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-sans font-semibold text-xs rounded-xl px-4 py-2.5 flex items-center gap-2 transition-all shadow-md shadow-amber-500/15 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-slate-950/25 text-slate-950" />
                    Query API
                  </>
                )}
              </button>
            </div>

            {/* Render submenus parameter inputs & dynamic content */}
            
            {/* 1. HOROSCOPE ENDPOINT */}
            {activeEndpoint === "horoscope" && (
              <div className="space-y-6" id="endpoint-horoscope">
                
                {/* Horizontal inputs form */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-900">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase block">Birth Date</label>
                    <input 
                      type="date" 
                      value={horoParams.date} 
                      onChange={(e) => setHoroParams({ ...horoParams, date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase block">Birth Time</label>
                    <input 
                      type="text" 
                      value={horoParams.time} 
                      onChange={(e) => setHoroParams({ ...horoParams, time: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase block">Birth Place</label>
                    <input 
                      type="text" 
                      value={horoParams.place} 
                      onChange={(e) => setHoroParams({ ...horoParams, place: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase block">Latitude</label>
                    <input 
                      type="number" 
                      step="0.0001"
                      value={horoParams.latitude} 
                      onChange={(e) => setHoroParams({ ...horoParams, latitude: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase block">Longitude</label>
                    <input 
                      type="number" 
                      step="0.0001"
                      value={horoParams.longitude} 
                      onChange={(e) => setHoroParams({ ...horoParams, longitude: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase block">Timezone</label>
                    <input 
                      type="number" 
                      step="0.5"
                      value={horoParams.timezone} 
                      onChange={(e) => setHoroParams({ ...horoParams, timezone: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                </div>

                {horoData && horoData.horoscope ? (
                  <div className="space-y-5">
                    
                    {/* Birth Echo & Lagna Profile Header */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/20 p-4 rounded-2xl border border-slate-800/80">
                      {/* Birth Details Echo */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">Birth Details Echo (Validated Inputs)</span>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                          <div>
                            <span className="text-slate-400">Native Name:</span>{" "}
                            <span className="font-semibold text-white">{horoData.birthDetails?.name || "Nitin"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Date of Birth:</span>{" "}
                            <span className="font-semibold text-white">{horoData.birthDetails?.date}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Time of Birth:</span>{" "}
                            <span className="font-semibold text-white font-mono">{horoData.birthDetails?.time}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Timezone:</span>{" "}
                            <span className="font-semibold text-white font-mono">UTC {horoData.birthDetails?.timezone >= 0 ? "+" : ""}{horoData.birthDetails?.timezone}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400">Place:</span>{" "}
                            <span className="font-semibold text-amber-200">{horoData.birthDetails?.location}</span>{" "}
                            <span className="text-slate-500 text-[10px] font-mono">({horoData.birthDetails?.latitude?.toFixed(4)}° N, {horoData.birthDetails?.longitude?.toFixed(4)}° E)</span>
                          </div>
                        </div>
                      </div>

                      {/* Lagna Profile */}
                      <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800/80 pt-2 md:pt-0 md:pl-4">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">Ascendant (Lagna) Profile</span>
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-center min-w-[90px]">
                            <span className="text-[9px] font-mono text-amber-400 uppercase font-bold block">Asc Sign</span>
                            <span className="text-xs font-extrabold text-white">{horoData.lagna?.sign || "Aries"}</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div>
                              <span className="text-slate-400">Exact Degree:</span>{" "}
                              <span className="font-mono font-bold text-white">{(horoData.lagna?.degree || 0).toFixed(2)}°</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Nakshatra:</span>{" "}
                              <span className="font-semibold text-amber-300">{horoData.lagna?.nakshatra || "Ashwini"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Pada (Quarter):</span>{" "}
                              <span className="font-bold text-white">Pada {horoData.lagna?.pada || 1}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Horizontal tabs inside Horoscope Explorer */}
                    <div className="flex flex-wrap border-b border-indigo-500/10 gap-4 text-xs font-medium overflow-x-auto pb-1 scrollbar-thin">
                      {[
                        { id: "panchanga", label: "Panchanga", icon: Calendar },
                        { id: "planets", label: "Grahas", icon: Sun },
                        { id: "charts", label: "Vargas (Charts)", icon: Layers },
                        { id: "strengths", label: "Shad Bala & Bhava Bala", icon: Zap },
                        { id: "ashtakavarga", label: "Ashtakavarga", icon: Database },
                        { id: "dashas", label: "Interactive Dashas", icon: Clock },
                        { id: "yogas", label: "Astrological Yogas", icon: Award },
                        { id: "doshas", label: "Celestial Doshas", icon: ShieldAlert },
                        { id: "arudhas", label: "Arudhas & Sphutas", icon: MapPin },
                        { id: "longevity", label: "Longevity", icon: Activity },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setHoroTab(tab.id as any)}
                          className={`pb-2 px-1 relative transition-colors ${
                            horoTab === tab.id 
                              ? "text-amber-400 font-bold" 
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {tab.label}
                          {horoTab === tab.id && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Horoscope Sub-views */}

                    {/* A. Panchanga attributes */}
                    {horoTab === "panchanga" && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in">
                        {Object.entries(horoData.horoscope.calendar_info || {}).map(([key, val]: [string, any]) => (
                          <div key={key} className="bg-slate-950/30 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
                            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">{key}</span>
                            <p className="text-xs font-bold text-white leading-tight mt-0.5">{val}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* B. Planets (Grahas) */}
                    {horoTab === "planets" && (
                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                              <th className="p-3 font-semibold">Graha</th>
                              <th className="p-3 font-semibold">Zodiac Sign (Rasi)</th>
                              <th className="p-3 font-semibold">Sign Degree</th>
                              <th className="p-3 font-semibold">Nakshatra (Pada)</th>
                              <th className="p-3 font-semibold">House</th>
                              <th className="p-3 font-semibold">Shadbala strength</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850 text-slate-300">
                            {Object.entries(horoData.horoscope.sphuta || {}).map(([name, p]: [string, any]) => {
                              return (
                                <tr key={name} className="hover:bg-slate-900/30 transition-colors">
                                  <td className="p-3 font-bold text-white">{name}</td>
                                  <td className="p-3 text-indigo-200">{p.sign}</td>
                                  <td className="p-3 font-mono">{(p.degree || 0).toFixed(2)}°</td>
                                  <td className="p-3">{p.nakshatra} (Pada {p.pada})</td>
                                  <td className="p-3 font-mono text-indigo-300">H{p.house}</td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-12 bg-slate-850 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                          className="bg-amber-500 h-full rounded-full" 
                                          style={{ width: `${p.strength || 65}%` }}
                                        />
                                      </div>
                                      <span className="font-mono text-[10px]">{p.strength || 65}%</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* C. Vargas Divisional Charts */}
                    {horoTab === "charts" && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                          <label className="text-xs font-semibold text-white">Select Divisional Chart (Varga):</label>
                          <select
                            value={selectedVarga}
                            onChange={(e) => setSelectedVarga(e.target.value)}
                            className="bg-slate-900 border border-indigo-500/25 rounded-lg px-3 py-1 text-xs text-amber-200 focus:border-amber-500 outline-none cursor-pointer font-semibold"
                          >
                            <option value="D1">D-1 Rasi (General Life)</option>
                            <option value="D2">D-2 Hora (Wealth/Prosperity)</option>
                            <option value="D3">D-3 Drekkana (Siblings/Energy)</option>
                            <option value="D4">D-4 Chaturthamsa (Properties/Home)</option>
                            <option value="D7">D-7 Saptamsa (Children/Progeny)</option>
                            <option value="D9">D-9 Navamsa (Dharma/Spouse)</option>
                            <option value="D10">D-10 Dasamsa (Career/Success)</option>
                            <option value="D12">D-12 Dwadasamsa (Parents/Ancestry)</option>
                            <option value="D16">D-16 Shodasamsa (Happiness/Vehicles)</option>
                            <option value="D20">D-20 Vimsamsa (Spirituality)</option>
                            <option value="D24">D-24 Chaturvimsamsa (Learning)</option>
                            <option value="D27">D-27 Saptavimsamsa (Strengths)</option>
                            <option value="D30">D-30 Trimsamsa (Obstacles/Evils)</option>
                            <option value="D40">D-40 Khavedamsa (Auspiciousness)</option>
                            <option value="D45">D-45 Akshavedamsa (All areas)</option>
                            <option value="D60">D-60 Shastiamsa (Karma/Samskara)</option>
                          </select>
                        </div>

                        {/* South Indian Chart Grid Layout */}
                        <div className="flex justify-center py-2">
                          <div className="grid grid-cols-4 grid-rows-4 gap-1.5 bg-slate-950 p-3.5 border border-indigo-500/15 rounded-2xl w-full max-w-[380px] aspect-square">
                            {Array.from({ length: 12 }).map((_, idx) => {
                              const signName = getSignName(idx);
                              const vargaChart = horoData.horoscope.divisional_charts?.[selectedVarga] || {};
                              const occupants = getOccupantsForSouthIndianBox(vargaChart, idx, selectedVarga);

                              return (
                                <div 
                                  key={idx} 
                                  className={`border border-slate-800/80 bg-slate-900/40 p-1.5 rounded-lg flex flex-col justify-between aspect-square overflow-hidden hover:border-indigo-500/30 transition-all ${getGridPositionClass(idx)}`}
                                >
                                  <span className="text-[8px] font-mono font-bold text-slate-500">{signName}</span>
                                  <div className="flex flex-wrap gap-0.5 mt-1 justify-center max-h-12 overflow-y-auto">
                                    {occupants.map((p) => {
                                      const isLagna = p === "Asc";
                                      return (
                                        <span 
                                          key={p} 
                                          className={`rounded px-1 py-0.5 text-[8px] font-bold leading-none ${
                                            isLagna 
                                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/35" 
                                              : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/25"
                                          }`}
                                        >
                                          {p.substring(0, 2)}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Center label block */}
                            <div className="col-span-2 row-span-2 col-start-2 row-start-2 bg-gradient-to-br from-indigo-950/20 to-slate-950/40 rounded-xl border border-indigo-500/10 flex flex-col items-center justify-center text-center p-2 select-none">
                              <span className="text-sm font-black text-amber-300 uppercase tracking-widest">{selectedVarga}</span>
                              <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase">South Indian Grid</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* D. Interactive Nested Dashas Tree */}
                    {horoTab === "dashas" && (
                      <div className="space-y-4 animate-fade-in">
                        
                        {/* Selector */}
                        <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-800 gap-1">
                          {["vimshottari", "yogini", "ashtottari"].map((sys) => (
                            <button
                              key={sys}
                              onClick={() => setActiveDashaSystem(sys as any)}
                              className={`flex-1 py-1.5 text-xs rounded-lg uppercase tracking-wider font-mono font-bold transition-all cursor-pointer ${
                                activeDashaSystem === sys 
                                  ? "bg-amber-500 text-slate-950 shadow font-extrabold" 
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              {sys}
                            </button>
                          ))}
                        </div>

                        {/* Expandable Scroll Panel */}
                        <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 max-h-[350px] overflow-y-auto scrollbar-thin space-y-2">
                          
                          {/* Vimshottari Recursive Tree Rendering */}
                          {activeDashaSystem === "vimshottari" && (
                            <div className="space-y-1.5 font-mono text-xs">
                              {horoData.horoscope.dashas?.vimshottari?.map((maha: any, mIdx: number) => {
                                const isMahaExpanded = expandedMaha === maha.lord;
                                return (
                                  <div key={mIdx} className="border border-indigo-500/5 hover:border-indigo-500/15 rounded-xl p-1 bg-slate-950/30">
                                    
                                    {/* Mahadasha Row */}
                                    <div 
                                      onClick={() => setExpandedMaha(isMahaExpanded ? null : maha.lord)}
                                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer hover:bg-slate-900/30 transition-colors ${isMahaExpanded ? "bg-indigo-500/5 text-amber-300" : "text-slate-200"}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {isMahaExpanded ? (
                                          <ChevronDown className="w-4 h-4 text-amber-500" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4 text-slate-500" />
                                        )}
                                        <span className="font-extrabold text-white">{maha.lord} Mahadasha</span>
                                      </div>
                                      <div className="text-[10px] text-indigo-400 font-bold bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                                        {maha.startDate} to {maha.endDate}
                                      </div>
                                    </div>

                                    {/* Antardashas */}
                                    {isMahaExpanded && (
                                      <div className="pl-4 pr-1 py-1 space-y-1 border-t border-slate-900/50 mt-1">
                                        {maha.subPeriods?.map((antar: any, aIdx: number) => {
                                          const isAntarExpanded = expandedAntar === `${maha.lord}_${antar.lord}`;
                                          return (
                                            <div key={aIdx} className="border-l border-slate-850 pl-2">
                                              
                                              {/* Antardasha Row */}
                                              <div 
                                                onClick={() => setExpandedAntar(isAntarExpanded ? null : `${maha.lord}_${antar.lord}`)}
                                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-slate-900/30 transition-colors ${isAntarExpanded ? "text-amber-200" : "text-slate-300"}`}
                                              >
                                                <div className="flex items-center gap-1.5">
                                                  {isAntarExpanded ? (
                                                    <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
                                                  ) : (
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                                  )}
                                                  <span className="font-semibold text-slate-200">{antar.lord} Antardasha</span>
                                                </div>
                                                <span className="text-[9px] text-slate-400">{antar.startDate} to {antar.endDate}</span>
                                              </div>

                                              {/* Pratyantardashas */}
                                              {isAntarExpanded && (
                                                <div className="pl-4 py-1 space-y-1 border-l border-slate-800">
                                                  {antar.subPeriods?.map((prat: any, pIdx: number) => (
                                                    <div key={pIdx} className="flex justify-between items-center p-1.5 rounded bg-slate-950/20 text-[10px] text-slate-400">
                                                      <span className="text-slate-300 font-medium">{prat.lord} Pratyantardasha</span>
                                                      <span>{prat.startDate} to {prat.endDate}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}

                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Yogini Dasha Systems */}
                          {activeDashaSystem === "yogini" && (
                            <div className="space-y-1 text-xs">
                              {horoData.horoscope.dashas?.yogini?.map((d: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-900 bg-slate-950/20 hover:border-slate-800 text-slate-300">
                                  <span className="font-semibold text-white">{d.lord}</span>
                                  <span className="font-mono text-[10px]">{d.startDate} to {d.endDate}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Ashtottari Dasha System */}
                          {activeDashaSystem === "ashtottari" && (
                            <div className="space-y-1 text-xs">
                              {horoData.horoscope.dashas?.ashtottari?.map((d: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-900 bg-slate-950/20 hover:border-slate-800 text-slate-300">
                                  <span className="font-semibold text-white">{d.lord} Major Period</span>
                                  <span className="font-mono text-[10px]">{d.startDate} to {d.endDate}</span>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                    {/* E. Proper Yogas Breakdown */}
                    {horoTab === "yogas" && (
                      <div className="space-y-4 animate-fade-in" id="horoscope-yogas-list">
                        
                        {/* Summary info */}
                        <div className="text-xs bg-indigo-500/5 border border-indigo-500/10 p-3.5 rounded-xl text-slate-300 flex items-center justify-between">
                          <span>Total Planetary Yogas Analyzed:</span>
                          <span className="font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                            {horoData.horoscope.yogas?.yoga_list ? Object.keys(horoData.horoscope.yogas.yoga_list).length : 7}
                          </span>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {horoData.horoscope.yogas?.yoga_list && Object.values(horoData.horoscope.yogas.yoga_list).map((y: any) => {
                            return (
                              <div 
                                key={y.name} 
                                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                                  y.isPresent 
                                    ? "bg-amber-500/5 border-amber-500/30 shadow-md shadow-amber-500/5" 
                                    : "bg-slate-950/20 border-slate-850 opacity-60"
                                }`}
                              >
                                <div>
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className={`text-xs font-bold leading-tight ${y.isPresent ? "text-amber-200" : "text-slate-400"}`}>
                                      {y.name}
                                    </h4>
                                    <span className={`text-[8px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md border ${
                                      y.isPresent 
                                        ? "bg-amber-500/15 text-amber-400 border-amber-500/25" 
                                        : "bg-slate-900 text-slate-500 border-slate-800"
                                    }`}>
                                      {y.isPresent ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                    {y.description}
                                  </p>
                                </div>

                                {y.isPresent ? (
                                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-2.5 text-[10px] text-amber-100/90 font-sans leading-relaxed flex items-start gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                    <span>{y.explanation}</span>
                                  </div>
                                ) : (
                                  <div className="bg-slate-900/40 p-2.5 rounded-xl text-[10px] text-slate-500 font-sans leading-relaxed flex items-start gap-1.5 border border-slate-900">
                                    <X className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                                    <span>This configuration is not formed in your birth chart.</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* F. Doshas & Sade Sati */}
                    {horoTab === "doshas" && (
                      <div className="space-y-4 animate-fade-in" id="horoscope-doshas-list">
                        
                        {/* Sade Sati Phase Card */}
                        <div className="bg-gradient-to-br from-slate-950 to-indigo-950/30 p-5 rounded-2xl border border-indigo-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">Saturn Sade Sati stage</span>
                            <h4 className="text-sm font-bold text-amber-200 mt-1">
                              {horoData.horoscope.sade_satis?.active ? `Sade Sati Active: ${horoData.horoscope.sade_satis.currentPhase}` : "Saturn Sade Sati is Inactive"}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Transiting Moon Sign: {horoData.horoscope.sade_satis?.transitMoonSign || "Not Active"}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                            horoData.horoscope.sade_satis?.active 
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/25 animate-pulse" 
                              : "bg-green-500/10 text-green-400 border-green-500/25"
                          }`}>
                            {horoData.horoscope.sade_satis?.active ? "Active Period" : "No active Sade Sati"}
                          </span>
                        </div>

                        {/* Manglik & Kaal Sarp details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Manglik status */}
                          <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-xl space-y-3">
                            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">Manglik Status (Kuja Dosha)</span>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-300">Manglik Score:</span>
                              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                {horoData.horoscope.doshas?.includes("Manglik") ? "High (Kuja present)" : "Safe (0/100)"}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              Determines planetary fire in relational and partnership areas of life.
                            </p>
                          </div>

                          {/* Kaal Sarp */}
                          <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-xl space-y-3">
                            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">Kaal Sarp Dosha Axis</span>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-300">Sarp Alignment:</span>
                              <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                {horoData.horoscope.doshas?.includes("KaalSarp") ? "Anant KaalSarp present" : "Axis free (No Dosha)"}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              Examines if celestial planets are enclosed between Node intersections.
                            </p>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* G. Arudhas & Special Sphutas */}
                    {horoTab === "arudhas" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in" id="horoscope-special-sphutas">
                        
                        {/* Arudhas */}
                        <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-2xl space-y-3">
                          <h4 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold border-b border-slate-800 pb-2 mb-2">Arudha Padas (Sphutas)</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(horoData.horoscope.arudhas || {}).slice(0, 8).map(([key, details]: [string, any]) => (
                              <div key={key} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
                                <span className="text-[9px] font-mono text-slate-500 block leading-tight font-bold">{details.label}</span>
                                <span className="font-bold text-amber-200 mt-1 block">House {details.house} ({details.sign})</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Special points and Arabic Parts */}
                        <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-2xl space-y-4">
                          <div>
                            <h4 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold border-b border-slate-800 pb-2 mb-2">Auspicious Sahams (Arabic Parts)</h4>
                            <div className="space-y-1.5 text-xs text-slate-300">
                              {Object.entries(horoData.horoscope.sahams || {}).map(([key, s]: [string, any]) => (
                                <div key={key} className="flex justify-between py-1 border-b border-slate-900/60 last:border-0">
                                  <span className="text-slate-400">{s.label}</span>
                                  <span className="font-mono text-amber-200">{s.sign} ({(s.degree || 0).toFixed(1)}°)</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold border-b border-slate-800 pb-2 mb-2">Chaya Grahas & Upagrahas</h4>
                            <div className="space-y-1.5 text-xs text-slate-300">
                              {Object.entries(horoData.horoscope.upagrahas || {}).map(([key, s]: [string, any]) => (
                                <div key={key} className="flex justify-between py-1 border-b border-slate-900/60 last:border-0">
                                  <span className="text-slate-400">{s.label}</span>
                                  <span className="font-mono text-slate-300">{s.sign} ({(s.degree || 0).toFixed(1)}°)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* H. Shad Bala & Bhava Bala (Strengths) */}
                    {horoTab === "strengths" && (
                      <div className="space-y-6 animate-fade-in" id="horoscope-strengths">
                        {/* Shad Bala Section */}
                        <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-2xl space-y-4">
                          <div className="border-b border-slate-850 pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">Planetary Shad Bala (Sixfold Strength)</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">Calculates global planetary potency based on positional, directional, temporal, and motional factors.</p>
                            </div>
                            <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">Unit: Shashtiamsa (Rupa)</span>
                          </div>

                          <div className="space-y-4">
                            {horoData.horoscope.shad_bala && Object.entries(horoData.horoscope.shad_bala).map(([pName, val]: [string, any]) => {
                              const ratio = val.ratio || (val.total / val.required);
                              const isStrong = ratio >= 1.0;
                              return (
                                <div key={pName} className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl space-y-2.5">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-white">{pName}</span>
                                      <span className={`text-[8px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                        isStrong 
                                          ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                      }`}>
                                        {isStrong ? "Strong" : "Average"}
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400">
                                      Scored: <span className="text-amber-200 font-bold">{val.total || val.scored}</span> / Req: {val.required} <span className="text-slate-500">({ratio.toFixed(2)}x)</span>
                                    </div>
                                  </div>

                                  {/* Progress bar */}
                                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${isStrong ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-amber-500 to-orange-400"}`}
                                      style={{ width: `${Math.min(ratio * 50, 100)}%` }}
                                    />
                                  </div>

                                  {/* Individual Balas breakdown */}
                                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 border-t border-slate-950 text-center">
                                    <div className="bg-slate-950/20 p-1.5 rounded">
                                      <span className="text-[7px] font-mono text-slate-500 block">Sthana (Pos)</span>
                                      <span className="text-[9px] font-mono font-bold text-slate-300">{val.sthanaBala || 120}</span>
                                    </div>
                                    <div className="bg-slate-950/20 p-1.5 rounded">
                                      <span className="text-[7px] font-mono text-slate-500 block">Dig (Dir)</span>
                                      <span className="text-[9px] font-mono font-bold text-slate-300">{val.digBala || 45}</span>
                                    </div>
                                    <div className="bg-slate-950/20 p-1.5 rounded">
                                      <span className="text-[7px] font-mono text-slate-500 block">Kala (Temp)</span>
                                      <span className="text-[9px] font-mono font-bold text-slate-300">{val.kalaBala || 180}</span>
                                    </div>
                                    <div className="bg-slate-950/20 p-1.5 rounded">
                                      <span className="text-[7px] font-mono text-slate-500 block">Cheshta (Mot)</span>
                                      <span className="text-[9px] font-mono font-bold text-slate-300">{val.cheshtaBala || 35}</span>
                                    </div>
                                    <div className="bg-slate-950/20 p-1.5 rounded">
                                      <span className="text-[7px] font-mono text-slate-500 block">Naisarg (Nat)</span>
                                      <span className="text-[9px] font-mono font-bold text-slate-300">{val.naisargikaBala || 60}</span>
                                    </div>
                                    <div className="bg-slate-950/20 p-1.5 rounded">
                                      <span className="text-[7px] font-mono text-slate-500 block">Drig (Aspect)</span>
                                      <span className="text-[9px] font-mono font-bold text-slate-300">{val.drigBala || -5}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bhava Bala Section */}
                        <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-2xl space-y-4">
                          <div className="border-b border-slate-850 pb-2">
                            <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">Bhava Bala (House Strength)</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Aggregated potency of all 12 houses based on house lord, occupant planet aspect, and directional strength.</p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {horoData.horoscope.bhava_bala && Object.entries(horoData.horoscope.bhava_bala).map(([houseName, val]: [string, any]) => {
                              const rankText = val.rank === 1 ? "1st" : val.rank === 2 ? "2nd" : val.rank === 3 ? "3rd" : `${val.rank}th`;
                              return (
                                <div key={houseName} className="bg-slate-900/50 border border-slate-850 p-3 rounded-xl text-center space-y-1 hover:border-indigo-500/20 transition-colors">
                                  <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">{houseName}</span>
                                  <span className="text-xs font-bold text-white block font-mono">{val.strength} Sh</span>
                                  <div className="flex items-center justify-center gap-1.5 mt-1 border-t border-slate-950 pt-1">
                                    <span className="text-[8px] font-mono text-indigo-300 bg-indigo-500/15 px-1.5 py-0.2 rounded border border-indigo-500/15">Rank {rankText}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* I. Ashtakavarga Grid */}
                    {horoTab === "ashtakavarga" && (
                      <div className="space-y-6 animate-fade-in" id="horoscope-ashtakavarga">
                        {/* Sarvashtakavarga SAV Grid */}
                        <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-2xl space-y-4">
                          <div className="border-b border-slate-850 pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">Sarvashtakavarga (SAV)</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">Sum of auspicious points contributed by all 7 planets. Score of 28+ is standard/strong.</p>
                            </div>
                            <span className="text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">Max: 337 pts</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {horoData.horoscope.ashtakavarga?.sarvashtakavarga && horoData.horoscope.ashtakavarga.sarvashtakavarga.map((pts: number, idx: number) => {
                              const signName = ZODIAC_SIGNS[idx];
                              const isStrong = pts >= 28;
                              const isWeak = pts < 24;
                              return (
                                <div key={signName} className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                                  isStrong 
                                    ? "bg-green-500/5 border-green-500/20 shadow-sm shadow-green-500/5" 
                                    : isWeak 
                                    ? "bg-rose-500/5 border-rose-500/20" 
                                    : "bg-slate-900/40 border-slate-850"
                                }`}>
                                  <span className="text-[9px] font-mono text-slate-400 block font-bold">{signName}</span>
                                  <span className={`text-sm font-bold font-mono block ${isStrong ? "text-green-400" : isWeak ? "text-rose-400" : "text-amber-200"}`}>{pts} pts</span>
                                  <span className="text-[8px] font-mono text-slate-500 block leading-tight pt-1 border-t border-slate-900/40">
                                    {isStrong ? "Propitious" : isWeak ? "Critical" : "Neutral"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bhinnashtakavarga BAV Section */}
                        <div className="bg-slate-950/30 border border-slate-800 p-4 rounded-2xl space-y-4">
                          <div className="border-b border-slate-850 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">Bhinnashtakavarga (BAV)</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">Points contributed by an individual planet (0 to 8 scale per sign). Score of 4+ is positive.</p>
                            </div>
                            <select
                              value={selectedBavPlanet}
                              onChange={(e) => setSelectedBavPlanet(e.target.value)}
                              className="bg-slate-900 border border-indigo-500/20 rounded-lg px-2.5 py-1 text-xs text-amber-200 outline-none cursor-pointer font-bold"
                            >
                              {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].map(p => (
                                <option key={p} value={p}>{p} Ashtakavarga</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {horoData.horoscope.ashtakavarga?.bhinnashtakavarga?.[selectedBavPlanet] && 
                             horoData.horoscope.ashtakavarga.bhinnashtakavarga[selectedBavPlanet].map((pts: number, idx: number) => {
                               const signName = ZODIAC_SIGNS[idx];
                               const isGood = pts >= 4;
                               const isExcellent = pts >= 6;
                               return (
                                 <div key={signName} className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl text-center space-y-1">
                                   <span className="text-[9px] font-mono text-slate-400 block font-bold">{signName}</span>
                                   <span className={`text-base font-bold font-mono block ${isExcellent ? "text-amber-400" : isGood ? "text-indigo-300" : "text-slate-400"}`}>{pts} / 8</span>
                                   <div className="flex justify-center gap-0.5 pt-1">
                                     {Array.from({ length: 8 }).map((_, i) => (
                                       <span 
                                         key={i} 
                                         className={`w-1 h-1 rounded-full ${i < pts ? (isExcellent ? "bg-amber-400" : "bg-indigo-400") : "bg-slate-800"}`} 
                                       />
                                     ))}
                                   </div>
                                 </div>
                               );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* J. Longevity & Life Expectancy */}
                    {horoTab === "longevity" && (
                      <div className="space-y-4 animate-fade-in" id="horoscope-longevity">
                        <div className="bg-gradient-to-br from-slate-950 to-indigo-950/20 p-5 rounded-2xl border border-indigo-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono text-slate-500 uppercase">Ayu Nirnaya (Longevity Calculation)</span>
                            <h4 className="text-base font-bold text-amber-200">
                              Estimated Life Span Class: <span className="text-white">{horoData.horoscope.longevity?.type || "Purnayu (Long Life)"}</span>
                            </h4>
                            <p className="text-xs text-indigo-200">
                              Estimated Range: <span className="font-bold text-amber-300">{horoData.horoscope.longevity?.estimatedYears || "75 - 85 Years"}</span>
                            </p>
                          </div>
                          <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold leading-tight flex items-center gap-2">
                            <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                            <span>Vedic Ayu Nirnayak</span>
                          </div>
                        </div>

                        <div className="bg-slate-950/30 border border-slate-800 p-5 rounded-2xl space-y-3">
                          <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold border-b border-slate-850 pb-2 mb-1">Mathematical Astrological Method</h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {horoData.horoscope.longevity?.details || "The longevity calculation combines three independent methods of Vedic astrology: (1) Comparison of Lagna Lord vs 8th Lord strength, (2) Lagna vs Moon sign elements, and (3) Lagna vs Hora Lagna classifications. Since the 1st Lord (Self) and the 8th Lord (Life duration) are placed in friendly signs, this configuration signifies a stable, healthy life path with high resistance to physiological afflictions."}
                          </p>
                          <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-3 text-[10px] text-slate-400 leading-relaxed space-y-1">
                            <p className="font-semibold text-slate-300 uppercase font-mono text-[9px] tracking-wider mb-1">Key Factors Analyzed:</p>
                            <p>• 1st House (Lagna) and 1st Lord: Signifies physical constitution and self-preservation capability.</p>
                            <p>• 8th House (Ayu Bhava) and 8th Lord: Represents longevity, life force, and crossing transitions.</p>
                            <p>• 3rd House and Saturn (Ayu Karaka): Natural cosmic significator of time, duration, and duty cycles.</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-center py-10 rounded-xl bg-slate-950/20 border border-slate-800/60 text-slate-500 text-xs font-mono">
                    <AlertTriangle className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    Please click "Query API" to fetch horoscope metrics from parameters.
                  </div>
                )}
              </div>
            )}

            {/* 2. MARRIAGE MATCH ENDPOINT */}
            {activeEndpoint === "marriage" && (
              <div className="space-y-6" id="endpoint-marriage">
                
                {/* Custom inputs parameters form reflecting Boy & Girl birth details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Boy */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-1.5 mb-2">
                      <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">Boy Birth Parameters</h4>
                      <button 
                        type="button"
                        onClick={loadHoroParamsToBoy}
                        className="text-[9px] font-sans font-bold bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/15 transition-all cursor-pointer"
                        title="Copy active birth details from Horoscope form"
                      >
                        Load Horoscope
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">Birth Place</label>
                        <input 
                          type="text"
                          value={marriageParams.boy_birth_details.place}
                          onChange={(e) => setMarriageParams({
                            ...marriageParams,
                            boy_birth_details: { ...marriageParams.boy_birth_details, place: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 uppercase">Birth Date</label>
                        <input 
                          type="date"
                          value={marriageParams.boy_birth_details.date}
                          onChange={(e) => setMarriageParams({
                            ...marriageParams,
                            boy_birth_details: { ...marriageParams.boy_birth_details, date: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 uppercase">Birth Time</label>
                        <input 
                          type="text"
                          value={marriageParams.boy_birth_details.time}
                          onChange={(e) => setMarriageParams({
                            ...marriageParams,
                            boy_birth_details: { ...marriageParams.boy_birth_details, time: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Girl */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-1.5 mb-2">
                      <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">Girl Birth Parameters</h4>
                      <button 
                        type="button"
                        onClick={loadHoroParamsToGirl}
                        className="text-[9px] font-sans font-bold bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/15 transition-all cursor-pointer"
                        title="Copy active birth details from Horoscope form"
                      >
                        Load Horoscope
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">Birth Place</label>
                        <input 
                          type="text"
                          value={marriageParams.girl_birth_details.place}
                          onChange={(e) => setMarriageParams({
                            ...marriageParams,
                            girl_birth_details: { ...marriageParams.girl_birth_details, place: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 uppercase">Birth Date</label>
                        <input 
                          type="date"
                          value={marriageParams.girl_birth_details.date}
                          onChange={(e) => setMarriageParams({
                            ...marriageParams,
                            girl_birth_details: { ...marriageParams.girl_birth_details, date: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 uppercase">Birth Time</label>
                        <input 
                          type="text"
                          value={marriageParams.girl_birth_details.time}
                          onChange={(e) => setMarriageParams({
                            ...marriageParams,
                            girl_birth_details: { ...marriageParams.girl_birth_details, time: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {marriageData ? (
                  <div className="space-y-6">
                    
                    {/* Compatibility Score Circle Meter */}
                    <div className="bg-slate-950/30 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 flex items-center justify-center bg-rose-500/5 rounded-full border border-rose-500/20 shadow-lg shrink-0">
                          <Heart className="w-10 h-10 text-rose-500/25 absolute animate-pulse" />
                          <span className="text-xl font-bold text-rose-400 font-mono z-10">
                            {marriageData.points || 26.5}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Ashtakoota Milan Compatibility</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                            Secured <span className="text-white font-semibold">{marriageData.points || 26.5} gunas</span> out of <span className="text-white font-semibold">{marriageData.maxPoints || 36} gunas</span>.
                            A score of 18 or above is highly recommended for strong spiritual and mental harmony.
                          </p>
                        </div>
                      </div>
                      <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl text-center shrink-0">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-rose-400 block font-bold">Compatibility Rating</span>
                        <span className="text-sm font-bold text-rose-200 mt-0.5 block">{marriageData.percentage || 74}% Match</span>
                      </div>
                    </div>

                    {/* Table grid of 8 Kootas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="marriage-kootas-grid">
                      {marriageData.kootas && Object.entries(marriageData.kootas).map(([name, val]: [string, any]) => {
                        return (
                          <div key={name} className="bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-2xl text-center space-y-1">
                            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">{name} Match</span>
                            <div className="text-[9px] text-slate-400 font-mono mt-1">
                              B: <span className="text-white font-semibold">{val.boy}</span> | G: <span className="text-white font-semibold">{val.girl}</span>
                            </div>
                            <span className="text-xs font-bold text-amber-300 block pt-1.5 border-t border-slate-900 mt-1.5">
                              {val.points} / {val.maxPoints} pts
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Overall Compatibility Verdict */}
                    {marriageData.verdict && (
                      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                        marriageData.points >= 18 
                          ? "bg-emerald-500/5 border-emerald-500/20" 
                          : "bg-amber-500/5 border-amber-500/20"
                      }`}>
                        <div className={`p-3 rounded-xl ${marriageData.points >= 18 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                          <Heart className="w-5 h-5 text-rose-400 shrink-0" />
                        </div>
                        <div>
                          <h4 className="text-xs font-mono font-bold uppercase text-slate-400">Match Synthesis & Verdict</h4>
                          <p className="text-sm font-bold text-white mt-1">{marriageData.verdict}</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                            Determined by compounding Ashtakoota planetary positions, Nakshatra affinity, and South Indian Dasha Porutham rules.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* South Indian Dasha Porutham Matching (10 Poruthams) */}
                    {marriageData.poruthams && (
                      <div className="bg-slate-950/30 border border-slate-800 p-5 rounded-2xl space-y-4">
                        <div className="border-b border-slate-850 pb-2 flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">South Indian Dasha Porutham (10 Poruthams)</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Vedic South Indian metrics evaluating physical, mental, genetic, and environmental harmony.</p>
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/20">Dasha Porutham</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="marriage-poruthams-list">
                          {Object.entries(marriageData.poruthams).map(([name, val]: [string, any]) => {
                            const matchClass = 
                              val.status === "Excellent" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              val.status === "Good" ? "bg-teal-500/10 text-teal-300 border-teal-500/20" :
                              val.status === "Satisfactory" ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
                              "bg-rose-500/10 text-rose-400 border-rose-500/20";
                            return (
                              <div key={name} className="bg-slate-900/40 border border-slate-850/80 p-3.5 rounded-xl flex items-start gap-3 hover:border-indigo-500/10 transition-colors">
                                <div className="space-y-1.5 flex-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-white">{name} Porutham</span>
                                    <span className={`text-[8px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${matchClass}`}>
                                      {val.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-relaxed">
                                    {val.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-center py-10 rounded-xl bg-slate-950/20 border border-slate-800/60 text-slate-500 text-xs font-mono">
                    <AlertTriangle className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    Please click "Query API" to fetch Porutham metrics.
                  </div>
                )}
              </div>
            )}

            {/* 3. PLANETARY TRANSITS ENDPOINT (GOCHARA) */}
            {activeEndpoint === "gochara" && (
              <div className="space-y-6" id="endpoint-gochara">
                
                {/* Inputs for target date and coordinates */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-900">
                  <div className="space-y-1 col-span-2">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase block font-bold">Target Transit Date (Gochara Date)</span>
                    <input 
                      type="date"
                      value={gocharaParams.target_date}
                      onChange={(e) => setGocharaParams({ ...gocharaParams, target_date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-amber-200 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Latitude</span>
                    <input 
                      type="number"
                      step="0.0001"
                      value={gocharaParams.latitude}
                      onChange={(e) => setGocharaParams({ ...gocharaParams, latitude: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Longitude</span>
                    <input 
                      type="number"
                      step="0.0001"
                      value={gocharaParams.longitude}
                      onChange={(e) => setGocharaParams({ ...gocharaParams, longitude: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
                    />
                  </div>
                </div>

                {gocharaData ? (
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold border-b border-indigo-500/10 pb-2">
                      Transit Positions for {gocharaData.date}
                    </h4>

                    {/* Positions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="gochara-planets-list">
                      {gocharaData.planets?.map((p: any) => (
                        <div key={p.name} className="bg-slate-950/30 border border-slate-850 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">{p.name}</span>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              Transiting Sign: <span className="text-indigo-300 font-semibold">{p.sign}</span>
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono text-amber-300 block">H{p.house} Placement</span>
                            <span className="text-[10px] text-slate-500 block font-mono">{(p.degree || 0).toFixed(2)}°</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-xl bg-slate-950/20 border border-slate-800/60 text-slate-500 text-xs font-mono">
                    <AlertTriangle className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    Please click "Query API" to fetch transit positions.
                  </div>
                )}
              </div>
            )}

            {/* 4. PLANETARY INGRESS ENDPOINT */}
            {activeEndpoint === "ingress" && (
              <div className="space-y-6" id="endpoint-ingress">
                
                {/* Inputs for from/to date and planets */}
                <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-900">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">From Date</span>
                    <input 
                      type="date"
                      value={ingressParams.from_date}
                      onChange={(e) => setIngressParams({ ...ingressParams, from_date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">To Date</span>
                    <input 
                      type="date"
                      value={ingressParams.to_date}
                      onChange={(e) => setIngressParams({ ...ingressParams, to_date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {ingressData ? (
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold border-b border-indigo-500/10 pb-2">
                      Crossings Timeline
                    </h4>

                    {/* Timeline List of Events */}
                    <div className="space-y-3" id="ingress-events-list">
                      {ingressData.events?.map((ev: any, idx: number) => (
                        <div key={idx} className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20 text-indigo-300 text-xs font-bold font-mono">
                              {ev.planet}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-400">{ev.previous_sign}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                              <span className="text-amber-300 font-bold">{ev.new_sign}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-white block">📅 {ev.ingress_date}</span>
                            <span className="text-[9px] text-slate-500 font-mono block">Zero Degree Cross Point</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-xl bg-slate-950/20 border border-slate-800/60 text-slate-500 text-xs font-mono">
                    <AlertTriangle className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    Please click "Query API" to fetch planetary crossing dates.
                  </div>
                )}
              </div>
            )}

            {/* 5. DAILY MUHURTA ENDPOINT */}
            {activeEndpoint === "muhurta" && (
              <div className="space-y-6" id="endpoint-muhurta">
                
                {/* Date Selection */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900">
                  <div className="space-y-1 max-w-xs">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase block font-bold">Select Date</span>
                    <input 
                      type="date"
                      value={muhurtaParams.date}
                      onChange={(e) => setMuhurtaParams({ ...muhurtaParams, date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {muhurtaData ? (
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold border-b border-indigo-500/10 pb-2">
                      Muhurta Hours on {muhurtaData.date}
                    </h4>

                    {/* Timeline Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="muhurta-slots-list">
                      {muhurtaData.muhurtas?.map((m: any, idx: number) => {
                        return (
                          <div 
                            key={idx} 
                            className="bg-slate-950/30 border border-slate-850 p-4 rounded-2xl space-y-2 flex flex-col justify-between"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-xs font-bold text-white block">{m.name}</span>
                                <span className="text-[10px] font-mono text-indigo-300 mt-1 block">
                                  🕒 {m.startTime} to {m.endTime}
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-mono font-bold border ${
                                m.isAuspicious 
                                  ? "bg-green-500/10 text-green-400 border-green-500/25" 
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                              }`}>
                                {m.isAuspicious ? "Auspicious" : "Unfavorable"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-900/50">
                              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Score:</span>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, sIdx) => (
                                  <Star 
                                    key={sIdx} 
                                    className={`w-3 h-3 ${
                                      sIdx < m.score 
                                        ? "text-amber-500 fill-amber-500/30" 
                                        : "text-slate-800"
                                    }`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-xl bg-slate-950/20 border border-slate-800/60 text-slate-500 text-xs font-mono">
                    <AlertTriangle className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    Please click "Query API" to fetch daily muhurtas.
                  </div>
                )}
              </div>
            )}

            {/* 6. LOCATION AUTOCOMPLETE ENDPOINT */}
            {activeEndpoint === "autocomplete" && (
              <div className="space-y-6" id="endpoint-autocomplete">
                
                {/* Live query search bar input form */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 space-y-2">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase block font-bold">Live Search Location Lookup</span>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Type a city name (e.g., Delhi, Mumbai, New York)..."
                      value={autocompleteQuery}
                      onChange={(e) => setAutocompleteQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-xs text-white outline-none focus:border-amber-500/40"
                    />
                  </div>
                </div>

                {autocompleteData ? (
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold border-b border-indigo-500/10 pb-2">
                      Autocomplete Results & Suggestions
                    </h4>

                    {autocompleteData.results && autocompleteData.results.length > 0 ? (
                      <div className="space-y-3" id="autocomplete-results-list">
                        {autocompleteData.results.map((r: any, idx: number) => {
                          return (
                            <div 
                              key={idx} 
                              className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-800 transition-colors"
                            >
                              <div>
                                <span className="text-xs font-extrabold text-white block">
                                  {r.name}, {r.admin1 ? `${r.admin1}, ` : ""}{r.country}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono block mt-1">
                                  Lat: {r.latitude}°N • Lon: {r.longitude}°E • Timezone: {r.timezone}
                                </span>
                              </div>
                              
                              <button
                                onClick={() => applyCoordinatesFromSearch(r)}
                                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px] rounded-lg border border-indigo-500/20 px-3 py-1.5 transition-all cursor-pointer shadow-sm shadow-indigo-500/5 flex items-center gap-1 shrink-0"
                              >
                                Apply Coordinates
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 text-xs font-mono">
                        No coordinates results found.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-xl bg-slate-950/20 border border-slate-800/60 text-slate-500 text-xs font-mono">
                    <AlertTriangle className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    Please click "Query API" to fetch autocompleted location lists.
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Live JSON inspector for current selected Endpoint */}
          <div className="bg-slate-900/60 border border-indigo-500/20 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-bold flex items-center justify-between border-b border-indigo-500/10 pb-2 mb-2">
              <span className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-amber-400" />
                Live Response inspector ({submenus.find(m => m.id === activeEndpoint)?.name})
              </span>
              <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-wide font-bold">Raw JSON Block</span>
            </h4>
            <div className="bg-slate-950/90 border border-slate-850 rounded-xl p-4 overflow-x-auto max-h-[220px] text-[10px] font-mono text-indigo-300 scrollbar-thin">
              <pre>{JSON.stringify(getActiveJsonPayload(), null, 2)}</pre>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
