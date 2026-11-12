/**
 * Practice mode's answer picker (ADR-0001, QST-PUZZLE-CADENCE = C).
 *
 * `exclude` must contain today's daily answer — practice would otherwise spoil
 * the daily puzzle — and usually the previous practice word, so "New word"
 * never hands back the word you just played.
 */
export function pickPracticeAnswer(
  answers: readonly string[],
  exclude: readonly string[],
  random: () => number = Math.random,
): string {
  const pool = answers.filter((w) => !exclude.includes(w))
  const from = pool.length > 0 ? pool : answers
  return from[Math.floor(random() * from.length)]!
}
