// 2026-11-12 — build app/src/game/words/answers.ts from a hand-curated list of
// everyday five-letter words (ADR-0003: answers switch from CS terms to everyday words).
//
// Why a script: the file order of ANSWERS is the daily schedule (ADR-0001), so an
// alphabetical list would make tomorrow's word guessable. This shuffles ONCE with a
// fixed seed (reproducible), validates every word against ENABLE, and writes the file.
//
// Curation rules (Lexeme 5.5's draft, for Alisha's review): common words only; no
// plurals or -ED past tenses; no proper nouns; function words with odd feel
// (SHALL, OUGHT, WHOSE, WOULD) left out.
//
// Usage: node scripts/ephemeral/2026-11-12-build-everyday-answers.mjs <path/to/enable1.txt>
//
// AFTER the first deploy of this list, never re-run this to regenerate answers.ts:
// reshuffling would change past and future days. Append new words by hand instead.

import { readFileSync, writeFileSync } from 'node:fs'

const CANDIDATES = `
ABOUT ABOVE ACTOR ADMIT ADOPT ADULT AFTER AGAIN AGENT AGREE AHEAD ALARM ALBUM ALERT
ALIKE ALIVE ALLOW ALONE ALONG ALTER AMONG ANGER ANGLE ANGRY APART APPLE APPLY ARENA
ARGUE ARISE ASIDE AUDIO AVOID AWAKE AWARD AWARE
BADGE BAKER BASIC BEACH BEARD BEAST BEGIN BEING BELOW BENCH BERRY BIRTH BLACK BLADE
BLAME BLANK BLAST BLEND BLESS BLIND BLOCK BLOOD BLOOM BOARD BOOST BOOTH BRAIN BRAND
BRAVE BREAD BREAK BRICK BRIDE BRIEF BRING BROAD BROWN BRUSH BUILD BUNCH BURST BUYER
CABIN CABLE CANDY CARGO CARRY CATCH CAUSE CHAIN CHAIR CHALK CHARM CHART CHASE CHEAP
CHECK CHEEK CHEER CHESS CHEST CHIEF CHILD CHILL CHOIR CIVIL CLAIM CLASS CLEAN CLEAR
CLERK CLICK CLIFF CLIMB CLOCK CLOSE CLOTH CLOUD COACH COAST COUCH COUNT COURT COVER
CRAFT CRANE CRASH CRAZY CREAM CRIME CROSS CROWD CROWN CRUSH CURVE CYCLE
DAILY DAIRY DANCE DEATH DELAY DEPTH DIARY DIRTY DOUBT DOUGH DOZEN DRAFT DRAIN DRAMA
DREAM DRESS DRIFT DRILL DRINK DRIVE DWELL
EAGER EAGLE EARLY EARTH EIGHT ELBOW ELDER EMPTY ENEMY ENJOY ENTER ENTRY EQUAL ERROR
ESSAY EVENT EVERY EXACT EXIST EXTRA
FAINT FAITH FALSE FANCY FEAST FENCE FEVER FIELD FIFTH FIFTY FIGHT FINAL FIRST FLAME
FLASH FLOAT FLOOD FLOOR FLOUR FLUID FOCUS FORCE FORTH FORUM FRAME FRESH FRONT FROST
FRUIT FUNNY
GHOST GIANT GLASS GLOBE GLORY GLOVE GRACE GRADE GRAIN GRAND GRANT GRAPE GRASS GRAVE
GREAT GREEN GREET GRIEF GRILL GROUP GUARD GUESS GUEST GUIDE
HABIT HAPPY HARSH HEART HEAVY HELLO HOBBY HONEY HONOR HORSE HOTEL HOUSE HUMAN HUMOR
HURRY
IDEAL IMAGE INDEX INNER INPUT ISSUE IVORY
JEWEL JOINT JUDGE JUICE
KNIFE KNOCK
LABEL LARGE LASER LATER LAUGH LAYER LEARN LEASE LEAST LEAVE LEGAL LEMON LEVEL LIGHT
LIMIT LINEN LOCAL LOGIC LOOSE LOVER LOWER LOYAL LUCKY LUNCH
MAGIC MAJOR MAKER MANGO MAPLE MARCH MATCH MAYBE MAYOR MEDAL MEDIA MERCY MERRY METAL
METER MIGHT MINOR MINUS MIXER MODEL MONEY MONTH MORAL MOTOR MOUNT MOUSE MOUTH MOVIE
MUSIC
NERVE NEVER NIGHT NINJA NOBLE NOISE NORTH NOVEL NURSE
OCEAN OFFER OFTEN OLIVE ONION OPERA ORBIT ORDER OTHER OUTER OWNER
PAINT PANEL PAPER PARTY PASTA PATCH PAUSE PEACE PEACH PEARL PENNY PHASE PHONE PHOTO
PIANO PIECE PILOT PITCH PIZZA PLACE PLAIN PLANE PLANT PLATE PLAZA POINT POLAR POUND
POWER PRESS PRICE PRIDE PRIME PRINT PRIOR PRIZE PROOF PROUD PROVE PUPIL PURSE
QUEEN QUEST QUICK QUIET QUILT QUITE QUOTE
RADAR RADIO RAINY RAISE RALLY RANCH RANGE RAPID RATIO REACH READY REALM REBEL REFER
RELAX REPLY RIDER RIDGE RIGHT RIVAL RIVER ROAST ROBIN ROBOT ROCKY ROUGH ROUND ROUTE
ROYAL RULER RURAL
SALAD SAUCE SCALE SCARF SCENE SCENT SCORE SCOUT SEVEN SHADE SHAKE SHAPE SHARE SHARK
SHARP SHEEP SHEET SHELF SHELL SHIFT SHINE SHIRT SHOCK SHORE SHORT SHOUT SIGHT SILLY
SINCE SKILL SKIRT SLEEP SLICE SLIDE SLOPE SMALL SMART SMELL SMILE SMOKE SNACK SNAKE
SOLID SOLVE SORRY SOUND SOUTH SPACE SPARE SPARK SPEAK SPEED SPELL SPEND SPICE SPINE
SPLIT SPOON SPORT SPRAY SQUAD STACK STAFF STAGE STAIR STAKE STAMP STAND START STATE
STEAM STEEL STEEP STICK STILL STOCK STONE STOOL STORE STORM STORY STOVE STRAW STRIP
STUDY STUFF STYLE SUGAR SUITE SUNNY SUPER SWEAT SWEET SWIFT SWING SWORD
TABLE TASTE TEACH TEETH THANK THEME THERE THICK THIEF THING THINK THIRD THREE THROW
THUMB TIGER TIGHT TIMER TITLE TOAST TODAY TOKEN TOOTH TOPIC TORCH TOTAL TOUCH TOUGH
TOWEL TOWER TOXIC TRACE TRACK TRADE TRAIL TRAIN TREAT TREND TRIAL TRIBE TRICK TRUCK
TRULY TRUNK TRUST TRUTH TWICE TWIST
UNCLE UNDER UNION UNITY UNTIL UPPER UPSET URBAN USUAL
VALID VALUE VIDEO VISIT VITAL VIVID VOICE VOTER
WAGON WASTE WATCH WATER WHALE WHEAT WHEEL WHERE WHICH WHILE WHITE WHOLE WIDTH WOMAN
WORLD WORRY WORTH WOUND WRITE WRONG
YACHT YIELD YOUNG YOUTH
ZEBRA
`

