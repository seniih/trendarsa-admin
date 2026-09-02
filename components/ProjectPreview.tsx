import { MapPin, Maximize } from "lucide-react";
import type { VillaProjectInput } from "@/lib/projects";
import { r2Url } from "@/lib/supabase";

const STATUS_LABEL: Record<VillaProjectInput["status"], string> = {
  available: "Satışta",
  reserved: "Rezerve",
  sold: "Satıldı",
};

function formatPriceTRY(value: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

/**
 * trendev-web'teki VillaCard + proje detay sayfasının sadeleştirilmiş bir
 * önizlemesi — birebir piksel eşleşmesi değil, hangi alanın nerede
 * kullanıldığını göstermek içindir.
 */
export function ProjectPreview({ form }: { form: VillaProjectInput }) {
  const cover = r2Url(form.coverImageKey);
  const location = [form.neighborhood, form.district].filter(Boolean).join(" / ") + (form.city ? ` · ${form.city}` : "");
  const parcelArea =
    form.parcelAreaMin === form.parcelAreaMax ? `${form.parcelAreaMin} m²` : `${form.parcelAreaMin}-${form.parcelAreaMax} m²`;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="relative flex aspect-[4/3] items-center justify-center bg-neutral-100">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-neutral-400">Kapak fotoğrafı yok</span>
          )}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5">
            <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white">
              {STATUS_LABEL[form.status]}
            </span>
            <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white">
              {form.totalAreaM2} m²
            </span>
          </div>
        </div>
        <div className="space-y-1.5 p-3">
          <p className="flex items-center gap-1 truncate text-xs font-medium text-emerald-700">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {location || "Konum girilmedi"}
          </p>
          <p className="truncate text-base font-semibold text-neutral-900">{form.titleTr || "Başlık girilmedi"}</p>
          <p className="line-clamp-2 text-xs text-neutral-500">{form.excerptTr || "Kısa özet girilmedi"}</p>
          <div className="flex items-center gap-3 pt-1 text-xs text-neutral-600">
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" /> {parcelArea}
            </span>
            <span>{form.parcelCount} parsel</span>
          </div>
          <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
            <span className="text-sm font-semibold text-neutral-900">
              {formatPriceTRY(form.priceRangeMin)} <span className="font-normal text-neutral-400">+</span>
            </span>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-neutral-400">
        ↑ Ana sayfa / projeler listesindeki kart böyle görünür{form.featured && " (öne çıkan olarak ana sayfada da gösterilir)"}.
      </p>

      <div className="rounded-lg border border-neutral-200 bg-white p-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-neutral-400">Proje detay sayfasında ayrıca</p>
        <div className="space-y-1.5 text-xs text-neutral-600">
          <p>Ada-Parsel: {form.adaParsel || "—"}</p>
          <p>
            Fiyat aralığı: {formatPriceTRY(form.priceRangeMin)} - {formatPriceTRY(form.priceRangeMax)}
          </p>
          <p>
            Sakarya&apos;ya {form.travelToSakaryaMin} dk · İstanbul&apos;a {form.travelToIstanbulHour} saat
          </p>
          {form.highlightsTr.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {form.highlightsTr.map((h, i) => (
                <span key={i} className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                  {h}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400">Öne çıkanlar boş — bu rozet listesi hiç gösterilmeyecek.</p>
          )}
          <p>{form.floors.length} kat planlandı{form.floors.length === 0 && " (kat planı bölümü boş görünecek)"}</p>
          <p>{form.gallery.length} galeri fotoğrafı{form.gallery.length === 0 && " (galeri bölümü hiç gösterilmeyecek)"}</p>
          {form.descriptionTr.length === 0 && <p className="text-neutral-400">Açıklama boş — detay sayfasında açıklama metni olmayacak.</p>}
        </div>
      </div>
    </div>
  );
}
