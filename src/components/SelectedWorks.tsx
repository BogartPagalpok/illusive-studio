import { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeft, ChevronRight, Play, Loader2 } from 'lucide-react';
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
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
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
      setFilteredProjects(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  useEffect(() => {
    const filtered = activeCategory === 'All' 
      ? projects 
      : projects.filter(p => p.category === activeCategory);
    
    setFilteredProjects(filtered);
    setActiveIndex(0);
  }, [activeCategory, projects]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <Loader2 className="animate-spin text-accent w-12 h-12" />
    </div>
  );

  const currentProject = filteredProjects[activeIndex];

  return (
    <section id="works" className="relative h-screen w-full bg-black overflow-hidden font-sans">
      
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
              className="w-full h-full object-cover opacity-60"
              alt="Background"
            />
            {/* Cinematic Vignettes for that Netflix look */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col justify-between px-6 md:px-16 py-8 md:py-12">
        
        {/* 2. TOP GENRE NAVIGATION */}
        <div className="flex gap-4 md:gap-8 items-center pt-4 md:pt-8 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeCategory === cat ? 'text-white scale-110' : 'text-white/40 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. HERO CONTENT - CENTER PIECE */}
        <div className="max-w-4xl mt-12 md:mt-0">
          <AnimatePresence mode="wait">
            {currentProject && (
              <motion.div
                key={`content-${currentProject.id}`}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <span className="text-accent text-xs md:text-sm font-black tracking-[0.3em] uppercase block mb-2 md:mb-4">
                  {currentProject.category}
                </span>
                <h1 className="text-white text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-4 md:mb-6">
                  {currentProject.title}
                </h1>
                <p className="text-white/70 text-sm md:text-lg font-light leading-relaxed mb-6 md:mb-10 max-w-2xl">
                  {currentProject.description || "Experimental digital execution focusing on industrial minimalism and structural integrity."}
                </p>
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 bg-white text-black px-6 md:px-10 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-sm hover:bg-accent transition-all">
                    <Play size={16} fill="black" /> View Project
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. BOTTOM RAIL (Up Next) */}
        <div className="w-full pb-4 md:pb-8">
          <h2 className="text-white/30 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Up Next In Portfolio
          </h2>
          
          {filteredProjects.length > 0 ? (
            <div className="relative group">
              <Swiper
                key={activeCategory} // Forces refresh to fix cutoff issues
                onSwiper={(s) => (swiperRef.current = s)}
                modules={[Navigation]}
                spaceBetween={15}
                slidesPerView={'auto'}
                navigation={{ nextEl: '.rail-next', prevEl: '.rail-prev' }}
                onSlideChange={(s) => setActiveIndex(s.realIndex)}
                className="!overflow-visible"
              >
                {filteredProjects.map((project, idx) => (
                  <SwiperSlide key={project.id} className="!w-[140px] md:!w-[260px]">
                    <div 
                      onClick={() => swiperRef.current?.slideTo(idx)}
                      className={`relative aspect-video cursor-pointer transition-all duration-500 rounded-sm overflow-hidden border-2 ${
                        activeIndex === idx 
                          ? 'border-accent scale-105 shadow-[0_0_25px_rgba(var(--accent-rgb),0.4)] z-20' 
                          : 'border-white/5 opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                      }`}
                    >
                      <img 
                        src={project.image_url} 
                        className="w-full h-full object-cover" 
                        alt={project.title} 
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Controls */}
              <div className="flex gap-3 mt-4">
                <button className="rail-prev p-2 border border-white/10 text-white/40 hover:text-white hover:border-white transition-all">
                  <ChevronLeft size={18} />
                </button>
                <button className="rail-next p-2 border border-white/10 text-white/40 hover:text-white hover:border-white transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-10 border border-white/5 border-dashed text-center text-white/20 text-[10px] uppercase font-black tracking-widest">
              Category Empty
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .swiper-slide { height: auto !important; }
      `}</style>
    </section>
  );
}
