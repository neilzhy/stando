import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import ReminderDialog from './components/ReminderDialog.vue';
import StatisticsWindow from './components/StatisticsWindow.vue';
import SettingsWindow from './components/SettingsWindow.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/reminder', component: ReminderDialog },
    { path: '/statistics', component: StatisticsWindow },
    { path: '/settings', component: SettingsWindow },
  ],
});

const app = createApp(App);
app.use(router);
app.mount('#app');
