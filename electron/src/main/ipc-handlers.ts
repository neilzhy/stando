import { ipcMain } from 'electron';
import { Storage } from './storage';
import { Statistics } from './statistics';
import { Config } from './config';
import { IPC_CHANNELS, PluginConfig } from './types';

export function setupIpcHandlers(
  storage: Storage,
  statistics: Statistics,
  config: Config,
  onStandUp: () => void,
  onSitDown: () => void,
  onPause: () => void,
  onResume: () => void
): void {
  // Get statistics
  ipcMain.handle(IPC_CHANNELS.GET_STATISTICS, async () => {
    const todayStats = storage.getTodayStatistics();
    const standRecords = todayStats.standRecords || [];
    const lastStandTime = standRecords.length > 0
      ? standRecords[standRecords.length - 1].endTime
      : undefined;

    return {
      summary: statistics.getTodaySummary(),
      formatted: statistics.getFormattedSummary(),
      currentState: storage.getCurrentState(),
      standStart: storage.getCurrentStandStart(),
      lastReminderTime: storage.getLastReminderTime(),
      snoozeEndTime: storage.getSnoozeEndTime(),
      lastStandTime,
    };
  });

  // Get current state
  ipcMain.handle(IPC_CHANNELS.GET_CURRENT_STATE, async () => {
    return storage.getCurrentState();
  });

  // Get all stats
  ipcMain.handle(IPC_CHANNELS.GET_ALL_STATS, async () => {
    return storage.getAllStats();
  });

  // Get config
  ipcMain.handle(IPC_CHANNELS.GET_CONFIG, async () => {
    return config.getConfig();
  });

  // Update config
  ipcMain.handle(IPC_CHANNELS.UPDATE_CONFIG, async (_event, newConfig: Partial<PluginConfig>) => {
    config.updateConfig(newConfig);
    return config.getConfig();
  });

  // Stand up
  ipcMain.handle(IPC_CHANNELS.STAND_UP, async () => {
    onStandUp();
  });

  // Sit down
  ipcMain.handle(IPC_CHANNELS.SIT_DOWN, async () => {
    onSitDown();
  });

  // Pause
  ipcMain.handle(IPC_CHANNELS.PAUSE, async () => {
    onPause();
  });

  // Resume
  ipcMain.handle(IPC_CHANNELS.RESUME, async () => {
    onResume();
  });
}
