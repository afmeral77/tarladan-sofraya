"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { safeInternalPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next, callbackError }: { next: string; callbackError?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(
    callbackError ? "E-posta bağlantısı geçersiz veya süresi dolmuş olabilir. Yeniden kayıt olun ya da yeni bir bağlantı isteyin." : null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setFeedback(/not confirmed|email.*confirm/i.test(error.message)
          ? "Önce e-posta adresinizi doğrulayın. Gelen kutunuzu ve gereksiz klasörünü kontrol edin."
          : "E-posta adresi veya parola doğru değil. Bilgilerinizi kontrol edip tekrar deneyin.");
        return;
      }

      router.replace(safeInternalPath(next));
      router.refresh();
    } catch {
      setFeedback("Giriş sırasında bağlantı hatası oluştu. İnternet bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-field">
        <span>E-posta adresi</span>
        <input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="ornek@isletme.com" />
      </label>
      <label className="auth-field">
        <span>Parola</span>
        <input name="password" type="password" autoComplete="current-password" maxLength={128} required placeholder="Parolanız" />
      </label>
      <div className="auth-form-options"><span>Erişiminiz korunur.</span><Link href="/sifre-sifirla">Parolamı unuttum</Link></div>
      {feedback && <p className="auth-feedback error" role="alert">{feedback}</p>}
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "Oturum açılıyor…" : "Giriş yap"}
        {!pending && <ArrowRight size={16} aria-hidden="true" />}
      </button>
      <p className="auth-switch">Henüz hesabınız yok mu? <Link href={`/kayit?next=${encodeURIComponent(safeInternalPath(next))}`}>Kayıt olun</Link></p>
    </form>
  );
}
