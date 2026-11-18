// "My Story": a leather journal that flies in from the tower on the map,
// unbuckles, opens, and turns real curling pages.
import { IMG, paperBG, wrap, tape, polaroid, doodleArrow, sketchBox } from "./pages.js";
import { PROFILE, STORY } from "./content.js";

const PW = 2.25, PH = 3.05, SEG = 64, ROWS = 10;
const PX = 1024, PY = Math.round(1024 * PH / PW);

export class Story {
  constructor(ctx) {
    this.ctx = ctx; const { THREE } = ctx; this.T = THREE;
    this.group = new THREE.Group(); this.group.visible = false; ctx.scene.add(this.group);
    this.spread = 0; this.busy = false; this.handVisible = false;
    this.light = { color: 0xffc27a, pos: [-.5, 8.5, -.7], target: [0, 0, .25], angle: .42, power: 26, candles: .45, rim: .2 };
    this.built = false;
  }
  canvasTex(draw, mirror) {
    const T = this.T, R = 1.6; const c = document.createElement("canvas"); c.width = Math.round(PX * R); c.height = Math.round(PY * R); const g = c.getContext("2d"); g.scale(R, R); draw(g, PX, PY);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 16;
    if (mirror) { t.wrapS = T.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; }
    return t;
  }
  build() {
    if (this.built) return; this.built = true;
    const { THREE, MAT, shadowy, leatherN } = this.ctx; const T = THREE;
    const g = this.group;
    // ---------------- static parts: back cover, page block, spine
    const leather = new T.MeshStandardMaterial({ map: this.leatherTex(), normalMap: leatherN, normalScale: new T.Vector2(.9, .9), roughness: .62, color: 0xffffff });
    const edgeTex = new T.CanvasTexture((() => { const c = document.createElement("canvas"); c.width = 512; c.height = 64; const x = c.getContext("2d"); const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, "#d9b25a"); gr.addColorStop(.5, "#f4dc98"); gr.addColorStop(1, "#b58a38"); x.fillStyle = gr; x.fillRect(0, 0, 512, 64); for (let i = 0; i < 64; i += 2) { x.fillStyle = `rgba(90,60,20,${Math.random() * .4})`; x.fillRect(0, i, 512, 1); } return c; })());
    edgeTex.colorSpace = T.SRGBColorSpace;
    const gilt = new T.MeshStandardMaterial({ map: edgeTex, metalness: .7, roughness: .35 });
    this.backCover = new T.Mesh(new this.ctx.RoundedBoxGeometry(PW + .1, .07, PH + .14, 3, .025), leather); this.backCover.position.set(PW / 2 + .02, .035, 0); g.add(this.backCover);
    this.block = new T.Mesh(new T.BoxGeometry(PW - .02, .26, PH - .04), [gilt, gilt, new T.MeshStandardMaterial({ color: 0xece0c4, roughness: .9 }), gilt, gilt, gilt]); this.block.position.set(PW / 2, .07 + .13, 0); g.add(this.block);
    const spine = new T.Mesh(new T.CylinderGeometry(.2, .2, PH + .14, 32, 1, true, Math.PI, Math.PI), leather); spine.rotation.x = Math.PI / 2; spine.rotation.y = Math.PI / 2; spine.position.set(0, .2, 0); spine.scale.set(1, 1, .9); g.add(spine);
    
