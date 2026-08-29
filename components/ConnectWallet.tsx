"use client";

import { useState } from "react";
import { PartyId } from "./PartyId";
import { WalletSignInModal } from "./WalletSignInModal";
import { WalletSession } from "@/lib/wallet";
import { Key, CheckCircle2, ChevronRight } from "lucide-react";

export function ConnectWallet({
  session,
  onConnected,
  onDisconnect,
}: {
  session?: WalletSession | null;
  onConnected?: (s: WalletSession) => void;
  onDisconnect?: () => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  if (session && session.connected) {
    return (
      <div className="flex items-center gap-3 text-xs bg-slate border border-withheld px-3 py-1.5">
        <div className="flex items-center gap-1.5 text-settled figure">
          <span className="w-2 h-2 rounded-full bg-settled animate-pulse" />
          <span>Connected</span>
        </div>
        <PartyId value={session.partyId} className="font-semibold text-paper" />
        {onDisconnect && (
          <button
            type="button"
            onClick={onDisconnect}
            className="text-paper/40 hover:text-pending transition-colors ml-1 text-[11px] figure"
          >
            Disconnect
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="bg-brand px-4 py-2 text-xs font-semibold text-paper hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow"
      >
        <Key className="w-3.5 h-3.5" />
        <span>Connect Wallet</span>
        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
      </button>

      <WalletSignInModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(s) => {
          onConnected?.(s);
          setModalOpen(false);
        }}
      />
    </>
  );
}
