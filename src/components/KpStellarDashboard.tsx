/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AlertTriangle } from "lucide-react";

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
  const containerStyle = isDarkTheme
    ? "bg-slate-900/60 border-indigo-500/20 text-slate-100"
    : "bg-white border-neutral-200 text-neutral-800 shadow-sm";

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
