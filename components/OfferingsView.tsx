"use client";

import { useState } from "react";
import { Offering } from "@/lib/types";
import { StatePill } from "./StatePill";
import { Figure } from "./Figure";
import { PartyId } from "./PartyId";
import {
  Filter,
  Search,
  ArrowUpDown,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Lock,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Layers,
} from "lucide-react";

export function OfferingsView({
  offerings,
  onSelectOffering,
  onStartKyc,
}: {
  offerings: Offering[];
  onSelectOffering: (offering: Offering) => void;
  onStartKyc?: () => void;
}) {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOfferings = offerings.filter((o) => {
    if (filterType !== "all" && o.instrument.kind !== filterType) return false;
    if (filterStatus === "open" && o.status !== "open") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.title.toLowerCase().includes(q) ||
        o.subtitle.toLowerCase().includes(q) ||
        o.instrument.symbol.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-withheld pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-paper">Market Offerings</h1>
            <span className="figure text-[10px] text-brand bg-brand/10 border border-brand/25 px-2 py-0.5 uppercase tracking-wider">
              Canton Syndications
            </span>
          </div>
          <p className="text-xs text-paper/65 mt-1">
            Institutional grade instruments and syndications settled atomically on private Canton ledger.
          </p>
        </div>

        {/* Filter Controls matching screenshot */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-paper/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search SYMBOL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141722] border border-withheld pl-8 pr-3 py-1.5 text-xs text-paper placeholder:text-paper/35 focus:outline-none focus:border-brand"
            />
          </div>

          {/* Instrument Kind Filter */}
          <div className="border border-withheld bg-[#141722] px-2.5 py-1.5 text-xs figure text-paper/70">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-paper focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-[#141722] text-paper">All Instruments</option>
              <option value="equity" className="bg-[#141722] text-paper">Tokenized Equity</option>
              <option value="fund_unit" className="bg-[#141722] text-paper">Fund Units</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="border border-withheld bg-[#141722] px-2.5 py-1.5 text-xs figure text-paper/70">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-paper focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-[#141722] text-paper">Status: All</option>
              <option value="open" className="bg-[#141722] text-paper">Status: Open</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Institutional Offering Cards matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredOfferings.map((offering) => {
          const filledUnits = offering.totalUnits - offering.unitsRemaining;
          const progress = Math.min(100, Math.round((filledUnits / offering.totalUnits) * 100));
          const isEligible = offering.requiredTier !== "Tier 3 Institutional";
          const isClosingSoon = offering.closingDate.includes("May") || offering.closingDate.includes("Jun");

          return (
            <div
              key={offering.id}
              className="border border-withheld bg-[#0e1017] hover:border-brand/50 transition-all p-6 flex flex-col justify-between space-y-5 group relative overflow-hidden"
            >
              {/* Subtle hover gradient indicator */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-brand transition-colors" />

              <div className="space-y-3.5">
                {/* Header Tag + Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="border border-withheld bg-[#141722] px-2.5 py-1 text-[11px] font-mono font-bold text-paper">
                    {offering.instrument.symbol}
                  </div>

                  {isEligible ? (
                    <span className="figure text-[10px] font-semibold uppercase tracking-wider text-settled bg-settled/10 border border-settled/30 px-2 py-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Eligible
                    </span>
                  ) : (
                    <span className="figure text-[10px] font-semibold uppercase tracking-wider text-pending bg-pending/10 border border-pending/30 px-2 py-0.5 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Verification Req
                    </span>
                  )}
                </div>

                {/* Offering Title & Description */}
                <div>
                  <h3 className="font-display text-lg font-bold text-paper group-hover:text-brand transition-colors">
                    {offering.title}
                  </h3>
                  <p className="text-xs text-paper/70 mt-1 leading-relaxed line-clamp-2">
                    {offering.description}
                  </p>
                </div>

                {/* Stats Matrix */}
                <div className="grid grid-cols-2 gap-3 bg-[#131620] p-3.5 border border-withheld/60 text-xs">
                  <div>
                    <span className="text-[10px] figure uppercase tracking-wider text-paper/50 block">
                      PRICE / UNIT
                    </span>
                    <span className="font-mono font-bold text-paper text-sm">
                      ${offering.pricePerUnit.toFixed(2)} USDC
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] figure uppercase tracking-wider text-paper/50 block">
                      CLOSE DATE
                    </span>
                    <span className="font-mono text-paper/90 text-xs flex items-center gap-1 mt-0.5">
                      {isClosingSoon && <Clock className="w-3 h-3 text-pending inline" />}
                      {offering.closingDate}
                    </span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] figure">
                    <span className="text-paper/50">CAPACITY</span>
                    <span className="text-paper/80 font-mono font-medium">
                      {offering.unitsRemaining.toLocaleString()} / {offering.totalUnits.toLocaleString()} Units Remaining
                    </span>
                  </div>
                  <div className="w-full bg-withheld/80 h-1.5">
                    <div
                      className={`h-1.5 transition-all ${
                        progress > 75 ? "bg-pending" : "bg-[#D4BBFF]"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {isEligible ? (
                  <button
                    type="button"
                    onClick={() => onSelectOffering(offering)}
                    className="w-full bg-[#D4BBFF] hover:bg-[#c4a5f8] text-[#151226] font-semibold text-xs py-2.5 px-4 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>View Offering Documents & Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStartKyc ? onStartKyc() : onSelectOffering(offering)}
                    className="w-full border border-withheld bg-[#141722] hover:bg-[#1a1e2d] text-paper font-semibold text-xs py-2.5 px-4 transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5 text-pending" />
                    <span>Tier 3 Institutional Verification Req</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="border border-withheld bg-[#0e1017] p-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-paper/50 figure">
        <span>Showing {filteredOfferings.length} institutional syndication tranches</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-settled" />
          <span>Atomic delivery vs payment (DvP) enforced by Canton smart contracts</span>
        </span>
      </div>
    </div>
  );
}
