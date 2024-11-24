import { accounts_config, getGuid, selectAccount } from './core.js';
import { get } from 'svelte/store';

export function addAccount(config, settings) {
 console.log('addAccount(config, settings)', config, settings);
 let id = getGuid();
 accounts_config.update(v => [
  ...v,
  {
   id,
   ...config,
   settings,
  },
 ]);
 selectAccount(id);
 return id;
}

export function saveAccount(id, config, settings) {
 console.log('saveAccount', id, config, settings);
 accounts_config.update(v => {
  for (let acc of v) {
   if (acc.id === id) {
    for (const [key, value] of Object.entries(config)) {
     acc[key] = value;
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

export function delAccount(id) {
 accounts_config.update(v => v.filter(a => a.id !== id));
}

export function findAccountConfig(id) {
 return get(accounts_config).find(a => a.id === id);
}
