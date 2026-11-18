import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { buildMap, MAP_SPOTS as SPOTS_3D } from "./map.js";
import { buildMap as buildMapClassic, MAP_SPOTS as SPOTS_CLASSIC } from "./mapClassic.js";
// two map styles share one desk: "classic" (the hand-drawn ink map) and "3d" (the island diorama)
let MODE = (() => { try { return localStorage.getItem("fc-map") === "classic" ? "classic" : "3d"; } catch (e) { return "3d"; } })();
const SPOTS = () => MODE === "classic" ? SPOTS_CLASSIC : SPOTS_3D;
const MAP_SPOTS = SPOTS_3D;
import { Story } from "./story.js";
import { Popup } from "./popup.js";
import { Why } from "./why.js";
import { buildMiniatures } from "./miniatures.js";
import { Letter } from "./letter.js";
import { About } from "./about.js";
import { loadImages } from "./pages.js";
import { quickHTML } from "./quick.js";
import { PROFILE, EXPERIENCE, EDUCATION, SKILL_AREAS, CONTACT, PROJECTS, PROJECT_IMAGES } from "./content.js";

// =====================================================================
// basics
// =====================================================================
const V3 = THREE.Vector3, V2 = THREE.Vector2;
const rand = (() => { let s = 12345; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
const R = (a, b) => a + (b - a) * rand();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = { el: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 10 - .75) * 2.094) + 1, io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, o: t => 1 - Math.pow(1 - t, 3), i: t => t * t * t, lin: t => t, back: t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); } };
export const QUALITY = { shadows: /lq/.test(location.search) ? 1024 : 2048 };

const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
export const LQ = /lq/.test(location.search); renderer.setPixelRatio(LQ ? 1 : Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); document.body.classList.add("plain"); const q = document.getElementById("quickview"); q.hidden = false; });
// reduced motion: no intro film, and every camera move or animation runs much faster
const BOOT = performance.now();
export const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020101);
scene.fog = new THREE.FogExp2(0x030201, 0.035);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.32;

const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.05, 80);
const CAM_HOME = { pos: new V3(0, 11.6, 4.7), look: new V3(0, 0, 0.42) };
// the map view: slightly tilted, so the raised islands read as a little model on the desk
const HUB_CAM = { pos: new V3(0, 9.4, 6.4), look: new V3(0, 0, .25) };
camera.position.copy(CAM_HOME.pos); camera.lookAt(CAM_HOME.look);

const loader = new THREE.TextureLoader();
const aniso = renderer.capabilities.getMaxAnisotropy();
function tex(url, srgb = true, rep) {
  const t = loader.load(url); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t;
}
function shadowy(o, cast = true, recv = true) { o.traverse(m => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = recv; } }); return o; }
function lathe(pts, seg = 64) { return new THREE.LatheGeometry(pts.map(p => new V2(p[0], p[1])), seg); }
function noiseCanvas(g, w, h, base, var_, n = 1, alpha = 1) {
  const id = g.createImageData(w, h); const d = id.data;
  for (let i = 0; i < w * h; i++) { const v = (Math.random() - .5) * var_; d[i * 4] = base[0] + v; d[i * 4 + 1] = base[1] + v * .85; d[i * 4 + 2] = base[2] + v * .7; d[i * 4 + 3] = 255 * alpha; }
  g.putImageData(id, 0, 0);
}

// shared materials --------------------------------------------------------
const brassNormal = canvasTex(256, 256, (g, w, h) => noiseCanvas(g, w, h, [128, 128, 255], 18), false);
brassNormal.wrapS = brassNormal.wrapT = THREE.RepeatWrapping;
const MAT = {
  brass: new THREE.MeshStandardMaterial({ color: 0xd9a24a, metalness: 1, roughness: .32, normalMap: brassNormal, normalScale: new V2(.15, .15) }),
  brassDark: new THREE.MeshStandardMaterial({ color: 0x8a5e22, metalness: 1, roughness: .45 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xf0c060, metalness: 1, roughness: .22 }),
  wax: new THREE.MeshPhysicalMaterial({ color: 0xf4ecd8, roughness: .55, sheen: .4, sheenColor: new THREE.Color(0xffe0b0), emissive: 0x3a1e08, emissiveIntensity: .25 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xdff6ff, roughness: .05, transparent: true, opacity: .32, clearcoat: 1, clearcoatRoughness: .05, specularIntensity: 1.4, depthWrite: false, side: THREE.DoubleSide }),
  ceramic: new THREE.MeshPhysicalMaterial({ color: 0xece3d0, roughness: .32, clearcoat: .6, clearcoatRoughness: .2 }),
  darkWood: new THREE.MeshStandardMaterial({ map: tex("tex/darkwood_paint.jpg"), roughness: .55 }),
  ink: new THREE.MeshPhysicalMaterial({ color: 0x050308, roughness: .05, clearcoat: 1 }),
  cork: null, glove: null, leather: null, fabric: new THREE.MeshStandardMaterial({ color: 0x1f3326, roughness: .95 })
};
const corkTex = canvasTex(256, 256, (g, w, h) => { noiseCanvas(g, w, h, [170, 125, 80], 70); for (let i = 0; i < 400; i++) { g.fillStyle = Math.random() < .5 ? "rgba(90,55,25,.7)" : "rgba(230,190,140,.5)"; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, Math.random() * 3 + .5, 0, 7); g.fill(); } });
MAT.cork = new THREE.MeshStandardMaterial({ map: corkTex, roughness: 1, bumpMap: corkTex, bumpScale: 2 });
const gloveAlb = tex("tex/glove_paint.jpg"), leatherN = tex("tex/leather_normal.jpg", false);
gloveAlb.wrapS = gloveAlb.wrapT = leatherN.wrapS = leatherN.wrapT = THREE.RepeatWrapping;
MAT.glove = new THREE.MeshPhysicalMaterial({ map: gloveAlb, normalMap: leatherN, normalScale: new V2(.5, .5), roughness: .6, sheen: .5, sheenRoughness: .6, sheenColor: new THREE.Color(0xffd0a0), color: 0xd8a06a });
MAT.leather = (tint = 0xffffff) => new THREE.MeshStandardMaterial({ map: tex("tex/leather_paint.jpg"), normalMap: leatherN, normalScale: new V2(.8, .8), roughness: .7, color: tint });

// =====================================================================
// TABLE & PAPER
// =====================================================================
const tblT = (u, srgb) => { const t = tex(u, srgb); t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.repeat.set(2, 2); t.offset.set(.5, .5); return t; };
const table = new THREE.Mesh(new THREE.PlaneGeometry(32, 21.3),
  new THREE.MeshStandardMaterial({ map: tblT("tex/table_paint.webp", true), normalMap: tblT("tex/table_normal.jpg", false), normalScale: new V2(.7, .7), roughnessMap: tblT("tex/table_rough.jpg", false), roughness: .85, color: 0xffffff }));
table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);

// paper geometry: wrinkles, folds and lifted corners
export const PAPER = { w: 6.6, h: 6.6 * 1400 / 2048, px: 2048, py: 1400 };
function paperGeometry(w, h, seed, amp = 1) {
  const g = new THREE.PlaneGeometry(w, h, 180, 124); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i); const u = x / w + .5, v = y / h + .5;
    let z = 0;
    z += (Math.sin(u * 9 + seed) * Math.sin(v * 7 + seed * 2) * .012 + Math.sin(u * 23 + v * 5 + seed) * .004) * amp;
    z += Math.max(0, .03 - Math.abs(u - .5) * .6) * .5 * amp; // vertical fold ridge
    z -= Math.max(0, .02 - Math.abs(v - .5) * .5) * .4 * amp; // horizontal fold valley
    const cu = Math.min(u, 1 - u), cv = Math.min(v, 1 - v);
    z += Math.pow(Math.max(0, .14 - Math.min(cu, cv)), 2) * 2.2 * amp; // edges curl up
    if (u > .8 && v < .2) z += Math.pow((u - .8) * (.2 - v) * 25, 2) * .09 * amp; // dog-eared corner
    if (u < .16 && v > .84) z += Math.pow((.16 - u) * (v - .84) * 39, 2) * .06 * amp;
    p.setZ(i, z + .022);
  }
  g.computeVertexNormals(); return g;
}
const paperAlb = tex("tex/paper_paint.webp"), paperN = tex("tex/paper_normal.jpg", false);
const paperMat = new THREE.MeshStandardMaterial({ map: paperAlb, normalMap: paperN, normalScale: new V2(.55, .55), roughness: .95, alphaTest: .5, side: THREE.DoubleSide });
const pg = paperGeometry(PAPER.w, PAPER.h, 1.3);
const paper = new THREE.Mesh(pg, paperMat); paper.rotation.x = -Math.PI / 2; paper.castShadow = false; paper.receiveShadow = true; scene.add(paper);
// the depth material must respect the torn alpha edge
paper.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: paperAlb, alphaTest: .5 });
// older sheets underneath
[[.35, -.12, .3, .045, 0xb89a6a], [-.5, .25, -.22, -.06, 0x9a7e52]].forEach(([x, z, sx, rot, c]) => {
  const m = new THREE.Mesh(paperGeometry(PAPER.w * .96, PAPER.h * .98, 3 + x, .15), new THREE.MeshStandardMaterial({ map: paperAlb, normalMap: paperN, roughness: .95, alphaTest: .5, color: c, side: THREE.DoubleSide }));
  m.customDepthMaterial = paper.customDepthMaterial;
  m.rotation.x = -Math.PI / 2; m.rotation.z = rot; m.position.set(x + sx, -.03, z); m.receiveShadow = true; scene.add(m);
});

// ink layer: everything that gets drawn on the paper (name, map, notes)
export const ink = document.createElement("canvas"); ink.width = PAPER.px; ink.height = PAPER.py;
const inkG = ink.getContext("2d");
const inkTex = new THREE.CanvasTexture(ink); inkTex.colorSpace = THREE.SRGBColorSpace; inkTex.anisotropy = aniso;
const inkMesh = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ map: inkTex, transparent: true, roughness: .75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, normalMap: paperN, normalScale: new V2(.6, .6) }));
inkMesh.rotation.x = -Math.PI / 2; inkMesh.position.y = .002; inkMesh.receiveShadow = true; scene.add(inkMesh);
export const p2w = (px, py, y = 0) => new V3((px / PAPER.px - .5) * PAPER.w, y, (py / PAPER.py - .5) * PAPER.h);
export const w2p = (v) => [(v.x / PAPER.w + .5) * PAPER.px, (v.z / PAPER.h + .5) * PAPER.py];

// =====================================================================
// LIGHTS
// =====================================================================
const hemi = new THREE.HemisphereLight(0x5a4030, 0x0a0503, .0); scene.add(hemi);
const lamp = new THREE.SpotLight(0xffd6a0, 0, 30, .5, .85, 1.6);
lamp.position.set(-.6, 9.5, -1.2); lamp.target.position.set(0, 0, .35);
lamp.castShadow = true; lamp.shadow.mapSize.set(QUALITY.shadows, QUALITY.shadows); lamp.shadow.bias = -.0003; lamp.shadow.normalBias = .02; lamp.shadow.radius = 6; lamp.shadow.camera.near = 4; lamp.shadow.camera.far = 16;
scene.add(lamp, lamp.target);
const pointerLight = new THREE.PointLight(0xffc488, 0, 4.5, 2); scene.add(pointerLight);
const readLamp = new THREE.SpotLight(0xffd8a0, 0, 20, .42, .75, 1.4); readLamp.position.set(-.4, 8.5, -.6); readLamp.target.position.set(0, 0, .25); readLamp.castShadow = true; readLamp.shadow.mapSize.set(1024, 1024); readLamp.shadow.bias = -.0004; scene.add(readLamp, readLamp.target);
const rim = new THREE.DirectionalLight(0x7a9cff, 0); rim.position.set(-4, 5, -9); scene.add(rim);
const fill = new THREE.DirectionalLight(0xff9a5a, 0); fill.position.set(6, 3, 6); scene.add(fill);

// =====================================================================
// PROPS
// =====================================================================
const props = new THREE.Group(); scene.add(props);
const REF = {};
function place(o, x, z, ry = 0, y = 0) { o.position.set(x, y, z); o.rotation.y = ry; props.add(shadowy(o)); return o; }

