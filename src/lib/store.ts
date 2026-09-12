import { create } from 'zustand';
import { supabase, PORTFOLIO_BUCKET } from './supabase';

export interface ShowreelCardConfig {
  is_coming_soon: boolean;
  webm_url: string;
  youtube_url: string;
}

export interface DualShowreelSettings {
  essay: ShowreelCardConfig;
  gaming: ShowreelCardConfig;
}

export interface PortfolioSection {
  key: string;
  label: string;
  visible: boolean;
}

export const DEFAULT_SECTIONS: PortfolioSection[] = [
  { key: 'dual-showreel', label: 'Dual Showreel', visible: true },
  { key: 'about', label: 'About & Skills', visible: true },
  { key: 'services', label: 'Services', visible: true },
  { key: 'works', label: 'Portfolio Works', visible: true },
  { key: 'growth-marketing-study', label: 'Growth Marketing Study', visible: true },
  { key: 'contact', label: 'Contact', visible: true },
];

export const DEFAULT_DUAL_SHOWREEL: DualShowreelSettings = {
  essay: {
    is_coming_soon: false,
    webm_url: '',
    youtube_url: '',
  },
  gaming: {
    is_coming_soon: false,
    webm_url: '',
    youtube_url: '',
  },
};

const LOCAL_STORAGE_SHOWREEL_KEY = 'portfolio_dual_showreel_config';
const LOCAL_STORAGE_SECTIONS_KEY = 'portfolio_sections_visibility';

function getLocalShowreel(): DualShowreelSettings {
  if (typeof window === 'undefined') return DEFAULT_DUAL_SHOWREEL;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SHOWREEL_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return DEFAULT_DUAL_SHOWREEL;
}

function getLocalSections(): PortfolioSection[] {
  if (typeof window === 'undefined') return DEFAULT_SECTIONS;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SECTIONS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return DEFAULT_SECTIONS;
}

interface PortfolioState {
  sections: PortfolioSection[];
  dualShowreel: DualShowreelSettings;
  isDualShowreelModalOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  hasInitialized: boolean;

  setSections: (sections: PortfolioSection[]) => void;
  toggleSectionVisibility: (key: string) => void;
  setDualShowreelConfig: (config: Partial<DualShowreelSettings>) => void;
  updateDualShowreelCard: (
    card: 'essay' | 'gaming',
    field: keyof ShowreelCardConfig,
    value: boolean | string
  ) => void;
  setDualShowreelModalOpen: (open: boolean) => void;
  fetchSettings: () => Promise<void>;
  deployChanges: () => Promise<{ success: boolean; error?: string }>;
  uploadWebmFile: (file: File) => Promise<string | null>;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  sections: getLocalSections(),
  dualShowreel: getLocalShowreel(),
  isDualShowreelModalOpen: false,
  isLoading: false,
  isSaving: false,
  hasInitialized: false,

  setSections: (sections) => {
    set({ sections });
    try {
      localStorage.setItem(LOCAL_STORAGE_SECTIONS_KEY, JSON.stringify(sections));
    } catch (e) {
      console.warn('Local storage write failed', e);
    }
  },

  toggleSectionVisibility: (key: string) => {
    const nextSections = get().sections.map((sec) =>
      sec.key === key ? { ...sec, visible: !sec.visible } : sec
    );
    // If not found in list, append it
    if (!nextSections.some((s) => s.key === key)) {
      nextSections.push({ key, label: key, visible: true });
    }
    set({ sections: nextSections });
    try {
      localStorage.setItem(LOCAL_STORAGE_SECTIONS_KEY, JSON.stringify(nextSections));
    } catch (e) {
      console.warn('Local storage write failed', e);
    }
  },

