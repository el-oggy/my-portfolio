# M9 — System error sweep & fixes

Triggered by: "there are so many errors in the system — look for them and
resolve them." Full audit of build-time, lint-time, type-time and asset-time
error classes.

## Error inventory found

| # | Class | Count | Detail |
|---|---|---|---|
| 1 | **ESLint errors (real)** | 2 | `app/api/contact/route.ts:29` unused `error` binding; `Contact/MessagePaper.jsx:153` dead `WEB3FORMS_KEY` constant |
| 2 | **Linting hidden from builds** | 1 config | `next.config.mjs` had `eslint.ignoreDuringBuilds: true` — the build printed "Skipping linting", which is exactly why #1 accumulated unnoticed |
| 3 | **TypeScript errors** | 0 | `npx tsc --noEmit` → clean; build type-check also clean |
| 4 | **Missing public assets** | 0 (after checker restored) | 206 static refs across 84 source files all exist; the old `scripts/check-assets.cjs` + `prebuild` hook had been deleted in `29d21a9`, so nothing guarded this anymore |
| 5 | **ESLint warnings** | 39 | `react-hooks/exhaustive-deps` (~30), `no-img-element` (8), 1 ref-cleanup pattern — non-blocking, deliberately not mass-edited (see below) |
| 6 | **`/api/contact` returns 500 locally** | expected | Response body `{"success":false,"message":"Web3Forms key is missing."}` — graceful missing-env branch, **not a crash**. The key lives in Vercel env vars in production; there is no `.env` in the repo by design. |
| 7 | TODO/FIXME markers | 0 | — |
| 8 | `console.error` calls | 2 | intentional error paths only |

## Fixes applied
1. `app/api/contact/route.ts` — `catch (error)` → `catch` (unused binding gone).
2. `components/itom/.../Contact/MessagePaper.jsx` — deleted the dead
   `const WEB3FORMS_KEY = ''` (the form posts to `/api/contact`, which reads
   the real key from `process.env` server-side; the client constant was
   legacy from the pre-API flow).
3. `next.config.mjs` — **removed `eslint.ignoreDuringBuilds: true`**.
   Builds now run "Linting and checking validity of types …" and fail on
   errors (warnings don't fail). This is the structural fix: hidden errors
   can't pile up again.
4. `scripts/check-assets.cjs` — **restored** (deleted in `29d21a9`) with a
   simpler two-step matcher; verifies all `/public` refs exist.
5. `package.json` — re-wired `"prebuild": "npm run check:assets"` and added
   the `check:assets` script, so **every `npm run build` re-verifies assets**.
6. `.env.example` — documents `WEB3FORMS_KEY` (tracked; `.env`/`.env*.local`
   stay gitignored) so the 500 in #6 is self-explanatory for local runs.

## Why the 39 warnings were left alone
- `exhaustive-deps`: this codebase intentionally omits deps (e.g. paint
  animations, room-ready signals) so effects don't re-fire and re-trigger
  transitions. Blindly adding deps would change runtime behavior in hallway
  code that the PRD marks do-not-touch.
- `no-img-element`: the `<img>`s are tiny in-canvas UI textures inside
  overlays; switching to `next/image` adds loader overhead/behavior risk for
  no LCP gain (they're not hero content).

## Verification (all green)
- `npx next lint` → **0 errors**, 39 warnings.
- `npx tsc --noEmit` → 0 errors.
- `npm run build` → `check:assets OK` → `Linting and checking validity of types`
  → ✓ Compiled, 11/11 pages, `/` 48 kB / 136 kB (baseline parity).
- `next start` smoke → `/` 200, `/email` 200; `POST /api/contact` → the
  documented missing-key response (not a crash).
