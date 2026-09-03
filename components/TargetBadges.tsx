import { TARGET_LABELS, type PublishTarget } from "@/lib/targets";

/** Liste ekranlarında bir kaydın hangi yüzeylerde yayınlandığını gösterir. */
export function TargetBadges({ targets }: { targets: PublishTarget[] }) {
  if (targets.length === 0) {
    return <span className="text-xs text-amber-700">yayında değil</span>;
  }
  return (
    <span className="flex flex-wrap gap-1">
      {targets.map((t) => (
        <span
          key={t}
          className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600"
        >
          {TARGET_LABELS[t]}
        </span>
      ))}
    </span>
  );
}
