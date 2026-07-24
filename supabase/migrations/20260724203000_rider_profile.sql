-- Profil ridera podporuje více disciplín a volný popis vybavení.
alter table public.profiles
  add column if not exists primary_discipline text not null default 'mtb',
  add column if not exists equipment_text text;

-- Převedení stávajících typů kol na nové disciplíny.
update public.profiles
set primary_discipline = case bike_type
  when 'enduro' then 'enduro'
  when 'dh' then 'downhill'
  when 'xc' then 'mtb'
  when 'trail' then 'mtb'
  when 'ebike' then 'mtb'
  else 'other'
end
where primary_discipline is null or primary_discipline = 'mtb';

alter table public.profiles
  drop constraint if exists profiles_primary_discipline_check;

alter table public.profiles
  add constraint profiles_primary_discipline_check
  check (primary_discipline in ('mtb', 'enduro', 'downhill', 'bikepark', 'pumptrack', 'skatepark', 'bmx', 'skateboard', 'scooter', 'other'));
