"use client";

import { useState } from "react";
import { PartySession } from "@/lib/types";
import { PartyId } from "./PartyId";
import {
  Shield,
  Key,
  CheckCircle,
  RefreshCw,
  Copy,
  Check,
  LogOut,
  Fingerprint,
  Info,
  Laptop,
} from "lucide-react";

export function SettingsView({
  session,
  onTogglePreApproval,
  onSignOut,
}: {
  session: PartySession;
  onTogglePreApproval: () => void;
  onSignOut?: () => void;
}) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isUpdatingPreapproval, setIsUpdatingPreapproval] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [custodyMode, setCustodyMode] = useState<"managed" | "self">(
    session.custodyMode === "managed" ? "managed" : "self"
  );

  const handlePreapprovalAction = () => {
    setIsUpdatingPreapproval(true);
    setTimeout(() => {
      onTogglePreApproval();
      setIsUpdatingPreapproval(false);
    }, 1000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(session.partyId);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching screenshot */}
      <div className="border-b border-withheld pb-5">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-paper">Platform Settings</h1>
          <span className="figure text-[10px] text-brand bg-brand/10 border border-brand/25 px-2 py-0.5 uppercase tracking-wider">
            Node Configuration
          </span>
        </div>
        <p className="text-xs text-paper/65 mt-1">
          Manage your institutional identity, custodial preferences, and session security on Canton.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Party Identity & Custody & Pre-approvals (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Box 1: Party Identity matching screenshot */}
          <div className="border border-withheld bg-[#0e1017] p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-withheld pb-3">
              <Fingerprint className="w-4 h-4 text-brand" />
              <h3 className="font-display text-base font-bold text-paper">PARTY IDENTITY</h3>
            </div>
            <p className="text-xs text-paper/70">
              Your cryptographic identifier on the settlement network.
            </p>

            <div className="bg-[#141722] p-3.5 border border-withheld flex items-center justify-between font-mono text-xs text-paper">
              <span className="truncate mr-2">{session.partyId}</span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="text-paper/50 hover:text-paper flex items-center gap-1 text-[11px] figure flex-shrink-0"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-settled" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Box 2: Custody Mode matching screenshot */}
          <div className="border border-withheld bg-[#0e1017] p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-withheld pb-3">
              <Shield className="w-4 h-4 text-settled" />
              <h3 className="font-display text-base font-bold text-paper">CUSTODY MODE</h3>
            </div>
            <p className="text-xs text-paper/70">
              Configure how private keys for your allocations are secured.
            </p>

            <div className="border border-amber-500/40 bg-[#141722] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="figure text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5">
                  {custodyMode === "managed" ? "MANAGED" : "SELF-CUSTODY"}
                </span>
                <span className="text-[11px] figure text-paper/50">Canton Network LocalNet</span>
              </div>
              <p className="text-xs text-paper/80 leading-relaxed">
                {custodyMode === "managed"
                  ? "Assets are held in institution-grade cold storage by our regulated custody partners."
                  : "Private keys are signed directly via your connected WebHID hardware signer or institutional MPC vault."}
              </p>
              <button
                type="button"
                onClick={() => setCustodyMode(custodyMode === "managed" ? "self" : "managed")}
                className="bg-[#D4BBFF] hover:bg-[#c4a5f8] text-[#151226] text-xs font-bold px-3.5 py-1.5 transition-colors"
              >
                {custodyMode === "managed" ? "Request Self-Custody" : "Switch to Managed Custody"}
              </button>
            </div>
          </div>

          {/* Box 3: Pre-Approval Status matching screenshot */}
          <div className="border border-withheld bg-[#0e1017] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-withheld pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand" />
                <h3 className="font-display text-base font-bold text-paper">PRE-APPROVAL STATUS</h3>
              </div>
              <span className={`figure text-[10px] uppercase font-bold px-2 py-0.5 ${
                session.preApprovalActive ? "text-settled bg-settled/10 border border-settled/30" : "text-pending bg-pending/10 border border-pending/30"
              }`}>
                {session.preApprovalActive ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="text-xs text-paper/70">
              Manage automated settlement authorizations for trusted counterparties.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141722] p-3.5 border border-withheld">
              <span className="text-xs font-medium text-paper">
                {session.preApprovalActive
                  ? "Transfer pre-approval contract active on ledger"
                  : "No active pre-approvals"}
              </span>

              <button
                type="button"
                onClick={handlePreapprovalAction}
                disabled={isUpdatingPreapproval}
                className="bg-brand hover:opacity-90 disabled:opacity-50 text-paper text-xs font-semibold px-4 py-2 transition-opacity flex items-center gap-2 self-start sm:self-auto"
              >
                {isUpdatingPreapproval ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Ledger…</span>
                  </>
                ) : session.preApprovalActive ? (
                  "Revoke Pre-Approval"
                ) : (
                  "Create Pre-Approval"
                )}
              </button>
            </div>

            <p className="text-[11px] text-paper/50 figure flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-brand flex-shrink-0" />
              <span>Note: Acceptance takes a moment because validator automation handles it securely on-chain.</span>
            </p>
          </div>
        </div>

        {/* Right Column: Session Security & API Access (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Box 4: Session Security matching screenshot */}
          <div className="border border-withheld bg-[#0e1017] p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-withheld pb-3">
              <Laptop className="w-4 h-4 text-paper/70" />
              <h3 className="font-display text-base font-bold text-paper">SESSION SECURITY</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-[#141722] p-3 border border-withheld/60">
                <span className="text-paper/50">Current Client</span>
                <span className="font-medium text-paper">Mac OS • Chrome (Secure Enclave)</span>
              </div>
              <div className="flex justify-between items-center bg-[#141722] p-3 border border-withheld/60">
                <span className="text-paper/50">Network Gateway IP</span>
                <span className="font-mono text-paper/70">192.168.1.1 (Redacted)</span>
              </div>
              <div className="flex justify-between items-center bg-[#141722] p-3 border border-withheld/60">
                <span className="text-paper/50">Last Synchronized</span>
                <span className="figure text-settled font-semibold">Just now (4s ago)</span>
              </div>
            </div>

            {onSignOut && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full border border-pending/40 bg-pending/10 hover:bg-pending/20 text-pending py-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Canton Session</span>
                </button>
              </div>
            )}
          </div>

          {/* API Access Card */}
          <div className="border border-withheld bg-[#0e1017] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-withheld pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-brand" />
                <h3 className="font-display text-base font-bold text-paper">API KEYS</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-xs text-brand hover:underline figure"
              >
                {showApiKey ? "Hide Key" : "Reveal Key"}
              </button>
            </div>

            <div className="bg-[#141722] p-3 border border-withheld font-mono text-xs text-paper/90 truncate">
              {showApiKey ? "pk_live_canton_9f82371982739182371982371" : "••••••••••••••••••••••••••••••••••••••••"}
            </div>
            <p className="text-[11px] text-paper/50">
              For institutional algorithmic execution and OMS integration via FIX / Canton JSON-RPC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
