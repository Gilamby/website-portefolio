// Computers get the candle-lit desk (with its own Classic | 3D map switch).
// Phones and browsers without WebGL get the same portfolio as a plain web page.
import { quickHTML } from "./quick.js";
const hasGL = (() => { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; } })();
const touch = matchMedia("(pointer: coarse)").matches && !matchMedia("(pointer: fine)").matches;
const desk = hasGL && !touch && !/[?&]plain/.test(location.search);

if (desk) import("./main.js");
else {
  const qv = document.getElementById("quickview");
  document.body.classList.add("plain"); qv.hidden = false;
  const nav = [["projects", "Projects"], ["experience", "Experience"], ["skills", "Skills"], ["why", "Why hire me"], ["contact", "Contact"]];
  qv.querySelector(".sheet").innerHTML = `<nav class="classic-nav" aria-label="Sections"><img src="img/logo.webp" alt="" width="40" height="40">${nav.map(([id, t]) => `<a href="#qv-${id}">${t}</a>`).join("")}</nav>` + quickHTML() +
    `<p class="plain-note">${hasGL ? "Open this page on a computer to explore the interactive version: a candle-lit desk with a map of islands, a journal and a pop-up book of my projects." : "Your browser does not support WebGL, so you are seeing the plain version of my portfolio."}</p>`;
}
