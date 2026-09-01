"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { ProjectForm } from "@/components/ProjectForm";

export default function Page() {
  return (
    <AuthGuard>
      <ProjectForm />
    </AuthGuard>
  );
}
