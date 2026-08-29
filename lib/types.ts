export interface Instrument {
  symbol: string;
  name: string;
  kind: "equity" | "fund_unit" | "stablecoin";
  issuerParty: string;
  jurisdiction: string;
  decimals: number;
}

export interface Offering {
  id: string;
  instrument: Instrument;
  title: string;
  subtitle: string;
  description: string;
  pricePerUnit: number;
  totalUnits: number;
  unitsRemaining: number;
  minAllocationUsdc: number;
  settlementToken: string;
  closingDate: string;
  settlementType: "T+0 Atomic DvP";
  transferKind: "direct" | "offer";
  status: "open" | "closed" | "settled";
  requiredTier: string;
  preApprovalRequired: boolean;
}

export interface Holding {
  id: string;
  instrumentSymbol: string;
  name: string;
  type: "Equity" | "Fund Units" | "Stablecoin";
  units: number;
  valuationUsdc: number;
  contractCount: number;
  state: "settled" | "pending_acceptance";
  contractCids: string[];
}

export interface SettlementRecord {
  id: string;
  timeUtc: string;
  date: string;
  instrument: string;
  type: "Equity" | "Fund Units" | "Stablecoin";
  units: number;
  consideration: number;
  currency: string;
  counterparty: string;
  buyerParty: string;
  sellerParty: string;
  kind: "direct" | "offer" | "self";
  state: "settled" | "pending_acceptance" | "rejected" | "unknown";
  instructionCid?: string;
  disclosedContracts: number;
  ledgerOffset?: string;
  errorCode?: string;
  timeline: {
    step: string;
    time: string;
    description: string;
  }[];
}

export interface EligibilityProfile {
  status: "eligible" | "pending" | "expired" | "ineligible";
  tier: string;
  jurisdiction: string;
  accredited: boolean;
  expiryDate: string;
  contractCid: string;
  issuerParty: string;
  attestationStep: "submitted" | "under_review" | "issued";
}

export interface PartySession {
  partyId: string;
  partyName: string;
  email: string;
  role: string;
  custodyMode: "managed" | "external";
  isLocal: boolean;
  preApprovalActive: boolean;
  mfaEnabled: boolean;
}