// --- candelabra --------------------------------------------------------------
const FLAMES = [];
function flameMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { t: { value: 0 }, k: { value: 0 }, seed: { value: Math.random() * 10 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(0.,0.,0.,1.); mv.xy+=position.xy*vec2(1.0,1.0); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform float t,k,seed; varying vec2 vUv;
      float n(float x){return fract(sin(x)*43758.5453);}
      void main(){ vec2 p=vUv-vec2(.5,.18); float wob=sin(t*9.+seed)*.04+sin(t*17.+seed*2.)*.02; p.x+=wob*p.y*2.;
        float r=length(vec2(p.x*2.3,(p.y)*(p.y>0.?.75:2.2)));
        float core=smoothstep(.36,.0,r); float body=smoothstep(.55,.05,r);
        vec3 c=mix(vec3(1.,.38,.06),vec3(1.,.82,.45),body); c=mix(c,vec3(1.,.98,.9),core);
        float blue=smoothstep(.12,0.,length(vec2(p.x*3.,p.y+.05)))*.6;
        c=mix(c,vec3(.25,.45,1.),blue*.5);
        gl_FragColor=vec4(c*3.2,body*k); }`
  });
}
function glowSprite(color, size, opacity) {
  const t = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.25, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.set(size, size, 1); return s;
}
const candelabra = new THREE.Group();
{
  const base = new THREE.Mesh(lathe([[0, 0], [.62, 0], [.66, .05], [.6, .1], [.42, .16], [.3, .26], [.22, .32], [.2, .45], [.13, .5], [.12, 1.6], [0, 1.6]]), MAT.brass);
  candelabra.add(base);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(.16, 32, 16), MAT.brass); knob.position.y = 1.15; candelabra.add(knob);
  const cups = [[0, 2.35, 0], [-.9, 1.95, .25], [.85, 2.0, -.35]];
  cups.forEach(([cx, cy, cz], i) => {
    if (i > 0) {
      const curve = new THREE.CatmullRomCurve3([new V3(0, 1.2, 0), new V3(cx * .45, 1.15, cz * .45), new V3(cx * .95, 1.45, cz * .95), new V3(cx, cy - .2, cz)]);
      candelabra.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, .05, 12), MAT.brass));
    } else {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, .9, 16), MAT.brass); s.position.set(0, 1.7, 0); candelabra.add(s);
    }
    const cup = new THREE.Mesh(lathe([[0, 0], [.2, 0], [.26, .05], [.24, .14], [.17, .16], [.15, .12], [0, .12]], 32), MAT.brass); cup.position.set(cx, cy - .22, cz); candelabra.add(cup);
    // candle with drips
    const h = [1.05, .8, .9][i];
    const c = new THREE.Mesh(new THREE.CylinderGeometry(.13, .135, h, 32, 6), MAT.wax); c.position.set(cx, cy - .1 + h / 2, cz); candelabra.add(c);
    const top = new THREE.Mesh(lathe([[0, -.02], [.1, -.03], [.135, 0], [.14, .02], [0, .0]], 32), MAT.wax); top.position.set(cx, cy - .1 + h, cz); candelabra.add(top);
    for (let d = 0; d < 6; d++) {
      const a = R(0, 6.28), len = R(.12, .45); const drip = new THREE.Mesh(new THREE.CapsuleGeometry(R(.025, .04), len, 4, 8), MAT.wax);
      drip.position.set(cx + Math.cos(a) * .132, cy - .1 + h - len / 2 - .02, cz + Math.sin(a) * .132); drip.scale.set(1, 1, .7); drip.lookAt(cx, drip.position.y, cz); candelabra.add(drip);
      const blob = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 8), MAT.wax); blob.position.set(drip.position.x, drip.position.y - len / 2, drip.position.z); candelabra.add(blob);
    }
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(.008, .01, .08, 6), new THREE.MeshStandardMaterial({ color: 0x120804, roughness: 1 })); wick.position.set(cx, cy - .1 + h + .04, cz); wick.rotation.z = R(-.2, .2); candelabra.add(wick);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(.17, .42), flameMaterial()); fl.position.set(cx, cy - .1 + h + .2, cz); fl.renderOrder = 10; candelabra.add(fl);
    const glow = glowSprite(0xff9a40, 1.1, 0); glow.position.copy(fl.position); candelabra.add(glow);
    const light = new THREE.PointLight(0xff9a48, 0, 0, 2); light.position.set(cx, cy - .1 + h + .25, cz); candelabra.add(light);
    if (i === 0 && !LQ) { light.castShadow = true; light.shadow.mapSize.set(1024, 1024); light.shadow.bias = -.002; light.shadow.radius = 8; light.shadow.camera.near = .2; }
    FLAMES.push({ mesh: fl, glow, light, k: 0, base: [5.5, 3.4, 3.8][i] });
  });
}
candelabra.scale.setScalar(.82);
place(candelabra, 3.25, -1.95, .5); REF.candelabra = candelabra;
// shadow of flame-holders shouldn't block their own light
candelabra.traverse(m => { if (m.isMesh && m.material === MAT.wax) m.castShadow = false; });

// --- coffee mug + steam -------------------------------------------------------
const mug = new THREE.Group();
{
  const body = new THREE.Mesh(lathe([[0, 0], [.4, 0], [.43, .02], [.45, .08], [.47, .62], [.49, .68], [.46, .7], [.43, .66], [.42, .1], [0, .1]]), MAT.ceramic); mug.add(body);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(.425, 48), new THREE.MeshPhysicalMaterial({ color: 0x1a0b04, roughness: .06, clearcoat: 1, clearcoatRoughness: .02 })); coffee.rotation.x = -Math.PI / 2; coffee.position.y = .55; mug.add(coffee);
  const crema = new THREE.Mesh(new THREE.RingGeometry(.36, .425, 48), new THREE.MeshStandardMaterial({ color: 0x6a3a18, roughness: .4, transparent: true, opacity: .6 })); crema.rotation.x = -Math.PI / 2; crema.position.y = .551; mug.add(crema);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.2, .055, 16, 32, Math.PI * 1.1), MAT.ceramic); handle.position.set(.5, .36, 0); handle.rotation.z = -Math.PI / 2 - .05; mug.add(handle);
}
place(mug, 1.75, -2.2, -.4); REF.mug = mug;
const steam = [];
{
  const st = canvasTex(128, 128, (g) => { for (let i = 0; i < 40; i++) { const x = 64 + R(-22, 22), y = 64 + R(-22, 22), r = R(10, 30); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,.12)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); } });
  for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: st, transparent: true, depthWrite: false, opacity: 0, color: 0xfff2e0 })); s.userData = { t: i / 14 }; scene.add(s); steam.push(s); }
}

// --- glowing berry bowl ---------------------------------------------------------
const BERRIES = []; const BERRY_MESH = [];
{
  const bowl = new THREE.Group();
  const woodBowl = new THREE.MeshStandardMaterial({ map: tex("tex/darkwood_paint.jpg"), color: 0xe0b090, roughness: .45 });
  bowl.add(new THREE.Mesh(lathe([[0, 0], [.55, 0], [.62, .04], [.82, .2], [.93, .42], [.9, .46], [.84, .44], [.76, .24], [.56, .12], [0, .12]]), woodBowl));
  const bm = new THREE.MeshPhysicalMaterial({ color: 0xa6e868, roughness: .18, clearcoat: 1, emissive: 0x7ad030, emissiveIntensity: .5, sheen: 1, sheenColor: new THREE.Color(0xeaffc0), thickness: .2 });
  const spots = [[0, .27, 0], [.28, .25, .1], [-.26, .25, .12], [.08, .25, -.3], [-.12, .26, .3], [.2, .44, -.08], [-.16, .44, -.1], [.02, .45, .18], [.36, .3, -.22], [-.38, .3, -.18]];
  spots.forEach(([x, y, z], i) => { const r = R(.15, .2); const b = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), bm); b.position.set(x, y, z); b.userData.y0 = y; bowl.add(b); BERRY_MESH.push(b); });
  const bl = new THREE.PointLight(0x9cff50, 0, 2.5, 2); bl.position.set(0, .7, 0); bowl.add(bl); BERRIES.push(bl, bm);
  const spoon = new THREE.Mesh(new THREE.CylinderGeometry(.035, .045, 1.5, 10), woodBowl); spoon.rotation.z = Math.PI / 2 - .35; spoon.rotation.y = .6; spoon.position.set(.55, .55, -.35); bowl.add(spoon);
  place(bowl, .05, -2.45, 0); REF.bowl = bowl;
}

// --- glass jar with glowing potion -----------------------------------------------
const POTION = [];
{
  const jar = new THREE.Group();
  const gm = MAT.glass.clone(); gm.color.set(0xd8fff4); gm.color = new THREE.Color(0x40d0b0); gm.attenuationDistance = 1.2; gm.thickness = .6;
  jar.add(new THREE.Mesh(lathe([[0, 0], [.5, 0], [.55, .04], [.57, .12], [.58, 1.0], [.5, 1.1], [.42, 1.14], [.43, 1.22], [.38, 1.24], [.36, 1.12], [.48, 1.06], [.53, .98], [.52, .12], [.48, .06], [0, .06]]), gm));
  const liq = new THREE.MeshPhysicalMaterial({ color: 0x40e0b8, emissive: 0x18c098, emissiveIntensity: .9, roughness: .1, thickness: .8, transparent: true, opacity: .92 });
  const l = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .75, 48), liq); l.position.y = .44; jar.add(l);
  for (let i = 0; i < 18; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(R(.015, .04), 8, 6), new THREE.MeshBasicMaterial({ color: 0xd8fff2, transparent: true, opacity: .6 })); b.position.set(R(-.35, .35), R(.15, .8), R(-.35, .35)); jar.add(b); }
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(.4, .36, .3, 32), MAT.cork); cork.position.y = 1.26; jar.add(cork); REF.cork = cork;
  const string = new THREE.Mesh(new THREE.TorusGeometry(.405, .015, 6, 48), new THREE.MeshStandardMaterial({ color: 0x8a6a40, roughness: 1 })); string.rotation.x = Math.PI / 2; string.position.y = 1.08; jar.add(string);
  const pl = new THREE.PointLight(0x30ffc8, 0, 3.2, 2); pl.position.set(0, .6, .2); jar.add(pl);
  POTION.push(pl, liq);
  place(jar, -1.75, -2.35, 0); REF.jar = jar;
  // spilled puddle on the paper
  const sh = new THREE.Shape(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, r = .42 + Math.sin(a * 3) * .08 + Math.sin(a * 7 + 1) * .04 + (i % 9 === 0 ? .06 : 0); const x = Math.cos(a) * r * 1.4, y = Math.sin(a) * r; i ? sh.lineTo(x, y) : sh.moveTo(x, y); }
  const pud = new THREE.Mesh(new THREE.ShapeGeometry(sh, 24), new THREE.MeshPhysicalMaterial({ color: 0x2cc9a0, emissive: 0x10a080, emissiveIntensity: .7, roughness: .02, clearcoat: 1, transparent: true, opacity: .82 }));
  pud.rotation.x = -Math.PI / 2; pud.position.set(-2.75, .03, -2.75); pud.rotation.z = .35; props.add(pud); REF.puddle = pud; POTION.push(pud.material);
  REF.drops = [];
  for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.CircleGeometry(R(.03, .07), 16), pud.material); REF.drops.push(d); d.rotation.x = -Math.PI / 2; d.position.set(-2.75 + R(-.9, .9), .031, -2.45 + R(-.1, .1)); props.add(d); }
}

// --- vials ---------------------------------------------------------------------------
[[-2.85, -2.75, 0x9a40ff, .7], [-2.45, -3.05, 0xff3a5a, .55], [-3.2, -2.45, 0xffc030, .5]].forEach(([x, z, c, s]) => {
  const v = new THREE.Group();
  const gm = MAT.glass.clone(); gm.color.set(0xffffff); gm.color = new THREE.Color(c); gm.attenuationDistance = .4;
  v.add(new THREE.Mesh(lathe([[0, 0], [.22, 0], [.25, .05], [.25, .5], [.12, .68], [.1, .9], [.13, .94], [0, .94]], 32), gm));
  const l = new THREE.Mesh(new THREE.CylinderGeometry(.21, .21, .4, 24), new THREE.MeshPhysicalMaterial({ color: c, emissive: c, emissiveIntensity: .35, roughness: .1, thickness: .3 })); l.position.y = .24; v.add(l);
  const ck = new THREE.Mesh(new THREE.CylinderGeometry(.11, .09, .16, 16), MAT.cork); ck.position.y = .98; v.add(ck);
  v.scale.setScalar(s); place(v, x, z); (REF.vials = REF.vials || []).push(v);
});

// --- old leather books with a sealed letter ------------------------------------------------
function bookCoverTex(tint, title) {
  return canvasTex(512, 640, (g, w, h) => {
    const img = new Image(); img.src = "tex/leather_albedo.jpg";
    g.fillStyle = tint; g.fillRect(0, 0, w, h);
    const gr = g.createRadialGradient(w * .4, h * .35, 20, w * .5, h * .5, w * .8); gr.addColorStop(0, "rgba(255,220,180,.15)"); gr.addColorStop(1, "rgba(0,0,0,.45)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * .15})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.strokeStyle = "#d8ad5a"; g.lineWidth = 4; g.strokeRect(36, 36, w - 72, h - 72); g.lineWidth = 1.5; g.strokeRect(50, 50, w - 100, h - 100);
    g.fillStyle = "#d8ad5a"; [[50, 50], [w - 50, 50], [50, h - 50], [w - 50, h - 50]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); });
    g.save(); g.translate(w / 2, h / 2); for (let i = 0; i < 8; i++) { g.rotate(Math.PI / 4); g.beginPath(); g.ellipse(0, -40, 12, 36, 0, 0, 7); g.stroke(); } g.restore();
    g.font = "700 33px 'Cinzel Decorative'"; g.textAlign = "center"; g.fillText(title, w / 2, 150);
  });
}
const pageEdgeTex = canvasTex(256, 64, (g, w, h) => { g.fillStyle = "#e6d6b0"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(120,90,50,${Math.random() * .35})`; g.fillRect(0, y, w, 1); } });
function oldBook(w, t, d, tint, title) {
  const cover = new THREE.MeshStandardMaterial({ map: bookCoverTex(tint, title), normalMap: leatherN, normalScale: new V2(.7, .7), roughness: .65, bumpScale: 1 });
  const side = new THREE.MeshStandardMaterial({ map: pageEdgeTex, roughness: .9 });
  const spine = new THREE.MeshStandardMaterial({ color: tint, normalMap: leatherN, roughness: .7 });
  const g = new THREE.Group();
  const block = new THREE.Mesh(new THREE.BoxGeometry(w - .06, t - .05, d - .06), [side, spine, side, side, side, side]); block.position.y = t / 2; g.add(block);
  [t - .02, .02].forEach(y => { const c = new THREE.Mesh(new RoundedBoxGeometry(w, .045, d, 2, .015), [spine, spine, cover, spine, spine, spine]); c.position.y = y; g.add(c); });
  const sp = new THREE.Mesh(new THREE.CylinderGeometry(t / 2 + .01, t / 2 + .01, d, 24, 1, false, Math.PI, Math.PI), spine); sp.rotation.x = Math.PI / 2; sp.position.set(-w / 2 + .02, t / 2, 0); g.add(sp);
  return g;
}
{
  const s = new THREE.Group();
  const b1 = oldBook(1.9, .32, 1.4, "#5a1c14", "Tomes"); s.add(b1);
  const b2 = oldBook(1.7, .28, 1.25, "#1c3a2c", "Codex"); b2.position.y = .34; b2.rotation.y = .18; s.add(b2);
  const b3 = oldBook(1.45, .22, 1.05, "#6a4220", "Notes"); b3.position.y = .63; b3.rotation.y = -.12; s.add(b3);
  const env = new THREE.Mesh(new THREE.PlaneGeometry(1.05, .68), new THREE.MeshStandardMaterial({ map: canvasTex(512, 330, (g, w, h) => { g.fillStyle = "#ece0c2"; g.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(120,90,50,${Math.random() * .08})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.strokeStyle = "rgba(140,110,70,.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(w / 2, h * .62); g.lineTo(w, 0); g.stroke(); g.font = "30px Caveat"; g.fillStyle = "#4a3828"; g.fillText("to whoever finds this", 40, h - 40); }), roughness: .9 }));
  env.rotation.x = -Math.PI / 2; env.rotation.z = .25; env.position.set(.05, .865, .05); s.add(env);
  const seal = waxSeal(.15, "F"); seal.position.set(.02, .87, .12); s.add(seal);
  place(s, -4.35, -2.0, -.35); REF.books = s; REF.topBook = b3; REF.envelope = env;
}

// --- wax seal factory -------------------------------------------------------------------------
function waxSeal(r, letter, color = 0x5a0806) {
  const bump = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); const gr = g.createRadialGradient(128, 128, 60, 128, 128, 128); gr.addColorStop(0, "#999"); gr.addColorStop(.7, "#666"); gr.addColorStop(1, "#000"); g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill(); g.strokeStyle = "#222"; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 86, 0, 7); g.stroke(); g.fillStyle = "#ddd"; g.beginPath(); g.arc(128, 128, 80, 0, 7); g.fill(); g.fillStyle = "#333"; g.font = "700 120px Caveat"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(letter, 128, 136); for (let i = 0; i < 12; i++) { g.save(); g.translate(128, 128); g.rotate(i / 12 * 6.28); g.fillStyle = "#555"; g.fillRect(-3, -104, 6, 12); g.restore(); } }, false);
  const geo = new THREE.CylinderGeometry(r, r * 1.08, r * .28, 64, 2); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), rr = Math.hypot(x, z); if (rr > r * .5) { const k = 1 + Math.sin(a * 5) * .06 + Math.sin(a * 11 + 1) * .04; p.setX(i, x * k); p.setZ(i, z * k); } }
  geo.computeVertexNormals();
  const m = new THREE.MeshStandardMaterial({ color, roughness: .5, bumpMap: bump, bumpScale: 2.0, envMapIntensity: .12 });
  const mesh = new THREE.Mesh(geo, m); mesh.position.y = r * .14; const g = new THREE.Group(); g.add(mesh); return shadowy(g);
}

