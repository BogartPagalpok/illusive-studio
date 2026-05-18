import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LiquidEtherProps {
  colors?: string[];
  mouseForce?: number;
  cursorSize?: number;
  resolution?: number;
  autoDemo?: boolean;
  autoSpeed?: number;
  className?: string;
  style?: React.CSSProperties;
}

const defaultColors = ['#5227FF', '#FF9FFC', '#B19EEF'];

// ── Shaders ─────────────────────────────────────────────
const faceVert = `
  attribute vec3 position;
  uniform vec2 px;
  uniform vec2 boundarySpace;
  varying vec2 uv;
  void main(){
    vec3 pos = position;
    vec2 scale = 1.0 - boundarySpace * 2.0;
    pos.xy = pos.xy * scale;
    uv = vec2(0.5)+(pos.xy)*0.5;
    gl_Position = vec4(pos, 1.0);
  }
`;

const lineVert = `
  attribute vec3 position;
  uniform vec2 px;
  varying vec2 uv;
  void main(){
    vec3 pos = position;
    uv = 0.5 + pos.xy * 0.5;
    vec2 n = sign(pos.xy);
    pos.xy = abs(pos.xy) - px * 1.0;
    pos.xy *= n;
    gl_Position = vec4(pos, 1.0);
  }
`;

const mouseVert = `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  uniform vec2 center;
  uniform vec2 scale;
  uniform vec2 px;
  varying vec2 vUv;
  void main(){
    vec2 pos = position.xy * scale * 2.0 * px + center;
    vUv = uv;
    gl_Position = vec4(pos, 0.0, 1.0);
  }
`;

const advectionFrag = `
  precision highp float;
  uniform sampler2D velocity;
  uniform float dt;
  uniform bool isBFECC;
  uniform vec2 fboSize;
  uniform vec2 px;
  varying vec2 uv;
  void main(){
    vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
    if(isBFECC == false){
      vec2 vel = texture2D(velocity, uv).xy;
      vec2 uv2 = uv - vel * dt * ratio;
      vec2 newVel = texture2D(velocity, uv2).xy;
      gl_FragColor = vec4(newVel, 0.0, 0.0);
    } else {
      vec2 spot_new = uv;
      vec2 vel_old = texture2D(velocity, uv).xy;
      vec2 spot_old = spot_new - vel_old * dt * ratio;
      vec2 vel_new1 = texture2D(velocity, spot_old).xy;
      vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
      vec2 error = spot_new2 - spot_new;
      vec2 spot_new3 = spot_new - error / 2.0;
      vec2 vel_2 = texture2D(velocity, spot_new3).xy;
      vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
      vec2 newVel2 = texture2D(velocity, spot_old2).xy;
      gl_FragColor = vec4(newVel2, 0.0, 0.0);
    }
  }
`;

const colorFrag = `
  precision highp float;
  uniform sampler2D velocity;
  uniform sampler2D palette;
  uniform vec4 bgColor;
  varying vec2 uv;
  void main(){
    vec2 vel = texture2D(velocity, uv).xy;
    float lenv = clamp(length(vel), 0.0, 1.0);
    vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb;
    vec3 outRGB = mix(bgColor.rgb, c, lenv);
    float outA = mix(bgColor.a, 1.0, lenv);
    gl_FragColor = vec4(outRGB, outA);
  }
`;

const divergenceFrag = `
  precision highp float;
  uniform sampler2D velocity;
  uniform float dt;
  uniform vec2 px;
  varying vec2 uv;
  void main(){
    float x0 = texture2D(velocity, uv-vec2(px.x, 0.0)).x;
    float x1 = texture2D(velocity, uv+vec2(px.x, 0.0)).x;
    float y0 = texture2D(velocity, uv-vec2(0.0, px.y)).y;
    float y1 = texture2D(velocity, uv+vec2(0.0, px.y)).y;
    float divergence = (x1 - x0 + y1 - y0) / 2.0;
    gl_FragColor = vec4(divergence / dt);
  }
`;

