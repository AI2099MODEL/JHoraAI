const fs = require('fs');
const content = fs.readFileSync('src/components/AstroRawTablesView.tsx', 'utf8');

const actionButtonsJSX = `                  <div className="flex items-center gap-2">
                    <button onClick={() => alert("Save functionality coming soon")} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Save">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => window.print()} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Print">
                      <Printer className="w-4 h-4" />
                    </button>
                    <button onClick={handleExportPDF} className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-700" title="Export PDF">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>`;

// Regex to find table headers and inject buttons
// It looks for <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
// followed by the <h3> tag, then closes the div.
const regex = /(<div className="flex justify-between items-center border-b border-indigo-500\/10 pb-2">[\s\S]*?<\/h3>\s*)(<\/div>)/g;

const newContent = content.replace(regex, `$1${actionButtonsJSX}\n                $2`);

fs.writeFileSync('src/components/AstroRawTablesView.tsx', newContent);
