<template>
  <div class="settings-window">
    <div class="header">
      <h1>⚙️ Settings</h1>
    </div>

    <div class="content" v-if="!loading">
      <form @submit.prevent="handleSave">
        <div class="section">
          <h2>Reminder Settings</h2>

          <div class="form-group">
            <label for="interval">Interval (minutes)</label>
            <input
              id="interval"
              type="number"
              v-model.number="config.interval"
              min="1"
              max="480"
              required
            />
            <span class="hint">Reminder interval: 1-480 minutes</span>
          </div>

          <div class="form-group">
            <label for="message">Custom message</label>
            <textarea
              id="message"
              v-model="config.message"
              rows="3"
              required
            ></textarea>
          </div>
        </div>

        <div class="section">
          <h2>Display Mode</h2>

          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="countdown" v-model="config.displayMode" />
              <span>⏱️ Countdown</span>
            </label>
            <label class="radio-label">
              <input type="radio" value="progress" v-model="config.displayMode" />
              <span>📊 Progress bar</span>
            </label>
            <label class="radio-label">
              <input type="radio" value="lastTime" v-model="config.displayMode" />
              <span>🕐 Last stand time</span>
            </label>
            <label class="radio-label">
              <input type="radio" value="silent" v-model="config.displayMode" />
              <span>🔇 Silent (icon only)</span>
            </label>
          </div>
        </div>

        <div class="section">
          <h2>Do Not Disturb</h2>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="config.dndEnabled" />
              <span>Enable DND mode</span>
            </label>
          </div>

          <div class="form-row" v-if="config.dndEnabled">
            <div class="form-group">
              <label for="dndStartTime">Start time</label>
              <input
                id="dndStartTime"
                type="time"
                v-model="config.dndStartTime"
                required
              />
            </div>

            <div class="form-group">
              <label for="dndEndTime">End time</label>
              <input
                id="dndEndTime"
                type="time"
                v-model="config.dndEndTime"
                required
              />
            </div>
          </div>
        </div>

        <div class="section">
          <h2>⏰ 下班提醒</h2>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="config.offWorkEnabled" />
              <span>启用下班提醒</span>
            </label>
          </div>

          <div v-if="config.offWorkEnabled">
            <div class="form-group">
              <label for="offWorkTime">下班时间</label>
              <input
                id="offWorkTime"
                type="time"
                v-model="config.offWorkTime"
                required
              />
            </div>

            <div class="form-group">
              <label for="offWorkDuration">提醒时长（分钟）</label>
              <input
                id="offWorkDuration"
                type="number"
                v-model.number="config.offWorkDuration"
                min="10"
                step="10"
                required
              />
              <span class="hint">从下班时间开始，持续提醒的时长</span>
            </div>

            <div class="form-group">
              <label for="offWorkMessage">提醒文字</label>
              <textarea
                id="offWorkMessage"
                v-model="config.offWorkMessage"
                rows="2"
                placeholder="该下班了！注意休息 💼"
                required
              ></textarea>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <button type="button" class="btn-secondary" @click="handleCancel">
            Cancel
          </button>
        </div>

        <div v-if="saveMessage" class="save-message" :class="{ error: saveError }">
          {{ saveMessage }}
        </div>
      </form>
    </div>

    <div class="loading" v-else>
      Loading...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, toRaw } from 'vue';

interface PluginConfig {
  interval: number;
  displayMode: 'countdown' | 'progress' | 'lastTime' | 'silent';
  message: string;
  dndEnabled: boolean;
  dndStartTime: string;
  dndEndTime: string;
}

const loading = ref(true);
const saving = ref(false);
const saveMessage = ref('');
const saveError = ref(false);

const config = ref<PluginConfig>({
  interval: 60,
  displayMode: 'silent',
  message: 'Time to stand up and stretch!',
  dndEnabled: false,
  dndStartTime: '12:00',
  dndEndTime: '13:00',
});

const loadConfig = async () => {
  try {
    const data = await window.electronAPI.getConfig();
    config.value = data;
    loading.value = false;
  } catch (error) {
    console.error('Failed to load config:', error);
    loading.value = false;
  }
};

const handleSave = async () => {
  saving.value = true;
  saveMessage.value = '';
  saveError.value = false;

  try {
    // Use toRaw() to convert Vue reactive proxy to plain object for IPC
    const plainConfig = toRaw(config.value);
    await window.electronAPI.updateConfig(plainConfig);
    saveMessage.value = '✓ Settings saved successfully!';
    setTimeout(() => {
      saveMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Failed to save config:', error);
    saveMessage.value = '✗ Failed to save settings';
    saveError.value = true;
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  window.close();
};

onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.settings-window {
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

.section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
}

.form-group input[type="number"],
.form-group input[type="time"],
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
}

.hint {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-label {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-label:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.radio-label input[type="radio"] {
  margin-right: 12px;
  width: 18px;
  height: 18px;
}

.radio-label input[type="radio"]:checked + span {
  font-weight: 600;
  color: #667eea;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 12px;
  width: 18px;
  height: 18px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

button {
  padding: 12px 32px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e0e0e0;
  color: #555;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.save-message {
  text-align: center;
  margin-top: 16px;
  padding: 12px;
  border-radius: 6px;
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: 500;
}

.save-message.error {
  background: #ffebee;
  color: #c62828;
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
