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
  const swiperRef = useRef<SwiperType | null>(null);

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

  return (
    <section id="works" className="relative py-16 lg:py-20 overflow-visible z-40 bg-transparent">
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

        <div className="max-w-4xl mx-auto">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={3}
            spaceBetween={0}
            coverflowEffect={{ rotate: 0, stretch: -20, depth: 100, modifier: 1, slideShadows: false }}
            onSlideChange={(s) => setActiveIndex(s.activeIndex)}
            className="w-full"
          >
            {filteredProjects.map((project, i) => (
              <SwiperSlide key={project.id}>
                <div className="transition-all duration-500" style={{ opacity: i === activeIndex ? 1 : 0.3 }}>
                  <div onClick={() => setSelectedProject(project)} className="cursor-pointer">
                    <GlowCard glowColor="var(--accent)" glowSize={120} glowIntensity={0.06} borderRadius="20px">
                      <div className="relative rounded-[20px] overflow-hidden border flex flex-col" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--glass-bg)', aspectRatio: '16/10' }}>
                        <div className="flex-1 overflow-hidden">
                          <img src={project.hero_bg_desktop || project.image_url} className="w-full h-full object-cover" alt={project.title} draggable={false} />
                        </div>
                        <div className="p-3 flex flex-col gap-1 flex-shrink-0" style={{ opacity: i === activeIndex ? 1 : 0 }}>
                          <span className="text-accent text-[8px] font-bold tracking-[0.2em] uppercase">{project.category}</span>
                          <h3 className="text-[var(--text-primary)] text-sm font-black uppercase tracking-tighter leading-tight">{project.title}</h3>
                        </div>
                      </div>
                    </GlowCard>
                  </div>
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

      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.95)' }} onClick={() => setSelectedProject(null)}>
            <button onClick={() => setSelectedProject(null)} className="fixed top-4 right-4 z-[10000] p-2.5 rounded-full border transition-all" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}>
              <X size={18} />
            </button>
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20" onClick={(e) => e.stopPropagation()}>
              <div className="max-w-3xl w-full space-y-6">
                {galleryImages.map((img) => (
                  <img key={img.id} src={img.hero_bg_desktop || img.image_url} className="w-full h-auto max-h-[60vh] rounded-2xl border object-cover" style={{ borderColor: 'var(--glass-border)' }} alt="" />
                ))}
              </div>
              <div className="mt-8 text-center max-w-xl">
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
    </section>
  );
}
