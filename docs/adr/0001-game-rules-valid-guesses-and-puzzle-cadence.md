<!-- adr template version: "adr 3.12.0" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs4ai
  plugin: adr@adrs4ai
-->

# Game rules: valid guesses and puzzle cadence

- **Date**: 2026-11-12
- **Iteration**: 4
- **Status**: Implemented

> **Amended by [ADR-0003](0003-everyday-word-answers-and-the-letters-at-home-title.md) (2026-11-12):** answers are now everyday English words, not CS terms, and the definitions on the reveal are removed. The guess rules, cadence, schedule and tests below still apply.
- **Deciders**: Alisha Chowhan (human), Lexeme 5.5 (Claude Opus 5.5)

**TL;DR**: Before writing code, decide what counts as a legal guess and whether there is one shared puzzle per day or unlimited play. Both choices shape the word-list files, the game state, and what gets saved in the browser.

---

## Originating Context

**Source**: Human brief, in the first session (2026-11-12):

> The project is a Wordle variant — guess the word, colored feedback per letter — with a twist: the answers are computer science words (ARRAY, STACK, QUEUE, CACHE, TOKEN…). I want it hosted free on GitHub Pages, built with Vue using scoped CSS so styles stay component-local. Before you write any code: what are the 2–3 decisions we should settle first? Put them to me as proper QST cards in the record — with your recommendation on each.

This ADR covers the **game-rules** part of that brief. The toolchain part is in [ADR-0002](0002-toolchain-and-deployment-vue-sfc-build-language-github-pages.md).

**Agency Grant**: "Explore options" — recommend, but don't decide; no code until the questions are answered.

---

## Explicitation

**What I understand**:

1. **Answers are CS terms; guesses are a separate question.** The brief says what the *answers* are, but not what the player may *type*. The game plays very differently depending on that (QST-VALID-GUESSES).
2. **When a new puzzle appears is the main design choice.** One shared puzzle per day vs. a new word on every click affects how answers are picked, what gets saved, whether results can be shared, and how fast we run out of words (QST-PUZZLE-CADENCE).

**Assumptions** (state an override on any of these if you disagree):

- **Five letters, six guesses.** I took the length from your examples: ARRAY, STACK, QUEUE, CACHE and TOKEN all have exactly five letters. The cost is that many great CS words are left out (HEAP, TREE, LAMBDA, KERNEL, BINARY). My unverified rough guess is that there are about 150–250 good five-letter CS terms. That number matters for the cadence question, and counting them properly is an action item below.
- **Repeated letters follow the standard two-pass rule.** First mark every letter that is in the right spot. Then mark letters that are in the word but in the wrong spot, without using any answer letter more than once. Example: answer QUEUE, guess EERIE. The last E is in the right spot, so it's **correct**, which uses up the answer's final E. The first E is **present**, which uses up the answer's middle E. The second E is **absent** because the answer has no E's left. The answer has two E's, so exactly two of the guess's three E's are marked. This edge case is the one most often built wrong, so it is the first thing the test suite must pin down (see CLAUDE.md, Fifth Directive).
- **The genre, not a copy.** Guessing a word with per-letter feedback is an old game format (Jotto, Mastermind, Lingo). We build our own version with our own name and look. We don't copy Wordle's name, branding or visual design (see ADR-0002, QST-PRODUCT-NAME).
- **No backend.** GitHub Pages only serves static files. Every word list ships inside the page's JavaScript, so a curious player can always find the answers in the source. That's acceptable for a game played for fun.

**Confirm**: Alisha, mainly the five-letter assumption and the two questions below.

---

## Questions

### QST-VALID-GUESSES: What counts as a legal guess?
- Status: answered
- Why asking: Answers will come from a hand-picked list of five-letter CS terms. The open question is what the player may *type*. With a small CS-only list, every guess has to be a CS word. That makes the game a vocabulary-recall test, and rejects normal openers like CRANE or SLATE. Allowing ordinary English words keeps the usual deduction game but means shipping a dictionary file. This choice decides which data files exist and what "not in word list" means.
- Need: pick a letter (or override; an answer in any shape is complete)

