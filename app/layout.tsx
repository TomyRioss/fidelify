import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { getUserBranches, getUserRestaurantName } from "@/lib/services/branch-service";
import { BranchProvider } from "@/lib/branch-context";
import NextAuthSessionProvider from "@/components/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fielgo – Sistema de Fidelización para Gastronomía",
    template: "%s | Fielgo",
  },
  description:
    "Fielgo es el sistema de fidelización para gastronomía. Fidelizá clientes de tu restaurante, bar o cafetería con puntos, premios y cupones digitales. Probá gratis.",
  keywords: [
    "fielgo",
    "fidelización gastronomía",
    "sistema fidelización restaurantes",
    "programa de puntos restaurante",
    "fidelizar clientes gastronomía",
    "loyalty gastronomía Argentina",
    "software fidelización bar",
    "app fidelización restaurante",
    "premios clientes restaurante",
    "cupones digitales gastronomía",
    "sistema de puntos gastronomía",
  ],
  metadataBase: new URL("https://fielgo.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Fielgo – Sistema de Fidelización para Gastronomía",
    description:
      "Fidelizá clientes de tu restaurante, bar o cafetería con puntos, premios y cupones digitales.",
    siteName: "Fielgo",
    url: "https://fielgo.com",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fielgo – Sistema de Fidelización para Gastronomía",
    description:
      "Fidelizá clientes de tu restaurante, bar o cafetería con puntos, premios y cupones digitales.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userId = session?.user?.id;
  const [branches, restaurantName] = await Promise.all([
    userId ? getUserBranches(userId) : Promise.resolve([]),
    userId ? getUserRestaurantName(userId) : Promise.resolve(null),
  ]);

  return (
    <html lang="es" className="m-0 p-0">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0`}
      >
        <NextAuthSessionProvider>
          <BranchProvider branches={branches} restaurantName={restaurantName}>{children}</BranchProvider>
        </NextAuthSessionProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
