"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { Holding, PerformanceDataPoint } from "@/lib/types";
import { Figure } from "./Figure";
import { TrendingUp, TrendingDown, Activity, ShieldCheck, Layers, Info } from "lucide-react";

export type TimeframeOption = "7d" | "30d" | "90d" | "1y";

interface AssetPerformanceChartProps {
  holding: Holding;
  initialTimeframe?: TimeframeOption;
  color?: string;
  chartHeight?: number;
  showMetricsStrip?: boolean;
  showContractInfo?: boolean;
  chartType?: "line" | "area";
}

// Custom Tooltip component matching institutional dark aesthetic
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PerformanceDataPoint;
    value: number;
  }>;
  label?: string;
  holding: Holding;
}

function CustomTooltip({ active, payload, holding }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const isPositive = data.changePct >= 0;

  return (
    <div className="bg-ink border border-withheld p-3 shadow-2xl text-xs figure min-w-[200px]">
      <div className="flex items-center justify-between border-b border-withheld/60 pb-2 mb-2">
        <span className="font-semibold text-paper text-[11px]">{data.date}</span>
        <span className="text-[10px] text-paper/50 uppercase tracking-wider">Canton Mark</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-paper/60 text-[11px]">Mark Price:</span>
          <span className="font-bold text-paper text-[12px]">${data.unitPrice.toFixed(4)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-paper/60 text-[11px]">Holding Value:</span>
          <span className="font-bold text-paper text-[12px]">
            <Figure value={data.holdingValue} unit="USDC" />
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-paper/60 text-[11px]">Trajectory Gain:</span>
          <span className={`font-semibold text-[11px] flex items-center gap-0.5 ${isPositive ? "text-settled" : "text-pending"}`}>
            {isPositive ? "+" : ""}
            {data.changePct}%
          </span>
        </div>

        {data.volumeUsdc ? (
          <div className="flex items-center justify-between pt-1 border-t border-withheld/40 text-[10px] text-paper/50">
            <span>24h Settled DvP Vol:</span>
            <span>${data.volumeUsdc.toLocaleString()} USDC</span>
          </div>
        ) : null}
      </div>

      <div className="mt-2 pt-1.5 border-t border-withheld/40 flex items-center justify-between text-[9px] text-paper/40">
        <span>{holding.instrumentSymbol}</span>
        <span className="text-settled">● Live Daml Valuation</span>
      </div>
    </div>
  );
}

export function AssetPerformanceChart({
  holding,
  initialTimeframe = "30d",
  color,
  chartHeight = 220,
  showMetricsStrip = true,
  showContractInfo = true,
  chartType = "area",
}: AssetPerformanceChartProps) {
  const [timeframe, setTimeframe] = useState<TimeframeOption>(initialTimeframe);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine stroke/fill color based on instrument type or state
  const strokeColor =
    color ||
    (holding.type === "Stablecoin"
      ? "#46A88C"
      : holding.instrumentSymbol.includes("AURORA")
      ? "#6D3AF2"
      : holding.instrumentSymbol.includes("ORION")
      ? "#8B5CF6"
      : holding.instrumentSymbol.includes("NOVA")
      ? "#38BDF8"
      : "#EC4899");

  const performanceData: PerformanceDataPoint[] =
    holding.historicalPerformance?.[timeframe] || [
      {
        date: "Start",
        timestamp: "2026-05-01T00:00:00Z",
        unitPrice: 1.0,
        holdingValue: holding.valuationUsdc * 0.9,
        changePct: 0,
      },
      {
        date: "Now",
        timestamp: "2026-05-08T00:00:00Z",
        unitPrice: 1.0,
        holdingValue: holding.valuationUsdc,
        changePct: 10,
      },
    ];

  // Calculate high/low for current timeframe
  const minVal = Math.min(...performanceData.map((d) => d.holdingValue));
  const maxVal = Math.max(...performanceData.map((d) => d.holdingValue));
  const startVal = performanceData[0]?.holdingValue || 1;
  const endVal = performanceData[performanceData.length - 1]?.holdingValue || 1;
  const periodReturn = startVal > 0 ? ((endVal - startVal) / startVal) * 100 : 0;
  const isPositiveReturn = periodReturn >= 0;

  // Format y-axis ticks compactly
  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  const gradientId = `gradient-${holding.id}-${timeframe}`;

  return (
    <div className="w-full">
      {/* Timeframe selector header & quick stats */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-3">
          <span className="figure text-xs font-semibold text-paper flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: strokeColor }} />
            {holding.instrumentSymbol} Mark Valuation
          </span>
          <span
            className={`figure text-xs px-2 py-0.5 border ${
              isPositiveReturn
                ? "text-settled border-settled/30 bg-settled/10"
                : "text-pending border-pending/30 bg-pending/10"
            }`}
          >
            {isPositiveReturn ? "+" : ""}
            {periodReturn.toFixed(2)}% ({timeframe.toUpperCase()})
          </span>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 border border-withheld p-0.5 text-xs figure bg-ink/60">
          {(["7d", "30d", "90d", "1y"] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-0.5 text-[11px] transition-colors ${
                timeframe === tf
                  ? "bg-brand text-paper font-medium"
                  : "text-paper/60 hover:text-paper hover:bg-slate"
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Recharts Container */}
      <div
        className="w-full relative bg-ink/50 border border-withheld/60 p-3"
        style={{ minHeight: chartHeight }}
      >
        {mounted ? (
          <ResponsiveContainer width="100%" height={chartHeight}>
            {chartType === "area" ? (
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--withheld)" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "var(--withheld)" }}
                  tick={{ fill: "rgba(236, 237, 242, 0.45)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  dy={6}
                />
                <YAxis
                  domain={[Math.floor(minVal * 0.96), Math.ceil(maxVal * 1.04)]}
                  tickFormatter={formatYAxis}
                  tickLine={false}
                  axisLine={{ stroke: "var(--withheld)" }}
                  tick={{ fill: "rgba(236, 237, 242, 0.45)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  width={55}
                  dx={-4}
                />
                <Tooltip content={<CustomTooltip holding={holding} />} />
                <ReferenceLine
                  y={holding.metrics?.costBasisUsdc || startVal}
                  stroke="rgba(236, 237, 242, 0.25)"
                  strokeDasharray="4 4"
                  label={{
                    value: "Cost Basis",
                    fill: "rgba(236, 237, 242, 0.4)",
                    fontSize: 9,
                    position: "insideTopRight",
                    fontFamily: "var(--font-mono)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="holdingValue"
                  stroke={strokeColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${gradientId})`}
                  activeDot={{
                    r: 5,
                    fill: strokeColor,
                    stroke: "#0B0D14",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            ) : (
              <LineChart data={performanceData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--withheld)" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "var(--withheld)" }}
                  tick={{ fill: "rgba(236, 237, 242, 0.45)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  dy={6}
                />
                <YAxis
                  domain={[Math.floor(minVal * 0.96), Math.ceil(maxVal * 1.04)]}
                  tickFormatter={formatYAxis}
                  tickLine={false}
                  axisLine={{ stroke: "var(--withheld)" }}
                  tick={{ fill: "rgba(236, 237, 242, 0.45)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  width={55}
                  dx={-4}
                />
                <Tooltip content={<CustomTooltip holding={holding} />} />
                <ReferenceLine
                  y={holding.metrics?.costBasisUsdc || startVal}
                  stroke="rgba(236, 237, 242, 0.25)"
                  strokeDasharray="4 4"
                  label={{
                    value: "Cost Basis",
                    fill: "rgba(236, 237, 242, 0.4)",
                    fontSize: 9,
                    position: "insideTopRight",
                    fontFamily: "var(--font-mono)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="holdingValue"
                  stroke={strokeColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: strokeColor,
                    stroke: "#0B0D14",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center text-xs text-paper/40 figure" style={{ height: chartHeight }}>
            Initializing Recharts engine...
          </div>
        )}
      </div>

      {/* Metrics Strip */}
      {showMetricsStrip && holding.metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-withheld/60 text-xs figure">
          <div className="bg-ink/60 border border-withheld/40 p-2">
            <span className="text-[10px] text-paper/50 uppercase block">Cost Basis</span>
            <span className="font-semibold text-paper">
              <Figure value={holding.metrics.costBasisUsdc} unit="USDC" />
            </span>
          </div>

          <div className="bg-ink/60 border border-withheld/40 p-2">
            <span className="text-[10px] text-paper/50 uppercase block">Unrealized Gain</span>
            <span className={`font-semibold flex items-center gap-1 ${holding.metrics.unrealizedGainPct >= 0 ? "text-settled" : "text-pending"}`}>
              {holding.metrics.unrealizedGainPct >= 0 ? "+" : ""}
              <Figure value={holding.metrics.unrealizedGainUsdc} unit="USDC" /> ({holding.metrics.unrealizedGainPct}%)
            </span>
          </div>

          <div className="bg-ink/60 border border-withheld/40 p-2">
            <span className="text-[10px] text-paper/50 uppercase block">52W Range (Unit)</span>
            <span className="font-medium text-paper text-[11px]">
              ${holding.metrics.low52w.toFixed(2)} — ${holding.metrics.high52w.toFixed(2)}
            </span>
          </div>

          <div className="bg-ink/60 border border-withheld/40 p-2">
            <span className="text-[10px] text-paper/50 uppercase block">Vol / Sharpe Ratio</span>
            <span className="font-medium text-paper text-[11px]">
              {holding.metrics.annualizedVolatilityPct}% / {holding.metrics.sharpeRatio}
            </span>
          </div>
        </div>
      )}

      {/* Contract & Canton Privacy Details */}
      {showContractInfo && (
        <div className="mt-3 flex items-center justify-between text-[11px] text-paper/50 figure border border-withheld/40 bg-ink/30 px-3 py-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-settled" />
            Daml Active Contract Sets: {holding.contractCount} UTXO-equivalent contracts
          </span>
          <span className="text-paper/40 hidden sm:inline">
            Latest Mark: {holding.metrics?.lastMarkDate || "Continuous Canton Sync"}
          </span>
        </div>
      )}
    </div>
  );
}

// Mini Sparkline component for inline table rendering
export function HoldingSparkline({
  holding,
  height = 36,
  width = 110,
  color,
}: {
  holding: Holding;
  height?: number;
  width?: number;
  color?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const data = holding.historicalPerformance?.["30d"] || [
    { holdingValue: 100 },
    { holdingValue: 105 },
    { holdingValue: 112 },
  ];

  const strokeColor =
    color ||
    (holding.type === "Stablecoin"
      ? "#46A88C"
      : holding.instrumentSymbol.includes("AURORA")
      ? "#6D3AF2"
      : holding.instrumentSymbol.includes("ORION")
      ? "#8B5CF6"
      : holding.instrumentSymbol.includes("NOVA")
      ? "#38BDF8"
      : "#EC4899");

  if (!mounted) {
    return <div style={{ height, width }} className="bg-ink/40 animate-pulse border border-withheld/30" />;
  }

  return (
    <div style={{ height, width }} className="relative flex items-center">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="holdingValue"
            stroke={strokeColor}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
