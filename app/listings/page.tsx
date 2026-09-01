"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { fetchListings, type ListingListItem } from "@/lib/listings";

function ListingsList() {
  const [listings, setListings] = useState<ListingListItem[] | null>(null);

  useEffect(() => {
    fetchListings().then(setListings);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Arsa İlanları</h1>
        <Link href="/listings/new" className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> Yeni İlan
        </Link>
      </div>

      {listings === null ? (
        <p className="mt-6 text-sm text-neutral-500">Yükleniyor…</p>
      ) : listings.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Henüz ilan yok.</p>
      ) : (
        <div className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
          {listings.map((l) => (
            <Link key={l.id} href={`/listings/${l.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50">
              <div>
                <p className="font-medium">{l.title}</p>
                <p className="text-xs text-neutral-500">
                  {l.ilce} / {l.il} · {l.status}
                </p>
              </div>
              <p className="text-sm font-medium text-neutral-700">
                {new Intl.NumberFormat("tr-TR", { style: "currency", currency: l.currency, maximumFractionDigits: 0 }).format(l.price)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <ListingsList />
    </AuthGuard>
  );
}
