"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { ProjectForm } from "@/components/ProjectForm";
import { fetchVillaProject, type VillaProjectInput } from "@/lib/projects";

function EditProject() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [project, setProject] = useState<VillaProjectInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchVillaProject(id).then(setProject).catch((e) => setError(e.message));
  }, [id]);

  if (!id) return <p className="text-sm text-red-600">Proje id&apos;si eksik.</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!project) return <p className="text-sm text-neutral-500">Yükleniyor…</p>;
  return <ProjectForm initial={project} />;
}

export default function Page() {
  return (
    <AuthGuard>
      <Suspense fallback={<p className="text-sm text-neutral-500">Yükleniyor…</p>}>
        <EditProject />
      </Suspense>
    </AuthGuard>
  );
}
