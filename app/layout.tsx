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
  metadataBase: new URL('https://www.voltpulse.com'),
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
  authors: [{ name: "Engr. Arsalan Khan", url: "https://www.voltpulse.com/about" }],
  creator: "Engr. Arsalan Khan",
  publisher: "VoltPulse Green Energy",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://www.voltpulse.com",
    siteName: "VoltPulse Solar Calculator",
    title: "Smart Solar Load Calculator",
    description: "Engineer your exact solar system size in seconds. Advanced load calculation for homes, hospitals, and industries.",
    images: [
      {
        url: "/og-image.jpg", // You can upload an image named og-image.jpg to your public folder later
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

<meta name="google-site-verification" content="2mF-waX3wchhW6xp45aynvq3D-jfBfxSpZtQfDmXPqM" />

      </head>
      {/* 2. Added dark theme background and text colors to the body */}
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-200">
        
        {/* 3. Global Navbar (Contains your Logo) */}
        <Navbar />
        
        {/* 4. Main Content Wrapper (flex-1 pushes the footer to the bottom) */}
        <div className="flex-1">
          {children}
        </div>
        
        {/* 5. Global Footer (Contains your AdSense Legal Links) */}
        <Footer />
        
      </body>
    </html>
  );
}