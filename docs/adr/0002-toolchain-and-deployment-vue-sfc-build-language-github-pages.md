<!-- adr template version: "adr 3.12.0" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs4ai
  plugin: adr@adrs4ai
-->

# Toolchain and deployment: Vue SFC build, language, GitHub Pages

- **Date**: 2026-11-12
- **Iteration**: 1
- **Status**: Draft
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

*Pending: filled in once QST-STACK is answered.*

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

- [ ] Unverified assumption: GitHub Pages is free for **public** repos on a free account. If this repo is private, Pages needs a paid plan. Confirm the repo's visibility before setting up deploy.

---

## Action Items

- [ ] After QST-STACK is answered: scaffold with `npm create vue@latest`, add Vitest, extend `just gate` - Owner: Lexeme 5.5
- [ ] Add the GitHub Actions Pages workflow; turn on Pages (Settings → Pages → Source: GitHub Actions) - Owner: Lexeme 5.5 (workflow), Alisha Chowhan (repo setting)
- [ ] Answer QST-PRODUCT-NAME before the first deploy - Owner: Alisha Chowhan

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

---

## Links

- Related ADRs: [ADR-0001](0001-game-rules-valid-guesses-and-puzzle-cadence.md) (game rules)
