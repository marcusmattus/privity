"use client";

import { useState, useEffect } from "react";
import { Blotter } from "@/components/Blotter";
import { TheProblemSplit } from "@/components/TheProblemSplit";
import { HowSettlementWorks } from "@/components/HowSettlementWorks";
import { OpenOfferingsSection } from "@/components/OpenOfferingsSection";
import { AccessAndCompliance } from "@/components/AccessAndCompliance";
import { Footer } from "@/components/Footer";
import { AppHeader, NavTab } from "@/components/AppHeader";
import { PortfolioView } from "@/components/PortfolioView";
import { OfferingsView } from "@/components/OfferingsView";
import { OfferingDetailModal } from "@/components/OfferingDetailModal";
import { SettlementsView } from "@/components/SettlementsView";
import { SettlementDetailModal } from "@/components/SettlementDetailModal";
import { EligibilityView } from "@/components/EligibilityView";
import { SettingsView } from "@/components/SettingsView";
import { DesignSystemView } from "@/components/DesignSystemView";
import { WalletSignInModal } from "@/components/WalletSignInModal";
import { ToastAlert } from "@/components/ToastAlert";
import {
  INITIAL_OFFERINGS,
  INITIAL_HOLDINGS,
  INITIAL_SETTLEMENTS,
  INITIAL_ELIGIBILITY,
  INITIAL_SESSION,
  generateAssetPerformance,
} from "@/lib/mockData";
import {
  Offering,
  Holding,
  SettlementRecord,
  EligibilityProfile,
  PartySession,
} from "@/lib/types";
import {
  WalletSession,
  getStoredSession,
  saveSession,
  clearSession,
} from "@/lib/wallet";
import { ArrowRight, Key, ShieldCheck } from "lucide-react";

