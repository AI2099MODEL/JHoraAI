const fs = require('fs');
let content = fs.readFileSync('src/components/AstroChat.tsx', 'utf-8');

const oldReportsStart = `            {/* 3. My Reports */}`;
const oldReportsEnd = `            {/* 4. Settings */}`;

const startIndex = content.indexOf(oldReportsStart);
const endIndex = content.indexOf(oldReportsEnd);

if (startIndex !== -1 && endIndex !== -1) {
    const newReports = `            {/* 3. My Reports */}
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
                    { id: "kp", label: "KP Horary & Event Report", theme: "bg-cyan-50 text-cyan-950 border-cyan-200/80" }
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
`;

    content = content.substring(0, startIndex) + newReports + "\n" + content.substring(endIndex);
    fs.writeFileSync('src/components/AstroChat.tsx', content);
    console.log("Updated AstroChat My Reports section.");
} else {
    console.log("Failed to find bounds.");
}
