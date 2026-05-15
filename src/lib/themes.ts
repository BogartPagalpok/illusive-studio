import { supabase } from '../lib/supabase';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
}

export const themePresets: ThemePreset[] = [
  {
    id: 'GUNDAM',
    name: 'GUNDAM',
    tagline: 'RX-78-2 PROTOTYPE',
    colors: ['#FDFFFC', '#235789', '#C1292E', '#F1D302', '#161925'],
    bgPrimary: '#FDFFFC',
    bgSecondary: '#F2F5F7',
    textPrimary: '#161925',
    textSecondary: '#235789',
    accent: '#235789',
    bgGradient: 'linear-gradient(135deg, #FDFFFC 0%, #E2E8F0 100%)',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'JetBrains Mono', monospace",
  },
  {
    id: 'EUCALYPTUS',
    name: 'EUCALYPTUS',
    tagline: 'INDUSTRIAL NATURE',
    colors: ['#FC931F', '#F67608', '#020C0F', '#053A41', '#044F58', '#1C7C84', '#2A9DA6'],
    bgPrimary: '#020C0F',
    bgSecondary: '#053A41',
    textPrimary: '#2A9DA6',
    textSecondary: '#FC931F',
    accent: '#FC931F',
    bgGradient: 'radial-gradient(circle at top right, #053A41 0%, #020C0F 100%)',
    fontDisplay: "'Syne', sans-serif",
    fontSans: "'Space Grotesk', sans-serif",
  },
  {
    id: 'AKIRA',
    name: 'AKIRA',
    tagline: 'NEO-TOKYO 1988',
    colors: ['#F2C230', '#F2921D', '#F24F13', '#8082A6', '#46334F'],
    bgPrimary: '#46334F',
    bgSecondary: '#302436',
    textPrimary: '#F2C230',
    textSecondary: '#F24F13',
    accent: '#F24F13',
    bgGradient: 'linear-gradient(180deg, #46334F 0%, #2A1E30 100%)',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'EVA-01',
    name: 'EVA-01',
    tagline: 'TEST TYPE UNIT-01',
    colors: ['#000000', '#5C6FC6', '#46334F', '#9FD700', '#F1D302'],
    bgPrimary: '#000000',
    bgSecondary: '#0A0118',
    textPrimary: '#9FD700',
    textSecondary: '#5C6FC6',
    accent: '#9FD700',
    bgGradient: 'radial-gradient(circle at center, #1A0B2E 0%, #000000 100%)',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'JetBrains Mono', monospace",
  },
  {
    id: 'TACTICAL',
    name: 'TACTICAL',
    tagline: 'RECON SPEC',
    colors: ['#1C1D22', '#313B44', '#606467', '#AAA8AD', '#E62815', '#8B4944'],
    bgPrimary: '#1C1D22',
    bgSecondary: '#313B44',
    textPrimary: '#AAA8AD',
    textSecondary: '#E62815',
    accent: '#E62815',
    bgGradient: 'linear-gradient(135deg, #1C1D22 0%, #0F0F12 100%)',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Share Tech Mono', monospace",
  },
  {
    id: 'LOTUS',
    name: 'LOTUS BLUE',
    tagline: 'ENDLESS & CAPTIVATING',
    colors: ['#0B2249', '#7184CB', '#133C6F', '#2C5C93', '#5985BD', '#0C1F41'],
    bgPrimary: '#0B2249',
    bgSecondary: '#0C1F41',
    textPrimary: '#5985BD',
    textSecondary: '#7184CB',
    accent: '#7184CB',
    bgGradient: 'radial-gradient(circle at center, #133C6F 0%, #0B2249 100%)',
    fontDisplay: "'Montserrat', sans-serif",
    fontSans: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'AURORA',
    name: 'AURORA FOREST',
    tagline: 'ENIGMATIC & PASSIONATE',
    colors: ['#053931', '#CBEFEB', '#48A89A', '#00524D', '#072928'],
    bgPrimary: '#053931',
    bgSecondary: '#072928',
    textPrimary: '#CBEFEB',
    textSecondary: '#48A89A',
    accent: '#CBEFEB',
    bgGradient: 'linear-gradient(180deg, #053931 0%, #00524D 100%)',
    fontDisplay: "'Syne', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'MIDNIGHT',
    name: 'MIDNIGHT ROSE',
    tagline: 'ROMANTIC AND DREAMY',
    colors: ['#6A0409', '#9D3737', '#E12D33', '#9E2029', '#9C4722'],
    bgPrimary: '#6A0409',
    bgSecondary: '#9E2029',
    textPrimary: '#E12D33',
    textSecondary: '#9C4722',
    accent: '#E12D33',
    bgGradient: 'radial-gradient(circle at 50% 50%, #9D3737 0%, #6A0409 100%)',
    fontDisplay: "'Montserrat', sans-serif",
    fontSans: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'VIOLET-A',
    name: 'VIOLET NIGHT',
    tagline: 'DEEP GRADIENT',
    colors: ['#2D1C42', '#004AAD', '#5C6FC6', '#2F236B', '#7A5498'],
    bgPrimary: '#2D1C42',
    bgSecondary: '#2F236B',
    textPrimary: '#5C6FC6',
    textSecondary: '#7A5498',
    accent: '#004AAD',
    bgGradient: 'linear-gradient(180deg, #2D1C42 0%, #1A0B2E 100%)',
    fontDisplay: "'Syne', sans-serif",
    fontSans: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'VIOLET-B',
    name: 'VIOLET GOLD',
    tagline: 'ROYAL COMBINATION',
    colors: ['#2D1C42', '#C88B00', '#E1B983', '#7A5498', '#4D2F70'],
    bgPrimary: '#2D1C42',
    bgSecondary: '#4D2F70',
    textPrimary: '#E1B983',
    textSecondary: '#C88B00',
    accent: '#C88B00',
    bgGradient: 'radial-gradient(circle at top center, #4D2F70 0%, #2D1C42 100%)',
    fontDisplay: "'Montserrat', sans-serif",
    fontSans: "'Space Grotesk', sans-serif",
  },
  {
    id: 'ALONE',
    name: 'ALONE',
    tagline: 'TEAL OBSIDIAN',
    colors: ['#0E2931', '#12484C', '#2B7574', '#861211', '#E2E2E0'],
    bgPrimary: '#0E2931',
    bgSecondary: '#12484C',
    textPrimary: '#E2E2E0',
    textSecondary: '#861211',
    accent: '#861211',
    bgGradient: 'linear-gradient(180deg, #0E2931 0%, #071A1F 100%)',
    fontDisplay: "'Syne', sans-serif",
    fontSans: "'Space Grotesk', sans-serif",
  },
  {
    id: 'CRIMSON',
    name: 'VIBRANT CRIMSON',
    tagline: 'HIGH CONTRAST',
    colors: ['#1E1E27', '#DF0139', '#E2E2E2', '#28242A'],
    bgPrimary: '#1E1E27',
    bgSecondary: '#28242A',
    textPrimary: '#E2E2E2',
    textSecondary: '#DF0139',
    accent: '#DF0139',
    bgGradient: 'radial-gradient(circle at 100% 0%, rgba(223, 1, 57, 0.1) 0%, transparent 50%)',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'BOTANIC',
    name: 'BOTANIC ACID',
    tagline: 'TOXIC FLORA',
    colors: ['#FFFEEF', '#9FD700', '#446158', '#272C1A'],
    bgPrimary: '#272C1A',
    bgSecondary: '#446158',
    textPrimary: '#FFFEEF',
    textSecondary: '#9FD700',
    accent: '#9FD700',
    bgGradient: 'linear-gradient(180deg, #272C1A 0%, #1A1F11 100%)',
    fontDisplay: "'Syne', sans-serif",
    fontSans: "'JetBrains Mono', monospace",
  },
  {
    id: 'TIBER',
    name: 'TIBER RUST',
    tagline: 'INDUSTRIAL CORROSION',
    colors: ['#173D3C', '#AE3708', '#FB8007', '#FB9D0B', '#E64301'],
    bgPrimary: '#173D3C',
    bgSecondary: '#AE3708',
    textPrimary: '#FB9D0B',
    textSecondary: '#FB8007',
    accent: '#E64301',
    bgGradient: 'radial-gradient(circle at bottom left, #AE3708 0%, #173D3C 100%)',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Space Grotesk', sans-serif",
  },
  {
    id: 'CYBER',
    name: 'CYBER GOLD',
    tagline: 'METALLIC PRECISION',
    colors: ['#4D6473', '#2C4657', '#172531', '#000101', '#C7843B', '#F3BD68'],
    bgPrimary: '#000101',
    bgSecondary: '#172531',
    textPrimary: '#F3BD68',
    textSecondary: '#C7843B',
    accent: '#C7843B',
    bgGradient: 'radial-gradient(circle at 0% 0%, #2C4657 0%, #000101 100%)',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'JetBrains Mono', monospace",
  }
];

