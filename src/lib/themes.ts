import { supabase } from '../lib/supabase';

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  bgPrimary: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  fontDisplay: string;
  fontSans: string;
}

export const themePresets: ThemePreset[] = [
  {
    id: 'cyber-gaming', // Based on your 1st Image
    name: 'Cyber Gaming',
    tagline: 'Esports Pro',
    bgPrimary: '#0A0A0A',
    textPrimary: '#FFFFFF',
    textSecondary: '#D1D5DB',
    accent: '#BFFF00', // Electric Lime
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'aurora-forest', // Based on your 5th Image
    name: 'Aurora Forest',
    tagline: 'Boreal Tech',
    bgPrimary: '#053531',
    textPrimary: '#CBEFEB',
    textSecondary: '#4BA89A',
    accent: '#00524D',
    fontDisplay: "'Outfit', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'nft-vibe', // Based on your 3rd Image
    name: 'NFT Vibe',
    tagline: 'Neon Banana',
    bgPrimary: '#000000',
    textPrimary: '#FEFFFC',
    textSecondary: '#8116E0',
    accent: '#D0FF00',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'glamour-tiffany', // Based on your 4th Image
    name: 'Glamour Tiffany',
    tagline: 'Fashion High',
    bgPrimary: '#000000',
    textPrimary: '#F4FFFB',
    textSecondary: '#171717',
    accent: '#21F1A8',
    fontDisplay: "'Syne', sans-serif",
    fontSans: "'Manrope', sans-serif",
  }
];

// HELPER: Check contrast for readability
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
  
  // Apply CSS Variables
  root.style.setProperty('--bg-primary', theme.bgPrimary);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--font-display', theme.fontDisplay);
  root.style.setProperty('--font-sans', theme.fontSans);

  // DYNAMIC READABILITY: Set a contrast variable for buttons/tags
  // This ensures text on top of the ACCENT color is always readable
  const accentContrast = getContrastYIQ(theme.accent);
  root.style.setProperty('--accent-contrast', accentContrast === 'white' ? '#FFFFFF' : '#000000');

  localStorage.setItem('portfolio-theme', theme.id);

  // Sync to Supabase if requested
  if (syncToCloud) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({ id: user.id, theme_id: theme.id, updated_at: new Date() });
    }
  }
}

export async function loadSavedTheme() {
  // 1. Try cloud first (Supabase)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data } = await supabase
      .from('user_preferences')
      .select('theme_id')
      .eq('id', user.id)
      .single();
    
    if (data?.theme_id) {
      const theme = themePresets.find((t) => t.id === data.theme_id);
      if (theme) {
        applyTheme(theme, false);
        return;
      }
    }
  }

  // 2. Fallback to LocalStorage
  const savedId = localStorage.getItem('portfolio-theme');
  const theme = themePresets.find((t) => t.id === (savedId || 'caesar'));
  if (theme) applyTheme(theme, false);
}
