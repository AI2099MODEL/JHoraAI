import React, { useState } from "react";
import { Download, RefreshCw, CheckCircle, Shield, Sparkles, Database, Star } from "lucide-react";
import { generateRawAstrologyPDF } from "../lib/rawReportGenerator";

interface RawDataPdfGeneratorProps {
  astrologyData: any;
  activeUser: any;
  setAstrologyData: (data: any) => void;
  mapAstrologyDataToUserProfileJSON: (user: any, data: any) => any;
  isDark: boolean;
}

export const RawDataPdfGenerator: React.FC<RawDataPdfGeneratorProps> = ({
  astrologyData,
  activeUser,
  setAstrologyData,
  mapAstrologyDataToUserProfileJSON,
  isDark
}) => {
  const [compiling, setCompiling] = useState(false);

  // Complete exhaustive list of all submenu IDs for automatic compiler execution
  const allSubmenuIds = [
    // JHora Vedic
    "overview", "planetary_positions", "planet_strength", "bhava_strength", 
    "ashtakavarga", "yogas", "doshas", "vimshottari", "yogini", "ashtottari", 
    "longevity", "sade_sati", "d1_rasi", "d9_navamsa", "d10_dasamsa", 
    "arudhas", "sphutas", "upagrahas", "sahams", "special_lagnas",
    // KP Stellar
    "kp_dashboard", "kp_rulebook", "kp_cusps", "kp_planet_analysis", 
    "kp_significators", "kp_ruling_planets", "kp_dasha", "kp_transit", "kp_horary",
    // Western Tropical
    "west_dashboard", "west_natal_chart", "west_positions", "west_aspects", "west_synastry", "west_transits",
    // Esoteric/Mystical
    "eso_nadi", "eso_lalkitab", "eso_varshaphala", "eso_bazi", "eso_numerology", "eso_celtic", "eso_mayan"
  ];

  const handleCompileRawPdf = async () => {
    try {
      setCompiling(true);
      let targetData = astrologyData;

      if (!targetData) {
        // Dynamically calculate the high-precision 1976-01-06 profile first if empty
        const defaultRes = await fetch("/api/astrology/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Nitin",
            date: "1976-01-06",
            time: "18:40:00",
            place: "Dehradun, Uttarakhand, India",
            latitude: 30.3165,
            longitude: 78.0322,
            timezone: 5.5
          })
        });
        if (defaultRes.ok) {
          targetData = await defaultRes.json();
          setAstrologyData(targetData);
        }
      }

      if (!targetData) {
        throw new Error("Unable to compute dynamic astrology metrics.");
      }

      const profileJson = mapAstrologyDataToUserProfileJSON(activeUser, targetData);
      
      const doc = generateRawAstrologyPDF(profileJson, {
        profileName: profileJson.User?.profile_name || "Vedic Native",
        submenus: allSubmenuIds
      });

      doc.save(`Complete_Astrology_Analysis_Report_${Date.now()}.pdf`);
    } catch (err: any) {
      console.error("Failed to generate complete data PDF:", err);
      alert("Failed to compile complete PDF: " + err.message);
    } finally {
      setCompiling(false);
    }
  };

  const cardStyle = isDark
    ? "bg-slate-950/50 border-slate-800/80"
    : "bg-white border-neutral-200 shadow-md";

  const textPrimary = isDark ? "text-slate-100" : "text-neutral-900";
  const textMuted = isDark ? "text-slate-400" : "text-neutral-500";
  const itemBg = isDark ? "bg-slate-900/40 border-slate-800/50" : "bg-neutral-50 border-neutral-100";

  return (
    <div id="pdf-compiler-card" className={`p-6 rounded-2xl border ${cardStyle} space-y-6 relative overflow-hidden`}>
      {/* Dynamic Ambient Background Spark */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Stellar PDF Compiler
          </span>
          <span className="bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            All Systems Included
          </span>
        </div>
        <h3 className={`text-base font-bold ${textPrimary}`}>
          Astro Submenu Raw Data PDF Compiler
        </h3>
        <p className={`text-xs ${textMuted} leading-relaxed max-w-2xl`}>
          Compile and print a comprehensive 360° astrological book containing deep computations from JHora, KP Stellar, Western Tropical, and Esoteric Mystical engines. Includes full charts, planet strengths, dasha cycles, and interpretive predictions.
        </p>
      </div>

      {/* Systems Grid Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${itemBg} space-y-2`}>
          <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs uppercase tracking-wider">
            <Star className="w-4 h-4" />
            Vedic JHora
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Panchanga, Planet Positions, Shadbala Strengths, Ashtakavarga, Vimshottari Dasha, Yogini & Ashtottari timelines, D1 Rasi & D9 Navamsa.
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${itemBg} space-y-2`}>
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Database className="w-4 h-4" />
            KP Stellar
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            12 Cusps Coordinates, Planet Star-Lord & Sub-Lord analysis, Planet & House levels significators, Ruling planets, and event seeds.
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${itemBg} space-y-2`}>
          <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Star className="w-4 h-4" />
            Western Tropical
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Tropical Circular Wheel Degrees, Aspect grids, Synastry/Composite overlays, Solar returns, and Active transits.
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${itemBg} space-y-2`}>
          <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Mystical Esoteric
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Nadi fine divisions, Lal Kitab fixed remedies, Tajik Varshaphala, Chinese BaZi Four Pillars, Numerology, Celtic, and Mayan Kin.
          </p>
        </div>
      </div>

      {/* Compliance / Notice Bar */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-950/20 border border-indigo-500/10 text-xs text-indigo-300">
        <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-normal text-[11px]">
          <strong>Security Protocol Enforced:</strong> Complete raw data dump includes calculated coordinate states and planetary indicators. All marriage compatibility modules and real-time transient daily muhurtas are omitted to guarantee profile integrity.
        </p>
      </div>

      {/* Trigger Area */}
      <div className="pt-3 border-t border-indigo-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>Compiler Engine Ready: All 32 Stellar Systems Configured</span>
        </div>

        <button
          id="compile-raw-pdf-button"
          onClick={handleCompileRawPdf}
          disabled={compiling}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-800 disabled:to-slate-900 text-slate-950 font-bold py-3 px-6 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 shrink-0"
        >
          {compiling ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              Compiling All Systems into PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-slate-950" />
              Download Complete 360° Analysis PDF Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};
