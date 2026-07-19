import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Download, 
  Smartphone, 
  Sparkles, 
  Laptop, 
  Tablet, 
  Chrome, 
  ArrowRight, 
  CheckCircle,
  HelpCircle,
  Share,
  Tv
} from "lucide-react";

interface AndroidInstallerPromoProps {
  isDark: boolean;
}

export const AndroidInstallerPromo: React.FC<AndroidInstallerPromoProps> = ({ isDark }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showHowToModal, setShowHowToModal] = useState(false);

  useEffect(() => {
    // Check if app is already launched in standalone mode (installed)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Trigger instruction manual if direct prompt is blocked or unavailable (e.g. inside an iframe)
      setShowHowToModal(true);
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("PWA install execution failed:", err);
      setShowHowToModal(true);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border transition-all ${
      isDark 
        ? "bg-slate-950 border-amber-500/15 text-slate-100" 
        : "bg-orange-50/40 border-orange-200 text-neutral-800"
    }`} id="pwa-install-container">
      
      {/* Mystical Curved Backdrop Lines exactly matching the screenshot's loop style */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30 flex items-center justify-center">
        <div className="w-[300px] sm:w-[480px] h-[120px] sm:h-[180px] rounded-full border-4 border-dashed border-amber-500/40 flex items-center justify-center transform rotate-[-6deg] animate-float-slow">
          <div className="w-[260px] sm:w-[420px] h-[90px] sm:h-[140px] rounded-full border-2 border-indigo-500/30 flex items-center justify-center">
            <div className="w-[200px] sm:w-[340px] h-[60px] sm:h-[100px] rounded-full border border-amber-400/20" />
          </div>
        </div>
      </div>

      {/* Outer Floating Mystical Badges */}
      <div className="absolute top-8 left-1/4 w-3 h-3 rounded-full bg-rose-500 animate-pulse hidden md:block" />
      <div className="absolute bottom-12 right-1/4 w-4 h-4 rounded-full bg-amber-400 opacity-60 animate-bounce hidden md:block" />

      {/* Main Container */}
      <div className="relative max-w-4xl mx-auto px-6 py-12 sm:py-16 flex flex-col items-center text-center space-y-8 z-10">
        
        {/* Playful Vedic Logo Badge */}
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Sparkles className="w-3 h-3" />
          OMNI-CHANNEL CROSS PLATFORM ACCESS
        </div>

        {/* Title exactly matching the screenshot layout style */}
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-sm sm:text-base md:text-lg font-sans text-slate-400 uppercase tracking-widest font-medium">
            Your AI Assistant to Enhance
          </h2>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className={isDark ? "text-slate-100" : "text-slate-900"}>Astrological</span>{" "}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 font-sans font-medium">
              Reading|
              {/* Soft decorative underline */}
              <span className="absolute left-0 bottom-1 w-full h-[3px] bg-gradient-to-r from-amber-500 to-rose-500 rounded-full opacity-60" />
            </span>
          </h1>
        </div>

        {/* Short description exactly styled like the mockup */}
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed font-sans">
          We are dedicated to forging a seamless integration between cutting-edge AI technology and your personal birth charts, aiming to enhance your experience across mobile, tablet, and desktop.
        </p>

        {/* Playful Central Illustration Ring with Floating Icons */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          
          {/* Main Cosmic Sphere Card */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center p-4 shadow-xl shadow-amber-500/5 relative group hover:rotate-12 transition-transform duration-500">
            <div className="text-center">
              <span className="text-4xl sm:text-5xl block select-none animate-bounce">ॐ</span>
              <span className="text-[9px] font-mono font-bold tracking-widest text-amber-400 block mt-1">JHoraAI</span>
            </div>
          </div>

          {/* Floating Badges Around Sphere */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 bg-slate-900/90 border border-amber-500/30 text-amber-400 p-2 rounded-2xl shadow-lg flex items-center justify-center animate-bounce duration-1000">
            <Smartphone className="w-4 h-4 sm:w-5 h-5" />
          </div>
          <div className="absolute top-12 right-0 transform translate-x-1/3 bg-slate-900/90 border border-indigo-500/30 text-indigo-400 p-2 rounded-2xl shadow-lg flex items-center justify-center animate-pulse">
            <Tablet className="w-4 h-4 sm:w-5 h-5" />
          </div>
          <div className="absolute bottom-6 left-8 transform bg-slate-900/90 border border-emerald-500/30 text-emerald-400 p-2 rounded-2xl shadow-lg flex items-center justify-center">
            <Laptop className="w-4 h-4 sm:w-5 h-5" />
          </div>
        </div>

        {/* Action Installation Buttons with Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          {isInstalled ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold w-full justify-center">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              JHora AI Application is active and installed on this device!
            </div>
          ) : (
            <>
              {/* Main Android PWA Install Button */}
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto shine-beam animate-pulse-ring bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold px-6 py-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/10 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4.5 h-4.5" />
                Install Mobile / Tablet App
              </button>

              {/* How to Install manually info */}
              <button
                onClick={() => setShowHowToModal(true)}
                className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 border border-slate-800 font-bold px-5 py-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                Install Guide
              </button>
            </>
          )}
        </div>

        {/* Mini Device Badges Footer matching mockups */}
        <div className="pt-6 border-t border-slate-800/60 w-full flex flex-wrap justify-center items-center gap-6 text-[10px] sm:text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1.5 hover:text-amber-500 transition-colors">
            <Chrome className="w-4 h-4" /> Add to Chrome
          </span>
          <span className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
            <Smartphone className="w-4 h-4" /> Android (APK Equivalent PWA)
          </span>
          <span className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">
            <Tablet className="w-4 h-4" /> Tablet & iPad Support
          </span>
        </div>
      </div>

      {/* Manual Installation Helper Drawer/Modal */}
      {showHowToModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative space-y-5 text-left">
            
            <button
              onClick={() => setShowHowToModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-sm font-bold"
            >
              ✕
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-sans font-medium text-amber-100 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-500" />
                Install JHora AI on Mobile & Tablet
              </h3>
              <p className="text-xs text-slate-400">
                Follow these simple clicks to install JHora AI on any device as a standalone native app (supports offline computational caching).
              </p>
            </div>

            <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-indigo-500/5">
              {/* Step 1 */}
              <div className="flex gap-3 text-xs">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="font-semibold text-slate-200">For Android / Chrome</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Click the browser's menu button <span className="text-amber-400 font-bold">⋮</span> (three dots) on top-right, then select <span className="text-amber-400 font-semibold">"Install App"</span> or <span className="text-amber-400 font-semibold">"Add to Home Screen"</span>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 text-xs border-t border-slate-800/40 pt-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="font-semibold text-slate-200">For Apple iOS (iPhone/iPad)</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Open in <span className="text-indigo-400 font-semibold">Safari</span>, tap the <span className="text-indigo-400 font-semibold">Share</span> button <Share className="w-3.5 h-3.5 inline mx-0.5 text-indigo-400" />, and tap <span className="text-indigo-400 font-semibold">"Add to Home Screen"</span>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3 text-xs border-t border-slate-800/40 pt-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="font-semibold text-slate-200">Vedic Standalone Experience</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    The app launches as a full-screen application without URL bars, running fully cached with rapid coordinate offline loading.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHowToModal(false)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider"
            >
              Got it, let's install!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
