# RetroOS — Development Documentation

## Project Vision

RetroOS is a browser-based desktop environment that serves as a platform for releasing apps and games. Users visit the site, log in, and get their own persistent retro desktop. They can launch apps, customize their OS, and have their data tied to their account. The OS itself is the product — every app lives inside it.

The visual identity is a custom retro desktop inspired by Linux desktop environments (GTK themes, beveled borders, teal/purple palette). It is deliberately **not** a Windows clone.

**Target deployment:** Hosted on a rented Linux server, accessible via web browser.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Build tool | Vite 8 | Dev server on port 5173, production build to `dist/` |
| UI framework | React 19 | JavaScript (not TypeScript), ES modules |
| Window dragging | react-draggable 4.x | Wraps all windows, disabled when maximized/minimized |
| Styling | CSS custom properties | Theme-driven, no CSS-in-JS, no preprocessors |
| State management | React Context + useReducer | WindowManager uses useReducer; Auth/Theme/FileSystem use useState |
| AI (local dev) | Ollama (llama3.2) | Direct fetch from browser, no backend proxy |
| Persistence | localStorage | User session, theme choice, virtual file system |
| Linting | ESLint 9 + React plugins | `npm run lint` |

**No backend exists yet.** The entire app is a static SPA. Auth is mocked, files are in localStorage, and Ollama is called directly from the browser.

---

## Current Status

### Desktop Shell
- Full-viewport themed desktop with icon grid
- Draggable, resizable windows with minimize/maximize/close, z-index stacking, title bar double-click to maximize
- Taskbar with app buttons (click to focus/minimize/restore), Start Menu, live clock
- Error boundary per app — crashed apps show a retro error dialog without taking down the desktop
- Window state preserved across minimize/maximize (no component remounting)
- Window open/close animations (CSS scale+fade, 150ms)
- Boot screen with POST text, loading bar, and logo (once per browser session)
- Right-click context menus on Desktop, Desktop Icons, and File Manager items
- Notification toast system — bottom-right popups with auto-dismiss (info/success/error)

### Authentication
- Login screen gates the entire OS
- `AuthContext` provides `{ user, isAuthenticated, login, logout }`
- Start menu shows username and "Log Off" option
- **Currently a frontend-only mock** — any username/password accepted, session in localStorage

### Theme System
- GTK-inspired engine: each theme is a JS config mapping to CSS custom properties on `:root`
- All component CSS uses `var(--color-*)` — zero hardcoded colors
- 3 preset themes: **RetroOS Classic** (warm gray, purple title bars, beveled), **Arctic** (dark navy, flat borders, cyan accents), **Olive** (earthy green, beveled)
- Themes control: colors, fonts, font sizes, border style (beveled vs flat), border radius, taskbar/title bar height, icon size
- Theme choice persisted in localStorage

### Virtual File System
- In-memory directory tree persisted to localStorage
- `FileSystemContext` provides: `readDir`, `readFile`, `writeFile`, `createDir`, `deleteNode`, `rename`, `exists`, `getNodeType`
- Default directories: `/Documents`, `/Desktop`, `/Pictures`, `/Games` (auto-created on first game save)
- Reusable `FileDialog` component (Save As / Open) available to any app

### Apps (12 total)

