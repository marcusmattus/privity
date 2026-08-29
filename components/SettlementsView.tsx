"use client";
import { useState } from "react";
import { SettlementRecord } from "@/lib/types";
import { StatePill } from "./StatePill";
import { Figure } from "./Figure";
import { PartyId } from "./PartyId";
import { Download, Filter, Search, ChevronRight } from "lucide-react";

export function SettlementsView({
  settlements,
  onSelectSettlement,
  onAcceptSettlement,
}: {
  settlements: SettlementRecord[];
  onSelectSettlement: (settlement: SettlementRecord) => void;
  onAcceptSettlement: (id: string) => void;
}) {
  const [filterState, setFilterState] = useState<"all" | "settled" | "pending" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSettlements = settlements.filter((s) => {
    if (filterState === "settled" && s.state !== "settled") return false;
    if (filterState === "pending" && s.state !== "pending_acceptance") return false;
    if (filterState === "rejected" && s.state !== "rejected") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.instrument.toLowerCase().includes(q) ||
        s.counterparty.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCsv = () => {
    const headers = "Time (UTC),Date,Instrument,Type,Units,Consideration,Currency,Counterparty,Kind,State\n";
    const rows = filteredSettlements
      .map(
        (s) =>
          `"${s.timeUtc}","${s.date}","${s.instrument}","${s.type}",${s.units},${s.consideration},"${s.currency}","${s.counterparty}","${s.kind}","${s.state}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `privity_settlements_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-withheld pb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-paper">Settlements Blotter</h2>
          <p className="text-xs text-paper/60 mt-0.5">
            Full cryptographic audit trail of atomic DvP transfers for your Canton party
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* State Filter */}
          <div className="flex items-center border border-withheld bg-slate p-0.5 text-xs figure">
            {(["all", "settled", "pending", "rejected"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterState(st)}
                className={`px-3 py-1 capitalize transition-colors ${
                  filterState === st ? "bg-brand text-paper" : "text-paper/60 hover:text-paper"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 border border-withheld bg-slate px-3 py-1.5 text-xs figure text-paper/80 hover:text-paper hover:bg-ink transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="border border-withheld bg-slate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-withheld bg-ink/40 text-paper/50 uppercase figure text-[11px]">
              <tr>
                <th className="px-4 py-3">Time (UTC)</th>
                <th className="px-4 py-3">Instrument</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Units</th>
                <th className="px-4 py-3 text-right">Consideration</th>
                <th className="px-4 py-3">Counterparty</th>
                <th className="px-4 py-3 text-center">Kind</th>
                <th className="px-4 py-3 text-center">State</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-withheld/40">
              {filteredSettlements.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => onSelectSettlement(s)}
                  className="hover:bg-ink/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 figure text-paper/80">{s.timeUtc}</td>
                  <td className="px-4 py-3 font-semibold text-paper">{s.instrument}</td>
                  <td className="px-4 py-3 figure text-paper/60">{s.type}</td>
                  <td className="px-4 py-3 text-right font-medium text-paper">
                    <Figure value={s.units} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-paper">
                    <Figure value={s.consideration} unit={s.currency} />
                  </td>
                  <td className="px-4 py-3">
                    <PartyId value={s.counterparty} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="figure uppercase text-[11px] text-paper/60 px-1.5 py-0.5 border border-withheld/50">
                      {s.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatePill state={s.state} />
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {s.state === "pending_acceptance" ? (
                      <button
                        type="button"
                        onClick={() => onAcceptSettlement(s.id)}
                        className="bg-pending text-ink px-2.5 py-1 text-[11px] font-semibold hover:opacity-90 transition-opacity"
                      >
                        Accept
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectSettlement(s)}
                        className="figure text-[11px] text-brand hover:underline"
                      >
                        Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-withheld px-4 py-3 bg-ink/30 flex items-center justify-between text-xs text-paper/50 figure">
          <span>Showing {filteredSettlements.length} of {settlements.length} transactions</span>
          <span>Canton synchronous transaction confirmations</span>
        </div>
      </div>
    </div>
  );
}
