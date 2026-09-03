"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useSession } from "@/lib/auth";
import { saveVillaProject, deleteVillaProject, type VillaProjectInput } from "@/lib/projects";
import { slugify } from "@/lib/utils";
import { FloorEditor } from "./FloorEditor";
import { ImageUploader } from "./ImageUploader";
import { Field, fieldClass as field } from "./Field";
import { FormSection } from "./FormSection";
import { ProjectPreview } from "./ProjectPreview";
import { PublishTargetPicker } from "./PublishTargetPicker";

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
    publishTargets: ["trendev-web"],
  };
}

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
    if (!form.slug.trim()) {
      setError("Slug boş olamaz.");
      return;
    }
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
    <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{form.id ? form.titleTr || "Proje" : "Yeni Villa Projesi"}</h1>
          {form.id && (
            <button onClick={onDelete} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800">
              <Trash2 className="h-4 w-4" /> Sil
            </button>
          )}
        </div>

        <FormSection
          step={1}
          title="Nerede Yayınlansın?"
          description="Aynı proje birden fazla yüzeyde yayınlanabilir."
        >
          <div className="sm:col-span-2">
            <PublishTargetPicker
              value={form.publishTargets}
              onChange={(targets) => set("publishTargets", targets)}
            />
          </div>
        </FormSection>

        <FormSection step={2} title="Temel Bilgiler" description="Sayfanın adresini ve kartta görünen durumu belirler.">
          <Field label="Slug (URL)" hint="Sitede trendev.com/projeler/<slug> adresini oluşturur, benzersiz olmalı.">
            <div className="mt-1 flex gap-2">
              <input className={field + " mt-0"} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="dagyoncali" />
              <button
                type="button"
                onClick={() => set("slug", slugify(form.titleTr))}
                disabled={!form.titleTr}
                className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                Başlıktan oluştur
              </button>
            </div>
          </Field>
          <Field label="Durum" hint="Kartın üstündeki rozette gösterilir.">
            <select className={field} value={form.status} onChange={(e) => set("status", e.target.value as VillaProjectInput["status"])}>
              <option value="available">Satışta</option>
              <option value="reserved">Rezerve</option>
              <option value="sold">Satıldı</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 sm:col-span-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
            Öne çıkan — ana sayfada &quot;öne çıkan projeler&quot; bölümünde de gösterilir
          </label>
        </FormSection>

        <FormSection
          step={3}
          title="Başlık ve Özet (TR / EN)"
          description="Başlık kartta ve detay sayfasında, özet kartta 2 satır ve detay sayfasının üst kısmında gösterilir."
        >
          <Field label="Başlık (TR)">
            <input className={field} value={form.titleTr} onChange={(e) => set("titleTr", e.target.value)} />
          </Field>
          <Field label="Başlık (EN)" optional hint="Boşsa İngilizce sayfada başlık boş görünür.">
            <input className={field} value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} />
          </Field>
          <Field label="Kısa özet (TR)" optional>
            <textarea className={field} rows={2} value={form.excerptTr} onChange={(e) => set("excerptTr", e.target.value)} />
          </Field>
          <Field label="Kısa özet (EN)" optional hint="Boşsa İngilizce sayfada özet boş görünür.">
            <textarea className={field} rows={2} value={form.excerptEn} onChange={(e) => set("excerptEn", e.target.value)} />
          </Field>
        </FormSection>

        <FormSection
          step={4}
          title="Açıklama ve Öne Çıkanlar (TR / EN)"
          description="Sadece proje detay sayfasında gösterilir — kartta görünmez. İkisi de boş bırakılabilir."
        >
          <Field label="Açıklama — her satır ayrı paragraf (TR)" optional hint="Boşsa detay sayfasında açıklama metni hiç görünmez.">
            <textarea
              className={field}
              rows={5}
              value={form.descriptionTr.join("\n")}
              onChange={(e) => set("descriptionTr", linesToArray(e.target.value))}
            />
          </Field>
          <Field label="Açıklama — her satır ayrı paragraf (EN)" optional>
            <textarea
              className={field}
              rows={5}
              value={form.descriptionEn.join("\n")}
              onChange={(e) => set("descriptionEn", linesToArray(e.target.value))}
            />
          </Field>
          <Field label="Öne çıkanlar — her satır bir madde (TR)" optional hint="Boşsa detay sayfasında bu rozet listesi hiç gösterilmez.">
            <textarea
              className={field}
              rows={3}
              value={form.highlightsTr.join("\n")}
              onChange={(e) => set("highlightsTr", linesToArray(e.target.value))}
            />
          </Field>
          <Field label="Öne çıkanlar — her satır bir madde (EN)" optional>
            <textarea
              className={field}
              rows={3}
              value={form.highlightsEn.join("\n")}
              onChange={(e) => set("highlightsEn", linesToArray(e.target.value))}
            />
          </Field>
        </FormSection>

        <FormSection
          step={5}
          title="Konum ve Parsel Bilgileri"
          description="Konum kartta ve detayda gösterilir; ada-parsel sadece detay sayfasındaki özet kutusunda görünür."
          columns={3}
        >
          <Field label="İlçe">
            <input className={field} value={form.district} onChange={(e) => set("district", e.target.value)} />
          </Field>
          <Field label="Mahalle">
            <input className={field} value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />
          </Field>
          <Field label="Şehir">
            <input className={field} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Ada-Parsel" optional hint="Sadece detay sayfasının özet kutusunda gösterilir.">
            <input className={field} value={form.adaParsel} onChange={(e) => set("adaParsel", e.target.value)} />
          </Field>
          <Field label="Parsel sayısı" hint="Kartta X parsel olarak gösterilir.">
            <input type="number" className={field} value={form.parcelCount} onChange={(e) => set("parcelCount", Number(e.target.value))} />
          </Field>
          <Field label="Parsel tipi" optional hint="Şu an sitede hiçbir yerde gösterilmiyor, ileride kullanılmak üzere saklanır.">
            <select className={field} value={form.parcelKind} onChange={(e) => set("parcelKind", e.target.value as VillaProjectInput["parcelKind"])}>
              <option value="villa">Villa</option>
              <option value="twinVilla">İkiz Villa</option>
            </select>
          </Field>
          <Field label="Parsel alanı min (m²)" hint="Kartta ve detayda alan aralığı olarak gösterilir.">
            <input type="number" className={field} value={form.parcelAreaMin} onChange={(e) => set("parcelAreaMin", Number(e.target.value))} />
          </Field>
          <Field label="Parsel alanı max (m²)">
            <input type="number" className={field} value={form.parcelAreaMax} onChange={(e) => set("parcelAreaMax", Number(e.target.value))} />
          </Field>
        </FormSection>

        <FormSection
          step={6}
          title="Fiyat ve Alan Bilgileri"
          description="Fiyat min değeri kartta, aralığın tamamı detay sayfasında; toplam villa alanı kartın üstündeki rozette gösterilir."
          columns={3}
        >
          <Field label="Fiyat min (TL)" hint="Kartta fiyat rakamının yanında + işaretiyle gösterilir.">
            <input type="number" className={field} value={form.priceRangeMin} onChange={(e) => set("priceRangeMin", Number(e.target.value))} />
          </Field>
          <Field label="Fiyat max (TL)" hint="Sadece detay sayfasındaki fiyat aralığında kullanılır.">
            <input type="number" className={field} value={form.priceRangeMax} onChange={(e) => set("priceRangeMax", Number(e.target.value))} />
          </Field>
          <Field label="Toplam villa alanı (m²)" hint="Kartın üst köşesindeki rozette gösterilir.">
            <input type="number" className={field} value={form.totalAreaM2} onChange={(e) => set("totalAreaM2", Number(e.target.value))} />
          </Field>
          <Field label="Proje alanı (m²)" optional hint="Şu an sitede hiçbir yerde gösterilmiyor, ileride kullanılmak üzere saklanır.">
            <input type="number" className={field} value={form.projectAreaM2} onChange={(e) => set("projectAreaM2", Number(e.target.value))} />
          </Field>
          <Field label="Sakarya'ya (dk)" optional hint="Detay sayfasındaki mesafe bilgisinde gösterilir.">
            <input type="number" className={field} value={form.travelToSakaryaMin} onChange={(e) => set("travelToSakaryaMin", Number(e.target.value))} />
          </Field>
          <Field label="İstanbul'a (saat)" optional>
            <input
              type="number"
              step="0.5"
              className={field}
              value={form.travelToIstanbulHour}
              onChange={(e) => set("travelToIstanbulHour", Number(e.target.value))}
            />
          </Field>
        </FormSection>

        <FormSection step={7} title="Kat Planı" description="Detay sayfasında her kat ayrı bir kart olarak, oda dökümüyle birlikte gösterilir." columns={2}>
          <div className="sm:col-span-2">
            <FloorEditor floors={form.floors} onChange={(floors) => set("floors", floors)} />
          </div>
        </FormSection>

        <FormSection step={8} title="Kapak Fotoğrafı" description="Kartta ve detay sayfasının üstündeki büyük görselde kullanılır.">
          <div className="sm:col-span-2">
            <ImageUploader
              folder="projects"
              images={form.coverImageKey ? [form.coverImageKey] : []}
              onChange={(images) => set("coverImageKey", images[0] ?? null)}
            />
          </div>
        </FormSection>

        <FormSection step={9} title="Galeri" description="Sadece detay sayfasında gösterilir. Boş bırakılırsa galeri bölümü hiç görünmez.">
          <div className="sm:col-span-2">
            <ImageUploader
              folder="projects"
              multiple
              images={form.gallery.map((g) => g.storageKey)}
              onChange={(images) => set("gallery", images.map((storageKey) => ({ storageKey })))}
            />
          </div>
        </FormSection>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={onSubmit}
          disabled={saving}
          className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>

      <div className="order-first mb-6 lg:sticky lg:top-6 lg:order-last lg:mb-0">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Canlı Önizleme</p>
        <ProjectPreview form={form} />
      </div>
    </div>
  );
}
