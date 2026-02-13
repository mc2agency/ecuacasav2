import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TranslationProvider } from "@/hooks/use-translation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

import { ServiceWorkerRegister } from "@/components/shared/sw-register";
import { InstallPrompt } from "@/components/shared/install-prompt";
import { AnalyticsProvider } from "@/components/shared/analytics-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "EcuaCasa | Servicios para el Hogar y Propiedades en Cuenca, Ecuador",
    template: "%s | EcuaCasa",
  },
  description: "Encuentra profesionales verificados para tu hogar y propiedades en venta y arriendo en Cuenca, Ecuador. Servicios de limpieza, electricidad, plomería, carpintería y más.",
  keywords: "Cuenca, Ecuador, home services, plumber, electrician, cleaning, handyman, expat services, servicios del hogar, profesionales verificados, propiedades, bienes raíces",
  metadataBase: new URL("https://ecuacasa.com"),
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EcuaCasa",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: [
      { url: "/icons/icon-152.png", sizes: "152x152" },
      { url: "/icons/icon-192.png", sizes: "192x192" },
    ],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "EcuaCasa | Servicios para el Hogar y Propiedades en Cuenca, Ecuador",
    description: "Encuentra profesionales verificados para tu hogar y propiedades en venta y arriendo en Cuenca, Ecuador. Servicios de limpieza, electricidad, plomería, carpintería y más.",
    url: "https://ecuacasa.com",
    siteName: "EcuaCasa",
    locale: "es_EC",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EcuaCasa - Servicios para el Hogar en Cuenca, Ecuador",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EcuaCasa | Servicios para el Hogar y Propiedades en Cuenca, Ecuador",
    description: "Encuentra profesionales verificados para tu hogar y propiedades en venta y arriendo en Cuenca, Ecuador.",
    images: ["/og-image.png"],
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
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <TranslationProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />

          <InstallPrompt />
          <ServiceWorkerRegister />
          <AnalyticsProvider />
        </TranslationProvider>
      </body>
    </html>
  );
}
