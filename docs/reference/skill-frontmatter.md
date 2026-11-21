# Skill Frontmatter Reference

Use when writing or reviewing a `SKILL.md`. Source: [Claude Code skills docs](https://code.claude.com/docs/en/skills). Verify against the source before relying on version-specific details.

## Fields

All fields are optional; `description` is recommended. Unknown fields are ignored by Claude Code.

| Field | Purpose |
| --- | --- |
| `name` | Slash-command name. Defaults to folder name. Keep equal to the folder. |
| `description` | What the skill does and when to use it; key use case first. |
| `when_to_use` | Extra trigger phrases, appended to `description`. Combined cap: 1,536 characters. |
| `argument-hint` | Autocomplete hint, e.g. `[issue-number]`. |
| `arguments` | Named positional arguments for `$name` substitution. |
| `disable-model-invocation` | `true`: only the user can invoke; description is not loaded into context. |
| `user-invocable` | `false`: hidden from the `/` menu; only Claude can invoke. |
| `allowed-tools` | Tools pre-approved for the invoking turn only. |
| `disallowed-tools` | Tools removed while the skill is active. |
| `model` / `effort` | Model and effort for the current turn. |
| `context` / `agent` / `background` | `context: fork` runs the skill as a subagent task (no conversation history); `agent` picks the type; `background` defaults to `true`. |
| `hooks` | Hooks registered on invocation, kept for the session. |
| `paths` | Globs that activate the skill for matching files. |
| `shell` | `bash` (default) or `powershell` for injected commands. |

Outside Claude Code (claude.ai upload, Skills API) only `name`, `description`, `license`, `compatibility`, `metadata` and `allowed-tools` are accepted; other keys such as `argument-hint` fail the upload.

## Invocation control

| Frontmatter | User can invoke | Claude can invoke | Description in context |
| --- | --- | --- | --- |
| default | yes | yes | yes |
| `disable-model-invocation: true` | yes | no | no |
| `user-invocable: false` | no | yes | yes |

Use `disable-model-invocation: true` for action skills with side effects (commit, deploy, create PR). It also removes their description from every session's context.

## Substitutions

`$ARGUMENTS`, `$ARGUMENTS[N]` / `$N`, `$name`, `${CLAUDE_SKILL_DIR}`, `${CLAUDE_PROJECT_DIR}`, `${CLAUDE_SESSION_ID}`. `` !`command` `` runs a shell command before the skill is sent and inserts its output.

## Rules of thumb

- Keep `SKILL.md` under 500 lines; move detail into files referenced from it.
- Do not use `context: fork` for skills that only hold guidelines.
- Skill beats a same-named `.claude/commands/` file; enterprise > personal > project.
