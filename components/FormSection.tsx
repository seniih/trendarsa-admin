import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Formun tek bir bölümü: başlık + "sitede/uygulamada nerede görünür" açıklaması.
 * `step` sırayı gösteren rozet (1, 2, 3...) — kullanıcı formda nerede olduğunu anlasın diye.
 */
export function FormSection({
  step,
  title,
  description,
  columns = 2,
  children,
}: {
  step: number;
  title: string;
  description: string;
  columns?: 2 | 3;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
          {step}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
          <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
        </div>
      </div>
      <div className={cn("mt-4 grid gap-4", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>{children}</div>
    </section>
  );
}
