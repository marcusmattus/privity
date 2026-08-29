"use client";

import { useState } from "react";
import {
  WalletProviderId,
  WalletProviderInfo,
  WALLET_PROVIDERS,
  DEMO_PROFILES,
  WalletSession,
  connectWithProvider,
  generateAuthChallenge,
} from "@/lib/wallet";
import { LogoLockup } from "./Logo";
import { PartyId } from "./PartyId";
import {
  Shield,
  Key,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Cpu,
  Fingerprint,
  Layers,
  Sparkles,
  X,
  ExternalLink,
} from "lucide-react";

export function WalletSignInModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: WalletSession) => void;
}) {
  const [selectedProvider, setSelectedProvider] = useState<WalletProviderInfo | null>(null);
  const [authStep, setAuthStep] = useState<"select" | "challenge" | "verifying" | "success">("select");
  const [challengeData, setChallengeData] = useState<{
    nonce: string;
    timestamp: string;
    message: string;
    partyId: string;
  } | null>(null);
  const [customPartyName, setCustomPartyName] = useState("");
  const [activeTab, setActiveTab] = useState<"wallets" | "institutional_demo">("wallets");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectProvider = (provider: WalletProviderInfo) => {
    setSelectedProvider(provider);
    setErrorMsg(null);

    // Generate challenge
    const tempPartyId = `Privity::1220${Math.random().toString(16).slice(2, 10)}8e2`;
    const challenge = generateAuthChallenge(provider.id, tempPartyId);
    setChallengeData({
      ...challenge,
      partyId: tempPartyId,
    });
    setAuthStep("challenge");
  };

  const handleSelectDemo = async (demoId: WalletProviderId) => {
    setAuthStep("verifying");
    setErrorMsg(null);
    try {
      // Simulate quick cryptographic handshake
      await new Promise((r) => setTimeout(r, 600));
      const session = await connectWithProvider(demoId);
      setAuthStep("success");
      setTimeout(() => {
        onSuccess(session);
        onClose();
      }, 500);
    } catch (e: any) {
      setErrorMsg(e?.message || "Demo login failed");
      setAuthStep("select");
    }
  };

  const handleSignChallenge = async () => {
    if (!selectedProvider) return;
    setAuthStep("verifying");
    setErrorMsg(null);
    try {
      // Realistic signing duration
      await new Promise((r) => setTimeout(r, 900));
      const session = await connectWithProvider(selectedProvider.id, {
        customPartyName: customPartyName.trim() || undefined,
      });
      setAuthStep("success");
      setTimeout(() => {
        onSuccess(session);
        onClose();
      }, 600);
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to sign authentication challenge");
      setAuthStep("challenge");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-[560px] border border-withheld bg-[#0e1017] shadow-2xl overflow-hidden my-auto">
        {/* Top Header Bar */}
        <div className="border-b border-withheld bg-[#131620] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoLockup />
            <span className="hidden sm:inline-block figure text-[10px] uppercase tracking-widest text-brand bg-brand/10 border border-brand/30 px-2 py-0.5">
              Protocol v2.4
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-paper/50 hover:text-paper p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {authStep === "select" && (
            <div className="space-y-6">
              {/* Frame Eyebrow */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="figure text-[11px] font-semibold uppercase tracking-wider text-brand">
                    AUTHENTICATION PROTOCOL
                  </span>
                  <div className="h-px flex-1 bg-withheld/60" />
                </div>
                <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-paper">
                  Connect Wallet or Identity
                </h2>
                <p className="text-xs leading-relaxed text-paper/65">
                  Access the Canton private ledger settlement network. All transactions and leg commitments are signed locally by your cryptographic identity.
                </p>
              </div>

              {/* View Tabs */}
              <div className="flex border border-withheld bg-[#141722] p-1 text-xs figure">
                <button
                  type="button"
                  onClick={() => setActiveTab("wallets")}
                  className={`flex-1 py-1.5 font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === "wallets"
                      ? "bg-brand text-paper font-semibold shadow-sm"
                      : "text-paper/60 hover:text-paper"
                  }`}
                >
                  <Key className="w-3.5 h-3.5" /> Wallets & Signers
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("institutional_demo")}
                  className={`flex-1 py-1.5 font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === "institutional_demo"
                      ? "bg-brand text-paper font-semibold shadow-sm"
                      : "text-paper/60 hover:text-paper"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Instant Demo Seats
                </button>
              </div>

              {/* Tab 1: Wallets list */}
              {activeTab === "wallets" && (
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {WALLET_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => handleSelectProvider(provider)}
                      className="w-full text-left border border-withheld bg-[#141722] hover:bg-[#1a1e2d] hover:border-brand/60 p-3.5 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded bg-[#1f2333] border border-withheld flex items-center justify-center flex-shrink-0 text-paper/80 group-hover:text-brand group-hover:border-brand/40 transition-colors">
                          {provider.id === "metamask" && <Layers className="w-5 h-5 text-[#F6851B]" />}
                          {provider.id === "coinbase" && <div className="w-4 h-4 rounded-full bg-[#0052FF]" />}
                          {provider.id === "walletconnect" && <Cpu className="w-5 h-5 text-[#3B99FC]" />}
                          {provider.id === "fireblocks" && <Shield className="w-5 h-5 text-[#E5E7EB]" />}
                          {provider.id === "ledger" && <Fingerprint className="w-5 h-5 text-settled" />}
                          {provider.id === "keycloak" && <Lock className="w-5 h-5 text-brand" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-paper group-hover:text-paper">
                              {provider.name}
                            </span>
                            {provider.badge && (
                              <span className="figure text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-brand/15 text-brand border border-brand/30">
                                {provider.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-paper/50 mt-0.5 leading-tight">
                            {provider.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-paper/40 group-hover:text-brand group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Tab 2: Institutional Demo profiles */}
              {activeTab === "institutional_demo" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-paper/60 figure">
                    Select a pre-configured verified institutional party for one-click access:
                  </p>
                  {DEMO_PROFILES.map((profile) => (
                    <div
                      key={profile.id}
                      onClick={() => handleSelectDemo(profile.id)}
                      className="border border-withheld bg-[#141722] hover:bg-[#1a1e2d] hover:border-brand p-4 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-paper group-hover:text-brand transition-colors">
                            {profile.partyName}
                          </span>
                          <span className="figure text-[10px] text-settled bg-settled/10 border border-settled/30 px-1.5 py-0.5">
                            {profile.tier}
                          </span>
                        </div>
                        <span className="text-[11px] text-brand font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Connect <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <p className="text-[11px] text-paper/60">{profile.desc}</p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-paper/40 figure border-t border-withheld/40">
                        <span>Role: {profile.role}</span>
                        <PartyId value={profile.partyId} className="text-[10px]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-pending/10 border border-pending/40 text-pending text-xs figure">
                  {errorMsg}
                </div>
              )}

              {/* Security Banner Footer */}
              <div className="pt-4 border-t border-withheld flex items-start gap-2.5 text-[11px] text-paper/50">
                <Shield className="w-4 h-4 text-settled flex-shrink-0 mt-0.5" />
                <span>
                  Privity operates zero-custody settlement. Your private keys never leave your device or hardware security module.
                </span>
              </div>
            </div>
          )}

          {authStep === "challenge" && challengeData && selectedProvider && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-withheld pb-3">
                <button
                  type="button"
                  onClick={() => setAuthStep("select")}
                  className="text-xs text-paper/60 hover:text-paper flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to providers
                </button>
                <span className="figure text-[11px] text-brand uppercase font-semibold">
                  Step 2 of 2: Sign Challenge
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-xl font-bold text-paper">
                  Sign Canton Session Challenge
                </h3>
                <p className="text-xs text-paper/65">
                  Your signing provider ({selectedProvider.name}) will verify party ownership on the Canton synchronizer topology.
                </p>
              </div>

              {/* Challenge Payload Display Box */}
              <div className="space-y-2">
                <span className="figure text-[10px] uppercase tracking-wider text-paper/50 block">
                  CRYPTOGRAPHIC CHALLENGE PAYLOAD
                </span>
                <div className="bg-[#08090e] border border-withheld p-3.5 font-mono text-[11px] text-paper/85 space-y-1.5 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {challengeData.message}
                </div>
              </div>

              {/* Optional Custom Entity Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-paper/70 flex justify-between">
                  <span>Institutional Entity Name (Optional)</span>
                  <span className="text-paper/40 figure text-[11px]">Display name on blotter</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Syndicate Ltd."
                  value={customPartyName}
                  onChange={(e) => setCustomPartyName(e.target.value)}
                  className="w-full bg-[#131620] border border-withheld px-3 py-2 text-xs text-paper placeholder:text-paper/30 focus:outline-none focus:border-brand"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-pending/10 border border-pending/40 text-pending text-xs figure">
                  {errorMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthStep("select")}
                  className="flex-1 border border-withheld bg-[#141722] py-2.5 text-xs text-paper hover:bg-[#1a1e2d] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSignChallenge}
                  className="flex-[2] bg-brand py-2.5 px-4 text-xs font-semibold text-paper hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
                >
                  <Key className="w-4 h-4" /> Sign Challenge & Authenticate
                </button>
              </div>
            </div>
          )}

          {authStep === "verifying" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-brand/20 border-t-brand animate-spin" />
                <Lock className="w-6 h-6 text-brand absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-paper">
                  Validating Cryptographic Proof
                </h3>
                <p className="text-xs text-paper/60 max-w-[320px] mx-auto">
                  Submitting session nonce to Canton synchronizer node cluster for zero-knowledge signature verification…
                </p>
              </div>
            </div>
          )}

          {authStep === "success" && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-settled/15 border border-settled flex items-center justify-center text-settled">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-xl font-bold text-paper">
                  Authenticated Successfully
                </h3>
                <p className="text-xs text-paper/70">
                  Party session established. Opening Privity Institutional Dashboard…
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
