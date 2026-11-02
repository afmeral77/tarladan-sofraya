-- The profile-completion RPC is intentionally available to authenticated users,
-- but must run as the caller and obey existing table grants and row-level policies.
alter function public.complete_business_profile(
  text, text, text, text, text, text, text, text, text,
  public.buyer_business_type, text, text, text, text, numeric, text[]
) security invoker;
