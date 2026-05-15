import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show if scrolling up, hide if scrolling down
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      
      setScrolled(currentScrollY > 50);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* TRIGGER ZONE: This stays at top 0 to catch the hover even when nav is hidden */}
      <div className="fixed top-0 left-0 w-full h-4 z-[1000]" />

      <nav 
        className={`navbar ${!visible ? 'navbar--hidden' : ''} ${scrolled ? 'navbar--scrolled' : ''}`}
      >
        <div className="nav-content">
          {/* Your Nav Links Here */}
          <span className="logo">IAN.LESTER</span>
        </div>
      </nav>
    </>
  );
}
