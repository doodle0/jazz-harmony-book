# Decisions

The author's rulings on the book. These override the plan (`docs/plan.md`) where they differ. Add new rulings here with a date. When a ruling replaces an older one, update the entry instead of adding a contradicting one.

## Ownership and review

- The author of the lecture and slides, 최지훈 (GitHub doodle0), owns the project. Their calls on content, notation and analysis are final, and slide analyses are ground truth. Publishing permission is settled.
- Review happens on the fly: the author reads the live book and reports what to fix, including wrong changes in tune-based examples. Don't block work on a review queue. (2026-10-15)
- Ask the author before important decisions instead of silently picking.

## Audience

- Prerequisites: intervals, chord construction, Roman numerals, basic progressions, the ii-V-I and the blues form. Ch.1 reviews them only to align terms; don't expand them into lessons or flag them as gaps. (2026-10-15)
- Song forms (AABA, ABAC) and pentatonics aren't formal prerequisites, but readers are implied to know them. Mention them freely without teaching them. (2026-10-15)
- Tensions and altered tensions are *not* assumed and are taught before use.

## Content

- Ch.1 teaches *how a ii-V-I is voiced*. Keep the words "텐션" and "기피음" out of it; the rootless A/B section stays in ch.1. (2026-10-15)
- Chapters 8–10 (workflow, practice, reference) are tentative; the author is deciding whether to keep them. No new work on them until then. (2026-10-15)
- Line cliché is not taught. It slipped in from a side note in the lecture; remove it from the reference table. (2026-10-15)
- *Out of the Past* is dropped everywhere: it was a class assignment and is obscure on the scene. (2026-10-15)
- The *Fly Me to the Moon* melodic-minor bebop choice over A-7 and D-7 is intended. Whether the exercise itself stays is open. (2026-10-15)
- No rhythm-changes section. (2026-10-15)
- Voice: direct address is preferred, but "강의자는…" passages are often the author's own opinions, so they're handled case by case, never rewritten in bulk. (2026-10-15)
- Guide §5 is split into ch.5 "스탠다드의 문법" and ch.6 "집으로 가는 다른 길"; the book has 10 chapters, and the `.svx` files are the master copy.

## Notation

- Multiple tensions in a chord symbol are separated by commas: G7(♭9, ♭13), CΔ7(9, ♯11, 13). `format.ts` emits this; prose, JSON and tension-list table cells follow it. Scale formulas and chord-tone lists stay space-separated (1 3 5 ♭7). (2026-10-14)
- "음도" means scale degree (e.g. "남은 음도 2 4 6"); it is not a typo. (2026-10-14)

## Design

- The "jazz club poster" look: warm cream paper, bold Blue Note-ish blocks (mustard, tomato, teal, ink), chunky rounded cards with hard offset shadows; dark mode is a smoky club. Playful, never flat, corporate or technical. (2026-10-13)

## Copyright

- Short real melody excerpts of standards (4–16 bars, as the lesson needs) are allowed, even when entered by AI or from memory, as long as the author reviews them. No lyrics, no full heads, no downloads. This loosens the plan's original rule. (2026-10-13)

## Hosting and repo

- GitHub Pages at https://doodle0.github.io/jazz-harmony-book/ (repo doodle0/jazz-harmony-book, base path set in CI).
- Source documents (`docs/reference/`) stay out of git. Everything else in `docs/` is committed. (2026-10-15)
