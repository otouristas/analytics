create table if not exists anomaly_records (
  id text primary key,
  property_id text not null,
  metric_id text not null,
  title text not null,
  body text not null,
  severity text not null default 'warning', -- 'critical', 'warning', 'opportunity', 'healthy'
  expected_val double precision not null default 0,
  actual_val double precision not null default 0,
  z_score double precision not null default 0,
  dimension text not null default '',
  dimension_val text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists anomaly_records_property_idx
  on anomaly_records (property_id, created_at desc);

create table if not exists attribution_records (
  id text primary key,
  property_id text not null,
  session_id text not null,
  model text not null, -- 'first_touch', 'last_touch', 'linear', 'markov', 'position_based'
  channel_id text not null,
  credit double precision not null default 1.0,
  created_at timestamptz not null default now()
);

create index if not exists attribution_records_property_idx
  on attribution_records (property_id, model);

create table if not exists daily_rollups (
  id text primary key,
  property_id text not null,
  day date not null,
  metric text not null,
  dimension text not null default 'total',
  dimension_value text not null default 'all',
  count bigint not null default 0,
  sum_val double precision not null default 0,
  unique (property_id, day, metric, dimension, dimension_value)
);

create index if not exists daily_rollups_lookup_idx
  on daily_rollups (property_id, metric, day desc);
