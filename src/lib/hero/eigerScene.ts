/* Eiger Trail hero: a drone follows a runner along the real Eiger Trail.
 *
 * Real data (all © swisstopo, free geodata / OGD):
 *  - Terrain: swissALTI3D 2 m tiles (2024/2025), LV95 2638–2648 E / 1153–1163 N.
 *    base-height.webp   whole 10 km square at 512 x 512 (~20 m)
 *    detail-height.webp north face + trail, 2640.5–2645.0 E / 1157.8–1161.8 N at 4 m
 *    Heights are 16-bit, packed into R (high byte) and G (low byte).
 *  - Route: the "Eigertrail" path from swissTLM3D, Eigergletscher (2,333 m) to
 *    Alpiglen (1,630 m), 5.9 km, resampled every 2 m (trail.json, metres from
 *    the summit, east and north).
 *  - Lighting: sun shadows and ambient occlusion are baked offline from the same
 *    elevation data for a fixed late-afternoon sun (azimuth 290°, elevation 22°).
 *
 * Invented here: every colour and material (snow, rock, scree, meadow, trail
 * surface), the boulders, the runner figure and its animation, sky and haze.
 */
import {
  BackSide, BufferAttribute, BufferGeometry, CapsuleGeometry, Color, DataTexture,
  DirectionalLight, Group, HemisphereLight, IcosahedronGeometry, InstancedMesh,
  LinearFilter, LinearMipmapLinearFilter, MathUtils, Matrix4, Mesh, MeshLambertMaterial,
  PerspectiveCamera, Quaternion, RedFormat, RGBAFormat, Scene, ShaderMaterial,
  SphereGeometry, BoxGeometry, Vector3, Vector4, WebGLRenderer,
} from 'three';

const ORIGIN = [2643437, 1158637];                // Eiger summit, LV95
const SUN_AZ = MathUtils.degToRad(290), SUN_EL = MathUtils.degToRad(22);
const SUN = new Vector3(Math.sin(SUN_AZ) * Math.cos(SUN_EL), Math.sin(SUN_EL), -Math.cos(SUN_AZ) * Math.cos(SUN_EL));

type Rect = { E0: number; E1: number; N0: number; N1: number; nc: number; nr: number };
const BASE: Rect & { lo: number; hi: number } =
  { E0: 2638000, E1: 2648000, N0: 1153000, N1: 1163000, nc: 512, nr: 512, lo: 955.7537841796875, hi: 4157.3525390625 };
const DETAIL: Rect & { lo: number; hi: number } =
  { E0: 2640500, E1: 2645000, N0: 1157800, N1: 1161800, nc: 1126, nr: 1001, lo: 1367.8631591796875, hi: 3966.824462890625 };
const MASK: Rect = { E0: 2640994, E1: 2643984, N0: 1158362, N1: 1161206, nc: 1496, nr: 1423 };

// world: metres, x = east, z = south, origin at the summit
const rectWorld = (r: Rect) => new Vector4(r.E0 - ORIGIN[0], r.E1 - ORIGIN[0], ORIGIN[1] - r.N1, ORIGIN[1] - r.N0); // x0,x1,z0,z1

export interface EigerOptions {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  assetBase: string;           // e.g. '/hero/'
  autoplay: boolean;
  lowPower?: boolean;          // halves mesh density
}
export interface EigerHandle { setPlaying(on: boolean): void; readonly playing: boolean; dispose(): void; }

async function pixels(url: string) {
  const blob = await (await fetch(url)).blob();
  const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  const cv = document.createElement('canvas'); cv.width = bmp.width; cv.height = bmp.height;
  const cx = cv.getContext('2d', { willReadFrequently: true })!;
  cx.drawImage(bmp, 0, 0); bmp.close();
  return cx.getImageData(0, 0, cv.width, cv.height).data;
}

