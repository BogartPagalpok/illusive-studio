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
  const modalSwiperRef = useRef<SwiperType | null>(null);

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
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 flex flex-col items-center"
        >
          <span className="section-subtitle">Portfolio</span>
          <h2 className="section-title">Selected Works</h2>
          <div className="section-divider" />
        </motion.div>

        {/* Category Pills */}
        <div className="flex gap-4 md:gap-6 items-center overflow-x-auto no-scrollbar mb-8 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap px-4 py-2 rounded-full border ${
                activeCategory === cat
                  ? 'text-accent border-accent bg-accent/10'
                  : 'text-[var(--text-primary)]/40 border-transparent hover:text-[var(--text-primary)] hover:border-[var(--glass-border)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* COVERFLOW CAROUSEL — Main Display */}
        <div className="max-w-5xl mx-auto">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            spaceBetween={30}
            coverflowEffect={{
              rotate: 45,
              stretch: 0,
              depth: 200,
              modifier: 1,
              slideShadows: false,
            }}
            onSlideChange={(s) => setActiveIndex(s.activeIndex)}
            className="w-full !pb-4"
          >
            {filteredProjects.map((project) => (
              <SwiperSlide key={project.id} className="!w-[75%] md:!w-[55%]">
                <GlowCard
                  glowColor="var(--accent)"
                  glowSize={150}
                  glowIntensity={0.08}
                  borderRadius="24px"
                >
                  <div className="relative rounded-[24px] overflow-hidden border" style={{ borderColor: 'var(--glass-border)', aspectRatio: '16/10' }}>
                    <img
                      src={project.hero_bg_desktop || project.image_url}
                      className="w-full h-full object-cover"
                      alt={project.title}
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="text-white/60 text-[9px] font-bold tracking-[0.3em] uppercase block mb-1">
                        {project.category}
                      </span>
                      <h3 className="text-white text-lg md:text-xl font-black uppercase tracking-tighter">
                        {project.title}
                      </h3>
                    </div>
                  </div>
                </GlowCard>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Info Bar — Always Visible */}
          {currentProject && (
            <motion.div
              key={currentProject.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 px-2"
            >
              <div className="text-center md:text-left">
                <span className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase block mb-1">
                  {currentProject.category}
                </span>
                <p className="text-[var(--text-secondary)] text-xs md:text-sm max-w-md">
                  {currentProject.description?.slice(0, 120)}...
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(currentProject)}
                className="btn-primary whitespace-nowrap"
              >
                View Project
              </button>
            </motion.div>
          )}

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {filteredProjects.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveIndex(idx); swiperRef.current?.slideTo(idx); }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex ? 'bg-accent scale-125' : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Project Modal — Same Coverflow + Details */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col"
            style={{ backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 z-[10000] p-3 rounded-full border transition-all"
              style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
            >
              <X size={20} />
            </button>

            {/* Modal Coverflow Carousel */}
            <div className="flex-1 flex items-center min-h-0">
              <Swiper
                onSwiper={(s) => { modalSwiperRef.current = s; }}
                modules={[EffectCoverflow]}
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                slidesPerView="auto"
                spaceBetween={20}
                coverflowEffect={{
                  rotate: 40,
                  stretch: 0,
                  depth: 180,
                  modifier: 1,
                  slideShadows: false,
                }}
                className="w-full !pb-4"
              >
                {galleryImages.map((img) => (
                  <SwiperSlide key={img.id} className="!w-[80%] md:!w-[60%]">
                    <img
                      src={img.hero_bg_desktop || img.image_url}
                      className="w-full h-auto max-h-[70vh] rounded-[24px] border object-cover"
                      style={{ borderColor: 'var(--glass-border)' }}
                      alt=""
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Project Details (scrollable) */}
            <div
              className="max-h-[30vh] overflow-y-auto no-scrollbar px-6 py-6 border-t"
              style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--glass-bg)' }}
            >
              <div className="max-w-3xl mx-auto space-y-4">
                <div>
                  <span className="text-accent text-[10px] font-bold tracking-[0.4em] uppercase block mb-1">
                    {selectedProject.category}
                  </span>
                  <h2 className="text-[var(--text-primary)] text-xl md:text-2xl font-black uppercase tracking-tighter">
                    {selectedProject.title}
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed mt-2">
                    {selectedProject.description}
                  </p>
                </div>

                {selectedProject.tools && selectedProject.tools.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--text-primary)]/60 mb-2">Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tools.map((t) => (
                        <span key={t} className="px-3 py-1.5 border rounded-lg text-[9px] uppercase font-bold tracking-widest" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
