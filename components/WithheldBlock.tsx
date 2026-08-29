/**
 * The primitive the whole design rests on.
 *
 * A withheld cell is a FLAT FILL, never a blur. Blur reads as "loading" or
 * "paywalled" — it implies the data is present and being hidden from you.
 * Flat fill reads as "this was never sent to you", which is what Canton
 * actually does. Do not change this to a blur.
 */
export function WithheldBlock({ width = "100%" }: { width?: string }) {
  return (
    <span
      role="img"
      aria-label="Withheld — you are not party to this transaction"
      className="inline-block h-[1em] align-middle bg-withheld"
      style={{ width }}
    />
  );
}
