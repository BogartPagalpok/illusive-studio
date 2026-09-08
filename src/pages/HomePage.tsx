import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import AdminModal from '../components/AdminModal';
import CategorySection from '../components/CategorySection';
import ProjectPortal from '../components/ProjectPortal';
import { supabase } from '../lib/supabase';

const defaultSectionVisibility = {
  about: true,
  services: true,
  works: true,
  contact: true,
};

export default function HomePage({ onAdminAuth }: { onAdminAuth: () => void }) {
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [sectionVisibility, setSectionVisibility] = useState(defaultSectionVisibility);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'void';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    const fetchSectionVisibility = async () => {
      const { data } = await supabase
        .from('portfolio_sections')
        .select('key, visible')
        .in('key', Object.keys(defaultSectionVisibility));
      if (data) {
        setSectionVisibility({
          ...defaultSectionVisibility,
          ...Object.fromEntries(data.map(section => [section.key, section.visible])),
        });
      }
    };
    fetchSectionVisibility();
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
        
        {sectionVisibility.about && <div id="about"><About /></div>}
        
        {sectionVisibility.services && <div id="services"><Services /></div>}
        
        {/* --- FIXED WORKS SECTION --- */}
        {/* The id="works" is now wrapping the entire portfolio block */}
        {sectionVisibility.works && <div id="works" className="w-full">
          
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

        {sectionVisibility.contact && <div id="contact"><Contact /></div>}
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
