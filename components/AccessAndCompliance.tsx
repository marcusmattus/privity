import { ShieldCheck, UserCheck, FileText, Lock } from "lucide-react";

export function AccessAndCompliance() {
  const items = [
    {
      icon: UserCheck,
      title: "Who can access",
      description: "Professional investors, family offices, and regulated institutions that meet accredited eligibility requirements.",
    },
    {
      icon: FileText,
      title: "What this is",
      description: "A permissioned settlement venue built on the Canton Network. Not a public multilateral trading facility or exchange.",
    },
    {
      icon: ShieldCheck,
      title: "What we settle",
      description: "Tokenised private company equity allocations and fund units settled atomically against stablecoin holdings.",
    },
    {
      icon: Lock,
      title: "Our commitments",
      description: "Privacy by design with cryptographic validator verification. Precondition-gated Daml smart contracts. No custodial key exposure.",
    },
  ];

  return (
    <section id="compliance" className="py-16 border-t border-withheld/50">
      <div className="border border-withheld bg-slate p-8">
        <div className="flex flex-col gap-2 border-b border-withheld pb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand" />
            <h2 className="font-display text-2xl font-bold text-paper">
              Access and compliance
            </h2>
          </div>
          <p className="text-xs text-paper/70 leading-relaxed max-w-[800px]">
            Privity is an institutional settlement venue for eligible participants to transact in tokenised securities and fund units on the Canton Network.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-paper/60" />
                  <span className="font-display text-sm font-semibold text-paper">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-paper/60 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
