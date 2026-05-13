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
    id: 'VOID',
    name: 'VOID',
    tagline: 'DEEP WEB3 PURPLE',
    bgPrimary: '#0A0A0A',
    bgSecondary: '#141414',
    accent: '#8B5CF6',
    bgGradient: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.1) 0%, rgba(10, 10, 10, 0) 50%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#D1D5DB',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'CLEAN',
    name: 'CLEAN',
    tagline: 'APP INTERFACE',
    bgPrimary: '#F3F4F6',
    bgSecondary: '#FFFFFF',
    accent: '#EF4444',
    bgGradient: 'linear-gradient(135deg, rgba(243, 244, 246, 1) 0%, rgba(229, 231, 235, 1) 100%)',
    textPrimary: '#111827',
    textSecondary: '#374151',
    fontDisplay: "'Inter', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'MAGMA',
    name: 'MAGMA',
    tagline: 'INDUSTRIAL CYBERPUNK',
    bgPrimary: '#0D0202',
    bgSecondary: '#1A0A0A',
    accent: '#FF4500',
    bgGradient: 'radial-gradient(circle at top right, rgba(255, 69, 0, 0.1) 0%, transparent 50%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'TOXIC',
    name: 'TOXIC',
    tagline: 'ACID TECHWEAR',
    bgPrimary: '#050A05',
    bgSecondary: '#0A140A',
    accent: '#BFFF00',
    bgGradient: 'radial-gradient(circle at top right, rgba(191, 255, 0, 0.08) 0%, transparent 50%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#D1D5DB',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'OCEAN',
    name: 'OCEAN',
    tagline: 'DEEP SEA CRYPTO',
    bgPrimary: '#00080B',
    bgSecondary: '#00141A',
    accent: '#22D3EE',
    bgGradient: 'radial-gradient(circle at top right, rgba(34, 211, 238, 0.1) 0%, transparent 50%)',
    textPrimary: '#F4FFFB',
    textSecondary: '#A3A3A3',
    fontDisplay: "'Syne', sans-serif",
    fontSans: "'Manrope', sans-serif",
  },
  {
    id: 'GOLD',
    name: 'GOLD',
    tagline: 'METALLIC LUXURY',
    bgPrimary: '#0A0A05',
    bgSecondary: '#14140A',
    accent: '#D0FF00',
    bgGradient: 'radial-gradient(circle at 50% -20%, rgba(208, 255, 0, 0.1) 0%, transparent 70%)',
    textPrimary: '#FEFFFC',
    textSecondary: '#6B7280',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'SYNTH',
    name: 'SYNTH',
    tagline: 'RETROWAVE NEON',
    bgPrimary: '#0D0221',
    bgSecondary: 'rgba(45, 0, 94, 0.5)',
    accent: '#FF007A',
    bgGradient: 'radial-gradient(circle at bottom left, rgba(255, 0, 122, 0.1) 0%, transparent 100%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#BE95FF',
    fontDisplay: "'Syncopate', sans-serif",
    fontSans: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'GLITCH',
    name: 'GLITCH',
    tagline: 'CRIMSON HACKER',
    bgPrimary: '#000000',
    bgSecondary: 'rgba(17, 17, 17, 0.8)',
    accent: '#EF4444',
    bgGradient: 'radial-gradient(circle at top center, rgba(239, 68, 68, 0.1) 0%, #000 80%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#6B7280',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Manrope', sans-serif",
  },
  {
    id: 'ICE',
    name: 'ICE',
    tagline: 'ARCTIC FROST',
    bgPrimary: '#0F172A',
    bgSecondary: 'rgba(14, 116, 144, 0.3)',
    accent: '#BAE6FD',
    bgGradient: 'linear-gradient(to bottom right, rgba(15, 23, 42, 1) 0%, rgba(14, 116, 144, 0.2) 100%)',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    fontDisplay: "'Outfit', sans-serif",
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

  window.dispatchEvent(new Event('storage'));
  setTimeout(() => { ScrollTrigger.refresh(); }, 150);

  if (syncToCloud) {
    console.log(`[Theme Sync] Attempting to push ${theme.id} to Supabase...`);
    try {
      const { error } = await supabase
        .from('site_config')
        .update({ 
          active_theme: theme.id, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', 1);
        
      if (error) {
        console.error("[Theme Sync] Database blocked the update (Check RLS Policies!):", error.message);
      } else {
        console.log(`[Theme Sync] Successfully saved ${theme.id} to Database!`);
      }
    } catch (err) {
      console.error("[Theme Sync] Network or try/catch failure:", err);
    }
  }
}

export async function loadSavedTheme() {
  console.log("[Theme Load] Fetching initial theme from database...");
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('active_theme')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) {
      console.error("[Theme Load] Failed to fetch theme:", error.message);
    } else if (data?.active_theme) {
      console.log(`[Theme Load] Found theme in DB: ${data.active_theme}`);
      const theme = themePresets.find((t) => t.id === data.active_theme);
      if (theme) {
        applyTheme(theme, false);
        return;
      } else {
        console.warn(`[Theme Load] Theme '${data.active_theme}' not found in presets array!`);
      }
    }
  } catch (error) {
    console.error("[Theme Load] Critical fetch crash:", error);
  }

  console.log("[Theme Load] Falling back to default VOID theme.");
  const defaultTheme = themePresets.find((t) => t.id === 'VOID');
  if (defaultTheme) applyTheme(defaultTheme, false);
}

export function subscribeToThemeChanges() {
  console.log("[Theme Listener] Initializing connection to Supabase Realtime...");
  
  return supabase
    .channel('global-theme-changes')
    .on(
      'postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'site_config', 
        filter: 'id=eq.1' 
      },
      (payload) => {
        console.log("[Theme Listener] Realtime Ping Received!", payload);
        const newThemeId = payload.new.active_theme;
        
        if (newThemeId) {
          const theme = themePresets.find(t => t.id === newThemeId);
          if (theme) {
            console.log(`[Theme Listener] Applying new theme across network: ${theme.id}`);
            applyTheme(theme, false); 
          }
        }
      }
    )
    .subscribe((status, err) => {
      if (err) {
        console.error("[Theme Listener] Failed to connect to channel:", err);
      } else {
        console.log(`[Theme Listener] Channel Status: ${status}`);
      }
    });
}
