/**
 * Bir içeriğin hangi yüzeylerde yayınlanacağı. DB'de `projects.publish_targets`
 * ve `listings.publish_targets` text[] kolonlarında tutulur; her yüzey kendi
 * sorgusunda bu diziyi filtreler (bkz. migration 20260903120000).
 */
export const PUBLISH_TARGETS = ["trendev-web", "trendarsa-web", "trendarsa-app"] as const;

export type PublishTarget = (typeof PUBLISH_TARGETS)[number];

export const TARGET_LABELS: Record<PublishTarget, string> = {
  "trendev-web": "TrendEv sitesi",
  "trendarsa-web": "TrendArsa sitesi",
  "trendarsa-app": "TrendArsa uygulaması",
};

export const TARGET_HINTS: Record<PublishTarget, string> = {
  "trendev-web": "trendev.net — villa projeleri",
  "trendarsa-web": "trendarsa.net — arsa projeleri",
  "trendarsa-app": "Mobil uygulama akışı",
};

/** DB'den gelen serbest metin dizisini bilinen hedeflere indirger. */
export function parseTargets(value: unknown): PublishTarget[] {
  if (!Array.isArray(value)) return [];
  return PUBLISH_TARGETS.filter((t) => value.includes(t));
}
