"use client";

import { useEffect, useState } from "react";
import { LogoLockup } from "./Logo";
import { PartyId } from "./PartyId";
import { WalletSignInModal } from "./WalletSignInModal";
import { WalletSession } from "@/lib/wallet";
import {
  Menu,
  X,
  ArrowUpRight,
  Plus,
  Key,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from "lucide-react";

export type NavTab =
  | "portfolio"
  | "offerings"
  | "settlements"
  | "eligibility"
  | "settings"
  | "design-system";

export function AppHeader({
  activeTab,
  onSelectTab,
  partyId,
  isAppMode,
  onToggleAppMode,
  walletSession,
  onWalletConnected,
  onWalletDisconnect,
  onOpenNewAllocation,
}: {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  partyId: string;
  isAppMode: boolean;
  onToggleAppMode: () => void;
  walletSession?: WalletSession | null;
  onWalletConnected?: (session: WalletSession) => void;
  onWalletDisconnect?: () => void;
  onOpenNewAllocation?: () => void;
}) {
  const [syncedSeconds, setSyncedSeconds] = useState(4);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncedSeconds((prev) => (prev >= 45 ? 2 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: NavTab; label: string }[] = [
    { id: "portfolio", label: "Portfolio" },
    { id: "offerings", label: "Offerings" },
    { id: "settlements", label: "Settlements" },
    { id: "eligibility", label: "Eligibility" },
    { id: "settings", label: "Settings" },
    { id: "design-system", label: "Design System" },
  ];

  return (
    <>
      <header className="border-b border-withheld bg-[#0b0d14]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Navigation */}
            <div className="flex items-center gap-6 lg:gap-8">
              <button
                type="button"
                onClick={() => {
                  if (isAppMode) onSelectTab("portfolio");
                }}
                className="text-left flex items-center gap-2.5 focus:outline-none"
              >
                <LogoLockup />
                {isAppMode && (
                  <span className="hidden xl:inline-block figure text-[9px] uppercase tracking-widest text-brand bg-brand/10 border border-brand/20 px-2 py-0.5">
                    INSTITUTIONAL
                  </span>
                )}
              </button>

              {/* Desktop Tabs (when in App Mode) */}
              {isAppMode && (
                <nav className="hidden md:flex items-center gap-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`px-3 py-1.5 text-xs font-medium figure transition-colors rounded-none ${
                        activeTab === item.id
                          ? "bg-slate text-paper border border-withheld font-semibold"
                          : "text-paper/60 hover:text-paper hover:bg-slate/50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              )}

              {/* Desktop Landing Nav (when on Landing Page) */}
              {!isAppMode && (
                <nav className="hidden md:flex items-center gap-6 text-xs text-paper/70 figure">
                  <a href="#offerings" className="hover:text-paper transition-colors">
                    Offerings
                  </a>
                  <a href="#how" className="hover:text-paper transition-colors">
                    How it works
                  </a>
                  <a href="#the-problem" className="hover:text-paper transition-colors">
                    The Privacy Gap
                  </a>
                  <a href="#compliance" className="hover:text-paper transition-colors">
                    Access & compliance
                  </a>
                </nav>
              )}
            </div>

            {/* Right: Actions, Sync status & Wallet info */}
            <div className="hidden sm:flex items-center gap-3">
              {isAppMode ? (
                <>
                  {/* + New Allocation Action */}
                  {onOpenNewAllocation && (
                    <button
                      type="button"
                      onClick={onOpenNewAllocation}
                      className="bg-[#D4BBFF] text-[#151226] font-semibold text-xs px-3.5 py-1.5 flex items-center gap-1.5 hover:bg-[#c4a5f8] transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Allocation</span>
                    </button>
                  )}

                  {/* Sync freshness */}
                  <div
                    className={`figure text-[11px] px-2.5 py-1 border border-withheld bg-[#141722] flex items-center gap-1.5 ${
                      syncedSeconds > 30 ? "text-pending" : "text-paper/60"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-settled animate-pulse" />
                    <span>synced {syncedSeconds}s ago</span>
                  </div>

                  {/* Party Identity Pill / Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 bg-[#141722] hover:bg-[#1a1e2d] border border-withheld px-3 py-1 text-xs transition-colors"
                    >
                      <span className="text-[10px] text-paper/40 figure uppercase">Party</span>
                      <PartyId value={partyId} className="text-xs font-semibold text-paper" />
                      <ChevronDown className="w-3 h-3 text-paper/40" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 border border-withheld bg-[#0e1017] shadow-2xl p-3 z-50 text-xs space-y-3">
                        <div className="border-b border-withheld pb-2">
                          <span className="text-[10px] text-paper/50 figure block uppercase">
                            Active Session
                          </span>
                          <span className="font-semibold text-paper block mt-0.5">
                            {walletSession?.partyName || "Acme Capital Partners"}
                          </span>
                          <span className="text-[11px] text-settled figure flex items-center gap-1 mt-0.5">
                            <ShieldCheck className="w-3 h-3" /> {walletSession?.tier || "Tier 2 Professional"}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTab("settings");
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-2 py-1.5 hover:bg-slate text-paper/70 hover:text-paper figure transition-colors"
                          >
                            Platform Settings
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSignInModalOpen(true);
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-2 py-1.5 hover:bg-slate text-brand figure transition-colors flex items-center justify-between"
                          >
                            <span>Switch Wallet / Party</span>
                            <Key className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {onWalletDisconnect && (
                          <div className="pt-2 border-t border-withheld">
                            <button
                              type="button"
                              onClick={() => {
                                onWalletDisconnect();
                                setUserDropdownOpen(false);
                              }}
                              className="w-full text-left px-2 py-1 text-pending hover:bg-pending/10 figure transition-colors flex items-center justify-between"
                            >
                              <span>Disconnect</span>
                              <LogOut className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={onToggleAppMode}
                    className="figure text-xs text-paper/50 hover:text-paper px-2 py-1 transition-colors"
                  >
                    Overview
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 figure text-xs text-settled mr-2">
                    <span className="h-2 w-2 rounded-full bg-settled animate-pulse" />
                    <span>
                      Canton LocalNet: <strong className="font-semibold text-paper">Operational</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSignInModalOpen(true)}
                    className="border border-withheld bg-[#141722] hover:bg-[#1a1e2d] px-3.5 py-1.5 text-xs font-semibold text-paper transition-colors flex items-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5 text-brand" />
                    <span>Connect Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={onToggleAppMode}
                    className="bg-brand px-4 py-2 text-xs font-semibold text-paper hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow"
                  >
                    Launch App <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-paper/70 hover:text-paper p-1.5"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-withheld py-4 space-y-3 bg-[#0e1017] px-2">
              {isAppMode ? (
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs figure ${
                        activeTab === item.id
                          ? "bg-brand text-paper font-semibold"
                          : "text-paper/70 hover:bg-slate"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="pt-3 border-t border-withheld flex justify-between items-center px-3">
                    <PartyId value={partyId} className="text-xs" />
                    <button
                      onClick={() => {
                        onToggleAppMode();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-brand"
                    >
                      Landing Overview
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <a
                    href="#offerings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-1.5 text-xs text-paper/70"
                  >
                    Offerings
                  </a>
                  <a
                    href="#how"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-1.5 text-xs text-paper/70"
                  >
                    How it works
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full border border-withheld bg-[#141722] py-2 text-xs font-semibold text-paper"
                  >
                    Connect Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleAppMode();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-brand py-2 text-xs font-semibold text-paper"
                  >
                    Launch App
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Global Wallet Sign In Modal */}
      <WalletSignInModal
        isOpen={signInModalOpen}
        onClose={() => setSignInModalOpen(false)}
        onSuccess={(session) => {
          onWalletConnected?.(session);
          setSignInModalOpen(false);
        }}
      />
    </>
  );
}
