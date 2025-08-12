-- Q&A threads (publicly readable, only authenticated can create their own)
create table if not exists public.qa_threads (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  body text default '',
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.qa_threads enable row level security;

create policy if not exists "Anyone can read threads"
  on public.qa_threads for select
  to authenticated, anon
  using (true);

create policy if not exists "Authenticated can create threads"
  on public.qa_threads for insert
  to authenticated
  with check (created_by = auth.uid());

create policy if not exists "Owners can update their threads"
  on public.qa_threads for update
  to authenticated
  using (created_by = auth.uid());

create index if not exists idx_qa_threads_created_at on public.qa_threads(created_at desc);

-- Picture votes (one vote per user per day)
create table if not exists public.picture_votes (
  id uuid primary key default gen_random_uuid(),
  image_id uuid not null references public.media_files(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_day date not null default (current_date),
  voted_at timestamptz not null default now()
);

alter table public.picture_votes enable row level security;

create policy if not exists "Anyone can read picture_votes"
  on public.picture_votes for select
  to authenticated, anon
  using (true);

create policy if not exists "Authenticated can insert own vote"
  on public.picture_votes for insert
  to authenticated
  with check (user_id = auth.uid());

create unique index if not exists uniq_picture_vote_per_user_day on public.picture_votes(user_id, session_day);
create index if not exists idx_picture_votes_image on public.picture_votes(image_id);
create index if not exists idx_picture_votes_day on public.picture_votes(session_day);