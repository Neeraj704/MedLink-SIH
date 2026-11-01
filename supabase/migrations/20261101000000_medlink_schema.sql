-- Phase 1: Database Migration for MedLink
-- Extensions
create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- Enums
do $$ begin
  create type public.app_role as enum ('doctor', 'patient');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.appt_status as enum ('pending', 'approved', 'rejected', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.consult_status as enum ('draft', 'published');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.identifier_type as enum ('abha', 'abha_address', 'aadhaar_last4', 'gmail', 'phone');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.link_status as enum ('active', 'revoked');
exception when duplicate_object then null;
end $$;

-- Generic update timestamp trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null,
  full_name text not null,
  mobile text unique check (mobile ~ '^[6-9][0-9]{9}$' or mobile is null),
  email text,
  abha_number text unique,
  abha_address text unique,
  hpr_id text unique,
  council_reg_no text unique,
  preferred_language text default 'English',
  dob date,
  gender text,
  blood_group text,
  avatar_path text,
  claimed boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- 2. Doctor details
create table if not exists public.doctor_details (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  specializations text[] default '{}',
  experience_years int default 0,
  clinic_name text,
  address text,
  lat double precision,
  lng double precision,
  working_hours jsonb default '{"mon":{"open":true,"from":"09:00","to":"17:00"},"tue":{"open":true,"from":"09:00","to":"17:00"},"wed":{"open":true,"from":"09:00","to":"17:00"},"thu":{"open":true,"from":"09:00","to":"17:00"},"fri":{"open":true,"from":"09:00","to":"17:00"},"sat":{"open":true,"from":"09:00","to":"13:00"},"sun":{"open":false,"from":"09:00","to":"13:00"}}'::jsonb,
  slot_minutes int default 30,
  signature_path text,
  rating numeric(2,1) default 4.5,
  verified boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger tr_doctor_details_updated_at
  before update on public.doctor_details
  for each row execute function public.handle_updated_at();

-- 3. Patient identifiers (NEVER full Aadhaar; only last 4)
create table if not exists public.patient_identifiers (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  type public.identifier_type not null,
  value text not null,
  created_at timestamptz default now() not null,
  unique (patient_id, type, value)
);

-- 4. Doctor-Patient links (Consent)
create table if not exists public.doctor_patient_links (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  status public.link_status default 'active' not null,
  linked_at timestamptz default now() not null,
  revoked_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (doctor_id, patient_id)
);

create trigger tr_doctor_patient_links_updated_at
  before update on public.doctor_patient_links
  for each row execute function public.handle_updated_at();

-- Helper function: is_linked(doctor_id, patient_id)
create or replace function public.is_linked(d uuid, p uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.doctor_patient_links
    where doctor_id = d and patient_id = p and status = 'active'
  );
$$;

-- 5. Disease mappings
create table if not exists public.disease_mappings (
  id bigserial primary key,
  icd11_title text not null,
  icd11_code text,
  ayurveda_term text,
  ayurveda_code text,
  ayurveda_sim real,
  ayurveda_def text,
  siddha_term text,
  siddha_code text,
  siddha_sim real,
  siddha_def text,
  unani_term text,
  unani_code text,
  unani_sim real,
  unani_def text,
  search tsvector generated always as (
    to_tsvector('english',
      coalesce(icd11_title, '') || ' ' ||
      coalesce(icd11_code, '') || ' ' ||
      coalesce(ayurveda_term, '') || ' ' ||
      coalesce(siddha_term, '') || ' ' ||
      coalesce(unani_term, '')
    )
  ) stored,
  created_at timestamptz default now() not null
);

create index if not exists idx_disease_mappings_search on public.disease_mappings using gin(search);
create index if not exists idx_disease_mappings_title_trgm on public.disease_mappings using gin(icd11_title extensions.gin_trgm_ops);
create index if not exists idx_disease_mappings_code_trgm on public.disease_mappings using gin(icd11_code extensions.gin_trgm_ops);
create index if not exists idx_disease_mappings_code_btree on public.disease_mappings(lower(icd11_code));

-- 6. OTP challenges (service role only)
create table if not exists public.otp_challenges (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  purpose text not null check (purpose in ('login', 'signup', 'link')),
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts int default 0 not null,
  consumed boolean default false not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

create index if not exists idx_otp_challenges_lookup on public.otp_challenges(profile_id, purpose, consumed);

-- 7. Appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  duration_min int default 30 not null,
  type text default 'New Consultation' not null,
  status public.appt_status default 'pending' not null,
  notes text,
  decided_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create unique index if not exists idx_appointments_doctor_slot
  on public.appointments (doctor_id, starts_at)
  where status in ('pending', 'approved');

create trigger tr_appointments_updated_at
  before update on public.appointments
  for each row execute function public.handle_updated_at();

-- 8. Consultations
create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  status public.consult_status default 'draft' not null,
  vitals jsonb default '{"bp":"120/80","heartRate":72,"spo2":98,"temp":98.6,"weight":70}'::jsonb,
  chief_complaint text,
  history text,
  started_at timestamptz default now() not null,
  published_at timestamptz,
  duration_seconds int default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger tr_consultations_updated_at
  before update on public.consultations
  for each row execute function public.handle_updated_at();

-- 9. Consultation Diagnoses
create table if not exists public.consultation_diagnoses (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  disease_id bigint not null references public.disease_mappings(id) on delete cascade,
  confirmed_by_doctor boolean default false not null,
  note text,
  created_at timestamptz default now() not null
);

-- 10. Medications
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  drug text not null,
  dosage text not null,
  frequency text not null check (frequency in ('od', 'bd', 'tds', 'sos')),
  duration_days int default 5 not null,
  instructions text,
  sort int default 0,
  created_at timestamptz default now() not null
);

-- 11. FHIR Bundles
create table if not exists public.fhir_bundles (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null unique references public.consultations(id) on delete cascade,
  bundle jsonb not null,
  version int default 1 not null,
  published boolean default false not null,
  validation jsonb default '{"ok":true,"errors":[]}'::jsonb,
  created_at timestamptz default now() not null
);

-- 12. Prescription Translations
create table if not exists public.prescription_translations (
  medication_id uuid not null references public.medications(id) on delete cascade,
  lang text not null,
  drug_text text not null,
  instructions_text text not null,
  created_at timestamptz default now() not null,
  primary key (medication_id, lang)
);

-- 13. Documents & Shares
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  doc_type text not null check (doc_type in ('Lab Report', 'Imaging', 'Prescription', 'Other')),
  size_bytes bigint not null,
  mime text not null,
  storage_path text not null,
  created_at timestamptz default now() not null
);

create table if not exists public.document_shares (
  document_id uuid not null references public.documents(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (document_id, doctor_id)
);

-- 14. Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null,
  link text,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

-- 15. Chat sessions and messages
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  is_temp boolean default false not null,
  created_at timestamptz default now() not null
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  mode text default 'default',
  created_at timestamptz default now() not null
);

-- 16. Audit Log (Tamper-evident hash chain)
create table if not exists public.audit_log (
  id bigserial primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb default '{}'::jsonb,
  prev_hash text,
  hash text,
  created_at timestamptz default now() not null
);

-- Audit log trigger function
create or replace function public.audit_log_hash_chain()
returns trigger as $$
declare
  v_last_hash text;
begin
  select hash into v_last_hash from public.audit_log order by id desc limit 1;
  if v_last_hash is null then
    new.prev_hash := '0000000000000000000000000000000000000000000000000000000000000000';
  else
    new.prev_hash := v_last_hash;
  end if;

  new.hash := encode(
    extensions.digest(
      new.prev_hash ||
      coalesce(new.actor_id::text, '') ||
      new.action ||
      new.entity ||
      coalesce(new.entity_id, '') ||
      coalesce(new.meta::text, '{}') ||
      new.created_at::text,
      'sha256'
    ),
    'hex'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger tr_audit_log_hash_chain
  before insert on public.audit_log
  for each row execute function public.audit_log_hash_chain();

-- Revoke update and delete on audit_log from all roles
revoke update, delete on public.audit_log from public, authenticated, anon;

-- Helper RPC: write_audit
create or replace function public.write_audit(
  actor uuid,
  action text,
  entity text,
  entity_id text default null,
  meta jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  insert into public.audit_log(actor_id, action, entity, entity_id, meta)
  values (actor, action, entity, entity_id, meta)
  returning id into v_id;
  return v_id;
end;
$$;

-- View for public doctor discovery
create or replace view public.public_doctors as
select
  p.id as user_id,
  p.full_name,
  d.specializations,
  d.clinic_name,
  d.address,
  d.lat,
  d.lng,
  d.rating,
  d.verified
from public.profiles p
join public.doctor_details d on d.user_id = p.id
where p.role = 'doctor';

grant select on public.public_doctors to authenticated, anon;

-- Function: search_diseases(q text, lim int default 8)
create or replace function public.search_diseases(q text, lim int default 8)
returns setof public.disease_mappings
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  clean_q text := trim(q);
begin
  if length(clean_q) < 2 then
    return;
  end if;

  return query
  select *
  from public.disease_mappings
  where
    lower(icd11_code) = lower(clean_q)
    or lower(icd11_title) = lower(clean_q)
    or icd11_title ilike clean_q || '%'
    or search @@ plainto_tsquery('english', clean_q)
    or icd11_title % clean_q
    or icd11_code % clean_q
  order by
    case
      when lower(icd11_code) = lower(clean_q) then 1
      when lower(icd11_title) = lower(clean_q) then 2
      when icd11_title ilike clean_q || '%' then 3
      when search @@ plainto_tsquery('english', clean_q) then 4
      else 5
    end,
    similarity(icd11_title, clean_q) desc
  limit lim;
end;
$$;

-- Function: nearby_doctors(user_lat float8, user_lng float8, radius_km float8, spec text default null)
create or replace function public.nearby_doctors(
  user_lat float8,
  user_lng float8,
  radius_km float8,
  spec text default null
)
returns table (
  user_id uuid,
  full_name text,
  specializations text[],
  clinic_name text,
  address text,
  lat double precision,
  lng double precision,
  rating numeric,
  distance_km double precision,
  next_slot text
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return query
  select
    p.id as user_id,
    p.full_name,
    d.specializations,
    d.clinic_name,
    d.address,
    d.lat,
    d.lng,
    d.rating,
    (
      6371 * acos(
        least(1.0, greatest(-1.0,
          cos(radians(user_lat)) * cos(radians(coalesce(d.lat, user_lat))) *
          cos(radians(coalesce(d.lng, user_lng)) - radians(user_lng)) +
          sin(radians(user_lat)) * sin(radians(coalesce(d.lat, user_lat)))
        ))
      )
    ) as distance_km,
    'Tomorrow, 10:00 AM'::text as next_slot
  from public.profiles p
  join public.doctor_details d on d.user_id = p.id
  where p.role = 'doctor'
    and (spec is null or spec = '' or spec = any(d.specializations))
    and (
      radius_km is null
      or (
        6371 * acos(
          least(1.0, greatest(-1.0,
            cos(radians(user_lat)) * cos(radians(coalesce(d.lat, user_lat))) *
            cos(radians(coalesce(d.lng, user_lng)) - radians(user_lng)) +
            sin(radians(user_lat)) * sin(radians(coalesce(d.lat, user_lat)))
          ))
        )
      ) <= radius_km
    )
  order by distance_km asc;
end;
$$;

-- Function: doctor_dashboard_stats(d uuid)
create or replace function public.doctor_dashboard_stats(d uuid)
returns json
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_patients_today int;
  v_pending_drafts int;
  v_avg_consult_minutes numeric;
  v_publish_rate numeric;
  v_total_consults int;
  v_published_consults int;
begin
  -- Patients today: distinct patients with consultation or appointment today
  select count(distinct patient_id) into v_patients_today
  from (
    select patient_id from public.consultations
    where doctor_id = d and started_at >= date_trunc('day', now())
    union
    select patient_id from public.appointments
    where doctor_id = d and starts_at >= date_trunc('day', now()) and starts_at < date_trunc('day', now()) + interval '1 day'
  ) t;

  -- Pending drafts
  select count(*) into v_pending_drafts
  from public.consultations
  where doctor_id = d and status = 'draft';

  -- Total and published consults
  select count(*), count(*) filter (where status = 'published')
  into v_total_consults, v_published_consults
  from public.consultations
  where doctor_id = d;

  -- Publish rate (%)
  if v_total_consults > 0 then
    v_publish_rate := round((v_published_consults::numeric / v_total_consults::numeric) * 100, 1);
  else
    v_publish_rate := 100.0;
  end if;

  -- Avg consult minutes
  select coalesce(round(avg(duration_seconds) / 60, 1), 12.0)
  into v_avg_consult_minutes
  from public.consultations
  where doctor_id = d and duration_seconds > 0;

  return json_build_object(
    'patients_today', coalesce(v_patients_today, 0),
    'pending_drafts', coalesce(v_pending_drafts, 0),
    'avg_consult_minutes', coalesce(v_avg_consult_minutes, 12.0),
    'publish_rate', coalesce(v_publish_rate, 100.0)
  );
end;
$$;

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.doctor_details enable row level security;
alter table public.patient_identifiers enable row level security;
alter table public.doctor_patient_links enable row level security;
alter table public.otp_challenges enable row level security;
alter table public.appointments enable row level security;
alter table public.consultations enable row level security;
alter table public.consultation_diagnoses enable row level security;
alter table public.medications enable row level security;
alter table public.fhir_bundles enable row level security;
alter table public.disease_mappings enable row level security;
alter table public.prescription_translations enable row level security;
alter table public.documents enable row level security;
alter table public.document_shares enable row level security;
alter table public.notifications enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.audit_log enable row level security;

-- Policies: profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_linked_doctor"
  on public.profiles for select
  using (
    exists (
      select 1 from public.doctor_patient_links
      where doctor_id = auth.uid() and patient_id = profiles.id and status = 'active'
    )
  );

create policy "profiles_select_doctors"
  on public.profiles for select
  using (role = 'doctor');

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles_insert_own_or_service"
  on public.profiles for insert
  with check (auth.uid() = id or auth.role() = 'service_role');

-- Policies: doctor_details
create policy "doctor_details_select_all"
  on public.doctor_details for select
  using (true);

create policy "doctor_details_update_own"
  on public.doctor_details for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "doctor_details_insert_own_or_service"
  on public.doctor_details for insert
  with check (auth.uid() = user_id or auth.role() = 'service_role');

-- Policies: patient_identifiers
create policy "patient_identifiers_select_own_or_linked"
  on public.patient_identifiers for select
  using (
    patient_id = auth.uid()
    or exists (
      select 1 from public.doctor_patient_links
      where doctor_id = auth.uid() and patient_id = patient_identifiers.patient_id and status = 'active'
    )
  );

create policy "patient_identifiers_insert_own"
  on public.patient_identifiers for insert
  with check (patient_id = auth.uid() or auth.role() = 'service_role');

create policy "patient_identifiers_update_own"
  on public.patient_identifiers for update
  using (patient_id = auth.uid() or auth.role() = 'service_role');

create policy "patient_identifiers_delete_own"
  on public.patient_identifiers for delete
  using (patient_id = auth.uid() or auth.role() = 'service_role');

-- Policies: doctor_patient_links
create policy "links_select_parties"
  on public.doctor_patient_links for select
  using (auth.uid() in (doctor_id, patient_id));

create policy "links_update_patient_revoke"
  on public.doctor_patient_links for update
  using (auth.uid() = patient_id)
  with check (auth.uid() = patient_id);

create policy "links_service_role_all"
  on public.doctor_patient_links for all
  using (auth.role() = 'service_role');

-- Policies: otp_challenges (service role only)
create policy "otp_service_role_only"
  on public.otp_challenges for all
  using (auth.role() = 'service_role');

-- Policies: appointments
create policy "appointments_select_parties"
  on public.appointments for select
  using (auth.uid() in (doctor_id, patient_id));

create policy "appointments_patient_insert"
  on public.appointments for insert
  with check (auth.uid() = patient_id or auth.role() = 'service_role');

create policy "appointments_update_doctor_or_patient"
  on public.appointments for update
  using (auth.uid() in (doctor_id, patient_id))
  with check (auth.uid() in (doctor_id, patient_id));

-- Policies: consultations
create policy "consultations_doctor_all"
  on public.consultations for all
  using (doctor_id = auth.uid() and public.is_linked(auth.uid(), patient_id))
  with check (doctor_id = auth.uid() and public.is_linked(auth.uid(), patient_id));

create policy "consultations_patient_select"
  on public.consultations for select
  using (patient_id = auth.uid() and status = 'published');

create policy "consultations_service_role"
  on public.consultations for all
  using (auth.role() = 'service_role');

-- Policies: consultation_diagnoses
create policy "diagnoses_doctor_all"
  on public.consultation_diagnoses for all
  using (
    exists (
      select 1 from public.consultations c
      where c.id = consultation_diagnoses.consultation_id
        and c.doctor_id = auth.uid()
        and public.is_linked(auth.uid(), c.patient_id)
    )
  );

create policy "diagnoses_patient_select"
  on public.consultation_diagnoses for select
  using (
    exists (
      select 1 from public.consultations c
      where c.id = consultation_diagnoses.consultation_id
        and c.patient_id = auth.uid()
        and c.status = 'published'
    )
  );

create policy "diagnoses_service_role"
  on public.consultation_diagnoses for all
  using (auth.role() = 'service_role');

-- Policies: medications
create policy "medications_doctor_all"
  on public.medications for all
  using (
    exists (
      select 1 from public.consultations c
      where c.id = medications.consultation_id
        and c.doctor_id = auth.uid()
        and public.is_linked(auth.uid(), c.patient_id)
    )
  );

create policy "medications_patient_select"
  on public.medications for select
  using (
    exists (
      select 1 from public.consultations c
      where c.id = medications.consultation_id
        and c.patient_id = auth.uid()
        and c.status = 'published'
    )
  );

create policy "medications_service_role"
  on public.medications for all
  using (auth.role() = 'service_role');

-- Policies: fhir_bundles
create policy "fhir_doctor_all"
  on public.fhir_bundles for all
  using (
    exists (
      select 1 from public.consultations c
      where c.id = fhir_bundles.consultation_id
        and c.doctor_id = auth.uid()
        and public.is_linked(auth.uid(), c.patient_id)
    )
  );

create policy "fhir_patient_select"
  on public.fhir_bundles for select
  using (
    exists (
      select 1 from public.consultations c
      where c.id = fhir_bundles.consultation_id
        and c.patient_id = auth.uid()
        and c.status = 'published'
    )
  );

create policy "fhir_service_role"
  on public.fhir_bundles for all
  using (auth.role() = 'service_role');

-- Policies: disease_mappings
create policy "disease_mappings_select_auth"
  on public.disease_mappings for select
  using (true);

-- Policies: prescription_translations
create policy "translations_select"
  on public.prescription_translations for select
  using (
    exists (
      select 1 from public.medications m
      join public.consultations c on c.id = m.consultation_id
      where m.id = prescription_translations.medication_id
        and (
          (c.doctor_id = auth.uid() and public.is_linked(auth.uid(), c.patient_id))
          or (c.patient_id = auth.uid() and c.status = 'published')
        )
    )
  );

create policy "translations_service_role"
  on public.prescription_translations for all
  using (auth.role() = 'service_role');

-- Policies: documents
create policy "documents_owner_all"
  on public.documents for all
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

create policy "documents_doctor_select_shared"
  on public.documents for select
  using (
    exists (
      select 1 from public.document_shares ds
      where ds.document_id = documents.id and ds.doctor_id = auth.uid()
    )
  );

create policy "documents_service_role"
  on public.documents for all
  using (auth.role() = 'service_role');

-- Policies: document_shares
create policy "shares_patient_all"
  on public.document_shares for all
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_shares.document_id and d.patient_id = auth.uid()
    )
  );

create policy "shares_doctor_select"
  on public.document_shares for select
  using (doctor_id = auth.uid());

create policy "shares_service_role"
  on public.document_shares for all
  using (auth.role() = 'service_role');

-- Policies: notifications
create policy "notifications_owner_all"
  on public.notifications for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications_service_role"
  on public.notifications for all
  using (auth.role() = 'service_role');

-- Policies: chat_sessions & chat_messages
create policy "chat_sessions_owner"
  on public.chat_sessions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "chat_sessions_service_role"
  on public.chat_sessions for all
  using (auth.role() = 'service_role');

create policy "chat_messages_owner"
  on public.chat_messages for all
  using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id and s.user_id = auth.uid()
    )
  );

create policy "chat_messages_service_role"
  on public.chat_messages for all
  using (auth.role() = 'service_role');

-- Policies: audit_log
create policy "audit_log_select_own"
  on public.audit_log for select
  using (actor_id = auth.uid());

create policy "audit_log_service_role"
  on public.audit_log for all
  using (auth.role() = 'service_role');

-- Realtime publication
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when others then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.appointments;
exception when others then null;
end $$;

-- Storage buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('patient-docs', 'patient-docs', false)
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', false)
on conflict (id) do update set public = false;

-- Storage policies
create policy "avatars_public_select"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_user_upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "signatures_doctor_access"
  on storage.objects for all
  using (bucket_id = 'signatures' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'signatures' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "patient_docs_patient_access"
  on storage.objects for all
  using (bucket_id = 'patient-docs' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'patient-docs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "patient_docs_doctor_shared_select"
  on storage.objects for select
  using (
    bucket_id = 'patient-docs'
    and exists (
      select 1 from public.documents d
      join public.document_shares ds on ds.document_id = d.id
      where d.storage_path = name and ds.doctor_id = auth.uid()
    )
  );
