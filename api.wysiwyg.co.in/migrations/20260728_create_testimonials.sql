begin;

create table if not exists public.testimonials (
  id text primary key,
  name text not null,
  designation text not null default '',
  quote text not null,
  image text not null default '',
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_display_order_idx
  on public.testimonials (display_order, created_at);

drop trigger if exists set_testimonials_updated_at on public.testimonials;
create trigger set_testimonials_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;

insert into public.testimonials (
  id,
  name,
  designation,
  quote,
  image,
  display_order,
  created_at,
  updated_at
)
select
  id,
  project,
  category,
  description,
  image,
  display_order,
  created_at,
  updated_at
from public.accolades
where award = 'Testimonial'
on conflict (id) do update set
  name = excluded.name,
  designation = excluded.designation,
  quote = excluded.quote,
  image = excluded.image,
  display_order = excluded.display_order,
  updated_at = excluded.updated_at;

-- Legacy accolade rows remain in place until the filesystem image migration
-- verifies and relocates their images.

commit;
