document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

// ── Curved text marquee ──────────────────────────────────────────────────────
(function () {
    const textPath = document.getElementById('curvedTextPath');
    if (!textPath) return;

    let offset = 0;
    let running = true;

    document.addEventListener('visibilitychange', () => { running = !document.hidden; });

    (function tick() {
        if (running) {
            offset -= 0.2;
            if (offset <= -25) offset = 0;
            textPath.setAttribute('startOffset', `${offset}%`);
        }
        requestAnimationFrame(tick);
    })();
})();

// ── Side particles ───────────────────────────────────────────────────────────
class SideParticles {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: -9999, y: -9999 };
        this.rafId = null;
        this.resize();
        window.addEventListener('resize', () => this.resize(), { passive: true });
        canvas.addEventListener('mousemove', e => { this.mouse.x = e.offsetX; this.mouse.y = e.offsetY; }, { passive: true });
        canvas.addEventListener('mouseleave', () => { this.mouse.x = -9999; this.mouse.y = -9999; }, { passive: true });
        for (let i = 0; i < 80; i++) {
            this.particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, w: 2, h: Math.random() * 12 + 6, speedY: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.5 + 0.2 });
        }
        this.tick();
    }

    resize() {
        this.canvas.width  = this.canvas.clientWidth;
        this.canvas.height = this.canvas.parentElement.offsetHeight;
    }

    tick() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const p of this.particles) {
            p.y -= p.speedY;
            const dx = p.x - this.mouse.x;
            const dy = p.y - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const f = (150 - dist) / 150;
                p.x += (dx / dist) * f * 10;
                p.y += (dy / dist) * f * 10;
            }
            if (p.y < -20)               p.y = this.canvas.height + 20;
            if (p.x < 0)                 p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            this.ctx.fillStyle = `rgba(255,107,53,${p.opacity})`;
            this.ctx.beginPath();
            this.ctx.roundRect(p.x, p.y, p.w, p.h, 5);
            this.ctx.fill();
        }
        this.rafId = requestAnimationFrame(() => this.tick());
    }

    destroy() { cancelAnimationFrame(this.rafId); }
}

const leftCanvas  = document.getElementById('leftParticles');
const rightCanvas = document.getElementById('rightParticles');
const leftParticles  = leftCanvas  ? new SideParticles(leftCanvas)  : null;
const rightParticles = rightCanvas ? new SideParticles(rightCanvas) : null;
window.addEventListener('beforeunload', () => { leftParticles?.destroy(); rightParticles?.destroy(); });

// ── Circular text (footer) ───────────────────────────────────────────────────
(function () {
    const el = document.getElementById('circularText');
    if (!el) return;
    const text = '• FABIAN CORSALINI • PORTFOLIO 2026 ';
    const step = 360 / text.length;
    text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.transform = `rotate(${step * i}deg)`;
        el.appendChild(span);
    });
})();

// ── Typewriter (hero role) ───────────────────────────────────────────────────
(function () {
    const el = document.getElementById('typedText');
    if (!el) return;
    const texts = ['Creative Software Developer', 'Web Developer', 'UI/UX Enthusiast'];
    let ti = 0, ci = 0, deleting = false;

    function tick() {
        const current = texts[ti];
        el.textContent = current.substring(0, deleting ? ci - 1 : ci + 1);
        deleting ? ci-- : ci++;
        if (!deleting && ci === current.length)  { deleting = true;  return setTimeout(tick, 2000); }
        if (deleting  && ci === 0)               { deleting = false; ti = (ti + 1) % texts.length; return setTimeout(tick, 500); }
        setTimeout(tick, deleting ? 50 : 100);
    }
    tick();
})();

// ── Hero photo parallax ──────────────────────────────────────────────────────
(function () {
    const photo = document.getElementById('heroPhoto');
    if (!photo || window.innerWidth <= 768) return;
    window.addEventListener('mousemove', e => {
        const x = (e.clientX / window.innerWidth  - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        photo.style.transform = `translate(${x}px,${y}px)`;
    }, { passive: true });
})();

// ── Scroll animations (IntersectionObserver) ─────────────────────────────────
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const els = entry.target.querySelectorAll('.animate-card, .animate-text, .stat-item, .timeline-item');
        if (typeof anime !== 'undefined' && els.length) {
            anime({ targets: els, translateY: [50, 0], opacity: [0, 1], delay: anime.stagger(100), easing: 'easeOutExpo' });
        }
        sectionObserver.unobserve(entry.target);
    });
}, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

