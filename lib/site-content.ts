import { supabase } from "./supabase";

/** İçeriği admin panelden yönetilen web siteleri. */
export const EDITABLE_SITES = ["trendev-web", "trendarsa-web"] as const;
export type EditableSite = (typeof EDITABLE_SITES)[number];

export const SITE_LABELS: Record<EditableSite, string> = {
  "trendev-web": "TrendEv sitesi (trendev.net)",
  "trendarsa-web": "TrendArsa sitesi (trendarsa.net)",
};

/** Sitelerin ana sayfasındaki düzenlenebilir bloklar. */
export const SECTION_KEYS = ["hero", "projectsMap"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "Açılış bölümü (hero)",
  projectsMap: "Harita bölümü",
};

export interface SiteSettings {
  site: EditableSite;
  brandName: string;
  legalName: string;
  siteUrl: string;
  phoneIntl: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  addressLine: string;
  addressDistrict: string;
  addressCity: string;
  addressCountry: string;
  mapLat: number;
  mapLng: number;
  mapZoom: number;
  instagramUrl: string;
  facebookUrl: string;
}

export interface SiteSection {
  key: SectionKey;
  eyebrowTr: string;
  eyebrowEn: string;
  titleTr: string;
  titleEn: string;
  subtitleTr: string;
  subtitleEn: string;
  ctaPrimaryTr: string;
  ctaPrimaryEn: string;
  ctaSecondaryTr: string;
  ctaSecondaryEn: string;
  imageKey: string | null;
  imageAltTr: string;
  imageAltEn: string;
  enabled: boolean;
}

export interface SiteStat {
  id?: string;
  valueTr: string;
  valueEn: string;
  labelTr: string;
  labelEn: string;
}

export function emptySettings(site: EditableSite): SiteSettings {
  return {
    site,
    brandName: "",
    legalName: "",
    siteUrl: "",
    phoneIntl: "",
    phoneDisplay: "",
    whatsapp: "",
    email: "",
    addressLine: "",
    addressDistrict: "",
    addressCity: "",
    addressCountry: "Türkiye",
    mapLat: 40.7639,
    mapLng: 30.4368,
    mapZoom: 13,
    instagramUrl: "",
    facebookUrl: "",
  };
}

export function emptySection(key: SectionKey): SiteSection {
  return {
    key,
    eyebrowTr: "",
    eyebrowEn: "",
    titleTr: "",
    titleEn: "",
    subtitleTr: "",
    subtitleEn: "",
    ctaPrimaryTr: "",
    ctaPrimaryEn: "",
    ctaSecondaryTr: "",
    ctaSecondaryEn: "",
    imageKey: null,
    imageAltTr: "",
    imageAltEn: "",
    enabled: true,
  };
}

export async function fetchSiteSettings(site: EditableSite): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("site", site)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return emptySettings(site);

  return {
    site,
    brandName: data.brand_name ?? "",
    legalName: data.legal_name ?? "",
    siteUrl: data.site_url ?? "",
    phoneIntl: data.phone_intl ?? "",
    phoneDisplay: data.phone_display ?? "",
    whatsapp: data.whatsapp ?? "",
    email: data.email ?? "",
    addressLine: data.address_line ?? "",
    addressDistrict: data.address_district ?? "",
    addressCity: data.address_city ?? "",
    addressCountry: data.address_country ?? "",
    mapLat: data.map_lat ?? 0,
    mapLng: data.map_lng ?? 0,
    mapZoom: data.map_zoom ?? 13,
    instagramUrl: data.instagram_url ?? "",
    facebookUrl: data.facebook_url ?? "",
  };
}

export async function saveSiteSettings(input: SiteSettings): Promise<void> {
  const { error } = await supabase.from("site_settings").upsert(
    {
      site: input.site,
      brand_name: input.brandName,
      legal_name: input.legalName,
      site_url: input.siteUrl,
      phone_intl: input.phoneIntl,
      phone_display: input.phoneDisplay,
      whatsapp: input.whatsapp,
      email: input.email,
      address_line: input.addressLine,
      address_district: input.addressDistrict,
      address_city: input.addressCity,
      address_country: input.addressCountry,
      map_lat: input.mapLat,
      map_lng: input.mapLng,
      map_zoom: input.mapZoom,
      instagram_url: input.instagramUrl,
      facebook_url: input.facebookUrl,
    },
    { onConflict: "site" },
  );
  if (error) throw new Error(error.message);
}

