import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { supabase } from './lib/supabase';
import { loadSavedTheme } from './lib/themes';

// FIXED: Added Atmosphere Engine Gradient Component for that fluid mesh look
function AtmosphereGradient() {
  return (
    <div className="fixed inset-0 -z-[1] overflow-hidden pointer-events-none" style={{ backgroundColor: '#030305' }}>
      {/* Main Dynamic Blob - Tied to Dashboard Accent */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full opacity-40 blur-[120px] transition-colors duration-1000"
        style={{ 
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
          filter: 'saturate(1.4)'
        }}
      />
      {/* Secondary Depth Blob - Harmonized tint */}
      <div 
        className="absolute bottom-[-10%] right-[-5%] w-[70%] h-[70%] rounded-full opacity-20 blur-[100px] transition-colors duration-1000"
        style={{ 
          background: 'radial-gradient(circle, color-mix(in srgb, var(--accent), #7000ff 30%) 0%, transparent 70%)',
        }}
      />
      {/* High-Key Highlight */}
      <div 
        className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full opacity-15 blur-[110px] transition-colors duration-1000"
        style={{ 
          background: 'radial-gradient(circle, color-mix(in srgb, var(--accent), white 20%) 0%, transparent 70%)',
        }}
      />
      {/* Global Vignette for deep edges */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
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

  // Mandatory Login Wall
  if (!session) {
    return (
      <main className="min-h-screen bg-transparent relative">
        <AtmosphereGradient />
        <Login />
      </main>
    );
  }

  // Admin View
  if (isAdmin) {
    return (
      <main className="min-h-screen bg-transparent relative">
        <AtmosphereGradient />
        <AdminDashboard onLogout={() => setIsAdmin(false)} />
      </main>
    );
  }

  // Homepage View
  return (
    <main className="min-h-screen relative overflow-x-hidden bg-transparent">
      {/* FIXED: Gradient placed here to cover all routes and allow glassmorphism to blur it */}
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
