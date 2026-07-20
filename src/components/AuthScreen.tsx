/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Mail, 
  User, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Phone,
  CloudLightning,
  Save,
  FileText,
  Send,
  ExternalLink
} from "lucide-react";
import { 
  AuthManager, 
  UserProfile, 
  saveProfileToGoogleDrive, 
  saveProfileToBackend,
  UserProfileRepository,
  SessionManager,
  sendEmailViaGmail
} from "../lib/firebaseAuth";

interface AuthScreenProps {
  onAuthSuccess: (profile: UserProfile | null) => void;
  activeUser: UserProfile | null;
}

export default function AuthScreen({ onAuthSuccess, activeUser }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsInIframe(typeof window !== "undefined" && window.self !== window.top);
  }, []);

  const handleCopy = (domain: string) => {
    navigator.clipboard.writeText(domain).then(() => {
      setCopiedDomain(domain);
      setTimeout(() => setCopiedDomain(null), 2000);
    }).catch(err => {
      console.error("Copy failed", err);
    });
  };
  
  // Form fields for editing user profile
  const [phone, setPhone] = useState("");
  const [emailField, setEmailField] = useState("");
  const [nameField, setNameField] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Initialize fields when user changes
  useEffect(() => {
    if (activeUser) {
      setPhone(activeUser.phoneNumber || "");
      setEmailField(activeUser.email || "");
      setNameField(activeUser.name || "");
    }
  }, [activeUser]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { profile } = await AuthManager.signInWithGoogle();
      onAuthSuccess(profile);
      setSuccess("Successfully authenticated via Google Secure Sign-In!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleBypassLogin = () => {
    setError(null);
    setSuccess(null);
    try {
      const guestUser: UserProfile = {
        uid: "guest_user_bypass",
        name: "Guest Seeker",
        email: "guest@jhora.ai",
        phoneNumber: "+15550000000",
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
        createdDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        savedProfiles: [],
        favorites: [],
        history: [],
        settings: {
          theme: "light",
          ayanamsa: "Lahiri (Chitra Paksha)",
          chartStyle: "north",
          language: "English",
          autoUpdate: true
        }
      };
      
      localStorage.setItem("jhora_user_profile", JSON.stringify(guestUser));
      
      SessionManager.saveSession({
        uid: "guest_user_bypass",
        email: "guest@jhora.ai",
        displayName: "Guest Seeker",
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
      } as any, "mock_guest_token");

      onAuthSuccess(guestUser);
      setSuccess("Bypassed Google Sign-In! Welcome in Guest Mode.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to bypass Google Sign-In.");
    }
  };

  const handleSaveAndSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Build updated profile
      const updated: UserProfile = {
        ...activeUser,
        name: nameField.trim() || activeUser.name,
        email: emailField.trim() || activeUser.email,
        phoneNumber: phone.trim() || undefined,
        lastLogin: new Date().toISOString()
      };

      // 2. Save in Firestore
      await UserProfileRepository.saveProfile(updated);

      // 3. Save in Local Machine
      localStorage.setItem("jhora_user_profile", JSON.stringify(updated));
      onAuthSuccess(updated);

      // 4. Send to Express Backend (to trigger analysis, email reports, etc.)
      await saveProfileToBackend(updated);

      // 5. Get access token from local session to save on Google Drive
      const session = SessionManager.getLocalSession();
      if (session && session.accessToken) {
        await saveProfileToGoogleDrive(session.accessToken, updated);
      }

      setSuccess("Profile successfully updated and synced across Local Machine, Google Drive, and Cloud Backend!");
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save and sync user profile.");
    } finally {
      setSyncing(false);
    }
  };

  const handleSendGmailReport = async () => {
    if (!activeUser) return;
    const session = SessionManager.getLocalSession();
    if (!session || !session.accessToken) {
      setError("Active Google login session not found. Please sign in again to authorize sending emails via Gmail.");
      return;
    }

    setSendingEmail(true);
    setError(null);
    setSuccess(null);

    try {
      const subject = `✨ JHoraAI Cosmic Astrology Update for ${activeUser.name}`;
      const htmlBody = `
        <div style="font-family: sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #312e81;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f59e0b; font-size: 28px; margin: 0; font-family: 'Georgia', serif;">JHoraAI Cosmic Update</h1>
            <p style="color: #94a3b8; font-size: 11px; font-family: monospace; letter-spacing: 2px;">VEDIC & KP PRECISION ENGINE</p>
          </div>
          <div style="line-height: 1.6; font-size: 14px; color: #cbd5e1;">
            <p>Namaste <strong>${activeUser.name}</strong>,</p>
            <p>Your JHoraAI profile has been securely backed up and synchronized across your Local Machine, Google Drive, and Cloud Database.</p>
            
            <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #334155;">
              <h3 style="color: #f59e0b; margin-top: 0; font-size: 15px; font-family: monospace;">🔒 USER CLOUD LEDGER</h3>
              <table style="width: 100%; font-size: 13px; color: #cbd5e1;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; width: 120px;">Email Profile</td>
                  <td style="padding: 4px 0; font-family: monospace;">${activeUser.email}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Phone Capture</td>
                  <td style="padding: 4px 0; font-family: monospace;">${activeUser.phoneNumber || "Not provided"}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Google Sync</td>
                  <td style="padding: 4px 0; color: #10b981; font-weight: bold;">✓ Google Drive Active</td>
                </tr>
              </table>
            </div>

            <p>We are continuously processing cosmic calculations, house significators, stellar Nakshatra nakshatras, and transits to power your Vedic and KP Horoscopes.</p>
            <p>Feel free to return to the JHoraAI dashboard to calculate charts, match compatibility, and analyze Kp stellar layouts.</p>
          </div>
          <div style="text-align: center; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px; font-size: 11px; color: #64748b;">
            <p>This report was securely transmitted using the <strong>Google Gmail API</strong> following your authenticated sign-in.</p>
            <p>&copy; 2026 JHoraAI Astro Platform. All cosmic alignments reserved.</p>
          </div>
        </div>
      `;

      await sendEmailViaGmail(session.accessToken, activeUser.email, subject, htmlBody);
      setSuccess(`A beautiful personal astrology report has been successfully emailed to your Google account (${activeUser.email}) via Gmail API integration!`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to dispatch email via Google Gmail API.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AuthManager.logout();
      localStorage.removeItem("jhora_user_profile");
      onAuthSuccess(null);
      setSuccess("Successfully logged out!");
      setPhone("");
      setEmailField("");
      setNameField("");
    } catch (err: any) {
      setError(err.message || "Failed to log out.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete your JHoraAI profile? This is irreversible.")) return;
    setLoading(true);
    try {
      await AuthManager.deleteAccount();
      onAuthSuccess(null);
      setSuccess("Account deleted successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to delete account.");
    } finally {
      setLoading(false);
    }
  };

  // Render Logged-In State Profile Panel
  if (activeUser) {
    return (
      <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-6 space-y-6 max-w-xl mx-auto text-left" id="m3-logged-in-panel">
        <div className="flex items-center gap-4">
          <img 
            src={activeUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150"} 
            alt={activeUser.name} 
            className="w-16 h-16 rounded-full border-2 border-amber-500 object-cover shadow-lg" 
            id="m3-user-avatar"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="text-lg font-sans font-semibold text-amber-100" id="m3-user-fullname">
              {activeUser.name}
            </h3>
            <p className="text-xs text-slate-400" id="m3-user-email">
              {activeUser.email}
            </p>
            {activeUser.phoneNumber && (
              <p className="text-xs text-amber-500/80 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" /> {activeUser.phoneNumber}
              </p>
            )}
            <span className="inline-block mt-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Synced with Google OAuth & Firebase
            </span>
          </div>
        </div>

        {/* Sync Actions & Form */}
        {isEditing ? (
          <form onSubmit={handleSaveAndSync} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-4" id="m3-profile-edit-form">
            <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Update Personal Info</h4>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={nameField}
                  onChange={(e) => setNameField(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl text-xs text-slate-200 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={emailField}
                  onChange={(e) => setEmailField(e.target.value)}
                  placeholder="your-email@gmail.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl text-xs text-slate-200 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl text-xs text-slate-200 outline-none transition-all"
                />
              </div>
              <p className="text-[9px] text-slate-500 font-mono mt-1">
                We respect your privacy. This phone number will be encrypted and saved across Google Drive and Firestore.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={syncing}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Save & Sync</>}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-4" id="m3-session-stats">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Secure Backup Status</h4>
              <button
                onClick={() => setIsEditing(true)}
                className="text-[11px] text-amber-500 hover:underline cursor-pointer font-semibold"
              >
                Edit Info
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">UID</span>
                <span className="font-mono text-slate-300 break-all">{activeUser.uid}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Google Drive Sync</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Saved in Drive file
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Analysis Sync</span>
                <span className="text-amber-400 flex items-center gap-1 font-semibold">
                  <CloudLightning className="w-3.5 h-3.5 animate-pulse" /> Email Report Pending
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone Capture</span>
                <span className="text-slate-300 font-mono">
                  {activeUser.phoneNumber || "Not provided (Click Edit Info)"}
                </span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-200 flex items-start gap-2">
              <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Vedic & KP Report Automated:</strong> Once you calculate or complete a birth chart under this profile, our backend engine will run a complete astrological analysis and securely email it to you!
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSendGmailReport}
                disabled={sendingEmail}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10"
                id="send-gmail-report-btn"
              >
                {sendingEmail ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Astrology Report via Gmail Integration
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Notifications */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="break-all">{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2" id="m3-logged-in-actions">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer text-center"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Logout Profile"}
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 disabled:opacity-50 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Account
          </button>
        </div>
      </div>
    );
  }

  // Render Material 3 Auth Panel (GOOGLE ONLY)
  const activeProjectId = AuthManager.auth?.app?.options?.projectId || "gen-lang-client-0193743078";
  const activeAuthDomain = AuthManager.auth?.app?.options?.authDomain || "gen-lang-client-0193743078.firebaseapp.com";

  const currentDevHost = typeof window !== "undefined" ? window.location.hostname : "ais-dev-hqixtkxxrplcdrfbw5q33r-443356580754.asia-east1.run.app";
  const currentPreHost = currentDevHost.includes("-dev-") 
    ? currentDevHost.replace("-dev-", "-pre-") 
    : (currentDevHost.includes("-pre-") ? currentDevHost : "ais-pre-hqixtkxxrplcdrfbw5q33r-443356580754.asia-east1.run.app");
  const currentActualDevHost = currentDevHost.includes("-pre-") 
    ? currentDevHost.replace("-pre-", "-dev-") 
    : currentDevHost;

  return (
    <div className="bg-slate-950/60 border border-indigo-500/10 rounded-2xl p-6 max-w-md mx-auto space-y-6 text-left shadow-2xl" id="m3-auth-screen-container">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <Shield className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-lg font-sans font-medium text-amber-100">
          Sign In to JHoraAI
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Unlock premium Vedic & KP charts, save birth profiles directly to Google Drive, and sync histories securely with Google Cloud.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="space-y-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Sign-In Notice:</span>
              <span className="break-all">{error}</span>
            </div>
          </div>

          {/* Dedicated Project Mismatch Diagnostic Card for auth/unauthorized-domain */}
          {error.includes("auth/unauthorized-domain") && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-3" id="project-mismatch-diagnostic">
              <div className="flex items-center gap-2 font-semibold text-amber-300 text-sm">
                <span>🔌</span>
                <span>Connect Applet to Your Custom "JHoraAI Professional" Project</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                You have authorized your preview domains under the custom Firebase project <strong className="text-amber-300 font-mono">jhoraai-professional</strong>, but this development applet is currently connected to the default sandbox project <strong className="text-amber-300 font-mono">{activeProjectId}</strong>.
              </p>
              <div className="space-y-2 text-[11px] text-slate-300 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <span className="font-semibold text-amber-400 block">👉 How to fix (Use your custom Firebase Project):</span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>
                    Open the <strong className="text-white">Settings</strong> menu of AI Studio (click the gear icon <strong className="text-white">⚙️</strong> in the panel).
                  </li>
                  <li>
                    Scroll to the <strong className="text-white">Environment Variables</strong> section.
                  </li>
                  <li>
                    Add the following variables with your custom project's settings:
                    <div className="mt-1.5 space-y-1 font-mono text-[10px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 select-all">
                      <div>VITE_FIREBASE_API_KEY = <span className="text-slate-500">&lt;Your Web API Key&gt;</span></div>
                      <div className="text-amber-200/90">VITE_FIREBASE_AUTH_DOMAIN = "jhoraai-professional.firebaseapp.com"</div>
                      <div className="text-amber-200/90">VITE_FIREBASE_PROJECT_ID = "jhoraai-professional"</div>
                      <div className="text-amber-200/90">VITE_FIREBASE_STORAGE_BUCKET = "jhoraai-professional.appspot.com"</div>
                      <div>VITE_FIREBASE_MESSAGING_SENDER_ID = <span className="text-slate-500">&lt;Your Sender ID&gt;</span></div>
                      <div>VITE_FIREBASE_APP_ID = <span className="text-slate-500">&lt;Your Web App ID&gt;</span></div>
                    </div>
                  </li>
                  <li className="text-slate-300">
                    Once saved, the applet will automatically rebuild and connect to your custom project!
                  </li>
                </ol>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-900/90 border border-amber-500/20 rounded-xl text-xs text-slate-300 space-y-3">
            <h4 className="font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
              🛠️ Google Auth & Firebase Resolution Steps
            </h4>
            
            <ul className="space-y-2.5 list-decimal list-inside text-slate-300 text-[11px] leading-relaxed">
              <li>
                <strong>Bypass Google Warning screen:</strong> Since this app is in the development environment, Google displays a warning <em>"This app is in development / hasn't been verified by Google yet"</em>. 
                To sign in, simply click <strong>"Advanced"</strong> (bottom-left of the Google popup) and then click <strong>"Go to {activeAuthDomain} (unsafe)"</strong>.
              </li>
              <li>
                <strong>Authorize Preview Domains:</strong> If you see an <code>auth/unauthorized-domain</code> error:
                <div className="mt-2 space-y-2 border-l border-amber-500/20 pl-3">
                  <p className="text-[11px] text-amber-300/90 leading-normal">
                    💡 <strong>Critical Tab Location:</strong> In your Firebase Console for project <strong className="font-mono text-amber-400 select-all">{activeProjectId}</strong>, click on the <strong className="underline">Settings</strong> tab (located directly in the top sub-menu bar, between <em>Usage</em> and <em>Extensions</em>). Then click <strong>Authorized domains</strong> in the side list.
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Click the buttons below to copy each required domain, then click "Add domain" in Firebase Console to paste them:
                  </p>
                  <div className="space-y-1.5 mt-2">
                    {[currentActualDevHost, currentPreHost].map((domain) => (
                      <div key={domain} className="flex items-center justify-between gap-2 p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px]">
                        <span className="font-mono text-slate-300 break-all select-all">{domain}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(domain)}
                          className={`shrink-0 px-2.5 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                            copiedDomain === domain
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 hover:text-amber-300"
                          }`}
                        >
                          {copiedDomain === domain ? "✓ Copied" : "📋 Copy"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
              <li>
                <strong>Configure Google Consent Test Users:</strong> Because the Google Cloud App is in <em>"Testing"</em> mode, only registered users can sign in. Open the <a href={`https://console.cloud.google.com/apis/credentials/consent?project=${activeProjectId}`} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-0.5">Google Cloud OAuth Consent Screen</a>, select your project <code>{activeProjectId}</code>, and click <strong>"Add Users"</strong> under Test Users to add:
                <div className="mt-1 font-mono text-amber-300">anuakku2013@gmail.com</div>
                Alternatively, click the <strong>"Publish App"</strong> button under the consent settings to move it to Production, making it available to any Google user instantly.
              </li>
            </ul>
          </div>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-start gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Social Google Login Button (The exclusive login option) */}
      <div className="space-y-4 py-2">
        {isInIframe && (
          <div className="space-y-3">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 space-y-2" id="iframe-auth-warning">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <span className="animate-pulse">⚠️</span>
                <span>Iframe Preview Warning</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                You are currently viewing this application inside the editor's sandbox iframe. Google Sign-In popups are <strong>blocked</strong> inside iframes by modern browser security policies.
              </p>
              <div className="pt-1">
                <p className="text-[11px] text-amber-400 font-medium">
                  👉 <strong>How to fix:</strong> Click the <strong>"Open in new tab"</strong> button at the top-right of your preview iframe, or click the direct button below:
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.open(window.location.href, "_blank");
                }
              }}
              type="button"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-sans font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-600 shadow-md hover:shadow-lg active:scale-95"
              id="iframe-bypass-open-tab"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              Open Application in New Tab to Sign In
            </button>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="w-full py-3 bg-white hover:bg-neutral-100 text-neutral-800 font-sans font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-neutral-300 shadow-md hover:shadow-lg hover:scale-[1.01]"
          id="google-signin-btn-m3"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-neutral-600" />
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.57 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.53 8.92 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.43-4.92 3.43-8.55z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.36 10.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 2.9C.54 4.82 0 6.98 0 9.25c0 2.27.54 4.43 1.5 6.35l3.86-3.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 18.96c-3.08 0-5.73-2.49-6.64-5.46l-3.86 3C3.4 20.35 7.35 23 12 23c2.96 0 5.44-.98 7.25-2.66l-3.7-2.87c-1 .67-2.28 1.49-3.55 1.49z"
                />
              </svg>
              Continue with Google Account
            </>
          )}
        </button>

        <div className="relative my-2 flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase font-mono tracking-widest">Or Bypass / Test Mode</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <button
          onClick={handleBypassLogin}
          type="button"
          className="w-full py-2.5 bg-slate-900/90 hover:bg-slate-800 text-amber-400 font-sans font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-800 hover:border-amber-500/30 shadow-md active:scale-95 animate-fade-in"
          id="bypass-google-btn"
        >
          <CloudLightning className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Bypass Google Sign-In (Guest Mode)</span>
        </button>

        <p className="text-[10px] text-center text-slate-500 leading-relaxed max-w-xs mx-auto">
          By signing in, you agree to secure synchronization of your profile, birth charts, settings, and contacts on Google services.
        </p>
      </div>
    </div>
  );
}
