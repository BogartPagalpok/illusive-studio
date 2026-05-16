import { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Play, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

import 'swiper/css';
import 'swiper/css/navigation';
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
    <section id="works" className="relative section-padding overflow-visible z-40 bg-transparent">
      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 flex flex-col items-center"
        >
          <span className="section-subtitle">Portfolio</span>
          <h2 className="section-title">Selected Works</h2>
          <div className="section-divider" />
        </motion.div>

        {/* Hero Card */}
        <div
          className="relative w-full rounded-2xl overflow-hidden card-glass flex flex-col"
          style={{ height: 'clamp(500px, 70vh, 800px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
        >
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
                  className="w-full h-full object-cover object-center"
                  alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)]/60 via-[var(--bg-primary)]/10 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/80 via-transparent to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 flex flex-col h-full p-5 md:p-6">
            <div className="flex-none">
              <div className="flex gap-4 md:gap-6 items-center overflow-x-auto no-scrollbar mb-4 border-b border-[var(--glass-border)] pb-2">
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

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar mb-4 flex items-end">
              <AnimatePresence mode="wait">
                {currentProject && (
                  <motion.div
                    key={currentProject.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="max-w-lg"
                  >
                    <span className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase block mb-1">
                      {currentProject.category}
                    </span>
                    <h3 className="text-[var(--text-primary)] text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[1.1] break-words">
                      {currentProject.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed mt-2">
                      {currentProject.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-none pt-4 border-t border-[var(--glass-border)] flex flex-col gap-4">
              <div className="flex items-center">
                <button onClick={() => setSelectedProject(currentProject)} className="btn-primary group">
                  <Play size={14} />
                  <span>View Project</span>
                </button>
              </div>

              <Swiper
                onSwiper={(s) => { swiperRef.current = s; }}
                modules={[Navigation, EffectCoverflow]}
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                slidesPerView="auto"
                spaceBetween={12}
                coverflowEffect={{ rotate: 45, stretch: 0, depth: 150, modifier: 1, slideShadows: false }}
                onSlideChange={(s) => setActiveIndex(s.activeIndex)}
                className="w-full !pb-2"
              >
                {filteredProjects.map((project, idx) => (
                  <SwiperSlide key={project.id} className="!w-[100px] md:!w-[140px]">
                    <div
                      onClick={() => { setActiveIndex(idx); swiperRef.current?.slideTo(idx); }}
                      className={`relative aspect-video cursor-pointer transition-all duration-500 rounded-lg overflow-hidden border-2 ${
                        activeIndex === idx
                          ? 'border-accent scale-105 shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]'
                          : 'border-white/5 grayscale opacity-40 hover:opacity-100 hover:grayscale-0'
                      }`}
                    >
                      <img src={project.card_thumbnail || project.image_url} className="w-full h-full object-cover object-center" alt="" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      {/* Project Modal – 2/3 image, 1/3 details, no captions */}
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
              className="max-w-5xl w-full grid lg:grid-cols-3 gap-4 card-glass p-5 md:p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              {/* ── LEFT: Image – 2/3 width ── */}
              <div className="lg:col-span-2 w-full">
                <Swiper
                  modules={[EffectCoverflow, Navigation]}
                  effect="coverflow"
                  grabCursor={true}
                  centeredSlides={true}
                  slidesPerView="auto"
                  spaceBetween={16}
                  navigation
                  coverflowEffect={{ rotate: 45, stretch: 0, depth: 200, modifier: 1, slideShadows: false }}
                  className="w-full !pb-2"
                >
                  {galleryImages.map((img) => (
                    <SwiperSlide key={img.id} className="!w-[85%] md:!w-[80%]">
                      <img
                        src={img.hero_bg_desktop || img.image_url}
                        className="w-full h-auto max-h-[60vh] rounded-lg shadow-lg border border-[var(--glass-border)] object-cover object-center"
                        alt=""
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* ── RIGHT: Details – 1/3 width, smaller text ── */}
              <div className="space-y-4">
                <div>
                  <span className="text-accent text-[10px] font-bold tracking-[0.4em] uppercase mb-2 block">
                    {selectedProject.category}
                  </span>
                  <h2 className="text-[var(--text-primary)] text-lg md:text-xl font-black uppercase tracking-tighter leading-tight">
                    {selectedProject.title}
                  </h2>
                  <p className="text-[var(--text-secondary)] text-xs leading-relaxed mt-2">
                    {selectedProject.description}
                  </p>
                </div>

                {selectedProject.tools && selectedProject.tools.length > 0 && (
                  <div>
                    <h4 className="text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--text-primary)]/60 mb-2">Tools</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedProject.tools.map((t) => (
                        <span key={t} className="px-2 py-1 bg-white/5 border border-[var(--glass-border)] rounded-md text-[8px] uppercase text-[var(--text-secondary)] font-bold tracking-widest">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.process && (
                  <div>
                    <h4 className="text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--text-primary)]/60 mb-2">Process</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{selectedProject.process}</p>
                  </div>
                )}

                {selectedProject.results && (
                  <div>
                    <h4 className="text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--text-primary)]/60 mb-2">Results</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{selectedProject.results}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
    </section>
  );
}
