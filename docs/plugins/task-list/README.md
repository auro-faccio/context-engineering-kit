# Task List Plugin

Lightweight task management plugin that reads and writes a single `TASKS.md` file per project, using a tagged markdown syntax for sections, due dates, contexts, and time tracking — no external tool or database required.

## Plugin Target

- **Zero setup** - Tasks live in a plain markdown file the user can also edit by hand
- **Structured, not rigid** - Tags, contexts, and due dates are optional metadata, not a schema
- **Predictable edits** - Commands only ever append or flip a checkbox, never rewrite the file

## Overview

The Task List plugin manages a `TASKS.md` file organized into `## Section` headings, with tasks and nested subtasks as GitHub-style checkboxes. Metadata is encoded inline on the task line itself, so the file stays readable and diffable in plain markdown:

```markdown
## Urgent & Important 🔥
- [x] Finalize Q2 report #work @finance _done:2025-06-04 due:2025-06-03
- [ ] Prepare presentation for client meeting +urgent due:2025-06-06
  - [ ] Gather all necessary data
  - [ ] Practice run-through _spent:2700
```

| Token | Meaning | Example |
|---|---|---|
| `#tag` | Category/label, repeatable | `#work`, `#design` |
| `@context` | Place, person, or context, repeatable | `@finance`, `@clientX` |
| `+flag` | Project or priority flag, repeatable | `+urgent`, `+inprogress` |
| `due:YYYY-MM-DD` | Due date | `due:2025-06-10` |
| `_done:YYYY-MM-DD` | Completion date, set automatically | `_done:2025-06-04` |
| `_spent:<seconds>` | Cumulative time logged, set automatically | `_spent:2700` |

## Quick Start

```bash
# Install the plugin
/plugin install task-list@NeoLabHQ/context-engineering-kit

# Add a task
> /add-task Draft new homepage mockups #design +inprogress due:2025-06-10

# Complete it and log time spent
> /complete-task Draft new homepage mockups spent 45m

# Review what's open
> /list-tasks due this week
```

## Commands

- [/add-task](./add-task.md) - Add a new task or subtask to `TASKS.md`, inferring or asking for the right section
- [/complete-task](./complete-task.md) - Check off a task, stamp its completion date, and log time spent
- [/list-tasks](./list-tasks.md) - Summarize and filter tasks by section, tag, context, flag, due date, or status

## Inspiration

Based on the `task-management` skill from [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins), adapted to this repo's command-over-skill convention and extended with the `#tag @context +flag due:/_done:/_spent:` metadata syntax for richer filtering and time tracking.