Options:
- **A — CS-only**: A guess must be a word from the CS list (the answers plus some extra CS terms). Small data file and strongly on theme. But a player who doesn't know many CS words can't make a useful first guess, and ordinary words get rejected.
- **B — CS answers, any real word as a guess**: Answers come only from the CS list. Accepted guesses are the CS list plus a general English five-letter word list (a public-domain source such as ENABLE; license to be checked). CS words like MUTEX, REGEX and ASYNC stay guessable because they're in our list, even though English dictionaries lack them. This adds roughly 8–13k words to the page, which compresses well.
- **C — Any five letters**: No dictionary check at all. Simplest to build, but players can type letter-probing nonsense like AEIOU, which removes most of the puzzle.

**Recommendation**: (by Lexeme 5.5, Claude Opus 5.5, 2026-11-12)

**B — CS answers, any real word as a guess.** *Rationale*: The "aha" in this game comes from narrowing down the letters, and that requires being free to probe with any real word. A forces players to guess from a list of maybe 200 terms, so the game shrinks to remembering the list. C removes the constraint that makes deduction interesting. B keeps the theme where it matters (the answer is always a CS word, and the reveal teaches the term) while making openings fair to non-CS players. It costs one extra data file and a license check. *Confidence*: 0.8 — because this is how the genre usually works and the costs are small and known. I haven't checked the dictionary's license yet; that's an action item. *If wrong*: if you mean this mainly as a **study tool**, where every guess should practice a CS term, the theme matters more than fair openings and this flips to **A**. Same if no dictionary with a compatible license turns up.

**ANS:** (by Alisha Chowhan)
B — CS answers, any real word as a guess. Rationale: The "aha" in this game comes from narrowing down the letters, and that requires being free to probe with any real word. A forces players to guess from a list of maybe 200 terms, so the game shrinks to remembering the list. C removes the constraint that makes deduction interesting. B keeps the theme where it matters (the answer is always a CS word, and the reveal teaches the term) while making openings fair to non-CS players. It costs one extra data file and a license check. Confidence: 0.8 — because this is how the genre usually works and the costs are small and known. I haven't checked the dictionary's license yet; that's an action item. If wrong: if you mean this mainly as a study tool, where every guess should practice a CS term, the theme matters more than fair openings and this flips to A. Same if no dictionary with a compatible license turns up.

---

### QST-PUZZLE-CADENCE: One shared puzzle per day, or play as many as you like?
- Status: answered
- Why asking: This decides how the answer is chosen (from the date, or at random), what gets saved in the browser (a daily streak, or just win counts), and whether players can compare results. It also interacts with the list size: if there are about 150–250 five-letter CS terms (unverified estimate from the first assumption above), a daily puzzle starts repeating within about 5–8 months. Unlimited play uses the words up as fast as people play.
- Need: pick a letter (or override; an answer in any shape is complete)

Options:
- **A — Daily**: The answer is fixed by the calendar date: a shuffled list is indexed by days since launch, and the day rolls over at local midnight. Everyone gets the same word, plays once a day, and can share a spoiler-free result grid. A streak and stats are saved in the browser. The words start repeating after (list size) days.
- **B — Unlimited**: Each game picks a random answer, and a "New word" button starts another. Simplest to build and test, and easy to play over and over or demo. No shared puzzle, no streak, nothing to compare.
- **C — Daily plus practice**: A daily puzzle as the main mode, plus a practice mode with random answers that never uses today's word. The game logic takes the answer as input, so each mode just decides how the answer is picked. Costs one mode toggle and separate saved stats for each mode.

**Recommendation**: (by Lexeme 5.5, Claude Opus 5.5, 2026-11-12)

