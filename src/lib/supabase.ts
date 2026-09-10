import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// RESTORED: These must exist for ScrollSequence.tsx to compile
export const SCROLL_SEQUENCE_BUCKET = 'hero-sequence';
export const PORTFOLIO_BUCKET = 'media';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Transforms a Supabase Storage URL using the Supabase Image Transformation API.
 * Converts raw storage object URLs (/storage/v1/object/public/) to optimized render URLs
 * (/storage/v1/render/image/public/) with WebP format, constrained dimensions, and quality settings.
 *
 * NOTE: Supabase Image Transformation requires a Supabase Pro plan ($25/mo).
 * On the Free plan, Supabase returns HTTP 403 ("feature not enabled for this tenant").
 * Set VITE_SUPABASE_TRANSFORM=true in your .env when on a Pro plan to enable it.
 */
const isSupabaseTransformEnabled = import.meta.env.VITE_SUPABASE_TRANSFORM === 'true';

export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: ImageTransformOptions = { width: 500, quality: 75, format: 'webp' }
): string {
  if (!url || typeof url !== 'string') return '';

  const {
    width = 500,
    quality = 75,
    format = 'webp',
  } = options;

  // 1. If Supabase Pro Image Transformation is explicitly enabled:
  if (isSupabaseTransformEnabled && url.includes('/storage/v1/object/public/')) {
    return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + `?width=${width}&quality=${quality}&format=${format}`;
  }

  // 2. For Supabase storage URLs on Free tier:
  // Convert massive raw JPEGs (1-3MB) into tiny WebP thumbnails (20-30KB) via Cloudflare-backed wsrv.nl CDN.
  // If wsrv.nl ever fails, all our <img> components have onError handlers that immediately fall back to the original URL.
  if (url.includes('.supabase.co/storage/v1/object/public/')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=${quality}&output=${format}`;
  }

  return url;
}
