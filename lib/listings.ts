import { supabase } from "./supabase";
import { parseTargets, type PublishTarget } from "./targets";

export interface ListingImage {
  id?: string;
  storageKey: string;
}

export interface ListingInput {
  id?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  sizeM2: number | null;
  roomConfig: string;
  il: string;
  ilce: string;
  mahalle: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp: string;
  status: "active" | "passive";
  images: ListingImage[];
  /** Bu ilanın görüneceği yüzeyler (bkz. lib/targets.ts). */
  publishTargets: PublishTarget[];
  // ─── trendarsa-web alanları — uygulama bunları kullanmaz ───
  /** Sitedeki URL (`/projeler/<slug>`); site yalnızca slug'ı olan ilanları gösterir. */
  slug: string;
  featured: boolean;
  titleEn: string;
  excerptTr: string;
  excerptEn: string;
  /** İngilizce açıklama paragrafları; Türkçesi `description` alanından bölünür. */
  descriptionEn: string[];
  tagsTr: string[];
  tagsEn: string[];
  emsal: number | null;
  installment: boolean;
  saleStatus: "available" | "reserved" | "sold";
}

export interface ListingListItem {
  id: string;
  title: string;
  status: string;
  price: number;
  currency: string;
  il: string;
  ilce: string;
  publishTargets: PublishTarget[];
}

const LISTING_SELECT = `
  id, title, description, price, currency, size_m2, room_config, il, ilce, mahalle,
  latitude, longitude, phone, whatsapp, status, publish_targets,
  slug, featured, title_en, excerpt_tr, excerpt_en, description_en,
  tags_tr, tags_en, emsal, installment, sale_status,
  listing_images ( id, storage_key, position )
`;

async function getArsaCategoryId(): Promise<string> {
  const { data, error } = await supabase.from("categories").select("id").eq("slug", "arsa").single();
  if (error || !data) throw new Error(`'arsa' kategorisi bulunamadı: ${error?.message}`);
  return data.id;
}

function slugErrorMessage(error: { code?: string; message?: string } | null): string | null {
  if (error?.code === "23505" && error.message?.includes("listings_slug_key")) {
    return "Bu slug başka bir ilanda kullanılıyor. Lütfen farklı bir slug girin.";
  }
  return null;
}

export async function fetchListings(): Promise<ListingListItem[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, status, price, currency, il, ilce, publish_targets")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    price: r.price,
    currency: r.currency,
    il: r.il,
    ilce: r.ilce,
    publishTargets: parseTargets(r.publish_targets),
  }));
}

export async function fetchListing(id: string): Promise<ListingInput> {
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("id", id)
    .single();
  if (error || !data) throw new Error(error?.message ?? "İlan bulunamadı");

  const images: ListingImage[] = [...data.listing_images]
    .sort((a, b) => a.position - b.position)
    .map((img) => ({ id: img.id, storageKey: img.storage_key }));

  return {
    id: data.id,
    title: data.title,
    description: data.description ?? "",
    price: data.price,
    currency: data.currency ?? "TRY",
    sizeM2: data.size_m2,
    roomConfig: data.room_config ?? "",
    il: data.il,
    ilce: data.ilce,
    mahalle: data.mahalle ?? "",
    latitude: data.latitude,
    longitude: data.longitude,
    phone: data.phone ?? "",
    whatsapp: data.whatsapp ?? "",
    status: data.status,
    images,
    publishTargets: parseTargets(data.publish_targets),
    slug: data.slug ?? "",
    featured: data.featured ?? false,
    titleEn: data.title_en ?? "",
    excerptTr: data.excerpt_tr ?? "",
    excerptEn: data.excerpt_en ?? "",
    descriptionEn: data.description_en ?? [],
    tagsTr: data.tags_tr ?? [],
    tagsEn: data.tags_en ?? [],
    emsal: data.emsal,
    installment: data.installment ?? true,
    saleStatus: data.sale_status ?? "available",
  };
}

export async function saveListing(input: ListingInput, adminId: string): Promise<string> {
  const slug = input.slug.trim();
  if (input.publishTargets.includes("trendarsa-web") && !slug) {
    throw new Error("TrendArsa sitesinde yayınlanacak ilanlar için slug zorunlu.");
  }

  const row = {
    category_id: await getArsaCategoryId(),
    created_by: adminId,
    title: input.title,
    description: input.description,
    price: input.price,
    currency: input.currency,
    size_m2: input.sizeM2,
    room_config: input.roomConfig,
    il: input.il,
    ilce: input.ilce,
    mahalle: input.mahalle,
    latitude: input.latitude,
    longitude: input.longitude,
    phone: input.phone,
    whatsapp: input.whatsapp,
    status: input.status,
    publish_targets: input.publishTargets,
    slug: slug || null,
    featured: input.featured,
    title_en: input.titleEn,
    excerpt_tr: input.excerptTr,
    excerpt_en: input.excerptEn,
    description_en: input.descriptionEn,
    tags_tr: input.tagsTr,
    tags_en: input.tagsEn,
    emsal: input.emsal,
    installment: input.installment,
    sale_status: input.saleStatus,
  };

  let listingId = input.id;
  if (listingId) {
    const { error } = await supabase.from("listings").update(row).eq("id", listingId);
    if (error) throw new Error(slugErrorMessage(error) ?? error.message);
  } else {
    const { data, error } = await supabase.from("listings").insert(row).select("id").single();
    if (error || !data) throw new Error(slugErrorMessage(error) ?? error?.message ?? "İlan oluşturulamadı");
    listingId = data.id;
  }

  await supabase.from("listing_images").delete().eq("listing_id", listingId);
  const imageRows = input.images.map((img, i) => ({
    listing_id: listingId,
    storage_key: img.storageKey,
    position: i,
  }));
  if (imageRows.length > 0) {
    const { error: imagesError } = await supabase.from("listing_images").insert(imageRows);
    if (imagesError) throw new Error(imagesError.message);
  }

  return listingId!;
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
