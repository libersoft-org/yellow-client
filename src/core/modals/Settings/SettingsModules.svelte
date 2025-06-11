<script lang="ts">
	import { modules_config, updateModuleConfig, resetModulesConfig } from '@/core/modules_config.ts';
	import type { ModuleConfig, ModuleType } from '@/core/types.ts';
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
		if (module) {
			updateModuleConfig(moduleId, { enabled: !module.enabled });
		}
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
		if (confirm('Reset all module configurations to defaults? This cannot be undone.')) {
			resetModulesConfig();
		}
	}
</script>

<style>
	.modules-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.module-item {
		border: 1px solid var(--border-color, #e0e0e0);
		border-radius: 8px;
		padding: 16px;
		background: var(--surface-color, #fff);
	}

	.module-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	.module-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.module-icon {
		width: 24px;
		height: 24px;
		border-radius: 4px;
		background: var(--primary-color, #007acc);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 12px;
		font-weight: bold;
	}

	.module-details {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.module-name {
		font-weight: 600;
		color: var(--text-primary, #333);
	}

	.module-id {
		font-size: 12px;
		color: var(--text-secondary, #666);
		font-family: monospace;
	}

	.module-controls {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.control-row {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.control-label {
		min-width: 80px;
		font-size: 14px;
		color: var(--text-secondary, #666);
	}

	.service-url-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.service-url-display {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.service-url-text {
		flex: 1;
		font-family: monospace;
		font-size: 12px;
		color: var(--text-secondary, #666);
		background: var(--surface-secondary, #f5f5f5);
		padding: 4px 8px;
		border-radius: 4px;
		word-break: break-all;
	}

	.service-url-edit {
		display: flex;
		gap: 8px;
	}

	.actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 24px;
		padding-top: 16px;
		border-top: 1px solid var(--border-color, #e0e0e0);
	}

	.disabled {
		opacity: 0.6;
	}
</style>

<div class="modules-list">
	{#each sortedModules as module (module.id)}
		<div class="module-item" class:disabled={!module.enabled}>
			<div class="module-header">
				<div class="module-info">
					<div class="module-icon">
						{module.name.charAt(0).toUpperCase()}
					</div>
					<div class="module-details">
						<div class="module-name">{module.name}</div>
						<div class="module-id">{module.id}</div>
					</div>
				</div>
				<Switch checked={module.enabled} label="Enabled" showLabel={false} {...{ onchange: () => toggleEnabled(module.id) }} />
			</div>

			{#if module.enabled}
				<div class="module-controls">
					<div class="control-row">
						<span class="control-label">Type:</span>
						<Select bind:value={module.type} onchange={e => changeType(module.id, (e.target as HTMLSelectElement)?.value as ModuleType)}>
							<Option value="builtin" text="Built-in" />
							<Option value="iframe" text="IFrame" />
						</Select>
					</div>

					<div class="service-url-section">
						<div class="control-row">
							<span class="control-label">Service URL:</span>
						</div>

						{#if editingModule === module.id}
							<div class="service-url-edit">
								<Input type="url" placeholder="https://example.com/module-service.js" bind:value={tempServiceUrl} grow={true} />
								<Button text="Save" onClick={() => saveServiceUrl(module.id)} padding="8px" />
								<Button text="Cancel" onClick={cancelEditingServiceUrl} bgColor="var(--secondary-background)" padding="8px" />
							</div>
						{:else}
							<div class="service-url-display">
								<div class="service-url-text">
									{(module as any).serviceUrl || 'Not configured'}
								</div>
								<Button text="Edit" onClick={() => startEditingServiceUrl(module as any)} bgColor="var(--secondary-background)" padding="8px" />
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<div class="actions">
	<div>
		<span style="font-size: 12px; color: var(--secondary-foreground);">
			{Object.values($modules_config.modules).filter(m => m.enabled).length} of {Object.values($modules_config.modules).length} modules enabled
		</span>
	</div>
	<Button text="Reset to Defaults" onClick={handleResetToDefaults} bgColor="var(--secondary-background)" padding="8px" />
</div>
