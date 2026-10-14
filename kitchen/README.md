# Nick’s Kitchen

A mobile-first static recipe box. Served from the `kitchen/` folder of the existing GitHub Pages repository without changing the original showcase.

## Contents

- 45 saved recipe posts, 2 cooked adaptations, 2 recently cooked staples.
- Original Instagram videos and recipe captions; no copied creator media or full recipes.
- Search, ingredient/tool/total-time filters, deterministic matching, side pairing, and a dinner picker.
- Likes, a try-next queue, and cooked marks are stored only in this browser. No account or sync.
- Public cooking notes contain recipe-specific adjustments approved for publication.

## Run

Serve this directory with any static web server, for example `python -m http.server 8000`. Open the resulting local HTTP address. There is no install or build step. All runtime assets are local, with no third-party fonts, analytics or API calls. The only external navigation is when the visitor chooses an original source link.

## Data and honesty

`recipes.js` is the public dataset. Imported source records are saved inspiration, not confirmed likes. Four clearly labeled entries were cooked before. Hearts start empty. Timings prefixed with ~ are planning estimates; uncertain marination, resting and cooking totals are omitted. An estimate is not a guaranteed preparation time. Source headlines are labeled where used. Ingredient/tool tags are not complete shopping or equipment lists. Check source quantities, allergens and cooking instructions before cooking. Artwork is original decorative illustration, not a photo of any specific recipe.

The kitchen section distinguishes confirmed recurring ingredients and used tools from occurrence counts across the saved collection. The site has no live pantry inventory and no claim to measure real cooking frequency.

## Tests

`node tests/test-engine.cjs` exercises filtering, deterministic ranking, metadata and source URLs. `node tests/browser.cjs` is an additional Playwright smoke test for an environment with Chromium and loopback access; set `TEST_URL` for a hosted URL. Local browser tests were initially blocked by the execution sandbox; see the delivery report for actual verification status.

## Recommendation rules

Filtering precedes ranking. Matching boosts familiar meal categories, cooking tools and shared tags with liked dishes. Similar mode uses ingredient/category overlap. Pairing mode uses complementary main/side roles. The dinner picker cycles through ranked main dishes and excludes drinks, desserts, snacks and incomplete records. Everything runs deterministically on the device.

## Hosting

Relative asset paths work at any GitHub Pages subdirectory. Existing showcase files are untouched. Only this folder is added.
