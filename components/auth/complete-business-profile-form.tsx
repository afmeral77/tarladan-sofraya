"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2 } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";

type Role = "producer" | "buyer" | "carrier";
type BuyerType = Database["public"]["Enums"]["buyer_business_type"];

const buyerTypes: { value: BuyerType; label: string }[] = [
  { value: "manav", label: "Manav" },
  { value: "market", label: "Market" },
  { value: "restoran", label: "Restoran" },
  { value: "lokanta", label: "Lokanta" },
  { value: "diger", label: "Diğer profesyonel alıcı" },
];

export function CompleteBusinessProfileForm({
  role,
  initialName,
  email,
  initialPhone,
}: {
  role: Role;
  initialName: string;
  email: string;
  initialPhone: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const form = new FormData(event.currentTarget);
    const get = (name: string) => String(form.get(name) ?? "").trim();
    const serviceRegions = get("serviceRegions").split(",").map((region) => region.trim()).filter(Boolean);
    const capacityRaw = get("capacityKg");
    const capacityKg = capacityRaw ? Number(capacityRaw) : undefined;

    if (role === "producer" && !get("publicName")) {
      setFeedback("Üretici profiliniz için görüntülenecek adı belirtin.");
      return;
    }
    if (role === "buyer" && !get("buyerType")) {
      setFeedback("Lütfen işletmenizin türünü seçin.");
      return;
    }
    if (role === "carrier" && (!get("vehicleType") || !capacityKg || capacityKg <= 0 || serviceRegions.length === 0)) {
      setFeedback("Nakliyeci kaydı için araç türü, pozitif kapasite ve en az bir hizmet bölgesi gerekir.");
      return;
    }

    const args: Database["public"]["Functions"]["complete_business_profile"]["Args"] = {
      p_legal_name: get("legalName"),
      p_display_name: get("displayName"),
      p_phone: get("phone"),
      p_email: get("businessEmail"),
      p_city: get("city"),
      p_district: get("district"),
      p_address: get("address"),
      p_tax_office: get("taxOffice"),
      p_tax_number: get("taxNumber"),
    };

    if (role === "producer") {
      args.p_public_name = get("publicName");
      args.p_bio = get("bio");
      args.p_region = get("region");
    } else if (role === "buyer") {
      args.p_buyer_type = get("buyerType") as BuyerType;
    } else {
      args.p_vehicle_type = get("vehicleType");
      args.p_capacity_kg = capacityKg;
      args.p_service_regions = serviceRegions;
    }

    setPending(true);
    try {
      const { error } = await createClient().rpc("complete_business_profile", args);
      if (error) {
        setFeedback("İşletme profili kaydedilemedi. Zorunlu alanları kontrol edip tekrar deneyin.");
        return;
      }

      router.replace("/hesabim");
      router.refresh();
    } catch {
      setFeedback("İşletme profili kaydedilemedi. Bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  const roleLabel = role === "producer" ? "Üretici" : role === "buyer" ? "Alıcı / esnaf" : "Nakliyeci";

  return (
    <form className="auth-form profile-form" onSubmit={handleSubmit}>
      <div className="auth-inline-note"><Building2 size={18} aria-hidden="true" /><p>Bu bilgiler hesabınızın işletme profiline bağlanır. Vergi alanları isteğe bağlıdır; e-posta onayı ve iletişim amacıyla kullanılır.</p></div>
      <div className="profile-form-heading"><span>{roleLabel} işletme profili</span><small>* Zorunlu alan</small></div>
      <div className="auth-field-pair">
        <label className="auth-field"><span>Yasal işletme adı *</span><input name="legalName" type="text" autoComplete="organization" minLength={2} maxLength={200} required placeholder="Ticari/yasal unvan" /></label>
        <label className="auth-field"><span>Görünen işletme adı *</span><input name="displayName" type="text" maxLength={160} required placeholder="Müşterilerin göreceği ad" /></label>
      </div>
      <div className="auth-field-pair">
        <label className="auth-field"><span>Telefon *</span><input name="phone" type="tel" autoComplete="tel" maxLength={40} required defaultValue={initialPhone} placeholder="05xx xxx xx xx" /></label>
        <label className="auth-field"><span>İş e-postası</span><input name="businessEmail" type="email" autoComplete="email" maxLength={254} defaultValue={email} placeholder="ornek@isletme.com" /></label>
      </div>
      <div className="auth-field-pair">
        <label className="auth-field"><span>İl *</span><input name="city" type="text" autoComplete="address-level1" maxLength={120} required placeholder="Örn. İzmir" /></label>
        <label className="auth-field"><span>İlçe</span><input name="district" type="text" autoComplete="address-level2" maxLength={120} placeholder="Örn. Seferihisar" /></label>
      </div>
      <label className="auth-field"><span>İşletme adresi</span><input name="address" type="text" autoComplete="street-address" maxLength={500} placeholder="Mahalle, cadde ve açık adres" /></label>

      {role === "producer" && (
        <div className="role-detail-block">
          <span className="role-detail-title">Üretici bilgileri</span>
          <div className="auth-field-pair">
            <label className="auth-field"><span>Üretici olarak görünecek ad *</span><input name="publicName" type="text" maxLength={160} required placeholder="Üretici / çiftlik adı" defaultValue={initialName} /></label>
            <label className="auth-field"><span>Üretim bölgesi</span><input name="region" type="text" maxLength={160} placeholder="Örn. Ege, Seferihisar" /></label>
          </div>
          <label className="auth-field"><span>Kısa üretici tanıtımı</span><textarea name="bio" rows={3} maxLength={1200} placeholder="Üretim biçiminiz ve ürünleriniz hakkında kısa bilgi" /></label>
        </div>
      )}

      {role === "buyer" && (
        <div className="role-detail-block">
          <span className="role-detail-title">Alıcı işletme bilgileri</span>
          <label className="auth-field"><span>İşletme türü *</span>
            <select name="buyerType" defaultValue="" required>
              <option value="" disabled>Bir tür seçin</option>
              {buyerTypes.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
            </select>
          </label>
        </div>
      )}

      {role === "carrier" && (
        <div className="role-detail-block">
          <span className="role-detail-title">Nakliye bilgileri</span>
          <div className="auth-field-pair">
            <label className="auth-field"><span>Araç türü *</span><input name="vehicleType" type="text" maxLength={120} required placeholder="Kamyon, kamyonet, frigolu…" /></label>
            <label className="auth-field"><span>Taşıma kapasitesi (kg) *</span><input name="capacityKg" type="number" min="1" step="0.1" inputMode="decimal" required placeholder="Örn. 3500" /></label>
          </div>
          <label className="auth-field"><span>Hizmet bölgeleri * <small>(virgülle ayırın)</small></span><input name="serviceRegions" type="text" maxLength={600} required placeholder="İzmir, Aydın, Manisa" /></label>
        </div>
      )}

      <div className="role-detail-block optional-fields">
        <span className="role-detail-title">İsteğe bağlı vergi bilgileri</span>
        <div className="auth-field-pair">
          <label className="auth-field"><span>Vergi dairesi</span><input name="taxOffice" type="text" maxLength={160} placeholder="Vergi dairesi adı" /></label>
          <label className="auth-field"><span>Vergi numarası</span><input name="taxNumber" type="text" maxLength={80} inputMode="numeric" placeholder="İsteğe bağlı" /></label>
        </div>
      </div>

      <p className="auth-form-hint">Yetki, kayıt sırasında seçtiğiniz rol ve doğrulanmış Supabase oturumunuzla denetlenir. Üretici onayı ayrı bir yönetim sürecidir.</p>
      {feedback && <p className="auth-feedback error" role="alert">{feedback}</p>}
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "Profil kaydediliyor…" : "İşletme profilini tamamla"}
        {!pending && <ArrowRight size={16} aria-hidden="true" />}
      </button>
      <p className="auth-switch"><Link href="/">Ana sayfaya dön</Link></p>
    </form>
  );
}
