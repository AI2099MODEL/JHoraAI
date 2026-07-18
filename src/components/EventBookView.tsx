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
  Info
} from "lucide-react";

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
  // Relationships (REL)
  { 
    id: "REL001", 
    category: "relationship",
    name: "Marriage Promise", 
    primary: "2,7,11", 
    supporting: "5", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Indicates whether marriage is promised in the lifetime. Primary connection to family (2), spouse (7), and fulfillment of desires (11)."
  },
  { 
    id: "REL002", 
    category: "relationship",
    name: "Marriage Timing / Celebration", 
    primary: "2,7,11", 
    supporting: "5,9", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Evaluates the active DBA (Dasha-Bhukti-Antara) lords and their stellar connections to trigger marriage in a specific time range."
  },
  { 
    id: "REL003", 
    category: "relationship",
    name: "Love Marriage", 
    primary: "5,7,11", 
    supporting: "2", 
    obstructing: "6,12", 
    mainCsl: "5,7",
    description: "Stellar link between 5th CSL (emotions, romance) and 7th CSL (marriage) signifying mutual attraction and self-chosen partner."
  },
  { 
    id: "REL004", 
    category: "relationship",
    name: "Arranged Marriage", 
    primary: "2,7,11", 
    supporting: "9", 
    obstructing: "5,12", 
    mainCsl: "7",
    description: "Marriage facilitated by family, elder relatives, or traditional matches. 9th house (family dharma) plays a central role."
  },
  { 
    id: "REL005", 
    category: "relationship",
    name: "Delay in Marriage", 
    primary: "7", 
    supporting: "1", 
    obstructing: "6,8,12", 
    mainCsl: "7",
    description: "Saturnian aspects or connection of the 7th CSL to dusthanas (6, 8, 12), delaying marriage beyond typical societal age."
  },
  { 
    id: "REL006", 
    category: "relationship",
    name: "Denial of Marriage", 
    primary: "1,6,10", 
    supporting: "8,12", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Total absence of marriage promise. 1st (self), 6th (negation of 7), and 10th (negation of 11) houses fully dominate the 7th CSL."
  },
  { 
    id: "REL011", 
    category: "relationship",
    name: "Marital Discord / Friction", 
    primary: "6,8,12", 
    supporting: "1", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Conflict, arguments, and legal friction caused by active 6th house (disputes) and 8th house (trauma) lords."
  },
  { 
    id: "REL014", 
    category: "relationship",
    name: "Divorce Decree", 
    primary: "6,8,12", 
    supporting: "1", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Legal termination of marriage. Requires simultaneous significations of 6 (litigation), 8 (unhappiness), and 12 (losses)."
  },
  { 
    id: "REL016", 
    category: "relationship",
    name: "Reconciliation & Reunion", 
    primary: "2,7,11", 
    supporting: "4,5", 
    obstructing: "6,8,12", 
    mainCsl: "7",
    description: "Separated couples reuniting. Requires the 7th CSL or running DBA lords to signify 2, 7, and 11, neutralizing dispute houses."
  },

  // Career & Profession (CAR)
  {
    id: "CAR001",
    category: "career",
    name: "Job Procurement / Joining Service",
    primary: "2,6,10,11",
    supporting: "1",
    obstructing: "5,8,12",
    mainCsl: "10, 6",
    description: "Entry into new job. 2nd (wealth), 6th (regular job/service), 10th (status/profession), 11th (gains) must be active."
  },
  {
    id: "CAR002",
    category: "career",
    name: "Promotion & Status Elevation",
    primary: "6,10,11",
    supporting: "2,3",
    obstructing: "5,8,12",
    mainCsl: "10",
    description: "Elevation in rank or pay scale. Strong connection of 10th CSL to 6th (service) and 11th (fulfilment of ambition)."
  },
  {
    id: "CAR003",
    category: "career",
    name: "Change of Job or Location",
    primary: "3,5,10",
    supporting: "6,9,11",
    obstructing: "1,4",
    mainCsl: "10, 5",
    description: "Voluntary job hop. 3rd (leaving old coordinates), 5th (change of career coordinates) and 10th (new position)."
  },
  {
    id: "CAR004",
    category: "career",
    name: "Suspension or Loss of Job",
    primary: "5,8,12",
    supporting: "1",
    obstructing: "2,6,10,11",
    mainCsl: "10, 6",
    description: "Involuntary job exit or redundancy. 5th house acts as the negation (12th) from 6th (job), causing sudden removal."
  },
  {
    id: "CAR005",
    category: "career",
    name: "Independent Business Launch",
    primary: "2,7,10,11",
    supporting: "3",
    obstructing: "5,6,8",
    mainCsl: "7, 10",
    description: "Starting business or partnership trade. 7th house governs direct trade, clients, and commercial transactions."
  },

  // Finance & Wealth (FIN)
  {
    id: "FIN001",
    category: "finance",
    name: "Wealth Accumulation / Savings",
    primary: "2,6,11",
    supporting: "5,9",
    obstructing: "1,8,12",
    mainCsl: "2, 11",
    description: "Steady financial gains. 2nd house (accumulated bank balance), 6th (receipt of payments) and 11th (net profit)."
  },
  {
    id: "FIN002",
    category: "finance",
    name: "Speculative Gains & Windfalls",
    primary: "2,5,8,11",
    supporting: "9",
    obstructing: "3,6,12",
    mainCsl: "11, 5",
    description: "Sudden lottery, stock trading profit, or crypto windfalls. 5th house rules high-risk speculation; 8th rules unearned/sudden wealth."
  },
  {
    id: "FIN003",
    category: "finance",
    name: "Debt Procurement / Bank Loans",
    primary: "6,8,11",
    supporting: "2",
    obstructing: "5,12",
    mainCsl: "6",
    description: "Securing financial loans. 6th house rules debt, while 8th rules external or shared financial resources."
  },
  {
    id: "FIN004",
    category: "finance",
    name: "Financial Loss / Bankruptcy",
    primary: "5,8,12",
    supporting: "12",
    obstructing: "2,6,11",
    mainCsl: "12, 2",
    description: "Severe financial drain or business insolvency. Negating houses 5 (loss of service), 8 (blockage), and 12 (pure expenditure)."
  },

  // Health & Vitality (HEA)
  {
    id: "HEA001",
    category: "health",
    name: "Illness Manifestation",
    primary: "6,8,12",
    supporting: "1",
    obstructing: "5,11",
    mainCsl: "6",
    description: "Disease onset. 6th house is disease, 8th is acute/painful condition, 12th is confinement. Active when 5 and 11 are dormant."
  },
  {
    id: "HEA002",
    category: "health",
    name: "Hospitalisation",
    primary: "8,12",
    supporting: "6",
    obstructing: "5,11",
    mainCsl: "12",
    description: "Clinical admission or bed confinement. Requires strong activation of 12th house (isolation/hospitals) and 8th house (emergency)."
  },
  {
    id: "HEA003",
    category: "health",
    name: "Speedy Medical Recovery",
    primary: "5,11",
    supporting: "1",
    obstructing: "6,8,12",
    mainCsl: "11, 5",
    description: "Regaining energy and neutralizing disease. 5th house is 12th from 6th (negating illness); 11th is 12th from 12th (negating hospitals)."
  },

  // Legal & Litigation (LEG)
  {
    id: "LEG001",
    category: "litigation",
    name: "Litigation Victory / Court Win",
    primary: "6,11",
    supporting: "1,3",
    obstructing: "5,8,12",
    mainCsl: "6",
    description: "Favorable court judgment. 6th house is the opponent's defeat (12th from 7th) and 11th is Native's victory and desire fulfilment."
  },
  {
    id: "LEG002",
    category: "litigation",
    name: "Litigation Defeat / Adverse Judgment",
    primary: "5,8,12",
    supporting: "7",
    obstructing: "6,11",
    mainCsl: "6",
    description: "Losing a court dispute. The opponent gains (7th house and its supporting 12, 5 houses) while Native faces losses."
  },
  {
    id: "LEG003",
    category: "litigation",
    name: "Arrest / Legal Custody",
    primary: "3,8,12",
    supporting: "12",
    obstructing: "2,11",
    mainCsl: "12",
    description: "Confinement by state authorities. 3rd is change of environment, 8th is restriction/humiliation, 12th is imprisonment."
  },

  // Education & Exams (EDU)
  {
    id: "EDU001",
    category: "education",
    name: "Higher Academic Milestones",
    primary: "4,9,11",
    supporting: "5",
    obstructing: "3,8,12",
    mainCsl: "4, 9",
    description: "Successful graduation or post-graduate admission. 4th house is basic education, 9th is deep university research and higher wisdom."
  },
  {
    id: "EDU002",
    category: "education",
    name: "Competitive Exam Success",
    primary: "6,11",
    supporting: "4,9",
    obstructing: "5,12",
    mainCsl: "6",
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
              KP Astrology Core Engine
            </span>
            <h3 className={`text-xl font-sans font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"} flex items-center gap-2.5`}>
              <BookOpen className="w-5 h-5 text-amber-500" />
              KP System Master Eventbook
            </h3>
            <p className="text-xs text-slate-400 font-sans max-w-2xl leading-relaxed">
              Unified database referencing lifetime promises, support chains, and negating houses across multiple life departments.
              Maps exact Placidus cuspal requirements based on core Krishnamurti Paddhati (KP) stellar rules.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/30 border border-slate-800/80 p-2 rounded-xl text-xs shrink-0 font-mono">
            <div className="text-center px-3 py-1 border-r border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase">Registered Events</span>
              <span className="text-slate-200 font-bold">{relEvents.length} Events</span>
            </div>
            <div className="text-center px-3 py-1">
              <span className="text-slate-500 block text-[9px] uppercase">Active Domains</span>
              <span className="text-slate-200 font-bold">8 Categories</span>
            </div>
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
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider w-[12%]">
                  Event ID
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider w-[35%]">
                  Event Name & Definition
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[13%]">
                  Primary
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[13%]">
                  Supporting
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[13%]">
                  Obstructing
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[14%]">
                  Main CSL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/20">
              {filteredEvents.map((event) => {
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
                  </tr>
                );
              })}
              
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 text-xs italic">
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
