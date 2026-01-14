import { app, Notification } from 'electron';
import { Storage } from './storage';
import { Statistics } from './statistics';
import { Config } from './config';
import { TrayManager } from './tray';
import { Reminder } from './reminder';
import { WindowManager } from './windows';
import { setupIpcHandlers } from './ipc-handlers';

let storage: Storage;
let statistics: Statistics;
let config: Config;
let tray: TrayManager;
let reminder: Reminder;

// Prevent app from quitting when all windows are closed
app.on('window-all-closed', (e) => {
  e.preventDefault();
});

// Clean up before quit
app.on('before-quit', () => {
  if (tray) {
    tray.dispose();
  }
  if (reminder) {
    reminder.dispose();
  }
  WindowManager.destroyAll();
});

// Main initialization
app.whenReady().then(() => {
  // Initialize modules (same flow as VSCode extension's activate function)
  storage = new Storage();
  statistics = new Statistics(storage);
  config = new Config();

  // Setup IPC handlers
  setupIpcHandlers(
    storage,
    statistics,
    config,
    handleStandUp,
    handleSitDown,
    handlePause,
    handleResume
  );

  // Initialize tray
  tray = new TrayManager(
    storage,
    statistics,
    config,
    handleStandUp,
    handleSitDown,
    handlePause,
    handleResume
  );

  // Initialize reminder
  reminder = new Reminder(
    storage,
    config,
    handleStandUp,
    handleSitDown
  );

  // Start reminder timer
  reminder.start();

  // Create floating widget
  WindowManager.createFloatingWidget();

  console.log('Stando Desktop started successfully');
});

async function handleStandUp(): Promise<void> {
  if (storage.getCurrentState() === 'standing') {
    return;
  }

  await storage.startStanding();
  tray.resetTimer();
  tray.updateTray();
}

async function handleSitDown(): Promise<void> {
  if (storage.getCurrentState() === 'sitting') {
    return;
  }

  await storage.endStanding();
  // Update lastReminderTime so countdown starts from now
  await storage.setLastReminderTime(Date.now());
  reminder.restart();
  tray.resetTimer();
  tray.updateTray();

  // Show notification with today's summary
  const summary = statistics.getTodaySummary();
  const notification = new Notification({
    title: 'Good job!',
    body: `Today: ${summary.standCount} stands, total ${statistics.formatDuration(summary.totalStandTime)}`,
    silent: false,
  });
  notification.show();
}

async function handlePause(): Promise<void> {
  await storage.setPaused(true);
  reminder.pause();
  tray.updateTray();
}

async function handleResume(): Promise<void> {
  await storage.setPaused(false);
  reminder.resume();
  tray.resetTimer();
  tray.updateTray();
}
