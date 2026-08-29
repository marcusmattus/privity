import { StatePill } from "./StatePill";
import { WithheldBlock } from "./WithheldBlock";

export function DesignSystemView() {
  const colours = [
    { name: "Ink", hex: "#0B0D14", bg: "bg-[#0B0D14]", border: "border-white/20" },
    { name: "Slate", hex: "#14161F", bg: "bg-[#14161F]", border: "border-white/20" },
    { name: "Withheld", hex: "#262A38", bg: "bg-[#262A38]", border: "border-white/10" },
    { name: "Paper", hex: "#ECEDF2", bg: "bg-[#ECEDF2]", textColor: "text-ink" },
    { name: "Brand", hex: "#6D3AF2", bg: "bg-[#6D3AF2]" },
    { name: "Settled", hex: "#46A88C", bg: "bg-[#46A88C]" },
    { name: "Pending", hex: "#C6973F", bg: "bg-[#C6973F]" },
    { name: "Rejected", hex: "#E05252", bg: "bg-[#E05252]" },
  ];

  return (
    <div className="border border-withheld bg-slate p-8 space-y-8 max-w-[960px] mx-auto">
      <div>
        <span className="figure text-xs font-semibold uppercase tracking-widest text-brand block">
          Specification
        </span>
        <h2 className="font-display text-2xl font-bold text-paper">01. Design system</h2>
        <p className="text-xs text-paper/60 mt-1">
          Strict financial settlement design system. Colour encodes visibility, not hierarchy.
        </p>
      </div>

      {/* Colours */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold text-paper uppercase tracking-wider figure">
          Colours
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {colours.map((c) => (
            <div key={c.name} className="flex flex-col gap-2">
              <div className={`h-16 w-full ${c.bg} border ${c.border || "border-transparent"}`} />
              <div>
                <span className="figure text-xs font-semibold text-paper block">{c.name}</span>
                <span className="figure text-[11px] text-paper/50 font-mono">{c.hex}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-4 border-t border-withheld pt-6">
        <h3 className="font-display text-sm font-semibold text-paper uppercase tracking-wider figure">
          Typography
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="border border-withheld bg-ink/40 p-4 space-y-2">
            <span className="font-display text-base font-bold text-paper block">Archivo</span>
            <p className="figure text-paper/60 text-[11px]">Display 64 / 48 / 32</p>
            <p className="figure text-paper/60 text-[11px]">SemiBold / Bold</p>
            <p className="font-display text-sm text-paper mt-2">Both legs, one transaction, no audience.</p>
          </div>

          <div className="border border-withheld bg-ink/40 p-4 space-y-2">
            <span className="font-sans text-base font-bold text-paper block">IBM Plex Sans</span>
            <p className="figure text-paper/60 text-[11px]">Body 17 / 15</p>
            <p className="figure text-paper/60 text-[11px]">Regular / Medium</p>
            <p className="text-xs text-paper/80 leading-relaxed mt-2">
              Tokenised allocations settled atomically against stablecoin on Canton.
            </p>
          </div>

          <div className="border border-withheld bg-ink/40 p-4 space-y-2">
            <span className="font-mono text-base font-bold text-paper block">IBM Plex Mono</span>
            <p className="figure text-paper/60 text-[11px]">Mono 14 / 13</p>
            <p className="figure text-paper/60 text-[11px]">Regular (Tabular numerals)</p>
            <p className="figure text-xs text-paper/80 mt-2">
              1,284,500.00 USDC · 14:31:46 UTC
            </p>
          </div>
        </div>
      </div>

      {/* UI Elements */}
      <div className="space-y-4 border-t border-withheld pt-6">
        <h3 className="font-display text-sm font-semibold text-paper uppercase tracking-wider figure">
          UI Elements
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="space-y-2">
            <span className="figure text-paper/50 block">Primary button</span>
            <button type="button" className="bg-brand px-4 py-2 text-paper font-medium text-xs hover:opacity-90">
              Request access
            </button>
          </div>

          <div className="space-y-2">
            <span className="figure text-paper/50 block">Ghost button</span>
            <button type="button" className="border border-withheld bg-slate px-4 py-2 text-paper font-medium text-xs hover:bg-ink">
              View offerings
            </button>
          </div>

          <div className="space-y-2">
            <span className="figure text-paper/50 block">State pills</span>
            <div className="flex flex-wrap gap-1.5">
              <StatePill state="settled" />
              <StatePill state="pending" />
              <StatePill state="rejected" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="figure text-paper/50 block">Withheld block</span>
            <div className="p-2 border border-withheld bg-ink/40">
              <WithheldBlock width="90%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
