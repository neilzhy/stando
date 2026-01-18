import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, PluginConfig } from '../main/types';

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Reminder actions
  sendReminderAction: (action: string) => {
    ipcRenderer.send(IPC_CHANNELS.REMINDER_ACTION, action);
  },

  onReminderMessage: (callback: (message: string) => void) => {
    ipcRenderer.on('reminder-message', (_event, message) => callback(message));
  },

  // Statistics
  getStatistics: () => ipcRenderer.invoke(IPC_CHANNELS.GET_STATISTICS),
  getCurrentState: () => ipcRenderer.invoke(IPC_CHANNELS.GET_CURRENT_STATE),
  getAllStats: () => ipcRenderer.invoke(IPC_CHANNELS.GET_ALL_STATS),

  // Config
  getConfig: () => ipcRenderer.invoke(IPC_CHANNELS.GET_CONFIG),
  updateConfig: (config: Partial<PluginConfig>) =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_CONFIG, config),

  // Commands
  standUp: () => ipcRenderer.invoke(IPC_CHANNELS.STAND_UP),
  sitDown: () => ipcRenderer.invoke(IPC_CHANNELS.SIT_DOWN),
  pause: () => ipcRenderer.invoke(IPC_CHANNELS.PAUSE),
  resume: () => ipcRenderer.invoke(IPC_CHANNELS.RESUME),

  // Off-work reminder actions
  sendOffWorkReminderAction: (action: string) => {
    ipcRenderer.send(IPC_CHANNELS.OFF_WORK_REMINDER_ACTION, action);
  },

  onOffWorkReminderMessage: (callback: (message: string) => void) => {
    ipcRenderer.on('off-work-reminder-message', (_event, message) => callback(message));
  },
});

// Type definitions for TypeScript
export interface ElectronAPI {
  sendReminderAction: (action: string) => void;
  onReminderMessage: (callback: (message: string) => void) => void;
  getStatistics: () => Promise<any>;
  getCurrentState: () => Promise<string>;
  getAllStats: () => Promise<any[]>;
  getConfig: () => Promise<PluginConfig>;
  updateConfig: (config: Partial<PluginConfig>) => Promise<PluginConfig>;
  standUp: () => Promise<void>;
  sitDown: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  sendOffWorkReminderAction: (action: string) => void;
  onOffWorkReminderMessage: (callback: (message: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
