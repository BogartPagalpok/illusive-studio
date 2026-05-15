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
  // ... (all your presets remain untouched, exactly as you pasted them) ...
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
  // ... all the rest ...
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

// Existing YIQ helper (unchanged)
function getContrastYIQ(hexcolor: string) {
  hexcolor = hexcolor.replace('#', '');
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

  // Inject Base Variables (just as before)
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

  // Adaptive Glass logic (unchanged)
  root.style.setProperty('--glass-bg', isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)');
  root.style.setProperty('--glass-border', isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)');

  // ============ NEW: Automatic Contrast Enforcement ============
  const MIN_CONTRAST = 4.5;

  // Determine safe fallback text color based on background brightness
  const bgIsLight = getContrastYIQ(theme.bgPrimary) === 'black'; // YIQ: black text on light bg
  const fallbackTextColor = bgIsLight ? '#000000' : '#FFFFFF';

  // Correct --text-primary if needed
  const textPrimaryContrast = getContrastRatio(theme.bgPrimary, theme.textPrimary);
  if (textPrimaryContrast < MIN_CONTRAST) {
    root.style.setProperty('--text-primary', fallbackTextColor);
  }

  // Correct --text-secondary if needed
  const textSecondaryContrast = getContrastRatio(theme.bgPrimary, theme.textSecondary);
  if (textSecondaryContrast < MIN_CONTRAST) {
    root.style.setProperty('--text-secondary', fallbackTextColor);
  }

  // Ensure --accent-contrast has at least 4.5:1 against the accent
  const accentContrastWhite = getContrastRatio(theme.accent, '#FFFFFF');
  const accentContrastBlack = getContrastRatio(theme.accent, '#000000');
  const bestAccentContrast = accentContrastWhite >= accentContrastBlack ? '#FFFFFF' : '#000000';

  if (getContrastRatio(theme.accent, bestAccentContrast) < MIN_CONTRAST) {
    // if even the best is insufficient, fallback to the safe text color
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

// loadSavedTheme and subscribeToThemeChanges remain exactly the same
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
