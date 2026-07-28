-- Supabase SQL: In deinem Supabase-Dashboard unter "SQL Editor" ausführen

create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date date not null,
  time text,
  member text not null,
  color text not null,
  notes text,
  created_at timestamptz default now()
);

-- Realtime aktivieren
alter publication supabase_realtime add table events;

-- Row Level Security: öffentlicher Zugriff (für Familiennutzung ohne Login)
alter table events enable row level security;

create policy "Alle können Termine lesen"
  on events for select using (true);

create policy "Alle können Termine erstellen"
  on events for insert with check (true);

create policy "Alle können Termine bearbeiten"
  on events for update using (true);

create policy "Alle können Termine löschen"
  on events for delete using (true);
