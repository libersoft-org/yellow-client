// HMR State Debugging Utility
export function createHMRDebugger(componentName: string) {
	if (!import.meta.hot)
		return {
			trackState: () => {},
			logReload: () => {},
			trackLifecycle: () => {},
		};

	const state = new Map<string, any>();
	let debugId = 0;

	return {
		trackState: (key: string, value: any) => {
			const prevValue = state.get(key);
			state.set(key, value);

			if (prevValue !== undefined && prevValue !== value) {
				console.log(`🔄 HMR [${componentName}] State changed: ${key}`, {
					from: prevValue,
					to: value,
					preserved: false,
				});
			} else if (prevValue === undefined) {
				console.log(`🆕 HMR [${componentName}] New state: ${key}`, value);
			} else {
				console.log(`✅ HMR [${componentName}] State preserved: ${key}`, value);
			}
		},

		logReload: (currentState: Record<string, any>) => {
			debugId++;
			console.group(`🔥 HMR [${componentName}] Reload #${debugId}`);
			console.log('Current state:', currentState);
			console.log('Previous state:', Object.fromEntries(state));

			// Track preserved and lost state
			const stateEntries = Object.entries(currentState);
			const preservedKeys = stateEntries.filter(([key, value]) => state.has(key) && state.get(key) === value).map(([key]) => key);
			const lostKeys = stateEntries.filter(([key, value]) => !state.has(key) || state.get(key) !== value).map(([key]) => key);

			if (preservedKeys.length > 0) {
				console.log('✅ Preserved:', preservedKeys);
			}
			if (lostKeys.length > 0) {
				console.log('❌ Lost/Changed:', lostKeys);
			}

			// Store current state for next comparison
			Object.entries(currentState).forEach(([key, value]) => {
				state.set(key, value);
			});

			console.groupEnd();
		},

		trackLifecycle: (phase: 'mount' | 'destroy' | 'update') => {
			console.log(`🔄 HMR [${componentName}] Lifecycle: ${phase}`);
		},
	};
}

// Check if HMR is working properly
export function checkHMRHealth() {
	if (!import.meta.hot) {
		console.warn('HMR not available');
		return;
	}

	console.log('🔥 HMR Status:', {
		enabled: true,
		timestamp: new Date().toISOString(),
		userAgent: navigator.userAgent,
		protocol: location.protocol,
		websocket: 'WebSocket' in window,
	});
}
