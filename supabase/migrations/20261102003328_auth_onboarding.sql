-- Add role-specific buyer classification and an atomic, self-service onboarding RPC.
-- The function derives both user identity and role from the verified Supabase JWT.

create type public.buyer_business_type as enum (
  'manav',
  'market',
  'restoran',
  'lokanta',
  'diger'
);

alter table public.businesses
  add column buyer_type public.buyer_business_type;

alter table public.businesses
  add constraint businesses_buyer_type_matches_kind
  check (buyer_type is null or kind = 'buyer');

create or replace function public.complete_business_profile(
  p_legal_name text,
  p_display_name text,
  p_phone text default null,
  p_email text default null,
  p_city text default null,
  p_district text default null,
  p_address text default null,
  p_tax_office text default null,
  p_tax_number text default null,
  p_buyer_type public.buyer_business_type default null,
  p_public_name text default null,
  p_bio text default null,
  p_region text default null,
  p_vehicle_type text default null,
  p_capacity_kg numeric default null,
  p_service_regions text[] default '{}'::text[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_role public.profile_role;
  v_kind public.business_kind;
  v_business_id uuid;
  v_service_regions text[];
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select p.role into v_role
  from public.profiles as p
  where p.id = v_user_id;

  if v_role is null or v_role not in (
    'producer'::public.profile_role,
    'buyer'::public.profile_role,
    'carrier'::public.profile_role
  ) then
    raise exception 'This role cannot complete public business onboarding' using errcode = '42501';
  end if;

  if nullif(btrim(p_legal_name), '') is null
    or char_length(btrim(p_legal_name)) > 200
    or nullif(btrim(p_display_name), '') is null
    or char_length(btrim(p_display_name)) > 160
    or nullif(btrim(p_city), '') is null
    or char_length(btrim(p_city)) > 120 then
    raise exception 'Valid legal name, display name, and city are required' using errcode = '22023';
  end if;

  if char_length(coalesce(p_phone, '')) > 40
    or char_length(coalesce(p_email, '')) > 254
    or char_length(coalesce(p_district, '')) > 120
    or char_length(coalesce(p_address, '')) > 500
    or char_length(coalesce(p_tax_office, '')) > 160
    or char_length(coalesce(p_tax_number, '')) > 80
    or char_length(coalesce(p_public_name, '')) > 160
    or char_length(coalesce(p_bio, '')) > 1200
    or char_length(coalesce(p_region, '')) > 160
    or char_length(coalesce(p_vehicle_type, '')) > 120 then
    raise exception 'One or more business profile fields exceed their permitted length' using errcode = '22023';
  end if;

  if v_role = 'buyer'::public.profile_role and p_buyer_type is null then
    raise exception 'Buyer business type is required' using errcode = '22023';
  end if;
  if v_role <> 'buyer'::public.profile_role and p_buyer_type is not null then
    raise exception 'Buyer business type is only valid for buyer accounts' using errcode = '22023';
  end if;

  if v_role = 'producer'::public.profile_role
    and nullif(btrim(p_public_name), '') is null then
    raise exception 'Producer public name is required' using errcode = '22023';
  end if;

  if v_role = 'carrier'::public.profile_role then
    if nullif(btrim(p_vehicle_type), '') is null
      or p_capacity_kg is null
      or p_capacity_kg <= 0 then
      raise exception 'Carrier vehicle type and positive capacity are required' using errcode = '22023';
    end if;

    select coalesce(array_agg(distinct btrim(region) order by btrim(region)), '{}'::text[])
    into v_service_regions
    from unnest(coalesce(p_service_regions, '{}'::text[])) as supplied(region)
    where nullif(btrim(region), '') is not null;

    if coalesce(array_length(v_service_regions, 1), 0) = 0 then
      raise exception 'At least one carrier service region is required' using errcode = '22023';
    end if;
  end if;

  v_kind := v_role::text::public.business_kind;

  insert into public.businesses (
    owner_id, kind, legal_name, display_name, buyer_type, phone, email,
    country_code, city, district, address, tax_office, tax_number
  ) values (
    v_user_id, v_kind, btrim(p_legal_name), btrim(p_display_name), p_buyer_type,
    nullif(btrim(coalesce(p_phone, '')), ''),
    nullif(lower(btrim(coalesce(p_email, ''))), ''),
    'TR', nullif(btrim(p_city), ''), nullif(btrim(coalesce(p_district, '')), ''),
    nullif(btrim(coalesce(p_address, '')), ''),
    nullif(btrim(coalesce(p_tax_office, '')), ''),
    nullif(btrim(coalesce(p_tax_number, '')), '')
  )
  on conflict (owner_id, kind) do update set
    legal_name = excluded.legal_name,
    display_name = excluded.display_name,
    buyer_type = excluded.buyer_type,
    phone = excluded.phone,
    email = excluded.email,
    city = excluded.city,
    district = excluded.district,
    address = excluded.address,
    tax_office = excluded.tax_office,
    tax_number = excluded.tax_number,
    updated_at = now()
  returning id into v_business_id;

  update public.profiles
  set phone = nullif(btrim(coalesce(p_phone, '')), ''), updated_at = now()
  where id = v_user_id;

  if v_role = 'producer'::public.profile_role then
    insert into public.producers (
      user_id, business_id, public_name, bio, region, city
    ) values (
      v_user_id, v_business_id, btrim(p_public_name),
      nullif(btrim(coalesce(p_bio, '')), ''),
      nullif(btrim(coalesce(p_region, '')), ''), btrim(p_city)
    )
    on conflict (user_id) do update set
      business_id = excluded.business_id,
      public_name = excluded.public_name,
      bio = excluded.bio,
      region = excluded.region,
      city = excluded.city,
      updated_at = now();
  elsif v_role = 'buyer'::public.profile_role then
    insert into public.buyers (user_id, business_id)
    values (v_user_id, v_business_id)
    on conflict (user_id) do update set
      business_id = excluded.business_id,
      updated_at = now();
  else
    insert into public.carriers (
      user_id, business_id, vehicle_type, capacity_kg, service_regions
    ) values (
      v_user_id, v_business_id, btrim(p_vehicle_type), p_capacity_kg, v_service_regions
    )
    on conflict (user_id) do update set
      business_id = excluded.business_id,
      vehicle_type = excluded.vehicle_type,
      capacity_kg = excluded.capacity_kg,
      service_regions = excluded.service_regions,
      updated_at = now();
  end if;

  return v_business_id;
end;
$function$;

revoke all on function public.complete_business_profile(
  text, text, text, text, text, text, text, text, text,
  public.buyer_business_type, text, text, text, text, numeric, text[]
) from public, anon;
grant execute on function public.complete_business_profile(
  text, text, text, text, text, text, text, text, text,
  public.buyer_business_type, text, text, text, text, numeric, text[]
) to authenticated;

comment on function public.complete_business_profile(
  text, text, text, text, text, text, text, text, text,
  public.buyer_business_type, text, text, text, text, numeric, text[]
) is 'Atomically creates or updates the signed-in user business and matching producer, buyer, or carrier profile; derives role from profiles.';
