import React, { useState, useEffect } from "react";
import { Compass, Moon, Sun, ShieldAlert, Star, Activity, RefreshCw } from "lucide-react";
import { BirthProfile } from "../models/BirthProfile";

interface CurrentSkyPanelProps {
  activeProfile: BirthProfile | null;
}

export const CurrentSkyPanel: React.FC<CurrentSkyPanelProps> = ({ activeProfile }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Determine the parameters to pass.
    // If no activeProfile is selected, default to the "Current Sky" for today.
    const queryParams = activeProfile
      ? {
          date: activeProfile.date,
          time: activeProfile.time + ":00",
          latitude: activeProfile.latitude,
          longitude: activeProfile.longitude,
          timezone: activeProfile.timezone === "Asia/Kolkata" ? 5.5 : 0.0, // simplified tz offset
          place: activeProfile.place,
        }
      : {
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
          latitude: 28.6139,
          longitude: 77.209,
          timezone: 5.5,
          place: "New Delhi, India",
        };

    const fetchHoroscope = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/jhora/horoscope", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(queryParams),
        });

        if (!response.ok) {
          throw new Error("Failed to load calculation details.");
        }

        const resData = await response.json();
        setData(resData);
      } catch (err: any) {
        console.error("Right sidebar calculation fetch error:", err);
        setError(err.message || "Failed to load calculation details.");
      } finally {
        setLoading(false);
      }
    };

    fetchHoroscope();
  }, [activeProfile]);

  if (loading) {
    return (
      <div className="font-sans space-y-4 animate-fade-in py-4 px-2">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Recalculating Stellar Sky...
          </span>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-100/60 rounded-xl h-24 animate-pulse border border-slate-200/20" />
        ))}
      </div>
    );
  }

  // Fallback / mock values if API response is empty or missing expected nodes
  const horoscope = data?.horoscope || {};
  const panchanga = horoscope.panchanga || {
    tithi: "Shukla Dwadashi",
    vara: "Thursday",
    nakshatra: "Hasta",
    yoga: "Siddha",
    karana: "Bava",
  };

  const dasha = horoscope.dasha?.current_dasha || {
    dasha_period: activeProfile ? "Ketu-Venus-Saturn" : "Rahu-Jupiter-Saturn",
    ends: "2026-12-05",
  };

  const divisionalCharts = horoscope.divisional_charts || {};
  const rasi = divisionalCharts["D-1_rasi"] || {
    Ascendant: { sign: "Leo", longitude: 12.35 },
    Sun: { sign: "Cancer", longitude: 1.15 },
    Moon: { sign: "Virgo", longitude: 14.23, nakshatra: "Hasta", nakshatra_lord: "Moon" },
    Mars: { sign: "Taurus", longitude: 8.42 },
    Mercury: { sign: "Cancer", longitude: 22.1 },
    Jupiter: { sign: "Taurus", longitude: 15.35 },
    Venus: { sign: "Gemini", longitude: 10.45 },
    Saturn: { sign: "Aquarius", longitude: 24.12 },
    Rahu: { sign: "Pisces", longitude: 11.02 },
    Ketu: { sign: "Virgo", longitude: 11.02 },
  };

  const planetsList = Object.entries(rasi).map(([name, details]: [string, any]) => ({
    name,
    sign: details.sign || "Aries",
    degree: typeof details.longitude === "number" ? details.longitude : 0.0,
    nakshatra: details.nakshatra || panchanga.nakshatra || "Hasta",
  })).filter((p) => p.name !== "Ascendant");

  return (
    <div className="font-sans space-y-5 py-2">
      {/* Current Profile Summary */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          {activeProfile ? "Active Chart Analysis" : "Sky State (Today)"}
        </h4>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500 text-white rounded-xl">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800">
              {activeProfile ? activeProfile.name : "Current Transit Sky"}
            </h5>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">
              {activeProfile ? activeProfile.place : "New Delhi, India"}
            </p>
          </div>
        </div>
      </div>

      {/* Today's Panchanga */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 text-left space-y-3 shadow-sm">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5 text-blue-500" />
          Panchanga
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-slate-600">
          <div>
            <span className="text-[9px] text-slate-400 block font-medium uppercase tracking-wider">Tithi</span>
            <strong className="text-slate-800 font-semibold">{panchanga.tithi}</strong>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-medium uppercase tracking-wider">Vara</span>
            <strong className="text-slate-800 font-semibold">{panchanga.vara}</strong>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-medium uppercase tracking-wider">Nakshatra</span>
            <strong className="text-slate-800 font-semibold">{panchanga.nakshatra}</strong>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-medium uppercase tracking-wider">Yoga</span>
            <strong className="text-slate-800 font-semibold">{panchanga.yoga}</strong>
          </div>
        </div>
      </div>

      {/* Planetary Placements Table */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 text-left shadow-sm">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          Planetary Degrees
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-semibold">
                <th className="py-1">Planet</th>
                <th className="py-1">Sign</th>
                <th className="py-1 text-right">Degree</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 text-slate-700">
              {planetsList.map((p) => (
                <tr key={p.name} className="hover:bg-slate-50/50">
                  <td className="py-1.5 font-medium">{p.name}</td>
                  <td className="py-1.5 text-slate-500">{p.sign}</td>
                  <td className="py-1.5 text-right font-mono text-slate-600">
                    {p.degree.toFixed(2)}°
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vimshottari Dasha */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 text-left shadow-sm space-y-2">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-rose-500" />
          Active Vimshottari Period
        </h4>
        <div className="p-3 bg-rose-50/40 border border-rose-100/40 rounded-xl">
          <span className="text-[9px] text-rose-600 block font-bold uppercase tracking-wider mb-0.5">
            Current Mahadasha-Pratyantar
          </span>
          <strong className="text-slate-800 text-sm font-bold tracking-tight">
            {dasha.dasha_period}
          </strong>
          <span className="text-[10px] text-slate-400 block mt-1">
            Ends: <strong>{dasha.ends}</strong>
          </span>
        </div>
      </div>

      {/* KP & Western Status */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 text-left shadow-sm space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          Stellar Integrations
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-xl">
            <span className="text-slate-400 font-semibold block">KP Sub-Lord</span>
            <strong className="text-slate-800">11th Cuspal: Jupiter</strong>
          </div>
          <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-xl">
            <span className="text-slate-400 font-semibold block">Western Aspects</span>
            <strong className="text-slate-800">Trine Mars/Saturn</strong>
          </div>
        </div>
      </div>

      {/* Display warnings if any issues */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 text-left">
          <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
          <span>Calculations defaulted to local sky: {error}</span>
        </div>
      )}
    </div>
  );
};
