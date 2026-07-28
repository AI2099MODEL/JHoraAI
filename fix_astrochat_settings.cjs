const fs = require('fs');
let content = fs.readFileSync('src/components/AstroChat.tsx', 'utf-8');

const target = `            {/* 3. My Reports */}
            <div className="space-y-0.5 pt-2 border-t border-neutral-200/60">
              <button
                onClick={() => setMyReportsExpanded(!myReportsExpanded)}
                className={\`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs \${
                  myReportsExpanded 
                    ? "bg-gradient-to-r from-teal-100/90 via-emerald-100/70 to-cyan-50 text-teal-950 border border-teal-200" 
                    : "bg-neutral-50/80 hover:bg-teal-50/60 text-neutral-800 hover:text-teal-900 border border-neutral-200/70"
                }\`}
              >
                <FileText className={\`w-4 h-4 shrink-0 \${myReportsExpanded ? "text-teal-600" : "text-teal-500"}\`} />
                <span className="font-sans tracking-tight">My Reports</span>
                <ChevronDown className={\`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 \${myReportsExpanded ? "rotate-180 text-teal-700" : ""}\`} />
              </button>
              {myReportsExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-teal-200 space-y-1 py-1">
                  {[
                    { id: "reports_hub", label: "Reports Hub", theme: "bg-teal-50 text-teal-950 border-teal-200/80" },
                    { id: "my_life_analysis", label: "Life Analysis Report", theme: "bg-emerald-50 text-emerald-950 border-emerald-200/80" },
                    { id: "predictions", label: "Dasha & Predictions Report", theme: "bg-indigo-50 text-indigo-950 border-indigo-200/80" },
                    { id: "kp", label: "KP Horary & Event Report", theme: "bg-cyan-50 text-cyan-950 border-cyan-200/80" },
                    { id: "vedic", label: "My Astro Details", theme: "bg-amber-50 text-amber-950 border-amber-200/80" }
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
                          ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold border-teal-700"
                          : \`\${sub.theme} hover:brightness-95\`
                      }\`}
                    >
                      <Sparkles className="w-3 h-3 shrink-0 opacity-80" />
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer (User details) */}`;

const replace = `            {/* 3. My Reports */}
            <div className="space-y-0.5 pt-2 border-t border-neutral-200/60">
              <button
                onClick={() => setMyReportsExpanded(!myReportsExpanded)}
                className={\`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs \${
                  myReportsExpanded 
                    ? "bg-gradient-to-r from-teal-100/90 via-emerald-100/70 to-cyan-50 text-teal-950 border border-teal-200" 
                    : "bg-neutral-50/80 hover:bg-teal-50/60 text-neutral-800 hover:text-teal-900 border border-neutral-200/70"
                }\`}
              >
                <FileText className={\`w-4 h-4 shrink-0 \${myReportsExpanded ? "text-teal-600" : "text-teal-500"}\`} />
                <span className="font-sans tracking-tight">My Reports</span>
                <ChevronDown className={\`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 \${myReportsExpanded ? "rotate-180 text-teal-700" : ""}\`} />
              </button>
              {myReportsExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-teal-200 space-y-1 py-1">
                  {[
                    { id: "reports_hub", label: "Reports Hub", theme: "bg-teal-50 text-teal-950 border-teal-200/80" },
                    { id: "my_life_analysis", label: "Life Analysis Report", theme: "bg-emerald-50 text-emerald-950 border-emerald-200/80" },
                    { id: "predictions", label: "Dasha & Predictions Report", theme: "bg-indigo-50 text-indigo-950 border-indigo-200/80" },
                    { id: "kp", label: "KP Horary & Event Report", theme: "bg-cyan-50 text-cyan-950 border-cyan-200/80" },
                    { id: "vedic", label: "My Astro Details", theme: "bg-amber-50 text-amber-950 border-amber-200/80" }
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
                          ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold border-teal-700"
                          : \`\${sub.theme} hover:brightness-95\`
                      }\`}
                    >
                      <Sparkles className="w-3 h-3 shrink-0 opacity-80" />
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>
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
                    // Other system menus moved here
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
              )}
            </div>

          </div>
        </div>

        {/* Sidebar Footer (User details) */}`;

if (content.includes('            {/* 3. My Reports */}')) {
    content = content.replace(target, replace);
}

// Ensure state is added
if (!content.includes('const [settingsExpanded, setSettingsExpanded] = useState(false);')) {
    content = content.replace('  const [myReportsExpanded, setMyReportsExpanded] = useState(false);', '  const [myReportsExpanded, setMyReportsExpanded] = useState(false);\n  const [settingsExpanded, setSettingsExpanded] = useState(false);');
}

fs.writeFileSync('src/components/AstroChat.tsx', content);
