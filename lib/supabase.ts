"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * trendarsa-app ile ortak Supabase projesi. Bu panel tamamen client-side
 * çalışır (SSR/middleware yok) — oturum tarayıcının localStorage'ında tutulur,
 * tıpkı trendarsa-app'in Flutter admin ekranlarındaki gibi "oturum var =
 * admin" mantığı geçerli (bkz. trendarsa-app CLAUDE.md, `isAdminProvider`).
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function r2Url(storageKey: string | null | undefined): string | null {
  if (!storageKey) return null;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/${storageKey}`;
}
