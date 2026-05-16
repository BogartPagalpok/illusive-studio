import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import SelectedWorks from '../components/SelectedWorks';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import AdminModal from '../components/AdminModal';
import { loadSavedTheme } from '../lib/themes';

export default function HomePage({ onAdminAuth }: { onAdminAuth: () => void }) {
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const handleAdminTrigger = () => setAdminModalOpen(true);
  const handleAdminSuccess = () => {
    setAdminModalOpen(false);
    onAdminAuth();
  };

  return (
    <div className="relative min-h-screen w-full selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]">
      
      {/* FIXED BACKGROUND LAYER — always behind everything */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundColor: 'var(--bg-primary)',
          backgroundImage: 'var(--bg-gradient), var(--bg-pattern, none)',
          backgroundSize: '100% 100%, var(--bg-pattern-size, auto)',
          backgroundBlendMode: 'overlay, normal',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Accent glow blobs */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div 
          className="absolute top-[-15%] left-[-15%] w-[110%] h-[110%] rounded-full"
          style={{
            opacity: 0.12,
            background: 'radial-gradient(circle at 30% 30%, var(--accent) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <div 
          className="absolute bottom-[-15%] right-[-15%] w-[100%] h-[100%] rounded-full"
          style={{
            opacity: 0.06,
            background: 'radial-gradient(circle at 70% 70%, var(--accent) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
      </div>

      <Navbar />
      
      <main className="relative" style={{ zIndex: 10 }}>
        <Hero />
        
        <section className="relative">
          <div 
            className="absolute inset-x-0 top-0 h-32 z-20 pointer-events-none" 
            style={{ backgroundImage: 'linear-gradient(to bottom, var(--bg-primary), transparent)' }}
          />
          <Services />
        </section>

        <SelectedWorks />
        
        <section className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <About />
        </section>

        <Contact />
      </main>

      <Footer onAdminTrigger={handleAdminTrigger} />

      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />
    </div>
  );
}
