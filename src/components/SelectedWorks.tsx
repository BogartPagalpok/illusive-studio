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
    <section id="works" className="relative h-screen w-full bg-black overflow-hidden flex flex-col justify-between">
      
      {/* 1. DYNAMIC BACKGROUND (Active Project Thumbnail) */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {projects.length > 0 && (
            <motion.div
              key={projects[activeIndex]?.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img 
                src={projects[activeIndex]?.image_url} 
                className="h-full w-full object-cover brightness-[0.2] grayscale-[30%]" 
                alt="dynamic-bg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. HERO CONTENT (Upper Section) */}
      <div className="relative z-20 flex-1 flex flex-col justify-center px-6 md:px-16 pt-20">
        <AnimatePresence mode="wait">
          {projects.length > 0 && (
            <motion.div
              key={`hero-${projects[activeIndex]?.id}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <p className="text-accent text-[10px] md:text-xs tracking-[0.5em] uppercase font-black italic mb-4">
                {projects[activeIndex]?.category}
              </p>
              <h2 className="text-5xl md:text-[7rem] font-black text-white uppercase tracking-tighter leading-[0.85] italic mb-6">
                {projects[activeIndex]?.title}
              </h2>
              <p className="text-white/50 text-sm md:text-lg italic max-w-2xl line-clamp-2 leading-relaxed">
                {projects[activeIndex]?.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. THUMBNAIL ROW (Lower Section) */}
      <div className="relative z-20 w-full pb-10 px-6 md:px-16">
        <h3 className="text-white/40 text-[9px] uppercase tracking-[0.4em] font-black mb-4 italic">Collections</h3>
        <Swiper
          onSwiper={(s) => { swiperRef.current = s; }}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          modules={[Navigation]}
          slidesPerView="auto"
          spaceBetween={15}
          loop={projects.length > 3}
          className="!overflow-visible"
        >
          {projects.map((project, idx) => (
            <SwiperSlide key={project.id} style={{ width: 'min(280px, 50vw)' }}>
              <motion.div 
                whileHover={{ scale: 1.05, zIndex: 50 }}
                onClick={() => setSelectedProject(project)}
                className={`relative aspect-[16/9] rounded-md overflow-hidden cursor-pointer border transition-all duration-300 ${
                  activeIndex === idx ? 'border-white/60' : 'border-white/5 opacity-50 grayscale'
                }`}
              >
                <img src={project.image_url} className="w-full h-full object-cover" alt="thumb" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-end p-3">
                   <p className="text-white font-black uppercase text-[8px] italic truncate">{project.title}</p>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 4. DRAG & PAN VIEWER MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/98 backdrop-blur-3xl flex flex-col"
          >
            <div className="flex justify-between items-center p-8 z-[10002]">
               <div className="text-white uppercase font-black italic tracking-widest text-xl">{selectedProject.title}</div>
               <div className="flex gap-4">
                  <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-3 bg-white/5 rounded-full text-white border border-white/10"><ZoomOut size={18}/></button>
                  <button onClick={() => setZoom(z => Math.min(z + 0.5, 4))} className="p-3 bg-white/5 rounded-full text-white border border-white/10"><ZoomIn size={18}/></button>
                  <button onClick={() => {setSelectedProject(null); setZoom(1);}} className="p-3 bg-white/20 rounded-full text-white ml-4"><X size={18}/></button>
               </div>
            </div>

            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
               <button onClick={() => setCurrentImageIndex(prev => (prev - 1 + (selectedProject.all_images?.length || 1)) % (selectedProject.all_images?.length || 1))} className="absolute left-6 z-[10002] p-4 bg-black/40 rounded-full text-white"><ChevronLeft size={28}/></button>
               <button onClick={() => setCurrentImageIndex(prev => (prev + 1) % (selectedProject.all_images?.length || 1))} className="absolute right-6 z-[10002] p-4 bg-black/40 rounded-full text-white"><ChevronRight size={28}/></button>

               <div className="w-full h-full flex items-center justify-center overflow-hidden">
                 <motion.div 
                   drag={zoom > 1}
                   dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                   className="relative flex items-center justify-center cursor-move"
                 >
                   <motion.img 
                     key={currentImageIndex}
                     animate={{ scale: zoom }}
                     src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url} 
                     className="max-h-[80vh] w-auto object-contain select-none shadow-2xl"
                   />
                 </motion.div>
               </div>
               
               {zoom > 1 && (
                 <div className="absolute bottom-10 flex items-center gap-2 px-6 py-2 bg-accent rounded-full text-black font-black text-[9px] uppercase tracking-widest">
                   <Move size={12} /> Drag to Pan Detail
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
