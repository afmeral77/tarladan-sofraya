import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Building2, Sprout, Truck, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Hesabım | Tarladan Sofraya",
  description: "Tarladan Sofraya hesabınız ve işletme profiliniz.",
  robots: { index: false, follow: false },
};

const roleLabels = { producer: "Üretici", buyer: "Alıcı / esnaf", carrier: "Nakliyeci", admin: "Yönetici" } as const;

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (typeof userId !== "string") redirect("/giris?next=%2Fhesabim");

  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,full_name,phone")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) redirect("/giris?authError=callback");

  let businessName = "";
  if (profile.role !== "admin") {
    const { data: business } = await supabase
      .from("businesses")
      .select("display_name,kind,buyer_type")
      .eq("owner_id", userId)
      .eq("kind", profile.role)
      .maybeSingle();
    if (!business) redirect("/kayit/profil");
    businessName = business.display_name;
  }

  const RoleIcon = profile.role === "producer" ? Sprout : profile.role === "carrier" ? Truck : profile.role === "buyer" ? Building2 : BadgeCheck;

  return (
    <main className="account-page">
      <header className="auth-topbar">
        <div className="container auth-topbar-inner">
          <Link className="brand" href="/" aria-label="Tarladan Sofraya ana sayfa"><img src="/logo.svg" width="218" height="50" alt="Tarladan Sofraya" /></Link>
          <Link className="auth-home-link" href="/"><ArrowLeft size={14} aria-hidden="true" /> Ana sayfa</Link>
        </div>
      </header>
      <div className="container account-content">
        <section className="account-welcome">
          <span className="eyebrow"><span className="eyebrow-dot" /> HESAP MERKEZİ</span>
          <h1>Merhaba, {profile.full_name || ""}</h1>
          <p>Hesabınız ve işletme kimliğiniz doğrulanmış Supabase oturumu üzerinden görüntüleniyor.</p>
        </section>
        <section className="account-card" aria-label="Hesap ve işletme bilgileri">
          <div className="account-card-heading"><div className="account-role-icon"><RoleIcon size={22} aria-hidden="true" /></div><div><span>HESAP TÜRÜ</span><h2>{roleLabels[profile.role]}</h2></div></div>
          <dl className="account-details">
            <div><dt><Building2 size={15} aria-hidden="true" /> İşletme</dt><dd>{businessName || "Platform yöneticisi"}</dd></div>
            <div><dt><UserRound size={15} aria-hidden="true" /> Yetkili kişi</dt><dd>{profile.full_name || "Belirtilmedi"}</dd></div>
            <div><dt>E-posta</dt><dd>{userData.user?.email ?? "—"}</dd></div>
            <div><dt>Telefon</dt><dd>{profile.phone || "Henüz eklenmedi"}</dd></div>
          </dl>
          <div className="account-tool-links">
            {profile.role === "producer" && <Link href="/uretici/urunler">Ürün ve stoklarımı yönet <span aria-hidden="true">→</span></Link>}
            {profile.role === "buyer" && <Link href="/urunler">Canlı pazaryerini keşfet <span aria-hidden="true">→</span></Link>}
            {profile.role === "carrier" && <span>Nakliye teklif paneli sonraki ürün aşamasında açılacaktır.</span>}
          </div>
          <p className="account-stage-note">Üreticiler ürün, fiyat, stok ve hasat bilgilerini yönetebilir. Sipariş, sepet ve nakliye teklifleri henüz etkin değildir.</p>
          <div className="account-actions"><Link className="secondary-action" href="/"><ArrowLeft size={15} aria-hidden="true" /> Tanıtım sayfasına dön</Link><LogoutButton /></div>
        </section>
      </div>
      <footer className="auth-footer container"><span>© {new Date().getFullYear()} Tarladan Sofraya</span><a href="https://appfabrika.com/" target="_blank" rel="noreferrer noopener">Bir Appfabrika ürünü</a></footer>
    </main>
  );
}
