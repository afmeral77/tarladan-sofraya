import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Leaf, ShieldCheck } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="auth-page">
      <header className="auth-topbar">
        <div className="container auth-topbar-inner">
          <Link className="brand" href="/" aria-label="Tarladan Sofraya ana sayfa">
            <img src="/logo.svg" width="218" height="50" alt="Tarladan Sofraya" />
          </Link>
          <Link className="auth-home-link" href="/">
            Ana sayfaya dön <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="container auth-layout">
        <section className="auth-content" aria-labelledby="auth-title">
          <div className="auth-intro">
            <span className="eyebrow"><span className="eyebrow-dot" /> {eyebrow}</span>
            <h1 id="auth-title">{title}</h1>
            <p>{description}</p>
          </div>
          {children}
        </section>

        <aside className="auth-aside" aria-label="Tarladan Sofraya platform bilgisi">
          <div className="auth-aside-orbit auth-orbit-one" />
          <div className="auth-aside-orbit auth-orbit-two" />
          <div className="auth-aside-emblem"><Leaf size={24} strokeWidth={1.5} aria-hidden="true" /></div>
          <span className="auth-aside-kicker">ÜRETİMDEN TİCARETE</span>
          <h2>Güvenin yolu,<br /><em>kaynağında</em> başlar.</h2>
          <p>Üreticiler ve profesyonel alıcılar için daha doğrudan, daha şeffaf bir tedarik ağı.</p>
          <div className="auth-aside-proof">
            <ShieldCheck size={18} strokeWidth={1.6} aria-hidden="true" />
            <span>Rol ve işletme bilgileri güvenli biçimde yönetilir.</span>
          </div>
          <div className="auth-aside-index">TARLADAN SOFRAYA <span>—</span> 01</div>
        </aside>
      </div>

      <footer className="auth-footer container">
        <span>© {new Date().getFullYear()} Tarladan Sofraya</span>
        <a href="https://appfabrika.com/" target="_blank" rel="noreferrer noopener">
          Bir Appfabrika ürünü <ArrowUpRight size={12} aria-hidden="true" />
        </a>
      </footer>
    </main>
  );
}
