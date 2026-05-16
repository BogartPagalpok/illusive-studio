import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import SelectedWorks from '../components/SelectedWorks';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import AdminModal from '../components/AdminModal';

export default function HomePage({ onAdminAuth }: { onAdminAuth: () => void }) {
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // FIXED: This checks local storage on page load so the theme survives a refresh
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'void';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  const handleAdminTrigger = () => {
    setAdminModalOpen(true);
  };

  const handleAdminSuccess = () => {
    setAdminModalOpen(false);
    onAdminAuth();
  };

  return (
    <div className="relative min-h-screen w-full selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]">
      
      {/* 1. ATMOSPHERE LAYER: Noise and Global Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle Grain Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
             style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }} />
        
        {/* FIXED: Forces the dynamic theme gradient to render globally behind all content */}
        <div className="absolute inset-0" style={{ backgroundImage: 'var(--bg-gradient)' }} />
      </div>

      <Navbar />
      
      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="relative z-10">
        <Hero />
        
        {/* Transitions between sections are softened with backdrop-blur layers */}
        <section className="relative">
          <div 
            className="absolute inset-x-0 top-0 h-32 z-20 pointer-events-none" 
            style={{ backgroundImage: 'linear-gradient(to bottom, var(--bg-primary), transparent)' }}
          />
          <Services />
        </section>

        <SelectedWorks />
        
        <section className="relative">
          {/* Subtle separator for the About section */}
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
