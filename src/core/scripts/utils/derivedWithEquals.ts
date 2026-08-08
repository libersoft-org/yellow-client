import { type Readable, derived } from 'svelte/store';

/**
 * A derived store that only updates if the derived value is not equal
 * to the previous one, as determined by `equalsFn`.
 *
 * @param stores - A single readable store or an array of readable stores.
 * @param deriveFn - Function to compute the derived value.
 * @param equalsFn - Function to compare old and new values (default: strict equality).
 * @returns A derived readable store.
 */
export function derivedWithEquals<S, T>(stores: Readable<S>, deriveFn: (value: S) => T, equalsFn?: (a: T | undefined, b: T) => boolean): Readable<T>;
export function derivedWithEquals<S extends Readable<any>[], T>(
	stores: [...S],
	deriveFn: (values: {
		[K in keyof S]: S[K] extends Readable<infer U> ? U : never;
	}) => T,
	equalsFn?: (a: T | undefined, b: T) => boolean
): Readable<T>;
export function derivedWithEquals(stores: any, deriveFn: any, equalsFn: (a: any, b: any) => boolean = (a, b) => a === b): Readable<any> {
	let previous: any;
	return derived(stores, ($stores: any, set: (value: any) => void) => {
		const next = deriveFn($stores);
		if (!equalsFn(previous, next)) {
			previous = next;
			set(next);
		}
	});
}