document.querySelectorAll('.animate-section').forEach(s => sectionObserver.observe(s));

// ── Theme toggle ─────────────────────────────────────────────────────────────
(function () {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        btn.setAttribute('aria-pressed', 'true');
    }

    btn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        btn.setAttribute('aria-pressed', isLight);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
})();

// ── Smooth scroll for anchor links ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ── Active nav link on scroll ─────────────────────────────────────────────────
window.addEventListener('scroll', () => {
    document.querySelectorAll('section[id]').forEach(section => {
        const top = section.offsetTop - 100;
        if (window.scrollY >= top && window.scrollY < top + section.clientHeight) {
            document.querySelectorAll('.nav-links a').forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === `#${section.id}`);
            });
        }
    });
}, { passive: true });

// ── Skills circle sticky (JS because overflow-x:hidden breaks CSS sticky) ────
(function () {
    const section = document.querySelector('.skills-new');
    const circle  = document.querySelector('.skills-right-inner');
    if (!section || !circle) return;

    function position() {
        const rect   = section.getBoundingClientRect();
        const viewH  = window.innerHeight;
        const circleH = circle.offsetHeight;
        const ideal   = viewH / 2 - circleH / 2;
        const offset  = Math.min(Math.max(-rect.top + ideal, 0), rect.height - circleH);
        circle.style.transform = `translateX(-50%) translateY(${offset}px)`;
    }

    window.addEventListener('scroll', position, { passive: true });
    window.addEventListener('resize', position, { passive: true });
    position();
})();

// ── My Journey — zigzag timeline with GSAP ───────────────────────────────────
(function () {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const titleEl = document.querySelector('.journey-title');
    if (titleEl) {
        titleEl.innerHTML = titleEl.textContent.trim().split(' ')
            .map(w => `<span class="word-wrap"><span class="word-inner">${w}</span></span>`)
            .join(' ');
        gsap.fromTo(titleEl.querySelectorAll('.word-inner'),
            { opacity: 0, xPercent: -80, rotateZ: -4, transformOrigin: '0% 50%' },
            { opacity: 1, xPercent: 0, rotateZ: 0, duration: 0.7, ease: 'expo.out', stagger: 0.08,
              scrollTrigger: { trigger: titleEl, start: 'top 90%', toggleActions: 'play none none none' } }
        );
    }

    document.querySelectorAll('.zz-reveal-text').forEach(el => {
        const text = el.dataset.text;
        if (!text) return;
        el.innerHTML = text.split(' ').map(w => `<span class="sr-word">${w}</span>`).join(' ');
        gsap.fromTo(el.querySelectorAll('.sr-word'),
            { opacity: 0.1, filter: 'blur(3px)' },
            { opacity: 1, filter: 'blur(0px)', ease: 'none', stagger: 0.04,
              scrollTrigger: { trigger: el, start: 'top bottom-=10%', end: 'bottom center+=10%', scrub: true } }
        );
    });

    document.querySelectorAll('.zz-entry').forEach(entry => {
        if (entry.getBoundingClientRect().top < window.innerHeight) entry.classList.add('in');
        ScrollTrigger.create({ trigger: entry, start: 'top bottom-=60px', once: true, onEnter: () => entry.classList.add('in') });
    });

    function buildPath() {
        const outer = document.getElementById('zzOuter');
        const svg   = document.getElementById('zzSvg');
        if (!outer || !svg) return;

        const outerRect = outer.getBoundingClientRect();
        const rose      = document.getElementById('zzRose');
        const roseRect  = rose.getBoundingClientRect();

        const points = [{ x: roseRect.left - outerRect.left + roseRect.width / 2, y: roseRect.top - outerRect.top + roseRect.height * 0.6 }];

        document.querySelectorAll('.zz-entry').forEach(entry => {
            const card = entry.querySelector('.zz-card');
            if (!card) return;
            const r = card.getBoundingClientRect();
            const odd = entry.classList.contains('zz-odd');
            points.push({
                x: odd ? r.left - outerRect.left + r.width + 10 : r.left - outerRect.left - 10,
                y: r.top - outerRect.top + r.height * 0.28
            });
        });

        if (points.length < 2) return;

        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i], p1 = points[i + 1];
            const dy = p1.y - p0.y;
            d += ` C ${p0.x} ${p0.y + dy * 0.5}, ${p1.x} ${p1.y - dy * 0.5}, ${p1.x} ${p1.y}`;
        }

        const w = outer.offsetWidth, h = outer.offsetHeight;
        const pathGhost = document.getElementById('pathGhost');
        const pathDraw  = document.getElementById('pathDraw');
        pathGhost.setAttribute('d', d);
        pathDraw.setAttribute('d', d);
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.style.width = `${w}px`; svg.style.height = `${h}px`;

        const len = pathDraw.getTotalLength();
        pathDraw.style.strokeDasharray  = len;
        pathDraw.style.strokeDashoffset = len;

        ScrollTrigger.getAll().filter(st => st._isPath).forEach(st => st.kill());
        ScrollTrigger.create({
            _isPath: true,
            trigger: outer,
            start: 'top 70%', end: 'bottom 60%', scrub: 1,
            onUpdate: self => { pathDraw.style.strokeDashoffset = len * (1 - self.progress); }
        });
    }

    window.addEventListener('load',   () => setTimeout(buildPath, 300));
    window.addEventListener('resize', () => setTimeout(buildPath, 100));
})();

