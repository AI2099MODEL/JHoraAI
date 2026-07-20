import React from "react";
import { 
  Sparkles, 
  User, 
  Briefcase, 
  Shield, 
  Heart, 
  Zap, 
  Compass, 
  Award, 
  Activity, 
  Layers, 
  HelpCircle,
  Home,
  Users,
  Feather
} from "lucide-react";

interface VargaAnalysisViewProps {
  isDark: boolean;
}

export function VargaAnalysisView({ isDark }: VargaAnalysisViewProps) {
  const containerBg = isDark ? "bg-slate-900/20 border-slate-800/80" : "bg-neutral-50 border-neutral-200/80";
  const cardBg = isDark ? "bg-slate-950/40 border-slate-800/50 hover:border-amber-500/20" : "bg-white border-neutral-200 hover:border-amber-500/20";
  const textTitle = isDark ? "text-amber-400" : "text-amber-600";
  const textDesc = isDark ? "text-slate-300" : "text-neutral-700";
  const textMuted = isDark ? "text-slate-400" : "text-neutral-500";
  const bulletColor = isDark ? "text-amber-500/80" : "text-amber-600/80";

  const vargas = [
    {
      id: "d1",
      title: "D-1 Rashi (Life Blueprint)",
      icon: User,
      bullets: [
        "Primary anchor of your physical existence, vitality, and overall life-path trajectory.",
        "Represents a personality defined by high emotional sensitivity and deep empathy, which requires establishing healthy personal boundaries.",
        "Indicates early-life challenges and additional family responsibilities, which build strong self-discipline, resilience, and patience.",
        "Yields a highly intuitive, deep psychological approach to life with a natural talent for research, mystery, and uncovering hidden truths.",
        "Grants exceptional spiritual wisdom, natural grace, and philosophical maturity that guide your path to prosperity and right action."
      ]
    },
    {
      id: "d2",
      title: "D-2 Hora (Wealth & Resource Security)",
      icon: Zap,
      bullets: [
        "Focuses on your capacity for wealth accumulation, financial resources, and speech.",
        "Indicates that your wealth is closely tied to persistent effort, structured management, and strategic partnerships.",
        "Highlights a strong connection to ancestral values and speech-based leadership, allowing you to influence others through precise, measured communication.",
        "Shows that financial stability grows steadily over time rather than in sudden spikes, rewarding systemic savings and careful asset management."
      ]
    },
    {
      id: "d3",
      title: "D-3 Drekkana (Enterprise & Inner Drive)",
      icon: Compass,
      bullets: [
        "Governs your siblings, immediate peer circles, and personal courage or drive.",
        "Represents a self-made destiny where success and personal enterprise are born directly from your courage and inner initiatives.",
        "Shows a high degree of persistence and dedication to technical or analytical skills, ensuring you can tackle complex undertakings independently.",
        "Indicates short-distance travels or local ventures play a critical role in expanding your network and activating your potential."
      ]
    },
    {
      id: "d4",
      title: "D-4 Chaturthamsa (Stability & Peace)",
      icon: Home,
      bullets: [
        "Reflects property ownership, real estate, fixed assets, and your core psychological peace.",
        "Assures a strong focus on building permanent foundations, with steady gains in property and fixed assets, particularly in the later part of life.",
        "Highlights that your true inner peace is attained through domestic harmony, close ties to your mother or motherland, and maintaining a spiritually clean living space.",
        "Shows protection against sudden residential instabilities, establishing a solid anchor for personal and professional growth."
      ]
    },
    {
      id: "d7",
      title: "D-7 Saptamsa (Creativity & Progeny)",
      icon: Feather,
      bullets: [
        "Explores creative outputs, children, and your spiritual legacy.",
        "Indicates deep emotional bonds and high expectations in raising children or guiding projects, prompting you to act as a mentor, counselor, and protective guide.",
        "Focuses on creative fertility, showing that your ideas and intellect thrive when applied to teaching, systematic mentoring, or deep research.",
        "Represents a legacy built not just on material lineage, but on transferring ancient or technical wisdom to future generations."
      ]
    },
    {
      id: "d9",
      title: "D-9 Navamsa (Dharmic Path & Marriage)",
      icon: Heart,
      bullets: [
        "Defines the inner soul path, partner dynamics, and your development post-thirty.",
        "Reveals a life partner who acts as an intellectual mirror, challenging you to seek deep, authentic compatibility and shared dharmic values.",
        "Indicates a massive activation of hidden talents and spiritual clarity after your mid-thirties, aligning you with your true life purpose.",
        "Confirms a powerful focus on internal balance, suggesting that external success is a direct reflection of your inner emotional alignment."
      ]
    },
    {
      id: "d10",
      title: "D-10 Dasamsa (Career & Public Authority)",
      icon: Briefcase,
      bullets: [
        "Represents professional standing, public authority, and your career blueprint.",
        "Governs career trajectories highlighting professional growth in analytical, advisory, public service, or specialized teaching roles.",
        "Indicates that your public recognition is built on wisdom, patience, and technical expertise rather than aggressive competition.",
        "Shows a steady rise to leadership or consulting positions where you guide others using systemized knowledge or astrological systems."
      ]
    },
    {
      id: "d12",
      title: "D-12 Dwadasamsa (Heritage & Lineage)",
      icon: Users,
      bullets: [
        "Unlocks ancestral lineage, parental influences, and deep genetic memory.",
        "Represents a strong spiritual and ethical inheritance from parents and ancestral mentors, serving as a guiding compass in life.",
        "Indicates that resolving parental duties and honoring ancestral lineage unlocks profound inner strength and clears long-standing family karmas.",
        "Connects you to traditional knowledge bases, ensuring that your pursuits are supported by ancestral blessings."
      ]
    },
    {
      id: "d16",
      title: "D-16 Shodasamsa (Comforts & Luxuries)",
      icon: Sparkles,
      bullets: [
        "Mapped to vehicles, physical luxuries, and overall material comfort.",
        "Assures steady progress in acquiring modern comforts, luxury items, and reliable vehicles without getting lost in materialistic desires.",
        "Emphasizes that your enjoyment of material comforts depends directly on your mental peace and spiritual alignment.",
        "Mentions a potential to enjoy harmonious travels and comfortable, high-quality, aesthetic vehicles."
      ]
    },
    {
      id: "d20",
      title: "D-20 Vimsamsa (Spiritual Milestones)",
      icon: Shield,
      bullets: [
        "Governs spiritual evolution, mantra sadhana, and deep esoteric study.",
        "Indicates a powerful, natural connection to spiritual disciplines, meditation, and ancient knowledge such as astrology.",
        "Highlights a soul-level pursuit of higher consciousness, showing that success in your spiritual practice brings ultimate stability to all other areas of your life.",
        "Promotes natural skills in reading planetary patterns or esoteric signs, fueled by regular, disciplined meditation."
      ]
    },
    {
      id: "d24",
      title: "D-24 Chaturvimsamsa (Intellect & Knowledge)",
      icon: Award,
      bullets: [
        "Focuses on higher academic learning, intellectual expansion, and wisdom.",
        "Represents an exceptionally analytical, deep, and scholarly mind with an endless thirst for mastering complex sciences.",
        "Shows that your true wisdom is attained through self-study, research, and integrating ancient wisdom with modern systems.",
        "Indicates success in higher educational pursuits, giving you the credentials to teach, write, or consult authoritatively."
      ]
    },
    {
      id: "d30",
      title: "D-30 Trimsamsa (Challenges & Resilience)",
      icon: Activity,
      bullets: [
        "Explores hidden challenges, health vulnerabilities, and overcoming obstacles.",
        "Indicates that any physical or professional challenges are overcome through rigorous self-discipline, structured daily habits, and high patience.",
        "Focuses on transforming sudden obstacles into deep spiritual growth, showing that your challenges act as catalysts for profound personal wisdom.",
        "Assures natural resilience against open or hidden oppositions, allowing you to rise above adversity with grace."
      ]
    },
    {
      id: "d40",
      title: "D-40 Khavedamsa (Auspicious Cycles)",
      icon: Sparkles,
      bullets: [
        "Tracks fine-grained material and spiritual auspiciousness and destiny alignment.",
        "Highlights the presence of positive cosmic cycles that bring timely assistance during difficult phases.",
        "Shows that your general well-being and life path remain protected, ensuring that your primary endeavors find success through unexpected alignments."
      ]
    },
    {
      id: "d45",
      title: "D-45 Akshavedamsa (Conscience & Integrity)",
      icon: Shield,
      bullets: [
        "Inspects character integrity, deep ethics, and pure conscience.",
        "Reflects a personality rooted in absolute truth, high moral fortitude, and strong personal ethics.",
        "Indicates that your personal reputation and spiritual progression are fully supported by your commitment to transparency and ethical dealings."
      ]
    },
    {
      id: "d60",
      title: "D-60 Shastyamsa (Past Life & Soul Destiny)",
      icon: Sparkles,
      bullets: [
        "The ultimate seed of karma, detailing past life patterns and total destiny.",
        "Reveals a highly evolved soul that has returned to settle specific professional and spiritual responsibilities, especially by mentoring others.",
        "Indicates that the highest self-realization is achieved by serving as a counselor, guide, or astrologer, helping others navigate their life charts.",
        "Highlights that your deepest soul-level peace is attained when you align your material duties with selfless service."
      ]
    }
  ];

  return (
    <div className={`space-y-6 rounded-2xl border p-5 ${containerBg} backdrop-blur-md`}>
      <div className="space-y-1.5 border-b border-dashed border-slate-500/10 pb-4">
        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/10 inline-block">
          Divisional Chart (Varga) Analysis
        </span>
        <p className={`text-xs ${textMuted} font-sans leading-relaxed`}>
          A detailed, points-based examination of your natal promise across all the primary levels of astrological division.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vargas.map((varga) => {
          const Icon = varga.icon;
          return (
            <div key={varga.id} className={`rounded-xl border p-4.5 space-y-3 transition-all duration-300 ${cardBg} shadow-sm`}>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/25 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {/* Sleek, tiny heading label instead of a big h2 or h3 */}
                <span className="text-xs font-bold text-slate-300 font-sans tracking-wide">
                  {varga.title}
                </span>
              </div>
              <ul className="space-y-1.5 pl-1">
                {varga.bullets.map((bullet, index) => (
                  <li key={index} className={`text-[11px] leading-relaxed ${textDesc} font-mono flex items-start gap-1.5`}>
                    <span className={`select-none mt-0.5 shrink-0 ${bulletColor}`}>•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
