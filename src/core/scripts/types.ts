import type { Writable } from 'svelte/store';

export interface IAccountCredentials {
	server: string;
	address: string;
	password: string;
	retry_nonce?: number;
}

export interface IAccountSettings {
	[key: string]: any;
}

export interface IAccount {
	id: string;
	socket_id: number;
	settings: IAccountSettings;
	credentials: IAccountCredentials;
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

export type AccountStore = Writable<IAccount>;

export interface IAccountConfig {
	id: string;
	credentials: IAccountCredentials;
	enabled: boolean;
	settings: IAccountSettings;
}

export interface IModuleDeclaration {
	id: string;
	order?: number;
	callbacks: {
		init?: () => (() => void) | void;
		initData?: (acc: IAccount) => any;
		initComms?: (acc: IAccount) => void;
		deinitComms?: (acc: IAccount) => void;
		deinitData?: (acc: IAccount) => void;
		onModuleSelected?: (selected: boolean) => void;
	};
	panels?: {
		sidebar?: any;
		content?: any;
	};
	deinit?: () => void;
}

export type ModuleType = 'builtin' | 'iframe';

export interface IModuleConfig {
	id: string;
	name: string;
	type: ModuleType;
	enabled: boolean;
	serviceUrl?: string;
	order?: number;
}

export interface IModulesConfiguration {
	modules: { [moduleId: string]: IModuleConfig };
}
