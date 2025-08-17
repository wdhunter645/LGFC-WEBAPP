-- RLS policies for faq_items: public can insert drafts; admins can read/update/delete

-- Allow public (API key) to insert new draft questions
create policy if not exists "Public can submit FAQ drafts"
  on public.faq_items for insert
  to anon
  with check (status = 'draft');

-- Admins can read all FAQ items
create policy if not exists "Admins can read all FAQs"
  on public.faq_items for select
  to authenticated
  using (
    exists (
      select 1 from public.members m
      where m.user_id = auth.uid() and m.is_admin = true
    )
  );

-- Admins can update (answer/publish) FAQ items
create policy if not exists "Admins can update FAQs"
  on public.faq_items for update
  to authenticated
  using (
    exists (
      select 1 from public.members m
      where m.user_id = auth.uid() and m.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.members m
      where m.user_id = auth.uid() and m.is_admin = true
    )
  );

-- Admins can delete FAQ items
create policy if not exists "Admins can delete FAQs"
  on public.faq_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.members m
      where m.user_id = auth.uid() and m.is_admin = true
    )
  );

-- RLS policies for visitors/visitor_votes inserts for API key
create policy if not exists "Public can insert visitors"
  on public.visitors for insert
  to anon
  with check (true);

create policy if not exists "Public can insert visitor votes"
  on public.visitor_votes for insert
  to anon
  with check (true);