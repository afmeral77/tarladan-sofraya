"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function NewPasswordForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "error" | "success"; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmPassword") ?? "");

    if (password.length < 12) {
      setFeedback({ kind: "error", message: "Güvenliğiniz için yeni parolanız en az 12 karakter olmalı." });
      return;
    }
    if (password !== confirmation) {
      setFeedback({ kind: "error", message: "Girdiğiniz parolalar eşleşmiyor." });
      return;
    }

    setPending(true);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) {
        setFeedback({ kind: "error", message: "Geçerli bir parola yenileme oturumu bulunamadı. Yeni bir bağlantı isteyip e-postanızdan tekrar açın." });
        return;
      }

      setFeedback({ kind: "success", message: "Parolanız güncellendi. Yeni parolanızla giriş yapabilirsiniz." });
      window.setTimeout(() => {
        router.replace("/giris?durum=parola-guncellendi");
        router.refresh();
      }, 900);
    } catch {
      setFeedback({ kind: "error", message: "Parola güncellenemedi. Bağlantınızı kontrol edip tekrar deneyin." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-inline-note"><KeyRound size={18} aria-hidden="true" /><p>Bu sayfayı yalnız parola yenileme e-postasındaki bağlantıdan açtığınız geçerli oturumda kullanabilirsiniz.</p></div>
      <label className="auth-field">
        <span>Yeni parola</span>
        <input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required placeholder="En az 12 karakter" />
      </label>
      <label className="auth-field">
        <span>Yeni parolayı doğrula</span>
        <input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required placeholder="Parolayı yeniden yazın" />
      </label>
      {feedback && <p className={`auth-feedback ${feedback.kind}`} role={feedback.kind === "error" ? "alert" : "status"}>{feedback.message}</p>}
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "Parola güncelleniyor…" : "Parolayı güncelle"}
        {!pending && <ArrowRight size={16} aria-hidden="true" />}
      </button>
      <p className="auth-switch"><Link href="/sifre-sifirla">Yeni bir parola bağlantısı iste</Link></p>
    </form>
  );
}
