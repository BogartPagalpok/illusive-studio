onUpdate: (self) => {
  const target = Math.round(self.progress * (frameCount - 1));
  frameObj.frame = target;
  if (!drawFrame(target)) {
    drawFrame(lastDrawnFrameRef.current);
  }
  if (canvas) {
    const fadeStart = 0.85;
    if (self.progress > fadeStart) {
      const fadeProgress = (self.progress - fadeStart) / (1 - fadeStart);
      canvas.style.opacity = `${1 - fadeProgress}`;
      // Also fade the accent overlay
      const overlay = container.querySelector('[class*="mix-blend-color"]') as HTMLElement;
      if (overlay) overlay.style.opacity = `${0.35 * (1 - fadeProgress)}`;
      // Also fade the bottom gradient
      const gradient = container.querySelector('[class*="h-48"]') as HTMLElement;
      if (gradient) gradient.style.opacity = `${1 - fadeProgress}`;
    } else {
      canvas.style.opacity = '1';
    }
  }
},
