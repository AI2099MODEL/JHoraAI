/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Shield, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Trash2,
  LockKeyhole
} from "lucide-react";
import { AuthManager, UserProfile } from "../lib/firebaseAuth";

interface AuthScreenProps {
  onAuthSuccess: (profile: UserProfile | null) => void;
  activeUser: UserProfile | null;
}

export default function AuthScreen({ onAuthSuccess, activeUser }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await AuthManager.signInWithGoogle();
      // Fetch dynamic profile
      const userProfile: UserProfile = {
        uid: user.uid,
        name: user.displayName || "Vedic Astrologer",
        email: user.email || "",
        photoURL: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
        createdDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        savedProfiles: [],
        favorites: [],
        history: [],
        settings: {
          theme: "dark",
          ayanamsa: "Lahiri (Chitra Paksha)",
          chartStyle: "north",
          language: "English",
          autoUpdate: true
        }
      };
      onAuthSuccess(userProfile);
      setSuccess("Successfully signed in with Google!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "login") {
        const user = await AuthManager.signInWithEmail(email, password);
        const userProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || "Email Astrologer",
          email: user.email || "",
          photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
          createdDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          savedProfiles: [],
          favorites: [],
          history: [],
          settings: {
            theme: "dark",
            ayanamsa: "Lahiri (Chitra Paksha)",
            chartStyle: "north",
            language: "English",
            autoUpdate: true
          }
        };
        onAuthSuccess(userProfile);
        setSuccess("Successfully logged in!");
      } else if (mode === "signup") {
        if (!name.trim()) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        const user = await AuthManager.signUpWithEmail(email, password, name);
        const userProfile: UserProfile = {
          uid: user.uid,
          name: name,
          email: user.email || "",
          photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
          createdDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          savedProfiles: [],
          favorites: [],
          history: [],
          settings: {
            theme: "dark",
            ayanamsa: "Lahiri (Chitra Paksha)",
            chartStyle: "north",
            language: "English",
            autoUpdate: true
          }
        };
        onAuthSuccess(userProfile);
        setSuccess("Account successfully created!");
      } else if (mode === "forgot") {
        await AuthManager.sendPasswordReset(email);
        setSuccess("Password reset email sent!");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AuthManager.logout();
      onAuthSuccess(null);
      setSuccess("Successfully logged out!");
      setEmail("");
      setPassword("");
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
            src={activeUser.photoURL} 
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
            <span className="inline-block mt-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Synced with Google Firebase
            </span>
          </div>
        </div>

        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3" id="m3-session-stats">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Account Metadata</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">UID</span>
              <span className="font-mono text-slate-300 break-all">{activeUser.uid}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Last Active Login</span>
              <span className="text-slate-300">{new Date(activeUser.lastLogin).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Sync Status</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Online Cloud Backup
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Registration Date</span>
              <span className="text-slate-300">{new Date(activeUser.createdDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

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

  // Render Material 3 Auth Panel
  return (
    <div className="bg-slate-950/60 border border-indigo-500/10 rounded-2xl p-6 max-w-md mx-auto space-y-6 text-left shadow-2xl" id="m3-auth-screen-container">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <Shield className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-lg font-sans font-medium text-amber-100">
          {mode === "login" && "Login to JHoraAI"}
          {mode === "signup" && "Create Astro Account"}
          {mode === "forgot" && "Recover Account"}
        </h3>
        <p className="text-xs text-slate-400">
          Save birth profiles, map histories, and sync calculations securely in Google Cloud.
        </p>
      </div>

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

      {/* Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aryabhata"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl text-xs text-slate-200 outline-none transition-all"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@gmail.com"
              required
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl text-xs text-slate-200 outline-none transition-all"
            />
          </div>
        </div>

        {mode !== "forgot" && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Password</label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-[10px] font-mono text-amber-500 hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-amber-500/50 rounded-xl text-xs text-slate-200 outline-none transition-all"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-sans font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {mode === "login" && "Login Profile"}
              {mode === "signup" && "Register Account"}
              {mode === "forgot" && "Send Reset Link"}
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      {mode !== "forgot" && (
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[10px] uppercase font-mono font-bold text-slate-500">Or Continue With</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>
      )}

      {/* Social Google Login Button (M3 spec) */}
      {mode !== "forgot" && (
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="w-full py-2 bg-white hover:bg-neutral-100 text-neutral-800 font-sans font-medium rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-neutral-300 shadow-md"
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
              Sign In with Google
            </>
          )}
        </button>
      )}

      {/* Switch Mode Footer */}
      <div className="text-center pt-2">
        {mode === "login" && (
          <p className="text-xs text-slate-400">
            Don't have an account?{" "}
            <button onClick={() => setMode("signup")} className="text-amber-500 font-semibold hover:underline cursor-pointer">
              Register here
            </button>
          </p>
        )}
        {mode === "signup" && (
          <p className="text-xs text-slate-400">
            Already have an account?{" "}
            <button onClick={() => setMode("login")} className="text-amber-500 font-semibold hover:underline cursor-pointer">
              Login here
            </button>
          </p>
        )}
        {mode === "forgot" && (
          <button onClick={() => setMode("login")} className="text-xs text-amber-500 font-semibold hover:underline cursor-pointer">
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}
