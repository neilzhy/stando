<template>
  <div class="statistics-window">
    <div class="header">
      <h1>📊 Today's Statistics</h1>
    </div>

    <div class="content" v-if="!loading">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🧍</div>
          <div class="stat-value">{{ statistics.standCount }}</div>
          <div class="stat-label">Stand count</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">{{ formatDuration(statistics.averageStandTime) }}</div>
          <div class="stat-label">Average stand time</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🕐</div>
          <div class="stat-value">{{ formatDuration(statistics.totalStandTime) }}</div>
          <div class="stat-label">Total stand time</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💺</div>
          <div class="stat-value">{{ formatDuration(statistics.totalSitTime) }}</div>
          <div class="stat-label">Total sit time</div>
        </div>
      </div>

      <div class="current-state">
        <div class="state-label">📍 Current state:</div>
        <div class="state-value" :class="{ standing: currentState === 'standing' }">
          {{ currentState === 'standing' ? 'Standing 🧍' : 'Sitting 💺' }}
        </div>
        <div v-if="currentState === 'standing' && standStart" class="current-duration">
          ⏳ Current stand: {{ formatDuration(currentStandDuration) }}
        </div>
      </div>
    </div>

    <div class="loading" v-else>
      Loading...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface StatsSummary {
  standCount: number;
  averageStandTime: number;
  totalStandTime: number;
  totalSitTime: number;
}

const loading = ref(true);
const statistics = ref<StatsSummary>({
  standCount: 0,
  averageStandTime: 0,
  totalStandTime: 0,
  totalSitTime: 0,
});
const currentState = ref<'sitting' | 'standing'>('sitting');
const standStart = ref<number | undefined>();
const currentStandDuration = ref(0);

let updateTimer: NodeJS.Timeout | undefined;

const loadStatistics = async () => {
  try {
    const data = await window.electronAPI.getStatistics();
    statistics.value = data.summary;
    currentState.value = data.currentState;
    standStart.value = data.standStart;
    loading.value = false;
  } catch (error) {
    console.error('Failed to load statistics:', error);
  }
};

const updateCurrentDuration = () => {
  if (currentState.value === 'standing' && standStart.value) {
    currentStandDuration.value = Math.floor((Date.now() - standStart.value) / 1000);
  }
};

const formatDuration = (seconds: number): string => {
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
};

onMounted(() => {
  loadStatistics();
  // Update every 5 seconds
  updateTimer = setInterval(() => {
    loadStatistics();
    updateCurrentDuration();
  }, 5000);
});

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer);
  }
});
</script>

<style scoped>
.statistics-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.current-state {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.state-label {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.state-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.state-value.standing {
  color: #667eea;
}

.current-duration {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #666;
}
</style>
