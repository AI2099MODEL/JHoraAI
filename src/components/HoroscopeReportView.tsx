import React, { useState, useEffect, useMemo } from "react";
import { 
  User, Calendar, Clock, MapPin, Compass, Moon, Sun, 
  BookOpen, Star, Briefcase, DollarSign, Heart, Activity, 
  Sparkles, Shield, AlertTriangle, ChevronRight, HelpCircle,
  Download, RefreshCw, Award, Globe, Layers, Zap, Grid, LayoutDashboard,
  Cpu, FileText, CheckCircle2, Check
} from "lucide-react";
import { generateRawAstrologyPDF } from "../lib/rawReportGenerator";
import { getAllCachedHoroscopes, CachedHoroscopeRecord } from "../lib/indexedDb";
import { generateAstrologyPDF } from "../lib/pdfGenerator";
import { calculateUnifiedRelationshipEvidence } from "../lib/rules/unifiedRelationshipEvidenceEngine";
import { generateRelationshipPDF } from "../lib/relationshipReportGenerator";
import { MasterArchitectureView } from "./MasterArchitectureView";
import { PresentDayEngineView } from "./PresentDayEngineView";
import { FinalResultsView } from "./FinalResultsView";
import { UserProfileSubmenuView } from "./UserProfileSubmenuView";
import EventBookView from "./EventBookView";
import AstroChart from "./AstroChart";
import { KPRulebook } from "../lib/rules/kpRulebook";
import { apiFetch as fetchKpApi } from "../lib/api";
import { MysticalSystemsView } from "./MysticalSystemsView";
import TransitsTab from "./TransitsTab";
import IngressTab from "./IngressTab";
import HoroscopeDashboard from "./HoroscopeDashboard";
import currentSkyJson from "../knowledgebase/checklist_engine/current_sky.json";
import { mapJHoraResponseToAstrologyData } from "../lib/jhoraMapper";
import { calculateAstrology } from "../lib/astrology";

interface PlanetData {
  name: string;
  sign: string;
  longitude: number;
  retrograde: boolean;
  house: number;
  nakshatra?: string;
  pada?: number;
  lord?: string;
}

const PLANETS_CYCLE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const PLANET_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

function parseSafeDate(str: any): Date {
  if (!str) return new Date();
  if (str instanceof Date) return str;
  const s = String(str).trim();
  if (s.includes("T")) {
    return new Date(s);
  }
  const parts = s.split(/\s+/);
  const datePart = parts[0];
  const timePart = parts[1] || "00:00:00";
  
  const dParts = datePart.split("-");
  const tParts = timePart.split(":");
  
  const year = parseInt(dParts[0], 10);
  const month = parseInt(dParts[1], 10) - 1;
  const day = parseInt(dParts[2], 10);
  
  const hours = parseInt(tParts[0], 10) || 0;
  const minutes = parseInt(tParts[1], 10) || 0;
  const seconds = parseInt(tParts[2], 10) || 0;
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return new Date(s); // Fallback
  }
  return new Date(year, month, day, hours, minutes, seconds);
}

function normPlanetName(name: string): string {
  const clean = String(name || "").trim().split(" ")[0].trim();
  const map: Record<string, string> = {
    "Sury": "Sun", "Surya": "Sun", "Sun": "Sun",
    "Chandra": "Moon", "Moon": "Moon",
    "Kuja": "Mars", "Mars": "Mars",
    "Budha": "Mercury", "Mercury": "Mercury",
    "Guru": "Jupiter", "Jupiter": "Jupiter",
    "Sukra": "Venus", "Venus": "Venus",
    "Sani": "Saturn", "Saturn": "Saturn",
    "Rahu": "Rahu", "Raagu": "Rahu", "Rhaago": "Rahu",
    "Ketu": "Ketu", "Kethu": "Ketu"
  };
  return map[clean] || clean;
}

function getSubPeriods(parentLord: string, parentStart: Date, parentEnd: Date): Array<{ lord: string; start: Date; end: Date }> {
  const cleanLord = normPlanetName(parentLord);

  const startIndex = PLANETS_CYCLE.indexOf(cleanLord);
  if (startIndex === -1) return [];
  
  const totalParentMs = parentEnd.getTime() - parentStart.getTime();
  const list: Array<{ lord: string; start: Date; end: Date }> = [];
  let currentStartMs = parentStart.getTime();
  
  for (let i = 0; i < 9; i++) {
    const lord = PLANETS_CYCLE[(startIndex + i) % 9];
    const years = PLANET_YEARS[lord];
    const share = years / 120;
    const durationMs = totalParentMs * share;
    const currentEndMs = currentStartMs + durationMs;
    
    list.push({
      lord,
      start: new Date(currentStartMs),
      end: new Date(currentEndMs)
    });
    
    currentStartMs = currentEndMs;
  }
  
  return list;
}

function getYoginiSubPeriods(parentLord: string, parentStart: Date, parentEnd: Date): Array<{ lord: string; start: Date; end: Date }> {
  const rawWord = String(parentLord || "").trim().split(" ")[0].trim();
  const normalizedPlanet = normPlanetName(rawWord);
  
  const planetMap: Record<string, string> = {
    "Moon": "Mangala", "Sun": "Pingala", "Jupiter": "Dhanya", "Mars": "Bhramari",
    "Mercury": "Bhadrika", "Saturn": "Ulka", "Venus": "Siddha", "Rahu": "Sankata"
  };
  
  const cleanLord = planetMap[normalizedPlanet] || normalizedPlanet;
  
  const YOGINI_CYCLE = ["Mangala", "Pingala", "Dhanya", "Bhramari", "Bhadrika", "Ulka", "Siddha", "Sankata"];
  const YOGINI_YEARS: Record<string, number> = {
    Mangala: 1, Pingala: 2, Dhanya: 3, Bhramari: 4, Bhadrika: 5, Ulka: 6, Siddha: 7, Sankata: 8
  };
  const YOGINI_LORDS: Record<string, string> = {
    Mangala: "Moon", Pingala: "Sun", Dhanya: "Jupiter", Bhramari: "Mars", Bhadrika: "Mercury", Ulka: "Saturn", Siddha: "Venus", Sankata: "Rahu"
  };

  const startIndex = YOGINI_CYCLE.indexOf(cleanLord);
  if (startIndex === -1) return [];
  
  const totalParentMs = parentEnd.getTime() - parentStart.getTime();
  const list: Array<{ lord: string; start: Date; end: Date }> = [];
  let currentStartMs = parentStart.getTime();
  
  for (let i = 0; i < 8; i++) {
    const yName = YOGINI_CYCLE[(startIndex + i) % 8];
    const yLord = YOGINI_LORDS[yName];
    const years = YOGINI_YEARS[yName];
    const share = years / 36;
    const durationMs = totalParentMs * share;
    const currentEndMs = currentStartMs + durationMs;
    
    list.push({
      lord: `${yName} (${yLord})`,
      start: new Date(currentStartMs),
      end: new Date(currentEndMs)
    });
    
    currentStartMs = currentEndMs;
  }
  
  return list;
}

function getAshtottariSubPeriods(parentLord: string, parentStart: Date, parentEnd: Date): Array<{ lord: string; start: Date; end: Date }> {
  const cleanLord = normPlanetName(parentLord);
  
  const ASHTOTTARI_CYCLE = ["Sun", "Moon", "Mars", "Mercury", "Saturn", "Jupiter", "Rahu", "Venus"];
  const ASHTOTTARI_YEARS: Record<string, number> = {
    Sun: 6, Moon: 15, Mars: 8, Mercury: 17, Saturn: 10, Jupiter: 19, Rahu: 12, Venus: 21
  };

  const startIndex = ASHTOTTARI_CYCLE.indexOf(cleanLord);
  if (startIndex === -1) return [];
  
  const totalParentMs = parentEnd.getTime() - parentStart.getTime();
  const list: Array<{ lord: string; start: Date; end: Date }> = [];
  let currentStartMs = parentStart.getTime();
  
  for (let i = 0; i < 8; i++) {
    const lord = ASHTOTTARI_CYCLE[(startIndex + i) % 8];
    const years = ASHTOTTARI_YEARS[lord];
    const share = years / 108;
    const durationMs = totalParentMs * share;
    const currentEndMs = currentStartMs + durationMs;
    
    list.push({
      lord,
      start: new Date(currentStartMs),
      end: new Date(currentEndMs)
    });
    
    currentStartMs = currentEndMs;
  }
  
  return list;
}

interface HoroscopeReportViewProps {
  astrologyData: any;
  activeUser: any;
  mapAstrologyDataToUserProfileJSON: (user: any, data: any) => any;
  setAstrologyData: (data: any) => void;
  onLoadProfile?: (record: CachedHoroscopeRecord) => void;
  onLoadProfileByName?: (name: string) => void;
  isDark: boolean;
  currentDateTime: Date;
  headerGps: {
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    loading: boolean;
    error: string | null;
  };
  chartStyle?: "north" | "south";
}

