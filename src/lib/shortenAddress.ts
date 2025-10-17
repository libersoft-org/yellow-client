export function shortenAddress(addr: string) {
	if (!addr) return '';
	if (addr.length <= 8) return addr;
	return addr.slice(0, 5) + '...' + addr.slice(-3);
}
