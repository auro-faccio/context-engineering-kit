---
name: complete-task
description: Mark a task in TASKS.md as done, stamping the completion date and optionally logging time spent
argument-hint: Task text (or partial match) to complete, plus optional time spent (e.g. "Practice run-through 45m")
---

# Complete Task

## User Input

```text
$ARGUMENTS
```

## File

Use `TASKS.md` in the current working directory. If it does not exist, tell the user there are no tasks to complete and stop.

## Syntax Reference

Completing a task means: `- [ ]` becomes `- [x]`, and a `_done:YYYY-MM-DD` token (today's date) is appended to the line. If the user mentions time spent (e.g. "45m", "1h30m", "spent 2700s"), convert it to seconds and add/increment a `_spent:<seconds>` token on the same line.

## Instructions

1. Read `TASKS.md`.
2. Find the task line matching `$ARGUMENTS` (fuzzy match on the task text, ignoring existing tags/tokens). If more than one task matches, list the candidates and ask which one; if none match, say so and stop.
3. On the matched line:
   - Change `- [ ]` to `- [x]`.
   - Append `_done:<today's date, YYYY-MM-DD>` if not already present.
   - If time spent was given in `$ARGUMENTS`, convert to seconds and either add `_spent:<seconds>` or increase an existing `_spent:` value by that amount.
4. If the task has unchecked subtasks, ask for confirmation before completing it (or offer to complete the subtasks too) rather than silently leaving them open.
5. Do not modify any other line in the file.
6. Report back the exact line as it now reads.