// --- fantasy plant -------------------------------------------------------------------------
const FLOWER = [];
{
  const pot = new THREE.Group();
  const terra = new THREE.MeshStandardMaterial({ color: 0xa4512a, roughness: .92, normalMap: brassNormal, normalScale: new V2(.6, .6) });
  pot.add(new THREE.Mesh(lathe([[0, 0], [.48, 0], [.6, .7], [.7, .74], [.7, .86], [.6, .86], [.52, .76], [0, .76]]), terra));
  const soil = new THREE.Mesh(new THREE.CircleGeometry(.58, 40), new THREE.MeshStandardMaterial({ map: canvasTex(128, 128, (g, w, h) => noiseCanvas(g, w, h, [45, 28, 16], 50)), roughness: 1 })); soil.rotation.x = -Math.PI / 2; soil.position.y = .78; pot.add(soil);
  const leafTex = canvasTex(256, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "#1c4a1e"); gr.addColorStop(.5, "#5ea83e"); gr.addColorStop(1, "#1c4a1e"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(210,255,170,.6)"; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 0); g.stroke(); g.lineWidth = 2; for (let y = 40; y < h; y += 46) { g.beginPath(); g.moveTo(w / 2, y + 30); g.quadraticCurveTo(w * .3, y + 10, 10, y - 10); g.moveTo(w / 2, y + 30); g.quadraticCurveTo(w * .7, y + 10, w - 10, y - 10); g.stroke(); } for (let i = 0; i < 25; i++) { g.fillStyle = "rgba(200,255,240,.9)"; g.beginPath(); g.arc(R(30, w - 30), R(30, h - 60), R(2, 5), 0, 7); g.fill(); } });
  const leafMat = new THREE.MeshPhysicalMaterial({ map: leafTex, side: THREE.DoubleSide, roughness: .45, clearcoat: .4, sheen: .5, sheenColor: new THREE.Color(0xc0ffa0) });
  for (let i = 0; i < 12; i++) {
    const s = new THREE.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(.26, .6, 0, 1.45); s.quadraticCurveTo(-.26, .6, 0, 0);
    const geo = new THREE.ShapeGeometry(s, 24); const p = geo.attributes.position; const uv = geo.attributes.uv;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k); uv.setXY(k, x / .52 + .5, y / 1.45); p.setZ(k, -y * y * .32 + Math.abs(x) * .4); }
    geo.computeVertexNormals();
    const leaf = new THREE.Mesh(geo, leafMat); leaf.rotation.x = -Math.PI / 2 + R(.35, .7); const hold = new THREE.Group(); hold.add(leaf); hold.rotation.y = i / 12 * Math.PI * 2 + R(-.2, .2); hold.position.y = .8; leaf.scale.setScalar(R(.75, 1.05)); pot.add(hold);
  }
  const petal = new THREE.MeshPhysicalMaterial({ color: 0x8ec4ff, emissive: 0x4a90ff, emissiveIntensity: .8, roughness: .3, sheen: 1, sheenColor: new THREE.Color(0xffffff), side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(.16, 20, 12), petal); p.scale.set(1, .25, .55); const a = i / 7 * 6.28; p.position.set(Math.cos(a) * .17, 1.25, Math.sin(a) * .17); p.rotation.y = -a; p.rotation.z = .5; pot.add(p); }
  const ctr = new THREE.Mesh(new THREE.SphereGeometry(.08, 16, 12), new THREE.MeshStandardMaterial({ color: 0xfff2b0, emissive: 0xffd060, emissiveIntensity: 1.2 })); ctr.position.y = 1.3; pot.add(ctr);
  const fl = new THREE.PointLight(0x7ab0ff, 0, 2.6, 2); fl.position.y = 1.5; pot.add(fl); FLOWER.push(fl, petal);
  pot.scale.setScalar(.9); place(pot, 5.05, -.65, 0); REF.plant = pot;
}

// --- inkwell + quill --------------------------------------------------------------------
{
  const iw = new THREE.Group();
  const dg = MAT.glass.clone(); dg.color.set(0x7a7aa8); dg.color = new THREE.Color(0x101030); dg.attenuationDistance = .25; dg.thickness = .6;
  iw.add(new THREE.Mesh(lathe([[0, 0], [.42, 0], [.46, .05], [.46, .3], [.3, .44], [.18, .48], [0, .48]], 48), dg));
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .1, 32), MAT.brass); collar.position.y = .52; iw.add(collar);
  const inkTop = new THREE.Mesh(new THREE.CircleGeometry(.16, 32), MAT.ink); inkTop.rotation.x = -Math.PI / 2; inkTop.position.y = .571; iw.add(inkTop);
  place(iw, 4.3, .95); REF.inkwell = iw;
}
const quill = new THREE.Group();
{
  const fTex = canvasTex(256, 1024, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const vane = new Path2D(); vane.moveTo(w / 2, h * .98); vane.bezierCurveTo(w * .1, h * .7, w * .02, h * .25, w * .5, h * .01); vane.bezierCurveTo(w * .98, h * .3, w * .85, h * .7, w / 2, h * .98);
    g.save(); g.clip(vane);
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "#d9cdb4"); gr.addColorStop(.5, "#fbf6ea"); gr.addColorStop(1, "#cbbd9e"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(150,130,100,.5)"; g.lineWidth = 1.2; for (let y = 0; y < h; y += 5) { g.beginPath(); g.moveTo(w / 2, y + 20); g.lineTo(0, y - 30); g.moveTo(w / 2, y + 20); g.lineTo(w, y - 24); g.stroke(); }
    g.fillStyle = "rgba(110,80,50,.35)"; g.fillRect(0, h * .05, w, h * .05); g.fillRect(0, h * .13, w, h * .03);
    g.restore();
    g.clearRect(0, h * .78, w, h); // bare shaft near the nib
    for (let i = 0; i < 6; i++) { g.clearRect(R(0, w * .2), R(h * .2, h * .7), R(10, 30), 3); g.clearRect(R(w * .8, w), R(h * .2, h * .7), R(10, 30), 3); }
    g.strokeStyle = "#f2ead8"; g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, h * .02); g.stroke();
  });
  const vane = new THREE.Mesh(new THREE.PlaneGeometry(.55, 2.2, 1, 12), new THREE.MeshStandardMaterial({ map: fTex, alphaTest: .4, side: THREE.DoubleSide, roughness: .8 }));
  const p = vane.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, (y + 1.1) * (y + 1.1) * .04); } vane.geometry.computeVertexNormals();
  vane.position.set(0, 1.1, 0); const tilt = new THREE.Group(); tilt.add(vane);
  const nib = new THREE.Mesh(new THREE.ConeGeometry(.025, .14, 8), MAT.ink); nib.rotation.x = Math.PI; nib.position.y = -.06; tilt.add(nib);
  tilt.rotation.z = -.55; tilt.rotation.x = .35; quill.add(tilt);
  quill.visible = false; scene.add(shadowy(quill, true, false));
  quill.customDepth = vane;
  vane.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: fTex, alphaTest: .4 });
}

// --- gems, coins, geode --------------------------------------------------------------------
const GEMS = [];
[[4.2, 1.95, 0xff2a5a, .2], [4.55, 2.1, 0x2a8aff, .16], [3.9, 2.25, 0x1fd0a0, .18], [4.8, 1.75, 0xffc030, .13], [4.45, 2.45, 0x9a4aff, .14], [3.6, 1.95, 0x1fd0a0, .12]].forEach(([x, z, c, s]) => {
  const g = new THREE.Mesh(new THREE.OctahedronGeometry(s, 0), new THREE.MeshPhysicalMaterial({ color: c, thickness: .4, roughness: .02, ior: 2.2, flatShading: true, emissive: c, emissiveIntensity: .12, iridescence: .3 }));
  g.scale.set(1.2, .8, 1); g.rotation.set(R(0, 3), R(0, 3), R(0, 3)); place(g, x, z, 0, s * .6); GEMS.push(g); g.userData.y0 = s * .6;
});
[[3.05, 2.85], [3.35, 2.95], [3.2, 2.62], [2.85, 2.55]].forEach(([x, z], i) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(.19, .19, .04, 40), MAT.gold); c.rotation.set(R(-.15, .15), 0, R(-.15, .15)); place(c, x, z, 0, .025 + i * .01); c.userData.y0 = .025 + i * .01; (REF.coins = REF.coins || []).push(c); });
{
  const geode = new THREE.Group();
  const rock = new THREE.IcosahedronGeometry(.62, 3); const p = rock.attributes.position;
  for (let i = 0; i < p.count; i++) { const v = new V3().fromBufferAttribute(p, i); const k = 1 + Math.sin(v.x * 9) * .06 + Math.sin(v.z * 11 + 1) * .05 + Math.sin(v.y * 7) * .04; v.multiplyScalar(k); if (v.y > .1) v.y = .1 + (v.y - .1) * .2; p.setXYZ(i, v.x, v.y, v.z); }
  rock.computeVertexNormals();
  geode.add(new THREE.Mesh(rock, new THREE.MeshStandardMaterial({ color: 0x4a4440, roughness: .95, normalMap: brassNormal, normalScale: new V2(1.5, 1.5) })));
  const cm = new THREE.MeshPhysicalMaterial({ color: 0xb070ff, emissive: 0x7a30d0, emissiveIntensity: .45, thickness: .3, roughness: .05, flatShading: true });
  for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(R(.04, .08), R(.18, .36), 6), cm); const a = R(0, 6.28), r = R(0, .42); c.position.set(Math.cos(a) * r, .14, Math.sin(a) * r); c.rotation.set(Math.sin(a) * r * 1.5, 0, -Math.cos(a) * r * 1.5); geode.add(c); }
  const gl = new THREE.PointLight(0xa060ff, 0, 1.8, 2); gl.position.y = .5; geode.add(gl); FLOWER.push(gl);
  place(geode, 5.4, 2.55, .4, .05); REF.geode = geode; REF.crystal = cm;
}

// --- compass, pocket watch, hourglass ---------------------------------------------------------------
let compassNeedle, watchHands = {};
function dialTex(kind) {
  return canvasTex(512, 512, (g, w, h) => {
    const c = w / 2; const gr = g.createRadialGradient(c, c, 10, c, c, c); gr.addColorStop(0, "#fbf5e6"); gr.addColorStop(.85, "#ecdfc2"); gr.addColorStop(1, "#c8b088"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#3a2a18"; g.fillStyle = "#3a2a18";
    if (kind === "compass") {
      for (let i = 0; i < 64; i++) { const a = i / 64 * 6.28; const r1 = i % 8 === 0 ? 190 : i % 4 === 0 ? 205 : 222; g.lineWidth = i % 8 === 0 ? 3 : 1.4; g.beginPath(); g.moveTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1); g.lineTo(c + Math.cos(a) * 236, c + Math.sin(a) * 236); g.stroke(); }
      const star = (ro, ri, rot, fill) => { g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? ri : ro, a = rot + i * Math.PI / 4; g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r); } g.closePath(); g.fillStyle = fill; g.fill(); };
      star(170, 30, -Math.PI / 2, "rgba(120,90,50,.7)"); star(120, 24, -Math.PI / 4, "rgba(60,40,20,.5)");
      g.fillStyle = "#7a1a14"; g.font = "700 40px 'Cinzel Decorative'"; g.textAlign = "center"; g.fillText("N", c, 90); g.fillStyle = "#3a2a18"; g.font = "700 27px 'Cinzel Decorative'"; g.fillText("S", c, h - 52); g.fillText("E", w - 64, c + 12); g.fillText("W", 64, c + 12);
    } else {
      const R_ = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
      g.font = "700 37px 'Cinzel Decorative'"; g.textAlign = "center"; g.textBaseline = "middle"; R_.forEach((t, i) => { const a = i / 12 * 6.28 - Math.PI / 2; g.fillText(t, c + Math.cos(a) * 180, c + Math.sin(a) * 180); });
      for (let i = 0; i < 60; i++) { const a = i / 60 * 6.28; g.lineWidth = i % 5 ? 1.5 : 4; g.beginPath(); g.moveTo(c + Math.cos(a) * 222, c + Math.sin(a) * 222); g.lineTo(c + Math.cos(a) * 238, c + Math.sin(a) * 238); g.stroke(); }
      g.beginPath(); g.arc(c, c + 90, 40, 0, 7); g.lineWidth = 1.5; g.stroke(); g.font = "700 19px 'Cinzel Decorative'"; g.fillText("Corsalini", c, c - 80);
    }
    g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 10; g.beginPath(); g.arc(c, c, c - 5, 0, 7); g.stroke();
  });
}
function glassDome(r) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 16, 0, Math.PI * 2, 0, .45), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .02, thickness: .05, transparent: true, ior: 1.5, clearcoat: 1 })); return m; }
{
  const cp = new THREE.Group();
  cp.add(new THREE.Mesh(lathe([[0, 0], [.62, 0], [.66, .04], [.66, .16], [.6, .2], [.56, .18], [.56, .12], [0, .12]]), MAT.brass));
  const face = new THREE.Mesh(new THREE.CircleGeometry(.56, 64), new THREE.MeshStandardMaterial({ map: dialTex("compass"), roughness: .6 })); face.rotation.x = -Math.PI / 2; face.position.y = .121; cp.add(face);
  compassNeedle = new THREE.Group();
  const nm = (c) => new THREE.MeshStandardMaterial({ color: c, metalness: .6, roughness: .35 });
  const n1 = new THREE.Mesh(new THREE.ConeGeometry(.05, .42, 4), nm(0xa81e18)); n1.rotation.x = -Math.PI / 2; n1.position.z = -.21; n1.scale.y = 1; compassNeedle.add(n1);
  const n2 = new THREE.Mesh(new THREE.ConeGeometry(.05, .42, 4), nm(0x22222a)); n2.rotation.x = Math.PI / 2; n2.position.z = .21; compassNeedle.add(n2);
  const pin = new THREE.Mesh(new THREE.SphereGeometry(.04, 12, 8), MAT.brass); compassNeedle.add(pin);
  compassNeedle.position.y = .15; cp.add(compassNeedle);
  const dome = glassDome(.62); dome.position.y = -.24; dome.scale.y = .9; cp.add(dome);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.12, .025, 8, 24), MAT.brass); ring.position.set(0, .1, -.72); ring.rotation.x = .3; cp.add(ring);
  place(cp, -4.75, -.15, .2); REF.compass = cp;
}
{
  const pw = new THREE.Group();
  pw.add(new THREE.Mesh(lathe([[0, 0], [.46, 0], [.52, .05], [.53, .12], [.48, .17], [0, .17]]), MAT.gold));
  const face = new THREE.Mesh(new THREE.CircleGeometry(.44, 64), new THREE.MeshStandardMaterial({ map: dialTex("watch"), roughness: .4 })); face.rotation.x = -Math.PI / 2; face.position.y = .171; pw.add(face);
  const hm = new THREE.MeshStandardMaterial({ color: 0x0e0904, metalness: .5, roughness: .3 });
  [["h", .2, .022], ["m", .32, .016], ["s", .36, .008]].forEach(([k, l, w]) => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(w, .006, l), k === "s" ? new THREE.MeshStandardMaterial({ color: 0x9a1a14 }) : hm); b.position.z = -l / 2 + .03; g.add(b); g.position.y = .18 + (k === "s" ? .006 : k === "m" ? .003 : 0); pw.add(g); watchHands[k] = g; });
  const dome = glassDome(.5); dome.position.y = -.05; dome.scale.y = .55; pw.add(dome);
  const bow = new THREE.Mesh(new THREE.TorusGeometry(.13, .03, 10, 28), MAT.gold); bow.position.set(0, .09, -.62); bow.rotation.x = Math.PI / 2; pw.add(bow);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .12, 16), MAT.gold); crown.rotation.x = Math.PI / 2; crown.position.set(0, .09, -.52); pw.add(crown);
  // chain
  const curve = new THREE.CatmullRomCurve3([new V3(0, .05, -.72), new V3(.4, .03, -1.2), new V3(1.1, .03, -1.05), new V3(1.2, .03, -.4), new V3(1.7, .03, 0), new V3(2.3, .03, -.2)]);
  const N = 70; const link = new THREE.InstancedMesh(new THREE.TorusGeometry(.04, .012, 6, 12), MAT.gold, N);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < N; i++) { const t = i / (N - 1); const p = curve.getPointAt(t), tg = curve.getTangentAt(t); dummy.position.copy(p); dummy.lookAt(p.clone().add(tg)); dummy.rotateY(Math.PI / 2); dummy.rotateX(i % 2 ? Math.PI / 2 : 0); dummy.updateMatrix(); link.setMatrixAt(i, dummy.matrix); }
  pw.add(link);
  pw.rotation.y = .3; place(pw, -4.25, 1.65, .3); REF.watch = pw;
}
{
  const hg = new THREE.Group();
  [0, 1.1].forEach(y => { const d = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .08, 6), MAT.darkWood); d.position.y = y + .04; hg.add(d); });
  for (let i = 0; i < 3; i++) { const a = i / 3 * 6.28; const p = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.1, 8), MAT.darkWood); p.position.set(Math.cos(a) * .35, .59, Math.sin(a) * .35); hg.add(p); }
  const gp = []; for (let i = 0; i <= 20; i++) { const t = i / 20, y = .08 + t * 1.02, r = .05 + Math.pow(Math.abs(t - .5) * 2, 1.4) * .25; gp.push([r, y]); }
  hg.add(new THREE.Mesh(lathe(gp, 40), MAT.glass));
  const sand = new THREE.MeshStandardMaterial({ color: 0xe0b870, roughness: 1 });
  const s1 = new THREE.Mesh(new THREE.ConeGeometry(.24, .26, 32), sand); s1.position.y = .21; hg.add(s1);
  const s2 = new THREE.Mesh(new THREE.CylinderGeometry(.22, .06, .2, 32), sand); s2.position.y = .74; hg.add(s2);
  // re-centre the hourglass on a pivot so it can flip over
  const kids = [...hg.children]; const inner = new THREE.Group(); inner.position.y = -.6; kids.forEach(k => inner.add(k)); const piv = new THREE.Group(); piv.position.y = .6; piv.add(inner); hg.add(piv); REF.hgPivot = piv;
  place(hg, -5.35, -1.45); REF.hourglass = hg;
}

