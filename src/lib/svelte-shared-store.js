/*
https://gist.github.com/bdougherty/281593f0df6dad595fd56af9721e743d
no license!
 */

import { writable, get } from 'svelte/store';

export function localStorageSharedStore(name, default_) {
 function setStorage(value) {
  let str = JSON.stringify(value);
  console.log('SAVE', name, str);
  window.localStorage.setItem(name, str);
 }

 function getStorage() {
  let item = window.localStorage.getItem(name);
  /*
		console.log("getStorage()");
		console.log(item);
		*/
  let result = default_;
  try {
   if (item != 'undefined' && item) result = JSON.parse(item);
   if (!result) result = default_;
  } catch (e) {
   console.log('trying to parse: "' + item + '"');
   console.log(e);
  }
  /*
		console.log("getStorage result");
		console.log(result);

 */
  return result;
 }

 function start() {
  function handleStorageEvent({ key, newValue }) {
   if (key !== name) {
    return;
   }
   set(JSON.parse(newValue));
  }

  set(getStorage());
  //console.log('111');
  window.addEventListener('storage', handleStorageEvent);

  return () => window.removeEventListener('storage', handleStorageEvent);
 }

 const { subscribe, set, update } = writable(null, start);

 return {
  subscribe,
  set(value) {
   //console.log(value);
   setStorage(value);
   set(value);
  },
  update(fn) {
   let value2 = fn(get(this));
   //console.log(value2);
   setStorage(value2);
   set(value2);
  },
 };
}
