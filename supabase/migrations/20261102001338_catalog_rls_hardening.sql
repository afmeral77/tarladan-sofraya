-- Tighten role-specific profile writes and keep verification authority server-side.

create or replace function private.is_profile_role(target_role public.profile_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = target_role
  );
$$;

create or replace function private.owns_business(
  target_business_id uuid,
  target_kind public.business_kind
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = target_business_id
      and b.owner_id = (select auth.uid())
      and b.kind = target_kind
  );
$$;

revoke all on function private.is_profile_role(public.profile_role) from public, anon;
revoke all on function private.owns_business(uuid, public.business_kind) from public, anon;
grant execute on function private.is_profile_role(public.profile_role) to authenticated;
grant execute on function private.owns_business(uuid, public.business_kind) to authenticated;

create index producers_business_id_idx on public.producers (business_id);
create index buyers_business_id_idx on public.buyers (business_id);
create index carriers_business_id_idx on public.carriers (business_id);

-- The public producer profile must never grant users write access to its moderation fields.
revoke select, insert, update, delete on public.producers from anon, authenticated;
grant select (user_id, public_name, bio, region, city, verification_status, is_public)
  on public.producers to anon, authenticated;
grant insert (user_id, business_id, public_name, bio, region, city)
  on public.producers to authenticated;
grant update (business_id, public_name, bio, region, city, updated_at)
  on public.producers to authenticated;

-- A business profile may only have the kind matching its owner's immutable app role.
drop policy "Businesses: owner manages own, admins read all" on public.businesses;
create policy "Businesses: owner manages matching role business, admins manage all"
on public.businesses for all to authenticated
using (
  (owner_id = (select auth.uid()) and (select private.is_profile_role(kind::text::public.profile_role)))
  or (select private.is_admin())
)
with check (
  (owner_id = (select auth.uid()) and (select private.is_profile_role(kind::text::public.profile_role)))
  or (select private.is_admin())
);

drop policy "Producers: producer manages own profile" on public.producers;
create policy "Producers: producer creates own profile with own business"
on public.producers for insert to authenticated
with check (
  (select private.is_producer_owner(user_id))
  and (business_id is null or (select private.owns_business(business_id, 'producer'::public.business_kind)))
);

drop policy "Producers: producer updates own profile" on public.producers;
create policy "Producers: producer updates own public details"
on public.producers for update to authenticated
using ((select private.is_producer_owner(user_id)) or (select private.is_admin()))
with check (
  ((select private.is_producer_owner(user_id))
    and (business_id is null or (select private.owns_business(business_id, 'producer'::public.business_kind))))
  or (select private.is_admin())
);

drop policy "Buyers: owner manages own, admins read all" on public.buyers;
create policy "Buyers: owner manages own role and owned business, admins manage all"
on public.buyers for all to authenticated
using (
  (user_id = (select auth.uid()) and (select private.is_profile_role('buyer'::public.profile_role)))
  or (select private.is_admin())
)
with check (
  ((user_id = (select auth.uid()))
    and (select private.is_profile_role('buyer'::public.profile_role))
    and (select private.owns_business(business_id, 'buyer'::public.business_kind)))
  or (select private.is_admin())
);

drop policy "Carriers: owner manages own, admins read all" on public.carriers;
create policy "Carriers: owner manages own role and owned business, admins manage all"
on public.carriers for all to authenticated
using (
  (user_id = (select auth.uid()) and (select private.is_profile_role('carrier'::public.profile_role)))
  or (select private.is_admin())
)
with check (
  ((user_id = (select auth.uid()))
    and (select private.is_profile_role('carrier'::public.profile_role))
    and (select private.owns_business(business_id, 'carrier'::public.business_kind)))
  or (select private.is_admin())
);

-- Keep public stock/date reads in SELECT policy; avoid a second permissive SELECT via FOR ALL.
drop policy "Inventory: producer manages stock for own products" on public.inventory;
create policy "Inventory: producer inserts stock for own products"
on public.inventory for insert to authenticated
with check (
  exists (select 1 from public.products pr where pr.id = product_id
    and (select private.is_producer_owner(pr.producer_user_id)))
  or (select private.is_admin())
);
create policy "Inventory: producer updates stock for own products"
on public.inventory for update to authenticated
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
create policy "Inventory: producer deletes stock for own products"
on public.inventory for delete to authenticated
using (
  exists (select 1 from public.products pr where pr.id = product_id
    and (select private.is_producer_owner(pr.producer_user_id)))
  or (select private.is_admin())
);

drop policy "Harvests: producer manages dates for own products" on public.harvests;
create policy "Harvests: producer inserts dates for own products"
on public.harvests for insert to authenticated
with check (
  exists (select 1 from public.products pr where pr.id = product_id
    and (select private.is_producer_owner(pr.producer_user_id)))
  or (select private.is_admin())
);
create policy "Harvests: producer updates dates for own products"
on public.harvests for update to authenticated
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
create policy "Harvests: producer deletes dates for own products"
on public.harvests for delete to authenticated
using (
  exists (select 1 from public.products pr where pr.id = product_id
    and (select private.is_producer_owner(pr.producer_user_id)))
  or (select private.is_admin())
);
