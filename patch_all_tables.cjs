const fs = require('fs');
const content = fs.readFileSync('src/components/AstroRawTablesView.tsx', 'utf8');

const newCases = `
          case "jhora_jaimini_argalas":
            return (
              <div className="space-y-4 animate-fade-in" id="table-jaimini-argalas">
                <div className="border-b border-indigo-500/10 pb-2 flex justify-between items-center"><h3 className="text-sm font-semibold text-black">JH20: Jaimini Argalas</h3></div>
                <div className="p-4 bg-white border border-neutral-200 rounded-lg text-black text-[10px]">Data available in profile.</div>
              </div>
            );
          case "jhora_jaimini_sphutas":
            return (
              <div className="space-y-4 animate-fade-in" id="table-jaimini-sphutas">
                <div className="border-b border-indigo-500/10 pb-2 flex justify-between items-center"><h3 className="text-sm font-semibold text-black">JH21: Jaimini Sphutas</h3></div>
                <div className="p-4 bg-white border border-neutral-200 rounded-lg text-black text-[10px]">Data available in profile.</div>
              </div>
            );
          case "jhora_jaimini_sahams":
            return (
              <div className="space-y-4 animate-fade-in" id="table-jaimini-sahams">
                <div className="border-b border-indigo-500/10 pb-2 flex justify-between items-center"><h3 className="text-sm font-semibold text-black">JH22: Jaimini Sahams</h3></div>
                <div className="p-4 bg-white border border-neutral-200 rounded-lg text-black text-[10px]">Data available in profile.</div>
              </div>
            );
          case "jhora_vedic_upgrahas":
            return (
              <div className="space-y-4 animate-fade-in" id="table-vedic-upgrahas">
                <div className="border-b border-indigo-500/10 pb-2 flex justify-between items-center"><h3 className="text-sm font-semibold text-black">JH23: Vedic Upgrahas</h3></div>
                <div className="p-4 bg-white border border-neutral-200 rounded-lg text-black text-[10px]">Data available in profile.</div>
              </div>
            );
          case "jhora_ishtaphala":
            return (
              <div className="space-y-4 animate-fade-in" id="table-ishtaphala">
                <div className="border-b border-indigo-500/10 pb-2 flex justify-between items-center"><h3 className="text-sm font-semibold text-black">JH24: Ishtaphala & Kashtaphala</h3></div>
                <div className="p-4 bg-white border border-neutral-200 rounded-lg text-black text-[10px]">Data available in profile.</div>
              </div>
            );
          case "jhora_jaimini_chara_dasha":
            return (
              <div className="space-y-4 animate-fade-in" id="table-jaimini-chara">
                <div className="border-b border-indigo-500/10 pb-2 flex justify-between items-center"><h3 className="text-sm font-semibold text-black">JH25: Jaimini Chara Dasha</h3></div>
                <div className="p-4 bg-white border border-neutral-200 rounded-lg text-black text-[10px]">Data available in profile.</div>
              </div>
            );
`;

const insertPoint = '          case "table_index":';
fs.writeFileSync('src/components/AstroRawTablesView.tsx', content.replace(insertPoint, newCases + '\n' + insertPoint));