// --- magnifier, keys, scroll -------------------------------------------------------------------------
{
  const mg = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.5, .055, 16, 64), MAT.brass); rim.rotation.x = Math.PI / 2; rim.position.y = .06; mg.add(rim);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(.48, .48, .03, 64), new THREE.MeshPhysicalMaterial({ color: 0xcfe8ff, roughness: .1, transparent: true, opacity: .14, depthWrite: false })); lens.position.y = .06; mg.add(lens);
  const h = new THREE.Mesh(new THREE.CylinderGeometry(.065, .08, 1.0, 20), MAT.darkWood); h.rotation.z = Math.PI / 2; h.position.set(1.05, .07, 0); mg.add(h);
  const ferr = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .14, 20), MAT.brass); ferr.rotation.z = Math.PI / 2; ferr.position.set(.58, .07, 0); mg.add(ferr);
  place(mg, .9, 2.95, .35); REF.magnifier = mg;
}
{
  const ks = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.22, .025, 10, 40), MAT.brassDark); ring.rotation.x = Math.PI / 2; ring.position.y = .03; ks.add(ring);
  [[.0, 0], [.9, 1], [-.7, 2]].forEach(([a, i]) => {
    const k = new THREE.Group();
    const bow = new THREE.Mesh(new THREE.TorusGeometry(.11, .028, 10, 28), MAT.brass); bow.rotation.x = Math.PI / 2; k.add(bow);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .75, 10), MAT.brass); sh.rotation.z = Math.PI / 2; sh.position.x = .48; k.add(sh);
    [[.72, .08], [.8, .11], [.64, .06]].forEach(([x, l]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(.05, .03, l), MAT.brass); b.position.set(x, 0, l / 2); k.add(b); });
    k.position.set(Math.cos(a) * .22, .04 + i * .015, Math.sin(a) * .22); k.rotation.y = -a; ks.add(k);
  });
  place(ks, -1.35, 3.0, .2); REF.keys = ks;
}
{
  const sc = new THREE.Group();
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, 1.9, 32, 1, true), new THREE.MeshStandardMaterial({ map: paperAlb, color: 0xd8c49a, roughness: .9, side: THREE.DoubleSide })); roll.rotation.z = Math.PI / 2; roll.position.y = .16; sc.add(roll);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, 1.92, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xb8a070, roughness: .9, side: THREE.DoubleSide })); inner.rotation.z = Math.PI / 2; inner.position.y = .16; sc.add(inner);
  const rib = new THREE.Mesh(new THREE.TorusGeometry(.175, .03, 8, 32), new THREE.MeshStandardMaterial({ color: 0x8e1f1c, roughness: .5 })); rib.rotation.y = Math.PI / 2; rib.position.y = .16; sc.add(rib);
  const sheetG = new THREE.PlaneGeometry(1.8, 1.4); sheetG.translate(0, -.7, 0); const sheet = new THREE.Mesh(sheetG, new THREE.MeshStandardMaterial({ map: paperAlb, color: 0xe8d4a8, roughness: .95, side: THREE.DoubleSide, alphaTest: .5 })); sheet.rotation.x = -Math.PI / 2; sheet.position.set(0, .02, -.02); sheet.scale.z = .001; sheet.visible = false; const sheetPivot = new THREE.Group(); sheetPivot.add(sheet); sc.add(sheetPivot);
  place(sc, -3.5, 2.75, -.25); REF.scroll = sc; REF.scrollSheet = sheetPivot; sheetPivot.visible = false; sheetPivot.scale.z = .001;
}

// small details: wax drips & crumbs on paper
for (let i = 0; i < 12; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(R(.03, .07), 12, 8), MAT.wax); d.scale.y = .25; d.position.set(R(3.45, 4.2), .02, R(-2.6, -1.9)); scene.add(shadowy(d)); }
for (let i = 0; i < 30; i++) { const d = new THREE.Mesh(new THREE.DodecahedronGeometry(R(.012, .035), 0), new THREE.MeshStandardMaterial({ color: Math.random() < .5 ? 0xa86a30 : 0x6a3a14, roughness: 1 })); d.position.set(R(3.5, 4.6), .02, R(2.6, 3.2)); d.rotation.set(R(0, 3), R(0, 3), 0); scene.add(shadowy(d)); }

// =====================================================================
// OPENING SET: the room behind the desk and Fabian himself
// =====================================================================
const wallTex = canvasTex(2048, 1024, (g, w, h) => {
  // dark plastered wall with a tall window
  g.fillStyle = "#1c130d"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? "120,90,60" : "0,0,0"},${Math.random() * .06})`; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
  const wx = 690, wy = 70, ww = 668, wh = 620;
  const sky = g.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, "#0b1530"); sky.addColorStop(.6, "#1d2f5a"); sky.addColorStop(1, "#4a4a6a"); g.fillStyle = sky; g.fillRect(wx, wy, ww, wh);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,250,230,${Math.random() * .8})`; g.beginPath(); g.arc(wx + Math.random() * ww, wy + Math.random() * wh * .6, Math.random() * 1.6 + .3, 0, 7); g.fill(); }
  const mg = g.createRadialGradient(wx + 500, wy + 140, 0, wx + 500, wy + 140, 120); mg.addColorStop(0, "rgba(255,240,200,.5)"); mg.addColorStop(1, "rgba(255,240,200,0)"); g.fillStyle = mg; g.fillRect(wx, wy, ww, wh);
  g.fillStyle = "#fff4d8"; g.beginPath(); g.arc(wx + 500, wy + 140, 34, 0, 7); g.fill(); g.fillStyle = "#1d2f5a"; g.beginPath(); g.arc(wx + 516, wy + 130, 30, 0, 7); g.fill();
  // distant hills with a little town and lit windows
  g.fillStyle = "#121a30"; g.beginPath(); g.moveTo(wx, wy + wh); for (let x = 0; x <= ww; x += 20) g.lineTo(wx + x, wy + wh - 160 - Math.sin(x / 90) * 40 - Math.sin(x / 33) * 12); g.lineTo(wx + ww, wy + wh); g.fill();
  for (let i = 0; i < 40; i++) { const x = wx + 30 + Math.random() * (ww - 60), y = wy + wh - 90 - Math.random() * 70; g.fillStyle = "#0c1224"; g.fillRect(x, y, 26, 40); if (Math.random() < .7) { g.fillStyle = "rgba(255,200,110,.9)"; g.fillRect(x + 8, y + 10, 6, 8); } }
  // frame and mullions
  g.strokeStyle = "#3a2414"; g.lineWidth = 26; g.strokeRect(wx, wy, ww, wh); g.lineWidth = 14; g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh * .45); g.lineTo(wx + ww, wy + wh * .45); g.stroke();
  g.fillStyle = "#4a2e1a"; g.fillRect(wx - 40, wy + wh, ww + 80, 26);
  // pinned sketches on the wall
  const pin = (x, y, r, draw) => { g.save(); g.translate(x, y); g.rotate(r); g.fillStyle = "#d9c9a4"; g.fillRect(-110, -140, 220, 280); g.strokeStyle = "#3a2a1c"; g.lineWidth = 4; draw(); g.fillStyle = "#8e1f1c"; g.beginPath(); g.arc(0, -126, 9, 0, 7); g.fill(); g.restore(); };
  pin(360, 360, -.06, () => { g.beginPath(); g.moveTo(-60, 60); g.lineTo(0, -60); g.lineTo(60, 60); g.closePath(); g.stroke(); g.beginPath(); g.arc(0, 10, 24, 0, 7); g.stroke(); g.font = "34px Caveat"; g.fillStyle = "#3a2a1c"; g.fillText("ideas", -36, 110); });
  pin(1690, 330, .05, () => { g.strokeRect(-70, -70, 60, 60); g.strokeRect(10, -70, 60, 60); g.strokeRect(-70, 10, 60, 60); g.fillStyle = "#3a2a1c"; g.fillRect(20, 20, 20, 20); g.fillRect(50, 50, 20, 20); g.font = "34px Caveat"; g.fillText("QR", -20, 120); });
});
const winGlow = canvasTex(2048, 1024, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.drawImage(wallTex.image, 703, 83, 642, 594, 703, 83, 642, 594); });
const wall = new THREE.Mesh(new THREE.PlaneGeometry(26, 13), new THREE.MeshStandardMaterial({ map: wallTex, emissiveMap: winGlow, emissive: 0xffffff, emissiveIntensity: 1.1, roughness: 1, color: 0x9a8a80 }));
wall.position.set(0, 5.2, -7.2); wall.receiveShadow = true; scene.add(wall);
const sill = new THREE.Mesh(new THREE.BoxGeometry(26, 1.2, 1.4), new THREE.MeshStandardMaterial({ map: tex("tex/darkwood_paint.jpg"), roughness: .7, color: 0x8a6a50 })); sill.position.set(0, -.55, -6.6); scene.add(sill);
const moonLight = new THREE.SpotLight(0x8aa4ff, 0, 14, .5, .9, 1.2); moonLight.position.set(0, 4.6, -6.8); moonLight.target.position.set(1.4, 2.0, -3.6); scene.add(moonLight, moonLight.target);

const charTex = tex("img/fabian-char.webp");
const CH_H = 4.3, CH_W = CH_H * 982 / 1079;
const charGeo = new THREE.PlaneGeometry(CH_W, CH_H); charGeo.translate(0, CH_H / 2, 0);
const charMat = new THREE.MeshStandardMaterial({ map: charTex, emissiveMap: charTex, emissive: 0xffffff, emissiveIntensity: .16, roughness: 1, transparent: true, alphaTest: .04 });
const fabian = new THREE.Mesh(charGeo, charMat); fabian.position.set(1.45, -.08, -3.95); fabian.castShadow = true; scene.add(fabian);
fabian.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: charTex, alphaTest: .5 });
const charLight = new THREE.SpotLight(0xffc887, 0, 16, .42, .7, 1.3); charLight.position.set(-2.5, 4.2, 2.2); charLight.target.position.set(1.45, 2.2, -3.95); scene.add(charLight, charLight.target);
const OPEN = { char: 1 };

// =====================================================================
// GLOVED HANDS
// =====================================================================
function capsuleSeg(r, len) { const g = new THREE.CapsuleGeometry(r, len, 8, 16); g.rotateX(Math.PI / 2); g.translate(0, 0, -len / 2); return g; }
function fingerChain(segs, r, curls, mat) {
  const root = new THREE.Group(); let parent = root; const joints = [];
  segs.forEach((len, i) => {
    const j = new THREE.Group(); j.rotation.x = curls[i] || 0; parent.add(j);
    const m = new THREE.Mesh(capsuleSeg(r * (1 - i * .07), len), mat); j.add(m);
    if (i > 0 && fingerChain.crease) { const c = new THREE.Mesh(new THREE.TorusGeometry(r * (1 - i * .07) * 1.01, .009, 6, 24), fingerChain.crease); j.add(c); }
    const tip = new THREE.Group(); tip.position.z = -len; j.add(tip); parent = tip; joints.push(j);
  });
  root.userData.joints = joints; root.userData.tip = parent; return root;
}
function stitchRing(r, z, mat) { const t = new THREE.Mesh(new THREE.TorusGeometry(r, .006, 4, 40), mat); t.position.z = z; return t; }
const LOGO_TEX = tex("img/logo.webp");
fingerChain.crease = new THREE.MeshStandardMaterial({ color: 0x5c3218, roughness: .55, normalMap: leatherN, normalScale: new V2(.4, .4) });
function makeHand(pose) {
  const hand = new THREE.Group(); const inner = new THREE.Group(); hand.add(inner);
  const mat = MAT.glove;
  // palm: a squashed, slightly cupped volume
  const palmGeo = new THREE.SphereGeometry(1, 48, 32); const p = palmGeo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); p.setXYZ(i, x * .38 * (1 - z * .08), y * (y > 0 ? .17 : .12) + x * x * .03, z * .44); }
  palmGeo.computeVertexNormals();
  const palm = new THREE.Mesh(palmGeo, mat); palm.position.set(0, 0, -.42); inner.add(palm);
  // knuckle ridge
  const kn = new THREE.Mesh(new THREE.CapsuleGeometry(.1, .52, 6, 16), mat); kn.rotation.z = Math.PI / 2; kn.position.set(0, .03, -.76); kn.scale.set(1, 1, .9); inner.add(kn);
  const xs = [-.25, -.085, .085, .24], lens = [[.3, .21, .17], [.34, .23, .18], [.31, .21, .16], [.24, .16, .13]], rs = [.083, .086, .08, .07];
  const fingers = [];
  xs.forEach((x, i) => {
    const f = fingerChain(lens[i], rs[i], pose.curl[i], mat); f.position.set(x, .02, -.78); f.rotation.y = pose.spread[i]; f.rotation.x = pose.base[i] || 0; inner.add(f); fingers.push(f);
  });
  const thumb = fingerChain([.26, .2], .09, pose.thumbCurl, mat); thumb.position.set(-.33, -.02, -.32); thumb.rotation.set(pose.thumbRot[0], pose.thumbRot[1], pose.thumbRot[2]); inner.add(thumb);
  // stitching on the back of the glove
  const stitchMat = new THREE.MeshStandardMaterial({ color: 0xf2d6a0, roughness: .7 });
  [-.12, .02, .16].forEach(x => { for (let k = 0; k < 7; k++) { const s = new THREE.Mesh(new THREE.CapsuleGeometry(.008, .028, 2, 6), stitchMat); s.rotation.x = Math.PI / 2; s.position.set(x + k * .004, .165 - Math.abs(x) * .05 - k * .002, -.25 - k * .07); inner.add(s); } });
  // cuff
  const cuff = new THREE.Mesh(lathe([[.3, -.05], [.36, .1], [.42, .35], [.44, .38], [.4, .4]], 48), mat); cuff.rotation.x = Math.PI / 2; cuff.position.z = -.06; cuff.scale.y = .75; inner.add(cuff);
  { const sr = stitchRing(.39, .22, stitchMat); sr.scale.set(1, .75, 1); inner.add(sr); }
  // details: darker leather piping on the cuff edge, stitches over the knuckles, a strap with a brass buckle, a logo stud
  const dark = fingerChain.crease;
  for (let k = 0; k < 13; k++) { const x = -.27 + k * .045; const st = new THREE.Mesh(new THREE.CapsuleGeometry(.007, .022, 2, 6), stitchMat); st.rotation.z = Math.PI / 2; st.position.set(x, .118 - x * x * .25, -.66); inner.add(st); }
  { const band = new THREE.Mesh(new THREE.CylinderGeometry(.372, .366, .075, 56, 1, true), new THREE.MeshStandardMaterial({ color: 0x5c3218, roughness: .55, normalMap: leatherN, side: THREE.DoubleSide })); band.rotation.x = Math.PI / 2; band.position.z = .06; inner.add(band);
    const buckle = new THREE.Mesh(new THREE.TorusGeometry(.058, .012, 6, 4), MAT.brass); buckle.rotation.set(Math.PI / 2, 0, Math.PI / 4); buckle.position.set(0, .384, .06); buckle.scale.set(1.25, 1, 1); inner.add(buckle);
    const prong = new THREE.Mesh(new THREE.CylinderGeometry(.007, .007, .09, 6), MAT.brass); prong.rotation.z = Math.PI / 2; prong.position.set(0, .388, .06); inner.add(prong); }
  { const stud = new THREE.Mesh(new THREE.CylinderGeometry(.07, .075, .02, 32), MAT.brass); stud.position.set(-.14, .37, .22); stud.rotation.z = .36; inner.add(stud);
    const face = new THREE.Mesh(new THREE.CircleGeometry(.068, 32), new THREE.MeshStandardMaterial({ map: LOGO_TEX, transparent: true, alphaTest: .25, metalness: .9, roughness: .3, color: 0xffe2a8 })); face.rotation.x = -Math.PI / 2; face.position.y = .0105; stud.add(face); }
  // no sleeve: the glove ends at its flared leather cuff, so nothing dark blocks the view
  hand.userData = { inner, fingers, thumb };
  return shadowy(hand);
}
const pointPose = { curl: [[.05, -.05, -.05], [-1.35, -1.45, -1.1], [-1.4, -1.45, -1.1], [-1.35, -1.4, -1.0]], spread: [.03, 0, -.03, -.08], base: [.04, .1, .1, .1], thumbCurl: [-.2, -.35], thumbRot: [-.1, .85, .5] };
const flatPose = { curl: [[.02, -.06, -.06], [.0, -.05, -.06], [.0, -.06, -.06], [.02, -.08, -.08]], spread: [.2, .05, -.1, -.28], base: [-.06, -.06, -.06, -.05], thumbCurl: [-.05, -.15], thumbRot: [.1, 1.05, .25] };
const rightHand = makeHand(pointPose); scene.add(rightHand);
// put the index fingertip at the hand origin
rightHand.updateMatrixWorld(true);
const tipW = new V3(); rightHand.userData.fingers[0].userData.tip.getWorldPosition(tipW);
rightHand.userData.inner.position.sub(rightHand.worldToLocal(tipW.clone()));
const leftHand = makeHand(flatPose); leftHand.scale.x = -1; scene.add(leftHand);

