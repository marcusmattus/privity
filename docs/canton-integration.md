# Canton integration

How Privity talks to Canton, and what changed when we moved to the Wallet Gateway.

## Topology

```
┌──────────────┐  dApp API (CIP-103,   ┌────────────────┐  Ledger API  ┌───────────┐
│   Privity    │  JSON-RPC 2.0 over    │ Wallet Gateway │ ───────────► │ Validator │
│ (dApp SDK)   │ ◄── HTTP/SSE or  ───► │                │              └───────────┘
└──────────────┘     postMessage       │                │  signing
                                       │                │ ───────────► ┌───────────┐
                                       └────────────────┘              │  Signing  │
                                              ▲  User UI / User API    │ provider  │
                                              └────── user ───────────►└───────────┘
```

The Gateway authenticates to the validator's Ledger API and forwards signing
requests to whichever signing provider is configured — a participant, or an
institutional custodian.

## What this changed

Earlier drafts of this project used a managed-party model: the backend allocated
a Canton party per user and submitted on their behalf. **That is gone.**

| | Before | Now |
|---|---|---|
| Keys | held by our backend | held by the user's signing provider |
| Party | allocated by us, custodial | external, owned by the user |
| Signing | our service | the wallet |
| `POST /api/party/ensure` | required | **deleted** |
| Custody disclosure in UI | "managed party" | not needed |

This is strictly better for an institutional venue. We cannot lose keys we never
had, and a custodian-using counterparty can bring their existing setup.

**Consequence for the confirm modal:** the wallet renders and signs the
transaction, so the wallet's prompt is the real authorisation. Our modal is a
courtesy summary. Never word it as final approval, and never treat a resolved
promise from `executeCommand` as proof of settlement — read the result.

## Run it locally

**Prerequisites:** Node.js (the quickstart is tested with v24), and access to a
Canton Ledger API. For a fully local target, run a Splice LocalNet.

```bash
# 1. Install the Wallet Gateway
npm install -g @canton-network/wallet-gateway-remote

# 2. Generate a config you can edit
wallet-gateway --config-example > wallet-gateway.config.json

# 3. Edit it — at minimum:
#    store:             memory | sqlite | postgres
#    networks:          at least one Canton network with its Ledger API baseUrl
#    identityProviders: how users authenticate against those networks
#    The example config targets Splice LocalNet with SQLite and a mock OAuth IdP,
#    which is exactly what you want for the hackathon.

# 4. Run it (default port 3030)
wallet-gateway -c ./wallet-gateway.config.json
```

Three endpoints come up:

| Endpoint | URL |
|---|---|
| User UI | `http://localhost:3030` |
| dApp API | `http://localhost:3030/api/v0/dapp` |
| User API | `http://localhost:3030/api/v0/user` |

Open the User UI to confirm it is running, then create a party through it before
connecting from Privity — a wallet with no party will connect and expose nothing.

`--config-schema` emits a full JSON Schema for validation and IDE autocompletion.

## Daml toolchain

```bash
dpm install                                    # SDK per daml.yaml
dpm build                                      # compile to DAR
dpm test                                       # run daml/daml/Test.daml
dpm codegen-js .daml/dist/privity-0.1.0.dar -o generated-ts
dpm studio                                     # VS Code
```

`dpm test` runs both halves of the pitch: `testSubscribe` (atomic swap) and
`testIneligibleRejected` (the ledger refuses). Get these green before touching
the UI — they prove the model without a running network.

Requires Java 17+ and Node 18+.

## Which SDK

- **dApp SDK** (`@canton-network/dapp-sdk`) — what we use. Browser-side, talks to
  a Wallet Gateway, smaller bundle, implements CIP-103.
- **Wallet SDK** (`@canton-network/wallet-sdk`) — lower level: authenticating to
  synchronizers, allocating parties with external keypairs, signing and
  submitting directly. For wallet providers and exchanges. **Not us.**

Both are pre-1.0 with breaking changes between releases.

`package.json` currently specifies `"latest"` for the dApp SDK **because the
correct version was not verified when this repo was scaffolded.** First job:

```bash
npm install @canton-network/dapp-sdk
npm pkg get dependencies                 # read the resolved version
```

then pin it exactly. Read the migration notes before ever bumping it.

## Reading the ledger

The dApp SDK signs and submits. It is not a query layer. For portfolio and
settlement history we still need our own index, and there are two routes:

1. **PQS** — projects ledger data into PostgreSQL for SQL queries alongside a
   validator. The right answer if we control a validator.
2. **`ledger-service`** — our FastAPI bridge over `c8lab.py`. Fastest for the
   hackathon, and already in this repo.

We keep `ledger-service` for reads. Its `/transfer` endpoint is now **dead code**
for the user flow — signing moved to the wallet — but stays useful for seeding
demo data from an issuer party we do control.

## Open items

- Verify every `@canton-network/dapp-sdk` call in `lib/wallet.ts` against the
  pinned version's README. The shapes there follow the documented convenience
  API but have not been run.
- The Daml `Cash` template is a placeholder. Production routes payment through
  the Token Standard transfer factory with disclosed contracts from the registry.
- Decide PQS vs `ledger-service` before the index gets real.