const externalForceFrag = `
  precision highp float;
  uniform vec2 force;
  uniform vec2 center;
  uniform vec2 scale;
  uniform vec2 px;
  varying vec2 vUv;
  void main(){
    vec2 circle = (vUv - 0.5) * 2.0;
    float d = 1.0 - min(length(circle), 1.0);
    d *= d;
    gl_FragColor = vec4(force * d, 0.0, 1.0);
  }
`;

const poissonFrag = `
  precision highp float;
  uniform sampler2D pressure;
  uniform sampler2D divergence;
  uniform vec2 px;
  varying vec2 uv;
  void main(){
    float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0.0)).r;
    float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0.0)).r;
    float p2 = texture2D(pressure, uv + vec2(0.0, px.y * 2.0)).r;
    float p3 = texture2D(pressure, uv - vec2(0.0, px.y * 2.0)).r;
    float div = texture2D(divergence, uv).r;
    float newP = (p0 + p1 + p2 + p3) / 4.0 - div;
    gl_FragColor = vec4(newP);
  }
`;

const pressureFrag = `
  precision highp float;
  uniform sampler2D pressure;
  uniform sampler2D velocity;
  uniform vec2 px;
  uniform float dt;
  varying vec2 uv;
  void main(){
    float p0 = texture2D(pressure, uv + vec2(px.x, 0.0)).r;
    float p1 = texture2D(pressure, uv - vec2(px.x, 0.0)).r;
    float p2 = texture2D(pressure, uv + vec2(0.0, px.y)).r;
    float p3 = texture2D(pressure, uv - vec2(0.0, px.y)).r;
    vec2 v = texture2D(velocity, uv).xy;
    vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5;
    v = v - gradP * dt;
    gl_FragColor = vec4(v, 0.0, 1.0);
  }
`;

const viscousFrag = `
  precision highp float;
  uniform sampler2D velocity;
  uniform sampler2D velocity_new;
  uniform float v;
  uniform vec2 px;
  uniform float dt;
  varying vec2 uv;
  void main(){
    vec2 old = texture2D(velocity, uv).xy;
    vec2 new0 = texture2D(velocity_new, uv + vec2(px.x * 2.0, 0.0)).xy;
    vec2 new1 = texture2D(velocity_new, uv - vec2(px.x * 2.0, 0.0)).xy;
    vec2 new2 = texture2D(velocity_new, uv + vec2(0.0, px.y * 2.0)).xy;
    vec2 new3 = texture2D(velocity_new, uv - vec2(0.0, px.y * 2.0)).xy;
    vec2 newv = 4.0 * old + v * dt * (new0 + new1 + new2 + new3);
    newv /= 4.0 * (1.0 + v * dt);
    gl_FragColor = vec4(newv, 0.0, 0.0);
  }
`;

// ── Simulation Classes ──────────────────────────────────

class FluidSimulation {
  fbos: Record<string, THREE.WebGLRenderTarget | null> = {};
  fboSize = new THREE.Vector2();
  cellScale = new THREE.Vector2();
  boundarySpace = new THREE.Vector2();
  options: any;
  renderer: THREE.WebGLRenderer | null = null;
  width = 0;
  height = 0;
  pixelRatio = 1;

  advectionPass: any;
  externalForcePass: any;
  divergencePass: any;
  poissonPass: any;
  pressurePass: any;
  viscousPass: any;
  outputPass: any;

  constructor(options: any) {
    this.options = {
      iterationsPoisson: 16,
      iterationsViscous: 16,
      mouseForce: 20,
      resolution: 0.25,
      cursorSize: 100,
      viscous: 30,
      isBounce: false,
      dt: 0.014,
      isViscous: false,
      BFECC: true,
      ...options,
    };
    this.fbos = {
      vel_0: null, vel_1: null, vel_viscous0: null, vel_viscous1: null,
      div: null, pressure_0: null, pressure_1: null,
    };
  }

