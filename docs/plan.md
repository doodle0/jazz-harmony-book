# Interactive Jazz Harmony Web Book: Implementation Plan

This is the living spec: update it when a decision changes the target. Status lives in `docs/progress.md`, the author's rulings in `docs/decisions.md`, and the source documents in `docs/reference/` (local only).

## 1. Goal

Turn the *Jazz Harmony Practical Guide* (`jazz-harmony-practical-guide.ko.md`) into a Korean interactive web book. Readers should get a **musical gut feeling** for each concept by hearing it and changing it, not by reading about it. Every concept should be heard **across many examples in different jazz styles**.

The book is **non-commercial**. Most content (original examples, analyses, prose adaptation, illustrations) is **generated with AI** and reviewed afterwards; weak results get fixed in later passes rather than blocking the build.

### Product principles

1. **Every concept is audible.** Each section has at least one example that makes a sound with one tap.
2. **Tinker, don't perform.** Readers never need to play an instrument or hit notes in time. They choose, toggle, compare, shuffle and listen.
3. **A/B is the core interaction.** Most widgets put "before" and "after" side by side (V vs V7, Ionian vs Lydian, G7 vs D♭7, written changes vs reharmonized) so the difference is heard, not explained.
4. **Many examples, many styles** (see §2). Each example has one style and one analysis; the variety comes from having lots of examples that span jazz styles.
5. **Mobile first, desktop identical.** Same layout and the same interactions everywhere: single taps, single-finger drags, no hover-only information, no keyboard shortcuts, no multi-touch gestures. Desktop shows the same centered column.
6. **Usual key first, any key on request.** Examples start in the tune's usual key (as played in the lecture); the reader can transpose the current example.
7. **The lecture's notation.** Chord symbols, Roman numerals and terms follow the course and guide exactly (§3).
8. **Static and portable.** The build output is plain static files, deployable to any static host and usable offline.

**Source content** (in `docs/reference/`, immutable):
- **Prose:** `practical-guide.ko.md`, 9 sections. The book now has **10 chapters**: guide §5 became ch.5 "스탠다드의 문법" and ch.6 "집으로 가는 다른 길", so guide §6–9 are ch.7–10. The `.svx` chapters are the master copy; the guide is no longer re-imported.
- **Background:** `course-summary-2026-winter.md`, the course summary with lecture notes. Use it for extra examples and the lecturer's remarks.
- The English guide (`practical-guide.en.md`) is reference only.
- **Review:** `docs/reviews/2026-10-15-content-audit.md`, a pedagogical audit accepted by the author. Its rules are folded into §6.1 and its tasks into §9 and §10; that file keeps the line-level findings.

**Audience and prerequisites:** readers already know intervals, chord construction, Roman numerals, basic progressions, the ii-V-I and the blues form. Ch.1 reviews these only to align terms. Song forms (AABA, ABAC) and pentatonics are not formal prerequisites, but readers are implied to know them: mention them freely without teaching them. Everything else, including tensions and altered tensions, is taught before it is used (§6.1).

**Chapters 8–10 are tentative.** Workflow, practice routines and quick reference feel auxiliary, and the author hasn't decided whether to keep them. Don't build widgets or do content work for them until that's decided (§13).

**Decided scope:**
- **Language:** Korean only. i18n is deferred, and UI strings are kept in one messages file so it can be added later.
- **Browser:** Chrome only, on desktop and Android. iOS and other browsers are deferred.
- **Accessibility:** basics only (§4); a full pass is deferred.
- **Licensing:** handled case by case as sources are added; copyright rules for melodies are fixed (§8.5).

---

## 2. Example diversity across jazz styles

A concept heard in only one setting gets tied to that sound. Hearing a backdoor in a bebop head, a bossa and a ballad teaches the *function*.

**Rules:**
- **One example = one style + one analysis.** Each example is fixed: its own groove, tempo, instrumentation, usual key and a single Roman-numeral reading. There is no style switcher; to hear another style, the reader moves to another example.
- **Each concept gets several examples** from different styles: at least 3 for every ★ concept, differing in style and ideally in era or tempo. A set holds **at most 5** (enforced by a test); more belong in Hear It in the Wild.
- **🎲 Shuffle** on a widget jumps to another example of the same concept, usually in a different style.

**Style buckets (all within jazz):**

The build also has jazz-adjacent grooves (smooth jazz, funk, soul, and a pad for drones). Use them for variety, but they don't count toward a concept's style coverage.

| Style | Typical groove and sound |
|---|---|
| Swing / Tin Pan Alley standard | 4/4 swing, walking bass, brushes or ride |
| Bebop | fast swing, sparse comping, ride |
| Hard bop / soul jazz | medium swing or shuffle, bluesy comping |
| Ballad | slow, rubato-ish comping, brushes |
| Jazz waltz | 3/4 swing |
| Blues | 12-bar, swing or shuffle |
| Bossa nova | nylon guitar or piano comping, 2-feel bass, brushes/rim |
| Samba / Brazilian jazz | faster 2-feel, partido-alto-style comping |
| Afro-Cuban / Latin jazz | montuno comping, tumbao bass, clave-based percussion |
| Modal / post-bop | vamps, quartal pads, straight or swung 8ths |

**Coverage report:** a script lists, per concept, how many examples it has and which style buckets they cover. It flags concepts whose examples all share one style. It is informational and doesn't fail the build.

---

## 3. Notation and naming conventions

Everything displayed follows the course and the Korean guide.

| Item | Convention | Examples |
|---|---|---|
| Chord qualities | `Δ7` `-7` `7` `ø7` `o7`, tensions in parentheses separated by commas, `alt`, `sus`, `+` | CΔ7, D-7, G7(♭9, ♭13), Bø7, C7alt, C7sus, C+7 |
| Roman numerals | case follows the 3rd; accidentals relative to the key; written **below** the chord symbols | IΔ7, ii-7, V7, ♭VII7, ♯ivø7, iii-7 |
| Secondary / substitute functions | slash read as "of"; `subV7` for tritone subs | V7/V, iiø7/vi, subV7/ii |
| Note (pitch) names | **letters** with ♯/♭ | C, F♯, B♭ |
| Solfège | **도 레 미 파 솔 라 시**, movable do (key-relative), as the lecture uses it (e.g. "in A, D is 파 and G♯ is 시"). Chromatic notes take ♯/♭ (♭시, ♯파) | |
| Scale degrees (음도) | 1 2 ♭3 … and tensions 9 ♯11 ♭13; scale formulas and chord-tone lists stay space-separated (1 3 5 ♭7) | |
| Terms | the guide's Korean terms; ch.10 has a Korean ↔ English glossary | 기피음, 으뜸음화, 위종지, 트라이톤 대체, 세컨더리 도미넌트, 백도어 진행, 샤프 포 워크다운 |

`lib/theory/format.ts` is the only place that formats chords for display. Chords are parsed by the project's own `lib/theory/pitch.ts` and `chord.ts` (`tonal` was dropped, see the roadmap); example progressions are authored as Roman numerals and resolved to a key at play time.

