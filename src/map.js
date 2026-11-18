// The hand-inked fantasy map that becomes the site's navigation.
// Everything is drawn into the paper's ink canvas (2048 x 1400 px).

export const MAP_SPOTS = [
  { id: "story", x: 430, y: 430, r: 230, label: "My Story", sub: "internships, school and work, chapter by chapter" },
  { id: "about", x: 1150, y: 280, r: 190, label: "About Me", sub: "profile, skills and why hire me" },
  { id: "built", x: 930, y: 670, r: 200, label: "Projects", sub: "my work, with case studies and live links" },
  { id: "letter", x: 1650, y: 400, r: 200, label: "Contact", sub: "email, LinkedIn and GitHub" },
  { id: "why", x: 1500, y: 1020, r: 260, label: "Why Hire Me", sub: "four reasons, each with the story behind it" },
];

let seed = 99;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const R = (a, b) => a + (b - a) * rnd();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const prog = (k, a, b) => clamp((k - a) / (b - a), 0, 1);
const INK = "#3a2616", INK2 = "#5a3e26", RED = "#8e2a1a";

function coast(pts, depth, rough) {
  let p = pts.map(q => q.slice());
  for (let d = 0; d < depth; d++) {
    const n = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length]; const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); const off = R(-1, 1) * L * rough;
      n.push(a, [mx - dy / L * off, my + dx / L * off]);
    }
    p = n; rough *= .62;
  }
  return p;
}
function polyLen(p, closed) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (closed) L += Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]); return L; }
function strokePartial(g, p, t, closed) {
  if (t <= 0) return; const pts = closed ? p.concat([p[0]]) : p; const L = polyLen(pts) * t; let acc = 0;
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; const s = Math.hypot(b[0] - a[0], b[1] - a[1]); if (acc + s >= L) { const f = (L - acc) / s; g.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); break; } g.lineTo(b[0], b[1]); acc += s; }
  g.stroke();
}
function fillPoly(g, p) { g.beginPath(); p.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); }
function bez(a, c1, c2, b, n = 40) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0], u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1]]); } return o; }

