import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeft, ChevronRight, Play, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// Swiper Styles
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
  const [error, setError] = useState<string | null>(null);
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
    } catch (err: any) {
      setError(err.message || "Connection Failure");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  // UseMemo ensures we don't recalculate the filter on every tiny state change
  const filteredProjects = useMemo(() => {
    return activeCategory === 'All' 
      ? projects 
      : projects.filter(p => p.category === activeCategory);
  }, [activeCategory, projects]);

  // Reset slider when category changes to prevent index mismatch
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0);
    }
    setActiveIndex(0);
  }, [activeCategory]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  const currentProject = filteredProjects[activeIndex];

  return (
    <section id="works" className="relative h-screen min-h-[650px] w-full bg-black overflow-hidden font-sans">
      
      {/* 1. DYNAMIC BACKGROUND LAYER */}
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
              className="w-full h-full object-cover opacity-50 pointer-events-none"
              alt="Background"
            />
            {/* Cinematic Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col justify-between px-6 md:px-16 py-10">
        
        {/* 2. TOP GENRE NAVIGATION */}
        <div className="flex gap-6 md:gap-10 items-center pt-6 overflow-x-auto no-scrollbar">
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

        {/* 3. HERO CONTENT (SINGLE DISPLAY) */}
        <div className="max-w-4xl mt-10 md:mt-20">
          <AnimatePresence mode="wait">
            {currentProject && (
              <motion.div
                key={`hero-${currentProject.id}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-accent text-xs md:text-sm font-black tracking-[0.3em] uppercase block mb-3">
                  {currentProject.category}
                </span>
                <h1 className="text-white text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                  {currentProject.title}
                </h1>
                <p className="text-white/60 text-sm md:text-lg font-light leading-relaxed mb-8 max-w-2xl line-clamp-3">
                  {currentProject.description || "Experimental visual design and digital texture reconstruction."}
                </p>
                <button 
                  type="button"
                  onClick={() => setSelectedProject(currentProject)}
                  className="flex items-center gap-2 bg-white text-black px-6 md:px-10 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-sm hover:bg-accent transition-all"
                >
                  <Play size={16} fill="black" /> View Project
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. UP NEXT RAIL (Bottom Swiper) */}
        <div className="w-full pb-6">
          <h2 className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
            Up Next In Portfolio
          </h2>
          
          <div className="relative group">
            <Swiper
              onSwiper={(s) => (swiperRef.current = s)}
              modules={[Navigation]}
              spaceBetween={12}
              slidesPerView={'auto'}
              navigation={{ nextEl: '.rail-next', prevEl: '.rail-prev' }}
              onSlideChange={(s) => setActiveIndex(s.realIndex)}
              className="!overflow-visible"
            >
              {filteredProjects.map((project, idx) => (
                <SwiperSlide key={project.id} className="!w-[140px] md:!w-[240px]">
                  <div 
                    onClick={() => swiperRef.current?.slideTo(idx)}
                    className={`relative aspect-video cursor-pointer transition-all duration-500 rounded-sm overflow-hidden border-2 ${
                      activeIndex === idx 
                        ? 'border-accent scale-105 shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)]' 
                        : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                    }`}
                  >
                    <img src={project.image_url} className="w-full h-full object-cover" alt="thumb" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* MINI NAV ARROWS */}
            <div className="flex gap-4 mt-6">
              <button className="rail-prev p-2 border border-white/10 text-white/40 hover:text-white transition-all">
                <ChevronLeft size={20} />
              </button>
              <button className="rail-next p-2 border border-white/10 text-white/40 hover:text-white transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX / MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/98 backdrop-blur-2xl"
          >
            <button onClick={() => setSelectedProject(null)} className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={32} /></button>
            <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
              <img src={selectedProject.image_url} className="w-full border border-white/10" alt="modal-view" />
              <div className="text-left">
                <span className="text-accent text-xs font-black uppercase tracking-widest">{selectedProject.category}</span>
                <h2 className="text-white text-5xl font-black uppercase mt-4">{selectedProject.title}</h2>
                <p className="text-white/60 mt-6 text-lg font-light leading-relaxed">{selectedProject.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
