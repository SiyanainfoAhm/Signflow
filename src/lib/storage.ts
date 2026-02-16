import { supabase } from './supabase';

const BUCKET = 'photomedia';
const FOLDER = 'skyline';

export interface UploadResult {
  url: string | null;
  error: string | null;
}

/**
 * Upload form cover image to photomedia/skyline/{formId}_{filename}
 * Returns the public URL of the uploaded file.
 */
export async function uploadFormCoverImage(
  formId: number,
  file: File
): Promise<UploadResult> {
  const ext = file.name.split('.').pop() || 'jpg';
  const sanitizedName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .slice(0, 50);
  // Unique path to avoid upsert (UPDATE can trigger 42P17 with some policies)
  const path = `${FOLDER}/${formId}_${sanitizedName}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    console.error('uploadFormCoverImage error', error);
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

/**
 * Upload row image to photomedia/skyline/{formId}/rows/{rowId}_{timestamp}.{ext}
 * Stores the image in a folder structure by form ID and row ID.
 * Returns the public URL of the uploaded file.
 */
export async function uploadRowImage(
  formId: number,
  questionId: number,
  rowId: number,
  file: File
): Promise<UploadResult> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${FOLDER}/${formId}/rows/${rowId}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    console.error('uploadRowImage error', error);
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
