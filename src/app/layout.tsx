import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Edufio — Penjadwalan Sesi Les",
  description:
    "Aplikasi penjadwalan sesi les privat Edufio. Daftarkan siswa, pilih tanggal, dan atur detail sesi dengan mudah.",
  keywords: ["edufio", "les privat", "penjadwalan", "jadwal sesi"],
  authors: [{ name: "Edufio" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#026C7A",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${plusJakarta.variable} h-full`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
