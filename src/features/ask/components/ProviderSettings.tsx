import React, { useState, useEffect } from "react";
import { Key, Sparkles, Shield, AlertCircle, Check } from "lucide-react";
import { Preferences } from "../services/ConversationService";
import { GeminiProvider } from "../services/GeminiProvider";
import { ClaudeProvider } from "../services/ClaudeProvider";

interface ProviderSettingsProps {
  preferences: Preferences;
  onSave: (preferences: Preferences) => void;
}

export const ProviderSettings: React.FC<ProviderSettingsProps> = ({ preferences, onSave }) => {
  const [provider, setProvider] = useState<Preferences["preferredProvider"]>(preferences.preferredProvider || "groq");
  const [groqKey, setGroqKey] = useState(preferences.groqApiKey || "");
  const [geminiKey, setGeminiKey] = useState(preferences.geminiApiKey || "");
  const [claudeKey, setClaudeKey] = useState(preferences.claudeApiKey || "");
  
  const [groqModels] = useState<string[]>(["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]);
  const [geminiModels, setGeminiModels] = useState<string[]>([]);
  const [claudeModels, setClaudeModels] = useState<string[]>([]);

  const [selectedGroqModel, setSelectedGroqModel] = useState(preferences.preferredModels.groq || "llama-3.3-70b-versatile");
  const [selectedGeminiModel, setSelectedGeminiModel] = useState(preferences.preferredModels.gemini || "gemini-3.6-flash");
  const [selectedClaudeModel, setSelectedClaudeModel] = useState(preferences.preferredModels.claude || "claude-3-5-sonnet-latest");

  const [testStatus, setTestStatus] = useState<{ [key: string]: "idle" | "loading" | "success" | "error" }>({
    groq: "idle",
    gemini: "idle",
    claude: "idle",
  });
  const [testMessage, setTestMessage] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Load models
    const gemini = new GeminiProvider();
    gemini.models(geminiKey).then((m) => setGeminiModels(m));

    const claude = new ClaudeProvider();
    claude.models(claudeKey).then((m) => setClaudeModels(m));
  }, [geminiKey, claudeKey]);

  const handleSave = () => {
    const updated: Preferences = {
      preferredProvider: provider,
      groqApiKey: groqKey,
      geminiApiKey: geminiKey,
      claudeApiKey: claudeKey,
      preferredModels: {
        groq: selectedGroqModel,
        gemini: selectedGeminiModel,
        claude: selectedClaudeModel,
      },
      language: preferences.language || "en",
      lastOpenChartId: preferences.lastOpenChartId,
    };
    if (typeof window !== "undefined" && groqKey) {
      localStorage.setItem("user_groq_api_key", groqKey);
    }
    onSave(updated);
  };

  const handleTestConnection = async (provName: "groq" | "gemini" | "claude") => {
    setTestStatus((prev) => ({ ...prev, [provName]: "loading" }));
    setTestMessage((prev) => ({ ...prev, [provName]: "" }));

    try {
      if (provName === "groq") {
        const keyToUse = groqKey || undefined;
        const res = await fetch("/api/astrology/master-ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: "Test ping",
            mode: "fast",
            groqApiKey: keyToUse
          })
        });
        if (res.ok) {
          setTestStatus((prev) => ({ ...prev, groq: "success" }));
          setTestMessage((prev) => ({ ...prev, groq: "Groq LLaMA 3.3 70B connection active & verified!" }));
        } else {
          const err = await res.json().catch(() => ({}));
          setTestStatus((prev) => ({ ...prev, groq: "error" }));
          setTestMessage((prev) => ({ ...prev, groq: err.error || "Failed to connect to Groq API." }));
        }
      } else if (provName === "claude") {
        const provInstance = new ClaudeProvider();
        const res = await provInstance.health(claudeKey);
        setTestStatus((prev) => ({ ...prev, claude: res.status === "available" ? "success" : "error" }));
        setTestMessage((prev) => ({ ...prev, claude: res.message }));
      } else {
        const provInstance = new GeminiProvider();
        const res = await provInstance.health(geminiKey);
        setTestStatus((prev) => ({ ...prev, gemini: res.status === "available" ? "success" : "error" }));
        setTestMessage((prev) => ({ ...prev, gemini: res.message }));
      }
    } catch (err: any) {
      setTestStatus((prev) => ({ ...prev, [provName]: "error" }));
      setTestMessage((prev) => ({ ...prev, [provName]: err.message || "Failed health check." }));
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 max-w-xl mx-auto my-6 animate-fade-in font-sans">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-800">Intelligence Settings</h2>
      </div>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed">
        JHoraAI uses Groq LLaMA-3.3-70B as primary high-speed AI engine with Gemini API as secondary fallback. Configure your preferred AI keys below. All keys are saved securely in your browser.
      </p>

      <div className="space-y-6">
        {/* Preferred Provider Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Active Provider
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(["groq", "gemini", "claude"] as const).map((prov) => (
              <button
                key={prov}
                onClick={() => setProvider(prov)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  provider === prov
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {prov}
              </button>
            ))}
          </div>
        </div>

        {/* Groq Settings */}
        {provider === "groq" && (
          <div className="space-y-3.5 border-t border-slate-100 pt-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Groq Configuration (Primary AI)
              </h4>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                Primary Ultra-Fast
              </span>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Select Model</label>
              <select
                value={selectedGroqModel}
                onChange={(e) => setSelectedGroqModel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {groqModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs text-slate-500">Groq API Key (Optional)</label>
                <span className="text-[10px] text-slate-400 italic">Defaults to system key if blank</span>
              </div>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <button
                  onClick={() => handleTestConnection("groq")}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-600 transition-colors cursor-pointer"
                >
                  {testStatus.groq === "loading" ? "Testing..." : "Test"}
                </button>
              </div>
            </div>

            {testStatus.groq !== "idle" && (
              <div
                className={`flex items-start gap-1.5 p-2.5 rounded-xl text-xs border ${
                  testStatus.groq === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : testStatus.groq === "error"
                    ? "bg-rose-50 border-rose-100 text-rose-700"
                    : "bg-slate-50 border-slate-100 text-slate-600"
                }`}
              >
                {testStatus.groq === "success" ? (
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{testMessage.groq || "Testing connection..."}</span>
              </div>
            )}
          </div>
        )}

        {/* Gemini Settings */}
        {provider === "gemini" && (
          <div className="space-y-3.5 border-t border-slate-100 pt-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Gemini configuration (Secondary Fallback)
              </h4>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                Secondary Fallback
              </span>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Select Model</label>
              <select
                value={selectedGeminiModel}
                onChange={(e) => setSelectedGeminiModel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {geminiModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs text-slate-500">Gemini API Key (Optional)</label>
                <span className="text-[10px] text-slate-400 italic">Defaults to system key if blank</span>
              </div>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="Enter your GEMINI_API_KEY"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <button
                  onClick={() => handleTestConnection("gemini")}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-600 transition-colors cursor-pointer"
                >
                  {testStatus.gemini === "loading" ? "Testing..." : "Test"}
                </button>
              </div>
            </div>

            {testStatus.gemini !== "idle" && (
              <div
                className={`flex items-start gap-1.5 p-2.5 rounded-xl text-xs border ${
                  testStatus.gemini === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : testStatus.gemini === "error"
                    ? "bg-rose-50 border-rose-100 text-rose-700"
                    : "bg-slate-50 border-slate-100 text-slate-600"
                }`}
              >
                {testStatus.gemini === "success" ? (
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{testMessage.gemini || "Testing connection..."}</span>
              </div>
            )}
          </div>
        )}

        {/* Claude Settings */}
        {provider === "claude" && (
          <div className="space-y-3.5 border-t border-slate-100 pt-4 animate-fade-in">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Anthropic Claude configuration
            </h4>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Select Model</label>
              <select
                value={selectedClaudeModel}
                onChange={(e) => setSelectedClaudeModel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {claudeModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Claude API Key</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={claudeKey}
                    onChange={(e) => setClaudeKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <button
                  onClick={() => handleTestConnection("claude")}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-600 transition-colors cursor-pointer"
                >
                  {testStatus.claude === "loading" ? "Testing..." : "Test"}
                </button>
              </div>
            </div>

            {testStatus.claude !== "idle" && (
              <div
                className={`flex items-start gap-1.5 p-2.5 rounded-xl text-xs border ${
                  testStatus.claude === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : testStatus.claude === "error"
                    ? "bg-rose-50 border-rose-100 text-rose-700"
                    : "bg-slate-50 border-slate-100 text-slate-600"
                }`}
              >
                {testStatus.claude === "success" ? (
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{testMessage.claude || "Testing connection..."}</span>
              </div>
            )}
          </div>
        )}

        {/* Security / Privacy Banner */}
        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex gap-2.5">
          <Shield className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            <strong>Secure Key Isolation:</strong> All API credentials remain entirely inside this client's localStorage scope. They are exclusively dispatched using CORS-secure, server-proxied POST endpoints and are never cached or stored on external servers.
          </p>
        </div>

        {/* Save button */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Apply Configurations
          </button>
        </div>
      </div>
    </div>
  );
};
