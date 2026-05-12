import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { supabase } from './lib/supabase';
import { loadSavedTheme } from './lib/themes'; // Import this to fix the theme loading

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Load the global theme as soon as the app starts
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  // Mandatory Login Wall
  if (!session) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
        <Login />
      </main>
    );
  }

  // Admin View (Only you)
  if (isAdmin) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
        <AdminDashboard onLogout={() => setIsAdmin(false)} />
      </main>
    );
  }

  // Homepage View (For authorized clients)
  return (
    /* FIX: Added 'var(--bg-gradient)' so the background isn't just flat black */
    <main className="min-h-screen relative overflow-x-hidden" style={{ background: 'var(--bg-gradient)', backgroundColor: 'var(--bg-primary)' }}>
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
