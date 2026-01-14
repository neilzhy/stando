import { BrowserWindow, screen } from 'electron';
import path from 'path';

export class WindowManager {
  private static reminderWindow: BrowserWindow | null = null;
  private static statisticsWindow: BrowserWindow | null = null;
  private static settingsWindow: BrowserWindow | null = null;
  private static floatingWidget: BrowserWindow | null = null;

  static createReminderWindow(message: string): BrowserWindow {
    // Close existing reminder window if any
    if (this.reminderWindow && !this.reminderWindow.isDestroyed()) {
      this.reminderWindow.close();
    }

    // Get primary display dimensions
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    this.reminderWindow = new BrowserWindow({
      width: 400,
      height: 320,
      x: Math.floor((width - 400) / 2),
      y: Math.floor((height - 320) / 2),
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
      }
    });

    // Load renderer
    if (process.env.ELECTRON_RENDERER_URL) {
      this.reminderWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}#/reminder`);
    } else {
      this.reminderWindow.loadFile(path.join(__dirname, '../renderer/index.html'), {
        hash: '/reminder'
      });
    }

    this.reminderWindow.once('ready-to-show', () => {
      this.reminderWindow?.show();
      this.reminderWindow?.focus();
      // Ensure window stays on top with highest level
      this.reminderWindow?.setAlwaysOnTop(true, 'screen-saver');
      // Send message to renderer
      this.reminderWindow?.webContents.send('reminder-message', message);
    });

    this.reminderWindow.on('closed', () => {
      this.reminderWindow = null;
    });

    return this.reminderWindow;
  }

  static createStatisticsWindow(): BrowserWindow {
    // Focus existing window if already open
    if (this.statisticsWindow && !this.statisticsWindow.isDestroyed()) {
      this.statisticsWindow.focus();
      return this.statisticsWindow;
    }

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    this.statisticsWindow = new BrowserWindow({
      width: 500,
      height: 600,
      x: Math.floor((width - 500) / 2),
      y: Math.floor((height - 600) / 2),
      title: 'Statistics - Stando',
      resizable: true,
      minimizable: true,
      maximizable: true,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
      }
    });

    if (process.env.ELECTRON_RENDERER_URL) {
      this.statisticsWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}#/statistics`);
    } else {
      this.statisticsWindow.loadFile(path.join(__dirname, '../renderer/index.html'), {
        hash: '/statistics'
      });
    }

    this.statisticsWindow.once('ready-to-show', () => {
      this.statisticsWindow?.show();
    });

    this.statisticsWindow.on('closed', () => {
      this.statisticsWindow = null;
    });

    return this.statisticsWindow;
  }

  static createSettingsWindow(): BrowserWindow {
    // Focus existing window if already open
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.focus();
      return this.settingsWindow;
    }

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    this.settingsWindow = new BrowserWindow({
      width: 600,
      height: 700,
      x: Math.floor((width - 600) / 2),
      y: Math.floor((height - 700) / 2),
      title: 'Settings - Stando',
      resizable: false,
      minimizable: true,
      maximizable: false,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
      }
    });

    if (process.env.ELECTRON_RENDERER_URL) {
      this.settingsWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}#/settings`);
    } else {
      this.settingsWindow.loadFile(path.join(__dirname, '../renderer/index.html'), {
        hash: '/settings'
      });
    }

    this.settingsWindow.once('ready-to-show', () => {
      this.settingsWindow?.show();
    });

    this.settingsWindow.on('closed', () => {
      this.settingsWindow = null;
    });

    return this.settingsWindow;
  }

  static closeReminderWindow(): void {
    if (this.reminderWindow && !this.reminderWindow.isDestroyed()) {
      this.reminderWindow.close();
    }
  }

  static createFloatingWidget(): BrowserWindow {
    // Return existing widget if already created
    if (this.floatingWidget && !this.floatingWidget.isDestroyed()) {
      return this.floatingWidget;
    }

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    this.floatingWidget = new BrowserWindow({
      width: 160,
      height: 120,
      x: width - 180,  // Position at bottom-right
      y: height - 140,
      frame: false,
      transparent: true,
      alwaysOnTop: false,
      skipTaskbar: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
      }
    });

    if (process.env.ELECTRON_RENDERER_URL) {
      this.floatingWidget.loadURL(`${process.env.ELECTRON_RENDERER_URL}#/widget`);
    } else {
      this.floatingWidget.loadFile(path.join(__dirname, '../renderer/index.html'), {
        hash: '/widget'
      });
    }

    this.floatingWidget.once('ready-to-show', () => {
      this.floatingWidget?.show();
    });

    this.floatingWidget.on('closed', () => {
      this.floatingWidget = null;
    });

    return this.floatingWidget;
  }

  static closeFloatingWidget(): void {
    if (this.floatingWidget && !this.floatingWidget.isDestroyed()) {
      this.floatingWidget.close();
    }
  }

  static getFloatingWidget(): BrowserWindow | null {
    return this.floatingWidget;
  }

  static destroyAll(): void {
    if (this.reminderWindow && !this.reminderWindow.isDestroyed()) {
      this.reminderWindow.destroy();
    }
    if (this.statisticsWindow && !this.statisticsWindow.isDestroyed()) {
      this.statisticsWindow.destroy();
    }
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.destroy();
    }
    if (this.floatingWidget && !this.floatingWidget.isDestroyed()) {
      this.floatingWidget.destroy();
    }
  }
}
