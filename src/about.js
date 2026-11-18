// "About Me": an old travel trunk. The lid swings open towards the camera and
// shows a pinned-up profile poster, with tool badges pinned around it like a locker.
import { IMG, paperBG, wrap, tape, polaroid, doodleArrow } from "./pages.js";
import { PROFILE, SKILL_AREAS } from "./content.js";

const TW = 3.6, TH = 1.15, TD = 2.2;

export class About {
  constructor(ctx) {
    this.ctx = ctx; this.T = ctx.THREE; this.group = new this.T.Group(); this.group.visible = false; ctx.scene.add(this.group);
    this.built = false; this.handVisible = false;
    this.light = { color: 0xffd9a8, pos: [0, 5.5, 4.2], target: [0, .9, .2], angle: .5, power: 30, candles: .5, rim: .6 };
  }
  posterTex(mode = "profile") {
    const T = this.T; const c = document.createElement("canvas"); c.width = 1800; c.height = 1080; const g = c.getContext("2d"); const w = c.width, h = c.height;
    // dark felt lining of the lid
    g.fillStyle = "#2a1f1a"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? "255,240,220" : "0,0,0"},${Math.random() * .05})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    const v = g.createRadialGradient(w / 2, h * .4, 100, w / 2, h / 2, w * .7); v.addColorStop(0, "rgba(255,200,140,.10)"); v.addColorStop(1, "rgba(0,0,0,.55)"); g.fillStyle = v; g.fillRect(0, 0, w, h);
    // pinned parchment poster
    g.save(); g.translate(240, 70); g.rotate(-.012);
    g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 30; g.shadowOffsetY = 14; g.fillStyle = "#efe2c4"; g.fillRect(0, 0, 1320, 940); g.shadowColor = "transparent";
    paperBG(g, 1320, 940, { tint: "#f1e5c8", sx: .2, sy: .2 });
    if (mode !== "why") {
    polaroid(g, IMG.fabian, 330, 330, 430, 520, -.04, "");
    // gold name in the brand face, handwritten notes around it
    const gold = g.createLinearGradient(0, 120, 0, 300); gold.addColorStop(0, "#b8862e"); gold.addColorStop(.5, "#8a5a14"); gold.addColorStop(1, "#c79a46");
    const [fn, ...ln] = PROFILE.name.split(" "); g.fillStyle = gold; g.font = "900 92px 'Cinzel Decorative'"; g.fillText(fn, 610, 150); g.fillText(ln.join(" "), 610, 245);
    g.fillStyle = "#3a2414"; g.font = "54px Caveat"; g.fillText(PROFILE.role, 615, 305);
    g.strokeStyle = "rgba(138,90,20,.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(615, 326); g.quadraticCurveTo(820, 340, 1080, 322); g.stroke();
    g.fillStyle = "#8e2a1a"; g.font = "50px Caveat"; g.fillText("About me", 615, 392);
    g.fillStyle = "#1c120a"; g.font = "34px Spectral"; let y = wrap(g, PROFILE.about[0], 615, 446, 650, 50);
    doodleArrow(g, 560, 420, 470, 340, -40);
    g.fillStyle = "#3a2414"; g.font = "38px Caveat";
    g.save(); g.translate(90, 690); g.rotate(-.05); PROFILE.notes.forEach((n, k) => g.fillText(n, 0, k * 50));
    } else {
      // the back of the poster: why hire me
      const gold = g.createLinearGradient(0, 60, 0, 170); gold.addColorStop(0, "#b8862e"); gold.addColorStop(.5, "#8a5a14"); gold.addColorStop(1, "#c79a46");
      g.fillStyle = gold; g.font = "900 84px 'Cinzel Decorative'"; g.textAlign = "center"; g.fillText("Why hire me", 660, 140); g.textAlign = "left";
      g.strokeStyle = "rgba(138,90,20,.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(470, 168); g.quadraticCurveTo(660, 182, 850, 164); g.stroke();
      PROFILE.why.forEach(([t, d], k) => {
        const x = 90 + (k % 2) * 600, y = 250 + Math.floor(k / 2) * 330;
        g.fillStyle = "#8e2a1a"; g.font = "700 30px 'Cinzel Decorative'"; g.fillText(`${k + 1}`, x, y); 
        g.fillStyle = "#1c120a"; g.font = "700 38px 'Cinzel Decorative'"; g.fillText(t, x + 38, y);
        g.fillStyle = "#2a1c12"; g.font = "28px Spectral"; wrap(g, d, x, y + 50, 530, 38);
      });
    }
    g.restore();
    tape(g, 300, 76, 190, 52, -.2); tape(g, 1500, 80, 190, 52, .25); tape(g, 300, 1000, 170, 48, .2); tape(g, 1500, 1004, 170, 48, -.25);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  badgeTex(label, color) {
    const T = this.T; const c = document.createElement("canvas"); c.width = 256; c.height = 256; const g = c.getContext("2d");
    const gr = g.createRadialGradient(100, 90, 10, 128, 128, 128); gr.addColorStop(0, "#fff6d8"); gr.addColorStop(.25, "#e8c37a"); gr.addColorStop(1, "#8a5a1e"); g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill();
    g.fillStyle = color; g.beginPath(); g.arc(128, 128, 104, 0, 7); g.fill();
    const sh = g.createLinearGradient(0, 30, 0, 230); sh.addColorStop(0, "rgba(255,255,255,.35)"); sh.addColorStop(.5, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(0,0,0,.25)"); g.fillStyle = sh; g.beginPath(); g.arc(128, 128, 104, 0, 7); g.fill();
    g.fillStyle = "#fff8ea"; g.textAlign = "center"; g.textBaseline = "middle"; let size = 54; g.font = `700 ${size}px 'Cinzel Decorative'`; while (g.measureText(label).width > 176 && size > 26) { size -= 2; g.font = `700 ${size}px 'Cinzel Decorative'`; } g.save(); g.translate(256, 256); g.scale(-1, -1); g.fillText(label, 128, 124); g.restore();
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  }
  build() {
    if (this.built) return; this.built = true;
    const T = this.T, { MAT, shadowy, leatherN, tex } = this.ctx;
    const wood = new T.MeshStandardMaterial({ map: tex("tex/darkwood_paint.jpg"), roughness: .6, color: 0xc8a080 });
    const leather = new T.MeshStandardMaterial({ map: tex("tex/leather_paint.jpg"), normalMap: leatherN, roughness: .65, color: 0x9a6a4a });
    this.trunk = new T.Group(); this.group.add(this.trunk);
    // body
    const body = new T.Mesh(new this.ctx.RoundedBoxGeometry(TW, TH, TD, 3, .05), wood); body.position.y = TH / 2; this.trunk.add(body);
    const inside = new T.Mesh(new T.BoxGeometry(TW - .18, .02, TD - .18), new T.MeshStandardMaterial({ color: 0x3a2a22, roughness: 1 })); inside.position.y = TH - .1; this.trunk.add(inside);
    // leather straps and brass corners on the body
    [-TW / 3, TW / 3].forEach(x => { const s = new T.Mesh(new T.BoxGeometry(.24, TH - .02, TD + .03), leather); s.position.set(x, TH / 2 - .01, 0); this.trunk.add(s); });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const c = new T.Mesh(new T.BoxGeometry(.26, .26, .26), MAT.brass); c.position.set(sx * (TW / 2 - .1), .12, sz * (TD / 2 - .1)); this.trunk.add(c); });
    const latch = new T.Mesh(new T.BoxGeometry(.3, .26, .05), MAT.brass); latch.position.set(0, TH - .12, TD / 2 + .02); this.trunk.add(latch);
    // interior: books, pencils and a rolled diploma on the tray
    const tray = new T.Group(); tray.position.y = TH - .09; this.trunk.add(tray);
    const bookMat = (c) => new T.MeshStandardMaterial({ color: c, roughness: .7, normalMap: leatherN });
    [[-.9, .0, 0x1c3a5a, .12], [-.9, .14, 0x5a1c14, .1], [-.85, .26, 0x2c4a2c, .09]].forEach(([x, y, c, t], i) => { const b = new T.Mesh(new T.BoxGeometry(1.1, t, .8), [bookMat(c), bookMat(c), bookMat(c), bookMat(c), new T.MeshStandardMaterial({ color: 0xe8dcc0 }), bookMat(c)]); b.position.set(x, y + t / 2, .1); b.rotation.y = i * .08; tray.add(b); });
    [0x2a6ad0, 0xc8302a, 0x2a9a5a].forEach((c, i) => { const p = new T.Mesh(new T.CylinderGeometry(.03, .03, .9, 8), new T.MeshStandardMaterial({ color: c, roughness: .4 })); p.rotation.z = Math.PI / 2; p.rotation.y = .3 + i * .15; p.position.set(.2 + i * .1, .04, .5 - i * .08); tray.add(p); });
    const dip = new T.Mesh(new T.CylinderGeometry(.09, .09, 1.0, 20), new T.MeshStandardMaterial({ color: 0xece0c4, roughness: .9 })); dip.rotation.z = Math.PI / 2; dip.rotation.y = -.4; dip.position.set(1.0, .09, .0); tray.add(dip);
    const rib = new T.Mesh(new T.TorusGeometry(.1, .02, 6, 20), new T.MeshStandardMaterial({ color: 0x8e1f1c })); rib.rotation.y = Math.PI / 2 - .4; rib.position.set(1.0, .09, 0); tray.add(rib);
    // lid on a hinge at the back edge
    this.hinge = new T.Group(); this.hinge.position.set(0, TH, -TD / 2); this.trunk.add(this.hinge);
    const lid = new T.Group(); lid.position.z = TD / 2; this.hinge.add(lid);
    const lidBox = new T.Mesh(new this.ctx.RoundedBoxGeometry(TW, .3, TD, 3, .06), wood); lidBox.position.y = .15; lid.add(lidBox);
    [-TW / 3, TW / 3].forEach(x => { const s = new T.Mesh(new T.BoxGeometry(.24, .29, TD + .03), leather); s.position.set(x, .16, 0); lid.add(s); });
    const posterT = this.posterTex();
    const poster = new T.Mesh(new T.PlaneGeometry(TW - .2, TD - .16), new T.MeshStandardMaterial({ map: posterT, emissiveMap: posterT, emissive: 0xffffff, emissiveIntensity: 0, roughness: .9 }));
    poster.rotation.x = Math.PI / 2; poster.position.y = -.005; lid.add(poster); this.poster = poster;
    const whyT = this.posterTex("why");
    this.whyPoster = new T.Mesh(poster.geometry, new T.MeshStandardMaterial({ map: whyT, emissiveMap: whyT, emissive: 0xffffff, emissiveIntensity: 0, roughness: .9, transparent: true, opacity: 0, depthWrite: false }));
    this.whyPoster.rotation.x = Math.PI / 2; this.whyPoster.position.y = -.008; this.whyPoster.visible = false; lid.add(this.whyPoster); this.side = "profile";
    // a little lamp strip along the inside of the lid, like a locker light
    const strip = new T.Mesh(new T.BoxGeometry(1.4, .04, .08), new T.MeshStandardMaterial({ color: 0xfff0d0, emissive: 0xffd8a0, emissiveIntensity: 2.5 })); strip.position.set(0, -.03, TD / 2 - .14); lid.add(strip);
    this.lidLight = new T.SpotLight(0xffd9a8, 0, 5, .9, .8, 1.5); this.lidLight.position.set(0, -.1, TD / 2 - .2); lid.add(this.lidLight); this.lidLight.target.position.set(0, -2, 0); lid.add(this.lidLight.target);
    // enamel tool badges pinned around the poster
    this.badges = [];
    const spots = [[-1.6, -.45], [-1.6, .45], [1.6, -.45], [1.6, .45]];
    SKILL_AREAS.forEach(({ pin: label, color }, i) => {
      const [x, z] = spots[i]; const m = new T.Mesh(new T.CylinderGeometry(.24, .24, .04, 48), [new T.MeshStandardMaterial({ color: 0xc89a4a, metalness: 1, roughness: .3 }), new T.MeshStandardMaterial({ map: this.badgeTex(label, color), roughness: .25, metalness: .2 }), new T.MeshStandardMaterial({ color: 0x8a6a2a, metalness: 1, roughness: .4 })]);
      m.position.set(x, -.03, z); m.rotation.set(Math.PI, -Math.PI / 2, 0); m.userData = { label, z0: -.03, i }; lid.add(m); this.badges.push(m);
    });
    shadowy(this.trunk);
    this.trunk.position.set(0, 0, .55);
  }
  async open(from) {
    const { tween, moveCamera } = this.ctx; const T = this.T; this.build();
    this.group.visible = true; this.hinge.rotation.x = 0; this.lidLight.intensity = 0;
    moveCamera(new T.Vector3(0, 2.85, 5.45), new T.Vector3(0, 2.2, -.55), 2.0, "io");
    const start = new T.Vector3(from.x, 4, from.z - 2), end = new T.Vector3(0, 0, .55);
    start.copy(end).add(new T.Vector3(0, .45, -.6)); await tween(1.5, k => { this.trunk.position.lerpVectors(start, end, k); this.trunk.rotation.y = (1 - k) * -.12; }, "o");
    await tween(.25, k => { this.trunk.position.y = Math.sin(k * Math.PI) * .05; }, "o");
    // the latch clicks and the lid swings open
    this.flip("profile", true);
    await tween(1.4, k => { this.hinge.rotation.x = -k * 1.78 - Math.sin(k * Math.PI) * .05; this.lidLight.intensity = k * 6; }, "io");
  }
  async close() {
    const { tween } = this.ctx; this.showArea(null);
    await tween(.9, k => { this.hinge.rotation.x = -1.78 * (1 - k); this.lidLight.intensity = 6 * (1 - k); }, "io");
    const p0 = this.trunk.position.clone();
    await tween(1.0, k => { this.trunk.position.set(p0.x, p0.y + k * 2.4, p0.z - k * 1.4); }, "io");
    this.group.visible = false; this.trunk.rotation.y = 0;
  }
  click(ray) {
    const hits = ray.intersectObjects(this.badges, false);
    if (hits.length) { const b = hits[0].object; const { tween } = this.ctx; tween(.7, k => { b.rotation.y = -Math.PI / 2 + k * Math.PI * 2; b.position.y = b.userData.z0 - Math.sin(k * Math.PI) * .12; }, "io"); this.showArea(b.userData.label); return; }
    this.showArea(null);
    if (!ray.intersectObject(this.trunk, true).length) { this.ctx.closeSection(); return; }
    if (!ray.intersectObject(this.poster, false).length) this.zeroGravity();
  }
  // HIDDEN FEATURE: tap the trunk and the skill pins float off the poster and orbit it, then click back into place
  async zeroGravity() {
    if (this.floating) return; this.floating = true; this.ctx.secret("trunk"); const { tween } = this.ctx;
    const home = this.badges.map(b => ({ p: b.position.clone(), r: b.rotation.clone() }));
    const cx = home.reduce((a, h) => a + h.p.x, 0) / home.length, cz = home.reduce((a, h) => a + h.p.z, 0) / home.length;
    const ring = (b, i, a) => [cx + Math.cos(a + i * Math.PI / 2) * .95, cz + Math.sin(a + i * Math.PI / 2) * .62];
    await tween(.9, k => this.badges.forEach((b, i) => { const [x, z] = ring(b, i, 0); b.position.set(home[i].p.x + (x - home[i].p.x) * k, home[i].p.y - .32 * Math.sin(k * Math.PI / 2), home[i].p.z + (z - home[i].p.z) * k); b.rotation.y = home[i].r.y + k * Math.PI; }), "io");
    let lastSpark = 0;
    await tween(5.2, k => { const a = k * Math.PI * 4; this.badges.forEach((b, i) => { const [x, z] = ring(b, i, a); b.position.set(x, home[i].p.y - .32 + Math.sin(a * 2 + i) * .05, z); b.rotation.y = home[i].r.y + Math.PI + a * 1.5; b.rotation.x = home[i].r.x + Math.sin(a + i) * .3; });
      if (k - lastSpark > .04) { lastSpark = k; this.badges.forEach(b => this.ctx.burst(b.getWorldPosition(new this.T.Vector3()), { n: 2, speed: .15, up: [-.1, .1], g: 0, life: .9, size: .7, color: 0xffd890 })); } }, "lin");
    const from = this.badges.map(b => ({ p: b.position.clone(), ry: b.rotation.y, rx: b.rotation.x }));
    await tween(1.1, k => this.badges.forEach((b, i) => { b.position.lerpVectors(from[i].p, home[i].p, k); b.position.y -= Math.sin(k * Math.PI) * .06; b.rotation.y = from[i].ry + (home[i].r.y + Math.PI * 6 - from[i].ry) * k; b.rotation.x = from[i].rx + (home[i].r.x - from[i].rx) * k; }), "back");
    this.badges.forEach((b, i) => { b.position.copy(home[i].p); b.rotation.copy(home[i].r); this.ctx.burst(b.getWorldPosition(new this.T.Vector3()), { n: 10, speed: .5, life: .6, size: .8 }); });
    this.floating = false;
  }
  flip(side, instant) {
    this.side = side; this.showArea(null);
    const m = this.whyPoster.material, from = m.opacity, to = side === "why" ? 1 : 0; this.whyPoster.visible = true;
    if (instant) { m.opacity = to; this.whyPoster.visible = to > 0; return; }
    this.ctx.tween(.6, k => { m.opacity = from + (to - from) * k; if (k === 1 && to === 0) this.whyPoster.visible = false; }, "io");
  }
  action(name) { if (name === "why" || name === "profile") this.flip(name); }
  showArea(label) {
    const el = document.getElementById("skillcard"); const area = label && SKILL_AREAS.find(a => a.pin === label);
    if (!area) { el.classList.remove("on"); return; }
    el.querySelector("h3").textContent = area.title; el.querySelector("p").textContent = area.text; el.querySelector(".pins").textContent = area.tools.join(" · ");
    el.classList.add("on");
  }
  update(t) {
    if (!this.poster) return; this.poster.material.emissiveIntensity = .06 * this.ctx.S.focus; if (this.whyPoster) this.whyPoster.material.emissiveIntensity = .06 * this.ctx.S.focus;
    if (this.ctx.ray && this.group.visible) {
      const hits = this.ctx.ray().intersectObjects(this.badges, false); const hb = hits.length ? hits[0].object : null;
      this.badges.forEach(b => { const target = b === hb ? -.12 : -.03; b.position.y += (target - b.position.y) * .2; });
    }
  }
}
