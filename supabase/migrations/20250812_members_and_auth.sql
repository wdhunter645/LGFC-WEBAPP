-- Members table aligns with Users concept
create table if not exists public.members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text default '',
  email text unique,
  preferred_screen_name text default '',
  social_media_platform_used text default '',
  is_admin boolean not null default false,
  created_at timestamptz default now()
);

alter table public.members enable row level security;

-- Basic policies
create policy "Authenticated can read members (limited)"
  on public.members for select
  to authenticated
  using (true);

create policy "User can insert own member row"
  on public.members for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "User can update own member row"
  on public.members for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admin management policy (optional; enforce via JWT claims or separate admin check)
-- create policy "Admins can manage members"
--   on public.members for all
--   to authenticated
--   using (exists (select 1 from public.members m where m.user_id = auth.uid() and m.is_admin))
--   with check (exists (select 1 from public.members m where m.user_id = auth.uid() and m.is_admin));

-- Link submissions to creator
alter table public.content_items
  add column if not exists created_by uuid references auth.users(id);

create index if not exists idx_content_items_created_by on public.content_items(created_by);

-- Strengthen RLS for inserts/updates to ensure creator consistency
-- Allow anyone to read (already present in earlier migration)
-- Allow authenticated to insert if created_by matches auth.uid()
create policy if not exists "Authenticated users can insert content items (owner)"
  on public.content_items
  for insert
  to authenticated
  with check (created_by = auth.uid());

-- Allow owners to update their rows (and admins can be layered later)
create policy if not exists "Owners can update their content items"
  on public.content_items
  for update
  to authenticated
  using (created_by = auth.uid());