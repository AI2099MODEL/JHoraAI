const fs = require('fs');
let content = fs.readFileSync('src/components/AstroChat.tsx', 'utf-8');

const oldSidebarStart = `            {/* 1. My Journey (Renamed from My Mood Analysis) */}`;
const oldSidebarEnd = `            {/* 3. My Reports */}`;

const startIndex = content.indexOf(oldSidebarStart);
const endIndex = content.indexOf(oldSidebarEnd);

if (startIndex !== -1 && endIndex !== -1) {
    const newSidebar = `            {/* 0. Ask Me (AI Prompts) */}
            <div className="space-y-0.5">
              <button
                onClick={() => setAskMeExpanded(!askMeExpanded)}
                className={\`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs \${
                  askMeExpanded 
                    ? "bg-gradient-to-r from-blue-100/90 via-indigo-100/70 to-blue-50 text-blue-950 border border-blue-200" 
                    : "bg-neutral-50/80 hover:bg-blue-50/60 text-neutral-800 hover:text-blue-900 border border-neutral-200/70"
                }\`}
              >
                <Sparkles className={\`w-4 h-4 shrink-0 \${askMeExpanded ? "text-blue-600" : "text-blue-500"}\`} />
                <span className="font-sans tracking-tight">Ask Me</span>
                <ChevronDown className={\`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 \${askMeExpanded ? "rotate-180 text-blue-700" : ""}\`} />
              </button>
              {askMeExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-blue-200 space-y-2 py-1">
                  {/* AI Analysis Prompts */}
                  <div className="space-y-1 max-h-[160px] overflow-y-auto scrollbar-thin pr-1">
                    {getMoodPromptsFromJSON().map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          runAnalysis(p.query);
                          setSidebarOpen(false);
                        }}
                        className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-[11px] font-medium text-neutral-800 hover:text-blue-950 bg-neutral-50/60 hover:bg-blue-50 border border-transparent hover:border-blue-200/80 w-full text-left transition-all cursor-pointer group shadow-2xs"
                        title={p.label}
                      >
                        <Send className="w-3 h-3 text-blue-500 group-hover:text-indigo-600 shrink-0" />
                        <span className="truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 1. My Life */}
            <div className="space-y-0.5 pt-2 border-t border-neutral-200/60">
              <button
                onClick={() => setMyLifeExpanded(!myLifeExpanded)}
                className={\`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs \${
                  myLifeExpanded 
                    ? "bg-gradient-to-r from-amber-100/90 via-rose-100/70 to-purple-50 text-amber-950 border border-amber-200" 
                    : "bg-neutral-50/80 hover:bg-amber-50/60 text-neutral-800 hover:text-amber-900 border border-neutral-200/70"
                }\`}
              >
                <Heart className={\`w-4 h-4 shrink-0 \${myLifeExpanded ? "text-rose-600" : "text-rose-500"}\`} />
                <span className="font-sans tracking-tight">My Life</span>
                <ChevronDown className={\`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 \${myLifeExpanded ? "rotate-180 text-amber-700" : ""}\`} />
              </button>
              {myLifeExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-rose-200 space-y-2 py-1">
                  <div className="space-y-1">
                    {[
                      { id: "my_life_analysis", label: "My Life Analysis", theme: "bg-rose-50 text-rose-950 border-rose-200 hover:bg-rose-600 hover:text-white" }
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
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold border-indigo-700"
                            : \`\${sub.theme}\`
                        }\`}
                      >
                        <Sparkles className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                  {/* My Astro Systems */}
                  <div className="space-y-1 pt-1">
                    {[
                      { id: "vedic", label: "My Astro Details", theme: "bg-amber-50/80 text-amber-950 border-amber-200/80" },
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
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold border-indigo-700"
                            : \`\${sub.theme} hover:brightness-95\`
                        }\`}
                      >
                        <Sparkles className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. My Journey */}
            <div className="space-y-0.5 pt-2 border-t border-neutral-200/60">
              <button
                onClick={() => setMyJourneyExpanded(!myJourneyExpanded)}
                className={\`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold w-full text-left transition-all cursor-pointer shadow-2xs \${
                  myJourneyExpanded 
                    ? "bg-gradient-to-r from-indigo-100/90 via-purple-100/70 to-indigo-50 text-indigo-950 border border-indigo-200" 
                    : "bg-neutral-50/80 hover:bg-indigo-50/60 text-neutral-800 hover:text-indigo-900 border border-neutral-200/70"
                }\`}
              >
                <Compass className={\`w-4 h-4 shrink-0 \${myJourneyExpanded ? "text-indigo-600" : "text-indigo-500"}\`} />
                <span className="font-sans tracking-tight">My Journey</span>
                <ChevronDown className={\`w-3.5 h-3.5 ml-auto text-neutral-500 transition-transform duration-200 \${myJourneyExpanded ? "rotate-180 text-indigo-700" : ""}\`} />
              </button>
              {myJourneyExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l-2 border-indigo-200 space-y-2 py-1">
                  {/* Journey Navigation Pages */}
                  <div className="space-y-1">
                    {[
                      { id: "birth", label: "Birth", theme: "bg-indigo-50 text-indigo-950 border-indigo-200 hover:bg-indigo-600 hover:text-white" },
                      { id: "daily", label: "Today", theme: "bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-500 hover:text-white" },
                      { id: "weekly", label: "Weekly", theme: "bg-orange-50 text-orange-950 border-orange-200 hover:bg-orange-600 hover:text-white" },
                      { id: "monthly", label: "Monthly", theme: "bg-blue-50 text-blue-950 border-blue-200 hover:bg-blue-600 hover:text-white" },
                      { id: "long_term", label: "Yearly", theme: "bg-purple-50 text-purple-950 border-purple-200 hover:bg-purple-600 hover:text-white" },
                      { id: "current_dasha", label: "Active Period", theme: "bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-600 hover:text-white" },
                      { id: "predictions", label: "Predictions", theme: "bg-indigo-50 text-indigo-950 border-indigo-200 hover:bg-indigo-600 hover:text-white" },
                      { id: "future", label: "Future", theme: "bg-cyan-50 text-cyan-950 border-cyan-200 hover:bg-cyan-600 hover:text-white" },
                      { id: "tajik", label: "Tajik", theme: "bg-fuchsia-50/80 text-fuchsia-950 border-fuchsia-200/80 hover:bg-fuchsia-600 hover:text-white" }
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
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold border-indigo-700"
                            : \`\${sub.theme}\`
                        }\`}
                      >
                        <Sparkles className="w-3 h-3 shrink-0 opacity-80" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

`;

    content = content.substring(0, startIndex) + newSidebar + content.substring(endIndex);
    
    // Make sure we also add askMeExpanded state.
    if (!content.includes('const [askMeExpanded, setAskMeExpanded]')) {
        content = content.replace(
            'const [myLifeExpanded, setMyLifeExpanded] = useState(false);',
            'const [askMeExpanded, setAskMeExpanded] = useState(false);\n  const [myLifeExpanded, setMyLifeExpanded] = useState(false);'
        );
    }
    
    fs.writeFileSync('src/components/AstroChat.tsx', content);
    console.log("Updated AstroChat sidebar.");
} else {
    console.log("Failed to find bounds.");
}
