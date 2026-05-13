import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Play, AlertCircle } from 'lucide-react';
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
  image_url: string;
  tools?: string[];
}

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);

  // 1. SAFE NAVBAR CONTROL
  useEffect(() => {
    const nav = document.querySelector('nav') as HTMLElement | null;
    if (nav) {
      nav.style.opacity = '0';
      nav.style.pointerEvents = 'none';
    }
    return () => {
      if (nav) {
        nav.style.opacity = '1';
        nav.style.pointerEvents = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolio_projects')
          .select('id, title, category, description, image_url, tools')
          .eq('featured', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setProjects(data.map((item: any) => ({
            ...item,
            title: (item.title || 'Untitled').replace(/\.[^/.]+$/, '').trim(),
            tools: Array.isArray(item.tools) ? item.tools : []
          })));
        } else {
          // FALLBACK DATA IF GITHUB/SUPABASE BLOCKS YOU
          setProjects([{
            id: 'demo-1',
            title: 'CONNECTION_ERROR',
            category: 'SYSTEM_STATUS',
            description: 'GitHub/Supabase connection might be flagged. Check your environment variables or local network.',
            image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80',
            tools: ['RETRY_BUILD']
          }]);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-screen w-full bg-black flex items-center justify-center text-accent animate-pulse font-black italic tracking-widest">LOADING_CINEMATIC...</div>;

  return (
    <section id="works" className="relative h-screen w-full bg-[#050505] overflow-hidden flex flex-col justify-end">
      
      {/* 2. CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {projects[activeIndex] && (
            <motion.div
              key={projects[activeIndex].id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img src={projects[activeIndex].image_url} className="h-full w-full object-cover brightness-[0.4]" alt="hero" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. HERO CONTENT */}
      <div className="relative z-20 w-full px-6 md:px-16 mb-8 flex items-end justify-between">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            {projects[activeIndex] && (
              <motion.div
                key={`info-${projects[activeIndex].id}`}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <p className="text-accent text-[10px] tracking-[0.5em] uppercase font-black italic">{projects[activeIndex].category}</p>
                  {projects[activeIndex].id === 'demo-1' && <AlertCircle size={14} className="text-red-500 animate-bounce" />}
                </div>
                <h2 className="text-5xl md:text-[7vw] font-black text-white uppercase tracking-tighter leading-[0.8] italic">{projects[activeIndex].title}</h2>
                <p className="text-white/70 text-sm md:text-lg italic max-w-xl line-clamp-3 leading-relaxed">{projects[activeIndex].description}</p>
                <button onClick={() => setSelectedProject(projects[activeIndex])} className="bg-white text-black px-10 py-4 rounded-md font-black uppercase text-xs flex items-center gap-2 hover:bg-accent transition-all">
                  <Play size={18} fill="black" /> VIEW PROJECT
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HERO NAVIGATION */}
        <div className="hidden md:flex gap-4">
          <button className="p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-accent hover:text-black transition-all prev-btn"><ChevronLeft size={32} /></button>
          <button className="p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-accent hover:text-black transition-all next-btn"><ChevronRight size={32} /></button>
        </div>
      </div>

      {/* 4. BOTTOM CAROUSEL */}
      <div className="relative z-20 w-full pb-12 px-6 md:px-16">
        <Swiper
          onSwiper={(s) => { swiperRef.current = s; }}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          modules={[Navigation]}
          navigation={{ prevEl: '.prev-btn', nextEl: '.next-btn' }}
          slidesPerView="auto"
          spaceBetween={15}
          loop={projects.length > 1}
          className="!overflow-visible"
        >
          {projects.map((project, idx) => (
            <SwiperSlide key={project.id} style={{ width: 'min(280px, 50vw)' }}>
              <div 
                onClick={() => swiperRef.current?.slideToLoop(idx)}
                className={`relative aspect-[16/9] rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-500 ${
                  activeIndex === idx ? 'border-accent scale-105 shadow-[0_0_30px_rgba(var(--accent-rgb),0.5)]' : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                <img src={project.image_url} className="w-full h-full object-cover" alt="thumb" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 5. MODAL ZOOM FIX */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black/98 flex flex-col">
            <div className="flex justify-between items-center p-8">
               <h2 className="text-white uppercase font-black italic text-2xl tracking-tighter">{selectedProject.title}</h2>
               <div className="flex gap-4">
                  <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-3 bg-white/5 rounded-full text-white"><ZoomOut size={20}/></button>
                  <button onClick={() => setZoom(z => Math.min(z + 0.5, 4))} className="p-3 bg-white/5 rounded-full text-white"><ZoomIn size={20}/></button>
                  <button onClick={() => {setSelectedProject(null); setZoom(1);}} className="p-3 bg-accent rounded-full text-black"><X size={20}/></button>
               </div>
            </div>
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
               <motion.div drag={zoom > 1} dragMomentum={false} dragElastic={0} className="flex items-center justify-center cursor-move">
                 <motion.img animate={{ scale: zoom }} src={selectedProject.image_url} className="max-h-[85vh] w-auto object-contain select-none shadow-2xl" />
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
