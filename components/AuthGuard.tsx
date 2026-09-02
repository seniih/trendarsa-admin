"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth";
import { Nav } from "./Nav";

/** Oturum yoksa /login'e yönlendirir; trendarsa-app ile aynı kural: oturum = admin. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session === null) router.replace("/login");
  }, [session, router]);

  if (session === undefined) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">Yükleniyor…</div>;
  }
  if (session === null) return null;

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
