-- Keep buyer subtype required even if a client bypasses the onboarding form and writes a row directly.
alter table public.businesses
  drop constraint businesses_buyer_type_matches_kind;

alter table public.businesses
  add constraint businesses_buyer_type_matches_kind
  check (
    (kind = 'buyer'::public.business_kind and buyer_type is not null)
    or (kind <> 'buyer'::public.business_kind and buyer_type is null)
  );
