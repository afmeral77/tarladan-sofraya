-- Tarladan Sofraya: initial identity and catalog foundation.
-- Apply via Supabase migration tooling; do not put service-role credentials in the app.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated;

create type public.profile_role as enum ('producer', 'buyer', 'carrier', 'admin');
create type public.business_kind as enum ('producer', 'buyer', 'carrier');
create type public.producer_verification_status as enum ('pending', 'approved', 'rejected');
create type public.catalog_product_status as enum ('draft', 'active', 'paused', 'archived');
create type public.product_unit as enum ('kg', 'ton', 'crate', 'piece');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.profile_role not null default 'buyer',
  full_name text not null default '',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  kind public.business_kind not null,
  legal_name text not null,
  display_name text not null,
  tax_office text,
  tax_number text,
  phone text,
  email text,
  country_code text not null default 'TR',
  city text,
  district text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, kind)
);

create table public.producers (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  business_id uuid references public.businesses (id) on delete set null,
  public_name text not null,
  bio text,
  region text,
  city text,
  verification_status public.producer_verification_status not null default 'pending',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.buyers (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.carriers (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete restrict,
  vehicle_type text,
  capacity_kg numeric(12, 2) check (capacity_kg is null or capacity_kg > 0),
  service_regions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order smallint not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  producer_user_id uuid not null references public.producers (user_id) on delete restrict,
  category_id uuid not null references public.product_categories (id) on delete restrict,
  name text not null,
  slug text not null,
  description text,
  quality_grade text,
  price_per_unit numeric(12, 2) not null check (price_per_unit >= 0),
  currency_code char(3) not null default 'TRY',
  unit public.product_unit not null,
  minimum_order_qty numeric(12, 2) not null default 1 check (minimum_order_qty > 0),
  origin_city text,
  origin_region text,
  status public.catalog_product_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (producer_user_id, slug)
);

create table public.inventory (
  product_id uuid primary key references public.products (id) on delete cascade,
  available_quantity numeric(14, 2) not null default 0 check (available_quantity >= 0),
  estimated_quantity numeric(14, 2) check (estimated_quantity is null or estimated_quantity >= 0),
  updated_at timestamptz not null default now()
);

create table public.harvests (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  harvest_date date,
  estimated_quantity numeric(14, 2) check (estimated_quantity is null or estimated_quantity >= 0),
  unit public.product_unit not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index businesses_owner_id_idx on public.businesses (owner_id);
create index producers_public_status_idx on public.producers (verification_status, is_public);
create index products_category_status_idx on public.products (category_id, status);
create index products_producer_status_idx on public.products (producer_user_id, status);
create index products_city_idx on public.products (origin_city);
create index harvests_product_date_idx on public.harvests (product_id, harvest_date);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create or replace function private.is_producer_owner(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target_user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'producer'
    );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', 'buyer');
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    case requested_role
      when 'producer' then 'producer'::public.profile_role
      when 'carrier' then 'carrier'::public.profile_role
      else 'buyer'::public.profile_role
    end,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

revoke all on function private.is_admin() from public, anon;
revoke all on function private.is_producer_owner(uuid) from public, anon;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.is_producer_owner(uuid) to anon, authenticated;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function private.handle_new_user();

insert into public.product_categories (slug, name, sort_order) values
  ('sebze', 'Sebze', 10),
  ('meyve', 'Meyve', 20),
  ('bakliyat', 'Bakliyat', 30),
  ('tahil', 'Tahıl', 40),
  ('patates-sogan', 'Patates & Soğan', 50),
  ('diger', 'Diğer tarım ürünleri', 60)
on conflict (slug) do nothing;

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.producers enable row level security;
alter table public.buyers enable row level security;
alter table public.carriers enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.inventory enable row level security;
alter table public.harvests enable row level security;

revoke all on public.profiles, public.businesses, public.producers, public.buyers,
  public.carriers, public.product_categories, public.products,
  public.inventory, public.harvests from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone, avatar_url, updated_at) on public.profiles to authenticated;
grant select, insert, update, delete on public.businesses, public.producers,
  public.buyers, public.carriers to authenticated;
grant select on public.product_categories to anon, authenticated;
grant select, insert, update, delete on public.products, public.inventory,
  public.harvests to authenticated;
grant select on public.producers, public.products, public.inventory, public.harvests to anon;

grant usage, select on all sequences in schema public to authenticated;

create policy "Profiles: users read their own, admins read all"
on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select private.is_admin()));

