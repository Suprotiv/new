create table if not exists public.home_hero_images (
  id bigint generated always as identity primary key,
  image text not null check (length(image) > 0),
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists home_hero_images_order_idx
  on public.home_hero_images (display_order, id);

drop trigger if exists set_home_hero_images_updated_at on public.home_hero_images;
create trigger set_home_hero_images_updated_at
before update on public.home_hero_images
for each row execute function public.set_updated_at();

alter table public.home_hero_images enable row level security;

insert into public.home_hero_images (image, display_order)
select coalesce(
  (
    select value
    from public.site_content
    where key = 'home.hero.image' and type = 'image' and length(value) > 0
    limit 1
  ),
  '/uploads/site-content/default/Home-Wysiwyg.png'
), 0
where not exists (select 1 from public.home_hero_images);

delete from public.site_content where key = 'home.hero.image';