// ---------- NEW: WCAG Contrast Utilities ----------
function getLuminance(hex: string): number {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const toLinear = (val: number) =>
    val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function getContrastYIQ(hexcolor: string) {
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}

// ---------- MODIFIED applyTheme with automatic contrast correction ----------
export async function applyTheme(theme: ThemePreset, syncToCloud = true) {
  const root = document.documentElement;
  const isLight = getContrastYIQ(theme.bgPrimary) === 'black';

  // Inject Base Variables
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

  // Adaptive Glass logic
  root.style.setProperty('--glass-bg', isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)');
  root.style.setProperty('--glass-border', isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)');

  // ============ NEW: Automatic Contrast Enforcement ============
  const MIN_CONTRAST = 4.5;
  const bgIsLight = getContrastYIQ(theme.bgPrimary) === 'black';
  const fallbackTextColor = bgIsLight ? '#000000' : '#FFFFFF';

  // Fix --text-primary
  const textPrimaryContrast = getContrastRatio(theme.bgPrimary, theme.textPrimary);
  if (textPrimaryContrast < MIN_CONTRAST) {
    root.style.setProperty('--text-primary', fallbackTextColor);
  }

  // Fix --text-secondary
  const textSecondaryContrast = getContrastRatio(theme.bgPrimary, theme.textSecondary);
  if (textSecondaryContrast < MIN_CONTRAST) {
    root.style.setProperty('--text-secondary', fallbackTextColor);
  }

  // Fix --accent-contrast
  const accentContrastWhite = getContrastRatio(theme.accent, '#FFFFFF');
  const accentContrastBlack = getContrastRatio(theme.accent, '#000000');
  const bestAccentContrast = accentContrastWhite >= accentContrastBlack ? '#FFFFFF' : '#000000';

  if (getContrastRatio(theme.accent, bestAccentContrast) < MIN_CONTRAST) {
    root.style.setProperty('--accent-contrast', fallbackTextColor);
  } else {
    const yiqColor = getContrastYIQ(theme.accent) === 'white' ? '#FFFFFF' : '#000000';
    if (getContrastRatio(theme.accent, yiqColor) >= MIN_CONTRAST) {
      root.style.setProperty('--accent-contrast', yiqColor);
    } else {
      root.style.setProperty('--accent-contrast', bestAccentContrast);
    }
  }
  // ============================================================

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
