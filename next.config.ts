import type { NextConfig } from "next";

/**
 * Cloudflare Workers + OpenNext üzerinden deploy edilir.
 * @opennextjs/cloudflare, standalone çıktısını (.next/standalone/) sarmalayarak
 * Cloudflare Workers bundle'ı oluşturur. next/image kullanılmıyor (plain <img>),
 * o yüzden images ayarına gerek yok.
 */
const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
