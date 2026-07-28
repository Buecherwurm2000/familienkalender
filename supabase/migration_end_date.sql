-- In Supabase SQL Editor ausführen um end_date hinzuzufügen
alter table events add column if not exists end_date date;