  init(container: HTMLElement, paletteTex: THREE.DataTexture) {
    const rect = container.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width));
    this.height = Math.max(1, Math.floor(rect.height));
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.autoClear = false;
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.width, this.height);
    const el = this.renderer.domElement;
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.display = 'block';
    container.prepend(el);

    this.createFBOs();
    this.createPasses(paletteTex);
  }

  getFloatType(): THREE.TextureDataType {
    return /(iPad|iPhone|iPod)/i.test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType;
  }

  createFBOs() {
    const w = Math.max(1, Math.round(this.options.resolution * this.width));
    const h = Math.max(1, Math.round(this.options.resolution * this.height));
    const cw = Math.min(w, 512);
    const ch = Math.min(h, 512);
    this.cellScale.set(1 / cw, 1 / ch);
    this.fboSize.set(cw, ch);
    const type = this.getFloatType();
    const opts: THREE.RenderTargetOptions = {
      type, depthBuffer: false, stencilBuffer: false,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping,
    };
    for (const key in this.fbos) {
      this.fbos[key] = new THREE.WebGLRenderTarget(cw, ch, opts);
    }
  }

  createPasses(paletteTex: THREE.DataTexture) {
    const cs = this.cellScale;
    const bs = this.boundarySpace;

    const outScene = new THREE.Scene();
    const outCam = new THREE.Camera();
    const outMat = new THREE.RawShaderMaterial({
      vertexShader: faceVert,
      fragmentShader: colorFrag,
      transparent: true, depthWrite: false,
      uniforms: {
        velocity: { value: this.fbos.vel_0!.texture },
        boundarySpace: { value: new THREE.Vector2() },
        palette: { value: paletteTex },
        bgColor: { value: new THREE.Vector4(0, 0, 0, 0) },
      },
    });
    outScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), outMat));
    this.outputPass = { scene: outScene, camera: outCam, material: outMat };

    this.advectionPass = this.createPass(faceVert, advectionFrag, {
      boundarySpace: { value: cs }, px: { value: cs },
      fboSize: { value: this.fboSize }, velocity: { value: this.fbos.vel_0!.texture },
      dt: { value: this.options.dt }, isBFECC: { value: true },
    }, this.fbos.vel_1);

    const forceGeo = new THREE.PlaneGeometry(1, 1);
    const forceMat = new THREE.RawShaderMaterial({
      vertexShader: mouseVert, fragmentShader: externalForceFrag,
      blending: THREE.AdditiveBlending, depthWrite: false,
      uniforms: {
        px: { value: cs }, force: { value: new THREE.Vector2() },
        center: { value: new THREE.Vector2() },
        scale: { value: new THREE.Vector2(this.options.cursorSize, this.options.cursorSize) },
      },
    });
    const forceScene = new THREE.Scene();
    const forceCam = new THREE.Camera();
    forceScene.add(new THREE.Mesh(forceGeo, forceMat));
    this.externalForcePass = { scene: forceScene, camera: forceCam, material: forceMat, output: this.fbos.vel_1 };

    this.divergencePass = this.createPass(faceVert, divergenceFrag, {
      boundarySpace: { value: bs }, velocity: { value: this.fbos.vel_1!.texture },
      px: { value: cs }, dt: { value: this.options.dt },
    }, this.fbos.div);

    this.poissonPass = this.createPass(faceVert, poissonFrag, {
      boundarySpace: { value: bs }, pressure: { value: this.fbos.pressure_0!.texture },
      divergence: { value: this.fbos.div!.texture }, px: { value: cs },
    }, this.fbos.pressure_1, this.fbos.pressure_0);

    this.pressurePass = this.createPass(faceVert, pressureFrag, {
      boundarySpace: { value: bs }, pressure: { value: this.fbos.pressure_0!.texture },
      velocity: { value: this.fbos.vel_1!.texture }, px: { value: cs }, dt: { value: this.options.dt },
    }, this.fbos.vel_0);

    this.viscousPass = this.createPass(faceVert, viscousFrag, {
      boundarySpace: { value: bs }, velocity: { value: this.fbos.vel_1!.texture },
      velocity_new: { value: this.fbos.vel_viscous0!.texture }, v: { value: this.options.viscous },
      px: { value: cs }, dt: { value: this.options.dt },
    }, this.fbos.vel_viscous1, this.fbos.vel_viscous0);
  }

  createPass(vert: string, frag: string, uniforms: any, output: THREE.WebGLRenderTarget | null, altOutput?: THREE.WebGLRenderTarget | null) {
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const mat = new THREE.RawShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    return { scene, camera, material: mat, output, altOutput };
  }

  renderPass(pass: any, output: THREE.WebGLRenderTarget | null) {
    if (!this.renderer) return;
    this.renderer.setRenderTarget(output);
    this.renderer.render(pass.scene, pass.camera);
  }

  update(mouseCoords: THREE.Vector2, mouseDiff: THREE.Vector2) {
    if (!this.renderer) return;
    const cs = this.cellScale;
    const opts = this.options;

    const fm = this.externalForcePass.material.uniforms;
    fm.force.value.set(mouseDiff.x / 2 * opts.mouseForce, mouseDiff.y / 2 * opts.mouseForce);
    const cx = Math.min(Math.max(mouseCoords.x, -1 + opts.cursorSize * cs.x + cs.x * 2), 1 - opts.cursorSize * cs.x - cs.x * 2);
    const cy = Math.min(Math.max(mouseCoords.y, -1 + opts.cursorSize * cs.y + cs.y * 2), 1 - opts.cursorSize * cs.y - cs.y * 2);
    fm.center.value.set(cx, cy);
    fm.scale.value.set(opts.cursorSize, opts.cursorSize);

    this.renderPass(this.advectionPass, this.fbos.vel_1);
    this.renderPass(this.externalForcePass, this.fbos.vel_1);

    let velSource = this.fbos.vel_1;
    if (opts.isViscous) {
      for (let i = 0; i < opts.iterationsViscous; i++) {
        const inp = i % 2 === 0 ? this.fbos.vel_1 : this.fbos.vel_viscous1;
        const out = i % 2 === 0 ? this.fbos.vel_viscous1 : this.fbos.vel_1;
        this.viscousPass.material.uniforms.velocity_new.value = inp!.texture;
        this.renderPass(this.viscousPass, out);
      }
      velSource = this.fbos.vel_viscous1;
    }

    this.divergencePass.material.uniforms.velocity.value = velSource!.texture;
    this.renderPass(this.divergencePass, this.fbos.div);

    for (let i = 0; i < opts.iterationsPoisson; i++) {
      const inp = i % 2 === 0 ? this.fbos.pressure_0 : this.fbos.pressure_1;
      const out = i % 2 === 0 ? this.fbos.pressure_1 : this.fbos.pressure_0;
      this.poissonPass.material.uniforms.pressure.value = inp!.texture;
      this.renderPass(this.poissonPass, out);
    }

    this.pressurePass.material.uniforms.velocity.value = velSource!.texture;
    this.pressurePass.material.uniforms.pressure.value = this.fbos.pressure_0!.texture;
    this.renderPass(this.pressurePass, this.fbos.vel_0);

    this.renderPass(this.outputPass, null);
  }

  resize(container: HTMLElement) {
    const rect = container.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width));
    this.height = Math.max(1, Math.floor(rect.height));
    this.renderer?.setSize(this.width, this.height, false);
    this.createFBOs();
  }

  dispose() {
    this.renderer?.dispose();
  }
}

