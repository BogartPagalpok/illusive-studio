import { useState } from 'react';
import { ArrowLeft, Palette, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import MessageManager from '../components/admin/MessageManager';
import SiteContentManager from '../components/admin/SiteContentManager';
import ProjectManager from '../components/admin/ProjectManager';
import { applyTheme, themePresets } from '../lib/themes';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<'content' | 'projects' | 'messages' | 'theme'>('content');
  const [message, setMessage] = useState('');
  
  const [activeThemeId, setActiveThemeId] = useState(() => {
    return localStorage.getItem('portfolio-theme') || 'IMPACT';
  });

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleThemeSelect = async (theme: typeof themePresets[0]) => {
    setActiveThemeId(theme.id);
    showMessage(`Syncing Engine: ${theme.name}...`);

    try {
      await applyTheme(theme, true);
      showMessage(`Global Sync Complete: ${theme.name}`);
    } catch (err) {
      console.warn('Sync failed, saved locally.');
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
    <div className="min-h-screen transition-colors duration-700" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--text-secondary)', opacity: 0.2 }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-[10px] font-heading tracking-widest uppercase transition-colors opacity-60 hover:opacity-100"
            style={{ color: 'var(--text-primary)' }}
          >
            <ArrowLeft size={14} /> Exit
          </button>
          
          <h1 className="font-heading font-black tracking-tighter text-sm italic" style={{ color: 'var(--text-primary)' }}>
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
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-3 text-[10px] font-heading tracking-widest rounded-xl shadow-2xl uppercase font-black"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
        >
          {message}
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-3 mb-16 overflow-x-auto pb-4 no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-8 py-4 text-[10px] font-heading font-black tracking-[0.2em] uppercase rounded-xl transition-all duration-300 border ${
                tab === t.key 
                ? 'border-accent shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]' 
                : 'border-transparent opacity-40 hover:opacity-100'
              }`}
              style={tab === t.key ? { 
                backgroundColor: 'var(--accent)', 
                color: 'var(--accent-contrast)' 
              } : { 
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)' 
              }}
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
              <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--text-secondary)', opacity: 0.5 }}>
                <Palette size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-4xl font-heading font-black italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>Atmosphere Engine</h2>
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: 'var(--accent)' }}>Visual Synchronization Module</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {themePresets.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme)}
                  className="group p-8 rounded-[2rem] border transition-all duration-500 text-left relative overflow-hidden"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: activeThemeId === theme.id ? 'var(--accent)' : 'rgba(128,128,128,0.1)' 
                  }}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center border"
                      style={{ backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` }}
                    >
                      <Palette size={20} style={{ color: theme.accent }} />
                    </div>
                    {activeThemeId === theme.id && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                        <Check size={14} style={{ color: 'var(--accent-contrast)' }} />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-heading font-black mb-1 uppercase italic" style={{ color: theme.id === 'GUNDAM' ? '#111' : 'var(--text-primary)' }}>
                    {theme.name}
                  </h3>
                  <p className="text-[9px] font-heading font-bold tracking-[0.3em] uppercase opacity-60" style={{ color: 'var(--text-primary)' }}>
                    {theme.tagline}
                  </p>

                  <div 
                    className="w-full h-32 rounded-2xl mt-8 relative overflow-hidden border border-black/5 transition-transform duration-500 group-hover:scale-[1.02]"
                    style={{ backgroundColor: theme.bgPrimary, backgroundImage: theme.bgGradient }}
                  >
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] rounded-xl border flex items-center justify-center shadow-2xl" 
                      style={{ 
                        backgroundColor: 'rgba(128, 128, 128, 0.05)', 
                        borderColor: 'rgba(128, 128, 128, 0.1)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <div 
                        className="w-[40%] h-[30%] rounded-lg" 
                        style={{ 
                          background: theme.accent,
                          boxShadow: `0 0 20px ${theme.accent}66`
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
