// One portfolio, two ways to see it: the 3D desk, or a classic web page.
// A single switch (top right) flips between them; the choice is remembered.
import { quickHTML } from "./quick.js";
const hasGL = (() => { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; } })();
const small = matchMedia("(max-width: 820px), (pointer: coarse) and (max-width: 1180px)").matches;
const can3d = hasGL && !small;
const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
const qv = document.getElementById("quickview"), sheet = qv.querySelector(".sheet");
let loaded = false, mode = null;

function classicPage() {
  const nav = [["projects", "Projects"], ["experience", "Experience"], ["skills", "Skills"], ["why", "Why hire me"], ["contact", "Contact"]];
  return `<nav class="classic-nav" aria-label="Sections"><img src="img/logo.webp" alt="" width="40" height="40">${nav.map(([id, t]) => `<a href="#qv-${id}">${t}</a>`).join("")}</nav>` + quickHTML() +
    (can3d ? "" : `<p class="plain-note">${hasGL ? "Open this page on a computer to explore the interactive 3D version: a candle-lit desk with a map of islands, a journal and a pop-up book of my projects." : "Your browser does not support WebGL, so you are seeing the classic version of my portfolio."}</p>`);
}
function setMode(m, remember = true) {
  if (m === mode) return; mode = m; if (remember) store.set("fc-mode", m);
  document.querySelectorAll("#modeSwitch button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
  if (m === "classic") {
    document.body.classList.add("plain"); qv.hidden = false; sheet.innerHTML = classicPage(); scrollTo(0, 0);
    window.__paused = true;
  } else {
    document.body.classList.remove("plain"); qv.hidden = true; window.__paused = false; scrollTo(0, 0);
    if (!loaded) { loaded = true; import("./main.js"); }
  }
}
// the switch
const sw = document.createElement("div"); sw.id = "modeSwitch"; sw.setAttribute("role", "group"); sw.setAttribute("aria-label", "View");
sw.innerHTML = `<button data-mode="classic" aria-pressed="false">Classic</button><button data-mode="3d" aria-pressed="false">3D</button><span class="knob" aria-hidden="true"></span>`;
if (can3d) document.body.appendChild(sw);
sw.addEventListener("click", e => { e.stopPropagation(); setMode(mode === "3d" ? "classic" : "3d"); });
const forced = /[?&]plain/.test(location.search);
setMode(!can3d || forced ? "classic" : (store.get("fc-mode") === "classic" ? "classic" : "3d"), false);
