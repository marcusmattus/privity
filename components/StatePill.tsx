export type SettlementState =
  | "settled"
  | "pending_acceptance"
  | "pending"
  | "direct"
  | "offer"
  | "rejected"
  | "eligible"
  | "unknown";

const STYLES: Record<SettlementState, { label: string; className: string }> = {
  settled:            { label: "SETTLED",   className: "text-settled border-settled/40 bg-settled/5" },
  pending_acceptance: { label: "PENDING",   className: "text-pending border-pending/40 bg-pending/5" },
  pending:            { label: "PENDING",   className: "text-pending border-pending/40 bg-pending/5" },
  direct:             { label: "DIRECT",    className: "text-settled border-settled/40 bg-settled/5" },
  offer:              { label: "OFFER",     className: "text-pending border-pending/40 bg-pending/5" },
  rejected:           { label: "REJECTED",  className: "text-[#e05252] border-[#e05252]/40 bg-[#e05252]/5" },
  eligible:           { label: "ELIGIBLE",  className: "text-settled border-settled/40 bg-settled/5" },
  unknown:            { label: "UNKNOWN",   className: "text-paper/70 border-paper/20 bg-white/5" },
};

export function StatePill({ state, className = "" }: { state: SettlementState; className?: string }) {
  const s = STYLES[state] || STYLES.unknown;
  return (
    <span className={`figure inline-block border px-2 py-0.5 text-[11px] font-medium tracking-wide ${s.className} ${className}`}>
      {s.label}
    </span>
  );
}
