import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = "https://solarcalculator.greenengineeringtools.com";
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Solar Load Calculator | Green Engineering Tools",
    template: "%s | Green Engineering Tools",
  },
  description:
    "Free solar load and PV system planning tools for panels, inverter capacity, starting surge, battery storage, daily energy and roof area.",
  authors: [
    {
      name: "Engr. Arsalan Khan",
      url: `${baseUrl}/about`,
    },
  ],
  creator: "Engr. Arsalan Khan",
  publisher: "Green Engineering Tools",
  applicationName: "Green Engineering Tools Solar Calculator",
  category: "engineering",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Green Engineering Tools Solar Calculator",
    title: "Solar Load Calculator | Green Engineering Tools",
    description:
      "Estimate solar panels, inverter kW/kVA, starting surge, battery storage and roof area with transparent engineering assumptions.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Green Engineering Tools solar load calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Load Calculator | Green Engineering Tools",
    description:
      "Free no-signup solar load and PV system sizing calculator.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-950 text-slate-200">
        {adsenseClient && /^ca-pub-\d+$/.test(adsenseClient) ? (
          <Script
            id="adsense-loader"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
              adsenseClient
            )}`}
          />
        ) : null}
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
