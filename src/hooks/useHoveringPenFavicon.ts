import { useEffect } from 'react';

export function useHoveringPenFavicon() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.rel = 'icon';

    let animationId: number;
    let lastRenderTime = 0;
    const FRAME_INTERVAL = 66; // ~15 FPS is optimal for 16x16/32x32 favicons without CPU churn

    const animate = (timestamp: number) => {
      if (document.hidden) {
        return;
      }

      if (timestamp - lastRenderTime >= FRAME_INTERVAL) {
        lastRenderTime = timestamp;

        if (ctx) {
          const rootStyle = getComputedStyle(document.documentElement);
          const accent = rootStyle.getPropertyValue('--accent').trim() || '#00ffcc';
          const nodeColor = '#a855f7'; 

          ctx.clearRect(0, 0, 64, 64);

          // 1. Draw Bezier Curve
          ctx.beginPath();
          ctx.moveTo(12, 44);
          ctx.bezierCurveTo(12, 20, 52, 20, 52, 44);
          ctx.strokeStyle = nodeColor;
          ctx.lineWidth = 3;
          ctx.stroke();

          // Square Nodes
          ctx.fillStyle = nodeColor;
          ctx.fillRect(8, 40, 8, 8); 
          ctx.fillRect(48, 40, 8, 8);
          ctx.fillRect(28, 16, 8, 8);

          // 2. Hover Offset
          const time = Date.now() / 250; 
          const yOffset = Math.sin(time) * 4; 

          // 3. Draw Pen Tool
          ctx.save();
          ctx.translate(0, yOffset);

          ctx.beginPath();
          ctx.moveTo(32, 24); 
          ctx.lineTo(44, 46); 
          ctx.lineTo(38, 46); 
          ctx.lineTo(38, 56); 
          ctx.lineTo(26, 56); 
          ctx.lineTo(26, 46); 
          ctx.lineTo(20, 46); 
          ctx.closePath();

          ctx.strokeStyle = accent;
          ctx.lineWidth = 4;
          ctx.lineJoin = 'round';
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(32, 24);
          ctx.lineTo(32, 46);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(26, 51);
          ctx.lineTo(38, 51);
          ctx.stroke();

          ctx.restore();

          link.href = canvas.toDataURL('image/png');
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        lastRenderTime = 0;
        cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(animate);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationId);
    };
  }, []);
}
