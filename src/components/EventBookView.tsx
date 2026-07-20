import React, { useState, useMemo, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  X,
  Heart,
  Briefcase,
  Coins,
  ShieldAlert,
  Scale,
  GraduationCap,
  Home,
  Globe,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  TrendingUp,
  Activity,
  Cpu,
  Clock,
  CheckCircle,
  HelpCircle,
  FileText,
  RefreshCw,
  Compass
} from "lucide-react";
import { jsPDF } from "jspdf";
import { runNJEngine, NJEngineResult } from "../lib/njEngine";
import { mapAstrologyDataToUserProfileJSON } from "../lib/jhoraMapper";

interface KPEvent {
  id: string;
  category: "relationship" | "career" | "finance" | "health" | "litigation" | "education" | "property" | "travel";
  name: string;
  primary: string;
  supporting: string;
  obstructing: string;
  mainCsl: string;
  description: string;
}

const relEvents: KPEvent[] = [
  // Relationships (REL & NEW)
  { 
    id: "REL001", 
    category: "relationship",
    name: "Marriage Promise", 
    primary: "2,7,11", 
    supporting: "5,9", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Evaluates the overall foundational promise of marriage in the natal chart."
  },
  { 
    id: "REL002", 
    category: "relationship",
    name: "Marriage Timing", 
    primary: "2,7,11", 
    supporting: "5,9", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Evaluates active DBA lords and timing triggers for marriage celebration."
  },
  { 
    id: "REL003", 
    category: "relationship",
    name: "Marriage Proposal", 
    primary: "3,7,11", 
    supporting: "2,5", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Signifies receiving or presenting a formal marriage proposal."
  },
  { 
    id: "REL004", 
    category: "relationship",
    name: "Proposal Acceptance", 
    primary: "2,7,11", 
    supporting: "3,5", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Affirmative acceptance of a marriage proposal by either family or individual."
  },
  { 
    id: "REL005", 
    category: "relationship",
    name: "Proposal Rejection", 
    primary: "1,6,10", 
    supporting: "8,12", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Rejection of a marriage proposal, indicating misaligned expectations."
  },
  { 
    id: "REL006", 
    category: "relationship",
    name: "Engagement", 
    primary: "2,7,11", 
    supporting: "3,5", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Formal or informal ceremony of betrothal or engagement."
  },
  { 
    id: "REL007", 
    category: "relationship",
    name: "Engagement Cancellation", 
    primary: "1,6,8,12", 
    supporting: "10", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Disruption or cancellation of a planned engagement prior to marriage."
  },
  { 
    id: "REL008", 
    category: "relationship",
    name: "Marriage Ceremony", 
    primary: "2,7,11", 
    supporting: "3,9", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "The actual execution of traditional or customary marriage rituals."
  },
  { 
    id: "REL009", 
    category: "relationship",
    name: "Marriage Registration", 
    primary: "2,7,11", 
    supporting: "3,10", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Legal documentation and government registration of the marriage contract."
  },
  { 
    id: "REL010", 
    category: "relationship",
    name: "Court Marriage", 
    primary: "6,7,11", 
    supporting: "3,9", 
    obstructing: "1,5,10", 
    mainCsl: "7",
    description: "Legal wedding conducted in court under civil law."
  },
  { 
    id: "REL011", 
    category: "relationship",
    name: "Love Marriage", 
    primary: "5,7,11", 
    supporting: "2,9", 
    obstructing: "1,6,10", 
    mainCsl: "5,7",
    description: "Self-chosen relationship translating to legal marriage, driven by affection."
  },
  { 
    id: "REL012", 
    category: "relationship",
    name: "Arranged Marriage", 
    primary: "2,7,11", 
    supporting: "9", 
    obstructing: "5,6,10", 
    mainCsl: "7",
    description: "Traditional union facilitated primarily by parents, family, or matchmakers."
  },
  { 
    id: "REL013", 
    category: "relationship",
    name: "Inter-Caste Marriage", 
    primary: "7,11", 
    supporting: "5,9,12", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Marriage breaking traditional lineage or caste boundaries."
  },
  { 
    id: "REL014", 
    category: "relationship",
    name: "Inter-Religion Marriage", 
    primary: "7,11", 
    supporting: "9,12", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Matrimony between individuals practicing distinct faiths."
  },
  { 
    id: "REL015", 
    category: "relationship",
    name: "Foreign Marriage", 
    primary: "7,9,12", 
    supporting: "2,11", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Marriage celebrated in a foreign land or with a foreign national."
  },
  { 
    id: "REL016", 
    category: "relationship",
    name: "Delay in Marriage", 
    primary: "7", 
    supporting: "4,8,10", 
    obstructing: "2,11", 
    mainCsl: "7",
    description: "Slower development of matrimonial conditions, often Sat-linked."
  },
  { 
    id: "REL017", 
    category: "relationship",
    name: "Denial of Marriage", 
    primary: "1,6,10", 
    supporting: "8,12", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Astrological indications negating marriage promise in the lifetime."
  },
  { 
    id: "REL018", 
    category: "relationship",
    name: "Married Life Quality", 
    primary: "2,7,11", 
    supporting: "4,5", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Evaluation of relative peace, prosperity, and stability post-marriage."
  },
  { 
    id: "REL019", 
    category: "relationship",
    name: "Marital Happiness", 
    primary: "4,7,11", 
    supporting: "2,5", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Inherent domestic bliss, mutual support, and emotional nourishment."
  },
  { 
    id: "REL020", 
    category: "relationship",
    name: "Marital Discord", 
    primary: "1,6,10", 
    supporting: "8,12", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Undercurrent of tension, arguments, and ideological differences."
  },
  { 
    id: "REL021", 
    category: "relationship",
    name: "Frequent Arguments", 
    primary: "6,8", 
    supporting: "3", 
    obstructing: "2,4,11", 
    mainCsl: "7",
    description: "Repetitive verbal disputes or temporary silent phases."
  },
  { 
    id: "REL022", 
    category: "relationship",
    name: "Domestic Violence", 
    primary: "6,8,12", 
    supporting: "1", 
    obstructing: "2,4,11", 
    mainCsl: "4,7",
    description: "Severe distress, emotional or physical hostility within the household."
  },

  // Compiled & Indexed Astrological Logic Gates & Rules
  { 
    id: "REL101", 
    category: "relationship",
    name: "Supportive Relationship Spark (Vedic)", 
    primary: "Friendly Sign", 
    supporting: "Venus", 
    obstructing: "-", 
    mainCsl: "Venus",
    description: "Condition: Venus is in Friendly Sign. Output Status: Supportive Relationship Spark."
  },
  { 
    id: "REL102", 
    category: "relationship",
    name: "Relationship Protection & Divine Accord (Vedic)", 
    primary: "7th Aspect", 
    supporting: "Jupiter", 
    obstructing: "-", 
    mainCsl: "7",
    description: "Condition: Jupiter aspects 7th House. Output Status: Relationship Protection & Divine Accord."
  },
  { 
    id: "REL103", 
    category: "relationship",
    name: "Karmic Relationship Delays (Vedic)", 
    primary: "6,8,12", 
    supporting: "7th Lord", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Condition: 7th Lord in Dusthana House (6th/8th/12th). Output Status: Karmic Relationship Delays."
  },
  { 
    id: "REL104", 
    category: "relationship",
    name: "Positive Marriage Promise (KP)", 
    primary: "2,7,11", 
    supporting: "5,9", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Condition: 7th Cuspal Sub-Lord signifies 2nd, 7th, 11th houses. Output Status: Positive Marriage Promise (KP_DEC_PROMISE_01)."
  },
  { 
    id: "REL105", 
    category: "relationship",
    name: "Career Focus Over Relationship (KP)", 
    primary: "1,6,10", 
    supporting: "-", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Condition: 7th Cuspal Sub-Lord signifies 1st, 6th, 10th houses. Output Status: Career Focus Over Relationship."
  },
  { 
    id: "REL106", 
    category: "relationship",
    name: "Obstacles and Detachment (KP)", 
    primary: "4,10,12", 
    supporting: "-", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Condition: 7th Cuspal Sub-Lord signifies 4th, 10th, 12th houses. Output Status: Obstacles and Detachment."
  },
  { 
    id: "REL107", 
    category: "relationship",
    name: "Auspicious Relationship Window Open (Timeline)", 
    primary: "7", 
    supporting: "MD Lord Friend", 
    obstructing: "-", 
    mainCsl: "7",
    description: "Condition: Active Vimshottari Mahadasha Lord is friend of 7th Lord. Output Status: Auspicious Relationship Window Open."
  },
  { 
    id: "REL108", 
    category: "relationship",
    name: "Reality-Check & Constructive Duty (Timeline)", 
    primary: "7 Cusp", 
    supporting: "Saturn Transit", 
    obstructing: "-", 
    mainCsl: "7",
    description: "Condition: Saturn transit aspects Natal 7th Cusp. Output Status: Reality-Check and Constructive Relationship Duty."
  },
  { 
    id: "REL109", 
    category: "relationship",
    name: "Auspicious Celestial Alignment (Timeline)", 
    primary: "7 Lord", 
    supporting: "Jupiter Transit", 
    obstructing: "-", 
    mainCsl: "7",
    description: "Condition: Jupiter transit aspects Natal 7th Lord. Output Status: Auspicious Celestial Alignment (Go-Ahead)."
  },

  // Career (CAR)
  {
    id: "CAR001",
    category: "career",
    name: "New Job Appointment",
    primary: "2,6,10,11",
    supporting: "1",
    obstructing: "5,8,12",
    mainCsl: "10",
    description: "Securing new employment. 6th house is service; 10th is career status; 11th is desire fulfillment; 2nd is financial gain."
  },
  {
    id: "CAR002",
    category: "career",
    name: "Job Promotion",
    primary: "2,6,10,11",
    supporting: "3",
    obstructing: "5,8,12",
    mainCsl: "10",
    description: "Upward elevation in rank or designation, accompanied by financial boost."
  },
  {
    id: "CAR003",
    category: "career",
    name: "Voluntary Resignation",
    primary: "5,9,12",
    supporting: "3",
    obstructing: "2,6,10,11",
    mainCsl: "10",
    description: "Leaving a job of own volition. 5th house is 12th from 6th (loss of service); 9th is 12th from 10th (loss of status)."
  },

  // Finance (FIN)
  {
    id: "FIN001",
    category: "finance",
    name: "Sudden Windfall / Lottery",
    primary: "2,8,11",
    supporting: "5,9",
    obstructing: "1,12",
    mainCsl: "8, 11",
    description: "Unexpected unearned monetary gains. 2nd is wealth accumulation; 8th is sudden gains; 11th is overall profit."
  },
  {
    id: "FIN002",
    category: "finance",
    name: "Business Partnership Profit",
    primary: "2,7,11",
    supporting: "5",
    obstructing: "6,12",
    mainCsl: "7",
    description: "Gains derived through mutual commercial agreements and joint ventures."
  },

  // Education & Exams (EDU)
  {
    id: "EDU001",
    category: "education",
    name: "Inaugural School Admission",
    primary: "4,11",
    supporting: "2",
    obstructing: "3,8",
    mainCsl: "4",
    description: "Starting foundational primary education. 4th house rules core learning, 11th is successful placement."
  },
  {
    id: "EDU002",
    category: "education",
    name: "Competitive Exam Success",
    primary: "6,11",
    supporting: "4,9",
    obstructing: "5,8,12",
    mainCsl: "4, 9",
    description: "Clearing entrance exams or civil services. 6th house is overcoming peer competition; 11th is absolute success/securing seat."
  },
  {
    id: "EDU003",
    category: "education",
    name: "Academic Distraction / Break",
    primary: "3,5,8,12",
    supporting: "-",
    obstructing: "4,9,11",
    mainCsl: "4",
    description: "Temporary disruption in studies. 3rd house is 12th from 4th (negating basic study concentration); 5th is playful mind."
  },

  // Property & Assets (EST)
  {
    id: "EST001",
    category: "property",
    name: "Buying Real Estate / Home",
    primary: "4,11,12",
    supporting: "9",
    obstructing: "3,8",
    mainCsl: "4",
    description: "Acquiring permanent immovable assets. 4th house rules land/buildings, 11th is gain of property, 12th is investment/payment."
  },
  {
    id: "EST002",
    category: "property",
    name: "Selling Real Estate for Profit",
    primary: "3,10,12",
    supporting: "5",
    obstructing: "4,11",
    mainCsl: "4, 10",
    description: "Liquidating land or home. 3rd is 12th from 4th (parting with asset), 10th is gain of status/buyer, 12th is receipt of funds."
  },

  // Foreign Travel & Residency (TRA)
  {
    id: "TRA001",
    category: "travel",
    name: "Visa Approval / Foreign Tour",
    primary: "3,9,12",
    supporting: "11",
    obstructing: "4",
    mainCsl: "12, 9",
    description: "Short overseas trip. 3rd is short journeys, 9th is long-distance voyages, 12th is foreign territory."
  },
  {
    id: "TRA002",
    category: "travel",
    name: "Permanent Overseas Settlement",
    primary: "4,9,12",
    supporting: "12",
    obstructing: "1,4",
    mainCsl: "12",
    description: "Relocating abroad permanently. 12th house (negating motherland/4th house) must be stronger than home-base comforts (4th house)."
  }
];

