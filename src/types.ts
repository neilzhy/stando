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
}

// Plugin configuration
export interface PluginConfig {
  interval: number;                // Reminder interval in minutes
  displayMode: DisplayMode;        // Status bar display mode
  message: string;                 // Reminder message
  dndEnabled: boolean;             // Do Not Disturb enabled
  dndStartTime: string;            // DND start time (HH:MM)
  dndEndTime: string;              // DND end time (HH:MM)
}

// Statistics summary for display
export interface StatsSummary {
  standCount: number;              // Today's stand count
  averageStandTime: number;        // Average stand time in seconds
  totalStandTime: number;          // Total stand time in seconds
  totalSitTime: number;            // Total sit time in seconds
}
