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
    // FIX: Type Guard for Navigation to pass Vercel Build
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
    <section id="works" className="relative z-10 min-h-screen overflow-hidden flex flex-col justify-center">
      
      {/* NETFLIX BACKGROUND CROSS-FADE */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {projects.length > 0 && (
            <motion.div
              key={projects[activeIndex]?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              <img 
                src={projects[activeIndex]?.image_url} 
                className="w-full h-full object-cover brightness-[0.2] grayscale-[30%]" 
                alt="bg"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 w-full relative z-20">
        
        {/* DYNAMIC HEADER (Netflix Style) */}
        <div className="mb-8 h-32 md:h-48 flex flex-col justify-end">
          <AnimatePresence mode="wait">
            {projects.length > 0 && (
              <motion.div
                key={`info-${projects[activeIndex]?.id}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="space-y-2"
              >
                <p className="text-accent text-[10px] tracking-[0.5em] uppercase font-black italic">
                  {projects[activeIndex]?.category}
                </p>
                <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none italic">
                  {projects[activeIndex]?.title}
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
              depth: 150, 
              modifier: 2.5, 
              slideShadows: false 
            }}
            className="!pb-24 !pt-10 overflow-visible"
          >
            {projects.map((project) => (
              <SwiperSlide key={project.id} style={{ width: 'min(350px, 75vw)' }} className="!flex items-center justify-center">
                {({ isActive }) => (
                  <div className={`relative w-full aspect-[3/4.2] rounded-[35px] border overflow-hidden backdrop-blur-3xl shadow-2xl transition-all duration-700 ease-out ${
                    isActive 
                      ? 'border-white/20 bg-white/10 scale-100 z-10' 
                      : 'border-white/5 bg-white/5 scale-[0.88] opacity-30 grayscale'
                  }`}>
                    <img src={project.image_url} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt={project.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    
                    <div className={`absolute bottom-0 left-0 p-8 w-full z-50 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <button 
                        onClick={() => setSelectedProject(project)} 
                        className="w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-accent transition-all flex items-center justify-center gap-2"
                      >
                        Explore Case Study <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
          
          <button className="nav-prev absolute left-0 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/80 border border-white/10 text-white hover:bg-accent transition-all hidden xl:flex"><ChevronLeft size={24} /></button>
          <button className="nav-next absolute right-0 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/80 border border-white/10 text-white hover:bg-accent transition-all hidden xl:flex"><ChevronRight size={24} /></button>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-12 overflow-y-auto">
            <button onClick={() => setSelectedProject(null)} className="fixed top-8 right-8 z-[10001] p-4 bg-white/10 rounded-full text-white hover:bg-accent"><X size={28} /></button>
            
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="flex flex-col lg:flex-row items-center justify-between w-full max-w-[1400px] gap-8">
              <div className="relative flex-1 w-full flex items-center justify-center rounded-[40px] bg-white/5 border border-white/10 overflow-hidden h-[60vh] lg:h-[80vh]">
                <motion.img 
                  key={currentImageIndex} 
                  src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url} 
                  className="w-full h-full object-contain p-6" 
                />
              </div>

              <div className="w-full lg:w-[450px] space-y-6">
                <span className="text-accent text-[10px] tracking-[0.5em] uppercase font-black">{selectedProject.category}</span>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{selectedProject.title}</h2>
                <div className="bg-white/5 p-8 rounded-[40px] border border-white/10">
                  <p className="text-gray-300 leading-relaxed">{selectedProject.overview || selectedProject.description}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
