/* Eiger north face, rendered from real swisstopo elevation data.
 *
 * Terrain: swissALTI3D (2024/2025 surveys, 2 m grid), 100 tiles covering
 * LV95 2638–2648 E / 1153–1163 N, mosaicked and resampled to 768 x 768
 * (~13 m per sample). Heights are packed as 16-bit into R (high) and G (low)
 * of /hero/eiger-height.png, spanning H_LO..H_HI metres.
 * Source: © swisstopo, free geodata (OGD), https://www.swisstopo.admin.ch
 *
 * Everything visual on top of that shape is stylised and made up here:
 * snow line, ledge snow, strata, banded light, contours, haze, sky.
 */
import {
  BackSide, BufferAttribute, BufferGeometry, Color, DataTexture, LinearFilter,
  LinearMipmapLinearFilter, MathUtils, Mesh, PerspectiveCamera, RGBAFormat, Scene,
  ShaderMaterial, SphereGeometry, Vector3, WebGLRenderer,
} from 'three';

const H_LO = 955.8423461914062;
const H_HI = 4154.40771484375;
const SIZE_M = 10000;
const U = 10;                       // 1 world unit = 10 m
const WORLD = SIZE_M / U;
const EIGER = { col: 0.54367, row: 0.43631 }; // summit, LV95 2643437 / 1158637

export interface EigerOptions {
  canvas: HTMLCanvasElement;
  host: HTMLElement;                // element observed for visibility and sizing
  heightUrl: string;
  autoplay: boolean;
}
export interface EigerHandle {
  setPlaying(on: boolean): void;
  readonly playing: boolean;
  dispose(): void;
}

async function loadHeights(url: string) {
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  await img.decode();
  const N = img.width;
  const cv = document.createElement('canvas');
  cv.width = cv.height = N;
  const cx = cv.getContext('2d', { willReadFrequently: true })!;
  cx.drawImage(img, 0, 0);
  const px = cx.getImageData(0, 0, N, N).data;
  const H = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) H[i] = H_LO + (((px[i * 4] << 8) | px[i * 4 + 1]) / 65535) * (H_HI - H_LO);
  // sink the outer 3% so the tile edge never reads as a cliff
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const e = Math.min(r, c, N - 1 - r, N - 1 - c) / (N * 0.03);
    if (e < 1) { const t = e * e * (3 - 2 * e); H[r * N + c] = H_LO - 200 + (H[r * N + c] - H_LO + 200) * t; }
  }
  return { H, N };
}

