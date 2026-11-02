// These are public Supabase project values (URL + publishable/anon key), not secrets.
// Supabase RLS protects private data; never put a service-role or secret API key here.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://dmfcruizfwiuneilckji.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_MzjdZfELMEInkWL6w8IZ3g_2-ZuFEM1";
