import { accounts_config, getRandomString } from './core.js';
import { get } from 'svelte/store';

export function addAccount(config) {
 accounts_config.update(v => [
  ...v,
  {
   id: getRandomString(),
   title: 'New Account',
   ...config,
  },
 ]);
}

export function saveAccount(id, config) {
 console.log('saveAccount', id, config);
 accounts_config.update(v => {
  let r = v.map(a => (a.id === id ? { ...a, ...config } : a));
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
