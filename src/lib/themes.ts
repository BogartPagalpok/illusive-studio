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
  // --- MODERN WEB UI & IMAGE-INSPIRED ---
  {
    id: 'cyber-gaming',
    name: 'Cyber Gaming',
    tagline: 'Gaming & Esports',
    bgPrimary: '#0A0A0A',
    bgSecondary: '#141414',
    accent: '#BFFF00',
    bgGradient: 'radial-gradient(circle at top right, rgba(191, 255, 0, 0.08) 0%, rgba(10, 10, 10, 0) 50%)',
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
    bgSecondary: 'rgba(0, 82, 77, 0.4)',
    accent: '#CBEFEB',
    bgGradient: 'linear-gradient(180deg, rgba(5, 53, 49, 1) 0%, rgba(0, 82, 77, 0.8) 100%)',
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
    bgSecondary: 'rgba(129, 22, 224, 0.15)',
    accent: '#D0FF00',
    bgGradient: 'radial-gradient(circle at 50% -20%, rgba(129, 22, 224, 0.3) 0%, rgba(0,0,0,0) 70%)',
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
    bgSecondary: 'rgba(23, 23, 23, 0.8)',
    accent: '#21F1A8',
    bgGradient: 'radial-gradient(circle at 50% 50%, rgba(33, 241, 168, 0.1) 0%, rgba(0,0,0,0) 60%)',
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
    bgPrimary: '#F3F4F6',   
    bgSecondary: '#FFFFFF', 
    accent: '#EF4444',      
    bgGradient: 'linear-gradient(135deg, rgba(243, 244, 246, 1) 0%, rgba(229, 231, 235, 1) 100%)',
    textPrimary: '#111827',
    textSecondary: '#374151',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'eva-01',
    name: 'Unit-01',
    tagline: 'Berserk Mode',
    bgPrimary: '#0D0221',   
    bgSecondary: 'rgba(45, 0, 94, 0.5)', 
    accent: '#A6FF00',      
    bgGradient: 'radial-gradient(circle at bottom left, rgba(166, 255, 0, 0.1) 0%, rgba(45, 0, 94, 0.2) 40%, rgba(13, 2, 33, 1) 100%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#BE95FF',
    fontDisplay: "'Syncopate', sans-serif",
    fontSans: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'demon-slayer',
    name: 'Water Hashira',
    tagline: 'Total Concentration',
    bgPrimary: '#0F172A',   
    bgSecondary: 'rgba(14, 116, 144, 0.3)', 
    accent: '#22D3EE',      
    bgGradient: 'linear-gradient(to bottom right, rgba(15, 23, 42, 1) 0%, rgba(14, 116, 144, 0.2) 100%)',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    fontDisplay: "'Shippori Mincho', serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'solo-leveling',
    name: 'Shadow Monarch',
    tagline: 'Arise',
    bgPrimary: '#000000',   
    bgSecondary: 'rgba(17, 17, 17, 0.8)', 
    accent: '#8B5CF6',      
    bgGradient: 'radial-gradient(circle at top center, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 1) 80%)',
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
    bgGradient: 'linear-gradient(180deg, rgba(18, 18, 18, 1) 0%, rgba(26, 26, 26, 1) 100%)',
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
  root.style.setProperty('--bg-gradient', theme.bgGradient);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--font-display', theme.fontDisplay);
  root.style.setProperty('--font-sans', theme.fontSans);

  const accentContrast = getContrastYIQ(theme.accent);
  root.style.setProperty('--accent-contrast', accentContrast === 'white' ? '#FFFFFF' : '#000000');

  // Recalculate ScrollTriggers for theme-dependent layouts
  window.dispatchEvent(new Event('storage'));
  setTimeout(() => { ScrollTrigger.refresh(); }, 150);

  if (syncToCloud) {
    try {
      // MASTER SYNC: Overwrite the single global row in site_config
      const { error } = await supabase
        .from('site_config')
        .update({ theme_color: theme.id, updated_at: new Date().toISOString() })
        .eq('id', 1);
        
      if (error) console.error("Sync Error:", error.message);
    } catch (err) {
      console.warn("Cloud sync failed.");
    }
  }
}

export async function loadSavedTheme() {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('theme_color')
      .eq('id', 1)
      .maybeSingle();
    
    if (!error && data?.theme_color) {
      const theme = themePresets.find((t) => t.id === data.theme_color);
      if (theme) {
        applyTheme(theme, false);
        return;
      }
    }
  } catch (error) {
    console.warn("Master Theme fetch failed.");
  }

  // Final fallback
  const defaultTheme = themePresets.find((t) => t.id === 'cyber-gaming');
  if (defaultTheme) applyTheme(defaultTheme, false);
}

// REAL-TIME SYNC: Listens for changes from other devices
export function subscribeToThemeChanges() {
  return supabase
    .channel('global-theme')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'site_config', filter: 'id=eq.1' },
      (payload) => {
        const newThemeId = payload.new.theme_color;
        const theme = themePresets.find(t => t.id === newThemeId);
        if (theme) {
          applyTheme(theme, false); // false to avoid loop
        }
      }
    )
    .subscribe();
}
