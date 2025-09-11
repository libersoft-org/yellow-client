import type { ComponentType, SvelteComponent } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface ISettingsMenuItem {
	img?: string;
	title: string;
	name?: string;
	onClick?: (event: Event) => void | Promise<void>;
}

export interface ISettingsNodeState {
	props?: Record<string, any>;
	instance?: any;
}

export interface ISettingsNode {
	__parent?: WeakRef<ISettingsNode>;
	name: string;
	title: string;
	body?: any; // More flexible to handle Svelte 4/5 component variations
	menu?: ISettingsMenuItem[];
	items?: ISettingsNode[];
	states?: Map<string, ISettingsNodeState>;
}

export interface IBaseSettingsProps extends HTMLAttributes<HTMLDivElement> {
	testId?: string;
	settingsObject: ISettingsNode;
}

// Type for the setSettingsSection function used in context
export type SetSettingsSectionFn = (name: string, props?: Record<string, any>) => Promise<void>;

// Interface for settings components that implement onOpen lifecycle
export interface ISettingsComponent {
	onOpen?(): void | Promise<void>;
}

// Type for BaseSettingsWindow instance methods
export interface IBaseSettingsInstance {
	open(name?: string): void;
	close(): void;
	setSettingsSection(name: string, props?: Record<string, any>): Promise<void>;
}