| App | Description |
|-----|-------------|
| **Calculator** | Chained operations, keyboard shortcuts, single instance |
| **Notepad** | File > New/Open/Save/Save As, Ctrl+S/O/Shift+S, integrates with virtual file system |
| **File Manager** | Navigate directories, create/rename/delete, double-click opens in Notepad, context menus |
| **Personalization** | Theme switcher with mini desktop previews (system app — Start Menu only) |
| **Terminal** | Commands: ls, cd, cat, mkdir, rm, touch, echo, pwd, whoami, date, clear, help. Command history |
| **Minesweeper** | 3 difficulties, flood-fill reveal, flag toggle, timer, mine counter, win/loss notifications |
| **Arcade Cabinet** | 4 mini-games (Breakout, Space Shooter, Pong, Runner). Canvas-rendered, per-game high scores |
| **Hacking Simulator** | 8 levels across 4 types (Cipher, Password, Filesystem, Exploit). Progress saved to file system |
| **Pixel Studio** | Canvas sizes 16/32/64. Tools: pencil, eraser, fill, line, rectangle. 32 colors + custom picker. Undo/redo. Exports PNG |
| **Chiptune Maker** | 4 tracks, 32 steps, tracker-grid. Waveforms: square/triangle/sawtooth/sine. BPM, loop, ADSR. Save/load JSON |
| **Radio** | 6 ambient stations. Play/pause, volume, animated EQ bars. Placeholder Web Audio tones |
| **Realms of Adventure** | AI text RPG (see below) |

### Realms of Adventure

A text-based RPG where a local AI (Ollama / llama3.2) acts as Game Master.

- 4 realms (Fantasy, Cyberpunk, Horror, Sci-Fi) each with a unique system prompt
- 3 detail levels: Brief, Standard, Detailed
- Free-response input — player types whatever they want
- ~10-15 turns per adventure; game end detected via "THE END" after turn 10
- Transcript saved to `/Games/` in real time (updates after every message)
- Past adventures viewable in-app or via File Manager + Notepad
- Calls Ollama at `http://localhost:11434/api/chat` (non-streaming, full conversation history sent each call)

---

## Architecture

```
src/
├── main.jsx                    Entry point
├── App.jsx                     Provider tree: Theme → Auth → [Boot → Login → FS → WM → Notifications → ContextMenu → Desktop]
├── styles/                     reset.css, variables.css (fallbacks), global.css
├── themes/                     index.js (registry), retroClassic.js, arctic.js, olive.js
├── context/
│   ├── AuthContext.jsx          { user, isAuthenticated, login, logout }
│   ├── FileSystemContext.jsx    Wraps fileSystem.js, triggers re-renders
│   ├── ThemeContext.jsx         Applies CSS vars to :root, persists to localStorage
│   ├── WindowManagerContext.jsx useReducer: open/close/minimize/maximize/focus/resize/updateTitle
│   ├── NotificationContext.jsx  notify(message, options?), dismiss(id), auto-dismiss
│   └── ContextMenuContext.jsx   showContextMenu(event, items[]), hideContextMenu()
├── services/fileSystem.js      Virtual FS engine (tree in memory → localStorage)
├── registry/
│   ├── appRegistry.js          App definitions array + getApp(id)
│   └── appIcons.jsx            SVG icons keyed by app id
├── utils/
│   ├── pathUtils.js            resolvePath, getFileName, getParentPath, joinPath
│   └── audioUtils.js           NOTE_FREQUENCIES, playNote, createADSR, createNoiseBuffer
├── hooks/
│   ├── useApi.js               Generic fetch hook (unused — ready for backend)
│   ├── useGameLoop.js          requestAnimationFrame wrapper with delta time + cleanup
│   └── useAudioContext.js      AudioContext singleton, browser autoplay policy handling
├── components/
│   ├── Desktop/                Icon grid + open windows + taskbar + context menu
│   ├── Window/                 Draggable/resizable shell with animations
│   ├── DesktopIcon/            Desktop shortcut with right-click menu
│   ├── Taskbar/                Bar + StartMenu + TaskbarClock
│   ├── LoginScreen/            Login form over themed background
│   ├── BootScreen/             POST text → loading bar → logo
│   ├── FileDialog/             Save As / Open dialog with folder navigation
│   ├── ErrorBoundary/          Per-app crash boundary
│   ├── NotificationArea/       Toast notifications
│   ├── ContextMenu/            Right-click menus
│   └── TerminalView/           Shared terminal renderer (scrollable output + input + cursor)
└── apps/                       One folder per app (component + CSS + hooks/helpers)
```

### Provider Nesting (App.jsx)

