import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import SmoothScroll from "@/components/ui/SmoothScroll";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sonar | Premium AI Music Experience",
  description: "An intelligent music player powered by AI. Describe your vibe, and Sonar builds the soundtrack.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} antialiased`}
      >
        <SmoothScroll>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </SmoothScroll>
      </body>
    </html>
  );
}