// ── Contact form (Formspree) ─────────────────────────────────────────────────
(function () {
    const form    = document.getElementById('contactForm');
    if (!form) return;
    const btn     = document.getElementById('cfSubmit');
    const success = document.getElementById('cfSuccess');
    const error   = document.getElementById('cfError');

    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (form.action.includes('YOUR_FORM_ID')) {
            error.textContent = 'Form not configured yet. Email: fabichelsea555@outlook.com';
            error.style.display = 'block';
            return;
        }
        btn.disabled = true;
        btn.querySelector('.cf-submit-text').textContent = 'Sending...';
        success.style.display = error.style.display = 'none';
        try {
            const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
            if (!res.ok) throw new Error();
            success.style.display = 'block';
            form.reset();
            btn.querySelector('.cf-submit-text').textContent = 'Sent!';
            setTimeout(() => { btn.disabled = false; btn.querySelector('.cf-submit-text').textContent = 'Send Message'; }, 4000);
        } catch {
            error.style.display = 'block';
            btn.disabled = false;
            btn.querySelector('.cf-submit-text').textContent = 'Send Message';
        }
    });
})();

// ── Why Me — glitch canvas + card tilt/spotlight ──────────────────────────────
(function () {
    const canvas = document.getElementById('glitch-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>[]{}';
    const colors = ['#ff5500','#ff7733','#ff6600','#ff7700','#ff9900'];
    const CW = 11, CH = 19, FS = 13;
    let letters = [], cols = 0, rows = 0, last = 0;

    function resize() {
        canvas.width  = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        cols = Math.ceil(canvas.width  / CW);
        rows = Math.ceil(canvas.height / CH);
        letters = Array.from({ length: cols * rows }, () => ({ ch: chars[Math.floor(Math.random() * chars.length)], col: colors[Math.floor(Math.random() * colors.length)] }));
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${FS}px monospace`;
        ctx.textBaseline = 'top';
        letters.forEach((l, i) => { ctx.fillStyle = l.col; ctx.fillText(l.ch, (i % cols) * CW, Math.floor(i / cols) * CH); });
    }

    function update() {
        const n = Math.max(1, Math.floor(letters.length * 0.015));
        for (let i = 0; i < n; i++) {
            const idx = Math.floor(Math.random() * letters.length);
            letters[idx].ch  = chars[Math.floor(Math.random() * chars.length)];
            letters[idx].col = colors[Math.floor(Math.random() * colors.length)];
        }
    }

    (function tick(t) { requestAnimationFrame(tick); if (t - last < 90) return; last = t; update(); draw(); })(0);
    resize(); draw();
    window.addEventListener('resize', () => { resize(); draw(); });

    document.querySelectorAll('.wm-card').forEach(card => {
        let cx = 0, cy = 0, tx = 0, ty = 0, sx = 0, sy = 0, tsx = 0, tsy = 0, hovered = false, raf;
        const lerp = (a, b, t) => a + (b - a) * t;

        function loop() {
            cx = lerp(cx, tx, 0.08); cy = lerp(cy, ty, 0.08);
            sx = lerp(sx, tsx, 0.1); sy = lerp(sy, tsy, 0.1);
            card.style.transform = `perspective(900px) rotateX(${cy}deg) rotateY(${cx}deg) scale(${hovered ? 1.015 : 1})`;
            card.style.setProperty('--mx', sx + 'px');
            card.style.setProperty('--my', sy + 'px');
            if (hovered || Math.abs(cx - tx) > 0.01 || Math.abs(cy - ty) > 0.01) raf = requestAnimationFrame(loop);
        }

        card.addEventListener('mousemove', e => { const r = card.getBoundingClientRect(); tx = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 6; ty = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -4; tsx = e.clientX - r.left; tsy = e.clientY - r.top; });
        card.addEventListener('mouseenter', () => { hovered = true;  cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); });
        card.addEventListener('mouseleave', () => { hovered = false; tx = 0; ty = 0; raf = requestAnimationFrame(loop); });
    });
})();

// ── Hero — ColorBends WebGL background ───────────────────────────────────────
(function () {
    function init() {
        const canvas = document.getElementById('hero-colorbends');
        if (!canvas) return;

        const MAX_C = 8;
        const frag = `
#define MAX_COLORS 8
uniform vec2 uCanvas; uniform float uTime; uniform float uSpeed; uniform vec2 uRot;
uniform int uColorCount; uniform vec3 uColors[MAX_COLORS]; uniform float uScale;
uniform float uFrequency; uniform float uWarpStrength; uniform vec2 uPointer;
uniform float uMouseInfluence; uniform float uParallax; uniform float uNoise;
varying vec2 vUv;
void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0; p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001); q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56; q += (uPointer - rp) * uMouseInfluence * 0.2;
  vec2 s = q; vec3 sumCol = vec3(0.0);
  for (int i = 0; i < MAX_COLORS; ++i) {
    if (i >= uColorCount) break; s -= 0.01;
    vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
    float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
    float kBelow = clamp(uWarpStrength, 0.0, 1.0); float kMix = pow(kBelow, 0.3);
    float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
    vec2 warped = s + (r - s) * kBelow * gain;
    float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
    float m = mix(m0, m1, kMix); float w = 1.0 - exp(-6.0 / exp(6.0 * m));
    sumCol += uColors[i] * w;
  }
  vec3 col = clamp(sumCol, 0.0, 1.0);
  if (uNoise > 0.0001) { float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898,78.233))) * 43758.5453123); col = clamp(col + (n - 0.5) * uNoise, 0.0, 1.0); }
  gl_FragColor = vec4(col, 1.0);
}`;
        const vert = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }`;

        const hexToVec3 = h => { h = h.replace('#',''); return new THREE.Vector3(parseInt(h.slice(0,2),16)/255, parseInt(h.slice(2,4),16)/255, parseInt(h.slice(4,6),16)/255); };
        const darkColors  = ['#050200','#ff5500','#ff6600','#ff9900','#100800','#000000'];
        const lightColors = ['#f5f0eb','#ffe8d6','#ffd4b0','#ffbf8a','#f0e8e0','#ffffff'];

        const uColors = Array.from({ length: MAX_C }, () => new THREE.Vector3());
        const applyColors = list => list.forEach((c, i) => uColors[i].copy(hexToVec3(c)));
        applyColors(darkColors);

        new MutationObserver(() => applyColors(document.body.classList.contains('light-mode') ? lightColors : darkColors))
            .observe(document.body, { attributes: true, attributeFilter: ['class'] });

        const rad = -20 * Math.PI / 180;
        const scene    = new THREE.Scene();
        const camera   = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
        const uniforms = {
            uCanvas:         { value: new THREE.Vector2(1,1) },
            uTime:           { value: 0 },
            uSpeed:          { value: 0.2 },
            uRot:            { value: new THREE.Vector2(Math.cos(rad), Math.sin(rad)) },
            uColorCount:     { value: darkColors.length },
            uColors:         { value: uColors },
            uScale:          { value: 0.9 },
            uFrequency:      { value: 1.1 },
            uWarpStrength:   { value: 1.2 },
            uPointer:        { value: new THREE.Vector2(0,0) },
            uMouseInfluence: { value: 0 },
            uParallax:       { value: 0.5 },
            uNoise:          { value: 0.03 }
        };
        const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms });
        scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2), mat));

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 1);

        function resize() {
            const w = window.innerWidth, h = window.innerHeight;
            Object.assign(canvas.style, { position:'fixed', top:'0', left:'0', width:`${w}px`, height:`${h}px`, zIndex:'0', pointerEvents:'none' });
            renderer.setSize(w, h, false);
            uniforms.uCanvas.value.set(w, h);
        }
        resize();
        window.addEventListener('resize', resize);

        function updateOpacity() {
            const maxOp = document.body.classList.contains('light-mode') ? 0.35 : 1;
            canvas.style.opacity = Math.max(0, maxOp - (window.scrollY / (window.innerHeight * 0.4)) * maxOp);
        }
        window.addEventListener('scroll', updateOpacity, { passive: true });
        new MutationObserver(updateOpacity).observe(document.body, { attributes: true, attributeFilter: ['class'] });

        const pTarget = new THREE.Vector2(), pCurrent = new THREE.Vector2();
        window.addEventListener('pointermove', e => {
            const r = canvas.parentElement.getBoundingClientRect();
            pTarget.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
        });

        const clock = new THREE.Clock();
        (function tick() {
            requestAnimationFrame(tick);
            uniforms.uTime.value = clock.getElapsedTime();
            pCurrent.lerp(pTarget, 0.06);
            uniforms.uPointer.value.copy(pCurrent);
            renderer.render(scene, camera);
        })();
    }

    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : setTimeout(init, 0);
})();

