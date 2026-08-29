# Build prompt — Privity UI, screen by screen

Third document. Read `canton-landing-page-prompt.md` first — tokens, components and copy rules come from there and are not repeated.

Build screens in the order listed. Each ships independently.

---

## Shell

Everything after the landing page lives inside one shell.

```
┌──────────────────────────────────────────────────────────┐
│ ▬▬ Privity            Portfolio Offerings Settlements  ⌄ │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                      screen content                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Mark top-left, always links to Portfolio.
- Horizontal nav, not a sidebar. Five destinations does not justify a rail, and horizontal keeps the data area full-width — which this product needs, because everything is tables.
- Right slot: party ID (truncated middle, mono, copy-on-click) and an account menu. The party ID is always visible. Users are acting through a managed party and should never have to hunt for which one.
- Sync indicator in the nav: `synced 4s ago` in mono, `--pending` if over 30s, `--withheld` text if the indexer is unreachable. This is a projection of the ledger — say how fresh it is, always.
- Mobile: nav collapses to a bottom bar of three (Portfolio, Offerings, Settlements). Party ID moves into the account sheet.

---

## 1. Sign in

Single centred card on `--ink`. Mark above, one line of context, one button: `Continue with Keycloak`.

Below it, in `--withheld` text: *Privity hosts a managed party on your behalf. Your party ID is shown once you're in.* Say this here rather than burying it — custody is the first thing a professional will ask about, and volunteering it reads better than being asked.

States: `idle`, `redirecting`, `error`. The error case names the failure — IdP unreachable versus rejected credentials are different problems and the copy distinguishes them.

---

## 2. Portfolio (home)

The screen a returning user sees. Answers: what do I hold, what is it worth, what is in flight.

```
┌──────────────────────────────────────────────────────────┐
│  TOTAL VALUE                              PARTY          │
│  1,284,500.00 USDC          Privity::1220a4f…8e2  ⧉      │
├──────────────────────────────────────────────────────────┤
│  ▁▂▄▅▇▆▇  NAV, 30d                                       │
├──────────────────────────────────────────────────────────┤
│  HOLDINGS                                                │
│  INSTRUMENT      UNITS     VALUE      CONTRACTS   STATE  │
│  ORCA-A         1,200   840,000.00        3      ●       │
│  LEDGR-SEED       500   444,500.00        7      ●       │
│  USDC              —      2,410.00       11      ●       │
├──────────────────────────────────────────────────────────┤
│  IN FLIGHT (2)                                    →      │
└──────────────────────────────────────────────────────────┘
```

**Contract count is a real column, not a debug detail.** A holding of 7 contracts behaves differently from 1 — it is why two concurrent settlements can collide. Showing it makes the model legible and pre-explains a failure the user will eventually hit. On hover, a tooltip: *this balance is 7 contracts. Concurrent transfers may compete for the same one.*

Every figure through `Figure` — mono, tabular, right-aligned, decimals aligned.

**In flight** surfaces anything not `settled`. If a row is `pending_acceptance`, it carries an inline `Accept` action here, not just on the settlements screen. That state is the single most confusing thing in the product; put the fix wherever the user sees the problem.

**Empty state** — a new party holds nothing, which is correct rather than broken: *No holdings yet. Your party is allocated and ready. Browse open offerings to make your first subscription.* Plus the primary CTA. Never an error tone.

---

## 3. Offerings

Grid of cards. Each: instrument symbol (mono), name, price per unit, units remaining with a thin progress bar, close date, and an eligibility chip.

Eligibility chip states: `Eligible` (`--settled`), `Verification required` (`--pending`), `Not available in your jurisdiction` (`--withheld`). Third state stays visible with the reason, rather than hiding the card. Silent filtering makes a venue feel arbitrary; a stated reason reads as a rule.

Filters: instrument kind, open/closed, eligibility. No search until there are enough offerings to need it.

---

## 4. Offering detail — the subscribe flow

The most important screen in the product. Two columns: terms left, subscribe panel right (sticky).

**Left:** instrument, issuer party, unit price, total and remaining units, open/close, settlement asset, eligibility requirement, and a `Settlement mechanics` block stating plainly that units and payment swap in one ledger transaction and that a failed leg means no transfer occurred at all.

**Right — the panel, as a state machine:**

```
IDLE          units input · live consideration · [Review subscription]
QUOTING       skeleton on the figures, input locked
QUOTED        breakdown: units, price, consideration, fee, total
              eligibility ✓ · [Subscribe] enabled