// =====================================================================
// POST PROCESSING
// =====================================================================
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new V2(innerWidth / 2, innerHeight / 2), .45, .6, .9); composer.addPass(bloom);
composer.addPass(new OutputPass());
const finalPass = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, res: { value: new V2(innerWidth, innerHeight) }, vig: { value: 1 }, focusY: { value: .5 }, blurAmt: { value: 1 }, fade: { value: 0 }, bars: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time,vig,focusY,blurAmt,fade,bars; uniform vec2 res; varying vec2 vUv;
    float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    void main(){
      vec2 uv=vUv; vec2 c=uv-.5;
      float dof=smoothstep(.3,.75,length(vec2(c.x*.8,(uv.y-focusY)*1.15)))*blurAmt;
      vec3 col=vec3(0.); float tot=0.;
      for(int i=0;i<12;i++){ float a=float(i)*2.39996; float r=sqrt(float(i)/12.)*dof*3.2; vec2 o=vec2(cos(a),sin(a))*r/res; col+=texture2D(tDiffuse,uv+o).rgb; tot+=1.; }
      col/=tot;
      // subtle chromatic aberration at the edges
      float ca=length(c)*.0025; col.r=mix(col.r,texture2D(tDiffuse,uv+c*ca).r,.6); col.b=mix(col.b,texture2D(tDiffuse,uv-c*ca).b,.6);
      // warm grade: lift shadows to brown, keep highlights creamy
      float lu=dot(col,vec3(.299,.587,.114)); col=mix(vec3(lu),col,1.18); col=pow(col,vec3(.96,1.,1.06)); col+=vec3(.018,.008,.0)*(1.-col);
      float v=1.-dot(c*vec2(1.05,1.25),c*vec2(1.05,1.25))*1.25*vig; col*=clamp(v,0.,1.);
      col+=(h(uv*res+fract(time)*100.)-.5)*.025;
      col*=1.-fade;
      if(abs(uv.y-.5)>.5-bars) col=vec3(0.);
      gl_FragColor=vec4(col,1.);
    }`
});
composer.addPass(finalPass);

// =====================================================================
// DUST MOTES
// =====================================================================
const dustGeo = new THREE.BufferGeometry(); const DN = 420; const dp = new Float32Array(DN * 3), dsd = new Float32Array(DN);
for (let i = 0; i < DN; i++) { dp[i * 3] = R(-6, 6); dp[i * 3 + 1] = R(.3, 6); dp[i * 3 + 2] = R(-4, 4); dsd[i] = R(0, 100); }
dustGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3)); dustGeo.setAttribute("seed", new THREE.BufferAttribute(dsd, 1));
const dustMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { t: { value: 0 }, L: { value: 0 }, lp: { value: new V3() } },
  vertexShader: `attribute float seed; uniform float t; uniform vec3 lp; varying float a; void main(){ vec3 p=position; p.x+=sin(t*.15+seed)*.4; p.y+=mod(t*.05+seed,6.)-3.+sin(t*.3+seed)*.2; p.z+=cos(t*.12+seed*1.3)*.4;
    vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=(18./-mv.z)*(.6+fract(seed*7.3));
    float d=length(p.xz-vec2(-.3,-.4)); float d2=length(p-lp); a=smoothstep(4.5,0.,d)*.6+smoothstep(2.,0.,d2)*.8; }`,
  fragmentShader: `uniform float L; varying float a; void main(){ float r=length(gl_PointCoord-.5); float s=smoothstep(.5,0.,r); gl_FragColor=vec4(vec3(1.,.85,.6),s*a*L*.55); }`
});
scene.add(new THREE.Points(dustGeo, dustMat));

// =====================================================================
// STATE, POINTER, CAMERA
// =====================================================================
export const S = { phase: "load", L: 0, lampK: 0, handOn: 0, press: 0, leftOut: 0, hover: null, focus: 0 };
const pointer = { nx: .25, ny: .55, has: false, down: false, world: new V3(1.6, 0, 1.4), target: new V3(1.6, 0, 1.4) };
const ray = new THREE.Raycaster(); const plane = new THREE.Plane(new V3(0, 1, 0), 0);
addEventListener("pointermove", e => { pointer.nx = e.clientX / innerWidth; pointer.ny = e.clientY / innerHeight; pointer.has = true;
  // over the side bar or any button the visitor gets their normal mouse; the glove only lives above the desk
  S.overUI = !!(e.target.closest && e.target.closest("#side, #sidefold, #modeSwitch, header, .ui, #links, .pp-side, #quickview, #casestudy, #lightbox, #skillcard, #pp-info")); });
document.documentElement.addEventListener("pointerleave", () => { S.overUI = true; });
addEventListener("pointerdown", e => { pointer.down = true; if (e.target.closest && e.target.closest(".ui, header, #side, #sidefold, #modeSwitch, #quickview, #casestudy, #lightbox, .pp-side, #pp-info")) return; onClick(); });
addEventListener("pointerup", () => { pointer.down = false; });
function pointerOnTable() { ray.setFromCamera(new V2(pointer.nx * 2 - 1, -(pointer.ny * 2 - 1)), camera); const p = new V3(); return ray.ray.intersectPlane(plane, p) ? p : null; }

let camAnim = null;
const camLook = CAM_HOME.look.clone();
export function moveCamera(pos, look, dur, e = "io") {
  const p0 = camera.position.clone(), l0 = camLook.clone();
  return tween(dur, k => { camera.position.lerpVectors(p0, pos, k); camLook.lerpVectors(l0, look, k); camera.lookAt(camLook); }, e);
}

// tweens --------------------------------------------------------------------------------------
let tweens = [];
export function tween(dur, fn, e = "io", delay = 0) { return new Promise(res => tweens.push({ s: performance.now() + delay * 1000, d: dur * 1000, fn, e: ease[e] || ease.io, res })); }
export const wait = s => tween(s, () => { }, "lin");
function stepTweens(now) { tweens = tweens.filter(t => { const k = (now - t.s) / t.d; if (k < 0) return true; const c = Math.min(1, k); t.fn(t.e(c), c); if (c >= 1) { t.res(); return false; } return true; }); }

// =====================================================================
// INK: name, start note, map
// =====================================================================
const map3d = buildMap(inkG, PAPER), mapC = buildMapClassic(inkG, PAPER);
const map = map3d; const curMap = () => MODE === "classic" ? mapC : map3d;
// ---- 3D relief: when the map is drawn, its islands rise gently out of the paper
const RELIEF = (() => {
  const P = pg.attributes.position, base = new Float32Array(P.count), hgt = new Float32Array(P.count);
  const MW = 512, MH = 350, img = mapC.heightMask(MW, MH).data;
  for (let i = 0; i < P.count; i++) {
    base[i] = P.getZ(i);
    const u = P.getX(i) / PAPER.w + .5, v = .5 - P.getY(i) / PAPER.h;
    const x = Math.min(MW - 1, Math.max(0, Math.round(u * (MW - 1)))), y = Math.min(MH - 1, Math.max(0, Math.round(v * (MH - 1))));
    const m = img[(y * MW + x) * 4] / 255; hgt[i] = m * m * (3 - 2 * m);   // smooth slopes along the coast
  }
  return { base, hgt, k: 0, cur: 0, img, MW, MH };
})();
// world height of the map surface at a map pixel, with the islands fully raised
function heightAt(px, py) {
  const x = Math.min(RELIEF.MW - 1, Math.max(0, Math.round(px / PAPER.px * (RELIEF.MW - 1)))), y = Math.min(RELIEF.MH - 1, Math.max(0, Math.round(py / PAPER.py * (RELIEF.MH - 1))));
  const m = RELIEF.img[(y * RELIEF.MW + x) * 4] / 255; return .026 + m * m * (3 - 2 * m) * .12;
}
// the map sheet can be rolled up: k = 0 rolled at the far edge, k = 1 lying flat
const ROLL = (() => { const P = pg.attributes.position, by = new Float32Array(P.count); for (let i = 0; i < P.count; i++) by[i] = P.getY(i); return { by, k: 1 }; })();
function setRoll(k) {
  if (Math.abs(k - ROLL.k) < .0005 && k !== 1) return; ROLL.k = k;
  const P = pg.attributes.position, H = PAPER.h, yf = H / 2 - k * (H + .6), r = .14;
  for (let i = 0; i < P.count; i++) {
    const y = ROLL.by[i], z0 = RELIEF.base[i] + RELIEF.hgt[i] * .12 * RELIEF.k;
    if (k >= 1 || y >= yf) { P.setY(i, y); P.setZ(i, z0); continue; }
    const th = (yf - y) / r; P.setY(i, yf - r * Math.sin(th)); P.setZ(i, z0 + r * (1 - Math.cos(th)));
  }
  P.needsUpdate = true; pg.computeVertexNormals();
}
function setRelief(k) { // only the classic map lifts its islands out of the paper; the 3D map has real islands
  if (Math.abs(k - RELIEF.k) < .004 || ROLL.k < 1) return; RELIEF.k = k;
  const P = pg.attributes.position; for (let i = 0; i < P.count; i++) P.setZ(i, RELIEF.base[i] + RELIEF.hgt[i] * .12 * k);
  P.needsUpdate = true; pg.computeVertexNormals();
}
const INK = { title: 0, titleFade: 1, sub: 0, start: 0, map: 0 };
function drawInk() {
  inkG.clearRect(0, 0, ink.width, ink.height);
  curMap().drawBase(inkG);
  // the name: a thin debossed edge where the foil was pressed into the paper
  if (INK.title > 0 && INK.titleFade > 0) {
    inkG.save(); inkG.globalAlpha = INK.titleFade * .55;
    inkG.beginPath(); inkG.rect(0, 0, 2048 * Math.min(1, INK.title * 2), 520); inkG.rect(0, 520, 2048 * clamp(INK.title * 2 - 1, 0, 1), 900); inkG.clip();
    inkG.filter = "blur(2px)"; inkG.translate(2, 3); drawNameShape(inkG, "rgba(70,40,12,.85)", "rgba(70,40,12,.85)"); inkG.filter = "none";
    inkG.restore();
    if (INK.sub > 0) { inkG.save(); inkG.globalAlpha = INK.sub * INK.titleFade; inkG.font = "70px Caveat"; inkG.fillStyle = "#3a2414"; inkG.textAlign = "center"; inkG.translate(1024, 830); inkG.rotate(-.02); inkG.fillText("creative software developer  ·  portfolio", 0, 0); inkG.restore(); }
  }
  if (INK.map > 0) curMap().draw(inkG, INK.map, S.hover, performance.now());
  // the islands only stand up on the map view; when a book or the trunk lies on the paper, the map flattens
  const reliefTarget = (S.phase === "hub" || S.phase === "await" || S.phase === "intro" || S.phase === "tour") ? Math.min(1, Math.max(0, (INK.map - .25) / .6)) : 0;
  RELIEF.cur += (reliefTarget - RELIEF.cur) * (reliefTarget < RELIEF.cur ? .25 : .06); setRelief(MODE === "classic" && RELIEF.cur >= .003 ? RELIEF.cur : 0);
  inkTex.needsUpdate = true;
}

// gold-foil name ----------------------------------------------------------------------------------
const nameC = document.createElement("canvas"); nameC.width = PAPER.px; nameC.height = PAPER.py;
function drawNameShape(g, fill, stroke) {
  g.save(); g.translate(1024, 520); g.rotate(-.025); g.translate(-1024, -520);
  g.fillStyle = fill; g.textAlign = "center";
  g.font = "900 230px 'Cinzel Decorative'"; g.fillText("Fabian", 1024, 366); g.font = "700 170px 'Cinzel Decorative'"; g.fillText("Corsalini", 1024, 626);
  g.strokeStyle = stroke; g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); g.moveTo(560, 706); g.bezierCurveTo(800, 666, 1250, 756, 1490, 696); g.stroke();
  g.beginPath(); g.arc(1024, 706, 12, 0, 7); g.fill(); g.restore();
}
function drawNameCanvas() { const g = nameC.getContext("2d"); g.clearRect(0, 0, nameC.width, nameC.height); drawNameShape(g, "#fff", "#fff"); }
const nameAlpha = new THREE.CanvasTexture(nameC); const nameBump = new THREE.CanvasTexture(nameC);
const goldMat = new THREE.MeshStandardMaterial({ color: 0xe8b54e, metalness: .85, roughness: .34, alphaMap: nameAlpha, transparent: true, bumpMap: nameBump, bumpScale: 4, emissive: 0x3a2000, emissiveIntensity: .25, depthWrite: false });
goldMat.userData.u = { uReveal: { value: 0 }, uTime: { value: 0 }, uFade: { value: 1 } };
goldMat.onBeforeCompile = sh => {
  Object.assign(sh.uniforms, goldMat.userData.u);
  sh.fragmentShader = "uniform float uReveal; uniform float uTime; uniform float uFade;\n" + sh.fragmentShader
    .replace("#include <alphamap_fragment>", `#include <alphamap_fragment>
      float rv = vAlphaMapUv.y > .723 ? clamp(uReveal * 2., 0., 1.) : clamp(uReveal * 2. - 1., 0., 1.);
      float edge = (vAlphaMapUv.x - .12) / .76;
      if (edge > rv) discard;
      diffuseColor.a *= uFade;`)
    .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
      float band = smoothstep(.09, 0., abs(vAlphaMapUv.x - fract(uTime * .16) * 1.6 + .3 - vAlphaMapUv.y * .25));
      float hot = smoothstep(.04, 0., rv - edge) * step(edge, rv);
      totalEmissiveRadiance += vec3(1., .78, .4) * (band * .9 + hot * 2.5);`);
};
goldMat.polygonOffset = true; goldMat.polygonOffsetFactor = -4; goldMat.normalMap = paperN; goldMat.normalScale = new V2(.5, .5);
const goldName = new THREE.Mesh(pg, goldMat); goldName.rotation.x = -Math.PI / 2; goldName.position.y = .003; goldName.renderOrder = 5; goldName.receiveShadow = true; scene.add(goldName);
// sparks that fly off the nib while it writes in gold
const sparkGeo = new THREE.BufferGeometry(); const SPN = 120; const spP = new Float32Array(SPN * 3), spV = [], spL = new Float32Array(SPN);
sparkGeo.setAttribute("position", new THREE.BufferAttribute(spP, 3)); sparkGeo.setAttribute("life", new THREE.BufferAttribute(spL, 1));
for (let i = 0; i < SPN; i++) spV.push(new V3());
const sparks = new THREE.Points(sparkGeo, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `attribute float life; varying float l; void main(){ l=life; vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=(30./-mv.z)*life; }`,
  fragmentShader: `varying float l; void main(){ float r=length(gl_PointCoord-.5); gl_FragColor=vec4(1.,.8,.4,smoothstep(.5,0.,r)*l); }` }));
