import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import ReminderDialog from './components/ReminderDialog.vue';
import StatisticsWindow from './components/StatisticsWindow.vue';
import SettingsWindow from './components/SettingsWindow.vue';
import FloatingWidget from './components/FloatingWidget.vue';
import OffWorkReminderDialog from './components/OffWorkReminderDialog.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/reminder', component: ReminderDialog },
    { path: '/statistics', component: StatisticsWindow },
    { path: '/settings', component: SettingsWindow },
    { path: '/widget', component: FloatingWidget },
    { path: '/off-work-reminder', component: OffWorkReminderDialog },
  ],
});

const app = createApp(App);
app.use(router);
app.mount('#app');
