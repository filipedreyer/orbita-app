export function extractTags(text: string): string[] {
  const matches = text.match(/#[\w-]+/g);
  return matches ? [...new Set(matches)] : [];
}
