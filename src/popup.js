// "Projects": a pop-up book. Each project rises from the spread as layered
// paper (scenery, the framed screenshot, paper flowers) with a golden orbit of
// sparks. Click the screenshot to visit the live website.
import { IMG, paperBG, wrap, tape } from "./pages.js";
import { PROJECTS, PROJECT_IMAGES, CASES } from "./content.js";

const SW = 6.0, SH = 2.2;           // open spread on the desk
const ACCENT = ["#2f8f86", "#3a6ea8", "#3f8a3a", "#8e2a1a", "#c27a1e", "#a03a2a", "#6a4a9a", "#2a7a9a"];

export class Popup {
  constructor(ctx) {
    this.ctx = ctx; this.T = ctx.THREE; this.group = new this.T.Group(); this.group.visible = false; ctx.scene.add(this.group);
    this.built = false; this.handVisible = false; this.i = 0; this.busy = false; this.rise = 0;
    this.light = { color: 0xffe0b4, pos: [0, 6.5, 5.5], target: [0, .9, -.2], angle: .5, power: 46, candles: .3, rim: 1.4 };
  }
  tex(c) { const t = new this.T.CanvasTexture(c); t.colorSpace = this.T.SRGBColorSpace; t.anisotropy = 8; return t; }
  canvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }

  // ------------------------------------------------------------------ artwork
  drawSpread(c, p, i) {
    const g = c.getContext("2d"), w = c.width, h = c.height;
    g.clearRect(0, 0, w, h);
    paperBG(g, w, h, { sx: .2, sy: .3, texA: .4 });
    // gutter shadow across both pages
    const gg = g.createLinearGradient(w / 2 - 70, 0, w / 2 + 70, 0); gg.addColorStop(0, "rgba(60,35,12,0)"); gg.addColorStop(.5, "rgba(60,35,12,.09)"); gg.addColorStop(1, "rgba(60,35,12,0)"); g.fillStyle = gg; g.fillRect(w / 2 - 70, 0, 140, h);
    // faint printed border on each page
    g.strokeStyle = "rgba(120,80,40,.35)"; g.lineWidth = 3; g.strokeRect(40, 36, w / 2 - 90, h - 72); g.strokeRect(w / 2 + 50, 36, w / 2 - 90, h - 72);
    // title block (front half of the spread)
    g.textAlign = "center"; g.fillStyle = "#1c120a"; let fs = 96; g.font = `700 ${fs}px 'Cinzel Decorative'`; while (g.measureText(p.title).width > 1020 && fs > 50) { fs -= 4; g.font = `700 ${fs}px 'Cinzel Decorative'`; } g.fillText(p.title, w / 2, 560);
    g.fillStyle = "#6a3a1a"; g.font = "italic 40px Spectral"; g.fillText(p.tag, w / 2, 620);
    g.fillStyle = "#2a1c12"; g.font = "36px Spectral"; g.fillText(p.role, w / 2, 672);
    // left page: index tabs, like the tabs of a song book
    const tab = (y, label, val, on) => { g.textAlign = "left"; g.fillStyle = on ? "#f6ead0" : "rgba(246,234,208,.6)"; g.strokeStyle = "rgba(90,60,30,.55)"; g.lineWidth = 2; g.beginPath(); g.moveTo(70, y); g.lineTo(440, y); g.lineTo(464, y + 34); g.lineTo(440, y + 68); g.lineTo(70, y + 68); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = on ? "#8e2a1a" : "#5a4030"; g.font = "italic 34px Spectral"; g.fillText(label, 96, y + 46); g.textAlign = "right"; g.fillStyle = "#2a1a0e"; g.font = "700 34px 'Cinzel Decorative'"; g.fillText(val, 420, y + 47); g.textAlign = "left"; };
    tab(500, "Project", `${i + 1} of ${PROJECTS.length}`, true);
    tab(584, "Year", p.year, false);
    // right page: the tools, written like a margin note
    g.textAlign = "right"; g.fillStyle = "#5a3a1e"; g.font = "italic 30px Spectral"; g.fillText("Built with", w - 90, 528);
    g.fillStyle = "#2a1a0e"; g.font = "700 30px 'Cinzel Decorative'"; p.tools.slice(0, 4).forEach((t, k) => g.fillText(t, w - 90, 576 + k * 42));
    g.textAlign = "left";
  }
  drawCard(c, p) {
    const g = c.getContext("2d"), w = c.width, h = c.height; g.clearRect(0, 0, w, h);
    // deckled paper mat
    g.save(); g.beginPath(); for (let k = 0; k <= 80; k++) { const t = k / 80; g.lineTo(20 + t * (w - 40), 18 + Math.sin(k * 7.3) * 4); } for (let k = 0; k <= 60; k++) { const t = k / 60; g.lineTo(w - 18 + Math.sin(k * 5.1) * 4, 20 + t * (h - 40)); } for (let k = 0; k <= 80; k++) { const t = k / 80; g.lineTo(w - 20 - t * (w - 40), h - 18 + Math.sin(k * 6.7) * 4); } for (let k = 0; k <= 60; k++) { const t = k / 60; g.lineTo(18 + Math.sin(k * 4.3) * 4, h - 20 - t * (h - 40)); } g.closePath(); g.clip();
    paperBG(g, w, h, { tint: "#f3e7cc", sx: .3, sy: .2, texA: .4 }); g.restore();
    const img = IMG[p.img]; const ix = 52, iy = 50, iw = w - 104, ih = h - 100;
    g.fillStyle = "#1a1410"; g.fillRect(ix - 6, iy - 6, iw + 12, ih + 12);
    if (img) { const tr = iw / ih, ir = img.width / img.height; let sw = img.width, sh = img.height; if (ir > tr) sw = img.height * tr; else sh = img.width / tr; g.drawImage(img, 0, 0, sw, sh, ix, iy, iw, ih); }
    g.strokeStyle = "#c79a46"; g.lineWidth = 3; g.strokeRect(ix - 14, iy - 14, iw + 28, ih + 28);
    tape(g, 120, 34, 170, 46, -.35); tape(g, w - 120, 34, 170, 46, .35);
  }
  drawBack(c, accent) {
    const g = c.getContext("2d"), w = c.width, h = c.height; g.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h * .5, r = h * .44;
    // rays
    g.save(); g.translate(cx, cy); g.strokeStyle = "rgba(120,80,40,.5)"; g.lineWidth = 3; for (let k = 0; k < 28; k++) { g.rotate(Math.PI * 2 / 28); g.beginPath(); g.moveTo(0, r + 14); g.lineTo(0, r + (k % 2 ? 48 : 84)); g.stroke(); } g.restore();
    // disc
    const dg = g.createRadialGradient(cx - r * .3, cy - r * .3, 10, cx, cy, r); dg.addColorStop(0, "#fbf3df"); dg.addColorStop(1, "#e2cfa6"); g.fillStyle = dg; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
    g.strokeStyle = "rgba(90,60,30,.7)"; g.lineWidth = 5; g.stroke(); g.strokeStyle = accent; g.globalAlpha = .55; g.lineWidth = 14; g.beginPath(); g.arc(cx, cy, r - 26, 0, 7); g.stroke(); g.globalAlpha = 1;
    // little stars
    g.fillStyle = "#e9d7ae"; g.strokeStyle = "rgba(90,60,30,.6)"; g.lineWidth = 2;
    [[.12, .2, 22], [.86, .18, 26], [.1, .7, 16], [.9, .72, 18], [.75, .06, 12]].forEach(([x, y, s]) => { g.save(); g.translate(x * w, y * h); g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, rr = k % 2 ? s * .42 : s; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke(); g.restore(); });
    // paper clouds at the bottom
    const cloud = (x, y, s) => { g.fillStyle = "#f1e5c8"; g.strokeStyle = "rgba(90,60,30,.6)"; g.lineWidth = 3; g.beginPath(); [[0, 0, 1], [.9, -.35, .8], [1.8, 0, .95], [.9, .25, .9]].forEach(([dx, dy, rr]) => { g.moveTo(x + dx * s + rr * s, y + dy * s); g.arc(x + dx * s, y + dy * s, rr * s, 0, 7); }); g.fill(); g.stroke(); };
    cloud(w * .02, h * .86, 70); cloud(w * .72, h * .88, 64);
  }
  drawFront(c, accent) {
    const g = c.getContext("2d"), w = c.width, h = c.height; g.clearRect(0, 0, w, h);
    const flower = (x, y, s, petals) => { g.save(); g.translate(x, y); for (let k = 0; k < petals; k++) { g.rotate(Math.PI * 2 / petals); g.fillStyle = "#f7eedb"; g.strokeStyle = "rgba(90,60,30,.55)"; g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, -s * .55, s * .32, s * .55, 0, 0, 7); g.fill(); g.stroke(); } g.fillStyle = accent; g.beginPath(); g.arc(0, 0, s * .22, 0, 7); g.fill(); g.restore(); };
    const leaf = (x, y, s, a) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = "#c9b98a"; g.strokeStyle = "rgba(90,60,30,.55)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * .45, -s * .5, 0, -s); g.quadraticCurveTo(-s * .45, -s * .5, 0, 0); g.fill(); g.stroke(); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -s * .9); g.stroke(); g.restore(); };
    for (let k = 0; k < 14; k++) leaf(60 + k * (w - 120) / 13, h - 6, 120 + (k % 3) * 40, (k % 2 ? 1 : -1) * (.3 + (k % 4) * .1));
    [[.08, .62, 70, 7], [.2, .5, 90, 8], [.33, .68, 60, 6], [.67, .66, 64, 6], [.8, .5, 92, 8], [.93, .64, 66, 7]].forEach(([x, y, s, n]) => flower(x * w, y * h, s, n));
  }

  build() {
    if (this.built) return; this.built = true;
    const T = this.T, { MAT, shadowy, leatherN, tex } = this.ctx;
    this.root = new T.Group(); this.group.add(this.root);
    // covers and page block
    const leather = new T.MeshStandardMaterial({ map: tex("tex/leather_paint.jpg"), normalMap: leatherN, roughness: .6, color: 0x8a4a2a });
    [-1, 1].forEach(s => { const cv = new T.Mesh(new this.ctx.RoundedBoxGeometry(SW / 2 + .14, .06, SH + .22, 3, .03), leather); cv.position.set(s * (SW / 4 + .03), .03, 0); this.root.add(cv); });
    const edge = new T.MeshStandardMaterial({ color: 0xe6d6b0, roughness: .9 });
    [-1, 1].forEach(s => { const pb = new T.Mesh(new T.BoxGeometry(SW / 2 - .02, .08, SH), edge); pb.position.set(s * (SW / 4), .06, 0); this.root.add(pb); });
    // the spread: two halves, so each page can change on its own while a page turns
    this.spreadC = this.canvas(2048, 750); this.spreadT = this.tex(this.spreadC);
    const half = (sd, back) => { // sd: -1 left, 1 right; back: a turning page's underside
      const g = new T.PlaneGeometry(SW / 2, SH, 40, 1); g.translate(sd * SW / 4, 0, 0); const P = g.attributes.position, U = g.attributes.uv;
      for (let k = 0; k < P.count; k++) { const x = P.getX(k), u = Math.abs(x) / (SW / 2); P.setZ(k, .03 * Math.sin(u * Math.PI * .9) - .022 * Math.exp(-Math.pow(x / .22, 2))); U.setX(k, U.getX(k) * .5 + (sd > 0 ? .5 : 0)); }
      if (back) for (let k = 0; k < P.count; k++) U.setX(k, .5 - (U.getX(k) - .5)); // the underside shows the left page, mirrored into place when it lands
      g.computeVertexNormals(); return g;
    };
    const pageMat = () => new T.MeshStandardMaterial({ map: this.spreadT, roughness: .95, emissiveMap: this.spreadT, emissive: 0xffffff, emissiveIntensity: 0 });
    this.halves = [-1, 1].map(sd => { const m = new T.Mesh(half(sd), pageMat()); m.rotation.x = -Math.PI / 2; m.position.y = .165; this.root.add(m); return m; });
    this.spread = this.halves[0];
    // the page that turns: front shows a right-hand page, back shows a left-hand page
    this.sweepPiv = new T.Group(); this.sweepPiv.position.y = .17; this.sweepPiv.visible = false; this.root.add(this.sweepPiv);
    this.sweepF = new T.Mesh(half(1), pageMat()); this.sweepF.rotation.x = -Math.PI / 2; this.sweepPiv.add(this.sweepF);
    this.sweepB = new T.Mesh(half(1, true), new T.MeshStandardMaterial({ map: this.spreadT, roughness: .95, side: T.BackSide, emissiveMap: this.spreadT, emissive: 0xffffff, emissiveIntensity: 0 })); this.sweepB.rotation.x = -Math.PI / 2; this.sweepPiv.add(this.sweepB);
    // pop-up layers, each hinged on the page
    const layer = (cw, ch, w, h, z, raise) => { const c = this.canvas(cw, ch); const t = this.tex(c); const geo = new T.PlaneGeometry(w, h); geo.translate(0, h / 2 + raise, 0);
      const m = new T.Mesh(geo, new T.MeshStandardMaterial({ map: t, alphaTest: .4, side: T.DoubleSide, roughness: .9, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: .05 }));
      m.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: t, alphaTest: .4 });
      const piv = new T.Group(); piv.position.set(0, .17, z); piv.add(m); this.root.add(piv); return { c, t, m, piv }; };
    this.back = layer(1200, 700, 4.5, 2.62, -.7, 0);
    this.card = layer(1280, 860, 2.45, 1.65, -.3, .28);
    this.front = layer(1600, 360, 4.2, .95, .02, 0);
    // paper stilts that hold the card up
    [-.75, .75].forEach(x => { const st = new T.Mesh(new T.BoxGeometry(.05, .3, .02), edge); st.position.set(x, .15, 0); this.card.piv.add(st); });
    shadowy(this.root); this.halves.forEach(h => h.castShadow = false); this.sweepF.castShadow = this.sweepB.castShadow = false; this.spread.castShadow = false; this.front.m.castShadow = false; this.root.children.forEach(c => { if (c.geometry && c.geometry.type === "BoxGeometry") c.castShadow = false; });
    // golden orbit of sparks around the card
    const N = 160; const og = new T.BufferGeometry(); this.orbitP = new Float32Array(N * 3); this.orbitS = new Float32Array(N);
    for (let k = 0; k < N; k++) this.orbitS[k] = Math.random();
    og.setAttribute("position", new T.BufferAttribute(this.orbitP, 3)); og.setAttribute("seed", new T.BufferAttribute(this.orbitS, 1));
    this.orbitMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { k: { value: 0 } },
      vertexShader: `attribute float seed; varying float s; void main(){ s=seed; vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=(40.+seed*90.)/-mv.z; }`,
      fragmentShader: `uniform float k; varying float s; void main(){ float r=length(gl_PointCoord-.5); if(r>.5) discard; gl_FragColor=vec4(1.,.82,.45,smoothstep(.5,0.,r)*k*(.35+s*.65)); }` });
    this.orbit = new T.Points(og, this.orbitMat); this.root.add(this.orbit);
    // drifting paper petals
    const PN = 46; const pg = new T.BufferGeometry(); this.petP = new Float32Array(PN * 3); this.petS = [];
    for (let k = 0; k < PN; k++) { this.petS.push({ x: (Math.random() - .5) * 7, y: Math.random() * 3.4, z: (Math.random() - .5) * 2.4 - .4, v: .12 + Math.random() * .2, ph: Math.random() * 6 }); }
    pg.setAttribute("position", new T.BufferAttribute(this.petP, 3));
    this.petMat = new T.PointsMaterial({ color: 0xf6ead0, size: .07, transparent: true, opacity: 0, depthWrite: false });
    this.petals = new T.Points(pg, this.petMat); this.root.add(this.petals);
    this.setFold(0); this.show(0);
  }
  // every project's four artworks are drawn once, uploaded ahead of time and swapped in instantly
  art(i) {
    i = (i + PROJECTS.length) % PROJECTS.length; this.cache = this.cache || new Map();
    if (this.cache.has(i)) return this.cache.get(i);
    const p = PROJECTS[i], acc = ACCENT[i % ACCENT.length];
    const mk = (w, h, draw) => { const c = this.canvas(w, h); draw(c); const t = this.tex(c); if (this.ctx.renderer && this.ctx.renderer.initTexture) this.ctx.renderer.initTexture(t); return t; };
    const set = { spread: mk(2048, 750, c => this.drawSpread(c, p, i)), card: mk(1280, 860, c => this.drawCard(c, p)), back: mk(1200, 700, c => this.drawBack(c, acc)), front: mk(1600, 360, c => this.drawFront(c, acc)) };
    this.cache.set(i, set); return set;
  }
  apply(set, parts = "LRlayers") {
    const put = (mesh, t) => { mesh.material.map = t; mesh.material.emissiveMap = t; if (mesh.customDepthMaterial) mesh.customDepthMaterial.map = t; };
    if (parts.includes("L")) put(this.halves[0], set.spread);
    if (parts.includes("R")) put(this.halves[1], set.spread);
    if (parts.includes("layers")) { put(this.card.m, set.card); put(this.back.m, set.back); put(this.front.m, set.front); }
  }

  prefetch() { // get the neighbours ready in quiet moments, and forget projects that are far away
    const keep = [this.i, (this.i + 1) % PROJECTS.length, (this.i - 1 + PROJECTS.length) % PROJECTS.length];
    clearTimeout(this.pf); let k = 1;
    const step = () => { if (k < keep.length) { this.art(keep[k++]); this.pf = setTimeout(step, 120); } };
    this.pf = setTimeout(step, 400);
    for (const [idx, set] of this.cache) if (!keep.includes(idx)) { Object.values(set).forEach(t => t.dispose()); this.cache.delete(idx); }
  }
  show(i) {
    this.i = (i + PROJECTS.length) % PROJECTS.length;
    this.apply(this.art(this.i)); this.updateSide(); this.prefetch();
  }

  setFold(k) { // 0 = flat, 1 = fully popped up (staggered per layer)
    this.rise = k;
    const f = (d) => { const t = Math.min(1, Math.max(0, (k - d) / (1 - d))); return this.ctx.ease.o(t); };
    this.back.piv.rotation.x = -Math.PI / 2 * (1 - f(0));
    this.card.piv.rotation.x = -Math.PI / 2 * (1 - f(.15));
    this.front.piv.rotation.x = Math.PI / 2 * (1 - f(.3));
  }
  updateSide() {
    const prev = PROJECTS[(this.i - 1 + PROJECTS.length) % PROJECTS.length], next = PROJECTS[(this.i + 1) % PROJECTS.length];
    ["pp-prev", "pp-next"].forEach((id, k) => { const b = document.getElementById(id); b.style.visibility = ""; b.querySelector("small").textContent = k ? "Next project" : "Previous project"; b.querySelector(".t").textContent = (k ? next : prev).title; });
    const p = PROJECTS[this.i]; if (!this.isOpen) return;
    this.ctx.showLinks([...(p.url ? [["Visit website ↗", p.url]] : []), ["Read the case study", "#act:case"]]);
  }
  // ------------------------------------------------------------------ open / close / browse
  async open(from) {
    const { tween, moveCamera } = this.ctx; const T = this.T; this.build();
    this.group.visible = true; this.isOpen = true; this.setFold(0); this.show(this.i);
    moveCamera(new T.Vector3(0, 3.25, 7.1), new T.Vector3(0, .86, -.15), 2.0, "io");
    const start = new T.Vector3(from.x, 3.5, from.z), end = new T.Vector3(0, 0, .35);
    start.copy(end).add(new T.Vector3(0, .4, -.6)); await tween(1.5, k => { this.root.position.lerpVectors(start, end, k); this.root.rotation.set(0, (1 - k) * .1, 0); }, "o");
    document.body.classList.add("pp-on"); this.updateSide();
    tween(2.2, k => this.orbitMat.uniforms.k.value = k * .45, "o", .6);
    await tween(1.9, k => this.setFold(k), "io");
  }
  async close() {
    const { tween } = this.ctx; this.isOpen = false; document.body.classList.remove("pp-on"); this.ctx.showLinks([]); this.closeCase();
    tween(.4, k => this.orbitMat.uniforms.k.value = .45 * (1 - k), "o");
    await tween(.7, k => this.setFold(1 - k), "io");
    const p0 = this.root.position.clone();
    await tween(1.0, k => { this.root.position.set(p0.x, p0.y + k * 2.4, p0.z - k * 1.4); }, "io");
    this.group.visible = false;
  }
  curl(c) { // bend the turning page: the outer edge trails behind, like real paper
    [this.sweepF, this.sweepB].forEach(m => { const P = m.geometry.attributes.position; if (!m.userData.z0) { m.userData.z0 = Float32Array.from({ length: P.count }, (_, k) => P.getZ(k)); }
      for (let k = 0; k < P.count; k++) { const u = P.getX(k) / (SW / 2); P.setZ(k, m.userData.z0[k] - c * .55 * u * u); }
      P.needsUpdate = true; m.geometry.computeVertexNormals(); });
  }
  async nav(dir) {
    if (this.busy) { this.queued = dir; return; } this.busy = true; const { tween, ease } = this.ctx;
    const from = this.art(this.i), ni = (this.i + dir + PROJECTS.length) % PROJECTS.length, to = this.art(ni);
    const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
    const o0 = this.orbitMat.uniforms.k.value; let stage = 0;
    const layers = [this.back.piv, this.card.piv, this.front.piv];
    // 1) the pop-up folds completely flat, 2) a page turns with the real pages on it, 3) the next scene unfolds
    await tween(1.9, t => {
      const down = ease.io(seg(t, 0, .3)), turn = ease.io(seg(t, .3, .7)), up = ease.o(seg(t, .7, 1));
      if (stage === 0 && t >= .3) { stage = 1;
        layers.forEach(l => l.visible = false); this.apply(to, "layers");
        const pf = dir > 0 ? from.spread : to.spread, pb = dir > 0 ? to.spread : from.spread;
        this.sweepF.material.map = this.sweepF.material.emissiveMap = pf; this.sweepB.material.map = this.sweepB.material.emissiveMap = pb;
        this.apply(to, dir > 0 ? "R" : "L"); this.sweepPiv.visible = true; }
      if (stage === 1 && t >= .7) { stage = 2; this.sweepPiv.visible = false; this.apply(to, dir > 0 ? "L" : "R"); layers.forEach(l => l.visible = true); this.i = ni; this.updateSide(); this.prefetch(); }
      if (stage === 0) this.setFold(1 - down); else if (stage === 2) this.setFold(up);
      // the turning page lifts in a soft arc
      const a = dir > 0 ? turn * Math.PI : Math.PI - turn * Math.PI; this.sweepPiv.rotation.z = a; this.sweepPiv.position.y = .17 + Math.sin(turn * Math.PI) * .05;
      this.curl(Math.sin(turn * Math.PI) * (dir > 0 ? 1 : -1));
      this.orbitMat.uniforms.k.value = o0 * (t < .5 ? 1 - seg(t, 0, .25) : seg(t, .75, 1));
    }, "lin");
    this.curl(0); this.busy = false;
    if (this.queued) { const q = this.queued; this.queued = 0; this.nav(q); }
  }


  visit() {
    const p = PROJECTS[this.i];
    if (p.url) { const a = document.createElement("a"); a.href = p.url; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove(); }
    else this.openCase();
  }
  openCase(idx = this.i) {
    const p = PROJECTS[idx], c = CASES[p.id] || {}, el = document.getElementById("casestudy");
    const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    const fig = (src, cap, cls = "") => `<figure class="${cls}"><button class="zoom" data-src="${esc(src)}" data-cap="${esc(cap || "")}" aria-label="Enlarge: ${esc(cap || p.title)}"><img src="${esc(src)}" alt="${esc(cap || p.title)}" loading="lazy"></button>${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>`;
    const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length], next = PROJECTS[(idx + 1) % PROJECTS.length];
    const links = [...(p.url ? [["Visit the live website", p.url]] : []), ...p.links.filter(([, u]) => u !== p.url)];
    el.querySelector(".sheet").innerHTML = `<button class="qv-close cs-close">Close ✕</button>
      ${c.facts ? "" : `<p class="kicker">${esc(p.year)} · ${esc(p.tag)}</p>`}<h1>${esc(p.title)}</h1>
      ${c.status ? `<p class="status">✓ ${esc(c.status)}</p>` : ""}
      <p class="intro">${esc(c.lead || p.text)}</p>
      ${links.length ? `<div class="btns">${links.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)} ↗</a>`).join("")}</div>` : ""}
      ${c.facts ? `<dl class="facts">${c.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>${c.facts.some(([k]) => /tool/i.test(k)) ? "" : `<div class="tags">${p.tools.map(t => `<span>${esc(t)}</span>`).join("")}</div>`}` : `<dl class="facts"><div><dt>Role</dt><dd>${esc(p.role)}</dd></div><div><dt>Built with</dt><dd>${esc(p.tools.join(" · "))}</dd></div></dl>`}
      ${fig(PROJECT_IMAGES[p.id], "", "hero").replace(' loading="lazy"', "")}
      ${(c.sections || []).map(([t, x]) => `<section><h2>${esc(t)}</h2><p>${esc(x)}</p></section>`).join("")}
      ${c.stats ? `<div class="stats">${c.stats.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join("")}</div>` : ""}
      ${c.features ? `<section><h2>${p.id === "flexichat" ? "Features" : "What I built"}</h2><ul class="feat">${c.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul></section>` : ""}
      ${c.steps ? `<section><h2>${p.id === "funfactory" ? "The process" : "How it works"}</h2><ol class="steps">${c.steps.map(([t, x, im], k) => `<li><span class="n">${k + 1}</span><div><h3>${esc(t)}</h3><p>${esc(x)}</p></div>${im ? fig(im, "") : ""}</li>`).join("")}</ol></section>`
        : p.steps ? `<section><h2>How it works</h2><ol class="steps">${p.steps.map((x, k) => `<li><span class="n">${k + 1}</span><div><p>${esc(x)}</p></div></li>`).join("")}</ol></section>` : ""}
      ${c.quote ? `<blockquote><p>${esc(c.quote[0])}</p><footer>${esc(c.quote[1])}</footer></blockquote>` : ""}
      ${c.facts ? "" : `<section class="result"><h2>Result</h2><p>${esc(p.result)}</p><div class="tags">${p.tools.map(t => `<span>${esc(t)}</span>`).join("")}</div></section>`}
      ${(() => { const shown = new Set([PROJECT_IMAGES[p.id], ...(c.steps || []).map(st => st[2])]); const more = (c.gallery || []).filter(([im]) => !shown.has(im)); return more.length ? `<section><h2>More screenshots</h2><div class="gallery">${more.map(([im, cap]) => fig(im, cap)).join("")}</div></section>` : ""; })()}
      <nav class="cs-nav"><button data-cs="${(idx - 1 + PROJECTS.length) % PROJECTS.length}">← ${esc(prev.title)}</button><button data-cs="${(idx + 1) % PROJECTS.length}">${esc(next.title)} →</button></nav>`;
    el.hidden = false; el.scrollTop = 0;
    if (!el.dataset.wired) {
      el.dataset.wired = "1";
      el.addEventListener("click", e => {
        const z = e.target.closest(".zoom"); if (z) { const lb = document.getElementById("lightbox"); lb.querySelector("img").src = z.dataset.src; lb.querySelector("img").alt = z.dataset.cap; lb.querySelector("p").textContent = z.dataset.cap; lb.hidden = false; return; }
        const n = e.target.closest("[data-cs]"); if (n) { const k = +n.dataset.cs; this.openCase(k); if (this.isOpen && k !== this.i) { this.i = k; this.show(k); } }
      });
    }
  }
  closeCase() { const el = document.getElementById("casestudy"); if (el) el.hidden = true; }
  action(name) { if (name === "case") this.openCase(); }
  click(ray) {
    if (this.busy) return;
    if (ray.intersectObject(this.card.m).length) { this.visit(); return; }
    if (!ray.intersectObject(this.root, true).length) this.ctx.closeSection();
  }
  key(k) { if (k === "ArrowRight") this.nav(1); if (k === "ArrowLeft") this.nav(-1); if (k === "Enter") this.visit(); }
  update(t) {
    if (!this.built || !this.group.visible) return;
    // orbit: a tilted ellipse of sparks circling the card
    const n = this.orbitS.length, cy = 1.15, cz = -.3;
    for (let k = 0; k < n; k++) { const s = this.orbitS[k]; const a = t * .16 + s * Math.PI * 2 + Math.sin(t + s * 9) * .05; const r = 1.0 + (s * 7 % 1) * .08;
      const x = Math.cos(a) * 1.6 * r, y = Math.sin(a) * .82 * r; this.orbitP[k * 3] = x; this.orbitP[k * 3 + 1] = cy + y + x * .18; this.orbitP[k * 3 + 2] = cz + Math.sin(a) * .55; }
    this.orbit.geometry.attributes.position.needsUpdate = true;
    this.petS.forEach((p, k) => { p.y -= p.v / 60; if (p.y < .2) { p.y = 3.4; p.x = (Math.random() - .5) * 7; } this.petP[k * 3] = p.x + Math.sin(t * .8 + p.ph) * .25; this.petP[k * 3 + 1] = p.y; this.petP[k * 3 + 2] = p.z + Math.cos(t * .6 + p.ph) * .2; });
    this.petals.geometry.attributes.position.needsUpdate = true; this.petMat.opacity = .8 * this.rise;
    // the card breathes slightly and leans towards the pointer
    if (this.rise > .99 && !this.busy) { const px = (this.ctx.pointer.nx - .5); this.card.piv.rotation.y = px * .12; this.card.piv.rotation.x = Math.sin(t * 1.3) * .015; }
    const hover = this.ctx.ray && this.rise > .99 ? this.ctx.ray().intersectObject(this.card.m).length > 0 : false;
    this.card.m.material.emissiveIntensity += ((hover ? .22 : .05) - this.card.m.material.emissiveIntensity) * .15; this.hoverK = (this.hoverK || 0) + ((hover ? 1 : 0) - (this.hoverK || 0)) * .12; this.card.m.position.z = this.hoverK * .12; this.card.m.scale.setScalar(1 + this.hoverK * .035);
    document.body.classList.toggle("pp-hover", hover);
    this.halves.forEach(h => h.material.emissiveIntensity = .05 * this.ctx.S.focus);
  }
}
