---
description: Always sync the latest git commits from origin/code and verify backend/frontend before running
globs: *
alwaysApply: true
---

# Repository Sync & Version Check Rule

Whenever the user asks to "run", "start", or "test" the application:
1. Fetch and rebase the latest commits from `origin/code` (`git fetch origin code && git pull --rebase origin code`).
2. Verify that both the FastAPI backend (`http://127.0.0.1:8000/api/v1/health`) and React frontend (`http://localhost:5173`) are running and up-to-date.
3. If new commits were pulled, ensure dependencies and database states are auto-healed.
