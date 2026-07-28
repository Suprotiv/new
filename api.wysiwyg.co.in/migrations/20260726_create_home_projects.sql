create table if not exists public.home_projects (
  id bigint generated always as identity primary key,
  image text not null check (length(image) > 0),
  link text not null default '',
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists home_projects_order_idx
  on public.home_projects (display_order, id);

drop trigger if exists set_home_projects_updated_at on public.home_projects;
create trigger set_home_projects_updated_at
before update on public.home_projects
for each row execute function public.set_updated_at();

alter table public.home_projects enable row level security;

insert into public.home_projects (image, link, display_order)
select seed.image, '', seed.display_order
from (
  values
    ('/uploads/home-projects/work-SnoBite.jpg', 0),
    ('/uploads/home-projects/scrollImage.jpg', 1),
    ('/uploads/home-projects/work-ITC-Hotel.jpg', 2),
    ('/uploads/home-projects/scrollImage2.jpg', 3),
    ('/uploads/home-projects/work-VION.jpg', 4),
    ('/uploads/home-projects/scrollImage4.jpg', 5),
    ('/uploads/home-projects/img-News-Siddha-Serena-bottom.jpeg', 6),
    ('/uploads/home-projects/scrollImage5.jpg', 7)
) as seed(image, display_order)
where not exists (select 1 from public.home_projects);

update public.home_projects
set image = case image
  when '/images/work/work-SnoBite.jpg' then '/uploads/home-projects/work-SnoBite.jpg'
  when '/images/scrollImage.jpg' then '/uploads/home-projects/scrollImage.jpg'
  when '/images/work/work-ITC-Hotel.jpg' then '/uploads/home-projects/work-ITC-Hotel.jpg'
  when '/images/scrollImage2.jpg' then '/uploads/home-projects/scrollImage2.jpg'
  when '/images/work/work-VION.jpg' then '/uploads/home-projects/work-VION.jpg'
  when '/images/scrollImage4.jpg' then '/uploads/home-projects/scrollImage4.jpg'
  when '/images/img-News-Siddha-Serena-bottom.jpeg' then '/uploads/home-projects/img-News-Siddha-Serena-bottom.jpeg'
  when '/images/scrollImage5.jpg' then '/uploads/home-projects/scrollImage5.jpg'
  else image
end
where image in (
  '/images/work/work-SnoBite.jpg',
  '/images/scrollImage.jpg',
  '/images/work/work-ITC-Hotel.jpg',
  '/images/scrollImage2.jpg',
  '/images/work/work-VION.jpg',
  '/images/scrollImage4.jpg',
  '/images/img-News-Siddha-Serena-bottom.jpeg',
  '/images/scrollImage5.jpg'
);
