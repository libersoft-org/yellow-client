<script lang="ts">
	interface Props {
		account?: any;
	}
	let { account }: Props = $props();
	const statusMap = {
		'Logged in.': 'status-logged-in',
		'Connecting...': 'status-connecting',
		'Connected, logging in...': 'status-logging-in',
		'Connected.': 'status-connected',
		'Retrying...': 'status-retrying',
		'Login failed.': 'status-login-failed',
		'Disabled.': 'status-disabled',
		'Enabled.': 'status-enabled',
	};
	let status_class = $derived.by(() => {
		if (!account) return 'status-default';
		return statusMap[$account.session_status] ?? statusMap[$account.status] ?? 'status-default';
	});
</script>

<style>
	.status-icon {
		width: 10px;
		min-width: 10px;
		height: 10px;
		border-radius: 50%;
		display: inline-block;
	}

	.status-logged-in {
		background-color: #080;
		border: 1px solid #040;
	}

	.status-login-failed {
		background-color: #f00;
		border: 1px solid #800;
	}

	.status-retrying {
		background-color: #b60;
		border: 1px solid #820;
	}

	.status-connecting {
		background-color: #f90;
		border: 1px solid #600;
	}

	.status-connected {
		background-color: #fd3;
		border: 1px solid #b90;
	}

	.status-logging-in {
		background-color: #dfd;
		border: 1px solid #290;
	}

	.status-enabled {
		background-color: #55f;
		border: 1px solid #00f;
	}

	.status-default {
		background-color: #00f;
		border: 1px solid #008;
	}

	.status-disabled {
		background-color: #888;
		border: 1px solid #444;
	}
</style>

<span class="status-icon {status_class}"></span>
