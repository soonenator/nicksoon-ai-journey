# NickSoon AI Journey

A static, Pokémon/Overwatch-inspired showcase of Nick Soon’s 2026 AI-assisted projects and discoveries.

## Run locally

Use any static web server in this directory, for example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. No dependency installation or build step is required.

## GitHub Pages

The site is published from `main` at the repository root. The included `.nojekyll` keeps this a plain static site. All bundled asset paths are relative, so the site works under a repository subpath or custom domain.

## See the original work

- **View the work** opens the actual available artwork, app screenshot, file preview, or archived interactive demo.
- Local HTML demos load only when their entry is opened. They run in a sandboxed frame; **Open full screen** gives them more room and enables their ordinary source links. Closing the entry removes the frame.
- Images open at full resolution. Multi-artifact entries have named selection buttons, including the original PorygonGPT animation preview.
- The one-page binder PDF has a full-page image preview plus open and download actions.
- Screenshots of private apps show their visual design without exposing their private runtime or personal saved data.
- **Read the story** means the original artifact has not been added or that the entry is a conversation/draft. It never implies an available demo.

Archive labels identify dates and limited adaptations. The Animal Adventure copy removes the incorrect Arctic penguin; the cooking widget adds a food-thermometer safety note; the park map receives a standalone host-style wrapper. Original work is not replaced with invented mockups.

## What runs where

The archive and bundled demos use local HTML, CSS, JavaScript, and images. They do not call AI APIs, require a ChatGPT account, use ChatGPT hosting/runtime, or consume AI inference tokens while someone browses them. Search, filters, timeline, previews, and local demos run in the visitor’s browser. Content security policies block script network connections. The static archive has no tracking or account system.

These explicit links leave the archive only when chosen:

- Pokémon starter partner quiz: https://starter-partner-quiz.sylar0706.chatgpt.site
- State of AI adoption: https://state-of-ai-adoption.sylar0706.chatgpt.site
- MartialAtlas prototype: https://martial-atlas-fresh.vercel.app/
- MartialAtlas Claude prototype: https://claude-martialarts-test.vercel.app/
- Pokémon Center 3D demo: https://soonenator.github.io/Pkmncenter/
- Pokémon Center public source: https://github.com/soonenator/Pkmncenter

The first two are separate ChatGPT-hosted demos. Their hosting and any usage are outside the archive. The 3D demo requires WebGL 2, which some restricted browsers cannot provide. Links inside historical demos go to their original sources; historical product, game, shopping, and park information should not be treated as current advice.

## Content and checks

All 49 entries and 18 project cards are preserved. The collection covers January through October 7, 2026. Private transcripts, personal records, and private prototype links are excluded. Product overview images do not grant access to unreleased production files.

Run dependency-free logic and static checks:

```sh
node tests/check.cjs
```

These cover collection integrity, filters, dialog markup, public-link allowlists, artifact paths, JavaScript syntax, sandboxing, and privacy-sensitive identifiers. They do not replace visual browser or assistive-technology testing.

## Editing

- `data.js`: collection stories and statuses
- `artifacts.js`: reviewed public artifacts, preview paths, labels, and optional downloads
- `app.js`: search, filtering, timeline, accessible dialogs, and artifact selection
- `styles.css`: responsive layout and reduced-motion rules
- `assets/artifacts/`: original files and labeled archival HTML
- `assets/previews/`: original screenshots and rendered document previews

Artifact records use `kind` (`image`, `html`, `pdf`, or `link`), `title`, `src`, and `caption`. Images need meaningful `alt` text. Use a bundled `preview` image for documents and external sites; local HTML can render directly without one. Set `download: true` only for public files intended for downloading. Never add private account, conversation, or local-computer URLs.

An independent, fan-inspired collection. Not affiliated with Pokémon, Nintendo, Blizzard, Marvel, or their partners.