// ── Auto Demo Driver ────────────────────────────────────
class AutoDriver {
  mouse: any;
  enabled: boolean;
  speed: number;
  resumeDelay: number;
  active = false;
  current = new THREE.Vector2();
  target = new THREE.Vector2();
  lastTime = performance.now();
  private tmp = new THREE.Vector2();

  constructor(mouse: any, enabled: boolean, speed: number, resumeDelay: number) {
    this.mouse = mouse;
    this.enabled = enabled;
    this.speed = speed;
    this.resumeDelay = resumeDelay;
    this.pickTarget();
  }

  pickTarget() {
    this.target.set((Math.random() * 2 - 1) * 0.8, (Math.random() * 2 - 1) * 0.8);
  }

  update(lastInteraction: number) {
    if (!this.enabled) return;
    const idle = performance.now() - lastInteraction;
    if (idle < this.resumeDelay) { this.active = false; return; }
    if (!this.active) { this.active = true; this.current.copy(this.mouse.coords); }

    const dt = Math.min((performance.now() - this.lastTime) / 1000, 0.05);
    this.lastTime = performance.now();
    this.tmp.subVectors(this.target, this.current);
    const dist = this.tmp.length();
    if (dist < 0.02) { this.pickTarget(); return; }
    this.tmp.normalize();
    this.current.addScaledVector(this.tmp, this.speed * dt);
    this.mouse.setCoords(this.current.x, this.current.y);
  }
}

