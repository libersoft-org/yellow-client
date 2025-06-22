<script lang="ts">
	import { modules_config, updateModuleConfig, resetModulesConfig } from '@/core/modules_config.ts';
	import type { ModuleConfig, ModuleType } from '@/core/types.ts';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	let editingModule: string | null = $state(null);
	let tempServiceUrl: string = $state('');
	const sortedModules = $derived(Object.values($modules_config.modules).sort((a, b) => (a.order || 0) - (b.order || 0)));

	function toggleEnabled(moduleId: string) {
		const module = $modules_config.modules[moduleId];
		if (module) updateModuleConfig(moduleId, { enabled: !module.enabled });
	}

	function changeType(moduleId: string, type: ModuleType) {
		updateModuleConfig(moduleId, { type });
	}

	function startEditingServiceUrl(module: ModuleConfig) {
		editingModule = module.id;
		tempServiceUrl = module.serviceUrl || '';
	}

	function saveServiceUrl(moduleId: string) {
		updateModuleConfig(moduleId, { serviceUrl: tempServiceUrl.trim() || undefined });
		editingModule = null;
		tempServiceUrl = '';
	}

	function cancelEditingServiceUrl() {
		editingModule = null;
		tempServiceUrl = '';
	}

	function handleResetToDefaults() {
		if (confirm('Reset all module configurations to defaults? This cannot be undone.')) resetModulesConfig();
	}
</script>

<style>
	.modules {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.item {
		border-radius: 10px;
		border: 1px solid var(--primary-background);
		overflow: hidden;
	}

	.item .header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: var(--primary-background);
		color: var(--primary-foreground);
	}

	.item .header .info {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.item .header .info .details {
		display: flex;
		flex-direction: column;
	}

	.item .header .info .details .name {
		font-weight: bold;
	}

	.item .header .info .details .id {
		font-family: 'Ubuntu Mono';
		font-size: 12px;
	}

	.item .body {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
		background-color: var(--primary-softer-background);
		color: var(--primary-foreground);
	}

	.item .body .row {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.item .body .row .label {
		min-width: 100px;
	}

	.body .text {
		box-sizing: border-box;
		width: 100%;
		padding: 10px;
		font-family: 'Ubuntu Mono';
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
		border-radius: 10px;
		word-break: break-all;
	}

	.actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
</style>

<div class="modules">
	<div class="actions">
		<div>{Object.values($modules_config.modules).filter(m => m.enabled).length} of {Object.values($modules_config.modules).length} modules enabled</div>
		<Button img="img/reset.svg" text="Reset to defaults" onClick={handleResetToDefaults} />
	</div>
	{#each sortedModules as module (module.id)}
		<div class="item">
			<div class="header">
				<div class="info">
					<Icon img="img/modules/{module.id}.svg" alt={module.name} size="32px" />
					<div class="details">
						<div class="name">{module.name}</div>
						<div class="id">{module.id}</div>
					</div>
				</div>
				<Switch checked={module.enabled} label="Enabled" showLabel={false} {...{ onchange: () => toggleEnabled(module.id) }} />
			</div>
			{#if module.enabled}
				<div class="body">
					<div class="row">
						<div class="label">Type:</div>
						<Select bind:value={module.type} onchange={e => changeType(module.id, (e.target as HTMLSelectElement)?.value as ModuleType)}>
							<Option value="builtin" text="Built-in" />
							<Option value="iframe" text="IFrame" />
						</Select>
					</div>
					<div class="row">
						<div class="label">Service URL:</div>
					</div>
					{#if editingModule === module.id}
						<Input type="url" placeholder="https://example.com/module-service.js" bind:value={tempServiceUrl} expand />
						<ButtonBar expand>
							<Button img="img/save.svg" text="Save" onClick={() => saveServiceUrl(module.id)} />
							<Button img="img/cancel.svg" text="Cancel" onClick={cancelEditingServiceUrl} />
						</ButtonBar>
					{:else}
						<div class="text">{(module as any).serviceUrl || 'Not configured'}</div>
						<ButtonBar expand>
							<Button img="img/edit.svg" text="Edit" onClick={() => startEditingServiceUrl(module as any)} />
						</ButtonBar>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>
