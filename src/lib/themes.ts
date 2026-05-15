import { supabase } from '../lib/supabase';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  bgPrimary: string;
  bgSecondary: string;
  accent: string;
  bgGradient: string;
  textPrimary: string;
  textSecondary: string;
  fontDisplay: string;
  fontSans: string;
}

export const themePresets: ThemePreset[] = [
  {
    id: 'GUNDAM',
    name: 'GUNDAM',
    tagline: 'RX-78-2 PROTOTYPE',
    bgPrimary: '#F2F4F7', // Mecha Off-White
    bgSecondary: '#FFFFFF',
    accent: '#0055FF', // Cobalt Blue
    bgGradient: 'radial-gradient(circle at 20% 20%, rgba(0, 85, 255, 0.05) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255, 0, 0, 0.05) 0%, transparent 40%)',
    textPrimary: '#1A1A1B',
    textSecondary: '#64748B',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'IMPACT',
    name: 'IMPACT',
    tagline: 'EVA UNIT-01',
    bgPrimary: '#0A0118', // Deep Midnight Purple
    bgSecondary: '#1A0B2E', 
    accent: '#BFFF00', // Neon Lime
    bgGradient: 'radial-gradient(circle at 0% 0%, rgba(45, 28, 66, 0.4) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(241, 211, 2, 0.1) 0%, transparent 50%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#A78BFA',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'AURORA',
    name: 'AURORA',
    tagline: 'ENIGMATIC & PASSIONATE',
    bgPrimary: '#053931',
    bgSecondary: '#072928',
    accent: '#CBEFEB',
    bgGradient: 'radial-gradient(circle at top center, rgba(203, 239, 235, 0.15) 0%, #053931 100%)',
    textPrimary: '#CBEFEB',
    textSecondary: '#48A89A',
    fontDisplay: "'Syne', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'TACTICAL',
    name: 'TACTICAL',
    tagline: 'OPERATOR RED',
    bgPrimary: '#121212',
    bgSecondary: '#1C1C1C',
    accent: '#E62815',
    bgGradient: 'radial-gradient(circle at bottom left, rgba(230, 40, 21, 0.15) 0%, transparent 70%)',
    textPrimary: '#F2F2F2',
    textSecondary: '#808080',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'AMBER_OCEAN',
    name: 'AMBER',
    tagline: 'CLARITY OVER COMPLEXITY',
    bgPrimary: '#000101',
    bgSecondary: '#0A1118',
    accent: '#F3BD68',
    bgGradient: 'radial-gradient(ellipse at top right, rgba(243, 189, 104, 0.1) 0%, transparent 60%)',
    textPrimary: '#F3BD68',
    textSecondary: '#4D6473',
    fontDisplay: "'Montserrat', sans-serif",
    fontSans: "'Open Sans', sans-serif",
  },
  {
    id: 'EUCALYPTUS',
    name: 'EUCALYPTUS',
    tagline: 'TEAL & TANGERINE',
    bgPrimary: '#020C0F',
    bgSecondary: '#051A1F',
    accent: '#FC931F',
    bgGradient: 'linear-gradient(135deg, rgba(2, 12, 15, 1) 0%, rgba(28, 124, 132, 0.2) 100%)',
    textPrimary: '#FC931F',
    textSecondary: '#2A9DA6',
    fontDisplay: "'Anton', sans-serif",
    fontSans: "'Roboto Condensed', sans-serif",
  }
];

function getContrastYIQ(hexcolor: string) {
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}

export async function applyTheme(theme: ThemePreset, syncToCloud = true) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.id);
  
  root.style.setProperty('--bg-primary', theme.bgPrimary);
  root.style.setProperty('--bg-secondary', theme.bgSecondary);
  root.style.setProperty('--bg-gradient', theme.bgGradient);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--font-display', theme.fontDisplay);
  root.style.setProperty('--font-sans', theme.fontSans);

  // Helper for RGB values to use in rgba() CSS functions
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
  };
  root.style.setProperty('--accent-rgb', hexToRgb(theme.accent));

  const accentContrast = getContrastYIQ(theme.accent);
  root.style.setProperty('--accent-contrast', accentContrast === 'white' ? '#FFFFFF' : '#000000');

  localStorage.setItem('portfolio-theme', theme.id);
  window.dispatchEvent(new Event('storage'));
  setTimeout(() => { ScrollTrigger.refresh(); }, 150);

  if (syncToCloud) {
    try {
      await supabase
        .from('site_config')
        .update({ 
          active_theme: theme.id, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', 1);
    } catch (err) {
      console.error("[Theme Sync] Error:", err);
    }
  }
}

export async function loadSavedTheme() {
  const localThemeId = localStorage.getItem('portfolio-theme');
  if (localThemeId) {
    const localTheme = themePresets.find((t) => t.id === localThemeId);
    if (localTheme) applyTheme(localTheme, false);
  }

  try {
    const { data } = await supabase
      .from('site_config')
      .select('active_theme')
      .eq('id', 1)
      .maybeSingle();
    
    if (data?.active_theme && data.active_theme !== localThemeId) {
      const theme = themePresets.find((t) => t.id === data.active_theme);
      if (theme) applyTheme(theme, false);
    }
  } catch (error) {
    console.error("[Theme Load] Error:", error);
  }

  if (!localThemeId && !themePresets.some(t => t.id === 'GUNDAM')) {
      const fallback = themePresets[0];
      if (fallback) applyTheme(fallback, false);
  }
}

export function subscribeToThemeChanges() {
  return supabase
    .channel('global-theme-changes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'site_config', filter: 'id=eq.1' },
      (payload) => {
        const newThemeId = payload.new.active_theme;
        if (newThemeId) {
          const theme = themePresets.find(t => t.id === newThemeId);
          if (theme) applyTheme(theme, false); 
        }
      }
    )
    .subscribe();
}
