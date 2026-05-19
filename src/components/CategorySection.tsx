function FlipCard({ project }: { project: Project }) {
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleCardClick = () => {
    if (isMobile) {
      setFlipped(prev => !prev);
    } else {
      setSelected(true);
    }
  };

  return (
    <>
      <div
        className="flip-card cursor-pointer w-full"
        style={{ perspective: '1000px' }}
        onClick={handleCardClick}
        onMouseEnter={() => { if (!isMobile) setFlipped(true); }}
        onMouseLeave={() => { if (!isMobile) setFlipped(false); }}
      >
        <div
          className="flip-card-inner relative w-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.8s',
          }}
        >
          {/* Front — Image (sets the height naturally) */}
          <div
            className="flip-card-front relative w-full rounded-xl overflow-hidden border"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderColor: 'var(--glass-border)',
            }}
          >
            <img
              src={project.hero_bg_desktop || project.image_url}
              alt={project.title}
              className="w-full h-auto block"
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-xs font-bold uppercase tracking-wider">{project.title}</p>
              {isMobile && <p className="text-white/50 text-[8px] mt-0.5">Tap to flip</p>}
            </div>
          </div>

          {/* Back — Details (overlays on top of front when flipped) */}
          <div
            className="flip-card-back absolute inset-0 w-full h-full rounded-xl overflow-hidden border flex flex-col justify-center items-center p-4"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: 'var(--glass-bg)',
              borderColor: 'var(--glass-border)',
            }}
          >
            <h3 className="font-black uppercase text-center" style={{ fontSize: '1.2em', color: 'var(--text-primary)' }}>{project.title}</h3>
            {project.description && (
              <p className="text-xs mt-2 leading-relaxed text-center" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
            )}
            {project.tools && (
              <div className="flex flex-wrap gap-1 mt-3 justify-center">
                {project.tools.slice(0, 3).map(t => (
                  <span key={t} className="px-2 py-0.5 text-[8px] uppercase tracking-wider rounded border" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>{t}</span>
                ))}
              </div>
            )}
            {isMobile && <p className="text-accent text-[8px] mt-3 font-bold">Tap to view full</p>}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
            onClick={() => setSelected(false)}
          >
            <button onClick={() => setSelected(false)} className="absolute top-4 right-4 p-2.5 rounded-full border transition-all z-[10000]" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}>
              <X size={18} />
            </button>
            <img src={project.hero_bg_desktop || project.image_url} alt={project.title} className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
