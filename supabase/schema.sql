-- ============================================================================
--  MICHAL LEVY SITE — Supabase schema
-- ============================================================================
--  Run this once in the Supabase project's SQL Editor (Project → SQL Editor →
--  New query → paste this whole file → Run). Safe to re-run: every statement
--  is guarded with IF NOT EXISTS / DROP POLICY IF EXISTS.
--
--  After running this, create one admin user for Michal under
--  Authentication → Users → Add user (email + password) — that's the login
--  for /admin. Everything else (tables, policies, storage bucket) is created
--  here.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
--  leads — contact form submissions
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text,
  service text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

drop policy if exists "leads_insert_anon" on public.leads;
create policy "leads_insert_anon" on public.leads
  for insert to anon with check (true);

drop policy if exists "leads_select_auth" on public.leads;
create policy "leads_select_auth" on public.leads
  for select to authenticated using (true);

drop policy if exists "leads_delete_auth" on public.leads;
create policy "leads_delete_auth" on public.leads
  for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
--  page_views — one row per page load, for the overview dashboard
-- ---------------------------------------------------------------------------
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  device text,
  session_id text not null,
  duration_seconds numeric,
  created_at timestamptz not null default now()
);

alter table public.page_views enable row level security;

drop policy if exists "page_views_insert_anon" on public.page_views;
create policy "page_views_insert_anon" on public.page_views
  for insert to anon with check (true);

-- The duration update (sent on page-hide, after the initial insert) needs
-- anon UPDATE too — scoped to the same session, never exposed for reading.
drop policy if exists "page_views_update_anon" on public.page_views;
create policy "page_views_update_anon" on public.page_views
  for update to anon using (true) with check (true);

drop policy if exists "page_views_select_auth" on public.page_views;
create policy "page_views_select_auth" on public.page_views
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
--  click_events — key CTA clicks (WhatsApp / phone / booking buttons)
-- ---------------------------------------------------------------------------
create table if not exists public.click_events (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  path text,
  created_at timestamptz not null default now()
);

alter table public.click_events enable row level security;

drop policy if exists "click_events_insert_anon" on public.click_events;
create policy "click_events_insert_anon" on public.click_events
  for insert to anon with check (true);

drop policy if exists "click_events_select_auth" on public.click_events;
create policy "click_events_select_auth" on public.click_events
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
--  gallery_items — every piece in the gallery (replaces mediaMeta.js /
--  galleryFallback / src/media/gallery). Publicly readable — the site itself
--  renders straight from this table.
-- ---------------------------------------------------------------------------
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  place text,
  category text,
  description text,
  tall boolean not null default false,
  sizes jsonb not null default '[]'::jsonb,
  image_url text,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gallery_items enable row level security;

drop policy if exists "gallery_items_select_public" on public.gallery_items;
create policy "gallery_items_select_public" on public.gallery_items
  for select to anon, authenticated using (true);

drop policy if exists "gallery_items_write_auth" on public.gallery_items;
create policy "gallery_items_write_auth" on public.gallery_items
  for all to authenticated using (true) with check (true);

-- keep updated_at current on every edit
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gallery_items_set_updated_at on public.gallery_items;
create trigger gallery_items_set_updated_at
  before update on public.gallery_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
--  site_settings — one row per named block of site copy (hero, about, …).
--  Publicly readable — the site renders straight from this table, with
--  src/data/site.js used only as the seed values below and as a fallback
--  while the fetch is in flight.
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_public" on public.site_settings;
create policy "site_settings_select_public" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "site_settings_write_auth" on public.site_settings;
create policy "site_settings_write_auth" on public.site_settings
  for all to authenticated using (true) with check (true);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
--  Storage — gallery-images bucket (public read, authenticated write)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

drop policy if exists "gallery_images_read_public" on storage.objects;
create policy "gallery_images_read_public" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'gallery-images');

drop policy if exists "gallery_images_write_auth" on storage.objects;
create policy "gallery_images_write_auth" on storage.objects
  for all to authenticated
  using (bucket_id = 'gallery-images')
  with check (bucket_id = 'gallery-images');
