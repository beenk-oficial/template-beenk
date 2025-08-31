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
  options?: { cacheControl?: string; upsert?: boolean, oldPath?: string | null }
) {
  await deleteImages('admin', [options?.oldPath].filter(Boolean) as string[]);
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .update(path, file, {
      upsert: options?.upsert ?? true,
      cacheControl: options?.cacheControl ?? "no-cache",
    });
  return { data, error };
}

