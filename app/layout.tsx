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
  title: "Smart Solar Load Calculator | Pakistan & International",
  description: "Accurately calculate your home or commercial power load and find exact solar system requirements.",
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