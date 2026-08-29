"use client";

export type WalletProviderId =
  | "metamask"
  | "coinbase"
  | "walletconnect"
  | "fireblocks"
  | "ledger"
  | "keycloak"
  | "demo_qib"
  | "demo_mm"
  | "demo_fund";

export interface WalletProviderInfo {
  id: WalletProviderId;
  name: string;
  category: "browser" | "institutional" | "hardware" | "sso" | "demo";
  description: string;
  iconName: string;
  badge?: string;
}

export interface WalletSession {
  partyId: string;
  partyName: string;
  accountAddress: string;
  provider: WalletProviderId;
  networkId: string;
  connectedAt: string;
  custodyMode: "managed" | "external";
  role: string;
  tier: string;
  connected: boolean;
  signature?: string;
}

export const WALLET_PROVIDERS: WalletProviderInfo[] = [
  {
    id: "metamask",
    name: "MetaMask Institutional",
    category: "browser",
    description: "Connect via browser extension or MMI custodian gateway",
    iconName: "metamask",
    badge: "Popular",
  },
  {
    id: "coinbase",
    name: "Coinbase Smart Wallet",
    category: "browser",
    description: "Passkey-powered institutional smart account",
    iconName: "coinbase",
  },
  {
    id: "walletconnect",
    name: "WalletConnect v2",
    category: "browser",
    description: "Scan QR code with mobile custodian or mobile Web3 wallet",
    iconName: "walletconnect",
  },
  {
    id: "fireblocks",
    name: "Fireblocks MPC",
    category: "institutional",
    description: "Direct MPC workspace authorization & policy signing",
    iconName: "fireblocks",
    badge: "Enterprise",
  },
  {
    id: "ledger",
    name: "Ledger Hardware",
    category: "hardware",
    description: "Secure USB / WebHID cold storage hardware signer",
    iconName: "ledger",
  },
  {
    id: "keycloak",
    name: "Keycloak Canton SSO",
    category: "sso",
    description: "Enterprise OIDC single sign-on via Canton Identity Node",
    iconName: "keycloak",
    badge: "Canton IDP",
  },
];

export const DEMO_PROFILES: {
  id: WalletProviderId;
  partyName: string;
  partyId: string;
  role: string;
  tier: string;
  desc: string;
}[] = [
  {
    id: "demo_qib",
    partyName: "Acme Capital Partners",
    partyId: "Privity::1220a4f938291847182938471928371928e2",
    role: "Full seat • Investment Desk",
    tier: "Tier 2 Professional (QIB)",
    desc: "Default institutional allocator with $5.2M portfolio",
  },
  {
    id: "demo_mm",
    partyName: "Apex Liquidity Desk",
    partyId: "Privity::1220bf9918237c182937ac19827391726381928371",
    role: "Market Maker / Syndicator",
    tier: "Tier 3 Institutional",
    desc: "High-frequency settlement desk with instant pre-approvals",
  },
  {
    id: "demo_fund",
    partyName: "Nova Asset Management LP",
    partyId: "Privity::122091c3ef7182a5371c6d4829fa771829e018a7c",
    role: "Fund Manager / GP",
    tier: "Tier 2 Professional",
    desc: "Issuer and syndicate manager for tokenized fund units",
  },
];

const SESSION_STORAGE_KEY = "privity_wallet_session";

export function getStoredSession(): WalletSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session: WalletSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to save session to localStorage", e);
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear session", e);
  }
}

/**
 * Generate a cryptographic challenge message for Canton network party authorization
 */
export function generateAuthChallenge(provider: WalletProviderId, partyId: string) {
  const nonce = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
  const timestamp = new Date().toISOString();
  const domain = typeof window !== "undefined" ? window.location.host : "app.privity.trade";

  const message = [
    `Privity Settlement Network Authentication`,
    `Domain: ${domain}`,
    `Party Identifier: ${partyId}`,
    `Canton Synchronizer: localnet-synchronizer.privity.canton.network`,
    `Nonce: ${nonce}`,
    `Issued At: ${timestamp}`,
    `Purpose: Authenticate session key and establish Daml choice execution rights.`,
  ].join("\n");

  return { nonce, timestamp, message };
}

/**
 * Authenticate with a selected wallet provider or institutional identity
 */
export async function connectWithProvider(
  provider: WalletProviderId,
  options?: { customPartyName?: string }
): Promise<WalletSession> {
  // Check for demo profiles
  const demo = DEMO_PROFILES.find((p) => p.id === provider);
  if (demo) {
    const session: WalletSession = {
      partyId: demo.partyId,
      partyName: demo.partyName,
      accountAddress: `0x${demo.partyId.slice(-8).padStart(40, "4f9e")}`,
      provider,
      networkId: "canton-localnet-1",
      connectedAt: new Date().toISOString(),
      custodyMode: "managed",
      role: demo.role,
      tier: demo.tier,
      connected: true,
      signature: `0x${Math.random().toString(16).slice(2, 16)}...${Math.random().toString(16).slice(2, 16)}`,
    };
    saveSession(session);
    return session;
  }

  // Attempt Web3 window.ethereum if browser wallet selected
  if (provider === "metamask" || provider === "coinbase") {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        const primary = accounts[0] || "0x4F9E38A92d1c63E41209BcA7f93802e3b1c6D92E";
        const partyId = `Privity::1220${primary.slice(2).toLowerCase()}a4f9`;
        
        const session: WalletSession = {
          partyId,
          partyName: options?.customPartyName || "Metamask Institutional Custody",
          accountAddress: primary,
          provider,
          networkId: "canton-localnet-1",
          connectedAt: new Date().toISOString(),
          custodyMode: "external",
          role: "Full seat • External Signer",
          tier: "Tier 2 Professional",
          connected: true,
          signature: `0x${Math.random().toString(16).slice(2, 16)}...`,
        };
        saveSession(session);
        return session;
      } catch (err: any) {
        if (err?.code === 4001) {
          throw new Error("User rejected wallet connection request.");
        }
      }
    }
  }

  // Fallback / Standard simulation for WebHID Ledger, Fireblocks MPC, Keycloak SSO, etc.
  const hash = Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
  const partyId = `Privity::1220${hash}8e2`;
  const nameMap: Record<WalletProviderId, string> = {
    metamask: "MetaMask Institutional",
    coinbase: "Coinbase Prime Custody",
    walletconnect: "WalletConnect Node",
    fireblocks: "Fireblocks MPC Vault",
    ledger: "Ledger Hardware Signer",
    keycloak: "Keycloak Canton Identity",
    demo_qib: "Acme Capital Partners",
    demo_mm: "Apex Liquidity Desk",
    demo_fund: "Nova Asset Management LP",
  };

  const session: WalletSession = {
    partyId,
    partyName: options?.customPartyName || nameMap[provider] || "Institutional Party",
    accountAddress: `0x${hash.slice(0, 40).padStart(40, "4f")}`,
    provider,
    networkId: "canton-localnet-1",
    connectedAt: new Date().toISOString(),
    custodyMode: provider === "fireblocks" || provider === "ledger" ? "external" : "managed",
    role: "Full seat • Certified Signer",
    tier: "Tier 2 Professional",
    connected: true,
    signature: `0x${Math.random().toString(16).slice(2, 16)}...`,
  };

  saveSession(session);
  return session;
}

export async function disconnect(): Promise<void> {
  clearSession();
}
