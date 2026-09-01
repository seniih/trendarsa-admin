import type { NextConfig } from "next";

/**
 * Cloudflare Pages'te sunucu fonksiyonu olmadan, saf statik hosting olarak
 * yayınlanır. Bu yüzden dinamik route segmentleri (`/projects/[id]` gibi)
 * yerine query param (`/projects/edit?id=...`) kullanılıyor — next/image de
 * kullanılmıyor (plain <img>), o yüzden images ayarına gerek yok.
 */
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
