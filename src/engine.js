// ======================================================================
//  UNDER THE HOOD: the back-end of my projects, shown as live schematics.
//  Each flow is a real feature; a glowing request travels the system step by step.
// ======================================================================

export const FLOWS = [
  {
    id: "scan", tab: "QR scan", project: "QR-Codex", title: "What happens when someone scans a code",
    nodes: { phone: ["Phone", "scans the code", 110, 230], server: ["Redirect server", "short link /r/code", 390, 110], db: ["Database", "codes and scans", 680, 110], dest: ["Destination", "menu, site, Wi-Fi, vCard", 390, 350], dash: ["Dashboard", "live statistics", 900, 290] },
    steps: [
      [null, "phone", "A customer scans the printed code. The code holds a short link to our server, not the final page. That is what makes it editable."],
      [["phone", "server"], "server", "The phone opens the short link and the server receives the request with the code's ID."],
      [["server", "db"], "db", "The server looks up where this code points right now and saves the scan: time, device and rough location."],
      [["server", "dest"], "dest", "The visitor is sent on to the current destination, in a fraction of a second."],
      [["db", "dash"], "dash", "The owner's dashboard reads the saved scans and shows them as statistics. Changing the destination later needs no new print."]
    ],
    shows: ["A redirect that is fast for every visitor", "Data saved on every request without slowing it down", "Statistics built from raw scan data"]
  },
  {
    id: "pay", tab: "Subscriptions", project: "QR-Codex", title: "How a customer pays for a subscription",
    nodes: { site: ["Pricing page", "plan chosen", 110, 230], stripe: ["Stripe Checkout", "secure payment", 380, 100], hook: ["Webhook endpoint", "our server", 640, 230], db: ["Database", "subscriptions", 900, 100], app: ["The app", "paid features", 900, 360] },
    steps: [
      [null, "site", "A customer picks a plan on the pricing page of the website."],
      [["site", "stripe"], "stripe", "They pay on Stripe Checkout. Card details go straight to Stripe and never touch our own server."],
      [["stripe", "hook"], "hook", "Stripe calls our webhook to report that the payment succeeded."],
      [["hook", "db"], "db", "The server checks the message's signature, so only real messages from Stripe count, then stores the subscription."],
      [["db", "app"], "app", "The account unlocks the paid features straight away. Renewals and cancellations arrive the same way."]
    ],
    shows: ["Payments without storing card data", "Trusting only verified messages", "Keeping account and subscription in sync"]
  },
  {
    id: "connect", tab: "Website and app", project: "QR-Codex & Flexichat", title: "How the website, the CMS and the app work together",
    nodes: { cms: ["Payload CMS", "texts and prices", 110, 100], visitor: ["Visitor", "on the website", 110, 360], site: ["Website", "five languages", 400, 230], api: ["API", "validates and creates", 680, 230], app: ["The app", "new account", 910, 230] },
    steps: [
      [null, "cms", "Every text and price lives in the CMS, so it can be changed without a developer."],
      [["cms", "site"], "site", "The website loads that content through the CMS, in the visitor's language: one of five."],
      [["visitor", "site"], "site", "A visitor signs up on the website."],
      [["site", "api"], "api", "The website sends the sign-up to the app's API, which checks the data before anything is created."],
      [["api", "app"], "app", "The new customer can log into the app straight away."]
    ],
    shows: ["Content that non-developers can manage", "Two products talking through an API", "One codebase serving five languages"]
  },
  {
    id: "delft", tab: "Idea platform", project: "Municipality of Delft", title: "How a young person's idea reaches the municipality",
    nodes: { form: ["Four-step form", "idea, group, contact", 110, 230], apex: ["Oracle APEX", "validation", 390, 230], db: ["Oracle database", "stored ideas", 650, 230], muni: ["Municipality", "email with the idea", 910, 100], young: ["Young person", "confirmation email", 910, 360] },
    steps: [
      [null, "form", "A young person enters their idea, the target group and contact details in four steps, and checks a summary before sending."],
      [["form", "apex"], "apex", "APEX validates every field before anything is saved."],
      [["apex", "db"], "db", "The idea is stored in the Oracle database."],
      [["db", "muni"], "muni", "A PL/SQL procedure I wrote emails the idea to the municipality."],
      [["db", "young"], "young", "The same procedure sends a confirmation back to the young person."]
    ],
    shows: ["Server-side validation", "Database logic in PL/SQL", "Automatic email for both sides"]
  }
];

