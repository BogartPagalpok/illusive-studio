import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { supabase } from '../lib/supabase';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Project {
  id: string;
  title: string;
  category: string;
  image_url: string;
  all_images?: string[];
  overview?: string;
  description?: string;
  workflow?: string;
  tech_stack?: string;
  tools?: string[];
}

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const nav = document.querySelector('nav') as HTMLElement | null;
    if (!nav) return;

    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      nav.style.opacity = '0';
      nav.style.transform = 'translateY(-100%)';
    } else {
      document.body.style.overflow = 'unset';
      nav.style.opacity = '1';
      nav.style.transform = 'translateY(0)';
    }
  }, [selectedProject]);

  useEffect(() => {
    const fetchData = async () => {
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
              tools: item.tech_stack ? item.tech_stack.split(',').map((t: string) => t.trim()) : []
            };
          } else {
            grouped[cleanTitle].all_images?.push(item.image_url);
          }
        });
        setProjects(Object.values(grouped));
      }
    };
    fetchData();
  }, []);

  return (
    <section id="works" className="relative z-10 min-h-screen overflow-hidden flex flex-col justify-center bg-black">
      
      {/* 1. DYNAMIC BACKGROUND: The Netflix Cross-Fade */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {projects.length > 0 && (
            <motion.div
              key={projects[activeIndex]?.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img 
                src={projects[activeIndex]?.image_url} 
                className="w-full h-full object-cover brightness-[0.25] grayscale-[20%]" 
                alt="bg-preview"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 w-full relative z-20">
        
        {/* 2. DYNAMIC DETAILS: Updates as you swipe */}
        <div className="mb-12 h-32 md:h-56 flex flex-col justify-end">
          <AnimatePresence mode="wait">
            {projects.length > 0 && (
              <motion.div
                key={`info-${projects[activeIndex]?.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <span className="h-[2px] w-8 bg-accent" />
                  <p className="text-accent text-[10px] md:text-xs tracking-[0.5em] uppercase font-black italic">
                    {projects[activeIndex]?.category}
                  </p>
                </div>
                <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none italic">
                  {projects[activeIndex]?.title}
                </h2>
                <p className="max-w-2xl text-white/50 text-sm md:text-base leading-relaxed italic line-clamp-2">
                  {projects[activeIndex]?.overview || projects[activeIndex]?.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. THE CAROUSEL */}
        <div className="relative group overflow-visible">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
            modules={[EffectCoverflow, Navigation, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={projects.length > 2}
            loopedSlides={projects.length > 0 ? projects.length : 5}
            speed={900}
            slidesPerView="auto"
            navigation={{ nextEl: '.nav-next', prevEl: '.nav-prev' }}
            coverflowEffect={{ 
              rotate: 0, 
              stretch: 0, 
              depth: 160, 
              modifier: 2.5, 
              slideShadows: false 
            }}
            className="!pb-24 !pt-10 overflow-visible"
          >
            {projects.map((project) => (
              <SwiperSlide key={project.id} style={{ width: 'min(350px, 80vw)' }} className="!flex items-center justify-center">
                {({ isActive }) => (
                  <div className={`relative w-full aspect-[3/4.2] rounded-[35px] border overflow-hidden backdrop-blur-3xl shadow-2xl transition-all duration-700 ease-out ${
                    isActive 
                      ? 'border-white/30 bg-white/10 scale-100 z-10 shadow-[0_0_50px_rgba(255,255,255,0.1)]' 
                      : 'border-white/5 bg-white/5 scale-[0.85] opacity-30 grayscale blur-[1px]'
                  }`}>
                    <img src={project.image_url} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt={project.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                    
                    <div className={`absolute bottom-0 left-0 p-8 w-full z-50 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <button 
                        onClick={() => setSelectedProject(project)} 
                        className="w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-accent transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        Launch Case <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
          
          <button className="nav-prev absolute left-0 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/60 border border-white/10 text-white hover:bg-accent transition-all hidden xl:flex shadow-2xl"><ChevronLeft size={24} /></button>
          <button className="nav-next absolute right-0 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/60 border border-white/10 text-white hover:bg-accent transition-all hidden xl:flex shadow-2xl"><ChevronRight size={24} /></button>
        </div>
      </div>

      {/* 4. CASE STUDY MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-4 md:p-12 overflow-y-auto">
            <button onClick={() => setSelectedProject(null)} className="fixed top-8 right-8 z-[10001] p-4 bg-white/10 rounded-full text-white hover:bg-accent transition-all active:scale-90"><X size={28} /></button>
            
            <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} className="flex flex-col lg:flex-row items-center justify-between w-full max-w-[1500px] gap-12">
              <div className="relative flex-1 w-full flex items-center justify-center rounded-[40px] bg-white/[0.03] border border-white/10 overflow-hidden h-[65vh] lg:h-[80vh] shadow-inner">
                <motion.img 
                  key={currentImageIndex} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url} 
                  className="w-full h-full object-contain p-6 md:p-12" 
                  alt="detail"
                />
              </div>

              <div className="w-full lg:w-[500px] space-y-8">
                <div>
                  <p className="text-accent text-[10px] tracking-[0.5em] uppercase font-black mb-4 italic">{selectedProject.category}</p>
                  <h2 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.85]">{selectedProject.title}</h2>
                </div>
                <div className="bg-white/[0.03] p-10 rounded-[40px] border border-white/10 shadow-2xl">
                  <p className="text-gray-300 text-lg leading-relaxed font-medium italic">{selectedProject.overview || selectedProject.description}</p>
                  <div className="flex flex-wrap gap-2 mt-8">
                    {selectedProject.tools?.map((t: string) => (
                      <span key={t} className="px-4 py-2 border border-white/10 rounded-xl text-[9px] uppercase text-white/60 font-bold bg-white/5 tracking-[0.2em]">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
