import "server-only";

/**
 * The ONLY path from the app to Canton.
 *
 * ledger-service holds every C8_* credential. This module runs server-side
 * only — the "server-only" import above makes the build fail if a client
 * component ever pulls it in. Do not remove it.
 */
const BASE = process.env.LEDGER_SERVICE_URL ?? "http://localhost:8000";

export async function ledger<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`ledger-service ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}
