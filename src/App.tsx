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

// ADVANCED LIQUID MESH GRADIENT
// This creates the organic, non-linear flow from your reference image
function AtmosphereGradient() {
  return (
    <div className="fixed inset-0 -z-[1] overflow-hidden pointer-events-none" style={{ backgroundColor: '#020204' }}>
      {/* Primary Dynamic Mesh Point */}
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          x: ['-10%', '10%', '-10%'],
          y: ['-5%', '5%', '-5%'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] rounded-full opacity-40 blur-[140px]"
        style={{ 
          background: 'radial-gradient(circle at 30% 30%, var(--accent) 0%, transparent 60%)',
          filter: 'saturate(1.8)'
        }}
      />

      {/* Secondary Deep Tone Point */}
      <motion.div 
        animate={{
          scale: [1.2, 1, 1.2],
          x: ['10%', '-10%', '10%'],
          y: ['5%', '-5%', '5%'],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] rounded-full opacity-25 blur-[120px]"
        style={{ 
          background: 'radial-gradient(circle at 70% 70%, color-mix(in srgb, var(--accent), #4000ff 45%) 0%, transparent 60%)',
        }}
      />

      {/* Center Soft Highlight */}
      <motion.div 
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 w-full h-full rounded-full blur-[100px]"
        style={{ 
          background: 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent), white 10%) 0%, transparent 50%)',
        }}
      />

      {/* Deep Vignette to hide edges and force focus to content */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8) 100%)]" />
    </div>
  );
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedTheme();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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

  // Auth Wall
  if (!session) {
    return (
      <main className="min-h-screen bg-transparent relative">
        <AtmosphereGradient />
        <Login />
      </main>
    );
  }

  // Admin Dashboard
  if (isAdmin) {
    return (
      <main className="min-h-screen bg-transparent relative">
        <AtmosphereGradient />
        <AdminDashboard onLogout={() => setIsAdmin(false)} />
      </main>
    );
  }

  // Main App Entry
  return (
    <main className="min-h-screen relative overflow-x-hidden bg-transparent">
      {/* Global Mesh Gradient sits behind all routes */}
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
