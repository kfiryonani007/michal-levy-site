-- ============================================================================
--  002 — Email a notification whenever a lead is created
-- ============================================================================
--  Calls api/lead-email.js on the site, which sends the mail through Resend.
--
--  ── Why a database trigger and not the browser ────────────────────────────
--  The visitor's browser is handing control to WhatsApp at exactly the moment
--  a lead is submitted, and on a phone it gets suspended a beat later — the
--  same reason the lead itself is written with `keepalive`. Firing from the
--  database means the mail goes out for every row that actually exists, no
--  matter what the visitor's device did next.
--
--  This is what the dashboard's "Database Webhooks" feature generates behind
--  the scenes; written out here because that UI has moved, and because a
--  migration file is reviewable and re-runnable while a dashboard setting is
--  neither.
--
--  ── The secret ────────────────────────────────────────────────────────────
--  Must match LEAD_WEBHOOK_SECRET in the Vercel project. Without it the
--  endpoint would be an open "email anyone" button. It sits in the function
--  body, readable only by whoever can already read the schema.
--
--  Safe to re-run.
-- ============================================================================

create extension if not exists pg_net;

create or replace function public.notify_lead_email()
returns trigger
language plpgsql
security definer
-- pg_net lives in `net` on some projects and `extensions` on others; leaving
-- http_post unqualified lets it resolve either way.
set search_path = net, extensions, public
as $$
begin
  perform http_post(
    url := 'https://michalleviart.com/api/lead-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', 'MhMwbKAT0drSTiDxlHAubuu9eXl8fOkq'
    ),
    body := jsonb_build_object('record', to_jsonb(new))
  );
  return new;
exception when others then
  -- A notification that fails must never cost us the lead. Swallow it and
  -- let the insert stand; pg_net logs the attempt in net._http_response.
  return new;
end;
$$;

drop trigger if exists on_lead_created on public.leads;
create trigger on_lead_created
  after insert on public.leads
  for each row execute function public.notify_lead_email();
