import { LogoLockup } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-withheld py-12 mt-16 bg-ink">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <LogoLockup />

        <nav className="flex flex-wrap items-center gap-6 text-xs text-paper/60 figure">
          <a href="#docs" className="hover:text-paper transition-colors">Docs</a>
          <a href="#api" className="hover:text-paper transition-colors">API reference</a>
          <a href="https://github.com/marcusmattus/privity" target="_blank" rel="noopener noreferrer" className="hover:text-paper transition-colors">
            GitHub
          </a>
          <a href="mailto:contact@privity.network" className="hover:text-paper transition-colors">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-6 text-xs text-paper/50 figure">
          <div className="flex items-center gap-1.5 text-settled">
            <span className="h-1.5 w-1.5 rounded-full bg-settled animate-pulse" />
            <span>Network status: <strong className="font-semibold text-paper">Healthy</strong></span>
          </div>
          <span>© 2026 Privity. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