Labels setting (Settings drawer): **degrees** (default) / **note names** / **도레미**.

---

## 4. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **SvelteKit + Svelte 5 (runes)**, TypeScript | `@sveltejs/adapter-static`, `prerender = true` everywhere |
| Content | **mdsvex** | Chapters are Markdown with embedded Svelte components |
| Styling | **Tailwind CSS v4** | Design tokens as CSS variables, light/dark |
| UI components | **Bits UI** plus small own components (`Sheet`, `Segmented`, `WidgetCard`) | shadcn-svelte was not adopted; add a Bits UI primitive when a widget needs one |
| Icons | **@lucide/svelte** | |
| UI strings | one `lib/messages/ko.json` | Keeps the door open for Paraglide later |
| Music theory | own `lib/theory/*` (pitch, chord, roman, progression, scales, voicing) | Replaced `tonal`, whose npm releases ship broken entry points |
| Audio engine | **smplr** (sampled instruments) + own lookahead scheduler (`lib/audio/engine.ts`) + synthesized drums | Replaced Tone.js; supports tempo changes, swing and mid-groove A/B swaps. Lazy-loaded on first play |
| Notation | **VexFlow** | Optional staff view; lazy-loaded. Most widgets use the piano view instead |
| Tree layout | **d3-hierarchy** | Syntax-tree widget; rendered as Svelte SVG |
| Motion | `svelte/motion`, `svelte/transition` | |
| Search | **Pagefind** | Static full-text search |
| Offline | **@vite-pwa/sveltekit** | Precache shell; cache audio samples on first use |
| Tests | **Vitest** (theory, voicing, analyzer, format, grooves), **Playwright** (Chromium, desktop + Android phone viewports) | |
| Deploy | GitHub Pages / Cloudflare Pages / Netlify | Any static host; set `paths.base` if served from a subpath |

**Performance budget:**
- **JavaScript:** the initial route stays under 150 KB gzipped. Audio code loads only after the first "play" tap.
- **Samples:** load per instrument and per drum kit, on first use by an example. Start with a light sample set (~2–4 MB piano) and upgrade later.
- **Hosting:** self-host all samples so the site works offline.

---

## 5. UX shell (mobile-first, identical on desktop)

```
┌──────────────────────────────┐
│ ☰  2. 모드와 코드-스케일      🔍 │  ← top bar: TOC drawer, chapter title, search
├──────────────────────────────┤
│  prose …                     │
│  ┌────────────────────────┐  │
│  │  WIDGET (card)         │  │  ← every widget is a full-width card
│  │  보사노바 · 1963         │  │  ← style tag of the current example
│  │  [▶ 듣기] [A|B] [🎲]    │  │  ← hear, compare, next example
│  └────────────────────────┘  │
│  prose …                     │
├──────────────────────────────┤
│ ▶ ii-V-I  E♭ (원키) ▾ ⟲ ♩120 │  ← sticky mini-player: current sound, key, loop, tempo
└──────────────────────────────┘
```

- **Single column**, max width ~640 px, centered on desktop. No separate desktop layout.
- **TOC** is a left Drawer on every screen size. **Settings** (bottom Drawer):
  - volume
  - labels: degrees / note names / 도레미
  - staff view on or off
  - voicing style for generated examples
- **Mini-player** is always visible: it shows what is playing, with stop/loop, tempo and the key.
  - The key starts at the example's **usual key** (marked 원키). Changing it transposes the current example only, and the next example starts in its own usual key again.
  - Starting any widget takes over the mini-player, so only one sound plays at a time.
- **Style tag** on each widget card shows the current example's style (and era if it's a real tune).
- **Touch targets** at least 44 px; segmented controls instead of dropdowns where possible; sliders use large thumbs and snap to musical values.
- **Inline listening pill** (`<Hear>`): a one-tap sound inside a sentence, for chords and short progressions that don't need a whole card.
- **Audio unlock:** the first tap on a play control resumes the AudioContext; show a one-time "탭해서 소리 켜기" hint.
- **Progress:** each section has a "들어봤어요" checkmark, stored in `localStorage` (wrapped in try/catch). It tracks listening only; understanding is checked by the self-check questions (§9.0). No accounts, no analytics, no server.
- **Accessibility (basics only):** highlights use labels as well as color (chord tone / tension / avoid / character note); controls have accessible names. Full a11y work is deferred.

---

## 6. Project structure

```
src/
  routes/
    +layout.svelte              # shell, drawers, mini-player
    +page.svelte                # cover / TOC
    [chapter]/+page.svelte      # loads the mdsvex chapter
    tunes/+page.svelte          # tune library, filterable by style and device
    tunes/[id]/+page.svelte     # lead-sheet player
    lab/+page.svelte            # free-play sandbox
    review/+page.svelte         # dev-only review queue (excluded from production build)
  content/
    01-function.svx … 10-reference.svx
  lib/
    audio/       engine.ts, instruments.ts, scheduler.ts, grooves/*.ts
    theory/      voicing.ts, voiceLeading.ts, scales.ts, roman.ts, analyzer.ts, format.ts
    widgets/     (one folder per widget, see §9)
    components/  PianoKeys, Staff, CircleOfFifths, LeadSheet, TensionMeter,
                 ABToggle, HearButton, ShuffleButton, StyleTag
    stores/      settings.svelte.ts, player.svelte.ts, progress.svelte.ts
    data/
      tunes/*.json             # normalized chord charts (see §8)
      tunes.schema.ts
      examples/*.json          # widget example sets (each with its style)
    messages/ko.json           # UI strings
scripts/
  tunes/                       # build-time tune data pipeline (see §8)
  generate/                    # AI generation scripts and prompts (see §7)
  check/                       # theory checks, rights check, coverage report
static/
  samples/                     # self-hosted instrument and drum samples
```

**Content authoring:**
- The `.svx` chapters are created once from `jazz-harmony-practical-guide.ko.md` and are the master copy from then on.
- Each chapter mixes Markdown prose with Svelte components, e.g.

```svelte
## 리디안과 도리안에는 기피음이 없다

리디안의 2·4·6도는 1·3·5도의 온음 위에 있습니다. 직접 들어 보세요.

<RubTest chord="CΔ7" scales={['ionian', 'lydian']} />

그래서 재즈 연주자들은 Δ7에 **리디안**을 훨씬 자주 씁니다.

<InTheWild device="lydian-tonic" count={4} />
```

Widget props use Roman numerals or chord symbols in the guide's notation. `examples="…"` points to an example set in `data/examples/`, where each entry fixes its own style, groove, tempo, usual key and instrumentation.

### 6.1 Teaching rules

These come from the content audit (`docs/reviews/2026-10-15-content-audit.md`). Apply them to every new or edited chapter, widget text and example set.

