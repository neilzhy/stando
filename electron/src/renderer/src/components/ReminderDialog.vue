<template>
  <div class="reminder-dialog">
    <div class="icon">⏰</div>
    <h1 class="title">{{ message }}</h1>

    <div class="buttons">
      <button @click="handleStandUp" class="btn-primary">
        🧍 Stand Up
      </button>

      <button @click="handleSnooze" class="btn-secondary">
        ⏱️ Snooze 5min
      </button>

      <button @click="handleDismiss" class="btn-text">
        Dismiss
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const message = ref('Time to stand up and stretch!');

onMounted(() => {
  // Listen for message from main process
  window.electronAPI.onReminderMessage((msg: string) => {
    message.value = msg;
  });
});

const handleStandUp = () => {
  window.electronAPI.sendReminderAction('stand-up');
};

const handleSnooze = () => {
  window.electronAPI.sendReminderAction('snooze');
};

const handleDismiss = () => {
  window.electronAPI.sendReminderAction('dismiss');
};
</script>

<style scoped>
.reminder-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 280px;
}

button {
  padding: 12px 20px;
  font-size: 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-text {
  background: transparent;
  color: white;
  opacity: 0.8;
}

.btn-text:hover {
  opacity: 1;
}
</style>
