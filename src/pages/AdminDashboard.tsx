import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, Trash2, Upload, Image, Palette, Check } from 'lucide-react';
import { supabase, PORTFOLIO_BUCKET } from '../lib/supabase';
import { themePresets, applyTheme } from '../lib/themes';
import type { ThemePreset } from '../lib/themes';
import MessageManager from '../components/admin/MessageManager';
import SiteContentManager from '../components/admin/SiteContentManager';
import ProjectManager from '../components/admin/ProjectManager';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<'content' | 'projects' | 'messages' | 'media' | 'theme'>('content');
  const [message, setMessage] = useState('');
  const [activeThemeId, setActiveThemeId] = useState(
    () => localStorage.getItem('portfolio-theme') || 'cyber-gaming'
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
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)', backgroundImage: 'var(--bg-gradient)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'transparent' }}>
        <div className="section-container flex items-center justify-between h-20 sticky top-0 z-40 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-xs hover:text-accent transition-colors font-heading tracking-[0.2em] uppercase"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={14} />
              Exit System
            </button>
            <div className="w-px h-6 bg-white/10" />
            <h1 className="font-heading font-bold tracking-widest uppercase text-sm" style={{ color: 'var(--text-primary)' }}>
              Control <span className="text-accent">Center</span>
            </h1>
          </div>
          <button
            onClick={onLogout}
            className="btn-outline py-2 px-6 rounded-xl text-[10px]"
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
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-3 text-[10px] font-heading tracking-[0.2em] rounded-full shadow-2xl uppercase font-bold"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
        >
          {message}
        </motion.div>
      )}

      <div className="section-container py-12">
        {/* Modern Tabs */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-8 py-3 text-[10px] font-heading tracking-[0.2em] uppercase rounded-xl transition-all duration-300 whitespace-nowrap border ${
                tab === t.key 
                ? 'bg-accent text-[var(--accent-contrast)] border-accent shadow-[0_10px_20px_-5px_var(--accent)]' 
                : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Tab */}
        {tab === 'content' && <SiteContentManager />}

        {/* Projects Tab */}
        {tab === 'projects' && <ProjectManager />}

        {/* Theme & Appearance Tab */}
        {tab === 'theme' && (
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
                <Palette size={24} className="text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-tighter">Atmosphere Engine</h2>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Global Visual Synchronization</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {themePresets.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme)}
                  className={`group card-dark p-8 text-left transition-all duration-500 ${
                    activeThemeId === theme.id
                      ? 'border-accent ring-1 ring-accent/50'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500"
                        style={{ backgroundColor: `${theme.accent}15`, border: `1px solid ${theme.accent}30` }}
                    >
                      <Palette size={20} style={{ color: theme.accent }} className="group-hover:rotate-12 transition-transform" />
                    </div>
                    {activeThemeId === theme.id && (
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-[0_0_15px_var(--accent)]">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-heading font-bold tracking-tight text-white mb-1 group-hover:text-accent transition-colors">
                    {theme.name}
                  </h3>
                  <p className="text-[10px] font-heading tracking-[0.2em] uppercase text-white/30 mb-6">
                    {theme.tagline}
                  </p>

                  {/* FIXED: 3-Color Palette Visualizer (60/30/10) */}
                  <div className="flex h-3 w-full rounded-full overflow-hidden bg-black/40 p-[1px] border border-white/5">
                    <div 
                      className="h-full rounded-l-full" 
                      style={{ backgroundColor: theme.bgPrimary, flex: '0 0 60%' }} 
                      title="Primary (60%)" 
                    />
                    <div 
                      className="h-full" 
                      style={{ backgroundColor: theme.bgSecondary, flex: '0 0 30%' }} 
                      title="Secondary (30%)" 
                    />
                    <div 
                      className="h-full rounded-r-full" 
                      style={{ backgroundColor: theme.accent, flex: '0 0 10%' }} 
                      title="Accent (10%)" 
                    />
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
