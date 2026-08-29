"use client";
import { useState } from "react";
import { EligibilityProfile } from "@/lib/types";
import { StatePill } from "./StatePill";
import { PartyId } from "./PartyId";
import { ShieldCheck, CheckCircle2, FileCheck, ArrowRight, Clock } from "lucide-react";

export function EligibilityView({
  eligibility,
  onUpgradeTier,
}: {
  eligibility: EligibilityProfile;
  onUpgradeTier?: () => void;
}) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [attestationRequested, setAttestationRequested] = useState(false);

  const handleRequestUpgrade = () => {
    setAttestationRequested(true);
    setShowUpgradeModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-withheld pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-paper">Daml Eligibility Verification</h2>
          <p className="text-xs text-paper/60 mt-0.5">
            On-ledger investor eligibility contract verified before every atomic swap
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatePill state="eligible" />
          <span className="figure text-xs text-paper/70 bg-slate px-3 py-1 border border-withheld">
            Tier: {eligibility.tier}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Eligibility Contract Details (7 cols) */}
        <div className="md:col-span-7 border border-withheld bg-slate p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-withheld pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-settled" />
              <h3 className="font-display text-base font-bold text-paper">
                Active Eligibility Contract
              </h3>
            </div>
            <span className="figure text-xs text-settled font-semibold">Active & Enforced</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-ink/40 p-4 border border-withheld/50">
            <div>
              <span className="text-paper/50 text-[11px] block">Jurisdiction</span>
              <span className="figure font-semibold text-paper text-sm">{eligibility.jurisdiction}</span>
            </div>
            <div>
              <span className="text-paper/50 text-[11px] block">Investor Type</span>
              <span className="figure font-semibold text-paper text-sm">{eligibility.tier}</span>
            </div>
            <div>
              <span className="text-paper/50 text-[11px] block">Accredited Status</span>
              <span className="figure font-semibold text-settled text-sm">
                {eligibility.accredited ? "Yes (Verified)" : "Pending"}
              </span>
            </div>
            <div>
              <span className="text-paper/50 text-[11px] block">Next Review Date</span>
              <span className="figure font-semibold text-paper text-sm">{eligibility.expiryDate}</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="figure text-[11px] uppercase tracking-wider text-paper/50 block">
              Daml Contract ID (CID)
            </span>
            <div className="bg-ink/70 p-3 border border-withheld flex items-center justify-between text-xs">
              <PartyId value={eligibility.contractCid} />
              <span className="figure text-[11px] text-settled">Immutable</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="figure text-[11px] uppercase tracking-wider text-paper/50 block">
              Issuer Node Authority
            </span>
            <div className="bg-ink/70 p-3 border border-withheld flex items-center justify-between text-xs">
              <PartyId value={eligibility.issuerParty} />
              <span className="figure text-[11px] text-paper/50">Authorized KYC Signatory</span>
            </div>
          </div>

          <p className="text-xs text-paper/60 leading-relaxed border-t border-withheld pt-4">
            This eligibility contract is checked as a Daml choice precondition. If expired or non-conforming, the Canton validator refuses atomic execution automatically.
          </p>
        </div>

        {/* Right: Attestation & Lifecycle (5 cols) */}
        <div className="md:col-span-5 border border-withheld bg-slate p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 border-b border-withheld pb-4">
              <FileCheck className="w-5 h-5 text-brand" />
              <h3 className="font-display text-base font-bold text-paper">
                Attestation Lifecycle
              </h3>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-settled flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-paper block">1. Submitted</span>
                  <p className="text-paper/50 text-[11px]">Identity & institutional formation docs received</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-settled flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-paper block">2. Under Review</span>
                  <p className="text-paper/50 text-[11px]">Compliance officer & node verification completed</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-settled flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-paper block">3. Contract Issued</span>
                  <p className="text-paper/50 text-[11px]">Signed into Canton synchroniser topology</p>
                </div>
              </div>

              {attestationRequested && (
                <div className="mt-4 p-3 bg-pending/10 border border-pending/30 text-pending text-xs">
                  <Clock className="w-3.5 h-3.5 inline mr-1" /> Tier 3 Institutional upgrade submitted. Verification in progress.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-withheld">
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="w-full border border-withheld bg-ink py-2.5 px-4 text-xs font-semibold text-paper hover:border-brand transition-colors flex items-center justify-center gap-2"
            >
              Request Tier Upgrade / Attestation <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tier Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4">
          <div className="border border-withheld bg-slate max-w-[480px] w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-display text-base font-bold text-paper">
              Request Tier 3 Institutional Upgrade
            </h3>
            <p className="text-xs text-paper/70 leading-relaxed">
              Tier 3 Institutional access permits subscription to restricted private debt tranches, qualified institutional buyer (QIB) syndications, and high-value fund units.
            </p>
            <div className="space-y-3 text-xs bg-ink/40 p-3 border border-withheld">
              <label className="flex items-center gap-2 text-paper/80">
                <input type="checkbox" defaultChecked className="accent-brand" />
                Institutional AUM exceeds $25,000,000 USD equivalent
              </label>
              <label className="flex items-center gap-2 text-paper/80">
                <input type="checkbox" defaultChecked className="accent-brand" />
                Qualified Institutional Buyer (QIB) designation
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 border border-withheld bg-slate py-2 text-xs text-paper"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestUpgrade}
                className="flex-1 bg-brand py-2 text-xs font-semibold text-paper hover:opacity-90"
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