let TNOW = 0;
export function buildMap() {
  // ---------- geography (fixed, seeded) ----------
  // five islands in an open sea, one for each place (centre x, y, radius x, radius y)
  const ISLES = { story: [430, 400, 250, 170], about: [1150, 245, 215, 125], built: [930, 640, 225, 145], letter: [1650, 370, 225, 155], why: [1500, 990, 330, 205] };
  const isle = ([cx, cy, rx, ry], seed) => { const pts = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, w = 1 + Math.sin(i * 2.3 + seed) * .12 + Math.cos(i * 1.7 + seed * 2) * .08; pts.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]); } return coast(pts, 4, .16); };
  const lands = Object.fromEntries(Object.entries(ISLES).map(([k, v], i) => [k, isle(v, i * 1.9)]));

  const mountains = [];
  for (let i = 0; i < 9; i++) mountains.push([R(1560, 1820), R(900, 1070), R(42, 66)]);
  for (let i = 0; i < 5; i++) mountains.push([R(1620, 1840), R(260, 420), R(34, 56)]);
  const forests = [];
  for (let i = 0; i < 26; i++) forests.push([R(220, 360), R(520, 640), R(10, 16)]);
  for (let i = 0; i < 14; i++) forests.push([R(600, 720), R(330, 450), R(10, 15)]);
  for (let i = 0; i < 12; i++) forests.push([R(1200, 1320), R(1050, 1180), R(10, 15)]);
  const PINS = { story: [430, 590], built: [930, 805], about: [1150, 392], letter: [1650, 548], why: [1500, 1212] };
  const P = PINS;
  const routes = [bez(P.story, [560, 760], [760, 860], P.built), bez(P.built, [1000, 600], [1080, 470], P.about), bez(P.about, [1300, 470], [1480, 560], P.letter), bez(P.built, [1080, 980], [1300, 1180], P.why)];
  const route = routes[0] || [].concat(bez([250, 660], [360, 700], [480, 720], [600, 690]), bez([600, 690], [760, 760], [800, 900], [1000, 930]), bez([1000, 930], [1180, 950], [1300, 990], [1390, 1070]));
  const waves = []; for (let i = 0; i < 70; i++) { const x = R(150, 1900), y = R(150, 1280); waves.push([x, y, R(14, 26)]); }

  // ---------- drawing helpers ----------
  function coastline(g, p, t, wash) {
    if (t <= 0) return;
    g.save();
    // land tint
    g.globalAlpha = t * .55; fillPoly(g, p); g.fillStyle = wash; g.fill();
    g.globalAlpha = t;
    // coastal water shading (watercolour bleed)
    g.save(); fillPoly(g, p); g.lineWidth = 46; g.strokeStyle = "rgba(60,120,112,.10)"; g.filter = "blur(8px)"; g.stroke(); g.restore();
    g.lineJoin = "round"; g.lineCap = "round";
    g.strokeStyle = INK; g.lineWidth = 6.5; strokePartial(g, p, t, true);
    g.strokeStyle = "rgba(58,38,22,.5)"; g.lineWidth = 2.4;
    g.save(); g.translate(5, 6); strokePartial(g, p, t, true); g.restore();
    g.save(); g.translate(11, 13); g.globalAlpha = t * .5; strokePartial(g, p, t, true); g.restore();
    g.restore();
  }
  function mountain(g, x, y, s, a) {
    g.save(); g.globalAlpha = a; g.strokeStyle = INK; g.lineWidth = 4.2; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - s, y); g.lineTo(x - s * .1, y - s * 1.1); g.lineTo(x + s, y); g.stroke();
    g.beginPath(); g.moveTo(x - s * .1, y - s * 1.1); g.lineTo(x + s * .15, y - s * .55); g.lineTo(x + s * .05, y - s * .3); g.stroke();
    g.lineWidth = 1.6; for (let i = 1; i < 7; i++) { const t = i / 7; g.beginPath(); g.moveTo(x - s * .1 + t * s * 1.05, y - s * 1.1 + t * s * 1.1); g.lineTo(x - s * .02 + t * s * .55, y - s * .9 + t * s * 1.0); g.stroke(); }
    g.fillStyle = "rgba(255,250,235,.35)"; g.beginPath(); g.moveTo(x - s * .1, y - s * 1.1); g.lineTo(x - s * .35, y - s * .78); g.lineTo(x - s * .05, y - s * .82); g.fill();
    g.restore();
  }
  function tree(g, x, y, s, a) {
    g.save(); g.globalAlpha = a; g.fillStyle = "rgba(70,110,60,.35)"; g.beginPath(); g.arc(x, y - s, s, 0, 7); g.fill();
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(x, y - s, s, Math.PI * .9, Math.PI * 2.1); g.stroke(); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - s * .4); g.stroke(); g.restore();
  }
  function wave(g, x, y, s, a) { g.save(); g.globalAlpha = a * .7; g.strokeStyle = "rgba(232,244,238,.85)"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x - s, y); g.quadraticCurveTo(x - s / 2, y - s * .4, x, y); g.quadraticCurveTo(x + s / 2, y - s * .4, x + s, y); g.stroke(); g.restore(); }
  function label(g, txt, x, y, size, a, font = "italic", color = INK, rot = 0, track = 0) {
    if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot); g.fillStyle = color; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `700 ${Math.round(size * .74)}px 'Cinzel Decorative'`; if (track) { g.letterSpacing = track + "px"; } g.fillText(txt, 0, 0); g.restore();
  }
  function hand(g, txt, x, y, size, a, color = INK2, rot = 0, align = "left") { if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot); g.fillStyle = color; g.textAlign = align; g.font = `${size}px Caveat`; g.fillText(txt, 0, 0); g.restore(); }
  function town(g, x, y, a, name, note, dx = 22, hl = false) {
    if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = RED; g.strokeStyle = INK; g.lineWidth = 2.5; if (hl) { g.shadowColor = "rgba(255,180,80,.95)"; g.shadowBlur = 26; g.beginPath(); g.arc(x, y, 26, 0, 7); g.strokeStyle = RED; g.lineWidth = 4; g.stroke(); g.strokeStyle = INK; g.lineWidth = 2.5; }
    g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(x, y, 16, 0, 7); g.lineWidth = 1.4; g.stroke(); g.restore();
    label(g, name, x + dx + 20, y - 4, 54, a, "italic", INK, 0); if (note) hand(g, note, x + dx - 30, y + 42, 40, a);
  }
  function ribbon(g, x, y, w, text, sub, a, hl) {
    if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.translate(x, y);
    const h = 84;
    if (hl) { g.shadowColor = "rgba(255,190,90,.9)"; g.shadowBlur = 28; }
    g.fillStyle = hl ? "#f6e3b4" : "#efdcae"; g.strokeStyle = INK; g.lineWidth = 3;
    // tails
    g.beginPath(); g.moveTo(-w / 2 - 6, 10); g.lineTo(-w / 2 - 54, 16); g.lineTo(-w / 2 - 34, 40); g.lineTo(-w / 2 - 56, 64); g.lineTo(-w / 2 - 6, 60); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(w / 2 + 6, 10); g.lineTo(w / 2 + 54, 16); g.lineTo(w / 2 + 34, 40); g.lineTo(w / 2 + 56, 64); g.lineTo(w / 2 + 6, 60); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-w / 2, 0); g.quadraticCurveTo(0, -18, w / 2, 0); g.lineTo(w / 2, h - 4); g.quadraticCurveTo(0, h - 22, -w / 2, h - 4); g.closePath(); g.fill(); g.shadowBlur = 0; g.stroke();
    g.fillStyle = hl ? RED : INK; g.font = "700 44px 'Cinzel Decorative'"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 0, h / 2 - 10);
    if (sub) { g.font = "700 40px Caveat"; g.fillStyle = INK2; g.fillText(sub, 0, h + 30); }
    g.restore();
  }
  // ---------- landmark illustrations ----------
  function tower(g, x, y, a, hl) {
    if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.strokeStyle = INK; g.lineWidth = 3.2; g.lineJoin = "round";
    if (hl) { g.shadowColor = "rgba(255,180,80,.8)"; g.shadowBlur = 30; }
    g.fillStyle = "#e9d3a4"; g.beginPath(); g.moveTo(-40, 0); g.lineTo(-32, -150); g.lineTo(32, -150); g.lineTo(40, 0); g.closePath(); g.fill(); g.shadowBlur = 0; g.stroke();
    g.beginPath(); for (let i = 0; i < 5; i++) { g.rect(-44 + i * 20, -172, 12, 22); } g.fill(); g.stroke();
    g.beginPath(); g.rect(-46, -152, 92, 8); g.fill(); g.stroke();
    g.beginPath(); g.arc(0, -10, 14, Math.PI, 0); g.lineTo(14, 0); g.lineTo(-14, 0); g.closePath(); g.fillStyle = INK; g.fill();
    g.fillStyle = hl ? "#ffcf6a" : INK; [[-12, -110], [10, -70]].forEach(([wx, wy]) => { g.beginPath(); g.arc(wx, wy, 7, Math.PI, 0); g.lineTo(wx + 7, wy + 14); g.lineTo(wx - 7, wy + 14); g.fill(); });
    g.lineWidth = 1.4; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(16 + (i % 2) * 6, -140 + i * 15); g.lineTo(30 + (i % 2) * 4, -140 + i * 15); g.stroke(); }
    g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, -172); g.lineTo(0, -232); g.stroke(); { const w = Math.sin(TNOW / 380) * 7, w2 = Math.sin(TNOW / 380 + 1.4) * 6; g.fillStyle = RED; g.beginPath(); g.moveTo(0, -232); g.quadraticCurveTo(22, -232 + w, 52, -220 + w2); g.quadraticCurveTo(26, -208 + w, 0, -204); g.fill(); g.stroke(); }
    // book on the tower door step
    g.restore();
  }
  function workshop(g, x, y, a, hl, now) {
    if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.strokeStyle = INK; g.lineWidth = 3.2; g.lineJoin = "round";
    if (hl) { g.shadowColor = "rgba(255,180,80,.8)"; g.shadowBlur = 30; }
    g.fillStyle = "#e9d3a4";
    // workshop house
    g.beginPath(); g.moveTo(-90, 0); g.lineTo(-90, -70); g.lineTo(-40, -120); g.lineTo(10, -70); g.lineTo(10, 0); g.closePath(); g.fill(); g.shadowBlur = 0; g.stroke();
    g.beginPath(); g.rect(-62, -40, 26, 40); g.stroke(); g.fillStyle = hl ? "#ffcf6a" : INK; g.fillRect(-28, -62, 20, 18);
    // chimney + smoke
    g.fillStyle = "#e9d3a4"; g.beginPath(); g.rect(-24, -118, 18, 34); g.fill(); g.stroke();
    g.lineWidth = 2; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-12 + i * 14 + Math.sin(now / 600 + i) * 4, -138 - i * 22, 9 + i * 4, 0, 7); g.stroke(); }
    // windmill
    g.lineWidth = 3.2; g.fillStyle = "#e9d3a4"; g.beginPath(); g.moveTo(30, 0); g.lineTo(42, -110); g.lineTo(72, -110); g.lineTo(84, 0); g.closePath(); g.fill(); g.stroke();
    g.save(); g.translate(57, -112); g.rotate(now / 1800);
    for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -78); g.stroke(); g.beginPath(); g.rect(2, -76, 16, 58); g.stroke(); g.lineWidth = 1; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(2, -70 + k * 11); g.lineTo(18, -70 + k * 11); g.stroke(); } g.lineWidth = 3.2; }
    g.restore(); g.beginPath(); g.arc(57, -112, 6, 0, 7); g.fillStyle = INK; g.fill();
    // gear
    g.save(); g.translate(-120, -20); g.rotate(-now / 1500); g.lineWidth = 2.4; g.beginPath(); for (let i = 0; i < 20; i++) { const r = i % 2 ? 22 : 30, an = i / 20 * Math.PI * 2; g.lineTo(Math.cos(an) * r, Math.sin(an) * r); } g.closePath(); g.stroke(); g.beginPath(); g.arc(0, 0, 8, 0, 7); g.stroke(); g.restore();
    g.restore();
  }
  function lighthouse(g, x, y, a, hl, now) {
    if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.strokeStyle = INK; g.lineWidth = 3.2; g.lineJoin = "round";
    // beams
    const sw = Math.sin(now / 1100) * .5; g.save(); g.translate(0, -150); g.rotate(sw); const bg = g.createLinearGradient(0, 0, 260, 0); bg.addColorStop(0, hl ? "rgba(255,200,90,.6)" : "rgba(255,210,120,.35)"); bg.addColorStop(1, "rgba(255,210,120,0)"); g.fillStyle = bg; g.beginPath(); g.moveTo(0, 0); g.lineTo(260, -50); g.lineTo(260, 50); g.closePath(); g.fill(); g.scale(-1, 1); g.beginPath(); g.moveTo(0, 0); g.lineTo(260, -50); g.lineTo(260, 50); g.closePath(); g.fill(); g.restore();
    if (hl) { g.shadowColor = "rgba(255,180,80,.8)"; g.shadowBlur = 30; }
    g.fillStyle = "#e9d3a4"; g.beginPath(); g.moveTo(-34, 0); g.lineTo(-20, -130); g.lineTo(20, -130); g.lineTo(34, 0); g.closePath(); g.fill(); g.shadowBlur = 0; g.stroke();
    g.fillStyle = "rgba(142,42,26,.75)"; [[-30, -40, -24, -78], [-22, -96, -20, -118]].forEach(() => { });
    g.beginPath(); g.moveTo(-31, -30); g.lineTo(31, -30); g.lineTo(28, -55); g.lineTo(-28, -55); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-25, -80); g.lineTo(25, -80); g.lineTo(22, -105); g.lineTo(-22, -105); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = hl ? "#ffd27a" : "#f2dca0"; g.beginPath(); g.rect(-16, -164, 32, 34); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-24, -164); g.lineTo(0, -192); g.lineTo(24, -164); g.closePath(); g.fillStyle = INK; g.fill();
    g.beginPath(); g.rect(-26, -132, 52, 6); g.stroke();
    // envelope icon floating
    g.save(); g.translate(64, -40); g.rotate(-.2); g.fillStyle = "#f4e6c4"; g.beginPath(); g.rect(-26, -17, 52, 34); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-26, -17); g.lineTo(0, 4); g.lineTo(26, -17); g.stroke(); g.fillStyle = RED; g.beginPath(); g.arc(0, 4, 6, 0, 7); g.fill(); g.restore();
    g.restore();
  }
  function chest(g, x, y, a, hl) {
    if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.strokeStyle = INK; g.lineWidth = 3.2; g.lineJoin = "round";
    if (hl) { g.shadowColor = "rgba(255,180,80,.8)"; g.shadowBlur = 30; }
    g.fillStyle = "#e2c896"; g.beginPath(); g.rect(-62, -70, 124, 64); g.fill(); g.shadowBlur = 0; g.stroke();
    g.beginPath(); g.moveTo(-62, -70); g.quadraticCurveTo(0, -122, 62, -70); g.closePath(); g.fillStyle = "#d8b880"; g.fill(); g.stroke();
    g.lineWidth = 2; [-30, 30].forEach(sx => { g.beginPath(); g.moveTo(sx, -6); g.lineTo(sx, -100 + Math.abs(sx) * .3); g.stroke(); });
    g.fillStyle = hl ? "#ffcf6a" : INK; g.fillRect(-9, -66, 18, 22);
    g.restore();
  }
  function treasure(g, x, y, a, hl, now) { // a small open chest of gold coins, with a twinkle
    if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.strokeStyle = INK; g.lineWidth = 3; g.lineJoin = "round";
    if (hl) { g.shadowColor = "rgba(255,180,80,.85)"; g.shadowBlur = 30; }
    g.fillStyle = "#d8b880"; g.beginPath(); g.moveTo(-50, -40); g.lineTo(-44, -96); g.quadraticCurveTo(0, -122, 44, -96); g.lineTo(50, -40); g.closePath(); g.fill(); g.shadowBlur = 0; g.stroke();
    g.fillStyle = "#f2c95a"; g.beginPath(); g.ellipse(0, -44, 46, 14, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#e2c896"; g.beginPath(); g.rect(-54, -44, 108, 46); g.fill(); g.stroke();
    g.lineWidth = 2; [-26, 26].forEach(sx => { g.beginPath(); g.moveTo(sx, 2); g.lineTo(sx, -44); g.stroke(); });
    g.fillStyle = hl ? "#ffcf6a" : INK; g.fillRect(-8, -36, 16, 18);
    g.fillStyle = "#f2c95a"; g.lineWidth = 2; [[-70, -4], [-58, 6], [66, 0]].forEach(([cx, cy]) => { g.beginPath(); g.ellipse(cx, cy, 12, 6, 0, 0, 7); g.fill(); g.stroke(); });
    // twinkles
    for (let i = 0; i < 3; i++) { const tw = Math.max(0, Math.sin(now / 520 + i * 2.1)); if (tw < .05) continue; const sx = [-24, 18, 2][i], sy = [-62, -70, -84][i], s = 9 * tw;
      g.fillStyle = "rgba(255,236,170," + tw + ")"; g.beginPath(); g.moveTo(sx, sy - s * 1.6); g.lineTo(sx + s * .35, sy - s * .35); g.lineTo(sx + s * 1.6, sy); g.lineTo(sx + s * .35, sy + s * .35); g.lineTo(sx, sy + s * 1.6); g.lineTo(sx - s * .35, sy + s * .35); g.lineTo(sx - s * 1.6, sy); g.lineTo(sx - s * .35, sy - s * .35); g.closePath(); g.fill(); }
    g.restore();
  }
  function gulls(g, now, a) { // three small birds drifting slowly over the sea
    if (a <= 0) return; g.save(); g.globalAlpha = a * .8; g.strokeStyle = INK; g.lineWidth = 2.4; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const t = ((now / 52000 + i * .31) % 1), x = 200 + t * 1650, y = 560 + i * 60 + Math.sin(t * 9 + i) * 26, f = Math.sin(now / 260 + i * 2) * 5;
      g.beginPath(); g.moveTo(x - 16, y - 2 + f); g.quadraticCurveTo(x - 8, y - 9, x, y); g.quadraticCurveTo(x + 8, y - 9, x + 16, y - 2 + f); g.stroke(); }
    g.restore();
  }
  const routeLen = (() => { const L = [0]; for (let i = 1; i < route.length; i++) L.push(L[i - 1] + Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1])); return L; })();
  function along(u) { // a smooth point at fraction u of the route's length
    const d = u * routeLen[routeLen.length - 1]; let i = 1; while (i < routeLen.length - 1 && routeLen[i] < d) i++;
    const t = (d - routeLen[i - 1]) / Math.max(1e-6, routeLen[i] - routeLen[i - 1]); return [route[i - 1][0] + (route[i][0] - route[i - 1][0]) * t, route[i - 1][1] + (route[i][1] - route[i - 1][1]) * t];
  }
  function wake(g, u, now, a) {
    if (a <= 0) return; g.save(); g.strokeStyle = "rgba(40,80,90,.7)"; g.lineCap = "round";
    for (let k = 1; k <= 5; k++) { const p = along(Math.max(0, u - k * .012)); g.globalAlpha = a * (1 - k / 6) * .8; g.lineWidth = 3 - k * .4; const s = 10 + k * 4;
      g.beginPath(); g.moveTo(p[0] - s, p[1] + 10 + Math.sin(now / 500 + k) * 1.5); g.quadraticCurveTo(p[0], p[1] + 4, p[0] + s, p[1] + 10 + Math.cos(now / 500 + k) * 1.5); g.stroke(); }
    g.restore();
  }
  function border(g, a) {
    if (a <= 0) return; g.save(); g.globalAlpha = a * .8; g.strokeStyle = INK2; g.lineWidth = 4; g.strokeRect(110, 100, 1828, 1200); g.lineWidth = 1.6; g.strokeRect(126, 116, 1796, 1168);
    [[110, 100], [1938, 100], [110, 1300], [1938, 1300]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 18, 0, 7); g.stroke(); g.beginPath(); g.arc(x, y, 8, 0, 7); g.fillStyle = INK2; g.fill(); });
    g.restore();
  }
  function ship(g, x, y, a, now, dir = 1) {
    if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y + Math.sin(now / 2200) * 1.6); g.rotate(Math.sin(now / 2900) * .025); g.scale(dir, 1); g.strokeStyle = INK; g.lineWidth = 2.6; g.fillStyle = "#e9d3a4";
    g.beginPath(); g.moveTo(-50, 0); g.lineTo(50, 0); g.lineTo(36, 22); g.lineTo(-38, 22); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -80); g.stroke();
    g.beginPath(); g.moveTo(4, -76); g.quadraticCurveTo(40, -50, 6, -10); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-4, -64); g.quadraticCurveTo(-34, -40, -6, -12); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = RED; g.beginPath(); g.moveTo(0, -80); g.lineTo(18, -74); g.lineTo(0, -68); g.fill();
    g.restore();
  }
  function serpent(g, x, y, a, now) {
    if (a <= 0) return; g.save(); g.globalAlpha = a * .9; g.translate(x, y); g.strokeStyle = INK; g.lineWidth = 3; g.fillStyle = "#c9d6b8";
    const ph = now / 900;
    for (let i = 0; i < 3; i++) { const bx = i * 64, h = 26 + Math.sin(ph + i) * 4; g.beginPath(); g.moveTo(bx - 26, 0); g.quadraticCurveTo(bx, -h * 2, bx + 26, 0); g.fill(); g.stroke(); g.lineWidth = 1.4; g.beginPath(); g.moveTo(bx - 12, -h * .6); g.lineTo(bx - 4, -h * .9); g.moveTo(bx + 4, -h * .9); g.lineTo(bx + 12, -h * .6); g.stroke(); g.lineWidth = 3; }
    // head
    g.beginPath(); g.moveTo(-34, 0); g.quadraticCurveTo(-50, -54, -86, -48); g.quadraticCurveTo(-104, -40, -96, -26); g.quadraticCurveTo(-70, -26, -56, 0); g.fill(); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(-84, -40, 3.5, 0, 7); g.fill();
    g.beginPath(); g.moveTo(-74, -48); g.lineTo(-70, -62); g.lineTo(-64, -46); g.stroke();
    // tail
    g.beginPath(); g.moveTo(180, 0); g.quadraticCurveTo(206, -30, 226, -20); g.quadraticCurveTo(212, -14, 222, 0); g.stroke();
    g.lineWidth = 1.6; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-60 + i * 50, 8); g.quadraticCurveTo(-48 + i * 50, 3, -36 + i * 50, 8); g.stroke(); }
    g.restore();
  }
  function rose(g, x, y, s, a, now) {
    if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.strokeStyle = INK; g.lineWidth = 2;
    g.beginPath(); g.arc(0, 0, s, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, s * .86, 0, 7); g.stroke();
    for (let i = 0; i < 32; i++) { const an = i / 32 * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(an) * s * .86, Math.sin(an) * s * .86); g.lineTo(Math.cos(an) * s * (i % 4 ? .93 : 1), Math.sin(an) * s * (i % 4 ? .93 : 1)); g.stroke(); }
    const star = (ro, ri, rot, dark) => { for (let i = 0; i < 4; i++) { const an = rot + i * Math.PI / 2; const l = [Math.cos(an) * ro, Math.sin(an) * ro]; const s1 = [Math.cos(an + Math.PI / 4) * ri, Math.sin(an + Math.PI / 4) * ri], s2 = [Math.cos(an - Math.PI / 4) * ri, Math.sin(an - Math.PI / 4) * ri];
      g.fillStyle = dark ? INK : "#efdcae"; g.beginPath(); g.moveTo(0, 0); g.lineTo(l[0], l[1]); g.lineTo(s1[0], s1[1]); g.closePath(); g.fill(); g.stroke(); g.fillStyle = dark ? "#efdcae" : INK; g.beginPath(); g.moveTo(0, 0); g.lineTo(l[0], l[1]); g.lineTo(s2[0], s2[1]); g.closePath(); g.fill(); g.stroke(); } };
    star(s * .62, s * .14, Math.PI / 4, true); star(s * 1.08, s * .2, -Math.PI / 2, false);
    g.fillStyle = RED; g.font = "700 33px 'Cinzel Decorative'"; g.textAlign = "center"; g.fillText("N", 0, -s * 1.18);
    g.restore();
  }


  // a watercolour sea around the islands, painted once
  const seaCanvas = (() => {
    const c = document.createElement("canvas"); c.width = 2048; c.height = 1400; const g = c.getContext("2d");
    const gr = g.createRadialGradient(1000, 760, 120, 1000, 760, 1250); gr.addColorStop(0, "rgba(14,132,150,.92)"); gr.addColorStop(.7, "rgba(10,108,132,.95)"); gr.addColorStop(1, "rgba(8,84,108,.97)");
    g.fillStyle = gr; g.fillRect(70, 70, 1908, 1260);
    // soft blooms of darker and lighter pigment, like watercolour drying unevenly
    for (let i = 0; i < 60; i++) { const x = R(100, 1950), y = R(100, 1300), r = R(60, 220); const b = g.createRadialGradient(x, y, 0, x, y, r); const dark = i % 3 === 0; b.addColorStop(0, dark ? "rgba(40,90,104,.12)" : "rgba(180,214,210,.10)"); b.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = b; g.fillRect(x - r, y - r, r * 2, r * 2); }
    // the islands are cut out, with a soft shallow-water rim around them
    g.fillStyle = "#000"; g.save(); g.globalCompositeOperation = "destination-out"; g.filter = "blur(10px)"; Object.values(lands).forEach(p => { fillPoly(g, p); g.fill(); }); g.restore();
    g.save(); g.globalCompositeOperation = "destination-out"; Object.values(lands).forEach(p => { fillPoly(g, p); g.fill(); }); g.restore();
    g.save(); g.globalCompositeOperation = "source-atop"; g.filter = "blur(16px)"; g.strokeStyle = "rgba(170,226,222,.7)"; g.lineWidth = 60; Object.values(lands).forEach(p => { fillPoly(g, p); g.stroke(); }); g.restore();
    g.save(); g.globalCompositeOperation = "source-atop"; g.filter = "blur(3px)"; g.strokeStyle = "rgba(255,255,250,.85)"; g.lineWidth = 9; Object.values(lands).forEach(p => { fillPoly(g, p); g.stroke(); }); g.restore();
    // fade at the torn paper edge
    g.save(); g.globalCompositeOperation = "destination-in"; const e = g.createRadialGradient(1024, 700, 500, 1024, 700, 1150); e.addColorStop(0, "rgba(0,0,0,1)"); e.addColorStop(1, "rgba(0,0,0,.25)"); g.fillStyle = e; g.fillRect(0, 0, 2048, 1400); g.restore();
    return c;
  })();
  const ripples = [[760, 1010], [1880, 700], [300, 860], [1230, 470], [900, 170]];
  function rippleRings(g, now, a) {
    if (a <= 0) return; g.save(); g.lineWidth = 2.2;
    ripples.forEach(([x, y], i) => { for (let r = 0; r < 3; r++) { const f = ((now / 5200 + i * .37 + r / 3) % 1); g.strokeStyle = `rgba(230,246,244,${(1 - f) * .45 * a})`; g.beginPath(); g.ellipse(x, y, 16 + f * 70, (16 + f * 70) * .42, 0, 0, 7); g.stroke(); } });
    g.restore();
  }

  return {
    seaCanvas, route, routes, PINS, ISLES, mountains: [], lands, // the journey line in map pixels, drawn in 3D as a glowing path
    // a soft height map of the land, used to lift the islands out of the paper
    heightMask(w, h) {
      const full = document.createElement("canvas"); full.width = 2048; full.height = 1400; const f = full.getContext("2d");
      f.fillStyle = "#000"; f.fillRect(0, 0, 2048, 1400); f.fillStyle = "#fff";
      Object.values(lands).forEach(p => { fillPoly(f, p); f.fill(); });
      f.fillStyle = "rgba(255,255,255,.55)"; mountains.forEach(([x, y, r]) => { f.beginPath(); f.arc(x, y - 10, r * 1.1, 0, 7); f.fill(); });
      const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d");
      g.filter = "blur(5px)"; g.drawImage(full, 0, 0, w, h); g.filter = "none";
      return g.getImageData(0, 0, w, h);
    },
    drawBase(g) {
      // faint old pencil sketches that were always on this paper
      g.save(); g.globalAlpha = .16; g.strokeStyle = "#3a2a1c"; g.lineWidth = 2;
      g.beginPath(); g.arc(1780, 1210, 34, 0, 7); g.moveTo(1760, 1200); g.lineTo(1770, 1200); g.moveTo(1790, 1200); g.lineTo(1800, 1200); g.moveTo(1765, 1222); g.quadraticCurveTo(1780, 1236, 1795, 1222); g.stroke();
      g.font = "34px Caveat"; g.fillStyle = "#3a2a1c"; g.fillText("idea + coffee = code", 1600, 1300); g.fillText("v3-final-REAL", 200, 1310);
      g.restore();
    },
    draw(g, k, hover, now) {
      TNOW = now;
      const sea = prog(k, 0, .22);
      if (sea > 0) { g.save(); g.globalAlpha = sea; g.drawImage(seaCanvas, 0, 0, g.canvas.width, g.canvas.height); g.restore(); }
      rippleRings(g, now, prog(k, .4, .6));
      waves.forEach((w, i) => wave(g, w[0] + Math.sin(now / 2400 + i) * 7, w[1], w[2], prog(k, .3 + i * .002, .5 + i * .002) * (insideAny(w[0], w[1]) || nearSpot(w[0], w[1]) ? 0 : .7)));
      rose(g, 300, 1150, 92, prog(k, .8, .92), now);
      border(g, prog(k, .02, .25));
    }
  };
  function nearSpot(x, y) { return MAP_SPOTS.some(s => Math.hypot(x - s.x, y - s.y) < 230) || Math.hypot(x - 980, y - 1160) < 120 || (x < 660 && y > 1020); }
  function insideAny(x, y) { return Object.values(lands).some(p => pip(x, y, p)); }
  function pip(x, y, p) { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { if (((p[i][1] > y) !== (p[j][1] > y)) && (x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0])) c = !c; } return c; }
}
