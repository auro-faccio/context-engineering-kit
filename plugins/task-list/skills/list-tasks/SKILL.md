---
name: list-tasks
description: Summarize and filter tasks from TASKS.md by section, tag, context, flag, due date, or status
argument-hint: Optional filter, e.g. "@webdev", "#coding", "due this week", "overdue", "done"
---

# List Tasks

## User Input

```text
$ARGUMENTS
```

## File

Use `TASKS.md` in the current working directory. If it does not exist, tell the user there is no task list yet and suggest `/add-task`.

## Syntax Reference

Each task line is `- [ ]`/`- [x] <text> [#tag]* [@context]* [+flag]* [due:YYYY-MM-DD]? [_done:YYYY-MM-DD]? [_spent:<seconds>]?`, grouped under `## Heading` sections and nested by indentation for subtasks.

## Instructions

1. Read `TASKS.md` and parse every task line: section, nesting level, checked state, text, and any `#tag`/`@context`/`+flag`/`due:`/`_done:`/`_spent:` tokens.
2. Apply the filter from `$ARGUMENTS` if given:
   - A bare `#tag`, `@context`, or `+flag` filters to tasks carrying that token.
   - `due this week` / `overdue` / `due <date>` filters by the `due:` date against today.
   - `done` / `open` filters by checked state.
   - No argument means show everything.
3. Print the result grouped by section, preserving original order, using `[ ]`/`[x]` checkboxes and indentation to mirror the file.
4. Call out anything overdue (`due:` date before today, not done) or tagged `+urgent` at the top of the summary.
5. Do not modify `TASKS.md`.
