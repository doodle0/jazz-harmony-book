# 재즈 화성학, 귀로 배우기

Interactive Korean web book based on 최지훈's 2026 jazz harmony class. SvelteKit + mdsvex, static, deployed to GitHub Pages. Commands, layout and authoring syntax are in `README.md`.

## Docs

| File | Kind | Use |
|---|---|---|
| `docs/decisions.md` | living, committed | The author's rulings. They override the plan. Imported below |
| `docs/plan.md` | living, committed | The spec: goals, teaching rules (§6.1), widget catalog (§9), phases (§10), open questions (§13) |
| `docs/progress.md` | living, committed | Status of every phase, widget and content task |
| `docs/reviews/YYYY-MM-DD-*.md` | immutable, committed | Dated review snapshots. Never edit; track their tasks in `progress.md` |
| `docs/reference/` | immutable, **local only** | The source guide (ko/en) and the course summary. Missing in fresh clones and cloud sessions; see its README |

## Working rules

- Read `docs/progress.md` before starting work. Update it in the same change that moves an item.
- When the author makes a ruling, record it in `docs/decisions.md` with the date. If it changes the target, update `docs/plan.md` too. Don't put project facts in personal memory.
- New chapter text, widget text and example sets follow the teaching rules in plan §6.1.
- The author reviews on the fly and has the final word on content, notation and analysis. Ask before important decisions.
- The `.svx` chapters are the master copy of the prose. Don't re-import from the guide.
- Chord display goes through `src/lib/theory/format.ts` only.
- JS uses pnpm. Python uses uv (`uv run`).
- Commit or push only when asked.

@docs/decisions.md
