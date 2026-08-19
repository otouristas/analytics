create table if not exists organizations (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists organization_members (
  organization_id text not null references organizations(id) on delete cascade,
  user_id text not null,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists properties (
  id text primary key,
  organization_id text references organizations(id) on delete cascade,
  name text not null,
  host text not null,
  write_key text not null unique,
  timezone text not null default 'UTC',
  currency text not null default 'EUR',
  created_at timestamptz not null default now()
);

create table if not exists meridian_events (
  id text primary key,
  property_id text not null,
  write_key text not null,
  session_id text not null,
  event_name text not null,
  ts timestamptz not null,
  host text not null default '',
  path text not null default '/',
  title text not null default '',
  referrer text not null default '',
  source text not null default 'direct',
  query text not null default '',
  country_id text not null default '',
  country_name text not null default '',
  city text not null default '',
  device text not null default 'desktop',
  os text not null default '',
  browser text not null default '',
  href text not null default '',
  label text not null default '',
  from_path text not null default ''
);

create index if not exists meridian_events_property_ts_idx
  on meridian_events (write_key, ts desc);

create index if not exists meridian_events_session_idx
  on meridian_events (session_id);

create table if not exists conversion_definitions (
  id text primary key,
  property_id text not null,
  name text not null,
  event_name text not null,
  path_contains text not null default '',
  created_at timestamptz not null default now()
);

insert into organizations (id, name) values
  ('org_meridian', 'Meridian')
on conflict (id) do nothing;

insert into properties (id, organization_id, name, host, write_key, timezone, currency) values
  ('prop_cyclades', 'org_meridian', 'Discover Cyclades', 'discovercyclades.gr', 'mk_cyclades', 'Europe/Athens', 'EUR'),
  ('prop_demo', 'org_meridian', 'Meridian Demo', 'sandbox', 'mk_live_demo', 'UTC', 'EUR')
on conflict (id) do nothing;
