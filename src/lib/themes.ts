import { supabase } from '../lib/supabase';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  bgPrimary: string;    // 60%
  bgSecondary: string;  // 30%
  accent: string;       // 10%
  textPrimary: string;
  textSecondary: string;
  fontDisplay: string;
  fontSans: string;
}

export const themePresets: ThemePreset[] = [
  // --- MODERN WEB UI & IMAGE-INSPIRED ---
  {
    id: 'cyber-gaming',
    name: 'Cyber Gaming',
    tagline: 'Gaming & Esports',
    bgPrimary: '#0A0A0A',
    bgSecondary: '#141414',
    accent: '#BFFF00',
    textPrimary: '#FFFFFF',
    textSecondary: '#D1D5DB',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'aurora-forest',
    name: 'Aurora Forest',
    tagline: 'Boreal Glow',
    bgPrimary: '#053531',
    bgSecondary: '#00524D',
    accent: '#CBEFEB',
    textPrimary: '#FFFFFF',
    textSecondary: '#4BA89A',
    fontDisplay: "'Outfit', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'nft-vibe',
    name: 'NFT Vibe',
    tagline: 'Digital Asset',
    bgPrimary: '#000000',
    bgSecondary: '#1A0B2E',
    accent: '#D0FF00',
    textPrimary: '#FEFFFC',
    textSecondary: '#8116E0',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'glamour-tiffany',
    name: 'Glamour Tiffany',
    tagline: 'High-Fashion',
    bgPrimary: '#000000',
    bgSecondary: '#171717',
    accent: '#21F1A8',
    textPrimary: '#F4FFFB',
    textSecondary: '#A3A3A3',
    fontDisplay: "'Syne', sans-serif",
    fontSans: "'Manrope', sans-serif",
  },

  // --- ANIME & GUNDAM INSPIRED ---
  {
    id: 'rx-78-vibe',
    name: 'RX-78-2 Vibe',
    tagline: 'Federation Prototype',
    bgPrimary: '#F3F4F6',   // White Armor
    bgSecondary: '#1E40AF', // Blue Shield
    accent: '#EF4444',      // Red Core
    textPrimary: '#111827',
    textSecondary: '#374151',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'eva-01',
    name: 'Unit-01',
    tagline: 'Berserk Mode',
    bgPrimary: '#0D0221',   // Deep Space
    bgSecondary: '#2D005E', // Eva Purple
    accent: '#A6FF00',      // Neon Green
    textPrimary: '#FFFFFF',
    textSecondary: '#BE95FF',
    fontDisplay: "'Syncopate', sans-serif",
    fontSans: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'demon-slayer',
    name: 'Water Hashira',
    tagline: 'Total Concentration',
    bgPrimary: '#0F172A',   // Midnight
    bgSecondary: '#0E7490', // Deep Water
    accent: '#22D3EE',      // Cyan Slash
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    fontDisplay: "'Shippori Mincho', serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'solo-leveling',
    name: 'Shadow Monarch',
    tagline: 'Arise',
    bgPrimary: '#000000',   // Abyss
    bgSecondary: '#111111', // Shadow
    accent: '#8B5CF6',      // Monarch Glow
    textPrimary: '#FFFFFF',
    textSecondary: '#6B7280',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Manrope', sans-serif",
  },

  // --- MINIMALIST & TECHWEAR ---
  {
    id: 'industrial-tech',
    name: 'Industrial Tech',
    tagline: 'Function First',
    bgPrimary: '#121212',
    bgSecondary: '#1A1A1A',
    accent: '#FF4500',
    textPrimary: '#E5E5E5',
    textSecondary: '#737373',
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
  
  root.style.setProperty('--bg-primary', theme.bgPrimary);
  root.style.setProperty('--bg-secondary', theme.bgSecondary);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--font-display', theme.fontDisplay);
  root.style.setProperty('--font-sans', theme.fontSans);

  const accentContrast = getContrastYIQ(theme.accent);
  root.style.setProperty('--accent-contrast', accentContrast === 'white' ? '#FFFFFF' : '#000000');

  localStorage.setItem('portfolio-theme', theme.id);

  // CRITICAL FIX: Refresh ScrollTrigger after layout/font change
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 150);

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

  const savedId = localStorage.getItem('portfolio-theme');
  const theme = themePresets.find((t) => t.id === (savedId || 'cyber-gaming'));
  if (theme) applyTheme(theme, false);
}
