import { supabase } from '../lib/supabase';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  // Mechanical Layering System
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
  }
];
