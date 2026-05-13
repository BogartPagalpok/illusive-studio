import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeft, ChevronRight, Play, Loader2, X, Maximize2 } from 'lucide-react';
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
    } catch (err) { console.error(err); } finally { setLoading(false); }
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
      <div className="relative z-10 h-full flex flex-col px-6 md:px-16 pb-10">
        
        {/* FIXED: CATEGORIES TO TOP LEFT */}
        <div className="flex gap-6 items-center pt-24 md:pt-32 justify-start overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeCategory === cat ? 'text-white border-b-2 border-accent pb-1' : 'text-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* BOTTOM STACK */}
        <div className="mt-auto flex flex-col gap-6 md:gap-10">
          
          {/* HERO CONTENT */}
          <div className="max-w-4xl">
            <AnimatePresence mode="wait">
              {currentProject && (
                <motion.div
                  key={`hero-${currentProject.id}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 10, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-accent text-[10px] md:text-xs font-black tracking-[0.4em] uppercase block mb-2">
                    {currentProject.category}
                  </span>
                  <h1 className="text-white text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-4 max-w-[800px]">
                    {currentProject.title}
                  </h1>
                  <p className="text-white/60 text-xs md:text-base font-light leading-relaxed mb-6 max-w-xl line-clamp-3 md:line-clamp-none">
                    {currentProject.description || "Experimental visual design and digital texture reconstruction."}
                  </p>
                  
                  {/* VIEW PROJECT BUTTON WITH ZOOM ACTION */}
                  <button 
                    type="button"
                    onClick={() => setSelectedProject(currentProject)}
                    className="flex items-center gap-3 bg-white text-black px-6 py-2.5 md:px-8 md:py-3 text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all group"
                  >
                    <Play size={14} fill="black" /> 
                    <span>View Project</span>
                    <Maximize2 size={12} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* UP NEXT RAIL */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">
                Up Next In Portfolio
              </h2>
              {/* RAIL NAVIGATION ARROWS */}
              <div className="flex gap-3">
                <button className="rail-prev text-white/40 hover:text-accent transition-colors"><ChevronLeft size={18} /></button>
                <button className="rail-next text-white/40 hover:text-accent transition-colors"><ChevronRight size={18} /></button>
              </div>
            </div>
            
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

      {/* FULLSCREEN PROJECT ZOOM (Modal) */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12 bg-black/98 backdrop-blur-3xl"
          >
            <button onClick={() => setSelectedProject(null)} className="absolute top-8 right-8 text-white/50 hover:text-white z-50"><X size={32} /></button>
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="max-w-7xl w-full h-full flex flex-col md:flex-row gap-12 items-center justify-center"
            >
              <div className="flex-1 w-full h-[50vh] md:h-full">
                <img src={selectedProject.image_url} className="w-full h-full object-contain border border-white/10" alt="project-zoom" />
              </div>
              <div className="flex-1 text-left max-w-xl">
                <span className="text-accent text-xs font-black uppercase tracking-widest">{selectedProject.category}</span>
                <h2 className="text-white text-4xl md:text-6xl font-black uppercase mt-4 leading-none">{selectedProject.title}</h2>
                <p className="text-white/60 mt-8 text-sm md:text-lg font-light leading-relaxed">{selectedProject.description}</p>
                <div className="mt-10 h-[1px] w-12 bg-accent" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
