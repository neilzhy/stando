import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';
import { Storage } from './storage';
import { Statistics } from './statistics';
import { Config } from './config';
import { WindowManager } from './windows';

export class TrayManager {
  private tray: Tray;
  private storage: Storage;
  private statistics: Statistics;
  private config: Config;
  private updateTimer: NodeJS.Timeout | undefined;
  private reminderStartTime: number;
  private intervalMs: number;
  private onStandUp: () => void;
  private onSitDown: () => void;
  private onPause: () => void;
  private onResume: () => void;

  constructor(
    storage: Storage,
    statistics: Statistics,
    config: Config,
    onStandUp: () => void,
    onSitDown: () => void,
    onPause: () => void,
    onResume: () => void
  ) {
    this.storage = storage;
    this.statistics = statistics;
    this.config = config;
    this.onStandUp = onStandUp;
    this.onSitDown = onSitDown;
    this.onPause = onPause;
    this.onResume = onResume;

    this.reminderStartTime = Date.now();
    const pluginConfig = this.config.getConfig();
    this.intervalMs = pluginConfig.interval * 60 * 1000;

    // Create tray icon
    // In development: use resources folder relative to app root
    // In production: use resources folder in app.asar or extraResources
    const isDev = !app.isPackaged;
    const iconPath = isDev
      ? path.join(app.getAppPath(), 'resources', 'icon.ico')
      : path.join(process.resourcesPath, 'icon.ico');
    const icon = nativeImage.createFromPath(iconPath);
    this.tray = new Tray(icon.resize({ width: 16, height: 16 }));

    this.setupTray();
    this.startUpdateTimer();
  }

  private setupTray(): void {
    // Left click: show floating widget
    this.tray.on('click', () => {
      const widget = WindowManager.getFloatingWidget();
      if (widget && !widget.isDestroyed()) {
        widget.show();
        widget.focus();
      } else {
        WindowManager.createFloatingWidget();
      }
    });

    // Right click shows menu
    this.tray.on('right-click', () => {
      this.showMenu();
    });

    this.updateTray();
  }

  private showMenu(): void {
    const isPaused = this.storage.isPaused();
    const currentState = this.storage.getCurrentState();

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '📊 Show Statistics',
        click: () => WindowManager.createStatisticsWindow()
      },
      {
        label: isPaused ? '▶️ Resume' : '⏸️ Pause',
        click: () => {
          if (isPaused) {
            this.onResume();
          } else {
            this.onPause();
          }
        }
      },
      {
        label: currentState === 'standing' ? '💺 Sit Down' : '🧍 Stand Up',
        click: () => {
          if (currentState === 'standing') {
            this.onSitDown();
          } else {
            this.onStandUp();
          }
        }
      },
      { type: 'separator' },
      {
        label: '⚙️ Settings',
        click: () => WindowManager.createSettingsWindow()
      },
      { type: 'separator' },
      {
        label: '❌ Quit',
        click: () => app.quit()
      }
    ]);

    this.tray.popUpContextMenu(contextMenu);
  }

  private startUpdateTimer(): void {
    const pluginConfig = this.config.getConfig();
    // Update every second for countdown mode, every 10 seconds for others
    const updateInterval = pluginConfig.displayMode === 'countdown' ? 1000 : 10000;

    this.updateTimer = setInterval(() => {
      this.updateTray();
    }, updateInterval);

    this.updateTray();
  }

  resetTimer(): void {
    this.reminderStartTime = Date.now();
    const pluginConfig = this.config.getConfig();
    this.intervalMs = pluginConfig.interval * 60 * 1000;
    this.updateTray();
  }

  updateTray(): void {
    const pluginConfig = this.config.getConfig();
    const currentState = this.storage.getCurrentState();
    const isPaused = this.storage.isPaused();

    // Show standing state
    if (currentState === 'standing') {
      const standStart = this.storage.getCurrentStandStart();
      if (standStart) {
        const duration = Math.floor((Date.now() - standStart) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        this.tray.setTitle(`🧍 ${minutes}:${String(seconds).padStart(2, '0')}`);
        this.tray.setToolTip('Standing... Click to sit down');
      }
      return;
    }

    // Show paused state
    if (isPaused) {
      this.tray.setTitle('⏸️ Paused');
      this.tray.setToolTip('Stando paused');
      return;
    }

    // Normal state based on display mode
    switch (pluginConfig.displayMode) {
      case 'countdown':
        this.showCountdown();
        break;
      case 'progress':
        this.showProgress();
        break;
      case 'lastTime':
        this.showLastTime();
        break;
      case 'silent':
      default:
        this.showSilent();
        break;
    }
  }

  private showCountdown(): void {
    const elapsed = Date.now() - this.reminderStartTime;
    const remaining = Math.max(0, this.intervalMs - elapsed);
    const remainingSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    this.tray.setTitle(`⏱️ ${minutes}:${String(seconds).padStart(2, '0')}`);
    this.tray.setToolTip('Time until next stand reminder');
  }

  private showProgress(): void {
    const elapsed = Date.now() - this.reminderStartTime;
    const progress = Math.min(1, elapsed / this.intervalMs);
    const filledCount = Math.floor(progress * 8);
    const emptyCount = 8 - filledCount;

    const filled = '█'.repeat(filledCount);
    const empty = '░'.repeat(emptyCount);

    this.tray.setTitle(`🧍 ${filled}${empty}`);
    this.tray.setToolTip(`Progress: ${Math.floor(progress * 100)}%`);
  }

  private showLastTime(): void {
    const stats = this.storage.getTodayStatistics();
    if (stats.standRecords.length > 0) {
      const lastRecord = stats.standRecords[stats.standRecords.length - 1];
      const lastTime = new Date(lastRecord.endTime);
      const timeStr = `${String(lastTime.getHours()).padStart(2, '0')}:${String(lastTime.getMinutes()).padStart(2, '0')}`;
      this.tray.setTitle(`⏰ ${timeStr}`);
      this.tray.setToolTip('Last stand time');
    } else {
      this.tray.setTitle('🧍 No record');
      this.tray.setToolTip('No stand record today');
    }
  }

  private showSilent(): void {
    this.tray.setTitle('🧍');
    this.tray.setToolTip('Stando');
  }

  dispose(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    this.tray.destroy();
  }
}
