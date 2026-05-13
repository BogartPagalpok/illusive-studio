import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
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

  useEffect(() => {
    // PROTECTED NAV SELECTOR FOR PRODUCTION
    if (typeof document !== 'undefined') {
      const nav = document.querySelector('nav') as HTMLElement | null;
      if (nav) {
        if (selectedProject) {
          document.body.style.overflow = 'hidden';
          nav.style.opacity = '0';
          nav.style.transform = 'translateY(-100%)';
        } else {
          document.body.style.overflow = 'unset';
          nav.style.opacity = '1';
          nav.style.transform = 'translateY(0)';
        }
      }
    }
  }, [selectedProject]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('id, title, category, description, image_url, process, tools')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) return;

      if (data) {
        const grouped: Project[] = data.map((item: any) => ({
          ...item,
          title: (item.title || 'Untitled').replace(/\.[^/.]+$/, '').trim(),
          all_images: item.image_url ? [item.image_url] : [],
          tools: Array.isArray(item.tools) ? item.tools : []
        }));
        setProjects(grouped);
      }
    };
    fetchData();
  }, []);

  return (
    <section id="works" className="relative h-screen w-full bg-[#0a0a0a] overflow-hidden flex flex-col justify-end">
      
      {/* 1. BILLBOARD BG: THEME-ACCENT GRADIENT */}
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
                className="h-full w-full object-cover" 
                alt="bg"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              {/* ACCENT GLOW BLOOM */}
              <div className="absolute inset-y-0 left-0 w-1/3 bg-accent/10 blur-[180px] pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. LOWER-LEFT HERO CONTENT */}
      <div className="relative z-20 w-full px-6 md:px-16 mb-4">
        <AnimatePresence mode="wait">
          {projects.length > 0 && projects[activeIndex] && (
            <motion.div
              key={`hero-txt-${projects[activeIndex].id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-[2px] w-8 bg-accent" />
                <p className="text-accent text-[10px] md:text-xs tracking-[0.6em] uppercase font-black italic">
                  {projects[activeIndex].category}
                </p>
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-[6.8vw] font-black text-white uppercase tracking-tighter leading-[0.8] italic mb-4">
                {projects[activeIndex].title}
              </h2>
              <p className="text-white/80 text-sm md:text-lg italic max-w-xl line-clamp-3 leading-relaxed">
                {projects[activeIndex].description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. ROW CAROUSEL */}
      <div className="relative z-20 w-full pb-10 px-6 md:px-16">
        <Swiper
          onSwiper={(s) => { swiperRef.current = s; }}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          modules={[Navigation]}
          navigation={true}
          slidesPerView="auto"
          spaceBetween={12}
          loop={projects.length > 4}
          className="!overflow-visible"
        >
          {projects.map((project, idx) => (
            <SwiperSlide key={project.id} style={{ width: 'min(240px, 45vw)' }}>
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

      {/* 4. ANTI-FLY MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/98 backdrop-blur-3xl flex flex-col"
          >
            <div className="flex justify-between items-center p-6 z-[10002]">
               <div className="text-white uppercase font-black italic tracking-widest text-lg">{selectedProject.title}</div>
               <div className="flex gap-4">
                  <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-2 bg-white/5 rounded-full text-white border border-white/10 hover:bg-accent hover:text-black transition-all"><ZoomOut size={18}/></button>
                  <button onClick={() => setZoom(z => Math.min(z + 0.5, 4))} className="p-2 bg-white/5 rounded-full text-white border border-white/10 hover:bg-accent hover:text-black transition-all"><ZoomIn size={18}/></button>
                  <button onClick={() => {setSelectedProject(null); setZoom(1);}} className="p-2 bg-accent rounded-full text-black ml-4"><X size={18}/></button>
               </div>
            </div>

            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
               <button onClick={() => setCurrentImageIndex(prev => (prev - 1 + (selectedProject.all_images?.length || 1)) % (selectedProject.all_images?.length || 1))} className="absolute left-10 z-[10002] p-4 bg-black/60 rounded-full text-white hover:bg-accent"><ChevronLeft size={32}/></button>
               <button onClick={() => setCurrentImageIndex(prev => (prev + 1) % (selectedProject.all_images?.length || 1))} className="absolute right-10 z-[10002] p-4 bg-black/60 rounded-full text-white hover:bg-accent"><ChevronRight size={32}/></button>

               <motion.div 
                 drag={zoom > 1}
                 dragConstraints={{ left: -400 * zoom, right: 400 * zoom, top: -400 * zoom, bottom: 400 * zoom }}
                 dragElastic={0}
                 className="flex items-center justify-center cursor-move"
               >
                 <motion.img 
                   key={currentImageIndex}
                   animate={{ scale: zoom }}
                   src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url} 
                   className="max-h-[85vh] w-auto object-contain pointer-events-none"
                 />
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
