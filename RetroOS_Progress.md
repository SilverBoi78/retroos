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
| Backend | Node.js + Express 4.21 | REST API on port 8000, served behind Nginx |
| Database | SQLite (better-sqlite3) | WAL mode, per-user file system + settings |
| Auth | JWT + bcryptjs | httpOnly cookies, configurable session duration |
| Persistence | SQLite (server) + localStorage (fallback) | User data tied to accounts |
| Linting | ESLint 9 + React plugins | `npm run lint` |

**Backend is live.** Node.js/Express API with SQLite persistence, JWT auth, and per-user file system. Deployed to VPS via Nginx reverse proxy.

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
- `AuthContext` provides `{ user, isAuthenticated, login, logout, register }`
- Start menu shows username and "Log Off" option
- Real auth via Express backend — bcrypt password hashing, JWT in httpOnly cookies
- Configurable session duration (session, 7 days, 30 days, never expire)

### Theme & Personalization System
- GTK-inspired engine: each theme is a JS config mapping to CSS custom properties on `:root`
- All component CSS uses `var(--color-*)` — zero hardcoded colors
- 3 preset themes: **RetroOS Classic** (warm gray, purple title bars, beveled), **Arctic** (dark navy, flat borders, cyan accents), **Olive** (earthy green, beveled)
- Themes control: colors, fonts, font sizes, border style (beveled vs flat), border radius, taskbar/title bar height, icon size
- Theme choice persisted per-user in backend database

**Personalization app** (tabbed UI):
- **Themes tab** — Switch between preset themes with mini desktop previews, create/edit/delete custom themes with full color picker editor
- **Wallpaper tab** — Solid color picker, 12 gradient presets, 6 pattern presets, custom image upload (JPEG/PNG/GIF/WebP, max 10MB)
- **Colors tab** — Custom accent color picker (overrides title bars, selections, menus) with live preview, reset to theme default
- **Display tab** — Icon size (small/medium/large), font size (small/medium/large), clock format (12h/24h), cursor theme (Default/Retro Pixel/Crosshair), screen saver settings (enable/disable, animation type, idle timeout)

All settings persisted per-user in `user_settings.settings_json`. Custom wallpaper images stored as BLOBs in `user_wallpapers` table.

### Virtual File System
- In-memory directory tree synced to backend SQLite via API
- `FileSystemContext` provides: `readDir`, `readFile`, `writeFile`, `createDir`, `deleteNode`, `rename`, `exists`, `getNodeType`
- Default directories: `/Documents`, `/Desktop`, `/Pictures`, `/Games` (auto-created on first game save)
- Reusable `FileDialog` component (Save As / Open) available to any app
- Per-user isolation — each user gets their own file tree in the database

### Apps (12 total)

| App | Description |
|-----|-------------|
| **Calculator** | Chained operations, keyboard shortcuts, single instance |
| **Notepad** | File > New/Open/Save/Save As, Ctrl+S/O/Shift+S, integrates with virtual file system |
| **File Manager** | Navigate directories, create/rename/delete, double-click opens in Notepad, context menus |
| **Personalization** | Tabbed settings: themes, wallpapers (presets + custom upload), accent colors, display options (system app — Start Menu only) |
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
├── themes/                     index.js (registry), themes.js (all theme data)
├── context/
│   ├── AuthContext.jsx          { user, isAuthenticated, login, logout }
│   ├── FileSystemContext.jsx    Wraps fileSystem.js, triggers re-renders
│   ├── ThemeContext.jsx         Applies CSS vars to :root, syncs with backend
│   ├── SettingsContext.jsx      Personalization settings (wallpaper, accent, icon/font size, clock format)
│   ├── WindowManagerContext.jsx useReducer: open/close/minimize/maximize/focus/resize/updateTitle
│   ├── NotificationContext.jsx  notify(message, options?), dismiss(id), auto-dismiss
│   └── ContextMenuContext.jsx   showContextMenu(event, items[]), hideContextMenu()
├── services/
│   ├── api.js                  Shared apiFetch() + API_BASE constant
│   ├── fileSystem.js           Virtual FS engine (tree in memory → API sync)
│   └── fileSystemApi.js        File system API client
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
AuthProvider                     ← always mounted
  ThemeProvider                  ← always mounted (themes work on login screen too)
    AppContent                   ← BootScreen (once) → LoginScreen → Desktop
      SettingsProvider           ← only when authenticated (wallpaper, accent, display)
        FileSystemProvider
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
- **CSS Theming** — Every visual property references a CSS variable. See `src/themes/themes.js` for the full variable list.
- **Settings System** — `SettingsContext` loads from `/api/settings`, applies CSS overrides for accent color, icon size, font size. Components read settings via `useSettings()` hook.

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

1. Open `src/themes/themes.js`
2. Add a new exported object with a unique `id`, `name`, and all color/border properties (copy an existing theme as template)
3. Import and add to `src/themes/index.js`

The theme automatically appears in the Personalization app.

---

## Deployment Status

### Completed
- **Authentication** &#10003; — Express backend with bcrypt + JWT in httpOnly cookies
- **Virtual File System** &#10003; — Per-user SQLite storage, synced from frontend
- **User Settings** &#10003; — Theme, wallpaper, accent color, display prefs all persisted per-user
- **Static Hosting** &#10003; — Nginx serves `dist/`, proxies `/api/*` to Node.js backend
- **Deploy Scripts** &#10003; — `setup.sh` (first-time) and `update.sh` (pull + rebuild + restart)

