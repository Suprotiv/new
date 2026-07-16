create table if not exists public.projects (
  project_id text primary key,
  title text not null default '',
  summary_title text default '',
  project_description text default '',
  question text default '',
  answer text default '',
  summary text default '',
  meta jsonb not null default '{}'::jsonb,
  categories text[] not null default '{}',
  tags text[] not null default '{}',
  main_image text default '',
  images jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  slug text primary key,
  name text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id text primary key,
  name text not null,
  position text not null,
  image text default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id text primary key,
  name text not null,
  link text default '',
  bw_image text default '',
  color_image text default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content (
  key text primary key,
  type text not null check (type in ('text', 'image')),
  value text not null default '',
  updated_at timestamptz not null default now()
);

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists set_team_members_updated_at on public.team_members;
create trigger set_team_members_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_site_content_updated_at on public.site_content;
create trigger set_site_content_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

drop trigger if exists set_accolades_updated_at on public.accolades;
create trigger set_accolades_updated_at
before update on public.accolades
for each row execute function public.set_updated_at();

create index if not exists projects_title_idx on public.projects (lower(title));
create index if not exists projects_categories_idx on public.projects using gin (categories);
create index if not exists projects_tags_idx on public.projects using gin (tags);
create index if not exists team_members_order_idx on public.team_members (display_order);
create index if not exists clients_order_idx on public.clients (display_order);
create index if not exists site_content_type_idx on public.site_content (type);
create index if not exists accolades_display_order_idx on public.accolades (display_order);

alter table public.projects enable row level security;
alter table public.categories enable row level security;
alter table public.team_members enable row level security;
alter table public.clients enable row level security;
alter table public.site_content enable row level security;
alter table public.accolades enable row level security;
