// Writes the Quick view HTML and the structured data into index.html from src/content.js,
// so the plain HTML (search engines, no-JS visitors) always matches the 3D site.
const fs = require("fs");
const { quickHTML } = require("../.build/quick.cjs");
const { PROFILE, CONTACT } = require("../.build/content.cjs");
let html = fs.readFileSync("index.html", "utf8");
const a = html.indexOf('<section id="quickview"'), sheet = html.indexOf('<div class="sheet">', a) + '<div class="sheet">'.length;
const end = html.indexOf("</section>", sheet), close = html.lastIndexOf("</div>", end);
html = html.slice(0, sheet) + "\n" + quickHTML() + "\n " + html.slice(close);
const ld = { "@context": "https://schema.org", "@type": "Person", name: PROFILE.name, jobTitle: PROFILE.role, description: PROFILE.about[0], email: "mailto:" + CONTACT.email, sameAs: [CONTACT.linkedin, CONTACT.github], knowsLanguage: ["nl", "en", "it"], alumniOf: { "@type": "EducationalOrganization", name: "Grafisch Lyceum Rotterdam" } };
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/, "");
html = html.replace("</head>", `<script type="application/ld+json">${JSON.stringify(ld)}</script>\n</head>`);
fs.writeFileSync("index.html", html);
console.log("prerendered quick view:", quickHTML().length, "chars");
