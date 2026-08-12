---
name: add-task
description: Add a new task or subtask to TASKS.md using the tagged markdown format
argument-hint: Task text plus optional section, parent task, and metadata (e.g. "Buy milk #home @store due:2025-06-10")
---

# Add Task

## User Input

```text
$ARGUMENTS
```

## File

Use `TASKS.md` in the current working directory. If it does not exist, create it with:

```markdown
# Tasks

## Inbox 📥
```

## Syntax Reference

Tasks are `- [ ] <text>` (or `- [x] <text>` when done), nested two spaces per level for subtasks. Metadata tokens are appended after the text, space-separated, in any order:

| Token | Meaning | Example |
|---|---|---|
| `#tag` | Category/label, repeatable | `#work`, `#design` |
| `@context` | Place, person, or context, repeatable | `@finance`, `@clientX` |
| `+flag` | Project or priority flag, repeatable | `+urgent`, `+inprogress` |
| `due:YYYY-MM-DD` | Due date | `due:2025-06-10` |
| `_done:YYYY-MM-DD` | Completion date, added by `/complete-task` | `_done:2025-06-04` |
| `_spent:<seconds>` | Cumulative time logged, added by `/complete-task` | `_spent:2700` |

Sections are `## Heading` (freeform title, may include an emoji or trailing `@context`).

## Instructions

1. Read `TASKS.md` (create it per the template above if missing).
2. Parse `$ARGUMENTS`:
   - Free text (everything that isn't a recognized token) becomes the task text.
   - Recognized tokens (`#tag`, `@context`, `+flag`, `due:...`) are kept as-is and appended to the task text in the order given.
   - If the user names a section (e.g. "in Project: Website Redesign") or a parent task to nest under (e.g. "under Draft new homepage mockups"), use that; otherwise pick the section that already matches the task's tags/context, or ask which section to use if none fits and more than one section exists.
3. Append `- [ ] <text> <tokens>` as the last item of the chosen section, or as a nested `  - [ ] ...` line under the specified parent task (matching the parent's indentation + 2 spaces).
4. Preserve every existing line in the file exactly — only add the new line(s).
5. Report back the exact line added and which section/parent it was placed under.
