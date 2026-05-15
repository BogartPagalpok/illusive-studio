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
    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 0);
      swiperRef.current.update();
    }
    setActiveIndex(0);
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
        
        {/* UNIVERSAL TITLE STANDARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 flex flex-col items-center"
        >
          <p className="text-sm font-heading tracking-[0.3em] uppercase text-accent mb-4 font-bold">
            Portfolio
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white">
            {'SELECTED WORKS'.split(' ').map((word, i, arr) => (
              <span key={i}>
                {word === '&' ? <span className="text-accent">&</span> : word}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
          <div className="mt-8 w-16 h-1 bg-accent rounded-full" />
        </motion.div>

        {/* HERO CARD */}
        <div className="relative w-full rounded-[40px] overflow-hidden bg-surface border border-border flex flex-col h-[clamp(600px,80vh,900px)]">
          
          <AnimatePresence mode="wait">
            {currentProject && (
              <motion.div
                key={currentProject.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 z-0 pointer-events-none"
              >
                <img 
                  src={currentProject.hero_bg_desktop || currentProject.image_url} 
                  className="w-full h-full object-cover" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 p-8 md:p-14 flex flex-col h-full">
            {/* CATEGORIES */}
            <div className="flex gap-8 items-center overflow-x-auto no-scrollbar mb-10 shrink-0 border-b border-white/5 pb-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                    activeCategory === cat ? 'text-accent border-b border-accent pb-1' : 'text-primary/40 hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* INFO BLOCK - Scrollable if description is too long, but leaves space for swiper area */}
            <div className="max-w-2xl w-full flex-1 min-h-0 overflow-y-auto no-scrollbar py-4">
              <AnimatePresence mode="wait">
                {currentProject && (
                  <motion.div
                    key={currentProject.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                  >
                    <span className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase block mb-3">
                      {currentProject.category}
                    </span>
                    <h3 className="text-primary text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                      {currentProject.title}
                    </h3>
                    <p className="text-secondary text-sm md:text-base leading-relaxed max-w-xl">
                      {currentProject.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ACTION AREA - VIEW PROJECT FIXED AT BOTTOM */}
            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-8 shrink-0">
              <div className="flex items-center">
                <button 
                  onClick={() => setSelectedProject(currentProject)}
                  className="btn-primary group"
                >
                  <Play size={14} />
                  <span>View Project</span>
                </button>
              </div>

              <Swiper
                onSwiper={(s) => (swiperRef.current = s)}
                modules={[Navigation]}
                spaceBetween={16}
                slidesPerView={'auto'}
                onSlideChange={(s) => setActiveIndex(s.activeIndex)}
                className="w-full"
              >
                {filteredProjects.map((project, idx) => (
                  <SwiperSlide key={project.id} className="!w-[140px] md:!w-[220px]">
                    <div 
                      onClick={() => {
                        setActiveIndex(idx);
                        swiperRef.current?.slideTo(idx);
                      }}
                      className={`relative aspect-video cursor-pointer transition-all duration-500 rounded-xl overflow-hidden border-2 ${
                        activeIndex === idx ? 'border-accent scale-105 shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]' : 'border-transparent grayscale opacity-40 hover:opacity-100 hover:grayscale-0'
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

    {/* PROJECT MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-background/95 backdrop-blur-2xl"
            onClick={() => setSelectedProject(null)}
          >
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => setSelectedProject(null)} 
              className="fixed top-6 right-6 z-[10000] text-white bg-white/10 p-3 rounded-full border border-white/20 hover:bg-accent hover:text-white transition-all shadow-xl"
            >
              <X size={20} />
            </button>

            {/* MODAL BODY */}
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 md:gap-12 bg-surface border border-white/10 p-6 md:p-12 rounded-[32px] md:rounded-[40px] shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              {/* LEFT SIDE: GALLERY */}
              <div className="space-y-6">
                 {galleryImages.map((img) => (
                    <img 
                      key={img.id} 
                      src={img.hero_bg_desktop || img.image_url} 
                      className="w-full rounded-[20px] shadow-lg border border-white/5" 
                      alt="" 
                    />
                 ))}
              </div>

              {/* RIGHT SIDE: CONTENT */}
              <div className="space-y-8 lg:sticky lg:top-0 h-fit">
                <div>
                  <span className="text-accent text-[10px] font-bold tracking-[0.4em] uppercase mb-4 block">
                    {selectedProject.category}
                  </span>
                  <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
                    {selectedProject.title}
                  </h2>
                  <p className="text-white/70 text-base md:text-lg leading-relaxed mt-6">
                    {selectedProject.description}
                  </p>
                </div>
                
                {selectedProject.tools && (
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tools.map((t) => (
                      <span 
                        key={t} 
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] uppercase text-white/60 font-bold tracking-widest hover:border-accent hover:text-accent transition-colors"
                      >
                        {t}
                      </span>
                    ))}
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
