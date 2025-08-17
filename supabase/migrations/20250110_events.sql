-- Events table for ALS community and club events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  link_url text,
  source text,
  is_club_event boolean not null default false,
  miss_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

drop trigger if exists set_updated_at on public.events;
create trigger set_updated_at before update on public.events for each row execute function public.set_updated_at();

alter table public.events enable row level security;

-- Public can read upcoming events and any club events
create policy if not exists "Public can read events"
  on public.events for select
  to authenticated, anon
  using (is_club_event OR start_at >= (now() - interval '1 day'));

-- RPC to increment miss_count for scraper
create or replace function public.increment_event_miss_count(event_id uuid)
returns void language plpgsql as $$
begin
  update public.events
  set miss_count = coalesce(miss_count, 0) + 1,
      updated_at = now()
  where id = event_id;
end;$$;