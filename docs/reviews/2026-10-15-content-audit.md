# Content audit (pedagogical)

Date: 2026-10-15
Scope: all 10 chapters (`src/content/*.svx`), the 18 example sets (`src/lib/data/examples/*.json`) and the Three Minors widget text.

**Prerequisites (per the author):** intervals, chords, Roman numerals, basic chord progressions, the ii-V-I and the blues form. The book reviews these only so everyone is on the same page, so this audit does not count them as gaps.

## Summary

The book's order is sound: function → scales → standards → workflow. The "쪼개거나, 바꾸거나" framing in ch.5 is its strongest teaching idea. The 6.2 → 6.3 → 6.4 order, where backdoor comes last and is read with both earlier tools, is very well done. Every chapter's 솔로 / 컴핑 / 작곡 "실전 적용" section ties the theory to practice.

The main weaknesses:

- material that is *not* a prerequisite (tensions, altered tensions) is used before it is explained
- uneven depth: ch.4 and ch.7 are thin and can't be heard yet
- few ways for readers to check what they understood
- a handful of factual and consistency slips (§2)

## 1. Structural issues

### 1.1 State the prerequisites up front

The book never says what it assumes. A short "이 책을 읽기 전에" note would set expectations and justify the brisk review in ch.1. It could go on the home page or at the top of ch.1. List: intervals, chord construction, Roman numerals, basic progressions, ii-V-I, the blues form. Then a reader who stumbles in ch.1 knows the gap is theirs to fill, not the book's.

### 1.2 Tensions appear in ch.1 before they are explained

Roman numerals and ii-V-I are prerequisites, but tensions are not. Ch.1's rootless voicings use 9/13 and ♭9/♭13 (`G13 = B E F A (3 13 7 9)`, `G7(♭9, ♭13)`). Tensions are first explained in ch.2 ("텐션은 스케일을 쌓은 것일 뿐"), and ♭9/♭13 in ch.3. Options:

- move the rootless A/B section (`01-function.svx:68-90`) to the end of ch.2 or ch.3, or
- add a two-line "텐션 미리보기" note with a forward link (§2, §3).

### 1.3 Mixed analysis frames for minor keys

Minor-key numerals themselves are prerequisite, but ch.2 mixes two frames without saying so. The *Autumn Leaves* prose analyses against the relative major (C-7 = **ii**, F7 = **V**, B♭Δ7 = **I**), while the `<Hear>` pill directly below labels the same chords against the minor tonic (`iv-7 | ♭VII7 | ♭IIIΔ7 | ♭VIΔ7`, `02-modes.svx:55-57`). One sentence would fix it, e.g. "여기서는 스케일 선택을 위해 나란한조 B♭ 기준으로 읽습니다".

### 1.4 Ch.4 and ch.7 are thin, and their central ideas can't be heard yet

- **Ch.4:** The core idea is rhythmic and melodic: bebop scales keep chord tones on the beat. The only audio is chord pills (C6 ↔ Bo7).
  - Drop 2 gets one sentence (`04-bebop.svx:33`). Yet ch.9 assigns drop-2 practice, and the voicing engine can't play it.
  - Block-chord harmonization has no example.
- **Ch.7:** Quartal and So What voicings are described but can't be played.
  - There's no A/B showing *why* modal sounds different, e.g. a D-7 G7 loop vs. a D Dorian vamp.

Until the Downbeat Aligner and Modal Planing Pad exist, even one written-out 8th-note line and one static diagram per voicing would help.

### 1.5 Readers have almost no way to check what they understood

- Only ch.1 and ch.2 have a 드릴.
- Ch.5 has one "생각해 보기" (the *It Could Happen to You* B7) with no answer anywhere.
- The `Heard` checkmarks track listening, not understanding. The ch.1 drill is tracked as `function:drill`, a 들어봤어요 check on a paper exercise.

Suggestion: 2–3 self-check questions per chapter with hidden answers. The existing `<Hear>` / DeviceAB examples can double as "이건 무슨 장치?" quizzes.

### 1.6 Terms used but never taught (beyond the prerequisites)

