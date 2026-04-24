// Appends Cloudflare R2 public URL to the given media path
export function getMediaUrl(mediaPath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || "";
  return `${baseUrl}/${mediaPath}`;
}

// Truncate text to a max length
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
