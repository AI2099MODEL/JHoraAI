/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Heart, ShieldCheck, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { CompatibilityResult, AstrologyData } from "../lib/astrology";

interface CompatibilityTabProps {
  astrologyData?: AstrologyData | null;
}

export default function CompatibilityTab({ astrologyData }: CompatibilityTabProps) {
  const [person1, setPerson1] = useState({ name: "Partner A", signIndex: 0, longitude: 10 });
  const [person2, setPerson2] = useState({ name: "Partner B", signIndex: 6, longitude: 190 });
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Synchronize Person 1 from astrologyData if present
  useEffect(() => {
    if (astrologyData) {
      const moon = astrologyData.planets.find(p => p.name === "Moon");
      if (moon) {
        setPerson1({
          name: astrologyData.birthDetails.name || "Partner A",
          signIndex: moon.signIndex,
          longitude: Number(moon.longitude.toFixed(2))
        });
      }
    }
  }, [astrologyData]);

  // Zodiac Signs
  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  // List of Nakshatras for manual custom matching
  const nakshatrasList = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/astrology/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          p1SignIndex: person1.signIndex,
          p1MoonLongitude: person1.longitude,
          p2SignIndex: person2.signIndex,
          p2MoonLongitude: person2.longitude,
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Compatibility calculation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score < 18) return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    if (score < 26) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-green-500 bg-green-500/10 border-green-500/20";
  };

  return (
    <div className="space-y-8" id="compatibility-calculator">
      {/* Introduction Card */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl">
        <h3 className="text-xl font-sans font-medium text-amber-100 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500/15" />
          Ashtakoota Milan (36-Point Compatibility Matching)
        </h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          The traditional Vedic matchmaking framework that analyzes 8 key dimensions (Kootas) of compatibility, based on the natal Moon placement of both individuals. This computes mental harmony, sexual compatibility, health, temperament, and genetic affinity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Column */}
        <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl h-fit">
          <h4 className="text-sm font-semibold text-slate-200 border-b border-indigo-500/10 pb-3 mb-4">
            Partner Astrological Positions
          </h4>

          {/* Partner 1 Input */}
          <div className="space-y-4 mb-6">
            <h5 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Partner A (e.g. Groom/First Partner)
            </h5>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Name</label>
              <input
                type="text"
                value={person1.name}
                onChange={(e) => setPerson1({ ...person1, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Moon Sign</label>
                <select
                  value={person1.signIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setPerson1({ ...person1, signIndex: idx, longitude: idx * 30 + 15 });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {zodiacSigns.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Nakshatra Group</label>
                <select
                  value={Math.floor(person1.longitude / (360 / 27))}
                  onChange={(e) => {
                    const nakIdx = Number(e.target.value);
                    setPerson1({ ...person1, longitude: nakIdx * 13.3333 + 6.66 });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {nakshatrasList.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Partner 2 Input */}
          <div className="space-y-4 mb-6">
            <h5 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider border-t border-indigo-500/10 pt-4">
              Partner B (e.g. Bride/Second Partner)
            </h5>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Name</label>
              <input
                type="text"
                value={person2.name}
                onChange={(e) => setPerson2({ ...person2, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Moon Sign</label>
                <select
                  value={person2.signIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setPerson2({ ...person2, signIndex: idx, longitude: idx * 30 + 15 });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {zodiacSigns.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Nakshatra Group</label>
                <select
                  value={Math.floor(person2.longitude / (360 / 27))}
                  onChange={(e) => {
                    const nakIdx = Number(e.target.value);
                    setPerson2({ ...person2, longitude: nakIdx * 13.3333 + 6.66 });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {nakshatrasList.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-slate-950 font-sans font-semibold rounded-xl py-3 text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            id="btn-calculate-compatibility"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                Matching Celestial Frequencies...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950/20" />
                Calculate Compatibility Score
              </>
            )}
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Verdict Card */}
              <div className="bg-slate-950/40 border border-indigo-500/25 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-amber-400 block">
                    Synthesized Compatibility Result
                  </span>
                  <h4 className="text-xl font-semibold text-slate-100">
                    {person1.name} & {person2.name} Match
                  </h4>
                  <p className="text-sm text-slate-300 font-medium font-sans">
                    {result.verdict}
                  </p>
                </div>
                
                {/* Visual Score Circle */}
                <div className={`p-4 rounded-2xl border text-center shrink-0 min-w-[130px] shadow-lg ${scoreColor(result.totalScore)}`}>
                  <span className="text-4xl font-mono font-extrabold">{result.totalScore}</span>
                  <span className="text-slate-400 font-mono text-sm"> / 36</span>
                  <span className="text-[10px] block font-semibold tracking-wider uppercase mt-1">Gunas Matched</span>
                </div>
              </div>

              {/* Grid of 8 Kootas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "varna", title: "Varna (1 Point) — Occupation & Duty" },
                  { key: "vashya", title: "Vashya (2 Points) — Mutual Influence" },
                  { key: "tara", title: "Tara (3 Points) — Destiny & Rhythm" },
                  { key: "yoni", title: "Yoni (4 Points) — Physical Harmony" },
                  { key: "grahaMaitri", title: "Graha Maitri (5 Points) — Intellectual Bond" },
                  { key: "gana", title: "Gana (6 Points) — Temperament Harmony" },
                  { key: "bhakoot", title: "Bhakoot (7 Points) — Emotional Sync" },
                  { key: "nadi", title: "Nadi (8 Points) — Genetic Mismatch Check" }
                ].map((item) => {
                  const dataObj = (result as any)[item.key];
                  if (!dataObj) return null;

                  return (
                    <div
                      key={item.key}
                      className="bg-slate-900/40 border border-indigo-500/10 p-4 rounded-xl flex flex-col justify-between hover:border-indigo-500/20 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-center border-b border-indigo-500/5 pb-2 mb-2">
                          <h5 className="text-xs font-semibold text-amber-200 font-sans uppercase tracking-wider">
                            {item.title}
                          </h5>
                          <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                            dataObj.scored === dataObj.max
                              ? "bg-green-500/15 text-green-400"
                              : dataObj.scored > 0
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-rose-500/15 text-rose-400"
                          }`}>
                            {dataObj.scored} / {dataObj.max}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {dataObj.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Warning/Remedy Note */}
              {result.totalScore < 18 && (
                <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                      Astrological Notice (Nadi or Bhakoot Dosha)
                    </h5>
                    <p className="text-[11px] text-rose-200/95 mt-1 leading-relaxed">
                      While the total gunas are below the standard threshold (18), traditional Vedic Astrology emphasizes that low scores can be resolved through specific planetary remedies, mutual understanding, or if the ascendant lords are friends. Consultation with our JHora AI Chat is recommended.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-slate-900/30 border border-indigo-500/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
              <div className="bg-indigo-500/10 p-4 rounded-full mb-4">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300">
                Awaiting Celestial Variables
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                Configure partner details on the left and tap the calculation button to trigger the cosmic matching algorithms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
