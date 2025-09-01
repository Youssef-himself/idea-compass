import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
}

export const metadata: Metadata = {
  title: "IdeaCompass - Market Research Platform",
  description: "Transform Reddit discussions into actionable business insights with guided AI-powered market research",
  keywords: ["market research", "reddit analysis", "business intelligence", "ai insights"],
  authors: [{ name: "Youssef" }],
  openGraph: {
    title: "IdeaCompass - Market Research Platform",
    description: "Transform Reddit discussions into actionable business insights",
    type: "website",
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
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 text-gray-900 selection:bg-primary-100 selection:text-primary-900`}
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-blue-600 text-white px-4 py-2 rounded-br-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Skip to main content
          </a>
          <div id="main-content" className="flex-1">
            {children}
          </div>
          <Footer />
        </div>
        
        {/* Screen Reader Announcement Region */}
        <div
          id="announcements"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        ></div>
      </body>
    </html>
  );
}
