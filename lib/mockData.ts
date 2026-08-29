import {
  Offering,
  Holding,
  SettlementRecord,
  EligibilityProfile,
  PartySession,
  HoldingHistoricalPerformance,
  PerformanceDataPoint,
  HoldingMetrics,
} from "./types";

// Helper to generate realistic historical time series for any holding asset
export function generateAssetPerformance(
  symbol: string,
  units: number,
  currentValuation: number,
  assetType: "Equity" | "Fund Units" | "Stablecoin"
): { historicalPerformance: HoldingHistoricalPerformance; metrics: HoldingMetrics } {
  const currentUnitPrice = units > 0 ? currentValuation / units : 1.0;
  
  // Growth rate characteristics per asset
  let baseReturn30d = 0.08;
  let baseReturn90d = 0.22;
  let baseReturn1y = 0.45;
  let baseCostBasis = currentValuation * 0.85;
  let volatility = 14.5;
  let sharpe = 1.84;

  if (symbol.includes("AURORA")) {
    baseReturn30d = 0.142;
    baseReturn90d = 0.285;
    baseReturn1y = 0.480;
    baseCostBasis = currentValuation * 0.82;
    volatility = 16.2;
    sharpe = 2.15;
  } else if (symbol.includes("NOVA")) {
    baseReturn30d = 0.084;
    baseReturn90d = 0.182;
    baseReturn1y = 0.321;
    baseCostBasis = currentValuation * 0.88;
    volatility = 11.8;
    sharpe = 1.92;
  } else if (symbol.includes("ORION")) {
    baseReturn30d = 0.185;
    baseReturn90d = 0.412;
    baseReturn1y = 0.650;
    baseCostBasis = currentValuation * 0.76;
    volatility = 19.4;
    sharpe = 2.48;
  } else if (symbol.includes("LYRA")) {
    baseReturn30d = 0.052;
    baseReturn90d = 0.118;
    baseReturn1y = 0.224;
    baseCostBasis = currentValuation * 0.92;
    volatility = 9.4;
    sharpe = 1.65;
  } else if (symbol === "USDC" || assetType === "Stablecoin") {
    baseReturn30d = 0.0042; // Yield tracking ~5.1% APY
    baseReturn90d = 0.0128;
    baseReturn1y = 0.0512;
    baseCostBasis = currentValuation;
    volatility = 0.15;
    sharpe = 4.80;
  }

  // 7 Days (daily)
  const series7d: PerformanceDataPoint[] = [];
  const days7 = ["May 02", "May 03", "May 04", "May 05", "May 06", "May 07", "May 08"];
  const return7d = baseReturn30d * 0.22;
  days7.forEach((date, i) => {
    const progress = i / (days7.length - 1);
    const jitter = assetType === "Stablecoin" ? 0 : Math.sin(i * 1.8) * 0.006;
    const factor = 1 - return7d * (1 - progress) + jitter;
    const price = currentUnitPrice * factor;
    const value = units * price;
    const changePct = ((price / (currentUnitPrice * (1 - return7d)) - 1) * 100);
    series7d.push({
      date,
      timestamp: `2026-05-0${i + 2}T14:00:00Z`,
      unitPrice: Number(price.toFixed(4)),
      holdingValue: Math.round(value),
      changePct: Number(changePct.toFixed(2)),
      volumeUsdc: Math.round(units * 0.04 * (1 + Math.cos(i))),
    });
  });

  // 30 Days (Sampled points across 30 days)
  const series30d: PerformanceDataPoint[] = [];
  const days30 = [
    { label: "Apr 09", day: 1 },
    { label: "Apr 12", day: 4 },
    { label: "Apr 15", day: 7 },
    { label: "Apr 18", day: 10 },
    { label: "Apr 21", day: 13 },
    { label: "Apr 24", day: 16 },
    { label: "Apr 27", day: 19 },
    { label: "Apr 30", day: 22 },
    { label: "May 03", day: 25 },
    { label: "May 06", day: 28 },
    { label: "May 08", day: 30 },
  ];
  days30.forEach((item, i) => {
    const progress = item.day / 30;
    const wave = assetType === "Stablecoin" ? 0 : Math.sin(i * 1.3) * 0.015 - Math.cos(i * 0.9) * 0.008;
    const factor = 1 - baseReturn30d * (1 - progress) + wave;
    const price = currentUnitPrice * factor;
    const value = units * price;
    const changePct = ((price / (currentUnitPrice * (1 - baseReturn30d)) - 1) * 100);
    series30d.push({
      date: item.label,
      timestamp: `2026-04-${String(item.day).padStart(2, "0")}T14:00:00Z`,
      unitPrice: Number(price.toFixed(4)),
      holdingValue: Math.round(value),
      changePct: Number(changePct.toFixed(2)),
      volumeUsdc: Math.round(units * 0.08 * (1 + Math.sin(i))),
    });
  });

  // 90 Days (Sampled bi-weekly points across 90 days)
  const series90d: PerformanceDataPoint[] = [];
  const days90 = [
    { label: "Feb 08", day: 1 },
    { label: "Feb 22", day: 15 },
    { label: "Mar 08", day: 30 },
    { label: "Mar 22", day: 45 },
    { label: "Apr 05", day: 60 },
    { label: "Apr 20", day: 75 },
    { label: "May 08", day: 90 },
  ];
  days90.forEach((item, i) => {
    const progress = item.day / 90;
    const wave = assetType === "Stablecoin" ? 0 : Math.sin(i * 1.1) * 0.022;
    const factor = 1 - baseReturn90d * (1 - progress) + wave;
    const price = currentUnitPrice * factor;
    const value = units * price;
    const changePct = ((price / (currentUnitPrice * (1 - baseReturn90d)) - 1) * 100);
    series90d.push({
      date: item.label,
      timestamp: `2026-02-${String(item.day).padStart(2, "0")}T14:00:00Z`,
      unitPrice: Number(price.toFixed(4)),
      holdingValue: Math.round(value),
      changePct: Number(changePct.toFixed(2)),
      volumeUsdc: Math.round(units * 0.12 * (1 + Math.cos(i))),
    });
  });

  // 1 Year (Monthly points)
  const series1y: PerformanceDataPoint[] = [];
  const months1y = [
    "May 25", "Jun 25", "Jul 25", "Aug 25", "Sep 25", "Oct 25",
    "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26"
  ];
  months1y.forEach((date, i) => {
    const progress = i / (months1y.length - 1);
    const wave = assetType === "Stablecoin" ? 0 : Math.sin(i * 0.8) * 0.035;
    const factor = 1 - baseReturn1y * (1 - progress) + wave;
    const price = currentUnitPrice * factor;
    const value = units * price;
    const changePct = ((price / (currentUnitPrice * (1 - baseReturn1y)) - 1) * 100);
    series1y.push({
      date,
      timestamp: `2025-${String(i + 5).padStart(2, "0")}-01T14:00:00Z`,
      unitPrice: Number(price.toFixed(4)),
      holdingValue: Math.round(value),
      changePct: Number(changePct.toFixed(2)),
      volumeUsdc: Math.round(units * 0.25 * (1 + Math.sin(i * 0.5))),
    });
  });

  const unrealizedGain = currentValuation - baseCostBasis;
  const unrealizedGainPct = baseCostBasis > 0 ? (unrealizedGain / baseCostBasis) * 100 : 0;

  return {
    historicalPerformance: {
      "7d": series7d,
      "30d": series30d,
      "90d": series90d,
      "1y": series1y,
    },
    metrics: {
      costBasisUsdc: Math.round(baseCostBasis),
      unrealizedGainUsdc: Math.round(unrealizedGain),
      unrealizedGainPct: Number(unrealizedGainPct.toFixed(2)),
      periodReturnPct: Number((baseReturn30d * 100).toFixed(2)),
      high52w: Number((currentUnitPrice * 1.05).toFixed(4)),
      low52w: Number((currentUnitPrice * (1 - baseReturn1y * 0.9)).toFixed(4)),
      annualizedVolatilityPct: volatility,
      sharpeRatio: sharpe,
      lastMarkDate: "8 May 2026 14:31 UTC",
    },
  };
}

