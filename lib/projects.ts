import { supabase } from "./supabase";

export type RoomKey =
  | "room"
  | "bedroom"
  | "livingRoom"
  | "kitchen"
  | "bathroom"
  | "masterBathroom"
  | "dressingRoom"
  | "hall";

export interface FloorRoom {
  roomKey: RoomKey;
  count: number;
}

export interface Floor {
  key: "ground" | "first" | "roof";
  areaM2: number;
  outdoorKind: "veranda" | "terrace" | null;
  outdoorAreaM2: number | null;
  rooms: FloorRoom[];
}

export interface GalleryImage {
  id?: string;
  storageKey: string;
}

export interface VillaProjectInput {
  id?: string;
  slug: string;
  featured: boolean;
  status: "available" | "reserved" | "sold";
  titleTr: string;
  titleEn: string;
  excerptTr: string;
  excerptEn: string;
  descriptionTr: string[];
  descriptionEn: string[];
  highlightsTr: string[];
  highlightsEn: string[];
  district: string;
  neighborhood: string;
  city: string;
  adaParsel: string;
  projectAreaM2: number;
  parcelCount: number;
  parcelKind: "villa" | "twinVilla";
  parcelAreaMin: number;
  parcelAreaMax: number;
  priceRangeMin: number;
  priceRangeMax: number;
  totalAreaM2: number;
  travelToSakaryaMin: number;
  travelToIstanbulHour: number;
  coverImageKey: string | null;
  floors: Floor[];
  gallery: GalleryImage[];
}

export interface ProjectListItem {
  id: string;
  slug: string;
  titleTr: string;
  status: string;
  featured: boolean;
  coverImageKey: string | null;
}

async function getCategoryId(slug: "ev" | "arsa"): Promise<string> {
  const { data, error } = await supabase.from("categories").select("id").eq("slug", slug).single();
  if (error || !data) throw new Error(`'${slug}' kategorisi bulunamadı: ${error?.message}`);
  return data.id;
}

export async function fetchVillaProjects(): Promise<ProjectListItem[]> {
  const categoryId = await getCategoryId("ev");
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title_tr, status, featured, cover_image_key")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug ?? "",
    titleTr: r.title_tr ?? "(başlıksız)",
    status: r.status ?? "available",
    featured: r.featured,
    coverImageKey: r.cover_image_key,
  }));
}

export async function fetchVillaProject(id: string): Promise<VillaProjectInput> {
  const { data, error } = await supabase
    .from("projects")
    .select(
      `id, slug, featured, status, title_tr, title_en, excerpt_tr, excerpt_en,
       description_tr, description_en, highlights_tr, highlights_en,
       district, neighborhood, city, ada_parsel, project_area_m2, parcel_count,
       parcel_kind, parcel_area_min, parcel_area_max, price_range_min, price_range_max,
       total_area_m2, travel_to_sakarya_min, travel_to_istanbul_hour, cover_image_key,
       project_floors ( id, key, area_m2, outdoor_kind, outdoor_area_m2, position,
         project_floor_rooms ( room_key, count, position ) ),
       project_images ( id, storage_key, position )`,
    )
    .eq("id", id)
    .single();
  if (error || !data) throw new Error(error?.message ?? "Proje bulunamadı");

  const floors: Floor[] = [...data.project_floors]
    .sort((a, b) => a.position - b.position)
    .map((f) => ({
      key: f.key,
      areaM2: f.area_m2,
      outdoorKind: f.outdoor_kind,
      outdoorAreaM2: f.outdoor_area_m2,
      rooms: [...f.project_floor_rooms]
        .sort((a, b) => a.position - b.position)
        .map((r) => ({ roomKey: r.room_key, count: r.count })),
    }));

  const gallery: GalleryImage[] = [...data.project_images]
    .sort((a, b) => a.position - b.position)
    .map((img) => ({ id: img.id, storageKey: img.storage_key }));

  return {
    id: data.id,
    slug: data.slug ?? "",
    featured: data.featured,
    status: data.status ?? "available",
    titleTr: data.title_tr ?? "",
    titleEn: data.title_en ?? "",
    excerptTr: data.excerpt_tr ?? "",
    excerptEn: data.excerpt_en ?? "",
    descriptionTr: data.description_tr ?? [],
    descriptionEn: data.description_en ?? [],
    highlightsTr: data.highlights_tr ?? [],
    highlightsEn: data.highlights_en ?? [],
    district: data.district ?? "",
    neighborhood: data.neighborhood ?? "",
    city: data.city ?? "Sakarya",
    adaParsel: data.ada_parsel ?? "",
    projectAreaM2: data.project_area_m2 ?? 0,
    parcelCount: data.parcel_count ?? 0,
    parcelKind: data.parcel_kind ?? "villa",
    parcelAreaMin: data.parcel_area_min ?? 0,
    parcelAreaMax: data.parcel_area_max ?? 0,
    priceRangeMin: data.price_range_min ?? 0,
    priceRangeMax: data.price_range_max ?? 0,
    totalAreaM2: data.total_area_m2 ?? 0,
    travelToSakaryaMin: data.travel_to_sakarya_min ?? 0,
    travelToIstanbulHour: data.travel_to_istanbul_hour ?? 0,
    coverImageKey: data.cover_image_key,
    floors,
    gallery,
  };
}

