import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const fieldClass =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";

/** Tek bir form alanını etiket + "(opsiyonel)" rozeti + kısa açıklama ile sarar. */
export function Field({
  label,
  optional,
  hint,
  className,
  children,
}: {
  label: string;
  optional?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("block text-sm font-medium text-neutral-700", className)}>
      <span className="flex flex-wrap items-baseline gap-x-1.5">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-neutral-400">(opsiyonel)</span>}
      </span>
      {hint && <span className="mt-0.5 block text-xs font-normal text-neutral-400">{hint}</span>}
      {children}
    </label>
  );
}
