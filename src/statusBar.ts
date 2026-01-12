import * as vscode from 'vscode';
import { Storage } from './storage';
import { Statistics } from './statistics';
import { DisplayMode, PluginConfig } from './types';

export class StatusBar {
  private statusBarItem: vscode.StatusBarItem;
  private storage: Storage;
  private statistics: Statistics;
  private updateTimer: NodeJS.Timeout | undefined;
  private reminderStartTime: number;
  private intervalMs: number;

  constructor(storage: Storage, statistics: Statistics) {
    this.storage = storage;
    this.statistics = statistics;
    this.reminderStartTime = Date.now();
    this.intervalMs = this.getConfig().interval * 60 * 1000;

    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = 'stando.statusBarClick';
    this.statusBarItem.show();

    this.startUpdateTimer();
  }

  private getConfig(): PluginConfig {
    const config = vscode.workspace.getConfiguration('stando');
    return {
      interval: config.get<number>('interval', 60),
      displayMode: config.get<DisplayMode>('displayMode', 'silent'),
      message: config.get<string>('message', 'Time to stand up and stretch!'),
      dndEnabled: config.get<boolean>('dndEnabled', false),
      dndStartTime: config.get<string>('dndStartTime', '12:00'),
      dndEndTime: config.get<string>('dndEndTime', '13:00'),
    };
  }

  private startUpdateTimer(): void {
    // Update every second for countdown mode, every 10 seconds for others
    const config = this.getConfig();
    const updateInterval = config.displayMode === 'countdown' ? 1000 : 10000;

    this.updateTimer = setInterval(() => {
      this.update();
    }, updateInterval);

    this.update();
  }

  resetTimer(): void {
    this.reminderStartTime = Date.now();
    this.intervalMs = this.getConfig().interval * 60 * 1000;
    this.update();
  }

  update(): void {
    const config = this.getConfig();
    const currentState = this.storage.getCurrentState();
    const isPaused = this.storage.isPaused();

    // Show standing state
    if (currentState === 'standing') {
      const standStart = this.storage.getCurrentStandStart();
      if (standStart) {
        const duration = Math.floor((Date.now() - standStart) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        this.statusBarItem.text = `$(person) ${minutes}:${String(seconds).padStart(2, '0')}`;
        this.statusBarItem.tooltip = 'Standing... Click to sit down';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
      }
      return;
    }

    // Show paused state
    if (isPaused) {
      this.statusBarItem.text = '$(debug-pause) Paused';
      this.statusBarItem.tooltip = 'Stando paused. Click for options.';
      this.statusBarItem.backgroundColor = undefined;
      return;
    }

    // Normal state based on display mode
    this.statusBarItem.backgroundColor = undefined;

    switch (config.displayMode) {
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

    this.statusBarItem.text = `$(watch) ${minutes}:${String(seconds).padStart(2, '0')}`;
    this.statusBarItem.tooltip = 'Time until next stand reminder. Click for options.';
  }

  private showProgress(): void {
    const elapsed = Date.now() - this.reminderStartTime;
    const progress = Math.min(1, elapsed / this.intervalMs);
    const filledCount = Math.floor(progress * 8);
    const emptyCount = 8 - filledCount;

    const filled = '█'.repeat(filledCount);
    const empty = '░'.repeat(emptyCount);

    this.statusBarItem.text = `$(person) ${filled}${empty}`;
    this.statusBarItem.tooltip = `Progress: ${Math.floor(progress * 100)}%. Click for options.`;
  }

  private showLastTime(): void {
    const stats = this.storage.getTodayStatistics();
    if (stats.standRecords.length > 0) {
      const lastRecord = stats.standRecords[stats.standRecords.length - 1];
      const lastTime = new Date(lastRecord.endTime);
      const timeStr = `${String(lastTime.getHours()).padStart(2, '0')}:${String(lastTime.getMinutes()).padStart(2, '0')}`;
      this.statusBarItem.text = `$(history) Last: ${timeStr}`;
    } else {
      this.statusBarItem.text = '$(history) No record';
    }
    this.statusBarItem.tooltip = 'Last stand time. Click for options.';
  }

  private showSilent(): void {
    this.statusBarItem.text = '$(person)';
    this.statusBarItem.tooltip = 'Stando. Click for options.';
  }

  dispose(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    this.statusBarItem.dispose();
  }
}
