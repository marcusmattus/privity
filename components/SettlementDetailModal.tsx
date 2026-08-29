"use client";

import { SettlementRecord } from "@/lib/types";
import { StatePill } from "./StatePill";
import { PartyId } from "./PartyId";
import { Figure } from "./Figure";
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Copy,
  Check,
  ExternalLink,
  Shield,
  ArrowDown,
  ArrowUp,
  EyeOff,
} from "lucide-react";
import { useState } from "react";

export function SettlementDetailModal({
  settlement,
  onClose,
  onAccept,
  onCancel,
}: {
  settlement: SettlementRecord;
  onClose: () => void;
  onAccept?: (id: string) => void;
  onCancel?: (id: string) => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportReceipt = () => {
    const receiptData = JSON.stringify(settlement, null, 2);
    const blob = new Blob([receiptData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt_${settlement.id}_${settlement.instrument}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-[920px] border border-withheld bg-[#0e1017] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar matching screenshot */}
        <div className="border-b border-withheld bg-[#131620] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-paper">SET-8924-X</span>
            <StatePill state={settlement.state} />
            <span className="text-xs text-paper/50 figure hidden sm:inline-block">
              Asset Transfer • {settlement.date}, {settlement.timeUtc} UTC
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportReceipt}
              className="flex items-center gap-1.5 border border-withheld bg-[#141722] hover:bg-[#1a1e2d] px-3 py-1.5 text-xs text-paper figure transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-brand" />
              <span>Export Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-paper/50 hover:text-paper p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Cryptographic Audit Trail (6 cols) */}
            <div className="lg:col-span-6 border border-withheld bg-[#141722] p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-withheld pb-3">
                  <span className="figure text-[10px] font-bold uppercase tracking-wider text-brand">
                    CRYPTOGRAPHIC AUDIT TRAIL
                  </span>
                  <span className="figure text-[10px] text-paper/50">
                    Canton Synchronizer Node
                  </span>
                </div>

                <div className="mt-5 space-y-6 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-withheld">
                  {settlement.timeline.map((step, idx) => {
                    const isLast = idx === settlement.timeline.length - 1;
                    const isSettled = step.step === "settled";
                    const isRejected = step.step === "rejected";

                    return (
                      <div key={idx} className="relative space-y-1">
                        <div
                          className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            isSettled
                              ? "border-settled bg-settled text-ink font-bold"
                              : isRejected
                              ? "border-pending bg-pending text-ink font-bold"
                              : "border-brand bg-[#141722] text-brand font-semibold"
                          }`}
                        >
                          {isSettled ? "✓" : idx + 1}
                        </div>

                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-semibold text-paper capitalize">
                            {step.step.replace("_", " ")}
                          </span>
                          <span className="figure font-mono text-[11px] text-paper/50">{step.time} UTC</span>
                        </div>

                        <p className="text-[11px] text-paper/70 leading-relaxed font-mono">
                          {step.description}
                        </p>

                        {isSettled && (
                          <div className="pt-1 flex items-center gap-2 text-[10px] text-settled figure">
                            <span>Tx: 0x9a8f2c1e48109d7a2...</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard("0x9a8f2c1e48109d7a2...", "tx")}
                              className="hover:underline text-paper/40"
                            >
                              {copiedId === "tx" ? "Copied" : "Copy"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-withheld text-[10px] text-paper/40 figure">
                <span>Do not resubmit — all state choices are deterministic and locked on Canton.</span>
              </div>
            </div>

            {/* Right Column: Counterparties & Contracts & Offsets (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Box 1: Counterparties */}
              <div className="border border-withheld bg-[#141722] p-4 space-y-3">
                <span className="figure text-[10px] font-bold uppercase tracking-wider text-paper/60 block">
                  COUNTERPARTIES
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-[#0b0d14] p-2.5 border border-withheld/60">
                    <span className="text-paper/50">Originator (You)</span>
                    <PartyId value={settlement.buyerParty} className="font-mono text-[11px]" />
                  </div>
                  <div className="flex justify-between items-center bg-[#0b0d14] p-2.5 border border-withheld/60">
                    <span className="text-paper/50">Beneficiary</span>
                    <span className="font-mono text-[11px] text-paper/60 flex items-center gap-1.5">
                      <EyeOff className="w-3 h-3 text-paper/40" /> [REDACTED BY PROTOCOL]
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 2: Contract Execution */}
              <div className="border border-withheld bg-[#141722] p-4 space-y-3">
                <span className="figure text-[10px] font-bold uppercase tracking-wider text-paper/60 block">
                  CONTRACT EXECUTION
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-[#0b0d14] p-2.5 border border-withheld/60">
                    <span className="text-paper/50">Created Contract</span>
                    <span className="font-mono font-semibold text-brand text-[11px]">CTR-992-ALPHA</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#0b0d14] p-2.5 border border-withheld/60">
                    <span className="text-paper/50">Archived Predecessor</span>
                    <span className="figure text-[10px] text-paper/50 bg-[#141722] px-2 py-0.5 border border-withheld">
                      CTR-814-BETA (ARCHIVED)
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 3: Ledger Offset */}
              <div className="border border-withheld bg-[#141722] p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="figure text-[10px] font-bold uppercase tracking-wider text-paper/60">
                    LEDGER OFFSET
                  </span>
                  <span className="figure text-[10px] text-settled bg-settled/10 px-2 py-0.5 border border-settled/30">
                    Disclosed Contracts: {settlement.disclosedContracts} / 4
                  </span>
                </div>

                <div className="space-y-2 text-xs bg-[#0b0d14] p-3 border border-withheld/60 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-paper font-semibold">{settlement.currency}</span>
                    <span className="text-settled font-bold">
                      ↓ Inbound ${settlement.consideration.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-paper/40 text-[10px]">
                    <span>State Root Hash</span>
                    <span>0x88c2...f1a9</span>
                  </div>
                </div>
              </div>

              {/* Action if pending */}
              {settlement.state === "pending_acceptance" && (
                <div className="flex gap-3 pt-2">
                  {onCancel && (
                    <button
                      type="button"
                      onClick={() => {
                        onCancel(settlement.id);
                        onClose();
                      }}
                      className="flex-1 border border-withheld bg-[#141722] py-2.5 text-xs text-paper hover:bg-[#1a1e2d]"
                    >
                      Reject Instruction
                    </button>
                  )}
                  {onAccept && (
                    <button
                      type="button"
                      onClick={() => {
                        onAccept(settlement.id);
                        onClose();
                      }}
                      className="flex-1 bg-[#D4BBFF] hover:bg-[#c4a5f8] text-[#151226] font-bold py-2.5 text-xs transition-colors"
                    >
                      Accept Obligation
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