  setDualShowreelConfig: (config) => {
    const updated = {
      ...get().dualShowreel,
      ...config,
    };
    set({ dualShowreel: updated });
    try {
      localStorage.setItem(LOCAL_STORAGE_SHOWREEL_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Local storage write failed', e);
    }
  },

  updateDualShowreelCard: (card, field, value) => {
    const current = get().dualShowreel;
    const updated: DualShowreelSettings = {
      ...current,
      [card]: {
        ...current[card],
        [field]: value,
      },
    };
    set({ dualShowreel: updated });
    try {
      localStorage.setItem(LOCAL_STORAGE_SHOWREEL_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Local storage write failed', e);
    }
  },

  setDualShowreelModalOpen: (open) => set({ isDualShowreelModalOpen: open }),

  fetchSettings: async () => {
    if (get().isLoading || get().hasInitialized) return;
    set({ isLoading: true });
    try {
      // 1. Fetch sections visibility
      const { data: sectionData, error: sectionErr } = await supabase
        .from('portfolio_sections')
        .select('key, label, visible')
        .order('key');

      if (!sectionErr && sectionData && sectionData.length > 0) {
        // Merge with DEFAULT_SECTIONS to ensure dual-showreel is present even if DB is missing it
        const merged = DEFAULT_SECTIONS.map((def) => {
          const match = sectionData.find((d) => d.key === def.key);
          return match ? { key: def.key, label: match.label || def.label, visible: match.visible } : def;
        });

        // Add any extra sections from DB
        sectionData.forEach((d) => {
          if (!merged.some((m) => m.key === d.key)) {
            merged.push({ key: d.key, label: d.label, visible: d.visible });
          }
        });

        set({ sections: merged });
        try {
          localStorage.setItem(LOCAL_STORAGE_SECTIONS_KEY, JSON.stringify(merged));
        } catch (e) {
          console.warn('Local storage write failed', e);
        }
      }

      // 2. Fetch DualShowreel settings from portfolio_settings
      const { data: settingsData, error: settingsErr } = await supabase
        .from('portfolio_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!settingsErr && settingsData) {
        const dualConfig: DualShowreelSettings = {
          essay: {
            is_coming_soon: Boolean(settingsData.showreel_essay_is_coming_soon),
            webm_url: settingsData.showreel_essay_webm_url || '',
            youtube_url: settingsData.showreel_essay_youtube_url || '',
          },
          gaming: {
            is_coming_soon: Boolean(settingsData.showreel_gaming_is_coming_soon),
            webm_url: settingsData.showreel_gaming_webm_url || '',
            youtube_url: settingsData.showreel_gaming_youtube_url || '',
          },
        };
        set({ dualShowreel: dualConfig });
        try {
          localStorage.setItem(LOCAL_STORAGE_SHOWREEL_KEY, JSON.stringify(dualConfig));
        } catch (e) {
          console.warn('Local storage write failed', e);
        }
      }
    } catch (err) {
      console.warn('Could not fetch cloud portfolio settings, using local cache:', err);
    } finally {
      set({ isLoading: false, hasInitialized: true });
    }
  },

  deployChanges: async () => {
    set({ isSaving: true });
    const { sections, dualShowreel } = get();

    try {
      // 1. Sync sections visibility to portfolio_sections
      const sectionUpserts = sections.map((sec) => ({
        key: sec.key,
        label: sec.label,
        visible: sec.visible,
        updated_at: new Date().toISOString(),
      }));

      const { error: secError } = await supabase
        .from('portfolio_sections')
        .upsert(sectionUpserts, { onConflict: 'key' });

      if (secError) {
        console.warn('portfolio_sections sync notice:', secError.message);
      }

      // 2. Sync DualShowreel settings to portfolio_settings
      const settingsPayload = {
        id: 'default',
        showreel_essay_is_coming_soon: dualShowreel.essay.is_coming_soon,
        showreel_essay_webm_url: dualShowreel.essay.webm_url,
        showreel_essay_youtube_url: dualShowreel.essay.youtube_url,
        showreel_gaming_is_coming_soon: dualShowreel.gaming.is_coming_soon,
        showreel_gaming_webm_url: dualShowreel.gaming.webm_url,
        showreel_gaming_youtube_url: dualShowreel.gaming.youtube_url,
        updated_at: new Date().toISOString(),
      };

      const { error: setError } = await supabase
        .from('portfolio_settings')
        .upsert(settingsPayload, { onConflict: 'id' });

      if (setError) {
        console.warn('portfolio_settings upsert notice:', setError.message);
      }

      // Keep local storage up to date
      try {
        localStorage.setItem(LOCAL_STORAGE_SECTIONS_KEY, JSON.stringify(sections));
        localStorage.setItem(LOCAL_STORAGE_SHOWREEL_KEY, JSON.stringify(dualShowreel));
      } catch (e) {
        console.warn('Local storage write failed', e);
      }

      set({ isSaving: false });
      return { success: true };
    } catch (err: unknown) {
      set({ isSaving: false });
      const errorMsg = err instanceof Error ? err.message : 'Deployment error';
      return { success: false, error: errorMsg };
    }
  },

  uploadWebmFile: async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop() || 'webm';
      const fileName = `showreel-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `showreels/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from(PORTFOLIO_BUCKET)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: publicData } = supabase.storage
        .from(PORTFOLIO_BUCKET)
        .getPublicUrl(filePath);

      return publicData?.publicUrl || null;
    } catch (err) {
      console.error('Failed to upload webm file to storage:', err);
      return null;
    }
  },
}));
