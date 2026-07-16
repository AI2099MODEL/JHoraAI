/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, Loader2, Database } from "lucide-react";
import { apiFetch as fetch } from "../lib/api";

interface KpStellarDashboardProps {
  astrologyData: any;
  activeSubmenuId: string;
  onSubmenuSelect: (id: string) => void;
  isDarkTheme: boolean;
}

export default function KpStellarDashboard({
  astrologyData,
  activeSubmenuId,
  onSubmenuSelect,
  isDarkTheme
}: KpStellarDashboardProps) {
  const [healthStatus, setHealthStatus] = useState<"checking" | "placeholder" | "available" | "unavailable">("checking");
  const [providerName, setProviderName] = useState<string>("");

  useEffect(() => {
    let active = true;
    async function checkHealth() {
      try {
        const res = await fetch("/api/kp/health");
        if (!res.ok) {
          throw new Error("Failed to reach health check endpoint");
        }
        const data = await res.json();
        if (active) {
          if (data.status === "available") {
            setHealthStatus("available");
            setProviderName(data.provider || "vedicastro");
          } else {
            setHealthStatus("unavailable");
          }
        }
      } catch (err) {
        if (active) {
          // If endpoint is not found, or returns error, keep the strict placeholder
          setHealthStatus("placeholder");
        }
      }
    }
    checkHealth();
    return () => {
      active = false;
    };
  }, []);

  const containerStyle = isDarkTheme
    ? "bg-slate-900/60 border-indigo-500/20 text-slate-100"
    : "bg-white border-neutral-200 text-neutral-800 shadow-sm";

  if (healthStatus === "checking") {
    return (
      <div className={`p-8 rounded-2xl border text-center max-w-xl mx-auto space-y-4 ${containerStyle}`} id="kp-stellar-container">
        <Loader2 className="w-12 h-12 text-indigo-500 mx-auto animate-spin" id="kp-stellar-loader" />
        <h2 className="text-lg font-sans font-medium text-indigo-500" id="kp-stellar-heading">
          Checking KP Provider Health...
        </h2>
        <p className="text-sm text-slate-400" id="kp-stellar-checking-msg">
          Connecting to secure KP calculation endpoint.
        </p>
      </div>
    );
  }

  if (healthStatus === "unavailable") {
    return (
      <div className={`p-8 rounded-2xl border text-center max-w-xl mx-auto space-y-4 ${containerStyle}`} id="kp-stellar-container">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto animate-pulse" id="kp-stellar-alert-icon" />
        <h2 className="text-lg font-sans font-medium text-rose-500" id="kp-stellar-heading">
          KP provider unavailable
        </h2>
        <p className="text-sm text-slate-400 font-sans" id="kp-stellar-error-msg">
          The external KP astrology calculation service is currently offline or unreachable.
        </p>
        <div className="text-xs text-rose-400 font-mono text-left bg-rose-950/20 p-4 rounded-xl border border-rose-900/30 space-y-1" id="kp-stellar-audit-panel">
          <p className="font-semibold text-rose-300 mb-2">System Diagnostics:</p>
          <p>• KP Provider Name: {process.env.KP_PROVIDER || "vedicastro"}</p>
          <p>• KP Endpoints: Offline / Gateway Timeout</p>
          <p>• Synthetic Math Calculations: Suspended (Integrity Policy)</p>
        </div>
      </div>
    );
  }

  if (healthStatus === "available") {
    return (
      <div className={`p-8 rounded-2xl border text-center max-w-xl mx-auto space-y-4 ${containerStyle}`} id="kp-stellar-container">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" id="kp-stellar-check-icon" />
        <h2 className="text-lg font-sans font-medium text-emerald-500 animate-pulse" id="kp-stellar-heading">
          KP Provider Verified & Online
        </h2>
        <p className="text-sm text-slate-400" id="kp-stellar-msg">
          Secure connection established with provider <span className="font-bold text-emerald-400">[{providerName}]</span>.
        </p>
        <div className="text-xs text-emerald-400 font-mono text-left bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/30 space-y-2" id="kp-stellar-audit-panel">
          <p className="font-semibold text-emerald-300">Phase 13 Integration Verification:</p>
          <p>• Active Provider: {providerName}</p>
          <p>• Handshake: Success (HTTP 200)</p>
          <p>• Status: Awaiting final user approval to enable live UI components.</p>
        </div>
        <button
          className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-emerald-900/20 inline-flex items-center gap-2 cursor-pointer"
          onClick={() => alert("Awaiting authorization to toggle full KP user-interface components.")}
        >
          <Database className="w-4 h-4" />
          Awaiting Approval
        </button>
      </div>
    );
  }

  // Fallback to original strict placeholder if no environment variables are present or configured
  return (
    <div className={`p-8 rounded-2xl border text-center max-w-xl mx-auto space-y-4 ${containerStyle}`} id="kp-stellar-container">
      <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto animate-pulse" id="kp-stellar-alert-icon" />
      <h2 className="text-lg font-sans font-medium text-amber-500" id="kp-stellar-heading">
        KP Stellar Module Awaiting Configuration
      </h2>
      <p className="text-sm text-slate-400" id="kp-stellar-awaiting-msg">
        Awaiting verified KP data provider.
      </p>
      <div className="text-xs text-slate-500 font-mono text-left bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-1" id="kp-stellar-audit-panel">
        <p className="font-semibold text-slate-400 mb-2">Audit Status (Phase 12 Verification):</p>
        <p>• External Source (Free Official KP API): Removed (Unverified Endpoint)</p>
        <p>• Local Mathematical Engine: Disabled (Phase 11 Restriction)</p>
        <p>• Synthetic / Placeholder Data: Fully Disabled (Phase 12 Integrity Policy)</p>
      </div>
    </div>
  );
}
