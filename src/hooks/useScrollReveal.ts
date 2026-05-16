import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  // Keep a ref for the latest options without re-running the effect
  const optionsRef = useRef({ threshold, rootMargin, triggerOnce });
  optionsRef.current = { threshold, rootMargin, triggerOnce };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let isActive = true; // avoid state updates on unmounted component

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!isActive) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (optionsRef.current.triggerOnce) observer.unobserve(element);
        } else if (!optionsRef.current.triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold: optionsRef.current.threshold, rootMargin: optionsRef.current.rootMargin }
    );

    observer.observe(element);

    // Refresh handler – re‑evaluate without recreating the observer
    const handleRefresh = () => {
      if (!element || !isActive) return;
      const rect = element.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      // Only update state if it actually changes to prevent useless re‑renders
      setIsVisible(prev => (inView !== prev ? inView : prev));
    };

    ScrollTrigger.addEventListener('refresh', handleRefresh);

    return () => {
      isActive = false;
      observer.disconnect();
      ScrollTrigger.removeEventListener('refresh', handleRefresh);
    };
  }, []);  // ← empty dependency array keeps the observer stable

  return { ref, isVisible };
}