const TOOLBOX = ["Node.js", "REST APIs", "Stripe and webhooks", "Payload CMS", "Databases", "User accounts", "Oracle APEX", "PL/SQL"];

export function buildEngine({ reduced }) {
  const el = document.createElement("section"); el.id = "engine"; el.hidden = true; el.setAttribute("aria-label", "Under the hood: back-end");
  el.innerHTML = `
    <div class="en-in" role="dialog" aria-modal="true" aria-labelledby="en-title">
      <button class="en-close" aria-label="Close">×</button>
      <header><h2 id="en-title">Under the hood</h2>
        <p class="lead">Half of what I build is never seen: the server, the database and the connections between systems. These are real features from my projects, shown the way the data travels. Press play, or step through them yourself.</p></header>
      <nav class="en-tabs" role="tablist">${FLOWS.map((f, i) => `<button role="tab" data-i="${i}">${f.tab}<small>${f.project}</small></button>`).join("")}</nav>
      <div class="en-stage">
        <div class="en-diagram"><h3></h3><svg viewBox="0 0 1010 460" role="img"></svg>
          <div class="en-ctrl"><button data-c="prev" aria-label="Previous step">‹</button><button data-c="play" class="play">Play</button><button data-c="next" aria-label="Next step">›</button></div></div>
        <ol class="en-steps"></ol>
      </div>
      <div class="en-foot"><div><h4>What this shows</h4><ul class="en-shows"></ul></div><div><h4>My back-end toolbox</h4><p class="chips">${TOOLBOX.map(t => `<span>${t}</span>`).join("")}</p></div></div>
    </div>`;
  document.body.appendChild(el);
  const svg = el.querySelector("svg"), stepsEl = el.querySelector(".en-steps"), title = el.querySelector(".en-diagram h3"), playB = el.querySelector(".play");
  const NS = "http://www.w3.org/2000/svg";
  let flow = null, step = -1, playing = false, raf = 0, timer = 0, paths = {};

  const edgeD = (a, b) => { const [x1, y1] = [a[2], a[3]], [x2, y2] = [b[2], b[3]], mx = (x1 + x2) / 2; return `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`; };
  function draw(i) {
    flow = FLOWS[i]; paths = {}; svg.innerHTML = ""; title.textContent = flow.title; svg.setAttribute("aria-label", flow.title);
    el.querySelectorAll(".en-tabs button").forEach((b, j) => b.setAttribute("aria-selected", String(i === j)));
    const defs = document.createElementNS(NS, "defs"); defs.innerHTML = `<radialGradient id="en-glow"><stop offset="0" stop-color="#fff3c8"/><stop offset=".35" stop-color="#f0c060"/><stop offset="1" stop-color="#f0c060" stop-opacity="0"/></radialGradient><pattern id="en-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="rgba(199,154,70,.07)"/></pattern>`;
    svg.appendChild(defs);
    const bg = document.createElementNS(NS, "rect"); bg.setAttribute("width", "1010"); bg.setAttribute("height", "460"); bg.setAttribute("fill", "url(#en-grid)"); svg.appendChild(bg);
    flow.steps.forEach(([e]) => { if (!e) return; const k = e.join(">"); if (paths[k]) return; const p = document.createElementNS(NS, "path"); p.setAttribute("d", edgeD(flow.nodes[e[0]], flow.nodes[e[1]])); p.setAttribute("class", "edge"); svg.appendChild(p); paths[k] = p; });
    Object.entries(flow.nodes).forEach(([id, [name, sub, x, y]]) => {
      const g = document.createElementNS(NS, "g"); g.setAttribute("class", "node"); g.dataset.id = id; g.setAttribute("transform", `translate(${x} ${y})`);
      g.innerHTML = `<rect x="-92" y="-38" width="184" height="76" rx="12"/><text class="n" y="-4">${name}</text><text class="s" y="20">${sub}</text>`;
      svg.appendChild(g);
    });
    const dot = document.createElementNS(NS, "circle"); dot.setAttribute("r", "16"); dot.setAttribute("fill", "url(#en-glow)"); dot.setAttribute("class", "packet"); svg.appendChild(dot);
    stepsEl.innerHTML = flow.steps.map(([, , t], j) => `<li><button data-s="${j}">${t}</button></li>`).join("");
    el.querySelector(".en-shows").innerHTML = flow.shows.map(t => `<li>${t}</li>`).join("");
    step = -1; show(0, true);
  }
  function show(j, instant) {
    cancelAnimationFrame(raf); step = j; const [e, node] = flow.steps[j];
    stepsEl.querySelectorAll("li").forEach((li, k) => { li.classList.toggle("on", k === j); li.classList.toggle("done", k < j); });
    svg.querySelectorAll(".node").forEach(n => n.classList.remove("on"));
    svg.querySelectorAll(".edge").forEach(p => p.classList.remove("on"));
    const dot = svg.querySelector(".packet");
    const light = () => { const n = svg.querySelector(`.node[data-id="${node}"]`); if (n) n.classList.add("on"); };
    if (!e || instant || reduced) { const [, , x, y] = flow.nodes[node]; dot.setAttribute("cx", x); dot.setAttribute("cy", y); if (e) paths[e.join(">")].classList.add("on"); light(); return; }
    const p = paths[e.join(">")], L = p.getTotalLength(), t0 = performance.now(), dur = 900; p.classList.add("on");
    const tick = now => { const k = Math.min(1, (now - t0) / dur), q = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, pt = p.getPointAtLength(L * q); dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y); if (k < 1) raf = requestAnimationFrame(tick); else light(); };
    raf = requestAnimationFrame(tick);
  }
  function setPlaying(on) {
    playing = on; playB.textContent = on ? "Pause" : "Play"; clearTimeout(timer);
    if (!on) return;
    const next = () => { if (!playing) return; if (step >= flow.steps.length - 1) { show(0, true); } else show(step + 1); timer = setTimeout(next, 3400); };
    if (step >= flow.steps.length - 1) show(0, true); timer = setTimeout(next, 1200);
  }
  el.addEventListener("click", e => {
    if (e.target === el || e.target.closest(".en-close")) { close(); return; }
    const tab = e.target.closest(".en-tabs button"); if (tab) { setPlaying(false); draw(+tab.dataset.i); setPlaying(!reduced); return; }
    const s = e.target.closest("[data-s]"); if (s) { setPlaying(false); show(+s.dataset.s); return; }
    const c = e.target.closest("[data-c]"); if (!c) return;
    if (c.dataset.c === "play") setPlaying(!playing);
    else { setPlaying(false); show(Math.max(0, Math.min(flow.steps.length - 1, step + (c.dataset.c === "next" ? 1 : -1)))); }
  });
  el.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); close(); } });
  let onClose = null;
  function open(id, cb) { onClose = cb || null; const i = Math.max(0, FLOWS.findIndex(f => f.id === id)); el.hidden = false; requestAnimationFrame(() => el.classList.add("on")); draw(i); setPlaying(!reduced); el.querySelector(".en-close").focus({ preventScroll: true }); }
  function close() { setPlaying(false); cancelAnimationFrame(raf); el.classList.remove("on"); setTimeout(() => { el.hidden = true; }, 400); if (onClose) onClose(); }
  return { open, close, get isOpen() { return !el.hidden; } };
}
