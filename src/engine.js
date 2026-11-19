// ======================================================================
//  THE ENGINE ROOM: below the map, every machine is a back-end skill.
//  Pull a lever and it runs (a simulation in the browser); turn it around for the code.
// ======================================================================

export const MACHINES = [
  {
    id: "api", name: "The request tube", skill: "APIs", icon: "tube",
    say: "I build the APIs that apps and websites talk through: routes, validation, status codes and clean JSON.",
    lever: "Send request",
    options: [["GET /api/codes/42", 200, `{\n  "id": 42,\n  "slug": "8fK2aQ",\n  "destination": "https://example.com/menu",\n  "scans": 1284,\n  "active": true\n}`],
              ["POST /api/codes  { }", 422, `{\n  "errors": [\n    { "field": "destination", "message": "Required" }\n  ]\n}`],
              ["GET /api/codes/999", 404, `{\n  "error": "Code not found"\n}`]],
    code: `app.get("/api/codes/:id", auth, async (req, res) => {
  const code = await Codes.findOne({ id: req.params.id, ownerId: req.user.id });
  if (!code) return res.status(404).json({ error: "Code not found" });
  res.json(code);
});`
  },
  {
    id: "db", name: "The archive", skill: "Databases", icon: "archive",
    say: "I design tables, write the queries and keep the data fast to search, even with thousands of rows.",
    lever: "Run query",
    options: [["Scans per day", "SELECT DATE(at) AS day, COUNT(*) AS scans\nFROM scans GROUP BY day\nORDER BY day DESC LIMIT 3;", [["day", "scans"], ["18 Nov", "212"], ["17 Nov", "187"], ["16 Nov", "240"]]],
              ["Top codes", "SELECT c.slug, COUNT(s.id) AS scans\nFROM codes c JOIN scans s ON s.code_id = c.id\nGROUP BY c.id ORDER BY scans DESC LIMIT 3;", [["slug", "scans"], ["menu-01", "1284"], ["wifi", "903"], ["promo", "455"]]],
              ["New users", "SELECT COUNT(*) AS new_users\nFROM users\nWHERE created_at > NOW() - INTERVAL 7 DAY;", [["new_users"], ["38"]]]],
    code: `CREATE TABLE scans (
  id       BIGINT PRIMARY KEY AUTO_INCREMENT,
  code_id  INT NOT NULL REFERENCES codes(id),
  at       DATETIME NOT NULL,
  device   VARCHAR(40),
  INDEX (code_id, at)        -- fast stats per code
);`
  },
  {
    id: "pay", name: "The safe", skill: "Payments", icon: "safe",
    say: "I connect Stripe for one-off payments and subscriptions, and only trust payment messages that are verified.",
    lever: "Pay €9",
    steps: ["Checkout opened at Stripe", "Card paid, never touching my server", "Webhook received", "Signature verified", "Plan upgraded to Pro"],
    code: `const event = stripe.webhooks.constructEvent(
  req.body, req.headers["stripe-signature"], WEBHOOK_SECRET
);  // throws when the message is not really from Stripe
if (event.type === "checkout.session.completed") {
  await Subscriptions.activate(event.data.object.metadata.userId);
}`
  },
  {
    id: "lock", name: "The lock", skill: "Accounts & security", icon: "lock",
    say: "Logins, sessions and roles. Passwords are only ever stored as a hash, never as plain text.",
    lever: "Hash it",
    code: `// on sign-up: store only the hash
const hash = await bcrypt.hash(password, 12);
await Users.create({ email, passwordHash: hash });

// on login: compare, never decrypt
const ok = await bcrypt.compare(password, user.passwordHash);`
  },
  {
    id: "mail", name: "The mail chute", skill: "Automation", icon: "mail",
    say: "Things that happen by themselves: emails, confirmations and background jobs, so nobody has to do it by hand.",
    lever: "Submit a form",
    code: `-- PL/SQL: after a form is saved, both sides get an email
APEX_MAIL.SEND(p_to => l_team,   p_from => l_noreply,
               p_subj => 'New submission', p_body => l_body);
APEX_MAIL.SEND(p_to => :P10_EMAIL, p_from => l_noreply,
               p_subj => 'Thanks, we got it!', p_body => l_thanks);
APEX_MAIL.PUSH_QUEUE;`
  },
  {
    id: "cms", name: "The translator", skill: "CMS & languages", icon: "globe",
    say: "Content that non-developers can edit in a CMS, served in five languages with a fallback when a text is missing.",
    lever: null,
    langs: [["EN", "Smart QR codes for your business"], ["ES", "Códigos QR inteligentes para tu negocio"], ["NL", "Slimme QR-codes voor je bedrijf"], ["FR", "Des QR codes intelligents pour votre entreprise"], ["DE", "Smarte QR-Codes für dein Unternehmen"]],
    code: `const { docs } = await payload.find({
  collection: "pages",
  where: { slug: { equals: "home" } },
  locale: lang,            // en, es, nl, fr or de
  fallbackLocale: "en",
});`
  }
];

const TOOLBOX = ["Node.js", "TypeScript", "REST APIs", "SQL", "Stripe", "Payload CMS", "Oracle APEX", "PL/SQL", "Auth & sessions"];

