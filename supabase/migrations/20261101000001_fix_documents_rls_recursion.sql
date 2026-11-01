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
