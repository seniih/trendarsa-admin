"use client";

import { PUBLISH_TARGETS, TARGET_HINTS, TARGET_LABELS, type PublishTarget } from "@/lib/targets";

/** "Nerede yayınlansın?" — içeriğin görüneceği yüzeyleri seçtirir. */
export function PublishTargetPicker({
  value,
  onChange,
  available = PUBLISH_TARGETS,
}: {
  value: PublishTarget[];
  onChange: (targets: PublishTarget[]) => void;
  available?: readonly PublishTarget[];
}) {
  function toggle(target: PublishTarget) {
    onChange(
      value.includes(target) ? value.filter((t) => t !== target) : [...value, target],
    );
  }

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-3">
        {available.map((target) => {
          const checked = value.includes(target);
          return (
            <label
              key={target}
              className={`flex cursor-pointer items-start gap-2.5 rounded-md border p-3 text-sm transition-colors ${
                checked
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(target)}
                className="mt-0.5"
              />
              <span>
                <span className="block font-medium text-neutral-900">{TARGET_LABELS[target]}</span>
                <span className="block text-xs text-neutral-500">{TARGET_HINTS[target]}</span>
              </span>
            </label>
          );
        })}
      </div>
      {value.length === 0 && (
        <p className="mt-2 text-sm text-amber-700">
          Hiçbir yüzey seçilmedi — bu içerik hiçbir yerde görünmez.
        </p>
      )}
    </div>
  );
}