**C — Daily plus practice.** Build the game logic so it takes the answer as input. Ship daily mode first and add practice next. *Rationale*: A shared daily word is what makes these games social, and a GitHub Pages link is made for sharing. But daily-only is frustrating for the people who most need to play it: you while testing, and anyone who wants another round to learn the words. With the answer passed in, practice mode is a different picker and a toggle, not a second game. So most of C's cost is a design decision we make anyway. *Confidence*: 0.65 — because this is a product-taste call I can argue for but can't measure. The technical cost is low; the real question is what you want the game to feel like. *If wrong*: if the counted CS list comes in **under ~100 words**, a daily puzzle repeats within one semester and this flips to **B** (unless we allow more word lengths). If you're building this mainly to play yourself, not to share, it also flips to **B**.

**ANS:** (by Alisha Chowhan)
C — Daily plus practice. Build the game logic so it takes the answer as input. Ship daily mode first and add practice next. Rationale: A shared daily word is what makes these games social, and a GitHub Pages link is made for sharing. But daily-only is frustrating for the people who most need to play it: you while testing, and anyone who wants another round to learn the words. With the answer passed in, practice mode is a different picker and a toggle, not a second game. So most of C's cost is a design decision we make anyway. Confidence: 0.65 — because this is a product-taste call I can argue for but can't measure. The technical cost is low; the real question is what you want the game to feel like. If wrong: if the counted CS list comes in under ~100 words, a daily puzzle repeats within one semester and this flips to B (unless we allow more word lengths). If you're building this mainly to play yourself, not to share, it also flips to B.

---

## Decision

### Context
Answers are CS terms; the open choices were what a player may type and when a new puzzle appears. Both were answered by Alisha on 2026-11-12, accepting the recommendations.

