"use client";

/**
 * Wallet Gateway integration — the browser side.
 *
 *   Privity (dApp SDK) --dApp API (CIP-103, JSON-RPC 2.0)--> Wallet Gateway
 *   Wallet Gateway --Ledger API--> Canton validator
 *   Wallet Gateway --signing--> signing provider (participant, Fireblocks, ...)
 *
 * Consequence for us: WE NEVER HOLD KEYS. The user brings a wallet and a
 * signing provider. There is no managed party, no custodial submission, and no
 * server-side key material anywhere in this app.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ @canton-network/dapp-sdk is pre-1.0 and ships breaking changes.         │
 * │ PIN THE VERSION. Verify every signature below against the README of the │
 * │ version you pinned before trusting this module — the shape here follows │
 * │ the documented convenience API but is not a substitute for reading it.  │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

export type WalletSession = {
  partyId: string;
  networkId: string;
  connected: boolean;
};

let client: unknown | null = null;

/** Lazy-load so the SDK never lands in the initial bundle. */
async function sdk() {
  return import("@canton-network/dapp-sdk");
}

/**
 * Opens the wallet picker and connects. The picker handles discovery across
 * remote Wallet Gateways (HTTP/SSE) and browser extension wallets
 * (postMessage), so we do not hardcode a provider.
 */
export async function connect(): Promise<WalletSession> {
  const dapp: any = await sdk();
  client = await dapp.connect({ appName: "Privity" });

  const accounts = await listAccounts();
  const primary = accounts[0];
  if (!primary) {
    throw new Error("Wallet connected but exposed no party. Check the gateway's party management.");
  }
  return { partyId: primary, networkId: "unknown", connected: true };
}

export async function listAccounts(): Promise<string[]> {
  const dapp: any = await sdk();
  return dapp.request({ method: "canton_accounts" });
}

export async function disconnect(): Promise<void> {
  const dapp: any = await sdk();
  await dapp.disconnect?.();
  client = null;
}

/**
 * Submit a command for the user to sign.
 *
 * The WALLET renders and signs this — our confirm modal is a courtesy, not the
 * authorisation. Never phrase our modal as if it were the final approval, and
 * never treat a resolved promise here as proof of settlement. Read the result.
 */
export async function executeCommand(command: unknown): Promise<unknown> {
  const dapp: any = await sdk();
  return dapp.request({ method: "canton_executeTransaction", params: [command] });
}

export function isConnected(): boolean {
  return client !== null;
}
