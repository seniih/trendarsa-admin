import { MapPin, Phone, MessageCircle } from "lucide-react";
import type { ListingInput } from "@/lib/listings";
import { r2Url } from "@/lib/supabase";

/**
 * trendarsa-app'teki ListingCard + ListingDetailScreen'in sadeleştirilmiş bir
 * önizlemesi — birebir piksel eşleşmesi değil, hangi alanın nerede
 * kullanıldığını göstermek içindir.
 */
export function ListingPreview({ form }: { form: ListingInput }) {
  const cover = form.images[0] ? r2Url(form.images[0].storageKey) : null;
  const price = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: form.currency || "TRY",
    maximumFractionDigits: 0,
  }).format(form.price || 0);
  const cardLocation = [form.ilce, form.il].filter(Boolean).join(", ");
  const detailLocation = [form.mahalle, form.ilce, form.il].filter(Boolean).join(", ");

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="relative flex aspect-[4/3] items-center justify-center bg-neutral-100">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-neutral-400">Fotoğraf yok</span>
          )}
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white">
            Arsa
          </span>
        </div>
        <div className="space-y-1.5 p-3">
          <p className="truncate text-base font-semibold text-neutral-900">{form.title || "Başlık girilmedi"}</p>
          <p className="flex items-center gap-1 truncate text-xs text-neutral-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {cardLocation || "İl / ilçe girilmedi"}
          </p>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-base font-semibold text-neutral-900">{price}</span>
            {form.sizeM2 != null && <span className="text-xs text-neutral-500">{form.sizeM2} m²</span>}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-neutral-400">↑ Uygulamadaki liste kartı böyle görünür.</p>

      {form.status === "passive" && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Durum &quot;Pasif&quot; olduğu için bu ilan uygulamada kimseye görünmeyecek.
        </p>
      )}

      <div className="rounded-lg border border-neutral-200 bg-white p-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-neutral-400">İlan detayında ayrıca</p>
        <div className="space-y-1.5 text-xs text-neutral-600">
          <p className="flex items-center gap-1 text-neutral-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {detailLocation || "Konum bilgisi eksik"}
          </p>
          {form.roomConfig && <p>Oda: {form.roomConfig}</p>}
          {form.description && <p className="line-clamp-3">{form.description}</p>}
          <div className="flex gap-3 pt-1">
            {form.phone && (
              <span className="flex items-center gap-1 text-neutral-500">
                <Phone className="h-3.5 w-3.5" /> Ara butonu
              </span>
            )}
            {form.whatsapp && (
              <span className="flex items-center gap-1 text-neutral-500">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp butonu
              </span>
            )}
            {!form.phone && !form.whatsapp && (
              <span className="text-neutral-400">Telefon/WhatsApp girilmezse hiçbir buton gösterilmez.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
