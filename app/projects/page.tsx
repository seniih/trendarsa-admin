"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { fetchVillaProjects, type ProjectListItem } from "@/lib/projects";
import { r2Url } from "@/lib/supabase";

function ProjectsList() {
  const [projects, setProjects] = useState<ProjectListItem[] | null>(null);

  useEffect(() => {
    fetchVillaProjects().then(setProjects);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Villa Projeleri</h1>
        <Link href="/projects/new" className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> Yeni Proje
        </Link>
      </div>

      {projects === null ? (
        <p className="mt-6 text-sm text-neutral-500">Yükleniyor…</p>
      ) : projects.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Henüz proje yok.</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const cover = r2Url(p.coverImageKey);
            return (
              <Link
                key={p.id}
                href={`/projects/edit?id=${p.id}`}
                className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400"
              >
                <div className="flex h-32 items-center justify-center overflow-hidden rounded-md bg-neutral-100">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-neutral-400">Fotoğraf yok</span>
                  )}
                </div>
                <p className="mt-3 font-medium">{p.titleTr}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {p.status} {p.featured && "· öne çıkan"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <ProjectsList />
    </AuthGuard>
  );
}
