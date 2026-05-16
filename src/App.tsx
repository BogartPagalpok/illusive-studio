import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { supabase } from './lib/supabase';
import { motion } from 'framer-motion';
import { useHoveringPenFavicon } from './hooks/useHoveringPenFavicon';

function AtmosphereGradient() {
  return (
    <div
      className="fixed inset-0 overflow-hidden transition-colors duration-700"
      style={{ 
        zIndex: -1,
        pointerEvents: 'none',
        backgroundColor: 'var(--bg-primary)',
      } as React.CSSProperties}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--bg-gradient)',
          opacity: 0.8,
        } as React.CSSProperties}
      />
      <motion.div
        animate={{ x: ['-5%', '5%', '-5%'], y: ['-2%', '2%', '-2%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[-15%] left-[-15%] w-[110%] h-[110%] rounded-full will-change-transform"
        style={{
          opacity: 0.2,
          background: 'radial-gradient(circle at 30% 30%, var(--accent) 0%, transparent 70%)',
          filter: 'saturate(1.2) blur(100px)',
        } as React.CSSProperties}
      />
      <motion.div
        animate={{ x: ['5%', '-5%', '5%'], y: ['2%', '-2%', '2%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[-15%] right-[-15%] w-[100%] h-[100%] rounded-full will-change-transform"
        style={{
          opacity: 0.1,
          background: 'radial-gradient(circle at 70% 70%, var(--accent) 0%, transparent 70%)',
          filter: 'blur(90px)',
        } as React.CSSProperties}
      />
    </div>
  );
}

function App() {
  useHoveringPenFavicon();
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'void';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.warn('Supabase Auth Warning:', error.message);
        setSession(session);
      } catch (err) {
        console.error('Supabase connection failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-black">
        <span className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: '#9D00FF', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen relative">
        <AtmosphereGradient />
        <Login />
      </main>
    );
  }

  if (isAdmin) {
    return (
      <main className="min-h-screen relative">
        <AtmosphereGradient />
        <AdminDashboard onLogout={() => setIsAdmin(false)} />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden">
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
