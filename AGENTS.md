# AGENTS.md — git-avanzado

## Project Structure

**p5.js + Hand Pose Detection** — Interactive game using hand pose recognition for player control.

- `index.html` — Entry point; loads p5.js from CDN and all JS modules
- `sketch.js` — p5.js main sketch (setup/draw functions)
- `js/gamelogic.js` — Game mechanics and state
- `js/handpose.js` — Hand pose detection & input handling
- `js/ui.js` — UI rendering and player feedback
- `style.css` — Base styles (includes CSS reset)

## Load Order Matters

Scripts in `index.html` are loaded in a specific order:
1. p5.js (CDN) — must be first
2. `gamelogic.js` — game state/rules
3. `handpose.js` — pose detection setup
4. `ui.js` — rendering helpers
5. `sketch.js` — p5 setup/draw entry points

Do not reorder without verifying function dependencies.

## Development & Testing

**Run locally:**
- Open `index.html` in a browser or use a local HTTP server (e.g., `python -m http.server` or VS Code Live Server)
- p5.js draws to the canvas; hand pose model loads from browser cache or on first run

**Known Issues:**
- `sketch.js` has typos (`createcanvas` should be `createCanvas`; `cindowwith` should be `windowWidth`)
- Empty modules (`gamelogic.js`, `handpose.js`, `ui.js`) — function stubs need implementation

## Browser Environment

- **Targets:** Modern browsers with WebGL support (hand pose model requirement)
- **No build step** — vanilla JS, no bundler or transpiler
- **External deps:** p5.js (v2.3.3 via CDN), Handpose model (TensorFlow.js)
- **No node_modules, no package.json** — single-file scripts only

## Conventions

- Use p5.js drawing functions in `sketch.js` only (`setup()`, `draw()`, `createCanvas()`, etc.)
- Modular functions in `js/*` must not depend on each other's internal state without explicit exports/comments
- CSS reset already applied in `style.css` — safe to add component styles directly

## Gotchas for Agents

1. **Canvas sizing** — `windowWidth`/`windowHeight` are p5 globals, only available after p5 loads
2. **Hand pose async** — TensorFlow.js model loads asynchronously; may not be ready on first frame
3. **No transpiler** — older browser syntax (var/const, arrow functions) must work in oldest target browser
4. **CORS** — if served over HTTPS, hand pose model must load from HTTPS CDN (already configured)
