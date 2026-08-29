import { Blotter } from "@/components/Blotter";
import { LogoLockup } from "@/components/Logo";

export default function Landing() {
  return (
    <main className="mx-auto max-w-[1100px] px-6">
      <header className="flex items-center justify-between py-8">
        <LogoLockup />
        <nav className="flex items-center gap-6 text-sm text-paper/70">
          <a href="#how" className="hover:text-paper">How settlement works</a>
          <a href="#offerings" className="hover:text-paper">Offerings</a>
          <a
            href="/signin"
            className="bg-brand px-4 py-2 text-paper hover:opacity-90"
          >
            Request access
          </a>
        </nav>
      </header>

      {/* 1 — Hero. The blotter IS the argument. Do not put a gradient behind it. */}
      <section className="py-16">
        <h1 className="max-w-[820px] font-display text-[64px] font-bold leading-[1.05] tracking-[-0.03em]">
          Both legs, one transaction, no audience.
        </h1>
        <p className="mt-6 max-w-[620px] text-[17px] leading-relaxed text-paper/70">
          Tokenised allocations settled atomically against stablecoin on Canton.
          Counterparties see the trade. Nobody else does.
        </p>
        <div className="mt-12">
          <Blotter />
        </div>
      </section>

      {/* TODO §2 The problem — public explorer vs withheld, split view */}
      {/* TODO §3 How settlement works — DIRECT / OFFER / REJECTED */}
      {/* TODO §4 Open offerings — live from /api/offerings */}
      {/* TODO §5 Access and compliance */}
      {/* TODO §6 Footer */}
    </main>
  );
}
