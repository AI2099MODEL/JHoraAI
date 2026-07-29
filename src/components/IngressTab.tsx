/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Activity, Calendar, ArrowRight, Layers, HelpCircle, ChevronRight } from "lucide-react";
import { apiFetch as fetch } from "../lib/api";

interface IngressTabProps {
  birthDate?: string;
}

interface IngressEvent {
  planet: string;
  previous_sign: string;
  new_sign: string;
  ingress_date: string;
  degree: number;
}

export default function IngressTab({ birthDate }: IngressTabProps) {
  const [fromDate, setFromDate] = useState<string>(() => {
    const localStr = new Date().toLocaleDateString("en-CA");
    return localStr || "2026-07-17";
  });
  const [toDate, setToDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const localStr = d.toLocaleDateString("en-CA");
    return localStr || "2027-07-17";
  });
  const [selectedPlanets, setSelectedPlanets] = useState<string[]>(["Saturn", "Jupiter", "Rahu", "Ketu"]);
  const [events, setEvents] = useState<IngressEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIngress = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/jhora/planet-ingress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_date: fromDate,
          to_date: toDate,
          planets: selectedPlanets,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate planetary ingress");
      }

      const data = await response.json();
      if (data.events) {
        setEvents(data.events);
      } else {
        throw new Error("No ingress events found");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while fetching ingress events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngress();
  }, [fromDate, toDate, selectedPlanets]);

  const planetList = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

  const handlePlanetToggle = (p: string) => {
    if (selectedPlanets.includes(p)) {
      if (selectedPlanets.length > 1) {
        setSelectedPlanets(selectedPlanets.filter((item) => item !== p));
      }
    } else {
      setSelectedPlanets([...selectedPlanets, p]);
    }
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
    <div className="space-y-6" id="ingress-tab-container">
      {/* Overview Card */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-sans font-medium text-amber-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              Planetary Ingress (Zodiac Transitions)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Track the exact moments when planets transit across sign boundaries, shifting global astrological influences.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 p-1.5 rounded-lg border border-indigo-500/15">
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider pl-1.5">Range:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-amber-300 text-xs font-semibold focus:outline-none cursor-pointer border-0 w-28 px-1"
            />
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-amber-300 text-xs font-semibold focus:outline-none cursor-pointer border-0 w-28 px-1"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Planet Selection Panel */}
        <div className="lg:col-span-4 bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5 space-y-4">
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold block border-b border-slate-800 pb-2">
            Target Planets
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Select the planets you wish to compute sign transitions (ingress) for. Tracking slow planets (Jupiter, Saturn, Rahu, Ketu) reveals generational shifts.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {planetList.map((p) => {
              const isSelected = selectedPlanets.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => handlePlanetToggle(p)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/40"
                      : "bg-transparent text-slate-400 border-slate-800/40 hover:text-slate-200"
                  }`}
                >
                  <span>{getPlanetFullSymbol(p)}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-amber-400" : "bg-transparent"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline Event Listing */}
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="bg-slate-900/20 border border-indigo-500/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mb-3" />
              <span className="text-xs text-slate-400 font-mono">Running sign boundary calculations...</span>
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-center text-xs text-rose-400">
              {error}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-slate-900/20 border border-indigo-500/5 rounded-2xl p-12 text-center text-xs text-slate-500">
              No ingress events found for the selected planet list and date range.
            </div>
          ) : (
            <div className="bg-slate-950/60 rounded-2xl border border-indigo-500/10 p-5 space-y-4">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold block">
                Zodiac Entry Boundary Log
              </span>

              <div className="relative border-l border-indigo-500/20 pl-6 ml-3 space-y-5">
                {events.map((ev, index) => {
                  return (
                    <div key={index} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-slate-950 group-hover:scale-125 transition-transform" />

                      <div className="bg-slate-900/60 p-4 rounded-xl border border-indigo-500/5 hover:border-amber-500/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">
                            {getPlanetFullSymbol(ev.planet)} Ingress
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1.5 mt-1 font-mono">
                            <span className="text-indigo-400 font-semibold">{ev.previous_sign}</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span className="text-amber-400 font-semibold">{ev.new_sign}</span>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-amber-300 block font-mono bg-amber-500/5 border border-amber-500/10 rounded px-2.5 py-1">
                            {new Date(ev.ingress_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-500/10 flex items-start gap-2 text-[10px] text-slate-400">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  An ingress represents the moment a planet leaves one 30-degree zodiac sign and enters the next. Transitions for slow outer planets like Saturn and Jupiter signify critical cyclical shift turning-points in mundane astrology.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple embedded spin icon fallback helper for TSX linter
function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