1. **Teach before use.** A term, chord symbol or scale that isn't a prerequisite (§1) is explained before or where it first appears. If the full treatment comes later, give a one- or two-line preview with a forward link. Never assume tensions or altered tensions. Song forms and pentatonics may be mentioned without teaching (§1).
2. **Name the analysis frame.** When minor-key material is read against the relative major (for scale choice) rather than the minor tonic, say so in one sentence. A `<Hear>` pill and the prose next to it use the same frame.
3. **One definition per device.** Each device is defined in one place. Variants used elsewhere (♯iv-7 vs ♯ivø7, ø7 before a major target) are pointed out where they occur. When one passage gets two readings, say so and cross-link both.
4. **Rules stay as soft as the book makes them.** Later chapters don't restate a softened rule as absolute ("기피음은 피한다" → "보통은", with a link to ch.2's "규칙 위의 규칙"). Absolute claims carry their exceptions ("dominant 11 is an avoid note, except in sus chords, §7").
5. **Examples demonstrate exactly the device.** Every variant in a set shows the device its set teaches, labels describe what is actually played, and counts in the prose (bars, notes) match the examples.
6. **Stay in one key for a worked argument.** A demonstration that starts in C finishes in C.
7. **Every chapter is audible and checkable.** Each chapter has at least one sound per section and **2–3 self-check questions with hidden answers** (§9.0). A "생각해 보기" always has an answer somewhere.
8. **Headings make a usable TOC.** Repeated section names such as "실전 적용" are h3 under their topic, never repeated h2.
9. **Load control.** Dense chapters (ch.3) open with a "먼저 이것만" priority list and end with a drill.
10. **Voice.** Prefer direct address to the reader. Many "강의자는…" passages are the author's own opinions, so they are decided case by case with the author rather than rewritten in bulk.
11. **Exercises are realistic.** A practice routine states its time split, and long programs are broken into weeks.

---

## 7. AI-assisted content production

Most content is generated with AI first, checked automatically, and reviewed by a person later. Generation never blocks the build; low-quality items are flagged and fixed in later passes.

**What is generated:**

| Content | Output format | Automatic checks |
|---|---|---|
| Chapter `.svx` files from the Korean guide (prose + component placement) | mdsvex | builds; every component name and prop is valid; every `<Hear>` progression plays in 12 keys; teaching rules (§6.1) checked in a review pass |
| Example sets for each widget (progressions, keys, styles, tempos) | `examples/*.json` | chords parse; notation matches §3; style coverage per concept |
| Original melodies, licks and contrafacts over standard changes | `MelodyExcerpt` JSON (tier `original`) | notes fit the chords (chord tones on strong beats, no unintended avoid notes), playable range, length |
| Groove patterns per style | `grooves/*.ts` data | meter and length; render a test loop |
| Voicings for the core examples | note arrays | match the guide's voicing tables; voice-leading distance |
| Roman-numeral analyses and device spans for tunes | `annotations/<id>.yaml` | cross-checked against the rule-based analyzer; disagreements flagged |
| Short Korean explanations (device notes, widget summaries) | strings in example/tune files | length limits |
| Chord Characters illustrations | SVG | original characters only (see §8.5) |

**Prompting rules:**
- Prompts include the guide section, §3's notation rules and the target JSON schema.
- Melodies must be **original**: prompts forbid quoting or paraphrasing existing tunes or recorded solos. Generated melodies are labeled "AI-generated original".
- The slide analyses (§8.3) are given as ground truth wherever they exist.

**Status and review:**
- Every generated item carries `status: 'generated' | 'flagged' | 'approved'` and the model/prompt version used.
- Items that fail an automatic check are `flagged`.
- **Review happens on the fly:** the author listens while reading the live book and reports what to fix, including wrong changes in tune-based examples. There is no review queue to clear before shipping. A dev-only **`/review`** page (items by status, one-tap play, Approve / Regenerate / Edit) is optional and only worth building if on-the-fly review stops keeping up.
- Production builds include `generated` and `approved` items. `flagged` items are hidden, and their widget falls back to another example.

---

## 8. Tune data: collecting the standards' chord changes

### 8.1 Tunes referenced in the course

