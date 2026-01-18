import { Config } from './config';
import { WindowManager } from './windows';

export class OffWorkReminder {
  private checkTimer: NodeJS.Timeout | undefined;
  private reminderTimer: NodeJS.Timeout | undefined;
  private config: Config;
  private isInReminderPeriod: boolean = false;

  constructor(config: Config) {
    this.config = config;
  }

  start(): void {
    // Check every minute if we need to start reminding
    this.checkTimer = setInterval(() => {
      this.checkAndSchedule();
    }, 60 * 1000);

    // Execute check immediately
    this.checkAndSchedule();
  }

  private checkAndSchedule(): void {
    const pluginConfig = this.config.getConfig();

    if (!pluginConfig.offWorkEnabled) {
      return;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Parse off-work time
    const [offWorkHour, offWorkMinute] = pluginConfig.offWorkTime.split(':').map(Number);
    const offWorkMinutes = offWorkHour * 60 + offWorkMinute;

    // Calculate reminder end time
    const endMinutes = offWorkMinutes + pluginConfig.offWorkDuration;

    // Check if we are in the reminder period
    const inPeriod = currentMinutes >= offWorkMinutes && currentMinutes < endMinutes;

    if (inPeriod && !this.isInReminderPeriod) {
      // Just entered reminder period
      this.isInReminderPeriod = true;
      this.startReminders();
    } else if (!inPeriod && this.isInReminderPeriod) {
      // Left reminder period
      this.isInReminderPeriod = false;
      this.stopReminders();
    }
  }

  private startReminders(): void {
    // Trigger first reminder immediately
    this.triggerOffWorkReminder();

    // Remind every 10 minutes
    this.reminderTimer = setInterval(() => {
      this.triggerOffWorkReminder();
    }, 10 * 60 * 1000);
  }

  private stopReminders(): void {
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
      this.reminderTimer = undefined;
    }
  }

  private async triggerOffWorkReminder(): Promise<void> {
    const pluginConfig = this.config.getConfig();

    // Create off-work reminder window
    WindowManager.createOffWorkReminderWindow(pluginConfig.offWorkMessage);
  }

  dispose(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
    }
  }
}
