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

      <Navbar />
      
      <main className="relative z-10">
        <Hero />
        
        <div style={{ marginTop: '-100vh', position: 'relative', zIndex: 1 }}>
          <Services />
        </div>

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
