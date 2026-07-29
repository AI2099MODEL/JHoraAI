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
  const houseLords = vedic?.house_lords || {};
  const karakas = jaimini?.karakas || {};
  const arudha = jaimini?.arudha || {};
  const kpCusps = kp?.cusps || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Filter Navigation */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-xl border border-indigo-500/20">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Cancer Ascendant (7°18') • Pushya Nakshatra • Saturn in 1st House</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-indigo-500/20">
          {[
            { id: "all", label: "Complete Narrative Overview" },
            { id: "vedic", label: "Vedic & Parashari Tables" },
            { id: "divisional", label: "Divisional Charts (D1-D60)" },
            { id: "jaimini", label: "Jaimini System" },
            { id: "kp", label: "KP System & Cusps" },
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

      {/* SECTION 1: VEDIC & PARASHARI INTERPRETATION */}
      {(activeSection === "all" || activeSection === "vedic") && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">1. Vedic Parashari Natal Table Interpretations</h3>
                <p className="text-xs text-slate-500">Analysis of your Cancer Ascendant, planetary dignity, house lords, and active Yogas.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Vedic Core Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ascendant & Core Personality */}
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-500" /> Ascendant (Lagna): Cancer 7°18' (Pushya Nakshatra)
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Your Cancer ascendant is deeply nourished by the benevolent energy of Pushya Nakshatra (ruled by Saturn), with your lagna lord Moon placed in Aquarius in the 8th house. This creates a profound paradox of intense emotional depth, intuitive wisdom, and a quest for security balanced with detached philosophical inquiry. Saturn placed directly in your 1st House instills a serious, disciplined demeanor, early maturity, and a strong sense of responsibility toward family and life duties.
              </p>
            </div>

            {/* Key Planetary Placements */}
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-500" /> Key Planetary Placements & Houses
              </h4>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-900">Sun in Sagittarius (House 6):</span>
                  <span className="text-slate-600">Confers victory over adversaries, robust problem-solving ability, and dedication to service.</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-900">Moon in Aquarius (House 8):</span>
                  <span className="text-slate-600">Inclined toward occult sciences, deep psychological research, sudden transformations, and mystical intuition.</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-900">Jupiter in Pisces (House 9):</span>
                  <span className="text-slate-600">Exalted/Own sign in 9th house! Bestows supreme grace, higher wisdom, spiritual protection, and philosophical fortune.</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-900">Mars in Taurus (House 11):</span>
                  <span className="text-slate-600">Drives steady financial accumulation, material gains, and persistent enterprise in career earnings.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Yogas & House Lords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">House Lords & Functional Benefics</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                With Cancer lagna, Moon is your life-giver. Mars rules the 5th and 10th houses (Raja Yoga Karaka placed in 11th house in Taurus!), creating powerful Dhana and career success combinations. Jupiter rules 6th and 9th houses, bringing fortune through disciplined service and higher learning.
              </p>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Active Vedic Yogas (31 Yogas)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your chart features powerful Raja Yogas and Gajakesari combinations due to Jupiter's auspicious placement in Pisces and Mercury in Capricorn (House 7). These configurations ensure professional recognition, intellectual acumen, and sustained public standing over time.
              </p>
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
                <h3 className="text-base font-bold text-slate-900">2. Divisional Charts (D1 to D60) Interpretations</h3>
                <p className="text-xs text-slate-500">Granular micro-level life breakdown across all 20 classical Parashari vargas.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              20 Vargas Explored
            </span>
          </div>

          <div className="space-y-4">
            {[
              { 
                id: "D1", 
                name: "D1 Rashi Chart (Primary Natal Blueprint & Multi-System Synthesis)", 
                desc: "The root physical embodiment, overarching life trajectory, and core personality structure synthesized across all astrological frameworks.",
                interp: "Ascendant in Cancer (7°18') in Pushya Nakshatra with Saturn placed directly in the 1st house.\n\n" +
                  "• Parashari View: Saturn in Lagna bestows early maturity, grave responsibility, enduring stamina, and a disciplined approach to life. The Moon (Lagna Lord) in Aquarius in the 8th house connects emotional depth with metaphysical investigation, occult research, and profound psychological transformation.\n" +
                  "• KP Astrology View: Lagna sub-lord is Mercury and sub-sub lord is Venus, connecting the physical self to intellectual acumen and refined artistic/harmonious expression. House 1 cusp falls under Saturn star lord.\n" +
                  "• Jaimini View: Mars acts as Atmakaraka (indicating core soul desire for action, courage, and pioneering drive), while Jupiter acts as Amatyakaraka (guiding career and ministerial wisdom).\n" +
                  "• Nadi View: Jupiter is Jiva Karaka (soul embodiment of wisdom and expansion) and Saturn is Karma Karaka (indicator of professional destiny and duty).\n" +
                  "• Lal Kitab View: Saturn in 1st house governs self-discipline and structural foundation, while Jupiter in 9th house acts as a powerful Pucca Ghar benefic protecting fortune and dharma.\n" +
                  "• Western View: Cancer rising coupled with strong water-air elemental balance, emphasizing deep intuitive empathy paired with structured intellectual oversight." 
              },
              { 
                id: "D2", 
                name: "D2 Hora Chart (Wealth, Assets & Monetary Sustenance)", 
                desc: "Evaluates accumulated wealth, family monetary reserves, and financial management capacity across Sun/Moon horas.",
                interp: "Divides each sign into two 15° halves: Leo (Sun hora) for self-earned treasury and enterprise, and Cancer (Moon hora) for liquid assets and family wealth preservation.\n\n" +
                  "• Parashari & KP Analysis: Planets placed in Sun horas highlight entrepreneurial wealth generation, while Moon horas govern conservative asset holding and family security.\n" +
                  "• Jaimini & Nadi Synthesis: Sustained monetary growth is supported by favorable 2nd house cusp sub-lords and Jupiterian expansion, ensuring steady resource accumulation throughout active life cycles." 
              },
              { 
                id: "D3", 
                name: "D3 Drekkana Chart (Courage, Vitality & Enterprise)", 
                desc: "Examines siblings, physical stamina, initiative, enterprise, and courage in competitive environments.",
                interp: "Divides each sign into three 10° decanates ruled by trinal lords (1st, 5th, and 9th houses from the sign).\n\n" +
                  "• Parashari & KP Analysis: Evaluates stamina, physical endurance, and execution capability. Your D3 chart reflects robust inner drive and the ability to withstand high-pressure professional demands.\n" +
                  "• Jaimini & Lal Kitab Synthesis: Strong Mars influence in D3 reinforces personal enterprise, courage, and decisive tactical action." 
              },
              { 
                id: "D4", 
                name: "D4 Chaturthamsha Chart (Property, Real Estate & Home)", 
                desc: "Governs residential stability, landed property, fixed assets, and domestic peace of mind.",
                interp: "Divides each sign into four 7°30' segments representing houses 1, 4, 7, and 10 from the sign.\n\n" +
                  "• Parashari & KP Analysis: Focuses on immovable assets, homeland security, and real estate acquisition. Your D4 configuration points to secure property holdings and lasting residential stability in your home region (Dehradun).\n" +
                  "• Jaimini & Nadi Synthesis: Harmonious Moon and Venus aspects in D4 secure lasting domestic tranquility and property growth." 
              },
              { 
                id: "D5", 
                name: "D5 Panchamsha Chart (Intelligence, Fame & Authority)", 
                desc: "Evaluates higher intellect, speculative success, authority, creative genius, and public recognition.",
                interp: "Divides each sign into five 6° segments reflecting specialized intellectual merit and past-life earned credits.\n\n" +
                  "• Parashari & KP Analysis: Highlights sharp analytical discrimination, capacity for advisory roles, and recognition in professional or intellectual circles.\n" +
                  "• Jaimini & Western Synthesis: Strong Jupiter and Mercury interaction in D5 points to profound problem-solving abilities and authoritative expertise." 
              },
              { 
                id: "D6", 
                name: "D6 Shashthamsha Chart (Health, Diseases & Adversaries)", 
                desc: "Examines physical vulnerabilities, immune resilience, debts, and victory over litigation or enemies.",
                interp: "Divides each sign into six 5° segments reflecting physical constitution and stress management.\n\n" +
                  "• Parashari & KP Analysis: Shows robust immune defense and the capacity to outlast opponents and competitive friction through steady perseverance.\n" +
                  "• Lal Kitab & Nadi Synthesis: Emphasizes disciplined routine, dietary caution, and proactive health maintenance." 
              },
              { 
                id: "D7", 
                name: "D7 Saptamsha Chart (Progeny, Children & Creative Legacy)", 
                desc: "Governs children, posterity, creative fertility, mentorship, and continuation of family lineage.",
                interp: "Divides each sign into seven 4°17' segments focusing on generative capacity and posterity.\n\n" +
                  "• Parashari & KP Analysis: Highlights fruitful creative endeavors, successful mentorship, and strong familial legacy.\n" +
                  "• Jaimini Synthesis: Favorable trinal lord placements in D7 ensure harmonious generational continuation and creative fulfillment." 
              },
              { 
                id: "D8", 
                name: "D8 Ashtamsha Chart (Sudden Changes & Transformation)", 
                desc: "Reveals unexpected events, longevity, hidden trials, and deep psychological metamorphosis.",
                interp: "Divides each sign into eight 3°45' segments governing sudden disruptions and crisis management.\n\n" +
                  "• Parashari & KP Analysis: Points to an intuitive survival instinct and psychological resilience when navigating unforeseen life transitions.\n" +
                  "• Nadi & Jaimini Synthesis: Strong 8th divisional placement aids in deep metaphysical research, occult study, and transformation." 
              },
              { 
                id: "D9", 
                name: "D9 Navamsha Chart (Soul Purpose, Marriage & Dharma)", 
                desc: "The most vital divisional chart; reflects inner soul purpose, marriage harmony, and post-32 life fruitfulness.",
                interp: "Exalted Jupiter in Pisces in the 9th house of your natal chart shines powerfully into your D9 Navamsha. Navamsha dictates the true inner strength of planets.\n\n" +
                  "• Parashari & KP Analysis: Supreme dharmic protection, profound spiritual wisdom, philosophical maturity, and enduring partnership fulfillment.\n" +
                  "• Jaimini & Nadi Synthesis: Amatyakaraka Jupiter in D9 empowers high-level career wisdom, advisory standing, and spiritual grace." 
              },
              { 
                id: "D10", 
                name: "D10 Dashamsha Chart (Career, Profession & Status)", 
                desc: "The definitive chart for professional achievements, career authority, and public standing.",
                interp: "Divides each sign into ten 3° segments governing career progression and professional reputation.\n\n" +
                  "• Parashari & KP Analysis: With Mars (10th lord of D1) placed in Taurus in the 11th house, your D10 chart underscores career enterprise, professional integrity, and steady material rewards from leadership and organizational responsibility.\n" +
                  "• Jaimini & Nadi Synthesis: Amatyakaraka placement in D10 ensures authoritative standing, executive command, and enduring professional legacy." 
              },
              { 
                id: "D11", 
                name: "D11 Ekadashamsha Chart (Gains & Aspirations)", 
                desc: "Examines income streams, financial windfalls, and the realization of deepest ambitions.",
                interp: "Divides each sign into eleven 2°43' segments governing material gains and fulfillment of desires (Rudra varga).\n\n" +
                  "• Parashari & KP Analysis: Highlights reliable revenue streams, financial growth, and successful monetization of professional expertise.\n" +
                  "• Nadi Synthesis: Active 11th house connections bring successful goal realization during favorable planetary periods." 
              },
              { 
                id: "D12", 
                name: "D12 Dwadashamsha Chart (Ancestral Lineage & Parents)", 
                desc: "Governs parents, ancestral background, and inherited genetic/karmic predispositions.",
                interp: "Divides each sign into twelve 2°30' segments reflecting parental influences and ancestral karma.\n\n" +
                  "• Parashari & KP Analysis: Indicates strong moral grounding rooted in traditional values, parental blessings, and ancestral integrity.\n" +
                  "• Lal Kitab Synthesis: Favorable planetary aspects in D12 protect against ancestral karmic debt and preserve family honor." 
              },
              { 
                id: "D16", 
                name: "D16 Shodashamsha Chart (Vehicles & Comforts)", 
                desc: "Examines conveyances, luxury vehicles, domestic happiness, and psychological peace of mind.",
                interp: "Divides each sign into sixteen 1°52' segments governing physical comforts and emotional ease.\n\n" +
                  "• Parashari & KP Analysis: Supports steady acquisition of residential conveniences, vehicles, and peaceful domestic living.\n" +
                  "• Western & Nadi Synthesis: Harmonious Moon and Venus influences in D16 ensure a comfortable, serene lifestyle." 
              },
              { 
                id: "D20", 
                name: "D20 Vimshamsha Chart (Spiritual Progress & Worship)", 
                desc: "Evaluates religious inclination, spiritual practices, temple devotion, and higher grace.",
                interp: "Divides each sign into twenty 1°30' segments measuring spiritual evolution and inner devotion.\n\n" +
                  "• Parashari & KP Analysis: Points to an inward quest for truth, meditative discipline, and sincere religious devotion.\n" +
                  "• Jaimini Synthesis: Atmakaraka and spiritual house links in D20 foster profound inner awakening and grace." 
              },
              { 
                id: "D24", 
                name: "D24 Chaturvimshamsha Chart (Education & Knowledge)", 
                desc: "Governs academic degrees, learning capacity, specialized skills, and intellectual mastery.",
                interp: "Divides each sign into twenty-four 1°15' segments highlighting learning and scholarship.\n\n" +
                  "• Parashari & KP Analysis: Indicates continuous self-education, specialized expertise, academic success, and intellectual curiosity.\n" +
                  "• Nadi Synthesis: Mercury and Jupiter aspects in D24 ensure lifelong mastery of complex subjects." 
              },
              { 
                id: "D27", 
                name: "D27 Nakshatramsha Chart (Strengths & Inner Core)", 
                desc: "Examines intrinsic psychological strengths, emotional equilibrium, and character weaknesses.",
                interp: "Divides each sign into twenty-seven 1°06' segments laying bare emotional stamina (Bhamsha).\n\n" +
                  "• Parashari & KP Analysis: Shows deep emotional resilience, mental fortitude, and ability to absorb pressure without fracturing.\n" +
                  "• Jaimini Synthesis: Robust Atmakaraka grounding in D27 reinforces unyielding inner courage and ethical balance." 
              },
              { 
                id: "D30", 
                name: "D30 Trimshamsha Chart (Karmic Trials & Health)", 
                desc: "Reveals vulnerabilities to misfortune, health challenges, and moral rectitude.",
                interp: "Divides each sign into uneven planetary portions acting as a karmic safety valve.\n\n" +
                  "• Parashari & KP Analysis: Emphasizes self-discipline, dietary caution, and ethical vigilance to neutralize negative planetary influences.\n" +
                  "• Lal Kitab Synthesis: Highlights prescribed remedies and preventive measures to maintain health and harmony." 
              },
              { 
                id: "D40", 
                name: "D40 Khavedamsha Chart (Inherited Auspicious Karma)", 
                desc: "Evaluates auspicious and inauspicious ancestral merit influencing daily fortune.",
                interp: "Divides each sign into forty 45' segments reflecting accumulated family dharma.\n\n" +
                  "• Parashari & KP Analysis: Sustains a protective shield of ancestral good karma, mitigating unforeseen setbacks.\n" +
                  "• Nadi Synthesis: Favorable benefic placements in D40 ensure smooth day-to-day progression." 
              },
              { 
                id: "D45", 
                name: "D45 Akshavedamsha Chart (Character & Moral Integrity)", 
                desc: "Examines absolute moral purity, truthfulness, and overall ethical constitution.",
                interp: "Divides each sign into forty-five 40' segments acting as the supreme test of personal integrity.\n\n" +
                  "• Parashari & KP Analysis: Reinforces a strong commitment to duty, truth, righteousness, and uncompromised ethical standards.\n" +
                  "• Jaimini Synthesis: High moral alignment through Atmakaraka and Sun/Jupiter dignity." 
              },
              { 
                id: "D60", 
                name: "D60 Shashtiamsha Chart (Past-Life Karma & Ultimate Destiny)", 
                desc: "The supreme divisional chart; mirrors past-life merits, soul origin, and ultimate karmic destiny.",
                interp: "Divides each sign into sixty 30' segments holding the karmic blueprint of past incarnations.\n\n" +
                  "• Parashari & KP Analysis: Every minute shift alters D60 placement; your chart reveals deep spiritual purpose, karmic clearing from past lives, and an overarching destiny dedicated to wisdom and service.\n" +
                  "• Supreme Synthesis: Integrates all divisional strengths into a unified blueprint of ultimate soul evolution." 
              }
            ].map((varga) => (
              <div key={varga.id} className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-indigo-900">{varga.name}</span>
                  <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                    {varga.id} Varga
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600">{varga.desc}</p>
                <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-700 leading-relaxed font-sans">
                  <span className="font-semibold text-slate-900">Personal Analysis: </span>
                  {varga.interp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: JAIMINI SYSTEM */}
      {(activeSection === "all" || activeSection === "jaimini") && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                <CompassIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">3. Jaimini System & Chara Dasha Interpretations</h3>
                <p className="text-xs text-slate-500">Atmakaraka Mars, Amatyakaraka Jupiter, Arudha pdas, and Chara Dasha evolution.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Jaimini System
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Jaimini Karakas (Nitin's Chart)</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Atmakaraka (Soul):</span>
                  <span className="font-bold text-purple-900">Mars (Desire & Action)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Amatyakaraka (Career):</span>
                  <span className="font-semibold text-slate-900">Jupiter (Wisdom & Guidance)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Darakaraka (Spouse):</span>
                  <span className="font-semibold text-slate-900">Saturn (Duty & Commitment)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Arudha Padas (Public Image)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your Arudha Lagna (AL) in Virgo (House 3) and A10 in Aries (House 10) indicate that your public standing, enterprise, and professional identity are characterized by industrious precision, sharp intellect, and bold leadership in your specialized endeavors.
              </p>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Chara Dasha Timeline</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jaimini Chara Dasha sequences sign periods based on your birth chart. Your current Scorpio Chara Dasha (2021–2027) brings deep transformation, research focus, and inward spiritual renewal before transitioning into Sagittarius and Capricorn phases of expansion and achievement.
              </p>
            </div>
          </div>

          {/* Jaimini Argalas, Sahams & Yogas Review Table */}
          <div className="mt-6 bg-slate-50/90 border border-slate-200/80 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" /> Jaimini Argalas, Sahams, Yogas & Doshas Comprehensive Table
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block border-b pb-1">Jaimini Argalas (Interlocking House Influences)</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">House 1 Primary Argala (from 4th House Rahu):</span>
                    <span className="font-medium text-amber-700">Obstructed by 10th House Ketu (Virodha)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">House 1 Primary Argala (from 11th House Mars):</span>
                    <span className="font-medium text-emerald-700">Unobstructed (Direct Gains & Enterprise Support)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Argalas reveal how planetary actions compound across houses. Mars in 11th provides unobstructed positive reinforcement to the physical and professional self.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block border-b pb-1">Sahams & Yogas/Doshas Analysis</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Active Vedic Yogas:</span>
                    <span className="font-medium text-indigo-700">31 Auspicious Yogas (Raja, Gajakesari, Dhana)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Major Doshas:</span>
                    <span className="font-medium text-emerald-700">0 Major Doshas (Clean Karmic Blueprint)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Key Sahams (Fortune & Spirit):</span>
                    <span className="font-medium text-slate-800">Part of Fortune in 9th (Pisces) & Spirit in 10th (Aries)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Sahams highlight specialized life success points while 31 active yogas provide sustained career status and intellectual standing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: KP SYSTEM & CUSPS */}
      {(activeSection === "all" || activeSection === "kp") && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">4. KP (Krishnamurti Paddhati) System & CSL Analysis</h3>
                <p className="text-xs text-slate-500">Placidus cusps, star lords, sub lords, and house significators for precise life outcomes.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              KP Astrology System
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">KP Cuspal Sub Lords (CSL Highlights)</h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 text-xs">
                {Object.keys(kpCusps).length > 0 ? (
                  Object.entries(kpCusps).map(([hKey, hData]: [string, any]) => (
                    <div key={hKey} className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                      <span className="font-semibold text-slate-900">House {hData.house_number || hKey.replace("House_", "")} ({hData.sign})</span>
                      <span className="bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded font-medium">CSL: {hData.sub_lord}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">KP Placidus cuspal sub-lords govern event fruition across all 12 houses.</p>
                )}
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">KP Significators & Timing Logic</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                In KP astrology, planet significators are categorized into 4 levels (occupants of stars of occupants, house occupants, house owners, stars of house owners). Your strong connection between 2, 6, 10, and 11 houses via KP significators ensures reliable professional stability and financial gains during favorable DBA periods.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: WESTERN, NADI, LAL KITAB, TAJIK, CHINESE */}
      {(activeSection === "all" || activeSection === "western" || activeSection === "nadi_lal" || activeSection === "tajik_chinese") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Western Tropical */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" /> 5. Western Tropical Astrology
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">Tropical Zodiac</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your tropical chart features Sun in Capricorn (House 7) and Moon in Pisces (House 9), blending structured professional pragmatism with deep spiritual idealism, artistic appreciation, and visionary intuition.
            </p>
          </div>

          {/* Nadi & Lal Kitab */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-600" /> 6. Nadi & Lal Kitab Karmic Tables
              </h3>
              <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-medium">Karmic & Remedial</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nandi Nadi highlights Jupiter as your Jiva Karaka and Saturn as Dharma Karaka, emphasizing righteous duty, patience, and karmic evolution through service. Lal Kitab planetary placements suggest simple, effective ancestral remedies to maintain domestic harmony.
            </p>
          </div>

          {/* Tajik Varshaphala */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" /> 7. Tajik Varshaphal (Annual Solar Return)
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">Annual Cycles</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your annual Varshaphal highlights Jupiter as Year Lord (Varsha Pati) and Muntha in House 10, bringing heightened career recognition, auspicious expansion, and successful execution of long-term goals.
            </p>
          </div>

          {/* Chinese Bazi */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-600" /> 8. Chinese Bazi (Four Pillars of Destiny)
              </h3>
              <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium">Four Pillars</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your Four Pillars (Year of the Fire Dragon - Bing Chen, Day Master Yang Metal - Geng) indicate steadfast determination, resilience, natural leadership, and strong metal-water-earth elemental balance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
