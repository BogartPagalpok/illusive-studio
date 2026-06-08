import { useEffect, useState, useCallback } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ThemeModeToggle — WCAG-safe smart light/dark override.
 *
 * Strategy:
 *  - Reads the theme's accent color set by your themes.ts.
 *  - For the requested mode (light/dark), picks bg + text values.
 *  - Computes the WCAG contrast ratio of accent vs. bg. If it fails 4.5:1
 *    (AA standard for text/UI), iteratively darkens/lightens the accent
 *    until it passes. This guarantees buttons, links, and accent text
 *    are always readable regardless of which theme is active.
 *  - Stores the *original* accent as --accent-decorative so the WebGL
 *    background and glows can still use the punchy original color.
 *  - Body and secondary text colors are picked to pass AAA (>7:1) on the
 *    chosen bg.
 *
 * State: 'dark' | 'light' | 'system' stored in localStorage.
 */

type Mode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'mode-override';
const WCAG_AA_NORMAL = 4.5; // AA for text & UI components
const MAX_ITERATIONS = 30;
const STEP = 0.06; // 6% per step

// ── color utilities ───────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '');
  const m = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleaned);
  if (!m) return [128, 128, 128];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** WCAG relative luminance (per W3C spec) */
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors */
function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

/**
 * Given a foreground and background, return a variant of the foreground
 * that meets the target contrast ratio. Walks darker if bg is light,
 * lighter if bg is dark. Falls back to pure black/white if it can't reach.
 */
function ensureContrast(fg: string, bg: string, target = WCAG_AA_NORMAL): string {
  if (contrastRatio(fg, bg) >= target) return fg;

  const bgIsLight = relativeLuminance(bg) > 0.5;
  let current = fg;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    current = bgIsLight ? darken(current, STEP) : lighten(current, STEP);
    if (contrastRatio(current, bg) >= target) return current;
  }
  // Couldn't reach target — fallback to maximum-contrast color
  return bgIsLight ? '#000000' : '#FFFFFF';
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

// ── core: WCAG-safe mode override ─────────────────────────
function applyModeOverride(targetMode: 'light' | 'dark') {
  const root = document.documentElement;
  const cs = getComputedStyle(root);

  // Pull the theme's true accent. We also stash it as --accent-decorative
  // so visuals that don't need contrast (WebGL bg, glows) keep the punch.
  const originalAccent = (cs.getPropertyValue('--accent-decorative').trim() ||
    cs.getPropertyValue('--accent').trim() ||
    '#9D00FF');

  // Pick mode-appropriate bg + base text. These are tuned for AAA contrast.
  let bgPrimary: string;
  let bgSecondary: string;
  let textPrimary: string;     // body — should be >= 7:1 (AAA)
  let textSecondary: string;   // secondary — should be >= 4.5:1 (AA)
  let glassBg: string;
  let glassBorder: string;

  if (targetMode === 'light') {
    bgPrimary = '#F8F8FA';
    bgSecondary = '#EEEEF2';
    textPrimary = '#0A0A0F';      // ~19:1 on bgPrimary  → AAA
    textSecondary = '#4A4A55';    // ~8.2:1 on bgPrimary → AAA
    glassBg = 'rgba(0, 0, 0, 0.04)';
    glassBorder = 'rgba(0, 0, 0, 0.12)';
  } else {
    bgPrimary = '#030305';
    bgSecondary = '#0A0A0F';
    textPrimary = '#FAFAFA';      // ~19:1 on bgPrimary  → AAA
    textSecondary = '#A8A8B0';    // ~7.4:1 on bgPrimary → AAA (was #8E8E93 ~5.3:1)
    glassBg = 'rgba(255, 255, 255, 0.04)';
    glassBorder = 'rgba(255, 255, 255, 0.14)';
  }

  // ── WCAG-enforce the accent ─────────────────────────────
  // Used as text color (section subtitles, links) → needs 4.5:1 vs bg
  // Used as button background → needs 3:1 vs surrounding bg + text on it
  // must also be readable. We solve the harder constraint: 4.5:1 vs bg.
  const safeAccent = ensureContrast(originalAccent, bgPrimary, WCAG_AA_NORMAL);

  // Pick text color that goes ON TOP of the safe accent (e.g. button labels)
  // Try white first, then black, pick whichever has higher contrast.
  const accentContrast =
    contrastRatio('#FFFFFF', safeAccent) >= contrastRatio('#000000', safeAccent)
      ? '#FFFFFF'
      : '#000000';

  // ── Apply everything ────────────────────────────────────
  root.style.setProperty('--bg-primary', bgPrimary);
  root.style.setProperty('--bg-secondary', bgSecondary);
  root.style.setProperty(
    '--bg-gradient',
    targetMode === 'light'
      ? `linear-gradient(135deg, ${bgPrimary} 0%, ${bgSecondary} 100%)`
      : `linear-gradient(135deg, ${bgPrimary} 0%, ${bgSecondary} 100%)`
  );
  root.style.setProperty('--text-primary', textPrimary);
  root.style.setProperty('--text-secondary', textSecondary);
  root.style.setProperty('--glass-bg', glassBg);
  root.style.setProperty('--glass-border', glassBorder);

  // Preserve the original accent for purely decorative uses
  root.style.setProperty('--accent-decorative', originalAccent);
  // Override --accent with the WCAG-safe variant
  root.style.setProperty('--accent', safeAccent);
  root.style.setProperty('--accent-contrast', accentContrast);

  // Refresh --accent-rgb so shadows/glows still tint correctly
  const [r, g, b] = hexToRgb(safeAccent);
  root.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);

  root.setAttribute('data-mode', targetMode);
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

  // Re-apply when the underlying theme changes (admin picks a new theme).
  // Debounced so we don't fight our own MutationObserver.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let applying = false;

    const observer = new MutationObserver(() => {
      if (applying) return;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        applying = true;
        applyModeOverride(resolveMode(mode));
        // small grace period so the observer doesn't loop on our own writes
        setTimeout(() => { applying = false; }, 100);
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

  const cycle = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : prev === 'light' ? 'system' : 'dark'));
  }, []);

  if (!mounted) return null;

  const label =
    mode === 'system'
      ? `Auto (currently ${resolved})`
      : mode === 'dark'
      ? 'Dark mode'
      : 'Light mode';

  // Choose icon based on the CURRENT mode setting (not resolved), so
  // 'system' gets its own monitor icon for clarity.
  const Icon = mode === 'system' ? Monitor : mode === 'dark' ? Moon : Sun;
  const iconKey = mode;

  return (
    <motion.button
      onClick={cycle}
      aria-label={`Toggle color mode. Currently: ${label}. Click to switch.`}
      title={label}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-6 right-6 z-[100] flex items-center justify-center rounded-full border backdrop-blur-xl transition-colors duration-300 focus:outline-none focus-visible:ring-2"
      style={{
        width: 52,
        height: 52,
        backgroundColor: 'var(--glass-bg, rgba(255,255,255,0.06))',
        borderColor: 'var(--glass-border, rgba(255,255,255,0.15))',
        color: 'var(--accent, #9D00FF)',
        boxShadow:
          '0 8px 24px rgba(0,0,0,0.3), 0 0 20px rgba(var(--accent-rgb, 157,0,255), 0.18)',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={iconKey}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          <Icon size={20} strokeWidth={2} aria-hidden="true" />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
