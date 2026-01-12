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
  }
}
