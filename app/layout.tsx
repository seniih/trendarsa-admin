import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trend Admin",
  description: "Trend Ev / TrendArsa içerik yönetim paneli",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
