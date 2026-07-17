import React, { useState } from "react";
import { 
  BookOpen, 
  Search, 
  X, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Info, 
  Heart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";

interface KPEvent {
  id: string;
  name: string;
  primary: string;
  supporting: string;
  obstructing: string;
  mainCsl: string;
  description: string;
}

const relEvents: KPEvent[] = [
  { 
    id: "REL001", 
    name: "Marriage Promise", 
    primary: "2,7,11", 
    supporting: "5", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Indicates whether marriage is promised in the lifetime. Primary connection to family (2), spouse (7), and fulfillment of desires (11)."
  },
  { 
    id: "REL002", 
    name: "Marriage Timing", 
    primary: "2,7,11", 
    supporting: "5,9", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Evaluates the active DBA (Dasha-Bhukti-Antara) lords and their stellar connections to trigger marriage in a specific time range."
  },
  { 
    id: "REL003", 
    name: "Love Marriage", 
    primary: "5,7,11", 
    supporting: "2", 
    obstructing: "6,12", 
    mainCsl: "5,7",
    description: "Stellar link between 5th CSL (emotions, romance) and 7th CSL (marriage) signifying mutual attraction and self-chosen partner."
  },
  { 
    id: "REL004", 
    name: "Arranged Marriage", 
    primary: "2,7,11", 
    supporting: "9", 
    obstructing: "5,12", 
    mainCsl: "7",
    description: "Marriage facilitated by family, elder relatives, or traditional matches. 9th house (family dharma) plays a central role."
  },
  { 
    id: "REL005", 
    name: "Delay in Marriage", 
    primary: "7", 
    supporting: "1", 
    obstructing: "6,8,12", 
    mainCsl: "7",
    description: "Saturnian aspects or connection of the 7th CSL to dusthanas (6, 8, 12), delaying marriage beyond typical societal age."
  },
  { 
    id: "REL006", 
    name: "Denial of Marriage", 
    primary: "1,6,10", 
    supporting: "8,12", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Total absence of marriage promise. 1st (self), 6th (negation of 7), and 10th (negation of 11) houses fully dominate the 7th CSL."
  },
  { 
    id: "REL007", 
    name: "Married Life Quality", 
    primary: "2,7", 
    supporting: "4,11", 
    obstructing: "6,8,12", 
    mainCsl: "7",
    description: "Assess overall happiness, domestic peace (4), mutual support (11), and absence of adverse dusthana connections."
  },
  { 
    id: "REL008", 
    name: "Spouse Characteristics", 
    primary: "7", 
    supporting: "2", 
    obstructing: "-", 
    mainCsl: "7",
    description: "Physical traits, behavioral patterns, and alignment of the partner's rashi/nakshatra with the native's 7th house."
  },
  { 
    id: "REL009", 
    name: "Spouse Profession", 
    primary: "7,10", 
    supporting: "2,11", 
    obstructing: "8,12", 
    mainCsl: "7",
    description: "Determines if the partner will be working, their career path (10th connection), and financial contribution (2nd)."
  },
  { 
    id: "REL010", 
    name: "Marital Harmony", 
    primary: "2,4,7,11", 
    supporting: "5", 
    obstructing: "6,8,12", 
    mainCsl: "7",
    description: "Indicates smooth emotional exchanges and deep mental compatibility. Promoted by benefic Jupiter/Venus associations."
  },
  { 
    id: "REL011", 
    name: "Marital Discord", 
    primary: "6,8,12", 
    supporting: "1", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Conflict, arguments, and legal friction caused by active 6th house (disputes) and 8th house (trauma) lords."
  },
  { 
    id: "REL012", 
    name: "Temporary Separation", 
    primary: "6,12", 
    supporting: "8", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Living apart due to career, travel, or minor disputes. 12th house (distance) is primary without permanent legal sever."
  },
  { 
    id: "REL013", 
    name: "Permanent Separation", 
    primary: "6,8,12", 
    supporting: "1", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Irreconcilable relationship breakdown where partners choose to reside separately permanently, preceding divorce."
  },
  { 
    id: "REL014", 
    name: "Divorce", 
    primary: "6,8,12", 
    supporting: "1", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Legal termination of marriage. Requires simultaneous significations of 6 (litigation), 8 (unhappiness), and 12 (losses)."
  },
  { 
    id: "REL015", 
    name: "Divorce Decree", 
    primary: "6,7,11", 
    supporting: "9", 
    obstructing: "2", 
    mainCsl: "6,7",
    description: "Timing of court judgment granting the decree. Links the 6th CSL (victory) and 11th CSL (fulfillment) to close the lawsuit."
  },
  { 
    id: "REL016", 
    name: "Reconciliation", 
    primary: "2,7,11", 
    supporting: "4,5", 
    obstructing: "6,8,12", 
    mainCsl: "7",
    description: "Separated couples reuniting. Requires the 7th CSL or running DBA lords to signify 2, 7, and 11, neutralizing dispute houses."
  },
  { 
    id: "REL017", 
    name: "Reunion After Separation", 
    primary: "2,7,11", 
    supporting: "4", 
    obstructing: "6,8,12", 
    mainCsl: "7",
    description: "Physical re-habitation and re-bonding of partners after an extended phase of separate living."
  },
  { 
    id: "REL018", 
    name: "Second Marriage", 
    primary: "2,7,9,11", 
    supporting: "5", 
    obstructing: "6,8,12", 
    mainCsl: "9",
    description: "Evaluated primarily through the 9th Cuspal Sub Lord (next relationship) signifying the primary marriage houses (2, 7, 11)."
  },
  { 
    id: "REL019", 
    name: "Multiple Marriages", 
    primary: "2,7,11", 
    supporting: "5,9", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Stellar indicators favoring plural partnerships, dual connections to Venus/Mercury, or multiple planets aspecting the 7th CSL."
  },
  { 
    id: "REL020", 
    name: "Extra-Marital Affair", 
    primary: "5,8,12", 
    supporting: "2,7", 
    obstructing: "1,6,10", 
    mainCsl: "5",
    description: "Secret romantic linkages. Primary houses are 5th (romance/infatuation), 8th (secrecy/intimacy), and 12th (hidden locations)."
  }
];

interface EventBookViewProps {
  astrologyData: any;
  isDark: boolean;
}

export default function EventBookView({ astrologyData, isDark }: EventBookViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const kpData = astrologyData?.KP || astrologyData?.kp || astrologyData?.profileJson?.KP;

  const handleToggleExpand = (id: string) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  const evaluateKPEvent = (event: KPEvent) => {
    if (!kpData || Object.keys(kpData).length === 0) {
      return {
        status: "INCONCLUSIVE" as const,
        score: 50,
        analysis: "No birth chart (KP data) is currently loaded. Load a profile to calculate real-time stellar support."
      };
    }

    // Parse CSL houses
    const cslHouses = event.mainCsl.split(",").map(x => x.trim());
    let foundSubLords: string[] = [];
    let foundStarLords: string[] = [];

    cslHouses.forEach(houseNum => {
      const key = `House_${houseNum}`;
      const subLord = kpData.cusps?.[key]?.sub_lord || kpData.cusps?.[houseNum]?.sub_lord || "";
      if (subLord) {
        foundSubLords.push(subLord);
        const planetDetails = kpData.planets?.[subLord];
        if (planetDetails?.star_lord) {
          foundStarLords.push(planetDetails.star_lord);
        }
      }
    });

    if (foundSubLords.length === 0) {
      return {
        status: "INCONCLUSIVE" as const,
        score: 50,
        analysis: `Cuspal Sub Lord data for House ${event.mainCsl} could not be resolved from the chart.`
      };
    }

    // Check significations
    const primaryHouses = event.primary.split(",").map(x => x.trim());
    const supportingHouses = event.supporting === "-" ? [] : event.supporting.split(",").map(x => x.trim());
    const obstructingHouses = event.obstructing === "-" ? [] : event.obstructing.split(",").map(x => x.trim());

    let primaryMatchCount = 0;
    let supportingMatchCount = 0;
    let obstructingMatchCount = 0;

    // For each star lord of the CSL, check which houses they signify
    foundStarLords.forEach(starLord => {
      primaryHouses.forEach(h => {
        const sigs = kpData.house_significators?.[h] || kpData.house_significators?.[`House_${h}`] || [];
        if (sigs.includes(starLord)) primaryMatchCount++;
      });
      supportingHouses.forEach(h => {
        const sigs = kpData.house_significators?.[h] || kpData.house_significators?.[`House_${h}`] || [];
        if (sigs.includes(starLord)) supportingMatchCount++;
      });
      obstructingHouses.forEach(h => {
        const sigs = kpData.house_significators?.[h] || kpData.house_significators?.[`House_${h}`] || [];
        if (sigs.includes(starLord)) obstructingMatchCount++;
      });
    });

    // Calculate support score
    let score = 50; // default baseline
    if (primaryMatchCount > 0) score += 25;
    if (supportingMatchCount > 0) score += 15;
    if (obstructingMatchCount > 0) score -= 25;

    // Bound score
    score = Math.max(15, Math.min(95, score));

    let status: "SUPPORTED" | "OBSTRUCTED" | "WEAK_SUPPORT" = "WEAK_SUPPORT";
    if (score >= 65) {
      status = "SUPPORTED";
    } else if (score < 40) {
      status = "OBSTRUCTED";
    }

    const cslLabel = foundSubLords.join(" & ");
    const starLabel = foundStarLords.join(" & ");

    let analysis = `Evaluated via ${event.mainCsl}th Cuspal Sub Lord (${cslLabel}) in Nakshatra of ${starLabel}. `;
    if (status === "SUPPORTED") {
      analysis += `The Star Lord is a strong significator of primary houses (${event.primary}) with minimal obstruction. This event is highly promised in your chart.`;
    } else if (status === "OBSTRUCTED") {
      analysis += `The Nakshatra ruler connects strongly to obstructing houses (${event.obstructing}), which negates or delays the event promise.`;
    } else {
      analysis += `Moderate or mixed planetary configurations. The house significations of ${starLabel} show mild promise but require supportive DBA transits.`;
    }

    return { status, score, analysis };
  };

  const filteredEvents = relEvents.filter(
    (ev) =>
      ev.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.primary.includes(searchTerm) ||
      ev.mainCsl.includes(searchTerm)
  );

  return (
    <div className={`space-y-6 animate-fade-in`}>
      {/* Header Panel */}
      <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-950/40 border-slate-800/80" : "bg-white border-slate-200"} shadow-xl relative overflow-hidden`}>
        {/* Ambient lighting */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/5 blur-3xl rounded-full" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              KP Astrology Core Engine
            </span>
            <h3 className={`text-xl font-sans font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"} flex items-center gap-2.5`}>
              <BookOpen className="w-5 h-5 text-amber-500" />
              KP Relationship Event Book
            </h3>
            <p className="text-xs text-slate-400 font-sans max-w-2xl leading-relaxed">
              Unified database reference of marital promise, delayed bindings, separation metrics, and divorce decrees. 
              Tracks exact cuspal requirements based on core Krishnamurti Paddhati (KP) stellar rules.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/30 border border-slate-800/80 p-2 rounded-xl text-xs shrink-0 font-mono">
            <div className="text-center px-3 py-1 border-r border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase">Events</span>
              <span className="text-slate-200 font-bold">20 Registered</span>
            </div>
            <div className="text-center px-3 py-1">
              <span className="text-slate-500 block text-[9px] uppercase">Domain</span>
              <span className="text-slate-200 font-bold">Marital Life</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-5 flex items-center gap-2 bg-slate-950/40 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
          <Search className="w-4 h-4 text-slate-400 ml-1.5" />
          <input
            type="text"
            placeholder="Search events, primary houses, or cuspal sub-lords (e.g., REL001, Love Marriage, CSL 7)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0"
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

      {/* Main Section */}
      <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-950/20 border-slate-800/60" : "bg-white border-slate-200"} space-y-4`}>
        <div className="border-b border-slate-800 pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-2">
            <span>●</span> MARITAL LIFE, SEPARATION, DIVORCE & REMARRIAGE
          </h4>
        </div>

        {/* Events Table / Grid */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[10%]">
                  Event ID
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[22%]">
                  Event Name
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-[12%]">
                  Primary
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-[12%]">
                  Supporting
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-[12%]">
                  Obstructing
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-[10%]">
                  Main CSL
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-[12%]">
                  Stellar Support
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-[10%]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950/40">
              {filteredEvents.map((event) => {
                const isExpanded = expandedEventId === event.id;
                const evaluation = evaluateKPEvent(event);

                return (
                  <React.Fragment key={event.id}>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      {/* ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-amber-500">{event.id}</span>
                      </td>

                      {/* Event Name */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-200 block">{event.name}</span>
                          <span className="text-[10px] text-slate-500 font-sans block line-clamp-1">{event.description}</span>
                        </div>
                      </td>

                      {/* Primary Houses */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                          {event.primary}
                        </span>
                      </td>

                      {/* Supporting Houses */}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-mono ${event.supporting === "-" ? "text-slate-600" : "text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/10"}`}>
                          {event.supporting}
                        </span>
                      </td>

                      {/* Obstructing Houses */}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-mono ${event.obstructing === "-" ? "text-slate-600" : "text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/10"}`}>
                          {event.obstructing}
                        </span>
                      </td>

                      {/* Main CSL */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">
                          CSL {event.mainCsl}
                        </span>
                      </td>

                      {/* Dynamic Stellar Support */}
                      <td className="px-4 py-3 text-center">
                        {evaluation.status === "INCONCLUSIVE" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                            <Lock className="w-2.5 h-2.5" /> No Chart
                          </span>
                        ) : evaluation.status === "SUPPORTED" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-mono">
                            <CheckCircle2 className="w-3 h-3 shrink-0" /> {evaluation.score}% Support
                          </span>
                        ) : evaluation.status === "OBSTRUCTED" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded uppercase font-mono">
                            <AlertTriangle className="w-3 h-3 shrink-0" /> {evaluation.score}% Obstacles
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-mono">
                            <TrendingUp className="w-3 h-3 shrink-0" /> {evaluation.score}% Mixed
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleExpand(event.id)}
                          className={`p-1 rounded hover:bg-slate-800 transition-colors ${isExpanded ? "text-amber-500" : "text-slate-400"}`}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Collapsible Details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="bg-slate-900/25 px-6 py-4 border-t border-slate-900 border-b border-slate-900">
                          <div className="space-y-3.5 max-w-4xl">
                            <div className="flex items-start gap-2 text-xs">
                              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <span className="font-bold text-slate-300">Detailed KP Alignment Definition:</span>
                                <p className="text-slate-400 leading-relaxed font-sans">{event.description}</p>
                              </div>
                            </div>

                            {/* Evaluation details */}
                            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Stellar Logic Analysis</span>
                                {evaluation.status !== "INCONCLUSIVE" && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${
                                          evaluation.score > 65 
                                            ? "bg-emerald-500" 
                                            : evaluation.score > 40 
                                            ? "bg-amber-500" 
                                            : "bg-rose-500"
                                        }`}
                                        style={{ width: `${evaluation.score}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-mono font-bold text-slate-200">{evaluation.score}% Score</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                                {evaluation.analysis}
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 text-[10px] font-mono text-slate-500 border-t border-slate-800/40">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span>Primary Houses: <strong className="text-slate-400">{event.primary}</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                  <span>Supporting: <strong className="text-slate-400">{event.supporting}</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  <span>Obstructing: <strong className="text-slate-400">{event.obstructing}</strong></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500 text-xs italic">
                    No matching events found in relationship book.
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
