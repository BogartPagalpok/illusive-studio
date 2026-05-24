import { useEffect, useRef } from 'react';

interface ScrollingMasonryProps {
  projects: Array<{
    id: string;
    title: string;
    image_url: string;
    description?: string;
  }>;
  height?: number; // default 600px
  speed?: number;  // seconds per full cycle, default 100
}

export default function ScrollingMasonry({
  projects,
  height = 600,
  speed = 100,
}: ScrollingMasonryProps) {
  // Filter only projects that have an image
  const images = projects.filter((p) => p.image_url).map((p) => ({
    id: p.id,
    title: p.title,
    url: p.image_url,
    description: p.description || '',
  }));

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-white/30">
        No images to display
      </div>
    );
  }

  // Split images into 3 columns (column index based on modulo)
  const columns: Array<typeof images> = [[], [], []];
  images.forEach((img, idx) => {
    columns[idx % 3].push(img);
  });

  return (
    <div className="w-full" style={{ height: `${height}px`, overflow: 'hidden' }}>
      <style>{`
        @keyframes scrollVertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .scroll-column {
          height: 100%;
          overflow: hidden;
          position: relative;
          mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
          min-width: 0;
        }
        .scroll-track {
          display: flex;
          flex-direction: column;
          animation: scrollVertical linear infinite;
          line-height: 0;
        }
        .scroll-track > * {
          margin-bottom: 20px;
        }
        .overlay-bg {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
        }
      `}</style>

      <div className="grid grid-cols-3 gap-5 h-full">
        {/* Column 1 – scroll down (normal) */}
        <div className="scroll-column">
          <div
            className="scroll-track"
            style={{ animationDuration: `${speed}s`, animationDirection: 'normal' }}
          >
            {[...columns[0], ...columns[0]].map((img, idx) => (
              <ImageCard key={`${img.id}-${idx}`} image={img} />
            ))}
          </div>
        </div>

        {/* Column 2 – scroll up (reverse) */}
        <div className="scroll-column">
          <div
            className="scroll-track"
            style={{ animationDuration: `${speed}s`, animationDirection: 'reverse' }}
          >
            {[...columns[1], ...columns[1]].map((img, idx) => (
              <ImageCard key={`${img.id}-${idx}`} image={img} />
            ))}
          </div>
        </div>

        {/* Column 3 – scroll down (normal), slightly different speed */}
        <div className="scroll-column">
          <div
            className="scroll-track"
            style={{ animationDuration: `${speed * 1.2}s`, animationDirection: 'normal' }}
          >
            {[...columns[2], ...columns[2]].map((img, idx) => (
              <ImageCard key={`${img.id}-${idx}`} image={img} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageCard({
  image,
}: {
  image: { id: string; title: string; url: string; description: string };
}) {
  return (
    <div className="group relative overflow-hidden cursor-pointer bg-[#1a1a1a]">
      <img
        src={image.url}
        alt={image.title}
        className="w-full h-auto block transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 overlay-bg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="opacity-0 group-hover:opacity-100 translate-y-5 group-hover:translate-y-0 transition-all duration-300">
          <h3 className="text-base font-bold text-white mb-1">{image.title}</h3>
          {image.description && (
            <p className="text-xs text-white/80">{image.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
