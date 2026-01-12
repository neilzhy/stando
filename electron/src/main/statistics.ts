import { Storage } from './storage';
import { StatsSummary, DailyStats } from './types';

export class Statistics {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  getTodaySummary(): StatsSummary {
    const stats = this.storage.getTodayStatistics();
    return this.calculateSummary(stats);
  }

  private calculateSummary(stats: DailyStats): StatsSummary {
    const averageStandTime = stats.standCount > 0
      ? Math.floor(stats.totalStandTime / stats.standCount)
      : 0;

    return {
      standCount: stats.standCount,
      averageStandTime,
      totalStandTime: stats.totalStandTime,
      totalSitTime: stats.totalSitTime,
    };
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (secs > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${minutes}m`;
  }

  getFormattedSummary(): string {
    const summary = this.getTodaySummary();
    const currentState = this.storage.getCurrentState();

    let message = `📊 Today's Statistics\n\n`;
    message += `🧍 Stand count: ${summary.standCount}\n`;
    message += `⏱️ Average stand time: ${this.formatDuration(summary.averageStandTime)}\n`;
    message += `🕐 Total stand time: ${this.formatDuration(summary.totalStandTime)}\n`;
    message += `💺 Total sit time: ${this.formatDuration(summary.totalSitTime)}\n`;
    message += `\n📍 Current state: ${currentState === 'standing' ? 'Standing 🧍' : 'Sitting 💺'}`;

    // If currently standing, show current stand duration
    if (currentState === 'standing') {
      const standStart = this.storage.getCurrentStandStart();
      if (standStart) {
        const currentDuration = Math.floor((Date.now() - standStart) / 1000);
        message += `\n⏳ Current stand: ${this.formatDuration(currentDuration)}`;
      }
    }

    return message;
  }
}
