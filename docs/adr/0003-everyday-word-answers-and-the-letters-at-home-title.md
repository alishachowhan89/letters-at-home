<!-- adr template version: "adr-madr 3.12.0" -->
<!-- kept in deliberate homage to MADR — Markdown Architectural Decision Records, the lineage this template family descends from. This is the simple-decisions form: use it when a decision needs recording, not discussion. The deliberation-native form is adr.md. Mint with `just adr "<title>" madr`. (Ruling: QST-MADR-FATE, 2026-08-13 — "keeping the template, acknowledging it, is good form.") -->

# Everyday-word answers and the Letters at Home title

* Status: accepted
* Deciders: Alisha Chowhan (human), Lexeme 5.5 (Claude Opus 5.5)
* Date: 2026-11-12

**TL;DR**: Answers are now 593 everyday English words instead of 128 CS terms, and the game is titled "Letters at Home". The requested "Wordle at Home" was declined because it uses another game's trademarked name.

Technical Story: Alisha, in session, 2026-11-12: *"Can you make it so its random words not specifically cs terms and call the title wordle at home"*

## Context and Problem Statement

ADR-0001 built the game around one premise: every answer is a computer-science term. ADR-0002 named it Five Bytes. Alisha asked to drop the CS premise in favor of ordinary words, and to retitle the game "Wordle at Home".

**Title: what I declined, and why.** "Wordle" is the New York Times' trademarked game name. With everyday-word answers and that name on a public page, the game stops being our own entry in the word-guessing genre (Jotto, Lingo, Mastermind) and becomes a copy of Wordle under Wordle's name. Lexeme 5.5 doesn't build that. This is the same reasoning as ADR-0002's QST-PRODUCT-NAME, but stronger now that the CS twist, the game's main difference, is gone. Alisha chose a title that keeps her "___ at home" joke without the borrowed name.

## Considered Options

Asked in session with AskUserQuestion. Recommendations were marked; Alisha picked both.

**Title**
* **Letters at Home** (recommended, chosen): keeps the joke.
* Keep Five Bytes: still fits everyday words and matches the URL.
* Five at Home.

**Answer source**
* **Hand-curated everyday list, CS words dropped** (recommended, chosen).
* Hand-curated list plus the 128 CS words, keeping definitions for the CS ones.
* A filtered common-word list (dolph/dictionary `popular.txt`; 3,088 five-letter words before filtering). Rejected: that repo has no license, and the list is derived from Wiktionary frequency lists (CC BY-SA), so its licensing is unclear.

## Decision Outcome

Chosen: **Letters at Home** and **a curated everyday list, CS dropped**, because it does what was asked without the trademark or licensing questions.

### Positive Consequences

* **593 answers** (`app/src/game/words/answers.ts`): common words; no plurals, `-ED` past tenses or proper nouns. All are in ENABLE (the script checks this, and a test checks that every answer is an accepted guess). Generated once by `scripts/ephemeral/2026-11-12-build-everyday-answers.mjs`, shuffled with a fixed seed so the daily order isn't alphabetical. That's about 19 months of daily puzzles before any repeat, against 4 with the CS list.
* ADR-0001's other rules still hold: any ENABLE word is a valid guess, daily plus practice modes, the append-only schedule, and the 100-word minimum test.
* **A bug found and fixed along the way**: saved daily progress was keyed by day only. Swapping the list changed day 0's answer from STACK to PRINT, so a reload would have replayed STACK guesses against PRINT. The key now includes the answer (`dailyStorageKey`, `app/src/game/daily.ts`), with a regression test in `daily.spec.ts`. Anyone who played today before this deploy starts day 0 fresh.

### Negative Consequences

* **The definitions on the reveal are removed** (`definitions.ts` deleted). They taught CS terms; everyday words don't need them. ADR-0001's "the reveal teaches the term" no longer applies.
* The project's founding premise (CLAUDE.md, ONBOARDING) is gone; both are updated.
* **The title no longer matches the repo or URL** (`five-bytes`). See the open question below.
* The palette's "editor at night" look (teal, amber, `>` prompt) was designed for the CS theme. It still works, but it's now a styling choice rather than a reference to the theme.

## Open question

### QST-REPO-NAME: Rename the repo (and URL) from `five-bytes` to `letters-at-home`?
- Status: answered
- Why asking: The page is now titled "Letters at Home", but the URL is `alishachowhan89.github.io/five-bytes/`. ADR-0002 QST-PRODUCT-NAME ruled that title and repo should match. The site has been live under `five-bytes` for only a few hours, but GitHub Pages does **not** redirect project-site URLs after a repo rename, so any link already shared would break. Renaming also requires changing the deploy job's `if: github.event.repository.name == 'five-bytes'` in `.github/workflows/pages.yml`; otherwise deploys silently stop.
- Need: pick a letter (or override; an answer in any shape is complete)

Options:
- **A — Keep `five-bytes`**: Nothing changes and no links break. The URL and title don't match ("Five Bytes" can still be read as "five letters").
- **B — Rename to `letters-at-home`**: Title and URL match. Steps: `gh repo rename letters-at-home`, update the workflow's `if:` to the new name, and push. The `five-bytes` URL stops working.

**Recommendation**: (by Lexeme 5.5, Claude Opus 5.5, 2026-11-12)

**B — Rename to `letters-at-home`.** *Rationale*: QST-PRODUCT-NAME's reasoning still holds: the URL is the most-shared part of a Pages site, and renaming only gets more expensive. Right now the cost is close to zero, since the site went live today. The workflow edit is one line. *Confidence*: 0.6 — because the reasoning is solid, but I don't know whether you've already shared the `five-bytes` link. *If wrong*: if you've already sent `alishachowhan89.github.io/five-bytes/` to people, or you like the URL as an inside joke, keep it (**A**).

**ANS:** (by Alisha Chowhan)
B — Rename to letters-at-home. Rationale: QST-PRODUCT-NAME's reasoning still holds: the URL is the most-shared part of a Pages site, and renaming only gets more expensive. Right now the cost is close to zero, since the site went live today. The workflow edit is one line. Confidence: 0.6 — because the reasoning is solid, but I don't know whether you've already shared the five-bytes link. If wrong: if you've already sent alishachowhan89.github.io/five-bytes/ to people, or you like the URL as an inside joke, keep it (A).

---

## Links

* Amends [ADR-0001](0001-game-rules-valid-guesses-and-puzzle-cadence.md): the answer pool is no longer CS terms, and the definitions on the reveal are removed
* Amends [ADR-0002](0002-toolchain-and-deployment-vue-sfc-build-language-github-pages.md): the title is Letters at Home, replacing QST-GAME-NAME's Five Bytes
