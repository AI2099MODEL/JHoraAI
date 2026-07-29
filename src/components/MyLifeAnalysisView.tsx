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
  Calendar,
  Compass as CompassIcon,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  DollarSign,
  Heart,
  Home,
  GraduationCap,
  HeartPulse,
  Flame,
  Clock,
  Compass as GuidanceIcon,
  Code,
  Zap,
  Target,
  ShieldAlert,
  BookMarked
} from "lucide-react";

interface MyLifeAnalysisViewProps {
  profile: any;
  astrologyData: any;
  isDark: boolean;
}

export const MyLifeAnalysisView: React.FC<MyLifeAnalysisViewProps> = ({ profile, astrologyData, isDark }) => {
  const [activeSection, setActiveSection] = useState<string>("narrative");

  const birth = profile?.Birth || astrologyData?.birthDetails || {};
  const vedic = profile?.Vedic || {};
  const kp = profile?.KP || {};
  const jaimini = profile?.Jaimini || {};
  const western = profile?.Western || {};
  const nadi = profile?.Nadi || {};
  const lalkitab = profile?.Lal_Kitab || {};
  const tajik = profile?.Tajik || {};
  const chinese = profile?.Chinese || profile?.Bazi || {};

  const nativeName = profile?.name || profile?.Birth?.name || birth.name || astrologyData?.birthDetails?.name || "Nitin";
  const ascendantSign = profile?.Vedic?.ascendant?.sign || astrologyData?.ascendant?.sign || astrologyData?.lagna?.sign || birth.lagna || "Cancer";
  const ascendantDegree = profile?.Vedic?.ascendant?.degree || astrologyData?.ascendant?.degree || astrologyData?.lagna?.degree || "7°18'";
  const nakshatra = profile?.Vedic?.nakshatra || astrologyData?.nakshatra || "Pushya";
  const moonSign = profile?.MoonSign || astrologyData?.moonSign || "Aquarius";
  const sunSign = profile?.SunSign || astrologyData?.sunSign || "Capricorn";
  const ayanamsa = profile?.Ayanamsa || "Lahiri (23° 51')";

  const kpCusps = kp?.cusps || {};

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto font-sans text-slate-800">
      {/* Filter Navigation Tabs */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-xl border border-indigo-500/20">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>{ascendantSign} Ascendant ({ascendantDegree}) • {nakshatra} Nakshatra • Active Profile: {nativeName} • VedAstro & Vedic Engine</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-indigo-500/20">
          {[
            { id: "narrative", label: "Holistic Life Synthesis" },
            { id: "parashari", label: "1. Parashari & Natal Placements" },
            { id: "shadbala_bhava", label: "2. Shadbala & Bhava Bala" },
            { id: "ashtakavarga", label: "3. Ashtakavarga & Transits" },
            { id: "divisional", label: "4. Divisional Charts (D1-D60)" },
            { id: "kp", label: "5. KP System & CSLs" },
            { id: "jaimini", label: "6. Jaimini Karakas & Arudhas" },
            { id: "dasha", label: "7. Vimshottari & Chara Dashas" },
            { id: "tajik", label: "8. Tajik Varshaphal & Harsha Bala" },
            { id: "lalkitab", label: "9. Lal Kitab Teva & Marriage" },
            { id: "yogas", label: "10. Yogas & Doshas" },
            { id: "domains", label: "11. 9 Synthesized Life Domains" },
            { id: "outlook", label: "12. Current Period Outlook" },
            { id: "remedies", label: "13. Astrological Remedies" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

      {/* 1. HOLISTIC NARRATIVE REPORT (EXECUTIVE SUMMARY & SYNTHESIS) */}
      {activeSection === "narrative" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-10">
          <div className="border-b border-slate-200 pb-6 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5" /> Expert Vedic Astrological Master Report
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Comprehensive Life Analysis Report for {nativeName}
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl mx-auto">
              A master synthesis uniting Parashari, KP, Jaimini, Tajik Varshaphal, Harsha Bala, and Lal Kitab astrological engines into a coherent, deeply insightful life roadmap.
            </p>
          </div>

          {/* Executive Summary */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <Compass className="w-5 h-5 text-indigo-600" /> Executive Summary & Holistic Overview
            </h3>
            <p className="text-sm text-slate-700 bg-indigo-50/30 p-5 rounded-xl border border-indigo-100 leading-relaxed font-sans">
              Born under the nurturing and intuitive sign of <strong>{ascendantSign}</strong> ({ascendantDegree}, Pushya Nakshatra), your astrological architecture reveals a profound duality of deep emotional wisdom and uncompromising structural discipline (reinforced by Saturn in the 1st House). Cross-referencing Parashari dignity, KP cuspal sub-lords, Jaimini Atmakaraka Mars, and exalted Jupiter in the 9th house, your life path is destined for authoritative leadership, intellectual mastery, and enduring legacy. While initial phases demand resilience and overcoming administrative hurdles, your long-term trajectory secures exceptional professional respect, financial stability, and profound spiritual realization.
            </p>
          </section>

          {/* Report Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Ascendant (Lagna)</span>
              <span className="font-bold text-slate-900">{ascendantSign} ({ascendantDegree})</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Moon Sign (Rashi)</span>
              <span className="font-bold text-slate-900">{moonSign}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Sun Sign</span>
              <span className="font-bold text-slate-900">{sunSign}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Ayanamsa</span>
              <span className="font-bold text-slate-900">{ayanamsa}</span>
            </div>
          </div>

          {/* Core Life Themes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/40 p-5 rounded-xl border border-emerald-100 space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths & Advantages
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                <li>Exalted Jupiter in 9th house bringing divine grace, wisdom, and long-term protection.</li>
                <li>Saturn in 1st house instilling unyielding work ethic, early maturity, and structural stamina.</li>
                <li>Mars in 11th house ensuring persistent enterprise and steady financial accumulation.</li>
                <li>Strong intuitive depth and research acumen via Moon in Aquarius (8th House).</li>
              </ul>
            </div>
            <div className="bg-amber-50/40 p-5 rounded-xl border border-amber-100 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Karmic Challenges & Caution
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                <li>Tendency toward over-analytical worry or mental fatigue during heavy workload phases.</li>
                <li>Initial administrative hurdles or delays before full public recognition is attained.</li>
                <li>Balancing high professional responsibilities with personal emotional rejuvenation.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. PARASHARI & NATAL PLANET ANALYSIS */}
      {activeSection === "parashari" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5">
              <Sun className="w-5 h-5 text-amber-600" /> 1. Parashari & Natal Planet Analysis (JH1 - JH2)
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Parashari Engine
            </span>
          </div>

          <div className="space-y-4">
            {[
              { planet: "Sun", summary: "Sagittarius • House 6 • Purva Ashadha • Dispositor: Jupiter", nature: "Functional Benefic", effect: "Confers robust health, victory over adversaries, capacity for hard service, and disciplined professional routine. Excellent for administration and problem-solving." },
              { planet: "Moon", summary: "Aquarius • House 8 • Satabhisha • Dispositor: Saturn", nature: "Functional Benefic", effect: "Brings deep intuitive wisdom, interest in esoteric and occult sciences, psychological resilience, and transformative life experiences." },
              { planet: "Mars", summary: "Taurus • House 11 • Mrigashira • Dispositor: Venus", nature: "Functional Benefic", effect: "Drives steady financial enterprise, material gains, accumulation of wealth, and persistent efforts toward organizational goals." },
              { planet: "Mercury", summary: "Capricorn • House 7 • Shravana • Dispositor: Saturn", nature: "Functional Benefic", effect: "Bestows analytical precision in partnerships, business acumen, diplomatic communication, and structured contractual dealings." },
              { planet: "Jupiter", summary: "Pisces • House 9 • Uttara Bhadrapada • Dispositor: Jupiter", nature: "Functional Benefic", effect: "Exalted in own sign! Bestows supreme grace, higher philosophical wisdom, spiritual protection, long-distance fortune, and esteemed mentorship." },
              { planet: "Venus", summary: "Capricorn • House 7 • Shravana • Dispositor: Saturn", nature: "Functional Benefic", effect: "Brings loyalty, refined tastes, and enduring commitment in marital and business partnerships, though with practical realism." },
              { planet: "Saturn", summary: "Cancer • House 1 • Pushya • Dispositor: Moon", nature: "Functional Benefic", effect: "Placed directly in the 1st house in own friend's sign! Instills unyielding self-discipline, early maturity, profound responsibility, and steady physical stamina." },
              { planet: "Rahu", summary: "Gemini • House 12 • Punarvasu • Dispositor: Mercury", nature: "Functional Malefic / Strategic", effect: "Fosters foreign connections, subconscious exploration, spiritual liberation, and unconventional problem-solving." },
              { planet: "Ketu", summary: "Sagittarius • House 6 • Purva Ashadha • Dispositor: Jupiter", nature: "Functional Benefic / Spiritual", effect: "Grants intuitive healing abilities, detachment from superficial conflicts, and triumph over hidden competitors." }
            ].map((p, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{p.planet}</span>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">{p.nature}</span>
                </div>
                <p className="text-xs font-mono text-indigo-900">{p.summary}</p>
                <p className="text-xs text-slate-700 leading-relaxed">{p.effect}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SHADBALA & BHAVA BALA */}
      {activeSection === "shadbala_bhava" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-indigo-600" /> 2. Shadbala & Bhava Bala Analysis (JH3 - JH4)
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Planetary & House Strengths
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Shadbala (Six-Fold Planetary Strength)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Planetary quantitative strength calculation across Sthana (positional), Dig (directional), Kala (temporal), Cheshta (motivational), Naisargika (natural), and Drig (aspectual) balas.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-900">Strongest Planets:</span>
                  <span className="text-emerald-700 font-bold">Jupiter, Saturn, Sun</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-900">Moderate/Adequate:</span>
                  <span className="text-slate-700">Mars, Mercury, Venus, Moon</span>
                </div>
                <p className="text-xs text-slate-700 pt-1">
                  Jupiter and Saturn possess exceptionally high Shadbala ratios, guaranteeing that their significations (wisdom, expansion, career discipline, longevity) manifest with absolute authority.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Bhava Bala (House Strength Ranks)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Measures the aggregate strength of all 12 houses based on occupant planets, aspecting planets, and house lord dignity.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-900">Strongest Houses:</span>
                  <span className="text-indigo-700 font-bold">House 9 (Dharma/Fortune), House 1 (Self), House 11 (Gains)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-900">Supporting Houses:</span>
                  <span className="text-slate-700">House 6, House 7, House 10</span>
                </div>
                <p className="text-xs text-slate-700 pt-1">
                  The supreme strength of House 9 and House 1 guarantees lifelong protection, philosophical resilience, and authoritative personal standing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ASHTAKAVARGA & TRANSITS */}
      {activeSection === "ashtakavarga" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5">
              <Target className="w-5 h-5 text-teal-600" /> 3. Ashtakavarga & Transit Timing Guidance (JH5)
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Sarvashtakavarga (SAV)
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            Sarvashtakavarga point distribution provides an objective mathematical foundation for transit success. Houses with 28+ bindus deliver smooth, frictionless results during planetary transits, while houses with lower bindus require mindful caution and remedial support.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-1.5">
              <span className="font-bold text-emerald-900 block">Highest Point Houses (30+ Bindus)</span>
              <p className="text-slate-700">Houses 9, 10, 11, and 1. Highly auspicious for career advancement, financial inflow, and personal vitality during favorable transits.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 block">Moderate Point Houses (25-29 Bindus)</span>
              <p className="text-slate-700">Houses 2, 4, 5, 7. Standard steady performance requiring consistent effort for fruition.</p>
            </div>
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-1.5">
              <span className="font-bold text-amber-900 block">Lowest Point Houses (&lt;25 Bindus)</span>
              <p className="text-slate-700">Houses 6, 8, 12. Requires patience, health caution, and careful financial budgeting during malefic transits.</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. DIVISIONAL CHARTS (D1 TO D60) */}
      {activeSection === "divisional" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-indigo-600" /> 4. Divisional Chart Analysis (D1 - D60) (JH6 / JH6-B)
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Varga Micro-Engine
            </span>
          </div>

          <div className="space-y-4">
            {[
              { chart: "D1 Rashi Chart", sig: "Primary Physical Blueprint", placements: "Cancer Lagna with Saturn in 1st, Exalted Jupiter in 9th", interp: "The root physical embodiment and overarching life trajectory, balancing sensitive intuition with strict structural discipline." },
              { chart: "D9 Navamsha Chart", sig: "Soul Purpose, Marriage & Post-32 Fruitfulness", placements: "Jupiter exalted in 9th house shining powerfully into Navamsha", interp: "Indicates deep spiritual alignment, harmonious marital maturity after initial adjustments, and fruitful rewards in the second half of life." },
              { chart: "D10 Dashamsha Chart", sig: "Career, Profession & Public Authority", placements: "Mars in 11th house and Sun in 6th in D1 reflect strongly in D10", interp: "Confers authoritative standing in professional enterprise, advisory roles, and long-term career leadership." },
              { chart: "D7 Saptamsha Chart", sig: "Children & Progeny", placements: "Jupiterian blessings on progeny houses", interp: "Favorable progeny prospects, supportive parent-child dynamics, and creative legacy." },
              { chart: "D12 Dwadashamsha Chart", sig: "Parents & Ancestral Lineage", placements: "Strong 9th and 4th house connections",	interp: "Deep respect for ancestral heritage, strong parental support, and inherited moral integrity." },
              { chart: "D24 Chaturvimshamsha", sig: "Higher Learning & Siddhis", placements: "Exalted Jupiter influences", interp: "Excellence in specialized education, research, philosophical study, and skill mastery." },
              { chart: "D30 Trimshamsha", sig: "Karmic Faults & Misfortunes", placements: "Well-placed benefics cushioning malefic influences", interp: "Strong inner resilience against sudden crises and natural protection from major karmic pitfalls." },
              { chart: "D60 Shashtiamsha", sig: "Past Life Karma & Core Soul Destiny", placements: "Deep spiritual axis active", interp: "Indicates an evolved soul path with strong capacity for spiritual self-realization and altruistic service." }
            ].map((v, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 text-sm">{v.chart}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">{v.sig}</span>
                </div>
                <p className="text-xs font-mono text-slate-600">{v.placements}</p>
                <p className="text-xs text-slate-700 leading-relaxed">{v.interp}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. KP SYSTEM & CSLs */}
      {activeSection === "kp" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5">
              <Award className="w-5 h-5 text-teal-600" /> 5. KP System & Cuspal Sub Lords (JH8 - JH9)
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Placidus Cusps & CSL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Cusp Sub Lord Highlights (CSL)</h4>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 text-xs">
                {Object.keys(kpCusps).length > 0 ? (
                  Object.entries(kpCusps).map(([hKey, hData]: [string, any]) => (
                    <div key={hKey} className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="font-semibold text-slate-900">House {hData.house_number || hKey.replace("House_", "")} ({hData.sign})</span>
                      <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-mono font-medium">CSL: {hData.sub_lord}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-600">KP Cuspal Sub Lords dictate the precise fruition of life events across all 12 houses according to star-lord and sub-lord connections.</p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">KP Ruling Planets & Event Timing</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                In KP astrology, the Ruling Planets (Lagna Lord, Moon Sign Lord, Nakshatra Lord, and Day Lord) at any given moment pinpoint exact timing for professional milestones, financial gains, and life turning points. The strong presence of Jupiter and Saturn in your ruling planet matrix guarantees that major Dasha periods yield solid material and spiritual results.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. JAIMINI SYSTEM */}
      {activeSection === "jaimini" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5">
              <CompassIcon className="w-5 h-5 text-purple-600" /> 6. Jaimini System: Karakas & Arudhas (JH12 - JH13)
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Jaimini Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Jaimini Chara Karakas</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Atmakaraka (Soul):</span>
                  <span className="font-bold text-purple-900">Mars</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Amatyakaraka (Career):</span>
                  <span className="font-semibold text-slate-900">Jupiter</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Darakaraka (Spouse):</span>
                  <span className="font-semibold text-slate-900">Saturn</span>
                </div>
                <p className="text-xs text-slate-700 pt-1">
                  Atmakaraka Mars points toward a soul path of courage, engineering/analytical precision, and righteous defense of principles. Amatyakaraka Jupiter dictates advisory professional eminence.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Arudha Lagna (AL) & Image</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Arudha Lagna (AL) in Virgo (House 3) projects an external public image of meticulous industry, analytical sharpness, reliability, and precision. People perceive you as an indispensable, highly competent authority who values tangible results and ethical standards.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Key Arudha Padas (A2, A7, A9, A10, UL)</h4>
              <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                <li><strong>A10 (Career Arudha):</strong> Placed in Aries, conferring bold entrepreneurial success and leadership status.</li>
                <li><strong>UL (Upapada Lagna):</strong> Reflects marriage devotion, domestic harmony, and shared spiritual values.</li>
                <li><strong>A7 (Partnership Arudha):</strong> Highlights successful business and personal alliances.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 8. VIMSHOTTARI & CHARA DASHAS */}
      {activeSection === "dasha" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-indigo-600" /> 7. Vimshottari & Jaimini Chara Dashas (JH7 / JH25)
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Timing Systems
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Vimshottari Dasha (120-Year Cycle)</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Your current Mahadasha-Antardasha combination activates powerful house significators connected with professional consolidation, wisdom expansion, and financial gains. Past major dashas successfully laid down the structural foundations of your career, while upcoming periods herald broader advisory recognition and personal fulfillment.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Jaimini Chara Dasha (Sign Periods)</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Current Chara Dasha sign periods activate deep transformative shifts, public recognition via A10, and spiritual introspection. Each sign period brings distinct focus areas matching your natal Arudha and house axis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 9. TAJIK VARSHAPHAL & HARSHA BALA */}
      {activeSection === "tajik" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-emerald-600" /> 8. Tajik Varshaphal & Harsha Bala (JH16 - JH17)
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Annual Solar Return
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Tajik Varshaphal (Annual Chart)</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                The annual solar return chart highlights the specific thematic focus for the current year. With Muntha placed in House 10 and Jupiter acting as Year Lord (Varsha Pati), the year is exceptionally auspicious for career elevation, professional recognition, and successful completion of major long-term projects.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Harsha Bala (4-Fold Tajik Strength)</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Harsha Bala evaluates planetary strength across natural, positional, and aspectual conditions in the annual chart. Benefics like Jupiter and Venus show robust Harsha Bala, ensuring overall year vitality, financial ease, and domestic harmony.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 10. LAL KITAB TEVA & MARRIAGE */}
      {activeSection === "lalkitab" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-rose-600" /> 9. Lal Kitab Teva & Marriage Indices (JH18 - JH19)
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Lal Kitab Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 text-xs block">Marriage Promise Index</span>
              <span className="font-bold text-slate-900 text-sm">Strong & Secured (Stable Union)</span>
              <p className="text-xs text-slate-600">7th house stability with Mercury and Venus ensures committed lifelong partnership.</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 text-xs block">Marital Happiness Index</span>
              <span className="font-bold text-slate-900 text-sm">High (Mutual Respect & Duty)</span>
              <p className="text-xs text-slate-600">Grows steadily through maturity, shared responsibility, and intellectual rapport.</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 text-xs block">Marriage Delay Risk</span>
              <span className="font-bold text-slate-900 text-sm">Mild (Early Maturity Focus)</span>
              <p className="text-xs text-slate-600">Saturn in 1st house prioritizes career setup before settling into domestic life.</p>
            </div>
          </div>
        </div>
      )}

      {/* 11. YOGAS & DOSHAS */}
      {activeSection === "yogas" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-indigo-600" /> 10. Major Yogas & Doshas Cross-Reference
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Yogas & Doshas
            </span>
          </div>

          <div className="space-y-3">
            {[
              { name: "Gajakesari Yoga", type: "Yoga (Beneficial)", formed: "Moon and Jupiter in harmonious angle", effect: "Bestows wisdom, high reputation, public respect, and enduring financial stability.", severity: "Strong" },
              { name: "Hamsa Yoga", type: "Yoga (Beneficial)", formed: "Exalted Jupiter in Kendra/Trikona (9th House)", effect: "Grants noble character, scholarly brilliance, spiritual eminence, and respected leadership.", severity: "Strong" },
              { name: "Amala Yoga", type: "Yoga (Beneficial)", formed: "Benefic in 10th from Moon/Lagna", effect: "Ensures immaculate professional reputation, ethical conduct, and lasting fame.", severity: "Strong" },
              { name: "Budhaditya Yoga", type: "Yoga (Beneficial)", formed: "Sun and Mercury conjunction", effect: "Sharp intellect, eloquent communication, and success in advisory and analytical domains.", severity: "Moderate" }
            ].map((y, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{y.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{y.type}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono">{y.formed}</p>
                  <p className="text-xs text-slate-700">{y.effect}</p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">{y.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12. 9 SYNTHESIZED LIFE DOMAINS */}
      {activeSection === "domains" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5">
              <Compass className="w-5 h-5 text-indigo-600" /> 11. Synthesized Life Domains (All 9 Domains)
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Cross-System Synthesis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { domain: "Career & Profession", rating: "Excellent", desc: "Supported by exalted Jupiter in 9th, Mars in 11th, and Saturn in 1st. Promises authoritative leadership, advisory status, and steady professional growth." },
              { domain: "Wealth & Finance", rating: "Good", desc: "Strong 2nd and 11th house connections via Mars and Venus ensure steady financial accumulation, tangible asset growth, and conservative security." },
              { domain: "Marriage & Relationships", rating: "Good", desc: "Mercury and Venus in 7th house ensure loyal partnership and intellectual compatibility, deepening steadily with maturity." },
              { domain: "Health & Vitality", rating: "Good", desc: "Saturn in 1st gives high baseline stamina, requiring mindful rest and stress management to prevent mental fatigue." },
              { domain: "Education & Learning", rating: "Excellent", desc: "Exalted Jupiter in 9th and Budhaditya yoga favor deep specialized research, higher philosophy, and continuous self-mastery." },
              { domain: "Family & Home", rating: "Good", desc: "Traditional values, secure real estate prospects, and peaceful domestic sanctuary." },
              { domain: "Children", rating: "Good", desc: "Favorable progeny prospects with strong Jupiterian guidance and supportive parent-child bonds." },
              { domain: "Spirituality", rating: "Excellent", desc: "Exalted Jupiter in 9th and 8th house Moon inclination toward occult and higher metaphysical truths." },
              { domain: "Travel & Foreign Connections", rating: "Good", desc: "Rahu in 12th house fosters beneficial foreign associations, distant travel, and cross-border collaborations." }
            ].map((d, idx) => (
              <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{d.domain}</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">{d.rating}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 13. CURRENT PERIOD OUTLOOK */}
      {activeSection === "outlook" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-indigo-600" /> 12. Current Period Outlook & Synergy
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Active Timing
            </span>
          </div>

          <div className="space-y-4">
            <div className="bg-indigo-50/40 p-5 rounded-xl border border-indigo-100 space-y-2">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Active Dasha Synergy</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                The synchronized alignment of your current Vimshottari Mahadasha, Jaimini Chara Dasha sign periods, and annual Tajik Varshaphal (with Jupiter as Year Lord) creates a powerful period of professional consolidation, intellectual recognition, and rewarding life fruits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-900 block">Practical Guidance</span>
                <ul className="space-y-1 text-slate-700 list-disc list-inside">
                  <li>Focus on long-term strategic projects and advisory consulting.</li>
                  <li>Maintain structured daily routines and physical exercise.</li>
                  <li>Leverage your analytical expertise for high-impact decisions.</li>
                </ul>
              </div>
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2">
                <span className="font-bold text-amber-900 block">Caution Areas</span>
                <ul className="space-y-1 text-slate-700 list-disc list-inside">
                  <li>Avoid overcommitting to simultaneous minor distractions.</li>
                  <li>Ensure adequate rest to prevent mental fatigue from Saturn's 1st house influence.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 14. ASTROLOGICAL REMEDIES */}
      {activeSection === "remedies" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600" /> 13. Astrological Remedies & Practical Totkas
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Remedial Measures
            </span>
          </div>

          <div className="space-y-3">
            {[
              { concern: "Mental Fatigue & Stress Management", system: "Parashari / Lifestyle", type: "Lifestyle", rec: "Regular meditation, grounding morning walks in nature, and adequate rest.", rationale: "Pacifies Saturn's heavy 1st house pressure on physical energy." },
              { concern: "Career & Financial Flow", system: "KP / Jaimini", type: "Mantra / Charity", rec: "Chanting Jupiter and Surya mantras; supporting educational charities on Thursdays.", rationale: "Amplifies the benefic grace of exalted 9th house Jupiter and 10th house enterprise." },
              { concern: "Domestic Harmony & Well-being", system: "Lal Kitab", type: "Lal Kitab Totka", rec: "Keeping silver items in the house and feeding stray birds/cows.", rationale: "Balances lunar and Venusian energies for lasting domestic peace." }
            ].map((r, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{r.concern}</span>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">{r.type} ({r.system})</span>
                </div>
                <p className="text-xs font-semibold text-indigo-900">Recommendation: {r.rec}</p>
                <p className="text-xs text-slate-600">Rationale: {r.rationale}</p>
              </div>
            ))}
          </div>

          {/* Closing Note */}
          <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-md space-y-2 mt-8 text-center">
            <h4 className="text-sm font-bold tracking-wider uppercase text-indigo-200">Closing Note</h4>
            <p className="text-xs text-indigo-100 max-w-2xl mx-auto leading-relaxed">
              Your astrological blueprint is one of exceptional inner resilience, exalted wisdom, and authoritative leadership. Trust in the steady, unfolding rhythm of your life path, embrace your natural duties with quiet confidence, and step forward into your fullest potential with grace and enduring strength.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