- **라인 클리셰:** appears only in the ch.10 reference table (`10-reference.svx:36`). There it is described as "베이스가 순차 하행", but the usual meaning is an inner-voice chromatic line (C- C-Δ7 C-7 C-6). Either teach it somewhere or fix the description.
- **형식 (AABA / ABAC):** ch.8 step 1 (`08-workflow.svx:8`). The blues form is prerequisite; song forms may or may not be. Decide, and list them in the prerequisites if so.
- **펜타토닉:** assumed known in ch.3 and ch.7. Add it to the prerequisites, or give it one line.
- **프리지안 도미넌트, 멜로딕 마이너:** used in ch.2's *Autumn Leaves* analysis (`02-modes.svx:55`) with no forward link to §3.

## 2. Errors and inconsistencies

| Where | Issue | Suggested fix |
|---|---|---|
| `three-minors.json` + `ThreeMinors.svelte:36` | The **harmonic** variant ends on `i-7` (has ♭7), while the widget highlights ♮7 as the scale's defining change. The melodic text then says "i-7이 i-Δ7로 바뀝니다", which implies harmonic still has i-7. Harmonic minor's tonic is already i-Δ7. | End the harmonic variant on `i-Δ7`, or say in the text that only V borrows the raised 7th. |
| `03-minor-dominant.svx:62` | "한쪽의 아래 절반을 다른 쪽의 위 절반에" follows the sentence about roots a **tritone apart** (C 리디안 도미넌트 = F♯ 얼터드). The splice only works on the **same root** (C Lydian dominant + C altered). Read as written, it fails. | Name the root: "같은 근음(C)의 리디안 도미넌트와 얼터드에서…" |
| `05-standards.svx:103` vs `:96`, `10-reference.svx:38` | "♯ivø7부터 I까지 세 마디", but every example and the reference pill use four bars (♯ivø7 \| VII7 \| iii VI \| ii V). | "네 마디" |
| `05-standards.svx:96` vs `06-home.svx:59-61` | Ch.5 defines the walkdown as ♯ivø7. The *Ceora* example in ch.6 uses ♯iv-7 without comment. | One sentence: the -7 form is also common. |
| `06-home.svx:38` vs `:63` | The D section of *Out of the Past* is called 으뜸음화 in 6.1 and 위종지 in 6.2, with no link between the two. | If both readings are intended, say so and cross-link, as the backdoor section already does. |
| `06-home.svx:100` | "♭VII7이 V7이 있을 자리에… 바꾼 다음 쪼개는, 반음 하행 ii-V와 같은 꼴". Ch.5 taught only tritone and diminished substitution, and ♭VII7 is neither. Readers may conclude B♭7 is a tritone sub of G7. | Explain the link (B♭7 contains D F A♭, three notes of G7♭9's diminished chord) or soften the claim. |
| `05-standards.svx:125` | The tritone 함정 문제 starts in C (F–B / B–F), then switches to D–G♯ / E7 / B♭7 for the payoff. | Stay with B–F → G7 / D♭7. That connects to the ch.1 shell remark and to the next paragraph. |
| `08-workflow.svx:56` | "기피음에 걸린다면 그 자리에는 맞지 않는 대체입니다" states as a rule what ch.2's "규칙 위의 규칙" and *Corcovado* deliberately soften. | Add "보통은", or link back to §2. |
| `chromatic-ii-v.json` `cv-latin` | Variant B (`iii-7 ♭iii-7 \| ii-7 subV7`) has no ♭VI7, so it shows a chromatic passing chord rather than a chromatic ii-V, in the set meant to teach exactly that. | Make it `iii-7 VI7 \| ♭iii-7 ♭VI7 \| ii-7 V7 \| IΔ7` or similar. |
| `chromatic-ii-v.json` `cv-alice` | Variant A is labelled "보통의 재즈 블루스", but bars 1–4 are already the Bird-blues changes. | "앞부분은 원곡, 뒷부분만 단순화", or use a plain jazz blues. |
| `04-bebop.svx:41` (also `09-practice.svx:30`) | The *Fly Me to the Moon* exercise uses 멜로딕 마이너 bebop on A-7 and D-7. The chapter itself teaches -7 = relative 6th, and natural-minor bebop = a mode of bebop major. Over A-7 in C, F♯ and G♯ are outside the key. | If intended (Barry Harris style), add one sentence of explanation. Author's call. |
| `03-minor-dominant.svx:90-94` | The 전위 등식 (ø7 = -6, -7 = 6) are first used in ch.4. | Move them to ch.4, or link from ch.4. |
| `03-minor-dominant.svx:88` | "도미넌트에서 내추럴 11은 항상 기피음" is later contradicted by 7sus (ch.7). | Add "(sus 코드 제외, §7)". |
| `10-reference.svx:54` | *Nica's Dream* in the 모달 감상 목록 is surprising (usually filed as Latin hard bop). None of the five tunes in that row are discussed in ch.7. | Check the list, or give each tune a one-line "들을 점". |

## 3. Smaller notes, by chapter

- **Ch.1:** With Roman numerals and ii-V-I as prerequisites, the chapter works as a review. Its real new content is the tritone explanation, the A/B forms and guide tones. The opening could say so ("이미 아는 내용을 같은 용어로 맞추는 장").
- **Ch.2:**
  - The ModeBrightness widget (which uses the circle of fifths) appears *before* the circle is explained. Move the 5도권 paragraph above it.
  - "이웃한 모드끼리는 음 하나만 다르다" is said twice (`:32` and `:35`).
  - The bullet "아이오니안 → 리디안은 4도를 올리고… 목록을 따라 내려간다" mixes directions.
- **Ch.3:**
  - This is the densest chapter: three minor scales, seven melodic-minor modes, seven dominant scales, a nine-row table, and no drill.
  - The 코드-스케일 연습표 largely repeats the palette table.
  - A "먼저 이 셋만" priority (Mixolydian, altered, Phrygian dominant) and a drill would lower the load.
- **Ch.5:**
  - The syntax-tree ASCII art draws only two levels, but the third caption ("따뜻한 치킨을…") needs a V7/ii branch.
  - "## 실전 적용" appears four times at h2 level, so the TOC shows four identical entries. The same happens in ch.6. Make them h3.
- **Ch.6:** The tonicization example `iiø7/III V7/III → IIIΔ7` uses ø7 before a *major* target, against ch.5's rule ("목표가 마이너면 ø7"). This is fine, since 6.1 says the same about *Out of the Past*, but point it out where it happens.
- **Ch.8:** The *I'll Close My Eyes* table skips a nice moment: D-7 G7 sets up C, and C-7 arrives instead, a small deceptive turn that leads into the IV ii-V. That's a ready-made link to §6.
- **Ch.9:**
  - "매일 20분" for ii-V-I in 12 keys × guide tones/shells/A·B, plus ear training, plus analysis is unrealistic. Add a time split or a weekly rotation, plus a simple "1주차 / 1개월" sequence.
  - The 도미넌트 팔레트 drill cycles Phrygian dominant over a *major* V7–I, while ch.3 teaches it for minor targets. Consider a ii-V-i for that step.
- **Ch.10:** Add a Korean ↔ English term glossary (세컨더리 도미넌트 / secondary dominant, 으뜸음화 / tonicization, 위종지 / deceptive cadence, …). Readers will meet English sources, and the book mixes native Korean terms with transliterations.
- **Throughout:** The voice switches between "강의자는…" (third person) and direct address. Fine for lecture notes. For a book, consider one voice.

## 4. Suggested priorities

1. Fix the factual and consistency items in §2 (all small edits).
2. Add a prerequisites note (§1.1) and one sentence on the *Autumn Leaves* analysis frame (§1.3).
3. Move or preview the rootless voicings so tensions are explained before they're used (§1.2).
4. Add self-check questions with hidden answers to each chapter (§1.5).
5. Teach or drop the remaining terms: 라인 클리셰 and song forms (§1.6).
6. Add at least static examples to ch.4 and ch.7 until their widgets exist (§1.4).

## 5. Open questions for the author

- Is melodic-minor bebop over vi-7 / ii-7 in the *Fly Me* exercise intended?
- Should *Out of the Past*'s D section be presented as both tonicization and deceptive cadence?
- Are song forms (AABA, ABAC) prerequisites too?
- Is rhythm changes worth a mention? It's the other most common jam form besides the blues and is currently absent.
