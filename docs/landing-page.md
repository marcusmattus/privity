# Build prompt — landing page, brand mark, design system

Companion to `canton-dvp-build-prompt.md`. Build this first — the dashboard inherits its tokens.

---

## 1. Subject

An institutional venue for tokenised crypto-company allocations and fund units, settled on Canton against a stablecoin holding.

**Audience:** allocators, fund ops, treasury. Professionally sceptical. They have seen a hundred crypto landing pages and discount them on sight.

**The page has one job:** make a professional believe two claims in under thirty seconds — *both legs of a trade settle in a single transaction*, and *nobody outside the trade can see it* — then get them to request access.

Everything below serves those two claims. Cut anything that doesn't.

---

## 2. Design direction

The subject's world is settlement: contract notes, trade blotters, confirmations, and — the thing that makes this product different — **information deliberately withheld**.

That last one is the direction. The page does not *assert* privacy, it *demonstrates* it. Withheld data is a visual material here, used structurally rather than decoratively.

### The semantic rule (load-bearing — apply everywhere)

Colour encodes visibility, not hierarchy:

- **Paper** surfaces = data you are party to. Legible, warm, high contrast.
- **Withheld** surfaces = data you are not party to. Field labels present, values structurally absent.

Once established in the hero, this rule holds across the whole site and into the dashboard. It is the single idea the design is built on.

### Tokens

```css
--ink:       #0B0D14;  /* page ground — matches the logo lockup */
--slate:     #14161F;  /* raised panels, cards */
--withheld:  #262A38;  /* redaction fill — flat, never blurred */
--paper:     #ECEDF2;  /* visible-to-you surfaces and primary text */
--brand:     #6D3AF2;  /* logo and primary action ONLY — pull exact value from the logo source */
--settled:   #46A88C;  /* confirmed settlement. Used sparingly */
--pending:   #C6973F;  /* offer awaiting acceptance */
```

**Brand purple is not a state colour.** It appears in the mark, the primary button, and focus rings. It never colours a row, a figure, a pill, or a status. The moment purple lands on data, the visibility rule stops being legible — and the visibility rule is the product.

Paper is cool rather than cream. Warm cream against this purple goes muddy.

Blur is banned as a privacy signal. Blur reads as "loading" or "paywall" and implies the data is there but obscured. Flat fill reads as "this was never sent to you," which is what Canton actually does. This distinction is the whole point — get it right.

**Type**
- Display: **Archivo** — wide, sturdy, tight tracking at large sizes. Weights 600/700.
- Body: **IBM Plex Sans** — 400/500.
- Figures: **IBM Plex Mono** — every number, party ID, contract ID, timestamp, amount. No exceptions. Tabular numerals on.

Plex reads as technical documentation rather than fintech marketing, which is the register we want. Do not substitute Inter for body or Space Grotesk for display — both are the default reach and both read as crypto-generic to this audience.

**Scale:** display 64/48/32, body 17/15, mono 14/13. Generous line height on body (1.6), tight on display (1.05).

**Geometry:** radius 2px or 0. Sharp. No shadows — use `--slate` elevation and a 1px `--withheld` border instead.

**Motion:** one orchestrated moment (the hero blotter). Elsewhere, 120ms state transitions and nothing else. Respect `prefers-reduced-motion` by rendering the blotter's resolved end state immediately.

---

## 3. The signature element — live blotter

The hero is not a headline over a gradient. It is a working trade blotter.

Twelve rows of settlement data, monospace, columns: `TIME · INSTRUMENT · UNITS · CONSIDERATION · COUNTERPARTY · STATE`.

**Eleven rows are withheld.** Not blurred — the cells are flat `--withheld` blocks at the exact width the data would occupy. Column headers stay fully legible. The *shape* of the data is visible; the data is not.

**One row is yours,** rendered on `--paper`, fully legible, marked `SETTLED` in `--settled`.

On load: rows stream in over ~1.4s, withheld ones landing as blocks, yours resolving last into full legibility. That is the entire animation budget for the page.

Beneath it, one line of mono caption:

> `11 of 12 transactions on this synchroniser were not sent to you.`

This is the thesis, the hero image, and the product demo in one component. Build it first and get it right before anything else on the page.

---

## 4. Sections

**1 — Hero.** Headline, one-line sub, blotter, two CTAs.

Headline: **Both legs, one transaction, no audience.**

Sub: *Tokenised allocations settled atomically against stablecoin on Canton. Counterparties see the trade. Nobody else does.*

CTAs: `Request access` (primary, paper on ink) · `View offerings` (ghost).

**2 — The problem.** Split view. Left: a public block explorer rendering of an address — full payment history, current holdings, counterparties, all legible. Right: the same trade on this platform, withheld. Caption between them: *Now make the left one your cap table.* Let this section breathe; it is the argument.

**3 — How settlement works.** Three states, using real vocabulary from the ledger, not invented marketing terms:

- `DIRECT` — receiver has a live pre-approval. Units and payment swap in one transaction.
- `OFFER` — no pre-approval. An instruction is created; the balance does not move until accepted.
- `REJECTED` — the buyer's eligibility contract did not permit it. The ledger refused, not the backend.

