"use client";
import { useState } from "react";

/** Party IDs are long. Truncate the middle, never the end — the fingerprint matters. */
export function PartyId({ value, className = "" }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const short =
    value.length > 24 ? `${value.slice(0, 12)}…${value.slice(-6)}` : value;

  return (
    <button
      type="button"
      title={value}
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className={`figure text-paper/70 hover:text-paper transition-colors ${className}`}
    >
      {short} <span className="opacity-50">{copied ? "copied" : "⧉"}</span>
    </button>
  );
}
