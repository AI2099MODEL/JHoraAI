/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HelpCircle, Layers } from "lucide-react";

interface AstroChartProps {
  rasiChart: { [house: number]: string[] };
  navamsaChart: { [house: number]: string[] };
  divisionalCharts?: { [key: string]: { [house: number]: string[] } };
  vargaLagnas?: { [key: string]: number };
  lagnaSignIndex: number; // 0 to 11
  lagnaSignName: string;
  defaultDivision?: string;
  hideHeader?: boolean;
  hideVargaSelector?: boolean;
  chartStyle?: "north" | "south";
}

const VARGAS_LIST = [
  { id: "D1", label: "D1 Rasi (General)" },
  { id: "D2", label: "D2 Hora (Wealth)" },
  { id: "D3", label: "D3 Drekkana (Siblings)" },
  { id: "D4", label: "D4 Chaturthamsa (Home/Fortune)" },
  { id: "D5", label: "D5 Panchamsa (Fame/Power)" },
  { id: "D6", label: "D6 Shashthamsa (Obstacles/Health)" },
  { id: "D7", label: "D7 Saptamsa (Children/Lineage)" },
  { id: "D8", label: "D8 Ashtamsa (Longevity/Change)" },
  { id: "D9", label: "D9 Navamsa (Dharma/Spouse)" },
  { id: "D10", label: "D10 Dasamsa (Career/Profession)" },
  { id: "D11", label: "D11 Rudramsa (Gains/Victory)" },
  { id: "D12", label: "D12 Dwadasamsa (Parents/Ancestry)" },
  { id: "D16", label: "D16 Shodasamsa (Vehicles/Happiness)" },
  { id: "D20", label: "D20 Vimsamsa (Spirituality/Worship)" },
  { id: "D24", label: "D24 Chaturvimsamsa (Intellect/Learning)" },
  { id: "D27", label: "D27 Saptavimsamsa (Strengths/Weaknesses)" },
  { id: "D30", label: "D30 Trimsamsa (Evils/Anishta)" },
  { id: "D40", label: "D40 Khavedamsa (Auspicious Fruits)" },
  { id: "D45", label: "D45 Akshavedamsa (All Virtues)" },
  { id: "D60", label: "D60 Shastiamsa (Past Life Karma)" }
];

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const signAbbr = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];

