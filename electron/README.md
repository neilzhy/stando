# Stando Desktop

Stand up reminder desktop application for Windows.

## Features

- ⏰ Periodic reminders to stand up
- 🧍 Stand time tracking
- 📊 Daily statistics
- 🔕 Do Not Disturb mode
- 🎨 Multiple display modes (countdown, progress, lastTime, silent)
- 💾 Local data persistence (last 7 days)

## Tech Stack

- **Electron 28+** - Desktop framework
- **Vue 3** - Frontend framework
- **TypeScript** - Type safety
- **electron-vite** - Build tool
- **electron-store** - Data persistence
- **electron-builder** - App packaging

## Development

### Install Dependencies

```bash
cd electron
npm install
```

### Run in Development Mode

```bash
npm run dev
```

This will start the app in development mode with hot reload.

### Build for Production

```bash
npm run build
```

### Create Windows Installer

```bash
npm run build:win
```

The installer will be created in `out/release/` directory.

## Project Structure

```
electron/
├── src/
│   ├── main/               # Main process (Node.js)
│   │   ├── index.ts       # Entry point
│   │   ├── tray.ts        # System tray
│   │   ├── windows.ts     # Window manager
│   │   ├── storage.ts     # Data storage
│   │   ├── reminder.ts    # Reminder timer
│   │   ├── statistics.ts  # Stats calculation
│   │   ├── config.ts      # Config management
│   │   └── types.ts       # Type definitions
│   ├── preload/           # Preload scripts
│   │   └── index.ts      # IPC bridge
│   └── renderer/          # Renderer process (Browser)
│       ├── src/
│       │   ├── components/
│       │   │   ├── ReminderDialog.vue
│       │   │   ├── StatisticsWindow.vue
│       │   │   └── SettingsWindow.vue
│       │   ├── App.vue
│       │   └── main.ts
│       └── index.html
├── resources/             # App resources
│   └── icon.png          # App icon
├── package.json
├── electron.vite.config.ts
└── tsconfig.json
```

## Usage

### System Tray

The app runs in the system tray with the following features:

- **Left click**: End standing (if standing), otherwise show menu
- **Right click**: Show context menu

### Menu Options

- 📊 Show Statistics - View today's stats
- ⏸️ Pause / ▶️ Resume - Pause/resume reminders
- 🧍 Stand Up / 💺 Sit Down - Manual stand/sit control
- ⚙️ Settings - Configure the app
- ❌ Quit - Exit the app

### Reminder Dialog

When it's time to stand up, a dialog will appear with three options:

- **Stand Up** - Start standing timer
- **Snooze 5min** - Remind again in 5 minutes
- **Dismiss** - Skip this reminder

### Statistics Window

Shows today's statistics:

- Stand count
- Average stand time
- Total stand time
- Total sit time
- Current state (sitting/standing)

### Settings Window

Configure:

- Reminder interval (1-480 minutes)
- Custom reminder message
- Display mode (countdown/progress/lastTime/silent)
- Do Not Disturb period

## Data Storage

All data is stored locally using electron-store:

- **Config**: `~/.config/stando-desktop/stando-config.json`
- **Data**: `~/.config/stando-desktop/stando-data.json`

## Migrated from VSCode Extension

This desktop app is based on the Stando VSCode extension, with ~85% code reuse:

- ✅ 100% reused: types.ts, statistics.ts
- ✅ 90% reused: storage.ts (only changed persistence layer)
- ✅ 85% reused: reminder.ts (changed notification method)
- ✅ 80% reused: Core logic from extension.ts
- ✅ 70% reused: Display logic from statusBar.ts

## License

MIT
