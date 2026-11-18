// Desktop with WebGL gets the desk; phones and browsers without WebGL get the plain portfolio.
import { quickHTML } from "./quick.js";
const hasGL = (() => { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; } })();
const small = matchMedia("(max-width: 820px), (pointer: coarse) and (max-width: 1180px)").matches;
if (!hasGL || small || /[?&]plain/.test(location.search)) {
  document.body.classList.add("plain");
  const qv = document.getElementById("quickview"); qv.hidden = false;
  qv.querySelector(".sheet").innerHTML = quickHTML() + `<p class="plain-note">${hasGL && small ? "Open this page on a computer to explore the interactive version: a candle-lit desk with a map, a journal and a pop-up book of my projects." : "Your browser does not support WebGL, so you are seeing the plain version of my portfolio."}</p>`;
} else import("./main.js");
