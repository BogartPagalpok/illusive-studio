import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
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
  description: string;
  image_url: string;
  process?: string;
  tools?: string[]; // Matches your text[] column
  all_images?: string[];
}

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('id, title, category, description, image_url, process, tools')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) return;

      if (data) {
        const grouped: Record<string, Project> = {};
        data.forEach((item: any) => {
          const cleanTitle = item.title.replace(/\.[^/.]+$/, '').trim();
          if (!grouped[cleanTitle]) {
            grouped[cleanTitle] = { 
              ...item, 
              title: cleanTitle, 
              all_images: [item.image_url],
              // tools is already an array in your DB, no need to split
              tools: Array.isArray(item.tools) ? item.tools : []
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
      
      {/* 1. DYNAMIC BILLBOARD BACKGROUND (Netflix Style) */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {projects.length > 0 && (
            <motion.div
              key={projects[activeIndex]?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <img 
                src={projects[activeIndex]?.image_url} 
                className="w-full h-full object-cover brightness-[0.2] grayscale-[40%]" 
                alt="bg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/80" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 w-full relative z-20">
        
        {/* 2. HERO DETAILS (Syncs with Slide) */}
        <div className="mb-10 h-40 md:h-60 flex flex-col justify-end">
          <AnimatePresence mode="wait">
            {projects.length > 0 && (
              <motion.div
                key={`hero-${projects[activeIndex]?.id}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <span className="h-[2px] w-8 bg-accent" />
                  <p className="text-accent text-xs tracking-[0.5em] uppercase font-black italic">{projects[activeIndex]?.category}</p>
                </div>
                <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] italic">{projects[activeIndex]?.title}</h2>
                <p className="max-w-2xl text-white/50 text-sm md:text-lg leading-relaxed italic line-clamp-2">
                  {projects[activeIndex]?.description}
                </p>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setSelectedProject(projects[activeIndex])} className="bg-white text-black px-8 py-3 rounded-md font-black uppercase text-xs flex items-center gap-2 hover:bg-accent transition-all">
                    <Play size={16} fill="black" /> View Project
                  </button>
                </div>
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
            speed={800}
            slidesPerView="auto"
            navigation={{ nextEl: '.nav-next', prevEl: '.nav-prev' }}
            coverflowEffect={{ rotate: 0, stretch: 0, depth: 160, modifier: 2.5, slideShadows: false }}
            className="!pb-20 !pt-10 overflow-visible"
          >
            {projects.map((project) => (
              <SwiperSlide key={project.id} style={{ width: 'min(320px, 75vw)' }} className="!flex items-center justify-center">
                {({ isActive }) => (
                  <div className={`relative w-full aspect-[3/4.2] rounded-[20px] border transition-all duration-700 ${
                    isActive ? 'border-white/30 bg-white/10 scale-100 shadow-2xl' : 'border-white/5 opacity-30 scale-[0.85] grayscale'
                  }`}>
                    <img src={project.image_url} className="w-full h-full object-cover rounded-[18px]" alt={project.title} />
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* 4. CASE STUDY MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-6 overflow-y-auto">
            <button onClick={() => setSelectedProject(null)} className="fixed top-8 right-8 z-[10001] p-4 text-white hover:text-accent"><X size={32} /></button>
            <div className="flex flex-col lg:flex-row items-center gap-12 max-w-[1400px] w-full">
              <div className="flex-1 w-full aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10">
                <img src={selectedProject.image_url} className="w-full h-full object-contain p-4" alt="detail" />
              </div>
              <div className="w-full lg:w-[450px] space-y-6">
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{selectedProject.title}</h2>
                <p className="text-gray-400 text-lg leading-relaxed">{selectedProject.description}</p>
                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedProject.tools?.map((tool) => (
                    <span key={tool} className="px-4 py-2 border border-white/10 rounded-lg text-[10px] text-white/60 font-bold uppercase tracking-widest bg-white/5">{tool}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