export async function fetchSiteSections(site: EditableSite): Promise<SiteSection[]> {
  const { data, error } = await supabase
    .from("site_sections")
    .select("*")
    .eq("site", site);
  if (error) throw new Error(error.message);

  const bySection = new Map(
    (data ?? []).map((row) => [
      row.key as SectionKey,
      {
        key: row.key as SectionKey,
        eyebrowTr: row.eyebrow_tr ?? "",
        eyebrowEn: row.eyebrow_en ?? "",
        titleTr: row.title_tr ?? "",
        titleEn: row.title_en ?? "",
        subtitleTr: row.subtitle_tr ?? "",
        subtitleEn: row.subtitle_en ?? "",
        ctaPrimaryTr: row.cta_primary_tr ?? "",
        ctaPrimaryEn: row.cta_primary_en ?? "",
        ctaSecondaryTr: row.cta_secondary_tr ?? "",
        ctaSecondaryEn: row.cta_secondary_en ?? "",
        imageKey: row.image_key,
        imageAltTr: row.image_alt_tr ?? "",
        imageAltEn: row.image_alt_en ?? "",
        enabled: row.enabled ?? true,
      } satisfies SiteSection,
    ]),
  );

  // Kayıt yoksa boş bir form gösterilir; kaydedince satır oluşur.
  return SECTION_KEYS.map((key) => bySection.get(key) ?? emptySection(key));
}

export async function saveSiteSection(site: EditableSite, section: SiteSection): Promise<void> {
  const { error } = await supabase.from("site_sections").upsert(
    {
      site,
      key: section.key,
      position: SECTION_KEYS.indexOf(section.key),
      eyebrow_tr: section.eyebrowTr,
      eyebrow_en: section.eyebrowEn,
      title_tr: section.titleTr,
      title_en: section.titleEn,
      subtitle_tr: section.subtitleTr,
      subtitle_en: section.subtitleEn,
      cta_primary_tr: section.ctaPrimaryTr,
      cta_primary_en: section.ctaPrimaryEn,
      cta_secondary_tr: section.ctaSecondaryTr,
      cta_secondary_en: section.ctaSecondaryEn,
      image_key: section.imageKey,
      image_alt_tr: section.imageAltTr,
      image_alt_en: section.imageAltEn,
      enabled: section.enabled,
    },
    { onConflict: "site,key" },
  );
  if (error) throw new Error(error.message);
}

export async function fetchSiteStats(site: EditableSite): Promise<SiteStat[]> {
  const { data, error } = await supabase
    .from("site_stats")
    .select("id, value_tr, value_en, label_tr, label_en, position")
    .eq("site", site)
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    valueTr: row.value_tr ?? "",
    valueEn: row.value_en ?? "",
    labelTr: row.label_tr ?? "",
    labelEn: row.label_en ?? "",
  }));
}

/** Rakam şeridini temizden yeniden yazar — sıralama `position` ile korunur. */
export async function saveSiteStats(site: EditableSite, stats: SiteStat[]): Promise<void> {
  const { error: deleteError } = await supabase.from("site_stats").delete().eq("site", site);
  if (deleteError) throw new Error(deleteError.message);

  const rows = stats
    .filter((s) => s.labelTr.trim() || s.valueTr.trim())
    .map((s, i) => ({
      site,
      position: i,
      value_tr: s.valueTr,
      value_en: s.valueEn || s.valueTr,
      label_tr: s.labelTr,
      label_en: s.labelEn || s.labelTr,
    }));
  if (rows.length === 0) return;

  const { error } = await supabase.from("site_stats").insert(rows);
  if (error) throw new Error(error.message);
}
