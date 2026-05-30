import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SamaFacture — Factures pour entrepreneurs",
  description: "Créez et envoyez vos factures facilement depuis votre téléphone ou ordinateur.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full bg-gray-100">{children}</body>
    </html>
  );
}
