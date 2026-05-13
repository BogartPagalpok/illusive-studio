import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Play } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules'; // REINSTATED
import type { Swiper as SwiperType } from 'swiper';
import { supabase } from '../lib/supabase';

import 'swiper/css';

export default function SelectedWorks() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [zoom, setZoom] = useState(1);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('featured', true)
          .order('created_at', { ascending: false });

        if (data) setProjects(data);
      } catch (e) {
        console.error("Supabase connection failed");
      }
    };
    fetchData();
  }, []);

  // FIXED: Loop-safe navigation callbacks
  const goPrev = () => swiperRef.current?.slidePrev();
  const goNext = () => swiperRef.current?.slideNext();

  // FIXED: Logic gap for index matching
  const goToProject = (idx: number) => {
    if (!swiperRef.current) return;
    if (projects.length > 4) {
      swiperRef.current.slideToLoop(idx);
    } else {
      swiperRef.current.slideTo(idx);
    }
  };

  const active = projects[activeIndex];

  return (
    <section id="works" className="relative h-screen w-full bg-black overflow-hidden flex flex-col justify-end">
      <style>{`
        .selected-nav-hide ~ nav { display: none !important; } 
        .swiper-button-next, .swiper-button-prev { display: none !important; }
      `}</style>
      
      {/* 1. BILLBOARD BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {active && (
            <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              <img src={active.image_url} className="h-full w-full object-cover brightness-[0.4]" alt="" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. HERO CONTENT + CUSTOM NAV */}
      <div className="relative z-20 w-full px-6 md:px-16 mb-8 flex items-end justify-between">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            {active && (
              <motion.div key={active.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <p className="text-accent text-[10px] tracking-[0.5em] uppercase font-black italic">{active.category || 'PROJECT'}</p>
                <h2 className="text-5xl md:text-[7vw] font-black text-white uppercase tracking-tighter leading-[0.8] italic">{active.title}</h2>
                <p className="text-white/70 text-sm md:text-lg italic max-w-xl line-clamp-3">{active.description}</p>
                <button onClick={() => setSelectedProject(active)} className="bg-white text-black px-10 py-4 rounded-md font-black uppercase text-xs hover:bg-accent transition-all">
                  <Play size={18} fill="black" className="inline mr-2" /> VIEW PROJECT
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* REFIXED: Navigation using state-safe callbacks */}
        <div className="hidden md:flex gap-4">
          <button onClick={goPrev} className="p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all">
            <ChevronLeft size={32} />
          </button>
          <button onClick={goNext} className="p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all">
            <ChevronRight size={32} />
          </button>
        </div>
      </div>

      {/* 3. THE ROW (CARDS) */}
      <div className="relative z-20 w-full pb-12 px-6 md:px-16">
        <Swiper
          onSwiper={(s) => { swiperRef.current = s; }}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          modules={[Navigation]}
          slidesPerView="auto"
          spaceBetween={15}
          loop={projects.length > 4}
          className="!overflow-visible"
        >
          {projects.map((p, idx) => (
            <SwiperSlide key={p.id} style={{ width: 'min(280px, 45vw)' }}>
              <div 
                onClick={() => goToProject(idx)} 
                className={`relative aspect-[16/9] rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-500 ${
                  activeIndex === idx 
                  ? 'border-accent scale-105 shadow-[0_0_30px_rgba(var(--accent-rgb),0.5)] z-30' 
                  : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                <img src={p.card_thumbnail || p.image_url} className="w-full h-full object-cover" alt="" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 4. MODAL */}
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
                 <motion.img animate={{ scale: zoom }} src={selectedProject.image_url} className="max-h-[85vh] w-auto object-contain pointer-events-none select-none shadow-2xl" />
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
