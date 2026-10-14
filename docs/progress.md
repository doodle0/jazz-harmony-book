# Progress

Status of the web book against the plan (`docs/plan.md`). Update this file in the same change that moves an item. The author's rulings are in `docs/decisions.md`.

Status marks: ✅ done · 🟡 partial · ⬜ not started · ⏸ on hold

Last updated: 2026-10-15

## Phases (plan §10)

| Phase | Status | Notes |
|---|---|---|
| 0. Spike | 🟡 | Audio engine, voicing engine, `format.ts` and Why V7 Pulls are done. The "sound within 100 ms on a mid-range Android phone" check hasn't been measured on a real device. |
| 1. Shell | ✅ | Static site, TOC/settings/search drawers, mini-player (usual key + transpose, tempo, loop), label setting, 10 chapters from the Korean guide (its §5 split in two, see Departures), Pagefind. Deployed to GitHub Pages. |
| 2. Generation tooling | 🟡 | `scripts/generate/device-examples.py` and `place-widgets.py` exist; the example and `<Hear>` checks run in Vitest. Review is on the fly (decisions), so the `/review` page is optional. Not started: generation prompts, flagged-item workflow. |
| 3. Ch.1–2 widgets + grooves | 🟡 | Ch.1–2 ★ widgets are built and grooves exist for all style buckets (see below). The ballad groove was reworked after a listen (2-/4-feel bass, syncopated comping); the other grooves are first drafts nobody has listened to yet. |
| C. Content pass (audit) | ⬜ | New phase from the content audit (plan §10, §6.1). See "Content pass" below. Steps 1–2 come before more widgets. |
| 4. Tune data | ⬜ | No pipeline, tune library, LeadSheet player, or slide extraction yet. |
| 5. Ch.3–7 widgets | 🟡 | Dominant Palette, Three Minors and the ch.5–6 A/B device demos are built. The rest is not started. |
| 6. Reference + polish | ⬜ | Not started: PWA/offline, self-hosted samples, Lighthouse pass. Initial JS is ~72 KB gz, within budget. Reference cards and practice player wait on the ch.8–10 decision. |

## Widgets (plan §9)

The plan's catalog uses the book's 10 chapters: Tonicization meter and the ear trainer are in ch.6; Reharm Lab, Reharm Roulette, Progression Blocks and Versions Through Time are in ch.8. Ch.8–10 are on hold (decisions), so their rows (marked ⏸) aren't scheduled.

| Widget | Status | Notes |
|---|---|---|
| Hear It in the Wild | ⬜ | Needs tune data (phase 4) |
| ★ Self-check (`<Quiz>`) | ⬜ | New from the audit: 2–3 questions per chapter with hidden answers; can reuse `<Hear>` / DeviceAB as "이건 무슨 장치?" |
| Voicing Gallery | ⬜ | |
| Chord Characters | ⬜ | |
| ★ Same Song, Any Key | ✅ | 5 examples |
| ★ Why V7 Pulls | ✅ | 5 examples; "V7에서 멈추기" hold |
| Home-Away-Home Journey | ⬜ | |
| ★ ii-V-I Voicing Explorer | ✅ | Two instances in ch.1: root-position shells (1-3-7 / 1-7-3, with bass) and four-note rootless. A / B / A·B·A / B·A·B, form badge, ø7 ninth toggle, voice-leading ladder. Leads by step in all 12 keys (tested) |
| Guide-tone line | ⬜ | |
| ★ Mode Brightness Slider | ✅ | Circle of fifths, the changed note's mark glides to its new key; only the 특징음 is highlighted in the degree boxes. Shuffle examples are generic vamps, not the plan's per-mode settings yet. |
| ★ Rub Test | ✅ | Ratings, reveal, "기피음을 일부러" phrase, Corcovado link |
| Tension Heatmap | ⬜ | |
| How Many Keys | ⬜ | |
| Tension Builder | ⬜ | |
| Lydian/Dorian chord | 🟡 | Inline `<Hear>` only |
| Three Minors | ✅ | Natural / harmonic / melodic iv – V – i, raised notes highlighted, vibes run over the V bar, 5 examples |
| ★ Dominant Palette | ✅ | 7 scales, tension meter, vibes run |
| Scale Family Tree | ⬜ | |
| Tritone Twins | ⬜ | |
| ★ Scale Chooser drill | ⬜ | Promoted to ★ by the audit (ch.3 needs a drill) |
| ★ Downbeat Aligner | ⬜ | |
| ★ 6th-Diminished Harmonizer | ⬜ | Inline `<Hear>` of C6 ↔ Bo7 only |
| One-beat-early diminished | ⬜ | |
| ★ Syntax Tree Builder | ⬜ | |
| Progression Blocks | ⏸ | Ch.8–10 on hold |
| ★ Reharm Lab | ⏸ | Ch.8–10 on hold |
| Reharm Roulette | ⏸ | Ch.8–10 on hold |
| ★ Lead-Sheet Player | ⬜ | Needs tune data |
| V는 어디로 갈까? (ear trainer) | ⬜ | |
| Extended Dominants & Subs | 🟡 | Covered by the A/B demo `extended-dominants`; tap-to-sub not built |
| Tonicization meter | ⬜ | A/B demo `tonicization` exists |
| Versions Through Time | ⏸ | Ch.8–10 on hold |
| Sus vs -11 | 🟡 | Inline `<Hear>` only |
| Pentatonic ↔ sus on the circle | ⬜ | |
| ★ Modal Planing Pad | ⬜ | Needs quartal / So What voicings in the engine |
| Analysis walkthrough | 🟡 ⏸ | Inline `<Hear>` of *I'll Close My Eyes* only |
| Practice routine player | ⏸ | Ch.8–10 on hold |
| Reference cards | 🟡 ⏸ | Inline `<Hear>` pills under "패턴 → 해석" |
| Glossary (ch.10) | ⏸ | New from the audit: Korean ↔ English terms |
| Free-play Lab (`/lab`) | ⬜ | |

