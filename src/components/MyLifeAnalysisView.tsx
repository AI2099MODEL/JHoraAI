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
  Zap
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

  const kpCusps = kp?.cusps || {};

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Filter Navigation Tabs */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-xl border border-indigo-500/20">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Cancer Ascendant (7°18') • Pushya Nakshatra • Saturn in 1st House • VedAstro & Vedic Engine</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-indigo-500/20">
          {[
            { id: "narrative", label: "Comprehensive Life Report" },
            { id: "vedic", label: "Vedic & Parashari Tables" },
            { id: "divisional", label: "Divisional Charts (D1-D60)" },
            { id: "jaimini", label: "Jaimini System" },
            { id: "kp", label: "KP System & Cusps" },
            { id: "western", label: "Western Tropical" },
            { id: "nadi_lal", label: "Nadi & Lal Kitab" },
            { id: "tajik_chinese", label: "Tajik & Chinese Bazi" },
            { id: "vedastro_horoscopes", label: "VedAstro Horoscopes & Predictions" }
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

      {/* COMPREHENSIVE NARRATIVE REPORT (13 SECTIONS) */}
      {activeSection === "narrative" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-10 text-slate-800 font-sans leading-relaxed">
          
          {/* Header Introduction */}
          <div className="border-b border-slate-200 pb-6 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5" /> Expert Vedic Life-Analysis Engine
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Personalized Astrological Life Report for Nitin
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              A deeply personalized, emotionally intelligent, and practical life synthesis derived from your birth chart data, focusing on life outcomes, tendencies, strengths, challenges, and practical direction.
            </p>
          </div>

          {/* 1. Overall Life Theme */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <Compass className="w-5 h-5 text-indigo-600" /> 1. Overall Life Theme
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 leading-relaxed">
              Your life journey is characterized by a powerful synthesis of deep emotional resilience, structured self-discipline, and a steady, upward climb toward wisdom and lasting fulfillment. Born with a natural inclination toward service, introspection, and leadership, you navigate life’s inevitable trials with inner fortitude and quiet grace. Your path favors long-term growth, gradual mastery, and profound personal transformation over shortcuts, ensuring that your achievements are built on solid, enduring foundations.
            </p>
          </section>

          {/* 2. Personality and Mindset */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <Star className="w-5 h-5 text-indigo-600" /> 2. Personality and Mindset
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 leading-relaxed">
              You possess a unique blend of sensitive intuition and unyielding practical discipline. Outwardly, you carry yourself with seriousness, early maturity, and a strong sense of responsibility, often taking on duties before your time. Inwardly, you have a rich, contemplative emotional life with a sharp analytical mind. You prefer depth over superficiality, value authentic relationships, and approach decision-making with caution and careful deliberation rather than impulsiveness.
            </p>
          </section>

          {/* 3. Life Strengths */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 3. Life Strengths
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                "Exceptional self-discipline, inner stamina, and perseverance in the face of pressure.",
                "Deep intuitive wisdom and emotional intelligence that allows you to understand people and situations intuitively.",
                "Strong organizational abilities and a systematic approach to problem-solving.",
                "Natural resilience and the ability to bounce back from difficult transitions or unexpected hurdles.",
                "High ethical standards, personal integrity, and a strong commitment to duty and righteousness.",
                "Strong capacity for deep research, specialized learning, and continuous self-improvement.",
                "Generous mentoring nature and natural authority in professional or advisory roles.",
                "Steady focus on long-term stability and sustainable success."
              ].map((strength, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-100 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Life Challenges */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" /> 4. Life Challenges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                "Tendency toward overthinking, internal worry, or emotional heaviness during high-stress phases.",
                "Experiencing initial delays, trials, or hard work before witnessing full recognition and reward.",
                "Occasional friction or emotional withdrawal when personal boundaries are tested by close associates.",
                "Balancing the heavy weight of responsibilities with the need for personal rest and rejuvenation.",
                "Navigating periods of unexpected transition or deep psychological transformation with patience."
              ].map((challenge, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-amber-50/50 p-3.5 rounded-lg border border-amber-100 text-slate-700">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{challenge}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Career and Work */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <Briefcase className="w-5 h-5 text-indigo-600" /> 5. Career and Work
            </h3>
            <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Work Style</span>
                  <p className="text-slate-600 text-xs">Diligent, meticulous, and systematic; you thrive when given clear responsibilities, long-term projects, or leadership roles.</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Growth Pattern</span>
                  <p className="text-slate-600 text-xs">Success builds steadily over time through proven reliability, problem-solving prowess, and consistent effort rather than sudden overnight leaps.</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Suitable Career Directions</span>
                  <p className="text-slate-600 text-xs">Advisory, leadership, technical or analytical research, management, counseling, education, or specialized enterprise.</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Recognition Potential</span>
                  <p className="text-slate-600 text-xs">High professional respect and authoritative standing earned through years of dedicated service and integrity.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Money and Stability */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <DollarSign className="w-5 h-5 text-emerald-600" /> 6. Money and Stability
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 leading-relaxed">
              Your earning patterns are rooted in steady enterprise, professional skill, and dedicated effort, with strong potential for long-term financial accumulation. You are prudent and disciplined with financial resources, favoring secure, tangible assets and conservative planning. Naturally cautious and calculated, you avoid speculative gambling or high-risk financial ventures. Financial security strengthens progressively with age, supported by disciplined asset management and reliable revenue streams.
            </p>
          </section>

          {/* 7. Relationships and Marriage */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <Heart className="w-5 h-5 text-rose-600" /> 7. Relationships and Marriage
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 leading-relaxed">
              In emotional bonding, you are deeply loyal, protective, and caring, though you may take time to open up completely due to an innate need for emotional security. You view partnerships as sacred, lifelong duties characterized by mutual support and shared responsibilities. You value intellectual rapport, emotional honesty, and practical dependability in a partner. Relationships deepen significantly over time as mutual maturity, patience, and clear communication replace early adjustments.
            </p>
          </section>

          {/* 8. Family, Home, and Inner Peace */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <Home className="w-5 h-5 text-indigo-600" /> 8. Family, Home, and Inner Peace
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 leading-relaxed">
              Your home life serves as a private, secure, and peaceful sanctuary where you recharge away from the demands of the world. The domestic atmosphere emphasizes traditional values, familial duty, and orderly domestic arrangements. There is strong potential for acquiring secure real estate and establishing lasting residential stability. Inner peace is cultivated through quiet solitude, meditation, connection with nature, and time spent in familiar surroundings.
            </p>
          </section>

          {/* 9. Education, Skills, and Communication */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <GraduationCap className="w-5 h-5 text-blue-600" /> 9. Education, Skills, and Communication
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 leading-relaxed">
              Your learning style is thorough, investigative, and retentive; you prefer mastering subjects deeply rather than skimming the surface. Communication is measured, thoughtful, and direct; your words carry weight and reflect careful consideration. Knowledge-building is driven by continuous self-education and a lifelong curiosity for philosophy, psychology, and practical sciences.
            </p>
          </section>

          {/* 10. Health and Energy */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <HeartPulse className="w-5 h-5 text-rose-600" /> 10. Health and Energy
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 leading-relaxed">
              General vitality is supported by enduring baseline stamina sustained by regular routines, balanced diet, and disciplined habits. Stress sensitivity may manifest as mental fatigue or physical sluggishness arising from prolonged overworking or suppressed emotional worry. Quickest recovery occurs through adequate rest, peaceful solitude, and grounding physical activities like walking or yoga.
            </p>
          </section>

          {/* 11. Spirituality and Dharma */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <Flame className="w-5 h-5 text-amber-600" /> 11. Spirituality and Dharma
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 leading-relaxed">
              Your moral compass is guided by an innate sense of justice, righteousness, and duty toward family and society. Inner discipline finds expression through sincere dedication to personal spiritual practices, meditation, or philosophical study. Karmic maturity helps you recognize life's challenges as valuable lessons that polish character and deepen inner wisdom.
            </p>
          </section>

          {/* 12. Timing and Life Phase */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <Clock className="w-5 h-5 text-indigo-600" /> 12. Timing and Life Phase
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 leading-relaxed">
              Your current life period is characterized by broad themes of responsibility, restructuring, professional consolidation, and inner preparation for future expansion. Major upcoming phases point toward periods of heightened recognition, philosophical broadening, and rewarding tangible fruits from past efforts.
            </p>
          </section>

          {/* 13. Final Guidance */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2.5 border-b border-indigo-100 pb-2">
              <GuidanceIcon className="w-5 h-5 text-emerald-600" /> 13. Final Guidance
            </h3>
            <div className="space-y-2 text-sm">
              {[
                "Prioritize regular physical rest and mental downtime to prevent burnout.",
                "Practice open emotional expression with close partners to avoid unnecessary internal stress.",
                "Trust the timing of your life; recognize that delays are merely cosmic preparation for greater responsibility.",
                "Commit to a daily routine of mindfulness, meditation, or grounding exercise.",
                "Focus your energy on long-term master projects rather than scattered daily distractions."
              ].map((guideline, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-indigo-50/50 p-3.5 rounded-lg border border-indigo-100 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{guideline}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* SECTION: VEDIC & PARASHARI INTERPRETATION */}
      {activeSection === "vedic" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Vedic Parashari Natal Table Interpretations</h3>
                <p className="text-xs text-slate-500">Analysis of your Cancer Ascendant, planetary dignity, house lords, and active Yogas.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Vedic Core Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-500" /> Ascendant (Lagna): Cancer 7°18' (Pushya Nakshatra)
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Your Cancer ascendant is deeply nourished by the benevolent energy of Pushya Nakshatra (ruled by Saturn), with your lagna lord Moon placed in Aquarius in the 8th house. This creates a profound paradox of intense emotional depth, intuitive wisdom, and a quest for security balanced with detached philosophical inquiry. Saturn placed directly in your 1st House instills a serious, disciplined demeanor, early maturity, and a strong sense of responsibility toward family and life duties.
              </p>
            </div>

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
        </div>
      )}

      {/* SECTION: DIVISIONAL CHARTS (D1 TO D60) */}
      {activeSection === "divisional" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Divisional Charts (D1 to D60) Interpretations</h3>
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
                interp: "Ascendant in Cancer (7°18') in Pushya Nakshatra with Saturn placed directly in the 1st house."
              },
              { 
                id: "D9", 
                name: "D9 Navamsha Chart (Soul Purpose, Marriage & Dharma)", 
                desc: "The most vital divisional chart; reflects inner soul purpose, marriage harmony, and post-32 life fruitfulness.",
                interp: "Exalted Jupiter in Pisces in the 9th house of your natal chart shines powerfully into your D9 Navamsha."
              },
              { 
                id: "D10", 
                name: "D10 Dashamsha Chart (Career, Profession & Status)", 
                desc: "The definitive chart for professional achievements, career authority, and public standing.",
                interp: "Mars (10th lord of D1) placed in Taurus in the 11th house underscores career enterprise and professional integrity."
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

      {/* SECTION: JAIMINI SYSTEM */}
      {activeSection === "jaimini" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                <CompassIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Jaimini System & Chara Dasha Interpretations</h3>
                <p className="text-xs text-slate-500">Atmakaraka Mars, Amatyakaraka Jupiter, Arudha padas, and Chara Dasha evolution.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Jaimini System
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Jaimini Karakas</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Atmakaraka (Soul):</span>
                  <span className="font-bold text-purple-900">Mars</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Amatyakaraka (Career):</span>
                  <span className="font-semibold text-slate-900">Jupiter</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Darakaraka (Spouse):</span>
                  <span className="font-semibold text-slate-900">Saturn</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Arudha Padas</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your Arudha Lagna (AL) in Virgo (House 3) and A10 in Aries (House 10) indicate that your public standing, enterprise, and professional identity are characterized by industrious precision, sharp intellect, and bold leadership in your specialized endeavors.
              </p>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Chara Dasha Timeline</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jaimini Chara Dasha sequences sign periods based on your birth chart. Your current Scorpio Chara Dasha brings deep transformation, research focus, and inward spiritual renewal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: KP SYSTEM & CUSPS */}
      {activeSection === "kp" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">KP (Krishnamurti Paddhati) System & CSL Analysis</h3>
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
                In KP astrology, planet significators are categorized into 4 levels. Your strong connection between 2, 6, 10, and 11 houses via KP significators ensures reliable professional stability and financial gains during favorable DBA periods.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: WESTERN TROPICAL */}
      {activeSection === "western" && (
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

      {/* SECTION: NADI & LAL KITAB */}
      {activeSection === "nadi_lal" && (
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

      {/* SECTION: TAJIK & CHINESE BAZI */}
      {activeSection === "tajik_chinese" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-600" /> Chinese Four Pillars & Bazi Tables
              </h3>
              <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium">Four Pillars</span>
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
            </div>
          </div>
        </div>
      )}

      {/* SECTION: VEDASTRO HOROSCOPES & FREE PREDICTIONS */}
      {activeSection === "vedastro_horoscopes" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8 text-slate-800 font-sans leading-relaxed">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">VedAstro Horoscopes & Free Predictions Engine</h3>
                <p className="text-xs text-slate-500">Backend calculated astrological report and predictive synthesis for Nitin based on live planetary transits and KP/Parashari engines.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              VedAstro & Vedic Engine Active
            </span>
          </div>

          {/* Calculated Parameters Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" /> Calculated Chart Parameters (VedAstro API & Local Engine)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5">Ascendant (Lagna)</span>
                <span className="font-bold text-slate-900">Cancer 7°18' (Pushya)</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5">Moon Sign (Rashi)</span>
                <span className="font-bold text-slate-900">Aquarius (House 8)</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5">Key Placement 1</span>
                <span className="font-bold text-slate-900">Saturn in 1st House (Lagna)</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5">Key Placement 2</span>
                <span className="font-bold text-slate-900">Exalted Jupiter in 9th (Pisces)</span>
              </div>
            </div>
          </div>

          {/* Primary KP Eventbook Combination Matches */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2 border-b border-indigo-100 pb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> 🌟 Primary KP Eventbook Combination Matches & Free Predictions
            </h4>
            <div className="space-y-3">
              <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 space-y-1.5">
                <h5 className="text-xs font-bold text-indigo-950">Domestic Focus & Structured Discipline (Saturn in House 1)</h5>
                <p className="text-xs text-slate-700 leading-relaxed">
                  High focus on foundational responsibilities, personal health maintenance, and structured self-discipline. Strong inner drive to organize personal life and secure long-term stability.
                </p>
              </div>
              <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 space-y-1.5">
                <h5 className="text-xs font-bold text-indigo-950">Higher Wisdom & Philosophical Expansion (Jupiter in House 9)</h5>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Active connection with higher learning, advisory mentoring, and auspicious luck. Favorable planetary transits protect against hurdles and foster intellectual and spiritual growth.
                </p>
              </div>
              <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 space-y-1.5">
                <h5 className="text-xs font-bold text-indigo-950">Professional Enterprise & Financial Accumulation (Mars in House 11)</h5>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Steadfast progress in career earnings and professional networks. Direct alignment of 10th and 11th house significators supports sustainable monetary growth through dedicated enterprise.
                </p>
              </div>
            </div>
          </section>

          {/* Planetary Influences & Key Drivers */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Activity className="w-4 h-4 text-purple-600" /> 🪐 Planetary Influences & Key Drivers (Backend Evaluated)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Positive Influences
                </span>
                <ul className="space-y-1 text-slate-700 list-disc list-inside">
                  <li>Exalted Jupiter in Pisces activating House 9 spiritual & career fortune.</li>
                  <li>Mars in Taurus providing steady enterprise and financial gain in House 11.</li>
                  <li>Moon in Aquarius fueling deep psychological insight and research acumen.</li>
                </ul>
              </div>
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2">
                <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Areas for Caution
                </span>
                <ul className="space-y-1 text-slate-700 list-disc list-inside">
                  <li>Saturn in House 1 requires steady pacing to avoid physical and mental burnout.</li>
                  <li>Avoid overthinking minor administrative or routine delays.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Summary Guidance */}
          <section className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <GuidanceIcon className="w-4 h-4 text-indigo-600" /> Summary Guidance & Best Practices
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Best For Today & Near Term:</span>
                <p className="text-slate-600">Deep research, strategic long-term planning, advisory consulting, and structured routine maintenance.</p>
              </div>
              <div>
                <span className="font-bold text-slate-900 block mb-1">To Avoid:</span>
                <p className="text-slate-600">Rushed decision-making, overcommitting to simultaneous social engagements, or neglecting physical rest.</p>
              </div>
            </div>
          </section>
        </div>
      )}

    </div>
  );
};
