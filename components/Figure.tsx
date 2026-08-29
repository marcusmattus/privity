/** Every number in the product goes through this. Mono, tabular, right-aligned. */
export function Figure({
  value,
  unit,
  className = "",
}: {
  value: string | number;
  unit?: string;
  className?: string;
}) {
  return (
    <span className={`figure tabular-nums ${className}`}>
      {typeof value === "number"
        ? value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : value}
      {unit ? <span className="ml-1 opacity-60">{unit}</span> : null}
    </span>
  );
}
