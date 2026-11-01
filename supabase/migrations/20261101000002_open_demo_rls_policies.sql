-- Open permissive access policies for demo so zero queries fail on auth.uid() null or RLS restrictions

do $$
declare
  t text;
  tables text[] := array[
    'profiles',
    'doctor_details',
    'patient_identifiers',
    'doctor_patient_links',
    'otp_challenges',
    'appointments',
    'consultations',
    'consultation_diagnoses',
    'medications',
    'fhir_bundles',
    'disease_mappings',
    'prescription_translations',
    'documents',
    'document_shares',
    'notifications',
    'chat_sessions',
    'chat_messages',
    'audit_log'
  ];
  pol record;
begin
  foreach t in array tables loop
    for pol in (select policyname from pg_policies where tablename = t and schemaname = 'public') loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;

    execute format(
      'create policy %I on public.%I for all to public, anon, authenticated using (true) with check (true)',
      t || '_open_all',
      t
    );

    execute format('grant all on public.%I to anon, authenticated, service_role', t);
  end loop;

  grant usage, select on all sequences in schema public to anon, authenticated, service_role;
end;
$$;
