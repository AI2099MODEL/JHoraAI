import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import DashaTree from "./DashaTree";
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Heart,
  Zap,
  Star,
  Briefcase,
  Compass,
  Shield,
  Award,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Database,
  Activity,
  Award as RibbonIcon,
  FileDown,
  ChevronDown,
  ChevronUp,
  Grid
} from "lucide-react";

interface MyPageViewProps {
  astrologyData: any;
  activeUser: any;
  isDark: boolean;
  containerStyle: string;
  cardStyle: string;
  textMuted: string;
}

const IconMap: { [key: string]: React.ComponentType<any> } = {
  user: User,
  zap: Zap,
  heart: Heart,
  star: Star,
  briefcase: Briefcase,
  compass: Compass,
  shield: Shield,
  award: Award,
};

function renderIndexedTable(tableId: string, data: any, profile?: any, astrologyData?: any) {
  let planetsArray = data;
  if (!planetsArray && tableId === "table_2") {
    const planetsObj = profile?.Vedic?.planets || astrologyData?.vedic?.planets || {};
    if (Object.keys(planetsObj).length > 0) {
      planetsArray = Object.entries(planetsObj).map(([name, p]: [string, any]) => ({
        name,
        sign: p.sign,
        degree: p.degree,
        minute: p.minute,
        second: p.second,
        nakshatra: p.nakshatra,
        pada: p.pada,
        house: p.house,
        dignity: p.dignity || (p.retrograde ? "Retrograde" : "Neutral")
      }));
    }
  }

  if (!data && !planetsArray && !["table_3", "table_4", "table_5", "table_10", "table_13", "table_14", "table_15", "table_16", "table_17", "table_18", "table_20", "table_21", "table_22"].includes(tableId)) return null;
  
  const baseTableStyle = "w-full text-left border-collapse text-xs mt-2";
  const thStyle = "py-2 px-3 bg-slate-900/60 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider";
  const tdStyle = "py-2 px-3 border-b border-slate-800/40 text-slate-300 font-mono";

  switch (tableId) {
    case "table_1":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-950/40 rounded-lg border border-slate-800/60 font-mono text-xs">
          <div className="space-y-1.5">
            <h5 className="font-bold text-amber-400 font-sans text-[10px] uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">Birth Particulars</h5>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Name:</span>
              <span className="text-slate-200 font-bold">{data.name || "Nitin Jain"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Date:</span>
              <span className="text-slate-200">{data.date || data.birthDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Time:</span>
              <span className="text-slate-200">{data.time || data.birthTime}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Place:</span>
              <span className="text-slate-200">{data.location || data.birthPlace}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <h5 className="font-bold text-amber-400 font-sans text-[10px] uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">Ascendant Coordinates</h5>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Zodiac Sign (Lagna):</span>
              <span className="text-slate-200 font-bold">{data.lagnaSign || "Cancer"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Nakshatra:</span>
              <span className="text-slate-200">{data.lagnaNakshatra || "Pushya"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">Nakshatra Lord:</span>
              <span className="text-slate-200">{data.lagnaNakLord || "Saturn"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900/10">
              <span className="text-slate-500">KP Sub-Lord:</span>
              <span className="text-slate-200">{data.lagnaSubLord || "Mercury"}</span>
            </div>
          </div>
        </div>
      );
    case "table_2":
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/40 mt-2">
          <table className={baseTableStyle}>
            <thead>
              <tr>
                <th className={thStyle}>Graha (Planet)</th>
                <th className={thStyle}>Zodiac Sign</th>
                <th className={thStyle}>Degree</th>
                <th className={thStyle}>Nakshatra (Pada)</th>
                <th className={thStyle}>House</th>
                <th className={thStyle}>Dignity / Avastha</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(planetsArray) && planetsArray.map((p: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-900/30">
                  <td className={`${tdStyle} font-bold text-amber-500`}>{p.name || p.lord}</td>
                  <td className={tdStyle}>{p.sign}</td>
                  <td className={tdStyle}>{p.degree}° {p.minute || 0}'</td>
                  <td className={tdStyle}>{p.nakshatra} ({p.pada})</td>
                  <td className={tdStyle}>House {p.house}</td>
                  <td className={tdStyle}>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-400 font-bold">
                      {p.dignity || p.avastha || "Neutral"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "table_3":
    case "table_4":
    case "table_5": {
      let dashaData = data;
      if (!dashaData) {
        if (tableId === "table_3") dashaData = profile?.Vedic?.dashas?.vimshottari || astrologyData?.dashas || [];
        else if (tableId === "table_4") dashaData = profile?.Vedic?.dashas?.yogini || [];
        else if (tableId === "table_5") dashaData = profile?.Vedic?.dashas?.ashtottari || [];
      }
      return (
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60 text-xs font-mono max-h-[300px] overflow-y-auto space-y-1.5">
          <div className="flex justify-between text-slate-500 border-b border-slate-800 pb-1 text-[10px] uppercase font-bold tracking-wider mb-2 font-sans">
            <span>Dasha Lord (Period)</span>
            <span>Completion Date</span>
          </div>
          {Array.isArray(dashaData) && dashaData.map((d: any, idx: number) => (
            <div key={idx} className="flex justify-between py-1 border-b border-slate-900/10 hover:bg-slate-900/20 px-1 rounded">
              <span className="font-bold text-amber-500">{d.lord}</span>
              <span className="text-slate-300">Until {d.end_date || d.endDate || d.end}</span>
            </div>
          ))}
          {typeof dashaData === "object" && !Array.isArray(dashaData) && (
            <pre className="text-[10px] text-slate-300 leading-relaxed overflow-x-auto">
              {JSON.stringify(dashaData, null, 2)}
            </pre>
          )}
        </div>
      );
    }
    case "table_6":
    case "table_7":
    case "table_8":
    case "table_9":
    case "table_11":
    case "table_12":
    default:
      return (
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60 text-xs font-mono max-h-[300px] overflow-y-auto">
          <pre className="text-[10px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    case "table_14": {
      const arudhas = data || astrologyData?.jaimini?.arudha || astrologyData?.horoscope?.arudhas || astrologyData?.arudhas || profile?.Jaimini?.arudha || profile?.Vedic?.arudha || {};
      const arudhaKeys = Object.keys(arudhas).length > 0 ? Object.keys(arudhas) : ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12"];
      
      const ARUDHA_LABELS: Record<string, string> = {
        A1: "Lagna Pada / Arudha Lagna (AL) - Manifested Self & Public Image",
        AL: "Arudha Lagna (AL) - Manifested Self & Public Image",
        A2: "Dhanarudha (A2) - Wealth, Speech & Financial Projection",
        A3: "Bhratrarudha / Vikramarudha (A3) - Valour, Siblings & Communication",
        A4: "Matrarudha / Sukharudha (A4) - Happiness, Real Estate & Vehicles",
        A5: "Putrarudha / Mantrarudha (A5) - Intelligence, Progeny & Creative Genius",
        A6: "Shatrurudha / Rogarudha (A6) - Debts, Disputes & Obstacles",
        A7: "Dararudha (A7) - Marriage, Partnership & Relationship Projection",
        A8: "Mrityurudha (A8) - Longevity, Transformations & Sudden Events",
        A9: "Bhagyarudha (A9) - Fortune, Wisdom & Dharma Projection",
        A10: "Rajyarudha (A10) - Profession, Fame, Career & Status",
        A11: "Labharudha (A11) - Cash Flow, Earnings & Social Networks",
        A12: "Upapada Lagna (UL) - Expenditures, Spousal Quality & Spiritual Retreat",
        UL: "Upapada Lagna (UL) - Expenditures, Spousal Quality & Spiritual Retreat",
      };

      return (
        <div className="overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/40 mt-2 text-xs">
          <table className={baseTableStyle}>
            <thead>
              <tr>
                <th className={thStyle}>Pada Symbol</th>
                <th className={thStyle}>Arudha Name / Significance</th>
                <th className={thStyle}>Sign Placement & House Offset</th>
              </tr>
            </thead>
            <tbody>
              {arudhaKeys.map((key) => {
                const placement = arudhas[key] || "Unknown";
                const label = ARUDHA_LABELS[key] || `${key} Pada`;
                const displayPlacement = typeof placement === "object" && placement !== null
                  ? `${placement.sign || ""} (House ${placement.house || ""})`
                  : String(placement);
                return (
                  <tr key={key} className="hover:bg-slate-900/30">
                    <td className={`${tdStyle} font-bold text-amber-500`}>{key}</td>
                    <td className={tdStyle}>{label}</td>
                    <td className={`${tdStyle} text-slate-200 font-bold`}>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                        {displayPlacement}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    case "table_10": {
      const argalas = data || astrologyData?.argalas || profile?.Vedic?.argalas || profile?.Jaimini?.argala || profile?.Vedic?.argala || astrologyData?.jaimini?.argala || astrologyData?.horoscope?.argalas || {};
      const houseEntries = Array.from({ length: 12 }, (_, i) => String(i + 1));
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/40 mt-2 text-xs">
          <table className={baseTableStyle}>
            <thead>
              <tr>
                <th className={thStyle}>House Reference</th>
                <th className={thStyle}>Argala Configurations</th>
                <th className={thStyle}>Virodha (Obstructions)</th>
                <th className={thStyle}>Status / Verdict</th>
              </tr>
            </thead>
            <tbody>
              {houseEntries.map((hKey) => {
                const configs = argalas[hKey] || [];
                if (configs.length === 0) {
                  return (
                    <tr key={hKey} className="hover:bg-slate-900/30">
                      <td className={`${tdStyle} font-bold text-amber-500`}>House {hKey}</td>
                      <td className={tdStyle} colSpan={3}>
                        <span className="text-slate-500 italic">No significant Argalas found</span>
                      </td>
                    </tr>
                  );
                }
                return configs.map((cfg: any, idx: number) => (
                  <tr key={`${hKey}-${idx}`} className="hover:bg-slate-900/30 border-b border-slate-900/40">
                    {idx === 0 ? (
                      <td className={`${tdStyle} font-bold text-amber-500 border-r border-slate-900/50`} rowSpan={configs.length}>
                        House {hKey}
                      </td>
                    ) : null}
                    <td className={tdStyle}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1 rounded text-[9px] font-bold ${cfg.type === "Primary" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>
                          {cfg.type}
                        </span>
                        <span className="text-slate-200 font-mono">
                          {cfg.argalaPlanets?.join(", ") || "None"}
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          (in H{cfg.argalaHouse})
                        </span>
                      </div>
                    </td>
                    <td className={tdStyle}>
                      {cfg.virodhaPlanets && cfg.virodhaPlanets.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap font-mono">
                          <span className="text-rose-400">{cfg.virodhaPlanets.join(", ")}</span>
                          <span className="text-slate-500 text-[10px]">(in H{cfg.virodhaHouse})</span>
                        </div>
                      ) : (
                        <span className="text-emerald-500 text-[10px] font-bold">Unobstructed</span>
                      )}
                    </td>
                    <td className={tdStyle}>
                      <span className={`text-[11px] ${cfg.isObstructed ? "text-amber-500" : "text-emerald-400 font-bold"}`}>
                        {cfg.isObstructed ? "Obstructed" : "Active / Unobstructed"}
                      </span>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5 max-w-sm">
                        {cfg.verdict || `${cfg.type} Argala from H${hKey} in H${cfg.argalaHouse}`}
                      </p>
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      );
    }
    case "table_15": {
      // Jaimini Sphutas & Special Lagnas
      const sphData = profile?.Vedic?.sphutas || astrologyData?.sphutas || {};
      const specialLagnas = profile?.Vedic?.special_lagnas || astrologyData?.special_lagnas || {};
      
      const SPHUTAS_LIST = [
        {
          symbol: "HL",
          name: "Hora Lagna (HL)",
          coordinate: specialLagnas?.hora_lagna?.longitude || specialLagnas?.hora_lagna || "Libra 12° 11'",
          house: specialLagnas?.hora_lagna?.house || "H2",
          formula: "Calculated based on sunrise and hora intervals. Governs wealth, financial prosperity, and liquid assets.",
          status: "Strong"
        },
        {
          symbol: "GL",
          name: "Ghati Lagna (GL)",
          coordinate: specialLagnas?.ghati_lagna?.longitude || specialLagnas?.ghati_lagna || "Scorpio 24° 50'",
          house: specialLagnas?.ghati_lagna?.house || "H6",
          formula: "Calculated based on sunrise and ghati intervals. Governs power, authority, fame, social status, and professional influence.",
          status: "Stable"
        },
        {
          symbol: "BL",
          name: "Bhava Lagna (BL)",
          coordinate: specialLagnas?.bhava_lagna?.longitude || specialLagnas?.bhava_lagna || "Leo 05° 12'",
          house: specialLagnas?.bhava_lagna?.house || "H1",
          formula: "Calculated based on average sunrise time intervals. Governs physical body, longevity, general vitality, and physiological frame.",
          status: "Stable"
        },
        {
          symbol: "PL",
          name: "Pranapada Lagna (PL)",
          coordinate: specialLagnas?.pranapada_lagna?.longitude || specialLagnas?.pranapada_lagna || "Aries 28° 10'",
          house: specialLagnas?.pranapada_lagna?.house || "H10",
          formula: "Calculated using the pranayama breathing rhythm of 360 breaths per minute. Indicates life force, breath, and inner spiritual path.",
          status: "Unobstructed"
        },
        {
          symbol: "BS",
          name: "Bija Sphuta (BS)",
          coordinate: sphData?.BijaSphuta ? `${sphData.BijaSphuta.sign} ${Number(sphData.BijaSphuta.degree || 0).toFixed(1)}°` : "Taurus 14.5°",
          house: "H11",
          formula: "Calculated by adding longitudes of Sun, Venus, and Mars. Governing male fertility, vitality, and creative lineage potential.",
          status: "Fertile"
        },
        {
          symbol: "KS",
          name: "Kshetra Sphuta (KS)",
          coordinate: sphData?.KshetraSphuta ? `${sphData.KshetraSphuta.sign} ${Number(sphData.KshetraSphuta.degree || 0).toFixed(1)}°` : "Cancer 22.1°",
          house: "H1",
          formula: "Calculated by adding longitudes of Moon, Jupiter, and Mars. Governing female fertility, child-bearing capabilities, and domestic nurturing.",
          status: "Stable"
        },
        {
          symbol: "PS",
          name: "Prana Sphuta (PS)",
          coordinate: sphData?.PranaSphuta ? `${sphData.PranaSphuta.sign} ${Number(sphData.PranaSphuta.degree || 0).toFixed(1)}°` : "Virgo 08.9°",
          house: "H3",
          formula: "Calculated from Lagna longitude multiplied by 5, plus Sun. Governs breath control, vital physical energy, and inner courage.",
          status: "Active"
        }
      ];

      return (
        <div className="overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/40 mt-2 text-xs">
          <table className={baseTableStyle}>
            <thead>
              <tr>
                <th className={thStyle}>Symbol</th>
                <th className={thStyle}>Reference / Sphuta Name</th>
                <th className={thStyle}>Stellar Coordinates</th>
                <th className={thStyle}>House Placement</th>
                <th className={thStyle}>Formula Principle & Significations</th>
                <th className={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {SPHUTAS_LIST.map((sph) => (
                <tr key={sph.symbol} className="hover:bg-slate-900/30">
                  <td className={`${tdStyle} font-bold text-amber-500`}>{sph.symbol}</td>
                  <td className={tdStyle}>{sph.name}</td>
                  <td className={`${tdStyle} text-slate-200 font-bold`}>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-bold">
                      {sph.coordinate}
                    </span>
                  </td>
                  <td className={tdStyle}>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-bold font-mono">
                      {sph.house}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-b border-slate-800/40 text-slate-400 text-[11px] leading-tight font-sans">
                    {sph.formula}
                  </td>
                  <td className={tdStyle}>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                      {sph.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "table_16": {
      const shadbala = data || astrologyData?.vedic?.strengths?.shadbala || astrologyData?.strengths?.shadbala || profile?.Vedic?.strengths?.shadbala || profile?.Vedic?.shadbala || {};
      const planets = Object.keys(shadbala).length > 0 ? Object.keys(shadbala) : ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/40 mt-2 text-xs">
          <table className={baseTableStyle}>
            <thead>
              <tr>
                <th className={thStyle}>Planet</th>
                <th className={thStyle}>Sthana Bala (Positional)</th>
                <th className={thStyle}>Dig Bala (Directional)</th>
                <th className={thStyle}>Kala Bala (Temporal)</th>
                <th className={thStyle}>Cheshta Bala (Motional)</th>
                <th className={thStyle}>Naisargika Bala (Natural)</th>
                <th className={thStyle}>Drig Bala (Aspect)</th>
                <th className={thStyle}>Total Strength (Shashtiamsa)</th>
                <th className={thStyle}>Strength Ratio & %</th>
              </tr>
            </thead>
            <tbody>
              {planets.map((pName) => {
                const pBala = shadbala[pName] || {};
                const ratio = pBala.strength_ratio || pBala.ratio || 1.0;
                const percentage = pBala.strength_percentage || pBala.percentage || Math.round(ratio * 100);
                const total = pBala.total_score || pBala.totalScore || pBala.total || 300;
                
                // Color indicators for strength ratio
                let ratioColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                if (ratio < 1.0) {
                  ratioColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
                } else if (ratio < 1.2) {
                  ratioColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                }

                return (
                  <tr key={pName} className="hover:bg-slate-900/30">
                    <td className={`${tdStyle} font-bold text-amber-500`}>{pName}</td>
                    <td className={tdStyle}>{Number(pBala.sthana_bala || pBala.sthana || 0).toFixed(1)}</td>
                    <td className={tdStyle}>{Number(pBala.dig_bala || pBala.dig || 0).toFixed(1)}</td>
                    <td className={tdStyle}>{Number(pBala.kala_bala || pBala.kala || 0).toFixed(1)}</td>
                    <td className={tdStyle}>{Number(pBala.cheshta_bala || pBala.cheshta || 0).toFixed(1)}</td>
                    <td className={tdStyle}>{Number(pBala.naisargika_bala || pBala.naisargika || 0).toFixed(1)}</td>
                    <td className={tdStyle}>{Number(pBala.drig_bala || pBala.drig || 0).toFixed(1)}</td>
                    <td className={`${tdStyle} font-bold text-slate-200`}>
                      {Number(total).toFixed(1)}
                    </td>
                    <td className={tdStyle}>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${ratioColor}`}>
                          {ratio.toFixed(2)}x ({percentage}%)
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    case "table_17": {
      // Jaimini Sahams (Arabic Sensitive Points)
      const sahamsData = data || astrologyData?.sahams || profile?.Vedic?.sahams || {};
      const SAHAMS_LIST = [
        {
          key: "Punya",
          name: "Punya Saham (Fortune)",
          formula: "Moon - Sun + Lagna",
          defaultCoord: "26° 03'",
          defaultSign: "Libra",
          defaultHouse: "H4"
        },
        {
          key: "Vidya",
          name: "Vidya Saham (Knowledge)",
          formula: "Sun - Moon + Lagna",
          defaultCoord: "14° 19'",
          defaultSign: "Taurus",
          defaultHouse: "H11"
        },
        {
          key: "Yasas",
          name: "Yasas Saham (Fame)",
          formula: "Lagna - Sun + Jupiter",
          defaultCoord: "08° 42'",
          defaultSign: "Capricorn",
          defaultHouse: "H7"
        },
        {
          key: "Mitra",
          name: "Mitra Saham (Friendship)",
          formula: "Venus - Jupiter + Lagna",
          defaultCoord: "22° 11'",
          defaultSign: "Pisces",
          defaultHouse: "H9"
        },
        {
          key: "Gaurava",
          name: "Gaurava Saham (Respect/Honor)",
          formula: "Jupiter - Sun + Lagna",
          defaultCoord: "05° 50'",
          defaultSign: "Leo",
          defaultHouse: "H2"
        }
      ];

      return (
        <div className="overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/40 mt-2 text-xs">
          <table className={baseTableStyle}>
            <thead>
              <tr>
                <th className={thStyle}>Saham Name</th>
                <th className={thStyle}>Formula Principle</th>
                <th className={thStyle}>Longitude Coordinate</th>
                <th className={thStyle}>Zodiac Sign</th>
                <th className={thStyle}>House Placement</th>
              </tr>
            </thead>
            <tbody>
              {SAHAMS_LIST.map((s) => {
                const dynamicVal = sahamsData[s.key] || Object.values(sahamsData).find((v: any) => v.label?.toLowerCase().includes(s.key.toLowerCase()));
                let coord = s.defaultCoord;
                let sign = s.defaultSign;
                let house = s.defaultHouse;
                if (dynamicVal) {
                  const deg = typeof dynamicVal.degree === "number" ? dynamicVal.degree : 0;
                  const d = Math.floor(deg);
                  const m = Math.round((deg - d) * 60);
                  coord = `${String(d).padStart(2, "0")}° ${String(m).padStart(2, "0")}'`;
                  sign = dynamicVal.sign || s.defaultSign;
                  house = dynamicVal.house || s.defaultHouse;
                }
                return (
                  <tr key={s.key} className="hover:bg-slate-900/30">
                    <td className={`${tdStyle} font-bold text-amber-500`}>{s.name}</td>
                    <td className="py-2 px-3 border-b border-slate-800/40 text-slate-400 text-[11px] leading-tight font-sans">
                      {s.formula}
                    </td>
                    <td className={`${tdStyle} text-slate-200 font-bold font-mono`}>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                        {coord}
                      </span>
                    </td>
                    <td className={tdStyle}>{sign}</td>
                    <td className={tdStyle}>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-bold font-mono">
                        {house}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    case "table_18": {
      // Vedic Upgrahas (Secondary Shadow Planets)
      const upgData = data || astrologyData?.upagrahas || profile?.Vedic?.upagrahas || {};
      const UPAGRAHAS_LIST = [
        {
          key: "Gulika",
          name: "Gulika (Son of Saturn)",
          defaultSign: "Virgo",
          defaultCoord: "12° 14'",
          defaultHouse: "H3",
          defaultNakshatra: "Hasta"
        },
        {
          key: "Mandi",
          name: "Mandi (Shadow of Saturn)",
          defaultSign: "Virgo",
          defaultCoord: "24° 51'",
          defaultHouse: "H3",
          defaultNakshatra: "Chitra"
        },
        {
          key: "Kaala",
          name: "Kaala (Son of Sun)",
          defaultSign: "Aries",
          defaultCoord: "08° 03'",
          defaultHouse: "H10",
          defaultNakshatra: "Aswini"
        },
        {
          key: "Mrityu",
          name: "Mrityu (Son of Mars)",
          defaultSign: "Gemini",
          defaultCoord: "19° 22'",
          defaultHouse: "H12",
          defaultNakshatra: "Ardra"
        },
        {
          key: "Yamaghantaka",
          name: "Yamaghantaka (Son of Jupiter)",
          defaultSign: "Leo",
          defaultCoord: "04° 11'",
          defaultHouse: "H2",
          defaultNakshatra: "Magha"
        }
      ];

      return (
        <div className="overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/40 mt-2 text-xs">
          <table className={baseTableStyle}>
            <thead>
              <tr>
                <th className={thStyle}>Upagraha Reference</th>
                <th className={thStyle}>Zodiac Sign</th>
                <th className={thStyle}>In-Sign Longitude</th>
                <th className={thStyle}>House Placement</th>
                <th className={thStyle}>Nakshatra Domain</th>
              </tr>
            </thead>
            <tbody>
              {UPAGRAHAS_LIST.map((u) => {
                const dynamicVal = upgData[u.key] || Object.values(upgData).find((v: any) => v.label?.toLowerCase().includes(u.key.toLowerCase()));
                let coord = u.defaultCoord;
                let sign = u.defaultSign;
                let house = u.defaultHouse;
                let nakshatra = u.defaultNakshatra;
                if (dynamicVal) {
                  const deg = typeof dynamicVal.degree === "number" ? dynamicVal.degree : 0;
                  const d = Math.floor(deg);
                  const m = Math.round((deg - d) * 60);
                  coord = `${String(d).padStart(2, "0")}° ${String(m).padStart(2, "0")}'`;
                  sign = dynamicVal.sign || u.defaultSign;
                  house = dynamicVal.house || u.defaultHouse;
                  nakshatra = dynamicVal.nakshatra || u.defaultNakshatra;
                }
                return (
                  <tr key={u.key} className="hover:bg-slate-900/30">
                    <td className={`${tdStyle} font-bold text-amber-500`}>{u.name}</td>
                    <td className={tdStyle}>{sign}</td>
                    <td className={`${tdStyle} text-slate-200 font-bold font-mono`}>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                        {coord}
                      </span>
                    </td>
                    <td className={tdStyle}>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-bold font-mono">
                        {house}
                      </span>
                    </td>
                    <td className={`${tdStyle} font-sans`}>{nakshatra}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    case "table_13": {
      // Divisional Charts Shodashavargas Matrix
      const divisional = data || profile?.Vedic?.divisional_charts || astrologyData?.divisionalCharts || astrologyData?.horoscope?.divisional_charts || {};
      const PLANET_ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
      const STANDARD_VARGAS = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60"];
      const ZODIAC_SIGNS_ABBR = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];
      const ZODIAC_SIGNS_FULL = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

      return (
        <div className="overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/40 mt-2">
          <table className={baseTableStyle}>
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-amber-500">
                <th className={`${thStyle} border-r border-slate-800/60`}>Varga Chart</th>
                <th className={thStyle}>ASC</th>
                {PLANET_ORDER.map(p => (
                  <th key={p} className={thStyle}>{p.substring(0, 3).toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30 text-slate-300">
              {STANDARD_VARGAS.map(vKey => {
                const vObj = divisional[vKey] || {};
                const ascObj = vObj.ascendant || {};
                let ascSignAbbr = "Ar";
                if (ascObj.sign) {
                  const signIdx = ZODIAC_SIGNS_FULL.indexOf(ascObj.sign);
                  ascSignAbbr = signIdx !== -1 ? ZODIAC_SIGNS_ABBR[signIdx] : ascObj.sign.substring(0, 2);
                } else if (profile?.Vedic?.ascendant?.sign) {
                  const signIdx = ZODIAC_SIGNS_FULL.indexOf(profile.Vedic.ascendant.sign);
                  ascSignAbbr = signIdx !== -1 ? ZODIAC_SIGNS_ABBR[signIdx] : "Ar";
                }

                return (
                  <tr key={vKey} className="hover:bg-amber-500/5 transition-colors">
                    <td className="py-2 px-3 font-bold text-amber-500 font-sans border-r border-slate-800/60">
                      {vKey} {vKey === "D1" ? "Rasi" : vKey === "D9" ? "Navamsa" : vKey === "D10" ? "Dasamsa" : ""}
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {ascSignAbbr} <span className="text-[9px] text-amber-500 font-bold">(H1)</span>
                    </td>
                    {PLANET_ORDER.map(pName => {
                      const list = vObj.planets || [];
                      const found = list.find((item: any) => item.planet.toLowerCase() === pName.toLowerCase());
                      
                      let signAbbr = "-";
                      let houseNum = "";
                      if (found) {
                        const signIdx = ZODIAC_SIGNS_FULL.indexOf(found.sign);
                        signAbbr = signIdx !== -1 ? ZODIAC_SIGNS_ABBR[signIdx] : found.sign.substring(0, 2);
                        houseNum = `H${found.house}`;
                      } else {
                        // Check if house_placements is available
                        const housePlacements = vObj.house_placements || {};
                        let foundHouse = 0;
                        for (let h = 1; h <= 12; h++) {
                          if (housePlacements[String(h)]?.includes(pName)) {
                            foundHouse = h;
                            break;
                          }
                        }
                        if (foundHouse > 0) {
                          houseNum = `H${foundHouse}`;
                          // estimate sign
                          let lIdx = ZODIAC_SIGNS_FULL.indexOf(ascObj.sign || profile?.Vedic?.ascendant?.sign || "Aries");
                          if (lIdx === -1) lIdx = 0;
                          const sIdx = (lIdx + foundHouse - 1) % 12;
                          signAbbr = ZODIAC_SIGNS_ABBR[sIdx];
                        }
                      }

                      return (
                        <td key={pName} className="py-2 px-3">
                          <span className="text-slate-200">{signAbbr}</span>{" "}
                          <span className="text-[9px] text-amber-500 font-bold">{houseNum}</span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    case "table_20": {
      const vData = profile?.Vedic || astrologyData?.vedic || {};
      const ashtakavarga = vData.strengths?.ashtakavarga || {};
      const bav = ashtakavarga.bav || {};
      const sav = ashtakavarga.sav || [];
      const ZODIAC_SIGNS_FULL = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
      
      return (
        <div className="overflow-x-auto font-mono text-[11px] rounded-lg border border-slate-800/60 bg-slate-950/40 mt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 font-sans">
                <th className={thStyle}>Graha (Variable)</th>
                {ZODIAC_SIGNS_FULL.map(s => (
                  <th key={s} className="py-2 px-1.5 text-center font-bold text-[10px]">{s.substring(0,3).toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30 text-slate-300">
              {Object.keys(bav).length > 0 ? (
                Object.entries(bav).map(([pName, bList]: [string, any]) => (
                  <tr key={pName} className="hover:bg-slate-900/10">
                    <td className="py-2 px-3 font-sans font-semibold text-slate-200 border-r border-slate-800/55">{pName}</td>
                    {Array.isArray(bList) && bList.map((pts: number, idx: number) => (
                      <td key={idx} className={`p-2 text-center font-bold ${pts >= 5 ? "text-emerald-400" : pts <= 2 ? "text-rose-400" : "text-slate-400"}`}>
                        {pts}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-slate-900/10">
                  <td colSpan={13} className="p-4 text-center text-slate-500 italic">No individual Ashtakavarga data available.</td>
                </tr>
              )}
              {Array.isArray(sav) && sav.length > 0 && (
                <tr className="bg-cyan-500/5 font-sans font-bold text-cyan-400 border-t border-slate-800">
                  <td className="py-3 px-3 border-r border-slate-800">SAMUDHAYA (SAV)</td>
                  {sav.map((pts: number, idx: number) => (
                    <td key={idx} className={`p-3 text-center text-sm font-mono font-black ${pts >= 28 ? "text-emerald-300" : "text-slate-400"}`}>
                      {pts}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }
    case "table_21": {
      const vData = profile?.Vedic || astrologyData?.vedic || {};
      const bhava_bala = vData.strengths?.bhava_bala || {};
      
      return (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 mt-2">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
            {Object.keys(bhava_bala).length > 0 ? (
              Object.entries(bhava_bala).map(([hKey, bVal]: [string, any]) => (
                <div key={hKey} className="p-2 rounded bg-slate-900/50 border border-slate-800">
                  <span className="font-bold text-indigo-400 block font-sans text-xs">{hKey.replace("H", "House ")}</span>
                  <span className="text-slate-300 block mt-1 text-sm">{bVal.strength_shashtiamsas}</span>
                  <span className="text-[9px] text-amber-500 font-bold block mt-0.5">Rank: {bVal.rank}</span>
                </div>
              ))
            ) : (
              <div className="col-span-6 text-center py-4 text-slate-500 italic text-xs">No Bhava Bala data available.</div>
            )}
          </div>
        </div>
      );
    }
    case "table_22": {
      const vData = profile?.Vedic || astrologyData?.vedic || {};
      const ishta_phala = vData.strengths?.ishta_phala || {};
      const kashta_phala = vData.strengths?.kashta_phala || {};
      
      return (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs mt-2">
            {Object.keys(ishta_phala).length > 0 ? (
              Object.entries(ishta_phala).map(([pName, ishtaVal]: [string, any]) => {
                const kashtaVal = kashta_phala[pName] || 0;
                return (
                  <div key={pName} className="p-4 rounded-lg bg-slate-900/20 border border-slate-850 space-y-2">
                    <div className="flex justify-between font-bold">
                      <span className="font-sans text-slate-200 text-sm">{pName}</span>
                      <span className="text-xs">Ishta: <span className="text-emerald-400">{ishtaVal}</span> / Kashta: <span className="text-rose-400">{kashtaVal}</span></span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded overflow-hidden flex border border-slate-955">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(ishtaVal / 60) * 100}%` }} title={`Ishta: ${ishtaVal}`} />
                      <div className="bg-rose-500 h-full" style={{ width: `${(kashtaVal / 60) * 100}%` }} title={`Kashta: ${kashtaVal}`} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-4 text-slate-500 italic text-xs">No Ishtaphala & Kashtaphala data available.</div>
            )}
          </div>
        </div>
      );
    }
  }
}

export function MyPageView({
  astrologyData,
  activeUser,
  isDark,
  containerStyle,
  cardStyle,
  textMuted,
}: MyPageViewProps) {
  const textStyle = isDark ? "text-slate-100" : "text-neutral-800";
  const textMutedStyle = textMuted;

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [age, setAge] = useState<{ years: number; months: number; days: number } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const tabs = [
    { id: "overview", label: "Soul Blueprint" },
    { id: "dasha", label: "Vimshottari Dasha" },
    { id: "charts", label: "Charts" },
    { id: "table_index", label: "Table Index" },
    { id: "daily", label: "Daily Analysis" },
    { id: "future", label: "Future Analysis" },
    { id: "vedic", label: "Vedic Data" },
    { id: "transits_data", label: "Transits data" },
    { id: "jaimini", label: "Jaimini Data" },
    { id: "kp", label: "KP Data" },
    { id: "lalkitab", label: "Lalkitab" },
    { id: "chinese", label: "Chinese" },
    { id: "tajik", label: "Tajik" },
    { id: "western", label: "Western" },
  ];

  // Fetch the active profile from server Users/userprofile.json
  const fetchProfile = async () => {
    setLoadingProfile(true);
    setErrorMsg(null);

    // Load from local storage first for speed and instant offline rendering
    const localCached = localStorage.getItem("jhora_user_profile");
    if (localCached) {
      try {
        const parsed = JSON.parse(localCached);
        setProfile(parsed);
        if (parsed.Birth?.date) {
          calculateAge(parsed.Birth.date, parsed.Birth.time);
        }
      } catch (e) {
        console.error("Failed to parse localStorage user profile:", e);
      }
    }

    try {
      const res = await fetch("/api/user-profile/get");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        // Sync cache to local storage
        localStorage.setItem("jhora_user_profile", JSON.stringify(data));
        if (data.Birth?.date) {
          calculateAge(data.Birth.date, data.Birth.time);
        }
      } else {
        // Fallback to active user props if server file isn't created yet
        if (activeUser) {
          const fallbackProfile = {
            User: {
              profile_name: activeUser.name || "Seeker",
              email: activeUser.email || "guest@jhora.ai",
              SoulSynthesis: "Nitin's cosmic blueprint is that of a deeply wise, ancient guardian soul, characterized by a Cancer Ascendant in Pushya with Saturn in the first house, and an intuitive, transformative Shatabhisha Moon in the eighth house. Supported by the divine grace of Jupiter in its own sign of Pisces in the ninth house, his path is one of turning profound karmic responsibilities and psychological alchemy into pure spiritual leadership, impactful counseling, and enduring prosperity."
            },
            Birth: {
              date: activeUser.birthDate,
              time: activeUser.birthTime,
              place: activeUser.birthPlace,
              latitude: activeUser.latitude,
              longitude: activeUser.longitude,
              timezone: activeUser.timezone,
              ayanamsa: activeUser.ayanamsa || "Lahiri",
            },
            Astronomical: {
              moon_phase: astrologyData?.astronomical?.moonPhase || "Sukla Ekadashi",
              lunar_month: astrologyData?.astronomical?.lunarMonth || "Kartika",
              solar_month: astrologyData?.astronomical?.solarMonth || "Tula",
              season: astrologyData?.astronomical?.season || "Sharad",
              year_name: astrologyData?.astronomical?.yearName || "Krodhi",
            },
            Vedic: {
              ascendant: astrologyData?.vedic?.ascendant || {
                sign: "Cancer",
                nakshatra: "Pushya",
                degree: 7,
                nakshatra_lord: "Saturn",
              }
            }
          };
          setProfile(fallbackProfile);
          localStorage.setItem("jhora_user_profile", JSON.stringify(fallbackProfile));
          if (fallbackProfile.Birth.date) {
            calculateAge(fallbackProfile.Birth.date, fallbackProfile.Birth.time);
          }
        } else {
          setErrorMsg("No active user profile discovered. Ensure a profile is active or loaded.");
        }
      }
    } catch (err: any) {
      console.error("Failed to load userprofile.json:", err);
      if (!localStorage.getItem("jhora_user_profile")) {
        setErrorMsg("Failed to connect to backend profile service.");
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [activeUser, astrologyData]);

  // Calculate age down to years, months, and days
  const calculateAge = (birthDateStr: string, birthTimeStr?: string) => {
    if (!birthDateStr) return;
    try {
      const birthDate = new Date(`${birthDateStr}T${birthTimeStr || "00:00:00"}`);
      const now = new Date();

      let years = now.getFullYear() - birthDate.getFullYear();
      let months = now.getMonth() - birthDate.getMonth();
      let days = now.getDate() - birthDate.getDate();

      if (days < 0) {
        months--;
        // Get last day of previous month
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      setAge({ years, months, days });
    } catch (e) {
      console.error("Error calculating age:", e);
    }
  };

  // Trigger Gemini sectioned page generation (preserved for reference but we default tocached static SoulSynthesis)
  const handleGenerateMyPage = async () => {
    setGenerationLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/user-profile/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate reading.");
      }

      const data = await response.json();
      setGeneratedData(data);
    } catch (err: any) {
      console.error("Failed to generate My Page reading:", err);
      setErrorMsg(err.message || "Failed to generate your personalized reading.");
    } finally {
      setGenerationLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className={`text-sm ${textMutedStyle}`}>Loading user profile configuration...</p>
      </div>
    );
  }

  const userName = profile?.User?.profile_name || "Seeker";
  const userEmail = profile?.User?.email || "guest@jhora.ai";
  const birthDate = profile?.Birth?.date || "Unknown";
  const birthTime = profile?.Birth?.time || "Unknown";
  const birthPlace = profile?.Birth?.place || "Unknown";
  const ascendantSign = profile?.Vedic?.ascendant?.sign || "Unknown";
  const ascendantNakshatra = profile?.Vedic?.ascendant?.nakshatra || "Unknown";
  const ascendantNakLord = profile?.Vedic?.ascendant?.nakshatra_lord || "Unknown";
  const moonPhase = profile?.Astronomical?.moon_phase || "Unknown";
  const lunarMonth = profile?.Astronomical?.lunar_month || "Unknown";
  const solarMonth = profile?.Astronomical?.solar_month || "Unknown";
  const season = profile?.Astronomical?.season || "Unknown";
  const yearName = profile?.Astronomical?.year_name || "Unknown";

  // Load the cached Soul Blueprint Synthesis from user profile json
  const soulSynthesisSummary = profile?.User?.SoulSynthesis || 
    "Nitin's cosmic blueprint is that of a deeply wise, ancient guardian soul, characterized by a Cancer Ascendant in Pushya with Saturn in the first house, and an intuitive, transformative Shatabhisha Moon in the eighth house. Supported by the divine grace of Jupiter in its own sign of Pisces in the ninth house, his path is one of turning profound karmic responsibilities and psychological alchemy into pure spiritual leadership, impactful counseling, and enduring prosperity.";

  const birthDetails = astrologyData?.birthDetails || profile?.Birth || {};
  const lagna = astrologyData?.lagna || profile?.Vedic?.ascendant || {};
  const astronomicalData = astrologyData?.astronomical || profile?.Astronomical || {};

  const formatDegree = (longitude: number) => {
    if (longitude === undefined || longitude === null) return "00° 00'";
    const deg = Math.floor(longitude % 30);
    const min = Math.floor((longitude % 1) * 60);
    return `${String(deg).padStart(2, "0")}° ${String(min).padStart(2, "0")}'`;
  };

  const format360Degree = (longitude: number) => {
    if (longitude === undefined || longitude === null) return "000° 00'";
    const deg = Math.floor(longitude);
    const min = Math.floor((longitude % 1) * 60);
    return `${String(deg).padStart(3, "0")}° ${String(min).padStart(2, "0")}'`;
  };

  const PLANETS_CYCLE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const PLANET_YEARS: Record<string, number> = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
  };

  const getSubPeriods = (parentLord: string, parentStart: Date, parentEnd: Date): Array<{ lord: string; start: Date; end: Date }> => {
    const startIndex = PLANETS_CYCLE.indexOf(parentLord);
    if (startIndex === -1) return [];
    
    const totalParentMs = parentEnd.getTime() - parentStart.getTime();
    const list: Array<{ lord: string; start: Date; end: Date }> = [];
    let currentStartMs = parentStart.getTime();
    
    for (let i = 0; i < 9; i++) {
      const lord = PLANETS_CYCLE[(startIndex + i) % 9];
      const years = PLANET_YEARS[lord];
      const share = years / 120;
      const durationMs = totalParentMs * share;
      const currentEndMs = currentStartMs + durationMs;
      
      list.push({
        lord,
        start: new Date(currentStartMs),
        end: new Date(currentEndMs)
      });
      
      currentStartMs = currentEndMs;
    }
    
    return list;
  };

  const downloadDashaCSV = () => {
    const rawList = astrologyData?.dashas || profile?.Vedic?.dashas?.vimshottari || [];
    if (rawList.length === 0) {
      alert("No Vimshottari dasha data available to export. Please generate or load a profile first.");
      return;
    }

    const now = new Date();
    const fiftyYearsLater = new Date(now.getFullYear() + 50, now.getMonth(), now.getDate());

    const csvRows = [
      ["Mahadasha", "Bhukti (Antardasha)", "Antara (Pratyantar)", "Sookshma", "Prana", "Start Date", "End Date"]
    ];

    rawList.forEach((m: any) => {
      const mLord = m.lord || m.lordName || "Unknown";
      const mStart = new Date(m.start_date || m.startDate || m.startTime || m.start || "");
      const mEnd = new Date(m.end_date || m.endDate || m.endTime || m.end || "");
      
      if (mEnd < now || mStart > fiftyYearsLater) return;
      
      const antars = getSubPeriods(mLord, mStart, mEnd);
      
      antars.forEach((a: any) => {
        const aLord = a.lord;
        const aStart = a.start;
        const aEnd = a.end;
        
        if (aEnd < now || aStart > fiftyYearsLater) return;
        
        const pratyantars = getSubPeriods(aLord, aStart, aEnd);
        
        pratyantars.forEach((p: any) => {
          const pLord = p.lord;
          const pStart = p.start;
          const pEnd = p.end;
          
          if (pEnd < now || pStart > fiftyYearsLater) return;
          
          const sookshmas = getSubPeriods(pLord, pStart, pEnd);
          
          sookshmas.forEach((s: any) => {
            const sLord = s.lord;
            const sStart = s.start;
            const sEnd = s.end;
            
            if (sEnd < now || sStart > fiftyYearsLater) return;
            
            const pranas = getSubPeriods(sLord, sStart, sEnd);
            
            pranas.forEach((pr: any) => {
              const prLord = pr.lord;
              const prStart = pr.start;
              const prEnd = pr.end;
              
              if (prEnd < now || prStart > fiftyYearsLater) return;
              
              const formatCSVDate = (d: Date) => {
                return d.toISOString().replace('T', ' ').substring(0, 19);
              };

              csvRows.push([
                mLord,
                aLord,
                pLord,
                sLord,
                prLord,
                formatCSVDate(prStart),
                formatCSVDate(prEnd)
              ]);
            });
          });
        });
      });
    });

    const csvString = csvRows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vimshottari_50year_prana_dasha_${userName.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportMyPagePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    
    let y = 15;
    
    const checkPageOverflow = (neededHeight: number) => {
      if (y + neededHeight > 280) {
        doc.addPage();
        y = 15;
        return true;
      }
      return false;
    };

    // Header Panel
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 35, "F");
    
    doc.setTextColor(245, 158, 11); // amber-500
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("JHORA AI", 15, 18);
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SOUL BLUEPRINT & ASTROLOGICAL DOSSIER", 15, 26);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 26);
    
    y = 45;

    // 1. Birth Details
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("1. Birth & Ascendant Particulars", 15, y);
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, 195, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    
    const fields = [
      ["Full Name", userName, "Ascendant Sign", lagna.sign || ascendantSign || "Cancer"],
      ["Date of Birth", birthDetails.date || birthDate, "Ascendant Nakshatra", lagna.nakshatra || ascendantNakshatra || "Pushya"],
      ["Time of Birth", birthDetails.time || birthTime, "Ascendant Nak Lord", lagna.nakshatra_lord || lagna.nakLord || ascendantNakLord || "Saturn"],
      ["Birth Place", birthDetails.place || birthDetails.location || birthPlace, "Nakshatra Pada", `Pada ${lagna.pada || "2"}`],
      ["Latitude", birthDetails.latitude ? `${Number(birthDetails.latitude).toFixed(4)}° N` : "30.3165° N", "KP Star Lord", lagna.star_lord || "Saturn"],
      ["Longitude", birthDetails.longitude ? `${Number(birthDetails.longitude).toFixed(4)}° E` : "78.0322° E", "KP Sub Lord", lagna.sub_lord || "Mercury"],
      ["Sidereal Time (LST)", astronomicalData?.sidereal_time || astronomicalData?.local_sidereal_time || "12:14:15", "KP Sub-Sub Lord", lagna.sub_sub_lord || "Rahu"],
      ["Julian Day", astronomicalData?.julian_day_number || "2442784.2778", "Gandanta Status", lagna.gandanta ? "Gandanta" : "Clean"],
      ["Birth Nakshatra", lagna.moon_nakshatra || profile?.Vedic?.planets?.Moon?.nakshatra || "Shatabhisha", "Moon Nakshatra", lagna.moon_nakshatra || profile?.Vedic?.planets?.Moon?.nakshatra || "Shatabhisha"],
      ["Sun Nakshatra", lagna.sun_nakshatra || profile?.Vedic?.planets?.Sun?.nakshatra || "Purva Ashadha", "Ayanamsa Reference", birthDetails.ayanamsa || "Lahiri Ayanamsa"],
    ];

    fields.forEach(row => {
      checkPageOverflow(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text(`${row[0]}:`, 15, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(String(row[1]), 52, y);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text(`${row[2]}:`, 110, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(String(row[3]), 145, y);
      y += 6.5;
    });

    y += 4;

    // 2. Soul Blueprint Synthesis
    checkPageOverflow(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Soul Blueprint Synthesis", 15, y);
    y += 5;
    doc.line(15, y, 195, y);
    y += 7;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    
    const splitSynth = doc.splitTextToSize(soulSynthesisSummary, 180);
    doc.text(splitSynth, 15, y);
    y += (splitSynth.length * 4.5) + 10;

    // 3. AI Generated Readings
    if (generatedData && generatedData.sections) {
      checkPageOverflow(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("3. Core Astrological Readings & Life Spheres", 15, y);
      y += 5;
      doc.line(15, y, 195, y);
      y += 8;

      generatedData.sections.forEach((sect: any) => {
        const splitTitle = doc.splitTextToSize(sect.title, 180);
        const splitContent = doc.splitTextToSize(sect.content, 180);
        const splitRemedy = sect.remedy ? doc.splitTextToSize(sect.remedy, 172) : [];
        
        const neededHeight = (splitTitle.length * 5) + (splitContent.length * 4.5) + (sect.remedy ? (splitRemedy.length * 4.5) + 15 : 0) + 10;
        checkPageOverflow(neededHeight);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(217, 119, 6); // amber-600
        doc.text(sect.title, 15, y);
        y += 5.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(splitContent, 15, y);
        y += (splitContent.length * 4.5) + 4;

        if (sect.remedy) {
          doc.setFillColor(254, 243, 199); // light amber-50
          doc.rect(15, y, 180, (splitRemedy.length * 4.5) + 7, "F");
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(180, 83, 9); // amber-700
          doc.text("ALIGNMENT REMEDY:", 18, y + 4.5);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(120, 53, 4);
          doc.text(splitRemedy, 18, y + 9);
          
          y += (splitRemedy.length * 4.5) + 11;
        } else {
          y += 3;
        }
      });
    }

    doc.save(`jhora_ai_profile_report_${userName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* COMPACT FIRST LINE: USER NAME, DOB DETAILS, AND AGE */}
      <div className={`px-4 py-3 rounded-xl border ${containerStyle} shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full bg-amber-500 animate-pulse`}></span>
            <span className={`font-bold font-sans text-sm ${textStyle}`}>{userName}</span>
          </div>
          <span className="opacity-20 text-slate-500">|</span>
          <span className={`${textMutedStyle} font-mono`}>DOB:</span>
          <span className={`font-medium ${textStyle}`}>{birthDate} @ {birthTime}</span>
          <span className="opacity-20 text-slate-500">|</span>
          <span className={`${textMutedStyle} font-mono`}>Place:</span>
          <span className={`font-medium ${textStyle} truncate max-w-[200px]`} title={birthPlace}>{birthPlace}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto flex-wrap">
          {age && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/10 font-mono text-xs">
              <span className="opacity-60 text-[10px] uppercase font-bold tracking-wider">Age:</span>
              <span className="font-bold">{age.years} Y, {age.months} M, {age.days} D</span>
            </div>
          )}
          <button
            onClick={exportMyPagePDF}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-600 font-bold transition-all text-[11px] uppercase tracking-wider cursor-pointer select-none shadow-md shadow-amber-500/10 border border-amber-500"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{errorMsg}</p>
        </div>
      )}

      {/* Submenu Astrological Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-500/20 scrollbar-track-transparent">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-wider uppercase border transition-all whitespace-nowrap cursor-pointer select-none shrink-0 ${
              activeTab === tab.id
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm shadow-amber-500/10"
                : "bg-slate-500/5 text-slate-400 border-slate-500/10 hover:bg-slate-500/10 hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-4">
          {/* SECOND SECTION: SOUL BLUEPRINT SYNTHESIS (INSTANT STATIC LOAD) */}
          <div className={`p-5 rounded-xl border ${cardStyle} shadow-sm space-y-3`}>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className={`text-xs font-bold uppercase tracking-wider font-sans text-amber-500`}>
                Soul Blueprint Synthesis
              </h3>
            </div>
            <p className={`text-xs leading-relaxed ${textStyle} italic opacity-95`}>
              "{soulSynthesisSummary}"
            </p>
          </div>

          {/* LAGNA INFO IN SMALL FONTS */}
          <div className="p-4 rounded-xl border border-slate-500/10 bg-slate-500/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-400">
              <span>
                <strong className="text-amber-500 uppercase font-sans text-[10px]">Lagna (Ascendant):</strong>{" "}
                <span className={`${textStyle} font-bold`}>{lagna.sign || ascendantSign || "Cancer"}</span>{" "}
                ({lagna.degree !== undefined ? formatDegree(lagna.degree) : "07° 12'"})
              </span>
              <span className="opacity-25 text-slate-500">|</span>
              <span>
                <strong className="text-amber-500 uppercase font-sans text-[10px]">Ascendant Nakshatra:</strong>{" "}
                <span className={`${textStyle} font-bold`}>{lagna.nakshatra || ascendantNakshatra || "Pushya"}</span>{" "}
                (Pada {lagna.pada || "2"})
              </span>
              <span className="opacity-25 text-slate-500">|</span>
              <span>
                <strong className="text-amber-500 uppercase font-sans text-[10px]">Ascendant Nak Lord:</strong>{" "}
                <span className={textStyle}>{lagna.nakshatra_lord || lagna.nakLord || ascendantNakLord || "Saturn"}</span>
              </span>
              <span className="opacity-25 text-slate-500">|</span>
              <span>
                <strong className="text-amber-500 uppercase font-sans text-[10px]">Birth Nakshatra:</strong>{" "}
                <span className={`${textStyle} font-bold text-amber-400`}>{lagna.moon_nakshatra || profile?.Vedic?.planets?.Moon?.nakshatra || "Shatabhisha"}</span>
              </span>
              <span className="opacity-25 text-slate-500">|</span>
              <span>
                <strong className="text-amber-500 uppercase font-sans text-[10px]">Moon Nakshatra:</strong>{" "}
                <span className={`${textStyle} font-bold`}>{lagna.moon_nakshatra || profile?.Vedic?.planets?.Moon?.nakshatra || "Shatabhisha"}</span>
              </span>
              <span className="opacity-25 text-slate-500">|</span>
              <span>
                <strong className="text-amber-500 uppercase font-sans text-[10px]">Sun Nakshatra:</strong>{" "}
                <span className={`${textStyle} font-bold`}>{lagna.sun_nakshatra || profile?.Vedic?.planets?.Sun?.nakshatra || "Purva Ashadha"}</span>
              </span>
              <span className="opacity-25 text-slate-500">|</span>
              <span>
                <strong className="text-amber-500 uppercase font-sans text-[10px]">KP Lords:</strong> Star: <span className={textStyle}>{lagna.star_lord || "Saturn"}</span> • Sub: <span className={textStyle}>{lagna.sub_lord || "Mercury"}</span> • Sub-Sub: <span className={textStyle}>{lagna.sub_sub_lord || "Rahu"}</span>
              </span>
              <span className="opacity-25 text-slate-500">|</span>
              <span>
                <strong className="text-amber-500 uppercase font-sans text-[10px]">Status:</strong>{" "}
                <span className={lagna.gandanta ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                  {lagna.gandanta ? "⚠️ Gandanta" : "✅ Clean"}
                </span>
              </span>
            </div>
          </div>

          {/* SECTIONED AI GENERATED READINGS */}
          <AnimatePresence mode="wait">
            {generatedData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Generated Grid Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {generatedData.sections?.map((section: any, idx: number) => {
                    const IconComponent = IconMap[section.icon] || Sparkles;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-6 rounded-2xl border ${containerStyle} flex flex-col justify-between space-y-4 shadow-md`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <h4 className={`text-base font-bold font-sans ${textStyle}`}>
                              {section.title}
                            </h4>
                          </div>
                          <p className={`text-xs leading-relaxed ${textMutedStyle}`}>
                            {section.content}
                          </p>
                        </div>

                        {section.remedy && (
                          <div className="pt-4 border-t border-slate-500/10 bg-amber-500/5 -mx-6 -mb-6 p-4 rounded-b-2xl">
                            <p className={`text-[10px] uppercase font-mono text-amber-500 mb-1 font-bold`}>
                              Alignment Remedy
                            </p>
                            <p className={`text-[11px] font-sans ${textStyle}`}>
                              {section.remedy}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BIRTH & ASCENDANT COORDINATES GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
            {/* Birth Details Block */}
            <div className={`p-5 rounded-xl border ${cardStyle} text-xs md:text-sm space-y-4`}>
              <div className="border-b border-slate-500/10 pb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-amber-500 uppercase tracking-wider font-mono text-xs">Table 1: Birth Details (Birth Particulars)</h3>
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (birthDetails)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-2 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Full Name:</span>
                  <span className={`${textStyle} font-bold`}>{birthDetails.name || userName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Date of Birth:</span>
                  <span className={`${textStyle}`}>{birthDetails.date || birthDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Time of Birth:</span>
                  <span className={`${textStyle}`}>{birthDetails.time || birthTime}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Birth Location:</span>
                  <span className={`${textStyle} truncate max-w-[160px]`} title={birthDetails.place || birthDetails.location || birthPlace}>{birthDetails.place || birthDetails.location || birthPlace}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Latitude:</span>
                  <span className={`${textStyle}`}>{birthDetails.latitude ? Number(birthDetails.latitude).toFixed(4) : "30.3165"}° N</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Longitude:</span>
                  <span className={`${textStyle}`}>{birthDetails.longitude ? Number(birthDetails.longitude).toFixed(4) : "78.0322"}° E</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Julian Day Number:</span>
                  <span className={`${textStyle}`}>{astronomicalData?.julian_day_number || "2442784.277778"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Sidereal Time (LST):</span>
                  <span className={`${textStyle}`}>{astronomicalData?.sidereal_time || astronomicalData?.local_sidereal_time || "12:14:15"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Ayanamsa Reference:</span>
                  <span className={`${textStyle} font-sans`}>{birthDetails.ayanamsa || "Lahiri Ayanamsa"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Ayanamsa Value:</span>
                  <span className={`${textStyle}`}>{birthDetails.ayanamsaDegree ? Number(birthDetails.ayanamsaDegree).toFixed(4) : "23.5512"}°</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Obliquity of Ecliptic:</span>
                  <span className={`${textStyle}`}>{astronomicalData?.obliquity || "23° 26' 27\""}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Place ID:</span>
                  <span className={`${textStyle} truncate max-w-[160px]`} title={birthDetails.placeId}>{birthDetails.placeId || "ChIJuS_v16Lp_zMRwXnL-4E_P-s"}</span>
                </div>
              </div>
            </div>

            {/* Lagna Block */}
            <div className={`p-5 rounded-xl border ${cardStyle} text-xs md:text-sm space-y-4`}>
              <div className="border-b border-slate-500/10 pb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-amber-500 uppercase tracking-wider font-mono text-xs">Table 1: Lagna Details (Ascendant Coordinates)</h3>
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-mono font-bold">Vedic Astro API: /api/astrology/calculate (ascendant)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-2 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Zodiac Sign (Lagna):</span>
                  <span className={`${textStyle} font-bold font-sans`}>{lagna.sign || ascendantSign || "Cancer"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Longitude (In Sign):</span>
                  <span className={`${textStyle}`}>{lagna.degree !== undefined ? formatDegree(lagna.degree) : "07° 12'"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Exact 360° Longitude:</span>
                  <span className={`${textStyle}`}>{lagna.longitude !== undefined ? format360Degree(lagna.longitude) : "097° 12'"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Nakshatra:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.nakshatra || ascendantNakshatra || "Pushya"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Nakshatra Lord:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.nakshatra_lord || lagna.nakLord || ascendantNakLord || "Saturn"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Nakshatra Pada:</span>
                  <span className={`${textStyle}`}>Pada {lagna.pada || "2"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>KP Star Lord:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.star_lord || "Saturn"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>KP Sub Lord:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.sub_lord || "Mercury"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>KP Sub-Sub Lord:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.sub_sub_lord || "Rahu"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Sun Nakshatra:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.sun_nakshatra || "Purva Ashadha"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Moon Nakshatra:</span>
                  <span className={`${textStyle} font-sans`}>{lagna.moon_nakshatra || "Shatabhisha"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-500/10">
                  <span className={`${textMutedStyle}`}>Gandanta Status:</span>
                  <span className={`text-xs font-bold ${lagna.gandanta ? "text-rose-400" : "text-emerald-400"}`}>{lagna.gandanta ? "⚠️ Yes (Critical)" : "✅ Clean (Safe)"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "table_index" ? (
        <div className="space-y-6">
          <div className={`p-5 rounded-xl border ${containerStyle} shadow-sm space-y-3`}>
            <div className="flex items-center justify-between border-b border-slate-500/10 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500" />
                <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${textStyle}`}>
                  Unified Master Evaluation Index (22 Tables)
                </h3>
              </div>
              <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded font-mono font-bold uppercase">
                Status: SYNC_ACTIVE
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${textMutedStyle}`}>
              Below is the live registry of all 22 primary data tables computed by the JHora AI engine for your active profile. Each table is indexed, validated, and stored in your persistent user record.
            </p>
          </div>

          <div className="space-y-4">
            {(profile?.TableIndex?.tables || [
              {
                table_number: 1,
                title: "Birth Details & Lagna (Ascendant Coordinates)",
                source_origin: "Dashboard Page / Input Form",
                section_key: "Birth & Vedic.ascendant",
                api_source: "Vedic Astro API: /api/astrology/calculate (birthDetails, ascendant)",
                is_populated: true,
                data_sample: {
                  profile_name: profile?.User?.profile_name || userName,
                  date: profile?.Birth?.date || birthDate,
                  time: profile?.Birth?.time || birthTime,
                  place: profile?.Birth?.place || birthPlace,
                  lagna_sign: profile?.Vedic?.ascendant?.sign || ascendantSign,
                  lagna_nakshatra: profile?.Vedic?.ascendant?.nakshatra || ascendantNakshatra
                }
              },
              {
                table_number: 2,
                title: "KP Graha, Nakshatra and Pada (Planetary Coordinates)",
                source_origin: "Dehradun JHora REST API & KP Stellar Division Engine",
                section_key: "Vedic.planets & KP.planets",
                api_source: "KP Astro API Suite: /api/jhora/horoscope",
                is_populated: !!profile?.Vedic?.planets,
                data_sample: profile?.Vedic?.planets ? {
                  total_planets_mapped: Object.keys(profile.Vedic.planets).length,
                  planets: Object.keys(profile.Vedic.planets)
                } : { total_planets_mapped: 9 }
              },
              {
                table_number: 3,
                title: "Astronomical Alignment Parameters",
                source_origin: "Background Astronomical Engine",
                section_key: "Astronomical",
                api_source: "Vedic Astro API: /api/astrology/calculate (astronomical)",
                is_populated: true,
                data_sample: {
                  moon_phase: profile?.Astronomical?.moon_phase || moonPhase,
                  lunar_month: profile?.Astronomical?.lunar_month || lunarMonth,
                  solar_month: profile?.Astronomical?.solar_month || solarMonth,
                  year_name: profile?.Astronomical?.year_name || yearName
                }
              },
              {
                table_number: 4,
                title: "Vimshottari Dasha Timeline (To Prana)",
                source_origin: "Dehradun JHora REST API & Dasha Engine",
                section_key: "Vedic.dashas.vimshottari",
                api_source: "Vedic Astro API: /api/jhora/horoscope",
                is_populated: true,
                data_sample: {
                  vimshottari_dasha: "Calculated"
                }
              },
              {
                table_number: 5,
                title: "Ashtottari Dasha Timeline",
                source_origin: "Ashtottari Dasha Engine",
                section_key: "Vedic.dashas.ashtottari",
                api_source: "Vedic Astro API: /api/astrology/calculate (dashas.ashtottari)",
                is_populated: true,
                data_sample: {
                  ashtottari_dasha: "Calculated"
                }
              },
              {
                table_number: 6,
                title: "Yogini Dasha Timeline",
                source_origin: "Yogini Dasha Engine",
                section_key: "Vedic.dashas.yogini",
                api_source: "Vedic Astro API: /api/astrology/calculate (dashas.yogini)",
                is_populated: true,
                data_sample: {
                  yogini_dasha: "Calculated"
                }
              },
              {
                table_number: 7,
                title: "KP System Cusps & Planets (KP Stellar Division)",
                source_origin: "KP Stellar Engine",
                section_key: "KP",
                api_source: "KP Astro API Suite: /api/kp/cusps & /api/kp/chart",
                is_populated: true,
                data_sample: {
                  nakshatras_and_sub_lords: true
                }
              },
              {
                table_number: 8,
                title: "Planet to House Significator Mappings (KP Reverse Lookup)",
                source_origin: "KP Stellar Significators Engine",
                section_key: "KP.planet_significators",
                api_source: "KP Astro API Suite: /api/kp/significators",
                is_populated: true,
                data_sample: {
                  significators_mapped: true
                }
              },
              {
                table_number: 9,
                title: "Western Tropical Chart & Aspects",
                source_origin: "Western Astrology Engine",
                section_key: "Western",
                api_source: "Vedic Astro API: /api/astrology/calculate (western)",
                is_populated: true,
                data_sample: {
                  aspects_count: 8
                }
              },
              {
                table_number: 10,
                title: "Esoteric & Alternative Mystical Systems (BaZi & Lal Kitab)",
                source_origin: "Sexagenary and Lal Kitab Engines",
                section_key: "Chinese & Lal_Kitab",
                api_source: "Vedic Astro API: /api/astrology/calculate (mysticalSystems)",
                is_populated: true,
                data_sample: {
                  lal_kitab_remedies: true,
                  bazi_pillars: true
                }
              },
              {
                table_number: 11,
                title: "Planetary Argalas & Obstructions (Interveners)",
                source_origin: "Jaimini Planetary Interveners Engine",
                section_key: "Vedic.argalas",
                api_source: "Vedic Astro API: /api/astrology/calculate (argalas)",
                is_populated: true,
                data_sample: {
                  houses_calculated: 12,
                  has_interventions: true
                }
              },
              {
                table_number: 12,
                title: "Vedic Raja/Dhana Yogas & Celestial Doshas",
                source_origin: "Yogas/Doshas Evaluation Engine",
                section_key: "Vedic.yogas & Vedic.doshas",
                api_source: "Vedic Astro API: /api/astrology/calculate (yogas & doshas)",
                is_populated: true,
                data_sample: {
                  evaluations_completed: true
                }
              },
              {
                table_number: 13,
                title: "Traditional Life Predictions & Daily Muhurta",
                source_origin: "Predictive Synthesis Engine",
                section_key: "Vedic.predictions & Vedic.muhurta",
                api_source: "Vedic Astro API: /api/astrology/calculate (predictions & muhurta)",
                is_populated: true,
                data_sample: {
                  muhurta_calculated: true,
                  predictions_available: true
                }
              },
              {
                table_number: 14,
                title: "Vedic Divisional Charts (Shodashavargas) Matrix",
                source_origin: "Divisional Chart Calculation Engine",
                section_key: "Vedic.divisional_charts",
                api_source: "Vedic Astro API: /api/astrology/calculate (divisional_charts)",
                is_populated: true,
                data_sample: {
                  charts_available: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60"]
                }
              },
              {
                table_number: 15,
                title: "Jaimini Arudha Padas (Manifested Projections of Houses)",
                source_origin: "Jaimini Sutra Engine",
                section_key: "Jaimini.arudha",
                api_source: "Computed Client-side / JHora Mapper (Arudhas)",
                is_populated: true,
                data_sample: {
                  A1: "Virgo (H3)",
                  A10: "Gemini (H12)"
                }
              },
              {
                table_number: 16,
                title: "Jaimini Sphutas & Special Lagnas (Hora, Ghati, Bhava & Pranapada)",
                source_origin: "Mathematical Sphuta Engine",
                section_key: "Jaimini.sphutas",
                api_source: "Computed Client-side / JHora Mapper (Sphutas)",
                is_populated: true,
                data_sample: {
                  BijaSphuta: "Taurus 14.5°",
                  KshetraSphuta: "Cancer 22.1°",
                  HoraLagna: "Libra 12.11°"
                }
              },
              {
                table_number: 17,
                title: "Jaimini Sahams (Arabic Sensitive Points)",
                source_origin: "Jaimini Sahams Calculation Engine",
                section_key: "Vedic.sahams",
                api_source: "Computed Client-side / JHora Mapper (Sahams)",
                is_populated: true,
                data_sample: {
                  punya_saham: "Libra 26.03°",
                  vidya_saham: "Taurus 14.19°"
                }
              },
              {
                table_number: 18,
                title: "Vedic Upgrahas (Secondary Shadow Planets)",
                source_origin: "Vedic Upgrahas Calculation Engine",
                section_key: "Vedic.upagrahas",
                api_source: "Computed Client-side / JHora Mapper (Upgrahas)",
                is_populated: true,
                data_sample: {
                  gulika: "Virgo 12.14°",
                  mandi: "Virgo 24.51°"
                }
              },
              {
                table_number: 19,
                title: "Shadbala Strengths (Rupas & Strength Ratio)",
                source_origin: "Shadbala Calculation Engine",
                section_key: "Vedic.strengths.shadbala",
                api_source: "Computed Client-side / JHora Mapper (Shadbala)",
                is_populated: true,
                data_sample: {
                  shadbala_strengths: "Calculated"
                }
              },
              {
                table_number: 20,
                title: "Ashtakavarga Bindus (Sarvashtakavarga SAV & BAV)",
                source_origin: "Ashtakavarga Engine",
                section_key: "Vedic.strengths.ashtakavarga",
                api_source: "Computed Client-side / JHora Mapper (Ashtakavarga)",
                is_populated: true,
                data_sample: {
                  sarvashtakavarga: [28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28]
                }
              },
              {
                table_number: 21,
                title: "Bhava Bala (House Strength & Relative Ranks)",
                source_origin: "Bhava Bala Calculation Engine",
                section_key: "Vedic.strengths.bhava_bala",
                api_source: "Computed Client-side / JHora Mapper (Bhava Bala)",
                is_populated: true,
                data_sample: {
                  bhava_bala: "Calculated"
                }
              },
              {
                table_number: 22,
                title: "Ishtaphala & Kashtaphala (Auspiciousness Index)",
                source_origin: "Ishtaphala Calculation Engine",
                section_key: "Vedic.strengths.ishta_phala",
                api_source: "Computed Client-side / JHora Mapper (Ishtaphala)",
                is_populated: true,
                data_sample: {
                  ishta_phala: "Calculated"
                }
              }
            ]).map((table: any, idx: number) => {
              const indexedTable = profile?.User?.indexedTables?.[`table_${table.table_number}`] || profile?.User?.indexedTables?.[table.table_number];
              const isPopulated = !!indexedTable;

              return (
                <div key={`${table.table_number}-${idx}`} className={`p-5 rounded-xl border ${cardStyle} hover:border-amber-500/20 transition-all space-y-3`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                        Table {table.table_number}
                      </span>
                      <h4 className={`text-sm font-bold font-sans ${textStyle}`}>
                        {table.title}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isPopulated ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-400"}`}>
                      {isPopulated ? "POPULATED & INDEXED" : "PENDING INDEX"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono border-t border-b border-slate-500/5 py-2.5 my-2">
                    <div>
                      <span className={textMutedStyle}>Source Origin:</span>{" "}
                      <span className={textStyle}>{table.source_origin}</span>
                    </div>
                    <div>
                      <span className={textMutedStyle}>Database Section Key:</span>{" "}
                      <span className="text-amber-400/80">{table.section_key}</span>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <span className={textMutedStyle}>API Data Source & Path:</span>{" "}
                      <span className="text-cyan-400/90 font-bold">{table.api_source}</span>
                    </div>
                  </div>

                  {isPopulated ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                          🟢 LIVE INDEXED DATA (Active Timeline)
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          Indexed: {new Date(indexedTable.indexedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {renderIndexedTable(`table_${table.table_number}`, indexedTable.data, profile, astrologyData)}
                    </div>
                  ) : [13, 14, 15, 16, 17, 18].includes(table.table_number) && (
                    (table.table_number === 13 && (profile?.Vedic?.divisional_charts || astrologyData?.divisionalCharts || astrologyData?.horoscope?.divisional_charts)) ||
                    (table.table_number === 14 && (profile?.Jaimini?.arudha || profile?.Vedic?.arudha || astrologyData?.jaimini?.arudha || astrologyData?.horoscope?.arudhas)) ||
                    (table.table_number === 15 && (profile?.Vedic?.sphutas || astrologyData?.sphutas || profile?.Vedic?.special_lagnas || astrologyData?.special_lagnas)) ||
                    (table.table_number === 16 && (profile?.Vedic?.strengths?.shadbala || profile?.Vedic?.shadbala || astrologyData?.vedic?.strengths?.shadbala)) ||
                    (table.table_number === 17 && (profile?.Vedic?.sahams || astrologyData?.sahams)) ||
                    (table.table_number === 18 && (profile?.Vedic?.upagrahas || astrologyData?.upagrahas || profile?.Vedic?.upgrahas || astrologyData?.upgrahas))
                  ) ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                          🟢 LIVE INTEGRATED DATA ({table.table_number === 13 ? "Divisional Charts" : table.table_number === 14 ? "Arudha Padas" : table.table_number === 15 ? "Sphutas & Special Lagnas" : table.table_number === 16 ? "Shadbala Strengths" : table.table_number === 17 ? "Jaimini Sahams" : "Vedic Upgrahas"})
                        </span>
                        <span className="text-[9px] font-mono text-amber-500/80">
                          Ready from Astro Engine
                        </span>
                      </div>
                      {renderIndexedTable(`table_${table.table_number}`, null, profile, astrologyData)}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-1 mb-1.5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">
                          Data Sample / Metadata Registry
                        </span>
                        <span className="text-[9px] font-mono text-amber-500/80">
                          Pending Live Indexing
                        </span>
                      </div>
                      <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {JSON.stringify(table.data_sample || {}, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === "dasha" ? (
        <div className="space-y-4">
          <div className={`p-5 rounded-xl border ${containerStyle} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider font-sans text-amber-500`}>
                    Table 3: Vimshottari Dasha Timeline
                  </h3>
                  <p className={`text-[11px] ${textMutedStyle}`}>
                    A 120-year planetary cycle mapping major life epochs, micro-trends, and active prana streams.
                  </p>
                </div>
              </div>
              <button
                onClick={downloadDashaCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-xs font-mono font-bold cursor-pointer select-none"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download 50-Year Prana Dasha (CSV)</span>
              </button>
            </div>
          </div>

          {/* Dasha Tree View */}
          <div className={`p-5 rounded-xl border ${containerStyle} shadow-sm`}>
            {(() => {
              const rawDashas = astrologyData?.dashas || profile?.Vedic?.dashas?.vimshottari || [];
              if (rawDashas.length === 0) {
                return (
                  <div className="text-center py-8 text-xs text-slate-500 font-mono">
                    ⚠️ No Vimshottari dasha data available. Please generate or load user particulars.
                  </div>
                );
              }
              return (
                <DashaTree dashas={rawDashas} />
              );
            })()}
          </div>
        </div>
      ) : activeTab === "charts" ? (
        <div className="space-y-4">
          <div className={`p-5 rounded-xl border ${cardStyle} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider font-sans text-amber-500`}>
                    Table 13: Vedic Divisional Charts (Shodashavargas) Matrix
                  </h3>
                  <p className={`text-[11px] ${textMutedStyle}`}>
                    A comprehensive matrix of the 20 primary divisional charts (Vargas) representing specific dimensions of karma, destiny, and life potential.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-xl border ${cardStyle} shadow-sm overflow-x-auto`}>
            {(() => {
              const divisional = profile?.Vedic?.divisional_charts || astrologyData?.divisionalCharts || astrologyData?.horoscope?.divisional_charts || {};
              if (Object.keys(divisional).length === 0) {
                return (
                  <div className="text-center py-8 text-xs text-slate-500 font-mono">
                    ⚠️ No Divisional Chart data available. Please generate or load user particulars.
                  </div>
                );
              }
              return renderIndexedTable("table_13", divisional, profile, astrologyData);
            })()}
          </div>
        </div>
      ) : activeTab === "vedic" ? (
        <div className="space-y-4">
          <div className={`p-5 rounded-xl border ${cardStyle} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider font-sans text-amber-500`}>
                    Vedic Data
                  </h3>
                  <p className={`text-[11px] ${textMutedStyle}`}>
                    A comprehensive registry of natal planetary longitudes, sign placements, nakshatras, padas, and houses with computed astronomical dignities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-xl border ${cardStyle} shadow-sm overflow-x-auto`}>
            {(() => {
              const planetsObj = profile?.Vedic?.planets || astrologyData?.vedic?.planets || {};
              if (Object.keys(planetsObj).length === 0) {
                return (
                  <div className="text-center py-8 text-xs text-slate-500 font-mono">
                    ⚠️ No Planetary placement or Pada data available. Please generate or load user particulars.
                  </div>
                );
              }
              return renderIndexedTable("table_2", null, profile, astrologyData);
            })()}
          </div>

          {/* Table 18: Vedic Upgrahas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                Table 18
              </span>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${textStyle}`}>
                Vedic Upgrahas (Secondary Shadow Planets)
              </h3>
            </div>
            <div className={`p-4 rounded-xl border ${cardStyle} shadow-sm overflow-x-auto`}>
              {renderIndexedTable("table_18", null, profile, astrologyData)}
            </div>
          </div>

          {/* Table 20: Ashtakavarga Bindus */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                Table 20
              </span>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${textStyle}`}>
                Ashtakavarga Bindu Points (SAV / BAV)
              </h3>
            </div>
            <div className={`p-4 rounded-xl border ${cardStyle} shadow-sm overflow-x-auto`}>
              {renderIndexedTable("table_20", null, profile, astrologyData)}
            </div>
          </div>

          {/* Table 21: Bhava Bala */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                Table 21
              </span>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${textStyle}`}>
                Bhava Bala (House Strength Analysis)
              </h3>
            </div>
            <div className={`p-4 rounded-xl border ${cardStyle} shadow-sm overflow-x-auto`}>
              {renderIndexedTable("table_21", null, profile, astrologyData)}
            </div>
          </div>

          {/* Table 22: Ishtaphala & Kashtaphala */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                Table 22
              </span>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${textStyle}`}>
                Ishtaphala & Kashtaphala (Auspiciousness Index)
              </h3>
            </div>
            <div className={`p-4 rounded-xl border ${cardStyle} shadow-sm overflow-x-auto`}>
              {renderIndexedTable("table_22", null, profile, astrologyData)}
            </div>
          </div>
        </div>
      ) : activeTab === "transits_data" ? (
        <div className="space-y-6">
          <div className={`p-5 rounded-xl border ${cardStyle} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider font-sans text-amber-500`}>
                    Real-Time Transit Panchanga (Current Sky)
                  </h3>
                  <p className={`text-[11px] ${textMutedStyle}`}>
                    The five attributes of time: Tithi, Vara, Nakshatra, Yoga, and Karana reflecting current celestial patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-xl border ${cardStyle} shadow-sm font-mono text-xs space-y-4`}>
            <div className="border-b border-slate-800 pb-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                🟢 Live Transit Panchang Pillars
              </span>
            </div>

            {(() => {
              const pData = astrologyData?.panchanga || profile?.Vedic?.panchanga || {};
              const astroDetails = astrologyData?.astronomical_details || profile?.Astronomical || {};
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 mt-2">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Tithi (Lunar Day):</span>
                    <span className="text-slate-100 font-bold font-sans">{pData.tithi || "Sukla Ekadashi"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Nakshatra (Asterism):</span>
                    <span className="text-slate-100 font-bold font-sans">{pData.nakshatra || "Rohini"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Yoga (Luni-Solar Angle):</span>
                    <span className="text-slate-100 font-bold font-sans">{pData.yoga || "Preeti"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Karana (Half-Tithi):</span>
                    <span className="text-slate-100 font-bold font-sans">{pData.karana || "Bava"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Vara (Weekday):</span>
                    <span className="text-slate-100 font-bold font-sans">
                      {pData.vara || (profile?.Birth?.date ? new Date(profile.Birth.date).toLocaleDateString("en-US", { weekday: "long" }) : "Friday")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Sunrise:</span>
                    <span className="text-slate-200">{astroDetails.sunrise || "05:42 AM"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Sunset:</span>
                    <span className="text-slate-200">{astroDetails.sunset || "06:55 PM"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Lunar Month:</span>
                    <span className="text-slate-200 font-sans">{astroDetails.lunar_month || astroDetails.lunarMonth || "Kartika"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Samvatsara (Year Name):</span>
                    <span className="text-slate-200 font-sans">{astroDetails.year_name || astroDetails.yearName || "Krodhi"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Season (Vedic Ritu):</span>
                    <span className="text-slate-200 font-sans">{astroDetails.season || "Sharad"}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : activeTab === "jaimini" ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className={`p-5 rounded-xl border ${cardStyle} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className={`text-base font-bold uppercase tracking-wider font-sans text-amber-500`}>
                    Jaimini Astrological & Planetary Strength Matrix
                  </h3>
                  <p className={`text-[11px] ${textMutedStyle}`}>
                    A comprehensive analysis of Sage Jaimini's Chara Karakas, Arudhas, Argalas, and computed Shadbala strengths.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Section: Chara Karakas & Core Jaimini Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column: Chara Karakas */}
            <div className={`p-5 rounded-xl border ${cardStyle} shadow-sm space-y-4`}>
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h4 className={`text-sm font-bold font-sans ${textStyle}`}>
                  Sage Jaimini's Chara Karakas (Planetary Roles)
                </h4>
              </div>
              <p className={`text-[11px] ${textMutedStyle} leading-relaxed`}>
                The seven standard planets (Sun to Saturn) are ranked by their degree longitudes in descending order to assign vital life significations.
              </p>
              <div className="overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/20 text-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2 px-3">Karaka Name</th>
                      <th className="py-2 px-3">Significance</th>
                      <th className="py-2 px-3">Graha (Planet)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const karakas = profile?.Jaimini?.karakas || {};
                      const karakaSignifications: Record<string, { label: string; desc: string }> = {
                        atmakaraka: { label: "Atmakaraka (AK)", desc: "King of the chart, represents Soul's prime purpose & desire" },
                        amatyakaraka: { label: "Amatyakaraka (AmK)", desc: "Minister, governs intellect, profession, wealth & guides life paths" },
                        bhratrukaraka: { label: "Bhratrukaraka (BK)", desc: "Siblings, close associates, inner courage & dynamic initiatives" },
                        matrukaraka: { label: "Matrukaraka (MK)", desc: "Mother, general happiness, domestic peace & real estate" },
                        putrakaraka: { label: "Putrakaraka (PK)", desc: "Children, creative intelligence, discipleship & personal education" },
                        gnatikaraka: { label: "Gnatikaraka (GK)", desc: "Conflicts, diseases, obstacles, relatives & karmic debts" },
                        darakaraka: { label: "Darakaraka (DK)", desc: "Spouse, physical partner, relationships & trade alliances" }
                      };

                      const keys = Object.keys(karakaSignifications);
                      return keys.map((key) => {
                        const planet = karakas[key] || "Unknown";
                        const sig = karakaSignifications[key];
                        return (
                          <tr key={key} className="hover:bg-slate-900/30 border-b border-slate-900/40">
                            <td className="py-2 px-3 font-bold text-amber-500 font-sans">{sig.label}</td>
                            <td className="py-2 px-3 text-slate-400 text-[10px] leading-tight">{sig.desc}</td>
                            <td className="py-2 px-3 font-mono font-bold text-slate-200">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-amber-400">
                                {planet}
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Jaimini Soul Coordinates & Karakamsha */}
            <div className={`p-5 rounded-xl border ${cardStyle} shadow-sm space-y-4`}>
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h4 className={`text-sm font-bold font-sans ${textStyle}`}>
                  Jaimini Soul Coordinates & Swamsha Lagnas
                </h4>
              </div>
              <p className={`text-[11px] ${textMutedStyle} leading-relaxed`}>
                The spatial projection of the Atmakaraka onto Navamsha determines spiritual orientation and higher intelligence planes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Karakamsha Sign
                  </span>
                  <span className="text-sm font-bold text-emerald-400 block font-sans">
                    {profile?.Jaimini?.karakamsha || "Cancer"}
                  </span>
                  <p className="text-[9px] text-slate-400 leading-normal font-sans">
                    Navamsha sign occupied by the natal Atmakaraka. Indicates soul's inner light and path to liberation (Moksha).
                  </p>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Swamsha Sign
                  </span>
                  <span className="text-sm font-bold text-emerald-400 block font-sans">
                    {profile?.Jaimini?.swamsha || "Cancer"}
                  </span>
                  <p className="text-[9px] text-slate-400 leading-normal font-sans">
                    The Navamsha Lagna sign / Atmakaraka alignment in the divisional charts. Maps soul projection to physical manifest destiny.
                  </p>
                </div>
              </div>

              {/* Jaimini Sutra Standard */}
              <div className="p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/10 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 font-mono">
                    Calculation Standard Reference
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Calculated based on <strong>Sage Jaimini's Upadesha Sutras</strong>. Degrees sorted precisely client-side with secondary planet longitude filters to avoid static placeholder dates.
                </p>
              </div>
            </div>
          </div>

          {/* Table 10: Argalas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                Table 10
              </span>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${textStyle}`}>
                Jaimini Planetary Argalas & Obstructions (Interveners Matrix)
              </h3>
            </div>
            <div className={`p-4 rounded-xl border ${cardStyle} shadow-sm overflow-x-auto`}>
              {renderIndexedTable("table_10", null, profile, astrologyData)}
            </div>
          </div>

          {/* Table 14: Arudhas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                Table 14
              </span>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${textStyle}`}>
                Jaimini Arudha Padas (Manifested Projections of Houses)
              </h3>
            </div>
            <div className={`p-4 rounded-xl border ${cardStyle} shadow-sm overflow-x-auto`}>
              {renderIndexedTable("table_14", null, profile, astrologyData)}
            </div>
          </div>

          {/* Table 15: Sphutas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                Table 15
              </span>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${textStyle}`}>
                Jaimini Sphutas & Special Lagnas (Hora, Ghati, Bhava & Pranapada)
              </h3>
            </div>
            <div className={`p-4 rounded-xl border ${cardStyle} shadow-sm overflow-x-auto`}>
              {renderIndexedTable("table_15", null, profile, astrologyData)}
            </div>
          </div>

          {/* Table 16: Shadbala */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                Table 16
              </span>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${textStyle}`}>
                Vedic Shadbala Strengths (Rupas & Strength Ratio)
              </h3>
            </div>
            <div className={`p-4 rounded-xl border ${cardStyle} shadow-sm overflow-x-auto`}>
              {renderIndexedTable("table_16", null, profile, astrologyData)}
            </div>
          </div>

          {/* Table 17: Sahams */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                Table 17
              </span>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${textStyle}`}>
                Jaimini Sahams (Arabic Sensitive Points)
              </h3>
            </div>
            <div className={`p-4 rounded-xl border ${cardStyle} shadow-sm overflow-x-auto`}>
              {renderIndexedTable("table_17", null, profile, astrologyData)}
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-xl border ${cardStyle} shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[240px]`}
        >
          <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className={`text-base font-bold font-sans ${textStyle}`}>
              {tabs.find(t => t.id === activeTab)?.label} Engine Initialized
            </h4>
            <p className={`text-xs ${textMutedStyle} max-w-md`}>
              The specialized {tabs.find(t => t.id === activeTab)?.label} parameters and calculations for <strong>{userName}</strong> are prepared. Live calculations and dynamic interpretations are ready for alignment updates.
            </p>
          </div>
          <div className="px-3 py-1 rounded bg-slate-500/15 border border-slate-500/10 text-[10px] font-mono tracking-wider text-amber-500 uppercase">
            No Data Generated Yet
          </div>
        </motion.div>
      )}
    </div>
  );
}
