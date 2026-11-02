import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { CompleteBusinessProfileForm } from "@/components/auth/complete-business-profile-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "İşletme profilinizi tamamlayın | Tarladan Sofraya",
  description: "Hesabınızın işletme ve rol bilgilerini güvenli biçimde tamamlayın.",
  robots: { index: false, follow: false },
};

export default async function CompleteProfilePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (typeof userId !== "string") redirect("/giris?next=%2Fkayit%2Fprofil");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,full_name,phone")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) redirect("/giris?next=%2Fkayit%2Fprofil");
  if (profile.role === "admin") redirect("/hesabim");

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userId)
    .eq("kind", profile.role)
    .maybeSingle();

  if (business) redirect("/hesabim");

  const { data: userData } = await supabase.auth.getUser();
  const role = profile.role;

  return (
    <AuthShell
      eyebrow="Bir sonraki adım"
      title="İşletmenizi tanıyalım."
      description="Bu bilgiler sizi doğru hesap türüne bağlar. Üretici onayı ve canlı ticaret yetkileri ayrı süreçlerdir."
    >
      <CompleteBusinessProfileForm
        role={role}
        initialName={profile.full_name}
        initialPhone={profile.phone ?? ""}
        email={userData.user?.email ?? ""}
      />
    </AuthShell>
  );
}
