"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useSession } from "@/lib/auth";
import { saveVillaProject, deleteVillaProject, type VillaProjectInput } from "@/lib/projects";
import { FloorEditor } from "./FloorEditor";
import { ImageUploader } from "./ImageUploader";

function emptyProject(): VillaProjectInput {
  return {
    slug: "",
    featured: false,
    status: "available",
    titleTr: "",
    titleEn: "",
    excerptTr: "",
    excerptEn: "",
    descriptionTr: [],
    descriptionEn: [],
    highlightsTr: [],
    highlightsEn: [],
    district: "",
    neighborhood: "",
    city: "Sakarya",
    adaParsel: "",
    projectAreaM2: 0,
    parcelCount: 0,
    parcelKind: "villa",
    parcelAreaMin: 0,
    parcelAreaMax: 0,
    priceRangeMin: 0,
    priceRangeMax: 0,
    totalAreaM2: 0,
    travelToSakaryaMin: 0,
    travelToIstanbulHour: 0,
    coverImageKey: null,
    floors: [],
    gallery: [],
  };
}

const field = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";
const label = "block text-sm font-medium text-neutral-700";

export function ProjectForm({ initial }: { initial?: VillaProjectInput }) {
  const session = useSession();
  const router = useRouter();
  const [form, setForm] = useState<VillaProjectInput>(initial ?? emptyProject());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof VillaProjectInput>(key: K, value: VillaProjectInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function linesToArray(value: string): string[] {
    return value.split("\n").map((l) => l.trim()).filter(Boolean);
  }

  async function onSubmit() {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      const id = await saveVillaProject(form, session.user.id);
      router.push(`/projects/edit?id=${id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!form.id || !confirm(`"${form.titleTr}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    await deleteVillaProject(form.id);
    router.push("/projects");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{form.id ? form.titleTr || "Proje" : "Yeni Villa Projesi"}</h1>
        {form.id && (
          <button onClick={onDelete} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800">
            <Trash2 className="h-4 w-4" /> Sil
          </button>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Slug (URL, benzersiz)
          <input className={field} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="dagyoncali" />
        </label>
        <label className={label}>
          Durum
          <select className={field} value={form.status} onChange={(e) => set("status", e.target.value as VillaProjectInput["status"])}>
            <option value="available">Satışta</option>
            <option value="reserved">Rezerve</option>
            <option value="sold">Satıldı</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
          Öne çıkan (ana sayfada göster)
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Başlık (TR)
          <input className={field} value={form.titleTr} onChange={(e) => set("titleTr", e.target.value)} />
        </label>
        <label className={label}>
          Başlık (EN)
          <input className={field} value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} />
        </label>
        <label className={label}>
          Kısa özet (TR)
          <textarea className={field} rows={2} value={form.excerptTr} onChange={(e) => set("excerptTr", e.target.value)} />
        </label>
        <label className={label}>
          Kısa özet (EN)
          <textarea className={field} rows={2} value={form.excerptEn} onChange={(e) => set("excerptEn", e.target.value)} />
        </label>
        <label className={label}>
          Açıklama — her satır ayrı paragraf (TR)
          <textarea
            className={field}
            rows={5}
            value={form.descriptionTr.join("\n")}
            onChange={(e) => set("descriptionTr", linesToArray(e.target.value))}
          />
        </label>
        <label className={label}>
          Açıklama — her satır ayrı paragraf (EN)
          <textarea
            className={field}
            rows={5}
            value={form.descriptionEn.join("\n")}
            onChange={(e) => set("descriptionEn", linesToArray(e.target.value))}
          />
        </label>
        <label className={label}>
          Öne çıkanlar — her satır bir madde (TR)
          <textarea
            className={field}
            rows={3}
            value={form.highlightsTr.join("\n")}
            onChange={(e) => set("highlightsTr", linesToArray(e.target.value))}
          />
        </label>
        <label className={label}>
          Öne çıkanlar — her satır bir madde (EN)
          <textarea
            className={field}
            rows={3}
            value={form.highlightsEn.join("\n")}
            onChange={(e) => set("highlightsEn", linesToArray(e.target.value))}
          />
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <label className={label}>
          İlçe
          <input className={field} value={form.district} onChange={(e) => set("district", e.target.value)} />
        </label>
        <label className={label}>
          Mahalle
          <input className={field} value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />
        </label>
        <label className={label}>
          Şehir
          <input className={field} value={form.city} onChange={(e) => set("city", e.target.value)} />
        </label>
        <label className={label}>
          Ada-Parsel
          <input className={field} value={form.adaParsel} onChange={(e) => set("adaParsel", e.target.value)} />
        </label>
        <label className={label}>
          Proje alanı (m²)
          <input type="number" className={field} value={form.projectAreaM2} onChange={(e) => set("projectAreaM2", Number(e.target.value))} />
        </label>
        <label className={label}>
          Parsel sayısı
          <input type="number" className={field} value={form.parcelCount} onChange={(e) => set("parcelCount", Number(e.target.value))} />
        </label>
        <label className={label}>
          Parsel tipi
          <select className={field} value={form.parcelKind} onChange={(e) => set("parcelKind", e.target.value as VillaProjectInput["parcelKind"])}>
            <option value="villa">Villa</option>
            <option value="twinVilla">İkiz Villa</option>
          </select>
        </label>
        <label className={label}>
          Parsel alanı min (m²)
          <input type="number" className={field} value={form.parcelAreaMin} onChange={(e) => set("parcelAreaMin", Number(e.target.value))} />
        </label>
        <label className={label}>
          Parsel alanı max (m²)
          <input type="number" className={field} value={form.parcelAreaMax} onChange={(e) => set("parcelAreaMax", Number(e.target.value))} />
        </label>
        <label className={label}>
          Fiyat min (TL)
          <input type="number" className={field} value={form.priceRangeMin} onChange={(e) => set("priceRangeMin", Number(e.target.value))} />
        </label>
        <label className={label}>
          Fiyat max (TL)
          <input type="number" className={field} value={form.priceRangeMax} onChange={(e) => set("priceRangeMax", Number(e.target.value))} />
        </label>
        <label className={label}>
          Toplam villa alanı (m²)
          <input type="number" className={field} value={form.totalAreaM2} onChange={(e) => set("totalAreaM2", Number(e.target.value))} />
        </label>
        <label className={label}>
          Sakarya&apos;ya (dk)
          <input type="number" className={field} value={form.travelToSakaryaMin} onChange={(e) => set("travelToSakaryaMin", Number(e.target.value))} />
        </label>
        <label className={label}>
          İstanbul&apos;a (saat)
          <input type="number" step="0.5" className={field} value={form.travelToIstanbulHour} onChange={(e) => set("travelToIstanbulHour", Number(e.target.value))} />
        </label>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-900">Kat Planı</h2>
        <div className="mt-3">
          <FloorEditor floors={form.floors} onChange={(floors) => set("floors", floors)} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-900">Kapak Fotoğrafı</h2>
        <div className="mt-3">
          <ImageUploader
            folder="projects"
            images={form.coverImageKey ? [form.coverImageKey] : []}
            onChange={(images) => set("coverImageKey", images[0] ?? null)}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-900">Galeri</h2>
        <div className="mt-3">
          <ImageUploader
            folder="projects"
            multiple
            images={form.gallery.map((g) => g.storageKey)}
            onChange={(images) => set("gallery", images.map((storageKey) => ({ storageKey })))}
          />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={onSubmit}
        disabled={saving}
        className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </div>
  );
}
