import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import { Nav } from "@/components/nav";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "CV Maker — bikin CV cantik dalam menit", template: "%s · CV Maker" },
  description: "Aplikasi web lokal buat bikin CV moderen: editor mudah, pastel & eyecatching, ekspor PDF, import CV lama.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-accent="lemon" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ToastProvider>
          <div className="app-shell">
            <Nav />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6 sm:px-8">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
