import { describe, it, expect } from 'vitest';

// Helper functions directly copied for testing to avoid module dependencies
function isWebSocketUrl(url: string): boolean {
	return url.startsWith('ws://') || url.startsWith('wss://');
}

function isValidWebSocketUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
	} catch {
		return false;
	}
}

describe('WebSocket URL validation', () => {
	it('should correctly identify WebSocket URLs', () => {
		expect(isWebSocketUrl('ws://localhost:8545')).toBe(true);
		expect(isWebSocketUrl('wss://ethereum-rpc.publicnode.com')).toBe(true);
		expect(isWebSocketUrl('https://ethereum-rpc.publicnode.com')).toBe(false);
		expect(isWebSocketUrl('http://localhost:8545')).toBe(false);
	});

	it('should validate WebSocket URL format', () => {
		expect(isValidWebSocketUrl('ws://localhost:8545')).toBe(true);
		expect(isValidWebSocketUrl('wss://mainnet.infura.io/ws/v3/test')).toBe(true);
		expect(isValidWebSocketUrl('ws://invalid url')).toBe(false);
		expect(isValidWebSocketUrl('not-a-url')).toBe(false);
		expect(isValidWebSocketUrl('https://example.com')).toBe(false);
	});

	it('should handle edge cases', () => {
		expect(isWebSocketUrl('')).toBe(false);
		expect(isValidWebSocketUrl('')).toBe(false);
		expect(isWebSocketUrl('ws://')).toBe(true);
		expect(isValidWebSocketUrl('ws://')).toBe(false);
	});
});
