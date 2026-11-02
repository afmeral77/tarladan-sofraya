import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { safeInternalPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Giriş yap | Tarladan Sofraya",
  description: "Tarladan Sofraya hesabınıza güvenli biçimde giriş yapın.",
  robots: { index: false, follow: false },
};

type PageProps = { searchParams?: Promise<{ next?: string; authError?: string }> };

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = safeInternalPath(params?.next);
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (typeof data?.claims?.sub === "string") redirect(next);

  return (
    <AuthShell
      eyebrow="Hesabınıza erişin"
      title="Kaldığınız yerden devam edin."
      description="Üretici, işletme ve nakliye hesabınıza güvenli e-posta doğrulamasıyla erişin."
    >
      <LoginForm next={next} callbackError={params?.authError === "callback"} />
    </AuthShell>
  );
}