scene.add(sparks); let sparkI = 0;
function emitSpark(p) { for (let n = 0; n < 2; n++) { const i = sparkI++ % SPN; spP[i * 3] = p.x; spP[i * 3 + 1] = p.y + .05; spP[i * 3 + 2] = p.z; spV[i].set(R(-.6, .6), R(.4, 1.4), R(-.6, .6)); spL[i] = 1; } }
function stepSparks(dt) { for (let i = 0; i < SPN; i++) { if (spL[i] <= 0) continue; spV[i].y -= 2.2 * dt; spP[i * 3] += spV[i].x * dt; spP[i * 3 + 1] = Math.max(.05, spP[i * 3 + 1] + spV[i].y * dt); spP[i * 3 + 2] += spV[i].z * dt; spL[i] -= dt * 1.4; } sparkGeo.attributes.position.needsUpdate = true; sparkGeo.attributes.life.needsUpdate = true; }

// start seal (3D)
const SEAL_AT = [1024, 1215]; const startSeal = waxSeal(.3, "F"); startSeal.position.copy(p2w(...SEAL_AT, 0)); startSeal.visible = false; scene.add(startSeal);
const sealRing = glowSprite(0xffb060, 1.6, 0); sealRing.position.copy(startSeal.position).add(new V3(0, .1, 0)); scene.add(sealRing);

// map hotspots glow
const MINI = buildMiniatures({ THREE, scene, p2w, shadowy, MAT, map, glowSprite });
try { renderer.compile(scene, camera); } catch (e) {}
const spotGlows = MAP_SPOTS.map(s => { const g = glowSprite(0xffc070, 1.4, 0); g.position.copy(p2w(s.x, s.y, .15)); scene.add(g); return g; });

// sections
const cta = document.getElementById("cta"), hubHint = document.getElementById("hubhint");
cta.addEventListener("click", e => { e.stopPropagation(); startTour(); });
const linksEl = document.getElementById("links");
function showLinks(list) { linksEl.innerHTML = ""; list.forEach(([t, href]) => { const a = document.createElement("a"); a.className = "ui link"; a.textContent = t; a.href = href; if (href.startsWith("#nav:")) { a.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); if (active && active.nav) active.nav(+href.slice(5)); }); } else if (href === "#map") { a.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); closeSection(); }); } else if (href.startsWith("#go:")) { a.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); go(href.slice(4)); }); } else if (href.startsWith("#act:")) { a.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); if (active && active.action) active.action(href.slice(5)); }); } else { if (!href.startsWith("mailto")) a.target = "_blank"; a.rel = "noopener"; } linksEl.appendChild(a); }); }
const fastTween = (d, fn, e, delay = 0) => tween(d * (REDUCED ? .2 : .8), fn, e, delay * (REDUCED ? .2 : .8));
const fastCam = (p, l, d, e) => moveCamera(p, l, d * (REDUCED ? .25 : .9), e);
const ctx = { ray: () => { ray.setFromCamera(new V2(pointer.nx * 2 - 1, -(pointer.ny * 2 - 1)), camera); return ray; }, showLinks, THREE, scene, camera, renderer, tween: fastTween, wait, moveCamera: fastCam, MAT, tex, canvasTex, shadowy, waxSeal, glowSprite, leatherN, paperAlb, paperN, R, ease, S, CAM_HOME, lathe, RoundedBoxGeometry, pointer, burst: (...a) => burst(...a) };
document.getElementById("pp-info").addEventListener("click", e => { const b = e.target.closest("[data-nav],[data-act]"); if (!b || !active) return; e.stopPropagation(); if (b.dataset.nav && active.nav) active.nav(+b.dataset.nav); else if (b.dataset.act && active.action) active.action(b.dataset.act); });
document.getElementById("pp-prev").addEventListener("click", e => { e.stopPropagation(); if (active && active.nav) active.nav(-1); });
document.getElementById("pp-next").addEventListener("click", e => { e.stopPropagation(); if (active && active.nav) active.nav(1); });
document.getElementById("casestudy").addEventListener("click", e => { if (e.target.id === "casestudy" || e.target.classList.contains("cs-close")) e.currentTarget.hidden = true; });
const sections = { about: new About(ctx), story: new Story(ctx), built: new Popup(ctx), why: new Why(ctx), letter: new Letter(ctx) };
let active = null;

// =====================================================================
// PARTICLES: coloured bursts for the desk interactions
// =====================================================================
const PN = 700; const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 3), pLife = new Float32Array(PN), pSize = new Float32Array(PN), pVel = Array.from({ length: PN }, () => new V3()), pMeta = Array.from({ length: PN }, () => ({ g: -2, d: 1, f: .98 }));
pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3)); pGeo.setAttribute("life", new THREE.BufferAttribute(pLife, 1)); pGeo.setAttribute("size", new THREE.BufferAttribute(pSize, 1));
const pMatAdd = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `attribute float life; attribute float size; attribute vec3 color; varying float l; varying vec3 c; void main(){ l=life; c=color; vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=(size*230./-mv.z)*clamp(life*1.6,0.,1.); }`,
  fragmentShader: `varying float l; varying vec3 c; void main(){ float r=length(gl_PointCoord-.5); if(r>.5) discard; gl_FragColor=vec4(c,smoothstep(.5,.0,r)*min(l*2.,1.)); }` });
scene.add(new THREE.Points(pGeo, pMatAdd)); let pI = 0;
function burst(pos, o = {}) {
  const n = o.n || 20, col = new THREE.Color(o.color || 0xffd080);
  for (let k = 0; k < n; k++) {
    const i = pI++ % PN; pPos[i * 3] = pos.x + R(-1, 1) * (o.spread || .05); pPos[i * 3 + 1] = pos.y + R(-1, 1) * (o.spread || .05); pPos[i * 3 + 2] = pos.z + R(-1, 1) * (o.spread || .05);
    const a = R(0, Math.PI * 2), sp = (o.speed || 1) * R(.4, 1); pVel[i].set(Math.cos(a) * sp * (o.flat ?? 1), R(o.up?.[0] ?? .5, o.up?.[1] ?? 1.5) * (o.speed || 1), Math.sin(a) * sp * (o.flat ?? 1));
    const c2 = col.clone().offsetHSL(R(-.03, .03), 0, R(-.1, .1)); pCol[i * 3] = c2.r; pCol[i * 3 + 1] = c2.g; pCol[i * 3 + 2] = c2.b;
    pLife[i] = 1; pSize[i] = (o.size || 1) * R(.6, 1.3); pMeta[i] = { g: o.g ?? -2.5, d: 1 / (o.life || 1), f: o.drag ?? .985 };
  }
}
function stepParticles(dt) {
  for (let i = 0; i < PN; i++) { if (pLife[i] <= 0) continue; const m = pMeta[i]; pVel[i].y += m.g * dt; pVel[i].multiplyScalar(m.f);
    pPos[i * 3] += pVel[i].x * dt; pPos[i * 3 + 1] = Math.max(.03, pPos[i * 3 + 1] + pVel[i].y * dt); pPos[i * 3 + 2] += pVel[i].z * dt; pLife[i] -= dt * m.d; }
  pGeo.attributes.position.needsUpdate = true; pGeo.attributes.life.needsUpdate = true; pGeo.attributes.color.needsUpdate = true; pGeo.attributes.size.needsUpdate = true;
}
const wpos = (o, dy = 0) => { const v = new V3(); o.getWorldPosition(v); v.y += dy; return v; };

// =====================================================================
// DESK INTERACTIONS: everything on the table reacts to hover and click
// =====================================================================
export const FX = { flare: 0, steam: 0, needle: 0, watch: 0 };
const INTER = [];
// a calmer desk: only the things that carry the mood stay (candles, map, books, ink, coffee, plant)
const CALM = new Set();
function interactive(obj, label, click) { if (!obj || CALM.has(obj)) return; INTER.push({ obj, label, click, h: 0, y0: obj.position.y, busy: false }); }
const tipEl = document.getElementById("tip");
const bounce = (o, h = .5, d = .7, key = "y0") => tween(d, k => { o.position.y = (o.userData[key] ?? 0) + Math.sin(k * Math.PI) * h; }, "o");
const squash = (o, amt = .25, d = .6) => { const s0 = o.scale.clone(); return tween(d, k => { const q = Math.sin(k * Math.PI * 2.5) * Math.exp(-k * 4) * amt; o.scale.set(s0.x * (1 + q * .5), s0.y * (1 - q), s0.z * (1 + q * .5)); }, "lin").then(() => o.scale.copy(s0)); };
const hop = (o, h, d, key = "y0") => tween(d, k => { o.position.y = (o.userData[key] ?? 0) + Math.sin(Math.min(1, k * 1.15) * Math.PI) * h * (k < .87 ? 1 : 0); }, "o");
[REF.bowl, REF.jar, REF.cork, REF.puddle, ...(REF.drops || []), ...(REF.vials || []), REF.compass, REF.watch, REF.hourglass, REF.magnifier, REF.keys, REF.scroll, REF.scrollSheet, REF.geode, REF.crystal, ...GEMS, ...(REF.coins || []), leftHand].forEach(o => { if (o) { o.visible = false; CALM.add(o); } });
interactive(REF.candelabra, "Brass candelabra", async () => {
  FLAMES.forEach((f, i) => setTimeout(() => burst(wpos(f.mesh, .1), { n: 26, color: 0xffb050, speed: .6, up: [.8, 1.8], g: .6, life: 1.3, size: .7 }), i * 90));
  await tween(1.5, k => { FX.flare = Math.sin(k * Math.PI) * 1.4 * (1 - k * .3); }, "o");
});
interactive(REF.mug, "Coffee", async () => {
  FX.steam = 1.6; squash(REF.mug, .12, .7);
  const p = wpos(REF.mug, .62); for (let r = 0; r < 3; r++) setTimeout(() => burst(p, { n: 22, color: 0x7a4a28, speed: .5, up: [0, .05], flat: 1, g: 0, life: .7, size: .5 }), r * 120);
  await tween(1.0, k => { REF.mug.rotation.z = Math.sin(k * 22) * .07 * (1 - k); }, "lin");
});
interactive(REF.bowl, "Moonberries", async () => {
  BERRY_MESH.forEach((b, i) => { const s0 = b.scale.clone(); tween(.9, k => { const t = Math.max(0, k - i * .04); b.position.y = b.userData.y0 + Math.sin(Math.min(1, t * 1.6) * Math.PI) * (.4 + (i % 3) * .15); const q = t > .6 ? Math.sin((t - .6) * 18) * Math.exp(-(t - .6) * 8) * .25 : 0; b.scale.set(s0.x * (1 + q), s0.y * (1 - q), s0.z * (1 + q)); }, "lin").then(() => b.scale.copy(s0)); });
  burst(wpos(REF.bowl, .7), { n: 40, color: 0xb8ff70, speed: .9, up: [.6, 1.6], g: -.4, life: 1.6, size: .8 });
  await tween(1.4, k => { BERRIES[1].emissiveIntensity = .35 + 2 * Math.sin(k * Math.PI); BERRIES[0].intensity = 1 + 5 * Math.sin(k * Math.PI); }, "o");
});
interactive(REF.jar, "Potion", async () => {
  const c = REF.cork; const top = wpos(REF.jar, 1.3);
  burst(top, { n: 36, color: 0x60ffd0, speed: .7, up: [1, 2.2], g: -1.2, life: 1.4, size: .9 });
  await tween(1.1, k => { c.position.y = 1.26 + Math.sin(k * Math.PI) * 1.4; c.rotation.x = k * Math.PI * 5; c.rotation.z = Math.sin(k * 9) * .4; }, "o"); c.rotation.set(0, 0, 0);
  squash(REF.jar, .1, .5);
  for (let i = 0; i < 6; i++) setTimeout(() => burst(wpos(REF.jar, .4 + i * .12), { n: 6, color: 0xa0fff0, speed: .15, up: [.6, 1], g: .5, life: 1.2, size: .6 }), i * 120);
  await tween(1, k => { POTION[1].emissiveIntensity = 2.6 * (1 - k) + .7; POTION[0].intensity = 6 * (1 - k) + 1.8; }, "o");
});
(REF.vials || []).forEach(v => interactive(v, "Vial", async () => {
  burst(wpos(v, .6), { n: 14, color: v.children[1].material.color.getHex(), speed: .3, up: [.5, 1.2], g: .3, life: 1, size: .6 });
  await tween(.9, k => { v.rotation.z = Math.sin(k * 26) * .3 * (1 - k); v.rotation.x = Math.cos(k * 20) * .18 * (1 - k); v.position.y = Math.abs(Math.sin(k * 13)) * .06 * (1 - k); }, "lin");
}));
interactive(REF.books, "Journals", async () => {
  const b = REF.topBook, e = REF.envelope; const y0 = e.position.y;
  await tween(1.4, k => { const s = Math.sin(k * Math.PI); b.rotation.z = s * .3; b.position.y = .63 + s * .25; e.position.y = y0 + s * .9; e.rotation.z = .25 + k * Math.PI * 2; e.rotation.x = -Math.PI / 2 + s * .5; }, "io");
  e.rotation.set(-Math.PI / 2, 0, .25); squash(REF.books, .06, .5);
});
interactive(REF.compass, "Compass", async () => { FX.needle = 1.4; squash(REF.compass, .08, .5); await wait(2.4); });
interactive(REF.watch, "Pocket watch", async () => {
  hop(REF.watch, .35, .7); burst(wpos(REF.watch, .3), { n: 18, color: 0xffe08a, speed: .7, up: [.5, 1.4], life: 1, size: .6 });
  await tween(1.8, k => { FX.watch = Math.sin(k * Math.PI) * 2.4; }, "io"); FX.watch = 0;
});
interactive(REF.hourglass, "Hourglass", async () => {
  const p = REF.hgPivot; const r0 = p.rotation.z;
  const stream = setInterval(() => burst(wpos(REF.hourglass, .6), { n: 3, color: 0xe8c070, speed: .05, up: [-.6, -.3], g: -1, life: .5, size: .35, spread: .02 }), 40);
  await tween(1.3, k => { p.rotation.z = r0 + ease.el(k) * Math.PI; p.position.y = .6 + Math.sin(Math.min(1, k * 1.4) * Math.PI) * .45; }, "lin");
  setTimeout(() => clearInterval(stream), 900); squash(REF.hourglass, .12, .5);
});
interactive(REF.magnifier, "Magnifying glass", async () => {
  const m = REF.magnifier, r0 = m.rotation.y, y0 = m.position.y;
  await tween(1.4, k => { const s = Math.sin(k * Math.PI); m.position.y = y0 + s * .7; m.rotation.y = r0 + ease.el(k) * Math.PI * 2; m.rotation.x = s * .5; }, "lin");
  burst(wpos(m, .1), { n: 14, color: 0xfff4d0, speed: .4, up: [.2, .8], life: .8, size: .6 });
});
interactive(REF.keys, "Keys", async () => {
  burst(wpos(REF.keys, .1), { n: 12, color: 0xffe2a0, speed: .5, up: [.4, 1], life: .7, size: .5 });
  await tween(1.2, k => { REF.keys.rotation.y = .2 + Math.sin(k * 26) * .35 * Math.exp(-k * 3); REF.keys.position.y = Math.abs(Math.sin(k * 14)) * .12 * Math.exp(-k * 3); REF.keys.children.forEach((c, i) => { if (i) c.rotation.z = Math.sin(k * 30 + i) * .4 * Math.exp(-k * 3); }); }, "lin");
});
interactive(REF.scroll, "Rolled map", async () => {
  const sc = REF.scroll, x0 = sc.position.x, sheet = REF.scrollSheet;
  sheet.visible = true;
  await tween(.9, k => { const e = ease.back(k); sheet.scale.z = Math.max(.001, e); sc.children[0].rotation.x = -k * 6; }, "lin");
  await wait(1.2);
  await tween(.7, k => { sheet.scale.z = Math.max(.001, 1 - ease.io(k)); sc.children[0].rotation.x = -6 + k * 6; }, "lin");
  sheet.visible = false;
});
interactive(REF.plant, "Starbloom", async () => {
  burst(wpos(REF.plant, 1.3), { n: 50, color: 0x9fd8ff, speed: .8, up: [.4, 1.4], g: -.3, life: 2, size: .7, drag: .97 });
  await tween(1.8, k => { REF.plant.children.forEach((c, i) => { if (c.isGroup) c.rotation.z = Math.sin(k * 14 + i) * .16 * Math.exp(-k * 2.5); }); FLOWER[0].intensity = 5 * Math.sin(k * Math.PI); FLOWER[1].emissiveIntensity = .8 + 2.4 * Math.sin(k * Math.PI); }, "lin");
});
interactive(REF.inkwell, "Inkwell", async () => {
  burst(wpos(REF.inkwell, .6), { n: 30, color: 0x3a3aa8, speed: 1.0, up: [1.2, 2.2], g: -4, life: .9, size: .7 });
  squash(REF.inkwell, .15, .6);
  await tween(.8, k => { REF.inkwell.rotation.z = Math.sin(k * 18) * .1 * (1 - k); }, "lin");
});
interactive(REF.geode, "Amethyst geode", async () => {
  burst(wpos(REF.geode, .3), { n: 40, color: 0xc080ff, speed: .7, up: [.6, 1.6], g: -.5, life: 1.5, size: .7 });
  await tween(1.6, k => { REF.crystal.emissiveIntensity = .45 + Math.sin(k * Math.PI) * 3; FLOWER[2].intensity = 5 * Math.sin(k * Math.PI); REF.geode.rotation.y = .4 + Math.sin(k * 20) * .06 * (1 - k); }, "lin");
});
GEMS.forEach(g => interactive(g, "Gemstone", async () => {
  const r0 = g.rotation.y; burst(wpos(g), { n: 16, color: g.material.color.getHex(), speed: .6, up: [.6, 1.4], life: 1, size: .6 });
  await tween(1.0, k => { g.position.y = g.userData.y0 + Math.sin(Math.min(1, k * 1.1) * Math.PI) * .8 * (k < .9 ? 1 : 0); g.rotation.y = r0 + ease.o(k) * Math.PI * 4; }, "lin");
  squash(g, .3, .45);
}));
(REF.coins || []).forEach(c => interactive(c, "Gold coin", async () => {
  const x0 = c.rotation.x;
  await tween(1.0, k => { c.position.y = c.userData.y0 + Math.sin(k * Math.PI) * 1.3; c.rotation.x = x0 + k * Math.PI * 8; }, "lin"); c.rotation.x = x0;
  burst(wpos(c, .05), { n: 14, color: 0xffd060, speed: .7, up: [.2, .7], life: .6, size: .5 });
  await tween(.4, k => { c.position.y = c.userData.y0 + Math.abs(Math.sin(k * Math.PI * 2)) * .08 * (1 - k); }, "lin");
}));
interactive(leftHand, "Wave", async () => { const f = leftHand.userData.fingers; await tween(1.4, k => { const w = Math.sin(k * Math.PI * 4) * .5 * Math.sin(k * Math.PI); f.forEach((fi, i) => fi.userData.joints.forEach(j => j.rotation.x = -Math.max(0, w) * (1 + i * .1))); leftHand.userData.inner.rotation.z = Math.sin(k * Math.PI * 4) * .15 * Math.sin(k * Math.PI); }, "lin"); });
let hovered = null;
function updateHover(dt) {
  const deskPhase = (S.phase === "hub" || S.phase === "await") && !S.overUI;
  let hit = null;
  if (deskPhase) { ray.setFromCamera(new V2(pointer.nx * 2 - 1, -(pointer.ny * 2 - 1)), camera); const hits = ray.intersectObjects(INTER.map(i => i.obj), true);
    if (hits.length) { let o = hits[0].object; while (o && !INTER.find(i => i.obj === o)) o = o.parent; hit = INTER.find(i => i.obj === o) || null; } }
  hovered = hit;
  INTER.forEach(it => { it.h += ((it === hit ? 1 : 0) - it.h) * Math.min(1, dt * 10); if (!it.busy && it.obj !== leftHand) { it.obj.position.y = it.y0 + it.h * .09; } });
  tipEl.classList.remove("on");
}
async function clickObject(it) { if (it.busy) return; it.busy = true; try { await it.click(); } finally { it.busy = false; } }

