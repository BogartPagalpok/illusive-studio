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

export default function SelectedWorks() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 
  const swiperRef = useRef<SwiperType | null>(null);

  // FIX 1: NAVBAR GLASSMORPHISM + AUTO-HIDE (Stops the overlap annoyance)
  useEffect(() => {
    const nav = document.querySelector('nav');
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      if (nav) {
        nav.style.opacity = '0';
        nav.style.pointerEvents = 'none';
        nav.style.transition = 'opacity 0.3s ease';
      }
    } else {
      document.body.style.overflow = 'unset';
      if (nav) {
        nav.style.opacity = '1';
        nav.style.pointerEvents = 'auto';
        // Force glassmorphism styles in case global CSS is missing them
        nav.style.backdropFilter = 'blur(16px)';
        nav.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      }
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
        const grouped: Record<string, any> = {};
        data.forEach((item) => {
          const cleanTitle = item.title.replace(/\.[^/.]+$/, '').trim();
          if (!grouped[cleanTitle]) {
            grouped[cleanTitle] = { ...item, title: cleanTitle, all_images: [item.image_url] };
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
    // FIX 2: NO BOUNCING. overflow-hidden on section + fixed height container stops layout jitter.
    <section id="works" className="relative z-40 bg-transparent min-h-screen py-20 overflow-hidden flex flex-col justify-center">
      <div className="max-w-[1600px] mx-auto px-4 w-full relative z-20">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-accent mb-2">Selected Portfolio</p>
          <h2 className="text-6xl md:text-8xl font-bold text-white uppercase tracking-tighter leading-none">Works</h2>
        </div>

        {/* FIXED HEIGHT CONTAINER STOPS THE BOUNCE */}
        <div className="relative group h-[700px] md:h-[800px] overflow-visible">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[EffectCoverflow, Navigation, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={true}
            loopedSlides={5}
            slidesPerView="auto"
            navigation={{ nextEl: '.nav-next', prevEl: '.nav-prev' }}
            coverflowEffect={{
              rotate: 8,
              stretch: 0,
              depth: 350,
              modifier: 1,
              slideShadows: true,
            }}
            speed={600}
            className="!pb-24 !pt-10 overflow-visible coverflow-carousel"
          >
            {projects.map((project) => (
              <SwiperSlide
                key={project.id}
                style={{ width: '300px' }} // REDUCED SIZE (Prevents Oversize Bug)
                className="md:!w-[420px] !flex items-center justify-center"
              >
                {({ isActive }) => (
                  <div
                    className={`relative w-full rounded-[30px] border overflow-hidden backdrop-blur-3xl shadow-2xl transition-all duration-700 ease-out ${
                      isActive
                        ? 'h-[580px] md:h-[700px] border-white/20 bg-white/10 scale-100 z-10'
                        : 'h-[500px] md:h-[600px] border-white/5 bg-white/5 scale-[0.88] opacity-60'
                    }`}
                  >
                    <img src={project.image_url} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    {isActive && <div className="absolute inset-0 rounded-[30px] ring-1 ring-accent/30 pointer-events-none" />}

                    <div className={`absolute bottom-0 left-0 p-8 md:p-10 w-full z-50 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <span className="text-accent text-[10px] tracking-[0.4em] uppercase font-black">{project.category}</span>
                      <h3 className="text-2xl md:text-4xl font-bold text-white uppercase mt-2 mb-6 leading-none tracking-tighter">{project.title}</h3>
                      <button
                        onClick={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          setSelectedProject(project);
                          setCurrentImageIndex(0);
                        }}
                        className="inline-flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-full text-[11px] font-black tracking-widest uppercase hover:bg-accent transition-all cursor-pointer relative z-[60]"
                      >
                        View Case <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* ARROWS: Fixed positioning stops them from bouncing during scroll */}
          <button className="nav-prev absolute left-0 top-1/2 -translate-y-1/2 z-[100] p-4 xl:p-5 rounded-full bg-black/80 border border-white/20 text-white hover:bg-accent transition-all hidden xl:flex shadow-2xl"><ChevronLeft size={28} /></button>
          <button className="nav-next absolute right-0 top-1/2 -translate-y-1/2 z-[100] p-4 xl:p-5 rounded-full bg-black/80 border border-white/20 text-white hover:bg-accent transition-all hidden xl:flex shadow-2xl"><ChevronRight size={28} /></button>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl"
          >
            <button onClick={() => setSelectedProject(null)} className="absolute top-8 right-8 z-[10000] p-4 bg-white/10 rounded-full text-white hover:bg-accent transition-all"><X size={28} /></button>

            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col md:flex-row items-center gap-16 max-w-7xl w-full">
              {/* FIX 3: RESTORED DETAILS AND GALLERY SWITCHER */}
              <div className="relative w-full md:w-3/5 h-[50vh] md:h-[75vh] flex items-center justify-center rounded-[30px] bg-black/20 overflow-hidden">
                <motion.img
                  key={currentImageIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url}
                  className="max-w-full max-h-full object-contain" alt="" />
                
                {selectedProject.all_images && selectedProject.all_images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev - 1 + selectedProject.all_images.length) % selectedProject.all_images.length)}} className="p-3 rounded-full bg-black/60 text-white hover:bg-accent"><ChevronLeft size={24} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % selectedProject.all_images.length)}} className="p-3 rounded-full bg-black/60 text-white hover:bg-accent"><ChevronRight size={24} /></button>
                  </div>
                )}
              </div>

              <div className="text-left md:w-2/5 p-4">
                <span className="text-accent text-sm tracking-[0.4em] uppercase font-bold">{selectedProject.category}</span>
                <h2 className="text-5xl md:text-7xl font-bold text-white uppercase mt-6 mb-8 tracking-tighter leading-none">{selectedProject.title}</h2>
                <p className="text-gray-400 text-xl leading-relaxed">{selectedProject.description}</p>
                {selectedProject.tools && (
                  <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap gap-2">
                    {selectedProject.tools.map((t: string) => <span key={t} className="px-3 py-1 border border-white/10 rounded-sm text-[10px] uppercase text-white/60 tracking-widest">{t}</span>)}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`.coverflow-carousel .swiper-slide { transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }`}</style>
    </section>
  );
}
