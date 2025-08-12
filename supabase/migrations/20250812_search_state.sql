create table if not exists search_state (
  id int primary key default 1,
  last_run_at timestamptz default null,
  last_query text default ''
);

-- Ensure single-row constraint by forcing id=1 upsert
insert into search_state (id) values (1)
  on conflict (id) do nothing;

alter table search_state enable row level security;
create policy "public read search state" on search_state for select to anon, authenticated using (true);
create policy "admin update search state" on search_state for update to authenticated using (true);