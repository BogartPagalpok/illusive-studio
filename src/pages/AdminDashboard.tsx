import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, Trash2, Upload, Image, Palette, Check } from 'lucide-react';
import { supabase, PORTFOLIO_BUCKET } from '../lib/supabase';
import { themePresets, applyTheme } from '../lib/themes';
import type { ThemePreset } from '../lib/themes';
import MessageManager from '../components/admin/MessageManager';
import SiteContentManager from '../components/admin/SiteContentManager';
import ProjectManager from '../components/admin/ProjectManager';

interface SiteContent {
  id: string;
  section: string;
  key: string;
  value: string;
}

interface Project {
  id?: string;
  title: string;
  category: string;
  description: string;
  process: string;
  tools: string[];
  results: string;
  image_url: string;
  featured: boolean;
}

const emptyProject: Project = {
  title: '',
  category: '',
  description: '',
  process: '',
  tools: [],
  results: '',
  image_url: '',
  featured: true,
};

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<'content' | 'projects' | 'messages' | 'media' | 'theme'>('content');
  const [message, setMessage] = useState('');
  const [activeThemeId, setActiveThemeId] = useState(
    () => localStorage.getItem('portfolio-theme') || 'caesar'
  );

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleThemeSelect = (theme: ThemePreset) => {
    applyTheme(theme);
    setActiveThemeId(theme.id);
    showMessage(`Theme applied: ${theme.name}`);
  };

  const tabs = [
    { key: 'content' as const, label: 'Site Content' },
    { key: 'projects' as const, label: 'Projects' },
    { key: 'messages' as const, label: 'Messages' },
    { key: 'media' as const, label: 'Media' },
    { key: 'theme' as const, label: 'Theme' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'var(--bg-primary)' }}>
        <div className="section-container flex items-center justify-between h-16 sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity font-heading tracking-wider uppercase"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={16} />
              Back to Site
            </button>
            <div className="w-px h-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <h1 className="font-heading font-bold tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>
              Admin Dashboard
            </h1>
          </div>
          <button
            onClick={onLogout}
            className="text-sm font-heading tracking-widest uppercase hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent)' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Message toast */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 text-sm font-heading tracking-wider rounded-none shadow-lg"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
        >
          {message}
        </motion.div>
      )}

      <div className="section-container py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-5 py-2 text-sm font-heading tracking-widest uppercase rounded-none transition-all"
              style={{
                backgroundColor: tab === t.key ? 'var(--accent)' : 'transparent',
                color: tab === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Tab */}
        {tab === 'content' && <SiteContentManager />}

        {/* Projects Tab */}
        {tab === 'projects' && <ProjectManager />}

        {/* Media Tab */}
        {tab === 'media' && (
          <div>
            <h2 className="heading-md mb-6">Media & Bulk Uploader</h2>
            <div className="card-dark text-center py-12">
              <p className="text-sm font-heading tracking-wider uppercase mb-6" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
                Bulk upload is now integrated into the Projects tab for better workflow.
              </p>
              <button onClick={() => setTab('projects')} className="btn-primary">
                Go to Projects
              </button>
            </div>
          </div>
        )}

        {/* Theme & Appearance Tab */}
        {tab === 'theme' && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Palette size={24} style={{ color: 'var(--accent)' }} />
              <div>
                <h2 className="heading-md mb-1">Theme & Appearance</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Select a preset to instantly transform the entire site. Changes are saved to your browser.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themePresets.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme)}
                  className={`group relative p-6 text-left border transition-all ${
                    activeThemeId === theme.id
                      ? 'border-accent bg-accent/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-none">
                      <Palette
                        size={20}
                        style={{ color: theme.accent }}
                      />
                    </div>
                    {activeThemeId === theme.id && (
                      <div className="p-1 bg-accent rounded-full">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-heading font-bold tracking-wider uppercase text-white mb-1">
                    {theme.name}
                  </h3>
                  <p className="text-[10px] font-heading tracking-widest uppercase text-white/40">
                    {theme.tagline}
                  </p>

                  {/* Color preview row */}
                  <div className="flex gap-1 mt-4">
                    <div className="w-4 h-4" style={{ backgroundColor: theme.accent }} />
                    <div className="w-4 h-4" style={{ backgroundColor: theme.bgPrimary }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {tab === 'messages' && <MessageManager />}
      </div>
    </div>
  );
}
