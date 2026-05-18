import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LiquidEtherProps {
  colors?: string[];
  className?: string;
  style?: React.CSSProperties;
}

const defaultColors = ['#5227FF', '#FF9FFC', '#B19EEF'];

export default function LiquidEtherBackground({
  colors = defaultColors,
  className = '',
  style,
}: LiquidEtherProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
    };
    resize();
    window.addEventListener('resize', resize);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';

    // Shaders
    const vert = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const frag = `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      varying vec2 vUv;

      float wave(vec2 p, float t, float s) {
        return sin(p.x * 3.0 + t * s) * cos(p.y * 2.5 - t * 0.7 * s) * 0.5 + 0.5;
      }

      void main() {
        float t = uTime * 0.3;
        float w1 = wave(vUv, t, 1.0);
        float w2 = wave(vUv + 0.3, t + 1.0, 0.7);
        float w3 = wave(vUv - 0.2, t + 2.0, 1.3);
        float d = (w1 * 0.5 + w2 * 0.3 + w3 * 0.2);
        
        vec3 col = mix(uColor1, uColor2, d);
        col = mix(col, uColor3, w2 * 0.4);
        
        float alpha = 0.06 + d * 0.04;
        gl_FragColor = vec4(col, alpha);
      }
    `;

    const c1 = new THREE.Color(colors[0] || '#5227FF');
    const c2 = new THREE.Color(colors[1] || '#FF9FFC');
    const c3 = new THREE.Color(colors[2] || '#B19EEF');

    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: c1 },
        uColor2: { value: c2 },
        uColor3: { value: c3 },
      },
      transparent: true,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    // Render loop
    let raf: number;
    const clock = new THREE.Clock();
    const animate = () => {
      material.uniforms.uTime.value += clock.getDelta();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [colors]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0, ...style }}
    />
  );
}
