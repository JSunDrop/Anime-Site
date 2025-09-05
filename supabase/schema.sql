-- Same schema as previous enhanced scaffold, with age-gated RLS.
create extension if not exists pgcrypto;
create type rating as enum ('E','T','M','X');
create type work_kind as enum ('manga','animation');
create or replace function public.rating_min_age(r rating) returns int language sql immutable as $$
  select case r when 'E' then 0 when 'T' then 13 when 'M' then 17 when 'X' then 18 end;
$$;
create table if not exists public.profiles ( id uuid primary key references auth.users(id) on delete cascade, handle text unique, display_name text, dob date, created_at timestamptz default now() );
alter table public.profiles enable row level security;

create table if not exists public.works ( id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, kind work_kind not null, synopsis text, tags text[] default '{}', rating rating not null default 'E', cover_url text, created_at timestamptz default now() );
alter table public.works enable row level security;

create table if not exists public.parts ( id uuid primary key default gen_random_uuid(), work_id uuid references public.works(id) on delete cascade, index_num int not null, title text, rating rating not null default 'E', is_public boolean default true, published_at timestamptz, created_at timestamptz default now() );
alter table public.parts enable row level security;

create table if not exists public.pages ( id uuid primary key default gen_random_uuid(), part_id uuid references public.parts(id) on delete cascade, page_num int not null, image_url text not null );
alter table public.pages enable row level security;

create table if not exists public.comments ( id uuid primary key default gen_random_uuid(), work_id uuid references public.works(id) on delete cascade, part_id uuid references public.parts(id) on delete cascade, by uuid references public.profiles(id), text text not null, created_at timestamptz default now() );
alter table public.comments enable row level security;

create table if not exists public.forum_categories ( id uuid primary key default gen_random_uuid(), name text not null, description text );
alter table public.forum_categories enable row level security;
create table if not exists public.forum_threads ( id uuid primary key default gen_random_uuid(), category_id uuid references public.forum_categories(id) on delete cascade, title text not null, author_id uuid references public.profiles(id), created_at timestamptz default now() );
alter table public.forum_threads enable row level security;
create table if not exists public.forum_posts ( id uuid primary key default gen_random_uuid(), thread_id uuid references public.forum_threads(id) on delete cascade, by uuid references public.profiles(id), text text not null, created_at timestamptz default now() );
alter table public.forum_posts enable row level security;

create table if not exists public.live_messages ( id uuid primary key default gen_random_uuid(), by uuid references public.profiles(id), text text not null, created_at timestamptz default now() );
alter table public.live_messages enable row level security;

-- RLS
create policy if not exists "profiles sel" on public.profiles for select using ( true );
create policy if not exists "profiles upsert" on public.profiles for insert with check ( auth.role() = 'authenticated' );
create policy if not exists "profiles update self" on public.profiles for update using ( auth.uid() = id );

create policy if not exists "works select age" on public.works for select using (
  exists ( select 1 from public.profiles p where p.id = auth.uid()
    and (extract(year from age(current_date, p.dob)) >= rating_min_age(works.rating)) )
);
create policy if not exists "works insert" on public.works for insert with check ( auth.role() = 'authenticated' );

create policy if not exists "parts select age" on public.parts for select using (
  is_public and exists ( select 1 from public.profiles p where p.id = auth.uid()
    and (extract(year from age(current_date, p.dob)) >= rating_min_age(parts.rating)) )
);
create policy if not exists "parts insert" on public.parts for insert with check ( auth.role() = 'authenticated' );

create policy if not exists "pages read" on public.pages for select using ( true );
create policy if not exists "comments read" on public.comments for select using ( true );
create policy if not exists "comments insert" on public.comments for insert with check ( auth.role() = 'authenticated' );
create policy if not exists "forum_categories read" on public.forum_categories for select using ( true );
create policy if not exists "forum_threads read" on public.forum_threads for select using ( true );
create policy if not exists "forum_threads insert" on public.forum_threads for insert with check ( auth.role() = 'authenticated' );
create policy if not exists "forum_posts read" on public.forum_posts for select using ( true );
create policy if not exists "forum_posts insert" on public.forum_posts for insert with check ( auth.role() = 'authenticated' );
create policy if not exists "live read" on public.live_messages for select using ( true );
create policy if not exists "live send" on public.live_messages for insert with check ( auth.role() = 'authenticated' );

insert into public.forum_categories (name, description) values ('General','Chat about anything') on conflict do nothing;
