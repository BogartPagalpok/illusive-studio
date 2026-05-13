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

// PERFORMANCE OPTIMIZED GRADIENT
function AtmosphereGradient() {
  return (
    <div className="fixed inset-0 -z-[1] overflow-hidden pointer-events-none bg-[#020204]">
      <motion.div 
        animate={{
          x: ['-5%', '5%', '-5%'],
          y: ['-2%', '2%', '-2%'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-15%] left-[-15%] w-[110%] h-[110%] rounded-full opacity-30 blur-[80px] will-change-transform"
        style={{ 
          background: 'radial-gradient(circle at 30% 30%, var(--accent) 0%, transparent 70%)',
          filter: 'saturate(1.5)'
        }}
      />

      <motion.div 
        animate={{
          x: ['5%', '-5%', '5%'],
          y: ['2%', '-2%', '2%'],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-15%] right-[-15%] w-[100%] h-[100%] rounded-full opacity-20 blur-[70px] will-change-transform"
        style={{ 
          background: 'radial-gradient(circle at 70% 70%, color-mix(in srgb, var(--accent), #4000ff 40%) 0%, transparent 70%)',
        }}
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

      if (!error && data?.theme_preference) {
        // applyTheme handles CSS variables, data-theme attribute, and localStorage
        applyTheme(data.theme_preference as ThemeName);
      }
    } catch (err) {
      console.warn('Background theme sync failed.');
    }
  };

  useEffect(() => {
    // 1. Instant local load (zero-latency)
    loadSavedTheme();

    const initAuthAndTheme = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Supabase Auth Warning:', error.message);
        }
        
        setSession(session);
        
        // 3. Sync theme in background (Non-blocking)
        if (session?.user) {
          syncUserTheme(session.user.id);
        }
      } catch (err) {
        console.error('Supabase connection failed completely:', err);
      } finally {
        // 2. Stop loading immediately after session check ALWAYS
        setLoading(false);
      }
    };

    initAuthAndTheme();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        syncUserTheme(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <AtmosphereGradient />
        <span 
          className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" 
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
        />
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