```
ThemeProvider                    ← always mounted (themes work on login screen too)
  AuthProvider                   ← always mounted
    AppContent                   ← BootScreen (once) → LoginScreen → Desktop
      FileSystemProvider         ← only when authenticated
        WindowManagerProvider
          NotificationProvider
            ContextMenuProvider
              Desktop
```

Logging out unmounts the FileSystem + WindowManager tree, giving a clean slate on next login.

### Key Patterns

- **App Registry** — Add an entry to `appRegistry.js` + icon to `appIcons.jsx` and the app appears on desktop and Start Menu automatically. `systemApp: true` hides from desktop. `allowMultiple` controls instances.
- **App Props** — `openWindow(appId, appProps)` passes data to instances. Apps receive `{ windowId, appProps }`.
- **Dynamic Window Titles** — Apps call `updateWindowTitle(windowId, 'new title')` to update their title bar.
- **CSS Theming** — Every visual property references a CSS variable. See `src/themes/retroClassic.js` for the full variable list.

---

## How to Add a New App

1. Create `src/apps/MyApp/MyApp.jsx` (receives `{ windowId, appProps }`) and `MyApp.css`
2. Add an SVG icon to `src/registry/appIcons.jsx` under a unique key
3. Add an entry to `src/registry/appRegistry.js`:
   ```js
   {
     id: 'myapp',
     title: 'My App',
     icon: 'myapp',
     component: MyApp,
     defaultSize: { width: 500, height: 400 },
     allowMultiple: false,
     // systemApp: true,  // hides from desktop icons
   }
   ```

No changes to Desktop, Taskbar, Window, or any other component needed.

## How to Add a New Theme

1. Copy `src/themes/retroClassic.js` to `src/themes/myTheme.js`
2. Change the `id` and `name`, adjust colors/fonts/borders
3. Import and add to `src/themes/index.js`

The theme automatically appears in the Personalization app.

---

## Deployment Checklist

Everything that needs to change before going live on a production server.

### 1. Authentication (Critical)

Current auth is a frontend-only mock. Replace with real auth before production.

- Build a backend auth service (planned: Python + FastAPI)
- Implement email/password registration + login (OAuth optional for beta)
- JWT tokens in httpOnly cookies (not localStorage)
- Update `AuthContext.jsx` to call the backend for login/logout/session validation

### 2. Virtual File System (Critical)

Currently in localStorage — data lost on browser clear, no cross-device access, ~5-10MB limit, shared across users on the same browser.

- Build a per-user file CRUD API
- Update `fileSystem.js` / `FileSystemContext.jsx` to sync with the server
- Consider localStorage as a cache layer with server as source of truth

### 3. AI Backend (Critical)

Ollama is called directly from the browser at `localhost:11434`. Won't work in production.

- Build an AI proxy endpoint (FastAPI) with auth validation and rate limiting
- Make the model configurable (env variable)
- Update `useOllama.js` to call the proxy instead of Ollama directly
- Decide: self-host Ollama vs hosted API (OpenAI, Anthropic, etc.)

### 4. User Settings Persistence

Theme choice is in localStorage — not tied to user account.

- Save preferences to the server on login, fall back to defaults if unavailable

### 5. Static Hosting

```bash
npm run build   # outputs to dist/
```

Serve `dist/` with Nginx/Caddy. Requirements: SPA fallback (`try_files $uri /index.html`), gzip/brotli, HTTPS, reverse proxy `/api/*` to FastAPI.

### 6. Environment Variables

`VITE_API_URL` (defaults to `/api`) — set at build time. The `useApi.js` hook reads this.

---

## Roadmap

### Phase 4: Backend & Real Auth (Next)
- Python + FastAPI backend
- Real authentication (email/password + JWT)
- Per-user file system storage (replace localStorage)
- Per-user settings persistence
- AI proxy endpoint with rate limiting

### Phase 5: Personalization Expansion
- Wallpapers (preset + custom upload)
- More themes + custom accent color picker
- Font selection, icon packs, cursor themes, UI sounds

