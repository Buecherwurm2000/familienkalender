-- In Supabase SQL Editor ausführen
alter table events add column if not exists calendar text default 'alle';
update events set calendar = 'alle' where calendar is null;
