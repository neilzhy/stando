import Store from 'electron-store';
import { PluginConfig } from './types';

export class Config {
  private store: Store<PluginConfig>;

  constructor() {
    this.store = new Store<PluginConfig>({
      name: 'stando-config',
      defaults: {
        interval: 60,
        displayMode: 'silent',
        message: 'Time to stand up and stretch!',
        dndEnabled: false,
        dndStartTime: '12:00',
        dndEndTime: '13:00',
        offWorkEnabled: false,
        offWorkTime: '21:00',
        offWorkDuration: 60,
        offWorkMessage: '该下班了！注意休息 💼',
      }
    });
  }

  getConfig(): PluginConfig {
    return {
      interval: this.store.get('interval', 60),
      displayMode: this.store.get('displayMode', 'silent'),
      message: this.store.get('message', 'Time to stand up and stretch!'),
      dndEnabled: this.store.get('dndEnabled', false),
      dndStartTime: this.store.get('dndStartTime', '12:00'),
      dndEndTime: this.store.get('dndEndTime', '13:00'),
      offWorkEnabled: this.store.get('offWorkEnabled', false),
      offWorkTime: this.store.get('offWorkTime', '21:00'),
      offWorkDuration: this.store.get('offWorkDuration', 60),
      offWorkMessage: this.store.get('offWorkMessage', '该下班了！注意休息 💼'),
    };
  }

  updateConfig(config: Partial<PluginConfig>): void {
    if (config.interval !== undefined) {
      this.store.set('interval', config.interval);
    }
    if (config.displayMode !== undefined) {
      this.store.set('displayMode', config.displayMode);
    }
    if (config.message !== undefined) {
      this.store.set('message', config.message);
    }
    if (config.dndEnabled !== undefined) {
      this.store.set('dndEnabled', config.dndEnabled);
    }
    if (config.dndStartTime !== undefined) {
      this.store.set('dndStartTime', config.dndStartTime);
    }
    if (config.dndEndTime !== undefined) {
      this.store.set('dndEndTime', config.dndEndTime);
    }
    if (config.offWorkEnabled !== undefined) {
      this.store.set('offWorkEnabled', config.offWorkEnabled);
    }
    if (config.offWorkTime !== undefined) {
      this.store.set('offWorkTime', config.offWorkTime);
    }
    if (config.offWorkDuration !== undefined) {
      this.store.set('offWorkDuration', config.offWorkDuration);
    }
    if (config.offWorkMessage !== undefined) {
      this.store.set('offWorkMessage', config.offWorkMessage);
    }
  }
}
