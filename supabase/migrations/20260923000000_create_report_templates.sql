create table public.report_templates (
  recipient text primary key check (recipient in ('zuk', 'burmistrz')),
  email text not null,
  subject text not null,
  body text not null,
  updated_at timestamptz not null default now()
);

alter table public.report_templates enable row level security;

revoke all on table public.report_templates from anon;
grant select, update on table public.report_templates to authenticated;

create policy "Authenticated users can read report templates"
  on public.report_templates
  for select
  to authenticated
  using (true);

create policy "Authenticated users can update report templates"
  on public.report_templates
  for update
  to authenticated
  using (true)
  with check (true);

insert into public.report_templates (recipient, email, subject, body)
values
  (
    'zuk',
    'uzupelnij-zuk@example.invalid',
    'Zgłoszenie uciążliwego zapachu',
    'SZKIC — przed uruchomieniem zgłoszeń uzupełnij właściwy adres i treść.\n\nDzień dobry,\n\nzgłaszam uciążliwy zapach.\n\nImię i nazwisko: {{full_name}}\nAdres: {{address}}\nPoziom zapachu (1–5): {{odor_level}}\nCharakter zapachu: {{odor_pattern}}\n\nZ poważaniem,\n{{full_name}}'
  ),
  (
    'burmistrz',
    'uzupelnij-burmistrz@example.invalid',
    'Zgłoszenie uciążliwego zapachu',
    'SZKIC — przed uruchomieniem zgłoszeń uzupełnij właściwy adres i treść.\n\nDzień dobry,\n\nzgłaszam uciążliwy zapach.\n\nImię i nazwisko: {{full_name}}\nAdres: {{address}}\nPoziom zapachu (1–5): {{odor_level}}\nCharakter zapachu: {{odor_pattern}}\n\nZ poważaniem,\n{{full_name}}'
  );
