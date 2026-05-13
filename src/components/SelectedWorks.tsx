import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Play,
} from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import { supabase } from '../lib/supabase';

import 'swiper/css';

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  card_thumbnail: string;
  tools: string[];
}

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [zoom, setZoom] = useState(1);

  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select(
          'id, title, category, description, image_url, card_thumbnail, tools'
        )
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      if (data) {
        const sanitized: Project[] = data.map((item: any) => ({
          ...item,
          title: (item.title || 'Untitled').replace(/\.[^/.]+$/, '').trim(),
          category: item.category || 'Featured',
          description: item.description || '',
          image_url: item.image_url || '',
          card_thumbnail: item.card_thumbnail || item.image_url || '',
          tools: Array.isArray(item.tools) ? item.tools : [],
        }));

        setProjects(sanitized);
        setActiveIndex(0);
      }
    };

    fetchData();
  }, []);

  const activeProject = projects[activeIndex];

  return (
    <section
      id="works"
      className="selected-works-container relative h-screen w-full bg-[#050505] overflow-hidden flex flex-col justify-end"
    >
      {/* 1. CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {activeProject && (
            <motion.div
              key={activeProject.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img
                src={activeProject.image_url}
                className="h-full w-full object-cover brightness-[0.4]"
                alt={activeProject.title}
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. HERO CONTENT + NAVIGATION */}
      <div className="relative z-20 w-full px-6 md:px-16 mb-6 flex items-end justify-between">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            {activeProject && (
              <motion.div
                key={`txt-${activeProject.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.45 }}
                className="space-y-4"
              >
                <p className="text-accent text-[10px] tracking-[0.6em] uppercase font-black italic">
                  {activeProject.category}
                </p>

                <h2 className="text-5xl md:text-[7vw] font-black text-white uppercase tracking-tighter leading-[0.8] italic">
                  {activeProject.title}
                </h2>

                <p className="text-white/70 text-sm md:text-lg italic max-w-xl line-clamp-3 leading-relaxed">
                  {activeProject.description}
                </p>

                <button
                  onClick={() => setSelectedProject(activeProject)}
                  className="bg-white text-black px-10 py-4 rounded-md font-black uppercase text-[10px] flex items-center gap-2 hover:bg-accent transition-all active:scale-95"
                >
                  <Play size={18} fill="black" />
                  View Project
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden md:flex gap-4">
          <button className="prev-btn p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all">
            <ChevronLeft size={32} />
          </button>

          <button className="next-btn p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all">
            <ChevronRight size={32} />
          </button>
        </div>
      </div>

      {/* 3. NETFLIX-STYLE ROW CAROUSEL */}
      <div className="relative z-20 w-full pb-12 px-6 md:px-16">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.realIndex);
          }}
          modules={[Navigation]}
          navigation={{
            prevEl: '.prev-btn',
            nextEl: '.next-btn',
          }}
          slidesPerView="auto"
          spaceBetween={15}
          loop={projects.length > 4}
          className="!overflow-visible"
        >
          {projects.map((project, idx) => (
            <SwiperSlide
              key={project.id}
              style={{ width: 'min(280px, 50vw)' }}
            >
              <div
                onClick={() => swiperRef.current?.slideToLoop(idx)}
                className={`relative aspect-[16/9] rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-500 ${
                  activeIndex === idx
                    ? 'border-accent scale-105 shadow-[0_0_30px_rgba(var(--accent-rgb),0.5)] z-30'
                    : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                <img
                  src={project.card_thumbnail}
                  className="w-full h-full object-cover"
                  alt={project.title}
                />

                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 4. FULLSCREEN MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 
