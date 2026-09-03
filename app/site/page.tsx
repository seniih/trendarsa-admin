"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { SiteContentEditor } from "@/components/SiteContentEditor";

export default function Page() {
  return (
    <AuthGuard>
      <SiteContentEditor />
    </AuthGuard>
  );
}
