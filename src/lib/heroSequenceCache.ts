import { supabase, SCROLL_SEQUENCE_BUCKET, isSupabaseConfigured } from './supabase';

export const TOTAL_FRAMES = 288;
const MIN_FRAMES_TO_LAUNCH = 45; // Frames 0-44 loaded before loader unmounts
const KEYFRAME_STEP = 4; // Distributed keyframes across entire timeline

class HeroSequenceCache {
  images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
  loadedFlags: boolean[] = new Array(TOTAL_FRAMES).fill(false);
  loadedCount = 0;
  isPreloadStarted = false;
  listeners: Array<(progress: number, ready: boolean) => void> = [];
  isReady = false;

  getPublicUrl(index: number): string {
    const frameIndex = String(index).padStart(3, '0');
    const { data } = supabase.storage
      .from(SCROLL_SEQUENCE_BUCKET)
      .getPublicUrl(`frame_${frameIndex}.webp`);
    return data.publicUrl;
  }

  loadSingleFrame(index: number): Promise<boolean> {
    if (this.loadedFlags[index] && this.images[index]?.complete && this.images[index]?.naturalWidth > 0) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = this.getPublicUrl(index);

      img.onload = () => {
        this.images[index] = img;
        if (!this.loadedFlags[index]) {
          this.loadedFlags[index] = true;
          this.loadedCount++;
          this.notify();
        }
        resolve(true);
      };

      img.onerror = () => {
        resolve(false);
      };
    });
  }

  startPreload() {
    if (this.isPreloadStarted || !isSupabaseConfigured) return;
    this.isPreloadStarted = true;

    const run = async () => {
      // 1. First frame (instant paint)
      await this.loadSingleFrame(0);

      // 2. Load critical startup window (0..44) and distributed keyframes in parallel
      const startupPromises: Promise<boolean>[] = [];
      for (let i = 1; i < MIN_FRAMES_TO_LAUNCH; i++) {
        startupPromises.push(this.loadSingleFrame(i));
      }
      for (let k = MIN_FRAMES_TO_LAUNCH; k < TOTAL_FRAMES; k += KEYFRAME_STEP) {
        startupPromises.push(this.loadSingleFrame(k));
      }

      await Promise.all(startupPromises);
      this.isReady = true;
      this.notify();

      // 3. Concurrently stream all remaining in-between frames in parallel worker pools
      const remaining: number[] = [];
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (!this.loadedFlags[i]) {
          remaining.push(i);
        }
      }

      const CONCURRENCY = 8;
      let currentIndex = 0;
      const worker = async () => {
        while (currentIndex < remaining.length) {
          const idx = remaining[currentIndex++];
          if (idx !== undefined) {
            await this.loadSingleFrame(idx);
          }
        }
      };

      const workers = Array.from({ length: CONCURRENCY }, () => worker());
      await Promise.all(workers);
    };

    run();
  }

  getNearestFrame(target: number, lastDrawn: number): number {
    const clampedTarget = Math.max(0, Math.min(TOTAL_FRAMES - 1, target));
    if (this.loadedFlags[clampedTarget] && this.images[clampedTarget]?.complete && this.images[clampedTarget]?.naturalWidth > 0) {
      return clampedTarget;
    }

    // Search outwards from target for nearest loaded frame
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = clampedTarget - offset;
      if (prev >= 0 && this.loadedFlags[prev] && this.images[prev]?.complete && this.images[prev]?.naturalWidth > 0) {
        return prev;
      }
      const next = clampedTarget + offset;
      if (next < TOTAL_FRAMES && this.loadedFlags[next] && this.images[next]?.complete && this.images[next]?.naturalWidth > 0) {
        return next;
      }
    }

    return lastDrawn;
  }

  notify() {
    const targetFramesForLaunch = MIN_FRAMES_TO_LAUNCH + Math.floor((TOTAL_FRAMES - MIN_FRAMES_TO_LAUNCH) / KEYFRAME_STEP);
    const progress = Math.min(1, this.loadedCount / targetFramesForLaunch);
    this.listeners.forEach((fn) => fn(progress, this.isReady));
  }

  subscribe(fn: (progress: number, ready: boolean) => void): () => void {
    this.listeners.push(fn);
    const targetFramesForLaunch = MIN_FRAMES_TO_LAUNCH + Math.floor((TOTAL_FRAMES - MIN_FRAMES_TO_LAUNCH) / KEYFRAME_STEP);
    fn(Math.min(1, this.loadedCount / targetFramesForLaunch), this.isReady);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }
}

export const heroSequenceCache = new HeroSequenceCache();