const src = process.argv[2]
if (!src) {
  console.error('usage: node 2026-11-12-build-everyday-answers.mjs <enable1.txt>')
  process.exit(2)
}
const enable = new Set(readFileSync(src, 'utf8').split(/\r?\n/).map((w) => w.trim().toUpperCase()))

const words = CANDIDATES.split(/\s+/).filter(Boolean)
const bad = words.filter((w) => !/^[A-Z]{5}$/.test(w) || !enable.has(w))
const dupes = words.filter((w, i) => words.indexOf(w) !== i)
if (bad.length || dupes.length) {
  console.error('not in ENABLE or malformed:', bad, 'duplicates:', dupes)
  process.exit(1)
}

// mulberry32 + Fisher–Yates, fixed seed → the same schedule on every run.
let seed = 20261112
const rand = () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const list = [...words]
for (let i = list.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1))
  ;[list[i], list[j]] = [list[j], list[i]]
}

const rows = []
for (let i = 0; i < list.length; i += 8) rows.push('  ' + list.slice(i, i + 8).map((w) => `'${w}'`).join(', ') + ',')

const out = `/**
 * The answer list — and, by its ORDER, the daily schedule.
 *
 * Everyday five-letter English words (ADR-0003; replaced the CS-term list).
 * Day N of the daily puzzle is ANSWERS[N % ANSWERS.length] (see ../daily.ts).
 * Generated once by scripts/ephemeral/2026-11-12-build-everyday-answers.mjs
 * (hand-curated, shuffled with a fixed seed). From now on:
 *   - APPEND new words at the end only. Inserting, removing or reordering
 *     changes which word past and future days get.
 *   - Words are exactly five uppercase letters, in the ENABLE dictionary, with
 *     no plurals or proper nouns. __tests__/words.spec.ts enforces the shape rules.
 *
 * ${list.length} words. Draft by Lexeme 5.5, 2026-11-12, for Alisha's review.
 */
export const ANSWERS: readonly string[] = [
${rows.join('\n')}
]
`
writeFileSync(new URL('../../app/src/game/words/answers.ts', import.meta.url), out)
console.log(`wrote ${list.length} words`)

// Outcome (2026-11-12): run once against enable1.txt → 593 words, all in ENABLE,
// no duplicates; answers.ts replaced the 128-word CS list (ADR-0003). Day 0 is PRINT.