// ── Hero — gradual blur at bottom ────────────────────────────────────────────
(function () {
    const container = document.getElementById('hero-blur-bottom');
    if (!container) return;
    const bezier = p => p * p * (3 - 2 * p);
    const COUNT = 8, STRENGTH = 2;
    const step = 100 / COUNT;
    for (let i = 1; i <= COUNT; i++) {
        const prog = bezier(i / COUNT);
        const blur = Math.pow(2, prog * 4) * 0.0625 * STRENGTH;
        const p1 = Math.round((step * i - step) * 10) / 10;
        const p2 = Math.round(step * i * 10) / 10;
        const p3 = Math.round((step * i + step) * 10) / 10;
        const p4 = Math.round((step * i + step * 2) * 10) / 10;
        let grad = `transparent ${p1}%, black ${p2}%`;
        if (p3 <= 100) grad += `, black ${p3}%`;
        if (p4 <= 100) grad += `, transparent ${p4}%`;
        const mask = `linear-gradient(to bottom, ${grad})`;
        const blurStr = `blur(${blur.toFixed(3)}rem)`;
        const div = document.createElement('div');
        div.style.cssText = `position:absolute;inset:0;mask-image:${mask};-webkit-mask-image:${mask};backdrop-filter:${blurStr};-webkit-backdrop-filter:${blurStr}`;
        container.appendChild(div);
    }
})();

