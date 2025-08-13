-- Probation and approvals
alter table if exists public.members
  add column if not exists probation_until timestamptz;

alter table if exists public.qa_threads
  add column if not exists is_approved boolean not null default true;

-- Member posts table (if not present)
create table if not exists public.member_posts (
  id uuid primary key default gen_random_uuid(),
  title text default '',
  text text default '',
  media_url text default '',
  created_by uuid references auth.users(id),
  is_approved boolean not null default true,
  created_at timestamptz default now()
);

alter table public.member_posts enable row level security;

create policy if not exists "Anyone can read member_posts"
  on public.member_posts for select to authenticated, anon using (true);

create policy if not exists "Authenticated can insert own member_posts"
  on public.member_posts for insert to authenticated with check (created_by = auth.uid());

create policy if not exists "Owners can update own member_posts"
  on public.member_posts for update to authenticated using (created_by = auth.uid());

create index if not exists idx_member_posts_created_at on public.member_posts(created_at desc);
create index if not exists idx_member_posts_approved on public.member_posts(is_approved);

-- Moderation actions log
create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(user_id) on delete cascade,
  actor_id uuid references auth.users(id),
  action_type text not null check (action_type in ('warn','strike','blacklist','unblacklist','note','approve')),
  reason text default '',
  ref_table text default '',
  ref_id uuid,
  created_at timestamptz default now()
);

create index if not exists idx_moderation_actions_member on public.moderation_actions(member_id, created_at desc);