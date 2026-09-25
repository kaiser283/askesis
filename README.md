# Ledger — Personal Habit & Productivity Dashboard

A dark, dense, spreadsheet-style dashboard for tracking habits, tasks, mood and sleep.
No build step, no backend, no account — all data lives in your browser's localStorage.

## Run it locally

Just open `index.html` in any modern browser. That's it — no npm install required.

Or, for a local server (recommended if you plan to extend it):
```
npx serve .
```
then visit the printed localhost URL.

## What's included

- **Habits** — add up to 15, track daily completion in a weekly spreadsheet grid,
  automatic current/longest streak and completion % per habit.
- **To-Do list** — add/complete/delete tasks, scoped to today's date, persists across
  refreshes.
- **Mood** — one-tap 5-point daily mood log.
- **Sleep** — single "hours slept" field per day.
- **Quote of the day** — deterministic pick from a set of original quotes, same all day.
- **Analytics** — 7-day line chart of overall habit completion %.
- **Calendar** — current month, marks any day with at least one habit completed.
- **Top habits** — ranked by real completion percentage.
- **Settings** — export all data as JSON, or reset everything (with confirmation).

## Files

- `index.html` — markup
- `styles.css` — all styling (CSS variables at the top control the palette)
- `app.js` — state, rendering, and all interaction logic (vanilla JS, no framework)

## Data

Everything is stored under a single localStorage key (`ledger_v1`) as one JSON object:
`{ habits, logs, todos, moods, sleep }`. Clearing your browser's site data for this
page will erase it — use Settings → Export to back it up first.

## Notes on scope

This is a lean first build: one shared weekly habit-grid view (rather than separate
daily/weekly/monthly tabs), and one combined analytics chart (rather than
week/month/year toggles for habits/todos/sleep/mood separately). The data model
already supports all of that — ask and it can be extended, including a full
React + TypeScript + Tailwind rewrite if you'd prefer that stack for further
development.
