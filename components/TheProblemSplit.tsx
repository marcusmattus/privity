import { PartyId } from "./PartyId";
import { WithheldBlock } from "./WithheldBlock";

export function TheProblemSplit() {
  return (
    <section id="the-problem" className="py-16 border-t border-withheld/50">
      <div className="flex flex-col gap-2">
        <span className="figure text-xs font-semibold uppercase tracking-widest text-brand">
          02 / The Privacy Imperative
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-paper">
          Now make the left one your cap table.
        </h2>
        <p className="max-w-[700px] text-sm text-paper/70 leading-relaxed">
          On public blockchains, every transaction, wallet balance, and counterparty relationship is broadcast to the world.
          On Canton, sub-transaction privacy ensures only counterparties to a trade ever receive or store the record.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Public chain block explorer */}
        <div className="border border-withheld bg-slate p-6">
          <div className="flex items-center justify-between border-b border-withheld pb-4">
            <div>
              <span className="figure text-[11px] uppercase tracking-wider text-[#e05252] font-semibold">
                Public chain
              </span>
              <p className="text-xs text-paper/50 mt-0.5">(everyone sees everything)</p>
            </div>
            <span className="figure text-xs text-paper/80 bg-ink/70 px-2.5 py-1 border border-withheld font-mono">
              0x1a2b…9c8d
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
              <span className="text-xs text-paper/60">Total Balance</span>
              <span className="figure text-sm font-semibold text-paper">4,231,241.72 USDC</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
              <span className="text-xs text-paper/60">Token holdings</span>
              <span className="figure text-sm text-paper">12 asset classes</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
              <span className="text-xs text-paper/60">Public Transactions</span>
              <span className="figure text-sm text-paper">1,384</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
              <span className="text-xs text-paper/60">Exposed Counterparties</span>
              <span className="figure text-sm text-paper font-semibold text-[#e05252]">47 entities</span>
            </div>
          </div>

          {/* Exposed bar visualizer */}
          <div className="mt-6 pt-4 border-t border-withheld">
            <span className="figure text-[10px] tracking-wider uppercase text-paper/40 block mb-2">
              Broadcast ledger activity (fully exposed)
            </span>
            <div className="flex items-end gap-1.5 h-12">
              {[40, 65, 30, 85, 95, 45, 70, 60, 80, 50, 90, 75, 60, 85, 40, 95, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#e05252]/80 hover:bg-[#e05252] transition-colors"
                  style={{ height: `${h}%` }}
                  title={`Exposed public transaction #${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: On Privity (Canton) */}
        <div className="border border-brand/40 bg-slate p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-brand/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between border-b border-withheld pb-4">
            <div>
              <span className="figure text-[11px] uppercase tracking-wider text-settled font-semibold">
                On Privity
              </span>
              <p className="text-xs text-paper/50 mt-0.5">(you only see yours)</p>
            </div>
            <PartyId value="party_x7f3918237198273918239a2c" className="text-xs bg-ink/70 px-2.5 py-1 border border-withheld" />
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
              <span className="text-xs text-paper/60">Balance</span>
              <div className="w-36 flex justify-end">
                <WithheldBlock width="80%" />
              </div>
            </div>
            <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
              <span className="text-xs text-paper/60">Holding</span>
              <div className="w-28 flex justify-end">
                <WithheldBlock width="70%" />
              </div>
            </div>
            <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
              <span className="text-xs text-paper/60">Transactions visible to you</span>
              <span className="figure text-sm text-settled font-semibold">1</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
              <span className="text-xs text-paper/60">Disclosed Counterparties</span>
              <span className="figure text-sm text-paper">1 (direct counterparty only)</span>
            </div>
          </div>

          {/* Withheld visualizer */}
          <div className="mt-6 pt-4 border-t border-withheld">
            <div className="flex items-center justify-between mb-2">
              <span className="figure text-[10px] tracking-wider uppercase text-paper/40">
                Synchroniser privacy state
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-settled figure text-[10px]">
                  <span className="h-1.5 w-1.5 bg-settled inline-block" /> Visible to you
                </span>
                <span className="flex items-center gap-1 text-paper/40 figure text-[10px]">
                  <span className="h-1.5 w-1.5 bg-withheld inline-block" /> Withheld
                </span>
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-12">
              {[40, 65, 30, 85, 95, 45, 70, 60, 80, 50, 90, 75, 60, 85, 40, 95, 70].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 transition-colors ${i === 10 ? "bg-settled" : "bg-withheld"}`}
                  style={{ height: i === 10 ? "85%" : "30%" }}
                  title={i === 10 ? "Your atomic settlement" : "Withheld from your node"}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
