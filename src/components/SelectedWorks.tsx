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
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    document.body.style.overflow = selectedProject ? 'hidden' : 'unset';
  }, [selectedProject]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (data) {
        // Simple grouping logic to ensure clean titles
        const grouped: Record<string, any> = {};
        data.forEach((item) => {
          const cleanTitle = item.title.replace(/\.[^/.]+$/, "").trim();
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
    <section className="py-24 relative z-40 bg-transparent min-h-screen overflow-hidden">
      <div id="works" className="absolute -top-24" />
      
      <div className="max-w-[1600px] mx-auto px-4 relative z-20">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.4em] uppercase text-accent mb-4">Visionary Lab</p>
          <h2 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-tighter">Selected Works</h2>
        </div>

        <div className="relative group overflow-visible">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[EffectCoverflow, Navigation, Pagination]}
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            // INFINITE STACK FIX
            loop={true}
            loopedSlides={5} 
            slidesPerView={'auto'}
            navigation={{
              nextEl: '.nav-next',
              prevEl: '.nav-prev',
            }}
            coverflowEffect={{
              rotate: 0,           // Keeps cards flat like your reference
              stretch: -100,       // Pulls cards together for the "Stacked" look
              depth: 300,          // Pushes side cards back in 3D space
              modifier: 1,
              slideShadows: false,
            }}
            className="!pb-28 !pt-10 overflow-visible"
          >
            {projects.map((project) => (
              <SwiperSlide key={project.id} className="max-w-[320px] md:max-w-[480px]">
                <div className="relative h-[550px] md:h-[750px] rounded-[60px] border border-white/10 overflow-hidden backdrop-blur-3xl bg-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
                  <img src={project.image_url} className="absolute inset-0 w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-12 w-full z-10">
                    <span className="text-accent text-xs tracking-[0.3em] uppercase font-bold">{project.category}</span>
                    <h3 className="text-3xl md:text-5xl font-bold text-white uppercase mt-4 mb-10 leading-none tracking-tighter">{project.title}</h3>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                      }}
                      className="inline-flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full text-xs tracking-[0.2em] uppercase font-black hover:bg-accent transition-all cursor-pointer shadow-xl"
                    >
                      View Full Case <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* High-Contrast Navigation */}
          <button className="nav-prev absolute left-4 top-1/2 -translate-y-1/2 z-[100] p-6 rounded-full bg-black/80 border border-white/20 text-white hover:bg-accent hover:text-black transition-all hidden xl:flex shadow-2xl">
            <ChevronLeft size={32} />
          </button>
          <button className="nav-next absolute right-4 top-1/2 -translate-y-1/2 z-[100] p-6 rounded-full bg-black/80 border border-white/20 text-white hover:bg-accent hover:text-black transition-all hidden xl:flex shadow-2xl">
            <ChevronRight size={32} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-12 bg-black/98 backdrop-blur-3xl"
          >
            <button onClick={() => setSelectedProject(null)} className="absolute top-10 right-10 z-[10000] p-5 bg-white/10 rounded-full text-white hover:bg-accent hover:text-black transition-all">
              <X size={32} />
            </button>
            
            <motion.div 
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="w-full max-w-7xl flex flex-col md:flex-row items-center gap-16"
            >
              <div className="flex-1">
                <img src={selectedProject.image_url} className="w-full rounded-[40px] shadow-2xl border border-white/10" alt="" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-accent text-sm tracking-[0.3em] uppercase">{selectedProject.category}</span>
                <h2 className="text-6xl font-bold text-white uppercase mt-6 mb-8 tracking-tighter leading-none">{selectedProject.title}</h2>
                <p className="text-gray-400 text-xl leading-relaxed max-w-lg">{selectedProject.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
