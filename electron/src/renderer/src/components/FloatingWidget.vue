<template>
  <div
    class="floating-widget"
    :class="{ standing: isStanding, snoozing: isSnoozed }"
    @click="handleClick"
  >
    <div class="status-icon">{{ statusIcon }}</div>

    <!-- Progress bar mode -->
    <div v-if="displayMode === 'progress' && !isStanding && !isSnoozed" class="progress-container">
      <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
      <div class="progress-text">{{ progressPercent }}%</div>
    </div>

    <!-- Countdown / Standing time / Last time / Snooze modes -->
    <div v-else class="time-display">{{ displayTime }}</div>

    <div class="label">{{ label }}</div>

    <!-- Click hint -->
    <div class="click-hint" v-if="isStanding">Click to sit</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

type DisplayMode = 'countdown' | 'progress' | 'lastTime' | 'silent';

const displayTime = ref('--:--');
const label = ref('Loading...');
const isStanding = ref(false);
const isSnoozed = ref(false);
const displayMode = ref<DisplayMode>('countdown');
const progressPercent = ref(0);

const statusIcon = computed(() => {
  if (isSnoozed.value) return '😴';
  if (isStanding.value) return '🧍';
  return '💺';
});

let updateTimer: NodeJS.Timeout | undefined;

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const updateDisplay = async () => {
  try {
    const stats = await window.electronAPI.getStatistics();
    const config = await window.electronAPI.getConfig();

    displayMode.value = config.displayMode as DisplayMode;
    isStanding.value = stats.currentState === 'standing';

    // Check if in snooze mode
    const snoozeEnd = stats.snoozeEndTime;
    if (snoozeEnd && Date.now() < snoozeEnd) {
      isSnoozed.value = true;
      const remaining = Math.floor((snoozeEnd - Date.now()) / 1000);
      displayTime.value = formatTime(remaining);
      label.value = 'SNOOZING';
      return;
    } else {
      isSnoozed.value = false;
    }

    if (isStanding.value) {
      // Standing state: show standing duration
      if (stats.standStart) {
        const duration = Math.floor((Date.now() - stats.standStart) / 1000);
        displayTime.value = formatTime(duration);
        label.value = 'STANDING';
      }
    } else {
      // Sitting state: show based on displayMode
      const intervalMs = config.interval * 60 * 1000;
      const lastReminder = stats.lastReminderTime || Date.now();
      const elapsed = Date.now() - lastReminder;
      const remaining = Math.max(0, intervalMs - elapsed);
      const remainingSeconds = Math.floor(remaining / 1000);

      switch (displayMode.value) {
        case 'countdown':
          displayTime.value = formatTime(remainingSeconds);
          label.value = 'SITTING';
          break;

        case 'progress':
          const percent = Math.min(100, Math.floor((elapsed / intervalMs) * 100));
          progressPercent.value = percent;
          label.value = 'SITTING';
          break;

        case 'lastTime':
          if (stats.lastStandTime) {
            displayTime.value = formatDateTime(stats.lastStandTime);
            label.value = 'LAST STAND';
          } else {
            displayTime.value = '--:--';
            label.value = 'NO RECORD';
          }
          break;

        case 'silent':
        default:
          displayTime.value = '';
          label.value = 'SITTING';
          break;
      }
    }
  } catch (error) {
    console.error('Failed to update display:', error);
  }
};

const handleClick = async () => {
  try {
    if (isStanding.value) {
      // Currently standing, switch to sitting
      await window.electronAPI.sitDown();
    } else {
      // Currently sitting, switch to standing
      await window.electronAPI.standUp();
    }
    // Update display immediately
    await updateDisplay();
  } catch (error) {
    console.error('Failed to toggle state:', error);
  }
};

onMounted(() => {
  updateDisplay();
  // Update every second
  updateTimer = setInterval(updateDisplay, 1000);
});

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer);
  }
});
</script>

<style scoped>
.floating-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 12px;
  user-select: none;
  cursor: pointer;
  -webkit-app-region: drag;
  transition: transform 0.1s ease;
}

.floating-widget:hover {
  transform: scale(1.02);
}

.floating-widget:active {
  transform: scale(0.98);
}

.floating-widget.standing {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.floating-widget.snoozing {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.status-icon {
  font-size: 32px;
  margin-bottom: 4px;
  -webkit-app-region: no-drag;
}

.time-display {
  font-size: 28px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  margin-bottom: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  -webkit-app-region: no-drag;
}

.label {
  font-size: 11px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  -webkit-app-region: no-drag;
}

/* Progress bar styles */
.progress-container {
  width: 80%;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  margin-bottom: 4px;
  -webkit-app-region: no-drag;
}

.progress-bar {
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  color: #667eea;
  text-shadow: none;
}

/* Click hint */
.click-hint {
  font-size: 9px;
  opacity: 0.7;
  margin-top: 4px;
  -webkit-app-region: no-drag;
}
</style>
