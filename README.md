# Fabian Corsalini · Portfolio

An interactive portfolio set on a candle-lit desk, built with three.js.
An intro film leads to a map. Each place on the map opens a different
section: My Story (a journal), About Me (a trunk), Projects (a pop-up book),
Why Hire Me (a treasure chest) and Contact (a sealed letter).

Phones, and browsers without WebGL, get a plain, fully readable version
of the same content.

## Update the content

Every text, project, link and contact detail lives in **`src/content.js`**.
To add a new job or project, edit that file and rebuild:

```sh
npm install      # once
npm run build    # bundles app.js and refreshes the plain HTML in index.html
npm start        # http://localhost:8300
```

Project screenshots go in `img/` (case-study images in `img/cs/`).

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | Page shell, styles, side bar, plain/quick-view version |
| `404.html` | "Uncharted territory" page with the sailing ship |
| `src/main.js` | Scene, desk, lighting, intro, map, navigation |
| `src/map.js` | The hand-drawn, animated map |
| `src/story.js` · `about.js` · `popup.js` · `why.js` · `letter.js` | The five sections |
| `src/quick.js` | Plain HTML version of the whole portfolio |
| `src/content.js` | All content |
| `app.js` | Built bundle (committed, so the site can be hosted as static files) |

## Hosting

The site is static: GitHub Pages works as-is (Settings → Pages → deploy from
the `main` branch, root folder). `404.html` is picked up automatically.
