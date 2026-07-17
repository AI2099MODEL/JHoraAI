import React from "react";
import { 
  Calendar, 
  Compass, 
  Layers, 
  Zap, 
  Grid, 
  Clock, 
  Award, 
  Sparkles, 
  AlertTriangle,
  Shield
} from "lucide-react";
import { AstrologyData } from "../lib/astrology";
import AstroChart from "./AstroChart";
import DashaTree from "./DashaTree";

interface HoroscopeDashboardProps {
  astrologyData: AstrologyData;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  selectedVarga: string;
  setSelectedVarga: (varga: string) => void;
  selectedBavPlanet: string;
  setSelectedBavPlanet: (planet: string) => void;
  activeDashaSystem: "vimshottari" | "yogini" | "ashtottari";
  setActiveDashaSystem: (system: "vimshottari" | "yogini" | "ashtottari") => void;
}

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const getSignName = (idx: number) => {
  const signs = ["Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius"];
  return signs[idx];
};

const getGridPositionClass = (idx: number) => {
  switch (idx) {
    case 0: return "col-start-1 row-start-1"; // Pisces
    case 1: return "col-start-2 row-start-1"; // Aries
    case 2: return "col-start-3 row-start-1"; // Taurus
    case 3: return "col-start-4 row-start-1"; // Gemini
    case 4: return "col-start-4 row-start-2"; // Cancer
    case 5: return "col-start-4 row-start-3"; // Leo
    case 6: return "col-start-4 row-start-4"; // Virgo
    case 7: return "col-start-3 row-start-4"; // Libra
    case 8: return "col-start-2 row-start-4"; // Scorpio
    case 9: return "col-start-1 row-start-4"; // Sag
    case 10: return "col-start-1 row-start-3"; // Cap
    case 11: return "col-start-1 row-start-2"; // Aq
    default: return "";
  }
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
    Asc: "As",
    Lagna: "Lg"
  };
  return abbrs[name] || name.slice(0, 2);
};

