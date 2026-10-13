# Roadmap

Status of the web book against the implementation plan (`docs/web-book-plan.md`, kept local). Update this file as part of every change that moves an item.

Status marks: ✅ done · 🟡 partial · ⬜ not started

Last updated: 2026-10-13

## Phases (plan §10)

| Phase | Status | Notes |
|---|---|---|
| 0. Spike | 🟡 | Audio engine, voicing engine, `format.ts` and Why V7 Pulls are done. The "sound within 100 ms on a mid-range Android phone" check hasn't been measured on a real device. |
| 1. Shell | ✅ | Static site, TOC/settings/search drawers, mini-player (usual key + transpose, tempo, loop), label setting, 9 chapters from the Korean guide, Pagefind. Deployed to GitHub Pages. |
| 2. Generation tooling | ⬜ | Only `scripts/generate/device-examples.py` exists. Not started: `/review` page, generation prompts, flagged-item workflow. |
| 3. Ch.1–2 widgets + grooves | 🟡 | Ch.1–2 ★ widgets are built and grooves exist for all style buckets (see below). The ballad groove was reworked after a listen (2-/4-feel bass, syncopated comping); the other grooves are first drafts nobody has listened to yet. |
| 4. Tune data | ⬜ | No pipeline, tune library, LeadSheet player, or slide extraction yet. |
| 5. Ch.3–6 widgets | 🟡 | Dominant Palette and the chapter-5 A/B device demos are built. The rest is not started. |
| 6. Reference + polish | ⬜ | Not started: PWA/offline, self-hosted samples, Lighthouse pass. Initial JS is ~72 KB gz, within budget. |

## Widgets (plan §9)

| Widget | Status | Notes |
|---|---|---|
| Hear It in the Wild | ⬜ | Needs tune data (phase 4) |
| Voicing Gallery | ⬜ | |
| Chord Characters | ⬜ | |
| ★ Same Song, Any Key | ✅ | 5 examples |
| ★ Why V7 Pulls | ✅ | 5 examples; "V7에서 멈추기" hold |
| Home-Away-Home Journey | ⬜ | |
| ★ ii-V-I Voicing Explorer | ✅ | Shell / A / B / alternating, ø7 ninth toggle, voice-leading ladder |
| Guide-tone line | ⬜ | |
| ★ Mode Brightness Slider | ✅ | Circle of fifths, changed-note flash. Shuffle examples are generic vamps, not the plan's per-mode settings yet. |
| ★ Rub Test | ✅ | Ratings, reveal, "기피음을 일부러" phrase, Corcovado link |
| Tension Heatmap | ⬜ | |
| How Many Keys | ⬜ | |
| Tension Builder | ⬜ | |
| Lydian/Dorian chord | 🟡 | Inline `<Hear>` only |
| Three Minors | 🟡 | Inline `<Hear>` only |
| ★ Dominant Palette | ✅ | 7 scales, tension meter, vibes run |
| Scale Family Tree | ⬜ | |
| Tritone Twins | ⬜ | |
| Scale Chooser drill | ⬜ | |
| ★ Downbeat Aligner | ⬜ | |
| ★ 6th-Diminished Harmonizer | ⬜ | Inline `<Hear>` of C6 ↔ Bo7 only |
| One-beat-early diminished | ⬜ | |
| ★ Syntax Tree Builder | ⬜ | |
| Progression Blocks | ⬜ | |
| ★ Reharm Lab | ⬜ | |
| Reharm Roulette | ⬜ | |
| ★ Lead-Sheet Player | ⬜ | Needs tune data |
| V는 어디로 갈까? (ear trainer) | ⬜ | |
| Extended Dominants & Subs | 🟡 | Covered by the A/B demo `extended-dominants`; tap-to-sub not built |
| Tonicization meter | ⬜ | A/B demo `tonicization` exists |
| Versions Through Time | ⬜ | |
| Sus vs -11 | 🟡 | Inline `<Hear>` only |
| Pentatonic ↔ sus on the circle | ⬜ | |
| ★ Modal Planing Pad | ⬜ | Needs quartal / So What voicings in the engine |
| Analysis walkthrough | 🟡 | Inline `<Hear>` of *I'll Close My Eyes* only |
| Practice routine player | ⬜ | |
| Reference cards | 🟡 | Inline `<Hear>` pills under "패턴 → 해석" |
| Free-play Lab (`/lab`) | ⬜ | |

Extra (not in the plan's catalog): `DeviceAB`, an A/B/C demo used for 11 chapter-5 devices (secondary dominant, sharp-four walkdown, dim substitution, tonicization, tritone sub, extended dominants, iii–♭III, chromatic ii-V, deceptive, modal interchange, backdoor), with 3–4 examples each in different styles. Also `<Hear>`, an inline listening pill used 33 times in the chapters.

## Engine and content

- ✅ Theory core: spelled pitches, chord parsing (lecture + tonal-style input), lecture-notation display, Roman numerals with secondary/sub, progressions, A/B voicings with voice leading, modes and dominant scales, avoid-note rule
- ✅ Grooves: swing, bebop, hard-bop/blues, ballad, waltz, bossa, samba, Afro-Cuban, modal, pad
- ✅ Automatic checks: every example set and every chapter `<Hear>` progression plays in all 12 keys and displays in lecture notation (158 tests)
- ⬜ Voicing styles beyond shell/rootless/close: drop 2, quartal, So What, block, upper structure
- ⬜ Coverage report script (concept × style buckets)
- ⬜ Melody support (`MelodyExcerpt`) and the rights check
- ⬜ Staff view (VexFlow)
- ⬜ Per-section "들어봤어요" checkmarks; there is only one per chapter so far
- ⬜ Listening review: nobody has judged the grooves, drum sounds or example choices by ear yet

## Departures from the plan

- **`tonal` replaced by `src/lib/theory/pitch.ts`:** every tonal release on npm currently ships broken entry points.
- **Tone.js replaced by a small lookahead scheduler in `src/lib/audio/engine.ts`:** it supports tempo changes, swing, and mid-groove A/B swaps.
- **Drums are synthesized (Web Audio), not sampled:** smplr has no jazz kit.
- **Samples load from public CDNs (smplr/gleitz soundfonts):** self-hosting is pending (phase 6).
- **Copyright:** short real melody excerpts (4–16 bars) are allowed, which loosens plan §8.5. No lyrics, full heads or downloads.
- **Messages file:** it lives at `src/lib/messages/ko.json`, not `src/messages/`.

## Decisions

- Hosting: GitHub Pages at https://doodle0.github.io/jazz-harmony-book/ (base path set in CI). `docs/` stays out of the repo.
- Design: the "jazz club poster" look.
- The author of the lecture and slides (최지훈) is the project owner. Their calls on content and analysis are final, and slide analyses are ground truth.

## Open questions

1. Next focus: `/review` tooling (phase 2) or more widgets (bebop, syntax tree, reharm lab)?
2. The course slide deck file for extracting chord grids (phase 4)
3. Grooves to polish first after a listening pass (plan §13.3)
4. Is a staff view wanted at all? (plan §13.4)
