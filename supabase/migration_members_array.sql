-- In Supabase SQL Editor ausführen
alter table events add column if not exists members text[] default '{}';
-- Bestehende Daten migrieren: member-Feld in members-Array kopieren
update events set members = array[member] where members = '{}' or members is null;
