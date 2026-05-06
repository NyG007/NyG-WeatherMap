# SkyCheck

Real-time weather forecast app built with vanilla JavaScript and the OpenWeatherMap API.
Created by **NyG**.

---

<img src="/IMGs/SkyCheckerPrint.jpeg">

---

## Features

- Search weather by city name
- Detect weather via device geolocation
- Dark / light mode toggle (follows system preference)
- Skeleton shimmer loading state
- Full error handling: 404, network failure, permission denied
- Responsive layout — mobile-first (375px → desktop)
- Accessible: semantic HTML5, aria-labels, keyboard navigation

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Markup   | HTML5 (semantic)                  |
| Style    | CSS3 (custom properties, no libs) |
| Logic    | Vanilla JavaScript ES6+           |
| Data     | OpenWeatherMap API (free tier)    |

---

## Project Structure

skycheck/ <br>
├── index.html ← semantic HTML structure <br>
├── style.css ← design tokens + responsive layout <br>
├── app.js ← fetch logic, render, geolocation <br>
├── config.js ← API key (never commit) <br>
└── .gitignore ← config.js is listed here <br>

---

## Build Log

| Milestone              | Description              | Status |
|------------------------|--------------------------|--------|
| v0.1 — Proof of Concept | HTML structure           | ✅ Done |
| v0.2 — MVP             | CSS + Fetch + Render     | ✅ Done |
| v1.0 — First Release   | QA + README + Footer     | ✅ Done |
| v1.1 — Bug Fixes       | Geolocation + UX polish  | ✅ Done |

**Total build time:** ~5 sessions  
**Completed:** May 2026
## License

MIT 
