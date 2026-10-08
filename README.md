# NickSoon AI Journey

A fully static, Pokémon/Overwatch-inspired showcase of Nick Soon’s 2026 AI-assisted projects and discoveries.

## Run locally

Use any static web server in this directory, for example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. No dependency installation or build step is required.

## GitHub Pages

In repository Settings → Pages, choose **Deploy from a branch**, then **main** and **/ (root)**. The included `.nojekyll` keeps this a plain static site. All asset paths are relative, so the site works under either a repository subpath or a custom domain.

## What runs where

The archive itself uses only local HTML, CSS, JavaScript, and images. It does not call AI APIs, require a ChatGPT account, use ChatGPT hosting/runtime, or consume AI inference tokens while someone browses it. Search, filters, timeline, and project details run entirely in the visitor’s browser. The content security policy blocks network connections from scripts.

The collection preserves these three explicit outgoing links, opened only when a visitor chooses one:

- Pokémon starter partner quiz: https://starter-partner-quiz.sylar0706.chatgpt.site
- State of AI adoption: https://state-of-ai-adoption.sylar0706.chatgpt.site
- Pokémon Centre source repository: https://github.com/soonenator/Pkmncenter

The first two are separate ChatGPT-hosted demos; their hosting and any usage are outside this static archive. Migrating this showcase does not migrate those separate apps.

## Content and verification

The original design, images, all 18 project cards, and 31 other entries are retained from the original showcase source. The collection covers January through October 7, 2026. Private transcripts and private prototype links are not included.

Run the dependency-free logic/static checks:

```sh
node tests/check.cjs
```

## Editing

- `data.js`: collection content and approved public links
- `app.js`: browser-side search, filtering, timeline, and detail dialogs
- `styles.css`: responsive presentation and motion/accessibility rules
- `index.html`: structure and metadata
- `assets/`: bundled companion artwork and favicon

An independent, fan-inspired collection. Not affiliated with Pokémon, Nintendo, Blizzard, Marvel, or their partners.
