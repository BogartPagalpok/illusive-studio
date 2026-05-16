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

// ── Theme presets (all 15 original – unchanged) ──────────
export const themePresets: ThemePreset[] = [
  {
    id: 'GUNDAM', name: 'GUNDAM', tagline: 'RX-78-2 PROTOTYPE',
    colors: ['#FFFFFF', '#C1292E', '#235789', '#F1D302', '#0A0A0A'],
    bgPrimary: '#FFFFFF', bgSecondary: '#F0F0F0',
    textPrimary: '#0A0A0A', textSecondary: '#235789',
    accent: '#C1292E',
    bgGradient: 'linear-gradient(135deg, #FFFFFF 0%, #E8ECF0 100%)',
    fontDisplay: "'Orbitron', sans-serif", fontSans: "'JetBrains Mono', monospace",
    backgroundStyle: 'grid',
  },
  {
    id: 'EUCALYPTUS', name: 'EUCALYPTUS', tagline: 'INDUSTRIAL NATURE',
    colors: ['#FC931F', '#F67608', '#020C0F', '#053A41', '#044F58', '#1C7C84', '#2A9DA6'],
    bgPrimary: '#020C0F', bgSecondary: '#053A41',
    textPrimary: '#FFFFFF', textSecondary: '#FC931F',
    accent: '#FC931F',
    bgGradient: 'radial-gradient(circle at top right, #053A41 0%, #020C0F 100%)',
    fontDisplay: "'Syne', sans-serif", fontSans: "'Space Grotesk', sans-serif",
    backgroundStyle: 'gradient',
  },
  {
    id: 'AKIRA', name: 'AKIRA', tagline: 'NEO-TOKYO 1988',
    colors: ['#F2C230', '#F2921D', '#F24F13', '#8082A6', '#46334F'],
    bgPrimary: '#2A1E30', bgSecondary: '#1A1220',
    textPrimary: '#FFFFFF', textSecondary: '#F2C230',
    accent: '#F24F13',
    bgGradient: 'linear-gradient(180deg, #2A1E30 0%, #15101A 100%)',
    fontDisplay: "'Orbitron', sans-serif", fontSans: "'Inter', sans-serif",
    backgroundStyle: 'cinematic',
  },
  {
    id: 'EVA-01', name: 'EVA-01', tagline: 'TEST TYPE UNIT-01',
    colors: ['#000000', '#5C6FC6', '#46334F', '#9FD700', '#F1D302'],
    bgPrimary: '#000000', bgSecondary: '#0A0118',
    textPrimary: '#FFFFFF', textSecondary: '#9FD700',
    accent: '#9FD700',
    bgGradient: 'radial-gradient(circle at center, #1A0B2E 0%, #000000 100%)',
    fontDisplay: "'Orbitron', sans-serif", fontSans: "'JetBrains Mono', monospace",
    backgroundStyle: 'dots',
  },
  {
    id: 'TACTICAL', name: 'TACTICAL', tagline: 'RECON SPEC',
    colors: ['#1C1D22', '#313B44', '#606467', '#AAA8AD', '#E62815', '#8B4944'],
    bgPrimary: '#1C1D22', bgSecondary: '#313B44',
    textPrimary: '#FFFFFF', textSecondary: '#E62815',
    accent: '#E62815',
    bgGradient: 'linear-gradient(135deg, #1C1D22 0%, #0F0F12 100%)',
    fontDisplay: "'Orbitron', sans-serif", fontSans: "'Share Tech Mono', monospace",
    backgroundStyle: 'grid',
  },
  {
    id: 'LOTUS', name: 'LOTUS BLUE', tagline: 'ENDLESS & CAPTIVATING',
    colors: ['#0B2249', '#7184CB', '#133C6F', '#2C5C93', '#5985BD', '#0C1F41'],
    bgPrimary: '#0B2249', bgSecondary: '#0C1F41',
    textPrimary: '#FFFFFF', textSecondary: '#A0B8E0',
    accent: '#A0B8E0',
    bgGradient: 'radial-gradient(circle at center, #133C6F 0%, #0B2249 100%)',
    fontDisplay: "'Montserrat', sans-serif", fontSans: "'Plus Jakarta Sans', sans-serif",
    backgroundStyle: 'glass',
  },
  {
    id: 'AURORA', name: 'AURORA FOREST', tagline: 'ENIGMATIC & PASSIONATE',
    colors: ['#053931', '#CBEFEB', '#48A89A', '#00524D', '#072928'],
    bgPrimary: '#053931', bgSecondary: '#072928',
    textPrimary: '#FFFFFF', textSecondary: '#CBEFEB',
    accent: '#CBEFEB',
    bgGradient: 'linear-gradient(180deg, #053931 0%, #00524D 100%)',
    fontDisplay: "'Syne', sans-serif", fontSans: "'Inter', sans-serif",
    backgroundStyle: 'gradient',
  },
  {
    id: 'MIDNIGHT', name: 'MIDNIGHT ROSE', tagline: 'ROMANTIC AND DREAMY',
    colors: ['#6A0409', '#9D3737', '#E12D33', '#9E2029', '#9C4722'],
    bgPrimary: '#3A0205', bgSecondary: '#4A0508',
    textPrimary: '#FFFFFF', textSecondary: '#FF8A80',
    accent: '#FF5252',
    bgGradient: 'radial-gradient(circle at 50% 50%, #6A0409 0%, #3A0205 100%)',
    fontDisplay: "'Montserrat', sans-serif", fontSans: "'Plus Jakarta Sans', sans-serif",
    backgroundStyle: 'cinematic',
  },
  {
    id: 'VIOLET-A', name: 'VIOLET NIGHT', tagline: 'DEEP GRADIENT',
    colors: ['#2D1C42', '#004AAD', '#5C6FC6', '#2F236B', '#7A5498'],
    bgPrimary: '#1A0C2E', bgSecondary: '#2F236B',
    textPrimary: '#FFFFFF', textSecondary: '#A0B0E8',
    accent: '#A0B0E8',
    bgGradient: 'linear-gradient(180deg, #1A0C2E 0%, #0E0618 100%)',
    fontDisplay: "'Syne', sans-serif", fontSans: "'Plus Jakarta Sans', sans-serif",
    backgroundStyle: 'noise',
  },
  {
    id: 'VIOLET-B', name: 'VIOLET GOLD', tagline: 'ROYAL COMBINATION',
    colors: ['#2D1C42', '#C88B00', '#E1B983', '#7A5498', '#4D2F70'],
    bgPrimary: '#1A0C2E', bgSecondary: '#4D2F70',
    textPrimary: '#FFFFFF', textSecondary: '#E1B983',
    accent: '#E1B983',
    bgGradient: 'radial-gradient(circle at top center, #4D2F70 0%, #1A0C2E 100%)',
    fontDisplay: "'Montserrat', sans-serif", fontSans: "'Space Grotesk', sans-serif",
    backgroundStyle: 'glass',
  },
  {
    id: 'ALONE', name: 'ALONE', tagline: 'TEAL OBSIDIAN',
    colors: ['#0E2931', '#12484C', '#2B7574', '#861211', '#E2E2E0'],
    bgPrimary: '#071A1F', bgSecondary: '#12484C',
    textPrimary: '#FFFFFF', textSecondary: '#FF6B6B',
    accent: '#FF6B6B',
    bgGradient: 'linear-gradient(180deg, #0E2931 0%, #071A1F 100%)',
    fontDisplay: "'Syne', sans-serif", fontSans: "'Space Grotesk', sans-serif",
    backgroundStyle: 'noise',
  },
  {
    id: 'CRIMSON', name: 'VIBRANT CRIMSON', tagline: 'HIGH CONTRAST',
    colors: ['#1E1E27', '#DF0139', '#E2E2E2', '#28242A'],
    bgPrimary: '#1E1E27', bgSecondary: '#28242A',
    textPrimary: '#FFFFFF', textSecondary: '#FF4D6A',
    accent: '#FF4D6A',
    bgGradient: 'radial-gradient(circle at 100% 0%, rgba(255, 77, 106, 0.15) 0%, transparent 50%)',
    fontDisplay: "'Orbitron', sans-serif", fontSans: "'Inter', sans-serif",
    backgroundStyle: 'cinematic',
  },
  {
    id: 'BOTANIC', name: 'BOTANIC ACID', tagline: 'TOXIC FLORA',
    colors: ['#FFFEEF', '#9FD700', '#446158', '#272C1A'],
    bgPrimary: '#272C1A', bgSecondary: '#446158',
    textPrimary: '#FFFFFF', textSecondary: '#B8FF24',
    accent: '#B8FF24',
    bgGradient: 'linear-gradient(180deg, #272C1A 0%, #1A1F11 100%)',
    fontDisplay: "'Syne', sans-serif", fontSans: "'JetBrains Mono', monospace",
    backgroundStyle: 'dots',
  },
  {
    id: 'TIBER', name: 'TIBER RUST', tagline: 'INDUSTRIAL CORROSION',
    colors: ['#173D3C', '#AE3708', '#FB8007', '#FB9D0B', '#E64301'],
    bgPrimary: '#0D2625', bgSecondary: '#AE3708',
    textPrimary: '#FFFFFF', textSecondary: '#FB9D0B',
    accent: '#FB9D0B',
    bgGradient: 'radial-gradient(circle at bottom left, #AE3708 0%, #0D2625 100%)',
    fontDisplay: "'Orbitron', sans-serif", fontSans: "'Space Grotesk', sans-serif",
    backgroundStyle: 'gradient',
  },
  {
    id: 'CYBER', name: 'CYBER GOLD', tagline: 'METALLIC PRECISION',
    colors: ['#4D6473', '#2C4657', '#172531', '#000101', '#C7843B', '#F3BD68'],
    bgPrimary: '#000101', bgSecondary: '#172531',
    textPrimary: '#FFFFFF', textSecondary: '#F3BD68',
    accent: '#F3BD68',
    bgGradient: 'radial-gradient(circle at 0% 0%, #2C4657 0%, #000101 100%)',
    fontDisplay: "'Orbitron', sans-serif", fontSans: "'JetBrains Mono', monospace",
    backgroundStyle: 'dots',
  },
];

// ── Helpers ──────────────────────────────────────────────
function getLuminance(hex: string): number {
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

// ── Background renderers (increased visibility) ──────────
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

  // Apply background style
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

  // Supabase sync
  if (syncToCloud) {
    try {
      const { error } = await supabase.from('site_config').upsert({
        id: 1,
        active_theme: theme.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (error) console.warn('Supabase upsert failed:', error.message);
    } catch (err) {
      console.warn('Supabase sync error:', err);
    }
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
