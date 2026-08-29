"use client";
import { useState, useEffect } from "react";
import { Holding, SettlementRecord } from "@/lib/types";
import { Figure } from "./Figure";
import { StatePill } from "./StatePill";
import { PartyId } from "./PartyId";
import { AssetPerformanceChart, HoldingSparkline, TimeframeOption } from "./AssetPerformanceChart";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Check,
  Clock,
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  Layers,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

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
  const [navTimeframe, setNavTimeframe] = useState<TimeframeOption>("30d");
  const [activeAssetTab, setActiveAssetTab] = useState<string>("all-comparative");
  const [expandedHoldingId, setExpandedHoldingId] = useState<string | null>(null);
  const [performanceViewMode, setPerformanceViewMode] = useState<"focused" | "grid">("focused");
  const [chartStyle, setChartStyle] = useState<"area" | "line">("area");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculations
  const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.valuationUsdc, 0);
  const investedHoldingsValue = holdings
    .filter((h) => h.type !== "Stablecoin")
    .reduce((sum, h) => sum + h.valuationUsdc, 0);
  const settledThisMonth = 1250000.0;

  const inFlightSettlements = settlements.filter(
    (s) => s.state === "pending_acceptance"
  );

  // Colors mapping per holding
  const getAssetColor = (holding: Holding) => {
    if (holding.type === "Stablecoin") return "#46A88C"; // Settled green/teal
    if (holding.instrumentSymbol.includes("AURORA")) return "#6D3AF2"; // Brand purple
    if (holding.instrumentSymbol.includes("ORION")) return "#A855F7"; // Violet
    if (holding.instrumentSymbol.includes("NOVA")) return "#38BDF8"; // Sky blue
    if (holding.instrumentSymbol.includes("LYRA")) return "#F43F5E"; // Rose
    return "#EAB308";
  };

  // Generate aggregate portfolio NAV data series based on navTimeframe
  const getPortfolioNavData = (tf: TimeframeOption) => {
    if (tf === "7d") {
      return [
        { date: "May 02", val: 5120000, change: "+0.4%" },
        { date: "May 03", val: 5142000, change: "+0.8%" },
        { date: "May 04", val: 5165000, change: "+1.3%" },
        { date: "May 05", val: 5180000, change: "+1.6%" },
        { date: "May 06", val: 5198000, change: "+1.9%" },
        { date: "May 07", val: 5214000, change: "+2.2%" },
        { date: "May 08", val: 5231945, change: "+2.6%" },
      ];
    }
    if (tf === "30d") {
      return [
        { date: "Apr 09", val: 4850000, change: "0.0%" },
        { date: "Apr 12", val: 4890000, change: "+0.8%" },
        { date: "Apr 15", val: 4910000, change: "+1.2%" },
        { date: "Apr 18", val: 4970000, change: "+2.5%" },
        { date: "Apr 21", val: 5020000, change: "+3.5%" },
        { date: "Apr 24", val: 5048000, change: "+4.1%" },
        { date: "Apr 27", val: 5090000, change: "+4.9%" },
        { date: "Apr 30", val: 5131000, change: "+5.8%" },
        { date: "May 03", val: 5165000, change: "+6.5%" },
        { date: "May 06", val: 5198000, change: "+7.2%" },
        { date: "May 08", val: 5231945, change: "+7.87%" },
      ];
    }
    if (tf === "90d") {
      return [
        { date: "Feb 08", val: 4320000, change: "0.0%" },
        { date: "Feb 22", val: 4450000, change: "+3.0%" },
        { date: "Mar 08", val: 4610000, change: "+6.7%" },
        { date: "Mar 22", val: 4740000, change: "+9.7%" },
        { date: "Apr 05", val: 4880000, change: "+13.0%" },
        { date: "Apr 20", val: 5060000, change: "+17.1%" },
        { date: "May 08", val: 5231945, change: "+21.1%" },
      ];
    }
    return [
      { date: "May 25", val: 3600000, change: "0.0%" },
      { date: "Jul 25", val: 3850000, change: "+6.9%" },
      { date: "Sep 25", val: 4120000, change: "+14.4%" },
      { date: "Nov 25", val: 4410000, change: "+22.5%" },
      { date: "Jan 26", val: 4720000, change: "+31.1%" },
      { date: "Mar 26", val: 4980000, change: "+38.3%" },
      { date: "May 26", val: 5231945, change: "+45.3%" },
    ];
  };

  const navData = getPortfolioNavData(navTimeframe);
  const minNav = Math.min(...navData.map((d) => d.val));
  const maxNav = Math.max(...navData.map((d) => d.val));

  // Build comparative performance dataset for all holding assets
  const buildComparativeData = (tf: TimeframeOption) => {
    // Collect dates from the first available holding
    const sampleSeries = holdings[0]?.historicalPerformance?.[tf] || [];
    return sampleSeries.map((point, index) => {
      const entry: Record<string, any> = {
        date: point.date,
      };
      holdings.forEach((h) => {
        const series = h.historicalPerformance?.[tf];
        if (series && series[index]) {
          entry[h.instrumentSymbol] = series[index].changePct;
        } else {
          entry[h.instrumentSymbol] = 0;
        }
      });
      return entry;
    });
  };

  const comparativeData = buildComparativeData(navTimeframe);
  const selectedHolding = holdings.find((h) => h.id === activeAssetTab || h.instrumentSymbol === activeAssetTab);

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
            Across {holdings.filter((h) => h.type !== "Stablecoin").length} equity & fund tranches
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

      {/* =========================================================================
          SECTION 1: Portfolio NAV Trajectory (Recharts Interactive Area Chart)
          ========================================================================= */}
      <div className="border border-withheld bg-slate p-6">
        <div className="flex items-center justify-between border-b border-withheld pb-4 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold text-paper">Portfolio NAV Trajectory</span>
              <span className="figure text-[11px] px-2 py-0.5 border border-brand/40 bg-brand/10 text-brand">
                Continuous Daml Mark
              </span>
            </div>
            <p className="text-xs text-paper/60 mt-0.5">
              Aggregate mark-to-market valuation across all settled Canton allocations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-withheld p-0.5 text-xs figure bg-ink/50">
              {(["7d", "30d", "90d", "1y"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNavTimeframe(t)}
                  className={`px-3 py-1 text-xs transition-colors ${
                    navTimeframe === t ? "bg-brand text-paper font-medium" : "text-paper/60 hover:text-paper"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Recharts NAV Area Chart */}
        <div className="mt-6">
          <div className="w-full bg-ink/40 border border-withheld/50 p-4 min-h-[220px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={navData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6D3AF2" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6D3AF2" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--withheld)" opacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: "var(--withheld)" }}
                    tick={{ fill: "rgba(236, 237, 242, 0.5)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                    dy={6}
                  />
                  <YAxis
                    domain={[Math.floor(minNav * 0.98), Math.ceil(maxNav * 1.02)]}
                    tickFormatter={(v) => `$${(v / 1000000).toFixed(2)}M`}
                    tickLine={false}
                    axisLine={{ stroke: "var(--withheld)" }}
                    tick={{ fill: "rgba(236, 237, 242, 0.5)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                    width={70}
                    dx={-4}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-ink border border-withheld p-3 shadow-2xl text-xs figure min-w-[190px]">
                          <div className="text-[11px] font-semibold text-paper border-b border-withheld/60 pb-1 mb-2">
                            {data.date}
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-paper/60">Portfolio NAV:</span>
                              <span className="font-bold text-paper">${data.val.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-paper/60">Period Growth:</span>
                              <span className="text-settled font-semibold">{data.change}</span>
                            </div>
                          </div>
                          <div className="mt-2 pt-1 border-t border-withheld/40 text-[10px] text-paper/40">
                            Canton Ledger Verified
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#6D3AF2"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#navGradient)"
                    activeDot={{ r: 6, fill: "#6D3AF2", stroke: "#0B0D14", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-paper/40 figure">
                Loading NAV Trajectory Engine...
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 text-[11px] figure text-paper/50 mt-3 pt-3 border-t border-withheld/40">
            <div>
              <span className="text-paper/40 block text-[10px]">PERIOD START</span>
              <span className="font-medium text-paper">${navData[0]?.val.toLocaleString()}</span>
            </div>
            <div className="text-center">
              <span className="text-paper/40 block text-[10px]">PERIOD HIGH</span>
              <span className="font-medium text-paper">${maxNav.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-paper/40 block text-[10px]">CURRENT MARK</span>
              <span className="font-medium text-settled">${navData[navData.length - 1]?.val.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: Historical Performance Line Charts for Each Holding Asset
          ========================================================================= */}
      <div className="border border-withheld bg-slate p-6">
        <div className="flex items-center justify-between border-b border-withheld pb-4 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand" />
              <h2 className="font-display text-base font-bold text-paper">
                Asset Historical Performance
              </h2>
            </div>
            <p className="text-xs text-paper/60 mt-0.5">
              Interactive Recharts performance lines and mark-to-market trajectory for each holding asset
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-withheld p-0.5 text-xs figure bg-ink/50">
              <button
                type="button"
                onClick={() => setPerformanceViewMode("focused")}
                className={`px-3 py-1 text-xs transition-colors flex items-center gap-1.5 ${
                  performanceViewMode === "focused" ? "bg-brand text-paper font-medium" : "text-paper/60 hover:text-paper"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Focused Inspector
              </button>
              <button
                type="button"
                onClick={() => setPerformanceViewMode("grid")}
                className={`px-3 py-1 text-xs transition-colors flex items-center gap-1.5 ${
                  performanceViewMode === "grid" ? "bg-brand text-paper font-medium" : "text-paper/60 hover:text-paper"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                All Asset Cards ({holdings.length})
              </button>
            </div>
          </div>
        </div>

        {/* View Mode 1: Focused Inspector (Tabbed Asset Switcher + Comparative Mode) */}
        {performanceViewMode === "focused" && (
          <div className="mt-5 space-y-6">
            {/* Asset Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-withheld/60 figure text-xs">
              <button
                type="button"
                onClick={() => setActiveAssetTab("all-comparative")}
                className={`px-3.5 py-1.5 whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  activeAssetTab === "all-comparative"
                    ? "bg-brand text-paper border-brand font-semibold shadow-sm"
                    : "bg-ink/50 text-paper/70 border-withheld hover:text-paper hover:bg-ink"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Comparative Trajectory (All Assets %)
              </button>

              {holdings.map((h) => {
                const isSelected = activeAssetTab === h.id || activeAssetTab === h.instrumentSymbol;
                const stroke = getAssetColor(h);
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setActiveAssetTab(h.id)}
                    className={`px-3.5 py-1.5 whitespace-nowrap transition-all flex items-center gap-2 border ${
                      isSelected
                        ? "bg-ink text-paper border-paper/40 font-semibold"
                        : "bg-ink/50 text-paper/70 border-withheld hover:text-paper hover:bg-ink"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stroke }} />
                    <span>{h.instrumentSymbol}</span>
                    <span className="text-[10px] text-paper/50">({h.type})</span>
                  </button>
                );
              })}
            </div>

            {/* If Comparative View is Active */}
            {activeAssetTab === "all-comparative" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-display text-sm font-semibold text-paper">
                      Normalized Historical Return (%) Across All Holdings
                    </span>
                    <p className="text-[11px] text-paper/60">
                      Comparing relative percentage performance from period baseline
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 border border-withheld p-0.5 text-xs figure bg-ink/60">
                      {(["7d", "30d", "90d", "1y"] as const).map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => setNavTimeframe(tf)}
                          className={`px-2.5 py-0.5 text-[11px] transition-colors ${
                            navTimeframe === tf ? "bg-brand text-paper font-medium" : "text-paper/60 hover:text-paper"
                          }`}
                        >
                          {tf.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comparative Recharts Multi-Line Chart */}
                <div className="w-full bg-ink/50 border border-withheld/60 p-4 min-h-[260px]">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={comparativeData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--withheld)" opacity={0.5} vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={{ stroke: "var(--withheld)" }}
                          tick={{ fill: "rgba(236, 237, 242, 0.45)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                          dy={6}
                        />
                        <YAxis
                          tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
                          tickLine={false}
                          axisLine={{ stroke: "var(--withheld)" }}
                          tick={{ fill: "rgba(236, 237, 242, 0.45)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                          width={55}
                          dx={-4}
                        />
                        <ReferenceLine y={0} stroke="rgba(236, 237, 242, 0.3)" strokeDasharray="3 3" />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null;
                            return (
                              <div className="bg-ink border border-withheld p-3 shadow-2xl text-xs figure min-w-[220px]">
                                <div className="font-semibold text-paper border-b border-withheld/60 pb-1 mb-2 text-[11px]">
                                  {label} — Relative Return
                                </div>
                                <div className="space-y-1.5">
                                  {payload.map((item: any) => (
                                    <div key={item.dataKey} className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-paper/70 text-[11px]">{item.dataKey}:</span>
                                      </div>
                                      <span
                                        className={`font-semibold text-[11px] ${
                                          Number(item.value) >= 0 ? "text-settled" : "text-pending"
                                        }`}
                                      >
                                        {Number(item.value) >= 0 ? "+" : ""}
                                        {Number(item.value).toFixed(2)}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            paddingTop: 14,
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                          }}
                        />
                        {holdings.map((h) => (
                          <Line
                            key={h.id}
                            type="monotone"
                            dataKey={h.instrumentSymbol}
                            name={h.instrumentSymbol}
                            stroke={getAssetColor(h)}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 2, stroke: "#0B0D14" }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </div>
            ) : selectedHolding ? (
              /* Specific Selected Holding Asset Performance Chart */
              <div className="space-y-4">
                <AssetPerformanceChart
                  holding={selectedHolding}
                  color={getAssetColor(selectedHolding)}
                  chartHeight={260}
                  showMetricsStrip={true}
                  showContractInfo={true}
                  chartType={chartStyle}
                />
              </div>
            ) : null}
          </div>
        )}

        {/* View Mode 2: Asset Performance Grid (Shows Line Chart for EVERY Holding Asset side-by-side) */}
        {performanceViewMode === "grid" && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {holdings.map((holding) => (
              <div
                key={holding.id}
                className="border border-withheld bg-ink/40 p-5 flex flex-col justify-between hover:border-paper/30 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getAssetColor(holding) }} />
                        <h3 className="font-display text-sm font-bold text-paper">{holding.instrumentSymbol}</h3>
                      </div>
                      <p className="text-[11px] text-paper/50 mt-0.5">{holding.name}</p>
                    </div>

                    <div className="text-right figure">
                      <div className="text-sm font-bold text-paper">
                        <Figure value={holding.valuationUsdc} unit="USDC" />
                      </div>
                      <span className="text-[10px] text-paper/50">{holding.units.toLocaleString()} units</span>
                    </div>
                  </div>

                  {/* Recharts Chart for this specific holding asset */}
                  <AssetPerformanceChart
                    holding={holding}
                    color={getAssetColor(holding)}
                    chartHeight={180}
                    showMetricsStrip={true}
                    showContractInfo={false}
                    chartType="area"
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-withheld/40 flex items-center justify-between text-xs figure text-paper/60">
                  <span className="text-[11px]">Daml Contracts: {holding.contractCount}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAssetTab(holding.id);
                      setPerformanceViewMode("focused");
                    }}
                    className="text-brand hover:text-brand/80 text-[11px] flex items-center gap-1"
                  >
                    Open in Inspector →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 3: Holdings Table with Inline Interactive Sparklines & Expandable Drawers
          ========================================================================= */}
      <div className="border border-withheld bg-slate">
        <div className="flex items-center justify-between border-b border-withheld px-5 py-4 flex-wrap gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-paper">Holdings Ledger</h2>
            <p className="text-xs text-paper/60 mt-0.5">
              Daml contract sets holding tokenised units & stablecoin with live 30D historical trajectory
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onNavigateToSettlements}
              className="figure text-xs text-brand hover:text-brand/80 transition-colors"
            >
              View all settlements →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-withheld bg-ink/40 text-paper/50 uppercase figure text-[11px]">
              <tr>
                <th className="px-5 py-3">Instrument</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3 text-right">Units</th>
                <th className="px-5 py-3 text-right">Valuation (USD)</th>
                <th className="px-5 py-3 text-center">30D Trajectory</th>
                <th className="px-5 py-3 text-center">Contracts</th>
                <th className="px-5 py-3 text-right">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-withheld/40">
              {holdings.map((holding) => {
                const isExpanded = expandedHoldingId === holding.id;
                const stroke = getAssetColor(holding);
                return (
                  <tr key={holding.id} className="group hover:bg-ink/30 transition-colors">
                    <td colSpan={8} className="p-0">
                      {/* Main Table Row */}
                      <div className="grid grid-cols-12 items-center px-5 py-3.5">
                        <div className="col-span-3">
                          <div className="font-medium text-paper flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stroke }} />
                            {holding.instrumentSymbol}
                          </div>
                          <div className="text-[11px] text-paper/50">{holding.name}</div>
                        </div>

                        <div className="col-span-1 figure text-paper/70">{holding.type}</div>

                        <div className="col-span-2 text-right font-medium text-paper">
                          <Figure value={holding.units} />
                        </div>

                        <div className="col-span-2 text-right font-medium text-paper">
                          <Figure value={holding.valuationUsdc} unit="USDC" />
                        </div>

                        {/* Inline Recharts Mini Sparkline for this holding */}
                        <div className="col-span-2 flex justify-center">
                          <div className="flex flex-col items-center">
                            <HoldingSparkline holding={holding} color={stroke} height={28} width={100} />
                            <span className="text-[9px] figure text-paper/40 mt-0.5">
                              {holding.metrics ? `+${holding.metrics.periodReturnPct}%` : "Stable"}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-1 text-center">
                          <span
                            title="This balance is a set of Daml contracts. Concurrent transfers may compete for the same one."
                            className="figure inline-block bg-ink/80 border border-withheld px-2 py-0.5 text-[11px] text-paper/80 cursor-help"
                          >
                            {holding.contractCount}
                          </span>
                        </div>

                        <div className="col-span-1 text-right flex justify-end">
                          <StatePill state={holding.state} />
                        </div>

                        <div className="col-span-12 lg:col-span-12 flex justify-end mt-2 lg:mt-0">
                          <button
                            type="button"
                            onClick={() => setExpandedHoldingId(isExpanded ? null : holding.id)}
                            className="figure text-[11px] text-paper/60 hover:text-paper border border-withheld/60 px-2.5 py-1 flex items-center gap-1 hover:bg-slate transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                Hide Chart <ChevronUp className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                Expand Chart <ChevronDown className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Historical Performance Chart Drawer for this specific holding */}
                      {isExpanded && (
                        <div className="bg-ink/80 border-t border-b border-withheld p-5 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between mb-4 pb-2 border-b border-withheld/40">
                            <div className="flex items-center gap-2">
                              <LineChartIcon className="w-4 h-4 text-brand" />
                              <span className="font-display text-sm font-semibold text-paper">
                                {holding.instrumentSymbol} — Full Historical Performance Engine
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAssetTab(holding.id);
                                setPerformanceViewMode("focused");
                                window.scrollTo({ top: 400, behavior: "smooth" });
                              }}
                              className="text-brand text-xs hover:underline flex items-center gap-1 figure"
                            >
                              Focus in top inspector <Maximize2 className="w-3 h-3" />
                            </button>
                          </div>

                          <AssetPerformanceChart
                            holding={holding}
                            color={stroke}
                            chartHeight={220}
                            showMetricsStrip={true}
                            showContractInfo={true}
                            chartType="area"
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-withheld px-5 py-3 bg-ink/30 flex items-center justify-between text-xs text-paper/50 figure">
          <span>Showing {holdings.length} asset holdings with active historical performance charts</span>
          <span>Settlement standard: Canton Daml Token Standard (DvP)</span>
        </div>
      </div>
    </div>
  );
}

