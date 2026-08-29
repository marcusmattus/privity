"use client";
import { useEffect, useState } from "react";
import { LogoLockup } from "./Logo";
import { PartyId } from "./PartyId";
import { Menu, X, ArrowUpRight } from "lucide-react";

export type NavTab = "portfolio" | "offerings" | "settlements" | "eligibility" | "settings" | "design-system";

export function AppHeader({
  activeTab,
  onSelectTab,
  partyId,
  isAppMode,
  onToggleAppMode,
}: {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  partyId: string;
  isAppMode: boolean;
  onToggleAppMode: () => void;
}) {
  const [syncedSeconds, setSyncedSeconds] = useState(4);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="border-b border-withheld bg-ink/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => {
                if (isAppMode) onSelectTab("portfolio");
              }}
              className="text-left"
            >
              <LogoLockup />
            </button>

            {/* Desktop Tabs (when in App Mode) */}
            {isAppMode && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`px-3 py-1.5 text-xs font-medium figure transition-colors ${
                      activeTab === item.id
                        ? "bg-slate text-paper border border-withheld"
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
                <a href="#offerings" className="hover:text-paper transition-colors">Offerings</a>
                <a href="#how" className="hover:text-paper transition-colors">How it works</a>
                <a href="#the-problem" className="hover:text-paper transition-colors">The Privacy Gap</a>
                <a href="#compliance" className="hover:text-paper transition-colors">Access & compliance</a>
              </nav>
            )}
          </div>

          {/* Right: Status & Action */}
          <div className="hidden sm:flex items-center gap-4">
            {isAppMode ? (
              <>
                {/* Sync freshness */}
                <span
                  className={`figure text-[11px] px-2 py-0.5 border border-withheld ${
                    syncedSeconds > 30 ? "text-pending" : "text-paper/50"
                  }`}
                >
                  synced {syncedSeconds}s ago
                </span>

                {/* Party ID */}
                <div className="flex items-center gap-2 bg-slate border border-withheld px-3 py-1 text-xs">
                  <span className="text-[11px] text-paper/40 figure">Party</span>
                  <PartyId value={partyId} className="text-xs font-semibold" />
                </div>

                <button
                  type="button"
                  onClick={onToggleAppMode}
                  className="figure text-xs text-paper/60 hover:text-paper px-2.5 py-1 transition-colors"
                >
                  Exit to overview
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 figure text-xs text-settled">
                  <span className="h-2 w-2 rounded-full bg-settled animate-pulse" />
                  <span>Network status: <strong className="font-semibold text-paper">Healthy</strong></span>
                </div>

                <button
                  type="button"
                  onClick={onToggleAppMode}
                  className="bg-brand px-4 py-2 text-xs font-semibold text-paper hover:opacity-90 transition-opacity flex items-center gap-1.5"
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
          <div className="sm:hidden border-t border-withheld py-4 space-y-3 bg-slate/95 px-2">
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
                      activeTab === item.id ? "bg-brand text-paper font-semibold" : "text-paper/70 hover:bg-ink"
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
                    Landing Page
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
                <a
                  href="#compliance"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 text-xs text-paper/70"
                >
                  Access & compliance
                </a>
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
  );
}