// =====================================================================
// FLOW
// =====================================================================
const quillTip = new V3();
function setQuill(p, rot = 0, show = true) { quill.visible = show; quill.position.copy(p); quill.rotation.y = rot; }
async function intro() {
  S.phase = "intro"; document.body.classList.add("opening");
  const CAM_OPEN = new V3(-.4, 2.05, 6.3), LOOK_OPEN = new V3(.25, 2.0, -3.9);
  camera.position.copy(CAM_OPEN).add(new V3(0, .2, .8)); camLook.copy(LOOK_OPEN); camera.lookAt(camLook);
  OPEN.char = 1; fabian.visible = true; charMat.opacity = 1; goldName.visible = false; quill.visible = false; startSeal.visible = false;
  setRoll(0); INK.map = 0;
  finalPass.uniforms.bars.value = .1;
  for (let i = 0; i < 3; i++) tween(.45, k => { FLAMES[i].k = k; }, "back", .2 + i * .2);
  tween(1.6, k => { S.L = k * .75; }, "io", .2);
  tween(5.0, k => { camera.position.copy(CAM_OPEN).add(new V3(0, .2 * (1 - k), .8 * (1 - k))); camera.lookAt(camLook); }, "o");
  // the title card: name, role, "portfolio website", next to the character
  const op = document.getElementById("opening"); setTimeout(() => { if (S.phase !== "intro") return; op.hidden = false; requestAnimationFrame(() => op.classList.add("on")); }, 500);
  await wait(2.4); if (S.phase !== "intro") return;
  // the visitor chooses: the 3D world of islands, or the classic hand-drawn map
  const ch = op.querySelector(".choose"); ch.hidden = false; requestAnimationFrame(() => ch.classList.add("on")); document.body.classList.add("choosing");
  const picked = await new Promise(res => ch.querySelectorAll("[data-pick]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); res(b.dataset.pick); }, { once: true })));
  if (S.phase !== "intro") return;
  setMode(picked); ch.classList.remove("on"); document.body.classList.remove("choosing");
  op.classList.remove("on"); setTimeout(() => { op.hidden = true; ch.hidden = true; }, 1000);
  if (/hold/.test(location.search)) { tweens = []; FLAMES.forEach(f => f.k = 1); S.L = .75; camera.position.copy(CAM_OPEN); camera.lookAt(camLook); return; }
  // crane up and over the desk, straight to the map
  document.body.classList.remove("opening");
  const p0 = camera.position.clone(), l0 = camLook.clone();
  const path = new THREE.CatmullRomCurve3([p0, new V3(-.2, 3.9, 6.0), new V3(0, 8.0, 6.6), HUB_CAM.pos.clone()]);
  tween(3.4, k => { camera.position.copy(path.getPoint(k)); camLook.lerpVectors(l0, HUB_CAM.look, ease.io(Math.min(1, k * 1.1))); camera.lookAt(camLook); }, "io");
  tween(1.5, k => { OPEN.char = 1 - k; }, "io", .3);
  tween(2.0, k => { S.L = .75 + k * .25; S.lampK = k; }, "io", .6);
  tween(1.0, k => { finalPass.uniforms.bars.value = .1 * (1 - k); }, "io", 2.0);
  tween(1.2, k => { S.leftOut = k; }, "io", 1.0);
  tween(1.0, k => { S.handOn = k; }, "o", 3.4);
  // the rolled-up map unrolls across the desk as the camera arrives
  await tween(2.2, k => setRoll(k), "io", 1.9); if (S.phase !== "intro") return;
  fabian.visible = false; prepareSections();
  // then the map draws itself and its islands rise
  if (MODE === "3d") {
    await tween(3.0, k => { INK.map = k; }, "lin"); if (S.phase !== "intro") return;
    S.flying = true;
    // fly low over the sea, past the islands, then rise to take in the whole world
    const P = [HUB_CAM.pos.clone(), p2w(300, 1250, 1.9), p2w(700, 980, 1.25), p2w(1200, 900, 1.15), p2w(1750, 820, 1.6), HUB_CAM.pos.clone()];
    const L = [HUB_CAM.look.clone(), p2w(430, 560, .3), p2w(930, 650, .3), p2w(1400, 760, .3), p2w(1640, 360, .4), HUB_CAM.look.clone()];
    const cp = new THREE.CatmullRomCurve3(P), cl = new THREE.CatmullRomCurve3(L);
    await tween(8.5, k => { camera.position.copy(cp.getPoint(k)); camLook.copy(cl.getPoint(k)); camera.lookAt(camLook); }, "io"); S.flying = false; if (S.phase !== "intro") return;
  } else { await tween(4.6, k => { INK.map = k; }, "lin"); if (S.phase !== "intro") return; }
  S.phase = "hub"; document.getElementById("skip").hidden = true; hubHint.hidden = false; store.set("fc-seen", String(Date.now())); markSide(null);
}
function completeIntro() { skipIntro(); }
// build the sections quietly in the background, one at a time, so opening one later is instant
function prepareSections() {
  if (S.prepared) return; S.prepared = true;
  Object.values(sections).forEach((sec, i) => setTimeout(() => {
    if (sec === active || sec.built) return;
    const vis = sec.group.visible; try { sec.build(); } catch (e) { console.warn(e); } sec.group.visible = vis;
  }, 300 + i * 300));
}
// leave the opening shot: no letterbox, no character, no overlay
function endOpening() {
  document.body.classList.remove("opening", "namepaper"); const o = document.getElementById("opening"); if (o) { o.classList.remove("on"); o.hidden = true; }
  fabian.visible = false; OPEN.char = 0; finalPass.uniforms.bars.value = 0;
}

async function startTour() {
  prepareSections();
  if (S.phase === "intro") completeIntro();
  if (S.phase !== "await") return;
  S.phase = "tour"; cta.classList.remove("on"); setTimeout(() => cta.hidden = true, 500);
  if (pointer.world.distanceTo(startSeal.position) > .4) { const from = pointer.world.clone(); S.override = from.clone(); await tween(.7, k => { S.override.lerpVectors(from, startSeal.position, k); }, "io"); }
  setTimeout(() => { S.override = null; }, 900);
  await tween(.16, k => { S.press = k; startSeal.scale.set(1 + k * .06, 1 - k * .35, 1 + k * .06); }, "o");
  tween(.3, k => { S.press = 1 - k; startSeal.scale.set(1.06 - k * .06, .65 + k * .35, 1.06 - k * .06); }, "o");
  tween(.6, k => { sealRing.material.opacity = (1 - k) * 1.5; sealRing.scale.setScalar(1.6 + k * 2.5); }, "o");
  tween(1.2, k => { S.leftOut = k; }, "io", .2);
  document.body.classList.remove("namepaper");
  tween(1.1, k => { INK.titleFade = 1 - k; INK.start = 1 - k; goldMat.userData.u.uFade.value = 1 - k; startSeal.position.y = -k * .3; }, "io", .3);
  // camera lifts a little to take in the whole map
  moveCamera(HUB_CAM.pos, HUB_CAM.look, 2.8, "io");
  await tween(5.8, k => { INK.map = k; }, "lin", .6);
  startSeal.visible = false;
  S.phase = "hub"; document.getElementById("skip").hidden = true; hubHint.hidden = false; store.set("fc-seen", String(Date.now())); markSide(null);
}
async function openSection(id) {
  const fullId = id; let chapter = 0; if (id.includes("@")) { const c = id.split("@")[1]; chapter = isNaN(+c) ? c : +c; id = id.split("@")[0]; }
  if (!sections[id] || S.phase !== "hub") return;
  store.set("fc-last", chapter ? `${id}@${chapter}` : id); markSide(id);
  document.body.classList.add("insec"); S.phase = "section"; active = sections[id]; S.hover = null; hubHint.hidden = true;
  const L = active.light; readLamp.color.set(L.color); readLamp.position.set(...L.pos); readLamp.target.position.set(...L.target); readLamp.angle = L.angle;
  const spot = SPOTS().find(s => s.id === fullId) || SPOTS().find(s => s.id === id); const sp = p2w(spot.x, spot.y);
  if (MODE === "3d") { const isl = p2w(spot.x, spot.y, .15); await moveCamera(isl.clone().add(new V3(0, 2.3, 2.7)), isl, 1.15, "io"); }
  // push in towards the place on the map, then the object arrives
  tween(.6, k => { S.focus = k; }, "io");
  await active.open(sp);
  if (chapter && active.goTo) await active.goTo(chapter);
  S.phase = "inSection";
}
export async function closeSection() {
  if (!active || S.phase !== "inSection") return;
  S.phase = "closing"; showLinks([]);
  tween(.6, k => { S.focus = 1 - k; }, "io");
  const leaving = active.close();
  setTimeout(() => moveCamera(HUB_CAM.pos, HUB_CAM.look, 1.6, "io"), 250);
  await leaving; await wait(.35);
  active = null; S.phase = "hub"; hubHint.hidden = false; document.body.classList.remove("insec"); store.set("fc-last", null); markSide(null);
}
ctx.closeSection = closeSection;
function onClick() {
  if (S.phase === "await") { const p = pointerOnTable(); if (p && p.distanceTo(startSeal.position) < .7) startTour(); else if (hovered) clickObject(hovered); }
  else if (S.phase === "hub" && S.hover) openSection(S.hover);
  else if (S.phase === "hub" && hovered) clickObject(hovered);
  else if (S.phase === "inSection" && active) active.click(ray);
}
addEventListener("keydown", e => {
  if (S.phase === "inSection" && active && active.key) active.key(e.key);
  if (e.key === "Enter" && (S.phase === "await" || S.phase === "intro")) startTour();
});
document.getElementById("skip").addEventListener("click", e => { e.stopPropagation(); skipIntro(); });
function skipIntro() {
  endOpening(); setTimeout(prepareSections, 300); setRoll(1); fabian.visible = false; OPEN.char = 0;
  if (S.phase === "hub" || S.phase === "section" || S.phase === "inSection") return;
  tweens = []; FLAMES.forEach(f => f.k = 1); S.L = 1; S.lampK = 1; S.handOn = 1; S.leftOut = 1; INK.title = 1; INK.titleFade = 0; INK.start = 0; INK.map = 1; goldMat.userData.u.uFade.value = 0; goldName.visible = false; quill.visible = false; startSeal.visible = false;
  finalPass.uniforms.bars.value = 0; camera.position.copy(HUB_CAM.pos); camLook.copy(HUB_CAM.look); camera.lookAt(camLook); S.phase = "hub"; store.set("fc-seen", String(Date.now())); markSide(null); document.getElementById("skip").hidden = true; cta.hidden = true; hubHint.hidden = false;
}
async function go(id) {
  if (["intro", "await", "tour", "load"].includes(S.phase)) skipIntro();
  if (S.phase === "inSection") { if (active === sections[id]) return; await closeSection(); }
  if (S.phase === "hub") openSection(id);
}
document.querySelector("#side .mark").addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); store.set("fc-seen", null); store.set("fc-last", null); location.replace(location.pathname + location.search); });
document.querySelectorAll("[data-map]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); if (!qv.hidden) closeQuick(); if (S.phase === "inSection") closeSection(); }));
const sideBtn = document.getElementById("sidefold");
function foldSide(off) { document.body.classList.toggle("side-off", off); sideBtn.setAttribute("aria-expanded", String(!off)); sideBtn.setAttribute("aria-label", off ? "Show the menu" : "Hide the menu"); try { localStorage.setItem("fc-side-off", off ? "1" : "0"); } catch (e) {} }
sideBtn.addEventListener("click", e => { e.stopPropagation(); foldSide(!document.body.classList.contains("side-off")); });
try { if (localStorage.getItem("fc-side-off") === "1") foldSide(true); } catch (e) {}
function setMode(m) { MODE = m; try { localStorage.setItem("fc-map", MODE); } catch (err) {} document.querySelectorAll("#modeSwitch button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === MODE))); }
// Classic | 3D switch: flips the map style; the map redraws itself in the new style
{
  const sw = document.createElement("div"); sw.id = "modeSwitch"; sw.setAttribute("role", "group"); sw.setAttribute("aria-label", "Map style");
  sw.innerHTML = `<button data-mode="classic">2D</button><button data-mode="3d">3D</button><span class="knob" aria-hidden="true"></span>`;
  document.body.appendChild(sw);
  const mark = () => sw.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === MODE)));
  mark();
  sw.addEventListener("click", e => {
    e.stopPropagation(); setMode(MODE === "3d" ? "classic" : "3d");
    if (S.phase === "hub") { INK.map = .45; tween(2.6, k => { INK.map = .45 + .55 * k; }, "o"); }
  });
}
// light up the side bar item of the place you are in
function markSide(id) { document.querySelectorAll("#side .si").forEach(a => a.classList.toggle("on", id ? a.dataset.go === id : a.hasAttribute("data-map"))); }
document.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); go(b.dataset.go); }));
const qv = document.getElementById("quickview");
function openQuick(e) { if (e) { e.preventDefault(); e.stopPropagation(); } qv.hidden = false; document.body.classList.add("qv"); qv.querySelector(".qv-close").focus(); }
function closeQuick() { qv.hidden = true; document.body.classList.remove("qv"); }
document.querySelectorAll("[data-quick]").forEach(b => b.addEventListener("click", openQuick));
qv.addEventListener("click", e => { if (e.target.closest(".qv-close")) closeQuick(); });
qv.addEventListener("pointerdown", e => e.stopPropagation());
document.getElementById("lightbox").addEventListener("click", e => { e.currentTarget.hidden = true; });
addEventListener("keydown", e => { if (e.key !== "Escape") return; const cs = document.getElementById("casestudy"), lb = document.getElementById("lightbox"); if (!lb.hidden) lb.hidden = true; else if (!qv.hidden) closeQuick(); else if (cs && !cs.hidden) cs.hidden = true; else if (S.phase === "inSection") closeSection(); });
if (location.hash === "#quick-view") openQuick();
window.__app = { map, setRoll, rightHand, completeIntro, INTER, clickObject, go, ray, pointerOnTable, S, skipIntro, openSection, closeSection, startTour, camera, pointer, sections, INK };