That third one is the most credible sentence on the page for this audience. Give it equal weight, not a footnote.

**4 — Open offerings.** Three cards, live from `/api/offerings`. Unauthenticated: terms visible, subscribe action absent — and say why in one line, in the interface's voice. Consistent with the semantic rule: what you cannot act on is not there, not greyed out with a lock icon.

**5 — Access and compliance.** Plain statement of what this is, who can transact, and what eligibility means. Full width, no illustration, `--paper` on `--slate`. Do not bury this in the footer; for this audience its prominence is a trust signal, not a liability.

**6 — Footer.** Docs, GitHub, contact, network status.

Six sections. Do not add a testimonial band, a logo wall, or a "backed by" strip — with no real logos to show, all three read as placeholder.

---

## 5. Logo — delivered

The mark exists. Two stacked bars of equal weight in `--brand`, set left of the wordmark "Privity" in near-white, on `--ink`.

It reads as an equals sign: two legs of equal value, exchanged. That is the product in two strokes — use it as delivered, do not redraw it.

**Working from it**
- Extract the exact purple from the source file. `#6D3AF2` above is sampled from a PNG and will be slightly off.
- Produce from the lockup: `logo-lockup.svg`, `logo-mark.svg` (bars only), `logo-mono.svg` (single fill, for embeds and light grounds), `favicon.svg`, 180px apple-touch PNG.
- Favicon is the bars alone. Test at 16px — if the gap between bars closes, widen it rather than thickening the bars.
- Clear space on all sides equals the height of one bar.
- On `--paper` grounds, bars stay `--brand` and the wordmark goes `--ink`.
- Never place the mark on a `--slate` card that also contains a primary button; two purples at different sizes in one panel compete.

**Wordmark vs display face.** The wordmark is geometric; headline copy is set in Archivo. That divergence is normal and fine — a wordmark is a drawn asset, not a type style. Do not restyle headlines to match the wordmark, and do not re-set the wordmark in Archivo.

---

## 6. Component inventory

Build these as the shared system; the dashboard imports them unchanged.

```
Blotter          rows, withheld-cell, paper-row, state-pill
StatePill        settled | pending | direct | offer | rejected
Figure           mono, tabular, aligned — every number goes through this
PartyId          truncated middle, copy-on-click, full value in title
Card             slate ground, 1px withheld border, no shadow
Button           primary | ghost | destructive
Field            label, input, error — error states written as direction not apology
EmptyState       explains what would appear here and how to make it appear
WithheldBlock    the primitive. Width-preserving, flat fill, aria-hidden content
```

`WithheldBlock` needs an accessible label — screen readers should hear "withheld — you are not party to this transaction", not silence.

---

## 7. Figma workflow

There is no existing Figma file, so build code-first, then push into Figma so both start in sync.

**Order:**
1. Build the landing page in code against the tokens above.
2. Create a Figma file. Publish the tokens as Figma variables — colour, type scale, spacing — before drawing anything.
3. Build the components from section 6 as Figma components with variants matching the code props (`StatePill` gets five variants, `Button` three).
4. Assemble the landing page from those components, section by section, using variables rather than hardcoded values.
5. From then on, Figma leads on design changes and code implements them.

**Do not** draw the page as flat frames and reconcile later. The variables and components are the point; without them the file is a screenshot.

**After the code exists,** run the codebase-analysis prompt (`create_design_system_rules_text`) against the repo to emit `design-system-rules.md` — token locations, component paths, styling approach, icon and asset conventions. That file is what makes future Figma MCP work accurate, and it can only be written once there is a codebase to analyse.

---

## 8. Quality floor

Not features — the baseline. Do not announce these in the UI.

- Responsive to 375px. The blotter drops to four columns on mobile (`TIME · INSTRUMENT · UNITS · STATE`); the withheld treatment survives the cut and remains the point.
- Visible keyboard focus on every interactive element, `--paper` 2px outline.
- `prefers-reduced-motion` honoured — the blotter renders resolved, not animated.
- Contrast: paper on ink and paper on slate both clear AA at body sizes. Check `--pending` on `--slate` specifically; amber on dark slate is the pairing most likely to fail.
- Fonts self-hosted, subset, `font-display: swap`.
- Empty and error states written before they are needed, in the interface's voice.

---

## 9. Copy rules

- Ledger vocabulary stays exact: *party*, *contract*, *holding*, *settled*, *pre-approval*. This audience knows the words; softening them costs credibility.
- Marketing vocabulary is banned: *seamless*, *revolutionary*, *unlock*, *empower*, *next-generation*.
- Active voice. A button says what happens: `Request access`, not `Get started`.
- An action keeps its name through the whole flow — `Subscribe` produces `Subscribed`, never `Success!`.
- Errors state what happened and what to do. They do not apologise and they are never vague.
- Never claim a transfer settled when `transferKind` was `offer`. The copy and the state machine tell the same story or the product is lying.
