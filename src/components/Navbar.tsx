import { useState } from 'react';
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

  const handleAdminTrigger = () => {
    setAdminModalOpen(true);
  };

  const handleAdminSuccess = () => {
    setAdminModalOpen(false);
    onAdminAuth();
  };

  return (
    <div className="relative min-h-screen w-full selection:bg-accent selection:text-white">
      {/* 1. ATMOSPHERE LAYER: Noise and Global Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle Grain Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
             style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }} />
        
        {/* Global Ambient Glow that follows the theme */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <Navbar />
      
      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="relative z-10">
        <Hero />
        
        {/* Transitions between sections are softened with backdrop-blur layers */}
        <section className="relative">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none" />
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
