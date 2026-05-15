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
    bgPrimary: '#FDFFFC',
    bgSecondary: '#F1F4F9',
    accent: '#235789',
    bgGradient: 'radial-gradient(circle at 0% 0%, rgba(35, 87, 137, 0.08) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(193, 41, 46, 0.08) 0%, transparent 40%)',
    textPrimary: '#161925',
    textSecondary: '#235789',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'IMPACT',
    name: 'IMPACT',
    tagline: 'EVA UNIT-01',
    bgPrimary: '#0A0118',
    bgSecondary: '#1A0B2E', 
    accent: '#BFFF00',
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
    id: 'MAGMA',
    name: 'MAGMA',
    tagline: 'INDUSTRIAL CYBERPUNK',
    bgPrimary: '#050303',
    bgSecondary: '#1A0A0A',
    accent: '#FF4500',
    bgGradient: 'radial-gradient(circle at 50% -20%, rgba(255, 69, 0, 0.15) 0%, transparent 70%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#FF4500',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'TOXIC',
    name: 'TOXIC',
    tagline: 'TECHWEAR ACID',
    bgPrimary: '#030503',
    bgSecondary: '#0A120A',
    accent: '#D4FF00',
    bgGradient: 'radial-gradient(circle at 0% 100%, rgba(212, 255, 0, 0.1) 0%, transparent 60%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#D4FF00',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'OCEAN',
    name: 'OCEAN',
    tagline: 'DEEP SEA CRYPTO',
    bgPrimary: '#010609',
    bgSecondary: '#05161E',
    accent: '#00FFFF',
    bgGradient: 'linear-gradient(180deg, rgba(1, 6, 9, 1) 0%, rgba(0, 255, 255, 0.05) 100%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#00FFFF',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'GOLD',
    name: 'GOLD',
    tagline: 'METALLIC LUXURY',
    bgPrimary: '#050402',
    bgSecondary: '#141108',
    accent: '#FFD700',
    bgGradient: 'radial-gradient(ellipse at top right, rgba(255, 215, 0, 0.1) 0%, transparent 60%)',
    textPrimary: '#FFD700',
    textSecondary: '#A68A00',
    fontDisplay: "'Montserrat', sans-serif",
    fontSans: "'Open Sans', sans-serif",
  },
  {
    id: 'SYNTH',
    name: 'SYNTH',
    tagline: 'RETROWAVE PINK',
    bgPrimary: '#070205',
    bgSecondary: '#1A0612',
    accent: '#FF0080',
    bgGradient: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 128, 0.1) 0%, transparent 100%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#FF0080',
    fontDisplay: "'Syne', sans-serif",
    fontSans: "'Raleway', sans-serif",
  },
  {
    id: 'ICE',
    name: 'ICE',
    tagline: 'ARCTIC FROST',
    bgPrimary: '#020508',
    bgSecondary: '#0A121A',
    accent: '#87CEFA',
    bgGradient: 'linear-gradient(to bottom, transparent, rgba(135, 206, 250, 0.05))',
    textPrimary: '#FFFFFF',
    textSecondary: '#87CEFA',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'BRUTAL',
    name: 'BRUTAL',
    tagline: 'MONOCHROME',
    bgPrimary: '#000000',
    bgSecondary: '#111111',
    accent: '#FFFFFF',
    bgGradient: 'none',
    textPrimary: '#FFFFFF',
    textSecondary: '#888888',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontSans: "'Inter', sans-serif",
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
  const isLight = getContrastYIQ(theme.bgPrimary) === 'black';

  root.style.setProperty('--bg-primary', theme.bgPrimary);
  root.style.setProperty('--bg-secondary', theme.bgSecondary);
  root.style.setProperty('--bg-gradient', theme.bgGradient);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--font-display', theme.fontDisplay);
  root.style.setProperty('--font-sans', theme.fontSans);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
  };
  root.style.setProperty('--accent-rgb', hexToRgb(theme.accent));

  // Adaptive Glass logic for visual satisfaction
  root.style.setProperty('--glass-bg', isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)');
  root.style.setProperty('--glass-border', isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)');
  root.style.setProperty('--accent-contrast', getContrastYIQ(theme.accent) === 'white' ? '#FFFFFF' : '#000000');

  localStorage.setItem('portfolio-theme', theme.id);
  window.dispatchEvent(new Event('storage'));
  setTimeout(() => { ScrollTrigger.refresh(); }, 150);

  if (syncToCloud) {
    try {
      await supabase.from('site_config').update({ active_theme: theme.id, updated_at: new Date().toISOString() }).eq('id', 1);
    } catch (err) { console.error(err); }
  }
}

export async function loadSavedTheme() {
  const localThemeId = localStorage.getItem('portfolio-theme');
  const theme = themePresets.find(t => t.id === localThemeId) || themePresets[0];
  applyTheme(theme, false);
}

export function subscribeToThemeChanges() {
  return supabase.channel('global-theme-changes').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_config', filter: 'id=eq.1' }, (payload) => {
    const theme = themePresets.find(t => t.id === payload.new.active_theme);
    if (theme) applyTheme(theme, false);
  }).subscribe();
}
