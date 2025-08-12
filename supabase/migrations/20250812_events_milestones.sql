-- Events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  start_at timestamptz not null,
  end_at timestamptz,
  is_club_event boolean not null default false,
  is_mlb_lou_gehrig_day boolean not null default false,
  location text default '',
  link_url text default '',
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.events enable row level security;

create policy if not exists "Anyone can read events"
  on public.events for select
  to authenticated, anon
  using (true);

create policy if not exists "Authenticated can insert events"
  on public.events for insert
  to authenticated
  with check (created_by = auth.uid());

create policy if not exists "Owners can update events"
  on public.events for update
  to authenticated
  using (created_by = auth.uid());

create index if not exists idx_events_start_at on public.events(start_at);
create index if not exists idx_events_is_club on public.events(is_club_event);

-- Milestones table (timeline)
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  occurred_on date,
  year integer,
  month integer,
  day integer,
  link_url text default '',
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.milestones enable row level security;

create policy if not exists "Anyone can read milestones"
  on public.milestones for select
  to authenticated, anon
  using (true);

create policy if not exists "Authenticated can insert milestones"
  on public.milestones for insert
  to authenticated
  with check (created_by = auth.uid());

create policy if not exists "Owners can update milestones"
  on public.milestones for update
  to authenticated
  using (created_by = auth.uid());

create index if not exists idx_milestones_date on public.milestones(occurred_on);
create index if not exists idx_milestones_md on public.milestones(month, day);

-- Daily facts per month/day
create table if not exists public.milestone_facts (
  id uuid primary key default gen_random_uuid(),
  fact_text text not null,
  month integer not null check (month between 1 and 12),
  day integer not null check (day between 1 and 31),
  source_url text default '',
  last_shown_at date,
  times_shown integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.milestone_facts enable row level security;

create policy if not exists "Anyone can read milestone facts"
  on public.milestone_facts for select
  to authenticated, anon
  using (true);

create policy if not exists "Authenticated can insert milestone facts"
  on public.milestone_facts for insert
  to authenticated
  with check (created_by = auth.uid());

create policy if not exists "Owners can update milestone facts"
  on public.milestone_facts for update
  to authenticated
  using (created_by = auth.uid());

create index if not exists idx_milestone_facts_md on public.milestone_facts(month, day);