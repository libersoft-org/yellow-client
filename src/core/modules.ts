import { get } from 'svelte/store';
import { module_decls, modules_disabled, modules_display_order, selected_module_id } from '@/core/stores.ts';
import { tick } from 'svelte';
import type { ModuleDeclaration, Account } from './types.ts';
export function initModules() {
	return [
		selected_module_id.subscribe(async id => {
			await tick();
			let module_decls_v = get(module_decls);
			for (const k in module_decls_v) {
				const module = module_decls_v[k];
				module.callbacks.onModuleSelected?.(id === module.id);
			}
		}),
		modules_display_order.subscribe(value => {
			//console.log('MODULES ORDER:', value);
			let module_decls_v = get(module_decls);
			for (const k in module_decls_v) {
				const decl = module_decls_v[k];
				if (value[decl.id] !== undefined) {
					decl.order = value[decl.id];
				}
			}
			module_decls.set(module_decls_v);
		}),
	];
}

function initModuleComms(acc: Account, module_id: string, decl: ModuleDeclaration) {
	console.log('initModuleComms:', decl);
	if (!acc.module_data[module_id]) {
		if (decl.callbacks.initData) acc.module_data[module_id] = decl.callbacks?.initData(acc);
		else acc.module_data[module_id] = {};
		acc.module_data[module_id].id = decl.id;
		acc.module_data[module_id].decl = decl;
	}
	if (decl.callbacks.initComms) decl.callbacks.initComms(acc);
}

function deinitModuleComms(decl: ModuleDeclaration, acc: Account) {
	acc.module_data[decl.id].online?.set(false);
	if (decl.callbacks.deinitComms) decl.callbacks.deinitComms(acc);
}

export function updateModulesComms(acc: Account) {
	let available_modules = acc.available_modules;
	let module_decls_v = get(module_decls);
	for (const module_id in module_decls_v) {
		const available = available_modules[module_id];
		const online = acc.module_data[module_id]?.online && get(acc.module_data[module_id].online);
		const decl = module_decls_v[module_id];
		if (!decl) {
			console.log('Module available on server but not found on client:', module_id);
		} else {
			if (available && online) {
				console.log('available module already set online:', module_id);
			} else if (available && !online) {
				initModuleComms(acc, module_id, decl);
				acc.module_data[module_id].online?.set(true);
			} else if (!available && online) {
				deinitModuleComms(acc.module_data[module_id].decl, acc);
				acc.module_data[module_id].online?.set(false);
			} else if (!available && !online) {
				//console.log('Module not available but also not initialized:', module_id);
			}
		}
	}
}

export function registerModule(id: string, decl: ModuleDeclaration) {
	console.log('register module:', id, decl);
	if (get(modules_disabled).indexOf(id) !== -1) {
		console.log('Module disabled:', id);
		return;
	}
	let ordering = get(modules_display_order);
	if (ordering[id] !== undefined) decl.order = ordering[id];
	decl.id = id;
	let module_decls_v = get(module_decls);
	module_decls_v[id] = decl;
	module_decls.set(module_decls_v);
	const initResult = decl.callbacks?.init?.();
	if (typeof initResult === 'function') {
		decl.deinit = initResult;
	}
}
