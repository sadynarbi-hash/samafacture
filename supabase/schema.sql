-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- BUSINESSES
-- ============================================================
create table if not exists public.businesses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  address text,
  logo_url text,
  invoice_count integer not null default 0,
  quote_count integer not null default 0,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;
create policy "Users select own businesses" on public.businesses for select using (auth.uid() = user_id);
create policy "Users insert own businesses" on public.businesses for insert with check (auth.uid() = user_id);
create policy "Users update own businesses" on public.businesses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own businesses" on public.businesses for delete using (auth.uid() = user_id);

-- ============================================================
-- CLIENTS
-- ============================================================
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  address text,
  outstanding_amount numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;
create policy "Users select own clients" on public.clients for select
  using (business_id in (select id from public.businesses where user_id = auth.uid()));
create policy "Users insert own clients" on public.clients for insert
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
create policy "Users update own clients" on public.clients for update
  using (business_id in (select id from public.businesses where user_id = auth.uid()))
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
create policy "Users delete own clients" on public.clients for delete
  using (business_id in (select id from public.businesses where user_id = auth.uid()));

-- ============================================================
-- INVOICES
-- ============================================================
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  invoice_number text not null,
  issue_date date not null,
  due_date date,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'partial')),
  items jsonb not null default '[]',
  payments jsonb not null default '[]',
  total_amount numeric not null default 0,
  paid_amount numeric not null default 0,
  currency text not null default 'FCFA',
  photo_urls jsonb not null default '[]',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.invoices enable row level security;
create policy "Users select own invoices" on public.invoices for select
  using (business_id in (select id from public.businesses where user_id = auth.uid()));
create policy "Users insert own invoices" on public.invoices for insert
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
create policy "Users update own invoices" on public.invoices for update
  using (business_id in (select id from public.businesses where user_id = auth.uid()))
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
create policy "Users delete own invoices" on public.invoices for delete
  using (business_id in (select id from public.businesses where user_id = auth.uid()));

-- ============================================================
-- QUOTES
-- ============================================================
create table if not exists public.quotes (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  quote_number text not null,
  issue_date date not null,
  due_date date,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected')),
  items jsonb not null default '[]',
  total_amount numeric not null default 0,
  currency text not null default 'FCFA',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.quotes enable row level security;
create policy "Users select own quotes" on public.quotes for select
  using (business_id in (select id from public.businesses where user_id = auth.uid()));
create policy "Users insert own quotes" on public.quotes for insert
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
create policy "Users update own quotes" on public.quotes for update
  using (business_id in (select id from public.businesses where user_id = auth.uid()))
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
create policy "Users delete own quotes" on public.quotes for delete
  using (business_id in (select id from public.businesses where user_id = auth.uid()));

-- ============================================================
-- CATALOG ITEMS
-- ============================================================
create table if not exists public.catalog_items (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  type text not null check (type in ('service', 'material', 'other')),
  name text not null,
  details text,
  unit_price numeric not null default 0,
  unit_type text,
  taxable boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.catalog_items enable row level security;
create policy "Users select own catalog" on public.catalog_items for select
  using (business_id in (select id from public.businesses where user_id = auth.uid()));
create policy "Users insert own catalog" on public.catalog_items for insert
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
create policy "Users update own catalog" on public.catalog_items for update
  using (business_id in (select id from public.businesses where user_id = auth.uid()))
  with check (business_id in (select id from public.businesses where user_id = auth.uid()));
create policy "Users delete own catalog" on public.catalog_items for delete
  using (business_id in (select id from public.businesses where user_id = auth.uid()));

-- ============================================================
-- HELPER FUNCTION: Increment counters
-- ============================================================
create or replace function public.increment_count(business_id uuid, field text)
returns void language plpgsql security definer as $$
begin
  if field = 'invoice_count' then
    update public.businesses set invoice_count = invoice_count + 1 where id = business_id;
  elsif field = 'quote_count' then
    update public.businesses set quote_count = quote_count + 1 where id = business_id;
  end if;
end;
$$;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public) values ('logos', 'logos', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('invoice-photos', 'invoice-photos', false) on conflict do nothing;

create policy "Anyone can read logos" on storage.objects for select using (bucket_id = 'logos');
create policy "Auth users upload logos" on storage.objects for insert with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Auth users read their photos" on storage.objects for select using (bucket_id = 'invoice-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Auth users upload photos" on storage.objects for insert with check (bucket_id = 'invoice-photos' and auth.uid()::text = (storage.foldername(name))[1]);
