/** Two bars of equal weight — an equals sign. Two legs, exchanged. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 25 18" fill="none" aria-hidden="true">
      <rect width="25" height="7" fill="var(--brand)" />
      <rect y="11" width="25" height="7" fill="var(--brand)" />
    </svg>
  );
}

export function LogoLockup() {
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark />
      <span className="font-display text-[22px] font-bold tracking-[-0.02em] text-paper">
        Privity
      </span>
    </span>
  );
}
