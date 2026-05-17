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
    document.body.style.overflow = selectedProject ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProject]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-transparent">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  const currentProject = filteredProjects[activeIndex];
  const galleryImages = selectedProject
    ? projects.filter(p => p.title.trim() === selectedProject.title.trim())
    : [];

  return (
    <section id="works" className="relative py-16 lg:py-20 overflow-visible z-40 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 flex flex-col items-center"
        >
          <span className="section-subtitle">Portfolio</span>
          <h2 className="section-title">Selected Works</h2>
          <div className="section-divider" />
        </motion.div>

        {/* Category Pills */}
        <div className="flex gap-3 md:gap-4 items-center overflow-x-auto no-scrollbar mb-6 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap px-3 py-1.5 rounded-full border ${
                activeCategory === cat
                  ? 'text-accent border-accent bg-accent/10'
                  : 'text-[var(--text-primary)]/40 border-transparent hover:text-[var(--text-primary)] hover:border-[var(--glass-border)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* COVERFLOW CAROUSEL */}
        <div className="max-w-4xl mx-auto">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            spaceBetween={16}
            coverflowEffect={{ rotate: 40, stretch: 0, depth: 160, modifier: 1, slideShadows: false }}
            onSlideChange={(s) => setActiveIndex(s.activeIndex)}
            className="w-full"
          >
            {filteredProjects.map((project) => (
              <SwiperSlide key={project.id} className="!w-[80%] md:!w-[50%]">
                <GlowCard glowColor="var(--accent)" glowSize={120} glowIntensity={0.06} borderRadius="20px">
                  <div className="relative rounded-[20px] overflow-hidden border flex flex-col" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--glass-bg)' }}>
                    {/* Image */}
                    <div style={{ aspectRatio: '16/10' }}>
                      <img
                        src={project.hero_bg_desktop || project.image_url}
                        className="w-full h-full object-cover"
                        alt={project.title}
                        draggable={false}
                      />
                    </div>
                    {/* Embedded Caption + Button */}
                    <div className="p-3 md:p-4 flex flex-col gap-2">
                      <div>
                        <span className="text-accent text-[8px] font-bold tracking-[0.2em] uppercase block mb-0.5">{project.category}</span>
                        <h3 className="text-[var(--text-primary)] text-sm md:text-base font-black uppercase tracking-tighter leading-tight">{project.title}</h3>
                        <p className="text-[var(--text-secondary)] text-[10px] md:text-xs leading-relaxed mt-1 line-clamp-2">{project.description}</p>
                      </div>
                      <button onClick={() => setSelectedProject(project)} className="btn-primary-sm w-full text-[9px] py-2">View Project</button>
                    </div>
                  </div>
                </GlowCard>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-1.5 mt-5">
            {filteredProjects.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveIndex(idx); swiperRef.current?.slideTo(idx); }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-accent scale-125' : 'bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal — Compact 4-Column + Carousel */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col"
            style={{ backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)' }}
          >
            <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 z-[10000] p-2.5 rounded-full border transition-all" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}>
              <X size={18} />
            </button>

            {/* Carousel */}
            <div className="flex-1 flex items-center min-h-0 pt-12 pb-2">
              <Swiper modules={[EffectCoverflow]} effect="coverflow" grabCursor={true} centeredSlides={true} slidesPerView="auto" spaceBetween={16} coverflowEffect={{ rotate: 35, stretch: 0, depth: 140, modifier: 1, slideShadows: false }} className="w-full">
                {galleryImages.map((img) => (
                  <SwiperSlide key={img.id} className="!w-[85%] md:!w-[55%]">
                    <img src={img.hero_bg_desktop || img.image_url} className="w-full h-auto max-h-[60vh] rounded-[16px] border object-cover" style={{ borderColor: 'var(--glass-border)' }} alt="" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Compact 4-Column Details */}
            <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--glass-bg)' }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                {/* Category + Title */}
                <div>
                  <span className="text-accent font-bold tracking-[0.2em] uppercase block mb-0.5">{selectedProject.category}</span>
                  <h2 className="text-[var(--text-primary)] text-sm font-black uppercase tracking-tighter leading-tight">{selectedProject.title}</h2>
                </div>
                {/* Description */}
                <div>
                  <h4 className="text-[var(--text-primary)]/40 font-bold tracking-[0.2em] uppercase mb-0.5">About</h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed text-[10px]">{selectedProject.description}</p>
                </div>
                {/* Tools */}
                <div>
                  <h4 className="text-[var(--text-primary)]/40 font-bold tracking-[0.2em] uppercase mb-0.5">Tools</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedProject.tools?.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 border rounded text-[8px] uppercase font-bold tracking-widest" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>{t}</span>
                    ))}
                  </div>
                </div>
                {/* Process + Results */}
                <div>
                  {selectedProject.process && <><h4 className="text-[var(--text-primary)]/40 font-bold tracking-[0.2em] uppercase mb-0.5">Process</h4><p className="text-[var(--text-secondary)] leading-relaxed text-[10px] mb-1">{selectedProject.process}</p></>}
                  {selectedProject.results && <><h4 className="text-[var(--text-primary)]/40 font-bold tracking-[0.2em] uppercase mb-0.5">Results</h4><p className="text-[var(--text-secondary)] leading-relaxed text-[10px]">{selectedProject.results}</p></>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
