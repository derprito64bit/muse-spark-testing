# Device performance (measured)

Prompt A section 11 recording. Triangle counts are exact, asserted in
`src/components/PhoneViewer/phoneBudget.test.ts` — every entry mirrors the
constructor arguments in `PhoneModel.tsx` / `CameraAssembly.tsx`, and the
test fails if the budget regresses.

## Triangles (2026-09-20 run)

| part             | LOD0 high  | LOD1 low                    |
| ---------------- | ---------- | --------------------------- |
| frameBody        | 5,116      | (halved sampling, in total) |
| frameRing        | 2,048      | (halved sampling, in total) |
| backSlab         | 828        | 828                         |
| glassSlab        | 828        | 828                         |
| displaySlab      | 828        | 828                         |
| logo             | 2          | 2                           |
| regulatory       | 2          | dropped                     |
| subpixel overlay | 2          | dropped                     |
| panel gaps       | 24         | 24                          |
| plateau module   | 15,674     | baffles ×1, no knurl/thread |
| edge hardware    | 4,400      | no tongue/contacts          |
| front sensors    | 168        | 168                         |
| **total**        | **29,920** | **22,180**                  |

- Budget: 120k LOD0. Headroom: 4×.
- LOD1 ("roughly 40k" in the brief): 22.2k — under target, so no further
  cuts were taken. Reduction comes from knurl (1,440), thread (1,152),
  second baffles, tongue/contacts, regulatory, and halved outline sampling.
- The plateau module is 52% of the total; the lens barrels and baffles are
  the densest parts and the first place to look if the budget tightens.

## Draw calls

~70 meshes for the full device at LOD0 (2 frame, ~38 dial including three
9-part lenses, ~24 edge hardware, ~7 glass/front). Instanced: knurl teeth
(120), thread teeth (96), speaker slots (6). Not draw-bound; the static
shell stays unmerged because the x-ray act parts the layers.

## Texture memory (~4MB)

| texture                             | size       | bytes      |
| ----------------------------------- | ---------- | ---------- |
| studio environment equirect + PMREM | 1024×512   | ~2,800,000 |
| display wallpaper                   | 256×512    | 524,288    |
| wordmark decal                      | 512×128    | 262,144    |
| ceramic mottle + data               | 128×128 ×2 | 131,072    |
| oleophobic smudge                   | 128×256    | 131,072    |
| regulatory micro-text               | 256×48     | 49,152     |
| brush grain                         | 64×64      | 16,384     |
| lens gloss                          | 64×64      | 16,384     |
| coating thickness                   | 64×64      | 16,384     |
| screen gradient                     | 16×256     | 16,384     |
| subpixel stripes                    | 96×32      | 12,288     |
| barrel gradient                     | 8×64       | 2,048      |

Shared where content is identical (one brush, one coating map, one mottle
pair per material set). `disposePhoneMaterials` covers every slot;
`SceneDisposer` frees geometries on unmount; the studio environment owns
and releases its PMREM target per canvas.

## Frame time

SwiftShader (software GL) lower-bounds only — see the open M10 thread for
the real-GPU 55fps trace. The film snapshot suite (`e2e/film.spec.ts`)
plus the budget test above are the merge gates until then.
