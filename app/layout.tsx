import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { getUserBranches, getUserRestaurantName } from "@/lib/services/branch-service";
import { BranchProvider } from "@/lib/branch-context";
import NextAuthSessionProvider from "@/components/session-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FielGo – Fidelización para restaurantes modernos",
  description: "FielGo es el sistema de fidelización diseñado para restaurantes modernos. Gestiona puntos, premios y clientes desde un solo lugar.",
  keywords: ["fidelización", "restaurantes", "puntos", "premios", "FielGo", "loyalty"],
  openGraph: {
    title: "FielGo – Fidelización para restaurantes modernos",
    description: "Gestiona la fidelización de tus clientes con FielGo.",
    siteName: "FielGo",
    locale: "es_AR",
    type: "website",
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
      </body>
    </html>
  );
}