// ── GooeyNav ─────────────────────────────────────────────────────────────────
(function () {
    const container = document.getElementById('gooeyNav');
    const filterEl  = document.getElementById('gooeyFilter');
    if (!container || !filterEl) return;

    const links = container.querySelectorAll('.gooey-nav-links a');
    let activeLink = links[0], activeIndex = 0;
    const noise    = (n = 1) => n / 2 - Math.random() * n;
    const getXY    = (dist, idx, total) => { const a = ((360 + noise(8)) / total) * idx * (Math.PI / 180); return [dist * Math.cos(a), dist * Math.sin(a)]; };

    function makeParticles(el) {
        const count = 14, time = 600, variance = 300;
        for (let i = 0; i < count; i++) {
            const t = time * 2 + noise(variance * 2);
            const start = getXY(80, count - i, count);
            const end   = getXY(8 + noise(7), count - i, count);
            const scale = 1 + noise(0.2);
            const rot   = noise(10);
            const rotDeg = rot > 0 ? (rot + 5) * 10 : (rot - 5) * 10;
            el.classList.remove('active');
            setTimeout(() => {
                const p = document.createElement('span');
                const pt = document.createElement('span');
                p.className = 'gooey-particle';
                p.style.cssText = `--sx:${start[0]}px;--sy:${start[1]}px;--ex:${end[0]}px;--ey:${end[1]}px;--gp-time:${t}ms;--sc:${scale};--rot:${rotDeg}deg`;
                pt.className = 'gooey-point';
                p.appendChild(pt);
                el.appendChild(p);
                requestAnimationFrame(() => el.classList.add('active'));
                setTimeout(() => { try { el.removeChild(p); } catch {} }, t);
            }, 30);
        }
    }

    function updatePos(el) {
        const cr = container.getBoundingClientRect();
        const pos = el.closest('li').getBoundingClientRect();
        filterEl.style.left   = `${pos.x - cr.x}px`;
        filterEl.style.top    = `${pos.y - cr.y}px`;
        filterEl.style.width  = `${pos.width}px`;
        filterEl.style.height = `${pos.height}px`;
    }

    links.forEach((link, i) => {
        link.addEventListener('mouseenter', () => {
            if (activeIndex === i) return;
            activeLink.classList.remove('active');
            link.classList.add('active');
            activeLink = link; activeIndex = i;
            updatePos(link);
            filterEl.querySelectorAll('.gooey-particle').forEach(p => filterEl.removeChild(p));
            makeParticles(filterEl);
        });
    });

    if (links[0]) { links[0].classList.add('active'); updatePos(links[0]); }

    window.addEventListener('scroll', () => {
        const ids = ['about','skills','projects','experience','contact'];
        let current = '';
        ids.forEach(id => { const el = document.getElementById(id); if (el && window.scrollY >= el.offsetTop - 200) current = id; });
        links.forEach((link, i) => {
            if (link.getAttribute('href').replace('#','') === current && activeIndex !== i) {
                activeLink.classList.remove('active');
                link.classList.add('active');
                activeLink = link; activeIndex = i;
                updatePos(link);
            }
        });
    }, { passive: true });
})();

