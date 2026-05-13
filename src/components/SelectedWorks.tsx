import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Play } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
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
    // We only trigger the body lock. Navbar will "notice" it and hide itself.
    document.body.style.overflow = selectedProject ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProject]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('portfolio_projects').select('*').eq('featured', true).order('created_at', { ascending: false });
      if (data) setProjects(data);
    };
    fetchData();
  }, []);

  const active = projects[activeIndex];

  const paginate = (dir: number) => {
    if (!selectedProject) return;
    const idx = projects.findIndex(p => p.id === selectedProject.id);
    const nextIdx = (idx + dir + projects.length) % projects.length;
    setSelectedProject(projects[nextIdx]);
    setZoom(1);
  };

  return (
    <section id="works" className="relative h-screen w-full bg-black overflow-hidden flex flex-col justify-end">
      
      {/* 1. CINEMATIC BILLBOARD */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {active && (
            <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              <img src={active.image_url} className="h-full w-full object-cover brightness-[0.3]" alt="" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. MAIN HERO UI */}
      <div className="relative z-20 w-full px-6 md:px-16 mb-8 flex items-end justify-between">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            {active && (
              <motion.div key={active.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <p className="text-accent text-[10px] tracking-[0.5em] uppercase font-black italic">{active.category}</p>
                <h2 className="text-5xl md:text-[7vw] font-black text-white uppercase tracking-tighter leading-[0.8] italic">{active.title}</h2>
                <button onClick={() => { setSelectedProject(active); setZoom(1); }} className="bg-white text-black px-10 py-4 rounded-md font-black uppercase text-xs flex items-center gap-2">
                  <Play size={18} fill="black" /> VIEW PROJECT
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="hidden md:flex gap-4">
          <button onClick={() => swiperRef.current?.slidePrev()} className="p-4 bg-white/5 border border-white/10 rounded-full text-white"><ChevronLeft size={32} /></button>
          <button onClick={() => swiperRef.current?.slideNext()} className="p-4 bg-white/5 border border-white/10 rounded-full text-white"><ChevronRight size={32} /></button>
        </div>
      </div>

      {/* 3. ROW CAROUSEL */}
      <div className="relative z-20 w-full pb-12 px-6 md:px-16">
        <Swiper onSwiper={(s) => { swiperRef.current = s; }} onSlideChange={(s) => setActiveIndex(s.realIndex)} modules={[Navigation]} slidesPerView="auto" spaceBetween={15} loop={projects.length > 3}>
          {projects.map((p, idx) => (
            <SwiperSlide key={p.id} style={{ width: 'min(280px, 45vw)' }}>
              <div onClick={() => swiperRef.current?.slideToLoop(idx)} className={`relative aspect-[16/9] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeIndex === idx ? 'border-accent' : 'border-white/20'}`}>
                <img src={p.card_thumbnail || p.image_url} className="w-full h-full object-cover" alt="" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 4. MODAL (THE GLASS DESIGN) */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-[45px] flex flex-col">
            <div className="flex justify-between items-center p-8 z-[100] bg-black/10 backdrop-blur-md border-b border-white/5">
               <h2 className="text-white uppercase font-black italic text-2xl tracking-tighter">{selectedProject.title}</h2>
               <div className="flex gap-4">
                  <button onClick={() => setZoom(z => Math.min(z + 0.5, 3))} className="p-3 bg-white/5 rounded-full text-white border border-white/10 hover:bg-white/20" title="Zoom In"><ZoomIn size={20}/></button>
                  <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-3 bg-white/5 rounded-full text-white border border-white/10 hover:bg-white/20" title="Zoom Out"><ZoomOut size={20}/></button>
                  <button onClick={() => { setSelectedProject(null); setZoom(1); }} className="p-3 bg-accent rounded-full text-black ml-4"><X size={20}/></button>
               </div>
            </div>
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
               <button onClick={(e) => { e.stopPropagation(); paginate(-1); }} className="absolute left-8 z-[110] p-5 bg-white/5 backdrop-blur-md rounded-full text-white hover:bg-accent border border-white/10"><ChevronLeft size={24} /></button>
               <button onClick={(e) => { e.stopPropagation(); paginate(1); }} className="absolute right-8 z-[110] p-5 bg-white/5 backdrop-blur-md rounded-full text-white hover:bg-accent border border-white/10"><ChevronRight size={24} /></button>
               <motion.div drag={zoom > 1} dragMomentum={false} dragElastic={0} className="flex items-center justify-center cursor-move">
                 <motion.img key={selectedProject.id} animate={{ scale: zoom }} src={selectedProject.image_url} className="max-h-[85vh] w-auto object-contain shadow-[0_0_80px_rgba(0,0,0,0.8)]" alt={selectedProject.title} />
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
