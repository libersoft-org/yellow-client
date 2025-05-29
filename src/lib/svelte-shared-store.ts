import { writable, get, type Writable } from 'svelte/store';

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

	// Create a writable store with a start function that properly handles the storage event listener
	const internalStore = writable<T>(default_, (set) => {
		// Initialize with the value from localStorage
		set(getStorage());

		// Set up the storage event listener
		function handleStorageEvent({ key, newValue }: StorageEvent): void {
			if (key !== name || newValue === null) return;
			try {
				set(JSON.parse(newValue));
			} catch (e) {
				console.error(`Error parsing storage event value for ${name}:`, e);
			}
		}

		// Add the event listener
		window.addEventListener('storage', handleStorageEvent);

		// Return the unsubscribe function that removes the event listener
		return () => {
			window.removeEventListener('storage', handleStorageEvent);
		};
	});

	// Create the store interface with the extended functionality
	const store: Writable<T> = {
		// Pass through the subscribe method, which handles unsubscription properly
		subscribe: internalStore.subscribe,

		// Custom set method that also updates localStorage
		set(value: T): void {
			setStorage(value);
			internalStore.set(value);
		},

		// Custom update method that also updates localStorage
		update(fn: (value: T) => T): void {
			const value = fn(get(internalStore));
			setStorage(value);
			internalStore.set(value);
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

	// Create a writable store with a start function that only sets the initial value
	const internalStore = writable<T>(default_, (set) => {
		// Initialize with the value from localStorage
		set(getStorage());

		// Return an empty unsubscribe function since we don't have any listeners
		return () => {};
	});

	// Create the store interface with the extended functionality
	const store: Writable<T> = {
		// Pass through the subscribe method from the internal store
		subscribe: internalStore.subscribe,

		// Custom set method that also updates localStorage
		set(value: T): void {
			setStorage(value);
			internalStore.set(value);
		},

		// Custom update method that also updates localStorage
		update(fn: (value: T) => T): void {
			const value = fn(get(internalStore));
			setStorage(value);
			internalStore.set(value);
		},
	};

	return store;
}
