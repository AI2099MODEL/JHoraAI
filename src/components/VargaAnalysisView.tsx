import React from "react";
import { 
  User, 
  Briefcase, 
  Shield, 
  Heart, 
  Zap, 
  Compass, 
  Award, 
  Activity, 
  Sparkles, 
  Home, 
  Users, 
  Feather
} from "lucide-react";

interface VargaAnalysisViewProps {
  isDark: boolean;
}

export function VargaAnalysisView({ isDark }: VargaAnalysisViewProps) {
  const containerBg = isDark ? "bg-slate-900/20 border-slate-800/80" : "bg-neutral-50 border-neutral-200/80";
  const cardBg = isDark ? "bg-slate-950/40 border-slate-800/50 hover:border-amber-500/10" : "bg-white border-neutral-200 hover:border-amber-500/10";
  const textTitle = isDark ? "text-slate-200" : "text-neutral-800";
  const textDesc = isDark ? "text-slate-300" : "text-neutral-700";
  const textMuted = isDark ? "text-slate-400" : "text-neutral-500";
  const bulletColor = isDark ? "text-amber-500/80" : "text-amber-600/80";

  const vargas = [
    {
      id: "d1",
      title: "D-1 Rashi (Life Blueprint)",
      icon: User,
      bullets: [
        "Your life path is marked by significant early-life responsibilities and structural challenges that forge an exceptionally resilient, patient, and self-reliant character.",
        "You possess a highly intuitive, deep, and psychological approach to life, giving you a natural talent for research, mystery, and uncovering hidden truths.",
        "Profound spiritual protection and philosophical maturity guide your path, enabling you to transform obstacles into lasting prosperity and right action."
      ]
    },
    {
      id: "d2",
      title: "D-2 Hora (Wealth & Security)",
      icon: Zap,
      bullets: [
        "Financial accumulation is built through systematic, patient, and highly disciplined efforts rather than quick, speculative gains.",
        "Your communication carries a serious, measured, and authoritative weight that commands respect in advisory or corporate environments.",
        "True material security and peace of mind grow through structured asset stewardship and gradual, long-term investments."
      ]
    },
    {
      id: "d3",
      title: "D-3 Drekkana (Courage & Enterprise)",
      icon: Compass,
      bullets: [
        "You possess a self-made destiny where success is carved out directly through painstaking personal effort and inner drive.",
        "Your initiative is channeled into mastering highly technical or analytical skills, ensuring independence in your endeavors.",
        "Short-distance travels, local networks, and persistent small actions serve as vital catalysts that activate your career growth."
      ]
    },
    {
      id: "d4",
      title: "D-4 Chaturthamsa (Stability & Foundations)",
      icon: Home,
      bullets: [
        "Real estate foundations and fixed assets require persistent early-life efforts to establish permanent, secure roots.",
        "True emotional peace is attained by establishing a highly structured, clean, and spiritually grounded home environment.",
        "You enjoy reliable protection against sudden residential or domestic instabilities, providing a solid anchor for professional expansion."
      ]
    },
    {
      id: "d5",
      title: "D-5 Panchamsa (Intellect & Recognition)",
      icon: Award,
      bullets: [
        "Your mind operates with high analytical clarity, showing a natural talent for organizing complex or esoteric systems of knowledge.",
        "Public recognition and intellectual authority are established through patient research, advisory counseling, or specialized teaching.",
        "Fame and professional respect are earned slowly and stably through deep expertise rather than sudden exposure."
      ]
    },
    {
      id: "d6",
      title: "D-6 Shastamsa (Challenges & Vitality)",
      icon: Activity,
      bullets: [
        "Health vulnerabilities and hidden challenges are systematically managed and cleared through structured daily routines.",
        "You naturally overcome competitors and open opposition not by raw aggression, but through patient endurance and methodical problem-solving.",
        "Daily physical discipline and self-care routines serve as your primary shield of high vitality."
      ]
    },
    {
      id: "d7",
      title: "D-7 Saptamsa (Legacy & Mentorship)",
      icon: Feather,
      bullets: [
        "Your creative outputs and relationships with offspring are marked by a deep protective instinct and a sense of sacred mentoring.",
        "Creative projects and guidance of others teach you valuable lessons of emotional balance, counseling, and patience.",
        "Your legacy is built on transferring deep, systemized methods or spiritual wisdom to future generations."
      ]
    },
    {
      id: "d8",
      title: "D-8 Ashtamsa (Transformation & Rebirth)",
      icon: Shield,
      bullets: [
        "You experience a powerful, natural attraction to exploring occult sciences, esoteric secrets, and the deeper mysteries of life.",
        "Sudden life transitions or crises are navigated through exceptional inner resilience, turning intense challenges into spiritual rebirth.",
        "Psychological regeneration is achieved by approaching unexpected changes with calm, structured detachment."
      ]
    },
    {
      id: "d9",
      title: "D-9 Navamsa (Dharmic Blueprint & Soul Path)",
      icon: Heart,
      bullets: [
        "Your inner soul path and marital alignment unfold as a serious journey toward mutual emotional compatibility and shared principles.",
        "A profound activation of hidden talents, spiritual clarity, and real-life purpose occurs in your post-thirty phase of life.",
        "Personal relationships act as intellectual mirrors, guiding you to align your material duties with deep internal values."
      ]
    },
    {
      id: "d10",
      title: "D-10 Dasamsa (Career & Public Authority)",
      icon: Briefcase,
      bullets: [
        "Your career progression is characterized by a steady, highly structured climb to positions of advisory prominence and public authority.",
        "Professional respect is built on technical depth, administrative patience, and systemized knowledge.",
        "You are naturally suited to guide organizations or individuals through structured consulting rather than aggressive political competition."
      ]
    },
    {
      id: "d11",
      title: "D-11 Rudramsa (Material Gains & Desires)",
      icon: Sparkles,
      bullets: [
        "Material gains and the fulfillment of major desires are unlocked through structured, collective associations and spiritual networks.",
        "Prosperity grows steadily, finding maximum expression when aligned with advisory leadership or group mentoring.",
        "Unexpected financial windfalls or opportunities are managed with disciplined stewardship."
      ]
    },
    {
      id: "d12",
      title: "D-12 Dwadasamsa (Ancestral Heritage & Karma)",
      icon: Users,
      bullets: [
        "Deep parental ties and ancestral memories serve as major structural anchors in your life trajectory.",
        "Honoring parental responsibilities and ancestral heritage clears deep-seated karmic debts and unlocks inherited protective blessings.",
        "You serve as a natural channel for preserving traditional wisdom and family lineage values."
      ]
    },
    {
      id: "d16",
      title: "D-16 Shodasamsa (Luxuries & Comforts)",
      icon: Sparkles,
      bullets: [
        "The acquisition of modern comforts, high-quality vehicles, and luxury items is stable, provided mental peace is prioritized.",
        "Material luxuries serve as comfortable vehicles for your life journey rather than an empty pursuit of vanity.",
        "Traveling is harmonious and aligns with your inner sense of aesthetic balance."
      ]
    },
    {
      id: "d20",
      title: "D-20 Vimsamsa (Spiritual Milestones)",
      icon: Shield,
      bullets: [
        "You have a profound, soul-level alignment with meditation, spiritual disciplines, and ancient systems like astrology.",
        "Deep study of esoteric sciences brings ultimate stability and protection to all other material areas of your life.",
        "Progress in spiritual practices or mantra sadhana acts as your ultimate shield against life's external storms."
      ]
    },
    {
      id: "d24",
      title: "D-24 Chaturvimsamsa (Higher Learning & Wisdom)",
      icon: Award,
      bullets: [
        "Your intellect thrives on scholarly patience, deep research, and mastering complex, traditional branches of knowledge.",
        "True wisdom is earned through disciplined self-study and integrating ancient sciences with modern systems.",
        "You possess the intellectual authority to write, teach, or consult on highly specialized subjects."
      ]
    },
    {
      id: "d27",
      title: "D-27 Nakshatramsa (Emotional Strength)",
      icon: Sparkles,
      bullets: [
        "Emotional resilience is developed by mastering mental anxieties and anchoring yourself in structured philosophies.",
        "Peak energy and vitality are activated when you channel your thoughts into advisory counseling or deep analytical research.",
        "Relationships with peers and networks are balanced through calm, objective, and mature communication."
      ]
    },
    {
      id: "d30",
      title: "D-30 Trimsamsa (Resilience & Obstacles)",
      icon: Activity,
      bullets: [
        "Subconscious blockages, health vulnerabilities, or moral tests are systematically cleared through rigorous self-discipline.",
        "High resilience is granted, allowing you to convert sudden setbacks into profound personal strength.",
        "You have an innate capacity to rise above hidden oppositions with quiet grace and integrity."
      ]
    },
    {
      id: "d40",
      title: "D-40 Khavedamsa (Auspicious Cycles)",
      icon: Sparkles,
      bullets: [
        "Underlying cosmic grace brings timely assistance and protection during challenging phases of life.",
        "Your primary endeavors are guided by positive cycles, ensuring that your long-term path remains safe and progressive."
      ]
    },
    {
      id: "d45",
      title: "D-45 Akshavedamsa (Conscience & Integrity)",
      icon: Shield,
      bullets: [
        "Your personality is deeply rooted in truth, high moral principles, and a clean conscience.",
        "Public reputation and spiritual evolution are fully supported by your commitment to transparency and ethical actions."
      ]
    },
    {
      id: "d60",
      title: "D-60 Shastyamsa (Soul Seed & Past Karma)",
      icon: Sparkles,
      bullets: [
        "Your ultimate soul destiny is defined by settling specific karmic responsibilities by serving as a mentor, counselor, or guide to others.",
        "True self-realization is achieved when you align your professional activities with selfless guidance and the dissemination of ancient wisdom.",
        "Your deepest soul-level peace is attained through service, helping others navigate their life paths."
      ]
    }
  ];

  return (
    <div className={`space-y-6 rounded-2xl border p-5 ${containerBg} backdrop-blur-md`}>
      <div className="space-y-1 pb-4 border-b border-dashed border-slate-500/10">
        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/10 inline-block">
          Divisional Chart (Varga) Analysis
        </span>
        <p className={`text-[11px] ${textMuted} font-sans leading-relaxed`}>
          A detailed, points-based examination of your natal promise across all 20 primary levels of divisional astrology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vargas.map((varga) => {
          const Icon = varga.icon;
          return (
            <div key={varga.id} className={`rounded-xl border p-4 space-y-3 transition-all duration-300 ${cardBg} shadow-sm`}>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/25 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
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
