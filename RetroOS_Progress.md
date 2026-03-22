# RetroOS — Development Documentation

## Project Vision

RetroOS is a browser-based desktop environment that serves as a platform for releasing apps and games. Users visit the site, log in, and get their own persistent retro desktop. They can launch apps, customize their OS, and have their data tied to their account. The OS itself is the product — every app lives inside it.

The visual identity is a custom retro desktop inspired by Linux desktop environments (GTK themes, beveled borders, teal/purple palette). It is deliberately **not** a Windows clone.

**Target deployment:** Hosted on a rented Linux server, accessible via web browser. See the [Hosting & Deployment Notes](#hosting--deployment-notes) section for what needs to change before going live.

---

## Current Status

### What's Working

**Desktop Shell**
- Full-viewport themed desktop with icon grid
- Draggable, resizable windows (react-draggable) with minimize/maximize/close
- Z-index stacking — click to focus, title bar double-click to maximize
- Taskbar with app buttons (click to focus/minimize/restore), Start Menu, live clock
- Error boundary per app — a crashed app shows a retro error dialog without taking down the desktop
- Window state is preserved across minimize/maximize (no component remounting)

**Universal Authentication**
- Login screen gates the entire OS — users must log in to access their desktop
- `AuthContext` provides `{ user, isAuthenticated, login, logout }` to all components
- Start menu shows the logged-in username and a "Log Off" option
- Window state resets on logout (fresh session each login)
- **Currently a frontend-only mock** — any username/password is accepted, session stored in localStorage. Must be replaced with real auth before production (see [What's Next](#whats-next))

**Theme System**
- GTK-inspired theme engine: each theme is a JS config object mapping to CSS custom properties
- `ThemeContext` applies themes at runtime by setting CSS variables on `:root`
- All component CSS uses `var(--color-*)` — zero hardcoded colors anywhere
- 3 preset themes:
  - **RetroOS Classic** — warm gray chrome, purple title bars, teal desktop, beveled borders
  - **Arctic** — dark navy/gray, flat borders, cyan/blue accents
  - **Olive** — earthy green tones, beveled borders, neutral palette
- Themes control: colors, fonts, font sizes, border style (beveled vs flat), border radius, taskbar height, title bar height, icon size
- Theme choice persisted in localStorage (`retroos-theme`)
- Supports two border rendering modes: 4-layer inset box-shadows for "beveled" (Classic/Olive) and single-pixel borders for "flat" (Arctic)

**Personalization App**
- Accessible from the Start Menu under system utilities (below a divider, separate from user apps)
- Theme switcher with mini desktop preview thumbnails for each theme
- System apps (`systemApp: true` in registry) don't appear as desktop icons — only in Start Menu
- Designed to be extensible: future customization options (wallpapers, fonts, sounds, icon packs) can be added as new sections in this app

**Virtual File System**
- In-memory directory tree with files and folders, persisted to localStorage (`retroos-filesystem`)
- `FileSystemContext` provides: `readDir`, `readFile`, `writeFile`, `createDir`, `deleteNode`, `rename`, `exists`, `getNodeType`
- Default directories created on first load: `/Documents`, `/Desktop`, `/Pictures`
- `/Games` directory created automatically when the first game is saved
- Reusable `FileDialog` component (Save As / Open) available to any app — used by Notepad

**Apps**

| App | Description | Key Details |
|-----|-------------|-------------|
| **Calculator** | Full arithmetic calculator | Chained operations, keyboard shortcuts, single instance |
| **Notepad** | Text editor | File > New/Open/Save/Save As, Ctrl+S/Ctrl+O/Ctrl+Shift+S, integrates with virtual file system, window title shows filename |
| **File Manager** | File/folder browser | Navigate directories, create folders, rename (F2), delete (Del), double-click files to open in Notepad, address bar, status bar |
| **Realms of Adventure** | AI text adventure game | See dedicated section below |
| **Personalization** | Theme switcher (system app) | Mini previews, instant apply, extensible for future options |

### Realms of Adventure — Details

A text-based RPG where a local AI (Ollama with llama3.2) acts as Game Master.

**Gameplay:**
- 4 realms: Fantasy, Cyberpunk, Horror, Sci-Fi — each has a unique system prompt with setting-specific tone and world
- 3 response detail levels: Brief (1 paragraph), Standard (2 paragraphs), Detailed (2-3 paragraphs)
- Free-response input — no multiple choice, the player types whatever they want to do
- ~10-15 turns per adventure with pacing hints injected into the AI context
- Game end detection: AI includes "THE END" in its final response (only triggers after turn 10 to prevent premature endings)

**Saving:**
- Transcript is saved to the virtual file system in real time — the `.txt` file in `/Games/` is updated after every player message and every AI response
- If the player quits mid-game, the transcript up to that point is already saved (marked "In Progress")
- Completed games are marked "Complete" with a footer
- Files named by realm and timestamp: e.g., `Fantasy_2026-03-22_14-30.txt`
- Past adventures viewable inside the app (Past Adventures screen) or by browsing `/Games/` in File Manager and opening in Notepad

**AI Integration:**
- Calls Ollama locally at `http://localhost:11434/api/chat`
- Model: `llama3.2` (hardcoded in `src/apps/RealmsOfAdventure/useOllama.js`)
- Non-streaming mode (`stream: false`) — full response returned at once
- Full conversation history sent on every call so the AI maintains context
- A hidden kickoff message ("Begin the adventure.") is sent on game start so the AI immediately narrates the opening scene — this message is filtered from the UI and saved transcripts

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

## Architecture

```
src/
├── main.jsx                    Entry point (imports CSS, renders App)
├── App.jsx                     Provider tree: Theme → Auth → [FileSystem → WindowManager → Desktop]
│                                (FileSystem + WindowManager only mount when authenticated)
├── styles/
│   ├── reset.css               Browser reset
│   ├── variables.css           CSS custom property fallbacks (used if ThemeContext fails)
│   └── global.css              Body styles, scrollbars, selection highlight
├── themes/
│   ├── index.js                Theme registry: getTheme(id), getThemeList()
│   ├── retroClassic.js         Default theme config
│   ├── arctic.js               Dark flat theme config
│   └── olive.js                Earthy beveled theme config
├── context/
│   ├── AuthContext.jsx          { user, isAuthenticated, login, logout }
│   ├── FileSystemContext.jsx    Wraps fileSystem.js, triggers re-renders on changes
│   ├── ThemeContext.jsx         Applies theme CSS vars to :root, persists to localStorage
│   └── WindowManagerContext.jsx useReducer: open/close/minimize/maximize/focus/resize/updateTitle
├── services/
│   └── fileSystem.js           Virtual FS engine: tree in memory, serialized to localStorage
├── registry/
│   ├── appRegistry.js          App definitions array + getApp(id) lookup
│   └── appIcons.jsx            SVG icons keyed by app id
├── hooks/
│   └── useApi.js               Generic fetch hook (unused currently, ready for backend)
├── components/
│   ├── Desktop/                Renders icon grid + open windows + taskbar
│   ├── Window/                 Draggable/resizable window shell, display:none when minimized
│   ├── DesktopIcon/            Desktop shortcut (double-click to open, single-click to select)
│   ├── Taskbar/                Taskbar bar + StartMenu + TaskbarClock
│   ├── LoginScreen/            Login form over themed desktop background
│   ├── FileDialog/             Reusable Save As / Open dialog with folder navigation
│   └── ErrorBoundary/          Per-app crash boundary with retro error dialog
└── apps/
    ├── Calculator/             Calculator.jsx + Calculator.css
    ├── Notepad/                Notepad.jsx + Notepad.css (uses FileDialog + FileSystemContext)
    ├── FileManager/            FileManager.jsx + FileManager.css (uses FileSystemContext)
    ├── RealmsOfAdventure/      RealmsOfAdventure.jsx (root), MainMenu.jsx, GameScreen.jsx,
    │                           PastAdventures.jsx, useOllama.js, systemPrompt.js, .css
    └── Personalization/        Personalization.jsx + Personalization.css (uses ThemeContext)
```

### Provider Nesting Order (App.jsx)

```
ThemeProvider                    ← always mounted (themes work on login screen too)
  AuthProvider                   ← always mounted
    AppContent                   ← if not authenticated: LoginScreen
      FileSystemProvider         ← only when authenticated
        WindowManagerProvider    ← only when authenticated
          Desktop                ← the OS
```

This means logging out unmounts the entire FileSystem + WindowManager tree, giving a clean slate on next login.

### Key Patterns

**App Registry** — Single source of truth for all apps. Add an entry to `appRegistry.js` and an icon to `appIcons.jsx` and the app automatically appears on the desktop and in the Start Menu. Set `systemApp: true` to hide from desktop (Start Menu only). Set `allowMultiple: true/false` to control instance behavior.

**App Props** — `openWindow(appId, appProps)` passes custom data to app instances. Apps receive `{ windowId, appProps }`. Used by File Manager to open files in Notepad: `openWindow('notepad', { filePath: '/Documents/hello.txt' })`.

**Dynamic Window Titles** — Apps call `updateWindowTitle(windowId, 'new title')` to change their title bar text (e.g., Notepad shows the filename).

**CSS Theming** — Every color, font, border, and dimension references a CSS variable. To add a new themed component, use existing variables like `var(--color-surface)`, `var(--color-highlight)`, `var(--border-button)`, etc. Check `src/themes/retroClassic.js` for the full variable list.

---

## How to Add a New App

1. Create `src/apps/MyApp/MyApp.jsx` (receives `{ windowId, appProps }`) and `MyApp.css`
2. Add an SVG icon to `src/registry/appIcons.jsx` under a unique key
3. Add an entry to `src/registry/appRegistry.js`:
   ```js
   {
     id: 'myapp',
     title: 'My App',
     icon: 'myapp',           // matches appIcons key
     component: MyApp,
     defaultSize: { width: 500, height: 400 },
     allowMultiple: false,     // true = can open multiple instances
     // systemApp: true,       // uncomment to hide from desktop icons
   }
   ```
No changes to Desktop, Taskbar, Window, or any other component needed.

## How to Add a New Theme

1. Copy `src/themes/retroClassic.js` to `src/themes/myTheme.js`
2. Change the `id` and `name` fields, adjust colors/fonts/borders
3. Import and add to `src/themes/index.js`
4. The theme automatically appears in the Personalization app

---

## Hosting & Deployment Notes

> **This section lists everything that needs to change before deploying to a production Linux server.**

### 1. Authentication (CRITICAL)

The current auth is a **frontend-only mock** — it accepts any username/password and stores the session in localStorage. This must be replaced before production.

**What needs to happen:**
- Build a backend auth service (planned: Python + FastAPI)
- Implement real login with email/password and/or OAuth (Google)
- Use JWT tokens stored in httpOnly cookies (not localStorage — vulnerable to XSS)
- `AuthContext.jsx` needs to be updated to call the backend for login/logout/session validation
- Add a registration flow (currently there's no sign-up, only login)

**Files to modify:** `src/context/AuthContext.jsx`, `src/components/LoginScreen/LoginScreen.jsx`

### 2. Virtual File System (CRITICAL)

The file system lives entirely in the browser's localStorage. This means:
- Data is lost if the user clears browser data
- No cross-device access
- localStorage has a ~5-10MB limit (will hit this quickly with game transcripts and user files)
- All users on the same browser share the same filesystem

**What needs to happen:**
- Build a backend storage API (per-user file CRUD endpoints)
- `FileSystemContext.jsx` / `fileSystem.js` need to sync with the server instead of (or in addition to) localStorage
- Consider using localStorage as a cache layer with server as source of truth

**Files to modify:** `src/services/fileSystem.js`, `src/context/FileSystemContext.jsx`

### 3. Realms of Adventure — AI Backend (CRITICAL)

Currently calls Ollama directly from the browser at `http://localhost:11434`. This will not work in production because:
- Ollama runs locally on the dev machine, not on the server users connect to
- Even if Ollama were on the server, exposing it directly to the internet is a security risk (no auth, no rate limiting)
- The model name `llama3.2` is hardcoded

**What needs to happen:**
- Set up an AI backend proxy (FastAPI endpoint that receives the conversation and forwards it to Ollama/any LLM)
- Add rate limiting, auth token validation, and abuse prevention
- Make the model configurable (environment variable or admin setting)
- The `useOllama.js` hook should be updated to call the backend proxy instead of Ollama directly
- Consider whether to run Ollama on the same server or use a hosted LLM API (OpenAI, Anthropic, etc.) for production

**Files to modify:** `src/apps/RealmsOfAdventure/useOllama.js`

### 4. Theme/Settings Persistence

Theme choice is stored in localStorage (`retroos-theme`). This works but isn't tied to the user account — if they log in on another device, their theme resets.

**What needs to happen:**
- Once the backend exists, save user preferences (theme, future personalization options) to the server, tied to the user account
- Load preferences on login, fall back to defaults if unavailable

**Files to modify:** `src/context/ThemeContext.jsx`

### 5. Static Hosting Setup

The frontend is a standard Vite SPA. For production:

```bash
npm run build          # outputs to dist/
```

Serve `dist/` with any web server (Nginx, Caddy, etc.). You need:
- **SPA fallback:** All routes should serve `index.html` (there's no client-side routing currently, but good practice)
- **Gzip/Brotli compression** for the JS/CSS bundles
- **HTTPS** (required for secure cookies, service workers, and general security)
- **Reverse proxy** to the backend API (e.g., Nginx proxies `/api/*` to FastAPI)

Example Nginx config:
```nginx
server {
    listen 443 ssl;
    server_name retroos.example.com;

    root /var/www/retroos/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
    }
}
```

### 6. Environment Variables

Currently only one is referenced (and unused): `VITE_API_URL` (defaults to `/api`). When the backend is built:
- Set `VITE_API_URL` at build time to point to the API base path
- The `useApi.js` hook already reads this

---

## What's Next

### Phase 3: Backend & Real Auth
- Python + FastAPI backend
- Real authentication (email/password, OAuth)
- Per-user file system storage (replace localStorage)
- Per-user settings/preferences persistence
- AI proxy endpoint for Realms of Adventure (with rate limiting)

### Phase 4: Personalization Expansion
- Custom wallpapers / desktop backgrounds
- User-defined color schemes (custom themes)
- Font selection
- Icon packs / cursor themes
- UI sounds and sound packs

### Phase 5: Platform Polish
- More preset themes
- Window open/close/minimize animations
- Alt+Tab window switching
- Retro cursor assets
- Right-click context menus on desktop and files
- Drag-and-drop desktop icon rearrangement

### Future App Ideas
- More games (to be decided)
- Image viewer (for /Pictures directory)
- Settings / System Info app
- Terminal emulator

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
