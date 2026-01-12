# Stando

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/NeilZhy/stando)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VSCode](https://img.shields.io/badge/VSCode-1.74.0+-orange.svg)](https://code.visualstudio.com/)

A VSCode extension that reminds you to stand up and take a break regularly, helping prevent health issues caused by prolonged sitting.

一款 VSCode 插件，定时提醒你站立休息，帮助预防久坐带来的健康问题。

> **Stando** = **Stand** + **Do** - Stand up and do it!

## Features

- **Customizable Reminder Interval** - Set your preferred reminder interval (default: 60 minutes)
- **Multiple Display Modes** - Choose from 4 status bar display modes:
  - Countdown timer
  - Progress bar
  - Last stand time
  - Silent mode (icon only)
- **Stand Tracking** - Track your standing sessions with start/end timestamps
- **Statistics** - View daily statistics including:
  - Stand count
  - Average stand duration
  - Total standing time
  - Total sitting time
- **Do Not Disturb** - Set quiet hours when you don't want to be reminded
- **Pause/Resume** - Temporarily pause reminders when needed

## Installation

### From Source (Local Build)

1. Clone the repository:
```bash
git clone https://github.com/NeilZhy/stando.git
cd stando
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Package the extension:
```bash
npm run package
```

5. Install the extension:
```bash
code --install-extension stando-1.0.0.vsix
```

6. Reload VSCode window (`Ctrl+Shift+P` → `Reload Window`)

## Usage

### Status Bar
- Click the status bar icon (bottom right) to access quick options:
  - View Statistics
  - Pause/Resume reminders
  - Stand up now

### Commands
Press `Ctrl+Shift+P` and type:

| Command | Description |
|---------|-------------|
| `Stando: Pause` | Pause reminders |
| `Stando: Resume` | Resume reminders |
| `Stando: Stand Up` | Start standing |
| `Stando: Sit Down` | End standing |
| `Stando: Show Statistics` | View today's statistics |

### Workflow
1. Timer reaches zero → Notification appears
2. Click "Stand Up" → Standing timer starts
3. Click status bar when done → Standing session recorded, next reminder scheduled

## Configuration

Open Settings (`File` → `Preferences` → `Settings`) and search for `stando`:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `stando.interval` | number | 60 | Reminder interval in minutes (1-480) |
| `stando.displayMode` | string | silent | Status bar display mode: `countdown`, `progress`, `lastTime`, `silent` |
| `stando.message` | string | Time to stand up and stretch! | Custom reminder message |
| `stando.dndEnabled` | boolean | false | Enable Do Not Disturb mode |
| `stando.dndStartTime` | string | 12:00 | DND start time (HH:MM) |
| `stando.dndEndTime` | string | 13:00 | DND end time (HH:MM) |

## Development

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- VSCode >= 1.74.0

### Scripts

| Script | Description |
|--------|-------------|
| `npm install` | Install dependencies |
| `npm run build` | Build the extension |
| `npm run watch` | Watch mode for development |
| `npm run package` | Package as .vsix file |

### Project Structure
```
stando/
├── src/
│   ├── extension.ts      # Extension entry point
│   ├── reminder.ts       # Reminder timer logic
│   ├── statusBar.ts      # Status bar management
│   ├── statistics.ts     # Statistics calculation
│   ├── storage.ts        # Data persistence
│   └── types.ts          # Type definitions
├── doc/
│   ├── requirements.md   # Requirements document
│   └── build.md          # Build guide
├── package.json
├── tsconfig.json
└── esbuild.js
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- Email: neilzhying@gmail.com
- Email: neilzhy@163.com

## Acknowledgments

- Thanks to the VSCode team for the excellent extension API
- Inspired by the need to maintain a healthy work-life balance
