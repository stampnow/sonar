"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { ReactNode } from "react";

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isWebplayer = pathname.startsWith("/webplayer");

  if (isWebplayer) {
    // Webplayer gets NO navbar, NO footer — just the raw children
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="relative flex flex-col min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
