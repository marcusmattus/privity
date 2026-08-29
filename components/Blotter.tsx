"use client";
import { useEffect, useState } from "react";
import { WithheldBlock } from "./WithheldBlock";
import { StatePill } from "./StatePill";

/**
 * The signature element.
 *
 * Twelve rows. Eleven withheld, one yours. The column HEADERS stay legible —
 * the shape of the data is visible, the data is not. This is the product
 * thesis rendered as a component, not an illustration of it.
 */

type Row =
  | { kind: "withheld"; time: string; widths: [string, string, string, string] }
  | {
      kind: "yours";
      time: string;
      instrument: string;
      units: string;
      consideration: string;
      counterparty: string;
    };

const ROWS: Row[] = [
  { kind: "withheld", time: "14:32:12", widths: ["55%", "40%", "65%", "60%"] },
  { kind: "withheld", time: "14:32:09", widths: ["40%", "55%", "50%", "75%"] },
  { kind: "withheld", time: "14:32:07", widths: ["62%", "35%", "70%", "55%"] },
  { kind: "withheld", time: "14:32:04", widths: ["48%", "50%", "58%", "68%"] },
  { kind: "withheld", time: "14:32:01", widths: ["58%", "45%", "62%", "52%"] },
  { kind: "withheld", time: "14:31:56", widths: ["44%", "60%", "48%", "70%"] },
  { kind: "withheld", time: "14:31:56", widths: ["66%", "38%", "72%", "58%"] },
  { kind: "withheld", time: "14:31:54", widths: ["52%", "52%", "55%", "64%"] },
  { kind: "withheld", time: "14:31:51", widths: ["60%", "42%", "68%", "50%"] },
  { kind: "withheld", time: "14:31:49", widths: ["46%", "58%", "52%", "72%"] },
  {
    kind: "yours",
    time: "14:31:46",
    instrument: "AURORA-SEQ-1",
    units: "250,000.0000",
    consideration: "250,000.00 USDC",
    counterparty: "party_x7f3...9a2c",
  },
  { kind: "withheld", time: "14:31:38", widths: ["56%", "48%", "60%", "56%"] },
];

const HEADERS = ["TIME (UTC)", "INSTRUMENT", "UNITS", "CONSIDERATION", "COUNTERPARTY", "STATE"];

export function Blotter() {
  const [revealed, setRevealed] = useState(0);
  const [timeString, setTimeString] = useState("14:32:18 UTC");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, "0");
      const m = String(now.getUTCMinutes()).padStart(2, "0");
      const s = String(now.getUTCSeconds()).padStart(2, "0");
      setTimeString(`${h}:${m}:${s} UTC`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setRevealed(ROWS.length);
      return;
    }
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setRevealed(n);
      if (n >= ROWS.length) clearInterval(id);
    }, 90);
    return () => clearInterval(id);
  }, []);

  return (
    <div id="live-blotter" className="border border-withheld bg-slate overflow-hidden">
      {/* Top terminal bar */}
      <div className="flex items-center justify-between border-b border-withheld px-4 py-2.5 bg-slate">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-semibold text-paper">Live settlement blotter</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 figure text-[12px] text-settled">
            <span className="h-2 w-2 rounded-full bg-settled animate-pulse" />
            Live
          </span>
          <span className="figure text-[12px] text-paper/60">{timeString}</span>
        </div>
      </div>

      {/* Header columns */}
      <div className="grid grid-cols-[100px_1.2fr_1.1fr_1.3fr_1.4fr_90px] gap-3 border-b border-withheld px-4 py-2.5 bg-ink/40 text-[11px]">
        {HEADERS.map((h) => (
          <span key={h} className="figure text-[11px] font-medium tracking-wider text-paper/50 uppercase">
            {h}
          </span>
        ))}
      </div>

      {/* Table rows */}
      <div className="divide-y divide-withheld/40">
        {ROWS.map((row, i) => (
          <div
            key={i}
            className={`grid grid-cols-[100px_1.2fr_1.1fr_1.3fr_1.4fr_90px] items-center gap-3 px-4 py-2 text-xs transition-opacity ${
              row.kind === "yours" ? "bg-settled/[0.04] border-l-2 border-l-settled" : ""
            }`}
            style={{ opacity: i < revealed ? 1 : 0, transition: "opacity 140ms ease-out" }}
          >
            {row.kind === "withheld" ? (
              <>
                <span className="figure text-paper/40">{row.time}</span>
                {row.widths.map((w, j) => (
                  <WithheldBlock key={j} width={w} />
                ))}
                <StatePill state="unknown" />
              </>
            ) : (
              <>
                <span className="figure font-medium text-paper">{row.time}</span>
                <span className="figure font-medium text-paper">{row.instrument}</span>
                <span className="figure font-medium text-paper">{row.units}</span>
                <span className="figure font-medium text-paper">{row.consideration}</span>
                <span className="figure truncate text-paper/90">{row.counterparty}</span>
                <StatePill state="settled" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Caption strip */}
      <div className="flex items-center gap-2 border-t border-withheld px-4 py-2.5 bg-ink/60 text-[12px] text-paper/60">
        <span className="text-paper/40">ⓘ</span>
        <p className="figure">
          11 of 12 transactions on this synchroniser were not sent to you.
        </p>
      </div>
    </div>
  );
}
