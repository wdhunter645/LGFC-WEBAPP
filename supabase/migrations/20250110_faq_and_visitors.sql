-- Create FAQ items table
create table if not exists public.faq_items (
	id uuid primary key default gen_random_uuid(),
	question text not null,
	answer text,
	status text not null default 'draft' check (status in ('draft','published')),
	submitter_email text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
	new.updated_at = now();
	return new;
end;$$;

drop trigger if exists set_updated_at on public.faq_items;
create trigger set_updated_at before update on public.faq_items for each row execute function public.set_updated_at();

alter table public.faq_items enable row level security;

-- Anyone can read published FAQs
create policy if not exists "Anyone can read published FAQs"
	on public.faq_items for select
	to authenticated, anon
	using (status = 'published');

-- Visitors (anonymous IDs)
create table if not exists public.visitors (
	id text primary key,
	created_at timestamptz not null default now()
);

alter table public.visitors enable row level security;
create policy if not exists "No read access to visitors"
	on public.visitors for select
	to authenticated, anon
	using (false);

-- Visitor votes (per day per image)
create table if not exists public.visitor_votes (
	id uuid primary key default gen_random_uuid(),
	visitor_id text not null references public.visitors(id) on delete cascade,
	image_id text not null,
	session_day date not null default (current_date),
	voted_at timestamptz not null default now()
);

create unique index if not exists uniq_visitor_vote_per_day on public.visitor_votes(visitor_id, image_id, session_day);
create index if not exists idx_visitor_votes_image on public.visitor_votes(image_id);
create index if not exists idx_visitor_votes_day on public.visitor_votes(session_day);

alter table public.visitor_votes enable row level security;

-- Anyone can read votes (for leaderboard)
create policy if not exists "Anyone can read visitor votes"
	on public.visitor_votes for select
	to authenticated, anon
	using (true);