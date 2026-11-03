-- Public catalog search uses the same RLS policies as direct product reads.
-- It returns only product IDs and a page count; callers must fetch details
-- through the normal RLS-protected products query.
create or replace function public.search_catalog_products(
  p_query text default null,
  p_category_slug text default null,
  p_region text default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_min_quantity numeric default null,
  p_harvest_from date default null,
  p_harvest_to date default null,
  p_quality_grade text default null,
  p_sort text default 'newest',
  p_page integer default 1,
  p_page_size integer default 24
)
returns table (product_id uuid, total_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  with candidates as (
    select
      p.id,
      p.price_per_unit,
      p.created_at
    from public.products p
    join public.product_categories c on c.id = p.category_id
    join public.producers pr on pr.user_id = p.producer_user_id
    left join public.inventory i on i.product_id = p.id
    where p.status = 'active'
      and c.is_active
      and pr.is_public
      and pr.verification_status = 'approved'
      and (
        nullif(btrim(p_query), '') is null
        or p.name ilike ('%' || btrim(p_query) || '%')
        or coalesce(p.description, '') ilike ('%' || btrim(p_query) || '%')
        or coalesce(p.origin_city, '') ilike ('%' || btrim(p_query) || '%')
        or coalesce(p.origin_region, '') ilike ('%' || btrim(p_query) || '%')
        or c.name ilike ('%' || btrim(p_query) || '%')
        or pr.public_name ilike ('%' || btrim(p_query) || '%')
        or coalesce(pr.city, '') ilike ('%' || btrim(p_query) || '%')
        or coalesce(pr.region, '') ilike ('%' || btrim(p_query) || '%')
      )
      and (nullif(btrim(p_category_slug), '') is null or c.slug = btrim(p_category_slug))
      and (
        nullif(btrim(p_region), '') is null
        or coalesce(p.origin_city, '') ilike ('%' || btrim(p_region) || '%')
        or coalesce(p.origin_region, '') ilike ('%' || btrim(p_region) || '%')
        or coalesce(pr.city, '') ilike ('%' || btrim(p_region) || '%')
        or coalesce(pr.region, '') ilike ('%' || btrim(p_region) || '%')
      )
      and (p_min_price is null or p.price_per_unit >= p_min_price)
      and (p_max_price is null or p.price_per_unit <= p_max_price)
      and (p_min_quantity is null or coalesce(i.available_quantity, 0) >= p_min_quantity)
      and (nullif(btrim(p_quality_grade), '') is null or p.quality_grade = btrim(p_quality_grade))
      and (
        (p_harvest_from is null and p_harvest_to is null)
        or exists (
          select 1
          from public.harvests h
          where h.product_id = p.id
            and (p_harvest_from is null or h.harvest_date >= p_harvest_from)
            and (p_harvest_to is null or h.harvest_date <= p_harvest_to)
        )
      )
  ),
  page_rows as (
    select c.id, c.price_per_unit, c.created_at, count(*) over () as total_count
    from candidates c
    order by
      case when p_sort = 'price_asc' then c.price_per_unit end asc nulls last,
      case when p_sort = 'price_desc' then c.price_per_unit end desc nulls last,
      c.created_at desc,
      c.id
    limit greatest(1, least(coalesce(p_page_size, 24), 48))
    offset (greatest(1, least(coalesce(p_page, 1), 10000)) - 1)
      * greatest(1, least(coalesce(p_page_size, 24), 48))
  )
  select page_rows.id, page_rows.total_count
  from page_rows
  order by
    case when p_sort = 'price_asc' then page_rows.price_per_unit end asc nulls last,
    case when p_sort = 'price_desc' then page_rows.price_per_unit end desc nulls last,
    page_rows.created_at desc,
    page_rows.id;
$$;

revoke all on function public.search_catalog_products(
  text, text, text, numeric, numeric, numeric, date, date, text, text, integer, integer
) from public;

grant execute on function public.search_catalog_products(
  text, text, text, numeric, numeric, numeric, date, date, text, text, integer, integer
) to anon, authenticated;
