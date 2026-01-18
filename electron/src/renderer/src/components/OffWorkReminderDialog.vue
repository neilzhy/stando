<template>
  <div class="off-work-reminder-dialog">
    <div class="icon">💼</div>
    <h1 class="title">{{ message }}</h1>

    <div class="buttons">
      <button @click="handleDismiss" class="btn-primary">
        ✅ 知道了
      </button>
      <button @click="handleSnooze" class="btn-secondary">
        ⏱️ 再等等 (10分钟后再提醒)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const message = ref('该下班了！');

onMounted(() => {
  window.electronAPI.onOffWorkReminderMessage((msg: string) => {
    message.value = msg;
  });
});

const handleDismiss = () => {
  window.electronAPI.sendOffWorkReminderAction('dismiss');
};

const handleSnooze = () => {
  window.electronAPI.sendOffWorkReminderAction('snooze');
};
</script>

<style scoped>
.off-work-reminder-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 16px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
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
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: white;
  color: #f5576c;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
