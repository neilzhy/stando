import { ipcMain } from 'electron';
import { Storage } from './storage';
import { Config } from './config';
import { WindowManager } from './windows';
import { IPC_CHANNELS } from './types';

export class Reminder {
  private storage: Storage;
  private config: Config;
  private reminderTimer: NodeJS.Timeout | undefined;
  private onStandUp: () => void;
  private onSitDown: () => void;

  constructor(storage: Storage, config: Config, onStandUp: () => void, onSitDown: () => void) {
    this.storage = storage;
    this.config = config;
    this.onStandUp = onStandUp;
    this.onSitDown = onSitDown;
    this.setupIpcHandlers();
  }

  private setupIpcHandlers(): void {
    // Listen for reminder action from renderer
    ipcMain.on(IPC_CHANNELS.REMINDER_ACTION, (_event, action: string) => {
      WindowManager.closeReminderWindow();

      if (action === 'stand-up') {
        this.onStandUp();
      } else if (action === 'snooze') {
        // Snooze for 5 minutes
        if (this.reminderTimer) {
          clearTimeout(this.reminderTimer);
        }
        this.reminderTimer = setTimeout(() => {
          this.triggerReminder();
        }, 5 * 60 * 1000);
      } else {
        // Dismissed, schedule next reminder
        this.scheduleNextReminder();
      }
    });
  }

  private isInDndPeriod(): boolean {
    const pluginConfig = this.config.getConfig();
    if (!pluginConfig.dndEnabled) {
      return false;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = pluginConfig.dndStartTime.split(':').map(Number);
    const [endHour, endMin] = pluginConfig.dndEndTime.split(':').map(Number);

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

    const pluginConfig = this.config.getConfig();
    const intervalMs = pluginConfig.interval * 60 * 1000;

    this.reminderTimer = setTimeout(() => {
      this.triggerReminder();
    }, intervalMs);
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

    const pluginConfig = this.config.getConfig();

    // Create reminder window
    WindowManager.createReminderWindow(pluginConfig.message);

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