### Remaining
- **AI Backend Proxy** — Ollama is still called directly from browser at `localhost:11434`. Needs backend proxy route with auth + rate limiting.
- **HTTPS/SSL** — Currently HTTP only. Need Let's Encrypt or similar.
- **Database Backups** — `update.sh` creates pre-update backups. Need automated daily cron backups.

---

## Roadmap

### Phase 4: Backend & Real Auth &#10003; DONE
- Node.js + Express backend (migrated from planned Python/FastAPI)
- Real authentication (username/password + JWT in httpOnly cookies)
- Per-user file system storage in SQLite (replaced localStorage)
- Per-user settings persistence (theme + full settings JSON)
- Nginx reverse proxy, systemd service, automated deploy scripts

### Phase 5: Personalization Expansion &#10003; DONE
- Wallpaper system: solid colors, 12 gradient presets, 6 pattern presets, custom image upload
- Custom accent color picker with live preview
- Desktop icon size (small/medium/large)
- System font size (small/medium/large)
- Clock format (12h/24h)
- Tabbed Personalization app UI
- All settings persisted per-user in database

### Phase 6: AI Backend Proxy (Next)
- Backend proxy endpoint for Ollama (currently called direct from browser)
- Make AI model configurable via environment
- Rate limiting for AI calls
- Support for hosted APIs (OpenAI, Anthropic) as alternative to self-hosted Ollama

### Phase 7: Monetization & Launch
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

## Future Personalization Vision

Ideas for taking customization to the next level. These are documented for future development — no code stubs exist yet.

### Custom Theme Creator
Let users build their own themes from scratch via the Personalization app. A full color picker for each CSS variable group (surface, text, title bars, accents). Users could save, name, export, and share their themes.

### Config File System (like .bashrc)
Power users could customize their OS via config files in their virtual file system:
- `~/.retroos/terminal.conf` — Terminal colors, prompt format, aliases, font
- `~/.retroos/desktop.conf` — Icon layout, default apps, startup programs
- `~/.retroos/theme.json` — Full custom theme definition (overrides UI settings)

Apps would read their own config files on mount. This gives power users programmatic control while casual users use the Personalization UI.

### Icon Packs
Swappable icon sets for desktop and Start Menu:
- **Classic** (current SVG icons)
- **Pixel** (pixel-art style, 16x16 and 32x32)
- **Neon** (glowing outlines on dark backgrounds)
- **Minimal** (thin line icons)

Ship as a JSON manifest + SVG sprite sheet. Users select in Personalization > Display.

### Cursor Themes
Custom CSS cursors:
- **Classic** (default browser cursor)
- **Retro** (pixelated pointer, resize handles, wait spinner)
- **Neon** (glowing cursor)

Applied via CSS `cursor: url(...)` on the desktop container.

### Sound Packs
Audio feedback for OS events:
- Window open/close/minimize/maximize
- Button clicks, menu opens
- Error/success notifications
- Startup/shutdown sounds

Each pack is a set of small audio files loaded via Web Audio API. Users toggle on/off and select pack in Personalization.

### Screen Savers
Activate after N minutes of inactivity:
- **Starfield** — 3D star tunnel
- **Bouncing Logo** — RetroOS logo bouncing off screen edges
- **Matrix Rain** — Green character rain
- **Pipes** — Retro 3D pipes

Canvas-rendered, dismiss on any input.

### Community Theme Marketplace
Users create themes and share them:
- Export theme as JSON
- Upload to a community gallery
- Browse and install others' themes
- Rating system, featured themes
- Premium themes could be part of monetization

### Widget System
Small always-visible panels on the desktop:
- Clock/weather widget
- System resource display
- Sticky notes
- Music player mini-view
- Calendar

Draggable, resizable, configurable per-widget. Could be a premium feature.

### Taskbar Customization
- Position: top, bottom, left, right
- Auto-hide mode
- Pinned app shortcuts
- Custom start button icon/text
- System tray with notification badges

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


## BUGS

(No known bugs)

## Changelog

### 2026-04-11 — Bug Fixes + Customization Features

**Bug Fixes:**
- Fixed font size setting — all OS shell CSS now uses `var(--font-size-*)` variables instead of hardcoded pixel values. Small/Medium/Large scales the entire UI proportionally.
- Fixed icon size overflow — desktop icon container width now scales with `--icon-size`, and icon column wraps to multiple columns before overflowing past the taskbar.
- Fixed Pixel Studio PNG save — now triggers a real browser download of the PNG file. Also added image preview in File Manager (double-click .png files to view them).

**New Features:**
- **Cursor Themes** — 3 presets (Default, Retro Pixel, Crosshair) selectable in Personalization > Display.
- **Custom Theme Creator** — Build your own theme from scratch in Personalization > Themes. Pick colors for every UI element group, choose border style and radius, start from any existing theme as a base. Custom themes persist per-user.
- **Screen Savers** — 3 canvas-animated screen savers (Starfield, Matrix Rain, Bouncing Logo) that activate after configurable idle timeout. Configurable in Personalization > Display.
