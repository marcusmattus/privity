"use client";
import { useState } from "react";
import { PartySession } from "@/lib/types";
import { PartyId } from "./PartyId";
import { Shield, Key, CheckCircle, RefreshCw } from "lucide-react";

export function SettingsView({
  session,
  onTogglePreApproval,
}: {
  session: PartySession;
  onTogglePreApproval: () => void;
}) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isUpdatingPreapproval, setIsUpdatingPreapproval] = useState(false);

  const handlePreapprovalAction = () => {
    setIsUpdatingPreapproval(true);
    setTimeout(() => {
      onTogglePreApproval();
      setIsUpdatingPreapproval(false);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-withheld pb-4">
        <h2 className="font-display text-xl font-bold text-paper">Party Settings & Node Security</h2>
        <p className="text-xs text-paper/60 mt-0.5">
          Manage your participant node credentials, custody configuration, and automated pre-approvals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile & Party */}
        <div className="border border-withheld bg-slate p-6 space-y-6">
          <div className="border-b border-withheld pb-4">
            <h3 className="font-display text-base font-bold text-paper">Party Profile</h3>
            <p className="text-xs text-paper/60">Managed Canton identity details</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
              <span className="text-paper/50">Entity Name</span>
              <span className="figure font-semibold text-paper text-sm">{session.partyName}</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
              <span className="text-paper/50">Account Email</span>
              <span className="figure text-paper">{session.email}</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
              <span className="text-paper/50">Seat Authority</span>
              <span className="figure font-semibold text-settled">{session.role}</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
              <span className="text-paper/50">Custody Model</span>
              <span className="figure font-semibold text-paper capitalize">
                {session.custodyMode} Party (LocalNet)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="figure text-[11px] uppercase tracking-wider text-paper/50 block">
              Canton Party ID
            </span>
            <div className="bg-ink/70 p-3 border border-withheld flex items-center justify-between text-xs">
              <PartyId value={session.partyId} />
              <span className="figure text-[11px] text-paper/50">Managed</span>
            </div>
          </div>
        </div>

        {/* Pre-approval & Security */}
        <div className="space-y-6">
          {/* Pre-approval Card */}
          <div className="border border-withheld bg-slate p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-withheld pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-paper">Transfer Pre-Approval</h3>
                <p className="text-xs text-paper/60 mt-0.5">Automated inbound direct settlement</p>
              </div>
              <span className={`figure text-xs font-semibold ${session.preApprovalActive ? "text-settled" : "text-pending"}`}>
                {session.preApprovalActive ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="text-xs text-paper/70 leading-relaxed">
              When active, inbound allocations swap atomically via <code>transferKind: direct</code> without requiring manual step-by-step confirmation. Validator automation handles acceptance.
            </p>

            <button
              type="button"
              onClick={handlePreapprovalAction}
              disabled={isUpdatingPreapproval}
              className="border border-withheld bg-ink py-2 px-4 text-xs font-semibold text-paper hover:border-brand transition-colors flex items-center gap-2"
            >
              {isUpdatingPreapproval ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating contract on ledger…
                </>
              ) : session.preApprovalActive ? (
                "Revoke Transfer Pre-Approval"
              ) : (
                "Create Transfer Pre-Approval"
              )}
            </button>
          </div>

          {/* Security & API Keys */}
          <div className="border border-withheld bg-slate p-6 space-y-4">
            <div className="border-b border-withheld pb-4">
              <h3 className="font-display text-base font-bold text-paper">Security & API Access</h3>
              <p className="text-xs text-paper/60">Node authentication and multi-factor security</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-withheld/40 pb-2">
                <span className="text-paper/50">MFA Security</span>
                <span className="figure font-semibold text-settled flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Enabled (Keycloak OIDC)
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-paper/50 text-[11px]">
                  <span>API Access Key</span>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-brand hover:underline"
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="bg-ink/70 p-2 border border-withheld font-mono text-xs text-paper">
                  {showApiKey ? "pk_live_canton_9f82371982739182371982371" : "••••••••••••••••••••••••••••••••"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
