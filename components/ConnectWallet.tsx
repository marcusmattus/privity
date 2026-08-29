"use client";
import { useState } from "react";
import { connect, type WalletSession } from "@/lib/wallet";
import { PartyId } from "./PartyId";

type State = "idle" | "connecting" | "connected" | "error";

export function ConnectWallet({
  onConnected,
}: {
  onConnected?: (s: WalletSession) => void;
}) {
  const [state, setState] = useState<State>("idle");
  const [session, setSession] = useState<WalletSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setState("connecting");
    setError(null);
    try {
      const s = await connect();
      setSession(s);
      setState("connected");
      onConnected?.(s);
    } catch (e) {
      // Name the failure. "Something went wrong" is not a diagnosis.
      setError(e instanceof Error ? e.message : "Wallet connection failed");
      setState("error");
    }
  }

  if (state === "connected" && session) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-paper/50">Connected</span>
        <PartyId value={session.partyId} />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleConnect}
        disabled={state === "connecting"}
        className="bg-brand px-4 py-2 text-paper hover:opacity-90 disabled:opacity-60"
      >
        {state === "connecting" ? "Opening wallet…" : "Connect wallet"}
      </button>
      {state === "error" && error ? (
        <p className="mt-3 max-w-[420px] text-sm text-pending">{error}</p>
      ) : null}
    </div>
  );
}
