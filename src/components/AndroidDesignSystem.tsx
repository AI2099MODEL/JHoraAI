/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Palette, 
  Type, 
  Smartphone, 
  Sliders, 
  Check, 
  Copy, 
  Database, 
  Sparkles, 
  SlidersHorizontal,
  ChevronRight,
  Info
} from "lucide-react";

export default function AndroidDesignSystem() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [sliderVal, setSliderVal] = useState<number>(72);
  const [toggleVal, setToggleVal] = useState<boolean>(true);
  const [chipVal, setChipVal] = useState<string>("lahiri");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const materialColors = [
    { name: "Primary (Deep Amber)", hex: "#F59E0B", desc: "Interactive states, focus indicators, and CTA backgrounds." },
    { name: "Secondary (Cosmic Indigo)", hex: "#6366F1", desc: "Secondary actions, headings, and visual accents." },
    { name: "Tertiary (Ethereal Emerald)", hex: "#10B981", desc: "Auspicious alignments, active status indicators." },
    { name: "Background (Midnight)", hex: "#020617", desc: "Core dark window canvases and status bar fills." },
    { name: "Surface (Slate Core)", hex: "#0F172A", desc: "Content cards, input boxes, and navigation rails." },
    { name: "Error (Vedic Crimson)", hex: "#EF4444", desc: "Inauspicious timings, severe celestial doshas." },
  ];

  const sqliteTables = [
    {
      sqlite: "user_horoscopes",
      indexedDb: "horoscopes",
      description: "Stores casted horoscope outputs, degrees, and natal planetary structures.",
      columns: ["id (UUID)", "name (TEXT)", "birth_date (TEXT)", "birth_time (TEXT)", "location (TEXT)", "lat/lng (DOUBLE)", "astrology_data (BLOB/JSON)"]
    },
    {
      sqlite: "compatibility_cache",
      indexedDb: "compatibility",
      description: "Retains calculated Ashtakoota Milan scores between pairs.",
      columns: ["partner_1_id", "partner_2_id", "guna_score (INT)", "compatibility_data (JSON)"]
    },
    {
      sqlite: "muhurta_locations",
      indexedDb: "locations",
      description: "Caches timezone coordinates and coordinates mapping for instant lookup.",
      columns: ["city_name", "latitude", "longitude", "timezone"]
    }
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl space-y-8" id="android-design-system-container">
      {/* Intro */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-500/10 pb-5">
        <div>
          <h3 className="text-xl font-sans font-medium text-amber-100 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-500" />
            Android Design System Spec
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Standard specifications, design guidelines, and schema migrations mapped from the original JHora Native Android client to HTML5/Vite.
          </p>
        </div>
        <div className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1">
          Material Design 3 (M3) Mapped
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Color Palettes */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-500" />
            Material 3 Theme Palette
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The color language uses highly saturated cosmic tones on top of dark obsidian surfaces to emphasize auspicious spiritual events.
          </p>
          
          <div className="space-y-3">
            {materialColors.map((color) => (
              <div 
                key={color.name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg shadow-inner border border-white/10 shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">{color.name}</span>
                    <span className="text-[11px] text-slate-400 leading-tight block mt-0.5 max-w-[220px]">{color.desc}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => copyToClipboard(color.hex, color.name)}
                  className="flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-slate-900/80 px-2 py-1 rounded border border-indigo-500/10 cursor-pointer"
                >
                  {copiedText === color.name ? (
                    <>
                      <Check className="w-3 h-3 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      {color.hex}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Components Showcase & Typography */}
        <div className="space-y-6">
          {/* Typography Scale */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-500" />
              Typography Scale (Vedic Pairings)
            </h4>
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Display Large (Spiritual Shlokas)</span>
                <span className="text-2xl font-sans font-semibold text-amber-100 tracking-tight">ॐ नमः शिवाय</span>
              </div>
              <div className="border-t border-slate-800/40 pt-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Headline Medium (Calculated Dashas)</span>
                <span className="text-lg font-sans font-medium text-white">Saturn Mahadasha Timeline</span>
              </div>
              <div className="border-t border-slate-800/40 pt-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Body Small (Astronomical Coordinates)</span>
                <span className="text-slate-300 leading-relaxed block">
                  Sidereal longitude calculated under Lahiri Ayanamsa offsets precisely offset by 24.116° from tropical ecliptic standard.
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Widgets */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              Interactive Material 3 Widgets
            </h4>
            
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-4 text-xs">
              {/* Chips */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-2 font-medium">Ayanamsa Filter Chips</label>
                <div className="flex gap-2">
                  {["lahiri", "raman", "kp_system"].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setChipVal(chip)}
                      className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold transition-all border ${
                        chipVal === chip
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-sm"
                          : "bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {chip.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider */}
              <div className="border-t border-slate-800/40 pt-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-slate-400 font-medium">Shadbala Strength Threshold</label>
                  <span className="font-mono text-[10px] text-amber-400 font-bold">{sliderVal}% Strength</span>
                </div>
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  <input
                    type="range"
                    min="20"
                    max="150"
                    value={sliderVal}
                    onChange={(e) => setSliderVal(Number(e.target.value))}
                    className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>

              {/* Switch */}
              <div className="border-t border-slate-800/40 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-200 block">Automatic remedies suggestion</span>
                  <span className="text-[10px] text-slate-400">Run Gemini server-side remediation routines</span>
                </div>
                <button
                  onClick={() => setToggleVal(!toggleVal)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                    toggleVal ? "bg-amber-500" : "bg-slate-800"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-slate-950 transition-transform ${
                      toggleVal ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DB schema migration block */}
      <div className="space-y-4 pt-4 border-t border-indigo-500/10">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-500" />
          <h4 className="text-sm font-semibold text-slate-200">
            Database Migration Model (SQLite → HTML5 IndexedDB)
          </h4>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          To enable offline operations requested in early phases, the applet maps traditional Android SQLite database tables directly into modern client-side IndexedDB stores.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sqliteTables.map((table) => (
            <div 
              key={table.sqlite} 
              className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 hover:border-slate-800 transition-all flex flex-col justify-between h-56 text-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-1 border-b border-slate-800/60 pb-2 mb-2">
                  <span className="font-mono text-[10px] text-rose-400" title="Android SQLite table name">
                    {table.sqlite}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="font-mono text-[10px] text-emerald-400" title="Web IndexedDB Object Store">
                    {table.indexedDb}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight mb-3">
                  {table.description}
                </p>
              </div>
              
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-900">
                <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Key Fields Mapped:</span>
                <div className="flex flex-wrap gap-1">
                  {table.columns.map((col) => (
                    <span 
                      key={col} 
                      className="text-[8px] font-mono bg-indigo-500/10 text-indigo-300 px-1 py-0.5 rounded border border-indigo-500/5"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Warning */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-200 block mb-0.5">Architectural Integrity Note</span>
          This JHora AI Professional applet executes 100% of astrological computations locally in browser runtime (under <code className="font-mono text-[10px] text-amber-300 bg-amber-500/5 px-1 py-0.5 rounded">src/lib/astrology.ts</code>) using deterministic Parashari trigonometry, while server-side requests are reserved solely for state-aware Gemini consults to keep credentials protected.
        </div>
      </div>
    </div>
  );
}
