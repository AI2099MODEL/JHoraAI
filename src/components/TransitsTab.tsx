/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { RefreshCw, Calendar, Info, Layers, ArrowRight, Sparkles, MapPin, Clock } from "lucide-react";
import { AstrologyData } from "../lib/astrology";
import { apiFetch as fetch } from "../lib/api";

interface TransitsTabProps {
  astrologyData: AstrologyData;
  transitDate?: string;
  setTransitDate?: (d: string) => void;
  transitTime?: string;
  transitPlace?: string;
  transitLatitude?: number;
  transitLongitude?: number;
  transitTimezone?: number;
}

interface TransitPlanet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  longitude: number;
}

export default function TransitsTab({ 
  astrologyData,
  transitDate: propTransitDate,
  setTransitDate: propSetTransitDate,
  transitTime: propTransitTime,
  transitPlace,
  transitLatitude,
  transitLongitude,
  transitTimezone
}: TransitsTabProps) {
  // Helper to get local date (YYYY-MM-DD)
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to get local time (HH:MM:SS)
  const getLocalTimeString = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const [transitDate, setTransitDate] = useState<string>(propTransitDate || getLocalDateString());
  const [transitTime, setTransitTime] = useState<string>(propTransitTime || getLocalTimeString());
  const [lat, setLat] = useState<number>(transitLatitude !== undefined && transitLatitude !== null ? transitLatitude : astrologyData.birthDetails.latitude);
  const [lng, setLng] = useState<number>(transitLongitude !== undefined && transitLongitude !== null ? transitLongitude : astrologyData.birthDetails.longitude);
  const [tz, setTz] = useState<number>(transitTimezone !== undefined && transitTimezone !== null ? transitTimezone : astrologyData.birthDetails.timezone);
  const [chartStyle, setChartStyle] = useState<"north" | "south">("north");

  const [transitPlanets, setTransitPlanets] = useState<TransitPlanet[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync props if they change
  useEffect(() => {
    if (propTransitDate) setTransitDate(propTransitDate);
  }, [propTransitDate]);

  useEffect(() => {
    if (propTransitTime) setTransitTime(propTransitTime);
  }, [propTransitTime]);

  useEffect(() => {
    if (transitLatitude !== undefined && transitLatitude !== null) {
      setLat(transitLatitude);
    }
  }, [transitLatitude]);

  useEffect(() => {
    if (transitLongitude !== undefined && transitLongitude !== null) {
      setLng(transitLongitude);
    }
  }, [transitLongitude]);

  useEffect(() => {
    if (transitTimezone !== undefined && transitTimezone !== null) {
      setTz(transitTimezone);
    }
  }, [transitTimezone]);

  const snapToPresent = () => {
    const freshDate = getLocalDateString();
    const freshTime = getLocalTimeString();
    setTransitDate(freshDate);
    setTransitTime(freshTime);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setTz(new Date().getTimezoneOffset() / -60);
        },
        (err) => {
          console.error("GPS snapshot error:", err);
        }
      );
    }
  };

  const fetchTransits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/jhora/gochara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: astrologyData.birthDetails.date,
          time: transitTime,
          latitude: Number(lat),
          longitude: Number(lng),
          timezone: Number(tz),
          target_date: transitDate,
        }),
      });

      if (!response.ok) {
        let errMsg = "Failed to calculate transits";
        try {
          const errJson = await response.json();
          if (errJson && errJson.error) errMsg = errJson.error;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      if (data && data.error) {
        throw new Error(data.error);
      }
      if (data.planets) {
        setTransitPlanets(data.planets);
      } else {
        throw new Error("No transit data returned");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while fetching transits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransits();
  }, [transitDate, transitTime, lat, lng, tz]);

  const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  const signAbbr = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];

  // Mapping houses based on Lagna sign of the birth chart
  const lagnaSignIndex = astrologyData.lagna.signIndex;

  const getSignForHouse = (house: number) => {
    return ((lagnaSignIndex + house - 1) % 12) + 1;
  };

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

  // Construct dual-placement charts ( Natal & Transit )
  // House index (1 to 12) mapping
  const natalChart = astrologyData.rasiChart;

  const getTransitPlanetsForHouse = (houseNum: number) => {
    // A transit planet's house is calculated relative to the natal Lagna as well!
    // We map transit planet's sign to house:
    // HouseNum = (transitPlanetSignIdx - lagnaSignIndex + 12) % 12 + 1
    return transitPlanets
      .filter((p) => {
        const signIdx = ZODIAC_SIGNS.indexOf(p.sign);
        const calcHouse = ((signIdx - lagnaSignIndex + 12) % 12) + 1;
        return calcHouse === houseNum;
      })
      .map((p) => p.name);
  };

  return (
    <div className="space-y-6" id="transits-tab-container">
      {/* Title block */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-sans font-medium text-amber-100 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-500" />
              Gochara (Planetary Transits)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Analyze current or future transiting planets overlaying the native's natal chart houses.
              {lat && lng && (
                <span className="block mt-1 text-[11px] text-amber-400/80 font-mono flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  Transit Location: {Number(lat).toFixed(4)}°N, {Number(lng).toFixed(4)}°E (TZ: {tz >= 0 ? `+${tz}` : tz})
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Style Toggle */}
            <div className="bg-slate-950/80 p-1 rounded-lg border border-indigo-500/15 flex">
              <button
                onClick={() => setChartStyle("north")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  chartStyle === "north"
                    ? "bg-indigo-600 text-white shadow-md font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                North
              </button>
              <button
                onClick={() => setChartStyle("south")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  chartStyle === "south"
                    ? "bg-indigo-600 text-white shadow-md font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                South
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <RefreshCw className="w-7 h-7 animate-spin text-amber-500 mb-3" />
          <span className="text-xs text-slate-400 font-mono">Calculating cosmic transits...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-center text-xs text-rose-400">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Dual Placement Chart */}
          <div className="lg:col-span-7 flex flex-col items-center bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-6 shadow-md">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold mb-4">
              Dual Chart: Natal (Indigo) vs Transit (Amber)
            </span>

            {chartStyle === "north" ? (
              /* NORTH INDIAN DUAL DIAMOND CHART */
              <div className="relative w-full max-w-[400px] aspect-square bg-slate-950/40 rounded-xl border border-indigo-500/30 p-2 shadow-inner">
                <svg viewBox="0 0 400 400" className="w-full h-full text-indigo-500/40 font-mono">
                  <rect x="10" y="10" width="380" height="380" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500/50" />
                  <line x1="10" y1="10" x2="390" y2="390" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500/35" />
                  <line x1="390" y1="10" x2="10" y2="390" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500/35" />
                  <polygon points="200,10 390,200 200,390 10,200" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500/50" />

                  {/* House 1 */}
                  <text x="200" y="102" textAnchor="middle" className="fill-amber-500 font-bold text-[10px]">{getSignForHouse(1)}</text>
                  <text x="200" y="70" textAnchor="middle" className="fill-indigo-400 text-[10px] font-bold">
                    {(natalChart[1] || []).map(getPlanetAbbr).join(" ")}
                  </text>
                  <text x="200" y="85" textAnchor="middle" className="fill-amber-400 text-[10px] font-bold">
                    {getTransitPlanetsForHouse(1).map(getPlanetAbbr).join(" ")}
                  </text>

                  {/* House 2 */}
                  <text x="145" y="65" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(2)}</text>
                  <text x="110" y="75" textAnchor="middle" className="fill-indigo-400 text-[11px] font-semibold">
                    {(natalChart[2] || []).map(getPlanetAbbr).join(" ")}
                  </text>
                  <text x="110" y="90" textAnchor="middle" className="fill-amber-400 text-[11px] font-semibold">
                    {getTransitPlanetsForHouse(2).map(getPlanetAbbr).join(" ")}
                  </text>

                  {/* House 3 */}
                  <text x="65" y="145" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(3)}</text>
                  <text x="60" y="95" textAnchor="middle" className="fill-indigo-400 text-[11px] font-semibold">
                    {(natalChart[3] || []).map(getPlanetAbbr).join(" ")}
                  </text>
                  <text x="60" y="110" textAnchor="middle" className="fill-amber-400 text-[11px] font-semibold">
                    {getTransitPlanetsForHouse(3).map(getPlanetAbbr).join(" ")}
                  </text>

                  {/* House 4 */}
                  <text x="105" y="200" textAnchor="middle" className="fill-amber-500 font-bold text-[10px]">{getSignForHouse(4)}</text>
                  <text x="65" y="190" textAnchor="middle" className="fill-indigo-400 text-[11px] font-semibold">
                    {(natalChart[4] || []).map(getPlanetAbbr).join(" ")}
                  </text>
                  <text x="65" y="205" textAnchor="middle" className="fill-amber-400 text-[11px] font-semibold">
                    {getTransitPlanetsForHouse(4).map(getPlanetAbbr).join(" ")}
                  </text>

                  {/* House 5 */}
                  <text x="65" y="260" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(5)}</text>
                  <text x="60" y="300" textAnchor="middle" className="fill-indigo-400 text-[11px] font-semibold">
                    {(natalChart[5] || []).map(getPlanetAbbr).join(" ")}
                  </text>
                  <text x="60" y="315" textAnchor="middle" className="fill-amber-400 text-[11px] font-semibold">
                    {getTransitPlanetsForHouse(5).map(getPlanetAbbr).join(" ")}
                  </text>

                  {/* House 6 */}
                  <text x="145" y="340" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(6)}</text>
                  <text x="110" y="315" textAnchor="middle" className="fill-indigo-400 text-[11px] font-semibold">
                    {(natalChart[6] || []).map(getPlanetAbbr).join(" ")}
                  </text>
                  <text x="110" y="330" textAnchor="middle" className="fill-amber-400 text-[11px] font-semibold">
                    {getTransitPlanetsForHouse(6).map(getPlanetAbbr).join(" ")}
                  </text>

                  {/* House 7 */}
                  <text x="200" y="305" textAnchor="middle" className="fill-amber-500 font-bold text-[10px]">{getSignForHouse(7)}</text>
                  <text x="200" y="270" textAnchor="middle" className="fill-indigo-400 text-[11px] font-semibold">
                    {(natalChart[7] || []).map(getPlanetAbbr).join(" ")}
                  </text>
                  <text x="200" y="285" textAnchor="middle" className="fill-amber-400 text-[11px] font-semibold">
                    {getTransitPlanetsForHouse(7).map(getPlanetAbbr).join(" ")}
                  </text>

                  {/* House 8 */}
                  <text x="255" y="340" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(8)}</text>
                  <text x="290" y="315" textAnchor="middle" className="fill-indigo-400 text-[11px] font-semibold">
                    {(natalChart[8] || []).map(getPlanetAbbr).join(" ")}
                  </text>
                  <text x="290" y="330" textAnchor="middle" className="fill-amber-400 text-[11px] font-semibold">
                    {getTransitPlanetsForHouse(8).map(getPlanetAbbr).join(" ")}
                  </text>

                  {/* House 9 */}
                  <text x="340" y="260" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(9)}</text>
                  <text x="340" y="300" textAnchor="middle" className="fill-indigo-400 text-[11px] font-semibold">
                    {(natalChart[9] || []).map(getPlanetAbbr).join(" ")}
                  </text>
                  <text x="340" y="315" textAnchor="middle" className="fill-amber-400 text-[11px] font-semibold">
                    {getTransitPlanetsForHouse(9).map(getPlanetAbbr).join(" ")}
                  </text>

                  {/* House 10 */}
                  <text x="295" y="200" textAnchor="middle" className="fill-amber-500 font-bold text-[10px]">{getSignForHouse(10)}</text>
                  <text x="335" y="195" textAnchor="middle" className="fill-indigo-400 text-[11px] font-semibold">
                    {(natalChart[10] || []).map(getPlanetAbbr).join(" ")}
                  </text>
                  <text x="335" y="210" textAnchor="middle" className="fill-amber-400 text-[11px] font-semibold">
                    {getTransitPlanetsForHouse(10).map(getPlanetAbbr).join(" ")}
                  </text>

                  {/* House 11 */}
                  <text x="340" y="145" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(11)}</text>
                  <text x="340" y="95" textAnchor="middle" className="fill-indigo-400 text-[11px] font-semibold">
                    {(natalChart[11] || []).map(getPlanetAbbr).join(" ")}
                  </text>
                  <text x="340" y="110" textAnchor="middle" className="fill-amber-400 text-[11px] font-semibold">
                    {getTransitPlanetsForHouse(11).map(getPlanetAbbr).join(" ")}
                  </text>

                  {/* House 12 */}
                  <text x="255" y="65" textAnchor="middle" className="fill-amber-500/80 text-[9px]">{getSignForHouse(12)}</text>
                  <text x="290" y="75" textAnchor="middle" className="fill-indigo-400 text-[11px] font-semibold">
                    {(natalChart[12] || []).map(getPlanetAbbr).join(" ")}
                  </text>
                  <text x="290" y="90" textAnchor="middle" className="fill-amber-400 text-[11px] font-semibold">
                    {getTransitPlanetsForHouse(12).map(getPlanetAbbr).join(" ")}
                  </text>
                </svg>
              </div>
            ) : (
              /* SOUTH INDIAN DUAL CHART */
              <div className="relative w-full max-w-[400px] aspect-square bg-slate-950/40 rounded-xl border border-indigo-500/30 p-4 shadow-inner grid grid-cols-4 grid-rows-4 gap-1">
                {[
                  { index: 11, label: "Pi" },
                  { index: 0, label: "Ar" },
                  { index: 1, label: "Ta" },
                  { index: 2, label: "Ge" },
                  { index: 10, label: "Aq" },
                  { index: -1, label: "" },
                  { index: -1, label: "" },
                  { index: 3, label: "Cn" },
                  { index: 9, label: "Cp" },
                  { index: -1, label: "" },
                  { index: -1, label: "" },
                  { index: 4, label: "Le" },
                  { index: 8, label: "Sg" },
                  { index: 7, label: "Sc" },
                  { index: 6, label: "Li" },
                  { index: 5, label: "Vi" }
                ].map((cell, idx) => {
                  if (cell.index === -1) {
                    if (idx === 5) {
                      return (
                        <div key={idx} className="col-span-2 row-span-2 flex flex-col items-center justify-center border border-indigo-500/10 bg-slate-950/60 rounded-lg">
                          <span className="text-sm font-mono font-bold text-amber-500">TRANSIT</span>
                          <span className="text-[10px] text-indigo-400 font-mono">D1 Gochara</span>
                        </div>
                      );
                    }
                    return null;
                  }

                  const houseNum = ((cell.index - lagnaSignIndex + 12) % 12) + 1;
                  const natalPlanets = natalChart[houseNum] || [];
                  const trPlanets = getTransitPlanetsForHouse(houseNum);
                  const isLagnaSign = cell.index === lagnaSignIndex;

                  return (
                    <div
                      key={idx}
                      className={`border border-indigo-500/15 bg-slate-900/40 p-1 rounded-md flex flex-col justify-between aspect-square hover:bg-slate-900/70 transition-colors ${
                        isLagnaSign ? "ring-1 ring-amber-500/30 bg-indigo-950/10" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono font-bold text-slate-500">{cell.label}</span>
                        {isLagnaSign && <span className="text-[8px] bg-amber-500/20 text-amber-400 rounded px-1 scale-90 font-bold">Asc</span>}
                      </div>

                      {/* Natal (Indigo) & Transit (Amber) list */}
                      <div className="flex flex-col gap-0.5 justify-center items-center">
                        {natalPlanets.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 justify-center">
                            {natalPlanets.map((p) => (
                              <span key={p} className="text-[8px] font-mono px-0.5 bg-indigo-950/80 text-indigo-300 border border-indigo-900/40 rounded">
                                {getPlanetAbbr(p)}
                              </span>
                            ))}
                          </div>
                        )}
                        {trPlanets.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 justify-center">
                            {trPlanets.map((p) => (
                              <span key={p} className="text-[8px] font-mono px-0.5 bg-amber-950/80 text-amber-400 border border-amber-900/40 rounded">
                                {getPlanetAbbr(p)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="text-[8px] font-mono text-slate-500 text-right">H{houseNum}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detailed Transits Table */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950/60 rounded-2xl border border-indigo-500/10 p-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center justify-between">
                <span>Gochara Analysis</span>
                <span className="text-amber-500 text-[10px]">Active</span>
              </h4>

              <div className="space-y-3">
                {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map((pName) => {
                  // Find natal house
                  let natalHouse = -1;
                  for (let h = 1; h <= 12; h++) {
                    if (natalChart[h]?.includes(pName)) {
                      natalHouse = h;
                      break;
                    }
                  }

                  const transitPlanet = transitPlanets.find((tp) => tp.name === pName);
                  const transitHouse = transitPlanet ? transitPlanet.house : natalHouse;

                  // Define impact rules (benefic transits based on standard astrology)
                  const getTransitImpact = (p: string, h: number) => {
                    const beneficHouses: { [key: string]: number[] } = {
                      Sun: [3, 6, 10, 11],
                      Moon: [1, 3, 6, 7, 10, 11],
                      Mars: [3, 6, 11],
                      Mercury: [2, 4, 6, 8, 10, 11],
                      Jupiter: [2, 5, 7, 9, 11],
                      Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
                      Saturn: [3, 6, 11],
                      Rahu: [3, 6, 11],
                      Ketu: [3, 6, 11],
                    };
                    const safeHouses = beneficHouses[p] || [];
                    return safeHouses.includes(h);
                  };

                  const isBenefic = getTransitImpact(pName, transitHouse);

                  return (
                    <div key={pName} className="flex justify-between items-center py-2 border-b border-indigo-500/5 hover:bg-slate-900/20 px-1 rounded transition-colors">
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">{pName}</span>
                        <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1.5 mt-0.5">
                          Natal: <span className="text-indigo-400 font-bold font-mono">H{natalHouse}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                          Transit: <span className="text-amber-400 font-bold font-mono">H{transitHouse}</span>
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        isBenefic 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-slate-500/5 text-slate-400 border-slate-500/10"
                      }`}>
                        {isBenefic ? "Benefic" : "Neutral"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-500/10 flex items-start gap-2 text-[10px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Planetary transits are measured relative to the natal Lagna (Ascendant). Strong benefic houses are determined by traditional Gochara parasari principles.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
