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

**Desktop Polish**
- Window open/close animations (CSS scale+fade, 150ms)
- Boot screen with POST text sequence, loading bar, and RetroOS logo (session-based, shows once per browser session)
- Right-click context menus on Desktop (Open Terminal, File Manager, Personalization), Desktop Icons (Open), and File Manager items (Open, Rename, Delete) + empty area (New Folder)
- Notification toast system — bottom-right popups with auto-dismiss, supports info/success/error types
- Notifications wired into: Notepad (file save), Pixel Studio (file save), Minesweeper (win/loss), Arcade Cabinet (game over + score), Hacking Simulator (level complete)

**Apps**

| App | Description | Key Details |
|-----|-------------|-------------|
| **Calculator** | Full arithmetic calculator | Chained operations, keyboard shortcuts, single instance |
| **Notepad** | Text editor | File > New/Open/Save/Save As, Ctrl+S/Ctrl+O/Ctrl+Shift+S, integrates with virtual file system, window title shows filename, save notifications |
| **File Manager** | File/folder browser | Navigate directories, create folders, rename (F2), delete (Del), double-click files to open in Notepad, address bar, status bar, right-click context menus |
| **Realms of Adventure** | AI text adventure game | See dedicated section below |
| **Personalization** | Theme switcher (system app) | Mini previews, instant apply, extensible for future options |
| **Terminal** | Retro command-line terminal | Commands: ls, cd, cat, mkdir, rm, touch, echo, pwd, whoami, date, clear, help. Operates on virtual file system, command history (up/down arrows), multi-instance |
| **Minesweeper** | Classic minesweeper | 3 difficulties (Beginner/Intermediate/Expert), mines placed after first click, flood-fill reveal, flag toggle, timer, mine counter, smiley reset, win/loss notifications |
| **Arcade Cabinet** | Collection of 4 mini-games | Breakout, Space Shooter, Pong, Runner. Canvas-rendered with requestAnimationFrame game loop. Per-game high scores saved to `/Games/ArcadeHighScores.json`. Game selection menu with descriptions |
| **Hacking Simulator** | Terminal puzzle game | 8 levels across 4 types: Cipher (ROT13/base64), Password (clue-based), Filesystem (navigate fake FS), Exploit (scan/connect/exploit/extract). Progress saved to `/Games/HackingSim.json`. Level completion notifications |
| **Pixel Studio** | Pixel art editor | Canvas sizes: 16x16, 32x32, 64x64. Tools: pencil, eraser, fill (flood), line (Bresenham), rectangle. 32 preset colors + custom color picker. Undo/redo (50 deep). Exports PNG to `/Pictures/`. Save notifications |
| **Chiptune Maker** | Retro music sequencer | 4 tracks, 32 steps, tracker-grid interface. Waveforms: square, triangle, sawtooth, sine. BPM control, loop toggle. Web Audio scheduled playback with ADSR envelopes. Save/load songs as JSON to `/Music/` |
| **Radio** | Ambient vibe player | 6 stations (Lo-Fi Rain, Space Drift, Retro Static, Forest Night, Deep Focus, Chiptune Beats). Play/pause, prev/next, volume. CSS animated EQ bars. Placeholder Web Audio tones (structured for real audio swap later) |

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
├── App.jsx                     Provider tree: Theme → Auth → [Boot → Login → FS → WM → Notifications → ContextMenu → Desktop]
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
│   ├── WindowManagerContext.jsx useReducer: open/close/minimize/maximize/focus/resize/updateTitle + close animations
│   ├── NotificationContext.jsx  notify(message, options?), dismiss(id), auto-dismiss timer
│   └── ContextMenuContext.jsx   showContextMenu(event, items[]), hideContextMenu()
├── services/
│   └── fileSystem.js           Virtual FS engine: tree in memory, serialized to localStorage
├── registry/
│   ├── appRegistry.js          App definitions array + getApp(id) lookup (12 apps)
│   └── appIcons.jsx            SVG icons keyed by app id (12 icons)
├── utils/
│   ├── pathUtils.js            resolvePath, getFileName, getParentPath, joinPath
│   └── audioUtils.js           NOTE_FREQUENCIES, playNote, createADSR, createNoiseBuffer
├── hooks/
│   ├── useApi.js               Generic fetch hook (unused currently, ready for backend)
│   ├── useGameLoop.js          requestAnimationFrame wrapper with delta time + cleanup
│   └── useAudioContext.js      AudioContext singleton, browser autoplay policy handling
├── components/
│   ├── Desktop/                Renders icon grid + open windows + taskbar + context menu
│   ├── Window/                 Draggable/resizable window shell with open/close animations
│   ├── DesktopIcon/            Desktop shortcut with right-click context menu
│   ├── Taskbar/                Taskbar bar + StartMenu + TaskbarClock
│   ├── LoginScreen/            Login form over themed desktop background
│   ├── BootScreen/             Animated boot sequence (POST text → loading bar → logo)
│   ├── FileDialog/             Reusable Save As / Open dialog with folder navigation
│   ├── ErrorBoundary/          Per-app crash boundary with retro error dialog
│   ├── NotificationArea/       Toast notifications (bottom-right, auto-dismiss)
│   ├── ContextMenu/            Right-click context menus (positioned at cursor)
│   └── TerminalView/           Shared terminal renderer (scrollable output + input + cursor)
└── apps/
    ├── Calculator/             Calculator.jsx + .css
    ├── Notepad/                Notepad.jsx + .css (file system, save notifications)
    ├── FileManager/            FileManager.jsx + .css (file system, context menus)
    ├── RealmsOfAdventure/      RealmsOfAdventure.jsx, MainMenu, GameScreen, PastAdventures, useOllama, systemPrompt
    ├── Personalization/        Personalization.jsx + .css (theme switcher)
    ├── Terminal/               Terminal.jsx + .css + commands.js (uses TerminalView)
    ├── Minesweeper/            Minesweeper.jsx + .css + useMinesweeper.js
    ├── ArcadeCabinet/          ArcadeCabinet.jsx + .css, GameMenu, games/{Breakout,SpaceShooter,Pong,Runner}, useHighScores
    ├── HackingSim/             HackingSim.jsx + .css, LevelSelect, HackingTerminal, useHackingGame, levels/{cipher,password,filesystem,exploit}
    ├── PixelStudio/            PixelStudio.jsx + .css, Canvas, Toolbar, ColorPalette, usePixelCanvas
    ├── ChiptuneMaker/          ChiptuneMaker.jsx + .css, TrackerGrid, InstrumentPanel, TransportBar, useAudioEngine, noteFrequencies
    └── Radio/                  Radio.jsx + .css, StationList, NowPlaying, useRadioPlayer, stations
