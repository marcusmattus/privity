-- Privity — initial schema.
--
-- holdings_index and settlements are PROJECTIONS of the ledger, never sources
-- of truth. Both must be rebuildable by replaying from ledger_cursor offset 0.

create type auth_provider as enum ('keycloak');
create type custody_mode  as enum ('managed', 'external');
create type instrument_kind as enum ('stablecoin', 'allocation', 'fund_unit');
create type offering_status as enum ('draft', 'open', 'closed', 'settled');

-- 'unknown' is deliberate: a submit that timed out. We do not know whether it
-- settled. It is NOT 'failed'. Never collapse the two.
create type settlement_state as enum (
  'initiated', 'quoted', 'submitting', 'pending_acceptance',
  'settled', 'failed', 'unknown'
);

create table users (
  id               uuid primary key default gen_random_uuid(),
  auth_provider    auth_provider not null default 'keycloak',
  provider_subject text not null,
  email            text,
  created_at       timestamptz not null default now(),
  unique (auth_provider, provider_subject)
);

create table parties (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  canton_party_id text not null unique,
  is_local        boolean not null default true,
  custody_mode    custody_mode not null default 'managed',
  allocated_at    timestamptz not null default now()
);

create table eligibility (
  id           uuid primary key default gen_random_uuid(),
  party_id     uuid not null references parties(id) on delete cascade,
  jurisdiction text not null,
  tier         text not null,
  contract_cid text,
  expires_at   timestamptz,
  revoked_at   timestamptz
);

create table instruments (
  id           uuid primary key default gen_random_uuid(),
  symbol       text not null unique,
  name         text not null,
  kind         instrument_kind not null,
  issuer_party text not null,
  decimals     int not null default 2
);

create table offerings (
  id              uuid primary key default gen_random_uuid(),
  instrument_id   uuid not null references instruments(id),
  price_per_unit  numeric(38,10) not null,
  total_units     numeric(38,10) not null,
  units_remaining numeric(38,10) not null,
  opens_at        timestamptz,
  closes_at       timestamptz,
  status          offering_status not null default 'draft'
);

create table holdings_index (
  id            uuid primary key default gen_random_uuid(),
  party_id      uuid not null references parties(id) on delete cascade,
  instrument_id uuid not null references instruments(id),
  contract_cid  text not null unique,
  amount        numeric(38,10) not null,
  locked        boolean not null default false,
  ledger_offset text not null,
  seen_at       timestamptz not null default now()
);
create index on holdings_index (party_id, instrument_id);

create table settlements (
  id             uuid primary key default gen_random_uuid(),
  idempotency_key text unique,
  offering_id    uuid references offerings(id),
  buyer_party    text not null,
  seller_party   text not null,
  instrument_id  uuid references instruments(id),
  units          numeric(38,10),
  consideration  numeric(38,10),
  state          settlement_state not null default 'initiated',
  transfer_kind  text,
  instruction_cid text,
  error_code     text,
  initiated_at   timestamptz not null default now(),
  settled_at     timestamptz
);
create index on settlements (buyer_party, initiated_at desc);

create table ledger_cursor (
  id          uuid primary key default gen_random_uuid(),
  stream_name text not null unique,
  "offset"    text not null,
  updated_at  timestamptz not null default now()
);

-- Insert-only from the service role. Never client-readable.
create table audit_log (
  id              uuid primary key default gen_random_uuid(),
  ts              timestamptz not null default now(),
  user_id         uuid references users(id),
  party_id        uuid references parties(id),
  action          text not null,
  tier            text not null,
  params_hash     text,
  approval_status text,
  result_status   text,
  latency_ms      int,
  error           text
);

alter table parties        enable row level security;
alter table eligibility    enable row level security;
alter table holdings_index enable row level security;
alter table settlements    enable row level security;
alter table audit_log      enable row level security;

create policy own_parties on parties
  for select using (user_id = auth.uid());

create policy own_holdings on holdings_index
  for select using (
    party_id in (select id from parties where user_id = auth.uid())
  );
