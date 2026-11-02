"use client";

import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const navigation = [
  { label: "Ürünleri keşfet", href: "#pazar-yeri" },
  { label: "Nasıl çalışır?", href: "#nasil-calisir" },
  { label: "Nakliye", href: "#nakliye" },
  { label: "Güven", href: "#guven" },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <a className="brand" href="#top" aria-label="Tarladan Sofraya ana sayfa">
          <img src="/logo.svg" width="228" height="52" alt="Tarladan Sofraya" />
        </a>

        <nav
          className={`primary-nav${isMenuOpen ? " is-open" : ""}`}
          id="primary-navigation"
          aria-label="Ana menü"
        >
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <a className="mobile-nav-cta" href="/kayit" onClick={() => setIsMenuOpen(false)}>
            Üye ol <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </nav>

        <div className="header-actions">
          <a className="header-login" href="/giris">Giriş yap</a>
          <a className="header-cta" href="/kayit">
            Üye ol <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
        <button
          className="menu-toggle"
          type="button"
          aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}
