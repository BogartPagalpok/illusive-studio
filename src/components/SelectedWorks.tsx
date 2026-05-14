import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeft, ChevronRight, Play, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// Swiper styles
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
  
  // Swiper control refs
  const swiperRef = useRef<SwiperType | null>(null);
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

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
      console.error("Supabase Error: Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchWorks(); 
  }, [fetchWorks]);

  // Group projects by unique title (Mechanical Grouping)
  const projects = useMemo(() => {
    const unique: Project[] = [];
    const seen = new Set<string>();
    
    allData.forEach(item => {
      // Only add if title hasn't been seen yet and it matches the category or 'All'
      if (!seen.has(item.title) && (activeCategory === 'All' || item.category === activeCategory)) {
        seen.add(item.title);
        unique.push(item);
      }
    });

    return unique;
  }, [allData, activeCategory]);

  // Reset active index when category or project list changes
  useEffect(() => {
    setActiveIndex(0);
    // Ensure Swiper slides to the first item when category changes
    if (swiperRef.current && !swiperRef.current.destroyed) {
      swiperRef.current.slideTo(0, 0); // Slide to 0 with no animation
      swiperRef.current.update(); // Force Swiper to update its layout
    }
  }, [activeCategory, projects.length]); // Added projects.length as a dependency for when data changes within a category

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" /> {/* Changed accent to specific color for clarity */}
      </div>
    );
  }

  // Handle case where projects might be empty after filtering (e.g., a category has no items)
  const current = projects[activeIndex] || projects[0] || null;
  const gallery = selectedTitle ? allData.filter(p => p.title === selectedTitle) : [];

  // Display a message if no projects are found after loading/filtering
  if (!projects.length && !loading) {
    return (
      <section id="works" className="relative h-screen w-full bg-black flex flex-col items-center justify-center font-sans px-6">
        <div className="flex gap-6 items-center absolute top-12 md:top-16 left-6 md:left-16 right-6 overflow-x-auto"
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'text-white border-b-2 border-amber-400 pb-1' : 'text-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <p className="text-white/70 text-xl md:text-2xl font-bold">
          No projects found for "{activeCategory}".
        </p>
        <button 
          onClick={() => setActiveCategory('All')} 
          className="mt-6 text-sm text-amber-400 hover:text-white underline transition-colors"
        >
          View all projects
        </button>
      </section>
    );
  }

  return (
    <section id="works" className="relative h-screen w-full bg-black overflow-hidden font-sans">
      
      {/* 1. BACKGROUND ENGINE - Add pointer-events-none to the div itself */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={`bg-${current.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0 pointer-events-none" // <-- ADDED THIS
          >
            <img 
              src={current.image_url} 
              className="w-full h-full object-cover" // Removed pointer-events-none from image as it's on parent
              alt={`Background for ${current.title}`} 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col px-6 md:px-16 pb-12">
        
        {/* 2. CATEGORIES - Adjusted padding to be closer to the top */}
        <div 
          className="flex gap-6 items-center pt-12 md:pt-16 justify-start overflow-x-auto" // <-- ADJUSTED PADDING
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Inline styles for no-scrollbar
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'text-white border-b-2 border-amber-400 pb-1' // Using specific color for accent
                  : 'text-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. HERO + RAIL - PINNED TO BOTTOM */}
        <div className="mt-auto flex flex-col gap-8 md:gap-10 pt-8"> {/* Added pt-8 for spacing from categories */}
          
          <div className="max-w-4xl min-h-[180px]"> {/* Added min-h to prevent layout shift if content is null */}
            {current && (
              <div className="transition-all duration-500">
                <span className="text-amber-400 text-[10px] md:text-xs font-black tracking-[0.4em] uppercase block mb-3">
                  {current.category}
                </span>
                <h1 className="text-white text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-4 max-w-[850px]">
                  {current.title}
                </h1>
                <p className="text-white/60 text-xs md:text-base font-light leading-relaxed mb-6 max-w-xl line-clamp-3">
                  {current.description || "A captivating project showcasing creative design and technical expertise."}
                </p>
                <button 
                  onClick={() => setSelectedTitle(current.title)}
                  className="flex items-center gap-2 bg-white text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all duration-300" // Accent color
                >
                  <Play size={14} fill="black" /> View Project
                </button>
              </div>
            )}
          </div>

          <div className="w-full relative select-none">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">Portfolio</h2>
              <div className="flex gap-4">
                {/* Swiper Navigation Buttons - Attached refs directly */}
                <button 
                  ref={setPrevEl} // <-- Attach ref
                  type="button" 
                  className="text-white/40 hover:text-white transition-colors cursor-pointer disabled:opacity-20"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  ref={setNextEl} // <-- Attach ref
                  type="button" 
                  className="text-white/40 hover:text-white transition-colors cursor-pointer disabled:opacity-20"
                  aria-label="Next slide"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <Swiper
              key={activeCategory} // Force re-mount Swiper when category changes to reset internal state
              onSwiper={(s) => { swiperRef.current = s; }}
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={'auto'}
              grabCursor={true}
              // watchSlidesProgress={true} // Generally not needed unless you're styling based on progress
              navigation={{ prevEl, nextEl }} // <-- Use refs here
              onSlideChange={(s) => setActiveIndex(s.activeIndex)} // Use activeIndex for consistency
              className="!overflow-visible touch-pan-y"
            >
              {projects.map((p, idx) => (
                <SwiperSlide key={p.id} className="!w-[160px] md:!w-[260px]"> {/* Increased width slightly */}
                  <div 
                    onClick={() => swiperRef.current?.slideTo(idx)} // <-- CLICKABLE CARD
                    className={`relative aspect-video cursor-pointer transition-all duration-500 border rounded-sm overflow-hidden ${
                      activeIndex === idx 
                        ? 'border-amber-400 scale-105 shadow-[0_0_20px_rgba(251,191,36,0.3)] z-20 opacity-100 grayscale-0' // Specific shadow and accent color
                        : 'border-transparent opacity-40 grayscale hover:opacity-80 hover:grayscale-0'
                    }`}
                  >
                    <img src={p.image_url} className="w-full h-full object-cover" alt={p.title} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      {/* 4. MODAL GALLERY */}
      <AnimatePresence>
        {selectedTitle && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl overflow-y-auto"
          >
            <div className="sticky top-0 z-[1001] flex justify-between items-center px-6 md:px-12 py-8 bg-black/80 backdrop-blur-md">
              <h2 className="text-white text-xl md:text-2xl font-black uppercase tracking-tighter">
                {selectedTitle}
              </h2>
              <button 
                onClick={() => setSelectedTitle(null)} 
                className="text-white/50 hover:text-white transition-colors p-2"
                aria-label="Close project gallery"
              >
                <X size={28} />
              </button>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-12">
              {gallery.map((img, i) => (
                <motion.div 
                  key={img.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <img 
                    src={img.image_url} 
                    className="w-full rounded border border-white/10 shadow-2xl" 
                    alt={`${selectedTitle} image ${i + 1}`} 
                  />
                  {img.description && (
                    <p className="mt-4 text-white/60 text-sm">{img.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
