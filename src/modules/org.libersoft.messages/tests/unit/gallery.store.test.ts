import { describe, expect, test, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { GalleryStore, type IGalleryFile } from '../../stores/GalleryStore.ts';

describe('GalleryStore', () => {
	let store: GalleryStore;

	beforeEach(() => {
		store = new GalleryStore();
	});

	test('initial state', () => {
		expect(store.value()).toEqual({ show: false, files: [], currentId: null });
	});

	test('setShow updates show state', () => {
		store.setShow(true);
		expect(store.value().show).toBe(true);

		store.setShow(false);
		expect(store.value().show).toBe(false);
	});

	test('setFiles updates files array', () => {
		const files: IGalleryFile[] = [
			{ id: 1, loaded: false, fileName: 'test1.jpg' },
			{ id: 2, loaded: true, fileName: 'test2.jpg' },
		];
		store.setFiles(files);
		expect(store.value().files).toEqual(files);
	});

	test('updateFile modifies an existing file', () => {
		const files: IGalleryFile[] = [
			{ id: 1, loaded: false, fileName: 'test1.jpg' },
			{ id: 2, loaded: true, fileName: 'test2.jpg' },
		];
		store.setFiles(files);
		store.updateFile(1, { loaded: true, fileName: 'updated.jpg' });
		expect(store.getFile(1)).toMatchObject({ loaded: true, fileName: 'updated.jpg' });
	});

	test('updateFile does nothing if file ID does not exist', () => {
		store.setFiles([{ id: 1, loaded: false, fileName: 'test.jpg' }]);
		store.updateFile(99, { loaded: true });
		expect(store.value().files.length).toBe(1);
		expect(store.getFile(1)?.loaded).toBe(false);
	});

	test('setCurrentId updates currentId', () => {
		store.setCurrentId(1);
		expect(store.value().currentId).toBe(1);
	});

	test('getFile retrieves the correct file', () => {
		store.setFiles([{ id: 1, loaded: false, fileName: 'test.jpg' }]);
		expect(store.getFile(1)).toMatchObject({ id: 1, fileName: 'test.jpg' });
		expect(store.getFile(2)).toBeUndefined();
	});

	test('previous moves to the previous file', () => {
		store.setFiles([
			{ id: 1, loaded: false },
			{ id: 2, loaded: true },
			{ id: 3, loaded: true },
		]);
		store.setCurrentId(3);
		store.previous();
		expect(store.value().currentId).toBe(2);
	});

	test('previous does nothing if at first file', () => {
		store.setFiles([
			{ id: 1, loaded: false },
			{ id: 2, loaded: true },
		]);
		store.setCurrentId(1);
		store.previous();
		expect(store.value().currentId).toBe(1);
	});

	test('next moves to the next file', () => {
		store.setFiles([
			{ id: 1, loaded: false },
			{ id: 2, loaded: true },
			{ id: 3, loaded: true },
		]);
		store.setCurrentId(1);
		store.next();
		expect(store.value().currentId).toBe(2);
	});

	test('next does nothing if at last file', () => {
		store.setFiles([
			{ id: 1, loaded: false },
			{ id: 2, loaded: true },
		]);
		store.setCurrentId(2);
		store.next();
		expect(store.value().currentId).toBe(2);
	});

	test('canPrevious works correctly', () => {
		store.setFiles([
			{ id: 1, loaded: false },
			{ id: 2, loaded: true },
		]);
		store.setCurrentId(2);
		expect(get(store.canPrevious())).toBe(true);
		store.setCurrentId(1);
		expect(get(store.canPrevious())).toBe(false);
	});

	test('canNext works correctly', () => {
		store.setFiles([
			{ id: 1, loaded: false },
			{ id: 2, loaded: true },
		]);
		store.setCurrentId(1);
		expect(get(store.canNext())).toBe(true);
		store.setCurrentId(2);
		expect(get(store.canNext())).toBe(false);
	});
});
