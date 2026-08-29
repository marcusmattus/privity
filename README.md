# Privity

Tokenised allocations settled atomically against stablecoin on the Canton Network.
Counterparties see the trade. Nobody else does.

**Privity** — the legal doctrine that only parties to a contract have rights or
obligations under it. Third parties have no standing and no claim. That is
Canton's execution model, in the vocabulary the buyers already use.

## What makes this different

1. **Atomic DvP** — units and payment swap in one ledger transaction. No clearing
   party, no settlement risk, no half-completed trade.
2. **Participant-level privacy** — third parties are not sent the transaction at
   all. Not hidden from them; never delivered to them.
3. **Eligibility enforced by the ledger** — a Daml choice precondition, not a
   backend `if`. An ineligible buyer is refused by Canton, not by our API.

## Architecture

```
browser (dApp SDK)  ->  Wallet Gateway  ->  Canton validator
                              |
                              +->  signing provider (participant / custodian)

Next.js server routes  ->  ledger-service (FastAPI)  ->  Canton   [reads only]
                     |
                     +->  Supabase  (index + audit; a PROJECTION, not truth)
```

**We never hold keys.** Users connect their own wallet through a Canton Wallet
Gateway, and their signing provider signs. There is no managed party and no
custodial submission — see `docs/canton-integration.md`.

Reads still flow through `ledger-service`, which holds the `C8_*` credentials
server-side. `lib/ledger.ts` imports `server-only` so a client component pulling
it in is a build error.

## Getting started

```bash
cp .env.example .env.local     # fill in C8_* and Supabase values
npm install
npm run dev
```

Ledger bridge, in a second terminal — see `ledger-service/README.md`.
Build against **LocalNet**: the toolkit flags DevNet party allocation as unverified.

## Three traps, up front

- **A balance is a set of contracts, not a number.** Concurrent transfers can
  compete for the same contract. Contract count is a visible UI column for this
  reason.
- **`transferKind` decides whether money moved.** `direct` settled; `offer`
  created an instruction and the balance has *not* moved. Reporting `offer` as
  settled is the worst bug available here.
- **Transfers need disclosed contracts from the registry.** Ask for the transfer
  factory and choice context. Hand-building the command fails opaquely.

## Status

Phase 0 — scaffold. Landing hero, design system, ledger bridge, schema,
Daml model, wallet connect.

**Before anything else:** `npm install @canton-network/dapp-sdk` and pin the
resolved version. `package.json` says `"latest"` because the correct version was
not verified at scaffold time. Then verify every call in `lib/wallet.ts` against
that version's README — the SDK is pre-1.0 and the shapes there have not been run.

Next: `dpm test` green, then portfolio reading the index.

## Docs

| File | Contents |
|---|---|
| `docs/build-prompt.md` | Phases, data model, API surface, permission model |
| `docs/landing-page.md` | Brand, tokens, logo, landing structure, copy rules |
| `docs/ui-screens.md` | Every app screen, state by state |
| `docs/canton-integration.md` | Wallet Gateway topology, local setup, dpm toolchain |
