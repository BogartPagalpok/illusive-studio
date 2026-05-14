import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeft, ChevronRight, Play, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// Swiper CSS
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

  // Active slide index (used for hero + visual highlight)
  const [activeIndex, setActiveIndex] = useState(0);

  // Modal state — THIS IS THE ONE YOU CLICK "View Project"
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  // Swiper ref + navigation refs (stable DOM refs)
  const swiperRef = useRef<SwiperType | null>(null);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  /* ---------------- FETCH ---------------- */
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
      console.error('Supabase fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  /* ---------------- UNIQUE PROJECTS (one per title) ---------------- */
  const projects = useMemo(() => {
    const seen = new Set<string>();
    const unique: Project[] = [];
    for (const p of allData) {
      if (!seen.has(p.title)) {
        seen.add(p.title);
        unique.push(p);
      }
    }
    if (activeCategory === 'All') return unique;
    return unique.filter((p) => p.category === activeCategory);
  }, [allData, activeCategory]);

  /* ---------------- RESET ON CATEGORY CHANGE ---------------- */
  useEffect(() => {
    setActiveIndex(0);
    if (swiperRef.current && !swiperRef.current.destroyed) {
      swiperRef.current.slideTo(0, 0);
    }
  }, [activeCategory, projects.length]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <
