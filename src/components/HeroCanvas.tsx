useEffect(() => {
  if (!ready) return;

  const playhead = { frame: 0 };
  const canvas = canvasRef.current;
  let st: ScrollTrigger | null = null;

  const scrollAnimation = gsap.to(playhead, {
    frame: totalFrames - 1,
    snap: 'frame',
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '+=3000',
      scrub: true,
      pin: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const targetFrame = Math.round(playhead.frame);
        // Only go forward, never reverse
        if (targetFrame >= lastDrawnFrameRef.current) {
          if (!drawFrame(targetFrame)) drawFrame(lastDrawnFrameRef.current);
        }
        // Fade out near the end
        if (canvas && self.progress > 0.85) {
          canvas.style.opacity = `${1 - (self.progress - 0.85) / 0.15}`;
        } else if (canvas) {
          canvas.style.opacity = '1';
        }
      },
    },
  });

  st = scrollAnimation.scrollTrigger;

  return () => {
    scrollAnimation.kill();
  };
}, [ready, drawFrame]);
