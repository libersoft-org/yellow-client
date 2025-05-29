import { accounts_config, getGuid, selectAccount, type AccountConfig } from './core.ts';
import { get } from 'svelte/store';

export function addAccount(config: Partial<AccountConfig>, settings: Record<string, any>): string {
  console.log('addAccount(config, settings)', config, settings);
  let id = getGuid();
  accounts_config.update((v) => [
    ...v,
    {
      id,
      enabled: false,
      credentials: {
        server: '',
        address: '',
        password: '',
        ...config.credentials,
      },
      settings,
      ...config,
    } as AccountConfig,
  ]);
  selectAccount(id);
  return id;
}

export function saveAccount(id: string, config: Partial<AccountConfig>, settings: Record<string, any>): void {
  console.log('saveAccount', id, config, settings);
  accounts_config.update((v) => {
    for (let acc of v) {
      if (acc.id === id) {
        for (const [key, value] of Object.entries(config)) {
          (acc as any)[key] = value;
        }
        for (const [key, value] of Object.entries(settings)) {
          if (acc.settings === undefined) acc.settings = {};
          acc.settings[key] = value;
        }
      }
      console.log('saveAccount acc config:', JSON.stringify(acc));
    }
    return v;
  });
}

export function delAccount(id: string): void {
  accounts_config.update((v) => v.filter((a) => a.id !== id));
}

export function findAccountConfig(id: string): AccountConfig | undefined {
  return get(accounts_config).find((a) => a.id === id);
}
