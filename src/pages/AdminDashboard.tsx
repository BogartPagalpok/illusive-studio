import { useState, useEffect } from 'react'; // Added missing useState
import { ArrowLeft, Palette, Check } from 'lucide-react';
import { motion } from 'framer-motion'; // Added missing motion import
import MessageManager from '../components/admin/MessageManager';
import SiteContentManager from '../components/admin/SiteContentManager';
import ProjectManager from '../components/admin/ProjectManager';
import { applyTheme, themePresets } from '../lib/themes';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<'content' | 'projects' | 'messages' | 'media' | 'theme'>('content');
  const [message, setMessage] = useState('');
  
  // Track active theme state
  const [activeThemeId, setActiveThemeId] = useState(() => {
    return localStorage.getItem('portfolio-theme') || 'VOID';
  });

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleThemeSelect = async (theme: typeof themePresets[0]) => {
    // 1. Update UI state immediately
    setActiveThemeId(theme.id);
    
    showMessage(`Syncing Engine: ${theme.name}...`);

    // 2. FIRE THE MASTER ENGINE
    try {
      await applyTheme(theme, true);
      showMessage(`Global Sync Complete: ${theme.name}`);
    } catch (err) {
      console.warn('Sync failed, saved locally only.');
      showMessage(`Saved locally: ${theme.name}`);
    }
  };

  const tabs = [
    { key: 'content' as const, label: 'Content' },
    { key: 'projects' as const, label: 'Projects' },
    { key: 'messages' as const, label: 'Messages' },
    { key: 'theme' as const, label: 'Engine' },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'rgba(128,128,128,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-[10px] font-heading tracking-widest uppercase transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={14} /> Exit
          </button>
          
          <h1 className="font-heading font-black tracking-tighter text-sm" style={{ color: 'var(--text-primary)' }}>
            CONTROL <span style={{ color: 'var(--accent)' }}>SYSTEM</span>
          </h1>

          <button onClick={onLogout} className="btn-primary py-2 px-6 rounded-lg text-[9px]">
            Logout
          </button>
        </div>
      </div>

      {/* Message toast */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-3 text-[10px] font-heading tracking-widest rounded-lg shadow-2xl uppercase font-bold"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
        >
          {message}
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-2 mb-12 overflow-x-auto pb-4 no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-3 text-[9px] font-heading font-black tracking-[0.2em] uppercase rounded-lg transition-all duration-300 border ${
                tab === t.key 
                ? 'border-accent' 
                : 'border-transparent opacity-40 hover:opacity-100'
              }`}
              style={tab === t.key ? { backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' } : { color: 'var(--text-primary)' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'content' && <SiteContentManager />}
        {tab === 'projects' && <ProjectManager />}
        {tab === 'messages' && <MessageManager />}

        {tab === 'theme' && (
          <div className="space-y-12">
            <div className="flex items-center gap-6">
              <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'rgba(128,128,128,0.1)' }}>
                <Palette size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-3xl font-heading font-black" style={{ color: 'var(--text-primary)' }}>Atmosphere Engine</h2>
                <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>Visual Synchronization Module</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themePresets.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme)}
                  className="group p-6 rounded-2xl border transition-all duration-500 text-left relative overflow-hidden"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: activeThemeId === theme.id ? 'var(--accent)' : 'rgba(128,128,128,0.1)' 
                  }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center border"
                      style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}30` }}
                    >
                      <Palette size={16} style={{ color: theme.accent }} />
                    </div>
                    {activeThemeId === theme.id && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                        <Check size={12} style={{ color: 'var(--accent-contrast)' }} />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-heading font-black mb-1" style={{ color: 'var(--text-primary)' }}>
                    {theme.name}
                  </h3>
                  <p className="text-[9px] font-heading font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--text-secondary)' }}>
                    {theme.tagline}
                  </p>

                  <div 
                    className="w-full h-28 rounded-xl mt-6 relative overflow-hidden border border-white/5 transition-transform duration-500 group-hover:scale-[1.02]"
                    style={{ backgroundColor: theme.bgPrimary, backgroundImage: theme.bgGradient }}
                  >
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[65%] rounded-lg border flex items-center justify-center shadow-2xl" 
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)'
                      }}
                    >
                      <div 
                        className="w-[50%] h-[35%] rounded-md" 
                        style={{ 
                          background: theme.accent, 
                          boxShadow: `0 4px 15px ${theme.accent}44` 
                        }} 
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
