import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Play, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

import 'swiper/css';
import 'swiper/css/navigation';

interface Project {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description?: string;
}

const CATEGORIES = ['All', 'Graphic Design', 'Photography', 'UI/UX', 'Motion'];

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorks(); }, [fetchWorks]);

  const filteredProjects = useMemo(() => {
    return activeCategory === 'All' 
      ? projects 
      : projects.filter(p => p.category === activeCategory);
  }, [activeCategory, projects]);

  useEffect(() => {
    if (swiperRef.current) swiperRef.current.slideTo(0);
    setActiveIndex(0);
  }, [activeCategory]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-10 h-10 text-accent animate-spin" />
    </div>
  );

  const currentProject = filteredProjects[activeIndex];

  return (
    <section id="works" className="relative h-screen w-full bg-black overflow-hidden font-sans">
      
      {/* 1. BACKGROUND ENGINE */}
      <AnimatePresence mode="wait">
        {currentProject && (
          <motion.div
            key={`bg-${currentProject.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={currentProject.image_url} 
              className="w-full h-full object-cover opacity-40 pointer-events-none"
              alt="Background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN UI CONTAINER */}
      <div className="relative z-10 h-full flex flex-col px-6 md:px-12 pb-10">
        
        {/* TOP GENRE NAV - Safe area for mobile */}
        <div className="flex gap-6 items-center pt-24 md:pt-32 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeCategory === cat ? 'text-white scale-110' : 'text-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* BOTTOM STACK - Hero Info + Rail pinned together at bottom */}
        <div className="mt-auto flex flex-col gap-8 md:gap-12">
          
          {/* HERO CONTENT - Scaled for Desktop & Mobile */}
          <div className="max-w-4xl">
            <AnimatePresence mode="wait">
              {currentProject && (
                <motion.div
                  key={`hero-${currentProject.id}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-accent text-[10px] md:text-xs font-black tracking-[0.4em] uppercase block mb-2">
                    {currentProject.category}
                  </span>
                  {/* FIX: Title font size reigned in for Desktop (max 6xl) */}
                  <h1 className="text-white text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-4 max-w-[850px]">
                    {currentProject.title}
                  </h1>
                  <p className="text-white/60 text-xs md:text-base font-light leading-relaxed mb-6 max-w-xl line-clamp-3">
                    {currentProject.description || "Experimental visual design and digital texture reconstruction."}
                  </p>
                  <button 
                    type="button"
                    onClick={() => setSelectedProject(currentProject)}
                    className="flex items-center gap-2 bg-white text-black px-6 py-2.5 md:px-8 md:py-3 text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all"
                  >
                    <Play size={14} fill="black" /> View Project
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* UP NEXT RAIL - Clutter Fix */}
          <div className="w-full">
            <h2 className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
              Up Next In Portfolio
            </h2>
            
            <div className="relative">
              <Swiper
                key={activeCategory} 
                onSwiper={(s) => (swiperRef.current = s)}
                modules={[Navigation]}
                spaceBetween={12}
                slidesPerView={'auto'}
                navigation={{ nextEl: '.rail-next', prevEl: '.rail-prev' }}
                onSlideChange={(s) => setActiveIndex(s.realIndex)}
                className="!overflow-visible"
              >
                {filteredProjects.map((project, idx) => (
                  <SwiperSlide key={project.id} className="!w-[120px] md:!w-[220px]">
                    <div 
                      onClick={() => swiperRef.current?.slideTo(idx)}
                      className={`relative aspect-video cursor-pointer transition-all duration-500 rounded-sm overflow-hidden border-2 ${
                        activeIndex === idx 
                          ? 'border-accent scale-105 shadow-[0_0_20px_var(--accent)] z-20' 
                          : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                      }`}
                    >
                      <img src={project.image_url} className="w-full h-full object-cover" alt="thumbnail" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL LIGHTBOX */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/98 backdrop-blur-2xl"
          >
            <button onClick={() => setSelectedProject(null)} className="absolute top-10 right-10 text-white/50 hover:text-white"><X size={32} /></button>
            <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center px-4">
              <img src={selectedProject.image_url} className="w-full border border-white/10" alt="modal-view" />
              <div className="text-left">
                <span className="text-accent text-xs font-black uppercase tracking-widest">{selectedProject.category}</span>
                <h2 className="text-white text-4xl md:text-5xl font-black uppercase mt-4">{selectedProject.title}</h2>
                <p className="text-white/60 mt-6 text-sm md:text-lg font-light leading-relaxed">{selectedProject.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
