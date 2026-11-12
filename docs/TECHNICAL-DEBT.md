# Technical Debt

Workarounds and compromises, each with where it lives and how to retire it (see CLAUDE.md, "Technical Debt Tracking").

---

## TD-1: Tests run in `node`, not `jsdom` (no component tests yet)

- **Issue**: The scaffold's test environment, jsdom 30, loads undici, which crashes on Node 22.14 (`Cannot read properties of undefined (reading 'bind')` in `undici/lib/interceptor/decompress.js`). The scaffold itself requires Node ^22.18.0 || >=24.12.0.
- **Location**: `app/vitest.config.ts` (`environment: 'node'`)
- **Impact**: The game logic (scoring, word lists, daily schedule, game state) is fully tested. The Vue components (board, keyboard, physical-key handling) have no automated tests.
- **Workaround**: Keep all game rules in plain TypeScript (`app/src/game/*.ts`) so they're testable without a DOM. Components stay thin.
- **Fix**: Upgrade local Node to 24 LTS (CI already uses 24), switch component specs to `// @vitest-environment jsdom`, and add tests for the parts most likely to break: typing past five letters, Enter on a focused on-screen key.
- **Priority**: Medium. Do it before components get more logic.

## TD-2: The local npm 11.3.0 can't install this project from scratch

- **Issue**: `npm install` with npm 11.3.0 crashes in arborist's peer-dependency resolution (`Cannot read properties of null (reading 'edgesOut')`, `build-ideal-tree.js` `#loadPeerSet`, while resolving `vitest`). The install was done with npm 12.2.2 run through `npx`.
- **Location**: dev machine only. `app/package-lock.json` was written by npm 12.2.2 (lockfile v3, readable by npm ≥ 7).
- **Impact**: A fresh `npm install` with the global npm can fail. `npm ci` from the existing lockfile hasn't been tested with 11.3.0.
- **Workaround**: `npx -y npm@12.2.2 install`
- **Fix**: Upgrade the global npm (`npm install -g npm@latest`) or upgrade Node, which brings a newer npm.
- **Priority**: Low. It only matters when dependencies change.

## TD-3: `just gate` stops before the app checks until kintsugi is adopted

- **Issue**: `instantiate-check` exits 2 when `kintsugi.yaml` has no `kintsugi.lock` (the template is "adopted but never wired"). `gate` uses `set -e`, so it stops there and never runs `npm test` or `npm run build`.
- **Location**: `justfile`, `gate` and `instantiate-check` recipes
- **Impact**: The documented gate (CLAUDE.md, Fifth Directive) can't go green on this machine, and it hides app failures behind the lock warning. Until fixed, run the gate's later steps directly, as was done for the 2026-11-12 commits.
- **Workaround**: `(cd app && npm test && npm run build)`
- **Fix**: Install kintsugi (`uv tool install adrs4ai-kintsugi`, which needs `uv`) and run `kintsugi adopt`. That's an interactive, file-by-file walkthrough, so it's Alisha's call.
- **Priority**: High. A gate that can't pass teaches everyone to ignore gates.
