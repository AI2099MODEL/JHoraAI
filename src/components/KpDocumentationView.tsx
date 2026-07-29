import React, { useState } from "react";
import { 
  BookOpen, 
  Layers, 
  Cpu, 
  Database, 
  FileText, 
  GitBranch, 
  Code, 
  Activity,
  CheckCircle,
  AlertCircle,
  Copy,
  Check
} from "lucide-react";

interface KpDocumentationViewProps {
  isDark: boolean;
}

export default function KpDocumentationView({ isDark }: KpDocumentationViewProps) {
  const [activeTab, setActiveTab] = useState<"knowledge_book" | "rulebook" | "context">("knowledge_book");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const containerStyle = isDark 
    ? "bg-slate-900/40 border-slate-800/80 text-slate-100" 
    : "bg-white border-slate-200 text-slate-800";

  const cardStyle = isDark 
    ? "bg-slate-950/65 border-slate-800/60" 
    : "bg-slate-50 border-slate-200";

  const headerStyle = isDark
    ? "from-slate-900 to-slate-950 border-slate-800"
    : "from-slate-100 to-slate-50 border-slate-200";

  const preStyle = isDark
    ? "bg-slate-950 border-slate-800 text-indigo-300"
    : "bg-slate-100 border-slate-200 text-indigo-800";

  const codeStyle = isDark
    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
    : "bg-indigo-500/5 text-indigo-700 border-indigo-500/10";

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const knowledgeBookCode = `data class KPKnowledgeBook(
    val version: String,
    val chartId: String,
    val generatedOn: Long,
    val ayanamsa: String,
    val birthDetails: BirthDetails,
    val planets: List<KPPlanet>,
    val houses: List<KPHouse>,
    val cusps: List<KPCusp>,
    val significators: List<KPSignificator>,
    val csl: List<CuspalSubLord>,
    val eventProfiles: List<KPEventProfile>,
    val strengths: List<KPStrength>,
    val metadata: KPMetadata
)`;

  const ruleModelCode = `data class KPRule(
    val id: String,
    val name: String,
    val category: RuleCategory,
    val description: String,
    val requiredHouses: List<Int>,
    val supportingHouses: List<Int>,
    val blockingHouses: List<Int>,
    val requiredSignificators: List<String>,
    val weight: Int,
    val priority: Int,
    val enabled: Boolean = true
)`;

  const contextModelCode = `data class KPRuleExecutionContext(
    val chartId: String,
    val event: String,
    val generatedOn: Long,
    val knowledgeBook: KPKnowledgeBook,
    val currentDBA: CurrentDBA,
    val currentTransit: TransitSnapshot,
    val requestedDate: Long,
    val requestedTimeZone: String
)`;

  return (
    <div className={`p-6 rounded-2xl border ${containerStyle} space-y-6`}>
      {/* Header Banner */}
      <div className={`p-5 rounded-xl border bg-gradient-to-r ${headerStyle} space-y-2`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-sans text-slate-100 flex items-center gap-2">
              KP Astrology Professional Specs
              <span className="text-[10px] font-mono bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">v1.0 SYNCED</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic Knowledge Repositories, Master Rulebook, and Immutable Runtime Execution Contexts.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800/20 pb-1">
        <button
          onClick={() => setActiveTab("knowledge_book")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-xs font-mono font-bold border-t border-x transition-all ${
            activeTab === "knowledge_book"
              ? "bg-slate-950/40 text-amber-400 border-slate-800/80 border-b-2 border-b-amber-500"
              : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/10"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          KP KNOWLEDGE BOOK
        </button>

        <button
          onClick={() => setActiveTab("rulebook")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-xs font-mono font-bold border-t border-x transition-all ${
            activeTab === "rulebook"
              ? "bg-slate-950/40 text-amber-400 border-slate-800/80 border-b-2 border-b-amber-500"
              : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/10"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          KP RULEBOOK Specs
        </button>

        <button
          onClick={() => setActiveTab("context")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-xs font-mono font-bold border-t border-x transition-all ${
            activeTab === "context"
              ? "bg-slate-950/40 text-amber-400 border-slate-800/80 border-b-2 border-b-amber-500"
              : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/10"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          RULE EXECUTION CONTEXT
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        
        {/* TAB 1: KNOWLEDGE BOOK */}
        {activeTab === "knowledge_book" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                KP Knowledge Book Specification
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The KP Knowledge Book is the permanent deterministic KP repository for every user. It stores ALL static KP calculations and is generated once when a new profile is created, birth details change, or a recalculation is requested. Future prediction operations strictly LOAD this knowledge book rather than regenerating the natal metrics.
              </p>
            </div>

            {/* Architecture Flow */}
            <div className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
              <span className="text-[10px] font-bold text-slate-400 font-mono block uppercase tracking-wider">ARCHITECTURE PIPELINE</span>
              <div className="flex flex-col sm:flex-row items-center justify-around gap-2 p-3 bg-slate-950/30 rounded-lg text-xs font-mono border border-slate-800/40">
                <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-center min-w-[120px]">Birth Details</div>
                <div className="text-slate-500">➔</div>
                <div className="px-3 py-1.5 bg-indigo-950/35 border border-indigo-500/20 rounded text-center min-w-[150px] text-indigo-300">KP Engine</div>
                <div className="text-slate-500">➔</div>
                <div className="px-3 py-1.5 bg-amber-950/35 border border-amber-500/20 rounded text-center min-w-[170px] text-amber-300">KP Knowledge Book</div>
                <div className="text-slate-500">➔</div>
                <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-center min-w-[140px]">Prediction Cache</div>
              </div>
            </div>

            {/* Code Block */}
            <div className={`p-4 rounded-xl border ${cardStyle} space-y-3`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Kotlin Data Class Model</span>
                <button 
                  onClick={() => handleCopy(knowledgeBookCode, "kb")}
                  className="p-1.5 rounded hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Copy Code"
                >
                  {copiedText === "kb" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className={`p-3.5 rounded-lg border text-[11px] font-mono overflow-x-auto ${preStyle}`}>
                {knowledgeBookCode}
              </pre>
            </div>

            {/* Spec Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className={`p-4 rounded-xl border ${cardStyle} space-y-2.5`}>
                <span className="text-[10px] font-bold text-slate-200 font-mono block border-b border-slate-800/50 pb-1.5 uppercase">PLANETARY DATA SPECIFICATIONS</span>
                <ul className="space-y-1.5 text-slate-300 list-disc pl-4 font-mono text-[10px]">
                  <li><strong>Longitude:</strong> Absolute coordinate degree.</li>
                  <li><strong>Subdivisions:</strong> Nakshatra, Pada, Star Lord, Sub Lord, Sub Sub Lord.</li>
                  <li><strong>States:</strong> Retrograde & Combust flags.</li>
                  <li><strong>Positions:</strong> Occupancy & Ownership houses.</li>
                  <li><strong>Astrological Nature:</strong> Natural Significations & Functional Nature.</li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl border ${cardStyle} space-y-2.5`}>
                <span className="text-[10px] font-bold text-slate-200 font-mono block border-b border-slate-800/50 pb-1.5 uppercase">HOUSE & CUSP METRICS</span>
                <ul className="space-y-1.5 text-slate-300 list-disc pl-4 font-mono text-[10px]">
                  <li><strong>Houses:</strong> Coordinates, Owner, Occupant, Strength, Empty House Flag.</li>
                  <li><strong>Cusps:</strong> Absolute Longitude, Star Lord, Sub Lord, Sub Sub Lord.</li>
                  <li><strong>Significators:</strong> Finalized Primary/Secondary Houses, Ranking, Strength.</li>
                </ul>
              </div>
            </div>

            {/* Natal Event Promise specs */}
            <div className={`p-4 rounded-xl border ${cardStyle} space-y-3`}>
              <span className="text-[10px] font-bold text-slate-200 font-mono block border-b border-slate-800/50 pb-1.5 uppercase">NATAL EVENT PROMISE</span>
              <p className="text-[11px] text-slate-400">
                Generate one compact promise evaluation per category (Marriage, Career, Business, Finance, Property, Children, etc.) tracking strictly natal promise without any timing calculations:
              </p>
              <div className="p-3 bg-slate-950/30 rounded-lg border border-slate-800/40 text-[10px] font-mono space-y-1.5 text-slate-300">
                <p><strong>event:</strong> String identifier (e.g. "Marriage")</p>
                <p><strong>promise:</strong> Boolean flag signifying event possibility</p>
                <p><strong>primaryHouses:</strong> List of core house activations (e.g. [2, 7, 11])</p>
                <p><strong>supportingPlanets & blockingPlanets:</strong> Planetary influences on CSL</p>
                <p><strong>confidenceBase:</strong> Reliability indicator score based on cusp strength</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RULEBOOK */}
        {activeTab === "rulebook" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                Master KP Rulebook
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The KP Rulebook is the permanent repository of all deterministic KP rules. It contains ONLY rules and contains zero calculation or prediction logic itself. The calculation engine loads these rules and evaluates them dynamically against the loaded KPKnowledgeBook.
              </p>
            </div>

            {/* Code Block */}
            <div className={`p-4 rounded-xl border ${cardStyle} space-y-3`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Kotlin Rule Model Structure</span>
                <button 
                  onClick={() => handleCopy(ruleModelCode, "rule")}
                  className="p-1.5 rounded hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Copy Code"
                >
                  {copiedText === "rule" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className={`p-3.5 rounded-lg border text-[11px] font-mono overflow-x-auto ${preStyle}`}>
                {ruleModelCode}
              </pre>
            </div>

            {/* Categories and rule ID formats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className={`p-4 rounded-xl border ${cardStyle} space-y-2.5`}>
                <span className="text-[10px] font-bold text-slate-200 font-mono block border-b border-slate-800/50 pb-1.5 uppercase">RULE CATEGORIES</span>
                <div className="flex flex-wrap gap-1.5">
                  {["Marriage", "Career", "Business", "Finance", "Property", "Vehicle", "Education", "Children", "Travel", "Foreign", "Health", "Litigation", "Spiritual", "Longevity"].map((cat) => (
                    <span key={cat} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[9px] text-slate-400">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${cardStyle} space-y-2.5`}>
                <span className="text-[10px] font-bold text-slate-200 font-mono block border-b border-slate-800/50 pb-1.5 uppercase">PERMANENT RULE ID FORMAT</span>
                <div className="space-y-1 text-slate-400 text-[10px] font-mono">
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span>Marriage Rule ID:</span>
                    <span className="text-amber-400 font-bold">KP_MAR_0001</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span>Career Rule ID:</span>
                    <span className="text-amber-400 font-bold">KP_CAR_0001</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span>Finance Rule ID:</span>
                    <span className="text-amber-400 font-bold">KP_FIN_0001</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Health Rule ID:</span>
                    <span className="text-amber-400 font-bold">KP_HEA_0001</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Design rules */}
            <div className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-xs flex gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-slate-200 font-sans">RULEBOOK DESIGN LAWS</span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Rules must remain strictly immutable and deterministic. They never perform any calculations themselves or connect to external databases/networks. They only describe astrological conditions (Required, Supporting, and Blocking Houses or Significators). No duplication of rule ID or definition is allowed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTEXT */}
        {activeTab === "context" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                KP Rule Execution Context (KPRuleExecutionContext)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Rule Execution Context represents the complete unified state required by the Rule Engine to evaluate KP rules. Created once for every prediction request, it compiles and wraps all necessary data inputs so that individual rules never have to make repeated database lookups.
              </p>
            </div>

            {/* Architecture diagram */}
            <div className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
              <span className="text-[10px] font-bold text-slate-400 font-mono block uppercase tracking-wider">EXECUTION CONTEXT PIPELINE</span>
              <div className="flex flex-col sm:flex-row items-center justify-around gap-2 p-3 bg-slate-950/30 rounded-lg text-xs font-mono border border-slate-800/40">
                <div className="flex flex-col gap-1">
                  <div className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-center text-[10px]">KP Knowledge Book</div>
                  <div className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-center text-[10px]">Current DBA</div>
                  <div className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-center text-[10px]">Current Transit</div>
                </div>
                <div className="text-slate-500">➔</div>
                <div className="px-3 py-2 bg-indigo-950/30 border border-indigo-500/25 rounded text-center min-w-[160px] text-indigo-300">
                  <p className="font-bold">Execution Context</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">KPRuleExecutionContext</p>
                </div>
                <div className="text-slate-500">➔</div>
                <div className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-center text-[10px]">Rule Engine</div>
                <div className="text-slate-500">➔</div>
                <div className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-center text-[10px]">Verdicts & Scores</div>
              </div>
            </div>

            {/* Code Block */}
            <div className={`p-4 rounded-xl border ${cardStyle} space-y-3`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Kotlin Execution Context Class</span>
                <button 
                  onClick={() => handleCopy(contextModelCode, "context")}
                  className="p-1.5 rounded hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Copy Code"
                >
                  {copiedText === "context" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className={`p-3.5 rounded-lg border text-[11px] font-mono overflow-x-auto ${preStyle}`}>
                {contextModelCode}
              </pre>
            </div>

            {/* Audit support and metadata */}
            <div className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
              <span className="text-[10px] font-bold text-slate-200 font-mono block border-b border-slate-800/50 pb-1.5 uppercase">AUDIT SUPPORT & TRACEABILITY</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                To guarantee complete traceability of predicted events, the execution context stores permanent identifiers: 
                <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] mx-1 ${codeStyle}`}>Context ID</span>,
                <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] mx-1 ${codeStyle}`}>Chart ID</span>,
                <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] mx-1 ${codeStyle}`}>Rulebook Version</span>, and
                <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] mx-1 ${codeStyle}`}>Knowledge Book Version</span>.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