export default function HoroscopeDashboard({
  astrologyData,
  activeSubTab,
  setActiveSubTab,
  selectedVarga,
  setSelectedVarga,
  selectedBavPlanet,
  setSelectedBavPlanet,
  activeDashaSystem,
  setActiveDashaSystem,
}: HoroscopeDashboardProps) {

  const getLordColor = (lord: string) => {
    const colors: { [key: string]: string } = {
      Sun: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      Moon: "text-blue-300 bg-blue-300/10 border-blue-300/20",
      Mars: "text-rose-400 bg-rose-400/10 border-rose-400/20",
      Mercury: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      Jupiter: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
      Venus: "text-pink-400 bg-pink-400/10 border-pink-400/20",
      Saturn: "text-slate-400 bg-slate-400/10 border-slate-400/20",
      Rahu: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
      Ketu: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    };
    return colors[lord] || "text-slate-300 bg-slate-800/50";
  };

  const getOccupantsForSouthIndianBox = (vargaChart: any, boxIdx: number, selectedVargaName: string) => {
    const occupants: string[] = [];
    if (!vargaChart || !astrologyData) return occupants;

    const lagnaSignIdx = astrologyData.lagna.signIndex;

    // Standard zodiac index corresponding to clockwise boxIdx (boxIdx 0 is Pisces: std index 11)
    const boxStandardZodiacIdx = (boxIdx - 1 + 12) % 12;

    const vargaLagnas = astrologyData.vargaLagnas || {};
    const currentVargaLagnaSignIdx = vargaLagnas[selectedVargaName] !== undefined ? vargaLagnas[selectedVargaName] : lagnaSignIdx;

    Object.entries(vargaChart).forEach(([houseStr, pNames]: [string, any]) => {
      const houseNum = parseInt(houseStr, 10);
      const houseStandardZodiacIdx = (currentVargaLagnaSignIdx + houseNum - 1) % 12;
      if (houseStandardZodiacIdx === boxStandardZodiacIdx) {
        pNames.forEach((pName: string) => {
          occupants.push(pName);
        });
      }
    });

    if (boxStandardZodiacIdx === currentVargaLagnaSignIdx) {
      occupants.push("Asc");
    }

    return occupants;
  };

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* Subtab 0: Dashboard Summary */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6" id="subtab-dashboard-home">
          {/* Welcoming Profile Card */}
          <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-amber-100">{astrologyData.birthDetails.name || "Nitin"}</span>
                <span className="text-xs uppercase font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                  Cosmic Native Profile
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-xs text-slate-400 font-mono">
                <div className="col-span-2 sm:col-span-1">Location: <span className="text-slate-200 font-semibold">{astrologyData.birthDetails.location}</span></div>
                <div>Date: <span className="text-slate-200 font-semibold">{astrologyData.birthDetails.date}</span></div>
                <div>Time: <span className="text-slate-200 font-semibold">{astrologyData.birthDetails.time}</span></div>
                <div>Lat/Lng: <span className="text-slate-200 font-semibold">{Number(astrologyData.birthDetails.latitude || 0).toFixed(4)}°, {Number(astrologyData.birthDetails.longitude || 0).toFixed(4)}°</span></div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/55 px-5 py-3 rounded-xl border border-indigo-500/10 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Ascendant (Lagna)</span>
                <span className="text-sm font-bold text-amber-400 block mt-0.5">{astrologyData.lagna.sign}</span>
              </div>
              <div className="h-8 w-px bg-indigo-500/15" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Moon Nakshatra</span>
                <span className="text-sm font-bold text-indigo-400 block mt-0.5">
                  {astrologyData.panchanga?.nakshatra || "Chitra"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Chandra Rasi */}
            <div className="bg-slate-900/60 p-5 rounded-xl border border-indigo-500/10 hover:border-amber-500/20 transition-all flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Chandra Rasi (Moon Sign)</span>
                <h4 className="text-lg font-bold text-white mt-1">
                  {astrologyData.planets.find(p => p.name === "Moon")?.sign || "Taurus"}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Controls emotion, mental state, and subconscious habits.
                </p>
              </div>
              <div className="text-[10px] text-amber-400 font-mono font-semibold">
                Degree: {astrologyData.planets.find(p => p.name === "Moon")?.longitude.toFixed(2)}°
              </div>
            </div>

            {/* Card 2: Surya Rasi */}
            <div className="bg-slate-900/60 p-5 rounded-xl border border-indigo-500/10 hover:border-amber-500/20 transition-all flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Surya Rasi (Sun Sign)</span>
                <h4 className="text-lg font-bold text-white mt-1">
                  {astrologyData.planets.find(p => p.name === "Sun")?.sign || "Sagittarius"}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Represents ego, soul energy, vitality, and profession.
                </p>
              </div>
              <div className="text-[10px] text-amber-400 font-mono font-semibold">
                Degree: {astrologyData.planets.find(p => p.name === "Sun")?.longitude.toFixed(2)}°
              </div>
            </div>

            {/* Card 3: Active Dasha */}
            <div className="bg-slate-900/60 p-5 rounded-xl border border-indigo-500/10 hover:border-amber-500/20 transition-all flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Current Mahadasha</span>
                <h4 className="text-lg font-bold text-amber-300 mt-1">
                  {astrologyData.dashas?.[0]?.lord ? `${astrologyData.dashas[0].lord} Mahadasha` : "Jupiter Mahadasha"}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Shapes current major life events and planetary cycles.
                </p>
              </div>
              <div className="text-[10px] text-indigo-400 font-mono font-semibold">
                Timeline: Active Cycle
              </div>
            </div>
          </div>

          {/* Quick Links Menu helper */}
          <div className="bg-slate-950/45 border border-indigo-500/10 rounded-2xl p-6">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-4">
              Select any section from the Navigation Menu on the left or click below to inspect detailed calculations:
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "panchanga", label: "Panchanga Details" },
                { id: "grahas", label: "Graha Positions" },
                { id: "vargas", label: "D1 to D60 Charts" },
                { id: "dashas", label: "Interactive Dashas" },
                { id: "strengths", label: "Shadbala Strengths" },
                { id: "ashtakavarga", label: "Ashtakavarga Matrix" },
                { id: "transits", label: "Gochara Transits" },
                { id: "ingress", label: "Zodiac Ingress" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id)}
                  className="px-4 py-3 bg-slate-900/40 border border-indigo-500/5 hover:border-amber-500/25 hover:bg-slate-900/75 rounded-xl text-xs text-slate-300 font-medium transition-all text-left cursor-pointer flex justify-between items-center"
                >
                  <span>{item.label}</span>
                  <span className="text-amber-500">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 1: Panchanga */}
      {activeSubTab === "panchanga" && (
        <div className="space-y-6" id="subtab-panchanga-content">
          {/* Title and summary */}
          <div className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-amber-200 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              Vedic Panchanga (Daily Five Attributes)
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Panchanga represents the five elements of time: Tithi (Water), Vara (Fire), Nakshatra (Air), Yoga (Ether), and Karana (Earth). These five attributes shape the daily cosmic energy field of the native.
            </p>
          </div>

          {/* 5 core attributes grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="bg-slate-900/60 border border-indigo-500/10 p-4 rounded-xl flex flex-col justify-between hover:border-amber-500/20 transition-all">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">1. Tithi (Lunar Day)</span>
                <p className="text-sm font-bold text-white mt-1.5 leading-tight">
                  {astrologyData.panchanga?.tithi || "Shukla Ekadashi"}
                </p>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-2 uppercase">Water Element</span>
            </div>

            <div className="bg-slate-900/60 border border-indigo-500/10 p-4 rounded-xl flex flex-col justify-between hover:border-amber-500/20 transition-all">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">2. Nakshatra (Star)</span>
                <p className="text-sm font-bold text-white mt-1.5 leading-tight">
                  {astrologyData.panchanga?.nakshatra || astrologyData.planets.find(p => p.name === "Moon")?.nakshatra || "Rohini"}
                </p>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-2 uppercase">Air Element</span>
            </div>

            <div className="bg-slate-900/60 border border-indigo-500/10 p-4 rounded-xl flex flex-col justify-between hover:border-amber-500/20 transition-all">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">3. Yoga (Solilunar)</span>
                <p className="text-sm font-bold text-white mt-1.5 leading-tight">
                  {astrologyData.panchanga?.yoga || "Preeti"}
                </p>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-2 uppercase">Ether Element</span>
            </div>

            <div className="bg-slate-900/60 border border-indigo-500/10 p-4 rounded-xl flex flex-col justify-between hover:border-amber-500/20 transition-all">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">4. Karana (Half-Tithi)</span>
                <p className="text-sm font-bold text-white mt-1.5 leading-tight">
                  {astrologyData.panchanga?.karana || "Bava"}
                </p>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-2 uppercase">Earth Element</span>
            </div>

            <div className="bg-slate-900/60 border border-indigo-500/10 p-4 rounded-xl flex flex-col justify-between hover:border-amber-500/20 transition-all">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">5. Vara (Day)</span>
                <p className="text-sm font-bold text-white mt-1.5 leading-tight">
                  {new Date(astrologyData.birthDetails.date).toLocaleDateString("en-US", { weekday: "long" })}
                </p>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-2 uppercase">Fire Element</span>
            </div>
          </div>

          {/* Secondary attributes cards */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-semibold text-slate-200 border-b border-indigo-500/10 pb-3 flex items-center justify-between">
              <span>Astrological Temperaments (Nisarga)</span>
              <span className="text-xs text-slate-400 font-mono font-medium">Physiological & Spiritual Constitution</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">Varna (Vocation Class)</span>
                <p className="text-xs font-bold text-white leading-tight mt-0.5">{astrologyData.panchanga?.varna || "Brahmin"}</p>
                <span className="text-[9px] text-slate-400 block leading-relaxed mt-1">Mental temperament and intellectual orientation.</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">Vashya (Influence Class)</span>
                <p className="text-xs font-bold text-white leading-tight mt-0.5">{astrologyData.panchanga?.vashya || "Manushya"}</p>
                <span className="text-[9px] text-slate-400 block leading-relaxed mt-1">Inherent social influence and compatibility category.</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">Yoni (Animal Instinct)</span>
                <p className="text-xs font-bold text-white leading-tight mt-0.5">{astrologyData.panchanga?.yoni || "Simha"}</p>
                <span className="text-[9px] text-slate-400 block leading-relaxed mt-1">Biological instinct, sexual nature, and sub-conscious drives.</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">Gana (Spiritual Tribe)</span>
                <p className="text-xs font-bold text-white leading-tight mt-0.5">{astrologyData.panchanga?.gana || "Manushya"}</p>
                <span className="text-[9px] text-slate-400 block leading-relaxed mt-1">Vibrational frequency: Deva, Manushya, or Rakshasa.</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">Nadi (Ayurvedic Humor)</span>
                <p className="text-xs font-bold text-white leading-tight mt-0.5">{astrologyData.panchanga?.nadi || "Adi"}</p>
                <span className="text-[9px] text-slate-400 block leading-relaxed mt-1">Humor type: Adi (Vata), Madhya (Pitta), or Antya (Kapha).</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Grahas */}
      {activeSubTab === "grahas" && (
        <div className="space-y-6" id="subtab-grahas-content">
          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/20 transition-all">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Birth Star / Nakshatra</span>
              <h3 className="text-xl font-semibold text-white mt-1">
                {astrologyData.planets.find(p => p.name === "Moon")?.nakshatra || "Rohini"}
              </h3>
              <span className="text-xs text-indigo-300 font-mono mt-0.5">
                Pada {astrologyData.planets.find(p => p.name === "Moon")?.pada || 1} — Lord: {astrologyData.planets.find(p => p.name === "Moon")?.lord || "Moon"}
              </span>
            </div>

            <div className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/20 transition-all">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Rasi (Moon Sign)</span>
              <h3 className="text-xl font-semibold text-white mt-1">
                {astrologyData.planets.find(p => p.name === "Moon")?.sign || "Taurus"}
              </h3>
              <span className="text-xs text-indigo-300 font-mono mt-0.5">
                Natal Moon in House {astrologyData.planets.find(p => p.name === "Moon")?.house || 1}
              </span>
            </div>

            <div className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/20 transition-all">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Lagna (Ascendant)</span>
              <h3 className="text-xl font-semibold text-white mt-1">
                {astrologyData.lagna.sign}
              </h3>
              <span className="text-xs text-indigo-300 font-mono mt-0.5">
                Ascendant Sign Degree: {astrologyData.lagna.degree.toFixed(2)}°
              </span>
            </div>
          </div>

          {/* Planet Positions Table */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-200 border-b border-indigo-500/10 pb-3 mb-4 flex items-center justify-between">
              <span>Grahas (Planetary Positions)</span>
              <span className="text-xs text-slate-400 font-mono font-medium">Sidereal Lahiri Ayanamsa</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-indigo-500/10 text-slate-400">
                    <th className="pb-3 font-medium">Planet (Graha)</th>
                    <th className="pb-3 font-medium">Longitude</th>
                    <th className="pb-3 font-medium">Zodiac Sign (Rasi)</th>
                    <th className="pb-3 font-medium">House (Bhava)</th>
                    <th className="pb-3 font-medium">Nakshatra (Pada)</th>
                    <th className="pb-3 font-medium">Nak Lord</th>
                    <th className="pb-3 font-medium text-right">Shadbala Strength</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-500/5">
                  {astrologyData.planets.map((p) => (
                    <tr key={p.name} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-3 font-semibold text-slate-100 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {p.name}
                      </td>
                      <td className="py-3 font-mono text-slate-400">{p.longitude.toFixed(2)}°</td>
                      <td className="py-3 text-amber-300/90 font-medium">
                        {p.sign} <span className="text-xs text-slate-500">({p.degree.toFixed(1)}°)</span>
                      </td>
                      <td className="py-3 font-mono text-slate-200">H{p.house}</td>
                      <td className="py-3 text-slate-300">
                        {p.nakshatra} <span className="text-xs text-slate-500">(P{p.pada})</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${getLordColor(p.lord)}`}>
                          {p.lord}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono font-bold text-slate-200">{p.strength || 65}%</span>
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-500 h-full"
                              style={{ width: `${p.strength || 65}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Vargas */}
      {activeSubTab === "vargas" && (
        <div className="space-y-6" id="subtab-vargas-content">
          <AstroChart
            rasiChart={astrologyData.rasiChart}
            navamsaChart={astrologyData.navamsaChart}
            divisionalCharts={astrologyData.divisionalCharts}
            vargaLagnas={astrologyData.vargaLagnas}
            lagnaSignIndex={astrologyData.lagna.signIndex}
            lagnaSignName={astrologyData.lagna.sign}
          />

          {/* Secondary Divisional Vargas */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-indigo-500/20 p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                Comprehensive Divisional Vargas (D2 to D60)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Explore all sixteen Shodashavarga charts calculated dynamically for this native.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4 bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-4">
                <label className="block text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-bold">Select Varga Chart</label>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {[
                    { id: "D1", label: "D1 Rasi (General)" },
                    { id: "D2", label: "D2 Hora (Wealth)" },
                    { id: "D3", label: "D3 Drekkana (Siblings)" },
                    { id: "D4", label: "D4 Chaturthamsa (Home)" },
                    { id: "D7", label: "D7 Saptamsa (Children)" },
                    { id: "D9", label: "D9 Navamsa (Dharma/Spouse)" },
                    { id: "D10", label: "D10 Dasamsa (Profession)" },
                    { id: "D12", label: "D12 Dwadasamsa (Parents)" },
                    { id: "D16", label: "D16 Shodasamsa (Happiness)" },
                    { id: "D20", label: "D20 Vimsamsa (Spirituality)" },
                    { id: "D24", label: "D24 Chaturvimsamsa (Intellect)" },
                    { id: "D27", label: "D27 Saptavimsamsa (Strengths)" },
                    { id: "D30", label: "D30 Trimsamsa (Challenges)" },
                    { id: "D40", label: "D40 Khavedamsa (Fortune)" },
                    { id: "D45", label: "D45 Akshavedamsa (Virtues)" },
                    { id: "D60", label: "D60 Shastiamsa (Past Karma)" }
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVarga(v.id)}
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${
                        selectedVarga === v.id
                          ? "bg-amber-500/10 text-amber-400 font-bold border-l-2 border-amber-500"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-8 flex flex-col items-center">
                {/* South Indian Grid */}
                <div className="grid grid-cols-4 grid-rows-4 gap-1.5 bg-slate-950 p-4 border border-indigo-500/15 rounded-2xl w-full max-w-[320px] aspect-square shadow-xl">
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const signName = getSignName(idx);
                    const vargaCharts = astrologyData.divisionalCharts || {};
                    const vargaChart = vargaCharts[selectedVarga] || (selectedVarga === "D1" ? astrologyData.rasiChart : selectedVarga === "D9" ? astrologyData.navamsaChart : {});
                    const occupants = getOccupantsForSouthIndianBox(vargaChart, idx, selectedVarga);

                    return (
                      <div
                        key={idx}
                        className={`border border-slate-850 bg-slate-900/40 p-1 rounded-lg flex flex-col justify-between aspect-square overflow-hidden hover:border-indigo-500/30 transition-all ${getGridPositionClass(idx)}`}
                      >
                        <span className="text-[7px] font-mono font-bold text-slate-500">{signName}</span>
                        <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center max-h-12 overflow-y-auto">
                          {occupants.map((p) => {
                            const isLagna = p === "Asc" || p === "Lagna";
                            return (
                              <span
                                key={p}
                                className={`rounded px-1 py-0.2 text-[8px] font-extrabold leading-none ${
                                  isLagna
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                    : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                }`}
                              >
                                {getPlanetAbbr(p)}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Center block */}
                  <div className="col-span-2 row-span-2 col-start-2 row-start-2 bg-gradient-to-br from-indigo-950/20 to-slate-950/40 rounded-xl border border-indigo-500/10 flex flex-col items-center justify-center text-center p-2 select-none">
                    <span className="text-lg font-black text-amber-300 uppercase tracking-widest">{selectedVarga}</span>
                    <span className="text-[7px] font-mono text-slate-400 mt-1 uppercase">South Indian</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Strengths */}
      {activeSubTab === "strengths" && (
        <div className="space-y-6" id="subtab-strengths-content">
          {/* Overview explanation */}
          <div className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-amber-200 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
              Astrological Potencies: Shad Bala & Bhava Bala
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Shad Bala represents the six-fold global strength of planets based on positional (Sthana), directional (Dig), temporal (Kala), motional (Cheshta), natural (Naisargika), and aspectual (Drig) forces. Bhava Bala measures the strength of the 12 houses to deliver their life themes.
            </p>
          </div>

          {/* Shad Bala Grid */}
          <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-indigo-500/10 pb-3 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Planetary Shad Bala (Sixfold Potency)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Calculated in Shashtiamsas (Rupas). High ratio indicates strong planetary expression.</p>
              </div>
              <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-300 px-2 py-1 rounded border border-amber-500/20">Unit: Rupas</span>
            </div>

            <div className="space-y-4">
              {astrologyData.shadBala && Object.entries(astrologyData.shadBala).map(([pName, val]: [string, any]) => {
                const ratio = val.ratio || (val.total / val.required);
                const isStrong = ratio >= 1.0;
                return (
                  <div key={pName} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-3 hover:border-indigo-500/10 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-white">{pName}</span>
                        <span className={`text-[8px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                          isStrong 
                            ? "bg-green-500/10 text-green-400 border-green-500/20" 
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {isStrong ? "Propitious (Strong)" : "Average"}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Total: <span className="text-amber-200 font-bold">{val.total || val.scored}</span> / Req: {val.required} <span className="text-slate-500">({ratio.toFixed(2)}x)</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isStrong ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-amber-500 to-orange-400"}`}
                        style={{ width: `${Math.min(ratio * 50, 100)}%` }}
                      />
                    </div>

                    {/* Breakdown components */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 text-center">
                      <div className="bg-slate-900/50 p-1.5 rounded border border-slate-900/50">
                        <span className="text-[7px] font-mono text-slate-500 block">Sthana (Pos)</span>
                        <span className="text-[9px] font-mono font-bold text-slate-300">{val.sthanaBala || 120}</span>
                      </div>
                      <div className="bg-slate-900/50 p-1.5 rounded border border-slate-900/50">
                        <span className="text-[7px] font-mono text-slate-500 block">Dig (Dir)</span>
                        <span className="text-[9px] font-mono font-bold text-slate-300">{val.digBala || 45}</span>
                      </div>
                      <div className="bg-slate-900/50 p-1.5 rounded border border-slate-900/50">
                        <span className="text-[7px] font-mono text-slate-500 block">Kala (Temp)</span>
                        <span className="text-[9px] font-mono font-bold text-slate-300">{val.kalaBala || 180}</span>
                      </div>
                      <div className="bg-slate-900/50 p-1.5 rounded border border-slate-900/50">
                        <span className="text-[7px] font-mono text-slate-500 block">Cheshta (Mot)</span>
                        <span className="text-[9px] font-mono font-bold text-slate-300">{val.cheshtaBala || 35}</span>
                      </div>
                      <div className="bg-slate-900/50 p-1.5 rounded border border-slate-900/50">
                        <span className="text-[7px] font-mono text-slate-500 block">Naisarg (Nat)</span>
                        <span className="text-[9px] font-mono font-bold text-slate-300">{val.naisargikaBala || 60}</span>
                      </div>
                      <div className="bg-slate-900/50 p-1.5 rounded border border-slate-900/50">
                        <span className="text-[7px] font-mono text-slate-500 block">Drig (Aspect)</span>
                        <span className="text-[9px] font-mono font-bold text-slate-300">{val.drigBala || -5}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bhava Bala Section */}
          <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-indigo-500/10 pb-3">
              <h4 className="text-sm font-semibold text-slate-200">Bhava Bala (Twelve Houses Strength)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Aggregated strength and rank of houses representing life spheres (1st House: Health, 10th House: Career, etc.).</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {astrologyData.bhavaBala && Object.entries(astrologyData.bhavaBala).map(([houseName, val]: [string, any]) => {
                const rankText = val.rank === 1 ? "1st" : val.rank === 2 ? "2nd" : val.rank === 3 ? "3rd" : `${val.rank}th`;
                return (
                  <div key={houseName} className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl text-center space-y-1.5 hover:border-indigo-500/30 transition-all">
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">{houseName}</span>
                    <span className="text-xs font-black text-white block font-mono">{val.strengthShashtiamsas || val.strength} Sh</span>
                    <div className="flex items-center justify-center gap-1.5 mt-1 border-t border-slate-900/40 pt-1.5">
                      <span className="text-[8px] font-mono text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded border border-indigo-500/15">Rank {rankText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 5: Ashtakavarga */}
      {activeSubTab === "ashtakavarga" && (
        <div className="space-y-6" id="subtab-ashtakavarga-content">
          {/* SAV Points Table */}
          <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-indigo-500/10 pb-3 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Sarvashtakavarga (SAV - Global Auspicious Points)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Aggregated points contributed by the 7 primary celestial planets across all 12 signs.</p>
              </div>
              <span className="text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20">Max SAV: 337 pts</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {astrologyData.ashtakavarga?.sarvashtakavarga && astrologyData.ashtakavarga.sarvashtakavarga.map((pts: number, idx: number) => {
                const signName = ZODIAC_SIGNS[idx];
                const isStrong = pts >= 28;
                const isWeak = pts < 24;
                return (
                  <div key={signName} className={`p-3.5 rounded-xl border text-center space-y-1 transition-all hover:scale-[1.02] duration-300 ${
                    isStrong 
                      ? "bg-green-500/5 border-green-500/20 shadow-sm shadow-green-500/5" 
                      : isWeak 
                      ? "bg-rose-500/5 border-rose-500/20" 
                      : "bg-slate-950/30 border-slate-850"
                  }`}>
                    <span className="text-[9px] font-mono text-slate-400 block font-bold">{signName}</span>
                    <span className={`text-base font-bold font-mono block ${isStrong ? "text-green-400" : isWeak ? "text-rose-400" : "text-amber-200"}`}>{pts} pts</span>
                    <span className="text-[8px] font-mono text-slate-500 block leading-tight pt-1 border-t border-slate-900/40">
                      {isStrong ? "Propitious" : isWeak ? "Critical" : "Neutral"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BAV Points Selection & Table */}
          <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-indigo-500/10 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Bhinnashtakavarga (BAV - Individual Planet Contribution)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Points contributed by each individual planet (0 to 8 scale). 4+ is positive; 6+ is excellent.</p>
              </div>
              <select
                value={selectedBavPlanet}
                onChange={(e) => setSelectedBavPlanet(e.target.value)}
                className="bg-slate-950 border border-indigo-500/30 rounded-lg px-3 py-1.5 text-xs text-amber-200 outline-none cursor-pointer font-bold focus:border-amber-500"
              >
                {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].map(p => (
                  <option key={p} value={p}>{p} Ashtakavarga</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {astrologyData.ashtakavarga?.planets?.[selectedBavPlanet] && 
               astrologyData.ashtakavarga.planets[selectedBavPlanet].map((pts: number, idx: number) => {
                 const signName = ZODIAC_SIGNS[idx];
                 const isGood = pts >= 4;
                 const isExcellent = pts >= 6;
                 return (
                   <div key={signName} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-center space-y-1.5 hover:border-indigo-500/25 transition-all">
                     <span className="text-[9px] font-mono text-slate-400 block font-bold">{signName}</span>
                     <span className={`text-base font-bold font-mono block ${isExcellent ? "text-amber-400" : isGood ? "text-indigo-300" : "text-slate-400"}`}>{pts} / 8</span>
                     <div className="flex justify-center gap-0.5 pt-1">
                       {Array.from({ length: 8 }).map((_, i) => (
                         <span 
                           key={i} 
                           className={`w-1.5 h-1.5 rounded-full ${i < pts ? (isExcellent ? "bg-amber-400" : "bg-indigo-400") : "bg-slate-800"}`} 
                         />
                       ))}
                     </div>
                   </div>
                 );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 6: Dashas */}
      {activeSubTab === "dashas" && (
        <div className="space-y-6" id="subtab-dashas-content">
          {/* Option selector for other systems */}
          <div className="flex items-center justify-between bg-slate-900/40 border border-indigo-500/10 p-4 rounded-2xl gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Interactive Planetary Periods (Dashas)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Explore the celestial timeline system used to calculate life phases.</p>
            </div>

            <div className="bg-slate-950/80 p-1 rounded-xl border border-indigo-500/15 flex gap-1">
              {["vimshottari", "yogini", "ashtottari"].map((sys) => (
                <button
                  key={sys}
                  onClick={() => setActiveDashaSystem(sys as any)}
                  className={`px-3.5 py-1.5 text-[10px] rounded-lg uppercase tracking-wider font-mono font-bold transition-all cursor-pointer ${
                    activeDashaSystem === sys 
                      ? "bg-amber-500 text-slate-950 font-extrabold" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {sys}
                </button>
              ))}
            </div>
          </div>

          {/* Render the appropriate timeline */}
          {activeDashaSystem === "vimshottari" && (
            <DashaTree dashas={astrologyData.dashas} />
          )}

          {activeDashaSystem === "yogini" && (
            <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Yogini Dasha Timeline (36-Year Cycle)</h4>
                <p className="text-xs text-slate-400 mt-1">Yogini dasha measures the flow of female primordial energies influencing karmic lessons.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                {(astrologyData.additionalDashas?.yogini || []).map((d: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 rounded-xl border border-slate-900 bg-slate-950/30 hover:border-slate-800 text-slate-300">
                    <span className="font-bold text-white text-xs">{d.lord}</span>
                    <span className="font-mono text-[10px] bg-slate-950/65 px-2 py-0.5 rounded border border-slate-800/85">{d.startDate} to {d.endDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDashaSystem === "ashtottari" && (
            <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Ashtottari Dasha Timeline (108-Year Cycle)</h4>
                <p className="text-xs text-slate-400 mt-1">Conditionally applicable when Rahu is placed in auspicious quadrants or trines to Lagna Lord.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                {(astrologyData.additionalDashas?.ashtottari || []).map((d: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 rounded-xl border border-slate-900 bg-slate-950/30 hover:border-slate-800 text-slate-300">
                    <span className="font-bold text-white text-xs">{d.lord} Major Cycle</span>
                    <span className="font-mono text-[10px] bg-slate-950/65 px-2 py-0.5 rounded border border-slate-800/85">{d.startDate} to {d.endDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab 7: Yogas */}
      {activeSubTab === "yogas" && (
        <div className="space-y-6" id="subtab-yogas-content">
          {/* Overview explanation */}
          <div className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Celestial Combinations (Yogas & Doshas)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Yogas represent highly specific configurations of planets that release auspicious and powerful karmic energies, granting intelligence, success, or resilience. Doshas represent critical imbalances calling for lifestyle refinements and conscious remedies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Yogas Side */}
            <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-semibold text-amber-400 border-b border-indigo-500/10 pb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Auspicious Astrological Yogas
              </h3>
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin">
                {astrologyData.yogas.map((y) => (
                  <div
                    key={y.name}
                    className={`p-4 rounded-xl border transition-all ${
                      y.isPresent
                        ? "bg-green-500/5 border-green-500/30 shadow-sm shadow-green-500/5"
                        : "bg-slate-950/20 border-slate-800/80 opacity-60"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-bold text-white">{y.name}</h4>
                      <span
                        className={`text-[8px] font-mono uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded ${
                          y.isPresent
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {y.isPresent ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mb-2">{y.description}</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {y.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Doshas Side */}
            <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-semibold text-rose-400 border-b border-indigo-500/10 pb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Astrological Challenges (Doshas)
              </h3>
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin">
                {/* Manglik */}
                <div className={`p-4 rounded-xl border transition-all ${
                  astrologyData.doshas.manglik.isPresent
                    ? "bg-rose-500/5 border-rose-500/30"
                    : "bg-slate-950/20 border-slate-800/80"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-bold text-white">Manglik Dosha (Kuja Dosha)</h4>
                    <span className={`text-[8px] font-mono uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded ${
                      astrologyData.doshas.manglik.isPresent ? "bg-rose-500/25 text-rose-400" : "bg-green-500/20 text-green-400"
                    }`}>
                      {astrologyData.doshas.manglik.isPresent ? "PRESENT" : "ABSENT"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                    {astrologyData.doshas.manglik.explanation}
                  </p>
                </div>

                {/* Kaal Sarp */}
                <div className={`p-4 rounded-xl border transition-all ${
                  astrologyData.doshas.kaalSarp.isPresent
                    ? "bg-rose-500/5 border-rose-500/30"
                    : "bg-slate-950/20 border-slate-800/80"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-bold text-white">Kaal Sarp Dosha</h4>
                    <span className={`text-[8px] font-mono uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded ${
                      astrologyData.doshas.kaalSarp.isPresent ? "bg-rose-500/25 text-rose-400" : "bg-green-500/20 text-green-400"
                    }`}>
                      {astrologyData.doshas.kaalSarp.isPresent ? "PRESENT" : "ABSENT"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                    {astrologyData.doshas.kaalSarp.explanation}
                  </p>
                </div>

                {/* Sade Sati */}
                <div className={`p-4 rounded-xl border transition-all ${
                  astrologyData.doshas.sadeSati.isPresent
                    ? "bg-rose-500/5 border-rose-500/30"
                    : "bg-slate-950/20 border-slate-800/80"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-bold text-white">Shani Sade Sati Cycle</h4>
                    <span className={`text-[8px] font-mono uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded ${
                      astrologyData.doshas.sadeSati.isPresent ? "bg-amber-500/25 text-amber-400" : "bg-green-500/20 text-green-400"
                    }`}>
                      {astrologyData.doshas.sadeSati.isPresent ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                    {astrologyData.doshas.sadeSati.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab: Sahams */}
      {activeSubTab === "saham" && (
        <div className="space-y-6" id="subtab-saham-content">
          <div className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-amber-200 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Saham Calculations (Arabic Parts & Sensitive Karmic Points)
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Sahams are sensitive coordinates in the zodiac calculated using specific planetary distances projected from the Ascendant. Originating from ancient Tajika systems (and parallel to Arabic Parts), they represent focal points of concentrated destiny for wealth, knowledge, health, and status.
            </p>
          </div>

          {/* Search/Filter and info */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/60 border border-indigo-500/15 p-4 rounded-xl">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search Saham (e.g. Punya, Vidya)..."
                id="saham-search"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                onChange={(e) => {
                  const val = e.target.value.toLowerCase();
                  const cards = document.querySelectorAll(".saham-card");
                  cards.forEach((card) => {
                    const title = card.getAttribute("data-title") || "";
                    if (title.toLowerCase().includes(val)) {
                      (card as HTMLElement).style.display = "block";
                    } else {
                      (card as HTMLElement).style.display = "none";
                    }
                  });
                }}
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Dynamic Projection: {astrologyData.lagna.sign} Ascendant at {astrologyData.lagna.degree.toFixed(2)}°
            </div>
          </div>

          {/* Sahams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {astrologyData.sahams && Object.entries(astrologyData.sahams).length > 0 ? (
              Object.entries(astrologyData.sahams).map(([key, s]: [string, any]) => {
                const details = (() => {
                  const map: { [key: string]: { desc: string; formula: string } } = {
                    "Punya": { desc: "The point of fortune, spiritual merit, and material prosperity. Projected during day birth from Moon to Sun, and night birth from Sun to Moon.", formula: "Moon - Sun + Ascendant (Day) / Sun - Moon + Ascendant (Night)" },
                    "Vidya": { desc: "The point of academic learning, scholarship, deep comprehension, and intellectual acquisition.", formula: "Mercury - Sun + Ascendant" },
                    "Raja": { desc: "The point of high status, leadership recognition, political power, and regal accomplishments.", formula: "Saturn - Sun + Ascendant" },
                    "Yasa": { desc: "The point of glory, fame, social prestige, and public appreciation of efforts.", formula: "Jupiter - Mars + Ascendant" },
                    "Jeeva": { desc: "The point of life force, biological longevity, physical constitution, and organic immunity.", formula: "Jupiter - Saturn + Ascendant" },
                    "Karma": { desc: "The point of trade, career opportunities, professional obligations, and field of actions.", formula: "Mars - Sun + Ascendant" },
                    "Bhratri": { desc: "The point of fraternity, siblings, supportive comrades, and team endeavors.", formula: "Jupiter - Saturn + Ascendant" },
                    "Gaurava": { desc: "The point of self-esteem, lineage honor, prestige, and pride in values.", formula: "Jupiter - Sun + Ascendant" },
                    "Asha": { desc: "The point of wishes, desires, hopes, and expectations of positive life outcomes.", formula: "Saturn - Mars + Ascendant" },
                    "Guru": { desc: "The point of divine alignment, teachers, spiritual lineage, and initiation blessings.", formula: "Jupiter - Sun + Ascendant" },
                    "Shatru": { desc: "The point of rivals, litigation hurdles, debt structures, and defensive challenges.", formula: "Mars - Saturn + Ascendant" }
                  };
                  for (const [k, v] of Object.entries(map)) {
                    if (s.label.toLowerCase().includes(k.toLowerCase())) return v;
                  }
                  return { desc: "An active projective coordinate mapping specific sectors of karmic fruitfulness.", formula: "Planetary differential + Ascendant" };
                })();

                return (
                  <div
                    key={key}
                    data-title={s.label}
                    className="saham-card bg-slate-900/60 border border-indigo-500/10 hover:border-amber-500/30 rounded-2xl p-5 shadow-xl transition-all hover:translate-y-[-2px] flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-semibold text-white">{s.label}</h4>
                        <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/15">
                          {s.sign} ({(s.degree || 0).toFixed(1)}°)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                        {details.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80">
                      <span className="text-[9px] text-indigo-400 font-mono block uppercase tracking-wider font-semibold">Calculation Formula:</span>
                      <span className="text-[10px] text-slate-300 font-mono block mt-0.5 select-all">{details.formula}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 rounded-2xl bg-slate-900/20 border border-dashed border-slate-800 text-slate-500 text-xs">
                <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-pulse" />
                No Saham data available. Please cast a birth chart to project sensitive points.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab: Argalas */}
      {activeSubTab === "argala" && (
        <div className="space-y-6" id="subtab-argala-content">
          <div className="bg-slate-900/40 border border-indigo-500/10 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-amber-200 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Argala & Virodhargala (Planetary Interventions)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                Argala is a fundamental Jaimini astrology concept meaning "bolt" or "lock". Planets in the 2nd, 4th, and 11th houses from any reference point project an Argala (intervention) that drives that house's affairs, while opposing planets in the 12th, 10th, and 3rd houses create Virodha (obstruction) to block that drive.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/20 whitespace-nowrap shrink-0">
              Reference: Lagna (House 1)
            </span>
          </div>

          {/* Structural Theory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-indigo-500/5 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">2nd House (Argala)</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Represents direct nourishment, assets, speech, and resources. Obstructed by planets in the <strong>12th House (Virodha)</strong>.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-indigo-500/5 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">4th House (Argala)</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Represents domestic happiness, vehicles, education, and security. Obstructed by planets in the <strong>10th House (Virodha)</strong>.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-indigo-500/5 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">11th House (Argala)</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Represents financial gains, network, friends, and liquid income. Obstructed by planets in the <strong>3rd House (Virodha)</strong>.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-indigo-500/5 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">5th House (Argala)</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Represents creative intellect, investments, and past life merits. Obstructed by planets in the <strong>9th House (Virodha)</strong>.
              </p>
            </div>
          </div>

          {/* Active Argalas Analyzed */}
          <div className="bg-slate-900/60 border border-indigo-500/15 rounded-2xl p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-semibold text-white border-b border-indigo-500/10 pb-3 flex items-center justify-between">
              <span>Lagna Interventions Summary</span>
              <span className="text-xs text-slate-400 font-mono font-medium">Calculated from Natal placements</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {astrologyData.argalas && astrologyData.argalas[1] && astrologyData.argalas[1].length > 0 ? (
                astrologyData.argalas[1].map((arg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      arg.isObstructed
                        ? "bg-rose-500/5 border-rose-500/20"
                        : "bg-emerald-500/5 border-emerald-500/20"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-200">
                          {arg.type} Argala (House {arg.argalaHouse})
                        </span>
                        <div className="text-[10px] text-slate-400 space-y-0.5 font-mono">
                          <div>
                            🌟 Intervening Planets:{" "}
                            <span className="text-indigo-300 font-semibold">
                              {arg.argalaPlanets.length > 0 ? arg.argalaPlanets.join(", ") : "None"}
                            </span>
                          </div>
                          <div>
                            🚫 Obstructing House: House {arg.virodhaHouse} ({" "}
                            <span className="text-slate-400">
                              {arg.virodhaPlanets.length > 0 ? arg.virodhaPlanets.join(", ") : "Empty"}
                            </span>{" "}
                            )
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                          arg.isObstructed
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/20"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {arg.isObstructed ? "Obstructed" : "Unobstructed"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed mt-3 pt-2.5 border-t border-slate-800/60">
                      {arg.verdict}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                  <Shield className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-pulse" />
                  No direct planet-induced Argalas detected on the Ascendant. Empty houses do not project primary active drives.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
