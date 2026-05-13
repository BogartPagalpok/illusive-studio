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
  image_url: string;      // This is the Billboard Background
  card_thumbnail: string; // This is the Card Image
  tools?: string[];
}

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [zoom, setZoom] = useState(1);
  const swiperRef = useRef<SwiperType | null>(null);

  // Navbar Toggle Fix
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const nav = document.querySelector('nav') as HTMLElement | null;
      if (nav) nav.style.display = 'none';
      return () => { if (nav) nav.style.display = 'flex'; };
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
        setProjects(data.map((item: any) => ({
          ...item,
          title: (item.title || 'Untitled').replace(/\.[^/.]+$/, '').trim(),
          tools: Array.isArray(item.tools) ? item.tools : []
        })));
      }
    };
    fetchData();
  }, []);

  return (
    <section id="works" className="relative h-screen w-full bg-[#050505] overflow-hidden flex flex-col justify-end">
      
      {/* 1. CINEMATIC BILLBOARD (Uses image_url) */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {projects[activeIndex] && (
            <motion.div
              key={projects[activeIndex].id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img 
                src={projects[activeIndex].image_url} 
                className="h-full w-full object-cover" 
                alt="billboard" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
              <div className="absolute inset-y-0 left-0 w-1/3 bg-accent/10 blur-[180px] pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. LOWER-LEFT HERO CONTENT */}
      <div className="relative z-20 w-full px-6 md:px-16 mb-4">
        <AnimatePresence mode="wait">
          {projects[activeIndex] && (
            <motion.div
              key={`hero-${projects[activeIndex].id}`}
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-[2px] w-8 bg-accent" />
                <p className="text-accent text-[10px] md:text-xs tracking-[0.5em] uppercase font-black italic">
                  {projects[activeIndex].category}
                </p>
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.8] italic mb-4">
                {projects[activeIndex].title}
              </h2>
              <p className="text-white/80 text-sm md:text-lg italic max-w-xl line-clamp-3 leading-relaxed">
                {projects[activeIndex].description}
              </p>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setSelectedProject(projects[activeIndex])}
                  className="bg-white text-black px-10 py-4 rounded-md font-black uppercase text-xs flex items-center gap-2 hover:bg-accent transition-all active:scale-95 shadow-xl"
                >
                  <Play size={18} fill="black" /> View Full Case
                </button>
                {/* Hero Navigation Arrowns Integrated here */}
                <div className="flex gap-2">
                   <button className="p-3 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all prev-btn"><ChevronLeft size={24}/></button>
                   <button className="p-3 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all next-btn"><ChevronRight size={24}/></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. ROW CAROUSEL (Uses card_thumbnail) */}
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
            <SwiperSlide key={project.id} style={{ width: 'min(240px, 45vw)' }}>
              <div 
                onClick={() => swiperRef.current?.slideToLoop(idx)}
                className={`relative aspect-[16/9] rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                  activeIndex === idx ? 'border-accent shadow-[0_0_20px_rgba(var(--accent-rgb),0.5)] scale-105' : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                {/* Notice the use of card_thumbnail here for the small preview */}
                <img 
                  src={project.card_thumbnail || project.image_url} 
                  className="w-full h-full object-cover" 
                  alt="thumb" 
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 4. MODAL (With Zoom/Pan) */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-[#050505]/98 flex flex-col">
            <div className="flex justify-between items-center p-8 z-[10002]">
               <h2 className="text-white uppercase font-black italic text-2xl">{selectedProject.title}</h2>
               <div className="flex gap-4">
                  <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-3 bg-white/5 rounded-full text-white border border-white/10 hover:bg-accent hover:text-black transition-colors"><ZoomOut size={18}/></button>
                  <button onClick={() => setZoom(z => Math.min(z + 0.5, 4))} className="p-3 bg-white/5 rounded-full text-white border border-white/10 hover:bg-accent hover:text-black transition-colors"><ZoomIn size={18}/></button>
                  <button onClick={() => {setSelectedProject(null); setZoom(1);}} className="p-3 bg-accent rounded-full text-black ml-4"><X size={18}/></button>
               </div>
            </div>

            <div className="relative flex-1 flex items-center justify-center overflow-hidden cursor-move">
               <motion.div 
                 drag={zoom > 1}
                 dragConstraints={{ left: -400*zoom, right: 400*zoom, top: -400*zoom, bottom: 400*zoom }}
                 dragElastic={0}
                 className="flex items-center justify-center"
               >
                 <motion.img 
                   animate={{ scale: zoom }}
                   src={selectedProject.image_url} 
                   className="max-h-[85vh] w-auto object-contain pointer-events-none"
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
