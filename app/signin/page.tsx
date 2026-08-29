import { ConnectWallet } from "@/components/ConnectWallet";
import { LogoLockup } from "@/components/Logo";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function SignIn() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 bg-ink text-paper">
      <div className="w-full max-w-[440px] border border-withheld bg-slate p-8">
        <div className="flex items-center justify-between">
          <LogoLockup />
          <Link href="/" className="text-xs text-paper/60 hover:text-paper flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>

        <h1 className="mt-8 font-display text-2xl font-bold tracking-[-0.02em] text-paper">
          Connect your wallet
        </h1>

        <p className="mt-3 text-xs leading-relaxed text-paper/70">
          Privity connects through a Canton Wallet Gateway. Your keys stay with
          your signing provider — we never hold them, and every transaction is
          signed by you.
        </p>

        <div className="mt-6">
          <ConnectWallet />
        </div>

        <div className="mt-6 pt-4 border-t border-withheld/50 flex justify-between items-center text-xs">
          <span className="text-paper/50 figure">Enter instant session</span>
          <Link href="/" className="text-brand font-semibold hover:underline flex items-center gap-1">
            Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="figure mt-6 border-t border-withheld pt-4 text-[12px] text-paper/50">
          No wallet yet? Run a Wallet Gateway locally against Splice LocalNet —
          see docs/canton-integration.md
        </p>
      </div>
    </main>
  );
}
