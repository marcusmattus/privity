export type SettlementState =
  | "settled"
  | "pending_acceptance"
  | "direct"
  | "offer"
  | "rejected"
  | "unknown";

const STYLES: Record<SettlementState, { label: string; className: string }> = {
  settled:            { label: "SETTLED",  className: "text-settled border-settled/40" },
  pending_acceptance: { label: "PENDING",  className: "text-pending border-pending/40" },
  direct:             { label: "DIRECT",   className: "text-settled border-settled/40" },
  offer:              { label: "OFFER",    className: "text-pending border-pending/40" },
  rejected:           { label: "REJECTED", className: "text-paper/70 border-paper/20" },
  // Submit timed out. We do NOT know the outcome. Never render this as failed.
  unknown:            { label: "UNKNOWN",  className: "text-paper/70 border-paper/20" },
};

export function StatePill({ state }: { state: SettlementState }) {
  const s = STYLES[state];
  return (
    <span className={`figure inline-block border px-2 py-0.5 text-[11px] tracking-wide ${s.className}`}>
      {s.label}
    </span>
  );
}