export async function saveVillaProject(input: VillaProjectInput, adminId: string): Promise<string> {
  const categoryId = await getCategoryId("ev");

  const row = {
    category_id: categoryId,
    created_by: adminId,
    slug: input.slug,
    featured: input.featured,
    status: input.status,
    name: input.titleTr,
    description: input.excerptTr,
    title_tr: input.titleTr,
    title_en: input.titleEn,
    excerpt_tr: input.excerptTr,
    excerpt_en: input.excerptEn,
    description_tr: input.descriptionTr,
    description_en: input.descriptionEn,
    highlights_tr: input.highlightsTr,
    highlights_en: input.highlightsEn,
    district: input.district,
    neighborhood: input.neighborhood,
    city: input.city,
    ada_parsel: input.adaParsel,
    project_area_m2: input.projectAreaM2,
    parcel_count: input.parcelCount,
    parcel_kind: input.parcelKind,
    parcel_area_min: input.parcelAreaMin,
    parcel_area_max: input.parcelAreaMax,
    price_range_min: input.priceRangeMin,
    price_range_max: input.priceRangeMax,
    total_area_m2: input.totalAreaM2,
    travel_to_sakarya_min: input.travelToSakaryaMin,
    travel_to_istanbul_hour: input.travelToIstanbulHour,
    cover_image_key: input.coverImageKey,
  };

  let projectId = input.id;
  if (projectId) {
    const { error } = await supabase.from("projects").update(row).eq("id", projectId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase.from("projects").insert(row).select("id").single();
    if (error || !data) throw new Error(error?.message ?? "Proje oluşturulamadı");
    projectId = data.id;
  }

  // Kat/oda kırılımını temizden yeniden yaz.
  await supabase.from("project_floors").delete().eq("project_id", projectId);
  for (const [floorIndex, floor] of input.floors.entries()) {
    const { data: floorRow, error: floorError } = await supabase
      .from("project_floors")
      .insert({
        project_id: projectId,
        key: floor.key,
        area_m2: floor.areaM2,
        outdoor_kind: floor.outdoorKind,
        outdoor_area_m2: floor.outdoorAreaM2,
        position: floorIndex,
      })
      .select("id")
      .single();
    if (floorError || !floorRow) throw new Error(floorError?.message ?? "Kat kaydedilemedi");

    const roomRows = floor.rooms.map((r, i) => ({
      floor_id: floorRow.id,
      room_key: r.roomKey,
      count: r.count,
      position: i,
    }));
    if (roomRows.length > 0) {
      const { error: roomsError } = await supabase.from("project_floor_rooms").insert(roomRows);
      if (roomsError) throw new Error(roomsError.message);
    }
  }

  // Galeriyi temizden yeniden yaz.
  await supabase.from("project_images").delete().eq("project_id", projectId);
  const imageRows = input.gallery.map((img, i) => ({
    project_id: projectId,
    storage_key: img.storageKey,
    position: i,
  }));
  if (imageRows.length > 0) {
    const { error: imagesError } = await supabase.from("project_images").insert(imageRows);
    if (imagesError) throw new Error(imagesError.message);
  }

  return projectId!;
}

export async function deleteVillaProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
