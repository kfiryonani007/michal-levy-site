-- ============================================================================
--  001 — Leads CRM + merchant commission
-- ============================================================================
--  Turns `leads` from a write-only inbox into something Michal can actually
--  work: a status per lead, free-text notes, and (when a lead closes) the
--  amount it sold for. The commission screen reads those sale amounts back
--  and takes its cut off them, so a sale is only ever typed in once.
--
--  `items` stores the cart contents as real JSON rather than only inside the
--  human-readable `message` string, so the admin can show "what they wanted"
--  as a proper list instead of parsing prose. Leads created before this
--  migration keep an empty array and fall back to the message text.
--
--  `session_id` links a lead to that visitor's page_views / click_events,
--  which is what makes "what did this lead click" answerable. It is only
--  populated for leads created after this migration ships.
--
--  Safe to re-run: every statement is idempotent.
-- ============================================================================

alter table public.leads
  add column if not exists status      text not null default 'new',
  add column if not exists notes       text,
  add column if not exists sale_amount numeric,
  add column if not exists sold_at     timestamptz,
  add column if not exists session_id  text,
  add column if not exists items       jsonb not null default '[]'::jsonb;

create index if not exists leads_status_idx     on public.leads (status);
create index if not exists leads_session_id_idx on public.leads (session_id);

-- Clicks were recorded without any visitor identity, so "what did THIS lead
-- click" was unanswerable. page_views already carried session_id; this brings
-- click_events in line so the two can be read as one timeline.
alter table public.click_events
  add column if not exists session_id text;

create index if not exists click_events_session_id_idx on public.click_events (session_id);

-- The admin needs UPDATE to set status / notes / sale amount. The original
-- schema only granted insert (anon) + select and delete (authenticated).
drop policy if exists "leads_update_auth" on public.leads;
create policy "leads_update_auth" on public.leads
  for update to authenticated using (true) with check (true);
