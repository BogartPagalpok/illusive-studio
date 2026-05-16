import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import SelectedWorks from '../components/SelectedWorks';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import AdminModal from '../components/AdminModal';
import DiagonalScrollFade from '../components/DiagonalScrollFade'; // 👈 new import

export default function HomePage({ onAdminAuth }: { onAdminAuth: () => void }) {
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Keep the saved theme on reload
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
      {/* 1. ATMOSPHERE LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'var(--bg-gradient)' }}
        />
      </div>

      <Navbar />

      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="relative z-10">
        {/* Hero – full opacity, no fade */}
        <Hero />

        {/* Diagonal fade wraps each subsequent section */}
        <DiagonalScrollFade fadeEdge={25} angle={135}>
          <Services />
        </DiagonalScrollFade>

        <DiagonalScrollFade fadeEdge={20} angle={120}>
          <SelectedWorks />
        </DiagonalScrollFade>

        <DiagonalScrollFade fadeEdge={30} angle={150}>
          <About />
        </DiagonalScrollFade>

        <DiagonalScrollFade fadeEdge={20} angle={135}>
          <Contact />
        </DiagonalScrollFade>
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
