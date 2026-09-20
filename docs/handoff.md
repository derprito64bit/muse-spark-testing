# Handoff — Aether One X v2 (chat compact)

Date: 2026-09-19. Repos: the build repo (this one) and the deploy
repo (GitHub auto-deploys `main` to Vercel Hobby).
Sync ritual: work in build repo, then copy (excluding `.git`,
`node_modules`, `dist`, `reference`, `test-results`, `playwright-report`,
`.playwright-mcp`) into deploy repo, commit both, push deploy.

## Prompt set (all saved, refer to these)

- `docs/meta-prompt-main.md` — M0-M10 build spec (working reference).
- `docs/m3r-device-model.md` — original device-model brief.
- `docs/prompt-a-fidelity.md` — Prompt A (component fidelity).
- `docs/prompt-b-animation.md` — Prompt B (animation/transitions).
- `docs/audit.md`, `docs/FILM.md`, `docs/glass.md`, `docs/motion.md`,
  `docs/design-tokens.md`, `docs/tooling.md`.

## Milestones: M0-M10 DONE (M9/M10 this session, honest gaps listed

below). M3R + Prompt A + Prompt B DONE (newest spec governs: plateau,
not dial). All uncommitted.

## Decisions (binding)

- D1 Motion over GSAP, single runtime. GSAP MCP installed, unused.
- D2 Vite 8 uses `build.rolldownOptions.output.advancedChunks`
  (`rollupOptions` alias ignored; three + r3f split verified in dist).
- D3 No drei imports in app code (900KB lazy bloat); custom slab geometry.
- D4 Tier 1 glass = 3D-stage device glass; HTML `<Glass>` = Tiers 2+3.
- D5 Meters are sequential (one aether hue + ink labels); no categorical
  palette ships (validator proved a 4-blue categorical fails).
- D6 `.spec-tech` uses faint token (4.5:1 everywhere).
- D7 **Dial camera retired 2026-09-20**: Prompt A §5.2 (newest design
  authority) specifies the offset two-tier plateau with L lenses.
  CameraAssembly rebuilt as the plateau; film macro keys retargeted to the
  upper shelf; optics internals follow LENS_LAYOUT.

## Hard-won environment facts

- `npm.cmd`/`npx.cmd` only (`.ps1` blocked). `workers: 2`,
  `timeout: 60s`, `reuseExistingServer: false`. Local loop =
  `e2e:quick` (chromium); full matrix in CI. Always `build` before `e2e`.
- Axe must run after entrance motion settles (600ms) + fonts.ready.
- CLS tests: no `buffered:true`, wait for lazy chunk + fonts first.
- `react`/`react-dom` pinned exactly 19.2.8 (fiber caps <19.3).
- `vite.config.ts.bak`, `preview-log.txt` style debris: never commit
  (`*.log` ignored). Kill port-4173 listener before deleting its log.

## Open threads

- Prompt A+B DONE 2026-09-20 (uncommitted): plateau per newest spec
  (D7 dial retired), 5 finishes/families, 4-rail grain, studio env +
  RectArea rig + rear softbox, etched logo, punch-hole, subpixel LOD,
  explode.ts registry (22 parts) + per-part Internals loop, 6 new film
  states, ShotProfile caps + damped position/aim, chip/camera holds,
  lens-separation staging, callout system, port beat (approach rail
  traverse, ADR docs/adr/port-beat.md), match-cut window narrowed,
  cellGlow cap, transparent-from-birth, M9 static story under
  reduced-motion + skip-film + arrow-key act nav, M10 README/perf.md/
  sitemap/robots/JSON-LD/kitchen-sink/Lighthouse-CI/docs-adr. Full
  `npm run verify` green, e2e:quick 5/5, 97 unit tests green.
- Ring-hole bug + R3F aria-label + parallax-accumulation fixes noted
  below in prior entries; all covered by tests.
- Honest gaps: real-GPU traces (M10); reduced-motion e2e coverage;
  rack focus deferred to measurement (focusPull/macroAtmos wired to
  accent + sensor shimmer as the no-DOF path); sectionCut reserved;
  callouts show 1-2 labels at once by spec collision rule; LOD2/merged
  shell deferred with reasons in device-design.md.
- Secrets sweep clean for public push (no keys/tokens/emails in tracked
  files or history; handoff paths redacted). `scripts/m3r-shots.mjs`
  (one-command visual verification), `scripts/probe.mjs`,
  `scripts/shrink.mjs` are untracked dev tooling, not for deploy.
- Real-GPU 55fps trace (SwiftShader lower bounds only) → M10.
- `/dev/kitchen-sink`, sitemap/robots/JSON-LD, Lighthouse CI → M10.
- Reduced-motion static story layout → M9 (snap/opacity done).
- `SHELL_MATS`/`FRAME_MATS` must gain every Prompt A material key.
