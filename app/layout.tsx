import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TranslationProvider } from "@/hooks/use-translation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsApp } from "@/components/shared/floating-whatsapp";
import { ServiceWorkerRegister } from "@/components/shared/sw-register";
import { InstallPrompt } from "@/components/shared/install-prompt";
import { AnalyticsProvider } from "@/components/shared/analytics-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "EcuaCasa - Trusted Home Services in Cuenca, Ecuador",
    template: "%s | EcuaCasa",
  },
  description: "Find trusted, verified home service professionals in Cuenca, Ecuador. Plumbers, electricians, cleaners & more — English-speaking providers for expats and locals.",
  keywords: "Cuenca, Ecuador, home services, plumber, electrician, cleaning, handyman, expat services, servicios del hogar, profesionales verificados",
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
    apple: "/icons/icon-192.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "EcuaCasa - Trusted Home Services in Cuenca, Ecuador",
    description: "Find trusted, verified home service professionals in Cuenca, Ecuador. English-speaking providers for expats and locals.",
    url: "https://ecuacasa.com",
    siteName: "EcuaCasa",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EcuaCasa - Home Services in Cuenca, Ecuador",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EcuaCasa - Trusted Home Services in Cuenca, Ecuador",
    description: "Find trusted, verified home service professionals in Cuenca, Ecuador. English-speaking providers for expats and locals.",
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
          <FloatingWhatsApp />
          <InstallPrompt />
          <ServiceWorkerRegister />
          <AnalyticsProvider />
        </TranslationProvider>
      </body>
    </html>
  );
}
