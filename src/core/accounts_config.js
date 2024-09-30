import { accounts_config, getRandomString, selectAccount } from './core.js';
import { get } from 'svelte/store';

export function addAccount(config, settings) {
 let id = getRandomString();
 accounts_config.update(v => [
  ...v,
  {
   id,
   ...config,
   settings,
  },
 ]);
 selectAccount(id);
}

export function saveAccount(id, config, settings) {
 console.log('saveAccount', id, config);
 accounts_config.update(v => {
  let r = v.map(a => (a.id === id ? { ...a, ...config } : a));
  r.settings = { ...r.settings, ...settings };
  console.log('saveAccount accs config:', r);
  return r;
 });
}

export function delAccount(id) {
 accounts_config.update(v => v.filter(a => a.id !== id));
}

export function findAccount(id) {
 return get(accounts_config).find(a => a.id === id);
}
