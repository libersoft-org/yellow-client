import type { Writable, Readable, Subscriber, Unsubscriber, Updater } from 'svelte/store';

export function skipFirst<T>(store: { subscribe: (callback: (value: T) => void) => Unsubscriber }): Readable<T> {
  return {
    subscribe(run: Subscriber<T>): Unsubscriber {
      let first = true;
      return store.subscribe((value) => {
        if (first) {
          first = false;
          return; // skip the first emitted value
        }
        run(value);
      });
    },
  };
}

export function skipFirstW<T>(store: Writable<T>): Writable<T> {
  return {
    subscribe(run: Subscriber<T>): Unsubscriber {
      let first = true;
      return store.subscribe((value) => {
        if (first) {
          first = false;
          return; // skip the first emitted value
        }
        run(value);
      });
    },
    set(value: T) {
      store.set(value);
    },
    update(updater: Updater<T>) {
      store.update(updater);
    },
  };
}
