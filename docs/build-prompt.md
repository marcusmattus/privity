# Build prompt — Canton tokenised allocation platform

Paste this into a coding agent. Build phases in order. Each phase must run and demo on its own before starting the next.

---

## 0. Context

We are building a web app on the **Canton Network** for tokenised crypto-company IPO/pre-IPO allocations and fund units, settled against a stablecoin holding via **atomic delivery-versus-payment**.

The differentiator is not the UI. It is that:
1. A trade is one ledger transaction — units and payment swap atomically, no clearing party, no settlement risk.
2. Third parties cannot see the trade. Canton participants only receive transactions they are party to.
3. Investor eligibility is enforced **by the ledger**, as a Daml contract precondition — not by a backend `if` statement.

Reference toolkit (already exists, do not rewrite): `github.com/Cantor8/hackathon-toolkit`
- `c8lab.py` — stdlib-only Python. Token, party allocation, preapproval, holdings, transfer.
- `daml-starter/` — working Daml to copy from.
- `SETUP.md`, `API.md`, `TROUBLESHOOTING.md` — read before debugging anything.

**Build against LocalNet.** The toolkit flags DevNet party allocation as unverified (it may require the external-party topology flow rather than `POST /v2/parties`). Do not lose an afternoon to this.

---

## 1. Stack

