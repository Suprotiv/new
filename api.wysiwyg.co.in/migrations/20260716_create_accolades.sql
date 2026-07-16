begin;

create table if not exists public.accolades (
  id text primary key,
  category text not null,
  award text not null,
  project text not null,
  description text not null,
  image text not null default '',
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists accolades_display_order_idx
  on public.accolades (display_order);

drop trigger if exists set_accolades_updated_at on public.accolades;
create trigger set_accolades_updated_at
before update on public.accolades
for each row execute function public.set_updated_at();

alter table public.accolades enable row level security;

with stored_collection as (
  select value::jsonb as items
  from public.site_content
  where key = 'home.accolades.items'
    and type = 'text'
), collection_items as (
  select item, ordinality
  from stored_collection,
    jsonb_array_elements(items) with ordinality as entry(item, ordinality)
)
insert into public.accolades (
  id,
  category,
  award,
  project,
  description,
  image,
  display_order
)
select
  item->>'id',
  coalesce(item->>'category', ''),
  coalesce(item->>'award', ''),
  coalesce(item->>'project', ''),
  coalesce(item->>'description', ''),
  coalesce(item->>'image', ''),
  (ordinality - 1)::integer
from collection_items
on conflict (id) do update set
  category = excluded.category,
  award = excluded.award,
  project = excluded.project,
  description = excluded.description,
  image = excluded.image,
  display_order = excluded.display_order;

delete from public.site_content
where key like 'home.accolades.%';

commit;
