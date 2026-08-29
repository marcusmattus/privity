"use client";
import { useState } from "react";
import { Holding, SettlementRecord } from "@/lib/types";
import { Figure } from "./Figure";
import { StatePill } from "./StatePill";
import { PartyId } from "./PartyId";
import { Check, Clock, TrendingUp } from "lucide-react";

export function PortfolioView({
  holdings,
  settlements,
  partyId,
  onAcceptSettlement,
  onNavigateToOfferings,
  onNavigateToSettlements,
}: {
  holdings: Holding[];
  settlements: SettlementRecord[];
  partyId: string;
  onAcceptSettlement: (id: string) => void;
  onNavigateToOfferings: () => void;
  onNavigateToSettlements: () => void;
}) {
  const [navTimeframe, setNavTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  // Calculations
  const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.valuationUsdc, 0);
  const investedHoldingsValue = holdings
    .filter((h) => h.type !== "Stablecoin")
    .reduce((sum, h) => sum + h.valuationUsdc, 0);
  const settledThisMonth = 1250000.0;

  const inFlightSettlements = settlements.filter(
    (s) => s.state === "pending_acceptance"
  );

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-withheld bg-slate p-5">
          <span className="figure text-[11px] uppercase tracking-wider text-paper/50 block">
            Total Holdings (USD)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <Figure value={totalHoldingsValue} unit="USDC" className="font-display text-2xl font-bold text-paper" />
          </div>
          <span className="figure text-[11px] text-settled mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +7.87% (30d)
          </span>
        </div>

        <div className="border border-withheld bg-slate p-5">
          <span className="figure text-[11px] uppercase tracking-wider text-paper/50 block">
            Total Invested
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <Figure value={investedHoldingsValue} unit="USDC" className="font-display text-2xl font-bold text-paper" />
          </div>
          <span className="figure text-[11px] text-paper/50 mt-1 block">
            Across 3 equity & fund tranches
          </span>
        </div>

        <div className="border border-withheld bg-slate p-5">
          <span className="figure text-[11px] uppercase tracking-wider text-paper/50 block">
            Settled this month
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <Figure value={settledThisMonth} unit="USDC" className="font-display text-2xl font-bold text-paper" />
          </div>
          <span className="figure text-[11px] text-settled mt-1 block">
            3 atomic DvP executions
          </span>
        </div>

        <div className="border border-withheld bg-slate p-5">
          <span className="figure text-[11px] uppercase tracking-wider text-paper/50 block">
            Managed Canton Party
          </span>
          <div className="mt-2">
            <PartyId value={partyId} className="text-sm font-semibold text-paper" />
          </div>
          <span className="figure text-[11px] text-paper/50 mt-1 block">
            Custody: Managed / Signer active
          </span>
        </div>
      </div>

      {/* In-Flight Settlements Alert Strip (if any) */}
      {inFlightSettlements.length > 0 && (
        <div className="border border-pending/40 bg-pending/[0.04] p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-pending animate-pulse" />
              <div>
                <span className="text-xs font-semibold text-paper">
                  {inFlightSettlements.length} In-flight transfer instruction awaiting acceptance
                </span>
                <p className="text-[11px] text-paper/60">
                  Receiver has not accepted. No balance has moved until signed.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {inFlightSettlements.map((inf) => (
                <div key={inf.id} className="flex items-center gap-2 bg-ink/70 border border-pending/30 px-3 py-1.5 text-xs">
                  <span className="figure font-medium text-paper">{inf.instrument}</span>
                  <span className="figure text-paper/60"><Figure value={inf.consideration} unit="USDC" /></span>
                  <button
                    type="button"
                    onClick={() => onAcceptSettlement(inf.id)}
                    className="bg-pending text-ink px-2.5 py-0.5 text-[11px] font-semibold hover:opacity-90 transition-opacity ml-1"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NAV Chart Visualizer */}
      <div className="border border-withheld bg-slate p-6">
        <div className="flex items-center justify-between border-b border-withheld pb-4 flex-wrap gap-2">
          <div>
            <span className="font-display text-base font-bold text-paper">Portfolio NAV Trajectory</span>
            <p className="text-xs text-paper/60 mt-0.5">Continuous mark-to-market valuation across settled allocations</p>
          </div>
          <div className="flex items-center gap-1 border border-withheld p-0.5 text-xs figure">
            {(["7d", "30d", "90d"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setNavTimeframe(t)}
                className={`px-3 py-1 transition-colors ${
                  navTimeframe === t ? "bg-brand text-paper" : "text-paper/60 hover:text-paper"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-end gap-2 h-36 border-b border-withheld/60 pb-1">
            {[
              { day: "01", val: 4850000, h: 62 },
              { day: "03", val: 4890000, h: 65 },
              { day: "06", val: 4910000, h: 68 },
              { day: "09", val: 4970000, h: 72 },
              { day: "12", val: 5020000, h: 76 },
              { day: "15", val: 5048000, h: 78 },
              { day: "18", val: 5090000, h: 82 },
              { day: "21", val: 5131000, h: 86 },
              { day: "24", val: 5165000, h: 89 },
              { day: "27", val: 5198000, h: 93 },
              { day: "30", val: 5231945, h: 97 },
            ].map((p, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-brand/40 group-hover:bg-brand transition-all border-t border-brand"
                  style={{ height: `${p.h}%` }}
                />
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-ink border border-withheld px-2 py-1 text-[10px] figure whitespace-nowrap pointer-events-none transition-opacity z-10">
                  Day {p.day}: ${p.val.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[11px] figure text-paper/40 mt-2">
            <span>Day 01 ($4,850,000)</span>
            <span>Day 15 ($5,048,000)</span>
            <span>Day 30 ($5,231,945)</span>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="border border-withheld bg-slate">
        <div className="flex items-center justify-between border-b border-withheld px-5 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-paper">Holdings</h2>
            <p className="text-xs text-paper/60 mt-0.5">Daml contract sets holding tokenised units & stablecoin</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToSettlements}
            className="figure text-xs text-brand hover:text-brand/80 transition-colors"
          >
            View all settlements →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-withheld bg-ink/40 text-paper/50 uppercase figure text-[11px]">
              <tr>
                <th className="px-5 py-3">Instrument</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3 text-right">Units</th>
                <th className="px-5 py-3 text-right">Valuation (USD)</th>
                <th className="px-5 py-3 text-center">Contracts</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-withheld/40">
              {holdings.map((holding) => (
                <tr key={holding.id} className="hover:bg-ink/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-paper">{holding.instrumentSymbol}</div>
                    <div className="text-[11px] text-paper/50">{holding.name}</div>
                  </td>
                  <td className="px-5 py-3.5 figure text-paper/70">{holding.type}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-paper">
                    <Figure value={holding.units} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-paper">
                    <Figure value={holding.valuationUsdc} unit="USDC" />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      title="This balance is a set of Daml contracts. Concurrent transfers may compete for the same one."
                      className="figure inline-block bg-ink/80 border border-withheld px-2 py-0.5 text-[11px] text-paper/80 cursor-help"
                    >
                      {holding.contractCount}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <StatePill state={holding.state} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-withheld px-5 py-3 bg-ink/30 flex items-center justify-between text-xs text-paper/50 figure">
          <span>Showing {holdings.length} asset holdings</span>
          <span>Settlement standard: Canton Daml Token Standard (DvP)</span>
        </div>
      </div>
    </div>
  );
}
