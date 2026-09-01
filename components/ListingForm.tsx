"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useSession } from "@/lib/auth";
import { saveListing, deleteListing, type ListingInput } from "@/lib/listings";
import { ImageUploader } from "./ImageUploader";

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

const field = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";
const label = "block text-sm font-medium text-neutral-700";

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{form.id ? form.title || "İlan" : "Yeni Arsa İlanı"}</h1>
        {form.id && (
          <button onClick={onDelete} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800">
            <Trash2 className="h-4 w-4" /> Sil
          </button>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Başlık
          <input className={field} value={form.title} onChange={(e) => set("title", e.target.value)} />
        </label>
        <label className={label}>
          Durum
          <select className={field} value={form.status} onChange={(e) => set("status", e.target.value as ListingInput["status"])}>
            <option value="active">Aktif</option>
            <option value="passive">Pasif</option>
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className={label}>Açıklama</span>
          <textarea className={field} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <label className={label}>
          Fiyat
          <input type="number" className={field} value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
        </label>
        <label className={label}>
          Para birimi
          <input className={field} value={form.currency} onChange={(e) => set("currency", e.target.value)} />
        </label>
        <label className={label}>
          Alan (m²)
          <input
            type="number"
            className={field}
            value={form.sizeM2 ?? ""}
            onChange={(e) => set("sizeM2", e.target.value ? Number(e.target.value) : null)}
          />
        </label>
        <label className={label}>
          Oda konfigürasyonu
          <input className={field} value={form.roomConfig} onChange={(e) => set("roomConfig", e.target.value)} placeholder="3+1" />
        </label>
        <label className={label}>
          İl
          <input className={field} value={form.il} onChange={(e) => set("il", e.target.value)} />
        </label>
        <label className={label}>
          İlçe
          <input className={field} value={form.ilce} onChange={(e) => set("ilce", e.target.value)} />
        </label>
        <label className={label}>
          Mahalle
          <input className={field} value={form.mahalle} onChange={(e) => set("mahalle", e.target.value)} />
        </label>
        <label className={label}>
          Enlem (lat)
          <input type="number" step="0.0001" className={field} value={form.latitude} onChange={(e) => set("latitude", Number(e.target.value))} />
        </label>
        <label className={label}>
          Boylam (lng)
          <input type="number" step="0.0001" className={field} value={form.longitude} onChange={(e) => set("longitude", Number(e.target.value))} />
        </label>
        <label className={label}>
          Telefon
          <input className={field} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </label>
        <label className={label}>
          WhatsApp
          <input className={field} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </label>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-900">Fotoğraflar</h2>
        <div className="mt-3">
          <ImageUploader
            folder="listings"
            multiple
            images={form.images.map((g) => g.storageKey)}
            onChange={(images) => set("images", images.map((storageKey) => ({ storageKey })))}
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
