"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { ProjectForm } from "@/components/ProjectForm";
import { fetchVillaProject, type VillaProjectInput } from "@/lib/projects";

function EditProject() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<VillaProjectInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVillaProject(id).then(setProject).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!project) return <p className="text-sm text-neutral-500">Yükleniyor…</p>;
  return <ProjectForm initial={project} />;
}

export default function Page() {
  return (
    <AuthGuard>
      <EditProject />
    </AuthGuard>
  );
}
