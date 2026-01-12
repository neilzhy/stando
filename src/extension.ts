import * as vscode from 'vscode';
import { Storage } from './storage';
import { Statistics } from './statistics';
import { StatusBar } from './statusBar';
import { Reminder } from './reminder';

let storage: Storage;
let statistics: Statistics;
let statusBar: StatusBar;
let reminder: Reminder;

export function activate(context: vscode.ExtensionContext) {
  console.log('Stando is now active!');

  // Initialize modules
  storage = new Storage(context);
  statistics = new Statistics(storage);
  statusBar = new StatusBar(storage, statistics);

  // Initialize reminder with stand up callback
  reminder = new Reminder(storage, statusBar, async () => {
    await handleStandUp();
  });

  // Register commands
  const pauseCommand = vscode.commands.registerCommand('stando.pause', async () => {
    await storage.setPaused(true);
    reminder.pause();
    statusBar.update();
    vscode.window.showInformationMessage('Stando paused');
  });

  const resumeCommand = vscode.commands.registerCommand('stando.resume', async () => {
    await storage.setPaused(false);
    reminder.resume();
    statusBar.update();
    vscode.window.showInformationMessage('Stando resumed');
  });

  const standUpCommand = vscode.commands.registerCommand('stando.standUp', async () => {
    await handleStandUp();
  });

  const sitDownCommand = vscode.commands.registerCommand('stando.sitDown', async () => {
    await handleSitDown();
  });

  const showStatisticsCommand = vscode.commands.registerCommand('stando.showStatistics', () => {
    showStatisticsPanel();
  });

  // Status bar click handler
  const statusBarClickCommand = vscode.commands.registerCommand('stando.statusBarClick', async () => {
    const currentState = storage.getCurrentState();

    if (currentState === 'standing') {
      // If standing, click to sit down
      await handleSitDown();
    } else {
      // Show quick pick menu
      const items = [
        { label: '$(graph) Show Statistics', action: 'stats' },
        { label: storage.isPaused() ? '$(play) Resume' : '$(debug-pause) Pause', action: 'toggle' },
        { label: '$(person) Stand Up Now', action: 'stand' },
      ];

      const selection = await vscode.window.showQuickPick(items, {
        placeHolder: 'Stando Options',
      });

      if (selection) {
        switch (selection.action) {
          case 'stats':
            showStatisticsPanel();
            break;
          case 'toggle':
            if (storage.isPaused()) {
              await storage.setPaused(false);
              reminder.resume();
              vscode.window.showInformationMessage('Stando resumed');
            } else {
              await storage.setPaused(true);
              reminder.pause();
              vscode.window.showInformationMessage('Stando paused');
            }
            break;
          case 'stand':
            await handleStandUp();
            break;
        }
        statusBar.update();
      }
    }
  });

  // Listen for configuration changes
  const configChangeListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('stando')) {
      statusBar.update();
      if (!storage.isPaused()) {
        reminder.restart();
      }
    }
  });

  // Register all disposables
  context.subscriptions.push(
    pauseCommand,
    resumeCommand,
    standUpCommand,
    sitDownCommand,
    showStatisticsCommand,
    statusBarClickCommand,
    configChangeListener,
    { dispose: () => statusBar.dispose() },
    { dispose: () => reminder.dispose() }
  );

  // Start the reminder
  reminder.start();
}

async function handleStandUp(): Promise<void> {
  if (storage.getCurrentState() === 'standing') {
    vscode.window.showInformationMessage('You are already standing!');
    return;
  }

  await storage.startStanding();
  statusBar.update();
  vscode.window.showInformationMessage('Great! You are now standing. Click the status bar when done.');
}

async function handleSitDown(): Promise<void> {
  if (storage.getCurrentState() === 'sitting') {
    vscode.window.showInformationMessage('You are already sitting!');
    return;
  }

  await storage.endStanding();
  reminder.restart();
  statusBar.update();

  const summary = statistics.getTodaySummary();
  vscode.window.showInformationMessage(
    `Good job! Today: ${summary.standCount} stands, total ${statistics.formatDuration(summary.totalStandTime)}`
  );
}

function showStatisticsPanel(): void {
  const message = statistics.getFormattedSummary();
  vscode.window.showInformationMessage(message, { modal: true });
}

export function deactivate() {
  console.log('Stando is now deactivated');
}
