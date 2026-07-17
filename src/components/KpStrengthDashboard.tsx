/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Award, 
  Info, 
  Sparkles, 
  Database, 
  Search, 
  Mail, 
  CloudLightning, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  FileText,
  Bookmark,
  Share2
} from "lucide-react";
import { getGoogleOAuthToken } from "../lib/googleApi";

interface StrengthRecord {
  planet: string;
  house: number;
  evidence: string[];
  evidenceCount: number;
  grade: string;
}

interface KpStrengthDashboardProps {
  astrologyData: any;
  isDarkTheme: boolean;
}

export default function KpStrengthDashboard({ astrologyData, isDarkTheme }: KpStrengthDashboardProps) {
  // Input text state
  const [inputText, setInputText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("ALL");
  
  // Status states
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error" | "loading" | null; message: string }>({ type: null, message: "" });
  const [driveStatus, setDriveStatus] = useState<{ type: "success" | "error" | "loading" | null; message: string }>({ type: null, message: "" });
  
  // Sample Data matching user instructions
  const sampleDataText = `Sun
H1 (L1) H2 (L3,L5)
H3 (L6)
H6 (L6)
H7 (L3)
H11 (L4)
H12 (L2)

Ketu
H5 (L1,L3,L5,L6)
H6 (L2,L4)

Moon
H9 (L1,L2,L4,L6)
H12 (L5)`;

  // On mount, set default sample text or auto-load active data
  useEffect(() => {
    if (astrologyData?.KP?.house_significators || astrologyData?.KP?.planet_significators) {
      loadActiveBirthData();
    } else {
      setInputText(sampleDataText);
    }
  }, [astrologyData]);

  // Load Active Birth Data from current horoscope
  const loadActiveBirthData = () => {
    const kpData = astrologyData?.KP;
    const sourceObj = kpData?.planet_significators || {};
    const standardPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    
    if (Object.keys(sourceObj).length === 0) {
      // Fallback: build from house_significators if planet_significators is empty
      const houseSigs = kpData?.house_significators || {};
      const planetMap: Record<string, Record<number, string[]>> = {};
      
      standardPlanets.forEach(p => { planetMap[p] = {}; });
      
      for (let hNum = 1; hNum <= 12; hNum++) {
        const sigObj = houseSigs[`House_${hNum}`] || houseSigs[String(hNum)] || houseSigs[hNum] || {};
        for (let lvl = 1; lvl <= 6; lvl++) {
          const levelKey = `level${lvl}`;
          const planets = sigObj[levelKey] || [];
          planets.forEach((p: any) => {
            const pStr = String(p).trim();
            const matchedP = standardPlanets.find(std => std.toLowerCase() === pStr.toLowerCase());
            if (matchedP) {
              if (!planetMap[matchedP][hNum]) {
                planetMap[matchedP][hNum] = [];
              }
              if (!planetMap[matchedP][hNum].includes(`L${lvl}`)) {
                planetMap[matchedP][hNum].push(`L${lvl}`);
              }
            }
          });
        }
      }

      let text = "";
      standardPlanets.forEach(p => {
        const houses = planetMap[p];
        if (Object.keys(houses).length === 0) return;
        text += `${p}\n`;
        Object.entries(houses).sort((a,b) => Number(a[0]) - Number(b[0])).forEach(([h, lvls]) => {
          text += `H${h} (${lvls.join(",")})\n`;
        });
        text += "\n";
      });
      setInputText(text.trim());
      return;
    }

    // Standard path: format from planetSignificators
    let text = "";
    standardPlanets.forEach(p => {
      const sig = sourceObj[p];
      if (!sig) return;
      
      const houseMap: Record<number, string[]> = {};
      for (let lvl = 1; lvl <= 6; lvl++) {
        const levelKey = `level${lvl}`;
        const houses = sig[levelKey] || [];
        houses.forEach((h: any) => {
          const hNum = Number(h);
          if (isNaN(hNum)) return;
          if (!houseMap[hNum]) {
            houseMap[hNum] = [];
          }
          if (!houseMap[hNum].includes(`L${lvl}`)) {
            houseMap[hNum].push(`L${lvl}`);
          }
        });
      }

      if (Object.keys(houseMap).length === 0) return;
      text += `${p}\n`;
      Object.entries(houseMap).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([h, lvls]) => {
        text += `H${h} (${lvls.join(",")})\n`;
      });
      text += "\n";
    });
    
    setInputText(text.trim() || sampleDataText);
  };

  // Parser logic conforming to user specification
  const parsedRecords = useMemo<StrengthRecord[]>(() => {
    if (!inputText) return [];
    
    const lines = inputText.split("\n").map(l => l.trim()).filter(Boolean);
    const records: StrengthRecord[] = [];
    const standardPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    
    let currentPlanet = "";
    
    for (const line of lines) {
      // Check if line is a planet name
      const matchedPlanet = standardPlanets.find(p => p.toLowerCase() === line.toLowerCase());
      if (matchedPlanet) {
        currentPlanet = matchedPlanet;
        continue;
      }
      
      if (currentPlanet) {
        // Match "H2 (L3,L5)" or "H1 (L1)" or "H12(L1,L2,L5)"
        const houseRegex = /H(\d+)\s*\(([^)]+)\)/gi;
        let match;
        let matchedOnLine = false;
        
        while ((match = houseRegex.exec(line)) !== null) {
          matchedOnLine = true;
          const houseNum = parseInt(match[1], 10);
          const evidenceStr = match[2];
          const evidence = evidenceStr
            .split(",")
            .map(e => e.trim().toUpperCase())
            .filter(e => /^L\d+$/.test(e));
          
          const count = evidence.length;
          let grade = "Low";
          if (count >= 4) grade = "Very High";
          else if (count >= 2) grade = "High";
          else if (count === 1) grade = "Medium";
          
          records.push({
            planet: currentPlanet,
            house: houseNum,
            evidence,
            evidenceCount: count,
            grade
          });
        }
        
        // Fallback for space separated or simpler patterns on the same line
        if (!matchedOnLine && line.toUpperCase().startsWith("H")) {
          const parts = line.split(/\s+/);
          const housePart = parts[0];
          const houseNum = parseInt(housePart.replace(/\D/g, ""), 10);
          
          if (!isNaN(houseNum)) {
            const evidence = parts.slice(1).join("").replace(/[()]/g, "").split(/[\s,]+/).map(e => e.trim().toUpperCase()).filter(e => /^L\d+$/.test(e));
            const count = evidence.length;
            let grade = "Low";
            if (count >= 4) grade = "Very High";
            else if (count >= 2) grade = "High";
            else if (count === 1) grade = "Medium";
            
            records.push({
              planet: currentPlanet,
              house: houseNum,
              evidence,
              evidenceCount: count,
              grade
            });
          }
        }
      }
    }
    
    return records;
  }, [inputText]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return parsedRecords.filter(r => {
      const matchSearch = searchQuery === "" || 
        r.planet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `h${r.house}`.includes(searchQuery.toLowerCase()) ||
        `house ${r.house}`.includes(searchQuery.toLowerCase());
      
      const matchGrade = selectedGrade === "ALL" || r.grade.toUpperCase() === selectedGrade.toUpperCase();
      
      return matchSearch && matchGrade;
    });
  }, [parsedRecords, searchQuery, selectedGrade]);

  // Handle Gmail trigger
  const handleEmailReport = async () => {
    const token = getGoogleOAuthToken();
    if (!token) {
      setEmailStatus({ type: "error", message: "Please log in using Google Account first." });
      return;
    }
    
    setEmailStatus({ type: "loading", message: "Preparing and sending email report..." });
    
    try {
      // Get user details
      const userRes = await fetch("https://people.googleapis.com/v1/people/me?personFields=emailAddresses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();
      const userEmail = userData.emailAddresses?.[0]?.value || "user@jhora.ai";
      
      // Build gorgeous HTML Table report
      const rowsHtml = parsedRecords.map(r => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: 600; color: #1e293b;">${r.planet}</td>
          <td style="padding: 10px; color: #475569;">House ${r.house}</td>
          <td style="padding: 10px; font-family: monospace; color: #6366f1;">${r.evidence.join(", ")}</td>
          <td style="padding: 10px; text-align: center; color: #0f172a; font-weight: 500;">${r.evidenceCount}</td>
          <td style="padding: 10px;">
            <span style="padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; 
              background-color: ${r.grade === "Very High" ? "#e0e7ff" : r.grade === "High" ? "#d1fae5" : r.grade === "Medium" ? "#fef3c7" : "#f3f4f6"};
              color: ${r.grade === "Very High" ? "#4f46e5" : r.grade === "High" ? "#065f46" : r.grade === "Medium" ? "#92400e" : "#374151"};">
              ${r.grade}
            </span>
          </td>
        </tr>
      `).join("");

      const htmlBody = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #f8fafc; color: #1e293b;">
          <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 26px; font-weight: 800;">JHoraAI</h1>
            <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">KP Strength Astrological Evaluation Report</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Evaluation Summary</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              This report details the planetary strength calculations based on Krishnamurti Paddhati (KP) 6-Fold evidence levels.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
            <thead>
              <tr style="background-color: #f1f5f9; color: #475569;">
                <th style="padding: 12px 10px;">Planet</th>
                <th style="padding: 12px 10px;">House Alignment</th>
                <th style="padding: 12px 10px;">Evidence (L1-L6)</th>
                <th style="padding: 12px 10px; text-align: center;">Evidence Count</th>
                <th style="padding: 12px 10px;">Strength Grade</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            <p style="margin: 0;">Report generated and dispatched securely via your JHoraAI Workspace integration.</p>
            <p style="margin: 4px 0 0 0;">Hari Om Tat Sat 🙏</p>
          </div>
        </div>
      `;

      const emailLines = [
        `To: ${userEmail}`,
        `Subject: KP Strength Astrological Evaluation Report - JHoraAI`,
        `Content-Type: text/html; charset=utf-8`,
        `MIME-Version: 1.0`,
        "",
        htmlBody
      ];

      const rawEmail = btoa(unescape(encodeURIComponent(emailLines.join("\n"))))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const res = await fetch("https://gmail.googleapis.com/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw: rawEmail })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      setEmailStatus({ type: "success", message: `Successfully emailed report to ${userEmail}!` });
    } catch (err: any) {
      console.error(err);
      setEmailStatus({ type: "error", message: err.message || "Failed to deliver email report." });
    }
  };

  // Backup to Google Drive
  const handleDriveBackup = async () => {
    const token = getGoogleOAuthToken();
    if (!token) {
      setDriveStatus({ type: "error", message: "Please log in using Google Account first." });
      return;
    }
    
    setDriveStatus({ type: "loading", message: "Syncing KP Strength data to Google Drive..." });
    
    try {
      // Find existing file with name 'jhora_kp_strength.txt'
      const q = encodeURIComponent("name = 'jhora_kp_strength.txt' and trashed = false");
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const searchData = await searchRes.json();
      const existingFileId = searchData.files?.[0]?.id;
      
      const fileContent = `KP STRENGTH EVALUATION REPORT\nGenerated on: ${new Date().toLocaleString()}\n\nRaw Configuration:\n${inputText}`;
      
      if (existingFileId) {
        // Patch update
        const patchRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "text/plain"
          },
          body: fileContent
        });
        if (!patchRes.ok) throw new Error(await patchRes.text());
        setDriveStatus({ type: "success", message: "Successfully updated 'jhora_kp_strength.txt' in Google Drive!" });
      } else {
        // Multi-part create
        const boundary = "jhora_boundary_strength_report";
        const metadata = {
          name: "jhora_kp_strength.txt",
          mimeType: "text/plain",
          description: "JHoraAI Krishnamurti Paddhati (KP) planetary strength configuration backup"
        };
        const body = [
          `--${boundary}`,
          "Content-Type: application/json; charset=UTF-8",
          "",
          JSON.stringify(metadata),
          `--${boundary}`,
          "Content-Type: text/plain",
          "",
          fileContent,
          `--${boundary}--`
        ].join("\r\n");

        const createRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`
          },
          body
        });
        if (!createRes.ok) throw new Error(await createRes.text());
        setDriveStatus({ type: "success", message: "Successfully created 'jhora_kp_strength.txt' in Google Drive!" });
      }
    } catch (err: any) {
      console.error(err);
      setDriveStatus({ type: "error", message: err.message || "Failed to back up to Google Drive." });
    }
  };

  const getGradeBadgeStyles = (grade: string) => {
    switch (grade) {
      case "Very High":
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_8px_rgba(99,102,241,0.15)]";
      case "High":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const getLevelBadgeStyles = (lvl: string) => {
    switch (lvl) {
      case "L1": return "bg-sky-500/20 text-sky-300 border border-sky-500/30";
      case "L2": return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
      case "L3": return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
      case "L4": return "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30";
      case "L5": return "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30";
      case "L6": return "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30";
      default: return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
    }
  };

  return (
    <div id="kp-strength-container" className="space-y-6">
      {/* Title Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-5">
        <div className="space-y-1">
          <h2 className="text-xl font-sans font-medium flex items-center gap-2 text-slate-100">
            <Award className="w-6 h-6 text-indigo-400 animate-pulse" />
            KP Strength Evaluation ⭐
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Analyze planetary strength alignments across 6 Krishnamurti Paddhati evidence levels (L1 - L6). Formats raw planet mappings or synchronizes live significators seamlessly.
          </p>
        </div>
        
        {/* Quick cloud syncing status panel */}
        <div className="flex items-center gap-2">
          {astrologyData ? (
            <button
              onClick={loadActiveBirthData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all duration-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload Horoscope Data
            </button>
          ) : (
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 bg-slate-800/40 px-2.5 py-1 rounded-md">
              Offline Workspace Mode
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Input Text Editor */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Planet → House Input
              </label>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInputText(sampleDataText)}
                  className="text-[10px] font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
                  title="Load sample planet to house mapping data"
                >
                  Load Sample
                </button>
                <span className="text-slate-800">|</span>
                <button
                  onClick={() => setInputText("")}
                  className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-0.5"
                  title="Clear current text workspace"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>
            </div>

            <textarea
              id="kp-strength-raw-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Sun&#10;H1 (L1) H2 (L3,L5)&#10;H3 (L6)&#10;&#10;Ketu&#10;H5 (L1,L3,L5,L6)"
              rows={16}
              className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-950/60 text-slate-200 outline-none resize-none leading-relaxed"
            />

            <div className="text-[10px] text-slate-500 leading-normal bg-indigo-500/5 p-3.5 rounded-xl border border-indigo-500/10 space-y-1">
              <p className="font-semibold text-indigo-400">Supported Syntax Rules:</p>
              <p>• Write the Planet name on its own line (e.g. <strong>Sun</strong>)</p>
              <p>• Map houses underneath using <strong>H[HouseNum] (L1,L2,...)</strong></p>
              <p>• Separate multiple mappings with spaces or line breaks</p>
            </div>
          </div>
        </div>

        {/* Right Side: Parsed Strength Evaluation Table */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Quick Filters / Search */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/20 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Planet, House..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-800 bg-slate-950/40 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-1.5 w-full md:w-auto">
              {["ALL", "VERY HIGH", "HIGH", "MEDIUM", "LOW"].map(grade => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`flex-1 md:flex-initial px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all duration-200 ${
                    selectedGrade === grade 
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/10" 
                      : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid Container */}
          <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-sans font-medium text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                Planetary Evidence Matrix
              </h3>
              <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {filteredRecords.length} Alignments Found
              </span>
            </div>

            {filteredRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="text-[10px] uppercase font-mono font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-2">Planet</th>
                      <th className="py-3 px-2">House</th>
                      <th className="py-3 px-2">Evidence Levels (L1-L6)</th>
                      <th className="py-3 px-2 text-center">Count</th>
                      <th className="py-3 px-2 text-right">Strength Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 font-sans">
                    {filteredRecords.map((rec, idx) => (
                      <tr 
                        key={`${rec.planet}-${rec.house}-${idx}`}
                        className="hover:bg-slate-800/20 transition-all duration-150"
                      >
                        <td className="py-3 px-2 font-semibold text-slate-100">{rec.planet}</td>
                        <td className="py-3 px-2">
                          <span className="font-semibold text-indigo-400 font-mono">
                            H{rec.house}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-wrap gap-1">
                            {rec.evidence.map(lvl => (
                              <span 
                                key={lvl}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${getLevelBadgeStyles(lvl)}`}
                              >
                                {lvl}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center font-bold font-mono text-slate-400">
                          {rec.evidenceCount}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${getGradeBadgeStyles(rec.grade)}`}>
                            {rec.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">No evaluated KP strength configurations matched your query.</p>
                <p className="text-[10px] text-slate-500">Ensure the input matches standard KP format or reset with Load Sample data.</p>
              </div>
            )}
          </div>

          {/* Sync & Email Actions Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Google Drive Card */}
            <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                  Google Drive Backup
                </h4>
                <p className="text-[10px] text-slate-500">
                  Save current configuration directly to your connected Google Drive as `jhora_kp_strength.txt`.
                </p>
              </div>

              <button
                onClick={handleDriveBackup}
                disabled={driveStatus.type === "loading"}
                className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md shadow-indigo-600/15 disabled:opacity-50"
              >
                {driveStatus.type === "loading" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Backing Up...
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    Backup Configuration
                  </>
                )}
              </button>

              {driveStatus.type && (
                <div className={`p-3 rounded-lg border text-[10px] flex items-start gap-1.5 ${
                  driveStatus.type === "success" 
                    ? "bg-green-500/15 border-green-500/20 text-green-400"
                    : driveStatus.type === "error"
                    ? "bg-rose-500/15 border-rose-500/20 text-rose-400"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}>
                  {driveStatus.type === "success" ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 shrink-0" />
                  )}
                  <span>{driveStatus.message}</span>
                </div>
              )}
            </div>

            {/* Email Dispatch Card */}
            <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  Email Strengths Report
                </h4>
                <p className="text-[10px] text-slate-500">
                  Send this full evaluation report with interactive strength grades directly to your registered email inbox.
                </p>
              </div>

              <button
                onClick={handleEmailReport}
                disabled={emailStatus.type === "loading" || parsedRecords.length === 0}
                className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md shadow-emerald-600/15 disabled:opacity-50"
              >
                {emailStatus.type === "loading" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    Email Full Report
                  </>
                )}
              </button>

              {emailStatus.type && (
                <div className={`p-3 rounded-lg border text-[10px] flex items-start gap-1.5 ${
                  emailStatus.type === "success" 
                    ? "bg-green-500/15 border-green-500/20 text-green-400"
                    : emailStatus.type === "error"
                    ? "bg-rose-500/15 border-rose-500/20 text-rose-400"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}>
                  {emailStatus.type === "success" ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 shrink-0" />
                  )}
                  <span>{emailStatus.message}</span>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
