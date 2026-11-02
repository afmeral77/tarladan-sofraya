"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sprout, Store, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authCallbackUrl } from "@/lib/auth/redirects";

type SignupRole = "producer" | "buyer" | "carrier";

const roleOptions: {
  id: SignupRole;
  title: string;
  summary: string;
  icon: typeof Sprout;
}[] = [
  { id: "producer", title: "Üretici", summary: "Ürünlerinizi sunun", icon: Sprout },
  { id: "buyer", title: "Alıcı / esnaf", summary: "İşletmenize tedarik", icon: Store },
  { id: "carrier", title: "Nakliyeci", summary: "Taşıma ağınıza katılın", icon: Truck },
];

export function SignupForm({ initialRole }: { initialRole: SignupRole }) {
  const router = useRouter();
  const [role, setRole] = useState<SignupRole>(initialRole);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "error" | "success"; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmPassword") ?? "");

    if (fullName.length < 2) {
      setFeedback({ kind: "error", message: "Lütfen adınızı ve soyadınızı yazın." });
      return;
    }
    if (password.length < 12) {
      setFeedback({ kind: "error", message: "Güvenliğiniz için parolanız en az 12 karakter olmalı." });
      return;
    }
    if (password !== confirmation) {
      setFeedback({ kind: "error", message: "Girdiğiniz parolalar eşleşmiyor." });
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: authCallbackUrl(window.location.origin, "/kayit/profil"),
          data: { full_name: fullName, role },
        },
      });
      if (error) {
        const redirectIssue = /redirect|url.*allow|not allowed/i.test(error.message);
        setFeedback({
          kind: "error",
          message: redirectIssue
            ? "E-posta bağlantısı için bu site adresi Supabase Auth yönlendirme izin listesine eklenmeli."
            : "Kayıt başlatılamadı. Bilgilerinizi kontrol edip kısa süre sonra tekrar deneyin.",
        });
        return;
      }

      if (data.session) {
        router.replace("/kayit/profil");
        router.refresh();
        return;
      }

      setFeedback({
        kind: "success",
        message: "Kayıt adımınız alındı. E-posta adresinize gönderilen doğrulama bağlantısını açın; ardından işletme profilinizi tamamlayabilirsiniz.",
      });
    } catch {
      setFeedback({ kind: "error", message: "Kayıt sırasında bağlantı hatası oluştu. İnternet bağlantınızı kontrol edip tekrar deneyin." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <fieldset className="role-fieldset">
        <legend>Platformdaki rolünüz</legend>
        <div className="role-options">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            return (
              <label className={`role-option${role === option.id ? " is-selected" : ""}`} key={option.id}>
                <input
                  type="radio"
                  name="role"
                  value={option.id}
                  checked={role === option.id}
                  onChange={() => setRole(option.id)}
                />
                <span className="role-option-icon"><Icon size={17} strokeWidth={1.7} aria-hidden="true" /></span>
                <span className="role-option-copy"><strong>{option.title}</strong><small>{option.summary}</small></span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="auth-field">
        <span>Ad soyad / yetkili kişi</span>
        <input name="fullName" type="text" autoComplete="name" maxLength={120} minLength={2} required placeholder="Örn. Deniz Yılmaz" />
      </label>
      <label className="auth-field">
        <span>E-posta adresi</span>
        <input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="ornek@isletme.com" />
      </label>
      <div className="auth-field-pair">
        <label className="auth-field">
          <span>Parola</span>
          <input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required placeholder="En az 12 karakter" />
        </label>
        <label className="auth-field">
          <span>Parolayı doğrula</span>
          <input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required placeholder="Parolayı yeniden yazın" />
        </label>
      </div>

      <p className="auth-form-hint">Kayıt sonrasında e-posta adresinizi doğrulamanız istenir. Yönetici hesabı genel kayıt ekranından oluşturulamaz.</p>
      {feedback && <p className={`auth-feedback ${feedback.kind}`} role={feedback.kind === "error" ? "alert" : "status"}>{feedback.message}</p>}
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "Hesap oluşturuluyor…" : "Hesap oluştur"}
        {!pending && <ArrowRight size={16} aria-hidden="true" />}
      </button>
      <p className="auth-switch">Zaten hesabınız var mı? <Link href="/giris">Giriş yapın</Link></p>
    </form>
  );
}