    this.topY = .07 + .26 + .004;
    // ---------------- pages
    this.leaves = [];
    const pages = this.pageTextures();
    for (let i = 0; i < 3; i++) {
      const front = pages[1 + i * 2], back = pages[2 + i * 2];
      this.leaves.push(this.makeLeaf(front, back, false, i));
    }
    // ---------------- front cover (rigid)
    this.cover = this.makeCover(pages[0], leather);
    // ---------------- strap with brass buckle
    const strapMat = new T.MeshStandardMaterial({ map: this.leatherTex("#3a1a0c"), normalMap: leatherN, roughness: .6 });
    this.strap = new T.Group();
    const s1 = new T.Mesh(new T.BoxGeometry(.5, .03, .32), strapMat); s1.position.set(PW - .12, this.topY + .09, 0); this.strap.add(s1);
    const s2 = new T.Mesh(new T.BoxGeometry(.04, .44, .32), strapMat); s2.position.set(PW + .14, .22, 0); this.strap.add(s2);
    const buckle = new T.Mesh(new T.TorusGeometry(.17, .03, 8, 4), MAT.brass); buckle.rotation.x = Math.PI / 2; buckle.rotation.z = Math.PI / 4; buckle.scale.set(1, 1.3, 1); buckle.position.set(PW - .32, this.topY + .11, 0); this.strap.add(buckle);
    const pin = new T.Mesh(new T.CylinderGeometry(.015, .015, .26, 6), MAT.brass); pin.rotation.z = Math.PI / 2; pin.position.set(PW - .32, this.topY + .12, 0); this.strap.add(pin);
    g.add(this.strap);
    shadowy(g);
    // a click target for page turning
    this.hit = new T.Mesh(new T.PlaneGeometry(PW * 2.3, PH * 1.2), new T.MeshBasicMaterial({ visible: false })); this.hit.rotation.x = -Math.PI / 2; this.hit.position.y = .4; g.add(this.hit);
    this.setFlips();
  }
  leatherTex(tint = "#5a2a14") {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 1024; const x = c.getContext("2d");
    x.fillStyle = tint; x.fillRect(0, 0, 1024, 1024);
    if (IMG.leather) { x.globalAlpha = .85; x.drawImage(IMG.leather, 0, 0, 1024, 1024); x.globalAlpha = 1; x.globalCompositeOperation = "multiply"; x.fillStyle = tint; x.fillRect(0, 0, 1024, 1024); x.globalCompositeOperation = "source-over"; }
    const t = new this.T.CanvasTexture(c); t.colorSpace = this.T.SRGBColorSpace; return t;
  }
  makeLeaf(frontTex, backTex, rigid, index) {
    const T = this.T;
    const geo = new T.PlaneGeometry(PW - .04, PH - .08, SEG, ROWS);
    const front = new T.Mesh(geo, new T.MeshStandardMaterial({ map: frontTex, emissiveMap: frontTex, emissive: 0xffffff, emissiveIntensity: 0, roughness: .95, side: T.FrontSide }));
    const back = new T.Mesh(geo, new T.MeshStandardMaterial({ map: backTex, emissiveMap: backTex, emissive: 0xffffff, emissiveIntensity: 0, roughness: .95, side: T.BackSide }));
    this.glowMats = this.glowMats || []; this.glowMats.push(front.material, back.material);
    front.castShadow = true; front.receiveShadow = back.receiveShadow = true;
    const leaf = { geo, front, back, theta: 0, target: 0, index, rest: geo.attributes.position.array.slice() };
    this.group.add(front, back); return leaf;
  }
  makeCover(insideTex, leather) {
    const T = this.T; const { MAT } = this.ctx;
    const pivot = new T.Group(); pivot.position.set(0, this.topY + .02, 0); this.group.add(pivot);
    const art = this.coverArt();
    const top = new T.Mesh(new T.PlaneGeometry(PW + .1, PH + .14), new T.MeshStandardMaterial({ map: art, normalMap: this.ctx.leatherN, normalScale: new T.Vector2(.8, .8), roughness: .55, bumpMap: art, bumpScale: 1.2 }));
    top.rotation.x = -Math.PI / 2; top.position.set((PW + .1) / 2, .035, 0); pivot.add(top);
    const inside = new T.Mesh(new T.PlaneGeometry(PW + .1, PH + .14), new T.MeshStandardMaterial({ map: insideTex, emissiveMap: insideTex, emissive: 0xffffff, emissiveIntensity: 0, roughness: .95, side: T.BackSide }));
    this.glowMats = this.glowMats || []; this.glowMats.push(inside.material);
    inside.rotation.x = -Math.PI / 2; inside.position.set((PW + .1) / 2, -.034, 0); pivot.add(inside);
    const edge = new T.Mesh(new T.BoxGeometry(PW + .1, .052, PH + .14), leather); edge.position.set((PW + .1) / 2, 0, 0); edge.scale.set(.999, 1, .999); pivot.add(edge);
    // brass corners and a glowing gem in the medallion
    [[PW + .05, -PH / 2 - .07, 0], [PW + .05, PH / 2 + .07, 1]].forEach(([x, z, f]) => {
      const sh = new T.Shape(); sh.moveTo(0, 0); sh.lineTo(-.36, 0); sh.quadraticCurveTo(-.1, -.1, 0, -.36); sh.lineTo(0, 0);
      const c = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: .02, bevelEnabled: true, bevelSize: .01, bevelThickness: .01, bevelSegments: 2 }), MAT.brass);
      c.rotation.x = -Math.PI / 2; if (f) c.rotation.z = 0; else { c.scale.y = -1; } c.position.set(x, .04, z); pivot.add(c);
    });
    const gemMat = new T.MeshPhysicalMaterial({ color: 0x40e0c0, emissive: 0x18b090, emissiveIntensity: .9, roughness: .05, clearcoat: 1, flatShading: true });
    const gem = new T.Mesh(new T.OctahedronGeometry(.13, 1), gemMat); gem.scale.y = .5; gem.position.set((PW + .1) / 2, .08, .62); pivot.add(gem);
    const bezel = new T.Mesh(new T.TorusGeometry(.16, .03, 8, 32), MAT.brass); bezel.rotation.x = Math.PI / 2; bezel.position.copy(gem.position).setY(.05); pivot.add(bezel);
    this.gemMat = gemMat; this.gemLight = new T.PointLight(0x40ffd0, 0, 1.6, 2); this.gemLight.position.set((PW + .1) / 2, .4, .62); pivot.add(this.gemLight);
    return { pivot, theta: 0 };
  }
  coverArt() {
    const c = document.createElement("canvas"); c.width = 1024; c.height = Math.round(1024 * (PH + .14) / (PW + .1)); const g = c.getContext("2d"); const w = c.width, h = c.height;
    g.fillStyle = "#5a2a14"; g.fillRect(0, 0, w, h);
    if (IMG.leather) { g.globalAlpha = .9; g.drawImage(IMG.leather, 0, 0, w, h); g.globalAlpha = 1; g.globalCompositeOperation = "multiply"; g.fillStyle = "#7a3a1a"; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "source-over"; }
    const vg = g.createRadialGradient(w * .45, h * .4, 60, w / 2, h / 2, w); vg.addColorStop(0, "rgba(255,200,140,.12)"); vg.addColorStop(1, "rgba(0,0,0,.5)"); g.fillStyle = vg; g.fillRect(0, 0, w, h);
    // spine shading
    const sg = g.createLinearGradient(0, 0, 90, 0); sg.addColorStop(0, "rgba(0,0,0,.6)"); sg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = sg; g.fillRect(0, 0, 90, h);
    const gold = g.createLinearGradient(0, 0, 0, h); gold.addColorStop(0, "#f8e0a0"); gold.addColorStop(.5, "#c8923c"); gold.addColorStop(1, "#f0cf80");
    g.strokeStyle = gold; g.lineWidth = 7; g.strokeRect(110, 70, w - 180, h - 140); g.lineWidth = 2.5; g.strokeRect(132, 92, w - 224, h - 184);
    // vine tooling in the frame
    g.lineWidth = 3; for (let i = 0; i < 18; i++) { const y = 120 + i * (h - 240) / 18; g.beginPath(); g.moveTo(121, y); g.quadraticCurveTo(160, y + 20, 121, y + 40); g.stroke(); g.beginPath(); g.moveTo(w - 81, y); g.quadraticCurveTo(w - 120, y + 20, w - 81, y + 40); g.stroke(); }
    g.fillStyle = gold; g.textAlign = "center";
    g.shadowColor = "rgba(0,0,0,.7)"; g.shadowOffsetY = 3; g.shadowBlur = 2;
    g.font = "700 87px 'Cinzel Decorative'"; g.fillText("My Story", w / 2 + 20, 340);
    g.font = "700 37px 'Cinzel Decorative'"; g.fillText("Fabian Corsalini", w / 2 + 20, 430);
    g.font = "700 25px 'Cinzel Decorative'"; g.fillText("Full-stack Developer  ·  MMXXVI", w / 2 + 20, h - 150);
    // medallion
    g.shadowBlur = 0; g.lineWidth = 6; g.beginPath(); g.arc(w / 2 + 20, h * .5 + 140, 120, 0, 7); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(w / 2 + 20, h * .5 + 140, 100, 0, 7); g.stroke();
    for (let i = 0; i < 16; i++) { g.save(); g.translate(w / 2 + 20, h * .5 + 140); g.rotate(i / 16 * Math.PI * 2); g.beginPath(); g.moveTo(0, -125); g.lineTo(10, -160); g.lineTo(0, -195 + (i % 2) * 20); g.lineTo(-10, -160); g.closePath(); g.fill(); g.restore(); }
    const t = new this.T.CanvasTexture(c); t.colorSpace = this.T.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  pageTextures() {
    const F = (s, f = "Spectral") => `${s}px ${f}`;
    const ink = "#140c05", soft = "#24180d", meta = "#7a2c12", gold = "#7a4e0e";
    const head = (g, t, x, y) => { g.fillStyle = ink; g.font = "700 56px 'Cinzel Decorative'"; g.fillText(t, x, y); g.strokeStyle = "rgba(138,90,20,.55)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y + 22); g.quadraticCurveTo(x + 300, y + 34, x + 620, y + 18); g.stroke(); return y + 90; };
    const entry = (g, x, y, w, role, org, when, body) => {
      g.fillStyle = ink; g.font = "700 38px 'Cinzel Decorative'"; g.fillText(role, x, y);
      g.fillStyle = soft; g.font = F(34); const oy = wrap(g, org, x, y + 50, w, 42) - 42;
      g.fillStyle = meta; g.font = F(38, "Caveat"); g.fillText(when, x, oy + 44);
      g.fillStyle = ink; g.font = F(31); return wrap(g, body, x, oy + 96, w, 46) + 26;
    };
    const P = [];
    // one chapter per page, written out: the situation, what I did, the result, what I learned and the tools
    const label = (g, t, x, y) => { g.fillStyle = meta; g.font = F(40, "Caveat"); g.fillText(t, x, y); return y + 40; };
    const chapter = (g, x, y, w, c, n) => {
      g.fillStyle = meta; g.font = F(44, "Caveat"); g.fillText(`Chapter ${n} · ${c.when}`, x, y);
      g.fillStyle = ink; g.font = "700 44px 'Cinzel Decorative'"; y = wrap(g, c.title, x, y + 62, w, 52);
      g.strokeStyle = "rgba(138,90,20,.55)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 30); g.quadraticCurveTo(x + 200, y - 22, x + 420, y - 34); g.stroke();
      g.fillStyle = soft; g.font = "italic 32px Spectral"; y = wrap(g, c.context, x, y + 14, w, 46) + 8;
      y = label(g, "What I did", x, y + 22); g.fillStyle = ink; g.font = F(32); y = wrap(g, c.did, x, y, w, 46) + 8;
      if (c.result) { y += 14; g.fillStyle = "rgba(138,90,20,.1)"; const top = y - 32; g.font = "700 29px Spectral"; const lines = Math.ceil(g.measureText("Result: " + c.result).width / (w - 40)); g.fillRect(x - 14, top, w + 14, lines * 41 + 22); g.fillStyle = gold; g.fillRect(x - 14, top, 5, lines * 41 + 22); g.fillStyle = ink; y = wrap(g, "Result: " + c.result, x + 8, y, w - 30, 41) + 18; }
      // the lessons only when they fit on the page, so nothing is ever cut off at the bottom
      if (c.learned && y + 90 + c.learned.length * 46 < PY - 70) { y = label(g, "What I took from it", x, y + 26);
        c.learned.forEach(t => { g.fillStyle = gold; g.font = "700 22px 'Cinzel Decorative'"; g.fillText("✦", x + 2, y); g.fillStyle = soft; g.font = F(31); y = wrap(g, t, x + 40, y, w - 46, 43) + 4; }); }
      if (c.skills && y + 60 < PY - 70) { y += 22; g.fillStyle = meta; g.font = "italic 28px Spectral"; y = wrap(g, "Tools: " + c.skills, x, y, w, 38); }
      return y + 40;
    };
    const chs = STORY.chapters, rest = chs.slice(1), per = Math.max(1, Math.ceil(rest.length / 4));
    // P0 — title page + first chapter
    P.push(this.canvasTex((g, w, h) => {
      g.fillStyle = "#4a2210"; g.fillRect(0, 0, w, h);
      g.save(); g.translate(30, 30); paperBG(g, w - 60, h - 60, { gutter: "right", sx: .15, sy: .3 }); g.restore();
      g.fillStyle = gold; g.font = "900 82px 'Cinzel Decorative'"; g.fillText("My Story", 100, 190);
      g.fillStyle = soft; g.font = "italic 32px Spectral"; let y = wrap(g, STORY.intro, 100, 250, 820, 44);
      y = label(g, "Who I am", 100, y + 34); g.fillStyle = ink; g.font = F(31); y = wrap(g, STORY.who, 100, y, 820, 45);
      g.strokeStyle = "rgba(138,90,20,.4)"; g.lineWidth = 2; g.beginPath(); g.moveTo(100, y + 24); g.lineTo(920, y + 24); g.stroke();
      chapter(g, 100, y + 100, 820, chs[0], 1);
    }, true));
    // P1..P4 — the following chapters
    for (let p = 0; p < 4; p++) {
      const list = rest.slice(p * per, p * per + per);
      P.push(this.canvasTex((g, w, h) => {
        paperBG(g, w, h, { gutter: p % 2 ? "right" : "left", sx: .2 + p * .1, sy: .3 });
        let y = 130; list.forEach((c, i) => { y = chapter(g, 110, y, 800, c, 2 + p * per + i); });
      }, p % 2 === 1));
    }
    // P5 — what's next
    P.push(this.canvasTex((g, w, h) => {
      paperBG(g, w, h, { gutter: "left", sx: .45, sy: .45 });
      g.fillStyle = meta; g.font = F(46, "Caveat"); g.fillText("To be continued", 110, 150);
      g.fillStyle = ink; g.font = "700 56px 'Cinzel Decorative'"; g.fillText(STORY.next.title, 110, 230);
      g.fillStyle = ink; g.font = F(36); let y = wrap(g, STORY.next.text, 110, 320, 800, 56);
      // the story ends with an open road: one invitation, no repeated details
      y += 90; g.strokeStyle = "rgba(58,42,28,.55)"; g.lineWidth = 4; g.setLineDash([16, 14]); g.beginPath(); g.moveTo(150, y); g.bezierCurveTo(380, y + 160, 560, y - 60, 820, y + 170); g.stroke(); g.setLineDash([]);
      g.fillStyle = "#8e2a1a"; g.beginPath(); g.arc(820, y + 170, 16, 0, 7); g.fill();
      g.fillStyle = "#3a2414"; g.font = F(66, "Caveat"); g.fillText("Your project could be", 150, y + 300); g.fillText("the next chapter.", 150, y + 372);
    }));
    // endpaper
    P.push(this.canvasTex((g, w, h) => {
      g.fillStyle = "#2a3a4a"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { const x = Math.random() * w, y = Math.random() * h, r = 20 + Math.random() * 90; const c = ["rgba(200,170,110,.35)", "rgba(120,40,30,.35)", "rgba(30,60,80,.5)", "rgba(230,210,170,.25)"][i % 4]; g.strokeStyle = c; g.lineWidth = 3 + Math.random() * 6; g.beginPath(); g.ellipse(x, y, r, r * .45, Math.random() * 3, 0, 7); g.stroke(); }
    }, true));
    return P;
  }
  // ---------------------------------------------------------------- deform a leaf
  bendLeaf(leaf, theta, idx) {
    // a page is a chain of small segments; the free edge lags behind the
    // spine while turning, and the whole sheet bows gently like real paper
    const pos = leaf.geo.attributes.position; const n = SEG + 1; const W = PW - .04;
    const flipping = theta > .001 && theta < Math.PI - .001; const s = Math.sin(theta);
    const yR = this.topY + .003 + (2 - idx) * .004, yL = .125 + idx * .006;
    const baseY = yR + (yL - yR) * (theta / Math.PI) + s * .05;
    const dir = Math.sign(leaf.dir || 1);
    let x = 0, y = baseY; const step = W / SEG; const xs = [0], ys = [baseY];
    for (let i = 1; i < n; i++) { const d = i / SEG; const lag = flipping ? dir * (1.55 * s * Math.pow(d, 1.7) - .25 * s * d) : 0; const a = theta - lag; x += Math.cos(a) * step; y += Math.sin(a) * step; xs.push(x); ys.push(y); }
    const rows = pos.count / n;
    for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) {
      const k = r * n + i; const zr = leaf.rest[k * 3 + 1]; const zn = zr / (PH - .08) + .5; const d = i / SEG;
      const bow = (flipping ? s * .09 * Math.sin(Math.PI * zn) * Math.pow(d, 1.2) : .006 * Math.sin(Math.PI * zn) * Math.sin(Math.PI * d));
      pos.setXYZ(k, xs[i], ys[i] + bow, -zr);
    }
    pos.needsUpdate = true; leaf.geo.computeVertexNormals();
  }
  setFlips() {
    this.leaves.forEach((l, i) => this.bendLeaf(l, l.theta, i));
    this.cover.pivot.rotation.z = this.cover.theta;
    this.cover.pivot.position.y = this.topY + .02 + Math.sin(this.cover.theta) * .03 - (this.cover.theta / Math.PI) * (this.topY - .02);
  }
  // ---------------------------------------------------------------- open / close
  async open(from) {
    const { tween, moveCamera, camera, wait } = this.ctx; const T = this.T;
    this.build();
    const g = this.group; g.visible = true;
    this.leaves.forEach(l => l.theta = 0); this.cover.theta = 0; this.spread = 0; this.setFlips();
    this.strap.position.set(0, 0, 0); this.strap.visible = true;
    const end = new T.Vector3(-PW / 2, 0, .3), start = new T.Vector3(from.x - PW / 2, 3, from.z);
    moveCamera(new T.Vector3(0, 7.3, .27), new T.Vector3(0, 0, .25), 1.9, "io");
    start.copy(end).add(new T.Vector3(0, .45, -.6)); await tween(1.5, k => { g.position.lerpVectors(start, end, k); g.rotation.set(0, (1 - k) * .1, 0); g.scale.setScalar(.94 + k * .06); }, "o");
    await tween(.3, k => { g.position.y = Math.sin(k * Math.PI) * .06; }, "o");
    // unbuckle
    await tween(.6, k => { this.strap.position.set(k * .6, k * .1, 0); this.strap.rotation.z = -k * .3; }, "io");
    this.strap.visible = false;
    tween(.6, k => { this.gemLight.intensity = k * 2; }, "o");
    // open the cover while the book slides so the spread is centred
    await tween(1.5, k => { this.cover.theta = k * Math.PI; g.position.x = -PW / 2 + k * PW / 2; this.setFlips(); }, "io");
    this.spread = 1; this.sideLabels();
  }
  async close() {
    const { tween } = this.ctx; const g = this.group; document.body.classList.remove("pp-on"); this.ctx.showLinks([]);
    // flip everything back and close
    for (let i = this.leaves.length - 1; i >= 0; i--) if (this.leaves[i].theta > 0) { const l = this.leaves[i]; l.dir = -1; await tween(.35, k => { l.theta = Math.PI * (1 - k); this.setFlips(); }, "io"); }
    await tween(.9, k => { this.cover.theta = Math.PI * (1 - k); g.position.x = -k * PW / 2; this.setFlips(); }, "io");
    const p0 = g.position.clone();
    await tween(1.0, k => { g.position.set(p0.x, k * 2.4, p0.z - k * 1.4); }, "io");
    g.visible = false; g.rotation.set(0, 0, 0); g.scale.setScalar(1); this.spread = 0; this.gemLight.intensity = 0;
  }
  async turn(dir) {
    if (this.busy) return; const { tween } = this.ctx;
    if (dir > 0 && this.spread >= 3) return; const idx = dir > 0 ? this.spread - 1 : this.spread - 2; const leaf = this.leaves[idx]; if (!leaf) return;
    this.busy = true; leaf.dir = dir;
    const from = leaf.theta, to = dir > 0 ? Math.PI : 0;
    await tween(1.35, k => { leaf.theta = from + (to - from) * k; this.setFlips(); }, "io");
    this.spread += dir; this.busy = false; this.sideLabels();
  }
  nav(dir) { this.turn(dir); }
  sideLabels() {
    this.ctx.showLinks(this.spread >= 3 ? [["Return to the map", "#map"]] : []);
    const ch = STORY.chapters;
    const prevB = document.getElementById("pp-prev"), nextB = document.getElementById("pp-next");
    const s = this.spread; document.body.classList.toggle("pp-on", s >= 1);
    prevB.style.visibility = s > 1 ? "" : "hidden"; nextB.style.visibility = s < 3 ? "" : "hidden";
    if (s > 1) prevB.querySelector(".t").textContent = s === 2 ? ch[0].title : ch[2].title;
    if (s < 3) nextB.querySelector(".t").textContent = s === 1 ? ch[2].title : ch[4].title;
        prevB.querySelector("small").textContent = "Previous page"; nextB.querySelector("small").textContent = "Next page";
  }
  async goTo(spread) { while (this.spread < spread) await this.turn(1); }
  click(ray) {
    if (this.spread < 1) return;
    const hits = ray.intersectObject(this.hit); if (!hits.length) { this.ctx.closeSection(); return; }
    const local = this.group.worldToLocal(hits[0].point.clone());
    this.turn(local.x > 0 ? 1 : -1);
  }
  key(k) { if (k === "ArrowRight") this.turn(1); if (k === "ArrowLeft") this.turn(-1); }
  update(t) { if (this.gemMat) this.gemMat.emissiveIntensity = .6 + Math.sin(t * 2.2) * .35; (this.glowMats || []).forEach(m => m.emissiveIntensity = .16 * this.ctx.S.focus); }
}
