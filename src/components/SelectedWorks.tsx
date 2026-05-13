import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeft, ChevronRight, Play, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

import 'swiper/css';
import 'swiper/css/navigation';

interface Project {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description?: string;
}

const CATEGORIES = ['All', 'Graphic Design', 'Photography', 'UI/UX', 'Motion'];

export default function SelectedWorks() {
  const [allData, setAllData] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAllData(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorks(); }, [fetchWorks]);

  // GROUPING LOGIC: Same name = One Project
  const projects = useMemo(() => {
    const grouped = allData.reduce((acc: Project[], item) => {
      const exists = acc.find((p) => p.title === item.title);
      if (!exists) acc.push(item);
      return acc;
    }, []);

    return activeCategory === 'All' 
      ? grouped 
      : grouped.filter(p => p.category === activeCategory);
  }, [allData, activeCategory]);

  useEffect(() => {
    if (swiperRef.current) swiperRef.current.slideTo(0);
    setActiveIndex(0);
  }, [activeCategory]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-10 h-10 text-accent animate-spin" />
    </div>
  );

  const currentProject = projects[activeIndex];
  const modalGallery = allData.filter(p => p.title === selectedProjectTitle);

  return (
    <section id="works" className="relative h-screen w-full bg-black overflow-hidden font-sans">
      
      {/* 1. DYNAMIC BACKGROUND */}
      <AnimatePresence mode="wait">
        {currentProject && (
          <motion.div
            key={`bg-${currentProject.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={currentProject.image_url} 
              className="w-full h-full object-cover opacity-40 pointer-events-none"
              alt="Background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col px-6 md:px-16 pb-10">
        
        {/* 2. TOP-LEFT CATEGORIES */}
        <div className="flex gap-6 items-center pt-24 md:pt-32 justify-start overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeCategory === cat ? 'text-white border-b-2 border-accent pb-1' : 'text-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. BOTTOM STACK - Pinned Hero + Rail */}
        <div className="mt-auto flex flex-col gap-8 md:gap-12">
          
          <div className="max-w-4xl">
            <AnimatePresence mode="wait">
              {currentProject && (
                <motion.div
                  key={`hero-${currentProject.id}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-accent text-[10px] md:text-xs font-black tracking-[0.4em] uppercase block mb-3">
                    {currentProject.category}
                  </span>
                  {/* Desktop Font Fixed: md:text-6xl max */}
                  <h1 className="text-white text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-4 max-w-[850px]">
                    {currentProject.title}
                  </h1>
                  <p className="text-white/60 text-xs md:text-base font-light leading-relaxed mb-8 max-w-xl line-clamp-3">
                    {currentProject.description || "Experimental visual design and digital texture reconstruction."}
                  </p>
                  <button 
                    type="button"
                    onClick={() => setSelectedProjectTitle(currentProject.title)}
                    className="flex items-center gap-2 bg-white text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all"
                  >
                    <Play size={14} fill="black" /> View Project
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. UP NEXT RAIL */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">
                Up Next In Portfolio
              </h2>
              <div className="flex gap-4">
                <button type="button" className="rail-prev text-white/40 hover:text-white transition-all"><ChevronLeft size={20} /></button>
                <button type="button" className="rail-next text-white/40 hover:text-white transition-all"><ChevronRight size={20} /></button>
              </div>
            </div>
            
            <Swiper
              key={activeCategory} 
              onSwiper={(s) => (swiperRef.current = s)}
              modules={[Navigation]}
              spaceBetween={12}
              slidesPerView={'auto'}
              navigation={{ nextEl: '.rail-next', prevEl: '.rail-prev' }}
              onSlideChange={(s) => setActiveIndex(s.realIndex)}
              className="!overflow-visible"
            >
              {projects.map((project, idx) => (
                <SwiperSlide key={project.id} className="!w-[130px] md:!w-[220px]">
                  <div 
                    onClick={() => swiperRef.current?.slideTo(idx)}
                    className={`relative aspect-video cursor-pointer transition-all duration-500 rounded-sm overflow-hidden border-2 ${
                      activeIndex === idx 
                        ? 'border-accent scale-105 shadow-[0_0_20px_var(--accent)] z-20' 
                        : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                    }`}
                  >
                    <img src={project.image_url} className="w-full h-full object-cover" alt="thumb" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      {/* 5. MULTI-IMAGE MODAL */}
      <AnimatePresence>
        {selectedProjectTitle && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl overflow-y-auto"
          >
            <div className="sticky top-0 z-[1001] flex justify-between items-center px-8 py-8 bg-black/80 backdrop-blur-md">
              <h2 className="text-white text-2xl font-black uppercase tracking-tighter">{selectedProjectTitle}</h2>
              <button type="button" onClick={() => setSelectedProjectTitle(null)} className="text-white/50 hover:text-white"><X size={32} /></button>
            </div>
            <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-12">
              {modalGallery.map((img, i) => (
                <div key={img.id} className="flex flex-col gap-6">
                  <img src={img.image_url} className="w-full border border-white/10 shadow-2xl" alt="gallery" />
                  {i === 0 && img.description && <p className="text-white/60 text-lg font-light leading-relaxed">{img.description}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
