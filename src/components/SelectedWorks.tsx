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
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
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
      console.error("Supabase link failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorks(); }, [fetchWorks]);

  // GROUPING LOGIC: Merges same-named rows into 1 card
  const projects = useMemo(() => {
    const unique: Project[] = [];
    const seen = new Set<string>();
    allData.forEach(item => {
      if (!seen.has(item.title)) {
        seen.add(item.title);
        unique.push(item);
      }
    });
    return activeCategory === 'All' ? unique : unique.filter(p => p.category === activeCategory);
  }, [allData, activeCategory]);

  useEffect(() => {
    if (swiperRef.current) swiperRef.current.slideTo(0, 0);
    setActiveIndex(0);
  }, [activeCategory]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-10 h-10 text-accent animate-spin" />
    </div>
  );

  const current = projects[activeIndex];
  const gallery = allData.filter(p => p.title === selectedTitle);

  return (
    <section id="works" className="relative h-screen w-full bg-black overflow-hidden font-sans">
      
      {/* 1. BACKGROUND ENGINE */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={`bg-${current.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0"
          >
            <img src={current.image_url} className="w-full h-full object-cover opacity-40 pointer-events-none" alt="bg" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col px-6 md:px-16 pb-12">
        
        {/* 2. CATEGORIES - TOP LEFT FIX */}
        <div className="flex gap-6 items-center pt-24 md:pt-32 justify-start overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeCategory === cat ? 'text-white border-b-2 border-accent pb-1' : 'text-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. HERO + RAIL ANCHORED BOTTOM */}
        <div className="mt-auto flex flex-col gap-10">
          
          <div className="max-w-4xl">
            {current && (
              <div className="transition-all duration-500">
                <span className="text-accent text-[10px] md:text-xs font-black tracking-[0.4em] uppercase block mb-3">
                  {current.category}
                </span>
                {/* 4. DESKTOP FONT SCALE FIX */}
                <h1 className="text-white text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-4 max-w-[850px]">
                  {current.title}
                </h1>
                <p className="text-white/60 text-xs md:text-base font-light leading-relaxed mb-8 max-w-xl line-clamp-3">
                  {current.description}
                </p>
                <button 
                  onClick={() => setSelectedTitle(current.title)}
                  className="flex items-center gap-2 bg-white text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all"
                >
                  <Play size={14} fill="black" /> View Project
                </button>
              </div>
            )}
          </div>

          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">Up Next In Portfolio</h2>
              <div className="flex gap-4">
                <button type="button" className="rail-prev text-white/40 hover:text-white"><ChevronLeft size={20} /></button>
                <button type="button" className="rail-next text-white/40 hover:text-white"><ChevronRight size={20} /></button>
              </div>
            </div>
            
            <Swiper
              key={activeCategory} 
              onSwiper={(s) => { swiperRef.current = s; }}
              modules={[Navigation]}
              spaceBetween={12}
              slidesPerView={'auto'}
              navigation={{ nextEl: '.rail-next', prevEl: '.rail-prev' }}
              onSlideChange={(s) => setActiveIndex(s.realIndex)}
              className="!overflow-visible"
            >
              {projects.map((p, idx) => (
                <SwiperSlide key={p.id} className="!w-[130px] md:!w-[230px]">
                  <div 
                    onClick={() => swiperRef.current?.slideTo(idx)}
                    className={`relative aspect-video cursor-pointer transition-all duration-500 border-2 rounded-sm overflow-hidden ${
                      activeIndex === idx ? 'border-accent scale-105 shadow-[0_0_20px_var(--accent)] z-20' : 'border-transparent opacity-40 grayscale hover:opacity-100'
                    }`}
                  >
                    <img src={p.image_url} className="w-full h-full object-cover" alt="thumb" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      {/* 5. MODAL GALLERY */}
      <AnimatePresence>
        {selectedTitle && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl overflow-y-auto"
          >
            <div className="sticky top-0 z-[1001] flex justify-between items-center px-8 py-8 bg-black/80 backdrop-blur-md">
              <h2 className="text-white text-2xl font-black uppercase tracking-tighter">{selectedTitle}</h2>
              <button onClick={() => setSelectedTitle(null)} className="text-white/50 hover:text-white"><X size={32} /></button>
            </div>
            <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-12">
              {gallery.map((img) => (
                <div key={img.id}>
                  <img src={img.image_url} className="w-full border border-white/10 shadow-2xl" alt="gallery-img" />
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