// =====================================================================
// FRAME LOOP
// =====================================================================
const clock = new THREE.Clock(); let flick = 0;
// adaptive quality: if the machine struggles, render fewer pixels (never during the intro's first seconds)
const AQ = { t0: performance.now(), n: 0, steps: [Math.min(devicePixelRatio, 1.75), 1.4, 1.15, 1, .85], i: 0, cool: 0 };
function adapt() {
  if (LQ) return; AQ.n++; const now = performance.now(), dt = now - AQ.t0; if (dt < 2000) return;
  const fps = AQ.n * 1000 / dt; AQ.t0 = now; AQ.n = 0; if (document.hidden || --AQ.cool > 0) return;
  const cur = renderer.getPixelRatio();
  if (fps < 42 && AQ.i < AQ.steps.length - 1) { AQ.i++; } else if (fps > 58 && AQ.i > 0 && AQ.steps[AQ.i - 1] <= Math.min(devicePixelRatio, 1.75)) { AQ.i--; AQ.cool = 4; } else return;
  const pr = Math.min(AQ.steps[AQ.i], Math.max(devicePixelRatio, .85)); if (Math.abs(pr - cur) < .01) return;
  renderer.setPixelRatio(pr); composer.setPixelRatio ? composer.setPixelRatio(pr) : 0; composer.setSize(innerWidth, innerHeight);
}
function frame() {
  if (window.__paused) { requestAnimationFrame(frame); return; } // the classic view is showing
  const now = performance.now(), t = clock.getElapsedTime();
  stepTweens(now);
  // candle flicker (smoothed noise, shared so all lights breathe together a bit)
  flick += (Math.random() - .5) * .45; flick *= .82;
  FLAMES.forEach((f, i) => {
    const n = 1 + flick * .22 + Math.sin(t * 13 + i * 2) * .04;
    f.mesh.material.uniforms.t.value = t; f.mesh.material.uniforms.k.value = f.k;
    const fb = 1 + FX.flare; f.mesh.scale.set((1 + flick * .1) * fb, n * fb, 1);
    f.light.intensity = (1 + FX.flare * .8) * f.base * f.k * n * (1 - S.focus * (1 - (active ? active.light.candles : .45)));
    f.glow.material.opacity = f.k * (.55 + flick * .2);
  });
  charMat.opacity = OPEN.char; charLight.intensity = 60 * OPEN.char * S.L; moonLight.intensity = 30 * OPEN.char * S.L + 6 * S.focus;
  if (fabian.visible) fabian.scale.y = 1 + Math.sin(t * 1.4) * .006;
  lamp.intensity = 78 * S.lampK * (1 - S.focus * .82); const AL = active ? active.light : null; readLamp.intensity = (AL ? AL.power : 26) * S.focus; bloom.threshold = .9 + S.focus * .08; bloom.strength = .3 - S.focus * .12;
  const dk = 1 - S.focus * .75; hemi.intensity = .45 * S.L * dk; rim.intensity = 1.1 * S.L * (1 - S.focus) + (active ? active.light.rim : 0) * S.focus; fill.intensity = .35 * S.L * dk; finalPass.uniforms.vig.value = 1 + S.focus * .35; finalPass.uniforms.blurAmt.value = 1 - S.focus * .9;
  scene.environmentIntensity = .32 * (.25 + S.L * .75) * (1 - S.focus * .6);
  const pulse = .5 + Math.sin(t * 1.7) * .5;
  POTION[0].intensity = 1.8 * S.L * (.75 + pulse * .25); POTION[1].emissiveIntensity = .7 + pulse * .4; POTION[2].emissiveIntensity = .5 + pulse * .3;
  BERRIES[0].intensity = 1.0 * S.L * (.7 + Math.sin(t * 2.1 + 1) * .3); BERRIES[1].emissiveIntensity = .35 + Math.sin(t * 2.1 + 1) * .2;
  FLOWER[0].intensity = 1.2 * S.L * (.7 + Math.sin(t * 1.3) * .3); FLOWER[2].intensity = .9 * S.L * (.6 + Math.sin(t * 2.6) * .4);
  GEMS.forEach((g, i) => { g.material.emissiveIntensity = .08 + Math.max(0, Math.sin(t * 2 + i * 1.7)) * .25; });
  // steam from the mug
  FX.steam *= .985; steam.forEach(s => { s.userData.t = (s.userData.t + .0035 * (1 + FX.steam * 3)) % 1; const k = s.userData.t; s.position.set(1.75 + Math.sin(k * 8 + s.id) * .12 * k, .62 + k * 2.2, -2.2 + Math.cos(k * 6 + s.id) * .1); s.scale.setScalar(.25 + k * 1.1); s.material.opacity = Math.sin(k * Math.PI) * .32 * S.L * (1 + FX.steam * 1.5); s.material.rotation = k * 2 + s.id; });
  // compass and watch
  FX.needle *= .975; FX.spin = (FX.spin || 0) + FX.needle * .5; if (FX.needle < .02) FX.spin += (Math.round(FX.spin / (Math.PI * 2)) * Math.PI * 2 - FX.spin) * .05; compassNeedle.rotation.y = -.25 + Math.sin(t * .6) * .12 + Math.sin(t * 2.3) * .03 + FX.spin;
  const d = new Date(); const sec = d.getSeconds() + d.getMilliseconds() / 1000, mn = d.getMinutes() + sec / 60, hr = (d.getHours() % 12) + mn / 60;
  FX.watchT = (FX.watchT || 0) + FX.watch * .5; watchHands.s.rotation.y = -Math.floor(sec) / 60 * Math.PI * 2 - FX.watchT * 4; watchHands.m.rotation.y = -mn / 60 * Math.PI * 2 - FX.watchT; watchHands.h.rotation.y = -hr / 12 * Math.PI * 2 - FX.watchT / 12;
  dustMat.uniforms.t.value = t; dustMat.uniforms.L.value = S.L;

  updateHover(1 / 60); stepParticles(1 / 60);
  // pointer -> hand
  const hit = pointerOnTable();
  if (S.override) pointer.target.copy(S.override); else if (hit && pointer.has) pointer.target.copy(hit);
  pointer.world.lerp(pointer.target, .35);
  const pw = pointer.world;
  dustMat.uniforms.lp.value.set(pw.x, 1, pw.z);
  pointerLight.position.set(pw.x - .4, 1.6, pw.z + .2); pointerLight.intensity = 1.8 * S.handOn * S.L * (1 - S.focus * .7);
  // hover over hotspots
  if (S.phase === "hub") {
    const [px, py] = w2p(pw); let h = null; SPOTS().forEach(s => { if (Math.hypot(px - s.x, py - s.y) < s.r) h = s.id; }); if (MODE === "3d") { const mh = MINI.pick(ctx.ray()); if (mh) h = mh; } S.hover = S.overUI ? null : h; { const sp = SPOTS().find(x => x.id === S.hover); const txt = sp ? `${sp.label}: ${sp.sub}` : "Select a place on the map"; if (hubHint.textContent !== txt) hubHint.textContent = txt; }
  }
  if (MODE === "3d" && S.phase === "hub" && !document.body.classList.contains("qv")) {
    const tx = HUB_CAM.pos.x + (pointer.nx - .5) * .9, ty = HUB_CAM.pos.y - (pointer.ny - .5) * .5, tz = HUB_CAM.pos.z + (pointer.ny - .5) * .3;
    camera.position.x += (tx - camera.position.x) * .02; camera.position.y += (ty - camera.position.y) * .02; camera.position.z += (tz - camera.position.z) * .02; camera.lookAt(camLook);
  }
  MINI.update(t, { k: INK.map, relief: RELIEF.cur, hover: S.hover, show: MODE === "3d" && (S.phase === "hub" || S.phase === "intro" || S.phase === "await" || S.phase === "tour") });
  spotGlows.forEach((g, i) => { const on = 0; g.material.opacity += ((on * (.65 + Math.sin(t * 3 + i) * .15)) * INK.map - g.material.opacity) * .12; });
  if (S.phase === "await") { const dd = pw.distanceTo(startSeal.position), near = Math.max(0, 1 - dd / 1.2); sealRing.material.opacity += ((.32 + Math.sin(t * 2.4) * .14) * (1 - near) + near * (.75 + Math.sin(t * 5) * .2) - sealRing.material.opacity) * .12; sealRing.scale.setScalar(1.25 + Math.sin(t * 2.4) * .12 + near * .3); document.body.classList.toggle("pp-hover", dd < .45); if (S.press === 0 || S.press === undefined) startSeal.scale.setScalar(1 + Math.sin(t * 2.4) * .025 + (dd < .45 ? .06 : 0)); }
  else { sealRing.material.opacity *= .9; if (S.phase === "tour") document.body.classList.remove("pp-hover"); }
  // right hand: fingertip on the pointer, arm reaching in from the bottom right
  const shoulder = new V3(7.5, 3.2, 7.5);
  const dx = pw.x - shoulder.x, dz = pw.z - shoulder.z;
  const hover = .22 - S.press * .2 + (pointer.down ? -.08 : 0);
  rightHand.position.set(pw.x, hover + .02 + (1 - S.handOn) * 3, pw.z + (1 - S.handOn) * 4);
  rightHand.rotation.order = "YXZ"; rightHand.rotation.y = Math.atan2(-dx, -dz); rightHand.rotation.x = -.32; rightHand.rotation.z = .12;
  rightHand.visible = false; // the visitor always gets the same glowing round cursor, on the map too
  document.body.classList.toggle("dot", !rightHand.visible);
  // left hand rests flat on the paper, then slides away
  const breathe = Math.sin(t * 1.1) * .01;
  leftHand.position.set(-4.85 - S.leftOut * 1.5, .1 + breathe + S.leftOut * .2 + (1 - S.handOn) * 2, 2.75 + S.leftOut * 4 + (1 - S.handOn) * 3);
  leftHand.rotation.order = "YXZ"; leftHand.rotation.y = -.7; leftHand.rotation.x = -.06; leftHand.rotation.z = -.05;
  leftHand.visible = !CALM.has(leftHand) && S.leftOut < .99 && S.handOn > .01;

  // the drawn map is a big canvas: only repaint it when something on it changed, and keep its small animations at a calm frame rate
  if (S.phase === "intro" || S.phase === "await" || S.phase === "tour" || S.phase === "hub" || S.phase === "section" || S.phase === "inSection" || S.phase === "closing") {
    const key = `${INK.map.toFixed(3)}|${S.hover}|${MODE}|${INK.title}|${INK.titleFade}|${INK.sub}|${S.phase === "hub" ? 1 : 0}`;
    const fps = MODE === "classic" ? 20 : 8, due = now - (S.inkAt || 0) > 1000 / fps;
    const busy = S.flying || S.phase === "section" || S.phase === "closing";
    if (key !== S.inkKey || (due && !busy) || Math.abs(RELIEF.cur - (S.reliefAt ?? -1)) > .002) { S.inkKey = key; S.inkAt = now; S.reliefAt = RELIEF.cur; drawInk(); }
    else { const tgt = (S.phase === "hub" || S.phase === "await" || S.phase === "intro" || S.phase === "tour") ? Math.min(1, Math.max(0, (INK.map - .25) / .6)) : 0; RELIEF.cur += (tgt - RELIEF.cur) * (tgt < RELIEF.cur ? .25 : .06); }
  }
  if (active) active.update(t, pw);
  finalPass.uniforms.time.value = t; goldMat.userData.u.uTime.value = t; stepSparks(1 / 60); goldName.visible = goldMat.userData.u.uFade.value > .01;
  finalPass.uniforms.focusY.value = .52;
  composer.render(); adapt();
  requestAnimationFrame(frame);
}
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); finalPass.uniforms.res.value.set(innerWidth, innerHeight); });

// fonts must be ready before anything is drawn into textures
const store = { get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) {} } };
const RECENT = (() => { const t = +store.get("fc-seen"); return t > 1 && Date.now() - t < 10 * 60 * 1000; })();
if (RECENT || location.hash === "#hub") { const m = document.querySelector("#loading .msg"); if (m) m.textContent = "Welcome back"; }
const texturesReady = new Promise(res => { THREE.DefaultLoadingManager.onLoad = res; setTimeout(res, 20000); });
THREE.DefaultLoadingManager.onProgress = (u, a, b) => { document.querySelector("#loading .bar i").style.width = `${Math.round(a / b * 100)}%`; };
Promise.all([texturesReady, loadImages([["fabian", "fabian.png"], ["char", "img/fabian-char.webp"], ["paper", "tex/paper_paint.webp"], ["leather", "tex/leather_paint.jpg"], ...Object.entries(PROJECT_IMAGES)]), document.fonts.load("700 300px Caveat"), document.fonts.load("40px Caveat"), document.fonts.load("700 40px Caveat"), document.fonts.load("700 30px 'Cinzel Decorative'"), document.fonts.load("900 40px 'Cinzel Decorative'"), document.fonts.load("700 40px 'Cinzel Decorative'"), document.fonts.load("20px Spectral")]).then(() => {
  drawNameCanvas(); nameAlpha.needsUpdate = true; nameBump.needsUpdate = true;
  frame();
  // a returning visitor (refresh, or back from the 404 page) skips the film and lands where they were
  const last = RECENT ? store.get("fc-last") : null;
  const revisit = REDUCED || location.hash === "#hub" || RECENT;
  const reveal = () => document.getElementById("loading").classList.add("done");
  if (revisit) {
    skipIntro();
    setTimeout(() => { reveal(); if (last && sections[last.split("@")[0]]) setTimeout(() => openSection(last), 350); }, Math.max(0, 1100 - (performance.now() - BOOT)));
  } else { reveal(); intro(); }
});
