/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Calendar, ChevronDown, ChevronUp, Clock, Star } from "lucide-react";
import { DashaPeriod } from "../lib/astrology";

interface DashaTreeProps {
  dashas: DashaPeriod[];
}

export default function DashaTree({ dashas }: DashaTreeProps) {
  const [expandedLord, setExpandedLord] = useState<string | null>(null);

  // Helper to determine if a period is currently active
  const isPeriodActive = (startStr: string, endStr: string) => {
    const now = new Date();
    const start = new Date(startStr);
    const end = new Date(endStr);
    return now >= start && now <= end;
  };

  // Helper to format dates nicely
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  // Find current active Mahadasha & Antardasha
  let currentMaha: DashaPeriod | null = null;
  let currentAntar: DashaPeriod | null = null;

  for (const d of dashas) {
    if (isPeriodActive(d.startDate, d.endDate)) {
      currentMaha = d;
      if (d.subPeriods) {
        for (const sub of d.subPeriods) {
          if (isPeriodActive(sub.startDate, sub.endDate)) {
            currentAntar = sub;
            break;
          }
        }
      }
      break;
    }
  }

  const toggleExpand = (lord: string) => {
    setExpandedLord(expandedLord === lord ? null : lord);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl" id="dasha-tree-container">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-sans font-medium text-amber-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          Vimshottari Dasha Timeline
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Vedic 120-year planetary cycle reflecting major life themes and spiritual shifts.
        </p>
      </div>

      {/* Active Dasha Highlight Banner */}
      {currentMaha && (
        <div className="bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/25 rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 p-2.5 rounded-lg">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400/20 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-amber-400 font-bold block">
                Current Cosmic Alignment
              </span>
              <h4 className="text-base font-semibold text-white mt-0.5">
                {currentMaha.lord} <span className="text-indigo-300">Mahadasha</span>
                {currentAntar && (
                  <>
                    {" "}
                    — <span className="text-amber-400">{currentAntar.lord}</span>{" "}
                    <span className="text-indigo-300">Antardasha</span>
                  </>
                )}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">
              Period Active Since Birth
            </span>
            <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-950/65 px-2.5 py-1 rounded-md border border-slate-800/80 inline-block mt-1">
              {formatDate(currentMaha.startDate)} - {formatDate(currentMaha.endDate)}
            </span>
          </div>
        </div>
      )}

      {/* Accordion List */}
      <div className="space-y-3">
        {dashas.map((d) => {
          const isCurrentM = isPeriodActive(d.startDate, d.endDate);
          const isExpanded = expandedLord === d.lord;

          return (
            <div
              key={d.lord}
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                isCurrentM
                  ? "border-amber-500/30 bg-slate-900/80 shadow-md ring-1 ring-amber-500/10"
                  : "border-indigo-500/10 bg-slate-950/30 hover:bg-slate-950/50"
              }`}
            >
              {/* Accordion Trigger Header */}
              <button
                onClick={() => toggleExpand(d.lord)}
                className="w-full flex items-center justify-between p-4 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                      isCurrentM
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {d.lord}
                  </span>
                  <div className="text-left">
                    <span className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                      {d.lord} Dasha Cycle
                      {isCurrentM && (
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono mt-0.5">
                      {formatDate(d.startDate)} to {formatDate(d.endDate)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-indigo-300 font-mono hidden sm:inline-block">
                    {d.subPeriods ? `${d.subPeriods.length} Sub-periods` : ""}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Accordion Content (Antardashas) */}
              {isExpanded && d.subPeriods && (
                <div className="border-t border-indigo-500/10 bg-slate-950/70 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {d.subPeriods.map((sub) => {
                      const isCurrentA = isPeriodActive(sub.startDate, sub.endDate);

                      return (
                        <div
                          key={sub.lord}
                          className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                            isCurrentA
                              ? "bg-amber-500/5 border-amber-500/35 ring-1 ring-amber-500/10 shadow"
                              : "bg-slate-900/30 border-slate-800/80 hover:bg-slate-900/50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-200">
                              {d.lord} - {sub.lord}
                            </span>
                            {isCurrentA && (
                              <span className="text-[8px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
