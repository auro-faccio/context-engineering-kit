# /ar-board - Approval / Rejection Board

Use when you want to steer the agent with decisions instead of reading long reports: it generates N candidates, shows them on a local board, and acts only on the ones you approve.

- Purpose - Turn your judgment (taste, preferences, risk tolerance) into structured, reusable feedback
- Pattern - Generate candidates → local board (**A** approve, **R** reject, **C** comment) → say "finished" → agent acts on approved items
- Output - `.specs/ar-board/<slug>.results.json` with approved, rejected and pending items plus your comments
- Dependencies - Node.js only (zero npm packages)

## Usage

```bash
/ar-board 10 micro-templates for a musical instrument store website
/ar-board 10 architecture improvements for this agent
```

| Key | Action |
|---|---|
| `A` / `R` | Approve / reject the current item and move to the next |
| `C` / `Esc` | Write / leave a comment explaining why |
| `↑` `↓` | Navigate items |

## How it works

| Step | What happens |
|---|---|
| 1 | Agent writes `board.json` (title, items with `summary` and optional self-contained `html` preview) |
| 2 | Agent starts `scripts/server.mjs` in the background (localhost only, exits after 60 idle minutes) |
| 3 | You triage the board in the browser; every decision is saved immediately |
| 4 | You reply "finished" in the session; the agent reads the results file and acts only on approved items |
| 5 | Comments become preference signals for the next board or for improving an agent |

## Good fits

| Use case | Example |
|---|---|
| Design exploration | 10 hero-section variations, then 10 variations of the next section |
| Feature scoping | 10 feature ideas, approve 3, implement those |
| Agent improvement | 10 architecture suggestions, with comments to train the agent |
| Content planning | 10 topic ideas, script only the approved one |

Boards pay off above ~10 items. For 2-3 options, ask directly instead.

## Credits

Inspired by the "AR Board" workflow shown in the video [My New Favorite Claude Code Skill](https://youtu.be/Ckuo9Bvy3zk) (Maestros da IA). This is an independent implementation from the described behavior.
