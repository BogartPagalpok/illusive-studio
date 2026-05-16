import { supabase } from '../lib/supabase';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Types ─────────────────────────────────────────────────
export type BackgroundStyle = 'noise' | 'gradient' | 'grid' | 'dots' | 'cinematic' | 'glass' | 'liquid';

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  colors: string[];
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  bgGradient: string;
  fontDisplay: string;
  fontSans: string;
  backgroundStyle: BackgroundStyle;
}

// ── Theme presets ─────────────────────────────────────────
export const themePresets: ThemePreset[] = [
  // … (keep all your existing 15 presets unchanged) …
  {
    id: 'LIQUID',
    name: 'LIQUID DREAM',
    tagline: 'HYPNOTIC FLOW',
    colors: ['#0D0221', '#0F084B', '#26408B', '#A6CFD5', '#C2E7D9'],
    bgPrimary: '#0D0221',
    bgSecondary: '#0F084B',
    textPrimary: '#FFFFFF',
    textSecondary: '#A6CFD5',
    accent: '#A6CFD5',
    bgGradient: 'none',
    fontDisplay: "'Syne', sans-serif",
    fontSans: "'Plus Jakarta Sans', sans-serif",
    backgroundStyle: 'liquid',
  },
];

// ── Helpers (keep yours unchanged) ────────────────────────
function getLuminance(hex: string): number { /* … */ }
function getContrastYIQ(hexcolor: string) { /* … */ }

// ── Existing background renderers ─────────────────────────
function applyNoiseBackground(root: HTMLElement) { /* … */ }
function applyGridBackground(root: HTMLElement) { /* … */ }
function applyDotsBackground(root: HTMLElement) { /* … */ }
function applyCinematicBackground(root: HTMLElement) { /* … */ }
function applyGlassBackground(root: HTMLElement) { /* … */ }
function applyGradientBackground(root: HTMLElement) { /* … */ }

// ── NEW: Liquid background ────────────────────────────────
function applyLiquidBackground() {
  // Remove any previously injected liquid styles
  const oldStyle = document.getElementById('liquid-bg-style');
  if (oldStyle) oldStyle.remove();

  // Create a dedicated style element
  const style = document.createElement('style');
  style.id = 'liquid-bg-style';
  style.textContent = `
    #liquid-bg {
      position: fixed;
      inset: 0;
      z-index: -10;
      overflow: hidden;
      pointer-events: none;
    }
    #liquid-bg::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200vw;
      height: 200vh;
      background:
        radial-gradient(circle at 30% 50%, var(--accent) 0%, transparent 40%),
        radial-gradient(circle at 70% 30%, var(--accent) 0%, transparent 35%),
        radial-gradient(circle at 50% 80%, var(--accent) 0%, transparent 30%);
      filter: blur(100px);
      opacity: 0.12;
      animation: liquid-rotate 40s linear infinite,
                 liquid-scale 12s ease-in-out infinite alternate;
    }
    @keyframes liquid-rotate {
      to { transform: rotate(360deg); }
    }
    @keyframes liquid-scale {
      0%   { transform: scale(1); }
      100% { transform: scale(1.15); }
    }
  `;
  document.head.appendChild(style);

  // Make sure the background container exists
  if (!document.getElementById('liquid-bg')) {
    const bgDiv = document.createElement('div');
    bgDiv.id = 'liquid-bg';
    document.body.prepend(bgDiv);
  }
}

// ── Main theme applier ────────────────────────────────────
export async function applyTheme(theme: ThemePreset, syncToCloud = true) {
  const root = document.documentElement;
  const isLight = getContrastYIQ(theme.bgPrimary) === 'black';

  root.style.setProperty('--bg-primary', theme.bgPrimary);
  root.style.setProperty('--bg-secondary', theme.bgSecondary);
  root.style.setProperty('--bg-gradient', theme.bgGradient);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--font-display', theme.fontDisplay);
  root.style.setProperty('--font-sans', theme.fontSans);

  theme.colors.forEach((color, index) => {
    root.style.setProperty(`--palette-${index + 1}`, color);
  });

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
  };
  root.style.setProperty('--accent-rgb', hexToRgb(theme.accent));

  root.style.setProperty('--glass-bg', isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)');
  root.style.setProperty('--glass-border', isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)');

  const accentYIQ = getContrastYIQ(theme.accent);
  root.style.setProperty('--accent-contrast', accentYIQ === 'black' ? '#000000' : '#FFFFFF');

  // Apply background style (including liquid)
  switch (theme.backgroundStyle) {
    case 'noise':     applyNoiseBackground(root); break;
    case 'grid':      applyGridBackground(root); break;
    case 'dots':      applyDotsBackground(root); break;
    case 'cinematic': applyCinematicBackground(root); break;
    case 'glass':     applyGlassBackground(root); break;
    case 'liquid':    applyLiquidBackground(); break;
    case 'gradient':
    default:          applyGradientBackground(root); break;
  }

  localStorage.setItem('portfolio-theme', theme.id);
  window.dispatchEvent(new Event('storage'));
  setTimeout(() => { ScrollTrigger.refresh(); }, 150);

  if (syncToCloud) {
    try {
      await supabase.from('site_config').update({
        active_theme: theme.id,
        updated_at: new Date().toISOString()
      }).eq('id', 1);
    } catch (err) { console.error(err); }
  }
}

export async function loadSavedTheme() {
  const localThemeId = localStorage.getItem('portfolio-theme');
  const theme = themePresets.find(t => t.id === localThemeId) || themePresets[0];
  applyTheme(theme, false);
}

export function subscribeToThemeChanges() {
  return supabase.channel('global-theme-changes')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'site_config',
      filter: 'id=eq.1'
    }, (payload) => {
      const theme = themePresets.find(t => t.id === payload.new.active_theme);
      if (theme) applyTheme(theme, false);
    }).subscribe();
}
