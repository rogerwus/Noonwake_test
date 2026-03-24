## 2026-03-22 mobile polish copy cleanup anchor drift
- Status: fixed in same session
- Context: Boss / Rank 文案压缩 + 移动端收边 for `life-rpg`
- Failure: a small `apply_patch` retry on `phase2/app.js` still used a stale monthly-card anchor and failed before the remaining player-facing copy cleanup landed.
- Fix: read the exact current `buildNextSessionPlan` / `renderReturnReasonsTile` lines with `rg` + `sed`, then retry with smaller exact hunks.
- See Also: `phase2/app.js`, `README.md`

## 2026-03-22 mobile smoke playwright browser missing
- Status: fixed in same session
- Context: mobile validation for `life-rpg` Phase 2
- Failure: a local Playwright smoke script failed because the default Playwright-managed Chromium executable was not installed at the cached `ms-playwright` path.
- Fix: log the failure, then retry against an installed system browser channel such as `chrome` instead of assuming Playwright-managed browsers exist.
- See Also: `README.md`, `phase2/app.js`

## 2026-03-19 convergence pack phase2 anchor retry
- Status: fixed in same session
- Context: numeric convergence + launch acceptance pack for `life-rpg`
- Failure: one broad `apply_patch` across `phase2/app.js` missed the exact commerce copy anchor and aborted before edits landed.
- Fix: log the retry immediately, re-read exact snippets, then patch smaller hunks for constants, Home/Boss/Rank copy, and README separately.
- See Also: `phase2/app.js`, `phase2/styles.css`, `README.md`

## 2026-03-16 README patch retry
- Status: fixed in same session
- Context: content expansion V2 for `life-rpg`
- Failure: a multi-file patch script used an overly specific README anchor and aborted after earlier file writes had already landed.
- Fix: inspect partial diff first, then retry with smaller targeted replacements and explicit nearby headings instead of broad exact-line anchors.
- See Also: `README.md`

## 2026-03-16 competition slice patch retry
- Status: fixed in same session
- Context: propagation / competition productization slice for `life-rpg`
- Failure: a single large `apply_patch` for `phase2/app.js`, `phase2/styles.css`, and `README.md` failed on a stale anchor before any edits landed.
- Fix: re-read exact snippets, then retry with smaller targeted hunks per function / section instead of one broad patch.
- See Also: `phase2/app.js`, `phase2/styles.css`, `README.md`

## 2026-03-16 local smoke server bind
- Status: fixed in same session
- Context: practical smoke checks for the competition/share-card slice in `life-rpg`
- Failure: starting `node server.js` inside the sandbox failed with `listen EPERM` on `0.0.0.0:8787`.
- Fix: rerun the local server with escalated permissions before doing curl-based smoke checks.
- See Also: `server.js`, `README.md`

## 2026-03-18 playtest polish patch anchors
- Status: fixed in same session
- Context: playtest + polish slice for `life-rpg`
- Failure: one broad `apply_patch` across `phase2/app.js` missed exact anchor text in the Boss / leaderboard binding area and aborted before edits landed.
- Fix: re-read the exact snippets, log the retry, then patch smaller hunks around `renderHome`, `buildTodayGoals`, action binding helpers, and return-reason rendering.
- See Also: `phase2/app.js`, `README.md`, `server.js`

## 2026-03-18 propagation final pack patch anchors
- Status: fixed in same session
- Context: propagation productization final pack for `life-rpg`
- Failure: one broad `apply_patch` across `phase2/index.html`, `phase2/app.js`, `phase2/styles.css`, and `README.md` missed the exact responsive anchor in `phase2/styles.css` and aborted before edits landed.
- Fix: re-read exact snippets, then retry with smaller targeted hunks per file (`renderHome`, `renderBoss`, `renderLeaderboard`, share helpers, responsive CSS, README sections).
- See Also: `phase2/index.html`, `phase2/app.js`, `phase2/styles.css`, `README.md`

