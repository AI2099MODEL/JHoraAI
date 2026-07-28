/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Calendar, ChevronDown, ChevronUp, Clock, Star } from "lucide-react";
import { DashaPeriod } from "../lib/astrology";

interface DashaTreeProps {
  dashas: DashaPeriod[];
  isDark?: boolean;
}

export default function DashaTree({ dashas, isDark = true }: DashaTreeProps) {
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

  // Theme-aware styles
  const containerClass = isDark 
    ? "bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl" 
    : "bg-white rounded-2xl border border-slate-200 p-6 shadow-xs";
  const titleClass = isDark 
    ? "text-xl font-sans font-medium text-amber-100 flex items-center gap-2" 
    : "text-xl font-sans font-extrabold text-indigo-950 flex items-center gap-2";
  const subtitleClass = isDark ? "text-xs text-slate-400 mt-1" : "text-xs text-slate-600 mt-1";
  
  const bannerClass = isDark 
    ? "bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/25 rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" 
    : "bg-gradient-to-r from-amber-500/5 to-indigo-500/5 border border-amber-500/20 rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4";
  const bannerTitleClass = isDark ? "text-[10px] uppercase tracking-wider font-mono text-amber-400 font-bold block" : "text-[10px] uppercase tracking-wider font-mono text-amber-800 font-bold block";
  const bannerTextClass = isDark ? "text-base font-semibold text-white mt-0.5" : "text-base font-bold text-slate-900 mt-0.5";
  const bannerSubtextClass = isDark ? "text-indigo-300" : "text-indigo-700";
  const bannerDateLabelClass = isDark ? "text-[10px] font-mono text-slate-400 block uppercase" : "text-[10px] font-mono text-slate-500 block uppercase";
  const bannerDateBadgeClass = isDark ? "text-xs font-mono font-semibold text-slate-300 bg-slate-950/65 px-2.5 py-1 rounded-md border border-slate-800/80 inline-block mt-1" : "text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block mt-1";

  const headerTextClass = isDark ? "text-sm font-semibold text-slate-100 flex items-center gap-1.5" : "text-sm font-bold text-slate-900 flex items-center gap-1.5";
  const headerDateTextClass = isDark ? "text-[11px] text-slate-400 block font-mono mt-0.5" : "text-[11px] text-slate-600 block font-mono mt-0.5";
  const headerCountTextClass = isDark ? "text-[11px] text-indigo-300 font-mono hidden sm:inline-block" : "text-[11px] text-indigo-700 font-mono font-bold hidden sm:inline-block";

  const contentWrapperClass = isDark ? "border-t border-indigo-500/10 bg-slate-950/70 p-4" : "border-t border-slate-100 bg-slate-50 p-4";

  return (
    <div className={containerClass} id="dasha-tree-container">
      {/* Header */}
      <div className="mb-6">
        <h3 className={titleClass}>
          <Calendar className="w-5 h-5 text-amber-500" />
          Vimshottari Dasha Timeline
        </h3>
        <p className={subtitleClass}>
          Vedic 120-year planetary cycle reflecting major life themes and spiritual shifts.
        </p>
      </div>

      {/* Active Dasha Highlight Banner */}
      {currentMaha && (
        <div className={bannerClass}>
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 p-2.5 rounded-lg">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500/20 animate-pulse" />
            </div>
            <div>
              <span className={bannerTitleClass}>
                Current Cosmic Alignment
              </span>
              <h4 className={bannerTextClass}>
                {currentMaha.lord} <span className={bannerSubtextClass}>Mahadasha</span>
                {currentAntar && (
                  <>
                    {" "}
                    — <span className="text-amber-600">{currentAntar.lord}</span>{" "}
                    <span className={bannerSubtextClass}>Antardasha</span>
                  </>
                )}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <span className={bannerDateLabelClass}>
              Period Active Since Birth
            </span>
            <span className={bannerDateBadgeClass}>
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

          const itemClass = isCurrentM
            ? (isDark 
                ? "border-amber-500/30 bg-slate-900/80 shadow-md ring-1 ring-amber-500/10"
                : "border-amber-500/40 bg-amber-50/10 shadow-xs ring-1 ring-amber-500/5")
            : (isDark
                ? "border-indigo-500/10 bg-slate-950/30 hover:bg-slate-950/50"
                : "border-slate-200 bg-white hover:bg-slate-50/80");

          return (
            <div
              key={d.lord}
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${itemClass}`}
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
                        : (isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700 border border-slate-200")
                    }`}
                  >
                    {d.lord}
                  </span>
                  <div className="text-left">
                    <span className={headerTextClass}>
                      {d.lord} Dasha Cycle
                      {isCurrentM && (
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                      )}
                    </span>
                    <span className={headerDateTextClass}>
                      {formatDate(d.startDate)} to {formatDate(d.endDate)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={headerCountTextClass}>
                    {d.subPeriods ? `${d.subPeriods.length} Sub-periods` : ""}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {/* Accordion Content (Antardashas) */}
              {isExpanded && d.subPeriods && (
                <div className={contentWrapperClass}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {d.subPeriods.map((sub) => {
                      const isCurrentA = isPeriodActive(sub.startDate, sub.endDate);

                      const subCardClass = isCurrentA
                        ? (isDark 
                            ? "bg-amber-500/5 border-amber-500/35 ring-1 ring-amber-500/10 shadow"
                            : "bg-amber-500/10 border-amber-500/30 shadow-xs")
                        : (isDark
                            ? "bg-slate-900/30 border-slate-800/80 hover:bg-slate-900/50"
                            : "bg-white border-slate-200 hover:bg-slate-50/50");

                      const subTitleColorClass = isDark ? "text-slate-200" : "text-slate-900";
                      const clockTextClass = isDark ? "text-slate-400" : "text-slate-600";
                      const dividerBorderClass = isDark ? "border-slate-800/80" : "border-slate-200";

                      const pratyantarTextInactiveClass = isDark 
                        ? "text-slate-400 hover:text-slate-300 bg-slate-950/20" 
                        : "text-slate-600 hover:text-slate-800 bg-slate-200/40";
                      const pratyantarTextActiveClass = isDark 
                        ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/20" 
                        : "bg-amber-500/20 text-amber-900 font-bold border border-amber-500/30 shadow-2xs";

                      return (
                        <div
                          key={sub.lord}
                          className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${subCardClass}`}
                        >
                          <div>
                            <div className="flex justify-between items-center">
                              <span className={`text-xs font-bold ${subTitleColorClass}`}>
                                {d.lord} - {sub.lord}
                              </span>
                              {isCurrentA && (
                                <span className="text-[8px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-600 bg-green-50">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            
                            <div className={`mt-2 text-[10px] font-mono ${clockTextClass} flex items-center gap-1`}>
                              <Clock className="w-3 h-3 text-slate-400" />
                              {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                            </div>
                          </div>

                          {/* Nested Pratyantardashas (Sub-sub-periods) */}
                          {sub.subPeriods && sub.subPeriods.length > 0 && (
                            <div className={`mt-3 pt-3 border-t ${dividerBorderClass} space-y-1.5`}>
                              <span className={isDark ? "text-[9px] font-mono uppercase tracking-wider text-amber-500/80 font-bold block" : "text-[9px] font-mono uppercase tracking-wider text-amber-800 font-bold block"}>
                                Pratyantardashas (Sub-sub periods)
                              </span>
                              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                                {sub.subPeriods.map((pratyantar) => {
                                  const isCurrentP = isPeriodActive(pratyantar.startDate, pratyantar.endDate);
                                  return (
                                    <div
                                      key={pratyantar.lord}
                                      className={`flex justify-between items-center text-[10px] p-1.5 rounded font-mono transition-all ${
                                        isCurrentP ? pratyantarTextActiveClass : pratyantarTextInactiveClass
                                      }`}
                                    >
                                      <span className="flex items-center gap-1">
                                        {isCurrentP && <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />}
                                        {sub.lord} - {pratyantar.lord}
                                      </span>
                                      <span className="text-[9px] text-slate-500 font-medium">
                                        {new Date(pratyantar.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} - {new Date(pratyantar.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                      </span>
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
