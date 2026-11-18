// "Things I Built": a big vintage postcard carried in by paper doves.
// Front and back each frame four projects; click a frame for the story.
import { IMG, paperBG, wrap, tape } from "./pages.js";

import { PROJECTS } from "./content.js";
export { PROJECTS };

const CW = 4.7, CH = 3.25, PXW = 2048, PXH = Math.round(2048 * CH / CW);
const SLOTS = [[96, 300, 904, 560], [1048, 300, 904, 560], [96, 960, 904, 560], [1048, 960, 904, 560]];

export class Built {
  constructor(ctx) { this.ctx = ctx; this.T = ctx.THREE; this.group = new this.T.Group(); this.group.visible = false; ctx.scene.add(this.group); this.side = 0; this.busy = false; this.detail = null; this.built = false; this.handVisible = false;
    this.light = { color: 0xfff3e2, pos: [0, 7.2, 3.6], target: [0, 0, .1], angle: .5, power: 34, candles: .25, rim: .9 }; }
  cardTex(set, back) {
    const T = this.T; const c = document.createElement("canvas"); c.width = PXW; c.height = PXH; const g = c.getContext("2d"); const w = PXW, h = PXH;
    paperBG(g, w, h, { tint: "#e6d6b2", sx: back ? .4 : .1, sy: .25, texA: .7 });
    // deckled double border
    g.strokeStyle = "#6a4e32"; g.lineWidth = 6; g.strokeRect(46, 46, w - 92, h - 92); g.lineWidth = 2; g.strokeRect(66, 66, w - 132, h - 132);
    [[66, 66], [w - 66, 66], [66, h - 66], [w - 66, h - 66]].forEach(([x, y]) => { g.save(); g.translate(x, y); g.fillStyle = "#6a4e32"; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 10 : 24; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); g.restore(); });
    // title
    g.fillStyle = "#4a3422"; g.textAlign = "center"; g.font = "700 96px 'Cinzel Decorative'"; g.fillText(back ? "Academic Projects" : "Selected Projects", w / 2, 200);
    g.font = "700 30px 'Cinzel Decorative'"; g.fillStyle = "#7a5a3a"; g.fillText(back ? "Grafisch Lyceum Rotterdam, 2024 – 2025" : "professional work, 2023 – 2026", w / 2, 256);
    g.strokeStyle = "#7a5a3a"; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2 - 520, 220); g.quadraticCurveTo(w / 2 - 420, 240, w / 2 - 330, 218); g.moveTo(w / 2 + 330, 218); g.quadraticCurveTo(w / 2 + 420, 240, w / 2 + 520, 220); g.stroke();
    // postmark + stamp
    g.save(); g.translate(w - 230, 160); g.rotate(-.18); g.scale(.85, .85); g.strokeStyle = "rgba(90,50,30,.75)"; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 100, 0, 7); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 78, 0, 7); g.stroke();
    g.fillStyle = "rgba(90,50,30,.8)"; g.font = "700 22px 'Cinzel Decorative'"; g.fillText(back ? "ROTTERDAM" : "MARBELLA", 0, -30); g.font = "700 36px 'Cinzel Decorative'"; g.fillText(back ? "2025" : "2026", 0, 20); g.font = "700 19px 'Cinzel Decorative'"; g.fillText(back ? "GLR" : "16 NOV", 0, 58);
    g.lineWidth = 4; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-330, -40 + i * 26); for (let x = -330; x < -110; x += 20) g.quadraticCurveTo(x + 5, -50 + i * 26, x + 10, -40 + i * 26); g.stroke(); } g.restore();
    g.save(); g.translate(160, 150); g.rotate(.06); g.scale(.8, .8); g.fillStyle = "#f2e6c8"; g.fillRect(-80, -95, 160, 190); g.fillStyle = "#e2d2ae"; for (let i = 0; i < 9; i++) { [[-80, -95 + i * 23.75], [80, -95 + i * 23.75]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); }); }
    g.fillStyle = back ? "#3a5a7a" : "#8e3a2a"; g.fillRect(-62, -78, 124, 156); g.strokeStyle = "#f2e6c8"; g.lineWidth = 3; g.beginPath(); g.arc(0, -10, 38, 0, 7); g.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; g.beginPath(); g.moveTo(Math.cos(a) * 46, -10 + Math.sin(a) * 46); g.lineTo(Math.cos(a) * 60, -10 + Math.sin(a) * 60); g.stroke(); } g.fillStyle = "#f2e6c8"; g.font = "700 19px 'Cinzel Decorative'"; g.fillText("F·C", 0, 62); g.restore();
    // four framed photographs with tape captions
    set.forEach((p, i) => {
      const [x, y, fw, fh] = SLOTS[i];
      g.save(); g.shadowColor = "rgba(40,20,5,.45)"; g.shadowBlur = 24; g.shadowOffsetY = 10; g.fillStyle = "#2a1e14"; g.fillRect(x, y, fw, fh); g.restore();
      const img = IMG[p.img];
      if (img) { const ir = img.width / img.height, tr = (fw - 28) / (fh - 28); let sw = img.width, sh = img.height, sx = 0, sy = 0; if (ir > tr) { sw = img.height * tr; sx = 0; } else { sh = img.width / tr; } g.filter = "saturate(1.08) contrast(1.04)"; g.drawImage(img, sx, sy, sw, sh, x + 14, y + 14, fw - 28, fh - 28); g.filter = "none"; }
      // warm light leak & vignette like an old print
      const lg = g.createLinearGradient(x, y, x + fw, y + fh); lg.addColorStop(0, "rgba(255,190,90,.08)"); lg.addColorStop(.6, "rgba(255,190,90,0)"); lg.addColorStop(1, "rgba(60,30,10,.18)"); g.fillStyle = lg; g.fillRect(x + 14, y + 14, fw - 28, fh - 28);
      g.strokeStyle = "#c9a45a"; g.lineWidth = 4; g.strokeRect(x + 6, y + 6, fw - 12, fh - 12);
      // caption on a paper strip
      g.save(); g.translate(x + fw / 2 + (i % 2 ? 30 : -30), y + fh + 6); g.rotate((i % 2 ? 1 : -1) * .02); g.shadowColor = "rgba(40,20,5,.3)"; g.shadowBlur = 8; g.shadowOffsetY = 3; g.fillStyle = "#f3e8cc"; g.fillRect(-330, -34, 660, 70); g.shadowColor = "transparent";
      g.fillStyle = "#3a2a1c"; g.font = "700 46px Caveat"; g.textAlign = "center"; g.fillText(`${p.title}: ${p.cap}`, 0, 14); g.restore();
      tape(g, x + 60, y + 4, 140, 40, -.5); tape(g, x + fw - 60, y + 4, 140, 40, .5);
    });
    g.fillStyle = "#7a5a3a"; g.font = "38px Caveat"; g.textAlign = "right"; g.fillText(back ? "select a project for details  ·  click the border to turn the card ↺" : "select a project for details  ·  click the border to turn the card ↻", w - 110, h - 90);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  detailTex(p) {
    const T = this.T; const c = document.createElement("canvas"); c.width = 1400; c.height = 2150; const g = c.getContext("2d");
    paperBG(g, 1400, 2150, { tint: "#efe2c2", sx: .3, sy: .3 });
    const img = IMG[p.img];
    g.save(); g.translate(700, 520); g.rotate(-.02); g.shadowColor = "rgba(40,20,5,.4)"; g.shadowBlur = 24; g.shadowOffsetY = 10; g.fillStyle = "#f6efdc"; g.fillRect(-600, -380, 1200, 760); g.shadowColor = "transparent";
    if (img) { const ir = img.width / img.height, tr = 1140 / 640; let sw = img.width, sh = img.height; if (ir > tr) sw = img.height * tr; else sh = img.width / tr; g.drawImage(img, 0, 0, sw, sh, -570, -350, 1140, 640); }
    g.restore(); tape(g, 260, 150, 200, 54, -.3); tape(g, 1140, 150, 200, 54, .3);
    g.fillStyle = "#2a1c12"; g.font = "700 76px 'Cinzel Decorative'"; g.fillText(p.title, 110, 1030);
    g.fillStyle = "#8e2a1a"; g.font = "48px Caveat"; g.fillText(`${p.year}  ·  ${p.tag}`, 116, 1110);
    g.fillStyle = "#8e2a1a"; g.font = "700 40px Caveat"; g.fillText("Role", 116, 1180); g.fillStyle = "#2a1c12"; g.font = "36px Spectral"; g.fillText(p.role, 230, 1180);
    g.font = "36px Spectral"; let y = wrap(g, p.text, 116, 1250, 1170, 54);
    g.fillStyle = "#8e2a1a"; g.font = "700 40px Caveat"; g.fillText("Result", 116, y + 10); g.fillStyle = "#2a1c12"; g.font = "italic 36px Spectral"; y = wrap(g, p.result, 250, y + 10, 1040, 54);
    if (p.steps) { g.fillStyle = "#8e2a1a"; g.font = "700 40px Caveat"; g.fillText("How it works", 116, y + 10); g.fillStyle = "#2a1c12"; g.font = "32px Spectral"; y += 56; p.steps.forEach((t, i) => { g.fillStyle = "#8e2a1a"; g.font = "700 36px Caveat"; g.fillText(String(i + 1), 120, y); g.fillStyle = "#2a1c12"; g.font = "32px Spectral"; y = wrap(g, t, 160, y, 1120, 44) + 6; }); y += 10; }
    g.font = "44px Caveat"; let x = 116; p.tools.forEach(t => { const w = g.measureText(t).width + 40; g.strokeStyle = "#3a2a1c"; g.lineWidth = 3; g.strokeRect(x, y + 4, w, 64); g.fillStyle = "#3a2a1c"; g.fillText(t, x + 20, y + 50); x += w + 20; });
    g.fillStyle = "#7a5a3a"; g.font = "40px Caveat"; g.fillText("Use the arrows below to browse projects. Click anywhere to return.", 116, 2080);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  build() {
    if (this.built) return; this.built = true;
    const T = this.T, { shadowy } = this.ctx;
    this.card = new T.Group(); this.group.add(this.card);
    const ft = this.cardTex(PROJECTS.slice(0, 4), false); const front = new T.Mesh(new T.PlaneGeometry(CW, CH), new T.MeshStandardMaterial({ map: ft, emissiveMap: ft, emissive: 0xffffff, emissiveIntensity: 0, roughness: .9 })); front.rotation.x = -Math.PI / 2; front.position.y = .011;
    const backT = this.cardTex(PROJECTS.slice(4, 8), true); backT.wrapS = T.RepeatWrapping; backT.repeat.x = -1; backT.offset.x = 1;
    const back = new T.Mesh(new T.PlaneGeometry(CW, CH), new T.MeshStandardMaterial({ map: backT, emissiveMap: backT, emissive: 0xffffff, emissiveIntensity: 0, roughness: .9, side: T.BackSide })); back.rotation.x = -Math.PI / 2; back.position.y = -.011;
    const edge = new T.Mesh(new T.BoxGeometry(CW - .01, .02, CH - .01), new T.MeshStandardMaterial({ color: 0xd9c8a0, roughness: .9 }));
    this.card.add(front, back, edge); this.front = front; this.back = back;
    shadowy(this.card);
    // hover light: a soft warm pool over the photo you point at
    const hc = document.createElement("canvas"); hc.width = 256; hc.height = 160; const hg = hc.getContext("2d"); const gr = hg.createRadialGradient(128, 80, 10, 128, 80, 130); gr.addColorStop(0, "rgba(255,220,160,.55)"); gr.addColorStop(1, "rgba(255,220,160,0)"); hg.fillStyle = gr; hg.fillRect(0, 0, 256, 160);
    this.hl = new T.Mesh(new T.PlaneGeometry(CW * .62, CH * .5), new T.MeshBasicMaterial({ map: new T.CanvasTexture(hc), transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); this.hl.rotation.x = -Math.PI / 2; this.hl.position.y = .03; this.card.add(this.hl); this.hover = -1;
    // paper doves
    this.doves = [0, 1, 2, 3].map(i => this.makeDove());
    // detail sheet
    this.sheet = new T.Mesh(new T.PlaneGeometry(3.0, 3.0 * 2150 / 1400), new T.MeshStandardMaterial({ roughness: .9, emissive: 0xffffff, emissiveIntensity: 0 })); this.sheet.rotation.x = -Math.PI / 2; this.sheet.visible = false; this.sheet.castShadow = true; this.group.add(this.sheet);
  }
  makeDove() {
    const T = this.T; const mat = new T.MeshStandardMaterial({ color: 0xf2e8d2, roughness: .8, side: T.DoubleSide, flatShading: true });
    const d = new T.Group();
    const body = new T.BufferGeometry(); body.setAttribute("position", new T.Float32BufferAttribute([0, 0, -.32, .07, .03, .1, -.07, .03, .1, 0, .09, .05, 0, 0, -.32, .07, .03, .1, 0, 0, -.32, -.07, .03, .1, 0, .09, .05, 0, .02, .12, .1, .02, .38, -.1, .02, .38], 3)); body.computeVertexNormals();
    d.add(new T.Mesh(body, mat));
    const head = new T.Mesh(new T.ConeGeometry(.05, .14, 4), mat); head.rotation.x = -Math.PI / 2; head.position.set(0, .05, -.36); d.add(head);
    const wingGeo = new T.BufferGeometry(); wingGeo.setAttribute("position", new T.Float32BufferAttribute([0, 0, -.14, 0, 0, .16, .46, 0, .02, 0, 0, .16, .46, 0, .02, .3, 0, .22], 3)); wingGeo.computeVertexNormals();
    const wl = new T.Group(), wr = new T.Group(); wl.add(new T.Mesh(wingGeo, mat)); const m2 = new T.Mesh(wingGeo, mat); m2.scale.x = -1; wr.add(m2); wl.position.y = wr.position.y = .05; d.add(wl, wr);
    d.userData = { wl, wr, path: null, k: 0 }; d.visible = false; this.group.add(this.ctx.shadowy(d)); d.scale.setScalar(.95); return d;
  }
  async open(from) {
    const { tween, moveCamera } = this.ctx; const T = this.T; this.build();
    this.group.visible = true; this.side = 0; this.card.rotation.set(0, 0, 0);
    moveCamera(new T.Vector3(0, 6.9, 4.3), new T.Vector3(0, 0, .3), 2.1, "io");
    // doves fly in from the dark, carrying the card between them
    const start = new T.Vector3(-7, 4.5, -3), end = new T.Vector3(0, .06, .25);
    const perches = [[-CW / 2 - .1, -.6], [CW / 2 + .1, -.4], [-CW / 2 + .5, CH / 2 + .1], [CW / 2 - .3, -CH / 2 - .15]];
    this.doves.forEach((d, i) => { d.visible = true; d.userData.off = new T.Vector3(i % 2 ? .9 : -.9, .5 + (i > 1 ? .25 : 0), i > 1 ? .7 : -.7); d.userData.perch = new T.Vector3(perches[i][0], .06, perches[i][1] + .25); });
    this.card.position.copy(start); this.card.rotation.set(.6, .8, .3);
    const curve = new T.CatmullRomCurve3([start, new T.Vector3(-3.5, 3.8, 1.5), new T.Vector3(1.5, 2.6, 1.2), new T.Vector3(.4, 1.2, .4), end]);
    await tween(2.6, k => {
      const p = curve.getPoint(k); this.card.position.copy(p); this.card.rotation.set(.6 * (1 - k) + Math.sin(k * 9) * .04 * (1 - k), .8 * (1 - k), .3 * (1 - k));
      this.doves.forEach((d, i) => { d.position.copy(p).add(d.userData.off); d.lookAt(curve.getPoint(Math.min(1, k + .03)).add(d.userData.off)); d.rotateY(Math.PI); d.userData.flap = 1; });
    }, "io");
    // the doves let go and settle on the edges of the card
    await tween(.9, k => { this.doves.forEach((d, i) => { const a = this.card.position.clone().add(d.userData.off); d.position.lerpVectors(a, d.userData.perch, k); d.position.y += Math.sin(k * Math.PI) * .4; d.userData.flap = 1 - k * .9; }); }, "io");
    this.doves.forEach(d => d.userData.flap = 0);
    // after a moment the doves take off again, so nothing distracts from the work
    setTimeout(() => this.dovesLeave(), 1400);
  }
  async dovesLeave() {
    const { tween } = this.ctx; const T = this.T; if (!this.group.visible) return;
    const from = this.doves.map(d => d.position.clone());
    this.doves.forEach(d => d.userData.flap = 1);
    await tween(1.8, k => { this.doves.forEach((d, i) => { const to = new T.Vector3((i % 2 ? 1 : -1) * 9, 5 + i, -4 - i); d.position.lerpVectors(from[i], to, k); d.lookAt(to); d.rotateY(Math.PI); }); }, "i");
    this.doves.forEach(d => d.visible = false);
  }
  async close() {
    const { tween } = this.ctx; const T = this.T;
    if (this.detail) await this.hideDetail();
    const p0 = this.card.position.clone();
    await tween(1.2, k => { const p = new T.Vector3(p0.x + k * 7, p0.y + k * 4.5, p0.z - k * 3); this.card.position.copy(p); this.card.rotation.set(-.4 * k, -.6 * k, .3 * k); }, "i");
    this.group.visible = false; this.doves.forEach(d => d.visible = false);
  }
  async flip() {
    if (this.busy) return; this.busy = true; const { tween } = this.ctx; const from = this.side * Math.PI, to = (1 - this.side) * Math.PI;
    await tween(1.1, k => { this.card.rotation.z = from + (to - from) * k; this.card.position.y = .06 + Math.sin(k * Math.PI) * 1.2; }, "io");
    this.side = 1 - this.side; this.busy = false;
  }
  async showDetail(p) {
    const { tween } = this.ctx; const T = this.T; this.busy = true; this.detail = p;
    const dt = this.detailTex(p); this.sheet.material.map = dt; this.sheet.material.emissiveMap = dt; this.sheet.material.needsUpdate = true; this.sheet.visible = true;
    this.ctx.moveCamera(new T.Vector3(.9, 6.9, 3.4), new T.Vector3(.9, 0, -.1), 1.1, "io");
    await tween(.9, k => { this.sheet.position.set(4.4 - k * 3.5, .14 + Math.sin(k * Math.PI) * .6, .28); this.sheet.rotation.z = (1 - k) * -.6 + .02; this.card.position.x = -k * 2.2; }, "io");
    this.detailIndex = PROJECTS.indexOf(p); this.ctx.showLinks([["← Previous project", "#nav:-1"], ...p.links, ["Next project →", "#nav:1"]]); this.busy = false;
  }
  async hideDetail() {
    const { tween } = this.ctx; const T = this.T; this.busy = true; this.ctx.showLinks([]);
    this.ctx.moveCamera(new T.Vector3(0, 6.9, 4.3), new T.Vector3(0, 0, .3), .9, "io");
    await tween(.7, k => { this.sheet.position.set(.9 + k * 4.5, .14 + Math.sin(k * Math.PI) * .4, .28); this.card.position.x = -2.2 + k * 2.2; }, "io");
    this.sheet.visible = false; this.detail = null; this.busy = false;
  }
  async nav(dir) {
    // browse projects like a carousel: the sheet slides away and the next one slides in
    if (!this.detail || this.busy) return; const { tween } = this.ctx; this.busy = true;
    const i = (this.detailIndex + dir + PROJECTS.length) % PROJECTS.length, p = PROJECTS[i];
    await tween(.45, k => { this.sheet.position.x = .9 - dir * k * 5; this.sheet.rotation.z = .02 - dir * k * .3; }, "i");
    const dt = this.detailTex(p); this.sheet.material.map = dt; this.sheet.material.emissiveMap = dt; this.sheet.material.needsUpdate = true; this.detail = p; this.detailIndex = i;
    await tween(.55, k => { this.sheet.position.x = .9 + dir * (1 - k) * 5; this.sheet.rotation.z = .02 + dir * (1 - k) * .3; }, "o");
    this.ctx.showLinks([["← Previous project", "#nav:-1"], ...p.links, ["Next project →", "#nav:1"]]); this.busy = false;
  }
  click(ray) {
    if (this.busy) return;
    if (this.detail) { this.hideDetail(); return; }
    const face = this.side ? this.back : this.front;
    const hits = ray.intersectObject(face); if (!hits.length) { this.ctx.closeSection(); return; }
    const uv = hits[0].uv; let px = uv.x * PXW, py = (1 - uv.y) * PXH; if (this.side) px = PXW - px;
    const i = SLOTS.findIndex(([x, y, w, h]) => px > x && px < x + w && py > y && py < y + h + 60);
    if (i >= 0) this.showDetail(PROJECTS[this.side * 4 + i]); else this.flip();
  }
  key(k) { if (this.detail) { if (k === "ArrowRight") this.nav(1); if (k === "ArrowLeft") this.nav(-1); return; } if (k === "f" || k === "ArrowRight" || k === "ArrowLeft") this.flip(); }
  update(t) {
    if (!this.doves) return;
    if (this.card && this.group.visible && !this.busy && !this.detail && this.ctx.ray) {
      const face = this.side ? this.back : this.front; const hits = this.ctx.ray().intersectObject(face); let hv = -1;
      if (hits.length) { let px = hits[0].uv.x * PXW, py = (1 - hits[0].uv.y) * PXH; if (this.side) px = PXW - px; hv = SLOTS.findIndex(([x, y, w, h]) => px > x && px < x + w && py > y && py < y + h + 60); }
      this.hover = hv;
      if (hv >= 0) { const [x, y, w, h] = SLOTS[hv]; let cx = (x + w / 2) / PXW - .5; if (this.side) cx = -cx; this.hl.position.set(cx * CW * (this.side ? -1 : 1), this.side ? -.03 : .03, ((y + h / 2) / PXH - .5) * CH); }
      this.hl.material.opacity += ((hv >= 0 ? .9 : 0) - this.hl.material.opacity) * .15;
    } const gl = .06 * this.ctx.S.focus; this.front.material.emissiveIntensity = gl; this.back.material.emissiveIntensity = gl; this.sheet.material.emissiveIntensity = gl;
    this.doves.forEach((d, i) => { const f = d.userData.flap || 0; const a = Math.sin(t * 18 + i) * .9 * f + (1 - f) * (.15 + Math.sin(t * 1.5 + i) * .05); d.userData.wl.rotation.z = a; d.userData.wr.rotation.z = -a; if (!f) d.position.y = .06 + Math.abs(Math.sin(t * 1.2 + i)) * .01; });
  }
}
