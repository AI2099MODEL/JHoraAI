const fs = require('fs');
let content = fs.readFileSync('src/components/AstroChat.tsx', 'utf-8');

const oldSettingsStart = `            {/* 4. Settings */}`;
const oldSettingsEnd = `            </div>
          </div>

        </div>

        {/* Sidebar Footer (User details) */}`;

const startIndex = content.indexOf(oldSettingsStart);
const endIndex = content.indexOf(oldSettingsEnd);

if (startIndex !== -1 && endIndex !== -1) {
    const newSettings = `            {/* 4. Settings */}
            <div className="space-y-0.5 pt-2 border-t border-neutral-200/60">
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className={\`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs \${
                  settingsExpanded 
                    ? "bg-gradient-to-r from-slate-100/90 via-gray-100/70 to-slate-50 text-slate-950 border border-slate-200" 
                    : "bg-neutral-50/80 hover:bg-slate-50/60 text-neutral-800 hover:text-slate-900 border border-neutral-200/70"
                }\`}
              >
                <Settings className={\`w-4 h-4 shrink-0 \${settingsExpanded ? "text-slate-600" : "text-slate-500"}\`} />
                <span className="font-sans tracking-tight">Settings</span>
                <ChevronDown className={\`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 \${settingsExpanded ? "rotate-180 text-slate-700" : ""}\`} />
              </button>

              {settingsExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-slate-200 space-y-3 py-1">
                  
                  {/* Preferences */}
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Preferences</div>
                    {[
                      { id: "account_settings", label: "Account Settings", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "theme", label: "Theme", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "language", label: "Language", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "offline_mode", label: "Offline Mode", theme: "bg-slate-50 text-slate-950 border-slate-200/80" }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("ai_assistant", sub.id);
                          setSidebarOpen(false);
                        }}
                        className={\`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer w-full text-left border shadow-2xs \${
                          activeSubmenuPanel === sub.id
                            ? "bg-gradient-to-r from-slate-600 to-gray-600 text-white font-bold border-slate-700"
                            : \`\${sub.theme} hover:brightness-95\`
                        }\`}
                      >
                        <Settings className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Integrations */}
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Integrations</div>
                    {[
                      { id: "google_drive", label: "Google Drive Backup", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "google_calendar", label: "Google Calendar Sync", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "google_gmail", label: "Google Gmail", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "google_keep", label: "Google Keep Notes", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "google_contacts", label: "Google Contacts", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "api_keys", label: "API Keys", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "github_ota", label: "GitHub OTA Updates", theme: "bg-slate-50 text-slate-950 border-slate-200/80" }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("ai_assistant", sub.id);
                          setSidebarOpen(false);
                        }}
                        className={\`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer w-full text-left border shadow-2xs \${
                          activeSubmenuPanel === sub.id
                            ? "bg-gradient-to-r from-slate-600 to-gray-600 text-white font-bold border-slate-700"
                            : \`\${sub.theme} hover:brightness-95\`
                        }\`}
                      >
                        <Settings className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Knowledge Base */}
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Knowledge Base</div>
                    {[
                      { id: "event_book", label: "Event Book", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "engine_guide", label: "Astrological Rule Engine", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "kp_book", label: "KP Book", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "kp_documentation", label: "KP Documentation", theme: "bg-slate-50 text-slate-950 border-slate-200/80" }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("ai_assistant", sub.id);
                          setSidebarOpen(false);
                        }}
                        className={\`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer w-full text-left border shadow-2xs \${
                          activeSubmenuPanel === sub.id
                            ? "bg-gradient-to-r from-slate-600 to-gray-600 text-white font-bold border-slate-700"
                            : \`\${sub.theme} hover:brightness-95\`
                        }\`}
                      >
                        <Settings className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* System & Data */}
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">System & Data</div>
                    {[
                      { id: "table_index", label: "Table Index", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "raw_json", label: "Raw JSON", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "api_inspector", label: "API Inspector", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "request_log", label: "Request Log", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "response_log", label: "Response Log", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "dto_viewer", label: "DTO Viewer", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "room_database_viewer", label: "Database Viewer", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "plugin_manager", label: "Plugin Manager", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "performance", label: "Performance", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                      { id: "cache_manager", label: "Cache Manager", theme: "bg-slate-50 text-slate-950 border-slate-200/80" }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmenuPanel(sub.id);
                          onNavigateMenu?.("ai_assistant", sub.id);
                          setSidebarOpen(false);
                        }}
                        className={\`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer w-full text-left border shadow-2xs \${
                          activeSubmenuPanel === sub.id
                            ? "bg-gradient-to-r from-slate-600 to-gray-600 text-white font-bold border-slate-700"
                            : \`\${sub.theme} hover:brightness-95\`
                        }\`}
                      >
                        <Settings className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>

                </div>
              )}`;

    content = content.substring(0, startIndex) + newSettings + "\n            " + content.substring(endIndex);
    fs.writeFileSync('src/components/AstroChat.tsx', content);
    console.log("Updated AstroChat Settings section.");
} else {
    console.log("Failed to find bounds.");
}
