import { StatePill } from "./StatePill";

export function HowSettlementWorks() {
  const steps = [
    {
      state: "direct" as const,
      icon: "⇄",
      title: "DIRECT",
      badge: "SETTLED",
      description:
        "Receiver has a live pre-approval contract on Canton. Both legs (tokenised allocation and stablecoin payment) swap atomically in a single ledger transaction.",
      highlight: "T+0 immediate execution",
    },
    {
      state: "offer" as const,
      icon: "⏳",
      title: "OFFER",
      badge: "PENDING",
      description:
        "No live pre-approval in place. A TransferInstruction contract is created on the ledger. The balance does not move until the receiver signs an on-ledger acceptance.",
      highlight: "Zero balance leakage before accept",
    },
    {
      state: "rejected" as const,
      icon: "✕",
      title: "REJECTED",
      badge: "REJECTED",
      description:
        "The buyer's Daml Eligibility contract did not satisfy the offering's jurisdictional or tier precondition. The ledger refused the transaction, not a backend API.",
      highlight: "Enforced strictly by smart contracts",
    },
  ];

  return (
    <section id="how" className="py-16 border-t border-withheld/50">
      <div className="flex flex-col gap-2">
        <span className="figure text-xs font-semibold uppercase tracking-widest text-brand">
          03 / Ledger Architecture
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-paper">
          How settlement works on Canton
        </h2>
        <p className="max-w-[700px] text-sm text-paper/70 leading-relaxed">
          Privity operates with Daml contracts where preconditions, pre-approvals, and eligibility constraints
          are cryptographically proven by validator nodes.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="border border-withheld bg-slate p-6 flex flex-col justify-between hover:border-brand/50 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between border-b border-withheld pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base text-paper/80 font-bold">{s.icon}</span>
                  <span className="font-display text-lg font-bold text-paper tracking-wide">{s.title}</span>
                </div>
                <StatePill state={s.state} />
              </div>
              <p className="mt-4 text-xs text-paper/70 leading-relaxed min-h-[72px]">
                {s.description}
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-withheld/40">
              <span className="figure text-[11px] text-paper/50 block">
                {s.highlight}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
