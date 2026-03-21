# RetroOS — Development Progress

## Project Vision

RetroOS is a browser-based desktop environment where we release our apps and games. Users visit the site, see a retro desktop, and double-click to launch and try out our apps. The OS itself is the platform — it's always open, no signup required to land on the desktop.

## Current Status: Phase 1 Complete (Desktop Shell + Theme System)

### Visual Style
Custom retro desktop identity inspired by Linux desktop environments — NOT a Windows clone.
Default theme ("RetroOS Classic"): teal-green desktop, warm gray chrome, purple accent title bars.
Fully themeable via a GTK-inspired config system.

### What's Been Built

**Theme System (GTK-inspired)**
- Theme definitions are config objects mapping to CSS custom properties
- ThemeContext applies themes at runtime, persists choice in localStorage
- 3 preset themes:
  - **RetroOS Classic** — warm gray chrome, purple title bars, teal desktop
  - **Arctic** — dark blue/gray, flat borders, subtle gradients
  - **Olive** — earthy green tones, beveled borders
- Themes control: colors, fonts, border style (beveled vs flat), border radius, dimensions
- All component CSS uses theme variables — zero hardcoded colors

**Desktop Environment**
- Full-viewport themed desktop background
- Desktop icon grid with retro SVG icons
- Double-click icons to launch apps, single-click to select

**Window Manager**
- Draggable windows (drag by title bar) via react-draggable
- Resizable windows (drag bottom-right corner grip)
- Z-index stacking — click any window to bring it to front
- Minimize — hides window, stays in taskbar
- Maximize — fills viewport (minus taskbar), restores to previous size/position
- Close — removes window from state
- Staggered positioning for new windows (avoids overlap)
- Title bar buttons on the right (minimize, maximize, close)
- Error boundary per app — a crashed app shows a retro error dialog, doesn't take down the desktop

**Taskbar**
- Fixed bottom bar, styled per theme
- RetroOS-branded start button opens app launcher menu
- Window buttons for each open app — click to focus/restore/minimize
- Active window button gets pressed-in look
- Live clock with time and date

**Start Menu**
- Themed header with RetroOS branding
- Lists all registered apps with hover highlight
- Click to launch, click outside to dismiss

**Demo Apps (for testing the platform)**
- **Calculator** — full arithmetic, chained ops, keyboard shortcuts
- **Notepad** — text editor with File/Edit menus, keyboard shortcuts

### Tech Stack
- Vite 8 + React 19 (JavaScript, ES modules)
- react-draggable for window movement
- Custom CSS with CSS custom properties (theme-driven)
- Production build: chunk-split (React vendor separate from app code)

---

## Architecture

```
src/
├── main.jsx                    Entry point
├── App.jsx                     ThemeProvider + WindowManagerProvider wrapper
├── styles/                     CSS variable fallbacks, reset, global styles
├── themes/
│   ├── index.js                Theme registry (getTheme, getThemeList)
│   ├── retroClassic.js         Default theme definition
│   ├── arctic.js               Dark theme definition
│   └── olive.js                Earthy theme definition
├── context/
│   ├── ThemeContext.jsx         Applies theme vars to :root, persists to localStorage
│   └── WindowManagerContext.jsx useReducer-based window state
├── registry/
│   ├── appRegistry.js          App definitions (id, title, component, size, etc.)
│   └── appIcons.jsx            SVG icons keyed by app id
├── hooks/
│   └── useApi.js               Shared hook for future API/AI calls
├── components/
│   ├── Desktop/                Root layout
│   ├── Window/                 Reusable window shell (drag, resize, minimize, maximize)
│   ├── DesktopIcon/            Desktop shortcut icons
│   ├── Taskbar/                Taskbar, StartMenu, Clock
│   └── ErrorBoundary/          Catches app crashes gracefully
└── apps/
    ├── Calculator/             Demo app (can be removed/kept as needed)
    └── Notepad/                Demo app (can be removed/kept as needed)
```

### How to Add a New App

1. Create `src/apps/MyApp/MyApp.jsx` and `MyApp.css`
2. Add SVG icon to `src/registry/appIcons.jsx`
3. Add entry to `src/registry/appRegistry.js`:
   ```js
   {
     id: 'myapp',
     title: 'My App',
     icon: 'myapp',
     component: MyApp,
     defaultSize: { width: 500, height: 400 },
     allowMultiple: false,
   }
   ```
No changes to Desktop, Taskbar, Window, or any other component needed.

### How to Add a New Theme

1. Create `src/themes/myTheme.js` with color/font/border config (copy an existing theme as template)
2. Import and add to `src/themes/index.js`

### For AI-Powered Apps

- Use the `useApi` hook (`src/hooks/useApi.js`) for backend calls
- Set `VITE_API_URL` env var to point to your FastAPI backend
- Hook provides `{ request, loading, error, cancel }` with automatic abort

### Production Hosting

- `npm run build` outputs to `dist/` with hashed filenames for cache-busting
- Vendor chunk (React) cached separately from app code
- `npm run preview` serves the production build locally for testing
- Deploy `dist/` to any static host (Vercel, Netlify, Nginx, etc.)

---

## What's Next

### Authentication Strategy (Decided)

The OS should be **open by default** — no signup wall. Auth is handled per-app, not at the OS level.

**Three tiers:**

| Tier | Auth | Use Case | Example |
|------|------|----------|---------|
| **None** | No account needed | Self-contained client-side apps | Calculator, games, tools |
| **Optional** | Better with account, works without | Apps with cloud save or leaderboards | Notepad with cloud sync |
| **Required** | Must be logged in | Apps that cost money to run (API calls) | AI chat, image generation |

**Implementation plan:**
- Build an `AuthContext` (similar to ThemeContext/WindowManagerContext)
- Exposes `{ user, login, logout, isAuthenticated }`
- Each app in `appRegistry.js` gets an `authRequired: 'none' | 'optional' | 'required'` field
- If `required` and not logged in, the Window shows a login prompt *inside the window* (stays in the OS metaphor — no page redirects)
- For `optional`, the app receives `user` as a prop and adapts behavior
- Auth backend: email/password or OAuth (Google) via FastAPI, JWT in localStorage

### Backend (When Needed)

- Python + FastAPI — lightweight API layer
- Only needed when apps require server-side logic (AI, auth, cloud storage)
- React frontend never directly calls AI APIs (keys stay server-side)
- Non-AI apps require no backend

### Platform Polish

- Theme switcher app (UI for selecting themes in-app)
- More themes + user-customizable themes
- Window animations
- Alt+Tab window switching
- Retro cursor assets / UI sounds
