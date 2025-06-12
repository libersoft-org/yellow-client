import type { Writable } from 'svelte/store';

export interface AccountCredentials {
	server: string;
	address: string;
	password: string;
	retry_nonce?: number;
}

export interface AccountSettings {
	[key: string]: any;
}

export interface Account {
	id: string;
	socket_id: number;
	settings: AccountSettings;
	credentials: AccountCredentials;
	enabled: boolean;
	suspended?: boolean;
	status?: string;
	error?: string | null;
	session_status?: string;
	sessionID?: string;
	wsGuid?: string;
	original_wsGuid?: string;
	lastCommsTs?: number;
	lastTransmissionTs?: number;
	bufferedAmount?: number;
	requests: { [key: string]: any };
	module_data: { [moduleId: string]: any };
	available_modules: { [moduleId: string]: any };
	socket?: WebSocket;
	events?: EventTarget;
	pingTimer?: ReturnType<typeof setInterval>;
	reconnectTimer?: ReturnType<typeof setTimeout>;
	modulesAvailableHandler?: (event: Event) => void;
	sessionErrorHandler?: (event: Event) => void;
}

export type AccountStore = Writable<Account>;

export interface AccountConfig {
	id: string;
	credentials: AccountCredentials;
	enabled: boolean;
	settings: AccountSettings;
}

export interface ModuleDeclaration {
	id: string;
	order?: number;
	callbacks: {
		init?: () => (() => void) | void;
		initData?: (acc: Account) => any;
		initComms?: (acc: Account) => void;
		deinitComms?: (acc: Account) => void;
		onModuleSelected?: (selected: boolean) => void;
	};
	deinit?: () => void;
}

export type ModuleType = 'builtin' | 'iframe';

export interface ModuleConfig {
	id: string;
	name: string;
	type: ModuleType;
	enabled: boolean;
	serviceUrl?: string;
	order?: number;
}

export interface ModulesConfiguration {
	modules: { [moduleId: string]: ModuleConfig };
}
