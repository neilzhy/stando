import Store from 'electron-store';
import { StorageData, DailyStats, StandRecord, UserState } from './types';

const MAX_DAYS = 7;

export class Storage {
  private store: Store<{ standoData: StorageData }>;
  private data: StorageData;

  constructor() {
    this.store = new Store<{ standoData: StorageData }>({
      name: 'stando-data',
      defaults: {
        standoData: this.getDefaultData()
      }
    });
    this.data = this.load();
  }

  private load(): StorageData {
    const stored = this.store.get('standoData');
    if (stored) {
      // Clean up old data (keep only last 7 days)
      this.cleanupOldData(stored);
      return stored;
    }
    return this.getDefaultData();
  }

  private getDefaultData(): StorageData {
    return {
      dailyStats: [],
      currentState: 'sitting',
      isPaused: false,
      sessionStartTime: Date.now(),
    };
  }

  private cleanupOldData(data: StorageData): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_DAYS);
    const cutoffStr = this.formatDate(cutoffDate);

    data.dailyStats = data.dailyStats.filter(stat => stat.date >= cutoffStr);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getTodayStr(): string {
    return this.formatDate(new Date());
  }

  private getTodayStats(): DailyStats {
    const today = this.getTodayStr();
    let stats = this.data.dailyStats.find(s => s.date === today);
    if (!stats) {
      stats = {
        date: today,
        standCount: 0,
        totalStandTime: 0,
        totalSitTime: 0,
        standRecords: [],
      };
      this.data.dailyStats.push(stats);
    }
    return stats;
  }

  async save(): Promise<void> {
    this.store.set('standoData', this.data);
  }

  getCurrentState(): UserState {
    return this.data.currentState;
  }

  isPaused(): boolean {
    return this.data.isPaused;
  }

  async setPaused(paused: boolean): Promise<void> {
    this.data.isPaused = paused;
    await this.save();
  }

  getLastReminderTime(): number | undefined {
    return this.data.lastReminderTime;
  }

  async setLastReminderTime(time: number): Promise<void> {
    this.data.lastReminderTime = time;
    await this.save();
  }

  getSnoozeEndTime(): number | undefined {
    return this.data.snoozeEndTime;
  }

  async setSnoozeEndTime(time: number | undefined): Promise<void> {
    this.data.snoozeEndTime = time;
    await this.save();
  }

  getCurrentStandStart(): number | undefined {
    return this.data.currentStandStart;
  }

  getSessionStartTime(): number | undefined {
    return this.data.sessionStartTime;
  }

  async startStanding(): Promise<void> {
    const now = Date.now();

    // Record sitting time before standing
    if (this.data.sessionStartTime && this.data.currentState === 'sitting') {
      const sitDuration = Math.floor((now - this.data.sessionStartTime) / 1000);
      const stats = this.getTodayStats();
      stats.totalSitTime += sitDuration;
    }

    this.data.currentState = 'standing';
    this.data.currentStandStart = now;
    this.data.sessionStartTime = now;
    await this.save();
  }

  async endStanding(): Promise<void> {
    const now = Date.now();

    if (this.data.currentStandStart && this.data.currentState === 'standing') {
      const duration = Math.floor((now - this.data.currentStandStart) / 1000);
      const stats = this.getTodayStats();

      const record: StandRecord = {
        startTime: this.data.currentStandStart,
        endTime: now,
        duration,
      };

      stats.standRecords.push(record);
      stats.standCount++;
      stats.totalStandTime += duration;
    }

    this.data.currentState = 'sitting';
    this.data.currentStandStart = undefined;
    this.data.sessionStartTime = now;
    await this.save();
  }

  getTodayStatistics(): DailyStats {
    return this.getTodayStats();
  }

  getAllStats(): DailyStats[] {
    return this.data.dailyStats;
  }
}
