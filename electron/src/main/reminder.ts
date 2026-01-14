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
    ipcMain.on(IPC_CHANNELS.REMINDER_ACTION, async (_event, action: string) => {
      WindowManager.closeReminderWindow();

      if (action === 'stand-up') {
        // Clear snooze and update lastReminderTime
        await this.storage.setSnoozeEndTime(undefined);
        await this.storage.setLastReminderTime(Date.now());
        this.onStandUp();
      } else if (action === 'snooze') {
        // Set snooze end time (5 minutes from now)
        const snoozeEndTime = Date.now() + 5 * 60 * 1000;
        await this.storage.setSnoozeEndTime(snoozeEndTime);

        // Schedule reminder after snooze
        if (this.reminderTimer) {
          clearTimeout(this.reminderTimer);
        }
        this.reminderTimer = setTimeout(async () => {
          await this.storage.setSnoozeEndTime(undefined);
          this.triggerReminder();
        }, 5 * 60 * 1000);
      } else {
        // Dismissed - clear snooze and update lastReminderTime
        await this.storage.setSnoozeEndTime(undefined);
        await this.storage.setLastReminderTime(Date.now());
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
    // Note: lastReminderTime will be updated when user clicks a button
    WindowManager.createReminderWindow(pluginConfig.message);
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
