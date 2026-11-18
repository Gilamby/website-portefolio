import { PROFILE, EXPERIENCE, EDUCATION, SKILL_AREAS, CONTACT, PROJECTS, PROJECT_IMAGES } from "./content.js";
import { FLOWS } from "./engine.js";
// The plain, printable version of the whole portfolio (also the phone / no-WebGL version).
export function quickHTML() {
  const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const c = PROFILE.current;
  return `<button class="qv-close">Close ✕</button>
  <h1>${esc(PROFILE.name)}</h1><p class="lead">${esc(PROFILE.role)} · ${esc(PROFILE.focus)} · ${esc(PROFILE.availability)}</p>
  ${PROFILE.about.map(p => `<p>${esc(p)}</p>`).join("")}
  <div class="btns"><a href="${CONTACT.cv}" target="_blank" rel="noopener">Open my CV</a><a href="mailto:${CONTACT.email}">Email me</a><a href="${CONTACT.linkedin}" target="_blank" rel="noopener">LinkedIn</a><a href="${CONTACT.github}" target="_blank" rel="noopener">GitHub</a></div>
  <h2 id="qv-projects">Projects</h2><div class="grid">${PROJECTS.map(p => `<article class="proj"><img src="${PROJECT_IMAGES[p.id]}" alt="Screenshot of ${esc(p.title)}" loading="lazy"><h3>${esc(p.title)}</h3><div class="meta">${esc(p.year)} · ${esc(p.tag)}</div><p><b>Role:</b> ${esc(p.role)}</p><p>${esc(p.text)}</p>${p.steps ? `<p><b>How it works:</b></p><ol>${p.steps.map(t => `<li>${esc(t)}</li>`).join("")}</ol>` : ""}<p><b>Result:</b> ${esc(p.result)}</p>${(p.url && !p.links.some(([, u]) => u === p.url) ? [["Visit website", p.url]] : []).concat(p.links).map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(n)}</a> `).join("")}</article>`).join("")}</div>
  <h2 id="qv-backend">Under the hood: back-end</h2>${FLOWS.map(f => `<h3>${esc(f.title)} <small>(${esc(f.project)})</small></h3><ol>${f.steps.map(st => `<li>${esc(st[2])}</li>`).join("")}</ol>`).join("")}
  <h2 id="qv-experience">Experience</h2><ul class="tl">${EXPERIENCE.map(e => `<li><span class="yr">${esc(e.when)}</span><b>${esc(e.title)} · ${esc(e.org)}</b><br>${esc(e.text)}</li>`).join("")}</ul>
  <h2 id="qv-education">Education</h2><ul class="tl">${EDUCATION.map(e => `<li><span class="yr">${esc(e.when)}</span><b>${esc(e.title)} · ${esc(e.org)}</b><br>${esc(e.text)}</li>`).join("")}</ul>
  <h2 id="qv-skills">Skills</h2>${SKILL_AREAS.map(a => `<p><b>${esc(a.title)}.</b> ${esc(a.text)}</p><div class="tags">${a.tools.map(x => `<span>${esc(x)}</span>`).join("")}</div>`).join("")}
  <h2 id="qv-why">Why hire me</h2><ul class="tl">${PROFILE.why.map(([t, d]) => `<li><b>${esc(t)}</b> · ${esc(d)}</li>`).join("")}</ul>
  <h2 id="qv-contact">Contact</h2><p>Email: <a href="mailto:${CONTACT.email}">${CONTACT.email}</a><br>School: <a href="mailto:${CONTACT.school}">${CONTACT.school}</a><br>Phone: <a href="tel:${CONTACT.phone.replace(/\s/g, "")}">${CONTACT.phone}</a><br>LinkedIn: <a href="${CONTACT.linkedin}" target="_blank" rel="noopener">${CONTACT.linkedinLabel}</a><br>GitHub: <a href="${CONTACT.github}" target="_blank" rel="noopener">${CONTACT.github.replace("https://", "")}</a><br>Languages: ${esc(PROFILE.languages)}<br>${PROFILE.notes.map(esc).join(" · ")}</p>`;
}
