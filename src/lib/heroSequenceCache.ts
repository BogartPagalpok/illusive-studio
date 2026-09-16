import { supabase, SCROLL_SEQUENCE_BUCKET, isSupabaseConfigured } from './supabase';

export const TOTAL_FRAMES = 288;
const MIN_FRAMES_TO_LAUNCH = 20; // First 20 frames ensure instantaneous initial scroll response

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
      // 1. Paint frame 0 immediately
      await this.loadSingleFrame(0);

      // 2. Concurrently load the essential startup window (1..19)
      const startupBatch: Promise<boolean>[] = [];
      for (let i = 1; i < MIN_FRAMES_TO_LAUNCH; i++) {
        startupBatch.push(this.loadSingleFrame(i));
      }
      await Promise.all(startupBatch);
      this.isReady = true;
      this.notify();

      // 3. Continuously stream all remaining frames (20..287) in a steady worker pool
      // Keyframes (every 4th frame) are queued first, then all intermediate frames
      const keyframes: number[] = [];
      const intermediate: number[] = [];
      for (let i = MIN_FRAMES_TO_LAUNCH; i < TOTAL_FRAMES; i++) {
        if (i % 4 === 0) {
          keyframes.push(i);
        } else {
          intermediate.push(i);
        }
      }
      const queue = [...keyframes, ...intermediate];

      const CONCURRENCY = 6;
      let currentIndex = 0;
      const worker = async () => {
        while (currentIndex < queue.length) {
          const idx = queue[currentIndex++];
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
    const progress = Math.min(1, this.loadedCount / MIN_FRAMES_TO_LAUNCH);
    this.listeners.forEach((fn) => fn(progress, this.isReady));
  }

  subscribe(fn: (progress: number, ready: boolean) => void): () => void {
    this.listeners.push(fn);
    fn(Math.min(1, this.loadedCount / MIN_FRAMES_TO_LAUNCH), this.isReady);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }
}

export const heroSequenceCache = new HeroSequenceCache();
