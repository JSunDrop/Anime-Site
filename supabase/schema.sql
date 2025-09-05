-- Enable extensions
create extension if not exists pgcrypto;
-- Types
create type rating as enum ('E','T','M','X');
create type work_kind as enum ('manga','animation');
-- Helper: minimum age per rating
create or replace function public.rating_min_age(r rating) returns int language sql immutable as $$
  select case r when 'E' then 0 when 'T' then 13 when 'M' then 17 when 'X' then 18 end;
$$;

-- Profiles (tie to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique,
  display_name text,
  dob date, -- required for age gating
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- Studios
create table public.studios (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  avatar_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.studios enable row level security;

create table public.studio_members (
  studio_id uuid references public.studios(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'member',
  primary key (studio_id, user_id)
);
alter table public.studio_members enable row level security;

-- Works
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
alter table public.works enable row level security;

-- Parts
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
alter table public.parts enable row level security;

-- Pages (images)
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  part_id uuid references public.parts(id) on delete cascade,
  page_num int not null,
  image_url text not null
);
alter table public.pages enable row level security;

-- Comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  work_id uuid references public.works(id) on delete cascade,
  part_id uuid references public.parts(id) on delete cascade,
  by uuid references public.profiles(id),
  text text not null,
  created_at timestamptz default now()
);
alter table public.comments enable row level security;

-- Forum
create table public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text
);
alter table public.forum_categories enable row level security;

create table public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.forum_categories(id) on delete cascade,
  title text not null,
  author_id uuid references public.profiles(id),
  created_at timestamptz default now()
);
alter table public.forum_threads enable row level security;

create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.forum_threads(id) on delete cascade,
  by uuid references public.profiles(id),
  text text not null,
  created_at timestamptz default now()
);
alter table public.forum_posts enable row level security;

-- Live chat
create table public.live_messages (
  id uuid primary key default gen_random_uuid(),
  by uuid references public.profiles(id),
  text text not null,
  created_at timestamptz default now()
);
alter table public.live_messages enable row level security;

-- Favorites & Likes
create table public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  work_id uuid references public.works(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, work_id)
);
alter table public.favorites enable row level security;

create table public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  part_id uuid references public.parts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, part_id)
);
alter table public.likes enable row level security;

-- Progress
create table public.progress (
  user_id uuid references public.profiles(id) on delete cascade,
  work_id uuid references public.works(id) on delete cascade,
  part_index int not null,
  page_num int not null default 1,
  updated_at timestamptz default now(),
  primary key (user_id, work_id)
);
alter table public.progress enable row level security;

-- Marketplace (placeholder)
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_user_id uuid references public.profiles(id),
  studio_id uuid references public.studios(id),
  work_id uuid references public.works(id),
  title text not null,
  price_cents int not null,
  currency text not null default 'USD',
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.listings enable row level security;

-- RLS Policies
-- Profiles: user can see self; (optional) public profiles visible to all
create policy "profiles sel self" on public.profiles for select using ( true );
create policy "profiles upsert self" on public.profiles for insert with check ( auth.uid() = id );
create policy "profiles update self" on public.profiles for update using ( auth.uid() = id );

-- Studios readable, insert/update by members/owners
create policy "studios read" on public.studios for select using ( true );
create policy "studios insert auth" on public.studios for insert with check ( auth.role() = 'authenticated' );
create policy "studios update owner" on public.studios for update using ( created_by = auth.uid() );

create policy "studio_members read" on public.studio_members for select using ( auth.role() = 'authenticated' );
create policy "studio_members manage" on public.studio_members for insert with check ( auth.role() = 'authenticated' );

-- Works: age-gated SELECT
create policy "works select age" on public.works for select using (
  exists ( select 1 from public.profiles p where p.id = auth.uid()
           and (extract(year from age(current_date, p.dob)) >= rating_min_age(works.rating)) )
);
create policy "works insert auth" on public.works for insert with check ( auth.role() = 'authenticated' );
create policy "works update owner" on public.works for update using (
  exists ( select 1 from studios s join studio_members m on m.studio_id=s.id where works.studio_id = s.id and m.user_id = auth.uid() )
);

-- Parts: age-gated via part rating and parent work
create policy "parts select age" on public.parts for select using (
  is_public and exists ( select 1 from public.profiles p where p.id = auth.uid()
    and (extract(year from age(current_date, p.dob)) >= rating_min_age(parts.rating)) )
);
create policy "parts insert auth" on public.parts for insert with check ( auth.role() = 'authenticated' );
create policy "parts update owner" on public.parts for update using (
  exists ( select 1 from works w join studios s on s.id=w.studio_id join studio_members m on m.studio_id=s.id
           where parts.work_id = w.id and m.user_id = auth.uid() )
);

-- Pages: visible if part is visible (simplified)
create policy "pages read" on public.pages for select using ( true );

-- Comments: readable by all authenticated; insert by authenticated
create policy "comments read" on public.comments for select using ( true );
create policy "comments insert" on public.comments for insert with check ( auth.role() = 'authenticated' );

-- Forum
create policy "forum_categories read" on public.forum_categories for select using ( true );
create policy "forum_threads read" on public.forum_threads for select using ( true );
create policy "forum_threads insert" on public.forum_threads for insert with check ( auth.role() = 'authenticated' );
create policy "forum_posts read" on public.forum_posts for select using ( true );
create policy "forum_posts insert" on public.forum_posts for insert with check ( auth.role() = 'authenticated' );

-- Live messages
create policy "live read" on public.live_messages for select using ( true );
create policy "live send" on public.live_messages for insert with check ( auth.role() = 'authenticated' );

-- Favorites, Likes, Progress
create policy "favorites read self" on public.favorites for select using ( auth.uid() = user_id );
create policy "favorites write self" on public.favorites for insert with check ( auth.uid() = user_id );
create policy "likes read self" on public.likes for select using ( auth.uid() = user_id );
create policy "likes write self" on public.likes for insert with check ( auth.uid() = user_id );
create policy "progress read self" on public.progress for select using ( auth.uid() = user_id );
create policy "progress write self" on public.progress for insert with check ( auth.uid() = user_id );

-- Seed minimal forum category
insert into public.forum_categories (name, description) values ('General','Chat about anything') on conflict do nothing;
