-- Phase 4: live catalog, producer inventory and product photos.
-- Additive only: no existing products, accounts or storage objects are deleted.

alter table public.products
  add column if not exists image_path text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_image_path_owner_folder_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_image_path_owner_folder_check
      check (
        image_path is null
        or image_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[A-Za-z0-9][A-Za-z0-9._-]{0,158}\.(jpg|jpeg|png|webp)$'
      );
  end if;
end
$$;

create index if not exists products_active_recent_idx
  on public.products (created_at desc)
  where status = 'active';

create index if not exists products_status_price_idx
  on public.products (price_per_unit)
  where status = 'active';

create index if not exists products_status_quality_idx
  on public.products (quality_grade)
  where status = 'active' and quality_grade is not null;

create index if not exists products_origin_region_idx
  on public.products (origin_region);

create index if not exists inventory_available_quantity_idx
  on public.inventory (available_quantity);

-- This named bucket is new to the project. Do not silently change an existing
-- bucket with a different access or upload policy.
do $$
begin
  if exists (select 1 from storage.buckets where id = 'product-images') then
    if not exists (
      select 1
      from storage.buckets
      where id = 'product-images'
        and public = true
        and file_size_limit = 5242880
        and allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
    ) then
      raise exception 'The product-images bucket exists with settings that do not match this migration.';
    end if;
  else
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'product-images',
      'product-images',
      true,
      5242880,
      array['image/jpeg', 'image/png', 'image/webp']::text[]
    );
  end if;
end
$$;

