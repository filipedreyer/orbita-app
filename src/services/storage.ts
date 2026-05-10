import { getSupabase } from '../lib/supabase';

export const PERSONAL_MEDIA_BUCKET = 'media';
export const SIGNED_ATTACHMENT_URL_TTL_SECONDS = 60 * 60;

export interface PersonalAttachmentUpload {
  bucket: typeof PERSONAL_MEDIA_BUCKET;
  path: string;
  signedUrl: string;
  legacyImageUrl: string;
}

function sanitizeFileName(fileName: string) {
  const fallback = 'attachment';
  const normalized = fileName.trim().replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '');
  return normalized || fallback;
}

export function isLegacyAttachmentUrl(value: string | null | undefined) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

export async function uploadPersonalAttachment(userId: string, uri: string, fileName: string): Promise<PersonalAttachmentUpload> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const path = `${userId}/${Date.now()}_${sanitizeFileName(fileName)}`;
  const bucket = getSupabase().storage.from(PERSONAL_MEDIA_BUCKET);

  const { error: uploadError } = await bucket.upload(path, blob, {
    contentType: blob.type || 'application/octet-stream',
    upsert: false,
  });

  if (uploadError) throw uploadError;

  const { data, error: signedUrlError } = await bucket.createSignedUrl(path, SIGNED_ATTACHMENT_URL_TTL_SECONDS);

  if (signedUrlError || !data?.signedUrl) {
    throw signedUrlError ?? new Error('Nao foi possivel criar URL assinada para o anexo.');
  }

  return {
    bucket: PERSONAL_MEDIA_BUCKET,
    path,
    signedUrl: data.signedUrl,
    legacyImageUrl: data.signedUrl,
  };
}
