import { useEffect, useRef, useState } from 'react';
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
  const optionsRef = useRef({ threshold, rootMargin, triggerOnce });
  optionsRef.current = { threshold, rootMargin, triggerOnce };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let isActive = true;

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

    const handleRefresh = () => {
      if (!element || !isActive) return;
      const rect = element.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      setIsVisible(prev => (inView !== prev ? inView : prev));
    };

    ScrollTrigger.addEventListener('refresh', handleRefresh);

    return () => {
      isActive = false;
      observer.disconnect();
      ScrollTrigger.removeEventListener('refresh', handleRefresh);
    };
  }, []);

  return { ref, isVisible };
}
