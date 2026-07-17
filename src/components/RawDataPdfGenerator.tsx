import React, { useState } from "react";
import { Download, RefreshCw, Info, CheckSquare, Square, Check, X } from "lucide-react";
import { generateRawAstrologyPDF } from "../lib/rawReportGenerator";

interface SubmenuItem {
  id: string;
  label: string;
  description: string;
  systemId?: string;
  originalId?: string;
  category?: string;
}

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

  // Available categories and submenus (Excluding MARRIAGE & SYNERGY and TRANSIT & MUHURTA)
  const categories = [
    {
      id: "jhora",
      name: "JHORA (Vedic Horoscope)",
      submenus: [
        { id: "overview", label: "Overview", description: "Vedic birth and panchanga elements." },
        { id: "planetary_positions", label: "Planetary Positions", description: "Degrees, Signs, Nakshatras and House placements." },
        { id: "planet_strength", label: "Planet Strength", description: "Shadbala index matrices." },
        { id: "bhava_strength", label: "Bhava Strength", description: "House strength indexes." },
        { id: "ashtakavarga", label: "Ashtakavarga", description: "Samudhaya Ashtakavarga charts." },
        { id: "yogas", label: "Yogas", description: "Auspicious combinations in natal charts." },
        { id: "doshas", label: "Doshas", description: "Manglik and Kaal Sarp analysis." },
        { id: "vimshottari", label: "Vimshottari Dasha", description: "120-year cycle." },
        { id: "yogini", label: "Yogini Dasha", description: "36-year cycle." },
        { id: "ashtottari", label: "Ashtottari Dasha", description: "108-year cycle." },
        { id: "longevity", label: "Longevity", description: "Traditional life span calculations." },
        { id: "sade_sati", label: "Sade Sati", description: "Saturn transit timeline cycles." },
        // Divisional Charts
        { id: "d1_rasi", label: "D1 Rasi", description: "General birth chart." },
        { id: "d9_navamsa", label: "D9 Navamsa", description: "Dharma, marriage, and potential." },
        { id: "d10_dasamsa", label: "D10 Dasamsa", description: "Profession, achievements, and fame." },
        // Predictions
        { id: "arudhas", label: "Arudhas", description: "Image and projection reflections." },
        { id: "sphutas", label: "Sphutas", description: "Highly sensitive coordinate points." },
        { id: "upagrahas", label: "Upagrahas", description: "Shadow planets calculations." },
        { id: "sahams", label: "Sahams", description: "Arabic/Tajik sensitive lots." },
        { id: "special_lagnas", label: "Special Lagnas", description: "Hora, Ghati, and Bhava Ascendants." }
      ]
    },
    {
      id: "kp_stellar",
      name: "KP STELLAR (System)",
      submenus: [
        { id: "kp_dashboard", label: "Dashboard", description: "Overview, Provider Health & Status." },
        { id: "kp_rulebook", label: "KP Rulebook", description: "Krishnamurti Paddhati rules & evidence engine." },
        { id: "kp_cusps", label: "Cusps", description: "12 Cusps, Degrees & Sub-Lords." },
        { id: "kp_planet_analysis", label: "Planet Analysis", description: "Planet Star-Lord & Sub-Lord placements." },
        { id: "kp_significators", label: "Significators", description: "Planet & House level significators." },
        { id: "kp_ruling_planets", label: "Ruling Planets", description: "Day, Moon & Ascendant rulers." },
        { id: "kp_dasha", label: "KP Dasha", description: "KP Vimshottari & event period indicators." },
        { id: "kp_transit", label: "Transit", description: "Real-time coordinate significations." },
        { id: "kp_horary", label: "Horary", description: "Prashna seed number calculations." }
      ]
    },
    {
      id: "western",
      name: "WESTERN (Tropical)",
      submenus: [
        { id: "west_dashboard", label: "Dashboard", description: "Overview & Provider Health." },
        { id: "west_natal_chart", label: "Natal Chart", description: "Tropical circular wheel chart." },
        { id: "west_positions", label: "Positions", description: "Degrees, Signs, and Houses." },
        { id: "west_aspects", label: "Aspects", description: "Planetary aspects and aspect grid." },
        { id: "west_synastry", label: "Synastry", description: "Synastry & Composite compatibility." },
        { id: "west_transits", label: "Transits", description: "Solar return and active transits." }
      ]
    },
    {
      id: "mystical",
      name: "MYSTICAL (Esoteric)",
      submenus: [
        { id: "eso_nadi", label: "Nadi Astrology", description: "Fine divisions (Nadi Amsas) and guidelines." },
        { id: "eso_lalkitab", label: "Lal Kitab", description: "Fixed Aries Ascendant house-remedies." },
        { id: "eso_varshaphala", label: "Tajik Varshaphala", description: "Progression solar return calculations." },
        { id: "eso_bazi", label: "Chinese BaZi", description: "The Four Pillars of Destiny (Stems & Branches)." },
        { id: "eso_numerology", label: "Numerology", description: "Pythagorean & Chaldean numbers profile." },
        { id: "eso_celtic", label: "Celtic Tree", description: "Sacred lunar tree zodiac signs." },
        { id: "eso_mayan", label: "Mayan Calendar", description: "Tzolkin & Haab Kin signature calculator." }
      ]
    }
  ];

  // Store selected submenus (by default, select ALL parameters to include all systems' complete data)
  const allSubmenuIds = categories.flatMap(c => c.submenus.map(s => s.id));
  const [selected, setSelected] = useState<string[]>(allSubmenuIds);

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllCategory = (catId: string, value: boolean) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    const ids = cat.submenus.map(s => s.id);
    if (value) {
      setSelected(prev => Array.from(new Set([...prev, ...ids])));
    } else {
      setSelected(prev => prev.filter(x => !ids.includes(x)));
    }
  };

  const handleSelectAllGlobal = (value: boolean) => {
    if (value) {
      const allIds = categories.flatMap(c => c.submenus.map(s => s.id));
      setSelected(allIds);
    } else {
      setSelected([]);
    }
  };

  const handleCompileRawPdf = async () => {
    if (selected.length === 0) {
      alert("Please select at least one Astro Submenu parameter to export.");
      return;
    }

    try {
      setCompiling(true);
      let targetData = astrologyData;

      if (!targetData) {
        // Dynamically calculate the high-precision 1976-01-06 profile first
        const defaultRes = await fetch("/api/astrology/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Native",
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
        submenus: selected
      });

      doc.save(`Raw_Data_Stellar_Report_${Date.now()}.pdf`);
    } catch (err: any) {
      console.error("Failed to generate raw data PDF:", err);
      alert("Failed to compile raw data PDF: " + err.message);
    } finally {
      setCompiling(false);
    }
  };

  const cardStyle = isDark
    ? "bg-slate-950/40 border-slate-800/80"
    : "bg-white border-neutral-200 shadow-sm";

  const textPrimary = isDark ? "text-slate-100" : "text-neutral-900";
  const textSecondary = isDark ? "text-slate-400" : "text-neutral-500";
  const innerBg = isDark ? "bg-slate-900/30" : "bg-neutral-50";

  return (
    <div className={`p-5 rounded-xl border ${cardStyle} space-y-5`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <span className="bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            Stellar Data Exporter
          </span>
          <h4 className={`text-sm font-bold ${textPrimary} mt-2`}>Astro Submenu Raw Data PDF Compiler</h4>
          <p className="text-xs text-slate-400">Custom compile raw calculations from JHora, KP, Western, and Mystical systems.</p>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => handleSelectAllGlobal(true)}
            className="text-[10px] px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 font-semibold cursor-pointer transition-colors"
          >
            Select All
          </button>
          <button
            onClick={() => handleSelectAllGlobal(false)}
            className="text-[10px] px-2 py-1 rounded bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 font-semibold cursor-pointer transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Excluded notice bar */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/15 text-[11px] text-indigo-300">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Security & Policy Compliance Guard:</strong> Marriage compatibility profiles (MARRIAGE & SYNERGY) and celestial transit/daily elections (TRANSIT & MUHURTA) are strictly excluded from this raw export payload.
        </p>
      </div>

      {/* Grid of categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {categories.map(cat => {
          const catCheckedCount = cat.submenus.filter(s => selected.includes(s.id)).length;
          const isAllCatChecked = catCheckedCount === cat.submenus.length;
          
          return (
            <div key={cat.id} className={`p-3 rounded-lg border ${isDark ? "border-slate-800/60 bg-slate-950/20" : "border-neutral-100 bg-neutral-50/50"} space-y-3`}>
              <div className="flex items-center justify-between border-b border-indigo-500/5 pb-2">
                <span className="text-[11px] font-mono font-bold tracking-wider text-amber-500 uppercase">{cat.name}</span>
                <button
                  type="button"
                  onClick={() => handleSelectAllCategory(cat.id, !isAllCatChecked)}
                  className="text-[9px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  {isAllCatChecked ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {cat.submenus.map(sub => {
                  const isChecked = selected.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      onClick={() => toggleSelect(sub.id)}
                      className={`flex items-start gap-2.5 p-2 rounded text-left transition-all text-xs border ${
                        isChecked 
                          ? "bg-indigo-500/5 border-indigo-500/20 text-slate-200" 
                          : "border-transparent text-slate-400 hover:bg-slate-900/10 hover:text-slate-300"
                      }`}
                    >
                      <span className="mt-0.5 text-indigo-400">
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <div className="space-y-0.5 leading-none">
                        <span className="block font-medium text-[11px]">{sub.label}</span>
                        <span className="block text-[9px] text-slate-500 font-normal">{sub.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-indigo-500/5 flex items-center justify-between gap-4">
        <span className="text-[10px] text-slate-500">
          Selected submenus: <strong>{selected.length}</strong> parameters included in raw print layout.
        </span>
        <button
          onClick={handleCompileRawPdf}
          disabled={compiling}
          className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
        >
          {compiling ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Compiling Raw PDF...
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              Compile & Download Raw Data PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};
