"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  EDITABLE_SITES,
  SECTION_LABELS,
  SITE_LABELS,
  fetchSiteSections,
  fetchSiteSettings,
  fetchSiteStats,
  saveSiteSection,
  saveSiteSettings,
  saveSiteStats,
  type EditableSite,
  type SiteSection,
  type SiteSettings,
  type SiteStat,
} from "@/lib/site-content";
import { cn } from "@/lib/utils";
import { ImageUploader } from "./ImageUploader";

const field =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";
const label = "block text-sm font-medium text-neutral-700";

interface LoadedSite {
  site: EditableSite;
  settings: SiteSettings;
  sections: SiteSection[];
  stats: SiteStat[];
}

export function SiteContentEditor() {
  const [site, setSite] = useState<EditableSite>("trendev-web");
  const [loaded, setLoaded] = useState<LoadedSite | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchSiteSettings(site), fetchSiteSections(site), fetchSiteStats(site)])
      .then(([settings, sections, stats]) => {
        if (cancelled) return;
        setLoaded({ site, settings, sections, stats });
        setMessage(null);
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Yüklenemedi");
      });

    return () => {
      cancelled = true;
    };
  }, [site]);

  // Site değişince eski verinin bir kare görünmemesi için yüklenen site kontrol edilir.
  const current = loaded?.site === site ? loaded : null;
  const settings = current?.settings ?? null;
  const sections = current?.sections ?? null;
  const stats = current?.stats ?? null;

  function setSettings(next: SiteSettings) {
    setLoaded((prev) => (prev ? { ...prev, settings: next } : prev));
  }

  function setStats(next: SiteStat[]) {
    setLoaded((prev) => (prev ? { ...prev, stats: next } : prev));
  }

  function setSection(key: string, patch: Partial<SiteSection>) {
    setLoaded((prev) =>
      prev
        ? { ...prev, sections: prev.sections.map((s) => (s.key === key ? { ...s, ...patch } : s)) }
        : prev,
    );
  }

  async function onSave() {
    if (!settings || !sections || !stats) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await saveSiteSettings({ ...settings, site });
      for (const section of sections) {
        await saveSiteSection(site, section);
      }
      await saveSiteStats(site, stats);
      setMessage("Kaydedildi. Site bir sonraki build'de güncellenir.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Site İçeriği</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Ana sayfanın açılış ve harita bölümleri, rakam şeridi ve iletişim bilgileri.
        </p>
      </div>

      <div className="flex gap-2">
        {EDITABLE_SITES.map((s) => (
          <button
            key={s}
            onClick={() => setSite(s)}
            className={cn(
              "rounded-md border px-4 py-2 text-sm",
              site === s
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-700 hover:bg-neutral-50",
            )}
          >
            {SITE_LABELS[s]}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!settings || !sections || !stats ? (
        <p className="text-sm text-neutral-500">Yükleniyor…</p>
      ) : (
        <>
          {sections.map((section) => (
            <section key={section.key} className="rounded-lg border border-neutral-200 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-900">
                  {SECTION_LABELS[section.key]}
                </h2>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(e) => setSection(section.key, { enabled: e.target.checked })}
                  />
                  Sitede göster
                </label>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={label}>
                  Üst etiket (TR)
                  <input
                    className={field}
                    value={section.eyebrowTr}
                    onChange={(e) => setSection(section.key, { eyebrowTr: e.target.value })}
                  />
                </label>
                <label className={label}>
                  Üst etiket (EN)
                  <input
                    className={field}
                    value={section.eyebrowEn}
                    onChange={(e) => setSection(section.key, { eyebrowEn: e.target.value })}
                  />
                </label>
                <label className={label}>
                  Başlık (TR)
                  <input
                    className={field}
                    value={section.titleTr}
                    onChange={(e) => setSection(section.key, { titleTr: e.target.value })}
                  />
                </label>
                <label className={label}>
                  Başlık (EN)
                  <input
                    className={field}
                    value={section.titleEn}
                    onChange={(e) => setSection(section.key, { titleEn: e.target.value })}
                  />
                </label>
                <label className={label}>
                  Alt metin (TR)
                  <textarea
                    className={field}
                    rows={3}
                    value={section.subtitleTr}
                    onChange={(e) => setSection(section.key, { subtitleTr: e.target.value })}
                  />
                </label>
                <label className={label}>
                  Alt metin (EN)
                  <textarea
                    className={field}
                    rows={3}
                    value={section.subtitleEn}
                    onChange={(e) => setSection(section.key, { subtitleEn: e.target.value })}
                  />
                </label>

                {section.key === "hero" && (
                  <>
                    <label className={label}>
                      Birincil buton (TR)
                      <input
                        className={field}
                        value={section.ctaPrimaryTr}
                        onChange={(e) => setSection(section.key, { ctaPrimaryTr: e.target.value })}
                      />
                    </label>
                    <label className={label}>
                      Birincil buton (EN)
                      <input
                        className={field}
                        value={section.ctaPrimaryEn}
                        onChange={(e) => setSection(section.key, { ctaPrimaryEn: e.target.value })}
                      />
                    </label>
                    <label className={label}>
                      İkincil buton (TR)
                      <input
                        className={field}
                        value={section.ctaSecondaryTr}
                        onChange={(e) => setSection(section.key, { ctaSecondaryTr: e.target.value })}
                      />
                    </label>
                    <label className={label}>
                      İkincil buton (EN)
                      <input
                        className={field}
                        value={section.ctaSecondaryEn}
                        onChange={(e) => setSection(section.key, { ctaSecondaryEn: e.target.value })}
                      />
                    </label>
                  </>
                )}

                <label className={label}>
                  Görsel açıklaması (TR)
                  <input
                    className={field}
                    value={section.imageAltTr}
                    onChange={(e) => setSection(section.key, { imageAltTr: e.target.value })}
                  />
                </label>
                <label className={label}>
                  Görsel açıklaması (EN)
                  <input
                    className={field}
                    value={section.imageAltEn}
                    onChange={(e) => setSection(section.key, { imageAltEn: e.target.value })}
                  />
                </label>
              </div>

              <div className="mt-4">
                <p className={label}>Görsel</p>
                <p className="mb-2 text-xs text-neutral-500">
                  Boş bırakılırsa site kendi statik görselini kullanır.
                </p>
                <ImageUploader
                  folder="site"
                  images={section.imageKey ? [section.imageKey] : []}
                  onChange={(images) => setSection(section.key, { imageKey: images[0] ?? null })}
                />
              </div>
            </section>
          ))}

          <section className="rounded-lg border border-neutral-200 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900">Rakam şeridi</h2>
              <button
                type="button"
                onClick={() =>
                  setStats([...stats, { valueTr: "", valueEn: "", labelTr: "", labelEn: "" }])
                }
                className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <Plus className="h-4 w-4" /> Ekle
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {stats.length === 0 && (
                <p className="text-sm text-neutral-500">Henüz rakam eklenmedi.</p>
              )}
              {stats.map((stat, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[repeat(4,1fr)_auto]">
                  <input
                    className={field}
                    placeholder="Değer (TR) — 177+"
                    value={stat.valueTr}
                    onChange={(e) =>
                      setStats(stats.map((s, j) => (i === j ? { ...s, valueTr: e.target.value } : s)))
                    }
                  />
                  <input
                    className={field}
                    placeholder="Değer (EN)"
                    value={stat.valueEn}
                    onChange={(e) =>
                      setStats(stats.map((s, j) => (i === j ? { ...s, valueEn: e.target.value } : s)))
                    }
                  />
                  <input
                    className={field}
                    placeholder="Etiket (TR) — Villa Parseli"
                    value={stat.labelTr}
                    onChange={(e) =>
                      setStats(stats.map((s, j) => (i === j ? { ...s, labelTr: e.target.value } : s)))
                    }
                  />
                  <input
                    className={field}
                    placeholder="Etiket (EN)"
                    value={stat.labelEn}
                    onChange={(e) =>
                      setStats(stats.map((s, j) => (i === j ? { ...s, labelEn: e.target.value } : s)))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setStats(stats.filter((_, j) => j !== i))}
                    className="mt-1 rounded-md px-2 text-red-600 hover:bg-red-50"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-900">İletişim & harita</h2>
            <p className="mt-1 text-sm text-neutral-500">
              İletişim sayfası, footer, WhatsApp/telefon butonları ve haritadaki konum.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["brandName", "Marka adı"],
                  ["legalName", "Ticari unvan"],
                  ["siteUrl", "Site adresi (https://…)"],
                  ["phoneDisplay", "Telefon (görünen)"],
                  ["phoneIntl", "Telefon (+90…)"],
                  ["whatsapp", "WhatsApp numarası (905…)"],
                  ["email", "E-posta"],
                  ["addressLine", "Adres"],
                  ["addressDistrict", "İlçe"],
                  ["addressCity", "Şehir"],
                  ["addressCountry", "Ülke"],
                  ["instagramUrl", "Instagram bağlantısı"],
                  ["facebookUrl", "Facebook bağlantısı"],
                ] as const
              ).map(([key, text]) => (
                <label key={key} className={label}>
                  {text}
                  <input
                    className={field}
                    value={settings[key]}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  />
                </label>
              ))}
              <label className={label}>
                Harita enlem (lat)
                <input
                  type="number"
                  step="0.0001"
                  className={field}
                  value={settings.mapLat}
                  onChange={(e) => setSettings({ ...settings, mapLat: Number(e.target.value) })}
                />
              </label>
              <label className={label}>
                Harita boylam (lng)
                <input
                  type="number"
                  step="0.0001"
                  className={field}
                  value={settings.mapLng}
                  onChange={(e) => setSettings({ ...settings, mapLng: Number(e.target.value) })}
                />
              </label>
              <label className={label}>
                Harita yakınlaştırma
                <input
                  type="number"
                  className={field}
                  value={settings.mapZoom}
                  onChange={(e) => setSettings({ ...settings, mapZoom: Number(e.target.value) })}
                />
              </label>
            </div>
          </section>

          {message && <p className="text-sm text-green-700">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </>
      )}
    </div>
  );
}
