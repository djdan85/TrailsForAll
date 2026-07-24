-- Uživatelský profil je ve výchozím stavu neveřejný.
alter table public.profiles
  add column if not exists show_in_community boolean not null default false;

-- Starší profily bez výslovné volby zůstanou neveřejné.
update public.profiles
set show_in_community = false
where show_in_community is null;

-- Doporučený index pro veřejný výpis komunity.
create index if not exists profiles_show_in_community_idx
  on public.profiles (show_in_community, created_at desc);
