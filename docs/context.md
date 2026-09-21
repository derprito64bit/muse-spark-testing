# Session context (compact-safe — read this first after compaction)

## What this is

Aether One X v2 — fictional flagship product film site. Build repo:
`C:\Users\Aaron\aether-one-x-v2` (git `master`). Deploy repo:
`C:\Users\Aaron\Documents\GitHub\muse-spark-testing` (git `main`,
GitHub `derprito64bit/muse-spark-testing`, Vercel Hobby auto-deploys).
Sync ritual: work in build, copy excluding `.git node_modules dist
reference test-results playwright-report .playwright-mcp`, commit both,
push deploy.

## Prompt authority (date order — newest governs)

meta (09:52) → setup (09:54:37) → meta_1 (09:54:44) → device-model
(14:06) → **prompt-A (15:53:20, DESIGN bible)** → **prompt-B (15:53:22,
animation, newest overall)**. Design = **plateau camera** (offset 2-tier
squircle, L lenses), NOT dial (D7 retired). Repo already implements
Prompt A fully (thread ring, knurl, baffles, port — see CameraAssembly).
Blender build is a SIMPLIFIED subset: has body n=5, plateau tiers,
3 lenses, flash/rangefinder, obsidian-ish. Still missing vs A: thread
ring (96 teeth), collar knurling, barrel baffles, per-lens AR hues,
USB-C cavity + asymmetric rail, antenna bands, buttons/SIM/gaps,
other 4 finishes.

## State (all committed + pushed)

- Build: `ea6ecd2` + `07fcbc7`. Deploy: `0110aeb` pushed (`fc19f19..0110aeb`).
- Verify green: typecheck/lint/format/98 tests/build/analyze, e2e:quick 5/5.
- Secrets sweep clean (public-safe). Local paths redacted from handoff.

## Hard-won facts (do not relearn)

- Earcut drops dense holes in superellipse extrudes → ring is an explicit
  annulus; `ringHole.test.ts` guards it. Annulus loops must start at +X
  with monotone winding or the lid pinwheels (regression test exists).
- R3F `aria-label` on `<group>` throws on re-render → use `name`.
- Parallax must not accumulate inside damped aim (apply at lookAt).
- Film glass opacity was flat 0.42 (x-ray leftover) washing all faces;
  now tracks power state. Subpixel overlay must never enter SHELL_MATS
  (it pinned the macro overlay opaque = gray veil).
- `?t=` captures land short (layout shift) → `m3r-shots.mjs` re-scrolls
  after settle. Multi-viewer pages poison `window.__` probes.
- PowerShell: no heredocs, no `||`, use `npx.cmd`/`npm.cmd`/`px.cmd`,
  `>` corrupts binaries (UTF-16). Never use shell for file ops.
- `npm run verify` = typecheck+lint+format+test+build+analyze.
  Visual: `node scripts/m3r-shots.mjs` (9 views), `capture-film.mjs`
  (13 acts), `probe.mjs`, `crop/shrink/roll/survey.mjs` (untracked dev).
- GPU: RTX 3070 (CUDA+OPTIX), Ryzen 5600X. SwiftShader only for headless.

## Blender link (LIVE — use it for design renders)

- Blender 4.5.14 LTS (Steam) + MCP-for-Blender addon v1.7, protocol 9.
  Addon file also copied to 5.x config dirs; enabled via headless prefs.
- If link drops: Blender N-panel → BlenderMCP tab → Start MCP Server,
  then `blender_get_addon_status`.
- Scene state: `AetherOneX` collection, Cycles GPU (RTX 3070) 64spp +
  denoise, dark world, Key 400W / RimStrip 250W / Fill 80W / RearSoft 80W
  (raking from left). Phone built face-up (+Z = screen) from dimension
  tables: Body loft + BackGlass/FrontGlass lofts, ScreenOff/BackObsidian
  body cap slots (Screen slab deleted — it was buried), 2-tier plateau +
  3 L-lenses (collar/barrel/aperture/dome) + flash + rangefinder.
  Saved: `C:\Users\Aaron\AppData\Local\Temp\opencode\aether-one-x.blend`.
  Renders: `aether-hero/rear/rear2/rear3/rear4.png` (rear3 = best).
- Blender lessons: 2D-curve slabs render UNCAPPED (open tubes) — build
  solids with bmesh loft (4 rings + chamfer + triangle-fill caps) instead;
  solid body needs dark cap material under cover glass or metal shows
  through; big flat-on area light blows obsidian white — use dim raking
  light. Each execute_blender_code call is stateless — redefine helpers.

## Dimensions (meters, single source: phoneDimensions.ts)

Body 0.0768×0.1596×0.0078, BODY_N=5. Plateau upper-left at
(-0.0192, 0.052): lower 0.0342²×0.0011, upper 0.0262²×0.0019 offset
(-0.0032, +0.0028). Lenses (shelf-local): main r.0057 (-.005,+.0035),
ultra r.0057 (-.0045,-.0038), tele r.0046 (+.0045,-.0035). Finishes:
obsidian/titanium/glacier/ember/slate (phoneFinishes.ts).

## Honest gaps

Real-GPU traces, reduced-motion e2e, rack-focus DOF, callouts show 1–2
labels (spec collision rule), LOD2/merged shell deferred (see
docs/device-design.md). `/dev/*` DEV-guarded. Lighthouse CI untested
locally (runs in CI).
