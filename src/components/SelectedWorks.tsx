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
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('portfolio_projects').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setProjects(data || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchWorks();
  }, []);

  const filteredProjects = useMemo(() => {
    return activeCategory === 'All' ? projects : projects.filter(p => p.category === activeCategory);
  }, [activeCategory, projects]);

  useEffect(() => {
    if (swiperRef.current) swiperRef.current.slideTo(0);
    setActiveIndex(0);
  }, [activeCategory]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>;

  const currentProject = filteredProjects[activeIndex];

  return (
    <section id="works" className="relative h-screen min-h-[600px] w-full bg-black overflow-hidden font-sans">
      
      {/* 1. DYNAMIC BACKGROUND (Single Layer) */}
      <AnimatePresence mode="wait">
        {currentProject && (
          <motion.div
            key={currentProject.id}
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

      <div className="relative z-10 h-full flex flex-col justify-between px-6 md:px-12 py-10">
        
        {/* 2. TOP NAVIGATION */}
        <div className="flex gap-6 items-center pt-6 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all ${
                activeCategory === cat ? 'text-white scale-110' : 'text-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. HERO CONTENT - Reduced Scale */}
        <div className="max-w-4xl mt-10 md:mt-20">
          <AnimatePresence mode="wait">
            {currentProject && (
              <motion.div
                key={currentProject.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-accent text-[10px] md:text-xs font-black tracking-[0.4em] uppercase block mb-3">
                  {currentProject.category}
                </span>
                {/* FIX: Title text scaled down to fit properly */}
                <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-4 max-w-[800px]">
                  {currentProject.title}
                </h1>
                <p className="text-white/60 text-sm md:text-base font-light leading-relaxed mb-8 max-w-xl line-clamp-2 md:line-clamp-3">
                  {currentProject.description || "A professional visual asset execution focusing on high-contrast industrial minimalism."}
                </p>
                <button 
                  type="button"
                  onClick={() => setSelectedProject(currentProject)}
                  className="flex items-center gap-2 bg-white text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all"
                >
                  <Play size={16} fill="black" /> View Project
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. UP NEXT RAIL (Fixed cards) */}
        <div className="w-full pb-4">
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
                <SwiperSlide key={project.id} className="!w-[130px] md:!w-[220px]">
                  <div 
                    onClick={() => swiperRef.current?.slideTo(idx)}
                    className={`relative aspect-video cursor-pointer transition-all duration-500 rounded-sm overflow-hidden border-2 ${
                      activeIndex === idx 
                        ? 'border-accent scale-105 shadow-[0_0_20px_var(--accent)] z-20' 
                        : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                    }`}
                  >
                    {/* FIX: Ensuring thumbnail only shows the primary image_url */}
                    <img src={project.image_url} className="w-full h-full object-cover" alt="thumb" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            <div className="flex gap-4 mt-6">
              <button className="rail-prev text-white/20 hover:text-white"><ChevronLeft size={20} /></button>
              <button className="rail-next text-white/20 hover:text-white"><ChevronRight size={20} /></button>
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
            <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
              <img src={selectedProject.image_url} className="w-full border border-white/10" alt="view" />
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
