import { ConnectWallet } from "@/components/ConnectWallet";
import { LogoLockup } from "@/components/Logo";

export default function SignIn() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[420px] border border-withheld bg-slate p-8">
        <LogoLockup />

        <h1 className="mt-8 font-display text-2xl font-bold tracking-[-0.02em]">
          Connect your wallet
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-paper/70">
          Privity connects through a Canton Wallet Gateway. Your keys stay with
          your signing provider — we never hold them, and every transaction is
          signed by you.
        </p>

        <div className="mt-8">
          <ConnectWallet />
        </div>

        <p className="figure mt-8 border-t border-withheld pt-6 text-[13px] text-paper/50">
          No wallet yet? Run a Wallet Gateway locally against Splice LocalNet —
          see docs/canton-integration.md
        </p>
      </div>
    </main>
  );
}
