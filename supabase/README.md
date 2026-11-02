# Supabase — Tarladan Sofraya

Project ref: `dmfcruizfwiuneilckji`
Region: `eu-central-1`
Project URL: `https://dmfcruizfwiuneilckji.supabase.co`

The initial migrations create the identity and catalog foundation: profiles, businesses, producer/buyer/carrier role records, categories, products, inventory and harvest dates. All exposed tables have RLS. Public catalogue reads require an active product and an approved, public producer; private business records are role- and owner-scoped. The signup trigger accepts only producer/carrier choices from user metadata; every other value falls back to buyer, so user metadata cannot grant admin. Producer verification/publication flags are not writable by producer sessions.

Apply migrations using the Supabase MCP migration operation and commit the matching SQL files. The app uses `@supabase/ssr` clients. `lib/supabase/config.ts` contains this project's public URL and publishable key as defaults so managed Preview and build environments work without uncommitted local files. They are public by design; Supabase RLS protects private data. Environment values can override these defaults. Never put a Supabase secret/service-role key in a `NEXT_PUBLIC_*` variable or browser bundle.

Local development may use a root `.env.local` (ignored by Git); `.env.example` documents optional overrides only. Vercel is not connected yet, so production environment configuration can override the public defaults when that account is authorized. The first migrations deliberately do not add order, payment, subscription, delivery or audit tables; those workflows need their own reviewed migrations and policies.
