/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Save, 
  RefreshCw, 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  FileText, 
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { apiFetch as fetch } from "../lib/api";

interface Rule {
  id: string;
  system: string;
  condition: string;
  status: string;
}

interface Section {
  id: string;
  number: string;
  title: string;
  rules: Rule[];
}

interface RulesTerminalProps {
  isDarkTheme: boolean;
}

export default function RulesTerminal({ isDarkTheme }: RulesTerminalProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [intro, setIntro] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit states
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editSystem, setEditSystem] = useState<string>("");
  const [editCondition, setEditCondition] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");

  // Add states
  const [addingToSectionId, setAddingToSectionId] = useState<string | null>(null);
  const [newSystem, setNewSystem] = useState<string>("Parashari");
  const [newCondition, setNewCondition] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("");

  // Helper to parse the raw markdown file into structured sections and rules
  const parseMarkdown = (md: string): { sections: Section[]; intro: string } => {
    const lines = md.split("\n");
    const parsedSections: Section[] = [];
    const introLines: string[] = [];
    let currentSection: Section | null = null;
    let currentSystem = "";

    const cleanCondition = (raw: string) => {
      let text = raw.trim();
      let lastText = "";
      while (text !== lastText) {
        lastText = text;
        text = text.replace(/^[\s*\-]*\+?\s*/, "");
        text = text.replace(/^`?Condition:`?\s*/i, "");
        text = text.replace(/^[\s`*]+/g, "").replace(/[\s`*]+$/g, "");
      }
      return text.trim();
    };

    const cleanStatus = (raw: string) => {
      let text = raw.trim();
      let lastText = "";
      while (text !== lastText) {
        lastText = text;
        text = text.replace(/^[\s`*]+/g, "").replace(/[\s`*]+$/g, "");
        text = text.replace(/^Output\s+Status\s*:?\s*/i, "");
        text = text.replace(/^[\s`*]+/g, "").replace(/[\s`*]+$/g, "");
      }
      return text.trim();
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for section header (e.g. ### 1️⃣ MARITAL LIFE...)
      if (line.startsWith("### ") && !line.includes("DOCUMENT PURPOSE") && !line.includes("ℹ️ DOCUMENT PURPOSE")) {
        const headerText = line.substring(4).trim();
        const match = headerText.match(/^([^\s]+)\s+(.+)$/);
        let number = "";
        let title = headerText;
        if (match) {
          number = match[1];
          title = match[2];
        } else {
          // Fallback if no emoji
          const numMatch = headerText.match(/^(\d+[\.\)]?)\s+(.+)$/);
          if (numMatch) {
            number = numMatch[1];
            title = numMatch[2];
          }
        }
        
        currentSection = {
          id: Math.random().toString(36).substring(2, 9),
          number: number,
          title: title,
          rules: []
        };
        parsedSections.push(currentSection);
        currentSystem = ""; // reset system
        continue;
      }

      if (!currentSection) {
        introLines.push(lines[i]);
        continue;
      }

      // Check for system header: * **Parashari (Vedic) Rules:**
      if (line.startsWith("*") && line.toLowerCase().includes("rules:**")) {
        const systemMatch = line.match(/\*\*\s*(.*?)\s*Rules:\s*\*\s*/i) || line.match(/\*\*\s*(.*?)\s*Rules:\s*\*\*/i);
        if (systemMatch) {
          currentSystem = systemMatch[1].trim();
        } else {
          // Fallback clean
          currentSystem = line.replace(/^\*\s*\*\*/, "").replace(/\*\*$/, "").replace(/Rules:$/i, "").trim();
        }
        continue;
      }

      // Check for condition line
      if (line.includes("Condition:") || line.includes("`Condition:`")) {
        const arrowSplit = line.split(/➔|->/);
        if (arrowSplit.length >= 2) {
          const condPart = cleanCondition(arrowSplit[0]);
          const statusPart = cleanStatus(arrowSplit[1]);

          currentSection.rules.push({
            id: Math.random().toString(36).substring(2, 9),
            system: currentSystem || "General",
            condition: condPart,
            status: statusPart
          });
        }
      }
    }

    return { sections: parsedSections, intro: introLines.join("\n") };
  };

  // Helper to serialize the structured sections and rules back to markdown
  const serializeMarkdown = (parsedSections: Section[], introText: string): string => {
    let md = introText.trim() + "\n\n";
    
    parsedSections.forEach((section) => {
      const secNum = section.number ? `${section.number} ` : "";
      md += `### ${secNum}${section.title}\n`;
      
      // Group rules by system to maintain the structure
      const rulesBySystem: { [key: string]: Rule[] } = {};
      section.rules.forEach((rule) => {
        const sys = rule.system || "General";
        if (!rulesBySystem[sys]) {
          rulesBySystem[sys] = [];
        }
        rulesBySystem[sys].push(rule);
      });
      
      Object.keys(rulesBySystem).forEach((systemName) => {
        md += `*   **${systemName} Rules:**\n`;
        rulesBySystem[systemName].forEach((rule) => {
          md += `    *   \`Condition:\` ${rule.condition} ➔ **Output Status:** \`${rule.status}\`\n`;
        });
      });
      md += "\n";
    });
    
    return md;
  };

  const fetchHandbook = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/astrology/rules-handbook");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      const parsed = parseMarkdown(data.content || "");
      setSections(parsed.sections);
      setIntro(parsed.intro);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load rules handbook.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHandbook();
  }, []);

  // Save current structured state back to the repository handbook markdown file
  const handleCommit = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const mdContent = serializeMarkdown(sections, intro);
      const res = await fetch("/api/astrology/rules-handbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: mdContent })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSuccessMessage("Rules successfully committed and synchronized! Codebases are automatically updated.");
      // Automatically clear toast after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to commit rules updates.");
    } finally {
      setIsSaving(false);
    }
  };

  // Start editing an existing rule row
  const startEdit = (rule: Rule) => {
    setEditingRuleId(rule.id);
    setEditSystem(rule.system);
    setEditCondition(rule.condition);
    setEditStatus(rule.status);
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingRuleId(null);
  };

  // Save edits to local state
  const saveEdit = (sectionId: string, ruleId: string) => {
    setSections(prev => prev.map(sec => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        rules: sec.rules.map(r => {
          if (r.id !== ruleId) return r;
          return {
            ...r,
            system: editSystem.trim() || "General",
            condition: editCondition.trim(),
            status: editStatus.trim()
          };
        })
      };
    }));
    setEditingRuleId(null);
  };

  // Delete a rule row
  const deleteRule = (sectionId: string, ruleId: string) => {
    setSections(prev => prev.map(sec => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        rules: sec.rules.filter(r => r.id !== ruleId)
      };
    }));
  };

  // Start adding a new rule under a specific section
  const startAdd = (sectionId: string) => {
    setAddingToSectionId(sectionId);
    setNewSystem("Parashari");
    setNewCondition("");
    setNewStatus("");
  };

  // Cancel adding mode
  const cancelAdd = () => {
    setAddingToSectionId(null);
  };

  // Save a brand new rule row to local state
  const saveNewRule = (sectionId: string) => {
    if (!newCondition.trim() || !newStatus.trim()) {
      setError("Logical Condition and Target Output Status are required.");
      return;
    }
    
    setSections(prev => prev.map(sec => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        rules: [
          ...sec.rules,
          {
            id: Math.random().toString(36).substring(2, 9),
            system: newSystem.trim() || "General",
            condition: newCondition.trim(),
            status: newStatus.trim()
          }
        ]
      };
    }));
    setAddingToSectionId(null);
    setError(null);
  };

  // Render backticked segments inside rule condition text as premium code blocks
  const renderConditionText = (text: string) => {
    if (!text.includes("`")) {
      return <span className="text-slate-300 font-sans text-xs">{text}</span>;
    }
    
    const parts = text.split(/`([^`]+)`/g);
    return (
      <span className="text-slate-300 font-sans text-xs leading-relaxed">
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            return (
              <code 
                key={index} 
                className="bg-slate-100 dark:bg-slate-800/80 text-amber-600 dark:text-amber-400 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/50 mx-0.5 font-bold"
              >
                {part}
              </code>
            );
          }
          return part;
        })}
      </span>
    );
  };

  // Filter sections and rules according to search query
  const filteredSections = sections.map(sec => {
    // Check if the section matches the query
    const sectionMatches = sec.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter rules inside this section
    const matchingRules = sec.rules.filter(rule => 
      rule.system.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If search term is empty, return all rules. Otherwise, return only matching rules.
    return {
      ...sec,
      rules: searchTerm ? matchingRules : sec.rules,
      isMatch: searchTerm ? (sectionMatches || matchingRules.length > 0) : true
    };
  }).filter(sec => sec.isMatch);

  const containerStyle = isDarkTheme 
    ? "bg-slate-900/40 border-slate-800" 
    : "bg-white border-slate-200 shadow-sm";
  const cardStyle = isDarkTheme 
    ? "bg-slate-950 border-slate-800" 
    : "bg-slate-50 border-slate-200";
  const textMuted = isDarkTheme ? "text-slate-400" : "text-slate-600";
  const textHeading = isDarkTheme ? "text-slate-100" : "text-slate-800";

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className={`p-6 rounded-2xl border ${containerStyle} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className={`text-xl font-sans font-semibold flex items-center gap-2 ${textHeading}`}>
              <FileText className="w-5 h-5 text-indigo-400" />
              KP Book — Astrological Logic Gates & Rules Compiler
            </h3>
            <p className={`text-xs ${textMuted} mt-1`}>
              Configure absolute systems, logical trigger conditions, and target output gates across Parashari, KP, and Jaimini systems.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchHandbook}
              disabled={isLoading || isSaving}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 transition-colors cursor-pointer"
              title="Refresh handbook from local master_astro_handbook.md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={handleCommit}
              disabled={isLoading || isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Committing Rules...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Commit & Push Rules</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Engine */}
        <div className="flex items-center gap-2 bg-slate-950/40 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
          <Search className="w-4 h-4 text-slate-400 ml-1.5" />
          <input
            type="text"
            placeholder="Search systems, rules conditions, or output gates (e.g., KP System, cusp_12.sub_lord)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-2.5 text-xs text-emerald-600 dark:text-emerald-400">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Success!</span> {successMessage}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Validation Error:</span> {error}
            </div>
          </div>
        )}
      </div>

      {/* Rules Board */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className={`text-xs font-mono ${textMuted}`}>Parsing Rules Handbook File...</span>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className={`p-10 rounded-2xl border text-center ${containerStyle}`}>
            <HelpCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <h4 className={`text-sm font-bold ${textHeading}`}>No matching astrological rules found</h4>
            <p className={`text-xs ${textMuted} mt-1`}>Try refining your query search term.</p>
          </div>
        ) : (
          filteredSections.map((section, secIdx) => (
            <div key={section.id} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h4 className={`text-base font-sans font-bold flex items-center gap-2 ${textHeading}`}>
                  {section.number && <span className="font-mono text-indigo-400">{section.number}</span>}
                  {section.title}
                </h4>
                <button
                  onClick={() => startAdd(section.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg transition-all"
                >
                  <Plus className="w-3 h-3" />
                  Add Rule
                </button>
              </div>

              {/* Rules Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/80">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/6">
                        System
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/8">
                        Type
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-5/12">
                        Logical Condition / Trigger Gate
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/6">
                        Target Output Status
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-1/12">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950/40">
                    {section.rules.map((rule) => {
                      const isEditing = editingRuleId === rule.id;
                      const isTransitRule = rule.condition.toLowerCase().includes("transit") || rule.condition.toLowerCase().includes("gochara");
                      const ruleTypeLabel = isTransitRule ? "Transit" : "Natal";

                      return (
                        <tr 
                          key={rule.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                        >
                          {/* System column */}
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editSystem}
                                onChange={(e) => setEditSystem(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                              />
                            ) : (
                              <span className={`text-xs font-bold ${textHeading}`}>
                                {rule.system}
                              </span>
                            )}
                          </td>

                          {/* Type column */}
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                              isTransitRule 
                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                                : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                            }`}>
                              {ruleTypeLabel}
                            </span>
                          </td>

                          {/* Logical Condition column */}
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <textarea
                                value={editCondition}
                                onChange={(e) => setEditCondition(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono resize-y"
                                rows={2}
                              />
                            ) : (
                              renderConditionText(rule.condition)
                            )}
                          </td>

                          {/* Target Output Status column */}
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                              />
                            ) : (
                              <span className="inline-block bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                                {rule.status}
                              </span>
                            )}
                          </td>

                          {/* Actions column */}
                          <td className="px-4 py-3 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => saveEdit(section.id, rule.id)}
                                  className="text-emerald-500 hover:text-emerald-400 p-1 bg-emerald-500/10 rounded"
                                  title="Save Changes"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="text-slate-400 hover:text-slate-300 p-1 bg-slate-500/10 rounded"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEdit(rule)}
                                  className="text-slate-400 hover:text-indigo-400 p-1 bg-slate-500/10 rounded hover:bg-indigo-500/10 transition-colors"
                                  title="Edit Rule"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteRule(section.id, rule.id)}
                                  className="text-slate-400 hover:text-red-400 p-1 bg-slate-500/10 rounded hover:bg-red-500/10 transition-colors"
                                  title="Delete Rule"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Inline adding row form */}
                    {addingToSectionId === section.id && (
                      <tr className="bg-amber-500/5 border-t-2 border-dashed border-amber-500/20">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={newSystem}
                            onChange={(e) => setNewSystem(e.target.value)}
                            placeholder="System (e.g. KP System)"
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-amber-500/30 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 font-bold"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <textarea
                            value={newCondition}
                            onChange={(e) => setNewCondition(e.target.value)}
                            placeholder="Type condition... Use backticks for highlight (e.g. `cusp_12.sub_lord` signifies houses `[3, 9, 12]`)"
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-amber-500/30 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 font-mono resize-y"
                            rows={2}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            placeholder="Target Output (e.g. VISA_TRAVEL_APPROVAL)"
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-amber-500/30 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => saveNewRule(section.id)}
                              className="text-amber-500 hover:text-amber-400 p-1 bg-amber-500/10 rounded"
                              title="Add Rule to List"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelAdd}
                              className="text-slate-400 hover:text-slate-300 p-1 bg-slate-500/10 rounded"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Helpful Info Section */}
      <div className={`p-4 rounded-xl border ${cardStyle} flex items-start gap-2.5 text-xs ${textMuted}`}>
        <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Tip on Formatting:</strong> When editing or adding a rule, you can wrap parameters in backticks (e.g. <code>`cusp_12.sub_lord`</code>) to display them in a clean code font inside the table. Remember to click the <strong>Commit & Push Rules</strong> button at the top to save your changes back to the server and update your astrological evaluation system!
        </p>
      </div>
    </div>
  );
}
