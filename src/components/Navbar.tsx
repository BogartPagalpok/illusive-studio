const [navState, setNavState] = useState({ scrolled: false, visible: true });

const handleScroll = () => {
  const current = window.scrollY;
  const newScrolled = current > 50;
  const newVisible = !(current > lastScrollY.current && current > 150);
  
  setNavState(prev => 
    (prev.scrolled === newScrolled && prev.visible === newVisible) 
      ? prev 
      : { scrolled: newScrolled, visible: newVisible }
  );
  lastScrollY.current = current;
};
