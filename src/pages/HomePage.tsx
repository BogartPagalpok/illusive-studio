import { useState, useEffect, useCallback, useMemo } from 'react';
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
import SlideshowDeck, { SlideItem } from '../components/SlideshowDeck';
import { supabase } from '../lib/supabase';
import { isAdminEmail } from '../lib/admin';
import { usePortfolioStore } from '../lib/store';

export default function HomePage({ onAdminAuth }: { onAdminAuth: () => void }) {
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const sections = usePortfolioStore((s) => s.sections);
  const fetchSettings = usePortfolioStore((s) => s.fetchSettings);

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

  const handleAdminTrigger = useCallback(async () => {
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
  }, [onAdminAuth]);

  const handleAdminSuccess = useCallback(() => {
    setAdminModalOpen(false);
    onAdminAuth();
  }, [onAdminAuth]);

  const slides: SlideItem[] = useMemo(() => {
    const list: SlideItem[] = [
      {
        id: 'hero',
        title: 'Ian Lester // Visual Direction',
        fullBleed: true,
        content: <Hero isSlideDeck={true} />,
      },
    ];

    if (isSectionVisible('dual-showreel', true)) {
      list.push({
        id: 'dual-showreel',
        title: 'Featured Reels // Dual Showreel',
        content: <DualShowreel />,
      });
    }

    if (isSectionVisible('about', true)) {
      list.push({
        id: 'about',
        title: 'Who I Am // About & Skills',
        content: <About />,
      });
    }

    if (isSectionVisible('services', true)) {
      list.push({
        id: 'services',
        title: 'What I Do // Services & Expertise',
        content: <Services />,
      });
    }

    if (isSectionVisible('works', true)) {
      list.push({
        id: 'works-study',
        title: 'Case Study // Modular Creative Testing',
        content: <ProjectPortal />,
      });

      list.push({
        id: 'works-motion-shorts',
        title: 'Motion // Shorts & TikTok',
        content: <CategorySection category="Motion" groupIndex={0} hideHeader={false} />,
      });

      list.push({
        id: 'works-motion-events',
        title: 'Motion // Live Events & SDE',
        content: <CategorySection category="Motion" groupIndex={1} hideHeader={false} />,
      });

      list.push({
        id: 'works-motion-led',
        title: 'Motion // LED Walls & Stage Visuals',
        content: <CategorySection category="Motion" groupIndex={2} hideHeader={false} />,
      });

      list.push({
        id: 'works-graphics',
        title: 'Design // Promotional Posters & Visuals',
        content: <CategorySection category="Graphic Design" />,
      });

      list.push({
        id: 'works-uiux',
        title: 'UI/UX // Web App Design',
        content: <CategorySection category="UI/UX" />,
      });

      list.push({
        id: 'works-photography',
        title: 'Photography // Street & Concerts',
        content: <CategorySection category="Photography" />,
      });
    }

    if (isSectionVisible('contact', true)) {
      list.push({
        id: 'contact',
        title: "Let's Connect // Get in Touch",
        content: <Contact />,
      });
    }

    list.push({
      id: 'footer',
      title: 'Directory // Navigation & Socials',
      content: <Footer onAdminTrigger={handleAdminTrigger} />,
    });

    return list;
  }, [sections, handleAdminTrigger]);

  return (
    <div className="relative min-h-screen w-full selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]">
      <Navbar />

      <main className="relative z-10 w-full">
        <SlideshowDeck slides={slides} />
      </main>

      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />
    </div>
  );
}
