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
    id: 'LOTUS',
    name: 'LOTUS',
    tagline: 'ENDLESS & CAPTIVATING',
    bgPrimary: '#0B2249',
    bgSecondary: '#0C1F41',
    accent: '#7184CB',
    bgGradient: 'linear-gradient(180deg, #0B2249 0%, #5985BD 100%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#2C5C93',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'TACTICAL',
    name: 'TACTICAL',
    tagline: 'OPERATOR RED',
    bgPrimary: '#1C1D22',
    bgSecondary: '#313B44',
    accent: '#E62815',
    bgGradient: 'radial-gradient(circle at bottom left, rgba(230, 40, 21, 0.1) 0%, transparent 70%)',
    textPrimary: '#AAA8AD',
    textSecondary: '#606467',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'AMBER_OCEAN',
    name: 'AMBER',
    tagline: 'CLARITY OVER COMPLEXITY',
    bgPrimary: '#000101',
    bgSecondary: '#172531',
    accent: '#F3BD68',
    bgGradient: 'radial-gradient(ellipse at top right, #C7843B 0%, transparent 60%)',
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
    bgSecondary: '#053A41',
    accent: '#FC931F',
    bgGradient: 'linear-gradient(135deg, #020C0F 0%, #2A9DA6 100%)',
    textPrimary: '#FC931F',
    textSecondary: '#1C7C84',
    fontDisplay: "'Anton', sans-serif",
    fontSans: "'Roboto Condensed', sans-serif",
  },
  {
    id: 'IMPACT',
    name: 'IMPACT',
    tagline: 'EVA UNIT-01',
    bgPrimary: '#000000',
    bgSecondary: '#2D1C42',
    accent: '#BFFF00',
    bgGradient: 'radial-gradient(circle at top right, rgba(191, 255, 0, 0.1) 0%, transparent 100%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#7A5498',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'CRIMSON',
    name: 'CRIMSON',
    tagline: 'MIDNIGHT ROSE & CLAY',
    bgPrimary: '#0D0202',
    bgSecondary: '#6A0409',
    accent: '#E12D33',
    bgGradient: 'linear-gradient(180deg, #0D0202 0%, #6A0409 100%)',
    textPrimary: '#FDFBFA',
    textSecondary: '#9D3737',
    fontDisplay: "'Playfair Display', serif",
    fontSans: "'Raleway', sans-serif",
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

  if (!localThemeId && !themePresets.some(t => t.id === 'VOID')) {
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
