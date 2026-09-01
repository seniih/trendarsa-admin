"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { ListingForm } from "@/components/ListingForm";
import { fetchListing, type ListingInput } from "@/lib/listings";

function EditListing() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListing(id).then(setListing).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!listing) return <p className="text-sm text-neutral-500">Yükleniyor…</p>;
  return <ListingForm initial={listing} />;
}

export default function Page() {
  return (
    <AuthGuard>
      <EditListing />
    </AuthGuard>
  );
}
