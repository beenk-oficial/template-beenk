import { supabase } from "@/lib/supabase";

export async function uploadImage(
  file: File,
  bucket: string,
  path: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  return { data, error };
}

export function getImageUrl(bucket: string, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function listImages(bucket: string, folder: string = "") {
  const { data, error } = await supabase.storage.from(bucket).list(folder);
  return { data, error };
}

export async function downloadImage(bucket: string, path: string) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  return { data, error };
}

export async function deleteImages(bucket: string, paths: string[]) {
  const { data, error } = await supabase.storage.from(bucket).remove(paths);
  return { data, error };
}

export async function updateImage(
  file: File,
  bucket: string,
  path: string,
  options?: { cacheControl?: string; upsert?: boolean }
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .update(path, file, {
      cacheControl: options?.cacheControl ?? "3600",
      upsert: options?.upsert ?? true,
    });
  return { data, error };
}

