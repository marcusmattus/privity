"use client";
import { SettlementRecord } from "@/lib/types";
import { StatePill } from "./StatePill";
import { Figure } from "./Figure";
import { PartyId } from "./PartyId";
import { X, CheckCircle, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="border border-withheld bg-slate max-w-[820px] w-full my-8 shadow-2xl relative">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-withheld px-6 py-4 bg-ink/50">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-paper">
              {settlement.instrument}
            </h2>
            <StatePill state={settlement.state} />
          </div>

          <div className="flex items-center gap-3">
            {settlement.state === "pending_acceptance" && onCancel && (
              <button
                type="button"
                onClick={() => {
                  onCancel(settlement.id);
                  onClose();
                }}
                className="border border-withheld bg-ink px-3 py-1 text-xs text-paper/70 hover:text-paper transition-colors"
              >
                Cancel instruction
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-paper/60 hover:text-paper p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Summary & Details (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            {/* Core Details Matrix */}
            <div className="border border-withheld bg-ink/40 p-4 space-y-3 text-xs">
              <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
                <span className="text-paper/50">Instruction ID</span>
                <span className="figure font-mono text-paper">{settlement.instructionCid || "0x7f3a…b52e"}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
                <span className="text-paper/50">Created Timestamp</span>
                <span className="figure text-paper">{settlement.timeUtc} UTC ({settlement.date})</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
                <span className="text-paper/50">Transfer Kind</span>
                <span className="figure text-paper capitalize">
                  {settlement.kind === "direct" ? "Direct (Pre-approved DvP)" : "Offer (Pending Acceptance)"}
                </span>
              </div>
              <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
                <span className="text-paper/50">Units</span>
                <Figure value={settlement.units} className="font-semibold text-paper" />
              </div>
              <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
                <span className="text-paper/50">Consideration</span>
                <Figure value={settlement.consideration} unit={settlement.currency} className="font-semibold text-paper" />
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-paper/50">Counterparty</span>
                <PartyId value={settlement.counterparty} />
              </div>
            </div>

            {/* Audit Timeline */}
            <div>
              <h3 className="font-display text-sm font-semibold text-paper mb-3">
                Ledger Execution Timeline
              </h3>
              <div className="space-y-3 border-l-2 border-withheld pl-4 text-xs">
                {settlement.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${
                      idx === settlement.timeline.length - 1 && settlement.state === "settled"
                        ? "bg-settled"
                        : idx === settlement.timeline.length - 1 && settlement.state === "rejected"
                        ? "bg-[#e05252]"
                        : "bg-withheld"
                    }`} />
                    <div className="flex items-baseline gap-2">
                      <span className="figure font-medium text-paper capitalize">{step.step}</span>
                      <span className="figure text-[11px] text-paper/40">{step.time} UTC</span>
                    </div>
                    <p className="text-paper/60 text-[11px] mt-0.5">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {settlement.errorCode && (
              <div className="border border-[#e05252]/40 bg-[#e05252]/10 p-3 text-xs text-[#e05252]">
                <strong>Ledger Error:</strong> {settlement.errorCode}
              </div>
            )}
          </div>

          {/* Right Guidance & Actions (5 cols) */}
          <div className="md:col-span-5 bg-ink/30 border border-withheld p-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold text-paper">
                {settlement.state === "pending_acceptance" ? "What happens next?" : "Settlement Verification"}
              </h3>

              {settlement.state === "pending_acceptance" ? (
                <ul className="space-y-3 text-xs text-paper/70 leading-relaxed list-disc list-inside">
                  <li>An offer instruction has been created on the Canton ledger.</li>
                  <li>
                    <strong className="text-paper">The balance will not move</strong> until the counterparty signs with their signing provider.
                  </li>
                  <li>You will be notified immediately when the instruction is accepted or rejected.</li>
                </ul>
              ) : settlement.state === "settled" ? (
                <div className="space-y-3 text-xs text-paper/70 leading-relaxed">
                  <p>
                    ✓ <strong>Atomic Execution:</strong> Both legs settled in a single Canton block transaction.
                  </p>
                  <p>
                    <strong>Disclosed Contracts Attached:</strong> {settlement.disclosedContracts}
                  </p>
                  <p>
                    <strong>Ledger Offset:</strong> <span className="figure font-mono text-[11px] text-paper">{settlement.ledgerOffset || "000000000000004921"}</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-paper/70 leading-relaxed">
                  This transaction was refused by Daml ledger preconditions. No balance or token units were transferred.
                </p>
              )}
            </div>

            {settlement.state === "pending_acceptance" && onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept(settlement.id);
                  onClose();
                }}
                className="w-full bg-brand py-2.5 px-4 text-xs font-semibold text-paper hover:opacity-90 transition-opacity"
              >
                Sign & Accept Instruction
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
