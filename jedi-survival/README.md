# Jedi Survival

An unofficial Star Wars-inspired browser survival game: three stages, articulated lightsaber combat, automatic powers, and desktop/touch controls. Static HTML, CSS and JavaScript. No build, backend, account, API key, ChatGPT runtime or inference tokens are needed to play.

## Local play

Run `python3 -m http.server 8000` in this directory, then open `http://localhost:8000/`.

- Move: WASD/arrows, or the touch joystick.
- Dash: Space or DASH. Pause: P, Escape or the pause button.
- Attacks are automatic. Collect energy and choose upgrades.
- Survive three minutes and defeat the stage commander.

Screen shake, hit-stop and damage flashes are disabled. Interface transitions respect reduced-motion preferences. Characters and attacks still move.

## GitHub Pages

This directory is self-contained and works at a site root or nested path. All runtime asset paths are relative. No rewrites, environment variables or server routes are required. Keep `index.html`, `style.css`, `game.js` and the complete `assets/` directory together.

In an existing repository published from the root of `main`, placing these files under `jedi-survival/` adds that subpath without changing other projects. GitHub Pages and the contents of a public repository are publicly accessible. This game adds no authentication or tracking. Optional fonts load from Google Fonts, with system-font fallbacks; all artwork is bundled locally.

## Stages and powers

- Desert Trial: open ground, troopers, chargers and rifle patrols.
- Ember Foundry: cycling vents and shield guards. Force push breaks their shields.
- Orbital Hangar: solid cover, ranged squads and strafing drones.

Unlock and upgrade saber mastery, saber throw, Force push, orbiting shards, chain lightning, stasis fields and guardian shields.

## Development

Edit the HTML/CSS/JS directly. These files are both the source and deployment output. With Node.js installed:

- `node --check game.js`
- `node tests/smoke.cjs`
- `node tests/paths.cjs`

Smoke tests use a mocked DOM to check combat, controls, upgrades, stage progression and collision. Optional `tests/render.cjs` uses `@napi-rs/canvas` to write Canvas QA images into `outputs/`. Neither replaces browser/device testing.

See `CREDITS.md` for attribution.
