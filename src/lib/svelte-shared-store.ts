import { writable, get, type Writable, type Unsubscriber } from 'svelte/store';

export function localStorageSharedStore<T>(name: string, default_: T): Writable<T> {
 function setStorage(value: T): void {
  const str = JSON.stringify(value);
  //console.log('SAVE', name, str);
  window.localStorage.setItem(name, str);
 }

 function getStorage(): T {
  const item = window.localStorage.getItem(name);
  let result: T = default_;
  try {
   //console.log('LOAD', name, item);
   if (item !== null) {
    result = JSON.parse(item) as T;
   }
  } catch (e) {
   console.error('trying to parse: "' + item + '"');
   console.error(e);
  }
  return result;
 }

 function start(set: (value: T) => void): Unsubscriber {
  function handleStorageEvent({ key, newValue }: StorageEvent): void {
   if (key !== name) {
    return;
   }
   console.log('localStorageSharedStore handleStorageEvent', key, newValue);
   set(JSON.parse(newValue!));
  }

  set(getStorage());
  console.log('localStorageSharedStore addEventListener');
  window.addEventListener('storage', handleStorageEvent);

  return () => {
   console.log('localStorageSharedStore removeEventListener');
   window.removeEventListener('storage', handleStorageEvent);
  };
 }

 const { subscribe, set, update } = writable<T>(default_, start);

 const store = {
  subscribe,
  set(value: T): void {
   setStorage(value);
   set(value);
  },
  update(fn: (value: T) => T): void {
   const value2 = fn(get(store));
   setStorage(value2);
   set(value2);
  },
 };
 return store;
}

export function localStorageReadOnceSharedStore<T>(name: string, default_: T): Writable<T> {
 function setStorage(value: T): void {
  const str = JSON.stringify(value);
  //console.log('SAVE', name, str);
  window.localStorage.setItem(name, str);
 }

 function getStorage(): T {
  const item = window.localStorage.getItem(name);
  let result: T = default_;
  try {
   if (item !== 'undefined' && item) result = JSON.parse(item) as T;
   if (!result) result = default_;
  } catch (e) {
   console.log('trying to parse: "' + item + '"');
   console.log(e);
  }
  return result;
 }

 function start(set: (value: T) => void): Unsubscriber {
  set(getStorage());
  return () => {}; // Return unsubscribe function (no-op as there are no event listeners)
 }

 const { subscribe, set, update } = writable<T>(default_, start);

 const store = {
  subscribe,
  set(value: T): void {
   setStorage(value);
   set(value);
  },
  update(fn: (value: T) => T): void {
   const value2 = fn(get(store));
   setStorage(value2);
   set(value2);
  },
 };
 return store;
}
