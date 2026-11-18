// The map as a little world: five 3D islands with rocky cliffs, beaches and woods,
// one landmark on each (castle, house, workshop with crane, lighthouse, manor),
// banners with the names, glowing pins, a golden dotted route, two sailing ships,
// paper cranes and soft clouds at the edges. Calm, slow movements only.

export function buildMiniatures({ THREE: T, scene, p2w, shadowy, MAT, map, glowSprite }) {
  const mat = (color, o = {}) => new T.MeshStandardMaterial({ color, roughness: .85, ...o });
  const WALL = mat(0xeee2c8), STONE = mat(0xc9bea6), ROOF = mat(0xb04a32), WOOD = mat(0x6a4529), DARK = mat(0x2e2218), PINE = mat(0xffffff), LEAF = mat(0xffffff);
  const WIN = new T.MeshStandardMaterial({ color: 0x3a2a1c, emissive: 0xffb44a, emissiveIntensity: 1.5 });
  const box = (w, h, d, m) => { const g = new T.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return new T.Mesh(g, m); };
  const cyl = (rt, rb, h, m, seg = 20) => { const g = new T.CylinderGeometry(rt, rb, h, seg); g.translate(0, h / 2, 0); return new T.Mesh(g, m); };
  const cone = (r, h, m, seg = 20) => { const g = new T.ConeGeometry(r, h, seg); g.translate(0, h / 2, 0); return new T.Mesh(g, m); };
  const roof = (w, h, d, m) => { const sh = new T.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, h); sh.closePath(); const g = new T.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return new T.Mesh(g, m); };
  const at = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; return o; };
  const canvasTex = (w, h, draw, rep) => { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep, rep); } t.anisotropy = 8; return t; };
  const noise = (g, w, h, n, cols, rmin, rmax) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; g.globalAlpha = .25 + Math.random() * .35; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, rmin + Math.random() * (rmax - rmin), 0, 7); g.fill(); } g.globalAlpha = 1; };
  const prog = (k, a, b) => Math.min(1, Math.max(0, (k - a) / (b - a)));
  const easeBack = x => { const c = 1.0; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const W = (px, py, y = 0) => p2w(px, py, y);
  const pip = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if (((yi > y) !== (yj > y)) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };

  // ---------------------------------------------------------------- islands
  const TOP = .15;
  const grassTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#7f9a4e"; g.fillRect(0, 0, w, h); noise(g, w, h, 900, ["#6c8a40", "#93ad5c", "#a8b866", "#5f7d3a"], 2, 9); }, 2.2);
  const rockTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#8a7258"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 6) { g.fillStyle = `rgba(${60 + Math.random() * 60},${45 + Math.random() * 40},${30 + Math.random() * 30},.35)`; g.fillRect(0, y, w, 2 + Math.random() * 4); } noise(g, w, h, 300, ["#6e5a44", "#a08a6c", "#5a4836"], 2, 7); }, 1.5);
  const sandTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#e3cf9e"; g.fillRect(0, 0, w, h); noise(g, w, h, 300, ["#d6bf8a", "#efe0b8"], 1, 3); }, 3);
  const GRASS = new T.MeshStandardMaterial({ map: grassTex, roughness: .95 }), ROCK = new T.MeshStandardMaterial({ map: rockTex, roughness: 1 }), SAND = new T.MeshStandardMaterial({ map: sandTex, roughness: 1 });
  const islands = new T.Group(); scene.add(islands);
  const isleGroups = {};
  const shapeOf = (poly, grow, c) => { const sh = new T.Shape(); poly.forEach(([px, py], i) => { const qx = c[0] + (px - c[0]) * grow, qy = c[1] + (py - c[1]) * grow; const w = W(qx, qy); i ? sh.lineTo(w.x, -w.z) : sh.moveTo(w.x, -w.z); }); return sh; };
  Object.entries(map.lands).forEach(([id, poly]) => {
    const [cx, cy] = map.ISLES[id], g = new T.Group(); islands.add(g); isleGroups[id] = g; g.userData.id = id;
    // cliffs and grass top
    const geo = new T.ExtrudeGeometry(shapeOf(poly, 1, [cx, cy]), { depth: .1, bevelEnabled: true, bevelThickness: .022, bevelSize: .03, bevelSegments: 2, curveSegments: 4 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, .03, 0);
    const P = geo.attributes.position; // rough up the cliff faces
    for (let i = 0; i < P.count; i++) { const y = P.getY(i); if (y > .02 && y < TOP - .015) { const x = P.getX(i), z = P.getZ(i); const n = Math.sin(x * 23 + y * 61) * Math.cos(z * 19 - y * 47); P.setX(i, x + n * .018); P.setZ(i, z + Math.sin(z * 29 + x * 13) * .018); } }
    geo.computeVertexNormals();
    const top = new T.Mesh(geo, [GRASS, ROCK]); top.castShadow = true; top.receiveShadow = true; g.add(top);
    // a sandy beach around the foot of the cliffs
    const bg = new T.ExtrudeGeometry(shapeOf(poly, 1.07, [cx, cy]), { depth: .03, bevelEnabled: true, bevelThickness: .01, bevelSize: .02, bevelSegments: 2 });
    bg.rotateX(-Math.PI / 2); bg.translate(0, .02, 0); const beach = new T.Mesh(bg, SAND); beach.receiveShadow = true; g.add(beach);
  });

  // ---------------------------------------------------------------- landmarks
  const items = [];
  function place(id, px, py, build, scale = 1, ry = 0) {
    const root = new T.Group(); const inner = new T.Group(); root.add(inner); build(inner);
    shadowy(inner); inner.scale.setScalar(scale); inner.rotation.y = ry;
    root.position.copy(W(px, py, TOP)); root.userData = { id, px, py, h: 0 };
    scene.add(root); items.push(root); return root;
  }
  const crenels = (g, r, y, n, m) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const c = box(.04, .045, .035, m); c.position.set(Math.cos(a) * r, y, Math.sin(a) * r); c.rotation.y = -a; g.add(c); } };
  const flagMesh = (h) => { const fg = new T.PlaneGeometry(.13, .075, 10, 1); fg.translate(.065, 0, 0); const f = new T.Mesh(fg, mat(0xa8302a, { side: T.DoubleSide })); f.position.y = h; f.userData.x0 = Float32Array.from(fg.attributes.position.array); return f; };
  const flags = [];

  // My Story: a small castle
  place("story", 430, 345, g => {
    const tower = (x, z, r, h) => { const t = new T.Group(); t.add(cyl(r, r * 1.12, h, STONE, 20)); crenels(t, r * .95, h, 9, STONE); t.add(at(cyl(r * 1.04, r * 1.04, .02, STONE, 20), 0, h - .02, 0)); t.position.set(x, 0, z); g.add(t); return t; };
    tower(0, -.02, .1, .44); tower(-.22, .08, .07, .3); tower(.22, .08, .07, .3);
    [-1, 1].forEach(s => { const w = box(.17, .17, .05, STONE); w.position.set(s * .11, 0, .1); g.add(w); for (let i = 0; i < 4; i++) g.add(at(box(.03, .035, .05, STONE), s * (.04 + i * .045), .17, .1)); });
    g.add(at(box(.07, .1, .02, DARK), 0, 0, .127));
    [[.04, .3, .095], [-.05, .2, .095]].forEach(([x, y, z]) => g.add(at(box(.026, .045, .01, WIN), x, y, z)));
    g.add(at(cyl(.005, .005, .2, DARK, 6), 0, .44, -.02)); const f = flagMesh(.6); f.position.z = -.02; g.add(f); flags.push(f);
  }, 1.9);

  // About Me: a two-storey house with a smoking chimney
  const smoke = [];
  place("about", 1150, 205, g => {
    g.add(box(.32, .24, .22, WALL)); g.add(at(roof(.36, .15, .26, ROOF), 0, .24, 0));
    g.add(at(box(.05, .13, .05, STONE), .1, .28, -.04));
    g.add(at(box(.055, .09, .01, WOOD), 0, 0, .111));
    [[-.1, .05], [.1, .05], [-.1, .15], [0, .15], [.1, .15]].forEach(([x, y]) => g.add(at(box(.04, .045, .01, WIN), x, y, .111)));
    for (let i = 0; i < 4; i++) { const s = new T.Mesh(new T.SphereGeometry(.03, 12, 10), new T.MeshStandardMaterial({ color: 0xece6dc, transparent: true, opacity: .5, roughness: 1, depthWrite: false })); s.castShadow = false; s.userData.ph = i / 4; g.add(s); smoke.push(s); }
  }, 1.75);

  // Projects: a workshop and a turning construction crane
  let crane;
  place("built", 930, 600, g => {
    g.add(at(box(.3, .17, .2, WALL), -.08, 0, .02)); g.add(at(roof(.33, .12, .24, ROOF), -.08, .17, .02));
    g.add(at(box(.07, .1, .01, WOOD), -.08, 0, .121)); [-.19, .03].forEach(x => g.add(at(box(.04, .04, .01, WIN), x, .08, .121)));
    const Y = mat(0xd9a03a, { metalness: .3, roughness: .6 });
    const mast = new T.Group(); mast.position.set(.24, 0, .07); mast.scale.setScalar(.78); g.add(mast);
    [[-.018, -.018], [.018, -.018], [-.018, .018], [.018, .018]].forEach(([x, z]) => mast.add(at(box(.008, .44, .008, Y), x, 0, z)));
    for (let i = 0; i < 8; i++) { const b = box(.05, .006, .006, Y); b.position.y = .03 + i * .05; b.rotation.z = (i % 2 ? .6 : -.6); mast.add(b); }
    crane = new T.Group(); crane.position.y = .44; mast.add(crane);
    crane.add(at(box(.36, .02, .02, Y), .12, 0, 0)); crane.add(at(box(.14, .02, .02, Y), -.1, 0, 0)); crane.add(at(box(.06, .06, .05, STONE), -.15, -.04, 0));
    crane.add(at(box(.04, .04, .04, Y), 0, .02, 0)); const cable = box(.003, .22, .003, DARK); cable.position.set(.26, -.18, 0); crane.add(cable); crane.add(at(box(.05, .04, .05, WOOD), .26, -.22, 0));
  }, 1.75);

  // Contact: a red and white lighthouse with a turning beam, and a keeper's cottage
  let beam, lamp, lampLight;
  place("letter", 1640, 300, g => {
    const st = canvasTex(64, 256, (c) => { for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? "#efe6d2" : "#b0403a"; c.fillRect(0, i * 52, 64, 52); } });
    g.add(cyl(.065, .1, .46, new T.MeshStandardMaterial({ map: st, roughness: .8 }), 24));
    g.add(at(cyl(.09, .09, .018, DARK, 24), 0, .46, 0));
    lamp = cyl(.05, .05, .07, new T.MeshStandardMaterial({ color: 0xfff1c8, emissive: 0xffc860, emissiveIntensity: 2.4 }), 16); lamp.position.y = .478; g.add(lamp);
    g.add(at(cone(.07, .08, ROOF, 16), 0, .548, 0));
    lampLight = new T.PointLight(0xffc070, 0, 2.4, 2); lampLight.position.set(0, .5, 0); g.add(lampLight);
    const bg = new T.ConeGeometry(.09, .8, 24, 1, true); bg.translate(0, -.4, 0); bg.rotateZ(Math.PI / 2);
    const bm = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, uniforms: { k: { value: 0 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
      fragmentShader: "uniform float k; varying vec2 vUv; void main(){ gl_FragColor = vec4(1., .86, .55, pow(vUv.y, 2.) * .18 * k); }" });
    beam = new T.Group(); beam.position.y = .51; const b1 = new T.Mesh(bg, bm); const b2 = b1.clone(); b2.rotation.y = Math.PI; beam.add(b1, b2); beam.userData.mat = bm; g.add(beam);
    const cot = new T.Group(); cot.position.set(.2, 0, .06); cot.add(box(.16, .1, .12, WALL)); cot.add(at(roof(.18, .08, .14, ROOF), 0, .1, 0)); cot.add(at(box(.03, .03, .01, WIN), .03, .045, .061)); g.add(cot);
  }, 1.7);

  // Why Hire Me: a manor house with the treasure chest in front, and fields beside it
  let goldGlow;
  place("why", 1470, 920, g => {
    g.add(box(.5, .2, .22, WALL)); g.add(at(roof(.54, .13, .26, ROOF), 0, .2, 0));
    g.add(at(box(.16, .26, .24, WALL), 0, 0, .01)); g.add(at(roof(.18, .1, .26, ROOF), 0, .26, .01));
    g.add(at(box(.06, .1, .01, WOOD), 0, 0, .131)); [[-.18, .06], [-.09, .06], [.09, .06], [.18, .06], [-.18, .14], [.18, .14], [0, .17]].forEach(([x, y]) => g.add(at(box(.035, .045, .01, WIN), x, y, x === 0 ? .131 : .111)));
    const chest = new T.Group(); chest.position.set(0, 0, .25); g.add(chest);
    chest.add(box(.13, .065, .085, WOOD)); [-.045, .045].forEach(x => chest.add(at(box(.012, .067, .087, MAT.brass), x, 0, 0)));
    const GOLD = new T.MeshStandardMaterial({ color: 0xf2c95a, metalness: 1, roughness: .3, emissive: 0xffa830, emissiveIntensity: .1 });
    for (let i = 0; i < 6; i++) { const c = new T.Mesh(new T.SphereGeometry(.02, 10, 8), GOLD); c.scale.set(1, .45, 1); c.position.set(-.04 + (i % 3) * .04, .066, -.02 + Math.floor(i / 3) * .04); chest.add(c); }
    const lid = new T.Group(); lid.position.set(0, .065, -.043); lid.rotation.x = -1.95; const lb = box(.13, .03, .085, WOOD); lb.position.z = .043; lid.add(lb); chest.add(lid);
    goldGlow = glowSprite(0xffc060, .35, 0); goldGlow.position.set(0, .12, .25); g.add(goldGlow);
    const field = mat(0x7a8f3e); for (let r = 0; r < 6; r++) g.add(at(box(.3, .025, .022, field), .48, 0, -.1 + r * .05));
  }, 1.6);

  // ---------------------------------------------------------------- trees on every island
  const spots = [];
  const footprints = { story: [430, 345, 150], about: [1150, 205, 110], built: [930, 600, 140], letter: [1640, 300, 120], why: [1470, 920, 220] };
  Object.entries(map.ISLES).forEach(([id, [cx, cy, rx, ry]]) => {
    const poly = map.lands[id], want = Math.round(rx * ry / 1500); let tries = 0, got = 0;
    while (got < want && tries++ < want * 20) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * .86, px = cx + Math.cos(a) * rx * r, py = cy + Math.sin(a) * ry * r;
      if (!pip(px, py, poly)) continue; const f = footprints[id]; if (Math.hypot(px - f[0], (py - f[1]) * 1.3) < f[2]) continue;
      if (py > cy + ry * .38) continue; // keep the front clear for the banner
      if (spots.some(s => Math.hypot(s[0] - px, s[1] - py) < 26)) continue;
      spots.push([px, py, .75 + Math.random() * .55, Math.random() < .55 ? 0 : 1]); got++;
    }
  });
  const trees = new T.Group(); scene.add(trees);
  const tg = (geo, y) => { geo.translate(0, y, 0); return geo; };
  const kinds = [
    [[tg(new T.CylinderGeometry(.007, .01, .05, 5), .025), WOOD], [tg(new T.ConeGeometry(.05, .1, 7), .085), PINE], [tg(new T.ConeGeometry(.036, .08, 7), .135), PINE]],
    [[tg(new T.CylinderGeometry(.008, .011, .06, 5), .03), WOOD], [tg(new T.IcosahedronGeometry(.058, 1), .1), LEAF]]];
  kinds.forEach((parts, kind) => {
    const list = spots.filter(s => s[3] === kind); if (!list.length) return;
    parts.forEach(([geo, m]) => { const im = new T.InstancedMesh(geo, m, list.length); im.castShadow = true; im.receiveShadow = true;
      const d = new T.Object3D(), col = new T.Color();
      list.forEach(([px, py, sc], i) => { d.position.copy(W(px, py, TOP - .004)); d.scale.setScalar(sc * 1.5); d.rotation.y = i * 1.3; d.updateMatrix(); im.setMatrixAt(i, d.matrix);
        col.set(m === WOOD ? 0xffffff : kind ? [0x6f8f3e, 0x5f8236, 0x86a24a, 0x7a9440][i % 4] : [0x3f6a40, 0x4c7448, 0x355c38][i % 3]); im.setColorAt(i, col); });
      trees.add(im); }); });

  // ---------------------------------------------------------------- wooden piers
  const piers = new T.Group(); scene.add(piers);
  [[1160, 690, -.35], [1210, 1110, .5], [1370, 260, -1.4], [1440, 470, .9]].forEach(([px, py, ry]) => {
    const p = new T.Group(); p.position.copy(W(px, py, .045)); p.rotation.y = ry;
    p.add(at(box(.36, .012, .07, WOOD), .18, 0, 0)); for (let i = 0; i < 5; i++) [-.03, .03].forEach(z => p.add(at(cyl(.007, .007, .06, WOOD, 6), .05 + i * .07, -.045, z)));
    shadowy(p); piers.add(p); });

  // ---------------------------------------------------------------- banners and glowing pins
  const banners = {}, pins = [];
  Object.entries(map.PINS).forEach(([id, [px, py]]) => {
    const label = { story: "My Story", about: "About Me", built: "Projects", letter: "Contact", why: "Why Hire Me" }[id];
    const drawBanner = (g, w) => {
      const bw = 760, x0 = (w - bw) / 2;
      g.fillStyle = "#c9a96a"; g.strokeStyle = "#5a3a1e"; g.lineWidth = 6;
      [-1, 1].forEach(s => { const ex = s < 0 ? x0 : x0 + bw; g.beginPath(); g.moveTo(ex, 70); g.lineTo(ex + s * 110, 80); g.lineTo(ex + s * 72, 130); g.lineTo(ex + s * 112, 186); g.lineTo(ex, 190); g.closePath(); g.fill(); g.stroke(); });
      const gr = g.createLinearGradient(0, 40, 0, 210); gr.addColorStop(0, "#f8ecd0"); gr.addColorStop(1, "#e2cc9c"); g.fillStyle = gr;
      g.beginPath(); g.moveTo(x0, 46); g.quadraticCurveTo(w / 2, 20, x0 + bw, 46); g.lineTo(x0 + bw, 206); g.quadraticCurveTo(w / 2, 180, x0, 206); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = "rgba(90,58,30,.45)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 22, 62); g.quadraticCurveTo(w / 2, 40, x0 + bw - 22, 62); g.moveTo(x0 + 22, 190); g.quadraticCurveTo(w / 2, 166, x0 + bw - 22, 190); g.stroke();
      g.fillStyle = "#2a1a0e"; let fs = 104; g.font = `700 ${fs}px 'Cinzel Decorative', serif`; while (g.measureText(label).width > 680 && fs > 60) { fs -= 4; g.font = `700 ${fs}px 'Cinzel Decorative', serif`; }
      g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, w / 2, 124);
    };
    const tex = canvasTex(1024, 256, drawBanner);
    // draw again once the display font has loaded, so the names are never in a fallback font
    document.fonts && document.fonts.load("700 104px 'Cinzel Decorative'").then(() => { const c = tex.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); drawBanner(g, c.width); tex.needsUpdate = true; });
    const m = new T.Mesh(new T.PlaneGeometry(1.3, .325), new T.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: .3, roughness: .9, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: .12, side: T.DoubleSide }));
    m.castShadow = true;
    const holder = new T.Group(); holder.position.copy(W(px, py - 70, TOP + .16)); holder.rotation.x = -.9; holder.add(m); scene.add(holder); banners[id] = holder; holder.userData.id = id;
    // a glowing pin under the banner, sitting on the map
    const dot = new T.Mesh(new T.SphereGeometry(.028, 16, 12), new T.MeshBasicMaterial({ color: 0xffd27a })); dot.position.copy(W(px, py, .06)); scene.add(dot);
    const halo = glowSprite(0xffb050, .45, 0); halo.position.copy(dot.position); scene.add(halo); pins.push({ id, dot, halo });
  });

  // ---------------------------------------------------------------- golden dotted route between the pins
  const dots = []; map.routes.forEach(rt => { const c = new T.CatmullRomCurve3(rt.map(([px, py]) => W(px, py, .05))); const L = c.getLength(); const n = Math.floor(L / .085); for (let i = 1; i < n; i++) dots.push({ p: c.getPointAt(i / n), u: i / n }); });
  const dotMesh = new T.InstancedMesh(new T.SphereGeometry(.014, 8, 6), new T.MeshBasicMaterial({ color: 0xffffff }), dots.length);
  { const d = new T.Object3D(); dots.forEach((o, i) => { d.position.copy(o.p); d.updateMatrix(); dotMesh.setMatrixAt(i, d.matrix); dotMesh.setColorAt(i, new T.Color(0xffc860)); }); }
  scene.add(dotMesh);

  // ---------------------------------------------------------------- two sailing ships
  const ship = () => {
    const s = new T.Group();
    const hs = new T.Shape(); hs.moveTo(-.16, -.045); hs.lineTo(.1, -.045); hs.quadraticCurveTo(.2, 0, .1, .045); hs.lineTo(-.16, .045); hs.closePath();
    const hg = new T.ExtrudeGeometry(hs, { depth: .055, bevelEnabled: true, bevelThickness: .01, bevelSize: .012, bevelSegments: 2 }); hg.rotateX(Math.PI / 2); hg.translate(0, .055, 0);
    s.add(new T.Mesh(hg, WOOD)); s.add(at(box(.27, .006, .085, mat(0x8a6a48)), -.02, .056, 0));
    const SAIL = mat(0xf4ecda, { side: T.DoubleSide });
    [[-.07, .3], [.04, .36]].forEach(([x, h]) => { s.add(at(cyl(.005, .005, h, DARK, 6), x, .05, 0));
      [[.12, .1], [.22, .085]].forEach(([y, w]) => { const sail = new T.Mesh(new T.PlaneGeometry(.11, w, 6, 4), SAIL); const P = sail.geometry.attributes.position; for (let i = 0; i < P.count; i++) { const x0 = P.getX(i), y0 = P.getY(i); P.setZ(i, (1 - Math.pow(x0 / .055, 2)) * .018 * (1 - Math.abs(y0) / w)); } sail.geometry.computeVertexNormals(); sail.rotation.y = Math.PI / 2; sail.position.set(x, .05 + y + (h > .32 ? .03 : 0), 0); s.add(sail); }); });
    const fl = flagMesh(.42); fl.position.x = .04; fl.scale.setScalar(.5); s.add(fl); flags.push(fl);
    shadowy(s); return s; };
  const ships = [[700, 1060, 150, 55, .6, 0], [1310, 560, 70, 55, -.45, 2]].map(([px, py, rx, ry, sp, ph]) => { const s = ship(); s.scale.setScalar(1.6); s.userData = { px, py, rx, ry, sp, ph }; scene.add(s); return s; });

  // ---------------------------------------------------------------- paper cranes
  const crane2 = () => { const c = new T.Group(); const paper = new T.MeshStandardMaterial({ color: 0xf6f0e2, roughness: .9, side: T.DoubleSide, flatShading: true });
    const body = new T.BufferGeometry(); body.setAttribute("position", new T.Float32BufferAttribute([-.09, 0, 0, .09, 0, 0, 0, .03, 0, -.09, 0, 0, .12, .05, 0, .02, 0, .01], 3)); body.computeVertexNormals(); c.add(new T.Mesh(body, paper));
    const wing = s => { const w = new T.Group(); const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute([-.03, 0, 0, .04, 0, 0, 0, 0, .13 * s], 3)); g.computeVertexNormals(); w.add(new T.Mesh(g, paper)); return w; };
    const l = wing(1), r = wing(-1); c.add(l, r); c.userData = { l, r }; shadowy(c); return c; };
  const cranes = [[0, 1.6, 2.7, 1.5, .8], [3.1, 1.35, 2.0, 1.2, -.6]].map(([ph, y, rx, rz, sp]) => { const c = crane2(); c.userData.o = { ph, y, rx, rz, sp }; c.scale.setScalar(1.4); scene.add(c); return c; });

  // ---------------------------------------------------------------- soft clouds resting on the edges of the map
  const cloudTex = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 118, 10, 128, 128, 124); gr.addColorStop(0, "rgba(255,252,246,1)"); gr.addColorStop(.45, "rgba(246,238,226,.92)"); gr.addColorStop(.75, "rgba(226,214,200,.45)"); gr.addColorStop(1, "rgba(220,206,190,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const clouds = [];
  [[150, 300], [1960, 780], [300, 1000], [900, 1350], [1980, 1250], [1020, 90]].forEach(([px, py], ci) => {
    const grp = new T.Group(); grp.position.copy(W(px, py, .28)); scene.add(grp); grp.userData = { base: grp.position.clone(), ph: ci * 1.7 };
    for (let i = 0; i < 7; i++) { const s = new T.Sprite(new T.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, opacity: 0 })); const sc = .32 + Math.random() * .3; s.scale.set(sc, sc * .8, 1); s.position.set((i - 3) * .12 + Math.random() * .05, Math.random() * .12, Math.random() * .12 - .06); grp.add(s); }
    clouds.push(grp); });

  // ---------------------------------------------------------------- picking
  const pickables = [...items, ...Object.values(banners), ...Object.values(isleGroups)];
  const pick = (ray) => { const h = ray.intersectObjects(pickables, true)[0]; if (!h) return null; let o = h.object; while (o && !o.userData.id) o = o.parent; return o ? o.userData.id : null; };

  // ---------------------------------------------------------------- update
  function update(t, { k, relief, hover, show }) {
    const vis = show && relief > .01;
    // islands rise out of the paper as the map finishes, then the landmarks pop up
    const ir = vis ? easeBack(prog(k, .55, .8)) * Math.min(1, relief * 1.2) : 0;
    islands.visible = trees.visible = piers.visible = ir > .002; [islands, trees, piers].forEach(o => o.scale.set(1, Math.max(.001, ir), 1));
    items.forEach((it, i) => {
      const rise = vis ? easeBack(prog(k, .78 + i * .03, .93 + i * .03)) * Math.min(1, relief * 1.2) : 0; it.visible = rise > .002;
      const h = it.userData.h += ((hover === it.userData.id ? 1 : 0) - it.userData.h) * .12;
      it.position.y = TOP * Math.max(.001, ir) + h * .04; it.scale.set(1 + h * .05, Math.max(.001, rise) * (1 + h * .05), 1 + h * .05);
    });
    Object.values(banners).forEach((b, i) => { const id = b.userData.id, on = hover === id ? 1 : 0, r = vis ? easeBack(prog(k, .86 + i * .025, .98 + i * .005)) : 0; b.visible = r > .01;
      b.userData.h = (b.userData.h || 0) + (on - (b.userData.h || 0)) * .14; b.scale.setScalar(Math.max(.001, r) * (1 + b.userData.h * .08)); b.children[0].material.emissiveIntensity = .12 + b.userData.h * .35; b.position.y = (TOP + .16) * Math.max(.001, ir) + Math.sin(t * .9 + i) * .008; });
    pins.forEach((p, i) => { const on = hover === p.id ? 1 : 0, a = vis ? prog(k, .88, 1) : 0; p.dot.visible = a > 0; p.dot.scale.setScalar(.6 + a * .4 + on * .3 + Math.sin(t * 2.4 + i) * .06); p.halo.material.opacity = a * (.55 + Math.sin(t * 2.4 + i) * .15 + on * .4); });
    { const a = vis ? prog(k, .6, .85) : 0; dotMesh.visible = a > 0; const c = new T.Color(); dots.forEach((o, i) => { const w = Math.max(0, Math.sin(o.u * 18 - t * 2.2)), b = (.55 + w * .45) * a; c.setRGB(b, .72 * b, .3 * b); dotMesh.setColorAt(i, c); }); dotMesh.instanceColor.needsUpdate = true; }
    WIN.emissiveIntensity = 1.3 + Math.sin(t * 1.7) * .15;
    flags.forEach((f, j) => { const P = f.geometry.attributes.position, x0 = f.userData.x0; for (let i = 0; i < P.count; i++) { const x = x0[i * 3]; P.setZ(i, Math.sin(x * 40 - t * 3.2 + j) * .012 * (x / .13)); } P.needsUpdate = true; });
    smoke.forEach(s => { const f = (t * .16 + s.userData.ph) % 1; s.position.set(.1 + f * .05, .4 + f * .3, -.04 - f * .05); s.scale.setScalar(.5 + f * 1.4); s.material.opacity = .45 * Math.sin(f * Math.PI); });
    if (crane) crane.rotation.y = Math.sin(t * .18) * 1.1;
    beam.rotation.y = t * .45; beam.userData.mat.uniforms.k.value = vis ? 1 : 0; lamp.material.emissiveIntensity = 2.2 + Math.sin(t * 2) * .2; lampLight.intensity = vis ? 1.2 + Math.sin(t * 2) * .1 : 0;
    goldGlow.material.opacity = vis ? .3 + Math.sin(t * 1.6) * .08 + (hover === "why" ? .25 : 0) : 0;
    ships.forEach((s, i) => { const o = s.userData, a = t * .035 * o.sp + o.ph; const px = o.px + Math.cos(a) * o.rx, py = o.py + Math.sin(a) * o.ry; const p = W(px, py, .035);
      s.visible = vis && k > .7; s.position.set(p.x, .035 + Math.sin(t * 1.1 + i) * .005, p.z);
      const dx = -Math.sin(a) * o.rx * Math.sign(o.sp), dz = Math.cos(a) * o.ry * Math.sign(o.sp); s.rotation.set(Math.sin(t * .9 + i) * .04, Math.atan2(-dz, dx), Math.sin(t * .7 + i) * .05); });
    cranes.forEach((c, i) => { const o = c.userData.o, a = t * .05 * o.sp + o.ph; c.visible = vis && k > .85;
      c.position.set(Math.cos(a) * o.rx, o.y + Math.sin(t * .5 + i) * .08, Math.sin(a) * o.rz + .2);
      c.rotation.set(0, -a - Math.PI / 2 * Math.sign(o.sp), Math.sin(t * .6 + i) * .15);
      const fl = Math.sin(t * 3.2 + i * 2) * .55; c.userData.l.rotation.x = fl; c.userData.r.rotation.x = -fl; });
    clouds.forEach(c => { c.position.x = c.userData.base.x + Math.sin(t * .05 + c.userData.ph) * .12; const a = vis ? .9 * prog(k, .7, 1) : 0; c.children.forEach(s => s.material.opacity = a); c.visible = a > 0; });
  }
  return { update, pick, items };
}
