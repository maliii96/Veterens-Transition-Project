import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "VetSITREP | Veterans Career Transition Platform",
    template: "%s | VetSITREP",
  },
  description: "AI-powered career transition platform for military veterans. Get job assessments, personalized 90-day plans, and transition guidance.",
  metadataBase: new URL("https://www.vetsitrep.us"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.vetsitrep.us",
    siteName: "VetSITREP",
    title: "VetSITREP | Veterans Career Transition Platform",
    description: "AI-powered career transition platform for military veterans. Get job assessments, personalized 90-day plans, and transition guidance.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VetSITREP | Veterans Career Transition Platform",
    description: "AI-powered career transition platform for military veterans. Get job assessments, personalized 90-day plans, and transition guidance.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${dmSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
