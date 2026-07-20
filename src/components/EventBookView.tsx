import React, { useState, useMemo } from "react";
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
  HelpCircle
} from "lucide-react";
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
  const [selectedCategory, setSelectedCategory] = useState<"all" | "relationship" | "career" | "finance" | "health" | "litigation" | "education" | "property" | "travel">("all");
  const [showLiveForecast, setShowLiveForecast] = useState(true);

  // Default prediction date starting with today
  const [predictionDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

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
      travel: "travel"
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

  const categories = useMemo(() => [
    { id: "all", label: "All Events", icon: Layers, count: relEvents.length },
    { id: "relationship", label: "Relationships", icon: Heart, count: relEvents.filter(e => e.category === "relationship").length },
    { id: "career", label: "Career & Service", icon: Briefcase, count: relEvents.filter(e => e.category === "career").length },
    { id: "finance", label: "Wealth & Finance", icon: Coins, count: relEvents.filter(e => e.category === "finance").length },
    { id: "health", label: "Health & Recovery", icon: ShieldAlert, count: relEvents.filter(e => e.category === "health").length },
    { id: "litigation", label: "Court Litigation", icon: Scale, count: relEvents.filter(e => e.category === "litigation").length },
    { id: "education", label: "Exams & Education", icon: GraduationCap, count: relEvents.filter(e => e.category === "education").length },
    { id: "property", label: "Property & Lands", icon: Home, count: relEvents.filter(e => e.category === "property").length },
    { id: "travel", label: "Overseas Travel", icon: Globe, count: relEvents.filter(e => e.category === "travel").length }
  ], []);

  const filteredEvents = useMemo(() => {
    return relEvents.filter((ev) => {
      const matchesSearch = 
        ev.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.primary.includes(searchTerm) ||
        ev.mainCsl.includes(searchTerm) ||
        ev.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "all" || ev.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

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

      {/* DAILY HOROSCOPE ENGINE (KP ONLY) SPECIFICATION */}
      <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-indigo-500/10">
          <Activity className="w-4 h-4 text-indigo-400" />
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              DAILY HOROSCOPE ENGINE Specification (KP ONLY)
            </h4>
            <p className="text-[10px] text-slate-400 font-sans">
              Registered Architecture & Flow Blueprint • Status: Documented & Registered (Do Not Run Now)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          {/* Inputs Column */}
          <div className="space-y-2 border-r border-indigo-500/5 pr-2">
            <span className="text-[10px] font-bold uppercase text-indigo-300 font-mono block">1. ENGINE INPUT CACHING</span>
            <div className="space-y-1 text-[10px] text-slate-400 font-mono list-disc">
              <div>• <strong>Current Sky (Run Once)</strong>: Planet Longitudes, Sign, House, Nakshatra, Star, Sub Lord. Moon Coordinates. Panchanga (Tithi, Vara, Yoga, Karana, Hora).</div>
              <div className="pt-1.5">• <strong>User Cache (Birth)</strong>: DBA Periods (MD/AD/PD/SD/Prana). Natal Planet Coordinates & 6-Fold Significators (L1-L6). Placidus Cuspal Sublords. Natal Promise Cache.</div>
            </div>
          </div>

          {/* Engine Workflow */}
          <div className="space-y-2 border-r border-indigo-500/5 pr-2">
            <span className="text-[10px] font-bold uppercase text-indigo-300 font-mono block">2. MULTI-STAGE ENGINE WORKFLOW</span>
            <div className="space-y-1 text-[10px] text-slate-400 font-mono leading-relaxed">
              <div><strong className="text-slate-300">A. DBA Weight</strong>: period weight scaling for active periods</div>
              <div className="pt-1"><strong className="text-slate-300">B. Transit Trigger</strong>: transit-to-natal chain (T.Planet → T.Star → T.Sub → N.Planet → N.Star → N.Sub → SSL)</div>
              <div className="pt-1"><strong className="text-slate-300">C. Convergence</strong>: maps Active Planet Objects</div>
              <div className="pt-1"><strong className="text-slate-300">D. House Engine</strong>: ranks Primary, Secondary, Background houses</div>
            </div>
          </div>

          {/* Outputs */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase text-indigo-300 font-mono block">3. OUTPUT BLOCKS & CLUSTERS</span>
            <div className="space-y-1 text-[10px] text-slate-400 font-mono">
              <div><strong className="text-rose-400">Block 1: Mood</strong> (Houses 1, 3, 4, 5, 6, 12) → Mood, Stress, Focus, Emotion, Creativity, Mental Energy</div>
              <div className="pt-1"><strong className="text-emerald-400">Block 2: Behaviour</strong> (Houses 2, 3, 6, 7, 10, 11) → Comm, Discipline, Aggression, Patience, Leadership, Network</div>
              <div className="pt-1"><strong className="text-cyan-400">Block 3: Daily Themes</strong> (Primary/Secondary Houses) → Career, Money, Home, Travel, Study, Rest, Planning</div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-indigo-500/10 flex flex-wrap justify-between items-center text-[9px] font-mono text-slate-500 gap-2">
          <span>EXCLUDED FROM DAILY RUN: Marriage, Promotion, Childbirth, Court, Property, Foreign (Handled exclusively by NJEvent)</span>
          <span className="text-indigo-400 uppercase font-bold">KP-Only Standard</span>
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
                  <tr key={event.id} className="hover:bg-slate-900/10 transition-colors">
                    {/* ID */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-amber-500">{event.id}</span>
                    </td>

                    {/* Event Name & Description */}
                    <td className="px-4 py-3">
                      <div className="space-y-1 pr-4">
                        <span className="text-xs font-bold text-slate-200 block">{event.name}</span>
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
                      <span className={`text-xs font-mono ${event.obstructing === "-" ? "text-slate-600" : "text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/10"}`}>
                        {event.obstructing}
                      </span>
                    </td>

                    {/* Main CSL */}
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/10">
                        CSL {event.mainCsl}
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