INELIGIBLE    reason + what to do · [Subscribe] absent, not disabled
CONFIRMING    modal (below)
SUBMITTING    "Submitting to the ledger" · cancel unavailable, and say so
SETTLED       ✓ atomic swap complete · contract IDs · [View settlement]
FAILED        the actual ledger error · what did not happen · [Try again]
```

`INELIGIBLE` removes the button rather than disabling it — consistent with the site rule that what you cannot act on is not present.

**Confirm modal.** `HIGH_RISK`, required in every configuration, no setting bypasses it. Shows: instrument, unit count, total consideration, counterparty party ID in full, and one line — *This settles atomically and cannot be reversed.* Buttons: `Subscribe` (brand) and `Cancel`. The primary button repeats the action verb; never `Confirm`.

**On `SUBMITTING`, disable navigation away** and say why. A user who tabs off mid-submit and returns to an ambiguous state is the worst outcome available here.

---

## 5. Settlements

Full-width table, the dashboard sibling of the landing blotter — same component, same withheld treatment. Rows the party is not party to do not appear at all here (this is your own history), but the shared component keeps the visual language identical.

Columns: `TIME · INSTRUMENT · UNITS · CONSIDERATION · COUNTERPARTY · KIND · STATE`.

`KIND` is `direct` / `offer` / `self`, straight from the registry. Surface it. When someone reports money not arriving, this column is the answer and support should be able to point at it.

`pending_acceptance` rows: `--pending` pill, inline `Accept`, and a plain sub-line — *The receiver has not accepted. No balance has moved.* Ambiguity here is the product's sharpest edge; over-explain it.

Filters: state, instrument, date range. Export CSV — this audience reconciles in spreadsheets and will ask on day one.

---

## 6. Settlement detail

One record, fully traced. Timeline down the left, evidence right.

```
initiated        14:02:11   units and price locked
quoted           14:02:12   registry returned transferKind: offer
submitted        14:02:14   command sent, 5 disclosed contracts attached
pending          14:02:15   TransferInstruction created
accepted         14:04:02   receiver accepted
settled          14:04:03   holdings archived and recreated
```

Right side: full party IDs both sides, contract IDs archived and created, ledger offset, disclosed contract count, and the raw error payload if failed.

This screen is the audit trail. Do not summarise or prettify it — the value is that a fund ops user can reconcile it against the ledger themselves.

**`unknown` state:** if a submit times out, show it as its own state, not as failed. Copy: *We submitted this and did not get a response. It may or may not have settled. Do not resubmit — check this record again shortly.* Never guess, never auto-retry a `HIGH_RISK` action.

---

## 7. Eligibility

Current tier, jurisdiction, expiry, and the eligibility contract ID (mono, copyable, verifiable against the ledger).

Attestation flow as three steps with real state, not a marketing progress bar: `submitted → under review → issued`. When issued, show the contract and state plainly that it is now enforced by the ledger on every subscription — that sentence is the product's strongest trust claim and belongs where it is provable.

Expired: `--pending` banner, what lapsed, how to renew. Do not block the rest of the app.

---

## 8. Settings

Party ID with copy. Custody mode, labelled `Managed` with a one-line explanation. Pre-approval status with a `Create pre-approval` action and a note that acceptance takes a moment because validator automation handles it — a user who clicks and sees no instant change should not think it failed. Session, sign out.

---

## Cross-cutting

**Every async surface:** `idle` / `loading` / `empty` / `error` / `stale`. Stale is distinct — the index is a projection, and a visibly old projection beats a confidently wrong number.

**Toasts:** action-named, matching the button. `Subscribe` → `Subscribed`. Failures do not toast; they persist in place, because a disappearing failure is a lie.

**Loading:** skeletons at the true final dimensions, never spinners. Figures skeleton at their tabular width so the table does not reflow.

**Focus:** 2px `--brand` outline, visible on every interactive element, never removed.

**Reduced motion:** all transitions to 0ms, blotter renders resolved.

**Mobile 375px:** tables become stacked cards keyed by state colour; the confirm modal becomes a full-height sheet with the same content and the same required confirmation.

---

## Build order

1. Shell + sign-in + party display
2. Portfolio, reading the index
3. Offerings index and detail, read-only
4. Subscribe panel state machine, mocked backend
5. Wire to the real DvP endpoint
6. Settlements list and detail
7. Eligibility, then Settings
8. Empty, error, stale and `unknown` states across all screens

Step 8 is not polish. It is where this product is either trustworthy or not.
