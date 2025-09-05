-- Core tables (trimmed for starter)
create type role as enum ('owner','admin','creator','member');
create type work_kind as enum ('manga','animation');
create type rating as enum ('E','T','M','X');

create table public.users (
  id uuid primary key default gen_random_uuid(),
  handle text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

create table public.studios (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  description text,
  avatar_url text,
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

create table public.studio_members (
  studio_id uuid references public.studios(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role role not null default 'member',
  primary key (studio_id, user_id)
);

create table public.works (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  title text not null,
  slug text unique not null,
  kind work_kind not null,
  synopsis text,
  tags text[] default '{}',
  rating rating not null default 'E',
  cover_url text,
  created_at timestamptz default now()
);

create table public.parts (
  id uuid primary key default gen_random_uuid(),
  work_id uuid references public.works(id) on delete cascade,
  index_num int not null,
  title text,
  rating rating not null default 'E',
  is_public boolean default true,
  published_at timestamptz,
  created_at timestamptz default now()
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  part_id uuid references public.parts(id) on delete cascade,
  page_num int not null,
  image_url text not null,
  width int, height int
);

-- marketplace basics
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_user_id uuid references public.users(id),
  studio_id uuid references public.studios(id),
  work_id uuid references public.works(id),
  title text not null,
  price_cents int not null,
  currency text not null default 'USD',
  is_active boolean default true,
  created_at timestamptz default now()
);
