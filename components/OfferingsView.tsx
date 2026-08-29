"use client";
import { useState } from "react";
import { Offering } from "@/lib/types";
import { StatePill } from "./StatePill";
import { Figure } from "./Figure";
import { PartyId } from "./PartyId";
import { Filter, Search, ArrowUpDown, ChevronRight } from "lucide-react";

export function OfferingsView({
  offerings,
  onSelectOffering,
}: {
  offerings: Offering[];
  onSelectOffering: (offering: Offering) => void;
}) {
  const [filterType, setFilterType] = useState<"all" | "equity" | "fund_unit">("all");
  const [sortBy, setSortBy] = useState<"newest" | "size">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOfferings = offerings
    .filter((o) => {
      if (filterType !== "all" && o.instrument.kind !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          o.title.toLowerCase().includes(q) ||
          o.subtitle.toLowerCase().includes(q) ||
          o.instrument.symbol.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "size") {
        return b.totalUnits - a.totalUnits;
      }
      return 0; // maintain default order
    });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-withheld pb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-paper">Open Offerings</h2>
          <p className="text-xs text-paper/60 mt-0.5">
            Tokenised private equity and fund unit allocations with atomic Canton settlement
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div className="flex items-center border border-withheld bg-slate p-0.5 text-xs figure">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 transition-colors ${
                filterType === "all" ? "bg-brand text-paper" : "text-paper/60 hover:text-paper"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType("equity")}
              className={`px-3 py-1 transition-colors ${
                filterType === "equity" ? "bg-brand text-paper" : "text-paper/60 hover:text-paper"
              }`}
            >
              Equity
            </button>
            <button
              onClick={() => setFilterType("fund_unit")}
              className={`px-3 py-1 transition-colors ${
                filterType === "fund_unit" ? "bg-brand text-paper" : "text-paper/60 hover:text-paper"
              }`}
            >
              Fund Units
            </button>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 border border-withheld bg-slate px-3 py-1.5 text-xs figure text-paper/70">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "size")}
              className="bg-transparent text-paper focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate text-paper">Sort: Newest</option>
              <option value="size" className="bg-slate text-paper">Sort: Tranche Size</option>
            </select>
          </div>
        </div>
      </div>

      {/* Offerings List / Cards */}
      <div className="space-y-4">
        {filteredOfferings.map((offering) => {
          const progress = Math.round(
            ((offering.totalUnits - offering.unitsRemaining) / offering.totalUnits) * 100
          );

          return (
            <div
              key={offering.id}
              onClick={() => onSelectOffering(offering)}
              className="border border-withheld bg-slate p-6 hover:border-brand/60 transition-all cursor-pointer group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left info */}
                <div className="space-y-2 max-w-[460px]">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg font-bold text-paper group-hover:text-brand transition-colors">
                      {offering.title}
                    </h3>
                    <StatePill state={offering.transferKind === "direct" ? "direct" : "offer"} />
                  </div>
                  <p className="text-xs text-paper/70 leading-relaxed">
                    {offering.subtitle}
                  </p>
                  <div className="flex items-center gap-4 text-xs figure text-paper/50 pt-1">
                    <span>Jurisdiction: <strong className="text-paper">{offering.instrument.jurisdiction}</strong></span>
                    <span>Closing: <strong className="text-paper">{offering.closingDate}</strong></span>
                  </div>
                </div>

                {/* Center metrics */}
                <div className="grid grid-cols-3 gap-6 text-xs bg-ink/30 px-5 py-3 border border-withheld/40">
                  <div>
                    <span className="text-[11px] figure text-paper/50 block">Min. allocation</span>
                    <Figure value={offering.minAllocationUsdc} unit="USDC" className="font-semibold text-paper" />
                  </div>
                  <div>
                    <span className="text-[11px] figure text-paper/50 block">Tranche Size</span>
                    <Figure value={offering.totalUnits} unit="USDC" className="font-semibold text-paper" />
                  </div>
                  <div>
                    <span className="text-[11px] figure text-paper/50 block">Price per unit</span>
                    <Figure value={offering.pricePerUnit} unit="USDC" className="font-semibold text-paper" />
                  </div>
                </div>

                {/* Right action */}
                <div className="flex items-center gap-4 lg:flex-col lg:items-end justify-between">
                  <div className="w-32 lg:w-40">
                    <div className="flex justify-between text-[11px] figure text-paper/50 mb-1">
                      <span>{progress}% filled</span>
                      <span><Figure value={offering.unitsRemaining} /> left</span>
                    </div>
                    <div className="w-full bg-withheld h-1">
                      <div className="bg-brand h-1" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOffering(offering);
                    }}
                    className="bg-brand px-4 py-2 text-xs font-semibold text-paper hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    Subscribe <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border border-withheld bg-slate p-4 flex items-center justify-between text-xs text-paper/50 figure">
        <span>Showing {filteredOfferings.length} of {offerings.length} total offerings</span>
        <span>All subscriptions settled atomically via Daml DvP</span>
      </div>
    </div>
  );
}
