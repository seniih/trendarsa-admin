"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { ListingForm } from "@/components/ListingForm";

export default function Page() {
  return (
    <AuthGuard>
      <ListingForm />
    </AuthGuard>
  );
}
