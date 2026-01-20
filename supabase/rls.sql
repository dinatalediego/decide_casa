-- DecideCasa (RLS para Admin)
-- Ejecuta esto DESPUES de schema.sql

-- 1) View: ultima recomendacion por lead
create or replace view public.lead_latest_reco as
select distinct on (lr.lead_id)
  lr.lead_id,
  l.created_at,
  l.status,
  l.company,
  l.role,
  l.name,
  l.phone,
  l.email,
  l.district,
  l.budget_usd,
  l.bedrooms,
  l.timeline,
  lr.top_project_code,
  lr.top_score
from public.lead_recommendations lr
join public.leads l on l.id = lr.lead_id
order by lr.lead_id, lr.generated_at desc;

-- 2) RLS basico: solo usuarios autenticados pueden leer
alter table public.leads enable row level security;
alter table public.lead_recommendations enable row level security;
alter table public.events enable row level security;

drop policy if exists "select_leads_authenticated" on public.leads;
create policy "select_leads_authenticated"
on public.leads for select
to authenticated
using (true);

drop policy if exists "select_lead_recos_authenticated" on public.lead_recommendations;
create policy "select_lead_recos_authenticated"
on public.lead_recommendations for select
to authenticated
using (true);

drop policy if exists "select_events_authenticated" on public.events;
create policy "select_events_authenticated"
on public.events for select
to authenticated
using (true);

-- 3) Inserts siguen via Service Role (API /api/lead). No abras policies de insert aqui.