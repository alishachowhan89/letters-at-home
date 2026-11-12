/**
 * The CS answer list — and, by its ORDER, the daily schedule.
 *
 * Day N of the daily puzzle is ANSWERS[N % ANSWERS.length] (see ../daily.ts).
 * The order below was mixed once by hand at authoring time, so the file IS the
 * schedule. Consequences:
 *   - APPEND new words at the end only. Inserting, removing or reordering
 *     changes which word past and future days get (a player mid-streak would
 *     see "yesterday's" word change).
 *   - Words are exactly five uppercase letters; plurals and proper nouns are
 *     avoided so every answer is fair to a CS student (curation rule, draft —
 *     Alisha has the final say; see ADR-0001 Open Follow-ups).
 *
 * Draft list by Lexeme 5.5, 2026-11-12. Tests in __tests__/words.spec.ts
 * enforce the shape rules.
 */
export const ANSWERS: readonly string[] = [
  'STACK', 'MUTEX', 'GRAPH', 'TOKEN', 'CACHE', 'PARSE', 'QUEUE', 'ARRAY',
  'YIELD', 'PIXEL', 'REGEX', 'TUPLE', 'SHELL', 'MERGE', 'ASYNC', 'INDEX',
  'PROXY', 'FLOAT', 'DEBUG', 'SCOPE', 'DEQUE', 'LATCH', 'QUERY', 'CLASS',
  'RADIX', 'FETCH', 'BLOOM', 'TRAIT', 'SPAWN', 'TABLE', 'EVICT', 'LOGIC',
  'MONAD', 'ROUTE', 'CONST', 'PIVOT', 'INODE', 'CLONE', 'AWAIT', 'UNION',
  'SHARD', 'LEXER', 'FRAME', 'QUBIT', 'SLICE', 'PANIC', 'MACRO', 'OCTET',
  'CHUNK', 'ARITY', 'FLUSH', 'TRACE', 'BATCH', 'MIXIN', 'EPOCH', 'FIELD',
  'ABORT', 'VOXEL', 'SPLIT', 'CLOCK', 'NONCE', 'SUPER', 'PROBE', 'CODEC',
  'LAYER', 'WHILE', 'FAULT', 'GLYPH', 'ALLOC', 'ENTRY', 'THROW', 'SHIFT',
  'PATCH', 'UNARY', 'SPOOL', 'VALUE', 'RETRY', 'ALIAS', 'CYCLE', 'MODEL',
  'CATCH', 'INFIX', 'BUILD', 'DIGIT', 'QUOTA', 'MATCH', 'TIMER', 'OCTAL',
  'STATE', 'CURRY', 'BLOCK', 'ASCII', 'PURGE', 'LABEL', 'RELAY', 'DELTA',
  'EVENT', 'CRAWL', 'PRUNE', 'LOGIN', 'MOUNT', 'FINAL', 'CARRY', 'ACTOR',
  'RANGE', 'ERROR', 'STALL', 'AGENT', 'CHAIN', 'EMBED', 'INPUT', 'DEPTH',
  'SLEEP', 'MODEM', 'RESET', 'FLOOR', 'PRINT', 'ADDER', 'STORE', 'GUARD',
  'WRITE', 'LOCAL', 'CLOUD', 'APPLY', 'CRASH', 'COUNT', 'VIRUS', 'UNSET',
]
