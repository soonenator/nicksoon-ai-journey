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

## Latest public projects

- [Nick’s Kitchen](https://soonenator.github.io/nicksoon-ai-journey/kitchen/) — recipe box, filtering, and dinner suggestions.
- [Brunch Menu Shortlist](https://soonenator.github.io/nicksoon-ai-journey/brunch/) — five-restaurant menu comparison.
- [Jedi Survival](https://soonenator.github.io/nicksoon-ai-journey/jedi-survival/) — unofficial, fan-made browser survival prototype.

These projects already live in this public repository. Their collection dates come from their first repository commits; the cards link to the existing apps rather than copying private source material.

## Content and checks

The original 49 entries and 18 project cards are preserved, with three later public projects added for 52 entries and 21 project cards. The collection was reviewed through October 27, 2026. Private transcripts, personal records, and private prototype links are excluded. Product overview images do not grant access to unreleased production files.

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

## Public-project discovery (proposed automation)

GitHub Actions checks daily at 16:23 UTC (08:23 Pacific standard time / 09:23 daylight time), or from **Actions → Discover public projects → Run workflow**. It reads only public metadata from GitHub's unauthenticated user-repositories endpoint, with pagination. It selects repositories owned by `soonenator` that have the explicit **`ai-journey` topic**. Forks, archived/disabled repositories, private repositories, the untagged portfolio itself, and ignored numeric repository IDs are excluded. Add this topic only after reviewing a repository for public portfolio inclusion and confirming AI assistance. Keep the portfolio repository untagged.

Supported discovery is **public GitHub repositories**, including the source of a GitHub Pages app. The generated card links to GitHub source; it does not infer a deployment from a homepage field or copy README text, release assets, screenshots, or code. Generic descriptions avoid importing potentially sensitive metadata. You can curate descriptions and add a verified demo or preview through the existing `data.js` / `artifacts.js` process during review.

**ChatGPT-only creations are not discoverable by this workflow.** It has no access to ChatGPT chats, Library, private projects, unpublished files, or a feed of ChatGPT-hosted sites. Publish reviewed work into an opted-in public GitHub repository to make it discoverable, or manually curate an already-public site and its summary. New apps inside this repository (such as another subdirectory), gists, arbitrary websites, and private-source deployments require manual curation. Nick’s Kitchen, Brunch Menu Shortlist, and Jedi Survival are already included and are not added again.

### Review and deduplication

A discovery run proposes appended cards in `data.js` on a dedicated branch and opens a pull request. It never writes to `main`, merges, approves, or changes existing artifacts. Existing numeric GitHub IDs, normalized source URLs (including artifacts), and normalized legacy titles prevent duplicates. Repository IDs remain stable across renames. Differently named copies of one project still need human duplicate review; matching names are conservatively skipped. Dates are **discovery dates**, not unverified creation/publication dates. The data structures and card design remain the same; month counts, timeline year labels, and collection update captions adapt as the collection grows.

An existing PR for the same batch is left untouched, including reviewer edits. To reject a repository permanently, add its numeric GitHub repository ID to `ignoredRepositoryIds` in `scripts/discover-public-projects.cjs`, merge that configuration change, then close the proposal. Closing alone suppresses the identical batch; it does not permanently ignore individual repositories in later batches. A failed PR creation can be retried: the workflow reuses its existing branch without force-pushing. Review any recovered branch's changes and CI results before merging. Remove stale automation branches manually when no longer needed.

### Enable after applying and reviewing this patch

1. Allow Actions in repository settings and enable **Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests**. The workflow requests only repository contents and pull-request write permissions; it never invokes approval. Organization policy may restrict this setting. No personal token is needed.
2. Add `ai-journey` only to reviewed public project repositories. To make a first safe trial, use a disposable public test repository with no sensitive content and this topic.
3. Run the workflow manually. Inspect the PR's data diff and both validation commands; confirm the test project appears once and the existing three apps remain unchanged. Run again to confirm no second PR for the same batch. Close/reject the test using the ignore procedure above.
4. Merge only after reviewing the public suitability, AI attribution, descriptions, dates, and duplicates. The daily schedule becomes active when this workflow is on the default branch. Scheduled Actions can be delayed or disabled for inactivity; use manual dispatch when needed.

### Local testing

Node 22 is sufficient; there are no npm dependencies:

```sh
node tests/check.cjs
node --test tests/discovery.cjs
node scripts/discover-public-projects.cjs         # network discovery, dry run
node scripts/discover-public-projects.cjs --write # updates local data.js only
node tests/check.cjs
```

Discovery tests cover opt-in/privacy exclusions, stable IDs and repeat runs, existing project aliases, source URLs, pagination, API failures, and preservation of existing entries. `tests/check.cjs` retains the original 52-entry baseline and exact legacy public-link allowlist, while validating added source cards separately and exercising the expanded collection. The workflow runs both suites before and after generation and before pushing. A separate read-only PR workflow runs both as well. GitHub-token-created PRs may need manual workflow approval or dispatch depending on GitHub's event policy; the discovery job's before/after checks do not depend on a second workflow firing. These checks do not replace browser/accessibility review.

To disable discovery, disable **Discover public projects** in Actions. Existing cards remain unchanged. To roll back an accepted addition, revert its PR; ignore its numeric repository ID to prevent rediscovery.

GitHub references: [workflow permissions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository), [GITHUB_TOKEN event behavior](https://docs.github.com/en/actions/concepts/security/github_token), [scheduled events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), and [public repository API](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user).
