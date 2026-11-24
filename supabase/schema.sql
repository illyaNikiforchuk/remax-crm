-- ============================================================
-- Batumi CRM — Schema + RLS
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  phone       text,
  role        text not null default 'seller' check (role in ('admin', 'seller')),
  status      text not null default 'active' check (status in ('active', 'disabled')),
  created_at  timestamptz not null default now(),
  created_by  uuid references public.profiles(id)
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'seller')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- DISTRICTS
-- ============================================================
create table if not exists public.districts (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

insert into public.districts (name) values
  ('Старый город'),
  ('Новый бульвар'),
  ('Бульвар'),
  ('Аэропорт'),
  ('Махинджаури'),
  ('Гонио'),
  ('Кахабери'),
  ('Хелвачаури'),
  ('Багратиони'),
  ('Тамари'),
  ('Нуригели'),
  ('Анаклиа')
on conflict (name) do nothing;

-- ============================================================
-- PROPERTIES
-- ============================================================
create table if not exists public.properties (
  id                 uuid primary key default uuid_generate_v4(),
  author_id          uuid not null references public.profiles(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  market_type        text not null check (market_type in ('primary', 'secondary')),
  property_type      text not null check (property_type in ('apartment','studio','apartments','house','commercial','land')),
  district_id        uuid references public.districts(id),

  title              text,
  address            text,
  area               numeric(10,2),
  price              numeric(14,2),
  price_per_sqm      numeric(14,2) generated always as (
                       case when area > 0 then price / area else null end
                     ) stored,
  rooms              integer,
  floor              integer,
  total_floors       integer,
  status             text not null default 'for_sale' check (status in ('for_sale','booked','sold','withdrawn')),

  -- Primary market fields
  developer          text,
  down_payment       numeric(14,2),
  installment_months integer,
  monthly_payment    numeric(14,2),

  -- Secondary market fields
  owner_name         text,
  owner_phone        text,

  description        text,
  drive_links        jsonb not null default '[]',
  extra_links        jsonb not null default '[]'
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- ACTIVITY LOG (optional)
-- ============================================================
create table if not exists public.activity_log (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id),
  property_id uuid references public.properties(id) on delete set null,
  action      text not null,
  details     jsonb,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.districts enable row level security;
alter table public.properties enable row level security;
alter table public.activity_log enable row level security;

-- Helper: get current user role
create or replace function public.get_my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- PROFILES policies
drop policy if exists "profiles: admin full access" on public.profiles;
create policy "profiles: admin full access"
  on public.profiles for all
  using (public.get_my_role() = 'admin');

drop policy if exists "profiles: seller read own" on public.profiles;
create policy "profiles: seller read own"
  on public.profiles for select
  using (id = auth.uid());

-- DISTRICTS policies
drop policy if exists "districts: all authenticated read" on public.districts;
create policy "districts: all authenticated read"
  on public.districts for select
  using (auth.uid() is not null);

drop policy if exists "districts: admin write" on public.districts;
create policy "districts: admin write"
  on public.districts for all
  using (public.get_my_role() = 'admin');

-- PROPERTIES policies
drop policy if exists "properties: all authenticated read" on public.properties;
create policy "properties: all authenticated read"
  on public.properties for select
  using (auth.uid() is not null);

drop policy if exists "properties: seller insert own" on public.properties;
create policy "properties: seller insert own"
  on public.properties for insert
  with check (author_id = auth.uid());

drop policy if exists "properties: seller update own" on public.properties;
create policy "properties: seller update own"
  on public.properties for update
  using (author_id = auth.uid() or public.get_my_role() = 'admin');

drop policy if exists "properties: seller delete own" on public.properties;
create policy "properties: seller delete own"
  on public.properties for delete
  using (author_id = auth.uid() or public.get_my_role() = 'admin');

-- ACTIVITY LOG policies
drop policy if exists "activity_log: admin read all" on public.activity_log;
create policy "activity_log: admin read all"
  on public.activity_log for select
  using (public.get_my_role() = 'admin');

drop policy if exists "activity_log: insert authenticated" on public.activity_log;
create policy "activity_log: insert authenticated"
  on public.activity_log for insert
  with check (user_id = auth.uid());

-- ============================================================
-- VIEWS / FUNCTIONS for dashboard
-- ============================================================
create or replace function public.get_dashboard_stats()
returns json language sql security definer stable as $$
  select json_build_object(
    'total', (select count(*) from public.properties),
    'for_sale', (select count(*) from public.properties where status = 'for_sale'),
    'booked', (select count(*) from public.properties where status = 'booked'),
    'sold', (select count(*) from public.properties where status = 'sold'),
    'withdrawn', (select count(*) from public.properties where status = 'withdrawn'),
    'primary', (select count(*) from public.properties where market_type = 'primary'),
    'secondary', (select count(*) from public.properties where market_type = 'secondary'),
    'by_district', (
      select json_agg(row_to_json(r)) from (
        select d.name as district, count(p.id)::int as count
        from public.districts d
        left join public.properties p on p.district_id = d.id
        group by d.name
        order by count desc
        limit 10
      ) r
    )
  );
$$;
