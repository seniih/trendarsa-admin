"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Home, MapPinned, LayoutTemplate } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const links = [
  { href: "/projects", label: "Villa Projeleri (ev)", icon: Home },
  { href: "/listings", label: "Arsa İlanları", icon: MapPinned },
  { href: "/site", label: "Site İçeriği", icon: LayoutTemplate },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-semibold">Trend Admin</span>
          <nav className="flex gap-4 text-sm">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900",
                  pathname.startsWith(href) && "font-medium text-neutral-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <LogOut className="h-4 w-4" />
          Çıkış
        </button>
      </div>
    </header>
  );
}
