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
browser  ->  Next.js server routes  ->  ledger-service (FastAPI)  ->  Canton
                     |
                     +->  Supabase  (index + audit; a PROJECTION, not truth)
```

No Canton credential, party key, or `C8_*` variable ever reaches the client
bundle. `lib/ledger.ts` imports `server-only` to make that a build error.

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

Phase 0 — scaffold. Landing hero, design system, ledger bridge, schema.

Next: `app/signin`, `POST /api/party/ensure`, portfolio reading the index.
See `docs/` for the full phased build.

## Docs

| File | Contents |
|---|---|
| `docs/build-prompt.md` | Phases, data model, API surface, permission model |
| `docs/landing-page.md` | Brand, tokens, logo, landing structure, copy rules |
| `docs/ui-screens.md` | Every app screen, state by state |
