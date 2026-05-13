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
        const grouped: Record<string, any> = {};
        data.forEach((item) => {
          const cleanTitle = item.title.replace(/\.[^/.]+$/, '').trim();
          if (!grouped[cleanTitle]) {
            grouped[cleanTitle] = {
              ...item,
              title: cleanTitle,
              all_images: [item.image_url],
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
    <section className="relative z-40 bg-transparent min-h-[130vh] py-20 overflow-visible flex flex-col justify-center">
      {/* FIXED: Dedicated anchor point for perfect center scrolling */}
      <div id="works" className="absolute top-[15%] left-0 w-full h-1 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 w-full relative z-20">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-accent mb-2">
            Selected Portfolio
          </p>
          <h2 className="text-6xl md:text-8xl font-bold text-white uppercase tracking-tighter leading-none">
            Works
          </h2>
        </div>

        <div className="relative group overflow-visible">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[EffectCoverflow, Navigation, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={true}
            loopedSlides={5} // FIXED: Explicit buffer for smooth looping with low project counts
            slidesPerView="auto"
            navigation={{ nextEl: '.nav-next', prevEl: '.nav-prev' }}
            coverflowEffect={{
              rotate: 0,       // FIXED: Flat cards for modern UI look
              stretch: -60,    // FIXED: Negative stretch pulls cards together for "Vision Pro" stack
              depth: 300,      // FIXED: Increased depth for better fanned-out perspective
              modifier: 1,
              slideShadows: false, // FIXED: Turned off to prevent murky tint on renders
            }}
            speed={800}
            className="!pb-24 !pt-10 overflow-visible coverflow-carousel"
          >
            {projects.map((project) => (
              <SwiperSlide
                key={project.id}
                style={{ width: '360px' }}
                className="md:!w-[460px] !flex items-center justify-center"
              >
                {({ isActive }) => (
                  <div
                    className={`relative w-full rounded-[40px] border overflow-hidden backdrop-blur-3xl shadow-2xl transition-all duration-700 ease-out ${
                      isActive
                        ? 'h-[580px] md:h-[700px] border-white/20 bg-white/10 scale-100 z-10'
                        : 'h-[500px] md:h-[600px] border-white/5 bg-white/5 scale-[0.85] opacity-40'
                    }`}
                  >
                    <img
                      src={project.image_url}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      alt=""
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

                    {isActive && (
                      <div className="absolute inset-0 rounded-[40px] ring-1 ring-accent/30 pointer-events-none" />
                    )}

                    <div
                      className={`absolute bottom-0 left-0 p-8 md:p-12 w-full z-50 transition-all duration-500 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                    >
                      <span className="text-accent text-[10px] tracking-[0.4em] uppercase font-black">
                        {project.category}
                      </span>
                      <h3 className="text-3xl md:text-5xl font-bold text-white uppercase mt-2 mb-8 leading-none tracking-tighter">
                        {project.title}
                      </h3>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedProject(project);
                        }}
                        className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full text-[11px] font-black tracking-widest uppercase hover:bg-accent transition-all cursor-pointer relative z-[60]"
                      >
                        View Project <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="nav-prev absolute left-2 xl:-left-8 top-1/2 -translate-y-1/2 z-[100] p-5 rounded-full bg-black/80 border border-white/20 text-white hover:bg-accent hover:border-accent transition-all flex shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100">
            <ChevronLeft size={30} />
          </button>
          <button className="nav-next absolute right-2 xl:-right-8 top-1/2 -translate-y-1/2 z-[100] p-5 rounded-full bg-black/80 border border-white/20 text-white hover:bg-accent hover:border-accent transition-all flex shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100">
            <ChevronRight size={30} />
          </button>
        </div>
      </div>

      <div className="h-[20vh] w-full pointer-events-none" />

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl"
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-10 right-10 z-[10000] p-4 bg-white/10 rounded-full text-white hover:bg-accent transition-all"
            >
              <X size={32} />
            </button>

            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col md:flex-row items-center gap-16 max-w-7xl"
            >
              <img
                src={selectedProject.image_url}
                className="w-full md:w-3/5 rounded-[50px] shadow-2xl border border-white/10"
                alt=""
              />
              <div className="text-left md:w-2/5">
                <span className="text-accent text-sm tracking-[0.4em] uppercase font-bold">
                  {selectedProject.category}
                </span>
                <h2 className="text-6xl md:text-7xl font-bold text-white uppercase mt-6 mb-8 tracking-tighter leading-none">
                  {selectedProject.title}
                </h2>
                <p className="text-gray-400 text-xl leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
