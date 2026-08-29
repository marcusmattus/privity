"use client";

import { useState } from "react";
import { EligibilityProfile } from "@/lib/types";
import { StatePill } from "./StatePill";
import { PartyId } from "./PartyId";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  Shield,
  Lock,
} from "lucide-react";

export function EligibilityView({
  eligibility,
  onUpgradeTier,
}: {
  eligibility: EligibilityProfile;
  onUpgradeTier?: () => void;
}) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [attestationRequested, setAttestationRequested] = useState(false);
  const [copiedCid, setCopiedCid] = useState(false);

  const handleRequestUpgrade = () => {
    setAttestationRequested(true);
    setShowUpgradeModal(false);
    onUpgradeTier?.();
  };

  const handleCopyCid = () => {
    navigator.clipboard.writeText(eligibility.contractCid);
    setCopiedCid(true);
    setTimeout(() => setCopiedCid(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-withheld pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-paper">Investor Eligibility</h1>
            <span className="figure text-[10px] text-settled bg-settled/10 border border-settled/25 px-2 py-0.5 uppercase tracking-wider">
              Enforced on Canton
            </span>
          </div>
          <p className="text-xs text-paper/65 mt-1">
            On-ledger investor eligibility contracts verified before every atomic swap execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatePill state="eligible" />
          <span className="figure text-xs text-paper/80 bg-[#141722] px-3 py-1 border border-withheld">
            Tier: {eligibility.tier}
          </span>
        </div>
      </div>

      {/* Top Banner matching screenshot */}
      <div className="border border-brand/40 bg-brand/10 p-4 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-brand flex-shrink-0" />
        <span className="text-xs font-mono font-bold tracking-wide text-paper uppercase">
          ELIGIBILITY IS NOW ENFORCED BY THE LEDGER ON EVERY SUBSCRIPTION.
        </span>
      </div>

      {/* Main Grid matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Profile (7 cols) */}
        <div className="lg:col-span-7 border border-withheld bg-[#0e1017] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-withheld pb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-settled" />
              <h3 className="font-display text-base font-bold text-paper">
                Active Institutional Profile
              </h3>
            </div>
            <span className="figure text-[10px] uppercase font-semibold text-settled bg-settled/10 border border-settled/30 px-2 py-0.5">
              VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-[#141722] p-4 border border-withheld/60">
            <div>
              <span className="text-paper/50 text-[10px] figure uppercase tracking-wider block">
                CURRENT TIER
              </span>
              <span className="figure font-bold text-paper text-sm mt-0.5 block">{eligibility.tier}</span>
            </div>
            <div>
              <span className="text-paper/50 text-[10px] figure uppercase tracking-wider block">
                JURISDICTION
              </span>
              <span className="figure font-bold text-paper text-sm mt-0.5 block">
                {eligibility.jurisdiction} • Reg D 506(c)
              </span>
            </div>
            <div>
              <span className="text-paper/50 text-[10px] figure uppercase tracking-wider block">
                ACCREDITED STATUS
              </span>
              <span className="figure font-bold text-settled text-sm mt-0.5 block">
                Qualified Purchaser (QIB)
              </span>
            </div>
            <div>
              <span className="text-paper/50 text-[10px] figure uppercase tracking-wider block">
                EXPIRY
              </span>
              <span className="figure font-mono font-bold text-paper text-sm mt-0.5 block">
                {eligibility.expiryDate}
              </span>
            </div>
          </div>

          {/* Contract ID box with copy button */}
          <div className="space-y-1.5">
            <span className="figure text-[10px] uppercase tracking-wider text-paper/50 block">
              ELIGIBILITY CONTRACT ID (CID)
            </span>
            <div className="bg-[#141722] p-3 border border-withheld flex items-center justify-between text-xs font-mono">
              <span className="text-paper/85 truncate mr-2">{eligibility.contractCid}</span>
              <button
                type="button"
                onClick={handleCopyCid}
                className="text-paper/50 hover:text-paper flex items-center gap-1 text-[11px] figure flex-shrink-0"
              >
                {copiedCid ? <Check className="w-3.5 h-3.5 text-settled" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCid ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="figure text-[10px] uppercase tracking-wider text-paper/50 block">
              AUTHORIZED KYC ISSUER NODE
            </span>
            <div className="bg-[#141722] p-3 border border-withheld flex items-center justify-between text-xs font-mono">
              <PartyId value={eligibility.issuerParty} />
              <span className="figure text-[10px] text-paper/50">Canton Validator</span>
            </div>
          </div>
        </div>

        {/* Right: Attestation Status (5 cols) */}
        <div className="lg:col-span-5 border border-withheld bg-[#0e1017] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-withheld pb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-brand" />
                <h3 className="font-display text-base font-bold text-paper">
                  Attestation Status
                </h3>
              </div>
              <span className="figure text-[10px] text-brand uppercase font-semibold">
                Oracle Synced
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 bg-[#141722] p-3 border border-withheld/60">
                <CheckCircle2 className="w-4 h-4 text-settled flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-paper block">1. Submitted</span>
                  <p className="text-paper/50 text-[11px] font-mono mt-0.5">2024-11-01 09:41 UTC • ID Docs & Formation</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#141722] p-3 border border-withheld/60">
                <CheckCircle2 className="w-4 h-4 text-settled flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-paper block">2. Under Review</span>
                  <p className="text-paper/50 text-[11px] font-mono mt-0.5">KYC/AML Oracle Sync & Compliance Check</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#141722] p-3 border border-withheld/60">
                <CheckCircle2 className="w-4 h-4 text-settled flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-paper block">3. Issued</span>
                  <p className="text-paper/50 text-[11px] font-mono mt-0.5">Ledger State Updated • Daml Contract Signed</p>
                </div>
              </div>

              {attestationRequested && (
                <div className="p-3 bg-pending/10 border border-pending/30 text-pending text-xs">
                  <Clock className="w-3.5 h-3.5 inline mr-1" /> Tier 3 Institutional upgrade submitted. Oracle verifying.
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="w-full bg-[#D4BBFF] hover:bg-[#c4a5f8] text-[#151226] font-bold text-xs py-2.5 px-4 transition-colors flex items-center justify-center gap-2 shadow"
          >
            <span>Request Tier Upgrade / Attestation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="border border-withheld bg-[#0e1017] max-w-[500px] w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-paper">
              Request Tier 3 Institutional Attestation
            </h3>
            <p className="text-xs text-paper/70 leading-relaxed">
              Tier 3 Institutional access permits subscription to restricted private debt tranches, qualified institutional buyer (QIB) syndications, and high-value fund units.
            </p>
            <div className="space-y-2.5 text-xs bg-[#141722] p-3.5 border border-withheld">
              <label className="flex items-center gap-2 text-paper/85 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-brand" />
                Institutional AUM exceeds $25,000,000 USD equivalent
              </label>
              <label className="flex items-center gap-2 text-paper/85 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-brand" />
                Qualified Institutional Buyer (QIB) legal representation
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 border border-withheld bg-[#141722] py-2 text-xs text-paper"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestUpgrade}
                className="flex-1 bg-brand py-2 text-xs font-bold text-paper hover:opacity-90 shadow"
              >
                Submit Attestation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
