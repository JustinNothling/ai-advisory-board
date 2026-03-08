import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";
import { Brain, LayoutDashboard, GitCompare, Plus } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Advisory Board",
  description: "Create, test, and manage AI persona advisors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <TooltipProvider>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card/30 p-4 flex flex-col gap-6 fixed h-screen">
              <Link href="/" className="flex items-center gap-2 px-2">
                <Brain className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Advisory Board</span>
              </Link>

              <nav className="flex flex-col gap-1">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/advisors/new"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Advisor
                </Link>
                <Link
                  href="/compare"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare
                </Link>
              </nav>

              <div className="mt-auto text-xs text-muted-foreground px-2">
                <p>Replica Score Engine v1.0</p>
                <p className="mt-1">Based on PersonaGym methodology</p>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-64 p-8">
              {children}
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
