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
import CinematicTimeline, { TimelineSectionItem } from '../components/CinematicTimeline';
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

  // Master Cinematic Timeline (Obys Agency & Mad Dogs style unbroken scroll choreography)
  const timelineSections: TimelineSectionItem[] = useMemo(() => {
    const list: TimelineSectionItem[] = [
      {
        id: 'hero',
        watermark: 'IAN LESTER // 01',
        fullBleed: true,
        content: <Hero isTimelineMode={true} />,
      },
    ];

    if (isSectionVisible('dual-showreel', true)) {
      list.push({
        id: 'dual-showreel',
        watermark: 'SHOWREELS // 02',
        content: <DualShowreel />,
      });
    }

    if (isSectionVisible('about', true)) {
      list.push({
        id: 'about',
        watermark: 'PROFILE // 03',
        content: <About />,
      });
    }

    if (isSectionVisible('services', true)) {
      list.push({
        id: 'services',
        watermark: 'SERVICES // 04',
        content: <Services />,
      });
    }

    if (isSectionVisible('works', true)) {
      list.push({
        id: 'works',
        watermark: 'CASE STUDY // 05',
        content: <ProjectPortal />,
      });

      list.push({
        id: 'works-motion-shorts',
        watermark: 'SHORTS // 06',
        content: <CategorySection category="Motion" groupIndex={0} hideHeader={false} />,
      });

      list.push({
        id: 'works-motion-events',
        watermark: 'EVENTS // 07',
        content: <CategorySection category="Motion" groupIndex={1} hideHeader={false} />,
      });

      list.push({
        id: 'works-motion-led',
        watermark: 'STAGE // 08',
        content: <CategorySection category="Motion" groupIndex={2} hideHeader={false} />,
      });

      list.push({
        id: 'works-graphics',
        watermark: 'DESIGN // 09',
        content: <CategorySection category="Graphic Design" />,
      });

      list.push({
        id: 'works-uiux',
        watermark: 'UI / UX // 10',
        content: <CategorySection category="UI/UX" />,
      });

      list.push({
        id: 'works-photography',
        watermark: 'PHOTO // 11',
        content: <CategorySection category="Photography" />,
      });
    }

    if (isSectionVisible('contact', true)) {
      list.push({
        id: 'contact',
        watermark: 'CONNECT // 12',
        content: <Contact />,
      });
    }

    list.push({
      id: 'footer',
      watermark: 'DIRECTORY // 13',
      content: <Footer onAdminTrigger={handleAdminTrigger} />,
    });

    return list;
  }, [sections, handleAdminTrigger]);

  return (
    <div className="relative min-h-screen w-full selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]">
      <Navbar />

      <main className="relative z-10 w-full">
        <CinematicTimeline sections={timelineSections} />
      </main>

      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />
    </div>
  );
}
