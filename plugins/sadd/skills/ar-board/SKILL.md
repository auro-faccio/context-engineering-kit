---
name: ar-board
description: Use when the user wants to triage many candidate options (designs, features, fixes, topics, variations) by approving or rejecting each with a comment, instead of reading long reports
argument-hint: "[what to generate] [number of items, default 10]"
---

# AR Board (Approval / Rejection Board)

<task>
Turn the user's judgment into structured feedback. Generate N candidate items, show them on a local keyboard-driven board (**A** = approve, **R** = reject, optional comment on why), then act only on what the user approved, using the comments to learn their preferences.
</task>

## Workflow

1. **Generate candidates.** From `$ARGUMENTS` (default 10 items), produce distinct, meaningfully different candidates. Do not pad with near-duplicates.
2. **Write the board file** to `.specs/ar-board/<slug>.json` (create the directory):

   ```json
   {
     "title": "Hero section variations",
     "items": [
       { "id": 1, "title": "Short name", "summary": "One or two lines: what it is and its main consequence", "html": "<optional self-contained HTML preview>" }
     ]
   }
   ```

   - `summary` MUST state the decision and its consequence, so the user can decide without extra reading.
   - `html` is optional; include it for visual candidates (layouts, templates, carousels). It renders in a sandboxed iframe, so it MUST be self-contained (inline CSS, no external scripts).
3. **Start the server in the background** with the Bash tool (`run_in_background: true`):
   `node ${CLAUDE_SKILL_DIR}/scripts/server.mjs .specs/ar-board/<slug>.json`
   If `${CLAUDE_SKILL_DIR}` is unavailable, use the path to this skill's `scripts/server.mjs`. Read its output for `AR_BOARD_URL` and `AR_BOARD_RESULTS`, then give the user the URL.
4. **Wait for the user.** Tell them to press **A** or **R** on each item, comment with **C**, and reply "finished" here. Do NOT poll or proceed before that.
5. **Read the results** (the `AR_BOARD_RESULTS` JSON file, or `GET <url>/api/results`). It lists `approved`, `rejected` and `pending` items with comments.
   - Treat `pending` items as **not approved**. If most are pending, ask whether the user meant to finish.
   - If nothing is approved, ask what was missing instead of regenerating blindly.
6. **Act on the approved items only** (build, implement, write the script), honoring their comments.
7. **Learn from the feedback.** Summarize the preference pattern in 2-4 bullets (what was approved and rejected, and why). In follow-up boards, apply it; if the user asks to train or improve an agent, write it into that agent's instructions. Never save preferences to files without being asked.

## Rules

- You MUST NOT implement rejected or pending items.
- You MUST NOT approve on the user's behalf, even for obviously good candidates.
- You SHOULD offer a follow-up board ("10 more variations of the next section") after acting, so the loop continues.
- Boards are most valuable above ~10 items; for 2-3 options, ask the user directly instead.
- Stop the background server when the loop ends (it also exits after 60 idle minutes).
