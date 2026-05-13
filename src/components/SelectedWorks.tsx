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

  // Modal Gallery Navigation
  const nextSubImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedProject?.all_images) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProject.all_images.length);
    }
  };

  const prevSubImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedProject?.all_images) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedProject.all_images.length) % selectedProject.all_images.length);
    }
  };

  return (
    <section
      className="relative z-40 bg-transparent min-h-[130vh] py-12 overflow-visible flex flex-col justify-center"
    >
      {/* Anchor fix for smooth centering */}
      <div id="works" className="absolute top-[15%] left-0 w-full h-1 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 w-full relative z-20">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-accent mb-2">
            Selected Portfolio
          </p>
          <h2 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-tighter leading-none">
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
            loopedSlides={5}
            slidesPerView="auto"
            navigation={{ nextEl: '.nav-next', prevEl: '.nav-prev' }}
            coverflowEffect={{
              rotate: 0,       // Keep cards flat for the high-end 3D look
              stretch: -40,    // REDUCED SIZE: tighter overlap
              depth: 250,      // REDUCED DEPTH: more elegant perspective
              modifier: 1,
              slideShadows: false, // Turn off for pure colors, use your custom gradient instead
            }}
            speed={900} // SMOOTH ANIMATION: slower, deliberate slide transition
            className="!pb-24 !pt-10 overflow-visible coverflow-carousel"
          >
            {projects.map((project) => (
              <SwiperSlide
                key={project.id}
                style={{ width: '300px' }} // REDUCED SIZE: from 340px
                className="md:!w-[380px] !flex items-center justify-center"
              >
                {({ isActive }) => (
                  <div
                    className={`relative w-full rounded-[40px] border overflow-hidden backdrop-blur-3xl shadow-2xl transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      isActive
                        ? 'h-[480px] md:h-[620px] border-white/20 bg-white/10 scale-100 z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]'
                        : 'h-[420px] md:h-[540px] border-white/5 bg-white/5 scale-[0.82] opacity-40 grayscale-[40%]'
                    }`}
                  >
                    <img
                      src={project.image_url}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      alt=""
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />

                    {isActive && (
                      <div className="absolute inset-0 rounded-[40px] ring-1 ring-accent/30 pointer-events-none" />
                    )}

                    <div
                      className={`absolute bottom-0 left-0 p-8 md:p-10 w-full z-50 transition-all duration-700 delay-100 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                    >
                      <span className="text-accent text-[10px] tracking-[0.4em] uppercase font-black">
                        {project.category}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold text-white uppercase mt-2 mb-6 leading-none tracking-tighter">
                        {project.title}
                      </h3>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedProject(project);
                          setCurrentImageIndex(0); // Reset to first image
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

          <button className="nav-prev absolute left-0 xl:-left-12 top-1/2 -translate-y-1/2 z-[100] p-4 xl:p-5 rounded-full bg-black/80 border border-white/20 text-white hover:bg-accent hover:border-accent transition-all flex shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100"><ChevronLeft size={28} /></button>
          <button className="nav-next absolute right-0 xl:-right-12 top-1/2 -translate-y-1/2 z-[100] p-4 xl:p-5 rounded-full bg-black/80 border border-white/20 text-white hover:bg-accent hover:border-accent transition-all flex shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100"><ChevronRight size={28} /></button>
        </div>
      </div>

      <div className="h-[20vh] w-full pointer-events-none" />

      {/* MODAL: GALLERY FIX */}
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
              className="absolute top-8 right-8 z-[10000] p-4 bg-white/10 rounded-full text-white hover:bg-accent transition-all"
            >
              <X size={32} />
            </button>

            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col md:flex-row items-center gap-12 max-w-7xl w-full"
            >
              {/* IMAGE GALLERY SECTION */}
              <div className="relative w-full md:w-3/5 h-[40vh] md:h-[75vh] flex items-center justify-center group bg-black/20 rounded-[40px] overflow-hidden border border-white/5">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url}
                  className="max-w-full max-h-full object-contain"
                  alt=""
                />
                
                {selectedProject.all_images && selectedProject.all_images.length > 1 && (
                  <>
                    <button onClick={prevSubImage} className="absolute left-6 p-3 rounded-full bg-black/60 text-white hover:bg-accent transition-all shadow-xl"><ChevronLeft size={24} /></button>
                    <button onClick={nextSubImage} className="absolute right-6 p-3 rounded-full bg-black/60 text-white hover:bg-accent transition-all shadow-xl"><ChevronRight size={24} /></button>
                    <div className="absolute bottom-8 flex gap-3">
                      {selectedProject.all_images.map((_: any, i: number) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-accent w-8' : 'bg-white/20 w-3'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* TEXT CONTENT SECTION */}
              <div className="text-left md:w-2/5 p-4">
                <span className="text-accent text-xs tracking-[0.4em] uppercase font-bold">
                  {selectedProject.category}
                </span>
                <h2 className="text-5xl md:text-6xl font-bold text-white uppercase mt-4 mb-8 tracking-tighter leading-none">
                  {selectedProject.title}
                </h2>
                <div className="space-y-6">
                  <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                    {selectedProject.description}
                  </p>
                  <div className="pt-8 border-t border-white/10 flex flex-wrap gap-2">
                    {selectedProject.tools?.map((tool: string) => (
                      <span key={tool} className="px-3 py-1 border border-white/10 rounded-sm text-[9px] uppercase tracking-widest text-white/60">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .coverflow-carousel .swiper-slide {
          transition: all 1s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>
    </section>
  );
}
