import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { supabase } from './lib/supabase';
import { loadSavedTheme, subscribeToThemeChanges } from './lib/themes';
import { motion } from 'framer-motion';
import { useHoveringPenFavicon } from './hooks/useHoveringPenFavicon';

function AtmosphereGradient() {
  return (
    <div className="fixed inset-0 -z-[1] overflow-hidden pointer-events-none bg-[#020204]">
      <motion.div 
        animate={{ x: ['-5%', '5%', '-5%'], y: ['-2%', '2%', '-2%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-15%] left-[-15%] w-[110%] h-[110%] rounded-full opacity-30 blur-[80px] will-change-transform"
        style={{ 
          background: 'radial-gradient(circle at 30% 30%, var(--accent) 0%, transparent 70%)',
          filter: 'saturate(1.5)'
        }}
      />
      <motion.div 
        animate={{ x: ['5%', '-5%', '5%'], y: ['2%', '-2%', '2%'] }}
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
  useHoveringPenFavicon();
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ignition: Load the Global Master Theme from Supabase site_config
    loadSavedTheme();

    // 2. Real-time Bridge: Listen for theme updates from other devices
    const themeSubscription = subscribeToThemeChanges();

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.warn('Supabase Auth Warning:', error.message);
        setSession(session);
      } catch (err) {
        console.error('Supabase connection failed:', err);
      } finally {
        // Only stop loading once auth AND initial theme load are handled
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authSubscription.unsubscribe();
      themeSubscription.unsubscribe(); // Clean up Real-time listener
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AtmosphereGradient />
        <span className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen relative bg-transparent">
        <AtmosphereGradient />
        <Login />
      </main>
    );
  }

  if (isAdmin) {
    return (
      <main className="min-h-screen relative bg-transparent">
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
          
