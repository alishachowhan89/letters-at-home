<!-- adr template version: "adr 3.12.0" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs4ai
  plugin: adr@adrs4ai
-->

# Game rules: valid guesses and puzzle cadence

- **Date**: 2026-11-12
- **Iteration**: 1
- **Status**: Draft
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

*Pending: filled in once both questions above are answered.*

---

## Open Follow-ups

- [ ] Unverified assumption: the five-letter CS-term count (~150–250) is a guess. Write the real list before trusting the cadence math.
- [ ] Concern: feedback shown by **color alone** fails for color-blind players. Plan for a high-contrast option and an accessible label on every tile (e.g., "A, correct position") from the start; adding them later is harder.
- [ ] Future task: decide who curates the answer list and how disputed terms are handled. (Is "LINUX" a CS word? "AGILE"? Only words that are fair to a CS student?)

---

## Action Items

- [ ] Draft the five-letter CS answer list and count it - Owner: Lexeme 5.5 (draft), Alisha Chowhan (curation)
- [ ] If QST-VALID-GUESSES lands on B: pick an English word list and check its license - Owner: Lexeme 5.5
- [ ] Write the repeated-letter feedback tests before the feedback code (QUEUE/EERIE-class cases) - Owner: Lexeme 5.5

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

---

## Glossary (optional)

- **Answer list**: the hand-picked CS terms that can be a puzzle's hidden word.
- **Guess list**: every word the game accepts as input; always includes the answer list.
- **Present / correct / absent**: per-letter feedback: in the word but wrong spot / right spot / not in the word (counted after already-matched letters are used up).

---

## Links

- Related ADRs: [ADR-0002](0002-toolchain-and-deployment-vue-sfc-build-language-github-pages.md) (toolchain, deploy, product name)
