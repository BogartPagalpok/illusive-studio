import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { supabase } from './lib/supabase';
import { loadSavedTheme } from './lib/themes';
import { motion } from 'framer-motion';

function AtmosphereGradient() {
  return (
    <div className="fixed inset-0 -z-[1] overflow-hidden pointer-events-none bg-[#020204]">
      <motion.div 
        animate={{ x: ['-5%', '5%', '-5%'], y: ['-2%', '2%', '-2%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-15%] left-[-15%] w-[110%] h-[110%] rounded-full opacity-30 blur-[80px] will-change-transform"
        style={{ background: 'radial-gradient(circle at 30% 30%, var(--accent) 0%, transparent 70%)', filter: 'saturate(1.5)' }}
      />
      <motion.div 
        animate={{ x: ['5%', '-5%', '5%'], y: ['2%', '-2%', '2%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-15%] right-[-15%] w-[100%] h-[100%] rounded-full opacity-20 blur-[70px] will-change-transform"
        style={{ background: 'radial-gradient(circle at 70% 70%, color-mix(in srgb, var(--accent), #4000ff 40%) 0%, transparent 70%)' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />
    </div>
  );
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<string | null>(null);

  // Centralized theme application
  const applyTheme = (themeName: string) => {
    if (!themeName) return;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('portfolio-theme', themeName);
    setTheme(themeName);
  };

  const syncUserTheme = async (userId: string) => {
    try {
      console.log('[Theme Sync] Fetching for user:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('theme_preference')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Theme Sync] Supabase error:', error.message);
        return;
      }

      // Fallback to 'default' if null/missing
      const newTheme = data?.theme_preference || 'default';
      console.log('[Theme Sync] Applying:', newTheme);
      applyTheme(newTheme);
    } catch (err) {
      console.error('[Theme Sync] Unexpected error:', err);
    }
  };

  useEffect(() => {
    // 1. Load local theme immediately
    const localTheme = loadSavedTheme();
    if (localTheme) applyTheme(localTheme);

    const initAuthAndTheme = async () => {
      const timeout = setTimeout(() => setLoading(false), 2000);

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        await syncUserTheme(session.user.id);
      }

      clearTimeout(timeout);
      setLoading(false);
    };

    initAuthAndTheme();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await syncUserTheme(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <AtmosphereGradient />
        <span className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-transparent relative">
        <AtmosphereGradient />
        <Login />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-transparent">
      <AtmosphereGradient />
      <Routes>
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/" element={<HomePage onAdminAuth={() => setIsAdmin(true)} />} />
        {isAdmin && <Route path="/admin" element={<AdminDashboard onLogout={() => setIsAdmin(false)} />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default App;
