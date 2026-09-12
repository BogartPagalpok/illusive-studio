import { supabase } from '../lib/supabase';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  textMuted?: string;
  accent: string;
  accentSecondary: string;
  accentTertiary?: string;
  bgGradient: string;
  fontDisplay: string;
  fontSans: string;
  backgroundStyle: BackgroundStyle;
}

export const themePresets: ThemePreset[] = [
  {
    id: 'GUNDAM', name: 'GUNDAM', tagline: 'RX-78-2 PROTOTYPE',
    colors: ['#FFFFFF', '#C1292E', '#235789', '#F1D302', '#38BDF8'],
    bgPrimary: '#111E2E', bgSecondary: '#1B2E44',
    textPrimary: '#FFFFFF', textSecondary: '#CBD5E1', textMuted: '#94A3B8',
    accent: '#C1292E', accentSecondary: '#F1D302', accentTertiary: '#38BDF8',
    bgGradient: 'linear-gradient(135deg, #1B2E44 0%, #111E2E 55%, #0A121C 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'grid',
  },
  {
    id: 'EUCALYPTUS', name: 'EUCALYPTUS', tagline: 'INDUSTRIAL NATURE',
    colors: ['#FC931F', '#2A9DA6', '#F67608', '#053A41', '#1C7C84', '#020C0F'],
    bgPrimary: '#020C0F', bgSecondary: '#053A41',
    textPrimary: '#FFFFFF', textSecondary: '#CBD5E1', textMuted: '#82999B',
    accent: '#FC931F', accentSecondary: '#2A9DA6', accentTertiary: '#F67608',
    bgGradient: 'radial-gradient(circle at top right, #053A41 0%, #020C0F 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'gradient',
  },
  {
    id: 'AKIRA', name: 'AKIRA', tagline: 'NEO-TOKYO 1988',
    colors: ['#F24F13', '#F2C230', '#8082A6', '#F2921D', '#46334F'],
    bgPrimary: '#201625', bgSecondary: '#150E19',
    textPrimary: '#FFFFFF', textSecondary: '#D6D2DC', textMuted: '#968E9E',
    accent: '#F24F13', accentSecondary: '#F2C230', accentTertiary: '#8082A6',
    bgGradient: 'linear-gradient(180deg, #201625 0%, #120C17 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'cinematic',
  },
  {
    id: 'EVA-01', name: 'EVA-01', tagline: 'TEST TYPE UNIT-01',
    colors: ['#9FD700', '#A855F7', '#F1D302', '#5C6FC6', '#000000'],
    bgPrimary: '#05020A', bgSecondary: '#120524',
    textPrimary: '#FFFFFF', textSecondary: '#D1D5DB', textMuted: '#9CA3AF',
    accent: '#9FD700', accentSecondary: '#A855F7', accentTertiary: '#F1D302',
    bgGradient: 'radial-gradient(circle at center, #1A0B2E 0%, #05020A 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'dots',
  },
  {
    id: 'TACTICAL', name: 'TACTICAL', tagline: 'RECON SPEC',
    colors: ['#E62815', '#38BDF8', '#AAA8AD', '#606467', '#1C1D22'],
    bgPrimary: '#141518', bgSecondary: '#242830',
    textPrimary: '#FFFFFF', textSecondary: '#CBD5E1', textMuted: '#94A3B8',
    accent: '#E62815', accentSecondary: '#38BDF8', accentTertiary: '#AAA8AD',
    bgGradient: 'linear-gradient(135deg, #1C1D22 0%, #0F0F12 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'grid',
  },
  {
    id: 'LOTUS', name: 'LOTUS BLUE', tagline: 'ENDLESS & CAPTIVATING',
    colors: ['#5985BD', '#38BDF8', '#C084FC', '#2C5C93', '#0B2249'],
    bgPrimary: '#0B1E3B', bgSecondary: '#0C1F41',
    textPrimary: '#FFFFFF', textSecondary: '#D4E2F5', textMuted: '#8EABC9',
    accent: '#5985BD', accentSecondary: '#38BDF8', accentTertiary: '#C084FC',
    bgGradient: 'radial-gradient(circle at center, #133C6F 0%, #0B1E3B 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'glass',
  },
  {
    id: 'AURORA', name: 'AURORA FOREST', tagline: 'ENIGMATIC & PASSIONATE',
    colors: ['#34D399', '#CBEFEB', '#38BDF8', '#00524D', '#053931'],
    bgPrimary: '#032620', bgSecondary: '#072928',
    textPrimary: '#FFFFFF', textSecondary: '#D1EAE5', textMuted: '#83B8B0',
    accent: '#34D399', accentSecondary: '#CBEFEB', accentTertiary: '#38BDF8',
    bgGradient: 'linear-gradient(180deg, #053931 0%, #002B28 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'gradient',
  },
  {
    id: 'MIDNIGHT', name: 'MIDNIGHT ROSE', tagline: 'ROMANTIC AND DREAMY',
    colors: ['#FF5252', '#FFB74D', '#F472B6', '#9D3737', '#3A0205'],
    bgPrimary: '#250204', bgSecondary: '#3D0508',
    textPrimary: '#FFFFFF', textSecondary: '#F1D5D7', textMuted: '#B88A8E',
    accent: '#FF5252', accentSecondary: '#FFB74D', accentTertiary: '#F472B6',
    bgGradient: 'radial-gradient(circle at 50% 50%, #4D0307 0%, #250204 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'cinematic',
  },
  {
    id: 'VIOLET-A', name: 'VIOLET NIGHT', tagline: 'DEEP GRADIENT',
    colors: ['#A0B0E8', '#38BDF8', '#C084FC', '#2F236B', '#1A0C2E'],
    bgPrimary: '#120820', bgSecondary: '#251545',
    textPrimary: '#FFFFFF', textSecondary: '#DDD6FE', textMuted: '#A78BFA',
    accent: '#A0B0E8', accentSecondary: '#38BDF8', accentTertiary: '#C084FC',
    bgGradient: 'linear-gradient(180deg, #1A0C2E 0%, #0E0618 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'noise',
  },
  {
    id: 'VIOLET-B', name: 'VIOLET GOLD', tagline: 'ROYAL COMBINATION',
    colors: ['#E1B983', '#A78BFA', '#F59E0B', '#7A5498', '#1A0C2E'],
    bgPrimary: '#140924', bgSecondary: '#351954',
    textPrimary: '#FFFFFF', textSecondary: '#E4E0EC', textMuted: '#A399B5',
    accent: '#E1B983', accentSecondary: '#A78BFA', accentTertiary: '#F59E0B',
    bgGradient: 'radial-gradient(circle at top center, #3A185C 0%, #140924 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'glass',
  },
  {
    id: 'ALONE', name: 'ALONE', tagline: 'TEAL OBSIDIAN',
    colors: ['#FF6B6B', '#2DD4BF', '#FBBF24', '#12484C', '#071A1F'],
    bgPrimary: '#051418', bgSecondary: '#0C2D33',
    textPrimary: '#FFFFFF', textSecondary: '#CFDFE2', textMuted: '#819DA2',
    accent: '#FF6B6B', accentSecondary: '#2DD4BF', accentTertiary: '#FBBF24',
    bgGradient: 'linear-gradient(180deg, #0C2D33 0%, #051418 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'noise',
  },
  {
    id: 'CRIMSON', name: 'VIBRANT CRIMSON', tagline: 'HIGH CONTRAST',
    colors: ['#DF0139', '#FF758F', '#38BDF8', '#28242A', '#1E1E27'],
    bgPrimary: '#14141A', bgSecondary: '#222026',
    textPrimary: '#FFFFFF', textSecondary: '#E2E8F0', textMuted: '#94A3B8',
    accent: '#DF0139', accentSecondary: '#FF758F', accentTertiary: '#38BDF8',
    bgGradient: 'radial-gradient(circle at 100% 0%, rgba(223, 1, 57, 0.18) 0%, transparent 60%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'cinematic',
  },
  {
    id: 'BOTANIC', name: 'BOTANIC ACID', tagline: 'TOXIC FLORA',
    colors: ['#9FD700', '#2DD4BF', '#FDE047', '#446158', '#1A1F13'],
    bgPrimary: '#14180E', bgSecondary: '#232918',
    textPrimary: '#FFFFFF', textSecondary: '#D7DFD0', textMuted: '#8E9B85',
    accent: '#9FD700', accentSecondary: '#2DD4BF', accentTertiary: '#FDE047',
    bgGradient: 'linear-gradient(180deg, #232918 0%, #14180E 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'dots',
  },
  {
    id: 'TIBER', name: 'TIBER RUST', tagline: 'INDUSTRIAL CORROSION',
    colors: ['#FB8007', '#2DD4BF', '#FBBF24', '#AE3708', '#0D2625'],
    bgPrimary: '#081A19', bgSecondary: '#133534',
    textPrimary: '#FFFFFF', textSecondary: '#CFE0DE', textMuted: '#7F9E9B',
    accent: '#FB8007', accentSecondary: '#2DD4BF', accentTertiary: '#FBBF24',
    bgGradient: 'radial-gradient(circle at bottom left, #732303 0%, #081A19 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'gradient',
  },
  {
    id: 'CYBER', name: 'CYBER GOLD', tagline: 'METALLIC PRECISION',
    colors: ['#F3BD68', '#38BDF8', '#A78BFA', '#2C4657', '#000101'],
    bgPrimary: '#000101', bgSecondary: '#111A22',
    textPrimary: '#FFFFFF', textSecondary: '#CBD5E1', textMuted: '#94A3B8',
    accent: '#F3BD68', accentSecondary: '#38BDF8', accentTertiary: '#A78BFA',
    bgGradient: 'radial-gradient(circle at 0% 0%, #182733 0%, #000101 100%)',
    fontDisplay: "'Satoshi', sans-serif", fontSans: "'General Sans', sans-serif",
    backgroundStyle: 'dots',
  },
];

