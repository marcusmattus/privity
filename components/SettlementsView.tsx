"use client";

import { useState } from "react";
import { SettlementRecord } from "@/lib/types";
import { StatePill } from "./StatePill";
import { Figure } from "./Figure";
import { PartyId } from "./PartyId";
import {
  Download,
  Filter,
  Search,
  ChevronRight,
  ShieldCheck,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Calendar,
} from "lucide-react";

export function SettlementsView({
  settlements,
  onSelectSettlement,
  onAcceptSettlement,
}: {
  settlements: SettlementRecord[];
  onSelectSettlement: (settlement: SettlementRecord) => void;
  onAcceptSettlement: (id: string) => void;
}) {
  const [filterState, setFilterState] = useState<string>("all");
  const [instrumentFilter, setInstrumentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const instrumentsList = Array.from(new Set(settlements.map((s) => s.instrument)));

  const filteredSettlements = settlements.filter((s) => {
    if (filterState === "settled" && s.state !== "settled") return false;
    if (filterState === "pending" && s.state !== "pending_acceptance") return false;
    if (filterState === "rejected" && s.state !== "rejected") return false;
    if (instrumentFilter !== "all" && s.instrument !== instrumentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.instrument.toLowerCase().includes(q) ||
        s.counterparty.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
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

  const pendingOffers = filteredSettlements.filter((s) => s.state === "pending_acceptance");

  return (
    <div className="space-y-6">
      {/* Header & Controls matching screenshot */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-withheld pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-paper">Settlements Blotter</h1>
            <span className="figure text-[10px] text-settled bg-settled/10 border border-settled/25 px-2 py-0.5 uppercase tracking-wider">
              Immutable Ledger Audit Trail
            </span>
          </div>
          <p className="text-xs text-paper/65 mt-1">
            Immutable audit trail of all settled, pending, and withheld obligations. Data density optimized for forensic review.
          </p>
        </div>

        {/* Export CSV Action */}
        <button
          type="button"
          onClick={handleExportCsv}
          className="self-start lg:self-auto flex items-center gap-2 border border-withheld bg-[#141722] hover:bg-[#1a1e2d] px-4 py-2 text-xs font-semibold figure text-paper transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-brand" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Row matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* State Filter */}
        <div className="border border-withheld bg-[#0e1017] p-2.5 space-y-1">
          <label className="text-[10px] figure uppercase tracking-wider text-paper/50 block">STATE</label>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="w-full bg-transparent text-xs text-paper font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#0e1017] text-paper">All States</option>
            <option value="settled" className="bg-[#0e1017] text-paper">Settled</option>
            <option value="pending" className="bg-[#0e1017] text-paper">Pending Acceptance</option>
            <option value="rejected" className="bg-[#0e1017] text-paper">Rejected / Aborted</option>
          </select>
        </div>

        {/* Instrument Filter */}
        <div className="border border-withheld bg-[#0e1017] p-2.5 space-y-1">
          <label className="text-[10px] figure uppercase tracking-wider text-paper/50 block">INSTRUMENT</label>
          <select
            value={instrumentFilter}
            onChange={(e) => setInstrumentFilter(e.target.value)}
            className="w-full bg-transparent text-xs text-paper font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#0e1017] text-paper">All Instruments</option>
            {instrumentsList.map((inst) => (
              <option key={inst} value={inst} className="bg-[#0e1017] text-paper">
                {inst}
              </option>
            ))}
          </select>
        </div>

        {/* Search Filter */}
        <div className="border border-withheld bg-[#0e1017] p-2.5 space-y-1">
          <label className="text-[10px] figure uppercase tracking-wider text-paper/50 block">SEARCH RECORD</label>
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-paper/40" />
            <input
              type="text"
              placeholder="Party, Instrument, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-paper placeholder:text-paper/30 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Pending Banner Alert if any pending offer */}
      {pendingOffers.length > 0 && (
        <div className="border border-pending/40 bg-pending/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-pending flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-paper block">
                {pendingOffers.length} Inbound Transfer Instruction{pendingOffers.length > 1 ? "s" : ""} Awaiting Acceptance
              </span>
              <p className="text-[11px] text-paper/70">
                The receiver node has not accepted. No balance has moved on the Canton synchronizer.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAcceptSettlement(pendingOffers[0].id)}
            className="bg-[#D4BBFF] hover:bg-[#c4a5f8] text-[#151226] text-xs font-bold px-4 py-2 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Accept Inbound Obligation</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Settlements Ledger Table */}
      <div className="border border-withheld bg-[#0e1017] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-withheld bg-[#141722] text-paper/60 uppercase figure text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">TIME (UTC)</th>
                <th className="px-4 py-3.5">INSTRUMENT</th>
                <th className="px-4 py-3.5">TYPE</th>
                <th className="px-4 py-3.5 text-right">UNITS</th>
                <th className="px-4 py-3.5 text-right">CONSIDERATION</th>
                <th className="px-4 py-3.5">COUNTERPARTY</th>
                <th className="px-4 py-3.5 text-center">KIND</th>
                <th className="px-4 py-3.5 text-center">STATE</th>
                <th className="px-4 py-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-withheld/40">
              {filteredSettlements.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => onSelectSettlement(s)}
                  className="hover:bg-[#141722]/60 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3.5 figure font-mono text-paper/85">{s.timeUtc}</td>
                  <td className="px-4 py-3.5 font-bold text-paper font-mono">{s.instrument}</td>
                  <td className="px-4 py-3.5 figure text-paper/60">{s.type}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-medium text-paper">
                    <Figure value={s.units} />
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-paper">
                    <Figure value={s.consideration} unit={s.currency} />
                  </td>
                  <td className="px-4 py-3.5">
                    <PartyId value={s.counterparty} />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="figure uppercase text-[10px] text-paper/70 px-2 py-0.5 border border-withheld bg-[#141722]">
                      {s.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatePill state={s.state} />
                  </td>
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    {s.state === "pending_acceptance" ? (
                      <button
                        type="button"
                        onClick={() => onAcceptSettlement(s.id)}
                        className="bg-pending text-ink px-3 py-1 text-[11px] font-bold hover:opacity-90 transition-opacity"
                      >
                        Accept
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectSettlement(s)}
                        className="figure text-[11px] text-brand hover:underline font-medium"
                      >
                        Audit Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info matching screenshot */}
        <div className="border-t border-withheld px-4 py-3 bg-[#141722] flex items-center justify-between text-xs text-paper/50 figure">
          <span>Showing 1-{filteredSettlements.length} of 2,491 records on Canton</span>
          <div className="flex items-center gap-2">
            <span className="text-paper/40">Synchronous Daml validator confirmations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
