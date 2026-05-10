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
    id: 'caesar',
    name: 'Project Caesar',
    tagline: 'The Original',
    bgPrimary: '#000000',
    textPrimary: '#FFFFFF',
    textSecondary: '#D1D5DB',
    accent: '#6D001A',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    tagline: 'Night City',
    bgPrimary: '#09090B',
    textPrimary: '#E2E8F0',
    textSecondary: '#94A3B8',
    accent: '#FF007F',
    fontDisplay: "'Orbitron', sans-serif",
    fontSans: "'Inter', sans-serif",
  },
  {
    id: 'matrix-terminal',
    name: 'Matrix Terminal',
    tagline: 'Hacker Vibe',
    bgPrimary: '#000000',
    textPrimary: '#00FF41',
    textSecondary: '#00CC33',
    accent: '#FFFFFF',
    fontDisplay: "'VT323', monospace",
    fontSans: "'Fira Code', monospace",
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    tagline: 'Acid Brutalism',
    bgPrimary: '#111111',
    textPrimary: '#F3F4F6',
    textSecondary: '#9CA3AF',
    accent: '#CCFF00',
    fontDisplay: "'Anton', sans-serif",
    fontSans: "'Manrope', sans-serif",
  },
  {
    id: 'vaporwave-dream',
    name: 'Vaporwave Dream',
    tagline: 'Synthwave',
    bgPrimary: '#1A0B2E',
    textPrimary: '#E0FFFF',
    textSecondary: '#B0C4DE',
    accent: '#00FFFF',
    fontDisplay: "'Syne', sans-serif",
    fontSans: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'industrial-minimalist',
    name: 'Industrial Minimalist',
    tagline: 'Techwear',
    bgPrimary: '#121212',
    textPrimary: '#E5E5E5',
    textSecondary: '#A3A3A3',
    accent: '#FF4500',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontSans: "'Manrope', sans-serif",
  },
  {
    id: 'blood-moon',
    name: 'Blood Moon',
    tagline: 'High-Fashion Gothic',
    bgPrimary: '#0B0000',
    textPrimary: '#B3B3B3',
    textSecondary: '#808080',
    accent: '#DC143C',
    fontDisplay: "'Cinzel', serif",
    fontSans: "'Raleway', sans-serif",
  },
  {
    id: 'tokyo-midnight',
    name: 'Tokyo Midnight',
    tagline: 'City Pop',
    bgPrimary: '#050517',
    textPrimary: '#FFB7C5',
    textSecondary: '#E8A0B0',
    accent: '#00E5FF',
    fontDisplay: "'Montserrat', sans-serif",
    fontSans: "'Roboto', sans-serif",
  },
  {
    id: 'abyssal-deep',
    name: 'Abyssal Deep',
    tagline: 'Oceanic Tech',
    bgPrimary: '#020617',
    textPrimary: '#CCFBF1',
    textSecondary: '#99F6E4',
    accent: '#14B8A6',
    fontDisplay: "'Outfit', sans-serif",
    fontSans: "'Nunito', sans-serif",
  },
  {
    id: 'ethereal-light',
    name: 'Ethereal Light',
    tagline: 'Clean Agency',
    bgPrimary: '#F9F9F9',
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    accent: '#D4AF37',
    fontDisplay: "'Playfair Display', serif",
    fontSans: "'Lato', sans-serif",
  },
];

export function applyTheme(theme: ThemePreset) {
  const root = document.documentElement;
  root.style.setProperty('--bg-primary', theme.bgPrimary);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--font-display', theme.fontDisplay);
  root.style.setProperty('--font-sans', theme.fontSans);
  localStorage.setItem('portfolio-theme', theme.id);
}

export function loadSavedTheme() {
  const savedId = localStorage.getItem('portfolio-theme');
  if (!savedId) return;
  const theme = themePresets.find((t) => t.id === savedId);
  if (theme) applyTheme(theme);
}
