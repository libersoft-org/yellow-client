// Simple utilities for crypto-utils

export function getGuid(): string {
	return 'guid-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
}