class Field {
  H: Float32Array;
  constructor(public r: Rect, px: Uint8ClampedArray, lo: number, hi: number) {
    const n = r.nc * r.nr; this.H = new Float32Array(n);
    for (let i = 0; i < n; i++) this.H[i] = lo + (((px[i * 4] << 8) | px[i * 4 + 1]) / 65535) * (hi - lo);
  }
  col(x: number) { return (x + ORIGIN[0] - this.r.E0) / (this.r.E1 - this.r.E0) * (this.r.nc - 1); }
  row(z: number) { return (this.r.N1 - (ORIGIN[1] - z)) / (this.r.N1 - this.r.N0) * (this.r.nr - 1); }
  inside(x: number, z: number, pad = 0) {
    const c = this.col(x), r = this.row(z);
    return c >= pad && r >= pad && c <= this.r.nc - 1 - pad && r <= this.r.nr - 1 - pad;
  }
  bilinear(x: number, z: number) {
    const { nc, nr } = this.r, H = this.H;
    const c = Math.min(Math.max(this.col(x), 0), nc - 1.001), r = Math.min(Math.max(this.row(z), 0), nr - 1.001);
    const c0 = c | 0, r0 = r | 0, fc = c - c0, fr = r - r0, i = r0 * nc + c0;
    return (H[i] * (1 - fc) + H[i + 1] * fc) * (1 - fr) + (H[i + nc] * (1 - fc) + H[i + nc + 1] * fc) * fr;
  }
  normalTexture() {
    const { nc, nr } = this.r, H = this.H;
    const dx = (this.r.E1 - this.r.E0) / (nc - 1), dz = (this.r.N1 - this.r.N0) / (nr - 1);
    const out = new Uint8Array(nc * nr * 4);
    for (let r = 0; r < nr; r++) for (let c = 0; c < nc; c++) {
      const l = H[r * nc + Math.max(c - 1, 0)], rr = H[r * nc + Math.min(c + 1, nc - 1)];
      const u = H[Math.max(r - 1, 0) * nc + c], d = H[Math.min(r + 1, nr - 1) * nc + c];
      let x = -(rr - l) / (2 * dx), z = -(d - u) / (2 * dz), y = 1;
      const k = Math.hypot(x, y, z); x /= k; y /= k; z /= k;
      const i = (r * nc + c) * 4;
      out[i] = (x * .5 + .5) * 255; out[i + 1] = (y * .5 + .5) * 255; out[i + 2] = (z * .5 + .5) * 255; out[i + 3] = 255;
    }
    return tex(out, nc, nr);
  }
}

function tex(data: Uint8Array, w: number, h: number, red = false) {
  const t = new DataTexture(data, w, h, red ? RedFormat : RGBAFormat);
  t.magFilter = LinearFilter; t.minFilter = LinearMipmapLinearFilter; t.generateMipmaps = true;
  t.anisotropy = 8; t.unpackAlignment = 1; t.needsUpdate = true; return t;
}
function rgbaFrom(px: Uint8ClampedArray) { return new Uint8Array(px.buffer.slice(0)); }

/* A grid mesh over a field. Heights are adjustable per vertex, and the exact
   rendered surface can be queried, so the runner's feet sit on what you see. */
class GridMesh {
  geo: BufferGeometry; gc: number; gr: number; Y: Float32Array;
  constructor(public f: Field, public stride: number, shape?: (x: number, z: number, y: number, edge: boolean) => number) {
    const { nc, nr } = f.r;
    this.gc = Math.floor((nc - 1) / stride) + 1; this.gr = Math.floor((nr - 1) / stride) + 1;
    const { gc, gr } = this; const n = gc * gr;
    const pos = new Float32Array(n * 3), uv = new Float32Array(n * 2); this.Y = new Float32Array(n);
    const x0 = f.r.E0 - ORIGIN[0], sx = (f.r.E1 - f.r.E0) / (nc - 1), z0 = ORIGIN[1] - f.r.N1, sz = (f.r.N1 - f.r.N0) / (nr - 1);
    for (let j = 0, k = 0; j < gr; j++) for (let i = 0; i < gc; i++, k++) {
      const c = i * stride, r = j * stride, x = x0 + c * sx, z = z0 + r * sz;
      let y = f.H[r * nc + c];
      if (shape) y = shape(x, z, y, i === 0 || j === 0 || i === gc - 1 || j === gr - 1);
      pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z; this.Y[k] = y;
      uv[k * 2] = c / (nc - 1); uv[k * 2 + 1] = r / (nr - 1);
    }
    const idx = new Uint32Array((gc - 1) * (gr - 1) * 6);
    for (let j = 0, k = 0; j < gr - 1; j++) for (let i = 0; i < gc - 1; i++) {
      const a = j * gc + i, b = a + 1, c = a + gc, d = c + 1; idx.set([a, c, b, b, c, d], k); k += 6;
    }
    this.geo = new BufferGeometry();
    this.geo.setAttribute('position', new BufferAttribute(pos, 3));
    this.geo.setAttribute('uv', new BufferAttribute(uv, 2));
    this.geo.setIndex(new BufferAttribute(idx, 1));
    this.geo.computeBoundingSphere();
  }
  surfaceY(x: number, z: number) {
    const u = this.f.col(x) / this.stride, v = this.f.row(z) / this.stride;
    const i = Math.min(Math.max(Math.floor(u), 0), this.gc - 2), j = Math.min(Math.max(Math.floor(v), 0), this.gr - 2);
    const fu = Math.min(Math.max(u - i, 0), 1), fv = Math.min(Math.max(v - j, 0), 1), Y = this.Y, g = this.gc;
    const a = Y[j * g + i], b = Y[j * g + i + 1], c = Y[(j + 1) * g + i], d = Y[(j + 1) * g + i + 1];
    return fu + fv <= 1 ? a + (b - a) * fu + (c - a) * fv : d + (c - d) * (1 - fu) + (b - d) * (1 - fv);
  }
}

