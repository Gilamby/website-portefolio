// Small 3D miniatures standing on the map, like a model on a desk:
// a tower (My Story), a cottage (About Me), a workshop with a windmill (Projects),
// a lighthouse (Contact) and an open treasure chest (Why Hire Me).
// Plus a glowing path between them, a paper boat on the sea and a few slow clouds.
// Everything is kept calm: matte materials, slow movements, no crowds.

export function buildMiniatures({ THREE: T, scene, p2w, shadowy, MAT, map, heightAt, glowSprite, PAPER }) {
  const V3 = T.Vector3;
  const mat = (color, o = {}) => new T.MeshStandardMaterial({ color, roughness: .85, ...o });
  const WALL = mat(0xeadfc6), STONE = mat(0xd6ccb6), ROOF = mat(0xb4553a), WOOD = mat(0x6e4a2e), DARK = mat(0x3a2a1c), GREEN = mat(0x6f8a52);
  const WIN = new T.MeshStandardMaterial({ color: 0x3a2a1c, emissive: 0xffb44a, emissiveIntensity: 1.4 });
  const box = (w, h, d, m) => { const g = new T.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return new T.Mesh(g, m); };
  const cyl = (rt, rb, h, m, seg = 20) => { const g = new T.CylinderGeometry(rt, rb, h, seg); g.translate(0, h / 2, 0); return new T.Mesh(g, m); };
  const cone = (r, h, m, seg = 20) => { const g = new T.ConeGeometry(r, h, seg); g.translate(0, h / 2, 0); return new T.Mesh(g, m); };
  const roof = (w, h, d, m) => { const sh = new T.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, h); sh.closePath(); const g = new T.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return new T.Mesh(g, m); };
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };

  const items = [];
  const GRASS = mat(0x8f9a62), EARTH = mat(0x9b8160), PINE = mat(0x4f6b44);
  const pine = (x, z, s) => { const t = new T.Group(); t.add(at(cyl(.006, .008, .03, WOOD, 6), 0, 0, 0)); t.add(at(cone(.04, .08, PINE, 7), 0, .025, 0)); t.add(at(cone(.03, .06, PINE, 7), 0, .065, 0)); t.position.set(x, .018, z); t.scale.setScalar(s); return t; };
  function base(g, r, trees) {
    const e = cyl(r * .96, r, .018, EARTH, 28); g.add(e); g.add(at(cyl(r * .93, r * .95, .006, GRASS, 28), 0, .016, 0));
    trees.forEach(([x, z, s]) => g.add(pine(x, z, s)));
  }
  function place(id, px, py, build, scale = 1, r = .2, trees = []) {
    const root = new T.Group(); const inner = new T.Group(); root.add(inner); base(inner, r, trees);
    const model = new T.Group(); model.position.y = .02; inner.add(model); build(model);
    shadowy(inner); inner.scale.setScalar(scale);
    root.position.copy(p2w(px, py, 0)); root.userData = { id, px, py, h: 0 };
    scene.add(root); items.push(root); return root;
  }

  // ---------- My Story: a stone tower with a waving flag
  let flag;
  place("story", 440, 392, g => {
    g.add(cyl(.105, .125, .42, STONE, 24));
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const c = box(.045, .05, .04, STONE); c.position.set(Math.cos(a) * .11, .42, Math.sin(a) * .11); c.rotation.y = -a; g.add(c); }
    g.add(at(cyl(.122, .122, .022, STONE, 24), 0, .405, 0));
    g.add(at(box(.06, .1, .02, DARK), 0, 0, .118));
    const w = box(.035, .05, .02, WIN); w.position.set(.04, .26, .108); w.rotation.y = .35; g.add(w);
    g.add(at(cyl(.005, .005, .2, DARK, 6), 0, .42, 0));
    const fg = new T.PlaneGeometry(.13, .075, 10, 1); fg.translate(.065, 0, 0);
    flag = new T.Mesh(fg, mat(0xa8302a, { side: T.DoubleSide })); flag.position.set(0, .58, 0); flag.userData.x0 = Float32Array.from(fg.attributes.position.array); g.add(flag);
  }, 2.0, .19, [[-.14, .06, 1], [.15, .08, .8], [.12, -.1, .9]]);

  // ---------- About Me: a cottage with a smoking chimney
  const smoke = [];
  place("about", 1235, 250, g => {
    g.add(box(.3, .17, .2, WALL));
    g.add(at(roof(.34, .12, .24, ROOF), 0, .17, 0));
    g.add(at(box(.045, .11, .045, STONE), .08, .22, -.03));
    g.add(at(box(.05, .085, .01, WOOD), 0, 0, .101));
    [-.09, .09].forEach(x => g.add(at(box(.045, .045, .01, WIN), x, .07, .101)));
    for (let i = 0; i < 3; i++) { const s = new T.Mesh(new T.SphereGeometry(.03, 12, 10), new T.MeshStandardMaterial({ color: 0xe8e2d8, transparent: true, opacity: .5, roughness: 1, depthWrite: false })); s.castShadow = false; s.userData.ph = i / 3; g.add(s); smoke.push(s); }
  }, 2.1, .23, [[-.19, .05, .9], [.2, -.06, 1.1]]);

  // ---------- Projects: a workshop with a turning windmill
  let blades;
  place("built", 1050, 596, g => {
    g.add(at(box(.24, .15, .18, WALL), -.12, 0, 0));
    g.add(at(roof(.27, .1, .22, ROOF), -.12, .15, 0));
    g.add(at(box(.04, .07, .01, WOOD), -.12, 0, .091));
    g.add(at(box(.035, .035, .01, WIN), -.2, .07, .091));
    g.add(at(cyl(.06, .085, .34, WALL, 8), .14, 0, 0));
    g.add(at(cone(.075, .09, ROOF, 8), .14, .34, 0));
    blades = new T.Group(); blades.position.set(.14, .3, .08);
    for (let i = 0; i < 4; i++) { const b = new T.Group(); b.rotation.z = i * Math.PI / 2;
      const arm = box(.012, .2, .01, WOOD); b.add(arm); const sail = box(.05, .15, .004, mat(0xf2ead8)); sail.position.set(.032, .05, 0); b.add(sail); blades.add(b); }
    blades.add(new T.Mesh(new T.SphereGeometry(.018, 10, 8), DARK)); g.add(blades);
  }, 2.0, .26, [[.24, -.08, .9]]);

  // ---------- Contact: a lighthouse with a turning beam
  let beam, lamp, lampLight;
  place("letter", 1700, 336, g => {
    const stripes = document.createElement("canvas"); stripes.width = 64; stripes.height = 256; const sc = stripes.getContext("2d");
    for (let i = 0; i < 4; i++) { sc.fillStyle = i % 2 ? "#efe6d2" : "#b0443a"; sc.fillRect(0, i * 64, 64, 64); }
    const st = new T.CanvasTexture(stripes); st.colorSpace = T.SRGBColorSpace;
    g.add(cyl(.065, .1, .4, new T.MeshStandardMaterial({ map: st, roughness: .8 }), 24));
    g.add(at(cyl(.09, .09, .018, DARK, 24), 0, .4, 0));
    const ll = new T.PointLight(0xffc070, 0, 2.2, 2); ll.position.set(0, .45, 0); g.add(ll); g.userData.ll = ll; lampLight = ll;
    lamp = cyl(.05, .05, .07, new T.MeshStandardMaterial({ color: 0xfff1c8, emissive: 0xffc860, emissiveIntensity: 2.2 }), 16); lamp.position.y = .418; g.add(lamp);
    g.add(at(cone(.07, .075, DARK, 16), 0, .488, 0));
    // a soft beam: two long cones fading outwards, slowly turning
    const bg = new T.ConeGeometry(.09, .75, 24, 1, true); bg.translate(0, -.375, 0); bg.rotateZ(Math.PI / 2);
    const bm = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
      fragmentShader: "uniform float k; varying vec2 vUv; void main(){ float a = pow(vUv.y, 2.) * .16 * k; gl_FragColor = vec4(1., .86, .55, a); }",
      uniforms: { k: { value: 0 } } });
    beam = new T.Group(); beam.position.y = .455; const b1 = new T.Mesh(bg, bm); const b2 = b1.clone(); b2.rotation.y = Math.PI; beam.add(b1, b2); beam.userData.mat = bm; g.add(beam);
  }, 1.9, .15, []);

  // ---------- Why Hire Me: an open treasure chest with a warm glow
  let goldGlow;
  place("why", 1440, 1050, g => {
    g.add(box(.2, .1, .13, WOOD));
    [-.07, .07].forEach(x => g.add(at(box(.016, .102, .134, MAT.brass), x, 0, 0)));
    const GOLD = new T.MeshStandardMaterial({ color: 0xf2c95a, metalness: 1, roughness: .3, emissive: 0xffa830, emissiveIntensity: .08 });
    for (let i = 0; i < 9; i++) { const c = new T.Mesh(new T.SphereGeometry(.03, 10, 8), GOLD); c.scale.set(1, .45, 1); c.position.set(-.06 + (i % 3) * .06 + (i > 5 ? .01 : 0), .1 + (i > 2 ? .008 : 0) + (i === 4 ? .012 : 0), -.035 + Math.floor(i / 3) * .035); g.add(c); }
    const lid = new T.Group(); lid.position.set(0, .1, -.065); lid.rotation.x = -1.95;
    const lb = box(.2, .045, .13, WOOD); lb.position.z = .065; lid.add(lb);
    [-.07, .07].forEach(x => { const b = box(.016, .047, .132, MAT.brass); b.position.set(x, 0, .065); lid.add(b); });
    g.add(lid);
    for (let i = 0; i < 5; i++) { const c = new T.Mesh(new T.CylinderGeometry(.018, .018, .006, 14), MAT.brass); c.position.set(-.16 + i * .025 + (i > 2 ? .22 : 0), .003 + (i % 2) * .006, .06 - i * .01); g.add(c); }
    goldGlow = glowSprite(0xffc060, .5, 0); goldGlow.position.set(0, .2, 0); g.add(goldGlow);
  }, 2.3, .16, [[-.13, -.06, .8], [.13, -.08, .7]]);

  // ---------- a glowing path along the journey line
  const route = map.route, pts = [];
  for (let i = 0; i < route.length; i += 2) { const [px, py] = route[i]; const p = p2w(px, py, 0); p.y = heightAt(px, py) + .03; pts.push(p); }
  const curve = new T.CatmullRomCurve3(pts);
  const pathMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    uniforms: { t: { value: 0 }, k: { value: 0 }, show: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: `uniform float t, k, show; varying vec2 vUv;
      void main(){ if (vUv.x > show) discard;
        float core = smoothstep(.5, .0, abs(vUv.y - .5) * 2. - .0) ;
        float pulse = smoothstep(.06, 0., abs(fract(vUv.x - t * .05) - .5) - .44);
        gl_FragColor = vec4(1., .66, .26, (.55 + pulse * .45) * k); }` });
  const path = new T.Mesh(new T.TubeGeometry(curve, 300, .016, 8, false), pathMat); path.renderOrder = 3; scene.add(path);
  const pathHalo = new T.Mesh(new T.TubeGeometry(curve, 300, .045, 8, false), new T.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); scene.add(pathHalo);

  // ---------- a paper boat on the sea part of the route
  const sea = []; for (let u = 0; u <= 1; u += .002) { const p = curve.getPointAt(u); const [px, py] = [(p.x / PAPER.w + .5) * PAPER.px, (p.z / PAPER.h + .5) * PAPER.py]; if (heightAt(px, py) < .04) sea.push(u); }
  const u0 = sea.length ? sea[Math.floor(sea.length * .08)] : .3, u1 = sea.length ? sea[Math.floor(sea.length * .92)] : .7;
  const boat = new T.Group(); scene.add(boat);
  { const paper = new T.MeshStandardMaterial({ color: 0xf7f2e6, roughness: .9, side: T.DoubleSide, flatShading: true });
    const hull = new T.BufferGeometry(); const v = [
      -.12, .04, 0,  .12, .04, 0,  .07, 0, .035,   -.12, .04, 0, .07, 0, .035, -.07, 0, .035,
      -.12, .04, 0,  .12, .04, 0,  .07, 0, -.035,  -.12, .04, 0, .07, 0, -.035, -.07, 0, -.035,
      -.07, 0, .035, .07, 0, .035, .07, 0, -.035,  -.07, 0, .035, .07, 0, -.035, -.07, 0, -.035 ];
    hull.setAttribute("position", new T.Float32BufferAttribute(v, 3)); hull.computeVertexNormals();
    boat.add(new T.Mesh(hull, paper));
    const sail = new T.BufferGeometry(); sail.setAttribute("position", new T.Float32BufferAttribute([-.06, .035, 0, .06, .035, 0, 0, .15, 0], 3)); sail.computeVertexNormals();
    boat.add(new T.Mesh(sail, paper)); shadowy(boat); }

  // ---------- two slow clouds near the edges
  const cloudTex = (() => { const c = document.createElement("canvas"); c.width = 256; c.height = 128; const g = c.getContext("2d");
    [[70, 76, 44], [120, 58, 54], [170, 74, 42], [120, 84, 46], [205, 86, 30], [42, 88, 28]].forEach(([x, y, r]) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(255,252,246,.95)"); gr.addColorStop(.6, "rgba(250,244,234,.6)"); gr.addColorStop(1, "rgba(250,244,234,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 128); });
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; })();
  const clouds = [[-2.6, 1.0, -1.7, 1.1, 0]].map(([x, y, z, s, ph]) => { const m = new T.Sprite(new T.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0, depthWrite: false })); m.scale.set(s, s * .5, 1); m.position.set(x, y, z); m.userData = { x, ph }; scene.add(m); return m; });

  // ---------- 3D mountains with snow caps, and small pine woods on the islands
  const ROCK = mat(0x8c7a64, { flatShading: true }), SNOW = mat(0xf4f1ea, { flatShading: true });
  const scenery = new T.Group(); scene.add(scenery);
  map.mountains.forEach(([px, py, r], i) => {
    const m = new T.Group(), h = .22 + r / 70 * .26, w = .1 + r / 70 * .12;
    const body = new T.Mesh(new T.ConeGeometry(w, h, 6), ROCK); body.position.y = h / 2; body.rotation.y = i * .7;
    const cap = new T.Mesh(new T.ConeGeometry(w * .38, h * .38, 6), SNOW); cap.position.y = h - h * .19 + .002; cap.rotation.y = i * .7;
    m.add(body, cap); m.position.copy(p2w(px, py - 20, heightAt(px, py - 20) - .01)); m.userData.base = m.position.y; shadowy(m); scenery.add(m);
  });
  const woods = [[300, 690, 7], [600, 330, 5], [250, 330, 4], [1870, 290, 4], [1560, 260, 3], [1240, 1190, 5], [1780, 1170, 4], [960, 700, 3], [1180, 330, 2]];
  const spots = []; woods.forEach(([cx, cy, n], w) => { for (let i = 0; i < n; i++) { const a = i * 2.4 + w, r = 14 + i * 9; const px = cx + Math.cos(a) * r * 1.6, py = cy + Math.sin(a) * r; if (heightAt(px, py) > .09) spots.push([px, py, .8 + ((i * 37 + w * 11) % 10) / 20]); } });
  const pineGeo = [(() => { const g = new T.CylinderGeometry(.006, .009, .04, 5); g.translate(0, .02, 0); return g; })(), (() => { const g = new T.ConeGeometry(.045, .09, 7); g.translate(0, .07, 0); return g; })(), (() => { const g = new T.ConeGeometry(.033, .07, 7); g.translate(0, .115, 0); return g; })()];
  const pineInst = [WOOD, PINE, PINE].map((m, j) => { const im = new T.InstancedMesh(pineGeo[j], m, spots.length); im.castShadow = true; im.receiveShadow = true; scenery.add(im); return im; });
  const dummy = new T.Object3D();
  spots.forEach(([px, py, sc], i) => { dummy.position.copy(p2w(px, py, heightAt(px, py) - .005)); dummy.scale.setScalar(sc * 1.6); dummy.rotation.y = i; dummy.updateMatrix(); pineInst.forEach(im => im.setMatrixAt(i, dummy.matrix)); });
  pineInst.forEach(im => im.instanceMatrix.needsUpdate = true);

  // ---------- little sparks that travel along the path
  const SN = 26, sg = new T.BufferGeometry(), sp = new Float32Array(SN * 3), sseed = Float32Array.from({ length: SN }, () => Math.random());
  sg.setAttribute("position", new T.BufferAttribute(sp, 3)); sg.setAttribute("seed", new T.BufferAttribute(sseed, 1));
  const sparkMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { k: { value: 0 } },
    vertexShader: "attribute float seed; varying float s; void main(){ s = seed; vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = (60. + seed * 70.) / -mv.z; }",
    fragmentShader: "uniform float k; varying float s; void main(){ float r = length(gl_PointCoord - .5); if (r > .5) discard; gl_FragColor = vec4(1., .78, .4, smoothstep(.5, 0., r) * k * (.5 + s * .5)); }" });
  const sparks = new T.Points(sg, sparkMat); sparks.frustumCulled = false; scene.add(sparks);

  // ---------- paper cranes circling slowly over the map
  const crane = () => { const c = new T.Group(); const paper = new T.MeshStandardMaterial({ color: 0xf6f0e2, roughness: .9, side: T.DoubleSide, flatShading: true });
    const body = new T.BufferGeometry(); body.setAttribute("position", new T.Float32BufferAttribute([-.09, 0, 0, .09, 0, 0, 0, .03, 0, -.09, 0, 0, .12, .05, 0, .02, 0, .01], 3)); body.computeVertexNormals(); c.add(new T.Mesh(body, paper));
    const wing = s => { const w = new T.Group(); const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute([-.03, 0, 0, .04, 0, 0, 0, 0, .13 * s], 3)); g.computeVertexNormals(); w.add(new T.Mesh(g, paper)); return w; };
    const l = wing(1), r = wing(-1); c.add(l, r); c.userData = { l, r }; shadowy(c); return c; };
  const cranes = [[0, 1.5, 2.6, 1.6, .9], [2.1, 1.25, 1.9, 1.2, -.7], [4.2, 1.7, 2.9, .9, .55]].map(([ph, y, rx, rz, sp]) => { const c = crane(); c.userData.o = { ph, y, rx, rz, sp }; c.scale.setScalar(1.3); scene.add(c); return c; });

  // ---------- picking: the models are tall, so a pointer over a roof should count too
  const pick = (ray) => { const h = ray.intersectObjects(items, true)[0]; if (!h) return null; let o = h.object; while (o && !o.userData.id) o = o.parent; return o ? o.userData.id : null; };

  const ease = x => { const c = 1.70158 * .6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const prog = (k, a, b) => Math.min(1, Math.max(0, (k - a) / (b - a)));

  function update(t, { k, relief, hover, show }) {
    const vis = show && relief > .01;
    items.forEach((it, i) => {
      const rise = vis ? ease(prog(k, .8 + i * .03, .95 + i * .03)) * Math.min(1, relief * 1.2) : 0;
      it.visible = rise > .002;
      const h = it.userData.h += ((hover === it.userData.id ? 1 : 0) - it.userData.h) * .12;
      it.position.y = heightAt(it.userData.px, it.userData.py) * relief + h * .05;
      it.scale.set(1 + h * .06, Math.max(.001, rise) * (1 + h * .06), 1 + h * .06);
    });
    WIN.emissiveIntensity = 1.2 + Math.sin(t * 1.7) * .15;
    // little life in each model
    if (flag) { const P = flag.geometry.attributes.position, x0 = flag.userData.x0; for (let i = 0; i < P.count; i++) { const x = x0[i * 3]; P.setZ(i, Math.sin(x * 40 - t * 3.2) * .012 * (x / .13)); } P.needsUpdate = true; }
    smoke.forEach(s => { const f = (t * .18 + s.userData.ph) % 1; s.position.set(.08 + f * .05, .34 + f * .26, -.03 - f * .04); s.scale.setScalar(.5 + f * 1.3); s.material.opacity = .45 * Math.sin(f * Math.PI); });
    if (blades) blades.rotation.z = -t * .7;
    if (beam) { beam.rotation.y = t * .45; beam.userData.mat.uniforms.k.value = vis ? 1 : 0; lamp.material.emissiveIntensity = 2 + Math.sin(t * 2) * .2; lampLight.intensity = vis ? 1.1 + Math.sin(t * 2) * .1 : 0; }
    if (goldGlow) goldGlow.material.opacity = vis ? .28 + Math.sin(t * 1.6) * .08 + (hover === "why" ? .25 : 0) : 0;
    // path draws itself along with the map, then a soft pulse keeps travelling along it
    pathMat.uniforms.t.value = t; pathMat.uniforms.show.value = prog(k, .5, .78); pathMat.uniforms.k.value = vis ? 1 : 0;
    pathHalo.material.opacity = vis ? .14 * prog(k, .6, .8) : 0; path.visible = pathHalo.visible = vis;
    path.position.y = pathHalo.position.y = (relief - 1) * .1;
    // boat: sails the sea part of the route very slowly, then fades and starts again
    const bu = (t / 95) % 1, u = u0 + (u1 - u0) * bu, p = curve.getPointAt(u), q = curve.getPointAt(Math.min(1, u + .004));
    boat.visible = vis && k > .75; boat.position.set(p.x, .03 + Math.sin(t * 1.1) * .004, p.z); boat.rotation.set(Math.sin(t * .9) * .05, Math.atan2(-(q.z - p.z), q.x - p.x), Math.sin(t * .7) * .04);
    boat.scale.setScalar(Math.min(1, bu / .06, (1 - bu) / .06) * 1.5 + .0001);
    { const sr = vis ? ease(prog(k, .72, .95)) * Math.min(1, relief * 1.2) : 0; scenery.visible = sr > .002; scenery.scale.set(1, Math.max(.001, sr), 1); scenery.position.y = (relief - 1) * .12; }
    for (let i = 0; i < SN; i++) { const f = (t * .03 + sseed[i]) % 1, p = curve.getPointAt(f); sp[i * 3] = p.x; sp[i * 3 + 1] = p.y + (relief - 1) * .1 + .02 + Math.sin(t * 2 + i) * .01; sp[i * 3 + 2] = p.z; }
    sg.attributes.position.needsUpdate = true; sparkMat.uniforms.k.value = vis ? prog(k, .75, 1) : 0; sparks.visible = vis;
    cranes.forEach((c, i) => { const o = c.userData.o, a = t * .05 * o.sp + o.ph; c.visible = vis && k > .8;
      c.position.set(Math.cos(a) * o.rx, o.y + Math.sin(t * .5 + i) * .08, Math.sin(a) * o.rz + .2);
      c.rotation.set(0, -a + (o.sp > 0 ? 0 : Math.PI) - Math.PI / 2 * Math.sign(o.sp), Math.sin(t * .6 + i) * .15);
      const fl = Math.sin(t * 3.2 + i * 2) * .55; c.userData.l.rotation.x = fl; c.userData.r.rotation.x = -fl; });
    clouds.forEach((c, i) => { c.position.x = c.userData.x + Math.sin(t * .03 + c.userData.ph * 6) * .5; c.material.opacity = vis ? .4 * prog(k, .7, 1) : 0; });
  }
  return { update, pick, items };
}
