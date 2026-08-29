"use client";
import { useState } from "react";
import { Offering } from "@/lib/types";
import { StatePill } from "./StatePill";
import { Figure } from "./Figure";
import { PartyId } from "./PartyId";
import { AlertTriangle, CheckCircle, Clock, ShieldCheck, X, ArrowRight } from "lucide-react";

export function OfferingDetailModal({
  offering,
  userUsdcBalance,
  onClose,
  onSubscribeSuccess,
}: {
  offering: Offering;
  userUsdcBalance: number;
  onClose: () => void;
  onSubscribeSuccess: (offering: Offering, units: number, consideration: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "terms" | "documents">("overview");
  const [unitsInput, setUnitsInput] = useState<string>(
    offering.minAllocationUsdc.toString()
  );
  const [subscribeState, setSubscribeState] = useState<
    "idle" | "quoted" | "confirming" | "submitting" | "settled" | "failed"
  >("quoted");
  const [riskConfirmed, setRiskConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [settledTxHash, setSettledTxHash] = useState<string | null>(null);

  const unitsNum = parseFloat(unitsInput) || 0;
  const consideration = unitsNum * offering.pricePerUnit;
  const isEligible = true; // Tier 2 Professional is eligible for these
  const isValidAmount = unitsNum >= offering.minAllocationUsdc && unitsNum <= offering.unitsRemaining;
  const hasSufficientUsdc = userUsdcBalance >= consideration;

  const handleReview = () => {
    if (!isValidAmount || !hasSufficientUsdc) return;
    setSubscribeState("confirming");
  };

  const handleConfirmSubscribe = async () => {
    if (!riskConfirmed) return;
    setSubscribeState("submitting");
    setErrorMessage(null);

    // Simulate real ledger atomic DvP execution against Canton Ledger API
    try {
      await new Promise((resolve) => setTimeout(resolve, 2200));

      const mockCid = `00${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
      setSettledTxHash(mockCid);
      setSubscribeState("settled");
      onSubscribeSuccess(offering, unitsNum, consideration);
    } catch {
      setErrorMessage("DAML_PRECONDITION_FAILED: Validator rejected atomic swap.");
      setSubscribeState("failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="border border-withheld bg-slate max-w-[960px] w-full my-8 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-withheld px-6 py-4 bg-ink/50">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-bold text-paper">
              {offering.title}
            </h2>
            <StatePill state={offering.transferKind === "direct" ? "direct" : "offer"} />
            <span className="text-xs text-paper/60 border-l border-withheld pl-3">
              {offering.subtitle}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-paper/60 hover:text-paper p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left details column (7 cols) */}
          <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-withheld space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-withheld text-xs figure">
              {(["overview", "terms", "documents"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 capitalize transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-brand text-paper font-semibold"
                      : "text-paper/50 hover:text-paper"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-sm font-semibold text-paper">
                    Allocation Overview
                  </h3>
                  <p className="mt-2 text-xs text-paper/70 leading-relaxed">
                    {offering.description}
                  </p>
                </div>

                {/* Key Term Matrix */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-ink/40 p-4 border border-withheld/50">
                  <div>
                    <span className="text-paper/50 text-[11px] block">Tranche Size</span>
                    <Figure value={offering.totalUnits} unit="USDC" className="font-semibold text-paper" />
                  </div>
                  <div>
                    <span className="text-paper/50 text-[11px] block">Min. Allocation</span>
                    <Figure value={offering.minAllocationUsdc} unit="USDC" className="font-semibold text-paper" />
                  </div>
                  <div>
                    <span className="text-paper/50 text-[11px] block">Price per Unit</span>
                    <Figure value={offering.pricePerUnit} unit="USDC / unit" className="font-semibold text-paper" />
                  </div>
                  <div>
                    <span className="text-paper/50 text-[11px] block">Instrument</span>
                    <span className="figure font-semibold text-paper capitalize">{offering.instrument.kind}</span>
                  </div>
                  <div>
                    <span className="text-paper/50 text-[11px] block">Jurisdiction</span>
                    <span className="figure font-semibold text-paper">{offering.instrument.jurisdiction}</span>
                  </div>
                  <div>
                    <span className="text-paper/50 text-[11px] block">Closing Date</span>
                    <span className="figure font-semibold text-paper">{offering.closingDate}</span>
                  </div>
                  <div>
                    <span className="text-paper/50 text-[11px] block">Settlement Model</span>
                    <span className="figure font-semibold text-settled">{offering.settlementType}</span>
                  </div>
                  <div>
                    <span className="text-paper/50 text-[11px] block">Pre-Approval</span>
                    <span className="figure font-semibold text-paper">
                      {offering.preApprovalRequired ? "Required" : "Pre-approved (Direct)"}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-sm font-semibold text-paper">
                    Issuer Party
                  </h3>
                  <div className="mt-2 bg-ink/70 p-3 border border-withheld flex items-center justify-between text-xs">
                    <PartyId value={offering.instrument.issuerParty} />
                    <span className="figure text-[11px] text-paper/50">Canton Validator Node</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-4 text-xs text-paper/70 leading-relaxed">
                <h3 className="font-display text-sm font-semibold text-paper">Settlement Mechanics</h3>
                <p>
                  1. <strong>Atomic DvP:</strong> Both the delivery of tokenised allocation units and the payment in USDC are executed in a single atomic transaction on the Canton Network. If either leg fails, the entire transaction aborts with zero balance loss.
                </p>
                <p>
                  2. <strong>Confidentiality:</strong> Only you and the issuer node witness the contract creation and holding transfer. No other participant receives the transaction stream.
                </p>
                <p>
                  3. <strong>Precondition Check:</strong> Your active Daml Eligibility contract is cryptographically validated by the ledger engine prior to swap execution.
                </p>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between border border-withheld p-3 bg-ink/40">
                  <div>
                    <span className="font-medium text-paper block">Term Sheet & Tranche Allocation.pdf</span>
                    <span className="text-[11px] text-paper/50">1.4 MB · SHA-256 Verified</span>
                  </div>
                  <span className="figure text-brand hover:underline cursor-pointer text-xs">Download</span>
                </div>
                <div className="flex items-center justify-between border border-withheld p-3 bg-ink/40">
                  <div>
                    <span className="font-medium text-paper block">Daml Smart Contract Specification (v0.1.0).pdf</span>
                    <span className="text-[11px] text-paper/50">840 KB · CIP-103 Schema</span>
                  </div>
                  <span className="figure text-brand hover:underline cursor-pointer text-xs">Download</span>
                </div>
              </div>
            )}
          </div>

          {/* Right subscribe interactive panel (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-ink/30 flex flex-col justify-between">
            {subscribeState === "quoted" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-sm font-bold text-paper">
                    Subscribe to Offering
                  </h3>
                  <p className="text-xs text-paper/60 mt-0.5">
                    Atomic Delivery-versus-Payment (DvP)
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider figure text-paper/60 mb-1.5">
                      Units to subscribe
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={offering.minAllocationUsdc}
                        max={offering.unitsRemaining}
                        step={1000}
                        value={unitsInput}
                        onChange={(e) => setUnitsInput(e.target.value)}
                        className="w-full bg-slate border border-withheld px-3 py-2 text-sm figure text-paper focus:outline-none focus:border-brand"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-paper/40 figure">
                        Units
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] figure text-paper/50 mt-1">
                      <span>Min: <Figure value={offering.minAllocationUsdc} /></span>
                      <span>Max: <Figure value={offering.unitsRemaining} /></span>
                    </div>
                  </div>

                  {/* Quote breakdown */}
                  <div className="border border-withheld bg-slate p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between text-paper/60">
                      <span>Unit Price</span>
                      <Figure value={offering.pricePerUnit} unit="USDC" className="text-paper" />
                    </div>
                    <div className="flex justify-between text-paper/60">
                      <span>Consideration</span>
                      <Figure value={consideration} unit="USDC" className="font-semibold text-paper" />
                    </div>
                    <div className="flex justify-between text-paper/60">
                      <span>Settlement Fee</span>
                      <span className="figure text-paper">0.00 USDC (0%)</span>
                    </div>
                    <div className="border-t border-withheld pt-2 flex justify-between font-semibold text-paper">
                      <span>Total Payment</span>
                      <Figure value={consideration} unit="USDC" className="text-brand" />
                    </div>
                  </div>

                  {/* Eligibility check badge */}
                  <div className="flex items-center gap-2 bg-settled/[0.06] border border-settled/30 p-2.5 text-xs text-settled figure">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>Daml Eligibility verified: Tier 2 Professional</span>
                  </div>

                  {!hasSufficientUsdc && (
                    <div className="text-xs text-[#e05252] bg-[#e05252]/10 border border-[#e05252]/30 p-2.5">
                      Insufficient USDC holding balance (Available: <Figure value={userUsdcBalance} unit="USDC" />)
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleReview}
                  disabled={!isValidAmount || !hasSufficientUsdc}
                  className="w-full bg-brand py-2.5 px-4 text-xs font-semibold text-paper hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                >
                  Review subscription <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* High Risk Confirmation Modal */}
            {subscribeState === "confirming" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5 text-[#e05252]">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <h3 className="font-display text-sm font-bold text-paper">
                      High-risk transaction
                    </h3>
                    <p className="text-[11px] text-paper/60">
                      Atomic DvP settlement is irreversible.
                    </p>
                  </div>
                </div>

                <div className="border border-withheld bg-slate p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-paper/60">
                    <span>Offering</span>
                    <span className="figure font-medium text-paper">{offering.title}</span>
                  </div>
                  <div className="flex justify-between text-paper/60">
                    <span>Units</span>
                    <Figure value={unitsNum} className="text-paper font-semibold" />
                  </div>
                  <div className="flex justify-between text-paper/60">
                    <span>Total Consideration</span>
                    <Figure value={consideration} unit="USDC" className="text-paper font-semibold" />
                  </div>
                  <div className="flex justify-between text-paper/60">
                    <span>Counterparty</span>
                    <PartyId value={offering.instrument.issuerParty} />
                  </div>
                </div>

                <div className="bg-[#e05252]/10 border border-[#e05252]/30 p-3 text-xs text-paper/80 leading-relaxed">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={riskConfirmed}
                      onChange={(e) => setRiskConfirmed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-withheld bg-slate accent-brand"
                    />
                    <span>
                      I confirm I have reviewed the offering terms. I understand this settles atomically on Canton and cannot be reversed.
                    </span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSubscribeState("quoted")}
                    className="flex-1 border border-withheld bg-slate py-2.5 text-xs text-paper hover:bg-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSubscribe}
                    disabled={!riskConfirmed}
                    className="flex-1 bg-brand py-2.5 text-xs font-semibold text-paper hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    Confirm & subscribe
                  </button>
                </div>
              </div>
            )}

            {/* Submitting State */}
            {subscribeState === "submitting" && (
              <div className="py-12 text-center space-y-4">
                <div className="h-8 w-8 border-2 border-brand border-t-transparent animate-spin mx-auto" />
                <h4 className="font-display text-sm font-semibold text-paper">
                  Submitting to the ledger…
                </h4>
                <p className="text-xs text-paper/60 leading-relaxed max-w-[320px] mx-auto">
                  Submitting command with disclosed contracts to Canton Validator. Please do not close or navigate away.
                </p>
              </div>
            )}

            {/* Settled State */}
            {subscribeState === "settled" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-settled">
                  <CheckCircle className="w-5 h-5" />
                  <h3 className="font-display text-sm font-bold text-paper">
                    Atomic DvP Settled
                  </h3>
                </div>

                <p className="text-xs text-paper/70 leading-relaxed">
                  Both legs executed in a single Canton transaction. Allocation holding contracts issued to your party.
                </p>

                <div className="bg-slate border border-withheld p-4 text-xs space-y-2">
                  <div className="flex justify-between text-paper/60">
                    <span>Units Acquired</span>
                    <Figure value={unitsNum} className="font-semibold text-paper" />
                  </div>
                  <div className="flex justify-between text-paper/60">
                    <span>USDC Exchanged</span>
                    <Figure value={consideration} unit="USDC" className="font-semibold text-paper" />
                  </div>
                  <div className="flex justify-between text-paper/60">
                    <span>Contract CID</span>
                    <span className="figure font-mono text-[11px] text-settled">{settledTxHash}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-brand py-2.5 text-xs font-semibold text-paper hover:opacity-90 transition-opacity"
                >
                  Close & view portfolio
                </button>
              </div>
            )}

            {/* Failed State */}
            {subscribeState === "failed" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-[#e05252]">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-display text-sm font-bold text-paper">
                    Settlement Rejected
                  </h3>
                </div>

                <p className="text-xs text-paper/70 leading-relaxed">
                  {errorMessage || "The transaction was rejected by the Canton Ledger API."}
                </p>

                <button
                  type="button"
                  onClick={() => setSubscribeState("quoted")}
                  className="w-full border border-withheld bg-slate py-2.5 text-xs font-semibold text-paper hover:bg-ink transition-colors"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