// ── Helpers ──────────────────────────────────────────────
export function getLuminance(hex: string): number {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const toLinear = (val: number) =>
    val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastYIQ(hexcolor: string) {
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}

// ── Background renderers ─────────────────────────────────
function applyNoiseBackground(root: HTMLElement) {
  root.style.setProperty('--bg-noise', `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`);
  root.style.setProperty('--bg-pattern', 'var(--bg-noise)');
}

function applyGridBackground(root: HTMLElement) {
  root.style.setProperty('--bg-grid', `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0H0v60' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='0.5'/%3E%3C/svg%3E")`);
  root.style.setProperty('--bg-pattern', 'var(--bg-grid)');
}

function applyDotsBackground(root: HTMLElement) {
  root.style.setProperty('--bg-dots', `radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)`);
  root.style.setProperty('--bg-dots-size', '24px 24px');
  root.style.setProperty('--bg-pattern', 'var(--bg-dots)');
  root.style.setProperty('--bg-pattern-size', 'var(--bg-dots-size)');
}

function applyCinematicBackground(root: HTMLElement) {
  root.style.setProperty('--bg-vignette', `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)`);
  root.style.setProperty('--bg-pattern', 'var(--bg-vignette)');
}

function applyGlassBackground(root: HTMLElement) {
  root.style.setProperty('--bg-glass', `radial-gradient(circle at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)`);
  root.style.setProperty('--bg-pattern', 'var(--bg-glass)');
}

function applyGradientBackground(root: HTMLElement) {
  root.style.setProperty('--bg-pattern', 'none');
}

function applyLiquidBackground() {
  const oldStyle = document.getElementById('liquid-bg-style');
  if (oldStyle) oldStyle.remove();
  const style = document.createElement('style');
  style.id = 'liquid-bg-style';
  style.textContent = `
    #liquid-bg { position: fixed; inset: 0; z-index: -10; overflow: hidden; pointer-events: none; }
    #liquid-bg::before {
      content: ''; position: absolute; top: -50%; left: -50%; width: 200vw; height: 200vh;
      background: radial-gradient(circle at 30% 50%, var(--accent) 0%, transparent 40%),
                  radial-gradient(circle at 70% 30%, var(--accent-secondary) 0%, transparent 35%),
                  radial-gradient(circle at 50% 80%, var(--accent-tertiary, var(--accent)) 0%, transparent 30%);
      filter: blur(100px); opacity: 0.12;
      animation: liquid-rotate 40s linear infinite, liquid-scale 12s ease-in-out infinite alternate;
    }
    @keyframes liquid-rotate { to { transform: rotate(360deg); } }
    @keyframes liquid-scale { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
  `;
  document.head.appendChild(style);
  if (!document.getElementById('liquid-bg')) {
    const bgDiv = document.createElement('div');
    bgDiv.id = 'liquid-bg';
    document.body.prepend(bgDiv);
  }
}

export async function applyTheme(theme: ThemePreset, syncToCloud = true) {
  const root = document.documentElement;
  const isLight = getContrastYIQ(theme.bgPrimary) === 'black';
  root.setAttribute('data-contrast', isLight ? 'light' : 'dark');
  document.body.setAttribute('data-contrast', isLight ? 'light' : 'dark');
  root.style.setProperty('--bg-primary', theme.bgPrimary);
  root.style.setProperty('--bg-secondary', theme.bgSecondary);
  root.style.setProperty('--bg-gradient', theme.bgGradient);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--text-muted', theme.textMuted || 'rgba(255, 255, 255, 0.45)');
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-secondary', theme.accentSecondary);
  root.style.setProperty('--accent-tertiary', theme.accentTertiary || theme.colors[2] || theme.accent);
  root.style.setProperty('--font-display', theme.fontDisplay);
  root.style.setProperty('--font-sans', theme.fontSans);
  theme.colors.forEach((color, index) => root.style.setProperty(`--palette-${index + 1}`, color));
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
  };
  root.style.setProperty('--accent-rgb', hexToRgb(theme.accent));
  root.style.setProperty('--accent-secondary-rgb', hexToRgb(theme.accentSecondary));
  root.style.setProperty('--accent-tertiary-rgb', hexToRgb(theme.accentTertiary || theme.colors[2] || theme.accent));
  root.style.setProperty('--glass-bg', isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)');
  root.style.setProperty('--accent-contrast', getContrastYIQ(theme.accent) === 'black' ? '#000000' : '#FFFFFF');
  root.style.setProperty('--accent-secondary-contrast', getContrastYIQ(theme.accentSecondary) === 'black' ? '#000000' : '#FFFFFF');
  switch (theme.backgroundStyle) {
    case 'noise': applyNoiseBackground(root); break;
    case 'grid': applyGridBackground(root); break;
    case 'dots': applyDotsBackground(root); break;
    case 'cinematic': applyCinematicBackground(root); break;
    case 'glass': applyGlassBackground(root); break;
    case 'liquid': applyLiquidBackground(); break;
    default: applyGradientBackground(root); break;
  }
  localStorage.setItem('portfolio-theme', theme.id);
  window.dispatchEvent(new Event('storage'));
  setTimeout(() => ScrollTrigger.refresh(), 150);
  if (syncToCloud) {
    try {
      await supabase.from('site_config').upsert({ id: 1, active_theme: theme.id, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    } catch {
      // Cloud sync failure is non-fatal; theme is cached locally
    }
  }
}

export async function loadSavedTheme() {
  // 1. Always try Supabase first – this ensures admin's chosen theme is used for new visitors
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('active_theme')
      .eq('id', 1)
      .single();

    if (!error && data?.active_theme) {
      const theme = themePresets.find(t => t.id === data.active_theme);
      if (theme) {
        await applyTheme(theme, false);
        return; // Successfully loaded from Supabase
      }
    }
  } catch {
    console.warn('Could not fetch theme from Supabase, trying localStorage next.');
  }

  // 2. Fallback to localStorage (for returning visitors who already have a theme cached)
  const localThemeId = localStorage.getItem('portfolio-theme');
  if (localThemeId) {
    const theme = themePresets.find(t => t.id === localThemeId);
    if (theme) {
      await applyTheme(theme, false);
      return;
    }
  }

  // 3. Ultimate fallback – a dark theme that looks professional (CYBER)
  const fallbackTheme = themePresets.find(t => t.id === 'CYBER') || themePresets[0];
  await applyTheme(fallbackTheme, false);
}

export function subscribeToThemeChanges() {
  return supabase.channel('global-theme-changes')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_config', filter: 'id=eq.1' }, (payload) => {
      const theme = themePresets.find(t => t.id === payload.new.active_theme);
      if (theme) applyTheme(theme, false);
    }).subscribe();
}
