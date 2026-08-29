import { INITIAL_OFFERINGS } from "@/lib/mockData";
import { StatePill } from "./StatePill";
import { Figure } from "./Figure";
import { ArrowRight } from "lucide-react";

export function OpenOfferingsSection({
  onSelectOffering,
  onLaunchApp,
}: {
  onSelectOffering?: (id: string) => void;
  onLaunchApp?: () => void;
}) {
  return (
    <section id="offerings" className="py-16 border-t border-withheld/50">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <span className="figure text-xs font-semibold uppercase tracking-widest text-brand">
            04 / Current Tranches
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-paper">
            Open offerings
          </h2>
          <p className="max-w-[620px] text-sm text-paper/70 leading-relaxed">
            Live tokenised equity tranches and fund units available for atomic delivery-versus-payment settlement on Canton.
          </p>
        </div>

        <button
          type="button"
          onClick={onLaunchApp}
          className="figure text-xs text-brand hover:text-brand/80 flex items-center gap-1.5 font-medium transition-colors"
        >
          View all offerings <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {INITIAL_OFFERINGS.slice(0, 3).map((offering) => {
          const progress = Math.round(
            ((offering.totalUnits - offering.unitsRemaining) / offering.totalUnits) * 100
          );

          return (
            <div
              key={offering.id}
              className="border border-withheld bg-slate flex flex-col justify-between hover:border-brand/40 transition-all p-6"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-paper">
                      {offering.title}
                    </h3>
                    <p className="text-xs text-paper/60 mt-0.5">{offering.subtitle}</p>
                  </div>
                  <StatePill state={offering.transferKind === "direct" ? "direct" : "offer"} />
                </div>

                <div className="mt-6 space-y-2.5 text-xs">
                  <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
                    <span className="text-paper/50">Min. allocation</span>
                    <Figure value={offering.minAllocationUsdc} unit="USDC" className="font-medium text-paper" />
                  </div>
                  <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
                    <span className="text-paper/50">Total tranche</span>
                    <Figure value={offering.totalUnits} unit="USDC" className="font-medium text-paper" />
                  </div>
                  <div className="flex justify-between items-baseline border-b border-withheld/40 pb-2">
                    <span className="text-paper/50">Closing date</span>
                    <span className="figure text-paper/80">{offering.closingDate}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-[11px] figure text-paper/50 mb-1.5">
                    <span>Filled: {progress}%</span>
                    <span>Remaining: <Figure value={offering.unitsRemaining} /></span>
                  </div>
                  <div className="w-full bg-withheld h-1">
                    <div className="bg-brand h-1 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-withheld/50 flex items-center justify-between">
                <span className="figure text-[11px] text-paper/40">
                  {offering.preApprovalRequired ? "⚠ Pre-approval required" : "✓ Pre-approved direct DvP"}
                </span>

                <button
                  type="button"
                  onClick={() => onSelectOffering ? onSelectOffering(offering.id) : onLaunchApp?.()}
                  className="bg-brand px-3.5 py-1.5 text-xs text-paper font-medium hover:opacity-90 transition-opacity"
                >
                  Subscribe
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
