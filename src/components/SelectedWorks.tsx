import { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import GlowCard from './GlowCard';

import 'swiper/css';
import 'swiper/css/effect-coverflow';

const CATEGORIES = ['All', 'Graphic Design', 'Photography', 'UI/UX', 'Motion'];

interface Project {
  id: string;
  title: string;
  category: string;
  description?: string;
  card_thumbnail?: string;
  hero_bg_desktop?: string;
  hero_bg_mobile?: string;
  image_url: string;
  tools?: string[];
  process?: string;
  results?: string;
}

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (dbError) throw dbError;
      setProjects(data || []);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorks(); }, [fetchWorks]);

  useEffect(() => {
    const categoryFiltered = activeCategory === 'All'
      ? projects
      : projects.filter(p => p.category === activeCategory);
    const uniqueProjects: Project[] = [];
    const seenTitles = new Set<string>();
    categoryFiltered.forEach(p => {
      const cleanTitle = p.title.trim();
      if (!seenTitles.has(cleanTitle)) {
        seenTitles.add(cleanTitle);
        uniqueProjects.push(p);
      }
    });
    setFilteredProjects(uniqueProjects);
    setActiveIndex(0);
    swiperRef.current?.slideTo(0, 0);
  }, [activeCategory, projects]);

  useEffect(() => {
    document.body.style.overflow = selectedProject ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedProject]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-transparent">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  const galleryImages = selectedProject
    ? projects.filter(p => p.title.trim() === selectedProject.title.trim())
    : [];

  const coverflowSettings = {
    rotate: 45,
    stretch: 0,
    depth: 200,
    modifier: 1,
    slideShadows: false,
  };

  const getSrc = (p: Project) => p.hero_bg_desktop || p.image_url || p.card_thumbnail || '';

  return (
    <>
      <section id="works" className="relative py-16 lg:py-20 overflow-visible bg-transparent" style={{ zIndex: 40 }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-8 flex flex-col items-center">
            <span className="section-subtitle">Portfolio</span>
            <h2 className="section-title">Selected Works</h2>
            <div className="section-divider" />
          </motion.div>

          <div className="flex gap-3 md:gap-4 items-center overflow-x-auto no-scrollbar mb-6 justify-center">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap px-3 py-1.5 rounded-full border ${activeCategory === cat ? 'text-accent border-accent bg-accent/10' : 'text-[var(--text-primary)]/40 border-transparent hover:text-[var(--text-primary)] hover:border-[var(--glass-border)]'}`}>{cat}</button>
            ))}
          </div>

          <div className={isMobile ? '' : 'max-w-7xl mx-auto'}>
            <Swiper
              onSwiper={(s) => { swiperRef.current = s; }}
              modules={[EffectCoverflow]}
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={isMobile ? 1 : 3}
              spaceBetween={isMobile ? 0 : 40}
              coverflowEffect={coverflowSettings}
              onSlideChange={(s) => setActiveIndex(s.activeIndex)}
              className="w-full"
            >
              {filteredProjects.map((project, i) => (
                <SwiperSlide key={project.id}>
                  <div
                    className="transition-all duration-500 cursor-pointer"
                    style={{ opacity: isMobile ? 1 : (i === activeIndex ? 1 : 0.3) }}
                    onClick={() => setSelectedProject(project)}
                  >
                    <GlowCard glowColor="var(--accent)" glowSize={120} glowIntensity={0.06} borderRadius="20px">
                      <div
                        className="relative rounded-[20px] overflow-hidden border flex flex-col"
                        style={{
                          borderColor: 'var(--glass-border)',
                          backgroundColor: 'var(--glass-bg)',
                          aspectRatio: isMobile ? '4/5' : '16/9',
                          height: isMobile ? 'clamp(450px, 85vh, 750px)' : 'clamp(350px, 55vh, 600px)',
                          width: isMobile ? '90vw' : '100%',
                          margin: isMobile ? '0 auto' : '0',
                        }}
                      >
                        <div className="flex-1 overflow-hidden">
                          <img src={getSrc(project)} className="w-full h-full object-cover" alt={project.title} draggable={false} />
                        </div>
                        <div className="p-2.5 md:p-3 flex flex-col gap-0.5 flex-shrink-0">
                          <span className="text-accent text-[7px] md:text-[8px] font-bold tracking-[0.2em] uppercase">{project.category}</span>
                          <h3 className="text-[var(--text-primary)] text-[11px] md:text-sm font-black uppercase tracking-tighter leading-tight">{project.title}</h3>
                        </div>
                      </div>
                    </GlowCard>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="flex justify-center gap-1.5 mt-5">
            {filteredProjects.map((_, idx) => (
              <button key={idx} onClick={() => swiperRef.current?.slideTo(idx)} className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-accent scale-125' : 'bg-white/20 hover:bg-white/40'}`} />
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col"
            style={{ zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.95)' }}
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full border transition-all"
              style={{ zIndex: 100000, backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
            >
              <X size={18} />
            </button>

            <div className="flex-1 overflow-y-auto px-4 py-16" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="max-w-4xl mx-auto space-y-8 pb-10">
                {galleryImages.map((img) => (
                  <img
                    key={img.id}
                    src={getSrc(img)}
                    className="w-full h-auto rounded-2xl border"
                    style={{ borderColor: 'var(--glass-border)', objectFit: 'contain', maxHeight: 'none' }}
                    alt=""
                  />
                ))}
              </div>
              <div className="text-center max-w-xl mx-auto pb-10">
                <span className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase">{selectedProject.category}</span>
                <h2 className="text-white text-xl font-black uppercase tracking-tighter mt-1">{selectedProject.title}</h2>
                <p className="text-white/50 text-sm mt-2">{selectedProject.description}</p>
                {selectedProject.tools && (
                  <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                    {selectedProject.tools.map((t) => (
                      <span key={t} className="px-2 py-1 border border-white/10 rounded text-[9px] uppercase text-white/40 font-bold tracking-widest">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
