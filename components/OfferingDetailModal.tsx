"use client";

import { useState } from "react";
import { Offering } from "@/lib/types";
import { Figure } from "./Figure";
import { PartyId } from "./PartyId";
import { StatePill } from "./StatePill";
import {
  X,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Lock,
  ExternalLink,
  Info,
} from "lucide-react";

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
  const [requestedUnits, setRequestedUnits] = useState<number>(
    Math.max(offering.minAllocationUsdc, 50000)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const pricePerUnit = offering.pricePerUnit;
  const grossConsideration = requestedUnits * pricePerUnit;
  const platformFee = grossConsideration * 0.001; // 0.1% platform fee
  const netTotalConsideration = grossConsideration + platformFee;

  const hasSufficientFunds = userUsdcBalance >= netTotalConsideration;
  const satisfiesMinAllocation = requestedUnits >= offering.minAllocationUsdc;
  const satisfiesCapacity = requestedUnits <= offering.unitsRemaining;

  const contractAddress = `0x7a2${Math.random().toString(16).slice(2, 6)}4f9C${Math.random().toString(16).slice(2, 6)}`;

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleSubscribe = async () => {
    if (!satisfiesMinAllocation) {
      setExecutionError(`Minimum subscription is ${offering.minAllocationUsdc.toLocaleString()} units.`);
      return;
    }
    if (!satisfiesCapacity) {
      setExecutionError(`Exceeds tranche capacity (${offering.unitsRemaining.toLocaleString()} units remaining).`);
      return;
    }

    setIsSubmitting(true);
    setExecutionError(null);

    // Simulate Daml command execution & atomic swap
    setTimeout(() => {
      setIsSubmitting(false);
      onSubscribeSuccess(offering, requestedUnits, netTotalConsideration);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-[960px] border border-withheld bg-[#0e1017] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="border-b border-withheld bg-[#131620] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs figure text-paper/60">
            <span>Offerings</span>
            <span>&gt;</span>
            <span className="text-brand font-mono font-semibold">{offering.instrument.symbol}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-paper/50 hover:text-paper p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Headline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-withheld pb-5">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-paper">
                {offering.title}
              </h2>
              <p className="text-xs text-paper/70 mt-1">{offering.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="border border-withheld bg-[#141722] px-3 py-1 font-mono text-xs text-paper font-semibold">
                {offering.instrument.symbol}
              </span>
              <span className="border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] figure font-semibold text-brand uppercase">
                {offering.settlementType}
              </span>
            </div>
          </div>

          {/* Two-Column Grid matching screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Details & Settlement Mechanics (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Box 1: Instrument Details */}
              <div className="border border-withheld bg-[#141722] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-withheld pb-3">
                  <span className="figure text-[10px] font-bold uppercase tracking-wider text-brand">
                    INSTRUMENT DETAILS
                  </span>
                  <span className="figure text-[10px] text-settled uppercase font-semibold px-2 py-0.5 bg-settled/10 border border-settled/30">
                    Status: OPEN
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-[#0b0d14] p-3.5 border border-withheld/50">
                  <div>
                    <span className="text-[10px] figure text-paper/50 block">Issuer</span>
                    <span className="font-semibold text-paper text-xs">{offering.instrument.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] figure text-paper/50 block">Type</span>
                    <span className="font-semibold text-paper text-xs capitalize">
                      Tokenized {offering.instrument.kind.replace("_", " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] figure text-paper/50 block">Total Tranche Supply</span>
                    <span className="font-mono text-paper text-xs font-semibold">
                      {offering.totalUnits.toLocaleString()} Units
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] figure text-paper/50 block">Jurisdiction</span>
                    <span className="font-semibold text-paper text-xs">{offering.instrument.jurisdiction}</span>
                  </div>
                </div>

                <p className="text-xs text-paper/70 leading-relaxed">
                  {offering.description} This instrument utilizes standard Daml ERC-3643 compliance logic for on-chain cryptographic identity and transfer restrictions on Canton.
                </p>
              </div>

              {/* Box 2: Settlement Mechanics */}
              <div className="border border-withheld bg-[#141722] p-5 space-y-4">
                <span className="figure text-[10px] font-bold uppercase tracking-wider text-brand block">
                  SETTLEMENT MECHANICS
                </span>

                <div className="bg-brand/10 border border-brand/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-paper">
                    <Layers className="w-4 h-4 text-brand" />
                    <span>Atomic Swap Delivery vs Payment (DvP)</span>
                  </div>
                  <p className="text-xs text-paper/80 leading-relaxed">
                    Subscription requires a signed quote commitment. Settlement occurs atomically via a smart contract executing Delivery vs Payment. If sufficient consideration (USDC) is not present in the settling wallet at execution, the transaction reverts entirely. No partial fills are supported in this phase.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-withheld/50 pb-2">
                    <span className="text-paper/50">Settlement Asset</span>
                    <span className="font-mono font-semibold text-paper">USDC (Canton LocalNet)</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-withheld/50 pb-2">
                    <span className="text-paper/50">Min. Subscription</span>
                    <span className="font-mono font-semibold text-paper">
                      {offering.minAllocationUsdc.toLocaleString()} Units (${offering.minAllocationUsdc.toLocaleString()} USDC)
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-paper/50">Execution Smart Contract</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-paper/80 bg-[#0b0d14] px-2 py-1 border border-withheld">
                      <span>{contractAddress}</span>
                      <button
                        type="button"
                        onClick={handleCopyContract}
                        className="text-paper/50 hover:text-paper"
                      >
                        {copiedContract ? <Check className="w-3 h-3 text-settled" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Subscription Quote Form (5 cols) */}
            <div className="lg:col-span-5 border border-withheld bg-[#141722] p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-withheld pb-3">
                  <span className="figure text-[10px] font-bold uppercase tracking-wider text-paper/80">
                    SUBSCRIPTION ORDER
                  </span>
                  <span className="figure text-[10px] text-brand bg-brand/15 border border-brand/30 px-2 py-0.5 uppercase font-semibold">
                    QUOTED
                  </span>
                </div>

                {/* Units Input */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <label className="text-paper/70 font-medium">Units Requested</label>
                    <span className="text-paper/40 figure text-[11px]">
                      Max: {offering.unitsRemaining.toLocaleString()}
                    </span>
                  </div>

                  <input
                    type="number"
                    min={offering.minAllocationUsdc}
                    max={offering.unitsRemaining}
                    step={10000}
                    value={requestedUnits}
                    onChange={(e) => setRequestedUnits(Number(e.target.value) || 0)}
                    className="w-full bg-[#0b0d14] border border-withheld px-4 py-2.5 font-mono text-base font-bold text-paper focus:outline-none focus:border-brand"
                  />

                  {/* Quick percentage buttons */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setRequestedUnits(offering.minAllocationUsdc)}
                      className="py-1 text-[10px] figure bg-[#0e1017] border border-withheld hover:border-brand text-paper/70 hover:text-paper"
                    >
                      Min
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestedUnits(Math.round(offering.unitsRemaining * 0.25))}
                      className="py-1 text-[10px] figure bg-[#0e1017] border border-withheld hover:border-brand text-paper/70 hover:text-paper"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestedUnits(Math.round(offering.unitsRemaining * 0.5))}
                      className="py-1 text-[10px] figure bg-[#0e1017] border border-withheld hover:border-brand text-paper/70 hover:text-paper"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestedUnits(offering.unitsRemaining)}
                      className="py-1 text-[10px] figure bg-[#0e1017] border border-withheld hover:border-brand text-paper/70 hover:text-paper"
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* Calculation Breakdown Matrix */}
                <div className="space-y-2.5 text-xs bg-[#0b0d14] p-4 border border-withheld">
                  <div className="flex justify-between text-paper/60">
                    <span>Price per Unit</span>
                    <span className="font-mono text-paper">${pricePerUnit.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between text-paper/60">
                    <span>Gross Consideration</span>
                    <span className="font-mono text-paper">
                      ${grossConsideration.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                    </span>
                  </div>
                  <div className="flex justify-between text-paper/60">
                    <span>Platform Settlement Fee (0.1%)</span>
                    <span className="font-mono text-paper">
                      ${platformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                    </span>
                  </div>

                  <div className="border-t border-withheld/60 pt-2.5 flex justify-between items-baseline">
                    <span className="font-semibold text-paper text-xs uppercase figure">Net Total</span>
                    <span className="font-mono text-lg font-bold text-paper text-brand">
                      ${netTotalConsideration.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                    </span>
                  </div>
                </div>

                {/* Available Balance Status */}
                <div className="flex items-center justify-between text-xs figure text-paper/60 px-1">
                  <span>Available USDC in Wallet:</span>
                  <span className={`font-mono font-semibold ${hasSufficientFunds ? "text-settled" : "text-pending"}`}>
                    ${userUsdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                  </span>
                </div>

                {executionError && (
                  <div className="p-3 bg-pending/10 border border-pending/40 text-pending text-xs figure flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{executionError}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={isSubmitting || !satisfiesMinAllocation || !satisfiesCapacity}
                  className="w-full bg-[#D4BBFF] hover:bg-[#c4a5f8] disabled:opacity-50 text-[#151226] font-bold text-xs py-3 px-4 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#151226]/30 border-t-[#151226] rounded-full animate-spin" />
                      <span>Executing Daml Atomic DvP…</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe & Lock Allocation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-paper/40 figure text-center">
                  By subscribing, you agree to the Offering Memorandum and atomic DvP rules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
