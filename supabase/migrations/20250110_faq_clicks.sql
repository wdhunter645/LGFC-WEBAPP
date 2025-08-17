-- Track FAQ clicks for ranking
create table if not exists public.faq_clicks (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.faq_items(id) on delete cascade,
  clicked_at timestamptz not null default now()
);

alter table public.faq_clicks enable row level security;

-- Anyone can read aggregated clicks; inserts will be done via server function
create policy if not exists "Anyone can read faq_clicks"
  on public.faq_clicks for select
  to authenticated, anon
  using (true);