### Phase 6: Monetization & Launch
- Stripe integration for premium subscriptions
- AI usage tracking and tier limits
- Premium cosmetic content
- Public beta launch

### Desktop Polish Backlog
- Startup sound / UI sound effects
- Screen saver (starfield, bouncing logo, matrix rain)
- Alt+Tab window switcher
- Desktop icon drag & drop
- Taskbar system tray

---

## Monetization Strategy

### The Core Insight

Every app except Realms of Adventure is free to serve (static files + small database). The AI game is the only thing with meaningful per-user cost. This creates a natural paywall boundary: **AI is the premium feature.**

### Freemium Model

**Free tier:** Full desktop with all non-AI apps, all preset themes/wallpapers, basic customization, 5MB storage, 3-5 free AI sessions/month.

**Premium tier ($3-5/month or $30-50/year):** Unlimited AI sessions, future AI apps, premium themes/icon packs, custom theme creator, 50MB+ storage, early access to new apps.

### Supplementary Revenue Options
- **AI Credit Packs** — 10 sessions for $2, 50 for $8 (for occasional players)
- **Cosmetic Marketplace** — Premium theme/icon/sound packs ($1-2 each)
- **App Marketplace (long-term)** — Third-party developers build RetroOS apps, 30% revenue share

### Implementation Steps
1. **With backend:** Add `subscription_tier` to users, track AI usage per month, show upgrade prompt at limit
2. **Payment:** Stripe Checkout for subscriptions, "Manage Subscription" in Start Menu
3. **Expand:** More AI apps, cosmetic marketplace, credit packs

### Keeping AI Costs Down
- Use cheaper models (GPT-4o-mini, Claude Haiku) instead of self-hosting a GPU
- Cache common openings (pre-generate first response per realm)
- Cap games at 20 turns
- Hosted API > self-hosted GPU when small (zero fixed cost, pay per use)

### What NOT to Do
- Don't gate basic apps behind payment
- Don't show ads (destroys the immersion)
- Don't charge for accounts
- Don't make the free tier feel like a demo

---

## Future AI App Ideas (Premium)

| App | Concept |
|-----|---------|
| **AI Chat Companion** | A character with personality that lives in your OS. Remembers past conversations. |
| **Story Forge** | Collaborative writing — you write a sentence, AI writes the next. Freeform, not a structured game. |
| **AI Realm Creator** | Design custom Realms of Adventure settings. Describe your world, AI generates the system prompt. |
| **AI Art Generator** | Text-to-image in a Paint-like interface. Results save to `/Pictures`. |
| **AI Tutor** | Structured educational app — explanations, topic tracking, quizzes. |

---

## Deployment Info

Fill in these fields before running `deploy/setup.sh`:

| Field | Value |
|-------|-------|
| **Server public IP** | 204.168.205.146 |
| **Git repo URL** | https://github.com/SilverBoi78/retroos.git |
| **SSH user** | root |

### How to deploy (first time)

```bash
# SSH into your server
ssh <user>@<server-ip>

# Clone the repo (or copy setup.sh to the server first)
git clone <repo-url> /opt/retroos
cd /opt/retroos

# Run setup
chmod +x deploy/setup.sh
sudo bash deploy/setup.sh <repo-url>
```

### How to update (after pushing changes)

```bash
ssh <user>@<server-ip>
cd /opt/retroos
bash deploy/update.sh
```

---

## Development Quick Reference

```bash
npm install            # install dependencies
npm run dev            # start dev server at http://localhost:5173
npm run build          # production build to dist/
npm run preview        # preview production build at http://localhost:4173
npm run lint           # run ESLint
```

**Realms of Adventure requires Ollama running locally:**
```bash
ollama serve           # start Ollama (default port 11434)
ollama run llama3.2    # ensure the model is pulled
```

**localStorage keys used:**
- `retroos-user` — auth session (JSON)
- `retroos-theme` — theme ID (string)
- `retroos-filesystem` — entire virtual file system (JSON)