### Chosen
- **Valid guesses — B**: any English five-letter word from ENABLE (public domain; Debian's scowl package README records its release into the public domain), **plus** every CS answer. The union matters: 15 of the 128 draft answers (MUTEX, REGEX, TUPLE, ASYNC, DEQUE, CONST, INODE, LEXER, QUBIT, ARITY, MIXIN, VOXEL, ALLOC, ASCII, LOGIN) are not in ENABLE.
- **Cadence — C**, daily first: the game core takes the answer as input; daily mode is built, practice mode is next.

**Rationale**: as in the answered recommendations above.

**Trade-offs accepted**: the guess list adds ~52 KB raw to the bundle (whole JS bundle: 51.6 KB gzipped); every answer is readable in the page source (no backend, as assumed).

### Consequences
- **The answer file's order is the daily schedule.** Day N is `ANSWERS[N % length]`, counted in local calendar days from 2026-11-12 (`app/src/game/daily.ts`). There's no runtime shuffle: the list was mixed once by hand, so **new words may only be appended**. Inserting or reordering would change which word past days had. I made this design call while implementing, to keep the schedule stable.
- **Measured list size: 128 answers.** That's above the falsifier's ~100 threshold, so cadence C stands, but it's below my 150–250 estimate. At 128, daily puzzles start repeating around **2027-03-20** unless the list grows. A test (`words.spec.ts`) fails if the list drops under 100, which is the condition that would reopen QST-PUZZLE-CADENCE.
- Daily progress is saved in `localStorage` per day number, so a reload restores the board instead of allowing a replay. Saved guesses are re-validated, not trusted.
- Day rollover is computed from calendar dates, not timestamps. Subtracting local midnights loses a day after a daylight-saving change (verified: 122 vs. the correct 123 for 2027-03-15 in America/New_York). A test pins this.

---

## Open Follow-ups

- [x] Unverified assumption: the five-letter CS-term count (~150–250) was a guess. **Measured: 128** in the first draft list (see Decision → Consequences).
- [ ] Concern: feedback shown by **color alone** fails for color-blind players. *Partly done*: every tile has a spoken label ("A, correct spot") and the palette uses teal and amber, which differ in brightness as well as hue. Still open: a high-contrast option.
- [ ] Future task: decide who curates the answer list and how disputed terms are handled. (Is "LINUX" a CS word? "AGILE"? Only words that are fair to a CS student?) The draft avoids plurals and proper nouns. **Alisha to review `app/src/game/words/answers.ts`**, which also includes some words that are as much everyday as CS, such as LOGIN, VIRUS, MODEL and CLOUD.
- [x] Future task: **the reveal should teach the term.** Done in iteration 3: each answer has a one-line definition in `app/src/game/words/definitions.ts`, shown when a round ends. A test fails if an answer has no definition. The definitions are a draft for Alisha to review along with the list.
- [x] Future task: practice mode (random answer, never today's word, not saved), which completes cadence C. Done in iteration 3. The two modes live side by side, so switching never loses either board.

---

## Action Items

- [x] Draft the five-letter CS answer list and count it (128) - Owner: Lexeme 5.5
- [ ] Curate the answer list and its definitions (keep / cut / add, append-only) - Owner: Alisha Chowhan
- [x] Pick an English word list and check its license (ENABLE, public domain) - Owner: Lexeme 5.5
- [x] Write the repeated-letter feedback tests (QUEUE/EERIE, TOKEN/EMBED, ARRAY/RADIX) - Owner: Lexeme 5.5
- [x] Practice mode - Owner: Lexeme 5.5
- [x] One-line definitions shown on the reveal (draft) - Owner: Lexeme 5.5

---

## Validation

- [ ] Alisha Chowhan: the five-letter / six-guess assumption matches intent
- [ ] Alisha Chowhan: QST-VALID-GUESSES and QST-PUZZLE-CADENCE answered
- [x] Lexeme 5.5: the repeated-letter rule and the no-backend constraint are stated correctly

**Notes**: —

---

## Iterations

### Iteration 1 (2026-11-12)
- Trigger: initial draft from the human brief (first session)
- Contributors: Lexeme 5.5 (Claude Opus 5.5)
- Changes: Split the brief into game rules (this ADR) and toolchain (ADR-0002). Asked two questions with recommendations. Wrote down the five-letter, repeated-letter and no-backend assumptions.
- Outcome: Draft; waiting on Alisha's answers

### Iteration 2 (2026-11-12)
- Trigger: Alisha answered both questions (B, C), accepting the recommendations
- Contributors: Alisha Chowhan (answers), Lexeme 5.5 (Claude Opus 5.5; implementation, this entry)
- Changes: Filled in the Decision section. Built the scoring function, the guess check (ENABLE plus the answers), the daily schedule with saved progress, and 28 tests. Measured the list at 128 words. Recorded the append-only schedule rule. Added follow-ups for the definitions on the reveal and for practice mode.
- Outcome: Draft → Partially Implemented (daily mode built; practice mode and list curation remain)

### Iteration 3 (2026-11-12)
- Trigger: "proceed" after QST-GAME-NAME was answered; practice mode and the definitions were the next items on my side
- Contributors: Lexeme 5.5 (Claude Opus 5.5)
- Changes: Added practice mode (`app/src/game/practice.ts`: never today's word, never the previous practice word). Added a one-line definition for all 128 answers, shown when a round ends. Made the game composable take any answer (`useWordGame`, saving optional). 5 new tests, 33 in total.
- Outcome: Partially Implemented → Implemented (both decisions are built; curating the list and a high-contrast option stay open as follow-ups)

### Iteration 4 (2026-11-12)
- Trigger: Alisha asked for everyday words instead of CS terms. Recorded as ADR-0003.
- Contributors: Alisha Chowhan (request, choices), Lexeme 5.5 (Claude Opus 5.5)
- Changes: Added the amendment banner at the top. The 128-word CS list and its definitions are replaced by 593 everyday words. The answer-list curation action item now refers to the new list. Saved progress is now keyed by day and answer (ADR-0003).
- Outcome: still Implemented

---

## Glossary (optional)

- **Answer list**: the hand-picked CS terms that can be a puzzle's hidden word.
- **Guess list**: every word the game accepts as input; always includes the answer list.
- **Present / correct / absent**: per-letter feedback: in the word but wrong spot / right spot / not in the word (counted after already-matched letters are used up).

---

## Links

- Related ADRs: [ADR-0002](0002-toolchain-and-deployment-vue-sfc-build-language-github-pages.md) (toolchain, deploy, product name)
- Amended by: [ADR-0003](0003-everyday-word-answers-and-the-letters-at-home-title.md) (everyday-word answers)
