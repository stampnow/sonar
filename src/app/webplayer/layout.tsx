import type { ReactNode } from "react";

// The webplayer has its own layout - no Navbar or Footer, full-screen app
export default function WebplayerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {children}
    </div>
  );
}
