import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cinzel, Montserrat } from "next/font/google";

import "@/app/globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { ContactChannelsProvider } from "@/components/site/ContactChannelsProvider";
import { SectionsProvider } from "@/components/site/SectionsProvider";
import { SITE } from "@/lib/constants";
import { getPublicContactChannels } from "@/lib/settings";
import { getSiteSectionMap } from "@/lib/site-content";

/**
 * Fontes via next/font (self-hosted, otimizadas).
 * As variáveis CSS alimentam o Tailwind (`font-display` e `font-sans`).
 */
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap"
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: SITE.title(),
    template: SITE.title("%s")
  },
  description: SITE.description,
  icons: {
    icon: [
      {
        url: "/images/Favicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png"
      },
      {
        url: "/images/Favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        url: "/images/Favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        url: "/images/Favicon/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    apple: [
      {
        url: "/images/Favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  },
  openGraph: {
    title: SITE.title(),
    description: SITE.description,
    type: "website",
    locale: "pt_BR"
  }
};

export const viewport: Viewport = {
  themeColor: "#0D1B2A",
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  // Canais de contato editáveis pelo painel (com fallback caso o banco falhe).
  const contactChannels = await getPublicContactChannels();

  // Conteúdos dinâmicos das seções (page_contents) — unidos aos padrões.
  const siteSections = await getSiteSectionMap().catch(() => ({}));

  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${montserrat.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SectionsProvider contents={siteSections}>
          <ContactChannelsProvider channels={contactChannels}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton />
          </ContactChannelsProvider>
        </SectionsProvider>
      </body>
    </html>
  );
}
