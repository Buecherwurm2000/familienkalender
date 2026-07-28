-- In Supabase SQL Editor ausführen
create table if not exists members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  color text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table members enable row level security;

create policy "Alle können Mitglieder lesen"
  on members for select using (true);
create policy "Alle können Mitglieder erstellen"
  on members for insert with check (true);
create policy "Alle können Mitglieder bearbeiten"
  on members for update using (true);
create policy "Alle können Mitglieder löschen"
  on members for delete using (true);

alter publication supabase_realtime add table members;

-- Standard-Mitglieder eintragen
insert into members (name, color, sort_order) values
  ('Mama', '#ec4899', 0),
  ('Papa', '#3b82f6', 1),
  ('Kind 1', '#10b981', 2),
  ('Kind 2', '#f59e0b', 3),
  ('Familie', '#8b5cf6', 4);
