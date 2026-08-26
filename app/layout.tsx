import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. Import your new UI components
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

export const metadata: Metadata = {
  // 1. UPDATED: Changed to your actual live Pages domain
  metadataBase: new URL('https://smart-solar-load-calculator.pages.dev'),
  title: {
    default: "Smart Solar Load Calculator | Find Exact System Size",
    template: "%s | VoltPulse Green Energy"
  },
  description: "Accurately calculate your home or commercial power load. Engineer the exact solar system size, inverter, and battery requirements in Pakistan and worldwide.",
  keywords: [
    "solar load calculator", "solar panel calculator", "how many solar panels do i need", 
    "hybrid solar system calculator", "solar calculator pakistan", "commercial solar calculator", 
    "off grid solar calculator", "mppt inverter size calculator"
  ],
  // 2. UPDATED: Changed the author URL
  authors: [{ name: "Engr. Arsalan Khan", url: "https://smart-solar-load-calculator.pages.dev/about" }],
  creator: "Engr. Arsalan Khan",
  publisher: "VoltPulse Green Energy",
  openGraph: {
    type: "website",
    locale: "en_PK",
    // 3. UPDATED: Changed OpenGraph URL
    url: "https://smart-solar-load-calculator.pages.dev",
    siteName: "VoltPulse Solar Calculator",
    title: "Smart Solar Load Calculator",
    description: "Engineer your exact solar system size in seconds. Advanced load calculation for homes, hospitals, and industries.",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "Smart Solar Load Calculator Interface",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Solar Load Calculator",
    description: "Engineer your exact solar system size in seconds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // 4. ADDED: Official Next.js method for Google Site Verification
  verification: {
    google: '2mF-waX3wchhW6xp45aynvq3D-jfBfxSpZtQfDmXPqM',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google AdSense Global Script Integration */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        ></script>
      </head>
      {/* Added dark theme background and text colors to the body */}
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-200">
        
        {/* Global Navbar (Contains your Logo) */}
        <Navbar />
        
        {/* Main Content Wrapper (flex-1 pushes the footer to the bottom) */}
        <div className="flex-1">
          {children}
        </div>
        
        {/* Global Footer (Contains your AdSense Legal Links) */}
        <Footer />
        
      </body>
    </html>
  );
}