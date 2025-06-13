import { localStorageSharedStore } from '@/lib/svelte-shared-store.ts';
import type { ModuleConfig, ModulesConfiguration } from './types.ts';
import { TAURI_MOBILE } from './tauri.ts';
import { invoke } from '@tauri-apps/api/core';

// Default module configurations
const defaultModules: { [moduleId: string]: ModuleConfig } = {
	'org.libersoft.messages': {
		id: 'org.libersoft.messages',
		name: 'Messages',
		type: 'builtin',
		enabled: true,
		order: 1,
		serviceUrl: 'https://example.com/modules/messages/service.js',
	},
	'org.libersoft.contacts': {
		id: 'org.libersoft.contacts',
		name: 'Contacts',
		type: 'builtin',
		enabled: true,
		order: 2,
		serviceUrl: 'https://example.com/modules/contacts/service.js',
	},
	'org.libersoft.dating': {
		id: 'org.libersoft.dating',
		name: 'Dating',
		type: 'builtin',
		enabled: true,
		order: 3,
		serviceUrl: 'https://example.com/modules/dating/service.js',
	},
	'org.libersoft.wallet': {
		id: 'org.libersoft.wallet',
		name: 'Wallet',
		type: 'builtin',
		enabled: true,
		order: 4,
		serviceUrl: 'https://example.com/modules/wallet/service.js',
	},
	'org.libersoft.iframes': {
		id: 'org.libersoft.iframes',
		name: 'IFrames',
		type: 'builtin',
		enabled: true,
		order: 5,
		serviceUrl: 'https://example.com/modules/iframes/service.js',
	},
};

// Create the store with localStorage persistence
export const modules_config = localStorageSharedStore<ModulesConfiguration>('modules_config', {
	modules: defaultModules,
});

// Subscribe to changes and sync to native on mobile
modules_config.subscribe(config => {
	if (TAURI_MOBILE) {
		syncModulesConfigToNative(config);
	}
});

async function syncModulesConfigToNative(config: ModulesConfiguration) {
	try {
		await invoke('plugin:yellow|save_modules_config', {
			configJson: JSON.stringify(config),
		});
		console.log('Synced modules config to native:', config);
	} catch (error) {
		console.error('Failed to sync modules config to native:', error);
	}
}

export function updateModuleConfig(moduleId: string, updates: Partial<ModuleConfig>) {
	modules_config.update(config => {
		if (config.modules[moduleId]) {
			config.modules[moduleId] = { ...config.modules[moduleId], ...updates };
		}
		return config;
	});
}

export function addModuleConfig(module: ModuleConfig) {
	modules_config.update(config => {
		config.modules[module.id] = module;
		return config;
	});
}

export function removeModuleConfig(moduleId: string) {
	modules_config.update(config => {
		delete config.modules[moduleId];
		return config;
	});
}

export function resetModulesConfig() {
	modules_config.set({ modules: defaultModules });
}
