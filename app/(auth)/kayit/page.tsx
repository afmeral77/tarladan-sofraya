import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { createClient } from "@/lib/supabase/server";

type SignupRole = "producer" | "buyer" | "carrier";
const signupRoles: SignupRole[] = ["producer", "buyer", "carrier"];

export const metadata: Metadata = {
  title: "Ücretsiz hesap oluştur | Tarladan Sofraya",
  description: "Üretici, profesyonel alıcı veya nakliyeci olarak Tarladan Sofraya ağına katılın.",
  robots: { index: false, follow: false },
};

type PageProps = { searchParams?: Promise<{ rol?: string }> };

export default async function SignupPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialRole = signupRoles.includes(params?.rol as SignupRole) ? params?.rol as SignupRole : "buyer";
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (typeof data?.claims?.sub === "string") redirect("/kayit/profil");

  return (
    <AuthShell
      eyebrow="Tedarik ağına katılın"
      title="Ticarete birlikte açılın."
      description="Rolünüzü seçin, e-posta adresinizi doğrulayın ve işletme profilinizi tamamlayın."
    >
      <SignupForm initialRole={initialRole} />
    </AuthShell>
  );
}
