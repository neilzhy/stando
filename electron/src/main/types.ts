// Display mode options
export type DisplayMode = 'countdown' | 'progress' | 'lastTime' | 'silent';

// User state
export type UserState = 'sitting' | 'standing';

// Stand record for a single stand session
export interface StandRecord {
  startTime: number;   // Timestamp when standing started
  endTime: number;     // Timestamp when standing ended
  duration: number;    // Duration in seconds
}

// Daily statistics
export interface DailyStats {
  date: string;                    // Date in YYYY-MM-DD format
  standCount: number;              // Number of times stood up
  totalStandTime: number;          // Total standing time in seconds
  totalSitTime: number;            // Total sitting time in seconds
  standRecords: StandRecord[];     // Detailed stand records
}

// Persistent storage data structure
export interface StorageData {
  dailyStats: DailyStats[];        // Last 7 days of statistics
  currentState: UserState;         // Current state (sitting or standing)
  currentStandStart?: number;      // Timestamp when current standing started
  lastReminderTime?: number;       // Timestamp of last reminder
  isPaused: boolean;               // Whether reminder is paused
  sessionStartTime?: number;       // When the current sitting session started
  snoozeEndTime?: number;          // Timestamp when snooze ends
}

// Plugin configuration
export interface PluginConfig {
  interval: number;                // Reminder interval in minutes
  displayMode: DisplayMode;        // Status bar display mode
  message: string;                 // Reminder message
  dndEnabled: boolean;             // Do Not Disturb enabled
  dndStartTime: string;            // DND start time (HH:MM)
  dndEndTime: string;              // DND end time (HH:MM)

  // Off-work reminder configuration
  offWorkEnabled: boolean;         // Whether off-work reminder is enabled
  offWorkTime: string;             // Off-work time (HH:MM)
  offWorkDuration: number;         // Reminder duration in minutes
  offWorkMessage: string;          // Custom off-work reminder message
}

// Statistics summary for display
export interface StatsSummary {
  standCount: number;              // Today's stand count
  averageStandTime: number;        // Average stand time in seconds
  totalStandTime: number;          // Total stand time in seconds
  totalSitTime: number;            // Total sit time in seconds
}

// IPC channel names
export const IPC_CHANNELS = {
  // Reminder actions
  REMINDER_ACTION: 'reminder-action',
  OFF_WORK_REMINDER_ACTION: 'off-work-reminder-action',

  // Storage operations
  GET_STATISTICS: 'get-statistics',
  GET_CURRENT_STATE: 'get-current-state',
  GET_ALL_STATS: 'get-all-stats',

  // Config operations
  GET_CONFIG: 'get-config',
  UPDATE_CONFIG: 'update-config',

  // Command operations
  STAND_UP: 'stand-up',
  SIT_DOWN: 'sit-down',
  PAUSE: 'pause',
  RESUME: 'resume',
  SHOW_STATISTICS: 'show-statistics',
  SHOW_SETTINGS: 'show-settings',
} as const;