export async function createEiger(opts: EigerOptions): Promise<EigerHandle> {
  const { canvas, host } = opts;
  const { H, N } = await loadHeights(opts.heightUrl);

  const hAt = (col: number, row: number) => {
    col = Math.min(Math.max(col, 0), N - 1.001); row = Math.min(Math.max(row, 0), N - 1.001);
    const c0 = col | 0, r0 = row | 0, fc = col - c0, fr = row - r0;
    const a = H[r0 * N + c0], b = H[r0 * N + c0 + 1], d = H[(r0 + 1) * N + c0], e = H[(r0 + 1) * N + c0 + 1];
    return (a * (1 - fc) + b * fc) * (1 - fr) + (d * (1 - fc) + e * fc) * fr;
  };
  const groundY = (x: number, z: number) => hAt((x / WORLD + 0.5) * (N - 1), (z / WORLD + 0.5) * (N - 1)) / U;

  // normal (RGB) + coarse height (A) texture for shading and self-shadow
  const cell = SIZE_M / (N - 1);
  const tex = new Uint8Array(N * N * 4);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const l = H[r * N + Math.max(c - 1, 0)], rr = H[r * N + Math.min(c + 1, N - 1)];
    const u = H[Math.max(r - 1, 0) * N + c], d = H[Math.min(r + 1, N - 1) * N + c];
    let nx = -(rr - l) / (2 * cell), nz = -(d - u) / (2 * cell), ny = 1;
    const len = Math.hypot(nx, ny, nz); nx /= len; ny /= len; nz /= len;
    const i = (r * N + c) * 4;
    tex[i] = (nx * 0.5 + 0.5) * 255; tex[i + 1] = (ny * 0.5 + 0.5) * 255; tex[i + 2] = (nz * 0.5 + 0.5) * 255;
    tex[i + 3] = Math.max(0, Math.min(255, ((H[r * N + c] - H_LO) / (H_HI - H_LO)) * 255));
  }
  const nTex = new DataTexture(tex, N, N, RGBAFormat);
  nTex.magFilter = LinearFilter; nTex.minFilter = LinearMipmapLinearFilter;
  nTex.generateMipmaps = true; nTex.anisotropy = 4; nTex.needsUpdate = true;

  const S = 384;
  const pos = new Float32Array((S + 1) * (S + 1) * 3), uv = new Float32Array((S + 1) * (S + 1) * 2);
  for (let j = 0, k = 0; j <= S; j++) for (let i = 0; i <= S; i++, k++) {
    const fu = i / S, fv = j / S;
    pos[k * 3] = (fu - 0.5) * WORLD; pos[k * 3 + 2] = (fv - 0.5) * WORLD;
    pos[k * 3 + 1] = hAt(fu * (N - 1), fv * (N - 1)) / U;
    uv[k * 2] = fu; uv[k * 2 + 1] = fv;
  }
  const idx = new Uint32Array(S * S * 6);
  for (let j = 0, k = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const a = j * (S + 1) + i, b = a + 1, c = a + S + 1, d = c + 1;
    idx.set([a, c, b, b, c, d], k); k += 6;
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(pos, 3));
  geo.setAttribute('uv', new BufferAttribute(uv, 2));
  geo.setIndex(new BufferAttribute(idx, 1));
  geo.computeBoundingSphere();

  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 5, 4000);

  const SUN = new Vector3(0.62, 0.52, -0.58).normalize(); // from the north-east, lights the north face
  const uniforms = {
    uTex: { value: nTex }, uSun: { value: SUN }, uCam: { value: camera.position },
    uLo: { value: H_LO }, uHi: { value: H_HI }, uWorld: { value: WORLD }, uU: { value: U },
    uHorizon: { value: new Color('#dde4e1') }, uZenith: { value: new Color('#3f6a86') },
    uSnow: { value: new Color('#f4f5f1') }, uSnowShade: { value: new Color('#8196a6') },
    uRock: { value: new Color('#8a8578') }, uRockShade: { value: new Color('#262c2b') },
    uMeadow: { value: new Color('#7d8a64') }, uMeadowShade: { value: new Color('#34402f') },
    uTime: { value: 0 },
  };

  const terrainMat = new ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      varying vec2 vUv; varying vec3 vPos;
      void main(){ vUv = uv; vPos = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uTex; uniform vec3 uSun, uCam, uHorizon, uZenith;
      uniform vec3 uSnow,uSnowShade,uRock,uRockShade,uMeadow,uMeadowShade;
      uniform float uLo,uHi,uWorld,uU,uTime;
      varying vec2 vUv; varying vec3 vPos;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+1.),f.x), f.y); }
      float fbm(vec2 p){ float a=.5,s=0.; for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.03; a*=.5; } return s; }
      float terrainY(vec2 uv){ return (uLo + texture2D(uTex,uv).a*(uHi-uLo))/uU; }
      void main(){
        vec4 t = texture2D(uTex, vUv);
        vec3 n = normalize(t.rgb*2.-1.);
        float hM = vPos.y*uU;
        float slope = 1. - n.y;

        // self-shadow: march the heightmap toward the sun
        float sh = 1.;
        vec2 dir = normalize(uSun.xz) / uWorld; float rise = uSun.y / length(uSun.xz);
        for(int i=1;i<=22;i++){
          float d = 2. + float(i*i)*.55;
          vec2 p = vUv + dir*d;
          if(p.x<0.||p.x>1.||p.y<0.||p.y>1.) break;
          sh = min(sh, clamp((vPos.y + 1.5 + d*rise - terrainY(p))*.35, 0., 1.));
        }

        float lam = max(dot(n,uSun),0.);
        float band = floor(lam*3.+.5)/3.;
        float light = mix(lam, band, .55) * mix(.25, 1., sh);

        float nz = fbm(vPos.xz*.08); float nf = fbm(vPos.xz*.9 + vec2(0., hM*.02));
        float snowLine = 2250. + nz*450.;
        float snow = smoothstep(snowLine-120., snowLine+120., hM) * (1.-smoothstep(.40, .58, slope + nz*.18));
        float ledge = smoothstep(.55,.75,nf) * smoothstep(.62,.35, abs(fract(hM*.012+nz)-.5)*2.)
                    * smoothstep(1900.,2300.,hM) * (1.-smoothstep(.8,.95,slope));
        snow = max(snow, ledge*.85);
        snow = max(snow, smoothstep(3500., 3900., hM) * (1.-smoothstep(.7,.85,slope)));
        float meadow = (1.-smoothstep(1700.+nz*300., 2100.+nz*300., hM)) * (1.-smoothstep(.25,.45,slope));
        vec3 lit = mix(uRock, uMeadow, meadow); vec3 dark = mix(uRockShade, uMeadowShade, meadow);
        lit = mix(lit, uSnow, snow); dark = mix(dark, uSnowShade, snow);
        float strata = smoothstep(.35,.9,slope) * (1.-snow) * (.5+.5*sin(hM*.09 + nz*6.));
        lit *= 1. - strata*.12;
        vec3 col = mix(dark, lit, light);
        col += uZenith * .10 * n.y;

        float cl = abs(fract(hM/100.+.5)-.5) / fwidth(hM/100.);
        col = mix(col, col*.78, (1.-smoothstep(0.,1.,cl)) * .35);

        float dist = length(vPos - uCam);
        float fog = 1. - exp(-pow(dist*.0009, 1.7));
        float haze = (1.-smoothstep(1000., 1700., hM)) * .3 * (.8+.2*sin(uTime*.1 + vPos.x*.01));
        col = mix(col, uHorizon, clamp(fog + haze*(1.-fog), 0., 1.));
        gl_FragColor = vec4(col,1.);
        #include <colorspace_fragment>
      }`,
  });
  scene.add(new Mesh(geo, terrainMat));

  const skyGeo = new SphereGeometry(3000, 32, 16);
  const skyMat = new ShaderMaterial({
    side: BackSide, depthWrite: false, uniforms,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position+cameraPosition,1.); }`,
    fragmentShader: `uniform vec3 uHorizon,uZenith,uSun; varying vec3 vD;
      void main(){ vec3 c = mix(uHorizon, uZenith, smoothstep(-.03, .55, vD.y));
        c += vec3(1.,.97,.9)*pow(max(dot(vD,uSun),0.),24.)*.25; gl_FragColor = vec4(c,1.);
        #include <colorspace_fragment>
      }`,
  });
  scene.add(new Mesh(skyGeo, skyMat));

  /* camera rig: slow orbit on the north side, drag to rotate */
  const target = new Vector3((EIGER.col - 0.5) * WORLD, 0, (EIGER.row - 0.5) * WORLD);
  target.y = groundY(target.x, target.z) - 45;
  const rig = { yaw: -0.35, pitch: 0.05, radius: 380, yawVel: 0, pitchOff: 0, lastInput: -1e9 };
  const AUTO_SPEED = 0.018;
  let playing = opts.autoplay, dragging = false, px0 = 0, py0 = 0, isTouch = false, elapsed = 0;

  const onDown = (e: PointerEvent) => {
    // leave buttons and links alone, pointer capture would swallow their click
    if ((e.target as Element | null)?.closest('button, a, input, select, textarea')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true; isTouch = e.pointerType === 'touch'; px0 = e.clientX; py0 = e.clientY;
    try { host.setPointerCapture(e.pointerId); } catch { /* synthetic events */ }
    host.classList.add('is-dragging'); kick();
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - px0, dy = e.clientY - py0; px0 = e.clientX; py0 = e.clientY;
    rig.yawVel = -dx * 0.0035; rig.yaw += rig.yawVel;
    if (!isTouch) rig.pitchOff = MathUtils.clamp(rig.pitchOff + dy * 0.002, -0.12, 0.35);
    rig.lastInput = performance.now();
  };
  const onUp = () => { dragging = false; host.classList.remove('is-dragging'); };
  host.addEventListener('pointerdown', onDown);
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerup', onUp);
  host.addEventListener('pointercancel', onUp);

  const want = new Vector3(), look = new Vector3();
  function place(dt: number) {
    const idle = (performance.now() - rig.lastInput) / 1000;
    if (!dragging) {
      rig.yaw += rig.yawVel; rig.yawVel *= Math.pow(0.04, dt);
      const resume = MathUtils.smoothstep(idle, 1.5, 4);
      if (playing) { rig.yaw += AUTO_SPEED * dt * resume; elapsed += dt * resume; }
      rig.pitchOff *= Math.pow(1 - 0.5 * resume, dt);
    }
    const sway = Math.sin(elapsed * 0.21), sway2 = Math.sin(elapsed * 0.13 + 1.3);
    const pitch = rig.pitch + rig.pitchOff + sway * 0.025;
    const r = rig.radius + sway2 * 25;
    want.set(Math.sin(rig.yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(rig.yaw) * Math.cos(pitch))
      .multiplyScalar(r).add(target);
    want.y = Math.max(want.y, groundY(want.x, want.z) + 25);
    look.copy(target); look.y += sway2 * 4;
  }

  let visible = true, raf = 0, t0 = performance.now();
  function frame(now: number) {
    raf = 0;
    const dt = Math.min((now - t0) / 1000, 0.1); t0 = now;
    uniforms.uTime.value += dt;
    place(dt);
    camera.position.lerp(want, 1 - Math.pow(0.001, dt));
    camera.lookAt(look);
    renderer.render(scene, camera);
    const moving = playing || dragging || Math.abs(rig.yawVel) > 1e-4 || camera.position.distanceToSquared(want) > 0.01;
    if (visible && !document.hidden && moving) raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (!raf && visible && !document.hidden) { t0 = performance.now(); raf = requestAnimationFrame(frame); }
  }
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); });
  io.observe(host);
  const onVis = () => kick();
  document.addEventListener('visibilitychange', onVis);

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 46 : 32;   // wider lens on portrait phones
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    kick();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  place(0); camera.position.copy(want); camera.lookAt(look);
  resize();
  renderer.render(scene, camera);
  kick();

  return {
    get playing() { return playing; },
    setPlaying(on: boolean) { playing = on; kick(); },
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerup', onUp);
      host.removeEventListener('pointercancel', onUp);
      geo.dispose(); skyGeo.dispose(); terrainMat.dispose(); skyMat.dispose(); nTex.dispose();
      renderer.dispose();
    },
  };
}
