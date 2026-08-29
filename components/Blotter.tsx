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
  | { kind: "withheld"; widths: [string, string, string, string, string] }
  | {
      kind: "yours";
      time: string;
      instrument: string;
      units: string;
      consideration: string;
      counterparty: string;
    };

const ROWS: Row[] = [
  { kind: "withheld", widths: ["70%", "55%", "40%", "65%", "60%"] },
  { kind: "withheld", widths: ["70%", "40%", "55%", "50%", "75%"] },
  { kind: "withheld", widths: ["70%", "62%", "35%", "70%", "55%"] },
  { kind: "withheld", widths: ["70%", "48%", "50%", "58%", "68%"] },
  {
    kind: "yours",
    time: "14:04:03",
    instrument: "ORCA-A",
    units: "1,200",
    consideration: "840,000.00",
    counterparty: "Privity::1220a4f…8e2",
  },
  { kind: "withheld", widths: ["70%", "58%", "45%", "62%", "52%"] },
  { kind: "withheld", widths: ["70%", "44%", "60%", "48%", "70%"] },
  { kind: "withheld", widths: ["70%", "66%", "38%", "72%", "58%"] },
  { kind: "withheld", widths: ["70%", "52%", "52%", "55%", "64%"] },
  { kind: "withheld", widths: ["70%", "60%", "42%", "68%", "50%"] },
  { kind: "withheld", widths: ["70%", "46%", "58%", "52%", "72%"] },
  { kind: "withheld", widths: ["70%", "56%", "48%", "60%", "56%"] },
];

const HEADERS = ["TIME", "INSTRUMENT", "UNITS", "CONSIDERATION", "COUNTERPARTY", "STATE"];

export function Blotter() {
  const [revealed, setRevealed] = useState(0);

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
    }, 110);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border border-withheld bg-slate">
      <div className="grid grid-cols-[90px_1fr_90px_1fr_1fr_100px] gap-4 border-b border-withheld px-4 py-3">
        {HEADERS.map((h) => (
          <span key={h} className="figure text-[11px] tracking-widest text-paper/50">
            {h}
          </span>
        ))}
      </div>

      {ROWS.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-[90px_1fr_90px_1fr_1fr_100px] items-center gap-4 border-b border-withheld/50 px-4 py-3 last:border-b-0"
          style={{ opacity: i < revealed ? 1 : 0, transition: "opacity 160ms ease-out" }}
        >
          {row.kind === "withheld" ? (
            <>
              {row.widths.map((w, j) => (
                <WithheldBlock key={j} width={w} />
              ))}
              <WithheldBlock width="70%" />
            </>
          ) : (
            <>
              <span className="figure text-sm text-paper">{row.time}</span>
              <span className="figure text-sm text-paper">{row.instrument}</span>
              <span className="figure text-sm text-paper">{row.units}</span>
              <span className="figure text-sm text-paper">{row.consideration}</span>
              <span className="figure truncate text-sm text-paper/80">{row.counterparty}</span>
              <StatePill state="settled" />
            </>
          )}
        </div>
      ))}

      <p className="figure border-t border-withheld px-4 py-3 text-[13px] text-paper/50">
        11 of 12 transactions on this synchroniser were not sent to you.
      </p>
    </div>
  );
}
