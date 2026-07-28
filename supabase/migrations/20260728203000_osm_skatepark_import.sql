-- Evidence původu hromadně importovaných míst.
alter table public.trails
  add column if not exists source text,
  add column if not exists source_id text,
  add column if not exists source_url text;

-- Jeden prvek OpenStreetMap se nesmí naimportovat vícekrát.
create unique index if not exists trails_source_source_id_uidx
  on public.trails (source, source_id)
  where source is not null and source_id is not null;

create index if not exists trails_skatepark_coordinates_idx
  on public.trails (trail_type, lat, lng)
  where trail_type = 'skatepark';
