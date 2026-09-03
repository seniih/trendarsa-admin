import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/** Tarayıcıdan tek parça PUT ile gönderildiği için makul bir üst sınır. */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

/** R2'de görselin yazılacağı klasör — Edge Function objectKey'i buna göre üretir. */
export type UploadFolder = "projects" | "listings" | "site";

/**
 * Dosya adında uzantı olmayabilir (ör. panoya kopyalanmış görsel) ya da uzantı
 * MIME tipiyle çelişebilir; objectKey'in uzantısı ile Content-Type'ın tutarlı
 * kalması için önce MIME tipine bakarız.
 */
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

function resolveExtension(file: File): string {
  const fromMime = EXTENSION_BY_MIME[file.type.toLowerCase()];
  if (fromMime) return fromMime;

  const parts = file.name.split(".");
  const fromName = parts.length > 1 ? parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return fromName || "jpg";
}

/** FunctionsHttpError'ın `message`'ı hep aynı jenerik metin; asıl sebep response gövdesinde. */
async function edgeFunctionErrorDetail(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    const response = error.context;
    const body = await response.json().catch(() => null);
    const message = body && typeof body.error === "string" ? body.error : response.statusText;
    return `${message} (HTTP ${response.status})`;
  }
  if (error instanceof Error) return error.message;
  return "bilinmeyen hata";
}

/**
 * trendarsa-app'in kullandığı `generate-upload-url` Edge Function'ını (R2
 * presigned PUT) aynen kullanır — bkz.
 * trendarsa-app/supabase/functions/generate-upload-url/index.ts. R2
 * kimlik bilgileri hiç bu panele sızmaz, sadece Edge Function'da tutulur.
 *
 * Flutter uygulamasından farklı olarak PUT isteği tarayıcıdan gider; bu yüzden
 * R2 bucket'ında CORS kuralı tanımlı olmak zorundadır (bkz. README ve
 * `r2-cors.json`), yoksa preflight'ta engellenir.
 */
export async function uploadImageToR2(
  file: File,
  folder: UploadFolder,
): Promise<{ objectKey: string; publicUrl: string }> {
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error(`"${file.name}" bir görsel değil.`);
  }
  if (file.size === 0) {
    throw new Error(`"${file.name}" boş bir dosya.`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    throw new Error(`"${file.name}" çok büyük (${mb} MB). En fazla ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`);
  }

  const extension = resolveExtension(file);
  const contentType = file.type || "image/jpeg";

  const { data, error } = await supabase.functions.invoke("generate-upload-url", {
    body: { fileExtension: extension, contentType, folder },
  });
  if (error || !data) {
    throw new Error(`Upload URL alınamadı: ${await edgeFunctionErrorDetail(error)}`);
  }

  const { uploadUrl, objectKey, publicUrl } = data as {
    uploadUrl: string;
    objectKey: string;
    publicUrl: string;
  };

  let putResponse: Response;
  try {
    putResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    });
  } catch {
    // fetch sadece ağ/CORS hatalarında throw eder; HTTP hata kodları buraya düşmez.
    throw new Error(
      "R2'ye bağlanılamadı. R2 bucket'ında bu adrese izin veren bir CORS kuralı " +
        "yoksa tarayıcı yüklemeyi engeller — kurulum için README'deki " +
        "\"R2 CORS ayarı\" bölümüne bakın.",
    );
  }
  if (!putResponse.ok) {
    const detail = (await putResponse.text().catch(() => "")).slice(0, 200);
    throw new Error(`R2'ye yükleme başarısız (HTTP ${putResponse.status}) ${detail}`.trim());
  }

  return { objectKey, publicUrl };
}
