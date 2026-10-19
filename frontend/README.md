# Electricity Intelligence Dashboard (frontend prototype)

## Prerequisites
- Node.js â‰¥ 18
- npm (bundled with Node)

## Setup & Run
```bash
cd frontend
npm install          # installs React, Vite, react-router-dom, recharts
npm run dev          # start dev server at http://localhost:5173
npm run build        # generate production build in `dist/`
```

## Notes
- All data under `src/demo-data/` is **DEMO** and clearly labelled.
- Hadoop, HDFS, Spark, and backend connections are shown as *Planned / Not yet connected*.
- The UI uses a dark, premium theme with no external component library (plain CSS).
- Components are reusable; no metric values are hardâ€‘coded inside UI components.
