"use client";

import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImageToR2, type UploadFolder } from "@/lib/upload";
import { r2Url } from "@/lib/supabase";

/** Kapak (tekli) veya galeri (çoklu) görsel yükleyici — R2'ye direkt yükler. */
export function ImageUploader({
  folder,
  images,
  onChange,
  multiple = false,
}: {
  folder: UploadFolder;
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
}) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploading = progress !== null;

  async function handleFiles(selected: File[]) {
    if (selected.length === 0) return;
    setProgress({ done: 0, total: selected.length });
    setError(null);

    const uploaded: string[] = [];
    try {
      for (const file of selected) {
        const { objectKey } = await uploadImageToR2(file, folder);
        uploaded.push(objectKey);
        setProgress({ done: uploaded.length, total: selected.length });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally {
      // Hata olsa da o ana kadar yüklenenler korunur.
      if (uploaded.length > 0) {
        onChange(multiple ? [...images, ...uploaded] : uploaded.slice(0, 1));
      }
      setProgress(null);
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((key, i) => {
          const url = r2Url(key);
          return (
            <div key={`${key}-${i}`} className="relative h-24 w-24 overflow-hidden rounded-md border border-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {url && <img src={url} alt="" className="h-full w-full object-cover" />}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-[11px]">
            {progress ? `${progress.done}/${progress.total}` : "Ekle"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              // FileList input'a bağlı olduğu için önce kopyalanır, sonra input
              // sıfırlanır — aynı dosya tekrar seçildiğinde de onChange tetiklensin diye.
              const selected = Array.from(e.target.files ?? []);
              e.target.value = "";
              void handleFiles(selected);
            }}
          />
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
