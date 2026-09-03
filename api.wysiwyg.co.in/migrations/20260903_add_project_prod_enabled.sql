alter table public.projects
  add column if not exists prod_enabled boolean not null default false;
