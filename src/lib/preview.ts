/**
 * Resolve the preview image for a content entry.
 *
 * Order of preference:
 *   1. an explicit `image` in frontmatter
 *   2. the first <img src="..."> in the body
 *
 * Returns null when neither exists, and callers must handle that — several
 * labs have no image yet, and a row with nothing to show should simply not
 * offer a preview rather than expanding onto a broken thumbnail.
 */
export function previewImage(entry: {
  data?: { image?: string };
  body?: string;
}): string | null {
  const explicit = entry.data?.image;
  if (explicit) return explicit;

  const match = entry.body?.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}
