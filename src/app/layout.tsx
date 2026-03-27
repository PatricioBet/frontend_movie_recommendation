import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || "https://frontend.144.225.147.46.nip.io"),
  title: "Star Recs",
  description: "Recomendación de películas - Potenciado con modelo de Machine Learning. Descubre tus próximas películas favoritas.",
  keywords: ["películas", "recomendaciones", "IA", "machine learning", "cine", "Star Recs", "Inteligencia Artificial"],
  authors: [{ name: "Star Recs Team" }],
  openGraph: {
    title: "Star Recs | Recomendaciones de Películas con IA",
    description: "Descubre tus próximas películas favoritas con nuestro sistema de recomendaciones potenciado por Machine Learning.",
    siteName: "Star Recs",
    images: [
      {
        url: "/banner.webp",
        width: 1200,
        height: 630,
        alt: "Star Recs Banner",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Star Recs | Recomendaciones de Películas con IA",
    description: "Descubre tus próximas películas favoritas con nuestro rápido y divertido sistema de swipe.",
    images: ["/banner.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
