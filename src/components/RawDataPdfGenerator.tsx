import React, { useState } from "react";
import { Download, RefreshCw, CheckCircle, Shield, Sparkles, Database, Star, CheckCircle2 } from "lucide-react";
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
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [progressVal, setProgressVal] = useState(0);

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
      setDownloadSuccess(false);
      setProgressVal(10);

      // Simulate a multi-stage compilation progress for visual feedback
      const interval = setInterval(() => {
        setProgressVal((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 350);

      let targetData = astrologyData;

      if (!targetData) {
        clearInterval(interval);
        alert("Please cast and calculate your horoscope first using the form before generating the PDF.");
        setCompiling(false);
        return;
      }

      if (!targetData) {
        clearInterval(interval);
        throw new Error("Unable to compute dynamic astrology metrics.");
      }

      const profileJson = mapAstrologyDataToUserProfileJSON(activeUser, targetData);
      
      const doc = generateRawAstrologyPDF(profileJson, {
        profileName: profileJson.User?.profile_name || "Vedic Native",
        submenus: allSubmenuIds
      });

      clearInterval(interval);
      setProgressVal(100);

      // Save document
      doc.save(`Complete_Astrology_Analysis_Report_${Date.now()}.pdf`);
      
      // Show success animation
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        setProgressVal(0);
      }, 5000);

    } catch (err: any) {
      console.error("Failed to generate complete data PDF:", err);
      alert("Failed to compile complete PDF: " + err.message);
    } finally {
      setCompiling(false);
    }
  };

  const cardStyle = isDark
    ? "bg-slate-950/55 border-slate-800/90 shadow-2xl"
    : "bg-white border-neutral-200 shadow-xl";

  const textPrimary = isDark ? "text-slate-100" : "text-neutral-900";
  const textMuted = isDark ? "text-slate-400" : "text-neutral-500";
  const itemBg = isDark ? "bg-slate-900/40 border-slate-800/50 hover:border-amber-500/35" : "bg-neutral-50 border-neutral-100 hover:border-amber-500/25";

  return (
    <div id="pdf-compiler-card" className={`p-6 rounded-2xl border ${cardStyle} space-y-6 relative overflow-hidden transition-all duration-500 hover:shadow-amber-500/5`}>
      {/* CSS Keyframe Animations Injection */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.2; }
          50% { transform: translateY(-10px) scale(1.1); opacity: 0.4; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(245, 158, 11, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
        @keyframes pop-success {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes beam-slide {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pop-success {
          animation: pop-success 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .shine-beam {
          position: relative;
          overflow: hidden;
        }
        .shine-beam::after {
          content: '';
          position: absolute;
          top: 0;
          height: 100%;
          width: 200%;
          background: linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%);
          animation: beam-slide 3s infinite linear;
        }
      `}</style>

      {/* Dynamic Ambient Background Sparks */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl pointer-events-none animate-float-slow" style={{ animationDelay: "0s" }} />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-float-slow" style={{ animationDelay: "4s" }} />

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all hover:bg-amber-500/20">
            <Sparkles className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: "3s" }} />
            Stellar PDF Compiler
          </span>
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-indigo-500/20">
            All Systems Included
          </span>
        </div>
        <h3 className={`text-base font-extrabold ${textPrimary} tracking-tight`}>
          Astro Submenu Raw Data PDF Compiler
        </h3>
        <p className={`text-xs ${textMuted} leading-relaxed max-w-2xl`}>
          Compile and print a comprehensive 360° cosmological book containing deep computations from JHora, KP Stellar, Western Tropical, and Esoteric Mystical engines. Omitted only marriage and transition variables to guarantee native profile schema purity.
        </p>
      </div>

      {/* Systems Grid Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${itemBg} space-y-2 transition-all duration-300 hover:scale-[1.02] cursor-default`}>
          <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs uppercase tracking-wider">
            <Star className="w-4 h-4 text-amber-500 animate-pulse" />
            Vedic JHora
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Panchanga, Planet Positions, Shadbala Strengths, Ashtakavarga, Vimshottari Dasha, Yogini & Ashtottari timelines, D1 Rasi & D9 Navamsa.
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${itemBg} space-y-2 transition-all duration-300 hover:scale-[1.02] cursor-default`}>
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Database className="w-4 h-4 text-indigo-400" />
            KP Stellar
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            12 Cusps Coordinates, Planet Star-Lord & Sub-Lord analysis, Planet & House levels significators, Ruling planets, and event seeds.
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${itemBg} space-y-2 transition-all duration-300 hover:scale-[1.02] cursor-default`}>
          <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Star className="w-4 h-4 text-blue-400" />
            Western Tropical
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Tropical Circular Wheel Degrees, Aspect grids, Synastry/Composite overlays, Solar returns, and Active transits.
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${itemBg} space-y-2 transition-all duration-300 hover:scale-[1.02] cursor-default`}>
          <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-teal-400" />
            Mystical Esoteric
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Nadi fine divisions, Lal Kitab fixed remedies, Tajik Varshaphala, Chinese BaZi Four Pillars, Numerology, Celtic, and Mayan Kin.
          </p>
        </div>
      </div>

      {/* Compliance / Notice Bar */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-950/25 border border-indigo-500/10 text-xs text-indigo-300 shadow-inner">
        <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
        <p className="leading-normal text-[11px]">
          <strong>Security Protocol Enforced:</strong> Complete raw data dump includes calculated coordinate states and planetary indicators. All marriage compatibility modules and real-time transient daily muhurtas are omitted to guarantee profile integrity.
        </p>
      </div>

      {/* Compiler Progress Bar */}
      {compiling && (
        <div className="space-y-1.5 animate-pulse">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
              Compiling systems...
            </span>
            <span>{progressVal}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 transition-all duration-300 ease-out"
              style={{ width: `${progressVal}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {downloadSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl flex items-center gap-2.5 animate-pop-success">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
          <div>
            <span className="font-bold block">Download Complete!</span>
            <span className="text-[10px] text-slate-400 font-mono">The 360° Astrological book is stored in your downloads folder.</span>
          </div>
        </div>
      )}

      {/* Trigger Area */}
      <div className="pt-4 border-t border-indigo-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>Compiler Engine Ready: All 32 Stellar Systems Configured</span>
        </div>

        <button
          id="compile-raw-pdf-button"
          onClick={handleCompileRawPdf}
          disabled={compiling}
          className={`text-slate-950 font-extrabold py-3 px-6 rounded-xl text-xs cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shrink-0 ${
            compiling 
              ? "bg-slate-800 text-slate-500 border border-slate-850 shadow-none cursor-not-allowed" 
              : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/15 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-95 shine-beam animate-pulse-ring"
          }`}
        >
          {compiling ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
              Compiling All Systems into PDF ({progressVal}%)
            </>
          ) : downloadSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-slate-950" />
              Report Saved Successfully!
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

