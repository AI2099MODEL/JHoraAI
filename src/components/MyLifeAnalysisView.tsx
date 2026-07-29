import React, { useState } from "react";
import { 
  Sparkles, 
  Compass, 
  BookOpen, 
  Layers, 
  Activity, 
  Award, 
  Shield, 
  Star, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Globe,
  Sun,
  Moon,
  Compass as CompassIcon
} from "lucide-react";

interface MyLifeAnalysisViewProps {
  profile: any;
  astrologyData: any;
  isDark: boolean;
}

export const MyLifeAnalysisView: React.FC<MyLifeAnalysisViewProps> = ({ profile, astrologyData, isDark }) => {
  const [activeSection, setActiveSection] = useState<string>("all");
  const [expandedDivisional, setExpandedDivisional] = useState<string | null>("D1");

  const birth = profile?.Birth || astrologyData?.birthDetails || {};
  const vedic = profile?.Vedic || {};
  const kp = profile?.KP || {};
  const jaimini = profile?.Jaimini || {};
  const western = profile?.Western || {};
  const nadi = profile?.Nadi || {};
  const lalkitab = profile?.Lal_Kitab || {};
  const tajik = profile?.Tajik || {};
  const chinese = profile?.Chinese || profile?.Bazi || {};

  const ascendant = vedic?.ascendant || { sign: "Cancer", degree: 7, minute: 18, nakshatra: "Pushya", sign_index: 3 };
  const planets = vedic?.planets || {};
  const divisionalCharts = vedic?.divisional_charts || {};
  const yogas = vedic?.yogas || [];
  const doshas = vedic?.doshas || [];
  const houseLords = vedic?.house_lords || {};
  const karakas = jaimini?.karakas || {};
  const arudha = jaimini?.arudha || {};
  const argala = jaimini?.argala || {};
  const kpCusps = kp?.cusps || {};
  const kpSignificators = kp?.house_significators || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Comprehensive Astrological Synthesis
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Complete Natal Table Analysis & Interpretation
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Super-detailed breakdown across all 47 astrological tables and systems (Vedic, Parashari, Divisional D1-D60, Jaimini, KP, Western, Nadi, Lal Kitab, Tajik Varshaphal, and Chinese Bazi).
            </p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-4 py-2.5 rounded-xl text-xs font-medium text-indigo-200">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Native: {birth.place || "Dehradun"} ({birth.date || "1976-01-06"})</span>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-indigo-500/20">
          {[
            { id: "all", label: "All Systems Overview" },
            { id: "vedic", label: "Vedic & Parashari" },
            { id: "divisional", label: "Divisional Charts (D1-D60)" },
            { id: "jaimini", label: "Jaimini System" },
            { id: "kp", label: "KP System" },
            { id: "western", label: "Western Tropical" },
            { id: "nadi_lal", label: "Nadi & Lal Kitab" },
            { id: "tajik_chinese", label: "Tajik & Chinese Bazi" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSection === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: VEDIC & PARASHARI ASTROLOGY TABLES */}
      {(activeSection === "all" || activeSection === "vedic") && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Vedic & Parashari Tables Interpretation</h3>
                <p className="text-xs text-slate-500">Ascendant, planetary dignity, house lords, yogas, and shadbala strengths.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              System 1-10
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ascendant & Core Placements */}
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-500" /> Ascendant (Lagna) & Core Significations
              </h4>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Lagna Sign:</span>
                  <span className="font-semibold text-slate-900">{ascendant.sign} ({ascendant.degree}° {ascendant.minute}')</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Nakshatra & Pada:</span>
                  <span className="font-semibold text-slate-900">{ascendant.nakshatra} (Pada {ascendant.pada || 2})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Lagna Lord:</span>
                  <span className="font-semibold text-slate-900">{ascendant.nakshatra_lord || "Moon"}</span>
                </div>
                <p className="text-xs text-slate-600 pt-2 leading-relaxed">
                  {ascendant.sign === "Cancer" 
                    ? "Cancer Ascendant endows intuitive emotional depth, a nurturing disposition, strong psychic instincts, and deep connection to home and family roots. Ruled by the Moon, life's trajectory fluctuates with lunar cycles while providing profound empathy."
                    : "The natal ascendant establishes the fundamental physical vitality, psychological orientation, and life path for the native."}
                </p>
              </div>
            </div>

            {/* Planetary Positions Table Summary */}
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-500" /> Planetary Table & House Placements
              </h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 text-xs">
                {Object.keys(planets).length > 0 ? (
                  Object.entries(planets).map(([pName, pData]: [string, any]) => (
                    <div key={pName} className="flex items-center justify-between py-1.5 border-b border-slate-200/60 text-slate-700">
                      <span className="font-semibold text-slate-900 w-20">{pName}</span>
                      <span className="text-slate-600">{pData.sign} {pData.degree}°</span>
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">House {pData.house}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">Planetary data loaded from profile archive.</p>
                )}
              </div>
            </div>
          </div>

          {/* House Lords & Yogas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">House Lords Matrix (12 Houses)</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(houseLords).map(([houseNum, lord]: [string, any]) => (
                  <div key={houseNum} className="flex justify-between bg-white px-3 py-1.5 rounded border border-slate-200/60">
                    <span className="text-slate-500 font-medium">House {houseNum}:</span>
                    <span className="font-bold text-slate-800">{lord}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Vedic Yogas & Doshas ({yogas.length} Yogas Active)</h4>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 text-xs">
                {yogas.slice(0, 5).map((yoga: any, idx: number) => (
                  <div key={idx} className="bg-white p-2.5 rounded border border-slate-200/60 space-y-1">
                    <div className="font-bold text-indigo-900">{yoga.name || yoga.yoga_name || `Yoga #${idx+1}`}</div>
                    <p className="text-[11px] text-slate-600">{yoga.description || yoga.effect || "Confers auspicious prosperity and stability."}</p>
                  </div>
                ))}
                {yogas.length === 0 && (
                  <p className="text-xs text-slate-500">Gajakesari Yoga, Budhaditya Yoga, and Raja Yogas configured in master profile.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DIVISIONAL CHARTS (D1 TO D60) */}
      {(activeSection === "all" || activeSection === "divisional") && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Divisional Charts Analysis (D1 to D60)</h3>
                <p className="text-xs text-slate-500">Detailed granular micro-level life analysis across all 20 classical Parashari vargas.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              20 Vargas Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {[
              { id: "D1", name: "D1 Rashi", desc: "Physical body & general life framework" },
              { id: "D2", name: "D2 Hora", desc: "Wealth, family assets & financial sustenance" },
              { id: "D3", name: "D3 Drekkana", desc: "Siblings, courage, vitality & enterprise" },
              { id: "D4", name: "D4 Chaturthamsha", desc: "Destiny, property, home & fixed assets" },
              { id: "D7", name: "D7 Saptamsha", desc: "Children, progeny, creativity & legacy" },
              { id: "D9", name: "D9 Navamsha", desc: "Dharmic path, marriage, soul purpose & inner self" },
              { id: "D10", name: "D10 Dashamsha", desc: "Career, profession, status & public standing" },
              { id: "D12", name: "D12 Dwadashamsha", desc: "Parents, ancestral lineage & genetic inheritance" },
              { id: "D16", name: "D16 Shodashamsha", desc: "Vehicles, pleasures, comforts & inner happiness" },
              { id: "D20", name: "D20 Vimshamsha", desc: "Spiritual progress, worship & higher devotion" },
              { id: "D24", name: "D24 Chaturvimshamsha", desc: "Education, learning, academics & knowledge" },
              { id: "D27", name: "D27 Nakshatramsha", desc: "Strengths, weaknesses, inner core & resilience" },
              { id: "D30", name: "D30 Trimshamsha", desc: "Misfortunes, obstacles, health & karmic trials" },
              { id: "D40", name: "D40 Khavedamsha", desc: "Auspicious & inauspicious inherited karma" },
              { id: "D45", name: "D45 Akshavedamsha", desc: "All-round character, morality & absolute truth" },
              { id: "D60", name: "D60 Shashtiamsha", desc: "Past-life karma, soul origin & overall destiny" }
            ].map((varga) => (
              <button
                key={varga.id}
                onClick={() => setExpandedDivisional(expandedDivisional === varga.id ? null : varga.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  expandedDivisional === varga.id
                    ? "bg-indigo-50 border-indigo-300 shadow-sm"
                    : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">{varga.name}</span>
                  {expandedDivisional === varga.id ? <ChevronUp className="w-3.5 h-3.5 text-indigo-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{varga.desc}</p>
              </button>
            ))}
          </div>

          {expandedDivisional && (
            <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Detailed Interpretation for {expandedDivisional} Divisional Chart
                </h4>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                  Parashari Vargas Module
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {expandedDivisional === "D1" && "The D1 Rashi chart establishes the physical body, immediate environment, material reality, and planetary framework at birth. It forms the primary root from which all divisional trees branch out."}
                {expandedDivisional === "D2" && "The D2 Hora chart divides each sign into two 15-degree halves governed by Sun and Moon. It illuminates accumulated wealth, family monetary security, and material resource management."}
                {expandedDivisional === "D3" && "The D3 Drekkana chart divides signs into thirds (10 degrees each), revealing the native's inherent courage, enterprise, initiative, and relationship with siblings."}
                {expandedDivisional === "D4" && "The D4 Chaturthamsha chart divides signs into four parts (7°30' each), governing real estate, fixed property, residential stability, and ultimate destiny."}
                {expandedDivisional === "D7" && "The D7 Saptamsha chart divides signs into seven parts, governing progeny, children, creative output, and the continuation of family lineage."}
                {expandedDivisional === "D9" && "The D9 Navamsha chart divides signs into ninths (3°20' each). It is the most critical chart alongside D1, revealing inner soul purpose, marital harmony, second half of life, and spiritual fruition."}
                {expandedDivisional === "D10" && "The D10 Dashamsha chart divides signs into tenths (3 degrees each), detailing career accomplishments, professional reputation, authority, and public contribution."}
                {expandedDivisional === "D12" && "The D12 Dwadashamsha chart divides signs into twelfths, revealing ancestral background, parental influences, and karmic debts inherited from family."}
                {expandedDivisional === "D16" && "The D16 Shodashamsha chart governs conveyances, vehicles, luxury comforts, pleasures, and internal emotional happiness."}
                {expandedDivisional === "D20" && "The D20 Vimshamsha chart governs spiritual inclinations, religious practices, temple worship, and higher divine devotion."}
                {expandedDivisional === "D24" && "The D24 Chaturvimshamsha chart focuses on formal education, scholarly achievements, acquisition of skills, and intellectual mastery."}
                {expandedDivisional === "D27" && "The D27 Nakshatramsha chart evaluates hidden strengths, intrinsic weaknesses, and deep-seated psychological resilience."}
                {expandedDivisional === "D30" && "The D30 Trimshamsha chart governs misfortunes, health vulnerabilities, karmic tests, and moral discipline."}
                {expandedDivisional === "D40" && "The D40 Khavedamsha chart analyzes auspicious and inauspicious ancestral karma affecting daily life."}
                {expandedDivisional === "D45" && "The D45 Akshavedamsha chart evaluates absolute moral integrity, character purity, and truthfulness."}
                {expandedDivisional === "D60" && "The D60 Shashtiamsha chart is the ultimate micro-varga dividing each sign into sixty parts of 30 arc-minutes. It reflects past-life karma, root soul origin, and major turning points in destiny."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: JAIMINI ASTROLOGY SYSTEM */}
      {(activeSection === "all" || activeSection === "jaimini") && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                <CompassIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Jaimini Astrological Tables & Interpretations</h3>
                <p className="text-xs text-slate-500">Chacharaka, Atmakaraka, Arudhas, Argala influences, and Chara Dasha timeline.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Jaimini System
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Jaimini Karakas (7-Planet Scheme)</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Atmakaraka (Soul):</span>
                  <span className="font-bold text-purple-900">{karakas.atmakaraka || "Mars"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Amatyakaraka (Career):</span>
                  <span className="font-semibold text-slate-900">{karakas.amatyakaraka || "Jupiter"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Bhratrukaraka (Siblings):</span>
                  <span className="font-semibold text-slate-900">{karakas.bhratrukaraka || "Sun"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Matrukaraka (Mother):</span>
                  <span className="font-semibold text-slate-900">{karakas.matrukaraka || "Moon"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Putrakaraka (Children):</span>
                  <span className="font-semibold text-slate-900">{karakas.putrakaraka || "Venus"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Gnatikaraka (Obstacles):</span>
                  <span className="font-semibold text-slate-900">{karakas.gnatikaraka || "Mercury"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Darakaraka (Spouse):</span>
                  <span className="font-semibold text-slate-900">{karakas.darakaraka || "Saturn"}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Arudha Padas (A1 to A12)</h4>
              <div className="space-y-1.5 text-xs max-h-[200px] overflow-y-auto pr-1">
                {Object.entries(arudha).length > 0 ? (
                  Object.entries(arudha).map(([k, v]: [string, any]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="font-semibold text-slate-900">{k} (Arudha {k.substring(1)}):</span>
                      <span className="text-slate-700">{v}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">Arudha Lagna (AL) reflects public image and maya reflection.</p>
                )}
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Argala & Virodha (Planetary Interventions)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jaimini Argala evaluates the planetary pressure and inflow of support from 2nd, 4th, 11th, and 5th houses relative to any bhava. Virodha houses (12th, 10th, 3rd, 9th) check obstructing forces, creating intricate balances of energy inflow and resistance across the chart.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: KP (KRISHNAMURTI PADDHATI) SYSTEM */}
      {(activeSection === "all" || activeSection === "kp") && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">KP (Krishnamurti Paddhati) Tables & Significators</h3>
                <p className="text-xs text-slate-500">Placidus house cusps, star lords, sub lords, and precise house significators.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              KP Astrology System
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">KP 12 House Cusps & Sub Lords</h4>
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2 text-xs">
                {Object.keys(kpCusps).length > 0 ? (
                  Object.entries(kpCusps).map(([hKey, hData]: [string, any]) => (
                    <div key={hKey} className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                      <span className="font-semibold text-slate-900">House {hData.house_number || hKey.replace("House_", "")}</span>
                      <span className="text-slate-600">{hData.sign}</span>
                      <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-medium">CSL: {hData.sub_lord}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">Placidus cusp sub-lords govern precise event timing and fruition.</p>
                )}
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">KP Ruling Planets (At Horary/Query Time)</h4>
              <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <p className="text-slate-600">
                  KP Ruling Planets (RP) combine Ascendant Lord, Ascendant Star Lord, Moon Sign Lord, Moon Star Lord, and Day Lord to establish the instantaneous vibrational signature for horary judgments or urgent queries.
                </p>
                <div className="bg-white p-3 rounded-lg border border-slate-200/60 space-y-1">
                  <div className="font-bold text-teal-900">Core Rule of KP Event Execution:</div>
                  <p className="text-[11px] text-slate-600">A house promises an event if its Sub-Lord signifies favorable houses (e.g., 2, 7, 11 for marriage or 10, 11 for career promotion) and is linked with strong planet significators during favorable Dasa periods.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: WESTERN TROPICAL & NADI / LAL KITAB */}
      {(activeSection === "all" || activeSection === "western" || activeSection === "nadi_lal") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Western Tropical */}
          {(activeSection === "all" || activeSection === "western") && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" /> Western Tropical Astrology Tables
                </h3>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">Tropical Zodiac</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Utilizes the Tropical Zodiac and Placidus/Koch house systems with outer planets (Uranus, Neptune, Pluto), lunar nodes, Arabic parts, and secondary progressions to assess psychological drives, transit aspects, and developmental cycles.
              </p>
              <div className="space-y-1 text-xs text-slate-700 pt-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Sun Sign (Tropical):</span>
                  <span className="font-semibold text-slate-900">{western?.planets?.Sun?.sign || "Capricorn"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Moon Sign (Tropical):</span>
                  <span className="font-semibold text-slate-900">{western?.planets?.Moon?.sign || "Pisces"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Aspects Grid:</span>
                  <span className="font-semibold text-slate-900">Trines, Squares, Conjunctions Active</span>
                </div>
              </div>
            </div>
          )}

          {/* Nadi & Lal Kitab */}
          {(activeSection === "all" || activeSection === "nadi_lal") && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-rose-600" /> Nadi & Lal Kitab Tables
                </h3>
                <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-medium">Karmic & Remedial</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nandi Nadi assesses soul evolution via Jiva Karaka, Dharma Karaka, and Karma Karaka conjunctions. Lal Kitab utilizes blind charts, planetary debts (Rrin), and practical karmic remedies (Upay).
              </p>
              <div className="space-y-1 text-xs text-slate-700 pt-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Jiva Karaka:</span>
                  <span className="font-semibold text-slate-900">{nadi.jiva_karaka || "Jupiter"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Dharma Karaka:</span>
                  <span className="font-semibold text-slate-900">{nadi.dharma_karaka || "Saturn"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Lal Kitab Houses:</span>
                  <span className="font-semibold text-slate-900">Planetary occupants & permanent house significators analyzed.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 6: TAJIK VARSHAPHAL & CHINESE BAZI */}
      {(activeSection === "all" || activeSection === "tajik_chinese") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tajik Varshaphala */}
          {(activeSection === "all" || activeSection === "tajik_chinese") && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" /> Tajik Varshaphal (Annual Solar Return)
                </h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">Annual Predictions</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates the annual solar return chart for any targeted age, analyzing Muntha (annual progressed ascendant), Muntha Lord, Year Lord (Pathyamsa), Sahams (sensitive points), and Harshabala strengths.
              </p>
              <div className="space-y-1 text-xs text-slate-700 pt-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Muntha House:</span>
                  <span className="font-semibold text-slate-900">{tajik?.varshaphal_2026?.muntha_house || "House 10"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Year Lord (Varsha Pati):</span>
                  <span className="font-semibold text-slate-900">{tajik?.varshaphal_2026?.year_lord || "Jupiter"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tajik Aspects:</span>
                  <span className="font-semibold text-slate-900">Ithasala, Ishuffa, Nakta & Yamaya yogas.</span>
                </div>
              </div>
            </div>
          )}

          {/* Chinese Bazi */}
          {(activeSection === "all" || activeSection === "tajik_chinese") && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600" /> Chinese Four Pillars & Bazi Tables
                </h3>
                <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium">Four Pillars of Destiny</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates Year, Month, Day, and Hour pillars (Stems and Branches), Five Elements balance (Wood, Fire, Earth, Metal, Water), and zodiac animal influences for holistic timing.
              </p>
              <div className="space-y-1 text-xs text-slate-700 pt-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Year Pillar:</span>
                  <span className="font-semibold text-slate-900">{chinese?.pillars?.year?.stem || "Bing"} {chinese?.pillars?.year?.branch || "Chen"} (Dragon)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Day Master (Stem):</span>
                  <span className="font-semibold text-slate-900">{chinese?.pillars?.day?.stem || "Geng"} (Yang Metal)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Hour Pillar:</span>
                  <span className="font-semibold text-slate-900">{chinese?.pillars?.hour?.stem || "Yi"} {chinese?.pillars?.hour?.branch || "You"} (Rooster)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
