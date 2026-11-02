"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, MailCheck } from "lucide-react";
import { authCallbackUrl } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/client";

export function PasswordResetRequestForm() {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "error" | "success"; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    setPending(true);
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: authCallbackUrl(window.location.origin, "/sifre-yenile"),
      });

      if (error && /redirect|url.*allow|not allowed/i.test(error.message)) {
        setFeedback({ kind: "error", message: "Parola bağlantısı için bu site adresi Supabase Auth yönlendirme izin listesine eklenmeli." });
        return;
      }
      if (error) {
        setFeedback({ kind: "error", message: "Şu anda bağlantı gönderilemiyor. Biraz sonra tekrar deneyin." });
        return;
      }

      setFeedback({
        kind: "success",
        message: "Bu e-posta adresi için bir kullanıcı varsa, parola yenileme bağlantısı gönderildi. Gelen kutunuzu ve gereksiz klasörünü kontrol edin.",
      });
    } catch {
      setFeedback({ kind: "error", message: "Şu anda bağlantı gönderilemiyor. Biraz sonra tekrar deneyin." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-inline-note"><MailCheck size={18} aria-hidden="true" /><p>Hesabınızla ilişkili e-posta adresini yazın. Güvenlik için adresin sistemde kayıtlı olup olmadığını ayrıca belirtmeyiz.</p></div>
      <label className="auth-field">
        <span>E-posta adresi</span>
        <input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="ornek@isletme.com" />
      </label>
      {feedback && <p className={`auth-feedback ${feedback.kind}`} role={feedback.kind === "error" ? "alert" : "status"}>{feedback.message}</p>}
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "İstek gönderiliyor…" : "Parola bağlantısı gönder"}
        {!pending && <ArrowRight size={16} aria-hidden="true" />}
      </button>
      <p className="auth-switch"><Link href="/giris">Giriş ekranına dön</Link></p>
    </form>
  );
}
