import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Play } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { supabase } from '../lib/supabase';

import 'swiper/css';
import 'swiper/css/navigation';

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  process?: string;
  tools?: string[];
  all_images?: string[];
}

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const swiperRef = useRef<SwiperType | null>(null);

  // 1. HARD NAVBAR HIDE
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const nav = document.querySelector('nav') as HTMLElement | null;
      if (nav) {
        nav.style.display = 'none'; // Completely kill it in this section
      }
      return () => {
        if (nav) nav.style.display = 'flex'; // Restore on leave
      };
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (data) {
        const grouped: Project[] = data.map((item: any) => ({
          ...item,
          title: (item.title || 'Untitled').replace(/\.[^/.]+$/, '').trim(),
          tools: Array.isArray(item.tools) ? item.tools : []
        }));
        setProjects(grouped);
      }
    };
    fetchData();
  }, []);

  return (
    <section id="works" className="relative h-screen w-full bg-[#050505] overflow-hidden flex flex-col justify-end">
      
      {/* 2. CINEMATIC BILLBOARD */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {projects.length > 0 && projects[activeIndex] && (
            <motion.div
              key={projects[activeIndex].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <img 
                src={projects[activeIndex].image_url} 
                className="h-full w-full object-cover brightness-[0.5]" 
                alt="hero"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. HERO OVERLAY + CUSTOM NAV BUTTONS */}
      <div className="relative z-20 w-full px-6 md:px-16 mb-8 flex items-end justify-between">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            {projects[activeIndex] && (
              <motion.div
                key={`txt-${projects[activeIndex].id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <p className="text-accent text-[10px] tracking-[0.5em] uppercase font-black italic">{projects[activeIndex].category}</p>
                <h2 className="text-5xl md:text-[6.5vw] font-black text-white uppercase tracking-tighter leading-[0.8] italic">{projects[activeIndex].title}</h2>
                <p className="text-white/70 text-sm md:text-lg italic max-w-xl line-clamp-3">{projects[activeIndex].description}</p>
                <button 
                  onClick={() => setSelectedProject(projects[activeIndex])}
                  className="bg-white text-black px-8 py-3 rounded-md font-black uppercase text-xs flex items-center gap-2 hover:bg-accent transition-all active:scale-95"
                >
                  <Play size={16} fill="black" /> View Project
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CUSTOM HERO NAV (Replaces the blue arrows) */}
        <div className="hidden md:flex gap-4 mb-4">
          <button className="nav-prev-custom p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all">
            <ChevronLeft size={32} />
          </button>
          <button className="nav-next-custom p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all">
            <ChevronRight size={32} />
          </button>
        </div>
      </div>

      {/* 4. BOTTOM ROW CAROUSEL */}
      <div className="relative z-20 w-full pb-10 px-6 md:px-16">
        <Swiper
          onSwiper={(s) => { swiperRef.current = s; }}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          modules={[Navigation]}
          navigation={{
            prevEl: '.nav-prev-custom',
            nextEl: '.nav-next-custom',
          }}
          slidesPerView="auto"
          spaceBetween={15}
          loop={projects.length > 4}
          className="!overflow-visible swiper-custom-reset"
        >
          {projects.map((project, idx) => (
            <SwiperSlide key={project.id} style={{ width: 'min(280px, 50vw)' }}>
              <div 
                onClick={() => {
                   if (swiperRef.current) swiperRef.current.slideToLoop(idx);
                }}
                className={`relative aspect-[16/9] rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                  activeIndex === idx ? 'border-accent shadow-[0_0_20px_rgba(var(--accent-rgb),0.5)]' : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                <img src={project.image_url} className="w-full h-full object-cover" alt="thumb" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 5. MODAL (With Zoom Fix) */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/98 flex flex-col"
          >
            <div className="flex justify-between items-center p-8 z-[10002]">
               <h2 className="text-white uppercase font-black italic text-2xl">{selectedProject.title}</h2>
               <div className="flex gap-4">
                  <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-3 bg-white/5 rounded-full text-white"><ZoomOut size={20}/></button>
                  <button onClick={() => setZoom(z => Math.min(z + 0.5, 4))} className="p-3 bg-white/5 rounded-full text-white"><ZoomIn size={20}/></button>
                  <button onClick={() => {setSelectedProject(null); setZoom(1);}} className="p-3 bg-accent rounded-full text-black ml-4"><X size={20}/></button>
               </div>
            </div>

            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
               <motion.div drag={zoom > 1} dragConstraints={{ left: -400*zoom, right: 400*zoom, top: -400*zoom, bottom: 400*zoom }} className="flex items-center justify-center cursor-move">
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
        .swiper-custom-reset .swiper-wrapper { display: flex !important; align-items: center !important; }
      `}} />
    </section>
  );
}
