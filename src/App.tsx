import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { supabase } from './lib/supabase';
import { loadSavedTheme } from './lib/themes';

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
      // FIXED: Removed bg-black. The global body background will handle this now.
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <span className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  // Mandatory Login Wall
  if (!session) {
    return (
      // FIXED: Removed inline styles. Let index.css do the work.
      <main className="min-h-screen bg-transparent">
        <Login />
      </main>
    );
  }

  // Admin View (Only you)
  if (isAdmin) {
    return (
      // FIXED: Removed inline styles. Let index.css do the work.
      <main className="min-h-screen bg-transparent">
        <AdminDashboard onLogout={() => setIsAdmin(false)} />
      </main>
    );
  }

  // Homepage View (For authorized clients)
  return (
    // FIXED: Removed redundant inline backgrounds. bg-transparent ensures the body gradient shows.
    <main className="min-h-screen relative overflow-x-hidden bg-transparent">
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
