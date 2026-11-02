"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function signOut() {
    setPending(true);
    setError(false);
    try {
      const { error: signOutError } = await createClient().auth.signOut();
      if (signOutError) {
        setError(true);
        return;
      }

      router.replace("/giris");
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="account-signout">
      <button className="secondary-action" type="button" onClick={signOut} disabled={pending}>
        <LogOut size={16} aria-hidden="true" />{pending ? "Çıkış yapılıyor…" : "Güvenli çıkış"}
      </button>
      {error && <p role="alert">Çıkış tamamlanamadı. Tekrar deneyin.</p>}
    </div>
  );
}
