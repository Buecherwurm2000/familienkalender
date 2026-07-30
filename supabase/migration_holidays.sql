-- In Supabase SQL Editor ausführen
alter table events add column if not exists is_holiday boolean default false;
