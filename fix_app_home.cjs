const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const returnStart = content.indexOf('  const isChatMode =');
const returnEnd = content.lastIndexOf('  );') + 4; // Include the closing tag

if (returnStart !== -1 && returnEnd !== -1) {
    const replacement = `
  return (
    <div className="w-screen h-screen bg-white overflow-hidden flex flex-col" id="standalone-chat-container">
      <ThemeStyles />
      <AstroChat 
        astrologyData={astrologyData} 
        isStandalone={true} 
        birthSettingsContent={birthSettingsNode} 
        onNavigateMenu={(menu, submenu) => {
          setActiveMenu(menu);
          if (submenu) {
            setActiveSubMenu(prev => ({ ...prev, [menu]: submenu }));
          }
        }}
      />
      <UpdateNotification />
      {profileVerify.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setProfileVerify(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
            
            <div className="space-y-1">
              <h3 className="text-base font-sans font-medium text-amber-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Profile Availability Check
              </h3>
              <p className="text-xs text-slate-400">
                Checking files for <span className="text-amber-500 font-semibold">{profileVerify.record?.name}</span>...
              </p>
            </div>

            <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-indigo-500/5">
              {/* Local Machine Check */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Local Offline Storage
                </span>
                <span className="font-semibold">
                  {profileVerify.localStatus === "checking" && (
                    <span className="text-amber-400 animate-pulse">Checking Local...</span>
                  )}
                  {profileVerify.localStatus === "found" && (
                    <span className="text-green-400 flex items-center gap-1">✓ Found on Machine</span>
                  )}
                  {profileVerify.localStatus === "not_found" && (
                    <span className="text-rose-400">✗ Missing from Machine</span>
                  )}
                </span>
              </div>

              {/* Google Drive Check */}
              <div className="flex items-center justify-between text-xs border-t border-indigo-500/5 pt-2.5">
                <span className="text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Google Drive Cloud Backup
                </span>
                <span className="font-semibold">
                  {profileVerify.driveStatus === "pending" && (
                    <span className="text-slate-500">Awaiting Check</span>
                  )}
                  {profileVerify.driveStatus === "checking" && (
                    <span className="text-amber-400 animate-pulse">Querying Drive...</span>
                  )}
                  {profileVerify.driveStatus === "found" && (
                    <span className="text-green-400">✓ Connected & Found</span>
                  )}
                  {profileVerify.driveStatus === "not_found" && (
                    <span className="text-rose-400">✗ Not Found in Drive</span>
                  )}
                  {profileVerify.driveStatus === "skipped" && (
                    <span className="text-slate-500">Skipped (Not Authenticated)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Verification Steps Content */}
            {profileVerify.step === "checking" && (
              <div className="flex items-center justify-center gap-2 text-xs text-amber-500 animate-pulse py-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Retrieving profiles, please wait...
              </div>
            )}
            
            {profileVerify.step === "success" && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-xs text-green-300 text-center animate-in fade-in duration-300">
                ✓ Success! Profile verified. Hotloading dashboard parameters now...
              </div>
            )}
            
            {profileVerify.step === "upload_required" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-300 text-center">
                  ⚠️ Profile data is missing from local storage and Drive backups. Please upload a saved backup if you have one.
                </div>
                <div className="border border-dashed border-indigo-500/25 bg-slate-950/40 rounded-xl p-4 text-center">
                  <p className="text-[10px] text-slate-400 mb-2">Select the profile JSON to restore this card</p>
                  <label className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer transition-colors inline-flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5" />
                    Upload Backup
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadProfileJson(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );`;
    
    content = content.substring(0, returnStart) + replacement + content.substring(returnEnd);
    fs.writeFileSync('src/App.tsx', content);
} else {
    console.log("Could not find boundaries");
}