export default function AstroChart({
  rasiChart,
  navamsaChart,
  divisionalCharts,
  vargaLagnas,
  lagnaSignIndex,
  lagnaSignName,
  defaultDivision = "D1",
  hideHeader = false,
  hideVargaSelector = false,
  chartStyle = "north",
}: AstroChartProps) {
  const [selectedDivision, setSelectedDivision] = useState<string>(defaultDivision);

  // Determine active chart
  const getActiveChart = () => {
    if (selectedDivision === "D1") return rasiChart;
    if (selectedDivision === "D9") return navamsaChart || divisionalCharts?.["D9"] || rasiChart;
    if (divisionalCharts && divisionalCharts[selectedDivision]) {
      return divisionalCharts[selectedDivision];
    }
    return rasiChart;
  };

  const activeChart = getActiveChart();

  // Get active Lagna Sign Index for the selected Varga
  const getActiveLagnaSignIndex = () => {
    if (selectedDivision === "D1") return lagnaSignIndex;
    if (vargaLagnas && vargaLagnas[selectedDivision] !== undefined) {
      return vargaLagnas[selectedDivision];
    }
    return lagnaSignIndex;
  };

  const activeLagnaSignIndex = getActiveLagnaSignIndex();
  const activeLagnaSignName = ZODIAC_SIGNS[activeLagnaSignIndex] || lagnaSignName;

  // Mapping houses to sign numbers for the North Indian chart
  // In North Indian style, House 1 holds the Lagna sign.
  // The signs rotate counterclockwise: House H holds sign = (activeLagnaSignIndex + H - 1) % 12 + 1
  const getSignForHouse = (house: number) => {
    return ((activeLagnaSignIndex + house - 1) % 12) + 1;
  };

  // Planet Abbreviations for compact display
  const getPlanetAbbr = (name: string) => {
    const abbrs: { [key: string]: string } = {
      Sun: "Sy",
      Moon: "Ch",
      Mars: "Ma",
      Mercury: "Bu",
      Jupiter: "Gu",
      Venus: "Sk",
      Saturn: "Sa",
      Rahu: "Ra",
      Ketu: "Ke",
    };
    return abbrs[name] || name.slice(0, 2);
  };

  const getPlanetFullSymbol = (name: string) => {
    const symbols: { [key: string]: string } = {
      Sun: "☉ Sun",
      Moon: "☽ Moon",
      Mars: "♂ Mars",
      Mercury: "☿ Mercury",
      Jupiter: "♃ Jupiter",
      Venus: "♀ Venus",
      Saturn: "♄ Saturn",
      Rahu: "☊ Rahu",
      Ketu: "☋ Ketu",
    };
    return symbols[name] || name;
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl" id="astro-charts-container">
      {(!hideHeader || !hideVargaSelector) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {!hideHeader ? (
            <div>
              <h3 className="text-xl font-sans font-medium text-amber-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                Interactive Astrological Charts
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Displaying planetary placements in rasi and Shodashavarga divisional views (D1 to D60).
              </p>
            </div>
          ) : (
            <div />
          )}
          
          {/* Toggle Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Varga Selector Dropdown */}
            {!hideVargaSelector && (
              <div className="bg-slate-950/80 p-1.5 rounded-lg border border-indigo-500/15 flex items-center gap-2">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider pl-1.5">Varga:</span>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="bg-slate-900 text-amber-300 text-xs font-semibold rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer border border-indigo-500/10"
                  id="varga-select-dropdown"
                >
                  {VARGAS_LIST.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Render Chart */}
        <div className="lg:col-span-7 flex justify-center w-full">
          {chartStyle === "north" ? (
            /* NORTH INDIAN DIAMOND CHART */
            <div className="relative w-full max-w-[420px] aspect-square bg-slate-950/40 rounded-xl border border-indigo-500/30 p-2 shadow-inner">
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full text-indigo-500/40 font-mono"
                id="svg-north-indian-chart"
              >
                {/* Border Square */}
                <rect x="10" y="10" width="380" height="380" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500/50" />
                
                {/* Diagonal Lines */}
                <line x1="10" y1="10" x2="390" y2="390" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500/35" />
                <line x1="390" y1="10" x2="10" y2="390" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500/35" />
                
                {/* Inner Diamond */}
                <polygon points="200,10 390,200 200,390 10,200" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500/50" />

                {/* Houses Labels & Planets positioning */}
                {/* House 1: Top Center Diamond */}
                <text x="200" y="105" textAnchor="middle" className="fill-amber-500 font-semibold text-[11px]">{getSignForHouse(1)}</text>
                <text x="200" y="65" textAnchor="middle" className="fill-indigo-300 font-medium text-[10px] uppercase font-sans">Lagna</text>
                <text x="200" y="130" textAnchor="middle" className="fill-white font-semibold text-[13px] tracking-wide">
                  {(activeChart[1] || []).map(getPlanetAbbr).join(" ")}
                </text>

                {/* House 2: Top Left Triangle */}
                <text x="145" y="65" textAnchor="middle" className="fill-amber-500/80 text-[10px]">{getSignForHouse(2)}</text>
                <text x="110" y="85" textAnchor="middle" className="fill-white/90 text-[12px]">
                  {(activeChart[2] || []).map(getPlanetAbbr).join(" ")}
                </text>

                {/* House 3: Far Left Top Triangle */}
                <text x="65" y="145" textAnchor="middle" className="fill-amber-500/80 text-[10px]">{getSignForHouse(3)}</text>
                <text x="60" y="100" textAnchor="middle" className="fill-white/90 text-[12px]">
                  {(activeChart[3] || []).map(getPlanetAbbr).join(" ")}
                </text>

                {/* House 4: Left Center Diamond */}
                <text x="105" y="200" textAnchor="middle" className="fill-amber-500 font-semibold text-[11px]">{getSignForHouse(4)}</text>
                <text x="65" y="220" textAnchor="middle" className="fill-white font-semibold text-[13px] tracking-wide">
                  {(activeChart[4] || []).map(getPlanetAbbr).join(" ")}
                </text>

                {/* House 5: Far Left Bottom Triangle */}
                <text x="65" y="260" textAnchor="middle" className="fill-amber-500/80 text-[10px]">{getSignForHouse(5)}</text>
                <text x="60" y="305" textAnchor="middle" className="fill-white/90 text-[12px]">
                  {(activeChart[5] || []).map(getPlanetAbbr).join(" ")}
                </text>

                {/* House 6: Bottom Left Triangle */}
                <text x="145" y="340" textAnchor="middle" className="fill-amber-500/80 text-[10px]">{getSignForHouse(6)}</text>
                <text x="110" y="325" textAnchor="middle" className="fill-white/90 text-[12px]">
                  {(activeChart[6] || []).map(getPlanetAbbr).join(" ")}
                </text>

                {/* House 7: Bottom Center Diamond */}
                <text x="200" y="305" textAnchor="middle" className="fill-amber-500 font-semibold text-[11px]">{getSignForHouse(7)}</text>
                <text x="200" y="280" textAnchor="middle" className="fill-white font-semibold text-[13px] tracking-wide">
                  {(activeChart[7] || []).map(getPlanetAbbr).join(" ")}
                </text>

                {/* House 8: Bottom Right Triangle */}
                <text x="255" y="340" textAnchor="middle" className="fill-amber-500/80 text-[10px]">{getSignForHouse(8)}</text>
                <text x="290" y="325" textAnchor="middle" className="fill-white/90 text-[12px]">
                  {(activeChart[8] || []).map(getPlanetAbbr).join(" ")}
                </text>

                {/* House 9: Far Right Bottom Triangle */}
                <text x="340" y="260" textAnchor="middle" className="fill-amber-500/80 text-[10px]">{getSignForHouse(9)}</text>
                <text x="340" y="305" textAnchor="middle" className="fill-white/90 text-[12px]">
                  {(activeChart[9] || []).map(getPlanetAbbr).join(" ")}
                </text>

                {/* House 10: Right Center Diamond */}
                <text x="295" y="200" textAnchor="middle" className="fill-amber-500 font-semibold text-[11px]">{getSignForHouse(10)}</text>
                <text x="335" y="220" textAnchor="middle" className="fill-white font-semibold text-[13px] tracking-wide">
                  {(activeChart[10] || []).map(getPlanetAbbr).join(" ")}
                </text>

                {/* House 11: Far Right Top Triangle */}
                <text x="340" y="145" textAnchor="middle" className="fill-amber-500/80 text-[10px]">{getSignForHouse(11)}</text>
                <text x="340" y="100" textAnchor="middle" className="fill-white/90 text-[12px]">
                  {(activeChart[11] || []).map(getPlanetAbbr).join(" ")}
                </text>

                {/* House 12: Top Right Triangle */}
                <text x="255" y="65" textAnchor="middle" className="fill-amber-500/80 text-[10px]">{getSignForHouse(12)}</text>
                <text x="290" y="85" textAnchor="middle" className="fill-white/90 text-[12px]">
                  {(activeChart[12] || []).map(getPlanetAbbr).join(" ")}
                </text>
              </svg>
            </div>
          ) : (
            /* SOUTH INDIAN GRID CHART */
            <div className="relative w-full max-w-[420px] aspect-square bg-slate-950/40 rounded-xl border border-indigo-500/30 p-4 shadow-inner grid grid-cols-4 grid-rows-4 gap-1">
              {[
                { name: "Pisces", index: 11, label: "Pi" },
                { name: "Aries", index: 0, label: "Ar" },
                { name: "Taurus", index: 1, label: "Ta" },
                { name: "Gemini", index: 2, label: "Ge" },
                { name: "Aquarius", index: 10, label: "Aq" },
                { name: "EMPTY_1", index: -1, label: "" },
                { name: "EMPTY_2", index: -1, label: "" },
                { name: "Cancer", index: 3, label: "Cn" },
                { name: "Capricorn", index: 9, label: "Cp" },
                { name: "EMPTY_3", index: -1, label: "" },
                { name: "EMPTY_4", index: -1, label: "" },
                { name: "Leo", index: 4, label: "Le" },
                { name: "Sagittarius", index: 8, label: "Sg" },
                { name: "Scorpio", index: 7, label: "Sc" },
                { name: "Libra", index: 6, label: "Li" },
                { name: "Virgo", index: 5, label: "Vi" }
              ].map((cell, idx) => {
                if (cell.index === -1) {
                  // Render empty center boxes with the division label
                  if (idx === 5) {
                    return (
                      <div key={idx} className="col-span-2 row-span-2 flex flex-col items-center justify-center border border-indigo-500/10 bg-slate-950/60 rounded-lg">
                        <span className="text-2xl font-mono font-black text-amber-500">{selectedDivision}</span>
                        <span className="text-[10px] text-slate-400 font-sans tracking-wider uppercase mt-1">
                          {selectedDivision === "D1" ? "Rasi" : "Divisional"}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }

                // Determine house index relative to active Lagna Sign
                // House = (cell.index - activeLagnaSignIndex + 12) % 12 + 1
                const houseNum = ((cell.index - activeLagnaSignIndex + 12) % 12) + 1;
                const planetsInSign = activeChart[houseNum] || [];
                const isLagnaSign = cell.index === activeLagnaSignIndex;

                return (
                  <div
                    key={idx}
                    className={`border border-indigo-500/20 bg-slate-900/40 p-1.5 rounded-md flex flex-col justify-between aspect-square hover:bg-slate-900/70 transition-colors ${
                      isLagnaSign ? "ring-1 ring-amber-500/40 bg-indigo-950/20" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold text-indigo-400">
                        {cell.label}
                      </span>
                      {isLagnaSign && (
                        <span className="text-[9px] font-sans px-1 bg-amber-500 text-slate-950 rounded font-semibold scale-90">
                          Asc
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 items-center justify-center min-h-[22px]">
                      {planetsInSign.map((p, pIdx) => (
                        <span
                          key={pIdx}
                          className="text-[11px] font-mono font-semibold text-slate-100 bg-slate-800/80 px-1 py-0.5 rounded border border-slate-700/50"
                        >
                          {getPlanetAbbr(p)}
                        </span>
                      ))}
                    </div>

                    <div className="text-[8px] font-mono text-slate-500 text-right">
                      H{houseNum}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend Panel */}
        <div className="lg:col-span-5 self-start">
          <div className="bg-slate-950/60 rounded-xl border border-indigo-500/10 p-5">
            <h4 className="text-xs font-sans uppercase tracking-wider text-slate-400 font-medium mb-3 flex items-center justify-between">
              <span>Zodiac & Symbols</span>
              <span className="font-mono text-[10px] text-amber-500">
                Asc: {activeLagnaSignName} ({activeLagnaSignIndex + 1})
              </span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-1.5 text-xs">
              {[
                "Sun", "Moon", "Mars", "Mercury", 
                "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"
              ].map((name) => {
                // Find where the planet is placed in the active chart
                let planetHouse = -1;
                for (let h = 1; h <= 12; h++) {
                  if (activeChart[h]?.includes(name)) {
                    planetHouse = h;
                    break;
                  }
                }
                const signNo = getSignForHouse(planetHouse);

                return (
                  <div key={name} className="flex justify-between items-center py-1 border-b border-indigo-500/5">
                    <span className="text-slate-300 font-sans">{getPlanetFullSymbol(name)}</span>
                    <span className="font-mono font-semibold text-amber-500/90 bg-amber-500/5 px-1.5 py-0.5 rounded whitespace-nowrap">
                      H{planetHouse} ({signAbbr[signNo - 1]})
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-indigo-500/10 flex items-start gap-2 text-[10px] text-slate-400">
              <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p>
                <b>North Indian:</b> Fixed house positions (H1 at top). Sign numbers rotate.
                <br />
                <b>South Indian:</b> Fixed zodiac sign squares. Houses rotate relative to Asc (Lagna).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
