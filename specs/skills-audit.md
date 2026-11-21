# Skills Audit vs. Claude Code Skills Docs

Scope: 71 `SKILL.md` files in `plugins/*/skills/`. Reference: `docs/reference/skill-frontmatter.md`.

## Passing
- All 71 have `name` equal to folder name and a `description`.
- No unknown or unsupported frontmatter keys.
- Fields in use: `name` (71), `description` (71), `argument-hint` (45), `allowed-tools` (8), `model` (1).

## Findings

| # | Finding | Evidence | Suggested action |
| --- | --- | --- | --- |
| 1 | No skill sets `disable-model-invocation` or `user-invocable`. Every description loads into context in every session. | 0 of 71; descriptions total ~10.4k characters (~2.6k tokens, estimate) | Set `disable-model-invocation: true` on action skills (e.g. `commit`, `create-pr`, `add-task`, `complete-task`, `load-issues`, `reset`). **Applied** to 16 skills: git (`commit`, `create-pr`, `load-issues`, `load-pr-comments`, `resolve-fixed-pr-comments`), task-list (`add-task`, `complete-task`), sdd (`plan-task`, `implement-task`), fpf (`reset`, `actualize`), reflexion (`memorize`), review (`review-pr`), docs (`update-docs`), tdd (`fix-tests`, `write-tests`). Left model-invocable on purpose: `sdd/add-task` (invoked by `sdd/brainstorm` via `/add-task`) and `git/attach-review-to-pr` (used by `review-pr`). |
| 2 | `SKILL.md` over 500 lines. | 28 files, largest: `create-hook` 2317, `do-in-parallel` 2210, `implement-task` 1900, `agent-evaluation` 1711 | Split into `SKILL.md` + referenced files. |
| 3 | `claude.ai` upload would fail for skills with `argument-hint`. | 45 files | Only relevant if skills are uploaded outside Claude Code; no action for plugin use. |
| 4 | `allowed-tools` uses comma-separated, legacy `:*` patterns (e.g. `Bash(git add:*), ...`). The docs example uses space-separated `Bash(git add *)`. | `git/commit` and 7 other skills | Unverified whether both forms work; test before changing. |
| 5 | Descriptions rarely start with "Use when...". | 59 of 71 | The "Use when" pattern is this repo's convention for README entries, not a requirement of the official docs. Decide whether to enforce it in `description`. |

## Not covered
The best-practices section of the source page was truncated when fetched.
