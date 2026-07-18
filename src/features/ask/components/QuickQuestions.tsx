import React from "react";
import { Briefcase, Heart, DollarSign, Building, Home, Compass, Smile, Activity, RefreshCw, Key, Sun } from "lucide-react";

interface QuickQuestionsProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

interface QuestionChip {
  label: string;
  query: string;
  icon: React.ComponentType<any>;
  color: string;
}

const CHIPS: QuestionChip[] = [
  {
    label: "Career",
    query: "Based on the active chart, what does the 10th house say about my professional growth and ideal vocational fields?",
    icon: Briefcase,
    color: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100",
  },
  {
    label: "Marriage",
    query: "Can you analyze my 7th house and Venus/Jupiter placement for relationship harmony, partner characteristics, and timing?",
    icon: Heart,
    color: "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100",
  },
  {
    label: "Finance",
    query: "What are my wealth-accumulating dhana yogas? Tell me which houses and planetary combinations govern my financial stability.",
    icon: DollarSign,
    color: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100",
  },
  {
    label: "Business",
    query: "Is this dasha period favorable for initiating a business venture? Analyze my 3rd, 7th, and 11th houses.",
    icon: Building,
    color: "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100",
  },
  {
    label: "Property",
    query: "When is the most auspicious period for purchasing real estate or assets? Check my 4th house and Mars strength.",
    icon: Home,
    color: "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100",
  },
  {
    label: "Travel",
    query: "Does my chart indicate foreign settlement or frequent short travels? Tell me about the 9th and 12th house significance.",
    icon: Compass,
    color: "bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100",
  },
  {
    label: "Children",
    query: "Analyze my 5th house and Jupiter (Putrakaraka) for family expansion, children's success, and happiness.",
    icon: Smile,
    color: "bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100",
  },
  {
    label: "Health",
    query: "What planetary combinations govern my physical vitality and health vulnerabilities? Look at the 6th and 8th houses.",
    icon: Activity,
    color: "bg-red-50 text-red-700 border-red-100 hover:bg-red-100",
  },
  {
    label: "Today's Mood",
    query: "How is today's Moon transit affecting my emotional state and mental clarity based on my natal Moon position?",
    icon: Sun,
    color: "bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100",
  },
  {
    label: "Current Transit",
    query: "Summarize the major planetary transits today (specifically Saturn and Jupiter) and how they aspect my natal placements.",
    icon: RefreshCw,
    color: "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100",
  },
  {
    label: "Life Purpose",
    query: "Explain my soul's evolutionary direction in this lifetime based on Rahu, Ketu, and my Atmakaraka.",
    icon: Key,
    color: "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100",
  },
];

export const QuickQuestions: React.FC<QuickQuestionsProps> = ({ onSelectQuestion, disabled }) => {
  return (
    <div className="px-4 mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 font-sans">
        Quick Action Inquiries
      </h3>
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.label}
              disabled={disabled}
              onClick={() => onSelectQuestion(chip.query)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                disabled ? "opacity-50 cursor-not-allowed" : chip.color
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
