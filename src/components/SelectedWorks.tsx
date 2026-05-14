import { useState, useEffect, useCallback, useRef } from 'react';
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
    setActiveIndex(0);
    
    // Reset swiper when category changes
    if (swiperRef.current) {
      const swiper = swiperRef.current as any;
      if (typeof swiper.slideToLoop === 'function') {
        swiper.slideToLoop(0, 0);
      }
      swiper.update();
    }
  }, [activeCategory, projects]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  const currentProject = filteredProjects[activeIndex];
  const galleryImages = selectedProject 
    ? projects.filter(p => p.title.trim() === selectedProject.title.trim())
    : [];

  return (
    <section id="works" className="relative min-h-screen w-full bg-black overflow-hidden font-sans">
      
      <AnimatePresence mode="wait">
        {currentProject && (
          <motion.div
            key={currentProject.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            <img src={currentProject.image_url} className="w-full h-full object-cover" alt="bg" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 h-screen min-h-[700px] flex flex-col px-6 md:px-16 py-8 md:py-12">
        
        <div className="flex gap-6 md:gap-8 items-center pt-0 mt-8 overflow-x-auto no-scrollbar pb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat ? 'text-white scale-110' : 'text-white/40 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mt-auto mb-6 md:mb-10">
          <AnimatePresence mode="wait">
            {currentProject && (
              <motion.div
                key={currentProject.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-accent text-[10px] md:text-sm font-black tracking-[0.3em] uppercase block mb-2">
                  {currentProject.category}
                </span>
                <h1 className="text-white text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
                  {currentProject.title}
                </h1>
                <p className="text-white/70 text-xs sm:text-sm md:text-lg font-light leading-relaxed mb-6 max-w-2xl line-clamp-3">
                  {currentProject.description}
                </p>
                <button 
                  type="button"
                  onClick={() => setSelectedProject(currentProject)}
                  className="flex items-center gap-2 bg-white text-black px-8 py-3 text-[10px] font-bold rounded hover:bg-white/80 transition-all uppercase tracking-widest"
                >
                  <Play size={16} fill="black" /> View Project
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full pb-8 relative z-50">
          <h2 className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Up Next in Portfolio
          </h2>
          
          <div className="relative w-full">
            <Swiper
              key={`swiper-${activeCategory}-${filteredProjects.length}`}
              onSwiper={(s) => (swiperRef.current = s)}
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={'auto'}
              loop={filteredProjects.length > 2} // Safe loop trigger
              onSlideChange={(s) => setActiveIndex(s.realIndex)}
              // THE FIX: Intercept native Swiper clicks, bypass React dead zones
              onClick={(swiper) => {
                if (swiper.clickedSlide) {
                  const realIndex = swiper.clickedSlide.getAttribute('data-swiper-slide-index');
                  if (realIndex !== null) {
                    const idx = parseInt(realIndex, 10);
                    (swiper as any).slideToLoop(idx);
                    setActiveIndex(idx);
                  }
                }
              }}
              className="overflow-visible"
            >
              {filteredProjects.map((project, idx) => (
                <SwiperSlide key={project.id} className="!w-[140px] sm:!w-[180px] md:!w-[240px]">
                  <div 
                    // REMOVED React onClick entirely from here
                    className={`relative aspect-video cursor-pointer transition-all duration-500 rounded-sm overflow-hidden border-2 z-[60] pointer-events-auto ${
                      activeIndex === idx ? 'border-accent scale-105 shadow-[0_0_20px_var(--accent)]' : 'border-transparent opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
                    }`}
                  >
                    <img src={project.image_url} className="w-full h-full object-cover pointer-events-none" alt="thumb" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedProject(null)}
          >
            <button 
              type="button" 
              onClick={() => setSelectedProject(null)} 
              className="fixed top-24 right-4 md:top-10 md:right-10 text-white hover:text-accent z-[10000]"
            >
              <X size={32} />
            </button>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 md:gap-12 items-start my-auto mt-32 lg:mt-auto bg-white/5 border border-white/10 backdrop-blur-2xl p-6 md:p-10 rounded-2xl shadow-2xl"
            >
              <div className="border border-white/20 rounded-lg overflow-hidden flex flex-col gap-4 max-h-[45vh] lg:max-h-[70vh] overflow-y-auto no-scrollbar">
                 {galleryImages.map((img) => (
                    <img key={img.id} src={img.image_url} alt="project" className="w-full h-auto object-cover" />
                 ))}
              </div>
              <div className="text-left">
                <span className="text-accent text-[10px] md:text-xs font-black tracking-[0.4em] uppercase">{selectedProject.category}</span>
                <h2 className="text-white text-3xl sm:text-4xl lg:text-6xl font-black uppercase mt-2 md:mt-4 leading-tight">{selectedProject.title}</h2>
                <p className="text-white/60 mt-4 md:mt-8 text-sm md:text-lg leading-relaxed font-light">{selectedProject.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx global>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </section>
  );
      }