```

### Provider Nesting Order (App.jsx)

```
ThemeProvider                    ← always mounted (themes work on login screen too)
  AuthProvider                   ← always mounted
    AppContent                   ← BootScreen (once per session) → LoginScreen → Desktop
      FileSystemProvider         ← only when authenticated
        WindowManagerProvider    ← only when authenticated
          NotificationProvider
            ContextMenuProvider
              Desktop            ← the OS
```

This means logging out unmounts the entire FileSystem + WindowManager tree, giving a clean slate on next login. The boot screen shows once per browser session (sessionStorage flag).

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

### Phase 3: App Library & Desktop Polish — COMPLETE
All 12 apps built and registered. Desktop polish features implemented: window animations, boot screen, right-click context menus, notification toasts. Build passes with 128 modules.

### Phase 4: Backend & Real Auth
- Python + FastAPI backend
- Real authentication (email/password registration + login)
- Per-user file system storage (replace localStorage)
- Per-user settings/preferences persistence
- AI proxy endpoint for Realms of Adventure (with rate limiting)

### Phase 5: Personalization Expansion
- Custom wallpapers / desktop backgrounds (preset + user upload)
- More preset themes + custom accent color picker
- Font selection
- Icon packs / cursor themes
- UI sounds and sound packs

### Phase 6: Monetization & Launch
- Stripe integration for premium subscriptions
- AI usage tracking and tier limits
- Premium cosmetic content
- Public beta launch

---

## Beta Readiness — What to Add

> This section outlines what RetroOS needs to feel like a complete, releasable beta product. RetroOS isn't trying to be a browser OS — it's a platform where original apps and games are released, all wrapped in a customizable retro desktop that feels like *yours*. The apps need to be genuinely cool things people want to use, not generic OS utilities.

### Priority 1: App Library

The apps below are what make people come to RetroOS and stay. They're original, creative, and fit the retro platform identity. All are pure frontend — no AI, no server costs.

**Tier 1 — High Impact (Build These First)**

| App | What It Is | Why It Matters | Complexity |
|-----|-----------|----------------|------------|
| **Hacking Simulator** | A puzzle game where you "hack" fictional systems through a terminal interface. Decode ciphers, crack passwords, navigate fake file systems, exploit vulnerabilities. Levels get progressively harder. | This is the kind of app people screenshot and share. Fits the retro/cyberpunk aesthetic perfectly. Unique to RetroOS — you can't just find this on any website. | Medium-High |
| **Pixel Studio** | A proper pixel art creation tool. Grid canvas, color palette with custom colors, layers, animation frames (create sprite sheets/GIFs). Save to `/Pictures`. | Not a Paint clone — a dedicated pixel art tool. People love pixel art, and a retro desktop OS is the *perfect* home for it. Users create content they want to keep and come back to. | Medium-High |
| **Chiptune Maker** | A simple music sequencer with retro sounds. Grid-based tracker style. Pick instruments (square wave, triangle wave, noise, sawtooth), place notes on a timeline, hear your creation. Save/load songs to file system. | Even a basic version is mesmerizing. People spend hours in music tools. Creates another type of user-generated content. | Medium-High |
| **Arcade Cabinet** | One app that houses a collection of small arcade games — Breakout, a Space Invaders-style shooter, Pong, a simple platformer runner. Each game tracks high scores. Like walking into a retro arcade. | One app, lots of replay value. The high scores give people a reason to come back. The "arcade cabinet" wrapper fits the platform concept (an app that contains games, rather than bare games). | Medium |
| **Radio / Vibe Player** | A retro radio app that plays lo-fi beats, chiptune, or ambient sounds. Curate a few royalty-free stations/playlists. Users leave it running in the background while using other apps. | Costs almost nothing to run (static audio files or links to free streams). Creates atmosphere and makes the desktop feel *alive*. People open RetroOS just to have the vibe going. | Low-Medium |

**Tier 2 — Adds Depth & "Come Back" Factor**

| App | What It Is | Why It Matters | Complexity |
|-----|-----------|----------------|------------|
| **Virtual Pet** | A Tamagotchi-style creature that lives on your desktop. Feed it, play mini-games with it, it grows and evolves over time. Persistent across sessions — when you log back in, time has passed and it may be hungry. | People get emotionally attached. This is a daily-visit driver. Simple to build initially, can be expanded over time with more evolutions, accessories, mini-games. | Medium |
| **Mystery / Case Files** | A detective investigation game. Get a case file with evidence (documents, images, clues), piece together what happened, submit your answer. New cases can be released periodically. | Gives people a reason to check back — "is there a new case?" Authored content (no AI needed). Could become episodic content that drives engagement. | Medium |
| **BBS / Message Board** | A retro bulletin board system *inside* the OS. Users post messages, have threads, share their pixel art and chiptune creations, post game high scores. | Turns RetroOS from a solo experience into a community. BBSes are the most retro social network imaginable. Requires backend but is high-value. | Medium (needs backend) |
| **Minesweeper** | Classic minesweeper. Difficulty levels, timer, best times. | Small, everyone knows it, high replay value. A retro OS without Minesweeper feels incomplete. Quick to build. | Low-Medium |
| **Terminal** | A retro terminal that operates on the virtual file system. Commands: `ls`, `cd`, `cat`, `mkdir`, `rm`, `echo`, `clear`, `help`, `whoami`, `date`. | Not a utility — it's *vibe*. People open it just because it looks cool. Also becomes the foundation for the Hacking Simulator. | Medium |

**Recommended beta launch lineup (12 apps total): ALL BUILT**

Ships with the OS: Calculator, Notepad, File Manager, Personalization, Terminal
Games: Realms of Adventure (AI), Minesweeper, Arcade Cabinet, Hacking Simulator
Creative: Pixel Studio, Chiptune Maker
Atmosphere: Radio / Vibe Player

This is a mix of games, creative tools, and atmosphere. Some are free, the AI ones are premium. People come for the games, stay for the creative tools, customize their desktop, and pay for the AI experiences.

### Priority 2: Desktop Polish (Makes It Feel "Real")

These are the details that separate a demo from a product.

| Feature | Status | Description |
|---------|--------|-------------|
| **Boot Screen** | DONE | Animated boot sequence: POST text → loading bar → RetroOS logo → fade to login. Shows once per browser session. |
| **Right-Click Context Menus** | DONE | Desktop: Open Terminal, File Manager, Personalization. Desktop icons: Open. File Manager items: Open, Rename, Delete. File Manager empty area: New Folder. |
| **Window Animations** | DONE | CSS scale+opacity animations: 150ms open (scale 0.5→1), 150ms close (scale 1→0.8 + fade). Close uses two-phase dispatch (CLOSE_WINDOW_START → delay → CLOSE_WINDOW). |
| **Notification Toasts** | DONE | Bottom-right toast system. Auto-dismiss (3s default). Types: info/success/error. Wired into Notepad, Pixel Studio, Minesweeper, Arcade, Hacking Sim. |
| **Startup Sound** | Not yet | A short retro chime on login. Optional — user can mute in settings. |
| **UI Sound Effects** | Not yet | Subtle clicks on button press, window open/close sounds, error beep. All optional/toggleable. Keep them small (< 50KB each). |
| **Screen Saver** | Not yet | After N minutes of idle: a retro screensaver (starfield, bouncing logo, matrix rain). Click/keypress to dismiss. |
| **Alt+Tab Switcher** | Not yet | An overlay showing open window thumbnails. Standard OS behavior users expect. |
| **Desktop Icon Drag & Drop** | Not yet | Let users rearrange their desktop icons. Persist positions in file system or settings. |
| **Taskbar System Tray** | Not yet | A small area next to the clock for status indicators (volume icon, network icon, notifications). Mostly cosmetic but adds realism. |

**Recommended first batch for beta: ALL DONE.** Boot Screen, Right-Click Context Menus, Window Animations, Notification Toasts.

### Priority 3: More Customization

The Personalization app currently only switches themes. For beta, expand it:

| Feature | Description |
|---------|-------------|
| **Wallpapers** | 5-8 preset wallpapers (retro patterns, pixel art landscapes, gradients). Select in Personalization app. Store choice in user settings. |
| **Custom Wallpaper Upload** | Let users upload their own image. Store as data URL in file system or settings. |
| **More Preset Themes** | Add 3-4 more themes: High Contrast, Sunset, Ocean, Monochrome Green (terminal style). More variety = more engagement. |
| **Custom Theme Creator** | Let users pick their own accent colors at minimum. Full custom theme editor is a stretch goal but even "pick your accent color" adds a lot. |
| **Font Selection** | 3-4 system font options (the current one, a more modern sans-serif, a monospace option, a pixel font). |
| **Cursor Themes** | 2-3 cursor packs (default, retro crosshair, pixel hand). Pure CSS `cursor: url(...)`. |
| **Icon Packs** | Alternate icon sets for the desktop and app windows. A "modern flat" pack vs the current retro style. |

**Recommended for beta:** Wallpapers (preset + custom upload), 2-3 more themes, font selection. These are the highest-impact customization additions.

### Priority 4: The Backend (Required for Hosting)

This is the hard prerequisite for going live. Without it, the app simply cannot be hosted for real users.

**Minimum viable backend for beta:**
1. **Auth** — Real email/password registration + login. JWT in httpOnly cookies. Can skip OAuth for beta.
2. **File System API** — Per-user CRUD. Replace localStorage with server storage. Can keep localStorage as offline cache.
3. **User Settings API** — Theme, wallpaper, preferences tied to user account.
4. **AI Proxy** — Backend endpoint that forwards to the LLM. Rate limiting per user. This is where the cost problem lives (see Monetization section).

**Stack recommendation stays:** Python + FastAPI + PostgreSQL (users/settings) + filesystem or S3 (user files).

---

## Monetization Strategy & Thoughts

> Ideas on how to make RetroOS generate revenue, ordered by what makes the most sense for this kind of product.

### The Core Problem: AI Costs Money

Realms of Adventure is the flagship app, but it's also the expensive one. Running a local LLM on a GPU server costs $50-200+/month depending on the GPU. Using a hosted API (OpenAI, Anthropic, etc.) means per-token costs that scale with users. Every other app in RetroOS is essentially free to serve — it's just static files and a small database. The AI game is the only thing with meaningful marginal cost per user.

This actually creates a natural monetization boundary: **the AI is the premium feature.**

### Recommended Model: Freemium with AI Credits

**Free Tier (everyone gets):**
- Full desktop environment with all non-AI apps
- All preset themes and wallpapers
- Basic customization (font, wallpaper, theme selection)
- File system with a reasonable storage cap (e.g., 5MB)
- 3-5 free AI game sessions per month (enough to try it, not enough to rely on it)

**Premium Tier ($3-5/month or $30-50/year):**
- Unlimited AI game sessions (or a generous cap like 50/month)
- Access to future AI-powered apps (AI art generator, AI chat companion, AI code assistant — all inside the RetroOS environment)
- Premium themes and icon packs
- Custom theme creator
- Increased storage (50MB+)
- Priority during high load
- Early access to new apps

**Why this works:**
- Low price point → impulse subscribe territory. $3-5/month is less than a coffee.
- Free tier is fully usable and fun. Users don't feel locked out. They get Minesweeper, Snake, Paint, Terminal, Notepad, Calculator, File Manager — a real desktop.
- The paywall is on the *expensive* thing (AI), so revenue directly covers costs.
- As you add more AI apps, the premium tier becomes more valuable without changing the price.

### Alternative / Complementary Models

**1. AI Credit Packs (one-time purchase)**
- Sell packs of AI sessions: 10 sessions for $2, 50 for $8.
- Good for users who play occasionally and don't want a subscription.
- Can run alongside the subscription model.

**2. Cosmetic Marketplace**
- Sell premium theme packs ($1-2 each), icon packs, cursor packs, wallpaper packs, sound packs.
- Low effort to produce, pure profit (no server cost).
- Works well as supplementary revenue even with a subscription.
- Could eventually allow community-created packs (take 30% cut).

**3. App Marketplace (Long-Term)**
- Let third-party developers build RetroOS apps.
- Charge developers a listing fee or take a revenue share (30% is standard).
- This is a long-term play — requires a stable API, documentation, and a user base first.
- But the architecture already supports it (the app registry pattern is clean and extensible).

**4. "RetroOS Pro" One-Time Purchase ($10-15)**
- Instead of a subscription, sell lifetime access to all premium features.
- Simpler for users, but harder to sustain if AI costs grow with usage.
- Could work with a monthly AI session cap even for Pro users.

### What NOT to Do

- **Don't gate basic apps behind payment.** If someone pays to use Notepad or Calculator, the product feels hostile. The desktop itself should always be free and usable.
- **Don't show ads.** Ads inside a desktop OS simulation would destroy the immersion and feel cheap. The retro aesthetic is the whole appeal — don't ruin it.
- **Don't charge for accounts.** Registration should be free. The free tier needs to be genuinely good so people tell their friends about it.
- **Don't make the free tier feel like a demo.** It should feel like a real product with a clear upgrade path, not a crippled trial.

### Monetization Implementation Roadmap

**Step 1 (with backend):**
- Add a `subscription_tier` field to users (free / premium)
- Track AI usage per user per month (simple counter in the database)
- When a free user hits their AI session limit, show a friendly "upgrade" prompt inside the game
- No payment processing yet — manually upgrade test accounts

**Step 2 (payment integration):**
- Integrate Stripe for subscriptions ($3-5/month, $30-50/year)
- Add a "Manage Subscription" option in the Start Menu or System Info app
- Handle upgrade/downgrade/cancellation
- Stripe Checkout is the simplest path — redirect to Stripe's hosted page, handle webhooks

**Step 3 (expand premium value):**
- Add more AI-powered apps to justify the subscription
- Add cosmetic marketplace items
- Consider credit packs as an alternative to subscription

### Revenue Projections (Rough)

These are rough numbers to think about, not promises:
- 1,000 free users, 5% convert to premium at $4/month = $200/month
- AI server costs (small GPU VPS): ~$80-150/month
- At 5% conversion, you need ~500-750 free users to break even on AI costs alone
- At 10% conversion (good for freemium), break even drops to ~250-400 free users
- Non-AI server costs (basic VPS for the backend + static files): ~$10-20/month — negligible

The key insight: **you don't need massive scale to be sustainable.** A few hundred paying users covers costs. A few thousand and it's profitable.

### Reducing AI Costs

Some tactics to keep AI costs manageable:

- **Use smaller/cheaper models.** llama3.2 is already small. For production, consider a hosted API with a cheap model tier (e.g., GPT-4o-mini, Claude Haiku) rather than self-hosting a GPU.
- **Cache common openings.** Pre-generate the first response for each realm so the initial scene loads instantly without an API call.
- **Set hard turn limits.** Cap games at 20 turns maximum — prevents runaway token usage.
- **Rate limit aggressively for free tier.** 3-5 sessions/month is generous enough to hook users but cheap enough to sustain.
- **Consider a hosted API over self-hosting.** Running your own Ollama/GPU server has a fixed cost whether 1 or 1,000 people play. A hosted API (OpenAI, Anthropic, Groq) has per-use cost but zero fixed cost — better when you're small and growing.

---

## Future AI App Ideas (Premium Tier)

These apps would all use the AI backend and live behind the premium paywall, increasing subscription value over time. Each new AI app makes the premium tier more valuable without changing the price.

| App | Concept |
|-----|---------|
| **AI Chat Companion** | A character that lives in your OS — not a generic chatbot, but a *character* with personality, opinions, and quirks. Customizable personality traits. Remembers past conversations (history saved to file system). Think Clippy if Clippy was actually interesting to talk to. |
| **Story Forge** | A collaborative creative writing tool. You write a sentence, the AI writes the next, back and forth. Different from Realms of Adventure — this is freeform creative writing, not a structured game. Choose genres, tones, styles. Save stories to file system. |
| **AI Realm Creator** | Let users design their own Realms of Adventure settings. Describe your world, its rules, its tone — the AI generates the system prompt and runs it. User-generated content for the flagship app. Could allow sharing custom realms with other users. |
| **AI Art Generator** | Text-to-image generation in a Paint-like interface. Generate retro pixel art or illustrations from descriptions. Could use a cheap/free image model. Results save to `/Pictures` and can be viewed in Pixel Studio. |
| **AI Tutor** | Educational app — ask questions about any subject, get clear explanations with examples. Could be positioned for students. Different from a generic chatbot because it's structured for learning (tracks topics, suggests next questions, quizzes). |

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
