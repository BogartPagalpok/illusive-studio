useEffect(() => {
  const container = containerRef.current;
  const canvas = canvasRef.current;
  if (!container) return;

  const frameObj = { frame: 0 };

  const ctx = gsap.context(() => {
    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: `+=${scrollLength * 100}%`,
      scrub: 0.5,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        // Map scroll progress to frame index
        const target = Math.round(self.progress * (frameCount - 1));
        frameObj.frame = target;
        if (!drawFrame(target)) {
          drawFrame(lastDrawnFrameRef.current);
        }
        // Fade out in last 15%
        if (canvas) {
          const fadeStart = 0.85;
          if (self.progress > fadeStart) {
            canvas.style.opacity = `${1 - (self.progress - fadeStart) / (1 - fadeStart)}`;
          } else {
            canvas.style.opacity = '1';
          }
        }
      },
      onLeave: () => {
        // Fully hidden when section leaves
        if (canvas) canvas.style.opacity = '0';
      },
      onEnterBack: () => {
        // Fully visible when scrolling back into section
        if (canvas) canvas.style.opacity = '1';
      },
    });

    return () => st.kill();
  });

  return () => ctx.revert();
}, [frameCount, drawFrame, scrollLength]);
