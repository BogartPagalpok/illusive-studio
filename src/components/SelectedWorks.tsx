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
  process?: string;
  tools?: string[];
  results?: string;
  featured?: boolean;
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
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [selectedProject]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-transparent gap-6">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  const currentProject = filteredProjects[activeIndex];
  const galleryImages = selectedProject 
    ? projects.filter(p => p.title.trim() === selectedProject.title.trim())
    : [];

  return (
    <section id="works" className="relative z-10 bg-transparent py-20 overflow-hidden flex flex-col">
      
      {/* TRANSITION TITLE - Fixed sizing and spacing to match About */}
      <div className="text-center mb-12 md:mb-20 relative z-50 shrink-0">
        <p className="text-sm font-heading tracking-[0.3em] uppercase text-accent mb-4">
          Portfolio
        </p>
        <h2 className="font-bold tracking-tighter heading-lg uppercase text-white">
          Selected Works
        </h2>
        <div className="mt-6 w-20 h-0.5 bg-accent mx-auto" />
      </div>

      <div className="relative w-full h-auto flex flex-col">
        <AnimatePresence mode="wait">
          {currentProject && (
            <motion.div
              key={currentProject.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-0 pointer-events-none"
            >
              <img 
                src={currentProject.hero_bg_mobile || currentProject.image_url} 
                className="w-full h-full object-cover md:hidden" 
                alt="" 
              />
              <img 
                src={currentProject.hero_bg_desktop || currentProject.image_url} 
                className="hidden md:block w-full h-full object-cover" 
                alt="" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-[1400px] mx-auto px-6 md:px-16 w-full relative z-20">
          <div className="flex gap-6 md:gap-8 items-center overflow-x-auto no-scrollbar pb-8 shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeCategory === cat ? 'text-white scale-110' : 'text-white/40 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col w-full pb-20">
            <div className="max-w-3xl mb-12">
              <AnimatePresence mode="wait">
                {currentProject && (
                  <motion.div
                    key={currentProject.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase block mb-4">
                      {currentProject.category}
                    </span>
                    <h1 className="text-white text-4xl md:text-6xl font-bold uppercase tracking-tight leading-none mb-6">
                      {currentProject.title}
                    </h1>
                    <p className="text-white/70 text-base md:text-lg leading-relaxed mb-8 max-w-2xl line-clamp-3">
                      {currentProject.description}
                    </p>
                    <button 
                      type="button"
                      onClick={() => setSelectedProject(currentProject)}
                      className="flex items-center gap-3 bg-accent text-black px-10 py-4 text-xs font-black rounded-full hover:drop-shadow-[0_0_20px_var(--accent)] transition-all uppercase tracking-widest"
                    >
                      <Play size={16} fill="black" /> View Project
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-full relative z-50">
              <h2 className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                Up Next in Portfolio
              </h2>
              
              <Swiper
                onSwiper={(s) => (swiperRef.current = s)}
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={'auto'}
                slidesOffsetAfter={100}
                onSlideChange={(s) => setActiveIndex(s.activeIndex)}
                className="overflow-visible"
              >
                {filteredProjects.map((project, idx) => (
                  <SwiperSlide key={project.id} className="!w-[160px] md:!w-[280px]">
                    <div 
                      onClick={() => {
                        setActiveIndex(idx);
                        swiperRef.current?.slideTo(idx);
                      }}
                      className={`relative aspect-video bg-white/5 cursor-pointer transition-all duration-500 rounded-xl overflow-hidden border-2 ${
                        activeIndex === idx ? 'border-accent scale-105 shadow-[0_0_20px_var(--accent)]' : 'border-white/5 opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
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

      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl overflow-y-auto"
            onClick={() => setSelectedProject(null)}
          >
            <button onClick={() => setSelectedProject(null)} className="fixed top-8 right-8 text-white bg-white/10 p-3 rounded-full z-[10000]"><X size={24} /></button>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 bg-white/5 border border-white/10 p-10 rounded-[40px] shadow-2xl backdrop-blur-3xl"
            >
              <div className="rounded-2xl overflow-hidden space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar bg-white/5 p-2 border border-white/10">
                 {galleryImages.map((img) => (
                    <img key={img.id} src={img.hero_bg_desktop || img.image_url} className="w-full rounded-xl" alt="" />
                 ))}
              </div>
              <div className="space-y-8 text-left">
                <div>
                  <span className="text-accent text-xs font-black tracking-[0.4em] uppercase">{selectedProject.category}</span>
                  <h2 className="text-white text-5xl font-bold uppercase mt-4 tracking-tighter">{selectedProject.title}</h2>
                  <p className="text-white/70 text-lg leading-relaxed mt-6">{selectedProject.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tools?.map((t: string) => (
                    <span key={t} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] uppercase text-white/80 font-bold tracking-widest">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx global>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </section>
  );
}
