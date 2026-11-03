import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireProducer(nextPath: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (typeof userId !== "string") {
    redirect(`/giris?next=${encodeURIComponent(nextPath)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) redirect("/kayit/profil");
  if (profile.role !== "producer") redirect("/hesabim");

  const { data: producer } = await supabase
    .from("producers")
    .select("user_id,public_name,region,city,verification_status,is_public")
    .eq("user_id", userId)
    .maybeSingle();

  if (!producer) redirect("/kayit/profil");
  return { supabase, userId, producer };
}
