<script lang="ts">
	import { formatBalance, type IBalance } from '@/org.libersoft.wallet/scripts/balance.ts';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	interface Props extends HTMLAttributes<HTMLSpanElement> {
		balance?: IBalance | null;
		fallback?: string;
		showCurrency?: boolean;
		prefix?: string;
		suffix?: string;
		roundToDecimals?: number;
		children?: Snippet;
	}
	let { balance, fallback = '?', showCurrency = true, prefix = '', suffix = '', roundToDecimals, children, ...restProps }: Props = $props();
	let formattedBalance = $derived.by(() => {
		if (!balance) return fallback;
		let formatted = formatBalance(balance);
		if (!formatted) return fallback;
		if (roundToDecimals !== undefined) {
			const number = parseFloat(formatted);
			formatted = number.toFixed(roundToDecimals);
		}
		let result = prefix + formatted;
		if (showCurrency && balance.currency) result += ' ' + balance.currency;
		result += suffix;
		return result;
	});
</script>

<span {...restProps}>{formattedBalance}</span>
