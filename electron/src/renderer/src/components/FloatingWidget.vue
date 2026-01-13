<template>
  <div class="floating-widget" :class="{ standing: isStanding }">
    <div class="status-icon">{{ isStanding ? '🧍' : '💺' }}</div>
    <div class="time-display">{{ displayTime }}</div>
    <div class="label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const displayTime = ref('0:00');
const label = ref('Next reminder');
const isStanding = ref(false);

let updateTimer: NodeJS.Timeout | undefined;

const updateDisplay = async () => {
  try {
    const stats = await window.electronAPI.getStatistics();
    const config = await window.electronAPI.getConfig();

    isStanding.value = stats.currentState === 'standing';

    if (isStanding.value) {
      // Show standing duration
      if (stats.standStart) {
        const duration = Math.floor((Date.now() - stats.standStart) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        displayTime.value = `${minutes}:${String(seconds).padStart(2, '0')}`;
        label.value = 'Standing';
      }
    } else {
      // Show countdown to next reminder
      const intervalMs = config.interval * 60 * 1000;
      const lastReminder = stats.lastReminderTime || Date.now();
      const elapsed = Date.now() - lastReminder;
      const remaining = Math.max(0, intervalMs - elapsed);
      const remainingSeconds = Math.floor(remaining / 1000);
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      displayTime.value = `${minutes}:${String(seconds).padStart(2, '0')}`;
      label.value = 'Next reminder';
    }
  } catch (error) {
    console.error('Failed to update display:', error);
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
  cursor: move;
  -webkit-app-region: drag;
}

.floating-widget.standing {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.status-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.time-display {
  font-size: 28px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  margin-bottom: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.label {
  font-size: 11px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