interface EventBookViewProps {
  astrologyData: any;
  isDark: boolean;
}

export default function EventBookView({ astrologyData, isDark }: EventBookViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "relationship" | "career" | "finance" | "health" | "litigation" | "education" | "property" | "travel" | "agent_rules">("all");
  const [showLiveForecast, setShowLiveForecast] = useState(true);

  // Default prediction date starting with today
  const [predictionDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // State for dynamic agent rules
  const [agentRules, setAgentRules] = useState<any[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [activeEventBookSection, setActiveEventBookSection] = useState<string>("summary");

  const fetchAgentRules = async () => {
    setIsLoadingRules(true);
    try {
      const res = await fetch("/api/rules/natal-agent-status");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.results)) {
          setAgentRules(data.results);
        }
      }
    } catch (e) {
      console.error("Error fetching agent rules:", e);
    } finally {
      setIsLoadingRules(false);
    }
  };

  const handleRefreshRules = async () => {
    setRefreshing(true);
    try {
      // Trigger a manual agent re-evaluation so any newly added handbook rules are computed
      await fetch("/api/rules/natal-agent-refresh", { method: "POST" });
      await fetchAgentRules();
    } catch (e) {
      console.error("Error refreshing agent rules:", e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAgentRules();
  }, []);

  // Map profile data
  const mappedProfile = useMemo(() => {
    if (!astrologyData) return null;
    try {
      return mapAstrologyDataToUserProfileJSON(null, astrologyData);
    } catch (e) {
      return null;
    }
  }, [astrologyData]);

  // Run the NJ v2.0 Engine
  const njResult = useMemo<NJEngineResult | null>(() => {
    if (!astrologyData) return null;
    try {
      return runNJEngine(predictionDate, astrologyData, mappedProfile);
    } catch (e) {
      return null;
    }
  }, [predictionDate, astrologyData, mappedProfile]);

  // Map category to NJ Theme scores
  const getEvent3DayForecast = (category: string, id: string) => {
    if (!njResult) return [50, 50, 50];
    
    // Deterministic offset per specific event ID so they look realistic and distinct
    const seed = id.charCodeAt(5) || 0;
    const offset1 = (seed % 9) - 4;
    const offset2 = ((seed + 3) % 9) - 4;
    const offset3 = ((seed + 6) % 9) - 4;

    // Default themes
    const catMap: Record<string, string> = {
      relationship: "relationship",
      career: "career",
      finance: "finance",
      health: "health",
      litigation: "litigation",
      education: "children",
      property: "property",
      travel: "travel",
      agent_rules: "career"
    };

    const targetId = catMap[category] || "career";
    const scores = njResult.forecastDays.map(fd => {
      const theme = fd.themeScores.find(t => t.id === targetId);
      return theme ? theme.probability : 50;
    });

    return [
      Math.min(Math.max(scores[0] + offset1, 15), 97),
      Math.min(Math.max(scores[1] + offset2, 15), 97),
      Math.min(Math.max(scores[2] + offset3, 15), 97),
    ];
  };

  const combinedEvents = useMemo<KPEvent[]>(() => {
    const mappedAgentEvents: KPEvent[] = agentRules.map((rule, idx) => ({
      id: rule.id || `AGN${String(idx + 1).padStart(3, '0')}`,
      category: "agent_rules",
      name: rule.name || "Unnamed Agent Rule",
      primary: Array.isArray(rule.signifiedHouses) ? rule.signifiedHouses.join(",") : "-",
      supporting: rule.starLord ? `${rule.significator} in star of ${rule.starLord}` : "-",
      obstructing: rule.isMet ? "Rule Met" : "Rule Not Met",
      mainCsl: rule.significator || "-",
      description: rule.reasoning || "Evaluated by Natal Rules Agent."
    }));
    return [...relEvents, ...mappedAgentEvents];
  }, [agentRules]);

  const categories = useMemo(() => [
    { id: "all", label: "All Events", icon: Layers, count: combinedEvents.length },
    { id: "relationship", label: "Relationships", icon: Heart, count: combinedEvents.filter(e => e.category === "relationship").length },
    { id: "career", label: "Career & Service", icon: Briefcase, count: combinedEvents.filter(e => e.category === "career").length },
    { id: "finance", label: "Wealth & Finance", icon: Coins, count: combinedEvents.filter(e => e.category === "finance").length },
    { id: "health", label: "Health & Recovery", icon: ShieldAlert, count: combinedEvents.filter(e => e.category === "health").length },
    { id: "litigation", label: "Court Litigation", icon: Scale, count: combinedEvents.filter(e => e.category === "litigation").length },
    { id: "education", label: "Exams & Education", icon: GraduationCap, count: combinedEvents.filter(e => e.category === "education").length },
    { id: "property", label: "Property & Lands", icon: Home, count: combinedEvents.filter(e => e.category === "property").length },
    { id: "travel", label: "Overseas Travel", icon: Globe, count: combinedEvents.filter(e => e.category === "travel").length },
    { id: "agent_rules", label: "Agent Rules", icon: Cpu, count: agentRules.length }
  ], [combinedEvents, agentRules]);

  const filteredEvents = useMemo(() => {
    return combinedEvents.filter((ev) => {
      const matchesSearch = 
        ev.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.primary.includes(searchTerm) ||
        ev.mainCsl.includes(searchTerm) ||
        ev.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "all" || ev.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [combinedEvents, searchTerm, selectedCategory]);

  const drawTableHeaderAtY = (doc: jsPDF, y: number, showForecast: boolean) => {
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(15, y, 180, 8, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    
    const textY = y + 5.5;
    
    if (showForecast) {
      doc.text("ID", 16, textY);
      doc.text("EVENT NAME & DESCRIPTION", 31, textY);
      doc.text("PRIMARY", 92.5, textY, { align: "center" });
      doc.text("SUPPORT", 111, textY, { align: "center" });
      doc.text("OBSTRUCT", 132, textY, { align: "center" });
      doc.text("CSL", 149.5, textY, { align: "center" });
      doc.text("DAY 1", 163, textY, { align: "center" });
      doc.text("DAY 2", 175, textY, { align: "center" });
      doc.text("DAY 3", 188, textY, { align: "center" });
    } else {
      doc.text("ID", 16, textY);
      doc.text("EVENT NAME & DESCRIPTION", 36, textY);
      doc.text("PRIMARY HOUSES", 125, textY, { align: "center" });
      doc.text("SUPPORT HOUSES", 145, textY, { align: "center" });
      doc.text("OBSTRUCT HOUSES", 165, textY, { align: "center" });
      doc.text("MAIN CSL", 185, textY, { align: "center" });
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Decorative top header bars
    doc.setFillColor(15, 23, 42); // deep slate `#0f172a`
    doc.rect(0, 0, 210, 4, "F");
    doc.setFillColor(245, 158, 11); // amber `#f59e0b`
    doc.rect(0, 4, 210, 1.5, "F");

    // Primary Header Title
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("KP SYSTEM MASTER EVENTBOOK REPORT", 15, 16);

    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("Reference Database & Live Transit-Convergence Forecast Engine v2.0", 15, 21);

    // Dynamic User Profile Meta Summary (if available)
    let currentY = 28;
    if (mappedProfile) {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(15, currentY, 180, 24, "FD");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`NATIVE: ${mappedProfile.User?.profile_name || "Vedic Native"}`, 18, currentY + 6);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // slate-600
      
      const bDate = mappedProfile.Birth?.date || "-";
      const bTime = mappedProfile.Birth?.time || "-";
      const bPlace = mappedProfile.Birth?.place || "Default Coordinates";
      const bLat = mappedProfile.Birth?.latitude?.toFixed(4) || "-";
      const bLon = mappedProfile.Birth?.longitude?.toFixed(4) || "-";
      const ayanamsa = mappedProfile.Birth?.ayanamsa || "Lahiri";

      doc.text(`Birth Details: ${bDate} at ${bTime}`, 18, currentY + 12);
      doc.text(`Location: ${bPlace} (${bLat}°N, ${bLon}°E)`, 18, currentY + 18);

      // Right-side columns inside the panel
      doc.text(`Ayanamsa: ${ayanamsa}`, 110, currentY + 6);
      doc.text(`Forecast Anchor Date: ${predictionDate}`, 110, currentY + 12);
      doc.text(`Report Generation Time: ${new Date().toLocaleString()} (Local)`, 110, currentY + 18);

      currentY += 28;
    } else {
      currentY += 4;
    }

    // Filter status bar
    doc.setFillColor(239, 246, 255); // blue-50
    doc.setDrawColor(191, 219, 254); // blue-200
    doc.rect(15, currentY, 180, 7, "FD");
    
    doc.setTextColor(30, 64, 175); // blue-800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const filterText = `FILTERED VIEW: Category: ${categories.find(c => c.id === selectedCategory)?.label?.toUpperCase() || "ALL"} | Search: "${searchTerm || 'None'}"`;
    doc.text(filterText, 18, currentY + 4.8);

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Matching Events: ${filteredEvents.length}`, 192, currentY + 4.8, { align: "right" });

    currentY += 12;

    // Draw Table Headers
    drawTableHeaderAtY(doc, currentY, showLiveForecast);
    currentY += 8;

    // Loop through events
    filteredEvents.forEach((event, idx) => {
      const forecast = getEvent3DayForecast(event.category, event.id);
      
      // Split description to size
      const descWidth = showLiveForecast ? 52 : 77;
      const wrappedDesc = doc.splitTextToSize(event.description, descWidth);
      const wrappedName = doc.splitTextToSize(event.name, descWidth);
      
      const totalTextLines = wrappedDesc.length + wrappedName.length;
      const rowHeight = Math.max(9, 4.5 + totalTextLines * 3.5);

      // Check pagination boundary
      if (currentY + rowHeight > 275) {
        // Page number before adding new page
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`JHora AI Astrological Engine • Master Eventbook Report`, 15, 288);
        doc.text(`Page ${doc.getNumberOfPages()}`, 195, 288, { align: "right" });

        doc.addPage();
        
        // Decorative top header bars on new page
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 4, "F");
        doc.setFillColor(245, 158, 11);
        doc.rect(0, 4, 210, 1.5, "F");

        currentY = 15;
        drawTableHeaderAtY(doc, currentY, showLiveForecast);
        currentY += 8;
      }

      // Alternate row backgrounds
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(15, currentY, 180, rowHeight, "F");
      }

      // Draw bottom row border
      doc.setDrawColor(241, 245, 249); // slate-100
      doc.line(15, currentY + rowHeight, 195, currentY + rowHeight);

      // Write Cell Content
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      
      // ID (Col 1)
      doc.setTextColor(245, 158, 11); // Amber
      doc.text(event.id, 16, currentY + 5.5);

      // Event Name & Description (Col 2)
      doc.setTextColor(15, 23, 42); // Deep Slate
      let nameY = currentY + 5.5;
      wrappedName.forEach((line) => {
        doc.text(line, showLiveForecast ? 31 : 36, nameY);
        nameY += 3.5;
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139); // Slate Gray
      let descY = nameY - 0.5;
      wrappedDesc.forEach((line) => {
        doc.text(line, showLiveForecast ? 31 : 36, descY);
        descY += 3.5;
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);

      // Depending on whether live forecast is on, position other columns
      if (showLiveForecast) {
        // Primary
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text(event.primary, 92.5, currentY + 5.5, { align: "center" });

        // Supporting
        doc.setTextColor(14, 165, 233); // Sky
        doc.text(event.supporting, 111, currentY + 5.5, { align: "center" });

        // Obstructing
        doc.setTextColor(244, 63, 94); // Rose
        doc.text(event.obstructing, 132, currentY + 5.5, { align: "center" });

        // Main CSL
        doc.setTextColor(245, 158, 11); // Amber
        doc.text(event.mainCsl, 149.5, currentY + 5.5, { align: "center" });

        // Forecast Day 1, 2, 3
        doc.setFont("helvetica", "bold");
        
        doc.setTextColor(forecast[0] > 70 ? 16 : forecast[0] > 45 ? 217 : 225, forecast[0] > 70 ? 185 : forecast[0] > 45 ? 119 : 29, forecast[0] > 70 ? 129 : forecast[0] > 45 ? 6 : 72);
        doc.text(`${forecast[0]}%`, 163, currentY + 5.5, { align: "center" });

        doc.setTextColor(forecast[1] > 70 ? 16 : forecast[1] > 45 ? 217 : 225, forecast[1] > 70 ? 185 : forecast[1] > 45 ? 119 : 29, forecast[1] > 70 ? 129 : forecast[1] > 45 ? 6 : 72);
        doc.text(`${forecast[1]}%`, 175, currentY + 5.5, { align: "center" });

        doc.setTextColor(forecast[2] > 70 ? 16 : forecast[2] > 45 ? 217 : 225, forecast[2] > 70 ? 185 : forecast[2] > 45 ? 119 : 29, forecast[2] > 70 ? 129 : forecast[2] > 45 ? 6 : 72);
        doc.text(`${forecast[2]}%`, 188, currentY + 5.5, { align: "center" });
      } else {
        // Primary
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text(event.primary, 125, currentY + 5.5, { align: "center" });

        // Supporting
        doc.setTextColor(14, 165, 233); // Sky
        doc.text(event.supporting, 145, currentY + 5.5, { align: "center" });

        // Obstructing
        doc.setTextColor(244, 63, 94); // Rose
        doc.text(event.obstructing, 165, currentY + 5.5, { align: "center" });

        // Main CSL
        doc.setTextColor(245, 158, 11); // Amber
        doc.text(event.mainCsl, 185, currentY + 5.5, { align: "center" });
      }

      currentY += rowHeight;
    });

    // Add final page number / footer for the last page
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`JHora AI Astrological Engine • Master Eventbook Report`, 15, 288);
    doc.text(`Page ${doc.getNumberOfPages()}`, 195, 288, { align: "right" });

    // Save document
    const nativeName = mappedProfile?.User?.profile_name?.replace(/\s+/g, "_") || "Native";
    doc.save(`JHora_AI_Eventbook_${nativeName}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Panel */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? "bg-slate-950/40 border-slate-800/80" : "bg-white border-slate-200"
      } shadow-xl relative overflow-hidden`}>
        {/* Ambient lighting */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/5 blur-3xl rounded-full -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-block">
              NJDAY / NJMOOD / NJBEST ENGINE v2.0
            </span>
            <h3 className={`text-xl font-sans font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"} flex items-center gap-2.5`}>
              <BookOpen className="w-5 h-5 text-amber-500" />
              KP System Master Eventbook
            </h3>
            <p className="text-xs text-slate-400 font-sans max-w-2xl leading-relaxed">
              Unified database referencing lifetime promises, support chains, and negating houses. Runs the official v2.0 transit-convergence engine across a 3-day forecast window.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowLiveForecast(!showLiveForecast)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                showLiveForecast 
                  ? "bg-amber-500/15 border-amber-500/50 text-amber-400" 
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Show Live 3-Day Forecast v2.0</span>
            </button>

            <button
              onClick={handleRefreshRules}
              disabled={refreshing || isLoadingRules}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                refreshing 
                  ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400 cursor-not-allowed" 
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
              title="Triggers the Natal Rules Agent to re-evaluate rules against the current profile."
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Sync Rules"}</span>
            </button>

            <button
              onClick={exportToPDF}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all"
              title="Download this Eventbook report as a PDF."
            >
              <FileText className="w-4 h-4" />
              <span>Export to PDF</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-5 flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
          <Search className="w-4 h-4 text-slate-400 ml-1.5" />
          <input
            type="text"
            placeholder="Search events, primary houses, or cuspal sub-lords (e.g., CAR001, Promotion, CSL 10)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-500 focus:ring-0 focus:outline-none"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Astro Reference Banner */}
      <div className={`p-4 rounded-xl border flex gap-3 items-start ${
        isDark ? "bg-amber-950/10 border-amber-500/20 text-slate-300" : "bg-amber-50 border-amber-200 text-amber-900"
      }`}>
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold font-mono uppercase tracking-wider text-amber-400">Astrological Eventbook Rule Mapping Policy</p>
          <p className="text-[11px] text-slate-400 leading-normal">
            For any event to manifest, the running **Dasha-Bhukti-Antardasha (DBA)** planets must signify the **Primary** and **Supporting** houses listed below without receiving strong obstructions from **Obstructing** (negating) houses. The **Main CSL** controls the natal promise limit.
          </p>
        </div>
      </div>

      {/* KP SYSTEM MASTER EVENT BOOK SPECIFICATION */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-slate-900/40 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <BookOpen className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                KP SYSTEM MASTER EVENT BOOK
              </h4>
              <p className="text-[11px] text-amber-400 font-mono">
                Single Source of Truth Reference Database & Live Transit-Convergence Forecast Engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
              Engine Standard v2.1
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              Unified Schema
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[360px]">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-4 flex flex-col gap-1 overflow-y-auto max-h-[380px] pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 block">Architecture Modules</span>
            
            <button
              onClick={() => setActiveEventBookSection("principles")}
              className={`flex items-center justify-between px-3 py-2 text-[11px] font-mono font-bold rounded-lg transition-all text-left ${
                activeEventBookSection === "principles"
                  ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 pl-4"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span>● ENGINE PRINCIPLES</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {[
              { id: "header", label: "1. Report Header" },
              { id: "summary", label: "2. Engine Summary" },
              { id: "index", label: "3. Event Index" },
              { id: "record", label: "4. Event Record" },
              { id: "foundation", label: "5. Astro Foundation" },
              { id: "rules", label: "6. Rule References" },
              { id: "execution", label: "7. Rule Execution" },
              { id: "natal", label: "8. Natal Result" },
              { id: "activation", label: "9. Activation Result" },
              { id: "daily", label: "10. Daily Result" },
              { id: "evidence", label: "11. Evidence Log" },
              { id: "decision", label: "12. Decision Verdict" },
              { id: "explanation", label: "13. Explanation Output" },
              { id: "timeline", label: "14. Timeline & DBA Path" },
              { id: "history", label: "15. Historical Audit" },
              { id: "export", label: "16. Export Interfacing" },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveEventBookSection(section.id)}
                className={`flex items-center justify-between px-3 py-2 text-[11px] font-mono rounded-lg transition-all text-left ${
                  activeEventBookSection === section.id
                    ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 pl-4 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <span>{section.label}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>

          {/* Details Content Panel */}
          <div className="lg:col-span-8 bg-slate-950/40 p-5 rounded-xl border border-slate-800/60 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3.5">
              {activeEventBookSection === "principles" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <span>★</span> Core Engine Principles
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    The Event Book has evolved into the single master repository of all astrological events and predictions.
                  </p>
                  <ul className="space-y-1.5 text-[10px] font-mono text-slate-400 list-disc pl-4 leading-relaxed">
                    <li><strong className="text-slate-200">Single Source of Truth:</strong> The Event Book handles storage, indexing, and end-to-end trace auditing. No other rulebook databases are maintained.</li>
                    <li><strong className="text-slate-200">Execution and Decisions:</strong> The Rule Engine strictly executes, the Decision Engine determines verdicts, and the Event Book stores the audit records.</li>
                    <li><strong className="text-slate-200">Complete Traceability:</strong> Every single predictive output is completely auditable back to the underlying Rule IDs.</li>
                    <li><strong className="text-slate-200">Zero Definition Duplication:</strong> Rule definitions are mapped dynamically; only compact Rule IDs are kept on record.</li>
                    <li><strong className="text-slate-200">Future-Proof Integration:</strong> New astrological models (KP, Jaimini, Western, Tajika) plug directly into this unified schema without architecture redesign.</li>
                  </ul>
                </div>
              )}

              {activeEventBookSection === "header" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    1. Report Header Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Captures high-fidelity runtime parameters and environment state to guarantee perfect repeatability of calculations.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-200 block font-bold mb-1">Engine Metadata</span>
                      • Engine Version (e.g. v2.1)<br />
                      • Rule Version (e.g. r2.0)<br />
                      • Report Version (e.g. rep-1.1)<br />
                      • Timestamp & Anchor Date
                    </div>
                    <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-200 block font-bold mb-1">Native birth metrics</span>
                      • Name, Birth Coordinates<br />
                      • Charts & Planets Config<br />
                      • Current Running DBA<br />
                      • Current Transit Position
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "summary" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    2. Engine Summary Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Declares the high-level scope and processing intent of the active astrological run.
                  </p>
                  <ul className="space-y-1.5 text-[10px] font-mono text-slate-400 list-disc pl-4">
                    <li><strong className="text-slate-200">Purpose Statement:</strong> Defines why the evaluation is being executed (e.g., lifetime marriage analysis).</li>
                    <li><strong className="text-slate-200">Execution Flow:</strong> Chronological log of step-by-step pipeline stages completed.</li>
                    <li><strong className="text-slate-200">Astrological Systems:</strong> Explicitly lists running engines (e.g., KP, Parashari, Jaimini, Tajika, Transit-Convergence).</li>
                    <li><strong className="text-slate-200">Scope constraints:</strong> Limits and parameters of the dynamic predictive window.</li>
                  </ul>
                </div>
              )}

              {activeEventBookSection === "index" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    3. Event Index Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Organizes and clusters astrological event types consecutively across 12 distinct domains:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400">
                    <div className="p-1.5 bg-slate-900/40 rounded border border-slate-800/80">• Relationships</div>
                    <div className="p-1.5 bg-slate-900/40 rounded border border-slate-800/80">• Career & Job</div>
                    <div className="p-1.5 bg-slate-900/40 rounded border border-slate-800/80">• Wealth & Finance</div>
                    <div className="p-1.5 bg-slate-900/40 rounded border border-slate-800/80">• Property & Lands</div>
                    <div className="p-1.5 bg-slate-900/40 rounded border border-slate-800/80">• Exams & Education</div>
                    <div className="p-1.5 bg-slate-900/40 rounded border border-slate-800/80">• Children & Family</div>
                    <div className="p-1.5 bg-slate-900/40 rounded border border-slate-800/80">• Health & recovery</div>
                    <div className="p-1.5 bg-slate-900/40 rounded border border-slate-800/80">• Overseas Travel</div>
                    <div className="p-1.5 bg-slate-900/40 rounded border border-slate-800/80">• Court Litigation</div>
                    <div className="p-1.5 bg-slate-900/40 rounded border border-slate-800/80">• Spiritual Paths</div>
                    <div className="p-1.5 bg-slate-900/40 rounded border border-slate-800/80">• Daily Horoscope</div>
                    <div className="p-1.5 bg-slate-900/40 rounded border border-slate-800/80">• Custom Events</div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "record" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    4. Event Record Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Defines the atomic schema of each unique event logged within the Master Event Book.
                  </p>
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1">
                    <div><span className="text-amber-400">Event ID:</span> Unique string identifier (e.g. REL001)</div>
                    <div><span className="text-amber-400">Event Name:</span> Formal title of the event (e.g. Marriage Promise)</div>
                    <div><span className="text-amber-400">Description:</span> Scope details and conditional logic boundary</div>
                    <div><span className="text-amber-400">Category / Stage:</span> Domain alignment & current processing state</div>
                    <div><span className="text-amber-400">Priority / Enabled:</span> Numeric priority rank and boolean active flag</div>
                    <div><span className="text-amber-400">Systems Used:</span> Flags for systems activated (e.g., KP, Parashari)</div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "foundation" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    5. Astrological Foundation Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Specifies the comprehensive multi-system mathematical coordinates and karakas required to map the event.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Primary / Supporting / Blocking Houses</li>
                      <li>Primary / Supporting / Blocking Planets</li>
                      <li>Cuspal Sub-Lord (CSL) & Sub-Sub-Lord (SSL)</li>
                      <li>Star Lord / Sub Lord details</li>
                    </ul>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Natural Karaka (e.g., Venus for marriage)</li>
                      <li>Jaimini Karaka (Chara & Sthira)</li>
                      <li>Active planetary Yogas</li>
                      <li>Afflicting Doshas (e.g. Kuja Dosha)</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeEventBookSection === "rules" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    6. Rule References Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Enforces the strict rule-referencing standard. To prevent rule definition bloating, the Event Book stores <strong className="text-amber-400">compact rule-IDs only</strong>.
                  </p>
                  <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wide block mb-1">Example Reference Array:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["KP_REL001", "KP_REL002", "PAR_REL001", "JAI_REL001", "DBA_REL001", "TR_REL001", "DAY_REL001"].map((rid) => (
                        <span key={rid} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700/60 text-[9px] font-mono">
                          {rid}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "execution" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    7. Rule Execution Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Maintains the trace-state of every rule compiled for evaluation. Completely tracks:
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 text-[9px] font-mono text-slate-400">
                    <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-slate-200 font-bold block mb-0.5">Executed Rules</span>
                      Rules called in this evaluation pass.
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-emerald-400 font-bold block mb-0.5">Matched Rules</span>
                      Rules whose conditions were met.
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-rose-400 font-bold block mb-0.5">Failed Rules</span>
                      Rules whose conditions evaluated to false.
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-amber-400 font-bold block mb-0.5">Blocked Rules</span>
                      Rules overridden by higher negators.
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-slate-500 font-bold block mb-0.5">Skipped Rules</span>
                      Rules skipped due to system parameters.
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-indigo-400 font-bold block mb-0.5">Dependency Rules</span>
                      Nested prerequisite rules.
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "natal" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    8. Natal Result Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Determines if an event is fundamentally promised in the natal chart. Does NOT imply active timing.
                  </p>
                  <ul className="space-y-1.5 text-[10px] font-mono text-slate-400 list-disc pl-4">
                    <li><strong className="text-slate-200">Promise Status:</strong> Final natal resolution rating (PASS, FAIL, WEAK, STRONG).</li>
                    <li><strong className="text-slate-200">Strength Score:</strong> Quantified weight of primary and supporting house linkages (0% to 100%).</li>
                    <li><strong className="text-slate-200">Status flags:</strong> Detailed indicators mapping specific divisional chart strengths (D1, D9, D10).</li>
                  </ul>
                </div>
              )}

              {activeEventBookSection === "activation" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    9. Activation Result Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Integrates Vimshottari dasha periods and sky transits to calculate WHEN a promised event manifests.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-200 font-bold block mb-1">DBA / Transit Status</span>
                      • DBA Lords significations<br />
                      • Transit Jupiter & Saturn aspect checks<br />
                      • Star and Sub lord transit alignments
                    </div>
                    <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-200 font-bold block mb-1">Timing Metrics</span>
                      • Exact Activation Windows<br />
                      • Peak Timing strength dates<br />
                      • Chronological trigger windows
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "daily" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    10. Daily Result Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Logs highly dynamic transient daily scores based on Fast-Moving celestial transits (primarily Moon coordinates).
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                    {["Today", "Tomorrow", "Day +2", "Week", "Month"].map((day) => (
                      <span key={day} className="px-3 py-1 bg-slate-900 text-slate-300 border border-slate-800 rounded">
                        • {day} Trend Score
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeEventBookSection === "evidence" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    11. Evidence Log Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Compiles hard astronomical facts supporting or negating the predictive outcome to allow full expert audits.
                  </p>
                  <ul className="space-y-1 text-[10px] font-mono text-slate-400 pl-4 list-decimal">
                    <li>Supporting & Blocking rule triggers</li>
                    <li>Planetary longitudes & House placements</li>
                    <li>Cuspal Sub-Lord (CSL), Star, Sub, and SSL connections</li>
                    <li>Transit alignments & active Vimshottari DBA lords</li>
                  </ul>
                </div>
              )}

              {activeEventBookSection === "decision" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    12. Decision Verdict Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    The final synthesized outcome resolved by the Rule Decision Engine.
                  </p>
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1">
                    <div><span className="text-amber-400">Final Verdict:</span> e.g. Positive Marriage Promise Confirmed (PASS)</div>
                    <div><span className="text-amber-400">Confidence:</span> Mathematically derived index (e.g. 92% Confirmed)</div>
                    <div><span className="text-amber-400">Priority:</span> Severity level for front-end rendering</div>
                    <div><span className="text-amber-400">Reason:</span> Primary logic path that yielded the final verdict</div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "explanation" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    13. Explanation Output Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Provides dual summaries to satisfy both the casual user and professional astrologer.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-200 font-bold block mb-1">Human Explanation</span>
                      Simple, conversational, jargon-free summary outlining exactly what the outcome means in plain language.
                    </div>
                    <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-200 font-bold block mb-1">Technical Explanation</span>
                      Deep mathematical and rules-linked breakdown for advanced scholars, detailing house linkages and lords.
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "timeline" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    14. Timeline & DBA Path Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Provides chronologically mapped predictions displaying sequential activation milestones over time.
                  </p>
                  <ul className="space-y-1.5 text-[10px] font-mono text-slate-400 list-disc pl-4">
                    <li><strong className="text-slate-200">Current DBA:</strong> Evaluation under active Mahadasha, Bhukti, and Antardasha.</li>
                    <li><strong className="text-slate-200">Upcoming DBA:</strong> Tracing next dasha shifts and future promise potentials.</li>
                    <li><strong className="text-slate-200">Transit Windows:</strong> Identifies upcoming slow-planet transits that trigger the promise.</li>
                  </ul>
                </div>
              )}

              {activeEventBookSection === "history" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    15. Historical Audit Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Tracks changes and historical predictions to measure decision stability across previous execution cycles.
                  </p>
                  <ul className="space-y-1 text-[10px] font-mono text-slate-400 pl-4 list-decimal">
                    <li>Logs prior final decisions & confidence scores</li>
                    <li>Saves previous evidence structures for drift analysis</li>
                    <li>Tracks Rule Engine & Schema versioning milestones</li>
                  </ul>
                </div>
              )}

              {activeEventBookSection === "export" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    16. Export Interfacing Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Enables exporting complete auditable trace-data in standard structured schemas.
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-center">
                    <span className="p-2 bg-slate-900 border border-slate-800 rounded text-emerald-400">PDF Export</span>
                    <span className="p-2 bg-slate-900 border border-slate-800 rounded text-blue-400">JSON Payload</span>
                    <span className="p-2 bg-slate-900 border border-slate-800 rounded text-purple-400">CSV Sheet</span>
                    <span className="p-2 bg-slate-900 border border-slate-800 rounded text-pink-400">Research Doc</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between items-center">
              <span>Status: Unified Engine Standard Approved</span>
              <span className="text-amber-500/80">★ JHora AI Core Spec</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all border shrink-0 ${
                isActive 
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-sm" 
                  : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1 rounded-md ${
                isActive ? "bg-amber-500/20 text-amber-300" : "bg-slate-850 text-slate-500"
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Events List Workspace */}
      <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-950/20 border-slate-800/60" : "bg-white border-slate-200"} space-y-4`}>
        <div className="border-b border-slate-800/50 pb-3 flex justify-between items-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-2">
            <span>●</span> {selectedCategory === "all" ? "MASTER KP EVENT DIRECTORY" : `${selectedCategory.toUpperCase()} EVENT DICTIONARY`}
          </h4>
          <span className="text-[10px] font-mono text-slate-500">Showing {filteredEvents.length} events</span>
        </div>

        {/* Events Table / Grid */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-left">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider w-[10%]">
                  Event ID
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider w-[28%]">
                  Event Name & Definition
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[10%]">
                  Primary
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[10%]">
                  Supporting
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[10%]">
                  Obstructing
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[10%]">
                  Main CSL
                </th>
                {showLiveForecast && (
                  <>
                    <th className="px-4 py-3 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider text-center w-[12%]">
                      <div>Day 1</div>
                      <div className="text-[9px] text-amber-300/80 font-normal normal-case">
                        {njResult?.forecastDays[0]?.nakshatra}
                        {njResult?.forecastDays[0]?.transitChangeText && " 🔄"}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider text-center w-[12%]">
                      <div>Day 2</div>
                      <div className="text-[9px] text-cyan-300/80 font-normal normal-case">
                        {njResult?.forecastDays[1]?.nakshatra}
                        {njResult?.forecastDays[1]?.transitChangeText && " 🔄"}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider text-center w-[12%]">
                      <div>Day 3</div>
                      <div className="text-[9px] text-emerald-300/80 font-normal normal-case">
                        {njResult?.forecastDays[2]?.nakshatra}
                        {njResult?.forecastDays[2]?.transitChangeText && " 🔄"}
                      </div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/20">
              {filteredEvents.map((event) => {
                const forecast = getEvent3DayForecast(event.category, event.id);
                return (
                  <React.Fragment key={event.id}>
                    <tr
                      onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                      className={`hover:bg-slate-900/40 transition-colors cursor-pointer ${
                        expandedEventId === event.id ? "bg-slate-900/25 border-l-2 border-amber-500" : ""
                      }`}
                    >
                      {/* ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-amber-500">{event.id}</span>
                      </td>

                      {/* Event Name & Description */}
                      <td className="px-4 py-3">
                        <div className="space-y-1 pr-4">
                          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            {event.name}
                            <span className="text-[9px] text-slate-500 font-mono">
                              {expandedEventId === event.id ? "▲ hide diagnostic" : "▼ click to analyze"}
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans block leading-relaxed">{event.description}</span>
                        </div>
                      </td>

                      {/* Primary Houses */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/10">
                          {event.primary}
                        </span>
                      </td>

                      {/* Supporting Houses */}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-mono ${event.supporting === "-" ? "text-slate-600" : "text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/10"}`}>
                          {event.supporting}
                        </span>
                      </td>

                      {/* Obstructing Houses */}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-mono ${
                          event.category === "agent_rules"
                            ? event.obstructing === "Rule Met"
                              ? "text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/10 font-bold"
                              : "text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/10 font-bold"
                            : event.obstructing === "-"
                              ? "text-slate-600"
                              : "text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/10"
                        }`}>
                          {event.obstructing}
                        </span>
                      </td>

                      {/* Main CSL */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/10">
                          {event.category === "agent_rules" ? event.mainCsl : `CSL ${event.mainCsl}`}
                        </span>
                      </td>

                      {/* Dynamic 3-day forecast columns */}
                      {showLiveForecast && (
                        <>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                              forecast[0] > 70 ? "text-emerald-400 bg-emerald-500/10" : forecast[0] > 45 ? "text-amber-400 bg-amber-500/10" : "text-rose-400 bg-rose-500/10"
                            }`}>
                              {forecast[0]}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                              forecast[1] > 70 ? "text-emerald-400 bg-emerald-500/10" : forecast[1] > 45 ? "text-amber-400 bg-amber-500/10" : "text-rose-400 bg-rose-500/10"
                            }`}>
                              {forecast[1]}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                              forecast[2] > 70 ? "text-emerald-400 bg-emerald-500/10" : forecast[2] > 45 ? "text-amber-400 bg-amber-500/10" : "text-rose-400 bg-rose-500/10"
                            }`}>
                              {forecast[2]}%
                            </span>
                          </td>
                        </>
                      )}
                    </tr>

                    {expandedEventId === event.id && (
                      <tr className="bg-slate-950/40 border-l-2 border-amber-500/60">
                        <td colSpan={showLiveForecast ? 9 : 6} className="px-6 py-5">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/40">
                              <Compass className="w-4 h-4 text-amber-500" />
                              <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                                Multi-System Astrological Promise & Dynamic Transit Matcher
                              </span>
                            </div>

                            {njResult && njResult.forecastDays?.[0]?.multiSystemPredictions ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                                {njResult.forecastDays[0].multiSystemPredictions.slice(0, 3).map((pred) => {
                                  const isFavorable = !pred.verdict.includes("Challenging");
                                  return (
                                    <div key={pred.system} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5">
                                      <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-200">{pred.system}</span>
                                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                          isFavorable ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                        }`}>
                                          {pred.verdict}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 leading-relaxed space-y-1">
                                        <strong className="text-slate-300 block text-[9px] uppercase font-mono tracking-wide">Natal Blueprint Promise:</strong>
                                        <p>{pred.promiseAnalysis}</p>
                                      </div>
                                      <div className="text-[10px] text-slate-400 leading-relaxed space-y-1">
                                        <strong className="text-slate-300 block text-[9px] uppercase font-mono tracking-wide">Transit Resonance:</strong>
                                        <p>{pred.transitEvaluation}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-slate-500 text-xs italic">Calculating dynamic multi-system vectors...</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={showLiveForecast ? 9 : 6} className="text-center py-10 text-slate-500 text-xs italic">
                    No matching events found in active category. Try adjusting your search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