export const INITIAL_OFFERINGS: Offering[] = [
  {
    id: "aurora-seq-1",
    instrument: {
      symbol: "AURORA-SEQ-1",
      name: "Aurora Labs Ltd.",
      kind: "equity",
      issuerParty: "AuroraIssuer::12204a8b79f82d1c63e41209bca7f93802e3b1c6d9",
      jurisdiction: "BVI",
      decimals: 4,
    },
    title: "AURORA SEQ-1",
    subtitle: "Tokenised equity in Aurora Labs Ltd.",
    description:
      "A high-growth fintech infrastructure company specialising in permissioned settlement rails and institutional payment gateways. Secondary allocation offered by institutional seed syndicate.",
    pricePerUnit: 1.00,
    totalUnits: 5000000,
    unitsRemaining: 3420000,
    minAllocationUsdc: 100000,
    settlementToken: "USDC",
    closingDate: "31 May 2026",
    settlementType: "T+0 Atomic DvP",
    transferKind: "direct",
    status: "open",
    requiredTier: "Tier 2 Professional",
    preApprovalRequired: false,
  },
  {
    id: "nova-growth-fund",
    instrument: {
      symbol: "NOVA GROWTH FUND",
      name: "Nova Growth Fund LP",
      kind: "fund_unit",
      issuerParty: "NovaGP::122091c3ef7182a5371c6d4829fa771829e018a7c",
      jurisdiction: "Cayman Islands",
      decimals: 4,
    },
    title: "NOVA GROWTH FUND",
    subtitle: "Tokenised fund units in Nova Growth Fund IV LP",
    description:
      "Direct LP interest allocation in venture growth fund focused on decentralised computing, cryptographic privacy architectures, and next-generation clearing platforms.",
    pricePerUnit: 1.00,
    totalUnits: 10000000,
    unitsRemaining: 7150000,
    minAllocationUsdc: 50000,
    settlementToken: "USDC",
    closingDate: "15 Jun 2026",
    settlementType: "T+0 Atomic DvP",
    transferKind: "offer",
    status: "open",
    requiredTier: "Tier 2 Professional",
    preApprovalRequired: true,
  },
  {
    id: "orion-series-a",
    instrument: {
      symbol: "ORION SERIES A",
      name: "Orion Technologies Inc.",
      kind: "equity",
      issuerParty: "OrionIssuer::1220bf9918237c182937ac19827391726381928371",
      jurisdiction: "Delaware, US",
      decimals: 4,
    },
    title: "ORION SERIES A",
    subtitle: "Tokenised equity in Orion Technologies Inc.",
    description:
      "Series A Preferred share tranche. Orion develops zero-knowledge transaction verifiers and verifiable compute coprocessors for tier-1 investment banks.",
    pricePerUnit: 1.00,
    totalUnits: 7500000,
    unitsRemaining: 2800000,
    minAllocationUsdc: 250000,
    settlementToken: "USDC",
    closingDate: "20 Jul 2026",
    settlementType: "T+0 Atomic DvP",
    transferKind: "direct",
    status: "open",
    requiredTier: "Tier 2 Professional",
    preApprovalRequired: false,
  },
  {
    id: "lyra-token-r1",
    instrument: {
      symbol: "LYRA TOKEN R1",
      name: "Lyra Infrastructure Fund",
      kind: "equity",
      issuerParty: "LyraIssuer::1220a4f382910384729184719283719283719283",
      jurisdiction: "Luxembourg",
      decimals: 4,
    },
    title: "LYRA TOKEN R1",
    subtitle: "Tokenised core equity units",
    description:
      "Restricted institutional class offering. Institutional validator node infrastructure and renewable compute assets.",
    pricePerUnit: 1.00,
    totalUnits: 15000000,
    unitsRemaining: 11200000,
    minAllocationUsdc: 500000,
    settlementToken: "USDC",
    closingDate: "30 Sep 2026",
    settlementType: "T+0 Atomic DvP",
    transferKind: "direct",
    status: "open",
    requiredTier: "Tier 3 Institutional",
    preApprovalRequired: false,
  },
];