// ── Mouse Tracker ───────────────────────────────────────
class MouseTracker {
  coords = new THREE.Vector2();
  coordsOld = new THREE.Vector2();
  diff = new THREE.Vector2();
  lastInteraction = performance.now();

  update(clientX: number, clientY: number, rect: DOMRect) {
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.coordsOld.copy(this.coords);
    this.coords.set(x, y);
    this.diff.subVectors(this.coords, this.coordsOld);
    this.lastInteraction = performance.now();
  }

  setCoords(x: number, y: number) {
    this.coordsOld.copy(this.coords);
    this.coords.set(x, y);
    this.diff.subVectors(this.coords, this.coordsOld);
  }
}

// ── Main Component ──────────────────────────────────────
export default function LiquidEtherBackground({
  colors = defaultColors,
  mouseForce = 20,
  cursorSize = 100,
  resolution = 0.25,
  autoDemo = true,
  autoSpeed = 0.5,
  className = '',
  style,
}: LiquidEtherProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sim = new FluidSimulation({ colors, mouseForce, cursorSize, resolution });
    const mouse = new MouseTracker();
    const driver = new AutoDriver(mouse, autoDemo, autoSpeed, 1000);

    const arr = colors.length > 1 ? colors : [colors[0], colors[0]];
    const data = new Uint8Array(arr.length * 4);
    arr.forEach((c, i) => {
      const col = new THREE.Color(c);
      data[i * 4] = Math.round(col.r * 255);
      data[i * 4 + 1] = Math.round(col.g * 255);
      data[i * 4 + 2] = Math.round(col.b * 255);
      data[i * 4 + 3] = 255;
    });
    const paletteTex = new THREE.DataTexture(data, arr.length, 1, THREE.RGBAFormat);
    paletteTex.magFilter = THREE.LinearFilter;
    paletteTex.minFilter = THREE.LinearFilter;
    paletteTex.wrapS = THREE.ClampToEdgeWrapping;
    paletteTex.wrapT = THREE.ClampToEdgeWrapping;
    paletteTex.generateMipmaps = false;
    paletteTex.needsUpdate = true;

    sim.init(container, paletteTex);

    // Mouse + Touch events — passive so site scrolls normally
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.update(e.clientX, e.clientY, rect);
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const rect = container.getBoundingClientRect();
        mouse.update(e.touches[0].clientX, e.touches[0].clientY, rect);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const rect = container.getBoundingClientRect();
        mouse.update(e.touches[0].clientX, e.touches[0].clientY, rect);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    let raf: number;
    const animate = () => {
      driver.update(mouse.lastInteraction);
      sim.update(mouse.coords, mouse.diff);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => sim.resize(container);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);
      sim.dispose();
    };
  }, [colors, mouseForce, cursorSize, resolution, autoDemo, autoSpeed]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0, ...style }}
    />
  );
}
