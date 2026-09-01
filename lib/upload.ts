import { supabase } from "./supabase";

/**
 * trendarsa-app'in kullandığı `generate-upload-url` Edge Function'ını (R2
 * presigned PUT) aynen kullanır — bkz.
 * trendarsa-app/supabase/functions/generate-upload-url/index.ts. R2
 * kimlik bilgileri hiç bu panele sızmaz, sadece Edge Function'da tutulur.
 */
export async function uploadImageToR2(
  file: File,
  folder: "projects" | "listings",
): Promise<{ objectKey: string; publicUrl: string }> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const contentType = file.type || "image/jpeg";

  const { data, error } = await supabase.functions.invoke("generate-upload-url", {
    body: { fileExtension: extension, contentType, folder },
  });
  if (error || !data) {
    throw new Error(`Upload URL alınamadı: ${error?.message ?? "bilinmeyen hata"}`);
  }

  const { uploadUrl, objectKey, publicUrl } = data as {
    uploadUrl: string;
    objectKey: string;
    publicUrl: string;
  };

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!putResponse.ok) {
    throw new Error(`R2'ye yükleme başarısız: ${putResponse.status}`);
  }

  return { objectKey, publicUrl };
}