export const INITIAL_HOLDINGS: Holding[] = [
  {
    id: "h-aurora",
    instrumentSymbol: "AURORA-SEQ-1",
    name: "Aurora Labs Ltd.",
    type: "Equity",
    units: 250000.0,
    valuationUsdc: 250000.0,
    contractCount: 3,
    state: "settled",
    contractCids: [
      "004a8b79f82d1c63e41209bca7f93802e3b1c6d9-01",
      "004a8b79f82d1c63e41209bca7f93802e3b1c6d9-02",
      "004a8b79f82d1c63e41209bca7f93802e3b1c6d9-03",
    ],
    ...generateAssetPerformance("AURORA-SEQ-1", 250000.0, 250000.0, "Equity"),
  },
  {
    id: "h-nova",
    instrumentSymbol: "NOVA GROWTH FUND",
    name: "Nova Growth Fund LP",
    type: "Fund Units",
    units: 125000.0,
    valuationUsdc: 125000.0,
    contractCount: 2,
    state: "pending_acceptance",
    contractCids: [
      "0091c3ef7182a5371c6d4829fa771829e018a7c-01",
      "0091c3ef7182a5371c6d4829fa771829e018a7c-02",
    ],
    ...generateAssetPerformance("NOVA GROWTH FUND", 125000.0, 125000.0, "Fund Units"),
  },
  {
    id: "h-orion",
    instrumentSymbol: "ORION SERIES A",
    name: "Orion Technologies Inc.",
    type: "Equity",
    units: 750000.0,
    valuationUsdc: 750000.0,
    contractCount: 5,
    state: "settled",
    contractCids: [
      "00bf9918237c182937ac19827391726381928371-01",
      "00bf9918237c182937ac19827391726381928371-02",
      "00bf9918237c182937ac19827391726381928371-03",
      "00bf9918237c182937ac19827391726381928371-04",
      "00bf9918237c182937ac19827391726381928371-05",
    ],
    ...generateAssetPerformance("ORION SERIES A", 750000.0, 750000.0, "Equity"),
  },
  {
    id: "h-lyra",
    instrumentSymbol: "LYRA TOKEN R1",
    name: "Lyra Infrastructure",
    type: "Equity",
    units: 500000.0,
    valuationUsdc: 500000.0,
    contractCount: 1,
    state: "pending_acceptance",
    contractCids: ["00a4f382910384729184719283719283719283-01"],
    ...generateAssetPerformance("LYRA TOKEN R1", 500000.0, 500000.0, "Equity"),
  },
  {
    id: "h-usdc",
    instrumentSymbol: "USDC",
    name: "USD Coin Holding",
    type: "Stablecoin",
    units: 3606945.0,
    valuationUsdc: 3606945.0,
    contractCount: 14,
    state: "settled",
    contractCids: ["00128371829381729381273918273918273918-all"],
    ...generateAssetPerformance("USDC", 3606945.0, 3606945.0, "Stablecoin"),
  },
];

