import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordResetRequestForm } from "@/components/auth/password-reset-request-form";

export const metadata: Metadata = {
  title: "Parolamı unuttum | Tarladan Sofraya",
  description: "Tarladan Sofraya hesabınız için parola yenileme bağlantısı isteyin.",
  robots: { index: false, follow: false },
};

export default function PasswordResetRequestPage() {
  return (
    <AuthShell
      eyebrow="Hesap erişimi"
      title="Yeni bir başlangıç yapın."
      description="Hesabınızla ilişkili e-posta adresine tek kullanımlık parola yenileme bağlantısı gönderelim."
    >
      <PasswordResetRequestForm />
    </AuthShell>
  );
}
