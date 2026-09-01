"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { ListingForm } from "@/components/ListingForm";
import { fetchListing, type ListingInput } from "@/lib/listings";

function EditListing() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [listing, setListing] = useState<ListingInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchListing(id).then(setListing).catch((e) => setError(e.message));
  }, [id]);

  if (!id) return <p className="text-sm text-red-600">İlan id&apos;si eksik.</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!listing) return <p className="text-sm text-neutral-500">Yükleniyor…</p>;
  return <ListingForm initial={listing} />;
}

export default function Page() {
  return (
    <AuthGuard>
      <Suspense fallback={<p className="text-sm text-neutral-500">Yükleniyor…</p>}>
        <EditListing />
      </Suspense>
    </AuthGuard>
  );
}
