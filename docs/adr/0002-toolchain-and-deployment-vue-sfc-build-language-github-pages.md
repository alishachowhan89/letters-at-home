<!-- adr template version: "adr 3.12.0" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs4ai
  plugin: adr@adrs4ai
-->

# Toolchain and deployment: Vue SFC build, language, GitHub Pages

- **Date**: 2026-11-12
- **Iteration**: 5
- **Status**: Implemented

> **Amended by [ADR-0003](0003-everyday-word-answers-and-the-letters-at-home-title.md) (2026-11-12):** the title is now **Letters at Home**, replacing Five Bytes. The repo and URL are still `five-bytes`; whether to rename is ADR-0003's QST-REPO-NAME.
- **Deciders**: Alisha Chowhan (human), Lexeme 5.5 (Claude Opus 5.5)

**TL;DR**: Scoped CSS means compiled Vue single-file components, so a build step is required. That leaves one open choice that affects every file, JavaScript or TypeScript, plus a deferred question about the product's public name to settle before the first deploy.

---

## Originating Context

**Source**: Human brief, in the first session (2026-11-12). The full quote is in [ADR-0001](0001-game-rules-valid-guesses-and-puzzle-cadence.md#originating-context). The parts this ADR covers: *"hosted free on GitHub Pages, built with Vue using scoped CSS so styles stay component-local."*

**Agency Grant**: "Explore options". Vue, scoped CSS and GitHub Pages are **given**, not open for debate here.

---

## Explicitation

**What I understand**:

1. **Scoped CSS requires a build step.** `<style scoped>` is a feature of Vue's single-file-component (SFC) compiler. Loading Vue from a CDN in a plain HTML page can't do it. So the "no build, just upload index.html" route is out, and the brief has implicitly chosen a bundler.
2. **The language choice touches every file, so it comes first.** Switching from JavaScript to TypeScript after a few components exist means touching all of them (QST-STACK).
3. **The Pages URL contains the repo name**, so the name matters before the first deploy (QST-PRODUCT-NAME, deferred below).

**Assumptions** (defaults I'll use unless overridden; none seemed worth a question):

- **Scaffold**: `npm create vue@latest` (the official Vue project generator): Vue 3, Vite, `<script setup>` syntax.
- **Tests**: Vitest (built for Vite projects). `npm test` and `npm run build` get added to `just gate`'s project slot (see CLAUDE.md, Fifth Directive).
- **No router, no state library.** It's one screen with one game state, so a composable (a reusable Vue function) is enough. Stats are saved in `localStorage`.
- **Deploy**: GitHub's official Pages workflow on GitHub Actions (build, then deploy-pages) on every push to `main`, not a hand-pushed `gh-pages` branch. Vite's `base` is set to `/<repo-name>/` because this is a project site.
- **Scoped CSS, with one exception**: shared theme values such as the tile colors are CSS custom properties defined once on `:root` in a single small global stylesheet, along with a minimal reset. Every component reads them from its scoped styles. Without this, Tile and Keyboard would each keep their own copy of "the correct-green". I think this matches what you meant by "component-local" (no component styles leaking out), not "zero global CSS". Tell me if you meant it strictly.

**Confirm**: Alisha, especially the scoped-CSS exception above.

---

## Questions

### QST-STACK: JavaScript or TypeScript for the Vue single-file components?
- Status: answered
- Why asking: Scoped CSS needs Vue's SFC compiler, so we're on Vite with `.vue` files whatever happens. What's left is the script language in every component and module. Switching later means editing every file. TypeScript also adds a type-check (`vue-tsc`) to the verification gate. The game's core logic is small but full of edge cases: three feedback states, repeated letters, game won or lost.
- Need: pick a letter (or override; an answer in any shape is complete)

Options:
- **A — Vite + Vue 3, JavaScript**: Official scaffold, no TypeScript. Fewer concepts and less setup, and errors only show up at runtime or in tests. The gate is Vitest plus build.
- **B — Vite + Vue 3, TypeScript**: Same scaffold with TypeScript on. Feedback states become a type like `'correct' | 'present' | 'absent'`, and mistakes such as a typo'd state or a missing case fail the build instead of showing up as a wrong-colored tile. The gate is Vitest plus a type-check and build. Costs a bit of extra syntax in every file.
- **C — No build, Vue from a CDN**: A single `index.html` using Vue's in-browser build. No tooling at all, but it can't do `<style scoped>`, so it contradicts the brief. Listed only to make clear the brief already rules it out.

**Recommendation**: (by Lexeme 5.5, Claude Opus 5.5, 2026-11-12)

**B — Vite + Vue 3, TypeScript.** *Rationale*: This project's bugs will mostly be logic bugs in a small state machine: feedback states, the repeated-letter rule from ADR-0001, and game-over conditions. A type for the three states catches the "forgot a case" class of bug when you build, and the official scaffold makes TypeScript nearly free to set up. C is out because of scoped CSS. A is a fine choice; this is a matter of degree. *Confidence*: 0.6 — because the technical case for B is solid, but the right answer depends on something I don't know: how familiar you are with TypeScript and how much new material you want this project to involve. *If wrong*: if you haven't written TypeScript before and would rather spend your learning on Vue itself, choose **A**. The repeated-letter tests still give strong protection, and adding TypeScript before many components exist is cheap.

**ANS:** (by Alisha Chowhan)
B — Vite + Vue 3, TypeScript. Rationale: This project's bugs will mostly be logic bugs in a small state machine: feedback states, the repeated-letter rule from ADR-0001, and game-over conditions. A type for the three states catches the "forgot a case" class of bug when you build, and the official scaffold makes TypeScript nearly free to set up. C is out because of scoped CSS. A is a fine choice; this is a matter of degree. Confidence: 0.6 — because the technical case for B is solid, but the right answer depends on something I don't know: how familiar you are with TypeScript and how much new material you want this project to involve. If wrong: if you haven't written TypeScript before and would rather spend your learning on Vue itself, choose A. The repeated-letter tests still give strong protection, and adding TypeScript before many components exist is cheap.

---

## Decision

### Context
Vue, scoped CSS and GitHub Pages were given in the brief. QST-STACK (answered B) and QST-PRODUCT-NAME (answered B) were settled by Alisha on 2026-11-12, accepting the recommendations.

### Chosen
- **Stack — B**: Vite + Vue 3 + TypeScript, scaffolded with `create-vue` 3.24.0 (`--ts --vitest`). The gate now includes Vitest, `vue-tsc` and `vite build`.
- **Name — B**: an original name, with the repo renamed before the first deploy. The name was then chosen in QST-GAME-NAME: **C, Five Bytes**. The repo will be `five-bytes`, so the site will be at `https://alishachowhan89.github.io/five-bytes/`.

**Trade-offs accepted**: TypeScript syntax in every file. Deploy is held back until the rename.

### Consequences
- **The app lives in `app/`, not the repo root.** I chose this while implementing: the scaffolder's `README.md`, `.gitignore` and `.vscode/` would have collided with the template's, and the subfolder keeps the game separate from the records. CI and the gate both run with `app/` as their working directory.
- **Base path comes from the repo name.** `vite.config.ts` reads `BASE_PATH`, and the workflow sets it to `/${{ github.event.repository.name }}/`. Renaming the repo therefore needs no code change, so B's "more work later" cost mostly disappears. Verified: a build with `BASE_PATH=/some-repo/` prefixes every asset and the favicon.
- **The workflow (`.github/workflows/pages.yml`) tests and builds on every push. Its deploy job runs only when `github.event.repository.name == 'five-bytes'`** (changed in iteration 3; it used to be manual-only). The "rename before the first deploy" ruling is now built into the workflow: under the old name nothing can be published, and after the rename the next push deploys with no further edits.
- **The repo is public** (checked with `gh repo view`), so Pages is free. That resolves the open item below.
- **Toolchain friction on this machine.** Node 22.14 is older than the scaffold needs (22.18+). npm 11.3.0 crashes while installing (`Cannot read properties of null (reading 'edgesOut')`, in arborist's peer-dependency code), so the install was done with npm 12.2.2 through npx. jsdom 30 won't load on Node 22.14, so tests run in the `node` environment. Details are in `docs/TECHNICAL-DEBT.md`. CI uses Node 24.
- **Scoped CSS as planned**: one global `app/src/assets/tokens.css` (custom properties and a reset only); everything else is `<style scoped>`.

---

## Open Follow-ups

### QST-PRODUCT-NAME: What is the game publicly called, and does the repo name change before the first deploy?
- Status: answered
- Why asking: The site will live at `https://<your-username>.github.io/<repo-name>/`, so the repo name is part of the public URL, and Vite's `base` path is set from it. The repo is currently `wordle-with-records`. "Wordle" is a trademark (owned by The New York Times), and the game should have its own identity anyway: its own name and look, not a copy of Wordle's. The risk for a free personal project is small but real, and it's cheapest to rename before anything is public, because afterwards the URL and `base` both change.
- Need: pick a letter, and give a name if B or C (or override; an answer in any shape is complete)

Options:
- **A — Keep "wordle-with-records"**: No rename; the page title says something like "Wordle with CS words". Zero effort, but it keeps a trademarked name in the public URL and title.
- **B — Original name, rename the repo**: Choose an original title (a CS pun is the obvious kind), rename the GitHub repo to match before the first deploy, and set `base` to the new name. Most coherent; a few minutes of work now, more later.
- **C — Original title, keep the repo name**: The page shows an original title, but the URL still contains `wordle-with-records`. Fine if the repo name is a private joke about the records methodology, but the URL and the title don't match.

**Recommendation**: (by Lexeme 5.5, Claude Opus 5.5, 2026-11-12)

**B — Original name, rename the repo.** *Rationale*: The URL is the most-shared part of a GitHub Pages project. Renaming costs nothing before the first deploy and gets more expensive afterwards. An original name also matches the original visual design we're building anyway (ADR-0001, "The genre, not a copy"). *Confidence*: 0.7 — because the timing argument is solid. How much the trademark matters for a free hobby page is a judgment call, not a legal opinion. *If wrong*: if the repo name is deliberately about the *records* (this project as a methodology exercise more than a public game), keep the repo name and switch to **C**.

**ANS:** (by Alisha Chowhan)
B — Original name, rename the repo. Rationale: The URL is the most-shared part of a GitHub Pages project. Renaming costs nothing before the first deploy and gets more expensive afterwards. An original name also matches the original visual design we're building anyway (ADR-0001, "The genre, not a copy"). Confidence: 0.7 — because the timing argument is solid. How much the trademark matters for a free hobby page is a judgment call, not a legal opinion. If wrong: if the repo name is deliberately about the records (this project as a methodology exercise more than a public game), keep the repo name and switch to C.

---

### QST-GAME-NAME: What's the game's name? (QST-PRODUCT-NAME chose "original name + rename"; this picks the name)
- Status: answered
- Why asking: QST-PRODUCT-NAME was answered B: give the game an original name and rename the repo to match before the first deploy. The name itself wasn't given. The name appears in three places: the page title (`app/index.html`), the header (`GAME_TITLE` in `app/src/App.vue`), and the repo name, which becomes the URL `https://alishachowhan89.github.io/<name>/`. A short, lowercase-friendly name works best in that URL. Deploy is held back until this is answered.
- Need: pick a letter, or write your own name (an answer in any shape is complete)

Options:
- **A — Lexer**: A lexer reads text and turns it into tokens, which is roughly what the player does with the letters. Five letters, like the answers. Drawback: on GitHub, a repo called `lexer` looks like a parsing library.
- **B — Bytewise**: A CS pun on "wordwise". Clearly a game name, nothing to confuse it with, but it doesn't hint at word-guessing.
- **C — Five Bytes**: Five letters, five bytes of ASCII. It describes the game, a little long as a URL (`five-bytes`).
- **D — Your own name**: Anything original. Ideally it avoids the "-le" ending, which just points back to Wordle.

**Recommendation**: (by Lexeme 5.5, Claude Opus 5.5, 2026-11-12)

**C — Five Bytes.** *Rationale*: It says what the game is (five letters) in CS terms and can't be confused with a library, unlike A. B is a nice pun, but it says nothing about guessing a five-letter word. *Confidence*: 0.4 — because a name is taste, and the project is yours. My lean is only a starting point, so please pick. *If wrong*: if you want the name to carry the "every answer is a CS term" idea over the five-letter idea, choose **A** or your own (**D**).

**ANS:** (by Alisha Chowhan)
C — Five Bytes. Rationale: It says what the game is (five letters) in CS terms and can't be confused with a library, unlike A. B is a nice pun, but it says nothing about guessing a five-letter word. Confidence: 0.4 — because a name is taste, and the project is yours. My lean is only a starting point, so please pick. If wrong: if you want the name to carry the "every answer is a CS term" idea over the five-letter idea, choose A or your own (D).

---

- [x] Unverified assumption: GitHub Pages is free for **public** repos on a free account. **Verified 2026-11-12**: `alishachowhan89/wordle-with-records` is public.
- [ ] Concern: the `just gate` recipe stops at `instantiate-check`, which exits 2 because there's no `kintsugi.lock`. Until kintsugi is adopted, the gate never reaches the app tests. Fix: install kintsugi and run `kintsugi adopt` (Alisha's call; it's an interactive, file-by-file walkthrough).
- [ ] Future task: upgrade local Node to 24 LTS (or ≥ 22.18). That clears the engine warnings and lets component tests use jsdom.

---

## Action Items

- [x] Scaffold with `npm create vue@latest` (TS + Vitest), extend `just gate` - Owner: Lexeme 5.5
- [x] Add the GitHub Actions Pages workflow (deploy runs only when triggered by hand for now) - Owner: Lexeme 5.5
- [x] Turn on Pages, source GitHub Actions (done via `gh api`, with Alisha's go-ahead) - Owner: Lexeme 5.5
- [x] Answer QST-PRODUCT-NAME (B) - Owner: Alisha Chowhan
- [x] Answer QST-GAME-NAME (C — Five Bytes) - Owner: Alisha Chowhan
- [x] Update `GAME_TITLE` and `<title>`; make the deploy job depend on the repo name - Owner: Lexeme 5.5
- [x] Rename the GitHub repo to `five-bytes`, update the local `origin` URL, push (with Alisha's go-ahead) - Owner: Lexeme 5.5
- [ ] Bump `actions/checkout` and `actions/setup-node` past v4. CI warns that they target the deprecated Node 20 runtime and are being forced onto Node 24 - Owner: Lexeme 5.5

---

## Validation

- [ ] Alisha Chowhan: the scoped-CSS exception (only theme values and a reset are global) matches intent
- [ ] Alisha Chowhan: QST-STACK answered
- [x] Lexeme 5.5: the "scoped CSS needs a build step" reasoning is correct (`<style scoped>` is compiled by `@vue/compiler-sfc`)

**Notes**: —

---

## Iterations

### Iteration 1 (2026-11-12)
- Trigger: initial draft from the human brief (first session)
- Contributors: Lexeme 5.5 (Claude Opus 5.5)
- Changes: Showed the brief already requires a build step. Asked the JS-or-TS question. Deferred the product-name question to the first deploy. Wrote down the scaffold, test, deploy and global-theme-values assumptions.
- Outcome: Draft; waiting on Alisha's answers

### Iteration 2 (2026-11-12)
- Trigger: Alisha answered QST-STACK (B) and QST-PRODUCT-NAME (B), accepting the recommendations
- Contributors: Alisha Chowhan (answers), Lexeme 5.5 (Claude Opus 5.5; implementation, this entry)
- Changes: Scaffolded `app/` and wrote the Decision section. Recorded the `app/` subfolder and base-path-from-repo-name choices, and the local Node/npm/jsdom problems. Added the Pages workflow with deploy held back. Added QST-GAME-NAME because answer B asked for a name but didn't give one. Marked repo visibility as verified.
- Outcome: Draft → Partially Implemented (deploy waits on QST-GAME-NAME and the repo rename)

### Iteration 3 (2026-11-12)
- Trigger: Alisha answered QST-GAME-NAME (C — Five Bytes)
- Contributors: Alisha Chowhan (answer), Lexeme 5.5 (Claude Opus 5.5; implementation, this entry)
- Changes: Renamed the game to Five Bytes in the title, header and storage-key prefix (`five-bytes:daily:<day>`; nothing had been saved under the old prefix, since nothing was deployed). The deploy job now depends on the repo name instead of being manual-only.
- Outcome: still Partially Implemented. What's left is the repo rename, enabling Pages and pushing, all of which change things on GitHub.

### Iteration 4 (2026-11-12)
- Trigger: Alisha chose "you do all three now" (rename, Pages, push)
- Contributors: Alisha Chowhan (go-ahead), Lexeme 5.5 (Claude Opus 5.5)
- Changes: Renamed the repo to `alishachowhan89/five-bytes` (`gh repo rename`, which also updated `origin`). Enabled Pages with `build_type=workflow`. Pushed 9 commits. Workflow run 43319393232: build (tests, type-check, build) and deploy both passed. Verified live: https://alishachowhan89.github.io/five-bytes/ returns 200 with `<title>Five Bytes</title>`, and both assets under `/five-bytes/assets/` return 200, which confirms the base path came from the repo name.
- Outcome: Partially Implemented → Implemented

### Iteration 5 (2026-11-12)
- Trigger: Alisha asked to retitle the game "Wordle at Home"
- Contributors: Alisha Chowhan (request, choice), Lexeme 5.5 (Claude Opus 5.5)
- Changes: Declined the Wordle name (see ADR-0003); Alisha chose Letters at Home. Added the amendment banner at the top. Title and description updated in `app/index.html` and `App.vue`.
- Outcome: still Implemented

---

## Links

- Related ADRs: [ADR-0001](0001-game-rules-valid-guesses-and-puzzle-cadence.md) (game rules)
- Amended by: [ADR-0003](0003-everyday-word-answers-and-the-letters-at-home-title.md) (title: Letters at Home)
