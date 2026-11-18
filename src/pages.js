// Shared helpers that paint "paper" canvases: book pages, the postcard, the letter.
export const IMG = {};
export function loadImages(list) {
  return Promise.all(list.map(([k, src]) => new Promise(res => { const i = new Image(); i.onload = () => { IMG[k] = i; res(); }; i.onerror = () => res(); i.src = src; })));
}
export function paperBG(g, w, h, opts = {}) {
  const tint = opts.tint || "#f1e5c8";
  g.fillStyle = tint; g.fillRect(0, 0, w, h);
  if (IMG.paper) { // painted paper texture, cropped from the middle of the sheet
    const s = IMG.paper; const sx = s.width * Math.min(.42, Math.max(.1, opts.sx || .2)), sy = s.height * Math.min(.32, Math.max(.12, opts.sy || .2));
    g.globalAlpha = opts.texA ?? .32; g.drawImage(s, sx, sy, s.width * .45, s.height * .55, 0, 0, w, h); g.globalAlpha = 1;
  }
  // soft darkening towards the edges and gutter
  const e = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.max(w, h) * .75); e.addColorStop(0, "rgba(0,0,0,0)"); e.addColorStop(1, "rgba(90,55,20,.16)"); g.fillStyle = e; g.fillRect(0, 0, w, h);
  if (opts.gutter) { const gx = opts.gutter === "left" ? 0 : w; const gr = g.createLinearGradient(gx, 0, opts.gutter === "left" ? 140 : w - 140, 0); gr.addColorStop(0, "rgba(70,40,15,.3)"); gr.addColorStop(1, "rgba(70,40,15,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
}
export function wrap(g, text, x, y, maxW, lh) {
  const words = text.split(" "); let line = ""; let yy = y;
  for (const w of words) { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = t; }
  if (line) g.fillText(line, x, yy); return yy + lh;
}
export function tape(g, x, y, w, h, rot) {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = "rgba(236,222,180,.72)"; g.shadowColor = "rgba(0,0,0,.18)"; g.shadowBlur = 4; g.shadowOffsetY = 2;
  g.beginPath(); g.moveTo(-w / 2, -h / 2); for (let i = 0; i <= 8; i++) g.lineTo(-w / 2 + i * w / 8, -h / 2 + (i % 2 ? 3 : 0)); g.lineTo(w / 2, h / 2); for (let i = 8; i >= 0; i--) g.lineTo(-w / 2 + i * w / 8, h / 2 - (i % 2 ? 3 : 0)); g.closePath(); g.fill(); g.restore();
}
export function polaroid(g, img, x, y, w, h, rot, caption) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.shadowColor = "rgba(40,20,5,.45)"; g.shadowBlur = 22; g.shadowOffsetX = -6; g.shadowOffsetY = 10;
  g.fillStyle = "#f6efdc"; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = "transparent";
  const pad = w * .06, ph = h - pad - h * .17;
  if (img) { const ir = img.width / img.height, tr = (w - pad * 2) / ph; let sw = img.width, sh = img.height, sx = 0, sy = 0; if (ir > tr) { sw = img.height * tr; sx = (img.width - sw) / 2; } else { sh = img.width / tr; sy = (img.height - sh) * .3; }
    g.fillStyle = "#2a2420"; g.fillRect(-w / 2 + pad, -h / 2 + pad, w - pad * 2, ph);
    g.filter = "sepia(.25) saturate(1.05) contrast(1.05)"; g.drawImage(img, sx, sy, sw, sh, -w / 2 + pad, -h / 2 + pad, w - pad * 2, ph); g.filter = "none"; }
  const vg = g.createRadialGradient(0, -h / 2 + pad + ph / 2, ph * .3, 0, -h / 2 + pad + ph / 2, ph * .8); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(40,20,5,.35)"); g.fillStyle = vg; g.fillRect(-w / 2 + pad, -h / 2 + pad, w - pad * 2, ph);
  if (caption) { g.fillStyle = "#3a2a1c"; g.font = `${Math.round(h * .085)}px Caveat`; g.textAlign = "center"; g.fillText(caption, 0, h / 2 - h * .055); }
  g.restore();
}
export function doodleArrow(g, x1, y1, x2, y2, bend = 30) {
  g.save(); g.strokeStyle = "#3a2a1c"; g.lineWidth = 4; g.lineCap = "round";
  const mx = (x1 + x2) / 2 + bend, my = (y1 + y2) / 2 - bend; g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2); g.stroke();
  const a = Math.atan2(y2 - my, x2 - mx); g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - Math.cos(a - .5) * 22, y2 - Math.sin(a - .5) * 22); g.moveTo(x2, y2); g.lineTo(x2 - Math.cos(a + .5) * 22, y2 - Math.sin(a + .5) * 22); g.stroke(); g.restore();
}
export function sketchBox(g, x, y, w, h, color = "#3a2a1c", lw = 3) {
  g.save(); g.strokeStyle = color; g.lineWidth = lw; g.lineJoin = "round";
  for (let p = 0; p < 2; p++) { const j = () => (Math.random() - .5) * 6; g.beginPath(); g.moveTo(x + j(), y + j()); g.lineTo(x + w + j(), y + j()); g.lineTo(x + w + j(), y + h + j()); g.lineTo(x + j(), y + h + j()); g.closePath(); g.globalAlpha = p ? .5 : 1; g.stroke(); }
  g.restore();
}
