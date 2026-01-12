import * as vscode from 'vscode';
import { Storage } from './storage';
import { StatusBar } from './statusBar';
import { PluginConfig } from './types';

export class Reminder {
  private storage: Storage;
  private statusBar: StatusBar;
  private reminderTimer: NodeJS.Timeout | undefined;
  private onStandUp: () => void;

  constructor(storage: Storage, statusBar: StatusBar, onStandUp: () => void) {
    this.storage = storage;
    this.statusBar = statusBar;
    this.onStandUp = onStandUp;
  }

  private getConfig(): PluginConfig {
    const config = vscode.workspace.getConfiguration('stando');
    return {
      interval: config.get<number>('interval', 60),
      displayMode: config.get<string>('displayMode', 'silent') as PluginConfig['displayMode'],
      message: config.get<string>('message', 'Time to stand up and stretch!'),
      dndEnabled: config.get<boolean>('dndEnabled', false),
      dndStartTime: config.get<string>('dndStartTime', '12:00'),
      dndEndTime: config.get<string>('dndEndTime', '13:00'),
    };
  }

  private isInDndPeriod(): boolean {
    const config = this.getConfig();
    if (!config.dndEnabled) {
      return false;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = config.dndStartTime.split(':').map(Number);
    const [endHour, endMin] = config.dndEndTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle overnight DND period (e.g., 22:00 - 06:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  start(): void {
    this.scheduleNextReminder();
  }

  private scheduleNextReminder(): void {
    if (this.reminderTimer) {
      clearTimeout(this.reminderTimer);
    }

    const config = this.getConfig();
    const intervalMs = config.interval * 60 * 1000;

    this.reminderTimer = setTimeout(() => {
      this.triggerReminder();
    }, intervalMs);

    // Reset status bar timer
    this.statusBar.resetTimer();
  }

  private async triggerReminder(): Promise<void> {
    // Check if paused or in DND period
    if (this.storage.isPaused()) {
      this.scheduleNextReminder();
      return;
    }

    if (this.isInDndPeriod()) {
      this.scheduleNextReminder();
      return;
    }

    // Check if already standing
    if (this.storage.getCurrentState() === 'standing') {
      this.scheduleNextReminder();
      return;
    }

    const config = this.getConfig();

    // Show reminder notification
    const selection = await vscode.window.showInformationMessage(
      config.message,
      'Stand Up',
      'Snooze 5min',
      'Dismiss'
    );

    if (selection === 'Stand Up') {
      this.onStandUp();
    } else if (selection === 'Snooze 5min') {
      // Snooze for 5 minutes
      if (this.reminderTimer) {
        clearTimeout(this.reminderTimer);
      }
      this.reminderTimer = setTimeout(() => {
        this.triggerReminder();
      }, 5 * 60 * 1000);
    } else {
      // Dismissed or ignored, schedule next reminder
      this.scheduleNextReminder();
    }

    // Update last reminder time
    await this.storage.setLastReminderTime(Date.now());
  }

  restart(): void {
    this.scheduleNextReminder();
  }

  pause(): void {
    if (this.reminderTimer) {
      clearTimeout(this.reminderTimer);
      this.reminderTimer = undefined;
    }
  }

  resume(): void {
    this.scheduleNextReminder();
  }

  dispose(): void {
    if (this.reminderTimer) {
      clearTimeout(this.reminderTimer);
    }
  }
}
