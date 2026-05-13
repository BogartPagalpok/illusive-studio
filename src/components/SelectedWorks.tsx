import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Move } from 'lucide-react';
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

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (data) {
        const grouped: Record<string, Project> = {};
        data.forEach((item: any) => {
          const cleanTitle = item.title.replace(/\.[^/.]+$/, '').trim();
          if (!grouped[cleanTitle]) {
            grouped[cleanTitle] = { 
              ...item, 
              title: cleanTitle, 
              all_images: [item.image_url],
              tools: Array.isArray(item.tools) ? item.tools : []
            };
          } else {
            grouped[cleanTitle].all_images?.push(item.image_url);
          }
        });
        setProjects(Object.values(grouped));
      }
    };
    fetchProjects();
  }, []);

  return (
    <section id="works" className="relative h-screen w-full bg-[#0a0a0a] overflow-hidden flex flex-col justify-end">
      
      {/* 1. THEME-SYNCED BILLBOARD BG */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {projects.length > 0 && (
            <motion.div
              key={projects[activeIndex]?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img 
                src={projects[activeIndex]?.image_url} 
                className="h-full w-full object-cover" 
                alt="bg"
              />
              
              {/* THEME GRADIENT TINT: From Theme-Black to Transparent */}
              {/* Uses your accent color for a subtle atmospheric bleed (low opacity) */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              
              {/* ACCENT COLOR GLOW (Left side only) */}
              <div className="absolute inset-y-0 left-0 w-1/3 bg-accent/5 blur-[120px] pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. LOWER-LEFT HERO CONTENT (Flush with Cards) */}
      <div className="relative z-20 w-full px-6 md:px-16 mb-4">
        <AnimatePresence mode="wait">
          {projects.length > 0 && (
            <motion.div
              key={`hero-${projects[activeIndex]?.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-[2px] w-8 bg-accent" />
                <p className="text-accent text-[10px] md:text-xs tracking-[0.5em] uppercase font-black italic">
                  {projects[activeIndex]?.category}
                </p>
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-[7vw] font-black text-white uppercase tracking-tighter leading-[0.8] italic mb-4">
                {projects[activeIndex]?.title}
              </h2>
              <p className="text-white/80 text-sm md:text-lg italic max-w-xl line-clamp-3 leading-relaxed">
                {projects[activeIndex]?.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. CAROUSEL ROW */}
      <div className="relative z-20 w-full pb-10 px-6 md:px-16">
        <Swiper
          onSwiper={(s) => { swiperRef.current = s; }}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          modules={[Navigation]}
          navigation={true}
          slidesPerView="auto"
          spaceBetween={12}
          loop={projects.length > 4}
          className="!overflow-visible desktop-swiper-fix"
        >
          {projects.map((project, idx) => (
            <SwiperSlide key={project.id} style={{ width: 'min(260px, 45vw)' }}>
              <div 
                onClick={() => setSelectedProject(project)}
                className={`relative aspect-[16/9] rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                  activeIndex === idx ? 'border-accent shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]' : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                <img src={project.image_url} className="w-full h-full object-cover" alt="thumb" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 4. PRO MODAL (Locked Zoom/Pan) */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-[#0a0a0a]/95 flex flex-col"
          >
            <div className="flex justify-between items-center p-6 z-[10002] bg-gradient-to-b from-[#0a0a0a] to-transparent">
               <div className="text-white uppercase font-black italic tracking-widest text-lg">{selectedProject.title}</div>
               <div className="flex gap-3">
                  <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-2 bg-white/5 rounded-full text-white border border-white/10 hover:bg-accent hover:text-black transition-colors"><ZoomOut size={18}/></button>
                  <button onClick={() => setZoom(z => Math.min(z + 0.5, 4))} className="p-2 bg-white/5 rounded-full text-white border border-white/10 hover:bg-accent hover:text-black transition-colors"><ZoomIn size={18}/></button>
                  <button onClick={() => {setSelectedProject(null); setZoom(1);}} className="p-2 bg-accent rounded-full text-black ml-4"><X size={18}/></button>
               </div>
            </div>

            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
               <button onClick={() => setCurrentImageIndex(prev => (prev - 1 + (selectedProject.all_images?.length || 1)) % (selectedProject.all_images?.length || 1))} className="absolute left-6 z-[10002] p-4 bg-[#0a0a0a]/50 rounded-full text-white hover:bg-accent hover:text-black transition-all"><ChevronLeft size={24}/></button>
               <button onClick={() => setCurrentImageIndex(prev => (prev + 1) % (selectedProject.all_images?.length || 1))} className="absolute right-6 z-[10002] p-4 bg-[#0a0a0a]/50 rounded-full text-white hover:bg-accent hover:text-black transition-all"><ChevronRight size={24}/></button>

               <div className="w-full h-full flex items-center justify-center">
                 <motion.div 
                   drag={zoom > 1}
                   dragConstraints={{ left: -400 * zoom, right: 400 * zoom, top: -400 * zoom, bottom: 400 * zoom }}
                   dragElastic={0} 
                   className="relative flex items-center justify-center"
                 >
                   <motion.img 
                     key={currentImageIndex}
                     animate={{ scale: zoom }}
                     src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url} 
                     className="max-h-[85vh] w-auto object-contain pointer-events-none"
                   />
                 </motion.div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
