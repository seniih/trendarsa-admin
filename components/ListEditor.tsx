"use client";

import { Plus, Trash2 } from "lucide-react";
import { fieldClass as field } from "./Field";

/** Serbest metin listesi (öne çıkanlar, etiketler vb.) — her madde ayrı bir input. */
export function ListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  function updateItem(index: number, value: string) {
    onChange(items.map((item, i) => (i === index ? value : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="mt-1 space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            className={field + " mt-0"}
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="shrink-0 text-neutral-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <Plus className="h-3.5 w-3.5" /> Madde ekle
      </button>
    </div>
  );
}