export default function Home() {
  const [isAppMode, setIsAppMode] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("portfolio");

  // Reactive state store
  const [offerings, setOfferings] = useState<Offering[]>(INITIAL_OFFERINGS);
  const [holdings, setHoldings] = useState<Holding[]>(INITIAL_HOLDINGS);
  const [settlements, setSettlements] = useState<SettlementRecord[]>(INITIAL_SETTLEMENTS);
  const [eligibility, setEligibility] = useState<EligibilityProfile>(INITIAL_ELIGIBILITY);
  const [session, setSession] = useState<PartySession>(INITIAL_SESSION);
  const [walletSession, setWalletSession] = useState<WalletSession | null>(null);

  // Modals
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementRecord | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [newAllocationModalOpen, setNewAllocationModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if query param ?app=true is present
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("app") === "true") {
        setIsAppMode(true);
      }
      // Check stored session
      const stored = getStoredSession();
      if (stored && stored.connected) {
        setWalletSession(stored);
        setSession((prev) => ({
          ...prev,
          partyId: stored.partyId,
          partyName: stored.partyName,
          custodyMode: stored.custodyMode,
          role: stored.role,
        }));
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // User USDC balance from holdings
  const usdcHolding = holdings.find((h) => h.instrumentSymbol === "USDC");
  const userUsdcBalance = usdcHolding ? usdcHolding.units : 0;

  // Handle wallet connected
  const handleWalletConnected = (ws: WalletSession) => {
    setWalletSession(ws);
    setSession((prev) => ({
      ...prev,
      partyId: ws.partyId,
      partyName: ws.partyName,
      custodyMode: ws.custodyMode,
      role: ws.role,
    }));
    setIsAppMode(true);
    showToast(`Connected: ${ws.partyName} (${ws.partyId.slice(0, 16)}…)`);
  };

  // Handle wallet disconnect
  const handleWalletDisconnect = () => {
    clearSession();
    setWalletSession(null);
    setSession(INITIAL_SESSION);
    showToast("Disconnected from Canton session");
  };

  // Handle successful subscribe
  const handleSubscribeSuccess = (offering: Offering, units: number, consideration: number) => {
    const isDirect = offering.transferKind === "direct";
    const newState: "settled" | "pending_acceptance" = isDirect ? "settled" : "pending_acceptance";

    // 1. Update offerings units remaining
    setOfferings((prev) =>
      prev.map((o) =>
        o.id === offering.id
          ? { ...o, unitsRemaining: Math.max(0, o.unitsRemaining - units) }
          : o
      )
    );

    // 2. Update holdings
    setHoldings((prev) => {
      const updated = prev.map((h) => {
        if (h.instrumentSymbol === "USDC") {
          return {
            ...h,
            units: h.units - consideration,
            valuationUsdc: h.valuationUsdc - consideration,
          };
        }
        if (h.instrumentSymbol === offering.instrument.symbol) {
          return {
            ...h,
            units: h.units + units,
            valuationUsdc: h.valuationUsdc + consideration,
            contractCount: h.contractCount + 1,
            state: newState,
          };
        }
        return h;
      });

      const exists = prev.some((h) => h.instrumentSymbol === offering.instrument.symbol);
      if (!exists) {
        const kindType = offering.instrument.kind === "fund_unit" ? "Fund Units" : "Equity";
        updated.push({
          id: `h-${offering.id}`,
          instrumentSymbol: offering.instrument.symbol,
          name: offering.title,
          type: kindType,
          units: units,
          valuationUsdc: consideration,
          contractCount: 1,
          state: newState,
          contractCids: [`00${Math.random().toString(16).slice(2, 10)}`],
          ...generateAssetPerformance(offering.instrument.symbol, units, consideration, kindType),
        });
      }
      return updated;
    });

    // 3. Add to settlements history
    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}:${String(now.getUTCSeconds()).padStart(2, "0")}`;

    const newSettlement: SettlementRecord = {
      id: `s-${Date.now()}`,
      timeUtc: timeStr,
      date: "Today",
      instrument: offering.instrument.symbol,
      type: offering.instrument.kind === "fund_unit" ? "Fund Units" : "Equity",
      units: units,
      consideration: consideration,
      currency: "USDC",
      counterparty: offering.instrument.issuerParty.slice(0, 16) + "…",
      buyerParty: session.partyId,
      sellerParty: offering.instrument.issuerParty,
      kind: offering.transferKind,
      state: newState,
      instructionCid: `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
      disclosedContracts: 4,
      timeline: [
        { step: "initiated", time: timeStr, description: `Subscribed for ${units.toLocaleString()} units` },
        { step: "quoted", time: timeStr, description: `transferKind: ${offering.transferKind}` },
        { step: "submitted", time: timeStr, description: "Atomic swap command submitted to Canton" },
        {
          step: isDirect ? "settled" : "pending",
          time: timeStr,
          description: isDirect ? "Atomic DvP completed on ledger" : "TransferInstruction awaiting counterparty accept",
        },
      ],
    };

    setSettlements((prev) => [newSettlement, ...prev]);
    showToast(`Subscribed — ${units.toLocaleString()} units of ${offering.instrument.symbol}`);
  };

  // Handle accept settlement
  const handleAcceptSettlement = (id: string) => {
    setSettlements((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            state: "settled",
            timeline: [
              ...s.timeline,
              {
                step: "accepted",
                time: new Date().toISOString().slice(11, 19),
                description: "Signed & accepted by receiver node. Balance moved.",
              },
              {
                step: "settled",
                time: new Date().toISOString().slice(11, 19),
                description: "Holdings archived and re-allocated atomically.",
              },
            ],
          };
        }
        return s;
      })
    );

    const targetSettlement = settlements.find((s) => s.id === id);
    if (targetSettlement) {
      setHoldings((prev) =>
        prev.map((h) =>
          h.instrumentSymbol === targetSettlement.instrument ? { ...h, state: "settled" } : h
        )
      );
    }

    showToast("Accepted instruction — settlement confirmed on ledger");
  };

  // Handle cancel settlement
  const handleCancelSettlement = (id: string) => {
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, state: "rejected", errorCode: "INSTRUCTION_CANCELLED_BY_PARTY" } : s
      )
    );
    showToast("Instruction cancelled");
  };

  // Handle toggle preapproval
  const handleTogglePreApproval = () => {
    const nextVal = !session.preApprovalActive;
    setSession((prev) => ({ ...prev, preApprovalActive: nextVal }));
    showToast(nextVal ? "Pre-approval created on ledger" : "Pre-approval revoked on ledger");
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-paper flex flex-col justify-between selection:bg-brand selection:text-paper">
      {/* Universal Header */}
      <AppHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        partyId={session.partyId}
        isAppMode={isAppMode}
        onToggleAppMode={() => setIsAppMode(!isAppMode)}
        walletSession={walletSession}
        onWalletConnected={handleWalletConnected}
        onWalletDisconnect={handleWalletDisconnect}
        onOpenNewAllocation={() => {
          setActiveTab("offerings");
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {!isAppMode ? (
          /* =========================================================================
             LANDING PAGE VIEW (§1 - §6)
             ========================================================================= */
          <main className="mx-auto max-w-[1100px] px-4 sm:px-6">
            {/* §1 Hero Section. The blotter IS the argument. */}
            <section className="py-12 sm:py-16">
              <div className="flex flex-col gap-4">
                <span className="figure text-xs font-semibold uppercase tracking-widest text-brand">
                  Private by design. Built on Canton.
                </span>
                <h1 className="max-w-[840px] font-display text-4xl sm:text-5xl lg:text-[64px] font-bold leading-[1.05] tracking-[-0.03em] text-paper">
                  Both legs, one transaction, no audience.
                </h1>
                <p className="mt-2 max-w-[620px] text-base sm:text-[17px] leading-relaxed text-paper/70">
                  Tokenised allocations settled atomically against stablecoin on Canton.
                  Counterparties see the trade. Nobody else does.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setWalletModalOpen(true)}
                    className="bg-brand px-5 py-2.5 text-sm font-semibold text-paper hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
                  >
                    <Key className="w-4 h-4" /> Connect Wallet & Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAppMode(true);
                      setActiveTab("portfolio");
                    }}
                    className="border border-withheld bg-[#141722] px-5 py-2.5 text-sm font-medium text-paper hover:bg-[#1a1e2d] transition-colors flex items-center gap-1.5"
                  >
                    Explore Demo Dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* The Signature Live Settlement Blotter */}
              <div className="mt-12">
                <Blotter />
              </div>
            </section>

            {/* §2 The Problem — Public Chain vs On Privity Split View */}
            <TheProblemSplit />

            {/* §3 How Settlement Works — DIRECT / OFFER / REJECTED */}
            <HowSettlementWorks />

            {/* §4 Open Offerings */}
            <OpenOfferingsSection
              onSelectOffering={(id) => {
                const target = offerings.find((o) => o.id === id);
                if (target) {
                  setSelectedOffering(target);
                }
              }}
              onLaunchApp={() => {
                setIsAppMode(true);
                setActiveTab("offerings");
              }}
            />

            {/* §5 Access and Compliance */}
            <AccessAndCompliance />
          </main>
        ) : (
          /* =========================================================================
             APPLICATION DASHBOARD VIEW (Full Screen Dashboard)
             ========================================================================= */
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8">
            {activeTab === "portfolio" && (
              <PortfolioView
                holdings={holdings}
                settlements={settlements}
                partyId={session.partyId}
                onAcceptSettlement={handleAcceptSettlement}
                onNavigateToOfferings={() => setActiveTab("offerings")}
                onNavigateToSettlements={() => setActiveTab("settlements")}
              />
            )}

            {activeTab === "offerings" && (
              <OfferingsView
                offerings={offerings}
                onSelectOffering={(offering) => setSelectedOffering(offering)}
                onStartKyc={() => setActiveTab("eligibility")}
              />
            )}

            {activeTab === "settlements" && (
              <SettlementsView
                settlements={settlements}
                onSelectSettlement={(s) => setSelectedSettlement(s)}
                onAcceptSettlement={handleAcceptSettlement}
              />
            )}

            {activeTab === "eligibility" && (
              <EligibilityView
                eligibility={eligibility}
                onUpgradeTier={() => showToast("Attestation request submitted to KYC node")}
              />
            )}

            {activeTab === "settings" && (
              <SettingsView
                session={session}
                onTogglePreApproval={handleTogglePreApproval}
                onSignOut={handleWalletDisconnect}
              />
            )}

            {activeTab === "design-system" && <DesignSystemView />}
          </div>
        )}
      </div>

      {/* Offering Detail & Subscribe Modal */}
      {selectedOffering && (
        <OfferingDetailModal
          offering={selectedOffering}
          userUsdcBalance={userUsdcBalance}
          onClose={() => setSelectedOffering(null)}
          onSubscribeSuccess={handleSubscribeSuccess}
        />
      )}

      {/* Settlement Detail Modal */}
      {selectedSettlement && (
        <SettlementDetailModal
          settlement={selectedSettlement}
          onClose={() => setSelectedSettlement(null)}
          onAccept={handleAcceptSettlement}
          onCancel={handleCancelSettlement}
        />
      )}

      {/* Wallet Sign In Modal */}
      <WalletSignInModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onSuccess={handleWalletConnected}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <ToastAlert message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}

      {/* Global Institutional Footer */}
      <div className="mx-auto max-w-[1280px] w-full px-4 sm:px-6">
        <Footer />
      </div>
    </div>
  );
}