const ICONS = {
  tube: `<path d="M8 40V18a10 10 0 0 1 10-10h12a10 10 0 0 1 10 10v22"/><path d="M4 40h12M32 40h12"/><circle cx="24" cy="20" r="4" class="fill"/>`,
  archive: `<rect x="8" y="6" width="32" height="36" rx="3"/><path d="M8 18h32M8 30h32M20 12h8M20 24h8M20 36h8"/>`,
  safe: `<rect x="6" y="8" width="36" height="32" rx="4"/><circle cx="24" cy="24" r="8"/><path d="M24 16v4M24 28v4M16 24h4M28 24h4"/><path d="M10 40v4M38 40v4"/>`,
  lock: `<rect x="10" y="22" width="28" height="20" rx="4"/><path d="M16 22v-6a8 8 0 0 1 16 0v6"/><circle cx="24" cy="31" r="3" class="fill"/>`,
  mail: `<path d="M8 6h32v12H8z"/><path d="M14 18l-4 24h28l-4-24"/><path d="M16 30l8 5 8-5"/>`,
  globe: `<circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c-6 6-6 28 0 34M24 7c6 6 6 28 0 34"/>`
};

const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
function hl(code) {
  return esc(code).split("\n").map(line => {
    const ci = line.search(/(\/\/ |-- )/); let body = ci >= 0 ? line.slice(0, ci) : line; const com = ci >= 0 ? line.slice(ci) : "";
    body = body.replace(/("|'|`)(?:(?!\1).)*\1/g, m => `<i class="s">${m}</i>`)
      .replace(/\b(const|let|await|async|return|if|else|new|CREATE TABLE|PRIMARY KEY|NOT NULL|REFERENCES|INDEX|SELECT|FROM|WHERE|JOIN|ON|GROUP BY|ORDER BY|LIMIT|DESC|AS)\b/g, '<i class="k">$1</i>');
    return body + (com ? `<i class="c">${com}</i>` : "");
  }).join("\n");
}
const wait = ms => new Promise(r => setTimeout(r, ms));

export function buildEngine({ reduced }) {
  const el = document.createElement("section"); el.id = "engine"; el.hidden = true;
  el.innerHTML = `
    <div class="en-in" role="dialog" aria-modal="true" aria-labelledby="en-title">
      <button class="en-close" aria-label="Back up to the map">×</button>
      <header><h2 id="en-title">The engine room</h2>
        <p class="lead">Welcome below the map. Up there you see the front-end; down here is everything that makes it work. Every machine in this room is something I build. Pull a lever to see it run, or turn a machine around to read its code.</p></header>
      <div class="machines">${MACHINES.map(m => `
        <article class="mc" data-m="${m.id}">
          <div class="face">
            <div class="mh"><svg viewBox="0 0 48 48" aria-hidden="true">${ICONS[m.icon]}</svg><div><h3>${m.name}</h3><p class="sk">${m.skill}</p></div></div>
            <p class="say">${m.say}</p>
            ${m.options ? `<div class="opts" role="group">${m.options.map((o, i) => `<button data-o="${i}" aria-pressed="${i === 0}">${esc(o[0])}</button>`).join("")}</div>` : ""}
            ${m.langs ? `<div class="opts" role="group">${m.langs.map((l, i) => `<button data-l="${i}" aria-pressed="${i === 0}">${l[0]}</button>`).join("")}</div>` : ""}
            ${m.id === "lock" ? `<label class="pw">Password <input type="text" value="correct horse battery" spellcheck="false" autocomplete="off"></label>` : ""}
            <div class="screen" aria-live="polite"></div>
            <div class="mf">${m.lever ? `<button class="lever">${m.lever}</button>` : "<span></span>"}<button class="flip">See the code</button></div>
          </div>
          <div class="back" hidden><pre><code>${hl(m.code)}</code></pre><button class="flip">Back to the machine</button></div>
        </article>`).join("")}</div>
      <p class="fine">The machines run a small simulation in your browser. The code shows how I build the real thing.</p>
      <div class="tools"><h4>My back-end toolbox</h4><p class="chips">${TOOLBOX.map(t => `<span>${t}</span>`).join("")}</p></div>
    </div>`;
  document.body.appendChild(el);

  const M = id => MACHINES.find(m => m.id === id);
  const state = {};
  const scr = card => card.querySelector(".screen");

  // what each machine shows when it is idle
  function idle(card) {
    const m = M(card.dataset.m), s = scr(card);
    if (m.id === "api") s.innerHTML = `<span class="dim">Pick a request and send it.</span>`;
    if (m.id === "db") s.innerHTML = `<pre class="sql">${hl(m.options[state.db || 0][1])}</pre>`;
    if (m.id === "pay") s.innerHTML = m.steps.map(t => `<span class="st">${t}</span>`).join("");
    if (m.id === "lock") s.innerHTML = `<span class="dim">Stored in the database as:</span><span class="hash">?</span>`;
    if (m.id === "mail") s.innerHTML = `<div class="chute"><span class="dim">A form is waiting to be sent.</span></div>`;
    if (m.id === "cms") lang(card, state.cms || 0, true);
  }
  function lang(card, i, instant) {
    const m = M("cms"), s = scr(card); state.cms = i;
    card.querySelectorAll("[data-l]").forEach((b, j) => b.setAttribute("aria-pressed", String(i === j)));
    s.innerHTML = `<span class="dim">GET /api/pages/home?locale=${m.langs[i][0].toLowerCase()}</span><b class="title ${instant ? "" : "in"}">${m.langs[i][1]}</b>`;
  }
  async function run(card) {
    if (card.classList.contains("run")) return; card.classList.add("run");
    const m = M(card.dataset.m), s = scr(card), lag = reduced ? 0 : 1;
    try {
      if (m.id === "api") {
        const [req, code, body] = m.options[state.api || 0];
        s.innerHTML = `<span class="req">→ ${esc(req)}</span>`; await wait(450 * lag);
        const ms = 12 + Math.round(Math.random() * 30);
        s.innerHTML += `<span class="res c${String(code)[0]}">← ${code} ${{ 200: "OK", 404: "Not Found", 422: "Unprocessable Entity" }[code]}  ${ms} ms</span><pre class="json">${esc(body)}</pre>`;
      }
      if (m.id === "db") {
        const [, sql, rows] = m.options[state.db || 0];
        s.innerHTML = `<pre class="sql">${hl(sql)}</pre><table></table>`; const tb = s.querySelector("table");
        await wait(350 * lag);
        tb.innerHTML = `<tr>${rows[0].map(h => `<th>${h}</th>`).join("")}</tr>`;
        for (const r of rows.slice(1)) { await wait(180 * lag); tb.insertAdjacentHTML("beforeend", `<tr class="in">${r.map(c => `<td>${c}</td>`).join("")}</tr>`); }
      }
      if (m.id === "pay") {
        idle(card); const st = s.querySelectorAll(".st");
        for (const x of st) { await wait(520 * lag); x.classList.add("ok"); }
        s.insertAdjacentHTML("beforeend", `<span class="done">Pro unlocked</span>`);
      }
      if (m.id === "lock") {
        const pw = card.querySelector("input").value; const data = new TextEncoder().encode("salt:fc:" + pw);
        const buf = await crypto.subtle.digest("SHA-256", data); const hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
        idle(card); const h = s.querySelector(".hash"); h.textContent = "";
        for (let i = 0; i < hex.length; i += 4) { h.textContent += hex.slice(i, i + 4); if (lag) await wait(18); }
        s.insertAdjacentHTML("beforeend", `<span class="dim small">A real SHA-256 of your text with a salt, made just now. Change one letter and the whole hash changes; the password itself is never saved.</span>`);
      }
      if (m.id === "mail") {
        const ch = s.querySelector(".chute") || (idle(card), s.querySelector(".chute")); ch.innerHTML = `<span class="req">→ INSERT INTO submissions  1 row</span>`;
        await wait(400 * lag);
        ch.insertAdjacentHTML("beforeend", `<span class="env">✉ To the team: New submission</span>`); await wait(450 * lag);
        ch.insertAdjacentHTML("beforeend", `<span class="env">✉ To you: Thanks, we got it!</span>`); await wait(350 * lag);
        ch.insertAdjacentHTML("beforeend", `<span class="done">2 emails sent automatically</span>`);
      }
    } finally { setTimeout(() => card.classList.remove("run"), 300); }
  }

  el.addEventListener("click", e => {
    if (e.target === el || e.target.closest(".en-close")) { close(); return; }
    const card = e.target.closest(".mc"); if (!card) return;
    if (e.target.closest(".flip")) { const f = card.querySelector(".face"), b = card.querySelector(".back"), toBack = !f.hidden; card.classList.add("turn"); setTimeout(() => { f.hidden = toBack; b.hidden = !toBack; card.classList.remove("turn"); }, reduced ? 0 : 180); return; }
    const o = e.target.closest("[data-o]"); if (o) { state[card.dataset.m] = +o.dataset.o; card.querySelectorAll("[data-o]").forEach(b => b.setAttribute("aria-pressed", String(b === o))); idle(card); return; }
    const l = e.target.closest("[data-l]"); if (l) { lang(card, +l.dataset.l); return; }
    if (e.target.closest(".lever")) run(card);
  });
  el.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.matches(".pw input")) run(e.target.closest(".mc")); });

  let onClose = null;
  function open(id, cb) {
    onClose = cb || null; el.querySelectorAll(".mc").forEach(c => { c.querySelector(".face").hidden = false; c.querySelector(".back").hidden = true; idle(c); });
    el.hidden = false; requestAnimationFrame(() => el.classList.add("on")); el.querySelector(".en-close").focus({ preventScroll: true });
    if (id) { const c = el.querySelector(`.mc[data-m="${id}"]`); if (c) { c.classList.add("spot"); setTimeout(() => c.classList.remove("spot"), 1800); } }
  }
  function close() { el.classList.remove("on"); setTimeout(() => { el.hidden = true; }, 400); if (onClose) onClose(); }
  return { open, close, get isOpen() { return !el.hidden; } };
}
