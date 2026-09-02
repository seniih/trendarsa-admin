"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useSession } from "@/lib/auth";
import { saveListing, deleteListing, type ListingInput } from "@/lib/listings";
import { ImageUploader } from "./ImageUploader";
import { Field, fieldClass as field } from "./Field";
import { FormSection } from "./FormSection";
import { ListingPreview } from "./ListingPreview";

function emptyListing(): ListingInput {
  return {
    title: "",
    description: "",
    price: 0,
    currency: "TRY",
    sizeM2: null,
    roomConfig: "",
    il: "Sakarya",
    ilce: "",
    mahalle: "",
    latitude: 40.7569,
    longitude: 30.3781,
    phone: "",
    whatsapp: "",
    status: "active",
    images: [],
  };
}

export function ListingForm({ initial }: { initial?: ListingInput }) {
  const session = useSession();
  const router = useRouter();
  const [form, setForm] = useState<ListingInput>(initial ?? emptyListing());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ListingInput>(key: K, value: ListingInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit() {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      const id = await saveListing(form, session.user.id);
      router.push(`/listings/edit?id=${id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!form.id || !confirm(`"${form.title}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    await deleteListing(form.id);
    router.push("/listings");
    router.refresh();
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{form.id ? form.title || "İlan" : "Yeni Arsa İlanı"}</h1>
          {form.id && (
            <button onClick={onDelete} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800">
              <Trash2 className="h-4 w-4" /> Sil
            </button>
          )}
        </div>

        <FormSection
          step={1}
          title="Temel Bilgiler"
          description="İlan kartında başlık olarak, detay sayfasında da başlık + açıklama olarak gösterilir."
        >
          <Field label="Başlık">
            <input className={field} value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Durum" hint="Pasif seçilirse bu ilan uygulamada kimseye görünmez, sadece burada saklanır.">
            <select className={field} value={form.status} onChange={(e) => set("status", e.target.value as ListingInput["status"])}>
              <option value="active">Aktif — herkese görünür</option>
              <option value="passive">Pasif — gizli</option>
            </select>
          </Field>
          <Field label="Açıklama" optional hint="Boş bırakılırsa detay sayfasında açıklama bölümü hiç gösterilmez." className="sm:col-span-2">
            <textarea className={field} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
        </FormSection>

        <FormSection step={2} title="Fiyat ve Metrekare" description="Kartta ve detay sayfasında büyük fiyat olarak gösterilir." columns={3}>
          <Field label="Fiyat">
            <input type="number" className={field} value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
          </Field>
          <Field label="Para birimi" hint="Örn. TRY, USD">
            <input className={field} value={form.currency} onChange={(e) => set("currency", e.target.value)} />
          </Field>
          <Field label="Alan (m²)" optional hint="Girilirse kartta ve detayda fiyatın yanında gösterilir.">
            <input
              type="number"
              className={field}
              value={form.sizeM2 ?? ""}
              onChange={(e) => set("sizeM2", e.target.value ? Number(e.target.value) : null)}
            />
          </Field>
          <Field label="Oda konfigürasyonu" optional hint="Örn. 3+1 — sadece detay sayfasında bir etiket olarak gösterilir.">
            <input className={field} value={form.roomConfig} onChange={(e) => set("roomConfig", e.target.value)} placeholder="3+1" />
          </Field>
        </FormSection>

        <FormSection
          step={3}
          title="Konum"
          description="İl/ilçe kartta ve detayda, mahalle sadece detayda gösterilir. Enlem/boylam detay sayfasındaki haritada pin konumunu belirler."
          columns={3}
        >
          <Field label="İl">
            <input className={field} value={form.il} onChange={(e) => set("il", e.target.value)} />
          </Field>
          <Field label="İlçe">
            <input className={field} value={form.ilce} onChange={(e) => set("ilce", e.target.value)} />
          </Field>
          <Field label="Mahalle" optional>
            <input className={field} value={form.mahalle} onChange={(e) => set("mahalle", e.target.value)} />
          </Field>
          <Field label="Enlem (lat)">
            <input type="number" step="0.0001" className={field} value={form.latitude} onChange={(e) => set("latitude", Number(e.target.value))} />
          </Field>
          <Field label="Boylam (lng)">
            <input type="number" step="0.0001" className={field} value={form.longitude} onChange={(e) => set("longitude", Number(e.target.value))} />
          </Field>
        </FormSection>

        <FormSection
          step={4}
          title="İletişim"
          description="Detay sayfasında Ara / WhatsApp butonlarını oluşturur. İkisi de boşsa hiç buton gösterilmez."
        >
          <Field label="Telefon" optional hint="Girilirse Ara butonunu gösterir.">
            <input className={field} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="WhatsApp" optional hint="Girilirse WhatsApp butonunu gösterir.">
            <input className={field} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>
        </FormSection>

        <FormSection step={5} title="Fotoğraflar" description="İlk fotoğraf kartta kapak olarak, tümü detay sayfasında galeri olarak gösterilir.">
          <div className="sm:col-span-2">
            <ImageUploader
              folder="listings"
              multiple
              images={form.images.map((g) => g.storageKey)}
              onChange={(images) => set("images", images.map((storageKey) => ({ storageKey })))}
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
        <ListingPreview form={form} />
      </div>
    </div>
  );
}
