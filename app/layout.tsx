import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tarladan Sofraya | Üreticiden Doğrudan Tedarik",
  description:
    "Türkiye'nin üreticileriyle manav, market ve restoranları buluşturan yeni nesil tedarik ağı. Ürünü kaynağından keşfedin, taşımayı şeffafça planlayın.",
  keywords: [
    "tarladan sofraya",
    "üreticiden tedarik",
    "tarım pazaryeri",
    "B2B tarım",
    "yerel üretici",
  ],
  applicationName: "Tarladan Sofraya",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: "Tarladan Sofraya",
    title: "Tarladan Sofraya | Üreticiden Doğrudan Tedarik",
    description:
      "Üreticilerle profesyonel alıcıları buluşturan, ürün ve nakliye bilgisini şeffaflaştıran tarım tedarik ağı.",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tarladan Sofraya | Üreticiden Doğrudan Tedarik",
    description:
      "Üreticilerle profesyonel alıcıları buluşturan yeni nesil tarım tedarik ağı.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f3ea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
