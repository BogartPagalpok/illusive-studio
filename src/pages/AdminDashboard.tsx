import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Palette, Check } from 'lucide-react';
import MessageManager from '../components/admin/MessageManager';
import SiteContentManager from '../components/admin/SiteContentManager';
import ProjectManager from '../components/admin/ProjectManager';

// Defined with exact gradients to power the rich UI visualizer
const THEMES = [
  { id: 'void', name: 'Void', tagline: 'Deep Web3 Purple', accent: '#9D00FF', bgPrimary: '#030305', bgGradient: 'radial-gradient(circle at 50% -20%, rgba(157, 0, 255, 0.15) 0%, rgba(3, 3, 5, 0) 70%)' },
  { id: 'light', name: 'Clean', tagline: 'App Interface', accent: '#FF3366', bgPrimary: '#F0F0F3', bgGradient: 'none' },
  { id: 'magma', name: 'Magma', tagline: 'Industrial Cyberpunk', accent: '#FF4500', bgPrimary: '#050303', bgGradient: 'radial-gradient(circle at 50% -20%, rgba(255, 69, 0, 0.12) 0%, rgba(5, 3, 3, 0) 70%)' },
  { id: 'toxic', name: 'Toxic', tagline: 'Acid Techwear', accent: '#D4FF00', bgPrimary: '#030503', bgGradient: 'radial-gradient(circle at 50% -20%, rgba(57, 255, 20, 0.12) 0%, rgba(3, 5, 3, 0) 70%)' },
  { id: 'ocean', name: 'Ocean', tagline: 'Deep Sea Crypto', accent: '#00FFFF', bgPrimary: '#010609', bgGradient: 'radial-gradient(circle at 50% -20%, rgba(0, 255, 255, 0.12) 0%, rgba(1, 6, 9, 0) 70%)' },
  { id: 'gold', name: 'Gold', tagline: 'Metallic Luxury', accent: '#FFD700', bgPrimary: '#050402', bgGradient: 'radial-gradient(circle at 50% -20%, rgba(255, 215, 0, 0.12) 0%, rgba(5, 4, 2, 0) 70%)' },
  { id: 'synth', name: 'Synth', tagline: 'Retrowave Neon', accent: '#FF0080', bgPrimary: '#070205', bgGradient: 'radial-gradient(circle at 50% -20%, rgba(255, 0, 128, 0.15) 0%, rgba(7, 2, 5, 0) 70%)' },
  { id: 'glitch', name: 'Glitch', tagline: 'Crimson Hacker', accent: '#DC143C', bgPrimary: '#050000', bgGradient: 'radial-gradient(circle at 50% -20%, rgba(220, 20, 60, 0.15) 0%, rgba(5, 0, 0, 0) 70%)' },
  { id: 'ice', name: 'Ice', tagline: 'Arctic Frost', accent: '#87CEFA', bgPrimary: '#020508', bgGradient: 'radial-gradient(circle at 50% -20%, rgba(135, 206, 250, 0.12) 0%, rgba(2, 5, 8, 0) 70%)' },
  { id: 'brutal', name: 'Brutal', tagline: 'Monochrome High-Contrast', accent: '#FFFFFF', bgPrimary: '#000000', bgGradient: 'none' },
];

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<'content' | 'projects' | 'messages' | 'media' | 'theme'>('content');
  const [message, setMessage] = useState('');
  
  const [activeThemeId, setActiveThemeId] = useState(() => {
    return localStorage.getItem('portfolio-theme') || 'void';
  });

  const applyThemeToDOM = (themeId: string) => {
    // Injecting into both documentElement and body forces the CSS to re-evaluate instantly
    document.documentElement.setAttribute('data-theme', themeId);
    document.body.setAttribute('data-theme', themeId);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'void';
    applyThemeToDOM(savedTheme);
  }, []);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleThemeSelect = (theme: typeof THEMES[0]) => {
    applyThemeToDOM(theme.id);
    localStorage.setItem('portfolio-theme', theme.id);
    setActiveThemeId(theme.id);
    showMessage(`Theme applied: ${theme.name}`);
  };

  const tabs = [
    { key: 'content' as const, label: 'Content' },
    { key: 'projects' as const, label: 'Projects' },
    { key: 'messages' as const, label: 'Messages' },
    { key: 'theme' as const, label: 'Engine' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--text-secondary)', opacity: 0.1 }}>
        <div className="section-container flex items-center justify-between h-20">
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

      <div className="section-container py-12">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-12 overflow-x-auto pb-4">
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

        {/* Content Tabs */}
        {tab === 'content' && <SiteContentManager />}
        {tab === 'projects' && <ProjectManager />}
        {tab === 'messages' && <MessageManager />}

        {/* Theme Tab (Atmosphere Engine) */}
        {tab === 'theme' && (
          <div className="space-y-12">
            <div className="flex items-center gap-6">
              <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--text-secondary)' }}>
                <Palette size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-3xl font-heading font-black" style={{ color: 'var(--text-primary)' }}>Atmosphere Engine</h2>
                <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>Visual Synchronization Module</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {THEMES.map((theme) => (
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

                  {/* Rich UI Visualizer: Previews the actual gradient, frosted glass, and 3D button */}
                  <div 
                    className="w-full h-28 rounded-xl mt-6 relative overflow-hidden border border-white/5 transition-transform duration-500 group-hover:scale-[1.02]"
                    style={{ backgroundColor: theme.bgPrimary, backgroundImage: theme.bgGradient }}
                  >
                    {/* Frosted Glass Card Simulation */}
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[65%] rounded-lg border flex items-center justify-center shadow-2xl" 
                      style={{ 
                        backgroundColor: 'rgba(128, 128, 128, 0.05)', 
                        borderColor: 'rgba(128, 128, 128, 0.15)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)'
                      }}
                    >
                      {/* Gradient Button Simulation */}
                      <div 
                        className="w-[50%] h-[35%] rounded-md" 
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.accent} 0%, color-mix(in srgb, ${theme.accent}, black 40%) 100%)`, 
                          boxShadow: `0 4px 15px color-mix(in srgb, ${theme.accent}, transparent 80%)` 
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
