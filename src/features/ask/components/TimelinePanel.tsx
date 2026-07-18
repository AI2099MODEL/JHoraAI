import React from "react";
import { Sparkles, Calendar, BookOpen, Smile, Key, ArrowUpRight } from "lucide-react";

export const TimelinePanel: React.FC = () => {
  return (
    <div className="font-sans space-y-5 animate-fade-in">
      {/* Today's Intelligence Placeholder */}
      <div className="bg-gradient-to-tr from-blue-50/50 to-white border border-blue-100 rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-2 right-2 p-1 bg-blue-100/60 rounded-lg text-blue-700 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span className="text-[9px] font-bold text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Daily Intelligence
        </span>
        <h4 className="text-xs font-bold text-slate-800 mt-2">Dasha-Mind Alignment</h4>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          Natal Moon transits into your 9th House today. Mental clarity is high; perfect for strategic planning and philosophical studies.
        </p>
        <div className="mt-2 text-[10px] text-slate-400 italic">Mood Logic Engine coming in Phase 32</div>
      </div>

      {/* Timeline Placeholder */}
      <div className="border border-slate-100 rounded-2xl p-4 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Transits Timeline
          </span>
          <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md font-semibold">
            Planned
          </span>
        </div>

        <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
          <div className="relative pl-5 text-[11px]">
            <div className="absolute left-[5px] top-1 w-1.5 h-1.5 rounded-full bg-blue-500 border border-white" />
            <span className="font-semibold text-slate-700 block">Jupiter Transit (Libra)</span>
            <span className="text-slate-400 text-[9px]">July 18, 2026</span>
          </div>
          <div className="relative pl-5 text-[11px]">
            <div className="absolute left-[5px] top-1 w-1.5 h-1.5 rounded-full bg-amber-500 border border-white" />
            <span className="font-semibold text-slate-700 block">Saturn Retrograde Ends</span>
            <span className="text-slate-400 text-[9px]">August 02, 2026</span>
          </div>
          <div className="relative pl-5 text-[11px]">
            <div className="absolute left-[5px] top-1 w-1.5 h-1.5 rounded-full bg-slate-300 border border-white" />
            <span className="font-semibold text-slate-400 block">Solar Return Alignment</span>
            <span className="text-slate-400 text-[9px] italic">Timeline Engine Phase 33</span>
          </div>
        </div>
      </div>

      {/* Future Engines Bento Box */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-left">
          <BookOpen className="w-4 h-4 text-slate-400 mb-1" />
          <h5 className="text-[10px] font-bold text-slate-700">Knowledge Engine</h5>
          <p className="text-[9px] text-slate-400 mt-0.5">Classic texts & astrological shastras indexer</p>
        </div>

        <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-left">
          <Smile className="w-4 h-4 text-slate-400 mb-1" />
          <h5 className="text-[10px] font-bold text-slate-700">Mood Tracker</h5>
          <p className="text-[9px] text-slate-400 mt-0.5">Track daily vitality & dasha correlation</p>
        </div>

        <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-left col-span-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-400" />
            <div>
              <h5 className="text-[10px] font-bold text-slate-700">Evidence & Predictions</h5>
              <p className="text-[9px] text-slate-400">Backtest predictions against past life events</p>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />
        </div>
      </div>
    </div>
  );
};
