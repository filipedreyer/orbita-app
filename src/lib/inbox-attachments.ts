import type { InboxAttachmentFields } from './types';

export interface ResolvedInboxAttachment {
  url: string;
  name: string | null;
  mimeType: string | null;
  kind: 'image' | 'file';
}

const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'heic', 'heif', 'bmp']);

function readFileNameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const lastSegment = pathname.split('/').filter(Boolean).at(-1) ?? '';
    const sanitized = decodeURIComponent(lastSegment);
    const underscoreIndex = sanitized.indexOf('_');
    return underscoreIndex >= 0 ? sanitized.slice(underscoreIndex + 1) : sanitized;
  } catch {
    return null;
  }
}

function inferMimeType(fileName: string | null, url: string) {
  const candidate = fileName ?? readFileNameFromUrl(url);
  const extension = candidate?.split('.').at(-1)?.toLowerCase() ?? '';
  if (!extension) return null;
  if (imageExtensions.has(extension)) return `image/${extension === 'jpg' ? 'jpeg' : extension}`;
  if (extension === 'pdf') return 'application/pdf';
  if (extension === 'doc') return 'application/msword';
  if (extension === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (extension === 'xls') return 'application/vnd.ms-excel';
  if (extension === 'xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (extension === 'txt') return 'text/plain';
  return null;
}

export function resolveInboxAttachment(attachment: InboxAttachmentFields & { image_url?: string | null }): ResolvedInboxAttachment | null {
  const url = attachment.attachment_url ?? attachment.image_url ?? null;
  if (!url) return null;

  const name = attachment.attachment_name ?? readFileNameFromUrl(url);
  const mimeType = attachment.attachment_mime_type ?? inferMimeType(name, url);
  const kind = mimeType?.startsWith('image/') ? 'image' : 'file';

  return {
    url,
    name,
    mimeType,
    kind,
  };
}
