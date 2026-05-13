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

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('portfolio_projects').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setProjects(data || []);
        setFilteredProjects(data || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchWorks();
  }, []);

  useEffect(() => {
    const filtered = activeCategory === 'All' ? projects : projects.filter(p => p.category === activeCategory);
    setFilteredProjects(filtered);
    if (swiperRef.current) swiperRef.current.slideTo(0);
    setActiveIndex(0);
  }, [activeCategory, projects]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-accent" /></div>;

  const currentProject = filteredProjects[activeIndex];

  return (
    <section id="works" className="relative min-h-screen w-full bg-black overflow-hidden font-sans">
      
      {/* 1. DYNAMIC BACKGROUND */}
      <AnimatePresence mode="wait">
        {currentProject && (
          <motion.div
            key={currentProject?.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={currentProject?.image_url} 
              className="w-full h-full object-cover opacity-50"
              alt="Background"
            />
            {/* Cinematic Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 h-screen min-h-[700px] flex flex-col justify-between px-8 md:px-16 py-12">
        
        {/* 2. GENRE NAVIGATION */}
        <div className="flex gap-6 md:gap-8 items-center pt-8 overflow-x-auto pb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'text-white scale-110' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. HERO CONTENT - SINGLE DISPLAY */}
        <div className="max-w-3xl mb-12">
          <AnimatePresence mode="wait">
            {currentProject && (
              <motion.div
                key={currentProject?.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-accent text-sm font-black tracking-[0.3em] uppercase block mb-4">
                  {currentProject?.category}
                </span>
                <h1 className="text-white text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                  {currentProject?.title}
                </h1>
                <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed mb-8 max-w-2xl">
                  {currentProject?.description || "Pushing the boundaries of creative excellence and innovative design."}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="flex items-center gap-2 bg-white text-black px-8 py-3 font-bold rounded hover:bg-white/80 transition-all">
                    <Play size={20} fill="black" /> View Project
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. UP NEXT RAIL (Bottom Swiper) - Fixed Cutoff */}
        <div className="w-full pb-8">
          <h2 className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] mb-4">Up Next in Portfolio</h2>
          
          {filteredProjects.length > 0 ? (
            <>
              <Swiper
                onSwiper={(s) => (swiperRef.current = s)}
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={'auto'}
                navigation={{ nextEl: '.rail-next', prevEl: '.rail-prev' }}
                onSlideChange={(s) => setActiveIndex(s.realIndex)}
                className="overflow-visible"
              >
                {filteredProjects.map((project, idx) => (
                  <SwiperSlide key={project.id} className="!w-[160px] md:!w-[240px]">
                    <div 
                      onClick={() => swiperRef.current?.slideTo(idx)}
                      className={`relative aspect-video cursor-pointer transition-all duration-500 rounded-sm overflow-hidden border-2 ${
                        activeIndex === idx ? 'border-accent scale-105 shadow-[0_0_20px_var(--accent)]' : 'border-transparent opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
                      }`}
                    >
                      <img src={project.image_url} className="w-full h-full object-cover" alt={project.title} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Mini Nav Controls */}
              <div className="flex gap-4 mt-6">
                <button className="rail-prev text-white/20 hover:text-white transition-colors"><ChevronLeft size={24} /></button>
                <button className="rail-next text-white/20 hover:text-white transition-colors"><ChevronRight size={24} /></button>
              </div>
            </>
          ) : (
            <div className="text-white/10 text-xs font-black uppercase tracking-[0.2em]">No projects available</div>
          )}
        </div>
      </div>
    </section>
  );
}
