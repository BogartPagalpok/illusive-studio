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

  // If Supabase Transformation is not enabled on this tenant, return original URL
  // to avoid HTTP 403 (FeatureNotEnabled) errors breaking images.
  if (!isSupabaseTransformEnabled) {
    return url;
  }

  const {
    width = 500,
    quality = 75,
    format = 'webp',
    height,
    resize,
  } = options;

  try {
    const parsed = new URL(url);

    // Transform Supabase storage object URLs to render URLs
    if (parsed.pathname.includes('/storage/v1/object/public/')) {
      parsed.pathname = parsed.pathname.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/'
      );
    } else if (parsed.pathname.includes('/storage/v1/object/sign/')) {
      parsed.pathname = parsed.pathname.replace(
        '/storage/v1/object/sign/',
        '/storage/v1/render/image/sign/'
      );
    }

    // If it's a Supabase render URL (or was just converted above)
    if (parsed.pathname.includes('/storage/v1/render/image/')) {
      if (width) parsed.searchParams.set('width', width.toString());
      if (height) parsed.searchParams.set('height', height.toString());
      if (quality) parsed.searchParams.set('quality', quality.toString());
      if (format) parsed.searchParams.set('format', format);
      if (resize) parsed.searchParams.set('resize', resize);
      return parsed.toString();
    }

    return url;
  } catch {
    // String-based fallback for relative paths or edge-case strings
    if (url.includes('/storage/v1/object/public/')) {
      const replaced = url.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/'
      );
      const separator = replaced.includes('?') ? '&' : '?';
      let params = `width=${width}&quality=${quality}&format=${format}`;
      if (height) params += `&height=${height}`;
      if (resize) params += `&resize=${resize}`;
      return `${replaced}${separator}${params}`;
    }
    return url;
  }
}
