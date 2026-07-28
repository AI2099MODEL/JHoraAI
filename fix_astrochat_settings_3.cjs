const fs = require('fs');
let content = fs.readFileSync('src/components/AstroChat.tsx', 'utf-8');

const target = `                </div>
              )}
            </div>
          </div>

        </div>`;

const replacement = `                </div>
              )}
            </div>

            {/* 4. Settings */}
            <div className="space-y-0.5 pt-2 border-t border-neutral-200/60">
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className={\`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs \${
                  settingsExpanded 
                    ? "bg-gradient-to-r from-slate-100/90 via-gray-100/70 to-zinc-50 text-slate-950 border border-slate-200" 
                    : "bg-neutral-50/80 hover:bg-slate-50/60 text-neutral-800 hover:text-slate-900 border border-neutral-200/70"
                }\`}
              >
                <Settings className={\`w-4 h-4 shrink-0 \${settingsExpanded ? "text-slate-600" : "text-slate-500"}\`} />
                <span className="font-sans tracking-tight">Settings</span>
                <ChevronDown className={\`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 \${settingsExpanded ? "rotate-180 text-slate-700" : ""}\`} />
              </button>
              {settingsExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-slate-200 space-y-1 py-1">
                  {[
                    { id: "account_settings", label: "Account Settings", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "preferences", label: "Preferences", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "event_book", label: "Event Book", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "engine_guide", label: "Astrological Rule Engine", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "kp_book", label: "KP Book", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "theme", label: "Theme", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "kp_documentation", label: "KP Documentation", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "google_drive", label: "Google Drive Backup", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "google_calendar", label: "Google Calendar Sync", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "google_gmail", label: "Google Gmail Dispatcher", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "google_keep", label: "Google Keep Notes", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "google_contacts", label: "Google Contacts", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "github_ota", label: "GitHub OTA Updates", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "language", label: "Language", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "api_keys", label: "API Keys", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "offline_mode", label: "Offline Mode", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "table_index", label: "Table Index", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "raw_json", label: "Raw JSON", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "api_inspector", label: "API Inspector", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "request_log", label: "Request Log", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "response_log", label: "Response Log", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "dto_viewer", label: "DTO Viewer", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "room_database_viewer", label: "Room Database Viewer", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "plugin_manager", label: "Plugin Manager", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "performance", label: "Performance", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "cache_manager", label: "Cache Manager", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "jhora_birth_details", label: "JH1: Birth Details", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "jhora_planets", label: "JH2: Planets", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "jhora_dignity", label: "JH32: Dignity", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "jhora_shadbala", label: "JH3: Shadbala", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "jhora_bhava_balas", label: "JH4: Bhava Strengths", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "jhora_ashtakavarga", label: "JH5: Ashtakavarga", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "jhora_divisional", label: "JH6: Charts", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "jhora_vimshottari", label: "JH7: Vimshottari", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "kp_cusps", label: "JH8: KP Cusps", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "kp_sub_lords", label: "JH9: KP Sub-Lords", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "kp_planet_significators", label: "JH10: KP Planets", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "kp_house_significators", label: "JH11: KP Houses", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "tajika_varshaphal", label: "JH16: Varshaphal", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "tajika_harshabala", label: "JH17: Harsha Balas", theme: "bg-slate-50 text-slate-950 border-slate-200/80" },
                    { id: "lalkitab_houses", label: "JH18: LKB Houses", theme: "bg-gray-50 text-gray-950 border-gray-200/80" },
                    { id: "lalkitab_teva", label: "JH19: LKB Teva", theme: "bg-slate-50 text-slate-950 border-slate-200/80" }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveSubmenuPanel(sub.id);
                        onNavigateMenu?.(sub.id.startsWith("jhora_") || sub.id.startsWith("kp_") || sub.id.startsWith("tajika_") || sub.id.startsWith("lalkitab_") || ["theme", "api_keys", "offline_mode", "table_index", "raw_json", "api_inspector", "request_log", "response_log", "dto_viewer", "room_database_viewer", "plugin_manager", "performance", "cache_manager", "github_ota", "google_drive", "google_calendar", "google_gmail", "google_keep", "google_contacts", "language", "account_settings", "preferences", "kp_documentation"].includes(sub.id) ? "astro" : "ai_assistant", sub.id);
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
              )}
            </div>
          </div>

        </div>`;

content = content.replace(target, replacement);

if (!content.includes('const [settingsExpanded, setSettingsExpanded] = useState(false);')) {
    content = content.replace(
        'const [myReportsExpanded, setMyReportsExpanded] = useState(false);',
        'const [myReportsExpanded, setMyReportsExpanded] = useState(false);\n  const [settingsExpanded, setSettingsExpanded] = useState(false);'
    );
}

fs.writeFileSync('src/components/AstroChat.tsx', content);
