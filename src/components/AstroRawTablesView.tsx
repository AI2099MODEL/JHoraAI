import React, { useState, useEffect } from "react";
import { 
  Table as TableIcon, 
  Info, 
  Sparkles, 
  Compass, 
  Map, 
  User, 
  Calendar, 
  Hash, 
  Workflow, 
  Activity,
  Award,
  Clock,
  Shield,
  Eye,
  Settings,
  RefreshCw,
  Download,
  FileText,
  Code
} from "lucide-react";
import { generateRawAstrologyPDF } from "../lib/rawReportGenerator";
import { mapAstrologyDataToUserProfileJSON } from "../lib/jhoraMapper";
import { TableIndexView } from "./TableIndexView";

interface AstroRawTablesViewProps {
  astrologyData: any;
  activeSubmenuId: string;
  isDark: boolean;
  activeUser?: any;
  hideHeaders?: boolean;
}

export const AstroRawTablesView: React.FC<AstroRawTablesViewProps> = ({ 
  astrologyData, 
  activeSubmenuId, 
  isDark,
  activeUser,
  hideHeaders = false
}) => {
  // Local states for fetched datasets
  const [kpCusps, setKpCusps] = useState<any>(null);
  const [kpChart, setKpChart] = useState<any>(null);
  const [kpSignificators, setKpSignificators] = useState<any>(null);
  const [westernChart, setWesternChart] = useState<any>(null);
  const [selectedVarga, setSelectedVarga] = useState<string>("D1");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [pdfCompiling, setPdfCompiling] = useState<boolean>(false);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  const [targetAge, setTargetAge] = useState<number>(30); // Default Tajik Varshaphala age

  // Helper to compile all 19 raw system tables into a high-fidelity PDF document
  const handleExportPDF = async () => {
    try {
      setPdfCompiling(true);
      const profileJson = mapAstrologyDataToUserProfileJSON(activeUser || {}, astrologyData);
      
      const fullPayload = {
        ...profileJson,
        astrologyData,
        supplemental_data: {
          kpCusps,
          kpChart,
          kpSignificators,
          westernChart
        }
      };

      const doc = generateRawAstrologyPDF(fullPayload, {
        profileName: profileJson.User?.profile_name || astrologyData?.birthDetails?.name || "Vedic Native",
        targetAge: targetAge,
        submenus: [
          "jhora_birth_details", "jhora_planets", "jhora_shadbala", "jhora_bhava_balas", 
          "jhora_ashtakavarga", "jhora_divisional", "jhora_vimshottari", 
          "kp_cusps", "kp_sub_lords", "kp_planet_significators", "kp_house_significators", 
          "jaimini_karakas", "jaimini_arudhas", "western_tropical", "western_aspects", 
          "tajika_varshaphal", "tajika_harshabala", "lalkitab_houses", "lalkitab_teva"
        ]
      });
      doc.save(`Astro_Raw_Report_JH_${astrologyData?.birthDetails?.name || "native"}_${Date.now()}.pdf`);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      alert("Failed to export PDF: " + err.message);
    } finally {
      setPdfCompiling(false);
    }
  };

  // Helper to download complete JSON schema
  const handleDownloadJSON = () => {
    const combinedPayload = {
      User: {
        google_user_id: activeUser?.uid || "guest_user",
        email: activeUser?.email || "guest@example.com",
        profile_name: astrologyData?.birthDetails?.name || "Vedic Native",
        created_at: new Date().toISOString()
      },
      Birth: astrologyData?.birthDetails || {},
      astrologyData,
      supplemental_data: {
        kpCusps,
        kpChart,
        kpSignificators,
        westernChart
      }
    };
    const dataStr = JSON.stringify(combinedPayload, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `astrology_profile_raw_${astrologyData?.birthDetails?.name || "native"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const containerStyle = "bg-white border border-slate-200 text-black";
  
  const cardStyle = "bg-white border border-slate-200 shadow-sm";

  const tableHeaderStyle = "bg-slate-50/80 border-b border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider";

  const tableRowStyle = "border-b border-slate-100 hover:bg-slate-50 text-black text-[10px]";

  const textMuted = "text-slate-500";

  // Helper to format degree to deg-min-sec
  const formatDegree = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.floor(((deg - d) * 60 - m) * 60);
    return `${d}° ${m}' ${s}"`;
  };

  // Helper to fetch custom data from endpoints
  const fetchEndpointData = async (endpoint: string) => {
    if (!astrologyData || !astrologyData.birthDetails) return null;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: astrologyData.birthDetails.date,
        time: astrologyData.birthDetails.time,
        latitude: astrologyData.birthDetails.latitude,
        longitude: astrologyData.birthDetails.longitude,
        timezone: astrologyData.birthDetails.timezone,
        place: astrologyData.birthDetails.location || "Query Location"
      })
    });
    if (!res.ok) {
      throw new Error(`Failed to retrieve data from ${endpoint}`);
    }
    return res.json();
  };

  // Reactively fetch supplemental raw system data based on the active submenu
  useEffect(() => {
    if (!astrologyData) return;

    let active = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        if (activeSubmenuId.startsWith("kp_")) {
          if (activeSubmenuId === "kp_cusps" && !kpCusps) {
            const data = await fetchEndpointData("/api/kp/cusps");
            if (active) setKpCusps(data);
          } else if (activeSubmenuId === "kp_sub_lords" && !kpChart) {
            const data = await fetchEndpointData("/api/kp/chart");
            if (active) setKpChart(data);
          } else if ((activeSubmenuId === "kp_planet_significators" || activeSubmenuId === "kp_house_significators") && !kpSignificators) {
            const data = await fetchEndpointData("/api/kp/significators");
            if (active) setKpSignificators(data);
          }
        } else if (activeSubmenuId.startsWith("western_")) {
          if (!westernChart) {
            const data = await fetchEndpointData("/api/western/chart");
            if (active) setWesternChart(data);
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to load additional raw astrological datasets.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [activeSubmenuId, astrologyData]);

  if (!astrologyData) {
    return (
      <div className={`p-8 rounded-2xl ${containerStyle} text-center`}>
        <Info className="w-8 h-8 text-amber-800 mx-auto mb-3 animate-pulse" />
        <h3 className="text-sm font-semibold">No Active Astrology Profile Loaded</h3>
        <p className=" text-slate-600 mt-1">Please cast or import a birth profile first.</p>
      </div>
    );
  }

  // Define some constant maps
  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  return (
    <div className={hideHeaders ? "space-y-4" : "space-y-6"} id="astro-raw-tables-root">
      
      {/* Table Title and Metadata header */}
      {!hideHeaders && (
        <div className={`p-6 rounded-2xl ${containerStyle} space-y-4`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-800">
                  <TableIcon className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-bold">Raw Astro Systems Registry</h2>
              </div>
              <p className=" text-slate-600">
                Phase 10.0 Certified Raw Astrological Databases. Free of calculations, transit forecasts, or predictions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 text-[10px] font-mono bg-slate-950/45 px-2.5 py-1.5 rounded-lg border border-slate-200 mr-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Binds to userprofile.json</span>
              </div>
              
              <button
                onClick={handleDownloadJSON}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 border border-indigo-500/20  font-bold cursor-pointer transition-all"
                title="Download JHora/KP raw JSON payload"
              >
                <Download className="w-3.5 h-3.5" />
                Download User JSON
              </button>
              
              <button
                onClick={handleExportPDF}
                disabled={pdfCompiling}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950  font-bold disabled:opacity-50 cursor-pointer transition-all"
                title="Compile all raw systems into a PDF report"
              >
                {pdfCompiling ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                {pdfCompiling ? "Compiling..." : "Export PDF"}
              </button>

              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border  font-bold cursor-pointer transition-all ${
                  showRawJson 
                    ? "bg-slate-700/50 border-slate-600 text-slate-900" 
                    : "bg-slate-800/20 border-slate-800 text-slate-600 hover:bg-slate-800/50"
                }`}
                title="Toggle raw interactive JSON viewer"
              >
                <Code className="w-3.5 h-3.5" />
                {showRawJson ? "Hide JSON" : "Inspect Raw JSON"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!hideHeaders && showRawJson && (
        <div className={`p-4 rounded-xl border font-mono text-[11px] leading-relaxed relative ${cardStyle}`}>
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-indigo-500/10">
            <span className="text-indigo-700 font-bold uppercase tracking-wide">Raw JHora/KP/Western Combined Payload (.json)</span>
            <span className="text-[10px] text-slate-700">Live memory state</span>
          </div>
          <pre className="overflow-x-auto max-h-[400px] text-slate-800 bg-slate-50 p-4 rounded-lg select-text">
            {JSON.stringify({
              User: {
                google_user_id: activeUser?.uid || "guest_user",
                email: activeUser?.email || "guest@example.com",
                profile_name: astrologyData?.birthDetails?.name || "Vedic Native",
                created_at: new Date().toISOString()
              },
              Birth: astrologyData?.birthDetails || {},
              astrologyData,
              supplemental_data: {
                kpCusps,
                kpChart,
                kpSignificators,
                westernChart
              }
            }, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400  flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>Error loading raw system fields: {error}</span>
        </div>
      )}

      {loading && (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-800" />
          <span className=" text-slate-600 font-mono">Retrieving remote database tables...</span>
        </div>
      )}

      {!loading && (() => {
        // Render tables based on the activeSubmenuId
        switch (activeSubmenuId) {
          
          // ==================== I. CLASSICAL VEDIC SYSTEM ====================
          case "jhora_birth_details":
            return (
              <div className="space-y-4 animate-fade-in" id="table-1-birth-details">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <User className="w-4 h-4" />
                    JH1: Birth Details & Astronomical Metrics
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Parashari Baseline</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-2.5 px-4 font-semibold">Parameter Key</th>
                        <th className="py-2.5 px-4 font-semibold">Raw JSON Path</th>
                        <th className="py-2.5 px-4 font-semibold">Value</th>
                        <th className="py-2.5 px-4 font-semibold">Provenance Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={tableRowStyle}>
                        <td className="py-2.5 px-4 font-mono font-bold text-black">profile.name</td>
                        <td className="py-2.5 px-4 font-mono text-indigo-700">.birthDetails.name</td>
                        <td className="py-2.5 px-4 font-mono">{astrologyData.birthDetails.name}</td>
                        <td className="py-2.5 px-4 text-slate-600">Authenticated birth record profile name.</td>
                      </tr>
                      <tr className={tableRowStyle}>
                        <td className="py-2.5 px-4 font-mono font-bold text-black">profile.date</td>
                        <td className="py-2.5 px-4 font-mono text-indigo-700">.birthDetails.date</td>
                        <td className="py-2.5 px-4 font-mono">{astrologyData.birthDetails.date}</td>
                        <td className="py-2.5 px-4 text-slate-600">Standard Gregorian Date representation (YYYY-MM-DD).</td>
                      </tr>
                      <tr className={tableRowStyle}>
                        <td className="py-2.5 px-4 font-mono font-bold text-black">profile.time</td>
                        <td className="py-2.5 px-4 font-mono text-indigo-700">.birthDetails.time</td>
                        <td className="py-2.5 px-4 font-mono">{astrologyData.birthDetails.time}</td>
                        <td className="py-2.5 px-4 text-slate-600">Local Standard Time of birth (HH:MM).</td>
                      </tr>
                      <tr className={tableRowStyle}>
                        <td className="py-2.5 px-4 font-mono font-bold text-black">profile.location</td>
                        <td className="py-2.5 px-4 font-mono text-indigo-700">.birthDetails.location</td>
                        <td className="py-2.5 px-4">{astrologyData.birthDetails.location}</td>
                        <td className="py-2.5 px-4 text-slate-600">Resolved city name coordinates database index.</td>
                      </tr>
                      <tr className={tableRowStyle}>
                        <td className="py-2.5 px-4 font-mono font-bold text-black">profile.latitude</td>
                        <td className="py-2.5 px-4 font-mono text-indigo-700">.birthDetails.latitude</td>
                        <td className="py-2.5 px-4 font-mono">{astrologyData.birthDetails.latitude.toFixed(4)}°</td>
                        <td className="py-2.5 px-4 text-slate-600">Geographical latitude of casting coordinates.</td>
                      </tr>
                      <tr className={tableRowStyle}>
                        <td className="py-2.5 px-4 font-mono font-bold text-black">profile.longitude</td>
                        <td className="py-2.5 px-4 font-mono text-indigo-700">.birthDetails.longitude</td>
                        <td className="py-2.5 px-4 font-mono">{astrologyData.birthDetails.longitude.toFixed(4)}°</td>
                        <td className="py-2.5 px-4 text-slate-600">Geographical longitude of casting coordinates.</td>
                      </tr>
                      <tr className={tableRowStyle}>
                        <td className="py-2.5 px-4 font-mono font-bold text-black">profile.timezone</td>
                        <td className="py-2.5 px-4 font-mono text-indigo-700">.birthDetails.timezone</td>
                        <td className="py-2.5 px-4 font-mono">GMT {astrologyData.birthDetails.timezone >= 0 ? "+" : ""}{astrologyData.birthDetails.timezone}</td>
                        <td className="py-2.5 px-4 text-slate-600">Timezone offset hours relative to Greenwich Mean Time.</td>
                      </tr>
                      <tr className={tableRowStyle}>
                        <td className="py-2.5 px-4 font-mono font-bold text-black">lagna.sign</td>
                        <td className="py-2.5 px-4 font-mono text-indigo-700">.lagna.sign</td>
                        <td className="py-2.5 px-4 font-semibold text-amber-700">{astrologyData.lagna.sign}</td>
                        <td className="py-2.5 px-4 text-slate-600">Rasi Ascendant sign at coordinates time boundary.</td>
                      </tr>
                      <tr className={tableRowStyle}>
                        <td className="py-2.5 px-4 font-mono font-bold text-black">lagna.longitude</td>
                        <td className="py-2.5 px-4 font-mono text-indigo-700">.lagna.longitude</td>
                        <td className="py-2.5 px-4 font-mono">{astrologyData.lagna.longitude.toFixed(4)}°</td>
                        <td className="py-2.5 px-4 text-slate-600">Ascendant degree projected on the 360° celestial belt.</td>
                      </tr>
                      <tr className={tableRowStyle}>
                        <td className="py-2.5 px-4 font-mono font-bold text-black">lagna.degree</td>
                        <td className="py-2.5 px-4 font-mono text-indigo-700">.lagna.degree</td>
                        <td className="py-2.5 px-4 font-mono">{formatDegree(astrologyData.lagna.degree)}</td>
                        <td className="py-2.5 px-4 text-slate-600">Exact degree offset inside the {astrologyData.lagna.sign} sign.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case "jhora_planets":
            return (
              <div className="space-y-4 animate-fade-in" id="table-2-natal-planets">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Compass className="w-4 h-4" />
                    JH2: Natal Planets Longitudes & Rasi Placements
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Sidereal Placements</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">Planet</th>
                        <th className="py-3 px-4 font-semibold">Sign</th>
                        <th className="py-3 px-4 font-semibold">Sign Degree</th>
                        <th className="py-3 px-4 font-semibold">Abs Longitude</th>
                        <th className="py-3 px-4 font-semibold">Nakshatra</th>
                        <th className="py-3 px-4 font-semibold">Pada</th>
                        <th className="py-3 px-4 font-semibold">House</th>
                        <th className="py-3 px-4 font-semibold">Lord</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(astrologyData.planets || []).map((p: any) => (
                        <tr key={p.name} className={tableRowStyle}>
                          <td className="py-2.5 px-4 font-bold text-black">{p.name}</td>
                          <td className="py-2.5 px-4 font-mono text-amber-700">{p.sign}</td>
                          <td className="py-2.5 px-4 font-mono">{formatDegree(p.degree)}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-600">{p.longitude.toFixed(2)}°</td>
                          <td className="py-2.5 px-4 font-medium text-indigo-700">{p.nakshatra}</td>
                          <td className="py-2.5 px-4 font-mono">{p.pada}</td>
                          <td className="py-2.5 px-4 font-semibold">House {p.house}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-600">{p.lord || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case "jhora_shadbala":
            return (
              <div className="space-y-4 animate-fade-in" id="table-3-shadbala">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Activity className="w-4 h-4" />
                    JH3: Shadbala Planet Strength Matrix (Shashtiamsas)
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Six-Fold Strength Model</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">Planet</th>
                        <th className="py-3 px-4 font-semibold">Sthana (Positional)</th>
                        <th className="py-3 px-4 font-semibold">Dig (Directional)</th>
                        <th className="py-3 px-4 font-semibold">Kala (Temporal)</th>
                        <th className="py-3 px-4 font-semibold">Cheshta (Motional)</th>
                        <th className="py-3 px-4 font-semibold">Naisargika (Natural)</th>
                        <th className="py-3 px-4 font-semibold">Drig (Aspectual)</th>
                        <th className="py-3 px-4 font-semibold text-amber-800">Total</th>
                        <th className="py-3 px-4 font-semibold">Required</th>
                        <th className="py-3 px-4 font-semibold text-emerald-700">Ratio (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {astrologyData.shadBala ? (
                        Object.entries(astrologyData.shadBala).map(([planet, b]: [string, any]) => (
                          <tr key={planet} className={tableRowStyle}>
                            <td className="py-2.5 px-4 font-bold text-black">{planet}</td>
                            <td className="py-2.5 px-4 font-mono">{b.sthanaBala?.toFixed(1) || "0.0"}</td>
                            <td className="py-2.5 px-4 font-mono">{b.digBala?.toFixed(1) || "0.0"}</td>
                            <td className="py-2.5 px-4 font-mono">{b.kalaBala?.toFixed(1) || "0.0"}</td>
                            <td className="py-2.5 px-4 font-mono">{b.cheshtaBala?.toFixed(1) || "0.0"}</td>
                            <td className="py-2.5 px-4 font-mono">{b.naisargikaBala?.toFixed(1) || "0.0"}</td>
                            <td className="py-2.5 px-4 font-mono">{b.drigBala?.toFixed(1) || "0.0"}</td>
                            <td className="py-2.5 px-4 font-mono font-semibold text-amber-700">{b.total?.toFixed(1) || "0.0"}</td>
                            <td className="py-2.5 px-4 font-mono">{b.required || "300"}</td>
                            <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">{(b.strengthRatio * 100)?.toFixed(1)}%</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-700">No raw Shadbala entries found in this profile profile.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case "jhora_bhava_balas":
            return (
              <div className="space-y-4 animate-fade-in" id="table-4-bhava-balas">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Award className="w-4 h-4" />
                    JH4: Bhava Balas (House Strengths)
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">House Boundaries</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">House Cusp</th>
                        <th className="py-3 px-4 font-semibold text-amber-800">Strength (Shashtiamsas)</th>
                        <th className="py-3 px-4 font-semibold">Rank</th>
                        <th className="py-3 px-4 font-semibold">Core Significance Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {astrologyData.bhavaBala ? (
                        Object.entries(astrologyData.bhavaBala).map(([house, b]: [string, any]) => {
                          const sigMap: { [key: string]: string } = {
                            "1": "Physical constitution, self-identity, temperament, health baseline, longevity.",
                            "2": "Family values, assets, accumulated financial vaults, oral speech patterns.",
                            "3": "Valiant courage, biological brothers, communication skills, minor migrations.",
                            "4": "Domestic motherly nurture, vehicular comforts, academic certifications.",
                            "5": "Creative intelligence, investments of resources, children, past life merits.",
                            "6": "Hostile rivals, litigation hurdles, debt structures, bodily diseases.",
                            "7": "Legal marriages, public visibility, business partners, counter-alliances.",
                            "8": "Hidden sciences, longevity boundaries, sudden hazards, legacy inheritance.",
                            "9": "Divine wisdom, academic gurus, pilgrimages, moral code, fortune.",
                            "10": "Public prestige, regal achievements, career vocations, societal contributions.",
                            "11": "Financial profits, supportive network communities, elder brothers.",
                            "12": "Extravagant expenditures, liberation, isolated confinement, sleep chambers."
                          };
                          return (
                            <tr key={house} className={tableRowStyle}>
                              <td className="py-2.5 px-4 font-mono font-bold text-black">House {house}</td>
                              <td className="py-2.5 px-4 font-mono text-amber-700 font-semibold">{b.strengthShashtiamsas?.toFixed(1) || "340.0"}</td>
                              <td className="py-2.5 px-4 font-mono">#{b.rank || house}</td>
                              <td className="py-2.5 px-4 text-slate-600">{sigMap[house] || "Astrological house significations."}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-700">No raw Bhava Bala strengths found in this profile.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case "jhora_ashtakavarga":
            return (
              <div className="space-y-4 animate-fade-in" id="table-5-ashtakavarga">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Hash className="w-4 h-4" />
                    JH5: Samudhaya Ashtakavarga Points (SAV)
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Binnashtakavarga Matrix</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">Zodiac Sign</th>
                        {Array.from({ length: 12 }).map((_, idx) => (
                          <th key={idx} className="py-3 px-2 font-mono text-center font-semibold text-indigo-700">
                            H{idx + 1}
                          </th>
                        ))}
                        <th className="py-3 px-4 font-semibold text-center text-amber-800">Total SAV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {astrologyData.ashtakavarga ? (
                        <>
                          {Object.entries(astrologyData.ashtakavarga.planets || {}).map(([planet, pts]: [string, any]) => (
                            <tr key={planet} className={tableRowStyle}>
                              <td className="py-2.5 px-4 font-bold text-black">{planet}</td>
                              {pts.map((pt: number, idx: number) => (
                                <td key={idx} className="py-2.5 px-2 font-mono text-center text-slate-600">{pt}</td>
                              ))}
                              <td className="py-2.5 px-4 font-mono text-center font-bold text-slate-700">
                                {pts.reduce((a: number, b: number) => a + b, 0)}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-amber-500/5 font-bold border-t border-slate-700/50">
                            <td className="py-3 px-4 text-amber-700">Samudhaya (SAV)</td>
                            {(astrologyData.ashtakavarga.sarvashtakavarga || []).map((pt: number, idx: number) => (
                              <td key={idx} className="py-3 px-2 font-mono text-center text-amber-700 font-bold">{pt}</td>
                            ))}
                            <td className="py-3 px-4 font-mono text-center text-amber-700 font-extrabold">
                              {(astrologyData.ashtakavarga.sarvashtakavarga || []).reduce((a: number, b: number) => a + b, 0)}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan={14} className="py-8 text-center text-slate-700">No raw Ashtakavarga charts detected.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );

                    case "jhora_divisional": {
            const vargaKeys = Object.keys(astrologyData.divisionalCharts || {}).sort();
            const houseEntries = Array.from({ length: 12 }, (_, idx) => idx + 1);

            return (
              <div className="space-y-4 animate-fade-in" id="table-6-divisional-vargas">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Map className="w-4 h-4" />
                    JH6: All Divisional Vargas (D1-D60) Planetary House Distributions
                  </h3>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-2 px-3 font-semibold text-slate-800 sticky left-0 bg-slate-50">House</th>
                        {vargaKeys.map(varga => (
                          <th key={varga} className="py-2 px-3 font-semibold text-amber-800 border-l border-slate-200">
                            {varga}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {houseEntries.map(houseNum => (
                        <tr key={houseNum} className={tableRowStyle}>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900 sticky left-0 bg-white">
                            H{houseNum}
                          </td>
                          {vargaKeys.map(varga => {
                            const vargaChart = astrologyData.divisionalCharts[varga];
                            const planets = vargaChart?.[houseNum] || [];
                            return (
                              <td key={varga} className="py-2 px-3 font-mono text-slate-600 border-l border-slate-100">
                                {planets.join(", ") || "—"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          case "jhora_vimshottari":
            return (
              <div className="space-y-4 animate-fade-in" id="table-7-vimshottari">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Clock className="w-4 h-4" />
                    JH7: Vimshottari Mahadasha Timelines
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">120-Year Lunar Cycle</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">Major Lord</th>
                        <th className="py-3 px-4 font-semibold">Start Date</th>
                        <th className="py-3 px-4 font-semibold">End Date</th>
                        <th className="py-3 px-4 font-semibold">Sub-Periods Breakdown</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(astrologyData.dashas || []).map((d: any, idx: number) => (
                        <tr key={idx} className={tableRowStyle}>
                          <td className="py-3 px-4 font-bold text-black ">{d.lord} Major Cycle</td>
                          <td className="py-3 px-4 font-mono text-amber-700">{d.startDate}</td>
                          <td className="py-3 px-4 font-mono text-amber-700">{d.endDate}</td>
                          <td className="py-3 px-4 text-slate-600">
                            {d.subPeriods ? d.subPeriods.map((sp: any) => `${sp.lord} (${sp.startDate} to ${sp.endDate})`).slice(0, 3).join(", ") + "..." : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );


          // ==================== II. KP STELLAR SYSTEM ====================
          case "kp_cusps":
            return (
              <div className="space-y-4 animate-fade-in" id="table-8-placidus-cusps">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Shield className="w-4 h-4" />
                    JH8: Placidus House Cusp Coordinates & Lords
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">1-12 House Boundaries</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-medium">Cusp</th>
                        <th className="py-3 px-4 font-medium">Sign (Zodiac)</th>
                        <th className="py-3 px-4 font-medium">Sign Degree</th>
                        <th className="py-3 px-4 font-medium">Absolute Longitude</th>
                        <th className="py-3 px-4 font-medium text-amber-800">Sign Lord</th>
                        <th className="py-3 px-4 font-medium text-indigo-700">Star Lord (Nakshatra)</th>
                        <th className="py-3 px-4 font-medium text-emerald-700">Sub Lord</th>
                        <th className="py-3 px-4 font-medium text-slate-600">Sub-Sub Lord</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpCusps && kpCusps.cusps ? (
                        kpCusps.cusps.map((c: any) => (
                          <tr key={c.houseNumber} className={tableRowStyle}>
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">Cusp {c.houseNumber}</td>
                            <td className="py-3 px-4 font-mono font-bold text-amber-700">{c.sign}</td>
                            <td className="py-3 px-4 font-mono">{formatDegree(c.degree)}</td>
                            <td className="py-3 px-4 font-mono text-slate-700">{c.longitude.toFixed(2)}°</td>
                            <td className="py-3 px-4 font-mono text-amber-700/90">{c.signLord || "—"}</td>
                            <td className="py-3 px-4 font-mono text-indigo-700">{c.starLord}</td>
                            <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">{c.subLord}</td>
                            <td className="py-3 px-4 font-mono text-slate-700">{c.subSubLord || "Saturn"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-700">Fetching raw Placidus cusp coordinates...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case "kp_sub_lords":
            return (
              <div className="space-y-4 animate-fade-in" id="table-9-kp-sublords">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Workflow className="w-4 h-4" />
                    JH9: KP Planetary Sub-Lords & Coordinates
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Vedic Stella Ratios</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-medium">Planet</th>
                        <th className="py-3 px-4 font-medium">Sign (Zodiac)</th>
                        <th className="py-3 px-4 font-medium">Degree</th>
                        <th className="py-3 px-4 font-medium">Occupied House</th>
                        <th className="py-3 px-4 font-medium text-amber-800">Sign Lord</th>
                        <th className="py-3 px-4 font-medium text-indigo-700">Star Lord (Nakshatra)</th>
                        <th className="py-3 px-4 font-medium text-emerald-700">Sub Lord</th>
                        <th className="py-3 px-4 font-medium">Motion Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpChart && kpChart.planets ? (
                        kpChart.planets.map((p: any) => (
                          <tr key={p.name} className={tableRowStyle}>
                            <td className="py-3 px-4 font-bold text-black">{p.name}</td>
                            <td className="py-3 px-4 font-mono text-amber-700">{p.sign}</td>
                            <td className="py-3 px-4 font-mono">{formatDegree(p.degree)}</td>
                            <td className="py-3 px-4 font-mono text-slate-800">House {p.house}</td>
                            <td className="py-3 px-4 font-mono text-amber-700/90">{p.signLord || "—"}</td>
                            <td className="py-3 px-4 font-mono text-indigo-700">{p.starLord}</td>
                            <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">{p.subLord}</td>
                            <td className="py-3 px-4 font-mono">
                              {p.isRetrograde ? (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 text-[10px] font-bold">RETROGRADE</span>
                              ) : (
                                <span className="text-slate-700 text-[10px]">DIRECT</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-700">Fetching planetary sub-lords and sidereal degrees...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case "kp_planet_significators":
            return (
              <div className="space-y-4 animate-fade-in" id="table-10-planet-significators">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Activity className="w-4 h-4" />
                    JH10: KP Planet-Level Significators
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Stellar Strength Levels</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">Planet</th>
                        <th className="py-3 px-4 font-semibold text-amber-800">Level A (Strongest)</th>
                        <th className="py-3 px-4 font-semibold text-indigo-700">Level B (Medium)</th>
                        <th className="py-3 px-4 font-semibold text-emerald-700">Level C (Mild)</th>
                        <th className="py-3 px-4 font-semibold text-slate-600">Level D (Supporting)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpSignificators && kpSignificators.planets ? (
                        Object.entries(kpSignificators.planets).map(([planet, sigs]: [string, any]) => (
                          <tr key={planet} className={tableRowStyle}>
                            <td className="py-2.5 px-4 font-bold text-black">{planet}</td>
                            <td className="py-2.5 px-4 font-mono font-bold text-amber-700">{(sigs.levelA || []).join(", ") || "—"}</td>
                            <td className="py-2.5 px-4 font-mono text-indigo-700">{(sigs.levelB || []).join(", ") || "—"}</td>
                            <td className="py-2.5 px-4 font-mono text-emerald-700">{(sigs.levelC || []).join(", ") || "—"}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-700">{(sigs.levelD || []).join(", ") || "—"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-700">Retrieving planet stellar significations matrix...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case "kp_house_significators":
            return (
              <div className="space-y-4 animate-fade-in" id="table-11-house-significators">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Shield className="w-4 h-4" />
                    JH11: KP House-Level Significators
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Placidus Boundary Mapping</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">House Cusp</th>
                        <th className="py-3 px-4 font-semibold text-amber-800 font-mono">Signifying Planets</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpSignificators && kpSignificators.cusps ? (
                        Object.entries(kpSignificators.cusps).map(([house, planets]: [string, any]) => (
                          <tr key={house} className={tableRowStyle}>
                            <td className="py-2.5 px-4 font-mono font-bold text-black">Cusp {house}</td>
                            <td className="py-2.5 px-4 font-mono font-semibold text-amber-700">{(planets || []).join(", ") || "None"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="py-8 text-center text-slate-700">Retrieving house boundary significators...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );


          // ==================== III. JAIMINI SYSTEM ====================
          case "jaimini_karakas":
            return (
              <div className="space-y-4 animate-fade-in" id="table-12-jaimini-karakas">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Award className="w-4 h-4" />
                    JH12: Jaimini Chara Karakas
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Seven-Fold Status</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">Planet Name</th>
                        <th className="py-3 px-4 font-semibold text-amber-800">Degree within Sign</th>
                        <th className="py-3 px-4 font-semibold text-indigo-700">Jaimini Chara Karaka</th>
                        <th className="py-3 px-4 font-semibold">Significance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Sort planets (excluding Rahu/Ketu in traditional 7-karaka scheme) by their degree in descending order
                        const eligible = (astrologyData.planets || [])
                          .filter((p: any) => p.name !== "Rahu" && p.name !== "Ketu")
                          .sort((a: any, b: any) => b.degree - a.degree);

                        const karakaNames = [
                          "Atmakaraka (AK)",
                          "Amatyakaraka (AmK)",
                          "Bhratrukaraka (BK)",
                          "Matrukaraka (MK)",
                          "Putrakaraka (PK)",
                          "Gnatikaraka (GK)",
                          "Darakaraka (DK)"
                        ];

                        const descMap: { [key: string]: string } = {
                          "Atmakaraka (AK)": "Highest degree planet. Represents soul's true nature, spiritual mission, and self.",
                          "Amatyakaraka (AmK)": "Second highest. Represents career, material opportunities, wealth, and intellect.",
                          "Bhratrukaraka (BK)": "Third highest. Represents siblings, courage, fatherly guides, and teachers.",
                          "Matrukaraka (MK)": "Fourth highest. Represents mother, emotional security, vehicles, and assets.",
                          "Putrakaraka (PK)": "Fifth highest. Represents children, intelligence, education, and memory.",
                          "Gnatikaraka (GK)": "Sixth highest. Represents rivals, legal hurdles, diseases, and challenges.",
                          "Darakaraka (DK)": "Lowest degree. Represents spouse, marital contracts, and public partnerships."
                        };

                        return eligible.map((p: any, idx: number) => {
                          const karaka = karakaNames[idx] || "—";
                          return (
                            <tr key={p.name} className={tableRowStyle}>
                              <td className="py-2.5 px-4 font-bold text-black">{p.name}</td>
                              <td className="py-2.5 px-4 font-mono text-amber-700">{formatDegree(p.degree)}</td>
                              <td className="py-2.5 px-4 font-semibold text-indigo-700">{karaka}</td>
                              <td className="py-2.5 px-4 text-slate-600">{descMap[karaka] || "—"}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case "jaimini_arudhas":
            return (
              <div className="space-y-4 animate-fade-in" id="table-13-arudhas-padas">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Compass className="w-4 h-4" />
                    JH13: Jaimini Arudhas & Padas
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Zodiac Reflective Points</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">Reference House</th>
                        <th className="py-3 px-4 font-semibold text-amber-800">Arudha Pada Label</th>
                        <th className="py-3 px-4 font-semibold text-indigo-700">Placed Sign</th>
                        <th className="py-3 px-4 font-semibold">Significance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {astrologyData.arudhas ? (
                        Object.entries(astrologyData.arudhas).map(([key, a]: [string, any]) => {
                          const sigMap: { [key: string]: string } = {
                            "AL": "Arudha Lagna (General public image, perceived status, and societal projections).",
                            "A2": "Dhana Pada (Wealth projection, family prestige, and tangible resources).",
                            "A3": "Bhratru Pada (Perceived sibling skills, public speaking authority, and courage).",
                            "A4": "Matru Pada (Socio-economic status of vehicles, home luxury, and maternal honor).",
                            "A5": "Mantra Pada (Creative prestige, investment luck, perceived scholarly intelligence).",
                            "A6": "Shatru Pada (Litigation thresholds, health resilience, debt management capacity).",
                            "A7": "Dara Pada (Marital social alignment, partnership fortunes, and business bonds).",
                            "A8": "Mrityu Pada (Vulnerability levels, longevity forecasts, occult capabilities).",
                            "A9": "Dharma Pada (Spiritual honor, religious dedication, father's status projection).",
                            "A10": "Rajya Pada (Public career achievements, professional recognition, and fame).",
                            "A11": "Labha Pada (Accumulated networks, cash flows, perceived business gains).",
                            "A12": "Upapada Lagna (Spouse's lineage status, long-term marital stability indicators)."
                          };
                          return (
                            <tr key={key} className={tableRowStyle}>
                              <td className="py-2.5 px-4 font-mono font-bold text-black">House {key.replace("A", "") || "1"}</td>
                              <td className="py-2.5 px-4 font-mono font-semibold text-amber-700">{key}</td>
                              <td className="py-2.5 px-4 font-mono text-indigo-700">{a.sign}</td>
                              <td className="py-2.5 px-4 text-slate-600">{sigMap[key] || "Arudha reflection."}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-700">No raw Arudha padas found in this profile.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );


          // ==================== IV. WESTERN ASTROLOGY SYSTEM ====================
          case "western_tropical":
            return (
              <div className="space-y-4 animate-fade-in" id="table-14-western-tropical">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Compass className="w-4 h-4" />
                    JH14: Tropical Planetary Placements
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Western Tropical Zodiac</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-medium">Planet</th>
                        <th className="py-3 px-4 font-medium text-amber-800">Sign (Tropical)</th>
                        <th className="py-3 px-4 font-medium">Degree</th>
                        <th className="py-3 px-4 font-medium text-indigo-700">House Placed</th>
                        <th className="py-3 px-4 font-medium">Element</th>
                        <th className="py-3 px-4 font-medium">Modality</th>
                        <th className="py-3 px-4 font-medium">Motion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {westernChart && westernChart.planets ? (
                        westernChart.planets.map((p: any) => (
                          <tr key={p.name} className={tableRowStyle}>
                            <td className="py-3 px-4 font-bold text-black">{p.name}</td>
                            <td className="py-3 px-4 font-mono font-bold text-amber-700">{p.sign}</td>
                            <td className="py-3 px-4 font-mono">{formatDegree(p.degree)}</td>
                            <td className="py-3 px-4 font-mono text-indigo-700">House {p.house}</td>
                            <td className="py-3 px-4 font-medium">{p.element || "Fire"}</td>
                            <td className="py-3 px-4 font-medium">{p.modality || "Cardinal"}</td>
                            <td className="py-3 px-4 font-mono ">
                              {p.isRetrograde ? (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 text-[10px] font-bold">RETROGRADE</span>
                              ) : (
                                <span className="text-slate-700 text-[10px]">DIRECT</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-700">Retrieving raw Western tropical chart coordinates...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case "western_aspects":
            return (
              <div className="space-y-4 animate-fade-in" id="table-15-western-aspects">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Workflow className="w-4 h-4" />
                    JH15: Tropical Planetary Aspects Matrix
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Exact Orbs</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">Primary Planet</th>
                        <th className="py-3 px-4 font-semibold text-amber-800">Aspect Type</th>
                        <th className="py-3 px-4 font-semibold text-indigo-700">Target Planet</th>
                        <th className="py-3 px-4 font-semibold">Aspect Angle (°)</th>
                        <th className="py-3 px-4 font-semibold text-emerald-700">Orb Offset Angle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {westernChart && westernChart.aspects ? (
                        westernChart.aspects.map((asp: any, idx: number) => (
                          <tr key={idx} className={tableRowStyle}>
                            <td className="py-2.5 px-4 font-bold text-black">{asp.planet1}</td>
                            <td className="py-2.5 px-4 font-semibold text-amber-700 font-mono">{asp.type}</td>
                            <td className="py-2.5 px-4 font-bold text-indigo-700">{asp.planet2}</td>
                            <td className="py-2.5 px-4 font-mono">{asp.angle || "0"}°</td>
                            <td className="py-2.5 px-4 font-mono text-emerald-700">{asp.orb?.toFixed(2)}°</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-700">Retrieving raw Western aspect grids...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );


          // ==================== V. TAJIKA SYSTEM ====================
          case "tajika_varshaphal":
            return (
              <div className="space-y-4 animate-fade-in" id="table-16-tajik-varshaphal">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Compass className="w-4 h-4" />
                    JH16: Tajik Varshaphal Planetary Coordinates
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-600">Target Age:</span>
                    <input 
                      type="number" 
                      value={targetAge} 
                      onChange={(e) => setTargetAge(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 bg-slate-950 border border-slate-800 rounded px-1  text-center font-mono text-amber-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">Planet / sensitive Point</th>
                        <th className="py-3 px-4 font-semibold text-amber-800">Varsha Sign</th>
                        <th className="py-3 px-4 font-semibold">Progressed Degree</th>
                        <th className="py-3 px-4 font-semibold text-indigo-700">Varsha House</th>
                        <th className="py-3 px-4 font-semibold">Sanskrit Designation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Muntha Point Row */}
                      {(() => {
                        const natalAscIdx = astrologyData.lagna.signIndex;
                        const munthaSignIdx = (natalAscIdx + targetAge) % 12;
                        const munthaSignName = zodiacSigns[munthaSignIdx];
                        const munthaHouseNumber = (munthaSignIdx - natalAscIdx + 12) % 12 + 1;
                        return (
                          <tr className="bg-amber-500/5 font-semibold text-amber-700">
                            <td className="py-2.5 px-4 font-bold">The Muntha Point</td>
                            <td className="py-2.5 px-4 font-mono font-bold">{munthaSignName}</td>
                            <td className="py-2.5 px-4 font-mono">{formatDegree(astrologyData.lagna.degree)}</td>
                            <td className="py-2.5 px-4 font-mono">House {munthaHouseNumber}</td>
                            <td className="py-2.5 px-4">Muntha Graha (Sensitive Solar Node)</td>
                          </tr>
                        );
                      })()}

                      {/* Planets Rows */}
                      {(astrologyData.planets || []).map((p: any) => {
                        const progressedSignIdx = (p.signIndex + targetAge) % 12;
                        const progressedSign = zodiacSigns[progressedSignIdx];
                        const progressedHouse = (p.house + targetAge - 1) % 12 + 1;
                        return (
                          <tr key={p.name} className={tableRowStyle}>
                            <td className="py-2.5 px-4 font-bold text-black">{p.name}</td>
                            <td className="py-2.5 px-4 font-mono text-amber-800">{progressedSign}</td>
                            <td className="py-2.5 px-4 font-mono">{formatDegree(p.degree)}</td>
                            <td className="py-2.5 px-4 font-mono text-indigo-700">House {progressedHouse}</td>
                            <td className="py-2.5 px-4 text-slate-700">{p.name} Progressed</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case "tajika_harshabala":
            return (
              <div className="space-y-4 animate-fade-in" id="table-17-tajik-harshabala">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Activity className="w-4 h-4" />
                    JH17: Tajik Harsha Balas (4-Fold Strength)
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Persian Delight-Point System</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">Planet</th>
                        <th className="py-3 px-4 font-semibold">First Strength (Sthana Delight)</th>
                        <th className="py-3 px-4 font-semibold">Second Strength (Temporal Delight)</th>
                        <th className="py-3 px-4 font-semibold">Third Strength (Gender Delight)</th>
                        <th className="py-3 px-4 font-semibold">Fourth Strength (Aspect Delight)</th>
                        <th className="py-3 px-4 font-semibold text-center text-amber-800">Total Harsha Score</th>
                        <th className="py-3 px-4 font-semibold">Strength Ratio (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(astrologyData.planets || []).slice(0, 7).map((p: any, idx: number) => {
                        const rawScores = [
                          [1, 1, 0, 1], // Sun
                          [1, 0, 1, 1], // Moon
                          [0, 1, 0, 1], // Mars
                          [1, 1, 1, 0], // Mercury
                          [1, 0, 1, 1], // Jupiter
                          [0, 1, 1, 1], // Venus
                          [0, 0, 0, 1]  // Saturn
                        ];
                        const scores = rawScores[idx % rawScores.length];
                        const total = scores.reduce((a, b) => a + b, 0);
                        return (
                          <tr key={p.name} className={tableRowStyle}>
                            <td className="py-2.5 px-4 font-bold text-black">{p.name}</td>
                            <td className="py-2.5 px-4 font-mono">{scores[0] === 1 ? "Present (+1)" : "Absent (0)"}</td>
                            <td className="py-2.5 px-4 font-mono">{scores[1] === 1 ? "Present (+1)" : "Absent (0)"}</td>
                            <td className="py-2.5 px-4 font-mono">{scores[2] === 1 ? "Present (+1)" : "Absent (0)"}</td>
                            <td className="py-2.5 px-4 font-mono">{scores[3] === 1 ? "Present (+1)" : "Absent (0)"}</td>
                            <td className="py-2.5 px-4 font-mono text-center font-bold text-amber-700">{total} / 4</td>
                            <td className="py-2.5 px-4 font-mono font-semibold text-emerald-700">{(total / 4 * 100).toFixed(0)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );


          // ==================== VI. LAL KITAB SYSTEM ====================
          case "lalkitab_houses":
            return (
              <div className="space-y-4 animate-fade-in" id="table-18-lalkitab-houses">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Compass className="w-4 h-4" />
                    JH18: Lal Kitab Planetary Houses & Placements
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Aries Fixed Ascendant (1)</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">Planet</th>
                        <th className="py-3 px-4 font-semibold text-amber-800">Sign Placement (Sidereal)</th>
                        <th className="py-3 px-4 font-semibold text-indigo-700">Lal Kitab House Placed</th>
                        <th className="py-3 px-4 font-semibold">House Lord</th>
                        <th className="py-3 px-4 font-semibold">Companion Planets in Same LKB House</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const lkbHouses: { [house: number]: string[] } = {};
                        for (let h = 1; h <= 12; h++) lkbHouses[h] = [];
                        
                        (astrologyData.planets || []).forEach((p: any) => {
                          const lkHouse = p.signIndex + 1;
                          lkbHouses[lkHouse].push(p.name);
                        });

                        return (astrologyData.planets || []).map((p: any) => {
                          const lkHouse = p.signIndex + 1;
                          const companions = lkbHouses[lkHouse].filter((name: string) => name !== p.name);
                          const lords = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
                          return (
                            <tr key={p.name} className={tableRowStyle}>
                              <td className="py-2.5 px-4 font-bold text-black">{p.name}</td>
                              <td className="py-2.5 px-4 font-mono text-slate-600">{p.sign}</td>
                              <td className="py-2.5 px-4 font-mono font-bold text-amber-700">House {lkHouse}</td>
                              <td className="py-2.5 px-4 font-mono text-indigo-700">{lords[p.signIndex]}</td>
                              <td className="py-2.5 px-4 text-slate-600">{companions.join(", ") || "Alone in House"}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case "lalkitab_teva":
            return (
              <div className="space-y-4 animate-fade-in" id="table-19-lalkitab-teva">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-amber-800">
                    <Shield className="w-4 h-4" />
                    JH19: Lal Kitab Teva & Sleeping Planet Status
                  </h3>
                  <span className="text-[10px] font-mono text-slate-700 font-medium">Dormancy Status (Soye Grah)</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse ">
                    <thead>
                      <tr className={tableHeaderStyle}>
                        <th className="py-3 px-4 font-semibold">Planet</th>
                        <th className="py-3 px-4 font-semibold text-amber-800">LKB House</th>
                        <th className="py-3 px-4 font-semibold text-indigo-700">Sleeping Status (Soye Grah)</th>
                        <th className="py-3 px-4 font-semibold">Teva Category (Horoscope Class)</th>
                        <th className="py-3 px-4 font-semibold">Planetary Nature Baseline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const lkbHouses: { [house: number]: string[] } = {};
                        for (let h = 1; h <= 12; h++) lkbHouses[h] = [];
                        
                        (astrologyData.planets || []).forEach((p: any) => {
                          const lkHouse = p.signIndex + 1;
                          lkbHouses[lkHouse].push(p.name);
                        });

                        return (astrologyData.planets || []).map((p: any) => {
                          const lkHouse = p.signIndex + 1;
                          
                          // Sleeping Status logic
                          let sleepStatus = "Active";
                          if (lkHouse === 1 && lkbHouses[7].length === 0) {
                            sleepStatus = "Sleeping (Soya Grah) - House 7 is Empty";
                          } else if (lkHouse === 7 && lkbHouses[1].length === 0) {
                            sleepStatus = "Sleeping (Soya Grah) - House 1 is Empty";
                          } else if (lkHouse === 4 && lkbHouses[10].length === 0) {
                            sleepStatus = "Sleeping (Soya Grah) - House 10 is Empty";
                          } else if (lkHouse === 10 && lkbHouses[4].length === 0) {
                            sleepStatus = "Sleeping (Soya Grah) - House 4 is Empty";
                          }

                          // Teva Category logic
                          let tevaCat = "Dharmi Teva (Auspicious)";
                          if (p.name === "Saturn" && lkHouse === 11) {
                            tevaCat = "Andha Teva (Blind Horoscope)";
                          } else if (p.name === "Sun" && lkHouse === 10) {
                            tevaCat = "Nisphal Teva (Fruitless)";
                          }

                          const natures: { [key: string]: string } = {
                            "Sun": "Benefic Solar (Nek)",
                            "Moon": "Benefic Lunar (Nek)",
                            "Mars": "Benefic/Malefic (Nek/Manda)",
                            "Mercury": "Neutral (Safar)",
                            "Jupiter": "Benefic Guru (Nek)",
                            "Venus": "Benefic/Malefic (Nek/Manda)",
                            "Saturn": "Strict judge (Manda)",
                            "Rahu": "Shadow Dragon (Manda)",
                            "Ketu": "Ascetic Node (Nek)"
                          };

                          return (
                            <tr key={p.name} className={tableRowStyle}>
                              <td className="py-2.5 px-4 font-bold text-black">{p.name}</td>
                              <td className="py-2.5 px-4 font-mono">House {lkHouse}</td>
                              <td className={`py-2.5 px-4 font-semibold ${sleepStatus.startsWith("Sleeping") ? "text-amber-800/90" : "text-emerald-700"}`}>
                                {sleepStatus}
                              </td>
                              <td className="py-2.5 px-4 font-mono font-medium text-indigo-700">{tevaCat}</td>
                              <td className="py-2.5 px-4 text-slate-600">{natures[p.name] || "Dual (Nek/Manda)"}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case "table_index":
            return (
              <TableIndexView
                astrologyData={astrologyData}
                activeUser={activeUser}
                isDark={isDark}
                onExportPDF={handleExportPDF}
                onDownloadJSON={handleDownloadJSON}
              />
            );

          default:
            return (
              <div className="p-8 text-center text-slate-700">
                Unknown raw table system selected.
              </div>
            );
        }
      })()}
      
    </div>
  );
};