export const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  {
    id: "s-1",
    timeUtc: "14:31:46",
    date: "8 May 2026",
    instrument: "AURORA-SEQ-1",
    type: "Equity",
    units: 250000.0,
    consideration: 250000.0,
    currency: "USDC",
    counterparty: "party_x7f3...9a2c",
    buyerParty: "Privity::1220a4f938291847182938471928371928e2",
    sellerParty: "AuroraIssuer::12204a8b79f82d1c63e41209bca7f93802e3b1c6d9",
    kind: "direct",
    state: "settled",
    instructionCid: "0x7f3a...b52e",
    disclosedContracts: 4,
    ledgerOffset: "000000000000004921",
    timeline: [
      { step: "initiated", time: "14:31:40", description: "Units (250,000) and consideration (250,000.00 USDC) locked" },
      { step: "quoted", time: "14:31:41", description: "Registry confirmed transferKind: direct (pre-approved)" },
      { step: "submitted", time: "14:31:43", description: "Command submitted to Canton Ledger API with 4 disclosed contracts" },
      { step: "settled", time: "14:31:46", description: "Atomic DvP completed. Units and stablecoin swapped simultaneously." },
    ],
  },
  {
    id: "s-2",
    timeUtc: "14:28:12",
    date: "8 May 2026",
    instrument: "NOVA GROWTH FUND",
    type: "Fund Units",
    units: 125000.0,
    consideration: 125000.0,
    currency: "USDC",
    counterparty: "party_k9d2...1f8e",
    buyerParty: "Privity::1220a4f938291847182938471928371928e2",
    sellerParty: "NovaGP::122091c3ef7182a5371c6d4829fa771829e018a7c",
    kind: "offer",
    state: "pending_acceptance",
    instructionCid: "0x9f3a...b52e",
    disclosedContracts: 2,
    ledgerOffset: "000000000000004918",
    timeline: [
      { step: "initiated", time: "14:28:05", description: "Subscription initiated for 125,000 fund units" },
      { step: "quoted", time: "14:28:07", description: "Transfer kind returned: offer (no pre-approval)" },
      { step: "submitted", time: "14:28:10", description: "TransferInstruction created on ledger with 2 disclosed contracts" },
      { step: "pending", time: "14:28:12", description: "Awaiting receiver acceptance. Balance has NOT moved yet." },
    ],
  },
  {
    id: "s-3",
    timeUtc: "14:25:33",
    date: "8 May 2026",
    instrument: "ORION SERIES A",
    type: "Equity",
    units: 750000.0,
    consideration: 750000.0,
    currency: "USDC",
    counterparty: "party_m4a1...7c0b",
    buyerParty: "Privity::1220a4f938291847182938471928371928e2",
    sellerParty: "OrionIssuer::1220bf9918237c182937ac19827391726381928371",
    kind: "direct",
    state: "settled",
    instructionCid: "0x4a1b...88cd",
    disclosedContracts: 5,
    ledgerOffset: "000000000000004902",
    timeline: [
      { step: "initiated", time: "14:25:27", description: "Subscription locked for 750,000 units" },
      { step: "quoted", time: "14:25:28", description: "Registry returned transferKind: direct" },
      { step: "submitted", time: "14:25:30", description: "Command submitted with 5 disclosed contracts" },
      { step: "settled", time: "14:25:33", description: "Atomic swap executed successfully in single Canton transaction" },
    ],
  },
  {
    id: "s-4",
    timeUtc: "14:22:07",
    date: "8 May 2026",
    instrument: "LYRA TOKEN R1",
    type: "Equity",
    units: 500000.0,
    consideration: 500000.0,
    currency: "USDC",
    counterparty: "party_w8e2...33da",
    buyerParty: "Privity::1220a4f938291847182938471928371928e2",
    sellerParty: "LyraIssuer::1220a4f382910384729184719283719283719283",
    kind: "direct",
    state: "rejected",
    instructionCid: "0x118b...e92f",
    disclosedContracts: 1,
    errorCode: "ELIGIBILITY_REQUIREMENT_FAILED: Holding contract missing valid Tier 3 institutional attestation in jurisdiction",
    timeline: [
      { step: "initiated", time: "14:22:01", description: "Subscription initiated" },
      { step: "quoted", time: "14:22:02", description: "Quote generated" },
      { step: "submitted", time: "14:22:05", description: "Command submitted to ledger" },
      { step: "rejected", time: "14:22:07", description: "Ledger precondition failed: Daml choice aborted on-ledger due to tier requirement." },
    ],
  },
];

export const INITIAL_ELIGIBILITY: EligibilityProfile = {
  status: "eligible",
  tier: "Professional (Tier 2)",
  jurisdiction: "BVI",
  accredited: true,
  expiryDate: "12 Jan 2027",
  contractCid: "004a8b79f82d1c63e41209bca7f93802e3b1c6d9",
  issuerParty: "PrivityKYC::1220371928371928371928371928371928371928",
  attestationStep: "issued",
};

export const INITIAL_SESSION: PartySession = {
  partyId: "Privity::1220a4f938291847182938471928371928e2",
  partyName: "Acme Capital Partners",
  email: "ops@acmecapital.com",
  role: "Full seat",
  custodyMode: "managed",
  isLocal: true,
  preApprovalActive: true,
  mfaEnabled: true,
};

export const NAV_SERIES = [
  { day: "01", nav: 100.0, value: 4850000 },
  { day: "05", nav: 101.2, value: 4908000 },
  { day: "10", nav: 102.5, value: 4971000 },
  { day: "15", nav: 104.1, value: 5048000 },
  { day: "20", nav: 105.8, value: 5131000 },
  { day: "25", nav: 106.9, value: 5184000 },
  { day: "30", nav: 107.87, value: 5231945 },
];