create policy "Profiles: users update editable fields only"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Businesses: owner manages own, admins read all"
on public.businesses for all to authenticated
using (owner_id = (select auth.uid()) or (select private.is_admin()))
with check (owner_id = (select auth.uid()) or (select private.is_admin()));

create policy "Producers: public sees approved public profiles; owners and admins see own"
on public.producers for select to anon, authenticated
using (
  (is_public and verification_status = 'approved')
  or user_id = (select auth.uid())
  or (select private.is_admin())
);
create policy "Producers: producer manages own profile"
on public.producers for insert to authenticated
with check ((select private.is_producer_owner(user_id)));
create policy "Producers: producer updates own profile"
on public.producers for update to authenticated
using ((select private.is_producer_owner(user_id)) or (select private.is_admin()))
with check ((select private.is_producer_owner(user_id)) or (select private.is_admin()));

create policy "Buyers: owner manages own, admins read all"
on public.buyers for all to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()))
with check (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "Carriers: owner manages own, admins read all"
on public.carriers for all to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()))
with check (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "Categories: active categories are publicly readable"
on public.product_categories for select to anon, authenticated
using (is_active or (select private.is_admin()));

create policy "Products: public catalog, producer ownership, or admin"
on public.products for select to anon, authenticated
using (
  (
    status = 'active'
    and exists (
      select 1 from public.producers p
      where p.user_id = producer_user_id
        and p.is_public
        and p.verification_status = 'approved'
    )
  )
  or (select private.is_producer_owner(producer_user_id))
  or (select private.is_admin())
);
create policy "Products: producer creates own listings"
on public.products for insert to authenticated
with check ((select private.is_producer_owner(producer_user_id)));
create policy "Products: producer updates or deletes own listings"
on public.products for update to authenticated
using ((select private.is_producer_owner(producer_user_id)) or (select private.is_admin()))
with check ((select private.is_producer_owner(producer_user_id)) or (select private.is_admin()));
create policy "Products: producer deletes own listings"
on public.products for delete to authenticated
using ((select private.is_producer_owner(producer_user_id)) or (select private.is_admin()));

create policy "Inventory: public reads active catalog stock, producer manages own"
on public.inventory for select to anon, authenticated
using (
  exists (
    select 1 from public.products pr join public.producers p on p.user_id = pr.producer_user_id
    where pr.id = product_id and pr.status = 'active'
      and p.is_public and p.verification_status = 'approved'
  )
  or exists (
    select 1 from public.products pr where pr.id = product_id
      and (select private.is_producer_owner(pr.producer_user_id))
  )
  or (select private.is_admin())
);
create policy "Inventory: producer manages stock for own products"
on public.inventory for all to authenticated
using (
  exists (select 1 from public.products pr where pr.id = product_id
    and (select private.is_producer_owner(pr.producer_user_id)))
  or (select private.is_admin())
)
with check (
  exists (select 1 from public.products pr where pr.id = product_id
    and (select private.is_producer_owner(pr.producer_user_id)))
  or (select private.is_admin())
);

create policy "Harvests: public reads active catalog harvest dates, producer manages own"
on public.harvests for select to anon, authenticated
using (
  exists (
    select 1 from public.products pr join public.producers p on p.user_id = pr.producer_user_id
    where pr.id = product_id and pr.status = 'active'
      and p.is_public and p.verification_status = 'approved'
  )
  or exists (
    select 1 from public.products pr where pr.id = product_id
      and (select private.is_producer_owner(pr.producer_user_id))
  )
  or (select private.is_admin())
);
create policy "Harvests: producer manages dates for own products"
on public.harvests for all to authenticated
using (
  exists (select 1 from public.products pr where pr.id = product_id
    and (select private.is_producer_owner(pr.producer_user_id)))
  or (select private.is_admin())
)
with check (
  exists (select 1 from public.products pr where pr.id = product_id
    and (select private.is_producer_owner(pr.producer_user_id)))
  or (select private.is_admin())
);
