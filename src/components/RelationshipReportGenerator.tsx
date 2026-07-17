/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  FileText,
  Download,
  Sparkles,
  Heart,
  Calendar,
  ShieldAlert,
  Clock,
  Settings,
  HelpCircle,
  CheckCircle2,
  Activity,
  Compass,
  User,
  AlertCircle,
  BadgeAlert,
  Printer,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { AstrologyData } from "../lib/astrology";
import { calculateUnifiedRelationshipEvidence } from "../lib/rules/unifiedRelationshipEvidenceEngine";
import {
  generateRelationshipPDF,
  generateRelationshipDOCX,
  generateRelationshipJSON
} from "../lib/relationshipReportGenerator";

interface RelationshipReportGeneratorProps {
  astrologyData: AstrologyData;
  isDark: boolean;
}

export const RelationshipReportGenerator: React.FC<RelationshipReportGeneratorProps> = ({
  astrologyData,
  isDark
}) => {
  const [partnerName, setPartnerName] = useState<string>("");
  const [targetAge, setTargetAge] = useState<number>(28);
  const [selectedReportType, setSelectedReportType] = useState<string>("Complete Relationship Report");
  const [selectedOption, setSelectedOption] = useState<"Minimal" | "Standard" | "Professional" | "Research Edition">("Professional");
  const [selectedFormat, setSelectedFormat] = useState<"PDF" | "DOCX" | "JSON">("PDF");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedReports, setGeneratedReports] = useState<Array<{ name: string; type: string; format: string; date: string }>>([]);

  const reportTypes = [
    { name: "Complete Relationship Report", desc: "Exhaustive multi-system diagnostic of all 15 topics.", icon: Heart, color: "text-rose-500" },
    { name: "Marriage Promise Report", desc: "Analyzes legal promise of marriage in the lifetime chart.", icon: CheckCircle2, color: "text-emerald-500" },
    { name: "Marriage Timing Report", desc: "Focuses on active Dasha and transit timing windows.", icon: Clock, color: "text-indigo-500" },
    { name: "Love Marriage Report", desc: "Evaluates 5th and 7th house co-signifiers for self-selection.", icon: Sparkles, color: "text-amber-500" },
    { name: "Arranged Marriage Report", desc: "Traces traditional, parentally guided introduction charts.", icon: Compass, color: "text-teal-500" },
    { name: "Marriage Delay Report", desc: "Flags Saturnian obstacles and age 28+ stabilization points.", icon: Calendar, color: "text-orange-500" },
    { name: "Divorce Analysis Report", desc: "Delineates destructive 1, 6, 10 house combinations.", icon: ShieldAlert, color: "text-red-500" },
    { name: "Separation Report", desc: "Traces geographical and emotional distance configurations.", icon: Activity, color: "text-pink-500" },
    { name: "Remarriage Report", desc: "Probes 9th house secondary union structures.", icon: RefreshCw, color: "text-violet-500" },
    { name: "Spouse Prediction Report", desc: "Outlines career, features, and nature of your future spouse.", icon: User, color: "text-cyan-500" },
    { name: "Married Life Report", desc: "Measures mutual domestic harmony and daily alignment.", icon: SmileIcon, color: "text-yellow-500" },
    { name: "Relationship Timeline Report", desc: "Details milestones mapped across standard lifetimes.", icon: Clock, color: "text-blue-500" },
    { name: "Relationship Remedies Report", desc: "Focuses on planetary remedies, gem prescriptions, and fasts.", icon: Sparkles, color: "text-lime-500" },
    { name: "Executive Summary Report", desc: "A brief, ultra-condensed overview for rapid analysis.", icon: FileText, color: "text-slate-500" }
  ];

  const reportOptions = [
    { id: "Minimal", label: "Minimal Edition", desc: "3 pages. Core highlights & main consensus score." },
    { id: "Standard", label: "Standard Edition", desc: "5 pages. Detailed findings matrix & basic AI analysis." },
    { id: "Professional", label: "Professional Edition", desc: "8 pages. Complete multi-system audit, full AI synthesis." },
    { id: "Research Edition", label: "Research Edition", desc: "10 pages. Includes full technical logs, weights & appendix." }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const activePartner = partnerName.trim() || "Auspicious Partner";

      // 1. Calculate the real-time Unified Evidence Engine outputs on the client
      const evidence = calculateUnifiedRelationshipEvidence(
        astrologyData,
        undefined,
        targetAge
      );

      // 2. Fetch the corresponding AI Relationship Expert expertData
      const apiResponse = await fetch("/api/astrology/ai-relationship-expert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evidence,
          question: `Generate a high-fidelity ${selectedReportType} for ${astrologyData.nativeName || "Native"} and ${activePartner} at age ${targetAge}. Please organize the response with clear headers, citation references, and bespoke recommendations tailored to this query.`
        })
      });

      if (!apiResponse.ok) {
        throw new Error("Failed to communicate with AI Relationship Expert service.");
      }

      const expertData = await apiResponse.json();

      // 3. Trigger generation based on selected format
      const profileName = astrologyData.nativeName || "Vedic Native";

      if (selectedFormat === "PDF") {
        const doc = generateRelationshipPDF({
          profileName,
          partnerName: activePartner,
          reportType: selectedReportType,
          reportOption: selectedOption,
          targetAge,
          evidence,
          expertData
        });
        doc.save(`${selectedReportType.replace(/\s+/g, "_")}_${profileName}_${Date.now()}.pdf`);
      } else if (selectedFormat === "DOCX") {
        const blob = await generateRelationshipDOCX({
          profileName,
          partnerName: activePartner,
          reportType: selectedReportType,
          reportOption: selectedOption,
          targetAge,
          evidence,
          expertData
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedReportType.replace(/\s+/g, "_")}_${profileName}_${Date.now()}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (selectedFormat === "JSON") {
        const jsonStr = generateRelationshipJSON({
          profileName,
          partnerName: activePartner,
          reportType: selectedReportType,
          reportOption: selectedOption,
          targetAge,
          evidence,
          expertData
        });
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedReportType.replace(/\s+/g, "_")}_${profileName}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setGeneratedReports(prev => [
        {
          name: `${selectedReportType} (${activePartner})`,
          type: selectedOption,
          format: selectedFormat,
          date: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during report compilation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const containerStyle = isDark
    ? "bg-slate-900 border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-800";

  const cardStyle = isDark
    ? "bg-slate-950/40 border-slate-900"
    : "bg-slate-50 border-slate-100";

  const inputStyle = isDark
    ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500"
    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500";

  const headingStyle = isDark ? "text-slate-100" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`p-6 rounded-2xl border ${containerStyle} space-y-8`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className={`text-xl font-sans font-semibold flex items-center gap-2 ${headingStyle}`}>
            <Printer className="w-5.5 h-5.5 text-indigo-500" />
            Professional Relationship Report Compiler
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Download comprehensive astrological partnership narratives. No calculation overrides, strictly grounded in multi-system consensus logic.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <CheckCircle2 className="w-4 h-4" />
          7-System Rules Checked
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Options Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metadata inputs */}
          <div className={`p-5 rounded-xl border ${cardStyle} space-y-4`}>
            <div className="flex items-center gap-2 font-semibold text-xs text-indigo-400 border-b border-indigo-500/15 pb-2">
              <User className="w-4 h-4" />
              PARTNERSHIP METADATA SETUP
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Primary Native Name</label>
                <div className={`px-3 py-2 rounded-xl text-xs font-semibold ${isDark ? "bg-slate-900 text-slate-300" : "bg-slate-200 text-slate-700"}`}>
                  {astrologyData.nativeName || "Vedic Native"}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Auspicious Partner Name</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. Priyanjali Sen"
                  className={`w-full px-3 py-1.5 rounded-xl text-xs outline-none border transition-all ${inputStyle}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Evaluation Target Age</label>
                <input
                  type="number"
                  value={targetAge}
                  onChange={(e) => setTargetAge(Math.max(1, parseInt(e.target.value) || 28))}
                  min={1}
                  max={120}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs outline-none border transition-all ${inputStyle}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Output Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {["PDF", "DOCX", "JSON"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setSelectedFormat(fmt as any)}
                      className={`py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                        selectedFormat === fmt
                          ? "bg-indigo-500 border-indigo-600 text-slate-950 shadow-md"
                          : isDark
                          ? "bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Report Edition Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-slate-400" />
              Select Report Format Option
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reportOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id as any)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedOption === opt.id
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-sm"
                      : isDark
                      ? "bg-slate-950/40 border-slate-900 hover:border-slate-800 text-slate-300"
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <span className="font-bold text-xs block">{opt.label}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action trigger */}
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className={`w-full py-3 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
              isGenerating
                ? "bg-indigo-500/30 text-indigo-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-slate-950 font-bold shadow-lg shadow-indigo-500/10 active:scale-98"
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Assembling Multi-System Consensus, Generating {selectedFormat}...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-950" />
                <span>Compile & Download {selectedReportType} ({selectedFormat})</span>
              </>
            )}
          </button>
        </div>

        {/* Right Report Types Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-400" />
            Choose Report Focus Type
          </label>

          <div className={`max-h-[460px] overflow-y-auto border rounded-xl divide-y p-1.5 space-y-1 ${cardStyle} divide-slate-800/10`}>
            {reportTypes.map((type) => {
              const IconComp = type.icon;
              const isSelected = selectedReportType === type.name;
              return (
                <button
                  key={type.name}
                  onClick={() => setSelectedReportType(type.name)}
                  className={`w-full p-2.5 rounded-lg text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-500/10 text-indigo-400 font-semibold"
                      : isDark
                      ? "hover:bg-slate-900/60 text-slate-300"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${isDark ? "bg-slate-900" : "bg-white"} border border-slate-800/10 shadow-sm`}>
                    <IconComp className={`w-4 h-4 ${type.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs block font-bold truncate">{type.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{type.desc}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 mt-2 opacity-40 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Local Archive List */}
          {generatedReports.length > 0 && (
            <div className={`p-4 rounded-xl border ${cardStyle} space-y-2.5`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Generated in Current Session</span>
              <div className="space-y-1.5">
                {generatedReports.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] text-slate-400 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10">
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="font-bold text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="text-[9px] font-semibold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded uppercase shrink-0">
                      {item.format}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Standard Simple Smile Icon proxy
 */
const SmileIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
};