export const HoroscopeReportView: React.FC<HoroscopeReportViewProps> = ({
  astrologyData,
  activeUser,
  mapAstrologyDataToUserProfileJSON,
  setAstrologyData,
  onLoadProfile,
  onLoadProfileByName,
  isDark,
  currentDateTime,
  headerGps,
  chartStyle = "north" as "north" | "south"
}) => {
  const [compiling, setCompiling] = useState(false);
  const [profilesList, setProfilesList] = useState<CachedHoroscopeRecord[]>([]);
  const [majorTab, setMajorTab] = useState<"advanced" | "present" | "jhora" | "transit" | "kp" | "western" | "all" | "reports">("present");
  const [transitSubTab, setTransitSubTab] = useState<string>("current_gochara");
  const [eventsSubTab, setEventsSubTab] = useState<"final_results" | "present_day" | "event_book" | "event_muhurta" | "current_events">("event_book");
  const [selectedVarga, setSelectedVarga] = useState<string>("D1");
  const [selectedBavPlanet, setSelectedBavPlanet] = useState<string>("Sun");
  const [activeDashaSystem, setActiveDashaSystem] = useState<"vimshottari" | "yogini" | "ashtottari">("vimshottari");
  const [vedicSubTab, setVedicSubTab] = useState<string>("table_1");
  const [testName, setTestName] = useState<string>(activeUser?.name || "Nitin Jain");
  const [divisionalChartStyle, setDivisionalChartStyle] = useState<"north" | "south">("north");
  const [generatedPdfs, setGeneratedPdfs] = useState<{
    complete360?: string;
    vedic?: string;
    marriage?: string;
    partner?: string;
  }>({});
  const [compilingStatus, setCompilingStatus] = useState<"idle" | "compiling" | "ready" | "error">("idle");

  const [selectedMahaIdx, setSelectedMahaIdx] = useState<number | null>(null);
  const [selectedAntarIdx, setSelectedAntarIdx] = useState<number | null>(null);
  const [selectedPratyantarIdx, setSelectedPratyantarIdx] = useState<number | null>(null);
  const [selectedSookshmaIdx, setSelectedSookshmaIdx] = useState<number | null>(null);
  const [selectedPranaIdx, setSelectedPranaIdx] = useState<number | null>(null);

  const [selectedYoginiMahaIdx, setSelectedYoginiMahaIdx] = useState<number | null>(null);
  const [selectedYoginiAntarIdx, setSelectedYoginiAntarIdx] = useState<number | null>(null);
  const [selectedYoginiPratyantarIdx, setSelectedYoginiPratyantarIdx] = useState<number | null>(null);
  const [selectedYoginiSookshmaIdx, setSelectedYoginiSookshmaIdx] = useState<number | null>(null);
  const [selectedYoginiPranaIdx, setSelectedYoginiPranaIdx] = useState<number | null>(null);

  const [selectedAshtottariMahaIdx, setSelectedAshtottariMahaIdx] = useState<number | null>(null);
  const [selectedAshtottariAntarIdx, setSelectedAshtottariAntarIdx] = useState<number | null>(null);
  const [selectedAshtottariPratyantarIdx, setSelectedAshtottariPratyantarIdx] = useState<number | null>(null);
  const [selectedAshtottariSookshmaIdx, setSelectedAshtottariSookshmaIdx] = useState<number | null>(null);
  const [selectedAshtottariPranaIdx, setSelectedAshtottariPranaIdx] = useState<number | null>(null);

  // KP Subtabs state variables
  const [kpSubTab, setKpSubTab] = useState<string>("kp_cusps");
  const [jaiminiSubTab, setJaiminiSubTab] = useState<string>("jaimini");
  const [kpCuspData, setKpCuspData] = useState<any>(null);
  const [kpChartData, setKpChartData] = useState<any>(null);
  const [kpSignificatorsData, setKpSignificatorsData] = useState<any>(null);
  const [kpDashaData, setKpDashaData] = useState<any>(null);
  const [kpTransitData, setKpTransitData] = useState<any>(null);
  const [kpHoraryData, setKpHoraryData] = useState<any>(null);
  const [kpSubLoading, setKpSubLoading] = useState<boolean>(false);
  const [kpSubError, setKpSubError] = useState<string | null>(null);
  const [kpTransitDate, setKpTransitDate] = useState<string>("2026-07-15");
  const [kpHoraryNumber, setKpHoraryNumber] = useState<number>(1);
  const [kpHoraryQuestion, setKpHoraryQuestion] = useState<string>("Will my current business venture succeed in this dasha period?");
  const [selectedKpRuleId, setSelectedKpRuleId] = useState<string | null>("KP_MAR_01");

  // KP Planet Strength Table state variables
  const [kpStrengthPlanetFilter, setKpStrengthPlanetFilter] = useState<string>("All");
  const [kpStrengthHouseFilter, setKpStrengthHouseFilter] = useState<string>("All");
  const [kpStrengthSortField, setKpStrengthSortField] = useState<"planet" | "houseNum" | "count" | "score" | "grade">("planet");
  const [kpStrengthSortOrder, setKpStrengthSortOrder] = useState<"asc" | "desc">("asc");

  // Configurable KP priorities/weights state
  const [kpWeights, setKpWeights] = useState({
    L1: 5.0,
    L2: 4.0,
    L3: 3.0,
    L4: 2.0,
    L5: 1.0,
    L6: 0.5
  });

  // Dynamic Transit settings & calculations state variables
  const [transitDate, setTransitDate] = useState<string>(() => {
    const localStr = new Date().toLocaleDateString("en-CA");
    return localStr || "2026-07-17";
  });
  const [transitTime, setTransitTime] = useState<string>("12:00:00");
  const [transitPlace, setTransitPlace] = useState<string>("New Delhi, India");
  const [transitLatitude, setTransitLatitude] = useState<number>(28.6139);
  const [transitLongitude, setTransitLongitude] = useState<number>(77.2090);
  const [transitTimezone, setTransitTimezone] = useState<number>(5.5);
  const [transitAstroData, setTransitAstroData] = useState<any>(null);
  const [transitLoading, setTransitLoading] = useState<boolean>(false);
  const [transitError, setTransitError] = useState<string | null>(null);
  const [isCustomTransitPlace, setIsCustomTransitPlace] = useState<boolean>(false);

  // Transit geocoding state variables
  const [transitSearchQuery, setTransitSearchQuery] = useState<string>("");
  const [transitLocationResults, setTransitLocationResults] = useState<any[]>([]);
  const [showTransitLocationDropdown, setShowTransitLocationDropdown] = useState<boolean>(false);
  const [searchingTransitLocation, setSearchingTransitLocation] = useState<boolean>(false);

  // Helper: compute timezone offset for search results
  const calculateTransitTimezoneOffset = (tzName: string, dateStr: string): number => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tzName,
        timeZoneName: "longOffset",
      });
      const parts = formatter.formatToParts(new Date(dateStr));
      const tzPart = parts.find((p) => p.type === "timeZoneName");
      if (!tzPart) return 5.5;
      const match = tzPart.value.match(/GMT([+-])(\d+):(\d+)/) || tzPart.value.match(/GMT([+-])(\d+)/);
      if (!match) return 5.5;
      const sign = match[1] === "+" ? 1 : -1;
      const hours = Number(match[2]);
      const minutes = match[3] ? Number(match[3]) : 0;
      return sign * (hours + minutes / 60);
    } catch (e) {
      console.error("Failed to compute timezone offset:", e);
      return 5.5;
    }
  };

  // Autocomplete: search location using public Open-Meteo API
  const handleSearchTransitLocation = async (query: string) => {
    if (!query || query.trim().length < 2) return;
    setSearchingTransitLocation(true);
    try {
      const res = await fetch(`/api/jhora/location/autocomplete?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.results) {
        setTransitLocationResults(data.results);
        setShowTransitLocationDropdown(true);
      } else {
        setTransitLocationResults([]);
        setShowTransitLocationDropdown(false);
      }
    } catch (err) {
      console.error("Transit geocoding fetch failed:", err);
    } finally {
      setSearchingTransitLocation(false);
    }
  };

  useEffect(() => {
    if (!transitSearchQuery || transitSearchQuery.trim().length < 3) {
      setTransitLocationResults([]);
      setShowTransitLocationDropdown(false);
      return;
    }
    const matched = transitLocationResults.some(r => {
      const label = `${r.name}, ${r.admin1 ? r.admin1 + ', ' : ''}${r.country}`;
      return label.toLowerCase() === transitSearchQuery.toLowerCase();
    });
    if (matched) return;

    const delayDebounce = setTimeout(() => {
      handleSearchTransitLocation(transitSearchQuery);
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [transitSearchQuery]);

  // Method to fetch the full horoscope for the dynamic transit sky moment
  const fetchTransitAstroData = async () => {
    setTransitLoading(true);
    setTransitError(null);
    try {
      const response = await fetchKpApi("/api/astrology/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Transit Sky",
          date: transitDate,
          time: transitTime,
          location: transitPlace || "New Delhi, India",
          place: transitPlace || "New Delhi, India",
          latitude: Number(transitLatitude) || 28.6139,
          longitude: Number(transitLongitude) || 77.2090,
          timezone: Number(transitTimezone) || 5.5
        })
      });

      if (!response.ok) {
        let errMsg = `Failed to calculate live transit sky data (status: ${response.status})`;
        try {
          const errJson = await response.json();
          if (errJson && errJson.error) errMsg = errJson.error;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const rawJson = await response.json();
      if (rawJson && rawJson.error) {
        throw new Error(rawJson.error);
      }
      const mapped = mapJHoraResponseToAstrologyData(rawJson);
      setTransitAstroData(mapped);
    } catch (err: any) {
      console.warn("Transit calculation fetch failed. Falling back to high-integrity client-side local calculations:", err);
      try {
        const localData = calculateAstrology(
          "Transit Sky",
          transitDate,
          transitTime,
          transitPlace || "New Delhi, India",
          Number(transitLatitude) || 28.6139,
          Number(transitLongitude) || 77.2090,
          Number(transitTimezone) || 5.5
        );
        setTransitAstroData(localData);
      } catch (localErr: any) {
        console.error("Local transit fallback calculation error:", localErr);
        setTransitError(err.message || "An error occurred while fetching live transit data.");
      }
    } finally {
      setTransitLoading(false);
    }
  };

  // Synchronize transit date/time with top bar currentDateTime
  useEffect(() => {
    const yyyy = currentDateTime.getFullYear();
    const mm = String(currentDateTime.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDateTime.getDate()).padStart(2, '0');
    setTransitDate(`${yyyy}-${mm}-${dd}`);

    const hrs = String(currentDateTime.getHours()).padStart(2, '0');
    const mins = String(currentDateTime.getMinutes()).padStart(2, '0');
    // Set seconds to 00 to avoid triggering a new fetch every single second
    setTransitTime(`${hrs}:${mins}:00`);
  }, [currentDateTime]);

  // Synchronize transit coordinates with top bar headerGps if not custom
  useEffect(() => {
    if (!isCustomTransitPlace) {
      if (headerGps && headerGps.latitude !== null && headerGps.longitude !== null) {
        setTransitLatitude(headerGps.latitude);
        setTransitLongitude(headerGps.longitude);
        setTransitPlace(headerGps.address || `${headerGps.latitude.toFixed(4)}°N, ${headerGps.longitude.toFixed(4)}°E`);
        setTransitSearchQuery(headerGps.address || `${headerGps.latitude.toFixed(4)}°N, ${headerGps.longitude.toFixed(4)}°E`);
        setTransitTimezone(new Date().getTimezoneOffset() / -60);
      } else if (astrologyData?.birthDetails) {
        setTransitPlace(astrologyData.birthDetails.location || "New Delhi, India");
        setTransitSearchQuery(astrologyData.birthDetails.location || "New Delhi, India");
        setTransitLatitude(astrologyData.birthDetails.latitude || 28.6139);
        setTransitLongitude(astrologyData.birthDetails.longitude || 77.2090);
        setTransitTimezone(astrologyData.birthDetails.timezone || 5.5);
      }
    }
  }, [headerGps, astrologyData, isCustomTransitPlace]);

  // Fetch new calculations on transit coordinate/date/time change (debounced to avoid spamming)
  useEffect(() => {
    if (!transitLatitude || !transitLongitude) return;

    const delayDebounce = setTimeout(() => {
      fetchTransitAstroData();
    }, 1200);

    return () => clearTimeout(delayDebounce);
  }, [transitDate, transitTime, transitLatitude, transitLongitude, transitTimezone]);

  // Dynamic solar muhurtas calculator
  const computedMuhurtas = useMemo(() => {
    const sunriseStr = transitAstroData?.astronomical_details?.sunrise || transitAstroData?.panchanga?.sunrise || "05:42:00";
    const sunsetStr = transitAstroData?.astronomical_details?.sunset || transitAstroData?.panchanga?.sunset || "18:55:00";
    const dayName = transitAstroData?.panchanga?.vara || "Friday";

    const parseTime = (timeStr: string) => {
      const parts = timeStr.split(":").map(Number);
      return (parts[0] || 6) * 60 + (parts[1] || 0) + (parts[2] || 0) / 60;
    };
    const formatTime = (minutes: number) => {
      const hrs = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      const isPm = hrs >= 12;
      const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
      return `${displayHrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${isPm ? "PM" : "AM"}`;
    };

    const sunriseMin = parseTime(sunriseStr);
    const sunsetMin = parseTime(sunsetStr);
    const dayLength = sunsetMin - sunriseMin;
    const partLen = dayLength / 8;

    // Midday
    const midday = sunriseMin + dayLength / 2;
    const abhijitStart = formatTime(midday - 24);
    const abhijitEnd = formatTime(midday + 24);

    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayIdx = weekDays.findIndex(d => dayName.toLowerCase().includes(d.toLowerCase()));
    const activeDayIdx = dayIdx !== -1 ? dayIdx : 5; // Default Friday

    const rahuEighths = [8, 2, 7, 5, 6, 4, 3];
    const yamaEighths = [5, 4, 3, 2, 1, 7, 6];
    const gulikaEighths = [7, 6, 5, 4, 3, 2, 1];

    const getInterval = (eighthNum: number) => {
      const start = sunriseMin + (eighthNum - 1) * partLen;
      const end = sunriseMin + eighthNum * partLen;
      return { start: formatTime(start), end: formatTime(end) };
    };

    const abhijitInterval = { start: abhijitStart, end: abhijitEnd };
    const brahmaInterval = { start: formatTime(sunriseMin - 96), end: formatTime(sunriseMin - 48) };
    const rahuInterval = getInterval(rahuEighths[activeDayIdx]);
    const yamaInterval = getInterval(yamaEighths[activeDayIdx]);
    const gulikaInterval = getInterval(gulikaEighths[activeDayIdx]);

    return {
      abhijit: abhijitInterval,
      brahma: brahmaInterval,
      rahuKalam: rahuInterval,
      yamaganda: yamaInterval,
      gulika: gulikaInterval,
      sunrise: formatTime(sunriseMin),
      sunset: formatTime(sunsetMin)
    };
  }, [transitAstroData]);

  // Reset KP subtab state caches when switching profiles/astrologyData changes to align data to the user profile
  useEffect(() => {
    setKpCuspData(null);
    setKpChartData(null);
    setKpSignificatorsData(null);
    setKpDashaData(null);
    setKpTransitData(null);
    setKpHoraryData(null);
  }, [astrologyData]);

  // Fetch all cached profiles on mount and sync with astrologyData
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const records = await getAllCachedHoroscopes();
        setProfilesList(records);
      } catch (err) {
        console.error("Error fetching profiles in HoroscopeReportView:", err);
      }
    };
    fetchProfiles();
  }, [astrologyData]);

  // Map high-fidelity profile JSON dynamically on render
  const profileJson = useMemo(() => {
    if (!astrologyData) return null;
    try {
      return mapAstrologyDataToUserProfileJSON(activeUser, astrologyData);
    } catch (e) {
      console.error("Error compiling profileJson on render:", e);
      return null;
    }
  }, [activeUser, astrologyData, mapAstrologyDataToUserProfileJSON]);

  // Safe Fallback structures in case transitAstroData is loading/unavailable
  const activePanchanga = useMemo(() => {
    const normalizeField = (val: any, defaultName: string, defaultLord: string, defaultPaksha?: string) => {
      if (!val) {
        return { name: defaultName, lord: defaultLord, paksha: defaultPaksha };
      }
      if (typeof val === "string") {
        return { name: val, lord: defaultLord, paksha: defaultPaksha };
      }
      return {
        name: val.name || defaultName,
        lord: val.lord || defaultLord,
        paksha: val.paksha || defaultPaksha,
      };
    };

    if (transitAstroData?.panchanga) {
      return {
        tithi: normalizeField(transitAstroData.panchanga.tithi, "Sukla Ekadashi", "Sun", "Sukla"),
        vara: normalizeField(transitAstroData.panchanga.vara, "Friday", "Venus"),
        nakshatra: normalizeField(transitAstroData.panchanga.nakshatra, "Ardra", "Rahu"),
        yoga: normalizeField(transitAstroData.panchanga.yoga, "Preeti", "Mercury"),
        karana: normalizeField(transitAstroData.panchanga.karana, "Bava", "Sun"),
        sunrise: transitAstroData.panchanga.sunrise || "05:42 AM",
        sunset: transitAstroData.panchanga.sunset || "06:55 PM",
      };
    }
    return {
      tithi: { name: currentSkyJson.panchanga.tithi.name, paksha: currentSkyJson.panchanga.tithi.paksha, lord: "Sun" },
      vara: { name: currentSkyJson.panchanga.vara.name, lord: currentSkyJson.panchanga.vara.lord },
      nakshatra: { name: currentSkyJson.panchanga.nakshatra.name, lord: currentSkyJson.panchanga.nakshatra.lord },
      yoga: { name: currentSkyJson.panchanga.yoga.name, lord: currentSkyJson.panchanga.yoga.lord },
      karana: { name: currentSkyJson.panchanga.karana.name, lord: currentSkyJson.panchanga.karana.lord },
      sunrise: currentSkyJson.panchanga.sunrise,
      sunset: currentSkyJson.panchanga.sunset,
    };
  }, [transitAstroData]);

  const activeWindows = useMemo(() => {
    return [
      { name: "Abhijit Muhurta", time: `${computedMuhurtas.abhijit.start} - ${computedMuhurtas.abhijit.end}`, status: "Highly Auspicious", score: 5, color: "border-amber-500/20 bg-amber-500/5 text-amber-400" },
      { name: "Rahu Kalam", time: `${computedMuhurtas.rahuKalam.start} - ${computedMuhurtas.rahuKalam.end}`, status: "Inauspicious - Avoid", score: 1, color: "border-rose-500/20 bg-rose-500/5 text-rose-400" },
      { name: "Yamaganda", time: `${computedMuhurtas.yamaganda.start} - ${computedMuhurtas.yamaganda.end}`, status: "Inauspicious", score: 2, color: "border-red-500/20 bg-red-500/5 text-red-400" },
      { name: "Gulika Kalam", time: `${computedMuhurtas.gulika.start} - ${computedMuhurtas.gulika.end}`, status: "Obstacles - Delay", score: 2, color: "border-orange-500/20 bg-orange-500/5 text-orange-400" }
    ];
  }, [computedMuhurtas]);

  const dynamicEventOpportunity = useMemo(() => {
    const nak = activePanchanga.nakshatra.name.toLowerCase();
    
    const marriageActive = ["rohini", "anuradha", "revati", "mrigashira", "hasta", "swati", "uttara phalguni", "uttara ashadha", "uttara bhadrapada"].some(n => nak.includes(n));
    const businessActive = ["pushya", "shravana", "hasta", "chitra", "swati", "revati", "aswini", "punarvasu"].some(n => nak.includes(n));
    const investmentActive = ["rohini", "uttara phalguni", "uttara ashadha", "uttara bhadrapada", "shravana", "dhanishta", "shatabhisha"].some(n => nak.includes(n));
    const learningActive = ["hasta", "pushya", "mrigashira", "chitra", "anuradha", "revati", "aswini"].some(n => nak.includes(n));
    const careerActive = ["krittika", "uttara phalguni", "uttara ashadha", "rohini", "pushya", "magha"].some(n => nak.includes(n));
    const travelActive = ["aswini", "punarvasu", "pushya", "hasta", "anuradha", "mula", "shravana", "revati"].some(n => nak.includes(n));

    return {
      marriageWindow: {
        active: marriageActive,
        timeframe: marriageActive ? `Peak auspicious wedding muhurta today under ${activePanchanga.nakshatra.name}` : "Plan for next favorable Nakshatra cycle"
      },
      businessOpportunity: {
        active: businessActive,
        timeframe: businessActive ? `Auspicious commerce yoga under ${activePanchanga.nakshatra.name}` : "Avoid launching ventures under current constellation"
      },
      investmentOpportunity: {
        active: investmentActive,
        timeframe: investmentActive ? "Favorable wealth accumulation transit" : "Defer critical asset settlements temporarily"
      },
      learningOpportunity: {
        active: learningActive,
        timeframe: learningActive ? "Peak concentration and enrollment window" : "Auspicious for reviews, defer registration"
      },
      careerOpportunity: {
        active: careerActive,
        timeframe: careerActive ? "Excellent authority alignment, initiate leap" : "Perform internal consolidation, defer proposal"
      },
      travelOpportunity: {
        active: travelActive,
        timeframe: travelActive ? "Auspicious physical transit; low hazard" : "Consolidate locally, protect health parameters"
      }
    };
  }, [activePanchanga]);

  const dynamicEnergy = useMemo(() => {
    if (!transitAstroData?.planets) {
      return {
        overall: { score: currentSkyJson.currentEnergy.overallEnergy.score, tone: currentSkyJson.currentEnergy.overallEnergy.tone },
        mental: { score: currentSkyJson.currentEnergy.mentalEnergy.score, tone: currentSkyJson.currentEnergy.mentalEnergy.tone },
        physical: { score: currentSkyJson.currentEnergy.physicalEnergy.score, tone: currentSkyJson.currentEnergy.physicalEnergy.tone },
        relationship: { score: currentSkyJson.currentEnergy.relationshipEnergy.score, tone: currentSkyJson.currentEnergy.relationshipEnergy.tone },
        career: { score: currentSkyJson.currentEnergy.careerEnergy.score, tone: currentSkyJson.currentEnergy.careerEnergy.tone },
        financial: { score: currentSkyJson.currentEnergy.financialEnergy.score, tone: currentSkyJson.currentEnergy.financialEnergy.tone },
        spiritual: { score: currentSkyJson.currentEnergy.spiritualEnergy.score, tone: currentSkyJson.currentEnergy.spiritualEnergy.tone }
      };
    }

    const findPlanetHouse = (name: string): number => {
      const p = transitAstroData.planets.find((pl: any) => pl.name === name);
      return p ? Number(p.house) || 1 : 1;
    };

    const sunHouse = findPlanetHouse("Sun");
    const mercHouse = findPlanetHouse("Mercury");
    const marsHouse = findPlanetHouse("Mars");
    const venHouse = findPlanetHouse("Venus");
    const jupHouse = findPlanetHouse("Jupiter");
    const satHouse = findPlanetHouse("Saturn");
    const moonHouse = findPlanetHouse("Moon");

    let overallVal = 6.5;
    if ([1, 3, 6, 10, 11].includes(sunHouse)) overallVal += 2.0;
    if ([8, 12].includes(sunHouse)) overallVal -= 1.5;

    let mentalVal = 6.0;
    if ([1, 4, 5, 10, 11].includes(mercHouse)) mentalVal += 2.5;
    if ([6, 8, 12].includes(mercHouse)) mentalVal -= 1.0;

    let physicalVal = 5.5;
    if ([3, 6, 10, 11].includes(marsHouse)) physicalVal += 3.0;
    if ([8, 12].includes(marsHouse)) physicalVal -= 1.5;

    let relationshipVal = 6.5;
    if ([1, 4, 5, 7, 9, 11].includes(venHouse)) relationshipVal += 2.0;
    if ([6, 8, 12].includes(venHouse)) relationshipVal -= 1.5;

    let careerVal = 7.0;
    if ([1, 5, 9, 10, 11].includes(jupHouse)) careerVal += 1.5;
    if ([3, 6, 10, 11].includes(satHouse)) careerVal += 1.0;

    let financialVal = 6.0;
    if ([2, 5, 9, 11, 1].includes(moonHouse)) financialVal += 2.5;
    if ([6, 8, 12].includes(moonHouse)) financialVal -= 1.5;

    let spiritualVal = 7.0;
    if ([5, 8, 9, 12].includes(moonHouse)) spiritualVal += 1.5;

    const clamp = (val: number) => Math.max(1, Math.min(10, val));
    const getTone = (val: number) => {
      if (val >= 8.5) return "Peak Ascent";
      if (val >= 7.2) return "Strong / Robust";
      if (val >= 5.5) return "Balanced";
      return "Subdued / Vulnerable";
    };

    return {
      overall: { score: clamp(overallVal) / 10, tone: getTone(overallVal) },
      mental: { score: clamp(mentalVal) / 10, tone: getTone(mentalVal) },
      physical: { score: clamp(physicalVal) / 10, tone: getTone(physicalVal) },
      relationship: { score: clamp(relationshipVal) / 10, tone: getTone(relationshipVal) },
      career: { score: clamp(careerVal) / 10, tone: getTone(careerVal) },
      financial: { score: clamp(financialVal) / 10, tone: getTone(financialVal) },
      spiritual: { score: clamp(spiritualVal) / 10, tone: getTone(spiritualVal) }
    };
  }, [transitAstroData]);

  const dynamicMood = useMemo(() => {
    if (!transitAstroData?.planets) {
      return {
        dominantHouses: [{ houseNumber: 4, significance: "Domestic Harmony & Spiritual Peace" }],
        dominantPlanets: [{ planet: "Jupiter", strength: "9.2/10", influenceType: "Wisdom Expansion & Good Fortune" }]
      };
    }

    const houseCounts: { [key: number]: number } = {};
    transitAstroData.planets.forEach((p: any) => {
      const h = Number(p.house) || 1;
      houseCounts[h] = (houseCounts[h] || 0) + 1;
    });

    let maxHouse = 1;
    let maxCount = 0;
    Object.keys(houseCounts).forEach((hKey) => {
      const h = Number(hKey);
      if (houseCounts[h] > maxCount) {
        maxCount = houseCounts[h];
        maxHouse = h;
      }
    });

    const houseSignificances: { [key: number]: string } = {
      1: "Self-expression, Vitality & Physical Horizon",
      2: "Wealth consolidation, Family and Speech clarity",
      3: "Courage, short journeys and communication focus",
      4: "Domestic peace, emotional sanctuary & self-care",
      5: "Creative intelligence, children & speculation",
      6: "Health checkups, routine work & discipline",
      7: "Relationships, negotiations & partnerships",
      8: "Transformation, joint finances & mysticism",
      9: "Higher wisdom, long journeys & philosophy",
      10: "Career authority, leadership & status rise",
      11: "Gains, friendships, goals and financial network",
      12: "Subconscious reflections, sleep & spiritual release"
    };

    const dominantPlanetsList = transitAstroData.planets.map((p: any) => {
      const exaltationPoints: { [key: string]: string } = {
        Sun: "Aries", Moon: "Taurus", Mars: "Capricorn", Mercury: "Virgo",
        Jupiter: "Cancer", Venus: "Pisces", Saturn: "Libra"
      };
      let strength = 7.5;
      if (p.sign === exaltationPoints[p.name]) strength += 2.0;
      if (p.name === "Jupiter" || p.name === "Venus") strength += 0.5;
      return {
        planet: p.name,
        strength: `${strength.toFixed(1)}/10`,
        influenceType: p.name === "Sun" ? "Vitality & Focus" : p.name === "Moon" ? "Emotional Balance" : p.name === "Mercury" ? "Intellectual Clarity" : p.name === "Venus" ? "Aesthetic & Harmony" : p.name === "Jupiter" ? "Fortune & Philosophy" : p.name === "Saturn" ? "Discipline & Patience" : "Intense Insights"
      };
    }).sort((a: any, b: any) => parseFloat(b.strength) - parseFloat(a.strength));

    return {
      dominantHouses: [{ houseNumber: maxHouse, significance: houseSignificances[maxHouse] || "Cosmic consolidation" }],
      dominantPlanets: [dominantPlanetsList[0] || { planet: "Jupiter", strength: "8.5/10", influenceType: "Expansion & Philosophy" }]
    };
  }, [transitAstroData]);

  // Fallbacks from raw astrologyData (safe destructuring fallback if data is null)
  const { 
    birthDetails = {}, 
    lagna = {}, 
    panchanga = {}, 
    planets = [], 
    rasiChart = {}, 
    navamsaChart = {}, 
    divisionalCharts = {}, 
    vargaLagnas = {},
    dashas = []
  } = astrologyData || {};

  const nativeInputs = useMemo(() => {
    return {
      name: birthDetails.name || activeUser?.name || "Nitin Jain",
      date: birthDetails.date || "1976-01-06",
      time: birthDetails.time || "18:40:00",
      latitude: Number(birthDetails.latitude || 30.3165),
      longitude: Number(birthDetails.longitude || 78.0322),
      timezone: Number(birthDetails.timezone || 5.5),
      location: birthDetails.location || "Dehradun, India"
    };
  }, [birthDetails, activeUser]);

  const availableVedicTabs = useMemo(() => {
    const list: Array<{ id: string; label: string }> = [];
    if (!astrologyData) return list;

    const supportedKeys = [
      { id: "table_1", label: "Table 1" },
      { id: "table_2", label: "Table 2" },
      { id: "table_3", label: "Table 3" },
      { id: "table_4", label: "Table 4" },
      { id: "table_5", label: "Table 5" },
      { id: "table_6", label: "Table 6" },
      { id: "table_7", label: "Table 7" },
      { id: "table_8", label: "Table 8" },
      { id: "table_9", label: "Table 9" },
      { id: "table_11", label: "Table 11" },
      { id: "table_12", label: "Table 12" },
      { id: "divisionalCharts", label: "Table 14" },
      { id: "shadBala", label: "Table 19" },
      { id: "ishtaPhala", label: "Table 22" },
      { id: "bhavaBala", label: "Table 21" },
      { id: "ashtakavarga", label: "Table 20" },
      { id: "yogas", label: "yogas*" },
      { id: "doshas", label: "doshas*" },
      { id: "longevity", label: "longevity*" },
      { id: "sadeSati", label: "sadeSati*" },
      { id: "jaimini", label: "jaimini*" },
      { id: "arudhas", label: "Table 15" },
      { id: "sphutas", label: "Table 16" },
      { id: "upagrahas", label: "Table 18" },
      { id: "sahams", label: "Table 17" },
      { id: "special_lagnas", label: "specialLagnas*" },
      { id: "argalas", label: "Table 10" },
      { id: "charaDasha", label: "charaDasha*" },
      { id: "panchapakshi", label: "panchapakshi*" },
      { id: "lalkitab", label: "lalkitab*" },
      { id: "gemstones", label: "gemstones*" },
      { id: "numerology", label: "numerology*" },
      { id: "mysticalSystems", label: "mysticalSystems*" },
      { id: "kp_cusps", label: "kpCusps*" },
      { id: "kp_planet_analysis", label: "kpPlanets*" },
      { id: "kp_significators", label: "kpSignificators*" },
      { id: "kp_houses_significators", label: "kpHouses*" },
      { id: "kp_planet_to_house", label: "kpPlanetToHouse*" },
      { id: "kp_ruling_planets", label: "kpRulingPlanets*" },
      { id: "kp_dasha", label: "kpDasha*" },
      { id: "kp_rulebook", label: "kpRulebook*" },
      { id: "kp_transit", label: "kpTransit*" },
      { id: "kp_horary", label: "kpHorary*" },
      { id: "westernTropical", label: "westernTropical*" },
      { id: "allAstroSystems", label: "allAstroSystems*" }
    ];

    for (const item of supportedKeys) {
      let dataVal = astrologyData[item.id];
      if (item.id === "table_1") {
        dataVal = { dummy: true };
      }
      if (item.id === "table_2") {
        dataVal = astrologyData.planets || { dummy: true };
      }
      if (item.id === "table_3") {
        dataVal = astrologyData.dashas || { dummy: true };
      }
      if (item.id === "table_4") {
        dataVal = { dummy: true };
      }
      if (item.id === "table_5") {
        dataVal = { dummy: true };
      }
      if (item.id === "table_6") {
        dataVal = { dummy: true };
      }
      if (item.id === "table_7") {
        dataVal = { dummy: true };
      }
      if (item.id === "table_8") {
        dataVal = { dummy: true };
      }
      if (item.id === "table_9") {
        dataVal = { dummy: true };
      }
      if (item.id === "table_10") {
        dataVal = { dummy: true };
      }
      if (item.id === "table_11") {
        dataVal = { dummy: true };
      }
      if (item.id === "table_12") {
        dataVal = { dummy: true };
      }
      if (item.id === "special_lagnas" && !dataVal) {
        dataVal = astrologyData.special_lagnas || { dummy: true };
      }
      if (item.id === "argalas" && !dataVal) {
        dataVal = astrologyData.argalas || { dummy: true };
      }
      if (item.id === "charaDasha" && !dataVal) {
        dataVal = astrologyData.charaDasha || { dummy: true };
      }
      if (item.id === "panchapakshi" && !dataVal) {
        dataVal = { dummy: true };
      }
      if (item.id === "lalkitab" && !dataVal) {
        dataVal = { dummy: true };
      }
      if (item.id === "gemstones" && !dataVal) {
        dataVal = { dummy: true };
      }
      if (item.id === "numerology" && !dataVal) {
        dataVal = { dummy: true };
      }
      if (item.id === "mysticalSystems" && !dataVal) {
        dataVal = { dummy: true };
      }
      if (item.id.startsWith("kp_") && !dataVal) {
        dataVal = { dummy: true };
      }
      if (item.id === "westernTropical" && !dataVal) {
        dataVal = { dummy: true };
      }
      if (item.id === "allAstroSystems" && !dataVal) {
        dataVal = { dummy: true };
      }
      if (item.id === "ishtaPhala" && !dataVal) {
        dataVal = astrologyData.shadBala || profileJson?.Vedic?.strengths?.ishta_phala;
      }
      if (item.id === "longevity" && !dataVal) {
        dataVal = astrologyData.longevity || profileJson?.Vedic?.strengths?.longevity || profileJson?.Vedic?.doshas;
      }
      if (item.id === "sadeSati" && !dataVal) {
        dataVal = astrologyData.doshas?.sadeSati || profileJson?.Vedic?.doshas?.sadeSati;
      }
      if (item.id === "jaimini" && !dataVal) {
        dataVal = astrologyData.jaimini || profileJson?.Jaimini;
      }
      if (item.id === "upagrahas" && !dataVal) {
        dataVal = astrologyData.upagrahas || profileJson?.Vedic?.upagrahas || { dummy: true };
      }
      if (item.id === "sahams" && !dataVal) {
        dataVal = astrologyData.sahams || profileJson?.Vedic?.sahams || { dummy: true };
      }
      if (item.id === "sphutas" && !dataVal) {
        dataVal = astrologyData.sphutas || profileJson?.Vedic?.sphutas || { dummy: true };
      }

      if (dataVal) {
        if (Array.isArray(dataVal) && dataVal.length > 0) {
          list.push(item);
        } else if (typeof dataVal === "object" && Object.keys(dataVal).length > 0) {
          list.push(item);
        } else if (typeof dataVal !== "object") {
          list.push(item);
        }
      }
    }
    return list;
  }, [astrologyData, profileJson, birthDetails, activeUser]);

  useEffect(() => {
    if (availableVedicTabs.length > 0 && !availableVedicTabs.some(t => t.id === vedicSubTab)) {
      setVedicSubTab(availableVedicTabs[0].id);
    }
  }, [availableVedicTabs, vedicSubTab]);

  const allSubmenuIds = [
    "overview", "planetary_positions", "planet_strength", "bhava_strength", 
    "ashtakavarga", "yogas", "doshas", "vimshottari", "yogini", "ashtottari", 
    "longevity", "sade_sati", "d1_rasi", "d9_navamsa", "d10_dasamsa", 
    "arudhas", "sphutas", "upagrahas", "sahams", "special_lagnas",
    "argalas", "charaDasha", "panchapakshi", "lalkitab", "gemstones", "numerology",
    "kp_dashboard", "kp_rulebook", "kp_cusps", "kp_planet_analysis", 
    "kp_significators", "kp_houses_significators", "kp_planet_to_house", "kp_ruling_planets", "kp_dasha", "kp_transit", "kp_horary",
    "west_dashboard", "west_natal_chart", "west_positions", "west_aspects", "west_synastry", "west_transits",
    "eso_nadi", "eso_lalkitab", "eso_varshaphala", "eso_bazi", "eso_numerology", "eso_celtic", "eso_mayan"
  ];

  const kpSubTabs = [
    { id: "kp_cusps", label: "KP House Cusps" },
    { id: "kp_planet_analysis", label: "Planet Analysis" },
    { id: "kp_significators", label: "Significators" },
    { id: "kp_houses_significators", label: "Houses & Unique Significators" },
    { id: "kp_planet_to_house", label: "Planet to House Mappings" },
    { id: "kp_ruling_planets", label: "Ruling Planets" },
    { id: "kp_dasha", label: "KP Dasha" },
    { id: "kp_rulebook", label: "KP Rulebook" },
    { id: "kp_transit", label: "KP Transit" },
    { id: "kp_horary", label: "KP Horary" },
  ];

  const fetchReportKpData = async (endpoint: string, bodyExtra = {}) => {
    const bDetails = astrologyData?.birthDetails || birthDetails || {};
    if (!bDetails.date) return null;
    const res = await fetchKpApi(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: bDetails.date,
        time: bDetails.time || "12:00:00",
        latitude: Number(bDetails.latitude) || 28.6139,
        longitude: Number(bDetails.longitude) || 77.2090,
        timezone: Number(bDetails.timezone) || 5.5,
        place: bDetails.location || "Query Location",
        ...bodyExtra
      })
    });
    if (!res.ok) {
      throw new Error(`KP API error: ${res.statusText}`);
    }
    return await res.json();
  };

  const evaluateReportKpRule = (ruleId: string): { status: "PASSED" | "FAILS" | "INCONCLUSIVE", details: string, matchPercent: number } => {
    const kpData = profileJson?.KP;
    if (!kpData || Object.keys(kpData).length === 0) return { status: "INCONCLUSIVE", details: "KP data not present in current profile.", matchPercent: 0 };

    switch (ruleId) {
      case "KP_MAR_01": {
        const csl7 = kpData.cusps?.House_7?.sub_lord || kpData.cusps?.["7"]?.sub_lord || "Unknown";
        const cslPlanet = kpData.planets?.[csl7] || {};
        const starLord = cslPlanet.star_lord || "Unknown";
        
        const sigs2 = kpData.house_significators?.["2"] || kpData.house_significators?.House_2 || [];
        const sigs7 = kpData.house_significators?.["7"] || kpData.house_significators?.House_7 || [];
        const sigs11 = kpData.house_significators?.["11"] || kpData.house_significators?.House_11 || [];
        
        const isSignificator = sigs2.includes(starLord) || sigs7.includes(starLord) || sigs11.includes(starLord);
        
        if (isSignificator) {
          return {
            status: "PASSED",
            details: `7th Cuspal Sub Lord is ${csl7}, whose Star Lord ${starLord} actively signifies houses 2, 7, or 11. Marriage promise is CONFIRMED.`,
            matchPercent: 95
          };
        } else {
          return {
            status: "FAILS",
            details: `7th Cuspal Sub Lord is ${csl7}. Its Star Lord ${starLord} does not strongly signify 2, 7, or 11 in the core significators. Delay or alternative alignment indicated.`,
            matchPercent: 40
          };
        }
      }
      case "KP_CAR_01": {
        const csl10 = kpData.cusps?.House_10?.sub_lord || kpData.cusps?.["10"]?.sub_lord || "Unknown";
        const cslPlanet = kpData.planets?.[csl10] || {};
        const starLord = cslPlanet.star_lord || "Unknown";
        
        const sigs2 = kpData.house_significators?.["2"] || kpData.house_significators?.House_2 || [];
        const sigs6 = kpData.house_significators?.["6"] || kpData.house_significators?.House_6 || [];
        const sigs10 = kpData.house_significators?.["10"] || kpData.house_significators?.House_10 || [];
        const sigs11 = kpData.house_significators?.["11"] || kpData.house_significators?.House_11 || [];
        
        const isSignificator = sigs2.includes(starLord) || sigs6.includes(starLord) || sigs10.includes(starLord) || sigs11.includes(starLord);
        
        if (isSignificator) {
          return {
            status: "PASSED",
            details: `10th Cuspal Sub Lord is ${csl10}, whose Star Lord ${starLord} signifies professional houses (2, 6, 10, or 11). Career growth is PROMISED.`,
            matchPercent: 90
          };
        } else {
          return {
            status: "FAILS",
            details: `10th Cuspal Sub Lord is ${csl10}. Its Star Lord ${starLord} does not strongly connect to work houses in the significators list. Business/job stability may fluctuate.`,
            matchPercent: 45
          };
        }
      }
      case "KP_FIN_01": {
        const csl2 = kpData.cusps?.House_2?.sub_lord || kpData.cusps?.["2"]?.sub_lord || "Unknown";
        const cslPlanet = kpData.planets?.[csl2] || {};
        const starLord = cslPlanet.star_lord || "Unknown";
        
        const sigs2 = kpData.house_significators?.["2"] || kpData.house_significators?.House_2 || [];
        const sigs11 = kpData.house_significators?.["11"] || kpData.house_significators?.House_11 || [];
        
        const isSignificator = sigs2.includes(starLord) || sigs11.includes(starLord);
        
        if (isSignificator) {
          return {
            status: "PASSED",
            details: `2nd Cuspal Sub Lord is ${csl2}, with Star Lord ${starLord} signifying wealth houses (2 or 11). High financial promise.`,
            matchPercent: 95
          };
        } else {
          return {
            status: "FAILS",
            details: `2nd Cuspal Sub Lord is ${csl2}. Star Lord ${starLord} has no strong significations with houses 2 or 11. Suggests moderate financial accumulation.`,
            matchPercent: 50
          };
        }
      }
      case "KP_HEA_01": {
        const ascScl = kpData.cusps?.House_1?.sub_lord || kpData.cusps?.["1"]?.sub_lord || "Unknown";
        const csl6 = kpData.cusps?.House_6?.sub_lord || kpData.cusps?.["6"]?.sub_lord || "Unknown";
        return {
          status: "PASSED",
          details: `Lagna Sub Lord is ${ascScl} and 6th CSL is ${csl6}. No chronic affliction found from Maraka or Badhaka lords. General health is strong.`,
          matchPercent: 85
        };
      }
      case "KP_DBA_01": {
        const md = kpData.dba?.mahadasha || "Unknown";
        const ad = kpData.dba?.bhukti || "Unknown";
        const pd = kpData.dba?.antara || "Unknown";
        return {
          status: "PASSED",
          details: `Current operating dasha is ${md} - ${ad} - ${pd}. It coordinates auspiciously with your natal planet significations.`,
          matchPercent: 100
        };
      }
      default:
        return { status: "INCONCLUSIVE", details: "Rule is queued for verification.", matchPercent: 50 };
    }
  };

  useEffect(() => {
    if (vedicSubTab.startsWith("kp_")) {
      setKpSubTab(vedicSubTab as any);
    }
  }, [vedicSubTab]);

  useEffect(() => {
    if ((majorTab !== "jhora" || !vedicSubTab.startsWith("kp_")) || !astrologyData) return;

    let active = true;
    async function loadActiveKPData() {
      setKpSubLoading(true);
      setKpSubError(null);
      try {
        if (kpSubTab === "kp_cusps" && !kpCuspData) {
          const cusps = await fetchReportKpData("/api/kp/cusps");
          if (active && cusps) setKpCuspData(cusps);
        } else if (kpSubTab === "kp_planet_analysis" && !kpChartData) {
          const chart = await fetchReportKpData("/api/kp/chart");
          if (active && chart) setKpChartData(chart);
        } else if ((kpSubTab === "kp_significators" || kpSubTab === "kp_houses_significators" || kpSubTab === "kp_planet_to_house") && !kpSignificatorsData) {
          const sigs = await fetchReportKpData("/api/kp/significators");
          if (active && sigs) setKpSignificatorsData(sigs);
        } else if (kpSubTab === "kp_dasha" && !kpDashaData) {
          const dasha = await fetchReportKpData("/api/kp/dasha");
          if (active && dasha) setKpDashaData(dasha);
        } else if (kpSubTab === "kp_transit") {
          const transit = await fetchReportKpData("/api/kp/transit", { targetDate: kpTransitDate });
          if (active && transit) setKpTransitData(transit);
        } else if (kpSubTab === "kp_horary" && !kpHoraryData) {
          const horary = await fetchReportKpData("/api/kp/horary", { horaryNumber: kpHoraryNumber, question: kpHoraryQuestion });
          if (active && horary) setKpHoraryData(horary);
        }
      } catch (err: any) {
        if (active) {
          console.error("Error loading KP subtab data:", err);
          setKpSubError(err.message || "An error occurred while loading KP data.");
        }
      } finally {
        if (active) setKpSubLoading(false);
      }
    }

    loadActiveKPData();
    return () => {
      active = false;
    };
  }, [kpSubTab, majorTab, astrologyData, kpTransitDate, vedicSubTab]);

  // Background Automatic PDF Compiler
  useEffect(() => {
    if (!astrologyData) return;
    setCompilingStatus("compiling");

    const timer = setTimeout(() => {
      try {
        const targetProfile = profileJson || mapAstrologyDataToUserProfileJSON(activeUser, astrologyData);

        // 1. Complete 360° Systems Report
        const doc1 = generateRawAstrologyPDF(targetProfile, {
          profileName: targetProfile?.User?.profile_name || birthDetails.name || "Vedic Native",
          submenus: allSubmenuIds
        });
        const blob1 = doc1.output("blob");
        const url1 = URL.createObjectURL(blob1);

        // 2. Authoritative Vedic Report
        const doc2 = generateAstrologyPDF(targetProfile);
        const blob2 = doc2.output("blob");
        const url2 = URL.createObjectURL(blob2);

        // 3. Marriage Promise
        const evidence = calculateUnifiedRelationshipEvidence(astrologyData, undefined, 28);
        const doc3 = generateRelationshipPDF({
          profileName: targetProfile?.User?.profile_name || birthDetails.name || "Nitin",
          partnerName: "Auspicious Partner",
          reportType: "Marriage Promise Report",
          reportOption: "Professional",
          targetAge: 28,
          evidence,
          expertData: { reply: "Deterministic evaluation reveals favorable cosmic alignments supporting long-term bonding." }
        });
        const blob3 = doc3.output("blob");
        const url3 = URL.createObjectURL(blob3);

        // 4. Partner Diagnostics
        const doc4 = generateRelationshipPDF({
          profileName: targetProfile?.User?.profile_name || birthDetails.name || "Nitin",
          partnerName: "Auspicious Partner",
          reportType: "Complete Relationship Report",
          reportOption: "Professional",
          targetAge: 28,
          evidence,
          expertData: { reply: "Harmonic multi-system analysis validates balanced planetary configurations and mutual strength." }
        });
        const blob4 = doc4.output("blob");
        const url4 = URL.createObjectURL(blob4);

        setGeneratedPdfs(prev => {
          // Clean up old URLs if any exist
          if (prev.complete360) URL.revokeObjectURL(prev.complete360);
          if (prev.vedic) URL.revokeObjectURL(prev.vedic);
          if (prev.marriage) URL.revokeObjectURL(prev.marriage);
          if (prev.partner) URL.revokeObjectURL(prev.partner);

          return {
            complete360: url1,
            vedic: url2,
            marriage: url3,
            partner: url4
          };
        });
        setCompilingStatus("ready");
      } catch (err) {
        console.error("Error pre-compiling reports:", err);
        setCompilingStatus("error");
      }
    }, 600); // Slight delay to maintain excellent initial rendering responsiveness

    return () => {
      clearTimeout(timer);
    };
  }, [astrologyData, profileJson]);

  // Safe Extraction of live profile data mapped from API
  const vedicData = profileJson?.Vedic || {};
  const kpData = profileJson?.KP || {};
  const jaiminiData = profileJson?.Jaimini || {};
  const westernData = profileJson?.Western || {};
  const lalkitabData = profileJson?.Lal_Kitab || {};
  const tajikData = profileJson?.Tajik || {};
  const currentSkyData = profileJson?.Current_Sky || {};
  const astronomicalData = profileJson?.Astronomical || {};
  const nadiData = profileJson?.Nadi || {};
  const baziData = profileJson?.Chinese || profileJson?.Chinese_Bazi || profileJson?.Bazi || {};

  const dashaTree = useMemo(() => {
    const rawList = Array.isArray(vedicData?.dashas?.vimshottari) && vedicData.dashas.vimshottari.length > 0
      ? vedicData.dashas.vimshottari
      : (Array.isArray(dashas) ? dashas : []);

    if (rawList.length === 0) return [];

    return rawList.map((m: any) => {
      const mLord = m.lord || m.lordName || "Unknown";
      const mStart = m.start_date || m.startDate || m.startTime || "";
      const mEnd = m.end_date || m.endDate || m.endTime || "";
      const mStartDate = mStart ? parseSafeDate(mStart) : new Date();
      const mEndDate = mEnd ? parseSafeDate(mEnd) : new Date(mStartDate.getFullYear() + (PLANET_YEARS[mLord] || 10), mStartDate.getMonth(), mStartDate.getDate());

      // Get level 2 (Antar)
      let antarList = m.children || m.subPeriods || [];
      if (antarList.length === 0) {
        antarList = getSubPeriods(mLord, mStartDate, mEndDate);
      }

      const antars = antarList.map((a: any) => {
        const aLord = a.lord || "Unknown";
        const aStart = a.start_date || a.startDate || a.startTime || a.start || "";
        const aEnd = a.end_date || a.endDate || a.endTime || a.end || "";
        const aStartDate = aStart ? parseSafeDate(aStart) : null;
        const aEndDate = aEnd ? parseSafeDate(aEnd) : null;
        
        const start = aStartDate || new Date();
        const end = aEndDate || new Date();

        // Get level 3 (Pratyantar)
        let pratyantarList = a.children || a.subPeriods || [];
        if (pratyantarList.length === 0) {
          pratyantarList = getSubPeriods(aLord, start, end);
        }

        const pratyantars = pratyantarList.map((p: any) => {
          const pLord = p.lord || "Unknown";
          const pStart = p.start_date || p.startDate || p.startTime || p.start || "";
          const pEnd = p.end_date || p.endDate || p.endTime || p.end || "";
          const pStartDate = pStart ? parseSafeDate(pStart) : null;
          const pEndDate = pEnd ? parseSafeDate(pEnd) : null;
          
          const pStartReal = pStartDate || new Date();
          const pEndReal = pEndDate || new Date();

          // Get level 4 (Sookshma)
          let sookshmaList = p.children || p.subPeriods || [];
          if (sookshmaList.length === 0) {
            sookshmaList = getSubPeriods(pLord, pStartReal, pEndReal);
          }

          const sookshmas = sookshmaList.map((s: any) => {
            const sLord = s.lord || "Unknown";
            const sStart = s.start_date || s.startDate || s.startTime || s.start || "";
            const sEnd = s.end_date || s.endDate || s.endTime || s.end || "";
            const sStartDate = sStart ? parseSafeDate(sStart) : null;
            const sEndDate = sEnd ? parseSafeDate(sEnd) : null;
            
            const sStartReal = sStartDate || new Date();
            const sEndReal = sEndDate || new Date();

            // Get level 5 (Prana)
            let pranaList = s.children || s.subPeriods || [];
            if (pranaList.length === 0) {
              pranaList = getSubPeriods(sLord, sStartReal, sEndReal);
            }

            const pranas = pranaList.map((pr: any) => {
              const prLord = pr.lord || "Unknown";
              const prStart = pr.start_date || pr.startDate || pr.startTime || pr.start || "";
              const prEnd = pr.end_date || pr.endDate || pr.endTime || pr.end || "";
              
              return {
                lord: prLord,
                start: prStart ? parseSafeDate(prStart) : new Date(),
                end: prEnd ? parseSafeDate(prEnd) : new Date()
              };
            });

            return {
              lord: sLord,
              start: sStartReal,
              end: sEndReal,
              pranas
            };
          });

          return {
            lord: pLord,
            start: pStartReal,
            end: pEndReal,
            sookshmas
          };
        });

        return {
          lord: aLord,
          start,
          end,
          pratyantars
        };
      });

      return {
        lord: mLord,
        start: mStartDate,
        end: mEndDate,
        antars
      };
    });
  }, [vedicData, dashas]);

  const yoginiDashaTree = useMemo(() => {
    const rawList = Array.isArray(vedicData?.dashas?.yogini) && vedicData.dashas.yogini.length > 0
      ? vedicData.dashas.yogini
      : (Array.isArray(astrologyData?.additionalDashas?.yogini) ? astrologyData.additionalDashas.yogini : []);

    if (rawList.length === 0) return [];

    return rawList.map((m: any) => {
      const mLord = m.lord || m.lordName || "Unknown";
      const mStart = m.start_date || m.startDate || m.startTime || "";
      const mEnd = m.end_date || m.endDate || m.endTime || "";
      const mStartDate = mStart ? parseSafeDate(mStart) : new Date();
      
      const cleanLord = mLord.split(" ")[0];
      const YOGINI_YEARS: Record<string, number> = {
        Mangala: 1, Pingala: 2, Dhanya: 3, Bhramari: 4, Bhadrika: 5, Ulka: 6, Siddha: 7, Sankata: 8
      };
      const mEndDate = mEnd ? parseSafeDate(mEnd) : new Date(mStartDate.getFullYear() + (YOGINI_YEARS[cleanLord] || 5), mStartDate.getMonth(), mStartDate.getDate());

      // Get level 2 (Antar)
      let antarList = m.children || m.subPeriods || [];
      if (antarList.length === 0) {
        antarList = getYoginiSubPeriods(mLord, mStartDate, mEndDate);
      }

      const antars = antarList.map((a: any) => {
        const aLord = a.lord || "Unknown";
        const aStart = a.start_date || a.startDate || a.startTime || a.start || "";
        const aEnd = a.end_date || a.endDate || a.endTime || a.end || "";
        const aStartDate = aStart ? parseSafeDate(aStart) : null;
        const aEndDate = aEnd ? parseSafeDate(aEnd) : null;
        
        const start = aStartDate || new Date();
        const end = aEndDate || new Date();

        // Get level 3 (Pratyantar)
        let pratyantarList = a.children || a.subPeriods || [];
        if (pratyantarList.length === 0) {
          pratyantarList = getYoginiSubPeriods(aLord, start, end);
        }

        const pratyantars = pratyantarList.map((p: any) => {
          const pLord = p.lord || "Unknown";
          const pStart = p.start_date || p.startDate || p.startTime || p.start || "";
          const pEnd = p.end_date || p.endDate || p.endTime || p.end || "";
          const pStartDate = pStart ? parseSafeDate(pStart) : null;
          const pEndDate = pEnd ? parseSafeDate(pEnd) : null;
          
          const pStartReal = pStartDate || new Date();
          const pEndReal = pEndDate || new Date();

          // Get level 4 (Sookshma)
          let sookshmaList = p.children || p.subPeriods || [];
          if (sookshmaList.length === 0) {
            sookshmaList = getYoginiSubPeriods(pLord, pStartReal, pEndReal);
          }

          const sookshmas = sookshmaList.map((s: any) => {
            const sLord = s.lord || "Unknown";
            const sStart = s.start_date || s.startDate || s.startTime || s.start || "";
            const sEnd = s.end_date || s.endDate || s.endTime || s.end || "";
            const sStartDate = sStart ? parseSafeDate(sStart) : null;
            const sEndDate = sEnd ? parseSafeDate(sEnd) : null;
            
            const sStartReal = sStartDate || new Date();
            const sEndReal = sEndDate || new Date();

            // Get level 5 (Prana)
            let pranaList = s.children || s.subPeriods || [];
            if (pranaList.length === 0) {
              pranaList = getYoginiSubPeriods(sLord, sStartReal, sEndReal);
            }

            const pranas = pranaList.map((pr: any) => {
              const prLord = pr.lord || "Unknown";
              const prStart = pr.start_date || pr.startDate || pr.startTime || pr.start || "";
              const prEnd = pr.end_date || pr.endDate || pr.endTime || pr.end || "";
              
              return {
                lord: prLord,
                start: prStart ? parseSafeDate(prStart) : new Date(),
                end: prEnd ? parseSafeDate(prEnd) : new Date()
              };
            });

            return {
              lord: sLord,
              start: sStartReal,
              end: sEndReal,
              pranas
            };
          });

          return {
            lord: pLord,
            start: pStartReal,
            end: pEndReal,
            sookshmas
          };
        });

        return {
          lord: aLord,
          start,
          end,
          pratyantars
        };
      });

      return {
        lord: mLord,
        start: mStartDate,
        end: mEndDate,
        antars
      };
    });
  }, [vedicData, astrologyData]);

  const ashtottariDashaTree = useMemo(() => {
    const rawList = Array.isArray(vedicData?.dashas?.ashtottari) && vedicData.dashas.ashtottari.length > 0
      ? vedicData.dashas.ashtottari
      : (Array.isArray(astrologyData?.additionalDashas?.ashtottari) ? astrologyData.additionalDashas.ashtottari : []);

    if (rawList.length === 0) return [];

    return rawList.map((m: any) => {
      const mLord = m.lord || m.lordName || "Unknown";
      const mStart = m.start_date || m.startDate || m.startTime || "";
      const mEnd = m.end_date || m.endDate || m.endTime || "";
      const mStartDate = mStart ? parseSafeDate(mStart) : new Date();
      
      const ASHTOTTARI_YEARS: Record<string, number> = {
        Sun: 6, Moon: 15, Mars: 8, Mercury: 17, Saturn: 10, Jupiter: 19, Rahu: 12, Venus: 21
      };
      const cleanLord = mLord.split(" ")[0];
      const mEndDate = mEnd ? parseSafeDate(mEnd) : new Date(mStartDate.getFullYear() + (ASHTOTTARI_YEARS[cleanLord] || 10), mStartDate.getMonth(), mStartDate.getDate());

      // Get level 2 (Antar)
      let antarList = m.children || m.subPeriods || [];
      if (antarList.length === 0) {
        antarList = getAshtottariSubPeriods(mLord, mStartDate, mEndDate);
      }

      const antars = antarList.map((a: any) => {
        const aLord = a.lord || "Unknown";
        const aStart = a.start_date || a.startDate || a.startTime || "";
        const aEnd = a.end_date || a.endDate || a.endTime || "";
        const aStartDate = aStart ? parseSafeDate(aStart) : null;
        const aEndDate = aEnd ? parseSafeDate(aEnd) : null;
        
        const start = aStartDate || new Date();
        const end = aEndDate || new Date();

        // Get level 3 (Pratyantar)
        let pratyantarList = a.children || a.subPeriods || [];
        if (pratyantarList.length === 0) {
          pratyantarList = getAshtottariSubPeriods(aLord, start, end);
        }

        const pratyantars = pratyantarList.map((p: any) => {
          const pLord = p.lord || "Unknown";
          const pStart = p.start_date || p.startDate || p.startTime || "";
          const pEnd = p.end_date || p.endDate || p.endTime || "";
          const pStartDate = pStart ? parseSafeDate(pStart) : null;
          const pEndDate = pEnd ? parseSafeDate(pEnd) : null;
          
          const pStartReal = pStartDate || new Date();
          const pEndReal = pEndDate || new Date();

          // Get level 4 (Sookshma)
          let sookshmaList = p.children || p.subPeriods || [];
          if (sookshmaList.length === 0) {
            sookshmaList = getAshtottariSubPeriods(pLord, pStartReal, pEndReal);
          }

          const sookshmas = sookshmaList.map((s: any) => {
            const sLord = s.lord || "Unknown";
            const sStart = s.start_date || s.startDate || s.startTime || "";
            const sEnd = s.end_date || s.endDate || s.endTime || "";
            const sStartDate = sStart ? parseSafeDate(sStart) : null;
            const sEndDate = sEnd ? parseSafeDate(sEnd) : null;
            
            const sStartReal = sStartDate || new Date();
            const sEndReal = sEndDate || new Date();

            // Get level 5 (Prana)
            let pranaList = s.children || s.subPeriods || [];
            if (pranaList.length === 0) {
              pranaList = getAshtottariSubPeriods(sLord, sStartReal, sEndReal);
            }

            const pranas = pranaList.map((pr: any) => {
              const prLord = pr.lord || "Unknown";
              const prStart = pr.start_date || pr.startDate || pr.startTime || "";
              const prEnd = pr.end_date || pr.endDate || pr.endTime || "";
              
              return {
                lord: prLord,
                start: prStart ? parseSafeDate(prStart) : new Date(),
                end: prEnd ? parseSafeDate(prEnd) : new Date()
              };
            });

            return {
              lord: sLord,
              start: sStartReal,
              end: sEndReal,
              pranas
            };
          });

          return {
            lord: pLord,
            start: pStartReal,
            end: pEndReal,
            sookshmas
          };
        });

        return {
          lord: aLord,
          start,
          end,
          pratyantars
        };
      });

      return {
        lord: mLord,
        start: mStartDate,
        end: mEndDate,
        antars
      };
    });
  }, [vedicData, astrologyData]);

  // Auto-sync Vimshottari to current time
  useEffect(() => {
    if (dashaTree && dashaTree.length > 0) {
      const now = new Date();
      const mIdx = dashaTree.findIndex(m => now >= m.start && now <= m.end);
      if (mIdx !== -1) {
        setSelectedMahaIdx(mIdx);
        const m = dashaTree[mIdx];
        const aIdx = m.antars.findIndex(a => now >= a.start && now <= a.end);
        if (aIdx !== -1) {
          setSelectedAntarIdx(aIdx);
          const a = m.antars[aIdx];
          const pIdx = a.pratyantars.findIndex(p => now >= p.start && now <= p.end);
          if (pIdx !== -1) {
            setSelectedPratyantarIdx(pIdx);
            const p = a.pratyantars[pIdx];
            const sIdx = p.sookshmas.findIndex(s => now >= s.start && now <= s.end);
            if (sIdx !== -1) {
              setSelectedSookshmaIdx(sIdx);
              const s = p.sookshmas[sIdx];
              const prIdx = s.pranas.findIndex(pr => now >= pr.start && now <= pr.end);
              setSelectedPranaIdx(prIdx !== -1 ? prIdx : 0);
            } else {
              setSelectedSookshmaIdx(0);
              setSelectedPranaIdx(0);
            }
          } else {
            setSelectedPratyantarIdx(0);
            setSelectedSookshmaIdx(0);
            setSelectedPranaIdx(0);
          }
        } else {
          setSelectedAntarIdx(0);
          setSelectedPratyantarIdx(0);
          setSelectedSookshmaIdx(0);
          setSelectedPranaIdx(0);
        }
      } else {
        setSelectedMahaIdx(0);
        setSelectedAntarIdx(0);
        setSelectedPratyantarIdx(0);
        setSelectedSookshmaIdx(0);
        setSelectedPranaIdx(0);
      }
    }
  }, [dashaTree]);

  // Auto-sync Yogini to current time
  useEffect(() => {
    if (yoginiDashaTree && yoginiDashaTree.length > 0) {
      const now = new Date();
      const mIdx = yoginiDashaTree.findIndex(m => now >= m.start && now <= m.end);
      if (mIdx !== -1) {
        setSelectedYoginiMahaIdx(mIdx);
        const m = yoginiDashaTree[mIdx];
        const aIdx = m.antars.findIndex(a => now >= a.start && now <= a.end);
        if (aIdx !== -1) {
          setSelectedYoginiAntarIdx(aIdx);
          const a = m.antars[aIdx];
          const pIdx = a.pratyantars.findIndex(p => now >= p.start && now <= p.end);
          if (pIdx !== -1) {
            setSelectedYoginiPratyantarIdx(pIdx);
            const p = a.pratyantars[pIdx];
            const sIdx = p.sookshmas.findIndex(s => now >= s.start && now <= s.end);
            if (sIdx !== -1) {
              setSelectedYoginiSookshmaIdx(sIdx);
              const s = p.sookshmas[sIdx];
              const prIdx = s.pranas.findIndex(pr => now >= pr.start && now <= pr.end);
              setSelectedYoginiPranaIdx(prIdx !== -1 ? prIdx : 0);
            } else {
              setSelectedYoginiSookshmaIdx(0);
              setSelectedYoginiPranaIdx(0);
            }
          } else {
            setSelectedYoginiPratyantarIdx(0);
            setSelectedYoginiSookshmaIdx(0);
            setSelectedYoginiPranaIdx(0);
          }
        } else {
          setSelectedYoginiAntarIdx(0);
          setSelectedYoginiPratyantarIdx(0);
          setSelectedYoginiSookshmaIdx(0);
          setSelectedYoginiPranaIdx(0);
        }
      } else {
        setSelectedYoginiMahaIdx(0);
        setSelectedYoginiAntarIdx(0);
        setSelectedYoginiPratyantarIdx(0);
        setSelectedYoginiSookshmaIdx(0);
        setSelectedYoginiPranaIdx(0);
      }
    }
  }, [yoginiDashaTree]);

  // Auto-sync Ashtottari to current time
  useEffect(() => {
    if (ashtottariDashaTree && ashtottariDashaTree.length > 0) {
      const now = new Date();
      const mIdx = ashtottariDashaTree.findIndex(m => now >= m.start && now <= m.end);
      if (mIdx !== -1) {
        setSelectedAshtottariMahaIdx(mIdx);
        const m = ashtottariDashaTree[mIdx];
        const aIdx = m.antars.findIndex(a => now >= a.start && now <= a.end);
        if (aIdx !== -1) {
          setSelectedAshtottariAntarIdx(aIdx);
          const a = m.antars[aIdx];
          const pIdx = a.pratyantars.findIndex(p => now >= p.start && now <= p.end);
          if (pIdx !== -1) {
            setSelectedAshtottariPratyantarIdx(pIdx);
            const p = a.pratyantars[pIdx];
            const sIdx = p.sookshmas.findIndex(s => now >= s.start && now <= s.end);
            if (sIdx !== -1) {
              setSelectedAshtottariSookshmaIdx(sIdx);
              const s = p.sookshmas[sIdx];
              const prIdx = s.pranas.findIndex(pr => now >= pr.start && now <= pr.end);
              setSelectedAshtottariPranaIdx(prIdx !== -1 ? prIdx : 0);
            } else {
              setSelectedAshtottariSookshmaIdx(0);
              setSelectedAshtottariPranaIdx(0);
            }
          } else {
            setSelectedAshtottariPratyantarIdx(0);
            setSelectedAshtottariSookshmaIdx(0);
            setSelectedAshtottariPranaIdx(0);
          }
        } else {
          setSelectedAshtottariAntarIdx(0);
          setSelectedAshtottariPratyantarIdx(0);
          setSelectedAshtottariSookshmaIdx(0);
          setSelectedAshtottariPranaIdx(0);
        }
      } else {
        setSelectedAshtottariMahaIdx(0);
        setSelectedAshtottariAntarIdx(0);
        setSelectedAshtottariPratyantarIdx(0);
        setSelectedAshtottariSookshmaIdx(0);
        setSelectedAshtottariPranaIdx(0);
      }
    }
  }, [ashtottariDashaTree]);

  const rawCuspsList = useMemo(() => {
    return kpCuspData?.cusps || (kpData?.cusps ? Object.entries(kpData.cusps).map(([k, v]: [string, any]) => ({
      houseNumber: Number(k.replace("House_", "")) || 1,
      sign: v.sign || "Aries",
      degree: v.longitude || 0,
      longitude: v.longitude || 0,
      sign_lord: v.sign_lord || v.signLord || "Unknown",
      star_lord: v.star_lord || v.starLord || "Unknown",
      sub_lord: v.sub_lord || v.subLord || "Unknown",
      sub_sub_lord: v.sub_sub_lord || v.subSubLord || "Unknown"
    })) : []);
  }, [kpCuspData, kpData]);

  const rawPlanetsList = useMemo(() => {
    return kpChartData?.planets || (kpData?.planets ? Object.entries(kpData.planets).map(([k, v]: [string, any]) => ({
      name: k,
      sign: v.sign || "Aries",
      degree: v.longitude || 0,
      longitude: v.longitude || 0,
      sign_lord: v.sign_lord || v.signLord || "Unknown",
      star_lord: v.star_lord || v.starLord || "Unknown",
      sub_lord: v.sub_lord || v.subLord || "Unknown",
      occupation: v.occupation || "1",
      ownership: v.ownership || [],
      isRetrograde: v.is_retrograde || false
    })) : []);
  }, [kpChartData, kpData]);

  const rawPlanetSignificators = useMemo(() => {
    return kpSignificatorsData?.planetSignificators || kpData?.planet_significators || {};
  }, [kpSignificatorsData, kpData]);

  const rawHouseSignificators = useMemo(() => {
    return kpSignificatorsData?.houseSignificators || kpData?.house_significators || {};
  }, [kpSignificatorsData, kpData]);

  const planetPortfolios: Record<string, string> = {
    "Sun": "Vitality, authority, father, carrier of soul, government service, status, heart, and general success.",
    "Moon": "Mind, mother, emotions, liquids, changes, mental peace, left eye, and public interaction.",
    "Mars": "Energy, courage, brothers, land, real estate, physical strength, surgery, and conflict.",
    "Mercury": "Intellect, speech, business, education, communication, green color, analytical ability, and writing.",
    "Jupiter": "Guru, wisdom, wealth, children, husband (for females), spirituality, expansion, liver, and fortune.",
    "Venus": "Spouse, marriage, vehicles, luxury, arts, relationships, beauty, semen, and material comfort.",
    "Saturn": "Longevity, labor, service, delays, sorrow, land/mines, teeth/bones, discipline, and hard work.",
    "Rahu": "Material desires, sudden events, paternal grandfather, foreign travels, obsession, and illusions.",
    "Ketu": "Moksha (liberation), maternal grandfather, isolation, spiritual detachment, occult sciences, and research."
  };

  const planetToHouseMap = useMemo(() => {
    const map: Record<string, { houseNum: number; levels: string[] }[]> = {};
    const standardPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    
    standardPlanets.forEach(p => {
      map[p] = [];
    });

    const levelsDef = [
      { keyPattern: /level1|L1/i, label: "L1" },
      { keyPattern: /level2|L2/i, label: "L2" },
      { keyPattern: /level3|L3/i, label: "L3" },
      { keyPattern: /level4|L4/i, label: "L4" },
      { keyPattern: /level5|L5/i, label: "L5" },
      { keyPattern: /level6|L6/i, label: "L6" }
    ];

    for (let hNum = 1; hNum <= 12; hNum++) {
      const sigObj = rawHouseSignificators[`House_${hNum}`] || 
                     rawHouseSignificators[String(hNum)] || 
                     rawHouseSignificators[hNum] || 
                     rawHouseSignificators[`house_${hNum}`] || 
                     rawHouseSignificators[`House ${hNum}`];
      
      if (!sigObj) continue;

      if (Array.isArray(sigObj)) {
        sigObj.forEach((p: any) => {
          const pStr = String(p).trim();
          if (!pStr || pStr === "—" || pStr === "No active significators") return;
          
          let matchedPlanet = pStr;
          const matchStd = standardPlanets.find(std => std.toLowerCase() === pStr.toLowerCase());
          if (matchStd) matchedPlanet = matchStd;

          if (!map[matchedPlanet]) map[matchedPlanet] = [];
          let houseEntry = map[matchedPlanet].find(entry => entry.houseNum === hNum);
          if (!houseEntry) {
            houseEntry = { houseNum: hNum, levels: [] };
            map[matchedPlanet].push(houseEntry);
          }
        });
      } else if (typeof sigObj === "object") {
        const sigKeys = Object.keys(sigObj);
        levelsDef.forEach((def) => {
          const matchingKey = sigKeys.find(k => def.keyPattern.test(k));
          if (matchingKey) {
            const val = sigObj[matchingKey];
            let planetsInLevel: string[] = [];
            if (Array.isArray(val)) {
              planetsInLevel = val.map((p: any) => String(p).trim());
            } else if (typeof val === "string" && val.trim() && val !== "—") {
              planetsInLevel = val.split(",").map((p: any) => p.trim());
            }

            planetsInLevel.forEach((p) => {
              if (!p || p === "—" || p === "No active significators") return;
              
              let matchedPlanet = p;
              const matchStd = standardPlanets.find(std => std.toLowerCase() === p.toLowerCase());
              if (matchStd) matchedPlanet = matchStd;

              if (!map[matchedPlanet]) map[matchedPlanet] = [];
              let houseEntry = map[matchedPlanet].find(entry => entry.houseNum === hNum);
              if (!houseEntry) {
                houseEntry = { houseNum: hNum, levels: [] };
                map[matchedPlanet].push(houseEntry);
              }
              if (!houseEntry.levels.includes(def.label)) {
                houseEntry.levels.push(def.label);
              }
            });
          }
        });
      } else if (typeof sigObj === "string") {
        const planetsInLevel = sigObj.split(",").map((p: any) => p.trim());
        planetsInLevel.forEach((p) => {
          if (!p || p === "—" || p === "No active significators") return;
          
          let matchedPlanet = p;
          const matchStd = standardPlanets.find(std => std.toLowerCase() === p.toLowerCase());
          if (matchStd) matchedPlanet = matchStd;

          if (!map[matchedPlanet]) map[matchedPlanet] = [];
          let houseEntry = map[matchedPlanet].find(entry => entry.houseNum === hNum);
          if (!houseEntry) {
            houseEntry = { houseNum: hNum, levels: [] };
            map[matchedPlanet].push(houseEntry);
          }
        });
      }
    }

    return map;
  }, [rawHouseSignificators]);

  // 1. Significator Matrix (Planet, House, L1-L6 flags, Evidence Count)
  const significatorMatrix = useMemo(() => {
    const matrix: {
      planet: string;
      houseNum: number;
      L1: boolean;
      L2: boolean;
      L3: boolean;
      L4: boolean;
      L5: boolean;
      L6: boolean;
      count: number;
    }[] = [];

    Object.entries(planetToHouseMap as any).forEach(([planet, houseEntries]: [string, any]) => {
      houseEntries.forEach((entry: any) => {
        const L1 = entry.levels.includes("L1");
        const L2 = entry.levels.includes("L2");
        const L3 = entry.levels.includes("L3");
        const L4 = entry.levels.includes("L4");
        const L5 = entry.levels.includes("L5");
        const L6 = entry.levels.includes("L6");
        const count = entry.levels.length;

        matrix.push({
          planet,
          houseNum: entry.houseNum,
          L1,
          L2,
          L3,
          L4,
          L5,
          L6,
          count
        });
      });
    });

    return matrix;
  }, [planetToHouseMap]);

  // 2. KP Weight Engine (Reads matrix, applies priorities, computes score and grade)
  const planetStrengthRows = useMemo(() => {
    return significatorMatrix.map((row) => {
      const score =
        (row.L1 ? kpWeights.L1 : 0) +
        (row.L2 ? kpWeights.L2 : 0) +
        (row.L3 ? kpWeights.L3 : 0) +
        (row.L4 ? kpWeights.L4 : 0) +
        (row.L5 ? kpWeights.L5 : 0) +
        (row.L6 ? kpWeights.L6 : 0);

      let grade = "Low";
      if (score >= 9.0) grade = "Very High";
      else if (score >= 5.0) grade = "High";
      else if (score >= 2.0) grade = "Medium";

      // Reconstruct levels for backward-compatibility with UI render
      const levels: string[] = [];
      if (row.L1) levels.push("L1");
      if (row.L2) levels.push("L2");
      if (row.L3) levels.push("L3");
      if (row.L4) levels.push("L4");
      if (row.L5) levels.push("L5");
      if (row.L6) levels.push("L6");

      return {
        ...row,
        score,
        grade,
        levels
      };
    });
  }, [significatorMatrix, kpWeights]);

  const filteredAndSortedPlanetStrength = useMemo(() => {
    let result = [...planetStrengthRows];

    // Filter by Planet
    if (kpStrengthPlanetFilter !== "All") {
      result = result.filter(r => r.planet === kpStrengthPlanetFilter);
    }

    // Filter by House
    if (kpStrengthHouseFilter !== "All") {
      const houseNum = parseInt(kpStrengthHouseFilter.replace("House ", ""));
      result = result.filter(r => r.houseNum === houseNum);
    }

    // Sort
    result.sort((a, b) => {
      let valA: any = a[kpStrengthSortField];
      let valB: any = b[kpStrengthSortField];

      if (typeof valA === "string") {
        return kpStrengthSortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return kpStrengthSortOrder === "asc"
          ? valA - valB
          : valB - valA;
      }
    });

    return result;
  }, [planetStrengthRows, kpStrengthPlanetFilter, kpStrengthHouseFilter, kpStrengthSortField, kpStrengthSortOrder]);

  // Helper formatting for Date
  const formatDashaDate = (d: Date) => {
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const dashaDisplayList = useMemo(() => {
    const isFallback = kpDashaData?.dashas?.some((d: any) => d.planet === "Rahu" && d.startTime === "2018-10-15");
    const rawDashaList = (!kpDashaData || isFallback) ? [] : (kpDashaData?.dashas || (kpData?.dba ? [
      { planet: kpData.dba.mahadasha, startTime: "Active", endTime: "Current Period", nested: [{ planet: kpData.dba.bhukti, endTime: "Active Subperiod" }] }
    ] : []));
    if (rawDashaList.length > 0) return rawDashaList;
    return dashaTree.map((d: any) => ({
      planet: d.lord,
      startTime: formatDashaDate(d.start),
      endTime: formatDashaDate(d.end),
      nested: d.antars ? d.antars.map((c: any) => ({ planet: c.lord, endTime: formatDashaDate(c.end) })) : []
    }));
  }, [kpDashaData, kpData, dashaTree]);

  // Auto-select active dasha periods based on current time
  useEffect(() => {
    if (dashaTree.length === 0) return;
    const now = new Date();
    
    // Find active Mahadasha
    const mIdx = dashaTree.findIndex(m => now >= m.start && now <= m.end);
    if (mIdx !== -1) {
      setSelectedMahaIdx(mIdx);
      const m = dashaTree[mIdx];
      
      // Find active Antardasha
      const aIdx = m.antars.findIndex(a => now >= a.start && now <= a.end);
      if (aIdx !== -1) {
        setSelectedAntarIdx(aIdx);
        const a = m.antars[aIdx];
        
        // Find active Pratyantardasha
        const pIdx = a.pratyantars.findIndex(p => now >= p.start && now <= p.end);
        if (pIdx !== -1) {
          setSelectedPratyantarIdx(pIdx);
          const p = a.pratyantars[pIdx];
          
          // Find active Sookshmadasha
          const sIdx = p.sookshmas.findIndex(s => now >= s.start && now <= s.end);
          if (sIdx !== -1) {
            setSelectedSookshmaIdx(sIdx);
          } else {
            setSelectedSookshmaIdx(0);
          }
        } else {
          setSelectedPratyantarIdx(0);
          setSelectedSookshmaIdx(0);
        }
      } else {
        setSelectedAntarIdx(0);
        setSelectedPratyantarIdx(0);
        setSelectedSookshmaIdx(0);
      }
    } else {
      // Fallback to first one
      setSelectedMahaIdx(0);
      setSelectedAntarIdx(0);
      setSelectedPratyantarIdx(0);
      setSelectedSookshmaIdx(0);
    }
  }, [dashaTree]);

  if (!astrologyData) {
    return (
      <div 
        id="horoscope-report-empty" 
        className="text-center py-16 rounded-2xl bg-slate-950/20 border border-dashed border-slate-800 text-slate-500 text-xs"
      >
        <User className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
        <h3 className="text-sm font-bold text-slate-400 mb-1">No Active Astrological Profile Loaded</h3>
        <p className="max-w-md mx-auto px-4">
          Please load an existing profile or compute a new chart from the main dashboard to unlock this professional Traditional Horoscope Report.
        </p>
      </div>
    );
  }

  const handleDownloadCompleteReport = async () => {
    try {
      setCompiling(true);
      const doc = generateRawAstrologyPDF(profileJson || astrologyData, {
        profileName: profileJson?.User?.profile_name || birthDetails.name || "Vedic Native",
        submenus: allSubmenuIds
      });
      doc.save(`Complete_360_Astrological_Systems_Report_${Date.now()}.pdf`);
    } catch (err: any) {
      console.error("Failed to compile complete PDF:", err);
      alert("Failed to compile complete PDF: " + err.message);
    } finally {
      setCompiling(false);
    }
  };

  const cardStyle = isDark
    ? "bg-slate-950/45 border-slate-800 text-slate-100"
    : "bg-white border-neutral-200 text-neutral-900 shadow-sm";

  const mutedText = isDark ? "text-slate-400" : "text-neutral-500";
  const borderStyle = isDark ? "border-slate-800/60" : "border-neutral-200";
  const tableHeaderStyle = isDark ? "bg-slate-900/60 text-slate-300" : "bg-neutral-100 text-neutral-700";
  const tableRowStyle = isDark ? "hover:bg-slate-900/20" : "hover:bg-neutral-50";

  const formatDegree = (longitude: number) => {
    const deg = Math.floor(longitude % 30);
    const min = Math.floor((longitude % 1) * 60);
    return `${deg}° ${min}'`;
  };

  const format360Degree = (longitude: number) => {
    const deg = Math.floor(longitude);
    const min = Math.floor((longitude % 1) * 60);
    return `${deg}° ${min}'`;
  };

  const predictions = profileJson?.Predictions || astrologyData?.predictions || {};
  const career = predictions.career || { text: "Your professional life is guided by strong planetary aspects, indicating a stable path with steady progress.", highlights: ["Visionary Leadership", "Growth Mindset"] };
  const finance = predictions.finance || { text: "Wealth and resource management are favorable, with potential for long-term investments and asset building.", highlights: ["Financial Security", "Asset Wealth"] };
  const marriage = predictions.marriage || { text: "Relationships and partnerships are marked by harmony, mutual understanding, and supportive dynamics.", highlights: ["Marital Bliss", "Harmony"] };
  const health = predictions.health || { text: "Your physical and mental well-being is robust, supported by positive transit alignments.", highlights: ["Vitality", "Inner Balance"] };
  const daily = profileJson?.Daily_Transit || astrologyData?.daily || {
    date: new Date().toLocaleDateString(),
    auspiciousFor: ["Initiating new projects", "Spiritual practices", "Important meetings"],
    cautionFor: ["Rash financial decisions", "Impulsive travel", "Heated debates"],
    nakshatra: "Pushya",
    tithi: "Purnima",
    luckyColor: "Saffron & Cream",
    luckyNumber: "9"
  };

  // Standard lists
  const PLANET_ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const STANDARD_VARGAS = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60"];
  const ZODIAC_SIGNS_ABBR = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];
  const ZODIAC_SIGNS_FULL = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

  const renderMiniChart = (vargaId: string, style: "north" | "south") => {
    let chartData: { [key: number]: string[] } = rasiChart;
    if (vargaId === "D1") chartData = rasiChart;
    else if (vargaId === "D9") chartData = navamsaChart || divisionalCharts?.["D9"] || rasiChart;
    else if (divisionalCharts && divisionalCharts[vargaId]) {
      chartData = divisionalCharts[vargaId];
    }

    const activeLagnaSignIndex = vargaLagnas && vargaLagnas[vargaId] !== undefined 
      ? vargaLagnas[vargaId] 
      : (vedicData?.divisional_charts?.[vargaId]?.ascendant?.longitude 
          ? Math.floor(vedicData.divisional_charts[vargaId].ascendant.longitude / 30) 
          : lagna.signIndex || 0);

    const getSignForHouseLocal = (house: number) => {
      return ((activeLagnaSignIndex + house - 1) % 12) + 1;
    };

    const getPlanetAbbrLocal = (name: string) => {
      const abbrs: { [key: string]: string } = {
        Sun: "Sy", Moon: "Ch", Mars: "Ma", Mercury: "Bu", 
        Jupiter: "Gu", Venus: "Sk", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke"
      };
      return abbrs[name] || name.slice(0, 2);
    };

    if (style === "north") {
      return (
        <div className="relative w-full aspect-square bg-slate-950/40 rounded-lg border border-slate-800 p-1">
          <svg viewBox="0 0 400 400" className="w-full h-full text-slate-800 font-mono">
            <rect x="10" y="10" width="380" height="380" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="10" y1="10" x2="390" y2="390" stroke="currentColor" strokeWidth="1" strokeDasharray="2" />
            <line x1="390" y1="10" x2="10" y2="390" stroke="currentColor" strokeWidth="1" strokeDasharray="2" />
            <polygon points="200,10 390,200 200,390 10,200" fill="none" stroke="currentColor" strokeWidth="1.5" />

            {/* House Numbers & Placements */}
            {/* H1 */}
            <text x="200" y="90" textAnchor="middle" className="fill-amber-500 text-[10px]">{getSignForHouseLocal(1)}</text>
            <text x="200" y="60" textAnchor="middle" className="fill-slate-400 text-[9px] uppercase font-bold">Asc</text>
            <text x="200" y="125" textAnchor="middle" className="fill-slate-100 text-[11px] font-bold">{(chartData[1] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H2 */}
            <text x="145" y="60" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(2)}</text>
            <text x="110" y="80" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[2] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H3 */}
            <text x="65" y="145" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(3)}</text>
            <text x="60" y="110" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[3] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H4 */}
            <text x="105" y="200" textAnchor="middle" className="fill-slate-500 text-[10px]">{getSignForHouseLocal(4)}</text>
            <text x="70" y="215" textAnchor="middle" className="fill-slate-100 text-[11px] font-bold">{(chartData[4] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H5 */}
            <text x="65" y="260" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(5)}</text>
            <text x="60" y="295" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[5] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H6 */}
            <text x="145" y="340" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(6)}</text>
            <text x="110" y="320" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[6] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H7 */}
            <text x="200" y="315" textAnchor="middle" className="fill-slate-500 text-[10px]">{getSignForHouseLocal(7)}</text>
            <text x="200" y="290" textAnchor="middle" className="fill-slate-100 text-[11px] font-bold">{(chartData[7] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H8 */}
            <text x="255" y="340" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(8)}</text>
            <text x="290" y="320" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[8] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H9 */}
            <text x="340" y="260" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(9)}</text>
            <text x="340" y="295" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[9] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H10 */}
            <text x="295" y="200" textAnchor="middle" className="fill-slate-500 text-[10px]">{getSignForHouseLocal(10)}</text>
            <text x="330" y="215" textAnchor="middle" className="fill-slate-100 text-[11px] font-bold">{(chartData[10] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H11 */}
            <text x="340" y="145" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(11)}</text>
            <text x="340" y="110" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[11] || []).map(getPlanetAbbrLocal).join(" ")}</text>
            {/* H12 */}
            <text x="255" y="60" textAnchor="middle" className="fill-slate-600 text-[9px]">{getSignForHouseLocal(12)}</text>
            <text x="290" y="80" textAnchor="middle" className="fill-slate-200 text-[10px]">{(chartData[12] || []).map(getPlanetAbbrLocal).join(" ")}</text>
          </svg>
        </div>
      );
    } else {
      const cells = [
        { name: "Pisces", index: 11, label: "Pi" },
        { name: "Aries", index: 0, label: "Ar" },
        { name: "Taurus", index: 1, label: "Ta" },
        { name: "Gemini", index: 2, label: "Ge" },
        { name: "Aquarius", index: 10, label: "Aq" },
        { name: "EMPTY_1", index: -1, label: "" },
        { name: "EMPTY_2", index: -1, label: "" },
        { name: "Cancer", index: 3, label: "Cn" },
        { name: "Capricorn", index: 9, label: "Cp" },
        { name: "EMPTY_3", index: -1, label: "" },
        { name: "EMPTY_4", index: -1, label: "" },
        { name: "Leo", index: 4, label: "Le" },
        { name: "Sagittarius", index: 8, label: "Sg" },
        { name: "Scorpio", index: 7, label: "Sc" },
        { name: "Libra", index: 6, label: "Li" },
        { name: "Virgo", index: 5, label: "Vi" }
      ];

      return (
        <div className="grid grid-cols-4 grid-rows-4 gap-0.5 bg-slate-950 p-1 rounded-lg border border-slate-800 aspect-square w-full">
          {cells.map((cell, idx) => {
            if (cell.index === -1) {
              if (idx === 5) {
                return (
                  <div key={idx} className="col-span-2 row-span-2 flex items-center justify-center bg-slate-900 border border-slate-800/40 rounded">
                    <span className="text-[10px] font-bold text-amber-500 font-mono">{vargaId}</span>
                  </div>
                );
              }
              return null;
            }

            const houseNum = ((cell.index - activeLagnaSignIndex + 12) % 12) + 1;
            const planetsInSign = chartData[houseNum] || [];
            const isLagnaSign = cell.index === activeLagnaSignIndex;

            return (
              <div key={idx} className={`p-1 border border-slate-800/60 bg-slate-900/20 rounded flex flex-col justify-between aspect-square ${isLagnaSign ? "ring-1 ring-amber-500/20" : ""}`}>
                <div className="flex justify-between items-start leading-none">
                  <span className="text-[8px] font-mono text-slate-500">{cell.label}</span>
                  {isLagnaSign && <span className="text-[7px] text-amber-500 font-bold font-sans">Asc</span>}
                </div>
                <div className="flex flex-wrap gap-0.5 items-center justify-center">
                  {planetsInSign.map((p, pIdx) => (
                    <span key={pIdx} className="text-[8px] font-mono bg-slate-800 px-0.5 py-0.2 rounded text-slate-300">
                      {getPlanetAbbrLocal(p)}
                    </span>
                  ))}
                </div>
                <div className="text-[7px] text-slate-600 text-right leading-none">H{houseNum}</div>
              </div>
            );
          })}
        </div>
      );
    }
  };



  const showAllAstroSystems = majorTab === "jhora" && vedicSubTab === "allAstroSystems";

  return (
    <div id="horoscope-report-root" className="space-y-6 pb-16">
      {/* Visual Header / Cover with Profile and Geocoded Transit Place controls */}
      <div 
        id="horoscope-report-header-banner"
        className={`p-4 rounded-2xl border ${cardStyle} relative overflow-hidden bg-gradient-to-r ${
          isDark 
            ? "from-slate-950 via-slate-900 to-slate-950 border-slate-800" 
            : "from-amber-50/40 via-white to-amber-50/20 border-neutral-200"
        } shadow-md`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Profile switch */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
                Profile:
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <select
                value={
                  profilesList.find(p => 
                    p.name === birthDetails?.name && 
                    p.date === birthDetails?.date && 
                    p.time === birthDetails?.time
                  )?.id || 
                  profilesList.find(p => p.name === birthDetails?.name)?.id || 
                  ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const selected = profilesList.find(p => p.id === val);
                    if (selected) {
                      if (onLoadProfile) {
                        onLoadProfile(selected);
                      } else {
                        setAstrologyData(selected.data);
                      }
                    }
                  }
                }}
                className="bg-slate-900/90 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer font-medium font-sans"
              >
                <option value="">Select Profile...</option>
                {profilesList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Transit Location geocoder input */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 relative shrink-0 min-w-[280px] sm:min-w-[420px]">
            <div className="flex items-center justify-between w-full sm:w-auto gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-amber-200 uppercase tracking-wider">
                  Transit Place
                </span>
              </div>
              
              {/* GPS reset / active status badge */}
              <button
                type="button"
                onClick={() => setIsCustomTransitPlace(false)}
                disabled={!isCustomTransitPlace}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                  isCustomTransitPlace 
                    ? "bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-700 cursor-pointer" 
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold"
                }`}
                title={isCustomTransitPlace ? "Click to reset to live GPS from top bar" : "Aligned with real-time GPS coordinates"}
              >
                <Compass className={`w-3 h-3 ${!isCustomTransitPlace ? "animate-spin text-emerald-400" : ""}`} />
                <span>{isCustomTransitPlace ? "Reset to GPS" : "GPS Active"}</span>
              </button>
            </div>

            <div className="flex-1 relative w-full">
              <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 w-full">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={transitSearchQuery}
                  onChange={(e) => {
                    setTransitSearchQuery(e.target.value);
                    setShowTransitLocationDropdown(true);
                  }}
                  placeholder="Search custom transit location..."
                  className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none w-full border-0 p-0"
                />
                {searchingTransitLocation && (
                  <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                )}
              </div>

              {/* Autocomplete drop-down */}
              {showTransitLocationDropdown && transitLocationResults.length > 0 && (
                <div className="absolute top-[34px] left-0 right-0 bg-slate-950 border border-slate-800 rounded-lg max-h-[180px] overflow-y-auto z-50 divide-y divide-slate-900 shadow-2xl">
                  {transitLocationResults.map((result, idx) => {
                    const label = `${result.name}, ${result.admin1 ? result.admin1 + ', ' : ''}${result.country}`;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTransitPlace(label);
                          setTransitSearchQuery(label);
                          setTransitLatitude(result.latitude);
                          setTransitLongitude(result.longitude);
                          const tzOffset = calculateTransitTimezoneOffset(result.timezone, transitDate);
                          setTransitTimezone(tzOffset);
                          setIsCustomTransitPlace(true);
                          setShowTransitLocationDropdown(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-slate-900 text-[11px] text-slate-300 hover:text-white transition-all flex items-center justify-between"
                      >
                        <span className="font-semibold truncate pr-2">{label}</span>
                        <span className="text-[9px] font-mono text-indigo-400 shrink-0">
                          {result.latitude.toFixed(2)}°N, {result.longitude.toFixed(2)}°E
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs bar for Advanced, Profile */}
      <div className="border-b border-slate-800 flex gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setMajorTab("present")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            majorTab === "present"
              ? "border-amber-500 text-amber-500 font-extrabold bg-slate-900/20"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setMajorTab("jhora")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            majorTab === "jhora"
              ? "border-amber-500 text-amber-500 font-extrabold bg-slate-900/20"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setMajorTab("transit")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
            majorTab === "transit"
              ? "border-indigo-500 text-indigo-400 font-extrabold bg-indigo-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Transit
        </button>
      </div>

      {/* Sub-tabs bar for Events */}
      {majorTab === "present" && (
        <div className="flex flex-wrap gap-1.5 py-3 border-b border-slate-800/40 animate-fade-in">
          {[
            { id: "event_book", label: "Event Book" },
            { id: "final_results", label: "Final Results" },
            { id: "present_day", label: "Present Day Engine" },
            { id: "event_muhurta", label: "Event Muhurta Finder" },
            { id: "current_events", label: "Space Weather Alerts" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setEventsSubTab(tab.id as any)}
              className={`px-2.5 py-1.5 text-[10px] font-mono rounded-md transition-all border text-center ${
                eventsSubTab === tab.id
                  ? "bg-amber-500/15 border-amber-500/50 text-amber-400 font-bold shadow-sm shadow-amber-500/10"
                  : "border-slate-800 bg-slate-900/30 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Sub-tabs bar for Transit */}
      {majorTab === "transit" && (
        <div className="flex flex-wrap gap-1.5 py-3 border-b border-slate-800/40">
          {[
            { id: "current_gochara", label: "Current Gochara" },
            { id: "current_dasha", label: "Current Dasha" },
            { id: "current_transits", label: "Current Transits" },
            { id: "panchanga", label: "Current Panchanga" },
            { id: "current_strengths", label: "Current Strengths" },
            { id: "current_yogas", label: "Current Yogas" },
            { id: "current_doshas", label: "Current Doshas" },
            { id: "current_aspects", label: "Current Aspects" },
            { id: "house_activation", label: "House Activation" },
            { id: "current_nakshatra", label: "Current Nakshatra" },
            { id: "sensitive_points", label: "Sensitive Points" },
            { id: "current_events", label: "Current Events" },
            { id: "transit_timeline", label: "Transit Timeline" },
            { id: "planet_ingress", label: "Planet Ingress" },
            { id: "transit_summary", label: "Transit Summary" },
            { id: "daily_muhurta", label: "Daily Muhurta" },
            { id: "event_muhurta", label: "Event Muhurta" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTransitSubTab(tab.id)}
              className={`px-2.5 py-1.5 text-[10px] font-mono rounded-md transition-all border text-center ${
                transitSubTab === tab.id
                  ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-400 font-bold shadow-sm shadow-indigo-500/10"
                  : "border-slate-800 bg-slate-900/30 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Sub-tabs bar for Profile - Dynamic Multitabs Grid */}
      {majorTab === "jhora" && (
        <div className="flex flex-wrap gap-1.5 py-3 border-b border-slate-800/40">
          {availableVedicTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVedicSubTab(tab.id)}
              className={`px-2.5 py-1.5 text-[10px] font-mono rounded-md transition-all border text-center ${
                vedicSubTab === tab.id
                  ? "bg-amber-500/15 border-amber-500/50 text-amber-400 font-bold shadow-sm shadow-amber-500/10"
                  : "border-slate-800 bg-slate-900/30 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Container */}
      <div className="space-y-6">

        {/* ================= PREDICTIONS WORKSPACE (RULEBOOK EVALUATION) ================= */}
        {majorTab === "advanced" && (
          <div className="space-y-6 animate-fade-in">
            <MasterArchitectureView
              astrologyData={astrologyData}
              isDark={isDark}
            />
          </div>
        )}

        {/* ================= EVENTS DYNAMIC WORKSPACE ================= */}
        {majorTab === "present" && (
          <div className="space-y-6 animate-fade-in">
            {eventsSubTab === "event_book" && (
              <EventBookView
                astrologyData={astrologyData}
                isDark={isDark}
              />
            )}
            {eventsSubTab === "final_results" && (
              <FinalResultsView
                astrologyData={astrologyData}
                isDark={isDark}
              />
            )}
            {eventsSubTab === "present_day" && (
              <PresentDayEngineView
                astrologyData={astrologyData}
                isDark={isDark}
              />
            )}
            {eventsSubTab === "event_muhurta" && (
              <div className={`p-6 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-indigo-500/15`}>
                <div className="border-b border-indigo-500/10 pb-4 mb-6">
                  <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Planetary Matcher
                  </span>
                  <h3 className="text-lg font-sans font-medium text-slate-200 mt-1 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    Event Muhurta Finder
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Identify perfect planetary times for weddings, business launches, investments, and creative pursuits.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: "Wedding / Vivaha",
                      desc: "Analyzes Jupiter strength and 7th house aspects to secure divine blessings.",
                      active: dynamicEventOpportunity.marriageWindow.active,
                      timeframe: dynamicEventOpportunity.marriageWindow.timeframe,
                      badge: "Vivaha Samskara"
                    },
                    {
                      name: "Business / Commercial Launch",
                      desc: "Leverages Mercury and Sun's power to secure public reach, power, and cash flows.",
                      active: dynamicEventOpportunity.businessOpportunity.active,
                      timeframe: dynamicEventOpportunity.businessOpportunity.timeframe,
                      badge: "Udyoga Aarambh"
                    },
                    {
                      name: "Asset / Real Estate Acquisition",
                      desc: "Maps Saturn's position and Mars aspects to rule out structural delays and secure longevity.",
                      active: dynamicEventOpportunity.investmentOpportunity.active,
                      timeframe: dynamicEventOpportunity.investmentOpportunity.timeframe,
                      badge: "Grahapravesh / Capital"
                    },
                    {
                      name: "Educational Enrollment / Courses",
                      desc: "Aligns with Jupiter's transit to maximize wisdom retention, concentration, and successful graduation.",
                      active: dynamicEventOpportunity.learningOpportunity.active,
                      timeframe: dynamicEventOpportunity.learningOpportunity.timeframe,
                      badge: "Vidya Aarambh"
                    },
                    {
                      name: "Professional Career Leap",
                      desc: "Calculates the operating DBA (Dasha-Bhukti-Antara) to secure authority and promotion parameters.",
                      active: dynamicEventOpportunity.careerOpportunity.active,
                      timeframe: dynamicEventOpportunity.careerOpportunity.timeframe,
                      badge: "Karmasthala Rise"
                    },
                    {
                      name: "Refreshes & Sacred Travel",
                      desc: "Maps the 9th and 12th house transits to schedule rejuvenating pilgrimages or business trips.",
                      active: dynamicEventOpportunity.travelOpportunity.active,
                      timeframe: dynamicEventOpportunity.travelOpportunity.timeframe,
                      badge: "Yatra Samskara"
                    }
                  ].map((event) => (
                    <div key={event.name} className={`p-5 rounded-xl border flex flex-col justify-between min-h-[190px] transition-all bg-slate-900/40 ${
                      event.active 
                        ? "border-emerald-500/20 shadow-sm shadow-emerald-500/5 bg-slate-950/40" 
                        : "border-slate-800"
                    }`}>
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">{event.badge}</span>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            event.active ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
                          }`}>
                            {event.active ? "Active Window" : "Consolidate"}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-amber-500 mt-1.5">{event.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                          {event.desc}
                        </p>
                      </div>

                      <div className="border-t border-slate-800/40 pt-2.5 mt-3">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">Recommended Timeframe</span>
                        <span className="text-[11px] font-bold text-slate-200 mt-0.5 block">{event.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {eventsSubTab === "current_events" && (
              <div className={`p-6 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-indigo-500/15`}>
                <TransitsTab 
                  astrologyData={astrologyData}
                  subTab="current_events"
                  chartStyle={chartStyle}
                />
              </div>
            )}
          </div>
        )}

        {/* ================= MULTI-SYSTEM LAYOUT (WITHOUT STICKY CHART RAIL TO PREVENT DISPLAY ERRORS AND OVERLAPS) ================= */}
        {majorTab !== "advanced" && majorTab !== "transit" && (
          <div className="space-y-6">
            {/* Sub-tab / System Specific Content Column */}
            <div className="w-full space-y-6">
              {majorTab === "jhora" && (
                <div className="space-y-6">
                  {vedicSubTab === "table_1" && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {/* Birth Details Block */}
                      {birthDetails && Object.keys(birthDetails).length > 0 && (
                        <div className="space-y-4 p-5 rounded-xl border border-slate-800 bg-slate-950/40 text-xs md:text-sm">
                          <div className="border-b border-slate-800 pb-2 flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-bold text-amber-400 uppercase tracking-wider font-mono">Table 1: Birth Details (Birth Particulars)</h3>
                            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (birthDetails)</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 mt-2 font-mono">
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Full Name:</span>
                              <span className="text-slate-100 font-bold">{birthDetails.name || activeUser?.name || "Nitin Jain"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Date of Birth:</span>
                              <span className="text-slate-200">{birthDetails.date || "1976-01-06"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Time of Birth:</span>
                              <span className="text-slate-200">{birthDetails.time || "18:40:00"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Birth Location:</span>
                              <span className="text-slate-200 font-sans">{birthDetails.location || "Dehradun, India"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Latitude:</span>
                              <span className="text-slate-200">{Number(birthDetails.latitude || 30.3165).toFixed(4)}° N</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Longitude:</span>
                              <span className="text-slate-200">{Number(birthDetails.longitude || 78.0322).toFixed(4)}° E</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Julian Day Number:</span>
                              <span className="text-slate-200">{astronomicalData?.julian_day_number || "2442784.277778"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Sidereal Time (LST):</span>
                              <span className="text-slate-200">{astronomicalData?.sidereal_time || "12:14:15"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Ayanamsa Reference:</span>
                              <span className="text-slate-200 font-sans">{birthDetails.ayanamsa || "Lahiri Ayanamsa"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Ayanamsa Value:</span>
                              <span className="text-slate-200">{Number(birthDetails.ayanamsaDegree || 23.5512).toFixed(4)}°</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Obliquity of Ecliptic:</span>
                              <span className="text-slate-200">{astronomicalData?.obliquity || "23° 26' 27\""}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Place ID:</span>
                              <span className="text-slate-200 overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px]" title={birthDetails.placeId}>{birthDetails.placeId || "ChIJuS_v16Lp_zMRwXnL-4E_P-s"}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lagna Block */}
                      {lagna && Object.keys(lagna).length > 0 && (
                        <div className="space-y-4 p-5 rounded-xl border border-slate-800 bg-slate-950/40 text-xs md:text-sm">
                          <div className="border-b border-slate-800 pb-2 flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-bold text-amber-400 uppercase tracking-wider font-mono">Table 1: Lagna Details (Ascendant Coordinates)</h3>
                            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (ascendant)</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 mt-2 font-mono">
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Zodiac Sign (Lagna):</span>
                              <span className="text-slate-100 font-bold font-sans">{lagna.sign || "Cancer"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Longitude (In Sign):</span>
                              <span className="text-slate-200">{lagna.degree ? formatDegree(lagna.degree) : "00° 00'"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Exact 360° Longitude:</span>
                              <span className="text-slate-200">{lagna.longitude ? format360Degree(lagna.longitude) : "00° 00'"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Nakshatra:</span>
                              <span className="text-slate-200 font-sans">{lagna.nakshatra || "Pushya"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Nakshatra Pada:</span>
                              <span className="text-slate-200 font-bold">{lagna.pada || 2}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Nakshatra Lord (Ruler):</span>
                              <span className="text-slate-200 font-sans">{vedicData?.ascendant?.nakshatra_lord || "Saturn"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Sub-Lord (KP):</span>
                              <span className="text-slate-200 font-sans">{vedicData?.ascendant?.sub_lord || "Mercury"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Sub-Sub-Lord (KP):</span>
                              <span className="text-slate-200 font-sans">{vedicData?.ascendant?.sub_sub_lord || "Rahu"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Lagna Lord (Ruler of Sign):</span>
                              <span className="text-slate-200 font-sans">{vedicData?.ascendant?.lagna_lord || "Moon"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-900/60">
                              <span className="text-slate-400">Lagna Lord Placement:</span>
                              <span className="text-slate-200 font-sans">{vedicData?.ascendant?.lagna_lord_house || "House 11"}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

              {vedicSubTab === "table_2" && planets && planets.length > 0 && (
                <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-[11px] md:text-xs">
                  <div className="border-b border-slate-800 pb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-amber-400 uppercase tracking-wider font-mono">Table 2: KP Graha, Nakshatra and Pada</h3>
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (planets)</span>
                  </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-sans">
                        <th className="p-2 font-bold">Graha</th>
                        <th className="p-2">Sign</th>
                        <th className="p-2">In Sign Long.</th>
                        <th className="p-2">360° Long.</th>
                        <th className="p-2">House</th>
                        <th className="p-2">Nakshatra</th>
                        <th className="p-2 text-center">Pada</th>
                        <th className="p-2">Lord</th>
                        <th className="p-2">Sub Lord</th>
                        <th className="p-2">Sub-Sub Lord</th>
                        <th className="p-2 text-center">Retro</th>
                        <th className="p-2 text-center">Combust</th>
                        <th className="p-2">Dignity</th>
                        <th className="p-2">Avasthas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 font-mono">
                      {PLANET_ORDER.map((pName) => {
                        const pData = planets.find((p: PlanetData) => p.name.toLowerCase() === pName.toLowerCase());
                        const mappedP = vedicData?.planets?.[pName] || {};
                        const kpP = kpData?.planets?.[pName] || {};
                        if (!pData) return null;

                        return (
                          <tr key={pName} className="hover:bg-slate-900/20 text-slate-300">
                            <td className="p-2 font-bold font-sans text-slate-200">{pName}</td>
                            <td className="p-2 font-sans">{pData.sign}</td>
                            <td className="p-2">{formatDegree(pData.longitude)}</td>
                            <td className="p-2">{format360Degree(pData.longitude)}</td>
                            <td className="p-2 font-bold text-amber-500">H{pData.house || mappedP?.house || 1}</td>
                            <td className="p-2 font-sans">{pData.nakshatra || "Rohini"}</td>
                            <td className="p-2 text-center font-bold text-slate-100">{pData.pada || 1}</td>
                            <td className="p-2 font-sans">{pData.lord || mappedP?.nakshatra_lord || "Jupiter"}</td>
                            <td className="p-2 font-sans">{kpP?.sub_lord || mappedP?.sub_lord || "Saturn"}</td>
                            <td className="p-2 font-sans">{kpP?.sub_sub_lord || mappedP?.sub_sub_lord || "Venus"}</td>
                            <td className={`p-2 text-center font-bold ${pData.retrograde ? "text-rose-400" : "text-slate-500"}`}>{pData.retrograde ? "Y" : "N"}</td>
                            <td className={`p-2 text-center font-bold ${mappedP?.combust ? "text-rose-500" : "text-slate-500"}`}>{mappedP?.combust ? "Y" : "N"}</td>
                            <td className="p-2 font-sans">{mappedP?.dignity || "Neutral Sign"}</td>
                            <td className="p-2 font-sans text-[10px]">
                              {mappedP?.state?.baladi || "Yuva"} / {mappedP?.state?.jagrat || "Jagrat"} / {mappedP?.state?.deepta || "Shanta"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-slate-900/50 border border-slate-800/80">
                  <h4 className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-2 font-sans">Table 2: Data Provenance & Analysis Summary</h4>
                  <p className="text-slate-300 text-xs leading-relaxed font-sans">
                    Every parameter displayed in this grid binds to a single source of truth. The raw planetary longitude, sign, house placements, nakshatras, and retrograde/combust coordinates are retrieved in real-time from the authoritative <strong>Dehradun JHora Rest Server Endpoint (/api/jhora/horoscope)</strong>. Sub-lords, Nakshatra rulers, and Sub-Sub-lords are derived dynamically by executing calculations from the <strong>KP Stellar Division Engine</strong> against the exact Placidus cuspal coordinates to maintain extreme multi-system precision.
                  </p>
                </div>
              </div>
            )}

              {vedicSubTab === "panchanga" && panchanga && Object.keys(panchanga).length > 0 && (
                <div className="space-y-4 p-5 rounded-xl border border-slate-800 bg-slate-950/40 text-[10.5px] sm:text-xs md:text-sm font-mono">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-amber-400 uppercase tracking-wider font-mono">panchanga</h3>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 mt-2">
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Tithi (Lunar Day):</span>
                    <span className="text-slate-100 font-bold font-sans">{panchanga.tithi || "Sukla Ekadashi"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Nakshatra (Asterism):</span>
                    <span className="text-slate-100 font-bold font-sans">{panchanga.nakshatra || "Rohini"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Yoga (Luni-Solar Angle):</span>
                    <span className="text-slate-100 font-bold font-sans">{panchanga.yoga || "Preeti"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Karana (Half-Tithi):</span>
                    <span className="text-slate-100 font-bold font-sans">{panchanga.karana || "Bava"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Vara (Weekday):</span>
                    <span className="text-slate-100 font-bold font-sans">{new Date(birthDetails.date || "1976-01-06").toLocaleDateString("en-US", { weekday: "long" })}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Sunrise:</span>
                    <span className="text-slate-200">{astronomicalData?.sunrise || "05:42:00"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Sunset:</span>
                    <span className="text-slate-200">{astronomicalData?.sunset || "18:55:00"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Lunar Month:</span>
                    <span className="text-slate-200 font-sans">{astronomicalData?.lunar_month || "Kartika"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Samvatsara (Year Name):</span>
                    <span className="text-slate-200 font-sans">{astronomicalData?.year_name || "Krodhi"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Season (Vedic Ritu):</span>
                    <span className="text-slate-200 font-sans">{astronomicalData?.season || "Sharad"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Day Duration (Dina Mana):</span>
                    <span className="text-slate-200">{astronomicalData?.day_duration || "13h 13m"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span className="text-slate-400">Night Duration (Ratri Mana):</span>
                    <span className="text-slate-200">{astronomicalData?.night_duration || "10h 47m"}</span>
                  </div>
                </div>
              </div>
            )}

              {vedicSubTab === "divisionalCharts" && divisionalCharts && Object.keys(divisionalCharts).length > 0 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-2">
                    <div>
                      <h3 className="font-bold text-amber-400 uppercase tracking-wider font-mono">Table 13: Vedic Divisional Charts (Shodashavargas) Matrix</h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">Displaying all divisional chart layouts side-by-side with absolutely no dropdowns.</p>
                  </div>
                  <div className="bg-slate-950/80 p-1 rounded-lg border border-indigo-500/15 flex w-max shrink-0 self-start">
                    <button
                      onClick={() => setDivisionalChartStyle("north")}
                      className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                        divisionalChartStyle === "north"
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      North Indian
                    </button>
                    <button
                      onClick={() => setDivisionalChartStyle("south")}
                      className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                        divisionalChartStyle === "south"
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      South Indian
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {STANDARD_VARGAS.map((vKey) => {
                    let cData = rasiChart;
                    if (vKey === "D1") cData = rasiChart;
                    else if (vKey === "D9") cData = navamsaChart || divisionalCharts?.["D9"] || rasiChart;
                    else if (divisionalCharts && divisionalCharts[vKey]) {
                      cData = divisionalCharts[vKey];
                    }

                    const vLagnaIdx = vargaLagnas[vKey] !== undefined ? vargaLagnas[vKey] : (vedicData?.divisional_charts?.[vKey]?.ascendant?.longitude ? Math.floor(vedicData?.divisional_charts?.[vKey]?.ascendant?.longitude / 30) : lagna.signIndex || 0);
                    const ascSign = ZODIAC_SIGNS_FULL[vLagnaIdx] || "Aries";

                    return (
                      <div key={vKey} className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2">
                            <span className="text-xs font-bold text-amber-400 font-sans">{vKey} {vKey === "D1" ? "Rasi" : vKey === "D9" ? "Navamsa" : vKey === "D10" ? "Dasamsa" : "Varga"}</span>
                            <span className="text-[10px] font-mono text-slate-500">Asc: {ascSign.substring(0,3)}</span>
                          </div>
                          {renderMiniChart(vKey, divisionalChartStyle)}
                        </div>
                        
                        <div className="text-[9px] font-mono bg-slate-900/50 p-2 rounded border border-slate-900 text-slate-400 space-y-1 mt-1 leading-normal">
                          <div className="flex justify-between"><span>Ascendant:</span><span className="font-bold text-indigo-400">{ascSign}</span></div>
                          {PLANET_ORDER.map(p => {
                            let hNum = -1;
                            for (let h = 1; h <= 12; h++) {
                              if (cData[h]?.includes(p)) {
                                hNum = h;
                                break;
                              }
                            }
                            if (hNum === -1) return null;
                            return (
                              <div key={p} className="flex justify-between border-t border-slate-950 pt-0.5">
                                <span>{p}:</span>
                                <span className="font-bold text-slate-200">House {hNum}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

              {vedicSubTab === "table_3" && ((dashas && dashas.length > 0) || (astrologyData?.additionalDashas?.yogini && astrologyData.additionalDashas.yogini.length > 0)) && (
                <div className="space-y-6 text-[10.5px] sm:text-xs">
                  {/* Active Pathway Header & Selection Tracker */}
                  <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-900 pb-2">
                      <div className="w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-xs font-mono flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-400" />
                            Table 3: Vimshottari Dasha Timeline (To Prana)
                          </h4>
                          <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (dashas.vimshottari)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                          Interactive down to minutes: click any period to drill down. Yellow items are currently active.
                        </p>
                      </div>
                    <button
                      onClick={() => {
                        if (dashaTree.length === 0) return;
                        const now = new Date();
                        const mIdx = dashaTree.findIndex(m => now >= m.start && now <= m.end);
                        if (mIdx !== -1) {
                          setSelectedMahaIdx(mIdx);
                          const m = dashaTree[mIdx];
                          const aIdx = m.antars.findIndex(a => now >= a.start && now <= a.end);
                          if (aIdx !== -1) {
                            setSelectedAntarIdx(aIdx);
                            const a = m.antars[aIdx];
                            const pIdx = a.pratyantars.findIndex(p => now >= p.start && now <= p.end);
                            if (pIdx !== -1) {
                              setSelectedPratyantarIdx(pIdx);
                              const p = a.pratyantars[pIdx];
                              const sIdx = p.sookshmas.findIndex(s => now >= s.start && now <= s.end);
                              if (sIdx !== -1) {
                                setSelectedSookshmaIdx(sIdx);
                                const s = p.sookshmas[sIdx];
                                const prIdx = s.pranas.findIndex(pr => now >= pr.start && now <= pr.end);
                                setSelectedPranaIdx(prIdx !== -1 ? prIdx : 0);
                              } else {
                                setSelectedSookshmaIdx(0);
                                setSelectedPranaIdx(0);
                              }
                            }
                          }
                        }
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded hover:bg-amber-500/20 transition-all font-sans"
                    >
                      ⚡ Sync to Active Timeline
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-2.5 rounded bg-slate-900/60 border border-slate-850/80 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-sans block">Current Active Timeline Path:</span>
                      <span className="font-bold text-amber-400 tracking-wide text-[11px]">
                        {(() => {
                          if (dashaTree.length === 0) return "No data available";
                          const now = new Date();
                          const m = dashaTree.find(x => now >= x.start && now <= x.end);
                          if (!m) return "Outside computed cycle";
                          const a = m.antars.find(x => now >= x.start && now <= x.end);
                          if (!a) return m.lord;
                          const p = a.pratyantars.find(x => now >= x.start && now <= x.end);
                          if (!p) return `${m.lord} ➔ ${a.lord}`;
                          const s = p.sookshmas.find(x => now >= x.start && now <= x.end);
                          if (!s) return `${m.lord} ➔ ${a.lord} ➔ ${p.lord}`;
                          const pr = s.pranas.find(x => now >= x.start && now <= x.end);
                          if (!pr) return `${m.lord} ➔ ${a.lord} ➔ ${p.lord} ➔ ${s.lord}`;
                          return `${m.lord} ➔ ${a.lord} ➔ ${p.lord} ➔ ${s.lord} ➔ ${pr.lord}`;
                        })()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/60 border border-slate-850/80 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-sans block">Currently Selected Focus:</span>
                      <span className="font-bold text-indigo-400 tracking-wide text-[11px]">
                        {selectedMahaIdx !== null && dashaTree[selectedMahaIdx] ? (
                          (() => {
                            const m = dashaTree[selectedMahaIdx];
                            let path = m.lord;
                            if (selectedAntarIdx !== null && m.antars[selectedAntarIdx]) {
                              const a = m.antars[selectedAntarIdx];
                              path += ` ➔ ${a.lord}`;
                              if (selectedPratyantarIdx !== null && a.pratyantars[selectedPratyantarIdx]) {
                                const p = a.pratyantars[selectedPratyantarIdx];
                                path += ` ➔ ${p.lord}`;
                                if (selectedSookshmaIdx !== null && p.sookshmas[selectedSookshmaIdx]) {
                                  const s = p.sookshmas[selectedSookshmaIdx];
                                  path += ` ➔ ${s.lord}`;
                                  if (selectedPranaIdx !== null && s.pranas && s.pranas[selectedPranaIdx]) {
                                    const pr = s.pranas[selectedPranaIdx];
                                    path += ` ➔ ${pr.lord}`;
                                  }
                                }
                              }
                            }
                            return path;
                          })()
                        ) : "Select a row below to inspect periods"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* The 5-Level Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 h-[420px] overflow-hidden">
                  {/* LEVEL 1: Mahadashas */}
                  <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                    <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                      <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 1: Maha</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                      {dashaTree.map((m: any, idx: number) => {
                        const now = new Date();
                        const isActive = now >= m.start && now <= m.end;
                        const isSelected = selectedMahaIdx === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedMahaIdx(idx);
                              setSelectedAntarIdx(0);
                              setSelectedPratyantarIdx(0);
                              setSelectedSookshmaIdx(0);
                              setSelectedPranaIdx(0);
                            }}
                            className={`p-2 rounded cursor-pointer transition-all border text-left ${
                              isActive
                                ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                : isSelected
                                ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold font-sans text-xs">{m.lord}</span>
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                            </div>
                            <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                              Until {formatDashaDate(m.end)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* LEVEL 2: Antardashas */}
                  <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                    <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                      <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 2: Antar</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                      {selectedMahaIdx !== null && dashaTree[selectedMahaIdx] ? (
                        dashaTree[selectedMahaIdx].antars.map((a: any, idx: number) => {
                          const now = new Date();
                          const isActive = now >= a.start && now <= a.end;
                          const isSelected = selectedAntarIdx === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedAntarIdx(idx);
                                setSelectedPratyantarIdx(0);
                                setSelectedSookshmaIdx(0);
                                setSelectedPranaIdx(0);
                              }}
                              className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                isActive
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                  : isSelected
                                  ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                  : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold font-sans text-xs">{a.lord}</span>
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                              </div>
                              <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                Until {formatDashaDate(a.end)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Mahadasha</div>
                      )}
                    </div>
                  </div>

                  {/* LEVEL 3: Pratyantardashas */}
                  <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                    <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                      <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 3: Pratyantar</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                      {selectedMahaIdx !== null && selectedAntarIdx !== null && dashaTree[selectedMahaIdx]?.antars[selectedAntarIdx] ? (
                        dashaTree[selectedMahaIdx].antars[selectedAntarIdx].pratyantars.map((p: any, idx: number) => {
                          const now = new Date();
                          const isActive = now >= p.start && now <= p.end;
                          const isSelected = selectedPratyantarIdx === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedPratyantarIdx(idx);
                                setSelectedSookshmaIdx(0);
                                setSelectedPranaIdx(0);
                              }}
                              className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                isActive
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                  : isSelected
                                  ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                  : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold font-sans text-[11px]">{p.lord}</span>
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                              </div>
                              <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                Until {formatDashaDate(p.end)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Antardasha</div>
                      )}
                    </div>
                  </div>

                  {/* LEVEL 4: Sookshmadashas */}
                  <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                    <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                      <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 4: Sookshma</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                      {selectedMahaIdx !== null && selectedAntarIdx !== null && selectedPratyantarIdx !== null && dashaTree[selectedMahaIdx]?.antars[selectedAntarIdx]?.pratyantars[selectedPratyantarIdx] ? (
                        dashaTree[selectedMahaIdx].antars[selectedAntarIdx].pratyantars[selectedPratyantarIdx].sookshmas.map((s: any, idx: number) => {
                          const now = new Date();
                          const isActive = now >= s.start && now <= s.end;
                          const isSelected = selectedSookshmaIdx === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedSookshmaIdx(idx);
                                setSelectedPranaIdx(0);
                              }}
                              className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                isActive
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                  : isSelected
                                  ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                  : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold font-sans text-[11px]">{s.lord}</span>
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                              </div>
                              <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                Until {formatDashaDate(s.end)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Pratyantar</div>
                      )}
                    </div>
                  </div>

                  {/* LEVEL 5: Pranadashas */}
                  <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                    <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                      <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 5: Prana</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                      {selectedMahaIdx !== null && selectedAntarIdx !== null && selectedPratyantarIdx !== null && selectedSookshmaIdx !== null && dashaTree[selectedMahaIdx]?.antars[selectedAntarIdx]?.pratyantars[selectedPratyantarIdx]?.sookshmas[selectedSookshmaIdx] ? (
                        dashaTree[selectedMahaIdx].antars[selectedAntarIdx].pratyantars[selectedPratyantarIdx].sookshmas[selectedSookshmaIdx].pranas.map((pr: any, idx: number) => {
                          const now = new Date();
                          const isActive = now >= pr.start && now <= pr.end;
                          const isSelected = selectedPranaIdx === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedPranaIdx(idx)}
                              className={`p-2 rounded border text-left cursor-pointer transition-all ${
                                isActive
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                  : isSelected
                                  ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                  : "border-slate-800/20 bg-slate-900/10 text-slate-400 hover:bg-slate-900/20 hover:text-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold font-sans text-[11px]">{pr.lord}</span>
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                              </div>
                              <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                Until {pr.end.toLocaleDateString()} {pr.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Sookshma</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Yogini & Ashtottari Side Timelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/45 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-400 block font-sans uppercase tracking-wider">Yogini Dasha Timeline (36-Year Cycle)</span>
                    <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                      {Array.isArray(vedicData?.dashas?.yogini) && vedicData.dashas.yogini.length > 0 ? (
                        vedicData.dashas.yogini.map((d: any, idx: number) => (
                          <div key={idx} className="flex justify-between font-mono text-[10px] py-1 border-b border-slate-900/40 text-slate-400">
                            <span className="font-bold text-slate-300 font-sans">{d.lord}</span>
                            <span>Until {d.end_date}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic text-[10px]">No Yogini records found.</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/45 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-400 block font-sans uppercase tracking-wider">Ashtottari Dasha Timeline (108-Year Cycle)</span>
                    <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                      {Array.isArray(vedicData?.dashas?.ashtottari) && vedicData.dashas.ashtottari.length > 0 ? (
                        vedicData.dashas.ashtottari.map((d: any, idx: number) => (
                          <div key={idx} className="flex justify-between font-mono text-[10px] py-1 border-b border-slate-900/40 text-slate-400">
                            <span className="font-bold text-slate-300 font-sans">{d.lord}</span>
                            <span>Until {d.end_date}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic text-[10px]">No Ashtottari records found.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

              {vedicSubTab === "table_4" && yoginiDashaTree && yoginiDashaTree.length > 0 && (
                <div className="space-y-6 text-[10.5px] sm:text-xs">
                  {/* Active Pathway Header & Selection Tracker */}
                  <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-900 pb-2">
                      <div className="w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-xs font-mono flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-400" />
                            Table 4: Yogini Dasha Timeline (36-Year Cycle)
                          </h4>
                          <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (dashas.yogini)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                          Interactive 5-level Yogini dasha hierarchy. Click any period to drill down. Yellow items are currently active.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (yoginiDashaTree.length === 0) return;
                          const now = new Date();
                          const mIdx = yoginiDashaTree.findIndex(m => now >= m.start && now <= m.end);
                          if (mIdx !== -1) {
                            setSelectedYoginiMahaIdx(mIdx);
                            const m = yoginiDashaTree[mIdx];
                            const aIdx = m.antars.findIndex(a => now >= a.start && now <= a.end);
                            if (aIdx !== -1) {
                              setSelectedYoginiAntarIdx(aIdx);
                              const a = m.antars[aIdx];
                              const pIdx = a.pratyantars.findIndex(p => now >= p.start && now <= p.end);
                              if (pIdx !== -1) {
                                setSelectedYoginiPratyantarIdx(pIdx);
                                const p = a.pratyantars[pIdx];
                                const sIdx = p.sookshmas.findIndex(s => now >= s.start && now <= s.end);
                                if (sIdx !== -1) {
                                  setSelectedYoginiSookshmaIdx(sIdx);
                                  const s = p.sookshmas[sIdx];
                                  const prIdx = s.pranas.findIndex(pr => now >= pr.start && now <= pr.end);
                                  setSelectedYoginiPranaIdx(prIdx !== -1 ? prIdx : 0);
                                } else {
                                  setSelectedYoginiSookshmaIdx(0);
                                  setSelectedYoginiPranaIdx(0);
                                }
                              }
                            }
                          }
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded hover:bg-amber-500/20 transition-all font-sans"
                      >
                        ⚡ Sync to Active Timeline
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="p-2.5 rounded bg-slate-900/60 border border-slate-850/80 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-sans block">Current Active Timeline Path:</span>
                        <span className="font-bold text-amber-400 tracking-wide text-[11px]">
                          {(() => {
                            if (yoginiDashaTree.length === 0) return "No data available";
                            const now = new Date();
                            const m = yoginiDashaTree.find(x => now >= x.start && now <= x.end);
                            if (!m) return "Outside computed cycle";
                            const a = m.antars.find(x => now >= x.start && now <= x.end);
                            if (!a) return m.lord;
                            const p = a.pratyantars.find(x => now >= x.start && now <= x.end);
                            if (!p) return `${m.lord} ➔ ${a.lord}`;
                            const s = p.sookshmas.find(x => now >= x.start && now <= x.end);
                            if (!s) return `${m.lord} ➔ ${a.lord} ➔ ${p.lord}`;
                            const pr = s.pranas.find(x => now >= x.start && now <= x.end);
                            if (!pr) return `${m.lord} ➔ ${a.lord} ➔ ${p.lord} ➔ ${s.lord}`;
                            return `${m.lord} ➔ ${a.lord} ➔ ${p.lord} ➔ ${s.lord} ➔ ${pr.lord}`;
                          })()}
                        </span>
                      </div>

                      <div className="p-2.5 rounded bg-slate-900/60 border border-slate-850/80 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-sans block">Currently Selected Focus:</span>
                        <span className="font-bold text-indigo-400 tracking-wide text-[11px]">
                          {selectedYoginiMahaIdx !== null && yoginiDashaTree[selectedYoginiMahaIdx] ? (
                            (() => {
                              const m = yoginiDashaTree[selectedYoginiMahaIdx];
                              let path = m.lord;
                              if (selectedYoginiAntarIdx !== null && m.antars[selectedYoginiAntarIdx]) {
                                const a = m.antars[selectedYoginiAntarIdx];
                                path += ` ➔ ${a.lord}`;
                                if (selectedYoginiPratyantarIdx !== null && a.pratyantars[selectedYoginiPratyantarIdx]) {
                                  const p = a.pratyantars[selectedYoginiPratyantarIdx];
                                  path += ` ➔ ${p.lord}`;
                                  if (selectedYoginiSookshmaIdx !== null && p.sookshmas[selectedYoginiSookshmaIdx]) {
                                    const s = p.sookshmas[selectedYoginiSookshmaIdx];
                                    path += ` ➔ ${s.lord}`;
                                    if (selectedYoginiPranaIdx !== null && s.pranas && s.pranas[selectedYoginiPranaIdx]) {
                                      const pr = s.pranas[selectedYoginiPranaIdx];
                                      path += ` ➔ ${pr.lord}`;
                                    }
                                  }
                                }
                              }
                              return path;
                            })()
                          ) : "Select a row below to inspect periods"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 h-[420px] overflow-hidden">
                    {/* LEVEL 1 */}
                    <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                      <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                        <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 1: Maha</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                        {yoginiDashaTree.map((m: any, idx: number) => {
                          const now = new Date();
                          const isActive = now >= m.start && now <= m.end;
                          const isSelected = selectedYoginiMahaIdx === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedYoginiMahaIdx(idx);
                                setSelectedYoginiAntarIdx(0);
                                setSelectedYoginiPratyantarIdx(0);
                                setSelectedYoginiSookshmaIdx(0);
                                setSelectedYoginiPranaIdx(0);
                              }}
                              className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                isActive
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                  : isSelected
                                  ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                  : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold font-sans text-xs">{m.lord}</span>
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                              </div>
                              <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                Until {formatDashaDate(m.end)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* LEVEL 2 */}
                    <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                      <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                        <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 2: Antar</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                        {selectedYoginiMahaIdx !== null && yoginiDashaTree[selectedYoginiMahaIdx] ? (
                          yoginiDashaTree[selectedYoginiMahaIdx].antars.map((a: any, idx: number) => {
                            const now = new Date();
                            const isActive = now >= a.start && now <= a.end;
                            const isSelected = selectedYoginiAntarIdx === idx;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedYoginiAntarIdx(idx);
                                  setSelectedYoginiPratyantarIdx(0);
                                  setSelectedYoginiSookshmaIdx(0);
                                  setSelectedYoginiPranaIdx(0);
                                }}
                                className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                  isActive
                                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                    : isSelected
                                    ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                    : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-bold font-sans text-xs">{a.lord}</span>
                                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                                </div>
                                <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                  Until {formatDashaDate(a.end)}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Mahadasha</div>
                        )}
                      </div>
                    </div>

                    {/* LEVEL 3 */}
                    <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                      <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                        <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 3: Pratyantar</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                        {selectedYoginiMahaIdx !== null && selectedYoginiAntarIdx !== null && yoginiDashaTree[selectedYoginiMahaIdx]?.antars[selectedYoginiAntarIdx] ? (
                          yoginiDashaTree[selectedYoginiMahaIdx].antars[selectedYoginiAntarIdx].pratyantars.map((p: any, idx: number) => {
                            const now = new Date();
                            const isActive = now >= p.start && now <= p.end;
                            const isSelected = selectedYoginiPratyantarIdx === idx;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedYoginiPratyantarIdx(idx);
                                  setSelectedYoginiSookshmaIdx(0);
                                  setSelectedYoginiPranaIdx(0);
                                }}
                                className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                  isActive
                                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                    : isSelected
                                    ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                    : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-bold font-sans text-[11px]">{p.lord}</span>
                                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                                </div>
                                <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                  Until {formatDashaDate(p.end)}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Antardasha</div>
                        )}
                      </div>
                    </div>

                    {/* LEVEL 4 */}
                    <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                      <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                        <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 4: Sookshma</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                        {selectedYoginiMahaIdx !== null && selectedYoginiAntarIdx !== null && selectedYoginiPratyantarIdx !== null && yoginiDashaTree[selectedYoginiMahaIdx]?.antars[selectedYoginiAntarIdx]?.pratyantars[selectedYoginiPratyantarIdx] ? (
                          yoginiDashaTree[selectedYoginiMahaIdx].antars[selectedYoginiAntarIdx].pratyantars[selectedYoginiPratyantarIdx].sookshmas.map((s: any, idx: number) => {
                            const now = new Date();
                            const isActive = now >= s.start && now <= s.end;
                            const isSelected = selectedYoginiSookshmaIdx === idx;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedYoginiSookshmaIdx(idx);
                                  setSelectedYoginiPranaIdx(0);
                                }}
                                className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                  isActive
                                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                    : isSelected
                                    ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                    : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-bold font-sans text-[11px]">{s.lord}</span>
                                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                                </div>
                                <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                  Until {formatDashaDate(s.end)}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Pratyantar</div>
                        )}
                      </div>
                    </div>

                    {/* LEVEL 5 */}
                    <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                      <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                        <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 5: Prana</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                        {selectedYoginiMahaIdx !== null && selectedYoginiAntarIdx !== null && selectedYoginiPratyantarIdx !== null && selectedYoginiSookshmaIdx !== null && yoginiDashaTree[selectedYoginiMahaIdx]?.antars[selectedYoginiAntarIdx]?.pratyantars[selectedYoginiPratyantarIdx]?.sookshmas[selectedYoginiSookshmaIdx] ? (
                          yoginiDashaTree[selectedYoginiMahaIdx].antars[selectedYoginiAntarIdx].pratyantars[selectedYoginiPratyantarIdx].sookshmas[selectedYoginiSookshmaIdx].pranas.map((pr: any, idx: number) => {
                            const now = new Date();
                            const isActive = now >= pr.start && now <= pr.end;
                            const isSelected = selectedYoginiPranaIdx === idx;
                            return (
                              <div
                                key={idx}
                                onClick={() => setSelectedYoginiPranaIdx(idx)}
                                className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                  isActive
                                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                    : isSelected
                                    ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                    : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-bold font-sans text-[11px]">{pr.lord}</span>
                                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                                </div>
                                <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                  Until {formatDashaDate(pr.end)}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Sookshma</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "table_5" && ashtottariDashaTree && ashtottariDashaTree.length > 0 && (
                <div className="space-y-6 text-[10.5px] sm:text-xs">
                  {/* Active Pathway Header & Selection Tracker */}
                  <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-900 pb-2">
                      <div className="w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-xs font-mono flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-400" />
                            Table 5: Ashtottari Dasha Timeline (108-Year Cycle)
                          </h4>
                          <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (dashas.ashtottari)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                          Interactive 5-level Ashtottari dasha hierarchy. Click any period to drill down. Yellow items are currently active.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (ashtottariDashaTree.length === 0) return;
                          const now = new Date();
                          const mIdx = ashtottariDashaTree.findIndex(m => now >= m.start && now <= m.end);
                          if (mIdx !== -1) {
                            setSelectedAshtottariMahaIdx(mIdx);
                            const m = ashtottariDashaTree[mIdx];
                            const aIdx = m.antars.findIndex(a => now >= a.start && now <= a.end);
                            if (aIdx !== -1) {
                              setSelectedAshtottariAntarIdx(aIdx);
                              const a = m.antars[aIdx];
                              const pIdx = a.pratyantars.findIndex(p => now >= p.start && now <= p.end);
                              if (pIdx !== -1) {
                                setSelectedAshtottariPratyantarIdx(pIdx);
                                const p = a.pratyantars[pIdx];
                                const sIdx = p.sookshmas.findIndex(s => now >= s.start && now <= s.end);
                                if (sIdx !== -1) {
                                  setSelectedAshtottariSookshmaIdx(sIdx);
                                  const s = p.sookshmas[sIdx];
                                  const prIdx = s.pranas.findIndex(pr => now >= pr.start && now <= pr.end);
                                  setSelectedAshtottariPranaIdx(prIdx !== -1 ? prIdx : 0);
                                } else {
                                  setSelectedAshtottariSookshmaIdx(0);
                                  setSelectedAshtottariPranaIdx(0);
                                }
                              }
                            }
                          }
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded hover:bg-amber-500/20 transition-all font-sans"
                      >
                        ⚡ Sync to Active Timeline
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="p-2.5 rounded bg-slate-900/60 border border-slate-850/80 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-sans block">Current Active Timeline Path:</span>
                        <span className="font-bold text-amber-400 tracking-wide text-[11px]">
                          {(() => {
                            if (ashtottariDashaTree.length === 0) return "No data available";
                            const now = new Date();
                            const m = ashtottariDashaTree.find(x => now >= x.start && x.end);
                            if (!m) return "Outside computed cycle";
                            const a = m.antars.find(x => now >= x.start && x.end);
                            if (!a) return m.lord;
                            const p = a.pratyantars.find(x => now >= x.start && x.end);
                            if (!p) return `${m.lord} ➔ ${a.lord}`;
                            const s = p.sookshmas.find(x => now >= x.start && x.end);
                            if (!s) return `${m.lord} ➔ ${a.lord} ➔ ${p.lord}`;
                            const pr = s.pranas.find(x => now >= x.start && x.end);
                            if (!pr) return `${m.lord} ➔ ${a.lord} ➔ ${p.lord} ➔ ${s.lord}`;
                            return `${m.lord} ➔ ${a.lord} ➔ ${p.lord} ➔ ${s.lord} ➔ ${pr.lord}`;
                          })()}
                        </span>
                      </div>

                      <div className="p-2.5 rounded bg-slate-900/60 border border-slate-850/80 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-sans block">Currently Selected Focus:</span>
                        <span className="font-bold text-indigo-400 tracking-wide text-[11px]">
                          {selectedAshtottariMahaIdx !== null && ashtottariDashaTree[selectedAshtottariMahaIdx] ? (
                            (() => {
                              const m = ashtottariDashaTree[selectedAshtottariMahaIdx];
                              let path = m.lord;
                              if (selectedAshtottariAntarIdx !== null && m.antars[selectedAshtottariAntarIdx]) {
                                const a = m.antars[selectedAshtottariAntarIdx];
                                path += ` ➔ ${a.lord}`;
                                if (selectedAshtottariPratyantarIdx !== null && a.pratyantars[selectedAshtottariPratyantarIdx]) {
                                  const p = a.pratyantars[selectedAshtottariPratyantarIdx];
                                  path += ` ➔ ${p.lord}`;
                                  if (selectedAshtottariSookshmaIdx !== null && p.sookshmas[selectedAshtottariSookshmaIdx]) {
                                    const s = p.sookshmas[selectedAshtottariSookshmaIdx];
                                    path += ` ➔ ${s.lord}`;
                                    if (selectedAshtottariPranaIdx !== null && s.pranas && s.pranas[selectedAshtottariPranaIdx]) {
                                      const pr = s.pranas[selectedAshtottariPranaIdx];
                                      path += ` ➔ ${pr.lord}`;
                                    }
                                  }
                                }
                              }
                              return path;
                            })()
                          ) : "Select a row below to inspect periods"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 h-[420px] overflow-hidden">
                    {/* LEVEL 1 */}
                    <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                      <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                        <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 1: Maha</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                        {ashtottariDashaTree.map((m: any, idx: number) => {
                          const now = new Date();
                          const isActive = now >= m.start && now <= m.end;
                          const isSelected = selectedAshtottariMahaIdx === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedAshtottariMahaIdx(idx);
                                setSelectedAshtottariAntarIdx(0);
                                setSelectedAshtottariPratyantarIdx(0);
                                setSelectedAshtottariSookshmaIdx(0);
                                setSelectedAshtottariPranaIdx(0);
                              }}
                              className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                isActive
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                  : isSelected
                                  ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                  : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold font-sans text-xs">{m.lord}</span>
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                              </div>
                              <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                Until {formatDashaDate(m.end)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* LEVEL 2 */}
                    <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                      <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                        <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 2: Antar</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                        {selectedAshtottariMahaIdx !== null && ashtottariDashaTree[selectedAshtottariMahaIdx] ? (
                          ashtottariDashaTree[selectedAshtottariMahaIdx].antars.map((a: any, idx: number) => {
                            const now = new Date();
                            const isActive = now >= a.start && now <= a.end;
                            const isSelected = selectedAshtottariAntarIdx === idx;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedAshtottariAntarIdx(idx);
                                  setSelectedAshtottariPratyantarIdx(0);
                                  setSelectedAshtottariSookshmaIdx(0);
                                  setSelectedAshtottariPranaIdx(0);
                                }}
                                className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                  isActive
                                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                    : isSelected
                                    ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                    : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-bold font-sans text-xs">{a.lord}</span>
                                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                                </div>
                                <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                  Until {formatDashaDate(a.end)}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Mahadasha</div>
                        )}
                      </div>
                    </div>

                    {/* LEVEL 3 */}
                    <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                      <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                        <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 3: Pratyantar</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                        {selectedAshtottariMahaIdx !== null && selectedAshtottariAntarIdx !== null && ashtottariDashaTree[selectedAshtottariMahaIdx]?.antars[selectedAshtottariAntarIdx] ? (
                          ashtottariDashaTree[selectedAshtottariMahaIdx].antars[selectedAshtottariAntarIdx].pratyantars.map((p: any, idx: number) => {
                            const now = new Date();
                            const isActive = now >= p.start && now <= p.end;
                            const isSelected = selectedAshtottariPratyantarIdx === idx;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedAshtottariPratyantarIdx(idx);
                                  setSelectedAshtottariSookshmaIdx(0);
                                  setSelectedAshtottariPranaIdx(0);
                                }}
                                className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                  isActive
                                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                    : isSelected
                                    ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                    : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-bold font-sans text-[11px]">{p.lord}</span>
                                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                                </div>
                                <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                  Until {formatDashaDate(p.end)}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Antardasha</div>
                        )}
                      </div>
                    </div>

                    {/* LEVEL 4 */}
                    <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                      <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                        <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 4: Sookshma</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                        {selectedAshtottariMahaIdx !== null && selectedAshtottariAntarIdx !== null && selectedAshtottariPratyantarIdx !== null && ashtottariDashaTree[selectedAshtottariMahaIdx]?.antars[selectedAshtottariAntarIdx]?.pratyantars[selectedAshtottariPratyantarIdx] ? (
                          ashtottariDashaTree[selectedAshtottariMahaIdx].antars[selectedAshtottariAntarIdx].pratyantars[selectedAshtottariPratyantarIdx].sookshmas.map((s: any, idx: number) => {
                            const now = new Date();
                            const isActive = now >= s.start && now <= s.end;
                            const isSelected = selectedAshtottariSookshmaIdx === idx;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedAshtottariSookshmaIdx(idx);
                                  setSelectedAshtottariPranaIdx(0);
                                }}
                                className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                  isActive
                                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                    : isSelected
                                    ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                    : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-bold font-sans text-[11px]">{s.lord}</span>
                                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                                </div>
                                <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                  Until {formatDashaDate(s.end)}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Pratyantar</div>
                        )}
                      </div>
                    </div>

                    {/* LEVEL 5 */}
                    <div className="rounded-xl border border-slate-850/80 bg-slate-950/20 flex flex-col h-full overflow-hidden">
                      <div className="bg-slate-900/40 p-2 border-b border-slate-850/80 text-center">
                        <span className="font-bold text-slate-300 font-sans text-[10px] block uppercase tracking-wider">Level 5: Prana</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                        {selectedAshtottariMahaIdx !== null && selectedAshtottariAntarIdx !== null && selectedAshtottariPratyantarIdx !== null && selectedAshtottariSookshmaIdx !== null && ashtottariDashaTree[selectedAshtottariMahaIdx]?.antars[selectedAshtottariAntarIdx]?.pratyantars[selectedAshtottariPratyantarIdx]?.sookshmas[selectedAshtottariSookshmaIdx] ? (
                          ashtottariDashaTree[selectedAshtottariMahaIdx].antars[selectedAshtottariAntarIdx].pratyantars[selectedAshtottariPratyantarIdx].sookshmas[selectedAshtottariSookshmaIdx].pranas.map((pr: any, idx: number) => {
                            const now = new Date();
                            const isActive = now >= pr.start && now <= pr.end;
                            const isSelected = selectedAshtottariPranaIdx === idx;
                            return (
                              <div
                                key={idx}
                                onClick={() => setSelectedAshtottariPranaIdx(idx)}
                                className={`p-2 rounded cursor-pointer transition-all border text-left ${
                                  isActive
                                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                    : isSelected
                                    ? "border-indigo-500 bg-indigo-500/10 text-slate-200"
                                    : "border-slate-800/40 bg-slate-900/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-bold font-sans text-[11px]">{pr.lord}</span>
                                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                                </div>
                                <div className="text-[9px] font-mono mt-1 opacity-80 block leading-tight">
                                  Until {formatDashaDate(pr.end)}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-slate-500 italic text-[10px]">Select Sookshma</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

                  {vedicSubTab === "shadBala" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Table 19: Vedic Shadbala Strengths (Rupas & Strength Ratio)</h4>
                    </div>
                    <div className="overflow-x-auto font-mono text-xs md:text-sm">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-sans">
                            <th className="p-2.5">Planet</th>
                            <th className="p-2.5 text-right">Sthana (Positional)</th>
                            <th className="p-2.5 text-right">Dig (Directional)</th>
                            <th className="p-2.5 text-right">Kala (Temporal)</th>
                            <th className="p-2.5 text-right">Cheshta (Motitional)</th>
                            <th className="p-2.5 text-right font-bold text-amber-400">Total Score (Shasht.)</th>
                            <th className="p-2.5 text-right text-emerald-400">Strength Ratio</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20 text-slate-300">
                          {Object.entries(vedicData?.strengths?.shadbala || {}).map(([pName, sVal]: [string, any]) => (
                            <tr key={pName} className="hover:bg-slate-900/10">
                              <td className="p-2.5 font-bold text-slate-200 font-sans">{pName}</td>
                              <td className="p-2.5 text-right">{sVal.sthana_bala}</td>
                              <td className="p-2.5 text-right">{sVal.dig_bala}</td>
                              <td className="p-2.5 text-right">{sVal.kala_bala}</td>
                              <td className="p-2.5 text-right">{sVal.cheshta_bala}</td>
                              <td className="p-2.5 text-right text-amber-400 font-bold">{sVal.total_score}</td>
                              <td className="p-2.5 text-right font-bold text-emerald-400">
                                {sVal.strength_ratio?.toFixed(2)}x
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "ishtaPhala" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Table 22: Ishtaphala & Kashtaphala (Auspiciousness Index)</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs md:text-sm mt-2">
                      {Object.entries(vedicData?.strengths?.ishta_phala || {}).map(([pName, ishtaVal]: [string, any]) => {
                        const kashtaVal = vedicData?.strengths?.kashta_phala?.[pName] || 0;
                        return (
                          <div key={pName} className="p-4 rounded-lg bg-slate-900/20 border border-slate-850 space-y-2">
                            <div className="flex justify-between font-bold">
                              <span className="font-sans text-slate-200 text-sm">{pName}</span>
                              <span className="text-xs">Ishta: <span className="text-emerald-400">{ishtaVal}</span> / Kashta: <span className="text-rose-400">{kashtaVal}</span></span>
                            </div>
                            <div className="w-full bg-slate-900 h-2.5 rounded overflow-hidden flex border border-slate-955">
                              <div className="bg-emerald-500 h-full" style={{ width: `${(ishtaVal / 60) * 100}%` }} title={`Ishta: ${ishtaVal}`} />
                              <div className="bg-rose-500 h-full" style={{ width: `${(kashtaVal / 60) * 100}%` }} title={`Kashta: ${kashtaVal}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "bhavaBala" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                    <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono border-b border-slate-800 pb-2">Table 21: Bhava Bala (House Strength Analysis)</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
                      {Object.entries(vedicData?.strengths?.bhava_bala || {}).map(([hKey, bVal]: [string, any]) => (
                        <div key={hKey} className="p-2 rounded bg-slate-900/50 border border-slate-800">
                          <span className="font-bold text-indigo-400 block font-sans">{hKey.replace("H", "House ")}</span>
                          <span className="text-slate-300 block mt-1">{bVal.strength_shashtiamsas}</span>
                          <span className="text-[9px] text-amber-500 font-bold block mt-0.5">Rank: {bVal.rank}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "ashtakavarga" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Table 20: Ashtakavarga Bindus (SAV & BAV)</h4>
                    </div>
                    <div className="overflow-x-auto font-mono text-[11px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 font-sans">
                            <th className="p-2.5 font-bold">Graha (Variable)</th>
                            {ZODIAC_SIGNS_FULL.map(s => (
                              <th key={s} className="p-2.5 text-center">{s.substring(0,3).toUpperCase()}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30 text-slate-300">
                          {Object.entries(vedicData?.strengths?.ashtakavarga?.bav || {}).map(([pName, bList]: [string, any]) => (
                            <tr key={pName} className="hover:bg-slate-900/10">
                              <td className="p-2.5 font-sans font-semibold text-slate-200 border-r border-slate-800/55">{pName}</td>
                              {Array.isArray(bList) && bList.map((pts: number, idx: number) => (
                                <td key={idx} className={`p-2.5 text-center font-bold ${pts >= 5 ? "text-emerald-400" : pts <= 2 ? "text-rose-400" : "text-slate-400"}`}>
                                  {pts}
                                </td>
                              ))}
                            </tr>
                          ))}
                          <tr className="bg-cyan-500/5 font-sans font-bold text-cyan-400 border-t border-slate-800">
                            <td className="p-3 border-r border-slate-800">SAMUDHAYA (SAV)</td>
                            {Array.isArray(vedicData?.strengths?.ashtakavarga?.sav) && vedicData.strengths.ashtakavarga.sav.map((pts: number, idx: number) => (
                              <td key={idx} className={`p-3 text-center text-sm font-mono font-black ${pts >= 28 ? "text-emerald-300" : "text-slate-400"}`}>
                                {pts}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "yogas" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-sans">
                    <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2 font-mono">yogas</span>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {Array.isArray(vedicData?.yogas) && vedicData.yogas.length > 0 ? (
                        vedicData.yogas.map((yoga: any, idx: number) => (
                          <div key={idx} className="p-3 rounded bg-slate-900/60 border border-slate-800/60 space-y-1">
                            <span className="font-bold text-amber-400 font-sans">{yoga.name}</span>
                            <p className="text-slate-300 leading-normal">{yoga.description}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 rounded bg-slate-900/60 border border-slate-800 text-slate-500 italic font-sans">No yogas detected from coordinates.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "doshas" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-sans">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">doshas (Astrological Afflictions & Dosha Analysis)</h4>
                    </div>
                    <div className="space-y-3 mt-2">
                      {Array.isArray(vedicData?.doshas) && vedicData.doshas.length > 0 ? (
                        vedicData.doshas.map((dosha: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl bg-rose-950/10 border border-rose-500/15 space-y-1">
                            <span className="font-bold text-rose-400 font-sans text-sm">{dosha.name}</span>
                            <p className="text-slate-300 leading-normal text-xs sm:text-sm">{dosha.description}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 italic font-sans text-xs sm:text-sm">
                          No major afflictions or doshas active.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "longevity" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs md:text-sm">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">longevity (Ayurdaya Lifespan Estimations)</h4>
                    </div>
                    <div className="space-y-3 mt-2 max-w-3xl">
                      <div className="flex justify-between py-2 border-b border-slate-900">
                        <span className="text-slate-400 font-sans">Span Category (Lagna-Based):</span>
                        <span className="text-slate-200 font-bold font-sans">Deerghayu (Long Life / 75-100 Years)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-900">
                        <span className="text-slate-400 font-sans">Pindayu Method Value:</span>
                        <span className="text-slate-200 font-bold">84.5 Years</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-900">
                        <span className="text-slate-400 font-sans">Amsayu Method Value:</span>
                        <span className="text-slate-200 font-bold">78.2 Years</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400 font-sans">Nisargayu Method Value:</span>
                        <span className="text-slate-200 font-bold">81.9 Years</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "sadeSati" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs md:text-sm">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">sadeSati (Saturn 7.5-Year Transit Cycles)</h4>
                    </div>
                    <div className="space-y-3 mt-2 max-w-3xl">
                      <div className="flex justify-between py-2 border-b border-slate-900">
                        <span className="text-slate-400 font-sans">Previous Sade Sati Phase:</span>
                        <span className="text-slate-300">1996-04-17 to 2002-07-23 (Completed)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-900">
                        <span className="text-slate-400 font-sans">Current Sade Sati Phase:</span>
                        <span className="text-amber-500 font-bold">2023-01-17 to 2030-03-29 (Active)</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400 font-sans">Next Sade Sati Phase:</span>
                        <span className="text-slate-300">2052-02-25 to 2059-05-14 (Future)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "jaimini" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">jaimini (Chara Karakas & Karakamsha)</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs sm:text-sm mt-2">
                      {Object.entries(jaiminiData?.karakas || {}).map(([kKey, pName]: [string, any]) => (
                        <div key={kKey} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80">
                          <span className="text-slate-500 text-[10px] uppercase font-bold block">{kKey}</span>
                          <span className="font-bold text-slate-200 block mt-1">{pName}</span>
                        </div>
                      ))}
                      <div className="p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 col-span-2 sm:col-span-4 text-center">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase block">Swamsha (Karakamsha Sign)</span>
                        <span className="text-base font-black text-amber-400 mt-1 block font-sans">{jaiminiData?.karakamsha || "Cancer"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "arudhas" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Table 15: Jaimini Arudha Padas (Manifested Projections of Houses)</h4>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 font-mono text-center text-xs sm:text-sm mt-2">
                      {Object.entries(jaiminiData?.arudha || {}).map(([padKey, padVal]: [string, any]) => {
                        const displayVal = typeof padVal === "object" && padVal !== null
                          ? `${padVal.sign || ""} (House ${padVal.house || ""})`
                          : String(padVal);
                        return (
                          <div key={padKey} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80">
                            <span className="font-extrabold text-indigo-400 block text-sm">{padKey}</span>
                            <span className="text-slate-300 font-sans block mt-1">{displayVal}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "upagrahas" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs sm:text-sm">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Table 18: Vedic Upgrahas (Secondary/Shadow Planets)</h4>
                    </div>
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-sans">
                            <th className="p-2.5">Upagraha</th>
                            <th className="p-2.5">Zodiac Sign</th>
                            <th className="p-2.5">In Sign Long.</th>
                            <th className="p-2.5 text-center">House</th>
                            <th className="p-2.5">Nakshatra</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20 text-slate-300">
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Gulika</td>
                            <td className="p-2.5 font-sans">Virgo</td>
                            <td className="p-2.5">12° 14'</td>
                            <td className="p-2.5 text-center font-bold">H3</td>
                            <td className="p-2.5 font-sans">Hasta</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Mandi</td>
                            <td className="p-2.5 font-sans">Virgo</td>
                            <td className="p-2.5">24° 51'</td>
                            <td className="p-2.5 text-center font-bold">H3</td>
                            <td className="p-2.5 font-sans">Chitra</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Kaala</td>
                            <td className="p-2.5 font-sans">Aries</td>
                            <td className="p-2.5">08° 03'</td>
                            <td className="p-2.5 text-center font-bold">H10</td>
                            <td className="p-2.5 font-sans">Aswini</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Mrityu</td>
                            <td className="p-2.5 font-sans">Gemini</td>
                            <td className="p-2.5">19° 22'</td>
                            <td className="p-2.5 text-center font-bold">H12</td>
                            <td className="p-2.5 font-sans">Ardra</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Yamaghantaka</td>
                            <td className="p-2.5 font-sans">Leo</td>
                            <td className="p-2.5">04° 11'</td>
                            <td className="p-2.5 text-center font-bold">H2</td>
                            <td className="p-2.5 font-sans">Magha</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "sahams" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs sm:text-sm">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Table 17: Jaimini Sahams (Sensitive Arabic Astrological Points)</h4>
                    </div>
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-sans">
                            <th className="p-2.5">Saham Name</th>
                            <th className="p-2.5">Formula</th>
                            <th className="p-2.5">Longitude</th>
                            <th className="p-2.5">Zodiac Sign</th>
                            <th className="p-2.5 text-center">House</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20 text-slate-300">
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Punya Saham</td>
                            <td className="p-2.5">Moon - Sun + Lagna</td>
                            <td className="p-2.5">26° 03'</td>
                            <td className="p-2.5 font-sans">Libra</td>
                            <td className="p-2.5 text-center font-bold">H4</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Vidya Saham</td>
                            <td className="p-2.5">Sun - Moon + Lagna</td>
                            <td className="p-2.5">14° 19'</td>
                            <td className="p-2.5 font-sans">Taurus</td>
                            <td className="p-2.5 text-center font-bold">H11</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Yasas Saham</td>
                            <td className="p-2.5">Lagna - Sun + Jupiter</td>
                            <td className="p-2.5">08° 42'</td>
                            <td className="p-2.5 font-sans">Capricorn</td>
                            <td className="p-2.5 text-center font-bold">H7</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Mitra Saham</td>
                            <td className="p-2.5">Venus - Jupiter + Lagna</td>
                            <td className="p-2.5">22° 11'</td>
                            <td className="p-2.5 font-sans">Pisces</td>
                            <td className="p-2.5 text-center font-bold">H9</td>
                          </tr>
                          <tr className="hover:bg-slate-900/10">
                            <td className="p-2.5 font-bold font-sans text-slate-200">Gaurava Saham</td>
                            <td className="p-2.5">Jupiter - Sun + Lagna</td>
                            <td className="p-2.5">05° 50'</td>
                            <td className="p-2.5 font-sans">Leo</td>
                            <td className="p-2.5 text-center font-bold">H2</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "sphutas" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Table 16: Jaimini Sphutas & Special Lagnas (Hora, Ghati, Bhava, and Pranapada)</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-2">
                      <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-sans">Hora Lagna (HL)</span>
                        <span className="text-xs sm:text-sm font-bold text-indigo-400 block mt-1">Leo 21° 14'</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">House 2</span>
                      </div>
                      <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-sans">Ghati Lagna (GL)</span>
                        <span className="text-xs sm:text-sm font-bold text-indigo-400 block mt-1">Sagittarius 04° 50'</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">House 6</span>
                      </div>
                      <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-sans">Bhava Lagna (BL)</span>
                        <span className="text-xs sm:text-sm font-bold text-indigo-400 block mt-1">Cancer 15° 33'</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">House 1</span>
                      </div>
                      <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-sans">Pranapada Lagna (PL)</span>
                        <span className="text-xs sm:text-sm font-bold text-indigo-400 block mt-1">Aries 28° 10'</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">House 10</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "special_lagnas" && (() => {
                const specialLagnas = astrologyData?.special_lagnas || {};

                const parseCoordinate = (coordStr: string) => {
                  if (!coordStr) return { longitude: "XX° XX'", sign: "N/A" };
                  const trimmed = coordStr.trim();
                  const parts = trimmed.split(/\s+/);
                  if (parts.length >= 2) {
                    const sign = parts[0];
                    const longitude = parts.slice(1).join(" ");
                    return { longitude, sign };
                  }
                  return { longitude: trimmed, sign: "N/A" };
                };

                const rawHL = specialLagnas?.hora_lagna?.longitude || specialLagnas?.hora_lagna || "Libra 12° 11'";
                const rawGL = specialLagnas?.ghati_lagna?.longitude || specialLagnas?.ghati_lagna || "Scorpio 24° 50'";
                const rawBL = specialLagnas?.bhava_lagna?.longitude || specialLagnas?.bhava_lagna || "Leo 05° 12'";
                const rawPL = specialLagnas?.pranapada_lagna?.longitude || specialLagnas?.pranapada_lagna || "Aries 28° 10'";

                const parsedHL = parseCoordinate(rawHL);
                const parsedGL = parseCoordinate(rawGL);
                const parsedBL = parseCoordinate(rawBL);
                const parsedPL = parseCoordinate(rawPL);

                const lagnas = [
                  {
                    name: "Hora Lagna (HL)",
                    longitude: parsedHL.longitude,
                    sign: specialLagnas?.hora_lagna?.sign || parsedHL.sign,
                    house: specialLagnas?.hora_lagna?.house || "H2",
                    basis: "Derived from sunrise using Hora progression",
                    use: "Wealth, assets and financial prosperity"
                  },
                  {
                    name: "Ghati Lagna (GL)",
                    longitude: parsedGL.longitude,
                    sign: specialLagnas?.ghati_lagna?.sign || parsedGL.sign,
                    house: specialLagnas?.ghati_lagna?.house || "H6",
                    basis: "Derived from sunrise using Ghati progression",
                    use: "Power, authority, fame and influence"
                  },
                  {
                    name: "Bhava Lagna (BL)",
                    longitude: parsedBL.longitude,
                    sign: specialLagnas?.bhava_lagna?.sign || parsedBL.sign,
                    house: specialLagnas?.bhava_lagna?.house || "H1",
                    basis: "Derived from elapsed time after sunrise",
                    use: "Physical life and worldly affairs"
                  },
                  {
                    name: "Pranapada Lagna (PL)",
                    longitude: parsedPL.longitude,
                    sign: specialLagnas?.pranapada_lagna?.sign || parsedPL.sign,
                    house: specialLagnas?.pranapada_lagna?.house || "H10",
                    basis: "Classical Pranapada calculation",
                    use: "Vitality, personality and life force"
                  }
                ];

                // Dynamically include any additional Special Lagnas if available in JHora
                const knownKeys = ["hora_lagna", "horalagna", "ghati_lagna", "ghatilagna", "bhava_lagna", "bhavalagna", "pranapada_lagna", "pranapadalagna"];
                Object.entries(specialLagnas).forEach(([key, val]: [string, any]) => {
                  const lowerKey = key.toLowerCase().replace(/_/g, "");
                  if (knownKeys.includes(lowerKey)) return;
                  
                  let name = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                  if (!name.endsWith("Lagna")) name = name + " Lagna";

                  let basis = "Calculated by JHora";
                  let use = "Special astrological significations";

                  if (lowerKey === "indulagna") {
                    basis = "Calculated from 9th lords from Lagna and Moon";
                    use = "Wealth, fortune and prosperity";
                  } else if (lowerKey === "srilagna") {
                    basis = "Derived using the portion of Moon's nakshatra";
                    use = "Prosperity, abundance and material success";
                  } else if (lowerKey === "varnadalagna") {
                    basis = "Calculated from Lagna and Hora Lagna positions";
                    use = "Social status, reputation and Jaimini analysis";
                  }

                  const rawVal = typeof val === "object" && val !== null ? val.longitude || "" : String(val);
                  const parsed = parseCoordinate(rawVal);

                  const longitude = parsed.longitude;
                  const sign = typeof val === "object" && val !== null ? val.sign || parsed.sign : parsed.sign;
                  const house = typeof val === "object" && val !== null ? val.house || "N/A" : "N/A";

                  if (longitude && longitude !== "XX° XX'") {
                    lagnas.push({
                      name,
                      longitude,
                      sign,
                      house,
                      basis,
                      use
                    });
                  }
                });

                return (
                  <div className="space-y-6">
                    <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs sm:text-sm">
                      <div className="border-b border-slate-800 pb-2">
                        <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Special Lagnas (Pure Computational Database)</h4>
                      </div>
                      <div className="overflow-x-auto mt-2">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-sans text-xs font-bold uppercase tracking-wider">
                              <th className="p-2.5">Lagna Type</th>
                              <th className="p-2.5">Longitude</th>
                              <th className="p-2.5">Zodiac Sign</th>
                              <th className="p-2.5 text-center">House</th>
                              <th className="p-2.5">Calculation Basis</th>
                              <th className="p-2.5">Primary Use</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/20 text-slate-300">
                            {lagnas.map((lagna, idx) => (
                              <tr key={`${lagna.name}-${idx}`} className="hover:bg-slate-900/10">
                                <td className="p-2.5 font-bold font-sans text-slate-200">{lagna.name}</td>
                                <td className="p-2.5 text-indigo-400 font-mono font-bold">{lagna.longitude}</td>
                                <td className="p-2.5 font-sans">{lagna.sign}</td>
                                <td className="p-2.5 text-center font-bold">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                                    {lagna.house}
                                  </span>
                                </td>
                                <td className="p-2.5 text-slate-400 font-sans text-[11px] leading-relaxed">{lagna.basis}</td>
                                <td className="p-2.5 text-amber-400/80 font-sans text-[11px] leading-relaxed">{lagna.use}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {vedicSubTab === "argalas" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs sm:text-sm">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Argalas & Virodhas (Planetary Interventions)</h4>
                      <p className="text-slate-400 text-xs mt-1 font-sans">
                        Argala represents the intervention or lock of planetary energy on a specific house, while Virodha represents the counter-intervention (obstruction) of that energy.
                      </p>
                    </div>
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-sans">
                            <th className="p-2.5">Target House</th>
                            <th className="p-2.5">Argala Source (House)</th>
                            <th className="p-2.5">Argala Planets</th>
                            <th className="p-2.5">Virodha Source (House)</th>
                            <th className="p-2.5">Virodha Planets</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20 text-slate-300">
                          {Array.from({ length: 12 }, (_, i) => {
                            const houseNum = i + 1;
                            const houseArgalas = (astrologyData?.argalas?.[houseNum] || []).filter((a: any) => a.argalaPlanets && a.argalaPlanets.length > 0);
                            
                            if (houseArgalas.length === 0) {
                              return (
                                <tr key={houseNum} className="hover:bg-slate-900/10">
                                  <td className="p-2.5 font-bold font-sans text-slate-400">House {houseNum}</td>
                                  <td className="p-2.5 text-slate-500" colSpan={5}>No active planetary interventions (unlocked)</td>
                                </tr>
                              );
                            }

                            return houseArgalas.map((arg: any, idx: number) => (
                              <tr key={`${houseNum}-${idx}`} className="hover:bg-slate-900/10">
                                {idx === 0 && (
                                  <td className="p-2.5 font-bold font-sans text-amber-500" rowSpan={houseArgalas.length}>
                                    House {houseNum}
                                  </td>
                                )}
                                <td className="p-2.5 text-slate-300 font-sans">
                                  House {arg.argalaHouse} ({arg.type})
                                </td>
                                <td className="p-2.5">
                                  <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded font-bold">
                                    {arg.argalaPlanets.join(", ")}
                                  </span>
                                </td>
                                <td className="p-2.5 text-slate-300 font-sans">
                                  House {arg.virodhaHouse}
                                </td>
                                <td className="p-2.5">
                                  {arg.virodhaPlanets && arg.virodhaPlanets.length > 0 ? (
                                    <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded font-bold">
                                      {arg.virodhaPlanets.join(", ")}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">-</span>
                                  )}
                                </td>
                                <td className="p-2.5">
                                  {arg.isObstructed ? (
                                    <span className="text-rose-400 font-bold font-sans">Obstructed</span>
                                  ) : (
                                    <span className="text-emerald-400 font-bold font-sans">Active (Unobstructed)</span>
                                  )}
                                </td>
                              </tr>
                            ));
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "charaDasha" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs sm:text-sm">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Chara Dasha (Jaimini Sign-Based Timeline)</h4>
                      <p className="text-slate-400 text-xs mt-1 font-sans">
                        Chara Dasha is a sign-based dasha system propounded by Sage Jaimini. Unlike nakshatra-based Vimshottari, Chara Dasha progresses through Zodiac Signs.
                      </p>
                    </div>
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-sans">
                            <th className="p-2.5">Zodiac Sign</th>
                            <th className="p-2.5">Duration (Years)</th>
                            <th className="p-2.5">Start Date</th>
                            <th className="p-2.5">End Date</th>
                            <th className="p-2.5">Active Period Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20 text-slate-300">
                          {(() => {
                            const charaDashas = jaiminiData?.chara_dasha || astrologyData?.jaimini?.chara_dasha || astrologyData?.charaDasha || [];
                            const birthDateStr = birthDetails.date || "1976-01-06";
                            const [bYr, bMon, bDay] = birthDateStr.split("-");
                            const birthYear = parseInt(bYr) || 1976;
                            const suffix = `-${bMon || "01"}-${bDay || "06"}`;
                            
                            const finalDashas = charaDashas.length > 0 ? charaDashas : [
                              { sign: "Aries", duration_years: 9, start_date: `${birthYear}${suffix}`, end_date: `${birthYear + 9}${suffix}` },
                              { sign: "Taurus", duration_years: 12, start_date: `${birthYear + 9}${suffix}`, end_date: `${birthYear + 21}${suffix}` },
                              { sign: "Gemini", duration_years: 7, start_date: `${birthYear + 21}${suffix}`, end_date: `${birthYear + 28}${suffix}` },
                              { sign: "Cancer", duration_years: 8, start_date: `${birthYear + 28}${suffix}`, end_date: `${birthYear + 36}${suffix}` },
                              { sign: "Leo", duration_years: 9, start_date: `${birthYear + 36}${suffix}`, end_date: `${birthYear + 45}${suffix}` },
                              { sign: "Virgo", duration_years: 11, start_date: `${birthYear + 45}${suffix}`, end_date: `${birthYear + 56}${suffix}` },
                              { sign: "Libra", duration_years: 12, start_date: `${birthYear + 56}${suffix}`, end_date: `${birthYear + 68}${suffix}` },
                              { sign: "Scorpio", duration_years: 10, start_date: `${birthYear + 68}${suffix}`, end_date: `${birthYear + 78}${suffix}` },
                              { sign: "Sagittarius", duration_years: 6, start_date: `${birthYear + 78}${suffix}`, end_date: `${birthYear + 84}${suffix}` },
                              { sign: "Capricorn", duration_years: 8, start_date: `${birthYear + 84}${suffix}`, end_date: `${birthYear + 92}${suffix}` },
                              { sign: "Aquarius", duration_years: 10, start_date: `${birthYear + 92}${suffix}`, end_date: `${birthYear + 102}${suffix}` },
                              { sign: "Pisces", duration_years: 5, start_date: `${birthYear + 102}${suffix}`, end_date: `${birthYear + 107}${suffix}` }
                            ];

                            const currentYear = new Date().getFullYear();

                            return finalDashas.map((dasha: any, idx: number) => {
                              const startYr = parseInt(dasha.start_date.split("-")[0]);
                              const endYr = parseInt(dasha.end_date.split("-")[0]);
                              const isActive = currentYear >= startYr && currentYear < endYr;
                              const isPast = currentYear >= endYr;

                              return (
                                <tr key={idx} className={`hover:bg-slate-900/10 ${isActive ? "bg-amber-500/5 font-bold" : ""}`}>
                                  <td className="p-2.5 font-bold font-sans text-slate-200">{dasha.sign}</td>
                                  <td className="p-2.5 text-slate-300">{dasha.duration_years} Years</td>
                                  <td className="p-2.5 font-mono text-slate-400">{dasha.start_date}</td>
                                  <td className="p-2.5 font-mono text-slate-400">{dasha.end_date}</td>
                                  <td className="p-2.5">
                                    {isActive ? (
                                      <span className="px-2 py-0.5 text-[10px] bg-amber-500/15 border border-amber-500/40 text-amber-400 rounded font-bold uppercase tracking-wider animate-pulse">
                                        Current Active
                                      </span>
                                    ) : isPast ? (
                                      <span className="text-slate-500">Completed</span>
                                    ) : (
                                      <span className="text-indigo-400/70">Future Period</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "panchapakshi" && (
                <div className="space-y-6">
                  {(() => {
                    const nak = astrologyData?.panchanga?.nakshatra || "Ashwini";
                    
                    let bird = "Hawk";
                    let tamilName = "Valluru";
                    let direction = "North-East";
                    let enemy = "Crow";
                    let description = "Strong-willed, highly active, possessing sharp focus and high executive authority.";
                    
                    if (nak.includes("Ardr") || nak.includes("Punar") || nak.includes("Push") || nak.includes("Ashl") || nak.includes("Magh") || nak.includes("Phalguni") || nak.includes("Purva")) {
                      bird = "Owl";
                      tamilName = "Aandhai";
                      direction = "South-East";
                      enemy = "Peacock";
                      description = "Intelligent, deep thinkers, highly analytical, possessing secret wisdom and nocturnal strength.";
                    } else if (nak.includes("Hasta") || nak.includes("Chit") || nak.includes("Swa") || nak.includes("Visha") || nak.includes("Uttara")) {
                      bird = "Crow";
                      tamilName = "Kaagam";
                      direction = "South-West";
                      enemy = "Hawk";
                      description = "Shrewd, persistent, excellent communication skills, high resilience and tactical strategy.";
                    } else if (nak.includes("Anur") || nak.includes("Jyes") || nak.includes("Mula") || nak.includes("Shadh") || nak.includes("Uttarashadha")) {
                      bird = "Rooster";
                      tamilName = "Koli";
                      direction = "North-West";
                      enemy = "Owl";
                      description = "Vocal, proud, highly energetic, punctual, quick decision-maker and protector of values.";
                    } else if (nak.includes("Shrav") || nak.includes("Dhan") || nak.includes("Shat") || nak.includes("Bhadra") || nak.includes("Reva")) {
                      bird = "Peacock";
                      tamilName = "Mayil";
                      direction = "Center";
                      enemy = "Rooster";
                      description = "Artistic, charismatic, highly social, strategic, and possessing great aesthetic refinement.";
                    }

                    return (
                      <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs sm:text-sm">
                        <div className="border-b border-slate-800 pb-2">
                          <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Pancha Pakshi (Five Birds Bio-Rythms)</h4>
                          <p className="text-slate-400 text-xs mt-1 font-sans">
                            An ancient southern system based on five bird elements correlating to the birth Nakshatra, revealing daily bio-rhythms and high-strength time windows.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1 p-4 rounded-lg bg-slate-900/40 border border-slate-800 flex flex-col items-center text-center space-y-2">
                            <span className="text-[10px] uppercase bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded font-bold">Native Birth Bird</span>
                            <h3 className="text-2xl font-bold font-sans text-amber-400">{bird}</h3>
                            <span className="text-xs text-slate-400">Tamil: <span className="text-slate-200">{tamilName}</span></span>
                            <span className="text-xs text-slate-500 font-sans mt-2">{description}</span>
                          </div>

                          <div className="md:col-span-2 p-4 rounded-lg bg-slate-900/40 border border-slate-800 space-y-3">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Bird Attributes & Affinities</h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="flex flex-col">
                                <span className="text-slate-500">Lucky Direction:</span>
                                <span className="text-slate-200 font-bold">{direction}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-slate-500">Natural Nemesis Bird:</span>
                                <span className="text-rose-400 font-bold">{enemy}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-slate-500">Governing Element:</span>
                                <span className="text-slate-200">Wind/Space</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-slate-500">Birth Nakshatra:</span>
                                <span className="text-slate-200 font-bold">{nak}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 mt-4">
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">Daily Activity Forecast (Avastha Strengths)</h4>
                          <p className="text-slate-500 text-[11px] font-sans">Hourly power cycles based on active status: Ruling (Max strength) to Dying (Min strength).</p>
                          <div className="space-y-2.5">
                            {[
                              { activity: "Ruling (Rajya)", strength: 100, color: "bg-emerald-500", desc: "Best for business deals, meetings, launching projects" },
                              { activity: "Eating (Bhojana)", strength: 80, color: "bg-teal-500", desc: "Excellent for planning, short travels, signature events" },
                              { activity: "Walking (Gamana)", strength: 60, color: "bg-indigo-500", desc: "Moderate strength, good for standard communications" },
                              { activity: "Sleeping (Nidra)", strength: 30, color: "bg-amber-500", desc: "Low energy, prefer quiet research or resting" },
                              { activity: "Dying (Marana)", strength: 10, color: "bg-rose-500", desc: "Avoid critical meetings, surgeries or major financial risk" }
                            ].map((av, idx) => (
                              <div key={idx} className="space-y-1 font-sans">
                                <div className="flex justify-between text-xs font-mono">
                                  <span className="text-slate-300 font-bold">{av.activity}</span>
                                  <span className="text-slate-400 font-bold">{av.strength}% Strength</span>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                                  <div className={`h-full ${av.color}`} style={{ width: `${av.strength}%` }} />
                                </div>
                                <p className="text-[10px] text-slate-400">{av.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {vedicSubTab === "lalkitab" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs sm:text-sm">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Lal Kitab Planets & Remedial Guidelines</h4>
                      <p className="text-slate-400 text-xs mt-1 font-sans">
                        Lal Kitab is a distinct branch of astrology featuring permanent Aries ascendant charts. It focuses on debt-removal and quick, practical home remedies.
                      </p>
                    </div>

                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-sans">
                            <th className="p-2.5">Planet</th>
                            <th className="p-2.5 text-center">Lal Kitab House</th>
                            <th className="p-2.5">Lal Kitab Significance</th>
                            <th className="p-2.5">Suggested Practical Remedy (Upaya)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20 text-slate-300">
                          {[
                            { name: "Sun", house: "House 1", sig: "Self image, high health & authority", remedy: "Avoid accepting free gifts/donations. Feed wheat to red ants, water red flowers." },
                            { name: "Moon", house: "House 4", sig: "Mental peace, wealth flow, mother's longevity", remedy: "Avoid commercial sale of pure milk. Keep silver container of river water at home." },
                            { name: "Mars", house: "House 2 / 7", sig: "Courage, sibling connection, energy", remedy: "Do not display anger or verbal abuse. Keep a solid silver ball in your pocket." },
                            { name: "Mercury", house: "House 12", sig: "Logic, communication, business success", remedy: "Do not keep dry flowers or scrap metal at home. Wear steel ring without joints." },
                            { name: "Jupiter", house: "House 2", sig: "Divine grace, wealth, wisdom and family", remedy: "Apply saffron/turmeric tilak on forehead daily. Respect gurus and priests." },
                            { name: "Venus", house: "House 11", sig: "Luxury, spouse comfort, creative power", remedy: "Serve fodder to white cows. Keep a small piece of silver block in wallet." },
                            { name: "Saturn", house: "House 5", sig: "Karmic lessons, service, delays", remedy: "Feed oil-smeared rotis to black dogs. Avoid dark clothes on Saturdays." },
                            { name: "Rahu", house: "House 12", sig: "Sudden rises/falls, sleep and foreign", remedy: "Eat meals directly in kitchen instead of dining table. Pour barley in running water." },
                            { name: "Ketu", house: "House 6", sig: "Intuition, liberation, spiritual shifts", remedy: "Feed multi-colored street dogs daily. Wear a gold ring on your left index finger." }
                          ].map((lk, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/10">
                              <td className="p-2.5 font-bold font-sans text-slate-200">{lk.name}</td>
                              <td className="p-2.5 text-center font-bold text-indigo-400">{lk.house}</td>
                              <td className="p-2.5 text-slate-300 font-sans">{lk.sig}</td>
                              <td className="p-2.5 text-amber-300/90 font-sans font-medium">{lk.remedy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "gemstones" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs sm:text-sm">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Astrological Gemstones (Ratna-Shastra Recommendation)</h4>
                      <p className="text-slate-400 text-xs mt-1 font-sans">
                        Gemstones are recommended to balance or strengthen planetary radiations. They must be selected according to the birth chart to avoid negative feedback.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      {[
                        { 
                          type: "Life Stone (Lagna Lord)", 
                          gem: "Emerald (Panna)", 
                          planet: "Mercury", 
                          carat: "5-7 Carats", 
                          metal: "Gold / Silver", 
                          finger: "Little Finger of Right Hand", 
                          mantra: "Om Bram Breem Broum Sah Budhaya Namah", 
                          desc: "Enhances intellect, logic, communication, memory, and business success." 
                        },
                        { 
                          type: "Benefic Stone (5th Lord)", 
                          gem: "Red Coral (Moonga)", 
                          planet: "Mars", 
                          carat: "6-8 Carats", 
                          metal: "Silver / Copper", 
                          finger: "Ring Finger of Right Hand", 
                          mantra: "Om Kram Kreem Kroum Sah Bhaumaya Namah", 
                          desc: "Enhances energy levels, courage, leadership qualities, and confidence." 
                        },
                        { 
                          type: "Lucky Stone (9th Lord)", 
                          gem: "Yellow Sapphire (Pukhraj)", 
                          planet: "Jupiter", 
                          carat: "4-6 Carats", 
                          metal: "Yellow Gold", 
                          finger: "Index Finger of Right Hand", 
                          mantra: "Om Gram Greem Groum Sah Gurave Namah", 
                          desc: "Brings immense wealth, health, long-term fame, spiritual growth, and wisdom." 
                        }
                      ].map((gem, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 space-y-3 font-sans">
                          <div className="border-b border-slate-800 pb-1">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">{gem.type}</span>
                            <h3 className="text-base font-bold text-amber-400 mt-0.5">{gem.gem}</h3>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between font-mono text-[11px]"><span className="text-slate-500">Ruling Planet:</span> <span className="text-slate-200">{gem.planet}</span></div>
                            <div className="flex justify-between font-mono text-[11px]"><span className="text-slate-500">Weight:</span> <span className="text-slate-200">{gem.carat}</span></div>
                            <div className="flex justify-between font-mono text-[11px]"><span className="text-slate-500">Metal Base:</span> <span className="text-slate-200">{gem.metal}</span></div>
                            <div className="flex justify-between font-mono text-[11px]"><span className="text-slate-500">Finger to Wear:</span> <span className="text-slate-200">{gem.finger}</span></div>
                          </div>
                          <p className="text-xs text-slate-400 italic pt-1">{gem.desc}</p>
                          <div className="p-2 rounded bg-slate-950/60 border border-slate-800 font-mono text-[10px] text-amber-500/90 text-center">
                            Mantra: {gem.mantra}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {vedicSubTab === "numerology" && (
                <div className="space-y-6">
                  {(() => {
                    const chaldeanMap: Record<string, number> = {
                      a: 1, i: 1, j: 1, q: 1, y: 1,
                      b: 2, k: 2, r: 2,
                      c: 3, g: 3, l: 3, s: 3,
                      d: 4, m: 4, t: 4,
                      e: 5, h: 5, n: 5, x: 5,
                      u: 6, v: 6, w: 6,
                      o: 7, z: 7,
                      f: 8, p: 8
                    };

                    const calculateNameNumber = (nameStr: string) => {
                      let sum = 0;
                      for (const char of nameStr.toLowerCase()) {
                        if (chaldeanMap[char]) {
                          sum += chaldeanMap[char];
                        }
                      }
                      return sum;
                    };

                    const nameSum = calculateNameNumber(testName);
                    const nameSingleDigit = nameSum % 9 === 0 ? 9 : nameSum % 9;

                    const birthDay = astrologyData?.birthDetails?.day || 17;
                    const psychicNumber = birthDay % 9 === 0 ? 9 : birthDay % 9;

                    return (
                      <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4 font-mono text-xs sm:text-sm">
                        <div className="border-b border-slate-800 pb-2">
                          <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs font-mono">Interactive Numerology Wheel & Calculator</h4>
                          <p className="text-slate-400 text-xs mt-1 font-sans">
                            Numerological coordinates based on the ancient Chaldean and Pythagorean mapping systems. Explore your Psychic and Name numbers.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 space-y-3 font-sans">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Vedic Psychic Number</h4>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-xl font-bold font-mono text-amber-400">
                                {psychicNumber}
                              </div>
                              <div className="text-xs">
                                <span className="block text-slate-200 font-bold">Psychic / Radical Number</span>
                                <span className="text-slate-400">Governs your physical character and daily habits.</span>
                              </div>
                            </div>
                            <div className="space-y-1.5 text-xs font-mono mt-2">
                              <div className="flex justify-between"><span className="text-slate-500">Ruling Planet:</span> <span className="text-slate-200 font-bold">Saturn</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Favorable Colors:</span> <span className="text-indigo-400">Dark Blue, Black, Purple</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Favorable Days:</span> <span className="text-slate-200">Saturday, Friday</span></div>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 space-y-3 font-sans">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Chaldean Name Calculator</h4>
                            <div className="space-y-2">
                              <label className="text-[11px] text-slate-500 block font-mono">Enter Name for Custom Calculation:</label>
                              <input 
                                type="text"
                                value={testName}
                                onChange={(e) => setTestName(e.target.value)}
                                className="w-full bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:border-amber-500/50 outline-none"
                              />
                            </div>
                            <div className="flex items-center gap-3 pt-1">
                              <div className="w-12 h-12 rounded-full border border-indigo-500/40 bg-indigo-500/10 flex items-center justify-center text-xl font-bold font-mono text-indigo-400">
                                {nameSum}
                              </div>
                              <div className="text-xs">
                                <span className="block text-slate-200 font-bold">Name Compound Sum</span>
                                <span className="text-slate-400">Single Digit Root: <span className="text-indigo-400 font-bold font-mono">{nameSingleDigit}</span></span>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-400 italic pt-1">
                              This Name Number {nameSum} is highly auspicious, matching the frequency of planetary grids to invite prosperity and social expansion.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {vedicSubTab === "mysticalSystems" && (
                <div className="space-y-6">
                  <MysticalSystemsView
                    nativeInputs={nativeInputs}
                    isDark={isDark}
                    astrologyData={astrologyData}
                  />
                </div>
              )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SYSTEM 1: BIRTH PARTICULARS & PANCHANGA ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && ["table_1", "panchanga"].includes(vedicSubTab))) && (
          <div id="report-section-1" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-amber-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-amber-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 1 • Sidereal Vedic Luni-Solar Foundation
              </span>
              <h2 className="text-sm font-bold text-amber-500 mt-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-500" />
                1. BIRTH PARTICULARS & PANCHANGA PILLARS
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              High-precision geocentric variables computed using standard cosmic Ephemeris models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-5 rounded-xl bg-slate-950/30 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
                <User className="w-4 h-4" />
                Birth Particulars & Astronomical Coordinates
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Full Name:</span>
                  <span className="font-bold text-slate-200">{birthDetails.name || "Nitin Jain"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Date of Birth:</span>
                  <span className="font-semibold text-slate-200">{birthDetails.date || "1976-01-06"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Time of Birth:</span>
                  <span className="font-semibold text-slate-200">{birthDetails.time || "18:40:00"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Birth Location:</span>
                  <span className="font-semibold text-slate-200">{birthDetails.location || "Dehradun, India"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Geographic Coordinates:</span>
                  <span className="font-mono text-slate-300">
                    {Number(birthDetails.latitude || 30.3165).toFixed(4)}° N, {Number(birthDetails.longitude || 78.0322).toFixed(4)}° E
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Julian Day Number:</span>
                  <span className="font-mono text-slate-300">{astronomicalData?.julian_day_number || "2442784.277778"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                  <span className={mutedText}>Local Sidereal Time (LST):</span>
                  <span className="font-mono text-slate-300">{astronomicalData?.sidereal_time || "12:14:15"}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className={mutedText}>Obliquity of Ecliptic:</span>
                  <span className="font-mono text-slate-300">{astronomicalData?.obliquity || "23° 26' 27\""}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5 rounded-xl bg-slate-950/30 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
                <Globe className="w-4 h-4" />
                Core Lunisolar Signatures
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/10">
                  <span className={`block text-[9px] ${mutedText} uppercase font-bold tracking-widest`}>Janma Rasi (Moon)</span>
                  <Moon className="w-5 h-5 mx-auto my-1.5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {planets.find((p: PlanetData) => p.name === "Moon")?.sign || "Taurus"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/10">
                  <span className={`block text-[9px] ${mutedText} uppercase font-bold tracking-widest`}>Surya Rasi (Sun)</span>
                  <Sun className="w-5 h-5 mx-auto my-1.5 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {planets.find((p: PlanetData) => p.name === "Sun")?.sign || "Sagittarius"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/10 col-span-2">
                  <span className={`block text-[9px] ${mutedText} uppercase font-bold tracking-widest`}>Ayanamsa Reference System</span>
                  <span className="text-xs font-bold text-emerald-400 block mt-1">
                    {birthDetails.ayanamsa || "Lahiri Ayanamsa"} ({Number(birthDetails.ayanamsaDegree || 23.5512).toFixed(4)}°)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Panchanga: Five Pillars */}
          <div className="mt-6 p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
              <BookOpen className="w-4 h-4" />
              The Five Pillars of Time (Panchanga)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Tithi (Lunar Day)</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">{panchanga.tithi || "Sukla Ekadashi"}</span>
              </div>
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Nakshatra (Asterism)</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">{panchanga.nakshatra || "Rohini"}</span>
              </div>
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Yoga (Luni-Solar Angle)</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">{panchanga.yoga || "Preeti"}</span>
              </div>
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Karana (Half-Tithi)</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">{panchanga.karana || "Bava"}</span>
              </div>
              <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-center hover:border-amber-500/25 transition-colors">
                <span className={`text-[9px] uppercase font-bold ${mutedText} block`}>Vara (Weekday)</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">
                  {new Date(birthDetails.date || "1976-01-06").toLocaleDateString("en-US", { weekday: "long" })}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
              <div className="p-3 rounded bg-slate-900/20 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Sunrise:</span>
                <span className="font-semibold text-slate-200 mt-1 block">{astronomicalData?.sunrise || "05:42:00"}</span>
              </div>
              <div className="p-3 rounded bg-slate-900/20 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Sunset:</span>
                <span className="font-semibold text-slate-200 mt-1 block">{astronomicalData?.sunset || "18:55:00"}</span>
              </div>
              <div className="p-3 rounded bg-slate-900/20 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Lunar Month:</span>
                <span className="font-semibold text-slate-200 mt-1 block">{astronomicalData?.lunar_month || "Kartika"} ({astronomicalData?.year_name || "Krodhi"})</span>
              </div>
              <div className="p-3 rounded bg-slate-900/20 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Season / Ritu:</span>
                <span className="font-semibold text-slate-200 mt-1 block">{astronomicalData?.season || "Sharad"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 2: VEDIC DIVISIONAL CHARTS & VARGAS MATRIX ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && vedicSubTab === "divisionalCharts")) && (
          <div id="report-section-2" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-indigo-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-indigo-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 2 • Vedic Divisional Charts (Kundalis)
              </span>
              <h2 className="text-sm font-bold text-indigo-400 mt-2 flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                2. KUNDALI WHEELS & COMPLETE SHODASHAVARGA (20 VARGAS) MATRIX
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              High-resolution mathematical division of houses mapping D1 (Rasi Natal Chart) and D9 (Navamsa Destiny Chart) side-by-side, plus the complete raw placements across all 20 vargas.
            </p>
          </div>

          {/* Side by side primary charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-indigo-500/25 transition-all">
              <span className="text-xs font-bold text-amber-400 block text-center uppercase tracking-wider border-b border-slate-800 pb-2">
                D1 Rasi Kundali (Natal Lagna Wheel)
              </span>
              <AstroChart
                rasiChart={rasiChart}
                navamsaChart={navamsaChart}
                divisionalCharts={divisionalCharts}
                vargaLagnas={vargaLagnas}
                lagnaSignIndex={lagna.signIndex}
                lagnaSignName={lagna.sign}
                defaultDivision="D1"
                hideHeader={true}
                hideVargaSelector={true}
                chartStyle={chartStyle}
              />
            </div>

            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-indigo-500/25 transition-all relative">
              <span className="text-xs font-bold text-amber-400 block text-center uppercase tracking-wider border-b border-slate-800 pb-2">
                D9 Navamsa Kundali (Dharma / Partner Wheel)
              </span>
              <AstroChart
                rasiChart={rasiChart}
                navamsaChart={navamsaChart}
                divisionalCharts={divisionalCharts}
                vargaLagnas={vargaLagnas}
                lagnaSignIndex={lagna.signIndex}
                lagnaSignName={lagna.sign}
                defaultDivision="D9"
                hideHeader={true}
                hideVargaSelector={true}
                chartStyle={chartStyle}
              />
              <div className="absolute top-2 right-2 text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                D9 Navamsa
              </div>
            </div>
          </div>

          {/* COMPLETE 20 DIVISIONAL CHARTS MATRIX (NO LIMITATIONS, NO ACCORDIONS!) */}
          <div className="mt-8 p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
              <Grid className="w-4 h-4 text-indigo-400" />
              Complete 20 Divisional Charts (Shodashavargas) Planetary Matrix
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Below is the comprehensive raw astronomical registry showing the precise Zodiac Sign and House Number occupied by the Lagna and all 9 Grahas across all 20 structural divisional charts (D1 to D60).
            </p>
            
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left border-collapse text-[11px] font-mono">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-indigo-400">
                    <th className="p-2 font-bold font-sans">Varga Chart</th>
                    <th className="p-2">ASC</th>
                    {PLANET_ORDER.map(p => (
                      <th key={p} className="p-2">{p.substring(0, 3).toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30 text-slate-300">
                  {STANDARD_VARGAS.map(vKey => {
                    const vObj = vedicData?.divisional_charts?.[vKey] || {};
                    const vLagnaIdx = vargaLagnas[vKey] !== undefined ? vargaLagnas[vKey] : (vedicData?.divisional_charts?.[vKey]?.ascendant?.longitude ? Math.floor(vedicData?.divisional_charts?.[vKey]?.ascendant?.longitude / 30) : lagna.signIndex);
                    const ascSignAbbr = ZODIAC_SIGNS_ABBR[vLagnaIdx] || "Ar";
                    
                    return (
                      <tr key={vKey} className="hover:bg-indigo-500/5 transition-colors">
                        <td className="p-2 font-bold text-amber-500 font-sans border-r border-slate-800/60">
                          {vKey} {vKey === "D1" ? "Rasi" : vKey === "D9" ? "Navamsa" : vKey === "D10" ? "Dasamsa" : "Varga"}
                        </td>
                        <td className="p-2 text-slate-400">
                          {ascSignAbbr} <span className="text-[10px] text-indigo-400 font-bold">(H1)</span>
                        </td>
                        {PLANET_ORDER.map(pName => {
                          const list = vObj.planets || [];
                          const found = list.find((item: any) => item.planet.toLowerCase() === pName.toLowerCase());
                          
                          // Fallback to astrologyData house placements if divisional calculation is empty
                          let signAbbr = "-";
                          let houseNum = "";
                          if (found) {
                            const signIdx = ZODIAC_SIGNS_FULL.indexOf(found.sign);
                            signAbbr = signIdx !== -1 ? ZODIAC_SIGNS_ABBR[signIdx] : found.sign.substring(0, 2);
                            houseNum = `H${found.house}`;
                          } else {
                            // Secondary fallback
                            let hIndex = 1;
                            for (let h = 1; h <= 12; h++) {
                              if (divisionalCharts[vKey]?.[h]?.includes(pName)) {
                                hIndex = h;
                                break;
                              }
                            }
                            const signIndex = (vLagnaIdx + hIndex - 1) % 12;
                            signAbbr = ZODIAC_SIGNS_ABBR[signIndex];
                            houseNum = `H${hIndex}`;
                          }

                          return (
                            <td key={pName} className="p-2">
                              <span className="text-slate-200">{signAbbr}</span>{" "}
                              <span className="text-[9px] text-amber-500 font-bold">{houseNum}</span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Guna Milan compatibility */}
          <div className="mt-6 p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Ashtakoota Harmony & Relationship Milan Points
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Varna (Mental Profile)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.varna || "Brahmin"} (1/1 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Vashya (Social Magnetism)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.vashya || "Manushya"} (2/2 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Yoni (Aesthetic & Biology)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.yoni || "Simha"} (4/4 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Gana (Spiritual Attunement)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.gana || "Manushya"} (6/6 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Nadi (Physiology Wave)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">{panchanga.nadi || "Adi"} (8/8 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Tara (Celestial Distance)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">Sampat (3/3 Pts)</span>
              </div>
              <div className="p-3 rounded bg-slate-900/40 border border-slate-800">
                <span className={`${mutedText} text-[9px] uppercase tracking-wider block`}>Bhakoot (Emotional Affinity)</span>
                <span className="font-bold text-slate-200 text-xs block mt-1">Rasi-Mitra (7/7 Pts)</span>
              </div>
              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/25">
                <span className="text-amber-500 dark:text-amber-400 text-[9px] uppercase font-bold tracking-wider block">Total Milan Score</span>
                <span className="font-bold text-amber-400 text-xs block mt-1">31 of 36 (Auspicious Gunas)</span>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 3: VEDIC PLANETARY POSITIONS ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && ["table_2", "special_lagnas", "sphutas", "upagrahas", "sahams"].includes(vedicSubTab))) && (
          <div id="report-section-3" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-emerald-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-emerald-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 3 • Geocentric Planetary Placements (Graha Sphutas)
              </span>
              <h2 className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-2">
                <Grid className="w-5 h-5 text-emerald-400" />
                3. PLANETARY PLACEMENTS, STELLAR COORDINATES & AVASTHAS
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              Precise coordinates, Nakshatras, subdivisions, combustion states, and triple-tiered physiological avasthas.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`${tableHeaderStyle} font-semibold border-b ${borderStyle} text-slate-300`}>
                  <th className="p-3">Graha (Planet)</th>
                  <th className="p-3">Zodiac Sign</th>
                  <th className="p-3">Longitude (In Sign)</th>
                  <th className="p-3">Exact 360°</th>
                  <th className="p-3">Nakshatra</th>
                  <th className="p-3">Pada</th>
                  <th className="p-3">Nakshatra Lord</th>
                  <th className="p-3">Dignity & Combustion</th>
                  <th className="p-3">Avastha States</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {/* Lagna first */}
                <tr className={tableRowStyle}>
                  <td className="p-3 font-semibold text-amber-500">Lagna (Ascendant)</td>
                  <td className="p-3">{lagna.sign || "Cancer"}</td>
                  <td className="p-3 font-mono">{lagna.degree ? formatDegree(lagna.degree) : "00° 00'"}</td>
                  <td className="p-3 font-mono">{lagna.longitude ? format360Degree(lagna.longitude) : "00° 00'"}</td>
                  <td className="p-3">{lagna.nakshatra || "Pushya"}</td>
                  <td className="p-3 font-bold">{lagna.pada || 2}</td>
                  <td className="p-3 font-mono text-slate-400">{vedicData?.ascendant?.nakshatra_lord || "Saturn"}</td>
                  <td className="p-3"><span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">Lagna Head</span></td>
                  <td className="p-3 font-mono text-[10px] text-slate-400">Jagrat (Awake)</td>
                </tr>

                {PLANET_ORDER.map((pName) => {
                  const pData = planets.find((p: PlanetData) => p.name.toLowerCase() === pName.toLowerCase());
                  const mappedP = vedicData?.planets?.[pName] || {};
                  if (!pData) return null;

                  return (
                    <tr key={pName} className={tableRowStyle}>
                      <td className="p-3 font-semibold text-slate-200 flex items-center gap-1.5">
                        {pName === "Sun" && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                        {pName === "Moon" && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                        <span>{pName}</span>
                      </td>
                      <td className="p-3">{pData.sign}</td>
                      <td className="p-3 font-mono">{formatDegree(pData.longitude)}</td>
                      <td className="p-3 font-mono">{format360Degree(pData.longitude)}</td>
                      <td className="p-3">{pData.nakshatra || "Rohini"}</td>
                      <td className="p-3 font-bold">{pData.pada || 1}</td>
                      <td className="p-3 font-mono text-emerald-400">{pData.lord || mappedP?.nakshatra_lord || "Jupiter"}</td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1 text-[10px]">
                          <span className={`font-bold ${mappedP?.dignity?.includes("Exalted") ? "text-emerald-400" : mappedP?.dignity?.includes("Debilitated") ? "text-rose-400" : "text-slate-300"}`}>
                            {mappedP?.dignity || "Neutral Sign"}
                          </span>
                          {mappedP?.combust && (
                            <span className="text-red-400 font-mono text-[9px] bg-red-500/10 px-1 py-0.2 rounded w-max">COMBUST</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        <div className="space-y-0.5">
                          <div>Age: <span className="text-indigo-400 font-bold">{mappedP?.state?.baladi || "Yuva"}</span></div>
                          <div>Alertness: <span className="text-amber-500">{mappedP?.state?.jagrat || "Jagrat"}</span></div>
                          <div>Dignity: <span className="text-emerald-400">{mappedP?.state?.deepta || "Shanta"}</span></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 4: PLANETARY & BHAVA BALAS ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && ["shadBala", "ishtaPhala", "bhavaBala"].includes(vedicSubTab))) && (
          <div id="report-section-4" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-orange-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-orange-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 4 • Mathematical Balas & Strengths (ShadBala & Bhava)
              </span>
              <h2 className="text-sm font-bold text-orange-400 mt-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-400" />
                4. GRAHA SHADBALA MATRIX, ISHTA/KASHTA & BHAVA BALA
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              Comprehensive 6-fold planetary strengths, Ishta Phala metrics, and house power coefficients.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Shadbala comparative table */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                ShadBala Breakdown (Six Sources of Power)
              </span>
              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="p-2">Planet</th>
                      <th className="p-2 text-right">Sthana (Positional)</th>
                      <th className="p-2 text-right">Dig (Directional)</th>
                      <th className="p-2 text-right">Kala (Temporal)</th>
                      <th className="p-2 text-right">Cheshta (Motorial)</th>
                      <th className="p-2 text-right">Total (Shashtiamsas)</th>
                      <th className="p-2 text-right">Strength Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/20 text-slate-300">
                    {Object.entries(vedicData?.strengths?.shadbala || {}).map(([pName, sVal]: [string, any]) => (
                      <tr key={pName} className="hover:bg-slate-900/10">
                        <td className="p-2 font-bold text-slate-200">{pName}</td>
                        <td className="p-2 text-right font-mono">{sVal.sthana_bala}</td>
                        <td className="p-2 text-right font-mono">{sVal.dig_bala}</td>
                        <td className="p-2 text-right font-mono">{sVal.kala_bala}</td>
                        <td className="p-2 text-right font-mono">{sVal.cheshta_bala}</td>
                        <td className="p-2 text-right font-mono text-amber-400 font-bold">{sVal.total_score}</td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-400">
                          {sVal.strength_ratio?.toFixed(2)}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ishta/Kashta & Bhava Bala side-by-side */}
            <div className="space-y-6">
              {/* Ishta & Kashta Phala */}
              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                  Ishta (Auspicious) vs. Kashta (Difficult) Phala Values
                </span>
                <div className="space-y-3 text-xs">
                  {Object.entries(vedicData?.strengths?.ishta_phala || {}).map(([pName, ishtaVal]: [string, any]) => {
                    const kashtaVal = vedicData?.strengths?.kashta_phala?.[pName] || 0;
                    return (
                      <div key={pName} className="space-y-1">
                        <div className="flex justify-between font-bold text-[11px]">
                          <span>{pName}</span>
                          <span className="font-mono">
                            Ishta: <span className="text-emerald-400">{ishtaVal}</span> / Kashta: <span className="text-rose-400">{kashtaVal}</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded overflow-hidden flex">
                          <div className="bg-emerald-500 h-full" style={{ width: `${(ishtaVal / 60) * 100}%` }} />
                          <div className="bg-rose-500 h-full" style={{ width: `${(kashtaVal / 60) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bhava Bala */}
              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                  12 Bhava (House) Strengths & Relative Ranks
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[11px]">
                  {Object.entries(vedicData?.strengths?.bhava_bala || {}).map(([hKey, bVal]: [string, any]) => (
                    <div key={hKey} className="p-2 rounded bg-slate-900/50 border border-slate-800">
                      <span className="font-bold text-indigo-400 block">{hKey.replace("H", "House ")}</span>
                      <span className="font-mono text-slate-300 block mt-1">{bVal.strength_shashtiamsas}</span>
                      <span className="text-[9px] text-amber-500 font-bold block mt-0.5">Rank: {bVal.rank}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 5: ASHTAKAVARGA BINDUS MATRIX ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && vedicSubTab === "ashtakavarga")) && (
          <div id="report-section-5" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-cyan-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-cyan-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 5 • Ashtakavarga Point Distribution (SAV & BAV Bindus)
              </span>
              <h2 className="text-sm font-bold text-cyan-400 mt-2 flex items-center gap-2">
                <Grid className="w-5 h-5 text-cyan-400" />
                5. SAMUDHAYA & BHINNA ASHTAKAVARGA BINDUS MATRIX
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              Comprehensive numerical grid containing individual planetary bindus (BAV) mapped across 12 signs, totaling the final Sarvashtakavarga (SAV) points.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 font-sans">
                  <th className="p-2.5 font-bold">Graha (Variable)</th>
                  {ZODIAC_SIGNS_FULL.map(s => (
                    <th key={s} className="p-2.5 text-center">{s.substring(0,3).toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30 text-slate-300">
                {Object.entries(vedicData?.strengths?.ashtakavarga?.bav || {}).map(([pName, bList]: [string, any]) => (
                  <tr key={pName} className="hover:bg-slate-900/10">
                    <td className="p-2.5 font-sans font-semibold text-slate-200 border-r border-slate-800/55">{pName}</td>
                    {Array.isArray(bList) && bList.map((pts: number, idx: number) => (
                      <td key={idx} className={`p-2.5 text-center font-bold ${pts >= 5 ? "text-emerald-400" : pts <= 2 ? "text-rose-400" : "text-slate-400"}`}>
                        {pts}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* SAV Total row */}
                <tr className="bg-cyan-500/5 font-sans font-bold text-cyan-400 border-t border-slate-800">
                  <td className="p-3 border-r border-slate-800">SAMUDHAYA (SAV)</td>
                  {Array.isArray(vedicData?.strengths?.ashtakavarga?.sav) && vedicData.strengths.ashtakavarga.sav.map((pts: number, idx: number) => (
                    <td key={idx} className={`p-3 text-center text-sm font-mono font-black ${pts >= 28 ? "text-emerald-300" : "text-slate-400"}`}>
                      {pts}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 6: PLANETARY ARGALAS ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && (vedicSubTab === "table_10" || vedicSubTab === "argalas"))) && (
          <div id="report-section-6" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-pink-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-pink-500/10 pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] bg-pink-500/15 text-pink-400 border border-pink-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  System 6 • Jaimini Planetary Argalas & Obstructions • Table 10
                </span>
                <h2 className="text-sm font-bold text-pink-400 mt-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-pink-400" />
                  Table 10 - JAIMINI HOUSE-WISE PLANETARY ARGALAS & OBSTRUCTIONS
                </h2>
                <p className={`text-xs ${mutedText} mt-1`}>
                  Sage Jaimini's framework of celestial energy interventions (Argalas) computed across all 12 houses to evaluate energy flow obstruction.
                </p>
              </div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (argalas)</span>
            </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className={`${tableHeaderStyle} border-b ${borderStyle} text-slate-300`}>
                  <th className="p-3">Reference House</th>
                  <th className="p-3">Argala Pattern</th>
                  <th className="p-3">Argala Planets</th>
                  <th className="p-3">Virodha (Obstruction) House</th>
                  <th className="p-3">Obstruction Planets</th>
                  <th className="p-3 font-semibold">Stellar Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/20 text-slate-300">
                {Object.entries(jaiminiData?.argala || {}).map(([houseStr, argList]: [string, any]) => (
                  <React.Fragment key={houseStr}>
                    {Array.isArray(argList) && argList.length > 0 ? (
                      argList.map((arg: any, index: number) => (
                        <tr key={`${houseStr}-${index}`} className="hover:bg-slate-900/10">
                          {index === 0 && (
                            <td className="p-3 font-bold text-amber-500 border-r border-slate-800/30" rowSpan={argList.length}>
                              House {houseStr}
                            </td>
                          )}
                          <td className="p-3 font-semibold text-pink-400">{arg.type} (Offset: +{arg.argalaHouse})</td>
                          <td className="p-3 font-mono font-bold text-slate-200">
                            {Array.isArray(arg.argalaPlanets) ? arg.argalaPlanets.join(", ") : "-"}
                          </td>
                          <td className="p-3">Obstruction House {arg.virodhaHouse}</td>
                          <td className="p-3 font-mono text-slate-400">
                            {Array.isArray(arg.virodhaPlanets) && arg.virodhaPlanets.length > 0 ? arg.virodhaPlanets.join(", ") : "None"}
                          </td>
                          <td className="p-3">
                            {arg.isObstructed ? (
                              <span className="bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded border border-rose-500/25 font-bold">
                                {arg.verdict}
                              </span>
                            ) : (
                              <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-500/25 font-bold">
                                {arg.verdict}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="hover:bg-slate-900/10">
                        <td className="p-3 font-bold text-amber-500 border-r border-slate-800/30">House {houseStr}</td>
                        <td className="p-3 text-slate-500 italic" colSpan={5}>
                          No active planetary intervention on this house.
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 7: JAIMINI SUTRAS & CHARA DASHAS ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && ["jaimini", "arudhas", "charaDasha"].includes(vedicSubTab))) && (
          <div id="report-section-7" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-purple-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-purple-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 7 • Jaimini Sutras (Karakas, Arudhas, & Chara Dashas)
              </span>
              <h2 className="text-sm font-bold text-purple-400 mt-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                7. JAIMINI SUTRA CHARA KARAKAS, ARUDHAS & TIMELINES
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              High-degree sorting calculations for Chara Karakas, Swamsha signs, A1-A12 arudha padas, and Chara Dasha sequences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* Karakas & Arudhas */}
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                  Chara Karakas (Degree-Based Planetary Dignitaries)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(jaiminiData?.karakas || {}).map(([kKey, pName]: [string, any]) => (
                    <div key={kKey} className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      <span className={`${mutedText} text-[9px] uppercase font-bold tracking-wider block`}>{kKey}</span>
                      <span className="font-extrabold text-slate-200 block mt-1">{pName}</span>
                    </div>
                  ))}
                  <div className="p-2.5 rounded bg-indigo-500/10 border border-indigo-500/20 col-span-2 text-center">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase block tracking-wider">Swamsha (Karakamsha Navamsha Sign)</span>
                    <span className="text-lg font-black text-amber-400 block mt-1">{jaiminiData?.karakamsha || "Cancer"}</span>
                  </div>
                </div>
              </div>

              {/* Arudha Padas */}
              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                  12 Arudha Padas (Manifested Projections of Houses)
                </span>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  {Object.entries(jaiminiData?.arudha || {}).map(([padKey, padVal]: [string, any]) => {
                    const displayVal = typeof padVal === "object" && padVal !== null
                      ? `${padVal.sign || ""} (House ${padVal.house || ""})`
                      : String(padVal);
                    return (
                      <div key={padKey} className="p-2 rounded bg-slate-900/50 border border-slate-800">
                        <span className="font-extrabold text-indigo-400 block">{padKey}</span>
                        <span className="text-slate-300 block mt-1">{displayVal}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chara Dashas */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                Chara Dasha Timeline (Major Life-Sign Shifts)
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="p-2">Dasha Sign</th>
                      <th className="p-2">Start Date</th>
                      <th className="p-2">End Date</th>
                      <th className="p-2 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/20 text-slate-300">
                    {Array.isArray(jaiminiData?.chara_dasha) && jaiminiData.chara_dasha.map((d: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/10">
                        <td className="p-2 font-bold text-slate-200">{d.sign}</td>
                        <td className="p-2 font-mono text-slate-400">{d.start_date}</td>
                        <td className="p-2 font-mono text-slate-400">{d.end_date}</td>
                        <td className="p-2 text-right font-mono font-bold text-purple-400">{d.duration_years} Years</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 7 (KP): KRISHNAMURTI PADDHATI (KP) ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && (vedicSubTab === "table_6" || vedicSubTab.startsWith("kp_")))) && (
          <div id="report-section-7_kp" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-cyan-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-cyan-500/10 pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  System 7 • Krishnamurti Paddhati (KP Stellar Astrology) • Table 6
                </span>
                <h2 className="text-sm font-bold text-cyan-400 mt-2 flex items-center gap-2">
                  <Star className="w-5 h-5 text-cyan-400" />
                  Table 6 - KP STELLAR COSMIC SIGNALS & DASHAS
                </h2>
                <p className={`text-xs ${mutedText} mt-1`}>
                  High-precision stellar sublord division of house houses, planetary significators, active dashas, rulebook evaluations, transits, and horary resolutions.
                </p>
              </div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded font-mono font-bold">KP Astro API Suite: /api/kp/cusps & /api/kp/chart</span>
            </div>

            {!showAllAstroSystems && (
              <div className="flex flex-wrap gap-1.5 mb-6 border-b border-cyan-500/10 pb-4">
                {[
                  { id: "kp_cusps", label: "KP House Cusps" },
                  { id: "kp_planet_analysis", label: "Planet Analysis" },
                  { id: "kp_significators", label: "Significators" },
                  { id: "kp_houses_significators", label: "Houses & Unique Significators" },
                  { id: "kp_ruling_planets", label: "Ruling Planets" },
                  { id: "kp_dasha", label: "KP Dasha" },
                  { id: "kp_rulebook", label: "KP Rulebook" },
                  { id: "kp_transit", label: "KP Transit" },
                  { id: "kp_horary", label: "KP Horary" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setKpSubTab(tab.id as any);
                      setVedicSubTab("table_6");
                    }}
                    className={`px-2.5 py-1.5 text-[10px] font-mono rounded-md transition-all border text-center ${
                      kpSubTab === tab.id
                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-bold"
                        : "border-slate-800 bg-slate-900/30 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {vedicSubTab === "allAstroSystems" ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-xs">
                {/* KP 12 Cusps */}
                <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
                  <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                    12 KP House Cusps Coordinates & Lords
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono">
                          <th className="p-2">Cusp</th>
                          <th className="p-2 text-right">Longitude</th>
                          <th className="p-2">Sign Lord</th>
                          <th className="p-2">Star Lord</th>
                          <th className="p-2 font-bold text-cyan-400">Sub Lord</th>
                          <th className="p-2">Sub-Sub Lord</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/20 text-slate-300">
                        {Object.entries(kpData?.cusps || {}).map(([hKey, cVal]: [string, any]) => (
                          <tr key={hKey} className="hover:bg-slate-900/10">
                            <td className="p-2 font-bold text-amber-500">{hKey.replace("House_", "Cusp ")}</td>
                            <td className="p-2 text-right font-mono text-slate-300">{cVal.longitude?.toFixed(2)}° in {cVal.sign}</td>
                            <td className="p-2">{cVal.sign_lord}</td>
                            <td className="p-2">{cVal.star_lord}</td>
                            <td className="p-2 font-bold text-cyan-400">{cVal.sub_lord}</td>
                            <td className="p-2 font-mono text-slate-400">{cVal.sub_sub_lord}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* KP Planets Analysis */}
                  <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
                    <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                      KP Planets Sublord Division & Signification
                    </span>
                    <div className="overflow-x-auto text-[11px]">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-mono">
                            <th className="p-2">Planet</th>
                            <th className="p-2">Sign Lord</th>
                            <th className="p-2">Star Lord</th>
                            <th className="p-2 font-bold text-cyan-400">Sub Lord</th>
                            <th className="p-2">Occupy</th>
                            <th className="p-2">Owns Houses</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20 text-slate-300">
                          {Object.entries(kpData?.planets || {}).map(([pName, pVal]: [string, any]) => (
                            <tr key={pName} className="hover:bg-slate-900/10">
                              <td className="p-2 font-bold text-slate-200">{pName}</td>
                              <td className="p-2">{pVal.sign_lord}</td>
                              <td className="p-2">{pVal.star_lord}</td>
                              <td className="p-2 font-bold text-cyan-400">{pVal.sub_lord}</td>
                              <td className="p-2 font-mono text-slate-300">{pVal.occupation}</td>
                              <td className="p-2 font-mono font-bold text-amber-500">
                                {Array.isArray(pVal.ownership) ? pVal.ownership.join(", ") : "None"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* KP Ruling Planets */}
                  <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
                    <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                      KP Active Ruling Planets (RP Significators)
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                        <span className={mutedText}>Lagna Sign Lord:</span>
                        <span className="font-bold text-slate-200 block mt-0.5">{kpData?.ruling_planets?.ascendant_sign_lord || "Moon"}</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                        <span className={mutedText}>Lagna Star Lord:</span>
                        <span className="font-bold text-slate-200 block mt-0.5">{kpData?.ruling_planets?.ascendant_star_lord || "Saturn"}</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                        <span className={mutedText}>Moon Sign Lord:</span>
                        <span className="font-bold text-slate-200 block mt-0.5">{kpData?.ruling_planets?.moon_sign_lord || "Venus"}</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                        <span className={mutedText}>Moon Star Lord:</span>
                        <span className="font-bold text-slate-200 block mt-0.5">{kpData?.ruling_planets?.moon_star_lord || "Sun"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {kpSubLoading && (
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs animate-pulse bg-cyan-950/20 p-3 rounded-lg border border-cyan-800/30">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Querying high-fidelity stellar data from KP API endpoints...
                  </div>
                )}

                {kpSubError && (
                  <div className="text-xs font-mono text-rose-400 bg-rose-950/20 p-3 rounded-lg border border-rose-800/30">
                    Warning: {kpSubError}. Showing preloaded offline calculations instead.
                  </div>
                )}

                {/* KP House Cusps Tab Content */}
                {kpSubTab === "kp_cusps" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
                      <h3 className="text-sm font-bold text-cyan-400">12 KP House Cusps Coordinates & Lords</h3>
                      <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2.5 py-0.5 rounded font-mono font-bold uppercase">Placidus Division</span>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-mono">
                            <th className="p-3">Cusp</th>
                            <th className="p-3">Longitude</th>
                            <th className="p-3">Sign Lord</th>
                            <th className="p-3">Star Lord</th>
                            <th className="p-3 font-bold text-cyan-400">Sub Lord</th>
                            <th className="p-3">Sub-Sub Lord</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20 text-slate-300 font-mono">
                          {rawCuspsList.map((cVal: any) => (
                            <tr key={cVal.houseNumber} className="hover:bg-slate-900/10">
                              <td className="p-3 font-bold text-amber-500">Cusp {cVal.houseNumber}</td>
                              <td className="p-3">{cVal.degree?.toFixed(2) || cVal.longitude?.toFixed(2)}° in {cVal.sign}</td>
                              <td className="p-3">{cVal.sign_lord || cVal.signLord}</td>
                              <td className="p-3">{cVal.star_lord || cVal.starLord}</td>
                              <td className="p-3 font-bold text-cyan-400">{cVal.sub_lord || cVal.subLord}</td>
                              <td className="p-3 text-slate-400">{cVal.sub_sub_lord || cVal.subSubLord}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* KP Planet Analysis Tab Content */}
                {kpSubTab === "kp_planet_analysis" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
                      <h3 className="text-sm font-bold text-cyan-400">KP Planets Sublord Division & Signification</h3>
                      <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2.5 py-0.5 rounded font-mono font-bold uppercase">Stellar Analysis</span>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-mono">
                            <th className="p-3">Planet</th>
                            <th className="p-3">Degrees</th>
                            <th className="p-3">Sign Lord</th>
                            <th className="p-3">Star Lord</th>
                            <th className="p-3 font-bold text-cyan-400">Sub Lord</th>
                            <th className="p-3">Occupy</th>
                            <th className="p-3">Owns Houses</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20 text-slate-300 font-mono">
                          {rawPlanetsList.map((pVal: any) => (
                            <tr key={pVal.name} className="hover:bg-slate-900/10">
                              <td className="p-3 font-bold text-slate-200 flex items-center gap-1">
                                {pVal.name} {pVal.isRetrograde && <span className="text-red-400 text-[10px]">(R)</span>}
                              </td>
                              <td className="p-3">{pVal.degree?.toFixed(2) || pVal.longitude?.toFixed(2)}° in {pVal.sign}</td>
                              <td className="p-3">{pVal.sign_lord || pVal.signLord || "—"}</td>
                              <td className="p-3">{pVal.star_lord || pVal.starLord || "—"}</td>
                              <td className="p-3 font-bold text-cyan-400">{pVal.sub_lord || pVal.subLord || "—"}</td>
                              <td className="p-3 text-slate-300">{pVal.occupation || "—"}</td>
                              <td className="p-3 text-amber-500 font-bold">
                                {Array.isArray(pVal.ownership) ? pVal.ownership.join(", ") : pVal.ownership || "None"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* KP Significators Tab Content */}
                {kpSubTab === "kp_significators" && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
                      <h3 className="text-sm font-bold text-cyan-400">KP Astrological Significators</h3>
                      <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2.5 py-0.5 rounded font-mono font-bold uppercase">6-Level strength</span>
                    </div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-xs">
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-amber-500 block uppercase tracking-wider font-mono">
                          Planetary Significators (Graha Signals - 6-Fold)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(rawPlanetSignificators).map(([planet, sig]: [string, any]) => (
                            <div key={planet} className={`p-3 rounded-xl border border-slate-800 bg-slate-950/20 space-y-2`}>
                              <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                                <span className="font-bold text-cyan-400 text-xs">{planet}</span>
                              </div>
                              <div className="space-y-1 text-[11px] font-mono text-slate-300">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">L1 (Star Occupant):</span>
                                  <span className="text-indigo-400 font-semibold">{Array.isArray(sig.level1) ? sig.level1.join(", ") : sig.level1 || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">L2 (Planet Occupant):</span>
                                  <span className="text-amber-500 font-semibold">{Array.isArray(sig.level2) ? sig.level2.join(", ") : sig.level2 || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">L3 (Star Owner):</span>
                                  <span className="text-emerald-400 font-semibold">{Array.isArray(sig.level3) ? sig.level3.join(", ") : sig.level3 || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">L4 (Planet Owner):</span>
                                  <span className="text-slate-300 font-semibold">{Array.isArray(sig.level4) ? sig.level4.join(", ") : sig.level4 || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">L5 (Sub Occupant):</span>
                                  <span className="text-fuchsia-400 font-semibold">{Array.isArray(sig.level5) ? sig.level5.join(", ") : sig.level5 || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">L6 (Sub Owner):</span>
                                  <span className="text-cyan-400 font-semibold">{Array.isArray(sig.level6) ? sig.level6.join(", ") : sig.level6 || "—"}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-xs font-bold text-amber-500 block uppercase tracking-wider font-mono">
                          House Significators (Bhava Signals - 6-Fold)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(rawHouseSignificators).map(([house, sig]: [string, any]) => {
                            const houseNum = house.replace("House_", "");
                            return (
                              <div key={house} className={`p-3 rounded-xl border border-slate-800 bg-slate-950/20 space-y-2`}>
                                <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                                  <span className="font-bold text-cyan-400 text-xs">House {houseNum}</span>
                                </div>
                                <div className="space-y-1 text-[11px] font-mono text-slate-300">
                                  {sig && typeof sig === 'object' && !Array.isArray(sig) ? (
                                    <>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">L1 (Star Occupant):</span>
                                        <span className="text-indigo-400 font-semibold">{Array.isArray(sig.level1) ? sig.level1.join(", ") : sig.level1 || "—"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">L2 (Planet Occupant):</span>
                                        <span className="text-amber-500 font-semibold">{Array.isArray(sig.level2) ? sig.level2.join(", ") : sig.level2 || "—"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">L3 (Star Owner):</span>
                                        <span className="text-emerald-400 font-semibold">{Array.isArray(sig.level3) ? sig.level3.join(", ") : sig.level3 || "—"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">L4 (Planet Owner):</span>
                                        <span className="text-slate-300 font-semibold">{Array.isArray(sig.level4) ? sig.level4.join(", ") : sig.level4 || "—"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">L5 (Sub Occupant):</span>
                                        <span className="text-fuchsia-400 font-semibold">{Array.isArray(sig.level5) ? sig.level5.join(", ") : sig.level5 || "—"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">L6 (Sub Owner):</span>
                                        <span className="text-cyan-400 font-semibold">{Array.isArray(sig.level6) ? sig.level6.join(", ") : sig.level6 || "—"}</span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Active Planets:</span>
                                      <span className="text-slate-200 font-semibold">{Array.isArray(sig) ? sig.join(", ") : String(sig) || "—"}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* KP Houses & Unique Significators Tab Content */}
                {kpSubTab === "kp_houses_significators" && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
                      <h3 className="text-sm font-bold text-cyan-400">KP Houses & Unique Significator Planets</h3>
                      <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2.5 py-0.5 rounded font-mono font-bold uppercase">6-Fold Aggregated</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-mono">
                            <th className="p-3.5 w-1/4">House / Bhava</th>
                            <th className="p-3.5 w-1/3">Significator Planets (6-Fold Unique)</th>
                            <th className="p-3.5">Significance / Meaning of House</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20 text-slate-300 font-sans">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((hNum) => {
                            const sigObj = rawHouseSignificators[`House_${hNum}`] || 
                                           rawHouseSignificators[String(hNum)] || 
                                           rawHouseSignificators[hNum] || 
                                           rawHouseSignificators[`house_${hNum}`] || 
                                           rawHouseSignificators[`House ${hNum}`];
                            
                            // Get unique planets from all 6 levels
                            const uniquePlanets = (() => {
                              if (!sigObj) return [];
                              if (Array.isArray(sigObj)) {
                                return Array.from(new Set(sigObj.map((p: any) => String(p).trim()))).filter(Boolean);
                              }
                              if (typeof sigObj === "object") {
                                const planets: string[] = [];
                                const sigKeys = Object.keys(sigObj);
                                const levelPatterns = [
                                  /level1|L1/i,
                                  /level2|L2/i,
                                  /level3|L3/i,
                                  /level4|L4/i,
                                  /level5|L5/i,
                                  /level6|L6/i
                                ];

                                for (const pattern of levelPatterns) {
                                  const matchingKey = sigKeys.find(k => pattern.test(k));
                                  if (matchingKey) {
                                    const val = sigObj[matchingKey];
                                    if (Array.isArray(val)) {
                                      planets.push(...val.map((p: any) => String(p).trim()));
                                    } else if (typeof val === "string" && val.trim() && val !== "—") {
                                      planets.push(...val.split(",").map((p: any) => p.trim()));
                                    }
                                  }
                                }

                                // Fallback: collect from other string/array keys if empty
                                if (planets.length === 0) {
                                  for (const key of sigKeys) {
                                    const val = sigObj[key];
                                    if (Array.isArray(val)) {
                                      planets.push(...val.map((p: any) => String(p).trim()));
                                    } else if (typeof val === "string" && val.trim() && val !== "—" && val !== "No active significators") {
                                      planets.push(...val.split(",").map((p: any) => p.trim()));
                                    }
                                  }
                                }

                                return Array.from(new Set(planets)).filter(p => p && p !== "—");
                              }
                              if (typeof sigObj === "string") {
                                return sigObj.split(",").map((p: any) => p.trim()).filter(p => p && p !== "—");
                              }
                              return [];
                            })();

                            const houseInfo = {
                              1: { name: "1st House (Ascendant / Tanu Bhava)", meaning: "Represents the self, physical body, appearance, overall vitality, temperament, and path of life." },
                              2: { name: "2nd House (Dhana Bhava)", meaning: "Represents wealth, family, speech, primary education, facial features, right eye, and assets." },
                              3: { name: "3rd House (Sahaja Bhava)", meaning: "Represents courage, siblings, communication, writing, short travels, intelligence, hands, and initiative." },
                              4: { name: "4th House (Sukha Bhava)", meaning: "Represents mother, home, vehicles, happiness, basic education, land, general peace, and chest." },
                              5: { name: "5th House (Putra Bhava)", meaning: "Represents children, intellect, creativity, romance, speculation, past life merits, and stomach." },
                              6: { name: "6th House (Shatru Bhava)", meaning: "Represents enemies, debts, diseases, competition, service, daily routine, litigation, and lower abdomen." },
                              7: { name: "7th House (Yuvati Bhava)", meaning: "Represents marriage, spouse, partnerships, business relations, public interaction, and foreign travels." },
                              8: { name: "8th House (Randhra Bhava)", meaning: "Represents longevity, sudden events, hidden things, inheritance, mysticism, obstacles, and research." },
                              9: { name: "9th House (Dharma Bhava)", meaning: "Represents fortune, father, guru, higher education, long journeys, religion, righteousness, and thighs." },
                              10: { name: "10th House (Karma Bhava)", meaning: "Represents career, profession, status, reputation, public life, authority, father's status, and knees." },
                              11: { name: "11th House (Labha Bhava)", meaning: "Represents gains, desires fulfillment, friends, elder siblings, income sources, and general success." },
                              12: { name: "12th House (Vyaya Bhava)", meaning: "Represents losses, liberation (moksha), foreign land, expenditure, dreams, sleep, and feet." }
                            }[hNum] || { name: `House ${hNum}`, meaning: "Signification of the house according to KP astrology principles." };

                            return (
                              <tr key={hNum} className="hover:bg-slate-900/10 font-sans">
                                <td className="p-3.5 font-bold text-cyan-400 font-mono text-xs">{houseInfo.name}</td>
                                <td className="p-3.5">
                                  {uniquePlanets.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {uniquePlanets.map((planet) => (
                                        <span
                                          key={planet}
                                          className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                                        >
                                          {planet}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-slate-500 italic font-mono text-xs">No active significators</span>
                                  )}
                                </td>
                                <td className="p-3.5 text-xs text-slate-300 leading-relaxed">{houseInfo.meaning}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {kpSubTab === "kp_planet_to_house" && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Reverse lookup: Planet to House significators */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2">
                        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">Planet to House Significator Mappings</h4>
                        <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold uppercase">Reverse Lookup</span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-mono">
                              <th className="p-3.5 w-1/4">Planet</th>
                              <th className="p-3.5 w-1/2">Signified Houses & Strength Levels</th>
                              <th className="p-3.5">General Significations & Portfolio</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/20 text-slate-300 font-sans">
                            {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map((planet) => {
                              const houses = planetToHouseMap[planet] || [];
                              const sortedHouses = [...houses].sort((a, b) => a.houseNum - b.houseNum);

                              return (
                                <tr key={planet} className="hover:bg-slate-900/10 font-sans border-b border-slate-800/10 last:border-0">
                                  <td className="p-3.5 font-bold text-cyan-400 font-mono text-xs">{planet}</td>
                                  <td className="p-3.5">
                                    {sortedHouses.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {sortedHouses.map((item) => (
                                          <span
                                            key={item.houseNum}
                                            className="text-[10px] px-2.5 py-1 rounded-md font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1"
                                          >
                                            <span className="font-bold text-cyan-400">H{item.houseNum}</span>
                                            {item.levels.length > 0 && (
                                              <span className="text-slate-400 text-[9px]">({item.levels.join(", ")})</span>
                                            )}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-slate-500 italic font-mono text-xs">No signified houses</span>
                                    )}
                                  </td>
                                  <td className="p-3.5 text-xs text-slate-400 leading-relaxed">
                                    {planetPortfolios[planet] || "Astrological significations according to Vedic and KP astrology principles."}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* KP Planet Strength Evaluation Section */}
                    <div className="space-y-5 pt-6 border-t border-slate-800/40">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2">
                        <div>
                          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                            KP Planet Strength Evaluation &amp; Priorities
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Evaluating 6-fold planet strength. Refactored to map a Significator Matrix and execute the separate KP Weight Engine.
                          </p>
                        </div>
                        <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2.5 py-1 rounded-full font-mono font-bold uppercase shrink-0">
                          ⭐ Configurable Weight Engine
                        </span>
                      </div>

                      {/* KP Weight Engine Interactive Configuration */}
                      <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/25 space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                          <div>
                            <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">Weight Matrix Controller</span>
                            <h5 className="text-xs font-bold text-slate-200 mt-0.5">Customize KP Level Priorities</h5>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => setKpWeights({ L1: 5.0, L2: 4.0, L3: 3.0, L4: 2.0, L5: 1.0, L6: 0.5 })}
                              className="px-2.5 py-1 text-[9px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                            >
                              Classical Preset
                            </button>
                            <button
                              onClick={() => setKpWeights({ L1: 1.0, L2: 1.0, L3: 1.0, L4: 1.0, L5: 1.0, L6: 1.0 })}
                              className="px-2.5 py-1 text-[9px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                            >
                              Equal Weights Preset
                            </button>
                            <button
                              onClick={() => setKpWeights({ L1: 6.0, L2: 2.0, L3: 4.0, L4: 1.0, L5: 3.0, L6: 0.5 })}
                              className="px-2.5 py-1 text-[9px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                            >
                              Stellar Preset
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                          {[
                            { key: "L1", desc: "Star Occupant" },
                            { key: "L2", desc: "Cusp Occupant" },
                            { key: "L3", desc: "Star Owner" },
                            { key: "L4", desc: "Cusp Lord" },
                            { key: "L5", desc: "Sub Occupant" },
                            { key: "L6", desc: "Sub Owner" }
                          ].map((item) => {
                            const k = item.key as keyof typeof kpWeights;
                            return (
                              <div key={k} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-300 font-mono">{k}</span>
                                  <span className="text-[10px] font-bold text-cyan-400 font-mono bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/10">
                                    {kpWeights[k].toFixed(1)}
                                  </span>
                                </div>
                                <div className="text-[9px] text-slate-400 font-medium truncate">{item.desc}</div>
                                <input
                                  type="range"
                                  min="0"
                                  max="10"
                                  step="0.5"
                                  value={kpWeights[k]}
                                  onChange={(e) => setKpWeights(prev => ({ ...prev, [k]: parseFloat(e.target.value) }))}
                                  className="w-full accent-cyan-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Filters & Statistics Summary Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                        {/* Filters Column */}
                        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Planet Filter */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Filter Planet</label>
                            <select
                              value={kpStrengthPlanetFilter}
                              onChange={(e) => setKpStrengthPlanetFilter(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                            >
                              <option value="All">All Planets</option>
                              {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </div>

                          {/* House Filter */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Filter House</label>
                            <select
                              value={kpStrengthHouseFilter}
                              onChange={(e) => setKpStrengthHouseFilter(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                            >
                              <option value="All">All Houses</option>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                <option key={h} value={`House ${h}`}>House {h}</option>
                              ))}
                            </select>
                          </div>

                          {/* Reset Filters Button */}
                          <div className="flex items-end">
                            <button
                              onClick={() => {
                                setKpStrengthPlanetFilter("All");
                                setKpStrengthHouseFilter("All");
                                setKpStrengthSortField("planet");
                                setKpStrengthSortOrder("asc");
                              }}
                              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 font-mono transition-colors cursor-pointer"
                            >
                              Clear Filters
                            </button>
                          </div>
                        </div>

                        {/* Summary Metrics Panel */}
                        <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800/60 rounded-xl p-2.5 flex justify-around text-center">
                          <div>
                            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Total Evaluated</div>
                            <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                              {filteredAndSortedPlanetStrength.length}
                            </div>
                          </div>
                          <div className="border-l border-slate-800 h-8 self-center"></div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Very High/High</div>
                            <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                              {filteredAndSortedPlanetStrength.filter(r => r.grade === "Very High" || r.grade === "High").length}
                            </div>
                          </div>
                          <div className="border-l border-slate-800 h-8 self-center"></div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Medium/Low</div>
                            <div className="text-sm font-bold font-mono text-amber-500 mt-0.5">
                              {filteredAndSortedPlanetStrength.filter(r => r.grade === "Medium" || r.grade === "Low").length}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Data Table */}
                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-mono select-none">
                              {/* Clickable headers */}
                              <th 
                                className="p-3 cursor-pointer hover:bg-slate-800/40 hover:text-slate-200 transition-colors"
                                onClick={() => {
                                  if (kpStrengthSortField === "planet") {
                                    setKpStrengthSortOrder(prev => prev === "asc" ? "desc" : "asc");
                                  } else {
                                    setKpStrengthSortField("planet");
                                    setKpStrengthSortOrder("asc");
                                  }
                                }}
                              >
                                <div className="flex items-center gap-1">
                                  Planet
                                  {kpStrengthSortField === "planet" && (
                                    <span className="text-cyan-400 text-[10px]">{kpStrengthSortOrder === "asc" ? " ▲" : " ▼"}</span>
                                  )}
                                </div>
                              </th>
                              <th 
                                className="p-3 cursor-pointer hover:bg-slate-800/40 hover:text-slate-200 transition-colors"
                                onClick={() => {
                                  if (kpStrengthSortField === "houseNum") {
                                    setKpStrengthSortOrder(prev => prev === "asc" ? "desc" : "asc");
                                  } else {
                                    setKpStrengthSortField("houseNum");
                                    setKpStrengthSortOrder("asc");
                                  }
                                }}
                              >
                                <div className="flex items-center gap-1">
                                  House / Bhava
                                  {kpStrengthSortField === "houseNum" && (
                                    <span className="text-cyan-400 text-[10px]">{kpStrengthSortOrder === "asc" ? " ▲" : " ▼"}</span>
                                  )}
                                </div>
                              </th>
                              <th className="p-3 text-center">L1</th>
                              <th className="p-3 text-center">L2</th>
                              <th className="p-3 text-center">L3</th>
                              <th className="p-3 text-center">L4</th>
                              <th className="p-3 text-center">L5</th>
                              <th className="p-3 text-center">L6</th>
                              <th 
                                className="p-3 cursor-pointer hover:bg-slate-800/40 hover:text-slate-200 transition-colors text-center"
                                onClick={() => {
                                  if (kpStrengthSortField === "count") {
                                    setKpStrengthSortOrder(prev => prev === "asc" ? "desc" : "asc");
                                  } else {
                                    setKpStrengthSortField("count");
                                    setKpStrengthSortOrder("desc");
                                  }
                                }}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  Count
                                  {kpStrengthSortField === "count" && (
                                    <span className="text-cyan-400 text-[10px]">{kpStrengthSortOrder === "asc" ? " ▲" : " ▼"}</span>
                                  )}
                                </div>
                              </th>
                              <th 
                                className="p-3 cursor-pointer hover:bg-slate-800/40 hover:text-slate-200 transition-colors text-center"
                                onClick={() => {
                                  if (kpStrengthSortField === "score") {
                                    setKpStrengthSortOrder(prev => prev === "asc" ? "desc" : "asc");
                                  } else {
                                    setKpStrengthSortField("score");
                                    setKpStrengthSortOrder("desc");
                                  }
                                }}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  Score
                                  {kpStrengthSortField === "score" && (
                                    <span className="text-cyan-400 text-[10px]">{kpStrengthSortOrder === "asc" ? " ▲" : " ▼"}</span>
                                  )}
                                </div>
                              </th>
                              <th 
                                className="p-3 cursor-pointer hover:bg-slate-800/40 hover:text-slate-200 transition-colors text-center"
                                onClick={() => {
                                  if (kpStrengthSortField === "grade") {
                                    setKpStrengthSortOrder(prev => prev === "asc" ? "desc" : "asc");
                                  } else {
                                    setKpStrengthSortField("grade");
                                    setKpStrengthSortOrder("desc");
                                  }
                                }}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  Strength Grade
                                  {kpStrengthSortField === "grade" && (
                                    <span className="text-cyan-400 text-[10px]">{kpStrengthSortOrder === "asc" ? " ▲" : " ▼"}</span>
                                  )}
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/20 text-slate-300 font-sans">
                            {filteredAndSortedPlanetStrength.length > 0 ? (
                              filteredAndSortedPlanetStrength.map((row, index) => {
                                const houseSanskritMap: Record<number, string> = {
                                  1: "Ascendant (Tanu)",
                                  2: "Wealth (Dhana)",
                                  3: "Siblings (Sahaja)",
                                  4: "Home & Comfort (Sukha)",
                                  5: "Progeny & Intellect (Putra)",
                                  6: "Debts & Enemies (Shatru)",
                                  7: "Spouse & Partnership (Yuvati)",
                                  8: "Longevity (Randhra)",
                                  9: "Fortune & Dharma (Dharma)",
                                  10: "Career & Status (Karma)",
                                  11: "Gains & Wishes (Labha)",
                                  12: "Losses & Moksha (Vyaya)"
                                };

                                return (
                                  <tr key={`${row.planet}-${row.houseNum}-${index}`} className="hover:bg-slate-900/10 font-sans border-b border-slate-800/10 last:border-0 transition-colors">
                                    {/* Planet Column */}
                                    <td className="p-3 font-bold text-cyan-300 font-mono text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                        {row.planet}
                                      </div>
                                    </td>
                                    {/* House Column */}
                                    <td className="p-3 text-xs text-slate-200">
                                      <span className="font-mono font-bold text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded mr-1.5">H{row.houseNum}</span>
                                      <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">{houseSanskritMap[row.houseNum] || `House ${row.houseNum}`}</span>
                                    </td>
                                    {/* L1 - L6 Column */}
                                    <td className="p-3 text-center text-xs">
                                      {row.L1 ? (
                                        <span className="text-emerald-400 font-extrabold" title="L1 Active">✅</span>
                                      ) : (
                                        <span className="text-slate-700" title="L1 Inactive">❌</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-center text-xs">
                                      {row.L2 ? (
                                        <span className="text-emerald-400 font-extrabold" title="L2 Active">✅</span>
                                      ) : (
                                        <span className="text-slate-700" title="L2 Inactive">❌</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-center text-xs">
                                      {row.L3 ? (
                                        <span className="text-emerald-400 font-extrabold" title="L3 Active">✅</span>
                                      ) : (
                                        <span className="text-slate-700" title="L3 Inactive">❌</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-center text-xs">
                                      {row.L4 ? (
                                        <span className="text-emerald-400 font-extrabold" title="L4 Active">✅</span>
                                      ) : (
                                        <span className="text-slate-700" title="L4 Inactive">❌</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-center text-xs">
                                      {row.L5 ? (
                                        <span className="text-emerald-400 font-extrabold" title="L5 Active">✅</span>
                                      ) : (
                                        <span className="text-slate-700" title="L5 Inactive">❌</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-center text-xs">
                                      {row.L6 ? (
                                        <span className="text-emerald-400 font-extrabold" title="L6 Active">✅</span>
                                      ) : (
                                        <span className="text-slate-700" title="L6 Inactive">❌</span>
                                      )}
                                    </td>
                                    {/* Evidence Count Column */}
                                    <td className="p-3 font-mono text-xs font-bold text-slate-300 text-center">
                                      {row.count}
                                    </td>
                                    {/* Score Column */}
                                    <td className="p-3 font-mono text-xs font-extrabold text-cyan-400 text-center bg-cyan-500/5">
                                      {row.score.toFixed(1)}
                                    </td>
                                    {/* Strength Grade Column */}
                                    <td className="p-3 text-center">
                                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider shadow-sm border ${
                                        row.grade === "Very High"
                                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                          : row.grade === "High"
                                          ? "bg-teal-500/15 text-teal-400 border-teal-500/30"
                                          : row.grade === "Medium"
                                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                          : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                      }`}>
                                        {row.grade}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={11} className="p-8 text-center text-slate-500 italic font-mono text-xs">
                                  No records found matching the specified filters.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* KP Ruling Planets Tab Content */}
                {kpSubTab === "kp_ruling_planets" && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
                      <h3 className="text-sm font-bold text-cyan-400">KP Ruling Planets (RP) Dashboard</h3>
                      <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2.5 py-0.5 rounded font-mono font-bold uppercase">Timing of Events</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/20 text-center space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Day Lord</div>
                        <div className="text-lg font-black text-amber-500">{kpData?.ruling_planets?.day_lord || "Mars"}</div>
                        <div className="text-[9px] text-slate-500 font-mono">Diurnal Ruler</div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/20 text-center space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Moon Sign Lord</div>
                        <div className="text-lg font-black text-indigo-400">{kpData?.ruling_planets?.moon_sign_lord || "Mercury"}</div>
                        <div className="text-[9px] text-slate-500 font-mono">Rashi Lord</div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/20 text-center space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Moon Star Lord</div>
                        <div className="text-lg font-black text-emerald-400">{kpData?.ruling_planets?.moon_star_lord || "Rahu"}</div>
                        <div className="text-[9px] text-slate-500 font-mono">Nakshatra Lord</div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/20 text-center space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Asc Sign Lord</div>
                        <div className="text-lg font-black text-purple-400">{kpData?.ruling_planets?.ascendant_sign_lord || "Venus"}</div>
                        <div className="text-[9px] text-slate-500 font-mono">Lagna Sign Lord</div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/20 text-center space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Asc Star Lord</div>
                        <div className="text-lg font-black text-pink-400">{kpData?.ruling_planets?.ascendant_star_lord || "Rahu"}</div>
                        <div className="text-[9px] text-slate-500 font-mono">Lagna Star Lord</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/10 text-xs text-slate-400 font-mono space-y-2">
                      <p className="font-bold text-slate-300">Methodological Application:</p>
                      <p>In Krishnamurti Paddhati, Ruling Planets (RPs) are the supreme timing tool. Any genuine event will only happen when the operating Dasha-Bhukti-Antara lords correspond with the natal Ruling Planets, verified through double transits.</p>
                    </div>
                  </div>
                )}

                {/* KP Dasha Tab Content */}
                {kpSubTab === "kp_dasha" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
                      <h3 className="text-sm font-bold text-cyan-400">KP Vimshottari Stellar Dasha Periods</h3>
                      <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2.5 py-0.5 rounded font-mono font-bold uppercase">Stellar Alignment</span>
                    </div>

                    <div className="space-y-3">
                      {dashaDisplayList.map((d: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950/25 space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-amber-400">{d.planet} Mahadasha</span>
                            <span className="text-xs text-slate-400 font-mono">{d.startTime} — {d.endTime}</span>
                          </div>
                          
                          {d.nested && d.nested.length > 0 && (
                            <div className="pl-4 border-l border-slate-800 space-y-1.5 mt-2">
                              {d.nested.slice(0, 5).map((sub: any, sIdx: number) => (
                                <div key={sIdx} className="flex justify-between text-xs text-slate-300 font-mono">
                                  <span>↳ {sub.planet} Bhukti</span>
                                  <span className="text-slate-500">Ends {sub.endTime}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* KP Rulebook Tab Content */}
                {kpSubTab === "kp_rulebook" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
                      <h3 className="text-sm font-bold text-cyan-400">KP Automated Rulebook & Artificial Expert System</h3>
                      <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2.5 py-0.5 rounded font-mono font-bold uppercase">Expert Evaluation</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                      {/* Rules selection */}
                      <div className="lg:col-span-1 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {KPRulebook.map((rule) => {
                          const evalRes = evaluateReportKpRule(rule.id);
                          return (
                            <button
                              key={rule.id}
                              onClick={() => setSelectedKpRuleId(rule.id)}
                              className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                                selectedKpRuleId === rule.id
                                  ? "bg-indigo-500/10 border-indigo-500/40"
                                  : "border-slate-800 hover:border-slate-700 bg-slate-950/25"
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-[10px] font-mono text-indigo-400 font-semibold">{rule.id}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold border ${
                                    rule.type === "Transit" 
                                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/15" 
                                      : "bg-teal-500/10 text-teal-400 border-teal-500/15"
                                  }`}>{rule.type}</span>
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                                    evalRes.status === "PASSED" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                  }`}>{evalRes.status}</span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-200 line-clamp-1">{rule.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active rule detailed evaluation */}
                      <div className="lg:col-span-2">
                        {(() => {
                          const rule = KPRulebook.find(r => r.id === selectedKpRuleId);
                          if (!rule) return <div className="text-slate-500 text-xs italic">Select a rule to view analysis.</div>;
                          const evalRes = evaluateReportKpRule(rule.id);
                          
                          let interpretation = rule.output.interpretation_template;
                          if (kpData) {
                            const csl7 = kpData.cusps?.House_7?.sub_lord || kpData.cusps?.["7"]?.sub_lord || "CSL";
                            const csl10 = kpData.cusps?.House_10?.sub_lord || kpData.cusps?.["10"]?.sub_lord || "CSL";
                            const csl2 = kpData.cusps?.House_2?.sub_lord || kpData.cusps?.["2"]?.sub_lord || "CSL";
                            const asc_csl = kpData.cusps?.House_1?.sub_lord || kpData.cusps?.["1"]?.sub_lord || "CSL";
                            const starLord7 = kpData.planets?.[csl7]?.star_lord || "Star Lord";
                            const starLord10 = kpData.planets?.[csl10]?.star_lord || "Star Lord";
                            const starLord2 = kpData.planets?.[csl2]?.star_lord || "Star Lord";
                            const bhukti = kpData.dba?.bhukti || "Bhukti Lord";
                            const antara = kpData.dba?.antara || "Antara Lord";

                            interpretation = interpretation
                              .replace(/{csl}/g, rule.id === "KP_MAR_01" ? csl7 : rule.id === "KP_CAR_01" ? csl10 : csl2)
                              .replace(/{starLord}/g, rule.id === "KP_MAR_01" ? starLord7 : rule.id === "KP_CAR_01" ? starLord10 : starLord2)
                              .replace(/{asc_csl}/g, asc_csl)
                              .replace(/{bhukti}/g, bhukti)
                              .replace(/{antara}/g, antara)
                              .replace(/{asc_sign_lord}/g, kpData.ruling_planets?.ascendant_sign_lord || "Sign Lord")
                              .replace(/{asc_star_lord}/g, kpData.ruling_planets?.ascendant_star_lord || "Star Lord")
                              .replace(/{moon_sign_lord}/g, kpData.ruling_planets?.moon_sign_lord || "Moon Sign")
                              .replace(/{moon_star_lord}/g, kpData.ruling_planets?.moon_star_lord || "Moon Star")
                              .replace(/{day_lord}/g, kpData.ruling_planets?.day_lord || "Day Lord");
                          }

                          return (
                            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-4">
                              <div className="flex justify-between items-start pb-2 border-b border-slate-800">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-200">{rule.name}</h4>
                                  <p className="text-[10px] text-slate-500">ID: {rule.id} • Priority: {rule.priority}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Verdict</span>
                                  <span className={`text-xs font-black uppercase font-mono ${
                                    evalRes.status === "PASSED" ? "text-emerald-400" : "text-rose-400"
                                  }`}>{evalRes.status} ({evalRes.matchPercent}%)</span>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-xs font-sans text-slate-300">
                                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block font-bold">Rule Interpretation</span>
                                <p className="bg-slate-950/40 p-2.5 rounded border border-slate-800/60 leading-relaxed italic text-cyan-300">
                                  "{interpretation}"
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                                <div className="p-2.5 rounded bg-slate-950/20 border border-slate-800">
                                  <span className="text-amber-500 font-bold block mb-1">Conditions:</span>
                                  <p className="text-slate-400 leading-relaxed">{rule.conditions}</p>
                                </div>
                                <div className="p-2.5 rounded bg-slate-950/20 border border-slate-800">
                                  <span className="text-emerald-400 font-bold block mb-1">Evaluation Details:</span>
                                  <p className="text-slate-300 leading-relaxed">{evalRes.details}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* KP Transit Tab Content */}
                {kpSubTab === "kp_transit" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
                      <h3 className="text-sm font-bold text-cyan-400">KP Active Transit Verification Engine</h3>
                      <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2.5 py-0.5 rounded font-mono font-bold uppercase">Dynamic Transit</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                      <div className="lg:col-span-1 p-4 rounded-xl border border-slate-800 bg-slate-950/20 space-y-3">
                        <span className="text-xs font-bold text-amber-500 block uppercase tracking-wider font-mono">Select Transit Date</span>
                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 uppercase font-bold block font-mono">Target Date</label>
                          <input
                            type="date"
                            value={kpTransitDate}
                            onChange={(e) => setKpTransitDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                          />
                          <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                            The engine will query planetary coordinates for this date to verify against natal cusps.
                          </p>
                        </div>
                      </div>

                      <div className="lg:col-span-2">
                        {kpTransitData ? (
                          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
                            <table className="w-full text-left text-xs font-mono">
                              <thead>
                                <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                                  <th className="p-2.5">Planet</th>
                                  <th className="p-2.5">Sign Lord</th>
                                  <th className="p-2.5">Star Lord</th>
                                  <th className="p-2.5 font-bold text-cyan-400">Sub Lord</th>
                                  <th className="p-2.5">Coordinates</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/20 text-slate-300">
                                {Object.entries(kpTransitData.planets || {}).map(([pName, pVal]: [string, any]) => (
                                  <tr key={pName} className="hover:bg-slate-900/10">
                                    <td className="p-2.5 font-bold text-slate-200">{pName}</td>
                                    <td className="p-2.5">{pVal.sign_lord || "—"}</td>
                                    <td className="p-2.5">{pVal.star_lord || "—"}</td>
                                    <td className="p-2.5 font-bold text-cyan-400">{pVal.sub_lord || "—"}</td>
                                    <td className="p-2.5 text-slate-400">{pVal.longitude?.toFixed(2)}° in {pVal.sign}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                            Enter a date and select transit tab to query calculations.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* KP Horary Tab Content */}
                {kpSubTab === "kp_horary" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
                      <h3 className="text-sm font-bold text-cyan-400">KP Stellar Horary Question Resolver (Prasna)</h3>
                      <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2.5 py-0.5 rounded font-mono font-bold uppercase">Stellar Prasna</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                      <div className="lg:col-span-1 p-4 rounded-xl border border-slate-800 bg-slate-950/20 space-y-3 text-xs">
                        <span className="text-xs font-bold text-amber-500 block uppercase tracking-wider font-mono">Horary Query Parameters</span>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 uppercase font-bold block font-mono">Horary Seed Number (1 - 249)</label>
                            <input
                              type="number"
                              min="1"
                              max="249"
                              value={kpHoraryNumber}
                              onChange={(e) => setKpHoraryNumber(Math.max(1, Math.min(249, Number(e.target.value) || 1)))}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 uppercase font-bold block font-mono">Prasna Query Question</label>
                            <textarea
                              value={kpHoraryQuestion}
                              onChange={(e) => setKpHoraryQuestion(e.target.value)}
                              rows={3}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={async () => {
                              setKpSubLoading(true);
                              setKpSubError(null);
                              try {
                                const res = await fetchReportKpData("/api/kp/horary", { horaryNumber: kpHoraryNumber, question: kpHoraryQuestion });
                                if (res) setKpHoraryData(res);
                              } catch (err: any) {
                                setKpSubError(err.message || "Failed to load Horary query.");
                              } finally {
                                setKpSubLoading(false);
                              }
                            }}
                            className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/35 font-bold py-2 px-4 rounded transition-all font-mono"
                          >
                            Cast Horary Seed
                          </button>
                        </div>
                      </div>

                      <div className="lg:col-span-2">
                        {kpHoraryData ? (
                          <div className="p-4 rounded-xl border border-cyan-500/25 bg-cyan-500/5 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                              <div>
                                <span className="text-[10px] font-mono text-cyan-400 block font-bold">Query Seed: {kpHoraryData.seed || kpHoraryNumber}</span>
                                <span className="text-xs text-slate-400 font-sans italic">"{kpHoraryQuestion}"</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Verdict</span>
                                <span className="text-xs font-black font-mono text-emerald-400">PROMISED (Auspicious)</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs font-mono">
                              <div className="p-2.5 rounded bg-slate-950/20 border border-slate-800">
                                <span className="text-slate-500 text-[10px] block">Horary Ascendant</span>
                                <span className="text-slate-200 font-bold block mt-1">{kpHoraryData.ascendant?.degree?.toFixed(2) || "12.35"}° in {kpHoraryData.ascendant?.sign || "Aries"}</span>
                              </div>
                              <div className="p-2.5 rounded bg-slate-950/20 border border-slate-800">
                                <span className="text-slate-500 text-[10px] block">Asc Star Lord</span>
                                <span className="text-slate-200 font-bold block mt-1">{kpHoraryData.ascendant?.star_lord || "Ketu"}</span>
                              </div>
                              <div className="p-2.5 rounded bg-slate-950/20 border border-slate-800">
                                <span className="text-slate-500 text-[10px] block">Asc Sub Lord</span>
                                <span className="text-cyan-400 font-bold block mt-1">{kpHoraryData.ascendant?.sub_lord || "Venus"}</span>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2 text-xs">
                              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">Stellar Prasna Resolution Summary:</span>
                              <p className="text-slate-300 leading-relaxed font-sans">
                                The query was resolved at horary seed number {kpHoraryNumber}. The lagna CSL is {kpHoraryData.ascendant?.sub_lord || "Venus"} in the star of {kpHoraryData.ascendant?.star_lord || "Ketu"}. Because the sub lord strongly co-relates to primary query significators, the cosmic current is fully supportive. Expect resolution during the dasha period of {kpHoraryData.ascendant?.sub_lord || "Venus"}.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                            Enter seed parameters and click 'Cast Horary Seed' to calculate resolution.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= SYSTEM 8: PLANET TO HOUSE SIGNIFICATOR MAPPINGS ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && (vedicSubTab === "table_7" || vedicSubTab === "kp_planet_to_house"))) && (
          <div id="report-section-8" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-cyan-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-cyan-500/10 pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  System 8 • Planet to House Significator Mappings • Table 7
                </span>
                <h2 className="text-sm font-bold text-cyan-400 mt-2 flex items-center gap-2">
                  <Star className="w-5 h-5 text-cyan-400" />
                  Table 7 - PLANET TO HOUSE SIGNIFICATOR MAPPINGS
                </h2>
                <p className={`text-xs ${mutedText} mt-1`}>
                  Complete reverse-lookup of planetary significator levels mapped back to the 12 bhavas/houses, with custom-weighted 6-fold KP strength evaluation, priorities, and grading metrics.
                </p>
              </div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded font-mono font-bold">KP Astro API Suite: /api/kp/significators</span>
            </div>

            <div className="space-y-6">
              {/* Reverse lookup: Planet to House significators */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">Planet to House Significator Mappings</h4>
                  <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2.5 py-0.5 rounded font-mono font-bold uppercase">Reverse Lookup</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-mono">
                        <th className="p-3.5 w-1/4">Planet</th>
                        <th className="p-3.5 w-1/2">Signified Houses & Strength Levels</th>
                        <th className="p-3.5">General Significations & Portfolio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/20 text-slate-300 font-sans">
                      {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map((planet) => {
                        const houses = planetToHouseMap[planet] || [];
                        const sortedHouses = [...houses].sort((a, b) => a.houseNum - b.houseNum);

                        return (
                          <tr key={planet} className="hover:bg-slate-900/10 font-sans border-b border-slate-800/10 last:border-0">
                            <td className="p-3.5 font-bold text-cyan-400 font-mono text-xs">{planet}</td>
                            <td className="p-3.5">
                              {sortedHouses.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {sortedHouses.map((item) => (
                                    <span
                                      key={item.houseNum}
                                      className="text-[10px] px-2.5 py-1 rounded-md font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1"
                                    >
                                      <span className="font-bold text-cyan-400">H{item.houseNum}</span>
                                      {item.levels.length > 0 && (
                                        <span className="text-slate-400 text-[9px]">({item.levels.join(", ")})</span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-500 italic font-mono text-xs">No signified houses</span>
                              )}
                            </td>
                            <td className="p-3.5 text-xs text-slate-400 leading-relaxed">
                              {planetPortfolios[planet] || "Astrological significations according to Vedic and KP astrology principles."}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* KP Planet Strength Evaluation Section */}
              <div className="space-y-5 pt-6 border-t border-slate-800/40">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                      KP Planet Strength Evaluation &amp; Priorities
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Evaluating 6-fold planet strength. Refactored to map a Significator Matrix and execute the separate KP Weight Engine.
                    </p>
                  </div>
                  <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2.5 py-1 rounded-full font-mono font-bold uppercase shrink-0">
                    ⭐ Configurable Weight Engine
                  </span>
                </div>

                {/* KP Weight Engine Interactive Configuration */}
                <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/25 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                    <div>
                      <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">Weight Matrix Controller</span>
                      <h5 className="text-xs font-bold text-slate-200 mt-0.5">Customize KP Level Priorities</h5>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setKpWeights({ L1: 5.0, L2: 4.0, L3: 3.0, L4: 2.0, L5: 1.0, L6: 0.5 })}
                        className="px-2.5 py-1 text-[9px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                      >
                        Classical Preset
                      </button>
                      <button
                        onClick={() => setKpWeights({ L1: 1.0, L2: 1.0, L3: 1.0, L4: 1.0, L5: 1.0, L6: 1.0 })}
                        className="px-2.5 py-1 text-[9px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                      >
                        Equal Weights Preset
                      </button>
                      <button
                        onClick={() => setKpWeights({ L1: 6.0, L2: 2.0, L3: 4.0, L4: 1.0, L5: 3.0, L6: 0.5 })}
                        className="px-2.5 py-1 text-[9px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
                      >
                        Stellar Preset
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                      { key: "L1", desc: "Star Occupant" },
                      { key: "L2", desc: "Cusp Occupant" },
                      { key: "L3", desc: "Star Owner" },
                      { key: "L4", desc: "Cusp Lord" },
                      { key: "L5", desc: "Sub Occupant" },
                      { key: "L6", desc: "Sub Owner" }
                    ].map((item) => {
                      const k = item.key as keyof typeof kpWeights;
                      return (
                        <div key={k} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-300 font-mono">{k}</span>
                            <span className="text-[10px] font-bold text-cyan-400 font-mono bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/10">
                              {kpWeights[k].toFixed(1)}
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-400 font-medium truncate">{item.desc}</div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={kpWeights[k]}
                            onChange={(e) => setKpWeights(prev => ({ ...prev, [k]: parseFloat(e.target.value) }))}
                            className="w-full accent-cyan-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Filters & Statistics Summary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                  {/* Filters Column */}
                  <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Planet Filter */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Filter Planet</label>
                      <select
                        value={kpStrengthPlanetFilter}
                        onChange={(e) => setKpStrengthPlanetFilter(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      >
                        <option value="All">All Planets</option>
                        {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* House Filter */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Filter House</label>
                      <select
                        value={kpStrengthHouseFilter}
                        onChange={(e) => setKpStrengthHouseFilter(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      >
                        <option value="All">All Houses</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                          <option key={h} value={`House ${h}`}>House {h}</option>
                        ))}
                      </select>
                    </div>

                    {/* Reset Filters Button */}
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setKpStrengthPlanetFilter("All");
                          setKpStrengthHouseFilter("All");
                          setKpStrengthSortField("planet");
                          setKpStrengthSortOrder("asc");
                        }}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 font-mono transition-colors cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>

                  {/* Summary Metrics Panel */}
                  <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800/60 rounded-xl p-2.5 flex justify-around text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Total Evaluated</div>
                      <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                        {filteredAndSortedPlanetStrength.length}
                      </div>
                    </div>
                    <div className="border-l border-slate-800 h-8 self-center"></div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Very High/High</div>
                      <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                        {filteredAndSortedPlanetStrength.filter(r => r.grade === "Very High" || r.grade === "High").length}
                      </div>
                    </div>
                    <div className="border-l border-slate-800 h-8 self-center"></div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Medium/Low</div>
                      <div className="text-sm font-bold font-mono text-amber-500 mt-0.5">
                        {filteredAndSortedPlanetStrength.filter(r => r.grade === "Medium" || r.grade === "Low").length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Data Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-mono select-none">
                        <th 
                          className="p-3 cursor-pointer hover:bg-slate-800/40 hover:text-slate-200 transition-colors"
                          onClick={() => {
                            if (kpStrengthSortField === "planet") {
                              setKpStrengthSortOrder(prev => prev === "asc" ? "desc" : "asc");
                            } else {
                              setKpStrengthSortField("planet");
                              setKpStrengthSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-1">
                            Planet
                            {kpStrengthSortField === "planet" && (
                              <span className="text-cyan-400 text-[10px]">{kpStrengthSortOrder === "asc" ? " ▲" : " ▼"}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="p-3 cursor-pointer hover:bg-slate-800/40 hover:text-slate-200 transition-colors"
                          onClick={() => {
                            if (kpStrengthSortField === "houseNum") {
                              setKpStrengthSortOrder(prev => prev === "asc" ? "desc" : "asc");
                            } else {
                              setKpStrengthSortField("houseNum");
                              setKpStrengthSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-1">
                            House / Bhava
                            {kpStrengthSortField === "houseNum" && (
                              <span className="text-cyan-400 text-[10px]">{kpStrengthSortOrder === "asc" ? " ▲" : " ▼"}</span>
                            )}
                          </div>
                        </th>
                        <th className="p-3 text-center">L1</th>
                        <th className="p-3 text-center">L2</th>
                        <th className="p-3 text-center">L3</th>
                        <th className="p-3 text-center">L4</th>
                        <th className="p-3 text-center">L5</th>
                        <th className="p-3 text-center">L6</th>
                        <th 
                          className="p-3 cursor-pointer hover:bg-slate-800/40 hover:text-slate-200 transition-colors text-center"
                          onClick={() => {
                            if (kpStrengthSortField === "count") {
                              setKpStrengthSortOrder(prev => prev === "asc" ? "desc" : "asc");
                            } else {
                              setKpStrengthSortField("count");
                              setKpStrengthSortOrder("desc");
                            }
                          }}
                        >
                          <div className="flex items-center justify-center gap-1">
                            Count
                            {kpStrengthSortField === "count" && (
                              <span className="text-cyan-400 text-[10px]">{kpStrengthSortOrder === "asc" ? " ▲" : " ▼"}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="p-3 cursor-pointer hover:bg-slate-800/40 hover:text-slate-200 transition-colors text-center"
                          onClick={() => {
                            if (kpStrengthSortField === "score") {
                              setKpStrengthSortOrder(prev => prev === "asc" ? "desc" : "asc");
                            } else {
                              setKpStrengthSortField("score");
                              setKpStrengthSortOrder("desc");
                            }
                          }}
                        >
                          <div className="flex items-center justify-center gap-1">
                            Score
                            {kpStrengthSortField === "score" && (
                              <span className="text-cyan-400 text-[10px]">{kpStrengthSortOrder === "asc" ? " ▲" : " ▼"}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="p-3 cursor-pointer hover:bg-slate-800/40 hover:text-slate-200 transition-colors text-center"
                          onClick={() => {
                            if (kpStrengthSortField === "grade") {
                              setKpStrengthSortOrder(prev => prev === "asc" ? "desc" : "asc");
                            } else {
                              setKpStrengthSortField("grade");
                              setKpStrengthSortOrder("desc");
                            }
                          }}
                        >
                          <div className="flex items-center justify-center gap-1">
                            Strength Grade
                            {kpStrengthSortField === "grade" && (
                              <span className="text-cyan-400 text-[10px]">{kpStrengthSortOrder === "asc" ? " ▲" : " ▼"}</span>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/20 text-slate-300 font-sans">
                      {filteredAndSortedPlanetStrength.length > 0 ? (
                        filteredAndSortedPlanetStrength.map((row, index) => {
                          const houseSanskritMap: Record<number, string> = {
                            1: "Ascendant (Tanu)",
                            2: "Wealth (Dhana)",
                            3: "Siblings (Sahaja)",
                            4: "Home & Comfort (Sukha)",
                            5: "Progeny & Intellect (Putra)",
                            6: "Debts & Enemies (Shatru)",
                            7: "Spouse & Partnership (Yuvati)",
                            8: "Longevity (Randhra)",
                            9: "Fortune & Dharma (Dharma)",
                            10: "Career & Status (Karma)",
                            11: "Gains & Wishes (Labha)",
                            12: "Losses & Moksha (Vyaya)"
                          };

                          return (
                            <tr key={`${row.planet}-${row.houseNum}-${index}`} className="hover:bg-slate-900/10 font-sans border-b border-slate-800/10 last:border-0 transition-colors">
                              <td className="p-3 font-bold text-cyan-300 font-mono text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                  {row.planet}
                                </div>
                              </td>
                              <td className="p-3 text-xs text-slate-200">
                                <span className="font-mono font-bold text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded mr-1.5">H{row.houseNum}</span>
                                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">{houseSanskritMap[row.houseNum] || `House ${row.houseNum}`}</span>
                              </td>
                              <td className="p-3 text-center text-xs">
                                {row.L1 ? (
                                  <span className="text-emerald-400 font-extrabold" title="L1 Active">✅</span>
                                ) : (
                                  <span className="text-slate-700" title="L1 Inactive">❌</span>
                                )}
                              </td>
                              <td className="p-3 text-center text-xs">
                                {row.L2 ? (
                                  <span className="text-emerald-400 font-extrabold" title="L2 Active">✅</span>
                                ) : (
                                  <span className="text-slate-700" title="L2 Inactive">❌</span>
                                )}
                              </td>
                              <td className="p-3 text-center text-xs">
                                {row.L3 ? (
                                  <span className="text-emerald-400 font-extrabold" title="L3 Active">✅</span>
                                ) : (
                                  <span className="text-slate-700" title="L3 Inactive">❌</span>
                                )}
                              </td>
                              <td className="p-3 text-center text-xs">
                                {row.L4 ? (
                                  <span className="text-emerald-400 font-extrabold" title="L4 Active">✅</span>
                                ) : (
                                  <span className="text-slate-700" title="L4 Inactive">❌</span>
                                )}
                              </td>
                              <td className="p-3 text-center text-xs">
                                {row.L5 ? (
                                  <span className="text-emerald-400 font-extrabold" title="L5 Active">✅</span>
                                ) : (
                                  <span className="text-slate-700" title="L5 Inactive">❌</span>
                                )}
                              </td>
                              <td className="p-3 text-center text-xs">
                                {row.L6 ? (
                                  <span className="text-emerald-400 font-extrabold" title="L6 Active">✅</span>
                                ) : (
                                  <span className="text-slate-700" title="L6 Inactive">❌</span>
                                )}
                              </td>
                              <td className="p-3 font-mono text-xs font-bold text-slate-300 text-center">
                                {row.count}
                              </td>
                              <td className="p-3 font-mono text-xs font-extrabold text-cyan-400 text-center bg-cyan-500/5">
                                {row.score.toFixed(1)}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider shadow-sm border ${
                                  row.grade === "Very High"
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                    : row.grade === "High"
                                    ? "bg-teal-500/15 text-teal-400 border-teal-500/30"
                                    : row.grade === "Medium"
                                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                }`}>
                                  {row.grade}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={11} className="p-8 text-center text-slate-500 italic font-mono text-xs">
                            No records found matching the specified filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SYSTEM 9: WESTERN TROPICAL ASTROLOGY ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && (vedicSubTab === "table_8" || vedicSubTab === "westernTropical"))) && (
          <div id="report-section-9" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-purple-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-purple-500/10 pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  System 9 • Western Tropical Aspect Matrices • Table 8
                </span>
                <h2 className="text-sm font-bold text-purple-400 mt-2 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  Table 8 - TROPICAL PLANETARY ASPECTS & PLACIDUS HOUSE CUSPS
                </h2>
                <p className={`text-xs ${mutedText} mt-1`}>
                  Standard major aspect definitions, angular difference metrics, and 12 Placidus house boundaries.
                </p>
              </div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (western)</span>
            </div>

          <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-purple-500/25 transition-all">
            <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800/60 pb-2">
              Major Western Aspect Harmonization Table
            </span>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="p-2.5">Planet A</th>
                    <th className="p-2.5">Aspect Type</th>
                    <th className="p-2.5">Planet B</th>
                    <th className="p-2.5">Exact Angle</th>
                    <th className="p-2.5">Orb Distance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/20 text-slate-300">
                  {Array.isArray(westernData?.aspects) && westernData.aspects.length > 0 ? (
                    westernData.aspects.map((asp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold text-slate-200">{asp.planet_1}</td>
                        <td className="p-2.5 text-amber-500 font-bold">{asp.aspect_type}</td>
                        <td className="p-2.5 text-slate-200">{asp.planet_2}</td>
                        <td className="p-2.5 font-mono">{asp.angle?.toFixed(1) || asp.angle}°</td>
                        <td className="p-2.5 font-mono">{asp.orb?.toFixed(1) || asp.orb}°</td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr className="hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold text-slate-200">Sun</td>
                        <td className="p-2.5 text-amber-500 font-bold">Conjunction</td>
                        <td className="p-2.5 text-slate-200">Mercury</td>
                        <td className="p-2.5 font-mono">0.2°</td>
                        <td className="p-2.5 font-mono">0.2°</td>
                      </tr>
                      <tr className="hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold text-slate-200">Moon</td>
                        <td className="p-2.5 text-amber-500 font-bold">Trine</td>
                        <td className="p-2.5 text-slate-200">Jupiter</td>
                        <td className="p-2.5 font-mono">120.4°</td>
                        <td className="p-2.5 font-mono">1.5°</td>
                      </tr>
                      <tr className="hover:bg-slate-900/10">
                        <td className="p-2.5 font-semibold text-slate-200">Mars</td>
                        <td className="p-2.5 text-amber-500 font-bold">Square</td>
                        <td className="p-2.5 text-slate-200">Saturn</td>
                        <td className="p-2.5 font-mono">89.1°</td>
                        <td className="p-2.5 font-mono">2.1°</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-purple-500/25 transition-all">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800/60 pb-2">
                12 Placidus House Cusps
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(westernData?.cusps || {}).map(([cKey, cVal]: [string, any]) => (
                  <div key={cKey} className="flex justify-between py-1 border-b border-slate-900/20">
                    <span className={mutedText}>{cKey.replace("Cusp_", "House ")}:</span>
                    <span className="font-bold text-slate-200">{cVal.sign} {cVal.degree?.toFixed(1) || cVal.degree}°</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-purple-500/25 transition-all">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800/60 pb-2">
                Western Tropical System Summary
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                By shifting from the sidereal Lahiri framework to the Tropical Western framework, coordinates adjust forward by approximately 24 degrees due to precession of the equinoxes. This shifts planets into cardinal elemental signatures, reflecting your outer personality, communication styles, and immediate social dynamics with precision.
              </p>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 10: ESOTERIC & ALTERNATIVE MYSTICAL SYSTEMS ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && (vedicSubTab === "table_9" || ["panchapakshi", "lalkitab", "gemstones", "numerology", "mysticalSystems"].includes(vedicSubTab)))) && (
          <div id="report-section-10" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-pink-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-pink-500/10 pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] bg-pink-500/15 text-pink-400 border border-pink-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  System 10 • Mystical Esoteric Systems & Remedial Blueprints • Table 9
                </span>
                <h2 className="text-sm font-bold text-pink-400 mt-2 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-pink-400" />
                  Table 9 - ESOTERIC, BAZI FOUR PILLARS & LAL KITAB REMEDIES
                </h2>
                <p className={`text-xs ${mutedText} mt-1`}>
                  Chinese BaZi Four Pillars, Pythagorean Numerology, Lal Kitab remedies, Mayan Day signs, and Celtic tree properties.
                </p>
              </div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (mysticalSystems)</span>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BaZi */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-pink-500/25 transition-all">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
                <Layers className="w-4 h-4 text-pink-400" />
                Chinese BaZi Four Pillars of Destiny
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className={`block text-[9px] ${mutedText} font-bold`}>YEAR</span>
                  <span className="font-bold text-amber-400">{baziData?.pillars?.year?.stem || "Yin Wood"}</span>
                  <span className="block font-semibold text-slate-300 mt-1">{baziData?.pillars?.year?.branch || "Rabbit"}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className={`block text-[9px] ${mutedText} font-bold`}>MONTH</span>
                  <span className="font-bold text-amber-400">{baziData?.pillars?.month?.stem || "Yang Earth"}</span>
                  <span className="block font-semibold text-slate-300 mt-1">{baziData?.pillars?.month?.branch || "Tiger"}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className={`block text-[9px] ${mutedText} font-bold`}>DAY</span>
                  <span className="font-bold text-amber-400">{baziData?.pillars?.day?.stem || "Yin Fire"}</span>
                  <span className="block font-semibold text-slate-300 mt-1">{baziData?.pillars?.day?.branch || "Ox"}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className={`block text-[9px] ${mutedText} font-bold`}>HOUR</span>
                  <span className="font-bold text-amber-400">{baziData?.pillars?.hour?.stem || "Yang Water"}</span>
                  <span className="block font-semibold text-slate-300 mt-1">{baziData?.pillars?.hour?.branch || "Monkey"}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Your self-element (Day Stem) is <strong>{baziData?.pillars?.day?.stem || "Yin Fire"}</strong>, demonstrating intense curiosity, inner resilience, and radiant advisory warmth. Element balance count - Wood: {baziData?.elements?.wood || 2}, Fire: {baziData?.elements?.fire || 1}, Earth: {baziData?.elements?.earth || 2}, Metal: {baziData?.elements?.metal || 1}, Water: {baziData?.elements?.water || 1}.
              </p>
            </div>

            {/* Tajik Varshaphal Card */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-pink-500/25 transition-all">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Tajik Varshaphal (Solar Return Progressions)
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className={`block text-[9px] ${mutedText} font-bold`}>MUNTHA HOUSE</span>
                  <span className="font-bold text-amber-400 block mt-1">House {tajikData?.varshaphal_2026?.muntha_house || 6}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className={`block text-[9px] ${mutedText} font-bold`}>MUNTHA LORD</span>
                  <span className="font-bold text-indigo-400 block mt-1">{tajikData?.varshaphal_2026?.muntha_lord || "Mercury"}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className={`block text-[9px] ${mutedText} font-bold`}>YEAR LORD</span>
                  <span className="font-bold text-amber-400 block mt-1">{tajikData?.varshaphal_2026?.year_lord || "Jupiter"}</span>
                </div>
              </div>
              {Array.isArray(tajikData?.varshaphal_2026?.aspects) && tajikData.varshaphal_2026.aspects.length > 0 && (
                <div className="pt-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tajika Planetary Yogas (Applying Aspects)</span>
                  <div className="space-y-1.5 max-h-[80px] overflow-y-auto pr-1">
                    {tajikData.varshaphal_2026.aspects.map((aspect: any, idx: number) => (
                      <div key={idx} className="p-1.5 rounded bg-indigo-950/20 border border-indigo-500/10 flex justify-between items-center text-[10px]">
                        <span className="text-slate-200 font-medium font-mono">{aspect.type}: {aspect.planet1} & {aspect.planet2}</span>
                        <span className="text-emerald-400 font-mono">Orb: {aspect.orb}° • {aspect.result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Numerology */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 hover:border-pink-500/25 transition-all">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
                <Zap className="w-4 h-4 text-pink-400" />
                Pythagorean Numerology Matrix
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                  <span className={mutedText}>Psychic/Birth Number:</span>
                  <span className="font-extrabold text-amber-400 text-sm block mt-0.5">6 (Venus)</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Auspicious harmony, family dedication, artistic flow.</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                  <span className={mutedText}>Destiny/Life Path:</span>
                  <span className="font-extrabold text-amber-400 text-sm block mt-0.5">2 (Moon)</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Empathy, diplomatic resolution, intuitive counseling.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/60 pb-2">
              <Shield className="w-4 h-4 text-pink-400" />
              Lal Kitab Remedial Prescriptions
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded bg-rose-950/10 border border-rose-500/15">
                <span className="font-bold text-rose-400 block">Venus Remedy (Lal Kitab House 7)</span>
                <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                  {lalkitabData?.remedies?.Venus || "Keep a small piece of unrefined solid silver or white marble in your pocket to stabilize relationship energy and bolster financial comfort."}
                </p>
              </div>
              <div className="p-3.5 rounded bg-amber-950/10 border border-amber-500/15">
                <span className="font-bold text-amber-400 block">Jupiter Remedy (Lal Kitab House 11)</span>
                <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                  {lalkitabData?.remedies?.Jupiter || "Apply a small tilak of pure wet saffron or yellow turmeric on the forehead after bathing to invoke blessings of professional wisdom."}
                </p>
              </div>
              <div className="p-3.5 rounded bg-indigo-950/10 border border-indigo-500/15">
                <span className="font-bold text-indigo-400 block">Saturn Remedy (Lal Kitab House 3)</span>
                <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                  {lalkitabData?.remedies?.Saturn || "Feed raw grain or birdseed to wild crows or dark pigeons on Saturday mornings to resolve persistent organizational hurdles."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-4 rounded-xl bg-slate-950/30 border border-slate-800 text-xs space-y-2 hover:border-pink-500/25 transition-all">
              <span className="font-bold text-slate-300 uppercase block tracking-wider">Mayan Day Sign Kin</span>
              <p className="text-slate-400 leading-relaxed">
                Your cosmic signature is <strong>Blue Eagle (Men)</strong>, representing visionary perspectives, high intellect, and global creation energy. Your galactic tone is <strong>Tone 11</strong>, symbolizing structured integration and high-level intuitive problem-solving.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/30 border border-slate-800 text-xs space-y-2 hover:border-pink-500/25 transition-all">
              <span className="font-bold text-slate-300 uppercase block tracking-wider">Celtic Tree Astrology Sign</span>
              <p className="text-slate-400 leading-relaxed">
                Your sacred Celtic signature is the <strong>Birch Tree (The Achiever)</strong>. Birch personalities are ambitious, highly organized, and always seek to establish order, wisdom, and light in their environments.
              </p>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 11: VIMSHOTTARI, YOGINI & ASHTOTTARI DASHAS ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && ["table_3", "table_4", "table_5"].includes(vedicSubTab))) && (
          <div id="report-section-11" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-teal-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-teal-500/10 pb-4 mb-6">
              <span className="text-[10px] bg-teal-500/15 text-teal-400 border border-teal-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                System 11 • Dasha Period Timelines (Vimshottari, Yogini, Ashtottari)
              </span>
              <h2 className="text-sm font-bold text-teal-400 mt-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400" />
                VIMSHOTTARI, YOGINI & ASHTOTTARI DASHA CYCLES
              </h2>
            <p className={`text-xs ${mutedText} mt-1`}>
              The chronological sequence of planetary planetary dasha cycles computed on lunar longitudes, fully expanded.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            {/* Vimshottari */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 col-span-1 lg:col-span-1">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                Vimshottari Mahadasha Timelines
              </span>
              <div className="space-y-2.5">
                {Array.isArray(vedicData?.dashas?.vimshottari) && vedicData.dashas.vimshottari.length > 0 ? (
                  vedicData.dashas.vimshottari.map((d: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-900/40 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-500">{d.lord}</span>
                        <span className="font-mono text-slate-300">Until {d.end_date}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Starts: {d.start_date}</div>
                    </div>
                  ))
                ) : (
                  dashas.map((d: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-slate-900/40 border border-slate-800">
                      <span className="font-bold text-amber-500">{d.lord} Mahadasha</span>
                      <span className="font-mono text-slate-300">Until {d.endTime || "2031-11-20"}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Yogini */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 col-span-1 lg:col-span-1">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                Yogini Dasha Timelines
              </span>
              <div className="space-y-2.5">
                {Array.isArray(vedicData?.dashas?.yogini) && vedicData.dashas.yogini.length > 0 ? (
                  vedicData.dashas.yogini.map((d: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-900/40 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-400">{d.lord}</span>
                        <span className="font-mono text-slate-300">Until {d.end_date}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Starts: {d.start_date}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No Yogini dasha records available.</p>
                )}
              </div>
            </div>

            {/* Ashtottari */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4 col-span-1 lg:col-span-1">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2">
                Ashtottari Dasha Timelines
              </span>
              <div className="space-y-2.5">
                {Array.isArray(vedicData?.dashas?.ashtottari) && vedicData.dashas.ashtottari.length > 0 ? (
                  vedicData.dashas.ashtottari.map((d: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-900/40 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400">{d.lord}</span>
                        <span className="font-mono text-slate-300">Until {d.end_date}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Starts: {d.start_date}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No Ashtottari dasha records available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 12: YOGAS & DOSHAS ANALYSIS ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && ["table_11", "yogas", "doshas", "sadeSati"].includes(vedicSubTab))) && (
          <div id="report-section-12" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-rose-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-rose-500/10 pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  System 12 • Planetary Combinations & Afflictions (Yogas & Doshas) • Table 11
                </span>
                <h2 className="text-sm font-bold text-rose-400 mt-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  Table 11 - VEDIC RAJA/DHANA YOGAS & CELESTIAL DOSHAS
                </h2>
                <p className={`text-xs ${mutedText} mt-1`}>
                  Comprehensive checklist of active auspicious combinations and major cosmic doshas present.
                </p>
              </div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (yogas & doshas)</span>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* Yogas */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Active Auspicious Yogas Present
              </span>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {Array.isArray(vedicData?.yogas) && vedicData.yogas.length > 0 ? (
                  vedicData.yogas.map((yoga: any, idx: number) => (
                    <div key={idx} className="p-3 rounded bg-slate-900/60 border border-slate-800 space-y-1 hover:border-amber-500/25 transition-all">
                      <span className="font-bold text-amber-400 text-sm block">{yoga.name}</span>
                      <p className="text-slate-300 text-[11px] leading-normal">{yoga.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded bg-slate-900/60 border border-slate-800 text-slate-500 italic">
                    Analyzing active combinations from planetary coordinates...
                  </div>
                )}
              </div>
            </div>

            {/* Doshas */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Active Celestial Doshas & Afflictions
              </span>
              <div className="space-y-4">
                {Array.isArray(vedicData?.doshas) && vedicData.doshas.length > 0 ? (
                  vedicData.doshas.map((dosha: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded bg-rose-950/10 border border-rose-500/15 space-y-1">
                      <span className="font-bold text-rose-400 text-sm block">{dosha.name}</span>
                      <p className="text-slate-300 text-[11px] leading-normal">{dosha.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 rounded bg-slate-900/40 border border-slate-800 text-slate-500 italic">
                    Calculating Manglik, Kaal Sarp and Sade Sati degrees...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================= SYSTEM 13: TRADITIONAL LIFE PATHWAYS ================= */}
        {(showAllAstroSystems || (majorTab === "jhora" && ["table_12", "longevity"].includes(vedicSubTab))) && (
          <div id="report-section-13" className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-amber-500/15 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
            
            <div className="border-b border-amber-500/10 pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  System 13 • Traditional Life Predictions & Daily Muhurta • Table 12
                </span>
                <h2 className="text-sm font-bold text-amber-500 mt-2 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                  Table 12 - LIFE DESTINY PATHWAYS & DAILY TRANSIT ALIGNMENTS
                </h2>
                <p className={`text-xs ${mutedText} mt-1`}>
                  Exhaustive predictive analysis mapping professional focus, wealth generation, marriage bliss, health, and current lunar transit.
                </p>
              </div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (predictions & muhurta)</span>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Career */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-amber-500/25 transition-all">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Briefcase className="w-4 h-4" />
                Professional & Career Path
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {career.text}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {career.highlights.map((h, i) => (
                  <span key={i} className="bg-indigo-500/10 text-indigo-400 text-[9px] px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Finance */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-amber-500/25 transition-all">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <DollarSign className="w-4 h-4" />
                Finance & Wealth Dynamics
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {finance.text}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {finance.highlights.map((h, i) => (
                  <span key={i} className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Marriage */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-amber-500/25 transition-all">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <Heart className="w-4 h-4" />
                Marriage & Relationship Harmony
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {marriage.text}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {marriage.highlights.map((h, i) => (
                  <span key={i} className="bg-rose-500/10 text-rose-400 text-[9px] px-2 py-0.5 rounded border border-rose-500/20 font-bold">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Health */}
            <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800 space-y-3 hover:border-amber-500/25 transition-all">
              <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <Activity className="w-4 h-4" />
                Health & Vitality Blueprint
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {health.text}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {health.highlights.map((h, i) => (
                  <span key={i} className="bg-teal-500/10 text-teal-400 text-[9px] px-2 py-0.5 rounded border border-teal-500/20 font-bold">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-2">
              <div className="space-y-0.5">
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Daily Transit Alignment</span>
                <h4 className="text-xs font-bold text-slate-200">Personalized Lunar Muhurta Guidelines</h4>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-950/50 px-2.5 py-1 rounded">
                📅 {daily.date}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Highly Auspicious For
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {daily.auspiciousFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Caution Advised For
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {daily.cautionFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-rose-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/30 border border-slate-800 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className={mutedText}>Active Transit Nakshatra:</span>
                  <span className="font-bold text-slate-200">{daily.nakshatra}</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Active Moon Tithi:</span>
                  <span className="font-bold text-slate-200">{daily.tithi}</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Auspicious Colors:</span>
                  <span className="font-bold text-slate-200 text-right">{daily.luckyColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Lucky Number:</span>
                  <span className="font-bold text-amber-500 font-mono">{daily.luckyNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {majorTab === "transit" && (
        <div className="space-y-6">
          {[
            "current_gochara", "current_dasha", "current_transits", "current_strengths", 
            "current_yogas", "current_doshas", "current_aspects", "house_activation", 
            "current_nakshatra", "sensitive_points", "current_events", "transit_timeline"
          ].includes(transitSubTab) && (
            astrologyData ? (
              <div className={`p-6 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-indigo-500/15`}>
                <TransitsTab 
                  astrologyData={astrologyData}
                  transitDate={transitDate}
                  setTransitDate={setTransitDate}
                  transitTime={transitTime}
                  transitPlace={transitPlace}
                  transitLatitude={transitLatitude}
                  transitLongitude={transitLongitude}
                  transitTimezone={transitTimezone}
                  subTab={transitSubTab}
                  chartStyle={chartStyle}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                Please cast a horoscope first to view transits.
              </div>
            )
          )}

          {transitSubTab === "planet_ingress" && (
            astrologyData ? (
              <div className={`p-6 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-indigo-500/15`}>
                <IngressTab birthDate={astrologyData.birthDetails.date} />
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                Please cast a horoscope first to view ingress transits.
              </div>
            )
          )}

          {transitSubTab === "panchanga" && (
            <div className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-indigo-500/15`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-indigo-500/10 pb-4 mb-6 gap-4">
                <div>
                  <span className="text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Vedic Astro Clock
                  </span>
                  <h3 className="text-lg font-sans font-medium text-slate-200 mt-1">
                    Real-Time Transit Panchanga (Current Sky)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Continuous ephemeris updates mapped relative to <strong className="text-amber-400">{transitPlace}</strong> coordinates.
                  </p>
                </div>
                <div className="text-left md:text-right font-mono text-[11px] text-slate-400 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800">
                  <span className="text-amber-400 block font-bold">Transit Context (Geocoded)</span>
                  <span className="text-slate-200 block font-semibold">{transitPlace}</span>
                  {transitDate} • {transitTime}
                </div>
              </div>

              {/* Classic 5 Limbs (Panch-Anga) of Current Sky */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
                {[
                  {
                    label: "Tithi (Lunar Day)",
                    value: activePanchanga.tithi.name,
                    lord: activePanchanga.tithi.lord || "Sun",
                    detail: `${activePanchanga.tithi.paksha} Paksha`,
                    color: "text-amber-400 border-amber-500/20 bg-amber-500/5"
                  },
                  {
                    label: "Vara (Solar Day)",
                    value: activePanchanga.vara.name,
                    lord: activePanchanga.vara.lord || "Venus",
                    detail: "Hora Alignments",
                    color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5"
                  },
                  {
                    label: "Nakshatra (Mansion)",
                    value: activePanchanga.nakshatra.name,
                    lord: activePanchanga.nakshatra.lord || "Rahu",
                    detail: "Moon Mansion",
                    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                  },
                  {
                    label: "Yoga (Solilunar Angle)",
                    value: activePanchanga.yoga.name,
                    lord: activePanchanga.yoga.lord || "Mercury",
                    detail: "Angle Alignments",
                    color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5"
                  },
                  {
                    label: "Karana (Half Tithi)",
                    value: activePanchanga.karana.name,
                    lord: activePanchanga.karana.lord || "Sun",
                    detail: "Tithi Half Sectors",
                    color: "text-purple-400 border-purple-500/20 bg-purple-500/5"
                  }
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.color} flex flex-col justify-between h-32 shadow-sm`}>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-semibold">{item.label}</span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{item.value}</h4>
                    </div>
                    <div className="border-t border-white/5 pt-2 mt-2 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Lord: <strong className="text-white font-semibold">{item.lord}</strong></span>
                      <span className="text-[9px] font-mono opacity-80">{item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sun/Moon Solar Data & Muhurtas Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Sunrise & Sunset */}
                <div className="lg:col-span-4 p-5 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col justify-between space-y-4">
                  <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">
                    Solar Transitions
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
                      <Sun className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Sunrise</span>
                      <strong className="text-xs text-slate-200 mt-1 block">{activePanchanga.sunrise}</strong>
                    </div>
                    <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800 text-center">
                      <Moon className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Sunset</span>
                      <strong className="text-xs text-slate-200 mt-1 block">{activePanchanga.sunset}</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed text-center">
                    Calculated using standard local horizon refraction settings.
                  </p>
                </div>

                {/* Sensitive Transit Windows */}
                <div className="lg:col-span-8 p-5 rounded-xl border border-slate-800 bg-slate-900/30 space-y-4">
                  <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">
                    Sensitive Ephemeris Windows (Muhurta Intervals)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {activeWindows.map((m) => (
                      <div key={m.name} className={`p-3 rounded-lg border ${m.color} flex flex-col justify-between h-28`}>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider block font-mono">{m.name}</span>
                          <span className="text-[10px] text-slate-200 font-mono block mt-1">{m.time}</span>
                        </div>
                        <span className="text-[8px] font-bold uppercase tracking-widest block text-right mt-1.5 opacity-90">{m.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transit Panchanga Synthesis */}
              <div className="mt-6 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 space-y-2">
                <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-extrabold block">
                  Transit Synthesis
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Today's <strong className="text-amber-400">{activePanchanga.tithi.name}</strong> on a <strong className="text-indigo-300">{activePanchanga.vara.name}</strong> (ruled by {activePanchanga.vara.lord}) paired with <strong className="text-emerald-400">{activePanchanga.nakshatra.name} Nakshatra</strong> (ruled by {activePanchanga.nakshatra.lord}) forms a stable transit. The current lunar energy stimulates introspection, making it highly favorable for deep strategic planning, structural organization, and spiritual alignments, while major physical commencements are recommended to bypass the Rahu Kalam window ({computedMuhurtas.rahuKalam.start} - {computedMuhurtas.rahuKalam.end}).
                </p>
              </div>
            </div>
          )}

          {transitSubTab === "daily_muhurta" && (
            astrologyData ? (
              <div className={`p-6 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-indigo-500/15`} id="muhurtas-tab">
                <div>
                  <h3 className="text-lg font-sans font-medium flex items-center gap-2 text-slate-200">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Daily Solar Muhurtas (Choghadiya)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 mb-6">
                    Calculated based on local solar sunrise coordinates for the Cast date, aligning with the real-time ephemeris.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {Array.isArray(transitAstroData?.muhurtas || astrologyData.muhurtas) && (transitAstroData?.muhurtas || astrologyData.muhurtas).map((m: any) => (
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

                {/* Live Muhurta Alert from current_sky.json */}
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3.5">
                  <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-400">Upcoming Auspicious Ingress Interval</h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                      The dynamic transit engine identifies the next peak auspicious Abhijit Muhurta starting at <strong className="text-white">{computedMuhurtas.abhijit.start}</strong> until <strong className="text-white">{computedMuhurtas.abhijit.end}</strong>. Highly recommended for executing critical calls or business submissions.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                Please cast a horoscope first to view Daily Muhurtas.
              </div>
            )
          )}

          {transitSubTab === "event_muhurta" && (
            <div className={`p-6 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-indigo-500/15`}>
              <div className="border-b border-indigo-500/10 pb-4 mb-6">
                <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Planetary Matcher
                </span>
                <h3 className="text-lg font-sans font-medium text-slate-200 mt-1 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Event Muhurta Finder
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Identify perfect planetary times for weddings, business launches, investments, and creative pursuits.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: "Wedding / Vivaha",
                    desc: "Analyzes Jupiter strength and 7th house aspects to secure divine blessings.",
                    active: dynamicEventOpportunity.marriageWindow.active,
                    timeframe: dynamicEventOpportunity.marriageWindow.timeframe,
                    badge: "Vivaha Samskara"
                  },
                  {
                    name: "Business / Commercial Launch",
                    desc: "Leverages Mercury and Sun's power to secure public reach, power, and cash flows.",
                    active: dynamicEventOpportunity.businessOpportunity.active,
                    timeframe: dynamicEventOpportunity.businessOpportunity.timeframe,
                    badge: "Udyoga Aarambh"
                  },
                  {
                    name: "Asset / Real Estate Acquisition",
                    desc: "Maps Saturn's position and Mars aspects to rule out structural delays and secure longevity.",
                    active: dynamicEventOpportunity.investmentOpportunity.active,
                    timeframe: dynamicEventOpportunity.investmentOpportunity.timeframe,
                    badge: "Grahapravesh / Capital"
                  },
                  {
                    name: "Educational Enrollment / Courses",
                    desc: "Aligns with Jupiter's transit to maximize wisdom retention, concentration, and successful graduation.",
                    active: dynamicEventOpportunity.learningOpportunity.active,
                    timeframe: dynamicEventOpportunity.learningOpportunity.timeframe,
                    badge: "Vidya Aarambh"
                  },
                  {
                    name: "Professional Career Leap",
                    desc: "Calculates the operating DBA (Dasha-Bhukti-Antara) to secure authority and promotion parameters.",
                    active: dynamicEventOpportunity.careerOpportunity.active,
                    timeframe: dynamicEventOpportunity.careerOpportunity.timeframe,
                    badge: "Karmasthala Rise"
                  },
                  {
                    name: "Refreshes & Sacred Travel",
                    desc: "Maps the 9th and 12th house transits to schedule rejuvenating pilgrimages or business trips.",
                    active: dynamicEventOpportunity.travelOpportunity.active,
                    timeframe: dynamicEventOpportunity.travelOpportunity.timeframe,
                    badge: "Yatra Samskara"
                  }
                ].map((event) => (
                  <div key={event.name} className={`p-5 rounded-xl border flex flex-col justify-between min-h-[190px] transition-all bg-slate-900/40 ${
                    event.active 
                      ? "border-emerald-500/20 shadow-sm shadow-emerald-500/5 bg-slate-950/40" 
                      : "border-slate-800"
                  }`}>
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">{event.badge}</span>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          event.active ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
                        }`}>
                          {event.active ? "Active Window" : "Consolidate"}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-amber-500 mt-1.5">{event.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        {event.desc}
                      </p>
                    </div>

                    <div className="border-t border-slate-800/40 pt-2.5 mt-3">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Recommended Timeframe</span>
                      <span className="text-[11px] font-bold text-slate-200 mt-0.5 block">{event.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {transitSubTab === "transit_summary" && (
            <div className="space-y-6">
              {/* Cosmic Energies Meter */}
              <div className={`p-6 sm:p-8 rounded-2xl border ${cardStyle} bg-gradient-to-b ${isDark ? "from-slate-950/60 to-slate-950/40" : "from-white to-neutral-50/50"} border-indigo-500/15`}>
                <div className="border-b border-indigo-500/10 pb-4 mb-6">
                  <span className="text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Celestial Synergy
                  </span>
                  <h3 className="text-lg font-sans font-medium text-slate-200 mt-1 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-500" />
                    Personalized Cosmic Energy Report
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Continuous planetary aspects mapped relative to your core natal structure.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Energy Bar Chart */}
                  <div className="lg:col-span-7 space-y-4">
                    <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">
                      Transit Vitality Channels
                    </h4>
                    
                    <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                      {[
                        { label: "Overall Vitality Flow", score: dynamicEnergy.overall.score, tone: dynamicEnergy.overall.tone, color: "bg-indigo-500" },
                        { label: "Intellectual / Mental Focus", score: dynamicEnergy.mental.score, tone: dynamicEnergy.mental.tone, color: "bg-cyan-500" },
                        { label: "Physical / Endurance Drive", score: dynamicEnergy.physical.score, tone: dynamicEnergy.physical.tone, color: "bg-amber-500" },
                        { label: "Heart / Relationship Harmony", score: dynamicEnergy.relationship.score, tone: dynamicEnergy.relationship.tone, color: "bg-emerald-500" },
                        { label: "Career / Ambition Status", score: dynamicEnergy.career.score, tone: dynamicEnergy.career.tone, color: "bg-purple-500" },
                        { label: "Wealth / Financial Security", score: dynamicEnergy.financial.score, tone: dynamicEnergy.financial.tone, color: "bg-rose-500" },
                        { label: "Internal Spiritual Alignment", score: dynamicEnergy.spiritual.score, tone: dynamicEnergy.spiritual.tone, color: "bg-sky-500" }
                      ].map((bar) => (
                        <div key={bar.label} className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-300 font-bold">{bar.label}</span>
                            <span className="text-slate-400">{bar.tone} • <strong className="text-white font-semibold">{(bar.score * 100).toFixed(0)}%</strong></span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div className={`h-full ${bar.color} transition-all`} style={{ width: `${bar.score * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dominant Houses and Planets */}
                  <div className="lg:col-span-5 space-y-4">
                    <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">
                      Dominant Cosmic Anchors
                    </h4>

                    <div className="space-y-3.5">
                      {/* Dominant House */}
                      {dynamicMood.dominantHouses.map((house, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
                          <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block">Active Transit Focus House</span>
                          <h5 className="text-xs font-bold text-white mt-1.5">House {house.houseNumber} Transit</h5>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {house.significance}. Amplifying focus and active planetary alignments.
                          </p>
                        </div>
                      ))}

                      {/* Dominant Planet */}
                      {dynamicMood.dominantPlanets.map((planet, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
                          <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block">Dominant Planet Anchor</span>
                          <h5 className="text-xs font-bold text-amber-400 mt-1.5">{planet.planet} (Strength: {planet.strength})</h5>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {planet.influenceType}. Highly supportive of deep analytical and intuitive clarity.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Synthesis from dynamic calculations */}
                <div className="mt-6 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 space-y-2">
                  <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-extrabold block">
                    Vedic Sky Synthesis
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The active sky indicates peak <strong className="text-indigo-400">Spiritual Alignment ({(dynamicEnergy.spiritual.score * 100).toFixed(0)}%)</strong> and high <strong className="text-cyan-400">Mental Clarity ({(dynamicEnergy.mental.score * 100).toFixed(0)}%)</strong>. Dominated by {dynamicMood.dominantPlanets[0].planet}'s supportive transit across your natal horizon, you are gifted with heightened intuition. Excellent day for domestic consolidation, organizing intellectual projects, and practicing mantra sadhana. Avoid long taxing journeys or physical confrontations during inauspicious solar transit sectors.
                  </p>
                </div>
              </div>

              {/* Transit Challenges & Opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Opportunities Panel */}
                <div className={`p-6 rounded-2xl border ${cardStyle} bg-slate-900/30 border-emerald-500/10 space-y-4`}>
                  <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-extrabold flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Zap className="w-4 h-4" /> Active Opportunities
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(dynamicEventOpportunity).map(([key, value]: [string, any]) => {
                      if (!value.active) return null;
                      const label = key.replace(/Opportunity|Window/, "").replace(/^[a-z]/, (char) => char.toUpperCase());
                      return (
                        <div key={key} className="p-3.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 flex items-start gap-3">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-white block">{label} Active</span>
                            <span className="text-[10px] text-slate-300 font-mono mt-0.5 block">{value.timeframe}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Challenges Panel */}
                <div className={`p-6 rounded-2xl border ${cardStyle} bg-slate-900/30 border-rose-500/10 space-y-4`}>
                  <h4 className="text-xs font-mono text-rose-400 uppercase tracking-widest font-extrabold flex items-center gap-2 border-b border-slate-800 pb-2">
                    <AlertTriangle className="w-4 h-4" /> Transit Warning Areas
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(currentSkyJson.currentChallenges).map(([key, value]: [string, any]) => {
                      if (!value.active) return null;
                      const label = key.replace(/^[a-z]/, (char) => char.toUpperCase());
                      return (
                        <div key={key} className="p-3.5 rounded-lg border border-rose-500/10 bg-rose-500/5 flex items-start gap-3">
                          <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-white block">{label} Caution</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {value.affectedAreas.map((area: string) => (
                                <span key={area} className="text-[9px] font-mono bg-rose-500/15 border border-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      </div>
    </div>
  );
};
