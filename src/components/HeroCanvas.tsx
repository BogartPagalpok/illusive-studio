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
      end: '+=1500',
      scrub: 0.3,
      pin: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const targetFrame = Math.round(playhead.frame);
        if (targetFrame >= lastDrawnFrameRef.current) {
          if (!drawFrame(targetFrame)) drawFrame(lastDrawnFrameRef.current);
        }
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
