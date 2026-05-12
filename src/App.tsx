import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { supabase } from './lib/supabase';
import { loadSavedTheme, applyTheme } from './lib/themes';
import type { ThemeName } from './lib/themes';
import { motion } from 'framer-motion';

// UI COMPONENT: Must stay in a .tsx file to prevent esbuild errors
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

  const syncUserTheme = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('theme_preference')
        .eq('id', userId)
        .single();

      if (error) return;

      if (data?.theme_preference) {
        applyTheme(data.theme_preference as ThemeName);
      } else {
        const localTheme = localStorage.getItem('portfolio-theme');
        if (localTheme) {
          await supabase.from('user_profiles').update({ theme_preference: localTheme }).eq('id', userId);
        }
      }
    } catch (err) {
      console.warn('Sync failed');
    }
  };

  useEffect(() => {
    loadSavedTheme(); // Instant paint from localStorage

    const initAuth = async () => {
      const timeout = setTimeout(() => setLoading(false), 2500);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) await syncUserTheme(session.user.id);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) await syncUserTheme(session.user.id);
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

  // Admin routing logic: Must stay outside Routes for your view swap
  if (isAdmin) {
    return (
      <main className="min-h-screen bg-transparent relative">
        <AtmosphereGradient />
        <AdminDashboard onLogout={() => setIsAdmin(false)} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default App;
