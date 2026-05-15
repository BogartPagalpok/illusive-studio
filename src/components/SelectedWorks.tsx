import { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Play, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

import 'swiper/css';
import 'swiper/css/navigation';

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

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

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

    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 0);
    }
  }, [activeCategory, projects]);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
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
    <section id="works" className="relative section-padding overflow-visible z-40 bg-transparent">
      <div className="section-container relative">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <span className="section-subtitle">Portfolio</span>
          <h2 className="section-title">Selected Works</h2>
          <div className="section-divider" />
        </motion.div>

        {/* Hero Card */}
        <div
          className="relative w-full rounded-[40px] overflow-hidden card-glass flex flex-col"
          style={{
            height: 'clamp(600px, 80vh, 900px)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}
        >
          {/* Background image */}
          <AnimatePresence mode="wait">
            {currentProject && (
              <motion.div
                key={currentProject.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 z-0 pointer-events-none"
              >
                <img
                  src={currentProject.hero_bg_desktop || currentProject.image_url}
                  className="w-full h-full object-cover"
                  alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)]/60 via-[var(--bg-primary)]/10 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/80 via-transparent to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 flex flex-col h-full p-6 md:p-10">
            {/* Categories */}
            <div className="flex-none">
              <div className="flex gap-6 md:gap-10 items-center overflow-x-auto no-scrollbar mb-6 border-b border-[var(--glass-border)] pb-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                      activeCategory === cat
                        ? 'text-accent border-b border-accent pb-1'
                        : 'text-[var(--text-primary)]/40 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable info */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar mb-6 flex items-end">
              <AnimatePresence mode="wait">
                {currentProject && (
                  <motion.div
                    key={currentProject.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="max-w-xl"
                  >
                    <span className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase block mb-2">
                      {currentProject.category}
                    </span>
                    <h3 className="text-[var(--text-primary)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[1.1] break-words">
                      {currentProject.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mt-3">
                      {currentProject.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action area + Swiper */}
            <div className="flex-none pt-6 border-t border-[var(--glass-border)] flex flex-col gap-6">
              <div className="flex items-center">
                <button onClick={() => setSelectedProject(currentProject)} className="btn-primary group">
                  <Play size={14} />
                  <span>View Project</span>
                </button>
              </div>

              <Swiper
                onSwiper={(s) => { swiperRef.current = s; }}
                modules={[Navigation]}
                spaceBetween={16}
                slidesPerView={'auto'}
                onSlideChange={(s) => setActiveIndex(s.activeIndex)}
                className="w-full !pb-2"
              >
                {filteredProjects.map((project, idx) => (
                  <SwiperSlide key={project.id} className="!w-[130px] md:!w-[180px]">
                    <div
                      onClick={() => {
                        setActiveIndex(idx);
                        swiperRef.current?.slideTo(idx);
                      }}
                      className={`relative aspect-video cursor-pointer transition-all duration-500 rounded-xl overflow-hidden border-2 ${
                        activeIndex === idx
                          ? 'border-accent scale-105 shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]'
                          : 'border-white/5 grayscale opacity-40 hover:opacity-100 hover:grayscale-0'
                      }`}
                    >
                      <img src={project.card_thumbnail || project.image_url} className="w-full h-full object-cover" alt="" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      {/* Project Modal – unchanged */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-[var(--bg-primary)]/95 backdrop-blur-2xl"
            onClick={() => setSelectedProject(null)}
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="fixed top-6 right-6 z-[10000] text-white bg-white/10 p-3 rounded-full border border-white/20 hover:bg-accent hover:text-white transition-all shadow-xl"
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 md:gap-12 card-glass p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              <div className="space-y-6">
                {galleryImages.map((img) => (
                  <img
                    key={img.id}
                    src={img.hero_bg_desktop || img.image_url}
                    className="w-full rounded-[20px] shadow-lg border border-[var(--glass-border)]"
                    alt=""
                  />
                ))}
              </div>

              <div className="space-y-6 lg:sticky lg:top-0 h-fit">
                <div>
                  <span className="text-accent text-[10px] font-bold tracking-[0.4em] uppercase mb-3 block">
                    {selectedProject.category}
                  </span>
                  <h2 className="text-[var(--text-primary)] text-3xl md:text-4xl font-black uppercase tracking-tighter leading-tight">
                    {selectedProject.title}
                  </h2>
                  <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed mt-4">
                    {selectedProject.description}
                  </p>
                </div>

                {selectedProject.tools && selectedProject.tools.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--text-primary)]/60 mb-2">Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tools.map((t) => (
                        <span
                          key={t}
                          className="px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-[9px] uppercase text-[var(--text-secondary)] font-bold tracking-widest hover:border-accent hover:text-accent transition-colors"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.process && (
                  <div>
                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--text-primary)]/60 mb-2">Process</h4>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selectedProject.process}</p>
                  </div>
                )}

                {selectedProject.results && (
                  <div>
                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--text-primary)]/60 mb-2">Results</h4>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selectedProject.results}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `
      }} />
    </section>
  );
}
