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

  // FIX: Navbar Glassmorphism + Auto-Hide to stop blocking the Modal
  useEffect(() => {
    const nav = document.querySelector('nav');
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      if (nav) {
        nav.style.transition = 'all 0.4s ease';
        nav.style.opacity = '0';
        nav.style.transform = 'translateY(-100%)';
      }
    } else {
      document.body.style.overflow = 'unset';
      if (nav) {
        nav.style.opacity = '1';
        nav.style.transform = 'translateY(0)';
        // Force Glassmorphism on the Nav via JS to be safe
        nav.style.backdropFilter = 'blur(12px)';
        nav.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
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
            // FIX: Ensure ALL database fields (description, tools) are kept
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
    // FIX: overflow-hidden stops the "Bouncing" of arrows/titles when slides scale
    <section id="works" className="py-12 relative z-40 bg-transparent min-h-screen overflow-hidden flex flex-col justify-center">
      
      <div className="max-w-[1600px] mx-auto px-4 w-full relative z-20">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-accent mb-2">Portfolio</p>
          <h2 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-tighter leading-none">Works</h2>
        </div>

        <div className="relative group">
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
              rotate: 0,
              stretch: -50,    // Reduces overlap for cleaner look
              depth: 200,      
              modifier: 1,
              slideShadows: false,
            }}
            speed={800} 
            // FIX: Fixed height on the Swiper container PREVENTS THE BOUNCING
            className="!pb-24 !pt-10 overflow-visible coverflow-carousel h-[600px] md:h-[750px]"
          >
            {projects.map((project) => (
              <SwiperSlide
                key={project.id}
                style={{ width: '300px' }} // REDUCED SIZE
                className="md:!w-[400px] !flex items-center justify-center"
              >
                {({ isActive }) => (
                  <div
                    className={`relative w-full rounded-[40px] border overflow-hidden backdrop-blur-3xl shadow-2xl transition-all duration-700 ease-out ${
                      isActive
                        ? 'h-[520px] md:h-[680px] border-white/20 bg-white/10 scale-100 z-10'
                        : 'h-[440px] md:h-[580px] border-white/5 bg-white/5 scale-[0.85] opacity-40'
                    }`}
                  >
                    <img src={project.image_url} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
                    
                    {isActive && <div className="absolute inset-0 rounded-[40px] ring-1 ring-accent/30 pointer-events-none" />}

                    <div className={`absolute bottom-0 left-0 p-10 w-full z-50 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                      <span className="text-accent text-[10px] tracking-[0.4em] uppercase font-black">{project.category}</span>
                      <h3 className="text-2xl md:text-4xl font-bold text-white uppercase mt-2 mb-8 leading-none tracking-tighter">{project.title}</h3>
                      <button
                        onClick={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          setSelectedProject(project);
                          setCurrentImageIndex(0);
                        }}
                        className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full text-[11px] font-black tracking-widest uppercase hover:bg-accent transition-all cursor-pointer relative z-[60]"
                      >
                        View Case <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* ARROWS: Fixed outside the Swiper to avoid bouncing */}
          <button className="nav-prev absolute left-0 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/60 border border-white/10 text-white hover:bg-accent transition-all hidden xl:flex shadow-2xl"><ChevronLeft size={28} /></button>
          <button className="nav-next absolute right-0 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/60 border border-white/10 text-white hover:bg-accent transition-all hidden xl:flex shadow-2xl"><ChevronRight size={28} /></button>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl"
          >
            <button onClick={() => setSelectedProject(null)} className="absolute top-8 right-8 z-[10000] p-4 bg-white/10 rounded-full text-white hover:bg-accent transition-all"><X size={28} /></button>

            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="flex flex-col md:flex-row items-center gap-12 max-w-7xl w-full">
              <div className="relative w-full md:w-3/5 h-[45vh] md:h-[75vh] flex items-center justify-center bg-black/20 rounded-[40px] overflow-hidden border border-white/5 shadow-2xl">
                <motion.img
                  key={currentImageIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url}
                  className="max-w-full max-h-full object-contain p-4" alt="" />
                
                {selectedProject.all_images && selectedProject.all_images.length > 1 && (
                  <>
                    <button onClick={prevSubImage} className="absolute left-4 p-3 rounded-full bg-black/60 text-white hover:bg-accent transition-all"><ChevronLeft size={24} /></button>
                    <button onClick={nextSubImage} className="absolute right-4 p-3 rounded-full bg-black/60 text-white hover:bg-accent transition-all"><ChevronRight size={24} /></button>
                  </>
                )}
              </div>

              {/* DETAILS RESTORED: Image 2 Fix */}
              <div className="text-left md:w-2/5 p-4">
                <span className="text-accent text-sm tracking-[0.4em] uppercase font-bold">{selectedProject.category}</span>
                <h2 className="text-5xl md:text-7xl font-bold text-white uppercase mt-4 mb-8 tracking-tighter leading-none">{selectedProject.title}</h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-10">{selectedProject.description}</p>
                
                {selectedProject.tools && (
                  <div className="flex flex-wrap gap-2 pt-8 border-t border-white/10">
                    {selectedProject.tools.map((tool: string) => (
                      <span key={tool} className="px-3 py-1 border border-white/10 rounded-sm text-[10px] uppercase text-white/50 tracking-widest">{tool}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