// ── Mobile detection (real screen width, not fake 1280px viewport) ────────────
(function () {
    function check() { document.body.classList.toggle('is-mobile', window.screen.width <= 768); }
    check();
    window.addEventListener('resize', check);
})();

// ── Horizontal scroll — Projects (CSS sticky + scroll listener) ───────────────
(function () {
    const spacer   = document.getElementById('hscrollSpacer');
    const sticky   = document.getElementById('hscrollSticky');
    const viewport = document.getElementById('hscrollViewport');
    const track    = document.getElementById('hscrollTrack');
    const progress = document.getElementById('hscrollProgress');
    if (!spacer || !sticky || !track) return;

    let totalMove = 0;
    let ticking   = false;
    let currentX  = 0;
    let targetX   = 0;

    function setup() {
        const viewW   = viewport ? viewport.offsetWidth : window.innerWidth;
        // scrollWidth includes the padding on the track, so subtract viewport once
        totalMove     = Math.max(0, track.scrollWidth - viewW);
        // Give the spacer: viewport height + travel distance + small buffer
        spacer.style.height = (window.innerHeight + totalMove + 100) + 'px';
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(render);
            ticking = true;
        }
    }

    function render() {
        ticking = false;
        const rect      = spacer.getBoundingClientRect();
        const scrolled  = -rect.top;                          // how far we've scrolled into the spacer
        const ratio     = Math.max(0, Math.min(1, scrolled / totalMove));
        targetX         = ratio * totalMove;

        // Smooth lerp
        currentX += (targetX - currentX) * 0.12;
        if (Math.abs(targetX - currentX) < 0.5) currentX = targetX;

        track.style.transform = `translateX(${-currentX}px)`;

        if (progress) progress.style.width = (ratio * 100) + '%';

        if (Math.abs(targetX - currentX) > 0.5) {
            requestAnimationFrame(render);
            ticking = true;
        }
    }

    function init() {
        setup();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', () => { setup(); render(); });
    }

    if (document.readyState === 'complete') { init(); }
    else { window.addEventListener('load', init); }
})();
