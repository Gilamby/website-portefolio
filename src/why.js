// "Why hire me": the treasure chest from the map opens on the desk and four
// cards float out, landing in a calm 2 x 2 grid that you read from above.
import { paperBG, wrap } from "./pages.js";
import { PROFILE } from "./content.js";

const CW = 2.5, CH = 1.66, CPX = 1200, CPY = Math.round(1200 * CH / CW);
const SPOTS = [[-1.36, -.66], [1.36, -.66], [-1.36, 1.1], [1.36, 1.1]];

export class Why {
  constructor(ctx) {
    this.ctx = ctx; this.T = ctx.THREE; this.group = new this.T.Group(); this.group.visible = false; ctx.scene.add(this.group);
    this.built = false; this.handVisible = false;
    this.light = { color: 0xffd8a0, pos: [0, 7.5, 2.5], target: [0, 0, .3], angle: .55, power: 40, candles: .6, rim: 1.2 };
  }
  cardTex(k, title, text) {
    const T = this.T, c = document.createElement("canvas"); c.width = CPX; c.height = CPY; const g = c.getContext("2d");
    paperBG(g, CPX, CPY, { tint: "#f2e6ca", sx: .2 + k * .15, sy: .3, texA: .38 });
    g.strokeStyle = "rgba(138,90,20,.45)"; g.lineWidth = 3; g.strokeRect(34, 34, CPX - 68, CPY - 68);
    // number in a small gold seal
    g.fillStyle = "#b8862e"; g.beginPath(); g.arc(120, 128, 46, 0, 7); g.fill(); g.strokeStyle = "rgba(90,58,10,.8)"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#fff4d8"; g.font = "700 50px 'Cinzel Decorative'"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(k + 1), 120, 132); g.textAlign = "left"; g.textBaseline = "alphabetic";
    g.fillStyle = "#1c120a"; g.font = "700 62px 'Cinzel Decorative'"; g.fillText(title, 196, 150);
    g.strokeStyle = "rgba(138,90,20,.55)"; g.lineWidth = 2; g.beginPath(); g.moveTo(196, 178); g.lineTo(196 + Math.min(g.measureText(title).width, 820), 178); g.stroke();
    g.fillStyle = "#2a1c12"; g.font = "50px Spectral"; wrap(g, text, 84, 272, CPX - 168, 70);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  velvetTex() { // deep wine-red velvet with a thin embroidered gold border
    const T = this.T, c = document.createElement("canvas"); c.width = 1600; c.height = 1140; const g = c.getContext("2d"), w = c.width, h = c.height;
    const bg = g.createRadialGradient(w / 2, h * .45, 60, w / 2, h / 2, w * .7); bg.addColorStop(0, "#5a1620"); bg.addColorStop(1, "#2a070c"); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const im = g.getImageData(0, 0, w, h), d = im.data; for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - .5) * 14; d[i] += n; d[i + 1] += n * .5; d[i + 2] += n * .5; } g.putImageData(im, 0, 0);
    g.strokeStyle = "#c79a46"; g.lineWidth = 6; g.strokeRect(46, 46, w - 92, h - 92); g.lineWidth = 2; g.strokeRect(62, 62, w - 124, h - 124);
    g.fillStyle = "#d8ac58"; g.font = "700 64px 'Cinzel Decorative'"; g.textAlign = "center"; g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 6; g.fillText("Why hire me", w / 2, h - 84); g.shadowBlur = 0;
    g.strokeStyle = "#c79a46"; g.lineWidth = 2; [[-1, 1]].forEach(() => { g.beginPath(); g.moveTo(w / 2 - 420, h - 116); g.lineTo(w / 2 - 270, h - 116); g.moveTo(w / 2 + 270, h - 116); g.lineTo(w / 2 + 420, h - 116); g.stroke(); }); g.textAlign = "left";
    g.fillStyle = "#c79a46"; [[46, 46], [w - 46, 46], [46, h - 46], [w - 46, h - 46]].forEach(([x, y]) => { g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillRect(-14, -14, 28, 28); g.restore(); });
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  build() {
    if (this.built) return; this.built = true;
    const T = this.T, { MAT, shadowy, RoundedBoxGeometry, tex } = this.ctx;
    // the chest
    const wood = new T.MeshStandardMaterial({ map: tex("tex/darkwood_paint.jpg"), roughness: .65, color: 0xa0704a });
    this.chest = new T.Group(); this.group.add(this.chest);
    const body = new T.Mesh(new RoundedBoxGeometry(1.5, .62, .95, 3, .05), wood); body.position.y = .31; this.chest.add(body);
    [-.52, .52].forEach(x => { const b = new T.Mesh(new T.BoxGeometry(.08, .64, .98), MAT.brass); b.position.set(x, .32, 0); this.chest.add(b); });
    const lock = new T.Mesh(new T.BoxGeometry(.18, .2, .04), MAT.brass); lock.position.set(0, .48, .49); this.chest.add(lock);
    // gold inside, glowing softly
    const gold = new T.Mesh(new T.BoxGeometry(1.36, .06, .82), new T.MeshStandardMaterial({ color: 0xf2c95a, metalness: 1, roughness: .35, emissive: 0xffb84a, emissiveIntensity: .25 })); gold.position.y = .56; this.chest.add(gold);
    this.glow = new T.PointLight(0xffc870, 0, 3, 2); this.glow.position.set(0, .9, 0); this.chest.add(this.glow);
    // lid on a hinge at the back
    this.hinge = new T.Group(); this.hinge.position.set(0, .62, -.475); this.chest.add(this.hinge);
    const lid = new T.Mesh(new T.CylinderGeometry(.475, .475, 1.5, 24, 1, false, 0, Math.PI), wood); lid.rotation.z = Math.PI / 2; lid.scale.set(1, 1, .55); lid.position.z = .475; this.hinge.add(lid);
    [-.52, .52].forEach(x => { const b = new T.Mesh(new T.CylinderGeometry(.485, .485, .08, 24, 1, true, 0, Math.PI), MAT.brass); b.rotation.z = Math.PI / 2; b.scale.set(1, 1, .56); b.position.set(x, 0, .475); this.hinge.add(b); });
    shadowy(this.chest);
    // a velvet cloth rolls out over the map, so the cards rest on one calm, dark surface
    const vt = this.velvetTex(), VW = 6.4, VD = 4.3;
    const vg = new T.PlaneGeometry(VW, VD, 1, 80); vg.translate(0, -VD / 2, 0); this.VD = VD; this.clothY0 = Float32Array.from({ length: vg.attributes.position.count }, (_, k) => vg.attributes.position.getY(k));
    this.cloth = new T.Mesh(vg, new T.MeshPhysicalMaterial({ map: vt, roughness: .9, sheen: 1, sheenRoughness: .5, sheenColor: new T.Color(0xff9aa8) })); this.cloth.rotation.x = -Math.PI / 2; this.cloth.position.set(0, .085, -1.6); this.cloth.receiveShadow = true; this.cloth.visible = false; this.group.add(this.cloth);
    // the four cards
    this.cards = PROFILE.why.map(([title, text], k) => {
      const t = this.cardTex(k, title, text);
      const m = new T.Mesh(new T.PlaneGeometry(CW, CH), new T.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: .06, roughness: .92, side: T.DoubleSide }));
      m.castShadow = true; m.receiveShadow = true; m.visible = false; m.userData.spin = (k % 2 ? 1 : -1) * (.015 + k * .006); this.group.add(m); return m;
    });
    this.chestAt = new T.Vector3(0, 0, -2.05);
  }
  unroll(k) { // k = 0 rolled up at the far edge, 1 lying flat; the cloth wraps around a thin roll like the map
    const P = this.cloth.geometry.attributes.position, yf = -k * (this.VD + .5), r = .08;
    for (let i = 0; i < P.count; i++) { const y = this.clothY0[i]; if (y >= yf) { P.setY(i, y); P.setZ(i, 0); continue; } const th = (yf - y) / r; P.setY(i, yf - r * Math.sin(th)); P.setZ(i, r * (1 - Math.cos(th))); }
    P.needsUpdate = true; this.cloth.geometry.computeVertexNormals();
  }
  // HIDDEN FEATURE: tap the chest and it bursts with coins while the four cards dance around it, then land again
  click(ray) {
    if (this.busy || this.dancing) return;
    if (ray.intersectObject(this.chest, true).length) { this.treasure(); return; }
    if (!ray.intersectObjects(this.cards, false).length) this.ctx.closeSection();
  }
  async treasure() {
    this.dancing = true; this.ctx.secret("treasure"); const { tween, burst } = this.ctx, V = this.T.Vector3;
    const c = this.chest.position.clone(), home = this.cards.map(m => ({ p: m.position.clone(), r: m.rotation.clone() }));
    const top = this.chest.localToWorld(new V(0, .75, 0));
    burst(top, { n: 140, speed: 1.1, up: [1.4, 2.6], g: -3.2, life: 1.8, size: 1.3, flat: .8, color: 0xffcf5a });
    setTimeout(() => burst(top, { n: 60, speed: .8, up: [1.2, 2], g: -3, life: 1.6, size: 1, color: 0xfff0b0 }), 350);
    const g0 = this.glow.intensity; tween(2.6, k => { this.glow.intensity = g0 + Math.sin(k * Math.PI) * 9; this.chest.rotation.z = Math.sin(k * Math.PI * 10) * .04 * (1 - k); }, "lin");
    await tween(3.2, k => this.cards.forEach((m, i) => {
      const off = new V().subVectors(home[i].p, c), r = Math.hypot(off.x, off.z), a0 = Math.atan2(off.z, off.x), a = a0 + k * Math.PI * 2;
      const lift = Math.sin(k * Math.PI);
      m.position.set(c.x + Math.cos(a) * r * (1 - .25 * lift), home[i].p.y + lift * (.9 + .15 * Math.sin(k * Math.PI * 6 + i)), c.z + Math.sin(a) * r * (1 - .25 * lift));
      m.rotation.set(home[i].r.x + lift * .6, home[i].r.y, home[i].r.z + k * Math.PI * 2);
    }), "io");
    this.cards.forEach((m, i) => { m.position.copy(home[i].p); m.rotation.copy(home[i].r); burst(m.getWorldPosition(new V()), { n: 8, speed: .4, life: .6, size: .8 }); });
    this.dancing = false;
  }
  place(m, k, f, from) { // f: 0 inside the chest, 1 resting on the desk
    const [x, z] = SPOTS[k], T = this.T, side = k % 2 ? 1 : -1;
    const a = from.clone().add(new T.Vector3(0, .5, 0)), b = new T.Vector3(x, .12 + k * .004, z);
    const p = new T.Vector3().lerpVectors(a, b, f);
    p.y += Math.sin(f * Math.PI) * 1.5 + Math.max(0, Math.sin((f - .86) / .14 * Math.PI)) * .05;   // high arc, then a small soft landing
    m.position.copy(p);
    m.rotation.set(-Math.PI / 2 * Math.min(1, f * 1.15) - (1 - f) * .25, 0, m.userData.spin * f + side * (1 - f) * 1.1);
    m.scale.setScalar(.35 + .65 * Math.min(1, f * 1.2));
  }

  async open(from) {
    const { tween, moveCamera } = this.ctx, T = this.T; this.build();
    this.group.visible = true; this.hinge.rotation.x = 0; this.glow.intensity = 0;
    this.cards.forEach(m => m.visible = false);
    moveCamera(new T.Vector3(0, 9.0, 3.3), new T.Vector3(0, 0, .5), 2.0, "io");
    const end = this.chestAt.clone(), start = end.clone().add(new T.Vector3(0, .45, -.6));
    await tween(1.4, k => { this.chest.position.lerpVectors(start, end, k); }, "o");
    this.cloth.visible = true; this.unroll(0);
    tween(.9, k => { this.hinge.rotation.x = -k * 1.9; this.glow.intensity = k * 2.2; }, "io");
    this.ctx.burst && this.ctx.burst(end.clone().add(new T.Vector3(0, .7, 0)), { n: 46, color: 0xffd27a, speed: .9, up: [1.4, 2.6], life: 1.6, size: 1.2, spread: .35, g: -1.6 });
    await tween(1.4, k => this.unroll(k), "io");
    // cards float out one after another
    await Promise.all(this.cards.map((m, k) => tween(1.5, f => { m.visible = true; this.place(m, k, f, end); }, "io", k * .28)));
    this.landed = true;
  }
  async close() {
    const { tween } = this.ctx; this.landed = false;
    const end = this.chest.position.clone();
    await Promise.all(this.cards.map((m, k) => tween(.8, f => this.place(m, k, 1 - f, end), "io", (3 - k) * .08)));
    this.cards.forEach(m => m.visible = false);
    tween(.8, k => this.unroll(1 - k), "io");
    await tween(.5, k => { this.hinge.rotation.x = -1.9 * (1 - k); this.glow.intensity = 2.2 * (1 - k); }, "io");
    const p0 = this.chest.position.clone(); await tween(.9, k => { this.chest.position.set(p0.x, p0.y + k * 2.4, p0.z - k * 1.4); }, "io");
    this.group.visible = false; this.cloth.visible = false;
  }
  click() { this.ctx.closeSection(); }
  update(t) {
    if (!this.built || !this.group.visible) return;
    const hit = this.landed && this.ctx.ray ? this.ctx.ray().intersectObjects(this.cards, false)[0] : null;
    this.cards.forEach((m, k) => {
      const on = hit && hit.object === m ? 1 : 0; m.userData.h = (m.userData.h || 0) + (on - (m.userData.h || 0)) * .12;
      if (this.landed) { m.position.y = .12 + k * .004 + m.userData.h * .1; m.rotation.x = -Math.PI / 2 + m.userData.h * .05; }
      m.material.emissiveIntensity = .06 * this.ctx.S.focus + m.userData.h * .12;
    });
    this.glow.intensity = this.hinge.rotation.x < -1 ? 2.0 + Math.sin(t * 2) * .25 : this.glow.intensity;
  }

}
