import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Play } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { supabase } from '../lib/supabase';

import 'swiper/css';

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;      // Billboard BG
  card_thumbnail: string; // Row Card
  tools: string[];        
}

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [zoom, setZoom] = useState(1);
  const swiperRef = useRef<SwiperType | null>(null);

  // 1. HARD NAVBAR HIDE (Safe for Vercel)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const nav = document.querySelector('nav') as HTMLElement | null;
      if (nav) {
        nav.style.display = 'none';
        return () => { nav.style.display = 'flex'; };
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('id, title, category, description, image_url, card_thumbnail, tools')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) return;

      if (data) {
        const sanitized = data.map((item: any) => ({
          ...item,
          title: (item.title || 'Untitled').replace(/\.[^/.]+$/, '').trim(),
          // FALLBACK: Use image_url if card_thumbnail column is empty in DB
          card_thumbnail: item.card_thumbnail || item.image_url || '',
          tools: Array.isArray(item.tools) ? item.tools : []
        }));
        setProjects(sanitized);
      }
    };
    fetchData();
  }, []);

  return (
    <section id="works" className="relative h-screen w-full bg-[#050505] overflow-hidden flex flex-col justify-end">
      
      {/* 2. DYNAMIC BILLBOARD BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {projects.length > 0 && projects[activeIndex] && (
            <motion.div
              key={projects[activeIndex].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img 
                src={projects[activeIndex].image_url} 
                className="h-full w-full object-cover brightness-[0.4]" 
                alt="billboard" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
              <div className="absolute inset-y-0 left-0 w-1/3 bg-accent/10 blur-[180px] pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. HERO CONTENT + CUSTOM NAV ARROWS (On Background) */}
      <div className="relative z-20 w-full px-6 md:px-16 mb-6 flex items-end justify-between">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            {projects[activeIndex] && (
              <motion.div
                key={`txt-${projects[activeIndex].id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <p className="text-accent text-[10px] tracking-[0.5em] uppercase font-black italic">
                  {projects[activeIndex].category}
                </p>
                <h2 className="text-5xl md:text-[7vw] font-black text-white uppercase tracking-tighter leading-[0.8] italic">
                  {projects[activeIndex].title}
                </h2>
                <p className="text-white/70 text-sm md:text-lg italic max-w-xl line-clamp-3 leading-relaxed">
                  {projects[activeIndex].description}
                </p>
                <button 
                  onClick={() => setSelectedProject(projects[activeIndex])} 
                  className="bg-white text-black px-10 py-4 rounded-md font-black uppercase text-[10px] flex items-center gap-2 hover:bg-accent transition-all active:scale-95 shadow-2xl"
                >
                  <Play size={18} fill="black" /> View Project
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CUSTOM HERO CONTROLS (Hidden on mobile for swipe) */}
        <div className="hidden md:flex gap-4">
          <button className="p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all prev-btn">
            <ChevronLeft size={32} />
          </button>
          <button className="p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all next-btn">
            <ChevronRight size={32} />
          </button>
        </div>
      </div>

      {/* 4. BOTTOM CAROUSEL ROW (Uses Thumbnails) */}
      <div className="relative z-20 w-full pb-10 px-6 md:px-16">
        <Swiper
          onSwiper={(s) => { swiperRef.current = s; }}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          modules={[Navigation]}
          navigation={{ prevEl: '.prev-btn', nextEl: '.next-btn' }}
          slidesPerView="auto"
          spaceBetween={12}
          loop={projects.length > 4}
          className="!overflow-visible"
        >
          {projects.map((project, idx) => (
            <SwiperSlide key={project.id} style={{ width: 'min(260px, 45vw)' }}>
              <div 
                onClick={() => swiperRef.current?.slideToLoop(idx)}
                className={`relative aspect-[16/9] rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                  activeIndex === idx 
                    ? 'border-accent scale-105 shadow-[0_0_30px_rgba(var(--accent-rgb),0.5)] z-30' 
                    : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                <img src={project.card_thumbnail} className="w-full h-full object-cover" alt="thumb" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 5. PRO MODAL (Drag & Zoom Physics) */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[10000] bg-black/98 flex flex-col"
          >
            <div className="flex justify-between items-center p-8 bg-gradient-to-b from-black to-transparent">
               <h2 className="text-white uppercase font-black italic text-2xl tracking-tighter">{selectedProject.title}</h2>
               <div className="flex gap-4">
                  <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-3 bg-white/5 rounded-full text-white border border-white/10 hover:bg-accent hover:text-black transition-colors"><ZoomOut size={20}/></button>
                  <button onClick={() => setZoom(z => Math.min(z + 0.5, 4))} className="p-3 bg-white/5 rounded-full text-white border border-white/10 hover:bg-accent hover:text-black transition-colors"><ZoomIn size={20}/></button>
                  <button onClick={() => {setSelectedProject(null); setZoom(1);}} className="p-3 bg-accent rounded-full text-black ml-4"><X size={20}/></button>
               </div>
            </div>

            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
               <motion.div 
                 drag={zoom > 1}
                 dragMomentum={false} 
                 dragElastic={0}
                 className="flex items-center justify-center cursor-move"
               >
                 <motion.img 
                   animate={{ scale: zoom }} 
                   src={selectedProject.image_url} 
                   className="max-h-[85vh] w-auto object-contain pointer-events-none select-none shadow-2xl" 
                 />
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .swiper-button-next, .swiper-button-prev { display: none !important; }
      `}} />
    </section>
  );
}
