import { useEffect, useState, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ThemeModeToggle — floating bottom-right light/dark mode override.
 *
 * How it works:
 *  - Your existing theme system (themes.ts) sets --bg-primary, --text-primary,
 *    --accent, etc. via inline styles on <html>.
 *  - This toggle does NOT replace your themes. It computes a light or dark
 *    "variant" of whichever theme is currently active by re-mapping ONLY the
 *    background + text variables, leaving --accent and color palette intact.
 *  - The user's choice is saved to localStorage as 'mode-override': 'light' |
 *    'dark' | 'system'. On first visit we follow the OS preference.
 *  - A MutationObserver re-applies the override whenever themes.ts switches
 *    themes, so the modes stay in sync.
 */

type Mode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'mode-override';

// ── color utilities ───────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [255, 255, 255];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${[lr, lg, lb].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const dr = Math.max(0, Math.round(r * (1 - amount)));
  const dg = Math.max(0, Math.round(g * (1 - amount)));
  const db = Math.max(0, Math.round(b * (1 - amount)));
  return `#${[dr, dg, db].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// ── mode resolution ───────────────────────────────────────
function getSystemMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getStoredMode(): Mode {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Mode | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {}
  return 'system';
}

function resolveMode(mode: Mode): 'light' | 'dark' {
  return mode === 'system' ? getSystemMode() : mode;
}

// ── core: derive light/dark variants of the active theme ──
function applyModeOverride(targetMode: 'light' | 'dark') {
  const root = document.documentElement;
  const cs = getComputedStyle(root);

  // Read the theme's accent — this stays the same regardless of mode
  const accent = cs.getPropertyValue('--accent').trim() || '#9D00FF';

  // Read whatever bg/text the theme set so we can detect if it's already
  // matching our target mode (avoids unnecessary work)
  const currentBg = cs.getPropertyValue('--bg-primary').trim() || '#030305';
  const currentBgLuma = getLuminance(currentBg);
  const currentIsLight = currentBgLuma > 0.5;

  if (targetMode === 'light') {
    // Light variant — keep the accent, use very-light bg + dark text
    const bgPrimary = currentIsLight ? currentBg : '#F8F8FA';
    const bgSecondary = lighten(bgPrimary, 0.0) === bgPrimary ? darken(bgPrimary, 0.04) : '#EEEEF2';
    const textPrimary = '#0A0A0F';
    const textSecondary = '#5A5A66';

    root.style.setProperty('--bg-primary', bgPrimary);
    root.style.setProperty('--bg-secondary', bgSecondary);
    root.style.setProperty('--bg-gradient', `linear-gradient(135deg, ${bgPrimary} 0%, ${darken(bgPrimary, 0.05)} 100%)`);
    root.style.setProperty('--text-primary', textPrimary);
    root.style.setProperty('--text-secondary', textSecondary);
    root.style.setProperty('--glass-bg', 'rgba(0, 0, 0, 0.04)');
    root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.10)');
    root.style.setProperty('--accent-contrast', getLuminance(accent) > 0.5 ? '#000000' : '#FFFFFF');
    root.setAttribute('data-mode', 'light');
  } else {
    // Dark variant — keep the accent, use deep bg + light text
    const bgPrimary = !currentIsLight ? currentBg : '#030305';
    const bgSecondary = '#0A0A0F';
    const textPrimary = '#FAFAFA';
    const textSecondary = '#8E8E93';

    root.style.setProperty('--bg-primary', bgPrimary);
    root.style.setProperty('--bg-secondary', bgSecondary);
    root.style.setProperty('--text-primary', textPrimary);
    root.style.setProperty('--text-secondary', textSecondary);
    root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.03)');
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.12)');
    root.style.setProperty('--accent-contrast', getLuminance(accent) > 0.5 ? '#000000' : '#FFFFFF');
    root.setAttribute('data-mode', 'dark');
  }
}

// ── component ─────────────────────────────────────────────
export default function ThemeModeToggle() {
  const [mode, setMode] = useState<Mode>(() => getStoredMode());
  const [mounted, setMounted] = useState(false);

  // Apply on mount + whenever user picks a new mode
  useEffect(() => {
    const resolved = resolveMode(mode);
    applyModeOverride(resolved);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
    setMounted(true);
  }, [mode]);

  // Re-apply when the underlying theme changes (e.g. admin picks a new theme,
  // or themes.ts loads a saved one). We watch <html> style/attribute changes
  // but debounce so we don't fight ourselves.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        applyModeOverride(resolveMode(mode));
      }, 50);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'data-theme'],
    });
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [mode]);

  // Follow OS changes when in 'system' mode
  useEffect(() => {
    if (mode !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => applyModeOverride(getSystemMode());
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mode]);

  const resolved = resolveMode(mode);
  const isDark = resolved === 'dark';

  const cycle = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : prev === 'light' ? 'system' : 'dark'));
  }, []);

  // Avoid hydration flash — render invisible until mounted
  if (!mounted) return null;

  const label =
    mode === 'system'
      ? `Auto (${resolved})`
      : mode === 'dark'
      ? 'Dark mode'
      : 'Light mode';

  return (
    <motion.button
      onClick={cycle}
      aria-label={`Toggle theme mode. Currently: ${label}. Click to switch.`}
      title={label}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-6 right-6 z-[100] flex items-center justify-center rounded-full border backdrop-blur-xl shadow-2xl transition-colors duration-300"
      style={{
        width: 52,
        height: 52,
        backgroundColor: 'var(--glass-bg, rgba(255,255,255,0.06))',
        borderColor: 'var(--glass-border, rgba(255,255,255,0.15))',
        color: 'var(--accent, #9D00FF)',
        boxShadow: `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px var(--glass-border, rgba(255,255,255,0.1)), 0 0 20px rgba(var(--accent-rgb, 157,0,255), 0.15)`,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <Moon size={20} strokeWidth={2} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <Sun size={20} strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tiny indicator dot when in system mode */}
      {mode === 'system' && (
        <span
          className="absolute top-1 right-1 w-2 h-2 rounded-full"
          style={{ backgroundColor: 'var(--accent, #9D00FF)' }}
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
}