create policy "tfs_product_images_insert_own_prefix"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "tfs_product_images_update_own_prefix"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "tfs_product_images_delete_own_prefix"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create or replace function public.save_producer_product(
  p_product_id uuid,
  p_category_id uuid,
  p_name text,
  p_description text,
  p_quality_grade text,
  p_price_per_unit numeric,
  p_unit public.product_unit,
  p_minimum_order_qty numeric,
  p_origin_city text,
  p_origin_region text,
  p_status public.catalog_product_status,
  p_image_path text,
  p_available_quantity numeric,
  p_estimated_quantity numeric,
  p_harvest_date date,
  p_harvest_quantity numeric,
  p_harvest_notes text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_product_id uuid;
  v_slug_base text;
  v_slug text;
  v_verification public.producer_verification_status;
  v_is_public boolean;
  v_harvest_id uuid;
begin
  if v_user_id is null or not (select private.is_profile_role('producer'::public.profile_role)) then
    raise exception using errcode = '42501', message = 'A producer account is required.';
  end if;

  select verification_status, is_public
    into v_verification, v_is_public
    from public.producers
    where user_id = v_user_id;

  if not found then
    raise exception using errcode = '42501', message = 'Complete the producer profile before managing products.';
  end if;

  if p_status = 'active' and (v_verification <> 'approved' or not v_is_public) then
    raise exception using errcode = '42501', message = 'Only an approved public producer can publish a product.';
  end if;

  if p_name is null or char_length(btrim(p_name)) < 2 or char_length(btrim(p_name)) > 100 then
    raise exception using errcode = '22023', message = 'Product name must contain 2 to 100 characters.';
  end if;
  if p_description is not null and char_length(p_description) > 2000 then
    raise exception using errcode = '22023', message = 'Product description is too long.';
  end if;
  if p_quality_grade is not null and char_length(btrim(p_quality_grade)) > 80 then
    raise exception using errcode = '22023', message = 'Product quality grade is too long.';
  end if;
  if p_price_per_unit is null or p_price_per_unit < 0 or p_minimum_order_qty is null or p_minimum_order_qty <= 0 then
    raise exception using errcode = '22023', message = 'Price must be non-negative and minimum order quantity must be positive.';
  end if;
  if p_available_quantity is null or p_available_quantity < 0
    or (p_estimated_quantity is not null and p_estimated_quantity < 0)
    or (p_harvest_quantity is not null and p_harvest_quantity < 0) then
    raise exception using errcode = '22023', message = 'Inventory and harvest quantities cannot be negative.';
  end if;
  if char_length(coalesce(p_origin_city, '')) > 100 or char_length(coalesce(p_origin_region, '')) > 100
    or char_length(coalesce(p_harvest_notes, '')) > 1000 then
    raise exception using errcode = '22023', message = 'Region or harvest notes are too long.';
  end if;
  if not exists (
    select 1 from public.product_categories
    where id = p_category_id and is_active
  ) then
    raise exception using errcode = '22023', message = 'Choose an active product category.';
  end if;
  if p_image_path is not null
    and split_part(p_image_path, '/', 1) <> v_user_id::text then
    raise exception using errcode = '42501', message = 'Product photo must belong to the signed-in producer.';
  end if;

  if p_product_id is null then
    v_product_id := gen_random_uuid();
  else
    select id into v_product_id
      from public.products
      where id = p_product_id and producer_user_id = v_user_id;
    if not found then
      raise exception using errcode = '42501', message = 'Product not found for this producer.';
    end if;
  end if;

  v_slug_base := lower(regexp_replace(
    translate(btrim(p_name), 'ÇĞİÖŞÜçğıöşü', 'CGIOSUcgiosu'),
    '[^a-z0-9]+', '-', 'g'
  ));
  v_slug_base := trim(both '-' from v_slug_base);
  if v_slug_base = '' then
    v_slug_base := 'urun';
  end if;
  v_slug := left(v_slug_base, 145) || '-' || left(replace(v_product_id::text, '-', ''), 8);

  if p_product_id is null then
    insert into public.products (
      id, producer_user_id, category_id, name, slug, description, quality_grade,
      price_per_unit, currency_code, unit, minimum_order_qty, origin_city,
      origin_region, status, image_path
    ) values (
      v_product_id, v_user_id, p_category_id, btrim(p_name), v_slug,
      nullif(btrim(p_description), ''), nullif(btrim(p_quality_grade), ''),
      p_price_per_unit, 'TRY', p_unit, p_minimum_order_qty,
      nullif(btrim(p_origin_city), ''), nullif(btrim(p_origin_region), ''),
      p_status, p_image_path
    );
  else
    update public.products
      set category_id = p_category_id,
          name = btrim(p_name),
          slug = v_slug,
          description = nullif(btrim(p_description), ''),
          quality_grade = nullif(btrim(p_quality_grade), ''),
          price_per_unit = p_price_per_unit,
          unit = p_unit,
          minimum_order_qty = p_minimum_order_qty,
          origin_city = nullif(btrim(p_origin_city), ''),
          origin_region = nullif(btrim(p_origin_region), ''),
          status = p_status,
          image_path = p_image_path,
          updated_at = now()
      where id = v_product_id and producer_user_id = v_user_id;
  end if;

  insert into public.inventory (product_id, available_quantity, estimated_quantity, updated_at)
  values (v_product_id, p_available_quantity, p_estimated_quantity, now())
  on conflict (product_id) do update
    set available_quantity = excluded.available_quantity,
        estimated_quantity = excluded.estimated_quantity,
        updated_at = excluded.updated_at;

  select id into v_harvest_id
    from public.harvests
    where product_id = v_product_id
    order by created_at desc, id desc
    limit 1
    for update;

  if p_harvest_date is not null or p_harvest_quantity is not null or nullif(btrim(p_harvest_notes), '') is not null then
    if v_harvest_id is null then
      insert into public.harvests (product_id, harvest_date, estimated_quantity, unit, notes)
      values (
        v_product_id, p_harvest_date, p_harvest_quantity, p_unit,
        nullif(btrim(p_harvest_notes), '')
      );
    else
      update public.harvests
        set harvest_date = p_harvest_date,
            estimated_quantity = p_harvest_quantity,
            unit = p_unit,
            notes = nullif(btrim(p_harvest_notes), ''),
            updated_at = now()
        where id = v_harvest_id and product_id = v_product_id;
    end if;
  elsif v_harvest_id is not null then
    delete from public.harvests
      where product_id = v_product_id and id = v_harvest_id;
  end if;

  return v_product_id;
end;
$$;

revoke all on function public.save_producer_product(
  uuid, uuid, text, text, text, numeric, public.product_unit, numeric,
  text, text, public.catalog_product_status, text, numeric, numeric, date, numeric, text
) from public, anon;

grant execute on function public.save_producer_product(
  uuid, uuid, text, text, text, numeric, public.product_unit, numeric,
  text, text, public.catalog_product_status, text, numeric, numeric, date, numeric, text
) to authenticated;