/* ---------- shaders ---------- */
const NOISE = /* glsl */`
  float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+1.),u.x), u.y); }
  float fbm(vec2 p){ float a=.5,s=0.; for(int i=0;i<5;i++){ s+=a*vnoise(p); p=mat2(1.6,1.2,-1.2,1.6)*p; a*=.5; } return s; }
`;
const ATMOS = /* glsl */`
  uniform vec3 uSun, uHorizon, uZenith, uSunTint;
  vec3 atmos(vec3 col, vec3 wpos, vec3 cam){
    vec3 v = wpos - cam; float d = length(v); vec3 dir = v/d;
    float s = pow(max(dot(dir, uSun), 0.), 6.);
    vec3 fogC = mix(uHorizon, uSunTint, s*.55);
    float fog = 1. - exp(-pow(d*.00016, 1.35));
    float hz = exp(-max(wpos.y-1150., 0.)*.0022) * (1.-exp(-d*.0009)) * .55;   // valley haze
    return mix(col, fogC, clamp(fog + hz*(1.-fog), 0., .96));
  }
`;

function terrainMaterial(u: Record<string, { value: unknown }>, detail: boolean) {
  return new ShaderMaterial({
    uniforms: u,
    defines: detail ? { DETAIL: 1 } : {},
    vertexShader: /* glsl */`
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv; varying vec3 vW;
      void main(){ vUv = uv; vW = position; gl_Position = projectionMatrix*viewMatrix*vec4(position,1.);
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: /* glsl */`
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform sampler2D tNormal, tLight, tMask; uniform vec4 uMaskRect;
      uniform vec3 uCam, uRunner; uniform float uTime;
      uniform vec3 cSnow, cSnowShade, cRock, cRockDark, cScree, cMeadow, cDirt;
      varying vec2 vUv; varying vec3 vW;
      ${NOISE}
      ${ATMOS}
      // soft shadow of the runner (a vertical capsule) cast along the sun
      float runnerShadow(vec3 p){
        vec3 f = uRunner; vec3 L = uSun; vec3 w = p - f;
        float b = L.y, d = dot(L,w), e = w.y, den = 1. - b*b;
        float s = (b*e - d)/den; float t = clamp((e - b*d)/den, .1, 1.75);
        s = max(s, 0.); vec3 q = p + L*s - (f + vec3(0,t,0));
        return mix(.45, 1., smoothstep(.12, .34, length(q)));
      }
      void main(){
        #include <logdepthbuf_fragment>
        vec3 N = normalize(texture2D(tNormal, vUv).xyz*2.-1.);
        vec2 lt = texture2D(tLight, vUv).rg; float sun = lt.r, ao = lt.g;
        float h = vW.y, slope = 1.-N.y, dist = length(vW - uCam);
        float near = 1. - smoothstep(60., 900., dist);

        float mask = 0.;
        #ifdef DETAIL
          vec2 muv = vec2((vW.x-uMaskRect.x)/(uMaskRect.y-uMaskRect.x), (vW.z-uMaskRect.z)/(uMaskRect.w-uMaskRect.z));
          if (muv.x>0. && muv.x<1. && muv.y>0. && muv.y<1.) mask = texture2D(tMask, muv).r;
        #endif

        // materials
        // on steep ground, sample noise across the wall (horizontal x height)
        // so it doesn't smear into vertical streaks
        float steep = smoothstep(.35, .7, slope);
        vec2 wall = vec2(vW.x*.7071 - vW.z*.7071, vW.y);
        float n1 = fbm(vW.xz*.004);
        float n2 = mix(fbm(vW.xz*.05), fbm(wall*.05), steep);
        float n3 = mix(fbm(vW.xz*.6), fbm(wall*.6), steep);
        float snowLine = 2480. + (n1-.5)*380.;
        float snow = smoothstep(snowLine-90., snowLine+90., h) * (1.-smoothstep(.46, .64, slope + (n2-.5)*.3));
        float gully = smoothstep(.62, .35, ao);                       // snow lingers in gullies on the face
        snow = max(snow, gully * smoothstep(2150., 2500., h) * (1.-smoothstep(.78,.93,slope)) * smoothstep(.45,.6,n2));
        snow = max(snow, smoothstep(3500., 3850., h) * (1.-smoothstep(.72,.88,slope)));
        float meadow = (1.-smoothstep(1880.+n1*260., 2150.+n1*260., h)) * (1.-smoothstep(.3, .52, slope + (n2-.5)*.25));
        float scree = (1.-meadow) * (1.-smoothstep(.45, .7, slope)) * (1.-snow);
        float strata = .5+.5*sin(h*.11 + n2*5.);

        vec3 rock = mix(cRockDark, cRock, .45 + .55*strata*(.6+.4*n3));
        rock *= .8 + .35*n2;
        vec3 scr = cScree * (.82 + .3*n3) * (.9 + .15*n2);
        vec3 grs = cMeadow * (.75 + .35*n2) * mix(vec3(1.), vec3(1.08,1.,.82), smoothstep(.55,.8,n1));
        vec3 alb = rock;
        alb = mix(alb, scr, scree);
        alb = mix(alb, grs, meadow);
        alb = mix(alb, cDirt*(.9+.15*n3), mask);
        alb = mix(alb, cSnow, snow);

        // close-range surface detail: perturb the normal with small-scale noise
        float bump = mix(.45, .15, snow) * (1.-mask*.7) * (1.-steep*.8) * near;
        vec2 e = vec2(.35, 0.);
        float b0 = fbm(vW.xz*1.3), bx = fbm((vW.xz+e.xy)*1.3), bz = fbm((vW.xz+e.yx)*1.3);
        vec3 n = normalize(N + bump*vec3(b0-bx, 0., b0-bz)*1.8);

        float rs = runnerShadow(vW);
        float lam = max(dot(n, uSun), 0.);
        float wrap = max((dot(n,uSun)+.25)/1.25, 0.);                 // softer terminator on snow
        float direct = mix(lam, wrap, snow*.6) * sun * rs;
        vec3 sunC = vec3(1.0,.9,.76) * 2.3;
        vec3 sky = mix(vec3(.30,.36,.42), uZenith, n.y*.5+.5) * (.35 + .65*ao);
        vec3 col = alb * (direct*sunC + sky*1.15);
        col = mix(col, col*cSnowShade*1.6, snow*(1.-direct)*.6);      // cold blue in shaded snow
        // glints on lit snow, only close by
        float g = step(.985, hash(floor(vW.xz*3.1))) * snow * direct * near * pow(max(dot(reflect(normalize(vW-uCam), n), uSun),0.), 8.);
        col += g*2.;

        // map-like contours, only far away so they never cross the runner's path
        float cl = abs(fract(h/100.+.5)-.5) / fwidth(h/100.);
        col = mix(col, col*.8, (1.-smoothstep(0.,1.,cl)) * .22 * smoothstep(900., 2200., dist));

        col = atmos(col, vW, uCam);
        gl_FragColor = vec4(col, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

/* ---------- runner figure ---------- */
function buildRunner() {
  const top = new MeshLambertMaterial({ color: '#a8e24c' });
  const dark = new MeshLambertMaterial({ color: '#1f2523' });
  const skin = new MeshLambertMaterial({ color: '#b98b6e' });
  const shoe = new MeshLambertMaterial({ color: '#e9ede6' });
  const mats = [top, dark, skin, shoe];
  const cap = (r: number, l: number, m: MeshLambertMaterial) => {
    const mesh = new Mesh(new CapsuleGeometry(r, l, 4, 10), m); mesh.position.y = -(l / 2 + r * .6); return mesh;
  };
  const root = new Group();
  const hips = new Group(); hips.position.y = .95; root.add(hips);
  const torso = new Group(); hips.add(torso);
  const chest = new Mesh(new CapsuleGeometry(.15, .36, 4, 12), top); chest.scale.set(1, 1, .68); chest.position.y = .3; torso.add(chest);
  const shorts = new Mesh(new CapsuleGeometry(.14, .08, 4, 12), dark); shorts.scale.set(1.05, 1, .75); shorts.position.y = .02; torso.add(shorts);
  const head = new Mesh(new SphereGeometry(.105, 16, 12), skin); head.position.y = .68; torso.add(head);
  const hat = new Mesh(new SphereGeometry(.11, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), dark); hat.position.y = .7; torso.add(hat);
  const pack = new Mesh(new BoxGeometry(.22, .26, .09), dark); pack.position.set(0, .34, -.13); torso.add(pack);
  const limbs: Record<string, Group> = {};
  for (const [side, sx] of [['L', 1], ['R', -1]] as const) {
    const sh = new Group(); sh.position.set(sx * .2, .5, 0); torso.add(sh);
    sh.add(cap(.045, .2, skin));
    const el = new Group(); el.position.y = -.29; sh.add(el); el.add(cap(.04, .18, skin));
    const hp = new Group(); hp.position.set(sx * .09, 0, 0); hips.add(hp);
    const th = cap(.072, .3, dark); hp.add(th);
    const kn = new Group(); kn.position.y = -.44; hp.add(kn); kn.add(cap(.055, .32, skin));
    const an = new Group(); an.position.y = -.44; kn.add(an);
    const s = new Mesh(new BoxGeometry(.1, .075, .27), shoe); s.position.set(0, -.02, .05); an.add(s);
    limbs['sh' + side] = sh; limbs['el' + side] = el; limbs['hp' + side] = hp; limbs['kn' + side] = kn; limbs['an' + side] = an;
  }
  root.traverse((o) => { (o as Mesh).castShadow = false; });
  const pose = (phase: number, run: number, lean: number) => {
    for (const [side, off] of [['L', 0], ['R', Math.PI]] as const) {
      const p = phase + off;
      const hip = .62 * Math.sin(p) * run;
      const knee = (.18 + 1.35 * Math.pow(Math.max(0, Math.cos(p)), 2)) * run + (1 - run) * .05;
      limbs['hp' + side].rotation.x = -hip;
      limbs['kn' + side].rotation.x = knee;
      limbs['an' + side].rotation.x = -.15 * run - .3 * Math.max(0, -Math.sin(p)) * run;
      limbs['sh' + side].rotation.x = .55 * Math.sin(p) * run;
      limbs['sh' + side].rotation.z = (side === 'L' ? 1 : -1) * .12;
      limbs['el' + side].rotation.x = -(1.5 * run + .15) + .25 * Math.cos(p) * run;
    }
    hips.position.y = .95 - .06 * run + .06 * Math.abs(Math.sin(phase)) * run;
    torso.rotation.x = lean;
    torso.rotation.y = .12 * Math.sin(phase) * run;
  };
  return { root, pose, mats };
}

/* ---------- scene ---------- */
export async function createEiger(opts: EigerOptions): Promise<EigerHandle> {
  const { canvas, host, assetBase } = opts;
  const [bh, bl, dh, dl, mk, trail] = await Promise.all([
    pixels(assetBase + 'base-height.webp'), pixels(assetBase + 'base-light.webp'),
    pixels(assetBase + 'detail-height.webp'), pixels(assetBase + 'detail-light.webp'),
    pixels(assetBase + 'trail-mask.png'),
    fetch(assetBase + 'trail.json').then((r) => r.json() as Promise<{ e: number[]; n: number[] }>),
  ]);
  const base = new Field(BASE, bh, BASE.lo, BASE.hi);
  const det = new Field(DETAIL, dh, DETAIL.lo, DETAIL.hi);
  const dRect = rectWorld(DETAIL);

  // base mesh sinks under the detail tile (feathered), detail tile gets a skirt
  const sink = (x: number, z: number) => {
    const m = Math.min(x - dRect.x, dRect.y - x, z - dRect.z, dRect.w - z);
    return m <= 0 ? 0 : MathUtils.smoothstep(m, 0, 120) * 30;
  };
  const baseMesh = new GridMesh(base, opts.lowPower ? 2 : 1, (x, z, y) => y - sink(x, z));
  const detMesh = new GridMesh(det, opts.lowPower ? 2 : 1, (_x, _z, y, edge) => (edge ? y - 40 : y));
  const groundY = (x: number, z: number) => (det.inside(x, z, 2) ? detMesh.surfaceY(x, z) : baseMesh.surfaceY(x, z));

  const maskData = new Uint8Array(MASK.nc * MASK.nr);
  for (let i = 0; i < maskData.length; i++) maskData[i] = mk[i * 4];
  const tMask = tex(maskData, MASK.nc, MASK.nr, true);

  const renderer = new WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, opts.lowPower ? 1.25 : 1.5));
  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, .3, 30000);

  const shared = {
    uSun: { value: SUN }, uCam: { value: camera.position }, uRunner: { value: new Vector3() }, uTime: { value: 0 },
    uHorizon: { value: new Color('#c9d3d6') }, uZenith: { value: new Color('#4d7593') }, uSunTint: { value: new Color('#f1dcbc') },
    cSnow: { value: new Color('#f3f5f4') }, cSnowShade: { value: new Color('#7f97b0') },
    cRock: { value: new Color('#8f877a') }, cRockDark: { value: new Color('#3b3a36') },
    cScree: { value: new Color('#8a8479') }, cMeadow: { value: new Color('#6f7a4c') }, cDirt: { value: new Color('#a8977a') },
    uMaskRect: { value: rectWorld(MASK) }, tMask: { value: tMask },
  };
  const baseMat = terrainMaterial({ ...shared, tNormal: { value: base.normalTexture() }, tLight: { value: tex(rgbaFrom(bl), 512, 512) } }, false);
  const detMat = terrainMaterial({ ...shared, tNormal: { value: det.normalTexture() }, tLight: { value: tex(rgbaFrom(dl), DETAIL.nc, DETAIL.nr) } }, true);
  scene.add(new Mesh(baseMesh.geo, baseMat), new Mesh(detMesh.geo, detMat));

  // sky with a thin layer of high cloud
  const skyGeo = new SphereGeometry(25000, 48, 24);
  const skyMat = new ShaderMaterial({
    side: BackSide, depthWrite: false, uniforms: shared,
    vertexShader: `#include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position+cameraPosition,1.);
      #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `#include <common>
      #include <logdepthbuf_pars_fragment>
      uniform vec3 uHorizon,uZenith,uSun,uSunTint; uniform float uTime; varying vec3 vD;
      ${NOISE}
      void main(){
        #include <logdepthbuf_fragment>
        vec3 c = mix(uHorizon, uZenith, smoothstep(-.02, .5, vD.y));
        float s = max(dot(vD,uSun),0.);
        c += uSunTint*(pow(s,8.)*.35 + pow(s,400.)*2.5);
        vec2 p = vD.xz/max(vD.y,.06)*1.6 + vec2(uTime*.004, 0.);
        float cl = smoothstep(.55,.85, fbm(p*vec2(1.,3.))) * smoothstep(.02,.25,vD.y) * .5;
        c = mix(c, mix(vec3(.95), uSunTint, pow(s,3.)), cl);
        gl_FragColor = vec4(c,1.);
        #include <colorspace_fragment>
      }`,
  });
  scene.add(new Mesh(skyGeo, skyMat));

  // trail path in world space
  const TX = Float32Array.from(trail.e), TZ = Float32Array.from(trail.n, (n) => -n);
  const TN = TX.length, STEP = 2;
  const LENGTH = (TN - 1) * STEP;
  const along = (s: number, out: Vector3) => {
    const f = Math.min(Math.max(s / STEP, 0), TN - 1.0001), i = f | 0, t = f - i;
    out.x = TX[i] + (TX[i + 1] - TX[i]) * t; out.z = TZ[i] + (TZ[i + 1] - TZ[i]) * t;
    out.y = groundY(out.x, out.z); return out;
  };

  // boulders scattered near the trail (invented, placed on the real surface)
  const rockGeo = new IcosahedronGeometry(1, 1);
  { const p = rockGeo.attributes.position as BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const k = 1 + .28 * Math.sin(x * 5.1 + y * 3.7) * Math.cos(z * 4.3 - y * 2.1);
      p.setXYZ(i, x * k, y * k * .62, z * k);
    }
    rockGeo.computeVertexNormals(); }
  const ROCKS = opts.lowPower ? 500 : 1100;
  const rockMat = new ShaderMaterial({
    uniforms: { ...shared, tLight: detMat.uniforms.tLight, uRect: { value: dRect } },
    vertexShader: `#include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vW, vN; varying float vLocalY;
      void main(){ vec4 w = modelMatrix*instanceMatrix*vec4(position,1.); vW = w.xyz; vLocalY = position.y;
        vN = normalize(mat3(modelMatrix*instanceMatrix)*normal);
        gl_Position = projectionMatrix*viewMatrix*w;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `#include <common>
      #include <logdepthbuf_pars_fragment>
      uniform sampler2D tLight; uniform vec4 uRect; uniform vec3 uCam, cRock, cRockDark;
      varying vec3 vW, vN; varying float vLocalY;
      ${NOISE}
      ${ATMOS}
      void main(){
        #include <logdepthbuf_fragment>
        vec2 uv = vec2((vW.x-uRect.x)/(uRect.y-uRect.x), (vW.z-uRect.z)/(uRect.w-uRect.z));
        vec2 lt = texture2D(tLight, uv).rg;
        vec3 n = normalize(vN);
        vec3 alb = mix(cRockDark, cRock, .55 + .45*fbm(vW.xz*2.+vW.y)) * .95;
        float direct = max(dot(n,uSun),0.) * lt.r;
        vec3 sky = mix(vec3(.30,.36,.42), uZenith, n.y*.5+.5) * (.35+.65*lt.g) * smoothstep(-.7, .3, vLocalY);
        vec3 col = alb * (direct*vec3(1.,.9,.76)*2.3 + sky*1.15);
        gl_FragColor = vec4(atmos(col, vW, uCam), 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const rocks = new InstancedMesh(rockGeo, rockMat, ROCKS);
  { let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const m = new Matrix4(), q = new Quaternion(), sc = new Vector3(), p = new Vector3(), up = new Vector3(0, 1, 0);
    for (let i = 0; i < ROCKS; i++) {
      const s = rnd() * LENGTH; along(s, p);
      const a = along(Math.min(s + 4, LENGTH), new Vector3()); const dx = a.x - p.x, dz = a.z - p.z, l = Math.hypot(dx, dz) || 1;
      const side = (rnd() < .5 ? -1 : 1) * (2.2 + Math.pow(rnd(), 1.8) * 70);
      p.x += -dz / l * side; p.z += dx / l * side;
      const r = .25 + Math.pow(rnd(), 3.2) * 2.6;
      p.y = groundY(p.x, p.z) - r * .25;
      q.setFromAxisAngle(up, rnd() * 6.28); sc.set(r * (.8 + rnd() * .5), r, r * (.8 + rnd() * .5));
      rocks.setMatrixAt(i, m.compose(p, q, sc));
    }
    rocks.instanceMatrix.needsUpdate = true; rocks.computeBoundingSphere(); }
  scene.add(rocks);

  // runner, lit to match the terrain; dimmed when inside a baked shadow
  const runner = buildRunner(); scene.add(runner.root);
  const sunLight = new DirectionalLight('#ffe7c6', 2.4); sunLight.position.copy(SUN).multiplyScalar(100);
  const hemi = new HemisphereLight('#9fb7c9', '#5b5446', 1.0);
  scene.add(sunLight, sunLight.target, hemi);
  const lightAt = (x: number, z: number) => {
    const c = det.col(x), r = det.row(z); const i = (Math.round(r) * DETAIL.nc + Math.round(c)) * 4;
    return dl[i] / 255;
  };

  /* ---------- motion ---------- */
  const DOWN = 3.4, UP = 2.3;                    // m/s: downhill, and back up
  let s = LENGTH * .35, dirSign = 1, phase = 0, heading = 0, runAmt = opts.autoplay ? 1 : 0;
  let playing = opts.autoplay;
  const pos = new Vector3(), ahead = new Vector3(), behind = new Vector3();
  const updateRunner = (dt: number) => {
    const speed = dirSign > 0 ? DOWN : UP;
    runAmt = MathUtils.damp(runAmt, playing ? 1 : 0, 4, dt);
    s += dirSign * speed * dt * runAmt;
    if (s > LENGTH - 3) { s = LENGTH - 3; dirSign = -1; }
    if (s < 3) { s = 3; dirSign = 1; }
    along(s, pos); along(s + dirSign * 5, ahead); along(s - dirSign * 5, behind);
    const want = Math.atan2(ahead.x - behind.x, ahead.z - behind.z);
    let dh = want - heading; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    heading += dh * Math.min(1, dt * 3);
    phase += dt * runAmt * speed / 2.3 * Math.PI * 2;
    const grade = (ahead.y - behind.y) / 10;
    runner.pose(phase, runAmt, .1 * runAmt + MathUtils.clamp(grade, -.3, .3) * -.35);
    runner.root.position.copy(pos);
    runner.root.rotation.y = heading;
    const lit = lightAt(pos.x, pos.z);
    sunLight.intensity = .2 + 2.2 * lit;
    shared.uRunner.value.copy(pos);
  };

  /* drone rig: world-fixed default bearing (camera north of the runner, so the
     face is always behind), drag adds an offset that drifts back when idle */
  const rig = { yawOff: 0, pitchOff: 0, yawVel: 0, lastInput: -1e9 };
  let bearing = 0, tilt = .2;                    // bearing: summit -> runner, so the face stays behind
  let dragging = false, px0 = 0, py0 = 0, touch = false, clock = 0;
  const onDown = (e: PointerEvent) => {
    if ((e.target as Element | null)?.closest('button, a, input, select, textarea')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true; touch = e.pointerType === 'touch'; px0 = e.clientX; py0 = e.clientY;
    try { host.setPointerCapture(e.pointerId); } catch { /* synthetic */ }
    host.classList.add('is-dragging'); kick();
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - px0, dy = e.clientY - py0; px0 = e.clientX; py0 = e.clientY;
    rig.yawVel = -dx * .006; rig.yawOff += rig.yawVel;
    if (!touch) rig.pitchOff = MathUtils.clamp(rig.pitchOff + dy * .003, -.2, .6);
    rig.lastInput = performance.now();
  };
  const onUp = () => { dragging = false; host.classList.remove('is-dragging'); };
  host.addEventListener('pointerdown', onDown); host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerup', onUp); host.addEventListener('pointercancel', onUp);

  const camWant = new Vector3(), look = new Vector3(), lookWant = new Vector3();
  const placeCamera = (dt: number, snap = false) => {
    const idle = (performance.now() - rig.lastInput) / 1000;
    if (!dragging) {
      rig.yawOff += rig.yawVel; rig.yawVel *= Math.pow(.03, dt);
      const back = MathUtils.smoothstep(idle, 4, 9) * (playing ? 1 : 0);   // drift home after a while
      rig.yawOff *= Math.pow(1 - .45 * back, dt); rig.pitchOff *= Math.pow(1 - .45 * back, dt);
    }
    const want = Math.atan2(pos.x, -pos.z);      // summit sits at x = 0, z = 0
    let db = want - bearing; db = Math.atan2(Math.sin(db), Math.cos(db));
    bearing += snap ? db : db * Math.min(1, dt * .5);
    const sway = playing ? Math.sin(clock * .05) * .3 : 0;
    const yaw = bearing + .7 + rig.yawOff + sway;    // three-quarter: face ahead, slope falling away to one side
    const pitch = .06 + rig.pitchOff + (playing ? Math.sin(clock * .08) * .04 : 0);
    const dist = 34 + (playing ? Math.sin(clock * .06 + 1) * 4 : 0);
    camWant.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(dist).add(pos);
    camWant.y += 1;
    camWant.y = Math.max(camWant.y, groundY(camWant.x, camWant.z) + 5);
    if (snap) camera.position.copy(camWant); else camera.position.lerp(camWant, 1 - Math.pow(.02, dt));
    look.lerp(lookWant.set(pos.x, pos.y + 1.1, pos.z), snap ? 1 : 1 - Math.pow(.001, dt));
    camera.lookAt(look);
    camera.rotateX(tilt);                        // tip up so the wall fills the frame, runner sits low
  };

  let visible = true, raf = 0, t0 = performance.now();
  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min((now - t0) / 1000, .1); t0 = now;
    if (playing) clock += dt;
    shared.uTime.value += dt;
    updateRunner(dt); placeCamera(dt);
    renderer.render(scene, camera);
    const moving = playing || dragging || runAmt > .01 || Math.abs(rig.yawVel) > 1e-4 || camera.position.distanceToSquared(camWant) > .001;
    if (visible && !document.hidden && moving) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && visible && !document.hidden) { t0 = performance.now(); raf = requestAnimationFrame(frame); } };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }); io.observe(host);
  const onVis = () => kick(); document.addEventListener('visibilitychange', onVis);

  // frame the runner right of centre, clear of the wordmark
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const portrait = w / h < .8;
    camera.fov = portrait ? 60 : 46;
    // where the runner lands on screen; HeroPhoto.astro opens the scrim at the same spot
    const fx = portrait ? .5 : .72, fy = portrait ? .64 : .8;
    tilt = Math.atan((fy - .5) * 2 * Math.tan(MathUtils.degToRad(camera.fov / 2)));
    camera.setViewOffset(w, h, (.5 - fx) * w, 0, w, h);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera); kick();
  };
  const ro = new ResizeObserver(resize); ro.observe(host);

  updateRunner(0); look.set(pos.x, pos.y + 1.1, pos.z); placeCamera(0, true);
  resize(); renderer.render(scene, camera); kick();

  return {
    get playing() { return playing; },
    setPlaying(on: boolean) { playing = on; kick(); },
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', onVis);
      host.removeEventListener('pointerdown', onDown); host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerup', onUp); host.removeEventListener('pointercancel', onUp);
      scene.traverse((o) => {
        const m = o as Mesh; m.geometry?.dispose();
        const mm = m.material as ShaderMaterial | undefined;
        if (mm) { Object.values(mm.uniforms ?? {}).forEach((u) => (u.value as { isTexture?: boolean; dispose?: () => void })?.isTexture && (u.value as DataTexture).dispose()); mm.dispose(); }
      });
      renderer.dispose();
    },
  };
}

