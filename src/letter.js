// "Write to me": a sealed envelope; the wax cracks, the flap lifts,
// and a folded letter slides out and opens.
import { IMG, paperBG, wrap } from "./pages.js";
import { PROFILE, CONTACT } from "./content.js";

const EW = 3.2, EH = 2.0, LW = 2.9, LH = 3.6, LPX = 1100, LPY = Math.round(1100 * LH / LW);

export class Letter {
  constructor(ctx) { this.ctx = ctx; this.T = ctx.THREE; this.group = new this.T.Group(); this.group.visible = false; ctx.scene.add(this.group); this.built = false; this.handVisible = false;
    this.light = { color: 0x9fbaff, pos: [-6, 6.5, -2.5], target: [0, 0, .3], angle: .45, power: 30, candles: 1.0, rim: 1.4 }; }
  envTex(flap) {
    const T = this.T; const c = document.createElement("canvas"); c.width = 1024; c.height = Math.round(1024 * EH / EW); const g = c.getContext("2d"); const w = c.width, h = c.height;
    paperBG(g, w, h, { tint: "#e8d8b0", sx: .2, sy: .6, texA: .6 });
    if (!flap) {
      g.strokeStyle = "rgba(120,90,50,.55)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, h); g.lineTo(w / 2, h * .45); g.lineTo(w, h); g.stroke();
      g.fillStyle = "#3a2a1c"; g.font = "54px Caveat"; g.save(); g.translate(w * .52, h * .78); g.rotate(-.03); g.fillText("To: the reader", 0, 0); g.restore();
      g.save(); g.translate(w - 130, 110); g.rotate(.08); g.fillStyle = "#3a5a7a"; g.fillRect(-60, -75, 120, 150); g.strokeStyle = "#f2e6c8"; g.lineWidth = 6; g.strokeRect(-52, -67, 104, 134); g.fillStyle = "#f2e6c8"; g.font = "700 22px 'Cinzel Decorative'"; g.textAlign = "center"; g.fillText("Post", 0, 10); g.restore();
    }
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  }
  letterTex() {
    const T = this.T; const c = document.createElement("canvas"); c.width = LPX; c.height = LPY; const g = c.getContext("2d"); const w = LPX, h = LPY;
    paperBG(g, w, h, { tint: "#f0e4c6", sx: .35, sy: .15 });
    g.strokeStyle = "rgba(140,90,60,.18)"; g.lineWidth = 2; for (let y = 300; y < h - 120; y += 62) { g.beginPath(); g.moveTo(80, y); g.lineTo(w - 80, y); g.stroke(); }
    g.fillStyle = "#2a1c12"; g.font = "64px Caveat"; g.fillText("Dear reader,", 90, 200);
    g.font = "700 74px 'Cinzel Decorative'"; g.fillText("Get in touch", 90, 320);
    g.font = "48px Caveat"; g.fillStyle = "#3a2a1c";
    let y = wrap(g, "Thank you for visiting my portfolio. Are you looking for a front-end developer, or do you have a project in mind? I would be glad to hear from you.", 92, 420, w - 180, 62);
    const rows = [["Email", CONTACT.email], ["Phone", CONTACT.phone], ["Works", "Remote or on-site"]];
    y += 40; rows.forEach(([k, v]) => { g.fillStyle = "#8e2a1a"; g.font = "46px Caveat"; g.fillText(k, 92, y); g.fillStyle = "#2a1c12"; g.font = "56px Caveat"; g.fillText(v, 330, y); y += 92; });
    g.font = "52px Caveat"; g.fillStyle = "#3a2a1c"; g.fillText("Kind regards,", 92, h - 300);
    g.font = "700 100px Caveat"; g.save(); g.translate(110, h - 160); g.rotate(-.05); g.fillText(PROFILE.name, 0, 0); g.restore();
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  build() {
    if (this.built) return; this.built = true; const T = this.T; const { waxSeal, shadowy } = this.ctx;
    this.env = new T.Group(); this.group.add(this.env);
    const body = new T.Mesh(new T.BoxGeometry(EW, .04, EH), [0, 0, 0, 0, 0, 0].map((_, i) => new T.MeshStandardMaterial({ map: i === 2 ? this.envTex(false) : null, color: i === 2 ? 0xffffff : 0xd8c49a, roughness: .9 }))); body.position.y = .02; this.env.add(body);
    // flap: a triangle hinged at the top edge
    const sh = new T.Shape(); sh.moveTo(-EW / 2, 0); sh.lineTo(EW / 2, 0); sh.lineTo(0, EH * .62); sh.closePath();
    const fg = new T.ShapeGeometry(sh); const uv = fg.attributes.uv, p = fg.attributes.position; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / EW + .5, p.getY(i) / EH);
    this.flapPivot = new T.Group(); this.flapPivot.position.set(0, .045, -EH / 2); this.env.add(this.flapPivot);
    const flap = new T.Mesh(fg, new T.MeshStandardMaterial({ map: this.envTex(true), roughness: .9, side: T.DoubleSide, color: 0xf0e2c0 })); flap.rotation.x = Math.PI / 2; this.flapPivot.add(flap);
    // wax seal in two halves so it can crack
    this.sealL = waxSeal(.3, "F"); this.sealR = waxSeal(.3, "F");
    const clipL = new T.Plane(new T.Vector3(-1, 0, 0), 0), clipR = new T.Plane(new T.Vector3(1, 0, 0), 0);
    this.sealMats = [];
    this.sealL.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); this.sealMats.push([m.material, clipL]); } });
    this.sealR.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); this.sealMats.push([m.material, clipR]); } });
    this.clipL = clipL; this.clipR = clipR; this.ctx.renderer.localClippingEnabled = true;
    this.sealL.position.set(0, .06, EH * .12 - EH / 2 + EH * .5); this.sealR.position.copy(this.sealL.position); this.env.add(this.sealL, this.sealR);
    // folded letter: three panels so it can unfold
    const tex = this.letterTex();
    this.letter = new T.Group(); this.group.add(this.letter);
    this.panels = [0, 1, 2].map(i => { const g = new T.PlaneGeometry(LW, LH / 3); const uvs = g.attributes.uv; for (let k = 0; k < uvs.count; k++) uvs.setY(k, (uvs.getY(k) + (2 - i)) / 3); const m = new T.Mesh(g, new T.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0, roughness: .95, side: T.DoubleSide })); (this.glowMats = this.glowMats || []).push(m.material); m.rotation.x = -Math.PI / 2; return m; });
    // middle panel is fixed; top & bottom hinge on its edges
    this.mid = new T.Group(); this.letter.add(this.mid); this.mid.add(this.panels[1]);
    this.topHinge = new T.Group(); this.topHinge.position.z = -LH / 6; this.mid.add(this.topHinge); this.panels[0].position.z = -LH / 6; this.topHinge.add(this.panels[0]);
    this.botHinge = new T.Group(); this.botHinge.position.z = LH / 6; this.mid.add(this.botHinge); this.panels[2].position.z = LH / 6; this.botHinge.add(this.panels[2]);
    shadowy(this.group);
  }
  setFold(k) { // 0 = folded, 1 = open
    this.topHinge.rotation.x = -(1 - k) * Math.PI * .98; this.botHinge.rotation.x = (1 - k) * Math.PI * .96;
    this.topHinge.position.y = .004 * (1 - k); this.botHinge.position.y = .008 * (1 - k);
  }
  async open(from) {
    const { tween, moveCamera } = this.ctx; const T = this.T; this.build();
    this.group.visible = true; this.letter.visible = false; this.flapPivot.rotation.x = 0; this.sealMats.forEach(([m]) => { m.clippingPlanes = []; m.needsUpdate = true; }); this.sealL.rotation.set(0, 0, 0); this.sealR.rotation.set(0, 0, 0); this.env.position.set(0, 0, .9); this.env.updateMatrixWorld();
    this.sealL.position.x = 0; this.sealR.position.x = 0; this.sealL.visible = this.sealR.visible = true;
    moveCamera(new T.Vector3(.7, 6.6, 3.0), new T.Vector3(0, 0, .05), 2.1, "io");
    const start = new T.Vector3(from.x, 3.5, from.z - 1), end = new T.Vector3(0, 0, .9);
    start.copy(end).add(new T.Vector3(0, .45, -.5)); await tween(1.5, k => { this.env.position.lerpVectors(start, end, k); this.env.rotation.set(0, (1 - k) * .15, 0); }, "io");
    // crack the seal
    this.env.rotation.set(0, 0, 0); this.sealMats.forEach(([m, c]) => { m.clippingPlanes = [c]; m.needsUpdate = true; });
    await tween(.35, k => { this.clipL.constant = -k * .25; this.clipR.constant = -k * .25; this.sealL.position.x = -k * .25; this.sealR.position.x = k * .25; this.sealL.rotation.z = k * .4; this.sealR.rotation.z = -k * .4; }, "back");
    // lift the flap
    await tween(.8, k => { this.flapPivot.rotation.x = -k * Math.PI * .92; this.sealL.position.z = this.sealR.position.z = (EH * .12) - k * .9; this.sealL.position.y = this.sealR.position.y = .06 + Math.sin(k * Math.PI) * .6; }, "io");
    this.sealL.visible = this.sealR.visible = false;
    // the letter slides out, rises, and unfolds
    this.letter.visible = true; this.setFold(0);
    await tween(.9, k => { this.letter.position.set(0, .05 + k * .2, .9 - k * 1.6); }, "io");
    await tween(1.2, k => { this.letter.position.set(0, .25 + Math.sin(k * Math.PI) * .9 - k * .14, -.7 + k * .95); this.env.position.set(-k * 3.6, 0, .9 + k * 1.9); this.setFold(ease(k)); }, "io");
    this.ctx.showLinks([["Email me", `mailto:${CONTACT.email}`], ["LinkedIn", CONTACT.linkedin], ["GitHub", CONTACT.github]]);
    function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  }
  async close() {
    const { tween } = this.ctx; this.ctx.showLinks([]);
    await tween(.8, k => { this.setFold(1 - k); this.letter.position.y = .11 + Math.sin(k * Math.PI) * .5; }, "io");
    const l0 = this.letter.position.clone(), e0 = this.env.position.clone(); await tween(1.0, k => { this.letter.position.set(l0.x, l0.y + k * 2.4, l0.z - k * 1.4); this.env.position.set(e0.x, e0.y + k * 2.4, e0.z - k * 1.4); }, "io");
    this.group.visible = false; this.letter.rotation.set(0, 0, 0);
  }
  click(ray) { this.ctx.closeSection(); }
  update() { (this.glowMats || []).forEach(m => m.emissiveIntensity = .07 * this.ctx.S.focus); }
}
