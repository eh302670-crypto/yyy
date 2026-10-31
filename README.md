# StudyFlow

StudyFlow is an Arabic, right-to-left study planner built with React, TypeScript, and Vite. It keeps a local student profile, subjects, busy periods, exams, weekly study sessions, and focus timer in the browser.

## Run locally

```sh
npm install
npm run dev
```

## Checks

```sh
npm run lint
npm run test
npm run build
```

The schedule generator plans across all seven days, avoids saved busy periods, aligns session length with its time slot, and raises subjects with nearby exams in priority. Dashboard charts are loaded only when the dashboard is rendered.

All app data is stored in browser `localStorage`; there is no server-side account or cloud sync.