Extra (not in the plan's catalog): `DeviceAB`, an A/B/C demo used for 11 devices in chapters 5–6 (secondary dominant, sharp-four walkdown, dim substitution, tonicization, tritone sub, extended dominants, iii–♭III, chromatic ii-V, deceptive, modal interchange, backdoor), with 3–4 examples each in different styles. Also `<Hear>`, an inline listening pill used 33 times in the chapters.

## Engine and content

- ✅ Theory core: spelled pitches, chord parsing (lecture + tonal-style input), lecture-notation display, Roman numerals with secondary/sub, progressions, A/B voicings with voice leading, modes and dominant scales, avoid-note rule
- ✅ Grooves: swing, bebop, hard-bop/blues, ballad, waltz, bossa, samba, Afro-Cuban, modal, smooth jazz, funk, soul, pad (electric piano, organ, electric bass and muted guitar samples for the last three)
- ✅ Automatic checks: every example set and every chapter `<Hear>` progression plays in all 12 keys and displays in lecture notation (183 tests); every set has at most 5 examples
- ✅ Voicing engine voices the whole progression at once (shortest path over every chord's placements) with low-interval-limit penalties, so a guide-tone line can't run out of register partway through
- ✅ Two-hand "spread" voicing (root-shell-pretty: bass has the root, LH 3 and 7, RH 9/13/5 and written tensions); the default for settings-driven playback (설정 → 두 손)
- ⬜ Voicing styles beyond shell/rootless/close/spread: drop 2, quartal, So What, block, upper structure
- ⬜ Coverage report script (concept × style buckets)
- ⬜ Melody support (`MelodyExcerpt`) and the rights check
- ⬜ Staff view (VexFlow)
- ⬜ Per-section "들어봤어요" checkmarks; there is only one per chapter so far
- 🟡 Listening review: on the fly by the author (decisions). Only the ballad groove has had a pass so far.
- 🟡 Pedagogical content audit: written (`docs/reviews/2026-10-15-content-audit.md`) and accepted by the author. Its rules are now plan §6.1 and its tasks are 📝 items in plan §9; none of the fixes are applied yet (see "Content pass")

## Departures from the plan

- **`tonal` replaced by `src/lib/theory/pitch.ts`:** every tonal release on npm currently ships broken entry points.
- **Tone.js replaced by a small lookahead scheduler in `src/lib/audio/engine.ts`:** it supports tempo changes, swing, and mid-groove A/B swaps.
- **Drums are synthesized (Web Audio), not sampled:** smplr has no jazz kit.
- **Samples load from public CDNs (smplr/gleitz soundfonts):** self-hosting is pending (phase 6).
- **Copyright:** short real melody excerpts (4–16 bars) are allowed (decisions). Plan §8.5 updated.
- **Guide §5 split into two chapters:** ch.5 "스탠다드의 문법: 쪼개거나, 바꾸거나" (syntax tree and the general rule; secondary dominants, extended dominants, sharp-four walkdown, diminished and tritone substitution, iii–♭III, chromatic ii-Vs) and ch.6 "집으로 가는 다른 길" (tonicization, deceptive cadence, modal interchange, backdoor, each with a home image). Both were filled out from the class summary. The guide's §6–9 are now chapters 7–10. The plan was updated to the 10-chapter layout on 2026-10-15.
- **Messages file:** it lives at `src/lib/messages/ko.json`, not `src/messages/`.
- **No shadcn-svelte:** Bits UI plus small own components (`Sheet`, `Segmented`, `WidgetCard`). Plan §4 updated.
- **Examples are authored as Roman numerals** and resolved to a key at play time (`src/lib/music/example.ts`), instead of chord symbols run through `tonal`. Plan §3 updated.
- **Generic primitives instead of per-device widgets:** `DeviceAB` covers 11 devices and `<Hear>` pills stand in for several catalog widgets (Lydian/Dorian chord, Sus vs -11, 6th-diminished, analysis walkthrough). Plan §9.0 now says to prefer them, building a custom widget only when the interaction teaches something.
- **Grooves beyond the plan's jazz buckets:** smooth jazz, funk, soul and pad. Plan §2 now says they add variety but don't count toward style coverage.
- **Example sets are capped at 5** (a test enforces it). The plan only had a minimum of 3.
- **Phase order:** phase 5 work (Dominant Palette, Three Minors, device demos) came before phase 2 (tooling) and phase 4 (tune data). The plan now says phases may overlap.
- **Review is on the fly, not a queue:** all 66 examples are `generated` by AI (via `scripts/generate/`) and none are marked `approved`. The author reviews by reading and listening and reports fixes; plan §7 updated.
- **Tune-based examples are entered from memory:** about 18 examples name a real tune (*Misty*, *Four*, *I'll Close My Eyes*, …), but their changes came from memory, not from the slide grids (plan §8.3). The author reports errors as they find them.
- **Settings:** a `staff` toggle exists with no staff view behind it, and the default voicing is the two-hand "spread", not a choice for generated examples only.
- **"Every concept is audible" (principle 1) isn't met yet:** the central ideas of ch.4 (bebop lines) and ch.7 (quartal / So What) can't be heard, and ch.9 has no sound (on hold). The plan's content pass adds interim sounds for ch.4 and ch.7.

## Content pass (audit)

Tasks from `docs/reviews/2026-10-15-content-audit.md`, in its priority order, adjusted by the author's rulings of 2026-10-15. Line-level details are in the audit; where each task lives is in plan §9 (📝 items). Ch.8–10 parts are on hold.

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Factual and consistency fixes (audit §2) | ⬜ | Three Minors harmonic i-Δ7, splice root, 세 → 네 마디, ♯iv-7 note, ♭VII7 claim, 함정 문제 key, `chromatic-ii-v` latin/alice, 전위 등식, 11 on sus. On hold with ch.8–10: "보통은" (ch.8), *Nica's Dream* (ch.10). The *Fly Me* row waits on open question 1 |
| 2 | Prerequisites note + *Autumn Leaves* analysis frame | ⬜ | Note lists the prerequisites; song forms and pentatonics are mentioned as assumed familiar |
| 3 | Ch.1 about voicing: remove "텐션" / "기피음" vocabulary, keep the rootless section | ⬜ | |
| 4 | Self-check questions in every chapter | ⬜ | Needs `<Quiz>` |
| 5 | Remove line cliché (ch.10 table) and *Out of the Past* (ch.6, plus ch.8–10 if kept) | ⬜ | |
| 6 | Interim sounds for ch.4 (8th-note line, block chords) and ch.7 (functional vs modal A/B, quartal / So What stacks) | ⬜ | The 8th-note line needs note-level playback |
| 7 | Smaller notes (audit §3): ch.2 order, ch.3 load control, ch.5 tree + h3 headings, ch.6 h3 | ⬜ | Voice is case by case with the author. Ch.8 C-7 link, ch.9 routine and ch.10 glossary are on hold |

## Open questions

Plan §13 has the details; resolved questions move to `docs/decisions.md`.

1. *Fly Me to the Moon* exercise (ch.4): keep it as a written assignment, or replace it with the One-beat-early diminished A/B? (recommended: replace)
2. Chapters 8–10: keep, merge into an appendix, or drop?
3. Next focus after content-pass steps 1–2: more widgets (self-check, bebop, syntax tree) or tune data (phase 4)?
4. The course slide deck file for extracting chord grids (phase 4)
5. Grooves to polish first after a listening pass
6. Is a staff view wanted at all?