| Layer | Choice |
|---|---|
| Web | Next.js (App Router) + TypeScript + Tailwind |
| DB / index | Supabase (Postgres + RLS + Realtime) |
| Ledger bridge | Thin Python FastAPI service wrapping `c8lab.py` |
| Ledger | Canton LocalNet via Docker |
| Contracts | Daml, extended from `daml-starter/` |
| Auth | Keycloak OIDC (the toolkit's `C8_IDP`) |

### Why a Python bridge and not a TS ledger client

`c8lab.py` is tested and handles the two-phase registry transfer correctly. Reimplementing it in TypeScript during a build window is how you lose the day. Wrap it:

```
Next.js server route  →  ledger-service (FastAPI)  →  Canton Ledger API
```

`ledger-service` is **server-side only**. It is never reachable from the browser. It holds `C8_CLIENT_SECRET`, `C8_BASE`, `C8_IDP`, `C8_REGISTRY`.

---

## 2. Non-negotiables

- No Canton credential, party key, or `C8_*` env var ever reaches the client bundle.
- Every ledger write goes through one gated server route. No ad-hoc calls.
- Eligibility is checked **on the ledger**, in the Daml choice. The backend check is a UX convenience that duplicates it, never replaces it.
- Every gated action writes an audit row — including denials and failures.
- A failed settlement is never rendered as success. `not attempted` / `failed` / `unknown outcome` are three distinct states.
- Balances are **contract sets, not numbers**. Never cache a scalar balance as truth.
- Before debugging a "money didn't arrive" bug, check `transferKind`.

### Managed parties — read this before designing auth

Keycloak authenticates a *user*. It does not sign ledger transactions. Canton parties are allocated on the participant node and signed for there, so the backend maps each authenticated user to a party it hosts and submits on their behalf.

This is custodial. Do not imply otherwise in the UI — label it "managed party" and show the party ID.

The upgrade path (out of scope for now) is Canton's external-party topology flow, where the user holds the key. Keep the `custody_mode` column on `parties` so that can flip later without migration pain.

Note for later: browser wallet SDKs (Privy, Dynamic, and similar) are EVM/Solana and **cannot sign Canton transactions**. If one is added, it is an identity provider only — it does not change the custody model above.

---

## 3. Data model (Supabase)

```sql
users            id, auth_provider('keycloak'), provider_subject, email, created_at
parties          id, user_id, canton_party_id, is_local, custody_mode('managed'), allocated_at
eligibility      id, party_id, jurisdiction, tier, contract_cid, expires_at, revoked_at
instruments      id, symbol, name, kind('stablecoin'|'allocation'|'fund_unit'), issuer_party, decimals
offerings        id, instrument_id, price_per_unit, total_units, units_remaining,
                 opens_at, closes_at, status('draft'|'open'|'closed'|'settled')
holdings_index   id, party_id, instrument_id, contract_cid, amount, locked, ledger_offset, seen_at
settlements      id, offering_id, buyer_party, seller_party, instrument_id, units, consideration,
                 state, transfer_kind, instruction_cid, error_code, initiated_at, settled_at
ledger_cursor    id, stream_name, offset, updated_at
audit_log        id, ts, user_id, party_id, action, tier, params_hash,
                 approval_status, result_status, latency_ms, error
```

RLS: a user reads only rows joined to their own `party_id`. `audit_log` is insert-only from the service role, never client-readable. `offerings` and public `instruments` are readable by any authenticated user.

`holdings_index` is a **projection**, never a source of truth. It is rebuildable from the ledger by replaying from offset 0.

---

## 4. API surface

All under `/api`, all server-side, all audited.

```
POST /auth/session            exchange Keycloak token → app session
POST /party/ensure            allocate-or-reuse a Canton party for the session user
GET  /party/me                party id, isLocal, custody mode, preapproval status
POST /party/preapproval       create TransferPreapproval (step 3 of the lab)

GET  /holdings                from holdings_index, with a ledger-freshness timestamp
GET  /offerings               list
GET  /offerings/:id           detail + remaining units
POST /offerings/:id/quote     price, fees, eligibility precheck — no side effects
POST /offerings/:id/subscribe HIGH_RISK. Atomic DvP. Requires explicit confirm token.

GET  /settlements             history for the session party
GET  /settlements/:id         single, with state machine position
POST /settlements/:id/accept  accept an offer-kind transfer

GET  /eligibility/me          current tier + expiry
POST /eligibility/attest      submit attestation → issuer creates the contract

GET  /nav/:instrument         NAV series from the index
```

`/quote` must never mutate. `/subscribe` must be idempotent on a client-supplied key.

---

## 5. Permission model

Tier is assigned to the **route**, at registration, not at call time.

| Tier | Routes | Confirm |
|---|---|---|
| `READ` | holdings, offerings, settlements, nav, eligibility/me | none |
| `WRITE` | party/ensure, party/preapproval, eligibility/attest | none |
| `EXTERNAL_ACTION` | settlements/accept | inline confirm |
| `HIGH_RISK` | offerings/:id/subscribe | modal confirm, always |

`HIGH_RISK` requires confirmation in every configuration. Make that a property of the gate, not a setting — there must be no config path that silently permits an irreversible transfer.

The confirm modal shows: instrument, unit count, total consideration, counterparty party ID, and **reversibility** ("this settles atomically and cannot be undone").

Gate order for every write: route exists → schema validates → tier permitted → confirm token present → rate limit → execute → validate result shape → audit row.

---

## 6. Phases

### Phase 0 — vertical slice, read-only

Smallest loop that touches every layer.

- LocalNet up per `SETUP.md`. `python3 c8lab.py check` green.
- `ledger-service` with `GET /health`, `GET /parties`, `GET /holdings/:party`.
- Next.js app, Keycloak sign-in, session in Supabase.
- `POST /party/ensure` allocates a party via `allocate_party(hint)`, stores it. **Only reuse parties where `isLocal` is true** — non-local parties fail with `NO_SYNCHRONIZER_ON_WHICH_ALL_SUBMITTERS_CAN_SUBMIT`.
- Dashboard renders live holdings, straight from the ledger.
- One audit row written.

Ship when: a new user signs in with Keycloak, gets a party, and sees a balance.

### Phase 1 — the index

- Indexer worker streams the ACS from `ledger_cursor.offset`, writes `holdings_index`, advances the cursor.
- Dashboard now reads the index, with a "synced Xs ago" indicator.
- Rebuild-from-zero command, and a test that proves index totals equal a live `holdings()` call.

Ship when: killing and restarting the indexer produces an identical index.

### Phase 2 — settlement state machine

States: `initiated → quoted → submitting → pending_acceptance → settled` plus `failed`.

- `POST /settlements` wraps `transfer(from, to, amount)`.
- Branch on `transferKind`:
  - `direct` → settled, receiver has a live preapproval.
  - `offer` → persist `instructionCid`, state `pending_acceptance`, surface the accept action. **The balance does not change until accepted** — the UI must say so explicitly.
  - `self` → reject with a clear message.
- Preapproval acceptance is not instant — the validator's automation accepts a moment later. Poll, don't assume.
- Realtime pushes state changes to the dashboard.

Ship when: a transfer to a party without preapproval shows `pending_acceptance`, and accepting it moves the balance.

### Phase 3 — eligibility + atomic DvP

The demo phase. Both halves matter.

**Daml**, extending `daml-starter/`:
- `Eligibility` — issuer signatory, holder observer, jurisdiction, tier, expiry.
- `FundUnit` holding template.
- `SubscriptionOffer` with a `Subscribe` choice that:
  - requires a non-expired `Eligibility` for the buyer,
  - archives the buyer's stablecoin holding and the seller's unit holding,
  - creates the swapped pair,
  - **all in one transaction.**

**App:** `/offerings/:id/subscribe` builds the command, attaches disclosed contracts from the registry, submits. Do not hand-build the transfer — ask the registry for the transfer factory and choice context first. Skipping this fails with an error that does not explain itself.

Ship when you can demo, back to back:
1. Eligible buyer subscribes → units and stablecoin swap in one transaction.
2. Ineligible buyer subscribes → **the ledger rejects it**. Show the error. Point out no backend check ran.

### Phase 4 — NAV, exposure, and optional agent layer

- NAV series from the index; portfolio exposure by instrument.
- Optional: chat over the index. `READ` tools only at first (`portfolio.summary`, `settlement.history`, `offering.search`). If you add `settlement.execute`, it is `HIGH_RISK`, approval-gated, and additionally bounded by an on-ledger mandate contract so a compromised backend still cannot overspend.

---

## 7. Landing page

Single scroll, no fluff. The argument is privacy, and it lands best as a demonstration rather than a claim.

1. **Hero** — one sentence on what settles here, one CTA ("View offerings"), one secondary ("Sign in").
2. **The problem** — a public-chain block explorer view of an address: every payment, current holdings, counterparties. Caption: *now make this your cap table.* This is the strongest thing on the page; give it room.
3. **What's different** — three cards: atomic settlement, participant-level privacy, eligibility enforced on-ledger.
4. **How it works** — sign in → verify eligibility → subscribe → settles atomically. Four steps, no more.
5. **Open offerings** — live from the API, three cards, unauthenticated view shows terms but not the subscribe action.
6. **Compliance strip** — plain statement of what this is and who can access it. Do not hide it in a footer.
7. **Footer** — docs, GitHub, contact.

Dark, dense, financial. Tabular numerals everywhere a figure appears. No gradient-heavy crypto styling — the audience is institutional and it reads as a tell.

---

## 8. Dashboard

Left sidebar: Portfolio · Offerings · Settlements · Eligibility · Settings.

**Portfolio** — total value, NAV chart, holdings table (instrument, units, value, locked). Show contract count per instrument somewhere visible; it makes the contracts-not-a-number model legible and explains why a settlement can fail under concurrency.

**Offerings** — grid, then detail with a subscribe panel showing quote, eligibility state, and the confirm modal.

**Settlements** — table with an explicit state column. `pending_acceptance` rows carry an inline Accept action. Failed rows show the real error, never a generic one.

**Eligibility** — current tier, expiry, attestation flow, and the contract ID so it's verifiable.

**Settings** — party ID (copyable), preapproval status with a create action, custody mode, sign-out.

### UI states to build explicitly

Every async surface: `idle` / `loading` / `empty` / `error` / `stale`. Settlement adds `pending_acceptance` and `unknown` (timeout after submit — say "we don't yet know whether this settled", never guess).

Empty states matter here: a new party has zero holdings and that is correct, not broken. Say so.

---

## 9. Tests

- `party/ensure` is idempotent — twice returns the same party.
- Non-local party is rejected before submission.
- Index totals equal a live ledger read.
- Index rebuild from offset 0 is deterministic.
- `offer`-kind transfer leaves the receiver balance unchanged until accept.
- Subscribe is idempotent on the client key — a double-submit settles once.
- **Ineligible buyer is rejected by the ledger**, with the backend precheck disabled.
- Concurrent subscribes against the same holding: one settles, one fails cleanly, neither corrupts the index.
- Audit rows exist for denials and failures, not only successes.

---

## 10. Confirm before building

- **Keycloak realm and client** — reuse the toolkit's `hackathon` client, or a separate one for the web app?
- **Custodial parties acceptable?** Assumed yes. External-party topology is a substantially larger build.
- **Stablecoin instrument** — Canton Coin / Amulet on LocalNet as a stand-in, or a purpose-issued Daml stablecoin template?
- **Who issues `Eligibility`?** A single issuer party for the demo, or per-offering issuers?
