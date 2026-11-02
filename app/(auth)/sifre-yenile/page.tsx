import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { NewPasswordForm } from "@/components/auth/new-password-form";

export const metadata: Metadata = {
  title: "Yeni parola belirle | Tarladan Sofraya",
  description: "Tarladan Sofraya hesabınız için yeni ve güçlü bir parola belirleyin.",
  robots: { index: false, follow: false },
};

export default function NewPasswordPage() {
  return (
    <AuthShell
      eyebrow="Güvenli hesap erişimi"
      title="Yeni parolanızı belirleyin."
      description="Parola yenileme bağlantınızın doğrulanmış oturumu içinde yeni parolanızı oluşturun."
    >
      <NewPasswordForm />
    </AuthShell>
  );
}
