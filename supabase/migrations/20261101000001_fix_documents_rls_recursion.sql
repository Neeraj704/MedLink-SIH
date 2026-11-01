-- Fix infinite recursion in documents and document_shares cross-table RLS policies

create or replace function public.is_document_owner(doc_id uuid, user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.documents
    where id = doc_id and patient_id = user_id
  );
$$;

create or replace function public.is_document_shared_with_doctor(doc_id uuid, doc_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.document_shares
    where document_id = doc_id and doctor_id = doc_user_id
  );
$$;

drop policy if exists "documents_doctor_select_shared" on public.documents;
create policy "documents_doctor_select_shared"
  on public.documents for select
  using (public.is_document_shared_with_doctor(id, auth.uid()));

drop policy if exists "shares_patient_all" on public.document_shares;
create policy "shares_patient_all"
  on public.document_shares for all
  using (public.is_document_owner(document_id, auth.uid()));

-- Fix extensions search_path for pg_trgm and pgcrypto in RPCs
create or replace function public.search_diseases(q text, lim int default 8)
returns setof public.disease_mappings
language plpgsql
security definer
set search_path = public, extensions
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
set search_path = public, extensions
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