## 2026-03-19 share export polish patch anchors
- Status: fixed in same session
- Context: share/export comeback-loop polish for `life-rpg`
- Failure: one broad `apply_patch` across `phase2/app.js`, `phase2/styles.css`, `phase2/index.html`, and `README.md` missed an exact anchor in the share-surface area and aborted before edits landed.
- Fix: log the failed broad patch first, then retry with smaller exact hunks around `renderLatestBattleCard`, `renderShareReadySurface`, `renderCompetitionPulseTile`, Boss CTA rows, responsive CSS, and README task notes.
- See Also: `phase2/app.js`, `phase2/styles.css`, `phase2/index.html`, `README.md`

## 2026-03-19 commerce state machine router anchor retry
- Status: fixed in same session
- Context: P0 支付与商品完整体 for `life-rpg`
- Failure: a router patch in `server.js` assumed an outdated `/claim/sign-in` anchor block and failed before the new commerce endpoints landed.
- Fix: log immediately, re-read exact router lines with `rg`/`sed`, then retry with smaller hunks around the exact `requestUrl.pathname` checks.
- See Also: `server.js`, `phase2/app.js`, `README.md`

- 2026-03-20 life-rpg phase2 patch attempt failed: large multi-hunk apply_patch on `phase2/app.js` missed context around `renderAll` after prior repo drift. Next retry should split into smaller targeted hunks with fresh line reads before patching.

- 2026-03-20 life-rpg onboarding-retention patch anchor drift: a broad `apply_patch` on `phase2/app.js` failed when the expected `bindScopedTabJumps` block no longer matched exactly. Retry by re-reading exact snippets and landing smaller hunks around analytics helpers, guide buttons, `renderHome`, surface loop copy, and tab-jump binding separately.

- 2026-03-21 life-rpg external-playtest wrap-up patch anchors: a broad multi-hunk `apply_patch` on `phase2/app.js` missed the current `renderAll` anchor after repo drift. Retry by re-reading exact snippets and landing smaller hunks around `bindTabs`, `renderAll`, analytics helpers, and per-surface render functions separately.

## 2026-03-21 phase2 smoke test playwright module lookup
- Status: fixed in same session
- Context: external playtest repair pack validation for `life-rpg`
- Failure: a repo-local `node <<'NODE'` smoke script used `require("playwright")`, but the package is only available as a global CLI on the host, so module resolution failed inside the repo runtime.
- Fix: log the failure immediately, then rerun smoke validation through the host Playwright CLI / global launcher instead of assuming a local dependency.
- See Also: `README.md`, `phase2/app.js`

## 2026-03-21 visual trust repair patch anchors
- Status: fixed in same session
- Context: 试玩前视觉与一致性修复包 for `life-rpg`
- Failure: one broad `apply_patch` across `phase2/app.js` assumed stale anchors around `renderHome` and adjacent ranking/share helpers, so verification aborted before edits landed.
- Fix: log immediately, re-read exact current snippets, then retry with smaller targeted hunks for commerce formatting, Home/Boss/Rank render order, sample-vs-real copy, and fallback leaderboard state separately.
- See Also: `phase2/app.js`, `phase2/styles.css`, `README.md`

## 2026-03-22 visual motion pack anchor drift
- Status: in progress
- Context: 《视觉动效首刀包》 for `life-rpg`
- Failure: a broad multi-file Python replacement script partially landed `phase2/index.html` / `phase2/styles.css`, then failed on the exact `renderDailyBossTile` / boss hero anchor inside `phase2/app.js` before JS and `README.md` edits were written.
- Fix: log immediately, inspect partial diff first, then retry with smaller targeted hunks for `phase2/app.js` render helpers / feedback hooks and a separate `README.md` patch.
- See Also: `phase2/index.html`, `phase2/styles.css`, `phase2/app.js`, `README.md`