| Tune | Used for (guide §) | Scope to include |
|---|---|---|
| All of Me | Roman numerals in 3 keys (1) | first 8 bars |
| Just Friends | non-diatonic numerals (1); chromatic ii-V homework (5.3) | full form* |
| Confirmation | finding ii-Vs (1, 5.1) | full form* |
| Autumn Leaves | chord-scale mapping (2) | full form* (G minor, the lecture's key) |
| Corcovado | "avoid notes in melody" (2) | link to recording only |
| Fly Me to the Moon | bebop harmonization (4); one-beat-early diminished | first 8 bars |
| We Wish You a Merry Christmas | secondary dominants (5.1) | full (public domain) |
| But Not for Me, Take the A Train | V7/V (5.1) | relevant 4–8 bars |
| Misty | v-7 → IV, backdoor, deceptive (5.1, 5.4, 5.6) | first 8 bars |
| It Could Happen to You | secondary ii-V, dim substitution (5.1) | first 8 bars, in 4 reharm versions (as in the slides) |
| I'll Close My Eyes | sharp-four walkdown; worked example (5.1, 7) | full form* |
| Yours Is My Heart Alone, Stella by Starlight | ♯ivø7 → iii (5.1) | 4 bars |
| If I Were a Bell, All the Things You Are | tonicization to III (5.2) | relevant 8–16 bars |
| On Green Dolphin Street | tonicization via circle of fifths (5.2) | full form* (E♭, the usual jam key) |
| The Girl from Ipanema | tritone sub (5.3) | first 8 bars |
| Sweet Lorraine | extended dominants (5.3) | first 8 bars + simplified version |
| Four, How High the Moon, Celia | iii–♭III–ii–V–I (5.3) | last 4 bars |
| Four, Blues for Alice, Ask Me Now, Stablemates, This I Dig of You | chromatic ii-Vs (5.3) | relevant bars |
| Ceora | deceptive cadence (5.4) | full form* |
| Yardbird Suite | backdoor (5.6) | first 8 bars |
| Spain | Phrygian dominant (3) | intro harmony only |
| So What, Maiden Voyage, My Favorite Things, Mahjong | modal (6) | harmonic outline only |
| Nardis, Naima, Yes or No, Speak No Evil, Nica's Dream | modal study list (6) | link to recordings only |

\* Chord progressions themselves are free to use, so "full form" depends only on the source dataset's terms (§8.5); if unsure, use the lecture excerpt or re-enter the changes from the slides. Every row above is **chords only**; melodies follow the tiers in §8.5.

**Usual keys:** each tune is stored in its usual performance key. Where the lecture points out that the Real Book differs from the usual jam key, use the jam key and mention the Real Book key in the tune note. Examples: *Autumn Leaves* in G minor, *On Green Dolphin Street* in E♭.

### 8.2 Widening the library across styles

The lecture's list leans toward swing-era standards and bebop/hard bop. The library extends it so every device can be heard in several of the style buckets from §2, especially **bossa/samba, Afro-Cuban/Latin jazz, ballads, waltzes, blues and modal tunes**. Tunes are selected from the open corpora (§8.3), chord data only.

**Coverage axes:**
- style bucket (§2)
- era: pre-1940 · 1940s–50s · 1960s · 1970s and later
- form: AABA · ABAC · blues · vamp · other
- meter: 4/4 · 3/4
- tempo: ballad · medium · up

**Curation rules:**
- Every ★ concept aims for **at least 3 library examples** in **at least 2 style buckets**.
- The coverage report lists the style buckets each concept still lacks.
- Style and era labels come from the source datasets where available; AI fills gaps; a person spot-checks them during review.

### 8.3 Sources (preferred order)

1. **The course slides themselves.** The deck already contains chord grids with Roman numeral analysis for *I'll Close My Eyes*, *It Could Happen to You* (4 versions), *If I Were a Bell*, *All the Things You Are*, *On Green Dolphin Street*, *The Girl from Ipanema*, *Sweet Lorraine*, *Four*, *Blues for Alice*, *Ceora*, *Yardbird Suite* and *Misty*. Extract them with `markitdown` (the tables come out as Markdown). They already carry the lecturer's analysis, so they are the **ground truth for annotations** and are marked `approved` from the start.
2. **Jazz Harmony Treebank** (Harasim, Finkensiep, Rohrmeier; DCMLab, GitHub). Chord sequences for ~150 standards **with syntax-tree annotations** based on the Rohrmeier grammar the course cites. It's a natural fit for the syntax-tree widget (§9, ch.5).
3. **ChoCo – the Chord Corpus** (de Berardinis et al., 2023). Harmonized JAMS/JSON-LD aggregating many datasets (including iReal-derived and JAAH partitions), with per-partition licenses.
4. **iRb corpus** (Broze & Shanahan): ~1,200 standards in Humdrum `**jazz` format, derived from iReal Pro. Broad coverage across styles.
5. **iReal Pro community playlists** (`irealb://` links; the Jazz, Latin and Brazilian playlists help fill the bossa/Latin buckets), parsed with `ireal-reader` or `ireal-musicxml`. Fallback for tunes missing elsewhere.
6. **JAAH / Weimar Jazz Database:** audio-aligned changes. Useful for "this is what the recording does" variants, e.g. different versions of *Sweet Lorraine*.

**Not allowed:** scraping commercial lead-sheet sites or fake-book PDFs, ingesting melodies or solos from any dataset, or ingesting lyrics. The pipeline reads **harmony only**. Melodies enter the project only through the tiers in §8.5.

### 8.4 Pipeline (`scripts/tunes/`, build time only, never at runtime)

```
fetch ──► parse ──► normalize ──► validate ──► analyze ──► mine ──► annotate (AI) ──► emit
```

1. **fetch:**
   - Download pinned dataset releases (git tag or commit SHA) into `scripts/tunes/.cache/`.
   - Record each source and its stated license in `sources.yaml`.
2. **parse** (one adapter per source):
   - JHT JSON
   - ChoCo JAMS
   - Humdrum `**jazz`
   - iReal URL
   - slide Markdown tables
3. **normalize** into the internal schema (§8.6):
   - Unify chord syntax and convert to the §3 notation.
   - Split bars and beats; label sections (A/B/C) and repeats.
   - Store each tune in its usual key (§8.1).
   - Attach style, era, form, meter and tempo metadata.
4. **validate:**
   - Every symbol must parse with `tonal`.
   - Bar counts must match the form (32 for AABA and so on).
   - Cross-check tunes that appear in several sources; flag disagreements.
   - **Rights check** (§8.5): any `melody` must have a tier and stay within that tier's bar limit. This is the one check that fails the build.
5. **analyze:** a rule-based analyzer proposes Roman numerals and device spans using the guide's **"Pattern → reading"** table (guide §9) as rules:
   - ii-V detection (X-7/Xø7 → Y7 a 4th apart)
   - target resolution (I / secondary / deceptive)
   - tritone sub (dominant a half step above its target)
   - chromatic ii-V chains
   - iii–♭III–ii–V
   - backdoor (iv-7 ♭VII7 I)
   - sharp-four walkdown
   - o7 a half step below the next chord (rootless V7♭9)
   - tonicization candidates (a ii-V-I to a non-diatonic major chord held for 2 bars or more)
6. **mine ("in the wild"):** run the analyzer over the **whole corpus** to find more instances of every device. Then choose a sample per device that spreads across style buckets, eras and tempos (a greedy max-coverage pick), so readers see a backdoor in a bossa, a ballad and a hard-bop tune rather than three bebop heads.
7. **annotate (AI):**
   - An AI pass writes the final single reading and short Korean device notes, given the analyzer's proposal and, where present, the slide analysis.
   - If the AI reading and the analyzer disagree, the item is `flagged` for review (§7).
   - Slide analyses always win.
8. **emit:** `src/lib/data/tunes/<id>.json`, plus an index file and per-device "in the wild" lists.

The analyzer also drives a **"ii-V 찾기" exercise**: hidden annotations the reader reveals bar by bar.

### 8.5 Copyright and attribution policy

This follows general guidance on music excerpts in teaching material, applied to a **non-commercial** project. It isn't legal advice. Dataset licenses are handled case by case as sources are added.

**Key fact:** in jazz, 16 bars is not a small excerpt. Most standards are 32-bar AABA forms, so 16 bars is half the tune. Because the A sections repeat, 16 bars often contain the **entire melody**, and a 12-bar blues head fits completely. Bar limits for copyrighted melodies are therefore much tighter than for anything else.

**What can be used, by content type:**

| Content | Rule in this book |
|---|---|
| **Chord progressions** (no melody) | Free to use. This is most of the book: lead sheets, Hear It in the Wild, the syntax tree, the reharm lab. |
| **Original material** (AI-generated or hand-written melodies, lines, licks, contrafacts over standard changes, voicings, grooves) | Free to use, no length limit. This is the default for anything melodic. |
| **Public-domain tunes** | Melody allowed, **up to 16 bars** per example, in the lesson. The tune must be public domain in **both the US and Korea** (see below). |
| **Melody of a copyrighted standard** | Allowed as a **short excerpt (4–16 bars, as the lesson needs)**, surrounded by the analysis so the explanation is the main content, and always attributed. May be entered by AI or from memory, then reviewed by the author. *(Loosened from the original 8-bar, hand-entry-only rule by the author on 2026-10-13.)* |
| **Recorded solos** (Parker, Coltrane, …) | Not transcribed or reproduced. Solos are the soloist's protected expression. Link to the recording at a timestamp instead. |
| **Lyrics** | Never. |

**Public-domain check (per tune, recorded in `rights`):**
- **US:** as of 2026, generally works published before 1931 (1930 works entered the public domain on Jan 1, 2026).
- **Korea:** life of the author + 70 years. Composers who died in 1962 or earlier are generally public domain, because the term was life + 50 before the 2013 extension. For co-written music, the last surviving composer counts.
- When either country is unclear, treat the tune as copyrighted.
- Candidates to verify for melody-based widgets: *I Got Rhythm*, *Someone to Watch Over Me*, *Tea for Two*, *St. Louis Blues*, *Sweet Lorraine* (also a lecture tune).

**Delivery format:**
- Examples are **embedded in lessons with commentary** and rendered as sound in the browser.
- **No downloads or exports** of tune content: no MIDI, MusicXML, audio files or printable lead sheets.
- Share links (Reharm Lab, Progression Blocks) encode **chords only**.
- Tier-limited melodies are stored with the example that uses them, not as standalone files in the tune library.

**Other rules:**
- Attribution (title, composer, source dataset) is visible on every tune page and every example card that uses a real tune.
- Recordings are **linked, not hosted** (YouTube/Spotify, with timestamps where the lecture points at a specific moment).
- *Dragon Roost Island* is replaced with an original modal-interchange example.
- Illustrations (e.g. for the Chord Characters demo) are **original characters**; prompts must not reference existing characters or artists' styles.
- Credit the course and lecturer (최지훈) on the cover page, and confirm they're happy with the book being published.

### 8.6 Schema (`tunes.schema.ts`)

```ts
type Style =
  | 'swing' | 'bebop' | 'hard-bop' | 'ballad' | 'waltz' | 'blues'
  | 'bossa' | 'samba' | 'latin' | 'modal';

type Status = 'generated' | 'flagged' | 'approved';

interface Provenance {
  status: Status;
  origin: 'slides' | 'dataset' | 'analyzer' | 'ai' | 'human';
  model?: string;                // model id + prompt version for AI items
}

interface Tune {
  id: string;                    // 'ill-close-my-eyes'
  title: string;
  composer: string;
  year?: number;
  era: 'pre-1940' | '1940s-50s' | '1960s' | '1970s+';
  style: Style;                  // one style per tune/example
  groove: string;                // groove id used for playback
  key: string;                   // usual key, e.g. 'F'
  realBookKey?: string;          // when it differs from the usual key
  form: string;                  // 'AABA', 'ABAC', 'blues', 'vamp' …
  meter: [number, number];
  tempo: number;
  scope: 'full' | 'excerpt';
  sections: Section[];
  analysis: ChordAnalysis[];     // one reading, parallel to flattened chord list
  devices: DeviceSpan[];
  versions?: Version[];          // e.g. It Could Happen to You: original / simplified / ii-V / dim
  recordings?: { label: string; url: string; t?: number }[];
  source: { dataset: string; url: string; license?: string; commit?: string };
  rights: { publicDomain?: { us: boolean; kr: boolean; checkedOn: string } };
  provenance: Provenance;
}
interface Section { label: string; bars: Bar[] }
interface Bar { chords: { symbol: string; beats: number }[] }   // symbol in §3 notation
interface ChordAnalysis { roman: string; key: string; function?: 'T' | 'PD' | 'D' }
type Device =
  | 'ii-V' | 'secondary-dominant' | 'secondary-ii-V' | 'tonicization'
  | 'tritone-sub' | 'extended-dominants' | 'iii-bIII' | 'chromatic-ii-V'
  | 'deceptive' | 'modal-interchange' | 'backdoor' | 'sharp-four-walkdown'
  | 'dim-substitution';
interface DeviceSpan { device: Device; from: BarPos; to: BarPos; target?: string; note?: string }
interface BarPos { bar: number; beat: number }
interface Version { id: string; label: string; sections: Section[]; analysis: ChordAnalysis[] }

// Melodies live in example sets, never in the tune library.
interface MelodyExcerpt {
  tier: 'original' | 'public-domain' | 'quotation';  // quotation = copyrighted excerpt, ≤ 16 bars
  tuneId?: string;               // required for 'public-domain' and 'quotation'
  bars: [number, number];        // rights check: ≤ 16 bars for both public-domain and quotation
  notes: { pitch: string; start: number; dur: number }[];
  attribution?: string;
  provenance: Provenance;
}
```

Widget example sets (`data/examples/*.json`) use the same `style`, `groove`, `tempo`, `key`, single `analysis` and `provenance` fields, so every example plays in its own fixed style and can be reviewed in `/review`. An example that needs a melody carries a `MelodyExcerpt`.

---

## 9. Widget catalog

Every widget has: a ▶ 듣기 button, the mini-player's key (starting at the usual key) and tempo, 🎲 shuffle to the next example (usually another style), a style tag, a short text summary, and a reset. Widgets marked ★ are the core experience to build first; ✦ marks new demos beyond the guide's direct content; 📝 marks content tasks from the content audit (they are prose or example-set edits, not widgets).

Chapters follow the book's 10-chapter layout (§1).

### 9.0 Cross-cutting demos

- **DeviceAB** (built): a generic A/B/C card for any device, fed by an example set with variants. Use it for every device that doesn't need a custom interaction; build a dedicated widget only when the interaction itself teaches something.
- ★ **Self-check** (`<Quiz>`): 2–3 questions per chapter with hidden answers.
  - Question kinds: multiple choice, "이건 무슨 장치?" (plays a `<Hear>` or DeviceAB example; the reader names the device), and "reveal the reading" (a progression whose numerals are hidden until tapped).
  - Answers explain, with a link back to the section.
  - Tracked separately from "들어봤어요".
- ✦★ **Hear It in the Wild:**
  - For the current device (e.g. backdoor), a carousel of 3–6 tune excerpts mined from the corpus (§8.4).
  - Each card shows the tune's style and era; tap to play the 2–4 bars in that tune's own groove and usual key.
  - Swiping moves through the same device in, say, a swing standard, a bossa, a ballad and a hard-bop tune.
- ✦ **Voicing Gallery:**
  - One chord or one ii-V-I in several voicing styles: shell, rootless A/B, drop 2, quartal, So What, block, upper structure.
  - Each is fixed to a fitting example: e.g. quartal in a modal vamp, block chords in a swing melody, rootless in a ballad.
  - Swipe through and hear how much one function can vary.
- ✦ **Chord Characters:**
  - Original illustrated characters, one per Roman numeral, inspired by the idea of "chord personalities" that the lecture showed.
  - Tap a character to hear its chord; drag characters into a row to hear a progression.
  - Each character's mood changes with context (V looks restless until I arrives).

### Ch.1 Hearing function
- 📝 **Frame the chapter as review.** The opening says this chapter aligns terms for material readers already know (§1); its new content is the tritone explanation, the A/B forms and guide tones. A short "이 책을 읽기 전에" note listing the prerequisites goes on the home page or at the top of ch.1.
- 📝 **About voicing, not tensions.** Ch.1 drops the words "텐션" and "기피음" and teaches *how a ii-V-I is voiced*: shells, then the A/B rootless shapes, with the voicings shown as degree stacks and the focus on voice leading (each voice moves by step, A and B alternate). The rootless section stays in ch.1; the vocabulary for why 9 and 13 sound good comes in ch.2–3.
- ★ **Same Song, Any Key** (built):
  - A progression plays in its usual key, then the reader picks other keys: the *All of Me* opening (C, G, A♭ as in the lecture), plus shuffle examples in other styles, such as a bossa or a waltz.
  - Letter names change on screen while the Roman numerals stay fixed.
  - Tap "알파벳 / 로마 숫자" to swap the labels.
- ★ **Why V7 pulls** (built): A/B of V → I vs V7 → I. The piano shows the tritone (B–F, 시–파) glowing, then animates its resolution (B→C, F→E). A "V7에서 멈추기" button holds the unresolved chord, so the reader *feels* the need to resolve.
- ✦ **Home-Away-Home Journey:**
  - The lecture's "코드 진행은 여행이다" metaphor as an animated path: a small house, a walk outward, the walk back.
  - Each chord is a step; the reader drags a slider along the path to scrub through the progression and hears where "home" is.
  - Examples: a classical IV–V–I, a jazz ii–V–I, a turnaround in a ballad, a blues.
  - Ch.6 reuses the same house picture for its four "other ways home", so build it to take a detour path too.
- ★ **ii-V-I Voicing Explorer** (built):
  - Major/minor toggle; voicing styles: shell / A form / B form / alternating A-B.
  - Lines on the piano connect each voice to the next, showing that every voice moves by step.
  - "정석 ♭9 vs ♮9" toggle on minor iiø7.
- **Guide-tone line:** plays only 3rds and 7ths over a bass line, then adds the full voicing.
- **Self-check:** replaces the drill's 들어봤어요 check (`function:drill`), which tracks a paper exercise as listening.

### Ch.2 Modes and chord-scale
- 📝 **Order and wording:** move the 5도권 paragraph above the Mode Brightness Slider, which uses the circle; say "이웃한 모드끼리는 음 하나만 다르다" once; fix the bullet that mixes directions (Ionian → Lydian raises 4, Ionian → Mixolydian lowers 7).
- 📝 **Autumn Leaves frame:** one sentence saying the scale choices are read against the relative major B♭, so the prose and the `<Hear>` pill (which uses minor-tonic numerals) agree (rule 2). Forward-link 프리지안 도미넌트 and 멜로딕 마이너 to ch.3.
- ★ **Mode Brightness Slider** (built):
  - Drag across 7 positions from Lydian to Locrian over a C drone; the scale loops.
  - The one changed note flashes on the piano and the circle of fifths rotates one step.
  - The character note is highlighted at each position.
  - Still to do: shuffle examples that use each mode in a jazz setting (Lydian on a ballad's IVΔ7, Dorian in a modal vamp, Mixolydian in a soul-jazz vamp, Phrygian in a Latin-jazz figure) instead of the current generic vamps.
- ★ **The Rub Test (기피음)** (built):
  - A chord holds (CΔ7, C7, C-7).
  - The reader taps scale degrees 1–7 to hear each against the chord and rates it ("달콤 / 짜릿 / 거슬림").
  - "정답 보기" shows the avoid notes; the reader's ratings are compared with the class consensus (F on Δ7, A♭ on -7).
  - A follow-up toggle plays an **original** phrase that uses the avoid note expressively, echoing the lecture's "자기 귀를 믿자" point. The lecture's *Corcovado* example appears as a recording link with a timestamp.
- ✦ **Tension Heatmap:**
  - A grid of scale degrees (rows) × chord qualities (columns); each cell is shaded by a hand-authored tension rating.
  - Tap any cell to hear that note against that chord.
  - It gives a one-screen gut map of where the rubs are.
- **How Many Keys:** pick a chord quality; see which parent keys contain it on the circle of fifths. Tap a key to hear the chord inside that key's ii-V-I.
- **Tension Builder:** add 9/11/13 one at a time to a chord, choosing between Ionian and Lydian. Hear the natural 11 clash and the ♯11 open the chord up. This is where readers first get the word "텐션" for the 9s and 13s they already heard in ch.1's voicings.
- **Lydian/Dorian chord:** fifths stack visibly from 1 and 3 (or ♭3).

### Ch.3 Minor scales and the dominant palette
This is the densest chapter (rule 9).
- 📝 **Load control:** open with "먼저 이 셋만" (Mixolydian, altered, Phrygian dominant); merge the 코드-스케일 연습표 into the palette table where they repeat; end with a drill (the Scale Chooser drill below).
- 📝 **Fixes:**
  - Name the root in the splice sentence: the lower half of one scale plus the upper half of the other works for **the same root** (C Lydian dominant + C altered), not for the tritone pair.
  - "도미넌트에서 내추럴 11은 항상 기피음" gets "(sus 코드 제외, §7)".
  - Move the 전위 등식 (ø7 = -6, -7 = 6) to ch.4, where they are first used, or link to them from ch.4.
- **Three Minors** (built): natural / harmonic / melodic, each with its iv–V–i cadence; raised notes highlighted. 📝 The harmonic variant must end on `i-Δ7` (or the text must say only V borrows the raised 7th) so the widget, its highlight and the melodic-minor text agree.
- ★ **Dominant Palette** (built):
  - A fixed loop of `ii – V7 – I` (or to minor).
  - The reader picks one of 7 dominant scales for the V7; the voicing and a short scale run change to match.
  - The TensionMeter shows relative tension; the "altered tensions" are highlighted against Mixolydian.
  - Phrygian dominant examples resolve to a **minor** target, as ch.3 teaches.
- ✦ **Scale Family Tree:**
  - An interactive tree: the major scale with its 7 modes, melodic minor with its 7, harmonic minor with its 7.
  - Tap any node to hear it over its natural chord; siblings are one tap apart.
  - The tritone link between Lydian dominant and altered is drawn as a bridge.
- **Tritone Twins:**
  - Two separate ideas, kept visibly separate (see the splice fix above):
    - C Lydian dominant and F♯ altered are one shared melodic minor (G melodic minor); toggle between the two roots.
    - On the **same root**, the halves of Lydian dominant and altered splice into whole tone and half-whole diminished, with an animation.
- ★ **Scale Chooser drill** (promoted for load control): a chord symbol appears; the reader picks a scale and hears it over the chord. Wrong choices still play, with a short explanation. Starts with only the three priority scales.

### Ch.4 Bebop and 6th-diminished
The core idea is rhythmic and melodic, and none of it can be heard yet (audit §1.4).
- 📝 **Interim, before the widgets:** one written-out 8th-note bebop line that plays (needs note-level playback, the same path as the Dominant Palette's scale run) and one block-chord harmonization of a short phrase. Give drop 2 more than one sentence.
- 📝 **Fly Me to the Moon exercise:** the melodic-minor bebop choice on A-7 and D-7 is intended. If the exercise stays, add one sentence explaining it, since the chapter's frame is "-7 = relative 6th". Recommended: turn the assignment into the One-beat-early diminished A/B below plus a short "직접 해 보기" note, because a written homework doesn't fit the interactive format (open question §13).
- **Engine:** drop 2 voicings (needed by the Harmonizer, the Voicing Gallery and ch.9's practice list).
- ★ **Downbeat Aligner:**
  - An 8th-note scale run over a metronome; the notes that land on downbeats are highlighted.
  - Toggle the bebop passing tone on and off: chord tones drift off the beat, then snap back into place.
- ★ **6th-Diminished Harmonizer:**
  - Short **original** melodies and short real melody excerpts (§8.5) harmonized as C6 ↔ Bo7 block chords.
  - Toggles: close / drop 2; piano block chords / sax soli / brass section.
  - Each melody is a separate example in its own style (swing, ballad, bossa).
- **One-beat-early diminished:** A/B of a line over A-7 → D-7, plain scale vs the passing dim7 a beat before the change (the lecture's *Fly Me to the Moon* homework tip, shown with an original line).

### Ch.5 The grammar of standards: split or substitute
Covers the syntax tree and the "쪼개거나, 바꾸거나" rule: secondary dominants and ii-Vs, extended dominants, the sharp-four walkdown, diminished and tritone substitution, iii–♭III, chromatic ii-Vs. Device demos use DeviceAB (built for all of these).
- 📝 **Fixes:**
  - "세 마디" → "네 마디" for ♯ivø7 → I.
  - The tritone 함정 문제 stays in C (B–F → G7 / D♭7) instead of switching to E7 / B♭7.
  - The syntax-tree ASCII art gets the V7/ii branch the third caption ("따뜻한 치킨을…") needs.
  - "실전 적용" headings become h3 (rule 8).
  - The *It Could Happen to You* "생각해 보기" gets an answer (rule 7).
- 📝 **Example sets:** `chromatic-ii-v` `cv-latin` variant B must contain real chromatic ii-Vs (e.g. `iii-7 VI7 | ♭iii-7 ♭VI7 | ii-7 V7 | IΔ7`); `cv-alice` variant A is labelled for what it is (Bird-blues opening, simplified ending) or replaced by a plain jazz blues.
- ★ **Syntax Tree Builder:**
  - Start from a single **I** node.
  - Tap a node to **prepare** it (insert its V7 or ii-V) or **embellish** it (tritone sub, dim substitution). Backdoor and the other ch.6 moves unlock as presets after ch.6.
  - The tree grows (d3-hierarchy) and the resulting progression plays left to right.
  - Presets rebuild the opening of real tunes from the Jazz Harmony Treebank, picked from different styles.
  - The lecture's "치킨을 먹었다" sentence tree sits alongside as the analogy.
- **Extended Dominants & Subs:**
  - A cycle VII7–III7–VI7–II7–V7–I.
  - Tap any chord to tritone-sub it; the bass line and guide-tone lines redraw and replay.
  - Replaces the tap-to-sub half that the `extended-dominants` DeviceAB doesn't have.

### Ch.6 Other ways home: tonicization, deceptive cadence, modal interchange, backdoor
New chapter (split from guide §5). Each section has a home image; DeviceAB demos are built for all four devices.
- 📝 **Fixes:**
  - The *Ceora* walkdown uses ♯iv-7: one sentence that the -7 form is also common (rule 3).
  - Point out ø7 before a major target where `iiø7/III V7/III → IIIΔ7` appears.
  - Drop *Out of the Past* everywhere (6.1, 6.2, and the ch.8–10 mentions if those chapters stay): it was a class assignment and is obscure on the scene. Use the remaining tonicization and deceptive examples instead.
  - Explain why ♭VII7 in the backdoor resembles the chromatic ii-V (B♭7 shares D F A♭ with G7♭9's diminished chord), or soften the claim; ch.5 taught only tritone and diminished substitution.
  - "실전 적용" headings become h3.
- **Home-Away-Home Journey** (from ch.1) with a detour path per section: staying a while (tonicization), opening the neighbor's door (deceptive), the same house in different light (modal interchange), the back door.
- **Tonicization meter:** a slider for how long a tonicized key is held (1 bar → 8 bars). Hear when the ear stops hearing it as color and starts hearing a new home.
- **V는 어디로 갈까?** (ear trainer): ii-V plays, then resolves to I, vi, iii, ♭II or backdoor; the reader guesses. It builds the deceptive-cadence instinct. Rounds rotate key and style, so the ear learns the function rather than one sound. It doubles as the chapter's self-check.

### Ch.7 Modal jazz
Quartal and So What voicings are described but can't be played yet (audit §1.4).
- 📝 **Interim, before the widgets:**
  - A DeviceAB "functional vs modal": a D-7 G7 loop against a D Dorian vamp.
  - Fixed-stack `<Hear>` pills (the example `stack` field) for one quartal and one So What voicing, with a static piano diagram.
- **Engine:** quartal and So What voicings with diatonic planing.
- **Sus vs -11:** A/B with the 3rd shown and hidden.
- **Pentatonic ↔ sus on the circle:** drag a 5-note window around the circle of fifths → the pentatonic plays and its two 7sus chords are shown.
- ★ **Modal Planing Pad:**
  - Over a Dorian drone, tap degrees to slide a So What or quartal shape diatonically.
  - It plays as sustained pads.
  - Examples: a "Maiden Voyage-style" sus sequence, a modal swing vamp and a straight-8 post-bop pad (all original voicings, not transcriptions).

### Ch.8–10: on hold

These chapters are tentative (§1). Their items stay listed so nothing is lost, but none of them are scheduled. If a chapter is dropped, its tools move elsewhere: the reharm and sketch tools to the end of ch.6 or to `/lab`, the reference cards and glossary to a single appendix page.

### Ch.8 Workflow: learning, analysis, reharmonization, composing
The reharm and sketch tools sit here because they use devices from both ch.5 and ch.6, and ch.8 holds the reharm menu.
- 📝 **Fixes:**
  - "기피음에 걸린다면 그 자리에는 맞지 않는 대체입니다" gets "보통은" and a link to ch.2's "규칙 위의 규칙" (rule 4).
  - The *I'll Close My Eyes* table points out D-7 G7 → C-7, a small deceptive turn into the IV ii-V, with a link to §6.2.
- **Analysis walkthrough:** a step-by-step *I'll Close My Eyes* analysis; each step highlights the bars and plays them. A second walkthrough uses a tune in another style (e.g. a bossa or a waltz).
- ★ **Reharm Lab:**
  - Pick a tune excerpt; each bar shows the reharm options that apply (from the chapter's reharm menu).
  - Toggle them per bar; A/B against the original; the melody note is checked against the new chord (warning if it hits an avoid note, worded as "usually").
  - Melodies for the check come from original contrafacts, public-domain tunes or short real excerpts (§8.5).
  - Shareable state goes in the URL hash (chords only).
- ✦ **Reharm Roulette:**
  - Apply a random, valid set of reharmonizations to a progression; tap again for a different set.
  - Trains the ear to hear which devices were used (the answer is revealed after a guess).
- ✦ **Progression Blocks:**
  - A sketchpad for composers: drag device blocks (ii-V, secondary ii-V, tritone sub, backdoor, tonicize, deceptive) onto an 8-bar timeline.
  - Each block snaps to function. The reader picks the sketch's style once (e.g. swing or bossa) and it plays in that groove.
  - Share via URL hash (chords only); a "아무거나" button builds a random but valid 8 bars.
- ✦ **Versions Through Time:**
  - One public-domain (checked in both the US and Korea) or original 8-bar tune, reharmonized the way different jazz styles would: swing era, bebop, hard bop, modal, bossa.
  - Every reharmonization is original, and the changes are annotated with the devices used.
  - A slider moves through the versions.

### Ch.9 Practice routines by role
- 📝 **Realistic routine (rule 11):** replace "매일 20분" with a time split or a weekly rotation, plus a "1주차 / 1개월" sequence. The 도미넌트 팔레트 drill's Phrygian-dominant step uses a ii-V-i. The *Fly Me* project follows the ch.4 decision; the *Out of the Past* project is dropped.
- **Practice routine player:** ii-V-I through 12 keys around the circle of fifths, with selectable voicing style and loop count. Role presets: 솔로 (guide tones + scale runs), 컴핑 (voicing cycles, including drop 2 once the engine has it), 작곡·편곡 (section voicings). Presets follow the weekly rotation.

### Ch.10 Quick reference
- 📝 **Glossary:** a Korean ↔ English term table (세컨더리 도미넌트 / secondary dominant, 으뜸음화 / tonicization, 위종지 / deceptive cadence, …).
- 📝 **Fixes:** remove the 라인 클리셰 row; the book doesn't teach it (it slipped in from a side note in the lecture). Check the 모달 감상 목록 (*Nica's Dream* is usually filed as Latin hard bop) and give each tune a one-line "들을 점".
- **Reference cards:** "이것만은 기억하자" and "패턴 → 해석" as tappable cards that play their example; shuffle swaps in another example.

### Free-play Lab (`/lab`)
Voicing gallery + reharm lab + dominant palette + progression blocks without prose, for tinkering.

---

## 10. Phases

Ordering only. Generation is fast and quality is fixed in later review passes, so phases are not time-boxed. In practice phases overlap: chapter widgets (phase 5) started before tooling (2) and tune data (4), and that is fine as long as the exit criteria are eventually met.

| Phase | Deliverable | Exit criteria |
|---|---|---|
| 0. Spike | Audio engine in Chrome (desktop + Android); voicing engine; `format.ts`; one widget (Why V7 pulls) with swing and bossa examples | Sound starts within 100 ms of a tap on a mid-range Android phone; voicing tests pass; chords display in the lecture's notation |
| 1. Shell | Static site, drawers, mini-player (usual key + transpose), labels setting (degrees / letters / 도레미), chapters generated from the Korean guide (text only), Pagefind | Static build deploys; navigation works on a 360 px screen |
| 2. Generation tooling | `scripts/generate/`, automatic checks; `/review` page optional (§7) | A widget's example set can be generated and checked end to end; review is on the fly |
| 3. Ch.1–2 widgets + grooves | ★ widgets for function and modes; groove library for all style buckets; generated example sets | Every Ch.1–2 section has a playable example in at least 3 styles |
| C. Content pass (audit) | The 📝 items in §9, in the audit's priority order: (1) the factual and consistency fixes, (2) the prerequisites note and the analysis-frame sentence, (3) ch.1 reworded around voicing, without tension and avoid-note vocabulary, (4) self-check questions, (5) removing line cliché and *Out of the Past*, (6) interim sounds for ch.4 and ch.7. Ch.8–10 items wait for the keep-or-drop decision | The audit's §2 table is closed; every chapter has a self-check; the §6.1 rules hold in a re-read. Do (1)–(2) before more widgets, since later chapters and examples build on that text |
| 4. Tune data | Pipeline (§8) incl. mining, AI annotation and rights check; lecture tunes + library tunes across styles; LeadSheet player | Lecture tunes match the slides (including the tune-based examples already entered from memory); every ★ concept has examples in 2+ styles |
| 5. Ch.3–7 widgets | Scale family tree and drill, bebop, syntax tree, home journey and ear trainer, modal widgets; reharm lab, roulette and progression blocks once their home is decided | Each ★ widget usable one-handed on a phone |
| 6. Reference + polish | PWA offline, performance budgets; reference cards, glossary and practice player if ch.8–10 stay | Works offline after the first visit; Lighthouse performance ≥ 90 on mobile |
| Later | Review passes over `generated` and `flagged` items; deferred items (§12) | |

New chapter text and widgets follow §6.1 from the start, so the content pass isn't repeated.

---

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Sample download size across instruments and kits | Lazy load per instrument and kit on first use; light sample sets first; cache via service worker |
| Android audio latency | Schedule with lookahead; widgets loop rather than react to precise timing; nothing needs tight timing from the user |
| Weak AI-generated examples (unmusical melodies, robotic grooves, wrong analyses) | Automatic theory checks; analyzer cross-check; `flagged` items hidden from production; the author's on-the-fly review; slide analyses as ground truth |
| Tune-based examples entered from memory differ from the slides | The author reports errors while reading (§7); check against the slide grids if they're extracted (phase 4); slide analyses win |
| Teaching errors in generated prose (terms used before taught, rules stated harder than intended, labels that don't match the sound) | Teaching rules (§6.1); a content re-read per chapter after major edits, as in `docs/reviews/2026-10-15-content-audit.md` |
| AI reproducing existing melodies | Prompts require original material for anything labeled original; real melodies only as short excerpts under §8.5, reviewed by the author |
| Notation drift (`Cmaj7` slipping into the UI) | All display goes through `format.ts`; a test scans built pages for non-lecture chord spellings |
| Melody excerpts exceeding the agreed length | Tiered policy (§8.5) enforced by the rights check; no downloads or exports |
| Public-domain status differs between the US and Korea | Both checks per tune with a date; unclear cases treated as copyrighted |
| Corpus skews toward swing/bebop standards | Coverage report per concept; targeted curation from the Latin/Brazilian playlists and modal repertoire; original examples where corpora lack coverage |
| Scope creep in widgets | Build ★ widgets first; use DeviceAB and `<Hear>` before a custom widget; ✦ demos reuse shared components and the example-set format instead of custom sound code |

---

## 12. Deferred

- **Other browsers:** iOS (Safari and Chrome on iOS both use WebKit; would need `unmute-ios-audio` and audio-unlock testing), Firefox, Samsung Internet, in-app browsers such as KakaoTalk.
- **i18n:** English content and Paraglide; the English guide already exists as a starting point.
- **Accessibility:** a full pass (screen readers, color-blind palettes, reduced motion, WCAG target).

---

## 13. Open questions

Resolved questions are recorded in `docs/decisions.md`.

1. **Chapters 8–10:** keep, merge into an appendix, or drop?
2. **Fly Me to the Moon exercise (ch.4):** keep the written assignment (with a sentence on melodic-minor bebop), or replace it with the One-beat-early diminished A/B? Recommended: replace.
3. **Full forms vs excerpts:** for tunes whose dataset terms are unclear, default to lecture excerpts?
4. **Notation:** is a staff view wanted at all, or are the piano view and chord symbols enough? (A `staff` setting exists but does nothing yet.)
