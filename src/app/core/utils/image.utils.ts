/**
 * Image Optimization Utilities for BuyMass
 * Automatically rewrites uncompressed/high-resolution CDN image URLs (Unsplash, Cloudinary)
 * to properly sized, auto-formatted (WebP/AVIF), and compressed variants.
 * Reduces asset download sizes by up to 95% and eliminates slow image paint times.
 */

export type ImageSizePreset = 'thumb' | 'avatar' | 'card' | 'banner' | 'hero' | number;

export const VEHICLE_PLACEHOLDER_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%23f1f5f9"><rect width="100%" height="100%" fill="%23f1f5f9"/><g fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(152, 102) scale(4)"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></g></svg>';

export function resolveImageWidth(preset?: ImageSizePreset): number {
  if (typeof preset === 'number') {
    return preset > 0 ? preset : 400;
  }
  switch (preset) {
    case 'avatar':
      return 96;
    case 'thumb':
      return 160;
    case 'card':
      return 420;
    case 'banner':
      return 640;
    case 'hero':
      return 900;
    default:
      return 420;
  }
}

/**
 * Optimizes an image URL for mobile-first fast paint.
 * Handles Unsplash dynamic parameters and Cloudinary transformations.
 */
export function optimizeImageUrl(
  url: string | null | undefined,
  preset: ImageSizePreset = 'card',
  quality = 75,
): string {
  if (!url || typeof url !== 'string') {
    return VEHICLE_PLACEHOLDER_SVG;
  }

  const trimmed = url.trim();
  if (!trimmed || trimmed === '/favicon.ico') {
    return VEHICLE_PLACEHOLDER_SVG;
  }

  // Already a data URI or local svg
  if (trimmed.startsWith('data:') || trimmed.endsWith('.svg')) {
    return trimmed;
  }

  const width = resolveImageWidth(preset);

  // 1. Unsplash: Convert massive original camera images (3-5MB) into sized WebP/AVIF (~20-40KB)
  if (trimmed.includes('images.unsplash.com')) {
    const [base] = trimmed.split('?');
    return `${base}?auto=format&fit=crop&w=${width}&q=${quality}`;
  }

  // 2. Cloudinary: Insert auto-format (f_auto), optimal compression (q_auto), and max width
  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/image/upload/')) {
    const parts = trimmed.split('/image/upload/');
    if (parts.length === 2) {
      const prefix = parts[0] + '/image/upload/';
      let suffix = parts[1];

      // Remove existing resizing/format transformations to avoid chaining duplicates
      if (/^(f_|w_|c_|q_)/.test(suffix)) {
        suffix = suffix.replace(/^[^/]+\//, '');
      }

      return `${prefix}f_auto,q_auto:good,w_${width},c_limit/${suffix}`;
    }
  }

  return trimmed;
}

/**
 * Handles image loading failures gracefully by falling back to the lightweight SVG placeholder.
 */
export function handleImageFallback(event: Event): void {
  const target = event.target as HTMLImageElement;
  if (target && target.src !== VEHICLE_PLACEHOLDER_SVG) {
    target.src = VEHICLE_PLACEHOLDER_SVG;
  }
}
