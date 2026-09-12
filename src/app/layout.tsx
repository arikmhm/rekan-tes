import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "Rekan Tes — Simulasi Tes Kerja",
    template: "%s | Rekan Tes",
  },
  description:
    "Latihan simulasi tes masuk kerja perbankan dengan sesi terstruktur, timer, hasil, dan pembahasan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      // globals.css menyetel `scroll-behavior: smooth`; atribut ini memberi tahu
      // Next.js agar tidak memakai smooth scroll saat transisi route.
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
