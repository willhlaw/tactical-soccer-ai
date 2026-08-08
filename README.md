# TacticalSoccer AI (Progressive Web App)

Offline-first soccer team management Progressive Web App with interactive 2D Canvas pitch boards (Tactico.pro & FormationBuilder style), fair-play equal minute lineup & sub matrix engine, Coach Rory AI voice assistant, and parent drill sharing.

## 🚀 Features

- **Interactive 2D Pitch Canvas**: Drag & drop player badges, draw pass/run/dribble/shot vectors, and frame-by-frame drill animation keyframes.
- **Game Day Lineup & Sub Engine**:
  - **Recreation Mode (Fair Play)**: Guarantees equal playing minutes (±1 min) across quarters/halves and positional rotation (e.g. Goalie to Forward).
  - **Competitive Mode (ADP/Travel/High School)**: Optimizes field balance based on player strength ratings.
  - **1-Tap Absence Check**: Quick check-off of missing/injured players.
- **Coach Rory AI Assistant**: Speech-to-text voice assistant with Coach Rory youth tactics (build out from back, 2-3-1 & 3-2-3 shapes, trigger pressing).
- **Practice Hub & Parent Share Drawer**: Export WhatsApp/SMS formatted recaps and public drill web links.
- **Commercial Landing Page**: Public marketing page with interactive live pitch canvas demo widget and pricing matrix ($0 Free vs $9.99/mo AI Coach Pro).

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons
- **PWA / Offline**: Custom Service Worker (`sw.js`), Web App Manifest (`manifest.json`), IndexedDB / LocalStorage
- **Backend / Sync**: Google Firebase (Firestore & Firebase Auth)
- **Voice AI**: Web Speech API

## 📦 Local Setup

```bash
cd c:/Users/willl/dev/tactical-soccer-ai
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔗 Repository
[github.com/willhlaw/tactical-soccer-ai](https://github.com/willhlaw/tactical-soccer-ai)
