import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import DualShowreel from '../components/DualShowreel';
import Services from '../components/Services';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import AdminModal from '../components/AdminModal';
import CategorySection from '../components/CategorySection';
import ProjectPortal from '../components/ProjectPortal';
import { supabase } from '../lib/supabase';
import { isAdminEmail } from '../lib/admin';
import { usePortfolioStore } from '../lib/store';

export default function HomePage({ onAdminAuth }: { onAdminAuth: () => void }) {
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const { sections, fetchSettings } = usePortfolioStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'void';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
    fetchSettings();
  }, [fetchSettings]);

  const isSectionVisible = (key: string, defaultValue = true) => {
    const sec = sections.find((s) => s.key === key);
    return sec !== undefined ? sec.visible : defaultValue;
  };

  const handleAdminTrigger = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.email && isAdminEmail(data.session.user.email)) {
        onAdminAuth();
        return;
      }
    } catch {
      // Fall through to modal
    }
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
        
        {isSectionVisible('dual-showreel', true) && <DualShowreel />}

        {isSectionVisible('about', true) && <About />}
        
        {isSectionVisible('services', true) && <Services />}
        
        {/* --- FIXED WORKS SECTION --- */}
        {/* The id="works" is now wrapping the entire portfolio block */}
        {isSectionVisible('works', true) && <div id="works" className="w-full">
          
          {/* 1. Portal is the absolute first thing they see when clicking 'Works' */}
          <ProjectPortal />

          {/* 2. Then they scroll down into your standard categories */}
          <div style={{ minHeight: '50vh' }}>
            <CategorySection category="Motion" />
            <CategorySection category="Graphic Design" />
            <CategorySection category="UI/UX" />
            <CategorySection category="Photography" />
          </div>
          
        </div>}

        {isSectionVisible('contact', true) && <Contact />}
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
