# 재즈 화성학, 귀로 배우기

Interactive Korean web book based on the 2026 재즈 화성학 클래스 (최지훈). Live at https://doodle0.github.io/jazz-harmony-book/.

The source documents (`docs/`: the guide, course summary and implementation plan) are kept out of this repo.

## Commands

```sh
pnpm install
pnpm dev            # dev server (search is disabled in dev)
pnpm build          # static site in build/ + Pagefind search index
pnpm serve          # serve build/ on http://localhost:4173
pnpm test           # Vitest: theory, voicing, example sets, chapter <Hear> progressions
pnpm check          # svelte-check
BASE_PATH=/jazz-harmony-book pnpm build   # build for the GitHub Pages subpath (CI does this)
```

## Layout

| Path | What |
|---|---|
| `src/content/NN-slug.svx` | Chapters (mdsvex). The master copy of the prose; widgets are embedded as components |
| `src/lib/theory/` | Spelled pitches, chord parsing, `format.ts` (the only chord display path), Roman numerals, progressions, voicing, scales |
| `src/lib/audio/` | Lazy-loaded engine (smplr samples + a lookahead scheduler), synthesized drum kit, grooves per style |
| `src/lib/data/examples/*.json` | Example sets: one style + one analysis each, authored in Roman numerals so they play in any key |
| `src/lib/widgets/` | Widgets: WhyV7Pulls, SameSongAnyKey, IIVIExplorer, ModeBrightness, RubTest, DominantPalette, DeviceAB, Hear |
| `src/lib/stores/` | Player (one sound at a time, key/tempo/loop), settings, progress (localStorage) |
| `scripts/generate/` | Generators for example sets and widget placement |
| `scripts/check/` | Playwright screenshot helpers |

## Authoring

- Progressions: `"ii-7 V7 | IΔ7 | %"`. Bars are split by `|`, `%` repeats a bar, and `ii-7:3 V7:1` sets beats.
  Secondary functions (`V7/V`, `iiø7/vi`) and tritone subs (`subV7/ii`) work.
- Inline listening in prose: `<Hear prog="iv-7 | ♭VII7 | IΔ7" key="E♭" style="ballad" tempo={60} label="백도어" />`
- A/B device demo: `<DeviceAB set="backdoor" />`, which reads `src/lib/data/examples/backdoor.json`.
- Styles: swing, bebop, hard-bop, blues, ballad, waltz, bossa, samba, latin, modal, pad.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`: tests, a build with `BASE_PATH=/jazz-harmony-book`, then GitHub Pages.
